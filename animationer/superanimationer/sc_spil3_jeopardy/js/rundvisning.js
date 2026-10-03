/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den skaerm, man staar paa: ét element ad gangen med
   en kort tekst. Samme opbygning som i sc2.4.

   Hvert trin er en CSS-selector (kan vaere flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var PODIER = { sel: "#podier", titel: "Holdene", tekst: "Klik på pointene eller navnet for at rette dem. Holdet med det gule lys vælger næste felt." };
    var LYD = { sel: "#lydknap", titel: "Lyden", tekst: "Slår lyden til og fra. Genvej: M." };

    var TURE = {
        "titel": [
            { sel: "#opsaetning", titel: "Holdene", tekst: "Vælg antal hold, og skriv navnene. De kan også rettes undervejs nederst på skærmen." },
            { sel: "#urvalg", titel: "Uret", tekst: "Så mange sekunder har holdene, når du trykker Ur under en ledetråd." },
            { sel: "#start", titel: "Start", tekst: "Brættet fyldes, og kategorierne vises én ad gangen. Et igangværende spil fortsættes med knappen ved siden af." },
            { sel: "#egneknap", titel: "Egne spørgsmål", tekst: "Upload eller skriv jeres egne emner som tekst. Vinduet viser den nuværende quiz som eksempel og kan eksportere den." },
            { sel: "#lydkilde", titel: "Lydene", tekst: "Åbnes spillet fra din egen computer, bruges de originale lyde, hvis de ligger der. Ellers spiller spillet sine egne." },
            { sel: "#regelknap", titel: "Reglerne", tekst: "Reglerne og genvejene til tastaturet." }
        ],
        "braet": [
            { sel: "#braet", titel: "Brættet", tekst: "Klik på et beløb for at åbne ledetråden. Et brugt felt kan åbnes igen med dobbeltklik, fx for at rette point." },
            PODIER,
            { sel: "#finalknap", titel: "Final", tekst: "Går til Final, også før brættet er tomt." },
            LYD
        ],
        "kort": [
            { sel: "#skaerm", titel: "Ledetråden", tekst: "Læs den højt. Holdene svarer med et spørgsmål: Hvad er ...?" },
            { sel: "#knapper", titel: "Knapperne", tekst: "Ur starter nedtællingen. Svar viser det rigtige svar. Brættet lukker feltet. Mellemrum går et trin frem." },
            { sel: "#podier", titel: "Pointene", tekst: "+ giver holdet beløbet, og − trækker det fra. Et klik mere fortryder. Genvej: 1 til 6, med Skift for −." }
        ],
        "plakat": [
            { sel: "#skaerm", titel: "Skærmen", tekst: "Følg knapperne under skærmen, eller tryk Mellemrum for at gå videre." },
            PODIER
        ]
    };

    var trin = [];
    var trinNr = 0;
    var erAktiv = false;

    function synligeElementer(sel) {
        var liste = document.querySelectorAll(sel);
        var ud = [];
        for (var i = 0; i < liste.length; i++) {
            if (liste[i].offsetWidth || liste[i].offsetHeight) ud.push(liste[i]);
        }
        return ud;
    }

    /* Den samlede begraensningskasse for alle elementer, en selector
       matcher - saa ét trin kan fremhaeve flere ting paa én gang. */
    function samletRect(sel) {
        var liste = synligeElementer(sel);
        if (!liste.length) return null;
        var r = liste[0].getBoundingClientRect();
        var top = r.top, left = r.left, right = r.right, bottom = r.bottom;
        for (var i = 1; i < liste.length; i++) {
            var r2 = liste[i].getBoundingClientRect();
            top = Math.min(top, r2.top);
            left = Math.min(left, r2.left);
            right = Math.max(right, r2.right);
            bottom = Math.max(bottom, r2.bottom);
        }
        return { top: top, left: left, right: right, bottom: bottom, width: right - left, height: bottom - top };
    }

    /* Boksen laegges der, hvor der er plads: foerst under maalet, saa
       over det, saa til hoejre, saa til venstre, og til sidst midt paa
       skaermen, hvis intet af det passer. */
    function plasserBoks(rect) {
        var boks = NK.el("rv-boks");
        var margin = 16;
        var vb = window.innerWidth, vh = window.innerHeight;
        var bB = boks.offsetWidth, bH = boks.offsetHeight;
        var top, left;

        if (rect.bottom + margin + bH <= vh) {
            top = rect.bottom + margin;
            left = rect.left + rect.width / 2 - bB / 2;
        } else if (rect.top - margin - bH >= 0) {
            top = rect.top - margin - bH;
            left = rect.left + rect.width / 2 - bB / 2;
        } else if (rect.right + margin + bB <= vb) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.right + margin;
        } else if (rect.left - margin - bB >= 0) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left - margin - bB;
        } else {
            top = (vh - bH) / 2;
            left = (vb - bB) / 2;
        }

        boks.style.left = NK.klamp(left, 10, vb - bB - 10) + "px";
        boks.style.top = NK.klamp(top, 10, vh - bH - 10) + "px";
    }

    function visTrin() {
        var t = trin[trinNr];
        if (!t) { luk(); return; }

        var maal = synligeElementer(t.sel)[0];
        if (maal) maal.scrollIntoView({ behavior: "auto", block: "nearest", inline: "nearest" });

        var rect = samletRect(t.sel);
        if (!rect) { naeste(); return; }

        var pad = 6;
        var spot = NK.el("rv-spot");
        spot.style.top = (rect.top - pad) + "px";
        spot.style.left = (rect.left - pad) + "px";
        spot.style.width = (rect.width + pad * 2) + "px";
        spot.style.height = (rect.height + pad * 2) + "px";

        NK.saetTekst("rv-titel", t.titel);
        NK.saetTekst("rv-tekst", t.tekst);
        NK.saetTekst("rv-tal", (trinNr + 1) + "/" + trin.length);
        NK.el("rv-forrige").style.display = trinNr === 0 ? "none" : "";
        NK.saetTekst("rv-naeste", trinNr === trin.length - 1 ? "Afslut" : "Næste →");

        plasserBoks(rect);
    }

    function start(skaermId) {
        var liste = TURE[skaermId];
        if (!liste || !liste.length) return;
        trin = liste;
        trinNr = 0;
        erAktiv = true;
        NK.el("rundvisning").hidden = false;
        visTrin();
    }

    function luk() {
        erAktiv = false;
        NK.el("rundvisning").hidden = true;
    }

    function naeste() {
        if (trinNr >= trin.length - 1) { luk(); return; }
        trinNr++;
        visTrin();
    }

    function forrige() {
        if (trinNr <= 0) return;
        trinNr--;
        visTrin();
    }

    NK.Rundvisning = {
        start: start,
        luk: luk,
        aktiv: function () { return erAktiv; }
    };

    function init() {
        NK.el("rv-naeste").addEventListener("click", naeste);
        NK.el("rv-forrige").addEventListener("click", forrige);
        NK.el("rv-luk").addEventListener("click", luk);
        NK.el("rv-baggrund").addEventListener("click", luk);
        window.addEventListener("resize", function () { if (erAktiv) visTrin(); });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
}());

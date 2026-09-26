/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2 og sc4.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (hylden, vaegtene, zoomboblen, krukken, plakaten og skiltet)
   har et usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i sim_vaegt.js, sim_atomer.js og sim_afvej.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-vaegt": [
            { sel: "#vaegt-anker-hylde", titel: "Krukkerne", tekst: "Én krukke pr. grundstof. Molarmassen står på etiketten. Klik på en krukke for at skifte stof." },
            { sel: "#vaegt-anker-vaegt", titel: "Vægten", tekst: "Træk en klump fra krukken herop. Hver klump er 1 mol. Klik på en klump for at tage den af." },
            { sel: "#vaegt-anker-zoom", titel: "Atomerne", tekst: "Når der ligger noget på vægten, zoomer boblen ind på atomerne i det." },
            { sel: "#vaegt-anker-plakat", titel: "Plakaten", tekst: "1 mol er altid lige mange atomer, uanset stoffet." },
            { sel: "#vaegt-maaling", titel: "På vægten", tekst: "Stofmængden, massen og antallet af atomer for det, der ligger på vægten." },
            { sel: "#vaegt-kort", titel: "Målene", tekst: "Fire små mål. Knappen giver et hint og derefter svaret." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Stofmængde, masse og antal atomer kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Flest atomer: gæt, hvor der er flest. Afvejning: regn massen og antallet ud for en ordre." }
        ],
        "fane-atomer": [
            { sel: "#atomer-anker-vaegte", titel: "Vægtene", tekst: "En prøve på hver vægt. De viser massen, til du har svaret. Så tæller de atomerne." },
            { sel: "#atomer-valg", titel: "Dit svar", tekst: "Hvor er der flest atomer? Piletasterne virker også." },
            { sel: "#atomer-anker-skilt", titel: "Skiltet", tekst: "Prøverne står her. Hintet giver molarmasserne, og efter svaret står beregningen der." },
            { sel: "#atomer-kort", titel: "Runden", tekst: "Ni par. Knappen giver et hint og derefter svaret. Rekorden huskes." }
        ],
        "fane-afvej": [
            { sel: "#afvej-kort", titel: "Ordren", tekst: "Stofmængden, der skal afvejes. Skriv massen og antallet af atomer. Knappen giver et hint og derefter svaret." },
            { sel: "#afvej-anker-krukke", titel: "Krukken", tekst: "Molarmassen står på etiketten." },
            { sel: "#afvej-anker-plakat", titel: "Plakaten", tekst: "Antallet af atomer i 1 mol." },
            { sel: "#afvej-anker-vaegt", titel: "Vægten", tekst: "Den afvejer, når massen er rigtig, og tæller atomerne, når antallet er rigtigt." },
            { sel: "#afvej-fremskridt", titel: "Ordrerne", tekst: "En ordre, du løser uden at se svaret, får en stjerne. Klik på et niveau for at tage dets næste ordre." }
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

    function start(faneId) {
        var liste = TURE[faneId];
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

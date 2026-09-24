/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den skaerm, man staar paa: ét element ad gangen med
   en kort tekst. Samme opbygning som i sc_spil_jeopardy.

   Hvert trin er en CSS-selector (kan vaere flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var PODIER = { sel: "#podier", titel: "Holdene", tekst: "Det lyse hold har turen. Klik på lampen for at give et andet hold turen. Klik på navnet eller pointene for at rette dem." };
    var LYD = { sel: "#lydknap", titel: "Lyden", tekst: "Slår lyden til og fra. Genvej: M." };
    var FORTRYD = { sel: "#k-fortryd", titel: "Fortryd", tekst: "Træder et skridt tilbage, fx efter et forkert klik på et bogstav. Genvej: Ctrl+Z." };

    var TURE = {
        "titel": [
            { sel: "#quizvalg", titel: "Quizzen", tekst: "Vælg en af de indbyggede quizzer eller en af dine egne." },
            { sel: "#egneknap", titel: "Quizzer som tekst", tekst: "Skriv, upload eller eksportér en quiz som tekst. Vinduet viser tavlerne, mens du skriver, og kan lave et link til kolleger." },
            { sel: "#opsaetning", titel: "Holdene", tekst: "Vælg 2 til 4 hold, og skriv navnene. De kan også rettes undervejs nederst på skærmen." },
            { sel: "#start", titel: "Start", tekst: "Spillet begynder med den første gåde. Et igangværende spil fortsættes med knappen ved siden af." },
            { sel: "#lydkilde", titel: "Lydene", tekst: "Åbnes spillet fra din egen computer, bruges de originale lyde, hvis de ligger der. Ellers spiller spillet sine egne." }
        ],
        "runde": [
            { sel: "#tavle", titel: "Tavlen", tekst: "Hvide felter er bogstaver, der ikke er gættet endnu. Kategorien står under tavlen." },
            { sel: "#knapper", titel: "Turen", tekst: "Holdet drejer hjulet, køber en vokal for 250 kr. eller løser gåden. Mellemrum drejer hjulet." },
            { sel: "#bogstaver", titel: "Bogstaverne", tekst: "Klik på det bogstav, holdet siger, eller tryk på tasten. Brugte bogstaver bliver grå. Y er en vokal." },
            PODIER,
            FORTRYD,
            { sel: "#gaadeknap", titel: "Gåderne", tekst: "Oversigten over alle gåder. Herfra kan du springe til en anden gåde eller til finalen." }
        ],
        "tossup": [
            { sel: "#tavle", titel: "Toss-up", tekst: "Bogstaverne dukker op ét ad gangen. Holdet, der først rækker hånden op, svarer." },
            { sel: "#podier", titel: "Svarer", tekst: "Klik Svarer på holdets podie, eller tryk 1 til 4. Så stopper tavlen, og du dømmer svaret." },
            { sel: "#knapper", titel: "Knapperne", tekst: "Start og pause bogstaverne. Mellemrum gør det samme." }
        ],
        "final": [
            { sel: "#tavle", titel: "Finalen", tekst: "R, S, T, L, N og E vises først. Holdet vælger så 3 konsonanter og 1 vokal." },
            { sel: "#bogstaver", titel: "Holdets bogstaver", tekst: "Klik på de fire bogstaver, holdet vælger. Et klik mere fjerner et bogstav igen." },
            { sel: "#knapper", titel: "Uret", tekst: "Holdet har 10 sekunder til at løse gåden. Kuverten åbnes til sidst." }
        ],
        "plakat": [
            { sel: "#scene", titel: "Skærmen", tekst: "Følg knapperne under skærmen, eller tryk Mellemrum for at gå videre." },
            PODIER
        ],
        "hjul": [
            { sel: "#hjulscene", titel: "Hjulet", tekst: "Hjulet stopper af sig selv. Beløbet gælder for hvert felt med den konsonant, holdet siger." }
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

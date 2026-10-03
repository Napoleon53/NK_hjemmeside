/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-fa": [
            { sel: "#fa-anker-lys", titel: "Lyset", tekst: "Lampen sender hvidt lys gennem kuvetten. Noget af lyset bliver absorberet i kuvetten, og øjet ser resten." },
            { sel: "#fa-anker-graf", titel: "Spektret", tekst: "Absorbansen ved hver bølgelængde. Det farvede areal under kurven er det lys, stoffet absorberer. Hold musen over grafen for at se tallene." },
            { sel: "#fa-anker-cirkel", titel: "Farvecirklen", tekst: "Den farve, vi ser, står over for det lys, der bliver absorberet. Krydset er det absorberede lys." },
            { sel: "#fa-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#fa-opgaver", titel: "Opgaverne", tekst: "Først bygger du farven selv, så kommer fem rigtige stoffer. En opgave, du løser uden at se svaret, får en stjerne." },
            { sel: "#quizknap", titel: "Quizzen", tekst: "Seks spørgsmål om farver, spektre og chromoforer." }
        ],
        "fane-ko": [
            { sel: "#ko-anker-tavle", titel: "Molekylet", tekst: "Den gule skygge viser de konjugerede dobbeltbindinger. På fanen Tomaten kan du klikke på dobbeltbindingerne." },
            { sel: "#ko-anker-graf", titel: "Spektret", tekst: "Fra 150 nm. Til venstre for 400 nm er UV, som øjet ikke kan se. Kun en top i det synlige lys giver farve." },
            { sel: "#ko-anker-glas", titel: "Glasset", tekst: "Farven, regnet af spektret." },
            { sel: "#ko-status", titel: "Linjen forneden", tekst: "Næste skridt, og hvad der skete. Knappen giver ét hint ad gangen og til sidst svaret." },
            { sel: "#ko-opgaver", titel: "Opgaverne", tekst: "Fire opgaver med kæden og fire med lycopen fra tomater." }
        ],
        "fane-ch": [
            { sel: "#ch-anker-tavle", titel: "Molekylet", tekst: "Klik på dobbeltbindingerne i chromoforen. C=O og N=N tæller med. Klik igen for at fjerne en markering." },
            { sel: "#ch-anker-graf", titel: "Spektret og glasset", tekst: "Kommer frem, når du har valgt farven." },
            { sel: "#ch-status", titel: "Linjen forneden", tekst: "Næste skridt, og hvad der gik galt. Knappen giver ét hint ad gangen og til sidst svaret." },
            { sel: "#ch-opgaver", titel: "Opgaverne", tekst: "Otte molekyler fra let til svær: nogle er farveløse, andre er farvestoffer." }
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

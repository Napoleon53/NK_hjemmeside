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
        "fane-dr": [
            { sel: "#dr-skort", titel: "Kortet", tekst: "Her står opgaven og svarene. Vælg et svar, og tryk Indsend svar. Knappen med gul kant giver ét hint ad gangen og til sidst svaret." },
            { sel: "#dr-anker-model", titel: "Molekylet", tekst: "Molekylet er tegnet med to C-atomer og deres grupper som kugler. Tag fat i en kugle med musen, og træk." },
            { sel: "#dr-opgaver", titel: "Opgaverne", tekst: "Fanen har seks opgaver. En opgave, du løser uden at se svaret, får en stjerne. Under listen kan du tage samme opgave forfra." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Fanen Cis eller trans? er et spil med 15 molekyler på tid. Fanen E og Z er ekstra." }
        ],
        "fane-pr": [
            { sel: "#pr-skort", titel: "Kortet", tekst: "Her står det skridt, du er ved, og hvad der gik galt. Knappen med gul kant giver ét hint ad gangen." },
            { sel: "#pr-anker-tavle", titel: "Tavlen", tekst: "Tavlen viser molekylet tegnet som i bogen. Klik på den gruppe, der vinder på hvert C-atom, og tryk Indsend svar." },
            { sel: "#pr-indsend", titel: "Indsend svar", tekst: "Indsend svar sender det, du har valgt. I sidste skridt vælger du E, Z eller Ingen E/Z-isomeri på kortet." },
            { sel: "#pr-zkort", titel: "Atomnumrene", tekst: "Det atom, der sidder på C-atomet, afgør prioriteten. Det højeste atomnummer vinder." },
            { sel: "#pr-opgaver", titel: "Opgaverne", tekst: "Fanen har otte molekyler fra let til svær og fire opgaver, hvor du selv bygger molekylet." }
        ],
        "fane-sp": [
            { sel: "#sp-skort", titel: "Kortet", tekst: "Kortet viser spørgsmålet og svarene. Efter hvert svar står forklaringen på kortet, og spillet venter, til du trykker Næste molekyle." },
            { sel: "#sp-anker-tavle", titel: "Tavlen", tekst: "Tavlen viser et nyt molekyle hver gang. Stregen forneden viser, hvor lang tid du har brugt." },
            { sel: "#sp-valg", titel: "Svaret", tekst: "Vælg et svar på kortet eller med tasterne C, T og I. Tryk så Indsend svar eller Enter." },
            { sel: "#sp-emnekort", titel: "Cis og trans eller E og Z", tekst: "Spillet handler om cis og trans. Her kan du skifte til E og Z, som er ekstra." },
            { sel: "#sp-pointkort", titel: "Point", tekst: "Et rigtigt svar giver 50 point, og et hurtigt svar giver op til 50 point mere i bonus." }
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

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
        "fane-sb": [
            { sel: "#sb-anker-molekyle", titel: "Molekylet", tekst: "Træk i molekylet for at dreje det. Slipper du tæt på spejlbilledets stilling, klikker det på plads. Tryk så Indsend svar." },
            { sel: "#sb-anker-spejl", titel: "Spejlbilledet", tekst: "Spejlbilledet viser molekylet set i et spejl og står stille. Grønne ringe viser de grupper, der passer." },
            { sel: "#sb-valg", titel: "Det kan ikke lade sig gøre", tekst: "Vælg dette svar, hvis molekylet aldrig kan komme til at passe med sit spejlbillede. Tryk så Indsend svar." },
            { sel: "#sb-skort", titel: "Kortet", tekst: "Kortet viser opgaven, det næste skridt og hvad der skete. Knappen med gul kant giver ét hint ad gangen og til sidst svaret." },
            { sel: "#sb-opgaver", titel: "Opgaverne", tekst: "Fanen har seks molekyler. En opgave, du løser uden at se svaret, får en stjerne." }
        ],
        "fane-fi": [
            { sel: "#fi-anker-tavle", titel: "Tavlen", tekst: "Klik på de C-atomer, der har fire forskellige grupper. De får en stjerne." },
            { sel: "#fi-valg", titel: "Knapperne", tekst: "Vis alle H tegner alle atomer. Sæt dine stjerner, eller vælg Intet asymmetrisk C-atom, og tryk Indsend svar." },
            { sel: "#fi-skort", titel: "Kortet", tekst: "Kortet viser opgaven og hvad der gik galt. Knappen med gul kant giver ét hint ad gangen." },
            { sel: "#fi-opgaver", titel: "Opgaverne", tekst: "Fanen har 13 molekyler fra let til svær. Nogle har intet asymmetrisk C-atom, og ét har to." }
        ],
        "fane-rs": [
            { sel: "#rs-anker-molekyle", titel: "Molekylet", tekst: "Klik på den gruppe, der skal have det næste nummer, og tryk Indsend svar. Træk så i molekylet for at dreje det." },
            { sel: "#rs-skort", titel: "Kortet", tekst: "Tre trin: nummer, drej, R eller S. Kortet viser det trin, du er ved, og hvad der gik galt." },
            { sel: "#rs-indsend", titel: "Indsend svar", tekst: "Indsend svar sender det, du har valgt. I sidste trin vælger du R eller S på kortet. Med uret er R, mod uret er S." },
            { sel: "#rs-zkort", titel: "Atomnumrene", tekst: "Det første atom i gruppen afgør prioriteten. Det højeste atomnummer vinder." },
            { sel: "#rs-opgaver", titel: "Opgaverne", tekst: "Under listen kan du tage samme opgave forfra." }
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

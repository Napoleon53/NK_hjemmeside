/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.5 og sc5.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Rundvisningen siger intet om haetten, pinden eller hjulet (brugerens
       oenske: det skal man selv finde ud af) */
    var TURE = {
        "fane-forsoeg": [
            { sel: "#forsoeg-anker-vaegt", titel: "Vægten", tekst: "Træk lighteren op på vægten. Knappen Aflæs vægten under skemaet skriver tallet for dig." },
            { sel: "#forsoeg-anker-glas", titel: "Karret og måleglasset", tekst: "Måleglasset er fyldt med vand og står på hovedet i karret. Træk lighteren ned under det, og hold musen nede på den. Gassen skubber vandet ned." },
            { sel: "#forsoeg-anker-lup", titel: "Luppen", tekst: "Vandet i måleglasset, forstørret. Læs rumfanget ud for bunden af den buede vandoverflade." },
            { sel: "#forsoeg-anker-papir", titel: "Papiret", tekst: "Lighteren er våd, når den kommer op af vandet. Stil den på papiret, før den vejes igen." },
            { sel: "#forsoeg-skema", titel: "Skemaet", tekst: "m(før), V og m(efter) for begge målinger. Aflæs vægten skriver vægtens tal. V læser du selv i luppen. Tallene bruges på fanen Beregningen." },
            { sel: "#forsoeg-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#forsoeg-forfra", titel: "Start forfra", tekst: "En ny lighter og et måleglas fyldt med vand." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Beregningen: fra masse og rumfang til molarmassen og alkanen. Fejlkilder: hvad sker der, når noget går galt?" }
        ],
        "fane-beregning": [
            { sel: "#beregning-anker-tavle", titel: "Tavlen", tekst: "Molvolumenet, opgavens tal og beregningerne. En beregning står der, når den er rigtig." },
            { sel: "#beregning-raekker", titel: "Formlen og tallet", tekst: "Skriv først formlen med symboler, fx m(gas) = m(før) − m(efter), og tryk Enter. Så tallet." },
            { sel: "#beregning-anker-graf", titel: "Alkanerne", tekst: "De fem første alkaner og deres molarmasser. Din egen molarmasse kommer som en stiplet linje." },
            { sel: "#beregning-opsum", titel: "Opsummeringen", tekst: "De to målinger side om side." },
            { sel: "#beregning-opgaver", titel: "Opgaverne", tekst: "Tre opgaver. Den sidste er en ukendt gas. Nye tal giver en anden gas." }
        ],
        "fane-fejl": [
            { sel: "#fejl-anker-a", titel: "Gruppe A", tekst: "Gør det rigtigt: tør lighter, alle bobler i måleglasset, glasset fyldt helt med vand og 20 °C." },
            { sel: "#fejl-anker-b", titel: "Gruppe B", tekst: "Gør én ting anderledes. Den står i opgavekortet." },
            { sel: "#fejl-kort", titel: "Gæt først", tekst: "Bliver B's molarmasse højere, lavere eller den samme? Så laver begge grupper forsøget." },
            { sel: "#fejl-resultat", titel: "Resultaterne", tekst: "Det, de to grupper skriver, og den molarmasse, de regner ud." },
            { sel: "#fejl-opgaver", titel: "Fejlkilderne", tekst: "Seks ting, der kan gå galt. Et rigtigt gæt første gang giver en stjerne." }
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

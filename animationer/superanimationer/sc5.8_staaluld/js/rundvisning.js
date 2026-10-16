/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa den anden fane. Samme kode
   som i sc1.1, sc5.5, sc6.1 og sc5.11; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-forsoeg": [
            { sel: "#forsoeg-anker-vaegt", titel: "Vægten", tekst: "Stålulden ligger på en varmefast plade, og vægten er nulstillet med pladen. Den viser altså kun stålulden." },
            { sel: "#forsoeg-anker-braender", titel: "Bunsenbrænderen", tekst: "Klik på brænderen, så tænder den stålulden. Du kan også trække den hen, så flammen rører stålulden." },
            { sel: "#forsoeg-anker-flaske", titel: "Iltflasken", tekst: "I luft går stålulden ud, før alt jernet har reageret. Klik på flasken, mens den gløder, så mere af jernet når at reagere." },
            { sel: "#forsoeg-anker-zoom", titel: "Luppen", tekst: "Overfladen af en ståltråd. Ilten fra luften sætter sig på jernatomerne. Nitrogen reagerer ikke." },
            { sel: "#forsoeg-status", titel: "Linjen", tekst: "Her står, hvad du skal nu. Når et tal skal aflæses på vægten, skriver du det i feltet her. Knappen giver et hint og derefter svaret." },
            { sel: "#forsoeg-skema", titel: "Skemaet", tekst: "Dine tal for m(før) og m(efter) i begge målinger. De bruges på fanen Beregningen." },
            { sel: "#forsoeg-forfra", titel: "Start forfra", tekst: "En ny klump ståluld på vægten." },
            { sel: ".faneknapper", titel: "Beregningen", tekst: "Regn ud, hvad stålulden højst kan komme til at veje, og sammenlign med det, vægten viste." }
        ],
        "fane-beregning": [
            { sel: "#beregning-anker-opgave", titel: "Opgaven", tekst: "Her står, hvad du skal finde." },
            { sel: "#beregning-anker-tavle", titel: "Skemaet på tavlen", tekst: "Reaktionsskemaet med masse, molarmasse og stofmængde under hvert stof. Tallene, du kender, står der. De tre spørgsmålstegn regner du ud, ét ad gangen." },
            { sel: "#beregning-raekker", titel: "Regnestykket", tekst: "Skriv først formlen, så tallene med enheder over og under brøkstregen, og til sidst resultatet med enhed." },
            { sel: "#beregning-hjaelp", titel: "Linjen og hint", tekst: "Linjen siger, hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#beregning-skift", titel: "Let eller Svær", tekst: "Let regner med FeO. Svær regner med Fe₃O₄, som er det oxid, der mest dannes. Så er forholdet ikke 1 : 1." },
            { sel: "#beregning-anker-soejler", titel: "Søjlerne", tekst: "Stålulden før, det vægten viste bagefter, og det, du regner ud. Den røde del er ilten." },
            { sel: "#beregning-opgaver", titel: "Opgaverne", tekst: "De to målinger fra forsøget. Har du ikke målt selv, bruges et eksempel." }
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

/* =====================================================================
   rundvisning.js - spotlight-rundvisning på hjælpeknappen

   Viser rundt på den fane, man står på: ét element ad gangen med en
   kort tekst. Samme kode som i superanimationerne; kun TURE er ny.

   Hvert trin er en CSS-selector (kan være flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TAVLE = { sel: "#tavle", titel: "Tavlen", tekst: "Opgavens tal med sin enhed. Når svaret er rigtigt, flytter kommaet sig plads for plads hen, hvor det skal stå." };
    var SVAR = { sel: "#svarrad", titel: "Svaret", tekst: "Skriv tallet med komma, og tryk Tjek eller Enter. Skal svaret være en 10-talspotens, skrives eksponenten i det lille, hævede felt; ± skifter fortegnet." };
    var CHIPS = { sel: "#chips", titel: "Forstavelserne", tekst: "Vælg den forstavelse, der passer. Et klik mere fjerner valget igen. Tryk så Tjek." };
    var STIGE = { sel: "#stige", titel: "Stigen", tekst: "Alle tierpotenser fra 10⁻⁹ til 10⁹ med forstavelserne under. Ét trin er én plads for kommaet, så afstanden mellem to enheder er lige så mange pladser, som kommaet skal flyttes. Tierpotenserne kommer frem, når du har fået hjælp." };
    var LINJE = { sel: "#statuslinje", titel: "Statuslinjen", tekst: "Her står, hvad der gik galt, og hvorfor et svar er rigtigt. Knappen til højre giver hintet i tre trin, så svaret, og til sidst en ny opgave." };
    var KORT = { sel: "#opgavekort", titel: "Opgaven", tekst: "Ti opgaver i en runde. Stregerne viser, hvordan det er gået: grøn i første forsøg, gul med hjælp, rød når svaret blev vist." };
    var VAELG_POTENS = { sel: "#vaelgere", titel: "Tre slags opgaver", tekst: "Fra potens til tal, fra tal til potens, eller begge veje. Et skift starter en ny runde." };
    var VAELG_FORST = { sel: "#vaelgere", titel: "To slags opgaver", tekst: "Vælg forstavelsen til et måletal, eller skriv, hvilken tierpotens en forstavelse er. Et skift starter en ny runde." };
    var NIVEAU = { sel: "#niveauer, #niveaunote", titel: "Fire niveauer", tekst: "Længde og liter, masse og tid, arealer i m² og rumfang i m³. Arealerne og rumfangene er sværest: der flytter kommaet sig to eller tre pladser pr. trin. Et skift starter en ny runde." };
    var RUNDE = { sel: "#rundekort", titel: "Runden", tekst: "De løste opgaver med facit, så du kan se dem igen bagefter." };
    var FANER = { sel: ".faneknapper", titel: "De andre faner", tekst: "Forstavelser, Omregning og Blandet, hvor alle slags opgaver er med." };

    var TURE = {
        "potens": [TAVLE, SVAR, STIGE, LINJE, KORT, VAELG_POTENS, RUNDE, FANER],
        "forstavelse": [TAVLE, CHIPS, STIGE, LINJE, KORT, VAELG_FORST, RUNDE],
        "omregn": [TAVLE, SVAR, STIGE, LINJE, KORT, NIVEAU, RUNDE],
        "blandet": [TAVLE, SVAR, STIGE, LINJE, KORT, RUNDE]
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

    function start(niveauId) {
        var liste = TURE[niveauId];
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

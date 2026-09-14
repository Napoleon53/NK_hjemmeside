/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   I stedet for én lang tekstvaeg om alle faner paa én gang, viser
   rundvisningen kun rundt paa den fane, man rent faktisk staar paa -
   ét element ad gangen, med en kort billedtekst. Kun paa fane 1 slutter
   den af med at pege paa de tre andre faner, uden at gaa i dybden med
   dem: det er dér, man lander foerst, og dér, det giver mening at vide,
   der er mere at udforske.

   Hvert trin er en CSS-selector (kan vaere flere, kommasepareret - de
   fremhaeves samlet, se saltfanens to grundstofvaelgere) plus en titel
   og en kort tekst. Placeringen af baade spotlight og tekstboks regnes
   ud fra elementets maalte position, ligesom scenens egne overlays
   (kernekort, saltvalg) - ikke med faste koordinater.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-byg": [
            { sel: "#fane-byg .pertabel-boks", titel: "Det periodiske system", tekst: "Viser, hvor dit atom hører hjemme. Tryk på et felt for at springe direkte til det grundstof." },
            { sel: "#byg-panel-partikler", titel: "Tilføj elementarpartikler", tekst: "Læg protoner, neutroner og elektroner i én ad gangen, og se hvad hvert tal styrer." },
            { sel: "#opgave-boks", titel: "Opgaven", tekst: "Få en opgave, du selv skal bygge — fx et bestemt grundstof eller en ion." },
            { sel: "#byg-nuklid", titel: "Mærkatet", tekst: "Massetal, atomnummer, symbol og ladning — skrevet på samme måde som i kemibogen." },
            { sel: "#byg-nulstil", titel: "Genstart", tekst: "Nulstil til det simpleste atom: én proton og én elektron." },
            { sel: ".faneknapper", titel: "De øvrige faner", tekst: "Isotoper, salte og et afsluttende quizspil bygger videre på det samme." }
        ],
        "fane-isotop": [
            { sel: "#iso-panel-grundstof", titel: "Vælg grundstof", tekst: "Vælg et grundstof, der har mere end én isotop i naturen." },
            { sel: "#iso-panel-blanding", titel: "Blandingen", tekst: "Skru på andelene, og se den gennemsnitlige atommasse følge med — eller genskab de rigtige naturlige andele." },
            { sel: "#iso-panel-beregning", titel: "Beregningen", tekst: "Se hele regnestykket bag den vejede gennemsnitsmasse." }
        ],
        "fane-salt": [
            { sel: ".saltvalg-metal, .saltvalg-ikkemetal", titel: "Vælg to grundstoffer", tekst: "Vælg frit et metal og et ikke-metal. Modellen tæller selv ud, hvor mange atomer der skal til." },
            { sel: "#salt-laes-mere", titel: "Læs mere", tekst: "Se begrundelsen og reaktionsskemaet for netop dette salt." },
            { sel: "#salt-panel-formel", titel: "Formel og navn", tekst: "Følg saltets formel og navn, mens du prøver forskellige kombinationer." },
            { sel: "#salt-knap", titel: "Kør forsøget", tekst: "Overfør elektronerne, og saml dem bagefter til et iongitter." }
        ],
        "fane-spil": [
            { sel: "#spil-panel-baner", titel: "Baner", tekst: "Tre baner med fem spørgsmål hver. Du kan frit hoppe mellem dem." },
            { sel: "#spil-boks", titel: "Spørgsmålet", tekst: "Svar, og få begrundelsen med — også når du rammer rigtigt." },
            { sel: "#spil-pertabel-knap", titel: "Periodisk system", tekst: "Slå op, hvis du er i tvivl om et atomnummer." }
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

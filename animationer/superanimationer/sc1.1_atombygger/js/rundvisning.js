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
            { sel: "#byg-panel-partikler", titel: "Tilføj elementarpartikler", tekst: "Læg protoner, neutroner og elektroner i én ad gangen, og se, hvad antallet af hver slags partikel styrer." },
            { sel: "#fane-byg .pertabel-boks", titel: "Det periodiske system", tekst: "Det periodiske system viser, hvor dit atom hører hjemme. Tryk på et grundstof for at bygge et neutralt atom af det." },
            { sel: "#byg-skort", titel: "Opgavekortet", tekst: "Kortet øverst giver én opgave ad gangen. Byg atomet fra opgaven med knapperne i panelet, og tryk Indsend svar. Knappen Giv et hint viser først atomsymbolet og derefter svaret." },
            { sel: "#opgave-boks", titel: "Opgaverne", tekst: "Her står, hvor mange opgaver du har løst selv. Start forfra begynder runden forfra." },
            { sel: "#byg-nuklid", titel: "Mærkatet", tekst: "Mærkatet viser nukleontal, atomnummer, symbol og ladning for det atom eller den ion, du har bygget." },
            { sel: "#byg-nulstil", titel: "Genstart", tekst: "Genstart fjerner alle partikler, så du kan bygge et nyt atom fra bunden." },
            { sel: ".faneknapper", titel: "De øvrige faner", tekst: "Fanerne Isotoper, Ioner og Spil bygger videre på atommodellen fra denne fane." }
        ],
        "fane-isotop": [
            { sel: "#iso-panel-grundstof", titel: "Vælg grundstof", tekst: "Vælg et grundstof, der har mere end én isotop i naturen." },
            { sel: "#iso-panel-blanding", titel: "Blandingen", tekst: "Skru på isotopernes andele, og se den gennemsnitlige atommasse følge med. Vis naturlig forekomst sætter andelene tilbage til dem fra naturen." },
            { sel: "#iso-panel-beregning", titel: "Beregningen", tekst: "Se hele beregningen af den gennemsnitlige atommasse." }
        ],
        "fane-salt": [
            { sel: ".saltvalg-metal, .saltvalg-ikkemetal", titel: "Vælg to grundstoffer", tekst: "Vælg frit et metal og et ikke-metal. Animationen finder selv ud af, hvor mange atomer af hvert grundstof der skal til for at danne saltet." },
            { sel: "#salt-laes-mere", titel: "Læs mere", tekst: "Læs, hvorfor saltet får netop sin formel, og se reaktionsskemaet." },
            { sel: "#salt-panel-formel", titel: "Formel og navn", tekst: "Følg saltets formel og navn, mens du prøver forskellige kombinationer." },
            { sel: "#salt-knap", titel: "Kør forsøget", tekst: "Overfør elektronerne, og saml bagefter ionerne til et iongitter." }
        ],
        "fane-spil": [
            { sel: "#spil-panel-baner", titel: "Baner", tekst: "Spillet har tre baner med fem spørgsmål i hver, og du kan frit skifte mellem banerne." },
            { sel: "#spil-skort", titel: "Spørgsmålet", tekst: "Vælg et svar på kortet, og tryk Indsend svar. Under svarene står en begrundelse for det rigtige svar, også når du har svaret rigtigt." },
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

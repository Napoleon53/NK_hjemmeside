/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb1.1; kun TURE er ny.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-kryds": [
            { sel: "#kryds-laerred", titel: "Forsøget", tekst: "Træk måleglasset med syre hen over bægerglasset. Uret starter, når syren rammer." },
            { sel: "#kryds-maaling", titel: "Uret", tekst: "Kig på krydset oppefra, og tryk Stop, når du ikke kan se det. Målingerne samles her." },
            { sel: "#kryds-blanding", titel: "Blandingen", tekst: "Vælg, hvor meget Na₂S₂O₃ der er i glasset, og sammenlign kurverne for svovlet." },
            { sel: "#kryds-opgavekort", titel: "Opgaven", tekst: "Start en opgave. Knappen giver et hint og derefter svaret." },
            { sel: "#teoriknap", titel: "Teorien", tekst: "Reaktionen, og hvorfor 1/Δt er et mål for hastigheden." },
            { sel: ".faneknapper", titel: "Næste fane", tekst: "Koncentration: find ud af, hvad hastigheden afhænger af." }
        ],
        "fane-konc": [
            { sel: "#konc-forsoeg", titel: "Blandingen", tekst: "Vælg rumfangene, og tryk Bland og mål. Uret stopper selv." },
            { sel: "#konc-tabel", titel: "Tabellen", tekst: "Regn [S₂O₃²⁻] og [H₃O⁺] i glasset ud, og skriv dem ind. Efter to rigtige i en kolonne regnes resten for dig." },
            { sel: "#konc-laerred", titel: "Grafen", tekst: "Et punkt for hvert tal, du har regnet ud. 1/Δt er et mål for hastigheden." },
            { sel: "#konc-akse", titel: "Vandret akse", tekst: "Skift mellem [S₂O₃²⁻] og [H₃O⁺]." },
            { sel: "#konc-opgavekort", titel: "Opgaven", tekst: "Gæt først, og prøv det så med et forsøg." }
        ],
        "fane-temp": [
            { sel: "#temp-forsoeg", titel: "Temperaturen", tekst: "Samme blanding hver gang. Vælg temperaturen, og mål." },
            { sel: "#temp-laerred", titel: "Grafen", tekst: "1/Δt mod temperaturen. Hvor meget større bliver den for hver 10 °C?" },
            { sel: "#temp-tabel", titel: "Tabellen", tekst: "Alle forsøg samles her." },
            { sel: "#temp-opgavekort", titel: "Opgaven", tekst: "Tjek tommelfingerreglen om en fordobling pr. 10 °C." }
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

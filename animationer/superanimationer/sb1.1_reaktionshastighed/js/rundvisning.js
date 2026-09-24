/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.1 og sc2.3; kun TURE er ny.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-kurve": [
            { sel: "#kurve-laerred", titel: "Grafen", tekst: "Kurverne for [Br₂] og [BrO₃⁻] tegnes, mens reaktionen løber. Træk i grafen for at flytte tiden." },
            { sel: "#kurve-reaktion", titel: "Reaktionen", tekst: "Afspil reaktionen, og se glasset blive gult af Br₂." },
            { sel: "#kurve-vaerktoej", titel: "Værktøjet", tekst: "Aflæs et tidspunkt, læg en sekant mellem to tidspunkter, eller drej linealen til en tangent." },
            { sel: "#kurve-opgavekort", titel: "Opgaven", tekst: "Start en opgave. Knappen giver et hint og derefter svaret." },
            { sel: "#teoriknap", titel: "Teorien", tekst: "Definitionen af reaktionshastighed og formlerne." },
            { sel: ".faneknapper", titel: "Næste fane", tekst: "Sammenstød viser, hvorfor kurven flader ud." }
        ],
        "fane-sammenstoed": [
            { sel: "#sam-laerred", titel: "Kassen", tekst: "Partiklerne reagerer kun, når de støder sammen. Et sammenstød blinker. Kurven til højre tæller produktet." },
            { sel: "#sam-opstilling", titel: "Opstillingen", tekst: "Skru på antallet af A og B, eller skift til magnesium i syre. Den forrige kurve bliver stående til sammenligning." },
            { sel: "#sam-maaling", titel: "Målingen", tekst: "Sammenstød pr. sekund, talt over de sidste tre sekunder." },
            { sel: "#sam-opgavekort", titel: "Opgaven", tekst: "Gæt først, og prøv det så i kassen." }
        ],
        "fane-udtryk": [
            { sel: "#udtryk-forsoeg", titel: "Forsøget", tekst: "Vælg startkoncentrationerne, og mål starthastigheden." },
            { sel: "#udtryk-laerred", titel: "Kurverne", tekst: "Hvert forsøg giver en kurve. Den stiplede tangent i t = 0 er starthastigheden." },
            { sel: "#udtryk-tabel", titel: "Tabellen", tekst: "Alle forsøg samles her. Sammenlign to, hvor kun ét stof er ændret." },
            { sel: "#udtryk-udtryk", titel: "Hastighedsudtrykket", tekst: "Klik på firkanterne for at vælge 0, 1 eller 2, og tryk Tjek." },
            { sel: "#udtryk-opgavekort", titel: "Hjælp", tekst: "Knappen giver et hint og derefter svaret." }
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

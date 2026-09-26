/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Samme rundvisning som i sc6.8: ét element ad gangen med en kort
   tekst. Kun de trin, der hoerer til den aktive fane, kommer med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TUR = [
        { sel: ".faneknapper", titel: "To faner", tekst: "Byg dine egne molekyler, eller drej rigtige molekyler i 3D." },

        { sel: "#fane-byg.aktiv .scene", titel: "Molekylet", tekst: "Træk for at dreje. Klik på et atom for at vælge det, og klik på en binding for at skifte mellem enkelt-, dobbelt- og tripelbinding." },
        { sel: "#byg-atomer", titel: "Atomer", tekst: "Det nye atom sættes på det valgte atom. Hydrogen og frie elektronpar kommer selv på." },
        { sel: "#byg-bindinger", titel: "Bindinger", tekst: "Her kan bindingerne også skiftes. En binding kan kun blive dobbelt eller tripel, hvis begge atomer har plads til det." },
        { sel: "#byg-molekyle", titel: "Det har du bygget", tekst: "Navnet står her, når du har bygget et kendt molekyle. Formen gælder for det valgte atom." },

        { sel: "#fane-molekyler.aktiv .scene", titel: "Molekylet", tekst: "Træk for at dreje molekylet. Prikformlen i hjørnet er det samme molekyle." },
        { sel: "#mol-menu", titel: "Vælg molekyle", tekst: "Elleve molekyler med de fem former." },

        { sel: ".fane.aktiv .vinkelknap", titel: "Vinkelmåler", tekst: "Slå vinkelmåleren til, og klik på to atomer, der sidder på samme atom." },
        { sel: ".fane.aktiv .opgavekort", titel: "Opgave", tekst: "Én knap: start en opgave, få et hint, se svaret eller tag en ny." },
        { sel: "#teoriknap", titel: "Teori", tekst: "Korte afsnit om elektronparfrastødning og de fem former. De er ikke nødvendige for at bruge animationen." }
    ];

    var trin = [];
    var trinNr = 0;
    var erAktiv = false;

    function synligt(sel) {
        var e = document.querySelector(sel);
        return !!(e && (e.offsetWidth || e.offsetHeight));
    }

    function placerBoks(rect) {
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
        } else if (rect.left - margin - bB >= 0) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left - margin - bB;
        } else if (rect.right + margin + bB <= vb) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.right + margin;
        } else {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left + rect.width / 2 - bB / 2;
        }

        boks.style.left = NK.klamp(left, 10, vb - bB - 10) + "px";
        boks.style.top = NK.klamp(top, 10, vh - bH - 10) + "px";
    }

    function visTrin() {
        var t = trin[trinNr];
        if (!t) { luk(); return; }
        var e = document.querySelector(t.sel);
        if (!e) { luk(); return; }
        var rect = e.getBoundingClientRect();

        var pad = 6;
        var spot = NK.el("rv-spot");
        spot.style.top = (rect.top - pad) + "px";
        spot.style.left = (rect.left - pad) + "px";
        spot.style.width = (rect.width + pad * 2) + "px";
        spot.style.height = (rect.height + pad * 2) + "px";

        NK.saetTekst("rv-titel", t.titel);
        NK.saetTekst("rv-tekst", t.tekst);
        NK.saetTekst("rv-tal", (trinNr + 1) + "/" + trin.length);
        NK.el("rv-forrige").style.visibility = trinNr === 0 ? "hidden" : "";
        NK.saetTekst("rv-naeste", trinNr === trin.length - 1 ? "Afslut" : "Næste →");

        placerBoks(rect);
    }

    function start() {
        trin = TUR.filter(function (t) { return synligt(t.sel); });
        if (!trin.length) return;
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
        TUR: TUR,
        start: start,
        luk: luk,
        naeste: naeste,
        forrige: forrige,
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

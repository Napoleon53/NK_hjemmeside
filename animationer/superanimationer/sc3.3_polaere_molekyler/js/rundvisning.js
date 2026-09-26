/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Samme rundvisning som i sc6.8: ét element ad gangen med en kort
   tekst. Kun de trin, der hoerer til den aktive fane, kommer med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TUR = [
        { sel: ".faneknapper", titel: "Tre faner", tekst: "Fra én binding til hele molekyler og et forsøg, der viser forskellen." },

        { sel: "#fane-en.aktiv .scene", titel: "Tovtrækningen", tekst: "Elektronparret ligger tættest på det atom, der trækker hårdest. Klik på et atom for at flytte den gule ring." },
        { sel: "#en-tabel", titel: "Elektronegativitet", tekst: "Tallet i hvert felt er atomets elektronegativitet. Et klik sætter atomet ind i stedet for det med den gule ring." },
        { sel: "#en-binding", titel: "Bindingen", tekst: "Forskellen i elektronegativitet afgør, om bindingen er upolær, polær eller en ionbinding." },

        { sel: "#fane-polaritet.aktiv .scene", titel: "Trækket i bindingerne", tekst: "Pilene peger mod det atom, der trækker hårdest i elektronerne. Træk for at dreje molekylet." },
        { sel: "#pol-en", titel: "Elektronegativitet", tekst: "En binding er polær, når forskellen er mindst 0,5." },

        { sel: "#fane-vand.aktiv .scene", titel: "Laboratoriebordet", tekst: "Klik på en hane for at åbne eller lukke den. Tag fat i en stav, og gnid den på uldkluden." },
        { sel: "#vand-forloeb", titel: "Resultater", tekst: "Et felt bliver udfyldt, når du har holdt en ladet stav ved strålen. Linjen over skemaet siger, hvad du skal nu." },
        { sel: "#vand-serie", titel: "Tegneserie", tekst: "Når skemaet er udfyldt, kan du se forsøget som en tegneserie." },

        { sel: ".fane.aktiv .opgavekort", titel: "Opgave", tekst: "Én knap: start en opgave, få et hint, se svaret eller tag en ny." },
        { sel: "#teoriknap", titel: "Teori", tekst: "Korte afsnit om elektronegativitet, polære molekyler og forsøget. De er ikke nødvendige for at bruge animationen." }
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

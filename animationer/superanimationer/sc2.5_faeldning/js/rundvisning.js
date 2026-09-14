/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Samme rundvisning som i sc1.3: ét element ad gangen med en kort
   tekst. Hvert trin er en CSS-selector plus titel og tekst; findes
   elementet ikke lige nu, springes trinnet over.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TUR = [
        { sel: "#scene", titel: "Dryp", tekst: "Klik på en dråbeflaske og derefter på et felt. Hvert felt skal have én dråbe af opløsningen over søjlen og én af opløsningen ud for rækken." },
        { sel: "#skema-kort", titel: "Skemaet", tekst: "Viser, hvad der er sket i hvert felt. Klik på et felt for at se det i luppen." },
        { sel: "#scene", titel: "Luppen", tekst: "Træk luppen hen over en dråbe. Cirklen viser ionerne i dråben." },
        { sel: "#opgave-kort", titel: "Reaktionsskema", tekst: "Vælg de to ioner, der danner bundfaldet, og sæt koefficienterne. Et forkert svar giver et hint." },
        { sel: "#sidevalg", titel: "Frit forsøg", tekst: "Skift mellem skemaet og et frit forsøg, hvor Na₂S og Fe(NO₃)₃ også kan bruges." },
        { sel: "#frit-kort", titel: "Tungtopløselige salte", tekst: "Markér alle de tungtopløselige salte, og tjek svaret." },
        { sel: "#teoriknap", titel: "Teori", tekst: "Kort om fældning og tilskuerioner." }
    ];

    var trinNr = 0;
    var erAktiv = false;

    function samletRect(sel) {
        var el = document.querySelector(sel);
        if (!el || !(el.offsetWidth || el.offsetHeight)) return null;
        return el.getBoundingClientRect();
    }

    /* Boksen laegges der, hvor der er plads: under, over, til hoejre,
       til venstre, eller midt i elementet, hvis det fylder det meste
       af skaermen. */
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
        } else if (rect.right + margin + bB <= vb) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.right + margin;
        } else if (rect.left - margin - bB >= 0) {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left - margin - bB;
        } else {
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left + rect.width / 2 - bB / 2;
        }

        boks.style.left = NK.klamp(left, 10, vb - bB - 10) + "px";
        boks.style.top = NK.klamp(top, 10, vh - bH - 10) + "px";
    }

    function visTrin() {
        var t = TUR[trinNr];
        if (!t) { luk(); return; }
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
        NK.saetTekst("rv-tal", (trinNr + 1) + "/" + TUR.length);
        NK.el("rv-forrige").style.display = trinNr === 0 ? "none" : "";
        NK.saetTekst("rv-naeste", trinNr === TUR.length - 1 ? "Afslut" : "Næste →");

        placerBoks(rect);
    }

    function start() {
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
        if (trinNr >= TUR.length - 1) { luk(); return; }
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

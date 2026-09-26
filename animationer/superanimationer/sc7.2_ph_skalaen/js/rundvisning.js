/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc4.1, sc4.2 og sc4.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_skala.js, sim_lup.js og sim_fortynd.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-skala": [
            { sel: "#skala-anker-skala", titel: "pH-skalaen", tekst: "Fra 0 til 14. Under 7 er surt, 7 er neutralt, og over 7 er basisk. Farverne er universalindikatorens." },
            { sel: "#skala-anker-stoffer", titel: "Stofferne", tekst: "Træk et stof op på skalaen, der hvor du tror, det hører til." },
            { sel: "#skala-anker-meter", titel: "pH-metret", tekst: "Det måler stoffet, når du slipper det. Så flyver stoffet hen til sin rigtige plads." },
            { sel: "#skala-anker-baner", titel: "De målte stoffer", tekst: "Den gule trekant under skalaen er dit gæt. Klik på et stof for at se det igen." },
            { sel: "#skala-kort", titel: "Hylden", tekst: "To hylder med seks stoffer. Knappen giver et hint og derefter svaret." },
            { sel: "#teoriknap", titel: "Teori", tekst: "pH-skalaen kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Luppen: tæl ionerne ved hver pH. Fortyndingen: se, hvad vand gør ved pH." }
        ],
        "fane-lup": [
            { sel: "#lup-anker-skala", titel: "pH-mærket", tekst: "Træk mærket, eller klik på skalaen. Pilene på tastaturet virker også." },
            { sel: "#lup-anker-glas", titel: "Glasset", tekst: "Vand med universalindikator. Farven følger pH." },
            { sel: "#lup-anker-lup", titel: "Luppen", tekst: "Et lille rum af væsken. 1 prik er 1 ion: røde er H₃O⁺, blå er OH⁻." },
            { sel: "#lup-anker-zoom", titel: "Zoom", tekst: "Hvert klik gør rummet 10 gange større eller mindre. Tallene viser, hvor mange ioner der er." },
            { sel: "#lup-maaling", titel: "I luppen", tekst: "Antallet af ioner og koncentrationerne ved den pH, du har valgt." },
            { sel: "#lup-kort", titel: "Målene", tekst: "Fem mål. Knappen giver et hint og derefter svaret." }
        ],
        "fane-fortynd": [
            { sel: "#fortynd-anker-knapper", titel: "Fortynd 10 gange", tekst: "Hvert tryk laver et nyt glas: 1 mL fra glasset før og 9 mL vand." },
            { sel: "#fortynd-anker-flasker", titel: "Glassene", tekst: "Saltsyren og natronluden står ved pH 1 og 13. Hvert nyt glas står under sin pH. Klik på et glas for at se det i luppen." },
            { sel: "#fortynd-anker-skala", titel: "Skalaen", tekst: "Stregerne viser, hvor på skalaen glassene hører til." },
            { sel: "#fortynd-anker-lup", titel: "Luppen", tekst: "Ionerne i det glas, du har klikket på. Zoom med + og −." },
            { sel: "#fortynd-glas", titel: "Glasset", tekst: "pH, og hvor mange ioner der er i luppen." },
            { sel: "#fortynd-kort", titel: "Målene", tekst: "Fem mål. Knappen giver et hint og derefter svaret." }
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

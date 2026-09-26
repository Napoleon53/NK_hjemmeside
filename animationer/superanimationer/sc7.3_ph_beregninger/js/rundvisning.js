/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc4.1, sc4.2, sc4.4 og sc7.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_regn.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-ph": [
            { sel: "#ph-anker-vej", titel: "Regnevejen", tekst: "Her står det, du kender, og det, du skal finde (med ?). Når du har valgt den rigtige formel, kommer den på en pil." },
            { sel: "#ph-anker-etiket", titel: "Kortet", tekst: "Kortet viser det, du ved. Dine rigtige svar bliver skrevet her." },
            { sel: "#ph-anker-meter", titel: "pH-metret", tekst: "Det måler glasset, når du har regnet pH ud. Tallet passer med dit svar." },
            { sel: "#ph-kort", titel: "Opgaven", tekst: "Opgaven er delt i små trin: vælg formlen, tast på lommeregneren, skriv svaret. Knappen nederst hjælper med det trin, du er ved." },
            { sel: "#regner", titel: "Lommeregneren", tekst: "Øverst står det, du taster. Linjen under viser, hvordan den har læst det. Tastaturet virker også: L er log, Enter er =." },
            { sel: "#r-maple", titel: "Maple", tekst: "Viser det samme som Maple-kode. Hint og svar får også Maple-linjen med." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Formlerne og afrundingen kort." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Find koncentrationen: fra pH til [H₃O⁺] og [OH⁻]. Stærke syrer og baser: fra flasken til pH." }
        ],
        "fane-konc": [
            { sel: "#konc-anker-meter", titel: "pH-metret", tekst: "Det har målt glasset. Koncentrationerne skal du selv regne ud." },
            { sel: "#konc-anker-vej", titel: "Regnevejen", tekst: "Fra pH til [H₃O⁺] og videre til [OH⁻]. Pilene kommer, efterhånden som du vælger formlerne." },
            { sel: "#konc-anker-etiket", titel: "Kortet", tekst: "Koncentrationerne bliver skrevet på kortet, når de er rigtige." },
            { sel: "#konc-kort", titel: "Opgaven", tekst: "Små trin: vælg formlen, tast på lommeregneren, skriv svaret. Tallet foran · 10 skrives i det store felt, eksponenten i det lille." },
            { sel: "#regner", titel: "Lommeregneren", tekst: "10ˣ-tasten skriver 10^( . Husk at lukke parentesen, før du ganger videre." }
        ],
        "fane-staerk": [
            { sel: "#staerk-anker-glas", titel: "Flasken", tekst: "Koncentrationen står på flasken. Syren eller basen er stærk, så den reagerer fuldstændigt." },
            { sel: "#staerk-anker-vej", titel: "Regnevejen", tekst: "Fra flasken til pH. Hvert trin er en pil, og den kommer, når du har valgt formlen." },
            { sel: "#staerk-kort", titel: "Trinene", tekst: "Hvert trin er delt i små bider. Det næste trin kommer, når svaret er rigtigt." },
            { sel: "#staerk-anker-meter", titel: "pH-metret", tekst: "Det måler flasken, når du har regnet pH ud." },
            { sel: "#regner", titel: "Lommeregneren", tekst: "Ans er det sidste resultat. Så behøver du ikke taste det igen." }
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

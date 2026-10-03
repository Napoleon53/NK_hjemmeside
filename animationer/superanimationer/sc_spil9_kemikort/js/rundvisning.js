/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme opbygning som i sc1.1 og sc_spil6_iontetris.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SAET = { sel: ".saetvalg", titel: "Sættet", tekst: "Vælg, hvilke kort du vil øve. Mine sæt åbner dine egne kort, hvor du også kan hente et sæt ind eller gemme det som fil." };

    var TURE = {
        traen: [
            { sel: "#tr-kort", titel: "Kortet", tekst: "Sig svaret til dig selv, og vend så kortet. Et klik eller mellemrumstasten vender det." },
            { sel: "#tr-svar", titel: "Dine to svar", tekst: "Du bestemmer selv. Kunne det tager kortet ud af bunken. Ikke endnu lægger det tilbage, så det kommer igen om lidt." },
            { sel: "#tr-fremdrift", titel: "Bunken", tekst: "Runden er slut, når alle kort er ude af bunken. Kort, du misser, bliver ved med at komme igen." },
            { sel: "#tr-retning", titel: "Retningen", tekst: "Øv begge veje. Det er sværere at komme fra navnet til formlen end omvendt." },
            { sel: "#tr-svaere", titel: "Dem, der driller", tekst: "Her samler de kort sig, du har misset, med antallet af gange." },
            SAET
        ],
        vendespil: [
            { sel: "#ve-gitter", titel: "Brikkerne", tekst: "Hvert kort ligger som to brikker: forsiden og bagsiden. Vend to, der hører sammen." },
            { sel: "#ve-stoerrelse", titel: "Hvor mange par", tekst: "Flere par er sværere at huske. Brikkerne bliver også mindre." },
            { sel: "#ve-tal", titel: "Tiden", tekst: "Uret starter ved den første brik. Rekorden er den hurtigste tid med netop dette antal par." },
            SAET
        ],
        parring: [
            { sel: "#pa-venstre", titel: "Forsiderne", tekst: "Til venstre står det, svaret skal findes til. Pladsen ved siden af er tom, til du har ramt rigtigt." },
            { sel: "#pa-hoejre", titel: "Svarene", tekst: "Træk et svar over på den forside, det hører til. Du kan også klikke på svaret og derefter på forsiden." },
            { sel: "#pa-stoerrelse", titel: "Runderne", tekst: "Sættet deles i runder. Her vælger du, hvor mange par der er i hver runde." },
            { sel: "#pa-tal", titel: "Tiden", tekst: "Uret løber gennem hele sættet, og fejlene tæller med. Rekorden er den hurtigste tid." },
            SAET
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

    /* Boksen laegges der, hvor der er plads. */
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

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
}());

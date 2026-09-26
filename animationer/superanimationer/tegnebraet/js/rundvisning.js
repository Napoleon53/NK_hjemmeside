/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.1, sc1.2 og sc4.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Tavlen har
   et usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i fane.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-tegn": [
            { sel: "#tb-anker-tavle", titel: "Tavlen", tekst: "Træk fra et atom for at tegne en kæde, eller klik på det: kæden bliver ét C længere. Klik på en binding: dobbelt og tripel. Højreklik sletter." },
            { sel: "#tb-zoom", titel: "Zoom", tekst: "Tavlen er større end skærmen. Træk i den tomme tavle for at flytte udsnittet, og zoom her eller med musehjulet. Vis alt viser hele tegningen." },
            { sel: "#tb-vaerktoej", titel: "Tegn med", tekst: "Vælg et grundstof med knappen eller tasten (C, H, O, N, L for Cl, B for Br, I), og klik på et atom for at skifte det. Med Markér (M) flytter du hele molekyler, tegner dem pænt, spejlvender og kopierer dem (Ctrl+C, Ctrl+V). Højreklik går tilbage til C." },
            { sel: "#tb-grupper", titel: "Grupper", tekst: "Klik på en gruppe og så på et atom: –OH, =O, –CHO, –COOH og –NH₂ kommer på i ét klik. –COO⁻ giver ionen, fx ethanoat. ± giver et atom en ladning." },
            { sel: "#tb-navnkort", titel: "Skriv et navn", tekst: "Skriv et navn, fx propan-2-ol eller eddikesyre, eller et helt skema: ethanol + ethansyre -> ethylethanoat + vand." },
            { sel: "#tb-molekyle", titel: "Molekyler på tavlen", tekst: "Navn, stofklasse, molekylformel og molarmasse for hvert molekyle. Klik på overskriften for at folde kortet ind." },
            { sel: "#tb-rapport", titel: "Indstillinger", tekst: "Zigzag eller alle atomer, numre og navne. Kopiér billedet ind i Word, eller gem det som SVG. En gemt SVG kan åbnes her igen." },
            { sel: "#tb-skuffe", titel: "Kemichaels skuffe", tekst: "Klistermærker fra quizzerne i Zigzagformler. Klik på et, og klik så på tavlen." },
            { sel: "#teoriknap", titel: "Navne", tekst: "Endelserne for alkoholer, aldehyder, ketoner, syrer, estre, amider, aminer og ethere." }
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

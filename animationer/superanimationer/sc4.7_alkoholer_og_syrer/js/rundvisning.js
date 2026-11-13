/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc4.6, sc4.4, sc1.4 og sc7.5; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-n": [
            { sel: "#n-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Den gule knap giver ét hint ad gangen og til sidst svaret. Der er fem opgaver." },
            { sel: "#n-anker-hylde", titel: "Grupperne", tekst: "Træk en gruppe hen på enden af kæden, eller klik på den. −H giver en alkan, −OH en alkohol og −COOH en carboxylsyre." },
            { sel: "#n-anker-kontrol", titel: "Kæden", tekst: "Med + og − bliver kæden længere og kortere. Piletasterne gør det samme." },
            { sel: "#n-anker-stil", titel: "Alle atomer eller zigzag", tekst: "Vis molekylet som stregformel med alle atomer eller som zigzagformel. Valget gælder alle tre faner." },
            { sel: "#n-anker-maskine", titel: "Sådan dannes navnet", tekst: "Antallet af carbonatomer giver første del af navnet, og gruppen giver endelsen." },
            { sel: "#n-navnekort", titel: "Navnenes første del", tekst: "Tabellen viser første del af navnet for 1 til 8 carbonatomer og endelsen for hver stofklasse." }
        ],
        "fane-k": [
            { sel: "#k-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Der er to opgaver." },
            { sel: "#k-anker-plade", titel: "Byg molekylet", tekst: "Træk en gruppe hen på kæden, og gør kæden længere eller kortere med + og −." },
            { sel: "#k-anker-instr", titel: "Termometeret", tekst: "Termometeret viser stoffets kogepunkt. Den stiplede streg er 20 °C. Koger stoffet under 20 °C, er det en gas ved stuetemperatur." },
            { sel: "#k-anker-lup", titel: "Luppen", tekst: "Luppen viser molekylerne i stoffet som væske. Stiplede linjer er hydrogenbindinger mellem grupperne, og orange flader viser, hvor kæderne rører hinanden." },
            { sel: "#k-skemakort", titel: "Skemaet", tekst: "Kogepunktet for hvert stof, du bygger, kommer i skemaet, så du kan sammenligne." }
        ],
        "fane-v": [
            { sel: "#v-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Der er fem opgaver." },
            { sel: "#v-anker-plade", titel: "Byg molekylet", tekst: "Træk en gruppe hen på kæden, og gør kæden længere eller kortere med + og −." },
            { sel: "#v-anker-instr", titel: "Glasset", tekst: "Stoffet er rystet med vand. Ét lag betyder, at stofferne blandes, og to lag betyder, at stofferne ikke blandes." },
            { sel: "#v-anker-regel", titel: "Tommelfingerreglen", tekst: "1 polær gruppe kræver 4 C-atomer. Felterne viser, om stoffets antal C-atomer er færre end grænsen, lige på den eller flere." },
            { sel: "#v-anker-lup", titel: "Luppen", tekst: "Luppen viser ét molekyle i vand. De stiplede linjer er hydrogenbindinger fra den polære gruppe til vandmolekylerne." },
            { sel: "#v-regelkort", titel: "Det har du set", tekst: "Skemaet samler, hvad du har set i glasset." }
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

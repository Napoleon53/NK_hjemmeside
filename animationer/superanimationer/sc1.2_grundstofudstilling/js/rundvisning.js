/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode som i
   sc1.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (montren, kassen, tavlen, flasken) har et
   usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i sim_montre.js, sim_formler.js og sim_opraab.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-montre": [
            { sel: "#montre-anker-montre", titel: "Udstillingen", tekst: "Et skab formet som det periodiske system. Hvert rum har et skilt med atomnummer og symbol. Tallene foroven er hovedgrupperne, tallene til venstre perioderne." },
            { sel: "#montre-anker-kasse", titel: "Kassen", tekst: "De 36 prøver. På mærket mangler enten navnet eller symbolet. Klik på en prøve for at tage den op." },
            { sel: "#montre-kort", titel: "Opgaven", tekst: "Skriv det, der mangler på mærket, træk prøven op på sin plads, og skriv elektronstrukturen. Knappen giver et hint og derefter svaret." },
            { sel: "#montre-anker-tavle", titel: "Tavlen", tekst: "Atommodellen tegnes, mens du skriver elektronstrukturen. Elektroner, der ikke er plads til, bliver røde." },
            { sel: "#montre-anker-navne", titel: "Navnetavlen", tekst: "Klik for at slå navnene op." },
            { sel: "#montre-fremskridt", titel: "Perioderne", tekst: "En prøve, du løser uden at se svaret, får en stjerne. Klik på en periode for at tage dens næste prøve." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Formlerne: tæl atomerne i et stof. Opråbet: find grundstofferne i udstillingen på tid." }
        ],
        "fane-formler": [
            { sel: "#formler-anker-flaske", titel: "Flasken", tekst: "Stoffet og dets formel. Formlen fortæller, hvilke grundstoffer stoffet er lavet af, og hvor mange atomer der er af hvert." },
            { sel: "#formler-kort", titel: "Opgaven", tekst: "Tæl atomerne af hvert grundstof og til sidst dem alle. Knappen giver et hint og derefter svaret." },
            { sel: "#formler-anker-tavle", titel: "Tavlen", tekst: "Når et grundstof er talt, flyver dets atomer ud af udstillingen og op på tavlen. En parentes bliver til lige så mange kopier, som tallet efter den siger." },
            { sel: "#formler-anker-raekke", titel: "Flaskerne", tekst: "Klik på en flaske for at skifte stof." }
        ],
        "fane-opraab": [
            { sel: "#opraab-anker-tavle", titel: "Tavlen", tekst: "Her står opråbet: et navn, en elektronstruktur eller et spørgsmål om det rum, der blinker. Kridtstregen er tiden." },
            { sel: "#opraab-anker-montre", titel: "Udstillingen", tekst: "Klik på det grundstof, tavlen siger." },
            { sel: "#opraab-kort", titel: "Point", tekst: "Hurtige svar giver flere point, og en stime ganger dem op. En fejl eller en tid, der løber ud, koster et liv." }
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

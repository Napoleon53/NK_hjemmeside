/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1 og sc1.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (plakaten, vaegten, flasken, tavlen) har et usynligt felt
   oven paa sig, som fanen selv flytter paa plads (saetAnker i
   sim_vaegt.js, sim_skaal.js og sim_ukendt.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-vaegt": [
            { sel: "#vaegt-anker-plakat", titel: "Det periodiske system", tekst: "Klik på et grundstof for at lægge et atom på vægten. Holder du musen over et felt, står navnet der." },
            { sel: "#vaegt-anker-felt", titel: "Tallene i et felt", tekst: "Øverst til venstre står atomnummeret. Nederst står atommassen. Det er den, molarmassen regnes med." },
            { sel: "#vaegt-kort", titel: "Opgaven", tekst: "Byg molekylet, skriv atommassen for hvert grundstof, og læg sammen. Knappen giver et hint og derefter svaret." },
            { sel: "#vaegt-anker-vaegt", titel: "Vægten", tekst: "Den vejer med to decimaler, men ét molekyle kan den ikke mærke. Når molarmassen er rigtig, kommer 1 mol af stoffet på." },
            { sel: "#vaegt-fremskridt", titel: "Stofferne", tekst: "Et stof, du løser uden at se svaret, får en stjerne. Klik på et niveau for at tage dets næste stof." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Molarmasse kort forklaret med et eksempel." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Skålvægten: gæt, hvilket stof der vejer mest. Ukendt stof: find etiketten ud fra molarmassen." }
        ],
        "fane-skaal": [
            { sel: "#skaal-anker-vaegt", titel: "Skålvægten", tekst: "1 mol af et stof i hver skål. Vægten er låst, til du har svaret." },
            { sel: "#skaal-valg", titel: "Dit svar", tekst: "Hvilken side synker? Piletasterne virker også." },
            { sel: "#skaal-anker-kort", titel: "Skiltet", tekst: "Det, der ligger i skålene, og beregningen af massen. Pilen peger mod skålen. Hintet sætter atommasserne ind, og efter svaret står resultatet der." },
            { sel: "#skaal-kort", titel: "Runden", tekst: "Ni par. Knappen giver beregningen som hint. Rekorden huskes." }
        ],
        "fane-ukendt": [
            { sel: "#ukendt-anker-flaske", titel: "Flasken", tekst: "Etiketten er faldet af. Glasset er brunt, så man kan ikke se stoffet." },
            { sel: "#ukendt-anker-maerke", titel: "Mærket", tekst: "Det eneste, der er tilbage: molarmassen." },
            { sel: "#ukendt-anker-tavle", titel: "Etiketterne", tekst: "Klik på den, der passer. En forkert falder af igen og får sin molarmasse skrevet på." },
            { sel: "#ukendt-fremskridt", titel: "Flaskerne", tekst: "En flaske, du løser i første forsøg uden at se svaret, får en stjerne." }
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

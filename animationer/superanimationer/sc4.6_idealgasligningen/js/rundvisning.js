/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa fane 2. Samme kode
   som i sc1.1, sc4.1, sc4.2, sc4.4 og sc4.5; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_stempel.js og sim_regn.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-stempel": [
            { sel: "#stempel-anker-cylinder", titel: "Cylinderen", tekst: "En gas under et stempel. Prikkerne er molekylerne. Skalaen på glasset viser volumen i liter." },
            { sel: "#stempel-styr", titel: "Gassen", tekst: "Her skruer du på temperaturen, lodderne, stofmængden og låsen. Det samme kan du gøre i scenen." },
            { sel: "#stempel-anker-hylde", titel: "Lodderne", tekst: "Træk et lod op på stemplet, eller klik på det. Hvert lod trykker med 1 bar oven i luftens 1,013 bar." },
            { sel: "#stempel-anker-flaske", titel: "Gasflasken", tekst: "Klik på flasken for 0,25 mol gas mere. Den røde hane ved cylinderen lukker gas ud." },
            { sel: "#stempel-anker-manometer", titel: "Manometeret", tekst: "Viser trykket i gassen. Klik på stemplet for at låse det, så volumen ikke kan ændre sig." },
            { sel: "#stempel-kort", titel: "Opgaven", tekst: "Vælg først, hvad du tror, der sker. Prøv det så. Linjen i kortet siger, hvad du skal nu." },
            { sel: "#stempel-anker-graf", titel: "Grafen", tekst: "Tryk mod volumen. Kurven viser alle p og V ved den temperatur og stofmængde, gassen har nu." },
            { sel: "#stempel-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når du har løst det." },
            { sel: "#stempel-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: ".faneknapper", titel: "Beregningen", tekst: "På fane 2 regner du med idealgasligningen." }
        ],
        "fane-regn": [
            { sel: "#regn-kort", titel: "Opgaven", tekst: "Hvert trin: skriv først formlen, så tallet. Tryk Enter for at tjekke. Linjen i kortet siger, hvad der gik galt." },
            { sel: "#regn-anker-cylinder", titel: "Cylinderen", tekst: "Opgavens gas. Det, du skal finde, er dækket, til du har regnet det ud." },
            { sel: "#regn-anker-tavle", titel: "Tavlen", tekst: "Beregningerne, som de skal skrives, med enheder. R står i hjørnet." },
            { sel: "#regn-opgaver", titel: "Opgaverne", tekst: "Let: temperaturen i kelvin. Middel: temperaturen i °C. Svær: massen er med. Nye tal giver samme opgave med andre tal." },
            { sel: "#regn-anker-laerer", titel: "Kemichael", tekst: "Giv hint siger, hvad du kender. Vis svaret viser formlen eller beregningen." }
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

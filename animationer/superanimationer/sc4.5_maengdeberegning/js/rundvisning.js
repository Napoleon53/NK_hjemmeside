/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.1, sc4.2 og sc4.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-vej": [
            { sel: "#vej-anker-skema", titel: "Skemaet", tekst: "Under hver formel: massen m, molarmassen M og stofmængden n. Den grønne boks er den kendte masse." },
            { sel: "#vej-felter", titel: "Felterne", tekst: "Skriv tallet, og tryk Enter. Kun det næste felt er åbent. Pilene viser vejen, når et tal er rigtigt." },
            { sel: "#vej-anker-vaegte", titel: "Vægtene", tekst: "Hvert rigtigt tal sker også her: pulveret bliver til poser med 1 mol, poserne går gennem pilen, og det nye stof vejes." },
            { sel: "#vej-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#vej-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når du har løst det." },
            { sel: "#vej-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: "#vej-beregninger", titel: "Beregningerne", tekst: "Når et tal er rigtigt, står beregningen her, som den skal skrives." },
            { sel: "#vej-opgaver", titel: "Opgaverne", tekst: "Fire reaktioner. En opgave, du løser uden at se svaret, får en stjerne. Nye tal giver samme opgave med andre tal." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Skemaet: hele skemaet med afstemning og molarmasser. Begrænsende mængde: to kendte masser." }
        ],
        "fane-skema": [
            { sel: "#skema-anker-skema", titel: "Skemaet", tekst: "Afstem først. Så molarmasserne, stofmængderne og masserne. Felter med en grå streg skal ikke bruges." },
            { sel: "#skema-felter", titel: "Felterne", tekst: "Skriv tallet, og tryk Enter." },
            { sel: "#skema-anker-vaegt", titel: "Skålvægten", tekst: "Ved methan og propan: reaktanterne til venstre, produkterne til højre. Hver masse, du finder, lægges i skålen." },
            { sel: "#skema-tilstand", titel: "Trinvis eller frit", tekst: "Trinvis åbner ét felt ad gangen. Frit åbner dem alle." },
            { sel: "#skema-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#skema-beregninger", titel: "Beregningerne", tekst: "Når et tal er rigtigt, står beregningen her, som den skal skrives." }
        ],
        "fane-begr": [
            { sel: "#begr-anker-skema", titel: "Skemaet", tekst: "To masser er kendt. Molarmasserne står der allerede." },
            { sel: "#begr-anker-bord", titel: "Bordet", tekst: "Hvert stof står som poser med 1 mol, når stofmængden er fundet. Poserne reagerer i hele sæt efter skemaet." },
            { sel: "#begr-kort", titel: "Opgaven", tekst: "Når begge stofmængder er fundet, vælger du, hvem der slipper op først. Klik på poserne, eller brug knapperne her. Linjen i kortet siger, hvad der skete." },
            { sel: "#begr-beregninger", titel: "Beregningerne", tekst: "Beregningerne og begrundelsen for valget, som de skal skrives." },
            { sel: "#begr-opgaver", titel: "Opgaverne", tekst: "Seks reaktioner. Nye tal giver samme reaktion med andre masser." }
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

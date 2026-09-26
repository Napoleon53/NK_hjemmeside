/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.1, sc4.2, sc4.4, sc4.5 og sc5.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-formel": [
            { sel: "#formel-anker-bunke", titel: "Brikkerne", tekst: "Træk en brik op på en plads på tavlen. Du kan også klikke på en brik og så på pladsen." },
            { sel: "#formel-anker-formel", titel: "Formlen", tekst: "Formlen tjekkes, når alle dens pladser er fyldt. Det, der sidder rigtigt, bliver siddende." },
            { sel: "#formel-anker-skema", titel: "Skemaet", tekst: "Navnet og enheden for n, m og M. I nogle runder skal du selv sætte dem på." },
            { sel: "#formel-kort", titel: "Runden", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret. Når formlen skal vendes, kommer trekanten som andet hint." },
            { sel: "#formel-opgaver", titel: "Runderne", tekst: "Seks runder. Hjælpen forsvinder runde for runde, og til sidst skriver du det hele selv." },
            { sel: "#formel-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når du har løst det." },
            { sel: "#formel-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Vægten: regn med formlen, og se stoffet blive delt i poser på 1 mol. Hurtigrunden: tolv spørgsmål på tid." }
        ],
        "fane-vaegt": [
            { sel: "#vaegt-anker-tavle", titel: "Tavlen", tekst: "Opgavens tal og beregningerne. En beregning står der, når den er rigtig." },
            { sel: "#vaegt-raekker", titel: "Formlen og tallet", tekst: "Skriv først formlen med bogstaver, fx n = m / M, og tryk Enter. Så tallet med enheden, fx 2,00 mol." },
            { sel: "#vaegt-anker-bord", titel: "Bordet", tekst: "Molarmassen står på krukken. Vægten viser massen. Det, du regner, sker her." },
            { sel: "#vaegt-anker-poser", titel: "Poserne", tekst: "Hver pose er 1 mol og vejer M gram. Stofmængden er antallet af poser." },
            { sel: "#vaegt-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#vaegt-opgaver", titel: "Opgaverne", tekst: "Seks opgaver. En opgave, du løser uden at se svaret, får en stjerne. Nye tal giver samme opgave med andre tal." }
        ],
        "fane-hurtig": [
            { sel: "#hurtig-anker-tavle", titel: "Spørgsmålet", tekst: "Tolv spørgsmål om formlen, enhederne og navnene, og lidt hovedregning." },
            { sel: "#hurtig-anker-svar", titel: "Svarene", tekst: "Klik på det rigtige svar, eller tast 1 til 4. Et forkert svar giver 5 s ekstra, og spørgsmålet kommer igen senere." },
            { sel: "#hurtig-kort", titel: "Knappen", tekst: "Start runden. Undervejs giver den et hint (5 s ekstra) og derefter svaret." },
            { sel: "#hurtig-data", titel: "Tiden", tekst: "Tiden med straf, antallet, du fik rigtigt første gang, og din rekord i denne browser." }
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

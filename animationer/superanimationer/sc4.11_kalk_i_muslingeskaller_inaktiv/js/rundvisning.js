/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.5 og sc5.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-forsoeg": [
            { sel: "#forsoeg-anker-baad", titel: "Vejebåden", tekst: "Vægten viser massen af pulveret. Skriv den som m(før) i skemaet. Træk så en spatelfuld ad gangen over i kolben, eller klik på pulveret." },
            { sel: "#forsoeg-anker-kolbe", titel: "Kolben", tekst: "20 mL saltsyre på en vægt, der er nulstillet. Når pulveret er i, falder vægten, fordi CO₂ forsvinder op i luften." },
            { sel: "#forsoeg-anker-zoom", titel: "Luppen", tekst: "Bunden af kolben. H₃O⁺ tager carbonat-ionerne fra kalken, og CO₂ stiger op og ud." },
            { sel: "#forsoeg-skema", titel: "Skemaet", tekst: "Skriv m(før) og m(efter) for begge målinger. Tallene bruges på fanen Beregningen." },
            { sel: "#forsoeg-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#forsoeg-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når du er videre." },
            { sel: "#forsoeg-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: "#forsoeg-forfra", titel: "Start forfra", tekst: "En ny kolbe med syre og den samme prøve." },
            { sel: ".niveau", titel: "Uden mol eller med mol", tekst: "Vælg, hvordan kalken regnes på fanen Beregningen: med tallet 2,27 eller med stofmængder." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Beregningen: fra CO₂ til kalkindholdet. Fejlkilder: hvad sker der, når noget går galt?" }
        ],
        "fane-beregning": [
            { sel: "#beregning-anker-tavle", titel: "Tavlen", tekst: "Reaktionen, opgavens tal og beregningerne. En beregning står der, når den er rigtig." },
            { sel: "#beregning-raekker", titel: "Formlen og tallet", tekst: "Skriv først formlen med symboler, fx m(CO₂) = m(før) − m(efter), og tryk Enter. Så tallet." },
            { sel: "#beregning-anker-kaede", titel: "Kæden", tekst: "CO₂, kalken og prøven. Den bliver udfyldt, efterhånden som du regner." },
            { sel: ".niveau", titel: "Uden mol eller med mol", tekst: "Uden mol ganges med 2,27. Med mol går vejen over stofmængden." },
            { sel: "#beregning-opsum", titel: "Opsummeringen", tekst: "Vejledningens skema for de to målinger." },
            { sel: "#beregning-opgaver", titel: "Opgaverne", tekst: "Tre opgaver. Den sidste går baglæns. Nye tal giver en anden skal." }
        ],
        "fane-fejl": [
            { sel: "#fejl-anker-a", titel: "Gruppe A", tekst: "Gør som i vejledningen: 1,00 g tørt pulver lidt ad gangen i 20 mL saltsyre." },
            { sel: "#fejl-anker-b", titel: "Gruppe B", tekst: "Gør én ting anderledes. Den står i opgavekortet." },
            { sel: "#fejl-kort", titel: "Gæt først", tekst: "Bliver B's kalkindhold højere, lavere eller det samme? Så laver begge grupper forsøget." },
            { sel: "#fejl-resultat", titel: "Resultaterne", tekst: "Det, de to grupper skriver, og det, de regner ud." },
            { sel: "#fejl-opgaver", titel: "Fejlkilderne", tekst: "Seks ting, der kan gå galt. Et rigtigt gæt første gang giver en stjerne." }
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

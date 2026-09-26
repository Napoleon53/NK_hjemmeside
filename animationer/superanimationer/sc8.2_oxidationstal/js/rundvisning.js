/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa den anden fane. Samme kode
   som i sc1.1, sc4.5 og sc5.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-rg": [
            { sel: "#rg-trin", titel: "Trinene", tekst: "Hvilket trin du er ved, og hvad du skal gøre. Du skriver altid i det gule felt." },
            { sel: "#rg-tavle .tv-formel", titel: "Formlen", tekst: "Oxidationstallet skrives i feltet over atomet. Et rigtigt tal bliver stående med romertal." },
            { sel: "#rg-regn", titel: "Regnestykket", tekst: "Summen af oxidationstallene er stoffets ladning. Mellemregningerne står med almindelige tal." },
            { sel: "#rg-brikker", titel: "Atomerne", tekst: "Ét atom pr. brik. Er der to Cr, får hver sin brik, og de deler summen." },
            { sel: "#rg-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#rg-opgaver", titel: "Stofferne", tekst: "De seks første gennemgås trin for trin. Et stof, du løser uden at se svaret, får en stjerne." },
            { sel: "#rg-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når du har løst det." },
            { sel: "#rg-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: ".faneknapper", titel: "Elektronerne", tekst: "Den anden fane viser, hvorfor reglerne virker, og hvornår de ikke gør." }
        ],
        "fane-ek": [
            { sel: "#ek-anker-molekyle", titel: "Molekylet", tekst: "En elektronprikformel. Prikkens farve viser, hvilket atom elektronen kom fra." },
            { sel: "#ek-anker-en", titel: "Elektronegativiteten", tekst: "Tallet ved hvert atom. Det atom med det største tal trækker hårdest i et elektronpar." },
            { sel: "#ek-kort", titel: "Opgaven", tekst: "Først et gæt. Så trækker du parrene i bindingerne hen til det atom, der trækker hårdest." },
            { sel: "#ek-regnskabkort", titel: "Regnskabet", tekst: "Oxidationstallet er valenselektronerne minus de elektroner, atomet har, når alle par er fordelt." },
            { sel: "#ek-opgaver", titel: "Molekylerne", tekst: "Tolv molekyler og ioner. Et rigtigt gæt uden hjælp giver en stjerne." },
            { sel: "#ek-forfra", titel: "Start forfra", tekst: "Samme molekyle med parrene tilbage i bindingerne." }
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

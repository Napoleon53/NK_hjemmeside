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
            { sel: "#forsoeg-kort", titel: "Opgaven", tekst: "Gæt først, hvad der bliver tilbage. Linjen i kortet siger hele tiden, hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#forsoeg-anker-vaegt", titel: "Vægten", tekst: "Den er nulstillet med den tomme digel, så den viser massen af det, der er i diglen. En varm digel vejer for lidt." },
            { sel: "#forsoeg-anker-opstilling", titel: "Trefoden og brænderen", tekst: "Træk diglen hen på trefoden, eller klik på den. Diglen står i porcelænstrekanten over flammen." },
            { sel: "#forsoeg-anker-knapper", titel: "Flammen", tekst: "Sluk, Lav og Høj. Start med lav flamme, ellers sprøjter pulveret ud af diglen." },
            { sel: "#forsoeg-skema", titel: "Vejningerne", tekst: "Skriv startmassen og hver vejning. Massen er konstant, når to vejninger i træk giver det samme." },
            { sel: "#forsoeg-anker-zoom", titel: "Luppen", tekst: "Natronen består af Na⁺ og HCO₃⁻. Gas forsvinder. Det, der bliver tilbage, står som ?, til du har fundet det på fanen Hypoteserne." },
            { sel: "#forsoeg-anker-graf", titel: "Grafen", tekst: "Dine vejninger. Kurven bliver vandret, når massen er konstant." },
            { sel: "#forsoeg-knap", titel: "Giv hint", tekst: "Sidder du fast, så tryk på den gule knap. Først får du et hint, og et tryk mere viser svaret." },
            { sel: "#journalknap", titel: "Journalen", tekst: "Dit gæt, dine vejninger, beregningerne og konklusionen på én side, som kan udskrives." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Hypoteserne: regn ud, hvad diglen skal veje i hver hypotese. Fejlkilder: hvad sker der, når noget går galt?" }
        ],
        "fane-hypoteser": [
            { sel: "#hypoteser-anker-tavle", titel: "Tavlen", tekst: "Opgaven står over tavlen. På tavlen står skemaet med dine tal, atomtællingen og beregningen, efterhånden som du skriver den." },
            { sel: "#hypoteser-raekker", titel: "Afstem, formel og tal", tekst: "Afstem skemaet først. Skriv så formlen med symboler, fx n(Na₂O) = n(NaHCO₃) / 2, sæt tallene ind og regn resultatet ud." },
            { sel: "#hypoteser-anker-graf", titel: "Grafen", tekst: "Dine vejninger fra forsøget. Hver hypotese, du har regnet, får en stiplet streg ved sin forventede masse." },
            { sel: "#hypoteser-opgaver", titel: "Opgaverne", tekst: "Natronen, de tre hypoteser og til sidst dommen: hvilken streg ender kurven på?" }
        ],
        "fane-fejl": [
            { sel: "#fejl-anker-g1", titel: "Gruppe 1", tekst: "Gør det rigtigt: 5,10 g natron, lav flamme først, 5 minutter i alt, og de vejer diglen, når den er kølet af." },
            { sel: "#fejl-anker-g2", titel: "Gruppe 2", tekst: "Gør én ting anderledes. Den står i opgavekortet. Skiltet viser uret og til sidst slutmassen." },
            { sel: "#fejl-kort", titel: "Gæt først", tekst: "Vejer diglen hos gruppe 2 til sidst mere, mindre eller det samme som hos gruppe 1? Så laver begge grupper forsøget." },
            { sel: "#fejl-resultat", titel: "Resultaterne", tekst: "Slutmassen, tabet og den hypotese, massen passer med, for begge grupper." },
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

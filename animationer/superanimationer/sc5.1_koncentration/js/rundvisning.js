/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.1, sc4.2, sc4.4 og sc4.5; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-kar": [
            { sel: "#kar-skort", titel: "Opgaven", tekst: "Opgaven står på kortet øverst. Linjen under den siger, hvor langt karret er fra målet. To opgaver starter med et gæt på et gult kort." },
            { sel: "#kar-anker-krukke", titel: "Krukken", tekst: "Træk en skefuld kobber(II)sulfat ned i karret, eller klik på krukken. En skefuld er 0,10 mol." },
            { sel: "#kar-anker-haner", titel: "Hanerne", tekst: "Hold musen nede på den blå knap for at hælde vand i, og på den røde hane for at tappe ud. Hvert tryk er 0,05 L. Et gult skilt viser, hvad der mangler." },
            { sel: "#kar-anker-zoom", titel: "Luppen", tekst: "Luppen viser altid lige meget væske. Antallet af ioner i den følger koncentrationen." },
            { sel: "#kar-data", titel: "Tallene", tekst: "Stofmængden, rumfanget og c = n / V, mens du arbejder i karret." },
            { sel: "#kar-knap", titel: "Giv hint", tekst: "Sidder du fast, så tryk på den gule knap på kortet. Først får du et hint, og et tryk mere viser svaret." },
            { sel: "#kar-forfra", titel: "Start forfra", tekst: "Karret, som det var, da opgaven begyndte." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "c eller n?: forskellen på stofmængde og koncentration. Målekolben: regn en opløsning ud, før den laves. Fortynding: der kommer vand til, men ikke stof." }
        ],
        "fane-glas": [
            { sel: "#glas-skort", titel: "Spørgsmålet", tekst: "Spørgsmålet står på kortet øverst. Klik på et svar. Handler spørgsmålet om et glas, kan du også klikke på glasset. Et forkert svar bliver forklaret." },
            { sel: "#glas-anker-glassene", titel: "Glassene", tekst: "Hver prik i et glas er 0,01 mol kobber(II)sulfat. Tæl prikkerne, så har du stofmængden n." },
            { sel: "#glas-anker-lupper", titel: "Lupperne", tekst: "En lup viser altid lige meget væske. Flere ioner i luppen betyder en højere koncentration c." },
            { sel: "#glas-knap", titel: "Giv hint", tekst: "Sidder du fast, så tryk på den gule knap på kortet. Først får du et hint, og et tryk mere viser svaret." },
            { sel: "#glas-data", titel: "Tabellen", tekst: "Det, du ved om glassene. Et spørgsmålstegn er noget, du skal finde." },
            { sel: "#glas-opgaver", titel: "Opgaverne", tekst: "Otte opgaver. En opgave, du løser uden forkerte svar og uden at se svaret, får en stjerne." }
        ],
        "fane-kolbe": [
            { sel: "#kolbe-anker-tavle", titel: "Tavlen", tekst: "Opgavens tal og beregningen, efterhånden som du skriver den." },
            { sel: "#kolbe-raekker", titel: "Regnestykket", tekst: "Tre trin: vælg formlens form og skriv bogstaverne, sæt tallene ind med enheder, og skriv resultatet med enhed." },
            { sel: "#kolbe-anker-bord", titel: "Bordet", tekst: "Det, du har regnet, sker her: stoffet vejes af, hældes i kolben, og kolben fyldes op til mærket." },
            { sel: "#kolbe-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#kolbe-opgaver", titel: "Opgaverne", tekst: "Seks opgaver. En opgave, du løser uden at se svaret, får en stjerne. Nye tal giver samme opgave med andre tal." }
        ],
        "fane-fortynd": [
            { sel: "#fortynd-anker-lupper", titel: "Lupperne", tekst: "Flasken og kolben. Ionerne fra pipetten fordeler sig i mere vand, så der er færre i luppen." },
            { sel: "#fortynd-anker-bord", titel: "Bordet", tekst: "I første opgave: klik på en pipette, så på en målekolbe og til sidst på sprøjteflasken." },
            { sel: "#fortynd-anker-tavle", titel: "Tavlen", tekst: "Opgavens tal og beregningerne." },
            { sel: "#fortynd-kort", titel: "Opgaven", tekst: "Fra opgave 2 regner du i tre trin: formlen, tallene med enheder og resultatet. Før og efter står med lille skrift: V før fortyndingen og V efter. Scenen gør det, du har regnet." },
            { sel: "#fortynd-opgaver", titel: "Opgaverne", tekst: "Fem opgaver. Nye tal giver samme opgave med andre tal." }
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

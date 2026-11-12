/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc5.1, sc5.2, sc5.4 og sc5.5; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-opl": [
            { sel: "#opl-anker-krukke", titel: "Krukken", tekst: "Træk en portion salt ned i glasset, eller klik på krukken. En portion er 0,10 mol." },
            { sel: "#opl-anker-glas", titel: "Glasset", tekst: "Rumfanget står fast i hver opgave. Saltet deler sig i ioner, når det opløses." },
            { sel: "#opl-anker-zoom", titel: "Luppen", tekst: "Luppen viser altid lige meget væske. Én prik er 0,05 M af ionen." },
            { sel: "#opl-anker-soejler", titel: "Søjlerne", tekst: "Den grå søjle er saltets koncentration. De farvede søjler er ionernes koncentrationer. Den stiplede linje er målet." },
            { sel: "#opl-skort", titel: "Opgaven", tekst: "Opgaven står på kortet øverst. Nogle opgaver starter med et gæt, og nogle har spørgsmål, når saltet er opløst. Vælg et svar, og tryk på Indsend svar." },
            { sel: "#opl-knap", titel: "Giv hint", tekst: "Sidder du fast, så tryk på Giv hint. Først får du et hint, og et tryk mere viser svaret." },
            { sel: "#opl-kort", titel: "Beregningen", tekst: "Når opgaven er løst, står beregningen her. Start forfra tømmer glasset." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Ionerne: Regn ionernes koncentrationer ud. Blandinger: en ion, der kommer fra to salte." }
        ],
        "fane-ioner": [
            { sel: "#ioner-anker-tavle", titel: "Tavlen", tekst: "Tavlen viser opgavens tal, opløsningsskemaet og beregningerne." },
            { sel: "#ioner-skort", titel: "Opgaven", tekst: "Opgaven og spørgsmålet til trinnet står på kortet øverst. Giv hint giver et hint og derefter svaret." },
            { sel: "#ioner-raekker", titel: "Skemaet og tallene", tekst: "Skriv først tallene foran ionerne i opløsningsskemaet og derefter ionernes koncentrationer. Tryk på Indsend svar eller Enter." },
            { sel: "#ioner-anker-soejler", titel: "Søjlerne", tekst: "En søjle kommer frem, når du har fundet koncentrationen. Luppen fyldes til sidst." },
            { sel: "#ioner-opgaver", titel: "Niveauerne", tekst: "Let, Middel og Svær. I Middel kender du af og til en ions koncentration og regner baglæns. Svær starter fra saltets masse. Ny opgave giver et nyt salt." }
        ],
        "fane-bland": [
            { sel: "#bland-anker-glas", titel: "Glassene", tekst: "I første opgave kommer saltet fra vægten i vandet, når du har regnet dets koncentration. I de andre opgaver hældes glas A og B sammen, når du har regnet det samlede rumfang." },
            { sel: "#bland-anker-tavle", titel: "Tavlen", tekst: "Tavlen viser opgavens tal og beregningerne." },
            { sel: "#bland-skort", titel: "Opgaven", tekst: "Opgaven og spørgsmålet til trinnet står på kortet øverst. Giv hint giver et hint og derefter svaret." },
            { sel: "#bland-kort", titel: "Regnetrinene", tekst: "Skriv formlen og så tallet, og tryk på Indsend svar. I stofmængden skal tallet foran ionen med, for eksempel n = 2 · c · V." },
            { sel: "#bland-anker-zoom", titel: "Luppen", tekst: "Ionerne i blandingen kommer, når koncentrationen er fundet." },
            { sel: "#bland-opgaver", titel: "Opgaverne", tekst: "Fire opgaver. Nye tal giver samme opgave med andre salte og tal." }
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

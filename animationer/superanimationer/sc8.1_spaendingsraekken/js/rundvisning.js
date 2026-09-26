/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc7.2 og sc7.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_forsoeg.js, sim_raekken.js og sim_forudsig.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-forsoeg": [
            { sel: "#fs-anker-holder", titel: "Stængerne", tekst: "Fem metaller. Træk en stang ned i et glas. Et klik på en stang i et glas sender den hjem." },
            { sel: "#fs-anker-glas", titel: "Glassene", tekst: "Opløsninger med fem slags metalioner og saltsyre, H⁺. Ionen står på skiltet." },
            { sel: "#fs-anker-lup", titel: "Luppen", tekst: "Stangen og opløsningen, set helt tæt på. Klik på et glas for at se det." },
            { sel: "#fs-kort", titel: "Målet", tekst: "Hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#fs-skemakort", titel: "Skemaet", tekst: "Hvert forsøg bliver skrevet ind: ✓ for en reaktion, – for ingen." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Spændingsrækken kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Rækken: stil metallerne i rækkefølge. Forudsig: brug rækken, før stangen kommer ned." }
        ],
        "fane-raekken": [
            { sel: "#rk-anker-kort", titel: "Kortene", tekst: "De fem metaller fra forsøget og hydrogen." },
            { sel: "#rk-anker-hylde", titel: "Hylden", tekst: "Seks pladser fra uædel til ædel. Træk kortene derop." },
            { sel: "#rk-kort", titel: "Opgaven", tekst: "Rækkefølgen bliver tjekket, når alle seks står på hylden." },
            { sel: "#rk-skemakort", titel: "Skemaet", tekst: "Dine forsøg fra fane 1. Knappen giver et hint og derefter svaret." }
        ],
        "fane-forudsig": [
            { sel: "#fu-anker-raekke", titel: "Spændingsrækken", tekst: "Som i bogen: uædel til venstre, ædel til højre." },
            { sel: "#fu-anker-glas", titel: "Glasset", tekst: "Stangen kommer ned, når du har svaret." },
            { sel: "#fu-anker-lup", titel: "Luppen", tekst: "Det samme glas, set helt tæt på." },
            { sel: "#fu-kort", titel: "Opgaven", tekst: "Sker der noget? Hvis ja: hvad dannes, og hvor mange af hver?" },
            { sel: "#fu-logkort", titel: "Dine svar", tekst: "De seneste opgaver og antallet af rigtige gæt i første forsøg." }
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

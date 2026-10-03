/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-e": [
            { sel: "#e-anker-lup", titel: "Luppen", tekst: "Molekylerne i glasset. De røde stiplede streger er hydrogenbindinger, de grå prikker er London-kræfter. Klik på et molekyle." },
            { sel: "#e-signatur", titel: "Bindingerne", tekst: "Hvor mange bindinger der er mellem molekylerne i luppen lige nu." },
            { sel: "#e-anker-termometer", titel: "Termometeret", tekst: "Træk i det runde håndtag for at varme op eller køle ned. Pil op og ned virker også." },
            { sel: "#e-anker-kammer", titel: "Glasset", tekst: "Ethanol i et reagensglas i et temperaturkammer. Ballonen fanger dampen, når ethanol koger." },
            { sel: "#e-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#e-kort", titel: "Opgaven", tekst: "Fire mål, ét ad gangen." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Sammenlign stiller to stoffer op mod hinanden. Rangér sætter tre eller fire i rækkefølge." }
        ],
        "fane-s": [
            { sel: "#s-anker-lupper", titel: "To stoffer", tekst: "Hvert stof har sin egen lup. Gæt først ved at klikke på det stof, du tror koger ved den højeste temperatur." },
            { sel: "#s-anker-termometer", titel: "Termometeret", tekst: "Varmer begge glas på én gang. Kogepunkterne kommer på termometeret, når stofferne koger." },
            { sel: "#s-grafkort", titel: "Grafen", tekst: "Kogepunkterne mod molarmassen. Alkaner er grå, alkoholer er røde." },
            { sel: "#s-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu. Knappen giver ét hint ad gangen og til sidst svaret." },
            { sel: "#s-opgaver", titel: "Parrene", tekst: "Fem par, der hver viser én ting: OH-gruppen, kæden, formen, to OH-grupper og et stort molekyle." }
        ],
        "fane-r": [
            { sel: "#r-tavle", titel: "Tavlen", tekst: "Træk kortene i rækkefølge efter kogepunkt, det laveste til venstre. Du kan også klikke på to kort for at bytte dem." },
            { sel: "#r-tjek", titel: "Tjek", tekst: "Tjekker rækkefølgen. Enter gør det samme." },
            { sel: "#r-status", titel: "Linjen forneden", tekst: "Står et par forkert, forklares det her. Knappen giver ét hint ad gangen." },
            { sel: "#r-opgaver", titel: "Opgaverne", tekst: "Tolv opgaver i tre grupper. En opgave, du løser uden at se svaret, får en stjerne." }
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

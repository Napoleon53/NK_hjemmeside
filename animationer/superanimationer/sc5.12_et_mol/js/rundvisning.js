/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb2.4, sc7.5, sc1.4 og sc8.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-g": [
            { sel: "#g-skort", titel: "Gættet", tekst: "Kortet øverst stiller spørgsmålet. Vælg et af de fire svar. Det rigtige svar er ikke altid det største." },
            { sel: "#g-anker-stige", titel: "Stigen", tekst: "En tallinje i tierpotenser: hvert trin er 10 gange større end trinet under. Når du har gættet, vokser søjlen fra ét stk. til 1 mol." },
            { sel: "#g-anker-ting", titel: "Kendte ting", tekst: "Ting, du kender, på deres plads på stigen. De lyser op, når søjlen kommer forbi dem." },
            { sel: "#g-anker-flag", titel: "De fire svar", tekst: "Svarene A til D står som flag ved deres plads på stigen. Bagefter zoomer stigen ud, så du kan se, hvor langt dit gæt var fra 1 mol." },
            { sel: "#g-status", titel: "Hjælpen", tekst: "Den gule knap giver et hint med tal, du kan lave et overslag med. Efter svaret kan du klikke på stigen for at zoome ind og ud og trække den op og ned." },
            { sel: "#g-molkort", titel: "Et antal", tekst: "Et mol er et antal ligesom et dusin. 1 mol er 6,02 · 10²³ stk." },
            { sel: "#g-opgaver", titel: "Gættene", tekst: "Otte gæt. Et rigtigt gæt får ✓. Du kan klikke på et gæt, du allerede har lavet, og se svaret igen." }
        ],
        "fane-t": [
            { sel: "#t-skort", titel: "Opgaven", tekst: "Kortet øverst stiller opgaven. Vælg et af de fire svar. Svarer du forkert, står forklaringen på kortet." },
            { sel: "#t-anker-scene", titel: "Sækkene", tekst: "Hver sæk har plads til 1 mol, ligesom en æggebakke har plads til 1 dusin. Når svaret er rigtigt, bliver sækkene fyldt." },
            { sel: "#t-status", titel: "Hjælpen", tekst: "Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#t-formelkort", titel: "Fra mol til antal", tekst: "Gang stofmængden med 6,02 · 10²³ for at få antallet. Divider antallet med 6,02 · 10²³ for at få stofmængden." },
            { sel: "#t-opgaver", titel: "Opgaverne", tekst: "Seks opgaver. En opgave, der er løst uden hint og uden fejl, får en stjerne." }
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
        NK.saetHTML("rv-tekst", NK.htmlPotens(t.tekst));
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

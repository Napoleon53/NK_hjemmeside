/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc7.5, sc1.4 og sc8.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-i": [
            { sel: "#i-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu. Et gæt og et spørgsmål har gule svarknapper på kortet. Når svaret er rigtigt, står forklaringen på kortet. Blinker kortet, skal du først gøre det, kortet siger." },
            { sel: "#i-anker-beholder", titel: "Beholderen", tekst: "En lukket beholder med CO, H₂O, CO₂ og H₂. Hvert molekyle står for 0,025 M. Når reaktionen forløber, bliver et par molekyler lavet om ad gangen. Klik på et molekyle for at se, hvad det er." },
            { sel: "#i-anker-knapper", titel: "Indgrebene", tekst: "Når opgaven beder om det, kan du pumpe et stof ind (+) eller fjerne det (−). Hver gang er det 0,10 M." },
            { sel: "#i-anker-tallinje", titel: "Tallinjen", tekst: "Reaktionsbrøken Y og ligevægtskonstanten K. Står Y til venstre for K, går reaktionen mod højre. Står Y til højre for K, går den mod venstre. Den tomme, stiplede ring viser Y før indgrebet." },
            { sel: "#i-konckort", titel: "Koncentrationerne", tekst: "Koncentrationerne og Y før indgrebet, lige efter det og nu." },
            { sel: "#i-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#i-opgaver", titel: "Opgaverne", tekst: "Fem opgaver, én ad gangen. En løst opgave bliver grøn på listen, og du kan altid vælge en opgave igen." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "På fane 2 ser du den samme slags indgreb i blodet. På fane 3 regner du Y ud og sammenligner med K." }
        ],
        "fane-b": [
            { sel: "#b-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu, og stiller spørgsmålene med gule svarknapper. Det, opgaven handler om, har en gul ring." },
            { sel: "#b-anker-lunge", titel: "Lungerne", tekst: "I lungerne kommer der oxygen ind i blodet fra luften. Når opgaven beder om det, sender et klik på lungerne blodet derhen." },
            { sel: "#b-anker-muskel", titel: "Musklen", tekst: "Musklen bruger oxygen. Når opgaven beder om det, sender et klik på musklen blodet derhen." },
            { sel: "#b-anker-lup", titel: "Luppen", tekst: "En lille portion af blodet: 12 Hb og de frie O₂. En Hb med O₂ på er lysere rød og hedder HbO₂. For at gøre det enkelt har hver Hb kun ét sted, hvor et O₂ kan sætte sig." },
            { sel: "#b-anker-tallinje", titel: "Tallinjen", tekst: "Reaktionsbrøken Y = [HbO₂] / ([Hb] · [O₂]) og ligevægtskonstanten K. Når [O₂] springer, springer Y væk fra K, og reaktionen går tilbage mod K." },
            { sel: "#b-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#b-luppenkort", titel: "Tallene i luppen", tekst: "Hvor mange Hb der har O₂ på, og hvor mange frie O₂ der er i luppen." },
            { sel: "#b-opgaver", titel: "Opgaverne", tekst: "Fem opgaver om lungerne, musklen og bjergene." }
        ],
        "fane-r": [
            { sel: "#r-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu, og stiller spørgsmålene med gule svarknapper." },
            { sel: "#r-anker-tavle", titel: "Tavlen", tekst: "Reaktionsskemaet, K og koncentrationerne. Når du har valgt reaktionsbrøken, sætter du tallene ind i felterne og regner Y ud. Enheden M står allerede efter hvert felt. Tryk på Tjek eller Enter." },
            { sel: "#r-anker-tallinje", titel: "Tallinjen", tekst: "Når Y er regnet ud, står Y på tallinjen ved siden af K. Når opgaven er løst, ser du Y gå hen til K." },
            { sel: "#r-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#r-trinkort", titel: "Trinene", tekst: "Trinene i opgaven. Det trin, du er ved, er fremhævet." },
            { sel: "#r-opgaver", titel: "Opgaverne", tekst: "Fem regneopgaver. To af dem har et indgreb, før du regner." }
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

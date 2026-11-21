/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sb2.1 og sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-lys": [
            { sel: "#lys-skort", titel: "Kortet", tekst: "Spørgsmålet står på kortet øverst. Gæt først ved at klikke på det svar, du tror på. Derefter prøver du det selv og trykker Indsend svar." },
            { sel: "#lys-laerred", titel: "Kuvetten i lyset", tekst: "Lampen sender lys med én bølgelængde gennem kuvetten. Prikkerne er fotoner. Kurven over strålen viser, hvor meget lys der er tilbage." },
            { sel: "#lys-c-ned, #lys-c-op, #lys-l-ned, #lys-l-op", titel: "Knapperne ved kuvetten", tekst: "− og + ved kuvettens etiket ændrer koncentrationen. − og + ved l ændrer kuvettens bredde. Knapperne kommer frem, når du skal bruge dem." },
            { sel: "#lys-raekke", titel: "Forudsigelserne", tekst: "Seks forudsigelser. En ny åbner, når du kommer dertil. En forudsigelse, du gætter rigtigt uden at se svaret, får en stjerne. Start forfra begynder forudsigelsen forfra." },
            { sel: ".faneknapper", titel: "Standardkurven", tekst: "På fanen Standardkurven måler du standarder, lægger en linje gennem (0, 0) og bestemmer koncentrationen af en ukendt prøve." }
        ],
        "fane-kurve": [
            { sel: "#kurve-skort", titel: "Kortet", tekst: "Kortet øverst siger næste skridt. Når du har lagt linjen eller aflæst prøven, trykker du Indsend svar. Giv et hint giver ét hint ad gangen." },
            { sel: "#kurve-laerred", titel: "Spektrofotometret og bakken", tekst: "Klik på en kuvette i bakken, så bliver den målt. Hver måling bliver et punkt på grafen og et tal i tabellen Målingerne under bakken." },
            { sel: "#kurve-raekke", titel: "Opgaverne", tekst: "Fire standardkurver. En ny åbner, når du kommer dertil. Prøvens koncentration er ny, hver gang du begynder forfra." }
        ],
        "fane-regn": [
            { sel: "#regn-skort", titel: "Kortet", tekst: "Spørgsmålet står på kortet. Vælg først formlen, og skriv så tallet i feltet. Giv et hint giver ét hint ad gangen og til sidst svaret." },
            { sel: "#regn-laerred", titel: "Opgavens tal", tekst: "Tallene fra opgaven står på kuvetten, i displayet og på de små kort. Det, du skal finde, står som ? med gul ramme." },
            { sel: "#regn-raekke", titel: "Opgaverne", tekst: "Let, Middel og Svær kan altid vælges. Et regnestykke, du løser uden at se svaret, får en stjerne." }
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

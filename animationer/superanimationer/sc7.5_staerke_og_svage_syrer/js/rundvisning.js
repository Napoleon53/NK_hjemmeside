/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4 og sc8.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-g": [
            { sel: "#g-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu. Et gæt og et spørgsmål har gule svarknapper på kortet. Når svaret er rigtigt, står forklaringen på kortet. Det glas, opgaven handler om, har en gul ring." },
            { sel: "#g-anker-glas", titel: "De to glas", tekst: "Saltsyre og eddikesyre med samme koncentration, 0,10 M. Et klik på et glas åbner luppen over det." },
            { sel: "#g-anker-skaal", titel: "Kalken", tekst: "Træk et stykke kalk fra skålen ned i et glas. Jo flere oxoniumioner der er i glasset, jo mere bruser det." },
            { sel: "#g-anker-lup", titel: "Lupperne", tekst: "Hver lup viser et lille rum i glasset, hvor der er hældt 100 syremolekyler i. Mærkerne over luppen viser, hvad partiklerne er. Klik på et mærke eller en partikel for at læse mere." },
            { sel: "#g-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#g-opgaver", titel: "Opgaverne", tekst: "Fem opgaver, én ad gangen. En løst opgave bliver grøn på listen, og du kan altid vælge en opgave igen." },
            { sel: "#phknap", titel: "pH-meter", tekst: "Slå pH-metret til, hvis du vil se pH på glassenes sedler. Opgaverne kan løses uden." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "På fane 2 afgør du selv, om fem syrer er stærke eller svage. På fane 3 fortynder du saltsyren." }
        ],
        "fane-s": [
            { sel: "#s-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu, og stiller spørgsmålene om glasset med gule svarknapper. Det glas, opgaven handler om, har en gul ring." },
            { sel: "#s-anker-glas", titel: "De fem glas", tekst: "Fem syrer med samme koncentration, 0,10 M, og et stykke kalk i hver. Klik på et glas for at se det i luppen." },
            { sel: "#s-anker-lup", titel: "Luppen", tekst: "Luppen viser det glas, du sidst har klikket på. Et helt molekyle er gråt med en lille orange hydron på, et molekyle, der har afgivet hydronen, er blåt, og de røde kugler er oxoniumioner." },
            { sel: "#s-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#s-glaskort", titel: "De fem glas", tekst: "Her samles det, du har fundet ud af om hvert glas. Glasset får sit navn, når du har afgjort, om syren er stærk eller svag." }
        ],
        "fane-f": [
            { sel: "#f-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu. Et gæt og et spørgsmål har gule svarknapper på kortet. Det glas, opgaven handler om, har en gul ring." },
            { sel: "#f-anker-glas", titel: "De to glas", tekst: "Til venstre 0,10 M eddikesyre. Til højre saltsyre, som du kan fortynde. Sedlen på glasset viser koncentrationen." },
            { sel: "#f-vaerktoej", titel: "Fortynd 10 gange", tekst: "Knappen Fortynd 10 gange hælder ni tiendedele af saltsyren fra og fylder op med vand, så koncentrationen bliver 10 gange mindre. Knappen Ny saltsyre begynder forfra med 0,10 M saltsyre." },
            { sel: "#f-anker-lup", titel: "Lupperne", tekst: "De to lupper viser lige store rum. Sammenlign antallet af røde oxoniumioner og antallet af syremolekyler." },
            { sel: "#f-tavle", titel: "Tavlen", tekst: "Vælg to ord til hver flaske, og tryk på Tjek." },
            { sel: "#f-glaskort", titel: "De to glas", tekst: "Koncentrationen i hvert glas og antallet af oxoniumioner i luppen." },
            { sel: "#f-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." }
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

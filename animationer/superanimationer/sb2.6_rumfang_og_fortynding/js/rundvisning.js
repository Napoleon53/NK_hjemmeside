/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb2.2, sc7.5, sc1.4 og sc8.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-s": [
            { sel: "#s-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu. Et gæt og et spørgsmål har svarknapper på kortet. Vælg et svar på et spørgsmål, og tryk Indsend svar. Blinker kortet, skal du først gøre det, kortet siger." },
            { sel: "#s-anker-cylinder", titel: "Cylinderen", tekst: "En lukket cylinder med stempel. Gassen er en blanding af brun NO₂ og farveløs N₂O₄, så farven viser, hvor meget NO₂ der er. Hvert molekyle står for 0,020 mol. Klik på et molekyle for at se, hvad det er." },
            { sel: "#s-anker-knapper", titel: "Stemplet", tekst: "Når opgaven beder om det, presser du stemplet ned til det halve rumfang eller trækker det op til det dobbelte." },
            { sel: "#s-anker-visning", titel: "Molekyler eller dansere", tekst: "Vis molekylerne som dansere: Et par, der holder hinanden i hånden, er ét N₂O₄, og en danser alene er ét NO₂. Et større dansegulv giver plads til, at et par går fra hinanden, og danserne siger, hvad de synes." },
            { sel: "#s-anker-tallinje", titel: "Tallinjen", tekst: "Reaktionsbrøken Y og ligevægtskonstanten K. Står Y til venstre for K, forløber reaktionen mod højre. Står Y til højre for K, forløber den mod venstre. Den stiplede ring viser Y før indgrebet." },
            { sel: "#s-talkort", titel: "Tallene", tekst: "Tryk på Vis tallene for at se rumfanget, antallet af molekyler, koncentrationerne og Y før indgrebet, lige efter det og nu." },
            { sel: "#s-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#s-opgaver", titel: "Opgaverne", tekst: "Fire opgaver, én ad gangen. En løst opgave bliver grøn på listen, og du kan altid vælge en opgave igen." }
        ],
        "fane-f": [
            { sel: "#f-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu, og stiller spørgsmålene med svarknapper. Vælg et svar, og tryk Indsend svar. Det, opgaven handler om, har en gul ring." },
            { sel: "#f-anker-glas", titel: "Måleglasset", tekst: "En opløsning af cobalt(II)chlorid i saltsyre med lyserøde Co²⁺, farveløse Cl⁻ og blå CoCl₄²⁻. Farven er en blanding af lyserød og blå. Klik på en ion for at se, hvad den er." },
            { sel: "#f-anker-vand", titel: "Vandet", tekst: "Når opgaven beder om det, hælder du vand i, til rumfanget er dobbelt så stort. Ionerne bliver i måleglasset og fordeles i det større rumfang." },
            { sel: "#f-anker-tallinje", titel: "Tallinjen", tekst: "Lige efter fortyndingen springer Y væk fra K. Bagefter forløber reaktionen, til Y igen er lig med K." },
            { sel: "#f-talkort", titel: "Tallene", tekst: "Tryk på Vis tallene for at se rumfanget, antallet af hver slags ion og Y før fortyndingen, lige efter og nu." },
            { sel: "#f-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#f-opgaver", titel: "Opgaverne", tekst: "Fire opgaver om fortyndingen." }
        ],
        "fane-r": [
            { sel: "#r-skort", titel: "Opgaven", tekst: "Kortet øverst siger, hvad du skal nu, og stiller spørgsmålene med svarknapper. Vælg et svar, og tryk Indsend svar." },
            { sel: "#r-anker-tavle", titel: "Tavlen", tekst: "Reaktionsskemaet, indgrebet og reaktionsbrøken. Når du har valgt faktoren, klikker du på hver koncentration i brøken, så den får faktoren på. En potens tæller flere gange." },
            { sel: "#r-anker-tallinje", titel: "Tallinjen", tekst: "Når du har fundet Y lige efter indgrebet, står Y på tallinjen. Når du har fundet retningen, går Y hen til K." },
            { sel: "#r-status", titel: "Hjælpen", tekst: "Den gule knap på kortet giver ét hint ad gangen og til sidst svaret. Svarer du forkert, står forklaringen her på kortet." },
            { sel: "#r-trinkort", titel: "Trinene", tekst: "Trinene i opgaven. Det trin, du er ved, er fremhævet." },
            { sel: "#r-opgaver", titel: "Opgaverne", tekst: "Seks opgaver med gasser og opløsninger." }
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

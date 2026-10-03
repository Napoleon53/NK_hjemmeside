/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.4 og sb2.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-let": [
            { sel: "#let-linje", titel: "Opgaven", tekst: "Her står, hvad du skal gøre nu." },
            { sel: "#let-laerred", titel: "Laboratoriet", tekst: "Træk en kuvette op i spektrofotometeret, eller klik på den. Den gule pil viser den næste. Zoomboblen viser lyset gennem kuvetten, og grafen til højre får et punkt for hver standard." },
            { sel: "#let-kort", titel: "Trinene", tekst: "Forsøget i små trin. Regnestykkerne skriver du her: først formlen med bogstaver, så tallene, så resultatet." },
            { sel: "#let-data", titel: "Målingerne", tekst: "Hver måling kommer i tabellen. Et tal med ! er målt forkert og skal måles igen." },
            { sel: "#let-status", titel: "Linjen forneden", tekst: "Her står, hvad der mangler, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#quizknap", titel: "Quizzen", tekst: "Otte spørgsmål om forsøgene." },
            { sel: ".faneknapper", titel: "Fanerne", tekst: "Nitrit og To farvestoffer bruger samme metode med mindre hjælp undervejs." }
        ],
        "fane-mid": [
            { sel: "#mid-linje", titel: "Opgaven", tekst: "Her står, hvad du skal gøre nu." },
            { sel: "#mid-laerred", titel: "Laboratoriet", tekst: "Dråbeflaskerne til højre tilsætter reagenserne til alle kuvetterne. Zoomboblen viser, hvad der sker med nitrit. Træk en kuvette op i spektrofotometeret, eller klik på den." },
            { sel: "#mid-kort", titel: "Trinene", tekst: "Her regner du standardernes koncentration og vandprøvernes nitrit." },
            { sel: "#mid-data", titel: "Målingerne", tekst: "Rumfanget af stamopløsning, c og A for hver kuvette. Et punkt kommer på grafen, når både c og A er kendt." },
            { sel: "#mid-status", titel: "Linjen forneden", tekst: "Her står, hvad der mangler, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." }
        ],
        "fane-svr": [
            { sel: "#svr-linje", titel: "Opgaven", tekst: "Her står, hvad du skal gøre nu." },
            { sel: "#svr-laerred", titel: "Laboratoriet", tekst: "Skift bølgelængde med de to knapper på spektrofotometeret. Der er en graf for hvert farvestof med en kurve for hver bølgelængde." },
            { sel: "#svr-kort", titel: "Trinene", tekst: "Færre og større trin end på de andre faner. Du skal selv finde vejen, men hintene hjælper." },
            { sel: "#svr-data", titel: "Målingerne", tekst: "A ved begge bølgelængder for hver kuvette." },
            { sel: "#svr-status", titel: "Linjen forneden", tekst: "Her står, hvad der mangler, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." }
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

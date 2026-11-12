/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb6.1 og sb7.7 (og sb7.3, sb7.2, sb4.11, sb4.3, sc1.4, sc8.6,
   sc7.5, sc4.4 og sb4.8); kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-k": [
            { sel: "#k-skort", titel: "Kortet øverst", tekst: "Kortet stiller spørgsmålet til det trin, du er ved. Skriv tallet, vælg enheden, og tryk Indsend svar. Den gule knap giver ét hint ad gangen." },
            { sel: "#k-tabelkort", titel: "Standardrækken", tekst: "Kopiér tabellen til et regneark, og lav et punktdiagram med en lineær tendenslinje. Punktum som decimaltegn er til et regneark på engelsk." },
            { sel: "#k-anker-graf", titel: "Standardkurven", tekst: "Punkterne er målingerne i tabellen. Linjen og ligningen fra regnearket kommer frem, når du har fundet ε. Et forkert svar ses som en rød linje." },
            { sel: "#k-anker-figur", titel: "Prøven", tekst: "Figuren viser prøven og spektrofotometeret. Kuvetten kommer ned i lyset, når prøven skal måles, og displayet viser absorbansen." },
            { sel: "#k-anker-rammer", titel: "Regnestykkerne", tekst: "Én ramme pr. trin. Den gule ramme er det trin, du er ved, og et løst trin viser hele regnestykket." }
        ],
        "fane-i": [
            { sel: "#i-skort", titel: "Kortet øverst", tekst: "Kortet stiller spørgsmålet til det trin, du er ved. Skriv tallet, vælg enheden, og tryk Indsend svar." },
            { sel: "#i-anker-figur", titel: "Prøven", tekst: "Figuren viser vejen fra pillen, bouillonen eller skruen til målekolben og kuvetten. Rumfangene står ved kolben og pilen." },
            { sel: "#i-anker-rammer", titel: "Regnestykkerne", tekst: "Efter ε og c regner du videre til det, opgaven spørger om: massen i 1,00 L, koncentrationen før fortyndingen eller massen af kobber." },
            { sel: "#i-opgavekort", titel: "Opgaverne", tekst: "Tre prøver. Klik på en opgave for at skifte. ★ betyder løst uden fejl og uden at se svaret." }
        ],
        "fane-l": [
            { sel: "#l-skort", titel: "Kortet øverst", tekst: "Kortet stiller spørgsmålet til det trin, du er ved. Vælg et svar eller skriv et tal, og tryk Indsend svar." },
            { sel: "#l-anker-graf", titel: "Standardkurven", tekst: "Grafen har otte punkter. Det område, du vælger, bliver blåt. Når det lineære område er fundet, er punkterne uden for området orange." },
            { sel: "#l-tabelkort", titel: "Standardrækken", tekst: "Kopiér alle otte punkter til regnearket. Til ε bruger du kun punkterne i det lineære område." },
            { sel: "#l-anker-figur", titel: "Prøven", tekst: "Prilocain er trukket ud af en blodprøve og måles med UV-lys. Displayet viser prøvens absorbans." }
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

        NK.saetHTML("rv-titel", NK.Data.sub(NK.html(t.titel)));
        NK.saetHTML("rv-tekst", NK.Data.sub(NK.html(t.tekst)));
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

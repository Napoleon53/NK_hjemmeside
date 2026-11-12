/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb7.7 (og sb7.3, sb7.2, sb4.11, sb4.3, sc1.4, sc8.6,
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
            { sel: "#k-skort", titel: "Kortet øverst", tekst: "Al tekst står her. Flyt flasken, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#k-anker-skala", titel: "Skalaen", tekst: "Kₛ-skalaen står over pKₛ-skalaen. Farverne er bogens fire grupper fra stærke til meget svage syrer." },
            { sel: "#k-anker-hylde", titel: "Flasken", tekst: "Skiltet viser syrens Kₛ. Træk flasken op på skalaen, eller klik på skalaen. Piletasterne flytter flasken 0,1 i pKₛ." },
            { sel: "#k-anker-lup", titel: "Luppen", tekst: "Luppen viser 100 af syrens partikler i en 0,10 M opløsning. De blå partikler har afgivet deres hydron til vand, så der er dannet H₃O⁺." }
        ],
        "fane-r": [
            { sel: "#r-skort", titel: "Kortet øverst", tekst: "Kortet stiller spørgsmålet til det trin, du er ved. Vælg et svar eller skriv et tal, og tryk Indsend svar." },
            { sel: "#r-anker-reak", titel: "Reaktionen", tekst: "Syren afgiver en hydron til vand. Blå er syren og dens base, lilla er vand og oxoniumionen." },
            { sel: "#r-anker-ks", titel: "Kₛ-udtrykket", tekst: "Træk stofferne fra bakken op i brøken. Et klik på en plads tømmer den." },
            { sel: "#r-syrerkort", titel: "Syrerne", tekst: "Bogens elleve syrer. Klik på en syre for at regne på den. ★ betyder regnet uden fejl." }
        ],
        "fane-u": [
            { sel: "#u-skort", titel: "Kortet øverst", tekst: "Kortet fører dig gennem opklaringen. Skriv tallene i felterne, og tryk Indsend svar." },
            { sel: "#u-anker-maaler", titel: "pH-metret", tekst: "Kolben har en ukendt syre med en kendt koncentration. pH-metret måler pH, når du trykker Mål pH." },
            { sel: "#u-anker-skema", titel: "Reaktionsskemaet", tekst: "Syren afgiver en hydron til vand. Under stofferne kommer [H₃O⁺], [B] og [S] frem, når du har regnet dem." },
            { sel: "#u-anker-rammer", titel: "Kₛ og pKₛ", tekst: "Kₛ regnes med koncentrationerne fra skemaet. Tallene har samme farve som stofferne. Den gule ramme er det trin, du er ved." },
            { sel: "#u-flaskekort", titel: "Flaskerne", tekst: "Tre ukendte syrer. Flaske A har alle trin, og flaske B og C har færre trin." }
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

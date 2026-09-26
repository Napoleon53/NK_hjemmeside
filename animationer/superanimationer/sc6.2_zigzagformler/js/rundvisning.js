/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.1, sc1.2 og sc4.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Tavlen og
   papiret har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i opgavefane.js og sim_zigzag.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-zigzag": [
            { sel: "#zz-anker-papir", titel: "Opgaven", tekst: "Strukturformlen med alle atomer. Den grønne kæde kommer med hintet." },
            { sel: "#zz-anker-tavle", titel: "Tavlen", tekst: "Træk fra C-atomet for at tegne. Klik på en binding for dobbeltbinding. Højreklik på en ende sletter den." },
            { sel: "#zz-retning", titel: "Retningen", tekst: "Tegn zigzag ud fra strukturformlen, eller sæt C og H på en zigzag og skriv formlen." },
            { sel: "#zz-kort", titel: "Opgaven", tekst: "Tegningen tjekkes, når alle C-atomer er brugt. Knappen giver et hint og derefter svaret." },
            { sel: "#zz-serie", titel: "Serien", tekst: "Ti molekyler, der bliver sværere. Klik på et løst for at se det igen." },
            { sel: ".faneknapper", titel: "Fanerne", tekst: "Zigzag, Navne og Isomerer er quizzer. Hver klaret quiz giver et klistermærke til tegnebrættet. Opløselighed er et spil om vand og heptan." },
            { sel: "#tegnelink", titel: "Tegnebrættet", tekst: "Tegn frit til rapporten, med navne på stofferne. Klistermærkerne fra quizzerne ligger der." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Zigzagformler, navne og isomerer kort forklaret." }
        ],
        "fane-navne": [
            { sel: "#nv-retning", titel: "Retningen", tekst: "Byg molekylet ud fra navnet, eller skriv navnet på det, der står på tavlen." },
            { sel: "#nv-slags", titel: "Alkaner eller alkener", tekst: "Hver er en serie på ti. De sidste alkener har cis eller trans." },
            { sel: "#nv-anker-tavle", titel: "Tavlen", tekst: "Her tegner du, eller her står molekylet, du skal give navn." },
            { sel: "#nv-kort", titel: "Opgaven", tekst: "Et forkert svar giver en besked om fejlen. Knappen giver et hint og derefter svaret." }
        ],
        "fane-isomerer": [
            { sel: "#is-niveau", titel: "Formlen", tekst: "Fire formler med 2, 3, 5 og 9 isomerer." },
            { sel: "#is-anker-tavle", titel: "Tavlen", tekst: "Tegn et molekyle med formlen. Når alle C-atomer er brugt, får det navn." },
            { sel: "#is-liste-kort", titel: "Isomererne", tekst: "Et nyt navn kommer på listen. Samme navn er samme stof, bare tegnet anderledes." },
            { sel: "#is-kort", titel: "Hjælp", tekst: "Hintet siger, hvor lang hovedkæden er i en, der mangler. Derefter kan den vises." }
        ],
        "fane-oploeselighed": [
            { sel: "#op-anker-mol", titel: "Molekylet", tekst: "Træk det ned i bægerglasset. Du kan også klikke på et af lagene." },
            { sel: "#op-anker-glas", titel: "Bægerglasset", tekst: "Heptan øverst, vand nederst. Vælger du forkert, flytter molekylet selv over i det rigtige lag." },
            { sel: "#op-tegning", titel: "Tegningen", tekst: "Zigzag eller alle atomer. Det er det samme molekyle, tegnet på to måder." },
            { sel: "#op-kort", titel: "Opgaven", tekst: "Knappen giver et hint og derefter svaret. Rigtigt giver 100 point, 70 med hint." },
            { sel: "#op-bunke", titel: "Bunken", tekst: "15 molekyler, der bliver sværere, og tre liv. Klik på en prik for at se molekylet igen." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Reglen om C-atomer pr. polær gruppe." }
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

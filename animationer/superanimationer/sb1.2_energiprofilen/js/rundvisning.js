/* =====================================================================
   rundvisning.js - spotlight-rundvisningen bag ? (kopi af sc5.7's fil
   24. nov. 2026; kun TURE er ny). Ét element ad gangen paa den fane,
   man staar paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-profil": [
            { sel: "#profil-skort", titel: "Opgaven", tekst: "Kortet stiller ét spørgsmål ad gangen. Vælg et svar, og tryk Indsend svar." },
            { sel: "#profil-anker-profil", titel: "Energiprofilen", tekst: "Energien undervejs i reaktionen. For hvert trin, du klarer, kommer der mere frem på profilen." },
            { sel: "#profil-knap", titel: "Giv hint", tekst: "Sidder du fast, så tryk på knappen med den gule kant. Først får du hints, og til sidst kan du se svaret." },
            { sel: "#profil-raekke", titel: "Opgaverne", tekst: "En ny opgave åbner, når du kommer dertil. Start forfra giver trinene igen. I Fri leg kan du selv trække i toppen og i produkterne." },
            { sel: ".faneknapper", titel: "Temperaturen", tekst: "På fane 2 ser du, hvorfor reaktionen går hurtigere, når temperaturen stiger." }
        ],
        "fane-temp": [
            { sel: "#temp-skort", titel: "Opgaven", tekst: "Kortet stiller ét spørgsmål ad gangen. Beder kortet dig om at skrue på vandbadet, kommer − eller + frem." },
            { sel: "#temp-anker-bad", titel: "Vandbadet", tekst: "Glasset med thiosulfat og syre står i et vandbad. Displayet viser temperaturen." },
            { sel: "#temp-anker-graf", titel: "Kurven", tekst: "Hvor mange molekyler der har hvor meget bevægelsesenergi. Den stiplede streg er aktiveringsenergien, Eₐ." },
            { sel: "#temp-anker-lup", titel: "Luppen", tekst: "Kurven ved Eₐ er så lav, at den ikke kan ses. Luppen forstørrer den. Det orange areal er de molekyler, der har energi nok." },
            { sel: "#temp-raekke", titel: "Opgaverne", tekst: "En ny opgave åbner, når du kommer dertil. I Fri leg kan du selv skrue på vandbadet." }
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

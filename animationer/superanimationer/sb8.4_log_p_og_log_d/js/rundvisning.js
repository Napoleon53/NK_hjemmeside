/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb7.7 (og sb7.3, sb7.2, sb4.11, sb4.3, sc1.4,
   sc8.6, sc7.5, sc4.4 og sb4.8); kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-p": [
            { sel: "#p-skort", titel: "Kortet øverst", tekst: "Al tekst står her. Gør det, kortet siger, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#p-anker-tragt", titel: "Skilletragten", tekst: "Octan-1-ol ligger øverst og vand nederst. Klik på skilletragten for at ryste den." },
            { sel: "#p-anker-lup", titel: "Luppen", tekst: "Luppen viser lige store rumfang af de to lag. Hver orange kugle er et molekyle af stoffet." },
            { sel: "#p-anker-kasse", titel: "Regnestykket", tekst: "Formlen for fordelingskonstanten. Det, du regner ud, bliver skrevet her." },
            { sel: "#p-trinkort", titel: "Trinnene", tekst: "Fanen har fire trin. Knappen Begynd forfra står nederst i panelet." }
        ],
        "fane-d": [
            { sel: "#d-skort", titel: "Kortet øverst", tekst: "Kortet stiller opgaverne. Træk i skyderen, vælg et svar, eller skriv et tal, og tryk Indsend svar." },
            { sel: "#d-anker-lup", titel: "Luppen", tekst: "Grå kugler er den uladede syre HA, og blå kugler er ionen A⁻. Ionen går ikke over i octan-1-ol." },
            { sel: "#d-anker-graf", titel: "Kurven", tekst: "Kurven viser log D og bliver tegnet dér, hvor skyderen har været. Prikken viser log D ved skyderens pH." },
            { sel: "#d-anker-skyder", titel: "pH-skyderen", tekst: "Skyderen bestemmer vandlagets pH. Den har samme pH-akse som kurven." }
        ],
        "fane-b": [
            { sel: "#b-skort", titel: "Kortet øverst", tekst: "Kortet stiller opgaverne. Træk i skyderen, vælg et svar, eller skriv et tal, og tryk Indsend svar." },
            { sel: "#b-anker-lup", titel: "Luppen", tekst: "Grå kugler er den uladede base B, og røde kugler er ionen BH⁺. Ionen går ikke over i octan-1-ol." },
            { sel: "#b-anker-graf", titel: "Kurven", tekst: "Kurven for basen bliver tegnet dér, hvor skyderen har været. Syrens kurve fra fane 2 står svagt bagved." },
            { sel: "#b-anker-skyder", titel: "pH-skyderen", tekst: "Skyderen bestemmer vandlagets pH. Den har samme pH-akse som kurven." },
            { sel: "#b-trinkort", titel: "Trinnene", tekst: "Fanen har fire trin. Knappen Begynd forfra står nederst i panelet." }
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

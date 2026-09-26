/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa den anden fane. Samme kode
   som i sc1.1, sc4.5 og sc8.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-ug": [
            { sel: "#ug-anker-bord", titel: "Urglasset", tekst: "Ét urglas med kaliumpermanganat gjort basisk. Træk flasken med natriumsulfit hen over glasset. Til sidst skal der svovlsyre i." },
            { sel: "#ug-haefte", titel: "Hæftet", tekst: "Her afstemmer du, som du ville gøre i hånden: oxidationstal over atomerne og klammer under skemaet med ↑ og ↓ under pilen." },
            { sel: "#ug-anker-lup", titel: "Luppen", tekst: "Når du skriver gangetallene, viser luppen elektronerne. Går de op, flytter elektronerne over." },
            { sel: "#ug-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu, og hvad der gik galt. Knappen giver et hint og derefter svaret." },
            { sel: "#ug-farvekortet", titel: "Farvekortet", tekst: "Farven viser, hvad mangan er blevet til. Oxidationstallet kommer på, når du har fundet det." },
            { sel: "#ug-opgaver", titel: "Reaktionerne", tekst: "Tre reaktioner i samme glas. Den næste åbner, når skemaet er afstemt. En reaktion uden Vis svaret giver en stjerne." },
            { sel: "#ug-anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Trykker du Giv hint, siger han kort, hvad du kan gøre. Læs mere viser hans grundige forklaring." },
            { sel: "#ug-kknap", titel: "Send ham ud", tekst: "Så står hintene i opgavekortet i stedet. Samme knap henter ham igen." },
            { sel: ".faneknapper", titel: "Flere reaktioner", tekst: "Den anden fane har 14 reaktioner mere med permanganat, afstemt på samme måde." }
        ],
        "fane-fl": [
            { sel: "#fl-anker-bord", titel: "Urglasset", tekst: "Et andet stof står i glasset. Træk flasken med kaliumpermanganat hen over glasset, og se, hvad der sker med farven." },
            { sel: "#fl-haefte", titel: "Hæftet", tekst: "Samme metode som på den første fane. Står et grundstof ikke lige mange gange på begge sider, sætter du først et tal foran." },
            { sel: "#fl-anker-lup", titel: "Luppen", tekst: "Viser elektronerne med de gangetal, du skriver." },
            { sel: "#fl-kort", titel: "Opgaven", tekst: "Linjen i kortet siger, hvad du skal nu. Knappen giver et hint og derefter svaret." },
            { sel: "#fl-opgaver", titel: "Reaktionerne", tekst: "Surt miljø, basisk miljø og reaktioner med indekstal. Den første er den fra titreringen af jern." },
            { sel: "#fl-forfra", titel: "Start forfra", tekst: "Samme reaktion med et frisk glas og et tomt hæfte." }
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

/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa traeningen. Samme kode som
   i sc6.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (partiklerne, skemaet, ligningen og brikkerne) har et
   usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-hydron": [
            { sel: "#hydron-anker-mol", titel: "Partiklerne", tekst: "To partikler med deres frie elektronpar (de gule prikker). Tag fat i et H, og slip det på den anden partikel." },
            { sel: "#hydron-anker-skema", titel: "Reaktionsskemaet", tekst: "Produkterne kommer, når hydronen er flyttet. Klammerne viser de to syre-basepar." },
            { sel: "#hydron-kort", titel: "Reaktionen", tekst: "Ti reaktioner. Klik på et tal for at springe. Knappen giver et hint og derefter svaret." },
            { sel: "#hydron-par-kort", titel: "Syre-basepar", tekst: "Parrene fra de reaktioner, du har løst. Blå: syren og dens korresponderende base. Lilla: basen og dens korresponderende syre." },
            { sel: "#hydron-forfra", titel: "Start forfra", tekst: "Alle ti reaktioner forfra." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Syre, base, hydron og korresponderende par kort forklaret." },
            { sel: ".faneknapper", titel: "Træning", tekst: "Fane 2 og 3 har nye reaktioner, så længe du vil: skriv produkterne, eller find parrene." }
        ],
        "fane-produkter": [
            { sel: "#prod-anker-lign", titel: "Reaktionen", tekst: "To reaktanter og to tomme pladser efter pilen." },
            { sel: "#prod-anker-brikker", titel: "Formlerne", tekst: "Træk de to produkter op på pladserne, eller klik på dem. Et forkert svar forklares." },
            { sel: "#prod-niveau", titel: "Sværhedsgrad", tekst: "Let: med vand. Middel: syre og base. Svær: amfolytter og flere hydroner. Gælder også fane 3." },
            { sel: "#prod-kort", titel: "Opgaven", tekst: "Tæller, hvor mange du har i træk uden fejl. Knappen giver et hint og derefter svaret." }
        ],
        "fane-par": [
            { sel: "#par-anker-lign", titel: "Reaktionen", tekst: "En hel reaktion. Under hver formel er der plads til et mærkat." },
            { sel: "#par-anker-brikker", titel: "Mærkaterne", tekst: "Træk hvert mærkat hen under sin formel, eller klik på mærkatet og så på formlen. Korresp. betyder korresponderende." },
            { sel: "#par-niveau", titel: "Sværhedsgrad", tekst: "Samme tre niveauer som fane 2." },
            { sel: "#par-kort", titel: "Opgaven", tekst: "Tæller, hvor mange du har i træk uden fejl. Knappen giver et hint og derefter svaret." }
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

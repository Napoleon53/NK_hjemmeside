/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc4.4, sc1.4, sc8.6 og sc7.5; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-d": [
            { sel: "#d-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Den gule knap giver ét hint ad gangen og til sidst svaret. Der er fem opgaver, én for hvert glas." },
            { sel: "#d-anker-glas", titel: "De fem glas", tekst: "Som i øvelse 4.6b: et fedtstof opløst i heptan i glas 1 til 4 og kun heptan i glas 5. Pipetten hænger over det glas, opgaven handler om. Klik på pipetten for at dryppe én dråbe bromvand i." },
            { sel: "#d-anker-lup", titel: "Luppen", tekst: "Luppen viser det øverste lag i glasset helt tæt på: to fedtstofmolekyler og dibrom fra dråberne. Klik på en kæde eller et dibrommolekyle for at se, hvad det er." },
            { sel: "#d-skemakort", titel: "Skemaet", tekst: "Her står antallet af dråber for hvert glas, når du har indsendt det." }
        ],
        "fane-m": [
            { sel: "#m-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Der er fire opgaver, én for hvert fedtstof." },
            { sel: "#m-anker-tavle", titel: "Tavlen", tekst: "Fedtstoffet er tegnet som i bogen: glycerol til venstre og tre fedtsyrer som zigzag. Klik på en binding for at markere den, og klik igen for at fjerne markeringen." },
            { sel: "#m-fedtkort", titel: "Fedtsyrerne", tekst: "Her står fedtsyrernes navne og, når du har fundet dem, antallet af dobbeltbindinger mellem to carbonatomer (C=C)." }
        ],
        "fane-u": [
            { sel: "#u-skort", titel: "Kortet øverst", tekst: "Al tekst står her: opgaven, spørgsmålene, forklaringen og hintene. Der er fire opgaver, én for hver flaske." },
            { sel: "#u-anker-glas", titel: "De fire flasker", tekst: "Hver flaske har et ukendt fedtstof opløst i heptan. Klik på pipetten for at dryppe bromvand i den flaske, opgaven handler om." },
            { sel: "#u-deklkort", titel: "Varedeklarationerne", tekst: "Fire fedtstoffer og deres andel af mættede, monoumættede og polyumættede fedtsyrer. Brug dem til at finde fedtstoffet i hver flaske." },
            { sel: "#u-skemakort", titel: "Flaskerne", tekst: "Antallet af dråber for hver flaske og, når du har fundet det, fedtstoffets navn. Luppen viser en flaske, når fedtstoffet er fundet." }
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

/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb4.11 og sb4.3 (og sc1.4, sc8.6, sc7.5, sc4.4 og sb4.8); kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-k": [
            { sel: "#k-skort", titel: "Kortet øverst", tekst: "Al tekst står her. Klik på atomerne på tavlen eller vælg et svar, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#k-anker-tavle", titel: "Syren og alkoholen", tekst: "Syren er grøn, og alkoholen er orange, som i bogen. Hydrogenatomerne på OH-grupperne er tegnet med. Esteren beholder farverne, så du kan se, hvor hver del kommer fra." },
            { sel: "#k-opgaver", titel: "Reaktionerne", tekst: "Tre reaktioner. Klik på en af dem for at begynde forfra med den. En løst reaktion får et flueben og en stjerne, hvis den blev løst uden fejl." }
        ],
        "fane-t": [
            { sel: "#t-skort", titel: "Kortet øverst", tekst: "Opgaven og spørgsmålene står her. Tryk Indsend svar, når du er klar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#t-vaerktoej", titel: "Værktøjerne", tekst: "C: træk fra et atom for at tegne en kæde. O: klik på et carbonatom for at gøre det til O. =O: klik på et carbonatom for at sætte et dobbeltbundet O på. Højreklik sletter." },
            { sel: "#t-anker-tavle", titel: "Tavlen", tekst: "Tegn esteren her. Knappen Indsend svar viser molekylformlen for din tegning." },
            { sel: "#t-opgaver", titel: "Opgaverne", tekst: "Let: formlerne står på tavlen. Middel: kun navnene. Svær: esteren står på tavlen, og du finder syren og alkoholen." },
            { sel: "#t-stammer", titel: "Stammerne", tekst: "Antallet af carbonatomer i en kæde giver navnets stamme." }
        ],
        "fane-s": [
            { sel: "#s-skort", titel: "Kortet øverst", tekst: "Ét spørgsmål ad gangen. Nogle gange passer flere svar. Når svaret er rigtigt, sætter knappen på kortet det næste skridt i gang." },
            { sel: "#s-anker-tragt", titel: "Skilletragten", tekst: "Lagene i skilletragten. Esteren ligger i det øverste lag, og vandfasen nederst tappes af gennem hanen." },
            { sel: "#s-anker-lup", titel: "Luppen", tekst: "Molekylerne i hvert lag. Syren er grøn, alkoholen orange og esteren begge dele, som i bogen. Det, kortet spørger om, har en gul ring." },
            { sel: "#s-trin", titel: "Trinene", tekst: "To vaske og to spørgsmål om det, der sker. Begynd forfra med knappen nedenunder." }
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

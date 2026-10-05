/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4 og sc8.6; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-u": [
            { sel: "#u-montre", titel: "Udstillingen", tekst: "Otte sten på to hylder. Klik på en sten for at arbejde med den." },
            { sel: ".hy-braet", titel: "Hylderne", tekst: "Stenene er ordnet efter den negative ion: sulfider har S²⁻, oxider har O²⁻. Det er din vigtigste oplysning." },
            { sel: "#u-skilt", titel: "Skiltet", tekst: "Stenens formel. Skriv oxidationstallet i feltet over atomet. Et tal med blyant er givet." },
            { sel: "#u-taster", titel: "Tasterne", tekst: "Et klik skriver tallet i det gule felt. Du kan også skrive +2 eller +II på tastaturet og trykke Enter." },
            { sel: "#u-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#u-trappekort", titel: "Trappen", tekst: "Hver løst sten får en prik ved det oxidationstal, svovl eller jern har i den." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Pyrit viser, hvad der sker, når pyrit møder luft og vand. Ristning handler om zinkblende og cinnober." }
        ],
        "fane-p": [
            { sel: "#p-strimmel", titel: "Bækken", tekst: "En klippe med pyrit i regn og luft. Vandet skifter farve, og pH falder, når du har afstemt et skema." },
            { sel: "#p-papir", titel: "Hæftet", tekst: "Skemaet afstemmes i små bidder. Linjen øverst på papiret siger helt kort, hvad du skal nu." },
            { sel: "#p-status", titel: "Linjen forneden", tekst: "Det næste skridt i hele sætninger. Tjek prøver dit svar, og den gule knap giver ét hint ad gangen." },
            { sel: "#p-kort", titel: "Opgaven", tekst: "Opgaven og de bidder, du har klaret." },
            { sel: "#p-skemakort", titel: "Skemaerne", tekst: "De skemaer, du har afstemt, bliver stående her." },
            { sel: "#p-opgaver", titel: "Opgaverne", tekst: "Fire opgaver efter hinanden. Den næste åbner, når den før er løst." }
        ],
        "fane-r": [
            { sel: "#r-strimmel", titel: "Tegningen", tekst: "Risteovnen før og efter reaktionen. I den sidste opgave er det regn over en statue af marmor." },
            { sel: "#r-papir", titel: "Hæftet", tekst: "Samme fremgangsmåde som på fane 2. Her er der ingen ioner, så ladningen er 0 hele vejen." },
            { sel: "#r-status", titel: "Linjen forneden", tekst: "Det næste skridt i hele sætninger, og knappen med hint." },
            { sel: "#r-opgaver", titel: "Opgaverne", tekst: "Tre reaktioner. Du kan tage dem i den rækkefølge, du vil." }
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

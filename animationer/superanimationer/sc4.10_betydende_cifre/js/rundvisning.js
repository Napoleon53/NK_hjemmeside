/* =====================================================================
   rundvisning.js - spotlight-rundvisning på hjælpeknappen

   Viser rundt på den fane, man står på: ét element ad gangen med en
   kort tekst. Samme kode som i sc8.4; kun TURE er ny.

   Hvert trin er en CSS-selector (kan være flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TAVLE_TAEL = { sel: "#tavle", titel: "Tavlen", tekst: "Tallet i opgaven. Klik på de cifre, der er betydende. Et klik mere fjerner dem igen." };
    var TAVLE = { sel: "#tavle", titel: "Tavlen", tekst: "Tallet i opgaven. Du kan klikke på cifrene for at tælle dem. Når svaret er rigtigt, viser tavlen hvorfor." };
    var TJEK_TAEL = { sel: "#svarrad", titel: "Tjek", tekst: "Her står, hvor mange cifre du har valgt. Tryk Tjek, eller Enter." };
    var SVAR = { sel: "#svarrad", titel: "Svaret", tekst: "Skriv tallet med komma, og tryk Tjek eller Enter. En eksponent skrives i det lille felt ved 10-tallet; ± skifter fortegnet." };
    var LINJE = { sel: "#besked", titel: "Linjen", tekst: "Her står, hvad der gik galt, og hvorfor et svar er rigtigt." };
    var KORT = { sel: "#opgavekort", titel: "Opgaven", tekst: "Ti opgaver i en runde. Knappen giver først et hint, så svaret og til sidst en ny opgave." };
    var VAELG_AFRUND = { sel: "#vaelgere", titel: "To slags opgaver", tekst: "Måletal, der skal afrundes, eller regnestykker, hvor svaret skal afrundes. Et skift starter en ny runde." };
    var VAELG_KOMMA = { sel: "#vaelgere", titel: "To slags opgaver", tekst: "Videnskabelig notation begge veje, eller enheder for volumen, masse, stofmængde, koncentration og tryk. Et skift starter en ny runde." };
    var RUNDE = { sel: "#rundekort", titel: "Runden", tekst: "De løste opgaver med facit. Grøn er rigtigt i første forsøg, gul med hjælp og rød, når svaret blev vist." };
    var LAERER = { sel: "#anker-laerer", titel: "Kemichael", tekst: "Han blander sig ikke. Han giver hintet, når du trykker Giv hint, og tier, når opgaven er løst." };
    var KKNAP = { sel: "#kknap", titel: "Send ham ud", tekst: "Så står hintene i linjen under svarfeltet i stedet. Samme knap henter ham igen." };
    var FANER = { sel: ".faneknapper", titel: "De andre faner", tekst: "Flyt kommaet, Afrund og Blandet, hvor alle slags opgaver er med." };

    var TURE = {
        "tael": [TAVLE_TAEL, TJEK_TAEL, LINJE, KORT, RUNDE, LAERER, KKNAP, FANER],
        "afrund": [TAVLE, SVAR, LINJE, KORT, VAELG_AFRUND, RUNDE],
        "komma": [TAVLE, SVAR, LINJE, KORT, VAELG_KOMMA, RUNDE],
        "blandet": [TAVLE, SVAR, LINJE, KORT, RUNDE]
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

    function start(niveauId) {
        var liste = TURE[niveauId];
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

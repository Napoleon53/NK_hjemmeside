/* =====================================================================
   rundvisning.js - spotlight-rundvisning på hjælpeknappen

   Viser rundt på den sværhedsgrad, man står på: ét element ad gangen
   med en kort tekst. Samme opbygning som i sc2.4.

   Hvert trin er en CSS-selector (kan være flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var SPM = { sel: "#opgavelinje, .ab-hoved", titel: "Opgaven", tekst: "Øverst står opgaven. Linjen under den siger, hvad trinnet spørger om." };
    var TAVLE = { sel: "#tavle", titel: "Tavlen", tekst: "Reaktionen, der skal afstemmes. Oxidationstallene og koefficienterne skrives direkte i felterne her." };
    var TASTER = { sel: "#taster", titel: "Tasterne", tekst: "Klik på et felt, og vælg tallet her. Du kan også skrive på tastaturet." };
    var KONTROL = { sel: "#kontrol", titel: "Kontrollen", tekst: "Tallene, der skal være ens. De følger med, mens du skriver, og bliver grønne, når de passer." };
    var KNAPPER = { sel: ".ab-knapper", titel: "Tjek og hint", tekst: "Tjek svaret her. Sidder du fast, giver den gule knap først et hint, så svaret og til sidst en ny opgave." };
    var OPGAVE = { sel: "#opgavekort", titel: "Trinene", tekst: "De samme syv trin hver gang. Det blå trin er det, du er nået til." };
    var LISTE = { sel: "#listekort", titel: "Reaktionerne", tekst: "Alle reaktioner på denne sværhedsgrad. Grøn er løst, gul betyder, at svaret blev vist." };
    var VAEGT = { sel: "#vaegtknap", titel: "Elektronvægten", tekst: "Slå vægten til, hvis du vil se elektronerne blive vejet. Den står lige, når der afgives lige så mange, som der optages." };
    var NIVEAU = { sel: ".niveauvalg", titel: "Sværhedsgraderne", tekst: "Let har ingen ilt. Middel foregår i surt miljø. Svær har basisk miljø, H⁺ efter pilen og grundstoffer, der både oxideres og reduceres." };

    /* Et trin, der ikke kan ses lige nu (tasterne i trin 2, en tom
       kontrol), springes over. */
    var TURE = {
        "let": [SPM, TAVLE, TASTER, KONTROL, KNAPPER, OPGAVE, LISTE, VAEGT, NIVEAU],
        "middel": [SPM, TAVLE, TASTER, KONTROL, KNAPPER, OPGAVE, LISTE, VAEGT],
        "svaer": [SPM, TAVLE, TASTER, KONTROL, KNAPPER, OPGAVE, LISTE, VAEGT]
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
        /* Kun det, der kan ses nu, så tallet passer, og Forrige virker */
        trin = liste.filter(function (t) { return !!samletRect(t.sel); });
        if (!trin.length) return;
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

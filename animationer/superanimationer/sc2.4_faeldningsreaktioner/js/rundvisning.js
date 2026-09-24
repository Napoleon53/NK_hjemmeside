/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa det niveau, man staar paa: ét element ad gangen med
   en kort tekst. Samme opbygning som i sc1.1.

   Hvert trin er en CSS-selector (kan vaere flere, kommasepareret) plus
   en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TABEL = { sel: "#tabelkort", titel: "Fældningstabellen", tekst: "Find rækken med den positive ion og søjlen med den negative. L er letopløseligt, T er tungtopløseligt." };
    var OPGAVE = { sel: "#opgavekort", titel: "Opgaven", tekst: "Opgaven og de fire trin er de samme på alle sværhedsgrader. Knappen giver først et hint, så svaret og til sidst en ny opgave." };

    var TURE = {
        "tabel": [
            { sel: "#baeger-omraade", titel: "De to opløsninger", tekst: "Ionerne svømmer rundt hver for sig. Når glassene hældes sammen, kan de finde nye partnere." },
            { sel: "#tavle", titel: "Skemaet", tekst: "Her står de to salte og deres ioner. De nye par, du finder, kommer frem efter pilen." },
            TABEL,
            OPGAVE,
            { sel: ".niveauvalg", titel: "Sværhedsgraderne", tekst: "Samme opgave og samme fire trin. På Let vises ionerne, formlen og ionskemaet for dig. På Middel vælger du svarene, og på Svær skriver du dem selv." }
        ],
        "vaelg": [
            { sel: "#tavle", titel: "Skemaet", tekst: "Reaktionen bygges op her, ét trin ad gangen." },
            { sel: "#ab-valg", titel: "Svarmulighederne", tekst: "De forkerte svar er fejl, som elever tit laver. Vælger du et, får du at vide hvorfor." },
            TABEL,
            OPGAVE
        ],
        "skriv": [
            { sel: "#tavle", titel: "Skrivefelterne", tekst: "Tal efter et symbol bliver sænket af sig selv, og store og små bogstaver rettes. Skriv + eller − til sidst for ladningen: po43- bliver til PO₄³⁻." },
            { sel: "#ab-valg", titel: "Værktøjet", tekst: "Ladningsknapperne sætter ladningen på det felt, du står i." },
            { sel: "#tjek", titel: "Tjek", tekst: "Tjekker dit svar. Enter i et felt gør det samme." },
            TABEL,
            OPGAVE
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

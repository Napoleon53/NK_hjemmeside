/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc4.4 og sc7.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_titrering.js, sim_beregning.js og sim_forbrug.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-titrering": [
            { sel: "#tit-anker-kolbe", titel: "Kolben", tekst: "2,00 g eddike, 20 mL vand og phenolphthalein. Den er farveløs, så længe der er syre tilbage." },
            { sel: "#tit-anker-buret", titel: "Buretten", tekst: "Natriumhydroxid, NaOH, 0,100 M. Den tæller oppefra: 0 står øverst." },
            { sel: "#tit-anker-hane", titel: "Hanen", tekst: "Træk skyderen for at åbne hanen. Dryp til sidst, eller brug knappen til én dråbe." },
            { sel: "#tit-anker-lup", titel: "Luppen", tekst: "Syren i kolben som 8 figurer. Hver OH⁻, der kommer ned, tager en H⁺ fra en CH₃COOH." },
            { sel: "#tit-kort", titel: "Prøven", tekst: "Luk hanen, når kolben bliver lyserød, og skriv så forbruget. Knappen giver et hint og derefter svaret." },
            { sel: "#tit-buretkort", titel: "Aflæsningen", tekst: "Buretten ved menisken. Aflæs bunden af menisken." },
            { sel: "#tit-kurvekort", titel: "Kurven", tekst: "pH i kolben, mens der løber NaOH ned. Tabellen kan kopieres til Excel." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Reaktionen, omslaget og beregningen kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Beregningen: fra forbruget til masseprocenten. To kolber: hvad ændrer resultatet?" }
        ],
        "fane-beregning": [
            { sel: "#ber-data", titel: "Målingen", tekst: "Din aflæsning fra titreringen, eller en klassekammerats." },
            { sel: "#ber-kort", titel: "De fire trin", tekst: "Skriv først formlen og så tallet. Knappen giver et hint og derefter svaret." },
            { sel: "#ber-anker-tavle", titel: "Tavlen", tekst: "Formlen kommer på tavlen, når du har skrevet den, og tallene, når trinnet er løst." }
        ],
        "fane-forbrug": [
            { sel: "#for-anker-a", titel: "Kolbe A", tekst: "Som på fane 1: 2,00 g eddike, 20 mL vand og 0,100 M NaOH." },
            { sel: "#for-anker-b", titel: "Kolbe B", tekst: "Én ting er ændret. Skiltet på bordet siger hvad." },
            { sel: "#for-kort", titel: "Dit gæt", tekst: "Gæt først. Så titreres begge kolber til omslaget." },
            { sel: "#for-tabelkort", titel: "Kolberne", tekst: "Hvor mange mL NaOH der gik til, og den masseprocent, man ville regne ud." }
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

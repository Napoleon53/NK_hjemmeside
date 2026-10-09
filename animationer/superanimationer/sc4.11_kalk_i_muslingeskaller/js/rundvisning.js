/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc4.5 og sc5.1; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-forsoeg": [
            { sel: "#forsoeg-kort", titel: "Kortet", tekst: "Kortet siger hele tiden, hvad du skal nu: først et gæt, så de fire skridt i målingen. Forklaringen kommer også på kortet." },
            { sel: "#forsoeg-anker-baad", titel: "Vejebåden", tekst: "Vægten viser massen af pulveret. Klik på vægten for at aflæse m(før). Klik så på pulveret: hver gang kommer en spatelfuld i kolben." },
            { sel: "#forsoeg-anker-kolbe", titel: "Kolben", tekst: "20 mL saltsyre på en vægt, der er sat til 0,00 g. Når pulveret er i, falder vægten, fordi CO₂ forsvinder op i luften. Klik på vægten, når den står stille." },
            { sel: "#forsoeg-knap", titel: "Den gule knap", tekst: "Sidder du fast, så tryk på den gule knap. Først får du et hint, og et tryk mere viser svaret." },
            { sel: "#forsoeg-forfra", titel: "Start forfra", tekst: "En ny kolbe med saltsyre og den samme prøve, hvis noget gik galt." },
            { sel: "#forsoeg-skema", titel: "Skemaet", tekst: "m(før) og m(efter) for begge målinger. Tallene skrives, når du klikker på vægten, og de bruges på fanen Beregningen." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Beregningen: fra CO₂ til kalkindholdet. Fejlkilder: hvad sker der, når noget går galt?" }
        ],
        "fane-beregning": [
            { sel: "#beregning-anker-tavle", titel: "Tavlen", tekst: "Reaktionen, opgavens tal og beregningerne. En beregning står der, når den er rigtig." },
            { sel: "#beregning-raekker", titel: "Formlen og tallet", tekst: "Hvert trin har to dele: først formlen, så tallet. Kun det trin, du er ved, er åbent." },
            { sel: "#beregning-knap", titel: "Den gule knap", tekst: "Først et hint, og et tryk mere viser svaret." },
            { sel: "#beregning-anker-kaede", titel: "Kæden", tekst: "CO₂, kalken og prøven. Den bliver udfyldt, efterhånden som du regner." },
            { sel: ".niveau", titel: "Uden mol eller med mol", tekst: "Uden mol vælger du formlen blandt tre og ganger med 2,27. Med mol skriver du selv formlerne, og vejen går over stofmængden." },
            { sel: "#beregning-opsum", titel: "Opsummeringen", tekst: "Vejledningens skema for de to målinger." }
        ],
        "fane-fejl": [
            { sel: "#fejl-kort", titel: "Gæt først", tekst: "Kortet siger, hvad gruppe B gør anderledes. Får de et højere eller et lavere kalkindhold end gruppe A? Så laver begge grupper forsøget." },
            { sel: "#fejl-anker-a", titel: "Gruppe A", tekst: "Følger vejledningen: 1,00 g tørt pulver lidt ad gangen i 20 mL saltsyre." },
            { sel: "#fejl-anker-b", titel: "Gruppe B", tekst: "Gør én ting anderledes. Kalkindholdet står under kolben, når forsøget er slut." },
            { sel: "#fejl-resultat", titel: "Resultaterne", tekst: "Det, de to grupper skriver, og det, de regner ud." },
            { sel: "#fejl-opgaver", titel: "Fejlkilderne", tekst: "Seks ting, der kan gå galt. Et rigtigt gæt første gang giver en stjerne." }
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

/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc4.1 og sc4.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i sim_hotdog.js, sim_molekyler.js og sim_regn.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-hotdog": [
            { sel: "#hotdog-anker-skilt", titel: "Opskriften", tekst: "Hvad én ret skal have. Tallene er opskriftens forhold, fx 1 : 1 : 2." },
            { sel: "#hotdog-anker-bon", titel: "Bonen", tekst: "Ordren, du skal lave. Den bliver stemplet, når kunden er tilfreds." },
            { sel: "#hotdog-anker-beholdere", titel: "Beholderne", tekst: "Træk en ting hen på brættet. Et klik virker også." },
            { sel: "#hotdog-anker-braet", titel: "Skærebrættet", tekst: "Plads til 12 af hver ting. Klik på en ting for at lægge den tilbage." },
            { sel: "#hotdog-anker-klokke", titel: "Klokken", tekst: "Ring, når brættet er klar. Så samles retterne efter opskriften, og overskuddet bliver liggende." },
            { sel: "#hotdog-kort", titel: "Ordren", tekst: "Knappen giver et hint og derefter svaret." },
            { sel: "#hotdog-ordrer", titel: "Ordrerne", tekst: "Seks med hotdogs og fire med dobbeltburgere. Klik for at springe til dem, eller vælg frit." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Ækvivalente mængder kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Molekylerne: samme slags opskrift med molekyler og mol. Tavlen: regn stofmængderne ud." }
        ],
        "fane-molekyler": [
            { sel: "#molekyler-anker-skilt", titel: "Reaktionsskemaet", tekst: "Koefficienterne og lige så mange figurer under hver formel." },
            { sel: "#molekyler-anker-plakat", titel: "Plakaten", tekst: "Hvad én figur er: ét molekyle eller 1 mol molekyler." },
            { sel: "#molekyler-anker-kasser", titel: "Kasserne", tekst: "Træk en figur ind i kammeret. Et klik på kassen virker også." },
            { sel: "#molekyler-anker-kammer", titel: "Kammeret", tekst: "Tryk på Start. Figurerne reagerer i hele sæt efter skemaet. Overskuddet får en orange ring." },
            { sel: "#molekyler-maaling", titel: "I kammeret", tekst: "Hvor meget der er af hvert stof før og efter reaktionen." },
            { sel: "#molekyler-kort", titel: "Målene", tekst: "Fem mål. Knappen giver et hint og derefter svaret." }
        ],
        "fane-regn": [
            { sel: "#regn-anker-skema", titel: "Skemaet", tekst: "På Svær skriver du selv koefficienterne først." },
            { sel: "#regn-anker-soejler", titel: "Søjlerne", tekst: "De stiplede blokke er koefficienterne. Den grønne søjle er den kendte stofmængde. Et rigtigt svar fylder netop sine blokke." },
            { sel: "#regn-felter", titel: "Felterne", tekst: "Skriv stofmængden i mol under hver formel, og tryk Enter." },
            { sel: "#regn-kort", titel: "Opgaven", tekst: "Knappen giver et hint og derefter svaret." },
            { sel: "#regn-beregninger", titel: "Beregningerne", tekst: "Når et svar er rigtigt, står beregningen her, som den skal skrives." },
            { sel: "#regn-fremskridt", titel: "Opgaverne", tekst: "En opgave, du løser uden at se svaret, får en stjerne. Klik på et niveau for at tage dets næste opgave." }
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

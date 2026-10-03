/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-r": [
            { sel: "#r-anker-roer", titel: "Rørene", tekst: "To vandrør, skruet sammen på midten og skåret igennem, så vandet og rørenes væg kan ses." },
            { sel: "#r-valg-v, #r-valg-h", titel: "Metallet", tekst: "Vælg, hvad hvert rør er lavet af: kobber, jern eller zink." },
            { sel: "#r-vaerktoej", titel: "Tiden", tekst: "Lad tiden gå lader 20 år gå. Går der hul på et rør, standser tiden." },
            { sel: "#r-anker-lup", titel: "Luppen", tekst: "Atomerne i rørenes væg ved samlingen, med vandet over. De gule kugler er elektroner." },
            { sel: "#r-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#r-kort", titel: "Opgaven", tekst: "Fem mål, ét ad gangen. Nogle begynder med et gæt." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Skibet handler om offeranoder. Rusten viser, hvordan jern ruster, med reaktionsskemaer." }
        ],
        "fane-s": [
            { sel: "#s-anker-kaj", titel: "Kajen", tekst: "Klodser af zink, magnesium og kobber. Træk en klods ned på skroget." },
            { sel: "#s-anker-pladser", titel: "Pladserne", tekst: "To pladser til klodser på skroget. Et klik på en klods tager den af igen." },
            { sel: "#s-anker-propel", titel: "Propellen", tekst: "Propellen er af bronze, som mest er kobber. Den sidder på skroget, der er af jern." },
            { sel: "#s-vaerktoej", titel: "Tiden", tekst: "Sejl 1 år lader et år gå. De gule kugler er elektroner, og ionerne går ud i havvandet." },
            { sel: "#s-skibkort", titel: "Skibet", tekst: "Hvor meget skroget er rustet, og hvor meget der er tilbage af hver klods." },
            { sel: "#s-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu. På værft giver et nyt skrog uden klodser." }
        ],
        "fane-j": [
            { sel: "#j-anker-draabe", titel: "Dråben", tekst: "En dråbe vand på en jernplade, set helt tæt på. Klik på en partikel for at se, hvad den er." },
            { sel: "#j-kontakter", titel: "Kontakterne", tekst: "Slå vandet og ilten til og fra. Kontakten Salt kommer frem i den sidste opgave." },
            { sel: "#j-anker-plade", titel: "Pladen", tekst: "Den samme plade i almindelig størrelse, og hvor mange jernatomer der har forladt den." },
            { sel: "#j-tavle", titel: "Tavlen", tekst: "Skriv tallene i felterne, og tryk på Tjek. Enter gør det samme." },
            { sel: "#j-status", titel: "Linjen forneden", tekst: "Passer skemaet ikke, står der her, hvad der skal tælles igen. Knappen giver ét hint ad gangen." },
            { sel: "#j-forsoegkort", titel: "Vand og ilt", tekst: "Skemaet husker, hvilke af de fire muligheder du har prøvet." }
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

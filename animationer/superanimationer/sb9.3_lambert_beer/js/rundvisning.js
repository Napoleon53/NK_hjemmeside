/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sb2.1 og sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-lys": [
            { sel: "#lys-spm, #lys-valg", titel: "Forudsigelsen", tekst: "Spørgsmålet og tre svar. Gæt først ved at klikke på det svar, du tror på. Så prøver du det selv." },
            { sel: "#lys-laerred", titel: "Kuvetten i lyset", tekst: "Lampen sender lys med én bølgelængde gennem kuvetten. Prikkerne er fotoner. Kurven over strålen viser, hvor meget lys der er tilbage. Træk i grebet på kuvettens højre side for at gøre den bredere." },
            { sel: "#lys-skruer", titel: "Skyderne", tekst: "Her ændrer du koncentrationen c og kuvettebredden l. Du kan også vælge et andet stof og få lyset til at gå langsomt." },
            { sel: "#lys-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad detektoren viste. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#lys-opgaver", titel: "Forudsigelserne", tekst: "Seks forudsigelser. En forudsigelse, du gætter rigtigt uden hint, får en stjerne." },
            { sel: ".faneknapper", titel: "Standardkurven", tekst: "På næste fane bliver det til målinger: standarder, en linje gennem (0, 0) og en ukendt prøve." }
        ],
        "fane-kurve": [
            { sel: "#kurve-laerred", titel: "Spektrofotometret og bakken", tekst: "Klik på en kuvette i bakken, så bliver den målt. Hver måling bliver et punkt på grafen til højre." },
            { sel: "#kurve-maalinger", titel: "Målingerne", tekst: "Koncentrationen og absorbansen for hver kuvette. Prøvens koncentration står som ?, til du har aflæst den." },
            { sel: "#kurve-kort", titel: "Opgaven", tekst: "Opgaven og de fire skridt. Et skridt, der er gjort, bliver grønt." },
            { sel: "#kurve-status", titel: "Linjen forneden", tekst: "Her står næste skridt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#kurve-opgaver", titel: "Opgaverne", tekst: "Fire standardkurver. Prøvens koncentration er ny, hver gang du begynder forfra." }
        ],
        "fane-regn": [
            { sel: "#regn-tal", titel: "Opgavens tal", tekst: "De tal, opgaven giver. Hele opgaveteksten står i panelet til højre." },
            { sel: "#regn-trin", titel: "Regnestykket", tekst: "Først formlen, så tallene og til sidst resultatet. Felterne står på tavlen. Tjek eller Enter tjekker det, du har skrevet." },
            { sel: "#regn-bakke", titel: "Under tavlen", tekst: "Formens form, bogstaverne og senere tallene. Klik på dem for at sætte dem ind i et felt, eller skriv selv." },
            { sel: "#regn-status", titel: "Linjen forneden", tekst: "Her står næste skridt, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#regn-opgaver", titel: "Opgaverne", tekst: "Otte regnestykker i Let, Middel og Svær. Et regnestykke, du løser uden at se svaret, får en stjerne." }
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

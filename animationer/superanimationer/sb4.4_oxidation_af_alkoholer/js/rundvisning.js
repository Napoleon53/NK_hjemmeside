/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sc1.4, sc8.6, sc7.5, sc4.4 og sb4.8; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-o": [
            { sel: "#o-skort", titel: "Kortet øverst", tekst: "Al tekst står her: spørgsmålet, svarene og forklaringen. Vælg et svar, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#o-anker-tavle", titel: "Formlen", tekst: "Det markerede carbonatom er det, der bliver oxideret. Er det gult, spørger kortet om det. Når du har fundet oxidationstallet, får alle atomer deres oxidationstal. Tryk så Oxidér på kortet, og se, hvilke hydrogenatomer der forsvinder." },
            { sel: "#o-serier", titel: "Alkoholerne", tekst: "En primær, en sekundær og en tertiær alkohol. Klik på en af dem for at begynde forfra med den." },
            { sel: "#o-trappekort", titel: "Oxidationstallet", tekst: "Hvert stof bliver placeret ud for sit oxidationstal, når du har fundet det. Så kan du se, hvor meget oxidationstallet stiger ved hver oxidation." },
            { sel: "#o-visning", titel: "Elektronerne", tekst: "Elektronparrene viser, hvilket atom der trækker elektronerne i hver binding til sig. Mellem to carbonatomer bliver parret i midten. Elektronegativiteten står ved atomerne." }
        ],
        "fane-p": [
            { sel: "#p-skort", titel: "Kortet øverst", tekst: "Kortet spørger først om typen af alkohol og derefter om produktet. Vælg, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#p-anker-valg", titel: "Svarene", tekst: "Klik på det stof, alkoholen bliver til, eller på Ingen reaktion. Svarene kan vælges, når typen er fundet." },
            { sel: "#p-opgaver", titel: "Opgaverne", tekst: "Klik på et nummer for at vælge en opgave. En løst opgave får et flueben og en stjerne, hvis den blev løst i første forsøg." },
            { sel: "#p-fundkort", titel: "Det har du fundet", tekst: "Tabellen fyldes ud, når du har løst en opgave af hver slags." }
        ],
        "fane-u": [
            { sel: "#u-skort", titel: "Kortet øverst", tekst: "Ét spørgsmål ad gangen. Vælg et svar, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#u-anker-glas", titel: "Glassene", tekst: "Efter forsøget står farven, bundfaldet og pH ved hvert glas, og glassene bliver stående. Når kortet spørger om et glas, kan du også klikke på det." },
            { sel: "#u-anker-skema", titel: "Én alkohol ad gangen", tekst: "Den alkohol, du arbejder med, står som overskrift; de andre venter til højre. Tre felter fra venstre mod højre: molekylet, reaktionen og det, du forventer at se. Til sidst finder du glasset, og kortet glider op i det." },
            { sel: "#u-trin", titel: "Trinene", tekst: "Teorien skal kun laves første gang. Bagefter begynder en ny runde ved forsøget med glassene blandet om." }
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

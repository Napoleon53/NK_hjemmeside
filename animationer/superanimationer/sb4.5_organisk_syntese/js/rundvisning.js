/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt: ét element ad gangen med en kort tekst. Samme kode som i
   sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-fb": [
            { sel: "#fb-kunder", titel: "Kunderne", tekst: "Hver kunde vil have ét bestemt stof. Navnet siger, hvad det skal laves af. Klik på en ordre for at få hint til den." },
            { sel: "#fb-butikknap", titel: "Butikken", tekst: "Her køber du alkoholer, syrer og kaliumpermanganat. Læg varerne i kurven, og betal. Butikken fører ikke butansyre." },
            { sel: ".lager-reol", titel: "Lageret", tekst: "Det, du har købt eller lavet. Klik på en flaske, eller træk den over i kolben. Tallet er, hvor mange portioner du har." },
            { sel: "#fb-reaktor .pladser", titel: "Kolben", tekst: "Der er plads til to stoffer. Et klik på en plads tager stoffet af igen." },
            { sel: "#fb-reaktor .betingelser", titel: "Svovlsyre og varme", tekst: "Svovlsyre er katalysator. Varmepladen koger blandingen, og tilbagesvaleren over kolben holder dampen inde." },
            { sel: "#fb-start", titel: "Start", tekst: "Stofferne hældes i, og du ser, hvad der sker. Det, kunderne har bestilt, bliver leveret af sig selv. En blanding, der ikke kan reagere, bliver hældt ud." },
            { sel: "#fb-tavleboks", titel: "Tavlen", tekst: "Molekylerne med strukturformler. Orange atomer kommer fra syren, blå fra alkoholen og lilla fra permanganaten. Et klik på tavlen springer animationen over." },
            { sel: "#fb-status", titel: "Linjen forneden", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Knappen til højre giver ét hint ad gangen og til sidst svaret." },
            { sel: "#fb-kasse, #fb-titelfelt", titel: "Kassen og titlen", tekst: "Du starter med 300 kr. som lærling. Titlen følger det, fabrikken har tjent i alt, og giver adgang til udstyr i butikken." },
            { sel: "#fb-seriefelt", titel: "Serien", tekst: "Hver levering i træk giver 10 % oveni, højst 50 %. En blanding, der må hældes ud, bryder serien. Det gør Vis svaret også." },
            { sel: "#fb-boerskort", titel: "Børsen", tekst: "Hvert halve minut er der høj efterspørgsel på en ny duft. Den ordre giver mere." },
            { sel: "#fb-kortknap", titel: "Esterkortet", tekst: "Alle de estere, du har lavet. Første gang du laver et nyt stof, får du 50 kr. Klik for at se kortet." },
            { sel: "#fb-forfra", titel: "Forfra", tekst: "Starter fabrikken forfra med 300 kr. Tryk to gange." }
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

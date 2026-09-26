/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Fane 1 slutter med at pege paa de andre faner. Samme kode
   som i sc1.1, sc1.2, sc4.1 og sc4.2; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet (hylden, kammeret, termometeret, zoomvinduerne og badet) har
   et usynligt felt oven paa sig, som fanen selv flytter paa plads
   (saetAnker i sim_varm.js, sim_form.js og sim_spil.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-varm": [
            { sel: "#varm-anker-hylde", titel: "Hylden", tekst: "Elleve alkaner ved stuetemperatur. Gasserne har fyldt deres ballon. Træk et glas ned i kammeret, eller klik på det." },
            { sel: "#varm-anker-kammer", titel: "Kammeret", tekst: "Glasset i kammeret har den temperatur, termometeret viser. Når stoffet koger, fylder gassen ballonen." },
            { sel: "#varm-anker-termometer", titel: "Termometeret", tekst: "Træk i håndtaget for at varme op eller køle ned. Piletasterne flytter én grad, med Skift ti." },
            { sel: "#varm-anker-zoom", titel: "Molekylerne", tekst: "Hver kugle er et C-atom med dets H-atomer. Grå er fast stof, orange væske og blå gas. Gule prikker: her rører molekylerne hinanden." },
            { sel: "#varm-kurve-kort", titel: "Kurven", tekst: "Hvert kogepunkt, du finder, kommer på kurven. Den grønne linje er stuetemperatur." },
            { sel: "#varm-kort", titel: "Målene", tekst: "Fire små mål. Knappen giver et hint og derefter svaret." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Kogepunkt, London-kræfter, kædelængde og form kort forklaret." },
            { sel: ".faneknapper", titel: "De andre faner", tekst: "Formen: tre stoffer med samme formel. Hvem koger først: gæt i blandinger." }
        ],
        "fane-form": [
            { sel: "#form-anker-bad", titel: "Vandbadet", tekst: "Tre glas med C₅H₁₂ i samme vand. Hvert har sin ballon." },
            { sel: "#form-anker-zoom", titel: "Molekylerne", tekst: "Et vindue ind i hvert glas. Samme atomer, forskellig form." },
            { sel: "#form-anker-termometer", titel: "Termometeret", tekst: "Træk i håndtaget for at varme vandbadet op." },
            { sel: "#form-kort", titel: "Opgaven", tekst: "Gæt først, hvilken ballon der fyldes først. Så varmer du op, og til sidst: hvorfor?" },
            { sel: "#form-tabel-kort", titel: "Kogepunkterne", tekst: "Her kommer stofferne i den rækkefølge, de koger. Knappen under dem viser, hvor molekylerne rører hinanden." }
        ],
        "fane-spil": [
            { sel: "#spil-anker-zoom", titel: "Blandingen", tekst: "To eller tre alkaner i samme glas, hver i sin farve." },
            { sel: "#spil-valg", titel: "Dit gæt", tekst: "Hvem koger først? Du kan også klikke på et molekyle." },
            { sel: "#spil-anker-kammer", titel: "Kammeret", tekst: "Når du har gættet, varmer det op til det første stof er kogt væk." },
            { sel: "#spil-kort", titel: "Knappen", tekst: "Et hint og derefter svaret. Et svar, du har set, giver ikke point." },
            { sel: "#spil-runde", titel: "Runden", tekst: "Ni blandinger på tre niveauer. Rekorden huskes." }
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

/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Samme rundvisning som i sc1.1: ét element ad gangen med en kort
   tekst i stedet for en lang tekstvaeg. Her er der kun én fane, og
   derfor kun én tur. Hvert trin er en CSS-selector plus titel og
   tekst; findes elementet ikke lige nu, springes trinnet over.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TUR = [
        { sel: "#glas-kort", titel: "Fyld glasset", tekst: "Luk H₂ og O₂ ind i måleglasset. Du kan også klikke direkte på trykflaskerne. Glasset rummer 6 streger." },
        { sel: "#scene", titel: "Antænd", tekst: "Træk det fyldte glas hen til flammen, eller tryk Antænd. Genfyld glasset sætter det tilbage i karret." },
        { sel: "#resultat", titel: "Lydstyrken", tekst: "Hver blanding får sin søjle. Test alle syv blandinger." },
        { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når alle syv blandinger er testet." },
        { sel: "#teoriknap", titel: "Teori", tekst: "Reaktionsskemaet og forklaringen på knaldet." }
    ];

    var trinNr = 0;
    var erAktiv = false;

    function synlige(sel) {
        var liste = document.querySelectorAll(sel);
        var ud = [];
        for (var i = 0; i < liste.length; i++) {
            if (liste[i].offsetWidth || liste[i].offsetHeight) ud.push(liste[i]);
        }
        return ud;
    }

    function samletRect(sel) {
        var liste = synlige(sel);
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

    /* Boksen laegges der, hvor der er plads: under, over, til hoejre,
       til venstre - eller midt i elementet, hvis det fylder det meste
       af skaermen. */
    function placerBoks(rect) {
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
            top = rect.top + rect.height / 2 - bH / 2;
            left = rect.left + rect.width / 2 - bB / 2;
        }

        boks.style.left = NK.klamp(left, 10, vb - bB - 10) + "px";
        boks.style.top = NK.klamp(top, 10, vh - bH - 10) + "px";
    }

    function visTrin() {
        var t = TUR[trinNr];
        if (!t) { luk(); return; }
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
        NK.saetTekst("rv-tal", (trinNr + 1) + "/" + TUR.length);
        NK.el("rv-forrige").style.display = trinNr === 0 ? "none" : "";
        NK.saetTekst("rv-naeste", trinNr === TUR.length - 1 ? "Afslut" : "Næste →");

        placerBoks(rect);
    }

    function start() {
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
        if (trinNr >= TUR.length - 1) { luk(); return; }
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

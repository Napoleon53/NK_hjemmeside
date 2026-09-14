/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Samme rundvisning som i sc1.3: ét element ad gangen med en kort
   tekst. Findes elementet ikke lige nu, springes trinnet over.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TUR = [
        { sel: "#scene", titel: "Laboratoriebordet", tekst: "Klik på genstandene for at bruge dem. Hvert klik på et glas med stof er en spatelspids." },
        { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinene får flueben, efterhånden som du når dem. Hint hjælper med det trin, du er ved." },
        { sel: "#serie-kort", titel: "Tegneserie", tekst: "Når forsøget er slut, kan du se det opsummeret som en tegneserie med dine målinger og opløselighedskurven." },
        { sel: "#quiz-kort", titel: "Quiz", tekst: "Låses op, når der er tre målinger." },
        { sel: "#forfraknap", titel: "Start forfra", tekst: "Starter forsøget forfra med et tomt bægerglas." }
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
        return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
    }

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

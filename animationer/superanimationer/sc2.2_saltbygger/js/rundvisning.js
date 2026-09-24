/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme opbygning som i sc1.1 og sc2.4.

   Hvert trin er en CSS-selector (kan vaere flere, kommasepareret) plus
   en titel og en kort tekst. Et element, der er skjult, springes over.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-bord": [
            { sel: "#bord-scene .hylde.top, #bord-scene .hylde.bund", titel: "Ionerne", tekst: "Positive ioner øverst, negative nederst. Træk en ion ned på bordet, eller klik på den. En stiplet kant betyder, at ionen er sammensat." },
            { sel: "#bord-laerred", titel: "Lynlåsen", tekst: "Hvert kort er lige så bredt, som ionen har ladning. Plus og minus mødes på midten. Lukker lynlåsen hele vejen, er saltet neutralt, og formlen står under bordet." },
            { sel: "#bord-scene .styr", titel: "Én mere eller færre", tekst: "Læg en ion mere, eller tag én væk. Et klik på et kort fjerner det også." },
            { sel: "#byg-afstem", titel: "Afstem for mig", tekst: "Viser fremgangsmåden: giv den korteste række én ion mere, til lynlåsen lukker." },
            { sel: "#bord-opgavekort", titel: "Opgaver", tekst: "Byg et stof ud fra navnet, eller find ionerne i en formel. Knappen giver først et hint, så svaret og til sidst en ny opgave." },
            { sel: "#teoriknap", titel: "Teori", tekst: "Reglerne for formler og navne, samlet ét sted." }
        ],
        "fane-vand": [
            { sel: "#vand-laerred", titel: "Glasset", tekst: "Saltet ligger som et krystalgitter. I vandet går ionerne fra hinanden, men en sammensat ion holder sammen." },
            { sel: "#vand-saltkort", titel: "Vælg et salt", tekst: "Læg et hvilket som helst salt i vandet. Et salt, du har bygget på fane 1, kan tages med herover." },
            { sel: "#vand-opgavekort", titel: "Opgaver", tekst: "Forudsig, hvad der kommer ud i vandet, eller tæl ionerne og find saltet." }
        ],
        "fane-ukendt": [
            { sel: "#ukendt-formel", titel: "Saltet", tekst: "Formlen er givet. Den ene ion ligger ikke på hylden, og dens ladning er ukendt." },
            { sel: "#ukendt-anker-plakater", titel: "Plakaterne", tekst: "Det periodiske system og de sammensatte ioner. Klik på en plakat for at se den stort." },
            { sel: "#ukendt-laerred", titel: "Bordet", tekst: "Ionerne ligger i det antal, formlen siger. Kortene er foldet sammen, til du har fundet deres ladning." },
            { sel: "#ukendt-scene .styr", titel: "Knapperne", tekst: "Gør det samme som at trække i kortet: ladningen én op eller én ned." },
            { sel: "#ukendt-opgavekort", titel: "Trin for trin", tekst: "Ét trin ad gangen: først den ion, du kender, så den ukendte, og til sidst skal den bruges. Et løst trin viser svaret." }
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
        ture: TURE,              /* til selvtesten */
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

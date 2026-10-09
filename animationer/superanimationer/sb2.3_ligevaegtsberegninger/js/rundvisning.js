/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb2.1 og sc1.4; kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-bh": [
            { sel: "#bh-kasse", titel: "Målet og tekstboksen", tekst: "Øverst står målet. Under det står, hvad du skal nu, og hvad der gik galt. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#bh-laerred", titel: "Beholderen og grafen", tekst: "Til venstre er molekylerne i en lukket beholder. Til højre er reaktionsbrøken Y som funktion af x. Den gule linje er K." },
            { sel: ".bh-skyder", titel: "x", tekst: "Skyderen bestemmer x: hvor meget af stoffet der er omsat. Du kan også trække på grafen." },
            { sel: "#bh-skema", titel: "Skemaet", tekst: "Start, ændring og ligevægt for hvert stof. Tallene følger skyderen. I nogle mål skriver du selv udtrykkene med x." },
            { sel: "#bh-y", titel: "Y og K", tekst: "Reaktionsbrøken regnet med koncentrationerne i skemaet. Ved ligevægt er Y = K." },
            { sel: "#bh-opgaver", titel: "Målene", tekst: "Otte mål på tre reaktioner. Et mål, du når uden at se svaret, får en stjerne." },
            { sel: ".faneknapper", titel: "Opgaverne", tekst: "På fanerne Uden x og Med x regner du de rigtige opgaver." }
        ],
        "fane-ux": [
            { sel: "#ux-hoved", titel: "Opgaven", tekst: "Reaktionsskemaet. Når ligevægtsloven er skrevet rigtigt, kommer opgavens tal frem under det. Klik på et tal for at sætte det ind i det felt, du står i." },
            { sel: "#ux-delbar", titel: "Delene", tekst: "Opgaven regnes i dele. Den gule er den, du er ved." },
            { sel: "#ux-dele", titel: "Tavlen", tekst: "Skriv i felterne, og tryk Tjek eller Enter. En løst del bliver stående, som den skal stå i din besvarelse." },
            { sel: "#ux-status", titel: "Tekstboksen", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#ux-opgaver", titel: "Opgaverne", tekst: "Fem opgaver: tre, hvor Kc skal findes, og to med en ukendt koncentration. Når en opgave er løst, står hele besvarelsen i kortet ovenover." }
        ],
        "fane-mx": [
            { sel: "#mx-hoved", titel: "Opgaven", tekst: "Reaktionsskemaet. Når ligevægtsloven er skrevet rigtigt, kommer opgavens tal frem under det. Klik på et tal for at sætte det ind i det felt, du står i." },
            { sel: "#mx-delbar", titel: "Delene", tekst: "Ligevægtsloven, hvad x er, skemaet, ligningen, CAS, løsningen og koncentrationerne. Den gule er den, du er ved." },
            { sel: "#mx-dele", titel: "Tavlen", tekst: "Skriv i felterne, og tryk Tjek eller Enter. Skemaet bliver stående, så du kan bruge det i ligningen og til at prøve løsningerne." },
            { sel: "#mx-status", titel: "Tekstboksen", tekst: "Her står, hvad du skal nu, og hvad der gik galt. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#mx-opgaver", titel: "Opgaverne", tekst: "Otte opgaver i Let, Middel og Svær. Når en opgave er løst, står hele besvarelsen og kurven fra start til ligevægt i kortet ovenover." }
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
        NK.saetHTML("rv-tekst", NK.kc ? NK.kc(NK.html(t.tekst)) : NK.html(t.tekst));
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

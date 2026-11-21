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
            { sel: "#bh-skort", titel: "Papirkortet", tekst: "Øverst står reaktionsskemaet med K. Under det står spørgsmålet eller det, du skal gøre. Giv et hint giver ét hint ad gangen og til sidst svaret." },
            { sel: "#bh-laerred", titel: "Beholderen", tekst: "Molekylerne i en lukket beholder. Hvert stof har sin egen farve, og under beholderen står, hvor mange der er af hvert stof." },
            { sel: "#bh-skyder", titel: "x", tekst: "Skyderen bestemmer x, som er den koncentration af stoffet, der er omsat. På det første mål ligger den under grafen som grafens x-akse." },
            { sel: "#bh-y", titel: "Y og K", tekst: "Y er reaktionsbrøken regnet med koncentrationerne lige nu. Ved ligevægt er Y = K." },
            { sel: "#bh-tavle", titel: "Tavlen", tekst: "Skemaet med Start, Ændring og Ligevægt. Feltet med ? er det, kortet spørger om. Du svarer på kortet." },
            { sel: "#bh-graffane", titel: "Grafen", tekst: "Fra mål 2 er grafen foldet ind. Her kan du folde den ud igen." },
            { sel: "#bh-raekke", titel: "Målene", tekst: "Der er seks mål på tre reaktioner. Et nyt mål åbner, når du kommer dertil. Start forfra står til højre." }
        ],
        "fane-ux": [
            { sel: "#ux-rx", titel: "Reaktionen", tekst: "Reaktionsskemaet for opgaven står med stort øverst." },
            { sel: "#ux-skort", titel: "Papirkortet", tekst: "Kortet stiller ét spørgsmål ad gangen. Du svarer på kortet: vælg et svar eller skriv et tal, og tryk Indsend svar." },
            { sel: "#ux-tavle", titel: "Tavlen", tekst: "Øverst står opgavens tal. Under dem kommer besvarelsen linje for linje. Linjen med ? er den, kortet spørger om." },
            { sel: "#ux-raekke", titel: "Opgaverne", tekst: "Fem opgaver: tre, hvor K skal findes, og to med en ukendt koncentration. En ny opgave åbner, når du kommer dertil. Start forfra står til højre." }
        ],
        "fane-mx": [
            { sel: "#mx-hoved", titel: "Opgaven", tekst: "Reaktionsskemaet. Når ligevægtsloven er skrevet rigtigt, kommer opgavens tal frem under det. Klik på et tal for at sætte det ind i det felt, du står i." },
            { sel: "#mx-delbar", titel: "Delene", tekst: "Ligevægtsloven, hvad x er, skemaet, ligningen, CAS, løsningen og koncentrationerne. Den gule er den, du er ved." },
            { sel: "#mx-dele", titel: "Tavlen", tekst: "Skriv i felterne, og tryk Indsend svar eller Enter. Skemaet bliver stående, så du kan bruge det i ligningen og til at prøve løsningerne." },
            { sel: "#mx-skort", titel: "Papirkortet", tekst: "Øverst står opgaven. Under den står, hvad du skal nu, og hvad der gik galt. Giv et hint giver ét hint ad gangen og til sidst svaret." },
            { sel: "#mx-raekke", titel: "Opgaverne", tekst: "Otte opgaver i Let, Middel og Svær. Hvert niveau kan altid vælges. Når en opgave er løst, står kurven fra start til ligevægt sidst på tavlen." }
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

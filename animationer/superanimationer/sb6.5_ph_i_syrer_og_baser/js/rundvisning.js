/* =====================================================================
   rundvisning.js - spotlight-rundvisning paa hjaelpeknappen

   Viser rundt paa den fane, man staar paa: ét element ad gangen med en
   kort tekst. Samme kode som i sb6.1 og sb7.7 (og sb7.3, sb7.2, sb4.11, sb4.3, sc1.4, sc8.6,
   sc7.5, sc4.4 og sb4.8); kun TURE er ny.

   Hvert trin er en CSS-selector plus en titel og en kort tekst. Dele af
   laerredet har et usynligt felt oven paa sig, som fanen selv flytter paa
   plads (saetAnker i fane.js og sim_*.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TURE = {
        "fane-s": [
            { sel: "#s-skort", titel: "Kortet øverst", tekst: "Al tekst står her. Skriv i felterne, og tryk Indsend svar. Den gule knap giver ét hint ad gangen og til sidst svaret." },
            { sel: "#s-anker-skema", titel: "Skemaet", tekst: "Under reaktionsskemaet står rækkerne Start, Ændring og Ligevægt. Det, du skriver på kortet, står med blåt i den række, du er ved." },
            { sel: "#s-anker-lup", titel: "Luppen", tekst: "Luppen viser 100 af syrens molekyler. Når rækken Ændring er rigtig, overføres hydronerne én ad gangen til vand. Antallet af blå og røde partikler svarer til x." },
            { sel: "#s-anker-rammer", titel: "Beregningen", tekst: "Ligningen, løsningen fra CAS og pH bygges op her. Den gule ramme er det trin, du er ved." },
            { sel: "#s-syrekort", titel: "Syrerne", tekst: "Tre middelstærke syrer. Klik på en syre for at regne på den. ★ betyder regnet uden fejl." }
        ],
        "fane-v": [
            { sel: "#v-skort", titel: "Kortet øverst", tekst: "Kortet spørger først om fremgangsmåden og derefter om pH. Vælg et svar eller skriv et tal, og tryk Indsend svar." },
            { sel: "#v-anker-skala", titel: "Skalaen", tekst: "Bogens pKₛ-skala med de fire grupper. Syrens pKₛ afgør, hvilken fremgangsmåde der giver pH." },
            { sel: "#v-anker-lup", titel: "Kolben og luppen", tekst: "Etiketten viser cₛ og pKₛ. Luppen åbner, når fremgangsmåden er valgt, og viser, hvor mange molekyler der har afgivet en hydron." },
            { sel: "#v-anker-rammer", titel: "Beregningen", tekst: "Fremgangsmåden og beregningen af pH bygges op her." },
            { sel: "#v-syrekort", titel: "Syrerne", tekst: "Seks syrer: stærke, middelstærke og svage. ★ betyder regnet uden fejl." }
        ],
        "fane-b": [
            { sel: "#b-skort", titel: "Kortet øverst", tekst: "Kortet fører dig ad regnevejen for en base. Skriv tallene i feltet, og tryk Indsend svar." },
            { sel: "#b-anker-reak", titel: "Reaktionsskemaet", tekst: "Reaktionsskemaet viser basens reaktion og dermed, hvor mange hydroxidioner der dannes." },
            { sel: "#b-anker-rammer", titel: "Regnevejen", tekst: "Beregningen går fra basens koncentration til [OH⁻], derefter til pOH og til sidst til pH." },
            { sel: "#b-anker-skala", titel: "pH-skalaen", tekst: "Her ses pH, når den er regnet. En opløsning af en base har pH over 7." },
            { sel: "#b-basekort", titel: "Baserne", tekst: "Fire baser fra bogen, også et salt. ★ betyder regnet uden fejl." }
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

        NK.saetHTML("rv-titel", NK.Data.sub(NK.html(t.titel)));
        NK.saetHTML("rv-tekst", NK.Data.sub(NK.html(t.tekst)));
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

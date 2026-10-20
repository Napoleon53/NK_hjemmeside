/* =====================================================================
   app.js - binder de to faner sammen (som i sb4.8)

   Faneskift, stofklasserne (kontakterne i panelet), teorien,
   tastaturgenveje og tegneloekken. Kun den aktive fane opdateres og
   tegnes. Der er ingen laerer: hjaelpen er den gule knap paa kortet.

   Stofklasserne:
     * de valgte huskes i browseren (nk-sb3.1-klasser)
     * et link kan vaelge dem:  index.html?med=alkohol,syre
       (alkan, alken, alkyn, halogen, alkohol, syre eller alle).
       Linket vinder over det, browseren husker
     * mindst én stofklasse er altid slaaet til
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var sims = {};
    var faner = ["fane-t", "fane-s"];
    var aktivFane = faner[0];
    var sidsteTid = 0;
    var KLASSE_NOEGLE = "nk-sb3.1-klasser";
    var aktive = [];

    /* ----- Faner ------------------------------------------------------ */
    function visFane(id) {
        var afsnit = document.querySelectorAll(".fane");
        var knapper = document.querySelectorAll(".faneknap");
        var i;
        for (i = 0; i < afsnit.length; i++) afsnit[i].classList.toggle("aktiv", afsnit[i].id === id);
        for (i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-fane") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        aktivFane = id;
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            sims[id].layout();
            sims[id].fokus();
        }
    }
    NK.visFane = visFane;

    /* ----- Stofklasserne ------------------------------------------------- */
    var ALIAS = {
        syre: "carboxylsyre", syrer: "carboxylsyre", carboxylsyrer: "carboxylsyre", alkoholer: "alkohol",
        alkaner: "alkan", alkener: "alken", alkyner: "alkyn", halogenalkan: "halogen", halogenalkaner: "halogen",
        halogener: "halogen"
    };

    function gyldige(liste) {
        var ud = [];
        D.KLASSER.forEach(function (k) { if (liste.indexOf(k.id) >= 0) ud.push(k.id); });
        return ud;
    }

    function laesAktive() {
        var m = /[?&]med=([^&#]*)/.exec(window.location.search || "");
        if (m) {
            var ord = [];
            try { ord = decodeURIComponent(m[1]).toLowerCase().split(/[,+ ]+/); } catch (x) { ord = []; }
            if (ord.indexOf("alle") >= 0) return D.KLASSER.map(function (k) { return k.id; });
            var fra = gyldige(ord.map(function (o) { return ALIAS[o] || o; }));
            if (fra.length) return fra;
        }
        var gemt = gyldige(NK.hent(KLASSE_NOEGLE, null) || []);
        return gemt.length ? gemt : D.STANDARD.slice();
    }

    function bygKlasser() {
        var bokse = document.querySelectorAll(".klasser");
        for (var i = 0; i < bokse.length; i++) {
            var html = "";
            D.KLASSER.forEach(function (k) {
                html += '<button type="button" class="klasseknap" data-klasse="' + k.id + '" role="switch" aria-checked="false" style="--klassefarve:' + k.farve + '">' +
                    '<span class="kk-kontakt"><i></i></span>' +
                    '<span class="kk-navn">' + NK.html(k.navn) + '</span><span class="kk-end">' + NK.html(k.endelse) + "</span></button>";
            });
            bokse[i].innerHTML = html;
            bokse[i].addEventListener("click", klasseKlik);
        }
    }

    function visKlasser() {
        var knapper = document.querySelectorAll(".klasseknap");
        for (var i = 0; i < knapper.length; i++) {
            var til = aktive.indexOf(knapper[i].getAttribute("data-klasse")) >= 0;
            knapper[i].classList.toggle("til", til);
            knapper[i].setAttribute("aria-checked", til ? "true" : "false");
        }
    }

    function klasseNote(tekst) {
        var noter = document.querySelectorAll(".klasse-note");
        for (var i = 0; i < noter.length; i++) noter[i].textContent = tekst;
    }

    function saetAktive(liste, gem) {
        aktive = gyldige(liste);
        if (!aktive.length) aktive = D.STANDARD.slice();
        if (gem) NK.gem(KLASSE_NOEGLE, aktive);
        visKlasser();
        faner.forEach(function (id) { if (sims[id]) sims[id].saetAktive(aktive); });
        var sim = sims[aktivFane];
        if (sim) { sim.tilpas(); sim.layout(); }
    }
    NK.saetKlasser = function (liste) { saetAktive(liste, true); };
    NK.klasser = function () { return aktive.slice(); };

    function klasseKlik(e) {
        var k = e.target.closest ? e.target.closest(".klasseknap") : null;
        if (!k) return;
        var id = k.getAttribute("data-klasse"), i = aktive.indexOf(id), ny = aktive.slice();
        if (i >= 0) {
            if (aktive.length === 1) {
                /* Den sidste kan ikke slaas fra */
                k.classList.remove("ryst");
                void k.offsetWidth;
                k.classList.add("ryst");
                klasseNote("Mindst én stofklasse skal være slået til.");
                return;
            }
            ny.splice(i, 1);
        } else ny.push(id);
        klasseNote("");
        saetAktive(ny, true);
    }

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabnTeori() {
        lukAlle();
        NK.el("teori").classList.add("vis");
    }

    /* ----- Tegneloekken ------------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;                    /* undgaa spring efter faneskift */

        var sim = sims[aktivFane];
        if (sim) {
            sim.tilpas();
            sim.opdater(dt * NK.tid.skala);
            sim.tegn();
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        var sim = sims[aktivFane];
        if (e.key === "Escape") {
            lukAlle();
            if (NK.Rundvisning) NK.Rundvisning.luk();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        var aaben = NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis");
        /* Fortryd og gentag paa tegnefanen */
        if ((e.ctrlKey || e.metaKey) && !aaben && aktivFane === "fane-t" && sim && !sim.faerdig) {
            var t = e.key.toLowerCase();
            if (t === "z" && !e.shiftKey) { sim.braet.fortryd(); e.preventDefault(); return; }
            if (t === "y" || (t === "z" && e.shiftKey)) { sim.braet.gentag(); e.preventDefault(); return; }
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (aaben) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "1" || e.key === "2") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        /* Enter: Test paa tegnefanen (ogsaa lige efter et klik paa et vaerktoej),
           men ikke paa de andre knapper og links */
        if (e.key === "Enter" && aktivFane === "fane-t" && sim) {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest("#t-vaerktoej, #t-bund")) return;
            e.preventDefault();
            sim.test();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        bygKlasser();
        sims["fane-t"] = new NK.SimTegn();
        sims["fane-s"] = new NK.SimSkriv();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */

        var fraLink = /[?&]med=/.test(window.location.search || "");
        saetAktive(laesAktive(), fraLink);

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) {
            o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); });
        }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(aktivFane); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);

        document.addEventListener("keydown", tastatur);
        window.addEventListener("resize", function () { var s = sims[aktivFane]; if (s) { s.tilpas(); s.layout(); } });

        /* Man kan linke direkte til en fane med  index.html#skriv  */
        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { tegn: "fane-t", tegning: "fane-t", molekylet: "fane-t",
                     skriv: "fane-s", navn: "fane-s", navnet: "fane-s", navngiv: "fane-s" };
        visFane(HASH[oenske] || faner[0]);

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

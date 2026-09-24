/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teori, rundvisning, tastaturgenveje og tegneloekken. Kun
   den aktive fane opdateres og tegnes, saa den anden koster ingenting.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Kemichael kommer ikke af sig selv: første gang står der Start
       præsentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. */
    function tilbud(P, noegle, id) {
        if (!P || !P.startIntro) return;
        NK.Praesentation.pakInd(P, {
            tilbud: id,
            set: function () { return NK.hent(noegle, false); },
            husk: function () { NK.gem(noegle, true); },
            esc: "springIntro"
        });
    }
    tilbud(NK.SimBord && NK.SimBord.prototype, "nk-sc2.2-intro-fane-bord", "bord-tilbud");
    tilbud(NK.SimVand && NK.SimVand.prototype, "nk-sc2.2-intro-fane-vand", "vand-tilbud");
    tilbud(NK.SimUkendt && NK.SimUkendt.prototype, "nk-sc2.2-intro-fane-ukendt", "ukendt-tilbud");

    var sims = {};
    var faner = ["fane-bord", "fane-vand", "fane-ukendt"];
    var aktivFane = "fane-bord";
    var sidsteTid = 0;

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
        if (NK.Opslag) NK.Opslag.luk();
        if (sims[id]) {
            sims[id].tilpas();
            if (sims[id].startIntro) sims[id].startIntro(false);   /* kun første gang i browseren */
        }
    }

    /* ----- Teori og rundvisning ----------------------------------------- */
    function visTeori(vis) {
        NK.el("teori").classList.toggle("vis", vis);
    }

    function startRundvisning() {
        visTeori(false);
        NK.Rundvisning.start(aktivFane);
    }

    /* ----- Tegneloekken ------------------------------------------------ */
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

    /* ----- Tastatur ----------------------------------------------------- */
    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var sim = sims[aktivFane];

        /* Esc lukker det, der er aabent, og sender Kemichael ud af
           praesentationen. */
        if (e.key === "Escape") {
            visTeori(false);
            NK.Rundvisning.luk();
            NK.Opslag.luk();
            if (sim && sim.springIntro) sim.springIntro();
            return;
        }
        if (NK.Rundvisning.aktiv()) return;
        if (e.key === "1" || e.key === "2" || e.key === "3") {
            visFane(faner[parseInt(e.key, 10) - 1]);
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") { startRundvisning(); return; }
        if (e.key === "t" || e.key === "T") {
            visTeori(!NK.el("teori").classList.contains("vis"));
            return;
        }
        if (e.key === "k" || e.key === "K") { if (sim && sim.startIntro) sim.startIntro(true); return; }
        if (e.key === "r" || e.key === "R") {
            if (sim && sim.nulstil) sim.nulstil();
        }
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        sims["fane-bord"] = new NK.SimBord();
        sims["fane-vand"] = new NK.SimVand();
        sims["fane-ukendt"] = new NK.SimUkendt();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */
        /* Kemichaels sprites: kemichael.js har lagt dem i listen. */
        if (NK.Sprites) NK.Sprites.start();
        NK.visFane = visFane;
        NK.aktivFane = function () { return aktivFane; };

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        NK.el("hjaelpknap").addEventListener("click", startRundvisning);
        NK.el("teoriknap").addEventListener("click", function () { visTeori(true); });
        NK.el("teori-luk").addEventListener("click", function () { visTeori(false); });
        NK.el("teori").addEventListener("click", function (e) {
            if (e.target.id === "teori") visTeori(false);
        });

        document.addEventListener("keydown", tastatur);

        /* Direkte links: index.html#vand giver vandfanen, #ukendt den
           ukendte ion, #opgaver og #vandopgaver starter opgaverne paa
           fane 1 og 2. */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        if (oenske === "ukendt") {
            visFane("fane-ukendt");
        } else if (oenske === "vand" || oenske === "vandopgaver") {
            visFane("fane-vand");
            if (oenske === "vandopgaver") sims["fane-vand"].nyOpgave();
        } else {
            visFane("fane-bord");
            if (oenske === "opgaver" || oenske === "opgave") sims["fane-bord"].nyOpgave();
        }

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

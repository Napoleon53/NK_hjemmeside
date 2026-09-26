/* =====================================================================
   app.js - binder de tre faner og lommeregneren sammen

   Faneskift, teorien, tastaturet og tegneloekken. Kun den aktive fane
   opdateres og tegnes. Lommeregneren er én og flyttes ind i den aktive
   fanes panel, saa Ans og det tastede foelger med fra fane til fane.

   Tastaturet: tal og regnetegn gaar til lommeregneren (Enter er =), naar
   man ikke staar i et svarfelt. T teori, H rundvisning, K Kemichaels
   praesentation, M Maple, Esc lukker.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var R = NK.Regner;

    var sims = {};
    var faner = ["fane-ph", "fane-konc", "fane-staerk"];
    var aktivFane = faner[0];
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
        R.stopDemo();
        R.flyt(NK.el(id.replace("fane-", "") + "-regnerplads"));
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            if (sims[id].startIntro) sims[id].startIntro(false);   /* tilbuddet, foerste gang i browseren */
        }
    }
    NK.visFane = visFane;
    NK.aktivSim = function () { return sims[aktivFane]; };

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
        if (dt > 0.1) dt = 0.1;

        R.opdater(dt);
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
            if (sim && sim.springIntro) sim.springIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        /* Enter paa en knap uden for lommeregneren trykker paa knappen */
        if ((e.key === "Enter" || e.key === " ") && e.target && e.target.tagName === "BUTTON") return;
        if (e.key === "k" || e.key === "K") { if (sim && sim.startIntro) sim.startIntro(true); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (sim && sim.tast && sim.tast(e)) { e.preventDefault(); }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        R.start();

        sims["fane-ph"] = new NK.SimPh();
        sims["fane-konc"] = new NK.SimKonc();
        sims["fane-staerk"] = new NK.SimStaerk();
        NK.sims = sims;

        /* Hver gang der trykkes =: fanen ser, om tallet passer til opgaven.
           Paaskeaegget: 42 paa lommeregneren */
        R.naarResultat = function (v) {
            var sim = sims[aktivFane];
            if (!sim) return;
            if (sim.lommeregnerSvar) sim.lommeregnerSvar(v);
            if (Math.abs(v - 42) < 1e-9 && sim.laererAeg) sim.laererAeg(NK.Data.AEG_42);
        };

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); knap.blur(); });
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

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Direkte link til en fane:  index.html#konc  eller  #staerk */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(sims["fane-" + oenske] ? "fane-" + oenske : faner[0]);

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

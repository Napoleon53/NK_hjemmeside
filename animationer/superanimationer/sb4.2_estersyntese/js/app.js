/* =====================================================================
   app.js - de tre faner, teorien, tastaturgenveje og tegneloekken

   Kun den aktive fane opdateres og tegnes. Der er ingen laerer: hjaelpen
   er den gule knap paa kortet.

   Man kan linke direkte til en fane:
     index.html#kondensation  fane 1 Kondensationen
     index.html#forudsig      fane 2 Forudsig esteren (ogsaa #tegn)
     index.html#rens          fane 3 Rens esteren
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-k", "fane-t", "fane-s"];
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
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            sims[id].layout();
        }
    }
    NK.visFane = visFane;

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
        /* Ctrl+Z fortryder paa tavlen paa fane 2 */
        if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && aktivFane === "fane-t" && sim) { e.preventDefault(); sim.fortryd(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var aaben = NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis");
        if (aaben) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        /* C og O vaelger grundstoffet paa tavlen paa fane 2 */
        if (aktivFane === "fane-t" && sim && (e.key === "c" || e.key === "C" || e.key === "o" || e.key === "O")) { sim.vaelgVaerktoej(e.key.toUpperCase()); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        /* Enter: Indsend svar (eller kortets groenne knap), men ikke paa andre knapper */
        if (e.key === "Enter" && sim) {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest(".scenekort")) return;
            e.preventDefault();
            if (sim.groen) sim.videreKlik();
            else sim.indsendKlik();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-k"] = new NK.SimKond();
        sims["fane-t"] = new NK.SimTegn();
        sims["fane-s"] = new NK.SimRens();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */

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

        /* Hver fane begynder ved det foerste, der ikke er klaret */
        faner.forEach(function (id) {
            var s = sims[id];
            s.tilpas();
            s.nr = -1;
            var n = s.naesteUloeste();
            s.vaelg(n >= 0 ? n : 0);
        });

        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { kondensation: "fane-k", kondensationen: "fane-k", "1": "fane-k",
                     forudsig: "fane-t", tegn: "fane-t", navn: "fane-t", "2": "fane-t",
                     rens: "fane-s", skilletragt: "fane-s", "3": "fane-s" };
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

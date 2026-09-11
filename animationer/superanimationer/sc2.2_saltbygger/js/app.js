/* =====================================================================
   app.js - binder de fire faner sammen

   Faneskift, tastaturgenveje og tegneloekken. Kun den aktive fane
   opdateres og tegnes, saa de tre andre koster ingenting.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-byg", "fane-navn", "fane-formel", "fane-vand"];
    var aktivFane = "fane-byg";
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
        if (sims[id]) sims[id].tilpas();
    }

    /* ----- Hjaelp ------------------------------------------------------ */
    function visHjaelp(vis) {
        NK.el("hjaelp").classList.toggle("vis", vis);
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

        if (e.key >= "1" && e.key <= "4") {
            visFane(faner[parseInt(e.key, 10) - 1]);
            return;
        }
        if (e.key === "Escape") { visHjaelp(false); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            visHjaelp(!NK.el("hjaelp").classList.contains("vis"));
            return;
        }
        if (e.key === "r" || e.key === "R") {
            if (sim && sim.nulstil) sim.nulstil();
        }
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        sims["fane-byg"] = new NK.SimByg();
        sims["fane-navn"] = new NK.SimNavn();
        sims["fane-formel"] = new NK.SimFormel();
        sims["fane-vand"] = new NK.SimVand();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */
        NK.visFane = visFane;

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { visHjaelp(true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { visHjaelp(false); });
        NK.el("hjaelp").addEventListener("click", function (e) {
            if (e.target.id === "hjaelp") visHjaelp(false);
        });

        document.addEventListener("keydown", tastatur);

        /* Man kan linke direkte til en fane med fx  index.html#formel  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(sims["fane-" + oenske] ? "fane-" + oenske : "fane-byg");

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

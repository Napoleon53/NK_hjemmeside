/* =====================================================================
   app.js - binder de tre faner sammen (som sb2.1)

   Faneskift, teorien, quizzen, tastaturgenveje og tegneloekken. Kun den
   aktive fane opdateres. Der er ingen laerer: hjaelpen staar i
   statuslinjen nederst i scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-let", "fane-mid", "fane-svr"];
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
        if (sims[id]) { sims[id].tilpas(); sims[id].fokus(); }
    }
    NK.visFane = visFane;

    /* En faerdig fane faar et flueben paa knappen (huskes i browseren) */
    NK.opdaterFaneknapper = function () {
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var id = knapper[i].getAttribute("data-fane").replace("fane-", "");
            var g = NK.hent("nk-sb9.4-" + id, {}) || {};
            var m = knapper[i].querySelector(".fk-m");
            if (m) m.textContent = g.stjerne ? "★" : (g.faerdig ? "✓" : "");
        }
    };

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        var sim = sims[aktivFane];
        if (sim && sim.fokus) sim.fokus();
    }

    function aabnTeori() {
        lukAlle();
        NK.el("teori").classList.add("vis");
    }

    function aabnQuiz() {
        lukAlle();
        NK.Quiz.aabn();
    }

    /* ----- Tegneloekken ------------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        var sim = sims[aktivFane];
        if (sim) sim.opdater(dt * NK.tid.skala);
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
        if (e.key === "Enter" && sim && e.target && e.target.tagName === "INPUT") {
            e.preventDefault();
            sim.enter();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "q" || e.key === "Q") { aabnQuiz(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        if (e.key === "Enter" && sim) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            sim.enter();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-let"] = new NK.Forsoeg("let");
        sims["fane-mid"] = new NK.Forsoeg("mid");
        sims["fane-svr"] = new NK.Forsoeg("svr");
        NK.sims = sims;              /* saa forsoegene kan pilles ved fra konsollen og selvtesten */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);
        NK.opdaterFaneknapper();

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
        window.addEventListener("resize", function () { if (sims[aktivFane]) sims[aktivFane].tilpas(); });

        /* Man kan linke direkte til en fane med  index.html#nitrit  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        var HASH = { sodavand: "fane-let", let: "fane-let", nitrit: "fane-mid", middel: "fane-mid",
                     farvestoffer: "fane-svr", svaer: "fane-svr", "svær": "fane-svr", groen: "fane-svr" };
        visFane(HASH[oenske] || faner[0]);
        if (oenske === "quiz") aabnQuiz();

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

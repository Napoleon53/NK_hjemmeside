/* =====================================================================
   app.js - starter spillet (som sc1.4_afstemning, men uden faner)

   Overlays (teorien, butikken og esterkortet), tastaturgenveje og
   tegneloekken. Der er ingen laerer: hjaelpen staar i statuslinjen
   nederst i scenen (som sc1.4).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sim = null;
    var sidsteTid = 0;

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        if (sim && sim.fokus) sim.fokus();
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

        if (sim) {
            sim.tilpas();
            sim.opdater(dt * NK.tid.skala);
            sim.tegn();
        }
        NK.Fx.opdater(dt);
        NK.Fx.tegn();
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.key === "Escape") {
            lukAlle();
            if (NK.Rundvisning) NK.Rundvisning.luk();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start("fane-fb"); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "b" || e.key === "B") { if (sim) sim.aabnButik(); return; }
        if (e.key === "e" || e.key === "E") { if (sim) sim.kortet.aabn(); return; }
        if (e.key === "Enter" && sim && sim.enter) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            sim.enter();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        var i;
        NK.Fx.start();
        sim = new NK.Fabrik();
        NK.sim = sim;                /* saa modellen kan pilles ved fra konsollen og selvtesten */

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) {
            o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); });
        }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start("fane-fb"); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);

        document.addEventListener("keydown", tastatur);

        sim.tilpas();
        sim.layout();

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

/* =====================================================================
   app.js - starter spillet, binder knapper og tastatur, koerer loekken
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var sim = null;

    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "r" || e.key === "R") sim.nulstilNiveau();
        else if (e.key === "h" || e.key === "H" || e.key === "?") NK.startRundvisning();
    }

    function loekke() {
        sim.tilpas();
        sim.opdater();
        sim.tegn();
        window.requestAnimationFrame(loekke);
    }

    function start() {
        sim = new NK.SimByg();
        NK.sim = sim; /* saa man kan pille ved den fra konsollen */

        NK.el("tjek-knap").addEventListener("click", function () { sim.tjekSvar(); });
        NK.el("nulstil-knap").addEventListener("click", function () { sim.nulstilNiveau(); });
        NK.el("hint-knap").addEventListener("click", function () { sim.skiftHint(); });
        NK.el("naeste-knap").addEventListener("click", function () { sim.naesteNiveau(); });
        NK.el("rundvisning-knap").addEventListener("click", function () { NK.startRundvisning(); });

        window.addEventListener("resize", function () { sim.tilpas(); });
        document.addEventListener("keydown", tastatur);

        window.requestAnimationFrame(loekke);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

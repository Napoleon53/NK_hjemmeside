/* =====================================================================
   app.js - starter syntesen: tegneloekken, teorien, rundvisningen og
   tastaturet. Der er kun én fane.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var sim = null;
    var sidsteTid = 0;

    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabnTeori() {
        lukAlle();
        NK.el("teori").classList.add("vis");
    }

    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        sim.tilpas();
        sim.opdater(dt * NK.tid.skala);
        sim.tegn();
        window.requestAnimationFrame(loekke);
    }

    function tastatur(e) {
        if (e.key === "Escape") { lukAlle(); NK.Rundvisning.luk(); return; }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start("fane-syntese"); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
    }

    function start() {
        NK.Sprites.start();
        sim = new NK.Sim();
        NK.sim = sim;            /* saa modellen kan pilles ved fra konsollen og selvtesten */

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) { o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); }); }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start("fane-syntese"); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        document.addEventListener("keydown", tastatur);

        /* Et link kan begynde ved et trin: index.html#trin6 */
        var m = /trin(\d+)/.exec(window.location.hash || "");
        if (m) {
            var n = parseInt(m[1], 10) - 1;
            if (n > 0 && n < NK.Data.TRIN.length) sim.springTil(n);
        }

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());

/* =====================================================================
   app.js - opstart, teorien, tastaturgenveje og tegneloekken

   Der er én fane. En jagt kan vaelges med et link:
     index.html#3        jagt nummer 3
     index.html#c4h10o   jagten med molekylformlen C₄H₁₀O
   Uden link begynder siden ved den foerste jagt, der ikke er klaret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var sim = null;
    var sidsteTid = 0;

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
        sim.tilpas();
        sim.opdater(dt * NK.tid.skala);
        sim.tegn();
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.key === "Escape") {
            lukAlle();
            if (NK.Rundvisning) NK.Rundvisning.luk();
            if (!sim.sejrEl.hidden) sim.lukSejr();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        var aaben = NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis") || !sim.sejrEl.hidden;
        /* Fortryd og gentag paa tavlen */
        if ((e.ctrlKey || e.metaKey) && !aaben && sim.fase === "tegn" && !sim.groen) {
            var t = e.key.toLowerCase();
            if (t === "z" && !e.shiftKey) { sim.braet.fortryd(); e.preventDefault(); return; }
            if (t === "y" || (t === "z" && e.shiftKey)) { sim.braet.gentag(); e.preventDefault(); return; }
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (aaben) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start("fane-j"); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { sim.nulstil(); return; }
        /* Enter: Indsend svar (eller kortets groenne knap), men ikke paa de
           andre knapper og links */
        if (e.key === "Enter") {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest("#j-vaerktoej")) return;
            e.preventDefault();
            if (sim.groen) sim.videreKlik(); else sim.indsendKlik();
        }
    }

    /* Jagten fra linket: et nummer (1-5) eller molekylformlen */
    function jagtFraLink() {
        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase().replace(/^jagt/, ""); } catch (x) { oenske = ""; }
        if (/^\d+$/.test(oenske)) {
            var n = parseInt(oenske, 10) - 1;
            if (n >= 0 && n < D.JAGTER.length) return n;
        }
        for (var i = 0; i < D.JAGTER.length; i++) if (D.JAGTER[i].id === oenske) return i;
        return -1;
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sim = new NK.SimJagt();
        NK.sims = { "fane-j": sim };     /* saa jagten kan pilles ved fra konsollen og selvtesten */

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) {
            o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); });
        }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start("fane-j"); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);

        document.addEventListener("keydown", tastatur);
        window.addEventListener("resize", function () { sim.tilpas(); sim.layout(); });
        window.addEventListener("hashchange", function () { var n = jagtFraLink(); if (n >= 0) sim.vaelg(n); });

        sim.tilpas();
        var n = jagtFraLink();
        if (n < 0) {
            sim.nr = -1;
            n = sim.naesteUloeste();
            if (n < 0) n = 0;
        }
        sim.vaelg(n);

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

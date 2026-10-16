/* =====================================================================
   app.js - binder de fire faner sammen

   Faneskift, teorien, tastaturgenveje og tegneloekken. Kun den aktive
   fane opdateres og tegnes. Tilbuddet om Kemichaels praesentation
   kobles i hver fane (NK.Praesentation.kobl i sim_*.js).

   Tegnebraettet var fane 1 indtil 25. sept. 2026 og har nu sin egen side
   (../tegnebraet/). Et gammelt link til index.html#tegn sendes derhen.

   Tastatur: 1-4 fanerne (4 er oploeseligheden), H eller ?
   rundvisningen, T teorien, K Kemichael, R tegn forfra, Enter naeste,
   Ctrl+Z og Ctrl+Y fortryd og gentag, Delete sletter det, musen er over,
   Esc lukker.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var TEGNEBRAET = "../tegnebraet/index.html";
    var sims = {};
    var faner = ["fane-zigzag", "fane-navne", "fane-isomerer", "fane-oploeselighed"];
    var kort = { zigzag: "fane-zigzag", navne: "fane-navne", isomerer: "fane-isomerer",
        oploeselighed: "fane-oploeselighed", oploselighed: "fane-oploeselighed", polaritet: "fane-oploeselighed" };
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
            if (sims[id].fokus) sims[id].fokus();
            if (sims[id].startIntro) sims[id].startIntro(false);
        }
    }

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

    /* ----- Tegneloekken ------------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

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
        var iFelt = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
        if ((e.ctrlKey || e.metaKey) && !e.altKey && !iFelt && sim) {
            var k = e.key.toLowerCase();
            if (k === "z" && !e.shiftKey) { e.preventDefault(); sim.fortryd(); return; }
            if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); sim.gentag(); return; }
        }
        if (iFelt) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if ((e.key === "Delete" || e.key === "Backspace") && sim && sim.braet && !sim.braet.laast) {
            var o = sim.braet.over;
            if (o && o.slags === "atom") { e.preventDefault(); sim.braet.sletAtom(o.atom); return; }
            if (o && o.slags === "binding") { e.preventDefault(); sim.braet.sletBinding(o.binding); return; }
            if (o && o.slags === "objekt") { e.preventDefault(); sim.braet.sletObjekt(o.obj); return; }
            if (sim.slet && sim.slet()) { e.preventDefault(); return; }
        }
        if (e.key === "k" || e.key === "K") { if (sim && sim.startIntro) sim.startIntro(true); return; }
        if (e.key >= "1" && e.key <= "4") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim && sim.nulstil) sim.nulstil(); return; }
        if ((e.key === "Enter" || e.key === " ") && sim && sim.enter) { e.preventDefault(); sim.enter(); return; }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        if (oenske === "tegn" || oenske === "tegnebraet") { window.location.replace(TEGNEBRAET); return; }

        NK.Sprites.start();

        sims["fane-zigzag"] = new NK.SimZigzag();
        sims["fane-navne"] = new NK.SimNavne();
        sims["fane-isomerer"] = new NK.SimIsomerer();
        sims["fane-oploeselighed"] = new NK.SimOploes();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

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

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med  index.html#navne  */
        visFane(kort[oenske] || faner[0]);

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    NK.visFane = function (id) { visFane(kort[id] || id); };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

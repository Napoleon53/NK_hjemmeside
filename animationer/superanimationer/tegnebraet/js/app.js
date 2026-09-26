/* =====================================================================
   app.js - starter tegnebraettet

   Én fane: tegnebraettet. Navnene paa stofklasserne (teorien),
   tastaturgenveje og tegneloekken.

   Linket index.html#klister=kaffekop (fra vinduet med et nyt
   klistermaerke i sc6.2) aabner siden med klistermaerket klar.

   Tastatur: C, H, O, N, I, L (Cl) og B (Br) vaelger grundstoffet (Shift+C
   er ogsaa Cl), M Markér, ? rundvisningen (ikke H: det er hydrogen her),
   T navnene, K Kemichael, R ryd tavlen, Ctrl+Z og Ctrl+Y fortryd og
   gentag, Ctrl+A markér alt, Ctrl+C, Ctrl+X og Ctrl+V kopierer, klipper og
   indsaetter det markerede, Delete sletter det markerede eller det, musen
   er over, piletasterne flytter udsnittet, + og - zoomer, 0 viser alt,
   Esc lukker det, der er aabent, fjerner markeringen og gaar tilbage til C.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var FANE = "fane-tegn";
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
        if (dt > 0.1) dt = 0.1;
        sim.tilpas();
        sim.opdater(dt * NK.tid.skala);
        sim.tegn();
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        var b = sim.braet;
        if (e.key === "Escape") {
            /* Foerst det, der er aabent; saa markeringen; saa tilbage til C */
            if (document.querySelector(".overlay.vis") || NK.Rundvisning.aktiv()) { lukAlle(); NK.Rundvisning.luk(); return; }
            var intro = sim.springIntro();   /* Esc er det samme som Nej tak */
            if (b.harValgte()) { b.rydValg(); b.valgtObj = null; sim.visPanel(); return; }
            if (!intro && b.vaerktoej !== "tegn") b.tilTegn();
            return;
        }
        var iFelt = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
        if ((e.ctrlKey || e.metaKey) && !e.altKey && !iFelt) {
            var k = e.key.toLowerCase();
            if (k === "z" && !e.shiftKey) { e.preventDefault(); sim.fortryd(); return; }
            if (k === "y" || (k === "z" && e.shiftKey)) { e.preventDefault(); sim.gentag(); return; }
            /* Ctrl+A markerer alt (og skifter til Markér) */
            if (k === "a") { e.preventDefault(); b.vaerktoej = "marker"; b.vaelgAlt(); sim.visPanel(); return; }
            /* Ctrl+C, Ctrl+X og Ctrl+V: kopi af det markerede paa tavlen */
            if (k === "c" && b.harValgte()) { e.preventDefault(); sim.kopierValgte(); return; }
            if (k === "x" && b.harValgte() && !b.laast) { e.preventDefault(); if (b.klip()) sim.toast("Klippet. Ctrl+V sætter det ind igen.", "god"); return; }
            if (k === "v" && b.udklip && !b.laast) { e.preventDefault(); b.indsaet(); return; }
        }
        if (iFelt) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?") NK.Rundvisning.luk();
            return;
        }
        /* Grundstofferne: C, H, O, N, I, L (Cl, ogsaa Shift+C), B (Br). M: Markér.
           Derfor er rundvisningen kun paa ?, ikke paa H som i de andre animationer */
        var ATOMER = { c: "C", h: "H", o: "O", n: "N", i: "I", l: "Cl", b: "Br" };
        var bogstav = e.key.length === 1 ? e.key.toLowerCase() : "";
        if (ATOMER[bogstav]) { sim.vaelgGrundstof(bogstav === "c" && e.shiftKey ? "Cl" : ATOMER[bogstav]); return; }
        if (bogstav === "m") { sim.vaelgVaerktoej("marker"); return; }
        /* Piletasterne flytter udsnittet; + og - zoomer; 0 viser alt */
        var PIL = { ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
        if (PIL[e.key]) { e.preventDefault(); b.flytUdsnit(PIL[e.key][0] * 60, PIL[e.key][1] * 60); return; }
        if (e.key === "+") { b.zoomVed(1.25); return; }
        if (e.key === "-") { b.zoomVed(1 / 1.25); return; }
        if (e.key === "0") { sim.tilpasAlt(false); return; }
        if ((e.key === "Delete" || e.key === "Backspace") && !b.laast) {
            if (b.harValgte()) { e.preventDefault(); b.sletValgte(); return; }
            var o = b.over;
            if (o && o.slags === "atom") { e.preventDefault(); b.sletAtom(o.atom); return; }
            if (o && o.slags === "binding") { e.preventDefault(); b.sletBinding(o.binding); return; }
            if (o && o.slags === "objekt") { e.preventDefault(); b.sletObjekt(o.obj); return; }
            if (sim.slet()) { e.preventDefault(); return; }
        }
        if (e.key === "k" || e.key === "K") { sim.startIntro(true); return; }
        if (e.key === "?") { lukAlle(); NK.Rundvisning.start(FANE); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { sim.nulstil(); return; }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        sim = new NK.SimTegn();
        NK.sims = { "fane-tegn": sim };   /* saa modellen kan pilles ved fra konsollen */

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) {
            o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); });
        }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(FANE); });
        NK.el("teoriknap").addEventListener("click", aabnTeori);
        document.addEventListener("keydown", tastatur);

        sim.tilpas();
        sim.fokus();
        sim.startIntro(false);

        /* #klister=kaffekop: klistermaerket er klar til at blive sat paa */
        var m = /klister=([a-z0-9]+)/i.exec(window.location.hash || "");
        if (m) sim.vaelgKlister(decodeURIComponent(m[1]));

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

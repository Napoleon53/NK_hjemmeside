/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, navnetavlen i stort format, tastaturgenveje og
   tegneloekken. Kun den aktive fane opdateres og tegnes; opraabet
   holder pause, naar man forlader det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-montre", "fane-formler", "fane-opraab"];
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
        var spil = sims["fane-opraab"];
        if (spil && id !== "fane-opraab" && spil.tilstand === "koerer") {
            spil.tilstand = "pause";
            spil.visPanel();
        }
        aktivFane = id;
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            if (sims[id].fokus) sims[id].fokus();
            if (sims[id].startIntro) sims[id].startIntro(false);   /* kun første gang i browseren */
        }
    }

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        var sim = sims[aktivFane];
        if (sim && sim.fokus) sim.fokus();
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
            if (sim && sim.springIntro) sim.springIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        /* Opraabets fire svar ligger paa 1-4, mens de staar fremme */
        if (sim && sim.tast && sim.tast(e.key)) { e.preventDefault(); return; }
        if (e.key === "k" || e.key === "K") { if (sim && sim.startIntro) sim.startIntro(true); return; }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "p" || e.key === "P") { NK.Opslag.aabn(null); return; }
        if (e.key === "r" || e.key === "R") { if (sim && sim.nulstil) sim.nulstil(); return; }
        if ((e.key === "Enter" || e.key === " ") && sim && sim.enter) { e.preventDefault(); sim.enter(); return; }
        /* Et bogstav eller tal uden for feltet: skriv i feltet i stedet */
        if (e.key.length === 1 && sim && sim.fokus) sim.fokus();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        NK.Opslag.byg();

        sims["fane-montre"] = new NK.SimMontre();
        sims["fane-formler"] = new NK.SimFormler();
        sims["fane-opraab"] = new NK.SimOpraab();
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

        document.addEventListener("keydown", tastatur);

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med  index.html#formler  */
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

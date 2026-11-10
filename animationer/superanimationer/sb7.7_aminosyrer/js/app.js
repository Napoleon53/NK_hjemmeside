/* =====================================================================
   app.js - de tre faner, teorien, tastaturgenveje og tegneloekken

   Kun den aktive fane opdateres og tegnes. Der er ingen laerer: hjaelpen
   er den gule knap paa kortet.

   Man kan linke direkte til en fane:
     index.html#former     fane 1 Tre former
     index.html#fordeling  fane 2 Fordelingsdiagrammet
     index.html#felt       fane 3 Det elektriske felt
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = NK.Mol;

    var sims = {};
    var faner = ["fane-f", "fane-d", "fane-e"];
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
        tegnTeori();
    }

    /* Valins tre former med pilene imellem, tegnet af samme model som fanerne */
    function tegnTeori() {
        var c = NK.el("teori-former");
        if (!c) return;
        var dpr = window.devicePixelRatio || 1, W = 660, H = 206;
        c.width = W * dpr; c.height = H * dpr;
        var ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        var fs = 15, y = 62;
        [[104, { amino: 1, carboxyl: 1 }, "syreform", "ladning +1"], [330, { amino: 1, carboxyl: 0 }, "amfoion", "ladning 0"],
         [556, { amino: 0, carboxyl: 0 }, "baseform", "ladning −1"]].forEach(function (f) {
            M.tegn(ctx, D.VALIN, f[1], f[0], y, fs, {});
            NK.tekst(ctx, f[2], f[0], y + 76, { font: "800 15px " + M.FONT, farve: D.formFarve(f[2]), justering: "center", linje: "middle" });
            NK.tekst(ctx, f[3], f[0], y + 95, { font: "700 13px " + M.FONT, farve: D.FARVE.amfo, justering: "center", linje: "middle" });
        });
        [[217, D.PKS1], [443, D.PKS2]].forEach(function (p) {
            ctx.save();
            ctx.strokeStyle = D.FARVE.blaek;
            ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.moveTo(p[0] - 20, y - 4); ctx.lineTo(p[0] + 20, y - 4); ctx.lineTo(p[0] + 13, y - 9); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(p[0] + 20, y + 4); ctx.lineTo(p[0] - 20, y + 4); ctx.lineTo(p[0] - 13, y + 9); ctx.stroke();
            ctx.restore();
            M.tekst(ctx, "pK_s = " + D.komma2(p[1]), p[0], y - 30, 12.5, D.FARVE.syre, "center");
        });
        M.tekst(ctx, "Valin: pH_iso = ½ · (2,32 + 9,62) = 5,97", W / 2, H - 18, 13.5, D.FARVE.daempet, "center");
    }
    NK.tegnTeori = tegnTeori;

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
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var aaben = NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis");
        if (aaben) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        /* Piletasterne flytter pH-skyderen, hvor den kan bruges */
        if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && sim && sim.fri && sim.saetPh) {
            e.preventDefault();
            sim.saetPh(sim.ph + (e.key === "ArrowLeft" ? -1 : 1) * D.PH_SKRIDT);
            if (sim.nyRunde) sim.nyRunde(sim.ph);
            return;
        }
        /* Enter: Indsend svar (eller kortets groenne knap), men ikke paa andre knapper */
        if (e.key === "Enter" && sim) {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest(".scenekort")) return;
            e.preventDefault();
            if (sim.groen) sim.videreKlik();
            else if (sim.fase === "forsoeg" && sim.udfoer) sim.udfoer();
            else sim.indsendKlik();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-f"] = new NK.SimFormer();
        sims["fane-d"] = new NK.SimFordeling();
        sims["fane-e"] = new NK.SimFelt();
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

        faner.forEach(function (id) {
            var s = sims[id];
            s.tilpas();
            s.vaelg(0);
        });

        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { former: "fane-f", amfoion: "fane-f", "1": "fane-f",
                     fordeling: "fane-d", diagram: "fane-d", fordelingsdiagram: "fane-d", "2": "fane-d",
                     felt: "fane-e", "3": "fane-e" };
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

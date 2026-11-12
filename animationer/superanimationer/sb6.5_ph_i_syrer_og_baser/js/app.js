/* =====================================================================
   app.js - de tre faner, teorien, tastaturgenveje og tegneloekken
   (som sb6.1)

   Kun den aktive fane opdateres og tegnes. Der er ingen laerer: hjaelpen
   er den gule knap paa kortet.

   Man kan linke direkte til en fane:
     index.html#skema    fane 1 Skemaet
     index.html#vej      fane 2 Vælg vejen
     index.html#baser    fane 3 Baser og salte
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegning;

    var sims = {};
    var faner = ["fane-s", "fane-v", "fane-b"];
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

    /* Bogens figur b6-hvilken-formel: skalaen med fremgangsmaaden under
       hver gruppe */
    function tegnTeori() {
        var c = NK.el("teori-skala");
        if (!c) return;
        var F = NK.Formel;
        var dpr = window.devicePixelRatio || 1, W = 680, H = 176;
        c.width = W * dpr; c.height = H * dpr;
        var ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        var s = T.skalaLay(8, 6, W - 16, 1, { ks: false, flag: 2 });
        T.skala(ctx, s, { pil: false });
        var liste = ["hcl", "hcooh", "eddike", "nh4"].map(function (id) { return { p: D.SYRER[id].pks, tekst: D.SYRER[id].syre }; });
        var r = T.flagRaekker(ctx, s, liste);
        liste.forEach(function (f, i) { T.flag(ctx, s, f.p, f.tekst, r[i]); });
        var y = s.bund + 22;
        [["pH = −log c_s", -8, 0], ["løs ligningen", 0, 4], ["genvejen: pH = ½ · (pK_s − log c_s)", 4, 14]].forEach(function (v) {
            var x0 = T.pksTilX(s, v[1]) + 4, x1 = T.pksTilX(s, v[2]) - 4;
            ctx.save();
            ctx.strokeStyle = "#556766";
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(x0, y - 12); ctx.lineTo(x0, y - 16); ctx.lineTo(x1, y - 16); ctx.lineTo(x1, y - 12); ctx.stroke();
            ctx.restore();
            F.tekst(ctx, v[0], (x0 + x1) / 2, y + 2, 13, T.BLAEK, "center", { vaegt: 700 });
        });
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
        /* Enter: Indsend svar (eller kortets groenne knap), men ikke paa andre knapper */
        if (e.key === "Enter" && sim) {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest(".scenekort")) return;
            e.preventDefault();
            if (sim.groen) sim.videreKlik();
            else sim.indsendKlik();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        T.hentSprites();
        sims["fane-s"] = new NK.SimSkema();
        sims["fane-v"] = new NK.SimVej();
        sims["fane-b"] = new NK.SimBase();
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
        var HASH = { skema: "fane-s", skemaet: "fane-s", "1": "fane-s",
                     vej: "fane-v", vejen: "fane-v", "2": "fane-v",
                     baser: "fane-b", base: "fane-b", salte: "fane-b", "3": "fane-b" };
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

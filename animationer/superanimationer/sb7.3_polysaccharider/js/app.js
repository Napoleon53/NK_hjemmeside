/* =====================================================================
   app.js - de tre faner, teorien, tastaturgenveje og tegneloekken

   Kun den aktive fane opdateres og tegnes. Der er ingen laerer: hjaelpen
   er den gule knap paa kortet.

   Man kan linke direkte til en fane:
     index.html#kaede         fane 1 Byg kæden
     index.html#forgreninger  fane 2 Forgreninger
     index.html#iod           fane 3 Spyt og iod
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var E = NK.Enhed;

    var sims = {};
    var faner = ["fane-k", "fane-g", "fane-i"];
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

    /* Et stykke amylose og et stykke cellulose, tegnet af samme model som fane 1 */
    function tegnTeori() {
        var c = NK.el("teori-kaeder");
        if (!c) return;
        var dpr = window.devicePixelRatio || 1, W = 660, H = 210;
        c.width = W * dpr; c.height = H * dpr;
        var ctx = c.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, W, H);
        var s = 25, AF = NK.Data.AFSTAND;
        [["alfa", 168, "Amylose: α-1,4-glykosidbindinger"], ["beta", 498, "Cellulose: β-1,4-glykosidbindinger"]].forEach(function (k) {
            var form = k[0], x0 = k[1] - AF * s, y = 86, V = [];
            for (var i = 0; i < 3; i++) {
                var vend = form === "beta" && i === 1 ? 1 : 0;
                var r = E.enhed(ctx, { X: x0 + i * AF * s, Y: y, s: s, vend: vend, form: form, sub: { 1: null, 4: null }, tekst: 1 });
                V.push({ v: r.v, vend: vend });
            }
            for (i = 1; i < 3; i++) {
                var a = V[i - 1].v[1], b = V[i].v[4];
                var dir = E.retning1(form) * (V[i - 1].vend ? -1 : 1);
                E.bro(ctx, a, b, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + dir * 0.42 * s }, s, { gloed: true });
            }
            E.stump(ctx, V[0].v[4], -1, 1, s);
            E.stump(ctx, V[2].v[1], 1, form === "beta" ? -1 : 1, s);
            NK.tekst(ctx, k[2], k[1], 188, { font: "700 13px " + E.FONT, farve: "#1d2433", justering: "center", linje: "middle" });
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
            else if (sim.fase === "forsoeg" && sim.udfoer) sim.udfoer();
            else sim.indsendKlik();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-k"] = new NK.SimKaede();
        sims["fane-g"] = new NK.SimGren();
        sims["fane-i"] = new NK.SimIod();
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

        /* Fane 1 begynder ved det foerste, der ikke er klaret; fane 2 og 3 forfra */
        faner.forEach(function (id) {
            var s = sims[id];
            s.tilpas();
            s.nr = -1;
            var n = s.naesteUloeste();
            s.vaelg(n >= 0 ? n : 0);
        });

        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { kaede: "fane-k", "kæde": "fane-k", byg: "fane-k", "1": "fane-k",
                     forgreninger: "fane-g", glykogen: "fane-g", "2": "fane-g",
                     iod: "fane-i", spyt: "fane-i", "3": "fane-i" };
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

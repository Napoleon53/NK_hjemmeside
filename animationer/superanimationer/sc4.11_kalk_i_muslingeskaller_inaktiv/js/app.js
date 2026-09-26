/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, omskifteren Uden mol / Med mol, teorien, tastaturgenveje
   og tegneloekken. Kun den aktive fane opdateres og tegnes. Kemichael
   praesenterer ikke med knapper her: han sidder ved katederet og siger
   kun noget, naar eleven beder om et hint (den rolige udgave fra sc4.5).
   K faar ham til at sige, hvor man er.

   Omskifteren gaelder fane 2. Den huskes i browseren, og et link kan
   vaelge den: index.html#nf (uden mol) eller index.html#mol, gerne
   sammen med en fane, fx index.html#beregning-nf.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-forsoeg", "fane-beregning", "fane-fejl"];
    var aktivFane = faner[0];
    var sidsteTid = 0;
    var NOEGLE_NIVEAU = "nk-sc4.11-niveau";

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
            sims[id].startIntro(false);
            sims[id].fokus();
        }
    }
    /* Fanerne kan selv gaa videre til den naeste (knappen efter sidste opgave) */
    NK.visFane = visFane;

    /* ----- Uden mol eller med mol ------------------------------------------ */
    function visNiveau() {
        var knapper = document.querySelectorAll(".niveauknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-niveau") === NK.niveau;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-pressed", valgt ? "true" : "false");
        }
    }

    function saetNiveau(n) {
        n = n === "nf" ? "nf" : "mol";
        if (n === NK.niveau) return;
        NK.niveau = n;
        NK.gem(NOEGLE_NIVEAU, n);
        visNiveau();
        if (sims["fane-beregning"]) sims["fane-beregning"].nytNiveau();
    }
    NK.saetNiveau = saetNiveau;

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
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "k" || e.key === "K") { if (sim) sim.startIntro(true); return; }
        if (e.key === "m" || e.key === "M") { saetNiveau(NK.niveau === "nf" ? "mol" : "nf"); return; }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        if ((e.key === "Enter" || e.key === " ") && sim && sim.enter) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            sim.enter();
            return;
        }
        /* Et tal uden for feltet: skriv i feltet i stedet */
        if (e.key.length === 1 && sim) sim.fokus();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();

        /* Linket kan vaelge fane og vej: #beregning, #nf, #fejl-mol ... */
        var ord = (window.location.hash || "").replace(/^#/, "").toLowerCase().split(/[^a-zæøå0-9]+/);
        var gemt = NK.hent(NOEGLE_NIVEAU, "mol");
        NK.niveau = ord.indexOf("nf") >= 0 ? "nf" : (ord.indexOf("mol") >= 0 ? "mol" : (gemt === "nf" ? "nf" : "mol"));
        visNiveau();

        sims["fane-forsoeg"] = new NK.SimForsoeg();
        sims["fane-beregning"] = new NK.SimBeregning();
        sims["fane-fejl"] = new NK.SimFejl();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen og selvtesten */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        var nk = document.querySelectorAll(".niveauknap");
        function bindNiveau(knap) {
            knap.addEventListener("click", function () { saetNiveau(knap.getAttribute("data-niveau")); });
        }
        for (i = 0; i < nk.length; i++) bindNiveau(nk[i]);

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

        var navne = { forsoeg: "fane-forsoeg", "forsøg": "fane-forsoeg", beregning: "fane-beregning", fejl: "fane-fejl", fejlkilder: "fane-fejl" };
        var oenske = faner[0];
        ord.forEach(function (o) { if (navne[o]) oenske = navne[o]; });
        visFane(oenske);

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

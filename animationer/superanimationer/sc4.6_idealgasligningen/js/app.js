/* =====================================================================
   app.js - binder de to faner sammen

   Faneskift, teorien, tastaturgenveje og tegneloekken. Kun den aktive
   fane opdateres og tegnes. Kemichael praesenterer ikke med knapper her:
   han sidder ved katederet og siger kun noget, naar eleven beder om et
   hint eller svaret (den rolige Kemichael fra sc4.5, brugerens valg
   25. sept. 2026). K faar ham til at sige, hvor man er.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-stempel", "fane-regn"];
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
            sims[id].fokus();
        }
    }
    /* Fanerne kan selv gaa videre til den naeste (knappen efter sidste opgave) */
    NK.visFane = visFane;

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
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.type !== "range") return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "k" || e.key === "K") { if (sim) sim.startIntro(true); return; }
        if (e.key === "1" || e.key === "2") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        if ((e.key === "Enter" || e.key === " ") && sim && sim.enter) {
            if (e.target && e.target.tagName === "BUTTON") return;
            if (e.target && e.target.type === "range") return;
            e.preventDefault();
            sim.enter();
            return;
        }
        /* Et tal uden for feltet: skriv i feltet i stedet */
        if (e.key.length === 1 && sim && (!e.target || e.target.type !== "range")) sim.fokus();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();

        sims["fane-stempel"] = new NK.SimStempel();
        sims["fane-regn"] = new NK.SimRegn();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen og selvtesten */

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

        /* Man kan linke direkte til en fane med  index.html#regn  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        if (oenske === "beregning" || oenske === "beregningen") oenske = "regn";
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

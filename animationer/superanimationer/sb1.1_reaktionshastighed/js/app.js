/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teorien, tastaturgenveje og tegneloekken. Kun den aktive
   fane opdateres og tegnes. Kemichael er én for hele siden og tegnes
   paa den aktive fanes laerred.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Kemichael kommer ikke af sig selv: første gang står der Start
       præsentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Faneskift og Spring over (stopIntro) skjuler
       tilbuddet uden at huske det. */
    if (NK.Laerer) {
        NK.Praesentation.pakInd(NK.Laerer.prototype, {
            tilbud: function (id) { return { kurve: "kurve-tilbud", sammenstoed: "sam-tilbud", udtryk: "udtryk-tilbud" }[id]; },
            medId: true,
            set: function (id) { return !!NK.hent("nk-sb1.1-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-sb1.1-intro", {}); s[id] = true; NK.gem("nk-sb1.1-intro", s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }


    var sims = {};
    var faner = ["kurve", "sammenstoed", "udtryk"];
    var SPRING = { kurve: "kurve-spring", sammenstoed: "sam-spring", udtryk: "udtryk-spring" };
    var aktiv = "kurve";
    var laerer = null;
    var sidsteTid = 0;

    function visFane(id) {
        if (!sims[id]) return;
        aktiv = id;
        var afsnit = document.querySelectorAll(".fane");
        var knapper = document.querySelectorAll(".faneknap");
        var i;
        for (i = 0; i < afsnit.length; i++) afsnit[i].classList.toggle("aktiv", afsnit[i].id === "fane-" + id);
        for (i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-fane") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        NK.Rundvisning.luk();
        sims[id].tilpas();
        /* Foerste gang en fane aabnes i browseren, praesenterer Kemichael
           den. Er han midt i en anden, gaar han foerst. */
        if (laerer) {
            laerer.stopIntro();
            laerer.skiftLaerred(sims[id].L, SPRING[id]);
            laerer.startIntro(id, false);
        }
    }

    function aabn(id) { NK.el(id).classList.add("vis"); }
    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;                    /* undgaa spring efter faneskift */
        var sim = sims[aktiv];
        sim.tilpas();
        sim.opdater(dt);
        sim.tegn();
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(sim.L.ctx);
        }
        window.requestAnimationFrame(loekke);
    }

    function tastatur(e) {
        if (e.key === "Escape") {
            lukOverlay();
            NK.Rundvisning.luk();
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key >= "1" && e.key <= "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && laerer) { laerer.startIntro(aktiv, true); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start("fane-" + aktiv); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === " " && aktiv === "kurve") {
            if (e.target && e.target.tagName === "BUTTON") return;   /* mellemrum trykker allerede paa knappen */
            e.preventDefault();
            sims.kurve.afspil();
            return;
        }
        if (e.key === "r" || e.key === "R") sims[aktiv].nulstil();
    }

    function start() {
        if (NK.Sprites) NK.Sprites.start();
        sims.kurve = new NK.SimKurve();
        sims.sammenstoed = new NK.SimSammenstoed();
        sims.udtryk = new NK.SimUdtryk();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */
        NK.visFane = visFane;

        if (NK.Laerer) {
            laerer = new NK.Laerer(sims.kurve.L, SPRING.kurve);
            NK.laerer = laerer;
            Object.keys(SPRING).forEach(function (id) {
                NK.el(SPRING[id]).addEventListener("click", function () { laerer.stopIntro(); });
            });
        }

        /* Et tryk paa laerredet gaar foerst til Kemichael: under
           praesentationen taeller det, ellers svarer han selv. */
        NK.laererFanger = function (p) {
            if (!laerer) return false;
            if (laerer.laererIntroKlik(p.x, p.y)) return true;
            return laerer.laererKlik(p.x, p.y);
        };
        NK.laererUnder = function (p) {
            return !!(laerer && laerer.laererUnder(p.x, p.y));
        };

        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { visFane(k.getAttribute("data-fane")); });
            }(knapper[i]));
        }

        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start("fane-" + aktiv); });
        NK.el("teoriknap").addEventListener("click", function () { aabn("teori"); });
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === NK.el("teori")) lukOverlay(); });
        document.addEventListener("keydown", tastatur);

        /* Direkte link til en fane: index.html#sammenstoed */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        oenske = { "sammenstød": "sammenstoed", "hastighedsudtryk": "udtryk" }[decodeURIComponent(oenske)] || oenske;
        visFane(sims[oenske] ? oenske : "kurve");

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());

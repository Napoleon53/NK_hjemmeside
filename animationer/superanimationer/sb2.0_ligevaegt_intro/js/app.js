/* =====================================================================
   app.js - binder de fire faner sammen
   Faneskift, tidsstyring, tastaturgenveje og selve tegneloekken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Knapperne "Antal / Hastighed" over hver graf. */
    NK.grafSkift = function (praefix, graf) {
        var knapper = document.querySelectorAll('.grafskift button[data-graf="' + praefix + '"]');
        function bind(knap) {
            knap.addEventListener("click", function () {
                for (var j = 0; j < knapper.length; j++) knapper[j].classList.remove("aktiv");
                knap.classList.add("aktiv");
                graf.visGruppe(knap.getAttribute("data-gruppe"));
            });
        }
        for (var i = 0; i < knapper.length; i++) bind(knapper[i]);
    };

    var sims = {};
    var aktivFane = "fane-bro";
    var sidsteTid = 0;

    /* ----- Faner ---------------------------------------------------- */
    function visFane(id) {
        var faner = document.querySelectorAll(".fane");
        var knapper = document.querySelectorAll(".faneknap");
        var i;
        for (i = 0; i < faner.length; i++) faner[i].classList.toggle("aktiv", faner[i].id === id);
        for (i = 0; i < knapper.length; i++) {
            knapper[i].classList.toggle("aktiv", knapper[i].getAttribute("data-fane") === id);
            knapper[i].setAttribute("aria-selected", knapper[i].getAttribute("data-fane") === id ? "true" : "false");
        }
        aktivFane = id;
        if (sims[id]) sims[id].tilpas();
    }

    /* ----- Tidsstyring ---------------------------------------------- */
    function saetFart(vaerdi, knap) {
        NK.tid.skala = vaerdi;
        var knapper = document.querySelectorAll(".tidsknap[data-fart]");
        for (var i = 0; i < knapper.length; i++) knapper[i].classList.remove("aktiv");
        if (knap) knap.classList.add("aktiv");
    }

    function skiftPause() {
        NK.tid.pause = !NK.tid.pause;
        var k = NK.el("pauseknap");
        k.classList.toggle("slaaet-til", NK.tid.pause);
        k.textContent = NK.tid.pause ? "▶" : "❚❚";
        k.setAttribute("aria-label", NK.tid.pause ? "Fortsæt" : "Pause");
    }

    /* ----- Hjaelp ---------------------------------------------------- */
    function visHjaelp(vis) {
        NK.el("hjaelp").classList.toggle("vis", vis);
    }

    /* ----- Tegneloekke ---------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;                     // undgaa spring efter faneskift

        var sim = sims[aktivFane];
        if (sim) {
            sim.tilpas();                           // fanger alle stoerrelsesaendringer
            sim.opdater(NK.tid.pause ? 0 : dt * NK.tid.skala);
            sim.tegn();
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart --------------------------------------------------- */
    function start() {
        NK.Sprites.start();

        sims["fane-bro"] = new NK.SimBro();
        sims["fane-natur"] = new NK.SimNatur();
        sims["fane-marked"] = new NK.SimMarked();
        sims["fane-kemi"] = new NK.SimKemi();
        NK.sims = sims;   // gor det muligt at pille ved modellerne fra konsollen

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () {
                visFane(knap.getAttribute("data-fane"));
            });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        var fartknapper = document.querySelectorAll(".tidsknap[data-fart]");
        function bindFart(knap) {
            knap.addEventListener("click", function () {
                saetFart(parseFloat(knap.getAttribute("data-fart")), knap);
            });
        }
        for (var j = 0; j < fartknapper.length; j++) bindFart(fartknapper[j]);

        NK.el("pauseknap").addEventListener("click", skiftPause);
        NK.el("hjaelpknap").addEventListener("click", function () { visHjaelp(true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { visHjaelp(false); });
        NK.el("hjaelp").addEventListener("click", function (e) {
            if (e.target.id === "hjaelp") visHjaelp(false);
        });

        document.addEventListener("keydown", function (e) {
            if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            var faner = ["fane-bro", "fane-natur", "fane-marked", "fane-kemi"];
            if (e.key >= "1" && e.key <= "4") {
                visFane(faner[parseInt(e.key, 10) - 1]);
            } else if (e.code === "Space") {
                e.preventDefault();
                skiftPause();
            } else if (e.key === "r" || e.key === "R") {
                if (sims[aktivFane]) sims[aktivFane].nulstil();
            } else if (e.key === "?" || e.key === "h" || e.key === "H") {
                visHjaelp(!NK.el("hjaelp").classList.contains("vis"));
            } else if (e.key === "Escape") {
                visHjaelp(false);
            }
        });

        /* Alle laerreder maales en gang, saa foerste billede bliver rigtigt. */
        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med fx  index.html#kemi  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        var start = sims["fane-" + oenske] ? "fane-" + oenske : (sims[oenske] ? oenske : "fane-bro");
        visFane(start);

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

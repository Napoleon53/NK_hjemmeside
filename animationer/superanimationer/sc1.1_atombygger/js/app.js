/* =====================================================================
   app.js - binder de fire faner sammen

   Faneskift, tastaturgenveje og tegneloekken. Kun den aktive fane
   opdateres og tegnes, saa de tre andre koster ingenting. Der er ingen
   fartvaelger - elektronerne staar fast i deres skaller, og de eneste
   ting der bevaeger sig (partikler der flyver ind eller ud) koerer
   altid i normal hastighed.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-byg", "fane-isotop", "fane-ion", "fane-salt"];
    var aktivFane = "fane-byg";
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
        if (sims[id]) sims[id].tilpas();
    }

    /* ----- Hjaelp og andre pop op-vinduer ------------------------------ */
    function visHjaelp(vis) {
        NK.el("hjaelp").classList.toggle("vis", vis);
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    /* ----- Tegneloekken ------------------------------------------------ */
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

    /* ----- Tastatur ----------------------------------------------------- */
    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        var sim = sims[aktivFane];

        if (e.key >= "1" && e.key <= "4") {
            visFane(faner[parseInt(e.key, 10) - 1]);
            return;
        }
        if (e.key === "Escape") { lukOverlay(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            visHjaelp(!NK.el("hjaelp").classList.contains("vis"));
            return;
        }
        if (e.key === "r" || e.key === "R") {
            if (sim && sim.nulstil) sim.nulstil();
            return;
        }
        /* Paa byggefanen kan partiklerne ogsaa laegges i fra tastaturet:
           lille bogstav laegger til, stort bogstav tager fra. */
        if (aktivFane === "fane-byg" && sim) {
            var kort = { p: "p", P: "p", n: "n", N: "n", e: "e", E: "e" };
            var slags = kort[e.key];
            if (slags) sim.aendr(slags, e.key === e.key.toUpperCase() ? -1 : 1);
        }
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        sims["fane-byg"] = new NK.SimByg();
        sims["fane-isotop"] = new NK.SimIsotop();
        sims["fane-ion"] = new NK.SimIon();
        sims["fane-salt"] = new NK.SimSalt();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        /* Kernevisningen (enkeltvis/antal) gaelder alle faner paa én gang. */
        var visKnapper = document.querySelectorAll(".visknap");
        function bindVis(knap) {
            knap.addEventListener("click", function () {
                var v = knap.getAttribute("data-vis");
                for (var j = 0; j < visKnapper.length; j++) visKnapper[j].classList.toggle("aktiv", visKnapper[j] === knap);
                NK.saetKerneVisning(v);
            });
        }
        for (var vi = 0; vi < visKnapper.length; vi++) {
            visKnapper[vi].classList.toggle("aktiv", visKnapper[vi].getAttribute("data-vis") === NK.indstil.kerneVisning);
            bindVis(visKnapper[vi]);
        }

        NK.el("hjaelpknap").addEventListener("click", function () { visHjaelp(true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { visHjaelp(false); });
        NK.el("hjaelp").addEventListener("click", function (e) {
            if (e.target.id === "hjaelp") visHjaelp(false);
        });

        document.addEventListener("keydown", tastatur);

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med fx  index.html#isotop  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(sims["fane-" + oenske] ? "fane-" + oenske : "fane-byg");

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

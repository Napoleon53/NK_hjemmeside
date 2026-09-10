/* =====================================================================
   app.js - binder de fire faner sammen

   Faneskift, tidsstyring, tastaturgenveje og tegneloekken. Kun den
   aktive fane opdateres og tegnes, saa de tre andre koster ingenting.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-lab", "fane-kurve", "fane-fordeling", "fane-ukendt"];
    var aktivFane = "fane-lab";
    var sidsteTid = 0;

    /* Under denne bredde er der ikke plads til venstre spalte ved siden
       af scenen. Stilarket lader den i stedet glide ind OVER scenen, og
       saa skal den vaere skjult, indtil man selv beder om den. Tallet
       skal passe med @media-reglen i css/stil.css. */
    var SMAL = 1120;
    function erSmal() { return window.innerWidth <= SMAL; }

    var opsOenskes = !erSmal();   /* brugerens eget valg om venstre spalte */

    /* ----- Venstre spalte -------------------------------------------- */
    function opdaterOps() {
        /* Den ukendte proeve har sin egen opstilling, som eleven ikke
           maa kunne kigge i. */
        var skjul = (aktivFane === "fane-ukendt") || !opsOenskes;
        NK.el("opsaetning").classList.toggle("skjult", skjul);
        NK.el("opsknap").disabled = (aktivFane === "fane-ukendt");
    }

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
        opdaterOps();
        if (sims[id]) {
            sims[id].tilpas();
            if (sims[id].nyOpstilling && id === "fane-fordeling") sims[id].nyOpstilling("opstilling");
        }
    }

    /* ----- Tidsstyring ------------------------------------------------ */
    function saetFart(vaerdi, knap) {
        NK.tid.skala = vaerdi;
        var knapper = document.querySelectorAll(".tidsknap[data-fart]");
        for (var i = 0; i < knapper.length; i++) knapper[i].classList.remove("aktiv");
        if (knap) knap.classList.add("aktiv");
    }

    /* ----- Hjaelp ------------------------------------------------------ */
    function visHjaelp(vis) {
        NK.el("hjaelp").classList.toggle("vis", vis);
    }

    /* ----- Tegneloekken ------------------------------------------------ */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;                     /* undgaa spring efter faneskift */

        var sim = sims[aktivFane];
        if (sim) {
            sim.tilpas();
            sim.opdater(dt * NK.tid.skala);
            sim.tegn();
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ----------------------------------------------------- */
    function start() {
        NK.Ops.byg();

        sims["fane-lab"] = new NK.SimLab();
        sims["fane-kurve"] = new NK.SimKurve();
        sims["fane-fordeling"] = new NK.SimFordeling();
        sims["fane-ukendt"] = new NK.SimUkendt();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

        /* Alle faner faar besked, naar opstillingen aendres. */
        NK.Ops.paaAendring(function (aarsag) {
            for (var i = 0; i < faner.length; i++) {
                var s = sims[faner[i]];
                if (s && s.nyOpstilling && faner[i] !== "fane-ukendt") s.nyOpstilling(aarsag);
            }
        });

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

        NK.el("opsknap").addEventListener("click", function () {
            opsOenskes = !opsOenskes;
            opdaterOps();
        });

        /* Naar vinduet gaar over eller under graensen, skifter spalten
           mellem at staa ved siden af scenen og at ligge oven paa den. */
        var varSmal = erSmal();
        window.addEventListener("resize", function () {
            if (erSmal() === varSmal) return;
            varSmal = erSmal();
            opsOenskes = !varSmal;
            opdaterOps();
        });

        NK.el("hjaelpknap").addEventListener("click", function () { visHjaelp(true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { visHjaelp(false); });
        NK.el("hjaelp").addEventListener("click", function (e) {
            if (e.target.id === "hjaelp") visHjaelp(false);
        });

        document.addEventListener("keydown", function (e) {
            if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
            var sim = sims[aktivFane];
            if (e.key >= "1" && e.key <= "4") {
                visFane(faner[parseInt(e.key, 10) - 1]);
            } else if (e.code === "Space") {
                e.preventDefault();
                if (sim && sim.bord) sim.bord.saetHane(!sim.bord.aaben);
            } else if (e.key === "d" || e.key === "D") {
                if (sim && sim.bord) sim.bord.draabe();
            } else if (e.key === "r" || e.key === "R") {
                if (sim && sim.nulstil) sim.nulstil();
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

        /* Man kan linke direkte til en fane med fx  index.html#kurve  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        var start_fane = sims["fane-" + oenske] ? "fane-" + oenske : "fane-lab";
        visFane(start_fane);

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

/* =====================================================================
   app.js - binder de to faner sammen

   Faneskift, de tre overlays (teori, quiz, hjaelp), tastaturgenveje og
   tegneloekken. Kun den aktive fane opdateres og tegnes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-oploes", "fane-maetning"];
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
        if (sims[id]) sims[id].tilpas();
    }

    /* ----- Overlays ---------------------------------------------------- */
    function vis(id, aaben) {
        NK.el(id).classList.toggle("vis", aaben);
    }

    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    /* Teoriboksen bygges af D.TEORI, saa teksterne kun staar ét sted. */
    function bygTeori() {
        var vaert = NK.el("teori-liste");
        NK.Data.TEORI.forEach(function (afsnit) {
            var kort = document.createElement("div");
            kort.className = "teorikort";
            var h = document.createElement("h4");
            h.textContent = afsnit.h;
            kort.appendChild(h);
            afsnit.p.forEach(function (tekst) {
                var p = document.createElement("p");
                p.innerHTML = tekst;
                kort.appendChild(p);
            });
            vaert.appendChild(kort);
        });
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
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;

        if (e.key === "1" || e.key === "2") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "Escape") { lukAlle(); return; }
        if (e.key === "t" || e.key === "T") { vis("teori", !NK.el("teori").classList.contains("vis")); return; }
        if (e.key === "q" || e.key === "Q") { NK.Quiz.aabn(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            vis("hjaelp", !NK.el("hjaelp").classList.contains("vis"));
            return;
        }
        if (e.key === "r" || e.key === "R") {
            var sim = sims[aktivFane];
            if (sim && sim.nulstil) sim.nulstil();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        bygTeori();
        NK.Quiz.kobl();

        sims["fane-oploes"] = new NK.SimOploes();
        sims["fane-maetning"] = new NK.SimMaetning();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        NK.el("teoriknap").addEventListener("click", function () { vis("teori", true); });
        NK.el("teori-luk").addEventListener("click", function () { vis("teori", false); });
        NK.el("teori").addEventListener("click", function (e) { if (e.target.id === "teori") vis("teori", false); });

        NK.el("quizknap").addEventListener("click", function () { NK.Quiz.aabn(); });

        NK.el("hjaelpknap").addEventListener("click", function () { vis("hjaelp", true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { vis("hjaelp", false); });
        NK.el("hjaelp").addEventListener("click", function (e) { if (e.target.id === "hjaelp") vis("hjaelp", false); });

        document.addEventListener("keydown", tastatur);

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med fx  index.html#maetning  */
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

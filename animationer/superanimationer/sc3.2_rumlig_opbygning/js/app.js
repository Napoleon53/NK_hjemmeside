/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teoriboksen, rundvisningen, tastaturgenveje og
   tegneloekken. Kun den aktive fane opdateres og tegnes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-byg", "fane-molekyler", "fane-polaritet"];
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
        NK.Rundvisning.luk();
        if (sims[id]) sims[id].tilpas();
    }

    /* ----- Teoriboksen ------------------------------------------------- */
    function visTeori(aaben) {
        NK.el("teori").classList.toggle("vis", aaben);
    }

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
        if (dt > 0.1) dt = 0.1;

        var sim = sims[aktivFane];
        if (sim) {
            sim.tilpas();
            sim.opdater(dt);
            sim.tegn();
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") { visTeori(false); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { visTeori(false); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv()) {
            if (e.key === "ArrowRight" || e.key === "Enter") NK.Rundvisning.naeste();
            else if (e.key === "ArrowLeft") NK.Rundvisning.forrige();
            return;
        }
        if (e.key === "t" || e.key === "T") { visTeori(!NK.el("teori").classList.contains("vis")); return; }
        if (NK.el("teori").classList.contains("vis")) return;

        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        var sim = sims[aktivFane];
        if (!sim) return;
        if (e.key === "r" || e.key === "R") sim.nulstil();
        else if (e.key === "v" || e.key === "V") sim.skiftVinkelmaaler();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Data.klargoer();
        NK.Sprites.start();
        bygTeori();

        sims["fane-byg"] = new NK.SimByg();
        sims["fane-molekyler"] = new NK.SimMolekyler();
        sims["fane-polaritet"] = new NK.SimPolaritet();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen og _selvtest.html */
        NK.visFane = visFane;

        Array.prototype.forEach.call(document.querySelectorAll(".faneknap"), function (knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        });

        NK.el("teoriknap").addEventListener("click", function () { NK.Rundvisning.luk(); visTeori(true); });
        NK.el("teori-luk").addEventListener("click", function () { visTeori(false); });
        NK.el("teori").addEventListener("click", function (e) { if (e.target.id === "teori") visTeori(false); });
        NK.el("hjaelpknap").addEventListener("click", function () { visTeori(false); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastatur);

        /* Man kan linke direkte til en fane med fx  index.html#polaritet  */
        var oenske = "fane-" + (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(sims[oenske] ? oenske : faner[0]);

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

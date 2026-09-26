/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teoriboksen, tegneserien, rundvisningen, Kemichael,
   tastaturgenveje og tegneloekken. Kun den aktive fane opdateres og
   tegnes.

   Kemichael (NK.Laerer) tegnes paa sit eget lag. Laget, tilbuddet om
   praesentationen og knappen, der springer den over, flyttes ind i den
   aktive fanes scene ved hvert faneskift, saa de altid sidder midt
   foroven i det, eleven kigger paa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Kemichael kommer ikke af sig selv: første gang står der Start
       præsentation og Nej tak (js/praesentation.js). Esc er det samme
       som Nej tak. Faneskift og Spring over (stopIntro) skjuler
       tilbuddet uden at huske det. */
    var NOEGLE = "nk-sc3.3-intro";
    if (NK.Laerer) {
        NK.Praesentation.pakInd(NK.Laerer.prototype, {
            tilbud: "tilbud",
            medId: true,
            set: function (id) { return !!NK.hent(NOEGLE, {})[id]; },
            husk: function (id) { var s = NK.hent(NOEGLE, {}); s[id] = true; NK.gem(NOEGLE, s); }
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
    var faner = ["fane-en", "fane-polaritet", "fane-vand"];
    var aktivFane = faner[0];
    var sidsteTid = 0;
    var lag = null, laerer = null;

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

        /* Kemichaels lag og knapper flytter med ind i den nye scene */
        var scene = document.querySelector("#" + id + " .scene");
        ["laerer-lag", "tilbud", "spring-over"].forEach(function (e) { scene.appendChild(NK.el(e)); });
        if (sims[id]) sims[id].tilpas();
        if (laerer) {
            laerer.stopIntro();
            laerer.startIntro(id, false);
        }
    }

    /* ----- Teoriboksen og tegneserien ------------------------------------ */
    function vis(id, aaben) {
        NK.el(id).classList.toggle("vis", aaben);
    }

    function lukOverlays() {
        vis("teori", false);
        vis("tegneserie", false);
    }

    function overlayAaben() {
        return !!document.querySelector(".overlay.vis");
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

    function aabnSerie() {
        var sim = sims["fane-vand"];
        if (!sim.slut()) return;
        NK.Rundvisning.luk();
        NK.Tegneserie.byg(sim, NK.el("serie-ruder"));
        vis("tegneserie", true);
        sim.serieSet = true;
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
        if (laerer) {
            lag.tilpas();
            lag.ryd();
            laerer.opdater(dt);
            laerer.laererTegnOver(lag.ctx);
        }
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") {
            lukOverlays();
            NK.Rundvisning.luk();
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlays(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv()) {
            if (e.key === "ArrowRight" || e.key === "Enter") NK.Rundvisning.naeste();
            else if (e.key === "ArrowLeft") NK.Rundvisning.forrige();
            return;
        }
        if (e.key === "t" || e.key === "T") {
            var aaben = NK.el("teori").classList.contains("vis");
            lukOverlays();
            vis("teori", !aaben);
            return;
        }
        if (overlayAaben()) return;

        if (/^[1-3]$/.test(e.key)) { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && laerer) { laerer.startIntro(aktivFane, true); return; }
        var sim = sims[aktivFane];
        if (!sim) return;
        if (e.key === "r" || e.key === "R") sim.nulstil();
        else if ((e.key === "s" || e.key === "S") && aktivFane === "fane-vand") aabnSerie();
    }

    /* Punktet i Kemichaels lag, hvor musen er */
    function punkt(e) {
        var r = lag.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Data.klargoer();
        NK.Sprites.start();
        bygTeori();

        lag = new NK.Laerred(NK.el("laerer-lag"));
        if (NK.Laerer) {
            laerer = new NK.Laerer(lag);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }

        sims["fane-en"] = new NK.SimEN();
        sims["fane-polaritet"] = new NK.SimPolaritet();
        sims["fane-vand"] = new NK.SimVandstraale();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen og _selvtest.html */
        NK.visFane = visFane;
        NK.aabnSerie = aabnSerie;
        NK.aktivFane = function () { return aktivFane; };

        Array.prototype.forEach.call(document.querySelectorAll(".faneknap"), function (knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        });

        NK.el("teoriknap").addEventListener("click", function () { NK.Rundvisning.luk(); lukOverlays(); vis("teori", true); });
        NK.el("teori-luk").addEventListener("click", function () { vis("teori", false); });
        NK.el("teori").addEventListener("click", function (e) { if (e.target.id === "teori") vis("teori", false); });
        NK.el("vand-serieknap").addEventListener("click", aabnSerie);
        NK.el("serie-luk").addEventListener("click", function () { vis("tegneserie", false); });
        NK.el("tegneserie").addEventListener("click", function (e) { if (e.target.id === "tegneserie") vis("tegneserie", false); });
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlays(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastatur);

        /* Klik paa Kemichael: laget tager ikke imod musen, saa klikket
           fanges paa vej ned til scenen. Rammer det ham, naar det ikke
           videre til laerredet bag ham. */
        var hoved = document.querySelector("main");
        hoved.addEventListener("pointerdown", function (e) {
            if (!laerer || e.target === NK.el("spring-over") || NK.el("tilbud").contains(e.target)) return;
            var p = punkt(e);
            if (laerer.laererIntroKlik(p.x, p.y) || laerer.laererKlik(p.x, p.y)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
        window.addEventListener("pointermove", function (e) {
            if (!laerer) return;
            var p = punkt(e);
            if (laerer.laererUnder(p.x, p.y)) {
                var cvs = document.querySelector(".fane.aktiv .scene > canvas");
                if (cvs) cvs.style.cursor = "pointer";
            }
        });

        /* Man kan linke direkte til en fane med fx  index.html#vand  */
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

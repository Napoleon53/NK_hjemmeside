/* =====================================================================
   app.js - starter fanerne, binder knapper og tastatur, koerer loekken

   To faner paa samme laerred: Byg (NK.SimByg) og Find fejlen
   (NK.SimFejl). Kun den aktive fane opdateres og tegnes, og kun den
   tager imod musen (aktiv). Kemichael (NK.Laerer) tegnes paa sit eget
   lag oven over det hele og praesenterer hver fane første gang.

   Hintboksen er faelles, men husker sit indhold for hver fane, saa et
   hint ikke forsvinder, fordi eleven kigger paa den anden fane.
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
            tilbud: "tilbud",
            medId: true,
            set: function (id) { return !!NK.hent("nk-sc3.1-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-sc3.1-intro", {}); s[id] = true; NK.gem("nk-sc3.1-intro", s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }

    var faner = {};
    var raekke = ["byg", "fejl"];
    var aktivId = "byg";
    var laerred = null, lag = null, laerer = null;
    var sidsteTid = 0;

    /* ----- Hint og besked, faelles for fanerne ------------------------- */
    var hints = { byg: { vis: false }, fejl: { vis: false } };

    function visHintBoks() {
        var h = hints[aktivId];
        if (h.vis) {
            NK.el("hint-boks-titel").textContent = h.titel;
            NK.el("hint-tekst").textContent = h.tekst;
            var img = NK.el("hint-sprite");
            if (h.sprite) { img.src = h.sprite; img.hidden = false; }
            else { img.hidden = true; img.removeAttribute("src"); }
        }
        NK.el("hint-boks").classList.toggle("vis", !!h.vis);
    }

    NK.visHint = function (fane, titel, tekst, sprite) {
        hints[fane] = { vis: true, titel: titel, tekst: tekst, sprite: sprite || null };
        if (fane === aktivId) visHintBoks();
    };

    NK.skjulHint = function (fane) {
        hints[fane] = { vis: false };
        if (fane === aktivId) visHintBoks();
    };

    var toastUr = null;
    NK.visToast = function (tekst) {
        var t = NK.el("toast");
        t.textContent = tekst;
        t.classList.add("vis");
        clearTimeout(toastUr);
        toastUr = setTimeout(function () { t.classList.remove("vis"); }, 3000);
    };

    /* ----- Faneskift ----------------------------------------------------- */
    function visFane(id) {
        if (!faner[id]) return;
        aktivId = id;
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-fane") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        document.body.setAttribute("data-fane", id);
        raekke.forEach(function (k) { faner[k].aktiv = k === id; });
        laerred.canvas.style.cursor = "default";
        NK.el("toast").classList.remove("vis");
        if (NK.lukRundvisning) NK.lukRundvisning();
        visHintBoks();
        faner[id].opdaterTaeller();
        /* Foerste gang en fane aabnes i browseren, praesenterer Kemichael
           den. Er han midt i en anden, gaar han foerst. */
        if (laerer) {
            laerer.stopIntro();
            laerer.startIntro(id, false);
        }
    }

    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        laerred.tilpas();
        var f = faner[aktivId];
        f.tilpas();
        f.opdater(dt);
        f.tegn();
        if (laerer) {
            lag.tilpas();
            lag.ryd();
            laerer.opdater(dt);
            laerer.laererTegnOver(lag.ctx);
        }
        window.requestAnimationFrame(loekke);
    }

    function tastatur(e) {
        if (e.key === "Escape") {
            if (laerer && !laerer.afvisTilbud()) laerer.stopIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "1" || e.key === "2") { visFane(raekke[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && laerer) { laerer.startIntro(aktivId, true); return; }
        if (e.key === "h" || e.key === "H" || e.key === "?") { NK.startRundvisning(); return; }
        if (e.key === "r" || e.key === "R") faner[aktivId].nulstil();
    }

    /* Punktet i Kemichaels lag (= scenen), hvor musen er */
    function punkt(e) {
        var r = lag.canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function start() {
        laerred = new NK.Laerred(NK.el("laerred"));
        lag = new NK.Laerred(NK.el("laerer-lag"));
        laerred.tilpas();
        lag.tilpas();

        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(lag);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }

        faner.byg = new NK.SimByg(laerred);
        faner.fejl = new NK.SimFejl(laerred);
        NK.sim = faner.byg;         /* saa man kan pille ved dem fra konsollen og selvtesten */
        NK.fejl = faner.fejl;
        NK.faner = faner;
        NK.visFane = visFane;
        NK.aktivFane = function () { return aktivId; };

        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { visFane(k.getAttribute("data-fane")); });
            }(knapper[i]));
        }

        NK.el("tjek-knap").addEventListener("click", function () { faner.byg.tjekSvar(); });
        NK.el("nulstil-knap").addEventListener("click", function () { faner.byg.nulstilNiveau(); });
        NK.el("byg-knap").addEventListener("click", function () { faner.byg.hjaelp(); });
        NK.el("naeste-knap").addEventListener("click", function () { faner.byg.naesteNiveau(); });
        NK.el("fejl-knap").addEventListener("click", function () { faner.fejl.knap(); });
        NK.el("hint-luk").addEventListener("click", function () {
            hints[aktivId].vis = false;
            visHintBoks();
        });
        NK.el("rundvisning-knap").addEventListener("click", function () { NK.startRundvisning(); });
        document.addEventListener("keydown", tastatur);

        /* Klik paa Kemichael: laget tager ikke imod musen, saa klikket
           fanges paa vej ned til scenen. Rammer det ham, naar det ikke
           videre til laerredet eller vinduet bag ham. */
        var scene = NK.el("scene");
        scene.addEventListener("mousedown", function (e) {
            if (!laerer) return;
            var p = punkt(e);
            if (laerer.laererIntroKlik(p.x, p.y) || laerer.laererKlik(p.x, p.y)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);
        scene.addEventListener("click", function (e) {
            if (!laerer || e.target === NK.el("spring-over")) return;
            var p = punkt(e);
            if (laerer.laererUnder(p.x, p.y)) e.stopPropagation();
        }, true);
        window.addEventListener("mousemove", function (e) {
            if (!laerer) return;
            var p = punkt(e);
            if (laerer.laererUnder(p.x, p.y)) laerred.canvas.style.cursor = "pointer";
        });

        /* Direkte link til en fane: index.html#fejl (eller #find-fejlen) */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        oenske = { "find-fejlen": "fejl", "findfejlen": "fejl" }[oenske] || oenske;
        visFane(faner[oenske] ? oenske : "byg");

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

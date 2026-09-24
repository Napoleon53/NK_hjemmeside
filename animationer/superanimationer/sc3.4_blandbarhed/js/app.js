/* =====================================================================
   app.js - binder bassinet, panelet og Kemichael sammen

   Knapperne i panelet, temperaturen, teori og quiz, tastaturgenveje og
   tegneloekken. Der er én scene og ingen faner.
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
            medId: false,
            set: function () { return !!NK.hent("nk-sc3.4-intro", false); },
            husk: function () { NK.gem("nk-sc3.4-intro", true); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }


    var bassin = null, laerer = null, opgaver = null, quiz = null;
    var sidsteTid = 0;

    function aabn(id) { NK.el(id).classList.add("vis"); }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    /* Temperaturen: skyderen, tallet og modellen folges ad */
    function saetT(T) {
        T = NK.klamp(Math.round(T), 20, 120);
        NK.el("temp").value = String(T);
        NK.saetTekst("temp-tal", T + " °C");
        bassin.saetT(T);
    }

    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        bassin.tilpas();
        bassin.opdater(dt);
        opgaver.opdater(dt);
        bassin.tegn();
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(bassin.L.ctx);
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
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) && e.target.type !== "range") return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var t = e.key.toLowerCase();
        if (t === "?" || t === "h") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start("bassin"); }
            return;
        }
        if (NK.Rundvisning.aktiv()) return;
        if (t === "t") { if (NK.el("teori").classList.contains("vis")) lukOverlay(); else { lukOverlay(); aabn("teori"); } return; }
        if (t === "q") { if (NK.el("quiz").classList.contains("vis")) lukOverlay(); else { lukOverlay(); quiz.aabn(); } return; }
        if (document.querySelector(".overlay.vis")) return;
        if (t === "k" && laerer) { laerer.startIntro(true); return; }
        if (t === "v") { bassin.haeld("vand"); return; }
        if (t === "e") { bassin.haeld("ethanol"); return; }
        if (t === "o") { bassin.haeld("olie"); return; }
        if (t === "r") { bassin.toem(); return; }
        if (e.key === " ") { e.preventDefault(); bassin.ryst(1.2); return; }
        if (e.key === "ArrowUp" || e.key === "ArrowRight") { e.preventDefault(); saetT(bassin.m.T + 5); return; }
        if (e.key === "ArrowDown" || e.key === "ArrowLeft") { e.preventDefault(); saetT(bassin.m.T - 5); return; }
    }

    function start() {
        if (NK.Sprites) NK.Sprites.start();
        bassin = new NK.Bassin(NK.el("laerred"));
        NK.bassin = bassin;                   /* saa den kan pilles ved fra konsollen og selvtesten */
        bassin.nulstil([["vand", 3]]);

        opgaver = new NK.Opgaver(bassin, saetT);
        NK.opgaver = opgaver;
        quiz = new NK.Quiz();
        NK.quiz = quiz;

        if (NK.Laerer) {
            laerer = new NK.Laerer(bassin.L);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
            /* Klik paa Kemichael fanges, foer bassinet faar dem */
            bassin.klikFoerst = function (x, y) {
                return laerer.laererIntroKlik(x, y) || laerer.laererKlik(x, y);
            };
            bassin.overLaerer = function (x, y) { return laerer.laererUnder(x, y); };
            ["overloeb", "svaever", "rystBlandet", "rystTomt"].forEach(function (h) {
                bassin.paa(h, function () { laerer.besoeg(h); });
            });
        }

        /* Panelet */
        var stofknapper = document.querySelectorAll(".stofknap");
        for (var i = 0; i < stofknapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { bassin.haeld(k.getAttribute("data-stof")); });
            }(stofknapper[i]));
        }
        NK.el("ryst").addEventListener("click", function () { bassin.ryst(1.2); });
        NK.el("toem").addEventListener("click", function () { bassin.toem(); });
        NK.el("temp").addEventListener("input", function () { saetT(parseInt(NK.el("temp").value, 10)); });

        /* Toplinjen og vinduerne */
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start("bassin"); });
        NK.el("teoriknap").addEventListener("click", function () { lukOverlay(); aabn("teori"); });
        NK.el("quizknap").addEventListener("click", function () { lukOverlay(); quiz.aabn(); });
        var luk = document.querySelectorAll("[data-luk]");
        for (i = 0; i < luk.length; i++) luk[i].addEventListener("click", lukOverlay);
        var overlays = document.querySelectorAll(".overlay");
        for (i = 0; i < overlays.length; i++) {
            (function (o) {
                o.addEventListener("click", function (e) { if (e.target === o) lukOverlay(); });
            }(overlays[i]));
        }
        document.addEventListener("keydown", tastatur);

        saetT(20);
        bassin.tilpas();
        bassin.visMaengde();
        if (laerer) laerer.startIntro(false);

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());

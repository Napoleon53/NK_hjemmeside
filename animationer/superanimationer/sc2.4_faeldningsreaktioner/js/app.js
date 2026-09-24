/* =====================================================================
   app.js - binder niveauerne sammen

   Faneskift (de tre niveauer), tastaturgenveje, teorien og tegneloekken.
   Kun det aktive niveaus baegerglas opdateres og tegnes.
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
            set: function (id) { return !!NK.hent("nk-sc2.4-intro", {})[id]; },
            husk: function (id) { var s = NK.hent("nk-sc2.4-intro", {}); s[id] = true; NK.gem("nk-sc2.4-intro", s); }
        });
        (function (P) {
            var stop = P.stopIntro;
            P.stopIntro = function () {
                this.skjulTilbud();
                return stop.apply(this, arguments);
            };
        }(NK.Laerer.prototype));
    }


    var niveauer = {};
    var raekke = ["tabel", "vaelg", "skriv"];
    var aktivId = "tabel";
    var laerred = null;
    var laerer = null;          /* Kemichael, én for hele siden */
    var sidsteTid = 0;

    function visNiveau(id) {
        if (!niveauer[id]) return;
        aktivId = id;
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-niveau") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        document.body.setAttribute("data-niveau", id);
        NK.Rundvisning.luk();
        NK.Niveau.aktiver(niveauer[id]);
        /* Foerste gang en sværhedsgrad aabnes i browseren, praesenterer
           Kemichael den. Er han midt i en anden, gaar han foerst. */
        if (laerer) {
            laerer.stopIntro();
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
        if (dt > 0.1) dt = 0.1;
        laerred.tilpas();
        var b = niveauer[aktivId].baeger;
        b.opdater(dt, laerred.b, laerred.h);
        b.tegn(laerred);
        if (laerer) {
            laerer.opdater(dt);
            laerer.laererTegnOver(laerred.ctx);
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
        if (e.key >= "1" && e.key <= "3") { visNiveau(raekke[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && laerer) { laerer.startIntro(aktivId, true); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(aktivId); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "r" || e.key === "R") niveauer[aktivId].nyOpgave();
    }

    function start() {
        NK.Niveau.init();
        laerred = new NK.Laerred(NK.el("laerred"));
        if (NK.Sprites) NK.Sprites.start();
        if (NK.Laerer) {
            laerer = new NK.Laerer(laerred);
            NK.laerer = laerer;
            NK.el("spring-over").addEventListener("click", function () { laerer.stopIntro(); });
        }
        raekke.forEach(function (id) { niveauer[id] = new NK.Niveau(NK.NIVEAUER[id]); });
        NK.niveauer = niveauer;        /* saa de kan pilles ved fra konsollen og selvtesten */
        NK.visNiveau = visNiveau;

        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            (function (k) {
                k.addEventListener("click", function () { visNiveau(k.getAttribute("data-niveau")); });
            }(knapper[i]));
        }

        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(aktivId); });
        NK.el("teoriknap").addEventListener("click", function () { aabn("teori"); });
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === NK.el("teori")) lukOverlay(); });
        document.addEventListener("keydown", tastatur);

        /* Klik paa Kemichael: foerst praesentationen, saa hans egne svar.
           Ellers roerer et klik paa blandingen rundt. */
        var cv = NK.el("laerred");
        function punkt(e) {
            var r = cv.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        cv.addEventListener("click", function (e) {
            var p = punkt(e);
            if (laerer && laerer.laererIntroKlik(p.x, p.y)) return;
            if (laerer && laerer.laererKlik(p.x, p.y)) return;
            niveauer[aktivId].baeger.klik(p.x, p.y);
        });
        cv.addEventListener("pointermove", function (e) {
            var p = punkt(e);
            var over = (laerer && laerer.laererUnder(p.x, p.y)) || niveauer[aktivId].baeger.kanRoeres(p.x, p.y);
            cv.style.cursor = over ? "pointer" : "default";
        });

        /* Direkte link til en sværhedsgrad: index.html#svaer (eller #skriv) */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        oenske = { "let": "tabel", "middel": "vaelg", "svaer": "skriv", "svær": "skriv" }[oenske] || oenske;
        visNiveau(niveauer[oenske] ? oenske : "tabel");

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());

/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teorien, tastaturgenveje og tegneloekken. Kun den aktive
   fane opdateres og tegnes. Hver fane har sin egen Kemichael og sit
   eget tilbud om praesentationen (js/laerer.js, js/praesentation.js),
   som i sc1.2.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["kryds", "konc", "temp"];
    var aktiv = "kryds";
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
        if (sims[id].startIntro) sims[id].startIntro(false);   /* kun første gang i browseren */
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
        window.requestAnimationFrame(loekke);
    }

    function tastatur(e) {
        var sim = sims[aktiv];
        if (e.key === "Escape") {
            lukOverlay();
            NK.Rundvisning.luk();
            if (sim && sim.springIntro) sim.springIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key >= "1" && e.key <= "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if ((e.key === "k" || e.key === "K") && sim.startIntro) { sim.startIntro(true); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start("fane-" + aktiv); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === " ") {
            if (e.target && e.target.tagName === "BUTTON") return;   /* mellemrum trykker allerede paa knappen */
            e.preventDefault();
            if (aktiv === "kryds") sim.hovedknap();
            else sim.maal();
            return;
        }
        if (e.key === "r" || e.key === "R") sim.nulstil();
    }

    function start() {
        if (NK.Sprites) NK.Sprites.start();
        sims.kryds = new NK.SimKryds();
        sims.konc = new NK.SimKonc();
        sims.temp = new NK.SimTemp();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */
        NK.visFane = visFane;

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

        /* Direkte link til en fane: index.html#koncentration */
        var oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase();
        oenske = { krydset: "kryds", koncentration: "konc", temperatur: "temp" }[oenske] || oenske;
        visFane(sims[oenske] ? oenske : "kryds");

        window.requestAnimationFrame(function (ts) {
            sidsteTid = ts;
            window.requestAnimationFrame(loekke);
        });
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
}());

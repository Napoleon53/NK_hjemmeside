/* =====================================================================
   app.js - binder de to faner sammen

   Faneskift, plakaterne i stort format, tastaturgenveje og tegneloekken.
   Kun den aktive fane opdateres og tegnes; samlebaandet staar altsaa
   stille, mens man er paa lageret.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-lager", "fane-baand"];
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
        /* Spillet holder pause, naar man forlader det */
        var baand = sims["fane-baand"];
        if (baand && id !== "fane-baand" && baand.tilstand === "koerer") {
            baand.tilstand = "pause";
            baand.visPanel();
        }
        aktivFane = id;
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            if (sims[id].fokus) sims[id].fokus();
            if (sims[id].startIntro) sims[id].startIntro(false);   /* kun første gang i browseren */
        }
    }

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        var sim = sims[aktivFane];
        if (sim && sim.fokus) sim.fokus();
    }

    function opslag(slags) {
        var sim = sims[aktivFane];
        NK.Opslag.aabn(slags, sim && sim.fremhaevning ? sim.fremhaevning(slags) : null);
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
        var sim = sims[aktivFane];
        if (e.key === "Escape") {
            lukAlle();
            if (NK.Rundvisning) NK.Rundvisning.luk();
            if (sim && sim.springIntro) sim.springIntro();
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key === "k" || e.key === "K") { if (sim && sim.startIntro) sim.startIntro(true); return; }

        if (e.key === "1" || e.key === "2") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukAlle(); NK.Rundvisning.start(aktivFane); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
        if (e.key === "p" || e.key === "P") { opslag("pt"); return; }
        if (e.key === "i" || e.key === "I") { opslag("ioner"); return; }
        if (e.key === "r" || e.key === "R") { if (sim && sim.nulstil) sim.nulstil(); return; }
        if (e.key === "Enter" && sim && sim.enter) { e.preventDefault(); sim.enter(); return; }
        /* Et bogstav uden for feltet: skriv i feltet i stedet */
        if (e.key.length === 1 && sim && sim.fokus) sim.fokus();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        NK.Opslag.byg();

        sims["fane-lager"] = new NK.SimLager();
        sims["fane-baand"] = new NK.SimBaand();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        var overlays = document.querySelectorAll(".overlay");
        function bindBaggrund(o) {
            o.addEventListener("click", function (e) { if (e.target === o) lukAlle(); });
        }
        for (i = 0; i < overlays.length; i++) bindBaggrund(overlays[i]);

        NK.el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(aktivFane); });

        /* Sværere ioner: reolen skifter sæt, og samlebaandet trækker fra
           det nye sæt fra naeste glas */
        var svaerKnap = NK.el("svaer-knap");
        svaerKnap.checked = NK.indstil.svaer;
        NK.el("svaer-kontakt").title = "Seks glas får sværere ioner: " + NK.Data.SVAER_IONER;
        svaerKnap.addEventListener("change", function () {
            NK.indstil.svaer = svaerKnap.checked;
            NK.gem("nk-sc2.3-svaer", NK.indstil.svaer);
            sims["fane-lager"].skiftSaet();
            svaerKnap.blur();
        });

        document.addEventListener("keydown", tastatur);

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med  index.html#baand  */
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

/* =====================================================================
   app.js - de to faner, teorien, tastaturgenveje og tegneloekken

   Kun den aktive fane opdateres og tegnes. Der er ingen laerer: hjaelpen
   er den gule knap paa kortet.

   Man kan linke direkte til en fane:
     index.html#farveskift   fane 1 Farveskiftet
     index.html#proeve       fane 2 Den ukendte prøve
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var sims = {};
    var faner = ["fane-s", "fane-p"];
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
        if (NK.Rundvisning) NK.Rundvisning.luk();
        if (sims[id]) {
            sims[id].tilpas();
            sims[id].layout();
        }
    }
    NK.visFane = visFane;

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabnTeori() {
        lukAlle();
        NK.el("teori").classList.add("vis");
    }

    /* Farvekortet i teorien: de fem indikatorer som i bogens figur, lavet af
       de samme farver som paa tavlen (CSS-gradienter fra data.js) */
    function bygTeoriKort() {
        var html = "";
        D.KORT_ORDEN.forEach(function (id) {
            var ind = D.ind(id);
            var stop = ind.stop.map(function (s) {
                return s[1] + " " + ((s[0] - D.PH_MIN) / (D.PH_MAKS - D.PH_MIN) * 100).toFixed(2) + "%";
            }).join(", ");
            html += '<div class="tk-raekke"><span class="tk-navn">' + NK.html(ind.navn) + '</span><span class="tk-bjaelke" style="background: linear-gradient(to right, ' +
                stop + ');"></span></div>';
        });
        html += '<div class="tk-raekke tk-akse"><span class="tk-navn">pH</span><span class="tk-tal">';
        for (var p = D.PH_MIN; p <= D.PH_MAKS; p++) html += "<i>" + D.tal(p) + "</i>";
        html += "</span></div>";
        NK.el("teori-kort").innerHTML = html;
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
            return;
        }
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        var aaben = NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis");
        if (aaben) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "1" || e.key === "2") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        /* Enter: Indsend svar (eller kortets groenne knap), men ikke paa andre knapper */
        if (e.key === "Enter" && sim) {
            var paaKnap = e.target && e.target.closest && e.target.closest("button, a");
            if (paaKnap && !paaKnap.closest(".scenekort")) return;
            e.preventDefault();
            if (sim.groen) sim.videreKlik();
            else if (sim.fase === "forsoeg" && sim.udfoer) sim.udfoer();
            else sim.indsendKlik();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-s"] = new NK.SimSkift();
        sims["fane-p"] = new NK.SimProeve();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */
        bygTeoriKort();

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
        NK.el("teoriknap").addEventListener("click", aabnTeori);

        document.addEventListener("keydown", tastatur);
        window.addEventListener("resize", function () { var s = sims[aktivFane]; if (s) { s.tilpas(); s.layout(); } });

        /* Hver fane begynder ved det foerste, der ikke er klaret */
        faner.forEach(function (id) {
            var s = sims[id];
            s.tilpas();
            s.nr = -1;
            var n = s.naesteUloeste();
            s.vaelg(n >= 0 ? n : 0);
        });

        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { farveskift: "fane-s", farveskiftet: "fane-s", skift: "fane-s", "1": "fane-s",
                     proeve: "fane-p", "prøve": "fane-p", ukendt: "fane-p", "2": "fane-p" };
        visFane(HASH[oenske] || faner[0]);

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

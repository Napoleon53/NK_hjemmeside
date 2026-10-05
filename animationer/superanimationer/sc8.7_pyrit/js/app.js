/* =====================================================================
   app.js - binder de tre faner sammen (som sc8.6)

   Faneskift, teorien og tastaturgenveje. Der er intet laerred og ingen
   tegneloekke: alt paa skaermen er almindelige elementer, og fanerne
   retter sig til, naar vinduet skifter stoerrelse. Der er ingen
   laerer: hjaelpen staar i statuslinjen nederst i scenen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-u", "fane-p", "fane-r"];
    var aktivFane = faner[0];

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
            /* En opgave kan vaere blevet laast op paa en anden fane */
            sims[id].visListe();
            sims[id].tilpas();
            sims[id].fokus();
        }
    }
    /* Fanerne kan selv gaa videre til den naeste (knappen efter sidste opgave) */
    NK.visFane = visFane;

    /* ----- Overlays ---------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        var sim = sims[aktivFane];
        if (sim && sim.fokus) sim.fokus();
    }

    function aabnTeori() {
        lukAlle();
        NK.el("teori").classList.add("vis");
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
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        /* Naar der er felter, er et tal eller et fortegn begyndelsen paa et svar,
           ikke et faneskift */
        if (/^[0-9+\-]$/.test(e.key) && sim && sim.tagerTal && sim.tagerTal()) { sim.fokusFelt(); return; }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.forfra(); return; }
        if (e.key === "Enter" && sim && sim.enter) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            sim.enter();
        }
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        sims["fane-u"] = new NK.SimUdstilling();
        sims["fane-p"] = new NK.SimPyrit();
        sims["fane-r"] = new NK.SimRistning();
        NK.sims = sims;              /* saa fanerne kan pilles ved fra konsollen og selvtesten */

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
        window.addEventListener("resize", function () { if (sims[aktivFane]) sims[aktivFane].tilpas(); });

        /* Man kan linke direkte til en fane med  index.html#pyrit  */
        var oenske = "";
        try { oenske = decodeURIComponent((window.location.hash || "").replace(/^#/, "")).toLowerCase(); } catch (x) { oenske = ""; }
        var HASH = { udstilling: "fane-u", udstillingen: "fane-u", sten: "fane-u", mineraler: "fane-u",
                     pyrit: "fane-p", forvitring: "fane-p", tinto: "fane-p",
                     ristning: "fane-r", zink: "fane-r", cinnober: "fane-r", regn: "fane-r" };
        visFane(HASH[oenske] || faner[0]);

        /* Skrifterne kan komme senere end siden: ret til én gang til */
        window.setTimeout(function () { if (sims[aktivFane]) sims[aktivFane].tilpas(); }, 250);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

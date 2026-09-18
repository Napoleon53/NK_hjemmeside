/* =====================================================================
   app.js - binder de to faner sammen

   Faneskift, de tre overlays (teori, quiz, hjaelp), lyden,
   tastaturgenveje og tegneloekken. Kun den aktive fane opdateres og
   tegnes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var sims = {};
    var faner = ["fane-bland", "fane-faser"];
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

    /* Tabellen over de fem vaesker paa fane 1. Den staar kun ét sted og
       bygges af D.VAESKER, saa et nyt stof ikke skal skrives to gange. */
    function bygFakta() {
        var h = '<table class="fakta"><tr><th></th><th>tæthed</th><th>kogepkt.</th><th>mellem molekylerne</th></tr>';
        NK.Data.VAESKER.forEach(function (v) {
            h += '<tr><th><i class="prik" style="background:' + v.farve + '"></i>' + v.navn + "</th>" +
                 "<td>" + NK.tal(v.taethed, 2) + "</td>" +
                 "<td>" + NK.tal(v.kp, 0) + " °C</td>" +
                 '<td class="svag">' + v.kraft + "</td></tr>";
        });
        h += "</table>";
        NK.el("bland-fakta").innerHTML = h;
    }

    /* ----- Introen ------------------------------------------------------ */
    /* Den aabner af sig selv foerste gang, animationen bliver brugt i
       denne browser, og derefter kun med knappen. */
    var INTRO_NOEGLE = "nk-sc34-intro";

    function aabnIntro(tvunget) {
        var set = false;
        try { set = window.localStorage && window.localStorage.getItem(INTRO_NOEGLE) === "set"; }
        catch (fejl) { /* file:// eller privat browsing */ }
        if (set && !tvunget) return;
        vis("intro", true);
    }

    function lukIntro() {
        vis("intro", false);
        try { window.localStorage && window.localStorage.setItem(INTRO_NOEGLE, "set"); }
        catch (fejl) {}
    }

    /* ----- Lyden -------------------------------------------------------- */
    function opdaterLydknap() {
        var til = NK.Lyd.erTil();
        var k = NK.el("lydknap");
        k.textContent = til ? "🔊" : "🔇";
        k.setAttribute("aria-pressed", til ? "true" : "false");
        k.title = til ? "Lyd til (L)" : "Lyd fra (L)";
    }

    function skiftLyd() {
        NK.Lyd.saet(!NK.Lyd.erTil());
        if (NK.Lyd.erTil()) { NK.Lyd.laasOp(); NK.Lyd.klik(); }
        opdaterLydknap();
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
        if (e.key === "Escape") {
            if (NK.el("intro").classList.contains("vis")) lukIntro();
            lukAlle();
            return;
        }
        if (e.key === "o" || e.key === "O") { aabnIntro(true); return; }
        if (e.key === "t" || e.key === "T") { vis("teori", !NK.el("teori").classList.contains("vis")); return; }
        if (e.key === "q" || e.key === "Q") { NK.Quiz.aabn(); return; }
        if (e.key === "l" || e.key === "L") { skiftLyd(); return; }
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
        NK.Sprites.start();
        bygTeori();
        bygFakta();
        NK.Quiz.kobl();

        sims["fane-bland"] = new NK.SimBland();
        sims["fane-faser"] = new NK.SimFaser();
        NK.sims = sims;              /* saa modellerne kan pilles ved fra konsollen */

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        NK.el("introknap").addEventListener("click", function () { aabnIntro(true); });
        NK.el("intro-luk").addEventListener("click", lukIntro);
        NK.el("intro").addEventListener("click", function (e) { if (e.target.id === "intro") lukIntro(); });

        NK.el("teoriknap").addEventListener("click", function () { vis("teori", true); });
        NK.el("teori-luk").addEventListener("click", function () { vis("teori", false); });
        NK.el("teori").addEventListener("click", function (e) { if (e.target.id === "teori") vis("teori", false); });

        NK.el("quizknap").addEventListener("click", function () { NK.Quiz.aabn(); });

        NK.el("lydknap").addEventListener("click", skiftLyd);
        opdaterLydknap();
        document.addEventListener("pointerdown", function () { NK.Lyd.laasOp(); }, { once: true });

        NK.el("hjaelpknap").addEventListener("click", function () { vis("hjaelp", true); });
        NK.el("hjaelp-luk").addEventListener("click", function () { vis("hjaelp", false); });
        NK.el("hjaelp").addEventListener("click", function (e) { if (e.target.id === "hjaelp") vis("hjaelp", false); });

        document.addEventListener("keydown", tastatur);

        for (var navn in sims) {
            if (Object.prototype.hasOwnProperty.call(sims, navn)) sims[navn].tilpas();
        }

        /* Man kan linke direkte til en fane med fx  index.html#faser  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(sims["fane-" + oenske] ? "fane-" + oenske : faner[0]);

        aabnIntro(false);

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

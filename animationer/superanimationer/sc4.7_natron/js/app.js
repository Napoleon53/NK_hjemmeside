/* =====================================================================
   app.js - binder de tre faner sammen

   Faneskift, teorien, journalen, tastaturgenveje og tegneloekken. Kun
   den aktive fane opdateres og tegnes. Kemichael praesenterer ikke med
   knapper her: han sidder ved katederet og siger kun noget, naar eleven
   beder om et hint (den rolige udgave fra sc4.5). K faar ham til at
   sige, hvor man er.

   Journalen samler elevens gaet, vejningerne, de forventede masser,
   dommen og et maerke (ingen fejl eller snydebevis) paa én side, der
   kan udskrives (som den gamle c4.7).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;

    var sims = {};
    var faner = ["fane-forsoeg", "fane-hypoteser", "fane-fejl"];
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
            sims[id].startIntro(false);
            if (id === "fane-hypoteser") sims[id].nyMaaling();
            sims[id].fokus();
        }
    }
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

    /* ----- Journalen ----------------------------------------------------- */
    function h(s) { return NK.html(s); }

    function journalHTML() {
        var m = NK.minMaaling, j = NK.journal || {}, T = NK.Tjek;
        var dato = new Date().toLocaleDateString("da-DK");
        var ud = '<h2>Journal: natron varmes i en digel</h2><p class="note">Lavet ' + h(dato) + "</p>";
        ud += '<div class="journal-afsnit"><h3>1. Gættet</h3><p>' +
            (NK.gaet ? "Hypotese " + h(NK.gaet) + ": der dannes " + h(T.P(NK.gaet)) + "." : "Intet gæt endnu.") + "</p></div>";
        ud += '<div class="journal-afsnit"><h3>2. Vejningerne</h3>';
        if (m) {
            ud += '<table class="journal-tabel"><tr><th>Vejning</th><th>Opvarmet</th><th>Masse</th></tr>';
            m.vejninger.forEach(function (v, i) {
                ud += "<tr><td>" + (i === 0 ? "Før" : i + ". vejning") + "</td><td>" + h(K.min(v.t)) + " min</td><td>" + h(K.g2(v.m)) + " g</td></tr>";
            });
            ud += "</table><p>Massen var konstant: " + h(K.g2(m.slut)) + " g. Natronen tabte " + h(K.g2(K.r2(m.mf - m.slut))) + " g." +
                (m.sprojt ? " Pulveret sprøjtede undervejs." : "") + "</p>";
        } else ud += "<p>Forsøget er ikke lavet endnu.</p>";
        ud += "</div>";
        ud += '<div class="journal-afsnit"><h3>3. Hypoteserne</h3>';
        var mf = m ? m.mf : null;
        if (mf && NK.forventet && Object.keys(NK.forventet).length && NK.forventetFor === mf) {
            ud += "<p>n(NaHCO₃) = " + h(K.g2(mf)) + " g / " + h(K.Mtekst("NaHCO3")) + " g/mol = " + h(K.mol(K.nNatron(mf))) + " mol</p>";
            ud += '<table class="journal-tabel"><tr><th></th><th>Skemaet</th><th>Forventet masse</th></tr>';
            D.HYP_IDS.forEach(function (id) {
                var mm = NK.forventet[id];
                ud += "<tr><td>" + id + "</td><td>" + h(NK.Regning.skemaTekst(id)) + "</td><td>" + (mm !== undefined ? h(K.g(mm)) + " g" : "ikke regnet") + "</td></tr>";
            });
            ud += "</table>";
        } else ud += "<p>Ikke regnet endnu" + (m ? "" : ". Lav forsøget først") + ".</p>";
        ud += "</div>";
        ud += '<div class="journal-afsnit"><h3>4. Konklusionen</h3><p>';
        if (NK.dommen && m) {
            ud += "Massen i diglen passer med hypotese B: " + h(D.DOM.skema) + ". Der bliver natriumcarbonat tilbage.";
            if (NK.gaet) ud += NK.gaet === "B" ? " Gættet holdt." : " Gættet var hypotese " + h(NK.gaet) + ".";
        } else ud += "Ikke afgjort endnu.";
        ud += "</p>";
        if (j.snyd) {
            ud += '<div class="journal-snyd"><b>SNYDEBEVIS</b><br>Knappen Snyd blev brugt. Beregningerne er ikke lavet af eleven selv.</div>';
        } else if (NK.dommen && !j.fejl && !j.svar) {
            ud += '<div class="journal-guld">Alle beregninger blev lavet uden en eneste fejl.</div>';
        }
        ud += "</div>";
        return ud;
    }

    function aabnJournal() {
        lukAlle();
        NK.el("journal-indhold").innerHTML = journalHTML();
        NK.el("journal").classList.add("vis");
    }
    NK.journalHTML = journalHTML;

    /* ----- Tegneloekken ------------------------------------------------- */
    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

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
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key === "k" || e.key === "K") { if (sim) sim.startIntro(true); return; }
        if (e.key === "1" || e.key === "2" || e.key === "3") { visFane(faner[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(aktivFane); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "j" || e.key === "J") { aabnJournal(); return; }
        if (e.key === "r" || e.key === "R") { if (sim) sim.nulstil(); return; }
        if ((e.key === "Enter" || e.key === " ") && sim && sim.enter) {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            sim.enter();
            return;
        }
        if (e.key.length === 1 && sim) sim.fokus();
    }

    /* ----- Opstart --------------------------------------------------------- */
    function start() {
        NK.Sprites.start();

        sims["fane-forsoeg"] = new NK.SimForsoeg();
        sims["fane-hypoteser"] = new NK.SimHypoteser();
        sims["fane-fejl"] = new NK.SimFejl();
        NK.sims = sims;

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
        NK.el("journalknap").addEventListener("click", aabnJournal);
        NK.el("journal-print").addEventListener("click", function () { window.print(); });

        document.addEventListener("keydown", tastatur);

        var ord = (window.location.hash || "").replace(/^#/, "").toLowerCase().split(/[^a-zæøå0-9]+/);
        var navne = { forsoeg: "fane-forsoeg", "forsøg": "fane-forsoeg", hypoteser: "fane-hypoteser", beregning: "fane-hypoteser",
                      fejl: "fane-fejl", fejlkilder: "fane-fejl" };
        var oenske = faner[0];
        ord.forEach(function (o) { if (navne[o]) oenske = navne[o]; });
        visFane(oenske);

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

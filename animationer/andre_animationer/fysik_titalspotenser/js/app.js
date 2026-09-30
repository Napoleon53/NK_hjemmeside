/* =====================================================================
   app.js - binder de fire faner sammen

   Faneskift, teorien, tastaturgenveje, svarfeltet og tegneloekken. Der er
   én scene og ét panel; kun den aktive fane (NK.aktivFane) tegner sig og
   opdateres. Laerredet forneden er stigen fra 10⁻⁹ til 10⁹ (js/stige.js).

   Der er ingen laerer i scenen. Al hjaelp staar i statuslinjen nederst
   med den ene store knap.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var faner = {};
    var laerred = null;
    var sidsteTid = 0;

    function el(id) { return NK.el(id); }

    /* ----- Faner ------------------------------------------------------ */
    function visFane(id) {
        if (!faner[id]) return;
        var gammel = NK.aktivFane;
        if (gammel && gammel !== faner[id]) gammel.hopFaerdig();
        NK.aktivFane = faner[id];
        var knapper = document.querySelectorAll(".faneknap");
        for (var i = 0; i < knapper.length; i++) {
            var valgt = knapper[i].getAttribute("data-fane") === id;
            knapper[i].classList.toggle("aktiv", valgt);
            knapper[i].setAttribute("aria-selected", valgt ? "true" : "false");
        }
        document.body.setAttribute("data-fane", id);
        if (NK.Rundvisning) NK.Rundvisning.luk();
        faner[id].vis();
        faner[id].fokus();
    }

    /* ----- Overlays --------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
        if (NK.aktivFane) NK.aktivFane.fokus();
    }

    function aabnTeori() {
        lukAlle();
        el("teori").classList.add("vis");
    }

    /* ----- Tegneloekken ----------------------------------------------- */
    function trin(dt) {
        laerred.tilpas();
        var f = NK.aktivFane;
        if (f) f.opdater(dt);
        laerred.ryd();
        if (f) f.stige.tegn(laerred.ctx, laerred.b, laerred.h);
    }
    NK.trin = trin;           /* selvtesten kan koere tiden frem */

    function loekke(tidsstempel) {
        var dt = (tidsstempel - sidsteTid) / 1000;
        sidsteTid = tidsstempel;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;
        trin(dt * NK.tid.skala);
        window.requestAnimationFrame(loekke);
    }

    /* ----- Tastatur --------------------------------------------------- */
    function tastatur(e) {
        var f = NK.aktivFane;
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
        if (e.key >= "1" && e.key <= "4") { visFane(D.FANE_RAEKKE[parseInt(e.key, 10) - 1]); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { lukAlle(); NK.Rundvisning.start(f.id); return; }
        if (e.key === "t" || e.key === "T") { aabnTeori(); return; }
        if (e.key === "r" || e.key === "R") {
            f.nyRunde();
            f.saetBesked("Ny runde. " + NK.html(D.INTRO[f.id]), "", "");
            f.vis();
            f.animerNy();
            f.fokus();
            return;
        }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            f.tjek();
            return;
        }
        if (e.key.length === 1 && /[0-9,.\-]/.test(e.key) && f.erIndtastning() && !f.loest) f.fokus();
    }

    /* Taster i svarfeltet: Enter tjekker, e, *, ^ og x springer til
       eksponenten, og tilbage i et tomt eksponentfelt gaar til tallet. */
    function feltTast(e) {
        var f = NK.aktivFane;
        if (e.key === "Enter") { e.preventDefault(); f.tjek(); return; }
        if (e.target.id === "svar-m" && /^[eE*^xX·×]$/.test(e.key)) {
            e.preventDefault();
            if (el("potens").hidden) f.skiftMaade("pot");
            if (!el("potens").hidden) el("svar-e").focus();
            return;
        }
        if (e.target.id === "svar-e" && e.key === "Backspace" && e.target.value === "") {
            e.preventDefault();
            el("svar-m").focus();
        }
    }

    function feltInput() {
        var m = el("svar-m"), x = el("svar-e");
        var vm = m.value.replace(/[^0-9,.\-−+eE*^·×xX   ]/g, "");
        var vx = x.value.replace(/[^0-9\-−+]/g, "");
        if (vm !== m.value) m.value = vm;
        if (vx !== x.value) x.value = vx;
        NK.aktivFane.skriv(m.value, x.value);
    }

    /* ± skifter fortegnet paa eksponenten */
    function skiftFortegn() {
        var x = el("svar-e"), v = x.value;
        x.value = /^[-−]/.test(v) ? v.replace(/^[-−]/, "") : "−" + v.replace(/^\+/, "");
        feltInput();
        x.focus();
    }

    /* ----- Opstart ---------------------------------------------------- */
    function start() {
        laerred = new NK.Laerred(el("laerred"));

        D.FANE_RAEKKE.forEach(function (id) { faner[id] = new NK.Fane(id); });
        NK.faner = faner;            /* saa de kan pilles ved fra konsollen og selvtesten */
        NK.visFane = visFane;

        var knapper = document.querySelectorAll(".faneknap");
        function bindFane(knap) {
            knap.addEventListener("click", function () { visFane(knap.getAttribute("data-fane")); });
        }
        for (var i = 0; i < knapper.length; i++) bindFane(knapper[i]);

        el("talrk").addEventListener("click", function (ev) {
            if (ev.target.closest("[data-komma]")) NK.aktivFane.klikKomma();
        });
        el("tjek").addEventListener("click", function () { NK.aktivFane.tjek(); });
        el("opgaveknap").addEventListener("click", function () { NK.aktivFane.knap(); });
        el("chips").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-f]");
            if (b && !b.disabled) NK.aktivFane.vaelgForstavelse(b.getAttribute("data-f"));
        });
        el("vaelgere").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-valg]");
            if (b) NK.aktivFane.skiftValg(b.getAttribute("data-valg"));
        });
        el("niveauer").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-niveau]");
            if (b) NK.aktivFane.skiftNiveau(b.getAttribute("data-niveau"));
        });
        el("svarmaade").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-maade]"), f = NK.aktivFane;
            if (!b || b.disabled) return;
            f.skiftMaade(b.getAttribute("data-maade"));
            if (f.maade === "pot" && f.mant && !f.loest) el("svar-e").focus();
            else f.fokus();
        });
        el("svar-m").addEventListener("keydown", feltTast);
        el("svar-e").addEventListener("keydown", feltTast);
        el("svar-m").addEventListener("input", feltInput);
        el("svar-e").addEventListener("input", feltInput);
        el("fortegn").addEventListener("click", skiftFortegn);

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        el("teori").addEventListener("click", function (e) { if (e.target === el("teori")) lukAlle(); });
        el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(NK.aktivFane.id); });
        el("teoriknap").addEventListener("click", aabnTeori);
        document.addEventListener("keydown", tastatur);

        laerred.tilpas();

        /* Man kan linke direkte til en fane med  index.html#omregn  */
        var oenske = (window.location.hash || "").replace(/^#/, "").toLowerCase();
        visFane(faner[oenske] ? oenske : D.FANE_RAEKKE[0]);

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

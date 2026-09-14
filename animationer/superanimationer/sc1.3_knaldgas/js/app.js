/* =====================================================================
   app.js - binder forsoeget, grafen, quizzen og panelet sammen

   Der er kun én fane, saa her er ingen faneskift - kun knapper,
   tastatur, pop op-vinduer og tegneloekken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;

    var forsoeg, graf, quiz;
    var sidsteTid = 0;
    var sidsteSignatur = "";
    var beskedUr = null;

    /* ----- Panelet ------------------------------------------------------ */
    function opdaterPanel() {
        var f = forsoeg;
        NK.saetTekst("vis-h", String(f.h));
        NK.saetTekst("vis-o", String(f.o));
        NK.saetTekst("glas-taeller", (f.h + f.o) + " af " + M.MAKS + " streger");

        var celler = NK.el("stregbar").children;
        for (var i = 0; i < celler.length; i++) {
            celler[i].className = i < f.h ? "h2" : (i < f.h + f.o ? "o2" : "");
        }

        var h2 = NK.el("knap-h2"), o2 = NK.el("knap-o2"), antaend = NK.el("knap-antaend"), genfyld = NK.el("knap-genfyld");
        h2.disabled = !f.kanFylde();
        o2.disabled = !f.kanFylde();
        NK.el("knap-toem").disabled = !f.kanToemme();
        antaend.disabled = !f.kanAntaende();
        h2.classList.toggle("banker", !f.harFyldt && f.kanFylde());
        o2.classList.toggle("banker", !f.harFyldt && f.kanFylde());
        antaend.classList.toggle("banker", f.kanAntaende());

        /* Mens glasset staar ved flammen, sidder Genfyld glasset paa
           Antaends plads. */
        var vedFlammen = f.tilstand === "knald";
        antaend.hidden = vedFlammen;
        genfyld.hidden = !vedFlammen;
        genfyld.disabled = !f.kanGenfylde();
        genfyld.classList.toggle("banker", f.kanGenfylde());
        NK.saetTekst("knap-genfyld-tekst", f.knust ? "Nyt glas" : "Genfyld glasset");

        var trin = f.trin();
        for (var t = 1; t <= 3; t++) {
            var el = NK.el("trin-" + t);
            el.classList.toggle("aktiv", t === trin);
            el.classList.toggle("gjort", t < trin);
        }

        var n = f.antalTestet();
        NK.saetTekst("graf-taeller", n + "/" + M.BLANDINGER.length + " testet");
        NK.el("graf-ryd").disabled = n === 0;
        quiz.saetTestet(n);

        sidsteSignatur = signatur();
    }

    /* Panelet opdateres kun, naar noget af det, det viser, har aendret sig. */
    function signatur() {
        var f = forsoeg;
        return [f.h, f.o, f.tilstand, f.antalTestet(), f.harFyldt, f.trin(), f.kanGenfylde(), f.knust].join("|");
    }

    /* ----- Beskeden paa scenen ------------------------------------------ */
    function besked(tekst, slags) {
        var el = NK.el("scenebesked");
        el.className = "scenebesked";
        void el.offsetWidth;                      /* genstart animationen */
        el.textContent = tekst;
        el.className = "scenebesked vis " + slags;
        window.clearTimeout(beskedUr);
        beskedUr = window.setTimeout(function () { el.classList.remove("vis"); }, 2600);
    }

    /* ----- Pop op-vinduer og lyd ------------------------------------------ */
    function aabnTeori() {
        NK.Rundvisning.luk();
        NK.el("teori").classList.add("vis");
    }

    function lukOverlay() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function visLyd() {
        var til = NK.Lyd.erTil();
        var knap = NK.el("lydknap");
        knap.classList.toggle("fra", !til);
        knap.setAttribute("aria-pressed", til ? "true" : "false");
    }

    function skiftLyd() {
        NK.Lyd.saet(!NK.Lyd.erTil());
        NK.Lyd.laasOp();
        visLyd();
    }

    /* ----- Tastatur ----------------------------------------------------- */
    function tastatur(e) {
        if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape") { lukOverlay(); NK.Rundvisning.luk(); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") {
            if (NK.Rundvisning.aktiv()) NK.Rundvisning.luk();
            else { lukOverlay(); NK.Rundvisning.start(); }
            return;
        }
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;

        NK.Lyd.laasOp();
        if (e.key === "1") forsoeg.tilfoej("h2");
        else if (e.key === "2") forsoeg.tilfoej("o2");
        else if (e.key === "r" || e.key === "R") forsoeg.toem();
        else if (e.key === "m" || e.key === "M") skiftLyd();
        else if (e.key === "t" || e.key === "T") aabnTeori();
        else if (e.key === "g" || e.key === "G") forsoeg.genfyld();
        else if (e.key === " " || e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;   /* knappen klikker selv */
            e.preventDefault();
            if (forsoeg.tilstand === "knald") forsoeg.genfyld();
            else forsoeg.antaend();
        }
    }

    /* ----- Tegneloekken ------------------------------------------------ */
    function loekke(ts) {
        var dt = (ts - sidsteTid) / 1000;
        sidsteTid = ts;
        if (!isFinite(dt) || dt < 0) dt = 0;
        if (dt > 0.1) dt = 0.1;

        forsoeg.tilpas();
        forsoeg.opdater(dt);
        forsoeg.tegn();

        graf.tilpas();
        graf.opdater(dt, forsoeg.resultater);
        graf.tegn(forsoeg);

        if (signatur() !== sidsteSignatur) opdaterPanel();
        window.requestAnimationFrame(loekke);
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Sprites.start();
        forsoeg = new NK.Forsoeg(NK.el("scene-laerred"));
        graf = new NK.Graf(NK.el("graf-laerred"));
        quiz = new NK.Quiz(M.BLANDINGER.length);

        /* Saa modellen kan pilles ved fra konsollen og fra _selvtest.html */
        NK.forsoeg = forsoeg;
        NK.graf = graf;
        NK.quiz = quiz;
        NK.opdaterPanel = opdaterPanel;

        forsoeg.vedAendring = opdaterPanel;
        forsoeg.vedBesked = besked;

        NK.el("knap-h2").addEventListener("click", function () { NK.Lyd.laasOp(); forsoeg.tilfoej("h2"); });
        NK.el("knap-o2").addEventListener("click", function () { NK.Lyd.laasOp(); forsoeg.tilfoej("o2"); });
        NK.el("knap-toem").addEventListener("click", function () { forsoeg.toem(); });
        NK.el("knap-antaend").addEventListener("click", function () { forsoeg.antaend(); });
        NK.el("knap-genfyld").addEventListener("click", function () { forsoeg.genfyld(); });
        NK.el("graf-ryd").addEventListener("click", function () { forsoeg.rydResultater(); });

        NK.el("teoriknap").addEventListener("click", aabnTeori);
        NK.el("teori-luk").addEventListener("click", lukOverlay);
        NK.el("teori").addEventListener("click", function (e) { if (e.target === this) lukOverlay(); });
        NK.el("lydknap").addEventListener("click", skiftLyd);
        NK.el("hjaelpknap").addEventListener("click", function () { lukOverlay(); NK.Rundvisning.start(); });

        document.addEventListener("keydown", tastatur);

        visLyd();
        forsoeg.tilpas();
        graf.tilpas();
        opdaterPanel();

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

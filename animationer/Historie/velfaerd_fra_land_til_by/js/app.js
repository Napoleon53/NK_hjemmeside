/* =====================================================================
   app.js - binder siden sammen

   Klik og taster, fagordene bag knappen og opstarten. Opgaverne staar i
   js/forloeb.js, raekkerne og personerne i js/figur.js, kurven i
   js/kurve.js og tallene og teksterne i js/data.js.

   Der er ingen laerer i scenen. Naeste skridt staar i statuslinjen
   nederst med den ene store knap.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    function el(id) { return NK.el(id); }

    /* ----- Pop op -------------------------------------------------------- */
    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabnFagord() {
        lukAlle();
        el("fagord").classList.add("vis");
    }

    /* ----- Tastatur ------------------------------------------------------ */
    function tastatur(e) {
        if (e.key === "Escape") {
            lukAlle();
            NK.Rundvisning.luk();
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) {
            if (e.key === "?" || e.key === "h" || e.key === "H") NK.Rundvisning.luk();
            return;
        }
        if (e.key >= "1" && e.key <= "3") { NK.Forloeb.tal(parseInt(e.key, 10) - 1); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { NK.Rundvisning.start(); return; }
        if (e.key === "t" || e.key === "T") { aabnFagord(); return; }
        if (e.key === "k" || e.key === "K") { NK.Forloeb.skiftKurve(); return; }
        if (e.key === "r" || e.key === "R") { NK.Forloeb.start(""); return; }
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            /* skyderen flytter selv, naar den har fokus */
            if (e.target === el("skyder")) return;
            e.preventDefault();
            NK.Forloeb.flytAar(e.key === "ArrowLeft" ? -1 : 1);
            return;
        }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            NK.Forloeb.enter();
        }
    }

    /* Maerkerne under skyderen: de seks aar med tal i figuren. */
    function bygMaerker() {
        var html = "";
        for (var i = 0; i < D.AAR.length; i++) {
            var andel = (D.AAR[i] - D.FOERSTE) / (D.SIDSTE - D.FOERSTE);
            html += '<span class="s-maerke" style="--andel:' + andel + '"><i></i><span class="s-aar">' + D.AAR[i] + "</span></span>";
        }
        el("skyder-maerker").innerHTML = html;
    }

    /* index.html#opgaver springer starten og sorteringen over, og #fri er uden opgaver. */
    function oensketStart() {
        var oenske = (window.location.hash || "").replace(/^#/, "");
        return oenske === "opgaver" || oenske === "fri" ? oenske : "";
    }

    var urTilpas = 0;
    function tilpas() {
        NK.Figur.tilpas();
        NK.Kurve.tilpas();
        NK.Forloeb.tilpasMaerker();
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        bygMaerker();
        NK.Figur.byg();
        NK.Kurve.byg();

        el("skyder").addEventListener("input", function () {
            NK.Forloeb.skyder(parseInt(el("skyder").value, 10));
        });
        el("tjek").addEventListener("click", function () { NK.Forloeb.tjek(); });
        el("valg").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-valg]");
            if (b) NK.Forloeb.valg(parseInt(b.getAttribute("data-valg"), 10));
        });
        el("knap").addEventListener("click", function () { NK.Forloeb.knap(); });

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        el("fagord").addEventListener("click", function (e) { if (e.target === el("fagord")) lukAlle(); });
        el("fagordknap").addEventListener("click", aabnFagord);
        el("kurveknap").addEventListener("click", function () { NK.Forloeb.skiftKurve(); });
        el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(); });
        document.addEventListener("keydown", tastatur);

        window.addEventListener("resize", function () {
            window.clearTimeout(urTilpas);
            urTilpas = window.setTimeout(tilpas, 60);
        });

        NK.Forloeb.start(oensketStart());
        /* skrifttyper og rullepaneler kan flytte maalene en anelse efter foerste tegning */
        window.setTimeout(tilpas, 0);
        window.addEventListener("load", tilpas);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

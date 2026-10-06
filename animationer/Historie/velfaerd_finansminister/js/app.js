/* =====================================================================
   app.js - binder siden sammen

   Klik og taster, fagordene bag knappen og opstarten. Selve forloebet
   og notatet bag Laes mere staar i js/spil.js, maalerne i js/maaler.js
   og teksterne i js/data.js.

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
        if (e.key >= "1" && e.key <= "3") { NK.Spil.klikKort(parseInt(e.key, 10) - 1); return; }
        if (e.key === "?" || e.key === "h" || e.key === "H") { NK.Rundvisning.start(); return; }
        if (e.key === "t" || e.key === "T") { aabnFagord(); return; }
        if (e.key === "l" || e.key === "L") { NK.Spil.aabnNotat(-1); return; }
        if (e.key === "r" || e.key === "R") { NK.Spil.forfra(0); return; }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            NK.Spil.knap();
        }
    }

    /* Man kan linke direkte til et aar med  index.html#1961  */
    function oensketStart() {
        var oenske = (window.location.hash || "").replace(/^#/, "");
        for (var i = 0; i < D.SITUATIONER.length; i++) {
            if (String(D.SITUATIONER[i].aar) === oenske) return i;
        }
        return 0;
    }

    /* ----- Opstart ------------------------------------------------------- */
    function start() {
        NK.Maalere.byg(el("maalere"));

        el("valg").addEventListener("click", function (ev) {
            var mere = ev.target.closest("[data-mere]");
            if (mere) { lukAlle(); NK.Spil.aabnNotat(parseInt(mere.getAttribute("data-mere"), 10)); return; }
            var b = ev.target.closest("[data-kort]");
            if (b) NK.Spil.klikKort(parseInt(b.getAttribute("data-kort"), 10));
        });
        el("maalere").addEventListener("click", function (ev) {
            var b = ev.target.closest("[data-maaler]");
            if (b) NK.Spil.klikMaaler(b.getAttribute("data-maaler"));
        });
        el("knap").addEventListener("click", function () { NK.Spil.knap(); });

        var lukKnapper = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < lukKnapper.length; i++) lukKnapper[i].addEventListener("click", lukAlle);
        el("fagord").addEventListener("click", function (e) { if (e.target === el("fagord")) lukAlle(); });
        el("notat").addEventListener("click", function (e) { if (e.target === el("notat")) lukAlle(); });
        el("fagordknap").addEventListener("click", aabnFagord);
        el("hjaelpknap").addEventListener("click", function () { lukAlle(); NK.Rundvisning.start(); });
        document.addEventListener("keydown", tastatur);

        NK.Spil.start(oensketStart());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

/* =====================================================================
   app.js - binder siden sammen

   Taster, de to pop op-vinduer (Keynes' teori og fagordene) og
   opstarten. Forloebet staar i js/forloeb.js, tegningerne i
   js/kredsloeb.js og js/kurve.js og teksterne i js/data.js.

   Man kan linke direkte til en del:  index.html#2  (1, 2 eller 3)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function el(id) { return NK.el(id); }

    function lukAlle() {
        var aabne = document.querySelectorAll(".overlay.vis");
        for (var i = 0; i < aabne.length; i++) aabne[i].classList.remove("vis");
    }

    function aabn(id) {
        lukAlle();
        el(id).classList.add("vis");
        el(id).querySelector(".overlay-boks").scrollTop = 0;
    }

    function tastatur(e) {
        if (e.key === "Escape") { lukAlle(); return; }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (document.querySelector(".overlay.vis")) return;
        if (e.key >= "1" && e.key <= "3") { NK.Forloeb.klikSvar(parseInt(e.key, 10) - 1); return; }
        if (e.key === "k" || e.key === "K") { aabn("teori"); return; }
        if (e.key === "t" || e.key === "T") { aabn("fagord"); return; }
        if (e.key === "l" || e.key === "L") { NK.Forloeb.mere(); return; }
        if (e.key === "Enter") {
            if (e.target && e.target.tagName === "BUTTON") return;
            e.preventDefault();
            NK.Forloeb.trykKnap();
        }
    }

    function oensketDel() {
        var h = (window.location.hash || "").replace(/^#/, "");
        if (h === "2") return 1;
        if (h === "3") return 2;
        return 0;
    }

    function start() {
        NK.Forloeb.bind();
        el("teoriknap").addEventListener("click", function () { aabn("teori"); });
        el("fagordknap").addEventListener("click", function () { aabn("fagord"); });
        var luk = document.querySelectorAll("[data-luk]");
        for (var i = 0; i < luk.length; i++) luk[i].addEventListener("click", lukAlle);
        ["teori", "fagord", "notat"].forEach(function (id) {
            el(id).addEventListener("click", function (e) { if (e.target === el(id)) lukAlle(); });
        });
        document.addEventListener("keydown", tastatur);
        NK.Forloeb.startDel(oensketDel());
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}());

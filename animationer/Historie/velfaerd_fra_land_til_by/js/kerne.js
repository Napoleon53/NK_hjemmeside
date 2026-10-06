/* =====================================================================
   kerne.js - faelles hjaelpefunktioner

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch:
   mappen skal ogsaa virke, naar index.html aabnes direkte fra
   harddisken (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    /* Tekst, der skal ind i innerHTML, uden at < og & driller. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };

    NK.saetTekst = function (id, tekst) {
        var e = NK.el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    NK.saetHTML = function (id, html) {
        var e = NK.el(id);
        if (e && e.innerHTML !== html) e.innerHTML = html;
    };

    /* Starter en CSS-animation forfra, ogsaa naar klassen sad der i forvejen. */
    NK.genstart = function (element, klasse) {
        if (!element) return;
        element.classList.remove(klasse);
        void element.offsetWidth;
        element.classList.add(klasse);
    };
}());

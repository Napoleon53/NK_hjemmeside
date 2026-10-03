/* =====================================================================
   kerne.js - faelles hjaelpefunktioner for Kemi-Millionaer

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch: mappen
   skal ogsaa virke, naar index.html aabnes direkte fra harddisken
   (file://).
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Alle ventetider i forloebet ganges med NK.Tempo. Selvtesten saetter
       den til 0, saa et helt spil kan spilles paa et oejeblik. */
    NK.Tempo = 1;

    NK.el = function (id) {
        return document.getElementById(id);
    };

    NK.klamp = function (v, lav, hoej) {
        return v < lav ? lav : (v > hoej ? hoej : v);
    };

    /* Blander en kopi af listen (Fisher-Yates). */
    NK.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    NK.tilfaeldig = function (liste) {
        return liste[Math.floor(Math.random() * liste.length)];
    };

    /* ----- Hukommelse i browseren ------------------------------------
       Rekorden, sproget, lyden og de spoergsmaal, der er set for nylig.
       Kan localStorage ikke bruges, virker spillet stadig - man mister
       bare det gemte. */
    NK.hent = function (noegle, standard) {
        try {
            var s = window.localStorage.getItem(noegle);
            return s ? JSON.parse(s) : standard;
        } catch (e) {
            return standard;
        }
    };

    NK.gem = function (noegle, vaerdi) {
        try { window.localStorage.setItem(noegle, JSON.stringify(vaerdi)); } catch (e) { /* ingen hukommelse */ }
    };

    NK.saetTekst = function (id, tekst) {
        var e = NK.el(id);
        if (e && e.textContent !== tekst) e.textContent = tekst;
    };

    /* Goer tekst sikker at saette ind som HTML. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    /* 125000 bliver til 125.000 kr. */
    NK.kr = function (n) {
        return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " kr.";
    };
}());

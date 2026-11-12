/* =====================================================================
   kerne.js - faelles hjaelpere for EscapeRoom Kemi C

   Alt bor i det globale objekt NK. Ingen moduler og ingen fetch, saa
   mappen ogsaa virker, naar index.html aabnes direkte fra harddisken.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.el = function (id) { return document.getElementById(id); };

    NK.klamp = function (v, lav, hoej) { return v < lav ? lav : (v > hoej ? hoej : v); };

    /* Goer tekst sikker at saette ind som HTML. */
    NK.html = function (s) {
        return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    };

    /* Hukommelse i browseren. Kan localStorage ikke bruges, virker
       spillet stadig, men sagen glemmes ved genindlaesning. */
    NK.hent = function (noegle, standard) {
        try {
            var s = window.localStorage.getItem(noegle);
            return s ? JSON.parse(s) : standard;
        } catch (e) { return standard; }
    };
    NK.gem = function (noegle, vaerdi) {
        try { window.localStorage.setItem(noegle, JSON.stringify(vaerdi)); } catch (e) { /* ingen hukommelse */ }
    };
    /* Raa tekst fra et andet spils hukommelse (null, hvis den mangler). */
    NK.hentRaa = function (noegle) {
        try { return window.localStorage.getItem(noegle); } catch (e) { return null; }
    };
    NK.kanHuske = function () {
        try {
            var k = "nk-escaperoom-proeve";
            window.localStorage.setItem(k, "1");
            window.localStorage.removeItem(k);
            return true;
        } catch (e) { return false; }
    };

    /* ----- Tilfaeldighed med froe (mulberry32) ----------------------- */
    /* Den samme sag giver altid de samme tal. */
    NK.Tilfaeldig = function (froe) {
        var a = (froe >>> 0) || 1;
        this.tal = function () {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };
    NK.Tilfaeldig.prototype.heltal = function (lav, hoej) {
        return lav + Math.floor(this.tal() * (hoej - lav + 1));
    };
    NK.Tilfaeldig.prototype.vaelg = function (liste) {
        return liste[Math.floor(this.tal() * liste.length)];
    };
    NK.Tilfaeldig.prototype.bland = function (liste) {
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(this.tal() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };
    /* Et tal mellem lav og hoej i trin af trin (fx 0,05 mL). */
    NK.Tilfaeldig.prototype.trin = function (lav, hoej, trin) {
        var n = Math.round((hoej - lav) / trin);
        return NK.rund(lav + this.heltal(0, n) * trin, 6);
    };

    /* ----- Tal ------------------------------------------------------- */
    NK.rund = function (v, dec) {
        var f = Math.pow(10, dec);
        return Math.round(v * f + (v >= 0 ? 1e-9 : -1e-9)) / f;
    };
    /* Runder til et antal betydende cifre. */
    NK.betydende = function (v, cifre) {
        if (v === 0) return 0;
        var e = Math.floor(Math.log10(Math.abs(v)));
        return NK.rund(v, cifre - 1 - e);
    };
    /* Dansk tal med et fast antal decimaler: 2,40 */
    NK.komma = function (v, dec) {
        return NK.rund(v, dec).toFixed(dec).replace(".", ",").replace("-", "−");
    };

    /* H2O -> H₂O, Ca2+ -> Ca²⁺. Kun til tekst, vi selv skriver. */
    var SUB = { 0: "₀", 1: "₁", 2: "₂", 3: "₃", 4: "₄", 5: "₅", 6: "₆", 7: "₇", 8: "₈", 9: "₉" };
    NK.formel = function (s) {
        return String(s).replace(/(\d+)/g, function (m) {
            return m.split("").map(function (c) { return SUB[c]; }).join("");
        });
    };

    /* Tid som mm:ss (eller t:mm:ss efter en time). */
    NK.tid = function (ms) {
        var s = Math.max(0, Math.floor(ms / 1000));
        var t = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
        var mm = String(m).padStart(2, "0"), ss = String(r).padStart(2, "0");
        return t > 0 ? t + ":" + mm + ":" + ss : mm + ":" + ss;
    };
}());

/* =====================================================================
   lyd.js - smaa lyde lavet i koden

   Ingen lydfiler: alt er korte toner fra Web Audio. Objektet hedder
   NK.Spillyd, fordi Kemichael (kemichael.js) bruger NK.Lyd til sin egen
   mumlen, hvis det findes. Lyden kan slaas fra med knappen i toplinjen
   eller M, og valget huskes i browseren. Lyden startes foerst efter et
   klik eller et tastetryk (browserens regel).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NOEGLE = "nk-iontetris-lyd";
    var ctx = null;
    var til = NK.hent(NOEGLE, true) !== false;

    function lav() {
        if (ctx) return ctx;
        var A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ctx = new A(); } catch (e) { ctx = null; }
        return ctx;
    }

    /* En tone: frekvens, start (s fra nu), laengde, bølgeform, styrke */
    function tone(f, start, laengde, form, styrke, glid) {
        var c = lav();
        if (!c || !til) return;
        if (c.state === "suspended") c.resume();
        var t = c.currentTime + (start || 0);
        var o = c.createOscillator(), g = c.createGain();
        o.type = form || "square";
        o.frequency.setValueAtTime(f, t);
        if (glid) o.frequency.exponentialRampToValueAtTime(glid, t + laengde);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(styrke || 0.05, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + laengde);
        o.connect(g);
        g.connect(c.destination);
        o.start(t);
        o.stop(t + laengde + 0.02);
    }

    var LYDE = {
        drej: function () { tone(740, 0, 0.04, "square", 0.025); },
        laas: function () { tone(150, 0, 0.09, "triangle", 0.09, 90); },
        haardt: function () { tone(220, 0, 0.07, "triangle", 0.08, 80); },
        gem: function () { tone(520, 0, 0.05, "sine", 0.05); tone(390, 0.05, 0.06, "sine", 0.05); },
        salt: function () { tone(880, 0, 0.09, "sine", 0.06); tone(1320, 0.07, 0.14, "sine", 0.05); },
        ryd: function (n) {
            var noder = [523, 659, 784, 1047];
            for (var i = 0; i < Math.min(4, n || 1); i++) tone(noder[i], i * 0.07, 0.16, "square", 0.035);
        },
        vundet: function () { [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) { tone(f, i * 0.11, 0.26, "square", 0.04); }); },
        niveau: function () { tone(659, 0, 0.1, "square", 0.04); tone(880, 0.1, 0.1, "square", 0.04); tone(1175, 0.2, 0.2, "square", 0.04); },
        kaede: function (n) { for (var i = 0; i < Math.min(5, n); i++) tone(784 * Math.pow(1.26, i), 0.12 + i * 0.07, 0.14, "square", 0.035); },
        slut: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, i * 0.16, 0.2, "triangle", 0.07); }); }
    };

    var lyttere = [];

    NK.Spillyd = {
        spil: function (navn, data) { if (til && LYDE[navn]) LYDE[navn](data); },
        til: function () { return til; },
        skift: function () {
            til = !til;
            NK.gem(NOEGLE, til);
            if (til) lav();
            lyttere.forEach(function (f) { f(til); });
            return til;
        },
        vaek: function () { lav(); if (ctx && ctx.state === "suspended") ctx.resume(); },
        vedAendring: function (f) { lyttere.push(f); }
    };
}());

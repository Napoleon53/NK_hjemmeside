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
    var NOEGLE = "nk-organiske-lyd";
    var ctx = null;
    var til = NK.hent(NOEGLE, true) !== false;

    function lav() {
        if (ctx) return ctx;
        var A = window.AudioContext || window.webkitAudioContext;
        if (!A) return null;
        try { ctx = new A(); } catch (e) { ctx = null; }
        return ctx;
    }

    /* En tone: frekvens, start (s fra nu), laengde, boelgeform, styrke, glid til */
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
        greb: function () { tone(620, 0, 0.035, "sine", 0.03); },
        rigtig: function () { tone(660, 0, 0.08, "sine", 0.06); tone(990, 0.06, 0.12, "sine", 0.05); },
        forkert: function () { tone(180, 0, 0.22, "sawtooth", 0.05, 110); tone(120, 0.18, 0.3, "triangle", 0.07, 80); },
        nyKlasse: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.14, "square", 0.035); }); },
        turboNiveau: function () { tone(440, 0, 0.12, "square", 0.035, 880); },
        turbo: function (d) { tone(300 + 80 * ((d && d.n) || 1), 0, 0.18, "sawtooth", 0.03, 1200); },
        hjaelp: function () { tone(880, 0, 0.06, "sine", 0.05); tone(1320, 0.05, 0.08, "sine", 0.04); },
        enzym: function () { for (var i = 0; i < 5; i++) tone(1047 * Math.pow(1.12, i), i * 0.05, 0.1, "sine", 0.04); },
        kaffe: function () { tone(300, 0, 0.25, "triangle", 0.04, 180); },
        mester: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, i * 0.13, 0.2, "square", 0.04); }); },
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

/* =====================================================================
   lyd.js - smaa lyde lavet i koden (som i Organiske grupper)

   Ingen lydfiler: korte toner fra Web Audio. Lyden kan slaas fra med
   knappen i toplinjen eller M, og valget huskes i browseren. Lyden
   startes foerst efter et klik eller et tastetryk (browserens regel).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NOEGLE = "nk-syntese-lyd";
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
        op: function () { tone(520, 0, 0.05, "sine", 0.02, 700); },
        bonk: function (d) {
            var n = (d && d.faktor) || 1;
            tone(180, 0, 0.07, "triangle", 0.09, 90);
            tone(700 + 90 * n, 0.02, 0.09, "sine", 0.05);
        },
        rigtig: function () { tone(660, 0, 0.08, "sine", 0.06); tone(990, 0.06, 0.12, "sine", 0.05); },
        forkert: function () { tone(180, 0, 0.22, "sawtooth", 0.05, 110); tone(120, 0.18, 0.3, "triangle", 0.07, 80); },
        smut: function () { tone(400, 0, 0.12, "sine", 0.02, 220); },
        niveau: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.09, 0.14, "square", 0.035); }); },
        reaktion: function () { for (var i = 0; i < 4; i++) tone(500 + 120 * i, i * 0.05, 0.08, "sine", 0.03); },
        ingen: function () { tone(240, 0, 0.16, "triangle", 0.05, 200); },
        maal: function () { [523, 659, 784, 1047, 784, 1047].forEach(function (f, i) { tone(f, i * 0.11, 0.18, "square", 0.035); }); },
        slut: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, i * 0.16, 0.2, "triangle", 0.07); }); },
        tik: function () { tone(1200, 0, 0.03, "sine", 0.015); }
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

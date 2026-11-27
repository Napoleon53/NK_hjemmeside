/* =====================================================================
   lyd.js - Bundfalds lyde, lavet med Web Audio (ingen lydfiler)

   NK.Lyd.spil("plop" | "opl" | "forkert" | "bund" | "lag" | "roer" |
   "niveau" | "slut" | "fyldt"). NK.Lyd.til(true/false) slaar lyden til og
   fra. Lydsystemet startes foerst ved elevens foerste tryk.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};
    var L = NK.Lyd = {};
    var ctx = null, til = true;

    function kontekst() {
        if (!til) return null;
        if (!ctx) {
            var K = window.AudioContext || window.webkitAudioContext;
            if (!K) return null;
            try { ctx = new K(); } catch (e) { return null; }
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
    }

    function tone(c, frek, start, varighed, o) {
        o = o || {};
        var osc = c.createOscillator(), g = c.createGain();
        osc.type = o.type || "sine";
        osc.frequency.setValueAtTime(frek, start);
        if (o.til) osc.frequency.exponentialRampToValueAtTime(o.til, start + varighed);
        var styrke = o.styrke || 0.18;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(styrke, start + Math.min(0.02, varighed / 4));
        g.gain.exponentialRampToValueAtTime(0.0001, start + varighed);
        osc.connect(g);
        g.connect(c.destination);
        osc.start(start);
        osc.stop(start + varighed + 0.05);
    }

    function stoej(c, start, varighed, frek, styrke) {
        var n = Math.floor(c.sampleRate * varighed);
        var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
        var src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
        src.buffer = buf;
        f.type = "bandpass";
        f.frequency.value = frek;
        f.Q.value = 1.2;
        g.gain.value = styrke;
        src.connect(f); f.connect(g); g.connect(c.destination);
        src.start(start);
    }

    L.til = function (t) {
        if (typeof t === "boolean") til = t;
        return til;
    };

    L.spil = function (navn, tal) {
        var c = kontekst();
        if (!c) return;
        var t = c.currentTime + 0.01;
        if (navn === "plop") {
            tone(c, 520, t, 0.12, { til: 180, styrke: 0.08 });
        } else if (navn === "opl") {
            var trin = Math.min(tal || 1, 8);
            var grund = 523 * Math.pow(2, (trin - 1) / 12);
            tone(c, grund, t, 0.14, { type: "triangle", styrke: 0.12 });
            tone(c, grund * 1.25, t + 0.07, 0.14, { type: "triangle", styrke: 0.11 });
            tone(c, grund * 1.5, t + 0.14, 0.22, { type: "triangle", styrke: 0.1 });
            stoej(c, t + 0.05, 0.35, 3200, 0.05);
        } else if (navn === "forkert") {
            tone(c, 196, t, 0.18, { type: "square", styrke: 0.05 });
            tone(c, 147, t + 0.12, 0.22, { type: "square", styrke: 0.05 });
        } else if (navn === "bund") {
            tone(c, 110, t, 0.35, { til: 60, styrke: 0.22 });
            stoej(c, t, 0.25, 400, 0.12);
        } else if (navn === "lag") {
            stoej(c, t, 0.5, 900, 0.08);
        } else if (navn === "roer") {
            stoej(c, t, 0.9, 1500, 0.06);
            tone(c, 392, t + 0.2, 0.2, { type: "triangle", styrke: 0.08 });
            tone(c, 523, t + 0.4, 0.3, { type: "triangle", styrke: 0.08 });
        } else if (navn === "niveau") {
            tone(c, 659, t, 0.16, { type: "triangle", styrke: 0.1 });
            tone(c, 880, t + 0.14, 0.26, { type: "triangle", styrke: 0.1 });
        } else if (navn === "slut") {
            [523, 659, 784, 1047].forEach(function (f, i) {
                tone(c, f, t + i * 0.13, 0.3, { type: "triangle", styrke: 0.11 });
            });
            tone(c, 1319, t + 0.55, 0.6, { type: "triangle", styrke: 0.09 });
        } else if (navn === "fyldt") {
            [392, 330, 262].forEach(function (f, i) {
                tone(c, f, t + i * 0.2, 0.35, { type: "triangle", styrke: 0.1 });
            });
        }
    };
}());

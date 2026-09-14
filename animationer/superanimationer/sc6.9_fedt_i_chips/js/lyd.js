/* =====================================================================
   lyd.js - lydene, lavet med Web Audio (ingen lydfiler)

   Chips i vejebaaden, knas og skrab i morteren, haeldning, roering,
   dryp, kogning, varmepladen, vaegtens bip, et stikflammesus, roeg-
   alarmen, laererens brummen og mumlen, en slurk kaffe og et lille
   signal, naar noget er lykkedes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ctx = null;
    var til = true;

    try {
        var gemt = window.localStorage && window.localStorage.getItem("nk-sc69-lyd");
        if (gemt === "fra") til = false;
    } catch (fejl) { /* file:// eller privat browsing */ }

    function hent() {
        if (!ctx) {
            var Klasse = window.AudioContext || window.webkitAudioContext;
            if (!Klasse) return null;
            ctx = new Klasse();
        }
        return ctx;
    }

    function klar() {
        if (!til) return null;
        var c = hent();
        if (!c || c.state !== "running") return null;
        return c;
    }

    function stoej(c, varighed, form) {
        var buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * varighed)), c.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * form(1 - i / data.length);
        var kilde = c.createBufferSource();
        kilde.buffer = buffer;
        return kilde;
    }

    function filtreretStoej(c, t, varighed, type, frekvens, q, styrke, form) {
        var kilde = stoej(c, varighed, form || function (r) { return r * r; });
        var f = c.createBiquadFilter();
        f.type = type;
        f.frequency.setValueAtTime(frekvens, t);
        if (q) f.Q.setValueAtTime(q, t);
        var g = c.createGain();
        g.gain.setValueAtTime(styrke, t);
        kilde.connect(f).connect(g).connect(c.destination);
        kilde.start(t);
    }

    function tone(c, t, fra, til2, varighed, styrke, type, filterFrekvens) {
        var o = c.createOscillator();
        o.type = type || "sine";
        o.frequency.setValueAtTime(fra, t);
        o.frequency.exponentialRampToValueAtTime(til2, t + varighed);
        var g = c.createGain();
        g.gain.setValueAtTime(0.0005, t);
        g.gain.exponentialRampToValueAtTime(styrke, t + Math.min(0.02, varighed / 4));
        g.gain.exponentialRampToValueAtTime(0.0005, t + varighed);
        var ud = g;
        if (filterFrekvens) {
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.setValueAtTime(filterFrekvens, t);
            g.connect(f);
            ud = f;
        }
        o.connect(g);
        ud.connect(c.destination);
        o.start(t);
        o.stop(t + varighed + 0.02);
    }

    NK.Lyd = {
        /* Browsere kraever et klik, foer der maa spilles lyd. */
        laasOp: function () {
            var c = hent();
            if (c && c.state === "suspended") c.resume();
        },

        erTil: function () { return til; },

        saet: function (v) {
            til = !!v;
            try { window.localStorage && window.localStorage.setItem("nk-sc69-lyd", til ? "til" : "fra"); } catch (fejl) {}
        },

        klik: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.03, "highpass", 2500, 0, 0.3);
            tone(c, c.currentTime, 1800, 900, 0.04, 0.06, "square");
        },

        /* En chip lander i vejebaaden */
        tik: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.05, "bandpass", 2600 + Math.random() * 1200, 3, 0.25);
        },

        /* Knas: en chip, der braekker eller bliver spist */
        knas: function (styrke) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var n = 4 + Math.round(4 * (styrke === undefined ? 1 : styrke));
            for (var i = 0; i < n; i++) {
                var t = nu + i * 0.035 + Math.random() * 0.03;
                filtreretStoej(c, t, 0.04, "bandpass", 1800 + Math.random() * 2600, 2, 0.35 * (styrke === undefined ? 1 : styrke), function (r) { return r * r * r; });
            }
        },

        skrab: function (styrke) {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.12, "bandpass", 700 + Math.random() * 500, 1.5, 0.08 + 0.2 * NK.klamp(styrke, 0, 1));
        },

        haeld: function (varighed) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var n = Math.round(varighed * 11);
            for (var i = 0; i < n; i++) {
                var t = nu + i * (varighed / n) + Math.random() * 0.03;
                filtreretStoej(c, t, 0.07, "bandpass", 280 + Math.random() * 520, 5, 0.2);
            }
        },

        /* Glasstaven rammer glasset */
        klirr: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 3100 + Math.random() * 500, 3000, 0.18, 0.04);
        },

        plip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 700 + Math.random() * 200, 1500, 0.08, 0.08);
        },

        boble: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 260 + Math.random() * 260, 700, 0.05, 0.05);
        },

        bip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 2400, 2400, 0.09, 0.05, "square", 4000);
        },

        /* Stikflammen: et dybt sus */
        sus: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var kilde = stoej(c, 1.1, function (r) { return Math.min(1, (1 - r) * 8) * r; });
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.setValueAtTime(300, nu);
            f.frequency.exponentialRampToValueAtTime(1800, nu + 0.25);
            f.frequency.exponentialRampToValueAtTime(400, nu + 1.1);
            var g = c.createGain();
            g.gain.setValueAtTime(0.9, nu);
            kilde.connect(f).connect(g).connect(c.destination);
            kilde.start(nu);
            tone(c, nu, 90, 40, 0.5, 0.5);
        },

        /* Ét bip fra roegalarmen */
        alarm: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 3200, 3200, 0.16, 0.05, "square", 6000);
        },

        dunk: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.25, "lowpass", 500, 0, 0.6);
            tone(c, c.currentTime, 120, 45, 0.2, 0.3);
        },

        /* Laererens utilfredse brummen */
        brum: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            tone(c, nu, 120, 88, 0.42, 0.16, "sawtooth", 520);
            tone(c, nu + 0.02, 122, 90, 0.4, 0.06, "square", 380);
        },

        /* Mumlen, mens laereren taler: korte stavelser */
        mumle: function (antal) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var n = antal || 4;
            for (var i = 0; i < n; i++) {
                var t = nu + i * 0.13 + Math.random() * 0.03;
                var f = 130 + Math.random() * 50;
                tone(c, t, f, f * (0.85 + Math.random() * 0.2), 0.1, 0.1, "sawtooth", 900);
            }
        },

        slurk: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.3, "bandpass", 500, 3, 0.25);
            tone(c, nu + 0.05, 300, 180, 0.2, 0.08);
            tone(c, nu + 0.35, 260, 160, 0.15, 0.06);
        },

        succes: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 660, 662, 0.25, 0.07);
            tone(c, c.currentTime + 0.12, 880, 882, 0.35, 0.07);
        }
    };
}());

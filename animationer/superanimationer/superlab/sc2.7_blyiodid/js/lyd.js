/* =====================================================================
   lyd.js - lydene, lavet med Web Audio (ingen lydfiler)

   Haeldning, pulver fra spatlen, vaegtens bip, knapperne paa
   varmepladen, omroererens summen, kogebobler, glimt fra krystallerne,
   spild, laererens brummen og mumlen, en slurk kaffe og et lille signal,
   naar noget er lykkedes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ctx = null;
    var til = true;
    var summen = null;

    try {
        var gemt = window.localStorage && window.localStorage.getItem("nk-sc27-lyd");
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
            try { window.localStorage && window.localStorage.setItem("nk-sc27-lyd", til ? "til" : "fra"); } catch (fejl) {}
            if (!til) NK.Lyd.omroering(false);
        },

        klik: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.03, "highpass", 2500, 0, 0.3);
            tone(c, c.currentTime, 1800, 900, 0.04, 0.06, "square");
        },

        /* En lav summen, mens magnetomroereren koerer. */
        omroering: function (paa) {
            var c = hent();
            if (!paa || !til) {
                if (summen) {
                    var gammel = summen;
                    summen = null;
                    try {
                        gammel.g.gain.setTargetAtTime(0, c.currentTime, 0.12);
                        gammel.o.stop(c.currentTime + 0.5);
                    } catch (fejl) {}
                }
                return;
            }
            if (summen || !c) return;
            var o = c.createOscillator();
            o.type = "sawtooth";
            o.frequency.setValueAtTime(96, c.currentTime);
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.setValueAtTime(260, c.currentTime);
            var g = c.createGain();
            g.gain.setValueAtTime(0, c.currentTime);
            g.gain.setTargetAtTime(0.025, c.currentTime, 0.3);
            o.connect(f).connect(g).connect(c.destination);
            o.start();
            summen = { o: o, g: g };
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

        /* Pulver, der drysser fra spatlen eller vejebaaden */
        drys: function (varighed) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var n = Math.max(2, Math.round((varighed || 0.3) * 18));
            for (var i = 0; i < n; i++) {
                filtreretStoej(c, nu + i * 0.018 + Math.random() * 0.012, 0.025, "highpass", 4200 + Math.random() * 2500, 0, 0.12);
            }
        },

        /* Vaegten falder til ro */
        bip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 2400, 2400, 0.07, 0.04, "square", 5000);
        },

        plip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 700 + Math.random() * 200, 1500, 0.08, 0.1);
        },

        boble: function () {
            var c = klar(); if (!c) return;
            var f = 300 + Math.random() * 500;
            tone(c, c.currentTime, f, f * 1.8, 0.05, 0.05);
        },

        /* Krystallerne glimter */
        glimt: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            tone(c, nu, 2600 + Math.random() * 600, 3200, 0.18, 0.025);
            tone(c, nu + 0.07, 3300 + Math.random() * 500, 3900, 0.2, 0.018);
        },

        /* Pulver, der spildes paa bordet */
        plask: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.35, "highpass", 1800, 0, 0.35);
            tone(c, nu, 200, 90, 0.12, 0.12);
        },

        papir: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            for (var i = 0; i < 5; i++) {
                filtreretStoej(c, nu + i * 0.05 + Math.random() * 0.02, 0.05, "highpass", 2200 + Math.random() * 2000, 0, 0.16);
            }
        },

        kontakt: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.04, "bandpass", 2000, 3, 0.4);
            tone(c, c.currentTime + 0.01, 300, 220, 0.05, 0.1, "square", 1500);
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

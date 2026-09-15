/* =====================================================================
   lyd.js - lydene, lavet med Web Audio (ingen lydfiler)

   Klik paa kontakten, udsugningens sus, skvulp ved rystning, hældning,
   draaber, sprayen, kosten, glas der knuses, og et lille signal, naar
   en test er lykkedes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ctx = null;
    var til = true;
    var sus = null;

    try {
        var gemt = window.localStorage && window.localStorage.getItem("nk-sc26-lyd");
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
        g.gain.setValueAtTime(styrke, t);
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
            try { window.localStorage && window.localStorage.setItem("nk-sc26-lyd", til ? "til" : "fra"); } catch (fejl) {}
            if (!til) NK.Lyd.udsugning(false);
        },

        klik: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.03, "highpass", 2500, 0, 0.35);
            tone(c, c.currentTime, 1800, 900, 0.04, 0.08, "square");
        },

        /* Et lavt, vedvarende sus, mens udsugningen koerer. */
        udsugning: function (paa) {
            var c = hent();
            if (!paa || !til) {
                if (sus) {
                    var gammel = sus;
                    sus = null;
                    try {
                        gammel.g.gain.setTargetAtTime(0, c.currentTime, 0.15);
                        gammel.kilde.stop(c.currentTime + 0.6);
                    } catch (fejl) {}
                }
                return;
            }
            if (sus || !c) return;
            var kilde = stoej(c, 2, function () { return 1; });
            kilde.loop = true;
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.setValueAtTime(420, c.currentTime);
            var g = c.createGain();
            g.gain.setValueAtTime(0, c.currentTime);
            g.gain.setTargetAtTime(0.05, c.currentTime, 0.4);
            kilde.connect(f).connect(g).connect(c.destination);
            kilde.start();
            sus = { kilde: kilde, g: g };
        },

        skvulp: function (styrke) {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.14, "bandpass", 500 + Math.random() * 500, 1.4, 0.12 + 0.3 * NK.klamp(styrke, 0, 1));
        },

        haeld: function (varighed) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var n = Math.round(varighed * 11);
            for (var i = 0; i < n; i++) {
                var t = nu + i * (varighed / n) + Math.random() * 0.03;
                filtreretStoej(c, t, 0.07, "bandpass", 280 + Math.random() * 520, 5, 0.22);
            }
        },

        plip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 700, 1500, 0.09, 0.14);
        },

        spray: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.45, "highpass", 3000, 0, 0.25, function (r) { return Math.min(1, r * 3); });
        },

        fej: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.12, "bandpass", 1600 + Math.random() * 900, 1.2, 0.18);
        },

        succes: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 660, 662, 0.25, 0.07);
            tone(c, c.currentTime + 0.12, 880, 882, 0.35, 0.07);
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

        /* Koekkenrulle, der rives af */
        papir: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.22, "bandpass", 2600, 0.9, 0.2);
        },

        plask: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.4, "lowpass", 1400, 0, 0.5);
            tone(c, nu, 140, 50, 0.2, 0.35);
        },

        /* Glas, der knuses: et skarpt knaek og en regn af klirrende skaar. */
        glas: function () {
            var c = klar(); if (!c) return false;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.09, "highpass", 1500, 0, 0.55);
            for (var i = 0; i < 11; i++) {
                var t = nu + 0.04 + i * 0.045 + Math.random() * 0.05;
                filtreretStoej(c, t, 0.06, "bandpass", 3000 + Math.random() * 4000, 6, 0.35, function (r) { return r * r * r; });
                tone(c, t, 2400 + Math.random() * 3600, 2300, 0.25, 0.05);
            }
            return true;
        }
    };
}());

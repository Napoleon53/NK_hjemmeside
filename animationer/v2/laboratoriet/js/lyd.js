/* =====================================================================
   lyd.js - lydene, lavet med Web Audio (ingen lydfiler)

   Haeldning, sproejt, skvulp i glasset, dryp, papir, varmepladens
   kontakt, et plask ved spild, laererens brummen og
   mumlen, en slurk kaffe og et lille signal, naar noget er lykkedes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ctx = null;
    var til = true;
    var sus = null;

    try {
        var gemt = window.localStorage && window.localStorage.getItem("nk-lab-lyd");
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
            try { window.localStorage && window.localStorage.setItem("nk-lab-lyd", til ? "til" : "fra"); } catch (fejl) {}
            if (!til) NK.Lyd.udsugning(false);
        },

        klik: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.03, "highpass", 2500, 0, 0.3);
            tone(c, c.currentTime, 1800, 900, 0.04, 0.06, "square");
        },

        /* Et lavt, vedvarende sus, mens udsugningen koerer. */
        udsugning: function (paa) {
            var c = hent();
            if (!paa || !til) {
                if (sus) {
                    var gammel = sus;
                    sus = null;
                    try {
                        gammel.g.gain.setTargetAtTime(0, c.currentTime, 0.3);
                        gammel.kilde.stop(c.currentTime + 1.2);
                        if (gammel.lfo) gammel.lfo.stop(c.currentTime + 1.2);
                    } catch (fejl) {}
                }
                return;
            }
            if (sus || !c) return;
            /* Et dybt, blidt sus: stoej gennem to lave filtre, saa der ingen
               hvislen er, med en langsom boelgen som fra en ventilator */
            var kilde = stoej(c, 3, function () { return 1; });
            kilde.loop = true;
            var f1 = c.createBiquadFilter();
            f1.type = "lowpass";
            f1.frequency.setValueAtTime(150, c.currentTime);
            f1.Q.setValueAtTime(0.6, c.currentTime);
            var f2 = c.createBiquadFilter();
            f2.type = "lowpass";
            f2.frequency.setValueAtTime(320, c.currentTime);
            var g = c.createGain();
            g.gain.setValueAtTime(0, c.currentTime);
            g.gain.setTargetAtTime(0.028, c.currentTime, 0.8);
            var lfo = c.createOscillator();
            lfo.frequency.setValueAtTime(0.23, c.currentTime);
            var dybde = c.createGain();
            dybde.gain.setValueAtTime(0.006, c.currentTime);
            lfo.connect(dybde).connect(g.gain);
            lfo.start();
            kilde.connect(f1).connect(f2).connect(g).connect(c.destination);
            kilde.start();
            sus = { kilde: kilde, g: g, lfo: lfo };
        },

        /* Vaeske, der skvulper i et glas: bloed, dyb og uden skarp ansats */
        skvulp: function (styrke) {
            var c = klar(); if (!c) return;
            var s = NK.klamp(styrke, 0, 1);
            filtreretStoej(c, c.currentTime, 0.28 + 0.1 * s, "bandpass", 260 + Math.random() * 300, 0.7, 0.05 + 0.1 * s, function (r) { return Math.sin(Math.PI * (1 - r)); });
        },

        /* Glas, der knuses */
        knus: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.35, "highpass", 2400, 0, 0.35);
            for (var i = 0; i < 5; i++) tone(c, nu + i * 0.045 + Math.random() * 0.02, 2200 + Math.random() * 1800, 900 + Math.random() * 600, 0.09, 0.07);
        },

        /* Haeldning: et sammenhaengende, blidt sus af vaeske med et par
           kluk undervejs. varighed i sekunder. */
        haeld: function (varighed) {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            var d = Math.max(0.3, varighed);
            filtreretStoej(c, nu, d, "bandpass", 420, 1.2, 0.09, function (r) { var p = 1 - r; return Math.sin(Math.PI * Math.min(1, p * 4)) * (p < 0.25 ? 1 : 0.7 + 0.3 * Math.sin(p * 40)); });
            var n = Math.max(1, Math.round(d * 2.5));
            for (var i = 0; i < n; i++) {
                var t = nu + 0.08 + i * (d / n) + Math.random() * 0.12;
                if (t < nu + d - 0.05) tone(c, t, 210 + Math.random() * 60, 120, 0.07, 0.05, "sine");
            }
        },

        plip: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 700 + Math.random() * 200, 1500, 0.08, 0.1);
        },

        /* Proppen saettes i */
        prop: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.06, "lowpass", 900, 0, 0.35);
            tone(c, c.currentTime, 420, 300, 0.07, 0.08);
        },

        /* Proppen springer af */
        pop: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.05, "bandpass", 1400, 2, 0.6);
            tone(c, nu, 900, 200, 0.12, 0.25);
        },

        /* Vaeske, der sprøjter ud */
        plask: function () {
            var c = klar(); if (!c) return;
            var nu = c.currentTime;
            filtreretStoej(c, nu, 0.4, "lowpass", 1400, 0, 0.45);
            tone(c, nu, 140, 50, 0.2, 0.25);
        },

        /* Papir og folie, der krammes */
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
            /* Et "hm" med lukket mund: bloed trekantboelge, lavt filtreret */
            tone(c, nu, 112, 94, 0.45, 0.09, "triangle", 360);
            tone(c, nu + 0.03, 224, 188, 0.4, 0.02, "sine");
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

        /* Et enkelt dunk til dab'et */
        bom: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.2, "lowpass", 700, 0, 0.5);
            tone(c, c.currentTime, 180, 60, 0.25, 0.3);
        },

        succes: function () {
            var c = klar(); if (!c) return;
            tone(c, c.currentTime, 660, 662, 0.25, 0.07);
            tone(c, c.currentTime + 0.12, 880, 882, 0.35, 0.07);
        }
    };
}());

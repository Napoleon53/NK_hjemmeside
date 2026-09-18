/* =====================================================================
   lyd.js - knaldet, lavet med Web Audio (ingen lydfiler)

   Samme lyd som i den gamle animation: filtreret stoej plus en dyb
   tone, der begge bliver kraftigere og laengere med styrken. Ved
   styrke 0 kommer der kun et svagt sus.

   Desuden laererens lyde (mumle, brum, slurk), koekkenrullen, flammen,
   der slukkes af vandet (sus), og braenderen, der taendes igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var ctx = null;
    var til = true;

    try {
        var gemt = window.localStorage && window.localStorage.getItem("nk-sc13-lyd");
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
            try { window.localStorage && window.localStorage.setItem("nk-sc13-lyd", til ? "til" : "fra"); } catch (fejl) {}
        },

        /* Ren H2 eller ren O2 reagerer ikke, og saa er der ingen lyd.
           Returnerer, om der blev spillet noget. */
        knald: function (styrke) {
            if (!til || styrke <= 0) return false;
            var c = hent();
            if (!c) return false;
            var nu = c.currentTime;

            var varighed = 0.15 + (styrke / 100) * 0.35;
            var kilde = stoej(c, varighed, function (r) { return r * r; });
            var filter = c.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.setValueAtTime(1200 + styrke * 10, nu);
            var gain = c.createGain();
            gain.gain.setValueAtTime(Math.min(1, 0.3 + styrke / 100), nu);
            gain.gain.exponentialRampToValueAtTime(0.001, nu + varighed);
            kilde.connect(filter).connect(gain).connect(c.destination);
            kilde.start(nu);

            var tone = c.createOscillator();
            tone.type = "sine";
            tone.frequency.setValueAtTime(80, nu);
            tone.frequency.exponentialRampToValueAtTime(30, nu + varighed);
            var toneGain = c.createGain();
            toneGain.gain.setValueAtTime(Math.min(0.8, styrke / 100), nu);
            toneGain.gain.exponentialRampToValueAtTime(0.001, nu + varighed);
            tone.connect(toneGain).connect(c.destination);
            tone.start(nu);
            tone.stop(nu + varighed);
            return true;
        },

        /* Vandet rammer flammen: et hvaesende sus */
        sus: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.9, "highpass", 2200, 0, 0.3, function (r) { return Math.min(1, r * 2.5); });
        },

        /* Braenderen taendes igen */
        taend: function () {
            var c = klar(); if (!c) return;
            filtreretStoej(c, c.currentTime, 0.35, "lowpass", 900, 0, 0.35, function (r) { return r; });
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

        /* Glas, der knaekker: et skarpt knaek og en regn af klirrende
           smaa skaar. */
        glas: function () {
            if (!til) return false;
            var c = hent();
            if (!c) return false;
            var nu = c.currentTime;

            var knaek = stoej(c, 0.09, function (r) { return r * r; });
            var hp = c.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.setValueAtTime(1500, nu);
            var gk = c.createGain();
            gk.gain.setValueAtTime(0.55, nu);
            knaek.connect(hp).connect(gk).connect(c.destination);
            knaek.start(nu);

            for (var i = 0; i < 9; i++) {
                var t = nu + 0.04 + i * 0.045 + Math.random() * 0.05;
                var klir = stoej(c, 0.06, function (r) { return r * r * r; });
                var bp = c.createBiquadFilter();
                bp.type = "bandpass";
                bp.frequency.setValueAtTime(3000 + Math.random() * 4000, t);
                bp.Q.setValueAtTime(6, t);
                var gs = c.createGain();
                gs.gain.setValueAtTime(0.35, t);
                klir.connect(bp).connect(gs).connect(c.destination);
                klir.start(t);

                var ping = c.createOscillator();
                ping.type = "sine";
                ping.frequency.setValueAtTime(2400 + Math.random() * 3600, t);
                var gp = c.createGain();
                gp.gain.setValueAtTime(0.06, t);
                gp.gain.exponentialRampToValueAtTime(0.0005, t + 0.25);
                ping.connect(gp).connect(c.destination);
                ping.start(t);
                ping.stop(t + 0.26);
            }
            return true;
        }
    };
}());

/* =====================================================================
   lyd.js - knaldet, lavet med Web Audio (ingen lydfiler)

   Samme lyd som i den gamle animation: filtreret stoej plus en dyb
   tone, der begge bliver kraftigere og laengere med styrken. Ved
   styrke 0 kommer der kun et svagt sus.
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

    function stoej(c, varighed, form) {
        var buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * varighed)), c.sampleRate);
        var data = buffer.getChannelData(0);
        for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * form(1 - i / data.length);
        var kilde = c.createBufferSource();
        kilde.buffer = buffer;
        return kilde;
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

        knald: function (styrke) {
            if (!til) return;
            var c = hent();
            if (!c) return;
            var nu = c.currentTime;

            if (styrke <= 0) {
                var sus = stoej(c, 0.18, function (r) { return 0.15 * r; });
                var g0 = c.createGain();
                g0.gain.setValueAtTime(0.3, nu);
                sus.connect(g0).connect(c.destination);
                sus.start(nu);
                return;
            }

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
        }
    };
}());

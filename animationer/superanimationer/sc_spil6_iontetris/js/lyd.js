/* =====================================================================
   lyd.js - smaa lyde lavet i koden og baggrundsmusikken

   Lydene er korte toner fra Web Audio, ingen lydfiler. Objektet hedder
   NK.Spillyd, fordi Kemichael (kemichael.js) bruger NK.Lyd til sin egen
   mumlen, hvis det findes. Lyden kan slaas fra med knappen i toplinjen
   eller M, og valget huskes i browseren. Lyden startes foerst efter et
   klik eller et tastetryk (browserens regel).

   Musikken er den eneste lydfil: D.MUSIK (musik.mp3 i spillets mappe).
   Den hentes, foerste gang et spil starter med lyden slaaet til, spilles
   i loekke, mens der spilles, og foelger lydknappen. Findes filen ikke,
   sker der ikke noget.

   Filen er klippet, saa slutningen gaar takt i takt over i starten. Den
   afspilles derfor fra en buffer i Web Audio, som gentager uden pause.
   Et <audio>-element med loop laver et lille hak ved overgangen; det
   bruges kun, naar filen ikke kan hentes med fetch (aabnet fra
   harddisken) eller ikke kan afkodes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
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
        ramme: function () { tone(587, 0, 0.07, "sine", 0.045); },
        spraeng: function () { tone(120, 0.05, 0.22, "sawtooth", 0.07, 45); },
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

    /* ----- Baggrundsmusikken ---------------------------------------------- */
    var musikOensket = false, musikHentet = false, musikKlar = false;
    var buffer = null, kilde = null, musikGain = null, startTid = 0, sted = 0;   /* Web Audio */
    var musik = null;                                                           /* <audio> */
    var TONE_IND = 0.04;        /* sekunder: musikken toner ind og ud, saa pause ikke klikker */

    function styrke() { return NK.klamp(D.MUSIK_STYRKE, 0, 1); }

    function hentMusik() {
        if (musikHentet || !D.MUSIK) return;
        musikHentet = true;
        var c = lav();
        if (!c || !window.fetch || window.location.protocol === "file:") { hentSomElement(); return; }
        window.fetch(D.MUSIK).then(function (svar) {
            if (!svar.ok) throw new Error("ingen musikfil");
            return svar.arrayBuffer();
        }).then(function (data) {
            return new Promise(function (ok, fejl) {
                var p = c.decodeAudioData(data, ok, fejl);
                if (p && p.then) p.then(ok, fejl);
            });
        }).then(function (b) {
            buffer = b;
            musikKlar = true;
            foelgMusik();
        }, function () { hentSomElement(); });
    }

    /* Fra harddisken, eller hvis filen ikke kunne hentes eller afkodes */
    function hentSomElement() {
        if (musik || typeof window.Audio !== "function") return;
        musik = new window.Audio();
        musik.loop = true;
        musik.preload = "auto";
        musik.volume = styrke();
        musik.addEventListener("canplay", function () { musikKlar = true; foelgMusik(); });
        musik.addEventListener("error", function () { musikKlar = false; });
        musik.src = D.MUSIK;
    }

    function startBuffer() {
        if (kilde) return;
        var c = lav();
        if (c.state === "suspended") c.resume();
        if (!musikGain) {
            musikGain = c.createGain();
            musikGain.connect(c.destination);
        }
        var nu = c.currentTime;
        kilde = c.createBufferSource();
        kilde.buffer = buffer;
        kilde.loop = true;
        kilde.connect(musikGain);
        musikGain.gain.cancelScheduledValues(nu);
        musikGain.gain.setValueAtTime(0.0001, nu);
        musikGain.gain.linearRampToValueAtTime(styrke(), nu + TONE_IND);
        kilde.start(nu, sted % buffer.duration);
        startTid = nu - sted;
    }

    /* Husker, hvor i nummeret den naaede til, saa Fortsæt tager traaden op */
    function stopBuffer() {
        if (!kilde) return;
        var c = lav(), nu = c.currentTime, gl = kilde;
        sted = (nu - startTid) % buffer.duration;
        musikGain.gain.cancelScheduledValues(nu);
        musikGain.gain.setValueAtTime(musikGain.gain.value, nu);
        musikGain.gain.linearRampToValueAtTime(0.0001, nu + TONE_IND);
        try { gl.stop(nu + TONE_IND + 0.01); } catch (e) { /* allerede stoppet */ }
        gl.onended = function () { gl.disconnect(); };
        kilde = null;
    }

    function foelgMusik() {
        var skal = til && musikOensket;
        if (skal && !musikHentet) hentMusik();
        if (!musikKlar) return;
        if (buffer) {
            if (skal) startBuffer(); else stopBuffer();
        } else if (musik) {
            if (skal) {
                var p = musik.play();
                if (p && p.then) p.then(null, function () { /* venter paa et klik */ });
            } else musik.pause();
        }
    }

    NK.Spillyd = {
        spil: function (navn, data) { if (til && LYDE[navn]) LYDE[navn](data); },
        til: function () { return til; },
        skift: function () {
            til = !til;
            NK.gem(NOEGLE, til);
            if (til) lav();
            foelgMusik();
            lyttere.forEach(function (f) { f(til); });
            return til;
        },
        /* koerer: spilles der lige nu? Musikken hentes ved det foerste spil. */
        musik: function (koerer) {
            musikOensket = !!koerer;
            foelgMusik();
        },
        /* maade: "buffer" (gentager uden pause) eller "element" (<audio loop>) */
        musikTilstand: function () {
            return {
                fil: D.MUSIK, klar: musikKlar, maade: buffer ? "buffer" : (musik ? "element" : ""),
                spiller: buffer ? !!kilde : (!!musik && musikKlar && !musik.paused),
                sted: buffer ? (kilde ? (lav().currentTime - startTid) % buffer.duration : sted) : (musik ? musik.currentTime : 0),
                laengde: buffer ? buffer.duration : (musik && musik.duration) || 0
            };
        },
        vaek: function () { lav(); if (ctx && ctx.state === "suspended") ctx.resume(); },
        vedAendring: function (f) { lyttere.push(f); }
    };
}());

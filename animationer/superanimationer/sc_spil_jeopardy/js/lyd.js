/* =====================================================================
   lyd.js - de seks lyde

   Aabnes spillet fra harddisken, leder det efter de originale lyde fra
   PowerPoint-skabelonen i C:\NK_Undervisning\Jeopardy-lyde\. De er
   tv-programmets og maa ikke ligge paa hjemmesiden. Findes en lyd ikke,
   spilles spillets egen udgave, som er lavet her i koden (SYNTESE).

   Lydene hentes med <audio>, ikke med fetch, saa det virker paa file://.
   Browseren spiller foerst lyd, naar der er klikket paa siden. Egne lyde,
   der bliver bedt om foer, venter til det foerste klik.

     NK.Lydbank.spil(navn)        starter lyden og giver et haandtag
     NK.Lydbank.stop(navn, fade)  stopper den, evt. med fade i sekunder
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NAVNE = ["tema", "braet", "dobbelt", "tid", "final", "taenk"];
    var MAPPE = "../../../../NK_Undervisning/Jeopardy-lyde/";
    var NOEGLE = "nk-jeopardy-lyd";

    var originale = {};
    var slukket = !!NK.hent(NOEGLE, { slukket: false }).slukket;
    var ctx = null;
    var spiller = {};
    var lyttere = [];

    function kontekst() {
        if (!ctx) {
            var AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            try { ctx = new AC(); } catch (e) { return null; }
        }
        if (ctx.state === "suspended") {
            try { ctx.resume(); } catch (e) { /* venter paa et klik */ }
        }
        return ctx;
    }

    function soegOriginale() {
        if (window.location.protocol !== "file:") return;
        NAVNE.forEach(function (navn) {
            var a = new Audio();
            a.preload = "auto";
            a.addEventListener("canplay", function () {
                if (originale[navn]) return;
                originale[navn] = a;
                lyttere.forEach(function (f) { f(); });
            });
            a.src = MAPPE + navn + ".mp3";
        });
    }

    function Haandtag(navn) {
        this.navn = navn;
        this.blokeret = false;
        this._stop = null;
    }
    Haandtag.prototype.stop = function (fade) {
        if (this._stop) this._stop(fade || 0);
        this._stop = null;
    };

    /* ----- De originale ------------------------------------------------ */
    function spilOriginal(navn, h) {
        var a = originale[navn];
        var gen = (a._gen || 0) + 1;
        a._gen = gen;
        try { a.pause(); a.currentTime = 0; } catch (e) { /* ikke klar */ }
        a.volume = 1;
        var p = a.play();
        if (p && p.then) p.then(null, function () { h.blokeret = true; });
        h._stop = function (fade) {
            if (!fade) { if (a._gen === gen) a.pause(); return; }
            var start = a.volume, t0 = Date.now();
            var iv = setInterval(function () {
                if (a._gen !== gen) { clearInterval(iv); return; }
                var x = (Date.now() - t0) / (fade * 1000);
                if (x >= 1) { clearInterval(iv); a.pause(); a.volume = 1; return; }
                a.volume = Math.max(0, start * (1 - x));
            }, 40);
        };
    }

    /* ----- Spillets egne ------------------------------------------------ */
    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    function tone(c, ud, noder, t, frek, varighed, valg) {
        valg = valg || {};
        var o = c.createOscillator();
        o.type = valg.type || "sine";
        o.frequency.setValueAtTime(frek, t);
        if (valg.glid) o.frequency.exponentialRampToValueAtTime(valg.glid, t + varighed);
        var g = c.createGain();
        var styrke = valg.styrke === undefined ? 0.2 : valg.styrke;
        var anslag = valg.anslag || 0.01;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(styrke, t + anslag);
        if (valg.hold) g.gain.setValueAtTime(styrke, t + valg.hold);
        g.gain.exponentialRampToValueAtTime(0.0001, t + varighed);
        o.connect(g);
        if (valg.filter) {
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.frequency.value = valg.filter;
            g.connect(f);
            f.connect(ud);
        } else {
            g.connect(ud);
        }
        o.start(t);
        o.stop(t + varighed + 0.05);
        noder.push(o);
    }

    function stoej(c, ud, noder, t, varighed, valg) {
        valg = valg || {};
        var n = Math.max(1, Math.floor(c.sampleRate * varighed));
        var buf = c.createBuffer(1, n, c.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, valg.fald || 1);
        var s = c.createBufferSource();
        s.buffer = buf;
        var f = c.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.setValueAtTime(valg.frek || 1500, t);
        if (valg.glid) f.frequency.exponentialRampToValueAtTime(valg.glid, t + varighed);
        f.Q.value = valg.q || 1;
        var g = c.createGain();
        g.gain.value = valg.styrke || 0.3;
        s.connect(f);
        f.connect(g);
        g.connect(ud);
        s.start(t);
        s.stop(t + varighed);
        noder.push(s);
    }

    /* Hver funktion laegger sin lyd ind fra tidspunktet t. */
    var SYNTESE = {
        /* En kort fanfare: brydning op, akkord, IV, V og tilbage. */
        tema: function (c, ud, noder, t) {
            var messing = { type: "sawtooth", styrke: 0.07, filter: 2400, anslag: 0.02 };
            [67, 72, 76, 79].forEach(function (m, i) { tone(c, ud, noder, t + i * 0.13, mtof(m), 0.3, messing); });
            var t1 = t + 0.55;
            [72, 76, 79, 84].forEach(function (m) { tone(c, ud, noder, t1, mtof(m), 1.0, { type: "sawtooth", styrke: 0.05, filter: 2200, anslag: 0.03, hold: 0.7 }); });
            [77, 81, 84].forEach(function (m) { tone(c, ud, noder, t1 + 1.0, mtof(m), 0.36, messing); });
            [79, 83, 86].forEach(function (m) { tone(c, ud, noder, t1 + 1.38, mtof(m), 0.36, messing); });
            [72, 76, 79, 84].forEach(function (m) { tone(c, ud, noder, t1 + 1.78, mtof(m), 1.5, { type: "sawtooth", styrke: 0.055, filter: 2600, anslag: 0.03, hold: 1.0 }); });
            tone(c, ud, noder, t1 + 1.78, mtof(48), 1.5, { type: "triangle", styrke: 0.18, hold: 1.0 });
        },
        /* Felterne popper op: tredive smaa plink i pentatonik. */
        braet: function (c, ud, noder, t) {
            var skala = [72, 74, 76, 79, 81, 84, 86, 88, 91];
            for (var i = 0; i < 30; i++) {
                var ti = t + Math.pow(i / 30, 0.85) * 2.8 + Math.random() * 0.05;
                var m = skala[Math.floor(Math.random() * skala.length)];
                tone(c, ud, noder, ti, mtof(m), 0.2, { type: "sine", styrke: 0.12, anslag: 0.004 });
                tone(c, ud, noder, ti, mtof(m + 12), 0.08, { type: "triangle", styrke: 0.03, anslag: 0.003 });
            }
        },
        /* Et sus op og to klokker. */
        dobbelt: function (c, ud, noder, t) {
            stoej(c, ud, noder, t, 0.9, { frek: 400, glid: 6000, q: 2, styrke: 0.5, fald: 0.3 });
            [91, 95, 100].forEach(function (m, i) { tone(c, ud, noder, t + 0.6 + i * 0.07, mtof(m), 0.25, { type: "triangle", styrke: 0.06 }); });
            tone(c, ud, noder, t + 0.85, mtof(88), 1.3, { type: "triangle", styrke: 0.16 });
            tone(c, ud, noder, t + 0.85, mtof(95), 1.2, { type: "sine", styrke: 0.1 });
        },
        /* Tiden er gaaet: en dyb summer. */
        tid: function (c, ud, noder, t) {
            tone(c, ud, noder, t, 110, 0.7, { type: "sawtooth", styrke: 0.16, filter: 900, anslag: 0.01, hold: 0.55 });
            tone(c, ud, noder, t, 116.5, 0.7, { type: "sawtooth", styrke: 0.12, filter: 900, anslag: 0.01, hold: 0.55 });
        },
        /* Final: en glidetone op og en klokkeakkord. */
        final: function (c, ud, noder, t) {
            tone(c, ud, noder, t, 300, 0.65, { type: "sine", glid: 1200, styrke: 0.08, anslag: 0.2 });
            [76, 83, 88].forEach(function (m) { tone(c, ud, noder, t + 0.55, mtof(m), 1.3, { type: "triangle", styrke: 0.09 }); });
        },
        /* Taenketiden: et ur, der tikker i 30 sekunder, en lille melodi i
           a-mol og en gongong til sidst. */
        taenk: function (c, ud, noder, t) {
            var i;
            for (i = 0; i < 60; i++) {
                stoej(c, ud, noder, t + i * 0.5, 0.035, { frek: i % 2 ? 2200 : 3200, q: 6, styrke: 0.5, fald: 3 });
            }
            var melodi = [69, 72, 76, 74, 72, 69, 67, 69];
            var bas = [45, 41, 48, 43];
            for (i = 0; i < 7; i++) {
                var tf = t + i * 4;
                melodi.forEach(function (m, j) { tone(c, ud, noder, tf + j * 0.5, mtof(m + (i % 2 ? 0 : 12)), 0.45, { type: "sine", styrke: 0.09, anslag: 0.005 }); });
                tone(c, ud, noder, tf, mtof(bas[i % 4]), 1.9, { type: "triangle", styrke: 0.12, anslag: 0.02 });
                tone(c, ud, noder, tf + 2, mtof(bas[(i + 1) % 4]), 1.9, { type: "triangle", styrke: 0.12, anslag: 0.02 });
            }
            tone(c, ud, noder, t + 28, mtof(76), 0.5, { type: "sine", styrke: 0.1 });
            tone(c, ud, noder, t + 28.5, mtof(81), 0.5, { type: "sine", styrke: 0.1 });
            tone(c, ud, noder, t + 29.5, 110, 2.0, { type: "sine", styrke: 0.3, anslag: 0.005 });
            tone(c, ud, noder, t + 29.5, 220, 1.6, { type: "sine", styrke: 0.12, anslag: 0.005 });
            tone(c, ud, noder, t + 29.5, mtof(88), 1.2, { type: "triangle", styrke: 0.08 });
        }
    };

    function spilSyntese(navn, h) {
        var c = kontekst();
        if (!c) return;
        var hoved = c.createGain();
        hoved.gain.value = 0.9;
        hoved.connect(c.destination);
        var noder = [];
        SYNTESE[navn](c, hoved, noder, c.currentTime + 0.03);
        h._stop = function (fade) {
            var nu = c.currentTime, slut = nu + Math.max(0.02, fade || 0);
            hoved.gain.cancelScheduledValues(nu);
            hoved.gain.setValueAtTime(hoved.gain.value, nu);
            hoved.gain.linearRampToValueAtTime(0, slut);
            noder.forEach(function (n) { try { n.stop(slut + 0.05); } catch (e) { /* allerede stoppet */ } });
        };
    }

    var L = NK.Lydbank = {
        NAVNE: NAVNE,
        SYNTESE: SYNTESE,

        spil: function (navn) {
            L.stop(navn);
            var h = new Haandtag(navn);
            if (slukket || NAVNE.indexOf(navn) < 0) return h;
            if (originale[navn]) spilOriginal(navn, h);
            else spilSyntese(navn, h);
            spiller[navn] = h;
            return h;
        },

        stop: function (navn, fade) {
            var h = spiller[navn];
            if (h) h.stop(fade);
            delete spiller[navn];
        },

        stopAlle: function (fade) {
            Object.keys(spiller).forEach(function (n) { L.stop(n, fade); });
        },

        /* "originale", naar mindst én original er fundet, ellers "egne" */
        kilde: function () { return Object.keys(originale).length ? "originale" : "egne"; },
        original: function (navn) { return !!originale[navn]; },

        slukket: function () { return slukket; },
        saetSlukket: function (s) {
            slukket = !!s;
            NK.gem(NOEGLE, { slukket: slukket });
            if (slukket) L.stopAlle(0.2);
        },

        /* Kaldes ved foerste klik eller tastetryk, saa lyden maa spille. */
        laas: function () { kontekst(); },

        vedAendring: function (f) { lyttere.push(f); }
    };

    soegOriginale();
}());

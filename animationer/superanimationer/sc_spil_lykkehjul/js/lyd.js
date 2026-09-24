/* =====================================================================
   lyd.js - de ti lyde

   Aabnes spillet fra harddisken, leder det efter de originale lyde fra
   PowerPoint-skabelonen i C:\NK_Undervisning\Lykkehjul-lyde\. De er
   tv-programmets og maa ikke ligge paa hjemmesiden. Findes en lyd ikke,
   spilles spillets egen udgave, som er lavet her i koden (SYNTESE).

   Lydene hentes med <audio>, ikke med fetch, saa det virker paa file://.
   Browseren spiller foerst lyd, naar der er klikket paa siden.

     NK.Lydbank.spil(navn)          starter lyden og giver et haandtag
     NK.Lydbank.stop(navn, fade)    stopper den, evt. med fade i sekunder
     NK.Lydbank.pause(navn)         pauser toss-up-musikken
     NK.Lydbank.fortsaet(navn)      spiller videre
     NK.Lydbank.tik(styrke)         et klik fra hjulets pinde (egne lyde)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var NAVNE = ["tema", "kategori", "tossup", "tossuploest", "bogstav", "forkert", "loest", "fallit", "ur", "hjul"];
    /* Korte lyde, der maa lyde oven i hinanden */
    var OVERLAP = { bogstav: true };
    var MAPPE = "../../../../NK_Undervisning/Lykkehjul-lyde/";
    var NOEGLE = "nk-lykkehjul-lyd";

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
            a.addEventListener("canplaythrough", function () {
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
        this._pause = null;
        this._fortsaet = null;
    }
    Haandtag.prototype.stop = function (fade) {
        if (this._stop) this._stop(fade || 0);
        this._stop = null;
    };

    /* ----- De originale ------------------------------------------------ */
    function spilOriginal(navn, h) {
        var a = originale[navn];
        if (OVERLAP[navn]) a = a.cloneNode(true);
        var gen = (a._gen || 0) + 1;
        a._gen = gen;
        try { a.pause(); a.currentTime = 0; } catch (e) { /* ikke klar */ }
        a.volume = 1;
        var p = a.play();
        if (p && p.then) p.then(null, function () { h.blokeret = true; });
        h._pause = function () { if (a._gen === gen) a.pause(); };
        h._fortsaet = function () { if (a._gen === gen) { var q = a.play(); if (q && q.then) q.then(null, function () {}); } };
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
        if (valg.vibrato) {
            var lfo = c.createOscillator(), dybde = c.createGain();
            lfo.frequency.value = valg.vibrato;
            dybde.gain.value = frek * 0.03;
            lfo.connect(dybde);
            dybde.connect(o.frequency);
            lfo.start(t);
            lfo.stop(t + varighed + 0.05);
            noder.push(lfo);
        }
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

    function klokke(c, ud, noder, t, m, styrke) {
        tone(c, ud, noder, t, mtof(m), 0.9, { type: "sine", styrke: styrke, anslag: 0.004 });
        tone(c, ud, noder, t, mtof(m + 12), 0.5, { type: "sine", styrke: styrke * 0.35, anslag: 0.003 });
        tone(c, ud, noder, t, mtof(m + 19), 0.25, { type: "triangle", styrke: styrke * 0.12, anslag: 0.002 });
    }

    /* Hver funktion laegger sin lyd ind fra tidspunktet t. */
    var SYNTESE = {
        /* Et glad kendingsmotiv: en rulle op og en dur-kadence */
        tema: function (c, ud, noder, t) {
            var messing = { type: "sawtooth", styrke: 0.06, filter: 2600, anslag: 0.02 };
            [60, 64, 67, 72, 76, 79].forEach(function (m, i) { tone(c, ud, noder, t + i * 0.08, mtof(m), 0.25, messing); });
            var t1 = t + 0.6;
            var akkorder = [[72, 76, 79], [74, 77, 81], [72, 76, 79, 84], [71, 74, 79], [72, 76, 79, 84]];
            var laengde = [0.45, 0.45, 0.7, 0.45, 1.6];
            var tt = t1;
            akkorder.forEach(function (a, i) {
                a.forEach(function (m) { tone(c, ud, noder, tt, mtof(m), laengde[i], { type: "sawtooth", styrke: 0.045, filter: 2400, anslag: 0.02, hold: laengde[i] * 0.7 }); });
                tone(c, ud, noder, tt, mtof(a[0] - 24), laengde[i], { type: "triangle", styrke: 0.16, hold: laengde[i] * 0.6 });
                tt += laengde[i];
            });
            for (var i = 0; i < 8; i++) klokke(c, ud, noder, tt - 1.4 + i * 0.09, 84 + [0, 4, 7, 12, 7, 12, 16, 19][i], 0.05);
        },
        /* Tavlen taender: tre stigende klokker */
        kategori: function (c, ud, noder, t) {
            [79, 84, 88].forEach(function (m, i) { klokke(c, ud, noder, t + i * 0.13, m, 0.12); });
            stoej(c, ud, noder, t, 0.5, { frek: 2500, glid: 7000, q: 1.5, styrke: 0.12, fald: 1.5 });
        },
        /* Toss-up: et hoppende motiv i 40 sekunder */
        tossup: function (c, ud, noder, t) {
            var bas = [48, 48, 55, 55, 53, 53, 55, 55];
            var melodi = [72, 76, 79, 76, 77, 81, 79, 76, 72, 76, 79, 84, 83, 79, 77, 74];
            for (var takt = 0; takt < 20; takt++) {
                var tt = t + takt * 2;
                for (var i = 0; i < 8; i++) {
                    tone(c, ud, noder, tt + i * 0.25, mtof(bas[i] + (takt % 4 === 3 ? 2 : 0)), 0.2, { type: "triangle", styrke: 0.14, anslag: 0.005 });
                    stoej(c, ud, noder, tt + i * 0.25 + 0.125, 0.03, { frek: 7000, q: 2, styrke: 0.12, fald: 3 });
                }
                for (var j = 0; j < 8; j++) {
                    var m = melodi[(takt % 2) * 8 + j];
                    tone(c, ud, noder, tt + j * 0.25, mtof(m), 0.18, { type: "square", styrke: 0.03, filter: 3000, anslag: 0.005 });
                }
            }
        },
        /* Toss-up loest: en kort fanfare */
        tossuploest: function (c, ud, noder, t) {
            [[72, 0], [76, 0.1], [79, 0.2], [84, 0.3]].forEach(function (p) {
                tone(c, ud, noder, t + p[1], mtof(p[0]), 0.35, { type: "sawtooth", styrke: 0.06, filter: 2600 });
            });
            [72, 76, 79, 84].forEach(function (m) { tone(c, ud, noder, t + 0.45, mtof(m), 1.4, { type: "sawtooth", styrke: 0.045, filter: 2600, hold: 0.9 }); });
            tone(c, ud, noder, t + 0.45, mtof(48), 1.4, { type: "triangle", styrke: 0.18, hold: 0.9 });
        },
        /* Et felt lyser op: en klar ding */
        bogstav: function (c, ud, noder, t) {
            klokke(c, ud, noder, t, 88, 0.16);
        },
        /* Forkert: en kort summer */
        forkert: function (c, ud, noder, t) {
            tone(c, ud, noder, t, 98, 0.45, { type: "sawtooth", styrke: 0.16, filter: 700, anslag: 0.01, hold: 0.35 });
            tone(c, ud, noder, t, 103.8, 0.45, { type: "sawtooth", styrke: 0.13, filter: 700, anslag: 0.01, hold: 0.35 });
        },
        /* Gaaden er loest: klokkespil op og en akkord */
        loest: function (c, ud, noder, t) {
            [72, 76, 79, 84, 88, 91, 96].forEach(function (m, i) { klokke(c, ud, noder, t + i * 0.07, m, 0.09); });
            [72, 76, 79, 84].forEach(function (m) { tone(c, ud, noder, t + 0.55, mtof(m), 1.5, { type: "sawtooth", styrke: 0.04, filter: 2800, hold: 1.0 }); });
            tone(c, ud, noder, t + 0.55, mtof(48), 1.5, { type: "triangle", styrke: 0.16, hold: 1.0 });
        },
        /* Fallit: den triste basun */
        fallit: function (c, ud, noder, t) {
            var toner = [[67, 0, 0.45], [66, 0.5, 0.45], [65, 1.0, 0.45], [64, 1.5, 1.3]];
            toner.forEach(function (p, i) {
                tone(c, ud, noder, t + p[1], mtof(p[0] - 12), p[2], { type: "sawtooth", styrke: 0.12, filter: 1100, anslag: 0.04, hold: p[2] * 0.7, vibrato: i === 3 ? 6 : 0 });
            });
        },
        /* Finalens ur: ti sekunder tik og en gong */
        ur: function (c, ud, noder, t) {
            for (var i = 0; i < 20; i++) {
                stoej(c, ud, noder, t + i * 0.5, 0.035, { frek: i % 2 ? 2200 : 3200, q: 6, styrke: 0.5, fald: 3 });
                if (i >= 14 && i % 2 === 0) tone(c, ud, noder, t + i * 0.5, mtof(81), 0.15, { type: "sine", styrke: 0.08 });
            }
            tone(c, ud, noder, t + 10, 110, 1.6, { type: "sawtooth", styrke: 0.12, filter: 800, hold: 0.9 });
        },
        /* Hjulet: klikkene kommer fra hjulets pinde (tik), saa her er kun et sus */
        hjul: function (c, ud, noder, t) {
            stoej(c, ud, noder, t, 0.6, { frek: 500, glid: 2500, q: 1, styrke: 0.15, fald: 1 });
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
        /* Egne lyde kan ikke pauses: de stoppes og begynder forfra */
        h._pause = function () { h.stop(0.1); };
        h._fortsaet = function () { spilSyntese(navn, h); };
    }

    var L = NK.Lydbank = {
        NAVNE: NAVNE,
        SYNTESE: SYNTESE,

        spil: function (navn) {
            if (!OVERLAP[navn]) L.stop(navn);
            var h = new Haandtag(navn);
            if (slukket || NAVNE.indexOf(navn) < 0) return h;
            if (originale[navn]) spilOriginal(navn, h);
            else spilSyntese(navn, h);
            if (!OVERLAP[navn]) spiller[navn] = h;
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

        pause: function (navn) {
            var h = spiller[navn];
            if (h && h._pause) h._pause();
        },

        fortsaet: function (navn) {
            var h = spiller[navn];
            if (slukket) return;
            if (h && h._fortsaet) h._fortsaet();
            else L.spil(navn);
        },

        /* Et klik, naar en pind paa hjulet passerer viseren. Kun med
           spillets egne lyde; den originale hjullyd har sine egne klik. */
        tik: function (styrke) {
            if (slukket || originale.hjul) return;
            var c = kontekst();
            if (!c || c.state !== "running") return;
            var t = c.currentTime;
            var n = Math.floor(c.sampleRate * 0.025);
            var buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
            for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 4);
            var s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
            s.buffer = buf;
            f.type = "bandpass";
            f.frequency.value = 2600 + Math.random() * 500;
            f.Q.value = 3;
            g.gain.value = 0.25 + 0.35 * NK.klamp(styrke === undefined ? 1 : styrke, 0, 1);
            s.connect(f);
            f.connect(g);
            g.connect(c.destination);
            s.start(t);
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

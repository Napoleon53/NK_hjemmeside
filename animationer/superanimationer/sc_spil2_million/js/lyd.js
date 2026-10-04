/* =====================================================================
   lyd.js - lydene og baggrundsmusikken

   Alle lyde er lavet her i koden med Web Audio (SYNTESE). Der er ingen
   lyd fra tv-programmet: musikken derfra er beskyttet af ophavsret og
   maa ikke ligge paa hjemmesiden.

   Under et spoergsmaal spiller en baggrund:
     - Ligger musik1.mp3, musik2.mp3 eller musik3.mp3 i spillets mappe
       (D.MUSIK), spilles filen i loekke.
     - Ellers spiller spillets egen baggrund: en dyb tone og et
       hjerteslag. Tonen stiger en halv tone for hvert spoergsmaal, og
       hjerteslaget bliver hurtigere for hvert trin.

   Fra harddisken (file://) spilles filerne med <audio>, fordi fetch ikke
   virker der. Browseren spiller foerst lyd, naar der er klikket paa siden.

     NK.Spillyd.spil(navn, data)  en lyd; giver et haandtag med stop(fade)
     NK.Spillyd.seng(trin, nr)    baggrunden til spoergsmaal nr; null stopper
     NK.Spillyd.daemp(faktor)     skruer baggrunden ned (0 til 1)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var NOEGLE = "nk-million-lyd";

    var ctx = null;
    var til = NK.hent(NOEGLE, true) !== false;
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

    function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

    /* ----- Byggeklodserne ---------------------------------------------- */
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

    /* Et hjerteslag: et dybt dunk og et kort klik, saa det ogsaa kan
       hoeres i en baerbars hoejttalere. */
    function slag(c, ud, noder, t, styrke) {
        tone(c, ud, noder, t, 92, 0.2, { type: "sine", glid: 46, styrke: styrke, anslag: 0.006 });
        tone(c, ud, noder, t, 184, 0.07, { type: "triangle", glid: 90, styrke: styrke * 0.35, anslag: 0.003 });
    }

    /* ----- Lydene ------------------------------------------------------ */
    /* Hver funktion laegger sin lyd ind fra tidspunktet t. */
    var MESSING = { type: "sawtooth", styrke: 0.06, filter: 2200, anslag: 0.02 };

    var SYNTESE = {
        /* Et svar kommer frem. data er svarets nummer (0 til 3). */
        afsloer: function (c, ud, noder, t, nr) {
            var m = 74 + 2 * (nr || 0);
            tone(c, ud, noder, t, mtof(m), 0.11, { type: "sine", styrke: 0.09, anslag: 0.004 });
            tone(c, ud, noder, t, mtof(m + 12), 0.05, { type: "triangle", styrke: 0.03, anslag: 0.003 });
        },

        vaelg: function (c, ud, noder, t) {
            tone(c, ud, noder, t, 392, 0.07, { type: "triangle", styrke: 0.1, anslag: 0.004 });
            tone(c, ud, noder, t + 0.045, 587, 0.09, { type: "triangle", styrke: 0.08, anslag: 0.004 });
        },

        /* Spillet begynder: fire toner op og en akkord i d-mol */
        start: function (c, ud, noder, t) {
            [50, 57, 62, 65].forEach(function (m, i) { tone(c, ud, noder, t + i * 0.14, mtof(m), 0.3, MESSING); });
            [50, 62, 65, 69, 74].forEach(function (m) {
                tone(c, ud, noder, t + 0.6, mtof(m), 1.4, { type: "sawtooth", styrke: 0.045, filter: 2000, anslag: 0.03, hold: 0.8 });
            });
            slag(c, ud, noder, t + 0.6, 0.4);
            stoej(c, ud, noder, t + 0.6, 0.9, { frek: 5000, q: 0.7, styrke: 0.06, fald: 2 });
        },

        /* Svaret laases: et dybt slag */
        laas: function (c, ud, noder, t) {
            slag(c, ud, noder, t, 0.5);
            tone(c, ud, noder, t, 110, 0.9, { type: "sine", glid: 40, styrke: 0.3, anslag: 0.01 });
            stoej(c, ud, noder, t, 0.5, { frek: 300, q: 0.8, styrke: 0.25, fald: 2 });
        },

        /* Ventetiden, foer svaret afsloeres: strygere, der aabner sig, og
           et hjerteslag, der bliver hurtigere. data er varigheden i sekunder. */
        spaending: function (c, ud, noder, t, sek) {
            sek = Math.max(0.3, sek || 2);
            var f = c.createBiquadFilter();
            f.type = "lowpass";
            f.Q.value = 2;
            f.frequency.setValueAtTime(260, t);
            f.frequency.exponentialRampToValueAtTime(2200, t + sek);
            var tremolo = c.createGain();
            tremolo.gain.value = 0.7;
            var lfo = c.createOscillator();
            lfo.frequency.setValueAtTime(7, t);
            lfo.frequency.linearRampToValueAtTime(13, t + sek);
            var lfoStyrke = c.createGain();
            lfoStyrke.gain.value = 0.3;
            lfo.connect(lfoStyrke);
            lfoStyrke.connect(tremolo.gain);
            var g = c.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(0.09, t + sek);
            [48, 55, 60, 63].forEach(function (m, i) {
                var o = c.createOscillator();
                o.type = "sawtooth";
                o.frequency.setValueAtTime(mtof(m), t);
                o.detune.value = i % 2 ? 7 : -7;
                o.connect(f);
                o.start(t);
                o.stop(t + sek + 0.3);
                noder.push(o);
            });
            f.connect(tremolo);
            tremolo.connect(g);
            g.connect(ud);
            lfo.start(t);
            lfo.stop(t + sek + 0.3);
            noder.push(lfo);

            var ti = t, mellem = 0.62;
            while (ti < t + sek - 0.1) {
                slag(c, ud, noder, ti, 0.26);
                ti += mellem;
                mellem = Math.max(0.26, mellem * 0.86);
            }
            tone(c, ud, noder, t, 330, sek, { type: "sine", glid: 990, styrke: 0.03, anslag: sek * 0.8 });
        },

        /* Rigtigt svar: D-dur brudt op og holdt */
        rigtigt: function (c, ud, noder, t) {
            [62, 66, 69, 74].forEach(function (m, i) {
                tone(c, ud, noder, t + i * 0.07, mtof(m), 0.25, { type: "sawtooth", styrke: 0.06, filter: 2600, anslag: 0.01 });
            });
            [62, 66, 69, 74, 78].forEach(function (m) {
                tone(c, ud, noder, t + 0.3, mtof(m), 1.1, { type: "sawtooth", styrke: 0.04, filter: 2600, anslag: 0.02, hold: 0.6 });
            });
            [86, 90, 93].forEach(function (m, i) {
                tone(c, ud, noder, t + 0.35 + i * 0.08, mtof(m), 0.5, { type: "sine", styrke: 0.04, anslag: 0.005 });
            });
            slag(c, ud, noder, t + 0.3, 0.35);
        },

        /* Forkert svar: to toner en halv tone fra hinanden, der falder */
        forkert: function (c, ud, noder, t) {
            tone(c, ud, noder, t, mtof(50), 1.2, { type: "sawtooth", glid: mtof(44), styrke: 0.1, filter: 700, anslag: 0.02, hold: 0.5 });
            tone(c, ud, noder, t, mtof(51), 1.2, { type: "sawtooth", glid: mtof(45), styrke: 0.08, filter: 700, anslag: 0.02, hold: 0.5 });
            tone(c, ud, noder, t, 70, 1.0, { type: "sine", glid: 35, styrke: 0.25, anslag: 0.01 });
            slag(c, ud, noder, t, 0.5);
        },

        /* Naar der er musik fra filer, er udfaldet kun en lille klokke eller et
           blødt dunk, saa lyden ikke slaas med musikken */
        rigtigtBloed: function (c, ud, noder, t) {
            tone(c, ud, noder, t, mtof(91), 0.5, { type: "sine", styrke: 0.06, anslag: 0.005 });
            tone(c, ud, noder, t + 0.09, mtof(98), 0.7, { type: "sine", styrke: 0.05, anslag: 0.005 });
        },

        forkertBloed: function (c, ud, noder, t) {
            tone(c, ud, noder, t, 110, 0.5, { type: "sine", glid: 55, styrke: 0.16, anslag: 0.01 });
        },

        /* En livline: et sus op og to klokker */
        livline: function (c, ud, noder, t) {
            stoej(c, ud, noder, t, 0.4, { frek: 500, glid: 4500, q: 2.5, styrke: 0.35, fald: 0.4 });
            tone(c, ud, noder, t + 0.28, mtof(81), 0.12, { type: "triangle", styrke: 0.08, anslag: 0.004 });
            tone(c, ud, noder, t + 0.36, mtof(88), 0.22, { type: "triangle", styrke: 0.08, anslag: 0.004 });
        },

        /* Et sikkert beloeb: fire klokker. Kommer lige efter "rigtigt". */
        sikret: function (c, ud, noder, t) {
            [81, 86, 90, 93].forEach(function (m, i) {
                tone(c, ud, noder, t + 0.75 + i * 0.09, mtof(m), 0.6, { type: "triangle", styrke: 0.07, anslag: 0.004 });
                tone(c, ud, noder, t + 0.75 + i * 0.09, mtof(m + 12), 0.3, { type: "sine", styrke: 0.025, anslag: 0.004 });
            });
        },

        /* Eleven stopper: to rolige akkorder */
        stop: function (c, ud, noder, t) {
            [57, 62, 66].forEach(function (m) { tone(c, ud, noder, t, mtof(m), 0.9, { type: "triangle", styrke: 0.07, anslag: 0.02 }); });
            [62, 66, 69, 74].forEach(function (m) { tone(c, ud, noder, t + 0.45, mtof(m), 1.4, { type: "triangle", styrke: 0.06, anslag: 0.02 }); });
        },

        /* Millionen: en fanfare i D-dur med G, A og D til sidst */
        vundet: function (c, ud, noder, t) {
            [62, 66, 69, 74, 78, 81, 86].forEach(function (m, i) {
                tone(c, ud, noder, t + i * 0.09, mtof(m), 0.3, { type: "sawtooth", styrke: 0.05, filter: 2800, anslag: 0.01 });
            });
            var t1 = t + 0.75;
            function akkord(noderne, start, varighed, hold) {
                noderne.forEach(function (m) {
                    tone(c, ud, noder, start, mtof(m), varighed, { type: "sawtooth", styrke: 0.038, filter: 2600, anslag: 0.03, hold: hold });
                });
            }
            akkord([50, 62, 66, 69, 74, 78], t1, 1.1, 0.8);
            akkord([55, 59, 62, 67, 71], t1 + 1.0, 0.55, 0.4);
            akkord([57, 61, 64, 69, 73], t1 + 1.5, 0.55, 0.4);
            akkord([50, 62, 66, 69, 74, 78, 81], t1 + 2.0, 2.4, 1.5);
            tone(c, ud, noder, t1, mtof(38), 1.0, { type: "triangle", styrke: 0.18, anslag: 0.02, hold: 0.7 });
            tone(c, ud, noder, t1 + 2.0, mtof(38), 2.4, { type: "triangle", styrke: 0.18, anslag: 0.02, hold: 1.5 });
            slag(c, ud, noder, t1, 0.45);
            slag(c, ud, noder, t1 + 2.0, 0.45);
            stoej(c, ud, noder, t1, 1.6, { frek: 7000, q: 0.5, styrke: 0.08, fald: 1.5 });
            stoej(c, ud, noder, t1 + 2.0, 1.8, { frek: 7000, q: 0.5, styrke: 0.08, fald: 1.5 });
            var skala = [86, 88, 90, 93, 95, 98];
            for (var i = 0; i < 24; i++) {
                tone(c, ud, noder, t + 0.8 + Math.random() * 3.4, mtof(skala[Math.floor(Math.random() * skala.length)]), 0.22,
                    { type: i % 2 ? "sine" : "triangle", styrke: 0.035, anslag: 0.004 });
            }
        }
    };

    /* ----- Spillets egen baggrund --------------------------------------- */
    var SLAG = [1.15, 1.0, 0.86];   /* sekunder mellem hjerteslagene, pr. trin */
    var SENG_STYRKE = 0.65;
    var GRUNDTONE = 38;             /* D2 ved spoergsmaal 1 */

    /* Bygger baggrunden og giver haandtag til at stemme og stoppe den.
       Selvtesten bygger den ogsaa i en OfflineAudioContext. */
    function byggSeng(c, ud) {
        var hoved = c.createGain();
        hoved.gain.value = 0.0001;
        hoved.connect(ud);

        var filter = c.createBiquadFilter();
        filter.type = "lowpass";
        filter.Q.value = 0.8;
        var drone = c.createGain();
        drone.gain.value = 0.16;
        filter.connect(drone);
        drone.connect(hoved);

        var o1 = c.createOscillator(), o2 = c.createOscillator(), o3 = c.createOscillator();
        o1.type = "sawtooth";
        o2.type = "sawtooth";
        o2.detune.value = 9;
        o3.type = "triangle";
        var kvint = c.createGain();
        kvint.gain.value = 0.5;
        o1.connect(filter);
        o2.connect(filter);
        o3.connect(kvint);
        kvint.connect(filter);

        /* Filteret aander langsomt */
        var lfo = c.createOscillator();
        lfo.frequency.value = 0.13;
        var lfoStyrke = c.createGain();
        lfo.connect(lfoStyrke);
        lfoStyrke.connect(filter.frequency);

        /* En svag, hoej tone: lille terts to oktaver over grundtonen */
        var top = c.createOscillator();
        top.type = "triangle";
        var topStyrke = c.createGain();
        topStyrke.gain.value = 0.014;
        top.connect(topStyrke);
        topStyrke.connect(hoved);

        var alle = [o1, o2, o3, lfo, top];
        alle.forEach(function (o) { o.start(); });

        return {
            hoved: hoved,
            trin: 0,
            stem: function (nr, t) {
                var f = mtof(GRUNDTONE + nr);
                o1.frequency.setTargetAtTime(f, t, 0.25);
                o2.frequency.setTargetAtTime(f, t, 0.25);
                o3.frequency.setTargetAtTime(f * 1.5, t, 0.25);
                top.frequency.setTargetAtTime(mtof(GRUNDTONE + nr + 27), t, 0.25);
                filter.frequency.setTargetAtTime(f * 5, t, 0.25);
                lfoStyrke.gain.setTargetAtTime(f * 1.2, t, 0.25);
            },
            stop: function () {
                alle.forEach(function (o) { try { o.stop(); } catch (e) { /* allerede stoppet */ } });
                try { hoved.disconnect(); } catch (e) { /* ikke koblet */ }
            }
        };
    }

    var seng = null, slagUr = null, naesteSlag = 0;
    var oensket = null;     /* { trin, nr }, naar baggrunden skal spille */
    var daemp = 1;

    function planlaeg() {
        if (!seng || !ctx) return;
        var mellem = SLAG[seng.trin] || 1;
        if (naesteSlag < ctx.currentTime) naesteSlag = ctx.currentTime + 0.05;
        while (naesteSlag < ctx.currentTime + 0.35) {
            slag(ctx, seng.hoved, [], naesteSlag, 0.3);
            slag(ctx, seng.hoved, [], naesteSlag + mellem * 0.27, 0.16);
            stoej(ctx, seng.hoved, [], naesteSlag + mellem * 0.5, 0.03, { frek: 5200, q: 5, styrke: 0.12, fald: 3 });
            naesteSlag += mellem;
        }
    }

    function startSeng(trin, nr) {
        var c = kontekst();
        if (!c) return;
        var fraStille = !seng || !!seng.doer;
        if (!seng) {
            seng = byggSeng(c, c.destination);
            naesteSlag = c.currentTime + 0.4;
            slagUr = setInterval(planlaeg, 100);
        }
        if (seng.doer) { clearTimeout(seng.doer); seng.doer = null; }
        seng.trin = trin;
        seng.stem(nr, c.currentTime);
        var g = seng.hoved.gain, nu = c.currentTime;
        g.cancelScheduledValues(nu);
        g.setValueAtTime(Math.max(0.0001, g.value), nu);
        g.linearRampToValueAtTime(Math.max(0.0001, SENG_STYRKE * daemp), nu + (fraStille ? 0.9 : 0.35));
    }

    function stopSeng(fade) {
        if (!seng || seng.doer || !ctx) return;
        var s = seng, nu = ctx.currentTime;
        s.hoved.gain.cancelScheduledValues(nu);
        s.hoved.gain.setValueAtTime(Math.max(0.0001, s.hoved.gain.value), nu);
        s.hoved.gain.linearRampToValueAtTime(0.0001, nu + fade);
        s.doer = setTimeout(function () {
            s.stop();
            if (seng === s) {
                seng = null;
                clearInterval(slagUr);
                slagUr = null;
            }
        }, fade * 1000 + 80);
    }

    /* ----- Musik fra filer ---------------------------------------------- */
    /* Filerne er klippet til loekker (se README). Fra en server hentes filen
       ind som en lydbuffer og gentages uden pause. Fra harddisken kan filen
       ikke hentes med fetch; der bruges <audio loop>, som laver et lille hak,
       hver gang filen begynder forfra. */
    var SPOR = [];
    var musikHentet = false;
    var ur = null;

    function meldKlar(s) {
        if (s.klar) return;
        s.klar = true;
        s.afgjort = true;
        opdaterBund();
        lyttere.forEach(function (f) { f(til); });
    }

    /* Filen findes ikke */
    function meldMangler(s) {
        s.afgjort = true;
        opdaterBund();
    }

    /* Ved vi, om der er musikfiler? Indtil da spilles hverken fanfaren ved
       start eller spillets egen baggrund, saa de ikke ligger oven i musikken,
       naar den kommer et oejeblik efter. */
    function musikAfgjort() {
        return musikHentet && SPOR.every(function (s) { return s.afgjort; });
    }

    function Spor(src) {
        var self = this;
        this.src = src;
        this.klar = false;
        this.afgjort = false;
        this.spiller = false;
        this.niveau = 0;
        this.buffer = null;     /* lydbufferen, naar filen er hentet med fetch */
        this.kilde = null;      /* den afspiller, der koerer nu */
        this.styrke = null;     /* dens styrkeknap */
        this.sted = 0;          /* hvor i filen musikken er naaet til (s) */
        this.startet = 0;       /* kontekstens tid, da stedet var 0 */
        this.lyd = null;        /* <audio>, naar filen ikke kan hentes med fetch */

        if (window.location.protocol !== "file:" && window.fetch && kontekst()) {
            window.fetch(src).then(function (r) {
                if (!r.ok) throw new Error("ingen fil");
                return r.arrayBuffer();
            }).then(function (data) {
                return new Promise(function (ok, fejl) { ctx.decodeAudioData(data, ok, fejl); });
            }).then(function (buffer) {
                self.buffer = buffer;
                meldKlar(self);
            }).catch(function () { meldMangler(self); });
        } else {
            var x = this.lyd = new window.Audio();
            x.preload = "auto";
            x.loop = true;
            x.volume = 0;
            x._maal = 0;
            x._fart = 1;
            x.addEventListener("canplaythrough", function () { meldKlar(self); });
            x.addEventListener("error", function () { self.klar = false; meldMangler(self); });
            x.src = src;
        }
    }

    /* Ind paa 2,5 s. Skrues der op eller ned undervejs, tager det 0,35 s. */
    Spor.prototype.start = function (niveau) {
        var fraStille = !this.spiller;
        this.niveau = niveau;
        this.spiller = true;
        if (this.buffer) {
            var nu = ctx.currentTime;
            if (fraStille) {
                var g = ctx.createGain();
                g.gain.setValueAtTime(0.0001, nu);
                g.connect(ctx.destination);
                var k = ctx.createBufferSource();
                k.buffer = this.buffer;
                k.loop = true;
                k.connect(g);
                k.start(nu, this.sted % this.buffer.duration);
                this.startet = nu - this.sted;
                this.kilde = k;
                this.styrke = g;
            }
            var p = this.styrke.gain;
            p.cancelScheduledValues(nu);
            p.setValueAtTime(Math.max(0.0001, p.value), nu);
            p.linearRampToValueAtTime(Math.max(0.0001, niveau), nu + (fraStille ? 2.5 : 0.35));
            return;
        }
        var x = this.lyd;
        if (fraStille) {
            var loefte = x.play();
            if (loefte && loefte.then) loefte.then(null, function () { /* venter paa et klik */ });
        }
        x._maal = niveau;
        x._fart = Math.max(0.05, Math.abs(niveau - x.volume)) / (fraStille ? 2.5 : 0.35);
        startUr();
    };

    /* Musikken holder pause og fortsaetter senere, hvor den slap */
    Spor.prototype.stop = function (fade) {
        if (!this.spiller) return;
        this.spiller = false;
        if (this.buffer) {
            var nu = ctx.currentTime, k = this.kilde, g = this.styrke;
            this.sted = (nu + fade - this.startet) % this.buffer.duration;
            g.gain.cancelScheduledValues(nu);
            g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), nu);
            g.gain.linearRampToValueAtTime(0.0001, nu + fade);
            try { k.stop(nu + fade + 0.05); } catch (e) { /* allerede stoppet */ }
            k.onended = function () { try { g.disconnect(); } catch (e) { /* ikke koblet */ } };
            this.kilde = null;
            this.styrke = null;
            return;
        }
        this.lyd._maal = 0;
        this.lyd._fart = 1 / Math.max(0.05, fade);
        startUr();
    };

    /* Kun <audio>: styrken glider mod maalet, og ved 0 holder filen pause */
    Spor.prototype.tik = function (dt) {
        var x = this.lyd;
        if (!x) return false;
        var d = x._maal - x.volume;
        if (Math.abs(d) > 0.001) {
            var skridt = Math.min(Math.abs(d), x._fart * dt);
            x.volume = NK.klamp(x.volume + (d > 0 ? skridt : -skridt), 0, 1);
            return true;
        }
        if (!this.spiller && !x.paused) x.pause();
        return false;
    };

    Spor.prototype.tilstand = function () {
        if (this.buffer) {
            return { buffer: true, spiller: this.spiller, pause: !this.spiller,
                tid: this.spiller ? (ctx.currentTime - this.startet) % this.buffer.duration : this.sted,
                styrke: this.styrke ? this.styrke.gain.value : 0, laengde: this.buffer.duration };
        }
        var x = this.lyd;
        if (!x) return { buffer: false, spiller: false, pause: true, tid: 0, styrke: 0, laengde: 0 };
        return { buffer: false, spiller: this.spiller, pause: x.paused, tid: x.currentTime, styrke: x.volume, laengde: x.duration };
    };

    function startUr() {
        if (ur) return;
        ur = setInterval(function () {
            var iGang = false;
            SPOR.forEach(function (s) { if (s.tik(0.05)) iGang = true; });
            if (!iGang) {
                clearInterval(ur);
                ur = null;
            }
        }, 50);
    }

    function hentMusik() {
        if (musikHentet || typeof window.Audio !== "function") return;
        musikHentet = true;
        D.MUSIK.filer.forEach(function (fil, i) { SPOR[i] = new Spor(fil); });
    }

    /* Filen til trinnet, eller den naermeste med lavere nummer */
    function sporFor(trin) {
        for (var i = Math.min(trin, SPOR.length - 1); i >= 0; i--) {
            if (SPOR[i] && SPOR[i].klar) return SPOR[i];
        }
        return null;
    }

    function opdaterBund() {
        var o = til ? oensket : null;
        var spor = o ? sporFor(o.trin) : null;
        SPOR.forEach(function (s) { if (s !== spor) s.stop(0.8); });
        if (spor) {
            stopSeng(0.5);
            spor.start(NK.klamp(D.MUSIK.styrke, 0, 1) * daemp);
        } else if (o) {
            if (musikAfgjort()) startSeng(o.trin, o.nr);
        } else {
            stopSeng(0.5);
        }
    }

    /* Er der fundet mindst én musikfil? Saa spiller musikken hele spillet
       igennem, og lydene traeder tilbage (brugerens oenske 4. okt. 2026). */
    function harMusik() {
        return SPOR.some(function (s) { return s.klar; });
    }

    /* null = lyden spilles ikke, naar der er musik; et navn = den bloede udgave */
    var MED_MUSIK = { start: null, spaending: null, sikret: null, rigtigt: "rigtigtBloed", forkert: "forkertBloed" };

    /* ----- Det, spillet bruger ------------------------------------------ */
    NK.Spillyd = {
        SYNTESE: SYNTESE,
        byggSeng: byggSeng,
        slag: slag,

        spil: function (navn, data) {
            var h = { stop: function () {} };
            var styrke = 0.9;
            if (navn === "start" && !musikAfgjort()) return h;
            if (harMusik()) {
                if (MED_MUSIK[navn] === null) return h;
                if (MED_MUSIK[navn]) navn = MED_MUSIK[navn];
                styrke = 0.45;
            }
            if (!til || !SYNTESE[navn]) return h;
            var c = kontekst();
            if (!c) return h;
            var hoved = c.createGain();
            hoved.gain.value = styrke;
            hoved.connect(c.destination);
            var noder = [];
            try { SYNTESE[navn](c, hoved, noder, c.currentTime + 0.02, data); } catch (e) { return h; }
            h.stop = function (fade) {
                var nu = c.currentTime, slut = nu + Math.max(0.02, fade || 0);
                hoved.gain.cancelScheduledValues(nu);
                hoved.gain.setValueAtTime(hoved.gain.value, nu);
                hoved.gain.linearRampToValueAtTime(0, slut);
                noder.forEach(function (n) { try { n.stop(slut + 0.05); } catch (e) { /* allerede stoppet */ } });
            };
            return h;
        },

        seng: function (trin, nr) {
            oensket = trin === null || trin === undefined ? null : { trin: trin, nr: nr || 0 };
            opdaterBund();
        },

        daemp: function (faktor) {
            daemp = NK.klamp(faktor, 0, 1);
            if (til && oensket) opdaterBund();
        },

        /* Filerne hentes, foerste gang et spil starter */
        hentMusik: hentMusik,
        harMusik: harMusik,

        /* Hvilke filer der er fundet, og hvad de laver lige nu */
        musikTilstand: function () {
            var klar = SPOR.map(function (s) { return !!s.klar; });
            return {
                filer: klar,
                kilde: klar.indexOf(true) >= 0 ? "filer" : "egen",
                egen: !!seng && !seng.doer,
                spor: SPOR.map(function (s) { return s.tilstand(); })
            };
        },

        til: function () { return til; },

        skift: function () {
            til = !til;
            NK.gem(NOEGLE, til);
            if (til) kontekst();
            opdaterBund();
            lyttere.forEach(function (f) { f(til); });
            return til;
        },

        /* Kaldes ved det foerste klik eller tastetryk, saa lyden maa spille */
        vaek: function () { if (til) kontekst(); },

        vedAendring: function (f) { lyttere.push(f); }
    };
}());

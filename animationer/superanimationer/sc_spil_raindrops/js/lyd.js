/* Ionregn: lyd og tid. Al timing kommer fra AudioContext.currentTime;
   performance.now() bruges kun til at glatte uret mellem lydblokkene. */
var Lyd = (function () {
    "use strict";

    var ctx = null, master, musikGain, klikGain, effektGain;
    var k = null;            /* ctx-tid minus performance-tid (s) */
    var kilde = null, sang = null;

    function init() {
        if (ctx) return ctx;
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        try { ctx = new AC({ latencyHint: "interactive" }); } catch (e) { ctx = new AC(); }
        master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
        musikGain = ctx.createGain(); musikGain.gain.value = 1; musikGain.connect(master);
        klikGain = ctx.createGain(); klikGain.gain.value = 0.55; klikGain.connect(master);
        effektGain = ctx.createGain(); effektGain.gain.value = 0.3; effektGain.connect(master);
        return ctx;
    }
    function vaagn() {
        init();
        if (ctx && ctx.state !== "running") return ctx.resume();
        return Promise.resolve();
    }

    /* ---- Uret ---------------------------------------------------------- */
    function synk() {
        if (!ctx) return;
        var ny = ctx.currentTime - performance.now() / 1000;
        if (k === null || Math.abs(ny - k) > 0.04) k = ny;
        else k += (ny - k) * 0.05;
    }
    function klokke() { synk(); return performance.now() / 1000 + k; }
    function udLatens() {
        if (!ctx) return 0;
        return (ctx.baseLatency || 0) + (ctx.outputLatency || 0);
    }
    /* Det, man hører lige nu, målt i ctx-tid */
    function hoerbar() { return klokke() - udLatens(); }
    /* Hvornår (hørbar ctx-tid) skete en hændelse? */
    function hoerbarVed(e) {
        synk();
        var p = e && typeof e.timeStamp === "number" ? e.timeStamp : performance.now();
        var nu = performance.now();
        if (p > nu || nu - p > 500) p = nu;
        return p / 1000 + k - udLatens();
    }

    /* ---- Lyde, der laves i koden -------------------------------------- */
    function klik(t, staerk) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(staerk ? 1760 : 1320, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(staerk ? 0.9 : 0.45, t + 0.002);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        o.connect(g); g.connect(klikGain);
        o.start(t); o.stop(t + 0.07);
        if (staerk) {
            var b = ctx.createOscillator(), gb = ctx.createGain();
            b.frequency.setValueAtTime(140, t);
            b.frequency.exponentialRampToValueAtTime(45, t + 0.12);
            gb.gain.setValueAtTime(0.0001, t);
            gb.gain.linearRampToValueAtTime(0.8, t + 0.003);
            gb.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
            b.connect(gb); gb.connect(klikGain);
            b.start(t); b.stop(t + 0.17);
        }
    }
    function tone(f, t, varighed, styrke, type) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = type || "sine";
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(styrke, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + varighed);
        o.connect(g); g.connect(effektGain);
        o.start(t); o.stop(t + varighed + 0.02);
    }
    function effekt(navn) {
        if (!ctx || ctx.state !== "running" || effektGain.gain.value === 0) return;
        var t = ctx.currentTime + 0.005;
        if (navn === "perfekt") tone(1568, t, 0.08, 0.5, "triangle");
        else if (navn === "god") tone(1175, t, 0.07, 0.4, "triangle");
        else if (navn === "forbindelse") {
            tone(784, t, 0.12, 0.45, "square"); tone(1047, t + 0.07, 0.12, 0.45, "square");
            tone(1568, t + 0.14, 0.2, 0.45, "square");
        } else if (navn === "fejl") {
            tone(110, t, 0.28, 0.6, "sawtooth"); tone(104, t + 0.02, 0.28, 0.5, "sawtooth");
        } else if (navn === "slut") {
            tone(220, t, 0.5, 0.5, "sawtooth"); tone(165, t + 0.2, 0.7, 0.5, "sawtooth");
        }
    }
    function saetEffekter(til) { if (init()) effektGain.gain.value = til ? 0.3 : 0; }

    /* ---- Sangen ------------------------------------------------------- */
    /* opt: { buffer (eller null = kun metronom), bpm, offsetS, startSek, klik, rate }
       offsetS: sekunder (i afspillet tid) fra filens start til første slag
       startSek: tiden fra første slag, sangen skal begynde ved (kan være negativ)
       rate: afspilningshastighed (1 = filens eget tempo) */
    function startSang(opt) {
        stopSang();
        var rate = opt.rate || 1;
        var t0 = ctx.currentTime + 0.15;
        var p0 = opt.startSek + opt.offsetS;          /* afspillet tid fra filens start ved t0 */
        sang = {
            startCtx: t0 - p0, offsetS: opt.offsetS, slagS: 60 / opt.bpm,
            buffer: opt.buffer || null, klik: !opt.buffer || !!opt.klik,
            naesteKlik: Math.ceil(opt.startSek / (60 / opt.bpm) - 1e-6), slut: false
        };
        if (opt.buffer) {
            kilde = ctx.createBufferSource();
            kilde.buffer = opt.buffer;
            kilde.playbackRate.value = rate;
            kilde.connect(musikGain);
            if (p0 >= 0) kilde.start(t0, p0 * rate); else kilde.start(t0 - p0, 0);
            kilde.onended = function () { if (sang) sang.slut = true; };
        }
        planlaeg();
        return sang;
    }
    function stopSang() {
        if (kilde) {
            kilde.onended = null;
            try { kilde.stop(); } catch (e) { /* allerede stoppet */ }
            kilde.disconnect();
            kilde = null;
        }
        sang = null;
    }
    /* Kaldes hvert billede: lægger metronomklik ind lidt frem i tiden */
    function planlaeg() {
        if (!sang || !sang.klik || !ctx) return;
        var nu = ctx.currentTime, frem = nu + 0.3;
        for (;;) {
            var t = sang.startCtx + sang.offsetS + sang.naesteKlik * sang.slagS;
            if (t > frem) break;
            if (t >= nu - 0.005) klik(t, ((sang.naesteKlik % 4) + 4) % 4 === 0);
            sang.naesteKlik++;
        }
    }
    /* Sekunder fra første slag ved den hørbare tid t */
    function sekVed(t) { return sang ? t - sang.startCtx - sang.offsetS : 0; }
    function sangSlut() { return !!(sang && sang.slut); }

    function pause() { return ctx && ctx.state === "running" ? ctx.suspend() : Promise.resolve(); }
    function fortsaet() { k = null; return ctx ? ctx.resume() : Promise.resolve(); }

    /* ---- Kalibrering: 4 klik at lytte på og 8 at trykke på -------------- */
    function kalibreringsKlik(bpm) {
        var slagS = 60 / bpm, t0 = ctx.currentTime + 0.6, tider = [];
        for (var i = 0; i < 12; i++) {
            var t = t0 + i * slagS;
            klik(t, i % 4 === 0);
            tider.push(t);
        }
        return tider;
    }

    /* ---- Musikfiler --------------------------------------------------- */
    function afkod(ab) {
        init();
        return new Promise(function (ok, fejl) {
            var p = ctx.decodeAudioData(ab, ok, fejl);
            if (p && p.then) p.then(ok, fejl);
        });
    }
    function hentURL(url) {
        if (location.protocol === "file:") return Promise.reject(new Error("harddisk"));
        return fetch(url).then(function (r) {
            if (!r.ok) throw new Error("http " + r.status);
            return r.arrayBuffer();
        }).then(afkod);
    }

    /* ---- Tempo og første slag i en lydfil ------------------------------
       1. Anslag måles i tre frekvensbånd (bas, hele lyden, diskant) i trin på 5 ms.
       2. Tempoet er den periode, der rammer flest anslag gennem hele filen.
       3. Slaget lægges på det skarpe anslag lige før basstødet (basen bygger op langsommere).
       4. Takt 1 er det første slag, hvor musikken er gået i gang. */
    function analyser(buffer) {
        var sr = buffer.sampleRate, hop = Math.round(sr * 0.005), hopS = hop / sr;
        var n = Math.min(buffer.length, Math.floor(sr * 300));
        var kan = [], c, f, j, i = 0;
        for (c = 0; c < buffer.numberOfChannels; c++) kan.push(buffer.getChannelData(c));
        var antal = Math.floor(n / hop);
        var EL = new Float32Array(antal), EA = new Float32Array(antal), EH = new Float32Array(antal);
        var aL = Math.exp(-2 * Math.PI * 120 / sr), aH = Math.exp(-2 * Math.PI * 3000 / sr), lp = 0, lp2 = 0;
        for (f = 0; f < antal; f++) {
            var sl = 0, sa = 0, sh = 0;
            for (j = 0; j < hop; j++, i++) {
                var x = 0;
                for (c = 0; c < kan.length; c++) x += kan[c][i];
                x /= kan.length;
                lp = (1 - aL) * x + aL * lp;
                lp2 = (1 - aH) * x + aH * lp2;
                var h = x - lp2;
                sl += lp * lp; sa += x * x; sh += h * h;
            }
            EL[f] = sl; EA[f] = sa; EH[f] = sh;
        }
        function onset(E) {
            var o = new Float32Array(antal), sum = 0, L = new Float32Array(antal);
            for (var f = 0; f < antal; f++) L[f] = Math.log(1e-10 + E[f] + (f ? E[f - 1] : 0));
            for (f = 2; f < antal; f++) { o[f] = Math.max(0, L[f] - L[f - 2]); sum += o[f]; }
            var mid = sum / antal || 1;
            for (f = 0; f < antal; f++) o[f] /= mid;
            return o;
        }
        var oL = onset(EL), oA = onset(EA), oH = onset(EH);
        var o = new Float32Array(antal), oT = new Float32Array(antal);
        for (f = 0; f < antal; f++) { o[f] = oL[f] + oA[f] + oH[f]; oT[f] = oA[f] + oH[f]; }

        /* grovt tempo: autokorrelation mellem 60 og 200 BPM, med en svag forkærlighed for 125 */
        function r(lag) {
            var s = 0;
            for (var f = 0; f + lag < antal; f++) s += o[f] * o[f + lag];
            return s / (antal - lag);
        }
        var lagMin = Math.round(60 / 200 / hopS), lagMax = Math.round(60 / 60 / hopS), rs = {}, lag;
        for (lag = lagMin; lag <= 2 * lagMax; lag++) rs[lag] = r(lag);
        var bedstLag = lagMin, bedst = -1;
        for (lag = lagMin; lag <= lagMax; lag++) {
            var bpm = 60 / (lag * hopS);
            var vaegt = Math.exp(-0.5 * Math.pow(Math.log(bpm / 125) / Math.LN2, 2));
            var s = (rs[lag] + 0.5 * (rs[2 * lag] || 0)) * vaegt;
            if (s > bedst) { bedst = s; bedstLag = lag; }
        }
        var grov = 60 / (bedstLag * hopS);

        /* fint tempo: kammen, der rammer flest anslag i hele filen */
        function kam(bpm) {
            var P = 60 / bpm / hopS, bedstS = -1;
            for (var fase = 0; fase < P; fase += 1) {
                var s = 0, k2 = 0;
                for (var t = fase; t < antal - 1; t += P) {
                    var ii = Math.round(t);
                    s += Math.max(o[ii], o[ii + 1], ii > 0 ? o[ii - 1] : 0);
                    k2++;
                }
                s /= k2;
                if (s > bedstS) bedstS = s;
            }
            return bedstS;
        }
        var bedstB = grov, bedstK = kam(grov), b, kk;
        for (b = grov * 0.97; b <= grov * 1.03; b += 0.05) {
            kk = kam(b);
            if (kk > bedstK) { bedstK = kk; bedstB = b; }
        }
        var midt = bedstB;
        for (b = midt - 0.06; b <= midt + 0.06; b += 0.01) {
            kk = kam(b);
            if (kk > bedstK) { bedstK = kk; bedstB = b; }
        }
        var rundet = Math.round(bedstB), halv = Math.round(bedstB * 2) / 2;
        if (Math.abs(bedstB - rundet) < 0.06) bedstB = rundet;
        else if (Math.abs(bedstB - halv) < 0.03) bedstB = halv;
        else bedstB = Math.round(bedstB * 100) / 100;

        /* slagets fase: profil af anslagene over én periode */
        var P = 60 / bedstB / hopS, nb = Math.round(P);
        function profil(x) {
            var p = new Float64Array(nb), m = new Float64Array(nb);
            for (var f = 0; f < antal; f++) { var bi = Math.floor((f % P) / P * nb) % nb; p[bi] += x[f]; m[bi]++; }
            var g = new Float64Array(nb);
            for (var q = 0; q < nb; q++) g[q] = (p[(q + nb - 1) % nb] / m[(q + nb - 1) % nb] + 2 * p[q] / m[q] + p[(q + 1) % nb] / m[(q + 1) % nb]) / 4;
            return g;
        }
        var pL = profil(oL), pT = profil(oT), fL = 0, q;
        for (q = 1; q < nb; q++) if (pL[q] > pL[fL]) fL = q;
        /* det skarpe anslag, der ligger lige før (eller på) basstødet */
        var fase = fL, bedstV = -1;
        for (q = 0; q < nb; q++) {
            var forud = ((fL - q) % nb + nb) % nb;
            if (forud > nb / 2) forud -= nb;
            var v = pT[q] * Math.exp(-0.5 * Math.pow((forud - 0.05 * nb) / (0.1 * nb), 2));
            if (v > bedstV) { bedstV = v; fase = q; }
        }
        var a0 = pT[(fase + nb - 1) % nb], a1 = pT[fase], a2 = pT[(fase + 1) % nb];
        var fin = a0 - 2 * a1 + a2 !== 0 ? 0.5 * (a0 - a2) / (a0 - 2 * a1 + a2) : 0;
        var faseS = ((fase + Math.max(-0.5, Math.min(0.5, fin))) * P / nb) * hopS - 0.75 * hopS;
        var slagS = 60 / bedstB;
        if (faseS < 0) faseS += slagS;

        /* takt 1: første slag, hvor takten derfra har mindst 10 % af den typiske lydstyrke (1 % af energien) */
        var taktF = Math.round(4 * slagS / hopS), styrker = [], k;
        for (k = 0; k * taktF < antal; k++) {
            var e = 0;
            for (f = k * taktF; f < Math.min(antal, (k + 1) * taktF); f++) e += EA[f];
            styrker.push(e);
        }
        var sorteret = styrker.slice().sort(function (x, y) { return x - y; });
        var median = sorteret[Math.floor(sorteret.length / 2)] || 0, offsetS = faseS;
        for (k = 0; faseS + k * slagS < buffer.duration; k++) {
            var t0 = Math.floor((faseS + k * slagS) / hopS), e2 = 0;
            for (f = t0; f < Math.min(antal, t0 + taktF); f++) e2 += EA[f];
            if (e2 >= 0.01 * median) { offsetS = faseS + k * slagS; break; }
        }

        var gns = 0;
        for (f = 0; f < antal; f++) gns += o[f];
        gns /= antal;
        return { bpm: bedstB, offsetMs: Math.round(offsetS * 1000), sikkerhed: kam(bedstB) / (gns || 1), varighed: buffer.duration };
    }

    return {
        init: init, vaagn: vaagn, ctx: function () { return ctx; },
        klokke: klokke, hoerbar: hoerbar, hoerbarVed: hoerbarVed, udLatens: udLatens,
        startSang: startSang, stopSang: stopSang, planlaeg: planlaeg, sekVed: sekVed, sangSlut: sangSlut,
        sang: function () { return sang; },
        pause: pause, fortsaet: fortsaet, effekt: effekt, saetEffekter: saetEffekter,
        kalibreringsKlik: kalibreringsKlik, afkod: afkod, hentURL: hentURL, analyser: analyser
    };
})();

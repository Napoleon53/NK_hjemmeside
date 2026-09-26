/* =====================================================================
   bord.js - laboratoriebordet: urglassene, draabeflasken og luppen

   Urglassene staar paa hvide klinker. Draabeflasken kan traekkes hen
   over et glas (eller man kan klikke paa glasset eller flasken). Saa
   flyver den derhen, vender tuden nedad og drypper tre draaber, og den
   nye farve breder sig fra der, hvor draaberne ramte.

   Luppen viser elektronerne, naar gangetallene skrives: hver partikel af
   det, der oxideres, har sine elektroner (gule), og hver partikel af
   det, der reduceres, har pladser til dem (ringe). Tallene er dem,
   eleven selv har skrevet. Er gangetallene rigtige, flytter
   elektronerne over, og partiklerne bliver til produkterne.

   Bordet ved ikke noget om kemien. Fanen (js/sim.js) siger, hvilken
   farve glasset skal have, og hvad luppen skal vise.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegn;

    var FLYV = 0.45, DRAABE_MELLEM = 0.34, BLAND = 1.7;
    var LUP_MAKS = 10;

    function Bord(valg) {
        this.navn = valg.navn;
        this.glas = valg.glas.map(function (g, i) {
            return { tekst: g.tekst, farve: D.FARVE[g.farve].slice(), bundfald: null, bundA: 0, gas: 0,
                     bobler: [], blob: null, lys: 0, over: 0, fro: 11 + i * 17 };
        });
        /* Flaskerne staar ved siden af hinanden; this.flaske er den, der er i brug */
        this.flasker = valg.flasker.map(function (fl, k) {
            return { nr: k, id: fl.id, tekst: fl.tekst, styrke: fl.styrke, farve: D.FARVE[fl.farve],
                     x: 0, y: 0, rot: 0, fase: null, t: 0, lys: 0 };
        });
        this.flaske = this.flasker[0];
        this.draaber = [];
        this.aktiv = 0;
        this.lup = { a: 0, data: null, fase: "tom", t: 0 };
        this.lay = null;
        this.overGlas = -1;
        this.overFlaske = -1;
    }

    var P = Bord.prototype;

    /* ----- Layout -------------------------------------------------------------------
       Omraadet (x, y, b, h): bordets bagkant ligger lidt over midten, glassene
       staar paa bordet, flasken til venstre og luppen til hoejre. */
    P.layout = function (x, y, b, h) {
        var n = this.glas.length;
        var lay = { x: x, y: y, b: b, h: h };
        lay.bagkant = y + h * 0.5;
        var lupR = Math.round(NK.klamp(Math.min(h * 0.36, b * 0.085), 48, 86));
        var flaskeH = NK.klamp(h * 0.66, 90, 150);
        var fs = T.flaskeGeo(flaskeH).s;
        var nf = this.flasker.length;
        var flaskeB = 64 * fs * nf + 14 * (nf - 1);
        var kant = NK.klamp(b * 0.03, 12, 30);
        /* Luppen med skaftet og forklaringen under: ca. 2,6 radier plus tekst */
        var lupB = Math.max(lupR * 2.7, 200);
        var fri = b - 2 * kant - flaskeB - lupB - 30;
        var gb = Math.min(NK.klamp(fri / n * 0.78, 90, n > 1 ? 190 : 240), h * 0.95);
        var glasBund = y + h * 0.74;
        /* Glassene fordeles i pladsen mellem flasken og luppen */
        var x0 = x + kant + flaskeB + 24, x1 = x + b - kant - lupB - 10;
        lay.glas = [];
        for (var i = 0; i < n; i++) {
            var cx = n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * (i + 0.5) / n;
            lay.glas.push(T.urglasGeo(cx, glasBund, gb));
        }
        lay.flaske = { s: fs };
        lay.hjem = this.flasker.map(function (fl, k) {
            return { x: x + kant + 32 * fs + k * (64 * fs + 14), y: glasBund + h * 0.08 - 127 * fs };
        });
        lay.lup = { cx: x + b - kant - lupB / 2 - lupR * 0.25, cy: y + h * 0.4, r: lupR };
        this.lay = lay;
        this.flasker.forEach(function (fl) { if (!fl.fase) { fl.x = lay.hjem[fl.nr].x; fl.y = lay.hjem[fl.nr].y; fl.rot = 0; } });
        return lay;
    };

    /* ----- Glassenes farver ------------------------------------------------------------ */
    P.saetGlas = function (i, farveNavn, bundfald) {
        var g = this.glas[i];
        g.farve = D.FARVE[farveNavn].slice();
        g.bundfald = bundfald ? D.BUNDFALD[bundfald] : null;
        g.bundA = bundfald ? 1 : 0;
        g.blob = null;
        g.bobler = [];
        g.gas = 0;
        g.bland = null;
    };

    P.saetTekst = function (i, tekst) { this.glas[i].tekst = tekst; };

    P.optaget = function () {
        return this.flasker.some(function (f) { return !!f.fase; }) || this.glas.some(function (g) { return !!g.bland; });
    };

    /* Stop alt, der er i gang (ny opgave): flaskerne staar hjemme igen */
    P.stop = function () {
        var lay = this.lay;
        this.flasker.forEach(function (f) {
            f.fase = null;
            if (lay) { f.x = lay.hjem[f.nr].x; f.y = lay.hjem[f.nr].y; f.rot = 0; }
        });
        this.draaber = [];
        this.glas.forEach(function (g) { g.bland = null; g.blob = null; });
        this.faerdig = null;
    };

    /* ----- Dryp: flaske nr flyver hen over glas i og drypper ---------------------------------
       maal: { til, bundfald, gas }. faerdig kaldes, naar farven har bredt sig. */
    P.dryp = function (i, maal, faerdig, nr) {
        var f = this.flasker[nr || 0];
        if (!this.lay || (f.fase && f.fase !== "traek")) return false;
        this.flaske = f;
        var g = this.lay.glas[i];
        f.fase = "flyv";
        f.t = 0;
        f.fra = { x: f.x, y: f.y, rot: f.rot };
        /* Flasken holdes skraat med tuden nedad, saa den kan vaere under kanten */
        f.til = { x: g.cx - g.b * 0.08, y: g.overflade - g.b * 0.2 - 8, rot: Math.PI * 0.76 };
        f.glas = i;
        f.draaber = 0;
        this.maal = maal;
        this.faerdig = faerdig;
        return true;
    };

    /* Flasken sluppet et forkert sted: den flyver hjem */
    P.hjem = function (nr) {
        var f = nr === undefined ? this.flaske : this.flasker[nr];
        f.fase = "hjem";
        f.t = 0;
        f.fra = { x: f.x, y: f.y, rot: f.rot };
    };

    P.opdater = function (dt) {
        var mig = this, lay = this.lay;
        if (!lay) return;
        this.flasker.forEach(function (f) { mig.opdaterFlaske(f, dt); });
        this.opdaterResten(dt);
    };

    P.opdaterFlaske = function (f, dt) {
        var lay = this.lay, hj = lay.hjem[f.nr];
        if (f.fase === "flyv") {
            f.t += dt;
            var t = NK.blod(f.t / FLYV);
            f.x = NK.lerp(f.fra.x, f.til.x, t);
            f.y = NK.lerp(f.fra.y, f.til.y, t);
            f.rot = NK.lerp(f.fra.rot, f.til.rot, t);
            if (f.t >= FLYV) { f.fase = "dryp"; f.t = 0; }
        } else if (f.fase === "dryp") {
            f.t += dt;
            while (f.draaber < 3 && f.t >= 0.12 + f.draaber * DRAABE_MELLEM) {
                this.draaber.push({ x: f.x, y: f.y + 4, vy: 60, glas: f.glas, nr: f.draaber });
                f.draaber++;
            }
            if (f.draaber >= 3 && f.t >= 0.12 + 2 * DRAABE_MELLEM + 0.45) this.hjem(f.nr);
        } else if (f.fase === "hjem") {
            f.t += dt;
            var th = NK.blod(f.t / FLYV);
            f.x = NK.lerp(f.fra.x, hj.x, th);
            f.y = NK.lerp(f.fra.y, hj.y, th);
            f.rot = NK.lerp(f.fra.rot, 0, th);
            if (f.t >= FLYV) { f.fase = null; f.x = hj.x; f.y = hj.y; f.rot = 0; }
        } else if (f.fase === "traek") {
            f.rot = NK.mod(f.rot, this.overGlas >= 0 ? 0.35 : 0, 8, dt);
        }
        f.lys = NK.mod(f.lys, this.overFlaske === f.nr && !f.fase ? 1 : 0, 10, dt);
    };

    P.opdaterResten = function (dt) {
        var mig = this, lay = this.lay;
        /* Draaberne falder og rammer vaesken */
        this.draaber = this.draaber.filter(function (d) {
            var g = lay.glas[d.glas];
            d.vy += 1900 * dt;
            d.y += d.vy * dt;
            if (d.y >= g.overflade) {
                mig.ramt(d.glas, d.x, g.overflade, d.nr);
                return false;
            }
            return true;
        });

        /* Glassene */
        this.glas.forEach(function (gl, i) {
            var g = lay.glas[i];
            var lys = (i === mig.aktiv && mig.visAktiv ? 0.75 : 0) + (i === mig.overGlas ? 0.6 : 0);
            gl.lys = NK.mod(gl.lys, Math.min(1, lys), 8, dt);
            if (gl.bland) {
                var b = gl.bland;
                b.t += dt;
                var u = NK.klamp(b.t / BLAND, 0, 1);
                var r = 12 + 118 * (1 - Math.pow(1 - u, 2.2));
                var farve = b.draabe ? T.bland(b.draabe, b.til, NK.blod(NK.klamp(u * 1.4 - 0.15, 0, 1))) : b.til;
                gl.blob = { x: b.x, y: b.y, r: r, farve: farve, drej: b.t * 2.6 };
                if (b.bundfald) gl.bundA = NK.klamp((u - 0.35) / 0.65, 0, 1);
                if (b.oploes) gl.bundA = 1 - NK.klamp(u / 0.8, 0, 1);
                if (u >= 1) {
                    gl.farve = b.til.slice();
                    gl.blob = null;
                    gl.bland = null;
                    if (b.oploes) { gl.bundfald = null; gl.bundA = 0; }
                    if (b.gas) gl.gas = 9;
                    if (mig.faerdig && i === mig.flaske.glas) {
                        var cb = mig.faerdig;
                        mig.faerdig = null;
                        cb();
                    }
                }
            }
            /* Bobler paa overfladen, saa laenge gassen kommer */
            if (gl.gas > 0 || gl.bobler.length) {
                gl.gas = Math.max(0, gl.gas - dt);
                var rate = gl.gas > 0 ? 3 + gl.gas * 1.6 : 0;
                if (Math.random() < rate * dt) {
                    var v = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random());
                    gl.bobler.push({ x: 110 + Math.cos(v) * 70 * rr, y: 30 + Math.sin(v) * 10 * rr, r: 1.5 + Math.random() * 2.5, t: 0, liv: 0.5 + Math.random() * 0.6 });
                }
                gl.bobler = gl.bobler.filter(function (bb) { bb.t += dt; return bb.t < bb.liv; });
            }
        });

        this.opdaterLup(dt);
    };

    /* En draabe har ramt glasset: den foerste starter blandingen */
    P.ramt = function (i, x, y, nr) {
        var gl = this.glas[i], g = this.lay.glas[i], m = this.maal;
        if (nr !== 0 || !m) return;
        var p = T.iGlas(g, x, y);
        gl.bland = { t: 0, x: p.x, y: p.y + 2, til: D.FARVE[m.til].slice(), fra: gl.farve.slice(),
                     draabe: this.flaske.farve[3] > 0.5 ? this.flaske.farve.slice() : null,
                     bundfald: m.bundfald ? D.BUNDFALD[m.bundfald] : null, gas: !!m.gas,
                     oploes: !m.bundfald && !!gl.bundfald };
        if (m.bundfald) { gl.bundfald = D.BUNDFALD[m.bundfald]; gl.bundA = 0; }
    };

    /* ----- Musen ---------------------------------------------------------------------- */
    /* Nummeret paa flasken under musen, eller -1 */
    P.flaskeUnder = function (pt) {
        var lay = this.lay;
        if (!lay) return -1;
        for (var k = this.flasker.length - 1; k >= 0; k--) {
            var f = this.flasker[k];
            if (f.fase && f.fase !== "traek") continue;
            var bx = T.flaskeBoks(f.x, f.y, lay.flaske.s);
            if (pt.x >= bx.x - 4 && pt.x <= bx.x + bx.b + 4 && pt.y >= bx.y - 4 && pt.y <= bx.y + bx.h + 4) return k;
        }
        return -1;
    };

    P.glasUnder = function (pt, rummelig) {
        if (!this.lay) return -1;
        for (var i = 0; i < this.lay.glas.length; i++) {
            var g = this.lay.glas[i];
            var top = rummelig ? g.overflade - g.b * 1.1 : g.y - 6;
            if (pt.x >= g.cx - g.b * 0.6 && pt.x <= g.cx + g.b * 0.6 && pt.y >= top && pt.y <= g.bund + g.b * 0.14) return i;
        }
        return -1;
    };

    P.hover = function (pt) {
        this.overFlaske = pt ? this.flaskeUnder(pt) : -1;
        if (this.flaske.fase === "traek") return "greb";
        var gi = pt ? this.glasUnder(pt, false) : -1;
        this.overGlas = gi;
        return this.overFlaske >= 0 ? "greb" : (gi >= 0 ? "glas" : null);
    };

    P.grib = function (pt) {
        var k = this.flaskeUnder(pt);
        if (k < 0) return false;
        var f = this.flasker[k];
        this.flaske = f;
        f.fase = "traek";
        f.greb = { dx: pt.x - f.x, dy: pt.y - f.y, x0: pt.x, y0: pt.y, flyttet: false };
        return true;
    };

    P.traek = function (pt) {
        var f = this.flaske;
        if (f.fase !== "traek") return;
        f.x = pt.x - f.greb.dx;
        f.y = pt.y - f.greb.dy;
        if (Math.abs(pt.x - f.greb.x0) + Math.abs(pt.y - f.greb.y0) > 6) f.greb.flyttet = true;
        this.overGlas = this.glasUnder(pt, true);
    };

    /* Giver { glas } eller { klik } (flasken blev ikke flyttet) eller { intet },
       og altid { flaske }: nummeret paa flasken */
    P.slip = function (pt) {
        var f = this.flaske;
        if (f.fase !== "traek") return { intet: true, flaske: f.nr };
        var flyttet = f.greb.flyttet;
        f.fase = null;
        var gi = this.glasUnder(pt, true);
        this.overGlas = -1;
        if (!flyttet) {
            var hj = this.lay.hjem[f.nr];
            f.x = hj.x; f.y = hj.y; f.rot = 0;
            return { klik: true, flaske: f.nr };
        }
        if (gi >= 0) return { glas: gi, flaske: f.nr };
        return { intet: true, flaske: f.nr };
    };

    /* ----- Luppen -----------------------------------------------------------------------
       data: { a: { farve, e, n }, b: { farve, e, n }, pa: { farve, n }, pb: { farve, n } }
       a: det, der oxideres (elektroner), b: det, der reduceres (pladser),
       pa og pb: produkterne. */
    P.lupVis = function (data) {
        this.lup.data = data;
        if (this.lup.fase === "tom" || this.lup.fase === "tal") this.lup.fase = data ? "tal" : "tom";
    };

    P.lupFlyt = function () {
        if (!this.lup.data) return;
        this.lup.fase = "flyt";
        this.lup.t = 0;
    };

    P.lupSlut = function () {
        if (!this.lup.data) return;
        this.lup.fase = "slut";
        this.lup.t = 9;
    };

    P.lupTom = function () {
        this.lup.data = null;
        this.lup.fase = "tom";
        this.lup.t = 0;
    };

    P.opdaterLup = function (dt) {
        var l = this.lup;
        l.t += dt;
        l.a = NK.mod(l.a, l.data ? 1 : 0, 6, dt);
    };

    /* Pladserne til n partikler i en halvdel af luppen */
    function gitter(n, cx, cy, b, h) {
        var ud = [];
        if (!n) return ud;
        var kol = Math.ceil(Math.sqrt(n * b / h)), rk = Math.ceil(n / kol);
        for (var i = 0; i < n; i++) {
            var r = Math.floor(i / kol), k = i % kol;
            var iRk = r === rk - 1 ? n - r * kol : kol;
            var x = cx + (k - (iRk - 1) / 2) * (b / kol);
            var y = cy + (r - (rk - 1) / 2) * (h / rk);
            ud.push({ x: x, y: y });
        }
        return ud;
    }

    function omkring(x, y, R, n, i, drej) {
        var v = -Math.PI / 2 + drej + i * Math.PI * 2 / Math.max(1, n);
        return { x: x + Math.cos(v) * R, y: y + Math.sin(v) * R };
    }

    P.tegnLup = function (ctx) {
        var lay = this.lay, l = this.lup;
        if (!lay) return;
        var L = lay.lup, cx = L.cx, cy = L.cy, r = L.r;
        var gl = this.glas[this.aktiv];
        ctx.save();
        ctx.save();
        T.lupIndre(ctx, cx, cy, r, T.rgba(gl.farve, 0.35));
        ctx.clip();
        var d = l.data;
        if (d && l.a > 0.02) {
            ctx.globalAlpha = l.a;
            var na = Math.min(LUP_MAKS, d.a.n), nb = Math.min(LUP_MAKS, d.b.n);
            var pr = NK.klamp(r * 0.095, 6, 9);
            /* Venstre del til det, der oxideres, hoejre til det, der reduceres,
               i forhold til hvor mange der er af hver */
            var fa = NK.klamp(na + nb ? na / (na + nb) : 0.5, 0.36, 0.64), W0 = cx - r * 0.8, Wb = r * 1.6, hh = r * 1.15;
            var ca = W0 + Wb * fa / 2, cb = W0 + Wb * fa + Wb * (1 - fa) / 2, hb = Wb * fa - 6, hb2 = Wb * (1 - fa) - 6;
            var ga = gitter(na, ca, cy, hb, hh), gb = gitter(nb, cb, cy, hb2, hh);
            var er = 2.3, R = pr + 4;
            var slut = l.fase === "slut" ? 1 : (l.fase === "flyt" ? NK.klamp((l.t - 2.3) / 0.8, 0, 1) : 0);

            /* Reaktanterne (fader ud til sidst) */
            ga.forEach(function (p) { T.partikel(ctx, p.x, p.y, pr, d.a.farve, 1 - slut); });
            gb.forEach(function (p) { T.partikel(ctx, p.x, p.y, pr, d.b.farve, 1 - slut); });
            /* Produkterne */
            if (slut > 0) {
                gitter(Math.min(LUP_MAKS, d.pa.n), ca, cy, hb, hh).forEach(function (p) { T.partikel(ctx, p.x, p.y, pr, d.pa.farve, slut); });
                gitter(Math.min(LUP_MAKS, d.pb.n), cb, cy, hb2, hh).forEach(function (p) { T.partikel(ctx, p.x, p.y, pr, d.pb.farve, slut); });
            }
            /* Pladserne og elektronerne */
            var ialtA = na * d.a.e, ialtB = nb * d.b.e;
            if (slut < 1) {
                ctx.globalAlpha = l.a * (1 - slut);
                gb.forEach(function (p) { for (var k = 0; k < d.b.e; k++) { var q = omkring(p.x, p.y, R, d.b.e, k, 0.3); T.plads(ctx, q.x, q.y, er); } });
                var flyt = l.fase === "flyt" ? l.t : 0;
                var n = 0;
                ga.forEach(function (p, ip) {
                    for (var k = 0; k < d.a.e; k++) {
                        var a0 = omkring(p.x, p.y, R, d.a.e, k, 0);
                        var pos = a0;
                        if (l.fase === "flyt" && n < ialtB) {
                            var til = gb[Math.floor(n / d.b.e)], q = omkring(til.x, til.y, R, d.b.e, n % d.b.e, 0.3);
                            var u = NK.blod(NK.klamp((flyt - 0.15 - n * (1.3 / Math.max(1, ialtA))) / 0.7, 0, 1));
                            pos = { x: NK.lerp(a0.x, q.x, u), y: NK.lerp(a0.y, q.y, u) - Math.sin(u * Math.PI) * r * 0.25 };
                        }
                        T.elektron(ctx, pos.x, pos.y, er);
                        n++;
                    }
                });
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
        T.lupRamme(ctx, cx, cy, r);

        /* Forklaringen under luppen: farverne og regnskabet */
        if (d && l.a > 0.02) {
            ctx.globalAlpha = l.a;
            var y = cy + r + 20;
            cx -= r * 0.2;
            var par = l.fase === "slut" || (l.fase === "flyt" && l.t > 2.6) ? [[d.pa.farve, d.pa.tekst], [d.pb.farve, d.pb.tekst]] :
                [[d.a.farve, d.a.tekst], [d.b.farve, d.b.tekst]];
            ctx.font = T.font("700", 13);
            var bredder = par.map(function (p) { return ctx.measureText(p[1]).width + 22; });
            var x = cx - (bredder[0] + bredder[1] + 10) / 2;
            par.forEach(function (p, i) {
                T.partikel(ctx, x + 7, y, 6.5, p[0]);
                ctx.fillStyle = "#e9eef4";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(p[1], x + 17, y + 0.5);
                x += bredder[i] + 10;
            });
            /* Regnskabet: kun tal, eleven selv har skrevet */
            var ea = d.a.n * d.a.e, eb = d.b.n * d.b.e;
            if (d.a.n || d.b.n) {
                var lige = ea === eb && ea > 0;
                var tekst = l.fase === "slut" || l.fase === "flyt" ? ea + " e⁻ er flyttet" : "afgiver " + ea + " e⁻ · plads til " + eb + " e⁻";
                ctx.font = T.font("700", 13);
                ctx.textAlign = "center";
                ctx.fillStyle = lige ? "#8ff0b4" : "#c8ced6";
                ctx.fillText(tekst, cx, y + 20);
                if (d.a.n > LUP_MAKS || d.b.n > LUP_MAKS) {
                    ctx.fillStyle = "#f0d77a";
                    ctx.font = T.font("600", 12);
                    ctx.fillText("Luppen viser højst " + LUP_MAKS + " af hver.", cx, y + 37);
                }
            }
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    };

    /* ----- Tegning --------------------------------------------------------------------- */
    P.tegn = function (ctx) {
        var mig = this, lay = this.lay;
        if (!lay) return;
        /* Klinkerne, glassene og skiltene */
        this.glas.forEach(function (gl, i) {
            var g = lay.glas[i];
            T.klinke(ctx, g.cx, g.bund, g.b, gl.lys);
            T.urglas(ctx, g, { farve: gl.farve, blob: gl.blob, bundfald: gl.bundfald, bundA: gl.bundA, bobler: gl.bobler, fro: gl.fro });
            if (gl.tekst) T.skilt(ctx, g.cx, g.bund + g.b * 0.1 + 3, gl.tekst, i === mig.aktiv && mig.visAktiv);
        });
        /* Luppen */
        this.tegnLup(ctx);
    };

    /* Draaberne og flasken tegnes til sidst, saa flasken kan holdes hen over
       katederet (og Kemichaels kop) */
    P.tegnFlaske = function (ctx) {
        var f = this.flaske, lay = this.lay;
        if (!lay) return;
        this.draaber.forEach(function (d) { T.draabe(ctx, d.x, d.y, 4.2, f.farve); });
        /* Den flaske, der er i brug, tegnes til sidst, saa den ligger oeverst */
        this.flasker.forEach(function (fl) { if (fl !== f) T.flaske(ctx, fl.x, fl.y, lay.flaske.s, fl.rot, fl.tekst, fl.lys, fl.styrke); });
        T.flaske(ctx, f.x, f.y, lay.flaske.s, f.rot, f.tekst, f.lys, f.styrke);
    };

    NK.Bord = Bord;
}());

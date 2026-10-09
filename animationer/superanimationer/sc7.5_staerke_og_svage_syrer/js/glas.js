/* =====================================================================
   glas.js - et baegerglas med syre, et stykke kalk og boblerne

   Makroniveauet. Glasset har en syre (K.SYRE) i en koncentration, og
   ligger der et stykke kalk i, bruser det. Hvor mange bobler der
   kommer, foelger [H₃O⁺] (K.brus): 0,10 M saltsyre giver BRUS bobler
   i sekundet, og 0,10 M eddikesyre en boble nu og da.

   Glasset er spritet sprites/baegerglas.svg. Vaesken, kalken og
   boblerne tegnes bag det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var BRUS = 60;             /* bobler pr. sekund i 0,10 M saltsyre */
    var FALD_SEK = 0.55;       /* saa laenge er kalken om at falde til bunds */

    function Glas(valg) {
        this.id = valg.id;
        this.syre = valg.syre;
        this.c = valg.c === undefined ? K.C0 : valg.c;
        this.kalk = false;
        this.kalkT = 0;
        this.bobler = [];
        this.skum = [];
        this.akk = 0;
        this.bruset = 0;       /* sekunder, kalken har ligget paa bunden */
        this.lavet = 0;        /* bobler i alt (til selvtesten) */
        this.niveau = 1;       /* 1 = 100 mL */
        this.x = 0;
        this.bund = 0;
        this.b = 160;
    }

    var P = Glas.prototype;

    Glas.BRUS = BRUS;

    /* Glassets midte, bordets hoejde og glassets bredde paa laerredet */
    P.plads = function (x, bund, b) {
        this.x = x;
        this.bund = bund;
        this.b = b;
    };

    P.maal = function () {
        var M = NK.Sprites.MAAL.baegerglas, k = this.b / M.b;
        var x0 = this.x - this.b / 2, y0 = this.bund - (M.bund + 1) * k;
        return {
            k: k, x0: x0, y0: y0, h: M.h * k,
            indV: x0 + M.indV * k, indH: x0 + M.indH * k, indBund: y0 + M.bund * k,
            top: y0 + M.top * k,
            flade: y0 + (M.bund - M.pr100mL * this.niveau) * k
        };
    };

    P.kalkI = function (straks) {
        if (this.kalk) return false;
        this.kalk = true;
        this.kalkT = straks ? 1 : 0;
        this.bruset = straks ? 3 : 0;
        return true;
    };

    P.toem = function () {
        this.kalk = false;
        this.kalkT = 0;
        this.bobler = [];
        this.skum = [];
        this.akk = 0;
        this.bruset = 0;
    };

    P.brus = function () { return K.brus(this.syre, this.c); };

    P.opdater = function (dt) {
        var m = this.maal(), k = m.k, mig = this;
        if (this.kalk && this.kalkT < 1) this.kalkT = Math.min(1, this.kalkT + dt / FALD_SEK);
        if (this.kalk && this.kalkT >= 1) {
            this.bruset += dt;
            this.akk += BRUS * this.brus() * dt;
            var nye = 0;
            while (this.akk >= 1 && nye < 6) {
                this.akk -= 1;
                nye++;
                this.lavet++;
                this.bobler.push({
                    x: this.x + NK.r(-17, 17) * k, y: m.indBund - NK.r(10, 24) * k,
                    r: NK.r(1.6, 3.6) * Math.max(0.8, k), vy: NK.r(60, 105) * k, fase: NK.r(0, 6.28), sving: NK.r(2, 7) * k
                });
            }
            if (this.akk > 6) this.akk = 6;
        }
        this.bobler.forEach(function (b) {
            b.y -= b.vy * dt;
            b.fase += dt * 7;
        });
        /* En boble, der naar overfladen, ligger der et oejeblik som skum */
        this.bobler = this.bobler.filter(function (b) {
            if (b.y > m.flade + b.r) return true;
            if (mig.skum.length < 46) mig.skum.push({ x: NK.klamp(b.x + Math.sin(b.fase) * b.sving, m.indV + 4, m.indH - 4), r: b.r * NK.r(1, 1.5), t: NK.r(0.35, 0.8) });
            return false;
        });
        this.skum.forEach(function (s) { s.t -= dt; });
        this.skum = this.skum.filter(function (s) { return s.t > 0; });
    };

    /* Det lille felt i vaesken, som luppen viser forstoerret */
    P.zoomFelt = function () {
        var m = this.maal(), s = 13 * Math.max(0.8, m.k);
        return { x: this.x + 26 * m.k, y: m.flade + (m.indBund - m.flade) * 0.38, b: s, h: s };
    };

    P.rammer = function (pt) {
        var m = this.maal();
        return pt.x >= m.x0 - 4 && pt.x <= m.x0 + this.b + 4 && pt.y >= m.y0 - 4 && pt.y <= this.bund + 8;
    };

    /* valg: etiket (en eller to linjer paa en seddel paa glasset; sedlen
       sidder paa glasset, saa linjen forneden ikke kan daekke den), peg (gul
       ring, der pulserer: klik her), om (rolig gul
       ring: det er dette glas, opgaven handler om), ph (pH-metret: en
       elektrode i glasset og pH som sidste linje paa sedlen), tid */
    P.tegn = function (ctx, valg) {
        valg = valg || {};
        var m = this.maal(), k = m.k, S = NK.Sprites;

        /* Vaesken */
        if (this.niveau > 0.01) {
            ctx.save();
            NK.rundtRekt(ctx, m.indV, m.flade, m.indH - m.indV, m.indBund - m.flade + 7 * k, 7 * k);
            ctx.clip();
            ctx.fillStyle = "rgba(120, 182, 235, 0.2)";
            ctx.fillRect(m.indV, m.flade, m.indH - m.indV, m.indBund - m.flade);
            ctx.fillStyle = "rgba(200, 228, 250, 0.5)";
            ctx.fillRect(m.indV, m.flade, m.indH - m.indV, 1.5);
            ctx.restore();
        }

        /* Kalken: falder fra oven og lander paa bunden */
        if (this.kalk) {
            var kb = S.MAAL.kalk.b * k * 1.05, kh = S.MAAL.kalk.h * k * 1.05;
            var t = NK.blod(this.kalkT);
            var ky = NK.lerp(m.top - kh - 10, m.indBund - kh + 1.5 * k, t * t);
            S.tegn(ctx, "kalk", this.x - kb / 2, ky, kb, kh);
        }

        /* Boblerne og skummet */
        ctx.save();
        ctx.lineWidth = 1;
        this.bobler.forEach(function (b) {
            ctx.beginPath();
            ctx.arc(b.x + Math.sin(b.fase) * b.sving, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(225, 242, 255, 0.28)";
            ctx.fill();
            ctx.strokeStyle = "rgba(235, 246, 255, 0.85)";
            ctx.stroke();
        });
        this.skum.forEach(function (s) {
            ctx.globalAlpha = NK.klamp(s.t / 0.3, 0, 1);
            ctx.beginPath();
            ctx.arc(s.x, m.flade - s.r * 0.3, s.r, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(240, 248, 255, 0.5)";
            ctx.fill();
            ctx.strokeStyle = "rgba(245, 250, 255, 0.9)";
            ctx.stroke();
        });
        ctx.restore();

        /* pH-metret: en elektrode i vaesken. Tallet staar paa sedlen nedenfor. */
        if (valg.ph) {
            var ex = m.indH - 22 * k;
            ctx.fillStyle = "#9aa3ae";
            ctx.fillRect(ex - 2, m.top - 12, 4, m.flade - m.top + 12 + 30 * k);
            ctx.fillStyle = "#d9dee4";
            ctx.fillRect(ex - 3, m.flade + 18 * k, 6, 12 * k);
        }

        S.tegn(ctx, "baegerglas", m.x0, m.y0, this.b, m.h);

        if (valg.peg) Tg.ring(ctx, m.x0 + 6, m.y0 + 6, this.b - 12, m.h - 12, valg.tid || 0);
        else if (valg.om) Tg.omRing(ctx, m.x0, m.y0, this.b, m.h);

        /* Etiketten: en seddel paa glasset over vaesken, saa den altid kan ses.
           Er pH-metret slaaet til, er pH sedlens sidste linje (som et display). */
        var linjer = (valg.etiket || []).slice();
        var phLinje = valg.ph ? "pH " + K.pHTekst(this.syre, this.c) : null;
        if (phLinje) linjer.push(phLinje);
        if (linjer.length) {
            var px = NK.klamp(15 * k, 12, 14.5), maxB = (m.indH - m.indV) - 8;
            ctx.save();
            ctx.font = Tg.font("700", px);
            var tb = 0;
            linjer.forEach(function (l) { tb = Math.max(tb, ctx.measureText(l).width); });
            while (tb + 12 > maxB && px > 11.5) {
                px -= 0.5;
                ctx.font = Tg.font("700", px);
                tb = 0;
                linjer.forEach(function (l) { tb = Math.max(tb, ctx.measureText(l).width); });
            }
            var sb = tb + 12, lh = px + 4, sh = linjer.length * lh + 6;
            var midt = this.x - (valg.ph ? 8 * k : 0);
            var sx = midt - sb / 2, sy = m.top + 12 * k;
            NK.rundtRekt(ctx, sx, sy, sb, sh, 4);
            ctx.fillStyle = "#efe9d8";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#a79e88";
            ctx.stroke();
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            linjer.forEach(function (l, i) {
                var ly = sy + 3 + lh * (i + 0.5);
                if (l === phLinje) {
                    NK.rundtRekt(ctx, sx + 2, ly - lh / 2 + 0.5, sb - 4, lh - 0.5, 3);
                    ctx.fillStyle = "#bdd0ad";
                    ctx.fill();
                }
                ctx.font = Tg.font(i === 0 || l === phLinje ? "700" : "600", px);
                ctx.fillStyle = i === 0 || l === phLinje ? "#1d2027" : "#454a55";
                ctx.fillText(l, midt, ly + 0.5);
            });
            ctx.restore();
        }

    };

    NK.Glas = Glas;
}());

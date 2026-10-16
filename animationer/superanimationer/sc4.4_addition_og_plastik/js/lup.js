/* =====================================================================
   lup.js - luppen paa fane 2: det oeverste lag helt taet paa

   Mikroniveauet. Seks molekyler af carbonhydridet som zigzagformler
   eller ringe og fire brommolekyler, der er kommet op fra bromvandet.
   Har stoffet en dobbeltbinding, finder hvert brommolekyle en, den
   aabner sig, og der kommer et bromatom paa hvert af de to
   carbonatomer. Ellers bliver brommolekylerne ved med at drive rundt
   mellem molekylerne: det er dem, der giver laget sin farve.

   Stederne gemmes som broekdele af vinduet, saa de foelger med, naar
   vinduet skifter stoerrelse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var ANTAL_MOL = 6, ANTAL_BR = 4;
    var MAAL = [0, 2, 3, 5];          /* de molekyler, de fire brommolekyler finder */
    var FOERSTE = 0.9, MELLEM = 1.0;  /* hvornaar brommolekylerne tager af sted (sekunder) */

    /* Midten af dobbeltbindingen i tegningens egne maal (se T.skeletGeo) */
    function dobbeltSted(stof) {
        return K.VAESKE[stof].ring ? [0.433, -0.75] : [-1.73, 0];
    }

    function Mikro() {
        this.stof = null;
        this.mol = [];
        this.br = [];
        this.b = 400;
        this.h = 200;
        this.t = 0;
    }

    var P = Mikro.prototype;

    Mikro.ANTAL_MOL = ANTAL_MOL;
    Mikro.ANTAL_BR = ANTAL_BR;

    P.saet = function (stof) {
        var i;
        this.stof = stof;
        this.reagerer = K.affarver(stof);
        this.t = 0;
        this.mol = [];
        this.br = [];
        for (i = 0; i < ANTAL_MOL; i++) this.mol.push({ fx: 0, fy: 0, fase: NK.r(0, 6.28), br: false, pop: 1 });
        for (i = 0; i < ANTAL_BR; i++) {
            this.br.push({
                fx: 0, fy: 0.2 + 0.2 * i, vy: (i % 2 === 0 ? 1 : -1) * NK.r(0.05, 0.08), fase: NK.r(0, 6.28), vink: NK.r(0, 3.14), vr: NK.r(-0.9, 0.9),
                bane: i, maal: this.reagerer ? MAAL[i] : -1, start: FOERSTE + i * MELLEM, sat: false, vaek: 0
            });
        }
        this.gitter();
    };

    /* Mellemrummet, et frit brommolekyle driver op og ned i: mellem to
       soejler af molekyler, saa det ikke ligger oven i en tegning */
    P.baneX = function (nr) {
        var k = ANTAL_MOL / this.raekker();
        /* to raekker: to mellemrum, to brommolekyler i hvert. Én raekke: fire af de fem */
        var mellemrum = k === 3 ? [1, 2, 1, 2] : [1, 2, 4, 5];
        return mellemrum[nr % 4] / k;
    };

    /* I et lavt vindue ligger molekylerne i én raekke, ellers i to */
    P.raekker = function () { return this.h >= 138 ? 2 : 1; };

    P.gitter = function () {
        var r = this.raekker(), k = ANTAL_MOL / r;
        var mig = this;
        this.mol.forEach(function (m, i) {
            m.fx = (i % k + 0.5) / k;
            m.fy = (Math.floor(i / k) + 0.5) / r;
        });
        this.lagt = r;
        this.br.forEach(function (b) { if (!b.sat && !(b.maal >= 0 && mig.t >= b.start)) b.fx = mig.baneX(b.bane); });
    };

    P.saetMaal = function (b, h) {
        this.b = b;
        this.h = h;
        if (this.mol.length && this.lagt !== this.raekker()) this.gitter();
    };

    /* Tegningens stoerrelse: pixels pr. bindingslaengde */
    P.s = function () {
        var r = this.raekker();
        return NK.klamp(Math.min(this.b / (ANTAL_MOL / r) / 5.6, this.h / r / 3.5), 11, 30);
    };

    P.opdater = function (dt) {
        var mig = this, s = this.s();
        this.t += dt;
        this.mol.forEach(function (m) {
            m.fase += dt * 1.3;
            if (m.pop < 1) m.pop = Math.min(1, m.pop + dt / 0.35);
        });
        this.br.forEach(function (b) {
            if (b.sat) { b.vaek = Math.min(1, b.vaek + dt / 0.25); return; }
            if (b.maal >= 0 && mig.t >= b.start) {
                /* paa vej hen til en dobbeltbinding */
                var m = mig.mol[b.maal], d0 = dobbeltSted(mig.stof);
                var tx = m.fx * mig.b + d0[0] * s, ty = m.fy * mig.h + d0[1] * s;
                var x = b.fx * mig.b, y = b.fy * mig.h;
                var dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy), skridt = 190 * dt * Math.max(0.7, mig.b / 520);
                if (d <= skridt + 2) {
                    b.sat = true;
                    m.br = true;
                    m.pop = 0;
                    return;
                }
                b.fx += dx / d * skridt / mig.b;
                b.fy += dy / d * skridt / mig.h;
                b.vink += dt * 3;
                return;
            }
            /* frit: op og ned i sit mellemrum mellem molekylerne */
            b.fase += dt * 0.9;
            b.fx = mig.baneX(b.bane) + Math.sin(b.fase) * 0.012;
            b.fy += b.vy * dt;
            b.vink += b.vr * dt;
            if (b.fy < 0.16) { b.fy = 0.16; b.vy = Math.abs(b.vy); }
            if (b.fy > 0.84) { b.fy = 0.84; b.vy = -Math.abs(b.vy); }
        });
    };

    /* Saa meget er der af hver slags lige nu */
    P.antal = function () {
        return {
            mol: this.mol.length,
            reageret: this.mol.filter(function (m) { return m.br; }).length,
            frie: this.br.filter(function (b) { return !b.sat; }).length
        };
    };

    /* Alle brommolekyler har fundet en dobbeltbinding (eller der er ingen at finde) */
    P.ro = function () {
        if (!this.reagerer) return this.t > 0.5;
        return this.br.every(function (b) { return b.sat && b.vaek >= 1; });
    };

    P.tegn = function (ctx, R) {
        var mig = this, s = this.s();
        if (!this.stof) return;
        ctx.save();
        NK.rundtRekt(ctx, R.x + 2, R.y + 2, R.b - 4, R.h - 4, 10);
        ctx.clip();
        this.mol.forEach(function (m) {
            var x = R.x + m.fx * mig.b + Math.sin(m.fase) * 2.5, y = R.y + m.fy * mig.h + Math.cos(m.fase * 0.8) * 2;
            if (m.br && m.pop < 1) {
                /* et kort gult glimt, naar brom har sat sig paa */
                ctx.save();
                ctx.globalAlpha = 0.5 * (1 - m.pop);
                ctx.fillStyle = Tg.GUL;
                ctx.beginPath();
                ctx.arc(x + dobbeltSted(mig.stof)[0] * s, y + dobbeltSted(mig.stof)[1] * s, s * (0.9 + m.pop * 1.4), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            Tg.skelet(ctx, mig.stof, x, y, s, { br: m.br });
        });
        this.br.forEach(function (b) {
            if (b.vaek >= 1) return;
            var x = R.x + b.fx * mig.b, y = R.y + b.fy * mig.h, u = s * 1.05;
            var c = Math.cos(b.vink) * 0.62 * u, sn = Math.sin(b.vink) * 0.62 * u, alfa = 1 - b.vaek;
            Tg.molekyle(ctx, [{ el: "Br", x: x - c, y: y - sn, alfa: alfa }, { el: "Br", x: x + c, y: y + sn, alfa: alfa }],
                [{ a: 0, b: 1, s: 1, farve: Tg.BROM }], u);
        });
        ctx.restore();
    };

    /* Det, der ligger under musen (x og y regnet fra vinduets hjoerne) */
    P.ved = function (x, y) {
        var mig = this, s = this.s(), ud = null;
        this.br.forEach(function (b) {
            if (!b.sat && Math.hypot(b.fx * mig.b - x, b.fy * mig.h - y) <= s * 1.1) ud = { slags: "br" };
        });
        if (ud) return ud;
        this.mol.forEach(function (m) {
            if (Math.abs(m.fx * mig.b - x) <= s * 2.5 && Math.abs(m.fy * mig.h - y) <= s * 1.4) ud = { slags: "mol", reageret: m.br };
        });
        return ud;
    };

    NK.Mikro = Mikro;
}());

/* =====================================================================
   lup.js - luppen over flammen (fane 1): det, der kommer op fra flammen

   Mikroniveauet som i bogens figur forbraending-flammer: kuglemodeller
   med bogstaver paa (C moerkegraa, O roed, H hvid). Over en blaa flamme
   er der kun CO₂ og H₂O; over en gul flamme ogsaa CO og klumper af sod.

   Luppen har 13 faste pladser: otte til vand og fem til det, carbonatomerne
   bliver til (D.LUFT[trin].kul). Hver plads har sin egen bane, og
   molekylerne stiger langsomt op gennem luppen og kommer ind forneden
   igen. Naar luften stilles, toner de pladser, der skifter, over i den nye
   slags. Intet er tilfaeldigt, saa det, luppen viser, altid passer med
   luftreguleringen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = NK.Tegn;

    /* bane (x i broekdele af vinduet), fase (hvor i turen den starter), fart */
    var KUL = [
        { x: 0.22, f: 0.08, v: 0.05 },
        { x: 0.68, f: 0.30, v: 0.046 },
        { x: 0.42, f: 0.55, v: 0.043 },
        { x: 0.80, f: 0.78, v: 0.052 },
        { x: 0.30, f: 0.95, v: 0.048 }
    ];
    var VAND = [
        { x: 0.12, f: 0.42, v: 0.055 },
        { x: 0.88, f: 0.12, v: 0.05 },
        { x: 0.55, f: 0.02, v: 0.047 },
        { x: 0.36, f: 0.25, v: 0.053 },
        { x: 0.62, f: 0.68, v: 0.049 },
        { x: 0.15, f: 0.80, v: 0.051 },
        { x: 0.78, f: 0.50, v: 0.046 },
        { x: 0.50, f: 0.40, v: 0.054 }
    ];

    function Lup() {
        this.t = 0;
        this.kul = KUL.map(function (b, i) { return { bane: b, type: null, ny: null, skift: 1, vink: i * 1.3 }; });
        this.vand = VAND.map(function (b, i) { return { bane: b, type: "H2O", ny: "H2O", skift: 1, vink: i * 0.9 + 0.4 }; });
        this.trin = -1;
    }

    var P = Lup.prototype;

    /* Luppen viser trin pos. straks: uden overtoning (en ny opgave) */
    P.saet = function (pos, straks) {
        if (pos === this.trin && !straks) return;
        this.trin = pos;
        var kul = D.LUFT[pos].kul;
        this.kul.forEach(function (p, i) {
            var ny = kul[i];
            if (straks) { p.type = ny; p.ny = ny; p.skift = 1; return; }
            if (ny === p.ny) return;
            p.ny = ny;
            p.skift = 0;
        });
    };

    P.opdater = function (dt) {
        this.t += dt;
        this.kul.forEach(function (p) {
            if (p.skift < 1) {
                p.skift = Math.min(1, p.skift + dt / 0.6);
                if (p.skift >= 1) p.type = p.ny;
            }
        });
    };

    /* De molekyler, der er i luppen lige nu, med deres sted og styrke */
    P.alle = function (R) {
        var ud = [], t = this.t, r = this.r(R);
        function sted(p, i) {
            var b = p.bane, f = (b.f + t * b.v) % 1;
            var y = R.y + R.h * (1.1 - f * 1.2);
            var x = R.x + R.b * b.x + Math.sin(t * 0.45 + i * 1.7) * r * 0.9;
            var kant = Math.min(1, Math.min(f, 1 - f) / 0.07);
            return { x: x, y: y, kant: kant, vink: p.vink + Math.sin(t * 0.3 + i) * 0.35 };
        }
        this.vand.forEach(function (p, i) {
            var s = sted(p, i + 5);
            ud.push({ type: "H2O", x: s.x, y: s.y, vink: s.vink, alfa: s.kant });
        });
        this.kul.forEach(function (p, i) {
            var s = sted(p, i);
            if (p.skift < 1) {
                if (p.type) ud.push({ type: p.type, x: s.x, y: s.y, vink: s.vink, alfa: s.kant * (1 - p.skift) });
                if (p.ny) ud.push({ type: p.ny, x: s.x, y: s.y, vink: s.vink, alfa: s.kant * p.skift });
            } else if (p.type) ud.push({ type: p.type, x: s.x, y: s.y, vink: s.vink, alfa: s.kant });
        });
        return ud;
    };

    /* Kuglernes radius: saa stor, at en klump sod kan vaere der */
    P.r = function (R) { return NK.klamp(Math.min(R.b, R.h) / 26, 7.5, 14); };

    P.tegn = function (ctx, R, taendt) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 2, R.y + 2, R.b - 4, R.h - 4, 10);
        ctx.clip();
        if (!taendt) {
            ctx.restore();
            NK.tekst(ctx, "Brænderen er slukket.", R.x + R.b / 2, R.y + R.h / 2, { font: Tg.font("600", 15), justering: "center", farve: "#8a93a0" });
            return;
        }
        /* svag varm luft i bunden */
        var g = ctx.createLinearGradient(0, R.y + R.h, 0, R.y);
        g.addColorStop(0, "rgba(255, 150, 60, 0.10)");
        g.addColorStop(1, "rgba(255, 150, 60, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(R.x, R.y, R.b, R.h);
        var r = this.r(R);
        this.alle(R).forEach(function (m) {
            if (m.alfa <= 0.01) return;
            Tg.molekyle(ctx, m.type, m.x, m.y, r, m.type === "sod" ? m.vink * 0.3 : m.vink, m.alfa);
        });
        ctx.restore();
    };

    /* Det molekyle, der ligger under musen */
    P.ved = function (R, pt) {
        if (!Tg.inde(R, pt)) return null;
        var r = this.r(R), bedst = null, afst = Infinity;
        this.alle(R).forEach(function (m) {
            if (m.alfa < 0.5) return;
            var d = Math.hypot(m.x - pt.x, m.y - pt.y);
            var max = (m.type === "sod" || m.type === "CO2" ? 2.8 : 2) * r;
            if (d < max && d < afst) { afst = d; bedst = m; }
        });
        return bedst;
    };

    /* Signaturen under luppen: de tre slags atomer med navn */
    P.tegnSignatur = function (ctx, x, y, b) {
        var fs = NK.klamp(b / 26, 12, 15), r = fs * 0.72;
        var liste = [["C", "carbon"], ["O", "oxygen"], ["H", "hydrogen"]];
        ctx.save();
        ctx.font = Tg.font("600", fs);
        var bredder = liste.map(function (l) { return 2 * r + 6 + ctx.measureText(l[1]).width; });
        var ialt = bredder.reduce(function (a, c) { return a + c; }, 0) + 22 * (liste.length - 1);
        var cx = x + (b - ialt) / 2;
        ctx.restore();
        liste.forEach(function (l, i) {
            var rr = l[0] === "H" ? r / 0.62 * 0.8 : r;
            Tg.atom(ctx, l[0], cx + r, y, rr);
            NK.tekst(ctx, l[1], cx + 2 * r + 6, y + fs * 0.36, { font: Tg.font("600", fs), farve: "#cfd6de" });
            cx += bredder[i] + 22;
        });
    };

    NK.LupFlamme = Lup;
}());

/* =====================================================================
   lup.js - luppen paa fane 1 og 3: det oeverste lag helt taet paa

   Mikroniveauet. To fedtstofmolekyler fra glasset ved siden af hinanden
   og de dibrommolekyler, der er dryppet i. Et dibrommolekyle paa vej
   finder en dobbeltbinding; naar det er fremme, forsvinder den anden
   streg, og der sidder et bromatom paa hvert af de to carbonatomer. Et
   dibrommolekyle uden en ledig dobbeltbinding driver rundt i laget: det
   er det, der giver laget farve. Glasset med kun heptan viser heptan-
   molekyler.

   Hvad der er sket, ved proeven (NK.Proeve i js/fedt.js). Luppen regner
   kun ud, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Fedt;
    var Tg = NK.Tegn;

    /* Heptan: seks molekyler (C7 som zigzag) i et gitter, i broekdele af vinduet */
    var HEPTAN = [[0.16, 0.3], [0.5, 0.26], [0.84, 0.32], [0.2, 0.72], [0.53, 0.68], [0.82, 0.74]];

    function Lup() {
        this.cache = null;
    }

    var P = Lup.prototype;

    /* Pladserne: molekylerne side om side, saa store de kan vaere i vinduet */
    P.geo = function (proeve, R) {
        var noegle = proeve.fedtId + "|" + Math.round(R.b) + "|" + Math.round(R.h) + "|" + Math.round(R.x) + "|" + Math.round(R.y);
        if (this.cache && this.cache.noegle === noegle) return this.cache;
        var forme = proeve.fedt.mol.map(function (k) { return F.formLup(k); });
        /* kassen har plads til bromatomerne (F.formLup); kant er lidt luft til rammen */
        var luft = 2.2, kant = 0.3, W = 0, H = 0;
        forme.forEach(function (f, i) {
            W += f.kasse.maxX - f.kasse.minX + (i ? luft : 0);
            H = Math.max(H, f.kasse.maxY - f.kasse.minY + 2 * kant);
        });
        var s = forme.length ? Math.min((R.b - 28) / W, (R.h - 16) / H, 24) : 20;
        var x = R.x + (R.b - W * s) / 2;
        var origo = forme.map(function (f) {
            var o = { x: x - f.kasse.minX * s, y: R.y + R.h / 2 - (f.kasse.minY + f.kasse.maxY) / 2 * s };
            x += (f.kasse.maxX - f.kasse.minX + luft) * s;
            return o;
        });
        this.cache = { noegle: noegle, forme: forme, origo: origo, s: s };
        return this.cache;
    };

    /* Midten af dobbeltbindingen, et dibrommolekyle er paa vej hen til (pixels) */
    P.maalSted = function (g, maal) {
        var f = g.forme[maal.m], o = g.origo[maal.m], kd = null;
        f.kaeder.forEach(function (x) { if (x.nr === maal.nr) kd = x; });
        var a = kd.pkt[maal.k], b = kd.pkt[maal.k + 1];
        return { x: o.x + (a.x + b.x) / 2 * g.s, y: o.y + (a.y + b.y) / 2 * g.s };
    };

    /* Hvor langt dibrom er kommet med at addere til dobbeltbindingen (0-1) */
    function bromP(proeve, m, nr, k) {
        var p = 0;
        proeve.dibrom.forEach(function (d) {
            if (d.maal && d.maal.m === m && d.maal.nr === nr && d.maal.k === k && d.sat) p = Math.max(p, Math.max(0.35, d.vaek));
        });
        return p;
    }

    P.dibromSted = function (g, d, R) {
        var start = { x: R.x + d.fx * R.b, y: R.y + d.fy * R.h };
        if (!d.maal) return start;
        var mp = this.maalSted(g, d.maal), t = NK.blod(d.p);
        return { x: NK.lerp(start.x, mp.x, t), y: NK.lerp(start.y, mp.y, t) };
    };

    P.tegn = function (ctx, proeve, R) {
        var mig = this, g = this.geo(proeve, R);
        ctx.save();
        NK.rundtRekt(ctx, R.x + 2, R.y + 2, R.b - 4, R.h - 4, 10);
        ctx.clip();
        if (proeve.fedt.heptan) {
            var s = NK.klamp(Math.min(R.b / 9, R.h / 4), 12, 24);
            HEPTAN.forEach(function (h, i) {
                var x = R.x + h[0] * R.b, y = R.y + h[1] * R.h, pkt = [];
                for (var j = 0; j < 7; j++) pkt.push({ x: x + (j - 3) * 0.866 * s, y: y + (j % 2 ? -0.25 : 0.25) * s * (i % 2 ? -1 : 1) });
                Tg.kaede(ctx, pkt, [], { farve: "#9aa3ae", lw: 2, afst: 3 });
            });
        }
        g.forme.forEach(function (f, m) {
            Tg.lupMolekyle(ctx, f, g.origo[m].x, g.origo[m].y, g.s, function (nr, k) { return bromP(proeve, m, nr, k); });
        });
        var r = Tg.brR(g.s);
        proeve.dibrom.forEach(function (d) {
            if (d.sat) return;
            var p = mig.dibromSted(g, d, R);
            Tg.dibrom(ctx, p.x, p.y, r, d.vink, 1);
        });
        ctx.restore();
    };

    /* Det, der ligger under musen: et frit dibrommolekyle eller en kaede */
    P.ved = function (proeve, R, pt) {
        var mig = this, g = this.geo(proeve, R), ud = null;
        if (pt.x < R.x || pt.x > R.x + R.b || pt.y < R.y || pt.y > R.y + R.h) return null;
        var r = Tg.brR(g.s);
        proeve.dibrom.forEach(function (d) {
            if (d.sat) return;
            var p = mig.dibromSted(g, d, R);
            if (Math.hypot(p.x - pt.x, p.y - pt.y) <= Math.max(14, r * 2.2)) ud = { slags: "br" };
        });
        if (ud) return ud;
        var bedst = Infinity;
        g.forme.forEach(function (f, m) {
            var o = g.origo[m];
            f.kaeder.forEach(function (kd) {
                kd.pkt.forEach(function (q) {
                    var d = Math.hypot(o.x + q.x * g.s - pt.x, o.y + q.y * g.s - pt.y);
                    if (d < bedst && d <= g.s * 0.9) { bedst = d; ud = { slags: "kaede", m: m, nr: kd.nr, id: kd.id }; }
                });
            });
        });
        return ud;
    };

    NK.Lup = Lup;
}());

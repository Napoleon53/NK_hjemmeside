/* =====================================================================
   enhed.js - en glucoseenhed som haworthformel og som lille sekskant

   Tegnestilen er bogens (figurerne b7-amylose og b7-cellulose i afsnit
   B7.3): ringens oxygenatom bagest til hoejre, carbonatom 1 yderst til
   hoejre, den tykke kant mod laeseren, en lys flade i ringen, ingen
   hydrogenatomer paa ringen og oxygenatomet i en glykosidbinding groent.
   Paa afstand bliver ringen til en orange sekskant som i bogens figur
   b7-polysaccharider.

   E.enhed(ctx, u)   tegner en enhed og giver hjoernerne og grupperne
   u = {
     X, Y         midten paa skaermen
     s            pixels pr. enhed (ringen er 2,1 enheder bred)
     vend         0 = som glucose staar i bogen, 1 = vendt om (hver anden
                  enhed i cellulose); ind imellem drejer ringen om sin
                  vandrette akse
     form         "alfa" eller "beta": hvor OH-gruppen paa carbonatom 1 peger
     sub          { 1: "OH" | null, 4: "OH" | null, 6: "CH₂OH" | "CH₂" }
                  null betyder, at carbonatomet sidder i en glykosidbinding,
                  og at bindingen tegnes for sig (E.bro)
     tekst        0-1: hvor tydelige grupperne er (de toner ud paa afstand)
     skema        0-1: fra haworthformel til sekskant
     h            sekskantens radius i pixels
     alfa         hele enhedens synlighed
     farve        { 1: farve, 4: farve, ... } paa en OH-gruppe
     numre        0-1: numrene paa carbonatomerne
   }
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var E = {};
    var FONT = "'Segoe UI', sans-serif";
    var INK = "#1d2433";
    var GROEN = "#0f766e";
    E.FONT = FONT;
    E.INK = INK;
    E.GROEN = GROEN;

    /* Ringens hjoerner (bogens haworthformel) og sekskantens hjoerner i samme raekkefoelge */
    var R6 = { 1: [1.05, 0], 2: [0.52, 0.56], 3: [-0.52, 0.56], 4: [-1.05, 0], 5: [-0.52, -0.56], O: [0.52, -0.56] };
    var HJ = ["1", "2", "3", "4", "5", "O"];
    var HEX = {};
    HJ.forEach(function (k, i) { var v = i * Math.PI / 3; HEX[k] = [Math.cos(v), Math.sin(v)]; });
    E.R6 = R6;

    /* Gruppernes retning og laengde (som glucose staar i bogen): +1 er ned */
    var GRUPPE = {
        2: { d: 1, l: 0.62, t: "OH", an: 0 },
        3: { d: -1, l: 0.52, t: "OH", an: 0 },          /* op, inde i ringen */
        4: { d: 1, l: 0.62, t: "HO", an: 1 },
        5: { d: -1, l: 0.64, t: "CH₂OH", an: 0 }
    };
    /* Numrene ved hjoernerne */
    var NUM = { 1: [0.26, -0.22], 2: [0.25, 0.2], 3: [-0.24, 0.22], 4: [-0.26, -0.22], 5: [-0.27, 0.02] };

    E.retning1 = function (form) { return form === "beta" ? -1 : 1; };

    /* ----- Tekst med saenkede tal (som i sb7.2) ------------------------------------ */
    function dele(t) {
        var ud = [];
        for (var i = 0; i < t.length; i++) {
            var c = t.charAt(i), j = "₀₁₂₃₄₅₆₇₈₉".indexOf(c);
            ud.push(j >= 0 ? { c: String(j), sub: true } : { c: c, sub: false });
        }
        return ud;
    }

    /* Maaler og (hvis tegn) tegner en gruppe, saa ankertegnet staar midt paa (x, y) */
    E.gruppe = function (ctx, t, an, x, y, f, farve, tegnDen, vaegt) {
        var d = dele(t), b = [], i, sum = 0, foer = 0;
        vaegt = vaegt || "600";
        for (i = 0; i < d.length; i++) {
            ctx.font = vaegt + " " + (d[i].sub ? f * 0.68 : f) + "px " + FONT;
            b.push(ctx.measureText(d[i].c).width);
        }
        for (i = 0; i < d.length; i++) { if (i < an) foer += b[i]; sum += b[i]; }
        var x0 = x - foer - b[an] / 2, cx = x0;
        for (i = 0; i < d.length; i++) {
            if (tegnDen) {
                ctx.font = vaegt + " " + (d[i].sub ? f * 0.68 : f) + "px " + FONT;
                ctx.fillStyle = farve;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(d[i].c, cx, d[i].sub ? y + f * 0.28 : y + f * 0.04);
            }
            cx += b[i];
        }
        return { x: x0, y: y - f * 0.58, w: sum, h: f * 1.16, cx: x, cy: y };
    };

    /* Skriftens stoerrelse ved en given skala */
    E.skrift = function (s) { return NK.klamp(s * 0.36, 10, 22); };

    /* En streg fra a til b, der stopper r1 foer a og r2 foer b */
    function streg(ctx, a, b, r1, r2) {
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
        if (l < r1 + r2 + 1) return;
        var ux = dx / l, uy = dy / l;
        ctx.beginPath();
        ctx.moveTo(a.x + ux * r1, a.y + uy * r1);
        ctx.lineTo(b.x - ux * r2, b.y - uy * r2);
        ctx.stroke();
    }
    E.streg = streg;

    /* Hjoernerne paa skaermen */
    E.hjoerner = function (u) {
        var sy = Math.cos(Math.PI * NK.klamp(u.vend || 0, 0, 1)), sk = NK.klamp(u.skema || 0, 0, 1);
        var h = u.h || u.s * 0.9, v = {};
        HJ.forEach(function (k) {
            var hx = u.X + R6[k][0] * u.s, hy = u.Y + R6[k][1] * u.s * sy;
            var ex = u.X + HEX[k][0] * h, ey = u.Y + HEX[k][1] * h;
            v[k] = { x: NK.lerp(hx, ex, sk), y: NK.lerp(hy, ey, sk) };
        });
        v.sy = sy;
        return v;
    };

    /* ----- En enhed --------------------------------------------------------------- */
    E.enhed = function (ctx, u) {
        var s = u.s, sk = NK.klamp(u.skema || 0, 0, 1), alfa = u.alfa === undefined ? 1 : u.alfa;
        var tekstA = NK.klamp(u.tekst === undefined ? 1 : u.tekst, 0, 1) * (1 - sk);
        var v = E.hjoerner(u), sy = v.sy, f = E.skrift(s);
        var sub = u.sub || {}, farve = u.farve || {};
        var ud = { v: v, lab: {}, sy: sy };
        if (alfa < 0.01) return ud;
        alfa *= ctx.globalAlpha;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        /* Fladen: lys i ringen, orange i sekskanten */
        ctx.beginPath();
        HJ.forEach(function (k, i) { if (i === 0) ctx.moveTo(v[k].x, v[k].y); else ctx.lineTo(v[k].x, v[k].y); });
        ctx.closePath();
        var top = Math.min(v[5].y, v.O.y, v[2].y), bund = Math.max(v[5].y, v.O.y, v[2].y);
        var g = ctx.createLinearGradient(0, top, 0, bund + 1);
        g.addColorStop(0, sk > 0.5 ? "#fcdba8" : "#fcf4e6");
        g.addColorStop(1, sk > 0.5 ? "#e7a254" : "#f0dfc3");
        ctx.fillStyle = g;
        ctx.fill();
        if (sk > 0.01) {
            ctx.save();
            ctx.globalAlpha = alfa * sk;
            ctx.strokeStyle = "#b46a1f";
            ctx.lineWidth = Math.max(1, (u.h || s) * 0.1);
            ctx.stroke();
            ctx.restore();
        }

        /* Kanterne i haworthformlen: tyk mod laeseren, tynd bagest */
        if (sk < 0.99) {
            ctx.save();
            ctx.globalAlpha = alfa * (1 - sk);
            ctx.strokeStyle = INK;
            var oR = tekstA > 0.05 ? f * 0.5 * tekstA : 0;
            for (var i = 0; i < 6; i++) {
                var a = HJ[i], b = HJ[(i + 1) % 6];
                var forrest = (R6[a][1] + R6[b][1]) * sy > 0.01;
                ctx.lineWidth = forrest ? Math.max(2.4, 0.1 * s) : Math.max(1.3, 0.036 * s);
                streg(ctx, v[a], v[b], a === "O" ? oR : 0, b === "O" ? oR : 0);
            }
            ctx.restore();
        }

        /* Grupperne */
        if (tekstA > 0.02) {
            ctx.save();
            ctx.globalAlpha = alfa * tekstA;
            ctx.strokeStyle = INK;
            ctx.lineWidth = Math.max(1.3, 0.036 * s);
            /* Ringens oxygenatom */
            E.gruppe(ctx, "O", 0, v.O.x, v.O.y, f, INK, true);
            var liste = [2, 3, 5];
            if (sub[1] !== null) liste.push(1);
            if (sub[4] !== null) liste.push(4);
            liste.forEach(function (k) {
                var gp = k === 1 ? { d: E.retning1(u.form), l: u.form === "beta" ? 0.64 : 0.62, t: "OH", an: 0 } : GRUPPE[k];
                var t = gp.t, an = gp.an;
                if (k === 5 && sub[6]) { t = sub[6]; }
                var p = { x: v[k].x, y: v[k].y + gp.d * gp.l * s * sy };
                var kasse = E.gruppe(ctx, t, an, p.x, p.y, f, INK, false);
                ctx.lineWidth = Math.max(1.3, 0.036 * s);
                ctx.strokeStyle = INK;
                var ind = Math.abs(sy) > 0.35 ? f * 0.55 : 0;
                if (Math.abs(p.y - v[k].y) > ind + 2) streg(ctx, v[k], p, 0, ind);
                var fv = farve[k === 5 ? 6 : k] || INK;
                E.gruppe(ctx, t, an, p.x, p.y, f, fv, true);
                kasse.ox = p.x; kasse.oy = p.y;
                ud.lab[k === 5 ? 6 : k] = kasse;
            });
            ctx.restore();
        }

        /* Numrene paa carbonatomerne */
        var nA = NK.klamp(u.numre || 0, 0, 1) * tekstA;
        if (nA > 0.02) {
            ctx.save();
            ctx.globalAlpha = alfa * nA;
            [1, 2, 3, 4, 5].forEach(function (k) {
                NK.tekst(ctx, String(k), v[k].x + NUM[k][0] * s, v[k].y + NUM[k][1] * s * (sy < 0 ? -1 : 1),
                    { font: "700 " + Math.round(f * 0.62) + "px " + FONT, farve: "#5b6676", justering: "center", linje: "middle" });
            });
            var k6 = ud.lab[6];
            if (k6) NK.tekst(ctx, "6", k6.x - f * 0.42, k6.cy, { font: "700 " + Math.round(f * 0.62) + "px " + FONT, farve: "#5b6676", justering: "center", linje: "middle" });
            ctx.restore();
        }
        ctx.restore();
        return ud;
    };

    /* ----- En glykosidbinding mellem to hjoerner (fra carbonatom 1 til carbonatom 4 eller 6) ----
       a og b er skaermpunkter, o er oxygenatomets plads. skema 0-1: paa
       afstand er bindingen en tynd streg uden O. */
    E.bro = function (ctx, a, b, o, s, opt) {
        opt = opt || {};
        var f = E.skrift(s), sk = NK.klamp(opt.skema || 0, 0, 1), alfa = opt.alfa === undefined ? 1 : opt.alfa;
        var tekstA = NK.klamp(opt.tekst === undefined ? 1 : opt.tekst, 0, 1) * (1 - sk);
        alfa *= ctx.globalAlpha;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.lineCap = "round";
        ctx.strokeStyle = sk > 0.5 ? "#b46a1f" : INK;
        ctx.lineWidth = NK.lerp(Math.max(1.3, 0.036 * s), Math.max(1.4, (opt.h || s) * 0.14), sk);
        var r = tekstA > 0.05 ? f * 0.55 : 0;
        streg(ctx, a, o, 0, r);
        streg(ctx, o, b, r, 0);
        if (tekstA > 0.02) {
            ctx.globalAlpha = alfa * tekstA;
            if (opt.gloed) {
                var gl = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, f * 1.1);
                gl.addColorStop(0, "rgba(15, 118, 110, 0.32)");
                gl.addColorStop(1, "rgba(15, 118, 110, 0)");
                ctx.fillStyle = gl;
                ctx.beginPath(); ctx.arc(o.x, o.y, f * 1.1, 0, Math.PI * 2); ctx.fill();
            }
            E.gruppe(ctx, "O", 0, o.x, o.y, f, opt.farve || GROEN, true, "700");
        }
        ctx.restore();
    };

    /* En binding, der fortsaetter ud af billedet (kaeden fortsaetter), fra hjoernet p */
    E.stump = function (ctx, p, retning, ned, s, opt) {
        opt = opt || {};
        var f = E.skrift(s), alfa = opt.alfa === undefined ? 1 : opt.alfa;
        var o = { x: p.x + retning * 0.5 * s, y: p.y + ned * 0.42 * s };
        var slut = { x: o.x + retning * 0.75 * s, y: o.y };
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.strokeStyle = INK;
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(1.3, 0.036 * s);
        streg(ctx, p, o, 0, f * 0.55);
        var gr = ctx.createLinearGradient(o.x, o.y, slut.x, slut.y);
        gr.addColorStop(0, "rgba(29, 36, 51, 1)");
        gr.addColorStop(1, "rgba(29, 36, 51, 0)");
        ctx.strokeStyle = gr;
        streg(ctx, o, slut, f * 0.55, 0);
        E.gruppe(ctx, "O", 0, o.x, o.y, f, INK, true);
        ctx.restore();
    };

    /* ----- En lille sekskant (molekylerne paa afstand) -----------------------------
       opt: alfa, dybde (-1 bagest til 1 forrest), lys (gul glans) */
    E.hex = function (ctx, X, Y, h, opt) {
        opt = opt || {};
        var a = opt.alfa === undefined ? 1 : opt.alfa;
        if (a < 0.01) return;
        a *= ctx.globalAlpha;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var v = i * Math.PI / 3, x = X + Math.cos(v) * h, y = Y + Math.sin(v) * h;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        var g = ctx.createLinearGradient(0, Y - h, 0, Y + h);
        g.addColorStop(0, opt.lys || "#fcdba8");
        g.addColorStop(1, opt.moerk || "#e7a254");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = opt.kant || "#b46a1f";
        ctx.lineWidth = Math.max(1, h * 0.14);
        ctx.lineJoin = "round";
        ctx.stroke();
        /* Lille glans oeverst til venstre */
        ctx.globalAlpha = a * 0.55;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(X - h * 0.25, Y - h * 0.42, h * 0.32, h * 0.14, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Roeret, der binder sekskanterne sammen (som spiralen i bogens figur) ------
       pts: [{ x, y, z }] i kaedens raekkefoelge; z fra -1 (bagest) til 1 (forrest).
       pts[i].brud: bindingen fra i til i+1 er klippet. pts[i].a: synligheden af
       bindingen fra i til i+1. opt.lag: "bag" tegner kun det bagerste, "for" kun
       det forreste, saa noget kan ligge inde i spiralen. opt.bane(i, u) giver
       roerets plads mellem enhed i og i+1 (ellers en blod kurve gennem enhederne). */
    E.roer = function (ctx, pts, opt) {
        opt = opt || {};
        var w = opt.w || 4, lag = opt.lag, N = opt.bane ? 12 : 8;
        if (pts.length < 2) return;
        ctx.save();
        ctx.lineCap = "round";
        var a0 = ctx.globalAlpha;
        for (var i = 0; i < pts.length - 1; i++) {
            if (pts[i].brud) continue;
            var P1 = pts[i], P2 = pts[i + 1];
            var P0 = i > 0 && !pts[i - 1].brud ? pts[i - 1] : P1;
            var P3 = i + 2 < pts.length && !pts[i + 1].brud ? pts[i + 2] : P2;
            var sa = pts[i].a === undefined ? 1 : pts[i].a;
            if (sa < 0.01) continue;
            var forrige = null;
            for (var k = 0; k <= N; k++) {
                var u = k / N, u2 = u * u, u3 = u2 * u, pkt;
                if (opt.bane) pkt = opt.bane(i, u);
                else {
                    pkt = {
                        x: 0.5 * (2 * P1.x + (-P0.x + P2.x) * u + (2 * P0.x - 5 * P1.x + 4 * P2.x - P3.x) * u2 + (-P0.x + 3 * P1.x - 3 * P2.x + P3.x) * u3),
                        y: 0.5 * (2 * P1.y + (-P0.y + P2.y) * u + (2 * P0.y - 5 * P1.y + 4 * P2.y - P3.y) * u2 + (-P0.y + 3 * P1.y - 3 * P2.y + P3.y) * u3),
                        z: NK.lerp(P1.z || 0, P2.z || 0, u)
                    };
                }
                var x = pkt.x, y = pkt.y, z = pkt.z;
                if (forrige) {
                    var zm = (forrige.z + z) / 2;
                    if (!lag || (lag === "bag" ? zm < 0 : zm >= 0)) {
                        var d = (zm + 1) / 2;
                        ctx.globalAlpha = a0 * sa * (0.6 + 0.4 * d);
                        ctx.strokeStyle = d < 0.5 ? "#d8a466" : "#c0742a";
                        ctx.lineWidth = w * (0.8 + 0.2 * d);
                        ctx.beginPath(); ctx.moveTo(forrige.x, forrige.y); ctx.lineTo(x, y); ctx.stroke();
                        if (d >= 0.5) {
                            ctx.strokeStyle = "rgba(255, 226, 180, 0.7)";
                            ctx.lineWidth = Math.max(1, w * 0.22);
                            ctx.beginPath(); ctx.moveTo(forrige.x, forrige.y - w * 0.22); ctx.lineTo(x, y - w * 0.22); ctx.stroke();
                        }
                    }
                }
                forrige = pkt;
            }
        }
        ctx.restore();
    };

    NK.Enhed = E;
}());

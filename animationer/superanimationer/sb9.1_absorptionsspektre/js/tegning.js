/* =====================================================================
   tegning.js - det, de tre faner tegner paa samme maade

   Grafen med spektret, kuvetten, reagensglasset, lampen, øjet,
   farvecirklen og tavlen bag molekylerne. Intet her ved noget om
   opgaverne; fanerne giver tallene med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Farve;

    var FONT = "'Segoe UI', sans-serif";
    var Tg = {};

    function tal(v, dec) { return v.toFixed(dec).replace(".", ","); }
    Tg.tal = tal;

    /* ----- Tavlen bag molekylerne (som tavlen i sb2.1) ----------------- */
    Tg.BUND = "#1f2b27";

    Tg.tavle = function (ctx, r) {
        ctx.save();
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fillStyle = "#6d4c2f";
        ctx.fill();
        var k = 8;
        var g = ctx.createLinearGradient(r.x, r.y, r.x + r.b, r.y + r.h);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        NK.rundtRekt(ctx, r.x + k, r.y + k, r.b - 2 * k, r.h - 2 * k, 4);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
        return { x: r.x + k, y: r.y + k, b: r.b - 2 * k, h: r.h - 2 * k };
    };

    /* En diskret etiket i smaa versaler (som kortene i panelet) */
    Tg.etiket = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        NK.tekst(ctx, tekst.toUpperCase(), x, y, {
            font: "700 " + (opt.str || 12) + "px " + FONT,
            farve: opt.farve || "#8d93a3",
            justering: opt.just || "left"
        });
    };

    /* ----- Grafen ----------------------------------------------------------
       o: xmin, xmax, ymax, kurver [{ A: fn(l), farve }], uv, mark [{ l, tekst }],
       hover { l }, skjult (et ? i stedet for kurven), haandtag { l, A, over }
       Giver geometrien tilbage, saa fanen kan regne musen om til nm. */
    Tg.graf = function (ctx, r, o) {
        var venstre = 50, hoejre = 14, top = 26, bund = 48;
        var g = {
            x0: r.x + venstre, x1: r.x + r.b - hoejre,
            y0: r.y + top, y1: r.y + r.h - bund,
            xmin: o.xmin, xmax: o.xmax, ymax: o.ymax
        };
        g.l2x = function (l) { return g.x0 + (l - g.xmin) / (g.xmax - g.xmin) * (g.x1 - g.x0); };
        g.x2l = function (x) { return g.xmin + (x - g.x0) / (g.x1 - g.x0) * (g.xmax - g.xmin); };
        g.a2y = function (a) { return g.y1 - Math.min(a, g.ymax * 1.04) / g.ymax * (g.y1 - g.y0); };
        g.inde = function (pt) { return pt.x >= g.x0 - 4 && pt.x <= g.x1 + 4 && pt.y >= g.y0 - 10 && pt.y <= g.y1 + 18; };

        ctx.save();
        /* baggrund */
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.fillStyle = "#14151b";
        ctx.fill();
        ctx.strokeStyle = "#33343f";
        ctx.lineWidth = 1;
        ctx.stroke();

        /* UV-omraadet */
        var lSyn = Math.max(400, g.xmin);
        if (o.uv && g.xmin < 400) {
            var xu = g.l2x(400);
            ctx.save();
            ctx.beginPath();
            ctx.rect(g.x0, g.y0, xu - g.x0, g.y1 - g.y0);
            ctx.clip();
            ctx.fillStyle = "rgba(150, 130, 255, 0.07)";
            ctx.fillRect(g.x0, g.y0, xu - g.x0, g.y1 - g.y0);
            ctx.strokeStyle = "rgba(150, 130, 255, 0.10)";
            ctx.lineWidth = 1;
            for (var s = g.x0 - (g.y1 - g.y0); s < xu; s += 12) {
                ctx.beginPath();
                ctx.moveTo(s, g.y1);
                ctx.lineTo(s + (g.y1 - g.y0), g.y0);
                ctx.stroke();
            }
            ctx.restore();
            NK.tekst(ctx, "UV (usynligt)", (g.x0 + xu) / 2, g.y0 + 16, { font: "700 13px " + FONT, farve: "#a99cf0", justering: "center" });
            NK.tekst(ctx, "Synligt lys", (xu + g.x1) / 2, g.y0 + 16, { font: "700 13px " + FONT, farve: "#9aa3ad", justering: "center" });
        }

        /* gitter og akser */
        ctx.strokeStyle = "#2a2c36";
        ctx.lineWidth = 1;
        var ystep = g.ymax > 3 ? 1 : 0.5;
        for (var a = 0; a <= g.ymax + 1e-9; a += ystep) {
            var y = g.a2y(a);
            ctx.beginPath(); ctx.moveTo(g.x0, y); ctx.lineTo(g.x1, y); ctx.stroke();
            NK.tekst(ctx, tal(a, ystep < 1 ? 1 : 0), g.x0 - 7, y + 4, { font: "600 12px " + FONT, farve: "#8d93a3", justering: "right" });
        }
        var xstep = (g.xmax - g.xmin) > 400 ? 100 : 50;
        for (var l = Math.ceil(g.xmin / xstep) * xstep; l <= g.xmax; l += xstep) {
            var x = g.l2x(l);
            ctx.beginPath(); ctx.moveTo(x, g.y0); ctx.lineTo(x, g.y1); ctx.stroke();
            NK.tekst(ctx, String(l), x, g.y1 + 25, { font: "600 12px " + FONT, farve: "#8d93a3", justering: "center" });
        }
        ctx.strokeStyle = "#5b5e6c";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(g.x0, g.y0 - 4); ctx.lineTo(g.x0, g.y1); ctx.lineTo(g.x1, g.y1);
        ctx.stroke();

        /* regnbuen under aksen */
        var lSlut = Math.min(700, g.xmax);
        for (var px = Math.floor(g.l2x(lSyn)); px < g.l2x(lSlut); px++) {
            ctx.fillStyle = F.css(F.lys(g.x2l(px + 0.5)));
            ctx.fillRect(px, g.y1 + 3, 1.2, 8);
        }

        NK.tekst(ctx, "Bølgelængde λ (nm)", (g.x0 + g.x1) / 2, r.y + r.h - 6, { font: "700 13px " + FONT, farve: "#cfd6de", justering: "center" });
        ctx.save();
        ctx.translate(r.x + 15, (g.y0 + g.y1) / 2);
        ctx.rotate(-Math.PI / 2);
        NK.tekst(ctx, "Absorbans", 0, 0, { font: "700 13px " + FONT, farve: "#cfd6de", justering: "center" });
        ctx.restore();

        /* kurverne */
        if (o.skjult) {
            NK.tekst(ctx, "?", (g.x0 + g.x1) / 2, (g.y0 + g.y1) / 2 + 22, { font: "800 64px " + FONT, farve: "rgba(207, 214, 222, 0.18)", justering: "center" });
        } else {
            (o.kurver || []).forEach(function (k) { tegnKurve(ctx, g, k); });
        }

        /* lodrette maerker: lambda-max og andet */
        (o.mark || []).forEach(function (m) {
            var xm = g.l2x(m.l);
            ctx.save();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = m.farve || "#f2c53d";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(xm, g.y0); ctx.lineTo(xm, g.y1); ctx.stroke();
            ctx.restore();
            if (m.tekst) {
                ctx.font = "700 13px " + FONT;
                var w = ctx.measureText(m.tekst).width + 12;
                var bx = NK.klamp(xm - w / 2, g.x0, g.x1 - w);
                NK.rundtRekt(ctx, bx, g.y0 - 22, w, 20, 5);
                ctx.fillStyle = "rgba(20, 21, 27, 0.92)";
                ctx.fill();
                ctx.strokeStyle = m.farve || "#f2c53d";
                ctx.lineWidth = 1.2;
                ctx.stroke();
                NK.tekst(ctx, m.tekst, bx + w / 2, g.y0 - 7.5, { font: "700 13px " + FONT, farve: m.farve || "#f2c53d", justering: "center" });
            }
        });

        /* haandtaget paa toppen, der kan traekkes */
        if (o.haandtag) {
            var hx = g.l2x(o.haandtag.l), hy = g.a2y(o.haandtag.A);
            ctx.beginPath();
            ctx.arc(hx, hy, o.haandtag.over ? 12 : 10, 0, Math.PI * 2);
            ctx.fillStyle = o.haandtag.over ? "#ffe18a" : "#f2c53d";
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#1b1b21";
            ctx.stroke();
            NK.tekst(ctx, "⇔", hx, hy + 5, { font: "800 14px " + FONT, farve: "#1b1b21", justering: "center" });
        }

        /* musen over grafen: et kryds og en lille boks */
        if (o.hover && o.kurver && o.kurver.length && !o.skjult) {
            var lh = NK.klamp(o.hover.l, g.xmin, g.xmax);
            var Ah = o.kurver[0].A(lh);
            var xh = g.l2x(lh), yh = g.a2y(Ah);
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(xh, g.y0); ctx.lineTo(xh, g.y1); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(g.x0, yh); ctx.lineTo(g.x1, yh); ctx.stroke();
            ctx.restore();
            var lysF = lh >= 400 && lh <= 700 ? F.css(F.lys(lh)) : "#8d93a3";
            ctx.beginPath();
            ctx.arc(xh, yh, 6, 0, Math.PI * 2);
            ctx.fillStyle = lysF;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.stroke();
            var linjer = ["λ = " + Math.round(lh) + " nm", "A = " + tal(Ah, 2), (F.lysNavn(lh) === "UV" ? "UV, usynligt" : F.lysOrd(lh) + " lys")];
            var bw = 128, bh = 64;
            var tx = xh + 14 + bw > g.x1 ? xh - 14 - bw : xh + 14;
            var ty = NK.klamp(yh - bh - 8, g.y0, g.y1 - bh);
            NK.rundtRekt(ctx, tx, ty, bw, bh, 7);
            ctx.fillStyle = "rgba(15, 16, 22, 0.94)";
            ctx.fill();
            ctx.strokeStyle = lysF;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            linjer.forEach(function (t, i) {
                NK.tekst(ctx, t, tx + 10, ty + 19 + i * 18, { font: (i === 0 ? "700 " : "600 ") + "13px " + FONT, farve: i === 0 ? "#f2c53d" : "#dfe4ea" });
            });
        }
        ctx.restore();
        return g;
    };

    /* Kurven: arealet under den farves med lyset ved hver bølgelængde, saa
       man kan se, hvilke farver der bliver absorberet */
    function tegnKurve(ctx, g, k) {
        var trin = 2, x, l, y;
        ctx.save();
        ctx.beginPath();
        ctx.rect(g.x0, g.y0 - 6, g.x1 - g.x0, g.y1 - g.y0 + 6);
        ctx.clip();
        if (k.fyld !== false) {
            for (x = g.x0; x < g.x1; x += trin) {
                l = g.x2l(x + trin / 2);
                y = g.a2y(k.A(l));
                if (y >= g.y1 - 0.5) continue;
                var c = (l >= 400 && l <= 700) ? F.lys(l) : { r: 0.55, g: 0.52, b: 0.7 };
                ctx.fillStyle = F.css(c, k.alfa || 0.5);
                ctx.fillRect(x, y, trin + 0.4, g.y1 - y);
            }
        }
        ctx.beginPath();
        for (x = g.x0; x <= g.x1; x += 1) {
            l = g.x2l(x);
            y = g.a2y(k.A(l));
            if (x === g.x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = k.farve || "#e9eef4";
        ctx.lineWidth = k.bred || 3;
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.restore();
    }

    /* ----- Kuvetten --------------------------------------------------------
       o: farve (css), skjult (dækket med ?), glimt (0-1) */
    Tg.kuvette = function (ctx, x, y, b, h, o) {
        o = o || {};
        ctx.save();
        var vaeske = y + h * 0.16;
        /* vaesken */
        ctx.fillStyle = o.skjult ? "#3b3e4a" : (o.farve || "rgba(255,255,255,0.08)");
        ctx.fillRect(x + 3, vaeske, b - 6, y + h - vaeske - 3);
        if (!o.skjult) {
            var g = ctx.createLinearGradient(x, 0, x + b, 0);
            g.addColorStop(0, "rgba(0,0,0,0.18)");
            g.addColorStop(0.3, "rgba(255,255,255,0.12)");
            g.addColorStop(1, "rgba(0,0,0,0.22)");
            ctx.fillStyle = g;
            ctx.fillRect(x + 3, vaeske, b - 6, y + h - vaeske - 3);
        }
        /* glasset */
        ctx.strokeStyle = "rgba(220, 235, 245, 0.75)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1.5, y + 1.5, b - 3, h - 3);
        ctx.fillStyle = "rgba(220, 235, 245, 0.18)";
        ctx.fillRect(x + 5, y + 4, 4, h - 8);
        /* laaget */
        ctx.fillStyle = "#5b5e6c";
        NK.rundtRekt(ctx, x - 3, y - 8, b + 6, 11, 3);
        ctx.fill();
        if (o.skjult) {
            NK.tekst(ctx, "?", x + b / 2, vaeske + (y + h - vaeske) / 2 + 12, { font: "800 34px " + FONT, farve: "#cfd6de", justering: "center" });
        }
        ctx.restore();
    };

    /* ----- Reagensglasset --------------------------------------------------
       o: farve (css), lag [css ...] fra oven og ned, niveau (0-1) */
    Tg.glas = function (ctx, cx, top, b, h, o) {
        o = o || {};
        var r = b / 2, x = cx - r;
        var niveau = o.niveau === undefined ? 0.78 : o.niveau;
        var vTop = top + h * (1 - niveau);
        ctx.save();
        function form() {
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, top + h - r);
            ctx.arc(cx, top + h - r, r, Math.PI, 0, true);
            ctx.lineTo(x + b, top);
        }
        form();
        ctx.save();
        ctx.clip();
        if (o.lag && o.lag.length) {
            var n = o.lag.length, lh = (top + h - vTop) / n;
            for (var i = 0; i < n; i++) {
                ctx.fillStyle = o.lag[i];
                ctx.fillRect(x - 1, vTop + i * lh - 0.5, b + 2, lh + 1);
            }
        } else {
            ctx.fillStyle = o.farve || "rgba(255,255,255,0.1)";
            ctx.fillRect(x - 1, vTop, b + 2, top + h - vTop + 2);
        }
        var g = ctx.createLinearGradient(x, 0, x + b, 0);
        g.addColorStop(0, "rgba(0,0,0,0.22)");
        g.addColorStop(0.35, "rgba(255,255,255,0.14)");
        g.addColorStop(1, "rgba(0,0,0,0.28)");
        ctx.fillStyle = g;
        ctx.fillRect(x - 1, vTop, b + 2, top + h - vTop + 2);
        /* menisken */
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        ctx.fillRect(x, vTop, b, 2);
        ctx.restore();
        form();
        ctx.strokeStyle = "rgba(220, 235, 245, 0.8)";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        /* kanten foroven */
        ctx.beginPath();
        ctx.ellipse(cx, top, r + 3, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(220, 235, 245, 0.2)";
        ctx.fillRect(x + 4, top + 6, 3, h - r - 10);
        ctx.restore();
    };

    /* ----- Lampen og øjet ------------------------------------------------- */
    Tg.lampe = function (ctx, x, y, s, taendt) {
        ctx.save();
        if (taendt) {
            var g = ctx.createRadialGradient(x + s * 0.55, y, 2, x + s * 0.55, y, s * 1.4);
            g.addColorStop(0, "rgba(255, 252, 235, 0.55)");
            g.addColorStop(1, "rgba(255, 252, 235, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(x - s, y - s * 1.5, s * 3, s * 3);
        }
        NK.rundtRekt(ctx, x - s * 0.5, y - s * 0.55, s, s * 1.1, 6);
        ctx.fillStyle = "#4a4c58";
        ctx.fill();
        ctx.strokeStyle = "#6c6f7e";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + s * 0.12, y, s * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = taendt ? "#fffbe6" : "#2b2c33";
        ctx.fill();
        ctx.strokeStyle = "#9ea2b0";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    };

    Tg.oeje = function (ctx, x, y, s, luk) {
        luk = luk || 0;
        ctx.save();
        var h = s * 0.48 * (1 - luk * 0.92);
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.quadraticCurveTo(x, y - h * 2, x + s, y);
        ctx.quadraticCurveTo(x, y + h * 2, x - s, y);
        ctx.closePath();
        ctx.fillStyle = "#f2f3f5";
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.beginPath();
        ctx.arc(x - s * 0.12, y, s * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = "#3d7fb8";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - s * 0.12, y, s * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "#14151b";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x - s * 0.22, y - s * 0.1, s * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#cfd6de";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.quadraticCurveTo(x, y - h * 2, x + s, y);
        ctx.quadraticCurveTo(x, y + h * 2, x - s, y);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Farvecirklen ----------------------------------------------------
       Ringen er farvetonerne (HSV), roed oeverst. Hver bølgelængde staar
       paa sin tone, saa den farve, vi ser, staar over for den, der bliver
       absorberet. o: absorberet [l ...], set { tone, css }, linjer (fra
       hver absorberet tvaers over), lysTone (fremhaev en tone i et hint) */
    function tone2v(t) { return (t - 90) * Math.PI / 180; }
    Tg.tone2v = tone2v;

    Tg.cirkel = function (ctx, cx, cy, R, o) {
        o = o || {};
        var D = NK.Data;
        var ri = R * 0.66;
        ctx.save();
        for (var t = 0; t < 360; t += 2) {
            ctx.beginPath();
            ctx.arc(cx, cy, R, tone2v(t - 1.2), tone2v(t + 1.2));
            ctx.arc(cx, cy, ri, tone2v(t + 1.2), tone2v(t - 1.2), true);
            ctx.closePath();
            ctx.fillStyle = F.css(F.toneRGB(t, 0.85, 0.95));
            ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, ri, 0, Math.PI * 2);
        ctx.fillStyle = "#1d1f27";
        ctx.fill();

        /* bølgelængderne inde i ringen */
        var fs = Math.max(11, Math.min(12.5, R * 0.14));
        (R < 62 ? [400, 500, 600] : [400, 450, 500, 550, 600, 650]).forEach(function (l) {
            var v = tone2v(F.lysTone(l));
            var x1 = cx + Math.cos(v) * ri, y1 = cy + Math.sin(v) * ri;
            var x2 = cx + Math.cos(v) * (ri - 6), y2 = cy + Math.sin(v) * (ri - 6);
            ctx.strokeStyle = "#cfd6de";
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            NK.tekst(ctx, String(l === 650 ? "650+" : l), cx + Math.cos(v) * (ri - 16), cy + Math.sin(v) * (ri - 16) + 4,
                { font: "600 " + fs + "px " + FONT, farve: "#aab2bd", justering: "center" });
        });

        /* navnene uden for ringen */
        var fsN = Math.max(12, Math.min(13.5, R * 0.16));
        D.CIRKEL.forEach(function (c) {
            var v = tone2v(c.tone);
            var lys = o.lysTone !== undefined && Math.abs(((c.tone - o.lysTone) % 360 + 540) % 360 - 180) < 25;
            NK.tekst(ctx, c.navn, cx + Math.cos(v) * (R + 15), cy + Math.sin(v) * (R + 15) + 5,
                { font: "700 " + fsN + "px " + FONT, farve: lys ? "#f2c53d" : "#cfd6de", justering: "center", kant: true });
        });

        /* linjen tvaers over fra det absorberede */
        (o.absorberet || []).forEach(function (l) {
            var tA = F.lysTone(l);
            var vA = tone2v(tA), vB = tone2v(tA + 180);
            if (o.linjer) {
                ctx.save();
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = "rgba(255,255,255,0.7)";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(vA) * ri, cy + Math.sin(vA) * ri);
                ctx.lineTo(cx + Math.cos(vB) * ri, cy + Math.sin(vB) * ri);
                ctx.stroke();
                ctx.restore();
            }
            var mr = (R + ri) / 2;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(vA) * mr, cy + Math.sin(vA) * mr, (R - ri) * 0.5, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#14151b";
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            NK.tekst(ctx, "✕", cx + Math.cos(vA) * mr, cy + Math.sin(vA) * mr + 4.5, { font: "800 12px " + FONT, farve: "#14151b", justering: "center" });
        });

        /* den farve, vi ser */
        if (o.set) {
            var vS = tone2v(o.set.tone), mr2 = (R + ri) / 2;
            var sx = cx + Math.cos(vS) * mr2, sy = cy + Math.sin(vS) * mr2;
            ctx.beginPath();
            ctx.arc(sx, sy, (R - ri) * 0.62, 0, Math.PI * 2);
            ctx.fillStyle = o.set.css;
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
            NK.tekst(ctx, "◉", sx, sy + 4.5, { font: "800 11px " + FONT, farve: "#14151b", justering: "center" });
        }
        ctx.restore();
    };

    NK.Tg = Tg;
}());

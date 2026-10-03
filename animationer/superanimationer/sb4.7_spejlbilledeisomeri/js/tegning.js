/* =====================================================================
   tegning.js - tavlen, stemplet og kuglemodellen (som sb4.6)

   NK.T.kugle, NK.T.kugleTekst og NK.T.pind er kuglemodellen. js/rum.js
   sorterer efter dybde og tegner det bageste foerst.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var FONT = "'Segoe UI', Tahoma, sans-serif";
    T.KRIDT = "#e9eee9";
    T.GUL = "#f2c53d";
    T.GROEN = "#5fcf92";
    T.ROED = "#f0796c";

    /* En farve gjort lysere (t > 0) eller moerkere (t < 0) */
    T.lys = function (hex, t) {
        var n = parseInt(hex.slice(1), 16);
        var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
        if (t >= 0) { r += (255 - r) * t; g += (255 - g) * t; b += (255 - b) * t; }
        else { r *= 1 + t; g *= 1 + t; b *= 1 + t; }
        return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
    };

    /* ----- Tavlen: samme farver som .tavle i css/stil.css ------------------------------ */
    T.tavle = function (ctx, r, kant) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        NK.rundtRekt(ctx, r.x + 3, r.y + 5, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = "#6d4c2f";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        var g = ctx.createLinearGradient(r.x, r.y, r.x + r.b, r.y + r.h);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x + 10, r.y + 10, r.b - 20, r.h - 20, 4);
        ctx.fill();
        if (kant) {
            ctx.strokeStyle = kant;
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, r.x - 2, r.y - 2, r.b + 4, r.h + 4, 9);
            ctx.stroke();
        }
        ctx.restore();
    };

    function linje(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    /* ----- Et stempel, der popper frem (t fra 0 til 1) ---------------------------------- */
    T.stempel = function (ctx, x, y, tekst, farve, t, fs) {
        if (t <= 0) return;
        var s = NK.pop(Math.min(1, t * 2.2));
        fs = fs || 30;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.06 * (1 - s));
        ctx.scale(0.4 + 0.6 * s, 0.4 + 0.6 * s);
        ctx.globalAlpha = Math.min(1, t * 3);
        ctx.font = "800 " + fs + "px " + FONT;
        var b = ctx.measureText(tekst).width + fs * 1.1, h = fs * 1.55;
        ctx.fillStyle = "rgba(14, 22, 18, 0.92)";
        ctx.strokeStyle = farve;
        ctx.lineWidth = 3;
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = farve;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, 0, fs * 0.04);
        ctx.restore();
    };

    /* ----- Kuglemodellen ---------------------------------------------------------------- */
    T.kugle = function (ctx, x, y, r, farve, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        if (opt.omrids) {
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = "rgba(220, 226, 235, 0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            return;
        }
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, T.lys(farve, 0.55));
        g.addColorStop(0.55, farve);
        g.addColorStop(1, T.lys(farve, -0.35));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (opt.ring) {
            ctx.strokeStyle = opt.ring;
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            ctx.arc(x, y, r + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (tekst) {
            var fs = opt.fs || Math.max(13, r * 0.78);
            ctx.font = "700 " + fs + "px " + FONT;
            if (ctx.measureText(tekst).width > r * 1.8) {
                fs = Math.max(11, fs * r * 1.8 / ctx.measureText(tekst).width);
                ctx.font = "700 " + fs + "px " + FONT;
            }
            ctx.fillStyle = opt.tekstFarve || "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tekst, x, y + fs * 0.05);
        }
        ctx.restore();
    };

    /* Bogstaverne paa en kugle (tegnes efter alle kugler og pinde) */
    T.kugleTekst = function (ctx, x, y, r, tekst, farve) {
        if (!tekst) return;
        ctx.save();
        var fs = Math.max(13, r * 0.78);
        ctx.font = "700 " + fs + "px " + FONT;
        if (ctx.measureText(tekst).width > r * 1.8) {
            fs = Math.max(11, fs * r * 1.8 / ctx.measureText(tekst).width);
            ctx.font = "700 " + fs + "px " + FONT;
        }
        ctx.fillStyle = farve || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + fs * 0.05);
        ctx.restore();
    };

    /* En pind mellem to kugler, med lys kant, saa den ser rund ud */
    T.pind = function (ctx, x1, y1, x2, y2, b, farve, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        ctx.lineCap = "round";
        ctx.strokeStyle = T.lys(farve, -0.4);
        ctx.lineWidth = b;
        linje(ctx, x1, y1, x2, y2);
        ctx.strokeStyle = farve;
        ctx.lineWidth = b * 0.62;
        linje(ctx, x1, y1, x2, y2);
        ctx.strokeStyle = T.lys(farve, 0.45);
        ctx.lineWidth = b * 0.2;
        var nx = -(y2 - y1), ny = x2 - x1, L = Math.hypot(nx, ny) || 1;
        var o = b * 0.16;
        linje(ctx, x1 + nx / L * o, y1 + ny / L * o, x2 + nx / L * o, y2 + ny / L * o);
        ctx.restore();
    };

    /* ----- Rummet: drejning og perspektiv ------------------------------------------------- */
    T.drejX = function (p, v) {
        var c = Math.cos(v), s = Math.sin(v);
        return [p[0], p[1] * c - p[2] * s, p[1] * s + p[2] * c];
    };
    T.drejY = function (p, v) {
        var c = Math.cos(v), s = Math.sin(v);
        return [p[0] * c + p[2] * s, p[1], -p[0] * s + p[2] * c];
    };

    /* kam: { cx, cy, s (pixels pr. enhed), f (afstand), yaw, pitch } */
    T.projekter = function (p, kam) {
        var q = T.drejY(p, kam.yaw || 0);
        q = T.drejX(q, kam.pitch || 0);
        var f = kam.f || 7;
        var k = f / (f + q[2]);
        return { x: kam.cx + q[0] * kam.s * k, y: kam.cy + q[1] * kam.s * k, k: k, z: q[2] };
    };

    NK.T = T;
}());

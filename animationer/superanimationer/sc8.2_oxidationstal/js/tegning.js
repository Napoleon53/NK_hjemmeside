/* =====================================================================
   tegning.js - det, fanerne tegner paa laerredet

   Vaeggen bag tavlen, tavlen paa fane 2 (paa fane 1 er tavlen et
   HTML-element med samme udseende, se .tavle i css/stil.css) og de smaa
   ting i elektronprikformlerne: prikkerne, ringene og klammerne om en
   ion. Funktionerne tegner én ting et bestemt sted og husker intet selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* Tavlens farver: samme som .tavle i stilarket */
    T.TAVLE = "#1f2b27";
    T.RAMME = "#6d4c2f";
    T.KRIDT = "#e9eee9";
    T.KRIDT_SVAG = "#9fb1a9";

    /* ----- Vaeggen (Kemichaels baand tegner gulvet) ---------------------------- */
    T.vaeg = function (ctx, W, bund) {
        var g = ctx.createLinearGradient(0, 0, 0, bund);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1d1f27");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, bund);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, bund);
    };

    /* ----- Tavlen med traeramme og kridtlisten ------------------------------------ */
    T.tavle = function (ctx, r, ramme) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, r.x + 3, r.y + 5, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = T.RAMME;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(r.x + 4, r.y + 2, r.b - 8, 2);
        var ix = r.x + ramme, iy = r.y + ramme, ib = r.b - 2 * ramme, ih = r.h - 2 * ramme;
        var g = ctx.createLinearGradient(ix, iy, ix + ib, iy + ih);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        ctx.fillStyle = g;
        ctx.fillRect(ix, iy, ib, ih);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 2;
        ctx.strokeRect(ix + 1, iy + 1, ib - 2, ih - 2);
        /* Kridtlisten */
        ctx.fillStyle = "#5a3e26";
        ctx.fillRect(r.x + r.b * 0.2, r.y + r.h - ramme * 0.6, r.b * 0.6, ramme * 0.9);
        ctx.fillStyle = "#f3f1e6";
        ctx.fillRect(r.x + r.b * 0.62, r.y + r.h - ramme * 0.55, 22, 4);
        ctx.restore();
    };

    /* ----- Elektronprikformlerne ------------------------------------------------------ */
    T.prik = function (ctx, x, y, r, farve) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = farve;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(10, 16, 14, 0.8)";
        ctx.stroke();
    };

    /* Den elektron, en positiv ion mangler: en tom, stiplet ring */
    T.tomPrik = function (ctx, x, y, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.setLineDash([2.5, 2.5]);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(233, 238, 233, 0.85)";
        ctx.stroke();
        ctx.restore();
    };

    T.ring = function (ctx, x, y, r, farve, bredde, stiplet) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (stiplet) ctx.setLineDash(stiplet);
        ctx.lineWidth = bredde || 2;
        ctx.strokeStyle = farve;
        ctx.stroke();
        ctx.restore();
    };

    /* Klammerne om en ion og ladningen oppe til hoejre */
    T.klammer = function (ctx, x0, y0, x1, y1, ladning, px) {
        var tak = Math.max(8, px * 0.25);
        ctx.save();
        ctx.strokeStyle = T.KRIDT;
        ctx.lineWidth = Math.max(2, px * 0.05);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(x0 + tak, y0);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x0, y1);
        ctx.lineTo(x0 + tak, y1);
        ctx.moveTo(x1 - tak, y0);
        ctx.lineTo(x1, y0);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x1 - tak, y1);
        ctx.stroke();
        ctx.fillStyle = T.KRIDT;
        ctx.font = font("700", Math.round(px * 0.6));
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(ladning, x1 + 5, y0 + px * 0.1);
        ctx.restore();
    };

    NK.Tegn = T;
}());

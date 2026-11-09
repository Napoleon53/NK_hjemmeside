/* =====================================================================
   tegning.js - tavlen, rammerne, skiltene og glucosemolekylerne i
   vinduet paa fane 3

   T.tavle(ctx, lay)                     vaeggen, whiteboardet og bakken
   T.gulRamme(ctx, x, y, b, h)           det, kortet spoerger om
   T.valgRamme(ctx, k, farve)            elevens valg (blaa), forkert (roed)
   T.skilt(ctx, x, y, tekst)             et gult skilt med pil ned mod (x, y)
   T.billedtekst(ctx, x, y, tekst)       navnet under et molekyle
   T.pil(ctx, x1, x2, y)                 en pil fra fischerprojektion til ring
   T.ikon(ctx, x, y, r, form, aaben)     et glucosemolekyle i vinduet:
                                         form "alfa", "beta" eller "kaede";
                                         aaben 0-1 er, hvor langt ringen er aabnet
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#6b7685";

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;
    T.ALFA = "#2f6fde";        /* α-glucose: blaa */
    T.BETA = "#7c3aed";        /* β-glucose: lilla */
    T.KAEDE = "#0f766e";       /* den aabne kaede: bogens groenne */
    T.ORANGE = "#d9480f";      /* oxygenatomet fra carbonatom 5 (som i bogens figur) */
    T.GROEN = "#0f766e";       /* aldehydgruppen, der bliver til en OH-gruppe */
    T.VALG = "#2f6fde";
    T.FORKERT = "#d9534f";

    /* ----- Tavlen (som molekylemotorens whiteboard) -------------------------- */
    T.tavle = function (ctx, lay) {
        var W = lay.W, H = lay.H, t = lay.tavle, b = lay.bakke;
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#23232c");
        g.addColorStop(1, "#18181f");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#a9afb8";
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        ctx.restore();
        var gr = ctx.createLinearGradient(0, t.y - 6, 0, t.y + t.h + 6);
        gr.addColorStop(0, "#d3d7dd");
        gr.addColorStop(0.5, "#aab0b9");
        gr.addColorStop(1, "#c6cad1");
        ctx.fillStyle = gr;
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        var fl = ctx.createLinearGradient(t.x, t.y, t.x + t.b, t.y + t.h);
        fl.addColorStop(0, "#fbfcfb");
        fl.addColorStop(0.55, "#f4f6f5");
        fl.addColorStop(1, "#eef1f0");
        ctx.fillStyle = fl;
        ctx.fillRect(t.x, t.y, t.b, t.h);
        ctx.fillStyle = "rgba(120, 132, 150, 0.18)";
        for (var y = t.y + 13; y < t.y + t.h; y += 26) {
            for (var x = t.x + 13; x < t.x + t.b; x += 26) ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        var gb = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
        gb.addColorStop(0, "#c7ccd3");
        gb.addColorStop(1, "#80868f");
        ctx.fillStyle = gb;
        NK.rundtRekt(ctx, b.x, b.y, b.b, b.h, 3);
        ctx.fill();
    };

    /* ----- Rammer om dele af molekylet -------------------------------------------- */
    T.gulRamme = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, r || 10);
        ctx.fillStyle = "rgba(242, 197, 61, 0.16)";
        ctx.fill();
        ctx.strokeStyle = "#d69e0c";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    };

    /* k er en kasse { x, y, w, h } fra NK.Sukker.tegn */
    T.valgRamme = function (ctx, k, farve, stiplet) {
        if (!k) return;
        ctx.save();
        NK.rundtRekt(ctx, k.x - 5, k.y - 3, k.w + 10, k.h + 6, 8);
        ctx.fillStyle = farve === T.FORKERT ? "rgba(217, 83, 79, 0.10)" : "rgba(47, 111, 222, 0.12)";
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2.5;
        if (stiplet) ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
    };

    /* Den samlede kasse om flere kasser */
    T.samlet = function (kasser) {
        var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
        kasser.forEach(function (k) {
            if (!k) return;
            n++;
            x0 = Math.min(x0, k.x); y0 = Math.min(y0, k.y);
            x1 = Math.max(x1, k.x + k.w); y1 = Math.max(y1, k.y + k.h);
        });
        if (!n) return null;
        return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    };

    /* En lille cirkel (et carbonatom i ringens hjoerne) som kasse */
    T.punktKasse = function (p, r) {
        return { x: p.x - r, y: p.y - r, w: 2 * r, h: 2 * r, cx: p.x, cy: p.y };
    };

    /* ----- Et gult skilt med en lille spids ned mod (x, y) ---------------------- */
    T.skilt = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = "700 13px " + FONT;
        var b = ctx.measureText(tekst).width + 18, h = 24;
        var bx = NK.klamp(x - b / 2, opt.min !== undefined ? opt.min : -1e9, opt.maks !== undefined ? opt.maks - b : 1e9);
        var by = y - h - 8;
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#f6d55c";
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        ctx.moveTo(x - 6, by + h - 0.5);
        ctx.lineTo(x + 6, by + h - 0.5);
        ctx.lineTo(x, by + h + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#b8901a";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.stroke();
        ctx.fillStyle = "#3a2c00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, by + h / 2 + 1);
        ctx.restore();
        return { x: bx, y: by, b: b, h: h };
    };

    /* ----- Navnet under et molekyle ------------------------------------------------- */
    T.billedtekst = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        NK.tekst(ctx, tekst, x, y, { font: (opt.vaegt || "700") + " " + (opt.str || 15) + "px " + FONT,
            farve: opt.farve || BLAEK, justering: "center", linje: "middle" });
    };

    /* ----- En pil -------------------------------------------------------------------- */
    T.pil = function (ctx, x1, x2, y, farve) {
        ctx.save();
        ctx.strokeStyle = farve || "#8a93a3";
        ctx.fillStyle = farve || "#8a93a3";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2 - 10, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - 13, y - 7); ctx.lineTo(x2 - 13, y + 7); ctx.closePath(); ctx.fill();
        ctx.restore();
    };

    /* ----- Et glucosemolekyle i vinduet paa fane 3 ------------------------------------
       Ringen er en lille haworthformel set fra siden: tyk forkant, oxygenatomet
       bagest til hoejre og OH-gruppen paa carbonatom 1 som en kort streg op
       (β) eller ned (α) i formens farve. Kaeden er en zigzag med en lille
       aldehydgruppe. aaben (0-1) toner fra ring til kaede. */
    var R = [[1.05, 0], [0.52, 0.56], [-0.52, 0.56], [-1.05, 0], [-0.52, -0.56], [0.52, -0.56]];

    T.ikon = function (ctx, x, y, r, form, aaben, opt) {
        opt = opt || {};
        aaben = NK.klamp(aaben || 0, 0, 1);
        var farve = form === "alfa" ? T.ALFA : (form === "beta" ? T.BETA : T.KAEDE);
        var alfa = opt.alfa === undefined ? 1 : opt.alfa;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        var s = r / 1.1;
        if (aaben < 1) {
            ctx.save();
            ctx.globalAlpha = alfa * (1 - aaben);
            /* Ringen er svagt farvet efter formen, saa fordelingen kan ses paa afstand */
            if (form === "alfa" || form === "beta") {
                ctx.beginPath();
                R.forEach(function (p, i) { if (i === 0) ctx.moveTo(x + p[0] * s, y + p[1] * s); else ctx.lineTo(x + p[0] * s, y + p[1] * s); });
                ctx.closePath();
                ctx.fillStyle = form === "alfa" ? "rgba(47, 111, 222, 0.28)" : "rgba(124, 58, 237, 0.28)";
                ctx.fill();
            }
            /* Bagkanten tynd, forkanten tyk */
            ctx.strokeStyle = "#3b4352";
            ctx.lineWidth = Math.max(1, s * 0.09);
            ctx.beginPath();
            ctx.moveTo(x + R[3][0] * s, y + R[3][1] * s);
            ctx.lineTo(x + R[4][0] * s, y + R[4][1] * s);
            ctx.lineTo(x + R[5][0] * s, y + R[5][1] * s);
            ctx.lineTo(x + R[0][0] * s, y + R[0][1] * s);
            ctx.stroke();
            ctx.lineWidth = Math.max(2, s * 0.24);
            ctx.beginPath();
            ctx.moveTo(x + R[0][0] * s, y + R[0][1] * s);
            ctx.lineTo(x + R[1][0] * s, y + R[1][1] * s);
            ctx.lineTo(x + R[2][0] * s, y + R[2][1] * s);
            ctx.lineTo(x + R[3][0] * s, y + R[3][1] * s);
            ctx.stroke();
            /* Ringens oxygenatom */
            ctx.fillStyle = "#d9480f";
            ctx.beginPath(); ctx.arc(x + R[5][0] * s, y + R[5][1] * s, Math.max(1.6, s * 0.16), 0, Math.PI * 2); ctx.fill();
            /* OH-gruppen paa carbonatom 1 */
            if (form === "alfa" || form === "beta") {
                var op = form === "beta" ? -1 : 1;
                ctx.strokeStyle = farve;
                ctx.lineWidth = Math.max(1.6, s * 0.16);
                ctx.beginPath();
                ctx.moveTo(x + R[0][0] * s, y);
                ctx.lineTo(x + R[0][0] * s, y + op * s * 0.75);
                ctx.stroke();
                ctx.fillStyle = farve;
                ctx.beginPath(); ctx.arc(x + R[0][0] * s, y + op * s * 0.8, Math.max(2, s * 0.2), 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
        if (aaben > 0) {
            ctx.save();
            ctx.globalAlpha = alfa * aaben;
            ctx.strokeStyle = T.KAEDE;
            ctx.lineWidth = Math.max(1.4, s * 0.13);
            ctx.beginPath();
            var x0 = x - 1.1 * s;
            for (var i = 0; i < 6; i++) {
                var px = x0 + i * 0.44 * s, py = y + (i % 2 ? -0.22 : 0.22) * s;
                if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
            /* Aldehydgruppen: C=O i enden */
            var ex = x0 + 5 * 0.44 * s, ey = y - 0.22 * s;
            ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + 0.18 * s, ey + 0.5 * s); ctx.stroke();
            ctx.fillStyle = T.KAEDE;
            ctx.beginPath(); ctx.arc(ex + 0.2 * s, ey + 0.58 * s, Math.max(2, s * 0.2), 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    };

    NK.Tegning = T;
}());

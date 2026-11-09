/* =====================================================================
   tegning.js - tavlen, rammerne, skiltene og det, der staar omkring
   molekylerne: enzymer, triiodidioner, lupper, proever og taellere

   Tavlen, rammerne, skiltet og billedteksten er de samme som i sb7.2.
   T.tavle(ctx, lay)                     vaeggen, whiteboardet og bakken
   T.gulRamme(ctx, x, y, b, h)           det, kortet spoerger om
   T.valgRamme(ctx, k, farve)            elevens valg (blaa), forkert (roed)
   T.skilt(ctx, x, y, tekst)             et gult skilt med pil ned mod (x, y)
   T.billedtekst(ctx, x, y, tekst)       navnet under et molekyle
   T.enzym(ctx, x, y, r, vinkel)         et enzym med en lomme mod vinkel
   T.triiodid(ctx, x, y, r)              en triiodidion, I₃⁻ (tre lilla kugler)
   T.vand(ctx, x, y, f, alfa)            et vandmolekyle, der fraspaltes
   T.lup(ctx, ...)                       en lup med lys bund og streger
   T.kartoffel, T.vat, T.skaal, T.plet   proeverne og draaben paa dem
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
    T.ENZYM = "#2f8f83";       /* enzymerne: blaagroen */
    T.IOD = "#7b3fb8";         /* triiodidionerne: lilla som i bogens figur */
    T.BRUN = "#b46a1f";        /* kaeden mellem sekskanterne */
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

    /* ----- Et enzym: en blaagroen klump med en lomme, der vender mod vinkel ----------
       Lommen er det aktive center, hvor en glykosidbinding passer ind. */
    T.enzym = function (ctx, x, y, r, vinkel, opt) {
        opt = opt || {};
        var a = opt.alfa === undefined ? 1 : opt.alfa;
        if (a < 0.01) return;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(x, y);
        ctx.rotate(vinkel || 0);
        var aab = 0.42 * (opt.mund === undefined ? 1 : opt.mund);
        ctx.beginPath();
        ctx.moveTo(r * 0.35, 0);
        ctx.arc(0, 0, r, aab, Math.PI * 2 - aab);
        ctx.closePath();
        var g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1);
        g.addColorStop(0, "#9fe0d6");
        g.addColorStop(0.55, T.ENZYM);
        g.addColorStop(1, "#1d5f57");
        ctx.fillStyle = g;
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = r * 0.4;
        ctx.shadowOffsetY = r * 0.12;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#174e48";
        ctx.lineWidth = Math.max(1, r * 0.09);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- En triiodidion, I₃⁻: tre lilla kugler paa en linje og et minus -------------- */
    T.triiodid = function (ctx, x, y, r, opt) {
        opt = opt || {};
        var a = opt.alfa === undefined ? 1 : opt.alfa, v = opt.vinkel || 0;
        if (a < 0.01) return;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(x, y);
        ctx.rotate(v);
        [-1, 0, 1].forEach(function (k) {
            var cx = k * r * 1.55;
            var g = ctx.createRadialGradient(cx - r * 0.35, -r * 0.35, r * 0.1, cx, 0, r);
            g.addColorStop(0, "#e2c8ff");
            g.addColorStop(0.6, "#9b5fd6");
            g.addColorStop(1, "#5b2a91");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, 0, r, 0, Math.PI * 2); ctx.fill();
        });
        if (opt.minus !== false) {
            ctx.rotate(-v);
            ctx.strokeStyle = "#4b1f7a";
            ctx.lineWidth = Math.max(1.4, r * 0.32);
            ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 1.75); ctx.lineTo(r * 0.45, -r * 1.75); ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Et vandmolekyle, der fraspaltes (H₂O i blaat) ------------------------------- */
    T.vand = function (ctx, x, y, f, alfa) {
        if (alfa < 0.01) return;
        ctx.save();
        ctx.globalAlpha = alfa;
        var t = "H₂O";
        ctx.font = "700 " + f + "px " + FONT;
        var b = ctx.measureText("HO").width + ctx.measureText("2").width * 0.7 + 12, h = f * 1.35;
        ctx.fillStyle = "rgba(225, 238, 252, 0.95)";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = "#5b8fd1";
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.restore();
        if (NK.Enhed) {
            ctx.save();
            ctx.globalAlpha = alfa;
            NK.Enhed.gruppe(ctx, t, 2, x + f * 0.28, y, f, "#1f5fae", true, "700");
            ctx.restore();
        }
    };

    /* ----- En lup: en cirkel med lys bund, en ramme og to streger ind mod stedet ------
       Indholdet tegnes af fanen mellem T.lupStart og T.lupSlut (klippet til cirklen). */
    T.lupStart = function (ctx, cx, cy, R, fra) {
        ctx.save();
        if (fra) {
            /* To stiplede streger fra stedet paa proeven ud til luppens kant */
            var dx = cx - fra.x, dy = cy - fra.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
            var nx = -dy / l, ny = dx / l;
            ctx.strokeStyle = "rgba(90, 104, 122, 0.55)";
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            [1, -1].forEach(function (k) {
                ctx.beginPath();
                ctx.moveTo(fra.x + nx * k * 4, fra.y + ny * k * 4);
                ctx.lineTo(cx + nx * k * R * 0.96, cy + ny * k * R * 0.96);
                ctx.stroke();
            });
            ctx.setLineDash([]);
        }
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
        g.addColorStop(0, "#fbfaff");
        g.addColorStop(1, "#e7e6f2");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath(); ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();
    };

    T.lupSlut = function (ctx, cx, cy, R) {
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.strokeStyle = "#5b6878";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(cx, cy, R - 3, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    /* ----- Proeverne ------------------------------------------------------------------- */
    /* En skive kartoffel set lidt fra oven: lys flade og en tynd skal */
    T.kartoffel = function (ctx, x, y, b, h) {
        if (b < 12 || h < 12) return;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath(); ctx.ellipse(x, y + h * 0.06, b / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#b7864e";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath(); ctx.ellipse(x, y, Math.max(1, b / 2 - 3), Math.max(1, h / 2 - 3), 0, 0, Math.PI * 2);
        var g = ctx.createRadialGradient(x - b * 0.15, y - h * 0.2, 2, x, y, b / 2);
        g.addColorStop(0, "#fbf3d6");
        g.addColorStop(1, "#ead9a6");
        ctx.fillStyle = g;
        ctx.fill();
        /* Svage ringe i kartoflens kerne */
        ctx.strokeStyle = "rgba(190, 160, 100, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(x, y, b * 0.3, h * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    /* Vat: en hvid, blød tot */
    T.vat = function (ctx, x, y, b, h) {
        var kl = [[-0.32, 0.1, 0.26], [-0.1, -0.12, 0.3], [0.16, -0.05, 0.28], [0.34, 0.12, 0.22], [0.02, 0.18, 0.28], [-0.24, 0.24, 0.2], [0.22, 0.26, 0.2]];
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#f2f4f7";
        ctx.beginPath();
        kl.forEach(function (k) { ctx.moveTo(x + k[0] * b + k[2] * h, y + k[1] * h); ctx.arc(x + k[0] * b, y + k[1] * h, k[2] * h, 0, Math.PI * 2); });
        ctx.fill();
        ctx.shadowColor = "transparent";
        kl.forEach(function (k) {
            var cx = x + k[0] * b, cy = y + k[1] * h, r = k[2] * h;
            var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r);
            g.addColorStop(0, "#ffffff");
            g.addColorStop(1, "#dfe3ea");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();
    };

    /* En lille skaal set lidt fra oven; indhold "stivelse" (maelkehvid vaeske) eller "vat" */
    T.skaal = function (ctx, x, y, b, h, indhold) {
        if (b < 14 || h < 12) return;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.beginPath(); ctx.ellipse(x, y, b / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#fdfdfd";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#9aa4b1";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath(); ctx.ellipse(x, y + h * 0.04, Math.max(1, b / 2 - 6), Math.max(1, h / 2 - 5), 0, 0, Math.PI * 2);
        var g = ctx.createLinearGradient(0, y - h / 2, 0, y + h / 2);
        g.addColorStop(0, indhold === "stivelse" ? "#f3f1ea" : "#e9f1f7");
        g.addColorStop(1, indhold === "stivelse" ? "#e2ddcf" : "#d6e3ee");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.restore();
        if (indhold === "vat") T.vat(ctx, x, y + h * 0.02, b * 0.62, h * 0.62);
    };

    /* En draabe iodopløsning, der har lagt sig paa proeven */
    T.plet = function (ctx, x, y, r, farve, alfa) {
        if (alfa < 0.01 || r < 1) return;
        ctx.save();
        ctx.globalAlpha = alfa;
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        g.addColorStop(0, farve);
        g.addColorStop(0.75, farve);
        g.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(x, y, r * 1.15, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = alfa * 0.5;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.ellipse(x - r * 0.4, y - r * 0.3, r * 0.28, r * 0.12, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    /* En faldende draabe over proeven */
    T.draabe = function (ctx, x, y, r, farve, alfa) {
        if (alfa < 0.01) return;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.beginPath();
        ctx.moveTo(x, y - r * 1.8);
        ctx.quadraticCurveTo(x + r, y - r * 0.2, x, y + r);
        ctx.quadraticCurveTo(x - r, y - r * 0.2, x, y - r * 1.8);
        ctx.fillStyle = farve;
        ctx.fill();
        ctx.restore();
    };

    /* ----- En bjaelke med et tal (taellerne paa fane 2) --------------------------------- */
    T.bjaelke = function (ctx, x, y, b, h, andel, farve) {
        ctx.save();
        ctx.fillStyle = "rgba(120, 132, 150, 0.16)";
        NK.rundtRekt(ctx, x, y, b, h, h / 2); ctx.fill();
        if (andel > 0) {
            ctx.fillStyle = farve;
            NK.rundtRekt(ctx, x, y, Math.max(h, b * NK.klamp(andel, 0, 1)), h, h / 2); ctx.fill();
        }
        ctx.restore();
    };

    /* Et lille maerke med en tekst (gaet, "1 ende" osv.) */
    T.maerke = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT;
        var b = ctx.measureText(tekst).width + 20 + (opt.tegn ? 18 : 0), h = opt.h || 24;
        var bx = opt.justering === "right" ? x - b : (opt.justering === "center" ? x - b / 2 : x);
        ctx.fillStyle = opt.fyld || "#fff8e1";
        NK.rundtRekt(ctx, bx, y - h / 2, b, h, 7); ctx.fill();
        ctx.strokeStyle = opt.kant || "#d69e0c";
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, tekst, bx + 10, y + 1, { font: (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT, farve: opt.farve || BLAEK, linje: "middle" });
        if (opt.tegn) NK.tekst(ctx, opt.tegn, bx + b - 14, y + 1, { font: "800 15px " + FONT, farve: opt.tegnFarve || BLAEK, justering: "center", linje: "middle" });
        return { x: bx, y: y - h / 2, b: b, h: h };
    };
    NK.Tegning = T;
}());

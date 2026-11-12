/* =====================================================================
   tegning.js - tavlen, rammerne, skiltene, pH-skyderen og formlerne

   Tavlen, rammerne, skiltet, billedteksten og maerket er de samme som i
   sb7.3 Polysaccharider.
   T.tavle(ctx, lay)                     vaeggen, whiteboardet og bakken
   T.gulRamme(ctx, x, y, b, h)           det, kortet spoerger om
   T.valgRamme(ctx, k, farve)            elevens valg (blaa), forkert (roed)
   T.skilt(ctx, x, y, tekst)             et gult skilt med pil ned mod (x, y)
   T.maerke(ctx, x, y, tekst, opt)       et lille maerke (dit gaet)
   T.phSkala(ctx, s, ph, opt)            pH-skyderen fra 0 til 14
   T.formel(ctx, s, x, y, fs, farve, just, vaegt)  tekst med saenkede og
                                         haevede tegn: "pK_s", "A^-", "BH^+"
   T.kugle(ctx, x, y, r, slags, tekst)   et molekyle i luppen (som bogens
                                         b8-membran: uladet graa, A⁻ blaa,
                                         BH⁺ roed og orange i fane 1)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#6b7685";

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;
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

    /* k er en kasse { x, y, w, h } */
    T.valgRamme = function (ctx, k, farve, stiplet) {
        if (!k) return;
        ctx.save();
        NK.rundtRekt(ctx, k.x - 6, k.y - 4, k.w + 12, k.h + 8, 9);
        ctx.fillStyle = farve === T.FORKERT ? "rgba(217, 83, 79, 0.10)" : (farve === "#d69e0c" ? "rgba(242, 197, 61, 0.14)" : "rgba(47, 111, 222, 0.12)");
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2.5;
        if (stiplet) ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
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

    /* Et lille maerke med en tekst (dit gaet) */
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

    /* ----- pH-skyderen ----------------------------------------------------------------
       s = { x, y, b } er sporet: pH 0 ved x og pH 14 ved x + b, midt i hoejden y.
       Sporet har pH-farverne svagt, fra roedt i sur til blaat i basisk. */
    var PH_FARVER = [[0, "#d9483b"], [3, "#ee8a2c"], [5, "#e9c53a"], [7, "#5fb15a"], [9, "#2f8fae"], [11, "#3a5bd0"], [14, "#5b3fae"]];
    T.phTilX = function (s, ph) { return s.x + s.b * NK.klamp(ph, 0, 14) / 14; };
    T.xTilPh = function (s, x) { return NK.klamp((x - s.x) / s.b * 14, 0, 14); };
    T.paaSkala = function (s, pt) {
        if (!s || !pt) return false;
        return pt.x > s.x - 16 && pt.x < s.x + s.b + 16 && pt.y > s.y - 22 && pt.y < s.y + 20;
    };

    T.phSkala = function (ctx, s, ph, opt) {
        opt = opt || {};
        var laast = !!opt.laast, h = 10;
        ctx.save();
        ctx.globalAlpha = laast ? 0.55 : 1;
        var g = ctx.createLinearGradient(s.x, 0, s.x + s.b, 0);
        PH_FARVER.forEach(function (p) { g.addColorStop(p[0] / 14, p[1]); });
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, s.x, s.y - h / 2, s.b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(29, 36, 51, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        /* Tallene under sporet */
        var trin = s.b < 360 ? 2 : 1;
        for (var p = 0; p <= 14; p += trin) {
            var x = T.phTilX(s, p);
            ctx.save();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, s.y + h / 2 + 1); ctx.lineTo(x, s.y + h / 2 + 5); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, String(p), x, s.y + h / 2 + 15, { font: "600 12px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        if (opt.navn !== false && !opt.kompakt) NK.tekst(ctx, "pH", s.x - 14, s.y + 1, { font: "800 14px " + FONT, farve: BLAEK, justering: "right", linje: "middle" });
        /* Knappen med tallet over */
        var kx = T.phTilX(s, ph);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.beginPath(); ctx.arc(kx, s.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = laast ? "#d8dce2" : "#ffffff";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 3;
        ctx.strokeStyle = laast ? "#8b94a2" : (opt.greb ? T.VALG : "#2a3342");
        ctx.stroke();
        ctx.restore();
        var tekst = "pH " + D.komma1(ph);
        ctx.save();
        ctx.font = "800 14px " + FONT;
        var tb = ctx.measureText(tekst).width + 16, th = 23;
        var tx = NK.klamp(kx - tb / 2, s.x - 30, s.x + s.b + 30 - tb), ty = s.y - 21 - th;
        if (opt.kompakt) { tx = s.x - 16 - tb; ty = s.y - th / 2; }
        ctx.fillStyle = laast ? "#6f7886" : "#2a3342";
        NK.rundtRekt(ctx, tx, ty, tb, th, 6);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, tx + tb / 2, ty + th / 2 + 1);
        ctx.restore();
        return { kx: kx };
    };

    /* ----- Et vindue ind i opløsningen (som bogens mo_vindue) -------------------------- */
    T.vindue = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#eef6fb");
        g.addColorStop(1, "#dcebf4");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, b, h, 14);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#5b6878";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Tekst med saenkede og haevede tegn (som sb7.7's M.tekst) -------------
       "pK_s" giver et saenket s, "A^-" et haevet minus. Giver kassen. */
    function dele(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (c === "_" || c === "^") {
                var j = i + 1, run = "";
                if (c === "_") { while (j < s.length && /[0-9a-zA-Z]/.test(s.charAt(j))) { run += s.charAt(j); j++; } }
                else { run = s.charAt(j); j++; }
                ud.push({ t: run.replace("-", "−"), sub: c === "_", sup: c === "^" });
                i = j;
            } else {
                ud.push({ t: c });
                i++;
            }
        }
        return ud;
    }

    T.formel = function (ctx, s, x, y, fs, farve, just, vaegt) {
        var d = dele(String(s)), b = 0, v = vaegt || 700;
        ctx.save();
        d.forEach(function (del) {
            ctx.font = v + " " + (del.sub || del.sup ? fs * 0.68 : fs) + "px " + FONT;
            del.w = ctx.measureText(del.t).width;
            del.x = b;
            b += del.w;
        });
        var x0 = just === "right" ? x - b : (just === "center" ? x - b / 2 : x);
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = farve || BLAEK;
        d.forEach(function (del) {
            ctx.font = v + " " + (del.sub || del.sup ? fs * 0.68 : fs) + "px " + FONT;
            var dy = del.sub ? fs * 0.3 : (del.sup ? -fs * 0.36 : 0);
            ctx.fillText(del.t, x0 + del.x, y + dy + fs * 0.04);
        });
        ctx.restore();
        return { x: x0, y: y - fs * 0.62, w: b, h: fs * 1.24 };
    };

    T.formelBredde = function (ctx, s, fs, vaegt) {
        var b = 0, v = vaegt || 700;
        ctx.save();
        dele(String(s)).forEach(function (del) {
            ctx.font = v + " " + (del.sub || del.sup ? fs * 0.68 : fs) + "px " + FONT;
            b += ctx.measureText(del.t).width;
        });
        ctx.restore();
        return b;
    };

    /* ----- Et molekyle i luppen -------------------------------------------------
       slags: "orange" (fane 1, uden tekst), "uladet" (graa), "anion" (blaa med
       gloed), "kation" (roed med gloed), "ukendt" (graa) og "ukendtIon" (lilla). */
    var KUGLE = {
        orange: { lys: "#fbd08f", midt: "#f0962f", moerk: "#c96a12", kant: "#a5560e", tekst: "#ffffff" },
        uladet: { lys: "#ffffff", midt: "#e3e7ec", moerk: "#a9b3bf", kant: "#7c8794", tekst: "#1d2433" },
        ukendt: { lys: "#ffffff", midt: "#e3e7ec", moerk: "#a9b3bf", kant: "#7c8794", tekst: "#1d2433" },
        anion: { lys: "#9fbdf7", midt: "#3d6fe0", moerk: "#1d4ed8", kant: "#173c9e", tekst: "#ffffff", gloed: "29, 78, 216" },
        kation: { lys: "#f2a79d", midt: "#cf4b3d", moerk: "#a93226", kant: "#7d2218", tekst: "#ffffff", gloed: "169, 50, 38" },
        ukendtIon: { lys: "#cdb3fb", midt: "#8b5cf6", moerk: "#6d28d9", kant: "#4c1d95", tekst: "#ffffff", gloed: "124, 58, 237" }
    };

    T.kugle = function (ctx, x, y, r, slags, tekst, alfa) {
        var k = KUGLE[slags] || KUGLE.uladet, a = alfa === undefined ? 1 : alfa;
        if (a < 0.01) return;
        ctx.save();
        ctx.globalAlpha *= a;
        if (k.gloed) {
            var gl = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 1.75);
            gl.addColorStop(0, "rgba(" + k.gloed + ", 0.32)");
            gl.addColorStop(1, "rgba(" + k.gloed + ", 0)");
            ctx.fillStyle = gl;
            ctx.beginPath(); ctx.arc(x, y, r * 1.75, 0, Math.PI * 2); ctx.fill();
        }
        var g = ctx.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
        g.addColorStop(0, k.lys);
        g.addColorStop(0.55, k.midt);
        g.addColorStop(1, k.moerk);
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = r * 0.35;
        ctx.shadowOffsetY = r * 0.1;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = k.kant;
        ctx.lineWidth = 1.1;
        ctx.stroke();
        ctx.restore();
        if (tekst) {
            ctx.save();
            ctx.globalAlpha *= a;
            var fs = r * 0.8, b = T.formelBredde(ctx, tekst, fs, 800);
            if (b > r * 1.7) fs *= r * 1.7 / b;
            T.formel(ctx, tekst, x, y + 0.5, Math.max(10, fs), k.tekst, "center", 800);
            ctx.restore();
        }
    };

    NK.Tegning = T;
}());

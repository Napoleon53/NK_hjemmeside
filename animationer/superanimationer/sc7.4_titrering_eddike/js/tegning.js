/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet og bordet, stativet, buretten med hanen og skyderen, kolben
   paa magnetomroereren, draaberne, eddikeflasken, keglen hen til luppen
   og smaa skilte. Funktionerne tegner én ting et bestemt sted og husker
   intet selv; fanerne bestemmer, hvor tingene staar.

   En opstilling (T.opstilling) er stativ, burette, kolbe og omroerer
   samlet om én lodret akse. Den bruges af fane 1 (én stor) og fane 3
   (to mindre ved siden af hinanden).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Rummet og bordet (som sc7.2) ----------------------------------------- */
    T.rum = function (ctx, W, H, gulvY) {
        var g = ctx.createLinearGradient(0, 0, 0, gulvY);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1b1d24");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, gulvY);
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, gulvY, W, H - gulvY);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        ctx.fillRect(0, gulvY, W, 2);
    };

    T.bord = function (ctx, x0, x1, y, gulv) {
        var plade = 12;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        var doer = Math.max(120, (x1 - x0) / 6);
        for (var x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, y + plade + 6);
            ctx.lineTo(Math.round(x) + 0.5, gulv);
            ctx.stroke();
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Opstillingen ------------------------------------------------------------
       cx: buretteakse, bordY: bordets overflade, topY: det hoejeste,
       opstillingen maa naa. s: burettens skala (sprite-enheder -> px).
       Kolben er 1,15 og omroereren 1,0 af burettens skala: kolben er
       stoerre end i virkeligheden, fordi det er den, farven skal ses i. */
    var HOEJDE = 870;          /* hele opstillingen i burettens enheder */

    T.opstilling = function (cx, bordY, topY, sMaks) {
        var s = Math.min((bordY - topY) / HOEJDE, sMaks || 1.2);
        var k = s * 1.15, ko = s;
        var mb = MAAL.buret, mk = MAAL.kolbe, mo = MAAL.omroerer;
        var g = { cx: cx, s: s, k: k, ko: ko, bordY: bordY };
        g.omr = { x: cx - mo.b * ko / 2, y: bordY - mo.bund * ko, b: mo.b * ko, h: mo.h * ko };
        g.pladeY = g.omr.y + mo.plade * ko;
        g.kolbe = { x: cx - mk.b * k / 2, y: g.pladeY - 197 * k, k: k };
        g.spids = { x: cx, y: g.kolbe.y + 18 * k };
        g.buret = { x: cx - mb.b * s / 2, y: g.spids.y - mb.spids.y * s, s: s };
        g.hane = { x: cx, y: g.buret.y + mb.hane.y * s };
        g.stang = { x: cx - 64 * s, top: g.buret.y - 14 * s };
        g.klemme = g.buret.y + 150 * s;
        g.bunden = g.buret.y + mb.roerBund * s;
        return g;
    };

    /* Menisken ved et forbrug v (mL): y i pixels */
    T.niveauY = function (g, v) {
        var mb = MAAL.buret;
        return g.buret.y + (mb.nulY + NK.klamp(v, -1.5, 29) * mb.prML) * g.s;
    };

    /* Kolbens vaeskeoverflade ved et rumfang (mL), i pixels. Forenklet:
       1,4 enheder pr. mL fra bunden, saa niveauet kan ses. */
    T.kolbeOverflade = function (g, mL) {
        var mk = MAAL.kolbe;
        var y = Math.max(mk.halsBund - 4, mk.bundY - mL * 1.4);
        return g.kolbe.y + y * g.k;
    };

    /* Stativet: fod, stang og klemmen om buretten */
    T.stativ = function (ctx, g) {
        var s = g.s, x = g.stang.x;
        ctx.save();
        /* Foden */
        ctx.fillStyle = "#3a3f48";
        NK.rundtRekt(ctx, x - 44 * s, g.bordY - 9 * s, 150 * s, 9 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(x - 44 * s, g.bordY - 9 * s, 150 * s, 1.5 * s);
        /* Stangen */
        var sg = ctx.createLinearGradient(x - 4 * s, 0, x + 4 * s, 0);
        sg.addColorStop(0, "#8b939c");
        sg.addColorStop(0.5, "#d3d8dd");
        sg.addColorStop(1, "#7a828b");
        ctx.fillStyle = sg;
        ctx.fillRect(x - 4 * s, g.stang.top, 8 * s, g.bordY - 9 * s - g.stang.top);
        /* Klemmen: muffe paa stangen og en arm hen til buretten */
        var ky = g.klemme;
        ctx.fillStyle = "#4a5059";
        NK.rundtRekt(ctx, x - 9 * s, ky - 9 * s, 18 * s, 18 * s, 3 * s);
        ctx.fill();
        ctx.fillStyle = "#5c636d";
        ctx.fillRect(x + 9 * s, ky - 3.5 * s, g.cx - x - 20 * s, 7 * s);
        ctx.strokeStyle = "#6b737d";
        ctx.lineWidth = 4 * s;
        ctx.beginPath();
        ctx.arc(g.cx, ky, 11 * s, Math.PI * 0.55, Math.PI * 1.45, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(g.cx, ky, 11 * s, Math.PI * 0.6, Math.PI * 1.4, false);
        ctx.stroke();
        ctx.restore();
    };

    /* Buretten med vaesken. v: forbruget (mL, menisken), a: hanens
       aabning 0-1, v.tal: tallene ved inddelingen, v.lys: glorie,
       v.etiket: tekst paa et skilt oeverst (fx "NaOH 0,100 M") */
    T.buret = function (ctx, g, v, a, opt) {
        opt = opt || {};
        var mb = MAAL.buret, s = g.s, x0 = g.buret.x, y0 = g.buret.y;
        var farve = opt.farve || "rgba(150, 196, 236, 0.62)";
        ctx.save();
        if (opt.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * opt.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 + 6 * s, y0, 28 * s, mb.spids.y * s + 4, 8 * s);
            ctx.stroke();
        }
        /* Vaesken fra menisken ned til spidsen */
        var ny = T.niveauY(g, v);
        if (v < K_BURET_TOM()) {
            ctx.fillStyle = farve;
            ctx.fillRect(x0 + mb.indV * s, ny, (mb.indH - mb.indV) * s, (mb.roerBund - (ny - y0) / s) * s);
            ctx.fillRect(x0 + 15.5 * s, y0 + 522 * s, 9 * s, 24 * s);
            ctx.beginPath();
            ctx.moveTo(x0 + 16 * s, y0 + 546 * s);
            ctx.lineTo(x0 + 24 * s, y0 + 546 * s);
            ctx.lineTo(x0 + 21 * s, y0 + 594 * s);
            ctx.lineTo(x0 + 19 * s, y0 + 594 * s);
            ctx.closePath();
            ctx.fill();
            /* Menisken: en tynd bue med bunden ved niveauet */
            ctx.strokeStyle = "rgba(235, 245, 252, 0.9)";
            ctx.lineWidth = Math.max(1, 1.2 * s);
            ctx.beginPath();
            ctx.moveTo(x0 + mb.indV * s, ny - 2.2 * s);
            ctx.quadraticCurveTo(g.cx, ny + 2.2 * s, x0 + mb.indH * s, ny - 2.2 * s);
            ctx.stroke();
        }
        NK.Sprites.tegn(ctx, "buret", x0, y0, mb.b * s, mb.h * s);

        /* Tallene ved de lange streger */
        if (opt.tal !== false) {
            var px = NK.klamp(13 * s, 11, 13);
            for (var m = 0; m <= 25; m += 5) {
                NK.tekst(ctx, String(m), x0 + 31 * s, y0 + (mb.nulY + m * mb.prML) * s, {
                    font: font("700", px), linje: "middle", farve: "#dde3ea", kant: true, kantBredde: 3
                });
            }
        }

        /* Haandtaget paa hanen: vandret er lukket, det drejer op, naar den aabnes */
        var hx = g.hane.x, hy = g.hane.y;
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(-NK.klamp(a, 0, 1) * Math.PI * 0.42);
        ctx.fillStyle = opt.haneLys ? "#5fb3ec" : "#2f7fc0";
        ctx.strokeStyle = "#1d4f78";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, 4 * s, -3.8 * s, 26 * s, 7.6 * s, 3.5 * s);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#d8e6f2";
        ctx.beginPath();
        ctx.arc(0, 0, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Skiltet oeverst */
        if (opt.etiket) {
            var ep = NK.klamp(12.5 * s + 2, 12, 14);
            ctx.font = font("700", ep);
            var eb = ctx.measureText(opt.etiket).width + 12;
            var ex = g.cx - eb / 2, ey = y0 + 60 * s;
            ctx.fillStyle = opt.etiketFarve || "#fbfaf5";
            NK.rundtRekt(ctx, ex, ey, eb, ep + 8, 4);
            ctx.fill();
            ctx.strokeStyle = "#b9b4a2";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(opt.etiket, g.cx, ey + (ep + 8) / 2 + 0.5);
        }
        ctx.restore();
    };

    function K_BURET_TOM() { return 26.5; }

    /* Omroereren */
    T.omroerer = function (ctx, g) {
        NK.Sprites.tegn(ctx, "omroerer", g.omr.x, g.omr.y, g.omr.b, g.omr.h);
    };

    /* Kolbens indre som sti (i pixels), til at klippe vaesken */
    function kolbeIndre(ctx, g) {
        var k = g.k, x = g.kolbe.x, y = g.kolbe.y;
        ctx.beginPath();
        ctx.moveTo(x + 60 * k, y + 4 * k);
        ctx.lineTo(x + 60 * k, y + 62 * k);
        ctx.lineTo(x + 15 * k, y + 180 * k);
        ctx.quadraticCurveTo(x + 13 * k, y + 192 * k, x + 24 * k, y + 192 * k);
        ctx.lineTo(x + 126 * k, y + 192 * k);
        ctx.quadraticCurveTo(x + 137 * k, y + 192 * k, x + 135 * k, y + 180 * k);
        ctx.lineTo(x + 90 * k, y + 62 * k);
        ctx.lineTo(x + 90 * k, y + 4 * k);
        ctx.closePath();
    }

    /* Kolben med vaesken. mL: rumfang, farve: vaeskens farve (css),
       loppe: magnetloppens vinkel, skyer: lyserøde skyer, hvor draaberne
       rammer ([{ x, y, r, a }] i pixels), v.lys: glorie */
    T.kolbe = function (ctx, g, mL, farve, loppe, skyer, opt) {
        opt = opt || {};
        var k = g.k, x = g.kolbe.x, y = g.kolbe.y;
        var ov = T.kolbeOverflade(g, mL);
        ctx.save();
        kolbeIndre(ctx, g);
        ctx.clip();
        if (mL > 0) {
            ctx.fillStyle = farve;
            ctx.fillRect(x, ov, 150 * k, y + 200 * k - ov);
            (skyer || []).forEach(function (sk) {
                var rg = ctx.createRadialGradient(sk.x, sk.y, 0, sk.x, sk.y, sk.r);
                rg.addColorStop(0, "rgba(232, 58, 150, " + (0.75 * sk.a) + ")");
                rg.addColorStop(1, "rgba(232, 58, 150, 0)");
                ctx.fillStyle = rg;
                ctx.fillRect(sk.x - sk.r, Math.max(ov, sk.y - sk.r), sk.r * 2, sk.r * 2);
            });
            ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
            ctx.fillRect(x, ov, 150 * k, Math.max(1, 1.4 * k));
            /* Magnetloppen set fra siden: den drejer rundt */
            var l = 34 * k * Math.max(0.28, Math.abs(Math.cos(loppe || 0)));
            ctx.fillStyle = "#f4f6f8";
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1;
            NK.rundtRekt(ctx, g.cx - l / 2, y + 184 * k, l, 7 * k, 3.5 * k);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        if (opt.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * opt.lys) + ")";
            ctx.lineWidth = 3;
            kolbeIndre(ctx, g);
            ctx.stroke();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "kolbe", x, y, 150 * k, 200 * k);
        return ov;
    };

    /* Draaberne paa vej ned: [{ x, y }] i pixels */
    T.draaber = function (ctx, draaber, g, farve) {
        var r = Math.max(2, 3.2 * g.s);
        ctx.save();
        ctx.fillStyle = farve || "rgba(214, 234, 248, 0.85)";
        draaber.forEach(function (d) {
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, r * 0.85, r * 1.15, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* En sammenhaengende straale fra spidsen ned i vaesken */
    T.straale = function (ctx, g, bundY, styrke) {
        if (styrke <= 0) return;
        ctx.save();
        ctx.strokeStyle = "rgba(214, 234, 248, " + (0.35 + 0.4 * styrke) + ")";
        ctx.lineWidth = Math.max(1.2, (1 + 1.6 * styrke) * g.s);
        ctx.beginPath();
        ctx.moveTo(g.spids.x, g.spids.y);
        ctx.lineTo(g.spids.x, bundY);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Skyderen ved hanen ------------------------------------------------------
       sk = { x0, x1, y }: sporet. a: 0-1. dryp: hvor "dryp" staar.
       v.lys: musen er over den, v.puls: den banker */
    T.skyder = function (ctx, sk, a, dryp, opt) {
        opt = opt || {};
        var px = sk.px || 13;
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "#3a3f4a";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(sk.x0, sk.y);
        ctx.lineTo(sk.x1, sk.y);
        ctx.stroke();
        var kx = sk.x0 + (sk.x1 - sk.x0) * NK.klamp(a, 0, 1);
        if (a > 0) {
            ctx.strokeStyle = "#3d9ee0";
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(sk.x0, sk.y);
            ctx.lineTo(kx, sk.y);
            ctx.stroke();
        }
        /* Maerket ved dryp */
        var dx = sk.x0 + (sk.x1 - sk.x0) * dryp;
        ctx.strokeStyle = "rgba(221, 227, 234, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dx, sk.y + 7);
        ctx.lineTo(dx, sk.y + 11);
        ctx.stroke();
        /* Knappen */
        if (opt.puls) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.6 * opt.puls) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(kx, sk.y, 14 + 4 * opt.puls, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = opt.lys ? "#fff6d6" : "#f2f3f5";
        ctx.strokeStyle = opt.lys ? "#f2c53d" : "#1c1f26";
        ctx.lineWidth = opt.lys ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(kx, sk.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        var f = font("600", px);
        NK.tekst(ctx, "lukket", sk.x0, sk.y + 14, { font: f, justering: "center", linje: "top", farve: a < 0.02 ? "#ffffff" : "#a9b0ba" });
        NK.tekst(ctx, "dryp", dx, sk.y + 14, { font: f, justering: "center", linje: "top", farve: a > 0.02 && a < 0.5 ? "#ffffff" : "#a9b0ba" });
        NK.tekst(ctx, "løb", sk.x1, sk.y + 14, { font: f, justering: "center", linje: "top", farve: a >= 0.5 ? "#ffffff" : "#a9b0ba" });
    };

    /* En knap som en pille med tekst. v.lys, v.puls, v.slukket */
    T.pilleKnap = function (ctx, kn, tekst, opt) {
        opt = opt || {};
        ctx.save();
        if (opt.slukket) ctx.globalAlpha *= 0.4;
        if (opt.puls) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.6 * opt.puls) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, kn.x - 3 - 2 * opt.puls, kn.y - 3 - 2 * opt.puls, kn.b + 6 + 4 * opt.puls, kn.h + 6 + 4 * opt.puls, kn.h / 2 + 4);
            ctx.stroke();
        }
        ctx.fillStyle = opt.lys ? "#3d9ee0" : "#2a76ac";
        ctx.strokeStyle = opt.lys ? "#f2c53d" : "#3d9ee0";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, kn.x, kn.y, kn.b, kn.h, kn.h / 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.font = font("700", kn.px || 13);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, kn.x + kn.b / 2, kn.y + kn.h / 2 + 0.5);
        ctx.restore();
    };

    /* Eddikeflasken med bunden i (cx, bund) og hoejden h. linjer: tekst
       paa etiketten */
    T.eddike = function (ctx, cx, bund, h, linjer, opt) {
        opt = opt || {};
        var m = MAAL.eddike, k = h / m.h, b = m.b * k;
        var x0 = cx - b / 2, y0 = bund - m.bund * k;
        if (opt.lys) {
            ctx.save();
            var gl = ctx.createRadialGradient(cx, bund - h * 0.45, h * 0.1, cx, bund - h * 0.45, h * 0.62);
            gl.addColorStop(0, "rgba(242, 197, 61, " + (0.4 * opt.lys) + ")");
            gl.addColorStop(1, "rgba(242, 197, 61, 0)");
            ctx.fillStyle = gl;
            ctx.fillRect(cx - h * 0.6, bund - h * 1.1, h * 1.2, h * 1.2);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "eddike", x0, y0, b, h);
        var eb = (m.etiketH - m.etiketV) * k;
        var ialt = 0;
        linjer.forEach(function (l) { ialt += l.px * 1.15; });
        var y = y0 + (m.etiketTop + m.etiketBund) / 2 * k - ialt / 2;
        linjer.forEach(function (l) {
            ctx.save();
            ctx.fillStyle = l.farve || "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            NK.passendeSkrift(ctx, l.t, eb * 0.95, l.px, 8, l.vaegt || "700");
            ctx.fillText(l.t, cx, y);
            ctx.restore();
            y += l.px * 1.15;
        });
        return { x: x0, y: y0, b: b, h: h };
    };

    /* Sproejteflasken med dysen i (x, y) og hoejden h */
    T.sproejteflaske = function (ctx, x, y, h) {
        var m = MAAL.sproejteflaske, k = h / m.h;
        NK.Sprites.tegn(ctx, "sproejteflaske", x - m.dyse.x * k, y - m.dyse.y * k, m.b * k, h);
    };

    /* ----- Luppen -------------------------------------------------------------------- */
    /* Kegle fra et lille felt i vaesken hen til luppen (som sc7.2) */
    T.zoomKegle = function (ctx, px, py, cx, cy, R) {
        var dx = cx - px, dy = cy - py, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var a = Math.atan2(dy, dx);
        if (d < R + 4) return;
        ctx.save();
        var g = ctx.createLinearGradient(px, py, cx, cy);
        g.addColorStop(0, "rgba(242, 197, 61, 0.24)");
        g.addColorStop(1, "rgba(242, 197, 61, 0.05)");
        ctx.fillStyle = g;
        var v1 = a - Math.PI / 2, v2 = a + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx + R * Math.cos(v1), cy + R * Math.sin(v1));
        ctx.lineTo(cx + R * Math.cos(v2), cy + R * Math.sin(v2));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.5)";
        ctx.lineWidth = 1.3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx + R * Math.cos(v1), cy + R * Math.sin(v1));
        ctx.moveTo(px, py);
        ctx.lineTo(cx + R * Math.cos(v2), cy + R * Math.sin(v2));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
        ctx.lineWidth = 2;
        ctx.strokeRect(px - 3.5, py - 3.5, 7, 7);
        ctx.restore();
    };

    /* ----- Skilte ----------------------------------------------------------------------
       Et moerkt skilt med tekst, centreret om (x, y). v.farve: tekstens
       farve, v.kant: kantens farve, v.px: skriften */
    T.skilt = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        var px = opt.px || 14;
        ctx.save();
        ctx.font = font(opt.vaegt || "700", px);
        var b = ctx.measureText(tekst).width + 16, h = px + 12;
        ctx.fillStyle = opt.bund || "rgba(20, 20, 28, 0.92)";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 7);
        ctx.fill();
        ctx.strokeStyle = opt.kant || "#4a4a58";
        ctx.lineWidth = opt.kantBredde || 1.2;
        ctx.stroke();
        ctx.fillStyle = opt.farve || "#f2f3f5";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
        return { x: x - b / 2, y: y - h / 2, b: b, h: h };
    };

    NK.Tegn = T;
}());

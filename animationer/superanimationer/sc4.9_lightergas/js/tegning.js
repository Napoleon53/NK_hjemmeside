/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen og vaegten (som sc4.11), lighteren med
   vaesken i tanken, haetten, pinden og gasknappen, flammen, gnisterne
   og brandkuglen, papiret, karret med det omvendte maaleglas i
   stativet, boblerne, luppen, der viser vandet i maaleglasset, og
   soejlerne med alkanerne paa fane 2. Funktionerne tegner én ting et
   bestemt sted og husker intet selv, bortset fra boblerne. Fanerne
   bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var LM = MAAL.lighter;
    var SKRIFT = "'Segoe UI', sans-serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    /* t > 0 blander mod hvid, t < 0 mod sort */
    function nuance(hex, t) {
        var c = rgb(hex), maal = t > 0 ? 255 : 0, a = Math.abs(t);
        return "rgb(" + c.map(function (v) { return Math.round(v + (maal - v) * a); }).join(",") + ")";
    }
    T.nuance = nuance;

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* ----- Rummet, bordet og tavlen (som sc4.11) --------------------------------- */
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
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    T.tavle = function (ctx, r) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, r.x + 5, r.y + 7, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = "#b9bfc8";
        NK.rundtRekt(ctx, r.x - 6, r.y - 6, r.b + 12, r.h + 12, 9);
        ctx.fill();
        var g = ctx.createLinearGradient(r.x, r.y, r.x + r.b, r.y + r.h);
        g.addColorStop(0, "#f7f8fa");
        g.addColorStop(1, "#e7eaee");
        ctx.fillStyle = g;
        ctx.fillRect(r.x, r.y, r.b, r.h);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.moveTo(r.x + r.b * 0.62, r.y);
        ctx.lineTo(r.x + r.b * 0.74, r.y);
        ctx.lineTo(r.x + r.b * 0.56, r.y + r.h);
        ctx.lineTo(r.x + r.b * 0.44, r.y + r.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#9aa1ab";
        ctx.fillRect(r.x - 6, r.y + r.h + 6, r.b + 12, 6);
        ctx.fillStyle = "#2f7ad1";
        NK.rundtRekt(ctx, r.x + r.b * 0.8, r.y + r.h + 2, 30, 5, 2.5);
        ctx.fill();
        ctx.fillStyle = "#c63b2f";
        NK.rundtRekt(ctx, r.x + r.b * 0.8 + 36, r.y + r.h + 2, 30, 5, 2.5);
        ctx.fill();
        ctx.restore();
    };

    /* En lille pil, der hopper over det, der skal bruges nu */
    T.pegepil = function (ctx, x, y, tid) {
        var hop = Math.sin((tid || 0) * 5) * 5;
        ctx.save();
        ctx.fillStyle = "#f2c53d";
        ctx.beginPath();
        ctx.moveTo(x, y + hop);
        ctx.lineTo(x - 9, y - 14 + hop);
        ctx.lineTo(x + 9, y - 14 + hop);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En lille etiket paa bordet under en ting */
    T.etiket = function (ctx, tekst, x, y, px, farve) {
        NK.tekst(ctx, tekst, x, y, { font: font("700", px), justering: "center", linje: "middle", farve: farve || "#c8ced6" });
    };

    /* Et gult skaer bag noget, musen er over */
    T.skaer = function (ctx, x, y, rx, ry, a) {
        ctx.save();
        var g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
        g.addColorStop(0, "rgba(242, 197, 61, " + (a || 0.3) + ")");
        g.addColorStop(1, "rgba(242, 197, 61, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Vaegten (som sc4.11) --------------------------------------------------- */
    T.vaegtHoejde = function (b) { return MAAL.vaegt.h * b / MAAL.vaegt.b; };

    T.vaegt = function (ctx, x, y, b, tekst, v) {
        v = v || {};
        var M = MAAL.vaegt, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, x0 + 6 * k, y0 + 30 * k, b - 12 * k, h - 28 * k, 10 * k);
            ctx.stroke();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vaegt", x0, y0, b, h);
        var dx = x0 + M.dispV * k, dy = y0 + M.dispTop * k, db = (M.dispH - M.dispV) * k, dh = (M.dispBund - M.dispTop) * k;
        ctx.save();
        ctx.fillStyle = "rgba(125, 240, 192, 0.06)";
        ctx.fillRect(dx + 2, dy + 2, db - 4, dh - 4);
        ctx.fillStyle = "#7df0c0";
        ctx.shadowColor = "rgba(125, 240, 192, 0.6)";
        ctx.shadowBlur = 6;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        var px = NK.klamp(dh * 0.72, 12, 30);
        ctx.font = "700 " + px + "px " + DISPLAY;
        var t = tekst || "";
        while (px > 11 && ctx.measureText(t).width > db - 8) { px -= 0.5; ctx.font = "700 " + px + "px " + DISPLAY; }
        ctx.fillText(t, dx + db - 6, dy + dh / 2 + 1);
        ctx.restore();
        return { x: x, y: y0 + M.skaalY * k, b: M.skaalB * k, k: k, top: y0, h: h, disp: { x: dx, y: dy, b: db, h: dh } };
    };

    /* ----- Lighteren ------------------------------------------------------------------
       Geometrien, naar bunden staar i (x, yb), og lighteren er h hoej.
       Alle punkter er i scenens enheder. */
    T.LIGHTER_H = 150;

    T.lighterGeo = function (x, yb, h) {
        var s = h / LM.h, x0 = x - LM.midtX * s, y0 = yb - LM.bund * s;
        function P(u, v) { return { x: x0 + u * s, y: y0 + v * s }; }
        var kn = LM.knap, ha = LM.haette;
        return {
            s: s, x0: x0, y0: y0, x: x, yb: yb, h: h, P: P,
            dyse: P(LM.dyse.x, LM.dyse.y), ring: P(LM.ring.x, LM.ring.y),
            hjul: { x: x0 + LM.hjul.x * s, y: y0 + LM.hjul.y * s, r: LM.hjul.r * s },
            knap: { x0: x0 + kn.x0 * s, x1: x0 + kn.x1 * s, y0: y0 + kn.y0 * s, y1: y0 + kn.y1 * s },
            haette: { x0: x0 + ha.x * s, x1: x0 + (ha.x + ha.b) * s, y0: y0 + ha.y * s, y1: y0 + (ha.y + ha.h) * s },
            krop: { x0: x0 + 4 * s, x1: x0 + 60 * s, y0: y0 + 44 * s, y1: yb }
        };
    };

    /* Pindens spids. Pinden drejer om dysen: fra − (venstre) over forfra
       til + (hoejre). Loeftet sidder den 5 enheder hoejere. */
    T.pindTip = function (g, pind, loeftet) {
        var th = Math.PI * (1 - NK.klamp(pind, 0, 1));
        var u = LM.ring.x + 11 * Math.cos(th);
        var v = LM.ring.y + 1.5 + 2.5 * Math.sin(th) - (loeftet ? 6 : 0);
        return { x: g.x0 + u * g.s, y: g.y0 + v * g.s, r: 4.2 * g.s, th: th };
    };

    /* st: { gas (g butan), vand (g i tanken), film (g paa ydersiden),
       haette, haetteLoeft (enheder), pind, loeftet, knap (0-1),
       koger (0-1), lys (delen, musen er over), tid, nr } */
    T.lighter = function (ctx, g, st) {
        var s = g.s, x0 = g.x0, y0 = g.y0, tk = LM.tank;
        ctx.save();
        if (st.lys === "krop") T.skaer(ctx, g.x, (g.krop.y0 + g.yb) / 2, 46 * s, 90 * s, 0.22);

        /* Tanken: vand nederst (det er tungest), flydende butan over */
        ctx.save();
        NK.rundtRekt(ctx, x0 + tk.x0 * s, y0 + tk.y0 * s, (tk.x1 - tk.x0) * s, (tk.y1 - tk.y0) * s, 9 * s);
        ctx.clip();
        var prML = 14.5, bund = y0 + tk.y1 * s;
        var hv = (st.vand || 0) * prML * s, hb = (st.gas || 0) / 0.58 * prML * s;
        var bx = x0 + tk.x0 * s, bb = (tk.x1 - tk.x0) * s;
        if (hb > 0.3) {
            var gb = ctx.createLinearGradient(bx, 0, bx + bb, 0);
            gb.addColorStop(0, "rgba(250, 244, 205, 0.55)");
            gb.addColorStop(0.5, "rgba(236, 228, 186, 0.36)");
            gb.addColorStop(1, "rgba(214, 205, 160, 0.5)");
            ctx.fillStyle = gb;
            ctx.fillRect(bx, bund - hv - hb, bb, hb + 1);
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillRect(bx, bund - hv - hb, bb, Math.max(1, 1.4 * s));
            /* Butanen koger, naar ventilen er aaben */
            if (st.koger > 0.01) {
                var r = froe(Math.floor((st.tid || 0) * 12) + (st.nr || 0));
                var n = Math.round(4 + 10 * NK.klamp(st.koger, 0, 1));
                ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
                for (var i = 0; i < n; i++) {
                    ctx.beginPath();
                    ctx.arc(bx + (0.15 + 0.7 * r()) * bb, bund - hv - r() * hb, (0.8 + r() * 1.6) * s, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        if (hv > 0.3) {
            ctx.fillStyle = "rgba(70, 145, 225, 0.62)";
            ctx.fillRect(bx, bund - hv, bb, hv + 1);
            ctx.fillStyle = "rgba(190, 225, 255, 0.6)";
            ctx.fillRect(bx, bund - hv, bb, Math.max(1, 1.2 * s));
        }
        ctx.restore();

        NK.Sprites.tegn(ctx, "lighter", x0, y0, LM.b * s, LM.h * s);

        /* Gasknappen under hjulet: den trykkes ned */
        var kn = LM.knap, dy = (st.knap || 0) * 3;
        ctx.fillStyle = "#3a3f47";
        NK.rundtRekt(ctx, x0 + kn.x0 * s, y0 + (kn.y0 + dy) * s, (kn.x1 - kn.x0) * s, (kn.y1 - kn.y0) * s, 2 * s);
        ctx.fill();
        ctx.strokeStyle = "#15171b";
        ctx.lineWidth = Math.max(0.8, s);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        for (var j = 0; j < 5; j++) {
            var xx = x0 + (kn.x0 + 4 + j * 4) * s;
            ctx.moveTo(xx, y0 + (kn.y0 + dy + 1.5) * s);
            ctx.lineTo(xx, y0 + (kn.y1 + dy - 1.5) * s);
        }
        ctx.stroke();
        if (st.lys === "knap") T.skaer(ctx, (g.knap.x0 + g.knap.x1) / 2, (g.knap.y0 + g.knap.y1) / 2, 16 * s, 9 * s, 0.5);
        if (st.lys === "hjul") T.skaer(ctx, g.hjul.x, g.hjul.y, g.hjul.r * 1.8, g.hjul.r * 1.8, 0.5);

        /* Pinden paa justeringsringen (kun uden haette) */
        if (!st.haette) {
            var tip = T.pindTip(g, st.pind, st.loeftet);
            var rx = g.ring.x, ry = g.ring.y + (st.loeftet ? -6 * s : 0);
            if (st.lys === "pind") T.skaer(ctx, tip.x, tip.y, 12 * s, 12 * s, 0.6);
            if (st.loeftet) {
                /* Ringen er loeftet af taenderne: en lille spalte */
                ctx.fillStyle = "rgba(20, 22, 26, 0.9)";
                ctx.fillRect(x0 + 14 * s, y0 + 43 * s, 20 * s, 1.6 * s);
            }
            ctx.strokeStyle = "#b8862b";
            ctx.lineWidth = 2.4 * s;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(rx, ry + 1.5 * s);
            ctx.lineTo(tip.x, tip.y);
            ctx.stroke();
            var gk = ctx.createRadialGradient(tip.x - tip.r * 0.3, tip.y - tip.r * 0.3, tip.r * 0.2, tip.x, tip.y, tip.r);
            gk.addColorStop(0, "#ffe19a");
            gk.addColorStop(1, "#c98f25");
            ctx.fillStyle = gk;
            ctx.beginPath();
            ctx.arc(tip.x, tip.y, tip.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#7a5410";
            ctx.lineWidth = Math.max(0.8, 0.8 * s);
            ctx.stroke();
            /* − og + er stoebt i kraven */
            NK.tekst(ctx, "−", x0 + 10.5 * s, y0 + 51.5 * s, { font: font("800", Math.max(7, 7 * s)), justering: "center", linje: "middle", farve: "rgba(220, 225, 232, 0.7)" });
            NK.tekst(ctx, "+", x0 + 37.5 * s, y0 + 51.5 * s, { font: font("800", Math.max(7, 7 * s)), justering: "center", linje: "middle", farve: "rgba(220, 225, 232, 0.7)" });
        }

        /* Haetten */
        if (st.haette) {
            var hl = st.haetteLoeft || 0;
            if (st.lys === "haette") T.skaer(ctx, (g.haette.x0 + g.haette.x1) / 2, (g.haette.y0 + g.haette.y1) / 2 - hl * s, 20 * s, 22 * s, 0.4);
            NK.Sprites.tegn(ctx, "haette", g.haette.x0, g.haette.y0 - hl * s, LM.haette.b * s, LM.haette.h * s);
        }

        /* Vand paa ydersiden: draaber paa plasten */
        if (st.film > 0.001) {
            var rd = froe(31 + (st.nr || 0));
            var nd = Math.round(NK.klamp(st.film * 110, 3, 16));
            for (var d = 0; d < nd; d++) {
                var dxp = x0 + (8 + rd() * 48) * s, dyp = y0 + (58 + rd() * 110) * s, dr = (1.4 + rd() * 1.8) * s;
                ctx.fillStyle = "rgba(200, 230, 255, 0.75)";
                ctx.beginPath();
                ctx.ellipse(dxp, dyp, dr * 0.8, dr, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.beginPath();
                ctx.arc(dxp - dr * 0.25, dyp - dr * 0.35, dr * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    /* Haetten alene (paa bordet eller i haanden). (x, yb): midten forneden. */
    T.haetteAlene = function (ctx, x, yb, s, lys) {
        var b = LM.haette.b * s, h = LM.haette.h * s;
        if (lys) T.skaer(ctx, x, yb - h / 2, b * 0.8, h * 0.7, 0.4);
        NK.Sprites.tegn(ctx, "haette", x - b / 2, yb - h, b, h);
        return { x0: x - b / 2, x1: x + b / 2, y0: yb - h, y1: yb };
    };

    /* ----- Flammen, gnisterne og brandkuglen ---------------------------------------- */
    /* En flamme fra (x, y) og h op. stik: den brede, larmende udgave */
    T.flamme = function (ctx, x, y, h, tid, stik) {
        var t = tid || 0;
        var fl = 1 + 0.07 * Math.sin(t * 23) + 0.05 * Math.sin(t * 37 + 1.3) + (stik ? 0.08 * Math.sin(t * 51) : 0);
        h *= fl;
        var w = h * (stik ? 0.34 : 0.28);
        var sway = Math.sin(t * 7) * w * 0.12;
        ctx.save();
        var glod = ctx.createRadialGradient(x, y - h * 0.45, 1, x, y - h * 0.45, h * (stik ? 0.95 : 0.8));
        glod.addColorStop(0, "rgba(255, 190, 90, " + (stik ? 0.45 : 0.3) + ")");
        glod.addColorStop(1, "rgba(255, 150, 60, 0)");
        ctx.fillStyle = glod;
        ctx.beginPath();
        ctx.arc(x, y - h * 0.45, h * (stik ? 0.95 : 0.8), 0, Math.PI * 2);
        ctx.fill();
        function tunge(hh, ww, farver) {
            var g = ctx.createLinearGradient(0, y, 0, y - hh);
            farver.forEach(function (f) { g.addColorStop(f[0], f[1]); });
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x, y + ww * 0.15);
            ctx.bezierCurveTo(x - ww, y - hh * 0.05, x - ww * 0.8, y - hh * 0.55, x + sway, y - hh);
            ctx.bezierCurveTo(x + ww * 0.8, y - hh * 0.55, x + ww, y - hh * 0.05, x, y + ww * 0.15);
            ctx.fill();
        }
        tunge(h, w, [[0, "rgba(70, 120, 255, 0.85)"], [0.18, "rgba(255, 170, 60, 0.9)"], [0.7, "rgba(255, 120, 40, 0.75)"], [1, "rgba(255, 90, 30, 0)"]]);
        tunge(h * 0.62, w * 0.55, [[0, "rgba(140, 180, 255, 0.9)"], [0.25, "rgba(255, 240, 170, 0.95)"], [1, "rgba(255, 220, 120, 0)"]]);
        ctx.restore();
    };

    T.gnister = function (ctx, x, y, t, s) {
        var r = froe(Math.floor(t * 30) + 7);
        ctx.save();
        ctx.fillStyle = "#ffd76a";
        for (var i = 0; i < 9; i++) {
            var a = -Math.PI * (0.15 + 0.7 * r()), d = (6 + r() * 20) * s;
            ctx.globalAlpha = 0.5 + 0.5 * r();
            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, (0.8 + r() * 1.2) * s, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Gassen paa bordet antaendes: en flad brandkugle omkring (cx, y). t 0-1,4 s */
    T.wush = function (ctx, cx, y, bredde, t) {
        var u = NK.klamp(t / 1.4, 0, 1);
        var vokse = NK.blod(Math.min(1, t / 0.35));
        var a = u < 0.4 ? 1 : 1 - (u - 0.4) / 0.6;
        var r = froe(3);
        ctx.save();
        ctx.globalAlpha = a;
        for (var i = 0; i < 14; i++) {
            var dx = (r() - 0.5) * bredde * vokse, rr = (30 + r() * 60) * (0.5 + vokse);
            var yy = y - rr * 0.4 - r() * 40 * vokse - t * 50;
            var g = ctx.createRadialGradient(cx + dx, yy, 1, cx + dx, yy, rr);
            g.addColorStop(0, "rgba(255, 240, 180, 0.9)");
            g.addColorStop(0.35, "rgba(255, 160, 50, 0.75)");
            g.addColorStop(0.8, "rgba(210, 70, 20, 0.35)");
            g.addColorStop(1, "rgba(120, 30, 10, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cx + dx, yy, rr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Gas, der siver ud i luften: svage, bølgende streger over dysen */
    T.hvaes = function (ctx, x, y, s, t, styrke) {
        ctx.save();
        ctx.strokeStyle = "rgba(220, 235, 250, " + (0.16 + 0.2 * NK.klamp(styrke, 0, 1)).toFixed(3) + ")";
        ctx.lineWidth = 1.4;
        for (var i = 0; i < 3; i++) {
            ctx.beginPath();
            for (var k = 0; k <= 12; k++) {
                var yy = y - k * 4 * s, xx = x + (i - 1) * 5 * s + Math.sin(t * 9 + k * 0.8 + i) * 3 * s * (1 + k * 0.1);
                if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Papiret: en rulle koekkenrulle og et ark foran den --------------------------
       (x, y): arkets midte paa bordet. b: arkets bredde. vaad: 0-1 */
    T.papir = function (ctx, x, y, b, vaad, lys) {
        var rx = x + b * 0.18, rb = b * 0.5, rh = b * 0.86;
        ctx.save();
        /* Rullen */
        var gr = ctx.createLinearGradient(rx - rb / 2, 0, rx + rb / 2, 0);
        gr.addColorStop(0, "#c9c4b6");
        gr.addColorStop(0.35, "#fbfaf5");
        gr.addColorStop(1, "#bdb7a8");
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(rx, y, rb * 0.55, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = gr;
        ctx.fillRect(rx - rb / 2, y - rh, rb, rh);
        ctx.strokeStyle = "rgba(160, 150, 130, 0.5)";
        ctx.lineWidth = 1;
        for (var i = 1; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(rx - rb / 2, y - rh * i / 6);
            ctx.lineTo(rx + rb / 2, y - rh * i / 6);
            ctx.stroke();
        }
        ctx.fillStyle = "#eeebe2";
        ctx.beginPath();
        ctx.ellipse(rx, y - rh, rb / 2, rb * 0.16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b48a57";
        ctx.beginPath();
        ctx.ellipse(rx, y - rh, rb * 0.17, rb * 0.06, 0, 0, Math.PI * 2);
        ctx.fill();
        /* Arket paa bordet */
        if (lys) T.skaer(ctx, x, y - 8, b * 0.7, 26, 0.35);
        ctx.fillStyle = "#f7f5ef";
        ctx.beginPath();
        ctx.moveTo(x - b / 2, y);
        ctx.lineTo(x - b / 2 + 6, y - 5);
        ctx.lineTo(x - 8, y - 6);
        ctx.lineTo(x + 6, y - 4);
        ctx.lineTo(x + b / 2 - 4, y - 6);
        ctx.lineTo(x + b / 2, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#cfc9ba";
        ctx.stroke();
        if (vaad > 0.01) {
            ctx.fillStyle = "rgba(150, 175, 200, " + (0.55 * NK.klamp(vaad, 0, 1)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.ellipse(x - 4, y - 3, b * 0.24, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
        return { x0: x - b / 2, x1: x + b / 2, rulle: { x0: rx - rb / 2, x1: rx + rb / 2, y0: y - rh, y1: y } };
    };

    /* ----- Karret, maaleglasset og stativet ------------------------------------------------
       (cx, bordY): karrets midte paa bordet. sk: skalaen (1 paa fane 1).
       glasMaks: 250 eller 500 mL (maaleglasset er det samme, inddelingen
       ikke). */
    var KM = MAAL.kar, GM = MAAL.maaleglas, SM = MAAL.stativ;
    T.opstillingGeo = function (cx, bordY, sk, glasMaks) {
        var maks = glasMaks || 250;
        var ks = 300 / 320 * sk;
        var kar = { s: ks, x0: cx - KM.b / 2 * ks, y0: bordY - KM.bund * ks, b: KM.b * ks, h: KM.h * ks };
        kar.ind0 = kar.x0 + KM.ind0 * ks;
        kar.ind1 = kar.x0 + KM.ind1 * ks;
        kar.top = kar.y0 + KM.indTop * ks;
        kar.bund = kar.y0 + KM.indBund * ks;
        var vandY = kar.y0 + KM.vand * ks;
        var lh = T.LIGHTER_H * sk;
        var plads = { x: cx, yb: kar.bund - 2 * sk };
        var dyseY = plads.yb - (LM.bund - LM.dyse.y) * lh / LM.h;
        var mund = dyseY - 22 * sk;
        var gs = sk;
        var prML = GM.prML * 250 / maks;
        var glas = { s: gs, x0: cx - GM.b / 2 * gs, y0: mund - GM.mund * gs, b: GM.b * gs, h: GM.h * gs, cx: cx, mund: mund,
                     maks: maks, prML: prML };
        glas.ind0 = glas.x0 + GM.ind0 * gs;
        glas.ind1 = glas.x0 + GM.ind1 * gs;
        glas.top = glas.y0 + GM.top * gs;
        glas.kap = (GM.mund - GM.top) / prML;
        glas.yV = function (V) { return glas.y0 + (GM.top + prML * NK.klamp(V, 0, glas.kap)) * gs; };
        var stativ = { s: sk, x0: cx - SM.klemX * sk, y0: bordY - SM.bund * sk, b: SM.b * sk, h: SM.h * sk };
        return { cx: cx, bordY: bordY, sk: sk, kar: kar, vandY: vandY, glas: glas, stativ: stativ, plads: plads, lh: lh };
    };

    /* Maaleglasset med vand og gas og stativet. st: { V (mL gas), lys } */
    T.opstillingBag = function (ctx, geo, st) {
        var g = geo.glas, s = g.s;
        var yi = g.yV(st.V || 0);
        ctx.save();
        if (st.lys) T.skaer(ctx, g.cx, (g.top + g.mund) / 2, 60 * s, 170 * s, 0.22);
        /* Vandsoejlen i glasset og gassen over den */
        ctx.fillStyle = "rgba(8, 12, 20, 0.35)";
        ctx.fillRect(g.ind0, g.top, g.ind1 - g.ind0, yi - g.top);
        var gv = ctx.createLinearGradient(g.ind0, 0, g.ind1, 0);
        gv.addColorStop(0, "rgba(70, 145, 215, 0.72)");
        gv.addColorStop(0.5, "rgba(95, 165, 230, 0.55)");
        gv.addColorStop(1, "rgba(60, 130, 200, 0.72)");
        ctx.fillStyle = gv;
        ctx.fillRect(g.ind0, yi, g.ind1 - g.ind0, g.mund - yi);
        /* Menisken: vandet kryber op ad glasset */
        if (st.V > 0.3) {
            ctx.strokeStyle = "rgba(220, 240, 255, 0.95)";
            ctx.lineWidth = Math.max(1.4, 1.8 * s);
            ctx.beginPath();
            ctx.moveTo(g.ind0, yi - 3 * s);
            ctx.quadraticCurveTo(g.ind0 + 6 * s, yi, g.cx, yi);
            ctx.quadraticCurveTo(g.ind1 - 6 * s, yi, g.ind1, yi - 3 * s);
            ctx.stroke();
        }
        NK.Sprites.tegn(ctx, "maaleglas", g.x0, g.y0, g.b, g.h);
        /* Inddelingen: en kort streg for hver 10 mL, en lang og et tal for hver 50 */
        var trin = g.maks > 250 ? 20 : 10, stor = g.maks > 250 ? 100 : 50;
        ctx.strokeStyle = "rgba(238, 246, 252, 0.8)";
        ctx.lineWidth = Math.max(0.8, 1 * s);
        ctx.beginPath();
        for (var V = 0; V <= g.maks; V += trin) {
            var y = g.yV(V), lang = V % stor === 0;
            ctx.moveTo(g.ind0 + 1, y);
            ctx.lineTo(g.ind0 + (lang ? 16 : 8) * s, y);
        }
        ctx.stroke();
        var px = Math.max(11, 13 * s);
        for (V = stor; V <= g.maks; V += stor) {
            NK.tekst(ctx, String(V), g.ind0 + 19 * s, g.yV(V), { font: font("700", px), linje: "middle", farve: "rgba(238, 246, 252, 0.85)" });
        }
        NK.tekst(ctx, "mL", g.ind0 + 19 * s, g.yV(0) + 9 * s, { font: font("700", px * 0.85), linje: "middle", farve: "rgba(238, 246, 252, 0.7)" });
        /* Stativet: klemmen ligger foran glasset */
        NK.Sprites.tegn(ctx, "stativ", geo.stativ.x0, geo.stativ.y0, geo.stativ.b, geo.stativ.h);
        ctx.restore();
        return { yi: yi };
    };

    /* Vandet i karret og karret selv (oven paa det, der staar i vandet) */
    T.opstillingFor = function (ctx, geo, st) {
        var k = geo.kar, g = geo.glas;
        ctx.save();
        var gv = ctx.createLinearGradient(0, geo.vandY, 0, k.bund);
        gv.addColorStop(0, "rgba(110, 175, 235, 0.3)");
        gv.addColorStop(1, "rgba(70, 140, 210, 0.4)");
        ctx.fillStyle = gv;
        /* Vaeggene haelder lidt: fra (8, 10) til (14, 232) i filens enheder */
        function P(u, w) { return [k.x0 + u * k.s, k.y0 + w * k.s]; }
        var vv = (geo.vandY - k.y0) / k.s, ind = 8 + (vv - 10) / 222 * 6;
        var a = P(ind, vv), b = P(320 - ind, vv), c = P(306, 232), c2 = P(306, 240), d = P(296, 240), e = P(24, 240), e2 = P(14, 240), f = P(14, 232);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.quadraticCurveTo(c2[0], c2[1], d[0], d[1]);
        ctx.lineTo(e[0], e[1]);
        ctx.quadraticCurveTo(e2[0], e2[1], f[0], f[1]);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(220, 240, 255, 0.5)";
        ctx.fillRect(a[0], geo.vandY, b[0] - a[0], Math.max(1.2, 1.5 * k.s));
        /* Gassen i glasset, naar den er naaet ned under vandoverfladen */
        var yi = g.yV(st.V || 0);
        if (yi > geo.vandY) {
            ctx.fillStyle = "rgba(20, 30, 40, 0.18)";
            ctx.fillRect(g.ind0, geo.vandY, g.ind1 - g.ind0, yi - geo.vandY);
        }
        NK.Sprites.tegn(ctx, "kar", k.x0, k.y0, k.b, k.h);
        if (st.maal) {
            /* Stedet, lighteren skal hen, lyser, mens den holdes */
            var p = geo.plads, lh = geo.lh;
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.35 * Math.sin((st.tid || 0) * 6)) + ")";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            NK.rundtRekt(ctx, p.x - 34 * geo.sk, p.yb - lh - 6 * geo.sk, 68 * geo.sk, lh + 8 * geo.sk, 8);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    };

    /* ----- Boblerne i karret ------------------------------------------------------------
       o: { flow (mL/s), fang (0-1), kilde {x, y}, fri (lighteren staar ikke
       under glasset), mund {x, y, halv}, niveau (vandet i glasset),
       overflade (vandet i karret), sk } */
    function Bobler(nr) {
        this.b = [];
        this.ringe = [];
        this.r = froe(nr || 1);
        this.akku = 0;
    }
    Bobler.prototype.opdater = function (dt, o) {
        var mig = this, r = this.r;
        if (o.flow > 0) {
            this.akku += dt * Math.min(46, 6 + o.flow * 0.45);
            while (this.akku >= 1) {
                this.akku -= 1;
                var inde = !o.fri && r() < o.fang;
                var dx;
                if (o.fri) dx = (r() - 0.5) * 8;
                else if (inde) dx = (r() - 0.5) * o.mund.halv * 1.1;
                else dx = (r() < 0.5 ? -1 : 1) * (o.mund.halv + (6 + r() * 26) * o.sk);
                this.b.push({ x: o.kilde.x + (r() - 0.5) * 3, y: o.kilde.y, tx: o.kilde.x + dx,
                              rad: (1.6 + Math.min(4.5, o.flow / 32) * (0.4 + r() * 0.6)) * o.sk,
                              v: (70 + o.flow * 0.5 + r() * 30) * o.sk, inde: inde, f: r() * 6 });
            }
        }
        this.b.forEach(function (q) {
            q.y -= q.v * dt;
            q.x += (q.tx - q.x) * Math.min(1, dt * 5) + Math.sin(q.y * 0.12 + q.f) * 0.25;
            if (q.inde) {
                if (q.y <= o.niveau) q.ude = true;
            } else if (q.y <= o.overflade) {
                q.ude = true;
                if (mig.ringe.length < 30) mig.ringe.push({ x: q.x, y: o.overflade, t: 0, r: q.rad });
            }
        });
        this.b = this.b.filter(function (q) { return !q.ude; });
        if (this.b.length > 220) this.b.splice(0, this.b.length - 220);
        this.ringe.forEach(function (q) { q.t += dt; });
        this.ringe = this.ringe.filter(function (q) { return q.t < 0.6; });
    };
    Bobler.prototype.tegn = function (ctx) {
        ctx.save();
        ctx.lineWidth = 1;
        this.b.forEach(function (q) {
            ctx.fillStyle = "rgba(235, 245, 255, 0.22)";
            ctx.strokeStyle = "rgba(235, 245, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.rad, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        this.ringe.forEach(function (q) {
            ctx.strokeStyle = "rgba(235, 245, 255, " + (0.6 * (1 - q.t / 0.6)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.ellipse(q.x, q.y, q.r + q.t * 18, 1.5 + q.t * 2, 0, 0, Math.PI * 2);
            ctx.stroke();
        });
        ctx.restore();
    };
    Bobler.prototype.antal = function () { return this.b.length; };
    NK.Bobler = Bobler;

    /* ----- Luppen: maaleglasset ved vandoverfladen, 3,2 gange stoerre ----------------------
       Stregerne er for hver 2 mL, tallene for hver 10 mL. Aflaesningen er
       bunden af menisken, midt i glasset. */
    T.lupV = function (ctx, geo, V, cx, cy, r, v) {
        v = v || {};
        var g = geo.glas;
        var mag = 3.2 * r / 90 / g.s;
        var yi = g.yV(V);
        function X(x) { return cx + (x - g.cx) * mag; }
        function Y(y) { return cy + (y - yi) * mag; }
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 5, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#1b1d24";
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        var x0 = X(g.ind0), x1 = X(g.ind1);
        /* Gassen og vandet */
        ctx.fillStyle = "#26303a";
        ctx.fillRect(x0, cy - r, x1 - x0, r + 1);
        var gv = ctx.createLinearGradient(x0, 0, x1, 0);
        gv.addColorStop(0, "#3f7fb8");
        gv.addColorStop(0.5, "#4f93cc");
        gv.addColorStop(1, "#3f7fb8");
        ctx.fillStyle = gv;
        var kurve = 7 * r / 90;
        ctx.beginPath();
        ctx.moveTo(x0, cy - kurve * 1.4);
        ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.16, cy, (x0 + x1) / 2, cy);
        ctx.quadraticCurveTo(x1 - (x1 - x0) * 0.16, cy, x1, cy - kurve * 1.4);
        ctx.lineTo(x1, cy + r);
        ctx.lineTo(x0, cy + r);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 240, 255, 0.9)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x0, cy - kurve * 1.4);
        ctx.quadraticCurveTo(x0 + (x1 - x0) * 0.16, cy, (x0 + x1) / 2, cy);
        ctx.quadraticCurveTo(x1 - (x1 - x0) * 0.16, cy, x1, cy - kurve * 1.4);
        ctx.stroke();
        /* Glassets vaegge */
        ctx.fillStyle = "rgba(220, 236, 250, 0.35)";
        ctx.fillRect(x0 - 5, cy - r, 5, 2 * r);
        ctx.fillRect(x1, cy - r, 5, 2 * r);
        /* Stregerne og tallene */
        var fra = Math.floor((V - r / (g.prML * g.s * mag)) / 2) * 2, til = V + r / (g.prML * g.s * mag);
        var px = NK.klamp(15 * r / 90, 13, 17);
        ctx.strokeStyle = "rgba(245, 250, 255, 0.95)";
        ctx.lineWidth = 1.4;
        for (var m = Math.max(0, fra); m <= Math.min(g.maks, til); m += 2) {
            var y = Y(g.yV(m)), lang = m % 10 === 0;
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x0 + (lang ? 34 : 18) * r / 90, y);
            ctx.stroke();
            if (lang) NK.tekst(ctx, String(m), x0 + 40 * r / 90, y, { font: font("800", px), linje: "middle", farve: "#ffffff",
                kant: true, kantFarve: "rgba(20, 30, 40, 0.8)", kantBredde: 3 });
        }
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.9)" : "#c9d3de";
        ctx.lineWidth = Math.max(4, 6 * r / 120);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
        ctx.stroke();
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 12, { font: font("700", NK.klamp(15 * r / 90, 13, 16)), justering: "center", farve: "#dfe6ee" });
        ctx.restore();
    };

    /* En stiplet linje fra et punkt til luppen */
    T.lupLinje = function (ctx, x0, y0, x1, y1) {
        ctx.save();
        ctx.strokeStyle = "rgba(223, 230, 238, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(223, 230, 238, 0.5)";
        ctx.beginPath();
        ctx.arc(x0, y0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Fane 2: soejlerne med de fem alkaner ------------------------------------------
       r: rektanglet. o: { M (elevens) eller null, valgt, rigtig, lys,
       aktiv, tid }. Giver soejlernes rektangler, saa de kan klikkes. */
    T.soejler = function (ctx, r, o) {
        var D = NK.Data, n = D.ALKANER.length, MAKS = 80;
        var bundY = r.y + r.h - 44, topY = r.y + 26, hh = bundY - topY;
        var felt = r.b / n, sb = Math.min(76, felt * 0.5);
        var ud = [];
        ctx.save();
        /* Aksen */
        ctx.strokeStyle = "rgba(223, 230, 238, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(r.x, bundY);
        ctx.lineTo(r.x + r.b, bundY);
        ctx.stroke();
        var px = NK.klamp(felt * 0.13, 13, 16);
        D.ALKANER.forEach(function (a, i) {
            var M = a.M / 100, x = r.x + felt * (i + 0.5), h = hh * M / MAKS;
            var valgt = o.valgt === i, rigtig = o.rigtig === i, lys = o.aktiv && o.lys === i;
            var farve = rigtig ? "#3fae72" : (valgt ? "#e05446" : (lys ? "#5cb3ee" : "#7b8591"));
            if (lys) T.skaer(ctx, x, bundY - h / 2, sb, h / 2 + 20, 0.35);
            var g = ctx.createLinearGradient(x - sb / 2, 0, x + sb / 2, 0);
            g.addColorStop(0, nuance(farve, 0.2));
            g.addColorStop(1, nuance(farve, -0.2));
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, x - sb / 2, bundY - h, sb, h, 5);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(x - sb / 2 + 4, bundY - h + 4, 4, Math.max(0, h - 8));
            NK.tekst(ctx, NK.komma(a.M), x, bundY - h - 10, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
            NK.tekst(ctx, NK.formel(a.formel), x, bundY + 17, { font: font("800", px + 1), justering: "center", linje: "middle", farve: "#eef2f6" });
            NK.tekst(ctx, a.navn, x, bundY + 35, { font: font("600", px - 1), justering: "center", linje: "middle", farve: "#aab3bf" });
            ud.push({ i: i, x0: x - felt / 2, x1: x + felt / 2, y0: topY - 20, y1: bundY + 44 });
        });
        NK.tekst(ctx, "g/mol", r.x, topY - 8, { font: font("700", 13), farve: "#8f98a4" });
        /* Elevens egen molarmasse som en stiplet linje */
        if (o.M !== null && o.M !== undefined && isFinite(o.M)) {
            var yM = bundY - hh * NK.klamp(o.M, 0, MAKS * 1.1) / MAKS;
            ctx.strokeStyle = "#f2c53d";
            ctx.lineWidth = 2;
            ctx.setLineDash([7, 5]);
            ctx.beginPath();
            ctx.moveTo(r.x, yM);
            ctx.lineTo(r.x + r.b, yM);
            ctx.stroke();
            ctx.setLineDash([]);
            var tekst = "M(gas) = " + NK.betydende(o.M, 3) + " g/mol";
            ctx.font = font("800", px);
            var tb = ctx.measureText(tekst).width + 14;
            ctx.fillStyle = "#f2c53d";
            NK.rundtRekt(ctx, r.x, yM - px - 8, tb, px + 8, 4);
            ctx.fill();
            NK.tekst(ctx, tekst, r.x + 7, yM - 4 - px / 2, { font: font("800", px), linje: "middle", farve: "#1b1b21" });
        }
        ctx.restore();
        return ud;
    };

    /* ----- Fane 3: bogstav og termometer ------------------------------------------------ */
    T.maerke = function (ctx, x, y, r, tekst, farve) {
        ctx.save();
        ctx.fillStyle = farve;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
        NK.tekst(ctx, tekst, x, y + 1, { font: font("800", r * 1.15), justering: "center", linje: "middle", farve: "#ffffff" });
        ctx.restore();
    };

    T.termometer = function (ctx, x, y, h, tC, px) {
        ctx.save();
        var b = Math.max(8, h * 0.11), top = y - h;
        ctx.fillStyle = "rgba(230, 240, 250, 0.25)";
        NK.rundtRekt(ctx, x - b / 2, top, b, h, b / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 240, 250, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        var fyld = (h - b) * NK.klamp((tC + 10) / 60, 0, 1);
        ctx.fillStyle = "#e05446";
        ctx.fillRect(x - b * 0.18, y - b * 0.5 - fyld, b * 0.36, fyld);
        ctx.beginPath();
        ctx.arc(x, y - b * 0.4, b * 0.55, 0, Math.PI * 2);
        ctx.fill();
        NK.tekst(ctx, tC + " °C", x + b + 4, top + 10, { font: font("800", px || 14), linje: "middle", farve: tC > 25 ? "#f5a38f" : "#dfe6ee" });
        ctx.restore();
    };

    NK.Tegn = T;
}());

/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, karret med hanerne og vasken, krukken,
   vaegten, maalekolben, pipetten, baegerglasset, flasken, spatlen og
   zoomvinduet med ionerne. Funktionerne tegner én ting et bestemt sted
   og husker intet selv; fanerne bestemmer, hvor tingene staar, og
   hvordan de bevaeger sig. Krukken, vaegten og vejebaaden er tegnet som
   i sc4.5.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
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

    function rgba(hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }
    T.rgba = rgba;

    function lys(hex) {
        var c = rgb(hex);
        return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 150;
    }
    T.lys = lys;

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* Opløsningens farve: vand, der bliver mere farvet, jo hoejere c er.
       Farveløse stoffer ser ud som vand. */
    var VAND = [176, 212, 240];
    T.vaeske = function (st, c) {
        if (!st || !st.opl || !(c > 0)) return "rgba(" + VAND.join(",") + ",0.22)";
        var t = Math.pow(NK.klamp(c / st.cFuld, 0, 1), 0.6);
        var f = rgb(st.opl);
        var m = VAND.map(function (v, i) { return Math.round(v + (f[i] - v) * t); });
        return "rgba(" + m.join(",") + "," + (0.24 + 0.62 * t).toFixed(3) + ")";
    };

    /* ----- Rummet, bordet og tavlen (som sc4.5) ------------------------------------ */
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

    /* En ring, der viser, at noget kan klikkes paa */
    T.ring = function (ctx, x, y, r, styrke) {
        if (!styrke) return;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.5 * styrke) + ")";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Krukken med stoffet (som sc4.5) --------------------------------------------
       (x, y): midten af bunden, h: hoejden. v.linje3 er den nederste linje
       paa etiketten (standard: molarmassen). v.lys: musen er over den. */
    T.krukkeBredde = function (h) { return h * MAAL.pulverglas.b / MAAL.pulverglas.h; };

    T.krukke = function (ctx, x, y, h, st, v) {
        v = v || {};
        var M = MAAL.pulverglas, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.46, Math.max(2, 4 * k), 0, 0, Math.PI * 2);
        ctx.fill();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.5 * v.lys) + ")";
            ctx.lineWidth = Math.max(2, 3 * k);
            NK.rundtRekt(ctx, x0 + 2 * k, y0 - 3 * k, b - 4 * k, h + 5 * k, 14 * k);
            ctx.stroke();
        }
        var iv = x0 + M.indV * k, ih = x0 + M.indH * k, it = y0 + M.indTop * k, ib = y0 + M.indBund * k;
        var fyld = v.fyld === undefined ? 0.62 : v.fyld;
        var top = ib - (ib - it) * fyld;
        ctx.save();
        NK.rundtRekt(ctx, iv, it, ih - iv, ib - it, M.indR * k);
        ctx.clip();
        var g = ctx.createLinearGradient(0, top, 0, ib);
        g.addColorStop(0, nuance(st.pulver, 0.1));
        g.addColorStop(1, nuance(st.pulver, -0.2));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(iv, top + 4 * k);
        ctx.quadraticCurveTo((iv + ih) / 2, top - 5 * k, ih, top + 3 * k);
        ctx.lineTo(ih, ib);
        ctx.lineTo(iv, ib);
        ctx.closePath();
        ctx.fill();
        var r = froe(st.id.length * 13 + st.M % 97);
        for (var i = 0; i < 70; i++) {
            var lyst = r() < 0.5;
            ctx.fillStyle = lyst ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.16)";
            ctx.fillRect(iv + r() * (ih - iv), top + r() * (ib - top), 1.4, 1.4);
        }
        ctx.restore();
        NK.Sprites.tegn(ctx, "pulverglas", x0, y0, b, h);
        var e = { x: x0 + 9 * k, y: y0 + M.etiketTop * k, b: 82 * k, h: (M.etiketBund - M.etiketTop) * k };
        ctx.fillStyle = "#fbfbf7";
        NK.rundtRekt(ctx, e.x, e.y, e.b, e.h, 3 * k);
        ctx.fill();
        if (v.fremhaev) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.45 * v.fremhaev) + ")";
            ctx.fill();
        }
        ctx.strokeStyle = v.fremhaev ? "rgba(242, 197, 61, 0.95)" : "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = v.fremhaev ? 2.5 : 1;
        ctx.stroke();
        ctx.fillStyle = lys(st.pulver) ? "#9aa3ad" : st.pulver;
        ctx.fillRect(e.x + 1, e.y + 1, e.b - 2, Math.max(3, e.h * 0.1));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c1f26";
        var ib2 = e.b * 0.92, t0 = e.y + Math.max(3, e.h * 0.1);
        var rest = e.h - (t0 - e.y);
        NK.passendeSkrift(ctx, st.formel, ib2, NK.klamp(rest * 0.36, 12, 30), 10, "700");
        ctx.fillText(st.formel, e.x + e.b / 2, t0 + rest * 0.25);
        var l3 = v.linje3 !== undefined ? v.linje3 : NK.komma(st.M) + " g/mol";
        NK.passendeSkrift(ctx, st.navn, ib2, NK.klamp(rest * 0.22, 11, 16), 10, "600");
        ctx.fillStyle = "#4a4f5a";
        ctx.fillText(st.navn, e.x + e.b / 2, t0 + rest * (l3 ? 0.56 : 0.68));
        if (l3) {
            NK.passendeSkrift(ctx, l3, ib2, NK.klamp(rest * 0.24, 11, 16), 10, "700");
            ctx.fillStyle = v.linje3Farve || "#1d7a48";
            ctx.fillText(l3, e.x + e.b / 2, t0 + rest * 0.84);
        }
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: e };
    };

    /* ----- Vaegten og pulveret i vejebaaden (som sc4.5) ------------------------------ */
    T.vaegtHoejde = function (b) { return MAAL.vaegt.h * b / MAAL.vaegt.b; };

    T.vaegt = function (ctx, x, y, b, tekst, v) {
        v = v || {};
        var M = MAAL.vaegt, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        NK.Sprites.tegn(ctx, "vaegt", x0, y0, b, h);
        var dx = x0 + M.dispV * k, dy = y0 + M.dispTop * k, db = (M.dispH - M.dispV) * k, dh = (M.dispBund - M.dispTop) * k;
        ctx.save();
        ctx.fillStyle = v.lys ? "rgba(125, 240, 192, " + (0.1 + 0.12 * v.lys) + ")" : "rgba(125, 240, 192, 0.06)";
        ctx.fillRect(dx + 2, dy + 2, db - 4, dh - 4);
        ctx.fillStyle = v.roed ? "#ff9d8f" : "#7df0c0";
        ctx.shadowColor = v.roed ? "rgba(255, 140, 120, 0.6)" : "rgba(125, 240, 192, 0.6)";
        ctx.shadowBlur = 6;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        var px = NK.klamp(dh * 0.62, 10, 30);
        ctx.font = "700 " + px + "px " + DISPLAY;
        var t = tekst || "";
        while (px > 8 && ctx.measureText(t).width > db - 10) { px -= 0.5; ctx.font = "700 " + px + "px " + DISPLAY; }
        ctx.fillText(t, dx + db - 6, dy + dh / 2 + 1);
        ctx.restore();
        return { x: x, y: y0 + M.skaalY * k, b: M.skaalB * k, k: k, top: y0, h: h };
    };

    T.bunke = function (ctx, x, y, bb, st, t, hoejde, nr) {
        var M = MAAL.vejebaad, k = bb / M.b, h = M.h * k;
        var x0 = x - bb / 2, y0 = y - M.bund * k;
        var bundY = y0 + M.indBund * k + 4 * k;
        var tt = Math.sqrt(NK.klamp(t, 0, 1));
        var hh = hoejde * tt;
        var ix0 = x0 + (M.indV + 4) * k, ix1 = x0 + (M.indH - 4) * k;
        var bredde = (ix1 - ix0) * (0.45 + 0.55 * tt);
        var a0 = x - bredde / 2, a1 = x + bredde / 2;
        ctx.save();
        if (hh > 0.5) {
            var g = ctx.createLinearGradient(0, bundY - hh, 0, bundY);
            g.addColorStop(0, nuance(st.pulver, 0.12));
            g.addColorStop(1, nuance(st.pulver, -0.22));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(a0, bundY + 2);
            ctx.quadraticCurveTo(a0 + bredde * 0.18, bundY - hh * 0.55, x - bredde * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(x, bundY - hh * 1.06, x + bredde * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(a1 - bredde * 0.18, bundY - hh * 0.55, a1, bundY + 2);
            ctx.closePath();
            ctx.fill();
            ctx.save();
            ctx.clip();
            var r = froe((nr || 0) + 17);
            for (var i = 0; i < 110; i++) {
                var lyst = r() < 0.45;
                ctx.fillStyle = lyst ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.18)";
                var s = lyst ? 1.3 : 1.8;
                ctx.fillRect(a0 + r() * bredde, bundY - r() * hh * 1.05, s, s);
            }
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vejebaad", x0, y0, bb, h);
        ctx.restore();
    };

    /* En lille bunke pulver (paa spatlen, paa vej ned, paa bunden) */
    T.pulver = function (ctx, x, y, b, h, st, nr) {
        if (b < 1 || h < 0.5) return;
        ctx.save();
        var g = ctx.createLinearGradient(0, y - h, 0, y);
        g.addColorStop(0, nuance(st.pulver, 0.15));
        g.addColorStop(1, nuance(st.pulver, -0.2));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - b / 2, y);
        ctx.quadraticCurveTo(x - b * 0.3, y - h, x, y - h);
        ctx.quadraticCurveTo(x + b * 0.3, y - h, x + b / 2, y);
        ctx.closePath();
        ctx.fill();
        var r = froe((nr || 0) + 5);
        for (var i = 0; i < Math.min(60, b * 0.8); i++) {
            ctx.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.18)";
            ctx.fillRect(x - b * 0.4 + r() * b * 0.8, y - r() * h * 0.9, 1.3, 1.3);
        }
        ctx.restore();
    };

    /* ----- Karret ------------------------------------------------------------------------
       (x, y): venstre side og bunden (bordet). h: hoejden.
       v: { V (liter, det tegnede niveau), farve, fast (mol paa bunden),
            st, lysHan (0-1) }. Giver karrets geometri. */
    T.karGeo = function (x, y, h) {
        var M = MAAL.kar, k = h / M.h, b = M.b * k, y0 = y - h;
        return {
            k: k, x: x, y0: y0, b: b, h: h,
            ind: { x0: x + M.indV * k, x1: x + M.indH * k, top: y0 + M.indTop * k, bund: y0 + M.indBund * k },
            yV: function (VL) { return y0 + (M.indBund - M.prL * VL) * k; },
            tud: { x: x + M.tudX * k, y: y0 + M.tudY * k },
            han: { x: x + M.hanX * k, y: y0 + M.hanY * k, r: 26 * k }
        };
    };

    T.kar = function (ctx, g, v) {
        var M = MAAL.kar, k = g.k, ind = g.ind;
        ctx.save();
        ctx.save();
        NK.rundtRekt(ctx, ind.x0, ind.top - 30 * k, ind.x1 - ind.x0, ind.bund - ind.top + 30 * k, M.indR * k);
        ctx.clip();
        /* Vaesken */
        if (v.V > 0.0005) {
            var ly = g.yV(v.V);
            ctx.fillStyle = v.farve;
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, ind.bund - ly + 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, Math.max(1.5, 2 * k));
            /* Skyer af stof, der endnu ikke er fordelt */
            if (v.skyer) v.skyer.forEach(function (s) {
                var gr = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.r);
                gr.addColorStop(0, rgba(v.st.opl || "#ffffff", 0.5 * s.a));
                gr.addColorStop(1, rgba(v.st.opl || "#ffffff", 0));
                ctx.fillStyle = gr;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        /* Pulver paa bunden */
        if (v.fast > 0.001) {
            var ph = NK.klamp(v.fast * 70, 3, 60) * k;
            var pb = Math.min(ind.x1 - ind.x0 - 10 * k, (80 + v.fast * 120) * k);
            T.pulver(ctx, (ind.x0 + ind.x1) / 2, ind.bund, pb, ph, v.st, 3);
        }
        ctx.restore();
        NK.Sprites.tegn(ctx, "kar", g.x, g.y0, g.b, g.h);
        T.ring(ctx, g.han.x, g.han.y, g.han.r, v.lysHan);
        ctx.restore();
    };

    /* ----- Vandhanen: tegnes, saa tuden staar i (tx, ty). h: hoejden ------------ */
    T.vandhaneGeo = function (tx, ty, h) {
        var M = MAAL.vandhane, k = h / M.h;
        var x0 = tx - M.tudX * k, y0 = ty - M.tudY * k;
        return { k: k, x0: x0, y0: y0, b: M.b * k, h: h, tud: { x: tx, y: ty },
                 knap: { x: x0 + M.knapX * k, y: y0 + M.knapY * k, r: 20 * k } };
    };

    T.vandhane = function (ctx, g, lysKnap) {
        var k = g.k;
        /* Roeret fortsaetter op til loftet */
        if (g.y0 > 0) {
            var gr = ctx.createLinearGradient(g.x0 + 70 * k, 0, g.x0 + 86 * k, 0);
            gr.addColorStop(0, "#76828f");
            gr.addColorStop(0.4, "#eef2f6");
            gr.addColorStop(1, "#8d97a3");
            ctx.fillStyle = gr;
            ctx.fillRect(g.x0 + 70 * k, 0, 16 * k, g.y0 + 2);
        }
        NK.Sprites.tegn(ctx, "vandhane", g.x0, g.y0, g.b, g.h);
        T.ring(ctx, g.knap.x, g.knap.y, g.knap.r, lysKnap);
    };

    /* En vandstraale fra (x, y0) ned til y1 */
    T.straale = function (ctx, x, y0, y1, b, farve, tid) {
        if (y1 <= y0) return;
        ctx.save();
        var g = ctx.createLinearGradient(x - b / 2, 0, x + b / 2, 0);
        g.addColorStop(0, farve || "rgba(170, 215, 250, 0.55)");
        g.addColorStop(0.5, "rgba(230, 245, 255, 0.85)");
        g.addColorStop(1, farve || "rgba(170, 215, 250, 0.55)");
        ctx.fillStyle = g;
        ctx.beginPath();
        var w = Math.sin((tid || 0) * 20) * 0.6;
        ctx.moveTo(x - b / 2, y0);
        ctx.lineTo(x + b / 2, y0);
        ctx.lineTo(x + b * 0.4 + w, y1);
        ctx.lineTo(x - b * 0.4 + w, y1);
        ctx.closePath();
        ctx.fill();
        /* Plask */
        ctx.fillStyle = "rgba(230, 245, 255, 0.6)";
        for (var i = 0; i < 3; i++) {
            var a = (tid * 7 + i * 2.1) % 1;
            ctx.beginPath();
            ctx.arc(x + (i - 1) * b * 0.9 * a, y1 - 3 * a, 1.6, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Vasken: et hul i bordpladen fra x0 til x1 */
    T.vask = function (ctx, x0, x1, y, dybde) {
        ctx.save();
        ctx.fillStyle = "#8a939e";
        NK.rundtRekt(ctx, x0 - 4, y - 3, x1 - x0 + 8, 8, 3);
        ctx.fill();
        var g = ctx.createLinearGradient(0, y, 0, y + dybde);
        g.addColorStop(0, "#4a525c");
        g.addColorStop(1, "#262b31");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0, y + 3);
        ctx.lineTo(x1, y + 3);
        ctx.lineTo(x1 - 6, y + dybde);
        ctx.lineTo(x0 + 6, y + dybde);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#15181c";
        ctx.beginPath();
        ctx.ellipse((x0 + x1) / 2, y + dybde - 5, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Spatlen: bladets midte i (x, y), b er bredden. pulver: 0-1 ------------ */
    T.spatel = function (ctx, x, y, b, vinkel, st, pulver) {
        var M = MAAL.spatel, k = b / M.b;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vinkel || 0);
        NK.Sprites.tegn(ctx, "spatel", -M.bladX * k, -M.bladY * k, b, M.h * k);
        if (pulver > 0.01) T.pulver(ctx, 0, -2 * k, 30 * k, 12 * k * Math.sqrt(pulver), st, 9);
        ctx.restore();
    };

    /* ----- Maalekolben ------------------------------------------------------------------
       (cx, y): midten og bunden. h: hoejden. v: { fyld (0-1 af rumfanget
       op til maerket; over 1 er over maerket), farve, tekst (rumfanget),
       etiket ([linjer] eller null), lys, pulver (mol paa bunden), st }. */
    T.kolbeGeo = function (cx, y, h) {
        var M = MAAL.maalekolbe, k = h / M.h, b = M.b * k;
        var x0 = cx - b / 2, y0 = y - M.bund * k;
        return { k: k, x0: x0, y0: y0, b: b, h: h, cx: cx,
                 hals: { x: cx, y: y0 + M.halsTop * k }, maerke: y0 + M.maerke * k,
                 boble: { x: cx, y: y0 + M.bobleY * k, r: M.bobleR * k }, bund: y0 + M.bundY * k };
    };

    function kolbeNiveau(g, f) {
        var M = MAAL.maalekolbe, k = g.k;
        var yb = M.bundY, yh = M.halsBund, ym = M.maerke;
        var y;
        if (f <= 0.88) y = yb - (yb - yh) * (f / 0.88);
        else y = yh - (yh - ym) * ((f - 0.88) / 0.12);
        return g.y0 + y * k;
    }

    T.kolbe = function (ctx, g, v) {
        var M = MAAL.maalekolbe, k = g.k;
        ctx.save();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.12 * v.lys) + ")";
            ctx.beginPath();
            ctx.arc(g.boble.x, g.boble.y, g.boble.r + 10 * k, 0, Math.PI * 2);
            ctx.fill();
        }
        /* Vaesken, klippet til halsen og boblen */
        if (v.fyld > 0.001 || v.pulver > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(g.x0 + M.halsV * k, g.y0 + M.halsTop * k, (M.halsH - M.halsV) * k, (M.halsBund - M.halsTop + 20) * k);
            ctx.arc(g.boble.x, g.boble.y, g.boble.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.beginPath();
            ctx.rect(g.x0, g.y0, g.b, g.bund - g.y0);
            ctx.clip();
            if (v.fyld > 0.001) {
                var ly = kolbeNiveau(g, v.fyld);
                ctx.fillStyle = v.farve;
                ctx.fillRect(g.x0, ly, g.b, g.bund - ly + 2);
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fillRect(g.x0, ly, g.b, Math.max(1.2, 1.6 * k));
            }
            if (v.pulver > 0) T.pulver(ctx, g.cx, g.bund, g.boble.r * 1.1, NK.klamp(8 * k * v.pulver, 2, 16 * k), v.st, 4);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "maalekolbe", g.x0, g.y0, g.b, g.h);
        /* Rumfanget skrevet paa glasset */
        if (v.tekst) {
            var px = NK.klamp(13 * k, 12, 17);
            NK.tekst(ctx, v.tekst, g.cx, g.y0 + M.tekstY * k, { font: font("700", px), justering: "center", linje: "middle",
                farve: "rgba(238, 246, 252, 0.9)", kant: true, kantFarve: "rgba(10, 14, 20, 0.55)", kantBredde: 3 });
        }
        /* Etiketten, naar opløsningen er faerdig */
        if (v.etiket && v.etiket.length) {
            var eb = g.boble.r * 1.5, eh = NK.klamp(34 * k, 30, 46);
            var ex = g.cx - eb / 2, ey = g.boble.y - g.boble.r * 0.62 - eh / 2;
            ctx.save();
            ctx.translate(g.cx, ey + eh / 2);
            ctx.rotate(-0.03);
            ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
            ctx.fillRect(-eb / 2 + 2, -eh / 2 + 3, eb, eh);
            ctx.fillStyle = "#fbfaf5";
            ctx.fillRect(-eb / 2, -eh / 2, eb, eh);
            ctx.strokeStyle = "#b9b4a2";
            ctx.lineWidth = 1;
            ctx.strokeRect(-eb / 2 + 0.5, -eh / 2 + 0.5, eb - 1, eh - 1);
            ctx.fillStyle = "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var l1 = v.etiket[0], l2 = v.etiket[1] || "";
            NK.passendeSkrift(ctx, l1, eb - 8, NK.klamp(eh * 0.4, 12, 17), 10, "700");
            ctx.fillText(l1, 0, l2 ? -eh * 0.2 : 0);
            if (l2) {
                NK.passendeSkrift(ctx, l2, eb - 8, NK.klamp(eh * 0.36, 12, 16), 10, "700");
                ctx.fillStyle = "#1d6fb8";
                ctx.fillText(l2, 0, eh * 0.24);
            }
            ctx.restore();
            ex = ex + 0;
        }
        ctx.restore();
    };

    /* ----- Pipetten -------------------------------------------------------------------
       (cx, top): midten og toppen. h: hoejden, w: breddefaktor (1 ved
       25 mL). v: { fyld (0-1 op til maerket), farve, tekst, lys }. */
    T.pipetteGeo = function (cx, top, h, w) {
        var M = MAAL.pipette, k = h / M.h, b = M.b * k * (w || 1);
        return { k: k, kx: k * (w || 1), x0: cx - b / 2, y0: top, b: b, h: h, cx: cx,
                 spids: { x: cx, y: top + M.spids * k }, maerke: top + M.maerke * k };
    };

    T.pipette = function (ctx, g, v) {
        var M = MAAL.pipette, k = g.k, kx = g.kx;
        ctx.save();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.16 * v.lys) + ")";
            NK.rundtRekt(ctx, g.x0 - 6, g.y0 - 4, g.b + 12, g.h + 8, 10);
            ctx.fill();
        }
        if (v.fyld > 0.001) {
            ctx.save();
            ctx.beginPath();
            var X = function (x) { return g.x0 + x * kx; };
            var Y = function (y) { return g.y0 + y * k; };
            ctx.rect(X(M.stilkV + 0.8), Y(M.maerke - 6), (M.stilkH - M.stilkV - 1.6) * kx, (98 - M.maerke + 6) * k);
            ctx.ellipse(X(M.bobleX), Y(M.bobleY), (M.bobleRx - 1) * kx, (M.bobleRy - 1) * k, 0, 0, Math.PI * 2);
            ctx.moveTo(X(17.8), Y(150));
            ctx.lineTo(X(22.2), Y(150));
            ctx.lineTo(X(21), Y(M.spids - 1));
            ctx.lineTo(X(19), Y(M.spids - 1));
            ctx.closePath();
            ctx.clip();
            var f = NK.klamp(v.fyld, 0, 1.05), yy;
            if (f <= 0.08) yy = M.spids - (M.spids - M.nedreTop) * (f / 0.08);
            else if (f <= 0.92) yy = M.nedreTop - (M.nedreTop - 92) * ((f - 0.08) / 0.84);
            else yy = 92 - (92 - M.maerke) * ((f - 0.92) / 0.08);
            ctx.fillStyle = v.farve;
            ctx.fillRect(g.x0, Y(yy), g.b, g.h);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "pipette", g.x0, g.y0, g.b, g.h);
        if (v.tekst) {
            var px = NK.klamp(12 * k * 1.2, 13, 15);
            var opt = { font: font("700", px), linje: "middle", farve: "#eef6fc", kant: true, kantFarve: "rgba(10, 14, 20, 0.7)", kantBredde: 3 };
            /* I stativet staar rumfanget over pipetten, ellers ved boblen */
            if (v.tekstOver) { opt.justering = "center"; NK.tekst(ctx, v.tekst, g.cx, g.y0 - 12, opt); }
            else NK.tekst(ctx, v.tekst, g.cx + (M.bobleRx + 5) * kx, g.y0 + M.bobleY * k, opt);
        }
        ctx.restore();
    };

    /* ----- Baegerglasset (400 mL): (x, y) venstre side og bunden ---------------------- */
    T.glasGeo = function (x, y, h) {
        var M = MAAL.baegerglas, k = h / M.h;
        var y0 = y - M.bund * k;
        return { k: k, x0: x, y0: y0, b: M.b * k, h: h, cx: x + M.b * k / 2,
                 ind: { x0: x + M.indV * k, x1: x + M.indH * k, top: y0 + M.indTop * k, bund: y0 + M.indBund * k },
                 ymL: function (V) { return y0 + (M.indBund - M.prmL * V) * k; } };
    };

    T.glas = function (ctx, g, VmL, farve, lysV) {
        var M = MAAL.baegerglas, k = g.k, ind = g.ind;
        ctx.save();
        if (VmL > 0.5) {
            ctx.save();
            NK.rundtRekt(ctx, ind.x0, ind.top, ind.x1 - ind.x0, ind.bund - ind.top, M.indR * k);
            ctx.clip();
            var ly = g.ymL(VmL);
            ctx.fillStyle = farve;
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, ind.bund - ly + 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, Math.max(1.2, 1.6 * k));
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "baegerglas", g.x0, g.y0, g.b, g.h);
        /* Et maerke ved det rumfang, der skal naas */
        if (lysV) {
            var y = g.ymL(lysV);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(ind.x0 + 2, y);
            ctx.lineTo(ind.x1 - 2, y);
            ctx.stroke();
            ctx.setLineDash([]);
            NK.tekst(ctx, K_mL(lysV), ind.x1 + 6, y, { font: font("700", NK.klamp(13 * k, 12, 15)), linje: "middle", farve: "#f5dd8a",
                kant: true, kantFarve: "rgba(10, 14, 20, 0.7)", kantBredde: 3 });
        }
        ctx.restore();
    };

    function K_mL(V) { return NK.betydende(V, 3) + " mL"; }

    /* ----- Flasken med stamopløsningen (som sc7.2) ------------------------------------- */
    T.flaskeGeo = function (cx, y, h) {
        var M = MAAL.flaske, k = h / M.h, b = M.b * k;
        return { k: k, x0: cx - b / 2, y0: y - M.bund * k, b: b, h: h, cx: cx,
                 hals: { x: cx, y: y - M.bund * k + 22 * k } };
    };

    T.flaske = function (ctx, g, farve, linjer, lysV) {
        var M = MAAL.flaske, k = g.k;
        ctx.save();
        if (lysV) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.14 * lysV) + ")";
            NK.rundtRekt(ctx, g.x0 - 6, g.y0 - 6, g.b + 12, g.h + 12, 12);
            ctx.fill();
        }
        ctx.save();
        NK.rundtRekt(ctx, g.x0 + M.indV * k, g.y0 + M.indTop * k, (M.indH - M.indV) * k, (M.indBund - M.indTop) * k, 9 * k);
        ctx.clip();
        var ly = g.y0 + (M.indTop + 18) * k;
        ctx.fillStyle = farve;
        ctx.fillRect(g.x0, ly, g.b, g.y0 + M.indBund * k - ly);
        ctx.restore();
        NK.Sprites.tegn(ctx, "flaske", g.x0, g.y0, g.b, g.h);
        if (linjer) {
            var ex = g.x0 + M.etiketV * k, ew = (M.etiketH - M.etiketV) * k, ey = g.y0 + M.etiketTop * k, eh = (M.etiketBund - M.etiketTop) * k;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#1c1f26";
            NK.passendeSkrift(ctx, linjer[0], ew - 6, NK.klamp(eh * 0.34, 12, 18), 10, "700");
            ctx.fillText(linjer[0], ex + ew / 2, ey + eh * 0.32);
            if (linjer[1]) {
                ctx.fillStyle = "#1d6fb8";
                NK.passendeSkrift(ctx, linjer[1], ew - 6, NK.klamp(eh * 0.32, 12, 17), 10, "700");
                ctx.fillText(linjer[1], ex + ew / 2, ey + eh * 0.7);
            }
        }
        ctx.restore();
    };

    /* ----- Sproejteflasken: (x, y) venstre side og bunden ------------------------------ */
    T.sproejteGeo = function (x, y, h) {
        var M = MAAL.sproejteflaske, k = h / M.h;
        var y0 = y - M.bund * k;
        return { k: k, x0: x, y0: y0, b: M.b * k, h: h, tud: { x: x + M.tudX * k, y: y0 + M.tudY * k },
                 midt: { x: x + 61 * k, y: y0 + 84 * k } };
    };

    T.sproejte = function (ctx, g, lysV, vinkel) {
        ctx.save();
        if (lysV) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.14 * lysV) + ")";
            NK.rundtRekt(ctx, g.x0 + 20 * g.k, g.y0, g.b - 10 * g.k, g.h + 4, 12);
            ctx.fill();
        }
        if (vinkel) {
            ctx.translate(g.midt.x, g.midt.y);
            ctx.rotate(vinkel);
            ctx.translate(-g.midt.x, -g.midt.y);
        }
        NK.Sprites.tegn(ctx, "sproejteflaske", g.x0, g.y0, g.b, g.h);
        ctx.restore();
    };

    /* ----- Zoomvinduet med ionerne ---------------------------------------------------------
       Partiklerne bevaeger sig frit. antal() saetter, hvor mange der skal
       vaere af hver ion; nye toner frem, og overskydende toner ud. */
    function Partikler(froeTal) {
        this.p = [];
        this.r = froe(froeTal || 1);
    }
    Partikler.prototype.saet = function (antal, typer) {
        var mig = this;
        typer = typer || antal.length;
        for (var t = 0; t < typer; t++) {
            var levende = this.p.filter(function (q) { return q.type === t && !q.doer; });
            var mangler = (antal[t] || 0) - levende.length;
            for (var i = 0; i < mangler; i++) {
                var a = this.r() * Math.PI * 2, rr = Math.sqrt(this.r()) * 0.85;
                this.p.push({ type: t, x: Math.cos(a) * rr, y: Math.sin(a) * rr,
                    vx: (this.r() - 0.5) * 0.4, vy: (this.r() - 0.5) * 0.4, a: 0, doer: false });
            }
            for (i = 0; i < -mangler; i++) levende[levende.length - 1 - i].doer = true;
        }
        this.p = this.p.filter(function (q) { return !(q.doer && q.a <= 0); });
        return mig;
    };
    Partikler.prototype.opdater = function (dt) {
        var r = this.r;
        this.p.forEach(function (q) {
            q.vx += (r() - 0.5) * 1.2 * dt;
            q.vy += (r() - 0.5) * 1.2 * dt;
            var v = Math.sqrt(q.vx * q.vx + q.vy * q.vy), maks = 0.28;
            if (v > maks) { q.vx *= maks / v; q.vy *= maks / v; }
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            var d = Math.sqrt(q.x * q.x + q.y * q.y);
            if (d > 0.86) {
                var nx = q.x / d, ny = q.y / d, dot = q.vx * nx + q.vy * ny;
                q.vx -= 2 * dot * nx; q.vy -= 2 * dot * ny;
                q.x = nx * 0.86; q.y = ny * 0.86;
            }
            q.a = NK.klamp(q.a + (q.doer ? -dt * 2.5 : dt * 2), 0, 1);
        });
        this.p = this.p.filter(function (q) { return !(q.doer && q.a <= 0); });
    };
    Partikler.prototype.antal = function (t) {
        return this.p.filter(function (q) { return q.type === t && !q.doer; }).length;
    };
    NK.Partikler = Partikler;

    /* Antallet af hver ion i luppen ved koncentrationen c (en prik pr.
       D.PRIK mol/L, hoejst 30 af hver) */
    T.prikker = function (c) {
        var n = Math.round(c / NK.Data.PRIK);
        if (c > 0.001 && n < 1) n = 1;
        return NK.klamp(n, 0, 30);
    };

    /* v: { part, st, farve (vaesken), titel, tekst (under), lys } */
    T.zoom = function (ctx, cx, cy, r, v) {
        var st = v.st;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 5, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#0f1a26";
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        if (v.farve) {
            ctx.fillStyle = v.farve;
            ctx.globalAlpha = 0.55;
            ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
            ctx.globalAlpha = 1;
        }
        var k = r / 110;
        v.part.p.forEach(function (q) {
            var ion = st.ioner[q.type];
            var x = cx + q.x * r, y = cy + q.y * r, rr = ion.r * NK.klamp(k, 0.7, 1.3);
            ctx.globalAlpha = q.a;
            var g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.2, x, y, rr);
            g.addColorStop(0, nuance(ion.farve, 0.45));
            g.addColorStop(1, ion.farve);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, rr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.9)" : "#c9d3de";
        ctx.lineWidth = Math.max(4, 6 * k);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.max(2, 3 * k), 0, Math.PI * 2);
        ctx.stroke();
        var px = NK.klamp(14 * k, 13, 16);
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 12, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
        /* Forklaringen: prikkernes farver og antallet */
        var y = cy + r + px + 10;
        if (v.tekst) {
            NK.tekst(ctx, v.tekst, cx, y, { font: font("700", px), justering: "center", farve: "#f5dd8a" });
            y += px + 8;
        }
        if (v.forklar !== false) {
            ctx.font = font("600", px);
            var dele = st.ioner.map(function (ion) { return ion.t; });
            var bredder = dele.map(function (t) { return ctx.measureText(t).width + px + 6; });
            var i, samlet = bredder.reduce(function (a, b) { return a + b; }, 0) + 14 * (dele.length - 1);
            var x = cx - samlet / 2;
            for (i = 0; i < dele.length; i++) {
                ctx.fillStyle = st.ioner[i].farve;
                ctx.beginPath();
                ctx.arc(x + px * 0.45, y - px * 0.35, px * 0.42, 0, Math.PI * 2);
                ctx.fill();
                NK.tekst(ctx, dele[i], x + px + 4, y, { font: font("600", px), farve: "#c8ced6" });
                x += bredder[i] + 14;
            }
        }
        ctx.restore();
    };

    /* En stiplet linje fra et punkt til zoomvinduet */
    T.zoomLinje = function (ctx, x0, y0, x1, y1) {
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

    NK.Tegn = T;
}());

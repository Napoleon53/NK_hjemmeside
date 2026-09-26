/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, krukken, spatlen, literglasset,
   baegerglasset, flasken, soejlerne og zoomvinduet med ionerne.
   Funktionerne tegner én ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger sig.
   Det meste er som i sc5.1; literglasset og soejlerne er nye.
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

    /* ----- Literglasset paa fane 1: (x, y) venstre side og bunden ------------------------
       v: { V (liter), farve, skyer } */
    T.glas1Geo = function (x, y, h) {
        var M = MAAL.glas1l, k = h / M.h;
        var y0 = y - M.bund * k;
        return { k: k, x: x, y0: y0, b: M.b * k, h: h, cx: x + M.b * k / 2,
                 ind: { x0: x + M.indV * k, x1: x + M.indH * k, top: y0 + M.indTop * k, bund: y0 + M.indBund * k },
                 yV: function (VL) { return y0 + (M.indBund - M.prL * VL) * k; } };
    };

    T.glas1 = function (ctx, g, v) {
        var M = MAAL.glas1l, k = g.k, ind = g.ind;
        ctx.save();
        ctx.save();
        NK.rundtRekt(ctx, ind.x0, ind.top - 20 * k, ind.x1 - ind.x0, ind.bund - ind.top + 20 * k, M.indR * k);
        ctx.clip();
        var ly = g.yV(v.V);
        ctx.fillStyle = v.farve;
        ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, ind.bund - ly + 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, Math.max(1.5, 2 * k));
        if (v.skyer) v.skyer.forEach(function (s) {
            var gr = ctx.createRadialGradient(s.x, s.y, 1, s.x, s.y, s.r);
            gr.addColorStop(0, "rgba(255, 255, 255, " + (0.35 * s.a) + ")");
            gr.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        NK.Sprites.tegn(ctx, "glas1l", g.x, g.y0, g.b, g.h);
        ctx.restore();
    };

    /* En straale fra (x, y0) ned til y1 */
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
        ctx.restore();
    };

    /* ----- Soejlerne: koncentrationen af saltet og af hver ion ----------------------------
       r: rektanglet. s: [{ navn, v (M), farve, maal }]. maks: skalaens top. */
    T.soejler = function (ctx, r, s, maks) {
        ctx.save();
        ctx.fillStyle = "rgba(10, 12, 18, 0.55)";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();
        var px = NK.klamp(r.h * 0.07, 12, 15);
        NK.tekst(ctx, "Koncentration i M", r.x + 12, r.y + px + 6, { font: font("700", px), farve: "#a9b0ba" });
        var venstre = r.x + 42, hoejre = r.x + r.b - 12;
        /* Er navnene for brede til deres plads, staar hvert andet en linje lavere */
        var plads0 = (hoejre - venstre) / Math.max(1, s.length);
        ctx.font = font("700", px);
        var forskudt = s.some(function (so) { return ctx.measureText(so.navn).width > plads0 - 4; });
        var top = r.y + px * 2 + 16, bund = r.y + r.h - px * 2 - 14 - (forskudt ? px + 4 : 0);
        var trin = maks <= 0.6 ? 0.1 : (maks <= 1.2 ? 0.2 : 0.5);
        var y = function (v) { return bund - (bund - top) * NK.klamp(v / maks, 0, 1.02); };
        ctx.font = font("600", Math.max(12, px - 1));
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (var v = 0; v <= maks + 1e-9; v += trin) {
            var yy = y(v);
            ctx.strokeStyle = v === 0 ? "rgba(255, 255, 255, 0.35)" : "rgba(255, 255, 255, 0.08)";
            ctx.beginPath();
            ctx.moveTo(venstre, yy);
            ctx.lineTo(hoejre, yy);
            ctx.stroke();
            ctx.fillStyle = "#8a919c";
            ctx.fillText(v < 1e-9 ? "0" : NK.betydende(v, 2), venstre - 6, yy);
        }
        var n = s.length, plads = (hoejre - venstre) / Math.max(1, n);
        var sb = Math.min(58, plads * 0.62);
        s.forEach(function (so, i) {
            var cx = venstre + plads * (i + 0.5);
            var y1 = y(so.v);
            if (so.v > 0.0005) {
                var gr = ctx.createLinearGradient(0, y1, 0, bund);
                gr.addColorStop(0, nuance(so.farve, 0.2));
                gr.addColorStop(1, nuance(so.farve, -0.15));
                ctx.fillStyle = gr;
                NK.rundtRekt(ctx, cx - sb / 2, y1, sb, bund - y1, 4);
                ctx.fill();
                NK.tekst(ctx, NK.betydende(so.v, 2), cx, y1 - 8, { font: font("700", px), justering: "center", farve: "#f2f3f5" });
            }
            if (so.maal !== undefined) {
                var ym = y(so.maal);
                ctx.strokeStyle = "#f2c53d";
                ctx.lineWidth = 2;
                ctx.setLineDash([6, 4]);
                ctx.beginPath();
                ctx.moveTo(cx - sb / 2 - 6, ym);
                ctx.lineTo(cx + sb / 2 + 6, ym);
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.lineWidth = 1;
                NK.tekst(ctx, "mål", cx + sb / 2 + 8, ym, { font: font("700", 12), linje: "middle", farve: "#f2c53d" });
            }
            var fs = NK.passendeSkrift(ctx, so.navn, forskudt ? plads * 2 - 8 : plads + 10, px, 12, "700");
            var ny = bund + fs + 8 + (forskudt && i % 2 === 1 ? fs + 4 : 0);
            NK.tekst(ctx, so.navn, cx, ny, { font: font("700", fs), justering: "center", farve: "#dfe6ee" });
        });
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
            /* Er der ikke plads paa én linje, staar to ioner pr. linje */
            var i, samlet = bredder.reduce(function (a, b) { return a + b; }, 0) + 14 * (dele.length - 1);
            var pr = samlet > 2 * r + 30 ? 2 : dele.length;
            for (var start = 0; start < dele.length; start += pr) {
                var slut = Math.min(dele.length, start + pr), bb = 0;
                for (i = start; i < slut; i++) bb += bredder[i] + (i > start ? 14 : 0);
                var x = cx - bb / 2;
                for (i = start; i < slut; i++) {
                    ctx.fillStyle = st.ioner[i].farve;
                    ctx.beginPath();
                    ctx.arc(x + px * 0.45, y - px * 0.35, px * 0.42, 0, Math.PI * 2);
                    ctx.fill();
                    NK.tekst(ctx, dele[i], x + px + 4, y, { font: font("600", px), farve: "#c8ced6" });
                    x += bredder[i] + 14;
                }
                y += px + 8;
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

/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet og bordet, pH-skalaen i universalindikatorens farver og
   maerket paa den, hverdagsstofferne, pH-metret med elektroden,
   baegerglas, flasker, pipetten, sproejteflasken, luppen med ionerne og
   knapperne paa scenen. Funktionerne tegner én ting et bestemt sted og
   husker intet selv; fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Rummet og bordet (som sc4.2 og sc4.4) ------------------------------- */
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

    /* ----- pH-skalaen ----------------------------------------------------------
       s = { x0, x1, y, h }: baandet fra pH 0 (x0) til pH 14 (x1), y er toppen. */
    T.skalaX = function (s, ph) { return s.x0 + (s.x1 - s.x0) * NK.klamp(ph, 0, 14) / 14; };
    T.skalaPh = function (s, x) { return NK.klamp((x - s.x0) / (s.x1 - s.x0) * 14, 0, 14); };

    /* v.px: tallenes stoerrelse, v.ord: SUR/NEUTRAL/BASISK i baandet,
       v.lys: 0-1, baandet lyser (noget holdes over det) */
    T.skala = function (ctx, s, v) {
        v = v || {};
        var px = v.px || 14;
        ctx.save();
        var g = ctx.createLinearGradient(s.x0, 0, s.x1, 0);
        for (var p = 0; p <= 14; p += 0.5) g.addColorStop(p / 14, K.farveCss(p));
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, s.x0 + 3, s.y + 4, s.x1 - s.x0, s.h, 7);
        ctx.fill();
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, s.x0, s.y, s.x1 - s.x0, s.h, 7);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        NK.rundtRekt(ctx, s.x0 + 2, s.y + 2, s.x1 - s.x0 - 4, s.h * 0.32, 5);
        ctx.fill();
        NK.rundtRekt(ctx, s.x0, s.y, s.x1 - s.x0, s.h, 7);
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")" : "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = v.lys ? 3 : 1.2;
        ctx.stroke();

        /* Streger og tal under baandet */
        ctx.fillStyle = "#dde3ea";
        ctx.strokeStyle = "rgba(221, 227, 234, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.font = font("700", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (var i = 0; i <= 14; i++) {
            var x = T.skalaX(s, i);
            ctx.beginPath();
            ctx.moveTo(x, s.y + s.h);
            ctx.lineTo(x, s.y + s.h + (i === 7 ? 9 : 6));
            ctx.stroke();
            ctx.fillStyle = i === 7 ? "#ffffff" : "#c8ced6";
            ctx.fillText(String(i), x, s.y + s.h + 9);
        }

        /* Ordene i selve baandet */
        if (v.ord) {
            var op = NK.klamp(s.h * 0.42, 11, 15);
            var t = s.y + s.h / 2;
            NK.tekst(ctx, "⟵ SUR", T.skalaX(s, 0.25), t, { font: font("800", op), linje: "middle", kant: true, kantBredde: 3 });
            if (v.ord !== "ender") NK.tekst(ctx, "NEUTRAL", T.skalaX(s, 7), t, { font: font("800", op), linje: "middle", justering: "center", kant: true, kantBredde: 3 });
            NK.tekst(ctx, "BASISK ⟶", T.skalaX(s, 13.75), t, { font: font("800", op), linje: "middle", justering: "right", kant: true, kantBredde: 3 });
        }
        ctx.restore();
    };

    /* Maerket, man traekker: en lodret streg gennem baandet og en boble
       med pH over. v.lys: musen er over det, v.puls: det banker (maal) */
    T.phMaerke = function (ctx, s, ph, v) {
        v = v || {};
        var x = T.skalaX(s, ph);
        var bb = 64, bh = 30, by = s.y - bh - 12;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x - 3, s.y - 6, 8, s.h + 12);
        ctx.fillStyle = "#ffffff";
        NK.rundtRekt(ctx, x - 3.5, s.y - 7, 7, s.h + 14, 3);
        ctx.fill();
        ctx.strokeStyle = "#1c1f26";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (v.puls) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.6 * v.puls) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x - bb / 2 - 4 - 3 * v.puls, by - 4 - 3 * v.puls, bb + 8 + 6 * v.puls, bh + 8 + 6 * v.puls, 11);
            ctx.stroke();
        }
        /* Boblen */
        ctx.fillStyle = v.lys ? "#fff6d6" : "#ffffff";
        NK.rundtRekt(ctx, x - bb / 2, by, bb, bh, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, by + bh - 0.5);
        ctx.lineTo(x + 7, by + bh - 0.5);
        ctx.lineTo(x, by + bh + 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = v.lys ? "#f2c53d" : "#1c1f26";
        ctx.lineWidth = v.lys ? 2.5 : 1.2;
        NK.rundtRekt(ctx, x - bb / 2, by, bb, bh, 8);
        ctx.stroke();
        ctx.fillStyle = "#1c1f26";
        ctx.font = font("800", 16);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("pH " + K.phTekst(ph, 1), x, by + bh / 2 + 1);
        ctx.restore();
        return { x: x - bb / 2, y: by, b: bb, h: bh + s.h + 20 };
    };

    /* En lille markoer under baandet, fx elevens gaet (hul trekant) */
    T.gaetMaerke = function (ctx, s, ph, v) {
        v = v || {};
        var x = T.skalaX(s, ph), y = s.y + s.h + 2;
        ctx.save();
        ctx.globalAlpha *= v.alfa === undefined ? 1 : v.alfa;
        ctx.strokeStyle = v.farve || "#f2c53d";
        ctx.fillStyle = "rgba(20, 20, 28, 0.9)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 7, y + 11);
        ctx.lineTo(x + 7, y + 11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Hverdagsstofferne ------------------------------------------------------
       Tegnes med bunden i (cx, bund) og hoejden h. v.lys: en gul glorie,
       v.alfa: gennemsigtighed */
    T.stofBredde = function (h) { return h * 100 / 120; };

    T.stof = function (ctx, id, cx, bund, h, v) {
        v = v || {};
        var b = T.stofBredde(h);
        var top = bund - h * 118 / 120;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (v.lys) {
            var g = ctx.createRadialGradient(cx, bund - h * 0.45, h * 0.1, cx, bund - h * 0.45, h * 0.62);
            g.addColorStop(0, "rgba(242, 197, 61, " + (0.4 * v.lys) + ")");
            g.addColorStop(1, "rgba(242, 197, 61, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(cx - h * 0.7, bund - h * 1.1, h * 1.4, h * 1.2);
        }
        NK.Sprites.tegn(ctx, id, cx - b / 2, top, b, h);
        ctx.restore();
    };

    /* Navnet under et stof paa hylden */
    T.navn = function (ctx, tekst, cx, y, px, v) {
        v = v || {};
        NK.tekst(ctx, tekst, cx, y, {
            font: font(v.vaegt || "700", px), justering: "center", linje: "top",
            farve: v.farve || "#dde3ea", kant: true, kantBredde: 3
        });
    };

    /* ----- pH-metret og elektroden ---------------------------------------------------
       Metret staar med bunden i (x, bund) (midten) og hoejden h. tekst staar i
       displayet. Returnerer, hvor ledningen gaar ud. */
    T.phmeter = function (ctx, x, bund, h, tekst, v) {
        v = v || {};
        var m = MAAL.phmeter, k = h / m.h, b = m.b * k;
        var x0 = x - b / 2, y0 = bund - h;
        NK.Sprites.tegn(ctx, "phmeter", x0, y0, b, h);
        var dx = x0 + m.displayX * k, dy = y0 + m.displayY * k;
        ctx.save();
        ctx.fillStyle = "#26311f";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var s = NK.passendeSkrift(ctx, tekst, m.displayB * k * 0.86, m.displayH * k * 0.62, 9, "700");
        ctx.font = "700 " + s + "px Consolas, 'Courier New', monospace";
        ctx.fillText(tekst, dx + 3 * k, dy + 3 * k);
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 - 3, y0 - 3, b + 6, h + 6, 14 * k + 3);
            ctx.stroke();
        }
        ctx.restore();
        return { x: x0 + m.ledning.x * k, y: y0 + m.ledning.y * k };
    };

    /* Elektroden: et glasroer med en kugle forneden i (x, y), og ledningen
       fra metret hen til toppen af den. l: elektrodens laengde */
    T.elektrode = function (ctx, fra, x, y, l) {
        var top = y - l;
        ctx.save();
        ctx.strokeStyle = "#2a2d33";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.bezierCurveTo(fra.x, fra.y - 60, x, top - 70, x, top);
        ctx.stroke();
        ctx.fillStyle = "#2a2d33";
        NK.rundtRekt(ctx, x - 4, top - 4, 8, l * 0.28 + 4, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(220, 236, 248, 0.35)";
        ctx.strokeStyle = "rgba(220, 236, 248, 0.9)";
        ctx.lineWidth = 1.3;
        NK.rundtRekt(ctx, x - 3.5, top + l * 0.28, 7, l * 0.72 - 5, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Glasudstyr --------------------------------------------------------------- */
    /* Baegerglas med bunden i (cx, bund) og bredden b. fyld: mL (0-150).
       farve: vaeskens farve (css), v.lys: glorie */
    T.baegerglas = function (ctx, cx, bund, b, fyld, farve, v) {
        v = v || {};
        var m = MAAL.baegerglas, k = b / m.b, h = m.h * k;
        var x0 = cx - b / 2, y0 = bund - (m.bund + 1) * k;
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 + 10 * k, y0 + 2 * k, b - 20 * k, (m.bund + 4) * k, 10 * k);
            ctx.stroke();
            ctx.restore();
        }
        if (fyld > 0) {
            var vh = fyld * m.pr100mL / 100 * k;
            var bundY = y0 + m.bund * k;
            ctx.save();
            ctx.fillStyle = farve;
            NK.rundtRekt(ctx, x0 + m.indV * k, bundY - vh, (m.indH - m.indV) * k, vh, 7 * k);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(x0 + m.indV * k, bundY - vh, (m.indH - m.indV) * k, Math.max(1.5, 3 * k));
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "baegerglas", x0, y0, b, h);
        return { x: x0, y: y0, b: b, h: h, k: k };
    };

    /* Vaeskens overflade i et baegerglas (til draaber og pipetten) */
    T.baegerOverflade = function (cx, bund, b, fyld) {
        var m = MAAL.baegerglas, k = b / m.b;
        return bund - k - fyld * m.pr100mL / 100 * k;
    };

    /* Reagensflaske med bunden i (cx, bund) og bredden b. linjer: etikettens
       tekst, [{ t, px, vaegt, farve }] */
    T.flaske = function (ctx, cx, bund, b, linjer, farve, v) {
        v = v || {};
        var m = MAAL.flaske, k = b / m.b, h = m.h * k;
        var x0 = cx - b / 2, y0 = bund - m.bund * k;
        ctx.save();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 + 4 * k, y0 + 18 * k, b - 8 * k, (m.bund - 14) * k, 12 * k);
            ctx.stroke();
        }
        ctx.fillStyle = farve || "rgba(214, 234, 248, 0.22)";
        NK.rundtRekt(ctx, x0 + m.indV * k, y0 + 58 * k, (m.indH - m.indV) * k, (m.indBund - 58) * k, 8 * k);
        ctx.fill();
        ctx.restore();
        NK.Sprites.tegn(ctx, "flaske", x0, y0, b, h);
        var ex = x0 + (m.etiketV + m.etiketH) / 2 * k;
        var eb = (m.etiketH - m.etiketV) * k;
        var ialt = 0;
        linjer.forEach(function (l) { ialt += l.px * 1.2; });
        var y = y0 + (m.etiketTop + m.etiketBund) / 2 * k - ialt / 2;
        linjer.forEach(function (l) {
            ctx.save();
            ctx.fillStyle = l.farve || "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            NK.passendeSkrift(ctx, l.t, eb * 0.92, l.px, 8, l.vaegt || "700");
            ctx.fillText(l.t, ex, y);
            ctx.restore();
            y += l.px * 1.2;
        });
        return { x: x0, y: y0, b: b, h: h };
    };

    /* Pipetten med spidsen i (x, y) og hoejden h; fyld 0-1 af roeret */
    T.pipette = function (ctx, x, y, h, fyld, farve) {
        var m = MAAL.pipette, k = h / m.h;
        var x0 = x - m.spids.x * k, y0 = y - m.spids.y * k;
        if (fyld > 0) {
            var top = m.roerBund - (m.roerBund - m.roerTop) * NK.klamp(fyld, 0, 1);
            ctx.save();
            ctx.fillStyle = farve;
            ctx.beginPath();
            ctx.moveTo(x0 + 12 * k, y0 + top * k);
            ctx.lineTo(x0 + 18 * k, y0 + top * k);
            ctx.lineTo(x0 + 16.2 * k, y0 + 124 * k);
            ctx.lineTo(x0 + 13.8 * k, y0 + 124 * k);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "pipette", x0, y0, m.b * k, h);
    };

    /* Sproejteflasken med dysen i (x, y) og hoejden h */
    T.sproejteflaske = function (ctx, x, y, h) {
        var m = MAAL.sproejteflaske, k = h / m.h;
        NK.Sprites.tegn(ctx, "sproejteflaske", x - m.dyse.x * k, y - m.dyse.y * k, m.b * k, h);
    };

    /* ----- Luppen -------------------------------------------------------------------- */
    /* Kegle fra et lille felt i vaesken hen til luppen */
    T.zoomKegle = function (ctx, px, py, cx, cy, R) {
        var dx = cx - px, dy = cy - py, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var a = Math.atan2(dy, dx);
        if (d < R + 4) return;
        ctx.save();
        var g = ctx.createLinearGradient(px, py, cx, cy);
        g.addColorStop(0, "rgba(242, 197, 61, 0.28)");
        g.addColorStop(1, "rgba(242, 197, 61, 0.06)");
        ctx.fillStyle = g;
        var v1 = a - Math.PI / 2, v2 = a + Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx + R * Math.cos(v1), cy + R * Math.sin(v1));
        ctx.lineTo(cx + R * Math.cos(v2), cy + R * Math.sin(v2));
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
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

    /* Baggrunden i luppen og klip til cirklen. Husk T.lupSlut bagefter. */
    T.lupStart = function (ctx, cx, cy, R, farve) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        var g = ctx.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R);
        g.addColorStop(0, "#1e2a3a");
        g.addColorStop(1, "#0f141c");
        ctx.fillStyle = g;
        ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        if (farve) {
            ctx.fillStyle = farve;
            ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        }
    };

    T.lupSlut = function (ctx, cx, cy, R, v) {
        v = v || {};
        var gl = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        gl.addColorStop(0, "rgba(255, 255, 255, 0.10)");
        gl.addColorStop(0.35, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = gl;
        ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "#c9d3de";
        ctx.lineWidth = Math.max(6, R * 0.06);
        ctx.beginPath();
        ctx.arc(cx, cy, R + ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, R + Math.max(6, R * 0.06) + 1, 0, Math.PI * 2);
        ctx.stroke();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, R + Math.max(6, R * 0.06) + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    };

    var ION = {
        h3o: { farve: "#e8574a", lys: "#ff9d90", kant: "#8f2219", tekst: "H₃O⁺" },
        oh: { farve: "#3d8fe0", lys: "#9ccaf5", kant: "#1d4f86", tekst: "OH⁻" }
    };
    T.ION = ION;

    /* Én ion. Er den stor nok, staar formlen paa. */
    T.ion = function (ctx, slags, x, y, r, alfa) {
        var I = ION[slags];
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        if (r < 3.2) {
            ctx.fillStyle = I.lys;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, I.lys);
        g.addColorStop(1, I.farve);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = I.kant;
        ctx.lineWidth = r > 8 ? 1.4 : 0.8;
        ctx.stroke();
        if (r >= 12) {
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = font("800", Math.round(r * (slags === "h3o" ? 0.62 : 0.72)));
            ctx.fillText(I.tekst, x, y + 1);
        }
        ctx.restore();
    };

    /* For mange ioner at tegne: en taet taage i ionens farve */
    T.taage = function (ctx, cx, cy, R, slags, alfa) {
        var I = ION[slags], c = I.farve;
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        var g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R);
        g.addColorStop(0, c);
        g.addColorStop(1, I.kant);
        ctx.fillStyle = g;
        ctx.globalAlpha *= 0.82;
        ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        ctx.globalAlpha /= 0.82;
        /* Et fint net af prikker, saa det ligner mange smaa */
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        var rnd = T.froe(17);
        for (var i = 0; i < 700; i++) {
            var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * R;
            ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1.4, 1.4);
        }
        ctx.restore();
    };

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    T.froe = function (n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    };

    /* En rund knap paa luppens kant: + eller − */
    T.rundKnap = function (ctx, x, y, r, tegn, v) {
        v = v || {};
        ctx.save();
        ctx.globalAlpha *= v.slukket ? 0.35 : 1;
        if (v.puls) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.3 + 0.6 * v.puls) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(x, y, r + 4 + 4 * v.puls, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = v.lys ? "#3d9ee0" : "#2a76ac";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = v.lys ? "#f2c53d" : "#9fc7e6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(2.5, r * 0.16);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r * 0.45, y);
        ctx.lineTo(x + r * 0.45, y);
        if (tegn === "+") {
            ctx.moveTo(x, y - r * 0.45);
            ctx.lineTo(x, y + r * 0.45);
        }
        ctx.stroke();
        ctx.restore();
    };

    /* En knap paa scenen. r = { x, y, b, h } */
    T.knap = function (ctx, r, tekst, v) {
        v = v || {};
        ctx.save();
        ctx.globalAlpha *= v.slukket ? 0.4 : 1;
        if (v.puls) {
            ctx.strokeStyle = "rgba(61, 158, 224, " + (0.25 + 0.6 * v.puls) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, r.x - 3 - 3 * v.puls, r.y - 3 - 3 * v.puls, r.b + 6 + 6 * v.puls, r.h + 6 + 6 * v.puls, 10);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, r.x + 2, r.y + 3, r.b, r.h, 8);
        ctx.fill();
        ctx.fillStyle = v.lys ? "#3d9ee0" : "#2a76ac";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        ctx.strokeStyle = v.lys ? "#f2c53d" : "#6fb3e6";
        ctx.lineWidth = v.lys ? 2 : 1.2;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, tekst, r.b - 12, v.px || 15, 11, "700");
        ctx.fillText(tekst, r.x + r.b / 2, r.y + r.h / 2 + 1);
        ctx.restore();
    };

    /* Et lyst skilt med to tegnestifter (som sc4.4) */
    T.skilt = function (ctx, x, y, b, h, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#ece8dd";
        NK.rundtRekt(ctx, x, y, b, h, 5);
        ctx.fill();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.3 * v.lys) + ")";
            ctx.fill();
        }
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.95)" : "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = v.lys ? 3 : 1;
        ctx.stroke();
        [[x + 9, y + 9], [x + b - 9, y + 9]].forEach(function (q) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(q[0], q[1], 3.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* Buet, stiplet pil, der viser vejen (som sc4.4) */
    T.buePil = function (ctx, x0, y0, x1, y1, tid, kx, ky) {
        var mx = kx !== undefined ? kx : (x0 + x1) / 2;
        var my = ky !== undefined ? ky : Math.min(y0, y1) - Math.abs(x1 - x0) * 0.25 - 20;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 7]);
        ctx.lineDashOffset = -((tid || 0) * 30 % 15);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.quadraticCurveTo(mx, my, x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        var vx = x1 - mx, vy = y1 - my, l = Math.sqrt(vx * vx + vy * vy) || 1;
        vx /= l; vy /= l;
        ctx.fillStyle = "rgba(242, 197, 61, 0.95)";
        ctx.beginPath();
        ctx.moveTo(x1 + vx * 4, y1 + vy * 4);
        ctx.lineTo(x1 - vx * 12 - vy * 7, y1 - vy * 12 + vx * 7);
        ctx.lineTo(x1 - vx * 12 + vy * 7, y1 - vy * 12 - vx * 7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En lille maerkat med tekst (som sc4.4) */
    T.maerkat = function (ctx, x, y, tekst, v) {
        v = v || {};
        ctx.save();
        var px = v.px || 13;
        ctx.font = font("700", px);
        var b = ctx.measureText(tekst).width + 14, h = px + 9;
        ctx.globalAlpha *= v.alfa === undefined ? 1 : NK.klamp(v.alfa, 0, 1);
        ctx.fillStyle = v.farve || "#e6892a";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.fillStyle = v.tekstFarve || "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
        return b;
    };

    NK.Tegn = T;
}());

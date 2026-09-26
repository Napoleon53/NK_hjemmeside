/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet og bordet, baegerglassene med oploesningen, metalstængerne med
   det lag, der saetter sig paa dem, holderen til stængerne, boblerne,
   hylden og kortene paa fane 2, spaendingsraekken foroven paa fane 2 og
   3, stativet paa fane 3, keglen hen til luppen og smaa skilte.
   Funktionerne tegner én ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar.

   Farverne er samlet her: metallerne (stang og atomer), laget paa
   stangen, oploesningernes farve og ionernes farve i luppen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farverne ---------------------------------------------------------------
       Metallerne: [lys, mellem, moerk] til stængerne og atomerne i luppen */
    T.METAL = {
        Mg: ["#eef1f3", "#c9ced3", "#8e959c"],
        Al: ["#f1f3f5", "#d3d8dc", "#9aa1a8"],
        Zn: ["#d7dee4", "#a5b1bb", "#6e7a85"],
        Fe: ["#a9aeb3", "#767d84", "#484e55"],
        Ni: ["#e0dcd2", "#b5b0a4", "#7c776c"],
        Sn: ["#e6e8ea", "#c2c7cb", "#8a9095"],
        Pb: ["#a8b0ba", "#7a838e", "#4f5761"],
        Cu: ["#f0b48a", "#c8733f", "#8a4622"],
        Ag: ["#fbfcfd", "#dde1e5", "#a3a9b0"],
        Au: ["#fff0b0", "#e2b53c", "#a07a1c"],
        H:  ["#ffffff", "#e8eef4", "#b8c4cf"]
    };

    /* Laget, der saetter sig paa stangen, naar ionerne bliver til metal */
    T.BELAEG = {
        Cu: "#8e4424", Ag: "#aab0b7", Fe: "#2c2d30", Zn: "#5c646d", Ni: "#38393b",
        Sn: "#8a9197", Pb: "#555d66", Au: "#6e4b25", Mg: "#9aa0a6", Al: "#a8aeb3"
    };

    /* Disse vokser som naale og grene (soelvtrae, blytrae) */
    T.KRYSTAL = { Ag: true, Sn: true, Pb: true };

    /* Farvede ioner i oploesningen: [r, g, b, alfa]. De andre er klare. */
    T.OPL = {
        Cu: [52, 132, 226, 0.58],
        Ni: [70, 180, 110, 0.5],
        Fe: [165, 205, 135, 0.36],
        Au: [236, 190, 50, 0.5]
    };
    T.VAND = "rgba(190, 220, 245, 0.16)";

    /* Ionernes farve i luppen: de farvede som oploesningen, de klare lyse */
    T.IONFARVE = {
        Cu: "#5aa3ea", Ni: "#62c690", Fe: "#bfdc9f", Au: "#f0c64a",
        Mg: "#e2dcf2", Al: "#e8e1f2", Zn: "#d5ddee", Sn: "#e0e3ec",
        Pb: "#c8cdda", Ag: "#eef0f7", H: "#ffffff"
    };

    function rgba(f, a) { return "rgba(" + f[0] + ", " + f[1] + ", " + f[2] + ", " + a + ")"; }

    /* Oploesningens farvelag: ionen i, der er brugt i broekdelen x, og
       metallet m's ioner, der er kommet til (andel af en fuld oploesning). */
    T.oplLag = function (i, m, x, andelM) {
        var lag = [T.VAND];
        if (T.OPL[i]) lag.push(rgba(T.OPL[i], T.OPL[i][3] * (1 - x)));
        if (m && T.OPL[m] && x > 0) lag.push(rgba(T.OPL[m], T.OPL[m][3] * NK.klamp(x * (andelM || 1) * 1.8, 0, 1)));
        return lag;
    };

    /* En lille, fast talraekke ud fra en tekst, saa krystaller og
       bobler ser ens ud hver gang for samme stang */
    T.frø = function (tekst) {
        var h = 2166136261;
        for (var i = 0; i < tekst.length; i++) { h ^= tekst.charCodeAt(i); h = Math.imul(h, 16777619); }
        return function () {
            h = Math.imul(h ^ (h >>> 15), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            h ^= h >>> 16;
            return (h >>> 0) / 4294967296;
        };
    };

    /* ----- Rummet og bordet (som sc7.4) ----------------------------------------- */
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

    /* ----- Baegerglasset ---------------------------------------------------------------
       Maalene i pixels for et glas med bunden i (cx, bund) og bredden b,
       fyldt med fyld mL (standard 100). */
    T.glasMaal = function (cx, bund, b, fyld) {
        var m = MAAL.baegerglas, k = b / m.b;
        var x0 = cx - b / 2, y0 = bund - (m.bund + 1) * k;
        if (fyld === undefined) fyld = 100;
        return {
            cx: cx, x: x0, y: y0, b: b, h: m.h * k, k: k, bund: bund,
            indV: x0 + m.indV * k, indH: x0 + m.indH * k,
            bundY: y0 + m.bund * k, top: y0 + m.top * k,
            overflade: y0 + m.bund * k - fyld * m.pr100mL / 100 * k, fyld: fyld
        };
    };

    function vaeske(ctx, g, farve) {
        var k = g.k;
        ctx.fillStyle = farve;
        NK.rundtRekt(ctx, g.indV, g.overflade, g.indH - g.indV, g.bundY - g.overflade, 7 * k);
        ctx.fill();
    }

    /* Glasset med vaesken. lag: farvelagene (T.oplLag). inde(ctx): det,
       der staar i glasset (stangen, boblerne); det tegnes oven paa vaesken,
       og vaesken farver det svagt bagefter. v.lys: glorie (0-1). */
    T.glas = function (ctx, g, lag, v) {
        v = v || {};
        var k = g.k;
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, g.x + 10 * k, g.y + 2 * k, g.b - 20 * k, g.bundY - g.y + 5 * k, 10 * k);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        lag.forEach(function (f) { vaeske(ctx, g, f); });
        ctx.restore();
        if (v.inde) v.inde(ctx);
        /* Vaesken foran det, der staar i den: kun svagt */
        ctx.save();
        ctx.globalAlpha = 0.35;
        lag.forEach(function (f, n) { if (n > 0) vaeske(ctx, g, f); });
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fillRect(g.indV, g.overflade, g.indH - g.indV, Math.max(1.5, 3 * k));
        ctx.restore();
        NK.Sprites.tegn(ctx, "baegerglas", g.x, g.y, g.b, g.h);
    };

    /* Skiltet under glasset: ionen stort og saltets formel under */
    T.glasSkilt = function (ctx, cx, y, ion, formel, v) {
        v = v || {};
        var px = v.px || 15;
        ctx.save();
        ctx.font = font("700", px);
        var b1 = ctx.measureText(ion).width;
        ctx.font = font("600", px - 3);
        var b2 = ctx.measureText(formel).width;
        var b = Math.max(b1, b2) + 18, h = px * 2 + 8;
        ctx.fillStyle = "rgba(20, 20, 28, 0.9)";
        NK.rundtRekt(ctx, cx - b / 2, y, b, h, 7);
        ctx.fill();
        ctx.strokeStyle = v.kant || "#4a4a58";
        ctx.lineWidth = v.kant ? 2 : 1.2;
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = v.farve || "#f2f3f5";
        ctx.font = font("700", px);
        ctx.fillText(ion, cx, y + h * 0.33);
        ctx.fillStyle = "#a9b0ba";
        ctx.font = font("600", px - 3);
        ctx.fillText(formel, cx, y + h * 0.72);
        ctx.restore();
        return { x: cx - b / 2, y: y, b: b, h: h };
    };

    /* ----- Metalstangen ------------------------------------------------------------------
       s: { x (midten), top, b (bredde), l (laengde), metal,
            belaeg: { metal, x (0-1), fra (y, hvor vaesken begynder), frø },
            lys (0-1), klemme (y for glassets kant), etiket (true: skilt oeverst) } */
    T.stang = function (ctx, s) {
        var c = T.METAL[s.metal] || T.METAL.Fe;
        var x0 = s.x - s.b / 2, bund = s.top + s.l;
        ctx.save();
        if (s.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.55 * s.lys) + ")";
            ctx.lineWidth = 4;
            NK.rundtRekt(ctx, x0 - 4, s.top - 4, s.b + 8, s.l + 8, 5);
            ctx.stroke();
        }
        var g = ctx.createLinearGradient(x0, 0, x0 + s.b, 0);
        g.addColorStop(0, c[2]);
        g.addColorStop(0.3, c[0]);
        g.addColorStop(0.55, c[1]);
        g.addColorStop(1, c[2]);
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x0, s.top, s.b, s.l, 2.5);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Laget i vaesken */
        if (s.belaeg && s.belaeg.x > 0.002) tegnBelaeg(ctx, s, x0, bund);
        /* Klemmen paa glassets kant */
        if (s.klemme !== undefined && s.klemme !== null) {
            var ky = s.klemme;
            ctx.fillStyle = "#8a6a44";
            NK.rundtRekt(ctx, x0 - 6, ky - 9, s.b + 12, 12, 3);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
            ctx.fillRect(x0 - 5, ky - 8, s.b + 10, 2);
            ctx.strokeStyle = "#5e4629";
            ctx.lineWidth = 1;
            ctx.strokeRect(x0 - 6 + 0.5, ky - 9 + 0.5, s.b + 11, 11);
        }
        ctx.restore();
        if (s.etiket !== false) T.stangSkilt(ctx, s.x, s.top, s.metal, s.px);
    };

    /* Skiltet oeverst paa stangen med metallets symbol */
    T.stangSkilt = function (ctx, x, top, metal, px) {
        px = px || 14;
        var c = T.METAL[metal] || T.METAL.Fe;
        ctx.save();
        ctx.font = font("700", px);
        var b = Math.max(28, ctx.measureText(metal).width + 12), h = px + 9;
        var y = top - h + 3;
        ctx.fillStyle = "rgba(20, 20, 28, 0.94)";
        NK.rundtRekt(ctx, x - b / 2, y, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = c[1];
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(metal, x, y + h / 2 + 0.5);
        ctx.restore();
    };

    function tegnBelaeg(ctx, s, x0, bund) {
        var B = s.belaeg, fra = Math.max(B.fra, s.top), x = NK.klamp(B.x, 0, 1);
        if (fra >= bund - 2) return;
        var farve = T.BELAEG[B.metal] || "#555";
        var r = B.frø || T.frø(s.metal + B.metal);
        var tyk = 1.5 + 3.5 * x;
        ctx.save();
        ctx.globalAlpha = NK.klamp(0.25 + x * 1.4, 0, 1);
        ctx.fillStyle = farve;
        NK.rundtRekt(ctx, x0 - tyk * 0.5, fra + 2, s.b + tyk, bund - fra - 1, 3);
        ctx.fill();
        /* Knopper langs kanten */
        var n = Math.round((bund - fra) / 7);
        for (var i = 0; i < n; i++) {
            var y = fra + 4 + (bund - fra - 6) * r();
            var side = r() < 0.5 ? -1 : 1;
            var kx = side < 0 ? x0 - tyk * 0.5 : x0 + s.b + tyk * 0.5;
            ctx.beginPath();
            ctx.arc(kx, y, (0.8 + 2.4 * r()) * (0.4 + x), 0, Math.PI * 2);
            ctx.fill();
        }
        /* Naale og grene paa krystallerne */
        if (T.KRYSTAL[B.metal]) {
            ctx.globalAlpha = NK.klamp(x * 1.6, 0, 1);
            ctx.strokeStyle = farve;
            ctx.lineCap = "round";
            var m = Math.round((bund - fra) / 5);
            for (i = 0; i < m; i++) {
                var yy = fra + 4 + (bund - fra - 6) * r();
                var sd = r() < 0.5 ? -1 : 1;
                var bx = sd < 0 ? x0 - tyk * 0.4 : x0 + s.b + tyk * 0.4;
                var laengde = (4 + 16 * r()) * x * (s.b / 16);
                var v = (sd < 0 ? Math.PI : 0) + (r() - 0.5) * 1.3;
                var ex = bx + Math.cos(v) * laengde, ey = yy + Math.sin(v) * laengde;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(bx, yy);
                ctx.lineTo(ex, ey);
                ctx.stroke();
                if (laengde > 6) {
                    var mx = bx + (ex - bx) * 0.55, my = yy + (ey - yy) * 0.55;
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx + Math.cos(v - 0.7) * laengde * 0.4, my + Math.sin(v - 0.7) * laengde * 0.4);
                    ctx.moveTo(mx, my);
                    ctx.lineTo(mx + Math.cos(v + 0.7) * laengde * 0.35, my + Math.sin(v + 0.7) * laengde * 0.35);
                    ctx.stroke();
                }
            }
            /* Glimt i soelvet */
            if (B.metal === "Ag") {
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                for (i = 0; i < 6; i++) {
                    var gy = fra + 6 + (bund - fra - 10) * r();
                    var gx = x0 - tyk + (s.b + 2 * tyk) * r();
                    ctx.fillRect(gx, gy, 1.6, 1.6);
                }
            }
        }
        ctx.restore();
    }

    /* ----- Holderen til stængerne (fane 1) ------------------------------------------ */
    T.holder = function (ctx, h) {
        ctx.save();
        var g = ctx.createLinearGradient(0, h.y, 0, h.y + h.h);
        g.addColorStop(0, "#9b7a52");
        g.addColorStop(1, "#6e5436");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, h.x, h.y, h.b, h.h, 4);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.fillRect(h.x + 3, h.y + 1, h.b - 6, 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#2a1f13";
        h.huller.forEach(function (x) {
            ctx.beginPath();
            ctx.ellipse(x, h.y + 4, h.hul, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    /* ----- Bobler -------------------------------------------------------------------- */
    T.bobler = function (ctx, liste) {
        ctx.save();
        ctx.lineWidth = 1;
        liste.forEach(function (b) {
            ctx.globalAlpha = NK.klamp(b.a === undefined ? 1 : b.a, 0, 1);
            ctx.fillStyle = "rgba(235, 245, 255, 0.25)";
            ctx.strokeStyle = "rgba(240, 248, 255, 0.85)";
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(b.x - b.r * 0.45, b.y - b.r * 0.45, Math.max(1, b.r * 0.35), Math.max(1, b.r * 0.35));
        });
        ctx.restore();
    };

    /* ----- Stativet paa fane 3: stang, arm og en klemme om metalstangen -------------- */
    T.stativ = function (ctx, st) {
        ctx.save();
        ctx.fillStyle = "#3a3f48";
        NK.rundtRekt(ctx, st.x - 40, st.bund - 9, 120, 9, 3);
        ctx.fill();
        var sg = ctx.createLinearGradient(st.x - 4, 0, st.x + 4, 0);
        sg.addColorStop(0, "#8b939c");
        sg.addColorStop(0.5, "#d3d8dd");
        sg.addColorStop(1, "#7a828b");
        ctx.fillStyle = sg;
        ctx.fillRect(st.x - 4, st.top, 8, st.bund - 9 - st.top);
        /* Muffen og armen hen til stangen */
        ctx.fillStyle = "#4a5059";
        NK.rundtRekt(ctx, st.x - 9, st.armY - 9, 18, 18, 3);
        ctx.fill();
        ctx.fillStyle = "#5c636d";
        ctx.fillRect(st.x + 9, st.armY - 3.5, st.tilX - st.x - 9, 7);
        ctx.fillStyle = "#6b737d";
        NK.rundtRekt(ctx, st.tilX - 13, st.armY - 8, 26, 16, 4);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Hylden og kortene (fane 2) ---------------------------------------------------- */
    T.hylde = function (ctx, hy, px) {
        px = px || 14;
        ctx.save();
        /* Pladserne */
        hy.pladser.forEach(function (p) {
            ctx.strokeStyle = p.lys ? "rgba(242, 197, 61, 0.9)" : "rgba(255, 255, 255, 0.16)";
            ctx.lineWidth = p.lys ? 2.5 : 1.5;
            ctx.setLineDash(p.lys ? [] : [6, 5]);
            NK.rundtRekt(ctx, p.x - p.b / 2, p.y, p.b, p.h, 9);
            ctx.stroke();
        });
        ctx.setLineDash([]);
        /* Planken */
        var g = ctx.createLinearGradient(0, hy.y, 0, hy.y + 14);
        g.addColorStop(0, "#9b7a52");
        g.addColorStop(1, "#6e5436");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, hy.x0, hy.y, hy.x1 - hy.x0, 14, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.fillRect(hy.x0 + 3, hy.y + 1, hy.x1 - hy.x0 - 6, 2);
        /* Pilen under: uaedel til venstre, aedel til hoejre */
        var py = hy.y + 36;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.6)";
        ctx.fillStyle = "rgba(242, 197, 61, 0.6)";
        ctx.lineWidth = 2;
        ctx.font = font("700", px);
        var bV = ctx.measureText("uædel").width, bH = ctx.measureText("ædel").width;
        ctx.beginPath();
        ctx.moveTo(hy.x0 + bV + 18, py);
        ctx.lineTo(hy.x1 - bH - 22, py);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hy.x1 - bH - 14, py);
        ctx.lineTo(hy.x1 - bH - 24, py - 6);
        ctx.lineTo(hy.x1 - bH - 24, py + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#f5dd8a";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillText("uædel", hy.x0 + 4, py + 1);
        ctx.textAlign = "right";
        ctx.fillText("ædel", hy.x1 - 4, py + 1);
        ctx.restore();
    };

    /* Et kort med et metal (eller hydrogen). v.lys, v.fejl, v.ok, v.px */
    T.kort = function (ctx, k, sym, navn, v) {
        v = v || {};
        var px = v.px || 14;
        ctx.save();
        if (v.loeftet) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
            ctx.shadowBlur = 16;
            ctx.shadowOffsetY = 6;
        }
        ctx.fillStyle = "#2f3240";
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 9);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = v.fejl ? "#e05446" : (v.ok ? "#3fae72" : (v.lys ? "#f2c53d" : "#5a5e70"));
        ctx.lineWidth = v.fejl || v.ok || v.lys ? 2.5 : 1.3;
        ctx.stroke();
        /* Billedet: en stump af stangen eller en boble */
        var bx = k.x + k.b / 2, by = k.y + k.h * 0.3;
        if (sym === "H") {
            T.bobler(ctx, [
                { x: bx - k.b * 0.1, y: by + k.h * 0.06, r: k.b * 0.1 },
                { x: bx + k.b * 0.12, y: by - k.h * 0.02, r: k.b * 0.07 },
                { x: bx - k.b * 0.02, y: by - k.h * 0.12, r: k.b * 0.05 }
            ]);
        } else {
            var c = T.METAL[sym];
            var sb = k.b * 0.5, sh = k.h * 0.2;
            var g = ctx.createLinearGradient(0, by - sh / 2, 0, by + sh / 2);
            g.addColorStop(0, c[0]);
            g.addColorStop(0.5, c[1]);
            g.addColorStop(1, c[2]);
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, bx - sb / 2, by - sh / 2, sb, sh, 3);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = font("700", Math.round(px * 1.5));
        ctx.fillText(sym, bx, k.y + k.h * 0.62);
        ctx.fillStyle = "#a9b0ba";
        ctx.font = font("600", px - 1);
        ctx.fillText(navn, bx, k.y + k.h * 0.85);
        ctx.restore();
    };

    /* Pladsen, der skal vaere fri til "uædel" og "ædel" ved siden af raekken */
    T.RAEKKE_KANT = 52;

    /* ----- Spaendingsraekken foroven (fane 2 og 3) ------------------------------------
       r: { x, y, b, h } og raekken (liste af symboler). v.alfa: det hele,
       v.lys: { sym: true } fremhaevede, v.maerker: [{ sym, tekst, farve }]
       under kasserne, v.pil: { fra, til, tekst } fra én kasse til en anden,
       v.px: skriften. Svaret er midten af hver kasse. */
    T.raekke = function (ctx, r, raekke, v) {
        v = v || {};
        var n = raekke.length, mell = Math.max(3, r.b * 0.006);
        var kb = (r.b - mell * (n - 1)) / n;
        var px = v.px || NK.klamp(kb * 0.36, 12, 18);
        var midter = {};
        ctx.save();
        ctx.globalAlpha = v.alfa === undefined ? 1 : v.alfa;
        /* Endernes ord, uden for kasserne (T.RAEKKE_KANT i hver side) */
        ctx.font = font("700", 13);
        ctx.fillStyle = "#f5dd8a";
        ctx.textBaseline = "middle";
        ctx.textAlign = "right";
        ctx.fillText("uædel", r.x - 8, r.y + r.h / 2);
        ctx.textAlign = "left";
        ctx.fillText("ædel", r.x + r.b + 8, r.y + r.h / 2);
        raekke.forEach(function (sym, i) {
            var x = r.x + i * (kb + mell);
            var lys = v.lys && v.lys[sym];
            var erH = sym === "H";
            ctx.fillStyle = lys ? "rgba(242, 197, 61, 0.22)" : (erH ? "rgba(90, 169, 230, 0.16)" : "rgba(255, 255, 255, 0.06)");
            NK.rundtRekt(ctx, x, r.y, kb, r.h, 6);
            ctx.fill();
            ctx.strokeStyle = lys ? "#f2c53d" : (erH ? "rgba(120, 190, 240, 0.7)" : "rgba(255, 255, 255, 0.2)");
            ctx.lineWidth = lys ? 2 : 1;
            ctx.stroke();
            ctx.fillStyle = lys ? "#ffffff" : "#dde3ea";
            ctx.font = font("700", px);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(sym, x + kb / 2, r.y + r.h / 2 + 0.5);
            midter[sym] = { x: x + kb / 2, y: r.y + r.h / 2, b: kb };
        });
        /* Pilen for elektronerne, under kasserne */
        if (v.pil && midter[v.pil.fra] && midter[v.pil.til]) {
            var a = midter[v.pil.fra], b = midter[v.pil.til];
            var y0 = r.y + r.h + 8, top = y0 + NK.klamp(r.h * 0.7, 18, 28);
            ctx.strokeStyle = "#f2c53d";
            ctx.fillStyle = "#f2c53d";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(a.x, y0);
            ctx.quadraticCurveTo((a.x + b.x) / 2, top + 10, b.x, y0);
            ctx.stroke();
            var ret = b.x > a.x ? -1 : 1;
            ctx.beginPath();
            ctx.moveTo(b.x, y0);
            ctx.lineTo(b.x + ret * 4, y0 + 9);
            ctx.lineTo(b.x + ret * 10, y0 + 4);
            ctx.closePath();
            ctx.fill();
            /* Elektronen som en gul prik med e⁻ ved siden af, som i luppen */
            var mx = (a.x + b.x) / 2, my = (y0 + top) / 2 + 13;
            ctx.beginPath();
            ctx.arc(mx - 12, my, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = "#ffe14a";
            ctx.fill();
            ctx.fillStyle = "#f5dd8a";
            ctx.font = font("700", 16);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(v.pil.tekst || "e⁻", mx - 4, my);
        }
        /* Maerkerne over kasserne */
        (v.maerker || []).forEach(function (m) {
            var c = midter[m.sym];
            if (!c) return;
            ctx.font = font("700", 12);
            var tb = ctx.measureText(m.tekst).width + 10;
            var y = r.y - 30;
            ctx.fillStyle = m.farve;
            NK.rundtRekt(ctx, c.x - tb / 2, y, tb, 18, 5);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(c.x - 5, y + 18);
            ctx.lineTo(c.x + 5, y + 18);
            ctx.lineTo(c.x, y + 23);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#15151b";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(m.tekst, c.x, y + 9.5);
        });
        ctx.restore();
        return midter;
    };

    /* ----- Luppen --------------------------------------------------------------------- */
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

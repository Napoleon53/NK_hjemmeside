/* =====================================================================
   tegning.js - det, alle tre faner tegner

   Plakaten med det periodiske system, atomkuglerne og molekylerne,
   vaegten med displayet, 1 mol af et stof (baegerglas, vejebaad eller
   ballon), skaalvaegten, flasken og etiketterne. Funktionerne tegner én
   ting et bestemt sted og husker intet selv; fanerne bestemmer, hvor
   tingene staar, og hvordan de bevaeger sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        if (hex.charAt(0) === "r") return hex.replace(/[^0-9,]/g, "").split(",").slice(0, 3).map(Number);
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

    /* Et fast pseudo-tilfaeldigt tal, saa pulver og kork ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* Farverne i det periodiske system: metal, ikke-metal, halvmetal, aedelgas (som sc1.2) */
    T.SLAGS_FARVE = { m: "#9fb8d8", i: "#9fd8a9", h: "#d8d39f", a: "#c7a9dd" };

    /* ----- Rummet og bordet (som sc1.2) -------------------------------------- */
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
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.fillRect(x - 14, y + plade + 18, 8, 3);
            ctx.fillRect(x + 6, y + plade + 18, 8, 3);
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Plakaten: det periodiske system ------------------------------------
       11 kolonner (hovedgruppe 1-2, Fe, Cu, Zn, hovedgruppe 3-8) og 4
       perioder. Hvert felt har atomnummeret foroven, symbolet i midten og
       atommassen forneden. Hullet i periode 1 viser, hvad tallene er. */
    T.plakatLay = function (x0, y0, maxB, maxH) {
        var pad = 8, sp = 2, pv = 16, hh = 16;
        var cb = (maxB - 2 * pad - pv - 10 * sp) / 11.5;
        cb = Math.min(cb, 70);
        var ch = Math.min(cb * 0.94, (maxH - 2 * pad - hh - 3 * sp) / 4, 64);
        ch = Math.max(ch, 26);
        var g = cb * 0.25;
        var B = 2 * pad + pv + 11 * cb + 10 * sp + 2 * g;
        var H = 2 * pad + hh + 4 * ch + 3 * sp;
        var x = x0 + Math.max(0, (maxB - B) / 2);
        var p = { x: x, y: y0, b: B, h: H, cb: cb, ch: ch, sp: sp, celler: {}, kolX: [] };
        for (var k = 0; k < 11; k++) {
            p.kolX.push(x + pad + pv + k * (cb + sp) + (k >= 2 ? g : 0) + (k >= 5 ? g : 0));
        }
        p.raekkeY = [];
        for (var r = 0; r < 4; r++) p.raekkeY.push(y0 + pad + hh + r * (ch + sp));
        D.GRUNDSTOFFER.forEach(function (gs) {
            p.celler[gs.s] = { x: p.kolX[gs.kol], y: p.raekkeY[gs.periode - 1], b: cb, h: ch };
        });
        return p;
    };

    /* Symbolet i feltet under punktet, eller null */
    T.plakatCelle = function (p, px, py) {
        for (var s in p.celler) {
            if (!Object.prototype.hasOwnProperty.call(p.celler, s)) continue;
            var c = p.celler[s];
            if (px >= c.x && px <= c.x + c.b && py >= c.y && py <= c.y + c.h) return s;
        }
        return null;
    };

    /* v.lys: symbolet under musen. v.fremhaev: symbolet, hintet peger paa.
       v.markeret: { s: true } for grundstofferne i opgavens formel.
       v.tid: uret, til blink. */
    T.plakat = function (ctx, p, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(p.x + 4, p.y + 5, p.b, p.h);
        ctx.fillStyle = "#ece8dd";
        NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Tegnestifter */
        [[p.x + 7, p.y + 7], [p.x + p.b - 7, p.y + 7]].forEach(function (q) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(q[0], q[1], 3.2, 0, Math.PI * 2);
            ctx.fill();
        });

        var cb = p.cb, ch = p.ch;
        /* Hovedgruppernes numre og periodernes */
        ctx.fillStyle = "#6b6456";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = font("700", 12);
        for (var k = 0; k < 11; k++) {
            var hg = D.HOVEDGRUPPE[k];
            if (!hg) continue;
            ctx.fillText(String(hg), p.kolX[k] + cb / 2, p.raekkeY[0] - 4);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (var r = 0; r < 4; r++) ctx.fillText(String(r + 1), p.x + 8 + 8, p.raekkeY[r] + ch / 2);

        /* Forklaringen i hullet i periode 1: hvad er hvad i et felt */
        var lx = p.kolX[2], ly = p.raekkeY[0];
        var lb = p.kolX[9] + cb - lx;
        if (lb > cb * 3.2) {
            var eks = D.grundstof("O");
            var ex = lx + 4;
            T.plakatFelt(ctx, eks, ex, ly, cb, ch, {});
            ctx.strokeStyle = "#6b6456";
            ctx.fillStyle = "#4a4438";
            ctx.lineWidth = 1.2;
            var tpx = NK.klamp(ch * 0.27, 11, 14);
            ctx.font = font("600", tpx);
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            var zY = ly + NK.klamp(ch * 0.16, 7, 11), mY = ly + ch - NK.klamp(ch * 0.16, 6, 10);
            var tx = ex + cb + 12;
            ctx.beginPath();
            ctx.moveTo(ex + cb * 0.3, zY); ctx.lineTo(tx - 3, zY);
            ctx.moveTo(ex + cb * 0.78, mY); ctx.lineTo(tx - 3, mY);
            ctx.stroke();
            ctx.fillText("atomnummer", tx, zY);
            ctx.fillText("atommasse", tx, mY);
        }

        /* Overskriften over de tre overgangsmetaller */
        var ox = p.kolX[2], ob = p.kolX[4] + cb - ox;
        var oy = p.raekkeY[3] - 5;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        NK.passendeSkrift(ctx, "overgangsmetaller", ob + 6, 12, 9, "600");
        ctx.fillStyle = "#6b6456";
        ctx.fillText("overgangsmetaller", ox + ob / 2, oy);
        ctx.strokeStyle = "rgba(107, 100, 86, 0.6)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(p.kolX[1] + cb + p.sp + 2, p.raekkeY[3] + ch / 2);
        ctx.lineTo(ox - 3, p.raekkeY[3] + ch / 2);
        ctx.moveTo(p.kolX[4] + cb + 3, p.raekkeY[3] + ch / 2);
        ctx.lineTo(p.kolX[5] - p.sp - 2, p.raekkeY[3] + ch / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        var tid = v.tid || 0;
        D.GRUNDSTOFFER.forEach(function (gs) {
            var c = p.celler[gs.s];
            T.plakatFelt(ctx, gs, c.x, c.y, cb, ch, {
                lys: v.lys === gs.s,
                markeret: v.markeret && v.markeret[gs.s],
                fremhaev: v.fremhaev === gs.s ? 0.55 + 0.45 * Math.sin(tid * 7) : 0
            });
        });
        ctx.restore();
    };

    /* Ét felt i det periodiske system */
    T.plakatFelt = function (ctx, gs, x, y, b, h, v) {
        ctx.save();
        ctx.fillStyle = T.SLAGS_FARVE[gs.slags];
        NK.rundtRekt(ctx, x, y, b, h, 3);
        ctx.fill();
        if (v.fremhaev) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.55 * v.fremhaev + 0.25) + ")";
            ctx.fill();
        }
        ctx.strokeStyle = v.lys || v.fremhaev ? "#1f232b" : "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = v.lys || v.fremhaev ? 2 : 1;
        ctx.stroke();
        if (v.markeret) {
            ctx.strokeStyle = "rgba(31, 35, 43, 0.75)";
            ctx.lineWidth = 1.4;
            ctx.setLineDash([3, 2]);
            NK.rundtRekt(ctx, x + 2, y + 2, b - 4, h - 4, 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.fillStyle = "#1f232b";
        var zpx = NK.klamp(h * 0.24, 9, 12);
        ctx.font = font("600", zpx);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(String(gs.z), x + 3, y + 2);
        var spx = NK.klamp(Math.min(b * 0.36, h * 0.4), 12, 24);
        ctx.font = font("700", spx);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(gs.s, x + b / 2, y + h * 0.43 + (h < 40 ? 1 : 2));
        var mtekst = NK.komma(gs.m);
        NK.passendeSkrift(ctx, mtekst, b - 4, NK.klamp(Math.min(b * 0.25, h * 0.27), 11, 15), 9, "600");
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#2b2f38";
        ctx.fillText(mtekst, x + b / 2, y + h - Math.max(3, h * 0.07));
        ctx.restore();
    };

    /* ----- Atomkuglerne -----------------------------------------------------
       Farverne foelger de almindelige molekylbyggesaet. */
    var KUGLE = {
        H: ["#f4f4f1", "#b9bcc2", "#1f232b"], He: ["#e8fbff", "#9ed8e0", "#1f232b"],
        C: ["#5b5d66", "#25262b", "#ffffff"], N: ["#7aa3ff", "#2c55c9", "#ffffff"],
        O: ["#ff8a7c", "#c7362a", "#ffffff"], F: ["#d6f59a", "#8fb83a", "#1f232b"],
        Na: ["#c99cf5", "#7b3fc4", "#ffffff"], Mg: ["#a8e89a", "#4f9a3c", "#10301a"],
        Al: ["#d9c7d0", "#8d7582", "#1f232b"], Si: ["#f0d2b0", "#b08a5c", "#1f232b"],
        P: ["#ffb877", "#d06a14", "#2b1a08"], S: ["#fbe683", "#c9a716", "#2b2410"],
        Cl: ["#9be88f", "#35a02a", "#10301a"], Ar: ["#b8e6f0", "#5fa9bb", "#1f232b"],
        K: ["#b98af0", "#6a2fb5", "#ffffff"], Ca: ["#8fe0a0", "#2f8c4a", "#10301a"],
        Fe: ["#f0a47a", "#b2542a", "#ffffff"], Cu: ["#f2b27a", "#b8662c", "#2b1a08"],
        Zn: ["#b7bde0", "#6c73a8", "#ffffff"], Br: ["#d27a6a", "#8a2a1c", "#ffffff"]
    };
    var STANDARD = ["#d8d8e0", "#8a8a98", "#1f232b"];
    T.kugleFarve = function (s) { return (KUGLE[s] || STANDARD)[1]; };

    /* v.ring: en gul ring om kuglen (0-1). v.alfa */
    T.atom = function (ctx, x, y, r, s, v) {
        v = v || {};
        if (r <= 0.5) return;
        var f = KUGLE[s] || STANDARD;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(1, f[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        if (v.ring) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.ring, 0, 1) + ")";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(x, y, r + 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (r >= 7.5) {
            ctx.fillStyle = f[2];
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, s, r * 1.6, Math.max(10, r * 0.95), 8, "700");
            ctx.fillText(s, x, y + 0.5);
        }
        ctx.restore();
    };

    /* En binding mellem to punkter. orden 0: ingen streg (ioner). */
    T.binding = function (ctx, a, b, orden, u, alfa) {
        if (!orden) return;
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
        if (l < 1) return;
        var nx = -dy / l, ny = dx / l;
        var bredde = NK.klamp(u * 0.1, 2, 5);
        var af = orden === 1 ? [0] : (orden === 2 ? [-1, 1] : [-1.6, 0, 1.6]);
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.strokeStyle = "#9aa2ad";
        ctx.lineCap = "round";
        ctx.lineWidth = orden === 1 ? bredde : bredde * 0.7;
        af.forEach(function (o) {
            var ox = nx * o * bredde * 0.9, oy = ny * o * bredde * 0.9;
            ctx.beginPath();
            ctx.moveTo(a.x + ox, a.y + oy);
            ctx.lineTo(b.x + ox, b.y + oy);
            ctx.stroke();
        });
        ctx.restore();
    };

    /* Strukturens yderkanter i bindingslaengder, med kuglernes radius */
    T.strukturMaal = function (struktur) {
        var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        struktur.atomer.forEach(function (a) {
            var r = D.radius(a[0]);
            x0 = Math.min(x0, a[1] - r); x1 = Math.max(x1, a[1] + r);
            y0 = Math.min(y0, a[2] - r); y1 = Math.max(y1, a[2] + r);
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1, b: x1 - x0, h: y1 - y0, mx: (x0 + x1) / 2, my: (y0 + y1) / 2 };
    };

    /* Den stoerrelse (px pr. bindingslaengde), strukturen kan tegnes i
       inden for bredden b og hoejden h */
    T.strukturSkala = function (struktur, b, h, loft) {
        var m = T.strukturMaal(struktur);
        return Math.min(b / m.b, h / m.h, loft || 60);
    };

    /* Et molekyle med bindinger. Kuglerne tegnes fra de smaa til de
       store, saa H ligger bagved.
       pos: [{ x, y }] for hvert atom i strukturen, eller null (saa
       regnes de ud fra cx, cy og u). v.bindAlfa, v.alfa, v.ring: { s: 0-1 } */
    T.molekyle = function (ctx, struktur, cx, cy, u, v, pos) {
        v = v || {};
        var m = T.strukturMaal(struktur);
        var p = pos || struktur.atomer.map(function (a) {
            return { x: cx + (a[1] - m.mx) * u, y: cy + (a[2] - m.my) * u };
        });
        var ba = v.bindAlfa === undefined ? 1 : v.bindAlfa;
        if (ba > 0.01) {
            struktur.bindinger.forEach(function (bd) {
                T.binding(ctx, p[bd[0]], p[bd[1]], bd[2], u, ba * (v.alfa === undefined ? 1 : v.alfa));
            });
        }
        var raekke = struktur.atomer.map(function (a, i) { return i; });
        raekke.sort(function (i, j) { return D.radius(struktur.atomer[i][0]) - D.radius(struktur.atomer[j][0]); });
        raekke.forEach(function (i) {
            var s = struktur.atomer[i][0];
            T.atom(ctx, p[i].x, p[i].y, D.radius(s) * u, s, { alfa: v.alfa, ring: v.ring ? v.ring[s] : 0 });
        });
        return p;
    };

    /* ----- Vaegten --------------------------------------------------------------
       (x, y): midten af bunden. b: bredden. tekst: det, displayet viser.
       v.lys: displayet lyser op (et nyt tal). Giver skaalens overflade. */
    T.vaegt = function (ctx, x, y, b, tekst, v) {
        v = v || {};
        var M = MAAL.vaegt, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        NK.Sprites.tegn(ctx, "vaegt", x0, y0, b, h);
        var dx = x0 + M.dispV * k, dy = y0 + M.dispTop * k, db = (M.dispH - M.dispV) * k, dh = (M.dispBund - M.dispTop) * k;
        ctx.save();
        ctx.fillStyle = v.lys ? "rgba(125, 240, 192, " + (0.1 + 0.12 * v.lys) + ")" : "rgba(125, 240, 192, 0.06)";
        ctx.fillRect(dx + 2, dy + 2, db - 4, dh - 4);
        ctx.fillStyle = "#7df0c0";
        ctx.shadowColor = "rgba(125, 240, 192, 0.6)";
        ctx.shadowBlur = 6;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        /* Etiketten ("1 mol") staar lille til venstre, og tallet faar resten */
        var etiketB = 0;
        if (v.etiket) {
            ctx.font = "600 " + NK.klamp(dh * 0.3, 8, 13) + "px " + DISPLAY;
            etiketB = ctx.measureText(v.etiket).width + 8;
        }
        var px = NK.klamp(dh * 0.62, 10, 30);
        ctx.font = "700 " + px + "px " + DISPLAY;
        var t = tekst || "";
        while (px > 8 && ctx.measureText(t).width > db - 10 - etiketB) { px -= 0.5; ctx.font = "700 " + px + "px " + DISPLAY; }
        ctx.fillText(t, dx + db - 6, dy + dh / 2 + 1);
        if (v.etiket) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(125, 240, 192, 0.75)";
            ctx.textAlign = "left";
            ctx.font = "600 " + NK.klamp(dh * 0.3, 8, 13) + "px " + DISPLAY;
            ctx.fillText(v.etiket, dx + 5, dy + dh * 0.3);
        }
        ctx.restore();
        return { x: x, y: y0 + M.skaalY * k, b: M.skaalB * k, k: k, top: y0, h: h };
    };

    T.vaegtHoejde = function (b) { return MAAL.vaegt.h * b / MAAL.vaegt.b; };

    /* ----- 1 mol af et stof paa skaalen ------------------------------------------
       (x, y): midten af det, det staar paa. b: vaegtskaalens bredde.
       t: 0-1, hvor langt det er kommet frem. */

    /* Vaeske i baegerglas. Hoejden foelger rumfanget (1,2 enheder pr. mL). */
    T.baeger = function (ctx, x, y, bb, st, t, mL) {
        var M = MAAL.baegerglas, k = bb / M.b, h = M.h * k;
        var x0 = x - bb / 2, y0 = y - h + 2 * k;
        var fyld = NK.klamp(mL * M.mlY * t, 0, M.bund - M.randY - 8);
        ctx.save();
        if (fyld > 0.5) {
            var ix = x0 + M.indV * k, ib = (M.indH - M.indV) * k, bund = y0 + M.bund * k;
            var top = bund - fyld * k;
            var g = ctx.createLinearGradient(0, top, 0, bund);
            g.addColorStop(0, rgba(st.farve, 0.42));
            g.addColorStop(1, rgba(st.farve, 0.62));
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, ix, top, ib, bund - top, Math.min(7 * k, (bund - top) / 2));
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
            ctx.fillRect(ix + 1, top, ib - 2, Math.max(1, 1.6 * k));
        }
        NK.Sprites.tegn(ctx, "baegerglas", x0, y0, bb, h);
        ctx.restore();
        return { x: x0, y: y0, b: bb, h: h };
    };

    /* Pulver i en vejebaad. hoejde: bunkens hoejde i px ved t = 1. */
    T.pulver = function (ctx, x, y, bb, st, t, hoejde, nr) {
        var M = MAAL.vejebaad, k = bb / M.b, h = M.h * k;
        var x0 = x - bb / 2, y0 = y - M.bund * k;
        var bundY = y0 + M.indBund * k + 4 * k;
        var hh = hoejde * NK.blod(t);
        var ix0 = x0 + (M.indV + 4) * k, ix1 = x0 + (M.indH - 4) * k;
        ctx.save();
        if (hh > 0.5) {
            var g = ctx.createLinearGradient(0, bundY - hh, 0, bundY);
            g.addColorStop(0, nuance(st.farve, 0.05));
            g.addColorStop(1, nuance(st.farve, -0.16));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(ix0, bundY + 2);
            ctx.quadraticCurveTo(ix0 + (ix1 - ix0) * 0.18, bundY - hh * 0.55, x - (ix1 - ix0) * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(x, bundY - hh * 1.06, x + (ix1 - ix0) * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(ix1 - (ix1 - ix0) * 0.18, bundY - hh * 0.55, ix1, bundY + 2);
            ctx.closePath();
            ctx.fill();
            ctx.save();
            ctx.clip();
            var r = froe((nr || 0) + 11);
            for (var i = 0; i < 90; i++) {
                ctx.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.1)";
                ctx.fillRect(ix0 + r() * (ix1 - ix0), bundY - r() * hh, 1.5, 1.5);
            }
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vejebaad", x0, y0, bb, h);
        ctx.restore();
        return { x: x0, y: bundY - hh, b: bb, h: y - (bundY - hh) };
    };

    /* Gas i en ballon, bundet til et lille lod paa skaalen. r: radius ved t = 1 */
    T.ballon = function (ctx, x, y, r, st, t, tid) {
        var rr = r * NK.pop(t);
        var sving = Math.sin((tid || 0) * 1.3) * r * 0.04;
        var cx = x + sving, cy = y - 16 - r * 0.55 - rr * 1.05;
        ctx.save();
        /* Loddet og snoren */
        ctx.fillStyle = "#6f7680";
        NK.rundtRekt(ctx, x - 8, y - 9, 16, 9, 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 230, 230, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y - 9);
        ctx.quadraticCurveTo(x - 6, (y - 9 + cy + rr) / 2, cx, cy + rr * 1.02 + 4);
        ctx.stroke();
        if (rr > 1) {
            var g = ctx.createRadialGradient(cx - rr * 0.35, cy - rr * 0.4, rr * 0.1, cx, cy, rr * 1.05);
            g.addColorStop(0, "rgba(255, 255, 255, 0.85)");
            g.addColorStop(0.35, rgba(st.farve, 0.55));
            g.addColorStop(1, rgba(nuance(st.farve, -0.35), 0.75));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rr * 0.94, rr * 1.04, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = rgba(nuance(st.farve, -0.35), 0.9);
            ctx.beginPath();
            ctx.moveTo(cx - 4, cy + rr * 1.04 + 5);
            ctx.lineTo(cx, cy + rr * 1.02);
            ctx.lineTo(cx + 4, cy + rr * 1.04 + 5);
            ctx.closePath();
            ctx.fill();
            if (rr > 26) {
                ctx.fillStyle = "rgba(30, 34, 42, 0.8)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                NK.passendeSkrift(ctx, st.tekst, rr * 1.2, NK.klamp(rr * 0.34, 12, 26), 10, "700");
                ctx.fillText(st.tekst, cx, cy);
            }
        }
        ctx.restore();
        return { x: cx - rr, y: cy - rr * 1.04, b: 2 * rr, h: y - (cy - rr * 1.04) };
    };

    /* ----- Skaalvaegten -------------------------------------------------------
       lay: { x, y (knivsaeggen), k (fodens skala), L (armens halve
       laengde i px), sk (skaalenes skala) }. vinkel > 0: hoejre side nede.
       Giver skaalenes flader: [{ x, y }, { x, y }]. */
    T.skaalFlader = function (lay, vinkel) {
        var Ms = MAAL.skaal_skaal, c = Math.cos(vinkel), s = Math.sin(vinkel);
        return [-1, 1].map(function (side) {
            var hx = lay.x + side * lay.L * c, hy = lay.y + side * lay.L * s;
            return { x: hx, y: hy + (Ms.fladeY - Ms.krogY) * lay.sk, krogX: hx, krogY: hy };
        });
    };

    T.skaalvaegtFod = function (ctx, lay, vinkel) {
        var Mf = MAAL.skaal_fod, k = lay.k;
        NK.Sprites.tegn(ctx, "skaal_fod", lay.x - Mf.aegX * k, lay.y - Mf.aegY * k, Mf.b * k, Mf.h * k);
        /* Viseren drejer med armen */
        var l = (Mf.skalaY - Mf.aegY + 8) * k;
        ctx.save();
        ctx.strokeStyle = "#2b2114";
        ctx.lineWidth = Math.max(1.5, 2.2 * k);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(lay.x, lay.y);
        ctx.lineTo(lay.x - Math.sin(vinkel) * l, lay.y + Math.cos(vinkel) * l);
        ctx.stroke();
        ctx.restore();
    };

    T.skaalvaegtArm = function (ctx, lay, vinkel) {
        var Ma = MAAL.skaal_arm;
        var ka = (2 * lay.L) / (Ma.krogH - Ma.krogV);
        NK.Sprites.tegnPositur(ctx, "skaal_arm", { x: lay.x, y: lay.y, v: vinkel }, { x: Ma.midtX, y: Ma.midtY }, 1, ka);
    };

    T.skaalvaegtSkaal = function (ctx, lay, flade) {
        var Ms = MAAL.skaal_skaal, k = lay.sk;
        NK.Sprites.tegn(ctx, "skaal_skaal", flade.krogX - Ms.krogX * k, flade.krogY - Ms.krogY * k, Ms.b * k, Ms.h * k);
    };

    /* ----- Flasken paa fane 3 ----------------------------------------------------
       En brun reagensflaske, saa man ikke kan se, hvad der er i den.
       v.etiket: stoffet paa etiketten (eller null). v.stjerne */
    T.flaske = function (ctx, x, y, h, v) {
        v = v || {};
        var M = MAAL.flaske, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.44, Math.max(2, 4 * k), 0, 0, Math.PI * 2);
        ctx.fill();
        /* Det brune glas */
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x0 + 38 * k, y0 + 36 * k);
        ctx.lineTo(x0 + 38 * k, y0 + 42 * k);
        ctx.quadraticCurveTo(x0 + 38 * k, y0 + 48 * k, x0 + 30 * k, y0 + 50 * k);
        ctx.quadraticCurveTo(x0 + 10 * k, y0 + 54 * k, x0 + 10 * k, y0 + 70 * k);
        ctx.lineTo(x0 + 10 * k, y0 + 136 * k);
        ctx.quadraticCurveTo(x0 + 10 * k, y0 + 146 * k, x0 + 20 * k, y0 + 146 * k);
        ctx.lineTo(x0 + 80 * k, y0 + 146 * k);
        ctx.quadraticCurveTo(x0 + 90 * k, y0 + 146 * k, x0 + 90 * k, y0 + 136 * k);
        ctx.lineTo(x0 + 90 * k, y0 + 70 * k);
        ctx.quadraticCurveTo(x0 + 90 * k, y0 + 54 * k, x0 + 70 * k, y0 + 50 * k);
        ctx.quadraticCurveTo(x0 + 62 * k, y0 + 48 * k, x0 + 62 * k, y0 + 42 * k);
        ctx.lineTo(x0 + 62 * k, y0 + 36 * k);
        ctx.closePath();
        var gb = ctx.createLinearGradient(x0, 0, x0 + b, 0);
        gb.addColorStop(0, "rgba(120, 62, 18, 0.9)");
        gb.addColorStop(0.3, "rgba(160, 88, 30, 0.85)");
        gb.addColorStop(1, "rgba(92, 46, 12, 0.92)");
        ctx.fillStyle = gb;
        ctx.fill();
        ctx.restore();
        NK.Sprites.tegn(ctx, "flaske", x0, y0, b, h);
        /* Etiketten */
        var ex = x0 + M.etiketV * k, ey = y0 + M.etiketTop * k, eb = (M.etiketH - M.etiketV) * k, eh = (M.etiketBund - M.etiketTop) * k;
        if (v.etiket) {
            T.etiket(ctx, ex, ey, eb, eh, v.etiket, { farve: v.farve });
        } else {
            /* Limresterne efter etiketten, der faldt af */
            ctx.fillStyle = "rgba(235, 225, 200, 0.35)";
            NK.rundtRekt(ctx, ex + eb * 0.05, ey + eh * 0.1, eb * 0.9, eh * 0.8, 3);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = font("700", NK.klamp(eh * 0.55, 14, 44));
            ctx.fillText("?", ex + eb / 2, ey + eh / 2 + 1);
        }
        if (v.stjerne) T.stjerne(ctx, x + b * 0.36, y0 + 60 * k, Math.max(6, 9 * k), v.stjerne);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: { x: ex, y: ey, b: eb, h: eh } };
    };

    T.flaskeBredde = function (h) { return h * MAAL.flaske.b / MAAL.flaske.h; };

    /* En etiket med formlen og navnet. v.kryds: streget ud, med molarmassen.
       v.lys: musen er over den. v.farve: stribens farve. v.M: vis molarmassen. */
    T.etiket = function (ctx, x, y, b, h, st, v) {
        v = v || {};
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
        ctx.shadowBlur = v.skygge === false ? 0 : 6;
        ctx.shadowOffsetY = v.skygge === false ? 0 : 2;
        ctx.fillStyle = v.kryds ? "#e9e4da" : "#fbfbf7";
        NK.rundtRekt(ctx, x, y, b, h, 4);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = v.lys ? "#f2c53d" : "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = v.lys ? 2.5 : 1;
        ctx.stroke();
        ctx.fillStyle = v.farve || "#9b6bd6";
        ctx.fillRect(x + 1, y + 1, b - 2, Math.max(3, h * 0.08));
        ctx.fillStyle = v.kryds ? "#8a857c" : "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var visM = v.M || v.kryds;
        NK.passendeSkrift(ctx, st.tekst, b * 0.88, NK.klamp(h * (visM ? 0.3 : 0.36), 12, 34), 10, "700");
        ctx.fillText(st.tekst, x + b / 2, y + h * (visM ? 0.33 : 0.42));
        NK.passendeSkrift(ctx, st.navn, b * 0.88, NK.klamp(h * 0.16, 11, 16), 9, "600");
        ctx.fillStyle = v.kryds ? "#8a857c" : "#4a4f5a";
        ctx.fillText(st.navn, x + b / 2, y + h * (visM ? 0.58 : 0.72));
        if (visM) {
            ctx.fillStyle = v.kryds ? "#c0392b" : "#1d7a48";
            NK.passendeSkrift(ctx, NK.komma(st.M) + " g/mol", b * 0.9, NK.klamp(h * 0.18, 12, 18), 10, "700");
            ctx.fillText(NK.komma(st.M) + " g/mol", x + b / 2, y + h * 0.82);
        }
        if (v.kryds) {
            ctx.strokeStyle = "rgba(192, 57, 43, 0.85)";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(x + b * 0.08, y + h * 0.18);
            ctx.lineTo(x + b * 0.92, y + h * 0.5);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Maerkaten i snor (som sc1.2) -------------------------------------------
       (x, y) er oeverste venstre hjoerne, og snoren gaar til (sx, sy).
       linjer: [{ t, px, vaegt, farve }] */
    T.maerke = function (ctx, x, y, b, h, sx, sy, linjer) {
        ctx.save();
        var hul = { x: x + h * 0.28, y: y + h / 2 };
        ctx.strokeStyle = "rgba(230, 220, 200, 0.75)";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo((sx + hul.x) / 2, Math.max(sy, hul.y) + 16, hul.x, hul.y);
        ctx.stroke();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        var sk = h * 0.22;
        ctx.beginPath();
        ctx.moveTo(x + sk, y);
        ctx.lineTo(x + b, y);
        ctx.lineTo(x + b, y + h);
        ctx.lineTo(x + sk, y + h);
        ctx.lineTo(x, y + h - sk);
        ctx.lineTo(x, y + sk);
        ctx.closePath();
        ctx.fillStyle = "#e9d8ae";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "rgba(110, 80, 30, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#c9b688";
        ctx.beginPath();
        ctx.arc(hul.x, hul.y, Math.max(3, h * 0.07), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#2a2522";
        ctx.beginPath();
        ctx.arc(hul.x, hul.y, Math.max(1.6, h * 0.035), 0, Math.PI * 2);
        ctx.fill();
        var tx = x + h * 0.48, tb = b - h * 0.48 - 8;
        var samlet = 0;
        linjer.forEach(function (l) { samlet += l.px * 1.25; });
        var ly = y + (h - samlet) / 2;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        linjer.forEach(function (l) {
            var cy = ly + l.px * 0.62;
            NK.passendeSkrift(ctx, l.t, tb, l.px, 10, l.vaegt || "700");
            ctx.fillStyle = l.farve || "#2b2418";
            ctx.fillText(l.t, tx + tb / 2, cy);
            ly += l.px * 1.25;
        });
        ctx.restore();
    };

    /* ----- Opslagstavlen af kork -------------------------------------------- */
    T.kork = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#5a3d25";
        NK.rundtRekt(ctx, x, y, b, h, 4);
        ctx.fill();
        var r = 6;
        ctx.fillStyle = "#b98a57";
        ctx.fillRect(x + r, y + r, b - 2 * r, h - 2 * r);
        var f = froe(Math.round(b + h));
        for (var i = 0; i < b * h / 90; i++) {
            ctx.fillStyle = f() < 0.5 ? "rgba(90, 55, 25, 0.28)" : "rgba(255, 230, 190, 0.2)";
            ctx.fillRect(x + r + f() * (b - 2 * r), y + r + f() * (h - 2 * r), 2, 2);
        }
        ctx.restore();
        return { x: x + r, y: y + r, b: b - 2 * r, h: h - 2 * r };
    };

    /* ----- Smaating (som sc1.2) -------------------------------------------------- */
    T.stjerne = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === true ? 1 : NK.klamp(alfa, 0, 1);
        ctx.beginPath();
        for (var i = 0; i < 10; i++) {
            var v = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
            ctx.lineTo(x + Math.cos(v) * rr, y + Math.sin(v) * rr);
        }
        ctx.closePath();
        ctx.fillStyle = "#f2c53d";
        ctx.fill();
        ctx.strokeStyle = "#8a6510";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* En taleboble-agtig forklaring over punktet (x, y). Er der ikke plads
       over det, kommer den under yUnder i stedet, med pilen opad.
       linjer: [{ t, px, vaegt, farve }] */
    T.boble = function (ctx, x, y, linjer, W, yUnder) {
        ctx.save();
        var pad = 9, b = 0, h = 0;
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            b = Math.max(b, ctx.measureText(l.t).width);
            h += (l.px || 13) * 1.35;
        });
        b += pad * 2;
        h += pad * 2 - 4;
        var under = y - h - 10 < 4 && yUnder !== undefined;
        var bx = NK.klamp(x - b / 2, 4, W - b - 4), by = under ? yUnder + 10 : y - h - 10;
        ctx.fillStyle = "rgba(14, 14, 20, 0.94)";
        ctx.strokeStyle = "#4a4a58";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        if (under) {
            ctx.moveTo(x - 6, by);
            ctx.lineTo(x, by - 7);
            ctx.lineTo(x + 6, by);
        } else {
            ctx.moveTo(x - 6, by + h);
            ctx.lineTo(x, by + h + 7);
            ctx.lineTo(x + 6, by + h);
        }
        ctx.closePath();
        ctx.fill();
        var ly = by + pad;
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "600", l.px || 13);
            ctx.fillStyle = l.farve || "#f2f3f5";
            ctx.fillText(l.t, bx + pad, ly);
            ly += (l.px || 13) * 1.35;
        });
        ctx.restore();
    };

    /* En boble med et grundstof paa plakaten */
    T.plakatBoble = function (ctx, p, s, W) {
        var c = p.celler[s], g = D.grundstof(s);
        if (!c || !g) return;
        T.boble(ctx, c.x + c.b / 2, c.y - 2, [
            { t: g.s + "  " + g.navn, px: 15 },
            { t: "atomnummer " + g.z + " · atommasse " + NK.komma(g.m), px: 13, vaegt: "400", farve: "#c8ced6" }
        ], W, c.y + c.h);
    };

    NK.Tegn = T;
}());

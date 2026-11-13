/* =====================================================================
   struktur.js - strukturformlerne i bogens stil

   Tegnet efter bogens b8-syre-base-former (acetylsalicylsyre som HA og
   A⁻, amfetamin som BH⁺ og B, carboxylgruppen roed, den negative ion blaa
   med gloed, NH₃⁺ roed med gloed), b8-opg-4-strukturer og b8-laegemidler
   (paracetamol og ibuprofen) og glucose som ring med fem OH-grupper.
   Koordinaterne er i bindingslaengder (L = 1), y nedad. Carbonatomer
   har intet bogstav; benzenringen har dobbeltbindinger inde i ringen.

   ST.tegn(ctx, id, cx, cy, L, opt)   tegner molekylet midt om (cx, cy)
   ST.str(ctx, id, L)                  bredde og hoejde i pixels
   ST.kort(ctx, k, navn, id, opt)      et lyst kort med navn og formel
   ST.ligevaegt(ctx, k, stof)          HA ⇌ A⁻ eller BH⁺ ⇌ B med pile
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = NK.Tegning;
    var ST = {};
    var FONT = T.FONT;
    var ROED = "#a93226", BLAA = "#1d4ed8", BLAEK = "#1d2433";
    var S3 = Math.sqrt(3) / 2;

    /* Benzenringen med en spids opad: hjoerne 0 oeverst, saa med uret */
    function ring(cx, cy) {
        return [[cx, cy - 1], [cx + S3, cy - 0.5], [cx + S3, cy + 0.5], [cx, cy + 1], [cx - S3, cy + 0.5], [cx - S3, cy - 0.5]];
    }

    /* Et molekyle: atomer { x, y, t (tekst), a (anker: det tegn, der staar
       paa atomets plads), f (farve), g (gloed: "roed" eller "blaa") } og
       bindinger [i, j, orden, indre]. */
    function byg(ringe, ekstra, bindinger) {
        var atomer = [], b = [];
        ringe.forEach(function (r) {
            var n = atomer.length;
            ring(r[0], r[1]).forEach(function (p) { atomer.push({ x: p[0], y: p[1] }); });
            for (var k = 0; k < 6; k++) {
                var dobbelt = r[2] !== false && (k % 2 === 1);
                b.push([n + k, n + (k + 1) % 6, dobbelt ? 2 : 1, dobbelt ? { x: r[0], y: r[1] } : null]);
            }
        });
        ekstra.forEach(function (a) { atomer.push(a); });
        bindinger.forEach(function (x) { b.push([x[0], x[1], x[2] || 1, null]); });
        return { atomer: atomer, bindinger: b };
    }

    /* Ringens hjoerner har numrene 0-5; de foelgende atomer 6, 7, ... */
    var MOL = {};
    MOL.asaHA = function () {
        return byg([[0, 0]], [
            { x: 2 * S3, y: -1 }, { x: 2 * S3, y: -2, t: "O", f: ROED }, { x: 3 * S3, y: -0.5, t: "OH", a: 0, f: ROED },
            { x: 0, y: -2, t: "O" }, { x: -S3, y: -2.5 }, { x: -2 * S3, y: -2, t: "O" }, { x: -S3, y: -3.5 }
        ], [[1, 6], [6, 7, 2], [6, 8], [0, 9], [9, 10], [10, 11, 2], [10, 12]]);
    };
    MOL.asaA = function () {
        return byg([[0, 0]], [
            { x: 2 * S3, y: -1 }, { x: 2 * S3, y: -2, t: "O", f: BLAA }, { x: 3 * S3, y: -0.5, t: "O^-", a: 0, f: BLAA, g: "blaa" },
            { x: 0, y: -2, t: "O" }, { x: -S3, y: -2.5 }, { x: -2 * S3, y: -2, t: "O" }, { x: -S3, y: -3.5 }
        ], [[1, 6], [6, 7, 2], [6, 8], [0, 9], [9, 10], [10, 11, 2], [10, 12]]);
    };
    MOL.amfBH = function () {
        return byg([[0, 0]], [
            { x: 2 * S3, y: -1 }, { x: 3 * S3, y: -0.5 }, { x: 4 * S3, y: -1, t: "NH_3^+", a: 0, f: ROED, g: "roed" }, { x: 3 * S3, y: 0.5 }
        ], [[1, 6], [6, 7], [7, 8], [7, 9]]);
    };
    MOL.amfB = function () {
        return byg([[0, 0]], [
            { x: 2 * S3, y: -1 }, { x: 3 * S3, y: -0.5 }, { x: 4 * S3, y: -1, t: "NH_2", a: 0 }, { x: 3 * S3, y: 0.5 }
        ], [[1, 6], [6, 7], [7, 8], [7, 9]]);
    };
    MOL.para = function () {
        return byg([[0, 0]], [
            { x: -2 * S3, y: 1, t: "HO", a: 1 }, { x: 2 * S3, y: -1, t: "N", a: 0, h: true },
            { x: 3 * S3, y: -0.5 }, { x: 3 * S3, y: 0.5, t: "O" }, { x: 4 * S3, y: -1 }
        ], [[4, 6], [1, 7], [7, 8], [8, 9, 2], [8, 10]]);
    };
    MOL.ibu = function () {
        return byg([[0, 0]], [
            { x: 2 * S3, y: -1 }, { x: 2 * S3, y: -2 }, { x: 3 * S3, y: -0.5 }, { x: 3 * S3, y: 0.5, t: "O" }, { x: 4 * S3, y: -1, t: "OH", a: 0 },
            { x: -2 * S3, y: 1 }, { x: -3 * S3, y: 0.5 }, { x: -3 * S3, y: -0.5 }, { x: -4 * S3, y: 1 }
        ], [[1, 6], [6, 7], [6, 8], [8, 9, 2], [8, 10], [4, 11], [11, 12], [12, 13], [12, 14]]);
    };
    /* Lidocain som den uladede base B: amidgruppen ved ringen og den
       basiske N til hoejre, som optager en hydron ved lav pH */
    MOL.lidB = function () {
        return byg([[0, 0]], [
            { x: 0, y: -2 }, { x: 2 * S3, y: 1 }, { x: 2 * S3, y: -1, t: "N", a: 0, h: true },
            { x: 3 * S3, y: -0.5 }, { x: 3 * S3, y: 0.5, t: "O" }, { x: 4 * S3, y: -1 }, { x: 5 * S3, y: -0.5, t: "N", a: 0, f: "#1d4ed8" },
            { x: 5 * S3, y: 0.5 }, { x: 6 * S3, y: 1 }, { x: 6 * S3, y: -1 }, { x: 7 * S3, y: -0.5 }
        ], [[0, 6], [2, 7], [1, 8], [8, 9], [9, 10, 2], [9, 11], [11, 12], [12, 13], [13, 14], [12, 15], [15, 16]]);
    };
    /* Glucose som ring: oxygen i ringen oeverst og fem OH-grupper */
    MOL.glu = function () {
        var m = byg([[0, 0, false]], [
            { x: 2 * S3, y: -1, t: "OH", a: 0 }, { x: 2 * S3, y: 1, t: "OH", a: 0 }, { x: 0, y: 2, t: "OH", a: 0 },
            { x: -2 * S3, y: 1, t: "HO", a: 1 }, { x: -2 * S3, y: -1 }, { x: -2 * S3, y: -2, t: "HO", a: 1 }
        ], [[1, 6], [2, 7], [3, 8], [4, 9], [5, 10], [10, 11]]);
        m.atomer[0].t = "O";
        return m;
    };

    /* ----- Tekst med et bestemt tegn paa atomets plads ------------------------- */
    function dele(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (c === "_" || c === "^") {
                ud.push({ t: s.charAt(i + 1).replace("-", "−"), sub: c === "_", sup: c === "^" });
                i += 2;
            } else { ud.push({ t: c }); i++; }
        }
        return ud;
    }

    function skrivAtom(ctx, a, x, y, fs, alfa) {
        var d = dele(a.t), b = 0;
        ctx.save();
        d.forEach(function (del) {
            ctx.font = "700 " + (del.sub || del.sup ? fs * 0.68 : fs) + "px " + FONT;
            del.w = ctx.measureText(del.t).width;
            del.x = b;
            b += del.w;
        });
        var ank = d[a.a || 0], x0 = x - ank.x - ank.w / 2;
        if (a.g && alfa !== false) {
            var cx = x0 + b / 2, r = Math.max(b, fs) * 0.95;
            var g = ctx.createRadialGradient(cx, y, r * 0.1, cx, y, r);
            var f = a.g === "roed" ? "169, 50, 38" : "29, 78, 216";
            g.addColorStop(0, "rgba(" + f + ", 0.32)");
            g.addColorStop(1, "rgba(" + f + ", 0)");
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.ellipse(cx, y, r, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.textBaseline = "middle";
        ctx.fillStyle = a.f || BLAEK;
        d.forEach(function (del) {
            ctx.font = "700 " + (del.sub || del.sup ? fs * 0.68 : fs) + "px " + FONT;
            var dy = del.sub ? fs * 0.3 : (del.sup ? -fs * 0.38 : 0);
            ctx.fillText(del.t, x0 + del.x, y + dy + fs * 0.04);
        });
        /* H paa N (amidgruppen i paracetamol) staar lige over N */
        if (a.h) {
            ctx.font = "700 " + fs + "px " + FONT;
            ctx.fillText("H", x - ctx.measureText("H").width / 2, y - fs * 1.05);
        }
        ctx.restore();
        return { x0: x0, x1: x0 + b, y0: y - fs * (a.h ? 1.6 : 0.6), y1: y + fs * 0.6 };
    }

    /* Molekylets kasse i pixels i forhold til (0, 0) */
    function kasse(ctx, m, L) {
        var fs = L * 0.6, k = { x0: 1e9, x1: -1e9, y0: 1e9, y1: -1e9 };
        m.atomer.forEach(function (a) {
            var x = a.x * L, y = a.y * L;
            if (a.t) {
                ctx.save();
                ctx.globalAlpha = 0;
                var r = skrivAtom(ctx, a, x, y, fs, false);
                ctx.restore();
                k.x0 = Math.min(k.x0, r.x0); k.x1 = Math.max(k.x1, r.x1); k.y0 = Math.min(k.y0, r.y0); k.y1 = Math.max(k.y1, r.y1);
            } else {
                k.x0 = Math.min(k.x0, x); k.x1 = Math.max(k.x1, x); k.y0 = Math.min(k.y0, y); k.y1 = Math.max(k.y1, y);
            }
        });
        return k;
    }

    var CACHE = {};
    function mol(id) { if (!CACHE[id]) CACHE[id] = MOL[id](); return CACHE[id]; }

    ST.str = function (ctx, id, L) {
        var k = kasse(ctx, mol(id), L);
        return { b: k.x1 - k.x0, h: k.y1 - k.y0 };
    };

    ST.tegn = function (ctx, id, cx, cy, L, opt) {
        opt = opt || {};
        var m = mol(id), fs = L * 0.6, k = kasse(ctx, m, L);
        var ox = cx - (k.x0 + k.x1) / 2, oy = cy - (k.y0 + k.y1) / 2;
        function P(a) { return { x: ox + a.x * L, y: oy + a.y * L }; }
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        ctx.strokeStyle = BLAEK;
        ctx.lineWidth = Math.max(1.4, L * 0.075);
        ctx.lineCap = "round";
        m.bindinger.forEach(function (bd) {
            var A = m.atomer[bd[0]], B = m.atomer[bd[1]], p = P(A), q = P(B);
            var dx = q.x - p.x, dy = q.y - p.y, l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l;
            var g1 = A.t ? fs * 0.5 : 0, g2 = B.t ? fs * 0.5 : 0;
            var x1 = p.x + ux * g1, y1 = p.y + uy * g1, x2 = q.x - ux * g2, y2 = q.y - uy * g2;
            if (bd[2] === 2 && bd[3]) {
                /* Dobbeltbinding i ringen: en kortere streg inde i ringen */
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
                var c = { x: ox + bd[3].x * L, y: oy + bd[3].y * L }, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                var nx = c.x - mx, ny = c.y - my, nl = Math.sqrt(nx * nx + ny * ny);
                nx /= nl; ny /= nl;
                var o = L * 0.17, kort = L * 0.16;
                ctx.beginPath();
                ctx.moveTo(x1 + nx * o + ux * kort, y1 + ny * o + uy * kort);
                ctx.lineTo(x2 + nx * o - ux * kort, y2 + ny * o - uy * kort);
                ctx.stroke();
            } else if (bd[2] === 2) {
                var px = -uy * L * 0.075, py = ux * L * 0.075;
                ctx.beginPath(); ctx.moveTo(x1 + px, y1 + py); ctx.lineTo(x2 + px, y2 + py); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(x1 - px, y1 - py); ctx.lineTo(x2 - px, y2 - py); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
            }
        });
        m.atomer.forEach(function (a) { if (a.t) { var p = P(a); skrivAtom(ctx, a, p.x, p.y, fs); } });
        ctx.restore();
        return { x: cx + k.x0 - (k.x0 + k.x1) / 2, y: cy + k.y0 - (k.y0 + k.y1) / 2, b: k.x1 - k.x0, h: k.y1 - k.y0 };
    };

    /* Den stoerste bindingslaengde, der faar molekylet til at passe i b x h */
    ST.passendeL = function (ctx, id, b, h, maks) {
        var s = ST.str(ctx, id, 10);
        return Math.min(maks || 26, 10 * b / s.b, 10 * h / s.h);
    };

    /* ----- Et lyst kort med navnet og formlen (fane 1) ------------------------- */
    ST.kort = function (ctx, k, navn, id, opt) {
        opt = opt || {};
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = opt.fyld || "#f3f7fa";
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = opt.kant || "#cdd8e1";
        ctx.lineWidth = opt.kantBredde || 1.5;
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, navn, k.x + k.b / 2, k.y + 17, { font: "800 14px " + FONT, farve: opt.navnFarve || D.FARVE.prik, justering: "center", linje: "middle" });
        var bund = opt.under ? 22 : 8;
        var L = ST.passendeL(ctx, id, k.b - 22, k.h - 34 - bund, opt.maksL || 24);
        ST.tegn(ctx, id, k.x + k.b / 2, k.y + 30 + (k.h - 34 - bund) / 2, L);
        if (opt.under) T.formel(ctx, opt.under, k.x + k.b / 2, k.y + k.h - 13, 12.5, opt.underFarve || "#3c4a49", "center", 700);
        return L;
    };

    /* ----- Ligevaegten mellem de to former (fane 2 og 3) ------------------------
       Som bogens b8-syre-base-former: venstre form, to halve pile med
       "afgiver H⁺" og "optager H⁺", hoejre form og en tekst under hver. */
    var FORMER = {
        asa: { v: "asaHA", h: "asaA", tv: "HA: uladet", th: "A^-: negativ ion", fv: ROED, fh: BLAA },
        amf: { v: "amfBH", h: "amfB", tv: "BH^+: positiv ion", th: "B: uladet", fv: ROED, fh: BLAEK },
        lid: { en: "lidB", tekst: "Lidocain, B. Den blå N optager H^+ ved lav pH." }
    };
    ST.ligevaegt = function (ctx, k, stofId, opt) {
        opt = opt || {};
        var f = FORMER[stofId];
        if (!f) return;
        ctx.save();
        ctx.fillStyle = "rgba(243, 247, 250, 0.96)";
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, 12);
        ctx.fill();
        ctx.strokeStyle = opt.kant || "#cdd8e1";
        ctx.lineWidth = opt.kantBredde || 1.5;
        ctx.stroke();
        ctx.restore();
        if (f.en) {
            /* Kun én form (lidocain): formlen og en tekst under */
            var Le = ST.passendeL(ctx, f.en, k.b - 24, k.h - 40, 22);
            ST.tegn(ctx, f.en, k.x + k.b / 2, k.y + 8 + (k.h - 34) / 2, Le);
            T.formel(ctx, f.tekst, k.x + k.b / 2, k.y + k.h - 13, NK.klamp(Le * 0.6, 11, 13), "#3c4a49", "center", 700);
            return;
        }
        var pil = 66, halv = (k.b - pil - 36) / 2, hM = k.h - 34;
        var L = Math.min(ST.passendeL(ctx, f.v, halv, hM, 22), ST.passendeL(ctx, f.h, halv, hM, 22));
        var xv = k.x + 8 + halv / 2, xh = k.x + k.b - 8 - halv / 2, ym = k.y + 6 + hM / 2;
        ST.tegn(ctx, f.v, xv, ym, L);
        ST.tegn(ctx, f.h, xh, ym, L);
        var fsT = NK.klamp(L * 0.6, 11, 13);
        T.formel(ctx, f.tv, xv, k.y + k.h - 13, fsT, f.fv, "center", 700);
        T.formel(ctx, f.th, xh, k.y + k.h - 13, fsT, f.fh === BLAEK ? "#3c4a49" : f.fh, "center", 700);
        /* Ligevaegtspilene */
        var px0 = k.x + k.b / 2 - pil / 2 + 4, px1 = k.x + k.b / 2 + pil / 2 - 4, py = ym;
        ctx.save();
        ctx.strokeStyle = BLAEK;
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(px0, py - 3); ctx.lineTo(px1, py - 3); ctx.lineTo(px1 - 7, py - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px1, py + 3); ctx.lineTo(px0, py + 3); ctx.lineTo(px0 + 7, py + 8); ctx.stroke();
        ctx.restore();
        var fsP = NK.klamp(L * 0.52, 10.5, 12);
        T.formel(ctx, "afgiver H^+", (px0 + px1) / 2, py - 16, fsP, "#3c4a49", "center", 700);
        T.formel(ctx, "optager H^+", (px0 + px1) / 2, py + 17, fsP, "#3c4a49", "center", 700);
    };

    NK.Struktur = ST;
}());

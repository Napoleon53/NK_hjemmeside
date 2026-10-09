/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen (som sc4.3), vaegten (som sc4.5), braenderen
   med flammen, trefoden, diglen med pulveret, tangen, damp og korn, der
   sproejter, natronglasset, luppen med ionerne, grafen over
   massen, skemaet med elevens tal og atomtaellingen paa tavlen.
   Funktionerne tegner én ting et bestemt sted og husker intet selv,
   bortset fra de smaa partikelsystemer (damp, korn og luppen), der hver
   hoerer til én digel. Fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var MATTE = "Cambria, 'Cambria Math', 'Times New Roman', serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;
    T.matte = function (px, vaegt) { return "italic " + (vaegt || "600") + " " + px + "px " + MATTE; };

    /* ----- Farver --------------------------------------------------------- */
    function rgb(hex) {
        var h = hex.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }
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

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* ----- Rummet, bordet og tavlen (som sc4.3) --------------------------------------- */
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

    /* Opgavens tekst over tavlen: én linje, ellers to (som sc4.3) */
    T.overTavle = function (ctx, tekst, b, stoerst, mindst) {
        var px = NK.passendeSkrift(ctx, tekst, b, stoerst, mindst, "600");
        var lh = function (p) { return Math.round(p * 1.38); };
        if (ctx.measureText(tekst).width <= b) return { px: px, linjer: [tekst], h: lh(px) };
        var ord = tekst.split(" "), bedst = null;
        ctx.font = font("600", stoerst);
        for (var i = 1; i < ord.length; i++) {
            var a = ord.slice(0, i).join(" "), c = ord.slice(i).join(" ");
            var s = Math.max(ctx.measureText(a).width, ctx.measureText(c).width) * (/\.$/.test(a) ? 0.8 : 1);
            if (!bedst || s < bedst.s) bedst = { s: s, a: a, c: c };
        }
        if (!bedst) return { px: px, linjer: [tekst], h: lh(px) };
        px = Math.min(NK.passendeSkrift(ctx, bedst.a, b, stoerst, 12, "600"), NK.passendeSkrift(ctx, bedst.c, b, stoerst, 12, "600"));
        return { px: px, linjer: [bedst.a, bedst.c], h: lh(px) * 2 };
    };

    T.tegnOverTavle = function (ctx, o, x, y) {
        ctx.save();
        ctx.fillStyle = "#f2c53d";
        NK.rundtRekt(ctx, x, y + 2, 4, o.h - 4, 2);
        ctx.fill();
        ctx.restore();
        var lh = o.h / o.linjer.length;
        o.linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, x + 14, y + lh * (i + 0.5) + 1, { font: font("600", o.px), linje: "middle", farve: "#f2f3f5" });
        });
    };

    /* En lille overskrift i smaa versaler (paa tavlen og ved grafen) */
    T.etiket = function (ctx, tekst, x, y, px, farve, just) {
        NK.tekst(ctx, tekst.toUpperCase(), x, y, { font: font("700", px), linje: "middle", farve: farve || "#6a7280", justering: just || "left" });
    };

    /* En etiket paa bordet under en ting */
    T.bordEtiket = function (ctx, tekst, x, y, px, farve) {
        NK.tekst(ctx, tekst, x, y, { font: font("700", px), justering: "center", linje: "middle", farve: farve || "#c8ced6" });
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

    /* Et gult skaer bag noget, musen er over */
    T.skaer = function (ctx, x, y, rx, ry) {
        ctx.save();
        var g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
        g.addColorStop(0, "rgba(242, 197, 61, 0.28)");
        g.addColorStop(1, "rgba(242, 197, 61, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Vaegten (som sc4.5) ----------------------------------------------------------- */
    T.vaegtHoejde = function (b) { return MAAL.vaegt.h * b / MAAL.vaegt.b; };

    /* Giver skaalens midte og displayet. v.lys: gul ramme, v.roed: roed skrift */
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
        ctx.fillStyle = v.roed ? "#ff9d8f" : "#7df0c0";
        ctx.shadowColor = v.roed ? "rgba(255, 140, 120, 0.6)" : "rgba(125, 240, 192, 0.6)";
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

    /* ----- Trefoden og braenderen ------------------------------------------------------
       T.opstilling giver geometrien for én opstilling: trefoden med
       bunden paa bordet i x, braenderen under den og diglens plads i
       trekanten. th: trefodens hoejde i px. */
    T.opstilling = function (x, bordY, th) {
        var M = MAAL.trefod, k = th / M.h;
        var top = bordY - M.bund * k;
        var ringY = top + M.ringY * k, roerY = top + M.roerY * k;
        var db = (M.roerH - M.roerV) * k * 0.7;
        var MD = MAAL.digel, dk = db / MD.b, dh = MD.h * dk;
        var digelTop = roerY - 0.55 * dh;
        var bundY = digelTop + MD.bund * dk;
        var mund = bundY + th * 0.2;
        var MB = MAAL.bunsen, bk = (bordY - mund) / (MB.bund - MB.mundY);
        return {
            x: x, bordY: bordY, th: th, k: k, top: top, b: M.b * k, ringY: ringY, roerY: roerY,
            digel: { x: x, bund: bundY, b: db },
            braender: { x: x, top: mund - MB.mundY * bk, b: MB.b * bk, h: MB.h * bk, k: bk, mund: mund,
                        hane: { x: x - MB.b * bk / 2 + MB.haneX * bk, y: mund - MB.mundY * bk + MB.haneY * bk } }
        };
    };

    T.trefodBag = function (ctx, g) {
        NK.Sprites.tegn(ctx, "trefod_bag", g.x - g.b / 2, g.top, g.b, MAAL.trefod.h * g.k);
    };

    T.trefodFor = function (ctx, g) {
        NK.Sprites.tegn(ctx, "trefod_for", g.x - g.b / 2, g.top, g.b, MAAL.trefod.h * g.k);
    };

    T.braender = function (ctx, g, lys) {
        var b = g.braender;
        if (lys) T.skaer(ctx, b.x, b.top + b.h * 0.6, b.b * 0.9, b.h * 0.5);
        NK.Sprites.tegn(ctx, "bunsen", b.x - b.b / 2, b.top, b.b, b.h);
    };

    /* Flammen fra mundingen (x, y). s: skala, niveau "lav" eller "hoej".
       Den blaa kegle med en lysere indre kegle, der blafrer lidt. */
    T.flamme = function (ctx, x, y, s, niveau, t) {
        if (!niveau) return;
        var hoej = niveau === "hoej";
        var h = (hoej ? 74 : 40) * s * (1 + 0.05 * Math.sin(t * 31) + 0.03 * Math.sin(t * 17));
        var b = (hoej ? 15 : 11) * s;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        /* Den ydre flamme */
        var g = ctx.createLinearGradient(0, y, 0, y - h);
        g.addColorStop(0, "rgba(90, 150, 255, 0.75)");
        g.addColorStop(0.55, "rgba(120, 110, 255, 0.45)");
        g.addColorStop(1, "rgba(180, 120, 255, 0)");
        ctx.fillStyle = g;
        var sv = Math.sin(t * 9) * b * 0.12;
        ctx.beginPath();
        ctx.moveTo(x - b * 0.55, y);
        ctx.bezierCurveTo(x - b, y - h * 0.35, x - b * 0.35 + sv, y - h * 0.8, x + sv, y - h);
        ctx.bezierCurveTo(x + b * 0.35 + sv, y - h * 0.8, x + b, y - h * 0.35, x + b * 0.55, y);
        ctx.closePath();
        ctx.fill();
        /* Den indre kegle */
        var hi = h * (hoej ? 0.36 : 0.5);
        var g2 = ctx.createLinearGradient(0, y, 0, y - hi);
        g2.addColorStop(0, "rgba(160, 220, 255, 0.95)");
        g2.addColorStop(1, "rgba(110, 170, 255, 0.35)");
        ctx.fillStyle = g2;
        ctx.beginPath();
        ctx.moveTo(x - b * 0.42, y);
        ctx.quadraticCurveTo(x - b * 0.3, y - hi * 0.7, x, y - hi);
        ctx.quadraticCurveTo(x + b * 0.3, y - hi * 0.7, x + b * 0.42, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* Knapperne til flammen: Sluk, Lav og Hoej. Giver rektanglerne. */
    T.FLAMMEKNAPPER = [{ id: "", t: "Sluk" }, { id: "lav", t: "Lav" }, { id: "hoej", t: "Høj" }];
    T.flammeknapper = function (ctx, x, y, b, h, valgt, over, peg) {
        var n = T.FLAMMEKNAPPER.length, gap = 4, kb = (b - gap * (n - 1)) / n, ud = [];
        var px = NK.klamp(h * 0.52, 12, 15);
        T.FLAMMEKNAPPER.forEach(function (k, i) {
            var r = { x: x + i * (kb + gap), y: y, b: kb, h: h, id: k.id };
            var aktiv = valgt === k.id;
            ctx.save();
            ctx.fillStyle = aktiv ? (k.id === "hoej" ? "#2f6fd6" : k.id === "lav" ? "#3d8fd9" : "#5a5f6b") : (over === k.id ? "#4a4f5c" : "#343844");
            NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 5);
            ctx.fill();
            ctx.strokeStyle = aktiv ? "rgba(255, 255, 255, 0.55)" : (peg === k.id ? "#f2c53d" : "rgba(255, 255, 255, 0.14)");
            ctx.lineWidth = peg === k.id ? 2 : 1;
            ctx.stroke();
            NK.tekst(ctx, k.t, r.x + r.b / 2, r.y + r.h / 2 + 1, { font: font("700", px), justering: "center", linje: "middle",
                farve: aktiv ? "#ffffff" : "#c8ced6" });
            ctx.restore();
            ud.push(r);
        });
        return ud;
    };

    /* ----- Diglen med pulveret -----------------------------------------------------------
       (x, bund): midten af bunden. b: bredden. v: { fyld (0-1 af den
       fulde digel), reageret (0-1), bobler (gas pr. minut), lys, varme
       (0-1), t }. Giver randens midte og bredde. */
    T.digelHoejde = function (b) { return MAAL.digel.h * b / MAAL.digel.b; };

    T.digel = function (ctx, x, bund, b, v) {
        v = v || {};
        var M = MAAL.digel, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = bund - M.bund * k;
        var rand = { x: x, y: y0 + M.randY * k, rx: M.indRx * k, ry: M.indRy * k, b: b, top: y0 };
        if (v.lys) T.skaer(ctx, x, y0 + h * 0.5, b * 0.8, h * 0.75);
        NK.Sprites.tegn(ctx, "digel", x0, y0, b, h);
        /* Pulveret: en flade inde i aabningen, der synker lidt, naar
           massen bliver mindre */
        var fyld = NK.klamp(v.fyld === undefined ? 1 : v.fyld, 0, 1);
        if (fyld > 0.01) {
            var dyb = (1 - fyld) * 7 * k + 2.2 * k;
            var ry = rand.ry * 0.86, rx = rand.rx * (0.93 - (1 - fyld) * 0.08);
            var re = NK.klamp(v.reageret || 0, 0, 1);
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(x, rand.y + 0.5 * k, rand.rx, rand.ry, 0, 0, Math.PI * 2);
            ctx.clip();
            var g = ctx.createLinearGradient(0, rand.y + dyb - ry, 0, rand.y + dyb + ry);
            g.addColorStop(0, re > 0.5 ? "#f1eee7" : "#fbfaf6");
            g.addColorStop(1, re > 0.5 ? "#d9d4c9" : "#e4e1d8");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(x, rand.y + dyb, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
            /* Kornene: fint pulver, der bliver mere poroest, naar det har reageret */
            var r = froe(11);
            for (var i = 0; i < 70; i++) {
                var a = r() * Math.PI * 2, d = Math.sqrt(r());
                var px = x + Math.cos(a) * rx * d * 0.95, py = rand.y + dyb + Math.sin(a) * ry * d * 0.9;
                var hop = v.bobler > 0.02 ? Math.max(0, Math.sin((v.t || 0) * (9 + r() * 7) + i)) * NK.klamp(v.bobler * 6, 0, 1.6) * k : 0;
                ctx.fillStyle = re * r() > 0.35 ? "rgba(150, 140, 120, 0.35)" : "rgba(255, 255, 255, 0.8)";
                ctx.fillRect(px, py - hop, 1.2 + re * 0.6, 1.2 + re * 0.6);
            }
            ctx.restore();
        }
        /* Varmt porcelaen: et svagt orange skaer forneden */
        if (v.varme > 0.05) {
            ctx.save();
            ctx.globalAlpha = NK.klamp(v.varme, 0, 1) * 0.35;
            var gv = ctx.createRadialGradient(x, bund - 4 * k, 2, x, bund - 4 * k, b * 0.5);
            gv.addColorStop(0, "#ff9a4a");
            gv.addColorStop(1, "rgba(255, 120, 60, 0)");
            ctx.fillStyle = gv;
            ctx.beginPath();
            ctx.ellipse(x, bund - 10 * k, b * 0.42, h * 0.45, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        return rand;
    };

    /* Den flimrende luft over en varm digel */
    T.flimmer = function (ctx, x, y, b, styrke, t) {
        if (styrke < 0.05) return;
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, " + (0.12 * NK.klamp(styrke, 0, 1)) + ")";
        ctx.lineWidth = 1.4;
        for (var i = -1; i <= 1; i++) {
            ctx.beginPath();
            for (var s = 0; s <= 1.001; s += 0.1) {
                var yy = y - s * b * 0.8;
                var xx = x + i * b * 0.22 + Math.sin(s * 9 + t * 5 + i * 2) * b * 0.05;
                if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Tangen om diglens rand: kaeberne i (x, y), grebet mod hoejre */
    T.tang = function (ctx, x, y, b, vinkel) {
        var M = MAAL.tang, k = b / M.b;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vinkel || 0);
        NK.Sprites.tegn(ctx, "tang", -M.kaebeX * k, -M.kaebeY * k, b, M.h * k);
        ctx.restore();
    };

    /* ----- Damp og korn -------------------------------------------------------------- */
    function Damp(nr) {
        this.r = froe(nr || 3);
        this.p = [];
        this.akku = 0;
    }
    /* gas: g pr. minut */
    Damp.prototype.opdater = function (dt, gas) {
        this.akku += dt * NK.klamp(gas * 40, 0, 14);
        while (this.akku >= 1) {
            this.akku -= 1;
            this.p.push({ x: (this.r() - 0.5) * 0.6, y: 0, vx: (this.r() - 0.5) * 0.12, vy: 0.45 + this.r() * 0.35, a: 0, r: 0.05 + this.r() * 0.04 });
        }
        this.p.forEach(function (p) { p.a += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += dt * 0.07; });
        this.p = this.p.filter(function (p) { return p.a < 1.8; });
    };
    Damp.prototype.tegn = function (ctx, x, y, b) {
        ctx.save();
        this.p.forEach(function (p) {
            var alfa = 0.22 * Math.sin(Math.PI * NK.klamp(p.a / 1.8, 0, 1));
            var px = x + p.x * b, py = y - p.y * b, pr = p.r * b;
            var g = ctx.createRadialGradient(px, py, 0, px, py, pr);
            g.addColorStop(0, "rgba(235, 240, 245, " + alfa + ")");
            g.addColorStop(1, "rgba(235, 240, 245, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };
    NK.Damp = Damp;

    /* Korn, der sproejter ud af diglen og falder ned paa bordet */
    function Korn(nr) {
        this.r = froe(nr || 5);
        this.p = [];
        this.akku = 0;
    }
    Korn.prototype.sprojt = function (n) {
        for (var i = 0; i < n; i++) {
            var v = -Math.PI / 2 + (this.r() - 0.5) * 1.6;
            var s = 1.2 + this.r() * 1.4;
            this.p.push({ x: (this.r() - 0.5) * 0.5, y: 0, vx: Math.cos(v) * s, vy: -Math.sin(v) * s, a: 0 });
        }
    };
    /* bund: hvor langt under randen bordet er (i digelbredder) */
    Korn.prototype.opdater = function (dt, bund) {
        this.p.forEach(function (p) {
            p.a += dt;
            p.vy -= 6 * dt;
            p.x += p.vx * dt * 0.5;
            p.y += p.vy * dt * 0.5;
            if (p.y < -bund) { p.y = -bund; p.vx *= 0.3; p.vy = 0; }
        });
        this.p = this.p.filter(function (p) { return p.a < 3; });
    };
    Korn.prototype.tegn = function (ctx, x, y, b) {
        ctx.save();
        ctx.fillStyle = "#f7f4ec";
        this.p.forEach(function (p) {
            ctx.globalAlpha = NK.klamp(3 - p.a, 0, 1);
            ctx.fillRect(x + p.x * b - 1.2, y - p.y * b - 1.2, 2.4, 2.4);
        });
        ctx.restore();
    };
    NK.Korn = Korn;

    /* ----- Natronglasset (pynt paa fane 1; et klik siger, hvad natron er) ----------------- */
    T.glas = function (ctx, cx, y, b, lys) {
        var M = MAAL.natron, h = M.h * b / M.b;
        if (lys) T.skaer(ctx, cx, y - h * 0.5, b * 0.7, h * 0.6);
        NK.Sprites.tegn(ctx, "natron", cx - b / 2, y - M.bund * b / M.b, b, h);
        return { x: cx - b / 2, y: y - h, b: b, h: h };
    };

    /* ----- Luppen i diglen ------------------------------------------------------------------
       Et gitter af Na⁺ og HCO₃⁻ i bunden af luppen. Naar natronen
       reagerer, gaar to HCO₃⁻ sammen: den ene bliver til CO₃²⁻, den anden
       forsvinder som CO₂ og H₂O, der stiger op og ud af luppen. Na⁺
       bliver. Saa laenge eleven ikke har fundet ud af, hvad der bliver
       tilbage (kendt er false), staar det faste stof som ? og gassen som
       graa pust uden navn. */
    var ION = {
        Na: { t: "Na⁺", farve: "#b79be8", r: 9 },
        HCO3: { t: "HCO₃⁻", farve: "#ece5cf", r: 14 },
        CO3: { t: "CO₃²⁻", farve: "#f2d27a", r: 14 },
        ukendt: { t: "?", farve: "#9aa3ad", r: 14 },
        CO2: { t: "CO₂", farve: "#aeb6c1", r: 11 },
        H2O: { t: "H₂O", farve: "#7fc7f0", r: 10 },
        gas: { t: "", farve: "#c9d0d8", r: 7 }
    };
    T.ION = ION;
    var KOL = 4, RAEKKER = 4;
    var PLADSER = (function () {
        var ud = [];
        for (var r = 0; r < RAEKKER; r++) {
            for (var c = 0; c < KOL; c++) {
                ud.push({ x: (c - (KOL - 1) / 2) * 0.34, y: 0.6 - r * 0.25, type: (c + r) % 2 === 0 ? "HCO3" : "Na" });
            }
        }
        return ud;
    }());

    function Lup(nr) {
        var r = froe(nr || 7);
        this.r = r;
        this.fri = [];
        /* HCO₃⁻ parvis: naboer i samme raekke. Paret reagerer i en fast,
           blandet raekkefoelge. */
        var hco3 = [];
        PLADSER.forEach(function (p, i) { if (p.type === "HCO3") hco3.push(i); });
        this.hco3 = hco3;
        var par = [];
        for (var i = 0; i < hco3.length; i += 2) par.push([hco3[i], hco3[i + 1]]);
        this.par = par.sort(function () { return r() - 0.5; });
        this.enkelt = hco3.slice().sort(function () { return r() - 0.5; });
        this.tilstand = {};      /* plads -> "CO3", "vaek", "ukendt" */
        this.sidst = { par: 0, enkelt: 0, kendt: null };
    }

    /* reageret: 0-1. kendt: om eleven kender svaret. */
    Lup.prototype.opdater = function (dt, reageret, kendt) {
        var mig = this;
        if (this.sidst.kendt !== kendt) {
            this.tilstand = {};
            this.sidst = { par: 0, enkelt: 0, kendt: kendt };
            this.fri = [];
        }
        if (kendt) {
            var nPar = Math.round(NK.klamp(reageret, 0, 1) * this.par.length);
            while (this.sidst.par < nPar) {
                var p = this.par[this.sidst.par++];
                this.tilstand[p[0]] = "CO3";
                this.tilstand[p[1]] = "vaek";
                var pl = PLADSER[p[1]];
                this.fri.push({ type: "CO2", x: pl.x - 0.05, y: pl.y, vx: -0.05, vy: -0.32, a: 0 });
                this.fri.push({ type: "H2O", x: pl.x + 0.06, y: pl.y + 0.02, vx: 0.05, vy: -0.28, a: 0 });
            }
            if (nPar < this.sidst.par) { this.tilstand = {}; this.sidst.par = 0; this.fri = []; }
        } else {
            var n = Math.round(NK.klamp(reageret, 0, 1) * this.enkelt.length);
            while (this.sidst.enkelt < n) {
                var i = this.enkelt[this.sidst.enkelt++];
                this.tilstand[i] = "ukendt";
                var q = PLADSER[i];
                this.fri.push({ type: "gas", x: q.x, y: q.y - 0.02, vx: (this.r() - 0.5) * 0.1, vy: -0.34, a: 0 });
            }
            if (n < this.sidst.enkelt) { this.tilstand = {}; this.sidst.enkelt = 0; this.fri = []; }
        }
        this.fri.forEach(function (f) {
            f.a += dt;
            f.x += f.vx * dt + Math.sin(f.a * 3 + f.y * 9) * 0.004;
            f.y += f.vy * dt;
        });
        this.fri = this.fri.filter(function (f) { return f.y > -1.25; });
        void mig;
    };

    function kugle(ctx, x, y, r, farve, tekst, px) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, nuance(farve, 0.45));
        g.addColorStop(1, nuance(farve, -0.2));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (tekst) NK.tekst(ctx, tekst, x, y + 0.5, { font: font("800", px), justering: "center", linje: "middle", farve: "#1f2530" });
    }

    T.kugle = kugle;

    /* Reaktionen som kugler: 2 NaHCO₃ → Na₂CO₃ + CO₂ + H₂O (dommen paa
       fane 2). (x, y): venstre ende af linjens midte, b: bredden. */
    T.reaktionKugler = function (ctx, x, y, b) {
        var R = NK.klamp(b / 21, 12, 26), rn = R * 0.64;
        var px = NK.klamp(R * 0.5, 11, 14);
        var xx = x;
        function ion(id, r) {
            kugle(ctx, xx + r, y, r, ION[id].farve, ION[id].t, id === "Na" ? Math.max(11, px * 0.95) : px);
            xx += 2 * r;
        }
        function tegn(t, bred) {
            NK.tekst(ctx, t, xx + bred / 2, y, { font: font("800", px * 1.3), justering: "center", linje: "middle", farve: "#1f2530" });
            xx += bred;
        }
        ion("Na", rn); ion("HCO3", R); xx += R * 0.5;
        ion("Na", rn); ion("HCO3", R);
        tegn("→", R * 2.2);
        ion("Na", rn); ion("CO3", R); ion("Na", rn);
        tegn("+", R * 1.1);
        ion("CO2", R * 0.8);
        tegn("+", R * 1.1);
        ion("H2O", R * 0.75);
        return xx - x;
    };

    T.Lup = Lup;

    /* Tegner luppen med midte (cx, cy) og radius r. v: { titel, lys, varm, t } */
    T.lup = function (ctx, lup, cx, cy, r, v) {
        v = v || {};
        var s = r / 118;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = v.varm ? "#241d1d" : "#191c22";
        ctx.fill();
        ctx.clip();
        /* Diglens bund forneden */
        ctx.fillStyle = "#e8ebef";
        ctx.fillRect(cx - r, cy + r * 0.92, 2 * r, r);
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(cx - r, cy + r * 0.88, 2 * r, r * 0.04);
        var px = NK.klamp(12.5 * s, 11, 14);
        PLADSER.forEach(function (p, i) {
            var t = lup.tilstand[i];
            if (t === "vaek") return;
            var type = p.type === "Na" ? "Na" : (t === "CO3" ? "CO3" : t === "ukendt" ? "ukendt" : "HCO3");
            var ion = ION[type];
            var ryst = v.varm ? Math.sin(v.t * 30 + i * 1.7) * 1.2 * s : 0;
            kugle(ctx, cx + p.x * r + ryst, cy + p.y * r, ion.r * s * 1.25, ion.farve, ion.t, type === "Na" ? px : Math.max(11, px * 0.92));
        });
        lup.fri.forEach(function (f) {
            var ion = ION[f.type];
            ctx.globalAlpha = NK.klamp(1 - (f.y < -0.9 ? (-0.9 - f.y) / 0.35 : 0), 0, 1);
            kugle(ctx, cx + f.x * r, cy + f.y * r, ion.r * s * 1.25, ion.farve, ion.t, Math.max(11, px * 0.92));
            ctx.globalAlpha = 1;
        });
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = v.lys ? "#f2c53d" : "#aeb6c1";
        ctx.lineWidth = Math.max(3, 5 * s);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.max(2, 3 * s), 0, Math.PI * 2);
        ctx.stroke();
        var tp = NK.klamp(14 * s, 13, 16);
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 12, { font: font("700", tp), justering: "center", farve: "#dfe6ee" });
        ctx.restore();
    };

    /* Forklaringen under luppen: prikkernes farver */
    T.lupForklaring = function (ctx, cx, y, px, kendt) {
        var ids = kendt ? ["Na", "HCO3", "CO3", "CO2", "H2O"] : ["Na", "HCO3", "ukendt"];
        var linjer = kendt ? [ids.slice(0, 3), ids.slice(3)] : [ids.slice(0, 2), ids.slice(2)];
        linjer.forEach(function (linje) {
            ctx.font = font("600", px);
            var bredder = linje.map(function (id) {
                var t = id === "ukendt" ? "? = det, der bliver tilbage" : ION[id].t;
                return ctx.measureText(t).width + px + 6;
            });
            var samlet = bredder.reduce(function (a, b) { return a + b; }, 0) + 12 * (linje.length - 1);
            var x = cx - samlet / 2;
            linje.forEach(function (id, i) {
                ctx.fillStyle = ION[id].farve;
                ctx.beginPath();
                ctx.arc(x + px * 0.45, y - px * 0.35, px * 0.42, 0, Math.PI * 2);
                ctx.fill();
                NK.tekst(ctx, id === "ukendt" ? "? = det, der bliver tilbage" : ION[id].t, x + px + 4, y, { font: font("600", px), farve: "#c8ced6" });
                x += bredder[i] + 12;
            });
            y += px + 7;
        });
        return y;
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

    /* ----- Grafen over massen -----------------------------------------------------------------
       r: rektanglet. v: { serier: [{ punkter: [{t, m}], farve, navn }],
       linjer: { A: m, B: m, C: m } (de forventede masser, der er regnet),
       fremhaev: hypotesen, der passer, yMax, xMax, titel, t (til
       animationen af en ny linje), ny: { A: 0-1 } } */
    T.graf = function (ctx, r, v) {
        ctx.save();
        ctx.fillStyle = "rgba(12, 13, 18, 0.72)";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        var px = NK.klamp(r.b / 26, 12, 14);
        var venstre = r.x + px * 3.1, hoejre = r.x + r.b - px * (v.linjer ? 4.8 : 1.2);
        var top = r.y + px * 2.2, bund = r.y + r.h - px * 2.4;
        var yMax = v.yMax || 6, xMax = v.xMax || 20;
        function X(t) { return venstre + (hoejre - venstre) * NK.klamp(t / xMax, 0, 1); }
        function Y(m) { return bund - (bund - top) * NK.klamp(m / yMax, 0, 1.02); }
        T.etiket(ctx, v.titel || "Massen i diglen", r.x + px * 0.8, r.y + px * 1.05, px, "#aab3bf");
        /* Akser og gitter */
        ctx.font = font("600", px);
        var trinY = (bund - top) / yMax < px * 1.4 ? 2 : 1;
        for (var m = 0; m <= yMax + 1e-9; m += trinY) {
            var y = Y(m);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
            ctx.beginPath(); ctx.moveTo(venstre, y); ctx.lineTo(hoejre, y); ctx.stroke();
            NK.tekst(ctx, m + " g", venstre - 5, y, { font: font("600", px), justering: "right", linje: "middle", farve: "#8f98a4" });
        }
        var trinX = xMax <= 20 ? 5 : xMax <= 40 ? 10 : 20;
        for (var t = 0; t <= xMax + 1e-9; t += trinX) {
            NK.tekst(ctx, String(t), X(t), bund + px * 0.9, { font: font("600", px), justering: "center", linje: "middle", farve: "#8f98a4" });
        }
        NK.tekst(ctx, "opvarmet (min)", (venstre + hoejre) / 2, bund + px * 1.95, { font: font("600", px), justering: "center", linje: "middle", farve: "#aab3bf" });
        ctx.strokeStyle = "rgba(223, 230, 238, 0.45)";
        ctx.beginPath(); ctx.moveTo(venstre, top - 4); ctx.lineTo(venstre, bund); ctx.lineTo(hoejre + 4, bund); ctx.stroke();

        /* Hypotesernes streger. Etiketterne skubbes fra hinanden, saa de ikke overlapper. */
        if (v.linjer) {
            var etY = {}, raekke = D.HYP_IDS.filter(function (id) { return v.linjer[id] !== undefined && v.linjer[id] !== null; })
                .map(function (id) { return { id: id, y: Y(v.linjer[id]) }; }).sort(function (a, b) { return a.y - b.y; });
            raekke.forEach(function (e, i) { if (i > 0 && e.y - raekke[i - 1].y < px * 1.15) e.y = raekke[i - 1].y + px * 1.15; etY[e.id] = e.y; });
            D.HYP_IDS.forEach(function (id) {
                var mm = v.linjer[id];
                if (mm === undefined || mm === null) return;
                var ny = v.ny && v.ny[id] !== undefined ? NK.klamp(v.ny[id], 0, 1) : 1;
                var yy = Y(mm), farve = D.HYP_FARVE[id];
                var fremh = v.fremhaev === id;
                ctx.save();
                ctx.strokeStyle = farve;
                ctx.globalAlpha = v.fremhaev && !fremh ? 0.45 : 1;
                ctx.lineWidth = fremh ? 3 : 2;
                ctx.setLineDash([7, 5]);
                ctx.beginPath();
                ctx.moveTo(venstre, yy);
                ctx.lineTo(venstre + (hoejre - venstre) * ny, yy);
                ctx.stroke();
                ctx.setLineDash([]);
                if (ny > 0.95) {
                    NK.tekst(ctx, id + " " + NK.betydende(mm, 3) + " g", hoejre + 5, etY[id], { font: font("800", px), linje: "middle", farve: farve });
                }
                ctx.restore();
            });
        }

        /* Maalingerne */
        (v.serier || []).forEach(function (s) {
            if (!s.punkter.length) return;
            ctx.save();
            ctx.strokeStyle = s.farve;
            ctx.lineWidth = 2;
            ctx.beginPath();
            s.punkter.forEach(function (p, i) {
                if (i === 0) ctx.moveTo(X(p.t), Y(p.m)); else ctx.lineTo(X(p.t), Y(p.m));
            });
            ctx.stroke();
            s.punkter.forEach(function (p) {
                ctx.fillStyle = s.farve;
                ctx.beginPath();
                ctx.arc(X(p.t), Y(p.m), 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#101117";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            });
            ctx.restore();
        });
        ctx.restore();
        return { X: X, Y: Y, venstre: venstre, hoejre: hoejre, top: top, bund: bund };
    };

    /* ----- Tavlen paa fane 2: skemaet med elevens tal og atomtaellingen --------------------- */
    T.skema = function (ctx, hyp, koef, x, y, b, px, loest, puls) {
        var h = D.HYP[hyp];
        var dele = [];
        h.stoffer.forEach(function (id, i) {
            if (i === 1) dele.push({ t: " → " });
            else if (i > 1) dele.push({ t: " + " });
            var k = koef ? String(koef[i] || "").trim() : "";
            dele.push({ boks: true, t: loest ? (k === "1" ? "" : k) : k });
            dele.push({ t: D.STOF[id].formel });
        });
        var f = px;
        function bredde(p) {
            var s = 0;
            dele.forEach(function (d) {
                ctx.font = font(d.boks ? "800" : "700", p);
                if (d.boks) s += loest ? (d.t ? ctx.measureText(d.t + " ").width : 0) : p * 1.25 + p * 0.25;
                else s += ctx.measureText(d.t).width;
            });
            return s;
        }
        while (f > 12 && bredde(f) > b) f -= 0.5;
        var xx = x;
        dele.forEach(function (d) {
            if (d.boks) {
                if (loest) {
                    if (d.t) {
                        NK.tekst(ctx, d.t + " ", xx, y, { font: font("800", f), linje: "middle", farve: "#1d7a48" });
                        ctx.font = font("800", f);
                        xx += ctx.measureText(d.t + " ").width;
                    }
                    return;
                }
                var bb = f * 1.25;
                ctx.save();
                ctx.fillStyle = d.t ? "rgba(29, 93, 156, 0.12)" : "rgba(31, 37, 48, 0.06)";
                ctx.strokeStyle = puls ? "rgba(214, 160, 20, " + (0.4 + 0.5 * puls) + ")" : "rgba(31, 37, 48, 0.35)";
                ctx.lineWidth = 1.5;
                NK.rundtRekt(ctx, xx, y - f * 0.7, bb, f * 1.4, 4);
                ctx.fill();
                ctx.stroke();
                ctx.restore();
                if (d.t) NK.tekst(ctx, d.t, xx + bb / 2, y + 1, { font: font("800", f), justering: "center", linje: "middle", farve: "#1d5d9c" });
                xx += bb + f * 0.25;
                return;
            }
            NK.tekst(ctx, d.t, xx, y, { font: font("700", f), linje: "middle", farve: "#1f2530" });
            ctx.font = font("700", f);
            xx += ctx.measureText(d.t).width;
        });
    };

    /* tael: { Na: { v, h } eller null, ... } */
    T.taelling = function (ctx, tael, x, y, b, px) {
        var xx = x;
        ctx.font = font("700", px);
        D.GRUNDSTOFFER.forEach(function (g) {
            var t = tael[g];
            var tekst = g + ": " + (t ? t.v + " | " + t.h : "? | ?");
            var ok = t && t.v === t.h;
            var farve = !t ? "rgba(31, 37, 48, 0.4)" : (ok ? "#1d7a48" : "#b3362b");
            NK.tekst(ctx, tekst + (t ? (ok ? " ✓" : " ✗") : ""), xx, y, { font: font("700", px), linje: "middle", farve: farve });
            xx += Math.max(b / 4, ctx.measureText(tekst + " ✓").width + px);
        });
    };

    /* ----- Et regnestykke med rigtige broekstreger (som sc4.3) -------------------------------
       dele: { t, matte, farve, fed } eller { top, bund, matte } (en broek).
       matte: det foerste bogstav i n(…), m(…) og M(…) staar i kursiv. */
    function stykker(tekst, matte) {
        if (matte && /^[nmM]\(/.test(tekst)) return [{ s: tekst.charAt(0), m: true }, { s: tekst.slice(1), m: false }];
        return [{ s: tekst, m: false }];
    }
    function stykFont(st, px, fed) {
        return st.m ? T.matte(Math.round(px * 1.12), "600") : font(fed ? "800" : "600", px);
    }
    function tekstBredde(ctx, tekst, px, matte, fed) {
        var b = 0;
        stykker(tekst, matte).forEach(function (st) { ctx.font = stykFont(st, px, fed); b += ctx.measureText(st.s).width; });
        return b;
    }
    function tegnTekst(ctx, tekst, x, y, px, matte, fed, farve, centrer) {
        var b = tekstBredde(ctx, tekst, px, matte, fed);
        var xx = centrer ? x - b / 2 : x;
        stykker(tekst, matte).forEach(function (st) {
            NK.tekst(ctx, st.s, xx, y, { font: stykFont(st, px, fed), linje: "middle", farve: farve });
            ctx.font = stykFont(st, px, fed);
            xx += ctx.measureText(st.s).width;
        });
        return b;
    }

    function delBredde(ctx, d, px) {
        if (d.top !== undefined) {
            var bp = px * 0.9;
            return Math.max(tekstBredde(ctx, d.top, bp, d.matte), tekstBredde(ctx, d.bund, bp, d.matte)) + px * 0.35;
        }
        return tekstBredde(ctx, d.t, px, d.matte, d.fed);
    }

    T.regnestykkeBredde = function (ctx, dele, px) {
        var b = 0;
        dele.forEach(function (d) { b += delBredde(ctx, d, px); });
        return b;
    };

    T.regnestykke = function (ctx, dele, x, y, px, farve) {
        var xx = x;
        dele.forEach(function (d) {
            var b = delBredde(ctx, d, px);
            if (d.top !== undefined) {
                var bp = px * 0.9, cx = xx + b / 2;
                tegnTekst(ctx, d.top, cx, y - px * 0.66, bp, d.matte, false, d.farve || farve, true);
                tegnTekst(ctx, d.bund, cx, y + px * 0.72, bp, d.matte, false, d.farve || farve, true);
                ctx.save();
                ctx.strokeStyle = d.farve || farve;
                ctx.lineWidth = Math.max(1.5, px * 0.08);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(xx + px * 0.1, y);
                ctx.lineTo(xx + b - px * 0.1, y);
                ctx.stroke();
                ctx.restore();
            } else {
                tegnTekst(ctx, d.t, xx, y + 1, px, d.matte, d.fed, d.farve || farve, false);
            }
            xx += b;
        });
        return xx - x;
    };

    /* Et tal i en cirkel (gruppe 1 og 2 paa fane 3) */
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

    /* En lille tavle med tal: "Opvarmet i alt: 7 min" og temperaturen */
    T.infoskilt = function (ctx, x, y, linjer, px) {
        ctx.save();
        ctx.font = font("700", px);
        var b = 0;
        linjer.forEach(function (l) { b = Math.max(b, ctx.measureText(l.t).width); });
        b += px * 1.6;
        var h = linjer.length * px * 1.45 + px * 0.7;
        ctx.fillStyle = "rgba(12, 13, 18, 0.7)";
        NK.rundtRekt(ctx, x, y, b, h, 7);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        linjer.forEach(function (l, i) {
            NK.tekst(ctx, l.t, x + px * 0.8, y + px * 0.35 + px * 1.45 * (i + 0.5), { font: font("700", px), linje: "middle", farve: l.farve || "#dfe6ee" });
        });
        ctx.restore();
        return { x: x, y: y, b: b, h: h };
    };

    NK.Tegn = T;
}());

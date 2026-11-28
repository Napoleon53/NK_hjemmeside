/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet og bordet (som sc5.3), vaegten (som sc5.5), braenderen med
   flammen, trefoden, diglen med pulveret, tangen, damp og korn, der
   sproejter, natronglasset, luppen med ionerne, grafen over massen paa
   et lyst ark (fane 1 og 2) og opfordringerne (ring og skilt).
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

    /* ----- Rummet og bordet (som sc5.3) --------------------------------------- */
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

    /* ----- Vaegten (som sc5.5) ----------------------------------------------------------- */
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
        HCO3: { t: "HCO₃⁻", farve: "#ece5cf", r: 15 },
        CO3: { t: "CO₃²⁻", farve: "#f2d27a", r: 15 },
        ukendt: { t: "?", farve: "#9aa3ad", r: 15 },
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
                ud.push({ x: (c - (KOL - 1) / 2) * 0.4, y: 0.6 - r * 0.31, type: (c + r) % 2 === 0 ? "HCO3" : "Na" });
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
        if (tekst) NK.tekst(ctx, tekst, x, y + 0.5, { font: font("700", px), justering: "center", linje: "middle", farve: "#1f2530" });
    }

    T.kugle = kugle;

    /* Reaktionen som kugler: 2 NaHCO₃ → Na₂CO₃ + CO₂ + H₂O (dommen paa
       fane 2). (x, y): venstre ende af linjens midte, b: bredden. */
    T.reaktionKugler = function (ctx, x, y, b) {
        var R = NK.klamp(b / 21, 16, 28), rn = R * 0.64;
        var px = NK.klamp(R * 0.52, 13.5, 16);
        var xx = x;
        function ion(id, r) {
            kugle(ctx, xx + r, y, r, ION[id].farve, ION[id].t, id === "Na" ? Math.max(13.5, px * 0.95) : px);
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
        /* Formlen i kuglen er mindst 13,5 px (REGELSAET 24); kuglerne er store
           og spredt ud over luppen (runde T13) */
        var px = NK.klamp(13.5 * s, 13.5, 16);
        PLADSER.forEach(function (p, i) {
            var t = lup.tilstand[i];
            if (t === "vaek") return;
            var type = p.type === "Na" ? "Na" : (t === "CO3" ? "CO3" : t === "ukendt" ? "ukendt" : "HCO3");
            var ion = ION[type];
            var ryst = v.varm ? Math.sin(v.t * 30 + i * 1.7) * 1.2 * s : 0;
            kugle(ctx, cx + p.x * r + ryst, cy + p.y * r, ion.r * s * 1.5, ion.farve, ion.t, px);
        });
        lup.fri.forEach(function (f) {
            var ion = ION[f.type];
            ctx.globalAlpha = NK.klamp(1 - (f.y < -0.9 ? (-0.9 - f.y) / 0.35 : 0), 0, 1);
            kugle(ctx, cx + f.x * r, cy + f.y * r, ion.r * s * 1.5, ion.farve, ion.t, px);
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

    /* ----- Grafen over massen paa et lyst ark (fane 1 og 2) -----------------------------
       Aksetitler med stort forbogstav, y-titlen vandret over aksen. r: grafens
       plads (titlen staar oeverst i den). o: { vejninger: [{ t, m }], yMax,
       xMax, linjer: { A: m } (de hypoteser, der er regnet) eller null,
       dommen: hypotese B er fundet (de andre streger svagere), ny: { A: 0-1 }
       (en ny streg tegnes ud fra venstre), titel } */
    function lex(v, px) { return v + " " + (Math.round(px * 10) / 10) + "px Lexend, 'Segoe UI', sans-serif"; }
    T.lex = lex;
    var HYP_STREG = { A: "#c4493c", B: "#2b7d51", C: "#2a76ac" };
    T.HYP_STREG = HYP_STREG;

    T.massegraf = function (ctx, r, o) {
        var v = o.vejninger || [], linjer = o.linjer && Object.keys(o.linjer).length ? o.linjer : null;
        var px = 13.5;
        var venstre = r.x + 30, hoejre = r.x + r.b - (linjer ? 66 : 8);
        var top = r.y + 46, bund = r.y + r.h - 38;
        if (bund - top < 50) top = bund - 50;
        var yMax = o.yMax || 6, xMax = o.xMax || 20;
        function X(t) { return venstre + (hoejre - venstre) * NK.klamp(t / xMax, 0, 1); }
        function Y(m) { return bund - (bund - top) * NK.klamp(m / yMax, 0, 1.02); }
        NK.tekst(ctx, o.titel || "Massen i diglen", r.x, r.y + 10, { font: lex("600", 15), linje: "middle", farve: "#1d2433" });
        NK.tekst(ctx, "Masse (g)", r.x, top - 14, { font: lex("600", px), linje: "middle", farve: "#1d2433" });
        ctx.save();
        var trinY = (bund - top) / yMax < px * 1.5 ? 2 : 1;
        for (var m = 0; m <= yMax + 1e-9; m += trinY) {
            var y = Y(m);
            ctx.strokeStyle = "#ebe6da";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(venstre, y); ctx.lineTo(hoejre, y); ctx.stroke();
            NK.tekst(ctx, String(m), venstre - 7, y, { font: lex("400", px), justering: "right", linje: "middle", farve: "#3a4150" });
        }
        var trinX = xMax <= 20 ? 5 : xMax <= 40 ? 10 : 20;
        for (var t = 0; t <= xMax + 1e-9; t += trinX) {
            NK.tekst(ctx, String(t), X(t), bund + 13, { font: lex("400", px), justering: "center", linje: "middle", farve: "#3a4150" });
        }
        NK.tekst(ctx, "Opvarmet (min)", (venstre + hoejre) / 2, bund + 31, { font: lex("600", px), justering: "center", linje: "middle", farve: "#1d2433" });
        ctx.strokeStyle = "#5b6270";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(venstre, top - 4); ctx.lineTo(venstre, bund); ctx.lineTo(hoejre + 4, bund); ctx.stroke();
        /* Hypotesernes streger. Etiketterne skubbes fra hinanden, saa de ikke overlapper. */
        if (linjer) {
            var etY = {}, raekke = D.HYP_IDS.filter(function (id) { return linjer[id] !== undefined && linjer[id] !== null; })
                .map(function (id) { return { id: id, y: Y(linjer[id]) }; }).sort(function (a, b) { return a.y - b.y; });
            raekke.forEach(function (e, i) { if (i > 0 && e.y - raekke[i - 1].y < px * 1.2) e.y = raekke[i - 1].y + px * 1.2; etY[e.id] = e.y; });
            raekke.forEach(function (e) {
                var mm = linjer[e.id], yy = Y(mm), fremh = o.dommen && e.id === D.RIGTIG;
                var ny = o.ny && o.ny[e.id] !== undefined ? NK.klamp(o.ny[e.id], 0, 1) : 1;
                ctx.save();
                ctx.globalAlpha = o.dommen && !fremh ? 0.5 : 1;
                ctx.strokeStyle = HYP_STREG[e.id];
                ctx.lineWidth = fremh ? 2.6 : 1.8;
                ctx.setLineDash([7, 5]);
                ctx.beginPath(); ctx.moveTo(venstre, yy); ctx.lineTo(venstre + (hoejre - venstre) * ny, yy); ctx.stroke();
                ctx.setLineDash([]);
                if (ny > 0.95) NK.tekst(ctx, e.id + " " + NK.betydende(mm, 3) + " g", hoejre + 5, etY[e.id], { font: lex("600", px), linje: "middle", farve: HYP_STREG[e.id] });
                ctx.restore();
            });
        }
        /* Vejningerne */
        if (v.length) {
            ctx.strokeStyle = "#c2671f";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            v.forEach(function (p, i) { if (i === 0) ctx.moveTo(X(p.t), Y(p.m)); else ctx.lineTo(X(p.t), Y(p.m)); });
            ctx.stroke();
            v.forEach(function (p) {
                ctx.fillStyle = "#c2671f";
                ctx.beginPath(); ctx.arc(X(p.t), Y(p.m), 4.2, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#fbfaf6";
                ctx.lineWidth = 1.4;
                ctx.stroke();
            });
        }
        ctx.restore();
        return { X: X, Y: Y, venstre: venstre, hoejre: hoejre, top: top, bund: bund };
    };

    /* Et lyst ark med skygge (REGELSAET 29) */
    T.lystArk = function (ctx, R) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 12);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.fillStyle = "#fbfaf6";
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#d9d4c6";
        ctx.stroke();
        ctx.restore();
    };

    /* En stiplet plads med navnet, til tingen bruges (REGELSAET 13) */
    T.plads = function (ctx, R, navn, lys) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.setLineDash([7, 6]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = lys ? "#b3bac5" : "#4a4f5e";
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, navn, R.x + R.b / 2, R.y + R.h / 2 + 5, { font: lex("400", 15), justering: "center", farve: lys ? "#7d8594" : "#8f97a3" });
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

    /* ----- Opfordringerne paa fane 1 (runde T13, som sc4.7's tegning.js) ------------------
       omRing: en rolig gul ring om det, kortet handler om. ring: en ring, der
       pulserer roligt, om det, eleven skal bruge nu. skilt: et lille gult skilt
       med en spids, der peger ned paa tingen (REGELSAET 19-21). */
    var LEX = "Lexend, 'Segoe UI', sans-serif";

    T.omRing = function (ctx, x, y, b, h, farve) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, 16);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    T.omCirkel = function (ctx, x, y, r) {
        ctx.save();
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.beginPath(); ctx.arc(x, y, r + 11, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f2c53d";
        ctx.beginPath(); ctx.arc(x, y, r + 8, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    T.ring = function (ctx, x, y, b, h, tid, radius) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = "600 14px " + LEX;
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        var top = y - h;
        NK.rundtRekt(ctx, vx, top, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1); ctx.lineTo(x + 7, y - 1); ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, top + h / 2 + 0.5);
        ctx.restore();
        return { x: vx, y: top, b: b, h: h + 8 };
    };

    NK.Tegn = T;
}());

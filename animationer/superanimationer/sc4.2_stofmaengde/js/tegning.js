/* =====================================================================
   tegning.js - det, alle tre faner tegner

   Rummet og bordet, plakaten med 1 mol, hylden og krukkerne med
   metallet, klumperne paa 1 mol, vaegten med displayet, proeven i
   vejebaaden og zoomboblen med atomerne. Funktionerne tegner én ting et
   bestemt sted og husker intet selv; fanerne bestemmer, hvor tingene
   staar, og hvordan de bevaeger sig.
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

    /* Et fast pseudo-tilfaeldigt tal, saa korn og atomer ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* Lys eller moerk skrift paa stoffets farve */
    function lysFarve(hex) {
        var c = rgb(hex);
        return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2] > 140;
    }

    /* ----- Rummet og bordet (som sc4.1) -------------------------------------- */
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

    /* ----- Plakaten: 1 mol og Avogadros konstant ------------------------------
       v.lys: 0-1, plakaten blinker (hintet peger paa den) */
    T.molPlakat = function (ctx, x, y, b, h, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#ece8dd";
        NK.rundtRekt(ctx, x, y, b, h, 4);
        ctx.fill();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.35 * v.lys) + ")";
            ctx.fill();
        }
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.95)" : "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = v.lys ? 3 : 1;
        ctx.stroke();
        [[x + 8, y + 8], [x + b - 8, y + 8]].forEach(function (q) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(q[0], q[1], 3.2, 0, Math.PI * 2);
            ctx.fill();
        });
        var pad = Math.max(10, b * 0.06), ib = b - 2 * pad;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c1f26";
        var t1 = "1 mol = 6,02 · 10²³ atomer";
        var p1 = NK.passendeSkrift(ctx, t1, ib, NK.klamp(h * 0.26, 12, 30), 9, "700");
        ctx.fillText(t1, x + b / 2, y + h * 0.36);
        /* N med saenket A, efterfulgt af resten */
        var p2 = NK.klamp(p1 * 0.62, 9, 17);
        var rest = " = 6,02 · 10²³ mol⁻¹";
        ctx.font = font("600", p2);
        var bN = ctx.measureText("N").width, bA, bRest = ctx.measureText(rest).width;
        ctx.font = font("600", p2 * 0.7);
        bA = ctx.measureText("A").width;
        var x2 = x + b / 2 - (bN + bA + bRest) / 2, y2 = y + h * 0.72;
        ctx.textAlign = "left";
        ctx.fillStyle = "#4a4438";
        ctx.font = "italic " + font("600", p2);
        ctx.fillText("N", x2, y2);
        ctx.font = font("600", p2 * 0.7);
        ctx.fillText("A", x2 + bN, y2 + p2 * 0.3);
        ctx.font = font("600", p2);
        ctx.fillText(rest, x2 + bN + bA, y2);
        ctx.restore();
        return p1;
    };

    /* ----- Hylden paa vaeggen --------------------------------------------------- */
    T.hylde = function (ctx, x0, x1, y) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x0 + 4, y + 10, x1 - x0, 5);
        /* Konsollerne */
        ctx.fillStyle = "#4a4f5c";
        [x0 + 24, x1 - 24].forEach(function (kx) {
            ctx.beginPath();
            ctx.moveTo(kx - 4, y + 9);
            ctx.lineTo(kx + 4, y + 9);
            ctx.lineTo(kx + 4, y + 34);
            ctx.lineTo(kx - 4, y + 24);
            ctx.closePath();
            ctx.fill();
        });
        var g = ctx.createLinearGradient(0, y, 0, y + 10);
        g.addColorStop(0, "#8a6a47");
        g.addColorStop(1, "#5f4730");
        ctx.fillStyle = g;
        ctx.fillRect(x0, y, x1 - x0, 10);
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(x0, y, x1 - x0, 1.5);
        ctx.restore();
    };

    /* ----- Klumpen: 1 mol af et grundstof ----------------------------------------
       En terning set lidt fra hoejre og oppefra. (x, y) er midten af
       forsidens bund, c er kanten i px. v.lys: 0-1, en gul ramme. v.alfa */
    T.klump = function (ctx, x, y, c, st, v) {
        v = v || {};
        if (c < 1) return;
        var dx = c * 0.3, dy = c * 0.22;
        var x0 = x - c / 2, y0 = y - c;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        /* Siden */
        ctx.fillStyle = nuance(st.farve, -0.32);
        ctx.beginPath();
        ctx.moveTo(x0 + c, y0);
        ctx.lineTo(x0 + c + dx, y0 - dy);
        ctx.lineTo(x0 + c + dx, y - dy);
        ctx.lineTo(x0 + c, y);
        ctx.closePath();
        ctx.fill();
        /* Toppen */
        ctx.fillStyle = nuance(st.farve, 0.3);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + dx, y0 - dy);
        ctx.lineTo(x0 + c + dx, y0 - dy);
        ctx.lineTo(x0 + c, y0);
        ctx.closePath();
        ctx.fill();
        /* Forsiden med metallets glans */
        var g = ctx.createLinearGradient(x0, y0, x0 + c, y);
        g.addColorStop(0, nuance(st.farve, 0.16));
        g.addColorStop(0.45, st.farve);
        g.addColorStop(1, nuance(st.farve, -0.16));
        ctx.fillStyle = g;
        ctx.fillRect(x0, y0, c, c);
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.beginPath();
        ctx.moveTo(x0 + c * 0.12, y0 + c * 0.1);
        ctx.lineTo(x0 + c * 0.42, y0 + c * 0.1);
        ctx.lineTo(x0 + c * 0.12, y0 + c * 0.55);
        ctx.closePath();
        ctx.fill();
        /* Kanterne */
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x0, y0);
        ctx.lineTo(x0 + dx, y0 - dy);
        ctx.lineTo(x0 + c + dx, y0 - dy);
        ctx.lineTo(x0 + c + dx, y - dy);
        ctx.lineTo(x0 + c, y);
        ctx.closePath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0 + c, y0);
        ctx.lineTo(x0 + c + dx, y0 - dy);
        ctx.moveTo(x0 + c, y0);
        ctx.lineTo(x0 + c, y);
        ctx.stroke();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + NK.klamp(v.lys, 0, 1) + ")";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0 - 3, y0 - dy - 3, c + dx + 6, c + dy + 6);
        }
        ctx.restore();
    };

    /* Klumpens yderkant, til musen */
    T.klumpRekt = function (x, y, c) {
        return { x: x - c / 2, y: y - c - c * 0.22, b: c * 1.3, h: c * 1.22 };
    };

    /* ----- Krukken med metallet --------------------------------------------------
       (x, y): midten af bunden, h: hoejden. Krukken indeholder smaa klumper.
       v.valgt: stoffet, der ligger paa vaegten (gul ramme). v.lys: musen er
       over den. v.fremhaev: 0-1, etiketten blinker (hint). v.alfa.
       v.udenLaag: laaget er taget af (fane 3, naar der haeldes).
       v.udenSkygge: krukken er loeftet fra bordet. */
    T.krukkeBredde = function (h) { return h * MAAL.pulverglas.b / MAAL.pulverglas.h; };

    /* Laaget alene, med bunden i (x, y). b: krukkens bredde. Laaget er
       oeverst i pulverglasset (y 2-22 i filen). */
    T.laag = function (ctx, x, y, b) {
        var M = MAAL.pulverglas, k = b / M.b;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 36 * k, y - 21 * k, 72 * k, 21 * k);
        ctx.clip();
        NK.Sprites.tegn(ctx, "pulverglas", x - 50 * k, y - 22 * k, b, M.h * k);
        ctx.restore();
    };

    T.krukke = function (ctx, x, y, h, st, v) {
        v = v || {};
        var M = MAAL.pulverglas, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (!v.udenSkygge) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.beginPath();
            ctx.ellipse(x, y - 1, b * 0.46, Math.max(2, 4 * k), 0, 0, Math.PI * 2);
            ctx.fill();
        }
        if (v.valgt || v.lys) {
            ctx.strokeStyle = v.valgt ? "rgba(242, 197, 61, 0.95)" : "rgba(242, 197, 61, 0.5)";
            ctx.lineWidth = Math.max(2, 3 * k);
            NK.rundtRekt(ctx, x0 + 2 * k, y0 - 3 * k, b - 4 * k, h + 5 * k, 14 * k);
            ctx.stroke();
        }
        /* Klumperne i krukken, bag glasset */
        var iv = x0 + M.indV * k, ih = x0 + M.indH * k, it = y0 + M.indTop * k, ib = y0 + M.indBund * k;
        ctx.save();
        NK.rundtRekt(ctx, iv, it, ih - iv, ib - it, M.indR * k);
        ctx.clip();
        var c = (ih - iv) / 4.6, r = froe(st.nr + 5);
        for (var raekke = 0; raekke < 3; raekke++) {
            var antal = raekke === 2 ? 3 : 4;
            for (var i = 0; i < antal; i++) {
                var cx = iv + c * (0.75 + i * 1.08 + (raekke % 2) * 0.5) + (r() - 0.5) * c * 0.2;
                T.klump(ctx, cx, ib - 2 * k - raekke * c * 0.92, c * (0.92 + r() * 0.12), st, {});
            }
        }
        ctx.restore();
        if (v.udenLaag) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0 - 2, y0 + 20 * k, b + 4, h);
            ctx.clip();
            NK.Sprites.tegn(ctx, "pulverglas", x0, y0, b, h);
            ctx.restore();
        } else {
            NK.Sprites.tegn(ctx, "pulverglas", x0, y0, b, h);
        }
        /* Etiketten: symbolet, navnet og molarmassen. Den gaar lidt om paa
           siderne af glasset (x 9-91), saa molarmassen kan staa stort. */
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
        ctx.fillStyle = st.farve;
        ctx.fillRect(e.x + 1, e.y + 1, e.b - 2, Math.max(3, e.h * 0.1));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c1f26";
        var ib2 = e.b * 0.92, top = e.y + Math.max(3, e.h * 0.1);
        var rest = e.h - (top - e.y);
        NK.passendeSkrift(ctx, st.s, ib2, NK.klamp(rest * 0.38, 10, 34), 9, "700");
        ctx.fillText(st.s, e.x + e.b / 2, top + rest * 0.25);
        NK.passendeSkrift(ctx, st.navn, ib2, NK.klamp(rest * 0.25, 9, 17), 8, "600");
        ctx.fillStyle = "#4a4f5a";
        ctx.fillText(st.navn, e.x + e.b / 2, top + rest * 0.58);
        var mt = NK.komma(st.M) + " g/mol";
        NK.passendeSkrift(ctx, mt, ib2, NK.klamp(rest * 0.26, 9, 17), 8, "700");
        ctx.fillStyle = "#1d7a48";
        ctx.fillText(mt, e.x + e.b / 2, top + rest * 0.85);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: e, mund: { x: x, y: y0 + 20 * k } };
    };

    /* ----- Vaegten (som sc4.1) --------------------------------------------------
       (x, y): midten af bunden. b: bredden. tekst: det, displayet viser.
       v.lys: displayet lyser op. v.etiket: lille tekst til venstre i
       displayet. Giver skaalens overflade. */
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

    /* Vaegtens skaal: midten af overfladen og bredden */
    T.vaegtSkaal = function (x, y, b) {
        var M = MAAL.vaegt, k = b / M.b;
        return { x: x, y: y - M.bund * k + M.skaalY * k, b: M.skaalB * k };
    };

    /* Displayets tekst for en masse i hundrededele: "190,65 g" */
    T.gram = function (m) { return NK.komma(m) + " g"; };

    /* Antallet paa displayet: "1,81·10²⁴" (uden mellemrum, saa det kan vaere der) */
    T.displayAntal = function (N) { return NK.potens(N, 3).replace(/ · /g, "·"); };

    /* ----- Proeven i vejebaaden (fane 2 og 3) ----------------------------------------
       (x, y): midten af skaalen. bb: baadens bredde. t: 0-1, hvor meget
       der er haeldt i. hoejde: bunkens hoejde i px ved t = 1. */
    T.bunke = function (ctx, x, y, bb, st, t, hoejde, nr) {
        var M = MAAL.vejebaad, k = bb / M.b, h = M.h * k;
        var x0 = x - bb / 2, y0 = y - M.bund * k;
        var bundY = y0 + M.indBund * k + 4 * k;
        var hh = hoejde * Math.sqrt(NK.klamp(t, 0, 1));
        var ix0 = x0 + (M.indV + 4) * k, ix1 = x0 + (M.indH - 4) * k;
        var bredde = (ix1 - ix0) * (0.45 + 0.55 * Math.sqrt(NK.klamp(t, 0, 1)));
        var a0 = x - bredde / 2, a1 = x + bredde / 2;
        ctx.save();
        if (hh > 0.5) {
            var g = ctx.createLinearGradient(0, bundY - hh, 0, bundY);
            g.addColorStop(0, nuance(st.farve, 0.12));
            g.addColorStop(1, nuance(st.farve, -0.22));
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
                var lys = r() < 0.45;
                ctx.fillStyle = lys ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.18)";
                var s = lys ? 1.3 : 1.8;
                ctx.fillRect(a0 + r() * bredde, bundY - r() * hh * 1.05, s, s);
            }
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vejebaad", x0, y0, bb, h);
        ctx.restore();
        return { x: x0, y: bundY - hh, b: bb, h: y - (bundY - hh), top: bundY - hh };
    };

    /* Bunkens hoejde: den foelger rumfanget, som en terning ville (kubikroden) */
    T.bunkeHoejde = function (bb, V) {
        return NK.klamp(bb * 0.11 * Math.pow(Math.max(V, 0.001), 1 / 3), bb * 0.04, bb * 0.32);
    };

    /* ----- Zoomboblen med atomerne -------------------------------------------------
       (cx, cy): midten, R: radius. Metallerne er taetpakkede kugler med
       deres radius; carbon er grafittens sekskanter. v.alfa */
    var PM = 1 / 780;   /* radius i px pr. pm pr. px boble */

    T.zoom = function (ctx, cx, cy, R, st, tid, v) {
        v = v || {};
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        ctx.fillStyle = "#0e0f14";
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R - 1, 0, Math.PI * 2);
        ctx.clip();
        var ra = st.r * R * PM;
        var r = froe(st.nr + 31);
        var atomer = [];
        var i, j;
        if (st.s === "C") {
            /* Grafit: sekskanter, bindingslaengden er 2 · radius */
            var a = 2 * ra, sx = Math.sqrt(3) * a, sy = 1.5 * a;
            var kol = Math.ceil(R / sx) + 2, rk = Math.ceil(R / sy) + 2;
            for (j = -rk; j <= rk; j++) {
                for (i = -kol; i <= kol; i++) {
                    var bx = cx + i * sx + (j % 2 ? sx / 2 : 0), by = cy + j * sy;
                    atomer.push({ x: bx, y: by }, { x: bx, y: by + a });
                }
            }
            ctx.strokeStyle = "rgba(170, 176, 188, 0.55)";
            ctx.lineWidth = Math.max(1.2, ra * 0.2);
            ctx.beginPath();
            atomer.forEach(function (p, n) {
                if (n % 2 === 0) {
                    /* Fra det oeverste atom i paret: ned til det nederste og skraat op til to naboer */
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x, p.y + a);
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x - sx / 2, p.y - a / 2);
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.x + sx / 2, p.y - a / 2);
                }
            });
            ctx.stroke();
            ra *= 0.62;
        } else {
            var d = 2 * ra, h = Math.sqrt(3) * ra;
            var kol2 = Math.ceil(R / d) + 2, rk2 = Math.ceil(R / h) + 2;
            for (j = -rk2; j <= rk2; j++) {
                for (i = -kol2; i <= kol2; i++) {
                    atomer.push({ x: cx + i * d + (j % 2 ? ra : 0), y: cy + j * h });
                }
            }
        }
        var tekstFarve = lysFarve(st.farve) ? "#1f232b" : "#ffffff";
        atomer.forEach(function (p) {
            var fase = r() * 6.28, fart = 2 + r() * 2;
            var x = p.x + Math.sin((tid || 0) * fart + fase) * ra * 0.05;
            var y = p.y + Math.cos((tid || 0) * fart * 1.1 + fase) * ra * 0.05;
            if (Math.abs(x - cx) > R + ra || Math.abs(y - cy) > R + ra) return;
            var g = ctx.createRadialGradient(x - ra * 0.35, y - ra * 0.4, ra * 0.1, x, y, ra);
            g.addColorStop(0, nuance(st.farve, 0.4));
            g.addColorStop(1, nuance(st.farve, -0.18));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, ra * 0.97, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
            if (ra >= 9) {
                ctx.fillStyle = tekstFarve;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = font("700", Math.min(ra * 0.8, 16));
                ctx.fillText(st.s, x, y + 0.5);
            }
        });
        ctx.restore();
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    /* Den stiplede linje fra zoomboblen ned til det, den viser */
    T.zoomLinje = function (ctx, cx, cy, R, px, py) {
        var dx = px - cx, dy = py - cy, l = Math.sqrt(dx * dx + dy * dy);
        if (l < R + 4) return;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.7)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(cx + dx / l * R, cy + dy / l * R);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#f2c53d";
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- En buet, stiplet pil, der viser, hvad der kan traekkes hvorhen --------
       (kx, ky): kurvens knaekpunkt; uden det buer pilen opad */
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
        /* Spidsen peger langs kurvens sidste stykke */
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

    /* ----- Smaating (som sc4.1) ----------------------------------------------------- */
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

    NK.Tegn = T;
}());

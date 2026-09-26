/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, krukkerne, vaegtene med pulveret i
   vejebaaden, poserne med 1 mol, pilene i skemaet og skaalvaegten.
   Funktionerne tegner én ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger sig.
   Vaegten, vejebaaden og krukken er tegnet som i sc4.2, skaalvaegten
   som i sc4.1.
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

    /* Er farven lys? Saa skrives der moerkt paa den. */
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

    /* ----- Rummet, bordet og tavlen ------------------------------------------ */
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
        /* Hylden til tuscherne */
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

    /* ----- Krukken med stoffet ------------------------------------------------------
       (x, y): midten af bunden, h: hoejden. Pulveret fylder fyld (0-1) af
       krukken. Etiketten viser formlen, navnet og molarmassen.
       v.fremhaev: 0-1, etiketten lyser (hint). v.lys: musen er over den. */
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
            ctx.strokeStyle = "rgba(242, 197, 61, 0.6)";
            ctx.lineWidth = Math.max(2, 3 * k);
            NK.rundtRekt(ctx, x0 + 2 * k, y0 - 3 * k, b - 4 * k, h + 5 * k, 14 * k);
            ctx.stroke();
        }
        /* Pulveret bag glasset */
        var iv = x0 + M.indV * k, ih = x0 + M.indH * k, it = y0 + M.indTop * k, ib = y0 + M.indBund * k;
        var fyld = v.fyld === undefined ? 0.62 : v.fyld;
        var top = ib - (ib - it) * fyld;
        ctx.save();
        NK.rundtRekt(ctx, iv, it, ih - iv, ib - it, M.indR * k);
        ctx.clip();
        var g = ctx.createLinearGradient(0, top, 0, ib);
        g.addColorStop(0, nuance(st.farve, 0.1));
        g.addColorStop(1, nuance(st.farve, -0.2));
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
        /* Etiketten: formlen, navnet og molarmassen */
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
        ctx.fillStyle = lys(st.farve) ? nuance(st.farve, -0.35) : st.farve;
        ctx.fillRect(e.x + 1, e.y + 1, e.b - 2, Math.max(3, e.h * 0.1));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c1f26";
        var ib2 = e.b * 0.92, t0 = e.y + Math.max(3, e.h * 0.1);
        var rest = e.h - (t0 - e.y);
        NK.passendeSkrift(ctx, st.formel, ib2, NK.klamp(rest * 0.36, 11, 30), 9, "700");
        ctx.fillText(st.formel, e.x + e.b / 2, t0 + rest * 0.25);
        NK.passendeSkrift(ctx, st.navn, ib2, NK.klamp(rest * 0.24, 10, 16), 8, "600");
        ctx.fillStyle = "#4a4f5a";
        ctx.fillText(st.navn, e.x + e.b / 2, t0 + rest * 0.57);
        var mt = NK.komma(st.M) + " g/mol";
        NK.passendeSkrift(ctx, mt, ib2, NK.klamp(rest * 0.25, 10, 16), 8, "700");
        ctx.fillStyle = "#1d7a48";
        ctx.fillText(mt, e.x + e.b / 2, t0 + rest * 0.85);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: e };
    };

    /* ----- Vaegten (som sc4.1 og sc4.2) -----------------------------------------------
       (x, y): midten af bunden. b: bredden. tekst: det, displayet viser.
       v.lys: displayet lyser op. Giver skaalens overflade. */
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
        ctx.fillStyle = "#7df0c0";
        ctx.shadowColor = "rgba(125, 240, 192, 0.6)";
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

    /* Displayets tekst for en masse i gram: "190,65 g" */
    T.gram = function (g) { return NK.tal2(g) + " g"; };

    /* ----- Pulveret i vejebaaden -----------------------------------------------------
       (x, y): midten af skaalen. bb: baadens bredde. t: 0-1, hvor meget
       der ligger. hoejde: bunkens hoejde i px ved t = 1. */
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

    /* ----- Posen med 1 mol -----------------------------------------------------------
       En saek set forfra med snoren om halsen. (x, y): midten af bunden.
       s: hoejden af en hel pose i px. v.andel: 0,5 er en halv pose (mindre,
       med "0,5 mol" paa). v.etiket: en anden tekst end "1 mol" (fx massen). v.alfa, v.rest (orange stiplet ring: til overs),
       v.lys (gul ring), v.skaev (lidt drejet). Giver posens rektangel. */
    T.pose = function (ctx, x, y, s, st, v) {
        v = v || {};
        var andel = v.andel === undefined ? 1 : v.andel;
        var h = s * (andel >= 1 ? 1 : 0.62 + 0.38 * andel), b = h * 0.86;
        if (h < 2) return null;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        ctx.translate(x, y);
        if (v.skaev) ctx.rotate(v.skaev);
        var gas = st.slags === "gas";
        var kant = gas ? "#8193a8" : nuance(st.farve, -0.45);
        /* Skyggen paa bordet */
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(0, -1, b * 0.46, Math.max(1.5, h * 0.05), 0, 0, Math.PI * 2);
        ctx.fill();
        /* Saekken */
        var hals = -h * 0.8, top = -h;
        ctx.beginPath();
        ctx.moveTo(-b * 0.2, hals);
        ctx.bezierCurveTo(-b * 0.62, hals + h * 0.12, -b * 0.56, -h * 0.05, -b * 0.4, 0);
        ctx.lineTo(b * 0.4, 0);
        ctx.bezierCurveTo(b * 0.56, -h * 0.05, b * 0.62, hals + h * 0.12, b * 0.2, hals);
        ctx.closePath();
        var g = ctx.createLinearGradient(-b / 2, 0, b / 2, 0);
        g.addColorStop(0, nuance(st.farve, -0.18));
        g.addColorStop(0.4, nuance(st.farve, 0.12));
        g.addColorStop(1, nuance(st.farve, -0.25));
        ctx.fillStyle = gas ? "rgba(223, 232, 240, 0.75)" : g;
        ctx.fill();
        ctx.strokeStyle = kant;
        ctx.lineWidth = Math.max(1, h * 0.03);
        ctx.stroke();
        /* Toppen over snoren */
        ctx.beginPath();
        ctx.moveTo(-b * 0.18, hals);
        ctx.quadraticCurveTo(-b * 0.3, top + h * 0.02, -b * 0.08, top);
        ctx.lineTo(b * 0.08, top);
        ctx.quadraticCurveTo(b * 0.3, top + h * 0.02, b * 0.18, hals);
        ctx.closePath();
        ctx.fillStyle = gas ? "rgba(223, 232, 240, 0.75)" : nuance(st.farve, -0.08);
        ctx.fill();
        ctx.stroke();
        /* Snoren */
        ctx.strokeStyle = "#b8862e";
        ctx.lineWidth = Math.max(1.4, h * 0.05);
        ctx.beginPath();
        ctx.moveTo(-b * 0.21, hals + 1);
        ctx.lineTo(b * 0.21, hals + 1);
        ctx.stroke();
        /* Formlen og maengden */
        var moerk = gas || lys(st.farve);
        ctx.fillStyle = moerk ? "#1c1f26" : "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fpx = NK.passendeSkrift(ctx, st.formel, b * 0.8, NK.klamp(h * 0.3, 10, 20), 8, "800");
        ctx.fillText(st.formel, 0, -h * 0.46);
        var mt = v.etiket !== undefined ? v.etiket : (andel >= 1 ? "1 mol" : NK.betydende(andel, 2).replace(/,?0+$/, "") + " mol");
        if (h >= 34 && mt) {
            NK.passendeSkrift(ctx, mt, b * 0.9, NK.klamp(fpx * 0.78, 11, 14), 9, "700");
            ctx.fillStyle = moerk ? "#3a4150" : "rgba(255, 255, 255, 0.85)";
            ctx.fillText(mt, 0, -h * 0.2);
        }
        /* Ringene */
        if (v.rest || v.lys) {
            ctx.strokeStyle = v.rest ? "rgba(230, 137, 42, 0.95)" : "rgba(242, 197, 61, " + (0.5 + 0.5 * NK.klamp(v.lys, 0, 1)) + ")";
            ctx.lineWidth = 2.5;
            if (v.rest) ctx.setLineDash([5, 4]);
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.5, b * 0.68, h * 0.64, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
        return { x: x - b / 2, y: y - h, b: b, h: h };
    };

    /* Poser paa raekke: pladserne for n mol, hoejst pr pr. raekke.
       Giver [{ x, y, andel }] med (x, y) som bunden af hver pose. */
    T.posePladser = function (n, cx, bund, s, pr) {
        /* En masse med to decimaler giver fx 1,50021 mol: det er halvanden pose */
        var halve = Math.round(n * 2) / 2;
        if (Math.abs(halve - n) < 0.01) n = halve;
        var hele = Math.floor(n + 1e-9), rest = n - hele;
        var liste = [];
        for (var i = 0; i < hele; i++) liste.push(1);
        if (rest > 0.01) liste.push(rest);
        pr = pr || 4;
        var afst = s * 0.96, raekker = Math.ceil(liste.length / pr);
        return liste.map(function (andel, i) {
            var r = Math.floor(i / pr), c = i % pr;
            var iRaekke = Math.min(pr, liste.length - r * pr);
            return { x: cx + (c - (iRaekke - 1) / 2) * afst, y: bund - (raekker - 1 - r) * s * 0.78, andel: andel };
        });
    };

    /* ----- Pilene i skemaet ------------------------------------------------------
       En buet pil fra (x0, y0) til (x1, y1) om kontrolpunktet (kx, ky).
       v.farve, v.t (0-1: hvor meget af pilen der er tegnet), v.lys. */
    T.rutePil = function (ctx, x0, y0, x1, y1, kx, ky, v) {
        v = v || {};
        var t = v.t === undefined ? 1 : NK.klamp(v.t, 0, 1);
        if (t <= 0.01) return;
        var farve = v.farve || "#2f6fc4";
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.lineWidth = v.lys ? 3.2 : 2.4;
        ctx.lineCap = "round";
        ctx.globalAlpha *= v.alfa === undefined ? 1 : v.alfa;
        ctx.beginPath();
        var n = 24, px = x0, py = y0, sx = x0, sy = y0;
        ctx.moveTo(x0, y0);
        for (var i = 1; i <= n * t; i++) {
            var u = i / n;
            sx = px; sy = py;
            px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * kx + u * u * x1;
            py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * ky + u * u * y1;
            ctx.lineTo(px, py);
        }
        ctx.stroke();
        if (t >= 0.98) {
            var vx = x1 - kx, vy = y1 - ky, l = Math.sqrt(vx * vx + vy * vy) || 1;
            vx /= l; vy /= l;
            ctx.fillStyle = farve;
            ctx.beginPath();
            ctx.moveTo(x1 + vx * 2, y1 + vy * 2);
            ctx.lineTo(x1 - vx * 10 - vy * 5.5, y1 - vy * 10 + vx * 5.5);
            ctx.lineTo(x1 - vx * 10 + vy * 5.5, y1 - vy * 10 - vx * 5.5);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };

    /* En lille etiket paa en pil: "÷ M", "· M" eller "· 4/2" med broek.
       e: { tekst } eller { pre, op, ned }. Giver bredden. */
    T.pilEtiket = function (ctx, x, y, e, v) {
        v = v || {};
        var px = v.px || 13, farve = v.farve || "#2f6fc4";
        ctx.save();
        ctx.globalAlpha *= v.alfa === undefined ? 1 : v.alfa;
        ctx.font = font("800", px);
        var b;
        if (e.op !== undefined) {
            ctx.font = font("800", px);
            var bp = ctx.measureText(e.pre + " ").width;
            ctx.font = font("800", px * 0.82);
            var bb = Math.max(ctx.measureText(String(e.op)).width, ctx.measureText(String(e.ned)).width);
            b = bp + bb + 12;
        } else {
            b = ctx.measureText(e.tekst).width + 12;
        }
        var h = e.op !== undefined ? px * 2.1 : px + 9;
        ctx.fillStyle = "#ffffff";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.fillStyle = farve;
        ctx.textBaseline = "middle";
        if (e.op !== undefined) {
            ctx.font = font("800", px);
            ctx.textAlign = "left";
            var x0 = x - b / 2 + 6;
            ctx.fillText(e.pre, x0, y + 0.5);
            var bx = x0 + ctx.measureText(e.pre + " ").width;
            ctx.font = font("800", px * 0.82);
            var bw = Math.max(ctx.measureText(String(e.op)).width, ctx.measureText(String(e.ned)).width);
            ctx.textAlign = "center";
            ctx.fillText(String(e.op), bx + bw / 2, y - px * 0.48);
            ctx.fillText(String(e.ned), bx + bw / 2, y + px * 0.55);
            ctx.fillRect(bx - 1, y - 0.6, bw + 2, 1.4);
        } else {
            ctx.textAlign = "center";
            ctx.fillText(e.tekst, x, y + 0.5);
        }
        ctx.restore();
        return b;
    };

    /* Den store reaktionspil paa bordet (fane 1 og 3): en tyk pil med
       teksten over, fx "4 Al ⟶ 2 Al₂O₃". v.lys: pilen lyser. */
    T.reaktionsPil = function (ctx, x0, x1, y, tekst, v) {
        v = v || {};
        var h = NK.klamp((x1 - x0) * 0.1, 10, 18);
        ctx.save();
        ctx.fillStyle = v.lys ? "rgba(242, 197, 61, " + (0.55 + 0.4 * v.lys) + ")" : "rgba(170, 178, 192, 0.35)";
        ctx.beginPath();
        ctx.moveTo(x0, y - h * 0.35);
        ctx.lineTo(x1 - h * 1.2, y - h * 0.35);
        ctx.lineTo(x1 - h * 1.2, y - h);
        ctx.lineTo(x1, y);
        ctx.lineTo(x1 - h * 1.2, y + h);
        ctx.lineTo(x1 - h * 1.2, y + h * 0.35);
        ctx.lineTo(x0, y + h * 0.35);
        ctx.closePath();
        ctx.fill();
        if (tekst) {
            ctx.fillStyle = "#dde3ea";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            NK.passendeSkrift(ctx, tekst, x1 - x0 + 30, NK.klamp((x1 - x0) * 0.1, 12, 16), 11, "700");
            ctx.fillText(tekst, (x0 + x1) / 2, y - h - 4);
        }
        ctx.restore();
    };

    /* En buet, stiplet pil, der viser, hvad der skal ske (hint) */
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

    /* En lille maerkat med tekst, fx "til overs" */
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
        return { b: b, h: h };
    };

    /* ----- Skaalvaegten (som sc4.1) -----------------------------------------------
       lay: { x, y (knivsaeggen), k (fodens skala), L (armens halve laengde
       i px), sk (skaalenes skala) }. vinkel > 0: hoejre side nede.
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

    NK.Tegn = T;
}());

/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, krukken, spatlen, vaegten med vejebaaden,
   literglasset, baegerglasset, flasken, soejlerne og zoomvinduet med
   ionerne.
   Funktionerne tegner én ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger sig.
   Det meste er som i sc6.1; literglasset og soejlerne er nye.
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
    /* Vandet er svagt blaat, saa man kan se, hvor meget der er (runde 3) */
    var VAND = [150, 200, 240];
    T.vaeske = function (st, c) {
        if (!st || !st.opl || !(c > 0)) return "rgba(" + VAND.join(",") + ",0.34)";
        var t = Math.pow(NK.klamp(c / st.cFuld, 0, 1), 0.6);
        var f = rgb(st.opl);
        var m = VAND.map(function (v, i) { return Math.round(v + (f[i] - v) * t); });
        return "rgba(" + m.join(",") + "," + (0.24 + 0.62 * t).toFixed(3) + ")";
    };

    /* ----- Rummet, bordet og tavlen (som sc5.5) ------------------------------------ */
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

    /* Tavlen som et roligt stykke lyst papir (runde 3): ingen genskin og ingen
       bakke til tuscher, saa den ikke ligner noget, eleven skal goere noget ved */
    T.papir = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        NK.rundtRekt(ctx, x + 3, y + 5, b, h, 10);
        ctx.fill();
        ctx.fillStyle = "#fbfaf6";
        NK.rundtRekt(ctx, x, y, b, h, 10);
        ctx.fill();
        ctx.strokeStyle = "#d9d4c6";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
    };

    /* En gul ramme om det, eleven skal klikke paa (som krukken i sc6.1). styrke 0-1 */
    T.ramme = function (ctx, x, y, b, h, styrke) {
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * (styrke || 0)) + ")";
        ctx.lineWidth = 3;
        NK.rundtRekt(ctx, x, y, b, h, 12);
        ctx.stroke();
        ctx.restore();
    };

    /* En gul boble over det, eleven skal klikke paa, med en spids nedad (som
       skiltet i sc6.1, T.skilt). Giver boblens rektangel. */
    T.boble = function (ctx, tekst, x, y, W, tid) {
        var hop = Math.sin((tid || 0) * 4.5) * 3;
        ctx.save();
        ctx.font = font("700", 15);
        var b = Math.ceil(ctx.measureText(tekst).width) + 24, h = 30, sp = 10;
        var rx = NK.klamp(x - b / 2, 6, Math.max(6, W - b - 6)), ry = Math.max(4, y - sp - h + hop);
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#ffdf6b";
        ctx.beginPath();
        var px = NK.klamp(x, rx + 14, rx + b - 14);
        ctx.moveTo(px, ry + h + sp);
        ctx.lineTo(px - 8, ry + h - 1);
        ctx.lineTo(px + 8, ry + h - 1);
        ctx.closePath();
        ctx.fill();
        NK.rundtRekt(ctx, rx, ry, b, h, 8);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.fillStyle = "#33290a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, rx + b / 2, ry + h / 2 + 1);
        ctx.restore();
        return { x: rx, y: ry, b: b, h: h + sp };
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

    /* ----- Krukken med stoffet (som sc5.5) --------------------------------------------
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

    /* ----- Vaegten og pulveret i vejebaaden paa fane 3 (som sc6.1) ------------------- */
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
            if (linjer.length > 2) {
                /* Tre linjer: formlen, massen og rumfanget, koncentrationen */
                [0.24, 0.53, 0.8].forEach(function (yf, i) {
                    ctx.fillStyle = i === 2 ? "#1d6fb8" : "#1c1f26";
                    NK.passendeSkrift(ctx, linjer[i], ew - 6, NK.klamp(eh * (i === 1 ? 0.22 : 0.27), 12, 17), 10, i === 1 ? "600" : "700");
                    ctx.fillText(linjer[i], ex + ew / 2, ey + eh * yf);
                });
                linjer = [];
            }
            if (linjer[0]) {
                NK.passendeSkrift(ctx, linjer[0], ew - 6, NK.klamp(eh * 0.34, 12, 18), 10, "700");
                ctx.fillText(linjer[0], ex + ew / 2, ey + eh * 0.32);
            }
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
            } else if (so.skjult) {
                NK.tekst(ctx, "?", cx, bund - px - 4, { font: font("700", px + 6), justering: "center", linje: "middle", farve: "#f5dd8a" });
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

    /* ----- Luppen med ionerne (runde 3, 21. nov. 2026) ---------------------------------
       Brugeren: "Mikrofiguren skal ikke indeholde legender, men være så stor at
       legenderne ligger inde i ionerne." Som sc2.1 og sc6.3: hver ion er en
       blank kugle med sin formel inde i (Na⁺, Cl⁻, SO₄²⁻ ...), mindst 14 px
       skrift, og en sammensat ion er én kugle. Kuglerne skubber til hinanden,
       saa formlerne kan laeses. Luppen viser altid lige meget vaeske, saa antallet
       foelger koncentrationen (T.kugler); skalaen vaelges pr. opgave, saa der
       hoejst er ca. 20 kugler (T.skala). */
    function Partikler(froeTal) {
        this.p = [];
        this.r = froe(froeTal || 1);
        this.radier = [];
    }
    /* En plads, der ligger fri af de andre kugler (proever nogle gange) */
    Partikler.prototype.fri = function (rad) {
        var bedst = null, bedstAfst = -1, mig = this;
        for (var f = 0; f < 24; f++) {
            var a = this.r() * Math.PI * 2, rr = Math.sqrt(this.r()) * Math.max(0.1, 0.94 - rad);
            var x = Math.cos(a) * rr, y = Math.sin(a) * rr, min = 9;
            this.p.forEach(function (q) {
                if (q.doer) return;
                var d = Math.hypot(q.x - x, q.y - y) - (mig.radier[q.type] || 0.12) - rad;
                if (d < min) min = d;
            });
            if (min > bedstAfst) { bedstAfst = min; bedst = { x: x, y: y }; }
            if (min > 0.02) break;
        }
        return bedst;
    };
    Partikler.prototype.saet = function (antal, typer) {
        var mig = this;
        typer = typer || antal.length;
        for (var t = 0; t < typer; t++) {
            var levende = this.p.filter(function (q) { return q.type === t && !q.doer; });
            var mangler = (antal[t] || 0) - levende.length;
            for (var i = 0; i < mangler; i++) {
                var pl = this.fri(this.radier[t] || 0.12);
                this.p.push({ type: t, x: pl.x, y: pl.y, vx: (this.r() - 0.5) * 0.12, vy: (this.r() - 0.5) * 0.12, a: 0, doer: false });
            }
            for (i = 0; i < -mangler; i++) levende[levende.length - 1 - i].doer = true;
        }
        this.p = this.p.filter(function (q) { return !(q.doer && q.a <= 0); });
        return mig;
    };
    Partikler.prototype.opdater = function (dt) {
        var r = this.r, rad = this.radier, liste = this.p;
        liste.forEach(function (q) {
            q.vx += (r() - 0.5) * 0.5 * dt;
            q.vy += (r() - 0.5) * 0.5 * dt;
            var v = Math.sqrt(q.vx * q.vx + q.vy * q.vy), maks = 0.09;
            if (v > maks) { q.vx *= maks / v; q.vy *= maks / v; }
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.a = NK.klamp(q.a + (q.doer ? -dt * 2.5 : dt * 2), 0, 1);
        });
        /* Kuglerne skubber til hinanden og bliver inde i luppen */
        for (var g = 0; g < 2; g++) {
            for (var i = 0; i < liste.length; i++) {
                var a = liste[i], ra = rad[a.type] || 0.12;
                for (var j = i + 1; j < liste.length; j++) {
                    var b = liste[j], rb = rad[b.type] || 0.12;
                    var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 0.001, min = ra + rb + 0.015;
                    if (d < min) {
                        var s = (min - d) / 2, nx = dx / d, ny = dy / d;
                        a.x -= nx * s; a.y -= ny * s; b.x += nx * s; b.y += ny * s;
                        var rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                        if (rel < 0) { a.vx += rel * nx * 0.5; a.vy += rel * ny * 0.5; b.vx -= rel * nx * 0.5; b.vy -= rel * ny * 0.5; }
                    }
                }
                var d0 = Math.sqrt(a.x * a.x + a.y * a.y), kant = 0.96 - ra;
                if (d0 > kant) {
                    var mx = a.x / d0, my = a.y / d0, dot = a.vx * mx + a.vy * my;
                    if (dot > 0) { a.vx -= 2 * dot * mx; a.vy -= 2 * dot * my; }
                    a.x = mx * kant; a.y = my * kant;
                }
            }
        }
        this.p = this.p.filter(function (q) { return !(q.doer && q.a <= 0); });
    };
    Partikler.prototype.antal = function (t) {
        return this.p.filter(function (q) { return q.type === t && !q.doer; }).length;
    };
    NK.Partikler = Partikler;

    /* Antallet af kugler af én ion ved koncentrationen c med skala M pr. kugle
       (mindst én, naar ionen er der, hoejst 14) */
    T.kugler = function (c, skala) {
        var n = Math.round(c / (skala || NK.Data.PRIK));
        if (c > 0.001 && n < 1) n = 1;
        return NK.klamp(n, 0, 14);
    };
    T.prikker = function (c) { return T.kugler(c, NK.Data.PRIK); };
    /* Skalaen til en opgave: samlet er ionernes koncentrationer lagt sammen. Den
       mindste skala (0,05, 0,10 eller 0,20 M pr. kugle), hvor der hoejst er 20
       kugler, og hvor kuglerne kan vaere i en lup med radius R */
    T.skala = function (samlet, R) {
        var rk = NK.klamp(R * 0.105, PX_KUGLE, 17) * 1.45;
        var maks = Math.min(20, Math.floor(0.4 * R * R / (rk * rk)));
        var liste = [0.05, 0.1, 0.2, 0.4];
        for (var i = 0; i < liste.length; i++) if (samlet / liste[i] <= Math.max(4, maks) + 0.5) return liste[i];
        return 0.4;
    };

    /* En kugle med formlen inde i. Radius efter formlen (mindst 14 px skrift) og
       ionens stoerrelse (Cl⁻ stoerre end Na⁺, som sc2.1) */
    var PX_KUGLE = 14;
    /* px: skriften i kuglen (mindst 14, stoerre i en stor lup) */
    T.kugleRadius = function (ctx, ion, px) {
        px = px || PX_KUGLE;
        ctx.save();
        ctx.font = font("700", px);
        var b = ctx.measureText(ion.t).width;
        ctx.restore();
        return Math.max(b / 2 + px * 0.36, ion.r * 2.3 * px / 14, px * 1.08);
    };
    T.kugle = function (ctx, x, y, rr, ion, alfa, px) {
        px = px || PX_KUGLE;
        ctx.save();
        ctx.globalAlpha = NK.klamp(alfa === undefined ? 1 : alfa, 0, 1);
        var g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.4, rr * 0.1, x, y, rr);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.28, nuance(ion.farve, 0.12));
        g.addColorStop(1, nuance(ion.farve, -0.38));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = font("700", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var lyst = lys(ion.farve);
        if (!lyst) {
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.strokeText(ion.t, x, y + 1);
        }
        ctx.fillStyle = lyst ? "#0e141c" : "#ffffff";
        ctx.fillText(ion.t, x, y + 1);
        ctx.restore();
    };

    /* v: { part, st (st.ioner), farve (vaesken), titel (over luppen), tekst
       (stort, midt i en tom lup), lys }. Ingen legende under luppen. */
    T.zoom = function (ctx, cx, cy, r, v) {
        var st = v.st;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + 4, cy + 6, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        var bg = ctx.createRadialGradient(cx, cy - r * 0.3, r * 0.1, cx, cy, r);
        bg.addColorStop(0, "#23303f");
        bg.addColorStop(1, "#141b25");
        ctx.fillStyle = bg;
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        if (v.farve) {
            ctx.fillStyle = v.farve;
            ctx.globalAlpha = 0.45;
            ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
            ctx.globalAlpha = 1;
        }
        var px = NK.klamp(r * 0.105, PX_KUGLE, 17);
        var radier = st.ioner.map(function (ion) { return T.kugleRadius(ctx, ion, px); });
        v.part.radier = radier.map(function (x) { return x / r; });
        v.part.p.forEach(function (q) {
            T.kugle(ctx, cx + q.x * r, cy + q.y * r, radier[q.type], st.ioner[q.type], q.a, px);
        });
        if (v.tekst) NK.tekst(ctx, v.tekst, cx, cy, { font: font("700", NK.klamp(r * 0.32, 22, 44)), justering: "center", linje: "middle",
            farve: "rgba(245, 221, 138, 0.75)" });
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.9)" : "#c9d3de";
        ctx.lineWidth = Math.max(5, r * 0.05);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 14, { font: font("700", 15), justering: "center", linje: "middle", farve: "#dfe6ee" });
        ctx.restore();
    };

    /* Keglen fra et felt i vaesken hen til luppen (som sc6.3), saa man ser,
       hvilket glas luppen kigger i */
    T.zoomKegle = function (ctx, px, py, cx, cy, R) {
        var dx = cx - px, dy = cy - py, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var a = Math.atan2(dy, dx);
        if (d < R + 4) return;
        ctx.save();
        var g = ctx.createLinearGradient(px, py, cx, cy);
        g.addColorStop(0, "rgba(242, 197, 61, 0.26)");
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
        ctx.lineWidth = 1.4;
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
        ctx.strokeRect(px - 4.5, py - 4.5, 9, 9);
        ctx.restore();
    };

    /* ----- Etiketten paa et glas (som sc7.5, men stoerre) ------------------------------
       Et lyst stykke papir med store, sorte bogstaver. e: { stor (et stort
       bogstav til venstre, fx "A"), linjer: [{ t, px, vaegt }] }. (cx, y): midten
       foroven. maxB: den stoerste bredde. Giver sedlens rektangel. */
    T.etiket = function (ctx, cx, y, e, maxB) {
        ctx.save();
        var b = 0, lh = [], storB = 0, storPx = 0;
        e.linjer.forEach(function (l) {
            ctx.font = font(l.vaegt || "700", l.px);
            b = Math.max(b, ctx.measureText(l.t).width);
            lh.push(l.px * 1.2);
        });
        var tekstH = lh.reduce(function (s, x) { return s + x; }, 0);
        if (e.stor) {
            storPx = Math.max(24, tekstH * 0.95);
            ctx.font = font("800", storPx);
            storB = ctx.measureText(e.stor).width + 9;
        }
        var fuld = storB + b + 16;
        var skala = maxB && fuld > maxB ? Math.max(0.7, maxB / fuld) : 1;
        var h = Math.max(tekstH, e.stor ? storPx * 1.05 : 0) * skala + 8, sb = fuld * skala;
        var x0 = cx - sb / 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        NK.rundtRekt(ctx, x0 + 2, y + 3, sb, h, 5);
        ctx.fill();
        ctx.fillStyle = "#fbfaf6";
        NK.rundtRekt(ctx, x0, y, sb, h, 5);
        ctx.fill();
        ctx.strokeStyle = "#a79e88";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#14181f";
        if (e.stor) {
            ctx.textAlign = "left";
            ctx.font = font("800", storPx * skala);
            ctx.fillText(e.stor, x0 + 8 * skala, y + h / 2 + 1);
        }
        ctx.textAlign = "center";
        var tx = x0 + (storB + 8) * skala + b * skala / 2, yy = y + (h - tekstH * skala) / 2;
        e.linjer.forEach(function (l, i) {
            ctx.font = font(l.vaegt || "700", l.px * skala);
            ctx.fillStyle = l.farve || "#14181f";
            ctx.fillText(l.t, tx, yy + lh[i] * skala / 2 + 0.5);
            yy += lh[i] * skala;
        });
        ctx.restore();
        return { x: x0, y: y, b: sb, h: h };
    };

    /* ----- Det tydelige baegerglas (runde 3): tykt glas, svagt farvet vaeske og
       store skalastreger. Samme maal som spriten (glasGeo), saa haeldningen og
       rumfanget passer. etiket: linjerne til sedlen oeverst paa glasset. */
    T.glasTydelig = function (ctx, g, VmL, farve, etiket, gammelV) {
        var M = MAAL.baegerglas, k = g.k, ind = g.ind;
        ctx.save();
        /* Glassets krop */
        var kropG = ctx.createLinearGradient(ind.x0, 0, ind.x1, 0);
        kropG.addColorStop(0, "rgba(212, 235, 250, 0.22)");
        kropG.addColorStop(0.18, "rgba(212, 235, 250, 0.06)");
        kropG.addColorStop(0.82, "rgba(212, 235, 250, 0.05)");
        kropG.addColorStop(1, "rgba(212, 235, 250, 0.18)");
        NK.rundtRekt(ctx, ind.x0, ind.top, ind.x1 - ind.x0, ind.bund - ind.top, M.indR * k);
        ctx.fillStyle = kropG;
        ctx.fill();
        /* Vaesken */
        if (VmL > 0.5) {
            ctx.save();
            NK.rundtRekt(ctx, ind.x0, ind.top, ind.x1 - ind.x0, ind.bund - ind.top, M.indR * k);
            ctx.clip();
            var ly = g.ymL(VmL);
            ctx.fillStyle = farve;
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, ind.bund - ly + 2);
            ctx.fillStyle = "rgba(220, 240, 255, 0.75)";
            ctx.fillRect(ind.x0, ly, ind.x1 - ind.x0, Math.max(2, 2.2 * k));
            ctx.restore();
        }
        /* Skalastregerne med tal: 100, 200 og 300 mL paa blandingsglasset (en kort
           seddel), 100 og 200 mL under en seddel med to linjer (glas A og B) */
        var maks = etiket && (etiket.stor || etiket.linjer.length > 1) ? 300 : 400;
        var px = Math.max(13, 13 * k);
        ctx.strokeStyle = "rgba(240, 248, 255, 0.9)";
        ctx.lineCap = "round";
        [50, 100, 150, 200, 250, 300, 350, 400].forEach(function (V) {
            var y = g.ymL(V), stor = V % 100 === 0;
            ctx.lineWidth = stor ? Math.max(2, 2 * k) : Math.max(1.2, 1.2 * k);
            ctx.beginPath();
            ctx.moveTo(ind.x0 + 2, y);
            ctx.lineTo(ind.x0 + (stor ? 26 : 14) * k, y);
            ctx.stroke();
            if (stor && V < maks) NK.tekst(ctx, V + (V === maks - 100 ? " mL" : ""), ind.x0 + 30 * k, y, { font: font("700", px), linje: "middle",
                farve: "#f4f9fd", kant: true, kantFarve: "rgba(10, 14, 20, 0.55)", kantBredde: 3 });
        });
        /* Det gamle niveau i et glas, der er haeldt over: en stiplet linje med
           rumfanget, saa eleven kan se, hvor meget der var (runde 5) */
        if (gammelV > 0) {
            var gy = g.ymL(gammelV);
            ctx.save();
            ctx.strokeStyle = "rgba(245, 221, 138, 0.95)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.beginPath();
            ctx.moveTo(ind.x0 + 4, gy);
            ctx.lineTo(ind.x1 - 4, gy);
            ctx.stroke();
            ctx.setLineDash([]);
            NK.tekst(ctx, NK.betydende(gammelV, 3) + " mL", ind.x1 - 6 * k, gy - 9, { font: font("700", Math.max(13.5, 13 * k)), justering: "right",
                linje: "middle", farve: "#f5dd8a", kant: true, kantFarve: "rgba(10, 14, 20, 0.75)", kantBredde: 3 });
            ctx.restore();
        }
        /* Det tykke glas med tuden */
        ctx.strokeStyle = "rgba(225, 238, 248, 0.95)";
        ctx.lineWidth = Math.max(3, 3.4 * k);
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(g.x0 + 10 * k, g.y0 + 10 * k);
        ctx.quadraticCurveTo(g.x0 + 18 * k, g.y0 + 10 * k, g.x0 + 18 * k, g.y0 + 18 * k);
        ctx.lineTo(g.x0 + 18 * k, g.y0 + 180 * k);
        ctx.quadraticCurveTo(g.x0 + 18 * k, g.y0 + 188 * k, g.x0 + 26 * k, g.y0 + 188 * k);
        ctx.lineTo(g.x0 + 134 * k, g.y0 + 188 * k);
        ctx.quadraticCurveTo(g.x0 + 142 * k, g.y0 + 188 * k, g.x0 + 142 * k, g.y0 + 180 * k);
        ctx.lineTo(g.x0 + 142 * k, g.y0 + 16 * k);
        ctx.quadraticCurveTo(g.x0 + 142 * k, g.y0 + 12 * k, g.x0 + 146 * k, g.y0 + 11 * k);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        NK.rundtRekt(ctx, g.x0 + 128 * k, g.y0 + 26 * k, 4 * k, 150 * k, 2 * k);
        ctx.fill();
        ctx.restore();
        if (etiket) {
            var midt = (ind.x0 + ind.x1) / 2 + 8 * k;
            /* Sedlen maa gerne vaere lidt bredere end glasset, saa skriften kan laeses */
            g.etiket = T.etiket(ctx, midt, ind.top + 4 * k, etiket, Math.max((ind.x1 - ind.x0) - 10 * k, 118));
        }
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

    /* En stiplet plads til det, der dukker op, naar eleven har svaret (som
       sb2.6, 21. nov. 2026). lys: paa den lyse tavle. rund: en cirkel med
       midten (x, y) og radius b (luppens plads). */
    T.plads = function (ctx, x, y, b, h, tekst, lys, rund) {
        ctx.save();
        if (rund) {
            ctx.beginPath();
            ctx.arc(x, y, b, 0, Math.PI * 2);
        } else {
            NK.rundtRekt(ctx, x, y, b, h, 10);
        }
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = lys ? "rgba(31, 37, 48, 0.3)" : "rgba(160, 170, 185, 0.45)";
        ctx.stroke();
        ctx.setLineDash([]);
        NK.tekst(ctx, tekst, rund ? x : x + b / 2, rund ? y : y + h / 2, { font: font("600", 14), justering: "center", linje: "middle",
            farve: lys ? "rgba(31, 37, 48, 0.5)" : "rgba(160, 170, 185, 0.75)" });
        ctx.restore();
    };

    NK.Tegn = T;
}());

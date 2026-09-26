/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, krukken, vaegten og vejebaaden (som sc4.5
   og sc5.1), poserne med 1 mol (som sc4.5), magnetbrikkerne og
   pladserne paa tavlen, broekstregen, trekanten, linjen med enhederne,
   der gaar ud med hinanden, og muldvarpen. Funktionerne tegner én ting
   et bestemt sted og husker intet selv; fanerne bestemmer, hvor tingene
   staar, og hvordan de bevaeger sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var MATTE = "Cambria, 'Cambria Math', 'Times New Roman', serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;
    /* Bogstaverne i formlerne: kursiv som i bogen, saa m og M ikke ligner hinanden */
    T.matte = function (px, vaegt) { return "italic " + (vaegt || "600") + " " + px + "px " + MATTE; };

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

    /* En lille overskrift i smaa versaler */
    T.etiket = function (ctx, tekst, x, y, px, farve, just) {
        NK.tekst(ctx, tekst.toUpperCase(), x, y, { font: font("700", px), linje: "middle", farve: farve || "#6a7280", justering: just || "left" });
    };

    /* ----- Krukken med stoffet (som sc4.5) --------------------------------------------
       (x, y): midten af bunden, h: hoejden. v.linje3 er den nederste linje
       paa etiketten (standard: molarmassen). v.ukendt: etiketten er vaek.
       v.lys: musen er over den. */
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
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (v.ukendt) {
            /* Resterne af en etiket, der er revet af, og et spoergsmaalstegn */
            ctx.fillStyle = "rgba(251, 251, 247, 0.55)";
            ctx.beginPath();
            ctx.moveTo(e.x, e.y + e.h * 0.55);
            ctx.lineTo(e.x + e.b * 0.18, e.y + e.h * 0.45);
            ctx.lineTo(e.x + e.b * 0.3, e.y + e.h * 0.7);
            ctx.lineTo(e.x + e.b * 0.12, e.y + e.h);
            ctx.lineTo(e.x, e.y + e.h);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#2a2f36";
            ctx.font = font("800", NK.klamp(e.h * 0.6, 14, 34));
            ctx.fillText("?", e.x + e.b / 2, e.y + e.h * 0.5);
            ctx.restore();
            return { x: x0, y: y0, b: b, h: h, etiket: e };
        }
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
        /* Kun formlen og molarmassen: navnet staar i opgaven, og et langt
           navn som natriumhydrogencarbonat ville blive for smaat */
        ctx.fillStyle = "#1c1f26";
        var ib2 = e.b * 0.92, t0 = e.y + Math.max(3, e.h * 0.1);
        var rest = e.h - (t0 - e.y);
        NK.passendeSkrift(ctx, st.formel, ib2, NK.klamp(rest * 0.4, 12, 32), 11, "700");
        ctx.fillText(st.formel, e.x + e.b / 2, t0 + rest * 0.33);
        var l3 = v.linje3 !== undefined ? v.linje3 : NK.komma(st.M) + " g/mol";
        if (l3) {
            NK.passendeSkrift(ctx, l3, ib2, NK.klamp(rest * 0.3, 12, 19), 11, "700");
            ctx.fillStyle = v.linje3Farve || "#1d7a48";
            ctx.fillText(l3, e.x + e.b / 2, t0 + rest * 0.76);
        }
        ctx.restore();
        return { x: x0, y: y0, b: b, h: h, etiket: e };
    };

    /* ----- Vaegten og pulveret i vejebaaden (som sc4.5) ------------------------------ */
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
        var tt = Math.sqrt(NK.klamp(t, 0, 1.6));
        var hh = hoejde * tt;
        var ix0 = x0 + (M.indV + 4) * k, ix1 = x0 + (M.indH - 4) * k;
        var bredde = (ix1 - ix0) * NK.klamp(0.45 + 0.55 * tt, 0, 1.1);
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

    /* En lille bunke pulver paa vej fra krukken */
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

    /* ----- Posen med 1 mol (som sc4.5) ----------------------------------------------------
       En saek set forfra med snoren om halsen. (x, y): midten af bunden.
       s: hoejden af en hel pose i px. v.andel: 0,5 er en halv pose (mindre,
       med "0,5 mol" paa). v.etiket: en anden tekst end "1 mol". v.alfa,
       v.stiplet (kun omridset: en pose, der mangler), v.roed (elevens tal),
       v.lys (gul ring). Hvidt pulver kommer i en brun papirpose. */
    var PAPIR = "#e6d6b8";
    T.pose = function (ctx, x, y, s, st, v) {
        v = v || {};
        var andel = v.andel === undefined ? 1 : v.andel;
        var h = s * (andel >= 1 ? 1 : 0.62 + 0.38 * andel), b = h * 0.86;
        if (h < 2) return null;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        ctx.translate(x, y);
        var farve = lys(st.pulver) ? PAPIR : st.pulver;
        var kant = v.roed ? "#d0584a" : nuance(farve, -0.45);
        var hals = -h * 0.8, top = -h;
        function krop() {
            ctx.beginPath();
            ctx.moveTo(-b * 0.2, hals);
            ctx.bezierCurveTo(-b * 0.62, hals + h * 0.12, -b * 0.56, -h * 0.05, -b * 0.4, 0);
            ctx.lineTo(b * 0.4, 0);
            ctx.bezierCurveTo(b * 0.56, -h * 0.05, b * 0.62, hals + h * 0.12, b * 0.2, hals);
            ctx.lineTo(b * 0.18, hals);
            ctx.quadraticCurveTo(b * 0.3, top + h * 0.02, b * 0.08, top);
            ctx.lineTo(-b * 0.08, top);
            ctx.quadraticCurveTo(-b * 0.3, top + h * 0.02, -b * 0.18, hals);
            ctx.closePath();
        }
        if (v.stiplet) {
            krop();
            ctx.fillStyle = v.roed ? "rgba(224, 84, 70, 0.12)" : "rgba(255, 255, 255, 0.04)";
            ctx.fill();
            ctx.setLineDash([5, 4]);
            ctx.strokeStyle = v.roed ? "rgba(240, 145, 138, 0.9)" : "rgba(223, 230, 238, 0.45)";
            ctx.lineWidth = 1.6;
            ctx.stroke();
            ctx.setLineDash([]);
            if (v.etiket) {
                ctx.fillStyle = v.roed ? "#f0918a" : "rgba(223, 230, 238, 0.7)";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                NK.passendeSkrift(ctx, v.etiket, b * 0.95, NK.klamp(h * 0.24, 11, 15), 9, "700");
                ctx.fillText(v.etiket, 0, -h * 0.4);
            }
            ctx.restore();
            return { x: x - b / 2, y: y - h, b: b, h: h };
        }
        /* Skyggen paa bordet */
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(0, -1, b * 0.46, Math.max(1.5, h * 0.05), 0, 0, Math.PI * 2);
        ctx.fill();
        krop();
        var g = ctx.createLinearGradient(-b / 2, 0, b / 2, 0);
        g.addColorStop(0, nuance(farve, -0.18));
        g.addColorStop(0.4, nuance(farve, 0.12));
        g.addColorStop(1, nuance(farve, -0.25));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = kant;
        ctx.lineWidth = Math.max(1, h * (v.roed ? 0.05 : 0.03));
        ctx.stroke();
        /* Snoren */
        ctx.strokeStyle = "#b8862e";
        ctx.lineWidth = Math.max(1.4, h * 0.05);
        ctx.beginPath();
        ctx.moveTo(-b * 0.21, hals + 1);
        ctx.lineTo(b * 0.21, hals + 1);
        ctx.stroke();
        /* Formlen og maengden */
        var moerk = lys(farve);
        ctx.fillStyle = moerk ? "#1c1f26" : "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var fpx = NK.passendeSkrift(ctx, st.formel, b * 0.8, NK.klamp(h * 0.26, 10, 18), 8, "800");
        ctx.fillText(st.formel, 0, -h * 0.5);
        var mt = v.etiket !== undefined ? v.etiket : (andel >= 1 ? "1 mol" : T.brokTal(andel) + " mol");
        if (h >= 30 && mt) {
            NK.passendeSkrift(ctx, mt, b * 0.92, NK.klamp(fpx * 0.8, 11, 14), 9, "700");
            ctx.fillStyle = moerk ? "#3a4150" : "rgba(255, 255, 255, 0.85)";
            ctx.fillText(mt, 0, -h * 0.24);
        }
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.5 + 0.5 * NK.klamp(v.lys, 0, 1)) + ")";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.ellipse(0, -h * 0.5, b * 0.68, h * 0.64, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        return { x: x - b / 2, y: y - h, b: b, h: h };
    };

    /* 0,25 -> "0,25", 0,5 -> "0,5", 0,05 -> "0,05" */
    T.brokTal = function (v) {
        return NK.betydende(v, 2).replace(/(,\d*?)0+$/, "$1").replace(/,$/, "");
    };

    /* Poser paa raekke: pladserne for n mol, hoejst pr pr. raekke. Giver
       [{ x, y, andel }] med (x, y) som bunden af hver pose. */
    T.posePladser = function (n, cx, bund, s, pr) {
        /* En masse med to decimaler giver fx 1,50021 mol: det er halvanden pose */
        var r = Math.round(n * 100) / 100;
        if (Math.abs(r - n) < 0.003) n = r;
        var hele = Math.floor(n + 1e-9), rest = n - hele;
        var liste = [];
        for (var i = 0; i < hele; i++) liste.push(1);
        if (rest > 0.004) liste.push(rest);
        pr = pr || 4;
        var afst = s * 0.96, raekker = Math.ceil(liste.length / pr);
        return liste.map(function (andel, i) {
            var rk = Math.floor(i / pr), c = i % pr;
            var iRaekke = Math.min(pr, liste.length - rk * pr);
            return { x: cx + (c - (iRaekke - 1) / 2) * afst, y: bund - (raekker - 1 - rk) * s * 0.78, andel: andel };
        });
    };

    /* ----- Magnetbrikkerne ---------------------------------------------------------
       b: { x, y, b, h, tekst, slags }. v: { over, valgt, roed (0-1),
       groen (0-1), laast, alfa, loeft (0-1, mens den holdes) }. */
    var BRIKFARVE = {
        sym: { bund: "#e9f1fb", kant: "#2f7ad1", tekst: "#15385f" },
        navn: { bund: "#e8f5ec", kant: "#2b7d51", tekst: "#16402a" },
        enhed: { bund: "#fdf0df", kant: "#c77a1c", tekst: "#5a3608" },
        op: { bund: "#eceef2", kant: "#5b6472", tekst: "#1f2530" },
        /* Hurtigrunden: svarene og startknappen */
        svar: { bund: "#f3f6fb", kant: "#4a6fa5", tekst: "#1f2a3a" },
        sym_svar: { bund: "#f3f6fb", kant: "#4a6fa5", tekst: "#1f2a3a" },
        sym_start: { bund: "#2a76ac", kant: "#3d9ee0", tekst: "#ffffff" }
    };
    T.BRIKFARVE = BRIKFARVE;

    /* Skriften paa en brik; passer den ikke i bredden b, bliver den mindre */
    T.brikSkrift = function (ctx, slags, h, tekst, b) {
        if (slags === "sym") { ctx.font = T.matte(Math.round(h * 0.62), "600"); return; }
        if (slags === "op") { ctx.font = font("700", Math.round(h * 0.6)); return; }
        if (slags === "sym_svar") {
            var px = Math.round(h * 0.46);
            ctx.font = T.matte(px);
            while (px > 13 && ctx.measureText(tekst).width > b - 14) { px -= 1; ctx.font = T.matte(px); }
            return;
        }
        var stoerst = slags === "navn" || slags === "enhed" ? NK.klamp(h * 0.4, 12, 22) : NK.klamp(h * 0.36, 14, 26);
        NK.passendeSkrift(ctx, tekst, b - 10, stoerst, 11, "700");
    };

    T.brik = function (ctx, b, v) {
        v = v || {};
        var f = BRIKFARVE[b.slags] || BRIKFARVE.op;
        var l = v.loeft || 0;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= v.alfa;
        var x = b.x, y = b.y - l * 3;
        ctx.fillStyle = "rgba(0, 0, 0, " + (0.22 + 0.18 * l) + ")";
        NK.rundtRekt(ctx, x + 2 + l * 3, y + 3 + l * 5, b.b, b.h, 7);
        ctx.fill();
        ctx.fillStyle = f.bund;
        NK.rundtRekt(ctx, x, y, b.b, b.h, 7);
        ctx.fill();
        if (v.roed) {
            ctx.fillStyle = "rgba(224, 84, 70, " + (0.35 * v.roed) + ")";
            ctx.fill();
        }
        if (v.groen) {
            ctx.fillStyle = "rgba(63, 174, 114, " + (0.3 * v.groen) + ")";
            ctx.fill();
        }
        ctx.lineWidth = v.valgt || v.over ? 2.5 : 1.5;
        ctx.strokeStyle = v.roed > 0.3 ? "#c0392b" : (v.valgt ? "#e0a82e" : (v.laast ? "rgba(43, 125, 81, 0.9)" : f.kant));
        ctx.stroke();
        /* Magnetens farvede kant foroven */
        ctx.save();
        NK.rundtRekt(ctx, x, y, b.b, b.h, 7);
        ctx.clip();
        ctx.fillStyle = f.kant;
        ctx.fillRect(x, y, b.b, Math.max(3, b.h * 0.08));
        ctx.restore();
        ctx.fillStyle = f.tekst;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        T.brikSkrift(ctx, b.slags, b.h, b.tekst, b.b);
        ctx.fillText(b.tekst, x + b.b / 2, y + b.h / 2 + (b.slags === "sym" || b.slags === "sym_svar" ? 1 : 2));
        if (v.valgt) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            NK.rundtRekt(ctx, x - 4, y - 4, b.b + 8, b.h + 8, 9);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    };

    /* En plads paa tavlen: stiplet ramme. v: { skygge (bleg tekst),
       slags, lys (en brik holdes over den), aaben (den kan udfyldes),
       tekst (fast tekst, naar pladsen ikke er aaben) } */
    T.plads = function (ctx, p, v) {
        v = v || {};
        ctx.save();
        if (v.tekst) {
            var f0 = BRIKFARVE[p.slags] || BRIKFARVE.op;
            ctx.fillStyle = f0.tekst;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = p.slags === "sym" ? T.matte(Math.round(p.h * 0.62)) : font("600", Math.round(NK.klamp(p.h * 0.4, 12, 22)));
            if (p.slags !== "sym" && p.slags !== "op") NK.passendeSkrift(ctx, v.tekst, p.b - 8, NK.klamp(p.h * 0.4, 12, 22), 11, "600");
            ctx.fillStyle = "#2a2f36";
            ctx.fillText(v.tekst, p.x + p.b / 2, p.y + p.h / 2 + 1);
            ctx.restore();
            return;
        }
        var l = typeof v.lys === "number" ? v.lys : (v.lys ? 1 : 0);
        ctx.fillStyle = l ? "rgba(242, 197, 61, " + (0.08 + 0.16 * l) + ")" : "rgba(40, 60, 90, 0.05)";
        NK.rundtRekt(ctx, p.x, p.y, p.b, p.h, 7);
        ctx.fill();
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = l > 0.7 ? 2.5 : 1.8;
        ctx.strokeStyle = l ? "rgba(214, 160, 20, " + (0.5 + 0.45 * l) + ")" : "rgba(90, 100, 118, 0.55)";
        ctx.stroke();
        ctx.setLineDash([]);
        if (v.skygge) {
            ctx.fillStyle = "rgba(47, 122, 209, 0.22)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = p.slags === "sym" ? T.matte(Math.round(p.h * 0.62)) : font("600", Math.round(NK.klamp(p.h * 0.4, 12, 22)));
            ctx.fillText(v.skygge, p.x + p.b / 2, p.y + p.h / 2 + 1);
        }
        ctx.restore();
    };

    /* Et regnetegn eller lighedstegn tegnet paa tavlen */
    T.tegnPaaTavle = function (ctx, tekst, x, y, px, farve) {
        NK.tekst(ctx, tekst, x, y, { font: font("600", px), justering: "center", linje: "middle", farve: farve || "#2a2f36" });
    };

    /* ----- Trekanten (det andet hint, naar formlen skal vendes) ------------------------
       (x, y): oeverste venstre hjoerne af kortet, s: bredden. maal: det
       bogstav, der dækkes over. Giver hoejden. */
    T.trekantHoejde = function (s) { return s * 0.92; };

    T.trekant = function (ctx, x, y, s, maal, alfa) {
        var h = s * 0.92;
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        NK.rundtRekt(ctx, x + 3, y + 4, s, h, 10);
        ctx.fill();
        ctx.fillStyle = "#fffdf4";
        NK.rundtRekt(ctx, x, y, s, h, 10);
        ctx.fill();
        ctx.strokeStyle = "#d6c9a0";
        ctx.lineWidth = 1;
        ctx.stroke();
        var p = s * 0.1;
        var A = { x: x + s / 2, y: y + p }, B = { x: x + p, y: y + h - p }, C = { x: x + s - p, y: y + h - p };
        var midY = (A.y + B.y) / 2;
        var xl = NK.lerp(A.x, B.x, 0.5), xr = NK.lerp(A.x, C.x, 0.5);
        /* Feltet, der er daekket over */
        function felt(navn) {
            ctx.beginPath();
            if (navn === "m") { ctx.moveTo(A.x, A.y); ctx.lineTo(xl, midY); ctx.lineTo(xr, midY); }
            if (navn === "n") { ctx.moveTo(xl, midY); ctx.lineTo(A.x, midY); ctx.lineTo(A.x, B.y); ctx.lineTo(B.x, B.y); }
            if (navn === "M") { ctx.moveTo(A.x, midY); ctx.lineTo(xr, midY); ctx.lineTo(C.x, C.y); ctx.lineTo(A.x, C.y); }
            ctx.closePath();
        }
        if (maal) {
            felt(maal);
            ctx.fillStyle = "rgba(242, 197, 61, 0.75)";
            ctx.fill();
        }
        ctx.strokeStyle = "#2f7ad1";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.lineTo(C.x, C.y); ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xl, midY); ctx.lineTo(xr, midY);
        ctx.moveTo(A.x, midY); ctx.lineTo(A.x, B.y);
        ctx.stroke();
        var px = Math.round(s * 0.2);
        var mf = T.matte(px, "700");
        function bogstav(t, bx, by) {
            NK.tekst(ctx, t, bx, by, { font: mf, justering: "center", linje: "middle", farve: t === maal ? "rgba(90, 70, 10, 0.35)" : "#1f2530" });
        }
        bogstav("m", A.x, NK.lerp(A.y, midY, 0.62));
        bogstav("n", NK.lerp(B.x, A.x, 0.55), NK.lerp(midY, B.y, 0.55));
        bogstav("M", NK.lerp(C.x, A.x, 0.55), NK.lerp(midY, B.y, 0.55));
        ctx.restore();
        return h;
    };

    /* ----- Linjen med enhederne ----------------------------------------------------------
       dele: [{ t, s (streges over), fed (resultatet) }]. t: 0-1, hvor langt
       animationen er: stregerne tegnes, og saa kommer resultatet. */
    T.enhedslinje = function (ctx, x, y, dele, px, t) {
        ctx.save();
        ctx.textBaseline = "middle";
        var xx = x, streger = [], antalS = dele.filter(function (d) { return d.s; }).length, sNr = 0;
        var fedFra = 0.75;
        dele.forEach(function (d) {
            ctx.font = font(d.fed ? "800" : "600", px);
            var b = ctx.measureText(d.t).width;
            var a = 1;
            if (d.fed) a = NK.klamp((t - fedFra) / 0.2, 0, 1);
            ctx.globalAlpha = a;
            ctx.fillStyle = d.fed ? "#1d7a48" : "#2a2f36";
            ctx.fillText(d.t, xx, y);
            ctx.globalAlpha = 1;
            if (d.s) {
                var t0 = 0.1 + 0.6 * sNr / Math.max(1, antalS);
                streger.push({ x0: xx - 2, x1: xx + b + 2, u: NK.klamp((t - t0) / (0.6 / Math.max(1, antalS)), 0, 1) });
                sNr++;
            }
            xx += b;
        });
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = Math.max(2, px * 0.12);
        ctx.lineCap = "round";
        streger.forEach(function (s) {
            if (s.u <= 0) return;
            ctx.beginPath();
            ctx.moveTo(s.x0, y + px * 0.3);
            ctx.lineTo(NK.lerp(s.x0, s.x1, s.u), y + px * 0.3 - (px * 0.6) * s.u);
            ctx.stroke();
        });
        ctx.restore();
        return xx - x;
    };

    T.enhedslinjeBredde = function (ctx, dele, px) {
        var b = 0;
        dele.forEach(function (d) { ctx.font = font(d.fed ? "800" : "600", px); b += ctx.measureText(d.t).width; });
        return b;
    };

    /* ----- Muldvarpen (paaskeaegget) ---------------------------------------------------------
       (x, y): midten af jordbunken. s: stoerrelsen. t: 0-1, hvor langt oppe. */
    T.muldvarp = function (ctx, x, y, s, t) {
        if (t <= 0) return;
        ctx.save();
        /* Jordbunken */
        ctx.fillStyle = "#5b4330";
        ctx.beginPath();
        ctx.ellipse(x, y, s * 0.75, s * 0.22, 0, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.rect(x - s, y - s * 1.4, s * 2, s * 1.4);
        ctx.clip();
        var op = y - s * 0.95 * NK.blod(t);
        ctx.fillStyle = "#3d3a40";
        ctx.beginPath();
        ctx.ellipse(x, op + s * 0.55, s * 0.45, s * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        /* Snuden og oejnene */
        ctx.fillStyle = "#f2a6b8";
        ctx.beginPath();
        ctx.ellipse(x, op + s * 0.08, s * 0.14, s * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#101014";
        ctx.beginPath();
        ctx.arc(x - s * 0.15, op - s * 0.1, s * 0.04, 0, Math.PI * 2);
        ctx.arc(x + s * 0.15, op - s * 0.1, s * 0.04, 0, Math.PI * 2);
        ctx.fill();
        /* Poterne */
        ctx.fillStyle = "#f2a6b8";
        ctx.beginPath();
        ctx.ellipse(x - s * 0.34, op + s * 0.42, s * 0.12, s * 0.07, -0.4, 0, Math.PI * 2);
        ctx.ellipse(x + s * 0.34, op + s * 0.42, s * 0.12, s * 0.07, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = "#6e5139";
        ctx.beginPath();
        ctx.ellipse(x, y, s * 0.75, s * 0.12, 0, 0, Math.PI);
        ctx.fill();
        ctx.restore();
    };

    NK.Tegn = T;
}());

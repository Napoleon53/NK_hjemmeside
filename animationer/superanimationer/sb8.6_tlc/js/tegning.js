/* =====================================================================
   tegning.js - det, der tegnes paa alle tre faner

   TLC-pladen, karret (sprites i lag: bagvaeg, løbevæske, plade, forside
   og laag), flaskerne, UV-kassen (som bogens figur i B8.6), linealen,
   gule ringe og skilte. Alt maales i px; pladen i cm gange s (px pr. cm).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = function () { return NK.Sprites; };

    var Tg = {};

    var BLYANT = "#6f747c";
    var UV_PLET = "#2f3640";

    /* ----- Scenens baggrund: en vaeg og et laboratoriebord ------------------- */
    Tg.baggrund = function (ctx, W, H, bordY) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#1d1f27");
        g.addColorStop(1, "#16171d");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        if (bordY === undefined || bordY >= H) return;
        var b = ctx.createLinearGradient(0, bordY, 0, H);
        b.addColorStop(0, "#3a3d47");
        b.addColorStop(0.08, "#2c2f37");
        b.addColorStop(1, "#22242b");
        ctx.fillStyle = b;
        ctx.fillRect(0, bordY, W, H - bordY);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(0, bordY, W, 1.5);
    };

    /* ----- TLC-pladen ---------------------------------------------------------
       (x, y) er pladens oeverste venstre hjoerne, s er px pr. cm.
       opt: uv (0-1: hvor meget UV-lyset er taendt), ringe (blyantsringe om
       pletterne), navne (tal under banerne), skjul (pletter, der ikke
       tegnes), pletter (en faerdig liste i stedet for pladens egne). */
    Tg.pladeY = function (plade, y, s, h) {
        return y + (plade.hoejde - h) * s;
    };

    Tg.plade = function (ctx, plade, x, y, s, opt) {
        opt = opt || {};
        var B = Math.max(1, plade.bredde * s), Hh = Math.max(1, plade.hoejde * s);
        var uv = opt.uv || 0;
        ctx.save();
        /* Skygge og selve pladen */
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#d9dde2";
        NK.rundtRekt(ctx, x - 1, y - 1, B + 2, Hh + 2, 3);
        ctx.fill();
        ctx.shadowColor = "transparent";
        var g = ctx.createLinearGradient(x, y, x + B * 0.4, y + Hh);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#eceeea");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, B, Hh, 2);
        ctx.fill();
        /* UV-lys: laget lyser groent */
        if (uv > 0) {
            ctx.globalAlpha = uv;
            var gu = ctx.createRadialGradient(x + B / 2, y + Hh * 0.45, 0, x + B / 2, y + Hh * 0.45, Math.max(B, Hh) * 0.78);
            gu.addColorStop(0, "#e2ffd2");
            gu.addColorStop(0.55, "#b3f39a");
            gu.addColorStop(1, "#7fdc68");
            ctx.fillStyle = gu;
            NK.rundtRekt(ctx, x, y, B, Hh, 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        /* Den vaade del af pladen */
        var vaad = plade.status === "klar" ? 0 : 1 - plade.toer;
        if (vaad > 0 && plade.top > 0) {
            var yTop = Tg.pladeY(plade, y, s, plade.top);
            ctx.fillStyle = "rgba(120, 160, 196, " + (0.24 * vaad).toFixed(3) + ")";
            ctx.fillRect(x, yTop, B, y + Hh - yTop);
            ctx.strokeStyle = "rgba(90, 130, 170, " + (0.5 * vaad).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (var k = 0; k <= 12; k++) {
                var xx = x + B * k / 12, yy = yTop + Math.sin(k * 1.7 + plade.t * 3) * 0.8;
                if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.beginPath();
        NK.rundtRekt(ctx, x, y, B, Hh, 2);
        ctx.clip();
        /* Startlinjen med blyant (eller kuglepen) og smaa streger ved banerne */
        var yS = Tg.pladeY(plade, y, s, plade.start);
        var stregFarve = plade.kuglepen ? "#3346c9" : (uv > 0.5 ? "#4f6b47" : BLYANT);
        ctx.strokeStyle = stregFarve;
        ctx.lineWidth = plade.kuglepen ? 1.8 : 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + 0.25 * s, yS);
        ctx.lineTo(x + B - 0.25 * s, yS);
        for (var i = 0; i < plade.baner.length; i++) {
            var bx = x + plade.banePos(i) * s;
            ctx.moveTo(bx, yS - 3.5);
            ctx.lineTo(bx, yS + 3.5);
        }
        ctx.stroke();
        /* Væskefronten med blyant, naar pladen er taget op */
        if (plade.markeret && opt.front !== false) {
            var yF = Tg.pladeY(plade, y, s, plade.start + plade.front);
            ctx.strokeStyle = uv > 0.5 ? "#4f6b47" : BLYANT;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x + 0.25 * s, yF);
            ctx.lineTo(x + B - 0.25 * s, yF);
            ctx.stroke();
        }
        /* Kuglepennens blaek loeber med op som farvede baand (paaskeaegget) */
        if (plade.kuglepen && plade.front > 0) {
            ["blaek1", "blaek2"].forEach(function (id) {
                var st = NK.Data.STOF[id];
                var z = NK.Model.rf(st, plade.loeb) * plade.front;
                var ry = Math.sqrt(0.014 + 0.016 * z) * s;
                var yb = Tg.pladeY(plade, y, s, plade.start + z);
                var gb = ctx.createLinearGradient(0, yb - ry, 0, yb + ry);
                gb.addColorStop(0, "rgba(0,0,0,0)");
                gb.addColorStop(0.5, NK.Tegn.rgba(st.farve, 0.55));
                gb.addColorStop(1, "rgba(0,0,0,0)");
                ctx.fillStyle = gb;
                ctx.fillRect(x + 0.25 * s, yb - ry, B - 0.5 * s, ry * 2);
            });
        }
        /* Pletterne */
        var pl = opt.pletter || plade.pletter();
        pl.forEach(function (p, j) {
            if (opt.skjul && opt.skjul(p, j)) return;
            var px = x + p.x * s, py = Tg.pladeY(plade, y, s, plade.start + p.z);
            Tg.plet(ctx, px, py, p.rx * s, p.ry * s, p.stof, p.mgd, uv, opt.dagslys !== false);
            if (opt.ringe) {
                ctx.strokeStyle = BLYANT;
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.ellipse(px, py, p.rx * s + 4, p.ry * s + 4, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
        ctx.restore();
        ctx.strokeStyle = uv > 0.5 ? "#5d8f4f" : "rgba(120,126,136,0.9)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, x, y, B, Hh, 2);
        ctx.stroke();
    };

    /* En plet: farvet i dagslys, moerk i UV-lys. Et farveløst stof ses kun i UV-lys. */
    Tg.plet = function (ctx, x, y, rx, ry, stof, mgd, uv, dagslys) {
        var styrke = 0.55 + 0.45 * (mgd === undefined ? 1 : mgd);
        var farve = null, a = 0;
        if (stof.farve && dagslys) { farve = stof.farve; a = styrke * (1 - 0.5 * uv); }
        if (stof.uv && uv > 0) {
            var au = styrke * uv;
            if (au > a) { farve = stof.farve ? Tg.bland(stof.farve, UV_PLET, 0.55) : UV_PLET; a = au; }
        }
        if (!farve || a <= 0.01) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, ry / rx);
        var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, Tg.rgba(farve, 0.95 * a));
        g.addColorStop(0.55, Tg.rgba(farve, 0.82 * a));
        g.addColorStop(1, Tg.rgba(farve, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Farver ------------------------------------------------------------ */
    function hex(f) {
        var h = f.replace("#", "");
        return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
    }

    Tg.rgba = function (f, a) {
        var c = hex(f);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + NK.klamp(a, 0, 1).toFixed(3) + ")";
    };

    Tg.bland = function (f1, f2, t) {
        var a = hex(f1), b = hex(f2);
        var c = a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); });
        return "#" + c.map(function (v) { return (v < 16 ? "0" : "") + v.toString(16); }).join("");
    };

    /* ----- Karret --------------------------------------------------------------
       K = { x, y, b, h }: spritets rektangel. Indersiden og randen i px. */
    Tg.karInde = function (K) {
        return {
            x0: K.x + K.b * 18 / 240, x1: K.x + K.b * 222 / 240,
            bund: K.y + K.h * 284 / 300, rand: K.y + K.h * 24 / 300,
            randRy: K.h * 9 / 300
        };
    };

    Tg.karBag = function (ctx, K) {
        S().tegn(ctx, "kar_bag", K.x, K.y, K.b, K.h);
    };

    /* Løbevæsken i bunden af karret: dybde i px over bunden */
    Tg.karVaeske = function (ctx, K, dybde, farve) {
        if (dybde <= 0) return;
        var I = Tg.karInde(K);
        var yv = I.bund - dybde;
        ctx.save();
        var g = ctx.createLinearGradient(0, yv, 0, I.bund);
        g.addColorStop(0, farve || "rgba(178, 212, 238, 0.42)");
        g.addColorStop(1, "rgba(140, 182, 214, 0.55)");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, I.x0, yv, I.x1 - I.x0, dybde, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(225, 240, 252, 0.75)";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse((I.x0 + I.x1) / 2, yv, (I.x1 - I.x0) / 2, Math.max(2, I.randRy * 0.45), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    Tg.karFor = function (ctx, K) {
        S().tegn(ctx, "kar_for", K.x, K.y, K.b, K.h);
    };

    /* Laaget: paa (0) eller taget af (1). Paa vej paa kommer det ned ovenfra
       og bliver tydeligere; taget af tegnes det ikke. */
    Tg.laag = function (ctx, K, loeft) {
        var b = K.b * 252 / 240, h = K.h * 34 / 300;
        var u = NK.klamp(loeft || 0, 0, 1);
        var x = K.x - K.b * 6 / 240;
        var y = K.y + K.h * 24 / 300 - h * 30 / 34 - u * K.h * 0.22;
        if (u < 1) {
            ctx.save();
            ctx.globalAlpha = 1 - u;
            S().tegn(ctx, "laag", x, y, b, h);
            ctx.restore();
        }
        return { x: x, y: y, b: b, h: h, af: u >= 1 };
    };

    /* ----- Flasken med løbevæske ------------------------------------------------
       (x, y) er flaskens oeverste venstre hjoerne, b dens bredde. Etiketten
       har to linjer: navnet stort og forklaringen smaat. */
    Tg.flaske = function (ctx, x, y, b, navn, under, opt) {
        opt = opt || {};
        var s = b / 100, h = 210 * s;
        ctx.save();
        if (opt.svag) ctx.globalAlpha = 0.45;
        /* Væsken bag glasset */
        var g = ctx.createLinearGradient(0, y + 90 * s, 0, y + 204 * s);
        g.addColorStop(0, "rgba(190, 220, 242, 0.32)");
        g.addColorStop(1, "rgba(150, 190, 222, 0.48)");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x + 9 * s, y + 90 * s, 82 * s, 114 * s, 6 * s);
        ctx.fill();
        S().tegn(ctx, "flaske_klar", x, y, b, h);
        /* Etiketten: bredere end flasken, hvis navnet ellers bliver for smaat */
        var eb = 72 * s, eh = 54 * s;
        ctx.font = "800 10px 'Segoe UI', sans-serif";
        eb = Math.min(Math.max(eb, ctx.measureText(navn).width + 8), b * 1.2);
        var ex = x + b / 2 - eb / 2, ey = y + 112 * s;
        ctx.fillStyle = opt.valgt ? "#fff6d6" : "#f4f1e8";
        ctx.strokeStyle = opt.valgt ? "#f2c53d" : "#b9b3a2";
        ctx.lineWidth = opt.valgt ? 2 : 1;
        NK.rundtRekt(ctx, ex, ey, eb, eh, 3);
        ctx.fill();
        ctx.stroke();
        var fs = NK.passendeSkrift(ctx, navn, eb - 6, Math.max(11, 17 * s), 9, "800");
        ctx.fillStyle = "#23262c";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(navn, ex + eb / 2, ey + eh * (under ? 0.38 : 0.5));
        if (under) {
            NK.passendeSkrift(ctx, under, eb - 6, Math.max(9, fs * 0.62), 8, "600");
            ctx.fillStyle = "#5b5f67";
            ctx.fillText(under, ex + eb / 2, ey + eh * 0.74);
        }
        ctx.restore();
        return { x: x, y: y, b: b, h: h };
    };

    /* ----- UV-kassen (som bogens figur i B8.6) -----------------------------------
       En moerk kasse med en lampe foroven. taendt: 0-1. Giver rektanglet,
       hvor pladen ligger. */
    Tg.uvKasse = function (ctx, x, y, b, h, taendt, opt) {
        opt = opt || {};
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 5;
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#222b38");
        g.addColorStop(1, "#121820");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, b, h, 14);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#0b0f14";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        /* Lampen */
        var lb = b * 0.68, lh = Math.max(9, h * 0.035), lx = x + (b - lb) / 2, ly = y + h * 0.06;
        if (taendt > 0) {
            ctx.globalAlpha = taendt;
            var kegle = ctx.createLinearGradient(0, ly + lh, 0, y + h * 0.3);
            kegle.addColorStop(0, "rgba(167,124,255,0.30)");
            kegle.addColorStop(1, "rgba(167,124,255,0.02)");
            ctx.fillStyle = kegle;
            ctx.beginPath();
            ctx.moveTo(lx + 2, ly + lh);
            ctx.lineTo(x + b * 0.08, y + h * 0.3);
            ctx.lineTo(x + b * 0.92, y + h * 0.3);
            ctx.lineTo(lx + lb - 2, ly + lh);
            ctx.closePath();
            ctx.fill();
            ctx.shadowColor = "rgba(167,124,255,0.9)";
            ctx.shadowBlur = 18;
            ctx.globalAlpha = 1;
        }
        var gl = ctx.createLinearGradient(0, ly, 0, ly + lh);
        if (taendt > 0.5) {
            gl.addColorStop(0, "#f4ecff");
            gl.addColorStop(0.5, "#c7a8ff");
            gl.addColorStop(1, "#8a5ce8");
        } else {
            gl.addColorStop(0, "#5a5f6c");
            gl.addColorStop(1, "#353945");
        }
        ctx.fillStyle = gl;
        NK.rundtRekt(ctx, lx, ly, lb, lh, lh / 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = taendt > 0.5 ? "#6b45c4" : "#2a2e38";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Navnet paa lampen */
        ctx.fillStyle = taendt > 0.5 ? "#e7dcff" : "#9aa3b2";
        ctx.font = "700 " + Math.round(NK.klamp(h * 0.032, 10, 13)) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(taendt > 0.5 ? "UV-lampe · tændt" : "UV-lampe · slukket", x + b / 2, ly - 3);
        ctx.restore();
        return { lampe: { x: lx, y: ly - 18, b: lb, h: lh + 22 } };
    };

    /* ----- Linealen -------------------------------------------------------------
       Lodret lineal. x: venstre kant, yNul: hoejden af 0, s: px pr. cm,
       fra og til: det, linealen viser, i cm. Tallene staar til venstre for
       stregerne, som peger ind mod pladen til hoejre. */
    Tg.LINEAL_B = 40;

    Tg.lineal = function (ctx, x, yNul, s, fra, til, opt) {
        opt = opt || {};
        var b = Tg.LINEAL_B * (opt.skala || 1);
        var yTop = yNul - til * s, yBund = yNul - fra * s;
        ctx.save();
        var g = ctx.createLinearGradient(x, 0, x + b, 0);
        g.addColorStop(0, "#f3e7c4");
        g.addColorStop(1, "#e6d6a8");
        ctx.fillStyle = g;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        NK.rundtRekt(ctx, x, yTop - 8, b, yBund - yTop + 16, 3);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#b39f66";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "#3a3324";
        ctx.fillStyle = "#3a3324";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "700 " + Math.round(11 * (opt.skala || 1)) + "px 'Segoe UI', sans-serif";
        var start = Math.ceil(fra * 10 - 1e-6), slut = Math.floor(til * 10 + 1e-6);
        for (var mm = start; mm <= slut; mm++) {
            var yy = yNul - mm / 10 * s;
            var l = mm % 10 === 0 ? b * 0.42 : (mm % 5 === 0 ? b * 0.3 : b * 0.18);
            ctx.lineWidth = mm % 10 === 0 ? 1.3 : 0.9;
            ctx.beginPath();
            ctx.moveTo(x + b, yy);
            ctx.lineTo(x + b - l, yy);
            ctx.stroke();
            if (mm % 10 === 0) ctx.fillText(String(mm / 10), x + b - l - 3, yy);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.font = "700 " + Math.round(10 * (opt.skala || 1)) + "px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#e6d6a8";
        ctx.fillText("cm", x + b / 2, yTop - 10);
        ctx.restore();
        return { x: x, y: yTop - 8, b: b, h: yBund - yTop + 16 };
    };

    /* ----- Gule ringe og skilte -------------------------------------------------- */
    /* En rolig gul ring om det, kortet handler om */
    Tg.ring = function (ctx, x, y, b, h, t, r) {
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.65 + 0.3 * Math.sin(t * 3)).toFixed(3) + ")";
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, r === undefined ? 10 : r);
        ctx.stroke();
        ctx.restore();
    };

    /* Et gult skilt, der siger, hvad et klik goer. pil: "ned", "op", "venstre"
       eller "hoejre" (skiltet peger den vej paa tingen). */
    Tg.skilt = function (ctx, tekst, x, y, t, pil) {
        ctx.save();
        ctx.font = "700 14px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var dy = Math.sin(t * 4) * 2.5;
        var bx = x - b / 2, by = y - h / 2 + dy;
        if (pil === "venstre") { bx = x + 10; by = y - h / 2; bx += Math.sin(t * 4) * 2.5; }
        if (pil === "hoejre") { bx = x - b - 10; by = y - h / 2; bx -= Math.sin(t * 4) * 2.5; }
        ctx.shadowColor = "rgba(0,0,0,0.45)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#f2c53d";
        NK.rundtRekt(ctx, bx, by, b, h, 8);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        if (pil === "ned") { ctx.moveTo(x - 7, by + h); ctx.lineTo(x + 7, by + h); ctx.lineTo(x, by + h + 8); }
        else if (pil === "op") { ctx.moveTo(x - 7, by); ctx.lineTo(x + 7, by); ctx.lineTo(x, by - 8); }
        else if (pil === "venstre") { ctx.moveTo(bx, y - 7); ctx.lineTo(bx, y + 7); ctx.lineTo(bx - 8, y); }
        else if (pil === "hoejre") { ctx.moveTo(bx + b, y - 7); ctx.lineTo(bx + b, y + 7); ctx.lineTo(bx + b + 8, y); }
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#33290a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, by + h / 2 + 0.5);
        ctx.restore();
        return { x: bx, y: by, b: b, h: h };
    };

    /* En lille etiket med moerk baggrund (navne under banerne, delenes navne) */
    Tg.etiket = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.font || "600 12px 'Segoe UI', sans-serif");
        var b = ctx.measureText(tekst).width + (opt.pad === undefined ? 12 : opt.pad), h = opt.h || 20;
        var bx = opt.venstre ? x : x - b / 2;
        ctx.fillStyle = opt.bund || "rgba(20, 22, 28, 0.86)";
        NK.rundtRekt(ctx, bx, y - h / 2, b, h, 5);
        ctx.fill();
        if (opt.kant) {
            ctx.strokeStyle = opt.kant;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        ctx.fillStyle = opt.farve || "#e8ecf1";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, y + 0.5);
        ctx.restore();
        return { x: bx, y: y - h / 2, b: b, h: h };
    };

    /* "Rf" med saenket f i canvas. Giver bredden. */
    Tg.rf = function (ctx, x, y, str) {
        ctx.save();
        ctx.font = "italic 700 " + str + "px 'Segoe UI', sans-serif";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("R", x, y);
        var w = ctx.measureText("R").width;
        ctx.font = "700 " + Math.round(str * 0.7) + "px 'Segoe UI', sans-serif";
        ctx.fillText("f", x + w, y + str * 0.22);
        var w2 = ctx.measureText("f").width;
        ctx.restore();
        return w + w2;
    };

    NK.Tegn = Tg;
}());

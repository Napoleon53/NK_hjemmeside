/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Farver, en lille tekstmaerkat, bordet, rammen om luppens vindue,
   signaturen over luppen og det gule skilt ved det, der skal klikkes
   paa. Glassene tegnes af js/glas.js og partiklerne af js/lup.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";

    /* En lille maerkat med tekst paa moerk bund */
    T.maerkat = function (ctx, tekst, x, y, valg) {
        valg = valg || {};
        ctx.save();
        ctx.font = font("700", valg.px || 13);
        var b = ctx.measureText(tekst).width + 16, h = (valg.px || 13) + 10;
        var vx = valg.justering === "left" ? x : (valg.justering === "right" ? x - b : x - b / 2);
        NK.rundtRekt(ctx, vx, y - h / 2, b, h, h / 2);
        ctx.fillStyle = valg.bund || "rgba(14, 15, 21, 0.82)";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#cfd6de";
        ctx.fillText(tekst, vx + b / 2, y + 0.5);
        ctx.restore();
    };

    /* Bordet: en plade, glassene staar paa, og forkanten ned til statuslinjen */
    T.bord = function (ctx, W, y, Hs) {
        ctx.fillStyle = "#3b3e4a";
        ctx.fillRect(0, y, W, 5);
        var g = ctx.createLinearGradient(0, y + 5, 0, Hs);
        g.addColorStop(0, "#262832");
        g.addColorStop(1, "#1d1e26");
        ctx.fillStyle = g;
        ctx.fillRect(0, y + 5, W, Math.max(0, Hs - y - 5));
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, y, W, 1);
    };

    /* Rammen om luppens vindue og de to stiplede streger ned til det lille
       felt i glasset, som vinduet viser forstoerret */
    T.zoomRamme = function (ctx, R, fra, fremhaev) {
        ctx.save();
        if (fra) {
            ctx.setLineDash([6, 5]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.55)";
            ctx.beginPath();
            ctx.moveTo(fra.x, fra.y);
            ctx.lineTo(R.x + 8, R.y + R.h);
            ctx.moveTo(fra.x + fra.b, fra.y);
            ctx.lineTo(R.x + R.b - 8, R.y + R.h);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.strokeRect(fra.x, fra.y, fra.b, fra.h);
        }
        /* fremhaev: det er denne lup, opgaven handler om */
        if (fremhaev) {
            NK.rundtRekt(ctx, R.x - 4, R.y - 4, R.b + 8, R.h + 8, 15);
            ctx.lineWidth = 6;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.28)";
            ctx.stroke();
        }
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.lineWidth = fremhaev ? 4 : 3;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#7d6a2c";
        ctx.stroke();
        ctx.restore();
    };

    /* Signaturen over luppen: de tre slags partikler som tydelige maerker
       med tegnet i stor udgave og formlen ved siden af. Midten staar i x.
       punkter: [{ slags: "hel" | "ion" | "ox", tekst }]. Giver maerkernes
       felter tilbage, saa et klik paa et maerke kan forklare partiklen. */
    T.signatur = function (ctx, x, y, syre, punkter, maxB) {
        var Lup = NK.Lup, felter = [];
        var trin = [{ px: 16, k: 1.45, luft: 11, mellem: 9 }, { px: 15, k: 1.3, luft: 9, mellem: 7 },
            { px: 14, k: 1.15, luft: 7, mellem: 5 }, { px: 13, k: 1.0, luft: 6, mellem: 4 }, { px: 12, k: 0.9, luft: 5, mellem: 3 }];
        var m, b, i;
        ctx.save();
        for (i = 0; i < trin.length; i++) {
            m = trin[i];
            ctx.font = font("700", m.px);
            b = m.mellem * (punkter.length - 1);
            punkter.forEach(function (p) { b += m.luft * 2 + Lup.ikonBredde(p.slags, syre, m.k) + 7 + ctx.measureText(p.tekst).width; });
            if (!maxB || b <= maxB) break;
        }
        var h = m.px + 15, cx = x - b / 2;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        punkter.forEach(function (p) {
            var ib = Lup.ikonBredde(p.slags, syre, m.k), tb = ctx.measureText(p.tekst).width;
            var fb = m.luft * 2 + ib + 7 + tb;
            NK.rundtRekt(ctx, cx, y - h / 2, fb, h, h / 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
            ctx.fill();
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = "#5a6072";
            ctx.stroke();
            Lup.ikon(ctx, p.slags, syre, cx + m.luft + ib / 2, y, m.k);
            ctx.font = font("700", m.px);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(p.tekst, cx + m.luft + ib + 7, y + 0.5);
            felter.push({ slags: p.slags, x: cx, y: y - h / 2, b: fb, h: h });
            cx += fb + m.mellem;
        });
        ctx.restore();
        return felter;
    };

    /* Hvilket maerke i signaturen ligger under punktet? */
    T.signaturVed = function (felter, pt) {
        for (var i = 0; felter && i < felter.length; i++) {
            var f = felter[i];
            if (pt.x >= f.x && pt.x <= f.x + f.b && pt.y >= f.y && pt.y <= f.y + f.h) return f.slags;
        }
        return null;
    };

    /* En rolig gul ring om det glas, opgaven handler om (brugerens oenske
       9. okt. 2026: eleven skal ikke gaette, hvilket glas teksten mener) */
    T.omRing = function (ctx, x, y, b, h) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, 16);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    /* En gul ring, der pulserer, om det, der skal klikkes paa */
    T.ring = function (ctx, x, y, b, h, tid) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids nedad: hvad et klik eller et traek goer */
    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        NK.rundtRekt(ctx, vx, y - h, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1);
        ctx.lineTo(x + 7, y - 1);
        ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, y - h / 2 + 0.5);
        ctx.restore();
    };

    NK.Tegn = T;
}());

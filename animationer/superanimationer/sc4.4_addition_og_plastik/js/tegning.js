/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Strukturformler som i bogen: grundstoffernes bogstaver med streger
   imellem (T.molekyle), de ledige pladser, naar en dobbeltbinding har
   aabnet sig (T.plads), zigzagformler og ringe til fane 2 (T.skelet og
   T.skeletSVG), og det faelles: bordet, maerkater, den gule ring og
   det gule skilt ved det, der skal bruges nu.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    T.BROM = "#f0a35c";          /* brom og bromvand: orange som i bogens figurer */
    T.STREG = "#aeb8c5";

    /* Grundstofferne: farven og den plads, bogstavet fylder (i bindingslaengder) */
    T.EL = {
        C: { farve: "#ffffff", r: 0.3 },
        H: { farve: "#cdd5de", r: 0.26 },
        Br: { farve: T.BROM, r: 0.45 },
        O: { farve: "#ff9385", r: 0.31 }
    };

    /* ----- Strukturformler ---------------------------------------------------------
       atomer: [{ el, x, y, alfa }] i pixels. bindinger: [{ a, b, s, alfa }], hvor
       s er styrken: 1 er en enkeltbinding, 2 en dobbeltbinding, og tal imellem
       er en binding, der er ved at aabne sig. u er pixels pr. bindingslaengde.
       valg: alfa (hele molekylet), px (skriftens stoerrelse), streg (farve). */
    T.molekyle = function (ctx, atomer, bindinger, u, valg) {
        valg = valg || {};
        var px = valg.px || Math.max(13, u * 0.6), gA = valg.alfa === undefined ? 1 : valg.alfa;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineWidth = Math.max(2, u * 0.065);
        bindinger.forEach(function (b) {
            var A = atomer[b.a], B = atomer[b.b], s = b.s;
            if (!A || !B || s <= 0.01) return;
            var dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
            var rA = T.EL[A.el].r * u, rB = T.EL[B.el].r * u;
            if (d < rA + rB + 2) return;
            var ex = dx / d, ey = dy / d, nx = -ey, ny = ex;
            var x1 = A.x + ex * rA, y1 = A.y + ey * rA, x2 = B.x - ex * rB, y2 = B.y - ey * rB;
            var alfa = gA * (b.alfa === undefined ? 1 : b.alfa) * Math.min(A.alfa === undefined ? 1 : A.alfa, B.alfa === undefined ? 1 : B.alfa);
            var ekstra = NK.klamp(s - 1, 0, 1), afs = u * 0.085 * ekstra;
            ctx.strokeStyle = b.farve || valg.streg || T.STREG;
            ctx.globalAlpha = alfa * Math.min(1, s);
            ctx.beginPath();
            ctx.moveTo(x1 + nx * afs, y1 + ny * afs);
            ctx.lineTo(x2 + nx * afs, y2 + ny * afs);
            ctx.stroke();
            if (ekstra > 0.01) {
                ctx.globalAlpha = alfa * ekstra;
                ctx.beginPath();
                ctx.moveTo(x1 - nx * afs, y1 - ny * afs);
                ctx.lineTo(x2 - nx * afs, y2 - ny * afs);
                ctx.stroke();
            }
        });
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = font("700", px);
        atomer.forEach(function (a) {
            ctx.globalAlpha = gA * (a.alfa === undefined ? 1 : a.alfa);
            ctx.fillStyle = a.farve || T.EL[a.el].farve;
            ctx.fillText(a.el, a.x, a.y + px * 0.04);
        });
        ctx.restore();
    };

    /* En ledig plads: en stiplet gul cirkel og en stiplet streg fra carbonatomet */
    T.plads = function (ctx, cx, cy, x, y, u, alfa) {
        if (alfa <= 0.01) return;
        var r = u * 0.3, dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.strokeStyle = T.GUL;
        ctx.lineWidth = Math.max(1.5, u * 0.04);
        ctx.setLineDash([u * 0.09, u * 0.08]);
        ctx.beginPath();
        ctx.moveTo(cx + dx / d * u * 0.3, cy + dy / d * u * 0.3);
        ctx.lineTo(x - dx / d * r, y - dy / d * r);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Zigzagformler og ringe (fane 2) --------------------------------------------
       Geometrien i bindingslaengder, saa den kan tegnes baade paa laerredet
       og som SVG paa gaetkortet. br: produktet, hvor dobbeltbindingen er
       aabnet, og der sidder et bromatom paa hvert af de to carbonatomer. */
    T.skeletGeo = function (id, br) {
        var p = [], linjer = [], tekster = [], i;
        var ring = id === "cyclohexan" || id === "cyclohexen" || id === "benzen";
        if (ring) {
            for (i = 0; i < 6; i++) {
                var v = (-90 + 60 * i) * Math.PI / 180;
                p.push([Math.cos(v), Math.sin(v)]);
            }
        } else {
            for (i = 0; i < 6; i++) p.push([(i - 2.5) * 0.866, i % 2 === 0 ? 0.25 : -0.25]);
        }
        var n = ring ? 6 : 5;
        for (i = 0; i < n; i++) {
            var a = p[i], b = p[(i + 1) % 6];
            linjer.push([a[0], a[1], b[0], b[1]]);
        }
        /* Dobbeltbindingerne: en ekstra streg, lidt kortere og rykket ind */
        var dobbelt = [];
        if (!br && (id === "hexen" || id === "cyclohexen")) dobbelt = [0];
        if (id === "benzen") dobbelt = [0, 2, 4];
        dobbelt.forEach(function (k) {
            var a = p[k], b = p[(k + 1) % 6];
            var dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy);
            var nx = -dy / d, ny = dx / d;
            /* ind mod ringens midte, eller ned under kaeden */
            var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
            if (ring) { if (nx * mx + ny * my > 0) { nx = -nx; ny = -ny; } }
            else if (ny < 0) { nx = -nx; ny = -ny; }
            var k1 = ring ? 0.14 : 0.06, afs = 0.17;
            linjer.push([a[0] + dx * k1 + nx * afs, a[1] + dy * k1 + ny * afs, b[0] - dx * k1 + nx * afs, b[1] - dy * k1 + ny * afs]);
        });
        if (br) {
            var retning = ring ? [[p[0][0], p[0][1]], [p[1][0], p[1][1]]] : [[-0.62, 0.78], [0, -1]];
            [0, 1].forEach(function (k) {
                var r = retning[k], d = Math.hypot(r[0], r[1]);
                var ex = r[0] / d, ey = r[1] / d;
                linjer.push([p[k][0], p[k][1], p[k][0] + ex * 0.55, p[k][1] + ey * 0.55]);
                tekster.push([p[k][0] + ex * 0.98, p[k][1] + ey * 0.98, "Br"]);
            });
        }
        return { linjer: linjer, tekster: tekster };
    };

    /* valg: farve, brFarve, alfa, bredde */
    T.skelet = function (ctx, id, cx, cy, s, valg) {
        valg = valg || {};
        var g = T.skeletGeo(id, valg.br);
        ctx.save();
        ctx.globalAlpha = valg.alfa === undefined ? 1 : valg.alfa;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = valg.bredde || Math.max(1.6, s * 0.1);
        ctx.strokeStyle = valg.farve || "#dfe5ec";
        ctx.beginPath();
        g.linjer.forEach(function (l) {
            ctx.moveTo(cx + l[0] * s, cy + l[1] * s);
            ctx.lineTo(cx + l[2] * s, cy + l[3] * s);
        });
        ctx.stroke();
        ctx.font = font("700", Math.max(11, s * 0.62));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.brFarve || T.BROM;
        g.tekster.forEach(function (t) { ctx.fillText(t[2], cx + t[0] * s, cy + t[1] * s); });
        ctx.restore();
    };

    /* Samme tegning som SVG (til gaetkortet, der er almindelige elementer) */
    T.skeletSVG = function (id, hoejde) {
        var g = T.skeletGeo(id, false), s = 26, h = hoejde || 78;
        var ring = id === "cyclohexan" || id === "cyclohexen" || id === "benzen";
        var b = ring ? 2.5 : 5.1, hh = ring ? 2.5 : 1.3;
        var ud = '<svg class="gk-figur" viewBox="' + (-b / 2 * s) + " " + (-hh / 2 * s) + " " + (b * s) + " " + (hh * s) + '" height="' + (ring ? h : Math.round(h * 0.5)) + '" role="img" aria-hidden="true">';
        g.linjer.forEach(function (l) {
            ud += '<line x1="' + (l[0] * s).toFixed(1) + '" y1="' + (l[1] * s).toFixed(1) + '" x2="' + (l[2] * s).toFixed(1) + '" y2="' + (l[3] * s).toFixed(1) + '"/>';
        });
        return ud + "</svg>";
    };

    /* ----- Det faelles ---------------------------------------------------------------- */
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

    /* Bordet: en plade, tingene staar paa, og forkanten ned til statuslinjen */
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
        ctx.fillStyle = "#191a22";
        ctx.fill();
        ctx.lineWidth = fremhaev ? 4 : 3;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#7d6a2c";
        ctx.stroke();
        ctx.restore();
    };

    /* En rolig gul ring om det, opgaven eller spoergsmaalet handler om
       (brugerens oenske 9. okt. 2026: intet indforstaaet). Ringen, der
       pulserer (T.ring), betyder stadig "brug mig nu". */
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

    /* En gul ring, der pulserer, om det, der skal bruges */
    T.ring = function (ctx, x, y, b, h, tid, radius) {
        var puls = 0.5 + 0.5 * Math.sin(tid * 4.2);
        ctx.save();
        NK.rundtRekt(ctx, x - 4 - puls * 3, y - 4 - puls * 3, b + 8 + puls * 6, h + 8 + puls * 6, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * puls) + ")";
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille gult skilt med en spids: hvad et klik eller et traek goer.
       ned = true: spidsen peger nedad (skiltet staar over tingen). */
    T.skilt = function (ctx, tekst, x, y, minX, maxX, op) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        var top = op ? y : y - h;
        NK.rundtRekt(ctx, vx, top, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        if (op) {
            ctx.moveTo(x - 7, y + 1); ctx.lineTo(x + 7, y + 1); ctx.lineTo(x, y - 8);
        } else {
            ctx.moveTo(x - 7, y - 1); ctx.lineTo(x + 7, y - 1); ctx.lineTo(x, y + 8);
        }
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, top + h / 2 + 0.5);
        ctx.restore();
    };

    /* Et kort paa hylden med et lille molekyle paa: det, eleven traekker i */
    T.brik = function (ctx, x, y, b, h, valg) {
        valg = valg || {};
        ctx.save();
        ctx.globalAlpha = valg.alfa === undefined ? 1 : valg.alfa;
        NK.rundtRekt(ctx, x, y, b, h, 12);
        ctx.fillStyle = valg.over ? "#3a3d4c" : "#2c2e3a";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = valg.over ? "#8f96a8" : "#565a6b";
        ctx.stroke();
        ctx.restore();
    };

    NK.Tegn = T;
}());

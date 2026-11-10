/* =====================================================================
   tegning.js - udstyret paa laerredet: lampen, straalen, kuvetten,
   detektoren med displayet, tavlen og grafen. Fane 1 og 2 bruger de
   samme tegninger; fane 2 i mindre stoerrelse.

   Kuvetten skal kunne skifte bredde og farve, og lampe og detektor er
   flade kasser, saa udstyret tegnes her i kode og ikke som sprites.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Tg = {};

    Tg.SKRIFT = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    Tg.font = function (vaegt, px) { return vaegt + " " + px + "px " + Tg.SKRIFT; };

    Tg.rgba = function (rgb, a) {
        return "rgba(" + Math.round(rgb[0]) + ", " + Math.round(rgb[1]) + ", " + Math.round(rgb[2]) + ", " + a + ")";
    };

    /* Opløsningens farve set gennem 1 cm: hver kanal svækkes efter
       stoffets vaeske-tal og koncentrationen (kun til kuvettens farve) */
    Tg.vaeskeFarve = function (stof, c) {
        var f = NK.klamp(c / stof.cMax, 0, 1.5);
        return stof.vaeske.map(function (k) {
            return 12 + 238 * Math.pow(10, -k * f);
        });
    };

    /* ----- Lampen: en moerk kasse med en aabning, der lyser i lysets farve ----- */
    Tg.lampe = function (ctx, x, y, b, h, rgb) {
        ctx.save();
        var g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, "#4a4d5a");
        g.addColorStop(1, "#2c2e37");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, b, h, 8);
        ctx.fill();
        ctx.strokeStyle = "#676b7a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        /* Koeleribber */
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 2;
        for (var i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo(x + b * 0.18, y + h * (0.2 + i * 0.14));
            ctx.lineTo(x + b * 0.55, y + h * (0.2 + i * 0.14));
            ctx.stroke();
        }
        /* Aabningen */
        var ah = Math.min(h * 0.42, 46);
        ctx.shadowColor = Tg.rgba(rgb, 0.9);
        ctx.shadowBlur = 16;
        ctx.fillStyle = Tg.rgba(rgb, 1);
        NK.rundtRekt(ctx, x + b - 9, y + h / 2 - ah / 2, 9, ah, 3);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Straalen: et baand i lysets farve ------------------------------------ */
    Tg.straale = function (ctx, x0, x1, yc, h, rgb, styrke) {
        if (x1 <= x0 || styrke <= 0.002) return;
        ctx.save();
        var g = ctx.createLinearGradient(0, yc - h / 2, 0, yc + h / 2);
        g.addColorStop(0, Tg.rgba(rgb, 0));
        g.addColorStop(0.5, Tg.rgba(rgb, 0.42 * styrke));
        g.addColorStop(1, Tg.rgba(rgb, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x0, yc - h / 2, x1 - x0, h);
        ctx.restore();
    };

    /* Straalen inde i vaesken: svagere og svagere efter I(x) */
    Tg.straaleInde = function (ctx, x0, x1, yc, h, rgb, lysFn) {
        var skridt = Math.max(2, Math.ceil((x1 - x0) / 3));
        var b = (x1 - x0) / skridt;
        for (var i = 0; i < skridt; i++) {
            var u = (i + 0.5) / skridt;
            Tg.straale(ctx, x0 + i * b, x0 + (i + 1) * b + 0.6, yc, h, rgb, lysFn(u));
        }
    };

    /* ----- Kuvetten -----------------------------------------------------------------
       x, y: oeverste venstre hjoerne af glasset. b: bredden (= l). h: hoejden.
       opt: { rgb (vaeskens farve), tom, aftryk, lys (glød rundt om), greb } */
    Tg.kuvette = function (ctx, x, y, b, h, opt) {
        opt = opt || {};
        ctx.save();
        var top = y + h * 0.12;            /* vaeskens overflade */
        if (!opt.tom) {
            ctx.fillStyle = Tg.rgba(opt.rgb || [235, 240, 245], opt.rgb ? 0.88 : 0.25);
            ctx.fillRect(x + 2, top, b - 4, y + h - top - 2);
            /* Menisken */
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + 2, top + 1);
            ctx.lineTo(x + b - 2, top + 1);
            ctx.stroke();
        }
        /* Glasset */
        if (opt.lys) {
            ctx.shadowColor = opt.lys;
            ctx.shadowBlur = 14;
        }
        ctx.strokeStyle = "rgba(225, 235, 245, 0.85)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.lineTo(x + b, y + h);
        ctx.lineTo(x + b, y);
        ctx.stroke();
        ctx.shadowBlur = 0;
        /* Glansen paa glasset */
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(x + 4, top + 4, Math.max(2, Math.min(5, b * 0.06)), y + h - top - 10);
        /* Et fingeraftryk: graa ringe paa glasset */
        if (opt.aftryk) {
            var ax = x + b * 0.55, ay = y + h * 0.55, r = Math.min(b * 0.36, h * 0.17);
            ctx.strokeStyle = "rgba(235, 235, 225, 0.75)";
            ctx.lineWidth = 1.3;
            for (var i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.ellipse(ax, ay, r * (0.35 + i * 0.22), r * (0.5 + i * 0.3), 0.3, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.fillStyle = "rgba(230, 230, 220, 0.22)";
            ctx.beginPath();
            ctx.ellipse(ax, ay, r, r * 1.35, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* ----- Detektoren: kassen med et vindue mod lyset ----------------------------- */
    Tg.detektor = function (ctx, x, y, b, h, vinduesH) {
        ctx.save();
        var g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, "#4a4d5a");
        g.addColorStop(1, "#2c2e37");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, b, h, 8);
        ctx.fill();
        ctx.strokeStyle = "#676b7a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        /* Vinduet med fotocellen */
        ctx.fillStyle = "#151820";
        NK.rundtRekt(ctx, x - 2, y + h / 2 - vinduesH / 2, 12, vinduesH, 3);
        ctx.fill();
        ctx.fillStyle = "#5a6a7f";
        ctx.fillRect(x + 3, y + h / 2 - vinduesH / 2 + 4, 4, vinduesH - 8);
        ctx.restore();
    };

    /* Solbrillerne foran detektoren (paaskeaegget paa fane 1) */
    Tg.solbriller = function (ctx, x, yc, s) {
        ctx.save();
        ctx.fillStyle = "rgba(10, 10, 14, 0.82)";
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, yc - s * 0.55, s * 0.32, s * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(x, yc + s * 0.55, s * 0.32, s * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, yc - s * 0.14);
        ctx.lineTo(x, yc + s * 0.14);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.ellipse(x - s * 0.1, yc - s * 0.72, s * 0.06, s * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Displayet: linjer med etiket og tal ------------------------------------ */
    Tg.display = function (ctx, x, y, b, linjer, px) {
        var lh = px * 1.45;
        var h = linjer.length * lh + px * 0.7;
        ctx.save();
        ctx.fillStyle = "#0c1a12";
        NK.rundtRekt(ctx, x, y, b, h, 6);
        ctx.fill();
        ctx.strokeStyle = "#2f4f3c";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.textBaseline = "middle";
        linjer.forEach(function (l, i) {
            var yy = y + px * 0.35 + lh * (i + 0.5);
            ctx.font = Tg.font("600", px * 0.86);
            ctx.textAlign = "left";
            ctx.fillStyle = "#7fbf95";
            ctx.fillText(l.etiket, x + px * 0.5, yy);
            ctx.font = Tg.font("700", px);
            ctx.textAlign = "right";
            ctx.fillStyle = l.farve || "#b9ffd0";
            ctx.fillText(l.tal, x + b - px * 0.5, yy);
        });
        ctx.restore();
        return h;
    };

    /* ----- Tavlen: groen flade i en traeramme ---------------------------------------- */
    Tg.tavle = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.fillStyle = "#6d4c2f";
        NK.rundtRekt(ctx, x - 7, y - 7, b + 14, h + 14, 8);
        ctx.fill();
        var g = ctx.createLinearGradient(x, y, x + b, y + h);
        g.addColorStop(0, "#22302b");
        g.addColorStop(1, "#1b2622");
        ctx.fillStyle = g;
        ctx.fillRect(x, y, b, h);
        ctx.restore();
    };

    /* Tekst i flere stykker med hver sin farve paa én linje.
       dele: [{ t, farve, vaegt }]. Giver bredden. */
    Tg.dele = function (ctx, dele, x, y, px, tegn) {
        var bx = x;
        dele.forEach(function (d) {
            ctx.font = Tg.font(d.vaegt || "600", d.px || px);
            if (tegn !== false) {
                ctx.fillStyle = d.farve || "#e9eee9";
                ctx.fillText(d.t, bx, y);
            }
            bx += ctx.measureText(d.t).width;
        });
        return bx - x;
    };

    /* ----- Pile og maal --------------------------------------------------------------- */
    Tg.maalPil = function (ctx, x0, x1, y, farve) {
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.moveTo(x0, y - 6);
        ctx.lineTo(x0, y + 6);
        ctx.moveTo(x1, y - 6);
        ctx.lineTo(x1, y + 6);
        ctx.stroke();
        [[x0, 1], [x1, -1]].forEach(function (p) {
            ctx.beginPath();
            ctx.moveTo(p[0], y);
            ctx.lineTo(p[0] + p[1] * 7, y - 4);
            ctx.lineTo(p[0] + p[1] * 7, y + 4);
            ctx.closePath();
            ctx.fill();
        });
        ctx.restore();
    };

    /* "Paene" akseskalaer: 0 til et rundt tal med et rundt trin */
    Tg.skala = function (maks, maalAntal) {
        maalAntal = maalAntal || 5;
        var raa = maks / maalAntal;
        var e = Math.pow(10, Math.floor(Math.log(raa) / Math.LN10));
        var f = raa / e, trin;
        if (f <= 1) trin = 1; else if (f <= 2) trin = 2; else if (f <= 2.5) trin = 2.5; else if (f <= 5) trin = 5; else trin = 10;
        trin *= e;
        var top = Math.ceil(maks / trin - 1e-9) * trin;
        var dec = Math.max(0, -Math.floor(Math.log(trin) / Math.LN10 + 1e-9) + (trin / e === 2.5 ? 1 : 0));
        return { maks: top, trin: trin, dec: dec };
    };

    NK.Tegn = Tg;
}());

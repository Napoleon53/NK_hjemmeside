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

    /* Lexend som papirkortet (regelsaettet regel 30, 21. nov. 2026): rolig
       skrift, ingen kraftigt fede bogstaver. Skriften hentes af
       ../faelles/papirkort.css. */
    Tg.SKRIFT = "'Lexend', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
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

    /* ----- Figurerne i "super figur"-stil (runde 2, 21. nov. 2026, regel 32):
       rigtige apparater med farveforloeb, lidt dybde og en bloed skygge under,
       men rolige farver og ingen glimt. ----------------------------------- */
    function metal(ctx, x, y, b, h, lys) {
        var g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, lys ? "#6b7282" : "#5d6474");
        g.addColorStop(0.45, "#454b58");
        g.addColorStop(1, "#30343d");
        return g;
    }

    function skygge(ctx, cx, y, b) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(cx, y, b * 0.55, Math.max(3, b * 0.06), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* ----- Lampen: et lampehus med koeleriller, et linserør og en linse,
       der lyser i lysets farve ------------------------------------------- */
    Tg.lampe = function (ctx, x, y, b, h, rgb) {
        ctx.save();
        var kb = b * 0.78, fod = Math.max(4, h * 0.08);
        skygge(ctx, x + kb / 2, y + h + fod, kb);
        ctx.fillStyle = "#2a2e36";
        NK.rundtRekt(ctx, x + kb * 0.2, y + h - 2, kb * 0.6, fod + 2, 2);
        ctx.fill();
        ctx.fillStyle = metal(ctx, x, y, kb, h, true);
        NK.rundtRekt(ctx, x, y, kb, h, Math.min(10, h * 0.14));
        ctx.fill();
        ctx.strokeStyle = "#767d8d";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 2.5);
        ctx.lineTo(x + kb - 6, y + 2.5);
        ctx.stroke();
        var n = 4, rx = x + kb * 0.16, rb = kb * 0.07, ry = y + h * 0.22, rh = h * 0.56;
        for (var i = 0; i < n; i++) {
            var xx = rx + i * rb * 2;
            ctx.fillStyle = "#23262d";
            NK.rundtRekt(ctx, xx, ry, rb, rh, rb / 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.fillRect(xx + rb, ry + 1, 1, rh - 2);
        }
        var lh = Math.min(h * 0.46, 52), ly = y + h / 2 - lh / 2, lx = x + kb - 1, lb = b - kb + 1;
        var gr = ctx.createLinearGradient(0, ly, 0, ly + lh);
        gr.addColorStop(0, "#7a8191");
        gr.addColorStop(0.5, "#4d5361");
        gr.addColorStop(1, "#33373f");
        ctx.fillStyle = gr;
        ctx.fillRect(lx, ly, lb, lh);
        ctx.strokeStyle = "#7d8494";
        ctx.strokeRect(lx + 0.5, ly + 0.5, lb - 1, lh - 1);
        var lg = ctx.createRadialGradient(x + b - 2, y + h / 2, 1, x + b - 2, y + h / 2, lh * 0.5);
        lg.addColorStop(0, Tg.rgba([Math.min(255, rgb[0] + 110), Math.min(255, rgb[1] + 30), Math.min(255, rgb[2] + 110)], 1));
        lg.addColorStop(1, Tg.rgba(rgb, 0.95));
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.ellipse(x + b - 1.5, y + h / 2, Math.max(3, lb * 0.25), lh * 0.42, 0, 0, Math.PI * 2);
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
       opt: { rgb (vaeskens farve), tom, aftryk, lys (kant rundt om) }
       En rigtig kuvette: glasvaegge med tykkelse, en tyk bund, en kant
       foroven, matte sider og vaeske med en menisk (runde 2, 21. nov. 2026). */
    Tg.kuvette = function (ctx, x, y, b, h, opt) {
        opt = opt || {};
        ctx.save();
        var t = NK.klamp(b * 0.05, 2.5, 5), bund = t * 1.6;
        var top = y + h * 0.12;            /* vaeskens overflade */
        if (h > 40) skygge(ctx, x + b / 2, y + h + 2, b + 8);
        /* Glasset bag vaesken, og glasset over vaesken lyst (runde 3: ikke en
           moerk kant foroven) */
        ctx.fillStyle = "rgba(205, 222, 238, 0.10)";
        ctx.fillRect(x, y, b, h);
        var luft = ctx.createLinearGradient(0, y, 0, top);
        luft.addColorStop(0, "rgba(225, 236, 246, 0.34)");
        luft.addColorStop(1, "rgba(225, 236, 246, 0.20)");
        ctx.fillStyle = luft;
        ctx.fillRect(x, y, b, top - y + 2);
        if (!opt.tom) {
            var ix = x + t, ib = b - 2 * t, ib0 = y + h - bund, men = Math.min(4, ib * 0.06);
            var rgb = opt.rgb || [225, 232, 240];
            var g = ctx.createLinearGradient(0, top, 0, ib0);
            g.addColorStop(0, Tg.rgba(rgb.map(function (k) { return Math.min(255, k + 18); }), opt.rgb ? 0.86 : 0.22));
            g.addColorStop(1, Tg.rgba(rgb.map(function (k) { return k * 0.88; }), opt.rgb ? 0.92 : 0.28));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(ix, top - men);
            ctx.quadraticCurveTo(ix + ib / 2, top + men, ix + ib, top - men);
            ctx.lineTo(ix + ib, ib0);
            ctx.lineTo(ix, ib0);
            ctx.closePath();
            ctx.fill();
            /* Menisken */
            ctx.strokeStyle = "rgba(255, 255, 255, 0.40)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(ix, top - men);
            ctx.quadraticCurveTo(ix + ib / 2, top + men, ix + ib, top - men);
            ctx.stroke();
        }
        /* Vaeggene og bunden: matte glas med tykkelse */
        ctx.fillStyle = "rgba(226, 234, 242, 0.42)";
        ctx.fillRect(x, y, t, h);
        ctx.fillRect(x + b - t, y, t, h);
        ctx.fillStyle = "rgba(226, 234, 242, 0.50)";
        ctx.fillRect(x + t, y + h - bund, b - 2 * t, bund);
        /* Et svagt hoejlys paa den venstre glasvaeg */
        ctx.fillStyle = "rgba(255, 255, 255, 0.30)";
        ctx.fillRect(x + t + 2, top + 4, 1.4, y + h - bund - top - 8);
        /* Omridset og kanten foroven */
        ctx.strokeStyle = opt.lys || "rgba(230, 238, 246, 0.85)";
        ctx.lineWidth = opt.lys ? 2.5 : 1.3;
        NK.rundtRekt(ctx, x, y, b, h, 2);
        ctx.stroke();
        ctx.fillStyle = "#c9d2dc";
        ctx.fillRect(x - 1.5, y - 2, b + 3, 3);
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

    /* ----- Detektoren: et apparat med en indgangsspalte i en frontplade ---------- */
    Tg.detektor = function (ctx, x, y, b, h, vinduesH) {
        ctx.save();
        var fod = Math.max(4, h * 0.07);
        skygge(ctx, x + b / 2, y + h + fod, b);
        ctx.fillStyle = "#2a2e36";
        NK.rundtRekt(ctx, x + b * 0.25, y + h - 2, b * 0.5, fod + 2, 2);
        ctx.fill();
        ctx.fillStyle = metal(ctx, x, y, b, h, true);
        NK.rundtRekt(ctx, x, y, b, h, Math.min(10, h * 0.12));
        ctx.fill();
        ctx.strokeStyle = "#767d8d";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 2.5);
        ctx.lineTo(x + b - 6, y + 2.5);
        ctx.stroke();
        /* Frontpladen med spalten */
        var ph = Math.min(h - 10, vinduesH + 16), py = y + h / 2 - ph / 2, pb = Math.min(20, b * 0.2);
        var gp = ctx.createLinearGradient(x, 0, x + pb, 0);
        gp.addColorStop(0, "#6d7484");
        gp.addColorStop(1, "#4a505d");
        ctx.fillStyle = gp;
        NK.rundtRekt(ctx, x - 3, py, pb + 3, ph, 3);
        ctx.fill();
        ctx.strokeStyle = "#868d9c";
        ctx.stroke();
        ctx.fillStyle = "#0e1015";
        NK.rundtRekt(ctx, x + 2, y + h / 2 - vinduesH / 2, 4, vinduesH, 2);
        ctx.fill();
        /* En lille ventilationsrist */
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.5;
        for (var i = 0; i < 3; i++) {
            var yy = y + h * 0.72 + i * 5;
            if (yy > y + h - 6) break;
            ctx.beginPath();
            ctx.moveTo(x + b * 0.55, yy);
            ctx.lineTo(x + b * 0.85, yy);
            ctx.stroke();
        }
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

    /* ----- Displayet: en ramme med et indsat LCD og linjer med etiket og tal ----- */
    Tg.display = function (ctx, x, y, b, linjer, px) {
        var lh = px * 1.45;
        var h = linjer.length * lh + px * 0.7;
        ctx.save();
        ctx.fillStyle = "#2b3039";
        NK.rundtRekt(ctx, x, y, b, h, 7);
        ctx.fill();
        ctx.strokeStyle = "#4b5260";
        ctx.lineWidth = 1;
        ctx.stroke();
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#13241b");
        g.addColorStop(1, "#0c1913");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x + 3, y + 3, b - 6, h - 6, 5);
        ctx.fill();
        ctx.textBaseline = "middle";
        linjer.forEach(function (l, i) {
            var yy = y + px * 0.35 + lh * (i + 0.5);
            ctx.font = Tg.font("400", px * 0.86);
            ctx.textAlign = "left";
            ctx.fillStyle = "#7fae90";
            ctx.fillText(l.etiket, x + px * 0.6, yy);
            ctx.font = Tg.font("500", px);
            ctx.textAlign = "right";
            ctx.fillStyle = l.farve || "#b9f5cf";
            ctx.fillText(l.tal, x + b - px * 0.6, yy);
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

    /* Tavlen som et roligt, lyst papir (regelsaettet regel 29, 21. nov. 2026) */
    Tg.papir = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#fbfaf6";
        NK.rundtRekt(ctx, x, y, b, h, 10);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#d9d4c6";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    /* En stiplet plads med navnet paa det, der kommer senere (regel 13) */
    Tg.plads = function (ctx, x, y, b, h, navn, px) {
        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = "rgba(200, 208, 220, 0.30)";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, x, y, b, h, 10);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = Tg.font("500", px || 14);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(200, 208, 220, 0.55)";
        ctx.fillText(navn, x + b / 2, y + h / 2);
        ctx.restore();
    };

    /* En etiket: et lyst maerke med moerke bogstaver (regel 22). linjer:
       [{ t, px, vaegt, farve }]. x er midten. Giver { x, y, b, h }. */
    Tg.etiket = function (ctx, x, y, linjer, opt) {
        opt = opt || {};
        ctx.save();
        var b = 0, h = 0, pad = opt.pad || 8;
        linjer.forEach(function (l) {
            ctx.font = Tg.font(l.vaegt || "500", l.px);
            b = Math.max(b, ctx.measureText(l.t).width);
            h += l.px * 1.3;
        });
        b += pad * 2 + (opt.ekstraB || 0);
        h += pad * 0.9;
        var x0 = x - b / 2;
        ctx.fillStyle = opt.bund || "#fbfaf6";
        ctx.strokeStyle = opt.kant || "#c9c3b3";
        ctx.lineWidth = opt.kantB || 1;
        NK.rundtRekt(ctx, x0, y, b, h, 6);
        ctx.fill();
        ctx.stroke();
        var yy = y + pad * 0.45;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        linjer.forEach(function (l) {
            ctx.font = Tg.font(l.vaegt || "500", l.px);
            ctx.fillStyle = l.farve || "#1d2433";
            ctx.fillText(l.t, x, yy + l.px * 0.15);
            yy += l.px * 1.3;
        });
        ctx.restore();
        return { x: x0, y: y, b: b, h: h };
    };

    /* Tekst i flere stykker med hver sin farve paa én linje.
       dele: [{ t, farve, vaegt }]. Giver bredden. */
    Tg.dele = function (ctx, dele, x, y, px, tegn) {
        var bx = x;
        dele.forEach(function (d) {
            ctx.font = Tg.font(d.vaegt || "500", d.px || px);
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

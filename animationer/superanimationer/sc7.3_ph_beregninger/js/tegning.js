/* =====================================================================
   tegning.js - det, fanerne tegner

   Fra sc7.2: rummet og bordet, hverdagsstofferne, pH-metret med
   elektroden og reagensflasken. Nyt her: regnevejen (stationerne
   [OH⁻], [H₃O⁺], pH og c med pilene imellem) og etiketten, hvor
   svarene skrives. Funktionerne tegner én ting et bestemt sted og
   husker intet selv; fanen bestemmer, hvor tingene staar.

   Tekst med haevet og saenket skrift skrives "10^{−pH}" og "K_{w}".
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    /* Farverne paa regnevejen: H₃O⁺ roed og OH⁻ blaa som i sc7.2 */
    T.FARVE = { h: "#e8574a", oh: "#3d8fe0", ph: "#f2c53d", c: "#b58be8" };
    var GUL = "#f2c53d", GROEN = "#5fd394";

    /* ----- Rummet og bordet (som sc7.2) -------------------------------------- */
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
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Tekst med haevet og saenket skrift -------------------------------- */
    function segmenter(tekst) {
        var ud = [], re = /([\^_])\{([^}]*)\}/g, sidst = 0, m;
        while ((m = re.exec(tekst))) {
            if (m.index > sidst) ud.push({ t: tekst.slice(sidst, m.index), s: 0 });
            ud.push({ t: m[2], s: m[1] === "^" ? 1 : -1 });
            sidst = re.lastIndex;
        }
        if (sidst < tekst.length) ud.push({ t: tekst.slice(sidst), s: 0 });
        return ud;
    }

    T.formelBredde = function (ctx, tekst, px, vaegt) {
        var b = 0;
        ctx.save();
        segmenter(tekst).forEach(function (s) {
            ctx.font = font(vaegt || "700", s.s ? px * 0.72 : px);
            b += ctx.measureText(s.t).width;
        });
        ctx.restore();
        return b;
    };

    /* y er midten af linjen. v: { px, vaegt, farve, justering, kant } */
    T.formel = function (ctx, tekst, x, y, v) {
        v = v || {};
        var px = v.px || 14, vaegt = v.vaegt || "700";
        var b = T.formelBredde(ctx, tekst, px, vaegt);
        var x0 = v.justering === "center" ? x - b / 2 : (v.justering === "right" ? x - b : x);
        ctx.save();
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.lineJoin = "round";
        segmenter(tekst).forEach(function (s) {
            var p = s.s ? px * 0.72 : px;
            var dy = s.s === 1 ? -px * 0.36 : (s.s === -1 ? px * 0.26 : 0);
            ctx.font = font(vaegt, p);
            if (v.kant) {
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = "rgba(10, 10, 16, 0.85)";
                ctx.strokeText(s.t, x0, y + dy);
            }
            ctx.fillStyle = v.farve || "#ffffff";
            ctx.fillText(s.t, x0, y + dy);
            x0 += ctx.measureText(s.t).width;
        });
        ctx.restore();
        return b;
    };

    /* Den stoerste skrift, hvor formlen er hoejst b bred */
    T.formelPx = function (ctx, tekst, b, stoerst, mindst, vaegt) {
        var px = stoerst;
        while (px > mindst && T.formelBredde(ctx, tekst, px, vaegt) > b) px -= 0.5;
        return px;
    };

    /* ----- Regnevejen -------------------------------------------------------------
       En station: { id, x, y, b, h, navn, status, puls }
         status: slukket, neutral, givet, maal, loest
       En pil: { x0, y0, x1, y1, status, etiket, side, lys }
         status: slukket, klar, aktiv, brugt
         etiket: formlen, eller null, saa laenge eleven ikke har den */
    T.station = function (ctx, s, tid) {
        var farve = T.FARVE[s.id] || "#dde3ea";
        var puls = 0.5 + 0.5 * Math.sin(tid * 5);
        ctx.save();
        if (s.status === "slukket") ctx.globalAlpha *= 0.28;
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, s.x - s.b / 2 + 2, s.y - s.h / 2 + 3, s.b, s.h, 9);
        ctx.fill();
        ctx.fillStyle = s.status === "givet" ? "#39404f" : "#1f222b";
        NK.rundtRekt(ctx, s.x - s.b / 2, s.y - s.h / 2, s.b, s.h, 9);
        ctx.fill();
        if (s.status === "givet") {
            ctx.fillStyle = farve;
            ctx.globalAlpha *= 0.22;
            ctx.fill();
            ctx.globalAlpha /= 0.22;
        }
        ctx.lineWidth = s.status === "maal" ? 2.5 + 1.5 * puls : (s.lys ? 3 : 2);
        ctx.strokeStyle = s.status === "maal" ? GUL : (s.status === "loest" ? GROEN : (s.lys ? GUL : farve));
        NK.rundtRekt(ctx, s.x - s.b / 2, s.y - s.h / 2, s.b, s.h, 9);
        ctx.stroke();
        var px = T.formelPx(ctx, s.navn, s.b - 14, NK.klamp(s.h * 0.42, 12, 22), 10, "800");
        T.formel(ctx, s.navn, s.x, s.y + 1, { px: px, vaegt: "800", farve: "#ffffff", justering: "center" });

        /* Maerket i hjoernet: ? paa maalet, ✓ naar det er regnet, givet */
        var mx = s.x + s.b / 2 - 2, my = s.y - s.h / 2 + 2;
        if (s.status === "maal" || s.status === "loest") {
            ctx.fillStyle = s.status === "maal" ? GUL : GROEN;
            ctx.beginPath();
            ctx.arc(mx, my, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#1c1f26";
            ctx.font = font("800", 13);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(s.status === "maal" ? "?" : "✓", mx, my + 1);
        }
        ctx.restore();
    };

    T.vejPil = function (ctx, p, tid) {
        var st = p.status;
        var puls = 0.5 + 0.5 * Math.sin(tid * 5);
        var farve = st === "aktiv" ? GUL : (st === "brugt" ? GROEN : (st === "klar" ? "rgba(221, 227, 234, 0.55)" : "rgba(221, 227, 234, 0.14)"));
        if (p.lys && st !== "aktiv") farve = GUL;
        var dx = p.x1 - p.x0, dy = p.y1 - p.y0, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var ux = dx / l, uy = dy / l;
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = st === "aktiv" ? 3 + puls : 2.2;
        ctx.lineCap = "round";
        if (st === "aktiv") {
            ctx.setLineDash([9, 7]);
            ctx.lineDashOffset = -(tid * 30 % 16);
        }
        ctx.beginPath();
        ctx.moveTo(p.x0, p.y0);
        ctx.lineTo(p.x1 - ux * 9, p.y1 - uy * 9);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(p.x1, p.y1);
        ctx.lineTo(p.x1 - ux * 13 - uy * 7, p.y1 - uy * 13 + ux * 7);
        ctx.lineTo(p.x1 - ux * 13 + uy * 7, p.y1 - uy * 13 - ux * 7);
        ctx.closePath();
        ctx.fill();

        /* Formlen, eller et ? paa den pil, man skal ad nu */
        var tekst = p.etiket || (st === "aktiv" ? "?" : "");
        if (tekst && st !== "slukket") {
            var mx = (p.x0 + p.x1) / 2, my = (p.y0 + p.y1) / 2;
            var px = p.px || 14;
            var lodret = Math.abs(dy) > Math.abs(dx);
            var tf = st === "brugt" ? "#b8f0cf" : (st === "aktiv" || p.lys ? "#fff1bf" : "#dde3ea");
            if (lodret) {
                T.formel(ctx, tekst, mx + 10, my, { px: px, farve: tf, justering: "left", kant: true });
            } else {
                var y = p.side === "under" ? my + px * 0.95 : my - px * 0.95;
                T.formel(ctx, tekst, mx, y, { px: px, farve: tf, justering: "center", kant: true });
            }
        }
        ctx.restore();
    };

    /* Vejen, der mangler: svag, stiplet og uden pilespids, med et ? paa midten */
    T.vejMangler = function (ctx, p, px, tid) {
        var puls = 0.5 + 0.5 * Math.sin((tid || 0) * 4);
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.25 + 0.2 * puls) + ")";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 7]);
        ctx.beginPath();
        ctx.moveTo(p.x0, p.y0);
        ctx.lineTo(p.x1, p.y1);
        ctx.stroke();
        ctx.setLineDash([]);
        var mx = (p.x0 + p.x1) / 2, my = (p.y0 + p.y1) / 2;
        ctx.fillStyle = "#1f222b";
        ctx.beginPath();
        ctx.arc(mx, my, px * 0.85, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = GUL;
        ctx.font = font("800", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", mx, my + 1);
        ctx.restore();
    };

    /* ----- Hverdagsstofferne (som sc7.2) ---------------------------------------- */
    T.stofBredde = function (h) { return h * 100 / 120; };

    T.stof = function (ctx, id, cx, bund, h, v) {
        v = v || {};
        var b = T.stofBredde(h);
        var top = bund - h * 118 / 120;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (v.lys) {
            var g = ctx.createRadialGradient(cx, bund - h * 0.45, h * 0.1, cx, bund - h * 0.45, h * 0.62);
            g.addColorStop(0, "rgba(242, 197, 61, " + (0.4 * v.lys) + ")");
            g.addColorStop(1, "rgba(242, 197, 61, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(cx - h * 0.7, bund - h * 1.1, h * 1.4, h * 1.2);
        }
        NK.Sprites.tegn(ctx, id, cx - b / 2, top, b, h);
        ctx.restore();
    };

    /* Navnet under et stof */
    T.navn = function (ctx, tekst, cx, y, px, v) {
        v = v || {};
        NK.tekst(ctx, tekst, cx, y, {
            font: font(v.vaegt || "700", px), justering: "center", linje: "top",
            farve: v.farve || "#dde3ea", kant: true, kantBredde: 3
        });
    };

    /* ----- pH-metret og elektroden (som sc7.2) ------------------------------------- */
    T.phmeter = function (ctx, x, bund, h, tekst, v) {
        v = v || {};
        var m = MAAL.phmeter, k = h / m.h, b = m.b * k;
        var x0 = x - b / 2, y0 = bund - h;
        NK.Sprites.tegn(ctx, "phmeter", x0, y0, b, h);
        var dx = x0 + m.displayX * k, dy = y0 + m.displayY * k;
        ctx.save();
        ctx.fillStyle = "#26311f";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var s = NK.passendeSkrift(ctx, tekst, m.displayB * k * 0.86, m.displayH * k * 0.62, 9, "700");
        ctx.font = "700 " + s + "px Consolas, 'Courier New', monospace";
        ctx.fillText(tekst, dx + 3 * k, dy + 3 * k);
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 - 3, y0 - 3, b + 6, h + 6, 14 * k + 3);
            ctx.stroke();
        }
        ctx.restore();
        return { x: x0 + m.ledning.x * k, y: y0 + m.ledning.y * k };
    };

    T.elektrode = function (ctx, fra, x, y, l) {
        var top = y - l;
        ctx.save();
        ctx.strokeStyle = "#2a2d33";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.bezierCurveTo(fra.x, fra.y - 60, x, top - 70, x, top);
        ctx.stroke();
        ctx.fillStyle = "#2a2d33";
        NK.rundtRekt(ctx, x - 4, top - 4, 8, l * 0.28 + 4, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(220, 236, 248, 0.35)";
        ctx.strokeStyle = "rgba(220, 236, 248, 0.9)";
        ctx.lineWidth = 1.3;
        NK.rundtRekt(ctx, x - 3.5, top + l * 0.28, 7, l * 0.72 - 5, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Reagensflasken (som sc7.2) ---------------------------------------------
       Bunden i (cx, bund), bredden b. linjer: etikettens tekst [{ t, px, vaegt }] */
    T.flaske = function (ctx, cx, bund, b, linjer, farve, v) {
        v = v || {};
        var m = MAAL.flaske, k = b / m.b, h = m.h * k;
        var x0 = cx - b / 2, y0 = bund - m.bund * k;
        ctx.save();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 + 4 * k, y0 + 18 * k, b - 8 * k, (m.bund - 14) * k, 12 * k);
            ctx.stroke();
        }
        ctx.fillStyle = farve || "rgba(214, 234, 248, 0.22)";
        NK.rundtRekt(ctx, x0 + m.indV * k, y0 + 58 * k, (m.indH - m.indV) * k, (m.indBund - 58) * k, 8 * k);
        ctx.fill();
        ctx.restore();
        NK.Sprites.tegn(ctx, "flaske", x0, y0, b, h);
        var ex = x0 + (m.etiketV + m.etiketH) / 2 * k;
        var eb = (m.etiketH - m.etiketV) * k;
        var ialt = 0;
        linjer.forEach(function (l) { ialt += l.px * 1.2; });
        var y = y0 + (m.etiketTop + m.etiketBund) / 2 * k - ialt / 2;
        linjer.forEach(function (l) {
            ctx.save();
            ctx.fillStyle = l.farve || "#1c1f26";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            NK.passendeSkrift(ctx, l.t, eb * 0.9, l.px, 8, l.vaegt || "700");
            ctx.fillText(l.t, ex, y);
            ctx.restore();
            y += l.px * 1.2;
        });
        return { x: x0, y: y0, b: b, h: h, halsY: y0 + 22 * k };
    };

    /* ----- Etiketten ---------------------------------------------------------------
       Et lyst kort med et hul og en snor hen til glasset. linjer:
         [{ navn, vaerdi, trykt, ny, maal }]
       trykt: vaerdien er givet (sort tryk); ellers er den skrevet af eleven
       (blaa skrift) og toner frem med ny (0-1). maal: den, der skal regnes nu.
       Returnerer kortets rektangel. */
    T.etiketMaal = function (ctx, linjer, px) {
        var b = 0;
        ctx.save();
        linjer.forEach(function (l) {
            ctx.font = font("700", px);
            var foer = ctx.measureText(l.navn + " = ").width;
            ctx.font = "italic 700 " + (px + 1) + "px " + SKRIFT;
            var vaerdi = l.vaerdi ? ctx.measureText(l.vaerdi).width : px * 3.2;
            b = Math.max(b, foer + vaerdi);
        });
        ctx.restore();
        return { b: b + 34, h: linjer.length * px * 1.75 + 14 };
    };

    T.etiket = function (ctx, x, y, linjer, px, snor, tid) {
        var maal = T.etiketMaal(ctx, linjer, px);
        var b = maal.b, h = maal.h;
        ctx.save();
        if (snor) {
            ctx.strokeStyle = "rgba(236, 232, 221, 0.7)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 12);
            ctx.quadraticCurveTo((x + snor.x) / 2, Math.max(y, snor.y) + 18, snor.x, snor.y);
            ctx.stroke();
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, x + 3, y + 4, b, h, 5);
        ctx.fill();
        ctx.fillStyle = "#f4f1e8";
        NK.rundtRekt(ctx, x, y, b, h, 5);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#1b1d24";
        ctx.beginPath();
        ctx.arc(x + 10, y + 12, 3.2, 0, Math.PI * 2);
        ctx.fill();

        var puls = 0.5 + 0.5 * Math.sin((tid || 0) * 5);
        var ly = y + 7 + px * 0.95;
        linjer.forEach(function (l) {
            var tx = x + 22;
            ctx.textBaseline = "middle";
            ctx.textAlign = "left";
            ctx.font = font("700", px);
            ctx.fillStyle = "#2a2d35";
            var foer = l.navn + " = ";
            ctx.fillText(foer, tx, ly);
            tx += ctx.measureText(foer).width;
            if (l.vaerdi) {
                ctx.save();
                ctx.globalAlpha *= l.trykt ? 1 : NK.klamp(l.ny === undefined ? 1 : l.ny, 0, 1);
                ctx.font = l.trykt ? font("700", px) : "italic 700 " + (px + 1) + "px " + SKRIFT;
                ctx.fillStyle = l.trykt ? "#2a2d35" : (l.vist ? "#9a6a00" : "#1f4fa0");
                ctx.fillText(l.vaerdi, tx, ly);
                ctx.restore();
            } else {
                var fb = px * 3.2;
                ctx.fillStyle = l.maal ? "rgba(242, 197, 61, " + (0.35 + 0.35 * puls) + ")" : "rgba(0, 0, 0, 0.08)";
                NK.rundtRekt(ctx, tx, ly - px * 0.7, fb, px * 1.4, 4);
                ctx.fill();
                ctx.fillStyle = "#6b6450";
                ctx.textAlign = "center";
                ctx.fillText("?", tx + fb / 2, ly + 1);
            }
            ly += px * 1.75;
        });
        ctx.restore();
        return { x: x, y: y, b: b, h: h };
    };

    /* Buet, stiplet pil, der viser vejen (som sc7.2) */
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

    NK.Tegn = T;
}());

/* =====================================================================
   tegning.js - tegnehjaelpere til scenen (NK.Tg)

   Polygoner (vaeske i glas), gule skilte og ringe, knapper paa
   laerredet, etiketter og smaa talbobler. Alt tegnes i verdens
   koordinater; js/sim.js har allerede sat skala og forskydning paa ctx.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SKRIFT = "'Segoe UI', Tahoma, sans-serif";

    /* ----- Polygoner ------------------------------------------------------ */

    /* Punkterne [[x, y], ...] flyttet og skaleret (og evt. drejet v om (ox, oy)) */
    function flyt(pkt, x0, y0, s, v, ox, oy) {
        var c = Math.cos(v || 0), si = Math.sin(v || 0);
        return pkt.map(function (p) {
            var x = x0 + p[0] * s, y = y0 + p[1] * s;
            if (v) {
                var dx = x - ox, dy = y - oy;
                x = ox + dx * c - dy * si;
                y = oy + dx * si + dy * c;
            }
            return [x, y];
        });
    }

    function areal(pkt) {
        var a = 0;
        for (var i = 0, j = pkt.length - 1; i < pkt.length; j = i++) {
            a += (pkt[j][0] + pkt[i][0]) * (pkt[j][1] - pkt[i][1]);
        }
        return Math.abs(a / 2);
    }

    /* Den del af polygonen, der ligger under linjen y = h (stoerre y) */
    function under(pkt, h) {
        var ud = [];
        for (var i = 0; i < pkt.length; i++) {
            var a = pkt[i], b = pkt[(i + 1) % pkt.length];
            var aInde = a[1] >= h, bInde = b[1] >= h;
            if (aInde) ud.push(a);
            if (aInde !== bInde) {
                var t = (h - a[1]) / (b[1] - a[1]);
                ud.push([a[0] + (b[0] - a[0]) * t, h]);
            }
        }
        return ud;
    }

    /* Den hoejde, hvor andelen f af polygonens areal ligger under */
    function niveau(pkt, f) {
        var minY = Infinity, maxY = -Infinity;
        pkt.forEach(function (p) { minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]); });
        if (f <= 0) return maxY;
        if (f >= 1) return minY;
        var A = areal(pkt), lo = minY, hi = maxY;
        for (var i = 0; i < 28; i++) {
            var m = (lo + hi) / 2;
            if (areal(under(pkt, m)) / A > f) lo = m; else hi = m;
        }
        return (lo + hi) / 2;
    }

    function sti(ctx, pkt) {
        ctx.beginPath();
        pkt.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); });
        ctx.closePath();
    }

    /* Fylder andelen f af glassets inderside med farven. Giver
       vaeskens overflade (y) og polygonen under den. */
    function fyld(ctx, pkt, f, farve) {
        if (f <= 0.0005) return null;
        var y = niveau(pkt, f);
        var del = under(pkt, y);
        if (del.length < 3) return null;
        sti(ctx, del);
        ctx.fillStyle = farve;
        ctx.fill();
        /* Overfladen som en lys streg */
        var xs = del.filter(function (p) { return Math.abs(p[1] - y) < 0.01; }).map(function (p) { return p[0]; });
        if (xs.length >= 2) {
            ctx.save();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(Math.min.apply(null, xs), y);
            ctx.lineTo(Math.max.apply(null, xs), y);
            ctx.stroke();
            ctx.restore();
        }
        return { y: y, pkt: del };
    }

    /* ----- Farver ------------------------------------------------------------- */
    function bland(a, b, t) {
        t = NK.klamp(t, 0, 1);
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
    }

    function rgba(c, gange) {
        var a = c[3] * (gange === undefined ? 1 : gange);
        return "rgba(" + Math.round(c[0]) + ", " + Math.round(c[1]) + ", " + Math.round(c[2]) + ", " + a.toFixed(3) + ")";
    }

    /* ----- Det gule skilt med en lille spids ned mod (x, y) ---------------------- */
    function skilt(ctx, x, y, tekst, t, opad) {
        ctx.save();
        ctx.font = "700 14px " + SKRIFT;
        var b = ctx.measureText(tekst).width + 20, h = 26;
        var hop = Math.sin((t || 0) * 3.2) * 2.5;
        var bx = x - b / 2, by = opad ? y + 10 + hop : y - h - 10 + hop;
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#ffdf6b";
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        if (opad) { ctx.moveTo(x - 7, by); ctx.lineTo(x, by - 7); ctx.lineTo(x + 7, by); }
        else { ctx.moveTo(x - 7, by + h); ctx.lineTo(x, by + h + 7); ctx.lineTo(x + 7, by + h); }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#c79a12";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, bx, by, b, h, 7);
        ctx.stroke();
        ctx.fillStyle = "#33290a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, by + h / 2 + 0.5);
        ctx.restore();
        return { x: bx, y: by, b: b, h: h };
    }

    /* En gul ring om en kasse, der pulserer stille */
    function ring(ctx, k, t, rolig) {
        if (!k) return;
        ctx.save();
        var p = rolig ? 0.5 : 0.5 + 0.5 * Math.sin((t || 0) * 4);
        ctx.strokeStyle = "rgba(242, 197, 61, " + (0.55 + 0.4 * p).toFixed(3) + ")";
        ctx.lineWidth = 2.5 + 1.5 * p;
        ctx.setLineDash([]);
        NK.rundtRekt(ctx, k.x - 6, k.y - 6, k.b + 12, k.h + 12, 10);
        ctx.stroke();
        ctx.restore();
    }

    /* En knap paa laerredet (Sug op, Toem) */
    function pille(ctx, k, tekst, aktiv, trykket) {
        ctx.save();
        ctx.fillStyle = trykket ? "#ffd23e" : (aktiv ? "#ffdf6b" : "#3d4150");
        ctx.strokeStyle = aktiv ? "#c79a12" : "#5e6272";
        ctx.lineWidth = 1.5;
        NK.rundtRekt(ctx, k.x, k.y, k.b, k.h, k.h / 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = aktiv ? "#33290a" : "#c8ced6";
        ctx.font = "700 12.5px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, k.x + k.b / 2, k.y + k.h / 2 + 0.5);
        ctx.restore();
    }

    /* En moerk talboble med hvid tekst (aflaesning ved et glas) */
    function boble(ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.vaegt || "700") + " " + (opt.str || 14) + "px " + SKRIFT;
        var b = ctx.measureText(tekst).width + 14, h = (opt.str || 14) + 10;
        var bx = opt.venstre ? x : (opt.hoejre ? x - b : x - b / 2), by = y - h / 2;
        ctx.fillStyle = opt.bund || "rgba(16, 18, 24, 0.88)";
        ctx.strokeStyle = opt.kant || "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = opt.farve || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, by + h / 2 + 0.5);
        ctx.restore();
        return { x: bx, y: by, b: b, h: h };
    }

    /* Etiket paa en flaske: hvidt papir med en eller to linjer */
    function etiket(ctx, x, y, b, h, linjer, opt) {
        opt = opt || {};
        ctx.save();
        ctx.fillStyle = "#f4f1e8";
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 0.8;
        NK.rundtRekt(ctx, x, y, b, h, 3);
        ctx.fill();
        ctx.stroke();
        if (opt.fare) {
            ctx.fillStyle = "#d8342a";
            ctx.fillRect(x, y + h - 7, b, 7);
            ctx.fillStyle = "#ffffff";
            ctx.font = "800 6px " + SKRIFT;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("ÆTSENDE", x + b / 2, y + h - 3.3);
        }
        ctx.fillStyle = "#1f2329";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var str = opt.str || 10.5;
        ctx.font = "800 " + str + "px " + SKRIFT;
        var top = y + (h - (opt.fare ? 7 : 0)) / 2 - (linjer.length - 1) * (str * 0.6);
        linjer.forEach(function (l, i) {
            if (i === 1) ctx.font = "700 " + (str * 0.92) + "px " + SKRIFT;
            ctx.fillText(l, x + b / 2, top + i * str * 1.2);
        });
        ctx.restore();
    }

    /* Tekst i laerredet */
    function tekst(ctx, s, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + SKRIFT;
        ctx.fillStyle = opt.farve || "#dfe4ea";
        ctx.textAlign = opt.just || "center";
        ctx.textBaseline = opt.base || "middle";
        ctx.fillText(s, x, y);
        ctx.restore();
    }

    /* En gennemsigtig strøm af vaeske fra (x1, y1) ned til (x2, y2) */
    function stroem(ctx, x1, y1, x2, y2, farve, bredde) {
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.lineWidth = bredde || 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(x1 + (x2 - x1) * 0.15, y1 + (y2 - y1) * 0.6, x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    /* Tegner et sprite drejet v om punktet (ox, oy) i verden.
       (x, y) er spritets oeverste venstre hjoerne uden drejning. */
    function drejetSprite(ctx, navn, x, y, s, v, ox, oy) {
        if (!v) { NK.Sprites.tegn(ctx, navn, x, y, s); return; }
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(v);
        ctx.translate(-ox, -oy);
        NK.Sprites.tegn(ctx, navn, x, y, s);
        ctx.restore();
    }

    NK.Tg = {
        SKRIFT: SKRIFT,
        flyt: flyt,
        areal: areal,
        under: under,
        niveau: niveau,
        sti: sti,
        fyld: fyld,
        bland: bland,
        rgba: rgba,
        skilt: skilt,
        ring: ring,
        pille: pille,
        boble: boble,
        etiket: etiket,
        tekst: tekst,
        stroem: stroem,
        drejetSprite: drejetSprite
    };
}());

/* =====================================================================
   glas.js - det, alle tre faner tegner

   NK.Tegn samler tegningen af udstyret og graferne:
     bord(ctx, W, H, y)                     laboratoriebordet
     papir(ctx, cx, y, b)                   papiret med krydset, set fra siden
     baeger(ctx, cx, y, b, o)               baegerglasset med vaesken
     oeje(ctx, x, y, r, o)                  oejet, der kigger ned i glasset
     maaleglas(ctx, p, h, ml)               maaleglasset i positur p
     termometer(ctx, x, y, h, T)            termometeret med soejlen
     oppefra(ctx, cx, cy, r, o)             krydset set oppefra gennem vaesken
     stopur(ctx, cx, cy, r, t, o)           stopuret
     akser(ctx, g, o)                       akser til en graf; giver X() og Y()
   Vaeskens uklarhed kommer fra modellens kontrast: 1 er klar vaeske,
   og tallet falder mod 0, efterhaanden som svovlet dannes.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SKRIFT = "'Segoe UI', sans-serif";

    var T = {
        SKRIFT: SKRIFT,
        MAELK: "240, 235, 208",           /* svovl i vand: blegt gulhvidt */
        PAPIR: "#ece8dd",
        KRYDS: "#1c1c22",
        FARVER: ["#f0a830", "#5fb6f0", "#57d18c", "#c9a6ff", "#ff8a80", "#f2e06b", "#7fe0d8", "#ffb36b"]
    };

    T.farve = function (nr) {
        return T.FARVER[(nr - 1) % T.FARVER.length];
    };

    /* Er punktet p inde i rektanglet r = { x, y, b, h }? */
    T.inde = function (p, r, luft) {
        var m = luft || 0;
        return !!r && p.x >= r.x - m && p.x <= r.x + r.b + m && p.y >= r.y - m && p.y <= r.y + r.h + m;
    };

    /* ----- Bordet ------------------------------------------------------ */
    T.bord = function (ctx, W, H, y) {
        var g = ctx.createLinearGradient(0, y, 0, H);
        g.addColorStop(0, "#353b44");
        g.addColorStop(0.08, "#2a2f36");
        g.addColorStop(1, "#1d2127");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, W, H - y);
        ctx.fillStyle = "rgba(255, 255, 255, 0.10)";
        ctx.fillRect(0, y, W, 1.5);
    };

    /* ----- Papiret med krydset, set skraat fra siden ------------------- */
    T.papir = function (ctx, cx, y, b) {
        var d = b * 0.09, sk = b * 0.05;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.moveTo(cx - b / 2 + sk + 4, y - d + 5);
        ctx.lineTo(cx + b / 2 + sk + 4, y - d + 5);
        ctx.lineTo(cx + b / 2 - sk + 4, y + d + 5);
        ctx.lineTo(cx - b / 2 - sk + 4, y + d + 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = T.PAPIR;
        ctx.beginPath();
        ctx.moveTo(cx - b / 2 + sk, y - d);
        ctx.lineTo(cx + b / 2 + sk, y - d);
        ctx.lineTo(cx + b / 2 - sk, y + d);
        ctx.lineTo(cx - b / 2 - sk, y + d);
        ctx.closePath();
        ctx.fill();
        /* Krydset: fladt, fordi papiret ses skraat */
        var a = b * 0.13, h = d * 0.45;
        ctx.strokeStyle = T.KRYDS;
        ctx.lineWidth = Math.max(2, b * 0.016);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx - a, y - h); ctx.lineTo(cx + a, y + h);
        ctx.moveTo(cx + a, y - h); ctx.lineTo(cx - a, y + h);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Baegerglasset --------------------------------------------------
       cx: midten, y: hvor glasset staar, b: glassets bredde.
       o = { ml, kontrast } - vaesken tegnes bag spritet. Fra siden gaar
       lyset laengere gennem vaesken end oppefra, saa glasset ser
       maelket ud lidt foer krydset forsvinder. Giver glassets maal. */
    T.baeger = function (ctx, cx, y, b, o) {
        o = o || {};
        var k = b / 200, h = 220 * k;
        var x0 = cx - b / 2, y0 = y - 211 * k;
        var g = {
            x: x0, y: y0, b: b, h: h, k: k,
            indX0: x0 + 21 * k, indX1: x0 + 179 * k, bund: y0 + 209 * k,
            top: function (ml) { return y0 + (209 - 1.6 * ml) * k; }
        };
        var ml = o.ml || 0;
        if (ml > 0) {
            var top = g.top(ml), r = 7 * k;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(g.indX0, top);
            ctx.lineTo(g.indX1, top);
            ctx.lineTo(g.indX1, g.bund - r);
            ctx.quadraticCurveTo(g.indX1, g.bund, g.indX1 - r, g.bund);
            ctx.lineTo(g.indX0 + r, g.bund);
            ctx.quadraticCurveTo(g.indX0, g.bund, g.indX0, g.bund - r);
            ctx.closePath();
            ctx.fillStyle = "rgba(160, 205, 235, 0.14)";
            ctx.fill();
            var kontrast = o.kontrast === undefined ? 1 : o.kontrast;
            var uklar = 1 - Math.pow(NK.klamp(kontrast, 0, 1), 1.4);
            if (uklar > 0.002) {
                ctx.fillStyle = "rgba(" + T.MAELK + ", " + (0.93 * uklar).toFixed(3) + ")";
                ctx.fill();
            }
            /* Overfladen */
            ctx.fillStyle = "rgba(230, 244, 252, 0.35)";
            ctx.fillRect(g.indX0, top - 1, g.indX1 - g.indX0, 2);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "baegerglas", x0, y0, b, h);
        return g;
    };

    /* ----- Oejet, der kigger ned --------------------------------------- */
    T.oeje = function (ctx, x, y, r, o) {
        o = o || {};
        ctx.save();
        ctx.translate(x, y);
        /* Oejets form */
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.quadraticCurveTo(0, -r * 0.85, r, 0);
        ctx.quadraticCurveTo(0, r * 0.85, -r, 0);
        ctx.closePath();
        ctx.fillStyle = "#f4f1ea";
        ctx.fill();
        ctx.save();
        ctx.clip();
        /* Iris og pupil kigger nedad */
        ctx.fillStyle = "#4d7fa8";
        ctx.beginPath(); ctx.arc(0, r * 0.2, r * 0.42, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#111";
        ctx.beginPath(); ctx.arc(0, r * 0.24, r * 0.19, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath(); ctx.arc(-r * 0.12, r * 0.1, r * 0.07, 0, Math.PI * 2); ctx.fill();
        /* Oejenlaag */
        ctx.fillStyle = "rgba(60, 50, 45, 0.25)";
        ctx.fillRect(-r, -r, 2 * r, r * 0.55);
        ctx.restore();
        ctx.strokeStyle = o.lys ? "#f2c53d" : "#c8ced6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.quadraticCurveTo(0, -r * 0.85, r, 0);
        ctx.quadraticCurveTo(0, r * 0.85, -r, 0);
        ctx.stroke();
        /* Vipper */
        ctx.lineCap = "round";
        for (var i = -2; i <= 2; i++) {
            var vx = i * r * 0.32, vy = -r * 0.42 + Math.abs(i) * r * 0.06;
            ctx.beginPath();
            ctx.moveTo(vx, vy);
            ctx.lineTo(vx * 1.25, vy - r * 0.28);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Maaleglasset ---------------------------------------------------
       p = { x, y, v }: foden midt forneden og vinklen. h er hoejden.
       Naar glasset haeldes, glider vaesken op mod tuden. */
    T.MAALEGLAS_ANKER = { x: 30, y: 249 };
    T.maaleglas = function (ctx, p, h, ml, o) {
        o = o || {};
        var k = h / 260;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.scale(k, k);
        ctx.translate(-30, -249);
        if (ml > 0.01) {
            var a = NK.klamp(Math.abs(p.v) / 1.6, 0, 1);
            var hoejde = 18 * ml;
            var top = NK.lerp(222 - hoejde, 12, a);
            ctx.fillStyle = "rgba(170, 215, 240, 0.30)";
            ctx.fillRect(19, top, 22, hoejde);
            ctx.fillStyle = "rgba(230, 244, 252, 0.45)";
            ctx.fillRect(19, a < 0.5 ? top - 1 : top + hoejde - 1, 22, 2);
        }
        NK.Sprites.tegn(ctx, "maaleglas", 0, 0, 60, 260);
        if (o.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.8)";
            ctx.lineWidth = 3 / k;
            NK.rundtRekt(ctx, 2, 0, 56, 252, 8);
            ctx.stroke();
        }
        ctx.restore();
        /* Etiketten tegnes i skaermens maal, saa skriften kan laeses */
        if (o.etiket && Math.abs(p.v) < 0.05) {
            var e = NK.tilVerden(p, { x: 30 * k, y: 249 * k }, 30 * k, 185 * k);
            ctx.save();
            ctx.fillStyle = "rgba(245, 243, 236, 0.96)";
            NK.rundtRekt(ctx, e.x - 25, e.y - 19, 50, 38, 4);
            ctx.fill();
            ctx.fillStyle = "#1b1b21";
            ctx.textAlign = "center";
            ctx.font = "700 14px " + SKRIFT;
            ctx.fillText("HCl", e.x, e.y - 3);
            ctx.font = "600 12px " + SKRIFT;
            ctx.fillText("1,0 M", e.x, e.y + 12);
            ctx.restore();
        }
    };

    /* Tudens plads i verden, naar maaleglasset staar i positur p */
    T.maaleglasTud = function (p, h) {
        var k = h / 260;
        return NK.tilVerden(p, { x: 30 * k, y: 249 * k }, 45 * k, 7 * k);
    };

    /* ----- Termometeret ---------------------------------------------------- */
    T.termometer = function (ctx, x, y, h, grader) {
        var k = h / 320;
        ctx.save();
        ctx.translate(x - 15 * k, y);
        ctx.scale(k, k);
        NK.Sprites.tegn(ctx, "termometer", 0, 0, 30, 320);
        var top = 262 - 2.2 * NK.klamp(grader, -8, 105);
        ctx.fillStyle = "#d8402f";
        ctx.fillRect(13.5, top, 3, 293 - top);
        ctx.beginPath();
        ctx.arc(15, 293, 8.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.arc(12, 290, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        return { x: x, y: y, top: y + top * k, h: h };
    };

    /* ----- Krydset set oppefra ---------------------------------------------
       o = { kontrast, vaeske, hvirvel (0-1), tid, lys }
       Vaesken ligger over krydset som et maelket lag, der daekker mere
       og mere. Kontrasten 1 er klar vaeske; ved 0,05 er krydset vaek. */
    T.oppefra = function (ctx, cx, cy, r, o) {
        o = o || {};
        var ri = r * 0.74, ro = r * 0.8;
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        /* Papiret */
        var g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
        g.addColorStop(0, "#f1eee5");
        g.addColorStop(1, "#d9d4c6");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        /* Glassets skygge paa papiret */
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.beginPath(); ctx.arc(cx + r * 0.04, cy + r * 0.05, ro + r * 0.02, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = T.PAPIR;
        ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.fill();
        /* Krydset */
        var a = r * 0.36;
        ctx.strokeStyle = T.KRYDS;
        ctx.lineWidth = r * 0.075;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx - a, cy - a); ctx.lineTo(cx + a, cy + a);
        ctx.moveTo(cx + a, cy - a); ctx.lineTo(cx - a, cy + a);
        ctx.stroke();
        /* Vaesken */
        if (o.vaeske) {
            ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(150, 200, 230, 0.10)";
            ctx.fill();
            var kontrast = o.kontrast === undefined ? 1 : NK.klamp(o.kontrast, 0, 1);
            if (kontrast < 0.999) {
                ctx.fillStyle = "rgba(" + T.MAELK + ", " + (1 - kontrast).toFixed(4) + ")";
                ctx.fill();
            }
            if (o.hvirvel > 0.01) {
                ctx.save();
                ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.clip();
                ctx.strokeStyle = "rgba(255, 255, 255, " + (0.4 * o.hvirvel).toFixed(3) + ")";
                ctx.lineWidth = r * 0.03;
                var v0 = (o.tid || 0) * 5;
                for (var i = 0; i < 3; i++) {
                    ctx.beginPath();
                    for (var j = 0; j <= 24; j++) {
                        var s = j / 24, v = v0 + i * 2.1 + s * 2.6, rr = ri * (0.2 + 0.7 * s);
                        var px = cx + Math.cos(v) * rr, py = cy + Math.sin(v) * rr;
                        if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }
                ctx.restore();
            }
        }
        /* Glassets rand */
        ctx.beginPath();
        ctx.arc(cx, cy, ro, 0, Math.PI * 2);
        ctx.arc(cx, cy, ri, 0, Math.PI * 2, true);
        ctx.fillStyle = "rgba(200, 225, 242, 0.45)";
        ctx.fill();
        ctx.strokeStyle = "rgba(120, 150, 170, 0.9)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, ro, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = r * 0.025;
        ctx.beginPath(); ctx.arc(cx, cy, (ri + ro) / 2, Math.PI * 1.08, Math.PI * 1.42); ctx.stroke();
        ctx.restore();
        /* Kanten om udsnittet */
        ctx.save();
        ctx.strokeStyle = o.lys ? "#f2c53d" : "#4a4a58";
        ctx.lineWidth = o.lys ? 3 : 2;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    };

    /* ----- Stopuret ---------------------------------------------------------
       o = { koerer, tryk (0-1: knappen trykkes), lys } */
    T.stopur = function (ctx, cx, cy, r, t, o) {
        o = o || {};
        ctx.save();
        /* Knappen foroven og oeskenen */
        var tryk = (o.tryk || 0) * r * 0.08;
        ctx.fillStyle = "#9aa4ae";
        ctx.fillRect(cx - r * 0.1, cy - r * 1.2 + tryk, r * 0.2, r * 0.18);
        ctx.fillStyle = "#c3cad1";
        NK.rundtRekt(ctx, cx - r * 0.2, cy - r * 1.3 + tryk, r * 0.4, r * 0.14, r * 0.05);
        ctx.fill();
        ctx.strokeStyle = "#7b858f";
        ctx.lineWidth = r * 0.07;
        ctx.beginPath(); ctx.arc(cx, cy - r * 1.05, r * 0.12, Math.PI, 0); ctx.stroke();
        /* Kassen */
        var g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        g.addColorStop(0, "#e1e6eb");
        g.addColorStop(0.5, "#9aa4ae");
        g.addColorStop(1, "#5d6771");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = o.lys ? "#f2c53d" : "#2f353c";
        ctx.lineWidth = o.lys ? 3 : 1.5;
        ctx.stroke();
        /* Skiven */
        ctx.fillStyle = "#f5f3ec";
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.86, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#1b1b21";
        for (var i = 0; i < 60; i++) {
            var v = i / 60 * Math.PI * 2 - Math.PI / 2, lang = i % 5 === 0;
            ctx.lineWidth = lang ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(v) * r * (lang ? 0.66 : 0.74), cy + Math.sin(v) * r * (lang ? 0.66 : 0.74));
            ctx.lineTo(cx + Math.cos(v) * r * 0.82, cy + Math.sin(v) * r * 0.82);
            ctx.stroke();
        }
        ctx.fillStyle = "#1b1b21";
        ctx.font = "700 " + Math.max(12, Math.round(r * 0.2)) + "px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        [[15, 1, 0], [30, 0, 1], [45, -1, 0], [60, 0, -1]].forEach(function (n) {
            ctx.fillText(String(n[0]), cx + n[1] * r * 0.46, cy + n[2] * r * 0.46);
        });
        /* Viseren */
        var vv = (t % 60) / 60 * Math.PI * 2 - Math.PI / 2;
        ctx.strokeStyle = "#d8402f";
        ctx.lineWidth = Math.max(2, r * 0.04);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(vv) * r * 0.16, cy - Math.sin(vv) * r * 0.16);
        ctx.lineTo(cx + Math.cos(vv) * r * 0.78, cy + Math.sin(vv) * r * 0.78);
        ctx.stroke();
        ctx.fillStyle = "#d8402f";
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.07, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    /* ----- Akser ------------------------------------------------------------
       g = { x0, x1, y0, y1 } i pixels (y0 foroven).
       o = { xMaks, yMaks, xTrin, yTrin, xDec, yDec, xNavn, yNavn } */
    T.akser = function (ctx, g, o) {
        function X(x) { return g.x0 + x / o.xMaks * (g.x1 - g.x0); }
        function Y(y) { return g.y1 - NK.klamp(y, 0, o.yMaks) / o.yMaks * (g.y1 - g.y0); }
        ctx.save();
        ctx.font = "13px " + SKRIFT;
        ctx.fillStyle = "#9fa6af";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        var x, y;
        for (x = 0; x <= o.xMaks + 1e-9; x += o.xTrin) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
            ctx.beginPath(); ctx.moveTo(X(x), g.y0); ctx.lineTo(X(x), g.y1); ctx.stroke();
            ctx.fillText(NK.tal(x, o.xDec), X(x), g.y1 + 19);
        }
        ctx.textAlign = "right";
        for (y = 0; y <= o.yMaks + 1e-12; y += o.yTrin) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
            ctx.beginPath(); ctx.moveTo(g.x0, Y(y)); ctx.lineTo(g.x1, Y(y)); ctx.stroke();
            ctx.fillText(NK.tal(y, o.yDec), g.x0 - 8, Y(y) + 4);
        }
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(g.x0, g.y0 - 8); ctx.lineTo(g.x0, g.y1); ctx.lineTo(g.x1 + 8, g.y1);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.font = "600 13px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.fillText(o.xNavn, (g.x0 + g.x1) / 2, g.y1 + 40);
        ctx.textAlign = "left";
        ctx.fillText(o.yNavn, g.x0 - 4, g.y0 - 16);
        ctx.restore();
        return { X: X, Y: Y };
    };

    /* Paene akser fra 0: det stoerste tal, trinnet og antal decimaler */
    T.skala = function (maks, antal) {
        var trin = NK.paentTrin(maks, antal || 5);
        var top = Math.max(trin, Math.ceil(maks / trin - 1e-9) * trin);
        var dec = Math.max(0, -Math.floor(Math.log10(trin) + 1e-9));
        return { maks: top, trin: trin, dec: dec };
    };

    NK.Tegn = T;
}());

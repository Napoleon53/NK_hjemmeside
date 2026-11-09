/* =====================================================================
   tegning.js - tavlen, glassene, draabeflasken, pH-aksen og
   farvekortets bjaelker

   Udstyret er sprites (sprites/, se _sprites.html): reagensglas_tom.svg
   (60 x 200), draabeflaske.svg (56 x 100), baegerglas.svg (120 x 140) og
   phmeter.svg (48 x 190). Vaesken tegnes her bag glasset.

   T.tavle(ctx, lay)                 vaeggen, whiteboardet og bakken
   T.akse(ctx, a, y)                 pH-aksen fra −1 til 15 med pile
   T.bjaelke(ctx, id, a, y, h, andel)  indikatorens farver langs aksen
   T.reagensglas(ctx, r, farve, blandet)  glasset; blandet 0-1 er, hvor
                                     langt indikatoren er naaet ned
   T.flaske(ctx, tx, ty, h, id, v)   draabeflasken med indikatoren id; (tx, ty)
                                     er spidsen af pipetten, v drejningen
   T.draabe(ctx, x, y, s, farve)     en draabe
   T.baeger(ctx, r, farve)           baegerglasset med proeven
   T.phmeter(ctx, x, y, h, tekst)    pH-metret; (x, y) er spidsen
   T.skilt(ctx, x, y, tekst)         et gult skilt med pil ned mod (x, y)
   a = { x0, x1, P(ph) } er aksen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#6b7685";

    function billede(fil) { var b = new Image(); b.src = "sprites/" + fil; return b; }
    var GLAS = billede("reagensglas_tom.svg");
    var FLASKE = billede("draabeflaske.svg");
    var BAEGER = billede("baegerglas.svg");
    var METER = billede("phmeter.svg");
    function klar(b) { return b.complete && b.naturalWidth > 0; }

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;

    /* ----- Tavlen (som molekylemotorens whiteboard) -------------------------- */
    T.tavle = function (ctx, lay) {
        var W = lay.W, H = lay.H, t = lay.tavle, b = lay.bakke;
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#23232c");
        g.addColorStop(1, "#18181f");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#a9afb8";
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        ctx.restore();
        var gr = ctx.createLinearGradient(0, t.y - 6, 0, t.y + t.h + 6);
        gr.addColorStop(0, "#d3d7dd");
        gr.addColorStop(0.5, "#aab0b9");
        gr.addColorStop(1, "#c6cad1");
        ctx.fillStyle = gr;
        NK.rundtRekt(ctx, t.x - 6, t.y - 6, t.b + 12, t.h + 12, 6);
        ctx.fill();
        var fl = ctx.createLinearGradient(t.x, t.y, t.x + t.b, t.y + t.h);
        fl.addColorStop(0, "#fbfcfb");
        fl.addColorStop(0.55, "#f4f6f5");
        fl.addColorStop(1, "#eef1f0");
        ctx.fillStyle = fl;
        ctx.fillRect(t.x, t.y, t.b, t.h);
        ctx.fillStyle = "rgba(120, 132, 150, 0.18)";
        for (var y = t.y + 13; y < t.y + t.h; y += 26) {
            for (var x = t.x + 13; x < t.x + t.b; x += 26) ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        var gb = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
        gb.addColorStop(0, "#c7ccd3");
        gb.addColorStop(1, "#80868f");
        ctx.fillStyle = gb;
        NK.rundtRekt(ctx, b.x, b.y, b.b, b.h, 3);
        ctx.fill();
    };

    /* ----- Aksen ------------------------------------------------------------ */
    T.lavAkse = function (x0, x1) {
        return {
            x0: x0, x1: x1,
            P: function (ph) { return x0 + (x1 - x0) * (ph - D.PH_MIN) / (D.PH_MAKS - D.PH_MIN); },
            enhed: (x1 - x0) / (D.PH_MAKS - D.PH_MIN)
        };
    };

    function pil(ctx, x1, y1, x2, y2, farve, st) {
        var v = Math.atan2(y2 - y1, x2 - x1);
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - st * Math.cos(v - 0.45), y2 - st * Math.sin(v - 0.45));
        ctx.lineTo(x2 - st * Math.cos(v + 0.45), y2 - st * Math.sin(v + 0.45));
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /* Aksen har en pil i hver ende: skalaen fortsaetter under −1 og over 15 */
    T.akse = function (ctx, a, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.strokeStyle = DAEMPET;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(a.x0, y);
        ctx.lineTo(a.x1, y);
        ctx.stroke();
        pil(ctx, a.x0, y, a.x0 - 20, y, DAEMPET, 8);
        pil(ctx, a.x1, y, a.x1 + 20, y, DAEMPET, 8);
        var skrift = opt.skrift || (a.enhed < 30 ? 12 : 13);
        for (var p = D.PH_MIN; p <= D.PH_MAKS; p++) {
            var x = a.P(p);
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + 6);
            ctx.stroke();
            NK.tekst(ctx, D.tal(p), x, y + 19, { font: "600 " + skrift + "px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        if (opt.navn !== false) NK.tekst(ctx, "pH", a.x0 - 34, y + 19, { font: "800 14px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* ----- En bjaelke paa farvekortet ----------------------------------------
       andel 0-1: bjaelken males fra venstre (naar indikatoren lige er fundet).
       tom: kun rammen (pladsen er sat af, men indikatoren er ikke fundet) */
    T.bjaelke = function (ctx, id, a, y, h, andel, opt) {
        opt = opt || {};
        var x0 = a.x0, x1 = a.x1, r = Math.min(7, h / 2);
        ctx.save();
        NK.rundtRekt(ctx, x0, y, x1 - x0, h, r);
        if (andel > 0) {
            var g = ctx.createLinearGradient(x0, 0, x1, 0);
            D.ind(id).stop.forEach(function (s) {
                var o = (s[0] - D.PH_MIN) / (D.PH_MAKS - D.PH_MIN);
                g.addColorStop(NK.klamp(o, 0, 1), s[1]);
            });
            ctx.save();
            ctx.clip();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x0, y, x1 - x0, h);
            ctx.fillStyle = g;
            ctx.fillRect(x0, y, (x1 - x0) * NK.klamp(andel, 0, 1), h);
            ctx.restore();
            NK.rundtRekt(ctx, x0, y, x1 - x0, h, r);
            ctx.strokeStyle = opt.ramme || "#8a94a3";
            ctx.lineWidth = opt.rammeB || 1.1;
            ctx.stroke();
        } else {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(107, 118, 133, 0.45)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Farvens navn skrevet paa bjaelken, midt i hvert omraade (som i bogen) */
    T.bjaelkeNavne = function (ctx, id, a, y, h, andel) {
        var f = D.ind(id).farver, fra = D.PH_MIN, sidst = null;
        var skrift = h >= 24 ? 13 : 12;
        f.forEach(function (o) {
            var til = Math.min(o.til, D.PH_MAKS);
            if (til <= fra) { fra = til; return; }
            var midt = (fra + til) / 2;
            fra = til;
            if (o.navn === sidst) return;
            sidst = o.navn;
            var x = a.P(midt);
            if (x > a.x0 + (a.x1 - a.x0) * andel) return;
            /* De smalle omraader (orange, svagt lyserød, rød under pH 0) faar ingen tekst */
            if ((til - (midt - (til - midt))) < 1.9) return;
            var bag = K.farve(id, NK.klamp(midt, 0, 14));
            var lys = lyshed(bag) > 0.62;
            NK.tekst(ctx, o.navn, x, y + h / 2 + 1, { font: "700 " + skrift + "px " + FONT, farve: lys ? BLAEK : "#ffffff", justering: "center", linje: "middle" });
        });
    };

    function lyshed(h) {
        var c = [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
        return (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    }
    T.lyshed = lyshed;

    /* ----- Reagensglasset ------------------------------------------------------
       r { x, y, b, h } er rammen om hele glasset (spritet er 60 x 200).
       Vaesken staar fra y 96. blandet 0-1: indikatoren breder sig fra toppen
       og ned; 1 er en ensartet farve. farve null: rent vand; false: tomt. */
    T.reagensglas = function (ctx, r, farve, blandet) {
        var sx = r.b / 60, sy = r.h / 200;
        if (!(r.b > 4) || !(r.h > 12)) return;
        var x0 = r.x + 13 * sx + 1, x1 = r.x + 47 * sx - 1, cx = r.x + 30 * sx, cy = r.y + 172 * sy, rad = Math.max(1, 17 * sx - 1);
        var top = r.y + 96 * sy, bund = cy + rad;
        function vaeske() {
            ctx.beginPath();
            ctx.moveTo(x0, top);
            ctx.lineTo(x1, top);
            ctx.lineTo(x1, cy);
            ctx.arc(cx, cy, rad, 0, Math.PI);
            ctx.closePath();
        }
        if (farve === false) {
            /* Et tomt glas */
            if (klar(GLAS)) ctx.drawImage(GLAS, r.x, r.y, r.b, r.h);
            return;
        }
        ctx.save();
        vaeske();
        ctx.clip();
        fyld(ctx, x0, x1, top, bund, D.VAND);
        if (farve && blandet > 0) {
            var b = NK.klamp(blandet, 0, 1);
            if (b >= 1) fyld(ctx, x0, x1, top, bund, farve);
            else {
                /* Skyen af indikator: fuld farve oeverst, blod kant forneden */
                var kant = top + (bund - top) * b;
                var g = ctx.createLinearGradient(0, top, 0, kant + 14 * sy);
                g.addColorStop(0, farve);
                g.addColorStop(NK.klamp((kant - top) / (kant + 14 * sy - top), 0, 1) * 0.75, farve);
                g.addColorStop(1, hexA(farve, 0));
                ctx.fillStyle = g;
                ctx.fillRect(x0 - 2, top - 2, x1 - x0 + 4, kant + 14 * sy - top + 2);
                ctx.globalAlpha = 0.25 * b;
                fyld(ctx, x0, x1, top, bund, farve);
                ctx.globalAlpha = 1;
            }
        }
        /* Vaeskens overflade */
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(x0, top, x1 - x0, Math.max(1, 2 * sy));
        ctx.restore();
        if (klar(GLAS)) ctx.drawImage(GLAS, r.x, r.y, r.b, r.h);
    };

    function fyld(ctx, x0, x1, top, bund, farve) {
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        g.addColorStop(0, K.moerk(farve, 0.1));
        g.addColorStop(0.45, farve);
        g.addColorStop(1, K.moerk(farve, 0.1));
        ctx.fillStyle = g;
        ctx.fillRect(x0 - 2, top - 2, x1 - x0 + 4, bund - top + 4);
    }

    function hexA(h, a) {
        return "rgba(" + parseInt(h.substr(1, 2), 16) + ", " + parseInt(h.substr(3, 2), 16) + ", " + parseInt(h.substr(5, 2), 16) + ", " + a + ")";
    }
    T.hexA = hexA;

    /* ----- Draabeflasken -------------------------------------------------------
       Flasken placeres ved spidsen af pipetten (tx, ty) og drejes v radianer
       om den (v = 0: flasken staar op, v naer pi: den vender spidsen nedad og
       drypper). h er hoejden. id er indikatoren: etiketten (x 10-46, y 54-86
       i spritet, hvor spidsen er (28, 2) og bunden y 98) faar en stribe med
       dens farver. */
    T.FLASKE_SPIDS = 96;          /* fra spidsen ned til bunden, i spritets enheder */

    T.flaske = function (ctx, tx, ty, h, id, v, opt) {
        opt = opt || {};
        var s = h / 100, b = 56 * s;
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha = opt.alfa;
        ctx.translate(tx, ty);
        if (v) ctx.rotate(v);
        if (opt.skygge) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;
        }
        if (klar(FLASKE)) ctx.drawImage(FLASKE, -28 * s, -2 * s, b, h);
        ctx.shadowColor = "transparent";
        /* Etiketten har en lille stribe med indikatorens farver fra pH 0 til 14,
           saa flasken kan kendes paa farvekortet (navnet kan ikke laeses saa smaat) */
        if (id) {
            var x0 = -14 * s, x1 = 14 * s, y0 = 60 * s, sh = 18 * s;
            var g = ctx.createLinearGradient(x0, 0, x1, 0);
            D.ind(id).stop.forEach(function (st) { if (st[0] >= 0 && st[0] <= 14) g.addColorStop(st[0] / 14, st[1]); });
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, x0, y0, x1 - x0, sh, 2.5 * s);
            ctx.fill();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.45)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    T.draabe = function (ctx, x, y, s, farve) {
        ctx.save();
        ctx.fillStyle = farve || "#cfe0ee";
        ctx.strokeStyle = "rgba(29, 36, 51, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - s * 1.6);
        ctx.quadraticCurveTo(x + s, y, x, y + s);
        ctx.quadraticCurveTo(x - s, y, x, y - s * 1.6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Baegerglasset med proeven (r { x, y, b, h }, spritet 120 x 140) ----- */
    T.baeger = function (ctx, r, farve) {
        var sx = r.b / 120, sy = r.h / 140;
        var x0 = r.x + 17 * sx, x1 = r.x + 103 * sx, top = r.y + 62 * sy, bund = r.y + 130 * sy;
        ctx.save();
        NK.rundtRekt(ctx, x0, top, x1 - x0, bund - top, 6 * sx);
        ctx.clip();
        fyld(ctx, x0, x1, top, bund, farve || D.VAND);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(x0, top, x1 - x0, Math.max(1, 2 * sy));
        ctx.restore();
        if (klar(BAEGER)) ctx.drawImage(BAEGER, r.x, r.y, r.b, r.h);
    };

    /* ----- pH-metret: (x, y) er elektrodens spids, h er hoejden ---------------- */
    T.phmeter = function (ctx, x, y, h, tekst, alfa) {
        var s = h / 190, b = 48 * s;
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        var top = y - 186 * s;
        if (klar(METER)) ctx.drawImage(METER, x - b / 2, top, b, h);
        if (tekst) {
            ctx.fillStyle = "#1b2a22";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            var st = NK.passendeSkrift(ctx, tekst, 30 * s, Math.max(10, 17 * s), 8, "800");
            ctx.font = "800 " + st + "px " + FONT;
            ctx.fillText(tekst, x, top + 43 * s + 1);
        }
        ctx.restore();
    };

    /* ----- Et gult skilt med en lille spids ned mod (x, y) ---------------------- */
    T.skilt = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = "700 13px " + FONT;
        var b = ctx.measureText(tekst).width + 18, h = 24;
        var bx = NK.klamp(x - b / 2, opt.min !== undefined ? opt.min : -1e9, opt.maks !== undefined ? opt.maks - b : 1e9);
        var by = y - h - 8;
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#f6d55c";
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        ctx.moveTo(x - 6, by + h - 0.5);
        ctx.lineTo(x + 6, by + h - 0.5);
        ctx.lineTo(x, by + h + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#b8901a";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.stroke();
        ctx.fillStyle = "#3a2c00";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + b / 2, by + h / 2 + 1);
        ctx.restore();
        return { x: bx, y: by, b: b, h: h };
    };

    /* ----- En gul ring om et omraade (det, kortet taler om) -------------------- */
    T.gulRamme = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, r || 10);
        ctx.fillStyle = "rgba(242, 197, 61, 0.12)";
        ctx.fill();
        ctx.strokeStyle = "#d69e0c";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    };

    NK.Tegning = T;
}());

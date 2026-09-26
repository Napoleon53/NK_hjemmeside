/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, poelsevognens disk med opskriften, bonen og tingene paa disken
   (fane 1), molekylerne, poserne med 1 mol, kasserne, kammeret og skiltet
   med reaktionsskemaet (fane 2) og tavlen med soejlerne (fane 3).
   Funktionerne tegner én ting et bestemt sted og husker intet selv;
   fanerne bestemmer, hvor tingene staar, og hvordan de bevaeger sig.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

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

    function rgba(hex, a) {
        var c = rgb(hex);
        return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }
    T.rgba = rgba;

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    function froe(n) {
        var s = (n * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* ----- Rummet og bordet (som sc4.2) -------------------------------------- */
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
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        for (x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.fillRect(x - 14, y + plade + 18, 8, 3);
            ctx.fillRect(x + 6, y + plade + 18, 8, 3);
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* Et lyst skilt med to tegnestifter. v.lys: 0-1, skiltet blinker (hint) */
    function skilt(ctx, x, y, b, h, v) {
        v = v || {};
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#ece8dd";
        NK.rundtRekt(ctx, x, y, b, h, 5);
        ctx.fill();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.3 * v.lys) + ")";
            ctx.fill();
        }
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.95)" : "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = v.lys ? 3 : 1;
        ctx.stroke();
        [[x + 9, y + 9], [x + b - 9, y + 9]].forEach(function (q) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(q[0], q[1], 3.2, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    T.skilt = skilt;

    /* Lille etiket med versaler oeverst paa et skilt */
    function skiltTitel(ctx, tekst, x, y, px) {
        ctx.save();
        ctx.font = font("700", px);
        ctx.fillStyle = "#8a7f66";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "1px";
        ctx.fillText(tekst, x, y);
        ctx.restore();
    }

    /* ----- Plakaten paa fane 2: hvad én figur er ----------------------------
       enhed "stk": 1 figur = 1 molekyle. "mol": 1 figur = 1 mol molekyler. */
    T.enhedPlakat = function (ctx, x, y, b, h, enhed, v) {
        v = v || {};
        ctx.save();
        skilt(ctx, x, y, b, h, v);
        var pad = Math.max(10, b * 0.06), ib = b - 2 * pad;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1c1f26";
        var t1 = enhed === "mol" ? "1 figur = 1 mol" : "1 figur = 1 molekyle";
        var t2 = enhed === "mol" ? "= " + D.NA_TEKST + " molekyler" : "Tegnet meget forstørret.";
        NK.passendeSkrift(ctx, t1, ib, NK.klamp(h * 0.3, 12, 26), 10, "700");
        ctx.fillText(t1, x + b / 2, y + h * 0.42);
        ctx.fillStyle = "#4a4438";
        NK.passendeSkrift(ctx, t2, ib, NK.klamp(h * 0.2, 12, 17), 10, "600");
        ctx.fillText(t2, x + b / 2, y + h * 0.74);
        ctx.restore();
    };

    /* ======================================================================
       FANE 1: HOTDOGBODEN
       ====================================================================== */

    /* Tingene set oppefra: bredde og hoejde i forhold til poelsens bredde iw,
       og om de er runde (skyggen og rammen foelger formen). */
    var TING = {
        poelse: { b: 1, h: 0.25 }, broed: { b: 1.08, h: 0.4 }, agurk: { b: 0.27, h: 0.27, rund: true },
        bolle: { b: 0.5, h: 0.5, rund: true }, boef: { b: 0.44, h: 0.44, rund: true }, ost: { b: 0.4, h: 0.4 }
    };
    T.TING = TING;

    /* De faerdige retter set oppefra */
    T.PRODUKT = { hotdog: { b: 1.08, h: 0.4 }, burger: { b: 0.64, h: 0.64 } };

    /* Hvordan en ret samles: tingene i tegneraekkefoelge, og for hver ting
       [dx, dy, drejning, skala] i forhold til iw. Samme antal pladser som
       opskriften har af tingen. */
    T.SAML = {
        hotdog: { orden: ["broed", "poelse", "agurk"], plads: {
            broed: [[0, 0, 0, 1]], poelse: [[0, -0.01, 0, 1]],
            agurk: [[-0.2, -0.01, 0, 0.95], [0.2, -0.01, 0, 0.95]] } },
        burger: { orden: ["boef", "ost", "bolle"], plads: {
            boef: [[-0.035, 0.03, 0, 1.25], [0.035, -0.02, 0.5, 1.25]],
            ost: [[0, 0, 0.2, 1.3], [0, 0, 0.75, 1.3], [0, 0, 1.3, 1.3]],
            bolle: [[0, 0, 0, 1]] } }
    };

    T.tingBredde = function (id, iw) { return (TING[id] || T.PRODUKT[id]).b * iw; };
    T.tingHoejde = function (id, iw) { return (TING[id] || T.PRODUKT[id]).h * iw; };

    T.ting = function (ctx, id, x, y, iw, v) {
        v = v || {};
        var d = TING[id], w = d.b * iw, h = d.h * iw;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        if (v.skygge !== false) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
            ctx.beginPath();
            if (d.rund) ctx.ellipse(x + 2, y + 3, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
            else ctx.ellipse(x + 2, y + h * 0.35, w * 0.47, h * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        NK.Sprites.tegnMidt(ctx, id, x, y, w, v.v || 0);
        function ramme(pad) {
            ctx.beginPath();
            if (d.rund) ctx.arc(x, y, w / 2 + pad, 0, Math.PI * 2);
            else NK.rundtRekt(ctx, x - w / 2 - pad, y - h / 2 - pad, w + 2 * pad, h + 2 * pad, 7);
        }
        if (v.rest) {
            ctx.strokeStyle = "rgba(230, 137, 42, " + (0.55 + 0.4 * v.rest) + ")";
            ctx.lineWidth = 2.5;
            ctx.setLineDash([5, 4]);
            ramme(4);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 2;
            ramme(3);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* En faerdig ret (hotdog eller dobbeltburger) set oppefra */
    T.produkt = function (ctx, id, x, y, iw, v) {
        v = v || {};
        var S = T.SAML[id], foerste = true;
        S.orden.forEach(function (ing) {
            S.plads[ing].forEach(function (p) {
                T.ting(ctx, ing, x + p[0] * iw, y + p[1] * iw, iw * p[3], { skygge: foerste, v: p[2], alfa: v.alfa });
                foerste = false;
            });
        });
    };

    T.hotdog = function (ctx, x, y, iw, v) { T.produkt(ctx, "hotdog", x, y, iw, v); };

    /* Opskriften paa vaeggen, fx 1 poelse + 1 broed + 2 agurkeskiver ⟶ 1 hotdog.
       ops: opskriften (D.OPSKRIFTER). Tegningerne har samme stoerrelse for
       begge opskrifter, saa skiltet er lige hoejt. Giver skiltets hoejde. */
    var IKON = { poelse: 1.5, broed: 1.6, agurk: 0.55, bolle: 0.8, boef: 0.75, ost: 0.72, hotdog: 1.6, burger: 0.95 };

    T.opskrift = function (ctx, x, y, b, ops, v) {
        v = v || {};
        var pad = NK.klamp(b * 0.04, 10, 18);
        /* Bredden i enheder u: tal, ting og tegn mellem dem */
        var dele = [];
        ops.led.forEach(function (l, i) {
            if (i) dele.push({ tegn: "+" });
            dele.push({ k: String(l[1]), ting: l[0], b: IKON[l[0]] });
        });
        dele.push({ tegn: "⟶" }, { k: "1", ting: ops.id, b: IKON[ops.id], produkt: true });
        var TAL = 0.55, TEGN = 0.75, MELLEM = 0.12;
        var sum = 0;
        dele.forEach(function (d) { sum += d.tegn ? TEGN : TAL + d.b + MELLEM; });
        var u = (b - 2 * pad) / Math.max(sum, 10.2);
        var titelPx = NK.klamp(u * 0.28, 11, 14);
        var h = Math.round(pad * 1.6 + titelPx + u * 1.0);
        ctx.save();
        skilt(ctx, x, y, b, h, v);
        skiltTitel(ctx, "OPSKRIFT: " + ops.navn.toUpperCase(), x + pad + 8, y + pad * 0.6, titelPx);
        var my = y + pad * 0.6 + titelPx + (h - pad * 0.6 - titelPx) / 2;
        var cx = x + pad + (b - 2 * pad - sum * u) / 2;
        ctx.textBaseline = "middle";
        dele.forEach(function (d) {
            if (d.tegn) {
                ctx.font = font("700", NK.klamp(u * 0.55, 14, 34));
                ctx.fillStyle = "#6a6458";
                ctx.textAlign = "center";
                ctx.fillText(d.tegn, cx + TEGN * u / 2, my);
                cx += TEGN * u;
                return;
            }
            ctx.font = font("800", NK.klamp(u * 0.62, 14, 40));
            ctx.fillStyle = "#d9731a";
            ctx.textAlign = "center";
            ctx.fillText(d.k, cx + TAL * u / 2, my + 1);
            cx += TAL * u;
            var mx = cx + d.b * u / 2;
            var mal = d.produkt ? T.PRODUKT[d.ting] : TING[d.ting];
            var iw = Math.min(d.b * u * 0.92 / mal.b, u * 0.95 / mal.h);
            if (d.produkt) T.produkt(ctx, d.ting, mx, my, iw);
            else T.ting(ctx, d.ting, mx, my, iw);
            cx += d.b * u + MELLEM * u;
        });
        ctx.restore();
        return h;
    };

    /* Bonen med ordren, haengende i en klemme. v.ok: stemplet "Serveret" */
    T.bon = function (ctx, x, y, b, h, linjer, v) {
        v = v || {};
        ctx.save();
        ctx.translate(x + b / 2, y);
        ctx.rotate(v.sving || 0);
        ctx.translate(-b / 2, 0);
        /* Klemmen */
        ctx.fillStyle = "#8a8f99";
        ctx.fillRect(b / 2 - 10, -8, 20, 14);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(4, 8, b, h);
        /* Papiret med takket bund */
        ctx.fillStyle = "#fbfaf4";
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.lineTo(b, 2);
        ctx.lineTo(b, h);
        var tak = Math.max(6, Math.round(b / 12)), tb = b / tak;
        for (var i = tak; i > 0; i--) {
            ctx.lineTo((i - 0.5) * tb, h - 5);
            ctx.lineTo((i - 1) * tb, h);
        }
        ctx.closePath();
        ctx.fill();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.95)";
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.fillStyle = "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        var pad = Math.max(8, b * 0.08);
        var ly = 2 + pad;
        linjer.forEach(function (l) {
            var px = NK.passendeSkrift(ctx, l.t, b - 2 * pad, l.px, 10, l.vaegt || "700");
            ctx.fillStyle = l.farve || "#1c1f26";
            ctx.fillText(l.t, b / 2, ly);
            ly += px * 1.3;
        });
        if (v.ok) {
            ctx.save();
            ctx.translate(b / 2, h * 0.62);
            ctx.rotate(-0.18);
            ctx.globalAlpha *= NK.klamp(v.ok, 0, 1);
            ctx.strokeStyle = "#2b8a57";
            ctx.lineWidth = 2.5;
            var sb = b * 0.8, shh = Math.max(20, h * 0.22);
            NK.rundtRekt(ctx, -sb / 2, -shh / 2, sb, shh, 4);
            ctx.stroke();
            ctx.fillStyle = "#2b8a57";
            ctx.textBaseline = "middle";
            NK.passendeSkrift(ctx, "SERVERET", sb - 10, shh * 0.62, 10, "800");
            ctx.fillText("SERVERET", 0, 1);
            ctx.restore();
        }
        ctx.restore();
    };

    /* Disken set skraat oppefra: bagkanten y0, forkanten y1, og poelsevognens
       roed-hvide front derunder */
    T.disk = function (ctx, W, H, y0, y1) {
        ctx.save();
        var g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, "#9aa1ab");
        g.addColorStop(1, "#c9ced6");
        ctx.fillStyle = g;
        ctx.fillRect(0, y0, W, y1 - y0);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(0, y0, W, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
        for (var x = 0; x < W; x += 90) ctx.fillRect(x, y0, 1, y1 - y0);
        /* Forkanten og fronten */
        ctx.fillStyle = "#e3e6ea";
        ctx.fillRect(0, y1, W, 8);
        ctx.fillStyle = "#b8231c";
        ctx.fillRect(0, y1 + 8, W, H - y1 - 8);
        ctx.fillStyle = "#f4f1ea";
        ctx.fillRect(0, y1 + 8 + Math.min(10, (H - y1) * 0.25), W, Math.min(8, (H - y1) * 0.2));
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(0, y1 + 8, W, 3);
        ctx.restore();
    };

    /* Skaerebraettet, som eleven laegger tingene paa. r: { x, y, b, h } */
    T.braet = function (ctx, r, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        NK.rundtRekt(ctx, r.x + 4, r.y + 6, r.b, r.h, 12);
        ctx.fill();
        var g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
        g.addColorStop(0, "#d6a867");
        g.addColorStop(1, "#b98545");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 12);
        ctx.fill();
        ctx.save();
        ctx.clip();
        var f = froe(3);
        ctx.strokeStyle = "rgba(120, 72, 25, 0.18)";
        ctx.lineWidth = 1;
        for (var i = 0; i < 9; i++) {
            var yy = r.y + (i + 0.5) * r.h / 9 + (f() - 0.5) * 6;
            ctx.beginPath();
            ctx.moveTo(r.x, yy);
            ctx.bezierCurveTo(r.x + r.b * 0.3, yy + (f() - 0.5) * 8, r.x + r.b * 0.7, yy + (f() - 0.5) * 8, r.x + r.b, yy);
            ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")" : "rgba(90, 55, 20, 0.6)";
        ctx.lineWidth = v.lys ? 3 : 1.5;
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 12);
        ctx.stroke();
        ctx.restore();
    };

    /* Tallerkenen, hvor hotdoggene samles: en hvid papbakke */
    T.bakke = function (ctx, r) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        NK.rundtRekt(ctx, r.x + 4, r.y + 6, r.b, r.h, 10);
        ctx.fill();
        ctx.fillStyle = "#f7f5ef";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 10);
        ctx.fill();
        ctx.strokeStyle = "#d8d3c6";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
        NK.rundtRekt(ctx, r.x + 6, r.y + 6, r.b - 12, r.h - 12, 7);
        ctx.stroke();
        ctx.restore();
    };

    /* Et lille tal i en rund plade: antallet i en raekke paa braettet */
    T.antalPlade = function (ctx, x, y, tekst, v) {
        v = v || {};
        ctx.save();
        ctx.font = font("700", v.px || 13);
        var b = Math.max(24, ctx.measureText(tekst).width + 14), h = (v.px || 13) + 10;
        ctx.fillStyle = v.farve || "rgba(20, 20, 28, 0.82)";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.fillStyle = v.tekstFarve || "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
        return b;
    };

    /* Damp fra gryden */
    T.damp = function (ctx, x, y, b, tid) {
        ctx.save();
        ctx.lineCap = "round";
        for (var i = 0; i < 3; i++) {
            var fase = (tid * 0.45 + i / 3) % 1;
            var sx = x + (i - 1) * b * 0.22;
            ctx.strokeStyle = "rgba(235, 240, 245, " + (0.35 * Math.sin(fase * Math.PI)) + ")";
            ctx.lineWidth = Math.max(2, b * 0.035);
            ctx.beginPath();
            for (var k = 0; k <= 12; k++) {
                var t = k / 12;
                var yy = y - fase * b * 0.35 - t * b * 0.28;
                var xx = sx + Math.sin(t * 5 + tid * 2 + i) * b * 0.04;
                if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
            }
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Glasset med agurkeskiver. antal: hvor mange skiver der ses (0 = tomt).
       (x, y): midten af bunden, h: hoejden. */
    T.agurkglas = function (ctx, x, y, h, antal, v) {
        v = v || {};
        var M = MAAL.agurkglas, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        ctx.save();
        var iv = x0 + M.indV * k, ih = x0 + M.indH * k, it = y0 + M.indTop * k, ib = y0 + M.indBund * k;
        /* Lagen og skiverne bag glasset */
        if (antal > 0) {
            ctx.fillStyle = "rgba(196, 214, 120, 0.35)";
            NK.rundtRekt(ctx, iv, it + (ib - it) * 0.12, ih - iv, (ib - it) * 0.88, 8 * k);
            ctx.fill();
        }
        var f = froe(11), bw = ih - iv;
        for (var i = 0; i < Math.min(antal, 14); i++) {
            var rk = Math.floor(i / 3), sx = iv + bw * (0.2 + (i % 3) * 0.3) + (f() - 0.5) * bw * 0.12;
            var sy = ib - bw * 0.14 - rk * bw * 0.2;
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate((f() - 0.5) * 1.4);
            ctx.scale(1, 0.45 + f() * 0.5);
            NK.Sprites.tegnMidt(ctx, "agurk", 0, 0, bw * 0.3);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "agurkglas", x0, y0, b, M.h * k);
        /* Etiketten */
        var e = { x: x0 + 14 * k, y: y0 + M.etiketTop * k, b: 72 * k, h: (M.etiketBund - M.etiketTop) * k };
        ctx.fillStyle = "#f4eed8";
        NK.rundtRekt(ctx, e.x, e.y, e.b, e.h, 3 * k);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 122, 42, 0.8)";
        ctx.lineWidth = Math.max(1, 1.5 * k);
        ctx.stroke();
        ctx.fillStyle = "#2f5e22";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, "Agurker", e.b * 0.9, NK.klamp(e.h * 0.4, 9, 16), 7, "700");
        ctx.fillText("Agurker", e.x + e.b / 2, e.y + e.h / 2);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: M.h * k };
    };

    /* En beholder (gryden eller kurven) med bunden i (x, y) og hoejden h */
    T.beholder = function (ctx, navn, x, y, h, v) {
        v = v || {};
        var M = MAAL[navn], k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.42, Math.max(3, 5 * k), 0, 0, Math.PI * 2);
        ctx.fill();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 - 4, y0 - 4, b + 8, M.bund * k + 8, 12);
            ctx.stroke();
        }
        NK.Sprites.tegn(ctx, navn, x0, y0, b, M.h * k);
        ctx.restore();
        return { x: x0, y: y0, b: b, h: M.bund * k };
    };

    /* Serveringsklokken. v.lys: den banker (naeste skridt). v.ding: 0-1 lige efter et ring */
    T.klokke = function (ctx, x, y, b, v) {
        v = v || {};
        var M = MAAL.klokke, k = b / M.b, h = M.h * k;
        var hop = v.ding ? Math.sin(v.ding * Math.PI) * 3 * k : 0;
        ctx.save();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.55 * v.lys) + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x, y - h * 0.45, b * 0.62, h * 0.62, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        NK.Sprites.tegn(ctx, "klokke", x - b / 2, y - M.bund * k + hop, b, h);
        if (v.ding) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (1 - v.ding) + ")";
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            [-1, 1].forEach(function (s) {
                for (var i = 0; i < 2; i++) {
                    var r = b * (0.55 + i * 0.16 + v.ding * 0.2);
                    ctx.beginPath();
                    ctx.arc(x, y - h * 0.55, r, s < 0 ? Math.PI * 1.05 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : -Math.PI * 0.05);
                    ctx.stroke();
                }
            });
        }
        ctx.restore();
        return { x: x - b / 2, y: y - M.bund * k, b: b, h: M.bund * k };
    };

    /* ======================================================================
       FANE 2: MOLEKYLERNE
       ====================================================================== */

    /* Et atom som en kugle med lys fra oven til venstre */
    T.atom = function (ctx, el, x, y, r, alfa) {
        var a = D.ATOM[el];
        if (!(r > 0.3)) return;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, nuance(a.farve, 0.55));
        g.addColorStop(0.55, a.farve);
        g.addColorStop(1, nuance(a.farve, -0.35));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = a.kant;
        ctx.lineWidth = Math.max(0.6, r * 0.07);
        ctx.stroke();
        ctx.restore();
    };

    /* Atomernes pladser i et molekyle med midten (x, y), skala s og drejning a */
    T.atomPladser = function (st, x, y, s, a) {
        var c = Math.cos(a || 0), sn = Math.sin(a || 0);
        return st.atomer.map(function (at) {
            return { el: at[0], x: x + (at[1] * c - at[2] * sn) * s, y: y + (at[1] * sn + at[2] * c) * s, r: D.ATOM[at[0]].r * s };
        });
    };

    /* Et molekyle. v.alfa, v.rest (orange ring: overskud), v.lys (gul ring) */
    T.molekyle = function (ctx, st, x, y, s, a, v) {
        v = v || {};
        if (v.rest || v.lys) {
            ctx.save();
            ctx.strokeStyle = v.rest ? "rgba(230, 137, 42, 0.9)" : "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 2;
            if (v.rest) ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.arc(x, y, st.radius * s + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        T.atomPladser(st, x, y, s, a).forEach(function (p) { T.atom(ctx, p.el, p.x, p.y, p.r, v.alfa); });
    };

    /* Posen med 1 mol molekyler: en cirkel med fem smaa molekyler og "1 mol" */
    var POSE = [[0, -0.34, 0.3], [-0.42, -0.08, 1.4], [0.42, -0.1, 2.3], [-0.2, 0.26, 3.1], [0.24, 0.24, 0.8]];
    T.pose = function (ctx, st, x, y, R, v) {
        v = v || {};
        if (R < 1) return;
        ctx.save();
        if (v.alfa !== undefined) ctx.globalAlpha *= NK.klamp(v.alfa, 0, 1);
        ctx.fillStyle = rgba(st.farve === "#cfd5dd" ? "#8fa3bd" : st.farve, 0.2);
        ctx.strokeStyle = v.rest ? "rgba(230, 137, 42, 0.95)" : (v.lys ? "rgba(242, 197, 61, 0.95)" : rgba(st.farve === "#cfd5dd" ? "#b8c4d4" : st.farve, 0.85));
        ctx.lineWidth = v.rest || v.lys ? 2.5 : 1.5;
        if (v.rest) ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        var s = R * 0.2 / st.radius;
        POSE.forEach(function (p) {
            T.molekyle(ctx, st, x + p[0] * R, y + p[1] * R - R * 0.06, s, p[2] + (v.drej || 0));
        });
        /* "1 mol" skrives kun, naar posen er stor nok til at det kan laeses;
           plakaten siger det ogsaa */
        if (R < 30) { ctx.restore(); return; }
        var px = NK.klamp(R * 0.34, 11, 15);
        ctx.font = font("700", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(10, 10, 16, 0.8)";
        ctx.strokeText("1 mol", x, y + R * 0.66);
        ctx.fillStyle = "#ffffff";
        ctx.fillText("1 mol", x, y + R * 0.66);
        ctx.restore();
    };

    /* Én figur: et molekyle (enhed "stk") eller en pose med 1 mol ("mol").
       m: stoerrelsen (molekylets skala s eller posens radius R). */
    T.figur = function (ctx, st, enhed, x, y, m, a, v) {
        if (enhed === "mol") T.pose(ctx, st, x, y, m, v);
        else T.molekyle(ctx, st, x, y, m, a, v);
    };

    /* Kassen, som et stof hentes fra: en aaben kasse set forfra med tre
       figurer, der stikker op, og formlen paa forsiden. (x, y): midten af
       bunden. Giver kassens rektangel. */
    T.kasse = function (ctx, x, y, b, h, st, enhed, m, v) {
        v = v || {};
        var x0 = x - b / 2, y0 = y - h;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.5, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        /* Bagkanten og figurerne */
        ctx.fillStyle = "#2c3340";
        ctx.fillRect(x0 + 4, y0 - h * 0.12, b - 8, h * 0.2);
        if (!v.tom) {
            var figY = y0 + h * 0.02;
            [[-0.26, 0.2], [0.24, 2.1], [0, 1.0]].forEach(function (p, i) {
                var fx = x + p[0] * b, fy = figY - (i === 2 ? h * 0.1 : 0);
                T.figur(ctx, st, enhed, fx, fy, m, p[1]);
            });
        }
        /* Forsiden */
        var g = ctx.createLinearGradient(0, y0, 0, y);
        g.addColorStop(0, "#4a5566");
        g.addColorStop(1, "#343c4a");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x0, y0, b, h, 6);
        ctx.fill();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")" : "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = v.lys ? 3 : 1.5;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0 + 4, y0 + 3, b - 8, 2);
        /* Etiketten med formlen */
        var eb = b * 0.78, eh = h * 0.56, ex = x - eb / 2, ey = y0 + h * 0.28;
        ctx.fillStyle = "#f4f1e8";
        NK.rundtRekt(ctx, ex, ey, eb, eh, 4);
        ctx.fill();
        ctx.fillStyle = "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        NK.passendeSkrift(ctx, st.formel, eb * 0.9, NK.klamp(eh * 0.62, 12, 30), 10, "700");
        ctx.fillText(st.formel, x, ey + eh * 0.5);
        ctx.restore();
        return { x: x0, y: y0 - h * 0.3, b: b, h: h * 1.3 };
    };

    /* Kammeret med knappen paa soklen. (x, y): midten af bunden, b: bredden.
       v.knap: teksten paa knappen, v.knapLys: den banker, v.knapOver: musen.
       Giver det indre og knappens rektangel. */
    T.kammer = function (ctx, x, y, b, v) {
        v = v || {};
        var M = MAAL.kammer, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(x, y - 1, b * 0.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        /* Et moerkt indre, saa molekylerne ses */
        ctx.fillStyle = "rgba(12, 16, 24, 0.55)";
        NK.rundtRekt(ctx, x0 + 10 * k, y0 + 10 * k, 280 * k, 194 * k, 10 * k);
        ctx.fill();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.45 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
            NK.rundtRekt(ctx, x0 + 6 * k, y0 + 6 * k, 288 * k, 202 * k, 12 * k);
            ctx.stroke();
        }
        ctx.restore();
        var ind = { x: x0 + M.indV * k, y: y0 + M.indTop * k, b: (M.indH - M.indV) * k, h: (M.indBund - M.indTop) * k };
        var kb = Math.min(110 * k, b * 0.4), kh = 26 * k;
        var knap = { x: x - kb / 2, y: y0 + 212 * k, b: kb, h: kh };
        return {
            ind: ind, knap: knap, x: x0, y: y0, b: b, h: h,
            /* Glasset og soklen tegnes efter molekylerne (tegnKammerForan) */
            foran: function (ctx2) {
                NK.Sprites.tegn(ctx2, "kammer", x0, y0, b, h);
                ctx2.save();
                var lys = v.knapLys || 0;
                ctx2.fillStyle = v.knapAktiv === false ? "#555a64" : (v.knapOver ? "#e0584a" : "#c63b2f");
                NK.rundtRekt(ctx2, knap.x, knap.y, knap.b, knap.h, knap.h / 2);
                ctx2.fill();
                if (lys) {
                    ctx2.strokeStyle = "rgba(242, 197, 61, " + (0.4 + 0.6 * lys) + ")";
                    ctx2.lineWidth = 3;
                    ctx2.stroke();
                }
                ctx2.fillStyle = "#ffffff";
                ctx2.textAlign = "center";
                ctx2.textBaseline = "middle";
                NK.passendeSkrift(ctx2, v.knap || "Start", knap.b * 0.84, NK.klamp(knap.h * 0.6, 11, 17), 10, "700");
                ctx2.fillText(v.knap || "Start", knap.x + knap.b / 2, knap.y + knap.h / 2 + 0.5);
                ctx2.restore();
            }
        };
    };

    /* Skiltet med reaktionsskemaet: koefficienterne, formlerne og under
       hver formel lige saa mange figurer, som koefficienten siger.
       Giver skiltets hoejde. */
    T.skemaSkilt = function (ctx, x, y, b, r, enhed, v) {
        v = v || {};
        var pad = NK.klamp(b * 0.03, 10, 18);
        var ib = b - 2 * pad;
        /* Figurernes stoerrelse: alle figurer paa én raekke skal kunne vaere der */
        var figurer = 0;
        r.led.forEach(function (l) { figurer += l.k; });
        var tegn = r.led.length - 1;
        var plads = ib / (figurer * 1.18 + tegn * 1.1 + r.led.length * 0.3);
        plads = Math.max(plads, 4);
        var m = enhed === "mol" ? plads * 0.46 : plads * 0.5;
        var figD = enhed === "mol" ? m * 2 : 0;
        var titelPx = NK.klamp(plads * 0.26, 11, 14);
        var formelPx = NK.klamp(plads * 0.5, 14, 30);
        var figH = enhed === "mol" ? figD : plads * 0.9;
        var h = Math.round(pad * 1.2 + titelPx + 8 + formelPx * 1.25 + figH + pad * 0.9);
        ctx.save();
        skilt(ctx, x, y, b, h, v);
        skiltTitel(ctx, "REAKTIONSSKEMA", x + pad + 8, y + pad * 0.6, titelPx);
        var fy = y + pad * 0.6 + titelPx + 8 + formelPx * 0.6;
        var gy = fy + formelPx * 0.65 + figH / 2;
        /* Bredden af hvert led */
        var bredder = r.led.map(function (l) { return l.k * plads * 1.18 + plads * 0.3; });
        var samlet = bredder.reduce(function (a, c) { return a + c; }, 0) + tegn * plads * 1.1;
        var cx = x + b / 2 - samlet / 2;
        var pladser = [];
        r.led.forEach(function (l, i) {
            var st = D.stof(l.s), lb = bredder[i];
            var mx = cx + lb / 2;
            pladser.push(mx);
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.font = font("700", formelPx);
            var ft = st.formel, kt = l.k > 1 ? String(l.k) + " " : "";
            var fb = ctx.measureText(ft).width;
            ctx.font = font("800", formelPx);
            var kb = ctx.measureText(kt).width;
            var sx = mx - (fb + kb) / 2;
            ctx.textAlign = "left";
            ctx.fillStyle = "#d9731a";
            ctx.fillText(kt, sx, fy);
            ctx.font = font("700", formelPx);
            ctx.fillStyle = "#1c1f26";
            ctx.fillText(ft, sx + kb, fy);
            /* Figurerne. Et stort molekyle (propan) tegnes mindre, saa det kan vaere der */
            var mm = enhed === "mol" ? m : plads * 0.52 / Math.max(st.radius, 1);
            for (var j = 0; j < l.k; j++) {
                var gx = mx + (j - (l.k - 1) / 2) * plads * 1.18;
                T.figur(ctx, st, enhed, gx, gy, mm, 0.2 + j * 0.9);
            }
            cx += lb;
            if (i < r.led.length - 1) {
                ctx.textAlign = "center";
                ctx.font = font("700", formelPx);
                ctx.fillStyle = "#6a6458";
                ctx.fillText(l.side === 0 && r.led[i + 1].side === 1 ? "⟶" : "+", cx + plads * 0.55, fy);
                cx += plads * 1.1;
            }
        });
        ctx.restore();
        return { h: h, pladser: pladser };
    };

    /* ======================================================================
       FANE 3: TAVLEN
       ====================================================================== */
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
        ctx.moveTo(r.x + r.b * 0.55, r.y);
        ctx.lineTo(r.x + r.b * 0.7, r.y);
        ctx.lineTo(r.x + r.b * 0.45, r.y + r.h);
        ctx.lineTo(r.x + r.b * 0.3, r.y + r.h);
        ctx.closePath();
        ctx.fill();
        /* Hylden til tuscherne */
        ctx.fillStyle = "#9aa1ab";
        ctx.fillRect(r.x - 6, r.y + r.h + 6, r.b + 12, 7);
        ctx.fillStyle = "#2f7ad1";
        NK.rundtRekt(ctx, r.x + r.b * 0.78, r.y + r.h + 2, 34, 6, 3);
        ctx.fill();
        ctx.fillStyle = "#c63b2f";
        NK.rundtRekt(ctx, r.x + r.b * 0.78 + 40, r.y + r.h + 2, 34, 6, 3);
        ctx.fill();
        ctx.restore();
    };

    /* Soejlen under en formel: koefficienten som en stiplet stabel af blokke
       og stofmaengden som en fyldt soejle i samme maalestok.
       cx: midten, bund: soejlens bund, blok: { b, h } i px, k: koefficienten,
       fyld: soejlens hoejde i px (eller -1: tom), loft: den stoerste hoejde,
       der tegnes. v.farve, v.lys (blokkene blinker), v.vis (0-1: blokkene
       glider frem) */
    T.soejle = function (ctx, cx, bund, blok, k, fyld, loft, v) {
        v = v || {};
        var vis = v.vis === undefined ? 1 : NK.klamp(v.vis, 0, 1);
        if (vis <= 0) return;
        var x0 = cx - blok.b / 2;
        ctx.save();
        ctx.globalAlpha *= vis;
        /* Fyldet */
        if (fyld > 0.5) {
            var fh = Math.min(fyld, loft);
            ctx.fillStyle = v.farve || "#3d9ee0";
            ctx.fillRect(x0 + 2, bund - fh, blok.b - 4, fh);
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(x0 + 4, bund - fh, 5, fh);
            if (fyld > loft) {
                /* Soejlen er hoejere end der er plads til: en takket top */
                ctx.fillStyle = "#f7f8fa";
                ctx.beginPath();
                var ty = bund - fh;
                ctx.moveTo(x0 + 2, ty - 1);
                for (var t = 0; t <= 6; t++) ctx.lineTo(x0 + 2 + t * (blok.b - 4) / 6, ty + (t % 2 ? 7 : 1));
                ctx.lineTo(x0 + blok.b - 2, ty - 1);
                ctx.closePath();
                ctx.fill();
            }
        }
        /* Blokkene: én pr. koefficient */
        ctx.strokeStyle = v.lys ? "rgba(214, 150, 20, " + (0.6 + 0.4 * v.lys) + ")" : "rgba(40, 46, 58, 0.7)";
        ctx.lineWidth = v.lys ? 2.5 : 1.6;
        ctx.setLineDash([6, 4]);
        for (var i = 0; i < k; i++) {
            ctx.strokeRect(x0 + 0.5, bund - (i + 1) * blok.h + 0.5, blok.b - 1, blok.h - 1);
        }
        ctx.setLineDash([]);
        ctx.restore();
    };

    /* ======================================================================
       SMAATING
       ====================================================================== */

    /* En buet, stiplet pil, der viser, hvad der kan traekkes hvorhen */
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

    /* En lille maerkat med tekst, fx "overskud" */
    T.maerkat = function (ctx, x, y, tekst, v) {
        v = v || {};
        ctx.save();
        var px = v.px || 13;
        ctx.font = font("700", px);
        var b = ctx.measureText(tekst).width + 14, h = px + 9;
        ctx.globalAlpha *= v.alfa === undefined ? 1 : NK.klamp(v.alfa, 0, 1);
        ctx.fillStyle = v.farve || "#e6892a";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 5);
        ctx.fill();
        ctx.fillStyle = v.tekstFarve || "#1c1f26";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
    };

    NK.Tegn = T;
}());

/* =====================================================================
   tegning.js - tavlen, rammerne, skiltene, pH-skyderen, hydronen og
   oxoniumionen, hydroxidionen og vandet

   Tavlen, rammerne, skiltet, billedteksten og maerket er de samme som i
   sb7.3 Polysaccharider.
   T.tavle(ctx, lay)                     vaeggen, whiteboardet og bakken
   T.gulRamme(ctx, x, y, b, h)           det, kortet spoerger om
   T.valgRamme(ctx, k, farve)            elevens valg (blaa), forkert (roed)
   T.skilt(ctx, x, y, tekst)             et gult skilt med pil ned mod (x, y)
   T.maerke(ctx, x, y, tekst, opt)       et lille maerke (dit gaet)
   T.phSkala(ctx, s, ph, opt)            pH-skyderen fra 0 til 14
   T.hydron(ctx, x, y, r, alfa)          en hydron, H⁺ (orange kugle)
   T.partikel(ctx, x, y, slags, fs, a)   H₃O⁺, OH⁻ eller H₂O i en lille boble
   T.pille(ctx, x, y, b, h, tilst, opt)  et valinmolekyle i vinduet (fane 2)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#6b7685";

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;
    T.VALG = "#2f6fde";
    T.FORKERT = "#d9534f";

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

    /* ----- Rammer om dele af molekylet -------------------------------------------- */
    T.gulRamme = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, r || 10);
        ctx.fillStyle = "rgba(242, 197, 61, 0.16)";
        ctx.fill();
        ctx.strokeStyle = "#d69e0c";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    };

    /* k er en kasse { x, y, w, h } */
    T.valgRamme = function (ctx, k, farve, stiplet) {
        if (!k) return;
        ctx.save();
        NK.rundtRekt(ctx, k.x - 6, k.y - 4, k.w + 12, k.h + 8, 9);
        ctx.fillStyle = farve === T.FORKERT ? "rgba(217, 83, 79, 0.10)" : (farve === "#d69e0c" ? "rgba(242, 197, 61, 0.14)" : "rgba(47, 111, 222, 0.12)");
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2.5;
        if (stiplet) ctx.setLineDash([5, 4]);
        ctx.stroke();
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

    /* Et lille maerke med en tekst (dit gaet) */
    T.maerke = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT;
        var b = ctx.measureText(tekst).width + 20 + (opt.tegn ? 18 : 0), h = opt.h || 24;
        var bx = opt.justering === "right" ? x - b : (opt.justering === "center" ? x - b / 2 : x);
        ctx.fillStyle = opt.fyld || "#fff8e1";
        NK.rundtRekt(ctx, bx, y - h / 2, b, h, 7); ctx.fill();
        ctx.strokeStyle = opt.kant || "#d69e0c";
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, tekst, bx + 10, y + 1, { font: (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT, farve: opt.farve || BLAEK, linje: "middle" });
        if (opt.tegn) NK.tekst(ctx, opt.tegn, bx + b - 14, y + 1, { font: "800 15px " + FONT, farve: opt.tegnFarve || BLAEK, justering: "center", linje: "middle" });
        return { x: bx, y: y - h / 2, b: b, h: h };
    };

    /* ----- pH-skyderen ----------------------------------------------------------------
       s = { x, y, b } er sporet: pH 0 ved x og pH 14 ved x + b, midt i hoejden y.
       Sporet har pH-farverne svagt, fra roedt i sur til blaat i basisk. */
    var PH_FARVER = [[0, "#d9483b"], [3, "#ee8a2c"], [5, "#e9c53a"], [7, "#5fb15a"], [9, "#2f8fae"], [11, "#3a5bd0"], [14, "#5b3fae"]];
    T.phTilX = function (s, ph) { return s.x + s.b * NK.klamp(ph, 0, 14) / 14; };
    T.xTilPh = function (s, x) { return NK.klamp((x - s.x) / s.b * 14, 0, 14); };
    T.paaSkala = function (s, pt) {
        if (!s || !pt) return false;
        return pt.x > s.x - 16 && pt.x < s.x + s.b + 16 && pt.y > s.y - 22 && pt.y < s.y + 20;
    };

    T.phSkala = function (ctx, s, ph, opt) {
        opt = opt || {};
        var laast = !!opt.laast, h = 10;
        ctx.save();
        ctx.globalAlpha = laast ? 0.55 : 1;
        var g = ctx.createLinearGradient(s.x, 0, s.x + s.b, 0);
        PH_FARVER.forEach(function (p) { g.addColorStop(p[0] / 14, p[1]); });
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, s.x, s.y - h / 2, s.b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(29, 36, 51, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        /* Tallene under sporet */
        var trin = s.b < 360 ? 2 : 1;
        for (var p = 0; p <= 14; p += trin) {
            var x = T.phTilX(s, p);
            ctx.save();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, s.y + h / 2 + 1); ctx.lineTo(x, s.y + h / 2 + 5); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, String(p), x, s.y + h / 2 + 15, { font: "600 12px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        if (opt.navn !== false && !opt.kompakt) NK.tekst(ctx, "pH", s.x - 14, s.y + 1, { font: "800 14px " + FONT, farve: BLAEK, justering: "right", linje: "middle" });
        /* Knappen med tallet over */
        var kx = T.phTilX(s, ph);
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.beginPath(); ctx.arc(kx, s.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = laast ? "#d8dce2" : "#ffffff";
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 3;
        ctx.strokeStyle = laast ? "#8b94a2" : (opt.greb ? T.VALG : "#2a3342");
        ctx.stroke();
        ctx.restore();
        var tekst = "pH " + D.komma1(ph);
        ctx.save();
        ctx.font = "800 14px " + FONT;
        var tb = ctx.measureText(tekst).width + 16, th = 23;
        var tx = NK.klamp(kx - tb / 2, s.x - 30, s.x + s.b + 30 - tb), ty = s.y - 21 - th;
        if (opt.kompakt) { tx = s.x - 16 - tb; ty = s.y - th / 2; }
        ctx.fillStyle = laast ? "#6f7886" : "#2a3342";
        NK.rundtRekt(ctx, tx, ty, tb, th, 6);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, tx + tb / 2, ty + th / 2 + 1);
        ctx.restore();
        return { kx: kx };
    };

    /* ----- En hydron, H⁺: en lille orange kugle med H⁺ ------------------------------ */
    T.hydron = function (ctx, x, y, r, alfa) {
        var a = alfa === undefined ? 1 : alfa;
        if (a < 0.01) return;
        ctx.save();
        ctx.globalAlpha *= a;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, "#fbd5a5");
        g.addColorStop(0.55, "#e08a2c");
        g.addColorStop(1, D.FARVE.hydron);
        ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
        ctx.shadowBlur = r * 0.5;
        ctx.shadowOffsetY = r * 0.12;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.globalAlpha *= a;
        NK.Mol.tekst(ctx, "H^+", x - r * 0.06, y, r * 0.95, "#ffffff", "center");
        ctx.restore();
    };

    /* ----- Oxoniumionen, hydroxidionen og vand i en lille boble ----------------------- */
    var PARTIKEL = {
        H3O: { t: "H_3O^+", kant: "#a93226", fyld: "rgba(252, 233, 230, 0.96)", farve: "#a93226" },
        OH: { t: "OH^-", kant: "#1d4ed8", fyld: "rgba(229, 236, 253, 0.96)", farve: "#1d4ed8" },
        H2O: { t: "H_2O", kant: "#7d8896", fyld: "rgba(240, 243, 246, 0.96)", farve: "#4b5563" }
    };
    T.partikel = function (ctx, x, y, slags, fs, alfa) {
        var p = PARTIKEL[slags], a = alfa === undefined ? 1 : alfa;
        if (!p || a < 0.01) return null;
        ctx.save();
        ctx.globalAlpha *= a;
        var w = NK.Mol.bredde(ctx, p.t, fs) + fs * 1.1, h = fs * 1.6;
        ctx.shadowColor = "rgba(0, 0, 0, 0.14)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = p.fyld;
        NK.rundtRekt(ctx, x - w / 2, y - h / 2, w, h, h / 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = p.kant;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        NK.Mol.tekst(ctx, p.t, x, y, fs, p.farve, "center");
        ctx.restore();
        return { x: x - w / 2, y: y - h / 2, w: w, h: h };
    };

    /* ----- Et valinmolekyle i vinduet paa fane 2 --------------------------------------
       En pille med "Val" og en ladning i hver ende: + for −NH₃⁺ til venstre
       og − for −COO⁻ til hoejre. Kanten har formens farve. */
    T.pille = function (ctx, x, y, b, h, tilst, opt) {
        opt = opt || {};
        var navn = D.formNavn(tilst), farve = D.formFarve(navn);
        ctx.save();
        ctx.translate(x, y);
        if (opt.vinkel) ctx.rotate(opt.vinkel);
        var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "#e9edf1");
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1.5;
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, -b / 2, -h / 2, b, h, h / 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2.4;
        ctx.stroke();
        var r = h * 0.33;
        function prik(cx, tegn, f) {
            ctx.beginPath(); ctx.arc(cx, 0, r, 0, Math.PI * 2);
            ctx.fillStyle = f;
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            ctx.beginPath(); ctx.moveTo(cx - r * 0.5, 0); ctx.lineTo(cx + r * 0.5, 0);
            if (tegn === "+") { ctx.moveTo(cx, -r * 0.5); ctx.lineTo(cx, r * 0.5); }
            ctx.stroke();
        }
        if (tilst.amino) prik(-b / 2 + r + 4, "+", D.FARVE.syre);
        if (!tilst.carboxyl) prik(b / 2 - r - 4, "−", D.FARVE.base);
        ctx.fillStyle = "#2a3342";
        ctx.font = "700 " + Math.round(h * 0.46) + "px " + FONT;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Val", 0, 1);
        if (opt.blink > 0) {
            ctx.globalAlpha = opt.blink * 0.7;
            ctx.strokeStyle = D.FARVE.hydron;
            ctx.lineWidth = 2;
            NK.rundtRekt(ctx, -b / 2 - 4, -h / 2 - 4, b + 8, h + 8, h / 2 + 4);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Et vindue ind i opløsningen (som bogens mo_vindue) -------------------------- */
    T.vindue = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#eef6fb");
        g.addColorStop(1, "#dcebf4");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x, y, b, h, 14);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#5b6878";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    };

    NK.Tegning = T;
}());

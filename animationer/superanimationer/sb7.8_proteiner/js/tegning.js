/* =====================================================================
   tegning.js - tavlen, rammerne, skiltene, skyderne og proteinets dele

   Tavlen, rammerne, skiltet og maerket er de samme som i sb7.7.
   T.tavle(ctx, lay)                   vaeggen, whiteboardet og bakken
   T.gulRamme / T.valgRamme            det, kortet spoerger om / elevens valg
   T.skilt(ctx, x, y, tekst)           et gult skilt med pil ned mod (x, y)
   T.skyder(ctx, s, v, opt)            en vandret skyder (temperatur og pH)
   T.atom(ctx, x, y, r, el, alfa)      et atom som kugle (bogens kuglemodeller)
   T.roer(ctx, pkt, b, opt)            peptidkaeden som groent roer
   T.strengPil(ctx, a, b, h, opt)      en streng i et β-foldeblad (bred pil)
   T.hprikker(ctx, a, b, opt)          en hydrogenbinding (roede prikker)
   T.vand(ctx, x, y, fs, alfa)         et vandmolekyle, H₂O
   T.perle(ctx, x, y, r, tekst, opt)   en aminosyre som perle (primaer struktur)
   T.brik(ctx, x, y, tekst, opt)       et navneskilt, man kan traekke
   T.glas(ctx, x, y, b, h, hvid)       et reagensglas med aeggehvide
   T.hydron(ctx, x, y, r, alfa)        en hydron, H⁺ (orange kugle)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Fm = NK.Formel;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#6b7685";

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;
    T.VALG = "#2f6fde";
    T.FORKERT = "#d9534f";
    T.GUL = "#d69e0c";

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

    /* ----- Rammer ------------------------------------------------------------------ */
    T.gulRamme = function (ctx, x, y, b, h, r, alfa) {
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= alfa;
        NK.rundtRekt(ctx, x, y, b, h, r || 10);
        ctx.fillStyle = "rgba(242, 197, 61, 0.18)";
        ctx.fill();
        ctx.strokeStyle = T.GUL;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
    };

    /* k er en kasse { x, y, w, h } */
    T.valgRamme = function (ctx, k, farve, stiplet, pad) {
        if (!k) return;
        var p = pad === undefined ? 6 : pad;
        ctx.save();
        NK.rundtRekt(ctx, k.x - p, k.y - p, k.w + 2 * p, k.h + 2 * p, 9);
        ctx.fillStyle = farve === T.FORKERT ? "rgba(217, 83, 79, 0.10)" : (farve === T.GUL ? "rgba(242, 197, 61, 0.16)" : "rgba(47, 111, 222, 0.12)");
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2.5;
        if (stiplet) ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
    };

    /* En ring om et punkt */
    T.ring = function (ctx, x, y, r, farve, fyld, bredde, stiplet) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fyld) { ctx.fillStyle = fyld; ctx.fill(); }
        ctx.strokeStyle = farve;
        ctx.lineWidth = bredde || 2.5;
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
        var under = !!opt.under;
        var by = under ? y + 8 : y - h - 8;
        ctx.shadowColor = "rgba(0, 0, 0, 0.18)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#f6d55c";
        NK.rundtRekt(ctx, bx, by, b, h, 6);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        if (under) { ctx.moveTo(x - 6, by + 0.5); ctx.lineTo(x + 6, by + 0.5); ctx.lineTo(x, by - 7); }
        else { ctx.moveTo(x - 6, by + h - 0.5); ctx.lineTo(x + 6, by + h - 0.5); ctx.lineTo(x, by + h + 7); }
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

    /* Et lille maerke med en tekst */
    T.maerke = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT;
        var b = ctx.measureText(tekst).width + 20, h = opt.h || 24;
        var bx = opt.justering === "right" ? x - b : (opt.justering === "center" ? x - b / 2 : x);
        ctx.fillStyle = opt.fyld || "#fff8e1";
        NK.rundtRekt(ctx, bx, y - h / 2, b, h, 7); ctx.fill();
        ctx.strokeStyle = opt.kant || T.GUL;
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, tekst, bx + 10, y + 1, { font: (opt.vaegt || "600") + " " + (opt.str || 13) + "px " + FONT, farve: opt.farve || BLAEK, linje: "middle" });
        return { x: bx, y: y - h / 2, b: b, h: h };
    };

    /* ----- En vandret skyder -----------------------------------------------------------
       s = { x, y, b, min, maks, navn, farver: [[v, farve], ...], tekst(v), aaben }
       aaben: skalaen toner ud i begge ender (pH-skalaen har ingen fast ende,
       brugerens oenske 12. okt. 2026). */
    T.tilX = function (s, v) { return s.x + s.b * (NK.klamp(v, s.min, s.maks) - s.min) / (s.maks - s.min); };
    T.tilV = function (s, x) { return NK.klamp(s.min + (x - s.x) / s.b * (s.maks - s.min), s.min, s.maks); };
    T.paaSkyder = function (s, pt) {
        if (!s || !pt || s.skjult) return false;
        return pt.x > s.x - 18 && pt.x < s.x + s.b + 18 && pt.y > s.y - 24 && pt.y < s.y + 20;
    };

    T.skyder = function (ctx, s, v, opt) {
        opt = opt || {};
        var laast = !!opt.laast, h = 10;
        ctx.save();
        ctx.globalAlpha = laast ? 0.55 : 1;
        var x0 = s.aaben ? s.x - 26 : s.x, x1 = s.aaben ? s.x + s.b + 26 : s.x + s.b;
        var g = ctx.createLinearGradient(x0, 0, x1, 0);
        s.farver.forEach(function (p) {
            var u = (T.tilX(s, p[0]) - x0) / (x1 - x0);
            g.addColorStop(NK.klamp(u, 0, 1), p[1]);
        });
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x0, s.y - h / 2, x1 - x0, h, h / 2);
        ctx.fill();
        if (s.aaben) {
            /* Enderne toner ud i tavlens farve */
            [[x0, x0 + 30], [x1, x1 - 30]].forEach(function (e) {
                var ge = ctx.createLinearGradient(e[0], 0, e[1], 0);
                ge.addColorStop(0, "rgba(246, 248, 247, 1)");
                ge.addColorStop(1, "rgba(246, 248, 247, 0)");
                ctx.fillStyle = ge;
                ctx.fillRect(Math.min(e[0], e[1]), s.y - h / 2 - 1, 30, h + 2);
            });
        } else {
            ctx.strokeStyle = "rgba(29, 36, 51, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
        /* Tallene under sporet */
        var trin = s.trin || 1;
        for (var p = s.min; p <= s.maks + 1e-9; p += trin) {
            var x = T.tilX(s, p);
            ctx.save();
            ctx.strokeStyle = "rgba(29, 36, 51, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x, s.y + h / 2 + 1); ctx.lineTo(x, s.y + h / 2 + 5); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, s.tal ? s.tal(p) : String(p).replace("-", "−"), x, s.y + h / 2 + 15, { font: "600 12px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        if (s.navn) NK.tekst(ctx, s.navn, (s.aaben ? x0 : s.x) - 14, s.y + 1, { font: "800 14px " + FONT, farve: BLAEK, justering: "right", linje: "middle" });
        /* Knappen med tallet over */
        var kx = T.tilX(s, v);
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
        var tekst = s.tekst(v);
        ctx.save();
        ctx.font = "800 14px " + FONT;
        var tb = ctx.measureText(tekst).width + 16, th = 23;
        var tx = NK.klamp(kx - tb / 2, s.x - 30, s.x + s.b + 30 - tb), ty = s.y - 21 - th;
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

    /* ----- Atomer som kugler (bogens kuglemodeller) --------------------------------- */
    var KUGLE = {
        C: ["#8a909a", "#4b5058", "#2a2e34"],
        H: ["#ffffff", "#e9ecef", "#b6bcc4"],
        O: ["#ff9a8a", "#e0533f", "#a3291c"],
        N: ["#a9c4ff", "#3b6fd8", "#1f3f8f"],
        S: ["#fff0a6", "#e8b92a", "#a37b00"]
    };
    T.atom = function (ctx, x, y, r, el, alfa) {
        var f = KUGLE[el] || KUGLE.C, a = alfa === undefined ? 1 : alfa;
        if (a < 0.01 || !(r > 0)) return;
        ctx.save();
        ctx.globalAlpha *= a;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(0.6, f[1]);
        g.addColorStop(1, f[2]);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(20, 24, 30, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
    };

    /* En kort binding mellem to kugler */
    T.pind = function (ctx, a, b, r, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.strokeStyle = "#9aa1ab";
        ctx.lineWidth = Math.max(2, r * 0.42);
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.restore();
    };

    /* En bloed gloed om en ladet gruppe: roed for +, blaa for − (som bogen) */
    T.gloed = function (ctx, x, y, r, q, alfa) {
        var a = alfa === undefined ? 1 : alfa;
        if (!q || a < 0.01) return;
        ctx.save();
        var f = q > 0 ? "224, 83, 63" : "59, 111, 216";
        var g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        g.addColorStop(0, "rgba(" + f + ", " + (0.34 * a) + ")");
        g.addColorStop(1, "rgba(" + f + ", 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    /* Den lilla-graa sky om upolaere grupper (londonbindinger) */
    T.sky = function (ctx, x, y, rx, ry, alfa) {
        var a = alfa === undefined ? 1 : alfa;
        if (a < 0.01) return;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, ry / rx);
        var g = ctx.createRadialGradient(0, 0, rx * 0.15, 0, 0, rx);
        g.addColorStop(0, "rgba(140, 120, 190, " + (0.30 * a) + ")");
        g.addColorStop(1, "rgba(140, 120, 190, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    };

    T.tegnLadning = function (ctx, x, y, q, fs, alfa) {
        if (!q) return;
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        NK.tekst(ctx, q > 0 ? "+" : "−", x, y, { font: "800 " + Math.round(fs) + "px " + FONT, farve: q > 0 ? "#b4271a" : "#1d4ed8", justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* ----- Roeret: peptidkaeden som et groent roer (bogens figurer) --------------------
       pkt er en liste af { x, y }. Kurven glattes gennem midtpunkterne. */
    function sti(ctx, pkt) {
        ctx.beginPath();
        ctx.moveTo(pkt[0].x, pkt[0].y);
        if (pkt.length === 2) { ctx.lineTo(pkt[1].x, pkt[1].y); return; }
        for (var i = 1; i < pkt.length - 1; i++) {
            var mx = (pkt[i].x + pkt[i + 1].x) / 2, my = (pkt[i].y + pkt[i + 1].y) / 2;
            ctx.quadraticCurveTo(pkt[i].x, pkt[i].y, mx, my);
        }
        var s = pkt[pkt.length - 1];
        ctx.lineTo(s.x, s.y);
    }
    T.sti = sti;

    T.roer = function (ctx, pkt, b, opt) {
        opt = opt || {};
        if (!pkt || pkt.length < 2) return;
        var moerk = opt.moerk || D.FARVE.roerMoerk, mid = opt.farve || D.FARVE.roer, lys = opt.lys || D.FARVE.roerLys;
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        sti(ctx, pkt);
        ctx.strokeStyle = moerk;
        ctx.lineWidth = b;
        ctx.stroke();
        sti(ctx, pkt);
        ctx.strokeStyle = mid;
        ctx.lineWidth = b * 0.62;
        ctx.stroke();
        ctx.translate(-b * 0.08, -b * 0.12);
        sti(ctx, pkt);
        ctx.strokeStyle = lys;
        ctx.globalAlpha *= 0.75;
        ctx.lineWidth = b * 0.18;
        ctx.stroke();
        ctx.restore();
    };

    /* ----- En streng i et β-foldeblad: en bred, flad pil fra a til b ------------------- */
    T.strengPil = function (ctx, a, b, h, opt) {
        opt = opt || {};
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
        if (l < 4) return;
        var ux = dx / l, uy = dy / l, nx = -uy, ny = ux;
        var hoved = Math.min(l * 0.3, h * 1.5), hb = h * 0.95, sb = h * 0.5;
        function p(s, t) { return { x: a.x + ux * s + nx * t, y: a.y + uy * s + ny * t }; }
        var form = [p(0, -sb), p(l - hoved, -sb), p(l - hoved, -hb), p(l, 0), p(l - hoved, hb), p(l - hoved, sb), p(0, sb)];
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        /* Kanten nedenunder giver pilen tykkelse */
        ctx.translate(0, h * 0.28);
        ctx.beginPath();
        form.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.closePath();
        ctx.fillStyle = opt.moerk || D.FARVE.roerMoerk;
        ctx.fill();
        ctx.translate(0, -h * 0.28);
        var g = ctx.createLinearGradient(0, a.y - hb, 0, a.y + hb);
        g.addColorStop(0, opt.lys || "#a8ddd3");
        g.addColorStop(1, opt.farve || "#5fb3a5");
        ctx.beginPath();
        form.forEach(function (q, i) { if (i) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = opt.moerk || D.FARVE.roerMoerk;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();
    };

    /* ----- En hydrogenbinding: roede prikker fra a til b ---------------------------- */
    T.hprikker = function (ctx, a, b, opt) {
        opt = opt || {};
        var dx = b.x - a.x, dy = b.y - a.y, l = Math.sqrt(dx * dx + dy * dy);
        if (l < 2) return;
        var r = opt.r || 2.2, afst = opt.afst || r * 3.2;
        var n = Math.max(1, Math.floor(l / afst));
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        ctx.fillStyle = opt.farve || D.FARVE.hbind;
        for (var i = 0; i <= n; i++) {
            var t = i / n;
            ctx.beginPath(); ctx.arc(a.x + dx * t, a.y + dy * t, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };

    /* ----- Et vandmolekyle i bogens groenne farve ----------------------------------------- */
    T.vand = function (ctx, x, y, fs, alfa) {
        var a = alfa === undefined ? 1 : alfa;
        if (a < 0.01) return null;
        ctx.save();
        ctx.globalAlpha *= a;
        var b = Fm.bredde(ctx, "H_2O", fs) + fs * 0.7, h = fs * 1.45;
        ctx.fillStyle = "rgba(215, 238, 234, 0.95)";
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = D.FARVE.groen;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        Fm.tekst(ctx, "H_2O", x, y, fs, D.FARVE.groen, "center");
        ctx.restore();
        return { x: x - b / 2, y: y - h / 2, w: b, h: h };
    };

    /* ----- En aminosyre som perle (bogens primaere struktur) -------------------------
       opt: fyld, kant, alfa, gul (den naeste i opskriften), greb */
    T.perle = function (ctx, x, y, r, tekst, opt) {
        opt = opt || {};
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        ctx.shadowColor = "rgba(0, 0, 0, " + (opt.greb ? 0.28 : 0.14) + ")";
        ctx.shadowBlur = opt.greb ? 10 : 4;
        ctx.shadowOffsetY = opt.greb ? 4 : 1.5;
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, opt.lys || "#e6f6f2");
        g.addColorStop(1, opt.fyld || "#a9dccf");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = opt.kant || D.FARVE.groen;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        NK.tekst(ctx, tekst, x, y + 1, { font: "800 " + Math.round(r * 0.66) + "px " + FONT, farve: opt.farve || "#0b4f49", justering: "center", linje: "middle" });
        ctx.restore();
    };

    /* ----- Et navneskilt, der kan traekkes (fane 2 og 3) -------------------------------
       opt: str, valgt, forkert, rigtig, greb, gul, min (mindste bredde) */
    T.brikMaal = function (ctx, tekst, str) {
        ctx.save();
        ctx.font = "700 " + (str || 14) + "px " + FONT;
        var b = ctx.measureText(tekst).width + 22;
        ctx.restore();
        return b;
    };
    T.brik = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        var str = opt.str || 14, h = Math.round(str * 2);
        var b = Math.max(opt.min || 0, T.brikMaal(ctx, tekst, str));
        var bx = x - b / 2, by = y - h / 2;
        var kant = "#8a8270", fyld = "#fffdf6", farve = BLAEK;
        if (opt.gul) { kant = T.GUL; fyld = "#fff4cf"; }
        if (opt.valgt) { kant = T.VALG; fyld = "#eaf1ff"; farve = "#1b4fb4"; }
        if (opt.forkert) { kant = T.FORKERT; fyld = "#fdeceb"; farve = "#a3271f"; }
        if (opt.rigtig) { kant = "#2f8a57"; fyld = "#e5f5ec"; farve = "#1f6b41"; }
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        ctx.shadowColor = "rgba(0, 0, 0, " + (opt.greb ? 0.3 : 0.14) + ")";
        ctx.shadowBlur = opt.greb ? 10 : 3;
        ctx.shadowOffsetY = opt.greb ? 4 : 1.5;
        ctx.fillStyle = fyld;
        NK.rundtRekt(ctx, bx, by, b, h, 8);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = kant;
        ctx.lineWidth = opt.valgt || opt.forkert || opt.rigtig || opt.gul ? 2.2 : 1.4;
        ctx.stroke();
        ctx.restore();
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        NK.tekst(ctx, tekst, x, y + 1, { font: "700 " + str + "px " + FONT, farve: farve, justering: "center", linje: "middle" });
        ctx.restore();
        return { x: bx, y: by, w: b, h: h, cx: x, cy: y };
    };

    /* En tom plads til en brik (stiplet) */
    T.plads = function (ctx, x, y, b, h, opt) {
        opt = opt || {};
        ctx.save();
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, 8);
        ctx.fillStyle = opt.lys ? "rgba(242, 197, 61, 0.14)" : "rgba(255, 255, 255, 0.55)";
        ctx.fill();
        ctx.setLineDash([5, 4]);
        ctx.strokeStyle = opt.lys ? T.GUL : "#9aa3ae";
        ctx.lineWidth = opt.lys ? 2.2 : 1.4;
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Et reagensglas med aeggehvide. hvid: 0 klar, 1 helt hvid og fast -------------- */
    T.glas = function (ctx, x, y, b, h, hvid) {
        var r = b / 2, bund = y + h - r;
        var fy = y + h * 0.28;          /* vaeskens overflade */
        ctx.save();
        /* Vaesken */
        ctx.beginPath();
        ctx.moveTo(x + 3, fy);
        ctx.lineTo(x + 3, bund);
        ctx.arc(x + r, bund, r - 3, Math.PI, 0, true);
        ctx.lineTo(x + b - 3, fy);
        ctx.closePath();
        var w = NK.klamp(hvid, 0, 1);
        /* Klar aeggehvide er svagt gul og gennemsigtig; kogt er hvid og uigennemsigtig
           med graa skygger, saa den kan ses paa den lyse tavle */
        var g = ctx.createLinearGradient(x, 0, x + b, 0);
        function bl(a, c) { return Math.round(a + (c - a) * w); }
        g.addColorStop(0, "rgba(" + bl(236, 196) + "," + bl(226, 193) + "," + bl(170, 184) + "," + (0.55 + 0.45 * w) + ")");
        g.addColorStop(0.45, "rgba(" + bl(252, 255) + "," + bl(246, 255) + "," + bl(214, 253) + "," + (0.45 + 0.55 * w) + ")");
        g.addColorStop(1, "rgba(" + bl(236, 186) + "," + bl(226, 183) + "," + bl(170, 174) + "," + (0.55 + 0.45 * w) + ")");
        ctx.fillStyle = g;
        ctx.fill();
        if (w > 0.05) {
            /* Klumperne i den kogte aeggehvide */
            ctx.save();
            ctx.clip();
            ctx.globalAlpha = w * 0.5;
            ctx.fillStyle = "#cfcbbf";
            for (var i = 0; i < 9; i++) {
                var px = x + b * (0.2 + 0.6 * ((i * 37) % 10) / 10), py = fy + (bund - fy) * ((i * 53) % 10) / 10;
                ctx.beginPath(); ctx.ellipse(px, py, b * 0.16, b * 0.09, 0.4 * i, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        }
        /* Overfladen */
        ctx.strokeStyle = "rgba(160, 150, 110, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x + 4, fy); ctx.lineTo(x + b - 4, fy); ctx.stroke();
        /* Glasset */
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, bund);
        ctx.arc(x + r, bund, r, Math.PI, 0, true);
        ctx.lineTo(x + b, y);
        ctx.strokeStyle = "rgba(90, 110, 130, 0.85)";
        ctx.lineWidth = 2.2;
        ctx.stroke();
        /* Kanten foroven og et lysglimt */
        ctx.beginPath(); ctx.ellipse(x + r, y, r + 1.5, 3.2, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(90, 110, 130, 0.7)"; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + b * 0.2, y + h * 0.08); ctx.lineTo(x + b * 0.2, bund - r * 0.4);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)"; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.stroke();
        ctx.restore();
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
        Fm.tekst(ctx, "H^+", x - r * 0.06, y, r * 0.95, "#ffffff", "center");
        ctx.restore();
    };

    NK.Tegning = T;
}());

/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen, vaegten med vejebaaden (som sc4.5 og sc5.1),
   den koniske kolbe med syren, boblerne, skummet og draaberne, morteren
   og muslingen, luppen med ionerne ved bunden af kolben, CO₂-skyen,
   soejlen med kalkindholdet og pilene paa fane 2. Funktionerne tegner
   én ting et bestemt sted og husker intet selv, bortset fra de smaa
   partikelsystemer (bobler, pust, draaber og luppen), der hver hoerer
   til én kolbe. Fanerne bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

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

    /* Pulveret af knuste muslingeskaller */
    T.PULVER = "#efe5d0";
    var PULVER_ST = { pulver: T.PULVER };

    /* ----- Rummet, bordet og tavlen (som sc4.5) ------------------------------------ */
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
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

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
        ctx.moveTo(r.x + r.b * 0.62, r.y);
        ctx.lineTo(r.x + r.b * 0.74, r.y);
        ctx.lineTo(r.x + r.b * 0.56, r.y + r.h);
        ctx.lineTo(r.x + r.b * 0.44, r.y + r.h);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#9aa1ab";
        ctx.fillRect(r.x - 6, r.y + r.h + 6, r.b + 12, 6);
        ctx.fillStyle = "#2f7ad1";
        NK.rundtRekt(ctx, r.x + r.b * 0.8, r.y + r.h + 2, 30, 5, 2.5);
        ctx.fill();
        ctx.fillStyle = "#c63b2f";
        NK.rundtRekt(ctx, r.x + r.b * 0.8 + 36, r.y + r.h + 2, 30, 5, 2.5);
        ctx.fill();
        ctx.restore();
    };

    /* En lille pil, der hopper over det, der skal bruges nu */
    T.pegepil = function (ctx, x, y, tid) {
        var hop = Math.sin((tid || 0) * 5) * 5;
        ctx.save();
        ctx.fillStyle = "#f2c53d";
        ctx.beginPath();
        ctx.moveTo(x, y + hop);
        ctx.lineTo(x - 9, y - 14 + hop);
        ctx.lineTo(x + 9, y - 14 + hop);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* En lille etiket paa bordet under en ting */
    T.etiket = function (ctx, tekst, x, y, px, farve) {
        NK.tekst(ctx, tekst, x, y, { font: font("700", px), justering: "center", linje: "middle", farve: farve || "#c8ced6" });
    };

    /* ----- Vaegten og pulveret i vejebaaden (som sc4.5) ------------------------------ */
    T.vaegtHoejde = function (b) { return MAAL.vaegt.h * b / MAAL.vaegt.b; };

    T.vaegt = function (ctx, x, y, b, tekst, v) {
        v = v || {};
        var M = MAAL.vaegt, k = b / M.b, h = M.h * k;
        var x0 = x - b / 2, y0 = y - M.bund * k;
        if (v.lys) {
            ctx.save();
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.35 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 2.5;
            NK.rundtRekt(ctx, x0 + 6 * k, y0 + 30 * k, b - 12 * k, h - 28 * k, 10 * k);
            ctx.stroke();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vaegt", x0, y0, b, h);
        var dx = x0 + M.dispV * k, dy = y0 + M.dispTop * k, db = (M.dispH - M.dispV) * k, dh = (M.dispBund - M.dispTop) * k;
        ctx.save();
        ctx.fillStyle = "rgba(125, 240, 192, 0.06)";
        ctx.fillRect(dx + 2, dy + 2, db - 4, dh - 4);
        ctx.fillStyle = v.roed ? "#ff9d8f" : "#7df0c0";
        ctx.shadowColor = v.roed ? "rgba(255, 140, 120, 0.6)" : "rgba(125, 240, 192, 0.6)";
        ctx.shadowBlur = 6;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        var px = NK.klamp(dh * 0.72, 12, 30);
        ctx.font = "700 " + px + "px " + DISPLAY;
        var t = tekst || "";
        while (px > 11 && ctx.measureText(t).width > db - 8) { px -= 0.5; ctx.font = "700 " + px + "px " + DISPLAY; }
        ctx.fillText(t, dx + db - 6, dy + dh / 2 + 1);
        ctx.restore();
        return { x: x, y: y0 + M.skaalY * k, b: M.skaalB * k, k: k, top: y0, h: h, disp: { x: dx, y: dy, b: db, h: dh } };
    };

    /* Vejebaaden med en bunke pulver: t 0-1 er bunkens stoerrelse */
    T.bunke = function (ctx, x, y, bb, farve, t, hoejde, nr) {
        var M = MAAL.vejebaad, k = bb / M.b, h = M.h * k;
        var x0 = x - bb / 2, y0 = y - M.bund * k;
        var bundY = y0 + M.indBund * k + 4 * k;
        var tt = Math.sqrt(NK.klamp(t, 0, 1));
        var hh = hoejde * tt;
        var ix0 = x0 + (M.indV + 4) * k, ix1 = x0 + (M.indH - 4) * k;
        var bredde = (ix1 - ix0) * (0.45 + 0.55 * tt);
        var a0 = x - bredde / 2, a1 = x + bredde / 2;
        ctx.save();
        if (hh > 0.5) {
            var g = ctx.createLinearGradient(0, bundY - hh, 0, bundY);
            g.addColorStop(0, nuance(farve, 0.12));
            g.addColorStop(1, nuance(farve, -0.22));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(a0, bundY + 2);
            ctx.quadraticCurveTo(a0 + bredde * 0.18, bundY - hh * 0.55, x - bredde * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(x, bundY - hh * 1.06, x + bredde * 0.12, bundY - hh * 0.96);
            ctx.quadraticCurveTo(a1 - bredde * 0.18, bundY - hh * 0.55, a1, bundY + 2);
            ctx.closePath();
            ctx.fill();
            ctx.save();
            ctx.clip();
            var r = froe((nr || 0) + 17);
            for (var i = 0; i < 110; i++) {
                var lyst = r() < 0.45;
                ctx.fillStyle = lyst ? "rgba(255,255,255,0.6)" : "rgba(90,60,20,0.2)";
                var s = lyst ? 1.3 : 1.8;
                ctx.fillRect(a0 + r() * bredde, bundY - r() * hh * 1.05, s, s);
            }
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "vejebaad", x0, y0, bb, h);
        ctx.restore();
        return { x0: x0, y0: y0, b: bb, h: h, top: bundY - hh };
    };

    /* En lille bunke pulver (paa spatlen, paa vej ned, paa bordet) */
    T.pulver = function (ctx, x, y, b, h, farve, nr) {
        if (b < 1 || h < 0.5) return;
        ctx.save();
        var g = ctx.createLinearGradient(0, y - h, 0, y);
        g.addColorStop(0, nuance(farve, 0.15));
        g.addColorStop(1, nuance(farve, -0.2));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - b / 2, y);
        ctx.quadraticCurveTo(x - b * 0.3, y - h, x, y - h);
        ctx.quadraticCurveTo(x + b * 0.3, y - h, x + b / 2, y);
        ctx.closePath();
        ctx.fill();
        var r = froe((nr || 0) + 5);
        for (var i = 0; i < Math.min(60, b * 0.8); i++) {
            ctx.fillStyle = r() < 0.5 ? "rgba(255,255,255,0.5)" : "rgba(90,60,20,0.2)";
            ctx.fillRect(x - b * 0.4 + r() * b * 0.8, y - r() * h * 0.9, 1.3, 1.3);
        }
        ctx.restore();
    };

    /* Grove stykker skal: smaa kantede flager */
    T.stykker = function (ctx, x, y, b, n, nr) {
        var r = froe((nr || 0) + 31);
        ctx.save();
        for (var i = 0; i < n; i++) {
            var cx = x + (r() - 0.5) * b, s = 3 + r() * 5, v = r() * Math.PI;
            ctx.save();
            ctx.translate(cx, y - s * 0.5 - r() * 3);
            ctx.rotate(v);
            ctx.fillStyle = r() < 0.5 ? "#e8d8b8" : "#d4bd94";
            ctx.strokeStyle = "rgba(90, 60, 20, 0.45)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-s, -s * 0.4);
            ctx.lineTo(s * 0.6, -s * 0.7);
            ctx.lineTo(s, s * 0.3);
            ctx.lineTo(-s * 0.3, s * 0.6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };

    /* ----- Spatlen: bladets midte i (x, y), b er bredden. pulver: 0-1 ------------ */
    T.spatel = function (ctx, x, y, b, vinkel, pulver) {
        var M = MAAL.spatel, k = b / M.b;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(vinkel || 0);
        NK.Sprites.tegn(ctx, "spatel", -M.bladX * k, -M.bladY * k, b, M.h * k);
        if (pulver > 0.01) T.pulver(ctx, 0, -2 * k, 30 * k, 12 * k * Math.sqrt(pulver), T.PULVER, 9);
        ctx.restore();
    };

    /* ----- Den koniske kolbe (100 mL) -----------------------------------------------
       (cx, y): midten og bunden (vaegtens skaal). h: hoejden. Indersiden
       i filens enheder: halsen x 60-90 fra y 6 til 62, bunden y 192
       mellem x 15 og 135. 20 mL staar 22 enheder over bunden. */
    var KB = MAAL.kolbe;
    T.kolbeGeo = function (cx, y, h) {
        var k = h / KB.h, b = KB.b * k;
        var x0 = cx - b / 2, y0 = y - KB.bund * k;
        return { k: k, x0: x0, y0: y0, b: b, h: h, cx: cx,
                 mund: { x: cx, y: y0 + 4 * k }, bund: y0 + 192 * k,
                 X: function (u) { return x0 + u * k; }, Y: function (v) { return y0 + v * k; },
                 yV: function (mL) { return y0 + (192 - 1.1 * mL) * k; },
                 /* indersidens halve bredde i hoejden v (filens enheder) */
                 halv: function (v) {
                     if (v <= 62) return 15;
                     return 15 + 45 * NK.klamp((v - 62) / 118, 0, 1);
                 } };
    };

    function kolbeIndre(ctx, g) {
        ctx.beginPath();
        ctx.moveTo(g.X(60), g.Y(6));
        ctx.lineTo(g.X(60), g.Y(62));
        ctx.lineTo(g.X(15), g.Y(180));
        ctx.quadraticCurveTo(g.X(13), g.Y(192), g.X(24), g.Y(192));
        ctx.lineTo(g.X(126), g.Y(192));
        ctx.quadraticCurveTo(g.X(137), g.Y(192), g.X(135), g.Y(180));
        ctx.lineTo(g.X(90), g.Y(62));
        ctx.lineTo(g.X(90), g.Y(6));
        ctx.closePath();
    }

    /* v: { V (mL syre), kalk (g, der ikke har reageret), rest (g, der ikke
       er kalk), grov, skum (0-1), uklar (0-1), bobler (NK.Bobler), lys } */
    T.kolbe = function (ctx, g, v) {
        var k = g.k;
        ctx.save();
        if (v.lys) {
            ctx.fillStyle = "rgba(242, 197, 61, " + (0.12 * v.lys) + ")";
            ctx.beginPath();
            ctx.ellipse(g.cx, g.Y(140), 70 * k, 70 * k, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        kolbeIndre(ctx, g);
        ctx.clip();
        var ly = g.yV(v.V || 20) - (v.skum || 0) * 5 * k;
        ctx.fillStyle = "rgba(176, 212, 240, 0.26)";
        ctx.fillRect(g.x0, ly, g.b, g.bund - ly + 2);
        if (v.uklar > 0.01) {
            ctx.fillStyle = "rgba(245, 240, 228, " + (0.3 * v.uklar).toFixed(3) + ")";
            ctx.fillRect(g.x0, ly, g.b, g.bund - ly + 2);
        }
        ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
        ctx.fillRect(g.x0, ly, g.b, Math.max(1.2, 1.6 * k));
        /* Pulveret og resten paa bunden */
        var bw = NK.klamp(v.kalk * 150, 0, 96) * k;
        if (v.kalk > 0.002) {
            if (v.grov) T.stykker(ctx, g.cx, g.bund, NK.klamp(v.kalk * 120, 20, 90) * k, Math.ceil(NK.klamp(v.kalk * 40, 2, 34)), 4);
            else T.pulver(ctx, g.cx, g.bund, Math.max(10 * k, bw), NK.klamp(v.kalk * 26, 1.5, 14) * k, T.PULVER, 3);
        }
        if (v.rest > 0.004) {
            var rr = froe(11);
            ctx.fillStyle = "rgba(150, 110, 60, 0.75)";
            var n = Math.round(NK.klamp(v.rest * 300, 2, 16));
            for (var i = 0; i < n; i++) {
                ctx.fillRect(g.cx + (rr() - 0.5) * 70 * k, g.bund - 2 * k - rr() * 3 * k, 2.2 * k, 1.4 * k);
            }
        }
        if (v.bobler) v.bobler.tegn(ctx, g, ly);
        /* Skummet paa overfladen */
        if (v.skum > 0.02) {
            var vl = (ly - g.y0) / k, hb = g.halv(vl);
            var rs = froe(19);
            ctx.fillStyle = "rgba(250, 250, 246, " + (0.35 + 0.5 * v.skum).toFixed(3) + ")";
            for (var j = 0; j < 26; j++) {
                var x = g.X(75 + (rs() * 2 - 1) * hb), rad = (2 + rs() * 4) * k * (0.5 + v.skum);
                ctx.beginPath();
                ctx.arc(x, ly - rs() * 5 * k * v.skum, rad, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
        NK.Sprites.tegn(ctx, "kolbe", g.x0, g.y0, g.b, g.h);
        ctx.restore();
    };

    /* ----- Boblerne i kolben -----------------------------------------------------------
       Nye bobler starter ved pulveret paa bunden, flere jo hurtigere
       reaktionen gaar (g CO₂ pr. sekund), og stiger op til overfladen. */
    function Bobler(nr) {
        this.b = [];
        this.r = froe(nr || 1);
        this.akku = 0;
    }
    Bobler.prototype.opdater = function (dt, rate) {
        this.akku += dt * Math.min(90, rate * 900);
        while (this.akku >= 1) {
            this.akku -= 1;
            this.b.push({ x: (this.r() - 0.5) * 0.9, v: 186, r: 1.2 + this.r() * 2.2, fart: 40 + this.r() * 50 });
        }
        var mig = this;
        this.b.forEach(function (q) { q.v -= q.fart * dt; q.x += (mig.r() - 0.5) * 0.02; });
        this.b = this.b.filter(function (q) { return q.v > 60 && !q.ude; });
        if (this.b.length > 160) this.b.splice(0, this.b.length - 160);
    };
    Bobler.prototype.tegn = function (ctx, g, ly) {
        var k = g.k;
        ctx.save();
        ctx.strokeStyle = "rgba(235, 245, 255, 0.8)";
        ctx.fillStyle = "rgba(235, 245, 255, 0.18)";
        ctx.lineWidth = 1;
        this.b.forEach(function (q) {
            var y = g.Y(q.v);
            if (y < ly) { q.ude = true; return; }
            var x = g.X(75 + q.x * g.halv(q.v));
            ctx.beginPath();
            ctx.arc(x, y, q.r * k, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    };
    NK.Bobler = Bobler;

    /* ----- CO₂, der forlader kolben: svage pust op fra halsen ------------------------- */
    function Pust(nr) {
        this.p = [];
        this.r = froe(nr || 2);
        this.akku = 0;
    }
    Pust.prototype.opdater = function (dt, rate) {
        this.akku += dt * Math.min(12, rate * 110);
        while (this.akku >= 1) {
            this.akku -= 1;
            this.nr = (this.nr || 0) + 1;
            this.p.push({ x: (this.r() - 0.5) * 10, y: 0, r: 6 + this.r() * 6, a: 0.5, vx: (this.r() - 0.5) * 16, navn: this.nr % 5 === 1 });
        }
        this.p.forEach(function (q) { q.y -= 34 * dt; q.x += q.vx * dt; q.r += 9 * dt; q.a -= 0.32 * dt; });
        this.p = this.p.filter(function (q) { return q.a > 0; });
    };
    Pust.prototype.tegn = function (ctx, x, y, k) {
        ctx.save();
        this.p.forEach(function (q) {
            ctx.fillStyle = "rgba(210, 218, 228, " + (q.a * 0.35).toFixed(3) + ")";
            ctx.beginPath();
            ctx.arc(x + q.x * k, y + q.y * k, q.r * k, 0, Math.PI * 2);
            ctx.fill();
        });
        /* Hvert femte pust har navnet paa, saa det er tydeligt, hvad der forsvinder */
        this.p.forEach(function (q) {
            if (!q.navn || q.a < 0.08) return;
            NK.tekst(ctx, "CO₂", x + q.x * k + 14, y + q.y * k, { font: "700 13px 'Segoe UI', sans-serif", linje: "middle",
                farve: "rgba(223, 230, 238, " + Math.min(1, q.a * 2).toFixed(3) + ")" });
        });
        ctx.restore();
    };
    Pust.prototype.antal = function () { return this.p.length; };
    NK.Pust = Pust;

    /* ----- Draaber, der sproejter ud af kolben og lander paa bordet ------------------ */
    function Draaber(nr) {
        this.d = [];
        this.pletter = [];
        this.r = froe(nr || 3);
    }
    Draaber.prototype.sprojt = function (antal) {
        for (var i = 0; i < antal; i++) {
            var side = this.r() < 0.5 ? -1 : 1;
            this.d.push({ x: 0, y: 0, vx: side * (30 + this.r() * 70), vy: -(90 + this.r() * 110), r: 1.4 + this.r() * 1.6 });
        }
    };
    /* bund: hvor langt under mundingen bordet er (i px) */
    Draaber.prototype.opdater = function (dt, bund) {
        var mig = this;
        this.d.forEach(function (q) {
            q.vy += 420 * dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            if (q.y >= bund) { q.slut = true; if (mig.pletter.length < 40) mig.pletter.push({ x: q.x, r: q.r * 1.8 }); }
        });
        this.d = this.d.filter(function (q) { return !q.slut; });
    };
    Draaber.prototype.tegn = function (ctx, x, y, bund) {
        ctx.save();
        ctx.fillStyle = "rgba(200, 228, 250, 0.85)";
        this.d.forEach(function (q) {
            ctx.beginPath();
            ctx.arc(x + q.x, y + q.y, q.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.fillStyle = "rgba(170, 205, 235, 0.35)";
        this.pletter.forEach(function (p) {
            ctx.beginPath();
            ctx.ellipse(x + p.x, y + bund + 1, p.r * 1.6, p.r * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };
    NK.Draaber = Draaber;

    /* ----- Morteren og muslingen (pynt og paaskeaeg paa fane 1) ------------------------ */
    T.morter = function (ctx, cx, y, b, lys) {
        var M = MAAL.morter, h = M.h * b / M.b;
        if (lys) T.skaer(ctx, cx, y - h * 0.5, b * 0.6, h * 0.6);
        NK.Sprites.tegn(ctx, "morter", cx - b / 2, y - h + 4 * b / M.b, b, h);
        return { x: cx - b / 2, y: y - h, b: b, h: h };
    };

    T.musling = function (ctx, cx, y, b, lys, vinkel) {
        var M = MAAL.muslingeskal, h = M.h * b / M.b;
        if (lys) T.skaer(ctx, cx, y - h * 0.5, b * 0.62, h * 0.62);
        ctx.save();
        ctx.translate(cx, y - h * 0.5);
        ctx.rotate(vinkel || 0);
        NK.Sprites.tegn(ctx, "muslingeskal", -b / 2, -h * 0.5, b, h);
        ctx.restore();
        return { x: cx - b / 2, y: y - h, b: b, h: h };
    };

    /* Et gult skaer bag noget, musen er over */
    T.skaer = function (ctx, x, y, rx, ry) {
        ctx.save();
        var g = ctx.createRadialGradient(x, y, 1, x, y, Math.max(rx, ry));
        g.addColorStop(0, "rgba(242, 197, 61, 0.28)");
        g.addColorStop(1, "rgba(242, 197, 61, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Luppen ved bunden af kolben -------------------------------------------------
       Kornet af kalk er et gitter af Ca²⁺ og CO₃²⁻ nederst i luppen. Naar
       kalken i kolben bliver mindre, fjernes gitterpladser oppefra: to
       H₃O⁺ svoemmer hen til en CO₃²⁻, der bliver til CO₂ (og vand), og
       CO₂ stiger op og ud af luppen. Ca²⁺ slipper fri. Antallet af
       pladser foelger kalken i kolben, og antallet af H₃O⁺ foelger syren. */
    var ION = {
        Ca: { t: "Ca²⁺", farve: "#8fd18a", r: 7 },
        CO3: { t: "CO₃²⁻", farve: "#ece5cf", r: 11 },
        H3O: { t: "H₃O⁺", farve: "#e8676b", r: 8 },
        Cl: { t: "Cl⁻", farve: "#7fd3e6", r: 9 },
        CO2: { t: "CO₂", farve: "#aeb6c1", r: 8 }
    };
    T.ION = ION;
    var RAEKKER = [9, 8, 7, 6, 5, 4];
    var PLADSER = (function () {
        var ud = [];
        RAEKKER.forEach(function (n, r) {
            for (var i = 0; i < n; i++) {
                ud.push({ x: (i - (n - 1) / 2) * 0.155, y: 0.74 - r * 0.135, type: (i + r) % 2 === 0 ? "CO3" : "Ca" });
            }
        });
        return ud;
    }());
    var G_PR_PLADS = 0.028;     /* g kalk pr. plads i gitteret */

    function Lup(nr) {
        this.r = froe(nr || 7);
        this.gitter = [];       /* { i (plads), a, doer } */
        this.fri = [];          /* { type, x, y, vx, vy, a, doer, maal } */
        this.handl = [];
        this.caFri = 0;
        for (var i = 0; i < 8; i++) this.ny("Cl");
        for (i = 0; i < 8; i++) this.ny("H3O");
        this.fri.forEach(function (q) { q.a = 1; });
    }

    Lup.prototype.ny = function (type, x, y) {
        var a = this.r() * Math.PI * 2, rr = Math.sqrt(this.r()) * 0.75;
        var q = { type: type, x: x !== undefined ? x : Math.cos(a) * rr, y: y !== undefined ? y : Math.sin(a) * rr - 0.15,
                  vx: (this.r() - 0.5) * 0.3, vy: (this.r() - 0.5) * 0.3, a: 0, doer: false, maal: null };
        this.fri.push(q);
        return q;
    };

    Lup.prototype.antal = function (type) {
        return this.fri.filter(function (q) { return q.type === type && !q.doer; }).length;
    };

    Lup.prototype.levende = function () {
        return this.gitter.filter(function (s) { return !s.doer; });
    };

    /* kalk: g kalk i kolben. syre: den del af syren, der er tilbage (0-1) */
    Lup.prototype.opdater = function (dt, kalk, syre) {
        var mig = this;
        var maal = kalk > 0.0005 ? Math.min(PLADSER.length, Math.ceil(kalk / G_PR_PLADS)) : 0;
        var lev = this.levende();
        /* Nyt pulver: pladserne fyldes nedefra */
        while (lev.length < maal) {
            var s = { i: lev.length ? lev[lev.length - 1].i + 1 : 0, a: 0, doer: false };
            if (s.i >= PLADSER.length) break;
            this.gitter.push(s);
            lev.push(s);
        }
        /* Kalk, der har reageret: den oeverste plads forsvinder */
        var travle = this.handl.length;
        while (lev.length - travle > maal && travle < 4) {
            var top = null;
            for (var j = lev.length - 1; j >= 0; j--) { if (!lev[j].opt) { top = lev[j]; break; } }
            if (!top) break;
            top.opt = true;
            this.fjern(top);
            travle++;
        }
        /* Syren: nye H₃O⁺ kommer til, saa laenge der er syre nok */
        var hMaal = Math.round(8 * NK.klamp(syre, 0, 1));
        var hNu = this.fri.filter(function (q) { return q.type === "H3O" && !q.doer; }).length;
        if (hNu < hMaal && this.r() < dt * 3) this.ny("H3O");
        /* Handlingerne: H₃O⁺ paa vej hen til en CO₃²⁻ */
        this.handl.forEach(function (h) {
            h.t += dt;
            if (h.t >= 0.45 && !h.sket) {
                h.sket = true;
                var p = PLADSER[h.site.i];
                h.site.doer = true;
                if (p.type === "CO3") {
                    var c = mig.ny("CO2", p.x, p.y);
                    c.a = 1; c.vx = (mig.r() - 0.5) * 0.1; c.vy = -0.45;
                    h.h.forEach(function (q) { q.doer = true; });
                } else {
                    var ca = mig.ny("Ca", p.x, p.y);
                    ca.a = 1; ca.vy = -0.2;
                    mig.caFri++;
                }
            }
        });
        this.handl = this.handl.filter(function (h) { return !h.sket; });
        this.gitter.forEach(function (s) { s.a = NK.klamp(s.a + (s.doer ? -dt * 4 : dt * 2.5), 0, 1); });
        this.gitter = this.gitter.filter(function (s) { return !(s.doer && s.a <= 0); });
        /* De frie partikler */
        var r = this.r;
        this.fri.forEach(function (q) {
            if (q.maal) {
                var dx = q.maal.x - q.x, dy = q.maal.y - q.y;
                q.x += dx * Math.min(1, dt * 6);
                q.y += dy * Math.min(1, dt * 6);
            } else if (q.type === "CO2") {
                q.vx += (r() - 0.5) * 0.6 * dt;
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                if (q.y < -0.95) q.doer = true;
            } else {
                q.vx += (r() - 0.5) * 1.2 * dt;
                q.vy += (r() - 0.5) * 1.2 * dt;
                var v = Math.sqrt(q.vx * q.vx + q.vy * q.vy), maks = 0.26;
                if (v > maks) { q.vx *= maks / v; q.vy *= maks / v; }
                q.x += q.vx * dt;
                q.y += q.vy * dt;
                var d = Math.sqrt(q.x * q.x + q.y * q.y);
                if (d > 0.86) {
                    var nx = q.x / d, ny = q.y / d, dot = q.vx * nx + q.vy * ny;
                    q.vx -= 2 * dot * nx; q.vy -= 2 * dot * ny;
                    q.x = nx * 0.86; q.y = ny * 0.86;
                }
                /* Ionerne holder sig over kornet */
                if (q.y > 0.5) { q.y = 0.5; q.vy = -Math.abs(q.vy); }
            }
            q.a = NK.klamp(q.a + (q.doer ? -dt * 2.5 : dt * 2), 0, 1);
        });
        /* For mange frie Ca²⁺: de aeldste svoemmer ud af billedet */
        var caer = this.fri.filter(function (q) { return q.type === "Ca" && !q.doer; });
        if (caer.length > 7) caer[0].doer = true;
        this.fri = this.fri.filter(function (q) { return !(q.doer && q.a <= 0); });
    };

    Lup.prototype.fjern = function (site) {
        var p = PLADSER[site.i];
        var h = { site: site, t: 0, h: [] };
        if (p.type === "CO3") {
            /* De to naermeste H₃O⁺ svoemmer derhen */
            var frie = this.fri.filter(function (q) { return q.type === "H3O" && !q.doer && !q.maal; });
            frie.sort(function (a, b) { return Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y); });
            frie.slice(0, 2).forEach(function (q, i) {
                q.maal = { x: p.x + (i ? 0.07 : -0.07), y: p.y - 0.1 };
                h.h.push(q);
            });
        }
        this.handl.push(h);
    };

    Lup.prototype.tomt = function () { return this.levende().length === 0; };

    T.Lup = Lup;

    /* Tegn luppen med midte (cx, cy) og radius r */
    T.lup = function (ctx, lup, cx, cy, r, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 5, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.clip();
        var bg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
        bg.addColorStop(0, "#15222f");
        bg.addColorStop(1, "#0f1a26");
        ctx.fillStyle = bg;
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        ctx.fillStyle = "rgba(176, 212, 240, 0.12)";
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        var k = r / 120;
        function kugle(ion, x, y, a) {
            var rr = ion.r * NK.klamp(k, 0.6, 1.3);
            ctx.globalAlpha = a;
            var g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.2, x, y, rr);
            g.addColorStop(0, nuance(ion.farve, 0.45));
            g.addColorStop(1, ion.farve);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, rr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        lup.gitter.forEach(function (s) {
            var p = PLADSER[s.i];
            kugle(ION[p.type], cx + p.x * r, cy + p.y * r, s.a);
        });
        lup.fri.forEach(function (q) { kugle(ION[q.type], cx + q.x * r, cy + q.y * r, q.a); });
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.9)" : "#c9d3de";
        ctx.lineWidth = Math.max(4, 6 * k);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.max(2, 3 * k), 0, Math.PI * 2);
        ctx.stroke();
        var px = NK.klamp(14 * k, 13, 16);
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 12, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
        /* Forklaringen: prikkernes farver i to linjer */
        var y = cy + r + px + 10;
        if (v.tekst) {
            NK.tekst(ctx, v.tekst, cx, y, { font: font("700", px), justering: "center", farve: "#f5dd8a" });
            y += px + 8;
        }
        [["Ca", "CO3", "H3O"], ["Cl", "CO2"]].forEach(function (linje) {
            ctx.font = font("600", px);
            var bredder = linje.map(function (id) { return ctx.measureText(ION[id].t).width + px + 6; });
            var samlet = bredder.reduce(function (a, b) { return a + b; }, 0) + 14 * (linje.length - 1);
            var x = cx - samlet / 2;
            linje.forEach(function (id, i) {
                ctx.fillStyle = ION[id].farve;
                ctx.beginPath();
                ctx.arc(x + px * 0.45, y - px * 0.35, px * 0.42, 0, Math.PI * 2);
                ctx.fill();
                NK.tekst(ctx, ION[id].t, x + px + 4, y, { font: font("600", px), farve: "#c8ced6" });
                x += bredder[i] + 14;
            });
            y += px + 7;
        });
        ctx.restore();
        return y;
    };

    /* En stiplet linje fra et punkt til luppen */
    T.lupLinje = function (ctx, x0, y0, x1, y1) {
        ctx.save();
        ctx.strokeStyle = "rgba(223, 230, 238, 0.35)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(223, 230, 238, 0.5)";
        ctx.beginPath();
        ctx.arc(x0, y0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Fane 2: CO₂-skyen, kalken og soejlen ------------------------------------------- */
    /* En sky af CO₂ med midte (x, y). linjer: tekst under CO₂ */
    T.sky = function (ctx, x, y, r, linjer, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa === undefined ? 1 : alfa;
        var dele = [[0, 0, 1], [-0.62, 0.18, 0.72], [0.62, 0.16, 0.74], [-0.3, -0.42, 0.66], [0.34, -0.38, 0.62]];
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        dele.forEach(function (d) {
            ctx.beginPath();
            ctx.arc(x + d[0] * r + 3, y + d[1] * r + 5, d[2] * r * 0.72, 0, Math.PI * 2);
            ctx.fill();
        });
        dele.forEach(function (d) {
            var g = ctx.createRadialGradient(x + d[0] * r - r * 0.2, y + d[1] * r - r * 0.25, r * 0.1, x + d[0] * r, y + d[1] * r, d[2] * r * 0.75);
            g.addColorStop(0, "#f3f6f9");
            g.addColorStop(1, "#c3ccd6");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x + d[0] * r, y + d[1] * r, d[2] * r * 0.72, 0, Math.PI * 2);
            ctx.fill();
        });
        var px = NK.klamp(r * 0.36, 14, 24);
        NK.tekst(ctx, "CO₂", x, y - (linjer.length ? px * 0.35 : 0), { font: font("800", px), justering: "center", linje: "middle", farve: "#2a3140" });
        linjer.forEach(function (l, i) {
            var p2 = NK.klamp(r * 0.24, 13, 17);
            NK.tekst(ctx, l, x, y + px * 0.55 + i * (p2 + 3), { font: font("700", p2), justering: "center", linje: "middle", farve: "#1d5d9c" });
        });
        ctx.restore();
    };

    /* Soejlen: hele proeven med kalken nederst. andel: 0-1 eller null (ukendt) */
    T.soejle = function (ctx, x, y, b, h, andel, overTekst, kalkTekst) {
        ctx.save();
        var x0 = x - b / 2, y0 = y - h;
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        NK.rundtRekt(ctx, x0 + 3, y0 + 5, b, h, 6);
        ctx.fill();
        ctx.fillStyle = "#3a2f24";
        NK.rundtRekt(ctx, x0, y0, b, h, 6);
        ctx.fill();
        /* Det, der ikke er kalk: brunt (protein og vand) */
        ctx.save();
        NK.rundtRekt(ctx, x0, y0, b, h, 6);
        ctx.clip();
        var g = ctx.createLinearGradient(x0, 0, x0 + b, 0);
        g.addColorStop(0, "#8a6a45");
        g.addColorStop(1, "#6f5235");
        ctx.fillStyle = g;
        ctx.fillRect(x0, y0, b, h);
        if (andel !== null && andel !== undefined) {
            var hk = h * NK.klamp(andel, 0, 1);
            var g2 = ctx.createLinearGradient(x0, 0, x0 + b, 0);
            g2.addColorStop(0, "#fbf7ee");
            g2.addColorStop(1, "#e2d8c3");
            ctx.fillStyle = g2;
            ctx.fillRect(x0, y - hk, b, hk);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fillRect(x0, y - hk, b, 1.5);
        } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            for (var i = 0; i < h; i += 10) ctx.fillRect(x0, y0 + i, b, 4);
        }
        ctx.restore();
        ctx.strokeStyle = "#c9d3de";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, x0, y0, b, h, 6);
        ctx.stroke();
        var px = NK.klamp(b * 0.2, 13, 16);
        if (overTekst) NK.tekst(ctx, overTekst, x, y0 - 10, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
        if (kalkTekst) {
            NK.tekst(ctx, kalkTekst, x, y - h * NK.klamp(andel || 0.5, 0.2, 1) / 2, { font: font("800", px + 1), justering: "center", linje: "middle",
                farve: andel !== null && andel !== undefined ? "#2a2218" : "#f5dd8a" });
        }
        ctx.restore();
    };

    /* En vandret pil fra x0 til x1 i hoejden y med en tekst over */
    T.pil = function (ctx, x0, x1, y, tekst, aktiv) {
        ctx.save();
        var farve = aktiv ? "#f2c53d" : "rgba(223, 230, 238, 0.55)";
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1 - 10, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 - 12, y - 7);
        ctx.lineTo(x1 - 12, y + 7);
        ctx.closePath();
        ctx.fill();
        if (tekst) {
            var px = 14;
            NK.passendeSkrift(ctx, tekst, Math.max(40, x1 - x0 - 4), 15, 12, "700");
            px = parseFloat(ctx.font) || 14;
            NK.tekst(ctx, tekst, (x0 + x1) / 2, y - 11, { font: ctx.font, justering: "center", farve: aktiv ? "#f5dd8a" : "#c8ced6" });
            void px;
        }
        ctx.restore();
    };

    /* Et bogstav i en cirkel (gruppe A og B paa fane 3) */
    T.maerke = function (ctx, x, y, r, tekst, farve) {
        ctx.save();
        ctx.fillStyle = farve;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 2;
        ctx.stroke();
        NK.tekst(ctx, tekst, x, y + 1, { font: font("800", r * 1.15), justering: "center", linje: "middle", farve: "#ffffff" });
        ctx.restore();
    };

    NK.Tegn = T;
}());

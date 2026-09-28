/* =====================================================================
   tegning.js - det, fanerne tegner

   Rummet, bordet og tavlen (som sc4.11), vaegten (som sc4.5), den
   varmefaste plade, klumpen af ståluld, der gloeder og bliver sort,
   gnisterne, batteriet, iltflasken med slangen, stjernekasteren,
   luppen med jernatomerne og luften, soejlerne paa fane 2 og
   regnestykket med broekstreger (som sc4.3). Funktionerne tegner én ting
   et bestemt sted og husker intet selv, bortset fra de smaa systemer
   (ulden, gnisterne og luppen), der hver hoerer til én klump. Fanerne
   bestemmer, hvor tingene staar.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var MAAL = NK.Sprites.MAAL;
    var SKRIFT = "'Segoe UI', sans-serif";
    var MATTE = "Cambria, 'Cambria Math', 'Times New Roman', serif";
    var DISPLAY = "Consolas, 'Courier New', monospace";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;
    /* Bogstaverne i formlerne: kursiv som i bogen, saa m og M ikke ligner hinanden */
    T.matte = function (px, vaegt) { return "italic " + (vaegt || "600") + " " + px + "px " + MATTE; };

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

    /* Blanding af to farver: t = 0 giver a, t = 1 giver b */
    function bland(a, b, t) {
        var x = rgb(a), y = rgb(b);
        return "rgb(" + x.map(function (v, i) { return Math.round(v + (y[i] - v) * t); }).join(",") + ")";
    }
    T.bland = bland;

    /* Et fast pseudo-tilfaeldigt tal, saa ting ikke danser */
    function froe(n) {
        var s = (Math.abs(Math.round(n)) * 7919 + 104729) % 233280;
        return function () {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }
    T.froe = froe;

    /* ----- Rummet, bordet og tavlen (som sc4.11) ------------------------------------ */
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

    /* En lille overskrift i smaa versaler (paa tavlen) */
    T.tavleEtiket = function (ctx, tekst, x, y, px, farve) {
        NK.tekst(ctx, tekst.toUpperCase(), x, y, { font: font("700", px), linje: "middle", farve: farve || "#6a7280" });
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

    /* ----- Opgavens tekst over tavlen (som sc4.3) ---------------------------------------
       Én linje, hvis den kan staa med mindst mindst px; ellers to linjer.
       Giver { px, linjer, h }. */
    T.overTavle = function (ctx, tekst, b, stoerst, mindst) {
        var px = NK.passendeSkrift(ctx, tekst, b, stoerst, mindst, "600");
        var lh = function (p) { return Math.round(p * 1.38); };
        if (ctx.measureText(tekst).width <= b) return { px: px, linjer: [tekst], h: lh(px) };
        var ord = tekst.split(" "), bedst = null;
        ctx.font = font("600", stoerst);
        for (var i = 1; i < ord.length; i++) {
            var a = ord.slice(0, i).join(" "), c = ord.slice(i).join(" ");
            var s = Math.max(ctx.measureText(a).width, ctx.measureText(c).width) * (/[.,]$/.test(a) ? 0.8 : 1);
            if (!bedst || s < bedst.s) bedst = { s: s, a: a, c: c };
        }
        px = Math.min(NK.passendeSkrift(ctx, bedst.a, b, stoerst, 12, "600"), NK.passendeSkrift(ctx, bedst.c, b, stoerst, 12, "600"));
        return { px: px, linjer: [bedst.a, bedst.c], h: lh(px) * 2 };
    };

    /* Teksten paa vaeggen med en gul streg foran, saa den ses */
    T.tegnOverTavle = function (ctx, o, x, y) {
        ctx.save();
        ctx.fillStyle = "#f2c53d";
        NK.rundtRekt(ctx, x, y + 2, 4, o.h - 4, 2);
        ctx.fill();
        ctx.restore();
        var lh = o.h / o.linjer.length;
        o.linjer.forEach(function (l, i) {
            NK.tekst(ctx, l, x + 14, y + lh * (i + 0.5) + 1, { font: font("600", o.px), linje: "middle", farve: "#f2f3f5" });
        });
    };

    /* ----- Vaegten (som sc4.5) ----------------------------------------------------------- */
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
        ctx.fillStyle = "#7df0c0";
        ctx.shadowColor = "rgba(125, 240, 192, 0.6)";
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

    /* ----- Den varmefaste plade paa vaegtens skaal ----------------------------------------
       (x, bund): midten af undersiden. b og h: stoerrelsen. */
    T.plade = function (ctx, x, bund, b, h) {
        ctx.save();
        var x0 = x - b / 2, y0 = bund - h;
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(x0 + 2, bund - 1, b, 3);
        var g = ctx.createLinearGradient(0, y0, 0, bund);
        g.addColorStop(0, "#e9e4d8");
        g.addColorStop(1, "#b9b2a2");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, x0, y0, b, h, Math.min(3, h / 2));
        ctx.fill();
        ctx.strokeStyle = "rgba(90, 80, 60, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Monsteret i keramikken */
        var r = froe(3);
        ctx.fillStyle = "rgba(120, 110, 90, 0.35)";
        for (var i = 0; i < b / 6; i++) ctx.fillRect(x0 + 3 + r() * (b - 6), y0 + 1 + r() * (h - 2), 1.4, 1.2);
        ctx.restore();
    };

    /* ----- Klumpen af ståluld ------------------------------------------------------------
       Traadene ligger i en ellipse med radius 1 (enhedskoordinater) og
       tegnes skaleret til klumpens stoerrelse. Naar klumpen er taendt,
       faar hver traad en taerskel efter afstanden fra der, batteriet
       roerte: den gloeder, naar branden (p) naar den, og bliver sort
       bagefter. */
    var BAAND = 0.16;       /* hvor bred den gloedende front er (del af p) */

    function Uld(nr, m) {
        var r = froe(nr * 13 + 5);
        var n = Math.round(NK.klamp(60 * m, 140, 320));
        this.t = [];
        for (var i = 0; i < n; i++) {
            var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.92;
            var x0 = Math.cos(a) * d, y0 = Math.sin(a) * d;
            var v = r() * Math.PI * 2, L = 0.18 + r() * 0.3, bue = (r() - 0.5) * 0.3;
            var x1 = x0 + Math.cos(v) * L, y1 = y0 + Math.sin(v) * L;
            /* Hold enden inde i ellipsen */
            var d1 = Math.hypot(x1, y1);
            if (d1 > 1) { x1 /= d1; y1 /= d1; }
            var mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
            this.t.push({ x0: x0, y0: y0, x1: x1, y1: y1, cx: mx - Math.sin(v) * bue, cy: my + Math.cos(v) * bue,
                          mx: mx, my: my, skygge: r(), w: 0.7 + r() * 0.9, thr: 2, flimmer: r() * 10 });
        }
        this.taendt = false;
        this.glo = [];          /* de gloedende traades midte i px (til gnisterne) */
    }

    /* (u, v): der, batteriet roerte, i enhedskoordinater */
    Uld.prototype.saetTaendt = function (u, v) {
        var maks = 0.01;
        this.t.forEach(function (f) { f.thr = Math.hypot(f.mx - u, f.my - v); maks = Math.max(maks, f.thr); });
        this.t.forEach(function (f, i) { f.thr = NK.klamp(f.thr / maks, 0, 1) * 0.985 + 0.005 * (i % 3); });
        this.taendt = true;
        this.u = u;
        this.v = v;
    };

    /* Midten af de gloedende traade i px (her kommer gnisterne fra) */
    Uld.prototype.frontPunkter = function (p, cx, cy, rx, ry) {
        var ud = [];
        if (!this.taendt || p >= 1) return ud;
        this.t.forEach(function (f) { if (f.thr <= p && f.thr > p - BAAND) ud.push({ x: cx + f.mx * rx, y: cy + f.my * ry }); });
        return ud;
    };

    /* Den del af traadene, der gloeder, naar branden er naaet til p */
    Uld.prototype.frontAndel = function (p) {
        if (!this.taendt || p >= 1) return 0;
        var n = 0;
        this.t.forEach(function (f) { if (f.thr <= p && f.thr > p - BAAND) n++; });
        return n / this.t.length;
    };
    T.Uld = Uld;

    /* v: { p, ilt (0-1), tid, lys } */
    T.uld = function (ctx, uld, cx, cy, rx, ry, v) {
        var p = v.p || 0, tid = v.tid || 0, ilt = v.ilt || 0;
        var bw = NK.klamp(rx / 55, 0.8, 1.7);
        var sluk = NK.klamp((1 - p) / 0.03, 0, 1);         /* gloeden doer ud til sidst */
        ctx.save();
        /* Skyggen paa pladen og en taet bund, saa klumpen ser fyldig ud */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + ry * 0.85, rx * 0.9, ry * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        if (v.lys) T.skaer(ctx, cx, cy, rx * 1.3, ry * 1.4);
        var brandt = uld.taendt ? NK.klamp(p * 1.1, 0, 1) : 0;
        ctx.fillStyle = bland("#6c737c", "#2a2e36", brandt);
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx * 0.86, ry * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.lineCap = "round";
        var glo = [];
        function streg(f) {
            ctx.beginPath();
            ctx.moveTo(cx + f.x0 * rx, cy + f.y0 * ry);
            ctx.quadraticCurveTo(cx + f.cx * rx, cy + f.cy * ry, cx + f.x1 * rx, cy + f.y1 * ry);
            ctx.stroke();
        }
        /* Foerst de kolde traade (graa staal eller sorte), saa de gloedende oven paa */
        uld.t.forEach(function (f) {
            ctx.lineWidth = f.w * bw;
            if (!uld.taendt || f.thr > p) {
                ctx.strokeStyle = nuance("#aeb6bf", (f.skygge - 0.5) * 0.55);
            } else {
                ctx.strokeStyle = nuance("#5b616d", (f.skygge - 0.5) * 0.5);
            }
            streg(f);
        });
        if (uld.taendt && sluk > 0) {
            ctx.globalCompositeOperation = "lighter";
            uld.t.forEach(function (f) {
                var d = p - f.thr;
                if (d < 0 || d > BAAND) return;
                var q = (1 - d / BAAND) * sluk;
                var blink = 0.75 + 0.25 * Math.sin(tid * 23 + f.flimmer * 7);
                /* Med ekstra ilt braender det hvidere */
                var kerne = ilt > 0.05 ? bland("#ffb347", "#fff6d8", NK.klamp(q * blink, 0, 1)) :
                    bland("#ff5a14", "#ffe39a", NK.klamp(q * blink, 0, 1));
                ctx.globalAlpha = 0.35 * q;
                ctx.strokeStyle = "#ff7a1a";
                ctx.lineWidth = f.w * bw * 4;
                streg(f);
                ctx.globalAlpha = NK.klamp(q * blink + 0.2, 0, 1);
                ctx.strokeStyle = kerne;
                ctx.lineWidth = f.w * bw * 1.2;
                streg(f);
                glo.push({ x: cx + f.mx * rx, y: cy + f.my * ry, q: q });
            });
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
        }
        uld.glo = glo;
        ctx.restore();
    };

    /* Et varmt skaer om den gloedende front (tegnes under ulden) */
    T.gloed = function (ctx, uld, styrke) {
        if (!uld.glo.length || styrke <= 0) return;
        var sx = 0, sy = 0, n = uld.glo.length;
        uld.glo.forEach(function (g) { sx += g.x; sy += g.y; });
        var x = sx / n, y = sy / n, r = 30 + 60 * NK.klamp(n / 40, 0.3, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        var g = ctx.createRadialGradient(x, y, 2, x, y, r);
        g.addColorStop(0, "rgba(255, 150, 60, " + (0.35 * styrke).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255, 120, 40, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Gnister ------------------------------------------------------------------------
       Smaa korn, der springer op fra den gloedende front og braender ud i
       luften. De tager ingen masse med (se README). */
    function Gnister(nr) {
        this.g = [];
        this.r = froe(nr || 4);
        this.akku = 0;
    }
    /* rate: gnister pr. sekund. kilder: punkter, de kan komme fra ({ x, y }) */
    Gnister.prototype.opdater = function (dt, rate, kilder) {
        var r = this.r;
        this.akku += dt * rate;
        while (this.akku >= 1 && kilder && kilder.length) {
            this.akku -= 1;
            var k = kilder[Math.floor(r() * kilder.length)];
            this.stoed(k.x, k.y, 1);
        }
        if (!kilder || !kilder.length) this.akku = 0;
        this.g.forEach(function (q) { q.vy += 380 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.liv -= dt; });
        this.g = this.g.filter(function (q) { return q.liv > 0; });
        if (this.g.length > 220) this.g.splice(0, this.g.length - 220);
    };
    Gnister.prototype.stoed = function (x, y, n, fart) {
        var r = this.r, f = fart || 1;
        for (var i = 0; i < n; i++) {
            this.g.push({ x: x, y: y, vx: (r() - 0.5) * 150 * f, vy: -(60 + r() * 140) * f, liv: 0.35 + r() * 0.55, liv0: 0.9 });
        }
    };
    Gnister.prototype.tegn = function (ctx) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";
        this.g.forEach(function (q) {
            var a = NK.klamp(q.liv / 0.5, 0, 1);
            ctx.strokeStyle = "rgba(255, " + Math.round(170 + 60 * a) + ", 90, " + a.toFixed(3) + ")";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(q.x, q.y);
            ctx.lineTo(q.x - q.vx * 0.025, q.y - q.vy * 0.025);
            ctx.stroke();
        });
        ctx.restore();
    };
    Gnister.prototype.antal = function () { return this.g.length; };
    T.Gnister = Gnister;

    /* ----- Batteriet --------------------------------------------------------------------
       (x, y): midten. h: hoejden. vinkel: 0 staaende, pi med polerne nedad. */
    T.batteriKontakt = function (x, y, h, vinkel) {
        var M = MAAL.batteri, k = h / M.h;
        var dy = (M.pol - M.h / 2) * k;
        return { x: x - Math.sin(vinkel) * dy, y: y + Math.cos(vinkel) * dy };
    };

    T.batteri = function (ctx, x, y, h, vinkel, lys) {
        var M = MAAL.batteri, k = h / M.h, b = M.b * k;
        ctx.save();
        if (lys) T.skaer(ctx, x, y, b * 0.9, h * 0.62);
        ctx.translate(x, y);
        ctx.rotate(vinkel || 0);
        NK.Sprites.tegn(ctx, "batteri", -b / 2, -h / 2, b, h);
        ctx.restore();
    };

    /* ----- Iltflasken og slangen --------------------------------------------------------------
       (x, bund): midten af bunden. Geometrien: udtaget, hjulet og
       rektanglet (regnes i fanens layout, saa musen kender den). */
    T.flaskeGeo = function (x, bund, h) {
        var M = MAAL.iltflaske, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = bund - M.bund * k;
        return { x: x, x0: x0, y0: y0, b: b, h: h, k: k, udtag: { x: x0 + M.udtagX * k, y: y0 + M.udtagY * k },
                 hjul: { x: x0 + M.hjulX * k, y: y0 + M.hjulY * k } };
    };

    T.flaske = function (ctx, g, lys) {
        if (lys) T.skaer(ctx, g.x, g.y0 + g.h * 0.45, g.b * 0.9, g.h * 0.55);
        NK.Sprites.tegn(ctx, "iltflaske", g.x0, g.y0, g.b, g.h);
    };

    /* Slangen fra udtaget til dysen ved ulden. aaben: 0-1, mens der
       kommer ilt */
    T.slange = function (ctx, fra, dyse, aaben, tid, k) {
        ctx.save();
        var lav = Math.max(fra.y, dyse.y) + 40 * k;
        ctx.strokeStyle = "#1f2c3a";
        ctx.lineWidth = 6 * k;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.bezierCurveTo(fra.x - 30 * k, lav, dyse.x + 40 * k, lav, dyse.x + 10 * k, dyse.y);
        ctx.stroke();
        ctx.strokeStyle = "#3a5673";
        ctx.lineWidth = 3.4 * k;
        ctx.stroke();
        /* Dysen: et lille messingroer, der peger mod ulden */
        ctx.fillStyle = "#c9a24a";
        ctx.strokeStyle = "#5e4716";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dyse.x + 14 * k, dyse.y - 3.5 * k);
        ctx.lineTo(dyse.x, dyse.y - 2 * k);
        ctx.lineTo(dyse.x, dyse.y + 2 * k);
        ctx.lineTo(dyse.x + 14 * k, dyse.y + 3.5 * k);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        if (aaben > 0.01) {
            /* Ilten strommer ud: lyse pust mod ulden */
            ctx.globalCompositeOperation = "lighter";
            for (var i = 0; i < 6; i++) {
                var u = ((tid * 2.2 + i / 6) % 1);
                var px = dyse.x - u * 46 * k, py = dyse.y + Math.sin(u * 9 + i) * 3 * k;
                ctx.fillStyle = "rgba(170, 215, 255, " + (0.35 * aaben * (1 - u)).toFixed(3) + ")";
                ctx.beginPath();
                ctx.arc(px, py, (3 + u * 7) * k, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    /* ----- Stjernekasteren (paaskeaegget) --------------------------------------------------- */
    T.stjerneGeo = function (x, bund, h) {
        var M = MAAL.stjernekaster, k = h / M.h, b = M.b * k;
        var x0 = x - b / 2, y0 = bund - M.bund * k;
        return { cx: x, x: x0, y: y0, b: b, h: h, spids: { x: x0 + M.spidsX * k, y: y0 + M.spidsY * k } };
    };

    T.stjernekaster = function (ctx, g, lys) {
        if (lys) T.skaer(ctx, g.cx, g.y + g.h * 0.45, g.b * 1.2, g.h * 0.5);
        NK.Sprites.tegn(ctx, "stjernekaster", g.x, g.y, g.b, g.h);
    };

    /* Stjernen i spidsen, mens den braender: straaler og et hvidt lys */
    T.stjerneLys = function (ctx, x, y, tid, styrke) {
        if (styrke <= 0) return;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        var g = ctx.createRadialGradient(x, y, 1, x, y, 26);
        g.addColorStop(0, "rgba(255, 245, 210, " + (0.9 * styrke).toFixed(3) + ")");
        g.addColorStop(1, "rgba(255, 200, 120, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, 26, 0, Math.PI * 2);
        ctx.fill();
        var r = froe(Math.floor(tid * 20));
        ctx.strokeStyle = "rgba(255, 230, 170, " + (0.8 * styrke).toFixed(3) + ")";
        ctx.lineWidth = 1.2;
        for (var i = 0; i < 14; i++) {
            var v = r() * Math.PI * 2, L = 10 + r() * 26;
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(v) * 4, y + Math.sin(v) * 4);
            ctx.lineTo(x + Math.cos(v) * L, y + Math.sin(v) * L);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Luppen: overfladen af en ståltraad -----------------------------------------------
       Nederst i luppen ligger jernatomerne i fem raekker; den oeverste
       raekke er overfladen. Ovenover er luft: O₂ og N₂, der flyver rundt.
       Naar klumpen braender, flyver et O₂ hen til overfladen, deles, og de
       to O saetter sig paa hver sit Fe (2 Fe + O₂ → 2 FeO). Overfladen
       reagerer foerst. Antallet af Fe med O foelger modellen (udbyttet
       gange p), saa den inderste raekke aldrig naar at reagere. Nitrogen
       reagerer ikke. */
    var ATOM = { Fe: { t: "Fe", farve: "#aab2bc", r: 0.066 }, O: { t: "O", farve: "#e8574c", r: 0.044 },
                 N: { t: "N", farve: "#6fa8dc", r: 0.042 } };
    T.ATOM = ATOM;
    var RAEKKER = 5, SOEJLER = 9;
    var PLADSER = (function () {
        var ud = [];
        for (var r = 0; r < RAEKKER; r++) {
            for (var i = 0; i < SOEJLER; i++) {
                ud.push({ x: (i - (SOEJLER - 1) / 2) * 0.155 + (r % 2 ? 0.0775 : -0.02), y: 0.14 + r * 0.14, r: r });
            }
        }
        return ud;
    }());
    T.LUP_ATOMER = PLADSER.length;
    var OVERFLADE = 0.06;          /* y for traadens overflade */
    var LUFT_BUND = -0.02;         /* luften slutter her */

    function LupJern(nr) {
        this.r = froe(nr || 7);
        this.fe = PLADSER.map(function (p) { return { x: p.x, y: p.y, r: p.r, o: 0, reserveret: false }; });
        this.mol = [];             /* { type "O2"/"N2", x, y, vx, vy, v (vinkel), a, doer, maal } */
        this.handl = [];
        this.antalO = 0;
        for (var i = 0; i < 7; i++) this.ny("N2");
        for (i = 0; i < 3; i++) this.ny("O2");
        this.mol.forEach(function (m) { m.a = 1; });
    }

    LupJern.prototype.ny = function (type, fraTop) {
        var r = this.r, x, y;
        if (fraTop) { x = (r() - 0.5) * 1.1; y = -0.92; }
        else {
            var a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.8;
            x = Math.cos(a) * d; y = -Math.abs(Math.sin(a) * d) - 0.1;
        }
        var m = { type: type, x: x, y: y, vx: (r() - 0.5) * 0.5, vy: fraTop ? 0.25 + r() * 0.2 : (r() - 0.5) * 0.5,
                  v: r() * Math.PI, vv: (r() - 0.5) * 3, a: 0, doer: false, maal: null };
        this.mol.push(m);
        return m;
    };

    LupJern.prototype.reageret = function () { return this.fe.filter(function (f) { return f.o > 0 || f.reserveret; }).length; };

    /* Straks faerdig: de oeverste Fe har O (til en gemt maaling) */
    LupJern.prototype.saetFaerdig = function (andel) {
        var n = Math.floor(PLADSER.length * andel / 2) * 2;
        this.fe.forEach(function (f, i) { f.o = i < n ? 1 : 0; f.reserveret = false; });
        this.handl = [];
    };

    /* To frie Fe at saette O paa: fra den oeverste raekke, der har nogen */
    LupJern.prototype.vaelgPar = function () {
        var frie = this.fe.filter(function (f) { return f.o === 0 && !f.reserveret; });
        if (frie.length < 2) return null;
        var r = this.r;
        frie.sort(function (a, b) { return a.r - b.r || a.x - b.x; });
        var raekke = frie.filter(function (f) { return f.r === frie[0].r; });
        if (raekke.length >= 2) {
            var i = Math.floor(r() * (raekke.length - 1));
            return [raekke[i], raekke[i + 1]];
        }
        return [frie[0], frie[1]];
    };

    /* andel: den del af jernet, der har reageret (0-1). ilt: flasken er aaben */
    LupJern.prototype.opdater = function (dt, andel, ilt, braender) {
        var mig = this, r = this.r;
        var maal = Math.floor(PLADSER.length * NK.klamp(andel, 0, 1) / 2) * 2;
        /* Luften: nitrogen og ilt kommer ind fra toppen */
        var o2 = this.mol.filter(function (m) { return m.type === "O2" && !m.doer && !m.maal; }).length;
        var n2 = this.mol.filter(function (m) { return m.type === "N2" && !m.doer; }).length;
        var o2Maal = ilt ? 8 : 3, n2Maal = ilt ? 3 : 7;
        if (o2 < o2Maal && r() < dt * (ilt ? 6 : 1.5)) this.ny("O2", true);
        if (n2 < n2Maal && r() < dt * 1.2) this.ny("N2", true);
        if (n2 > n2Maal && r() < dt * 2) {
            var ud = this.mol.filter(function (m) { return m.type === "N2" && !m.doer; })[0];
            if (ud) ud.vy = -0.5;
        }
        /* Nye reaktioner, saa laenge der mangler O paa overfladen */
        var travle = this.handl.length;
        while (this.reageret() < maal && travle < 3) {
            var frieO2 = this.mol.filter(function (m) { return m.type === "O2" && !m.doer && !m.maal && m.a > 0.5; });
            if (!frieO2.length) { if (r() < dt * 4) this.ny("O2", true); break; }
            var par = this.vaelgPar();
            if (!par) break;
            frieO2.sort(function (a, b) { return b.y - a.y; });
            var m = frieO2[0];
            par.forEach(function (f) { f.reserveret = true; });
            m.maal = { x: (par[0].x + par[1].x) / 2, y: OVERFLADE - 0.1 };
            this.handl.push({ m: m, par: par, t: 0, O: null });
            travle++;
        }
        /* Handlingerne: O₂ flyver ned, deles, og hvert O saetter sig paa sit Fe */
        this.handl.forEach(function (h) {
            h.t += dt;
            if (h.t >= 0.55 && !h.O) {
                h.m.doer = true;
                h.m.a = 0;
                h.O = h.par.map(function (f) { return { x: h.m.maal.x, y: h.m.maal.y, f: f }; });
            }
            if (h.O) {
                h.O.forEach(function (o) {
                    var tx = o.f.x + 0.058, ty = o.f.y - 0.058;
                    o.x += (tx - o.x) * Math.min(1, dt * 7);
                    o.y += (ty - o.y) * Math.min(1, dt * 7);
                });
                if (h.t >= 1.05) {
                    h.par.forEach(function (f) { f.o = Math.max(f.o, 0.01); f.reserveret = false; });
                    h.slut = true;
                }
            }
        });
        this.handl = this.handl.filter(function (h) { return !h.slut; });
        this.fe.forEach(function (f) { if (f.o > 0) f.o = Math.min(1, f.o + dt * 4); });
        /* Molekylerne i luften */
        this.mol.forEach(function (m) {
            if (m.maal && !m.doer) {
                m.x += (m.maal.x - m.x) * Math.min(1, dt * 6);
                m.y += (m.maal.y - m.y) * Math.min(1, dt * 6);
            } else if (!m.doer) {
                m.vx += (r() - 0.5) * 1.4 * dt;
                m.vy += (r() - 0.5) * 1.4 * dt;
                var v = Math.hypot(m.vx, m.vy), maks = 0.42;
                if (v > maks) { m.vx *= maks / v; m.vy *= maks / v; }
                m.x += m.vx * dt;
                m.y += m.vy * dt;
                if (m.y < -0.95 && m.vy < 0 && m.type === "N2" && n2 > n2Maal) m.doer = true;
                var d = Math.hypot(m.x, m.y);
                if (d > 0.86) {
                    var nx = m.x / d, ny = m.y / d, dot = m.vx * nx + m.vy * ny;
                    if (dot > 0) { m.vx -= 2 * dot * nx; m.vy -= 2 * dot * ny; }
                    m.x = nx * 0.86; m.y = ny * 0.86;
                }
                if (m.y > LUFT_BUND - 0.06) { m.y = LUFT_BUND - 0.06; m.vy = -Math.abs(m.vy); }
            }
            m.v += m.vv * dt;
            m.a = NK.klamp(m.a + (m.doer ? -dt * 3 : dt * 2), 0, 1);
        });
        this.mol = this.mol.filter(function (m) { return !(m.doer && m.a <= 0); });
        void braender;
    };
    T.LupJern = LupJern;

    function kugle(ctx, x, y, rr, farve, a) {
        ctx.globalAlpha = a;
        var g = ctx.createRadialGradient(x - rr * 0.35, y - rr * 0.35, rr * 0.2, x, y, rr);
        g.addColorStop(0, nuance(farve, 0.45));
        g.addColorStop(1, farve);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    function molekyle(ctx, m, cx, cy, R) {
        var at = m.type === "O2" ? ATOM.O : ATOM.N;
        var rr = at.r * R, d = rr * 0.85;
        var dx = Math.cos(m.v) * d, dy = Math.sin(m.v) * d;
        var x = cx + m.x * R, y = cy + m.y * R;
        kugle(ctx, x - dx, y - dy, rr, at.farve, m.a);
        kugle(ctx, x + dx, y + dy, rr, at.farve, m.a);
    }

    /* Tegn luppen med midte (cx, cy) og radius r. Giver y under forklaringen. */
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
        /* Luften og traaden */
        var bg = ctx.createLinearGradient(0, cy - r, 0, cy + r);
        bg.addColorStop(0, "#162230");
        bg.addColorStop(1, "#111a25");
        ctx.fillStyle = bg;
        ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
        var ty = cy + OVERFLADE * r;
        var tg = ctx.createLinearGradient(0, ty, 0, cy + r);
        tg.addColorStop(0, "#3a414c");
        tg.addColorStop(1, "#23282f");
        ctx.fillStyle = tg;
        ctx.fillRect(cx - r, ty, 2 * r, r);
        /* Jernatomerne raekke for raekke, med O paa dem, der har reageret */
        lup.fe.forEach(function (f) {
            kugle(ctx, cx + f.x * r, cy + f.y * r, ATOM.Fe.r * r, f.o > 0 ? "#8e949c" : ATOM.Fe.farve, 1);
        });
        lup.fe.forEach(function (f) {
            if (f.o > 0) kugle(ctx, cx + (f.x + 0.058) * r, cy + (f.y - 0.058) * r, ATOM.O.r * r, ATOM.O.farve, NK.klamp(f.o, 0, 1));
        });
        /* O-atomerne paa vej hen til deres Fe */
        lup.handl.forEach(function (h) {
            if (!h.O) return;
            h.O.forEach(function (o) { kugle(ctx, cx + o.x * r, cy + o.y * r, ATOM.O.r * r, ATOM.O.farve, 1); });
        });
        lup.mol.forEach(function (m) { if (m.a > 0.01) molekyle(ctx, m, cx, cy, r); });
        ctx.globalAlpha = 1;
        ctx.restore();
        ctx.strokeStyle = v.lys ? "rgba(242, 197, 61, 0.9)" : "#c9d3de";
        ctx.lineWidth = Math.max(4, 6 * r / 120);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "#6f7b89";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.max(2, 3 * r / 120), 0, Math.PI * 2);
        ctx.stroke();
        var px = NK.klamp(14 * r / 120, 13, 15);
        if (v.titel) NK.tekst(ctx, v.titel, cx, cy - r - 12, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
        /* Forklaringen: Fe, O, O₂ og N₂ paa én linje */
        var y = cy + r + px + 10;
        var dele = [{ t: "Fe", f: [ATOM.Fe.farve] }, { t: "O", f: [ATOM.O.farve] }, { t: "O₂", f: [ATOM.O.farve, ATOM.O.farve] },
                    { t: "N₂ (reagerer ikke)", f: [ATOM.N.farve, ATOM.N.farve] }];
        ctx.font = font("600", px);
        function maal() {
            var br = dele.map(function (d) { return ctx.measureText(d.t).width + d.f.length * px * 0.7 + 8; });
            return { br: br, samlet: br.reduce(function (a, b) { return a + b; }, 0) + 12 * (dele.length - 1) };
        }
        var m = maal();
        /* Er der ikke plads til hele linjen i laerredet, bliver den kortere */
        var kant = v.maksX || Infinity;
        if (m.samlet > Math.min(kant - 12, r * 2.9)) { dele[3].t = "N₂"; m = maal(); }
        var bredder = m.br, samlet = m.samlet;
        var x = NK.klamp(cx - samlet / 2, 6, Math.max(6, kant - 6 - samlet));
        dele.forEach(function (d, i) {
            d.f.forEach(function (farve, j) {
                ctx.fillStyle = farve;
                ctx.beginPath();
                ctx.arc(x + px * 0.4 + j * px * 0.62, y - px * 0.35, px * 0.36, 0, Math.PI * 2);
                ctx.fill();
            });
            NK.tekst(ctx, d.t, x + d.f.length * px * 0.7 + 5, y, { font: font("600", px), farve: "#c8ced6" });
            x += bredder[i] + 12;
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

    /* ----- Fane 2: soejlerne ------------------------------------------------------------------
       (x, bund): midten af bunden. hFe og hO: hoejden af jernet og ilten.
       v: { titel, tal, stiplet (et "?", der venter), pop (0-1), lys, mangler
       (hoejden af den ilt, der ikke kom paa, som en stiplet rod kasse) } */
    T.soejle = function (ctx, x, bund, b, hFe, hO, v) {
        v = v || {};
        ctx.save();
        var x0 = x - b / 2;
        if (v.lys) T.skaer(ctx, x, bund - (hFe + hO) / 2, b, (hFe + hO) * 0.7);
        if (v.stiplet) {
            ctx.strokeStyle = "rgba(223, 230, 238, 0.5)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            NK.rundtRekt(ctx, x0, bund - v.stiplet, b, v.stiplet, 6);
            ctx.stroke();
            ctx.setLineDash([]);
            NK.tekst(ctx, "?", x, bund - v.stiplet / 2, { font: font("800", NK.klamp(b * 0.45, 18, 34)), justering: "center", linje: "middle", farve: "#dfe6ee" });
        } else {
            var s = v.pop === undefined ? 1 : 0.6 + 0.4 * NK.pop(v.pop);
            var hf = hFe, ho = hO * s;
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            NK.rundtRekt(ctx, x0 + 3, bund - hf - ho + 5, b, hf + ho, 6);
            ctx.fill();
            /* Jernet */
            var g = ctx.createLinearGradient(x0, 0, x0 + b, 0);
            g.addColorStop(0, "#7d858f");
            g.addColorStop(0.35, "#c9d0d8");
            g.addColorStop(1, "#6f7780");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, x0, bund - hf, b, hf, ho > 1 ? 0 : 6);
            ctx.fill();
            ctx.save();
            ctx.beginPath();
            ctx.rect(x0, bund - hf, b, hf);
            ctx.clip();
            var r = froe(Math.round(b));
            ctx.strokeStyle = "rgba(60, 66, 74, 0.35)";
            ctx.lineWidth = 1;
            for (var i = 0; i < hf / 5; i++) {
                var yy = bund - r() * hf, xx = x0 + r() * b;
                ctx.beginPath();
                ctx.moveTo(xx, yy);
                ctx.quadraticCurveTo(xx + 6, yy - 4, xx + 12 * (r() - 0.3), yy + 3);
                ctx.stroke();
            }
            ctx.restore();
            /* Ilten oven paa */
            if (ho > 0.5) {
                var g2 = ctx.createLinearGradient(x0, 0, x0 + b, 0);
                g2.addColorStop(0, "#b8392e");
                g2.addColorStop(0.35, "#f06c5f");
                g2.addColorStop(1, "#a8342a");
                ctx.fillStyle = g2;
                NK.rundtRekt(ctx, x0, bund - hf - ho, b, ho, 6);
                ctx.fill();
                ctx.fillRect(x0, bund - hf - Math.min(6, ho), b, Math.min(6, ho));
            }
            var pxI = NK.klamp(b * 0.24, 12, 16);
            if (hf > pxI + 6) NK.tekst(ctx, "Fe", x, bund - hf / 2, { font: font("800", pxI), justering: "center", linje: "middle", farve: "#20252d" });
            if (ho > pxI + 2) NK.tekst(ctx, "O", x, bund - hf - ho / 2, { font: font("800", pxI), justering: "center", linje: "middle", farve: "#ffffff" });
            if (v.mangler > 1) {
                ctx.strokeStyle = "rgba(240, 145, 138, 0.9)";
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 4]);
                ctx.strokeRect(x0 + 1, bund - hf - ho - v.mangler, b - 2, v.mangler);
                ctx.setLineDash([]);
            }
        }
        var px = NK.klamp(b * 0.2, 13, 15);
        var top = bund - (v.stiplet || (hFe + hO)) - (v.mangler || 0);
        if (v.titel) NK.tekst(ctx, v.titel, x, top - 10, { font: font("700", px), justering: "center", farve: "#dfe6ee" });
        ctx.restore();
    };

    /* ----- Et regnestykke med rigtige broekstreger (tavlen paa fane 2, som sc4.3) ------------
       dele: { t, matte, farve, fed } eller { top, bund, matte } (en broek).
       (x, y): venstre ende af linjens midte. Broekens dele er lidt mindre. */
    function delFont(d, px) {
        if (d.matte) return T.matte(Math.round(px * 1.08), "600");
        return font(d.fed ? "800" : "600", px);
    }

    function delBredde(ctx, d, px) {
        if (d.top !== undefined) {
            var bp = px * 0.9;
            ctx.font = delFont(d, bp);
            return Math.max(ctx.measureText(d.top).width, ctx.measureText(d.bund).width) + px * 0.35;
        }
        ctx.font = delFont(d, px);
        return ctx.measureText(d.t).width;
    }

    T.regnestykkeBredde = function (ctx, dele, px) {
        var b = 0;
        dele.forEach(function (d) { b += delBredde(ctx, d, px); });
        return b;
    };

    T.regnestykke = function (ctx, dele, x, y, px, farve) {
        var xx = x;
        dele.forEach(function (d) {
            var b = delBredde(ctx, d, px);
            if (d.top !== undefined) {
                var bp = px * 0.9, cx = xx + b / 2;
                NK.tekst(ctx, d.top, cx, y - px * 0.66, { font: delFont(d, bp), justering: "center", linje: "middle", farve: d.farve || farve });
                NK.tekst(ctx, d.bund, cx, y + px * 0.72, { font: delFont(d, bp), justering: "center", linje: "middle", farve: d.farve || farve });
                ctx.save();
                ctx.strokeStyle = d.farve || farve;
                ctx.lineWidth = Math.max(1.5, px * 0.08);
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(xx + px * 0.1, y);
                ctx.lineTo(xx + b - px * 0.1, y);
                ctx.stroke();
                ctx.restore();
            } else {
                NK.tekst(ctx, d.t, xx, y + 1, { font: delFont(d, px), linje: "middle", farve: d.farve || farve });
            }
            xx += b;
        });
        return xx - x;
    };

    NK.Tegn = T;
}());

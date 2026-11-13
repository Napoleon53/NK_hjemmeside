/* =====================================================================
   tegning.js - det, flere faner tegner ens

   Partiklerne som kugler med lys og skygge, som i bogens figurer til
   8.1 (mg-trin): atomer uden ladning er graa, positive ioner roede og
   negative ioner blaa, elektroner smaa blaa kugler med et minus og den
   hydron, der overfoeres, orange (bogens figur 7.2). Formler med haevet
   og saenket skrift (T.formel), buede pile, den runde lup, tangen,
   magnesiumbaandet, skaalen, lyset, arket, brikkerne og pladserne til
   dem. Det faelles (ring, skilt, bord) er fra sc4.6.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    function font(vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; }
    T.font = font;

    T.GUL = "#f2c53d";
    T.BLAEK = "#1f2430";         /* skriften paa det lyse ark */
    T.OX = "#b4530a";            /* oxidation: orange som i bogen */
    T.RED = "#1d4ed8";           /* reduktion: blaa som i bogen */
    T.E = "#2f62d8";             /* elektronerne */
    T.HYDRON = "#d9761a";        /* den hydron, der overfoeres (bogens HYDRON) */
    T.GROEN = "#0f7a4f";

    /* Kuglernes farver: lys, midte, skygge */
    T.FARVE = {
        atom:  ["#ffffff", "#d3d9e0", "#8b95a2"],
        plus:  ["#ffd9cf", "#e9775e", "#a63f29"],
        minus: ["#dbe7ff", "#729ef0", "#2d5cc2"],
        h:     ["#ffffff", "#e6eaef", "#a3adb9"],
        hydron:["#ffe3c2", "#f3a24a", "#b8620f"],
        e:     ["#cfe0ff", "#4f86f0", "#1f4bb0"]
    };

    /* ----- Formler med haevet og saenket skrift ---------------------------
       Markup: "O_2", "Mg^{2+}", "e^−", "CH_3COO^−". Et tal lige efter et
       bogstav eller en parentes er ikke automatisk saenket: skriv _. */
    function dele(s) {
        var ud = [], i = 0, normal = "";
        s = String(s);
        function skub() { if (normal) { ud.push({ t: normal, k: "n" }); normal = ""; } }
        while (i < s.length) {
            var c = s.charAt(i);
            if (c === "_" || c === "^") {
                skub();
                var k = c === "_" ? "sub" : "sup", t;
                if (s.charAt(i + 1) === "{") {
                    var slut = s.indexOf("}", i + 2);
                    t = s.slice(i + 2, slut);
                    i = slut + 1;
                } else {
                    t = s.charAt(i + 1);
                    i += 2;
                }
                ud.push({ t: t, k: k });
            } else {
                normal += c;
                i++;
            }
        }
        skub();
        return ud;
    }
    T.dele = dele;

    function delFont(d, px, vaegt) { return font(vaegt, d.k === "n" ? px : Math.round(px * 0.64)); }

    T.formelBredde = function (ctx, s, px, vaegt) {
        vaegt = vaegt || "700";
        var b = 0;
        ctx.save();
        dele(s).forEach(function (d) { ctx.font = delFont(d, px, vaegt); b += ctx.measureText(d.t).width + (d.k === "n" ? 0 : px * 0.03); });
        ctx.restore();
        return b;
    };

    /* y er midten af de store bogstaver. justering: "left", "center", "right" */
    T.formel = function (ctx, s, x, y, px, opt) {
        opt = opt || {};
        var vaegt = opt.vaegt || "700";
        var b = T.formelBredde(ctx, s, px, vaegt);
        var x0 = opt.justering === "left" ? x : (opt.justering === "right" ? x - b : x - b / 2);
        var basis = y + px * 0.36;
        ctx.save();
        ctx.fillStyle = opt.farve || T.BLAEK;
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        var cx = x0;
        dele(s).forEach(function (d) {
            ctx.font = delFont(d, px, vaegt);
            var dy = d.k === "sub" ? px * 0.24 : (d.k === "sup" ? -px * 0.42 : 0);
            if (d.k !== "n") cx += px * 0.015;
            ctx.fillText(d.t, cx, basis + dy);
            cx += ctx.measureText(d.t).width + (d.k !== "n" ? px * 0.015 : 0);
        });
        ctx.restore();
        return b;
    };

    /* ----- Kugler ---------------------------------------------------------- */
    T.kugle = function (ctx, x, y, r, farver, alfa) {
        if (r <= 0.5) return;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
        g.addColorStop(0, farver[0]);
        g.addColorStop(0.55, farver[1]);
        g.addColorStop(1, farver[2]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = Math.max(1, r * 0.04);
        ctx.strokeStyle = "rgba(40, 46, 58, 0.35)";
        ctx.stroke();
        ctx.restore();
    };

    /* Blanding af to farvesaet (t = 0: a, t = 1: b) */
    function hex(c) { var n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
    T.bland = function (a, b, t) {
        t = NK.klamp(t, 0, 1);
        return a.map(function (ca, i) {
            var x = hex(ca), y = hex(b[i]);
            return "rgb(" + Math.round(x[0] + (y[0] - x[0]) * t) + ", " + Math.round(x[1] + (y[1] - x[1]) * t) + ", " + Math.round(x[2] + (y[2] - x[2]) * t) + ")";
        });
    };
    function rgbHex(s) {
        if (s.charAt(0) === "#") return s;
        var m = s.match(/\d+/g);
        return "#" + m.slice(0, 3).map(function (v) { var h = parseInt(v, 10).toString(16); return h.length < 2 ? "0" + h : h; }).join("");
    }
    T.blandHex = function (a, b, t) { return T.bland(a, b, t).map(rgbHex); };

    /* En partikel: kugle med formlen paa. tekst i markup ("Mg^{2+}") */
    T.partikel = function (ctx, x, y, r, farver, tekst, alfa, tekstFarve) {
        T.kugle(ctx, x, y, r, farver, alfa);
        if (!tekst || r < 7) return;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        var px = Math.round(NK.klamp(r * 0.62, 9, 30));
        var b = T.formelBredde(ctx, tekst, px);
        if (b > r * 1.75) px = Math.max(8, Math.floor(px * r * 1.75 / b));
        T.formel(ctx, tekst, x, y, px, { farve: tekstFarve || "#1b2230" });
        ctx.restore();
    };

    /* En elektron: lille blaa kugle med et hvidt minus, som i bogen */
    T.elektron = function (ctx, x, y, r, alfa) {
        T.kugle(ctx, x, y, r, T.FARVE.e, alfa);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1.4, r * 0.24);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r * 0.45, y);
        ctx.lineTo(x + r * 0.45, y);
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Buede pile -----------------------------------------------------------
       En kvadratisk bue fra a til b, der bugter buk pixels ud til venstre for
       retningen a -> b. T.buePunkt giver punktet ved t (0-1). */
    T.bueKontrol = function (a, b, buk) {
        var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
        return { x: mx + dy / l * buk, y: my - dx / l * buk };
    };
    T.buePunkt = function (a, b, buk, t) {
        var k = T.bueKontrol(a, b, buk), u = 1 - t;
        return { x: u * u * a.x + 2 * u * t * k.x + t * t * b.x, y: u * u * a.y + 2 * u * t * k.y + t * t * b.y };
    };
    /* Pilen tegnes op til t (0-1) med en spids, hvor den slutter */
    T.buePil = function (ctx, a, b, buk, farve, lw, t, alfa) {
        t = t === undefined ? 1 : t;
        if (t <= 0.02) return;
        var k = T.bueKontrol(a, b, buk);
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = lw;
        ctx.lineCap = "round";
        ctx.beginPath();
        var n = 24, i, p = a, forrige = a;
        ctx.moveTo(a.x, a.y);
        for (i = 1; i <= n; i++) {
            forrige = p;
            p = T.buePunkt(a, b, buk, t * i / n);
            ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        var v = Math.atan2(p.y - forrige.y, p.x - forrige.x), s = lw * 3.4;
        ctx.beginPath();
        ctx.moveTo(p.x + Math.cos(v) * s * 0.4, p.y + Math.sin(v) * s * 0.4);
        ctx.lineTo(p.x - Math.cos(v - 0.45) * s, p.y - Math.sin(v - 0.45) * s);
        ctx.lineTo(p.x - Math.cos(v + 0.45) * s, p.y - Math.sin(v + 0.45) * s);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        void k;
    };

    /* En lige reaktionspil */
    T.reaktionspil = function (ctx, x0, x1, y, farve, lw) {
        ctx.save();
        ctx.strokeStyle = farve || T.BLAEK;
        ctx.fillStyle = farve || T.BLAEK;
        ctx.lineWidth = lw || 2.4;
        ctx.beginPath();
        ctx.moveTo(x0, y);
        ctx.lineTo(x1 - (lw || 2.4) * 3, y);
        ctx.stroke();
        var s = (lw || 2.4) * 4.2;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x1 - s, y - s * 0.5);
        ctx.lineTo(x1 - s, y + s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* ----- Luppen ---------------------------------------------------------------
       En rund lup med lys bund og en ram som i bogens figurer. fra: det lille
       felt, luppen forstoerrer ({x, y, r}); stregerne gaar fra det til luppens
       kant. inde(ctx) tegner indholdet, klippet til cirklen. */
    T.lupRund = function (ctx, cx, cy, R, fra, inde, fremhaev) {
        ctx.save();
        if (fra) {
            /* Tangentpunkterne paa luppens kant set fra feltet */
            var d = Math.max(R + 1, Math.hypot(cx - fra.x, cy - fra.y));
            var u = Math.atan2(fra.y - cy, fra.x - cx), beta = Math.acos(NK.klamp(R / d, -1, 1));
            var t1 = { x: cx + Math.cos(u + beta) * R, y: cy + Math.sin(u + beta) * R };
            var t2 = { x: cx + Math.cos(u - beta) * R, y: cy + Math.sin(u - beta) * R };
            ctx.beginPath();
            ctx.moveTo(fra.x, fra.y);
            ctx.lineTo(t1.x, t1.y);
            ctx.arc(cx, cy, R, u + beta, u - beta + Math.PI * 2, false);
            ctx.closePath();
            ctx.fillStyle = "rgba(200, 210, 222, 0.08)";
            ctx.fill();
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1.3;
            ctx.strokeStyle = "rgba(190, 200, 214, 0.55)";
            ctx.beginPath();
            ctx.moveTo(fra.x, fra.y);
            ctx.lineTo(t1.x, t1.y);
            ctx.moveTo(fra.x, fra.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.arc(fra.x, fra.y, fra.r, 0, Math.PI * 2);
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = "rgba(220, 228, 238, 0.85)";
            ctx.stroke();
        }
        /* skygge og bund */
        ctx.beginPath();
        ctx.arc(cx + 3, cy + 6, R, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        var g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
        g.addColorStop(0, "#fbfcfe");
        g.addColorStop(1, "#e3e8ef");
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        if (inde) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, R - 2, 0, Math.PI * 2);
            ctx.clip();
            inde(ctx);
            ctx.restore();
        }
        if (fremhaev) {
            ctx.beginPath();
            ctx.arc(cx, cy, R + 7, 0, Math.PI * 2);
            ctx.lineWidth = 7;
            ctx.strokeStyle = "rgba(242, 197, 61, 0.25)";
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.lineWidth = Math.max(4, R * 0.035);
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#5d6c7e";
        ctx.stroke();
        ctx.restore();
    };

    /* En rektangulaer lup (fane 3): samme lyse bund og ramme */
    T.lupRekt = function (ctx, R, inde, fremhaev) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 14);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();
        var g = ctx.createLinearGradient(R.x, R.y, R.x, R.y + R.h);
        g.addColorStop(0, "#fbfcfe");
        g.addColorStop(1, "#e3e8ef");
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 14);
        ctx.fillStyle = g;
        ctx.fill();
        if (inde) {
            ctx.save();
            NK.rundtRekt(ctx, R.x + 2, R.y + 2, R.b - 4, R.h - 4, 12);
            ctx.clip();
            inde(ctx);
            ctx.restore();
        }
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 14);
        ctx.lineWidth = fremhaev ? 4 : 3;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#5d6c7e";
        ctx.stroke();
        ctx.restore();
    };

    /* ----- Makroniveauet paa fane 1 ------------------------------------------------- */
    /* Tangen: to sorte stænger med et led, som i bogens figur. spids: hvor den holder */
    T.tang = function (ctx, hx, hy, sx, sy, s) {
        ctx.save();
        ctx.lineCap = "round";
        var dx = sx - hx, dy = sy - hy, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
        var led = { x: hx + dx * 0.72, y: hy + dy * 0.72 };
        [1, -1].forEach(function (side) {
            ctx.strokeStyle = "#2c3038";
            ctx.lineWidth = Math.max(3, s * 0.05);
            ctx.beginPath();
            ctx.moveTo(hx + nx * side * s * 0.22, hy + ny * side * s * 0.22);
            ctx.lineTo(led.x + nx * side * s * 0.03, led.y + ny * side * s * 0.03);
            ctx.lineTo(sx + nx * side * s * 0.05, sy + ny * side * s * 0.05);
            ctx.stroke();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(led.x, led.y, Math.max(3.5, s * 0.06), 0, Math.PI * 2);
        ctx.fillStyle = "#6b717c";
        ctx.fill();
        ctx.restore();
    };

    /* Magnesiumbaandet: et graat, blankt baand langs punkterne pkt */
    T.baand = function (ctx, pkt, b) {
        if (pkt.length < 2) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        function spor(lw, farve) {
            ctx.lineWidth = lw;
            ctx.strokeStyle = farve;
            ctx.beginPath();
            pkt.forEach(function (p, i) { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
            ctx.stroke();
        }
        spor(b + 2, "#4a5059");
        spor(b, "#a9b0ba");
        ctx.translate(0, -b * 0.18);
        spor(Math.max(1, b * 0.3), "rgba(255, 255, 255, 0.7)");
        ctx.restore();
    };

    /* Skaalen af porcelaen paa bordet, med det hvide pulver (mgo: 0-1) */
    T.skaal = function (ctx, cx, y, b, mgo) {
        var h = b * 0.17;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, y + 2, b * 0.48, h * 0.25, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        /* skaalens krop */
        var g = ctx.createLinearGradient(cx - b / 2, 0, cx + b / 2, 0);
        g.addColorStop(0, "#c9cfd7");
        g.addColorStop(0.45, "#f4f6f9");
        g.addColorStop(1, "#b9c0ca");
        ctx.beginPath();
        ctx.moveTo(cx - b / 2, y - h);
        ctx.quadraticCurveTo(cx - b * 0.42, y, cx - b * 0.18, y);
        ctx.lineTo(cx + b * 0.18, y);
        ctx.quadraticCurveTo(cx + b * 0.42, y, cx + b / 2, y - h);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "#8d96a2";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        /* aabningen */
        ctx.beginPath();
        ctx.ellipse(cx, y - h, b / 2, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#dde2e8";
        ctx.fill();
        ctx.stroke();
        /* pulveret */
        if (mgo > 0.01) {
            var pb = b * (0.18 + 0.2 * mgo), ph = h * (0.2 + 0.75 * mgo);
            ctx.beginPath();
            ctx.ellipse(cx, y - h + h * 0.05, pb, h * 0.2, 0, 0, Math.PI);
            ctx.lineTo(cx - pb, y - h + h * 0.05);
            ctx.quadraticCurveTo(cx, y - h - ph * 1.6, cx + pb, y - h + h * 0.05);
            var pg = ctx.createLinearGradient(cx, y - h - ph, cx, y - h);
            pg.addColorStop(0, "#ffffff");
            pg.addColorStop(1, "#e8ebef");
            ctx.fillStyle = pg;
            ctx.fill();
            ctx.strokeStyle = "rgba(150, 158, 170, 0.6)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Lyset fra det braendende magnesium: et skarpt, hvidt lys med gule straaler */
    T.lys = function (ctx, x, y, r, styrke, tid) {
        if (styrke <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(styrke, 0, 1);
        var flimmer = 1 + 0.06 * Math.sin(tid * 37) + 0.04 * Math.sin(tid * 23 + 1);
        var R = r * flimmer;
        var g = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4);
        g.addColorStop(0, "rgba(255, 255, 255, 1)");
        g.addColorStop(0.18, "rgba(255, 252, 230, 0.95)");
        g.addColorStop(0.45, "rgba(255, 238, 160, 0.45)");
        g.addColorStop(1, "rgba(255, 230, 120, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, R * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(250, 210, 70, 0.85)";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (var i = 0; i < 12; i++) {
            var v = i / 12 * Math.PI * 2 + tid * 0.6;
            var a = R * (0.95 + 0.12 * Math.sin(tid * 11 + i)), b = R * (1.45 + 0.15 * Math.sin(tid * 7 + i * 2));
            ctx.beginPath();
            ctx.moveTo(x + Math.cos(v) * a, y + Math.sin(v) * a);
            ctx.lineTo(x + Math.cos(v) * b, y + Math.sin(v) * b);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, R * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
    };

    /* En hvid roegsky (alfa 0-1) */
    T.roeg = function (ctx, x, y, r, alfa) {
        if (alfa <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(1, "rgba(215, 220, 228, 0.55)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ----- Arket, brikkerne og pladserne (fane 2 og 3) ------------------------------ */
    T.ark = function (ctx, R, fremhaev) {
        ctx.save();
        NK.rundtRekt(ctx, R.x + 3, R.y + 5, R.b, R.h, 14);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fill();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 14);
        ctx.fillStyle = "#f8f5ee";
        ctx.fill();
        ctx.lineWidth = fremhaev ? 3 : 1.5;
        ctx.strokeStyle = fremhaev ? "#f2c53d" : "#d4ccb8";
        ctx.stroke();
        ctx.restore();
    };

    /* En tom plads: en stiplet ramme. over: noget holdes over den (gul) */
    T.plads = function (ctx, R, over, farve) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 9);
        ctx.fillStyle = over ? "rgba(242, 197, 61, 0.28)" : "rgba(120, 112, 92, 0.06)";
        ctx.fill();
        ctx.setLineDash([6, 5]);
        ctx.lineWidth = over ? 2.6 : 1.8;
        ctx.strokeStyle = over ? "#c99400" : (farve || "#a49a82");
        ctx.stroke();
        ctx.restore();
    };

    /* En maerkat som brik. farve: "ox", "red" eller ingen (sort). Giver bredden */
    T.brikBredde = function (ctx, tekst, px) {
        ctx.save();
        ctx.font = font("700", px);
        var b = ctx.measureText(tekst).width + px * 1.3;
        ctx.restore();
        return b;
    };
    T.brik = function (ctx, tekst, cx, cy, px, opt) {
        opt = opt || {};
        var b = opt.b || T.brikBredde(ctx, tekst, px), h = opt.h || px * 2;
        var x = cx - b / 2, y = cy - h / 2;
        var farve = opt.farve === "ox" ? T.OX : (opt.farve === "red" ? T.RED : "#2b3240");
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        if (opt.loeftet) {
            NK.rundtRekt(ctx, x + 3, y + 6, b, h, 9);
            ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
            ctx.fill();
        }
        NK.rundtRekt(ctx, x, y, b, h, 9);
        ctx.fillStyle = opt.bund || "#ffffff";
        ctx.fill();
        ctx.lineWidth = opt.groen ? 3 : 2;
        ctx.strokeStyle = opt.groen ? "#2f9e6a" : (opt.roed ? "#c4473a" : farve);
        ctx.stroke();
        ctx.font = font("700", px);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve;
        ctx.fillText(tekst, cx, cy + 0.5);
        ctx.restore();
        return { x: x, y: y, b: b, h: h };
    };

    /* ----- Det faelles (fra sc4.6) -------------------------------------------------- */
    T.maerkat = function (ctx, tekst, x, y, valg) {
        valg = valg || {};
        ctx.save();
        ctx.font = font("700", valg.px || 13);
        var b = ctx.measureText(tekst).width + 16, h = (valg.px || 13) + 10;
        var vx = valg.justering === "left" ? x : (valg.justering === "right" ? x - b : x - b / 2);
        NK.rundtRekt(ctx, vx, y - h / 2, b, h, h / 2);
        ctx.fillStyle = valg.bund || "rgba(14, 15, 21, 0.82)";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valg.farve || "#cfd6de";
        ctx.fillText(tekst, vx + b / 2, y + 0.5);
        ctx.restore();
        return { x: vx, y: y - h / 2, b: b, h: h };
    };

    /* Bordet: en plade, tingene staar paa, og forkanten ned til scenens bund */
    T.bord = function (ctx, W, y, Hs) {
        ctx.fillStyle = "#3b3e4a";
        ctx.fillRect(0, y, W, 5);
        var g = ctx.createLinearGradient(0, y + 5, 0, Hs);
        g.addColorStop(0, "#262832");
        g.addColorStop(1, "#1d1e26");
        ctx.fillStyle = g;
        ctx.fillRect(0, y + 5, W, Math.max(0, Hs - y - 5));
        ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
        ctx.fillRect(0, y, W, 1);
    };

    /* En rolig gul ring om det, opgaven eller spoergsmaalet handler om
       (intet indforstaaet). Ringen, der pulserer (T.ring), betyder "brug mig nu". */
    T.omRing = function (ctx, x, y, b, h, farve, radius) {
        ctx.save();
        NK.rundtRekt(ctx, x - 9, y - 9, b + 18, h + 18, (radius || 14) + 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        NK.rundtRekt(ctx, x - 6, y - 6, b + 12, h + 12, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    T.omCirkel = function (ctx, x, y, r) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r + 10, 0, Math.PI * 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.22)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r + 7, 0, Math.PI * 2);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#f2c53d";
        ctx.stroke();
        ctx.restore();
    };

    /* Ringen staar stille (sb8.6: intet, der pulserer i baggrunden) */
    T.ring = function (ctx, x, y, b, h, radius) {
        ctx.save();
        NK.rundtRekt(ctx, x - 5, y - 5, b + 10, h + 10, radius || 14);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
        ctx.stroke();
        ctx.restore();
    };

    T.skilt = function (ctx, tekst, x, y, minX, maxX) {
        ctx.save();
        ctx.font = font("700", 14);
        var b = ctx.measureText(tekst).width + 22, h = 28;
        var vx = x - b / 2;
        if (minX !== undefined) vx = NK.klamp(vx, minX, Math.max(minX, maxX - b));
        var top = y - h;
        NK.rundtRekt(ctx, vx, top, b, h, 8);
        ctx.fillStyle = "#ffdf6b";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 7, y - 1); ctx.lineTo(x + 7, y - 1); ctx.lineTo(x, y + 8);
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#33290a";
        ctx.fillText(tekst, vx + b / 2, top + h / 2 + 0.5);
        ctx.restore();
        return { x: vx, y: top, b: b, h: h + 8 };
    };

    /* Smaa knapper paa laerredet (Foer, Braender, Efter under luppen) */
    T.knap = function (ctx, R, tekst, valgt, aktiv, px) {
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, R.h / 2);
        ctx.fillStyle = valgt ? "#f2c53d" : (aktiv ? "#2f3240" : "#24262f");
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = valgt ? "#f2c53d" : (aktiv ? "#5a5f70" : "#33363f");
        ctx.stroke();
        ctx.font = font("700", px || 14);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = valgt ? "#2a2208" : (aktiv ? "#e6eaf0" : "#6c7180");
        ctx.fillText(tekst, R.x + R.b / 2, R.y + R.h / 2 + 0.5);
        ctx.restore();
    };

    T.inde = function (R, pt, luft) {
        luft = luft || 0;
        return !!pt && pt.x >= R.x - luft && pt.x <= R.x + R.b + luft && pt.y >= R.y - luft && pt.y <= R.y + R.h + luft;
    };

    NK.Tegn = T;
}());

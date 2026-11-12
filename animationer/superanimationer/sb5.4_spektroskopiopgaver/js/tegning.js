/* =====================================================================
   tegning.js - tavlen, glasudstyret, spektrofotometeret og standardkurven

   Tavlen, rammerne, skiltet og maerket er de samme som i sb6.1 og sb7.7.
   Standardkurven og glasset er tegnet som bogens figurer i B5.2 og B5.3
   (sodavand-trin-1 og -2, standardraekke, spektrofotometer): lys flade med
   svagt gitter, blaagroenne punkter med glans, linjen med en blod skygge,
   proeven orange med stiplede linjer, glas med genskin.

   T.hentSprites()                         henter SVG'erne i sprites/
   T.genstand(ctx, navn, cx, bund, b)      en genstand (tablet, pille ...)
   T.kolbe / T.kuvette / T.flaske(ctx, x, y, b, farve)
                                           glasset med vaesken bagved
   T.pil(ctx, x1, y1, x2, y2, opt)         en lille graa pil
   T.lysFarve(lambda)                      lysets farve (UV er lilla)
   T.spektro(ctx, x, y, b, opt)            spektrofotometeret; giver kasserne
   T.grafLay(ctx, kasse, o, opt)           akserne til standardkurven
   T.graf(ctx, g, o, opt)                  fladen, gitteret og akserne
   T.punkt(ctx, x, y, s, slags)            et maalepunkt ("a", "b", "valg")
   T.linje(ctx, g, a, b, fra, til, opt)    en ret linje A = a · c + b
   T.proeve(ctx, g, c, A, opt)             proeven paa kurven (bogens trin 2)
   T.omraade(ctx, g, fra, til, opt)        et skraveret omraade paa aksen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var F = NK.Formel;
    var T = {};
    var FONT = "'Segoe UI', sans-serif";
    var BLAEK = "#1d2433";
    var DAEMPET = "#556766";

    T.FONT = FONT;
    T.BLAEK = BLAEK;
    T.DAEMPET = DAEMPET;
    T.VALG = "#2f6fde";
    T.FORKERT = "#c0392b";
    T.GROEN = "#2f9a5f";
    T.TEAL = "#0f766e";
    T.ORANGE = "#b45309";

    /* ----- Tavlen (som sb6.1) ---------------------------------------------- */
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

    /* ----- Rammer og skilte (som sb6.1) ---------------------------------------- */
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

    /* En gul ring uden fyld om noget, der skal ses (det, kortet spoerger om) */
    T.gulKant = function (ctx, x, y, b, h, r) {
        ctx.save();
        NK.rundtRekt(ctx, x, y, b, h, r || 10);
        ctx.strokeStyle = "#d69e0c";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.restore();
    };

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

    /* Tekst med en hvid kant, saa den kan laeses oven paa gitteret (som bogen) */
    T.haloTekst = function (ctx, s, x, y, fs, farve, just, vaegt) {
        return F.tekst(ctx, s, x, y, fs, farve, just, { vaegt: vaegt || 700, kant: "#ffffff", kantBredde: 4.2 });
    };

    /* ----- Sprites ------------------------------------------------------------- */
    var SPRITES = {
        kolbe: { b: 100, h: 172 }, kuvette: { b: 44, h: 96 }, flaske: { b: 70, h: 112 },
        tablet: { b: 96, h: 64 }, pille: { b: 104, h: 58 }, terning: { b: 100, h: 86 },
        skrue: { b: 128, h: 48 }, blodproeve: { b: 44, h: 122 }
    };
    var lager = {};
    T.SPRITES = SPRITES;
    T.hentSprites = function () {
        Object.keys(SPRITES).forEach(function (navn) {
            if (lager[navn]) return;
            var p = { img: new Image(), klar: false };
            lager[navn] = p;
            p.img.addEventListener("load", function () { p.klar = true; });
            p.img.src = "sprites/" + navn + ".svg";
        });
    };
    T.spriteKlar = function (navn) { return !!(lager[navn] && lager[navn].klar); };
    T.sprite = function (ctx, navn, x, y, b) {
        var p = lager[navn], s = SPRITES[navn];
        if (!p || !p.klar) return false;
        ctx.drawImage(p.img, x, y, b, b * s.h / s.b);
        return true;
    };

    /* En genstand med bunden ved (cx, bund) og bredden b. Giver kassen. */
    T.genstand = function (ctx, navn, cx, bund, b) {
        var s = SPRITES[navn], h = b * s.h / s.b, x = cx - b / 2, y = bund - h;
        if (navn === "flaske") return null;
        if (!T.sprite(ctx, navn, x, y, b)) {
            ctx.save(); ctx.fillStyle = "rgba(160, 170, 180, 0.3)"; NK.rundtRekt(ctx, x, y, b, h, 8); ctx.fill(); ctx.restore();
        }
        return { x: x, y: y, w: b, h: h };
    };

    /* ----- Vaesken bag glasset ---------------------------------------------------
       farve er oploesningens farve, eller null for en farveloes oploesning.
       Forloebet er som bogens kuvetter: lysere og klarere foroven. */
    function fyld(ctx, farve, x0, x1, y0, y1) {
        if (!farve) {
            var g0 = ctx.createLinearGradient(x0, 0, x1, 0);
            g0.addColorStop(0, "rgba(186, 214, 230, 0.55)");
            g0.addColorStop(0.5, "rgba(232, 243, 249, 0.35)");
            g0.addColorStop(1, "rgba(176, 206, 224, 0.6)");
            return g0;
        }
        var g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, lys(farve, 0.28));
        g.addColorStop(0.5, farve);
        g.addColorStop(1, moerk(farve, 0.16));
        return g;
    }
    function hex(f) {
        var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(f);
        return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 200, 200];
    }
    function rgb(c) { return "rgb(" + c.map(function (v) { return Math.round(NK.klamp(v, 0, 255)); }).join(", ") + ")"; }
    function lys(f, t) { var c = hex(f); return rgb(c.map(function (v) { return v + (255 - v) * t; })); }
    function moerk(f, t) { var c = hex(f); return rgb(c.map(function (v) { return v * (1 - t); })); }
    T.lys = lys;
    T.moerk = moerk;

    function menisk(ctx, x0, x1, y) {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
        ctx.restore();
    }

    /* Maalekolben: vaesken op til maerket (y 40 i spritens maal) */
    T.kolbe = function (ctx, x, y, b, farve, opt) {
        opt = opt || {};
        var s = b / 100;
        function p(px, py) { return [x + px * s, y + py * s]; }
        ctx.save();
        ctx.beginPath();
        var a = p(46, 40); ctx.moveTo(a[0], a[1]);
        a = p(46, 87); ctx.lineTo(a[0], a[1]);
        var c1 = p(46, 98), c2 = p(15, 107), e = p(15, 132);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
        c1 = p(15, 148); c2 = p(22, 159); e = p(35, 159);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
        e = p(65, 159); ctx.lineTo(e[0], e[1]);
        c1 = p(78, 159); c2 = p(85, 148); e = p(85, 132);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
        c1 = p(85, 107); c2 = p(54, 98); e = p(54, 87);
        ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], e[0], e[1]);
        e = p(54, 40); ctx.lineTo(e[0], e[1]);
        ctx.closePath();
        ctx.fillStyle = fyld(ctx, farve, x + 15 * s, x + 85 * s, y + 40 * s, y + 159 * s);
        ctx.fill();
        ctx.restore();
        menisk(ctx, x + 46.5 * s, x + 53.5 * s, y + 40.5 * s);
        if (!T.sprite(ctx, "kolbe", x, y, b)) {
            ctx.save(); ctx.strokeStyle = "#7d93a3"; ctx.lineWidth = 1.5; NK.rundtRekt(ctx, x + 12 * s, y + 100 * s, 76 * s, 62 * s, 20 * s); ctx.stroke(); ctx.restore();
        }
        return { x: x, y: y, w: b, h: 172 * s, maerke: y + 40 * s, hals: x + 50 * s, bund: y + 162 * s };
    };

    /* Kuvetten: vaesken x 7-37, y 26-87 */
    T.kuvette = function (ctx, x, y, b, farve) {
        var s = b / 44;
        ctx.save();
        NK.rundtRekt(ctx, x + 7 * s, y + 26 * s, 30 * s, 61 * s, 2.5 * s);
        ctx.fillStyle = fyld(ctx, farve, x + 7 * s, x + 37 * s, y + 26 * s, y + 87 * s);
        ctx.fill();
        ctx.restore();
        menisk(ctx, x + 7.5 * s, x + 36.5 * s, y + 26.5 * s);
        if (!T.sprite(ctx, "kuvette", x, y, b)) {
            ctx.save(); ctx.strokeStyle = "#7d93a3"; ctx.lineWidth = 1.2; ctx.strokeRect(x + 5 * s, y + 3 * s, 34 * s, 88 * s); ctx.restore();
        }
        return { x: x, y: y, w: b, h: 96 * s };
    };

    /* Proeveglasset: vaesken x 10-60 fra y 52 til y 101 */
    T.flaske = function (ctx, x, y, b, farve) {
        var s = b / 70;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + 10 * s, y + 52 * s);
        ctx.lineTo(x + 60 * s, y + 52 * s);
        ctx.lineTo(x + 60 * s, y + 95 * s);
        ctx.quadraticCurveTo(x + 60 * s, y + 102 * s, x + 53 * s, y + 102 * s);
        ctx.lineTo(x + 17 * s, y + 102 * s);
        ctx.quadraticCurveTo(x + 10 * s, y + 102 * s, x + 10 * s, y + 95 * s);
        ctx.closePath();
        ctx.fillStyle = fyld(ctx, farve, x + 10 * s, x + 60 * s, y + 52 * s, y + 102 * s);
        ctx.fill();
        ctx.restore();
        menisk(ctx, x + 10.5 * s, x + 59.5 * s, y + 52.5 * s);
        if (!T.sprite(ctx, "flaske", x, y, b)) {
            ctx.save(); ctx.strokeStyle = "#7d93a3"; ctx.lineWidth = 1.2; NK.rundtRekt(ctx, x + 8 * s, y + 28 * s, 54 * s, 76 * s, 8 * s); ctx.stroke(); ctx.restore();
        }
        return { x: x, y: y, w: b, h: 112 * s };
    };

    /* ----- Pile ------------------------------------------------------------------
       Smaa graa pile mellem tingene (som bogens figurer). opt.bue boejer pilen,
       opt.farve og opt.bredde. */
    T.pil = function (ctx, x1, y1, x2, y2, opt) {
        opt = opt || {};
        var farve = opt.farve || "#8a9499", bredde = opt.bredde || 2, sp = opt.spids || 8;
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.fillStyle = farve;
        ctx.lineWidth = bredde;
        ctx.lineCap = "round";
        var vx, vy;
        if (opt.bue) {
            var mx = (x1 + x2) / 2 + opt.bue.x, my = (y1 + y2) / 2 + opt.bue.y;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(mx, my, x2 - (x2 - mx) * 0.08, y2 - (y2 - my) * 0.08); ctx.stroke();
            vx = x2 - mx; vy = y2 - my;
        } else {
            var l0 = Math.hypot(x2 - x1, y2 - y1) || 1;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - (x2 - x1) / l0 * sp * 0.6, y2 - (y2 - y1) / l0 * sp * 0.6); ctx.stroke();
            vx = x2 - x1; vy = y2 - y1;
        }
        var l = Math.hypot(vx, vy) || 1, ux = vx / l, uy = vy / l;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - ux * sp - uy * sp * 0.55, y2 - uy * sp + ux * sp * 0.55);
        ctx.lineTo(x2 - ux * sp + uy * sp * 0.55, y2 - uy * sp - ux * sp * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* ----- Lysets farve ------------------------------------------------------------ */
    T.lysFarve = function (l) {
        if (l < 400) return "#a78bfa";              /* UV: usynligt, tegnes lilla */
        var r = 0, g = 0, b = 0;
        if (l < 440) { r = (440 - l) / 60; b = 1; }
        else if (l < 490) { g = (l - 440) / 50; b = 1; }
        else if (l < 510) { g = 1; b = (510 - l) / 20; }
        else if (l < 580) { r = (l - 510) / 70; g = 1; }
        else if (l < 645) { r = 1; g = (645 - l) / 65; }
        else { r = 1; }
        function k(v) { return Math.round(255 * Math.pow(v, 0.8)); }
        return "rgb(" + k(r) + ", " + k(g) + ", " + k(b) + ")";
    };

    /* ----- Spektrofotometeret ------------------------------------------------------
       I bogens stil (figuren spektrofotometer): lampe, prisme, spalte, kuvette,
       detektor og display. Maal i 260 × 124, skaleret til bredden b.
       opt: lambda, A (tekst paa displayet eller null), farve (proevens farve,
       null = farveloes), ind (0-1: kuvetten er paa vej ned i holderen; null =
       ingen kuvette), T (transmittansen, saa lyset efter kuvetten er svagere),
       fokus ("display"). Giver { krop, display, kuvette }. */
    T.SPEKTRO_H = 124 / 260;
    T.spektro = function (ctx, x, y, b, opt) {
        opt = opt || {};
        var k = b / 260;
        function X(v) { return x + v * k; }
        function Y(v) { return y + v * k; }
        var uv = opt.lambda < 400, lysF = T.lysFarve(opt.lambda);
        ctx.save();
        /* kroppen */
        ctx.save();
        ctx.shadowColor = "rgba(40, 52, 60, 0.28)";
        ctx.shadowBlur = 12 * k;
        ctx.shadowOffsetY = 4 * k;
        var gk = ctx.createLinearGradient(0, Y(0), 0, Y(124));
        gk.addColorStop(0, "#f7f9fa");
        gk.addColorStop(1, "#d0d7dc");
        ctx.fillStyle = gk;
        NK.rundtRekt(ctx, X(0), Y(0), 260 * k, 124 * k, 14 * k);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#a9b6bd";
        ctx.lineWidth = 1.2;
        NK.rundtRekt(ctx, X(0), Y(0), 260 * k, 124 * k, 14 * k);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.beginPath(); ctx.moveTo(X(14), Y(2.5)); ctx.lineTo(X(246), Y(2.5)); ctx.stroke();
        /* vinduet */
        var gv = ctx.createLinearGradient(0, Y(12), 0, Y(108));
        gv.addColorStop(0, "#2b333d");
        gv.addColorStop(1, "#151a20");
        ctx.fillStyle = gv;
        NK.rundtRekt(ctx, X(12), Y(12), 166 * k, 96 * k, 10 * k);
        ctx.fill();
        ctx.strokeStyle = "#0e1216";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.save();
        NK.rundtRekt(ctx, X(12), Y(12), 166 * k, 96 * k, 10 * k);
        ctx.clip();
        var ly = Y(52);
        /* lampen */
        var gl = ctx.createRadialGradient(X(30), ly, 0, X(30), ly, 24 * k);
        gl.addColorStop(0, uv ? "rgba(214, 200, 255, 0.95)" : "rgba(255, 244, 196, 0.95)");
        gl.addColorStop(1, "rgba(255, 244, 196, 0)");
        ctx.fillStyle = gl;
        ctx.beginPath(); ctx.arc(X(30), ly, 24 * k, 0, Math.PI * 2); ctx.fill();
        var gp = ctx.createRadialGradient(X(28), ly - 2 * k, 0, X(30), ly, 8 * k);
        gp.addColorStop(0, "#fffdf0");
        gp.addColorStop(1, uv ? "#b9a6f5" : "#f3c94a");
        ctx.fillStyle = gp;
        ctx.beginPath(); ctx.arc(X(30), ly, 7.5 * k, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = uv ? "#7c6bc4" : "#b8901a";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* hvidt lys ind i prismet */
        ctx.strokeStyle = uv ? "rgba(225, 215, 255, 0.85)" : "rgba(255, 246, 214, 0.9)";
        ctx.lineWidth = 5 * k;
        ctx.beginPath(); ctx.moveTo(X(38), ly); ctx.lineTo(X(56), ly); ctx.stroke();
        /* prismet */
        ctx.beginPath(); ctx.moveTo(X(50), Y(66)); ctx.lineTo(X(68), Y(66)); ctx.lineTo(X(59), Y(38)); ctx.closePath();
        ctx.fillStyle = "rgba(214, 232, 244, 0.32)"; ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)"; ctx.lineWidth = 1; ctx.stroke();
        /* vifte af farver hen mod spalten */
        var vifte = ["#8b5cf6", "#3b82f6", "#22c55e", "#facc15", "#fb923c", "#ef4444"];
        vifte.forEach(function (f, i) {
            ctx.strokeStyle = f;
            ctx.globalAlpha = 0.85;
            ctx.lineWidth = 1.5 * k;
            ctx.beginPath(); ctx.moveTo(X(63), ly + 1 * k); ctx.lineTo(X(77), Y(40 + i * 5)); ctx.stroke();
        });
        ctx.globalAlpha = 1;
        /* spalten */
        ctx.fillStyle = "#c9d1d6";
        ctx.fillRect(X(78), Y(28), 3.5 * k, 21.5 * k);
        ctx.fillRect(X(78), Y(55.5), 3.5 * k, 22 * k);
        /* lyset med den valgte boelgelaengde */
        function straale(x0, x1, alfa, bredde) {
            ctx.save();
            ctx.globalAlpha = alfa;
            ctx.shadowColor = lysF;
            ctx.shadowBlur = 8 * k;
            ctx.strokeStyle = lysF;
            ctx.lineWidth = bredde * k;
            ctx.lineCap = "butt";
            if (uv) ctx.setLineDash([5 * k, 3 * k]);
            ctx.beginPath(); ctx.moveTo(X(x0), ly); ctx.lineTo(X(x1), ly); ctx.stroke();
            ctx.restore();
        }
        var harK = opt.ind !== null && opt.ind !== undefined;
        var inde = harK && opt.ind >= 1;
        /* Lyset efter kuvetten er svagere: T = 10^(−A) */
        var tr = inde && opt.T !== undefined ? NK.klamp(opt.T, 0, 1) : 1;
        var kb = 26, kx = X(99), ky = Y(24), kh = 96 * kb / 44;
        var kv0 = 99 + 7 * kb / 44, kv1 = 99 + 37 * kb / 44;
        if (inde) {
            straale(82, kv0, 0.95, 6);
            straale(kv1, 151, 0.2 + 0.75 * tr, 1.6 + 4.4 * tr);
        } else straale(82, 151, 0.95, 6);
        /* kuvetten i holderen (den glider ned, naar proeven skal maales) */
        if (harK) {
            var ned = NK.blod(NK.klamp(opt.ind, 0, 1));
            ky = Y(24) - (1 - ned) * 80 * k;
            T.kuvette(ctx, kx, ky, kb * k, opt.farve);
            /* lyset gennem vaesken */
            if (inde) {
                ctx.save();
                ctx.globalAlpha = 0.35 + 0.4 * tr;
                ctx.fillStyle = T.lysFarve(opt.lambda);
                ctx.fillRect(X(kv0), ly - 2.2 * k, (kv1 - kv0) * k, 4.4 * k);
                ctx.restore();
            }
        }
        ctx.fillStyle = "#3a434d";
        ctx.fillRect(X(95), Y(82), 34 * k, 5 * k);
        /* detektoren */
        var gd = ctx.createLinearGradient(0, Y(42), 0, Y(64));
        gd.addColorStop(0, "#dfe5e9");
        gd.addColorStop(1, "#8f9aa3");
        ctx.fillStyle = gd;
        NK.rundtRekt(ctx, X(151), Y(42), 14 * k, 22 * k, 3 * k);
        ctx.fill();
        ctx.fillStyle = "#1d252c";
        ctx.fillRect(X(151), Y(47), 3 * k, 12 * k);
        /* lysvejen under kuvetten */
        if (harK && opt.ind >= 1) {
            ctx.strokeStyle = "#cfe1dd";
            ctx.lineWidth = 1.2;
            var bx0 = X(99 + 7 * kb / 44), bx1 = X(99 + 37 * kb / 44), by = Y(92);
            ctx.beginPath();
            ctx.moveTo(bx0, by - 3 * k); ctx.lineTo(bx0, by); ctx.lineTo(bx1, by); ctx.lineTo(bx1, by - 3 * k);
            ctx.stroke();
            F.tekst(ctx, "l = 1,00 cm", (bx0 + bx1) / 2, Y(100.5), Math.max(10, 9.5 * k), "#cfe1dd", "center", { vaegt: 600 });
        }
        if (uv) F.tekst(ctx, "UV", X(30), Y(77), Math.max(10, 9.5 * k), "#c4b5fd", "center", { vaegt: 700 });
        ctx.restore();
        /* ledningen til displayet */
        ctx.strokeStyle = "#7d8790";
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(X(178), Y(58)); ctx.bezierCurveTo(X(184), Y(58), X(180), Y(76), X(188), Y(76)); ctx.stroke();
        /* displayet */
        var dx = X(184), dy = Y(14), dw = 66 * k, dh = 54 * k;
        var gdis = ctx.createLinearGradient(0, dy, 0, dy + dh);
        gdis.addColorStop(0, "#0f1d1a");
        gdis.addColorStop(1, "#14302a");
        ctx.fillStyle = gdis;
        NK.rundtRekt(ctx, dx, dy, dw, dh, 7 * k);
        ctx.fill();
        ctx.strokeStyle = "#2c3a35";
        ctx.lineWidth = 1;
        ctx.stroke();
        var aTekst = opt.A === null || opt.A === undefined ? "– – –" : opt.A;
        if (k >= 0.86) {
            F.tekst(ctx, "λ = " + opt.lambda + " nm", dx + dw / 2, dy + 13 * k, Math.max(10, 10 * k), "#9fb3ad", "center", { vaegt: 600 });
            F.tekst(ctx, "A", dx + 6 * k, dy + 36 * k, Math.max(11, 12 * k), "#9fd8bd", "left", { vaegt: 700 });
            F.tekst(ctx, aTekst, dx + dw - 5 * k, dy + 36 * k, Math.max(12, 16 * k), "#c9f7dd", "right", { vaegt: 800 });
        } else {
            /* Paa en lille skaerm: kun absorbansen (boelgelaengden staar ved kurven) */
            F.tekst(ctx, "A", dx + dw / 2, dy + 15 * k, 10.5, "#9fd8bd", "center", { vaegt: 700 });
            F.tekst(ctx, aTekst, dx + dw / 2, dy + 36 * k, Math.max(12, 16 * k), "#c9f7dd", "center", { vaegt: 800 });
        }
        /* knapperne */
        [198, 217, 236].forEach(function (bx) {
            var gb = ctx.createRadialGradient(X(bx - 2), Y(88), 0, X(bx), Y(90), 7 * k);
            gb.addColorStop(0, "#ffffff");
            gb.addColorStop(1, "#c3ccd2");
            ctx.fillStyle = gb;
            ctx.beginPath(); ctx.arc(X(bx), Y(90), 6.5 * k, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#9aa6ae"; ctx.lineWidth = 1; ctx.stroke();
        });
        ctx.restore();
        var disp = { x: dx, y: dy, w: dw, h: dh };
        if (opt.fokus === "display") T.gulKant(ctx, dx - 5, dy - 5, dw + 10, dh + 10, 10);
        return { krop: { x: x, y: y, w: b, h: 124 * k }, display: disp, kuvette: { x: kx, y: Y(24), w: kb * k, h: kh * k } };
    };

    /* ----- Standardkurven ------------------------------------------------------------ */
    function trinStoerrelse(maks, n) {
        var raa = maks / n, mag = Math.pow(10, Math.floor(Math.log(raa) / Math.LN10)), r = raa / mag;
        return (r <= 1 ? 1 : (r <= 2 ? 2 : (r <= 2.5 ? 2.5 : (r <= 5 ? 5 : 10)))) * mag;
    }
    function decimaler(trin) {
        var d = 0;
        while (d < 6 && Math.abs(Math.round(trin * Math.pow(10, d)) - trin * Math.pow(10, d)) > 1e-9) d++;
        return d;
    }
    T.akseTal = function (v, d) { return v.toFixed(d).replace(".", ","); };

    /* g: pladsen og akserne. opt.ymaks: mindst saa hoej (fx 1,52). */
    T.grafLay = function (ctx, k, o, opt) {
        opt = opt || {};
        var fs = NK.klamp(k.h / 24, 11.5, 13.5);
        var xmaks0 = Math.max.apply(null, o.c) * 1.1;
        var ymaks0 = Math.max(Math.max.apply(null, o.A), o.proeveA, opt.ymaks || 0) * 1.08;
        var xt = trinStoerrelse(xmaks0, 6), yt = trinStoerrelse(ymaks0, 5);
        var xmaks = Math.ceil(xmaks0 / xt - 1e-9) * xt, ymaks = Math.ceil(ymaks0 / yt - 1e-9) * yt;
        var xd = decimaler(xt), yd = Math.max(1, decimaler(yt));
        ctx.save();
        ctx.font = "400 " + fs + "px " + FONT;
        var yb = ctx.measureText(T.akseTal(ymaks, yd)).width;
        ctx.restore();
        var titelH = 24;
        var g = {
            k: k, fs: fs, xmaks: xmaks, ymaks: ymaks, xt: xt, yt: yt, xd: xd, yd: yd,
            x0: k.x + 22 + yb + 10, x1: k.x + k.w - 12,
            y0: k.y + titelH + 6, y1: k.y + k.h - fs * 1.3 - 12 - fs * 1.35 - 4
        };
        g.X = function (c) { return g.x0 + (c / g.xmaks) * (g.x1 - g.x0); };
        g.Y = function (A) { return g.y1 - (A / g.ymaks) * (g.y1 - g.y0); };
        g.tilC = function (px) { return (px - g.x0) / (g.x1 - g.x0) * g.xmaks; };
        g.s = NK.klamp((g.y1 - g.y0) / 260, 0.8, 1.1);
        return g;
    };

    T.graf = function (ctx, g, o, opt) {
        opt = opt || {};
        var k = g.k, fs = g.fs, v, i;
        /* overskriften */
        F.tekst(ctx, "Standardkurven", k.x + 4, k.y + 11, 15, BLAEK, "left", { vaegt: 800 });
        var tb = F.bredde(ctx, "Standardkurven", 15, 800);
        F.tekst(ctx, "ved " + o.lambda + " nm", k.x + 4 + tb + 8, k.y + 11.5, 13.5, DAEMPET, "left", { vaegt: 600 });
        /* fladen */
        ctx.save();
        var gf = ctx.createLinearGradient(0, g.y0, 0, g.y1);
        gf.addColorStop(0, "#fbfdfd");
        gf.addColorStop(1, "#ebf3f2");
        ctx.fillStyle = gf;
        ctx.beginPath();
        ctx.moveTo(g.x0, g.y1); ctx.lineTo(g.x0, g.y0 + 7); ctx.quadraticCurveTo(g.x0, g.y0, g.x0 + 7, g.y0);
        ctx.lineTo(g.x1 - 7, g.y0); ctx.quadraticCurveTo(g.x1, g.y0, g.x1, g.y0 + 7); ctx.lineTo(g.x1, g.y1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        if (opt.efterFlade) opt.efterFlade();
        /* gitteret */
        ctx.save();
        ctx.strokeStyle = "#d5e2e0";
        ctx.lineWidth = 1;
        for (v = g.yt; v <= g.ymaks + 1e-9; v += g.yt) { ctx.beginPath(); ctx.moveTo(g.x0, Math.round(g.Y(v)) + 0.5); ctx.lineTo(g.x1, Math.round(g.Y(v)) + 0.5); ctx.stroke(); }
        for (v = g.xt; v <= g.xmaks + 1e-9; v += g.xt) { ctx.beginPath(); ctx.moveTo(Math.round(g.X(v)) + 0.5, g.y0); ctx.lineTo(Math.round(g.X(v)) + 0.5, g.y1); ctx.stroke(); }
        /* akserne */
        ctx.strokeStyle = DAEMPET;
        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(g.x0, g.y0); ctx.lineTo(g.x0, g.y1); ctx.lineTo(g.x1, g.y1); ctx.stroke();
        ctx.lineWidth = 1.2;
        ctx.fillStyle = DAEMPET;
        ctx.font = "400 " + fs + "px " + FONT;
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        for (i = 0, v = 0; v <= g.ymaks + 1e-9; i++, v = i * g.yt) {
            var py = g.Y(v);
            ctx.beginPath(); ctx.moveTo(g.x0 - 5, py); ctx.lineTo(g.x0, py); ctx.stroke();
            ctx.fillText(T.akseTal(v, g.yd), g.x0 - 9, py + 0.5);
        }
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        for (i = 0, v = 0; v <= g.xmaks + 1e-9; i++, v = i * g.xt) {
            var px = g.X(v);
            ctx.beginPath(); ctx.moveTo(px, g.y1); ctx.lineTo(px, g.y1 + 5); ctx.stroke();
            ctx.fillText(T.akseTal(v, g.xd), px, g.y1 + 8);
        }
        ctx.restore();
        /* akseteksterne */
        var et = D.TABEL_ENHED[o.enhed].t;
        F.tekst(ctx, "koncentration af " + o.stof + " i " + et, (g.x0 + g.x1) / 2, g.y1 + fs * 1.3 + 12 + fs * 0.7, fs + 0.5, DAEMPET, "center", { vaegt: 400 });
        ctx.save();
        ctx.translate(k.x + 10, (g.y0 + g.y1) / 2);
        ctx.rotate(-Math.PI / 2);
        F.tekst(ctx, "absorbans", 0, 0, fs + 0.5, DAEMPET, "center", { vaegt: 400 });
        ctx.restore();
    };

    /* Et maalepunkt med glans og skygge: "a" blaagroen, "b" orange (proeven og
       punkterne uden for det lineære område), "valg" blaa, "graa" */
    var PUNKT = {
        a: ["#c6f0e9", "#17897f", "#0a5650", "#0b524c"],
        b: ["#ffe0bf", "#d9781f", "#8f4307", "#7c3a06"],
        valg: ["#d6e6ff", "#2f6fde", "#1b4597", "#1b4597"],
        roed: ["#ffd6d1", "#d9534f", "#8f1d1b", "#7a1715"]
    };
    T.punkt = function (ctx, x, y, s, slags, alfa) {
        var p = PUNKT[slags] || PUNKT.a;
        s = s || 1;
        ctx.save();
        if (alfa !== undefined) ctx.globalAlpha = alfa;
        ctx.shadowColor = "rgba(28, 53, 51, 0.32)";
        ctx.shadowBlur = 3.4 * s;
        ctx.shadowOffsetY = 1.8 * s;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(x, y, 7.4 * s, 0, Math.PI * 2); ctx.fill();
        ctx.shadowColor = "transparent";
        var gr = ctx.createRadialGradient(x - 1.5 * s, y - 2.1 * s, 0, x, y, 5.4 * s * 1.25);
        gr.addColorStop(0, p[0]);
        gr.addColorStop(0.55, p[1]);
        gr.addColorStop(1, p[2]);
        ctx.fillStyle = gr;
        ctx.beginPath(); ctx.arc(x, y, 5.4 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = p[3];
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.restore();
    };

    /* Et punkt, der er forkert: en roed ring */
    T.ring = function (ctx, x, y, s, farve) {
        ctx.save();
        ctx.strokeStyle = farve || T.FORKERT;
        ctx.lineWidth = 2.4;
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.beginPath(); ctx.arc(x, y, 7 * (s || 1), 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.restore();
    };

    /* Linjen A = a · c + b fra c = fra til c = til, klippet til fladen.
       opt.elev: elevens linje (roed og stiplet), opt.stiplet, opt.alfa */
    T.linje = function (ctx, g, a, b, fra, til, opt) {
        opt = opt || {};
        ctx.save();
        ctx.beginPath();
        ctx.rect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
        ctx.clip();
        var x1 = g.X(fra), y1 = g.Y(a * fra + b), x2 = g.X(til), y2 = g.Y(a * til + b);
        if (opt.alfa !== undefined) ctx.globalAlpha = opt.alfa;
        ctx.lineCap = "round";
        if (opt.elev) {
            ctx.strokeStyle = T.FORKERT;
            ctx.lineWidth = 2.2;
            ctx.setLineDash([8, 5]);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        } else {
            if (!opt.stiplet) {
                ctx.save();
                ctx.strokeStyle = "rgba(11, 82, 76, 0.22)";
                ctx.lineWidth = 4.6;
                ctx.filter = "blur(1.7px)";
                ctx.beginPath(); ctx.moveTo(x1, y1 + 2.4); ctx.lineTo(x2, y2 + 2.4); ctx.stroke();
                ctx.restore();
            } else ctx.setLineDash([7, 5]);
            ctx.strokeStyle = T.TEAL;
            ctx.lineWidth = opt.stiplet ? 1.8 : 2.4;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        ctx.restore();
    };

    /* Proeven paa kurven som bogens trin 2: den stiplede linje fra aksen ud til
       punktet og pilen ned til koncentrationen. opt.kunA: kun den stiplede
       linje hen over fladen (c er endnu ikke fundet). opt.cTekst, opt.aTekst. */
    T.proeve = function (ctx, g, c, A, opt) {
        opt = opt || {};
        var py = g.Y(A), farve = opt.farve || T.ORANGE, s = g.s;
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.lineCap = "round";
        var tilX = opt.kunA ? g.x1 : g.X(c);
        ctx.beginPath(); ctx.moveTo(g.x0, py); ctx.lineTo(tilX, py); ctx.stroke();
        ctx.restore();
        if (!opt.kunA) {
            var px = g.X(c);
            T.pil(ctx, px, py + 7 * s, px, g.y1 - 1, { farve: farve, bredde: 2, spids: 9 });
            T.punkt(ctx, px, py, s * 0.95, "b");
            if (opt.cTekst) T.haloTekst(ctx, opt.cTekst, px + 9, g.y1 - 14, 14, farve, "left");
        }
        if (opt.aTekst) T.haloTekst(ctx, opt.aTekst, g.x0 + 9, py - 11, 14, farve, "left");
    };

    /* Et skraveret omraade fra c = fra til c = til (det lineære område). */
    T.omraade = function (ctx, g, fra, til, opt) {
        opt = opt || {};
        var xa = Math.max(g.x0, g.X(fra)), xb = Math.min(g.x1, g.X(til));
        var farve = opt.farve || T.TEAL;
        ctx.save();
        ctx.fillStyle = opt.fyld || "rgba(15, 118, 110, 0.12)";
        ctx.fillRect(xa, g.y0, xb - xa, g.y1 - g.y0);
        ctx.strokeStyle = farve;
        ctx.lineWidth = 1.3;
        ctx.setLineDash([4, 4]);
        if (xa > g.x0 + 1) { ctx.beginPath(); ctx.moveTo(xa, g.y0); ctx.lineTo(xa, g.y1); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(xb, g.y0); ctx.lineTo(xb, g.y1); ctx.stroke();
        ctx.restore();
        if (opt.titel) {
            F.tekst(ctx, opt.titel, (xa + xb) / 2, g.y0 + 15, 13, farve, "center", { vaegt: 800, kant: "rgba(255,255,255,0.8)", kantBredde: 3 });
            if (opt.under) F.tekst(ctx, opt.under, (xa + xb) / 2, g.y0 + 31, 12, DAEMPET, "center", { vaegt: 500, kant: "rgba(255,255,255,0.8)", kantBredde: 3 });
        }
    };

    /* Regnearkets ligning i en hvid boks til hoejre i kurvens titellinje, saa
       den aldrig daekker punkterne eller proevens maerker */
    T.ligning = function (ctx, g, tekst, opt) {
        opt = opt || {};
        var fs = 13.5, w = F.bredde(ctx, tekst, fs, 700) + 20, h = 25;
        while (fs > 12 && w > g.k.w - 200) { fs -= 0.5; w = F.bredde(ctx, tekst, fs, 700) + 20; }
        var x = g.k.x + g.k.w - w - 4, y = g.k.y + 11 - h / 2;
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        NK.rundtRekt(ctx, x, y, w, h, 8);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = opt.ny ? "#3fae72" : "#b9d6d1";
        ctx.lineWidth = opt.ny ? 2 : 1.2;
        ctx.stroke();
        ctx.restore();
        F.tekst(ctx, tekst, x + 10, y + h / 2 + 0.5, fs, T.TEAL, "left", { vaegt: 700 });
        return { x: x, y: y, w: w, h: h };
    };

    NK.Tegning = T;
}());

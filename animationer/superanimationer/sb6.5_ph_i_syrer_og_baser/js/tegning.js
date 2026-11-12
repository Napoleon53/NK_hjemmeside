/* =====================================================================
   tegning.js - tavlen, skiltene, sprites, flaskerne og pKₛ-skalaen

   Kopieret fra sb6.1. Nyt i sb6.5 (nederst): T.rammer (de nummererede
   rammer, beregningen bygges op i), T.etiket, T.kegle (luppens kegle fra
   kolben) og T.phSkala (pH fra lidt under −1 til over 15).

   Tavlen, rammerne, skiltet, maerket og vinduet er de samme som i sb7.7
   Aminosyrer. Nyt i sb6.1:
   T.sprite(ctx, navn, x, y, b)         en SVG fra sprites/ (flaske, kolbe,
                                        phmeter); giver false, til den er klar
   T.flaske(ctx, x, y, b, linjer, opt)  reagensflasken med etiket
   T.skalaLay(x, y, b, k, opt)          pladsen til bogens dobbelte skala
   T.skala(ctx, s, opt)                 Kₛ-skalaen over pKₛ-skalaen med
                                        bogens fire grupper (b6-pks-skala)
   T.pksTilX / T.xTilPks                skalaens akse
   T.markoer(ctx, s, p, opt)            markoeren med Kₛ og pKₛ
   T.flag(ctx, s, p, tekst, raekke, opt) en syre, der staar paa skalaen
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
    T.FORKERT = "#d9534f";
    T.GROEN = "#2f9a5f";

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

    /* ----- Rammer --------------------------------------------------------------- */
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
        ctx.fillStyle = farve === T.FORKERT ? "rgba(217, 83, 79, 0.10)" : (farve === "#d69e0c" ? "rgba(242, 197, 61, 0.14)" :
            (farve === T.GROEN ? "rgba(47, 154, 95, 0.12)" : "rgba(47, 111, 222, 0.12)"));
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

    /* Et lille maerke med en tekst */
    T.maerke = function (ctx, x, y, tekst, opt) {
        opt = opt || {};
        var fs = opt.str || 13;
        ctx.save();
        var tb = F.bredde(ctx, tekst, fs, opt.vaegt || 700);
        var b = tb + 20, h = opt.h || 24;
        var bx = opt.justering === "right" ? x - b : (opt.justering === "center" ? x - b / 2 : x);
        if (opt.min !== undefined) bx = Math.max(opt.min, bx);
        if (opt.maks !== undefined) bx = Math.min(opt.maks - b, bx);
        ctx.fillStyle = opt.fyld || "#fff8e1";
        NK.rundtRekt(ctx, bx, y - h / 2, b, h, 7); ctx.fill();
        ctx.strokeStyle = opt.kant || "#d69e0c";
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
        F.tekst(ctx, tekst, bx + 10, y + 0.5, fs, opt.farve || BLAEK, "left", { vaegt: opt.vaegt || 700 });
        return { x: bx, y: y - h / 2, w: b, h: h };
    };

    /* ----- Sprites (SVG i sprites/, hentet med <img>, saa file:// virker) ---- */
    var SPRITES = { flaske: { b: 80, h: 130 }, kolbe: { b: 150, h: 170 }, phmeter: { b: 150, h: 112 } };
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

    /* ----- Reagensflasken med etiket ------------------------------------------
       (x, y) er oeverste venstre hjoerne, b bredden. linjer er etikettens
       tekst: [{ t, fs, vaegt, farve }] i flaskens egne maal (b = 80).
       opt: alfa, ramme ("valg", "rigtig", "gul"), skygge. Giver kassen. */
    T.flaske = function (ctx, x, y, b, linjer, opt) {
        opt = opt || {};
        var k = b / 80, h = 130 * k;
        ctx.save();
        if (opt.alfa !== undefined) ctx.globalAlpha *= opt.alfa;
        if (opt.loeftet) {
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 8;
        }
        if (!T.sprite(ctx, "flaske", x, y, b)) {
            /* Reserve, til spritet er hentet */
            ctx.fillStyle = "rgba(200, 222, 236, 0.6)";
            NK.rundtRekt(ctx, x + 7 * k, y + 38 * k, 66 * k, 88 * k, 10 * k); ctx.fill();
            ctx.fillStyle = "#2c3340";
            NK.rundtRekt(ctx, x + 27 * k, y + 5 * k, 26 * k, 19 * k, 3 * k); ctx.fill();
        }
        ctx.shadowColor = "transparent";
        /* Etiketten */
        var ex = x + 13 * k, ey = y + 64 * k, eb = 54 * k, eh = 50 * k;
        var g = ctx.createLinearGradient(0, ey, 0, ey + eh);
        g.addColorStop(0, "#fffef8");
        g.addColorStop(1, "#f1ede0");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, ex, ey, eb, eh, 3 * k);
        ctx.fill();
        ctx.strokeStyle = "rgba(120, 110, 80, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Teksten skrives kun, hvis den kan laeses (mindst 11 px); ellers
           to svage streger, som paa en trykt etiket */
        var n = (linjer || []).length, yy = ey + eh / 2 - (n - 1) * 7.5 * k, skrevet = false;
        (linjer || []).forEach(function (l) {
            var fs = (l.fs || 10) * k;
            while (fs > 11 && F.bredde(ctx, l.t, fs, l.vaegt || 700) > eb - 5 * k) fs -= 0.5;
            if (fs < 10.5 || F.bredde(ctx, l.t, fs, l.vaegt || 700) > eb - 5 * k) return;
            F.tekst(ctx, l.t, ex + eb / 2, yy, fs, l.farve || BLAEK, "center", { vaegt: l.vaegt || 700 });
            skrevet = true;
            yy += 15 * k;
        });
        if (!skrevet) {
            ctx.save();
            ctx.strokeStyle = "rgba(90, 80, 60, 0.35)";
            ctx.lineWidth = Math.max(1, 2.2 * k);
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(ex + 9 * k, ey + eh * 0.38); ctx.lineTo(ex + eb - 9 * k, ey + eh * 0.38);
            ctx.moveTo(ex + 14 * k, ey + eh * 0.62); ctx.lineTo(ex + eb - 14 * k, ey + eh * 0.62);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
        if (opt.ramme) {
            var farve = opt.ramme === "rigtig" ? T.GROEN : (opt.ramme === "gul" ? "#d69e0c" : (opt.ramme === "forkert" ? T.FORKERT : T.VALG));
            T.valgRamme(ctx, { x: x, y: y, w: b, h: h }, farve);
        }
        return { x: x, y: y, w: b, h: h };
    };

    /* ----- Bogens skala: Kₛ over pKₛ -------------------------------------------
       s = T.skalaLay(x, y, b, k, opt): en raekke til markoerens Kₛ, Kₛ-tallene
       og -aksen, baandet med de fire grupper, pKₛ-tallene, en raekke til
       markoerens pKₛ og to raekker til syrerne. opt.ks: false uden Kₛ-skala
       (fane 2). opt.flag: antal raekker til syrerne (2). */
    T.skalaLay = function (x, y, b, k, opt) {
        opt = opt || {};
        var medKs = opt.ks !== false, raekker = opt.flag === undefined ? 2 : opt.flag;
        var venstre = Math.round((medKs ? 84 : 58) * Math.max(0.85, k));
        var s = { k: k, ks: medKs, x: x, y: y, b: b, x0: x + venstre, x1: x + b - 18 * k, raekker: raekker };
        var yy = y;
        /* Markoerens tal staar oven paa tallenes raekke (som et maerke) */
        if (medKs) {
            s.yKtal = yy + 12 * k;           /* Kₛ-tallene */
            s.yK = yy + 26 * k;              /* Kₛ-aksen */
            s.yKlaes = s.yKtal;
            yy += 33 * k;
        } else {
            yy += 4 * k;
        }
        s.yB = yy;
        s.bh = 30 * k;
        s.yP = s.yB + s.bh + 13 * k;
        s.yPlaes = s.yP;
        s.yFlag = s.yP + 12 * k;
        s.flagH = 26 * k;
        s.bund = s.yFlag + raekker * s.flagH + 4 * k;
        s.h = s.bund - y;
        return s;
    };

    T.pksTilX = function (s, p) { return s.x0 + (s.x1 - s.x0) * (NK.klamp(p, D.SKALA_MIN, D.SKALA_MAX) - D.SKALA_MIN) / (D.SKALA_MAX - D.SKALA_MIN); };
    T.xTilPks = function (s, x) { return D.SKALA_MIN + (x - s.x0) / (s.x1 - s.x0) * (D.SKALA_MAX - D.SKALA_MIN); };

    /* Er punktet over skalaen (hele hoejden fra Kₛ-tallene til syrerne)? */
    T.paaSkala = function (s, pt, ekstra) {
        if (!s || !pt) return false;
        var e = ekstra || 0, top = s.ks ? s.yKtal - 14 * s.k : s.yB - 10;
        return pt.x > s.x0 - 14 - e && pt.x < s.x1 + 14 + e && pt.y > top - e && pt.y < s.bund + e;
    };

    T.skala = function (ctx, s, opt) {
        opt = opt || {};
        var k = s.k, i, p, x;
        var fs = Math.max(12, 13 * k), lbl = Math.max(13, 14 * k);
        /* Kₛ-aksen */
        if (s.ks) {
            F.tekst(ctx, "K_s i M", s.x0 - 24 * k, s.yKtal, lbl, BLAEK, "right", { vaegt: 800 });
            ctx.save();
            ctx.strokeStyle = "#556766";
            ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(s.x0, s.yK); ctx.lineTo(s.x1, s.yK); ctx.stroke();
            for (p = D.SKALA_MIN; p <= D.SKALA_MAX; p++) {
                x = T.pksTilX(s, p);
                ctx.beginPath(); ctx.moveTo(x, s.yK); ctx.lineTo(x, s.yK - (p % 2 === 0 ? 6 : 3) * k); ctx.stroke();
            }
            ctx.restore();
            var skridtK = (s.x1 - s.x0) / (D.SKALA_MAX - D.SKALA_MIN) < 26 ? 4 : 2;
            for (p = D.SKALA_MIN; p <= D.SKALA_MAX; p += skridtK) {
                x = T.pksTilX(s, p);
                F.tekst(ctx, p === 0 ? "1" : "10^{" + (-p) + "}", x, s.yKtal, fs, DAEMPET, "center", { vaegt: 600 });
            }
        }
        /* Baandet med de fire grupper */
        F.tekst(ctx, "pK_s", s.x0 - 12, s.yB + s.bh / 2, lbl, BLAEK, "right", { vaegt: 800 });
        var fra = D.SKALA_MIN;
        D.ZONER.forEach(function (z, j) {
            var til = Math.min(z.til, D.SKALA_MAX), xa = T.pksTilX(s, fra), xb = T.pksTilX(s, til);
            ctx.save();
            NK.rundtRekt(ctx, xa + 1, s.yB, xb - xa - 2, s.bh, 7 * k);
            ctx.fillStyle = z.farve;
            ctx.fill();
            var gl = ctx.createLinearGradient(0, s.yB, 0, s.yB + s.bh);
            gl.addColorStop(0, "rgba(255, 255, 255, 0.45)");
            gl.addColorStop(0.5, "rgba(255, 255, 255, 0)");
            gl.addColorStop(1, "rgba(0, 0, 0, 0.08)");
            ctx.fillStyle = gl;
            ctx.fill();
            if (opt.aktivZone === j) {
                ctx.strokeStyle = T.GROEN;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.restore();
            if (opt.navne !== false) {
                ctx.save();
                var navn = z.titel;
                ctx.font = "700 " + fs + "px " + FONT;
                if (ctx.measureText(navn).width < xb - xa - 10) NK.tekst(ctx, navn, (xa + xb) / 2, s.yB + s.bh / 2 + 1, { font: "700 " + fs + "px " + FONT, farve: "#14201f", justering: "center", linje: "middle" });
                ctx.restore();
            }
            fra = til;
        });
        /* pKₛ-tallene */
        ctx.save();
        ctx.strokeStyle = "#556766";
        ctx.lineWidth = 1.2;
        for (p = D.SKALA_MIN; p <= D.SKALA_MAX; p++) {
            x = T.pksTilX(s, p);
            ctx.beginPath(); ctx.moveTo(x, s.yB + s.bh + 1); ctx.lineTo(x, s.yB + s.bh + (p % 2 === 0 ? 5 : 3) * k); ctx.stroke();
        }
        ctx.restore();
        for (p = D.SKALA_MIN; p <= D.SKALA_MAX; p += 2) {
            x = T.pksTilX(s, p);
            NK.tekst(ctx, D.tal(p), x, s.yP + 1, { font: "600 " + fs + "px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        /* Pilen: stærkere syre mod venstre */
        if (opt.pil !== false) {
            var py = s.bund + 10 * k, px = s.x0;
            ctx.save();
            ctx.strokeStyle = "#a93226";
            ctx.fillStyle = "#a93226";
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(px + 4, py); ctx.lineTo(px + 120 * k, py); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 9, py - 5); ctx.lineTo(px + 9, py + 5); ctx.closePath(); ctx.fill();
            ctx.restore();
            NK.tekst(ctx, "stærkere syre", px + 128 * k, py + 1, { font: "700 " + fs + "px " + FONT, farve: "#a93226", linje: "middle" });
        }
    };

    /* Markoeren: en lodret streg gennem begge skalaer med Kₛ over og pKₛ under.
       opt: farve, ks (vis Kₛ), tekstP (teksten under), tekstK, svag (graa) */
    T.markoer = function (ctx, s, p, opt) {
        opt = opt || {};
        var x = T.pksTilX(s, p), k = s.k, farve = opt.farve || "#2a3342";
        ctx.save();
        ctx.strokeStyle = farve;
        ctx.globalAlpha = opt.svag ? 0.5 : 1;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(x, s.ks ? s.yK - 8 * k : s.yB - 4);
        ctx.lineTo(x, s.yB + s.bh + 6 * k);
        ctx.stroke();
        ctx.restore();
        var fs = Math.max(12.5, 13.5 * k);
        function boks(tekst, y) {
            var w = F.bredde(ctx, tekst, fs, 700) + 16, h = 22 * Math.max(0.9, k);
            var bx = opt.side === "venstre" ? x - w + 8 : (opt.side === "hoejre" ? x - 8 : x - w / 2);
            bx = NK.klamp(bx, s.x - 4, s.x + s.b - w + 4);
            ctx.save();
            ctx.globalAlpha = opt.svag ? 0.6 : 1;
            ctx.fillStyle = farve;
            NK.rundtRekt(ctx, bx, y - h / 2, w, h, 6);
            ctx.fill();
            ctx.restore();
            F.tekst(ctx, tekst, bx + w / 2, y + 0.5, fs, "#ffffff", "center", { vaegt: 700 });
        }
        if (s.ks && opt.ks !== false) boks(opt.tekstK || ("K_s = " + D.potensC(D.ksFraPks(p), 2) + " M"), s.yKlaes);
        boks(opt.tekstP || ("pK_s = " + D.tal1(p)), s.yPlaes);
    };

    /* En syre, der staar paa skalaen: en lille stang ned fra baandet og et
       skilt med formlen og pKₛ. raekke 0 eller 1. */
    T.flagMaal = function (ctx, s, tekst) { return F.bredde(ctx, tekst, Math.max(12, 13 * s.k), 700) + 14; };
    T.flag = function (ctx, s, p, tekst, raekke, opt) {
        opt = opt || {};
        var x = T.pksTilX(s, p), k = s.k, fs = Math.max(12, 13 * s.k);
        var y = s.yFlag + (raekke + 0.5) * s.flagH;
        var w = T.flagMaal(ctx, s, tekst), h = 22 * Math.max(0.9, k);
        var bx = NK.klamp(x - w / 2, s.x - 2, s.x + s.b - w + 2);
        ctx.save();
        ctx.globalAlpha = opt.alfa === undefined ? 1 : opt.alfa;
        ctx.strokeStyle = opt.kant || "#5d6b6b";
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(x, s.yB + s.bh); ctx.lineTo(x, y - h / 2); ctx.stroke();
        ctx.setLineDash([]);
        /* Prikken sidder i baandets underkant, saa gruppens navn kan laeses */
        ctx.beginPath(); ctx.arc(x, s.yB + s.bh - 5, 4, 0, Math.PI * 2);
        ctx.fillStyle = opt.kant || "#14201f"; ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.5; ctx.stroke();
        NK.rundtRekt(ctx, bx, y - h / 2, w, h, 6);
        ctx.fillStyle = opt.fyld || "#ffffff";
        ctx.fill();
        ctx.strokeStyle = opt.kant || "#8a9a9c";
        ctx.lineWidth = opt.gul ? 2.5 : 1.3;
        if (opt.gul) ctx.strokeStyle = "#d69e0c";
        ctx.stroke();
        ctx.restore();
        F.tekst(ctx, tekst, bx + w / 2, y + 0.5, fs, opt.farve || BLAEK, "center", { vaegt: 700, alfa: opt.alfa });
        return { x: bx, y: y - h / 2, w: w, h: h };
    };

    /* Raekkerne til en liste af syrer [{ p, tekst }], saa skiltene ikke
       roerer hinanden: hver faar den foerste raekke, hvor der er plads */
    T.flagRaekker = function (ctx, s, liste) {
        var slut = [];
        for (var r = 0; r < s.raekker; r++) slut.push(-1e9);
        return liste.map(function (f) {
            var w = T.flagMaal(ctx, s, f.tekst), x = T.pksTilX(s, f.p) - w / 2;
            for (var r2 = 0; r2 < s.raekker; r2++) {
                if (x > slut[r2] + 6) { slut[r2] = x + w; return r2; }
            }
            return s.raekker - 1;
        });
    };

    /* ----- Et vindue ind i oploesningen -------------------------------------- */
    T.vindue = function (ctx, x, y, b, h) {
        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.16)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#163c5c";
        NK.rundtRekt(ctx, x, y, b, h, 14);
        ctx.fill();
        ctx.restore();
    };


    /* ===================================================================
       NYT I SB6.5
       =================================================================== */

    /* Spoergsmaalstegnet i en ramme: tegnes som ? i en gul ring */
    T.SPM = { spm: true };

    /* ----- Rammerne: beregningen bygges op (som sb6.1 fane 3) ----------------
       liste: [{ id, nr, titel, tilst, linjer: [{ d, kort, daempet }], alfa }]
       tilst: "loest", "groen", "aktiv" eller null (kommende: kun titlen).
       d er delene til F.linje; T.SPM bliver til ? i en gul ring. kort er en
       kortere udgave, naar d ikke kan vaere der med 12,5 px. Giver kasserne. */
    function linjeHoejde(l) { return F.harBroek(l.d) ? 2.55 : 1.45; }

    /* plads: rammens faste hoejde (i skriftstoerrelser), saa intet flytter
       sig, naar en ramme bliver fyldt ud (brugerens roligt ark) */
    T.rammeHoejde = function (r) {
        if (r.plads) return r.plads;
        if (!r.tilst) return 1.7;
        return 0.8 + r.linjer.reduce(function (a, l) { return a + linjeHoejde(l); }, 0);
    };

    T.rammer = function (ctx, x, y, b, ledigt, liste, opt) {
        opt = opt || {};
        var luft = opt.luft || 7, kol = 0;
        liste.forEach(function (r) { kol = Math.max(kol, F.bredde(ctx, r.titel, 13.5, 800)); });
        kol += 44;
        var sum = liste.reduce(function (a, r) { return a + T.rammeHoejde(r); }, 0);
        var f = Math.min(opt.maks || 17, (ledigt - luft * (liste.length - 1)) / Math.max(1, sum));
        var lfs = NK.klamp(f, 12.5, 17), kasser = [], yy = y;
        liste.forEach(function (r) {
            var h = T.rammeHoejde(r) * f, aktiv = r.tilst === "aktiv", groen = r.tilst === "groen";
            var loest = r.tilst === "loest" || groen;
            ctx.save();
            NK.rundtRekt(ctx, x, yy, b, h, 9);
            ctx.fillStyle = aktiv ? "rgba(242, 197, 61, 0.12)" : (groen ? "rgba(47, 154, 95, 0.08)" : (loest ? "#ffffff" : "rgba(255, 255, 255, 0.4)"));
            ctx.fill();
            ctx.strokeStyle = aktiv ? "#d69e0c" : (groen ? T.GROEN : (loest ? "#b9c4c8" : "#c3cacd"));
            ctx.lineWidth = aktiv || groen ? 2.5 : 1.3;
            if (!r.tilst) ctx.setLineDash([5, 4]);
            ctx.stroke();
            ctx.restore();
            var foerste = r.linjer && r.linjer[0] ? linjeHoejde(r.linjer[0]) : (r.broek ? 2.55 : 1.45);
            var cy = yy + Math.min(h / 2, 0.4 * f + foerste * f / 2);
            ctx.save();
            ctx.beginPath(); ctx.arc(x + 17, cy, 10.5, 0, Math.PI * 2);
            ctx.fillStyle = loest ? T.GROEN : (aktiv ? "#d69e0c" : "#aeb7bb");
            ctx.fill();
            ctx.restore();
            NK.tekst(ctx, loest ? "✓" : String(r.nr), x + 17, cy + 1, { font: "800 12px " + FONT, farve: "#ffffff", justering: "center", linje: "middle" });
            F.tekst(ctx, r.titel, x + 34, cy, 13.5, r.tilst ? BLAEK : "#8a9499", "left", { vaegt: 800 });
            var kasse = { id: r.id, x: x, y: yy, w: b, h: h, linjer: [] };
            if (r.tilst) {
                var ly = yy + 0.4 * f, bred = b - kol - 12;
                r.linjer.forEach(function (l) {
                    var lh = linjeHoejde(l) * f, my = ly + lh / 2;
                    /* Et tomt led foran ? giver luft til den gule ring */
                    function medSpm(liste) {
                        var ud = [];
                        liste.forEach(function (d) { if (d === T.SPM) ud.push("", { t: "?", spm: true }); else ud.push(d); });
                        return ud;
                    }
                    var dele = medSpm(l.d);
                    var fs = l.daempet ? Math.max(12.5, lfs * 0.86) : lfs;
                    while (fs > 12.5 && F.linjeBredde(ctx, dele, fs, 700) > bred) fs -= 0.5;
                    if (F.linjeBredde(ctx, dele, fs, 700) > bred && l.kort) {
                        dele = medSpm(l.kort);
                        fs = l.daempet ? Math.max(12.5, lfs * 0.86) : lfs;
                        while (fs > 12.5 && F.linjeBredde(ctx, dele, fs, 700) > bred) fs -= 0.5;
                    }
                    var res = F.linje(ctx, dele, x + kol, my, fs, l.farve || (l.daempet ? DAEMPET : BLAEK), "left",
                        { vaegt: l.daempet ? 600 : 700, alfa: r.alfa === undefined ? 1 : r.alfa });
                    dele.forEach(function (d, i) {
                        if (d && d.spm && aktiv) { var k = res.kasser[i]; T.gulRamme(ctx, k.x - 7, k.y - 2, k.w + 14, k.h + 4, 7); }
                        if (d && d.ring) T.valgRamme(ctx, res.kasser[i], d.ring);
                    });
                    kasse.linjer.push({ y: my, b: res.b, kasser: res.kasser });
                    ly += lh;
                });
            }
            kasser.push(kasse);
            yy += h + luft;
        });
        return { kasser: kasser, bund: yy - luft, f: f };
    };

    /* ----- En etiket af papir med linjer (den foerste fed) ---------------------
       Giver hoejden. linjer i F's skrivemaade. */
    T.etiket = function (ctx, x, y, b, linjer, opt) {
        opt = opt || {};
        var fs = opt.fs || 14, lh = fs * 1.42, h = lh * linjer.length + fs * 0.7;
        if (opt.kunHoejde) return h;
        ctx.save();
        ctx.fillStyle = opt.groen ? "#e6f6ec" : "#fffdf5";
        NK.rundtRekt(ctx, x, y, b, h, 8);
        ctx.fill();
        ctx.strokeStyle = opt.groen ? T.GROEN : "#cdbf96";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
        linjer.forEach(function (l, i) {
            var t = typeof l === "string" ? l : l.t, f2 = i === 0 ? fs * 1.06 : fs;
            while (f2 > 11.5 && F.bredde(ctx, t, f2, i === 0 ? 800 : 700) > b - 16) f2 -= 0.5;
            F.tekst(ctx, t, x + 9, y + fs * 0.35 + lh * (i + 0.5), f2, (l && l.farve) || (i === 0 ? BLAEK : DAEMPET), "left", { vaegt: i === 0 ? 800 : 700 });
        });
        return h;
    };

    /* ----- Luppens kegle fra et punkt i vaesken til luppens kant ---------------- */
    T.kegle = function (ctx, p, R) {
        ctx.save();
        ctx.fillStyle = "rgba(91, 104, 120, 0.10)";
        ctx.strokeStyle = "rgba(91, 104, 120, 0.45)";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);
        var a = { x: R.x + 10, y: R.y + R.h }, b = { x: R.x + R.b - 10, y: R.y + R.h };
        if (p.y < R.y) { a = { x: R.x + 10, y: R.y }; b = { x: R.x + R.b - 10, y: R.y }; }
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(a.x, a.y); ctx.moveTo(p.x, p.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.strokeStyle = "#5b6878"; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.restore();
    };

    /* ----- pH-skalaen (brugerens regel: tallene fra −1 til 15, og skalaen
       tones ud i begge ender, saa den ikke ser ud til at stoppe) ----------------
       opt: markoer (pH), spoegelse (et forkert svar), tekst (markoerens tekst).
       Giver hoejden. */
    var PH_FARVER = [[-1, "#c0392b"], [1, "#e0533f"], [3, "#ef8a3c"], [5, "#f2c53d"], [7, "#5bb85c"], [9, "#2f9a8f"], [11, "#2f6fb2"], [13, "#5b4bb0"], [15, "#6d3c98"]];
    T.phSkalaHoejde = function () { return 88; };
    T.phTilX = function (sk, ph) { return sk.x0 + (sk.x1 - sk.x0) * (ph + 1) / 16; };
    T.phSkala = function (ctx, x, y, b, opt) {
        opt = opt || {};
        var sk = { x0: x + 62, x1: x + b - 40 }, by = y + 34, bh = 14, i;
        var ud = (sk.x1 - sk.x0) / 16 * 0.75;
        var g = ctx.createLinearGradient(sk.x0, 0, sk.x1, 0);
        PH_FARVER.forEach(function (p) { g.addColorStop((p[0] + 1) / 16, p[1]); });
        ctx.save();
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, sk.x0, by, sk.x1 - sk.x0, bh, 3);
        ctx.fill();
        /* Enderne tones ud */
        [[sk.x0 - ud, sk.x0, PH_FARVER[0][1], 0], [sk.x1, sk.x1 + ud, PH_FARVER[PH_FARVER.length - 1][1], 1]].forEach(function (e) {
            var gg = ctx.createLinearGradient(e[0], 0, e[1], 0);
            gg.addColorStop(e[3] ? 0 : 1, e[2]);
            gg.addColorStop(e[3] ? 1 : 0, "rgba(255, 255, 255, 0)");
            ctx.fillStyle = gg;
            ctx.fillRect(e[0], by, e[1] - e[0], bh);
        });
        ctx.restore();
        /* Tallene −1 til 15 */
        for (i = -1; i <= 15; i++) {
            var tx = T.phTilX(sk, i);
            ctx.save();
            ctx.strokeStyle = "#556766";
            ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(tx, by + bh); ctx.lineTo(tx, by + bh + 4); ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, D.tal(i), tx, by + bh + 14, { font: "600 12px " + FONT, farve: DAEMPET, justering: "center", linje: "middle" });
        }
        NK.tekst(ctx, "sur", T.phTilX(sk, 2), by + bh + 31, { font: "700 13px " + FONT, farve: "#a93226", justering: "center", linje: "middle" });
        NK.tekst(ctx, "neutral", T.phTilX(sk, 7), by + bh + 31, { font: "700 13px " + FONT, farve: "#2f7a3f", justering: "center", linje: "middle" });
        NK.tekst(ctx, "basisk", T.phTilX(sk, 12), by + bh + 31, { font: "700 13px " + FONT, farve: "#2f4f9a", justering: "center", linje: "middle" });
        NK.tekst(ctx, "pH", x + 8, by + bh / 2 + 1, { font: "800 13px " + FONT, farve: BLAEK, linje: "middle" });
        function markoer(ph, farve, tekst, stiplet) {
            var mx = T.phTilX(sk, NK.klamp(ph, -1.4, 15.4));
            ctx.save();
            ctx.strokeStyle = farve;
            ctx.lineWidth = 3;
            if (stiplet) ctx.setLineDash([4, 3]);
            ctx.beginPath(); ctx.moveTo(mx, by - 3); ctx.lineTo(mx, by + bh + 3); ctx.stroke();
            ctx.restore();
            var w = F.bredde(ctx, tekst, 13, 800) + 14, bx = NK.klamp(mx - w / 2, x, x + b - w);
            ctx.save();
            ctx.fillStyle = farve;
            NK.rundtRekt(ctx, bx, y + 2, w, 20, 6);
            ctx.fill();
            ctx.beginPath(); ctx.moveTo(mx - 5, y + 21); ctx.lineTo(mx + 5, y + 21); ctx.lineTo(mx, y + 27); ctx.closePath(); ctx.fill();
            ctx.restore();
            F.tekst(ctx, tekst, bx + w / 2, y + 12.5, 13, "#ffffff", "center", { vaegt: 800 });
        }
        if (opt.spoegelse !== null && opt.spoegelse !== undefined) markoer(opt.spoegelse, T.FORKERT, "pH = " + D.d2(opt.spoegelse) + "?", true);
        if (opt.markoer !== null && opt.markoer !== undefined) markoer(opt.markoer, T.GROEN, opt.tekst || ("pH = " + D.d2(opt.markoer)));
        return T.phSkalaHoejde();
    };

    NK.Tegning = T;
}());

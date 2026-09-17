/* =====================================================================
   scene.js - laboratoriebordet, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1120 x 600 enheder, som skaleres og
   centreres i laerredet. Bordet har to dele:

   Del 1, de syv glas: kolben med stamoploesning, baegerglasset, tre
   pulverglas med spatel, KSCN og AgNO3, stativet med otte reagensglas
   foran et hvidt kort, varmt vandbad paa varmepladen, isbad, termometer
   og affaldsdunk.

   Del 2, fortynding: kolben, frugtfarve, sproejteflaske med vand og to
   baegerglas paa et hvidt papir.

   Genstandene er SVG-filer i sprites/. Hver genstand har et ankerpunkt og
   en positur { x, y, v }: hvor ankeret staar, og hvor meget den haelder.

   Filen indeholder kun maal og tegning. Tilstanden ligger i forsoeg.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Sprites.FILER;
    var M = NK.Model;
    var S = {};
    NK.Scene = S;

    S.BREDDE = 1120;
    S.HOEJDE = 600;
    S.BORD = 500;

    /* ----- Ankerpunkter i spritenes egne koordinater ----------------- */
    S.ANKER = {
        kolbe:        { x: 48, y: 2.5 },
        baeger:       { x: 36, y: 4 },
        pulver_fe:    { x: 19, y: 4 },
        pulver_vitc:  { x: 19, y: 4 },
        pulver_scn:   { x: 19, y: 4 },
        spatel:       { x: 12, y: 6 },
        flaske_scn:   { x: 21, y: 3 },
        flaske_farve: { x: 21, y: 3 },
        ag:           { x: 23, y: 0 },
        vand:         { x: 44, y: 9 },
        reagensglas:  { x: 15, y: 2 },
        dunk:         { x: 45, y: 12 },
        papir:        { x: 36, y: 22 },
        haand:        { x: 40, y: 46 }
    };

    /* Kemichaels ankre (laereren og kaffekoppen) staar i ../kemichael/kemichael.js */
    Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });

    /* Positur for en genstand, der staar paa underlaget y med midten i x. */
    function staar(navn, x, y) {
        var f = F[navn], a = S.ANKER[navn];
        return { x: x - f.b / 2 + a.x, y: (y === undefined ? S.BORD : y) - f.h + a.y, v: 0 };
    }
    S.staar = staar;

    S.HYLDE = { x0: 16, x1: 116, y: 268 };
    S.UR = { x: 66, y: 170, r: 24 };
    S.STATIV = { x: 426, y: 400, b: 362, huller: [460, 502, 544, 586, 628, 670, 712, 754] };
    S.KORT = { x: 416, y: 290, b: 382, h: 208 };
    S.GLAS_Y = S.BORD - 12 - 154 + 2;
    S.VARMEPLADE = { x: 812, y: 457, skala: 0.6 };
    S.DUNK = { x: 1026, y: S.BORD - 130, aabning: { x: 1071, y: S.BORD - 118 } };
    S.PAPIR = { x: 380, b: 360 };
    S.BOBLE = { x: 300, y: 205, r: 185 };
    S.LUP_GLAS = { x: 15, y: 128 };
    S.LUP_BAEGER = { x: 36, y: 88 };
    S.STAV_L = 170;
    S.TERM_L = 150;

    /* Vandbadet staar paa varmepladen, isbadet paa bordet. Et reagensglas i
       badet staar med bunden lige over badets bund. */
    S.BAD = {
        vandbad: { cx: 866, bund: 457, skala: 0.8 },
        isbad:   { cx: 972, bund: S.BORD, skala: 0.8 }
    };
    Object.keys(S.BAD).forEach(function (navn) {
        var B = S.BAD[navn];
        B.navn = navn;
        B.b = F.bad.b * B.skala;
        B.h = F.bad.h * B.skala;
        B.x = B.cx - B.b / 2;
        B.y = B.bund - B.h;
        B.niveau = B.y + 57 * B.skala;
        B.glas = { x: B.cx, y: B.y + 126 * B.skala - 4 - 150, v: 0 };
    });

    S.HJEM = {
        /* Del 1 */
        kolbe1:       staar("kolbe", 60),
        baegerA:      staar("baeger", 150),
        pulver_fe:    staar("pulver_fe", 214),
        pulver_vitc:  staar("pulver_vitc", 256),
        pulver_scn:   staar("pulver_scn", 298),
        spatel:       { x: 208, y: S.BORD - 5, v: 0 },
        flaske_scn:   staar("flaske_scn", 346),
        ag:           staar("ag", 394),
        glasstav:     { x: 16, y: S.BORD - 3, v: -Math.PI / 2 },
        termometer:   { x: 812, y: S.BORD - 4, v: -Math.PI / 2 },
        /* Del 2 */
        kolbe2:       staar("kolbe", 80),
        flaske_farve: staar("flaske_farve", 170),
        vand:         staar("vand", 236),
        baegerV:      staar("baeger", 480),
        baegerH:      staar("baeger", 640),
        /* Begge */
        kaffekop:     staar("kaffekop", 60, S.HYLDE.y)
    };
    S.STATIV.huller.forEach(function (x, i) {
        S.HJEM["glas" + (i + 1)] = { x: x, y: S.GLAS_Y, v: 0 };
    });

    /* Navnene paa forkanten af bordet, i to raekker */
    S.ETIKETTER = {
        1: [
            { x: 60, r: 0, t: "stamopløsning" },
            { x: 214, r: 0, t: "Fe(NO₃)₃ (s)" },
            { x: 256, r: 1, t: "ascorbinsyre (s)" },
            { x: 298, r: 0, t: "KSCN (s)" },
            { x: 346, r: 1, t: "KSCN 0,1 M" },
            { x: 394, r: 0, t: "AgNO₃ 0,1 M" },
            { x: 866, r: 1, t: "varmt vandbad" },
            { x: 972, r: 0, t: "isbad" },
            { x: 1071, r: 1, t: "surt uorganisk" }
        ],
        2: [
            { x: 80, r: 0, t: "stamopløsning" },
            { x: 170, r: 1, t: "frugtfarve" },
            { x: 236, r: 0, t: "vand" },
            { x: 560, r: 0, t: "hvidt papir" },
            { x: 1071, r: 1, t: "surt uorganisk" }
        ]
    };

    /* ----- Indersider (lokale koordinater) ------------------------------ */
    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    S.GLAS_INDRE = (function () {
        var l = [[6, 4], [24, 4], [24, 143]];
        for (var i = 1; i < 12; i++) {
            var v = Math.PI * i / 12;
            l.push([15 + 9 * Math.cos(v), 143 + 9 * Math.sin(v)]);
        }
        l.push([6, 143]);
        return pts(l);
    }());
    /* Areal pr. mL i tegneenheder */
    S.GLAS_ML = 146;
    S.BAEGER_INDRE = pts([[6, 6], [66, 6], [66, 100], [62, 104], [10, 104], [6, 100]]);
    S.BAEGER_ML = 54;
    S.KOLBE_INDRE = pts([[37.8, 4], [37.8, 41.6], [8.3, 113.3], [8.6, 119.5], [14.1, 123.5], [81.9, 123.5], [87.4, 119.5], [87.7, 113.3], [58.2, 41.6], [58.2, 4]]);
    S.KOLBE_ML = NK.polyAreal(S.KOLBE_INDRE) / 270;
    S.BAD_INDRE = pts([[8, 8], [104, 8], [104, 121], [99, 126], [13, 126], [8, 121]]);

    S.indreVerden = function (liste, p, anker) {
        return liste.map(function (q) { return NK.tilVerden(p, anker, q.x, q.y); });
    };

    /* Omregner mellem laerredets pixels og tegnebordet. */
    S.skala = function (b, h) {
        var s = Math.min(b / S.BREDDE, h / S.HOEJDE);
        return { s: s, dx: (b - S.BREDDE * s) / 2, dy: (h - S.HOEJDE * s) / 2 };
    };

    /* Ligger punktet paa genstanden (spritets rektangel plus pad)? */
    S.inden = function (navn, p, anker, px, py, pad) {
        var f = F[navn];
        var l = NK.tilLokal(p, anker, px, py);
        pad = pad || 0;
        return l.x > -pad && l.x < f.b + pad && l.y > -pad && l.y < f.h + pad;
    };

    S.rekt = function (navn, p, anker, pad) {
        var f = F[navn];
        pad = pad || 0;
        var hj = [[-pad, -pad], [f.b + pad, -pad], [f.b + pad, f.h + pad], [-pad, f.h + pad]];
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        hj.forEach(function (h) {
            var w = NK.tilVerden(p, anker, h[0], h[1]);
            x0 = Math.min(x0, w.x); y0 = Math.min(y0, w.y);
            x1 = Math.max(x1, w.x); y1 = Math.max(y1, w.y);
        });
        return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
    };

    S.iRekt = function (r, pt, pad) {
        pad = pad || 0;
        return pt.x > r.x - pad && pt.x < r.x + r.b + pad && pt.y > r.y - pad && pt.y < r.y + r.h + pad;
    };

    S.badRekt = function (navn, off) {
        var B = S.BAD[navn];
        off = off || { x: 0, y: 0 };
        return { x: B.x + off.x, y: B.y + off.y, b: B.b, h: B.h };
    };

    /* ================================================================
       LOKALET
       ================================================================ */
    S.tegnBaggrund = function (ctx, v) {
        var g = ctx.createLinearGradient(0, 0, 0, S.BORD);
        g.addColorStop(0, "#1b1f26");
        g.addColorStop(1, "#2b3039");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Fliser paa vaeggen bag bordet */
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        ctx.fillRect(-2000, 300, S.BREDDE + 4000, S.BORD - 300);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.045)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 300; y < S.BORD; y += 40) { ctx.moveTo(-2000, y); ctx.lineTo(3200, y); }
        for (var x = -2000; x < 3200; x += 40) { ctx.moveTo(x, 300); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        var lys = ctx.createRadialGradient(560, 40, 20, 560, 40, 680);
        lys.addColorStop(0, "rgba(255, 244, 220, 0.09)");
        lys.addColorStop(1, "rgba(255, 244, 220, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Loft med lysstofroer */
        ctx.fillStyle = "#2c3139";
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, 2030);
        ctx.fillStyle = "rgba(255, 248, 225, 0.6)";
        NK.rundtRekt(ctx, 160, 36, 800, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, 560, 42, 190, "rgba(255, 248, 225, 0.1)");

        S.tegnUr(ctx, v.urMinutter);

        /* Hylde til venstre */
        var H = S.HYLDE;
        ctx.fillStyle = "#6b4a2c";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 7);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 1.5);
        ctx.fillStyle = "#4a3320";
        ctx.fillRect(H.x0 + 10, H.y + 7, 5, 14);
        ctx.fillRect(H.x1 - 15, H.y + 7, 5, 14);

        /* Bordplade og forkant */
        ctx.fillStyle = "#3b404b";
        ctx.fillRect(-2000, S.BORD, S.BREDDE + 4000, 9);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(-2000, S.BORD, S.BREDDE + 4000, 1.5);
        var f = ctx.createLinearGradient(0, S.BORD + 9, 0, S.HOEJDE);
        f.addColorStop(0, "#23262e");
        f.addColorStop(1, "#16181d");
        ctx.fillStyle = f;
        ctx.fillRect(-2000, S.BORD + 9, S.BREDDE + 4000, 2000);
    };

    S.tegnEtiketter = function (ctx, station) {
        (S.ETIKETTER[station] || []).forEach(function (e) {
            NK.tekst(ctx, e.t, e.x, S.BORD + 26 + e.r * 19, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#aeb6c0" });
        });
    };

    /* Vaeguret. minutter er minutter siden kl. 0. */
    S.tegnUr = function (ctx, minutter) {
        var U = S.UR, i;
        ctx.save();
        ctx.fillStyle = "#e9ecef";
        ctx.beginPath();
        ctx.arc(U.x, U.y, U.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#1c2026";
        ctx.stroke();
        ctx.strokeStyle = "#39404a";
        ctx.lineWidth = 1.4;
        for (i = 0; i < 12; i++) {
            var va = i * Math.PI / 6;
            ctx.beginPath();
            ctx.moveTo(U.x + Math.cos(va) * (U.r - 3), U.y + Math.sin(va) * (U.r - 3));
            ctx.lineTo(U.x + Math.cos(va) * (U.r - 7), U.y + Math.sin(va) * (U.r - 7));
            ctx.stroke();
        }
        var min = minutter % 60;
        var tim = (minutter / 60) % 12;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#1c2026";
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.moveTo(U.x, U.y);
        ctx.lineTo(U.x + Math.sin(tim / 12 * Math.PI * 2) * 11, U.y - Math.cos(tim / 12 * Math.PI * 2) * 11);
        ctx.stroke();
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(U.x, U.y);
        ctx.lineTo(U.x + Math.sin(min / 60 * Math.PI * 2) * 17, U.y - Math.cos(min / 60 * Math.PI * 2) * 17);
        ctx.stroke();
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.arc(U.x, U.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Det hvide kort bag stativet */
    S.tegnKort = function (ctx, fremhaev, tid) {
        var K = S.KORT;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        NK.rundtRekt(ctx, K.x + 6, K.y + 6, K.b, K.h - 6, 6);
        ctx.fill();
        var g = ctx.createLinearGradient(K.x, K.y, K.x + K.b, K.y + K.h);
        g.addColorStop(0, "#f8f9f7");
        g.addColorStop(1, "#dde1e4");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, K.x, K.y, K.b, K.h, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        if (fremhaev) S.tegnMarkering(ctx, K, tid);
    };

    /* Det hvide papir, som baegerglassene i del 2 staar paa */
    S.tegnPapir = function (ctx, fremhaev, tid) {
        var P = S.PAPIR;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.fillRect(P.x + 6, S.BORD + 1, P.b, 5);
        ctx.fillStyle = "#f3f4f1";
        ctx.beginPath();
        ctx.moveTo(P.x + 16, S.BORD - 9);
        ctx.lineTo(P.x + P.b - 16, S.BORD - 9);
        ctx.lineTo(P.x + P.b, S.BORD + 4);
        ctx.lineTo(P.x, S.BORD + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        if (fremhaev) S.tegnMarkering(ctx, { x: P.x, y: S.BORD - 124, b: P.b, h: 128 }, tid);
    };

    S.tegnStativ = function (ctx) {
        NK.Sprites.tegn(ctx, "stativ", S.STATIV.x, S.STATIV.y);
    };

    S.tegnDunk = function (ctx, fremhaev, tid) {
        S.skygge(ctx, S.DUNK.x + 45, 40, 0.3);
        NK.Sprites.tegn(ctx, "dunk", S.DUNK.x, S.DUNK.y);
        if (fremhaev) S.tegnMarkering(ctx, { x: S.DUNK.x, y: S.DUNK.y, b: 90, h: 130 }, tid);
    };

    S.tegnVarmeplade = function (ctx, tid) {
        var V = S.VARMEPLADE, k = V.skala;
        S.skygge(ctx, V.x + 90 * k, 58, 0.3);
        NK.Sprites.tegn(ctx, "varmeplade", V.x, V.y, 180 * k, 72 * k);
        var kx = V.x + 52 * k, ky = V.y + 46 * k;
        ctx.save();
        ctx.strokeStyle = "#e9edf1";
        ctx.lineWidth = 1.8;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(kx, ky);
        ctx.lineTo(kx + Math.cos(-Math.PI / 2 + 1.5) * 6, ky + Math.sin(-Math.PI / 2 + 1.5) * 6);
        ctx.stroke();
        ctx.restore();
        var lx = V.x + 82 * k, ly = V.y + 38 * k;
        NK.skaer(ctx, lx, ly, 9, "rgba(255, 90, 60, 0.9)", 0.6 + 0.2 * Math.sin(tid * 3));
        NK.kugle(ctx, lx, ly, 2.2, "#ffb3a8", "#c0392b");
    };

    /* Vandbadet eller isbadet. Tegnes efter et glas, der staar i badet, saa
       vandet ligger hen over glassets nederste del. */
    S.tegnBad = function (ctx, navn, tid, fremhaev, skyggeOk) {
        var B = S.BAD[navn], k = B.skala, i;
        var verden = S.BAD_INDRE.map(function (q) { return { x: B.x + q.x * k, y: B.y + q.y * k }; });
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(B.x - 2, B.niveau);
        for (var x = B.x; x <= B.x + B.b + 4; x += 4) ctx.lineTo(x, B.niveau + Math.sin(x * 0.2 + tid * 3) * 0.8);
        ctx.lineTo(B.x + B.b + 4, B.bund + 4);
        ctx.lineTo(B.x - 2, B.bund + 4);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, B.niveau, 0, B.bund);
        g.addColorStop(0, NK.css(M.FARVE.badVand, navn === "isbad" ? 1.1 : 0.9));
        g.addColorStop(1, NK.css(M.FARVE.badVand, 1.5));
        ctx.fillStyle = g;
        ctx.fill();
        if (navn === "vandbad") {
            ctx.fillStyle = "rgba(235, 245, 255, 0.55)";
            for (i = 0; i < 9; i++) {
                var fase = (tid * (0.35 + i * 0.043) + i * 0.37) % 1;
                var bx = B.x + 14 + ((i * 37) % 70) + Math.sin(tid * 3 + i) * 2;
                var by = B.bund - 8 - fase * (B.bund - 8 - B.niveau);
                ctx.beginPath();
                ctx.arc(bx, by, 1.3 + (i % 3) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            for (i = 0; i < 5; i++) {
                var ix = B.x + 12 + i * 15 + (i % 2) * 3;
                var iy = B.niveau - 4 + (i % 2) * 7 + Math.sin(tid * 1.4 + i) * 1.2;
                ctx.save();
                ctx.translate(ix, iy);
                ctx.rotate(0.3 * Math.sin(i * 2.1));
                ctx.fillStyle = "rgba(236, 246, 255, 0.78)";
                NK.rundtRekt(ctx, -7, -6, 14, 12, 3);
                ctx.fill();
                ctx.strokeStyle = "rgba(160, 200, 230, 0.8)";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillRect(-4, -4, 4, 2);
                ctx.restore();
            }
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(B.x, B.niveau);
        ctx.lineTo(B.x + B.b, B.niveau);
        ctx.stroke();
        ctx.restore();
        if (navn === "isbad" && skyggeOk !== false) S.skygge(ctx, B.cx, 44, 0.3);
        NK.Sprites.tegn(ctx, "bad", B.x, B.y, B.b, B.h);
        if (fremhaev) S.tegnMarkering(ctx, { x: B.x, y: B.y, b: B.b, h: B.h }, tid);
    };

    S.skygge = function (ctx, x, rx, alfa, y) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, " + (alfa === undefined ? 0.35 : alfa) + ")";
        ctx.beginPath();
        ctx.ellipse(x, (y === undefined ? S.BORD : y) + 3, rx, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Stiplet, pulserende ramme om det, eleven kan bruge nu. */
    S.tegnMarkering = function (ctx, r, tid, farve) {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.35 * Math.sin(tid * 4);
        ctx.strokeStyle = farve || "#f2c53d";
        ctx.lineWidth = 2.2;
        ctx.setLineDash([7, 6]);
        ctx.lineDashOffset = -tid * 12;
        NK.rundtRekt(ctx, r.x - 6, r.y - 6, r.b + 12, r.h + 12, 9);
        ctx.stroke();
        ctx.restore();
    };

    /* ================================================================
       VAESKER
       ================================================================ */
    function boelgeLinje(ctx, x0, x1, niveau, boelge, tid, fase) {
        ctx.moveTo(x0, niveau);
        for (var x = x0; x <= x1; x += 4) {
            ctx.lineTo(x, niveau + Math.sin(x * 0.12 + tid * 10 + fase) * boelge + Math.sin(x * 0.05 - tid * 6.5) * boelge * 0.6);
        }
    }

    /* Tegner ét vaeskelag i beholderen: fra overfladen 'niveau' ned til
       'bund' (eller polygonens bund). */
    S.tegnLag = function (ctx, verden, niveau, bund, farve, opt) {
        opt = opt || {};
        if (!farve) return;
        var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        var slut = bund === null || bund === undefined ? y1 + 6 : bund;
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        boelgeLinje(ctx, x0 - 4, x1 + 6, niveau, opt.boelge || 0, opt.tid || 0, 0);
        ctx.lineTo(x1 + 6, slut);
        ctx.lineTo(x0 - 4, slut);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, niveau, 0, slut);
        g.addColorStop(0, NK.css(farve, 0.9));
        g.addColorStop(1, NK.css(farve, 1.1));
        ctx.fillStyle = g;
        ctx.fill();
        if (opt.uklar > 0.01) {
            ctx.fillStyle = NK.css(M.FARVE.bundfald, NK.klamp(opt.uklar, 0, 1) * 0.8);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, " + (opt.kant === undefined ? 0.3 : opt.kant) + ")";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, niveau);
        ctx.lineTo(x1, niveau);
        ctx.stroke();
        ctx.restore();
    };

    /* Hele vaesken i en beholder: den blandede oploesning og det ublandede
       lag, som i toppen toner ud nedad og i bunden toner ud opad.
       Returnerer overfladen. */
    S.tegnVaeske = function (ctx, verden, arealTot, arealSol, solFarve, lagFarve, opt) {
        opt = opt || {};
        if (arealTot <= 2 || !solFarve) return null;
        var top = NK.vaeskeNiveau(verden, arealTot);
        S.tegnLag(ctx, verden, top, null, solFarve, { boelge: opt.boelge, tid: opt.tid, uklar: opt.uklar, kant: 0.35 });
        if (lagFarve && arealTot - arealSol > 6) {
            var x0 = Infinity, x1 = -Infinity, yBund = -Infinity;
            verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); yBund = Math.max(yBund, p.y); });
            var fra, til;
            if (opt.lagBund) {
                var hLag = yBund - NK.vaeskeNiveau(verden, arealTot - arealSol);
                fra = yBund;
                til = Math.max(top, yBund - hLag - 14);
            } else {
                var solNiv = arealSol > 2 ? NK.vaeskeNiveau(verden, arealSol) : top + 40;
                fra = top;
                til = Math.max(solNiv + 10, top + 8);
            }
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            var g = ctx.createLinearGradient(0, fra, 0, til);
            g.addColorStop(0, NK.css(lagFarve, 1));
            g.addColorStop(0.5, NK.css(lagFarve, 0.8));
            g.addColorStop(1, NK.css(lagFarve, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x0 - 4, Math.max(top, Math.min(fra, til)));
            ctx.lineTo(x1 + 4, Math.max(top, Math.min(fra, til)));
            ctx.lineTo(x1 + 4, Math.max(fra, til) + 2);
            ctx.lineTo(x0 - 4, Math.max(fra, til) + 2);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        return top;
    };

    /* Tegner i beholderens egne koordinater, klippet til indersiden */
    function iBeholder(ctx, p, anker, verden, tegn) {
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-anker.x, -anker.y);
        tegn();
        ctx.restore();
    }

    function tegnBundfald(ctx, p, anker, verden, x0, x1, y, h) {
        iBeholder(ctx, p, anker, verden, function () {
            ctx.beginPath();
            ctx.moveTo(x0, y + 1);
            ctx.lineTo(x0, y - h);
            for (var x = x0; x <= x1; x += 3) ctx.lineTo(x, y - h + Math.sin(x * 1.7) * 1.1);
            ctx.lineTo(x1, y + 1);
            ctx.closePath();
            ctx.fillStyle = NK.css(M.FARVE.bundfald);
            ctx.fill();
            ctx.strokeStyle = "rgba(120, 130, 140, 0.35)";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        });
    }

    /* Korn af fast stof, der endnu ikke er oploest. fast = { fe, scn, vitc } µmol */
    function tegnFast(ctx, p, anker, verden, fast, x0, x1, y) {
        if (!fast) return;
        var n = 0;
        iBeholder(ctx, p, anker, verden, function () {
            ["fe", "scn", "vitc"].forEach(function (t) {
                var m = Math.min(16, Math.ceil((fast[t] || 0) / 2.5));
                var f = M.FARVE.fast[t];
                for (var i = 0; i < m; i++) {
                    var k = n + i;
                    var gx = x0 + ((k * 7.3) % (x1 - x0));
                    var gy = y - 1.8 - ((k * 5) % 4) - (k > 10 ? 2.5 : 0);
                    ctx.save();
                    ctx.translate(gx, gy);
                    ctx.rotate(k * 0.9);
                    ctx.fillStyle = NK.css(f, 1);
                    ctx.fillRect(-1.5, -1.5, 3, 3);
                    ctx.strokeStyle = "rgba(90, 90, 110, 0.5)";
                    ctx.lineWidth = 0.5;
                    ctx.strokeRect(-1.5, -1.5, 3, 3);
                    ctx.restore();
                }
                n += m;
            });
        });
    }

    function omrids(ctx, p, anker, sti) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-anker.x, -anker.y);
        ctx.strokeStyle = "rgba(55, 70, 85, 0.45)";
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        sti();
        ctx.stroke();
        ctx.restore();
    }

    /* Reagensglasset.
       g: { p, V, Vsol, solFarve, lagFarve, lagBund, bund (0-1), uklar, fast,
            boelge, fremhaev, nr, valgt }
       Returnerer vaeskens overflade paa tegnebordet (eller null). */
    S.tegnGlas = function (ctx, g, tid) {
        var a = S.ANKER.reagensglas;
        var verden = S.indreVerden(S.GLAS_INDRE, g.p, a);
        var top = null;
        if (g.V > 0.02) {
            top = S.tegnVaeske(ctx, verden, g.V * S.GLAS_ML, g.Vsol * S.GLAS_ML, g.solFarve, g.lagFarve, { boelge: g.boelge, tid: tid, uklar: g.uklar, lagBund: g.lagBund });
            if (g.bund > 0.01) tegnBundfald(ctx, g.p, a, verden, 5, 25, 152, 14 * NK.klamp(g.bund, 0, 1.4));
        }
        tegnFast(ctx, g.p, a, verden, g.fast, 9, 21, 151);

        /* Et tyndt moerkt omrids, saa glasset ogsaa ses mod det hvide kort */
        omrids(ctx, g.p, a, function () {
            ctx.moveTo(3, 3);
            ctx.lineTo(3, 143);
            ctx.arc(15, 143, 12, Math.PI, 0, true);
            ctx.lineTo(27, 3);
        });
        NK.Sprites.tegnPositur(ctx, "reagensglas", g.p, a);

        /* Nummeret over glasset. Det valgte glas har gult maerke. */
        if (g.nr) {
            var m = NK.tilVerden(g.p, a, -9, 14);
            ctx.save();
            ctx.fillStyle = g.valgt ? "#f2c53d" : "rgba(45, 50, 58, 0.92)";
            ctx.strokeStyle = g.valgt ? "#7a5a10" : "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(m.x, m.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            NK.tekst(ctx, String(g.nr), m.x, m.y + 0.5, { font: "800 12px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: g.valgt ? "#2a1d04" : "#dfe5ec" });
            ctx.restore();
        }

        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("reagensglas", g.p, a, 0), tid);
        return top;
    };

    /* Baegerglasset. Samme felter som tegnGlas. */
    S.tegnBaeger = function (ctx, g, tid, hjemme) {
        var a = S.ANKER.baeger;
        var verden = S.indreVerden(S.BAEGER_INDRE, g.p, a);
        var top = null;
        if (hjemme) S.skygge(ctx, g.p.x, 38, 0.3);
        if (g.V > 0.02) {
            top = S.tegnVaeske(ctx, verden, g.V * S.BAEGER_ML, g.Vsol * S.BAEGER_ML, g.solFarve, g.lagFarve, { boelge: g.boelge, tid: tid, uklar: g.uklar, lagBund: g.lagBund });
            if (g.bund > 0.01) tegnBundfald(ctx, g.p, a, verden, 7, 65, 104, 5 * NK.klamp(g.bund, 0, 2));
        }
        tegnFast(ctx, g.p, a, verden, g.fast, 14, 58, 103);
        omrids(ctx, g.p, a, function () {
            ctx.moveTo(3, 4);
            ctx.lineTo(3, 101);
            ctx.quadraticCurveTo(3, 109, 11, 109);
            ctx.lineTo(61, 109);
            ctx.quadraticCurveTo(69, 109, 69, 101);
            ctx.lineTo(69, 4);
        });
        NK.Sprites.tegnPositur(ctx, "baeger", g.p, a);
        if (g.valgt) {
            var m = NK.tilVerden(g.p, a, 60, -8);
            NK.kugle(ctx, m.x, m.y, 5.5, "#ffe38a", "#b88a12");
        }
        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("baeger", g.p, a, 0), tid);
        return top;
    };

    /* Kolben med stamoploesning. g: { p, V, farve, boelge, fremhaev } */
    S.tegnKolbe = function (ctx, g, tid, hjemme) {
        var a = S.ANKER.kolbe;
        var verden = S.indreVerden(S.KOLBE_INDRE, g.p, a);
        if (hjemme) S.skygge(ctx, g.p.x, 44, 0.3);
        if (g.V > 0.5 && g.farve) S.tegnLag(ctx, verden, NK.vaeskeNiveau(verden, g.V * S.KOLBE_ML), null, g.farve, { boelge: g.boelge, tid: tid, kant: 0.35 });
        omrids(ctx, g.p, a, function () {
            ctx.moveTo(35.2, 3.8);
            ctx.lineTo(35.2, 41);
            ctx.lineTo(5.1, 114);
            ctx.quadraticCurveTo(2.6, 126.7, 14, 126.7);
            ctx.lineTo(82, 126.7);
            ctx.quadraticCurveTo(93.4, 126.7, 90.9, 114);
            ctx.lineTo(60.8, 41);
            ctx.lineTo(60.8, 3.8);
        });
        NK.Sprites.tegnPositur(ctx, "kolbe", g.p, a);
        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("kolbe", g.p, a, 0), tid);
    };

    /* Spatlen. last: det stof, der ligger paa den, eller null */
    S.tegnSpatel = function (ctx, p, last, fremhaev, tid) {
        NK.Sprites.tegnPositur(ctx, "spatel", p, S.ANKER.spatel);
        if (last) {
            var m = NK.tilVerden(p, S.ANKER.spatel, 12, 3.5);
            ctx.save();
            ctx.translate(m.x, m.y);
            ctx.rotate(p.v);
            ctx.fillStyle = NK.css(M.FARVE.fast[last], 1);
            ctx.beginPath();
            ctx.ellipse(0, 0, 7, 3.4, 0, Math.PI, 0);
            ctx.fill();
            ctx.strokeStyle = "rgba(90, 90, 110, 0.5)";
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
        }
        if (fremhaev) S.tegnMarkering(ctx, S.rekt("spatel", p, S.ANKER.spatel, 2), tid);
    };

    /* Glasstaven: en linje fra ankeret (0, 0) til (0, STAV_L) */
    S.stavEnde = function (p) {
        return NK.tilVerden(p, { x: 0, y: 0 }, 0, S.STAV_L);
    };

    S.stavRekt = function (p) {
        var e = S.stavEnde(p);
        return { x: Math.min(p.x, e.x) - 4, y: Math.min(p.y, e.y) - 4, b: Math.abs(e.x - p.x) + 8, h: Math.abs(e.y - p.y) + 8 };
    };

    S.tegnStav = function (ctx, p, fremhaev, tid) {
        var e = S.stavEnde(p);
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(70, 90, 105, 0.55)";
        ctx.lineWidth = 5.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(225, 238, 247, 0.9)";
        ctx.lineWidth = 3.6;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(NK.lerp(p.x, e.x, 0.08), NK.lerp(p.y, e.y, 0.08) - 1);
        ctx.lineTo(NK.lerp(p.x, e.x, 0.9), NK.lerp(p.y, e.y, 0.9) - 1);
        ctx.stroke();
        ctx.restore();
        if (fremhaev) S.tegnMarkering(ctx, S.stavRekt(p), tid);
    };

    /* Termometeret: toppen er ankeret (0, 0), kuglen sidder i (0, TERM_L) */
    S.termEnde = function (p) {
        return NK.tilVerden(p, { x: 0, y: 0 }, 0, S.TERM_L);
    };

    S.termRekt = function (p) {
        var e = S.termEnde(p);
        return { x: Math.min(p.x, e.x) - 7, y: Math.min(p.y, e.y) - 7, b: Math.abs(e.x - p.x) + 14, h: Math.abs(e.y - p.y) + 14 };
    };

    function skalaY(t) {
        return S.TERM_L - 16 - (t + 10) / 120 * (S.TERM_L - 30);
    }

    S.temperaturTekst = function (T) {
        return String(Math.round(T * 2) / 2).replace(".", ",") + " °C";
    };

    S.tegnTermometer = function (ctx, p, T, visTal, fremhaev, tid) {
        var L = S.TERM_L;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.fillStyle = "rgba(225, 238, 247, 0.6)";
        NK.rundtRekt(ctx, -4, 0, 8, L - 5, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(60, 80, 95, 0.65)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.strokeStyle = "rgba(40, 50, 60, 0.7)";
        ctx.lineWidth = 0.7;
        for (var t = 0; t <= 100; t += 10) {
            var y = skalaY(t);
            ctx.beginPath();
            ctx.moveTo(1, y);
            ctx.lineTo(t % 50 === 0 ? 4 : 2.8, y);
            ctx.stroke();
        }
        var yT = skalaY(NK.klamp(T, -10, 110));
        ctx.fillStyle = "#d93a2b";
        ctx.fillRect(-1.3, yT, 2.6, L - 6 - yT);
        NK.kugle(ctx, 0, L - 3, 5.5, "#ff8a7a", "#a3231a");
        ctx.restore();
        if (visTal) {
            var w = NK.tilVerden(p, { x: 0, y: 0 }, 0, -18);
            var tekst = S.temperaturTekst(T);
            ctx.save();
            ctx.font = "700 14px 'Segoe UI', sans-serif";
            var b = ctx.measureText(tekst).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, w.x - b / 2, w.y - 12, b, 24, 12);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, tekst, w.x, w.y + 0.5, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffd6c9" });
            ctx.restore();
        }
        if (fremhaev) S.tegnMarkering(ctx, S.termRekt(p), tid);
    };

    /* En straale vaeske fra en aabning ned til en overflade. */
    S.tegnStraale = function (ctx, fra, til, farve, bredde, tid) {
        if (!farve) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.quadraticCurveTo(fra.x + (til.x - fra.x) * 0.85, fra.y + 2, til.x, til.y);
        ctx.strokeStyle = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: Math.max(0.6, farve.a) });
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tid * 90;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = Math.max(1, bredde * 0.35);
        ctx.stroke();
        ctx.restore();
    };

    S.tegnDraaber = function (ctx, draaber) {
        ctx.save();
        for (var i = 0; i < draaber.length; i++) {
            var d = draaber[i];
            ctx.globalAlpha = NK.klamp(d.liv === undefined ? 1 : d.liv, 0, 1);
            if (d.korn) {
                ctx.fillStyle = NK.css(d.farve, 1);
                ctx.fillRect(d.x - 1.4, d.y - 1.4, 2.8, 2.8);
                continue;
            }
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, d.r * 0.8, d.r, 0, 0, Math.PI * 2);
            if (d.farveloes) {
                ctx.fillStyle = "rgba(210, 230, 245, 0.18)";
                ctx.fill();
                ctx.strokeStyle = "rgba(235, 245, 255, 0.85)";
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
                ctx.beginPath();
                ctx.arc(d.x - d.r * 0.25, d.y - d.r * 0.35, d.r * 0.25, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = NK.css(d.farve, 1);
                ctx.fill();
            }
        }
        ctx.restore();
    };

    /* Damp fra vandbadet */
    S.tegnDampe = function (ctx, dampe) {
        ctx.save();
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.16;
            ctx.fillStyle = "#eef3f8";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Pytten paa bordet efter et uheld */
    S.tegnPyt = function (ctx, pyt) {
        if (!pyt || pyt.vaad < 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(pyt.vaad, 0, 1);
        ctx.fillStyle = NK.css(pyt.farve, 1);
        ctx.beginPath();
        ctx.ellipse(pyt.x, S.BORD + 2.5, pyt.rx, 5.5, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x + pyt.rx * 0.55, S.BORD + 3, pyt.rx * 0.45, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x - pyt.rx * 0.6, S.BORD + 2, pyt.rx * 0.35, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        ctx.ellipse(pyt.x - pyt.rx * 0.2, S.BORD + 1.5, pyt.rx * 0.4, 1.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* ================================================================
       ZOOMBOBLENS FORBINDELSE
       ================================================================ */
    S.tegnForbindelse = function (ctx, punkt, b, alfa) {
        if (alfa < 0.01) return;
        var dx = punkt.x - b.x, dy = punkt.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > b.r + 6) {
            var th = Math.atan2(dy, dx), al = Math.acos(b.r / d);
            var t1 = { x: b.x + b.r * Math.cos(th + al), y: b.y + b.r * Math.sin(th + al) };
            var t2 = { x: b.x + b.r * Math.cos(th - al), y: b.y + b.r * Math.sin(th - al) };
            ctx.save();
            ctx.globalAlpha = alfa;
            ctx.beginPath();
            ctx.moveTo(punkt.x, punkt.y);
            ctx.lineTo(t1.x, t1.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.closePath();
            ctx.fillStyle = "rgba(190, 220, 245, 0.05)";
            ctx.fill();
            ctx.setLineDash([4, 5]);
            ctx.strokeStyle = "rgba(210, 230, 250, 0.4)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(t1.x, t1.y);
            ctx.lineTo(punkt.x, punkt.y);
            ctx.lineTo(t2.x, t2.y);
            ctx.stroke();
            ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = alfa;
        NK.Sprites.tegn(ctx, "lup", punkt.x - 15, punkt.y - 15, 34, 34);
        ctx.restore();
    };

    /* ================================================================
       VISNINGERNE: BILLEDET I DEL 1 OG GLASSENE OVENFRA I DEL 2
       ================================================================ */
    /* En beholder set ovenfra paa hvidt papir. g: { farve, bund (0-1), uklar, tom } */
    S.tegnOppefra = function (ctx, x, y, r, g) {
        var i;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.beginPath();
        ctx.arc(x + 3, y + 4, r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#eef3f6";
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(80, 95, 110, 0.55)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        if (g.tom || !g.farve) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "rgba(120, 130, 140, 0.6)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            ctx.fillStyle = NK.css(g.farve, 1);
            ctx.fill();
            if (g.uklar > 0.01) {
                ctx.fillStyle = "rgba(246, 247, 244, " + (NK.klamp(g.uklar, 0, 1) * 0.6).toFixed(3) + ")";
                ctx.fill();
            }
            if (g.bund > 0.01) {
                var n = Math.round(10 + 26 * NK.klamp(g.bund, 0, 1));
                for (i = 0; i < n; i++) {
                    var va = i * 2.399, rr = r * 0.82 * Math.sqrt((i + 0.5) / n);
                    ctx.fillStyle = "rgba(252, 252, 250, 0.95)";
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(va) * rr, y + Math.sin(va) * rr, 2.2 + (i % 3) * 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r - 6, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();
        ctx.restore();
    };

    S.visLuk = function (A) {
        return { x: A.x + A.b - 28, y: A.y + 28, r: 17 };
    };

    function tegnArk(ctx, A, titel, tekst) {
        ctx.fillStyle = "rgba(4, 6, 12, 0.72)";
        ctx.fillRect(-2000, -2000, 5000, 5000);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        NK.rundtRekt(ctx, A.x + 8, A.y + 10, A.b, A.h, 14);
        ctx.fill();
        var g = ctx.createLinearGradient(0, A.y, 0, A.y + A.h);
        g.addColorStop(0, "#fbfbfa");
        g.addColorStop(1, "#eceeef");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, A.x, A.y, A.b, A.h, 14);
        ctx.fill();
        var cx = A.x + A.b / 2;
        NK.tekst(ctx, titel, cx, A.y + 36, { font: "700 22px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#232830" });
        NK.tekst(ctx, tekst || "", cx, A.y + 64, { font: "600 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#56606b" });
        var L = S.visLuk(A);
        ctx.fillStyle = "#2a2f36";
        ctx.beginPath();
        ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2);
        ctx.fill();
        NK.tekst(ctx, "✕", L.x, L.y + 1, { font: "700 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
    }

    function tegnPille(ctx, P, tekst, slags, alfa, tid) {
        var cx = P.x + P.b / 2;
        if (slags === "ref") {
            ctx.fillStyle = "#2b7d51";
            NK.rundtRekt(ctx, P.x, P.y, P.b, P.h, P.h / 2);
            ctx.fill();
            NK.tekst(ctx, tekst, cx, P.y + P.h / 2 + 1, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
            return;
        }
        var valgt = slags === "svar";
        ctx.fillStyle = valgt ? "#2a76ac" : "#ffffff";
        NK.rundtRekt(ctx, P.x, P.y, P.b, P.h, P.h / 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = valgt ? "#1d5a86" : "#d19c12";
        ctx.save();
        if (!valgt) ctx.globalAlpha = alfa * (0.65 + 0.35 * Math.sin(tid * 4));
        ctx.stroke();
        ctx.restore();
        NK.tekst(ctx, tekst, cx, P.y + P.h / 2 + 1, { font: "700 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: valgt ? "#ffffff" : "#8a6106" });
    }

    /* ----- Billedet af glas 1 til 7 -------------------------------------------- */
    S.FOTO = { x: 150, y: 70, b: 820, h: 460, top: 152, skala: 1.2, dx: 113 };

    S.fotoX = function (i) {
        return S.FOTO.x + 71 + i * S.FOTO.dx;
    };

    S.fotoPille = function (i) {
        return { x: S.fotoX(i) - 52, y: 420, b: 104, h: 32 };
    };

    S.fotoHvad = function (pt) {
        for (var i = 0; i < 7; i++) {
            if (S.iRekt(S.fotoPille(i), pt, 3)) return "vurder" + (i + 1);
        }
        var L = S.visLuk(S.FOTO);
        if ((pt.x - L.x) * (pt.x - L.x) + (pt.y - L.y) * (pt.y - L.y) < (L.r + 4) * (L.r + 4)) return "visLuk";
        if (S.iRekt(S.FOTO, pt)) return "visArk";
        return "visUd";
    };

    /* d: { tekst, glas: [ { nr, tegning (som tegnGlas), etiket, T, ref, kanVurderes, svar } ] } */
    S.tegnFoto = function (ctx, d, alfa, tid) {
        if (alfa < 0.01 || !d) return;
        var A = S.FOTO;
        ctx.save();
        ctx.globalAlpha = alfa;
        tegnArk(ctx, A, "Billede af glas 1 til 7", d.tekst);
        for (var i = 0; i < d.glas.length; i++) {
            var gl = d.glas[i];
            var x = S.fotoX(i);
            ctx.save();
            ctx.translate(x, A.top);
            ctx.scale(A.skala, A.skala);
            var tg = gl.tegning;
            tg.p = { x: 0, y: 0, v: 0 };
            tg.nr = 0;
            tg.fremhaev = false;
            S.tegnGlas(ctx, tg, tid);
            ctx.restore();
            NK.tekst(ctx, "Glas " + gl.nr, x, 362, { font: "700 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#232830" });
            NK.tekst(ctx, gl.etiket || "", x, 383, { font: "600 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#56606b" });
            if (gl.T !== null && gl.T !== undefined) {
                NK.tekst(ctx, S.temperaturTekst(gl.T), x, 402, { font: "700 13px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#b4412f" });
            }
            var P = S.fotoPille(i);
            if (gl.ref) tegnPille(ctx, P, "reference", "ref", alfa, tid);
            else if (gl.kanVurderes) tegnPille(ctx, P, gl.svar || "Vurdér", gl.svar ? "svar" : "", alfa, tid);
        }
        NK.tekst(ctx, "Klik på knappen under et glas for at notere farveændringen i forhold til glas 7.", A.x + A.b / 2, A.y + A.h - 22, { font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#6a737d" });
        ctx.restore();
    };

    /* ----- Baegerglassene ovenfra i del 2 --------------------------------------- */
    S.OVENFRA = { x: 290, y: 80, b: 540, h: 440, cy: 250, r: 88 };

    S.ovenfraX = function (i) {
        return S.OVENFRA.x + S.OVENFRA.b / 2 + (i === 0 ? -130 : 130);
    };

    S.ovenfraPille = function (i) {
        return { x: S.ovenfraX(i) - 92, y: S.OVENFRA.cy + 148, b: 184, h: 34 };
    };

    S.ovenfraHvad = function (pt) {
        for (var i = 0; i < 2; i++) {
            if (S.iRekt(S.ovenfraPille(i), pt, 3)) return "ovenfra" + (i + 1);
        }
        var L = S.visLuk(S.OVENFRA);
        if ((pt.x - L.x) * (pt.x - L.x) + (pt.y - L.y) * (pt.y - L.y) < (L.r + 4) * (L.r + 4)) return "visLuk";
        if (S.iRekt(S.OVENFRA, pt)) return "visArk";
        return "visUd";
    };

    /* d: { tekst, glas: [ { navn, V, indhold, farve, bund, uklar, tom, kanVurderes, svar } ] } */
    S.tegnOvenfra = function (ctx, d, alfa, tid) {
        if (alfa < 0.01 || !d) return;
        var A = S.OVENFRA;
        ctx.save();
        ctx.globalAlpha = alfa;
        tegnArk(ctx, A, "Bægerglassene set ovenfra", d.tekst);
        for (var i = 0; i < 2; i++) {
            var gl = d.glas[i];
            var x = S.ovenfraX(i);
            S.tegnOppefra(ctx, x, A.cy, A.r, gl);
            NK.tekst(ctx, gl.navn + (gl.tom ? "" : ", " + Math.round(gl.V) + " mL"), x, A.cy + 112, { font: "700 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#232830" });
            NK.tekst(ctx, gl.indhold || "", x, A.cy + 133, { font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#56606b" });
            if (gl.kanVurderes) tegnPille(ctx, S.ovenfraPille(i), gl.svar || "Vurdér", gl.svar ? "svar" : "", alfa, tid);
        }
        NK.tekst(ctx, d.hjaelp || "", A.x + A.b / 2, A.y + A.h - 22, { font: "600 14px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#6a737d" });
        ctx.restore();
    };
}());

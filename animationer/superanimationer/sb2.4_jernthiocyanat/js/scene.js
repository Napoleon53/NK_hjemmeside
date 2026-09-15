/* =====================================================================
   scene.js - laboratoriebordet, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Fra venstre: sproejteflasken, baegerglasset,
   de tre draabeflasker, stativet med fem reagensglas foran et hvidt
   kort, det varme vandbad paa varmepladen, isbadet og affaldsdunken.
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

    S.BREDDE = 1000;
    S.HOEJDE = 600;
    S.BORD = 500;

    /* ----- Ankerpunkter i spritenes egne koordinater ----------------- */
    S.ANKER = {
        vand:        { x: 44, y: 9 },
        baeger:      { x: 36, y: 4 },
        fe:          { x: 23, y: 0 },
        scn:         { x: 23, y: 0 },
        ag:          { x: 23, y: 0 },
        reagensglas: { x: 15, y: 2 },
        dunk:        { x: 45, y: 12 },
        papir:       { x: 36, y: 22 },
        haand:       { x: 40, y: 46 }
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
    S.KORT = { x: 338, y: 262, b: 314, h: 236 };
    S.STATIV = { x: 350, y: 400, b: 290, huller: [395, 445, 495, 545, 595] };
    S.GLAS_Y = S.BORD - 12 - 154 + 2;
    S.VARMEPLADE = { x: 662, y: 457, skala: 0.6 };
    S.DUNK = { x: 902, y: S.BORD - 130, aabning: { x: 947, y: S.BORD - 118 } };
    S.BOBLE = { x: 262, y: 160, r: 104 };
    S.LUP_GLAS = { x: 15, y: 128 };
    S.LUP_BAEGER = { x: 36, y: 88 };
    S.STAV_L = 130;

    /* Vandbadet staar paa varmepladen, isbadet paa bordet. Et reagensglas i
       badet staar med bunden lige over badets bund. */
    S.BAD = {
        vandbad: { cx: 716, bund: 457, skala: 0.8 },
        isbad:   { cx: 836, bund: S.BORD, skala: 0.8 }
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
        vand:     staar("vand", 50),
        baeger:   staar("baeger", 128),
        fe:       staar("fe", 204),
        scn:      staar("scn", 256),
        ag:       staar("ag", 308),
        glasstav: { x: 62, y: S.BORD - 3, v: -Math.PI / 2 },
        kaffekop: staar("kaffekop", 60, S.HYLDE.y)
    };
    S.STATIV.huller.forEach(function (x, i) {
        S.HJEM["glas" + (i + 1)] = { x: x, y: S.GLAS_Y, v: 0 };
    });

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
        for (var y = 300; y < S.BORD; y += 40) { ctx.moveTo(-2000, y); ctx.lineTo(3000, y); }
        for (var x = -2000; x < 3000; x += 40) { ctx.moveTo(x, 300); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        var lys = ctx.createRadialGradient(500, 40, 20, 500, 40, 620);
        lys.addColorStop(0, "rgba(255, 244, 220, 0.09)");
        lys.addColorStop(1, "rgba(255, 244, 220, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Loft med lysstofroer */
        ctx.fillStyle = "#2c3139";
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, 2030);
        ctx.fillStyle = "rgba(255, 248, 225, 0.6)";
        NK.rundtRekt(ctx, 150, 36, 700, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, 500, 42, 170, "rgba(255, 248, 225, 0.1)");

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

        /* Temperaturerne under badene */
        [["vandbad", M.TEMP.vandbad + " °C", "#f0a58f"], ["isbad", M.TEMP.isbad + " °C", "#9fd0f2"]].forEach(function (t) {
            NK.tekst(ctx, t[1], S.BAD[t[0]].cx, S.BORD + 30, { font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: t[2] });
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

    /* Det hvide kort bag stativet, som farverne ses imod */
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
    S.tegnBad = function (ctx, navn, tid, fremhaev) {
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
            /* Smaa bobler, der stiger op fra bunden */
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
            /* Isterninger ved overfladen */
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
        if (navn === "isbad") S.skygge(ctx, B.cx, 44, 0.3);
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
    S.tegnMarkering = function (ctx, r, tid) {
        ctx.save();
        ctx.globalAlpha = 0.5 + 0.35 * Math.sin(tid * 4);
        ctx.strokeStyle = "#f2c53d";
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
       lag i toppen, som toner ud nedad. Returnerer overfladen. */
    S.tegnVaeske = function (ctx, verden, arealTot, arealSol, solFarve, lagFarve, opt) {
        opt = opt || {};
        if (arealTot <= 2 || !solFarve) return null;
        var top = NK.vaeskeNiveau(verden, arealTot);
        S.tegnLag(ctx, verden, top, null, solFarve, { boelge: opt.boelge, tid: opt.tid, uklar: opt.uklar, kant: 0.35 });
        if (lagFarve && arealTot - arealSol > 6) {
            var solNiv = arealSol > 2 ? NK.vaeskeNiveau(verden, arealSol) : top + 40;
            var slut = Math.max(solNiv + 10, top + 8);
            var x0 = Infinity, x1 = -Infinity;
            verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); });
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            var g = ctx.createLinearGradient(0, top, 0, slut);
            g.addColorStop(0, NK.css(lagFarve, 1));
            g.addColorStop(0.5, NK.css(lagFarve, 0.8));
            g.addColorStop(1, NK.css(lagFarve, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(x0 - 4, top);
            ctx.lineTo(x1 + 4, top);
            ctx.lineTo(x1 + 4, slut);
            ctx.lineTo(x0 - 4, slut);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        return top;
    };

    /* Bundfald i bunden af en beholder: tegnes i beholderens egne
       koordinater mellem x0 og x1 fra bunden y og op til hoejden h. */
    function tegnBundfald(ctx, p, anker, verden, x0, x1, y, h) {
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-anker.x, -anker.y);
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
        ctx.restore();
    }

    /* Reagensglasset.
       g: { p, V, Vsol, solFarve, lagFarve, bund (0-1), uklar, boelge,
            fremhaev, nr, valgt }
       Returnerer vaeskens overflade paa tegnebordet (eller null). */
    S.tegnGlas = function (ctx, g, tid) {
        var a = S.ANKER.reagensglas;
        var verden = S.indreVerden(S.GLAS_INDRE, g.p, a);
        var top = null;
        if (g.V > 0.02) {
            top = S.tegnVaeske(ctx, verden, g.V * S.GLAS_ML, g.Vsol * S.GLAS_ML, g.solFarve, g.lagFarve, { boelge: g.boelge, tid: tid, uklar: g.uklar });
            if (g.bund > 0.01) tegnBundfald(ctx, g.p, a, verden, 5, 25, 152, 14 * NK.klamp(g.bund, 0, 1.4));
        }

        /* Et tyndt moerkt omrids, saa glasset ogsaa ses mod det hvide kort */
        ctx.save();
        ctx.translate(g.p.x, g.p.y);
        ctx.rotate(g.p.v);
        ctx.translate(-a.x, -a.y);
        ctx.strokeStyle = "rgba(55, 70, 85, 0.45)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(3, 3);
        ctx.lineTo(3, 143);
        ctx.arc(15, 143, 12, Math.PI, 0, true);
        ctx.lineTo(27, 3);
        ctx.stroke();
        ctx.restore();
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
            top = S.tegnVaeske(ctx, verden, g.V * S.BAEGER_ML, g.Vsol * S.BAEGER_ML, g.solFarve, g.lagFarve, { boelge: g.boelge, tid: tid, uklar: g.uklar });
            if (g.bund > 0.01) tegnBundfald(ctx, g.p, a, verden, 7, 65, 104, 5 * NK.klamp(g.bund, 0, 2));
        }
        NK.Sprites.tegnPositur(ctx, "baeger", g.p, a);
        if (g.valgt) {
            var m = NK.tilVerden(g.p, a, 60, -8);
            NK.kugle(ctx, m.x, m.y, 5, "#ffe38a", "#b88a12");
        }
        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("baeger", g.p, a, 0), tid);
        return top;
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
       GLASSENE SET OVENFRA
       ================================================================ */
    /* Et reagensglas set ovenfra paa hvidt papir.
       g: { farve, bund (0-1), uklar, tom } */
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

    /* Visningen, hvor glassene sammenlignes ovenfra */
    S.SAML = { x: 110, y: 90, b: 780, h: 420, cy: 250, dx: 150, r: 46 };

    S.samlX = function (i) {
        return S.BREDDE / 2 + (i - 2) * S.SAML.dx;
    };

    S.samlPille = function (i) {
        return { x: S.samlX(i) - 68, y: S.SAML.cy + 108, b: 136, h: 34 };
    };

    S.samlLuk = function () {
        return { x: S.SAML.x + S.SAML.b - 28, y: S.SAML.y + 28, r: 17 };
    };

    S.sammenlignHvad = function (pt) {
        for (var i = 0; i < 5; i++) {
            if (S.iRekt(S.samlPille(i), pt, 3)) return "vurder" + (i + 1);
        }
        var L = S.samlLuk();
        if ((pt.x - L.x) * (pt.x - L.x) + (pt.y - L.y) * (pt.y - L.y) < (L.r + 4) * (L.r + 4)) return "samlLuk";
        if (S.iRekt(S.SAML, pt)) return "samlArk";
        return "samlUd";
    };

    /* d: { glas: [ { nr, farve, bund, uklar, tom, etiket, ref, kanVurderes, svar } ],
            tekst, markér (nr eller 0) } */
    S.tegnSammenlign = function (ctx, d, alfa, tid) {
        if (alfa < 0.01 || !d) return;
        var A = S.SAML, i;
        ctx.save();
        ctx.globalAlpha = alfa;
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

        NK.tekst(ctx, "Set ovenfra gennem glassene", S.BREDDE / 2, A.y + 40, { font: "700 22px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#232830" });
        NK.tekst(ctx, d.tekst || "", S.BREDDE / 2, A.y + 70, { font: "600 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#56606b" });

        for (i = 0; i < 5; i++) {
            var gl = d.glas[i];
            if (!gl) continue;
            var x = S.samlX(i), y = A.cy;
            S.tegnOppefra(ctx, x, y, A.r, gl);
            NK.tekst(ctx, "Glas " + gl.nr, x, y + 70, { font: "700 17px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#232830" });
            NK.tekst(ctx, gl.etiket || "", x, y + 92, { font: "600 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#56606b" });
            var P = S.samlPille(i);
            if (gl.ref) {
                ctx.fillStyle = "#2b7d51";
                NK.rundtRekt(ctx, P.x, P.y, P.b, P.h, P.h / 2);
                ctx.fill();
                NK.tekst(ctx, "reference", x, P.y + P.h / 2 + 1, { font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
            } else if (gl.kanVurderes) {
                var valgt = !!gl.svar;
                ctx.fillStyle = valgt ? "#2a76ac" : "#ffffff";
                NK.rundtRekt(ctx, P.x, P.y, P.b, P.h, P.h / 2);
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = valgt ? "#1d5a86" : "#d19c12";
                if (!valgt) {
                    ctx.save();
                    ctx.globalAlpha = alfa * (0.65 + 0.35 * Math.sin(tid * 4));
                    ctx.stroke();
                    ctx.restore();
                } else {
                    ctx.stroke();
                }
                NK.tekst(ctx, valgt ? gl.svar : "Vurdér", x, P.y + P.h / 2 + 1, { font: "700 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: valgt ? "#ffffff" : "#8a6106" });
            }
        }

        NK.tekst(ctx, "Klik på knappen under et glas for at notere, hvad du ser.", S.BREDDE / 2, A.y + A.h - 26, { font: "600 15px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#6a737d" });

        var L = S.samlLuk();
        ctx.fillStyle = "#2a2f36";
        ctx.beginPath();
        ctx.arc(L.x, L.y, L.r, 0, Math.PI * 2);
        ctx.fill();
        NK.tekst(ctx, "✕", L.x, L.y + 1, { font: "700 16px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#ffffff" });
        ctx.restore();
    };
}());

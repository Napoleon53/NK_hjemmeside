/* =====================================================================
   scene.js - stinkskabet og opstillingen, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Fra venstre: bromvand, hexan, AgNO3, pH-papir,
   stativet med de to reagensglas, propperne, alufolien, holderen under
   lampen, lampen og affaldsdunken. Genstandene er SVG-filer i sprites/.
   Hver genstand har et ankerpunkt og en positur { x, y, v }: hvor
   ankeret staar, og hvor meget den haelder.

   Filen indeholder kun maal og tegning. Tilstanden ligger i forsoeg.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Sprites.FILER;
    var S = {};
    NK.Scene = S;

    S.BREDDE = 1000;
    S.HOEJDE = 600;
    S.BORD = 500;

    /* ----- Ankerpunkter i spritenes egne koordinater ----------------- */
    S.ANKER = {
        bromflaske:  { x: 40, y: 4 },
        skruelaag:   { x: 17, y: 22 },
        hexan:       { x: 23, y: 4 },
        hexen:       { x: 23, y: 4 },
        reagensglas: { x: 15, y: 2 },
        prop:        { x: 13, y: 26 },
        agno3:       { x: 23, y: 0 },
        phpapir:     { x: 60, y: 20 },
        lampe:       { x: 165, y: 296 },
        folie:       { x: 38, y: 22 },
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

    S.STATIV = { x: 320, y: 400, huller: [365, 425] };
    S.GLAS_Y = S.BORD - 12 - 154 + 2;
    S.HOLDER = { x: 678, y: 480, b: 44, h: 20, midt: 700 };
    S.LAMPE = { hjem: staar("lampe", 740), lys: { x: 700, y: 300 }, kontakt: { x: 820, y: 482 } };
    S.DUNK = { x: 875, y: S.BORD - 130, aabning: { x: 920, y: S.BORD - 118 } };
    S.PANEL = { x: 770, y: 6 };
    S.KONTAKT = { x0: 770 + 150, x1: 770 + 206, y0: 6 + 8, y1: 6 + 70 };
    S.HYLDE = { x0: 16, x1: 116, y: 268 };
    S.UR = { x: 160, y: 186, r: 24 };
    S.LAAG_PAA_BORD = { x: 10, y: S.BORD, v: 0 };

    S.HJEM = {
        bromflaske: staar("bromflaske", 68),
        hexan:      staar("hexan", 138),
        hexen:      staar("hexen", 184),
        agno3:      staar("agno3", 230),
        phpapir:    staar("phpapir", 288),
        glas1:      { x: S.STATIV.huller[0], y: S.GLAS_Y, v: 0 },
        glas2:      { x: S.STATIV.huller[1], y: S.GLAS_Y, v: 0 },
        prop1:      staar("prop", 490),
        prop2:      staar("prop", 518),
        folie:      staar("folie", 590),
        kaffekop:   staar("kaffekop", 60, S.HYLDE.y)
    };
    S.UNDER_LAMPE = { x: S.HOLDER.midt, y: S.GLAS_Y, v: 0 };

    /* Zoomboblen og det punkt paa glasset, luppen sidder paa */
    S.BOBLE = { x: 530, y: 200, r: 98 };

    /* Den store visning af reaktionen: boblen fylder scenen, og lampens
       skaerm anes i toppen. */
    S.STOR = { x: 500, y: 314, r: 232 };
    S.LUP = { x: 15, y: 118 };

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
    S.VAND_AREAL = NK.polyAreal(NK.klipUnder(S.GLAS_INDRE, 100));
    S.HEX_AREAL = NK.polyAreal(NK.klipUnder(S.GLAS_INDRE, 62)) - S.VAND_AREAL;

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

    /* ================================================================
       STINKSKABET
       ================================================================ */
    S.tegnBaggrund = function (ctx, v) {
        var i;
        var g = ctx.createLinearGradient(0, 0, 0, S.BORD);
        g.addColorStop(0, "#1a1e25");
        g.addColorStop(1, "#2a2f38");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Fliser paa bagvaeggen */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 140; y < S.BORD; y += 46) { ctx.moveTo(-2000, y); ctx.lineTo(3000, y); }
        for (var x = -2000; x < 3000; x += 46) { ctx.moveTo(x, 140); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        /* Luftspalterne i bagpladen */
        ctx.fillStyle = "#0d0f13";
        for (i = 0; i < 9; i++) {
            NK.rundtRekt(ctx, 40 + i * 108, 112, 78, 7, 3.5);
            ctx.fill();
        }

        var lys = ctx.createRadialGradient(480, 100, 20, 480, 100, 560);
        lys.addColorStop(0, "rgba(255, 244, 220, 0.09)");
        lys.addColorStop(1, "rgba(255, 244, 220, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Loft med lysstofroer og skydeglassets underkant */
        ctx.fillStyle = "#2c3139";
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, 2084);
        ctx.fillStyle = "rgba(255, 248, 225, 0.6)";
        NK.rundtRekt(ctx, 40, 66, 690, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, 385, 72, 160, "rgba(255, 248, 225, 0.12)");
        var k = ctx.createLinearGradient(0, 84, 0, 96);
        k.addColorStop(0, "#9aa2ad");
        k.addColorStop(1, "#4a515b");
        ctx.fillStyle = k;
        ctx.fillRect(-2000, 84, S.BREDDE + 4000, 12);

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

    /* Vaeguret. urMinutter er minutter siden kl. 0. */
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

    /* Svage luftstriber mod spalterne, naar udsugningen koerer. */
    S.tegnLuft = function (ctx, styrke, tid) {
        if (styrke < 0.02) return;
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 34]);
        ctx.lineDashOffset = tid * 70;
        ctx.strokeStyle = "rgba(190, 215, 240, " + (0.09 * styrke).toFixed(3) + ")";
        for (var i = 0; i < 6; i++) {
            var x = 90 + i * 165;
            ctx.beginPath();
            ctx.moveTo(x, 470);
            ctx.bezierCurveTo(x + 30, 380, x - 30, 220, x + 8, 122);
            ctx.stroke();
        }
        ctx.restore();
    };

    S.tegnKontrolpanel = function (ctx, paa, vinge, fremhaev, tid) {
        var P = S.PANEL;
        var fx = P.x + 42, fy = P.y + 38;
        ctx.fillStyle = "#0f1115";
        ctx.beginPath();
        ctx.arc(fx, fy, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(fx, fy);
        ctx.rotate(vinge);
        ctx.fillStyle = "#7a838f";
        for (var i = 0; i < 5; i++) {
            ctx.rotate(Math.PI * 2 / 5);
            ctx.beginPath();
            ctx.ellipse(10, 0, 9, 3.6, 0.35, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        NK.Sprites.tegn(ctx, "kontrolpanel", P.x, P.y);

        var lx = P.x + 112, ly = P.y + 33;
        if (paa) NK.skaer(ctx, lx, ly, 18, "rgba(80, 230, 140, 0.8)", 0.7);
        NK.kugle(ctx, lx, ly, 5.2, paa ? "#b9ffd6" : "#7a3a3a", paa ? "#1fae5c" : "#3b1c1c");

        NK.tekst(ctx, paa ? "0,50 m/s" : "0,00 m/s", P.x + 112, P.y + 58.5, {
            font: "700 10.5px Consolas, 'Courier New', monospace", justering: "center", linje: "middle",
            farve: paa ? "#7df0a8" : "#3c6650"
        });

        /* Vippekontakten: den nedtrykkede halvdel er moerkest */
        var kx = P.x + 178, ky = P.y + 38;
        ctx.fillStyle = "#15171b";
        NK.rundtRekt(ctx, kx - 15, ky - 21, 30, 42, 5);
        ctx.fill();
        var top = ctx.createLinearGradient(0, ky - 20, 0, ky);
        top.addColorStop(0, paa ? "#2f8f5b" : "#5b636e");
        top.addColorStop(1, paa ? "#1f6a42" : "#3a4049");
        ctx.fillStyle = top;
        NK.rundtRekt(ctx, kx - 13, ky - 19, 26, 19, 3);
        ctx.fill();
        var bund = ctx.createLinearGradient(0, ky, 0, ky + 20);
        bund.addColorStop(0, paa ? "#3a4049" : "#8f2f28");
        bund.addColorStop(1, paa ? "#5b636e" : "#b8433a");
        ctx.fillStyle = bund;
        NK.rundtRekt(ctx, kx - 13, ky + 1, 26, 19, 3);
        ctx.fill();
        NK.tekst(ctx, "I", kx, ky - 9.5, { font: "800 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: paa ? "#e9fff1" : "#aeb5bf" });
        NK.tekst(ctx, "0", kx, ky + 10.5, { font: "800 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: paa ? "#aeb5bf" : "#ffe3e0" });

        if (fremhaev) S.tegnMarkering(ctx, { x: S.KONTAKT.x0, y: S.KONTAKT.y0, b: S.KONTAKT.x1 - S.KONTAKT.x0, h: S.KONTAKT.y1 - S.KONTAKT.y0 }, tid);
    };

    S.tegnStativ = function (ctx) {
        NK.Sprites.tegn(ctx, "stativ", S.STATIV.x, S.STATIV.y);
    };

    S.tegnDunk = function (ctx) {
        S.skygge(ctx, S.DUNK.x + 45, 40, 0.3);
        NK.Sprites.tegn(ctx, "dunk", S.DUNK.x, S.DUNK.y);
    };

    /* Den lille traeklods, glasset staar i under lampen */
    S.tegnHolder = function (ctx) {
        var H = S.HOLDER;
        S.skygge(ctx, H.midt, 26, 0.3);
        var g = ctx.createLinearGradient(0, H.y, 0, H.y + H.h);
        g.addColorStop(0, "#d9ac72");
        g.addColorStop(1, "#a8773f");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, H.x, H.y, H.b, H.h, 3);
        ctx.fill();
        ctx.fillStyle = "rgba(107, 69, 32, 0.7)";
        ctx.beginPath();
        ctx.ellipse(H.midt, H.y + 1.5, 11, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
    };

    /* Lampen. taendt: 0-1. Lyset falder som en kegle ned over holderen. */
    S.tegnLampe = function (ctx, taendt, tid, fremhaev) {
        var L = S.LAMPE, p = L.hjem;
        S.skygge(ctx, 795, 44, 0.3);
        if (taendt > 0.01) {
            var flimmer = 1 - 0.03 * Math.sin(tid * 37);
            ctx.save();
            ctx.globalAlpha = taendt * flimmer;
            var kegle = ctx.createLinearGradient(0, L.lys.y, 0, S.BORD + 4);
            kegle.addColorStop(0, "rgba(255, 236, 160, 0.42)");
            kegle.addColorStop(0.7, "rgba(255, 236, 160, 0.14)");
            kegle.addColorStop(1, "rgba(255, 236, 160, 0.06)");
            ctx.fillStyle = kegle;
            ctx.beginPath();
            ctx.moveTo(L.lys.x - 40, L.lys.y);
            ctx.lineTo(L.lys.x + 40, L.lys.y);
            ctx.lineTo(L.lys.x + 78, S.BORD + 4);
            ctx.lineTo(L.lys.x - 78, S.BORD + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(255, 236, 160, 0.16)";
            ctx.beginPath();
            ctx.ellipse(L.lys.x, S.BORD + 3, 80, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        NK.Sprites.tegnPositur(ctx, "lampe", p, S.ANKER.lampe);
        if (taendt > 0.01) {
            NK.skaer(ctx, L.lys.x, L.lys.y - 2, 34, "rgba(255, 240, 190, 0.9)", taendt);
            ctx.save();
            ctx.globalAlpha = taendt;
            ctx.fillStyle = "#fff6d6";
            ctx.beginPath();
            ctx.ellipse(L.lys.x, L.lys.y - 1, 30, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        /* Kontakten paa foden */
        var K = L.kontakt;
        NK.kugle(ctx, K.x, K.y, 4, taendt > 0.5 ? "#b9ffd6" : "#ffb3a8", taendt > 0.5 ? "#1fae5c" : "#a33529");
        if (fremhaev) S.tegnMarkering(ctx, { x: 630, y: 262, b: 220, h: 236 }, tid);
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
        g.addColorStop(0, NK.css(farve, 0.85));
        g.addColorStop(1, NK.css(farve, 1.15));
        ctx.fillStyle = g;
        ctx.fill();
        if (opt.uklar > 0.01) {
            ctx.fillStyle = NK.css(opt.uklarFarve, NK.klamp(opt.uklar, 0, 1) * 0.75);
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

    /* Reagensglasset med to faser.
       g: { p, vandAreal, hexAreal, vandFarve, hexFarve, bundfald, uklar,
            boelge, folie, fremhaev, nr, valgt, strimmel }
       Returnerer vandfasens overflade paa tegnebordet (eller null). */
    S.tegnReagensglas = function (ctx, g, tid) {
        var a = S.ANKER.reagensglas;
        var verden = S.indreVerden(S.GLAS_INDRE, g.p, a);
        var vandNiveau = null, topNiveau = null;
        var i;

        if (g.vandAreal > 2) vandNiveau = NK.vaeskeNiveau(verden, g.vandAreal);
        if (g.hexAreal > 2) topNiveau = NK.vaeskeNiveau(verden, g.vandAreal + g.hexAreal);
        g.niveauTop = topNiveau;

        if (topNiveau !== null) S.tegnLag(ctx, verden, topNiveau, vandNiveau === null ? null : vandNiveau + 1, g.hexFarve, { boelge: g.boelge, tid: tid });
        if (vandNiveau !== null) S.tegnLag(ctx, verden, vandNiveau, null, g.vandFarve, { boelge: g.hexAreal > 2 ? (g.boelge || 0) * 0.5 : g.boelge, tid: tid, uklar: g.uklar, uklarFarve: NK.Model.FARVE.bundfald, kant: g.hexAreal > 2 ? 0.45 : 0.3 });

        if (g.bundfald > 0.01 && g.vandAreal > 2) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.translate(g.p.x, g.p.y);
            ctx.rotate(g.p.v);
            ctx.translate(-a.x, -a.y);
            var hoejde = 22 * g.bundfald;
            ctx.beginPath();
            ctx.moveTo(4, 153);
            ctx.lineTo(4, 152 - hoejde);
            for (var x = 4; x <= 26; x += 3) ctx.lineTo(x, 152 - hoejde + Math.sin(x * 1.7) * 1.2);
            ctx.lineTo(26, 153);
            ctx.closePath();
            ctx.fillStyle = NK.css(NK.Model.FARVE.bundfald);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            ctx.fillRect(4, 152 - hoejde, 22, 1.5);
            ctx.restore();
        }

        /* pH-strimlen nede i glasset */
        if (g.strimmel) S.tegnStrimmel(ctx, g.strimmel);

        NK.Sprites.tegnPositur(ctx, "reagensglas", g.p, a);

        /* Alufolie om glasset */
        if (g.folie > 0.01) {
            ctx.save();
            ctx.globalAlpha = NK.klamp(g.folie, 0, 1);
            ctx.translate(g.p.x, g.p.y);
            ctx.rotate(g.p.v);
            ctx.translate(-a.x, -a.y);
            var fg = ctx.createLinearGradient(-2, 0, 32, 0);
            fg.addColorStop(0, "#7c848d");
            fg.addColorStop(0.3, "#e6eaee");
            fg.addColorStop(0.55, "#aab1b9");
            fg.addColorStop(0.8, "#f2f4f6");
            fg.addColorStop(1, "#6f7780");
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(-2, 14);
            for (i = 0; i <= 8; i++) ctx.lineTo(-2 + i * 4.25, 14 + (i % 2 ? 2.5 : 0));
            ctx.lineTo(32, 150);
            ctx.quadraticCurveTo(15, 162, -2, 150);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "rgba(60, 66, 74, 0.45)";
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            for (i = 0; i < 9; i++) {
                var fy = 26 + i * 14;
                ctx.moveTo(0, fy + (i % 2) * 3);
                ctx.lineTo(12, fy - 2);
                ctx.lineTo(22, fy + 3);
                ctx.lineTo(30, fy);
            }
            ctx.stroke();
            ctx.restore();
        }

        /* Nummeret over glasset. Det valgte glas har gult maerke. */
        if (g.nr) {
            var m = NK.tilVerden(g.p, a, -7, 12);
            ctx.save();
            ctx.fillStyle = g.valgt ? "#f2c53d" : "rgba(45, 50, 58, 0.9)";
            ctx.strokeStyle = g.valgt ? "#7a5a10" : "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(m.x, m.y, 7.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            NK.tekst(ctx, String(g.nr), m.x, m.y + 0.5, { font: "800 9.5px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: g.valgt ? "#2a1d04" : "#dfe5ec" });
            ctx.restore();
        }

        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("reagensglas", g.p, a, 0), tid);
        return vandNiveau;
    };

    /* pH-strimmel: { p: { x, y, v }, farve, dyp (0-1), alfa }. Ankeret er
       strimlens top; den er 8 bred og 44 lang. */
    S.STRIMMEL = { b: 8, l: 44 };
    S.tegnStrimmel = function (ctx, s) {
        var b = S.STRIMMEL.b, l = S.STRIMMEL.l;
        ctx.save();
        ctx.globalAlpha = NK.klamp(s.alfa === undefined ? 1 : s.alfa, 0, 1);
        ctx.translate(s.p.x, s.p.y);
        ctx.rotate(s.p.v || 0);
        ctx.fillStyle = NK.css(NK.Model.FARVE.papir);
        NK.rundtRekt(ctx, -b / 2, 0, b, l, 1.5);
        ctx.fill();
        if (s.farve && s.dyp > 0.01) {
            var h = l * NK.klamp(s.dyp, 0, 1);
            ctx.fillStyle = NK.css(s.farve);
            NK.rundtRekt(ctx, -b / 2, l - h, b, h, 1.5);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(90, 80, 40, 0.5)";
        ctx.lineWidth = 0.8;
        NK.rundtRekt(ctx, -b / 2, 0, b, l, 1.5);
        ctx.stroke();
        ctx.restore();
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
                /* En farveloes draabe: klar perle med kant og genskin */
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

    /* Roedbrune bromdampe */
    S.tegnDampe = function (ctx, dampe) {
        ctx.save();
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.22;
            ctx.fillStyle = "#c8611a";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* Bromdampe i lokalet, naar udsugningen er slukket: et roedbrunt sloer
       over hele scenen, taettest foroven. styrke: 0-1 */
    S.tegnTaage = function (ctx, styrke) {
        if (styrke < 0.01) return;
        ctx.save();
        var g = ctx.createLinearGradient(0, 0, 0, S.HOEJDE);
        g.addColorStop(0, "rgba(200, 97, 26, " + (0.32 * styrke).toFixed(3) + ")");
        g.addColorStop(1, "rgba(200, 97, 26, " + (0.08 * styrke).toFixed(3) + ")");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.HOEJDE + 4000);
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

    /* Lampens skaerm i toppen af den store visning. taendt: 0-1 */
    S.tegnStorLampe = function (ctx, cx, top, taendt, tid) {
        ctx.save();
        if (taendt > 0.01) {
            var flimmer = 1 - 0.03 * Math.sin(tid * 37);
            ctx.globalAlpha = taendt * flimmer;
            var g = ctx.createLinearGradient(0, top + 40, 0, top + 260);
            g.addColorStop(0, "rgba(255, 236, 160, 0.4)");
            g.addColorStop(1, "rgba(255, 236, 160, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(cx - 92, top + 42);
            ctx.lineTo(cx + 92, top + 42);
            ctx.lineTo(cx + 190, top + 260);
            ctx.lineTo(cx - 190, top + 260);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }
        var s = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
        s.addColorStop(0, "#1f2329");
        s.addColorStop(0.3, "#6b7480");
        s.addColorStop(0.55, "#4a525c");
        s.addColorStop(1, "#1a1d22");
        ctx.fillStyle = s;
        ctx.beginPath();
        ctx.moveTo(cx - 40, top - 30);
        ctx.lineTo(cx + 40, top - 30);
        ctx.lineTo(cx + 100, top + 40);
        ctx.lineTo(cx - 100, top + 40);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#0f1216";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#0f1216";
        ctx.beginPath();
        ctx.ellipse(cx, top + 40, 100, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        if (taendt > 0.01) {
            NK.skaer(ctx, cx, top + 40, 70, "rgba(255, 240, 190, 0.95)", taendt);
            ctx.globalAlpha = taendt;
            ctx.fillStyle = "#fff6d6";
            ctx.beginPath();
            ctx.ellipse(cx, top + 40, 72, 9, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* ================================================================
       ZOOMBOBLENS FORBINDELSE OG TALEBOBLE
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
}());

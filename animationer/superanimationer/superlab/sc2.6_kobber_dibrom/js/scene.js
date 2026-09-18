/* =====================================================================
   scene.js - stinkskabet og opstillingen, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Genstandene er SVG-filer i sprites/. Hver
   genstand har et ankerpunkt (typisk aabningen eller spidsen) og en
   positur { x, y, v }: hvor ankeret staar, og hvor meget den haelder.

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
        kolbe:       { x: 75, y: 4 },
        prop:        { x: 22, y: 36 },
        bromflaske:  { x: 40, y: 4 },
        skruelaag:   { x: 17, y: 22 },
        urglas:      { x: 60, y: 7 },
        kobber:      { x: 45, y: 33 },
        reagensglas: { x: 15, y: 2 },
        nh3:         { x: 23, y: 0 },
        agno3:       { x: 23, y: 0 },
        spray:       { x: 3, y: 18 },
        kost:        { x: 43, y: 54 },
        fejeblad:    { x: 4, y: 52 },
        papir:       { x: 36, y: 22 },
        haand:       { x: 40, y: 46 }
    };

    /* Kemichaels ankre (laereren og kaffekoppen) staar i ../../kemichael/kemichael.js */
    Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });

    /* Positur for en genstand, der staar paa bordet (eller paa
       underlaget y) med midten i x. */
    function paaBord(navn, x, y) {
        var f = F[navn], a = S.ANKER[navn];
        return { x: x - f.b / 2 + a.x, y: (y === undefined ? S.BORD : y) - f.h + a.y, v: 0 };
    }

    S.paaBord = paaBord;

    /* Hylden paa bagvaeggen, hvor laererens kaffe staar */
    S.HYLDE = { x0: 16, x1: 116, y: 268 };

    S.HJEM = {
        kaffekop:   paaBord("kaffekop", 60, S.HYLDE.y),
        urglas:     paaBord("urglas", 80),
        bromflaske: paaBord("bromflaske", 190),
        kolbe:      paaBord("kolbe", 345),
        prop:       paaBord("prop", 455),
        nh3:        paaBord("nh3", 705),
        agno3:      paaBord("agno3", 765),
        spray:      paaBord("spray", 505),
        kost:       paaBord("kost", 600),
        fejeblad:   paaBord("fejeblad", 520),
        papir:      { x: 540, y: S.BORD - 14, v: 0 },
        glas1:      { x: 550, y: S.BORD - 12 - 154 + 2, v: 0 },
        glas2:      { x: 610, y: S.BORD - 12 - 154 + 2, v: 0 }
    };
    S.LAAG_PAA_BORD = { x: 240, y: S.BORD, v: 0 };

    S.STATIV = { x: 505, y: 400 };
    S.VASK = { x: 800, y: S.BORD + 3 - 150, midt: { x: 855, y: S.BORD + 3 }, tud: { x: 824, y: S.BORD + 3 - 150 + 64 } };
    S.DUNK = { x: 900, y: S.BORD - 130, aabning: { x: 945, y: S.BORD - 118 } };
    S.PANEL = { x: 770, y: 6 };
    S.KONTAKT = { x0: 770 + 150, x1: 770 + 206, y0: 6 + 8, y1: 6 + 70 };

    /* Zoomboblerne og de punkter paa glassene, lupperne sidder paa. */
    S.BOBLE = {
        kolbe: { x: 565, y: 196, r: 112 },
        glas1: { x: 452, y: 190, r: 98 },
        glas2: { x: 718, y: 190, r: 98 }
    };
    S.LUP = { kolbe: { x: 106, y: 158 }, glas: { x: 15, y: 118 } };

    /* ----- Indersider (lokale koordinater) ------------------------------ */
    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    S.KOLBE_INDRE = pts([[59, 5], [91, 5], [91, 65], [137, 177], [137.5, 186], [130, 193], [20, 193], [12.5, 186], [13, 177], [59, 65]]);
    S.KOLBE_FULD = NK.polyAreal(NK.klipUnder(S.KOLBE_INDRE, 136));

    S.GLAS_INDRE = (function () {
        var l = [[6, 4], [24, 4], [24, 143]];
        for (var i = 1; i < 12; i++) {
            var v = Math.PI * i / 12;
            l.push([15 + 9 * Math.cos(v), 143 + 9 * Math.sin(v)]);
        }
        l.push([6, 143]);
        return pts(l);
    }());
    S.GLAS_FULD = NK.polyAreal(NK.klipUnder(S.GLAS_INDRE, 80));

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
    S.tegnBaggrund = function (ctx) {
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
        for (var i = 0; i < 9; i++) {
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

    S.tegnVask = function (ctx) {
        NK.Sprites.tegn(ctx, "vask", S.VASK.x, S.VASK.y);
    };

    S.tegnDunk = function (ctx) {
        S.skygge(ctx, S.DUNK.x + 45, 40, 0.3);
        NK.Sprites.tegn(ctx, "dunk", S.DUNK.x, S.DUNK.y);
    };

    S.tegnStativ = function (ctx) {
        NK.Sprites.tegn(ctx, "stativ", S.STATIV.x, S.STATIV.y);
    };

    S.skygge = function (ctx, x, rx, alfa) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, " + (alfa === undefined ? 0.35 : alfa) + ")";
        ctx.beginPath();
        ctx.ellipse(x, S.BORD + 3, rx, 4.5, 0, 0, Math.PI * 2);
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
    /* Tegner vaesken i en beholder med vandret overflade.
       Returnerer overfladens hoejde (eller null, hvis beholderen er tom). */
    S.tegnVaeske = function (ctx, verden, areal, farve, opt) {
        opt = opt || {};
        if (areal <= 2 || !farve) return null;
        var niveau = NK.vaeskeNiveau(verden, areal);
        var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        var boelge = opt.boelge || 0, tid = opt.tid || 0;

        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(x0 - 4, niveau);
        for (var x = x0 - 4; x <= x1 + 6; x += 5) {
            ctx.lineTo(x, niveau + Math.sin(x * 0.09 + tid * 10) * boelge + Math.sin(x * 0.041 - tid * 6.5) * boelge * 0.6);
        }
        ctx.lineTo(x1 + 6, y1 + 6);
        ctx.lineTo(x0 - 4, y1 + 6);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, niveau, 0, y1);
        g.addColorStop(0, NK.css(farve, 0.85));
        g.addColorStop(1, NK.css(farve, 1.1));
        ctx.fillStyle = g;
        ctx.fill();
        if (opt.uklar > 0.01) {
            ctx.fillStyle = NK.css(opt.uklarFarve, NK.klamp(opt.uklar, 0, 1) * 0.75);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, niveau);
        ctx.lineTo(x1, niveau);
        ctx.stroke();
        ctx.restore();
        return niveau;
    };

    /* k: { p, areal, farve, kobber (0-1), prop, boelge, fremhaev, dampe } */
    S.tegnKolbe = function (ctx, k, tid) {
        var a = S.ANKER.kolbe;
        var verden = S.indreVerden(S.KOLBE_INDRE, k.p, a);

        if (k.kobber > 0.01) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.translate(k.p.x, k.p.y);
            ctx.rotate(k.p.v);
            ctx.translate(-a.x, -a.y);
            var s = 0.55 + 0.45 * k.kobber;
            NK.Sprites.tegn(ctx, "kobber", 75 - 45 * s * 1.25, 195 - 34 * s, 90 * s * 1.25, 34 * s);
            ctx.restore();
        }

        var niveau = S.tegnVaeske(ctx, verden, k.areal, k.farve, { boelge: k.boelge, tid: tid });

        /* Rødbrune dampe over bromvandet */
        if (niveau !== null && k.dampe > 0.02) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            var g = ctx.createLinearGradient(0, niveau - 90, 0, niveau);
            g.addColorStop(0, "rgba(200, 90, 20, 0)");
            g.addColorStop(1, "rgba(200, 90, 20, " + (0.28 * k.dampe).toFixed(3) + ")");
            ctx.fillStyle = g;
            ctx.fillRect(k.p.x - 120, niveau - 90, 240, 90);
            ctx.restore();
        }

        NK.Sprites.tegnPositur(ctx, "kolbe", k.p, a);

        if (k.prop) {
            var pp = NK.tilVerden(k.p, a, 75, 24);
            NK.Sprites.tegnPositur(ctx, "prop", { x: pp.x, y: pp.y, v: k.p.v }, S.ANKER.prop);
        }
        if (k.fremhaev) S.tegnMarkering(ctx, S.rekt("kolbe", k.p, a, 0), tid);
        return niveau;
    };

    /* g: { p, areal, farve, bundfald (0-1), uklar (0-1) } */
    S.tegnReagensglas = function (ctx, g, tid) {
        var a = S.ANKER.reagensglas;
        var verden = S.indreVerden(S.GLAS_INDRE, g.p, a);
        var niveau = S.tegnVaeske(ctx, verden, g.areal, g.farve, {
            tid: tid, boelge: g.boelge || 0, uklar: g.uklar, uklarFarve: NK.Model.FARVE.bundfald
        });

        if (g.bundfald > 0.01 && g.areal > 2) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.translate(g.p.x, g.p.y);
            ctx.rotate(g.p.v);
            ctx.translate(-a.x, -a.y);
            var hoejde = 30 * g.bundfald;
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

        NK.Sprites.tegnPositur(ctx, "reagensglas", g.p, a);
        if (g.fremhaev) S.tegnMarkering(ctx, S.rekt("reagensglas", g.p, a, 0), tid);
        return niveau;
    };

    /* En straale vaeske fra en aabning ned til en overflade. */
    S.tegnStraale = function (ctx, fra, til, farve, bredde, tid) {
        if (!farve) return;
        ctx.save();
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(fra.x, fra.y);
        ctx.quadraticCurveTo(fra.x + (til.x - fra.x) * 0.85, fra.y + 2, til.x, til.y);
        ctx.strokeStyle = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: Math.max(0.75, farve.a) });
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tid * 90;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = Math.max(1, bredde * 0.35);
        ctx.stroke();
        ctx.restore();
    };

    /* ================================================================
       ZOOMBOBLENS FORBINDELSE TIL GLASSET
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
        NK.Sprites.tegn(ctx, "lup", punkt.x - 15, punkt.y - 15, 40, 40);
        ctx.restore();
    };

    /* ================================================================
       UHELDET: PYT, SKAAR, DAMPE
       ================================================================ */
    S.tegnPyt = function (ctx, pyt) {
        if (!pyt || pyt.vaad < 0.01) return;
        var farve = NK.blandFarve(pyt.farve, NK.Model.FARVE.thiosulfat, pyt.neutral);
        ctx.save();
        ctx.globalAlpha = NK.klamp(pyt.vaad, 0, 1);
        ctx.fillStyle = NK.css(farve, 1);
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

    S.tegnSkaar = function (ctx, liste) {
        ctx.save();
        ctx.lineJoin = "round";
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            ctx.save();
            ctx.globalAlpha = NK.klamp(s.alfa, 0, 1);
            ctx.translate(s.x, s.y);
            ctx.rotate(s.a);
            if (s.kobber) {
                ctx.strokeStyle = "#d98a4a";
                ctx.lineWidth = 1.8;
                ctx.beginPath();
                ctx.arc(0, 0, s.r, 0.3, 4.6);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(s.pts[0].x, s.pts[0].y);
                for (var j = 1; j < s.pts.length; j++) ctx.lineTo(s.pts[j].x, s.pts[j].y);
                ctx.closePath();
                ctx.fillStyle = "rgba(207, 230, 247, 0.22)";
                ctx.fill();
                ctx.strokeStyle = "rgba(226, 242, 252, 0.8)";
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }
            ctx.restore();
        }
        ctx.restore();
    };

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

    S.tegnDraaber = function (ctx, draaber) {
        ctx.save();
        for (var i = 0; i < draaber.length; i++) {
            var d = draaber[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1);
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
}());

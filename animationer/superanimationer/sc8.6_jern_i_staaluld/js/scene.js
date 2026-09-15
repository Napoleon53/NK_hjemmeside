/* =====================================================================
   scene.js - laboratoriet, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Til venstre staar det aabne bord med stålulden
   og vaegten. I midten er stinkskabet med de to syrer, kolben og
   varmepladen. Til hoejre staar titreropstillingen: stativ, buret,
   affaldsbaeger og flasken med kaliumpermanganat.

   Genstandene er SVG-filer i sprites/. Buretten, stativet, vaesker,
   ståluld, bobler og draaber tegnes her i koden.

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
        staaluld:     { x: 45, y: 50 },
        vejebaad:     { x: 32, y: 14 },
        kolbe:        { x: 48, y: 2.5 },
        baegerglas:   { x: 68, y: 3 },
        svovlsyre:    { x: 23, y: 4 },
        saltsyre:     { x: 23, y: 4 },
        kmno4:        { x: 23, y: 4 },
        haand:        { x: 40, y: 46 },
        papir:        { x: 36, y: 22 }
    };

    /* Kemichaels ankre (laereren og kaffekoppen) staar i ../kemichael/kemichael.js */
    Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });

    /* Positur for en genstand, der staar paa underlaget y med midten i x. */
    function staar(navn, x, y) {
        var f = F[navn], a = S.ANKER[navn];
        return { x: x - f.b / 2 + a.x, y: (y === undefined ? S.BORD : y) - f.h + a.y, v: 0 };
    }
    S.staar = staar;

    S.SKAB = { x0: 430, x1: 448, x2: 752, x3: 770, loft: 60, glas: 112 };
    S.VAEGT = { x: 150, y: 438, midt: 220 };
    S.VAEGT.vejeskaal = { x: 220, y: 438 };
    S.VAEGT.display = { x: 150 + 22, y: 438 + 30, b: 70, h: 20 };
    S.PLADE = { x: 658, y: S.BORD - 34, midt: 703 };
    S.HYLDE = { x0: 26, x1: 156, y: 300 };
    S.PLAKAT = { x: 24, y: 96, b: 138, h: 140 };
    S.UR = { x: 214, y: 122, r: 24 };

    /* Buretten: aflaesning V i mL, 0 foroven og 50 forneden */
    S.BURET = { x: 888, top: 112, nul: 126, prMl: 3.8, kegle: 324, hane: 334, haneBund: 352, spids: 364, halv: 7 };
    S.BURET.bund = S.BURET.nul + 50 * S.BURET.prMl;
    S.STATIV = { stang: 824, top: 70, x0: 796, x1: 944, y: 492 };
    S.FLISE = { x0: 842, x1: 934, y: 486 };

    S.HJEM = {
        staaluld:  staar("staaluld", 72),
        vejebaad:  { x: S.VAEGT.vejeskaal.x, y: S.VAEGT.vejeskaal.y, v: 0 },
        parkeret:  { x: 118, y: S.BORD, v: 0 },
        kolbe:     staar("kolbe", 604),
        svovlsyre: staar("svovlsyre", 478),
        saltsyre:  staar("saltsyre", 528),
        kmno4:     staar("kmno4", 971),
        affald:    staar("baegerglas", S.BURET.x, S.FLISE.y),
        kaffekop:  staar("kaffekop", 122, S.HYLDE.y)
    };
    S.AFFALD_PARKERET = staar("baegerglas", 806);
    S.PAA_PLADE = staar("kolbe", S.PLADE.midt, S.PLADE.y);
    S.UNDER_BURET = staar("kolbe", S.BURET.x, S.FLISE.y);

    /* Zoomboblen: over det aabne bord, i stinkskabet eller ved buretten */
    S.BOBLE = {
        ude:   { x: 300, y: 214, r: 124 },
        skab:  { x: 575, y: 226, r: 124 },
        buret: { x: 680, y: 222, r: 124 }
    };

    /* ----- Indersider (lokale koordinater) ------------------------------ */
    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    S.KOLBE_INDRE = pts([[37.8, 4], [37.8, 41.6], [8.3, 113.3], [8.6, 119.5], [14.1, 123.5], [81.9, 123.5], [87.4, 119.5], [87.7, 113.3], [58.2, 41.6], [58.2, 4]]);
    S.BAEGER_INDRE = pts([[8, 4], [64, 4], [64, 82], [61, 86], [11, 86], [8, 82]]);
    S.AFFALD_AREAL = 70;

    S.indreVerden = function (liste, p, anker) {
        return liste.map(function (q) { return NK.tilVerden(p, anker, q.x, q.y); });
    };

    S.skala = function (b, h) {
        var s = Math.min(b / S.BREDDE, h / S.HOEJDE);
        return { s: s, dx: (b - S.BREDDE * s) / 2, dy: (h - S.HOEJDE * s) / 2 };
    };

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

    S.buretY = function (V) {
        return S.BURET.nul + V * S.BURET.prMl;
    };

    /* ================================================================
       LOKALET
       ================================================================ */
    S.tegnBaggrund = function (ctx, v) {
        var i;
        var K = S.SKAB;
        var g = ctx.createLinearGradient(0, 0, 0, S.BORD);
        g.addColorStop(0, "#232a33");
        g.addColorStop(1, "#303843");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Fliser bag bordene */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 330; y < S.BORD; y += 34) {
            ctx.moveTo(-2000, y); ctx.lineTo(K.x0, y);
            ctx.moveTo(K.x3, y); ctx.lineTo(3000, y);
        }
        for (var x = -2000; x < K.x0; x += 34) { ctx.moveTo(x, 330); ctx.lineTo(x, S.BORD); }
        for (x = K.x3 + 12; x < 3000; x += 34) { ctx.moveTo(x, 330); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        /* Loft med lysstofroer */
        ctx.fillStyle = "#2b3139";
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, 2000 + 44);
        ctx.fillStyle = "rgba(255, 248, 225, 0.55)";
        NK.rundtRekt(ctx, 40, 38, 340, 5, 2.5);
        ctx.fill();
        NK.rundtRekt(ctx, 800, 38, 180, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, 210, 46, 170, "rgba(255, 248, 225, 0.1)");
        NK.skaer(ctx, 890, 46, 120, "rgba(255, 248, 225, 0.1)");

        /* Plakat med sikkerhedsregler */
        var P = S.PLAKAT;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(P.x + 3, P.y + 4, P.b, P.h);
        ctx.fillStyle = "#f4f0e2";
        ctx.fillRect(P.x, P.y, P.b, P.h);
        ctx.fillStyle = "#1f7a47";
        ctx.fillRect(P.x, P.y, P.b, 24);
        NK.tekst(ctx, "SIKKERHED", P.x + P.b / 2, P.y + 16.5, { font: "800 12px 'Segoe UI', sans-serif", justering: "center", farve: "#ffffff" });
        var regler = ["Brug briller og kittel", "Der spises og drikkes", "ikke i laboratoriet", "Spild tørres op", "med det samme"];
        var ry = [P.y + 44, P.y + 68, P.y + 82, P.y + 106, P.y + 120];
        var nr = ["1", "2", "", "3", ""];
        for (i = 0; i < regler.length; i++) {
            var fremhaev = (v.plakatRegel === 2 && (i === 1 || i === 2)) || (v.plakatRegel === 3 && (i === 3 || i === 4));
            if (fremhaev) {
                ctx.fillStyle = "rgba(242, 197, 61, " + (0.35 + 0.25 * Math.sin(v.tid * 8)).toFixed(3) + ")";
                ctx.fillRect(P.x + 4, ry[i] - 11, P.b - 8, 15);
            }
            if (nr[i]) NK.tekst(ctx, nr[i], P.x + 10, ry[i], { font: "800 10px 'Segoe UI', sans-serif", farve: "#1f7a47" });
            NK.tekst(ctx, regler[i], P.x + 22, ry[i], { font: "600 10px 'Segoe UI', sans-serif", farve: "#2a2f36" });
        }
        ctx.fillStyle = "#b8b2a0";
        ctx.beginPath();
        ctx.arc(P.x + P.b / 2, P.y + 3, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        /* Vaegur. urMinutter faar tiden til at loebe hurtigt, mens
           stålulden opløses. */
        var U = S.UR;
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
        var min = v.urMinutter;
        var tim = 10 + min / 60;
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

        /* Hylde med en brun flaske til pynt */
        var H = S.HYLDE;
        ctx.fillStyle = "#6b4a2c";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 7);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 1.5);
        ctx.fillStyle = "#4a3320";
        ctx.fillRect(H.x0 + 12, H.y + 7, 5, 14);
        ctx.fillRect(H.x1 - 17, H.y + 7, 5, 14);
        ctx.fillStyle = "#5a2c0e";
        NK.rundtRekt(ctx, 44, H.y - 44, 26, 44, 5);
        ctx.fill();
        ctx.fillRect(52, H.y - 56, 10, 14);
        ctx.fillStyle = "#f4efe4";
        ctx.fillRect(47, H.y - 32, 20, 14);

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

    /* Stinkskabet: bagvaeg, loftpanel og de to stolper. */
    S.tegnStinkskab = function (ctx, tid) {
        var K = S.SKAB;
        var b = K.x2 - K.x1;
        var g = ctx.createLinearGradient(0, K.glas, 0, S.BORD);
        g.addColorStop(0, "#1b2027");
        g.addColorStop(1, "#262c35");
        ctx.fillStyle = g;
        ctx.fillRect(K.x1, K.loft, b, S.BORD - K.loft);

        ctx.save();
        ctx.beginPath();
        ctx.rect(K.x1, K.loft, b, S.BORD - K.loft);
        ctx.clip();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 170; y < S.BORD; y += 46) { ctx.moveTo(K.x1, y); ctx.lineTo(K.x2, y); }
        for (var x = K.x1 + 30; x < K.x2; x += 46) { ctx.moveTo(x, 170); ctx.lineTo(x, S.BORD); }
        ctx.stroke();

        ctx.fillStyle = "#0d0f13";
        for (var i = 0; i < 3; i++) {
            NK.rundtRekt(ctx, K.x1 + 26 + i * 94, 140, 66, 6, 3);
            ctx.fill();
        }
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 34]);
        ctx.lineDashOffset = tid * 70;
        ctx.strokeStyle = "rgba(190, 215, 240, 0.06)";
        for (i = 0; i < 3; i++) {
            var lx = K.x1 + 50 + i * 100;
            ctx.beginPath();
            ctx.moveTo(lx, 470);
            ctx.bezierCurveTo(lx + 30, 380, lx - 30, 240, lx + 8, 148);
            ctx.stroke();
        }
        ctx.restore();

        /* Loftpanel med skydeglassets underkant */
        ctx.fillStyle = "#39414c";
        ctx.fillRect(K.x0, K.loft, K.x3 - K.x0, K.glas - K.loft);
        ctx.fillStyle = "rgba(170, 205, 230, 0.12)";
        ctx.fillRect(K.x1, K.loft + 4, b, K.glas - K.loft - 16);
        var kant = ctx.createLinearGradient(0, K.glas - 12, 0, K.glas);
        kant.addColorStop(0, "#9aa2ad");
        kant.addColorStop(1, "#4a515b");
        ctx.fillStyle = kant;
        ctx.fillRect(K.x0, K.glas - 12, K.x3 - K.x0, 12);
        NK.tekst(ctx, "STINKSKAB", K.x1 + 22, K.loft + 26, { font: "800 11px 'Segoe UI', sans-serif", farve: "rgba(230, 236, 242, 0.55)" });
        NK.skaer(ctx, K.x1 + 132, K.loft + 22, 14, "rgba(80, 230, 140, 0.8)", 0.6);
        NK.kugle(ctx, K.x1 + 132, K.loft + 22, 4.2, "#b9ffd6", "#1fae5c");
        NK.tekst(ctx, "Udsugning", K.x1 + 142, K.loft + 26, { font: "600 10px 'Segoe UI', sans-serif", farve: "rgba(200, 240, 215, 0.7)" });

        [[K.x0, K.x1], [K.x2, K.x3]].forEach(function (st) {
            var sg = ctx.createLinearGradient(st[0], 0, st[1], 0);
            sg.addColorStop(0, "#4a525d");
            sg.addColorStop(0.5, "#8c95a0");
            sg.addColorStop(1, "#3c434d");
            ctx.fillStyle = sg;
            ctx.fillRect(st[0], K.loft, st[1] - st[0], S.BORD - K.loft);
        });
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
       UDSTYR MED DISPLAY
       ================================================================ */
    S.tegnVaegt = function (ctx, tekst, stabil) {
        var V = S.VAEGT, D = V.display;
        NK.Sprites.tegn(ctx, "vaegt", V.x, V.y);
        NK.tekst(ctx, tekst, D.x + D.b - 6, D.y + D.h / 2 + 1, {
            font: "700 13px Consolas, 'Courier New', monospace", justering: "right", linje: "middle",
            farve: "#7df0a8"
        });
        if (stabil) NK.tekst(ctx, "○", D.x + 5, D.y + 6, { font: "600 6px 'Segoe UI', sans-serif", linje: "middle", farve: "#4fbf7f" });
    };

    S.tegnVarmeplade = function (ctx, temp, taendt) {
        var P = S.PLADE;
        if (taendt) {
            ctx.save();
            ctx.globalAlpha = NK.klamp((temp - 25) / 65, 0, 1);
            var g = ctx.createLinearGradient(0, P.y - 6, 0, P.y + 4);
            g.addColorStop(0, "rgba(255, 90, 40, 0)");
            g.addColorStop(1, "rgba(255, 90, 40, 0.5)");
            ctx.fillStyle = g;
            ctx.fillRect(P.x + 4, P.y - 6, 82, 10);
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "varmeplade", P.x, P.y);
        NK.tekst(ctx, Math.round(temp) + " °C", P.x + 38, P.y + 21, {
            font: "700 9px Consolas, 'Courier New', monospace", justering: "right", linje: "middle",
            farve: taendt ? "#ffb070" : "#6b5a4a"
        });
        if (taendt) NK.skaer(ctx, P.x + 52, P.y + 20, 9, "rgba(255, 120, 40, 0.9)", 0.7);
        NK.kugle(ctx, P.x + 52, P.y + 20, 2.6, taendt ? "#ffd2a8" : "#6b4030", taendt ? "#e0601a" : "#3a2018");
        ctx.save();
        ctx.translate(P.x + 70, P.y + 20);
        ctx.rotate(taendt ? 1.6 : -0.6);
        ctx.strokeStyle = "#dfe5ec";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -5);
        ctx.stroke();
        ctx.restore();
    };

    /* ================================================================
       VAESKER, DRAABER OG DAMPE
       ================================================================ */
    S.tegnVaeske = function (ctx, verden, areal, farve, opt) {
        opt = opt || {};
        if (areal <= 1 || !farve) return null;
        var niveau = NK.vaeskeNiveau(verden, areal);
        var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        var boelge = opt.boelge || 0, tid = opt.tid || 0;

        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        ctx.moveTo(x0 - 4, niveau);
        for (var x = x0 - 4; x <= x1 + 6; x += 4) {
            ctx.lineTo(x, niveau + Math.sin(x * 0.12 + tid * 10) * boelge + Math.sin(x * 0.05 - tid * 6.5) * boelge * 0.6);
        }
        ctx.lineTo(x1 + 6, y1 + 6);
        ctx.lineTo(x0 - 4, y1 + 6);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, niveau, 0, y1);
        g.addColorStop(0, NK.css(farve, 0.85));
        g.addColorStop(1, NK.css(farve, 1.15));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, niveau);
        ctx.lineTo(x1, niveau);
        ctx.stroke();
        ctx.restore();
        return niveau;
    };

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
        ctx.lineWidth = Math.max(1, bredde * 0.4);
        ctx.stroke();
        ctx.restore();
    };

    /* Draaber KMnO₄ fra burettens spids */
    S.tegnDraaber = function (ctx, draaber) {
        ctx.save();
        for (var i = 0; i < draaber.length; i++) {
            var d = draaber[i];
            var r = d.r || 2.2;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y - r * 1.8);
            ctx.quadraticCurveTo(d.x + r, d.y - r * 0.4, d.x + r, d.y);
            ctx.arc(d.x, d.y, r, 0, Math.PI);
            ctx.quadraticCurveTo(d.x - r, d.y - r * 0.4, d.x, d.y - r * 1.8);
            ctx.closePath();
            ctx.fillStyle = "rgba(120, 26, 138, 0.95)";
            ctx.fill();
            ctx.fillStyle = "rgba(255, 220, 255, 0.5)";
            ctx.beginPath();
            ctx.arc(d.x - r * 0.35, d.y - r * 0.2, r * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    S.tegnDampe = function (ctx, dampe) {
        ctx.save();
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * (d.alfa || 0.2);
            ctx.fillStyle = d.farve || "#e8eef3";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* En tot ståluld: en graa, filtret klump */
    function tot(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a || 0);
        ctx.fillStyle = "#737c86";
        ctx.beginPath();
        ctx.ellipse(0, 0, r, r * 0.62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = Math.max(0.5, r * 0.12);
        ctx.strokeStyle = "rgba(205, 212, 220, 0.9)";
        ctx.beginPath();
        ctx.moveTo(-r * 0.9, 0);
        ctx.quadraticCurveTo(-r * 0.3, -r * 0.8, r * 0.2, -r * 0.1);
        ctx.quadraticCurveTo(r * 0.6, r * 0.5, r * 0.95, -r * 0.2);
        ctx.moveTo(-r * 0.6, r * 0.4);
        ctx.quadraticCurveTo(0, -r * 0.2, r * 0.5, r * 0.45);
        ctx.stroke();
        ctx.strokeStyle = "rgba(70, 76, 84, 0.9)";
        ctx.beginPath();
        ctx.moveTo(-r * 0.7, -r * 0.3);
        ctx.quadraticCurveTo(0, r * 0.5, r * 0.7, -r * 0.4);
        ctx.stroke();
        ctx.restore();
    }
    S.tot = tot;

    /* Ståluld i vejebaaden. stykker: [{ dx, dy, a, s }] */
    S.tegnVejebaad = function (ctx, p, stykker) {
        NK.Sprites.tegnPositur(ctx, "vejebaad", p, S.ANKER.vejebaad);
        for (var i = 0; i < stykker.length; i++) {
            var c = stykker[i];
            var w = NK.tilVerden(p, S.ANKER.vejebaad, 32 + c.dx, 3 + c.dy);
            tot(ctx, w.x, w.y, 6 * c.s, p.v + c.a);
        }
    };

    /* ================================================================
       KOLBEN
       k: { p, ml, farve, lokal, lokalX, jern (0-1), bobler, boelge,
            hvirvel, fremhaev }
       ================================================================ */
    S.tegnKolbe = function (ctx, k, tid) {
        var a = S.ANKER.kolbe;
        var verden = S.indreVerden(S.KOLBE_INDRE, k.p, a);
        var i;
        var niveau = S.tegnVaeske(ctx, verden, k.ml * NK.Model.KOLBE_AREAL, k.farve, { boelge: k.boelge, tid: tid });

        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();

        /* Den lokale, lilla sky, hvor draaberne lander */
        if (niveau !== null && k.lokal > 0.02) {
            var styrke = NK.klamp(k.lokal, 0, 6);
            var cx = k.lokalX + Math.sin(tid * 5) * 14 * (k.hvirvel || 0);
            var cy = niveau + 8 + 6 * (k.hvirvel || 0);
            var rad = 7 + 5 * Math.sqrt(styrke) + 20 * (k.hvirvel || 0);
            var g = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
            g.addColorStop(0, "rgba(140, 30, 150, " + NK.klamp(0.25 + 0.14 * styrke, 0, 0.9).toFixed(3) + ")");
            g.addColorStop(0.6, "rgba(170, 60, 175, " + NK.klamp(0.1 + 0.07 * styrke, 0, 0.5).toFixed(3) + ")");
            g.addColorStop(1, "rgba(190, 90, 190, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.rect(cx - rad - 2, niveau, rad * 2 + 4, rad * 2 + 12);
            ctx.fill();
        }

        /* Stålulden i bunden og brintboblerne */
        ctx.translate(k.p.x, k.p.y);
        ctx.rotate(k.p.v);
        ctx.translate(-a.x, -a.y);
        if (k.jern > 0.01) {
            var s = Math.sqrt(k.jern);
            var n = Math.max(1, Math.round(7 * s));
            for (i = 0; i < n; i++) {
                var dx = (i - (n - 1) / 2) * 7 * s + Math.sin(i * 7.3) * 3;
                tot(ctx, 48 + dx, 118 - (i % 3) * 3 * s, 7 * s + (i % 2), i * 1.7);
            }
        }
        if (k.bobler && niveau !== null) {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 0.9;
            for (i = 0; i < k.bobler.length; i++) {
                var bo = k.bobler[i];
                var w = NK.tilVerden(k.p, a, bo.x, bo.y);
                if (w.y < niveau + 1) continue;
                ctx.beginPath();
                ctx.arc(bo.x, bo.y, bo.r, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        ctx.restore();

        NK.Sprites.tegnPositur(ctx, "kolbe", k.p, a);
        if (k.fremhaev) S.tegnMarkering(ctx, S.rekt("kolbe", k.p, a, 0), tid);
        return niveau;
    };

    /* Affaldsbaegeret under buretten */
    S.tegnAffald = function (ctx, b, tid) {
        var a = S.ANKER.baegerglas;
        var verden = S.indreVerden(S.BAEGER_INDRE, b.p, a);
        var niveau = S.tegnVaeske(ctx, verden, b.ml * S.AFFALD_AREAL, NK.Model.FARVE.kmno4, { tid: tid });
        NK.Sprites.tegnPositur(ctx, "baegerglas", b.p, a);
        var m = NK.tilVerden(b.p, a, 44, 30);
        ctx.save();
        ctx.fillStyle = "rgba(247, 245, 238, 0.95)";
        NK.rundtRekt(ctx, m.x - 16, m.y - 7, 32, 13, 2);
        ctx.fill();
        NK.tekst(ctx, "Affald", m.x, m.y + 0.5, { font: "700 7.5px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#3a3f47" });
        ctx.restore();
        return niveau;
    };

    /* ================================================================
       STATIV OG BURET
       ================================================================ */
    S.tegnStativ = function (ctx) {
        var T = S.STATIV;
        S.skygge(ctx, (T.x0 + T.x1) / 2, (T.x1 - T.x0) / 2, 0.3);
        NK.rundtRekt(ctx, T.x0, T.y, T.x1 - T.x0, S.BORD - T.y, 2);
        var g = ctx.createLinearGradient(0, T.y, 0, S.BORD);
        g.addColorStop(0, "#5c6274");
        g.addColorStop(1, "#343846");
        ctx.fillStyle = g;
        ctx.fill();

        var s = ctx.createLinearGradient(T.stang - 4, 0, T.stang + 4, 0);
        s.addColorStop(0, "#414659");
        s.addColorStop(0.4, "#8a90a4");
        s.addColorStop(1, "#3a3e4e");
        ctx.fillStyle = s;
        NK.rundtRekt(ctx, T.stang - 4, T.top, 8, T.y - T.top, 3);
        ctx.fill();

        /* Hvid flise, saa farveskiftet kan ses */
        var FL = S.FLISE;
        ctx.fillStyle = "#f1f3f5";
        ctx.fillRect(FL.x0, FL.y, FL.x1 - FL.x0, T.y - FL.y);
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.fillRect(FL.x0, T.y - 1.5, FL.x1 - FL.x0, 1.5);
    };

    /* Klemmen tegnes foran buretten */
    S.tegnKlemme = function (ctx) {
        var B = S.BURET, T = S.STATIV;
        var y = 176;
        var g = ctx.createLinearGradient(0, y - 5, 0, y + 5);
        g.addColorStop(0, "#777d90");
        g.addColorStop(1, "#40444f");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, T.stang - 6, y - 5, B.x - T.stang, 10, 3);
        ctx.fill();
        ctx.fillStyle = "#4a4f61";
        NK.rundtRekt(ctx, B.x - B.halv - 4, y - 9, B.halv * 2 + 8, 18, 4);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(T.stang, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#8a90a6";
        ctx.fill();
    };

    function buretSti(ctx, ind) {
        var B = S.BURET, h = B.halv - ind;
        ctx.beginPath();
        ctx.moveTo(B.x - h, B.top);
        ctx.lineTo(B.x - h, B.kegle);
        ctx.lineTo(B.x - 2.4 + ind * 0.3, B.hane);
        ctx.lineTo(B.x + 2.4 - ind * 0.3, B.hane);
        ctx.lineTo(B.x + h, B.kegle);
        ctx.lineTo(B.x + h, B.top);
    }

    /* b: { V, fyldt, tragt, aaben, fremhaev, hane } */
    S.tegnBuret = function (ctx, b, tid) {
        var B = S.BURET;
        var i;
        buretSti(ctx, 0);
        ctx.closePath();
        var gl = ctx.createLinearGradient(B.x - B.halv, 0, B.x + B.halv, 0);
        gl.addColorStop(0, "rgba(226, 240, 250, 0.16)");
        gl.addColorStop(0.4, "rgba(226, 240, 250, 0.05)");
        gl.addColorStop(1, "rgba(180, 205, 225, 0.18)");
        ctx.fillStyle = gl;
        ctx.fill();

        /* Vaesken fra menisken og ned til hanen */
        if (b.fyldt && b.V < 50) {
            var yM = S.buretY(b.V);
            ctx.save();
            buretSti(ctx, 1.3);
            ctx.closePath();
            ctx.clip();
            var v = ctx.createLinearGradient(B.x - B.halv, 0, B.x + B.halv, 0);
            v.addColorStop(0, "rgba(80, 10, 96, 0.95)");
            v.addColorStop(0.45, "rgba(130, 36, 150, 0.95)");
            v.addColorStop(1, "rgba(70, 8, 84, 0.95)");
            ctx.fillStyle = v;
            ctx.fillRect(B.x - B.halv, yM, B.halv * 2, B.hane - yM + 2);
            ctx.beginPath();
            ctx.moveTo(B.x - B.halv, yM - 1.5);
            ctx.quadraticCurveTo(B.x, yM + 2.5, B.x + B.halv, yM - 1.5);
            ctx.strokeStyle = "rgba(230, 180, 240, 0.7)";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
        }

        /* Inddeling: streg for hver mL, tal for hver 5 mL */
        for (i = 0; i <= 50; i++) {
            var y = S.buretY(i);
            var lang = i % 5 === 0;
            ctx.beginPath();
            ctx.moveTo(B.x + B.halv - (lang ? 6 : 3.5), y);
            ctx.lineTo(B.x + B.halv, y);
            ctx.strokeStyle = lang ? "rgba(235, 245, 252, 0.85)" : "rgba(210, 230, 245, 0.45)";
            ctx.lineWidth = lang ? 0.9 : 0.6;
            ctx.stroke();
            if (lang && i % 10 === 0) {
                NK.tekst(ctx, String(i), B.x - B.halv - 3, y, { font: "600 7px 'Segoe UI', sans-serif", justering: "right", linje: "middle", farve: "rgba(215, 232, 245, 0.8)" });
            }
        }

        buretSti(ctx, 0);
        ctx.strokeStyle = "rgba(198, 222, 240, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
        ctx.fillRect(B.x - B.halv + 2, B.top + 4, 1.6, B.kegle - B.top - 10);

        /* Spidsen */
        ctx.beginPath();
        ctx.moveTo(B.x - 2.4, B.haneBund);
        ctx.lineTo(B.x - 1.2, B.spids);
        ctx.lineTo(B.x + 1.2, B.spids);
        ctx.lineTo(B.x + 2.4, B.haneBund);
        ctx.closePath();
        ctx.fillStyle = b.fyldt ? "rgba(110, 24, 128, 0.8)" : "rgba(210, 232, 248, 0.22)";
        ctx.fill();
        ctx.strokeStyle = "rgba(198, 222, 240, 0.6)";
        ctx.lineWidth = 0.9;
        ctx.stroke();

        /* Hanen: grebet staar paa langs af roeret, naar den er aaben */
        var hy = (B.hane + B.haneBund) / 2;
        ctx.fillStyle = "rgba(226, 240, 250, 0.3)";
        NK.rundtRekt(ctx, B.x - 9, B.hane, 18, B.haneBund - B.hane, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(198, 222, 240, 0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.save();
        ctx.translate(B.x, hy);
        ctx.rotate(b.aaben ? Math.PI / 2 : 0);
        ctx.fillStyle = b.aaben ? "#3fae72" : "#c9ced8";
        NK.rundtRekt(ctx, -17, -3, 34, 6, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(12, 14, 20, 0.6)";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#e6eaf0";
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        if (b.fremhaevHane) S.tegnMarkering(ctx, { x: B.x - 18, y: B.hane - 2, b: 36, h: B.haneBund - B.hane + 4 }, tid);

        /* Tragten foroven */
        if (b.tragt) {
            ctx.beginPath();
            ctx.moveTo(B.x - 16, 92);
            ctx.lineTo(B.x + 16, 92);
            ctx.lineTo(B.x + 3, 106);
            ctx.lineTo(B.x + 2.5, B.top + 10);
            ctx.lineTo(B.x - 2.5, B.top + 10);
            ctx.lineTo(B.x - 3, 106);
            ctx.closePath();
            ctx.fillStyle = "rgba(226, 240, 250, 0.2)";
            ctx.fill();
            ctx.strokeStyle = "rgba(198, 222, 240, 0.75)";
            ctx.lineWidth = 1.1;
            ctx.stroke();
        }
        if (b.fremhaev) S.tegnMarkering(ctx, { x: B.x - 20, y: B.top - (b.tragt ? 22 : 4), b: 40, h: B.kegle - B.top + (b.tragt ? 22 : 4) }, tid);
    };

    /* Plet af permanganat paa bordet */
    S.tegnPlet = function (ctx, plet) {
        if (!plet || plet.styrke < 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(plet.styrke, 0, 1);
        var g = ctx.createRadialGradient(plet.x, plet.y, 2, plet.x, plet.y, 40);
        g.addColorStop(0, "rgba(90, 40, 30, 0.9)");
        g.addColorStop(0.6, "rgba(110, 30, 100, 0.7)");
        g.addColorStop(1, "rgba(110, 30, 100, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(plet.x, plet.y, 40, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Syre, der er loebet ud over vaegten: { x, rx, alfa } */
    S.tegnSyrepyt = function (ctx, pyt) {
        if (!pyt || pyt.alfa < 0.01) return;
        var y = S.VAEGT.y + 1;
        ctx.save();
        ctx.globalAlpha = NK.klamp(pyt.alfa, 0, 1);
        ctx.fillStyle = "rgba(205, 228, 240, 0.75)";
        ctx.beginPath();
        ctx.ellipse(pyt.x, y, pyt.rx, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1;
        ctx.stroke();
        /* Draaber, der loeber ned ad vaegtens forkant */
        for (var i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.ellipse(pyt.x - pyt.rx * 0.8 + i * pyt.rx * 0.5, y + 8 + (i % 2) * 10, 2, 4, 0, 0, Math.PI * 2);
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

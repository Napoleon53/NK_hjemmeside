/* =====================================================================
   scene.js - laboratoriebordet og opstillingen, tegnet paa et fast
   tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Fra venstre: Pb(NO3)2, KI, vaegten med
   vejebaaden, spatlen, maaleglasset med vand, stativet med
   temperaturfoeleren, varmepladen med baegerglasset, termometret og
   affaldsdunken. Genstandene er SVG-filer i sprites/. Hver genstand har
   et ankerpunkt og en positur { x, y, v }: hvor ankeret staar, og hvor
   meget den haelder.

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
        pbGlas:      { x: 29, y: 6 },
        kiGlas:      { x: 29, y: 6 },
        vejebaad:    { x: 30, y: 16 },
        spatel:      { x: 12, y: 6 },
        maaleglas:   { x: 22, y: 4 },
        baegerglas:  { x: 56, y: 4 },
        dunk:        { x: 45, y: 12 },
        papir:       { x: 36, y: 22 }
    };

    /* Kemichaels ankre (laereren og kaffekoppen) staar i ../kemichael/kemichael.js */
    Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });

    /* Positur for en genstand, der staar paa underlaget y med midten i x. */
    function staar(navn, x, y) {
        var f = F[navn], a = S.ANKER[navn];
        return { x: x - f.b / 2 + a.x, y: (y === undefined ? S.BORD : y) - f.h + a.y, v: 0 };
    }
    S.staar = staar;

    S.VAEGT = { x: 178, y: S.BORD - 58 };
    S.VAEGT_DISPLAY = { x: 178 + 44, y: S.BORD - 58 + 28, b: 62, h: 18 };
    S.VARMEPLADE = { x: 560, y: S.BORD - 72 };
    S.KNAP = {
        varme:  { x: 560 + 52, y: S.BORD - 72 + 46, r: 13, lampe: { x: 560 + 82, y: S.BORD - 72 + 38 } },
        omroer: { x: 560 + 128, y: S.BORD - 72 + 46, r: 13, lampe: { x: 560 + 158, y: S.BORD - 72 + 38 } }
    };
    S.TERMOMETER = { x: 760, y: S.BORD - 84, b: 64, h: 84 };
    S.STANG = { x: 532, top: 204, fodX: 508, fodB: 48 };
    S.FOELER = { x: 612, arm: 250, laengde: 176, loeft: 132 };
    S.DUNK = { x: 890, y: S.BORD - 130, aabning: { x: 935, y: S.BORD - 118 } };
    S.HYLDE = { x0: 16, x1: 116, y: 268 };
    S.UR = { x: 160, y: 186, r: 24 };

    S.HJEM = {
        pbGlas:     staar("pbGlas", 50),
        kiGlas:     staar("kiGlas", 122),
        vejebaad:   { x: 253, y: S.VAEGT.y + 5, v: 0 },
        spatel:     { x: 352, y: S.BORD - 6, v: 0 },
        maaleglas:  staar("maaleglas", 474),
        baegerglas: { x: 650, y: S.VARMEPLADE.y - 132 + 4, v: 0 },
        kaffekop:   staar("kaffekop", 60, S.HYLDE.y)
    };

    /* Laagene ligger paa bordet foran glassene, naar de er skruet af */
    S.LAAG = { pbGlas: { x: 30, y: S.BORD + 5 }, kiGlas: { x: 140, y: S.BORD + 5 } };

    /* Stillinger undervejs */
    S.HAELD_VAND = { x: 614, y: 262, v: 2.05 };
    S.HAELD_BAAD = { x: 626, y: 270, v: 0.95 };
    S.OVER_BAAD = { x: 250, y: 428, v: -0.25 };
    S.SPATEL_DUNK = { x: 935, y: 360, v: -0.3 };
    S.HAELD_DUNK = { x: 949, y: 324, v: 1.95 };

    /* Zoomboblen og det punkt paa baegerglasset, luppen sidder paa */
    S.BOBLE = { x: 836, y: 196, r: 94 };
    S.LUP = { x: 92, y: 104 };

    /* ----- Indersider (lokale koordinater) ------------------------------ */
    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    S.BAEGER_INDRE = pts([[8, 6], [104, 6], [104, 121], [99, 126], [13, 126], [8, 121]]);
    S.BAEGER_PR_ML = 0.46 * 96;
    S.MAALE_INDRE = pts([[12, 10], [32, 10], [32, 198], [12, 198]]);
    S.MAALE_PR_ML = 1.66 * 20;

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

    S.tegnDunk = function (ctx) {
        S.skygge(ctx, S.DUNK.x + 45, 40, 0.3);
        NK.Sprites.tegn(ctx, "dunk", S.DUNK.x, S.DUNK.y);
    };

    /* ================================================================
       STOFFERNE, VAEGTEN OG SPATLEN
       ================================================================ */

    /* Glasset med stof og dets laag. laagT: 0 paa glasset, 1 paa bordet. */
    S.tegnStofglas = function (ctx, navn, p, laagT, hjemme) {
        var a = S.ANKER[navn];
        if (hjemme) S.skygge(ctx, p.x, 30, 0.3);
        NK.Sprites.tegnPositur(ctx, navn, p, a);
        var paa = NK.tilVerden(p, a, 29, 4);
        var bord = S.LAAG[navn];
        var t = NK.blod(laagT);
        var x = NK.lerp(paa.x, bord.x, t);
        var y = NK.lerp(paa.y, bord.y, t) - Math.sin(Math.PI * t) * 34;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(NK.lerp(p.v, 0, t));
        var sort = navn === "pbGlas";
        ctx.fillStyle = sort ? "#1d2024" : "#2c6fb0";
        NK.rundtRekt(ctx, -17, -9, 34, 10, 2.5);
        ctx.fill();
        ctx.strokeStyle = sort ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (var i = -13; i <= 13; i += 3.2) { ctx.moveTo(i, -7.5); ctx.lineTo(i, 0); }
        ctx.stroke();
        ctx.fillStyle = sort ? "#353a41" : "#4a8fd4";
        ctx.fillRect(-16, -9, 32, 2.2);
        ctx.restore();
    };

    /* Vaegten med tallet i displayet */
    S.tegnVaegt = function (ctx, masse, tid) {
        S.skygge(ctx, S.VAEGT.x + 75, 72, 0.3);
        NK.Sprites.tegn(ctx, "vaegt", S.VAEGT.x, S.VAEGT.y);
        var D = S.VAEGT_DISPLAY;
        var tekst = NK.Model.komma(Math.max(0, masse), 3);
        NK.skaer(ctx, D.x + D.b / 2, D.y + D.h / 2, 30, "rgba(90, 240, 150, 0.16)");
        NK.tekst(ctx, tekst, D.x + D.b - 13, D.y + D.h / 2 + 1, {
            font: "700 13px Consolas, 'Courier New', monospace", justering: "right", linje: "middle", farve: "#7df0a8"
        });
        NK.tekst(ctx, "g", D.x + D.b - 4, D.y + D.h / 2 + 1.5, {
            font: "700 9px Consolas, 'Courier New', monospace", justering: "right", linje: "middle", farve: "#5fc98a"
        });
        void tid;
    };

    /* Vejebaaden med en lille bunke pulver */
    S.tegnVejebaad = function (ctx, p, masse) {
        NK.Sprites.tegnPositur(ctx, "vejebaad", p, S.ANKER.vejebaad);
        if (masse < 0.004) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-S.ANKER.vejebaad.x, -S.ANKER.vejebaad.y);
        var h = Math.min(8, 2.2 + masse * 20);
        var b = Math.min(21, 8 + masse * 44);
        ctx.fillStyle = "#f7f7f3";
        ctx.beginPath();
        ctx.moveTo(30 - b, 13.8);
        ctx.quadraticCurveTo(30, 13.8 - h * 2, 30 + b, 13.8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(150, 158, 168, 0.6)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
    };

    /* Spatlen, eventuelt med pulver i skeen */
    S.tegnSpatel = function (ctx, p, last) {
        NK.Sprites.tegnPositur(ctx, "spatel", p, S.ANKER.spatel);
        if (!last) return;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.fillStyle = "#f7f7f3";
        ctx.beginPath();
        ctx.ellipse(0, -2.2, 7, 3.2, 0, Math.PI, 0);
        ctx.fill();
        ctx.restore();
    };

    /* Pulverkorn i luften: { x, y, liv } */
    S.tegnKorn = function (ctx, korn) {
        ctx.save();
        ctx.fillStyle = "#f4f4f0";
        for (var i = 0; i < korn.length; i++) {
            var k = korn[i];
            ctx.globalAlpha = NK.klamp(k.liv === undefined ? 1 : k.liv, 0, 1);
            ctx.fillRect(k.x - 0.9, k.y - 0.9, 1.8, 1.8);
        }
        ctx.restore();
    };

    /* Spildt pulver paa bordet: { x, rx, alfa } */
    S.tegnSpild = function (ctx, spild) {
        if (!spild || spild.alfa < 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(spild.alfa, 0, 1);
        ctx.fillStyle = "#eeeeea";
        ctx.beginPath();
        ctx.ellipse(spild.x, S.BORD + 1.5, spild.rx, 3.6, 0, 0, Math.PI * 2);
        ctx.fill();
        for (var i = 0; i < 18; i++) {
            var x = spild.x + Math.sin(i * 12.9898) * spild.rx * 1.35;
            var y = S.BORD + 1 + Math.cos(i * 78.233) * 3;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
        ctx.restore();
    };

    /* ================================================================
       STATIVET, FOELEREN, TERMOMETRET OG VARMEPLADEN
       ================================================================ */

    /* Ledningen fra foeleren ned ad stangen og hen til termometret.
       Tegnes foer varmepladen, saa den forsvinder bag den. */
    S.tegnLedning = function (ctx, loeft) {
        var Fo = S.FOELER, St = S.STANG, T = S.TERMOMETER;
        var top = Fo.arm - 16 - loeft * Fo.loeft;
        ctx.save();
        ctx.strokeStyle = "#15181c";
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(Fo.x, top);
        ctx.bezierCurveTo(Fo.x, top - 26, St.x + 8, top - 30, St.x + 6, top + 10);
        ctx.lineTo(St.x + 6, S.BORD - 6);
        ctx.lineTo(T.x - 18, S.BORD - 4);
        ctx.bezierCurveTo(T.x + 10, S.BORD - 4, T.x + T.b / 2, T.y - 30, T.x + T.b / 2, T.y + 3);
        ctx.stroke();
        ctx.restore();
    };

    /* Stangen med muffe, klemme og temperaturfoeler. loeft: 0 nede i
       glasset, 1 loeftet op. */
    S.tegnStang = function (ctx, loeft) {
        var St = S.STANG, Fo = S.FOELER;
        S.skygge(ctx, St.fodX + St.fodB / 2, 26, 0.3);
        ctx.fillStyle = "#2f343b";
        NK.rundtRekt(ctx, St.fodX, S.BORD - 8, St.fodB, 8, 2);
        ctx.fill();
        var sg = ctx.createLinearGradient(St.x - 3, 0, St.x + 3, 0);
        sg.addColorStop(0, "#7d8690");
        sg.addColorStop(0.45, "#e3e8ed");
        sg.addColorStop(1, "#6f7780");
        ctx.fillStyle = sg;
        ctx.fillRect(St.x - 2.5, St.top, 5, S.BORD - 8 - St.top);

        var arm = Fo.arm - loeft * Fo.loeft;
        /* Foeleren */
        var fg = ctx.createLinearGradient(Fo.x - 2, 0, Fo.x + 2, 0);
        fg.addColorStop(0, "#8a939c");
        fg.addColorStop(0.5, "#eef2f5");
        fg.addColorStop(1, "#7a838c");
        ctx.fillStyle = fg;
        ctx.fillRect(Fo.x - 1.8, arm - 16, 3.6, Fo.laengde - 3);
        ctx.beginPath();
        ctx.arc(Fo.x, arm - 16 + Fo.laengde - 3, 1.8, 0, Math.PI);
        ctx.fill();
        ctx.fillStyle = "#1d2024";
        NK.rundtRekt(ctx, Fo.x - 4, arm - 20, 8, 30, 2);
        ctx.fill();
        /* Arm og klemme */
        ctx.fillStyle = "#9aa3ad";
        ctx.fillRect(St.x, arm - 2, Fo.x - St.x - 4, 4);
        ctx.fillStyle = "#3a4048";
        NK.rundtRekt(ctx, St.x - 7, arm - 7, 14, 14, 2);
        ctx.fill();
        NK.rundtRekt(ctx, Fo.x - 7, arm - 5, 14, 10, 2);
        ctx.fill();
        ctx.fillStyle = "#c0392b";
        ctx.beginPath();
        ctx.arc(St.x + 9, arm, 2.6, 0, Math.PI * 2);
        ctx.fill();
    };

    /* Den nedre ende af foeleren, paa tegnebordet */
    S.foelerSpids = function (loeft) {
        return { x: S.FOELER.x, y: S.FOELER.arm - 16 + S.FOELER.laengde - loeft * S.FOELER.loeft };
    };

    S.tegnTermometer = function (ctx, T, tilsluttet, fremhaev, tid) {
        var P = S.TERMOMETER;
        S.skygge(ctx, P.x + P.b / 2, 34, 0.3);
        NK.Sprites.tegn(ctx, "termometer", P.x, P.y);
        var tekst = tilsluttet ? NK.Model.komma(T, 1) : "--,-";
        NK.tekst(ctx, tekst, P.x + 47, P.y + 30, {
            font: "700 15px Consolas, 'Courier New', monospace", justering: "right", linje: "middle", farve: "#1f2a18"
        });
        NK.tekst(ctx, "°C", P.x + 54, P.y + 23, {
            font: "700 7px 'Segoe UI', sans-serif", justering: "right", linje: "middle", farve: "#1f2a18"
        });
        if (fremhaev) S.tegnMarkering(ctx, { x: P.x, y: P.y + 8, b: P.b, h: P.h - 8 }, tid);
    };

    /* Varmepladen. v = { varme, omroer, effekt (0-1), vinkelVarme,
       vinkelOmroer, markVarme, markOmroer } */
    S.tegnVarmeplade = function (ctx, v, tid) {
        var P = S.VARMEPLADE;
        S.skygge(ctx, P.x + 90, 92, 0.32);
        NK.Sprites.tegn(ctx, "varmeplade", P.x, P.y);
        if (v.effekt > 0.02) {
            ctx.save();
            ctx.globalAlpha = NK.klamp(v.effekt, 0, 1);
            var g = ctx.createLinearGradient(0, P.y, 0, P.y + 10);
            g.addColorStop(0, "rgba(255, 110, 50, 0.45)");
            g.addColorStop(1, "rgba(255, 110, 50, 0)");
            ctx.fillStyle = g;
            NK.rundtRekt(ctx, P.x + 10, P.y, 160, 10, 3);
            ctx.fill();
            ctx.restore();
        }
        [["varme", v.vinkelVarme, v.varme, "rgba(255, 150, 60, 0.9)", "#ffd2a8", "#e0641c"],
         ["omroer", v.vinkelOmroer, v.omroer, "rgba(80, 230, 140, 0.9)", "#b9ffd6", "#1fae5c"]].forEach(function (k) {
            var K = S.KNAP[k[0]];
            var kg = ctx.createRadialGradient(K.x - 3, K.y - 3, 1, K.x, K.y, 10.5);
            kg.addColorStop(0, "#6b737c");
            kg.addColorStop(1, "#23272c");
            ctx.fillStyle = kg;
            ctx.beginPath();
            ctx.arc(K.x, K.y, 10.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f2f4f6";
            ctx.lineWidth = 2;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(K.x + Math.sin(k[1]) * 3, K.y - Math.cos(k[1]) * 3);
            ctx.lineTo(K.x + Math.sin(k[1]) * 9, K.y - Math.cos(k[1]) * 9);
            ctx.stroke();
            if (k[2]) NK.skaer(ctx, K.lampe.x, K.lampe.y, 10, k[3], 0.7);
            NK.kugle(ctx, K.lampe.x, K.lampe.y, 2.6, k[2] ? k[4] : "#4a3a3a", k[2] ? k[5] : "#221818");
        });
        if (v.markVarme) S.tegnMarkering(ctx, { x: S.KNAP.varme.x - 14, y: S.KNAP.varme.y - 20, b: 44, h: 34 }, tid);
        if (v.markOmroer) S.tegnMarkering(ctx, { x: S.KNAP.omroer.x - 14, y: S.KNAP.omroer.y - 20, b: 44, h: 34 }, tid);
    };

    /* ================================================================
       VAESKER
       ================================================================ */

    /* Overfladen. hvirvel: dybden af hvirvlen i midten, naar der roeres. */
    function overflade(ctx, x0, x1, niveau, opt) {
        var cx = (x0 + x1) / 2, halv = (x1 - x0) / 2;
        ctx.moveTo(x0, niveau);
        for (var x = x0; x <= x1 + 0.1; x += 3) {
            var d = 0;
            if (opt.hvirvel) {
                var u = (x - cx) / halv;
                var w = Math.max(0, 1 - u * u);
                d = opt.hvirvel * (w * w * 1.35 - 0.35);
            }
            var b = opt.boelge || 0, t = opt.tid || 0;
            ctx.lineTo(x, niveau + d + Math.sin(x * 0.12 + t * 10) * b + Math.sin(x * 0.05 - t * 6.5) * b * 0.6);
        }
    }

    /* Tegner vaesken i beholderen fra overfladen 'niveau' og ned. */
    S.tegnLag = function (ctx, verden, niveau, farve, opt) {
        opt = opt || {};
        var x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        verden.forEach(function (p) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
        ctx.save();
        NK.polySti(ctx, verden);
        ctx.clip();
        ctx.beginPath();
        overflade(ctx, x0 - 4, x1 + 4, niveau, opt);
        ctx.lineTo(x1 + 6, y1 + 6);
        ctx.lineTo(x0 - 6, y1 + 6);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, niveau, 0, y1);
        g.addColorStop(0, NK.css(farve, 0.85));
        g.addColorStop(1, NK.css(farve, 1.15));
        ctx.fillStyle = g;
        ctx.fill();
        if (opt.uklar > 0.005) {
            ctx.fillStyle = NK.css(opt.uklarFarve, NK.klamp(opt.uklar, 0, 1) * 0.8);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        overflade(ctx, x0, x1, niveau, opt);
        ctx.stroke();
        ctx.restore();
    };

    S.tegnMaaleglas = function (ctx, p, vandAreal, hjemme) {
        var a = S.ANKER.maaleglas;
        if (hjemme) S.skygge(ctx, p.x, 24, 0.3);
        if (vandAreal > 2) {
            var verden = S.indreVerden(S.MAALE_INDRE, p, a);
            var niveau = NK.vaeskeNiveau(verden, vandAreal);
            S.tegnLag(ctx, verden, niveau, NK.Model.FARVE.vand, {});
        }
        NK.Sprites.tegnPositur(ctx, "maaleglas", p, a);
    };

    function sekskant(ctx, r) {
        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var v = i * Math.PI / 3;
            if (i === 0) ctx.moveTo(Math.cos(v) * r, Math.sin(v) * r * 0.55);
            else ctx.lineTo(Math.cos(v) * r, Math.sin(v) * r * 0.55);
        }
        ctx.closePath();
    }

    /* Baegerglasset. o = { p, vandAreal, uklar, bundlag, flager, bobler,
       magnet, spin, hvirvel, boelge, fremhaev }
       Returnerer vaeskens overflade paa tegnebordet (eller null). */
    S.tegnBaegerglas = function (ctx, o, tid) {
        var a = S.ANKER.baegerglas;
        var M = NK.Model;
        var verden = S.indreVerden(S.BAEGER_INDRE, o.p, a);
        var niveau = null, i;

        function lokal() {
            ctx.translate(o.p.x, o.p.y);
            ctx.rotate(o.p.v);
            ctx.translate(-a.x, -a.y);
        }

        /* Magneten i bunden */
        if (o.magnet) {
            ctx.save();
            lokal();
            var bred = 12 * Math.abs(Math.cos(o.spin || 0)) + 4;
            ctx.fillStyle = "#eef1f4";
            NK.rundtRekt(ctx, 56 - bred, 119.5, bred * 2, 5.5, 2.75);
            ctx.fill();
            ctx.fillStyle = "rgba(120, 130, 140, 0.5)";
            ctx.fillRect(56 - bred + 2, 123.4, bred * 2 - 4, 1.2);
            ctx.restore();
        }

        if (o.vandAreal > 4) {
            niveau = NK.vaeskeNiveau(verden, o.vandAreal);
            var opt = { boelge: o.boelge || 0, tid: tid, hvirvel: o.hvirvel || 0, uklar: o.uklar, uklarFarve: { r: 255, g: 214, b: 58, a: 1 } };
            S.tegnLag(ctx, verden, niveau, M.FARVE.vand, opt);

            ctx.save();
            NK.polySti(ctx, NK.klipUnder(verden, niveau - 1));
            ctx.clip();
            lokal();

            /* Bundfaldet, der har lagt sig */
            if (o.bundlag > 0.3) {
                ctx.beginPath();
                ctx.moveTo(6, 128);
                for (var x = 6; x <= 106; x += 4) ctx.lineTo(x, 126 - o.bundlag + Math.sin(x * 0.9) * 0.8);
                ctx.lineTo(106, 128);
                ctx.closePath();
                ctx.fillStyle = NK.css(M.FARVE.pbi2, 1);
                ctx.fill();
                ctx.fillStyle = "rgba(255, 250, 210, 0.35)";
                ctx.fillRect(6, 126 - o.bundlag, 100, 1);
            }

            /* Glinsende krystaller */
            var flager = o.flager || [];
            for (i = 0; i < flager.length; i++) {
                var f = flager[i];
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.a);
                ctx.globalAlpha = NK.klamp(f.alfa, 0, 1) * 0.35;
                ctx.fillStyle = "#ffd84a";
                ctx.beginPath();
                ctx.arc(0, 0, f.s * 1.9, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = NK.klamp(f.alfa, 0, 1);
                sekskant(ctx, f.s);
                ctx.fillStyle = "#ffd22e";
                ctx.fill();
                ctx.strokeStyle = "rgba(170, 110, 0, 0.6)";
                ctx.lineWidth = 0.5;
                ctx.stroke();
                var glimt = Math.pow(Math.max(0, Math.sin(tid * f.fart + f.fase)), 12);
                if (glimt > 0.05) {
                    ctx.globalAlpha = NK.klamp(f.alfa, 0, 1) * glimt;
                    ctx.fillStyle = "#fffbe6";
                    sekskant(ctx, f.s * 0.8);
                    ctx.fill();
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(-f.s * 2.2, 0); ctx.lineTo(f.s * 2.2, 0);
                    ctx.moveTo(0, -f.s * 1.6); ctx.lineTo(0, f.s * 1.6);
                    ctx.stroke();
                }
                ctx.restore();
            }

            /* Kogebobler */
            var bobler = o.bobler || [];
            ctx.strokeStyle = "rgba(235, 245, 255, 0.7)";
            ctx.lineWidth = 0.8;
            for (i = 0; i < bobler.length; i++) {
                ctx.beginPath();
                ctx.arc(bobler[i].x, bobler[i].y, bobler[i].r, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }

        NK.Sprites.tegnPositur(ctx, "baegerglas", o.p, a);
        if (o.fremhaev) S.tegnMarkering(ctx, S.rekt("baegerglas", o.p, a, 0), tid);
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
        ctx.strokeStyle = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: Math.max(0.55, farve.a) });
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tid * 90;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = Math.max(1, bredde * 0.35);
        ctx.stroke();
        ctx.restore();
    };

    /* Vanddamp over det varme glas */
    S.tegnDamp = function (ctx, dampe) {
        ctx.save();
        ctx.fillStyle = "#eef3f8";
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.1;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
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

/* =====================================================================
   scene.js - laboratoriet, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Til venstre staar det aabne bord med chips-
   posen, vaegten, petriskaalen og morteren. Til hoejre er stinkskabet
   med bunsenbraenderen, opløsningsmidlerne, baegerglasset, filtreringen
   og varmepladen. Genstandene er SVG-filer i sprites/. Hver genstand har
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
        pose:         { x: 50, y: 14 },
        vejebaad:     { x: 32, y: 14 },
        chip:         { x: 17, y: 13 },
        chipstykke:   { x: 9, y: 7 },
        morter:       { x: 50, y: 56 },
        pistil:       { x: 11, y: 92 },
        baegerglas:   { x: 68, y: 3 },
        skaal:        { x: 40, y: 21 },
        heptan:       { x: 23, y: 4 },
        vand:         { x: 44, y: 9 },
        tragt:        { x: 38, y: 108 },
        trefod:       { x: 35, y: 0 },
        brandtaeppe:  { x: 75, y: 6 },
        haand:        { x: 40, y: 46 },
        kost:         { x: 43, y: 54 },
        fejeblad:     { x: 4, y: 52 },
        glasaffald:   { x: 42, y: 12 }
    };

    /* Kemichaels ankre (laereren og kaffekoppen) staar i ../kemichael/kemichael.js */
    Object.keys(NK.Kemichael.ANKER).forEach(function (navn) { S.ANKER[navn] = NK.Kemichael.ANKER[navn]; });

    /* Positur for en genstand, der staar paa underlaget y med midten i x. */
    function staar(navn, x, y) {
        var f = F[navn], a = S.ANKER[navn];
        return { x: x - f.b / 2 + a.x, y: (y === undefined ? S.BORD : y) - f.h + a.y, v: 0 };
    }
    S.staar = staar;

    S.SKAB = { x0: 486, x1: 504, loft: 60, glas: 112 };
    S.VAEGT = { x: 162, y: 438, midt: 232 };
    S.VAEGT.vejeskaal = { x: 232, y: 438 };
    S.VAEGT.display = { x: 162 + 22, y: 438 + 30, b: 70, h: 20 };
    S.MORTER = { midt: 432 };
    S.TREFOD = { x: 550, top: 400 };
    S.BRAENDER = { x: 525, y: 425, b: 50, h: 75, flamme: { x: 550, y: 432 } };
    S.STATIV = { x: 800, y: S.BORD - 250 };
    S.TRAGT = { x: 858, y: 458 };
    S.PLADE = { x: 910, y: S.BORD - 34, midt: 955 };
    S.HYLDE = { x0: 26, x1: 156, y: 300 };
    S.PLAKAT = { x: 24, y: 96, b: 138, h: 140 };
    S.UR = { x: 202, y: 122, r: 24 };
    S.ALARM = { x: 440, y: 44 };
    S.GASHANE = { x: 516, y: 462 };
    S.A_MIDT = 746;
    S.GULV = 578;

    S.HJEM = {
        pose:     staar("pose", 56),
        vejebaad: { x: S.VAEGT.vejeskaal.x, y: S.VAEGT.vejeskaal.y, v: 0 },
        parkeret: { x: 130, y: S.BORD, v: 0 },
        skaal:    staar("skaal", 342),
        morter:   staar("morter", S.MORTER.midt),
        pistil:   { x: 446, y: 470, v: 0.34 },
        vand:     staar("vand", 616),
        heptan:   staar("heptan", 666),
        baegerA:  staar("baegerglas", S.A_MIDT),
        kaffekop: staar("kaffekop", 122, S.HYLDE.y)
    };
    S.PAA_VAEGT = staar("skaal", S.VAEGT.midt, S.VAEGT.y);
    S.UNDER_TRAGT = staar("skaal", S.TRAGT.x, S.BORD - 12);
    S.PAA_PLADE = staar("skaal", S.PLADE.midt, S.PLADE.y);
    S.PAA_TREFOD = staar("skaal", S.TREFOD.x, S.TREFOD.top);
    S.TREFOD_POSITUR = { x: S.TREFOD.x, y: S.TREFOD.top, v: 0 };
    S.LAAG_PAA_BORD = { x: 699, y: S.BORD - 5 };

    /* Zoomboblen staar over det aabne bord eller inde i stinkskabet */
    S.BOBLE = {
        ude:  { x: 330, y: 196, r: 96 },
        inde: { x: 700, y: 222, r: 96 }
    };

    /* ----- Indersider (lokale koordinater) ------------------------------ */
    function pts(liste) { return liste.map(function (p) { return { x: p[0], y: p[1] }; }); }

    S.BAEGER_INDRE = pts([[8, 4], [64, 4], [64, 82], [61, 86], [11, 86], [8, 82]]);
    S.BAEGER_FULD = NK.polyAreal(NK.klipUnder(S.BAEGER_INDRE, 60));
    S.TRAGT_INDRE = pts([[6, 5], [70, 5], [39, 50], [37, 50]]);
    S.TRAGT_FULD = NK.polyAreal(NK.klipUnder(S.TRAGT_INDRE, 12));

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
        var i;
        var g = ctx.createLinearGradient(0, 0, 0, S.BORD);
        g.addColorStop(0, "#232a33");
        g.addColorStop(1, "#303843");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Fliser bag det aabne bord */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 330; y < S.BORD; y += 34) { ctx.moveTo(-2000, y); ctx.lineTo(S.SKAB.x0, y); }
        for (var x = -2000; x < S.SKAB.x0; x += 34) { ctx.moveTo(x, 330); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        /* Loft med lysstofroer og roegalarm */
        ctx.fillStyle = "#2b3139";
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, 2000 + 44);
        ctx.fillStyle = "rgba(255, 248, 225, 0.55)";
        NK.rundtRekt(ctx, 40, 38, 340, 5, 2.5);
        ctx.fill();
        NK.skaer(ctx, 210, 46, 170, "rgba(255, 248, 225, 0.1)");
        var A = S.ALARM;
        ctx.fillStyle = "#e9ecef";
        ctx.beginPath();
        ctx.ellipse(A.x, 46, 17, 6, 0, 0, Math.PI);
        ctx.fill();
        ctx.fillRect(A.x - 17, 40, 34, 6);
        var blink = v.alarm && Math.sin(v.tid * 14) > 0;
        if (blink) NK.skaer(ctx, A.x, 52, 30, "rgba(255, 60, 40, 0.9)", 0.8);
        NK.kugle(ctx, A.x, 50, 2.6, blink ? "#ffb3a8" : "#9a3a32", blink ? "#e0281a" : "#4a1c18");

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
        var regler = ["Brug briller og kittel", "Der spises og drikkes", "ikke i laboratoriet", "Ingen åben ild nær", "brandfarlige stoffer"];
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

        /* Vaegur. urMinutter faar tiden til at loebe hurtigt under
           inddampningen. */
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

        /* Hylde */
        var H = S.HYLDE;
        ctx.fillStyle = "#6b4a2c";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 7);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(H.x0, H.y, H.x1 - H.x0, 1.5);
        ctx.fillStyle = "#4a3320";
        ctx.fillRect(H.x0 + 12, H.y + 7, 5, 14);
        ctx.fillRect(H.x1 - 17, H.y + 7, 5, 14);
        /* En brun flaske til pynt */
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

        /* Gulvet foran bordet */
        var gulv = ctx.createLinearGradient(0, S.GULV, 0, S.GULV + 120);
        gulv.addColorStop(0, "#2a2e36");
        gulv.addColorStop(1, "#1c1f25");
        ctx.fillStyle = gulv;
        ctx.fillRect(-2000, S.GULV, S.BREDDE + 4000, 2000);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(-2000, S.GULV, S.BREDDE + 4000, 3);
    };

    /* Stinkskabet: bagvaeg, loftpanel og venstre stolpe. */
    S.tegnStinkskab = function (ctx, tid) {
        var K = S.SKAB;
        var g = ctx.createLinearGradient(0, K.glas, 0, S.BORD);
        g.addColorStop(0, "#1b2027");
        g.addColorStop(1, "#262c35");
        ctx.fillStyle = g;
        ctx.fillRect(K.x1, K.loft, 3000, S.BORD - K.loft);

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = 170; y < S.BORD; y += 46) { ctx.moveTo(K.x1, y); ctx.lineTo(3000, y); }
        for (var x = K.x1 + 30; x < 3000; x += 46) { ctx.moveTo(x, 170); ctx.lineTo(x, S.BORD); }
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = "#0d0f13";
        for (var i = 0; i < 6; i++) {
            NK.rundtRekt(ctx, K.x1 + 26 + i * 84, 140, 60, 6, 3);
            ctx.fill();
        }
        /* Svage luftstriber mod spalterne */
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 34]);
        ctx.lineDashOffset = tid * 70;
        ctx.strokeStyle = "rgba(190, 215, 240, 0.06)";
        for (i = 0; i < 4; i++) {
            var lx = K.x1 + 50 + i * 110;
            ctx.beginPath();
            ctx.moveTo(lx, 470);
            ctx.bezierCurveTo(lx + 30, 380, lx - 30, 240, lx + 8, 148);
            ctx.stroke();
        }
        ctx.restore();

        /* Loftpanel med skydeglassets underkant */
        ctx.fillStyle = "#39414c";
        ctx.fillRect(K.x0, K.loft, 3000, K.glas - K.loft);
        ctx.fillStyle = "rgba(170, 205, 230, 0.12)";
        ctx.fillRect(K.x1, K.loft + 4, 3000, K.glas - K.loft - 16);
        var kant = ctx.createLinearGradient(0, K.glas - 12, 0, K.glas);
        kant.addColorStop(0, "#9aa2ad");
        kant.addColorStop(1, "#4a515b");
        ctx.fillStyle = kant;
        ctx.fillRect(K.x0, K.glas - 12, 3000, 12);
        NK.tekst(ctx, "STINKSKAB", 560, K.loft + 26, { font: "800 11px 'Segoe UI', sans-serif", farve: "rgba(230, 236, 242, 0.55)" });
        NK.skaer(ctx, 660, K.loft + 22, 14, "rgba(80, 230, 140, 0.8)", 0.6);
        NK.kugle(ctx, 660, K.loft + 22, 4.2, "#b9ffd6", "#1fae5c");
        NK.tekst(ctx, "Udsugning", 670, K.loft + 26, { font: "600 10px 'Segoe UI', sans-serif", farve: "rgba(200, 240, 215, 0.7)" });

        /* Venstre stolpe */
        var st = ctx.createLinearGradient(K.x0, 0, K.x1, 0);
        st.addColorStop(0, "#4a525d");
        st.addColorStop(0.5, "#8c95a0");
        st.addColorStop(1, "#3c434d");
        ctx.fillStyle = st;
        ctx.fillRect(K.x0, K.loft, K.x1 - K.x0, S.BORD - K.loft);
    };

    /* Gashanen paa stinkskabets bagvaeg og slangen til braenderen.
       aaben: hanen staar paa langs, naar braenderen er taendt. */
    S.tegnGas = function (ctx, braender, aaben) {
        var G = S.GASHANE;
        ctx.fillStyle = "#8a929c";
        ctx.fillRect(G.x - 3, G.y - 22, 6, 24);
        ctx.save();
        ctx.translate(G.x, G.y - 14);
        ctx.rotate(aaben ? Math.PI / 2 : 0);
        ctx.fillStyle = "#c9a227";
        NK.rundtRekt(ctx, -3, -11, 6, 22, 2.5);
        ctx.fill();
        ctx.restore();
        if (!braender) return;
        ctx.save();
        ctx.strokeStyle = "#b8321f";
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(G.x, G.y);
        ctx.bezierCurveTo(G.x, 499, 540, 499, S.BRAENDER.x + 46, S.BRAENDER.y + 66);
        ctx.stroke();
        ctx.restore();
    };

    /* Sod paa stinkskabets bagvaeg over trefoden efter branden */
    S.tegnSod = function (ctx, sod) {
        if (sod < 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(sod, 0, 1);
        var g = ctx.createRadialGradient(S.TREFOD.x, 300, 6, S.TREFOD.x, 290, 90);
        g.addColorStop(0, "rgba(8, 8, 10, 0.85)");
        g.addColorStop(0.5, "rgba(12, 12, 14, 0.45)");
        g.addColorStop(1, "rgba(12, 12, 14, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(S.TREFOD.x, 290, 60, 100, 0, 0, Math.PI * 2);
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

    S.tegnVarmeplade = function (ctx, temp, taendt, tid) {
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

    /* Trefod og braender. flamme: 0-1 */
    S.tegnBraender = function (ctx, flamme, tid) {
        var B = S.BRAENDER;
        S.skygge(ctx, S.TREFOD.x, 38, 0.3);
        if (flamme > 0.01) S.tegnFlamme(ctx, B.flamme.x, B.flamme.y, 30 * flamme, tid);
        NK.Sprites.tegn(ctx, "braender", B.x, B.y, B.b, B.h);
        NK.Sprites.tegnPositur(ctx, "trefod", S.TREFOD_POSITUR, S.ANKER.trefod);
    };

    S.tegnFlamme = function (ctx, x, y, h, tid) {
        var f = 1 + 0.06 * Math.sin(tid * 23) + 0.04 * Math.sin(tid * 37 + 1.3);
        h *= f;
        var sving = 1.2 * Math.sin(tid * 11);
        NK.skaer(ctx, x, y - h * 0.45, 30, "rgba(90, 150, 255, 0.45)", 0.5);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - 6, y);
        ctx.bezierCurveTo(x - 10, y - h * 0.4, x - 3 + sving, y - h * 0.8, x + sving, y - h);
        ctx.bezierCurveTo(x + 3 + sving, y - h * 0.8, x + 10, y - h * 0.4, x + 6, y);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, y, 0, y - h);
        g.addColorStop(0, "rgba(120, 180, 255, 0.85)");
        g.addColorStop(0.6, "rgba(140, 125, 255, 0.5)");
        g.addColorStop(1, "rgba(255, 170, 90, 0)");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x - 4, y);
        ctx.quadraticCurveTo(x + sving * 0.3, y - h * 0.85, x + 4, y);
        ctx.closePath();
        ctx.fillStyle = "rgba(175, 222, 255, 0.92)";
        ctx.fill();
        ctx.restore();
    };

    /* Heptandampene braender: gule og orange tunger over glasset. */
    S.tegnIld = function (ctx, x, y, styrke, tid) {
        if (styrke < 0.01) return;
        NK.skaer(ctx, x, y - 50 * styrke, 170 * styrke, "rgba(255, 150, 50, 0.55)", NK.klamp(styrke, 0, 1));
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (var i = 0; i < 7; i++) {
            var fase = tid * (7 + i * 1.3) + i * 2.1;
            var bx = x + (i - 3) * 9 * (0.6 + 0.4 * styrke);
            var h = styrke * (60 + 55 * Math.abs(Math.sin(fase * 0.7 + i))) * (1 - Math.abs(i - 3) * 0.12);
            var sv = Math.sin(fase) * 8 * styrke;
            var b = 9 + 5 * styrke;
            ctx.beginPath();
            ctx.moveTo(bx - b, y);
            ctx.bezierCurveTo(bx - b * 1.4, y - h * 0.45, bx - 2 + sv, y - h * 0.8, bx + sv * 1.4, y - h);
            ctx.bezierCurveTo(bx + 2 + sv, y - h * 0.8, bx + b * 1.4, y - h * 0.45, bx + b, y);
            ctx.closePath();
            var g = ctx.createLinearGradient(0, y, 0, y - h);
            g.addColorStop(0, "rgba(255, 220, 120, 0.55)");
            g.addColorStop(0.45, "rgba(255, 140, 40, 0.45)");
            g.addColorStop(1, "rgba(220, 60, 20, 0)");
            ctx.fillStyle = g;
            ctx.fill();
        }
        ctx.restore();
    };

    S.tegnRoeg = function (ctx, liste) {
        ctx.save();
        for (var i = 0; i < liste.length; i++) {
            var r = liste[i];
            ctx.globalAlpha = NK.klamp(r.liv, 0, 1) * (r.alfa || 0.35);
            ctx.fillStyle = r.farve || "#2a2c30";
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* ================================================================
       VAESKER
       ================================================================ */
    /* Tegner vaesken i en beholder med vandret overflade.
       Returnerer overfladens hoejde (eller null, hvis beholderen er tom). */
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
        if (opt.uklar > 0.01) {
            ctx.fillStyle = NK.css(opt.uklarFarve, NK.klamp(opt.uklar, 0, 1));
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x0, niveau);
        ctx.lineTo(x1, niveau);
        ctx.stroke();
        ctx.restore();
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
        ctx.strokeStyle = NK.css({ r: farve.r, g: farve.g, b: farve.b, a: Math.max(0.6, farve.a) });
        ctx.lineWidth = bredde;
        ctx.stroke();
        ctx.setLineDash([5, 9]);
        ctx.lineDashOffset = -tid * 90;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = Math.max(1, bredde * 0.4);
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
            ctx.fillStyle = "rgba(225, 238, 248, 0.35)";
            ctx.fill();
            ctx.strokeStyle = "rgba(235, 245, 255, 0.8)";
            ctx.lineWidth = 0.9;
            ctx.stroke();
        }
        ctx.restore();
    };

    S.tegnDampe = function (ctx, dampe) {
        ctx.save();
        for (var i = 0; i < dampe.length; i++) {
            var d = dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.2;
            ctx.fillStyle = d.farve || "#e8eef3";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    /* En chipskrumme: lille uregelmaessig flage */
    function krumme(ctx, x, y, r, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(-r, -r * 0.3);
        ctx.lineTo(-r * 0.2, -r * 0.8);
        ctx.lineTo(r, -r * 0.2);
        ctx.lineTo(r * 0.5, r * 0.7);
        ctx.lineTo(-r * 0.6, r * 0.6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    S.krumme = krumme;

    /* ================================================================
       BAEGERGLAS, TRAGT, VEJEBAAD OG MORTER
       ================================================================ */
    /* b: { p, areal, farve, uklar, krummer, hvirvel, fedt, salt, sod,
            boelge, bobler, fremhaev } */
    S.tegnBaeger = function (ctx, b, tid) {
        var a = S.ANKER.baegerglas;
        var verden = S.indreVerden(S.BAEGER_INDRE, b.p, a);
        var i;

        var niveau = S.tegnVaeske(ctx, verden, b.areal, b.farve, {
            boelge: b.boelge, tid: tid, uklar: b.uklar, uklarFarve: NK.Model.FARVE.uklart
        });

        /* Chipsrester i bunden. De hvirvler op, naar der roeres. */
        if (b.krummer && b.krummer.length) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.translate(b.p.x, b.p.y);
            ctx.rotate(b.p.v);
            ctx.translate(-a.x, -a.y);
            for (i = 0; i < b.krummer.length; i++) {
                var k = b.krummer[i];
                var hv = b.hvirvel || 0;
                var kx = k.x + Math.sin(tid * 5 + k.fase) * 16 * hv;
                var ky = k.y - Math.abs(Math.cos(tid * 3.3 + k.fase)) * 26 * hv;
                ctx.fillStyle = k.farve;
                krumme(ctx, kx, ky, k.r, k.a + tid * hv * 3);
            }
            ctx.restore();
        }

        /* Fedt eller salt tilbage efter inddampningen */
        if (b.fedt > 1) S.tegnVaeske(ctx, verden, b.fedt, NK.Model.FARVE.fedt, { tid: tid });
        if (b.salt > 0.01) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.translate(b.p.x, b.p.y);
            ctx.rotate(b.p.v);
            ctx.translate(-a.x, -a.y);
            ctx.fillStyle = "rgba(245, 245, 238, " + (0.8 * b.salt).toFixed(3) + ")";
            for (i = 0; i < 18; i++) ctx.fillRect(11 + i * 2.9, 84 - (i % 3), 2.2, 2.2);
            ctx.restore();
        }

        if (b.bobler && niveau !== null) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            for (i = 0; i < b.bobler.length; i++) {
                var bo = b.bobler[i];
                var w = NK.tilVerden(b.p, a, bo.x, bo.y);
                if (w.y < niveau) continue;
                ctx.beginPath();
                ctx.arc(w.x, w.y, bo.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        if (b.sod > 0.01) {
            ctx.save();
            NK.polySti(ctx, verden);
            ctx.clip();
            ctx.fillStyle = "rgba(20, 18, 16, " + (0.7 * b.sod).toFixed(3) + ")";
            ctx.fillRect(b.p.x - 100, b.p.y - 20, 200, 120);
            ctx.restore();
        }

        NK.Sprites.tegnPositur(ctx, "baegerglas", b.p, a);
        if (b.sod > 0.01) {
            ctx.save();
            ctx.globalAlpha = 0.55 * b.sod;
            ctx.fillStyle = "#1a1714";
            var top = NK.tilVerden(b.p, a, 36, 2);
            ctx.beginPath();
            ctx.ellipse(top.x, top.y + 4, 36, 8, b.p.v, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        if (b.fremhaev) S.tegnMarkering(ctx, S.rekt("baegerglas", b.p, a, 0), tid);
        return niveau;
    };

    /* t: { areal, farve, kage (0-1), vaad (0-1), uklar } */
    S.tegnTragt = function (ctx, t, tid) {
        var p = { x: S.TRAGT.x, y: S.TRAGT.y, v: 0 };
        var a = S.ANKER.tragt;
        function w(lx, ly) { return NK.tilVerden(p, a, lx, ly); }

        /* Filtrerpapiret, foldet som en kegle */
        var papir = [w(7, 5), w(69, 5), w(38, 50)];
        NK.polySti(ctx, papir);
        ctx.fillStyle = t.vaad > 0.05 ? NK.css(NK.blandFarve({ r: 244, g: 244, b: 238, a: 0.95 }, { r: 226, g: 214, b: 168, a: 0.95 }, t.vaad * 0.6)) : "rgba(244, 244, 238, 0.95)";
        ctx.fill();
        ctx.strokeStyle = "rgba(190, 190, 180, 0.9)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        var m1 = w(26, 5), m2 = w(50, 5), sp = w(38, 50);
        ctx.moveTo(m1.x, m1.y); ctx.lineTo(sp.x, sp.y); ctx.lineTo(m2.x, m2.y);
        ctx.strokeStyle = "rgba(170, 170, 160, 0.6)";
        ctx.stroke();

        S.tegnVaeske(ctx, S.indreVerden(S.TRAGT_INDRE, p, a), t.areal, t.farve, { tid: tid, uklar: t.uklar, uklarFarve: NK.Model.FARVE.uklart });

        if (t.kage > 0.01) {
            ctx.save();
            NK.polySti(ctx, papir);
            ctx.clip();
            var h = 6 + 18 * t.kage;
            ctx.fillStyle = "#c9a15a";
            for (var i = 0; i < 26 * t.kage; i++) {
                var fx = 38 + Math.sin(i * 12.9898) * (h * 0.55) * ((i % 5) / 5 + 0.3);
                var fy = 50 - ((i * 7.13) % h);
                var q = w(fx, fy);
                krumme(ctx, q.x, q.y, 2.4 + (i % 3) * 0.6, i);
            }
            ctx.restore();
        }

        NK.Sprites.tegnPositur(ctx, "tragt", p, a);
        return w(38, 108);
    };

    /* Petriskaalen. s: { p, fyld (0-1), farve, uklar, fedt (0-1), salt (0-1),
       sod (0-1), bobler, fremhaev }. Returnerer vaeskens overflade (y). */
    S.tegnSkaal = function (ctx, s, tid) {
        var a = S.ANKER.skaal;
        var cx = s.p.x, bund = s.p.y - a.y + 16;
        var rx = 35, ry = 4.4, i;
        var flade = bund;

        if (s.fyld > 0.005 && s.farve) {
            var h = 1 + 7 * NK.klamp(s.fyld, 0, 1);
            flade = bund - h;
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(cx, bund, rx, ry, 0, 0, Math.PI);
            ctx.lineTo(cx - rx, flade);
            ctx.ellipse(cx, flade, rx, ry, 0, Math.PI, Math.PI * 2);
            ctx.closePath();
            ctx.fillStyle = NK.css(s.farve, 1.3);
            ctx.fill();
            if (s.uklar > 0.01) {
                ctx.fillStyle = NK.css(NK.Model.FARVE.uklart, NK.klamp(s.uklar, 0, 1));
                ctx.fill();
            }
            ctx.beginPath();
            ctx.ellipse(cx, flade, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = NK.css(s.farve, 0.9);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1;
            ctx.stroke();
            if (s.bobler) {
                ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
                for (i = 0; i < s.bobler.length; i++) {
                    var bo = s.bobler[i];
                    ctx.globalAlpha = NK.klamp(bo.liv, 0, 1);
                    ctx.beginPath();
                    ctx.arc(cx + bo.x, flade + bo.y, bo.r * (1.4 - 0.4 * bo.liv), 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }

        /* Fedtet: en gul, olieagtig plet i bunden */
        if (s.fedt > 0.01) {
            var fr = 8 + 26 * NK.klamp(s.fedt, 0, 1);
            ctx.save();
            var g = ctx.createRadialGradient(cx - fr * 0.3, bund - 1.5, 1, cx, bund - 0.5, fr);
            g.addColorStop(0, "rgba(255, 236, 150, 0.95)");
            g.addColorStop(0.7, "rgba(238, 190, 60, 0.9)");
            g.addColorStop(1, "rgba(214, 160, 40, 0.75)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(cx, bund - 0.5, fr, Math.min(ry, 1.2 + fr * 0.1), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.beginPath();
            ctx.ellipse(cx - fr * 0.35, bund - 1.4, fr * 0.25, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        /* Saltet: en tynd, hvid belaegning */
        if (s.salt > 0.01) {
            ctx.save();
            ctx.fillStyle = "rgba(248, 248, 242, " + (0.85 * NK.klamp(s.salt, 0, 1)).toFixed(3) + ")";
            for (i = 0; i < 40; i++) {
                var vv = i * 2.39996, rr = Math.sqrt((i + 0.5) / 40);
                ctx.fillRect(cx + Math.cos(vv) * rr * 30 - 0.8, bund + Math.sin(vv) * rr * 3.6 - 0.8, 1.6, 1.6);
            }
            ctx.restore();
        }

        if (s.sod > 0.01) {
            ctx.save();
            ctx.fillStyle = "rgba(22, 20, 18, " + (0.75 * NK.klamp(s.sod, 0, 1)).toFixed(3) + ")";
            ctx.beginPath();
            ctx.ellipse(cx, bund - 4, rx + 3, ry + 4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        NK.Sprites.tegnPositur(ctx, "skaal", s.p, a);
        if (s.fremhaev) S.tegnMarkering(ctx, S.rekt("skaal", s.p, a, 2), tid);
        return flade;
    };

    /* Chips i vejebaaden. liste: [{ dx, dy, a, s }] */
    S.tegnVejebaad = function (ctx, p, chips) {
        NK.Sprites.tegnPositur(ctx, "vejebaad", p, S.ANKER.vejebaad);
        for (var i = 0; i < chips.length; i++) {
            var c = chips[i];
            var w = NK.tilVerden(p, S.ANKER.vejebaad, 32 + c.dx, 4 + c.dy);
            NK.Sprites.tegnPositur(ctx, "chip", { x: w.x, y: w.y, v: p.v + c.a }, S.ANKER.chip, 1, c.s);
        }
    };

    /* Indholdet i morteren. stykker: [{ dx, dy, a, s, nr }], knust 0-1 */
    S.tegnMorterIndhold = function (ctx, p, stykker, knust) {
        var a = S.ANKER.morter;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.v);
        ctx.translate(-a.x, -a.y);
        /* Kun det, der ligger over kanten, kan ses */
        ctx.beginPath();
        ctx.rect(0, -40, 100, 49);
        ctx.ellipse(50, 9, 45, 6, 0, 0, Math.PI);
        ctx.clip();
        for (var i = 0; i < stykker.length; i++) {
            var st = stykker[i];
            var synlig = st.nr <= 1 + 5 * knust;
            if (!synlig) continue;
            var y = 10 + st.dy - (1 - knust) * 3;
            if (knust < 0.3 && st.nr === 0) {
                NK.Sprites.tegnPositur(ctx, "chip", { x: 50 + st.dx, y: y - 2, v: st.a }, S.ANKER.chip, 1, 0.85);
            } else if (knust < 0.75) {
                NK.Sprites.tegnPositur(ctx, "chipstykke", { x: 50 + st.dx * 0.9, y: y + 1, v: st.a }, S.ANKER.chipstykke, 1, 1.15 - knust * 0.8);
            } else {
                ctx.fillStyle = st.nr % 2 ? "#e9b650" : "#f3cc6a";
                krumme(ctx, 50 + st.dx * 0.8, y + 3, 2.6, st.a);
            }
        }
        ctx.restore();
    };

    /* Krummer og chips i luften eller paa bordet (verdenskoordinater) */
    S.tegnFlyvende = function (ctx, liste) {
        for (var i = 0; i < liste.length; i++) {
            var k = liste[i];
            if (k.chip) {
                NK.Sprites.tegnPositur(ctx, "chip", { x: k.x, y: k.y, v: k.a }, S.ANKER.chip, k.alfa, k.s || 1);
            } else {
                ctx.save();
                ctx.globalAlpha = NK.klamp(k.alfa === undefined ? 1 : k.alfa, 0, 1);
                ctx.fillStyle = k.farve || "#eec15c";
                krumme(ctx, k.x, k.y, k.r || 2.6, k.a);
                ctx.restore();
            }
        }
    };

    /* ================================================================
       ZOOMBOBLENS FORBINDELSE, TALEBOBLE OG SEDDEL
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

    /* Glasskaar. liste: [{ x, y, a, pts, alfa }] */
    S.tegnSkaar = function (ctx, liste) {
        ctx.save();
        ctx.lineJoin = "round";
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            ctx.save();
            ctx.globalAlpha = NK.klamp(s.alfa === undefined ? 1 : s.alfa, 0, 1);
            ctx.translate(s.x, s.y);
            ctx.rotate(s.a);
            ctx.beginPath();
            ctx.moveTo(s.pts[0].x, s.pts[0].y);
            for (var j = 1; j < s.pts.length; j++) ctx.lineTo(s.pts[j].x, s.pts[j].y);
            ctx.closePath();
            ctx.fillStyle = "rgba(207, 230, 247, 0.22)";
            ctx.fill();
            ctx.strokeStyle = "rgba(226, 242, 252, 0.8)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };

    /* En pyt klar vaeske paa gulvet med et svagt, farvet skaer */
    S.tegnPyt = function (ctx, pyt, y) {
        if (!pyt || pyt.vaad < 0.01) return;
        ctx.save();
        ctx.globalAlpha = NK.klamp(pyt.vaad, 0, 1);
        ctx.fillStyle = "rgba(205, 220, 232, 0.32)";
        ctx.beginPath();
        ctx.ellipse(pyt.x, y, pyt.rx, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x + pyt.rx * 0.55, y + 1, pyt.rx * 0.45, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(pyt.x - pyt.rx * 0.6, y - 1, pyt.rx * 0.35, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        var g = ctx.createLinearGradient(pyt.x - pyt.rx, 0, pyt.x + pyt.rx, 0);
        g.addColorStop(0, "rgba(255, 170, 220, 0)");
        g.addColorStop(0.35, "rgba(170, 220, 255, 0.35)");
        g.addColorStop(0.6, "rgba(255, 240, 150, 0.3)");
        g.addColorStop(1, "rgba(255, 170, 220, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(pyt.x - pyt.rx * 0.1, y - 1, pyt.rx * 0.6, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Den gule seddel, hvor braenderen stod */
    S.tegnSeddel = function (ctx, tid) {
        var x = S.TREFOD.x, y = S.BORD - 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.06);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(-34, -20, 70, 22);
        ctx.fillStyle = "#f7e36b";
        ctx.fillRect(-36, -22, 70, 22);
        NK.tekst(ctx, "KONFISKERET", -1, -10, { font: "800 9.5px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#7a2a18" });
        ctx.restore();
    };
}());

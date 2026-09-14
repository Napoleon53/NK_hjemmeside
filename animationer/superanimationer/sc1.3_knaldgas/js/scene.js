/* =====================================================================
   scene.js - opstillingen, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Koordinaterne nedenfor kan derfor laeses som
   en tegning. Trykflasker, maaleglas, vandbad og braender er SVG-filer
   i sprites/; slanger, flamme, glassets indhold og knaldet tegnes her.

   Filen indeholder kun tegning og maal. Tilstanden (hvor glasset er,
   hvad der er i det) ligger i forsoeg.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = {};
    NK.Scene = S;

    S.BREDDE = 1000;
    S.HOEJDE = 600;
    S.BORD = 522;                         /* bordpladens overside */

    /* ----- Maaleglasset (lokale koordinater i maaleglas.svg) --------- */
    S.GLAS = {
        B: 90, H: 292,
        V: 15, HO: 75,                    /* indersidens vaegge */
        TOP: 16,                          /* den lukkede ende = 0 streger */
        STREG: 40,                        /* afstand mellem stregerne */
        MUND: 292,                        /* aabningen */
        MIDT: 45
    };
    S.GLAS.STREG6 = S.GLAS.TOP + 6 * S.GLAS.STREG;

    /* ----- Trykflaskerne ------------------------------------------ */
    var FK = 130 / 150;
    function flaske(x, navn, gas) {
        var top = S.BORD - 416 * FK;
        return {
            gas: gas, navn: navn, x: x, top: top,
            venstre: x - 75 * FK, b: 150 * FK, h: 420 * FK,
            udgang: { x: x + 29 * FK, y: top + 20 * FK },
            manometer: { x: x - 39 * FK, y: top + 56 * FK, r: 15.5 * FK },
            ramme: { x0: x - 50 * FK, x1: x + 50 * FK, y0: top + 24 * FK, y1: S.BORD }
        };
    }
    S.FLASKER = { h2: flaske(86, "flaskeH2", "h2"), o2: flaske(220, "flaskeO2", "o2") };

    /* ----- Vandbadet -------------------------------------------------- */
    var BK = 300 / 280;
    var badY = S.BORD - 138 * BK;
    S.BAD = {
        x: 370, y: badY, b: 300, h: 150,
        overflade: badY + 34 * BK,
        hylde: badY + 80 * BK,
        bund: badY + 131 * BK,
        hulX: 370 + 140 * BK,
        indreV: 370 + 8 * BK,
        indreH: 370 + 272 * BK
    };

    /* Glassets aabning hviler paa hylden, lige over hullet. */
    S.HJEM = { x: S.BAD.hulX, y: S.BAD.hylde };

    /* ----- Braenderen ------------------------------------------------- */
    var BRK = 0.9;
    var brTop = S.BORD - 149 * BRK;
    S.BRAENDER = {
        x: 835, top: brTop, b: 100 * BRK, h: 150 * BRK,
        flamme: { x: 835, y: brTop + 15 * BRK },
        studs: { x: 835 + 44 * BRK, y: brTop + 131.5 * BRK }
    };
    S.FLAMMEHOEJDE = 60;
    /* Her staar glassets aabning, naar det holdes ind over flammen. */
    S.TAEND = { x: S.BRAENDER.flamme.x, y: S.BRAENDER.flamme.y - S.FLAMMEHOEJDE + 6 };

    /* ----- Slangerne fra flaskerne ned under hylden ------------------- */
    function slange(f, bue, kantX, bundY, endeX) {
        var u = f.udgang;
        return {
            ende: { x: endeX, y: S.BAD.hylde + 21 },
            sti: [
                ["M", u.x, u.y],
                ["C", u.x, bue, kantX - 12, bue - 20, kantX, 360],
                ["L", kantX, bundY - 36],
                ["C", kantX, bundY, kantX + 28, bundY, 470, bundY],
                ["L", endeX - 20, bundY],
                ["C", endeX, bundY, endeX, bundY - 10, endeX, S.BAD.hylde + 21]
            ]
        };
    }
    S.SLANGER = {
        h2: slange(S.FLASKER.h2, 100, 392, 506, S.HJEM.x - 5),
        o2: slange(S.FLASKER.o2, 142, 404, 496, S.HJEM.x + 5)
    };

    S.FARVE = { h2: "#dfe7ef", o2: "#ef6a5c" };

    /* Omregner mellem laerredets pixels og tegnebordet. */
    S.skala = function (b, h) {
        var s = Math.min(b / S.BREDDE, h / S.HOEJDE);
        return { s: s, dx: (b - S.BREDDE * s) / 2, dy: (h - S.HOEJDE * s) / 2 };
    };

    /* Et punkt paa glasset (lokale koordinater) i tegnebordets
       koordinater, naar aabningen staar i (g.x, g.y) og glasset haelder
       vinklen g.vinkel. */
    S.glasTilBord = function (g, lx, ly) {
        var c = Math.cos(g.vinkel), si = Math.sin(g.vinkel);
        var x = lx - S.GLAS.MIDT, y = ly - S.GLAS.MUND;
        return { x: g.x + x * c - y * si, y: g.y + x * si + y * c };
    };

    S.bordTilGlas = function (g, bx, by) {
        var c = Math.cos(-g.vinkel), si = Math.sin(-g.vinkel);
        var x = bx - g.x, y = by - g.y;
        return { x: x * c - y * si + S.GLAS.MIDT, y: x * si + y * c + S.GLAS.MUND };
    };

    /* ================================================================
       BAGGRUND OG BORD
       ================================================================ */
    S.tegnBaggrund = function (ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, S.BORD);
        g.addColorStop(0, "#17191f");
        g.addColorStop(1, "#23262f");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        var lys = ctx.createRadialGradient(520, 330, 30, 520, 330, 520);
        lys.addColorStop(0, "rgba(120, 160, 200, 0.11)");
        lys.addColorStop(1, "rgba(120, 160, 200, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.BORD + 2000);

        /* Bordplade og forkant */
        ctx.fillStyle = "#383d4f";
        ctx.fillRect(-2000, S.BORD, S.BREDDE + 4000, 9);
        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        ctx.fillRect(-2000, S.BORD, S.BREDDE + 4000, 1.5);
        var f = ctx.createLinearGradient(0, S.BORD + 9, 0, S.HOEJDE);
        f.addColorStop(0, "#252835");
        f.addColorStop(1, "#1a1c24");
        ctx.fillStyle = f;
        ctx.fillRect(-2000, S.BORD + 9, S.BREDDE + 4000, 2000);

        /* Skygger paa bordpladen */
        skygge(ctx, S.FLASKER.h2.x, 55);
        skygge(ctx, S.FLASKER.o2.x, 55);
        skygge(ctx, S.BAD.x + S.BAD.b / 2, 160);
        skygge(ctx, S.BRAENDER.x, 44);
    };

    function skygge(ctx, x, rx) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(x, S.BORD + 3, rx, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /* ================================================================
       TRYKFLASKER OG SLANGER
       ================================================================ */
    S.tegnFlaske = function (ctx, f, fremhaev, flow) {
        ctx.save();
        if (fremhaev) {
            ctx.shadowColor = "rgba(242, 197, 61, 0.65)";
            ctx.shadowBlur = 22;
        }
        NK.Sprites.tegn(ctx, f.navn, f.venstre, f.top, f.b, f.h, "#4b5467");
        ctx.restore();

        /* Manometerets viser: slaar lidt ned, mens gassen stroemmer. */
        var m = f.manometer;
        var tryk = 0.74 - 0.1 * flow;
        var v = Math.PI * 0.75 + tryk * Math.PI * 1.5;
        ctx.save();
        ctx.strokeStyle = "#c0392b";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + Math.cos(v) * m.r * 0.78, m.y + Math.sin(v) * m.r * 0.78);
        ctx.stroke();
        ctx.fillStyle = "#2b2f37";
        ctx.beginPath();
        ctx.arc(m.x, m.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    function sti(ctx, liste) {
        ctx.beginPath();
        for (var i = 0; i < liste.length; i++) {
            var p = liste[i];
            if (p[0] === "M") ctx.moveTo(p[1], p[2]);
            else if (p[0] === "L") ctx.lineTo(p[1], p[2]);
            else ctx.bezierCurveTo(p[1], p[2], p[3], p[4], p[5], p[6]);
        }
    }

    S.tegnSlange = function (ctx, gas, flow, tid) {
        var s = S.SLANGER[gas];
        ctx.save();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        sti(ctx, s.sti);
        ctx.strokeStyle = "#1b1e25";
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = "#7d8697";
        ctx.lineWidth = 5.5;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        /* Gassen, der stroemmer gennem slangen */
        if (flow > 0.01) {
            ctx.setLineDash([12, 20]);
            ctx.lineDashOffset = -tid * 170;
            ctx.strokeStyle = S.FARVE[gas];
            ctx.globalAlpha = NK.klamp(flow, 0, 1) * 0.9;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ================================================================
       VANDBAD
       ================================================================ */
    S.tegnBad = function (ctx) {
        NK.Sprites.tegn(ctx, "vandbad", S.BAD.x, S.BAD.y, S.BAD.b, S.BAD.h, "rgba(90, 160, 210, 0.3)");
    };

    /* ================================================================
       BRAENDER, GASHANE OG FLAMME
       ================================================================ */
    S.tegnBraender = function (ctx, tid) {
        var br = S.BRAENDER;
        var hane = { x: 960, y: S.BORD };

        /* Gasslange til hanen */
        ctx.save();
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(br.studs.x, br.studs.y);
        ctx.bezierCurveTo(br.studs.x + 40, br.studs.y + 2, hane.x - 50, hane.y - 30, hane.x - 9, hane.y - 26);
        ctx.strokeStyle = "#1b1e25";
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.strokeStyle = "#b5543a";
        ctx.lineWidth = 5.5;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        /* Gashanen */
        NK.rundtRekt(ctx, hane.x - 7, hane.y - 40, 14, 40, 3);
        var g = ctx.createLinearGradient(hane.x - 7, 0, hane.x + 7, 0);
        g.addColorStop(0, "#5b6371");
        g.addColorStop(0.45, "#d9dfe6");
        g.addColorStop(1, "#4b5260");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.fillStyle = "#e0b23a";
        NK.rundtRekt(ctx, hane.x - 4, hane.y - 52, 26, 8, 3);
        ctx.fill();
        ctx.restore();

        NK.Sprites.tegn(ctx, "braender", br.x - br.b / 2, br.top, br.b, br.h, "#6d7686");
        S.tegnFlamme(ctx, br.flamme.x, br.flamme.y, tid);
    };

    S.tegnFlamme = function (ctx, x, y, tid) {
        var f = 1 + 0.06 * Math.sin(tid * 23) + 0.04 * Math.sin(tid * 37 + 1.3);
        var h = S.FLAMMEHOEJDE * f;
        var sving = 2.2 * Math.sin(tid * 11);

        NK.skaer(ctx, x, y - h * 0.45, 52, "rgba(90, 150, 255, 0.45)", 0.55);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - 10, y);
        ctx.bezierCurveTo(x - 17, y - h * 0.4, x - 5 + sving, y - h * 0.8, x + sving, y - h);
        ctx.bezierCurveTo(x + 5 + sving, y - h * 0.8, x + 17, y - h * 0.4, x + 10, y);
        ctx.closePath();
        var g = ctx.createLinearGradient(0, y, 0, y - h);
        g.addColorStop(0, "rgba(120, 180, 255, 0.8)");
        g.addColorStop(0.5, "rgba(140, 125, 255, 0.5)");
        g.addColorStop(0.85, "rgba(255, 170, 90, 0.4)");
        g.addColorStop(1, "rgba(255, 170, 90, 0)");
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x - 6.5, y);
        ctx.quadraticCurveTo(x + sving * 0.3, y - h * 0.9, x + 6.5, y);
        ctx.closePath();
        ctx.fillStyle = "rgba(175, 222, 255, 0.92)";
        ctx.fill();
        ctx.restore();
    };

    /* ================================================================
       MOLEKYLER
       ================================================================ */
    function kugle(ctx, x, y, r, lys, moerk) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, lys);
        g.addColorStop(1, moerk);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    var H_R = 5, O_R = 7;

    S.MOLEKYLRADIUS = { h2: 9, o2: 12, h2o: 12 };

    S.tegnMolekyle = function (ctx, m) {
        var c = Math.cos(m.a), s = Math.sin(m.a);
        ctx.save();
        ctx.globalAlpha = NK.klamp(m.alfa, 0, 1);
        if (m.type === "h2") {
            kugle(ctx, m.x - c * 3.8, m.y - s * 3.8, H_R, "#ffffff", "#98a4b3");
            kugle(ctx, m.x + c * 3.8, m.y + s * 3.8, H_R, "#ffffff", "#98a4b3");
        } else if (m.type === "o2") {
            kugle(ctx, m.x - c * 5, m.y - s * 5, O_R, "#ff9d8d", "#b3302a");
            kugle(ctx, m.x + c * 5, m.y + s * 5, O_R, "#ff9d8d", "#b3302a");
        } else {
            /* H2O: vinklen mellem de to H er ca. 104,5 grader */
            var a1 = m.a + Math.PI / 2 - 0.912, a2 = m.a + Math.PI / 2 + 0.912;
            kugle(ctx, m.x + Math.cos(a1) * 7.5, m.y + Math.sin(a1) * 7.5, H_R - 0.5, "#ffffff", "#98a4b3");
            kugle(ctx, m.x + Math.cos(a2) * 7.5, m.y + Math.sin(a2) * 7.5, H_R - 0.5, "#ffffff", "#98a4b3");
            kugle(ctx, m.x, m.y, O_R, "#ff9d8d", "#b3302a");
        }
        ctx.restore();
    };

    /* ================================================================
       MAALEGLASSET MED INDHOLD
       g: { x, y, vinkel, niveau (streger gas), vand (0-1),
            molekyler, dug, front (0-1 eller -1), fremhaev, s }
       ================================================================ */
    S.tegnGlas = function (ctx, g, tid) {
        var G = S.GLAS;
        var gasBund = G.TOP + g.niveau * G.STREG;

        ctx.save();
        ctx.translate(g.x, g.y);
        ctx.rotate(g.vinkel);
        ctx.translate(-G.MIDT, -G.MUND);

        /* Indholdet klippes til glassets inderside */
        ctx.save();
        ctx.beginPath();
        ctx.rect(G.V, G.TOP - 4, G.HO - G.V, G.MUND - G.TOP + 4);
        ctx.clip();

        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.fillRect(G.V, G.TOP - 4, G.HO - G.V, gasBund - G.TOP + 4);

        if (g.vand > 0.01 && gasBund < G.MUND) {
            var vg = ctx.createLinearGradient(0, gasBund, 0, G.MUND);
            vg.addColorStop(0, "rgba(120, 190, 235, " + (0.42 * g.vand) + ")");
            vg.addColorStop(1, "rgba(70, 140, 195, " + (0.5 * g.vand) + ")");
            ctx.fillStyle = vg;
            ctx.fillRect(G.V, gasBund, G.HO - G.V, G.MUND - gasBund);
            ctx.fillStyle = "rgba(200, 235, 255, " + (0.7 * g.vand) + ")";
            ctx.fillRect(G.V, gasBund - 1, G.HO - G.V, 2);
        }

        /* Flammefronten farer op gennem glasset ved knaldet */
        if (g.front >= 0) {
            var fy = G.MUND - (G.MUND - G.TOP) * g.front;
            var fg = ctx.createLinearGradient(0, fy - 30, 0, G.MUND);
            fg.addColorStop(0, "rgba(255, 240, 180, 0)");
            fg.addColorStop(0.15, "rgba(255, 230, 150, " + (0.9 * g.frontAlfa) + ")");
            fg.addColorStop(1, "rgba(255, 120, 40, " + (0.35 * g.frontAlfa) + ")");
            ctx.fillStyle = fg;
            ctx.fillRect(G.V, fy - 30, G.HO - G.V, G.MUND - fy + 30);
        }

        for (var i = 0; i < g.molekyler.length; i++) S.tegnMolekyle(ctx, g.molekyler[i]);

        /* Dug: vanddamp, der er kondenseret paa indersiden */
        for (var d = 0; d < g.dug.length; d++) {
            var dr = g.dug[d];
            ctx.globalAlpha = NK.klamp(dr.alfa, 0, 1) * 0.8;
            ctx.fillStyle = "rgba(210, 235, 250, 0.85)";
            ctx.beginPath();
            ctx.ellipse(dr.x, dr.y, dr.r * 0.8, dr.r, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.restore();

        NK.Sprites.tegn(ctx, "maaleglas", 0, 0, G.B, G.H, "rgba(207, 230, 247, 0.25)");

        /* Tallene ved stregerne, altid mindst 12 px paa skaermen */
        var fs = Math.max(13, 12 / g.s);
        for (var n = 1; n <= 6; n++) {
            NK.tekst(ctx, String(n), -4, G.TOP + n * G.STREG, {
                font: "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif",
                justering: "right", linje: "middle",
                farve: "rgba(232, 240, 248, 0.9)", kant: true, kantBredde: 3
            });
        }

        if (g.fremhaev > 0.01) {
            ctx.save();
            ctx.globalAlpha = g.fremhaev * (0.55 + 0.35 * Math.sin(tid * 4));
            ctx.strokeStyle = "#f2c53d";
            ctx.lineWidth = 2.2;
            ctx.setLineDash([7, 6]);
            NK.rundtRekt(ctx, -8, -8, G.B + 16, G.H + 14, 8);
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };

    /* Stiplet pil fra glassets aabning hen til flammen. */
    S.tegnPil = function (ctx, fra, tid) {
        var til = { x: S.TAEND.x, y: S.TAEND.y + 8 };
        var kx = (fra.x + til.x) / 2, ky = Math.min(fra.y, til.y) - 110;
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.85)";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 9]);
        ctx.lineDashOffset = -tid * 40;
        ctx.beginPath();
        ctx.moveTo(fra.x + 44, fra.y - 60);
        ctx.quadraticCurveTo(kx, ky, til.x - 34, til.y - 6);
        ctx.stroke();
        ctx.setLineDash([]);
        var v = Math.atan2(til.y - 6 - ky, til.x - 34 - kx);
        ctx.fillStyle = "rgba(242, 197, 61, 0.95)";
        ctx.beginPath();
        ctx.moveTo(til.x - 34 + Math.cos(v) * 6, til.y - 6 + Math.sin(v) * 6);
        ctx.lineTo(til.x - 34 + Math.cos(v + 2.5) * 14, til.y - 6 + Math.sin(v + 2.5) * 14);
        ctx.lineTo(til.x - 34 + Math.cos(v - 2.5) * 14, til.y - 6 + Math.sin(v - 2.5) * 14);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    /* ================================================================
       BOBLER OG KNALDET
       ================================================================ */
    S.tegnBobler = function (ctx, bobler) {
        ctx.save();
        for (var i = 0; i < bobler.length; i++) {
            var b = bobler[i];
            if (b.vent > 0) continue;
            ctx.strokeStyle = "rgba(225, 242, 252, 0.85)";
            ctx.lineWidth = 1.2;
            ctx.fillStyle = "rgba(225, 242, 252, 0.18)";
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Skaar fra et knust glas. iBad: tegn kun dem, der ligger i vandet
       (de tegnes foer vandbadet, saa vandet farver dem), eller kun resten. */
    S.tegnSkaar = function (ctx, liste, iBad) {
        ctx.save();
        ctx.lineJoin = "round";
        for (var i = 0; i < liste.length; i++) {
            var s = liste[i];
            var erIBad = s.x > S.BAD.indreV && s.x < S.BAD.indreH && s.y > S.BAD.overflade;
            if (erIBad !== iBad) continue;
            ctx.save();
            ctx.globalAlpha = NK.klamp(s.alfa, 0, 1);
            ctx.translate(s.x, s.y);
            ctx.rotate(s.a);
            ctx.beginPath();
            ctx.moveTo(s.pts[0].x, s.pts[0].y);
            for (var j = 1; j < s.pts.length; j++) ctx.lineTo(s.pts[j].x, s.pts[j].y);
            ctx.closePath();
            ctx.fillStyle = "rgba(207, 230, 247, 0.2)";
            ctx.fill();
            ctx.strokeStyle = "rgba(226, 242, 252, 0.75)";
            ctx.lineWidth = 1.3;
            ctx.stroke();
            ctx.restore();
        }
        ctx.restore();
    };

    S.tegnKnald = function (ctx, e) {
        var i;
        ctx.save();

        /* Stikflammen ud af aabningen */
        if (e.stik > 0) {
            var L = (30 + 150 * e.styrke) * e.stik;
            var B = (18 + 46 * e.styrke) * e.stik;
            var sg = ctx.createLinearGradient(0, e.y, 0, e.y + L);
            sg.addColorStop(0, "rgba(255, 250, 215, 0.95)");
            sg.addColorStop(0.35, "rgba(255, 190, 70, 0.85)");
            sg.addColorStop(1, "rgba(255, 90, 30, 0)");
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.moveTo(e.x - B * 0.5, e.y);
            ctx.bezierCurveTo(e.x - B, e.y + L * 0.35, e.x - B * 0.3, e.y + L * 0.8, e.x, e.y + L);
            ctx.bezierCurveTo(e.x + B * 0.3, e.y + L * 0.8, e.x + B, e.y + L * 0.35, e.x + B * 0.5, e.y);
            ctx.closePath();
            ctx.fill();
        }

        if (e.blink > 0) {
            NK.skaer(ctx, e.x, e.y, 50 + 300 * e.styrke, "rgba(255, 235, 170, 0.9)", e.blink * (0.35 + 0.65 * e.styrke));
        }

        for (i = 0; i < e.ringe.length; i++) {
            var r = e.ringe[i];
            ctx.globalAlpha = NK.klamp(r.liv, 0, 1) * 0.55;
            ctx.strokeStyle = "#fff3d0";
            ctx.lineWidth = 3 * r.liv + 0.5;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (i = 0; i < e.roeg.length; i++) {
            var p = e.roeg[i];
            ctx.globalAlpha = NK.klamp(p.liv, 0, 1) * 0.28;
            ctx.fillStyle = "#dfe6ee";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (i = 0; i < e.gnister.length; i++) {
            var gn = e.gnister[i];
            ctx.globalAlpha = NK.klamp(gn.liv, 0, 1);
            ctx.fillStyle = gn.farve;
            ctx.beginPath();
            ctx.arc(gn.x, gn.y, gn.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (i = 0; i < e.draaber.length; i++) {
            var d = e.draaber[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.9;
            ctx.fillStyle = "rgba(160, 210, 240, 0.9)";
            ctx.beginPath();
            ctx.ellipse(d.x, d.y, 2, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };
}());

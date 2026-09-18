/* =====================================================================
   apparat.js - selve opstillingen, tegnet i canvas

   Alle figurer er lavet her i koden: stativ, buret med hane og
   inddeling, bægerglas paa magnetomroerer, pH-elektrode og pH-meter.
   Der er ingen billedfiler.

   Alt tegnes i et fast "tegnebord" paa 520 x 680 enheder, som skaleres
   og centreres i det laerred, der nu er. Saa ser opstillingen ens ud i
   alle vinduesstoerrelser, og koordinaterne nedenfor kan laeses som en
   tegning.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Apparat = {};
    NK.Apparat = Apparat;

    var BREDDE = 520;
    var HOEJDE = 680;

    Apparat.BREDDE = BREDDE;
    Apparat.HOEJDE = HOEJDE;

    /* --- Buretten ---------------------------------------------------- */
    var B_MIDT = 182;          /* midterlinje */
    var B_HALV = 14;           /* halv udvendig bredde af roeret */
    var B_TOP = 84;            /* roerets top */
    var B_SKALA_TOP = 100;     /* 0 paa inddelingen */
    var B_SKALA_BUND = 388;    /* kapaciteten paa inddelingen */
    var B_KEGLE = 402;         /* her begynder keglen ned mod hanen */
    var B_HANE = 420;          /* hanens overkant */
    var B_SPIDS = 444;         /* spidsens overkant */
    var B_DRYP = 478;          /* her slipper draaben */

    /* --- Baegerglasset ----------------------------------------------- */
    var G_VENSTRE = 140;
    var G_HOEJRE = 312;
    var G_TOP = 470;
    var G_BUND = 612;
    var G_VAEG = 5;
    var G_KAPACITET = 250;     /* mL ved kanten, hvis intet andet er sagt */
    var G_INDRE_BUND = G_BUND - G_VAEG - 2;
    var G_INDRE_TOP = G_TOP + 10;

    Apparat.dryphoejde = B_DRYP;
    Apparat.drypX = B_MIDT;

    /* Vaeskeoverfladens hoejde for et rumfang i mL.
       Glasset skaleres efter forsoeget: et 20 mL proevemaal i et
       rigtigt 250 mL baegerglas ville vaere en stribe i bunden, og saa
       kunne man ikke se niveauet stige undervejs. Maalestregerne paa
       glasset viser stadig rigtige mL. */
    Apparat.overflade = function (mL, kapacitet) {
        var f = NK.klamp(mL / (kapacitet || G_KAPACITET), 0.04, 1);
        return G_INDRE_BUND - f * (G_INDRE_BUND - G_INDRE_TOP);
    };

    /* Omregner en position paa tegnebordet til laerredets pixels.
       Bruges af musen, hvis der senere skal klikkes paa hanen. */
    Apparat.skala = function (b, h) {
        var s = Math.min(b / BREDDE, h / HOEJDE);
        return { s: s, dx: (b - BREDDE * s) / 2, dy: (h - HOEJDE * s) / 2 };
    };

    /* Hvor tit skal buretten have en talmaerket streg, og hvor tit en
       lille imellem? Valgt saa det matcher rigtige bureter i hver
       stoerrelse - en 30 mL buret har tal for hver 5 mL og streg for
       hver 1 mL, en 250 mL for hver 25 hhv. 5 mL, og saa videre. */
    function buretTrin(kap) {
        if (kap <= 50) return { label: 5, minor: 1 };
        if (kap <= 100) return { label: 10, minor: 2 };
        if (kap <= 250) return { label: 25, minor: 5 };
        return { label: 50, minor: 10 };
    }

    /* ----- Smaa tegnehjaelpere --------------------------------------- */
    function glasFyld(ctx, x0, y0, x1, y1) {
        var g = ctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, "rgba(226, 240, 250, 0.10)");
        g.addColorStop(0.35, "rgba(226, 240, 250, 0.05)");
        g.addColorStop(1, "rgba(180, 205, 225, 0.13)");
        return g;
    }

    function glaskant(ctx, bredde) {
        ctx.strokeStyle = "rgba(198, 222, 240, 0.6)";
        ctx.lineWidth = bredde || 1.6;
        ctx.stroke();
    }

    /* Lodret hvid stribe, der faar glasset til at se rundt ud. */
    function genskin(ctx, x, y0, y1, bredde, styrke) {
        var g = ctx.createLinearGradient(x - bredde, 0, x + bredde, 0);
        g.addColorStop(0, "rgba(255, 255, 255, 0)");
        g.addColorStop(0.5, "rgba(255, 255, 255, " + (styrke || 0.28) + ")");
        g.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - bredde, y0, bredde * 2, y1 - y0);
    }

    function maerkat(ctx, tekst, x, y, farve, justering) {
        ctx.font = "700 12px 'Segoe UI', sans-serif";
        var w = ctx.measureText(tekst).width + 16;
        var vx = justering === "hoejre" ? x - w : (justering === "midt" ? x - w / 2 : x);
        NK.rundtRekt(ctx, vx, y - 10, w, 21, 5);
        ctx.fillStyle = "rgba(16, 18, 24, 0.82)";
        ctx.fill();
        ctx.strokeStyle = farve;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        NK.tekst(ctx, tekst, vx + 8, y + 0.5, {
            font: "700 12px 'Segoe UI', sans-serif",
            linje: "middle", farve: farve
        });
        return w;
    }

    /* ================================================================
       BAGGRUND: bordplade og vaeg
       ================================================================ */
    function tegnBaggrund(ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, HOEJDE);
        g.addColorStop(0, "#191a22");
        g.addColorStop(0.62, "#20222c");
        g.addColorStop(0.64, "#2a2d39");
        g.addColorStop(1, "#1a1c24");
        ctx.fillStyle = g;
        ctx.fillRect(-400, -200, BREDDE + 800, HOEJDE + 400);

        /* Bordplade */
        ctx.fillStyle = "#33374a";
        ctx.fillRect(-400, 646, BREDDE + 800, 8);
        ctx.fillStyle = "#232633";
        ctx.fillRect(-400, 654, BREDDE + 800, HOEJDE);

        /* Blødt lys bag opstillingen */
        var r = ctx.createRadialGradient(226, 420, 20, 226, 420, 340);
        r.addColorStop(0, "rgba(120, 160, 200, 0.10)");
        r.addColorStop(1, "rgba(120, 160, 200, 0)");
        ctx.fillStyle = r;
        ctx.fillRect(-400, -200, BREDDE + 800, HOEJDE + 400);
    }

    /* ================================================================
       STATIV MED KLEMME
       ================================================================ */
    function tegnStativ(ctx) {
        /* Fod */
        NK.rundtRekt(ctx, 14, 604, 124, 20, 5);
        var g = ctx.createLinearGradient(0, 604, 0, 624);
        g.addColorStop(0, "#5c6274");
        g.addColorStop(1, "#343846");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "#22252f";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        /* Stang */
        NK.rundtRekt(ctx, 40, 92, 14, 514, 3);
        var s = ctx.createLinearGradient(40, 0, 54, 0);
        s.addColorStop(0, "#414659");
        s.addColorStop(0.4, "#6e7488");
        s.addColorStop(1, "#3a3e4e");
        ctx.fillStyle = s;
        ctx.fill();

        /* Klemme */
        NK.rundtRekt(ctx, 48, 196, 118, 15, 4);
        var k = ctx.createLinearGradient(0, 196, 0, 211);
        k.addColorStop(0, "#666c80");
        k.addColorStop(1, "#3a3e4e");
        ctx.fillStyle = k;
        ctx.fill();
        ctx.strokeStyle = "#252833";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        /* Kæbe om buretten */
        NK.rundtRekt(ctx, 158, 188, 26, 32, 6);
        ctx.fillStyle = "#4a4f61";
        ctx.fill();
        ctx.stroke();

        /* Skrue */
        ctx.beginPath();
        ctx.arc(58, 203, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#7b8199";
        ctx.fill();
        ctx.strokeStyle = "#2b2e39";
        ctx.stroke();
    }

    /* ================================================================
       BURETTEN
       ================================================================ */
    function tegnBuret(ctx, s) {
        var kap = s.kapacitet || 50;
        var i;

        /* Selve roeret */
        ctx.beginPath();
        ctx.moveTo(B_MIDT - B_HALV, B_TOP);
        ctx.lineTo(B_MIDT - B_HALV, B_KEGLE);
        ctx.lineTo(B_MIDT - 5, B_HANE);
        ctx.lineTo(B_MIDT + 5, B_HANE);
        ctx.lineTo(B_MIDT + B_HALV, B_KEGLE);
        ctx.lineTo(B_MIDT + B_HALV, B_TOP);
        ctx.closePath();
        ctx.fillStyle = glasFyld(ctx, B_MIDT - B_HALV, 0, B_MIDT + B_HALV, 0);
        ctx.fill();

        /* Vaesken i buretten: fra meniskens hoejde og ned */
        var brok = NK.klamp(s.V / kap, 0, 1);
        var menisk = B_SKALA_TOP + brok * (B_SKALA_BUND - B_SKALA_TOP);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(B_MIDT - B_HALV + 2, B_TOP);
        ctx.lineTo(B_MIDT - B_HALV + 2, B_KEGLE);
        ctx.lineTo(B_MIDT - 4, B_HANE);
        ctx.lineTo(B_MIDT + 4, B_HANE);
        ctx.lineTo(B_MIDT + B_HALV - 2, B_KEGLE);
        ctx.lineTo(B_MIDT + B_HALV - 2, B_TOP);
        ctx.closePath();
        ctx.clip();
        var v = ctx.createLinearGradient(B_MIDT - B_HALV, 0, B_MIDT + B_HALV, 0);
        v.addColorStop(0, "rgba(150, 205, 240, 0.55)");
        v.addColorStop(0.4, "rgba(205, 235, 250, 0.75)");
        v.addColorStop(1, "rgba(120, 175, 215, 0.6)");
        ctx.fillStyle = v;
        ctx.fillRect(B_MIDT - B_HALV, menisk, B_HALV * 2, B_HANE - menisk + 2);
        /* Menisk: en lille bue, som man aflaeser bunden af */
        ctx.beginPath();
        ctx.moveTo(B_MIDT - B_HALV, menisk - 4);
        ctx.quadraticCurveTo(B_MIDT, menisk + 5, B_MIDT + B_HALV, menisk - 4);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.restore();

        /* Inddeling: 0 foroven, kapaciteten forneden. Talmaerkerne staar
           paa runde mL-tal (5, 10, 25 ...), ikke paa en brøkdel af
           kapaciteten - saa de er til at laese, uanset hvor stor
           buretten er. */
        var t = buretTrin(kap);
        ctx.textBaseline = "middle";
        for (i = 0; i * t.minor <= kap + 1e-9; i++) {
            var mL = i * t.minor;
            var y = B_SKALA_TOP + (mL / kap) * (B_SKALA_BUND - B_SKALA_TOP);
            var lang = (mL % t.label === 0);
            ctx.beginPath();
            ctx.moveTo(B_MIDT + B_HALV - (lang ? 11 : 6), y);
            ctx.lineTo(B_MIDT + B_HALV - 1, y);
            ctx.strokeStyle = lang ? "rgba(230, 242, 252, 0.85)" : "rgba(210, 230, 245, 0.45)";
            ctx.lineWidth = lang ? 1.3 : 0.9;
            ctx.stroke();
            if (lang) {
                NK.tekst(ctx, NK.tal(mL, 0), B_MIDT - B_HALV - 4, y, {
                    font: "600 10px 'Segoe UI', sans-serif",
                    justering: "right", linje: "middle",
                    farve: "rgba(215, 232, 245, 0.85)"
                });
            }
        }

        genskin(ctx, B_MIDT - 7, B_TOP + 4, B_KEGLE, 3, 0.22);
        ctx.beginPath();
        ctx.moveTo(B_MIDT - B_HALV, B_TOP);
        ctx.lineTo(B_MIDT - B_HALV, B_KEGLE);
        ctx.lineTo(B_MIDT - 5, B_HANE);
        ctx.lineTo(B_MIDT + 5, B_HANE);
        ctx.lineTo(B_MIDT + B_HALV, B_KEGLE);
        ctx.lineTo(B_MIDT + B_HALV, B_TOP);
        glaskant(ctx, 1.6);

        /* Aabning foroven */
        ctx.beginPath();
        ctx.ellipse(B_MIDT, B_TOP, B_HALV, 4.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200, 225, 245, 0.35)";
        ctx.fill();
        glaskant(ctx, 1.4);

        /* Hanen */
        NK.rundtRekt(ctx, B_MIDT - 23, B_HANE, 46, 24, 6);
        var h = ctx.createLinearGradient(0, B_HANE, 0, B_HANE + 24);
        h.addColorStop(0, "rgba(226, 240, 250, 0.3)");
        h.addColorStop(1, "rgba(150, 180, 205, 0.25)");
        ctx.fillStyle = h;
        ctx.fill();
        glaskant(ctx, 1.5);

        /* Grebet drejer, naar hanen er aaben */
        ctx.save();
        ctx.translate(B_MIDT, B_HANE + 12);
        ctx.rotate(s.aaben ? Math.PI / 2 : 0);
        NK.rundtRekt(ctx, -6, -24, 12, 48, 5);
        ctx.fillStyle = s.aaben ? "#3fae72" : "#8d94a8";
        ctx.fill();
        ctx.strokeStyle = "rgba(12, 14, 20, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#cdd4e2";
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        /* Spidsen */
        ctx.beginPath();
        ctx.moveTo(B_MIDT - 5, B_HANE + 24);
        ctx.lineTo(B_MIDT - 4, B_SPIDS + 22);
        ctx.lineTo(B_MIDT - 2.2, B_DRYP);
        ctx.lineTo(B_MIDT + 2.2, B_DRYP);
        ctx.lineTo(B_MIDT + 4, B_SPIDS + 22);
        ctx.lineTo(B_MIDT + 5, B_HANE + 24);
        ctx.closePath();
        ctx.fillStyle = "rgba(210, 232, 248, 0.22)";
        ctx.fill();
        glaskant(ctx, 1.3);

        /* Aflaesning ud for menisken */
        ctx.save();
        maerkat(ctx, NK.tal(s.V, 2) + " mL", B_MIDT + B_HALV + 10, menisk, "#f2c53d");
        ctx.restore();

        /* Hvad staar der i buretten - over roeret, saa den aldrig
           lander oven i aflaesningen ved menisken */
        if (s.titratorNavn) {
            maerkat(ctx, s.titratorNavn, B_MIDT, B_TOP - 30, "#7fc4f2", "midt");
        }
    }

    /* ================================================================
       BAEGERGLAS MED VAESKE
       ================================================================ */
    function baegerSti(ctx, indre) {
        var m = indre ? G_VAEG : 0;
        var x0 = G_VENSTRE + m, x1 = G_HOEJRE - m;
        var y0 = G_TOP + (indre ? 8 : 0), y1 = G_BUND - m;
        var r = 12;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x0, y1 - r);
        ctx.quadraticCurveTo(x0, y1, x0 + r, y1);
        ctx.lineTo(x1 - r, y1);
        ctx.quadraticCurveTo(x1, y1, x1, y1 - r);
        ctx.lineTo(x1, y0);
    }

    function tegnBaeger(ctx, s) {
        var i;

        /* Glasset bagfra */
        baegerSti(ctx, false);
        ctx.closePath();
        ctx.fillStyle = glasFyld(ctx, G_VENSTRE, 0, G_HOEJRE, 0);
        ctx.fill();

        /* Vaesken */
        var kap = s.glasKapacitet || G_KAPACITET;
        var overflade = Apparat.overflade(s.rumfang, kap);
        ctx.save();
        baegerSti(ctx, true);
        ctx.closePath();
        ctx.clip();

        /* Hvid bund under farven, saa indikatorfarven staar rigtigt */
        ctx.fillStyle = "rgba(236, 243, 248, 0.93)";
        ctx.fillRect(G_VENSTRE, overflade, G_HOEJRE - G_VENSTRE, G_BUND - overflade);
        if (s.farve) {
            ctx.fillStyle = NK.Kemi.rgba(s.farve, 0.92);
            ctx.fillRect(G_VENSTRE, overflade, G_HOEJRE - G_VENSTRE, G_BUND - overflade);
        }

        /* Skyer af netop tilsat titrator - det lokale farveglimt */
        for (i = 0; s.skyer && i < s.skyer.length; i++) {
            var sky = s.skyer[i];
            var g = ctx.createRadialGradient(sky.x, sky.y, 1, sky.x, sky.y, sky.r);
            g.addColorStop(0, NK.Kemi.rgba(sky.farve, sky.styrke));
            g.addColorStop(1, NK.Kemi.rgba(sky.farve, 0));
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(sky.x, sky.y, sky.r, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Hvirvler fra magnetomroereren */
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = "#2a3540";
        ctx.lineWidth = 1.6;
        for (i = 0; i < 3; i++) {
            var rr = 18 + i * 15;
            ctx.beginPath();
            ctx.ellipse(226, G_INDRE_BUND - 16, rr, rr * 0.28,
                Math.sin(s.omroering * 0.7 + i) * 0.12, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        /* Tragten i midten, naar der roeres rundt */
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(226, overflade + 5, 30, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fill();
        ctx.restore();

        /* Overfladen */
        ctx.beginPath();
        ctx.ellipse(226, overflade, (G_HOEJRE - G_VENSTRE) / 2 - G_VAEG, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
        ctx.fill();

        /* Ringe, hvor draaberne ramte */
        for (i = 0; s.ringe && i < s.ringe.length; i++) {
            var ring = s.ringe[i];
            ctx.beginPath();
            ctx.ellipse(ring.x, overflade, ring.r, ring.r * 0.3, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 255, 255, " + ring.styrke.toFixed(3) + ")";
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }
        ctx.restore();

        /* Magnetstaven paa bunden - bredden skifter, saa den ser ud
           til at dreje rundt */
        ctx.save();
        var bred = Math.abs(Math.cos(s.omroering)) * 30 + 6;
        NK.rundtRekt(ctx, 226 - bred / 2, G_INDRE_BUND - 12, bred, 9, 4.5);
        ctx.fillStyle = "#e6eaf2";
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 50, 60, 0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        /* Glasset forfra: kant, inddeling og genskin */
        baegerSti(ctx, false);
        glaskant(ctx, 2);

        /* Haeldetud */
        ctx.beginPath();
        ctx.moveTo(G_VENSTRE, G_TOP + 2);
        ctx.quadraticCurveTo(G_VENSTRE - 11, G_TOP - 3, G_VENSTRE - 3, G_TOP - 11);
        ctx.strokeStyle = "rgba(198, 222, 240, 0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Maalestreger paa glasset - rigtige mL, uanset skaleringen */
        var streg = NK.paenTrin(kap / 4);
        for (i = 1; i * streg < kap * 0.99; i++) {
            var mL = i * streg;
            var y = Apparat.overflade(mL, kap);
            ctx.beginPath();
            ctx.moveTo(G_VENSTRE + G_VAEG + 4, y);
            ctx.lineTo(G_VENSTRE + G_VAEG + (i % 2 === 0 ? 26 : 16), y);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            if (i % 2 === 0) {
                NK.tekst(ctx, NK.tal(mL, streg < 1 ? 1 : 0), G_VENSTRE + G_VAEG + 30, y, {
                    font: "600 9px 'Segoe UI', sans-serif",
                    linje: "middle", farve: "rgba(255, 255, 255, 0.5)"
                });
            }
        }

        genskin(ctx, G_VENSTRE + 16, G_TOP + 12, G_BUND - 12, 5, 0.20);
        genskin(ctx, G_HOEJRE - 14, G_TOP + 12, G_BUND - 12, 3, 0.12);

        /* Kanten foroven */
        ctx.beginPath();
        ctx.ellipse(226, G_TOP, (G_HOEJRE - G_VENSTRE) / 2, 8, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(214, 234, 248, 0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    /* ================================================================
       MAGNETOMROERER
       ================================================================ */
    function tegnOmroerer(ctx, s) {
        NK.rundtRekt(ctx, 118, 612, 216, 36, 7);
        var g = ctx.createLinearGradient(0, 612, 0, 648);
        g.addColorStop(0, "#d8dce6");
        g.addColorStop(0.18, "#aeb5c6");
        g.addColorStop(1, "#5d6376");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "#2b2f3b";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        /* Pladen */
        ctx.beginPath();
        ctx.ellipse(226, 616, 74, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#c3c9d8";
        ctx.fill();

        /* Drejeknap */
        ctx.save();
        ctx.translate(306, 630);
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#3b4050";
        ctx.fill();
        ctx.strokeStyle = "#20242e";
        ctx.stroke();
        ctx.rotate(s.omroering * 0.25);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -8);
        ctx.strokeStyle = "#f2c53d";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        /* Lampe */
        ctx.beginPath();
        ctx.arc(140, 630, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#3fae72";
        ctx.fill();
        ctx.shadowColor = "rgba(63, 174, 114, 0.8)";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        NK.tekst(ctx, "MAGNETOMRØRER", 158, 632, {
            font: "700 8px 'Segoe UI', sans-serif",
            linje: "middle", farve: "rgba(30, 34, 44, 0.7)"
        });
    }

    /* ================================================================
       ELEKTRODE OG pH-METER
       ================================================================ */
    function tegnElektrode(ctx, s) {
        var oeverst = 424, nederst = 584;
        var xTop = 268, xBund = 262;

        /* Ledning op til maaleren */
        ctx.beginPath();
        ctx.moveTo(xTop, oeverst + 4);
        ctx.bezierCurveTo(300, 400, 320, 396, 352, 392);
        ctx.strokeStyle = "#20242e";
        ctx.lineWidth = 4.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.strokeStyle = "#454b5c";
        ctx.lineWidth = 2;
        ctx.stroke();

        /* Selve staven */
        ctx.beginPath();
        ctx.moveTo(xTop - 7, oeverst);
        ctx.lineTo(xBund - 6, nederst);
        ctx.lineTo(xBund + 6, nederst);
        ctx.lineTo(xTop + 7, oeverst);
        ctx.closePath();
        var g = ctx.createLinearGradient(xTop - 7, 0, xTop + 7, 0);
        g.addColorStop(0, "rgba(180, 200, 220, 0.35)");
        g.addColorStop(0.4, "rgba(240, 248, 255, 0.5)");
        g.addColorStop(1, "rgba(150, 175, 200, 0.35)");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 222, 240, 0.6)";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        /* Hoved med kabelsko */
        NK.rundtRekt(ctx, xTop - 10, oeverst - 20, 20, 22, 4);
        ctx.fillStyle = "#3b4050";
        ctx.fill();
        ctx.strokeStyle = "#20242e";
        ctx.stroke();

        /* Glaspaeren */
        ctx.beginPath();
        ctx.arc(xBund, nederst + 5, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(226, 240, 250, 0.55)";
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 222, 240, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xBund - 3, nederst + 2, 2.6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.fill();
    }

    function tegnPHmeter(ctx, s) {
        var x = 348, y = 286, b = 158, h = 112;

        NK.rundtRekt(ctx, x, y, b, h, 9);
        var g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, "#454b5e");
        g.addColorStop(1, "#262a36");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "#191c25";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        /* Display */
        NK.rundtRekt(ctx, x + 12, y + 12, b - 24, 56, 5);
        ctx.fillStyle = "#0e1a14";
        ctx.fill();
        ctx.strokeStyle = "#0a0d12";
        ctx.stroke();

        var tekst = isFinite(s.pH) ? NK.tal(NK.klamp(s.pH, -1.99, 15.99), 2) : "--,--";
        NK.tekst(ctx, tekst, x + b - 20, y + 44, {
            font: "700 30px 'Cascadia Mono', Consolas, monospace",
            justering: "right", linje: "alphabetic",
            farve: "#6ef2a8"
        });
        NK.tekst(ctx, "pH", x + 22, y + 44, {
            font: "700 15px 'Segoe UI', sans-serif",
            farve: "rgba(110, 242, 168, 0.65)"
        });
        NK.tekst(ctx, "25,0 °C", x + b - 20, y + 62, {
            font: "600 9px 'Cascadia Mono', Consolas, monospace",
            justering: "right", farve: "rgba(110, 242, 168, 0.5)"
        });

        /* Et lille maerkat under displayet - ingen knapper. Instrumentet
           skal se ud som noget, man laeser af, ikke noget, man klikker
           paa. */
        NK.tekst(ctx, "pH-METER", x + b / 2, y + 90, {
            font: "700 9px 'Segoe UI', sans-serif",
            justering: "center", farve: "rgba(255, 255, 255, 0.25)"
        });
    }

    /* ================================================================
       DRAABER
       ================================================================ */
    function tegnDraaber(ctx, s) {
        if (!s.draaber) return;
        for (var i = 0; i < s.draaber.length; i++) {
            var d = s.draaber[i];
            var r = d.r || 4;
            ctx.beginPath();
            ctx.moveTo(d.x, d.y - r * 1.7);
            ctx.quadraticCurveTo(d.x + r, d.y - r * 0.4, d.x + r, d.y);
            ctx.arc(d.x, d.y, r, 0, Math.PI);
            ctx.quadraticCurveTo(d.x - r, d.y - r * 0.4, d.x, d.y - r * 1.7);
            ctx.closePath();
            var g = ctx.createLinearGradient(d.x - r, d.y - r, d.x + r, d.y + r);
            g.addColorStop(0, "rgba(235, 248, 255, 0.95)");
            g.addColorStop(1, "rgba(150, 195, 230, 0.85)");
            ctx.fillStyle = g;
            ctx.fill();
        }
    }

    /* ================================================================
       SAMLET TEGNING
       ================================================================ */
    /* s = { V, kapacitet, rumfang, pH, farve, aaben, omroering,
            draaber, ringe, skyer, titratorNavn, proeveNavn } */
    Apparat.tegn = function (ctx, b, h, s) {
        var m = Apparat.skala(b, h);
        ctx.save();
        ctx.translate(m.dx, m.dy);
        ctx.scale(m.s, m.s);

        tegnBaggrund(ctx);
        tegnStativ(ctx);
        tegnPHmeter(ctx, s);
        tegnBuret(ctx, s);
        tegnDraaber(ctx, s);
        tegnOmroerer(ctx, s);
        tegnBaeger(ctx, s);
        tegnElektrode(ctx, s);

        /* Navneskilt under bordet */
        if (s.proeveNavn) {
            maerkat(ctx, s.proeveNavn, 226, 668, "#7ee0a8", "midt");
        }

        ctx.restore();
    };
}());

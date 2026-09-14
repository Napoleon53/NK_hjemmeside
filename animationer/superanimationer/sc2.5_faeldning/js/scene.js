/* =====================================================================
   scene.js - udsnittet af bordet, tegnet paa et fast tegnebord

   Alt tegnes paa et tegnebord paa 1000 x 600 enheder, som skaleres og
   centreres i laerredet. Draabeflasker, stativ, plastlomme, lup og
   køkkenrulle er SVG-filer i sprites/. Skemaet paa papiret, væsken i
   flaskerne, draaberne, bundfaldet og zoomcirklen tegnes her.

   Filen indeholder kun maal og tegning. Tilstanden ligger i forsoeg.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = {};
    NK.Scene = S;

    S.BREDDE = 1000;
    S.HOEJDE = 600;

    /* ----- Draabeflasken (lokale koordinater i draabeflaske.svg) ------ */
    S.FLASKE = {
        B: 60, H: 150,
        SPIDS: { x: 30, y: 2 },
        VAESKE: { x0: 9, x1: 51, y0: 66, y1: 143 },
        NIVEAU: 80,
        ETIKET: { x: 30, y: 109, b: 40 }
    };

    /* ----- Stativet (stativ.svg er 600 x 56) -------------------------- */
    S.STATIV = { x: 30, y: 150, b: 600, h: 56, etiketY: 35 };
    S.PLADSER = [55, 133, 211, 311, 389, 467, 545];
    S.FLASKE_TOP = 14;

    /* Hvor flaske nr. i staar i stativet (spidsens position). */
    S.hjem = function (i) {
        return { x: S.STATIV.x + S.PLADSER[i], y: S.FLASKE_TOP + S.FLASKE.SPIDS.y };
    };

    /* ----- Plastlommen og skemaet ------------------------------------- */
    S.LOMME = { x: 22, y: 214, b: 616, h: 382 };
    S.SKEMA = { x0: 66, x1: 618, y0: 232, y1: 578, hovedB: 120, hovedH: 40 };
    S.SKEMA.cellB = (S.SKEMA.x1 - S.SKEMA.x0 - S.SKEMA.hovedB) / D.SOEJLER.length;
    S.SKEMA.cellH = (S.SKEMA.y1 - S.SKEMA.y0 - S.SKEMA.hovedH) / D.RAEKKER.length;

    S.felt = function (nr) {
        var f = D.FELTER[nr], K = S.SKEMA;
        var x = K.x0 + K.hovedB + f.c * K.cellB;
        var y = K.y0 + K.hovedH + f.r * K.cellH;
        return { x: x, y: y, b: K.cellB, h: K.cellH, cx: x + K.cellB / 2, cy: y + K.cellH / 2 };
    };

    S.feltVed = function (p) {
        var K = S.SKEMA;
        var c = Math.floor((p.x - K.x0 - K.hovedB) / K.cellB);
        var r = Math.floor((p.y - K.y0 - K.hovedH) / K.cellH);
        if (c < 0 || r < 0 || c >= D.SOEJLER.length || r >= D.RAEKKER.length) return -1;
        return r * D.SOEJLER.length + c;
    };

    /* Flasken holdes saa hoejt over feltet, at draaben kan ses falde. */
    S.OVER_FELT = 46;

    /* ----- Luppen og zoomcirklen ----------------------------------------- */
    S.LUP = { B: 128, H: 128, LINSE: { x: 46.4, y: 46.4, r: 33.6 }, FORSTOER: 1.8 };
    S.LUP_HVILE = { x: 782, y: 522 };
    S.ZOOM = { x: 815, y: 288, r: 148 };
    S.PAPIR = { B: 96, H: 67 };

    S.FARVE_VAND = [205, 222, 240];

    /* Omregner mellem laerredets pixels og tegnebordet. */
    S.skala = function (b, h) {
        var s = Math.min(b / S.BREDDE, h / S.HOEJDE);
        return { s: s, dx: (b - S.BREDDE * s) / 2, dy: (h - S.HOEJDE * s) / 2 };
    };

    /* ================================================================
       BORDET
       ================================================================ */
    S.tegnBaggrund = function (ctx) {
        var g = ctx.createLinearGradient(0, 0, 0, S.HOEJDE);
        g.addColorStop(0, "#1c1f26");
        g.addColorStop(1, "#23262e");
        ctx.fillStyle = g;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.HOEJDE + 4000);

        var lys = ctx.createRadialGradient(420, 330, 40, 420, 330, 620);
        lys.addColorStop(0, "rgba(130, 165, 205, 0.1)");
        lys.addColorStop(1, "rgba(130, 165, 205, 0)");
        ctx.fillStyle = lys;
        ctx.fillRect(-2000, -2000, S.BREDDE + 4000, S.HOEJDE + 4000);

        /* Svage striber i bordpladen */
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
        ctx.lineWidth = 1;
        for (var y = 8; y < S.HOEJDE; y += 23) {
            ctx.beginPath();
            ctx.moveTo(-40, y);
            ctx.bezierCurveTo(300, y + 6, 700, y - 6, 1040, y + 3);
            ctx.stroke();
        }
        ctx.restore();

        /* Skygger under lommen og stativet */
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.filter = "blur(6px)";
        ctx.fillRect(S.LOMME.x + 6, S.LOMME.y + 8, S.LOMME.b, S.LOMME.h);
        ctx.fillRect(S.STATIV.x + 4, S.STATIV.y + 10, S.STATIV.b, S.STATIV.h);
        ctx.restore();
    };

    /* ================================================================
       LOMMEN MED SKEMAET
       fremhaev: { felt, soejle, raekke } - hvad der skal lyse op
       ================================================================ */
    S.tegnLomme = function (ctx, fremhaev) {
        var L = S.LOMME, K = S.SKEMA;
        var i;
        fremhaev = fremhaev || {};
        NK.Sprites.tegn(ctx, "lomme", L.x, L.y, L.b, L.h, "#2a2e37");

        /* Den søjle og række, der passer til flasken i haanden */
        ctx.save();
        ctx.fillStyle = "rgba(242, 197, 61, 0.1)";
        if (fremhaev.soejle >= 0) {
            ctx.fillRect(K.x0 + K.hovedB + fremhaev.soejle * K.cellB, K.y0, K.cellB, K.y1 - K.y0);
        }
        if (fremhaev.raekke >= 0) {
            ctx.fillRect(K.x0, K.y0 + K.hovedH + fremhaev.raekke * K.cellH, K.x1 - K.x0, K.cellH);
        }
        ctx.restore();

        /* Stregerne */
        ctx.save();
        ctx.strokeStyle = "rgba(232, 238, 244, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.rect(K.x0, K.y0, K.x1 - K.x0, K.y1 - K.y0);
        for (i = 0; i <= D.SOEJLER.length; i++) {
            var x = K.x0 + K.hovedB + i * K.cellB;
            ctx.moveTo(x, K.y0);
            ctx.lineTo(x, K.y1);
        }
        for (i = 0; i <= D.RAEKKER.length; i++) {
            var y = K.y0 + K.hovedH + i * K.cellH;
            ctx.moveTo(K.x0, y);
            ctx.lineTo(K.x1, y);
        }
        ctx.moveTo(K.x0, K.y0);
        ctx.lineTo(K.x0 + K.hovedB, K.y0 + K.hovedH);
        ctx.stroke();
        ctx.restore();

        /* Formlerne i kanten */
        D.SOEJLER.forEach(function (id, c) {
            NK.tekst(ctx, D.opl(id).formel, K.x0 + K.hovedB + (c + 0.5) * K.cellB, K.y0 + K.hovedH / 2 + 1, {
                str: 16, vaegt: 700, justering: "center", linje: "middle",
                farve: fremhaev.soejle === c ? "#ffe08a" : "#eef2f6"
            });
        });
        D.RAEKKER.forEach(function (id, r) {
            NK.tekst(ctx, D.opl(id).formel, K.x0 + K.hovedB / 2, K.y0 + K.hovedH + (r + 0.5) * K.cellH + 1, {
                str: 16, vaegt: 700, justering: "center", linje: "middle",
                farve: fremhaev.raekke === r ? "#ffe08a" : "#eef2f6"
            });
        });

        /* Feltet under musen eller tastaturets markoer */
        [fremhaev.felt, fremhaev.markoer].forEach(function (nr, n) {
            if (!(nr >= 0)) return;
            var f = S.felt(nr);
            ctx.save();
            ctx.strokeStyle = n === 0 ? "rgba(242, 197, 61, 0.9)" : "rgba(61, 158, 224, 0.95)";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 5]);
            NK.rundtRekt(ctx, f.x + 4, f.y + 4, f.b - 8, f.h - 8, 6);
            ctx.stroke();
            ctx.restore();
        });
    };

    /* ================================================================
       EN DRAABE PAA FOLIEN
       d: { x, y, r, vaeske (rgb), vaeskeAlfa, bundfald (info), grad (0-1),
            froe, bobl }
       ================================================================ */
    S.tegnDraabe = function (ctx, d) {
        if (d.r <= 0.5) return;
        var x = d.x, y = d.y, r = d.r;
        var i;
        ctx.save();

        /* Skygge paa folien */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(x + 2, y + 3, r * 1.02, r * 0.98, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Selve væsken */
        var v = d.vaeske || S.FARVE_VAND;
        var farvet = !!d.vaeske;
        var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, NK.rgba(v, farvet ? 0.32 : 0.08));
        g.addColorStop(0.75, NK.rgba(v, farvet ? 0.5 : 0.16));
        g.addColorStop(1, NK.rgba(v, farvet ? 0.72 : 0.3));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        /* Bundfaldet: uklarhed og smaa korn */
        if (d.bundfald && d.grad > 0) {
            var b = d.bundfald;
            var t = d.grad * (b.taethed || 1);
            var bg = ctx.createRadialGradient(x, y + r * 0.1, r * 0.1, x, y, r * 0.98);
            bg.addColorStop(0, NK.rgba(b.farve, 0.92 * t));
            bg.addColorStop(0.7, NK.rgba(b.farve, 0.78 * t));
            bg.addColorStop(1, NK.rgba(b.farve, 0.45 * t));
            ctx.fillStyle = bg;
            ctx.beginPath();
            ctx.arc(x, y, r * 0.98, 0, Math.PI * 2);
            ctx.fill();

            var rnd = NK.froe(d.froe || 1);
            var antal = Math.round(30 + r * 1.5);
            for (i = 0; i < antal; i++) {
                var vinkel = rnd() * Math.PI * 2, afst = Math.sqrt(rnd()) * r * 0.86;
                var kr = 0.7 + rnd() * 1.5;
                var frem = NK.klamp(d.grad * 1.6 - rnd() * 0.6, 0, 1);
                if (frem <= 0) continue;
                var moerk = rnd() < 0.5 ? 0.82 : 1.06;
                ctx.fillStyle = NK.rgba([
                    Math.min(255, b.farve[0] * moerk), Math.min(255, b.farve[1] * moerk), Math.min(255, b.farve[2] * moerk)
                ], frem * (b.taethed || 1));
                ctx.beginPath();
                ctx.arc(x + Math.cos(vinkel) * afst, y + Math.sin(vinkel) * afst, kr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        /* Kant og lysrefleks */
        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, r - 1.2, 0.2, Math.PI * 1.1);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath();
        ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.15, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.beginPath();
        ctx.ellipse(x + r * 0.42, y + r * 0.38, r * 0.14, r * 0.07, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    /* Draaben, der er paa vej ned fra spidsen */
    S.tegnFaldendeDraabe = function (ctx, d) {
        var v = d.vaeske || S.FARVE_VAND;
        var strak = NK.klamp(d.vy / 900, 0, 0.6);
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.beginPath();
        ctx.moveTo(0, -6 - 8 * strak);
        ctx.bezierCurveTo(2.5, -2, 4.5, 1, 4.5, 3);
        ctx.arc(0, 3, 4.5, 0, Math.PI);
        ctx.bezierCurveTo(-4.5, 1, -2.5, -2, 0, -6 - 8 * strak);
        ctx.closePath();
        ctx.fillStyle = NK.rgba(v, d.vaeske ? 0.8 : 0.45);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.beginPath();
        ctx.arc(-1.5, 2, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    S.tegnPlask = function (ctx, p) {
        ctx.save();
        ctx.globalAlpha = NK.klamp(p.liv, 0, 1) * 0.6;
        ctx.strokeStyle = "#e6f2fb";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    /* ================================================================
       STATIV OG DRAABEFLASKER
       fl: { x, y (spidsen), vinkel, klem (0-1), opl, fremhaev }
       ================================================================ */
    S.tegnStativ = function (ctx) {
        var T = S.STATIV;
        NK.Sprites.tegn(ctx, "stativ", T.x, T.y, T.b, T.h, "#9aa4b0");
        D.OPLOESNINGER.forEach(function (o, i) {
            NK.tekst(ctx, o.formel, T.x + S.PLADSER[i], T.y + T.etiketY + 1, {
                str: 14, vaegt: 700, justering: "center", linje: "middle", farve: "#1d222a", maks: 58
            });
        });
    };

    S.tegnFlaske = function (ctx, fl) {
        var F = S.FLASKE;
        var o = D.opl(fl.opl);
        ctx.save();
        ctx.translate(fl.x, fl.y);
        ctx.rotate(fl.vinkel);
        ctx.translate(-F.SPIDS.x, -F.SPIDS.y);
        if (fl.klem > 0) {
            ctx.translate(F.B / 2, 104);
            ctx.scale(1 - 0.1 * fl.klem, 1 + 0.02 * fl.klem);
            ctx.translate(-F.B / 2, -104);
        }
        if (fl.fremhaev) {
            ctx.shadowColor = "rgba(242, 197, 61, 0.75)";
            ctx.shadowBlur = 18;
        }

        /* Væsken falder mod spidsen, naar flasken vendes */
        var t = (1 - Math.cos(fl.vinkel)) / 2;
        var V = F.VAESKE;
        var top = NK.lerp(F.NIVEAU, V.y0, t);
        var bund = NK.lerp(V.y1, V.y1 - (F.NIVEAU - V.y0), t);
        var farve = o.farve || S.FARVE_VAND;
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.moveTo(V.x0, top);
        ctx.lineTo(V.x1, top);
        ctx.lineTo(V.x1, bund - 4);
        ctx.quadraticCurveTo(V.x1, bund, V.x1 - 4, bund);
        ctx.lineTo(V.x0 + 4, bund);
        ctx.quadraticCurveTo(V.x0, bund, V.x0, bund - 4);
        ctx.closePath();
        ctx.fillStyle = NK.rgba(farve, o.farve ? 0.75 : 0.26);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(V.x0, t < 0.5 ? top : bund - 1.5, V.x1 - V.x0, 1.5);
        ctx.restore();

        NK.Sprites.tegn(ctx, "flaske", 0, 0, F.B, F.H, "#dfe6ee");
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";

        if (Math.abs(Math.sin(fl.vinkel)) < 0.5 && Math.cos(fl.vinkel) > 0) {
            NK.tekst(ctx, o.formel, F.ETIKET.x, F.ETIKET.y, {
                str: 12, vaegt: 700, justering: "center", linje: "middle", farve: "#1d222a", maks: F.ETIKET.b
            });
        }
        ctx.restore();
    };

    /* Formlen paa etiketten, naar flasken er vendt paa hovedet. Den
       skrives lige, saa den kan laeses. */
    S.tegnHaandSkilt = function (ctx, fl) {
        var o = D.opl(fl.opl);
        var afst = S.FLASKE.ETIKET.y - S.FLASKE.SPIDS.y;
        var x = fl.x - Math.sin(fl.vinkel) * afst;
        var y = fl.y + Math.cos(fl.vinkel) * afst;
        NK.tekst(ctx, o.formel, x, y, {
            str: 12, vaegt: 700, justering: "center", linje: "middle", farve: "#1d222a",
            maks: S.FLASKE.ETIKET.b * (1 - 0.1 * fl.klem)
        });
    };

    /* ================================================================
       LUPPEN, KEGLEN OG ZOOMCIRKLEN
       ================================================================ */
    /* indhold(ctx) tegner det, der ligger under linsen. */
    S.tegnLup = function (ctx, lup, indhold) {
        var L = S.LUP;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(lup.x + 6, lup.y + 9, L.LINSE.r + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (indhold && lup.over) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(lup.x, lup.y, L.LINSE.r, 0, Math.PI * 2);
            ctx.clip();
            ctx.translate(lup.x, lup.y);
            ctx.scale(L.FORSTOER, L.FORSTOER);
            ctx.translate(-lup.x, -lup.y);
            indhold(ctx);
            ctx.restore();
        }
        ctx.save();
        if (lup.fremhaev) {
            ctx.shadowColor = "rgba(242, 197, 61, 0.7)";
            ctx.shadowBlur = 16;
        }
        NK.Sprites.tegn(ctx, "lup", lup.x - L.LINSE.x, lup.y - L.LINSE.y, L.B, L.H, "#9fb3c7");
        ctx.restore();
    };

    S.tegnKegle = function (ctx, lup, styrke) {
        var Z = S.ZOOM, rl = S.LUP.LINSE.r + 4;
        var dx = Z.x - lup.x, dy = Z.y - lup.y;
        var l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l, ny = dx / l;
        ctx.save();
        ctx.globalAlpha = styrke;
        ctx.beginPath();
        ctx.moveTo(lup.x + nx * rl, lup.y + ny * rl);
        ctx.lineTo(Z.x + nx * Z.r, Z.y + ny * Z.r);
        ctx.lineTo(Z.x - nx * Z.r, Z.y - ny * Z.r);
        ctx.lineTo(lup.x - nx * rl, lup.y - ny * rl);
        ctx.closePath();
        ctx.fillStyle = "rgba(160, 205, 240, 0.06)";
        ctx.fill();
        ctx.strokeStyle = "rgba(160, 205, 240, 0.3)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(lup.x + nx * rl, lup.y + ny * rl);
        ctx.lineTo(Z.x + nx * Z.r, Z.y + ny * Z.r);
        ctx.moveTo(lup.x - nx * rl, lup.y - ny * rl);
        ctx.lineTo(Z.x - nx * Z.r, Z.y - ny * Z.r);
        ctx.stroke();
        ctx.restore();
    };

    /* mikro: NK.Mikro eller null. titel: teksten under cirklen. */
    S.tegnZoom = function (ctx, mikro, titel, vaeske) {
        var Z = S.ZOOM;
        ctx.save();
        if (!mikro) {
            ctx.strokeStyle = "rgba(200, 215, 230, 0.28)";
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 7]);
            ctx.beginPath();
            ctx.arc(Z.x, Z.y, Z.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            NK.tekst(ctx, "Træk luppen hen over en dråbe", Z.x, Z.y, {
                str: 15, vaegt: 600, justering: "center", linje: "middle", farve: "rgba(200, 210, 222, 0.6)"
            });
            return;
        }

        var g = ctx.createRadialGradient(Z.x - 40, Z.y - 50, 20, Z.x, Z.y, Z.r);
        var v = vaeske || [70, 120, 170];
        g.addColorStop(0, NK.rgba([v[0] * 0.5 + 20, v[1] * 0.5 + 30, v[2] * 0.5 + 45], 1));
        g.addColorStop(1, NK.rgba([v[0] * 0.18 + 10, v[1] * 0.18 + 16, v[2] * 0.18 + 28], 1));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(Z.x, Z.y, Z.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.clip();
        mikro.tegn(ctx);
        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "#aeb8c3";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(Z.x, Z.y, Z.r + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(Z.x, Z.y, Z.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (titel) {
            NK.tekst(ctx, titel, Z.x, Z.y + Z.r + 26, {
                str: 15, vaegt: 600, justering: "center", linje: "middle", farve: "#dfe5ec", maks: 330
            });
        }
    };

    /* ================================================================
       KØKKENRULLEN
       ================================================================ */
    S.tegnPapir = function (ctx, p) {
        ctx.save();
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.vinkel);
        NK.Sprites.tegn(ctx, "papir", -S.PAPIR.B / 2, -S.PAPIR.H / 2, S.PAPIR.B, S.PAPIR.H, "#eef0ec");
        ctx.restore();
    };
}());

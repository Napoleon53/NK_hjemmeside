/* =====================================================================
   tegning.js - det, begge faner tegner, og som ikke har egen model

   Rummet med fliser bag bordet, bordet, kortet med strukturformlen,
   proeveglasset med etiketten, stoffet paa spatlen, maerkaterne ved
   glassene og soejlen med C-atomer og polaere grupper. Funktionerne
   tegner én ting et bestemt sted og husker intet selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = {};
    var SKRIFT = "'Segoe UI', sans-serif";

    T.font = function (vaegt, px) { return vaegt + " " + px + "px " + SKRIFT; };

    T.FARVE = {
        vand: "#3d9ee0", vandLys: "#cfe6f8",
        heptan: "#d6a332", heptanLys: "#f6e7b8",
        ja: "#2e9e62", nej: "#c9503d",
        tekst: "#1d2129", graa: "#5d6570"
    };

    /* ----- Rummet: moerk vaeg foroven, hvide fliser bag bordet ------------- */
    T.rum = function (ctx, W, H, fliseTop, bordY) {
        var g = ctx.createLinearGradient(0, 0, 0, fliseTop);
        g.addColorStop(0, "#262833");
        g.addColorStop(1, "#1d1f27");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, fliseTop);
        ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
        for (var x = 0; x < W; x += 64) ctx.fillRect(x, 0, 1, fliseTop);

        /* Fliserne: man holder et reagensglas op mod noget hvidt for at se lagene */
        ctx.fillStyle = "#dfe3e8";
        ctx.fillRect(0, fliseTop, W, bordY - fliseTop);
        var s = 42;
        ctx.strokeStyle = "rgba(120, 130, 142, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var y = bordY; y > fliseTop; y -= s) {
            ctx.moveTo(0, Math.round(y) + 0.5);
            ctx.lineTo(W, Math.round(y) + 0.5);
        }
        for (x = s / 2; x < W; x += s) {
            ctx.moveTo(Math.round(x) + 0.5, fliseTop);
            ctx.lineTo(Math.round(x) + 0.5, bordY);
        }
        ctx.stroke();
        var lys = ctx.createLinearGradient(0, fliseTop, 0, bordY);
        lys.addColorStop(0, "rgba(255, 255, 255, 0)");
        lys.addColorStop(1, "rgba(255, 255, 255, 0.25)");
        ctx.fillStyle = lys;
        ctx.fillRect(0, fliseTop, W, bordY - fliseTop);
        /* Listen oven over fliserne */
        ctx.fillStyle = "#9aa2ab";
        ctx.fillRect(0, fliseTop - 5, W, 5);
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.fillRect(0, fliseTop - 5, W, 1);
        ctx.fillStyle = "#121318";
        ctx.fillRect(0, bordY, W, H - bordY);
    };

    T.bord = function (ctx, x0, x1, y, gulv) {
        var plade = 12;
        ctx.fillStyle = "#2a2e37";
        ctx.fillRect(x0, y + plade, x1 - x0, gulv - y - plade);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1;
        var doer = Math.max(120, (x1 - x0) / 6);
        for (var x = x0 + doer; x < x1 - 20; x += doer) {
            ctx.beginPath();
            ctx.moveTo(Math.round(x) + 0.5, y + plade + 6);
            ctx.lineTo(Math.round(x) + 0.5, gulv);
            ctx.stroke();
        }
        ctx.fillStyle = "#3b404c";
        ctx.fillRect(x0, y, x1 - x0, plade);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(x0, y, x1 - x0, 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x0, y + plade, x1 - x0, 4);
    };

    /* ----- Kortet med strukturformlen ---------------------------------------
       Et hvidt ark paa vaeggen med to naale. Returnerer feltet, hvor
       formlen skal staa (pixels). v.bund: plads forneden (soejlen). */
    T.kort = function (ctx, r, stof, v) {
        v = v || {};
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(r.x + 4, r.y + 5, r.b, r.h);
        ctx.fillStyle = "#fbfbf7";
        NK.rundtRekt(ctx, r.x, r.y, r.b, r.h, 5);
        ctx.fill();
        if (v.lys) {
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.5 + 0.5 * v.lys) + ")";
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
            ctx.lineWidth = 1;
        }
        ctx.stroke();
        [[r.x + 10, r.y + 10], [r.x + r.b - 10, r.y + 10]].forEach(function (q) {
            ctx.fillStyle = "#c0392b";
            ctx.beginPath();
            ctx.arc(q[0], q[1], 3.4, 0, Math.PI * 2);
            ctx.fill();
        });

        /* Hovedet: navnet og formlen */
        var px = NK.klamp(r.b * 0.045, 15, 20);
        var y = r.y + 16 + px * 0.8;
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = "left";
        ctx.font = T.font("700", px);
        ctx.fillStyle = T.FARVE.tekst;
        var navn = stof ? stof.navn : "";
        navn = navn.charAt(0).toUpperCase() + navn.slice(1);
        ctx.fillText(navn, r.x + 20, y);
        var bNavn = ctx.measureText(navn).width;
        ctx.font = T.font("600", px * 0.9);
        ctx.fillStyle = T.FARVE.graa;
        var efter = stof ? NK.formel(stof.formel) + (stof.andet ? "   " + stof.andet : "") : "";
        var plads = r.b - 40 - bNavn - 14;
        if (ctx.measureText(efter).width > plads && stof) efter = NK.formel(stof.formel);
        ctx.fillText(efter, r.x + 20 + bNavn + 14, y);
        ctx.restore();

        var top = y + 10, bund = v.bund || 0;
        return { x: r.x + 16, y: top, b: r.b - 32, h: r.y + r.h - top - bund - 10 };
    };

    /* ----- Soejlen under formlen (fane 2) ------------------------------------
       C-atomerne (gul) mod de polaere grupper, eleven har fundet (blaa).
       Samme soejle som i den gamle c3.5. */
    T.soejle = function (ctx, r, c, fundet, i_alt, v) {
        v = v || {};
        ctx.save();
        var px = NK.klamp(r.h * 0.42, 12, 14);
        ctx.font = T.font("600", px);
        ctx.textBaseline = "middle";
        var h = Math.min(24, r.h - 2);
        var y = r.y + (r.h - h) / 2;
        var sum = c + fundet;
        var andelC = sum > 0 ? c / sum : 0.5;
        NK.rundtRekt(ctx, r.x, y, r.b, h, h / 2);
        ctx.fillStyle = "#e7e9ec";
        ctx.fill();
        ctx.save();
        ctx.clip();
        if (sum > 0) {
            ctx.fillStyle = T.FARVE.heptanLys;
            ctx.fillRect(r.x, y, r.b * andelC, h);
            ctx.fillStyle = T.FARVE.vandLys;
            ctx.fillRect(r.x + r.b * andelC, y, r.b * (1 - andelC), h);
            ctx.fillStyle = T.FARVE.heptan;
            ctx.fillRect(r.x + r.b * andelC - 1, y, 2, h);
        }
        ctx.restore();
        NK.rundtRekt(ctx, r.x, y, r.b, h, h / 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#6b4f10";
        ctx.textAlign = "left";
        var cTekst = c === 1 ? "1 C-atom" : c + " C-atomer";
        ctx.fillText(cTekst, r.x + 10, y + h / 2 + 0.5);
        ctx.fillStyle = "#154f78";
        ctx.textAlign = "right";
        var gTekst;
        if (i_alt === 0 && c === 0) gTekst = "ingen polære grupper";
        else if (v.alle) gTekst = fundet + (fundet === 1 ? " polær gruppe" : " polære grupper");
        else gTekst = fundet + (fundet === 1 ? " polær gruppe fundet" : " polære grupper fundet");
        ctx.fillText(gTekst, r.x + r.b - 10, y + h / 2 + 0.5);
        ctx.restore();
    };

    /* ----- Proeveglasset med stoffet og etiketten ----------------------------
       x, y: spritets oeverste venstre hjoerne; k: skalaen. mellem: tegnes
       mellem indholdet og glasset (pipetten eller spatlen, der staar i det) */
    T.proeveglas = function (ctx, x, y, k, stof, mellem) {
        var M = NK.Sprites.MAAL.proeveglas;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(k, k);
        if (stof) {
            if (stof.tilstand === "vaeske") {
                var top = M.indBund - (M.indBund - M.indTop) * 0.55;
                var t = stof.tint;
                ctx.fillStyle = "rgba(" + t[0] + "," + t[1] + "," + t[2] + "," + Math.min(0.6, t[3] * 2.6) + ")";
                NK.rundtRekt(ctx, M.indV, top, M.indH - M.indV, M.indBund - top, 7);
                ctx.fill();
                ctx.strokeStyle = "rgba(55, 68, 82, 0.55)";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(M.indV, top);
                ctx.lineTo(M.indH, top);
                ctx.stroke();
            } else {
                for (var i = 0; i < 46; i++) {
                    var fx = M.indV + 6 + ((i * 37) % 56);
                    var lag = Math.floor(i / 14);
                    NK.Glas.tegnKorn(ctx, fx + (lag % 2) * 3, M.indBund - 4 - lag * 4.5 - ((i * 13) % 5) * 0.6, 2.6, i, stof.korn);
                }
            }
        }
        if (mellem) {
            ctx.save();
            ctx.scale(1 / k, 1 / k);
            ctx.translate(-x, -y);
            mellem();
            ctx.restore();
        }
        NK.Sprites.tegn(ctx, "proeveglas", 0, 0, M.b, M.h);
        if (stof) {
            var bl = M.etiketH - M.etiketV - 6;
            ctx.scale(1 / k, 1 / k);
            var sk = NK.passendeSkrift(ctx, stof.etiket, bl * k, 14, 10, "700");
            ctx.fillStyle = T.FARVE.tekst;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = T.font("700", sk);
            ctx.fillText(stof.etiket, (M.etiketV + M.etiketH) / 2 * k, (M.etiketTop + M.etiketBund) / 2 * k + 1);
        }
        ctx.restore();
    };

    /* Stoffet paa spatlen: et lille bjerg korn i skeen (i spatlens enheder) */
    T.spatelIndhold = function (ctx, stof) {
        for (var i = 0; i < 9; i++) {
            NK.Glas.tegnKorn(ctx, 8 + (i % 5) * 4.4, 9 - Math.floor(i / 5) * 3.5 - (i % 2), 2.3, i * 1.3, stof.korn);
        }
    };

    /* ----- Maerkaterne ved glasset -------------------------------------------
       Et skilt med iagttagelsen (groen: blandes, roed: blandes ikke) og smaa
       navne ud for lagene. side: -1 til venstre for glasset, 1 til hoejre. */
    T.skilt = function (ctx, x, y, tekst, god, side) {
        ctx.save();
        ctx.font = T.font("700", 14);
        var tegn = god ? "✓ " : "✗ ";
        var b = ctx.measureText(tegn + tekst).width + 18, h = 26;
        var x0 = side < 0 ? x - b : x;
        ctx.fillStyle = god ? T.FARVE.ja : T.FARVE.nej;
        NK.rundtRekt(ctx, x0, y - h / 2, b, h, 13);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(tegn + tekst, x0 + 9, y + 1);
        ctx.restore();
        return b;
    };

    T.lagNavn = function (ctx, x, y, tilX, tekst, side) {
        ctx.save();
        ctx.strokeStyle = "rgba(40, 48, 58, 0.7)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(tilX, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(tilX, y, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(40, 48, 58, 0.85)";
        ctx.fill();
        ctx.font = T.font("600", 13);
        ctx.textBaseline = "middle";
        ctx.textAlign = side < 0 ? "right" : "left";
        ctx.fillStyle = "#23282f";
        ctx.fillText(tekst, x + (side < 0 ? -5 : 5), y);
        ctx.restore();
    };

    /* En gul pil, der viser, hvad der kan traekkes */
    T.traekPil = function (ctx, x, y, tid, retning) {
        var d = Math.sin(tid * 5) * 5;
        ctx.save();
        ctx.translate(x + d * retning, y);
        ctx.fillStyle = "#f2c53d";
        ctx.strokeStyle = "rgba(20, 20, 28, 0.8)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(14 * retning, 0);
        ctx.lineTo(0, -10);
        ctx.lineTo(0, -4);
        ctx.lineTo(-14 * retning, -4);
        ctx.lineTo(-14 * retning, 4);
        ctx.lineTo(0, 4);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    };

    NK.Tegn = T;
}());

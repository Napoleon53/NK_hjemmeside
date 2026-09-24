/* =====================================================================
   tegning.js - kuglerne og det lille glas

   Kuglerne tegnes én gang pr. stof og stoerrelse paa et lille laerred
   og stemples derefter paa (hurtigt nok til 864 kugler hvert billede).
   Det lille glas viser det, oejet ser: modellens gitter nedskaleret til
   et billede paa 32 x 27 punkter, hvor vand og ethanol er klare, olien
   er lysegul, og graenser mellem to faser er hvide. En emulsion har
   graenser overalt og bliver derfor maelket.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var Tg = {};
    NK.Tegning = Tg;

    /* ----- Kuglerne ---------------------------------------------------- */
    var stempler = {};

    function hexTilRgb(hex) {
        var n = parseInt(hex.slice(1), 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    /* Et stempel: kuglen med lys foroven til venstre og moerk kant */
    Tg.stempel = function (art, r, dpr) {
        var noegle = art + ":" + Math.round(r * dpr * 4);
        if (stempler[noegle]) return stempler[noegle];
        var s = D.STOFFER[art];
        var px = Math.ceil((r + 1.5) * 2 * dpr);
        var c = document.createElement("canvas");
        c.width = px;
        c.height = px;
        var ctx = c.getContext("2d");
        ctx.scale(dpr, dpr);
        var m = px / dpr / 2;
        var g = ctx.createRadialGradient(m - r * 0.35, m - r * 0.4, r * 0.1, m, m, r);
        g.addColorStop(0, s.lys);
        g.addColorStop(0.55, s.farve);
        g.addColorStop(1, s.moerk);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m, m, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = Math.max(0.6, r * 0.08);
        ctx.stroke();
        var st = { c: c, halv: px / dpr / 2 };
        stempler[noegle] = st;
        return st;
    };

    Tg.kugle = function (ctx, art, x, y, r, dpr) {
        var st = Tg.stempel(art, r, dpr);
        ctx.drawImage(st.c, x - st.halv, y - st.halv, st.halv * 2, st.halv * 2);
    };

    /* En dampboble inde i vaesken: en lys ring om et lille molekyle */
    Tg.boble = function (ctx, art, x, y, r, dpr) {
        ctx.save();
        ctx.fillStyle = "rgba(20, 20, 30, 0.55)";
        ctx.strokeStyle = "rgba(235, 245, 255, 0.85)";
        ctx.lineWidth = Math.max(1, r * 0.12);
        ctx.beginPath();
        ctx.arc(x, y, r * 1.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        Tg.kugle(ctx, art, x, y, r * 0.55, dpr);
    };

    /* ----- Det lille glas ------------------------------------------------ */
    var makro = null, makroCtx = null, makroData = null;

    var KLAR = [190, 220, 250, 70];         /* vand og ethanol: klart */
    var OLIE = [246, 208, 96, 180];         /* olie: lysegul */
    var HVID = [238, 240, 236, 225];        /* graenser og emulsion */

    /* Tegner vaesken i glasset ud fra modellen. rekt er glassets inderside
       i pixels; hoejde er vaeskens maksimale hoejde i samme pixels. */
    Tg.makro = function (ctx, m, rekt) {
        var C = m.C, R = m.R, i;
        if (!makro || makro.width !== C || makro.height !== R) {
            makro = document.createElement("canvas");
            makro.width = C;
            makro.height = R;
            makroCtx = makro.getContext("2d");
            makroData = makroCtx.createImageData(C, R);
        }
        var d = makroData.data, olieFase = m.fase[D.nr("olie")];
        for (var r = 0; r < R; r++) {
            for (var c = 0; c < C; c++) {
                var k = r * C + c, o = ((R - 1 - r) * C + c) * 4;
                var b = m.plads[k];
                if (b < 0) {
                    /* En boble eller luft */
                    var farve = m.boble[k] ? HVID : null;
                    d[o] = farve ? farve[0] : 0;
                    d[o + 1] = farve ? farve[1] : 0;
                    d[o + 2] = farve ? farve[2] : 0;
                    d[o + 3] = farve ? 150 : 0;
                    continue;
                }
                var basis = m.fase[m.kugler[b].art] === olieFase ? OLIE : KLAR;
                var u = Math.min(1, m.uklarhed(k) * 1.7);
                for (i = 0; i < 4; i++) d[o + i] = basis[i] + (HVID[i] - basis[i]) * u;
            }
        }
        makroCtx.putImageData(makroData, 0, 0);
        var h = rekt.hoejde * (m.fyldHoejde / m.hoejde);
        ctx.save();
        ctx.beginPath();
        ctx.rect(rekt.x, rekt.y, rekt.bredde, rekt.hoejde);
        ctx.clip();
        ctx.imageSmoothingEnabled = true;
        /* Sloeret, saa en emulsion ser maelket ud og ikke prikket */
        ctx.filter = "blur(" + Math.max(1, rekt.bredde / 70).toFixed(1) + "px)";
        ctx.drawImage(makro, rekt.x, rekt.y + rekt.hoejde - h, rekt.bredde, h);
        ctx.filter = "none";
        /* Overfladen ses som en lys streg, ogsaa naar vaesken er klar */
        var o = m.overflade();
        if (o > 0.05) {
            var y = rekt.y + rekt.hoejde - o / m.hoejde * rekt.hoejde;
            ctx.strokeStyle = "rgba(225, 240, 255, 0.75)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(rekt.x + 1, y);
            ctx.lineTo(rekt.x + rekt.bredde - 1, y);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* ----- Tekst med moerk kant -------------------------------------------- */
    Tg.skilt = function (ctx, tekst, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "600 13px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + 16, h = 24;
        var bx = opt.hoejre ? x - b : x - b / 2;
        if (opt.klamp) bx = NK.klamp(bx, opt.klamp[0], opt.klamp[1] - b);
        ctx.fillStyle = "rgba(16, 16, 22, 0.92)";
        ctx.strokeStyle = opt.kant || "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        NK.rundtRekt(ctx, bx, y - h, b, h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = opt.farve || "#f2f3f5";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, bx + 8, y - h / 2 + 1);
        ctx.restore();
    };

    Tg.rgb = hexTilRgb;
}());

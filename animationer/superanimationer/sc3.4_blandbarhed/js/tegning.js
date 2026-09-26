/* =====================================================================
   tegning.js - kuglerne og det lille glas

   Kuglerne tegnes én gang pr. stof og stoerrelse paa et lille laerred
   og stemples derefter paa (hurtigt nok til 864 kugler hvert billede).
   Det lille glas viser det, oejet ser: hver plads i gitteret er et lille
   felt, vand og ethanol er klare, olien er lysegul, og graenser mellem to
   faser er tynde lyse streger. En emulsion har graenser overalt og bliver
   derfor maelket.
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
    var KLAR = [190, 220, 250, 0.27];       /* vand og ethanol: klart */
    var OLIE = [246, 208, 96, 0.72];        /* olie: lysegul */
    var HVID = [238, 240, 236, 0.9];        /* en emulsion: maelket */
    var H = Math.sqrt(3) / 2;
    var uk = null, glat = null;
    /* Glassets bund bag vaesken (scene.js fylder den med moerkt).
       Farverne blandes faerdige mod den, saa felterne kan overlappe
       uden at give et ternet moenster. */
    var BAG = [11, 11, 15];

    /* Tegner vaesken i glasset ud fra modellen, skarpt: hver plads er et
       lille felt i fasens farve. Graensen mellem to faser er en tynd lys
       streg. Et felt bliver kun maelket, naar der er graenser taet omkring
       det (en emulsion), ikke ved en enkelt flad graense mellem to lag.
       rekt er glassets inderside i pixels. */
    Tg.makro = function (ctx, m, rekt) {
        var S = m.plads.length, k, d, j;
        if (!uk || uk.length !== S) { uk = new Float32Array(S); glat = new Float32Array(S); }
        for (k = 0; k < S; k++) uk[k] = m.plads[k] >= 0 ? m.uklarhed(k) : 0;
        for (k = 0; k < S; k++) {
            if (m.plads[k] < 0) { glat[k] = 0; continue; }
            var sum = uk[k], n = 1;
            for (d = 0; d < 6; d++) {
                j = m.NB[k * 6 + d];
                if (j >= 0 && m.plads[j] >= 0) { sum += uk[j]; n++; }
            }
            glat[k] = sum / n;
        }
        var sx = rekt.bredde / m.bredde, sy = H * sx, bund = rekt.y + rekt.hoejde;
        var olieFase = m.fase[D.nr("olie")];
        ctx.save();
        ctx.beginPath();
        ctx.rect(rekt.x, rekt.y, rekt.bredde, rekt.hoejde);
        ctx.clip();
        /* Den oeverste raekke er som regel kun delvist fyldt. Den tegnes
           ikke; i stedet naar raekken under den op til overfladestregen,
           saa der ikke bliver huller i overfladen. En boble faar farven
           fra en nabo, og ringen tegnes ovenpaa (scene.js). */
        var tr = m.top(), delvis = tr >= 0 && m.raekkeAntal[tr] < m.C;
        var ekstra = delvis ? m.raekkeAntal[tr] / m.C * sy : 0;
        for (k = 0; k < S; k++) {
            var b = m.plads[k], r0 = m.raekke(k);
            if (delvis && r0 === tr) continue;
            if (b < 0 && m.boble[k]) {
                for (d = 0; d < 6 && b < 0; d++) {
                    j = m.NB[k * 6 + d];
                    if (j >= 0 && m.plads[j] >= 0) b = m.plads[j];
                }
            }
            if (b < 0) continue;
            var basis = m.fase[m.kugler[b].art] === olieFase ? OLIE : KLAR;
            var maelk = Math.max(0, Math.min(1, (glat[k] - 0.2) * 2.5));
            var x = rekt.x + m.px(k) * sx, y = bund - m.py(k) * sx;
            var top = y - sy / 2, hoej = r0 === 0 ? bund - top : sy + 0.6;
            if (delvis && r0 === tr - 1) { top -= ekstra; hoej += ekstra; }
            var alfa = basis[3] + (HVID[3] - basis[3]) * maelk, farve = [];
            for (d = 0; d < 3; d++) farve[d] = Math.round(BAG[d] + (basis[d] + (HVID[d] - basis[d]) * maelk - BAG[d]) * alfa);
            ctx.fillStyle = "rgb(" + farve[0] + "," + farve[1] + "," + farve[2] + ")";
            ctx.fillRect(x - sx / 2, top, sx + 0.6, hoej);
        }
        /* Graenserne mellem to faser */
        ctx.strokeStyle = "rgba(240, 245, 250, 0.6)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (k = 0; k < S; k++) {
            if (m.plads[k] < 0 || (delvis && m.raekke(k) >= tr - 1)) continue;
            var f = m.fase[m.kugler[m.plads[k]].art];
            var cx = rekt.x + m.px(k) * sx, cy = bund - m.py(k) * sx;
            for (d = 1; d < 4; d++) {
                j = m.NB[k * 6 + d];
                if (j < 0 || m.plads[j] < 0 || m.fase[m.kugler[m.plads[j]].art] === f) continue;
                if (d === 1) { ctx.moveTo(cx + sx / 2, cy - sy / 2); ctx.lineTo(cx + sx / 2, cy + sy / 2); }
                else if (d === 2) { ctx.moveTo(cx - sx / 2, cy - sy / 2); ctx.lineTo(cx, cy - sy / 2); }
                else { ctx.moveTo(cx, cy - sy / 2); ctx.lineTo(cx + sx / 2, cy - sy / 2); }
            }
        }
        ctx.stroke();
        /* Overfladen ses som en lys streg, ogsaa naar vaesken er klar */
        var o = m.overflade();
        if (o > 0.05) {
            var yo = bund - o * sx;
            ctx.strokeStyle = "rgba(225, 240, 255, 0.75)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(rekt.x + 1, yo);
            ctx.lineTo(rekt.x + rekt.bredde - 1, yo);
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

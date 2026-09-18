/* =====================================================================
   tegning_faser.js - destillationsopstillingen paa fane 2

   Kolben med hals og sidearm, varmepladen under den, termometeret i
   halsen, koeleren og modtageglasset. Samme tegnebord som fane 1.

   Maalene staar i MAAL og bruges baade af tegningen og af fysikken i
   js/sim_faser.js: molekylerne bevaeger sig inde i den samme cirkel,
   som tegnes her.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.Tegn;

    /* ------------------------------------------------------------------
       MAALENE
       ------------------------------------------------------------------ */
    var K = {
        /* Kolben: en kugle med en hals opad */
        cx: 392, cy: 318, r: 150, vaeg: 4,
        halsB: 60, halsTop: 84, halsBund: 210,
        /* Sidearmen: fra halsen ud til modtageglasset */
        armFra: { x: 422, y: 146 },
        armTil: { x: 782, y: 372 },
        armB: 22,
        /* Koelekappen ligger paa midten af armen */
        kappe0: 0.30, kappe1: 0.82,
        /* Varmepladen */
        plade: { x0: 258, x1: 526, top: 468, bund: 500 },
        /* Termometeret i halsen */
        term: { x: 392, top: 40, bund: 200 },
        /* Modtageglasset */
        modtag: { x0: 736, x1: 842, top: 392, bund: T.BORD }
    };
    T.MAAL_FASER = K;

    /* Indersiden af kolbens kugle. */
    T.kolbeInder = function () { return K.r - K.vaeg; };

    /* Er punktet inde i kolben (kugle eller hals)? */
    T.iKolbe = function (x, y) {
        var r = K.r - K.vaeg;
        if ((x - K.cx) * (x - K.cx) + (y - K.cy) * (y - K.cy) <= r * r) return true;
        return y >= K.halsTop && y <= K.halsBund &&
               Math.abs(x - K.cx) <= K.halsB / 2 - K.vaeg;
    };

    /* Stien om hele kolbens inderside: kuglen og halsen som ét omrids. */
    T.kolbeSti = function (ctx, inder) {
        var v = inder ? K.vaeg : 0;
        var r = K.r - v;
        var hb = K.halsB / 2 - v;
        /* Hvor skaerer halsen kuglen? */
        var dy = -Math.sqrt(Math.max(1, r * r - hb * hb));
        var v0 = Math.atan2(dy, hb);
        ctx.beginPath();
        ctx.arc(K.cx, K.cy, r, v0, Math.PI - v0, false);
        ctx.lineTo(K.cx - hb, K.halsTop + v);
        ctx.lineTo(K.cx + hb, K.halsTop + v);
        ctx.closePath();
    };

    /* ------------------------------------------------------------------
       KOLBEN
       ------------------------------------------------------------------ */
    T.kolbe = function (ctx) {
        ctx.save();

        /* Et svagt skaer inde i glasset, saa kuglen kan ses som en kugle */
        T.kolbeSti(ctx, true);
        var g = ctx.createRadialGradient(K.cx - K.r * 0.35, K.cy - K.r * 0.4, K.r * 0.1,
                                         K.cx, K.cy, K.r);
        g.addColorStop(0, "rgba(255, 255, 255, 0.05)");
        g.addColorStop(1, "rgba(120, 160, 200, 0.03)");
        ctx.fillStyle = g;
        ctx.fill();

        ctx.strokeStyle = "rgba(198, 216, 236, 0.5)";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        T.kolbeSti(ctx, false);
        ctx.stroke();

        /* Randen foroven */
        ctx.beginPath();
        ctx.ellipse(K.cx, K.halsTop, K.halsB / 2, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        /* Lysglimt */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(K.cx, K.cy, K.r - 18, Math.PI * 0.95, Math.PI * 1.32);
        ctx.stroke();
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       SIDEARMEN OG KOELEREN
       ------------------------------------------------------------------ */
    /* Et punkt paa armen, t fra 0 (ved halsen) til 1 (over modtageglasset). */
    T.armPunkt = function (t) {
        return {
            x: NK.lerp(K.armFra.x, K.armTil.x, t),
            y: NK.lerp(K.armFra.y, K.armTil.y, t)
        };
    };

    T.koeler = function (ctx) {
        var a = K.armFra, b = K.armTil;
        var vinkel = Math.atan2(b.y - a.y, b.x - a.x);
        var laengde = Math.hypot(b.x - a.x, b.y - a.y);

        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(vinkel);

        /* Selve roeret */
        ctx.fillStyle = "rgba(150, 178, 205, 0.10)";
        ctx.fillRect(0, -K.armB / 2, laengde, K.armB);
        ctx.strokeStyle = "rgba(198, 216, 236, 0.45)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -K.armB / 2); ctx.lineTo(laengde, -K.armB / 2);
        ctx.moveTo(0, K.armB / 2);  ctx.lineTo(laengde, K.armB / 2);
        ctx.stroke();

        /* Koelekappen med vand omkring */
        var k0 = laengde * K.kappe0, k1 = laengde * K.kappe1, kh = 21;
        var kg = ctx.createLinearGradient(0, -kh, 0, kh);
        kg.addColorStop(0, "rgba(61, 158, 224, 0.20)");
        kg.addColorStop(0.5, "rgba(61, 158, 224, 0.10)");
        kg.addColorStop(1, "rgba(61, 158, 224, 0.24)");
        ctx.fillStyle = kg;
        NK.rundtRekt(ctx, k0, -kh, k1 - k0, kh * 2, 9);
        ctx.fill();
        ctx.strokeStyle = "rgba(120, 190, 240, 0.4)";
        ctx.lineWidth = 2;
        NK.rundtRekt(ctx, k0, -kh, k1 - k0, kh * 2, 9);
        ctx.stroke();

        /* Til- og afloeb for kolevandet */
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(120, 190, 240, 0.34)";
        ctx.beginPath();
        ctx.moveTo(k1 - 14, kh); ctx.lineTo(k1 - 4, kh + 22);
        ctx.moveTo(k0 + 14, -kh); ctx.lineTo(k0 + 4, -kh - 22);
        ctx.stroke();

        ctx.fillStyle = "rgba(150, 182, 210, 0.7)";
        ctx.font = "600 12px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.save();
        ctx.translate((k0 + k1) / 2, -kh - 12);
        ctx.rotate(-vinkel);
        ctx.fillText("køler", 0, 0);
        ctx.restore();

        ctx.restore();
    };

    /* ------------------------------------------------------------------
       VARMEPLADEN
       knapV er drejeknappens vinkel i radianer fra lodret:
       -2,2 er slukket, 2,2 er helt skruet op.
       ------------------------------------------------------------------ */
    T.varmeplade = function (ctx, gloed, knapV, hover) {
        var P = K.plade;
        ctx.save();

        /* Kabinettet */
        var g = ctx.createLinearGradient(0, P.top, 0, P.bund);
        g.addColorStop(0, "#4c525d");
        g.addColorStop(1, "#272c34");
        ctx.fillStyle = g;
        NK.rundtRekt(ctx, P.x0, P.top, P.x1 - P.x0, P.bund - P.top, 5);
        ctx.fill();

        /* Selve pladen */
        ctx.fillStyle = "#1d2128";
        NK.rundtRekt(ctx, P.x0 + 8, P.top, P.x1 - P.x0 - 16, 11, 3);
        ctx.fill();
        if (gloed > 0.01) {
            ctx.globalAlpha = NK.klamp(gloed, 0, 1);
            var vg = ctx.createLinearGradient(0, P.top, 0, P.top + 11);
            vg.addColorStop(0, "rgba(255, 128, 62, 0.95)");
            vg.addColorStop(1, "rgba(198, 48, 28, 0.8)");
            ctx.fillStyle = vg;
            NK.rundtRekt(ctx, P.x0 + 8, P.top, P.x1 - P.x0 - 16, 11, 3);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        /* Lampen */
        ctx.fillStyle = gloed > 0.01 ? "#ff6a3d" : "#3c414a";
        ctx.beginPath();
        ctx.arc(P.x0 + 22, P.top + 22, 5, 0, Math.PI * 2);
        ctx.fill();

        /* Drejeknappen */
        var kn = T.pladeKnap();
        if (hover) {
            ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.arc(kn.x, kn.y, kn.r + 4, 0, Math.PI * 2);
            ctx.stroke();
        }
        var kg2 = ctx.createRadialGradient(kn.x - kn.r * 0.3, kn.y - kn.r * 0.35, kn.r * 0.1, kn.x, kn.y, kn.r);
        kg2.addColorStop(0, "#e3e8ee");
        kg2.addColorStop(1, "#7d8794");
        ctx.fillStyle = kg2;
        ctx.beginPath();
        ctx.arc(kn.x, kn.y, kn.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#23272e";
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.strokeStyle = "#2a2f38";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(kn.x + Math.sin(knapV) * kn.r * 0.2, kn.y - Math.cos(knapV) * kn.r * 0.2);
        ctx.lineTo(kn.x + Math.sin(knapV) * kn.r * 0.82, kn.y - Math.cos(knapV) * kn.r * 0.82);
        ctx.stroke();

        ctx.restore();
    };

    T.pladeKnap = function () {
        var P = K.plade;
        return { x: P.x1 - 28, y: P.top + 20, r: 14 };
    };

    /* ------------------------------------------------------------------
       TERMOMETERET
       ------------------------------------------------------------------ */
    T.termometer = function (ctx, temp, tmin, tmax) {
        var t = K.term;
        var x = t.x, bund = t.bund, top = t.top;
        var kugleR = 9;
        var soejle0 = bund - kugleR - 2;
        var soejle1 = top + 14;
        var f = NK.klamp((temp - tmin) / (tmax - tmin), 0, 1);
        var y = NK.lerp(soejle0, soejle1, f);

        ctx.save();
        /* Glasroeret */
        ctx.fillStyle = "rgba(210, 226, 240, 0.10)";
        NK.rundtRekt(ctx, x - 6, top, 12, bund - top, 6);
        ctx.fill();
        ctx.strokeStyle = "rgba(200, 216, 234, 0.45)";
        ctx.lineWidth = 1.8;
        NK.rundtRekt(ctx, x - 6, top, 12, bund - top, 6);
        ctx.stroke();

        /* Soejlen og kuglen */
        ctx.fillStyle = "#d9453a";
        ctx.fillRect(x - 3, y, 6, soejle0 - y);
        ctx.beginPath();
        ctx.arc(x, bund - kugleR, kugleR, 0, Math.PI * 2);
        ctx.fill();

        /* Streger */
        ctx.strokeStyle = "rgba(214, 226, 238, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (var i = 0; i <= 8; i++) {
            var yy = NK.lerp(soejle0, soejle1, i / 8);
            ctx.moveTo(x + 6, yy);
            ctx.lineTo(x + (i % 2 ? 10 : 13), yy);
        }
        ctx.stroke();
        ctx.restore();
    };

    /* ------------------------------------------------------------------
       DAMP OG BOBLER
       ------------------------------------------------------------------ */
    T.dampsky = function (ctx, x, y, r, alfa) {
        ctx.save();
        ctx.globalAlpha = alfa;
        var g = ctx.createRadialGradient(x, y, 1, x, y, r);
        g.addColorStop(0, "rgba(226, 238, 250, 0.5)");
        g.addColorStop(1, "rgba(226, 238, 250, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };
}());

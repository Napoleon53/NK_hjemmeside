/* =====================================================================
   farvemodel.js - farven af en farvet oploesning

   En oploesnings farve regnes paa lyset, ikke paa de tre RGB-kanaler.
   Regnes der pr. kanal, faar et staerkt farvet stof absorbans i alle tre
   kanaler, og saa gaar farven mod sort, saa snart koncentrationen eller
   vejlaengden bliver stor, og enhver blanding af to farver bliver graa.
   Her deles det synlige lys i stedet i 16 baand fra 400 til 700 nm:

     1. Stoffets farve laves om til et absorptionsspektrum. Farven siger,
        hvilket lys der slipper igennem, saa et roedt stof faar naesten
        ingen absorbans i den roede ende. Derfor bliver en koncentreret
        roed oploesning moerkeroed og ikke sort.
     2. Absorbanserne laegges sammen baand for baand (Lambert-Beer), saa
        to farvestoffer blandes som lys og ikke som maling.
     3. Det tilbagevaerende lys ganges med D65 og CIE's tre
        farvematchningsfunktioner og bliver til XYZ og derfra til sRGB.

   GULV er den smule absorbans, ethvert stof har i hele spektret. Uden
   den ville et maettet farvestof staa fuldstaendig kulørt; med den
   bliver det moerkere, men beholder sin kulør.

   Brug:
     var sp = NK.Farvemodel.spektrum({ r: 190, g: 35, b: 25 });
     var l  = NK.Farvemodel.lys([{ sp: sp, A: 2.4 }]);   // A = k * c * vejlaengde
     l = { r, g, b, Y }   farven mod hvidt (0-255) og lysstyrken (0-1)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Baandene: 400 til 700 nm i spring paa 20 nm */
    var N = 16;

    /* CIE 1931, 2 grader */
    var XB = [0.0143, 0.1344, 0.3483, 0.2908, 0.0956, 0.0049, 0.0633, 0.2904,
              0.5945, 0.9163, 1.0622, 0.8544, 0.4479, 0.1649, 0.0468, 0.0114];
    var YB = [0.0004, 0.0040, 0.0230, 0.0600, 0.1390, 0.3230, 0.7100, 0.9540,
              0.9950, 0.8700, 0.6310, 0.3810, 0.1750, 0.0610, 0.0170, 0.0041];
    var ZB = [0.0679, 0.6456, 1.7471, 1.6692, 0.8130, 0.2720, 0.0782, 0.0203,
              0.0039, 0.0017, 0.0008, 0.0002, 0.0000, 0.0000, 0.0000, 0.0000];

    /* D65 */
    var D65 = [82.75, 93.43, 104.86, 117.01, 115.92, 109.35, 104.79, 104.41,
               100.00, 95.79, 90.01, 87.70, 83.29, 80.21, 78.28, 71.61];

    /* Hvidt lys: summen af D65 gennem de tre funktioner */
    var HVID = (function () {
        var X = 0, Y = 0, Z = 0;
        for (var i = 0; i < N; i++) {
            X += D65[i] * XB[i];
            Y += D65[i] * YB[i];
            Z += D65[i] * ZB[i];
        }
        return { X: X, Y: Y, Z: Z };
    }());

    function tilRGB(X, Y, Z) {
        return {
            r: 3.2406 * X - 1.5372 * Y - 0.4986 * Z,
            g: -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
            b: 0.0557 * X - 0.2040 * Y + 1.0570 * Z
        };
    }

    /* Hvor roedt, groent og blaat hvert baand ser ud. Vaegtene bruges til
       at laese et stofs farve som et spektrum: et baand, der ser roedt ud,
       slipper lige saa meget igennem som farvens roede andel. */
    var VAEGT = (function () {
        var ud = [];
        for (var i = 0; i < N; i++) {
            var c = tilRGB(XB[i], YB[i], ZB[i]);
            var v = [Math.max(0, c.r), Math.max(0, c.g), Math.max(0, c.b)];
            var s = v[0] + v[1] + v[2];
            ud.push(s > 1e-6 ? [v[0] / s, v[1] / s, v[2] / s] : [1 / 3, 1 / 3, 1 / 3]);
        }
        return ud;
    }());

    /* Den smule absorbans, ethvert stof har i hele spektret */
    var GULV = 0.08;

    /* Mindste gennemgang, en farve laeses som: 0,02 svarer til absorbans 1,7 */
    var MIN_T = 0.02;

    var husket = {};

    /* Stoffets farve som absorptionsspektrum. Toppen er altid 1, saa
       styrken staar ét sted: i A, naar spektret bruges. */
    function spektrum(farve) {
        var noegle = Math.round(farve.r) + "," + Math.round(farve.g) + "," + Math.round(farve.b);
        if (husket[noegle]) return husket[noegle];
        var m = Math.max(farve.r, farve.g, farve.b, 1) / 255;
        var rn = NK.klamp(farve.r / 255 / m, 0, 1);
        var gn = NK.klamp(farve.g / 255 / m, 0, 1);
        var bn = NK.klamp(farve.b / 255 / m, 0, 1);
        var A = [], top = 0, i;
        for (i = 0; i < N; i++) {
            var w = VAEGT[i];
            var t = Math.max(MIN_T, rn * w[0] + gn * w[1] + bn * w[2]);
            var a = -Math.log(t) / Math.LN10;
            A.push(a);
            if (a > top) top = a;
        }
        for (i = 0; i < N; i++) A[i] = (A[i] + GULV) / (top + GULV);
        husket[noegle] = A;
        return A;
    }

    /* Lyset, der slipper igennem alle lagene. lag: [{ sp, A }], hvor A er
       absorbansen ved spektrets top (k gange koncentration gange vejlaengde). */
    function lys(lag) {
        var X = 0, Y = 0, Z = 0, i, j;
        for (i = 0; i < N; i++) {
            var A = 0;
            for (j = 0; j < lag.length; j++) A += lag[j].A * lag[j].sp[i];
            var T = A > 0 ? Math.pow(10, -A) : 1;
            var s = D65[i] * T;
            X += s * XB[i];
            Y += s * YB[i];
            Z += s * ZB[i];
        }
        var c = tilRGB(X / HVID.Y, Y / HVID.Y, Z / HVID.Y);
        /* Uden for sRGB's trekant: traek farven mod hvidt i stedet for at
           klippe en kanal af, saa kuløren bliver staaende */
        var lav = Math.min(c.r, c.g, c.b);
        if (lav < 0) { c.r -= lav; c.g -= lav; c.b -= lav; }
        var hoej = Math.max(c.r, c.g, c.b);
        if (hoej > 1) { c.r /= hoej; c.g /= hoej; c.b /= hoej; }
        return { r: gamma(c.r), g: gamma(c.g), b: gamma(c.b), Y: NK.klamp(Y / HVID.Y, 0, 1) };
    }

    function gamma(v) {
        v = NK.klamp(v, 0, 1);
        return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
    }

    /* Absorbansen i tre baand, til graenser og sammenligninger:
       roed 620 nm, groen 540 nm og blaa 440 nm */
    var BAAND = { r: 11, g: 7, b: 2 };

    function kanaler(lag) {
        var ud = { r: 0, g: 0, b: 0 };
        for (var k in BAAND) {
            if (!Object.prototype.hasOwnProperty.call(BAAND, k)) continue;
            for (var j = 0; j < lag.length; j++) ud[k] += lag[j].A * lag[j].sp[BAAND[k]];
        }
        return ud;
    }

    NK.Farvemodel = {
        N: N,
        GULV: GULV,
        spektrum: spektrum,
        lys: lys,
        kanaler: kanaler
    };
}());

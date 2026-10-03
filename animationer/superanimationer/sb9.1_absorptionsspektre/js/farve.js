/* =====================================================================
   farve.js - farvemodellen

   Et spektrum er en liste af toppe { c, w, h }: midten c i nm, bredden w
   i nm (spredningen i en gausskurve) og hoejden h i absorbans. Alt, hvad
   eleven ser af farver, regnes herfra:

     * opløsningens farve: det lys, der slipper igennem (T = 10^-A), lagt
       sammen med CIE 1931-farvefunktionerne og regnet om til sRGB.
       Hvidt lys er lige meget af hver bølgelængde, og farven er skaleret,
       saa et stof, der intet absorberer, er hvidt.
     * lysets farve ved én bølgelængde (fotonerne, regnbuen under grafen)
     * farvecirklen: hver bølgelængde staar paa sin farvetone, saa den
       farve, vi ser, staar over for den, der bliver absorberet
     * navnet paa farven: Rød, Orange, Gul, Grøn, Blå, Lilla eller Farveløs

   Farvefunktionerne er tilnaermelsen med gausskurver fra Wyman, Sloan og
   Shirley (2013), som rammer CIE-tabellen inden for et par procent.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- CIE 1931 2°-farvefunktionerne ------------------------------- */
    function g(x, mu, s1, s2) {
        var t = (x - mu) / (x < mu ? s1 : s2);
        return Math.exp(-0.5 * t * t);
    }

    function cmf(l) {
        return {
            x: 1.056 * g(l, 599.8, 37.9, 31.0) + 0.362 * g(l, 442.0, 16.0, 26.7) - 0.065 * g(l, 501.1, 20.4, 26.2),
            y: 0.821 * g(l, 568.8, 46.9, 40.5) + 0.286 * g(l, 530.9, 16.3, 31.1),
            z: 1.217 * g(l, 437.0, 11.8, 36.0) + 0.681 * g(l, 459.0, 26.0, 13.8)
        };
    }

    var TRIN = 2;
    var TABEL = [];
    for (var l = 380; l <= 780; l += TRIN) TABEL.push({ l: l, c: cmf(l) });

    /* XYZ til lineaer sRGB (D65) */
    function tilLineaer(X, Y, Z) {
        return [
            3.2406 * X - 1.5372 * Y - 0.4986 * Z,
            -0.9689 * X + 1.8758 * Y + 0.0415 * Z,
            0.0557 * X - 0.2040 * Y + 1.0570 * Z
        ];
    }

    function xyz(T) {
        var X = 0, Y = 0, Z = 0;
        for (var i = 0; i < TABEL.length; i++) {
            var t = T(TABEL[i].l), c = TABEL[i].c;
            X += c.x * t; Y += c.y * t; Z += c.z * t;
        }
        return [X, Y, Z];
    }

    var HVID = (function () {
        var v = xyz(function () { return 1; });
        return tilLineaer(v[0], v[1], v[2]);
    }());

    function gamma(c) {
        c = c < 0 ? 0 : (c > 1 ? 1 : c);
        return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    }

    /* ----- Spektret ----------------------------------------------------- */
    function absorbans(toppe, l) {
        var a = 0;
        for (var i = 0; i < toppe.length; i++) {
            var p = toppe[i], t = (l - p.c) / p.w;
            if (t > -6 && t < 6) a += p.h * Math.exp(-0.5 * t * t);
        }
        return a;
    }

    /* Opløsningens farve, naar hvidt lys sendes igennem. faktor skalerer
       absorbansen (1 = som spektret). Resultatet er sRGB fra 0 til 1. */
    function farve(toppe, faktor) {
        var f = faktor === undefined ? 1 : faktor;
        return farveFn(function (l) { return f * absorbans(toppe, l); });
    }

    /* Samme, men absorbansen er en funktion af bølgelængden */
    function farveFn(A) {
        var v = xyz(function (l) { return Math.pow(10, -A(l)); });
        var lin = tilLineaer(v[0], v[1], v[2]);
        var lab = tilLab(v);
        return {
            r: gamma(lin[0] / HVID[0]),
            g: gamma(lin[1] / HVID[1]),
            b: gamma(lin[2] / HVID[2]),
            L: lab.L, C: lab.C, h: lab.h
        };
    }

    /* CIELAB med det hvide lys som hvidpunkt: lyshed L, maetning C og
       farvetonen h i grader. Navnet regnes af h og C, ikke af sRGB, som
       klipper de staerkeste farver og flytter tonen. */
    var HVID_XYZ = xyz(function () { return 1; });

    function fl(t) { return t > 0.008856 ? Math.pow(t, 1 / 3) : 7.787 * t + 16 / 116; }

    function tilLab(v) {
        var fx = fl(v[0] / HVID_XYZ[0]), fy = fl(v[1] / HVID_XYZ[1]), fz = fl(v[2] / HVID_XYZ[2]);
        var a = 500 * (fx - fy), b = 200 * (fy - fz);
        var h = Math.atan2(b, a) * 180 / Math.PI;
        if (h < 0) h += 360;
        return { L: 116 * fy - 16, C: Math.sqrt(a * a + b * b), h: h };
    }

    function css(c, alfa) {
        var r = Math.round(c.r * 255), gg = Math.round(c.g * 255), b = Math.round(c.b * 255);
        return alfa === undefined ? "rgb(" + r + "," + gg + "," + b + ")" : "rgba(" + r + "," + gg + "," + b + "," + alfa + ")";
    }

    /* Farvetone (0-360), maetning og styrke (HSV) */
    function hsv(c) {
        var mx = Math.max(c.r, c.g, c.b), mn = Math.min(c.r, c.g, c.b), d = mx - mn, h = 0;
        if (d > 1e-9) {
            if (mx === c.r) h = 60 * (((c.g - c.b) / d) % 6);
            else if (mx === c.g) h = 60 * ((c.b - c.r) / d + 2);
            else h = 60 * ((c.r - c.g) / d + 4);
        }
        if (h < 0) h += 360;
        return { h: h, s: mx > 0 ? d / mx : 0, v: mx, d: d };
    }

    /* ----- Navnet paa en opløsnings farve --------------------------------
       Regnes af CIELAB: er maetningen C under GRAENSE, er opløsningen
       farveløs. Ellers afgoer farvetonen h navnet. Graenserne er sat efter
       sRGB-farverne med de samme navne: gul (255, 255, 0) har h = 103,
       guld 91, orange (255, 165, 0) 73, moerkorange 64, laks (255, 160,
       122) ca. 48 og rød (255, 0, 0) 40. Lilla dækker baade violet og
       purpur. */
    var GRAENSE = 18;
    var NAVNE = [
        { navn: "Rød", fra: 345, til: 45 },
        { navn: "Orange", fra: 45, til: 85 },
        { navn: "Gul", fra: 85, til: 118 },
        { navn: "Grøn", fra: 118, til: 190 },
        { navn: "Blå", fra: 190, til: 285 },
        { navn: "Lilla", fra: 285, til: 345 }
    ];

    function iSektor(h, s) {
        return s.fra < s.til ? (h >= s.fra && h < s.til) : (h >= s.fra || h < s.til);
    }

    function navn(c) {
        if (c.C < GRAENSE) return "Farveløs";
        for (var i = 0; i < NAVNE.length; i++) if (iSektor(c.h, NAVNE[i])) return NAVNE[i].navn;
        return "Rød";
    }

    /* Hvor langt farvetonen er fra naermeste graense (til selvtesten) */
    function margin(c) {
        if (c.C < GRAENSE) return GRAENSE - c.C;
        var m = Math.abs(c.C - GRAENSE);
        NAVNE.forEach(function (s) {
            [s.fra, s.til].forEach(function (g) {
                var d = Math.abs(((c.h - g) % 360 + 540) % 360 - 180);
                if (d < m) m = d;
            });
        });
        return m;
    }

    /* ----- Lysets farve ved én bølgelængde ---------------------------------
       Til fotonerne, regnbuen under grafen og farvecirklen. Den rene
       farvetone (uden lysstyrke) bestemmer stedet i farvecirklen. */
    function lysTone(l) {
        if (l < 440) return 240 + 60 * NK.klamp((440 - l) / 60, 0, 1);
        if (l < 490) return 240 - 60 * (l - 440) / 50;
        if (l < 510) return 180 - 60 * (l - 490) / 20;
        if (l < 580) return 120 - 60 * (l - 510) / 70;
        if (l < 645) return 60 - 60 * (l - 580) / 65;
        return 0;
    }

    function toneRGB(h, s, v) {
        h = ((h % 360) + 360) % 360;
        var c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c, r, gg, b;
        if (h < 60) { r = c; gg = x; b = 0; }
        else if (h < 120) { r = x; gg = c; b = 0; }
        else if (h < 180) { r = 0; gg = c; b = x; }
        else if (h < 240) { r = 0; gg = x; b = c; }
        else if (h < 300) { r = x; gg = 0; b = c; }
        else { r = c; gg = 0; b = x; }
        return { r: r + m, g: gg + m, b: b + m };
    }

    /* Lyset ved bølgelængden l: farvetonen, svagere i yderkanterne */
    function lys(l) {
        var styrke = 1;
        if (l < 420) styrke = NK.klamp(0.3 + 0.7 * (l - 380) / 40, 0.25, 1);
        else if (l > 680) styrke = NK.klamp(0.3 + 0.7 * (760 - l) / 80, 0.25, 1);
        return toneRGB(lysTone(l), 1, styrke);
    }

    /* Navnet paa lyset ved en bølgelængde (som i den gamle b9.1) */
    function lysNavn(l) {
        if (l < 400) return "UV";
        if (l < 450) return "violet";
        if (l < 495) return "blå";
        if (l < 570) return "grøn";
        if (l < 590) return "gul";
        if (l < 620) return "orange";
        if (l <= 750) return "rød";
        return "infrarød";
    }

    /* ----- Polyenerne: kaeder med n konjugerede dobbeltbindinger ----------
       lambda_max ligger paa en glat kurve gennem tabelvaerdierne: ethen 171,
       buta-1,3-dien 217, hexa-1,3,5-trien 258, octa-1,3,5,7-tetraen 290,
       deca-1,3,5,7,9-pentaen 334 nm (McMurry, Organic Chemistry, tabel
       14.2) og lycopen 470 nm med 11. Kurven rammer dem inden for 5 nm.
       Hver kaede har tre toppe (den lange bølgelængde lidt lavere), som
       carotenoiderne i hexan, og toppene bliver hoejere med n, fordi
       molekylerne bliver bedre til at absorbere (epsilon vokser med n). */
    var TABEL_MAX = { 1: 171, 2: 217, 3: 258, 4: 290, 5: 334 };

    function kurveMax(n) {
        return TABEL_MAX[n] || 600 - 429 * Math.exp(-0.119 * (n - 1));
    }

    /* Hele tal: tabellen til og med 5, kurven derefter. Imellem (naar
       toppen glider fra en kaede til den naeste) en ret linje. */
    function polyenMax(n) {
        var a = Math.floor(n), t = n - a;
        if (t < 1e-9) return kurveMax(a);
        return kurveMax(a) + (kurveMax(a + 1) - kurveMax(a)) * t;
    }

    var VIB = 1350;     /* cm-1 mellem toppene (C=C-straekningen) */
    var BRED = 650;     /* spredningen i cm-1 */
    var PR_DB = 0.15;   /* absorbans pr. dobbeltbinding i toppen */

    function polyenToppe(n, faktor) {
        if (n < 1) return [];
        var f = faktor === undefined ? 1 : faktor;
        var lm = polyenMax(n), nu = 1e7 / lm, h = PR_DB * n * f;
        function top(nu2, hh) {
            var c = 1e7 / nu2;
            return { c: c, w: BRED * c * c / 1e7, h: hh };
        }
        return [top(nu - VIB, 0.86 * h), top(nu, h), top(nu + VIB, 0.62 * h)];
    }

    /* Det samme i intetkøn, til "... lys": violet, blåt, grønt, gult, orange, rødt */
    var INTETKOEN = { "blå": "blåt", "grøn": "grønt", gul: "gult", "rød": "rødt" };
    function lysOrd(l) {
        var n = lysNavn(l);
        return INTETKOEN[n] || n;
    }

    NK.Farve = {
        cmf: cmf,
        absorbans: absorbans,
        farve: farve,
        farveFn: farveFn,
        css: css,
        hsv: hsv,
        navn: navn,
        margin: margin,
        NAVNE: NAVNE,
        GRAENSE: GRAENSE,
        lys: lys,
        lysTone: lysTone,
        toneRGB: toneRGB,
        lysNavn: lysNavn,
        lysOrd: lysOrd,
        polyenMax: polyenMax,
        polyenToppe: polyenToppe,
        PR_DB: PR_DB
    };
}());

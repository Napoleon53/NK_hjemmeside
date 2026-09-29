/* =====================================================================
   kemi.js - modellen bag alle tre faner

   pH og koncentrationerne ved 25 °C, antallet af ioner i luppen,
   fortynding af en staerk syre og en staerk base og universalindikatorens
   farver. Intet her tegner noget.

   Luppen: ved zoomtrin z viser den et rumfang paa 10^z / N_A liter. Saa
   er antallet af en ion med koncentrationen c (mol/L) praecis c · 10^z,
   og ét zoom er et 10 gange stoerre eller mindre rum. 1 prik = 1 ion.
   Luppen zoomer selv (K.autoZoom): der er altid mellem 10 og 100 af den
   ion, der er flest af, og rummet er aldrig stoerre end i rent vand.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    K.KW = 1.0e-14;          /* vands ionprodukt ved 25 °C, M² */
    K.NA = 6.022e23;         /* Avogadros tal, 1/mol */
    K.ZOOM_NEUTRAL = 8;      /* rent vand: 10 H₃O⁺ og 10 OH⁻ */
    K.ZOOM_MIN = 1;          /* pH -1 og 15: 100 af den ene */
    K.PH_MIN = -1;           /* skalaen stopper ikke ved 0 og 14 */
    K.PH_MAKS = 15;
    K.ZOOM_MAKS = K.ZOOM_NEUTRAL;

    function log10(v) { return Math.log(v) / Math.LN10; }
    K.log10 = log10;

    /* ----- pH og koncentrationer ---------------------------------------- */
    K.h3o = function (ph) { return Math.pow(10, -ph); };
    K.oh = function (ph) { return K.KW / K.h3o(ph); };
    K.phAf = function (h3o) { return -log10(h3o); };

    /* En staerk syre (HCl) eller base (NaOH) med koncentrationen c. Vandets
       egne ioner er med: [H₃O⁺] = c/2 + √(c²/4 + Kw) for syren, og det
       samme for [OH⁻] for basen. Derfor gaar pH mod 7 og aldrig forbi. */
    K.syre = function (c) {
        var h = c / 2 + Math.sqrt(c * c / 4 + K.KW);
        return { h3o: h, oh: K.KW / h, ph: -log10(h) };
    };

    K.base = function (c) {
        var o = c / 2 + Math.sqrt(c * c / 4 + K.KW);
        var h = K.KW / o;
        return { h3o: h, oh: o, ph: -log10(h) };
    };

    /* ----- Luppen --------------------------------------------------------- */
    K.antal = function (c, z) { return c * Math.pow(10, z); };
    K.rumfang = function (z) { return Math.pow(10, z) / K.NA; };            /* liter */
    K.side = function (z) { return Math.pow(K.rumfang(z) * 1e-3, 1 / 3); };  /* meter */

    /* Det rum, luppen selv vaelger: flest af den ene ion giver over 10 og
       hoejst ca. 100 af den (ved pH 6 er der 100 H₃O⁺ i samme rum som rent
       vand, ved pH 5,9 zoomer den ind). Rent vand er ZOOM_NEUTRAL. Den lille
       luft (0,01) holder de fortyndede glas med pH 5,00 og 6,00 paa 100 og
       101, selv om vandets egne ioner goer dem en anelse surere. */
    K.autoZoom = function (h3o, oh) {
        var z = Math.floor(2 - log10(Math.max(h3o, oh)) + 0.01);
        return NK.klamp(z, K.ZOOM_MIN, K.ZOOM_NEUTRAL);
    };

    /* Hvor meget mindre rummet er end i rent vand. kort: uden antallet af zoom */
    K.rumTekst = function (z, kort) {
        var k = K.ZOOM_NEUTRAL - z;
        if (k <= 0) return "Samme rum som i rent vand";
        var rest = K.tusind(Math.pow(10, k)) + " gange mindre";
        return kort ? "Rummet er " + rest : "Zoomet " + (k === 1 ? "én gang" : k + " gange") + " ind: rummet er " + rest;
    };

    /* Terningens side med en passende enhed. Luppen gaar fra 2,6 nm ved
       pH -1 og 15 til 550 nm i rent vand. */
    K.sideTekst = function (z) {
        var s = K.side(z);
        if (s < 1e-6) return NK.betydende(s * 1e9, 2) + " nm";
        if (s < 1e-4) return NK.betydende(s * 1e6, 2) + " µm";
        return NK.betydende(s * 1e3, 2) + " mm";
    };

    /* ----- Universalindikatorens farver (som sb3.2) ------------------------ */
    var UNIVERSAL = [
        [0, [200, 20, 40]], [2, [222, 55, 45]], [3, [240, 105, 35]], [4, [246, 160, 35]],
        [5, [242, 210, 50]], [6, [200, 220, 60]], [7, [60, 175, 80]], [8, [45, 160, 150]],
        [9, [45, 125, 195]], [10, [55, 90, 180]], [11, [85, 65, 165]], [12, [105, 45, 150]],
        [14, [75, 25, 110]]
    ];

    K.farve = function (ph) {
        var p = NK.klamp(ph, 0, 14);
        for (var i = 1; i < UNIVERSAL.length; i++) {
            if (p <= UNIVERSAL[i][0]) {
                var t = (p - UNIVERSAL[i - 1][0]) / (UNIVERSAL[i][0] - UNIVERSAL[i - 1][0]);
                var a = UNIVERSAL[i - 1][1], b = UNIVERSAL[i][1];
                return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
            }
        }
        return UNIVERSAL[UNIVERSAL.length - 1][1].slice();
    };

    K.farveCss = function (ph, alfa) {
        var c = K.farve(ph);
        return "rgba(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + "," + (alfa === undefined ? 1 : alfa) + ")";
    };

    /* ----- Tal og ord ------------------------------------------------------- */
    /* Et helt tal med punktum for hvert tusind: 10000 -> "10.000" */
    K.tusind = function (n) {
        var s = String(Math.round(Math.abs(n)));
        var ud = "";
        while (s.length > 3) {
            ud = "." + s.slice(-3) + ud;
            s = s.slice(0, -3);
        }
        return (n < 0 ? "−" : "") + s + ud;
    };

    /* pH med én eller to decimaler og dansk komma */
    K.phTekst = function (ph, dec) {
        dec = dec === undefined ? 1 : dec;
        var v = Math.round(ph * Math.pow(10, dec)) / Math.pow(10, dec);
        if (Math.abs(v) < 1e-9) v = 0;
        return v.toFixed(dec).replace(".", ",").replace("-", "−");
    };

    /* Sur, neutral eller basisk ud fra den pH, der vises */
    K.surhed = function (ph, dec) {
        var v = parseFloat(K.phTekst(ph, dec).replace(",", "."));
        if (v < 7) return "sur";
        if (v > 7) return "basisk";
        return "neutral";
    };

    /* En potens af ti, pænt: 10⁵, 3,2 · 10⁵ */
    function potens(v) {
        var e = Math.floor(log10(v) + 1e-9);
        var m = v / Math.pow(10, e);
        if (m >= 9.95) { m /= 10; e++; }
        if (Math.abs(m - 1) < 0.05) return "10" + NK.haevet(e);
        return NK.betydende(m, 2) + " · 10" + NK.haevet(e);
    }
    K.potens = potens;

    /* Antallet af ioner i luppen: 0, 7, 1.000, 10⁵ */
    K.antalTekst = function (n) {
        if (n < 0.5) return "0";
        if (n < 1e4) return K.tusind(n);
        return potens(n);
    };

    /* Gennemsnittet, naar der er under én ion: 0,3 eller 10⁻⁸ */
    K.gennemsnitTekst = function (n) {
        if (n >= 0.01) return NK.betydende(n, 1);
        return potens(n);
    };

    var STORE = [
        [1e12, "billion", "billioner"],
        [1e9, "milliard", "milliarder"],
        [1e6, "million", "millioner"]
    ];

    /* Et stort tal i ord med to betydende cifre: 50.000, 3,2 millioner */
    K.ord = function (f) {
        if (f < 10) {
            var r = Math.round(f * 10) / 10;
            return String(r).replace(".", ",");
        }
        for (var i = 0; i < STORE.length; i++) {
            if (f >= STORE[i][0] * 0.995) {
                var m = f / STORE[i][0];
                var t = m >= 100 ? K.tusind(Math.round(m / 10) * 10) : NK.betydende(m, 2);
                t = t.replace(/,0$/, "");
                return t + " " + (t === "1" ? STORE[i][1] : STORE[i][2]);
            }
        }
        var e = Math.floor(log10(f)) - 1;
        return K.tusind(Math.round(f / Math.pow(10, e)) * Math.pow(10, e));
    };

    /* Hvor mange gange flere H₃O⁺ eller OH⁻ end i rent vand */
    K.modVand = function (ph) {
        var s = K.surhed(ph, 1);
        if (s === "neutral") return "Lige så mange H₃O⁺ og OH⁻ som i rent vand.";
        var f = Math.pow(10, Math.abs(7 - ph));
        var ion = s === "sur" ? "H₃O⁺" : "OH⁻";
        var praecis = Math.abs(ph - Math.round(ph)) < 0.01;
        return (praecis ? "" : "Ca. ") + K.ord(f) + " gange så mange " + ion + " som i rent vand.";
    };

    NK.Kemi = K;
}());

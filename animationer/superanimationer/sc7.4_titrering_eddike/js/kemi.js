/* =====================================================================
   kemi.js - modellen: eddikesyre titreret med natriumhydroxid (NaOH)

   Ingen DOM og ingen tegning. En proeve er { m, p, vand, c }:
     m     eddikens masse i gram (2,00 g)
     p     eddikesyrens masseprocent (4,0-5,5 %)
     vand  vand i kolben, mL (20 mL)
     c     koncentrationen af NaOH, mol/L (0,100 M)

   pH findes af ladningsbalancen for eddikesyre, acetat og natrium:
     [Na⁺] + [H₃O⁺] = [OH⁻] + [CH₃COO⁻]
   som i den gamle c7.4 og i sb3.2. Venstre minus hoejre vokser med
   [H₃O⁺], saa nulpunktet findes ved halvering paa log-skala.

   Tallene: M(CH₃COOH) = 60,05 g/mol, pKs = 4,76 (Databogen),
   Kw = 1,0 · 10⁻¹⁴ M² ved 25 °C. Phenolphthalein: omslag 8,2-10,0,
   her regnet som en indikator med pKs 9,4.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    K.M_SYRE = 60.05;          /* g/mol, CH₃COOH */
    K.M_NAOH = 40.00;          /* g/mol, kun til at genkende en fejl */
    K.PKS = 4.76;
    K.KS = Math.pow(10, -K.PKS);
    K.KW = 1.0e-14;
    K.PK_IND = 9.4;            /* phenolphthalein */

    K.C_NAOH = 0.100;          /* mol/L */
    K.PROEVE = 2.00;           /* g eddike */
    K.VAND = 20;               /* mL vand i kolben */
    K.DRAABE = 0.05;           /* mL pr. draabe */
    K.BURET = 25;              /* mL, burettens inddeling */
    K.FIGURER = 8;             /* figurer i luppen: 1 figur = 1/8 af syren */

    /* En ny eddike: masseprocent mellem 4,00 og 5,50 med to decimaler */
    K.nyProeve = function (p) {
        if (p === undefined) p = Math.round((4.0 + Math.random() * 1.5) * 100) / 100;
        return { m: K.PROEVE, p: p, vand: K.VAND, c: K.C_NAOH };
    };

    /* Stofmaengden af eddikesyre i proeven, mol */
    K.nSyre = function (pr) {
        return pr.m * pr.p / 100 / K.M_SYRE;
    };

    /* Forbruget ved aekvivalenspunktet, mL */
    K.vAek = function (pr) {
        return K.nSyre(pr) / pr.c * 1000;
    };

    /* Masseprocenten regnet ud af et forbrug, som eleven ville regne den
       (med den koncentration og masse, eleven tror, der er) */
    K.procent = function (v, c, m) {
        return v / 1000 * c * K.M_SYRE / m * 100;
    };

    /* pH i kolben, naar v mL NaOH er tilsat. Eddikens eget rumfang
       regnes som 1 mL pr. gram. */
    K.ph = function (pr, v) {
        var nA = K.nSyre(pr);
        var nB = pr.c * v / 1000;
        var vTot = (pr.vand + pr.m + v) / 1000;
        if (vTot <= 0) return 7;
        var cA = nA / vTot, cB = nB / vTot;
        var ks = K.KS, kw = K.KW;
        /* f(h) = [Na⁺] + h − Kw/h − [CH₃COO⁻], voksende i h */
        function f(h) { return cB + h - kw / h - cA * ks / (ks + h); }
        var lo = 1e-14, hi = 1;
        for (var i = 0; i < 70; i++) {
            var mid = Math.sqrt(lo * hi);
            if (f(mid) > 0) hi = mid; else lo = mid;
        }
        return -Math.log(Math.sqrt(lo * hi)) / Math.LN10;
    };

    /* Brokdelen af phenolphthalein paa den lyserøde form ved en pH */
    K.lyserod = function (ph) {
        return 1 / (1 + Math.pow(10, K.PK_IND - ph));
    };

    /* Hvor tydelig farven er for oejet: 0 farveloes, 1 staerk. Lige ved
       aekvivalenspunktet (pH ca. 8,7) er den svag; en draabe mere giver
       tydelig lyserød, og et overskud giver moerk lyserød. */
    K.farveStyrke = function (ph) {
        return NK.klamp(Math.pow(K.lyserod(ph), 1.3), 0, 1);
    };

    /* Vaeskens farve i kolben (css) ved en styrke 0-1 */
    K.kolbeFarve = function (styrke, alfa) {
        var s = NK.klamp(styrke, 0, 1);
        var r = Math.round(NK.lerp(214, 232, s));
        var g = Math.round(NK.lerp(230, 58, s));
        var b = Math.round(NK.lerp(242, 150, s));
        var a = alfa === undefined ? NK.lerp(0.26, 0.78, s) : alfa;
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    };

    /* Kolbens farve beskrevet i ord */
    K.farveOrd = function (styrke) {
        if (styrke < 0.04) return "farveløs";
        if (styrke < 0.45) return "svagt lyserød";
        if (styrke < 0.9) return "lyserød";
        return "mørk lyserød";
    };

    /* ----- Tal i tekst ---------------------------------------------------------- */
    /* Et rumfang med to decimaler: 14,15 */
    K.mL = function (v) {
        return NK.tal2(v);
    };

    /* En masseprocent med to decimaler: 4,72 */
    K.pct = function (p) {
        return NK.tal2(p);
    };

    /* En koncentration med tre decimaler: 0,100 og 0,090 */
    K.c = function (c) {
        return c.toFixed(3).replace(".", ",");
    };

    /* En stofmaengde i potensform med fire betydende cifre: 1,415 · 10⁻³ */
    K.mol = function (n, cifre) {
        return NK.potens(n, cifre || 4);
    };

    /* En masse med fire betydende cifre: 0,08497 */
    K.gram = function (m, cifre) {
        return NK.betydende(m, cifre || 4);
    };

    NK.Kemi = K;
}());

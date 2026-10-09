/* =====================================================================
   kemi.js - modellen: syrerne, og hvor stor en del der afgiver en hydron

   Alt, eleven ser, er regnet herfra: antallet af oxoniumioner i luppen,
   hvor meget kalken bruser, og pH. Syrekonstanterne er Databogens
   (25 °C). Tegningen ligger i js/lup.js, js/glas.js og js/tegning.js.

   En syre HA i vand:   HA + H₂O ⇌ A⁻ + H₃O⁺
   En staerk syre afgiver alle sine hydroner: [H₃O⁺] = c.
   En svag syre:  Ks = x² / (c − x), hvor x = [H₃O⁺].
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    K.NA = 6.022e23;

    /* Glassene har 0,10 M syre, naar intet andet er sagt. Luppen viser et
       rum, hvor der ved 0,10 M er haeldt netop 100 syremolekyler i. */
    K.C0 = 0.10;
    K.LUP_N = 100;
    K.LUP_L = K.LUP_N / (K.C0 * K.NA);                        /* 1,66 · 10⁻²¹ L */
    K.VAND_I_LUP = Math.round(55.5 * K.NA * K.LUP_L / 1000) * 1000;   /* ca. 55.000 vandmolekyler */

    /* pKs fra Databogen. ion er det, der er tilbage af syren, naar
       hydronen er afgivet (syrens korresponderende base). */
    K.SYRE = {
        HCl:    { navn: "saltsyre",     formel: "HCl",     ion: "Cl⁻",      ionNavn: "chloridion", staerk: true },
        HNO3:   { navn: "salpetersyre", formel: "HNO₃",    ion: "NO₃⁻",     ionNavn: "nitration",  staerk: true },
        eddike: { navn: "eddikesyre",   formel: "CH₃COOH", ion: "CH₃COO⁻",  ionNavn: "acetation",  pKs: 4.76 },
        myre:   { navn: "myresyre",     formel: "HCOOH",   ion: "HCOO⁻",    ionNavn: "methanoation", pKs: 3.75 },
        citron: { navn: "citronsyre",   formel: "C₆H₈O₇",  ion: "C₆H₇O₇⁻",  ionNavn: "citronsyrens ion", pKs: 3.13 }
    };

    K.navn = function (id) { return K.SYRE[id].navn; };
    K.Navn = function (id) { var n = K.SYRE[id].navn; return n.charAt(0).toUpperCase() + n.slice(1); };
    K.erStaerk = function (id) { return !!K.SYRE[id].staerk; };

    K.Ks = function (id) { return Math.pow(10, -K.SYRE[id].pKs); };

    /* [H₃O⁺] i M i en oploesning med den formelle koncentration c */
    K.oxonium = function (id, c) {
        if (!(c > 0)) return 0;
        if (K.SYRE[id].staerk) return c;
        var Ks = K.Ks(id);
        return (-Ks + Math.sqrt(Ks * Ks + 4 * Ks * c)) / 2;
    };

    /* Den del af molekylerne, der har afgivet en hydron (0 til 1) */
    K.andel = function (id, c) {
        return c > 0 ? K.oxonium(id, c) / c : 0;
    };

    K.pH = function (id, c) {
        var x = K.oxonium(id, c);
        return x > 0 ? -Math.log(x) / Math.LN10 : 7;
    };

    /* Luppens rum: hvor mange molekyler der er haeldt i, og hvor mange af
       dem der har afgivet en hydron. Antallet af delte er gennemsnittet
       afrundet til et helt tal. */
    K.iLup = function (id, c) {
        var haeldt = Math.round(c / K.C0 * K.LUP_N);
        var delte = Math.round(haeldt * K.andel(id, c));
        if (!K.SYRE[id].staerk && haeldt >= 50 && delte < 1) delte = 1;
        return { haeldt: haeldt, delte: delte, hele: haeldt - delte };
    };

    /* Hvor meget kalken bruser: 1 for 0,10 M saltsyre. Kalken reagerer
       med oxoniumionerne, saa brusen foelger [H₃O⁺]. */
    K.brus = function (id, c) {
        return K.oxonium(id, c) / K.C0;
    };

    /* Fortynding: 10 gange ad gangen, hoejst tre gange */
    K.TRIN = [0.10, 0.010, 0.0010, 0.00010];

    K.konc = function (c) { return NK.betydende(c, 2) + " M"; };

    K.pHTekst = function (id, c) { return K.pH(id, c).toFixed(2).replace(".", ","); };

    /* Reaktionsskemaet med vand. pil: "→", "⇌" eller "?" */
    K.skema = function (id, pil) {
        var s = K.SYRE[id];
        if (pil === undefined) pil = s.staerk ? "→" : "⇌";
        return s.formel + " + H₂O " + pil + " " + s.ion + " + H₃O⁺";
    };

    K.pil = function (id) { return K.SYRE[id].staerk ? "→" : "⇌"; };

    NK.Kemi = K;
}());

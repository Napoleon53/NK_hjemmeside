/* =====================================================================
   model.js - kemien bag forsoeget

   Glasset rummer 6 streger gas. Lige store rumfang gas indeholder lige
   mange molekyler, saa hver streg tegnes som 2 molekyler: 4 streger H2
   og 2 streger O2 er 8 H2 og 4 O2 - netop forholdet 2 : 1 fra
   reaktionsskemaet 2 H2 + O2 -> 2 H2O.

   Knaldets styrke er proportional med den maengde vand, der dannes.
   Mest vand (8 molekyler) dannes ved 4 : 2, hvor alt reagerer; derfor
   er det 100 %. Tallene er de samme som i den gamle animation:
   0 : 6 og 6 : 0 giver 0, 1 : 5 giver 25, 2 : 4 og 5 : 1 giver 50,
   3 : 3 giver 75 og 4 : 2 giver 100.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var MAKS = 6;          /* streger i glasset */
    var PR_STREG = 2;      /* molekyler pr. streg paa tegningen */
    var MAKS_H2O = 8;      /* vand ved den bedste blanding, 4 : 2 */

    function reaktion(h, o) {
        var h2 = h * PR_STREG;
        var o2 = o * PR_STREG;
        var o2Brugt = Math.min(o2, Math.floor(h2 / 2));
        var h2Brugt = o2Brugt * 2;
        var h2o = o2Brugt * 2;
        return {
            h: h, o: o,
            h2: h2, o2: o2,
            h2Brugt: h2Brugt, o2Brugt: o2Brugt,
            h2o: h2o,
            restH2: h2 - h2Brugt,
            restO2: o2 - o2Brugt,
            styrke: Math.round(h2o / MAKS_H2O * 100)
        };
    }

    /* Ordet, der staar paa scenen efter knaldet. */
    function ord(styrke) {
        if (styrke >= 95) return "KABOOM!";
        if (styrke >= 70) return "Kraftigt knald";
        if (styrke >= 45) return "Knald";
        if (styrke > 0) return "Svagt knald";
        return "Ingen reaktion";
    }

    /* De syv blandinger, der kan testes med et fuldt glas. */
    var BLANDINGER = [];
    for (var h = 0; h <= MAKS; h++) BLANDINGER.push({ h: h, o: MAKS - h });

    NK.Model = {
        MAKS: MAKS,
        PR_STREG: PR_STREG,
        BLANDINGER: BLANDINGER,
        reaktion: reaktion,
        ord: ord
    };
}());

/* =====================================================================
   frastoedning.js - elektronparrene omkring et atom skubber til
   hinanden

   Hver gruppe (en binding eller et frit elektronpar) er en retning u
   paa en kugle om atomet. Alle grupper skubber til alle andre med en
   kraft, der aftager med afstanden. Et frit elektronpar skubber lidt
   haardere end en binding, og to frie par skubber endnu haardere.
   Styrkerne staar i NK.Data.FRASTOED og er valgt, saa NH3 faar 107° og
   H2O 104,5° (se README).

   En dobbelt- eller tripelbinding er én gruppe og skubber som en
   enkeltbinding. Derfor er CO2 lineaer, og CH2O er plan med 120°.

   Bruges af data.js (frie elektronpar paa fane 2 og 3) og bygning.js
   (hele geometrien paa fane 1).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var V = NK.V;

    var MAKS_KRAFT = 8;

    function styrke(a, b) {
        var F = NK.Data.FRASTOED;
        var fa = a.type === "fri", fb = b.type === "fri";
        if (fa && fb) return F.LL;
        if (fa || fb) return F.LB;
        return 1;
    }

    function begraens(v, maks) {
        var l = V.laengde(v);
        return l > maks ? V.gange(v, maks / l) : v;
    }

    NK.Frastoed = {
        /* Kraften paa hver gruppe, lagt ind i kuglens overflade. */
        kraefter: function (grupper) {
            var F = NK.Data.FRASTOED;
            var n = grupper.length, ud = [], i, j;
            for (i = 0; i < n; i++) ud.push([0, 0, 0]);
            for (i = 0; i < n; i++) {
                for (j = i + 1; j < n; j++) {
                    var d = V.minus(grupper[i].u, grupper[j].u);
                    /* Ligger to grupper oven i hinanden, er der ingen retning at
                       skubbe i. Saa skubbes de til hver sin side. */
                    if (V.laengde(d) < 0.02) d = V.gange(V.vinkelret(grupper[i].u), 0.02);
                    var r = V.laengde(d) + 1e-4;
                    var k = styrke(grupper[i], grupper[j]) / Math.pow(r, F.n + 1);
                    ud[i] = V.plus(ud[i], V.gange(d, k));
                    ud[j] = V.minus(ud[j], V.gange(d, k));
                }
            }
            for (i = 0; i < n; i++) {
                var u = grupper[i].u;
                ud[i] = begraens(V.minus(ud[i], V.gange(u, V.prik(ud[i], u))), MAKS_KRAFT);
            }
            return ud;
        },

        /* Finder ligevaegten. Grupper med fast = true bliver, hvor de er. */
        ligevaegt: function (grupper, antal) {
            antal = antal || 3000;
            for (var s = 0; s < antal; s++) {
                var kr = this.kraefter(grupper);
                for (var i = 0; i < grupper.length; i++) {
                    if (grupper[i].fast) continue;
                    grupper[i].u = V.enhed(V.plus(grupper[i].u, V.gange(kr[i], 0.01)));
                }
            }
            return grupper;
        }
    };
}());

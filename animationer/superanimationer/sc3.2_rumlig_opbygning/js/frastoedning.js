/* =====================================================================
   frastoedning.js - elektronparrene omkring et centralatom skubber til
   hinanden

   Hver gruppe (en binding eller et frit elektronpar) er en retning u
   paa en kugle om centralatomet. Alle grupper skubber til alle andre
   med en kraft, der aftager med afstanden. Et frit elektronpar skubber
   lidt haardere end en binding, og to frie par skubber endnu haardere.
   Styrkerne staar i NK.Data.FRASTOED og er valgt, saa NH3 faar 107° og
   H2O 104,5° (se README).

   En dobbelt- eller tripelbinding er én gruppe og skubber som en
   enkeltbinding. Derfor er CO2 lineaer, og CH2O er plan med 120°.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var V = NK.V;

    var MAKS_KRAFT = 8;
    var MAKS_FART = 7;

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

        /* Et tidsskridt. En gruppe med holdt = true foelger musen og
           paavirkes ikke. Store skridt deles op, saa det ikke eksploderer. */
        skridt: function (grupper, dt) {
            var F = NK.Data.FRASTOED;
            var antal = Math.max(1, Math.ceil(dt / (1 / 120)));
            var h = dt / antal;
            var daemp = Math.exp(-F.daempning * h);
            for (var s = 0; s < antal; s++) {
                var kr = this.kraefter(grupper);
                for (var i = 0; i < grupper.length; i++) {
                    var g = grupper[i];
                    if (g.holdt) { g.v = [0, 0, 0]; continue; }
                    g.v = begraens(V.plus(V.gange(g.v || [0, 0, 0], daemp), V.gange(kr[i], F.kraft * h)), MAKS_FART);
                    g.u = V.enhed(V.plus(g.u, V.gange(g.v, h)));
                    g.v = V.minus(g.v, V.gange(g.u, V.prik(g.v, g.u)));
                }
            }
        },

        /* Hvor meget bevaeger grupperne sig lige nu? */
        uro: function (grupper) {
            var m = 0;
            grupper.forEach(function (g) { if (g.v) m = Math.max(m, V.laengde(g.v)); });
            return m;
        },

        /* Gaar direkte til ligevaegten uden at vise vejen dertil. Grupper
           med fast = true bliver, hvor de er (bruges af data.js til at
           placere frie elektronpar om faste bindinger). */
        ligevaegt: function (grupper, antal) {
            antal = antal || 3000;
            for (var s = 0; s < antal; s++) {
                var kr = this.kraefter(grupper);
                for (var i = 0; i < grupper.length; i++) {
                    if (grupper[i].fast) continue;
                    grupper[i].u = V.enhed(V.plus(grupper[i].u, V.gange(kr[i], 0.01)));
                }
            }
            grupper.forEach(function (g) { g.v = [0, 0, 0]; });
            return grupper;
        },

        /* En retning til en ny gruppe: modsat de andre, med lidt uro, saa
           to grupper aldrig starter oven i hinanden. */
        nyRetning: function (grupper) {
            var sum = [0, 0, 0];
            grupper.forEach(function (g) { sum = V.plus(sum, g.u); });
            var uro = [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5];
            var u = V.laengde(sum) > 0.2 ? V.gange(V.enhed(sum), -1) : V.enhed(uro);
            if (!grupper.length) u = [0, 1, 0];
            return V.enhed(V.plus(u, V.gange(uro, 0.5)));
        }
    };
}());

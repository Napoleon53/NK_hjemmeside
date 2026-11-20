/* =====================================================================
   model.js - kemien bag fane 1 og 2

   En ligevaegt er en liste af stoffer med koefficienter nu (negative for
   reaktanterne) og en ligevaegtskonstant K. Stofmaengderne n er antal
   partikler i beholderen, og rumfanget V er i liter (fane 1) eller i
   portioner af 25 mL (fane 2). Reaktionsbroeken er produktet af
   (n / V)^nu. Ligevaegten findes ved halvering paa ln Y - ln K, og
   partiklerne foelger: for hvert helt omfang (xi = 1) bliver én
   reaktionsenhed lavet om.

   Fane 1: N2O4(g) <=> 2 NO2(g). Et molekyle staar for 0,020 mol, saa
   4 N2O4 og 10 NO2 i 2,0 L giver [N2O4] = 0,040 M og [NO2] = 0,10 M og
   K = 0,10^2 / 0,040 = 0,25 M. Ved 1,0 L bliver det 5 og 8 (Y = 0,256 M)
   og ved 4,0 L 3 og 12 (Y = 0,24 M), saa tegningen passer inden for 5 %.

   Fane 2: Co2+(aq) + 4 Cl-(aq) <=> CoCl4 2-(aq) med de samme tal som
   figur B2.10 i Kemibogen: 2 CoCl4 2-, 1 Co2+ og 10 Cl- i 25 mL, og
   efter en fortynding til 50 mL 1, 2 og 14 (inden for 5 %). K er givet i
   partikler pr. portion, fordi kun forholdet Y / K bruges.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = {};

    M.GAS = {
        navn: "gas", stoffer: ["N2O4", "NO2"], nu: [-1, 2],
        MOL: 0.020,                       /* mol pr. molekyle */
        start: [4, 10], V0: 2.0
    };
    M.GAS.K = M.GAS.start[1] * M.GAS.start[1] / (M.GAS.start[0] * M.GAS.V0);     /* 12,5 molekyler pr. L */
    M.GAS.KM = M.GAS.K * M.GAS.MOL;                                               /* 0,25 M */

    M.OPL = {
        navn: "opl", stoffer: ["Co", "Cl", "CoCl4"], nu: [-1, -4, 1],
        start: [1, 10, 2], V0: 1
    };
    M.OPL.K = 2 / (1 * Math.pow(10, 4));                                          /* 2,0 · 10⁻⁴ */

    M.Y = function (r, n, V) {
        var y = 1;
        for (var i = 0; i < r.nu.length; i++) {
            var c = n[i] / V, p = r.nu[i];
            if (c <= 1e-12) { if (p < 0) return Infinity; return 0; }
            y *= Math.pow(c, p);
        }
        return y;
    };

    M.efter = function (r, n0, xi) {
        return n0.map(function (n, i) { return n + r.nu[i] * xi; });
    };

    /* Det omfang, der giver ligevaegt ved rumfanget V, regnet fra n0 */
    M.ligevaegtXi = function (r, n0, V) {
        var lo = -Infinity, hi = Infinity;
        r.nu.forEach(function (p, i) {
            if (p > 0) lo = Math.max(lo, -n0[i] / p);
            if (p < 0) hi = Math.min(hi, n0[i] / -p);
        });
        var span = hi - lo;
        lo += span * 1e-9; hi -= span * 1e-9;
        var lnK = Math.log(r.K);
        for (var k = 0; k < 100; k++) {
            var m = (lo + hi) / 2;
            var y = M.Y(r, M.efter(r, n0, m), V);
            if (Math.log(y) < lnK) lo = m; else hi = m;
        }
        return (lo + hi) / 2;
    };

    /* Koncentrationen i M paa fane 1 */
    M.konc = function (n) { return n * M.GAS.MOL; };

    NK.Model = M;
}());

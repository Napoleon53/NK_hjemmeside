/* =====================================================================
   gitter.js - krystalgitteret paa vandfanen

   Hver krystal er et udsnit af det samme moenster: et skakbraet, hvor
   plus og minus skiftes. Saa sidder hver ion op ad ioner med modsat
   ladning, og to ioner med samme ladning roerer aldrig hinanden.

     1 : 1          skakbraet, 4 x 3 pladser (NaCl, BaSO₄)
     1 : 2, 2 : 1   den hyppigste ion i et net paa 4 x 3, den anden i
                    alle hullerne mellem fire naboer (CaCl₂, Na₂SO₄)
     1 : 3, 3 : 1   samme, net paa 3 x 2 (AlCl₃, Na₃PO₄)
     2 : 3, 3 : 2   skakbraet paa 6 x 3, hvor den sjaeldneste ion
                    mangler i oeverste lag (Al₂(SO₄)₃, Ca₃(PO₄)₂)

   Afstanden i gitteret er den mindste, hvor ingen ioner overlapper, og
   hvor ioner med samme ladning holder en lille afstand (MARGIN). Alt
   regnes i enheder, der ikke afhaenger af skaermen: radius 1 er en
   almindelig negativ ion som Cl⁻.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var MARGIN = 0.08;

    /* Ionernes stoerrelse i vandet. Tre trin i samme raekkefoelge som de
       rigtige ionradier: metalionerne er mindst, saa de enkle negative
       ioner, og de sammensatte negative ioner er stoerst. NH₄⁺ er paa
       stoerrelse med en negativ ion. Forholdene er ikke i skala, saa
       formlerne kan laeses paa kuglerne. */
    function radius(ion) {
        if (ion.id === "NH4") return 1.05;
        if (ion.q > 0) return 0.8;
        if (!ion.sammensat || ion.id === "OH") return 1.0;
        return 1.25;
    }

    /* Pladserne i gitterenheder. hyppig/sjaelden er "kat" eller "an". */
    function skakbraet(b, h, hyppig, sjaelden, topFri) {
        var ud = [], i, j;
        for (j = 0; j < h; j++) {
            for (i = 0; i < b; i++) {
                var alfa = (i + j) % 2 === 0;
                if (!alfa && topFri && j === h - 1) continue;
                ud.push({ side: alfa ? hyppig : sjaelden, gx: i, gy: j });
            }
        }
        return ud;
    }

    function netMedHuller(b, h, hyppig, sjaelden) {
        var ud = [], i, j;
        for (j = 0; j < h; j++) for (i = 0; i < b; i++) ud.push({ side: hyppig, gx: i, gy: j });
        for (j = 0; j < h - 1; j++) for (i = 0; i < b - 1; i++) ud.push({ side: sjaelden, gx: i + 0.5, gy: j + 0.5 });
        return ud;
    }

    /* Krystallen for et salt. Punkterne har side, r, x (0 = midten) og
       y (0 = krystallens underkant, vokser opad), maalt i enheder. */
    NK.lavGitter = function (salt) {
        var p = salt.p, n = salt.n;
        var hyppig = p >= n ? "kat" : "an", sjaelden = hyppig === "kat" ? "an" : "kat";
        var stor = Math.max(p, n), lil = Math.min(p, n);
        var pladser;
        if (stor === lil) pladser = skakbraet(4, 3, "kat", "an", false);
        else if (stor === 2 * lil) pladser = netMedHuller(4, 3, hyppig, sjaelden);
        else if (stor === 3 * lil) pladser = netMedHuller(3, 2, hyppig, sjaelden);
        else pladser = skakbraet(6, 3, hyppig, sjaelden, true);

        var r = { kat: radius(salt.kat), an: radius(salt.an) };
        var i, j, a;

        /* Den mindste afstand, hvor alle par har plads. */
        var d = 0;
        for (i = 0; i < pladser.length; i++) {
            for (j = i + 1; j < pladser.length; j++) {
                var pa = pladser[i], pb = pladser[j];
                var g = Math.sqrt((pa.gx - pb.gx) * (pa.gx - pb.gx) + (pa.gy - pb.gy) * (pa.gy - pb.gy));
                var krav = r[pa.side] + r[pb.side] + (pa.side === pb.side ? MARGIN : 0);
                d = Math.max(d, krav / g);
            }
        }

        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        var punkter = pladser.map(function (pl) {
            var o = { side: pl.side, r: r[pl.side], x: pl.gx * d, y: pl.gy * d };
            minX = Math.min(minX, o.x - o.r); maxX = Math.max(maxX, o.x + o.r);
            minY = Math.min(minY, o.y - o.r); maxY = Math.max(maxY, o.y + o.r);
            return o;
        });
        for (i = 0; i < punkter.length; i++) {
            a = punkter[i];
            a.x -= (minX + maxX) / 2;
            a.y -= minY;
        }
        var antalKat = punkter.filter(function (o) { return o.side === "kat"; }).length;
        return { punkter: punkter, k: antalKat / p, bredde: maxX - minX, hoejde: maxY - minY, d: d };
    };

    NK.ionRadiusVand = radius;
}());

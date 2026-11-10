/* =====================================================================
   tjek.js - tjek af det, eleven skriver i skemaet

   Fire slags felter: molarmassen (M), stofmaengden ud fra massen
   (n = m / M), stofmaengden ud fra et andet stof (koefficienterne) og
   massen ud fra stofmaengden (m = n · M). Dertil koefficienterne, naar
   skemaet skal afstemmes.

   Et forkert tal faar en besked, der passer til fejlen: ganget i stedet
   for divideret, broeken vendt om, koefficienterne brugt paa masser,
   koefficienten regnet med i molarmassen, tallet efter et grundstof
   glemt, den forkerte molarmasse og kommaet.

   Svarene er { ok, besked, tom }. Et tal er rigtigt, naar det hoejst er
   1 % fra facit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet ------------------------------------------
       "1,5", "1.5", "1,5 mol", "44,01 g/mol" og " 16 g " er tal. Giver tallet
       eller null. */
    T.tal = function (raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/(g\/mol|gmol-1|mol|g)$/i, "");
        if (!/^[-+]?\d+(?:[.,]\d+)?$/.test(s)) return null;
        return parseFloat(s.replace(",", "."));
    };

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-9;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    function f(st) { return st.formel; }
    function tal(v) { return NK.betydende(v, 3); }

    /* Kommaet: tallet er 10, 100 eller 1000 gange for stort eller lille */
    function komma(v, facit) {
        var faktorer = [10, 100, 1000];
        for (var i = 0; i < faktorer.length; i++) {
            if (naer(v, facit * faktorer[i]) || naer(v, facit / faktorer[i])) {
                return "Tjek kommaet. Tallet er for " + (v > facit ? "stort." : "lille.");
            }
        }
        return null;
    }

    function tomt(raa, enhed) {
        if (String(raa || "").trim()) return null;
        return { tom: true, besked: "Skriv et tal i " + enhed + "." };
    }

    /* ----- Koefficienterne ------------------------------------------------------ */
    T.koefficienter = function (raa, r) {
        if (raa.some(function (x) { return !String(x || "").trim(); })) {
            return { tom: true, besked: "Skriv en koefficient foran hvert stof. Skriv 1, hvor der kun skal være ét." };
        }
        var k = raa.map(function (x) { return T.tal(x); });
        if (k.some(function (x) { return x === null || x !== Math.round(x) || x < 1; })) {
            return { besked: "Koefficienterne er hele tal, mindst 1." };
        }
        var a = D.afstemt(r, k);
        if (!a.ok) {
            return { besked: "Der er " + a.v + " " + a.grundstof + " til venstre og " + a.h + " " + a.grundstof + " til højre." };
        }
        var g = k.reduce(function (x, y) { return NK.gcd(x, y); });
        if (g > 1) return { besked: "Skemaet er afstemt, men forkort til de mindste hele tal." };
        return { ok: true, k: k };
    };

    /* ----- Molarmassen -----------------------------------------------------------
       c: { st, k (koefficienten foran stoffet) } */
    T.molar = function (raa, c) {
        var t = tomt(raa, "g/mol");
        if (t) return t;
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 44,01." };
        var st = c.st, facit = st.Mv;
        if (naer(v, facit, 0.003)) return { ok: true };
        /* Tallene efter grundstofferne glemt: CO₂ regnet som C + O */
        var uden = 0, glemt = null;
        Object.keys(st.antal).forEach(function (g) {
            uden += D.ATOMMASSE[g] / 100;
            if (st.antal[g] > 1 && !glemt) glemt = g;
        });
        if (glemt && naer(v, uden, 0.003)) {
            return { besked: "Husk tallet efter hvert grundstof. Der er " + st.antal[glemt] + " " + glemt + " i " + f(st) + "." };
        }
        if (c.k > 1 && naer(v, facit * c.k, 0.003)) {
            return { besked: "Koefficienten " + c.k + " hører ikke med i molarmassen. M gælder 1 mol " + f(st) + "." };
        }
        var km = komma(v, facit);
        if (km) return { besked: km };
        if (naer(v, facit, 0.02)) return { besked: "Tæt på. Brug atommasserne med to decimaler." };
        return { besked: "Læg atommasserne sammen for alle atomerne i " + f(st) + "." };
    };

    /* ----- Stofmaengden ud fra massen: n = m / M ------------------------------------
       c: { st, m (gram), k (koefficienten foran stoffet) } */
    T.nFraM = function (raa, c) {
        var t = tomt(raa, "mol");
        if (t) return t;
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 1,50." };
        var st = c.st, M = st.Mv, facit = c.m / M;
        if (naer(v, facit)) return { ok: true };
        if (naer(v, c.m * M)) return { besked: "Du har ganget. Massen skal divideres med molarmassen: n = m / M." };
        if (naer(v, M / c.m)) return { besked: "Brøken er vendt om. Massen står øverst: n = m / M." };
        if (naer(v, c.m)) return { besked: "Det er massen i gram. Stofmængden i mol får du ved at dividere med M." };
        if (c.k > 1 && (naer(v, facit * c.k) || naer(v, facit / c.k))) {
            return { besked: "Koefficienten skal ikke bruges her. Den bruges først, når du går fra ét stof til et andet." };
        }
        var km = komma(v, facit);
        if (km) return { besked: km };
        if (naer(v, facit, 0.05)) return { besked: "Tæt på. Regn efter med molarmassen for " + f(st) + "." };
        return { besked: "n(" + f(st) + ") = m / M. Massen og molarmassen står i skemaet." };
    };

    /* ----- Stofmaengden ud fra et andet stof: koefficienterne ------------------------
       c: { st, kilde (stoffet, man regner fra), nKilde, kj, kk,
            mKilde (kildens masse, hvis den er kendt), andre: [{ st, n }] } */
    T.nFraForhold = function (raa, c) {
        var t = tomt(raa, "mol");
        if (t) return t;
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 1,50." };
        var X = f(c.st), K = f(c.kilde), kj = c.kj, kk = c.kk, nk = c.nKilde;
        var facit = nk * kj / kk;
        var formel = "n(" + X + ") = " + kj + "/" + kk + " · n(" + K + ")";
        if (naer(v, facit)) return { ok: true };
        if (kj !== kk && naer(v, nk * kk / kj)) {
            return { besked: "Brøken er vendt om. Koefficienten for " + X + " skal stå øverst: " + formel + "." };
        }
        if (kj !== kk && naer(v, nk)) {
            return { besked: "Det er stofmængden af " + K + ". " + X + " og " + K + " reagerer i forholdet " + kj + " : " + kk + "." };
        }
        if (c.mKilde && naer(v, c.mKilde * kj / kk) && !naer(c.mKilde * kj / kk, facit)) {
            return { besked: "Det er massen af " + K + " ganget med forholdet. Koefficienterne gælder mol, ikke gram." };
        }
        if (c.mKilde && naer(v, c.mKilde) && !naer(c.mKilde, facit)) {
            return { besked: "Det er massen af " + K + ". Brug stofmængden n(" + K + ")." };
        }
        if (kk !== 1 && naer(v, nk * kj)) return { besked: "Du har ganget med " + kj + ", men ikke divideret med " + kk + "." };
        if (kj !== 1 && naer(v, nk / kk)) return { besked: "Du har divideret med " + kk + ", men ikke ganget med " + kj + "." };
        if (naer(v, kj) && !naer(kj, facit)) return { besked: "Det er koefficienten. Den giver forholdet, ikke stofmængden." };
        var andre = c.andre || [];
        for (var i = 0; i < andre.length; i++) {
            if (naer(v, andre[i].n) && !naer(andre[i].n, facit)) {
                return { besked: "Det er stofmængden af " + f(andre[i].st) + ". Her skal du finde " + X + "." };
            }
        }
        var km = komma(v, facit);
        if (km) return { besked: km };
        if (naer(v, facit, 0.05)) return { besked: "Tæt på. Regn efter." };
        return { besked: "Brug forholdet mellem koefficienterne: " + formel + "." };
    };

    /* ----- Massen ud fra stofmaengden: m = n · M -------------------------------------
       c: { st, n, kilde, mKilde, nKilde, kj, kk } (kilden er det stof, hvis
       masse var kendt; bruges til at fange vejen uden om mol) */
    T.mFraN = function (raa, c) {
        var t = tomt(raa, "g");
        if (t) return t;
        var v = T.tal(raa);
        if (v === null) return { besked: "Skriv et tal, fx 87,91." };
        var st = c.st, M = st.Mv, facit = c.n * M;
        if (naer(v, facit)) return { ok: true };
        if (naer(v, c.n / M)) return { besked: "Du har divideret. Massen er stofmængden gange molarmassen: m = n · M." };
        if (naer(v, M / c.n)) return { besked: "Massen er stofmængden gange molarmassen: m = n · M." };
        if (c.kilde) {
            var K = f(c.kilde);
            /* Massen ganget med forholdet giver det samme tal som n · M(kilden),
               men det er den klassiske fejl, saa den besked kommer foerst */
            if (c.mKilde !== undefined && c.kj && naer(v, c.mKilde * c.kj / c.kk) && !naer(c.mKilde * c.kj / c.kk, facit)) {
                return { besked: "Koefficienterne gælder mol, ikke gram. Gå over stofmængden n(" + f(st) + ")." };
            }
            if (c.kilde !== st && naer(v, c.n * c.kilde.Mv) && !naer(c.kilde.Mv, M)) {
                return { besked: "Det er molarmassen for " + K + ". Brug M for " + f(st) + "." };
            }
            if (c.mKilde !== undefined && naer(v, c.mKilde) && !naer(c.mKilde, facit)) {
                return { besked: "Det er massen af " + K + ". Stofferne vejer ikke det samme pr. mol." };
            }
        }
        if (c.k > 1 && naer(v, facit * c.k)) {
            return { besked: "Koefficienten er allerede brugt i n(" + f(st) + "). Gang kun med M." };
        }
        if (naer(v, c.n)) return { besked: "Det er stofmængden. Gang med molarmassen for at få gram." };
        var km = komma(v, facit);
        if (km) return { besked: km };
        if (naer(v, facit, 0.05)) return { besked: "Tæt på. Regn efter med n = " + tal(c.n) + " mol." };
        return { besked: "m(" + f(st) + ") = n · M. Begge tal står i skemaet." };
    };

    NK.Tjek = T;
}());

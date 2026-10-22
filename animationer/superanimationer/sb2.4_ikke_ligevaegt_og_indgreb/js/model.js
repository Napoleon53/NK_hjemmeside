/* =====================================================================
   model.js - kemien bag de tre faner, adskilt fra tegningen

   * NK.Model.gas: ligevaegten CO(g) + H2O(g) <=> CO2(g) + H2(g) med
     K = 4,0 (samme tal som eksemplet i Kemibogen B2.4). Koncentrationerne
     er i M. Reaktionens omfang xi er positivt mod hoejre.
   * NK.Model.blod: Hb + O2 <=> HbO2 med ét bindingssted pr. Hb, som i
     bogen. Tallene er taelleenheder i luppen (antal partikler), ikke M,
     og K er valgt, saa blodet i lungerne er omkring 90 % maettet og i en
     muskel i hvile omkring 67 %. Se README under Forenklinger.
   * NK.Model.Y: reaktionsbroeken for en reaktion skrevet som data (fane 3).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = {};

    /* ----- Reaktionsbroeken for en reaktion skrevet som data ---------------
       r.over og r.under: [{ s: "CO2", n: 1 }], hvor n er koefficienten.
       c: { CO2: 0.20, ... }. Er der intet under broekstregen, er Y bare
       produktet over den. */
    M.Y = function (r, c) {
        var over = 1, under = 1;
        r.over.forEach(function (d) { over *= Math.pow(c[d.s], d.n); });
        r.under.forEach(function (d) { under *= Math.pow(c[d.s], d.n); });
        if (under === 0) return over === 0 ? NaN : Infinity;
        return over / under;
    };

    /* ----- Fane 1: CO + H2O <=> CO2 + H2 ---------------------------------- */
    var GAS = {
        K: 4.0,
        stoffer: ["CO", "H2O", "CO2", "H2"],
        reaktanter: ["CO", "H2O"],
        produkter: ["CO2", "H2"],
        /* Et molekyle i beholderen staar for 0,025 M */
        ENHED: 0.025
    };

    GAS.Y = function (c) {
        var under = c.CO * c.H2O, over = c.CO2 * c.H2;
        if (under <= 1e-12) return over <= 1e-12 ? NaN : Infinity;
        return over / under;
    };

    /* Koncentrationerne, naar reaktionen er naaet xi mod hoejre */
    GAS.efter = function (c, xi) {
        return { CO: c.CO - xi, H2O: c.H2O - xi, CO2: c.CO2 + xi, H2: c.H2 + xi };
    };

    /* Omfanget, der bringer blandingen i ligevaegt. ln Y vokser med xi, saa
       halvering finder det ene xi, hvor Y = K, uden fortegnsfejl i
       andengradsligningen. */
    GAS.ligevaegtXi = function (c) {
        var lav = -Math.min(c.CO2, c.H2), hoej = Math.min(c.CO, c.H2O);
        if (hoej - lav < 1e-12) return 0;
        var lnK = Math.log(GAS.K);
        function f(xi) {
            var e = GAS.efter(c, xi);
            var over = Math.max(e.CO2, 1e-15) * Math.max(e.H2, 1e-15);
            var under = Math.max(e.CO, 1e-15) * Math.max(e.H2O, 1e-15);
            return Math.log(over / under) - lnK;
        }
        for (var i = 0; i < 80; i++) {
            var m = (lav + hoej) / 2;
            if (f(m) > 0) hoej = m; else lav = m;
        }
        return (lav + hoej) / 2;
    };

    GAS.ligevaegt = function (c) {
        return GAS.efter(c, GAS.ligevaegtXi(c));
    };

    /* Antal molekyler af hvert stof, som beholderen viser */
    GAS.antal = function (c) {
        var ud = {};
        GAS.stoffer.forEach(function (s) { ud[s] = Math.max(0, Math.round(c[s] / GAS.ENHED + 1e-9)); });
        return ud;
    };

    GAS.reaktant = function (s) { return GAS.reaktanter.indexOf(s) >= 0; };

    M.gas = GAS;

    /* ----- Fane 2: Hb + O2 <=> HbO2 -----------------------------------------
       N: antal bindingssteder (Hb i alt) i luppen, b: antal HbO2, o: antal
       frie O2 i luppen. Luften i lungerne og forbruget i musklen holder o
       fast, saa kun b aendrer sig. */
    var BLOD = {
        K: 1.0,
        /* Frie O2 i luppen de fire steder. Ligevaegten giver 11 af 12 HbO2 i
           lungerne ved havet, 9 af 12 i bjergene, 8 af 12 i en muskel i hvile
           og 6 af 12, naar musklen arbejder (og 12 af 16 med mere Hb). */
        O2: { lunge: 10, bjerg: 3, muskel: 2, loeb: 1 },
        N: 12,
        NFLERE: 16
    };

    BLOD.Y = function (N, b, o) {
        var hb = N - b;
        if (hb <= 1e-9 || o <= 1e-9) return Infinity;
        return b / (hb * o);
    };

    /* Antal HbO2 ved ligevaegt: b / ((N - b) · o) = K */
    BLOD.ligevaegt = function (N, o) {
        return N * BLOD.K * o / (1 + BLOD.K * o);
    };

    M.blod = BLOD;

    NK.Model = M;
}());

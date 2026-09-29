/* =====================================================================
   tjek.js - tjek af massen, som eleven skriver paa fane 3

   Et forkert tal faar en besked, der passer til fejlen: divideret i
   stedet for ganget, stofmaengden eller molarmassen glemt, et andet
   grundstofs molarmasse, atomnummeret og kommaet flyttet.

   Svarene er { ok, besked, tom }. Et svar er rigtigt, naar det hoejst
   er 1 % fra facit, saa afrunding til to eller tre betydende cifre
   ogsaa er rigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet ----------------------------------------
       "15,9", "15.9", "15,9 g" og " 16 " er tal. Det samme er "1,51e23",
       "1,51·10^23", "1,51 * 10^23", "1,51 x 10²³" og "151000000000000000000000".
       Giver { v } eller null. */
    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.tal = function (raa) {
        var s = String(raa || "");
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s).replace(/\s+/g, "").replace(/(g|mol|stk\.?|atomer)$/i, "");
        s = s.replace(/[·×x*X]/g, "*").replace(/−/g, "-");
        var m = s.match(/^([-+]?\d+(?:[.,]\d+)?)(?:\*10\^?([-+]?\d+)|[eE]([-+]?\d+))?$/);
        if (!m) return null;
        var foran = parseFloat(m[1].replace(",", "."));
        var e = m[2] !== undefined ? m[2] : m[3];
        var v = e !== undefined ? foran * Math.pow(10, parseInt(e, 10)) : foran;
        return { v: v, foran: foran, potens: e !== undefined };
    };

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-9;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }

    /* ----- Massen: m = n · M ----------------------------------------------------
       o: ordren med st, n og m (i gram) */
    T.masse = function (raa, o) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv massen i gram." };
        var t = T.tal(raa);
        if (!t) return { besked: "Skriv et tal, fx 15,9." };
        var v = t.v, st = o.st, n = o.n, M = st.M / 100, m = o.m;
        if (naer(v, m)) return { ok: true };
        if (naer(v, M / n) || naer(v, n / M)) {
            return { besked: "Du har divideret. Massen er stofmængden gange molarmassen." };
        }
        if (naer(v, M)) return { besked: "Det er massen af 1 mol. Ordren er på " + o.nTekst + " mol." };
        if (naer(v, n)) return { besked: "Det er stofmængden. Gang den med molarmassen." };
        if (naer(v, n * st.z)) return { besked: st.z + " er atomnummeret for " + st.s + ". Brug molarmassen på krukken." };
        var anden = null;
        D.STOFFER.forEach(function (x) { if (!anden && x !== st && naer(v, n * x.M / 100)) anden = x; });
        if (anden) return { besked: "Det passer med molarmassen for " + anden.navn + ". Krukken her er " + st.navn + "." };
        if (naer(v, m * 10) || naer(v, m / 10) || naer(v, m * 100) || naer(v, m / 100)) {
            return { besked: "Tjek kommaet. Tallet er for " + (v > m ? "stort." : "lille.") };
        }
        if (naer(v, m, 0.05)) return { besked: "Tæt på. Regn efter: m = " + o.nTekst + " mol · " + NK.komma(st.M) + " g/mol." };
        return { besked: "Gang stofmængden med molarmassen: m = n · M." };
    };

    NK.Tjek = T;
}());

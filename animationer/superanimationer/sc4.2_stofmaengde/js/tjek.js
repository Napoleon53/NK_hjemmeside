/* =====================================================================
   tjek.js - tjek af massen og antallet af atomer, som eleven skriver

   Et forkert tal faar en besked, der passer til fejlen: divideret i
   stedet for ganget, stofmaengden eller molarmassen glemt, et andet
   grundstofs molarmasse, atomnummeret, kommaet flyttet og potensen
   forkert.

   Svarene er { ok, besked, note, tom }. note er en bemaerkning ved et
   rigtigt svar, besked er beskeden ved et forkert. Et svar er rigtigt,
   naar det hoejst er 1 % fra facit, saa afrunding til to eller tre
   betydende cifre og 6,022 i stedet for 6,02 ogsaa er rigtigt.
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

    /* ----- Antallet af atomer: N = n · N_A ------------------------------------------
       mant og eks er de to felter (1,51 og 23). Staar hele tallet i det
       foerste felt (1,51e23), bruges det. */
    T.antal = function (mantRaa, eksRaa, o) {
        var mTom = !String(mantRaa || "").trim(), eTom = !String(eksRaa || "").trim();
        if (mTom && eTom) return { tom: true, besked: "Skriv antallet som et tal gange 10 i en potens." };
        var tm = T.tal(mantRaa);
        if (!tm) return { besked: "Skriv et tal foran, fx 1,51." };
        var v = tm.v;
        if (!tm.potens) {
            if (eTom) {
                if (v < 1e6) return { besked: "Skriv også potensen, det lille tal efter 10." };
            } else {
                var e = NK.ascii(String(eksRaa)).replace(/\s+/g, "").replace(/−/g, "-");
                if (!/^[-+]?\d+$/.test(e)) return { besked: "Potensen skal være et helt tal, fx 23." };
                v *= Math.pow(10, parseInt(e, 10));
            }
        }
        var N = o.N, n = o.n, NA = D.NA, M = o.st.M / 100;
        if (naer(v, N)) {
            /* 15,1 · 10²² er rigtigt, men skrives normalt 1,51 · 10²³ */
            var foran = tm.potens ? tm.foran : (eTom ? null : tm.v);
            if (foran !== null && (foran < 1 || foran >= 10)) {
                return { ok: true, note: "Rigtigt. Med ét ciffer før kommaet skrives det " + o.NTekst + "." };
            }
            return { ok: true };
        }
        if (naer(v, NA)) return { besked: "Det er antallet i 1 mol. Gang med stofmængden." };
        if (naer(v, n)) return { besked: "Det er stofmængden. Gang den med 6,02 · 10²³ mol⁻¹." };
        for (var k = 1; k <= 3; k++) {
            if (naer(v, N * Math.pow(10, k)) || naer(v, N / Math.pow(10, k))) {
                return { besked: "Tjek potensen. Tallet er " + Math.pow(10, k) + " gange for " + (v > N ? "stort." : "lille.") };
            }
        }
        if (naer(v, NA / n) || naer(v, n / NA)) return { besked: "Du har divideret. Antallet er stofmængden gange 6,02 · 10²³ mol⁻¹." };
        if (naer(v, n * M * NA)) return { besked: "Molarmassen skal ikke bruges her. N = n · N_A." };
        if (naer(v, o.m)) return { besked: "Det er massen. Her skal du finde antallet af atomer." };
        if (naer(v, N, 0.05)) return { besked: "Tæt på. Regn efter: N = " + o.nTekst + " mol · " + D.NA_TEKST + "." };
        return { besked: "Gang stofmængden med Avogadros konstant: N = n · N_A." };
    };

    NK.Tjek = T;
}());

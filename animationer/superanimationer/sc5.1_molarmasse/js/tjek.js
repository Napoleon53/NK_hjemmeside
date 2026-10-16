/* =====================================================================
   tjek.js - tjek af atommasser og molarmasser, som eleven skriver

   Et forkert tal faar en besked, der passer til fejlen: atomnummeret
   i stedet for atommassen, alle atomerne i én raekke, et andet
   grundstofs masse, decimaler, der mangler, kommaet flyttet, et antal,
   der ikke er ganget med, og et grundstof, der er glemt.

   Svarene er { ok, besked, note, tom }. note er en bemaerkning ved et
   rigtigt svar, besked er beskeden ved et forkert.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};

    /* ----- Tallet, eleven har skrevet --------------------------------------
       "1,01", "1.01", "1,01 g/mol" og "  16 " er alle tal. Giver
       { v, dec } (vaerdien og antallet af decimaler) eller null. */
    T.tal = function (raa) {
        var s = String(raa || "").replace(/\s+/g, "").replace(/g\/mol$/i, "").replace(/(g|u)$/i, "");
        s = s.replace(/−/g, "-");
        if (!/^-?\d+([.,]\d+)?$/.test(s)) return null;
        var dele = s.split(/[.,]/);
        return { v: parseFloat(s.replace(",", ".")), dec: dele[1] ? dele[1].length : 0 };
    };

    function naer(a, b, tol) { return Math.abs(a - b) <= tol; }

    /* ----- Atommassen i én raekke ----------------------------------------------
       s: symbolet, n: antallet af atomer i formlen */
    T.atommasse = function (raa, s, n) {
        var g = D.grundstof(s);
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv atommassen for " + s + "." };
        var t = T.tal(raa);
        if (!t) return { besked: "Skriv et tal, fx 12,01." };
        var v = t.v, m = g.m / 100;
        if (t.dec >= 3 && naer(v, g.praecis, 0.0015)) {
            return { ok: true, note: "Rigtigt. Tabellen her har to decimaler: " + NK.komma(g.m) + "." };
        }
        if (naer(v, m, 0.005)) return { ok: true };
        if (v === g.z) return { besked: g.z + " er atomnummeret for " + s + ". Atommassen er tallet nederst i feltet." };
        if (n > 1 && naer(v, n * m, 0.011)) {
            return { besked: "Det er alle " + n + " " + s + "-atomer. Skriv atommassen for ét. Antallet står allerede foran." };
        }
        var anden = null;
        D.GRUNDSTOFFER.forEach(function (x) {
            if (!anden && x.s !== s && naer(v, x.m / 100, 0.005)) anden = x;
        });
        if (anden) return { besked: NK.komma(anden.m) + " er atommassen for " + anden.s + ". Rækken her er " + s + "." };
        var andenZ = null;
        D.GRUNDSTOFFER.forEach(function (x) { if (!andenZ && x.s !== s && v === x.z && t.dec === 0) andenZ = x; });
        if (t.dec < 2 && naer(v, m, 0.6)) return { besked: "Skriv decimalerne med, som de står i tabellen." };
        if (naer(v, m * 10, m * 0.02) || naer(v, m / 10, m * 0.002)) return { besked: "Tjek kommaet. Tallet er 10 gange for " + (v > m ? "stort." : "lille.") };
        if (andenZ) return { besked: andenZ.z + " er atomnummeret for " + andenZ.s + ". Find " + s + ", og brug tallet nederst i feltet." };
        return { besked: "Find " + s + " i det periodiske system. Atommassen er tallet nederst i feltet." };
    };

    /* ----- Molarmassen til sidst --------------------------------------------------
       st: stoffet. Summen er regnet med tabellens atommasser. */
    T.molarmasse = function (raa, st) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv molarmassen." };
        var t = T.tal(raa);
        if (!t) return { besked: "Skriv et tal, fx 18,02." };
        var v = t.v * 100, M = st.M;
        var led = st.orden.map(function (s) { return NK.komma(st.antal[s] * D.grundstof(s).m); });
        var sumTekst = led.join(" + ");
        if (naer(v, M, 0.5)) return { ok: true };

        /* Et antal, der ikke er ganget med */
        var i, s, n, m;
        for (i = 0; i < st.orden.length; i++) {
            s = st.orden[i]; n = st.antal[s]; m = D.grundstof(s).m;
            if (n > 1 && naer(v, M - (n - 1) * m, 1.5)) return { besked: "Har du ganget " + s + " med " + n + "? Der er " + n + " " + s + "-atomer." };
        }
        /* Et grundstof, der er glemt */
        if (st.orden.length > 1) {
            for (i = 0; i < st.orden.length; i++) {
                s = st.orden[i]; n = st.antal[s]; m = D.grundstof(s).m;
                if (naer(v, M - n * m, 1.5)) return { besked: "Bidraget fra " + s + " mangler. Læg alle rækkerne sammen." };
            }
        }
        /* Hvert grundstof talt én gang */
        var enGang = st.orden.reduce(function (a, s2) { return a + D.grundstof(s2).m; }, 0);
        if (enGang !== M && naer(v, enGang, 1.5)) return { besked: "Hvert grundstof skal ganges med sit antal." };
        /* Atomnumrene i stedet for atommasserne */
        var zSum = st.orden.reduce(function (a, s2) { return a + st.antal[s2] * D.grundstof(s2).z * 100; }, 0);
        if (naer(v, zSum, 1.5)) return { besked: "Det er atomnumrene lagt sammen. Brug atommasserne." };
        /* For faa decimaler */
        if (t.dec < 2 && naer(v, M, 60)) return { besked: "Skriv to decimaler, som atommasserne har." };
        /* Kommaet */
        if (naer(v, M * 10, M * 0.002) || naer(v, M / 10, M * 0.0002)) return { besked: "Tjek kommaet. Svaret er 10 gange for " + (v > M ? "stort." : "lille.") };
        /* Taet paa: en regnefejl */
        if (naer(v, M, 3)) return { besked: "Tæt på. Læg rækkerne sammen igen: " + sumTekst + "." };
        return { besked: "Læg rækkerne sammen: " + sumTekst + "." };
    };

    NK.Tjek = T;
}());

/* =====================================================================
   lb.js - modellen: Lambert-Beers lov og lyset gennem kuvetten

   Alt, eleven ser, er regnet her:

     A = ε · l · c          absorbansen (enhedsloes)
     T = I / I₀ = 10^(−A)   den broekdel af lyset, der slipper igennem
     I(x) = I₀ · 10^(−ε·c·x)  lyset efter x cm i vaesken

   Hvert lag vaeske tager den samme broekdel af det lys, der kommer ind
   i laget. Derfor falder lyset eksponentielt gennem kuvetten, og derfor
   er det A og ikke T, der er ligefrem proportional med c og l.

   Enhederne i hele animationen: c i mM, l i cm, ε i mM⁻¹·cm⁻¹.

   Nederst: det, eleven skriver (tal med dansk komma, potens og enhed),
   laest om til et tal i animationens egne enheder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var LB = {};
    var LN10 = Math.LN10;

    LB.A = function (eps, l, c) { return eps * l * c; };
    LB.T = function (A) { return Math.pow(10, -A); };
    LB.AafT = function (T) { return T > 0 ? -Math.log(T) / LN10 : Infinity; };

    /* Den broekdel af lyset, der er tilbage efter x cm vaeske */
    LB.lysEfter = function (eps, c, x) { return Math.pow(10, -eps * c * x); };

    /* En foton, der bliver absorberet i kuvetten, bliver det i dybden x.
       Sandsynligheden for at vaere absorberet foer x er 1 − 10^(−k·x),
       saa de fleste absorberes tidligt. u er et tilfaeldigt tal i [0, 1). */
    LB.absorbX = function (eps, c, l, u) {
        var k = eps * c;
        if (k <= 0) return l;
        var T = Math.pow(10, -k * l);
        return -Math.log(1 - u * (1 - T)) / LN10 / k;
    };

    /* Den bedste rette linje gennem (0, 0): a = Σxy / Σx² */
    LB.haeldning = function (punkter) {
        var sxy = 0, sxx = 0;
        punkter.forEach(function (p) { sxy += p.c * p.A; sxx += p.c * p.c; });
        return sxx > 0 ? sxy / sxx : 0;
    };

    /* En maaling med lidt stoej, som paa et rigtigt spektrofotometer:
       ca. 0,6 % af A og 0,002 i absorbans. */
    LB.maal = function (Asand) {
        if (Asand <= 0) return 0;
        var stoej = (Math.random() - 0.5) * 2 * (0.006 * Asand + 0.002);
        return Math.max(0, Asand + stoej);
    };

    /* ----- Det, eleven skriver --------------------------------------------
       "0,130 mM", "0.13mM", "1,30·10^-4 M", "1,3e-4 M", "1,30 · 10⁻⁴ M"
       -> { tal: 0.13 eller 1.3e-4, enhed: "mm" eller "m" } */
    var TAL = /^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))\s*(?:(?:\*|x)\s*10\s*\^?\s*([+-]?\d+)|e([+-]?\d+))?\s*(.*)$/i;

    LB.laes = function (raa) {
        var s = NK.ascii(raa).replace(/[·×∙]/g, "*").replace(/\s+/g, " ").trim();
        if (!s) return { tom: true, tal: null, enhed: "", raa: raa };
        var m = TAL.exec(s);
        if (!m) return { tom: false, tal: null, enhed: "", raa: raa };
        var v = parseFloat(m[1].replace(",", "."));
        var e = m[2] !== undefined ? m[2] : m[3];
        if (e !== undefined) v *= Math.pow(10, parseInt(e, 10));
        return { tom: false, tal: isFinite(v) ? v : null, enhed: LB.normEnhed(m[4] || ""), raa: raa };
    };

    /* Enheden uden mellemrum, med smaa bogstaver og u for mikro */
    LB.normEnhed = function (e) {
        return String(e).toLowerCase().replace(/[µμ]/g, "u").replace(/[\s*·]/g, "").replace(/^\((.*)\)$/, "$1");
    };

    /* Faktorer til animationens enheder for hver slags stoerrelse */
    var FAKTOR = {
        c:   { "mm": 1, "mmol/l": 1, "m": 1000, "mol/l": 1000, "um": 0.001, "umol/l": 0.001 },
        l:   { "cm": 1, "mm": 0.1, "m": 100 },
        n:   { "mmol": 1, "mol": 1000, "umol": 0.001 },
        m:   { "mg": 1, "g": 1000, "ug": 0.001 },
        V:   { "l": 1, "ml": 0.001 },
        M:   { "g/mol": 1 }
    };

    /* Tallet i animationens enhed. enhed: "" (ingen skrevet), "ok" eller
       "forkert". For A er en enhed forkert; for ε og a laeses kun tallet. */
    LB.omregn = function (slags, svar) {
        if (svar.tal === null) return null;
        var e = svar.enhed;
        if (slags === "A") return { v: svar.tal, enhed: e ? "forkert" : "" };
        if (slags === "eps" || slags === "a") return { v: svar.tal, enhed: e ? "ok" : "" };
        if (!e) return { v: svar.tal, enhed: "" };
        var f = FAKTOR[slags] && FAKTOR[slags][e];
        if (f === undefined) return { v: svar.tal, enhed: "forkert" };
        return { v: svar.tal * f, enhed: "ok", faktor: f };
    };

    /* To tal er ens inden for den relative tolerance tol */
    LB.ens = function (a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-9;
        return Math.abs(a - b) / Math.abs(b) <= (tol || 0.01);
    };

    NK.LB = LB;
}());

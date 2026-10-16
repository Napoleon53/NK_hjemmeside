/* =====================================================================
   tjek.js - tjek af formler og tal paa fane 2 og beskederne ved fejl

   Formlerne tjekkes ved at regne efter, ikke ved at sammenligne tekst:
   elevens ligning saettes paa prove med tilfaeldige tal, der passer med
   p · V = n · R · T (eller n = m / M). Holder den, er den rigtig, uanset
   hvordan den er skrevet: "pV = nRT", "V = n·R·T/p", "nRT/p",
   "V(NH₃) = n(NH₃) · R · T / p" og "n = pV/(RT)" er alle rigtige. En
   formel, der ikke er isoleret, godkendes, og eleven faar den isolerede
   at se.

   Store og smaa bogstaver er ligegyldige for p, V, n, R og T. m (masse)
   og M (molarmasse) er to forskellige. Parenteser med et stofnavn efter
   et bogstav, fx V(CO₂), er et navn og regnes ikke med.

   Et tal godkendes, naar det hoejst er 1 % fra facit (kelvin og °C:
   en halv og en hel grad).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var G = NK.Gas;
    var T = {};

    /* ----- Taet paa -------------------------------------------------------- */
    function naer(a, b, tol) {
        if (!isFinite(a) || !isFinite(b)) return false;
        return Math.abs(a - b) <= (tol === undefined ? 0.01 : tol) * Math.abs(b) + 1e-12;
    }
    T.naer = naer;

    /* ======================================================================
       FORMLER: fra tekst til et udtryk, der kan regnes paa
       ====================================================================== */
    var HAEVET_EKSP = /([⁺⁻]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g;
    var BOGSTAV = { p: "p", P: "p", v: "V", V: "V", n: "n", N: "n", r: "R", R: "R", t: "T", T: "T", m: "m", M: "M" };

    function normaliser(raa) {
        var s = String(raa || "");
        s = s.replace(HAEVET_EKSP, function (e) { return "^(" + NK.ascii(e) + ")"; });
        s = NK.ascii(s);
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/[÷:]/g, "/").replace(/,/g, ".").replace(/\s+/g, "");
        /* Et navn i parentes efter et bogstav, fx V(CO2) eller n(gas), er et
           navn. Staar der kun bogstaverne p, V, n, R og T eller et
           regnetegn, er det en parentes, der skal regnes: n(RT). */
        var gl;
        do {
            gl = s;
            s = s.replace(/([A-Za-z])\(([^()]*)\)/g, function (hel, b, inde) {
                if (/^[pPvVnNrRtTmM]+$/.test(inde) || /[+\-*\/^.]/.test(inde) || /^\d+$/.test(inde)) return hel;
                return b;
            });
        } while (s !== gl);
        return s;
    }
    T.normaliser = normaliser;

    function tokens(s) {
        var ud = [], i = 0, m;
        while (i < s.length) {
            var c = s[i];
            if (/[0-9.]/.test(c)) {
                m = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i));
                if (!m) throw { fejl: "tal" };
                ud.push({ t: "tal", v: parseFloat(m[1]) });
                i += m[1].length;
                continue;
            }
            if (/[A-Za-z]/.test(c)) {
                if (!BOGSTAV[c]) throw { fejl: "bogstav", b: c };
                ud.push({ t: "var", n: BOGSTAV[c] });
                i++;
                continue;
            }
            if ("+-*/^()".indexOf(c) >= 0) { ud.push({ t: c }); i++; continue; }
            throw { fejl: "tegn", b: c };
        }
        return ud;
    }

    /* Rekursiv nedstigning med underforstaaet gange: nRT = n · R · T.
       Underforstaaet gange binder staerkere end / (som paa papir og paa
       en TI-lommeregner), saa pV/RT er pV/(RT). Med tegn (p*V/R*T)
       regnes fra venstre mod hoejre. */
    function parse(s) {
        var tk = tokens(s), i = 0;
        function kig() { return tk[i]; }
        function tag(t) { if (tk[i] && tk[i].t === t) { i++; return true; } return false; }
        function udtryk() {
            var a = led();
            while (kig() && (kig().t === "+" || kig().t === "-")) {
                var o = tk[i++].t;
                a = { t: "op", o: o, a: a, b: led() };
            }
            return a;
        }
        function led() {
            var a = kaede();
            while (kig() && (kig().t === "*" || kig().t === "/")) {
                var o = tk[i++].t;
                a = { t: "op", o: o, a: a, b: kaede() };
            }
            return a;
        }
        function kaede() {
            var a = faktor();
            while (kig() && (kig().t === "tal" || kig().t === "var" || kig().t === "(")) {
                a = { t: "op", o: "*", a: a, b: faktor() };
            }
            return a;
        }
        function faktor() {
            var a = unaer();
            if (tag("^")) a = { t: "op", o: "^", a: a, b: faktor() };
            return a;
        }
        function unaer() {
            if (tag("-")) return { t: "neg", a: unaer() };
            if (tag("+")) return unaer();
            return primaer();
        }
        function primaer() {
            var k = tk[i++];
            if (!k) throw { fejl: "slut" };
            if (k.t === "tal") return { t: "tal", v: k.v };
            if (k.t === "var") return { t: "var", n: k.n };
            if (k.t === "(") {
                var a = udtryk();
                if (!tag(")")) throw { fejl: "parentes" };
                return a;
            }
            throw { fejl: "tegn", b: k.t };
        }
        if (!tk.length) throw { fejl: "tom" };
        var rod = udtryk();
        if (i < tk.length) throw { fejl: "tegn", b: tk[i].t };
        return rod;
    }

    function regn(u, v) {
        switch (u.t) {
            case "tal": return u.v;
            case "var": return v[u.n];
            case "neg": return -regn(u.a, v);
            case "op":
                var a = regn(u.a, v), b = regn(u.b, v);
                if (u.o === "+") return a + b;
                if (u.o === "-") return a - b;
                if (u.o === "*") return a * b;
                if (u.o === "/") return a / b;
                return Math.pow(a, b);
        }
        return NaN;
    }

    function bogstaver(u, saet) {
        saet = saet || {};
        if (u.t === "var") saet[u.n] = true;
        if (u.a) bogstaver(u.a, saet);
        if (u.b) bogstaver(u.b, saet);
        return saet;
    }

    function harTal(u) {
        if (u.t === "tal") return true;
        return !!((u.a && harTal(u.a)) || (u.b && harTal(u.b)));
    }

    /* ======================================================================
       SAMMENHAENGENE
       Hver sammenhaeng har sine bogstaver, et, der kan regnes af de andre,
       og for hvert bogstav de eksponenter, det har, naar det er isoleret
       (V = n¹ · R¹ · T¹ · p⁻¹).
       ====================================================================== */
    var REL = {
        gas: {
            bogstaver: ["p", "V", "n", "R", "T"],
            afhaengig: "V",
            loes: function (v) { return v.n * v.R * v.T / v.p; },
            eksp: {
                V: { n: 1, R: 1, T: 1, p: -1 },
                n: { p: 1, V: 1, R: -1, T: -1 },
                p: { n: 1, R: 1, T: 1, V: -1 },
                T: { p: 1, V: 1, n: -1, R: -1 }
            },
            forkert: "Den formel passer ikke med idealgasligningen."
        },
        nmM: {
            bogstaver: ["n", "m", "M"],
            afhaengig: "n",
            loes: function (v) { return v.m / v.M; },
            eksp: {
                n: { m: 1, M: -1 },
                m: { n: 1, M: 1 },
                M: { m: 1, n: -1 }
            },
            forkert: "Den formel passer ikke. Stofmængde, masse og molarmasse hænger sammen i én formel."
        }
    };
    T.REL = REL;

    /* Et saet tilfaeldige tal, der passer med sammenhaengen */
    function tilfaeldigeTal(rel, fast) {
        var v = {};
        rel.bogstaver.forEach(function (b) { v[b] = 0.6 + Math.random() * 2.4; });
        ["p", "V", "n", "R", "T", "m", "M"].forEach(function (b) { if (v[b] === undefined) v[b] = 0.6 + Math.random() * 2.4; });
        if (fast) for (var k in fast) v[k] = fast[k];
        v[rel.afhaengig] = rel.loes(v);
        return v;
    }

    function lig(a, b) {
        if (!isFinite(a) || !isFinite(b)) return false;
        return Math.abs(a - b) <= 1e-7 * (Math.abs(a) + Math.abs(b) + 1e-12);
    }

    /* Holder ligningen (venstre = hoejre) for tal, der passer, og holder
       den ikke for tal, der ikke passer? */
    function passer(vs, hs, rel, fast) {
        for (var forsoeg = 0; forsoeg < 4; forsoeg++) {
            var v = tilfaeldigeTal(rel, fast);
            if (!lig(regn(vs, v), regn(hs, v))) return false;
            var skaev = {};
            for (var k in v) skaev[k] = v[k];
            skaev[rel.afhaengig] *= 1.37;
            if (lig(regn(vs, skaev), regn(hs, skaev))) return false;
        }
        return true;
    }

    /* Hvilke eksponenter (-1, 0, 1) giver udtrykket? null, hvis ingen */
    function eksponenter(hs, andre) {
        var antal = Math.pow(3, andre.length);
        var proever = [0, 1].map(function () {
            var v = {};
            ["p", "V", "n", "R", "T", "m", "M"].forEach(function (b) { v[b] = 0.6 + Math.random() * 2.4; });
            return v;
        });
        for (var c = 0; c < antal; c++) {
            var e = {}, rest = c;
            andre.forEach(function (b) { e[b] = (rest % 3) - 1; rest = Math.floor(rest / 3); });
            var ok = proever.every(function (v) {
                var prod = 1;
                andre.forEach(function (b) { prod *= Math.pow(v[b], e[b]); });
                return lig(regn(hs, v), prod);
            });
            if (ok) return e;
        }
        return null;
    }

    function beskedForEksp(fundet, rigtig, x) {
        var dele = [];
        Object.keys(rigtig).forEach(function (b) {
            var f = fundet[b], r = rigtig[b];
            if (f === r) return;
            if (f === 0) dele.push(b + " mangler i formlen.");
            else if (r < 0) dele.push(b + " skal stå under brøkstregen.");
            else dele.push(b + " skal stå over brøkstregen.");
        });
        if (!dele.length) return null;
        return dele.slice(0, 2).join(" ") + (dele.length ? " Isolér " + x + "." : "");
    }

    /* ----- Formlen for et trin ---------------------------------------------------
       trin: { rel, x }. Giver { ok, isoleret } eller { besked } / { tom }. */
    T.formel = function (trin, raa) {
        var rel = REL[trin.rel], x = trin.x;
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = normaliser(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var vs, hs;
        try {
            if (dele.length >= 2) { vs = parse(dele[0]); hs = parse(dele[1]); }
            else { vs = { t: "var", n: x }; hs = parse(dele[0]); }
        } catch (e) {
            if (e && e.fejl === "bogstav") {
                return { besked: "Bogstavet " + e.b + " hører ikke til her. Brug " + tekstListe(rel.bogstaver) + "." };
            }
            return { besked: "Formlen kan ikke læses. Brug bogstaverne " + tekstListe(rel.bogstaver) + " og tegnene · og /." };
        }
        var b = bogstaver(vs, bogstaver(hs));
        var navne = Object.keys(b);
        /* Kun tal (paa hoejre side, naar eleven ikke skrev venstresiden) */
        if (!navne.length || (dele.length < 2 && !Object.keys(bogstaver(hs)).length)) {
            return { besked: "Skriv formlen med bogstaver først. Tallet kommer i næste felt." };
        }
        var fremmed = navne.filter(function (n) { return rel.bogstaver.indexOf(n) < 0; });
        if (fremmed.length) {
            return { besked: fremmed[0] + " hører ikke til her. " + (trin.rel === "gas" ?
                "Idealgasligningen har p, V, n, R og T." : "Her skal du bruge n, m og M.") };
        }
        if (passer(vs, hs, rel)) {
            var isoleret = vs.t === "var" && vs.n === x && !bogstaver(hs)[x];
            return { ok: true, isoleret: isoleret };
        }
        /* Tallet 0,0831 i stedet for R */
        if (trin.rel === "gas" && (harTal(vs) || harTal(hs)) && !b.R && passer(vs, hs, rel, { R: D.R })) {
            return { besked: "Skriv R i formlen i stedet for tallet. Tallene kommer i næste felt." };
        }
        if (vs.t === "var" && vs.n === x && !bogstaver(hs)[x]) {
            var andre = Object.keys(rel.eksp[x]);
            var e = eksponenter(hs, andre);
            var besk = e ? beskedForEksp(e, rel.eksp[x], x) : null;
            if (besk) return { besked: besk };
        }
        if (!b[x]) return { besked: "Formlen skal have " + x + " med. Det er " + D.STR[x].ord + ", du skal finde." };
        return { besked: rel.forkert };
    };

    function tekstListe(l) {
        if (l.length === 1) return l[0];
        return l.slice(0, -1).join(", ") + " og " + l[l.length - 1];
    }

    /* Formlen isoleret, som den skrives paa tavlen: [taeller, naevner] */
    T.isoleret = function (rel, x) {
        var e = REL[rel].eksp[x];
        var op = [], ned = [];
        Object.keys(e).forEach(function (b) { if (e[b] > 0) op.push(b); else if (e[b] < 0) ned.push(b); });
        return { taeller: op, naevner: ned };
    };

    /* ======================================================================
       TAL
       ====================================================================== */
    /* Et tal, som eleven skriver det: "36,1", "36.1 L", "7,49·10⁻³",
       "7.49e-3" eller et regnestykke med tal alene, fx 1,5·0,0831·293/1,013 */
    T.laesTal = function (raa) {
        var s = String(raa || "").trim();
        if (!s) return { tom: true };
        s = s.replace(/\s*(g\/mol|mol|bar|mL|ml|L|l|K|°C|C|g)\s*\.?$/, "");
        s = s.replace(HAEVET_EKSP, function (e) { return "^(" + NK.ascii(e) + ")"; });
        s = NK.ascii(s).replace(/[·×∙•⋅]/g, "*").replace(/,/g, ".").replace(/\s+/g, "");
        if (/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return { v: parseFloat(s) };
        s = s.replace(/(\d)e([+-]?\d)/gi, "$1*10^$2");
        try {
            var u = parse(s);
            if (Object.keys(bogstaver(u)).length) return { formel: true };
            var v = regn(u, {});
            return isFinite(v) ? { v: v } : { fejl: true };
        } catch (e) {
            return { fejl: true };
        }
    };

    /* Idealgasligningen regnet med et andet R eller andre tal */
    function gasRegn(x, k, R) {
        if (x === "V") return k.n * R * k.T / k.p;
        if (x === "n") return k.p * k.V / (R * k.T);
        if (x === "p") return k.n * R * k.T / k.V;
        if (x === "T") return k.p * k.V / (k.n * R);
        return NaN;
    }

    function kopi(k, aendr) {
        var u = {};
        for (var a in k) u[a] = k[a];
        for (a in aendr) u[a] = aendr[a];
        return u;
    }

    function komma(a, f) {
        if (!(a > 0) || !(f > 0)) return 0;
        var l = Math.log(a / f) / Math.LN10, r = Math.round(l);
        if (r !== 0 && Math.abs(l - r) < 0.005 && Math.abs(r) <= 4) return r;
        return 0;
    }

    function generelt(a, f) {
        var k = komma(a, f);
        if (k) return { besked: "Tjek kommaet. Tallet er for " + (k > 0 ? "stort." : "lille.") };
        if (naer(a, f, 0.05)) return { besked: "Tæt på. Regn med alle cifrene, og rund først af til sidst." };
        return null;
    }

    /* ----- Tallet for et trin --------------------------------------------------------
       trin: { id, rel, x, facit, raa }. k: de tal, der er kendt foer trinnet.
       givet: tallene i opgaveteksten. */
    T.tal = function (trin, raa, k, givet) {
        var l = T.laesTal(raa);
        if (l.tom) return { tom: true, besked: "Skriv tallet i feltet." };
        if (l.formel) return { besked: "Skriv tallet her. Formlen står allerede over feltet." };
        if (l.fejl || !isFinite(l.v)) return { besked: "Tallet kan ikke læses. Skriv det med komma, fx 24,0." };
        var a = l.v, f = trin.facit, x = trin.x, g;

        /* Temperaturen fra °C til kelvin */
        if (trin.id === "T") {
            if (Math.abs(a - f) <= 0.6) return { ok: true };
            if (Math.abs(a - (givet.t - D.KELVIN)) <= 0.6) return { besked: "Læg 273 til, du skal ikke trække fra." };
            if (Math.abs(a - givet.t) <= 0.6) return { besked: "Det er temperaturen i °C. Læg 273 til." };
            return { besked: "Temperaturen i kelvin er 273 mere end i °C." };
        }
        /* Fra kelvin tilbage til °C */
        if (trin.id === "t") {
            if (Math.abs(a - f) <= 1.0 || Math.abs(a - trin.raa) <= 1.0) return { ok: true };
            if (Math.abs(a - (k.T + D.KELVIN)) <= 1.0) return { besked: "Træk 273 fra, du skal ikke lægge til." };
            if (Math.abs(a - k.T) <= 1.0) return { besked: "Det er temperaturen i kelvin. Træk 273 fra." };
            return { besked: "Temperaturen i °C er 273 mindre end i kelvin." };
        }
        /* n, m og M */
        if (trin.rel === "nmM") {
            if (naer(a, f) || naer(a, trin.raa)) return { ok: true };
            if (x === "n") {
                if (naer(a, k.m * k.M)) return { besked: "Du har ganget. Del massen med molarmassen." };
                if (naer(a, k.M / k.m)) return { besked: "Brøken er vendt om. Massen skal stå øverst." };
                if (naer(a, k.m)) return { besked: "Det er massen. Del den med molarmassen." };
            } else if (x === "m") {
                if (naer(a, k.n / k.M) || naer(a, k.M / k.n)) return { besked: "Du har divideret. Gang stofmængden med molarmassen." };
                if (naer(a, k.n)) return { besked: "Det er stofmængden. Gang den med molarmassen." };
            } else if (x === "M") {
                if (naer(a, k.m * k.n)) return { besked: "Du har ganget. Del massen med stofmængden." };
                if (naer(a, k.n / k.m)) return { besked: "Brøken er vendt om. Massen skal stå øverst." };
                if (naer(a, k.m)) return { besked: "Det er massen. Del den med stofmængden." };
            }
            return generelt(a, f) || { besked: "Det passer ikke. Sæt tallene ind i formlen over feltet." };
        }
        /* Idealgasligningen */
        if (naer(a, f) || naer(a, trin.raa)) return { ok: true };
        if (x === "T" && givet.t === undefined && Math.abs(a - (f - D.KELVIN)) <= 1.5) {
            return { besked: "Det er i °C. Her skal temperaturen være i kelvin." };
        }
        if (givet.t !== undefined && givet.t !== 0 && x !== "T") {
            g = gasRegn(x, kopi(k, { T: givet.t }), D.R);
            if (naer(a, g)) return { besked: "Temperaturen skal være i kelvin: T = " + givet.t + " °C + 273 = " + (givet.t + D.KELVIN) + " K." };
        }
        if (naer(a, gasRegn(x, k, 8.314)) || naer(a, gasRegn(x, k, 8.31))) {
            return { besked: "Med bar og liter er R = " + D.R_TEKST + ". R = 8,314 hører til Pa og m³." };
        }
        if (givet.VmL !== undefined && naer(a, gasRegn(x, kopi(k, { V: givet.VmL }), D.R))) {
            return { besked: "Volumen skal være i liter: " + G.fmt("VmL", givet.VmL) + " = " + G.fmt("V", givet.VmL / 1000) + "." };
        }
        if (x === "V" && [22.4, 24, 24.5].some(function (c) { return naer(a, c * k.n, 0.003); })) {
            return { besked: "24 L pr. mol gælder kun ved stuetemperatur og 1 bar. Regn med idealgasligningen." };
        }
        if (x === "n" && [22.4, 24, 24.5].some(function (c) { return naer(a, k.V / c, 0.003); })) {
            return { besked: "24 L pr. mol gælder kun ved stuetemperatur og 1 bar. Regn med idealgasligningen." };
        }
        var rigtig = REL.gas.eksp[x], andre = Object.keys(rigtig);
        var vaerdi = kopi(k, { R: D.R });
        for (var c = 0; c < 81; c++) {
            var e = {}, rest = c, nul = 0;
            andre.forEach(function (b) { e[b] = (rest % 3) - 1; if (!e[b]) nul++; rest = Math.floor(rest / 3); });
            if (nul > 1) continue;
            var prod = 1;
            andre.forEach(function (b) { prod *= Math.pow(vaerdi[b], e[b]); });
            if (naer(a, prod, 0.005) && !naer(prod, f, 0.01)) {
                var besk = beskedForEksp(e, rigtig, x);
                if (besk) return { besked: besk };
            }
        }
        return generelt(a, f) || { besked: "Det passer ikke. Sæt tallene ind i formlen, og tjek enhederne." };
    };

    NK.Tjek = T;
}());

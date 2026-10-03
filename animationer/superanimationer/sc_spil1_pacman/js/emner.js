/* =====================================================================
   emner.js - opgavebanken

   De otte emner og Mix er de samme som i den gamle udgave, med de samme
   opgaver (niveauer) og samme antal: 10 pr. emne, 32 grundstoffer og 24
   i Mix (3 fra hvert af de otte emner). Nyt er, at hver forkert
   svarmulighed har et hint, der passer til netop den fejl, og at de
   forkerte svar er fejl, elever faktisk laver (ikke "HCl?").

   Et emne:   { titel, beskrivelse, niveauer, lav(data, rng) }
   lav giver: { tekst, rigtig, forkerte: [{ t, hint }, x3], forklaring }
   Linjeskift i forklaringen skrives \n. Ingen HTML.

   NK.Emner.raekke(emne, rng)  opgaverne til et forloeb, blandet
   NK.Emner.lav(opgave, rng)   ét spoergsmaal ud fra { emne, data }
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Hjaelpere --------------------------------------------------- */
    var SUB = "₀₁₂₃₄₅₆₇₈₉";
    var SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

    function sub(n) {
        return String(n).split("").map(function (c) { return SUB[+c]; }).join("");
    }

    /* En ion med ladning: Na⁺, Mg²⁺, SO₄²⁻ (±1 skrives kun med fortegn) */
    function ion(f, c, negativ) {
        return f + (c === 1 ? "" : SUP[c]) + (negativ ? "⁻" : "⁺");
    }

    /* Et oxidationstal eller en ladningssum med fortegn: +6, −2, 0 */
    function fortegn(v) {
        return (v > 0 ? "+" : "") + NK.tal(v);
    }

    function bland(liste, rng) {
        var a = liste.slice();
        rng = rng || Math.random;
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(rng() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    /* De tre første kandidater, der er forskellige fra det rigtige svar
       og fra hinanden */
    function tre(rigtig, kandidater) {
        var ud = [], set = {};
        kandidater.forEach(function (k) {
            if (ud.length >= 3 || !k || !k.t || k.t === rigtig || set[k.t]) return;
            set[k.t] = true;
            ud.push(k);
        });
        return ud;
    }

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function lille(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

    /* ----- Grundstoffer ------------------------------------------------ */
    /* De første 20 grundstoffer, de mest almindelige metaller, brom og iod */
    var GRUNDSTOFFER = [
        { navn: "Hydrogen", symbol: "H" }, { navn: "Helium", symbol: "He" }, { navn: "Lithium", symbol: "Li" },
        { navn: "Beryllium", symbol: "Be" }, { navn: "Bor", symbol: "B" }, { navn: "Kulstof", symbol: "C" },
        { navn: "Kvælstof", symbol: "N" }, { navn: "Ilt", symbol: "O" }, { navn: "Fluor", symbol: "F" },
        { navn: "Neon", symbol: "Ne" }, { navn: "Natrium", symbol: "Na" }, { navn: "Magnesium", symbol: "Mg" },
        { navn: "Aluminium", symbol: "Al" }, { navn: "Silicium", symbol: "Si" }, { navn: "Fosfor", symbol: "P" },
        { navn: "Svovl", symbol: "S" }, { navn: "Chlor", symbol: "Cl" }, { navn: "Argon", symbol: "Ar" },
        { navn: "Kalium", symbol: "K" }, { navn: "Calcium", symbol: "Ca" }, { navn: "Jern", symbol: "Fe" },
        { navn: "Kobber", symbol: "Cu" }, { navn: "Zink", symbol: "Zn" }, { navn: "Sølv", symbol: "Ag" },
        { navn: "Guld", symbol: "Au" }, { navn: "Bly", symbol: "Pb" }, { navn: "Tin", symbol: "Sn" },
        { navn: "Nikkel", symbol: "Ni" }, { navn: "Mangan", symbol: "Mn" }, { navn: "Krom", symbol: "Cr" },
        { navn: "Brom", symbol: "Br" }, { navn: "Iod", symbol: "I" }
    ];

    var grundstoffer = {
        titel: "Grundstoffer",
        beskrivelse: "Navn til kemisk symbol",
        niveauer: GRUNDSTOFFER,
        lav: function (data, rng) {
            var rigtig = data.symbol;
            var pulje = GRUNDSTOFFER.filter(function (e) { return e.symbol !== rigtig; });
            /* Symboler, der starter med samme bogstav, er dem, man forveksler */
            var lig = bland(pulje.filter(function (e) { return e.symbol[0] === rigtig[0]; }), rng);
            var rest = bland(pulje.filter(function (e) { return e.symbol[0] !== rigtig[0]; }), rng);
            return {
                tekst: "Hvad er det kemiske symbol for " + lille(data.navn) + "?",
                rigtig: rigtig,
                forkerte: tre(rigtig, lig.concat(rest).map(function (e) {
                    return { t: e.symbol, hint: e.symbol + " er symbolet for " + lille(e.navn) + "." };
                })),
                forklaring: data.navn + " har det kemiske symbol " + rigtig + "."
            };
        }
    };

    /* ----- Salte ------------------------------------------------------- */
    function gcd(a, b) { return b ? gcd(b, a % b) : a; }

    var ioner = {
        titel: "Salte",
        beskrivelse: "Formlen ud fra ionerne",
        niveauer: [
            { p: { n: "Natrium", f: "Na", c: 1 }, n: { n: "chlorid", f: "Cl", c: 1 } },
            { p: { n: "Magnesium", f: "Mg", c: 2 }, n: { n: "oxid", f: "O", c: 2 } },
            { p: { n: "Kalium", f: "K", c: 1 }, n: { n: "sulfid", f: "S", c: 2 } },
            { p: { n: "Calcium", f: "Ca", c: 2 }, n: { n: "iodid", f: "I", c: 1 } },
            { p: { n: "Aluminium", f: "Al", c: 3 }, n: { n: "chlorid", f: "Cl", c: 1 } },
            { p: { n: "Natrium", f: "Na", c: 1 }, n: { n: "sulfat", f: "SO₄", c: 2, p: true } },
            { p: { n: "Calcium", f: "Ca", c: 2 }, n: { n: "nitrat", f: "NO₃", c: 1, p: true } },
            { p: { n: "Ammonium", f: "NH₄", c: 1, p: true }, n: { n: "chlorid", f: "Cl", c: 1 } },
            { p: { n: "Aluminium", f: "Al", c: 3 }, n: { n: "oxid", f: "O", c: 2 } },
            { p: { n: "Jern(III)", f: "Fe", c: 3 }, n: { n: "sulfat", f: "SO₄", c: 2, p: true } }
        ],
        lav: function (data, rng) {
            var p = data.p, n = data.n;
            var g = gcd(p.c, n.c);
            var ap = n.c / g, an = p.c / g;

            function del(io, antal, udenParentes) {
                if (antal === 1) return io.f;
                if (io.p && !udenParentes) return "(" + io.f + ")" + sub(antal);
                return io.f + sub(antal);
            }
            function formel(a, b, udenParentes) { return del(p, a, udenParentes) + del(n, b, udenParentes); }
            function stykke(a, b) { return a + " · (+" + p.c + ") + " + b + " · (−" + n.c + ")"; }
            function hint(a, b) {
                var sum = a * p.c - b * n.c;
                if (sum !== 0) return formel(a, b) + ": " + stykke(a, b) + " = " + fortegn(sum) + ". Summen skal være 0.";
                return formel(a, b) + " er neutral, men kan forkortes. Brug så få ioner som muligt.";
            }
            function kandidat(ab) { return { t: formel(ab[0], ab[1]), hint: hint(ab[0], ab[1]) }; }

            var rigtig = formel(ap, an);
            var ionP = ion(p.f, p.c, false), ionN = ion(n.f, n.c, true);
            var k = [];
            /* Den glemte parentes om en sammensat ion */
            if ((p.p && ap > 1) || (n.p && an > 1)) {
                k.push({ t: formel(ap, an, true), hint: "Uden parentes gælder tallet kun det sidste atom. Sæt parentes om " + (n.p && an > 1 ? ionN : ionP) + "." });
            }
            [[1, 1], [n.c, p.c], [1, 2]].forEach(function (ab) { k.push(kandidat(ab)); });
            bland([[1, 2], [2, 1], [2, 2], [1, 3], [3, 1], [2, 3], [3, 2], [3, 3]], rng).forEach(function (ab) { k.push(kandidat(ab)); });

            return {
                tekst: "Hvad er formlen for " + lille(p.n) + n.n + "?",
                rigtig: rigtig,
                forkerte: tre(rigtig, k),
                forklaring: ionP + " og " + ionN + ": " + stykke(ap, an) + " = 0.\nFormlen er " + rigtig + "."
            };
        }
    };

    /* ----- Maengdeberegning -------------------------------------------- */
    /* Afrundede atommasser: H 1, C 12, O 16, Na 23, Cl 35,5, Fe 55,8 */
    var maengde = {
        titel: "Mængdeberegning",
        beskrivelse: "Molarmasse og m = n · M",
        niveauer: [
            { type: "M", f: "O₂", val: 32, regn: "2 · 16 g/mol", forkerte: [
                [16, "O₂ har to O-atomer."],
                [8, "8 er atomnummeret for O. Brug atommassen 16 g/mol."],
                [64, "Du har ganget med 2 to gange. Én gang er nok."]] },
            { type: "m", n: 2, M: 10 },
            { type: "M", f: "H₂O", val: 18, regn: "2 · 1 g/mol + 16 g/mol", forkerte: [
                [17, "H₂O har to H-atomer."],
                [10, "Du har brugt atomnumrene. Brug atommasserne."],
                [34, "Tallet 2 gælder kun H, ikke O."]] },
            { type: "m", n: 0.5, M: 100 },
            { type: "M", f: "NaCl", val: 58.5, regn: "23 g/mol + 35,5 g/mol", forkerte: [
                [28, "Du har brugt atomnumrene. Brug atommasserne."],
                [35.5, "Husk også Na."],
                [117, "NaCl har ét Na og ét Cl."]] },
            { type: "m", n: 5, M: 20 },
            { type: "M", f: "CH₄", val: 16, regn: "12 g/mol + 4 · 1 g/mol", forkerte: [
                [13, "CH₄ har fire H-atomer."],
                [10, "6 er atomnummeret for C. Brug atommassen 12 g/mol."],
                [52, "Tallet 4 gælder kun H, ikke C."]] },
            { type: "m", n: 0.1, M: 50 },
            { type: "M", f: "Fe", val: 55.8, regn: "", forkerte: [
                [26, "26 er atomnummeret. Brug atommassen."],
                [111.6, "Fe er ét atom, ikke to."],
                [30, "30 er antallet af neutroner. Massen tæller både protoner og neutroner."]] },
            { type: "m", n: 3, M: 18 }
        ],
        lav: function (data) {
            if (data.type === "M") {
                var r = NK.tal(data.val) + " g/mol";
                return {
                    tekst: "Find molarmassen M for " + data.f + ".",
                    rigtig: r,
                    forkerte: tre(r, data.forkerte.map(function (x) { return { t: NK.tal(x[0]) + " g/mol", hint: x[1] }; })),
                    forklaring: "M(" + data.f + ") = " + (data.regn ? data.regn + " = " : "") + r + "."
                        + (data.regn ? "" : "\nDet er atommassen i det periodiske system.")
                };
            }
            var m = data.n * data.M;
            var rm = NK.tal(m) + " g";
            function g(v) { return NK.tal(v) + " g"; }
            return {
                tekst: "Find massen m, når n = " + NK.tal(data.n) + " mol og M = " + NK.tal(data.M) + " g/mol.",
                rigtig: rm,
                forkerte: tre(rm, [
                    { t: g(data.M / data.n), hint: "m = n · M, ikke M / n." },
                    { t: g(data.n / data.M), hint: "m = n · M, ikke n / M." },
                    { t: g(data.n + data.M), hint: "Gang n og M. Læg dem ikke sammen." },
                    { t: g(m * 10), hint: "Tjek kommaet." }
                ]),
                forklaring: "m = n · M = " + NK.tal(data.n) + " mol · " + NK.tal(data.M) + " g/mol = " + rm + "."
            };
        }
    };

    /* ----- Opløsninger ------------------------------------------------- */
    var oplosning = {
        titel: "Opløsninger",
        beskrivelse: "Koncentration c = n / V",
        niveauer: [
            { n: 1, v: 1 }, { n: 2, v: 1 }, { n: 1, v: 2 }, { n: 0.5, v: 1 },
            { n: 2, v: 0.5 }, { n: 0.1, v: 0.1 }, { n: 3, v: 2 }, { n: 0.25, v: 0.5 },
            { n: 5, v: 10 }, { n: 0.01, v: 0.1 }
        ],
        lav: function (data) {
            var c = data.n / data.v;
            function M(v) { return NK.tal(v) + " M"; }
            var r = M(c);
            return {
                tekst: "Beregn c, når n = " + NK.tal(data.n) + " mol og V = " + NK.tal(data.v) + " L.",
                rigtig: r,
                forkerte: tre(r, [
                    { t: M(data.n * data.v), hint: "c = n / V. Du har ganget." },
                    { t: M(data.v / data.n), hint: "Du har byttet om. c = n / V." },
                    { t: M(data.n + data.v), hint: "Divider n med V. Læg dem ikke sammen." },
                    { t: M(c * 10), hint: "Tjek kommaet." },
                    { t: M(c / 10), hint: "Tjek kommaet." },
                    { t: M(c * 2), hint: "c = n / V. Tjek regnestykket igen." }
                ]),
                forklaring: "c = n / V = " + NK.tal(data.n) + " mol / " + NK.tal(data.v) + " L = " + r + "."
            };
        }
    };

    /* ----- Syre og base ------------------------------------------------ */
    var TAGER_LADNING = "H⁺ tager en positiv ladning med, når den går.";
    var BRINGER_LADNING = "H⁺ bringer en positiv ladning med.";

    var syrebase = {
        titel: "Syre og base",
        beskrivelse: "Syre-basepar og pH",
        niveauer: [
            { t: "par", q: "HCl", a: "Cl⁻", type: "base", ligning: "HCl → Cl⁻ + H⁺", forkerte: [
                ["H₂Cl⁺", "Du har lagt en H⁺ til. Basen har én H⁺ mindre."],
                ["Cl", TAGER_LADNING],
                ["HCl", "HCl er syren selv."]] },
            { t: "par", q: "NH₃", a: "NH₄⁺", type: "syre", ligning: "NH₃ + H⁺ → NH₄⁺", forkerte: [
                ["NH₂⁻", "Du har fjernet en H⁺. Syren har én H⁺ mere."],
                ["NH₄", BRINGER_LADNING],
                ["NH₃", "NH₃ er basen selv."]] },
            { t: "pH", c: 0.1, val: 1 },
            { t: "par", q: "H₂O", a: "OH⁻", type: "base", ligning: "H₂O → OH⁻ + H⁺", forkerte: [
                ["H₃O⁺", "H₃O⁺ er vands syre. Basen har én H⁺ mindre."],
                ["OH", TAGER_LADNING],
                ["O²⁻", "Du har fjernet to H⁺. Kun én."]] },
            { t: "pH", c: 0.01, val: 2 },
            { t: "par", q: "CH₃COO⁻", a: "CH₃COOH", type: "syre", ligning: "CH₃COO⁻ + H⁺ → CH₃COOH", forkerte: [
                ["CH₃COOH₂⁺", "Du har lagt to H⁺ til. Kun én."],
                ["CH₃COOH⁻", BRINGER_LADNING],
                ["CH₃COO", "Syren skal have en H⁺ mere, ikke bare miste ladningen."]] },
            { t: "pH", c: 0.001, val: 3 },
            { t: "par", q: "OH⁻", a: "H₂O", type: "syre", ligning: "OH⁻ + H⁺ → H₂O", forkerte: [
                ["O²⁻", "O²⁻ er basen til OH⁻. Syren har én H⁺ mere."],
                ["H₃O⁺", "Du har lagt to H⁺ til. Kun én."],
                ["OH", "Syren skal have en H⁺ mere, ikke bare miste ladningen."]] },
            { t: "par", q: "H₃O⁺", a: "H₂O", type: "base", ligning: "H₃O⁺ → H₂O + H⁺", forkerte: [
                ["H₄O²⁺", "Du har lagt en H⁺ til. Basen har én H⁺ mindre."],
                ["OH⁻", "Du har fjernet to H⁺. Kun én."],
                ["H₃O", "Basen skal af med en H⁺, ikke bare med ladningen."]] },
            { t: "pH", c: 0.0001, val: 4 }
        ],
        lav: function (data) {
            if (data.t === "par") {
                return {
                    tekst: "Hvad er den korresponderende " + data.type + " til " + data.q + "?",
                    rigtig: data.a,
                    forkerte: tre(data.a, data.forkerte.map(function (x) { return { t: x[0], hint: x[1] }; })),
                    forklaring: (data.type === "syre" ? "Basen optager H⁺: " : "Syren afgiver H⁺: ") + data.ligning + "."
                };
            }
            var r = NK.tal(data.val);
            return {
                tekst: "Find pH i en stærk syre med c = " + NK.tal(data.c) + " M.",
                rigtig: r,
                forkerte: tre(r, [
                    { t: NK.tal(-data.val), hint: "Husk minus: pH = −log(c)." },
                    { t: NK.tal(14 - data.val), hint: "En sur opløsning har pH under 7." },
                    { t: NK.tal(data.val + 1), hint: "pH = −log(c). Tæl, hvor mange pladser 1-tallet står efter kommaet." },
                    { t: NK.tal(data.val + 2), hint: "pH = −log(c). Tæl, hvor mange pladser 1-tallet står efter kommaet." }
                ]),
                forklaring: "pH = −log(" + NK.tal(data.c) + ") = " + r + "."
            };
        }
    };

    /* ----- Bindingstype ------------------------------------------------ */
    /* Paulings elektronegativiteter */
    var EN = { H: 2.20, C: 2.55, N: 3.04, O: 3.44, F: 3.98, Cl: 3.16, Br: 2.96, I: 2.66, Na: 0.93, Mg: 1.31, Al: 1.61, Si: 1.90, P: 2.19, S: 2.58, K: 0.82, Ca: 1.00 };
    function to(v) { return v.toFixed(2).replace(".", ","); }

    var binding = {
        titel: "Bindingstype",
        beskrivelse: "Ion-, polær og upolær binding",
        niveauer: [
            { a: "H", b: "H" }, { a: "H", b: "Cl" }, { a: "Na", b: "Cl" }, { a: "C", b: "H" }, { a: "O", b: "H" },
            { a: "Mg", b: "O" }, { a: "C", b: "O" }, { a: "K", b: "Br" }, { a: "Cl", b: "Cl" }, { a: "N", b: "H" }
        ],
        lav: function (data) {
            var ea = EN[data.a], eb = EN[data.b];
            var d = Math.abs(ea - eb);
            var rigtig = d >= 1.7 ? "Ionbinding" : (d >= 0.4 ? "Polær binding" : "Upolær binding");
            var her = " Her er ΔEN = " + to(d) + ".";
            var HINT = {
                "Ionbinding": "Ionbinding kræver ΔEN over 1,7." + her,
                "Polær binding": "Polær binding kræver ΔEN mellem 0,4 og 1,7." + her,
                "Upolær binding": "Upolær binding kræver ΔEN under 0,4." + her,
                "Metalbinding": "Metalbinding er mellem to metalatomer."
            };
            return {
                tekst: "Hvilken bindingstype er der mellem " + data.a + " og " + data.b + "?",
                rigtig: rigtig,
                forkerte: tre(rigtig, ["Ionbinding", "Polær binding", "Upolær binding", "Metalbinding"].map(function (k) { return { t: k, hint: HINT[k] }; })),
                forklaring: "ΔEN = |" + to(ea) + " − " + to(eb) + "| = " + to(d) + ".\nUnder 0,4: upolær. 0,4 til 1,7: polær. Over 1,7: ionbinding."
            };
        }
    };

    /* ----- Organisk navngivning ---------------------------------------- */
    var NAVNE = ["", "Methan", "Ethan", "Propan", "Butan", "Pentan", "Hexan", "Heptan", "Octan", "Nonan", "Decan"];
    var STAMMER = "Stammen giver antallet af C: meth 1, eth 2, prop 3, but 4, pent 5.";

    var organisk = {
        titel: "Organisk navngivning",
        beskrivelse: "Alkaners navn og formel",
        niveauer: [
            { n: 1, dir: "formel" }, { n: 2, dir: "navn" }, { n: 3, dir: "formel" }, { n: 4, dir: "navn" },
            { n: 5, dir: "formel" }, { n: 6, dir: "navn" }, { n: 7, dir: "formel" }, { n: 8, dir: "navn" },
            { n: 9, dir: "formel" }, { n: 10, dir: "navn" }
        ],
        lav: function (data, rng) {
            var n = data.n, navn = NAVNE[n];
            function F(c, h) { return "C" + (c === 1 ? "" : sub(c)) + "H" + sub(h); }
            var formel = F(n, 2 * n + 2);
            var atomer = n + " kulstofatom" + (n > 1 ? "er" : "");
            if (data.dir === "formel") {
                var k = [
                    { t: F(n, 2 * n), hint: "CₙH₂ₙ passer ikke til alkaner. Alkaner er CₙH₂ₙ₊₂." },
                    { t: F(n, 2 * n + 1), hint: "Tæl H igen: 2 · n + 2." },
                    { t: F(n + 1, 2 * n + 2), hint: STAMMER }
                ];
                for (var j = 1; j <= 3; j++) k.push({ t: F(n, 2 * n + 2 + j), hint: "Tæl H igen: 2 · n + 2." });
                return {
                    tekst: "Hvad er den kemiske formel for " + lille(navn) + "?",
                    rigtig: formel,
                    forkerte: tre(formel, k),
                    forklaring: navn + " har " + atomer + ". Alkaner følger CₙH₂ₙ₊₂, så formlen er " + formel + "."
                };
            }
            var kn = [n - 1, n + 1, n - 2].concat(bland([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rng));
            return {
                tekst: "Hvad hedder alkanen med formlen " + formel + "?",
                rigtig: navn,
                forkerte: tre(navn, kn.map(function (i) {
                    return NAVNE[i] ? { t: NAVNE[i], hint: NAVNE[i] + " har " + i + " C. Tæl C i formlen." } : null;
                })),
                forklaring: formel + " har " + atomer + " og følger CₙH₂ₙ₊₂ for alkaner, så navnet er " + lille(navn) + "."
            };
        }
    };

    /* ----- Redoxreaktioner --------------------------------------------- */
    var TYPE_HINT = {
        "Oxidation": "Oxidation er at afgive elektroner. Se, hvilken side e⁻ står på.",
        "Reduktion": "Reduktion er at optage elektroner. Se, hvilken side e⁻ står på.",
        "Fældning": "Ved en fældning dannes et tungtopløseligt salt. Her flyttes elektroner.",
        "Syre-base": "Ved syre-base flyttes H⁺. Her flyttes elektroner."
    };

    var redox = {
        titel: "Redoxreaktioner",
        beskrivelse: "Oxidationstal, oxidation og reduktion",
        niveauer: [
            { type: "tal", formel: "SO₄²⁻", atom: "S", val: 6, exp: "Ilt (O) har oxidationstal −2. 4 · (−2) + x = −2 (ionens ladning) ⇒ x = +6.", forkerte: [
                [8, "Ionens ladning er −2, ikke 0."],
                [-6, "O har −2. Så må S være positiv."],
                [-2, "−2 er ionens ladning, ikke oxidationstallet for S."]] },
            { type: "redox", rxn: "Fe²⁺ → Fe³⁺ + e⁻", rigtig: "Oxidation", exp: "Jern afgiver en elektron (e⁻ er produkt), og oxidationstallet stiger fra +2 til +3. Det er en oxidation." },
            { type: "tal", formel: "NO₃⁻", atom: "N", val: 5, exp: "Ilt (O) har oxidationstal −2. 3 · (−2) + x = −1 (ionens ladning) ⇒ x = +5.", forkerte: [
                [6, "Ionens ladning er −1, ikke 0."],
                [-5, "O har −2. Så må N være positiv."],
                [-1, "−1 er ionens ladning, ikke oxidationstallet for N."]] },
            { type: "redox", rxn: "Cl₂ + 2e⁻ → 2Cl⁻", rigtig: "Reduktion", exp: "Chlor optager elektroner (e⁻ er reaktant), og oxidationstallet falder fra 0 til −1. Det er en reduktion." },
            { type: "tal", formel: "MnO₄⁻", atom: "Mn", val: 7, exp: "Ilt (O) har oxidationstal −2. 4 · (−2) + x = −1 (ionens ladning) ⇒ x = +7.", forkerte: [
                [8, "Ionens ladning er −1, ikke 0."],
                [-7, "O har −2. Så må Mn være positiv."],
                [-1, "−1 er ionens ladning, ikke oxidationstallet for Mn."]] },
            { type: "redox", rxn: "Zn → Zn²⁺ + 2e⁻", rigtig: "Oxidation", exp: "Zink afgiver elektroner, og oxidationstallet stiger fra 0 til +2. Det er en oxidation." },
            { type: "tal", formel: "Fe₂O₃", atom: "Fe", val: 3, exp: "Ilt (O) har oxidationstal −2. 3 · (−2) + 2x = 0 (neutralt stof) ⇒ x = +3.", forkerte: [
                [6, "Der er to Fe-atomer. Del med 2."],
                [-3, "O har −2. Så må Fe være positiv."],
                [2, "Fe₂O₃ er neutral: 2x + 3 · (−2) = 0."]] },
            { type: "redox", rxn: "Cu²⁺ + 2e⁻ → Cu", rigtig: "Reduktion", exp: "Kobberionen optager elektroner, og oxidationstallet falder fra +2 til 0. Det er en reduktion." },
            { type: "tal", formel: "H₂S", atom: "S", val: -2, exp: "Brint (H) har oxidationstal +1. 2 · (+1) + x = 0 (neutralt molekyle) ⇒ x = −2.", forkerte: [
                [2, "H har +1. Så må S være negativ."],
                [-1, "Der er to H-atomer: 2 · (+1)."],
                [0, "H₂S er neutral, men S er ikke. H har +1."]] },
            { type: "redox", rxn: "2I⁻ → I₂ + 2e⁻", rigtig: "Oxidation", exp: "Iodid afgiver elektroner, og oxidationstallet stiger fra −1 til 0. Det er en oxidation." }
        ],
        lav: function (data) {
            if (data.type === "tal") {
                var r = fortegn(data.val);
                return {
                    tekst: "Hvad er oxidationstallet for " + data.atom + " i " + data.formel + "?",
                    rigtig: r,
                    forkerte: tre(r, data.forkerte.map(function (x) { return { t: fortegn(x[0]), hint: x[1] }; })),
                    forklaring: data.exp
                };
            }
            return {
                tekst: "Hvilken type reaktion er " + data.rxn + "?",
                rigtig: data.rigtig,
                forkerte: tre(data.rigtig, ["Oxidation", "Reduktion", "Fældning", "Syre-base"].map(function (k) { return { t: k, hint: TYPE_HINT[k] }; })),
                forklaring: data.exp
            };
        }
    };

    /* ----- Mix: lidt af hvert emne ------------------------------------- */
    var mix = {
        titel: "Mix",
        beskrivelse: "Lidt af hvert emne",
        mix: true
    };

    var EMNER = {
        grundstoffer: grundstoffer, ioner: ioner, maengde: maengde, oplosning: oplosning,
        syrebase: syrebase, binding: binding, organisk: organisk, redox: redox, mix: mix
    };
    var ORDEN = ["grundstoffer", "ioner", "maengde", "oplosning", "syrebase", "binding", "organisk", "redox", "mix"];
    var ALMINDELIGE = ORDEN.filter(function (k) { return !EMNER[k].mix; });

    /* Opgaverne til et forloeb i blandet raekkefoelge. Mix trækker
       D.MIX_PR_EMNE forskellige opgaver fra hvert af de andre emner. */
    function raekke(emne, rng) {
        rng = rng || Math.random;
        if (!EMNER[emne]) return [];
        if (!EMNER[emne].mix) {
            return bland(EMNER[emne].niveauer.map(function (d) { return { emne: emne, data: d }; }), rng);
        }
        var pr = NK.Data.MIX_PR_EMNE, pulje = [];
        ALMINDELIGE.forEach(function (k) {
            var niv = EMNER[k].niveauer;
            bland(niv.map(function (d, i) { return i; }), rng).slice(0, Math.min(pr, niv.length)).forEach(function (i) {
                pulje.push({ emne: k, data: niv[i] });
            });
        });
        return bland(pulje, rng);
    }

    function lav(opgave, rng) {
        var E = EMNER[opgave.emne];
        var q;
        try {
            q = E.lav(opgave.data, rng || Math.random);
        } catch (e) {
            if (window.console) console.warn("Pacman Quiz: opgaven kunne ikke laves", e);
            q = { tekst: "Opgaven kunne ikke laves.", rigtig: "?", forkerte: [], forklaring: "" };
        }
        while (q.forkerte.length < 3) q.forkerte.push({ t: "???" + q.forkerte.length, hint: "" });
        q.emne = opgave.emne;
        q.titel = E.titel;
        return q;
    }

    NK.Emner = {
        EMNER: EMNER,
        ORDEN: ORDEN,
        ALMINDELIGE: ALMINDELIGE,
        GRUNDSTOFFER: GRUNDSTOFFER,
        raekke: raekke,
        lav: lav,
        stort: stort
    };
}());

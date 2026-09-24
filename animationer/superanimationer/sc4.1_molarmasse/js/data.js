/* =====================================================================
   data.js - grundstofferne, stofferne, opgaverne og Kemichaels replikker

   Alt, der kan staa som data, staar her. Molarmasserne regnes ud af
   formlen og tabellens atommasser (D.molarmasse), saa de aldrig kan
   komme til at sige noget andet end plakaten.

   Atommasserne er IUPAC's standardatommasser (2021) rundet til to
   decimaler, som i et periodisk system til gymnasiet. Masser regnes i
   hundrededele (heltal), saa summerne bliver praecise.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Grundstofferne paa plakaten -------------------------------------
       Hovedgrupperne i periode 1-4 og tre overgangsmetaller (Fe, Cu, Zn).
       z, symbol, navn, atommasse i hundrededele, den mere praecise
       atommasse, periode, kolonne paa plakaten og slags (m metal,
       i ikke-metal, h halvmetal, a aedelgas).
       Kolonnerne: 0-1 hovedgruppe 1-2, 2-4 Fe, Cu og Zn, 5-10 hovedgruppe 3-8. */
    var G = [
        [1, "H", "hydrogen", 101, 1.008, 1, 0, "i"],
        [2, "He", "helium", 400, 4.0026, 1, 10, "a"],
        [3, "Li", "lithium", 694, 6.94, 2, 0, "m"],
        [4, "Be", "beryllium", 901, 9.0122, 2, 1, "m"],
        [5, "B", "bor", 1081, 10.81, 2, 5, "h"],
        [6, "C", "carbon", 1201, 12.011, 2, 6, "i"],
        [7, "N", "nitrogen", 1401, 14.007, 2, 7, "i"],
        [8, "O", "oxygen", 1600, 15.999, 2, 8, "i"],
        [9, "F", "fluor", 1900, 18.998, 2, 9, "i"],
        [10, "Ne", "neon", 2018, 20.180, 2, 10, "a"],
        [11, "Na", "natrium", 2299, 22.990, 3, 0, "m"],
        [12, "Mg", "magnesium", 2431, 24.305, 3, 1, "m"],
        [13, "Al", "aluminium", 2698, 26.982, 3, 5, "m"],
        [14, "Si", "silicium", 2809, 28.085, 3, 6, "h"],
        [15, "P", "phosphor", 3097, 30.974, 3, 7, "i"],
        [16, "S", "svovl", 3206, 32.06, 3, 8, "i"],
        [17, "Cl", "chlor", 3545, 35.45, 3, 9, "i"],
        [18, "Ar", "argon", 3995, 39.95, 3, 10, "a"],
        [19, "K", "kalium", 3910, 39.098, 4, 0, "m"],
        [20, "Ca", "calcium", 4008, 40.078, 4, 1, "m"],
        [26, "Fe", "jern", 5585, 55.845, 4, 2, "m"],
        [29, "Cu", "kobber", 6355, 63.546, 4, 3, "m"],
        [30, "Zn", "zink", 6538, 65.38, 4, 4, "m"],
        [31, "Ga", "gallium", 6972, 69.723, 4, 5, "m"],
        [32, "Ge", "germanium", 7263, 72.630, 4, 6, "h"],
        [33, "As", "arsen", 7492, 74.922, 4, 7, "h"],
        [34, "Se", "selen", 7897, 78.971, 4, 8, "i"],
        [35, "Br", "brom", 7990, 79.904, 4, 9, "i"],
        [36, "Kr", "krypton", 8380, 83.798, 4, 10, "a"]
    ];

    D.GRUNDSTOFFER = G.map(function (r) {
        return { z: r[0], s: r[1], navn: r[2], m: r[3], praecis: r[4], periode: r[5], kol: r[6], slags: r[7] };
    });
    D.KOLONNER = 11;
    D.HOVEDGRUPPE = [1, 2, 0, 0, 0, 3, 4, 5, 6, 7, 8];   /* kolonne -> hovedgruppe (0: overgangsmetal) */

    var efterSymbol = {};
    D.GRUNDSTOFFER.forEach(function (g) { efterSymbol[g.s] = g; });
    D.grundstof = function (s) { return efterSymbol[s] || null; };

    /* Kuglernes stoerrelse i bindingslaengder. H er lille, K er stor. */
    var RADIUS = {
        H: 0.30, He: 0.30, Li: 0.55, Be: 0.45, B: 0.42, C: 0.42, N: 0.40, O: 0.38, F: 0.36, Ne: 0.36,
        Na: 0.58, Mg: 0.55, Al: 0.52, Si: 0.50, P: 0.50, S: 0.50, Cl: 0.50, Ar: 0.48,
        K: 0.64, Ca: 0.60, Fe: 0.52, Cu: 0.52, Zn: 0.52, Ga: 0.52, Ge: 0.52, As: 0.50, Se: 0.50, Br: 0.52, Kr: 0.50
    };
    D.radius = function (s) { return RADIUS[s] || 0.45; };

    /* ----- Formler ----------------------------------------------------------
       En formel med almindelige tal, fx "Al2(SO4)3". taelling giver antallet
       af hvert grundstof og raekkefoelgen, de foerst staar i. */
    function taelling(f) {
        var i = 0;
        function gruppe() {
            var ud = {}, orden = [];
            function laeg(s, n) {
                if (!ud[s]) { ud[s] = 0; orden.push(s); }
                ud[s] += n;
            }
            while (i < f.length) {
                var c = f.charAt(i);
                if (c === "(") {
                    i++;
                    var inde = gruppe();
                    var n = tal();
                    inde.orden.forEach(function (s) { laeg(s, inde.antal[s] * n); });
                } else if (c === ")") {
                    i++;
                    return { antal: ud, orden: orden };
                } else if (/[A-Z]/.test(c)) {
                    var s = c;
                    i++;
                    while (i < f.length && /[a-z]/.test(f.charAt(i))) { s += f.charAt(i); i++; }
                    laeg(s, tal());
                } else {
                    i++;
                }
            }
            return { antal: ud, orden: orden };
        }
        function tal() {
            var t = "";
            while (i < f.length && /[0-9]/.test(f.charAt(i))) { t += f.charAt(i); i++; }
            return t ? parseInt(t, 10) : 1;
        }
        return gruppe();
    }
    D.taelling = taelling;

    /* Molarmassen i hundrededele, regnet med tabellens atommasser */
    D.molarmasse = function (f) {
        var t = taelling(f), sum = 0;
        t.orden.forEach(function (s) { sum += t.antal[s] * D.grundstof(s).m; });
        return sum;
    };

    /* Samme sum med de praecise atommasser (g/mol, kommatal) */
    D.praecisMolarmasse = function (f) {
        var t = taelling(f), sum = 0;
        t.orden.forEach(function (s) { sum += t.antal[s] * D.grundstof(s).praecis; });
        return sum;
    };

    /* ----- Strukturerne ------------------------------------------------------
       Atomerne som [symbol, x, y] i bindingslaengder og bindingerne som
       [i, j, orden]. Orden 0 er ioner, der roerer hinanden (ingen streg). */
    function struktur(atomer, bindinger) {
        return { atomer: atomer, bindinger: bindinger || [] };
    }

    /* En ligekaedet alkan i zigzag med hydrogenerne ud til siderne */
    function kaede(n) {
        var at = [], b = [], dx = 0.9, dy = 0.28, i;
        var x0 = -(n - 1) * dx / 2;
        for (i = 0; i < n; i++) at.push(["C", x0 + i * dx, i % 2 ? -dy : dy]);
        for (i = 0; i < n - 1; i++) b.push([i, i + 1, 1]);
        return { at: at, b: b, x0: x0, dx: dx, dy: dy };
    }

    function alkan(n) {
        var k = kaede(n), at = k.at, b = k.b;
        for (var i = 0; i < n; i++) {
            var c = at[i], sy = i % 2 ? -1 : 1;
            var hs = [[c[1] - 0.38, c[2] + sy * 0.68], [c[1] + 0.38, c[2] + sy * 0.68]];
            if (i === 0) hs.push([c[1] - 0.78, c[2] - sy * 0.18]);
            if (i === n - 1) hs.push([c[1] + 0.78, c[2] - sy * 0.18]);
            for (var j = 0; j < hs.length; j++) {
                b.push([i, at.length, 1]);
                at.push(["H", hs[j][0], hs[j][1]]);
            }
        }
        return struktur(at, b);
    }

    /* Glucose med aaben kaede: C1 er aldehydgruppen, C2-C5 har H og OH,
       og C6 har to H og en OH */
    function glucose() {
        var k = kaede(6), at = k.at, b = k.b;
        function paa(ci, s, x, y, orden) { b.push([ci, at.length, orden || 1]); at.push([s, x, y]); return at.length - 1; }
        var c1 = at[0];
        paa(0, "H", c1[1] - 0.38, c1[2] + 0.68);
        paa(0, "O", c1[1] - 0.85, c1[2] - 0.25, 2);
        /* OH til hoejre (+1) eller venstre (-1) som i Fischer-projektionen */
        var side = [0, 1, -1, 1, 1];
        for (var i = 1; i <= 4; i++) {
            var c = at[i], sy = i % 2 ? -1 : 1;
            var o = paa(i, "O", c[1] + side[i] * 0.42, c[2] + sy * 0.76);
            b.push([o, at.length, 1]);
            at.push(["H", at[o][1] + side[i] * 0.12, at[o][2] + sy * 0.66]);
            paa(i, "H", c[1] - side[i] * 0.38, c[2] + sy * 0.68);
        }
        var c6 = at[5];
        paa(5, "H", c6[1] - 0.38, c6[2] - 0.68);
        paa(5, "H", c6[1] + 0.38, c6[2] - 0.68);
        var o6 = paa(5, "O", c6[1] + 0.82, c6[2] + 0.2);
        b.push([o6, at.length, 1]);
        at.push(["H", at[o6][1] + 0.58, at[o6][2] - 0.37]);
        return struktur(at, b);
    }

    /* Et centralatom med fire O i kors (SO4, PO4). hs: de O, der har H paa */
    function kors(midt, x, y, hs, dobbelt) {
        var at = [[midt, x, y], ["O", x, y - 0.74], ["O", x + 0.74, y], ["O", x, y + 0.74], ["O", x - 0.74, y]];
        var b = [[0, 1, dobbelt && dobbelt.indexOf(1) >= 0 ? 2 : 1], [0, 2, dobbelt && dobbelt.indexOf(2) >= 0 ? 2 : 1],
            [0, 3, dobbelt && dobbelt.indexOf(3) >= 0 ? 2 : 1], [0, 4, dobbelt && dobbelt.indexOf(4) >= 0 ? 2 : 1]];
        (hs || []).forEach(function (h) {
            var o = at[h[0]];
            b.push([h[0], at.length, 1]);
            at.push(["H", o[1] + h[1], o[2] + h[2]]);
        });
        return { at: at, b: b };
    }

    /* Flere dele samlet til én struktur (fx ioner i et salt) */
    function saml(dele) {
        var at = [], b = [];
        dele.forEach(function (d) {
            var n0 = at.length;
            d.at.forEach(function (a) { at.push(a); });
            d.b.forEach(function (x) { b.push([x[0] + n0, x[1] + n0, x[2]]); });
        });
        return struktur(at, b);
    }

    function enkelt(s) { return struktur([[s, 0, 0]], []); }

    var STRUKTUR = {
        "H2O": struktur([["O", 0, -0.18], ["H", -0.62, 0.3], ["H", 0.62, 0.3]], [[0, 1, 1], [0, 2, 1]]),
        "O2": struktur([["O", -0.55, 0], ["O", 0.55, 0]], [[0, 1, 2]]),
        "CO2": struktur([["O", -1.05, 0], ["C", 0, 0], ["O", 1.05, 0]], [[0, 1, 2], [1, 2, 2]]),
        "SO2": struktur([["S", 0, -0.25], ["O", -0.95, 0.35], ["O", 0.95, 0.35]], [[0, 1, 2], [0, 2, 2]]),
        "CH4": struktur([["C", 0, 0], ["H", 0.1, -0.8], ["H", 0.8, 0.1], ["H", -0.1, 0.8], ["H", -0.8, -0.1]],
            [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]),
        "C2H5OH": struktur([
            ["C", -1.0, 0.3], ["C", 0, -0.3], ["O", 1.0, 0.3], ["H", 1.55, -0.15],
            ["H", -1.0, 1.05], ["H", -1.7, 0.75], ["H", -1.55, -0.25], ["H", -0.35, -0.98], ["H", 0.35, -0.98]
        ], [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]]),
        "C6H14": alkan(6),
        "C6H12O6": glucose(),
        "NaCl": struktur([["Na", -0.58, 0], ["Cl", 0.55, 0]], []),
        "CaCO3": struktur([["Ca", -1.15, 0.1], ["C", 0.6, 0], ["O", 0.6, -0.76], ["O", 1.26, 0.38], ["O", -0.06, 0.38]],
            [[1, 2, 2], [1, 3, 1], [1, 4, 1]]),
        "Ca(OH)2": struktur([["Ca", 0, 0], ["O", -1.02, 0], ["H", -1.6, -0.36], ["O", 1.02, 0], ["H", 1.6, -0.36]],
            [[1, 2, 1], [3, 4, 1]]),
        "Al2(SO4)3": saml([
            kors("S", -2.2, 0.35, null, [1, 3]), kors("S", 0, 0.35, null, [1, 3]), kors("S", 2.2, 0.35, null, [1, 3]),
            { at: [["Al", -1.1, -0.9]], b: [] }, { at: [["Al", 1.1, -0.9]], b: [] }
        ]),
        "H2": struktur([["H", -0.37, 0], ["H", 0.37, 0]], [[0, 1, 1]]),
        "Cl2": struktur([["Cl", -0.5, 0], ["Cl", 0.5, 0]], [[0, 1, 1]]),
        "N2": struktur([["N", -0.5, 0], ["N", 0.5, 0]], [[0, 1, 3]]),
        "CO": struktur([["C", -0.5, 0], ["O", 0.5, 0]], [[0, 1, 3]]),
        "O3": struktur([["O", -0.85, 0.3], ["O", 0, -0.2], ["O", 0.85, 0.3]], [[0, 1, 2], [1, 2, 1]]),
        "NH3": struktur([["N", 0, -0.12], ["H", -0.72, 0.3], ["H", 0.72, 0.3], ["H", 0, 0.68]], [[0, 1, 1], [0, 2, 1], [0, 3, 1]]),
        "NO2": struktur([["N", 0, -0.25], ["O", -0.95, 0.35], ["O", 0.95, 0.35]], [[0, 1, 2], [0, 2, 1]]),
        "C2H4": struktur([["C", -0.45, 0], ["C", 0.45, 0], ["H", -0.85, -0.65], ["H", -0.85, 0.65], ["H", 0.85, -0.65], ["H", 0.85, 0.65]],
            [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]]),
        "C3H8": alkan(3),
        "C4H10": alkan(4),
        "H2SO4": saml([kors("S", 0, 0, [[4, -0.52, -0.42], [2, 0.52, 0.42]], [1, 3])]),
        "H3PO4": saml([kors("P", 0, 0, [[4, -0.52, -0.42], [2, 0.52, -0.42], [3, 0.44, 0.5]], [1])]),
        "He": enkelt("He"), "Ar": enkelt("Ar"), "K": enkelt("K"), "Fe": enkelt("Fe"), "Cu": enkelt("Cu")
    };

    /* ----- Stofferne ---------------------------------------------------------
       formel, navn og det, fane 1 viser, naar 1 mol er vejet af:
       form (vaeske i baegerglas, pulver i vejebaad, gas i ballon), farven
       (for gasserne ballonens farve; gasserne selv er farveloese),
       massefylden i g/mL for vaeskerne og en linje om stoffet. */
    var S = [
        ["H2O", "vand", "vaeske", "#9fd3ff", 1.00, "En mundfuld."],
        ["O2", "oxygen", "gas", "#6fa8ff", 0, "Det er den del af luften, vi ånder for."],
        ["CO2", "carbondioxid", "gas", "#ff7a6b", 0, "Boblerne i sodavand."],
        ["SO2", "svovldioxid", "gas", "#f2d45c", 0, "Lugten af en tændstik, der lige er tændt."],
        ["CH4", "methan", "gas", "#7ed492", 0, "Naturgas er mest methan."],
        ["C2H5OH", "ethanol", "vaeske", "#fff6c9", 0.789, "Alkoholen i øl og vin."],
        ["C6H14", "hexan", "vaeske", "#e9f1ff", 0.655, "Et opløsningsmiddel til fedt."],
        ["C6H12O6", "glucose", "pulver", "#fbfbf4", 0, "Druesukker. 24 atomer i hvert molekyle."],
        ["NaCl", "natriumchlorid", "pulver", "#ffffff", 0, "Køkkensalt."],
        ["CaCO3", "calciumcarbonat", "pulver", "#f1ede2", 0, "Kridt og marmor er calciumcarbonat."],
        ["Ca(OH)2", "calciumhydroxid", "pulver", "#f7f7f1", 0, "Opløst i vand bliver det til kalkvand."],
        ["Al2(SO4)3", "aluminiumsulfat", "pulver", "#f4f4f6", 0, "Bruges til at rense drikkevand."],
        ["H2", "hydrogen"], ["He", "helium"], ["NH3", "ammoniak"], ["Cl2", "chlor"], ["CO", "carbonmonoxid"],
        ["N2", "nitrogen"], ["C2H4", "ethen"], ["Fe", "jern"], ["C4H10", "butan"], ["Cu", "kobber"],
        ["C3H8", "propan"], ["NO2", "nitrogendioxid"], ["H2SO4", "svovlsyre"], ["H3PO4", "phosphorsyre"],
        ["Ar", "argon"], ["K", "kalium"], ["O3", "ozon"],
        ["KCl", "kaliumchlorid"], ["CaCl2", "calciumchlorid"], ["NaOH", "natriumhydroxid"],
        ["CH3COOH", "eddikesyre"], ["C12H22O11", "saccharose"], ["HF", "hydrogenfluorid"],
        ["C2H3Cl", "vinylchlorid"], ["Zn", "zink"], ["Mg(OH)2", "magnesiumhydroxid"], ["C3H8O", "propanol"],
        ["Cu(OH)2", "kobber(II)hydroxid"], ["K2O", "kaliumoxid"], ["CuS", "kobber(II)sulfid"],
        ["N2O", "dinitrogenoxid"], ["C2H4O", "ethanal"], ["HCOOH", "methansyre"], ["CH3NO", "formamid"],
        ["Si", "silicium"], ["C7H14", "hepten"]
    ];

    var STOF = {};
    D.STOFFER = S.map(function (r) {
        var t = taelling(r[0]);
        var st = {
            f: r[0], tekst: NK.formel(r[0]), navn: r[1], Navn: r[1].charAt(0).toUpperCase() + r[1].slice(1),
            form: r[2] || null, farve: r[3] || null, rho: r[4] || 0, fakta: r[5] || "",
            antal: t.antal, orden: t.orden, M: D.molarmasse(r[0]), struktur: STRUKTUR[r[0]] || null
        };
        STOF[r[0]] = st;
        return st;
    });
    D.stof = function (f) { return STOF[f] || null; };

    /* Hvad 1 mol af stoffet er, i én linje */
    D.enMol = function (st) {
        var t = "1 mol " + st.navn + " vejer " + NK.komma(st.M) + " g.";
        if (st.form === "vaeske") t += " Det er " + Math.round(st.M / 100 / st.rho) + " mL.";
        if (st.form === "gas") t += " Som gas fylder det ca. 24 L.";
        return t;
    };

    /* ----- Fane 1: vaegten ----------------------------------------------------- */
    D.NIVEAUER = [
        { navn: "Tal efter symbolet", kort: "H₂O, O₂, CO₂, SO₂", farve: "#3d9ee0", stoffer: ["H2O", "O2", "CO2", "SO2"] },
        { navn: "Mange atomer", kort: "CH₄, ethanol, hexan, glucose", farve: "#3fae72", stoffer: ["CH4", "C2H5OH", "C6H14", "C6H12O6"] },
        { navn: "Salte og parenteser", kort: "NaCl, CaCO₃, Ca(OH)₂, Al₂(SO₄)₃", farve: "#e6892a", stoffer: ["NaCl", "CaCO3", "Ca(OH)2", "Al2(SO4)3"] }
    ];
    D.VAEGT = [];
    D.NIVEAUER.forEach(function (nv, n) {
        nv.stoffer.forEach(function (f, i) { D.VAEGT.push({ st: STOF[f], niveau: n, plads: i }); });
    });

    /* Hjaelpen til at bygge molekylet: det, formlen goer svaer */
    D.hintByg = function (st) {
        if (/\(/.test(st.f)) return "Tallet efter parentesen ganger alt indeni.";
        var gange = {};
        var dobbelt = null;
        (st.f.match(/[A-Z][a-z]?/g) || []).forEach(function (s) {
            gange[s] = (gange[s] || 0) + 1;
            if (gange[s] === 2 && !dobbelt) dobbelt = s;
        });
        if (dobbelt) return dobbelt + " står to steder i formlen. Tæl begge med.";
        return "Tallet efter et symbol er antallet af atomer. Står der intet tal, er der ét.";
    };

    D.svarByg = function (st) {
        var dele = st.orden.map(function (s) { return st.antal[s] + " " + s; });
        var sidste = dele.pop();
        return (dele.length ? dele.join(", ") + " og " : "") + sidste + ".";
    };

    /* ----- Fane 2: skaalvaegten -------------------------------------------------
       Par af stoffer, 1 mol af hvert. Niveau 0 er tydelige, 2 er taette.
       Forklaringen rammer den fejl, parret er valgt for. */
    D.PAR = [
        ["H2O", "CO2", 0, "Lige mange atomer. C og O vejer meget mere end H."],
        ["CH4", "O2", 0, "CH₄ har flest atomer, men fire af dem er H, og H vejer kun 1,01."],
        ["H2", "He", 0, "He er ét atom, men det vejer næsten det dobbelte af to H."],
        ["C6H14", "Cl2", 0, "Her vinder den med flest atomer: seks C vejer mere end to Cl."],
        ["NH3", "H2O", 1, "Tre atomer mod fire. O vejer mere end N og H tilsammen."],
        ["CH4", "NH3", 1, "N vejer mere end C og H tilsammen. Fem atomer taber til fire."],
        ["Fe", "C4H10", 1, "Ét tungt atom mod fjorten lette. Butan vejer lidt mere."],
        ["Ar", "K", 1, "K har det største atomnummer, men Ar har den største atommasse."],
        ["O3", "CO2", 1, "Tre atomer hver. Tre O vejer mere end ét C og to O."],
        ["CO", "N2", 2, "28,01 mod 28,02. Skålvægten kan ikke mærke 0,01 g."],
        ["Cu", "SO2", 2, "Ét atom mod tre. SO₂ vejer 0,51 g mere."],
        ["CO2", "C3H8", 2, "44,01 mod 44,11. Elleve atomer vejer lidt mere end tre."],
        ["H2SO4", "H3PO4", 2, "98,08 mod 98,00. Det er S og P, der gør forskellen."],
        ["C2H5OH", "NO2", 2, "46,08 mod 46,01. Tæt, men ethanol vejer mest."]
    ].map(function (r) { return { a: STOF[r[0]], b: STOF[r[1]], niveau: r[2], hvorfor: r[3] }; });

    /* Skaalvaegten kan maerke 0,05 g. Mindre forskelle staar lige. */
    D.FOELSOMHED = 5;
    D.RUNDE = [3, 3, 3];   /* par fra hvert niveau i en runde */

    D.RUNDE_REPLIK = [
        [0, "Flest atomer vinder ikke. Det har vægten vist nogle gange."],
        [3, "Det er atommasserne, der vejer. Ikke antallet."],
        [6, "Flertallet rigtigt. Vægten er enig med dig. Oftest."],
        [9, "Ni rigtige. Skålvægten har ikke mere at lære dig."]
    ];
    D.REKORD_REPLIK = "Ny rekord. Jeg noterer det. Et sted.";

    /* ----- Fane 3: ukendt stof ---------------------------------------------------
       Etiketten er faldet af flasken. Kun molarmassen er tilbage. Det
       foerste stof er det rigtige; de tre andre er de etiketter, der ligger
       ved siden af. */
    D.GAADE_NIVEAUER = [
        { navn: "Tydelig forskel", farve: "#3d9ee0", hint: "Regn molarmassen for etiketterne. Groft er nok her: H er ca. 1, C 12, N 14 og O 16." },
        { navn: "Tæt på", farve: "#3fae72", hint: "To af dem ligger tæt. Regn dem med tabellens atommasser." },
        { navn: "To decimaler", farve: "#e6892a", hint: "Rundet af giver de næsten det samme. Regn med to decimaler." }
    ];
    D.GAADER = [
        [0, ["H2O", "O2", "CO2", "NaCl"]],
        [0, ["CO2", "CH4", "SO2", "NH3"]],
        [0, ["NaCl", "KCl", "CaCl2", "NaOH"]],
        [0, ["C6H12O6", "C2H5OH", "CH3COOH", "C12H22O11"]],
        [1, ["NH3", "CH4", "H2O", "HF"]],
        [1, ["Cu", "SO2", "Zn", "C2H3Cl"]],
        [1, ["Ca(OH)2", "KCl", "C3H8O", "Mg(OH)2"]],
        [1, ["H2SO4", "Cu(OH)2", "K2O", "CuS"]],
        [2, ["C2H4", "N2", "CO", "Si"]],
        [2, ["CO2", "N2O", "C3H8", "C2H4O"]],
        [2, ["H3PO4", "H2SO4", "C7H14", "Cu(OH)2"]],
        [2, ["C2H5OH", "NO2", "HCOOH", "CH3NO"]]
    ].map(function (r, i) {
        return { nr: i, niveau: r[0], st: STOF[r[1][0]], kort: r[1].map(function (f) { return STOF[f]; }) };
    });
    D.GAADE_NIVEAUER.forEach(function (nv, n) {
        var i = 0;
        D.GAADER.forEach(function (g) { if (g.niveau === n) g.plads = i++; });
    });

    /* ----- Kemichael ----------------------------------------------------------
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_VAEGT = [
        "Vægten. Den kan veje meget, men ikke ét molekyle.",
        "Byg molekylet, og regn molarmassen til højre.",
        "Atommassen er det nederste tal. Ikke atomnummeret."
    ];
    D.INTRO_SKAAL = [
        "Skålvægten. 1 mol på hver side.",
        "Gæt, hvilken side der synker, før jeg slipper den."
    ];
    D.INTRO_UKENDT = [
        "Etiketterne er faldet af flaskerne. Igen.",
        "Molarmassen står på mærket. Find etiketten, der passer.",
        "Afrunding er ikke en undskyldning."
    ];

    D.NIVEAU_ROS = [
        "Fire stoffer vejet. Vægten står stadig på nul. Du gør ikke.",
        "Tyve atomer i hexan, og ingen blev glemt.",
        "Parenteserne holdt. Det gør de ikke altid."
    ];
    D.VAEGT_FAERDIG = "Tolv stoffer vejet. Jeg skriver det i regnskabet.";

    D.GAADE_ROS = [
        "Fire flasker har fået etiket. Lageret takker.",
        "Tæt på var ikke tæt nok. Godt regnet.",
        "To decimaler. Nu ved du, hvorfor de står der."
    ];
    D.GAADER_FAERDIG = "Tolv etiketter på plads. Nu må rektor gerne komme.";

    NK.Data = D;
}());

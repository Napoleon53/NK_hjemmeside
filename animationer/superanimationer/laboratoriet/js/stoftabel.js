/* =====================================================================
   stoftabel.js - den faelles tabel over stoffer, reaktioner og redoxpar

   Alle laboratoriets forsoeg henter deres stoffer her. Et forsoeg
   vaelger bare, hvilke flasker der staar paa bordet. Logikken (bundfald,
   syre-base, redox, varme, gas) er i stof.js; her staar kun data.

   Enheder: K for ligevaegte og oploselighedsprodukter i mM. Farvestyrken
   k er pr. mM pr. reagensglas-vejlaengde: 0,1 M CuSO4 giver A = 1,2.
   ΔH i kJ/mol, negativ = varmer op.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof;

    /* ----- Ioner og molekyler i oploesning ------------------------------ */
    St.def("H+",      { M: 1, formel: "H", q: 1, navn: "hydroner", atomer: { H: 1 } });
    St.def("OH-",     { M: 17, formel: "OH", q: -1, navn: "hydroxidioner", atomer: { O: 1, H: 1 } });
    St.def("Na+",     { M: 23, flamme: { r: 255, g: 200, b: 40 }, formel: "Na", q: 1, navn: "natriumioner", atomer: { Na: 1 } });
    St.def("K+",      { M: 39.1, flamme: { r: 200, g: 150, b: 255 }, formel: "K", q: 1, navn: "kaliumioner", atomer: { K: 1 } });
    St.def("Cl-",     { M: 35.5, formel: "Cl", q: -1, navn: "chloridioner", atomer: { Cl: 1 } });
    St.def("I-",      { M: 126.9, formel: "I", q: -1, navn: "iodidioner", atomer: { I: 1 } });
    St.def("NO3-",    { M: 62, formel: "NO₃", q: -1, navn: "nitrationer", atomer: { N: 1, O: 3 } });
    St.def("SO42-",   { M: 96.1, formel: "SO₄", q: -2, navn: "sulfationer", atomer: { S: 1, O: 4 } });
    St.def("CO32-",   { M: 60, formel: "CO₃", q: -2, navn: "carbonationer", atomer: { C: 1, O: 3 } });
    St.def("Pb2+",    { M: 207.2, formel: "Pb", q: 2, navn: "blyioner", atomer: { Pb: 1 } });
    St.def("Ag+",     { M: 107.9, formel: "Ag", q: 1, navn: "sølvioner", atomer: { Ag: 1 } });
    St.def("Mg2+",    { M: 24.3, formel: "Mg", q: 2, navn: "magnesiumioner", atomer: { Mg: 1 } });
    St.def("Zn2+",    { M: 65.4, formel: "Zn", q: 2, navn: "zinkioner", atomer: { Zn: 1 } });
    St.def("Fe2+",    { M: 55.8, formel: "Fe", q: 2, navn: "jern(II)ioner", atomer: { Fe: 1 }, farve: { r: 150, g: 200, b: 160 }, k: 0.004 });
    St.def("Cu2+",    { M: 63.5, flamme: { r: 60, g: 220, b: 130 }, formel: "Cu", q: 2, navn: "kobberioner", atomer: { Cu: 1 }, farve: { r: 70, g: 150, b: 225 }, k: 0.012 });
    St.def("Fe3+",    { M: 55.8, formel: "Fe", q: 3, navn: "jern(III)ioner", atomer: { Fe: 1 }, farve: { r: 215, g: 170, b: 80 }, k: 0.02 });
    St.def("SCN-",    { M: 58.1, formel: "SCN", q: -1, navn: "thiocyanationer", atomer: { S: 1, C: 1, N: 1 } });
    St.def("FeSCN2+", { M: 113.9, formel: "FeSCN", q: 2, navn: "jernthiocyanat-komplekset", atomer: { Fe: 1, S: 1, C: 1, N: 1 }, farve: { r: 185, g: 25, b: 20 }, k: 0.35 });
    St.def("MnO4-",   { M: 118.9, formel: "MnO₄", q: -1, navn: "permanganationer", atomer: { Mn: 1, O: 4 }, farve: { r: 130, g: 20, b: 150 }, k: 0.6 });
    St.def("HAc",     { M: 60.1, formel: "CH₃COOH", q: 0, navn: "ethansyre", atomer: { C: 2, H: 4, O: 2 } });
    St.def("Ac-",     { M: 59.1, formel: "CH₃COO", q: -1, navn: "acetationer", atomer: { C: 2, H: 3, O: 2 } });
    St.def("farve",   { formel: "farvestof", q: 0, navn: "frugtfarve", farve: { r: 225, g: 40, b: 60 }, k: 0.2 });

    /* Koncentrerede syrer: molekylet holder, til det er fortyndet, og
       fortyndingen varmer */
    St.def("H2SO4",   { M: 98.1, formel: "H₂SO₄", q: 0, navn: "koncentreret svovlsyre", atomer: { H: 2, S: 1, O: 4 }, dHfort: -95 });
    St.def("HNO3",    { M: 63, formel: "HNO₃", q: 0, navn: "koncentreret salpetersyre", atomer: { H: 1, N: 1, O: 3 }, dHfort: -33 });

    /* ----- Indikatorer ---------------------------------------------------- */
    St.def("phph", { formel: "phenolphthalein", q: 0, navn: "phenolphthalein", k: 6, indikator: { pKa: 9.4, syre: null, base: { r: 230, g: 60, b: 140 } } });
    St.def("btb",  { formel: "bromthymolblåt", q: 0, navn: "bromthymolblåt", k: 8, indikator: { pKa: 7.1, syre: { r: 230, g: 200, b: 40 }, base: { r: 40, g: 110, b: 200 } } });

    /* ----- Gasser ------------------------------------------------------------ */
    St.def("H2(g)",  { formel: "H₂", fase: "g", navn: "dihydrogen", atomer: { H: 2 } });
    St.def("CO2(g)", { formel: "CO₂", fase: "g", navn: "carbondioxid", atomer: { C: 1, O: 2 } });
    St.def("NO2(g)", { formel: "NO₂", fase: "g", navn: "nitrogendioxid", atomer: { N: 1, O: 2 }, farve: { r: 150, g: 70, b: 20 } });

    /* ----- Fast stof: pulver, metal og bundfald ----------------------------- */
    St.def("NaCl(s)",     { M: 58.4, formel: "NaCl", fase: "s", korn: true, farve: { r: 240, g: 240, b: 240 }, navn: "natriumchlorid", atomer: { Na: 1, Cl: 1 } });
    St.def("KI(s)",       { M: 166, formel: "KI", fase: "s", korn: true, farve: { r: 245, g: 245, b: 240 }, navn: "kaliumiodid", atomer: { K: 1, I: 1 } });
    St.def("CuSO4(s)",    { M: 159.6, formel: "CuSO₄", fase: "s", korn: true, farve: { r: 60, g: 120, b: 210 }, navn: "kobbersulfat", atomer: { Cu: 1, S: 1, O: 4 } });
    St.def("Pb(NO3)2(s)", { M: 331.2, formel: "Pb(NO₃)₂", fase: "s", korn: true, farve: { r: 245, g: 245, b: 245 }, navn: "blynitrat", atomer: { Pb: 1, N: 2, O: 6 } });
    St.def("Na2CO3(s)",   { M: 106, formel: "Na₂CO₃", fase: "s", korn: true, farve: { r: 245, g: 245, b: 240 }, navn: "natriumcarbonat", atomer: { Na: 2, C: 1, O: 3 } });
    St.def("Mg(s)",       { M: 24.3, formel: "Mg", fase: "s", korn: true, farve: { r: 205, g: 208, b: 212 }, navn: "magnesium", atomer: { Mg: 1 } });
    St.def("Zn(s)",       { M: 65.4, formel: "Zn", fase: "s", korn: true, farve: { r: 160, g: 170, b: 185 }, navn: "zink", atomer: { Zn: 1 } });
    St.def("Cu(s)",       { M: 63.5, formel: "Cu", fase: "s", korn: true, farve: { r: 184, g: 115, b: 51 }, navn: "kobber", atomer: { Cu: 1 } });
    St.def("Ag(s)",       { M: 107.9, formel: "Ag", fase: "s", korn: true, farve: { r: 200, g: 200, b: 205 }, navn: "sølv", atomer: { Ag: 1 } });
    St.def("PbI2(s)",     { M: 461, formel: "PbI₂", fase: "s", farve: { r: 245, g: 210, b: 40 }, navn: "blyiodid", atomer: { Pb: 1, I: 2 } });
    St.def("AgCl(s)",     { M: 143.3, formel: "AgCl", fase: "s", farve: { r: 238, g: 238, b: 235 }, navn: "sølvchlorid", atomer: { Ag: 1, Cl: 1 } });
    St.def("AgI(s)",      { M: 234.8, formel: "AgI", fase: "s", farve: { r: 240, g: 230, b: 150 }, navn: "sølviodid", atomer: { Ag: 1, I: 1 } });
    St.def("PbCl2(s)",    { M: 278.1, formel: "PbCl₂", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "blychlorid", atomer: { Pb: 1, Cl: 2 } });
    St.def("Cu(OH)2(s)",  { M: 97.6, formel: "Cu(OH)₂", fase: "s", farve: { r: 90, g: 160, b: 215 }, navn: "kobberhydroxid", atomer: { Cu: 1, O: 2, H: 2 } });
    St.def("Fe(OH)3(s)",  { M: 106.9, formel: "Fe(OH)₃", fase: "s", farve: { r: 150, g: 80, b: 30 }, navn: "jern(III)hydroxid", atomer: { Fe: 1, O: 3, H: 3 } });
    St.def("Mg(OH)2(s)",  { M: 58.3, formel: "Mg(OH)₂", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "magnesiumhydroxid", atomer: { Mg: 1, O: 2, H: 2 } });
    St.def("Zn(OH)2(s)",  { M: 99.4, formel: "Zn(OH)₂", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "zinkhydroxid", atomer: { Zn: 1, O: 2, H: 2 } });

    /* ----- Pulver oploeses ------------------------------------------------- */
    St.reaktion({ id: "nacl",   venstre: [[1, "NaCl(s)"]],     hoejre: [[1, "Na+"], [1, "Cl-"]],       slags: "oploes", fart: 0.35, dH: 4 });
    St.reaktion({ id: "ki",     venstre: [[1, "KI(s)"]],       hoejre: [[1, "K+"], [1, "I-"]],         slags: "oploes", fart: 0.4, dH: 20 });
    St.reaktion({ id: "cuso4",  venstre: [[1, "CuSO4(s)"]],    hoejre: [[1, "Cu2+"], [1, "SO42-"]],    slags: "oploes", fart: 0.25, dH: -70 });
    St.reaktion({ id: "pbno3",  venstre: [[1, "Pb(NO3)2(s)"]], hoejre: [[1, "Pb2+"], [2, "NO3-"]],     slags: "oploes", fart: 0.3, dH: 30 });
    St.reaktion({ id: "na2co3", venstre: [[1, "Na2CO3(s)"]],   hoejre: [[2, "Na+"], [1, "CO32-"]],     slags: "oploes", fart: 0.3, dH: -25 });

    /* ----- Bundfald (oploselighedsprodukter i mM) --------------------------- */
    St.reaktion({ id: "pbi2",  venstre: [[1, "Pb2+"], [2, "I-"]],  hoejre: [[1, "PbI2(s)"]],    slags: "faeld", K: 7, fart: 3 });
    St.reaktion({ id: "agcl",  venstre: [[1, "Ag+"], [1, "Cl-"]],  hoejre: [[1, "AgCl(s)"]],    slags: "faeld", K: 1.8e-4, fart: 4 });
    St.reaktion({ id: "agi",   venstre: [[1, "Ag+"], [1, "I-"]],   hoejre: [[1, "AgI(s)"]],     slags: "faeld", K: 8.5e-11, fart: 4 });
    St.reaktion({ id: "pbcl2", venstre: [[1, "Pb2+"], [2, "Cl-"]], hoejre: [[1, "PbCl2(s)"]],   slags: "faeld", K: 17000, fart: 2 });
    St.reaktion({ id: "cuoh2", venstre: [[1, "Cu2+"], [2, "OH-"]], hoejre: [[1, "Cu(OH)2(s)"]], slags: "faeld", K: 2e-11, fart: 3 });
    St.reaktion({ id: "feoh3", venstre: [[1, "Fe3+"], [3, "OH-"]], hoejre: [[1, "Fe(OH)3(s)"]], slags: "faeld", K: 3e-29, fart: 3 });
    St.reaktion({ id: "mgoh2", venstre: [[1, "Mg2+"], [2, "OH-"]], hoejre: [[1, "Mg(OH)2(s)"]], slags: "faeld", K: 5.6e-3, fart: 2 });
    St.reaktion({ id: "znoh2", venstre: [[1, "Zn2+"], [2, "OH-"]], hoejre: [[1, "Zn(OH)2(s)"]], slags: "faeld", K: 3e-8, fart: 2 });

    /* ----- Syre og base --------------------------------------------------- */
    /* Vandets autoprotolyse: [H⁺][OH⁻] = 10⁻¹⁴ M² = 10⁻⁸ mM². Det er ogsaa
       neutralisationen (baglaens), som varmer med 57 kJ/mol. */
    St.reaktion({ id: "vand",  venstre: [[1, "H2O"]],  hoejre: [[1, "H+"], [1, "OH-"]], slags: "ligevaegt", K: 1e-8, fart: 25, dH: 57 });
    /* Ethansyre: Ka = 1,74·10⁻⁵ M = 1,74·10⁻² mM */
    St.reaktion({ id: "hac",   venstre: [[1, "HAc"]],  hoejre: [[1, "H+"], [1, "Ac-"]], slags: "ligevaegt", K: 1.74e-2, fart: 25 });
    /* Carbonat og syre giver CO₂ */
    St.reaktion({ id: "co2",   venstre: [[1, "CO32-"], [2, "H+"]], hoejre: [[1, "CO2(g)"], [1, "H2O"]], slags: "fuld", fart: 3, dH: -12 });
    /* Koncentrerede syrer dissocierer, saa snart der kommer vand til (i flasken
       holder molekylet, saa fortyndingsvarmen falder, naar der haeldes) */
    St.reaktion({ id: "h2so4", venstre: [[1, "H2SO4"]], hoejre: [[2, "H+"], [1, "SO42-"]], slags: "fuld", fart: 6,
        betingelse: function (o) { return St.konc(o, "H2SO4") < 17500; } });
    St.reaktion({ id: "hno3",  venstre: [[1, "HNO3"]],  hoejre: [[1, "H+"], [1, "NO3-"]], slags: "fuld", fart: 6,
        betingelse: function (o) { return St.konc(o, "HNO3") < 13500; } });

    /* ----- Ligevaegt ------------------------------------------------------ */
    St.reaktion({ id: "fescn", venstre: [[1, "Fe3+"], [1, "SCN-"]], hoejre: [[1, "FeSCN2+"]], slags: "ligevaegt", K: 0.14, fart: 2, dH: -20 });

    /* ----- Reaktioner med betingelser -------------------------------------- */
    /* Kobber og ufortyndet salpetersyre: brune dampe */
    St.reaktion({ id: "cu_hno3_konc", venstre: [[1, "Cu(s)"], [4, "HNO3"]], hoejre: [[1, "Cu2+"], [2, "NO3-"], [2, "NO2(g)"], [2, "H2O"]],
        slags: "fuld", fart: 1, dH: -140 });
    /* Kobber og koncentreret salpetersyre (over ca. 4 M): brune dampe */
    St.reaktion({ id: "cu_hno3", venstre: [[1, "Cu(s)"], [4, "H+"], [2, "NO3-"]], hoejre: [[1, "Cu2+"], [2, "NO2(g)"], [2, "H2O"]],
        slags: "fuld", fart: 0.8, dH: -140, min: { "H+": 4000, "NO3-": 4000 } });

    /* ----- Redoxpar (standardpotentialer i V) --------------------------------- */
    St.par({ ox: "Mg2+", red: "Mg(s)", e: 2, E0: -2.37 });
    St.par({ ox: "Zn2+", red: "Zn(s)", e: 2, E0: -0.76 });
    St.par({ ox: "H+",   red: "H2(g)", e: 2, E0: 0, oxKoef: 2 });
    St.par({ ox: "Cu2+", red: "Cu(s)", e: 2, E0: 0.34 });
    St.par({ ox: "Ag+",  red: "Ag(s)", e: 1, E0: 0.80 });
}());

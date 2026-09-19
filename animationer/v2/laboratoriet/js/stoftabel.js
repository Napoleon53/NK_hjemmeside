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
    /* Frugtfarven er blaa, saa den ikke kan forveksles med den roede
       ligevaegtsblanding: i en fortyndingsproeve staar de to ved siden af
       hinanden, og det er forskellen paa dem, der skal ses. */
    St.def("farve",   { formel: "farvestof", q: 0, navn: "frugtfarve", farve: { r: 45, g: 120, b: 215 }, k: 0.2 });

    /* Koncentrerede syrer: molekylet holder, til det er fortyndet, og
       fortyndingen varmer */
    St.def("H2SO4",   { M: 98.1, formel: "H₂SO₄", q: 0, navn: "koncentreret svovlsyre", atomer: { H: 2, S: 1, O: 4 }, dHfort: -95, cRef: 18000 });
    St.def("HNO3",    { M: 63, formel: "HNO₃", q: 0, navn: "koncentreret salpetersyre", atomer: { H: 1, N: 1, O: 3 }, dHfort: -33, cRef: 14000 });

    /* ----- Indikatorer ---------------------------------------------------- */
    St.def("phph", { formel: "phenolphthalein", kort: "PP", q: 0, navn: "phenolphthalein", k: 6, indikator: { pKa: 9.4, syre: null, base: { r: 230, g: 60, b: 140 } } });
    St.def("btb",  { formel: "bromthymolblåt", kort: "BTB", q: 0, navn: "bromthymolblåt", k: 8, indikator: { pKa: 7.1, syre: { r: 230, g: 200, b: 40 }, base: { r: 40, g: 110, b: 200 } } });

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

    /* ----- Flere ioner og salte fra oploselighedstabellen ------------------- */
    St.def("Ba2+",       { M: 137.3, formel: "Ba", q: 2, navn: "bariumioner", atomer: { Ba: 1 }, flamme: { r: 180, g: 255, b: 120 } });
    St.def("I2",         { M: 253.8, formel: "I₂", q: 0, navn: "iod", atomer: { I: 2 }, farve: { r: 170, g: 90, b: 20 }, k: 0.3 });
    St.def("Fe(s)",      { M: 55.8, formel: "Fe", fase: "s", korn: true, farve: { r: 120, g: 120, b: 125 }, navn: "jern", atomer: { Fe: 1 } });
    St.def("Pb(s)",      { M: 207.2, formel: "Pb", fase: "s", korn: true, farve: { r: 110, g: 115, b: 125 }, navn: "bly", atomer: { Pb: 1 } });
    St.def("CuI(s)",     { M: 190.5, formel: "CuI", fase: "s", farve: { r: 235, g: 230, b: 220 }, navn: "kobber(I)iodid", atomer: { Cu: 1, I: 1 } });
    St.def("PbSO4(s)",   { M: 303.3, formel: "PbSO₄", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "blysulfat", atomer: { Pb: 1, S: 1, O: 4 } });
    St.def("Pb(OH)2(s)", { M: 241.2, formel: "Pb(OH)₂", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "blyhydroxid", atomer: { Pb: 1, O: 2, H: 2 } });
    St.def("PbCO3(s)",   { M: 267.2, formel: "PbCO₃", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "blycarbonat", atomer: { Pb: 1, C: 1, O: 3 } });
    St.def("Ag2SO4(s)",  { M: 311.8, formel: "Ag₂SO₄", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "sølvsulfat", atomer: { Ag: 2, S: 1, O: 4 } });
    St.def("Ag2O(s)",    { M: 231.7, formel: "Ag₂O", fase: "s", farve: { r: 70, g: 55, b: 45 }, navn: "sølvoxid", atomer: { Ag: 2, O: 1 } });
    St.def("Ag2CO3(s)",  { M: 275.7, formel: "Ag₂CO₃", fase: "s", farve: { r: 235, g: 225, b: 170 }, navn: "sølvcarbonat", atomer: { Ag: 2, C: 1, O: 3 } });
    St.def("AgSCN(s)",   { M: 166, formel: "AgSCN", fase: "s", farve: { r: 238, g: 238, b: 235 }, navn: "sølvthiocyanat", atomer: { Ag: 1, S: 1, C: 1, N: 1 } });
    St.def("CuCO3(s)",   { M: 123.6, formel: "CuCO₃", fase: "s", farve: { r: 70, g: 170, b: 150 }, navn: "kobbercarbonat", atomer: { Cu: 1, C: 1, O: 3 } });
    St.def("MgCO3(s)",   { M: 84.3, formel: "MgCO₃", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "magnesiumcarbonat", atomer: { Mg: 1, C: 1, O: 3 } });
    St.def("ZnCO3(s)",   { M: 125.4, formel: "ZnCO₃", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "zinkcarbonat", atomer: { Zn: 1, C: 1, O: 3 } });
    St.def("BaSO4(s)",   { M: 233.4, formel: "BaSO₄", fase: "s", farve: { r: 245, g: 245, b: 245 }, navn: "bariumsulfat", atomer: { Ba: 1, S: 1, O: 4 } });
    St.def("BaCO3(s)",   { M: 197.3, formel: "BaCO₃", fase: "s", farve: { r: 245, g: 245, b: 245 }, navn: "bariumcarbonat", atomer: { Ba: 1, C: 1, O: 3 } });

    St.reaktion({ id: "pbso4",  venstre: [[1, "Pb2+"], [1, "SO42-"]],  hoejre: [[1, "PbSO4(s)"]],   slags: "faeld", K: 1.6e-2, fart: 3 });
    St.reaktion({ id: "pboh2",  venstre: [[1, "Pb2+"], [2, "OH-"]],    hoejre: [[1, "Pb(OH)2(s)"]], slags: "faeld", K: 1.4e-6, fart: 3 });
    St.reaktion({ id: "pbco3",  venstre: [[1, "Pb2+"], [1, "CO32-"]],  hoejre: [[1, "PbCO3(s)"]],   slags: "faeld", K: 7.4e-8, fart: 3 });
    St.reaktion({ id: "ag2so4", venstre: [[2, "Ag+"], [1, "SO42-"]],   hoejre: [[1, "Ag2SO4(s)"]],  slags: "faeld", K: 12000, fart: 2 });
    St.reaktion({ id: "ag2o",   venstre: [[2, "Ag+"], [2, "OH-"]],     hoejre: [[1, "Ag2O(s)"], [1, "H2O"]], slags: "faeld", K: 4e-4, fart: 3 });
    St.reaktion({ id: "ag2co3", venstre: [[2, "Ag+"], [1, "CO32-"]],   hoejre: [[1, "Ag2CO3(s)"]],  slags: "faeld", K: 8.5e-3, fart: 3 });
    St.reaktion({ id: "agscn",  venstre: [[1, "Ag+"], [1, "SCN-"]],    hoejre: [[1, "AgSCN(s)"]],   slags: "faeld", K: 1e-6, fart: 4 });
    St.reaktion({ id: "cuco3",  venstre: [[1, "Cu2+"], [1, "CO32-"]],  hoejre: [[1, "CuCO3(s)"]],   slags: "faeld", K: 1.4e-4, fart: 3 });
    St.reaktion({ id: "mgco3",  venstre: [[1, "Mg2+"], [1, "CO32-"]],  hoejre: [[1, "MgCO3(s)"]],   slags: "faeld", K: 6.8, fart: 2 });
    St.reaktion({ id: "znco3",  venstre: [[1, "Zn2+"], [1, "CO32-"]],  hoejre: [[1, "ZnCO3(s)"]],   slags: "faeld", K: 1.5e-4, fart: 3 });
    St.reaktion({ id: "baso4",  venstre: [[1, "Ba2+"], [1, "SO42-"]],  hoejre: [[1, "BaSO4(s)"]],   slags: "faeld", K: 1.1e-4, fart: 4 });
    St.reaktion({ id: "baco3",  venstre: [[1, "Ba2+"], [1, "CO32-"]],  hoejre: [[1, "BaCO3(s)"]],   slags: "faeld", K: 2.6e-3, fart: 3 });

    /* Redox mellem ioner: jern(III) og kobber(II) oxiderer iodid til iod */
    St.reaktion({ id: "fe_i",  venstre: [[2, "Fe3+"], [2, "I-"]], hoejre: [[2, "Fe2+"], [1, "I2"]], slags: "fuld", fart: 1.5, dH: -20 });
    St.reaktion({ id: "cu_i",  venstre: [[2, "Cu2+"], [4, "I-"]], hoejre: [[2, "CuI(s)"], [1, "I2"]], slags: "fuld", fart: 2, dH: -30 });
    /* Jern(III) og carbonat: hydroxid faelder, og carbonatet bliver til CO2 */
    St.reaktion({ id: "fe_co3", venstre: [[2, "Fe3+"], [3, "CO32-"], [3, "H2O"]], hoejre: [[2, "Fe(OH)3(s)"], [3, "CO2(g)"]], slags: "fuld", fart: 2, dH: -10 });

    /* ----- Ascorbinsyre og de faste salte til ligevaegtsforsoeget ------------
       Indgrebene i Fe3+ + SCN- = FeSCN2+ er: mere Fe3+ (fast Fe(NO3)3), mere
       SCN- (fast KSCN), faerre Fe3+ (ascorbinsyre reducerer til Fe2+) og
       faerre SCN- (AgNO3 faelder AgSCN, som allerede staar ovenfor).

       Ascorbinsyre er i virkeligheden ogsaa en svag syre (pKa1 = 4,1). Den
       ligevaegt er ikke med her, fordi forsoeget handler om jernthiocyanatet,
       og en syre-base-ligevaegt oveni ville flytte pH uden at laere noget
       bort. Skal den med senere, er det én linje som "hac" ovenfor. */
    St.def("Asc",    { M: 176.1, formel: "C₆H₈O₆", kort: "Asc", q: 0, navn: "ascorbinsyre", atomer: { C: 6, H: 8, O: 6 } });
    St.def("DHA",    { M: 174.1, formel: "C₆H₆O₆", kort: "DHA", q: 0, navn: "dehydroascorbinsyre", atomer: { C: 6, H: 6, O: 6 } });
    St.def("Asc(s)", { M: 176.1, formel: "C₆H₈O₆", kort: "Asc", fase: "s", korn: true, farve: { r: 245, g: 245, b: 240 }, navn: "ascorbinsyre", atomer: { C: 6, H: 8, O: 6 } });
    St.def("Fe(NO3)3(s)", { M: 241.9, formel: "Fe(NO₃)₃", fase: "s", korn: true, farve: { r: 210, g: 180, b: 130 }, navn: "jern(III)nitrat", atomer: { Fe: 1, N: 3, O: 9 } });
    St.def("KSCN(s)",     { M: 97.2, formel: "KSCN", fase: "s", korn: true, farve: { r: 245, g: 245, b: 240 }, navn: "kaliumthiocyanat", atomer: { K: 1, S: 1, C: 1, N: 1 } });

    St.reaktion({ id: "asc_s",  venstre: [[1, "Asc(s)"]],        hoejre: [[1, "Asc"]],                    slags: "oploes", fart: 0.3, dH: 10 });
    St.reaktion({ id: "feno33", venstre: [[1, "Fe(NO3)3(s)"]],   hoejre: [[1, "Fe3+"], [3, "NO3-"]],      slags: "oploes", fart: 0.3, dH: -40 });
    St.reaktion({ id: "kscn_s", venstre: [[1, "KSCN(s)"]],       hoejre: [[1, "K+"], [1, "SCN-"]],        slags: "oploes", fart: 0.4, dH: 24 });

    /* Ascorbinsyre reducerer jern(III) til jern(II), saa komplekset falder fra
       hinanden og farven bliver lysere. E0(DHA/Asc) = 0,06 V mod 0,77 V for
       Fe3+/Fe2+, saa den gaar til hoejre. */
    St.reaktion({ id: "asc_fe", venstre: [[2, "Fe3+"], [1, "Asc"]], hoejre: [[2, "Fe2+"], [1, "DHA"], [2, "H+"]], slags: "fuld", fart: 1.2, dH: -25 });

    /* ----- Faremaerkning (GHS, nogenlunde) og Kemichaels advarsel -----------
       over: koncentrationen i mM, hvor trinnet gaelder (0 for faste stoffer).
       sig: det, Kemichael siger, foerste gang flasken tages. */
    function fare(navn, liste) { St.STOFFER[navn].fare = liste; }
    fare("H2SO4", [{ over: 1000, maerker: ["aetsende"], sig: ["Koncentreret svovlsyre. Briller på.", "Syre i vand. Aldrig vand i syre, og lidt ad gangen."] }]);
    fare("HNO3",  [{ over: 1000, maerker: ["aetsende", "oxiderende"], sig: ["Koncentreret salpetersyre. Den giver brune dampe med metal.", "Det foregår i stinkskabet."] }]);
    fare("H+",    [{ over: 1000, maerker: ["aetsende", "sundhedsfare"], sig: ["Koncentreret saltsyre. Den damper, og dampen ætser.", "Stinkskab, og låget på igen."] },
                   { over: 500, maerker: ["sundhedsfare"] }]);
    fare("OH-",   [{ over: 500, maerker: ["aetsende"], sig: ["Natriumhydroxid. Den ætser, og man mærker det for sent.", "Briller. Og skyl, hvis det kommer på huden."] },
                   { over: 50, maerker: ["sundhedsfare"] }]);
    fare("Pb2+",  [{ over: 1, maerker: ["kronisk", "miljoe"], sig: ["Bly. Det hober sig op i kroppen.", "Vask hænder bagefter, og intet i afløbet."] }]);
    fare("Pb(NO3)2(s)", [{ over: 0, maerker: ["oxiderende", "kronisk", "miljoe"], sig: ["Blynitrat. Det hober sig op i kroppen.", "Intet i afløbet."] }]);
    fare("Ag+",   [{ over: 20, maerker: ["aetsende", "miljoe"], sig: ["Sølvnitrat giver sorte pletter på huden.", "De går væk. Om en uge."] }]);
    fare("Ba2+",  [{ over: 20, maerker: ["sundhedsfare"], sig: ["Bariumsalte er giftige at indtage.", "Ikke at man skulle drikke noget herinde."] }]);
    fare("Cu2+",  [{ over: 20, maerker: ["sundhedsfare", "miljoe"], sig: ["Kobbersalte skal ikke i afløbet.", "Dunken til uorganisk affald."] }]);
    fare("CuSO4(s)", [{ over: 0, maerker: ["sundhedsfare", "miljoe"], sig: ["Kobbersulfat. Ikke i afløbet, og ikke i munden."] }]);
    fare("Fe3+",  [{ over: 100, maerker: ["sundhedsfare"] }]);
    fare("SCN-",  [{ over: 100, maerker: ["sundhedsfare"] }]);
    fare("I2",    [{ over: 5, maerker: ["sundhedsfare", "miljoe"] }]);
    fare("Na2CO3(s)", [{ over: 0, maerker: ["sundhedsfare"] }]);
    fare("phph",  [{ over: 1, maerker: ["brandfarlig", "kronisk"], sig: ["Phenolphthalein er opløst i sprit.", "Ikke i nærheden af flammen."] }]);
    fare("Mg(s)", [{ over: 0, maerker: ["brandfarlig"], sig: ["Magnesium brænder med et lys, man ikke kigger på.", "Og det slukkes ikke med vand."] }]);
    fare("Zn(s)", [{ over: 0, maerker: ["brandfarlig", "miljoe"] }]);
    fare("Fe(s)", [{ over: 0, maerker: ["brandfarlig"] }]);
    fare("Fe(NO3)3(s)", [{ over: 0, maerker: ["oxiderende", "sundhedsfare"], sig: ["Jern(III)nitrat. Nitrat er oxiderende.", "Ikke sammen med noget, der kan braende."] }]);
    fare("KSCN(s)", [{ over: 0, maerker: ["sundhedsfare", "miljoe"], sig: ["Thiocyanat. Ikke sammen med syre.", "Så udvikler det blåsyre, og det er ikke en øvelse."] }]);
    /* Ascorbinsyre er C-vitamin og faar ikke maerke */

    /* ----- Redoxpar (standardpotentialer i V) --------------------------------- */
    St.par({ ox: "Mg2+", red: "Mg(s)", e: 2, E0: -2.37 });
    St.par({ ox: "Zn2+", red: "Zn(s)", e: 2, E0: -0.76 });
    St.par({ ox: "Fe2+", red: "Fe(s)", e: 2, E0: -0.44 });
    St.par({ ox: "Pb2+", red: "Pb(s)", e: 2, E0: -0.13 });
    St.par({ ox: "H+",   red: "H2(g)", e: 2, E0: 0, oxKoef: 2 });
    St.par({ ox: "Cu2+", red: "Cu(s)", e: 2, E0: 0.34 });
    St.par({ ox: "Fe3+", red: "Fe2+",  e: 1, E0: 0.77 });
    St.par({ ox: "Ag+",  red: "Ag(s)", e: 1, E0: 0.80 });
    /* DHA/Asc er ikke et redoxpar her. Halvreaktionen DHA + 2e⁻ + 2H⁺ -> Asc
       kraever hydroner for at stemme i ladning, og de udledte reaktioner
       mellem par regner ikke med H⁺. Ascorbinsyrens reduktion af jern(III)
       staar derfor som den navngivne reaktion "asc_fe" ovenfor, ligesom de
       oevrige redoxreaktioner mellem ioner. */
}());

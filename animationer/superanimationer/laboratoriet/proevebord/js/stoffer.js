/* =====================================================================
   stoffer.js - stofferne, reaktionerne og opstillingen paa proevebordet

   Alt her er tabeller. Selve kemien (oploesning, faeldning, ligevaegt,
   farve) regnes i ../../js/stof.js, og bordet i ../../js/bord.js.

   Farvestyrken k er pr. mM pr. reagensglas-vejlaengde. 0,1 M CuSO4 i
   et reagensglas giver saa A = 0,012 * 100 = 1,2: tydeligt blaat.
   Oploselighedsprodukter er i mM: Ksp(PbI2) = 7·10⁻⁹ M³ = 7 mM³.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var St = NK.Stof;

    /* ----- Ioner og molekyler i oploesning ------------------------------ */
    St.def("Na+",     { formel: "Na", q: 1, navn: "natriumioner" });
    St.def("K+",      { formel: "K", q: 1, navn: "kaliumioner" });
    St.def("Cl-",     { formel: "Cl", q: -1, navn: "chloridioner" });
    St.def("I-",      { formel: "I", q: -1, navn: "iodidioner" });
    St.def("NO3-",    { formel: "NO₃", q: -1, navn: "nitrationer" });
    St.def("SO42-",   { formel: "SO₄", q: -2, navn: "sulfationer" });
    St.def("OH-",     { formel: "OH", q: -1, navn: "hydroxidioner" });
    St.def("H+",      { formel: "H", q: 1, navn: "hydroner" });
    St.def("Pb2+",    { formel: "Pb", q: 2, navn: "blyioner" });
    St.def("Ag+",     { formel: "Ag", q: 1, navn: "sølvioner" });
    St.def("Cu2+",    { formel: "Cu", q: 2, navn: "kobberioner", farve: { r: 70, g: 150, b: 225 }, k: 0.012 });
    St.def("Fe3+",    { formel: "Fe", q: 3, navn: "jern(III)ioner", farve: { r: 215, g: 170, b: 80 }, k: 0.02 });
    St.def("SCN-",    { formel: "SCN", q: -1, navn: "thiocyanationer" });
    St.def("FeSCN2+", { formel: "FeSCN", q: 2, navn: "jernthiocyanat-komplekset", farve: { r: 185, g: 25, b: 20 }, k: 0.35 });
    St.def("MnO4-",   { formel: "MnO₄", q: -1, navn: "permanganationer", farve: { r: 130, g: 20, b: 150 }, k: 0.6 });
    St.def("farve",   { formel: "farvestof", q: 0, navn: "frugtfarve", farve: { r: 225, g: 40, b: 60 }, k: 0.2 });

    /* ----- Fast stof: pulver (korn) og bundfald --------------------------- */
    St.def("NaCl(s)",     { formel: "NaCl", fase: "s", korn: true, farve: { r: 240, g: 240, b: 240 }, navn: "natriumchlorid" });
    St.def("KI(s)",       { formel: "KI", fase: "s", korn: true, farve: { r: 245, g: 245, b: 240 }, navn: "kaliumiodid" });
    St.def("CuSO4(s)",    { formel: "CuSO₄", fase: "s", korn: true, farve: { r: 60, g: 120, b: 210 }, navn: "kobbersulfat" });
    St.def("Pb(NO3)2(s)", { formel: "Pb(NO₃)₂", fase: "s", korn: true, farve: { r: 245, g: 245, b: 245 }, navn: "blynitrat" });
    St.def("PbI2(s)",     { formel: "PbI₂", fase: "s", farve: { r: 245, g: 210, b: 40 }, navn: "blyiodid" });
    St.def("AgCl(s)",     { formel: "AgCl", fase: "s", farve: { r: 238, g: 238, b: 235 }, navn: "sølvchlorid" });
    St.def("AgI(s)",      { formel: "AgI", fase: "s", farve: { r: 240, g: 230, b: 150 }, navn: "sølviodid" });
    St.def("Cu(OH)2(s)",  { formel: "Cu(OH)₂", fase: "s", farve: { r: 90, g: 160, b: 215 }, navn: "kobberhydroxid" });
    St.def("Fe(OH)3(s)",  { formel: "Fe(OH)₃", fase: "s", farve: { r: 150, g: 80, b: 30 }, navn: "jern(III)hydroxid" });
    St.def("PbCl2(s)",    { formel: "PbCl₂", fase: "s", farve: { r: 240, g: 240, b: 240 }, navn: "blychlorid" });

    /* ----- Reaktioner ----------------------------------------------------- */
    /* Pulver oploeses */
    St.reaktion({ id: "nacl",   venstre: [[1, "NaCl(s)"]],     hoejre: [[1, "Na+"], [1, "Cl-"]],       slags: "oploes", fart: 0.35 });
    St.reaktion({ id: "ki",     venstre: [[1, "KI(s)"]],       hoejre: [[1, "K+"], [1, "I-"]],         slags: "oploes", fart: 0.4 });
    St.reaktion({ id: "cuso4",  venstre: [[1, "CuSO4(s)"]],    hoejre: [[1, "Cu2+"], [1, "SO42-"]],    slags: "oploes", fart: 0.25 });
    St.reaktion({ id: "pbno3",  venstre: [[1, "Pb(NO3)2(s)"]], hoejre: [[1, "Pb2+"], [2, "NO3-"]],     slags: "oploes", fart: 0.3 });

    /* Bundfald */
    St.reaktion({ id: "pbi2",   venstre: [[1, "Pb2+"], [2, "I-"]],   hoejre: [[1, "PbI2(s)"]],    slags: "faeld", K: 7, fart: 3 });
    St.reaktion({ id: "agcl",   venstre: [[1, "Ag+"], [1, "Cl-"]],   hoejre: [[1, "AgCl(s)"]],    slags: "faeld", K: 1.8e-4, fart: 4 });
    St.reaktion({ id: "agi",    venstre: [[1, "Ag+"], [1, "I-"]],    hoejre: [[1, "AgI(s)"]],     slags: "faeld", K: 8.5e-11, fart: 4 });
    St.reaktion({ id: "cuoh2",  venstre: [[1, "Cu2+"], [2, "OH-"]],  hoejre: [[1, "Cu(OH)2(s)"]], slags: "faeld", K: 2e-11, fart: 3 });
    St.reaktion({ id: "feoh3",  venstre: [[1, "Fe3+"], [3, "OH-"]],  hoejre: [[1, "Fe(OH)3(s)"]], slags: "faeld", K: 3e-29, fart: 3 });
    St.reaktion({ id: "pbcl2",  venstre: [[1, "Pb2+"], [2, "Cl-"]],  hoejre: [[1, "PbCl2(s)"]],   slags: "faeld", K: 17000, fart: 2 });

    /* Ligevaegt og neutralisation */
    St.reaktion({ id: "fescn",  venstre: [[1, "Fe3+"], [1, "SCN-"]], hoejre: [[1, "FeSCN2+"]],    slags: "ligevaegt", K: 0.14, fart: 2 });
    St.reaktion({ id: "neutral", venstre: [[1, "H+"], [1, "OH-"]],   hoejre: [[1, "H2O"]],        slags: "fuld", fart: 6 });

    /* ----- Opstillingen ----------------------------------------------------- */
    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }

    NK.OPSTILLING = [
        { navn: "dunk", type: "affaldsdunk", x: 66, etiket: ["AFFALD", "uorganisk"] },
        { navn: "baeger250", type: "baeger250", x: 170 },
        { navn: "vand", type: "sproejteflaske", x: 246, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },

        { navn: "fl_pb",   type: "flaske", x: 292, etiket: ["Pb(NO₃)₂", "0,1 M"], titel: "flasken med Pb(NO₃)₂", indhold: opl(250, { "Pb2+": 100, "NO3-": 200 }) },
        { navn: "fl_ki",   type: "flaske", x: 340, etiket: ["KI", "0,1 M"], titel: "flasken med KI", indhold: opl(250, { "K+": 100, "I-": 100 }) },
        { navn: "fl_cu",   type: "flaske", x: 388, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(250, { "Cu2+": 100, "SO42-": 100 }) },
        { navn: "fl_naoh", type: "flaske", x: 436, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(250, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_fe",   type: "flaske", x: 484, etiket: ["Fe(NO₃)₃", "0,01 M"], titel: "flasken med Fe(NO₃)₃", indhold: opl(250, { "Fe3+": 10, "NO3-": 30 }) },
        { navn: "fl_scn",  type: "flaske", x: 532, etiket: ["KSCN", "0,01 M"], titel: "flasken med KSCN", indhold: opl(250, { "K+": 10, "SCN-": 10 }) },
        { navn: "fl_hcl",  type: "flaske", x: 580, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(250, { "H+": 100, "Cl-": 100 }) },

        { navn: "ag", type: "draabeflaske", x: 626, etiket: ["AgNO₃", "0,1 M"], titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "pulver_nacl", type: "pulverglas", x: 672, etiket: "NaCl", titel: "pulverglasset med NaCl", indhold: { V: 0, T: 20, umol: { "NaCl(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "pulver_cu",   type: "pulverglas", x: 714, etiket: "CuSO₄", titel: "pulverglasset med CuSO₄", indhold: { V: 0, T: 20, umol: { "CuSO4(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "spatel", type: "spatel", p: { x: 650, y: 495, v: 0 } },

        { navn: "stativ", type: "stativ", p: { x: 745, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 2, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 4, nr: 3, titel: "glas 3" },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 6, nr: 4, titel: "glas 4" },

        /* Fri plads mellem stativet og varmepladen til at saette ting ned */
        { navn: "plade", type: "varmeplade", p: { x: 1230, y: 428, v: 0 } },
        { navn: "baeger100", type: "baeger100", paa: "plade", x: 1320 },

        { navn: "glasstav", type: "glasstav", x: 300 },
        { navn: "termometer", type: "termometer", x: 450 },
        { navn: "papir", type: "koekkenrulle", x: 176, y: 268 }
    ];

    NK.BORD_VALG = {
        bredde: 1420, hoejde: 600, bord: 500,
        hylde: { x0: 16, x1: 220, y: 268 },
        plakat: { x: 1250, y: 90 },
        boble: { x: 330, y: 140 }, bobleR: 120
    };
}());

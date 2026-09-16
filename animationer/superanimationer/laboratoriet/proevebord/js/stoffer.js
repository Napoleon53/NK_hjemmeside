/* =====================================================================
   stoffer.js - opstillingen paa proevebordet

   Stofferne, reaktionerne og redoxparrene staar i den faelles tabel
   ../../js/stoftabel.js. Her vaelges kun, hvad der staar paa bordet:
   flaskerne paa hylden bag bordet, draabeflaskerne, pulverglassene,
   glassene i stativet, baegerglassene, varmepladen og affaldsdunken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }
    var HYLDE = 322;

    NK.OPSTILLING = [
        { navn: "dunk", type: "affaldsdunk", x: 66, etiket: ["AFFALD", "uorganisk"] },
        { navn: "baeger250", type: "baeger250", x: 170 },
        { navn: "vand", type: "sproejteflaske", x: 246, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },

        /* Pulverglas og metaller */
        { navn: "pulver_nacl",   type: "pulverglas", x: 300, etiket: "NaCl", titel: "pulverglasset med NaCl", indhold: { V: 0, T: 20, umol: { "NaCl(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "pulver_cu",     type: "pulverglas", x: 344, etiket: "CuSO₄", titel: "pulverglasset med CuSO₄", indhold: { V: 0, T: 20, umol: { "CuSO4(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "pulver_na2co3", type: "pulverglas", x: 388, etiket: "Na₂CO₃", titel: "pulverglasset med Na₂CO₃", indhold: { V: 0, T: 20, umol: { "Na2CO3(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "metal_mg",      type: "pulverglas", x: 432, etiket: "Mg", titel: "glasset med magnesium", indhold: { V: 0, T: 20, umol: { "Mg(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "metal_zn",      type: "pulverglas", x: 476, etiket: "Zn", titel: "glasset med zink", indhold: { V: 0, T: 20, umol: { "Zn(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "metal_cu",      type: "pulverglas", x: 520, etiket: "Cu", titel: "glasset med kobber", indhold: { V: 0, T: 20, umol: { "Cu(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "metal_fe",      type: "pulverglas", x: 564, etiket: "Fe", titel: "glasset med jern", indhold: { V: 0, T: 20, umol: { "Fe(s)": 30000 } }, pulverMaks: 30000 },
        { navn: "spatel", type: "spatel", p: { x: 600, y: 495, v: 0 } },

        /* Flaskerne paa hylden bag bordet */
        { navn: "fl_pb",    type: "flaske", x: 280, y: HYLDE, etiket: ["Pb(NO₃)₂", "0,1 M"], titel: "flasken med Pb(NO₃)₂", indhold: opl(250, { "Pb2+": 100, "NO3-": 200 }) },
        { navn: "fl_ki",    type: "flaske", x: 328, y: HYLDE, etiket: ["KI", "0,1 M"], titel: "flasken med KI", indhold: opl(250, { "K+": 100, "I-": 100 }) },
        { navn: "fl_cu",    type: "flaske", x: 376, y: HYLDE, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(250, { "Cu2+": 100, "SO42-": 100 }) },
        { navn: "fl_fe",    type: "flaske", x: 424, y: HYLDE, etiket: ["Fe(NO₃)₃", "0,01 M"], titel: "flasken med Fe(NO₃)₃", indhold: opl(250, { "Fe3+": 10, "NO3-": 30 }) },
        { navn: "fl_scn",   type: "flaske", x: 472, y: HYLDE, etiket: ["KSCN", "0,01 M"], titel: "flasken med KSCN", indhold: opl(250, { "K+": 10, "SCN-": 10 }) },
        { navn: "fl_naoh",  type: "flaske", x: 520, y: HYLDE, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(250, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_hcl",   type: "flaske", x: 568, y: HYLDE, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(250, { "H+": 100, "Cl-": 100 }) },
        { navn: "fl_hac",   type: "flaske", x: 616, y: HYLDE, etiket: ["CH₃COOH", "0,1 M"], titel: "flasken med ethansyre", indhold: opl(250, { "HAc": 100 }) },
        { navn: "fl_h2so4", type: "flaske", x: 664, y: HYLDE, etiket: ["H₂SO₄", "konc. 18 M"], titel: "flasken med koncentreret svovlsyre", indhold: opl(250, { "H2SO4": 18000 }) },
        { navn: "fl_hno3",  type: "flaske", x: 712, y: HYLDE, etiket: ["HNO₃", "konc. 14 M"], titel: "flasken med koncentreret salpetersyre", indhold: opl(250, { "HNO3": 14000 }) },
        { navn: "fl_ba",    type: "flaske", x: 760, y: HYLDE, etiket: ["BaCl₂", "0,1 M"], titel: "flasken med BaCl₂", indhold: opl(250, { "Ba2+": 100, "Cl-": 200 }) },

        /* Draabeflaskerne paa hylden */
        { navn: "ag",   type: "draabeflaske", x: 820, y: HYLDE, etiket: ["AgNO₃", "0,1 M"], titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "phph", type: "draabeflaske", x: 872, y: HYLDE, etiket: ["phenol-", "phthalein"], titel: "dråbeflasken med phenolphthalein", indhold: opl(60, { "phph": 30 }) },
        { navn: "btb",  type: "draabeflaske", x: 924, y: HYLDE, etiket: ["bromthymol-", "blåt"], titel: "dråbeflasken med bromthymolblåt", indhold: opl(60, { "btb": 20 }) },

        { navn: "stativ", type: "stativ", p: { x: 690, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 2, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 4, nr: 3, titel: "glas 3" },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 6, nr: 4, titel: "glas 4" },

        /* Braender med trefod, vaegt med vejebaad, fri plads, varmeplade */
        { navn: "braender", type: "braender", p: { x: 1075, y: 425, v: 0 } },
        { navn: "vaegt", type: "vaegt", p: { x: 1160, y: 438, v: 0 } },
        { navn: "vejebaad", type: "vejebaad", paa: "vaegt", x: 1230 },
        { navn: "plade", type: "varmeplade", p: { x: 1420, y: 428, v: 0 } },
        { navn: "baeger100", type: "baeger100", paa: "plade", x: 1510 },

        { navn: "glasstav", type: "glasstav", x: 700 },
        { navn: "termometer", type: "termometer", x: 850 },
        { navn: "phmeter", type: "phmeter", x: 990 },
        { navn: "podetraad", type: "podetraad", x: 1320 },
        { navn: "papir", type: "koekkenrulle", x: 176, y: 268 }
    ];

    NK.BORD_VALG = {
        bredde: 1620, hoejde: 600, bord: 500,
        hylder: [{ x0: 16, x1: 220, y: 268 }, { x0: 250, x1: 960, y: HYLDE }],
        plakat: { x: 1440, y: 90 },
        /* Zoomboblen tegnes i panelet, ikke paa scenen (ingen boble her) */
        bobleR: 128, partikler: 6
    };
}());

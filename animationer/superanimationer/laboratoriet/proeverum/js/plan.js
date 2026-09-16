/* =====================================================================
   plan.js - rummene i proeverummet

   Tre rum paa raekke: forrummet, proevebordet og stinkskabet. Lugen
   mellem proevebordet og stinkskabet sender glas den ene eller den
   anden vej. Stofferne staar i ../../js/stoftabel.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function opl(V, mM) { return { V: V, T: 20, mM: mM }; }
    function pulver(navn, x, etiket, titel, stof) {
        var u = {}; u[stof] = 30000;
        return { navn: navn, type: "pulverglas", x: x, etiket: etiket, titel: titel, indhold: { V: 0, T: 20, umol: u }, pulverMaks: 30000 };
    }
    var HYLDE = 322;
    var BREDDE = 1620;

    var FORRUM = [
        { navn: "vask", type: "vask", x: 120 },
        { navn: "papir", type: "koekkenrulle", x: 100, y: 268 },
        { navn: "vand", type: "sproejteflaske", x: 246, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },
        { navn: "vand2", type: "sproejteflaske", x: 300, titel: "den anden sprøjteflaske med vand", indhold: opl(500, {}) },
        { navn: "baegerA", type: "baeger250", x: 420, titel: "det store bægerglas" },
        { navn: "baegerB", type: "baeger100", x: 520, titel: "det lille bægerglas" },
        { navn: "maaleglas", type: "maaleglas", x: 600 },
        { navn: "kolbe", type: "kolbe", x: 700 },
        { navn: "fl_nacl", type: "flaske", x: 300, y: HYLDE, etiket: ["NaCl", "0,1 M"], titel: "flasken med NaCl", indhold: opl(250, { "Na+": 100, "Cl-": 100 }) },
        { navn: "fl_naoh", type: "flaske", x: 348, y: HYLDE, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(250, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_hcl", type: "flaske", x: 396, y: HYLDE, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(250, { "H+": 100, "Cl-": 100 }) },
        { navn: "phph", type: "draabeflaske", x: 452, y: HYLDE, etiket: ["phenol-", "phthalein"], titel: "dråbeflasken med phenolphthalein", indhold: opl(60, { "phph": 30 }) },
        { navn: "btb", type: "draabeflaske", x: 504, y: HYLDE, etiket: ["bromthymol-", "blåt"], titel: "dråbeflasken med bromthymolblåt", indhold: opl(60, { "btb": 20 }) },
        { navn: "stativ", type: "stativ", p: { x: 820, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 2, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 4, nr: 3, titel: "glas 3" },
        { navn: "vaegt", type: "vaegt", p: { x: 1130, y: 438, v: 0 } },
        { navn: "vejebaad", type: "vejebaad", paa: "vaegt", x: 1200 },
        pulver("pulver_nacl", 1330, "NaCl", "pulverglasset med NaCl", "NaCl(s)"),
        pulver("pulver_na2co3", 1374, "Na₂CO₃", "pulverglasset med Na₂CO₃", "Na2CO3(s)"),
        pulver("pulver_cuso4", 1418, "CuSO₄", "pulverglasset med CuSO₄", "CuSO4(s)"),
        { navn: "spatel", type: "spatel", p: { x: 1460, y: 495, v: 0 } },
        { navn: "glasstav", type: "glasstav", x: 950 },
        { navn: "phmeter", type: "phmeter", x: 1040 }
    ];

    var BORD = [
        { navn: "dunk", type: "affaldsdunk", x: 66, etiket: ["AFFALD", "uorganisk"] },
        { navn: "baeger250", type: "baeger250", x: 170 },
        { navn: "vand", type: "sproejteflaske", x: 246, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },
        pulver("pulver_nacl", 300, "NaCl", "pulverglasset med NaCl", "NaCl(s)"),
        pulver("pulver_cu", 344, "CuSO₄", "pulverglasset med CuSO₄", "CuSO4(s)"),
        pulver("pulver_na2co3", 388, "Na₂CO₃", "pulverglasset med Na₂CO₃", "Na2CO3(s)"),
        pulver("metal_mg", 432, "Mg", "glasset med magnesium", "Mg(s)"),
        pulver("metal_zn", 476, "Zn", "glasset med zink", "Zn(s)"),
        pulver("metal_fe", 520, "Fe", "glasset med jern", "Fe(s)"),
        { navn: "spatel", type: "spatel", p: { x: 570, y: 495, v: 0 } },
        { navn: "fl_pb",   type: "flaske", x: 280, y: HYLDE, etiket: ["Pb(NO₃)₂", "0,1 M"], titel: "flasken med Pb(NO₃)₂", indhold: opl(250, { "Pb2+": 100, "NO3-": 200 }) },
        { navn: "fl_ki",   type: "flaske", x: 328, y: HYLDE, etiket: ["KI", "0,1 M"], titel: "flasken med KI", indhold: opl(250, { "K+": 100, "I-": 100 }) },
        { navn: "fl_cu",   type: "flaske", x: 376, y: HYLDE, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(250, { "Cu2+": 100, "SO42-": 100 }) },
        { navn: "fl_fe",   type: "flaske", x: 424, y: HYLDE, etiket: ["Fe(NO₃)₃", "0,01 M"], titel: "flasken med Fe(NO₃)₃", indhold: opl(250, { "Fe3+": 10, "NO3-": 30 }) },
        { navn: "fl_scn",  type: "flaske", x: 472, y: HYLDE, etiket: ["KSCN", "0,01 M"], titel: "flasken med KSCN", indhold: opl(250, { "K+": 10, "SCN-": 10 }) },
        { navn: "fl_naoh", type: "flaske", x: 520, y: HYLDE, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(250, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_hcl",  type: "flaske", x: 568, y: HYLDE, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(250, { "H+": 100, "Cl-": 100 }) },
        { navn: "fl_hac",  type: "flaske", x: 616, y: HYLDE, etiket: ["CH₃COOH", "0,1 M"], titel: "flasken med ethansyre", indhold: opl(250, { "HAc": 100 }) },
        { navn: "fl_ba",   type: "flaske", x: 664, y: HYLDE, etiket: ["BaCl₂", "0,1 M"], titel: "flasken med BaCl₂", indhold: opl(250, { "Ba2+": 100, "Cl-": 200 }) },
        { navn: "ag",   type: "draabeflaske", x: 724, y: HYLDE, etiket: ["AgNO₃", "0,1 M"], titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        { navn: "phph", type: "draabeflaske", x: 776, y: HYLDE, etiket: ["phenol-", "phthalein"], titel: "dråbeflasken med phenolphthalein", indhold: opl(60, { "phph": 30 }) },
        { navn: "btb",  type: "draabeflaske", x: 828, y: HYLDE, etiket: ["bromthymol-", "blåt"], titel: "dråbeflasken med bromthymolblåt", indhold: opl(60, { "btb": 20 }) },
        { navn: "stativ", type: "stativ", p: { x: 660, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 2, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 4, nr: 3, titel: "glas 3" },
        { navn: "glas4", type: "reagensglas", stativ: "stativ", hul: 6, nr: 4, titel: "glas 4" },
        { navn: "glasstav", type: "glasstav", x: 670 },
        { navn: "termometer", type: "termometer", x: 800 },
        { navn: "phmeter", type: "phmeter", x: 900 },
        { navn: "luge", type: "luge", x: 1115, til: "stinkskab", skilt: "TIL STINKSKABET" },
        { navn: "vaegt", type: "vaegt", p: { x: 1220, y: 438, v: 0 } },
        { navn: "vejebaad", type: "vejebaad", paa: "vaegt", x: 1290 },
        { navn: "plade", type: "varmeplade", p: { x: 1420, y: 428, v: 0 } },
        { navn: "baeger100", type: "baeger100", paa: "plade", x: 1510 }
    ];

    var STINKSKAB = [
        { navn: "luge", type: "luge", x: 120, til: "bord", skilt: "TIL PRØVEBORDET" },
        { navn: "baeger100", type: "baeger100", x: 400 },
        { navn: "baeger250", type: "baeger250", x: 490 },
        pulver("metal_cu", 580, "Cu", "glasset med kobber", "Cu(s)"),
        pulver("metal_mg", 624, "Mg", "glasset med magnesium", "Mg(s)"),
        pulver("metal_zn", 668, "Zn", "glasset med zink", "Zn(s)"),
        { navn: "spatel", type: "spatel", p: { x: 700, y: 495, v: 0 } },
        { navn: "fl_h2so4", type: "flaske", x: 420, y: HYLDE, etiket: ["H₂SO₄", "konc. 18 M"], titel: "flasken med koncentreret svovlsyre", indhold: opl(250, { "H2SO4": 18000 }) },
        { navn: "fl_hno3",  type: "flaske", x: 468, y: HYLDE, etiket: ["HNO₃", "konc. 14 M"], titel: "flasken med koncentreret salpetersyre", indhold: opl(250, { "HNO3": 14000 }) },
        { navn: "fl_hcl_k", type: "flaske", x: 516, y: HYLDE, etiket: ["HCl", "konc. 12 M"], titel: "flasken med koncentreret saltsyre", indhold: opl(250, { "H+": 12000, "Cl-": 12000 }) },
        { navn: "fl_naoh_k", type: "flaske", x: 564, y: HYLDE, etiket: ["NaOH", "2 M"], titel: "flasken med 2 M NaOH", indhold: opl(250, { "Na+": 2000, "OH-": 2000 }) },
        { navn: "fl_cu", type: "flaske", x: 612, y: HYLDE, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(250, { "Cu2+": 100, "SO42-": 100 }) },
        { navn: "vand", type: "sproejteflaske", x: 830, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },
        { navn: "stativ", type: "stativ", p: { x: 880, y: 400, v: 0 } },
        { navn: "glas1", type: "reagensglas", stativ: "stativ", hul: 0, nr: 1, titel: "glas 1" },
        { navn: "glas2", type: "reagensglas", stativ: "stativ", hul: 2, nr: 2, titel: "glas 2" },
        { navn: "glas3", type: "reagensglas", stativ: "stativ", hul: 4, nr: 3, titel: "glas 3" },
        { navn: "braender", type: "braender", p: { x: 1150, y: 425, v: 0 } },
        { navn: "podetraad", type: "podetraad", x: 1080 },
        { navn: "termometer", type: "termometer", x: 990 },
        { navn: "dunk", type: "affaldsdunk", x: 1420, etiket: ["AFFALD", "syre"] },
        { navn: "papir", type: "koekkenrulle", x: 176, y: 268 }
    ];

    NK.RUM_PLAN = {
        start: "bord",
        rum: [
            {
                navn: "forrum", titel: "Forrummet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 16, x1: 220, y: 268 }, { x0: 270, x1: 560, y: HYLDE }], plakat: { x: 1440, y: 90 }, bobleR: 128, partikler: 6 },
                opstilling: FORRUM
            },
            {
                navn: "bord", titel: "Prøvebordet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 250, x1: 880, y: HYLDE }], plakat: { x: 1440, y: 90 }, bobleR: 128, partikler: 6 },
                opstilling: BORD
            },
            {
                navn: "stinkskab", titel: "Stinkskabet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 16, x1: 220, y: 268 }, { x0: 400, x1: 700, y: HYLDE }], stinkskab: { x0: 340, x1: 1300, top: 92, aabning: 150 }, bobleR: 128, partikler: 6 },
                opstilling: STINKSKAB
            }
        ]
    };
}());

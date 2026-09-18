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
        { navn: "baegerA", type: "baegerStor", x: 420, titel: "det store bægerglas" },
        { navn: "baegerB", type: "baegerLille", x: 520, titel: "det lille bægerglas" },
        { navn: "maaleglas", type: "maaleglas", x: 600 },
        { navn: "kolbe", type: "kolbe", x: 700 },
        { navn: "fl_nacl", type: "flaske", x: 300, y: HYLDE, etiket: ["NaCl", "0,1 M"], titel: "flasken med NaCl", indhold: opl(200, { "Na+": 100, "Cl-": 100 }) },
        { navn: "fl_naoh", type: "flaske", x: 348, y: HYLDE, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(200, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_hcl", type: "flaske", x: 396, y: HYLDE, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(200, { "H+": 100, "Cl-": 100 }) },
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

    /* Kemikaliedepotet: to hylder med flasker og pulverglas paa raekke, og
       god plads paa bordet til at saette ting fra sig */
    var HYLDE2 = 210;
    function fl(navn, x, y, etiket, titel, mM) { return { navn: navn, type: "flaske", x: x, y: y, etiket: etiket, titel: titel, indhold: opl(200, mM) }; }
    var DEPOT = [
        { navn: "papir", type: "koekkenrulle", x: 176, y: 268 },
        fl("d_pb",   300, HYLDE2, ["Pb(NO₃)₂", "0,1 M"], "flasken med Pb(NO₃)₂", { "Pb2+": 100, "NO3-": 200 }),
        fl("d_ki",   360, HYLDE2, ["KI", "0,1 M"], "flasken med KI", { "K+": 100, "I-": 100 }),
        fl("d_cu",   420, HYLDE2, ["CuSO₄", "0,1 M"], "flasken med CuSO₄", { "Cu2+": 100, "SO42-": 100 }),
        fl("d_fe",   480, HYLDE2, ["Fe(NO₃)₃", "0,01 M"], "flasken med Fe(NO₃)₃", { "Fe3+": 10, "NO3-": 30 }),
        fl("d_scn",  540, HYLDE2, ["KSCN", "0,01 M"], "flasken med KSCN", { "K+": 10, "SCN-": 10 }),
        fl("d_nacl", 600, HYLDE2, ["NaCl", "0,1 M"], "flasken med NaCl", { "Na+": 100, "Cl-": 100 }),
        fl("d_ba",   660, HYLDE2, ["BaCl₂", "0,1 M"], "flasken med BaCl₂", { "Ba2+": 100, "Cl-": 200 }),
        fl("d_ag",   720, HYLDE2, ["AgNO₃", "0,1 M"], "flasken med AgNO₃", { "Ag+": 100, "NO3-": 100 }),
        fl("d_na2co3", 780, HYLDE2, ["Na₂CO₃", "0,1 M"], "flasken med Na₂CO₃", { "Na+": 200, "CO32-": 100 }),
        { navn: "d_phph", type: "draabeflaske", x: 860, y: HYLDE2, etiket: ["phenol-", "phthalein"], titel: "dråbeflasken med phenolphthalein", indhold: opl(60, { "phph": 30 }) },
        { navn: "d_btb",  type: "draabeflaske", x: 920, y: HYLDE2, etiket: ["bromthymol-", "blåt"], titel: "dråbeflasken med bromthymolblåt", indhold: opl(60, { "btb": 20 }) },
        { navn: "d_agd",  type: "draabeflaske", x: 980, y: HYLDE2, etiket: ["AgNO₃", "0,1 M"], titel: "dråbeflasken med AgNO₃", indhold: opl(60, { "Ag+": 100, "NO3-": 100 }) },
        fl("d_hcl1",  300, HYLDE, ["HCl", "0,1 M"], "flasken med 0,1 M HCl", { "H+": 100, "Cl-": 100 }),
        fl("d_hcl2",  360, HYLDE, ["HCl", "1 M"], "flasken med 1 M HCl", { "H+": 1000, "Cl-": 1000 }),
        fl("d_hcl3",  420, HYLDE, ["HCl", "konc. 12 M"], "flasken med koncentreret saltsyre", { "H+": 12000, "Cl-": 12000 }),
        fl("d_h2so4a", 480, HYLDE, ["H₂SO₄", "0,1 M"], "flasken med 0,1 M H₂SO₄", { "H+": 200, "SO42-": 100 }),
        fl("d_h2so4b", 540, HYLDE, ["H₂SO₄", "konc. 18 M"], "flasken med koncentreret svovlsyre", { "H2SO4": 18000 }),
        fl("d_hno3a", 600, HYLDE, ["HNO₃", "0,1 M"], "flasken med 0,1 M HNO₃", { "H+": 100, "NO3-": 100 }),
        fl("d_hno3b", 660, HYLDE, ["HNO₃", "konc. 14 M"], "flasken med koncentreret salpetersyre", { "HNO3": 14000 }),
        fl("d_hac",   720, HYLDE, ["CH₃COOH", "0,1 M"], "flasken med ethansyre", { "HAc": 100 }),
        fl("d_naoh1", 780, HYLDE, ["NaOH", "0,1 M"], "flasken med 0,1 M NaOH", { "Na+": 100, "OH-": 100 }),
        fl("d_naoh2", 840, HYLDE, ["NaOH", "2 M"], "flasken med 2 M NaOH", { "Na+": 2000, "OH-": 2000 }),
        pulver("p_nacl", 300, "NaCl", "pulverglasset med NaCl", "NaCl(s)"),
        pulver("p_cuso4", 350, "CuSO₄", "pulverglasset med CuSO₄", "CuSO4(s)"),
        pulver("p_na2co3", 400, "Na₂CO₃", "pulverglasset med Na₂CO₃", "Na2CO3(s)"),
        pulver("p_pb", 450, "Pb(NO₃)₂", "pulverglasset med Pb(NO₃)₂", "Pb(NO3)2(s)"),
        pulver("p_mg", 520, "Mg", "glasset med magnesium", "Mg(s)"),
        pulver("p_zn", 570, "Zn", "glasset med zink", "Zn(s)"),
        pulver("p_fe", 620, "Fe", "glasset med jern", "Fe(s)"),
        pulver("p_cu", 670, "Cu", "glasset med kobber", "Cu(s)"),
        { navn: "spatel", type: "spatel", p: { x: 720, y: 495, v: 0 } },
        { navn: "vand", type: "sproejteflaske", x: 1100, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },
        { navn: "baegerA", type: "baegerLille", x: 1200, titel: "det lille bægerglas" },
        { navn: "baegerB", type: "baegerStor", x: 1300, titel: "det store bægerglas" },
        { navn: "dunk", type: "affaldsdunk", x: 1500, etiket: ["AFFALD", "uorganisk"] }
    ];

    var BORD = [
        { navn: "dunk", type: "affaldsdunk", x: 66, etiket: ["AFFALD", "uorganisk"] },
        { navn: "baegerStor", type: "baegerStor", x: 170 },
        { navn: "vand", type: "sproejteflaske", x: 246, titel: "sprøjteflasken med vand", indhold: opl(500, {}) },
        pulver("pulver_nacl", 300, "NaCl", "pulverglasset med NaCl", "NaCl(s)"),
        pulver("pulver_cu", 344, "CuSO₄", "pulverglasset med CuSO₄", "CuSO4(s)"),
        pulver("pulver_na2co3", 388, "Na₂CO₃", "pulverglasset med Na₂CO₃", "Na2CO3(s)"),
        pulver("metal_mg", 432, "Mg", "glasset med magnesium", "Mg(s)"),
        pulver("metal_zn", 476, "Zn", "glasset med zink", "Zn(s)"),
        pulver("metal_fe", 520, "Fe", "glasset med jern", "Fe(s)"),
        { navn: "spatel", type: "spatel", p: { x: 570, y: 495, v: 0 } },
        { navn: "fl_pb",   type: "flaske", x: 280, y: HYLDE, etiket: ["Pb(NO₃)₂", "0,1 M"], titel: "flasken med Pb(NO₃)₂", indhold: opl(200, { "Pb2+": 100, "NO3-": 200 }) },
        { navn: "fl_ki",   type: "flaske", x: 328, y: HYLDE, etiket: ["KI", "0,1 M"], titel: "flasken med KI", indhold: opl(200, { "K+": 100, "I-": 100 }) },
        { navn: "fl_cu",   type: "flaske", x: 376, y: HYLDE, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(200, { "Cu2+": 100, "SO42-": 100 }) },
        { navn: "fl_fe",   type: "flaske", x: 424, y: HYLDE, etiket: ["Fe(NO₃)₃", "0,01 M"], titel: "flasken med Fe(NO₃)₃", indhold: opl(200, { "Fe3+": 10, "NO3-": 30 }) },
        { navn: "fl_scn",  type: "flaske", x: 472, y: HYLDE, etiket: ["KSCN", "0,01 M"], titel: "flasken med KSCN", indhold: opl(200, { "K+": 10, "SCN-": 10 }) },
        { navn: "fl_naoh", type: "flaske", x: 520, y: HYLDE, etiket: ["NaOH", "0,1 M"], titel: "flasken med NaOH", indhold: opl(200, { "Na+": 100, "OH-": 100 }) },
        { navn: "fl_hcl",  type: "flaske", x: 568, y: HYLDE, etiket: ["HCl", "0,1 M"], titel: "flasken med HCl", indhold: opl(200, { "H+": 100, "Cl-": 100 }) },
        { navn: "fl_hac",  type: "flaske", x: 616, y: HYLDE, etiket: ["CH₃COOH", "0,1 M"], titel: "flasken med ethansyre", indhold: opl(200, { "HAc": 100 }) },
        { navn: "fl_ba",   type: "flaske", x: 664, y: HYLDE, etiket: ["BaCl₂", "0,1 M"], titel: "flasken med BaCl₂", indhold: opl(200, { "Ba2+": 100, "Cl-": 200 }) },
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
        { navn: "baegerLille", type: "baegerLille", paa: "plade", x: 1510 }
    ];

    var STINKSKAB = [
        { navn: "luge", type: "luge", x: 120, til: "bord", skilt: "TIL PRØVEBORDET" },
        { navn: "baegerLille", type: "baegerLille", x: 400 },
        { navn: "baegerStor", type: "baegerStor", x: 490 },
        pulver("metal_cu", 580, "Cu", "glasset med kobber", "Cu(s)"),
        pulver("metal_mg", 624, "Mg", "glasset med magnesium", "Mg(s)"),
        pulver("metal_zn", 668, "Zn", "glasset med zink", "Zn(s)"),
        { navn: "spatel", type: "spatel", p: { x: 700, y: 495, v: 0 } },
        { navn: "fl_h2so4", type: "flaske", x: 420, y: HYLDE, etiket: ["H₂SO₄", "konc. 18 M"], titel: "flasken med koncentreret svovlsyre", indhold: opl(200, { "H2SO4": 18000 }) },
        { navn: "fl_hno3",  type: "flaske", x: 468, y: HYLDE, etiket: ["HNO₃", "konc. 14 M"], titel: "flasken med koncentreret salpetersyre", indhold: opl(200, { "HNO3": 14000 }) },
        { navn: "fl_hcl_k", type: "flaske", x: 516, y: HYLDE, etiket: ["HCl", "konc. 12 M"], titel: "flasken med koncentreret saltsyre", indhold: opl(200, { "H+": 12000, "Cl-": 12000 }) },
        { navn: "fl_naoh_k", type: "flaske", x: 564, y: HYLDE, etiket: ["NaOH", "2 M"], titel: "flasken med 2 M NaOH", indhold: opl(200, { "Na+": 2000, "OH-": 2000 }) },
        { navn: "fl_cu", type: "flaske", x: 612, y: HYLDE, etiket: ["CuSO₄", "0,1 M"], titel: "flasken med CuSO₄", indhold: opl(200, { "Cu2+": 100, "SO42-": 100 }) },
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
                navn: "depot", titel: "Kemikaliedepotet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 16, x1: 220, y: 268 }, { x0: 270, x1: 1030, y: HYLDE2 }, { x0: 270, x1: 1030, y: HYLDE }], plakat: { x: 1440, y: 90 }, bobleR: 128, partikler: 6 },
                opstilling: DEPOT
            },
            {
                navn: "bord", titel: "Prøvebordet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 250, x1: 880, y: HYLDE }], plakat: { x: 1440, y: 90 }, bobleR: 128, partikler: 6 },
                opstilling: BORD
            },
            {
                navn: "stinkskab", titel: "Stinkskabet",
                valg: { bredde: BREDDE, hoejde: 600, bord: 500, hylder: [{ x0: 16, x1: 220, y: 268 }, { x0: 400, x1: 700, y: HYLDE }], stinkskab: { x0: 340, x1: 1300, top: 92, rude: false }, bobleR: 128, partikler: 6 },
                opstilling: STINKSKAB
            }
        ]
    };
}());

/* =====================================================================
   fig_redox.js - figuren til 8.1 Redoxreaktioner

   Øverst bogens delreaktioner: 2 Mg + O₂ → 2 Mg²⁺ + 2 O²⁻ med den orange
   klamme over (magnesium afgiver 4 elektroner) og den blaa under (oxygen
   optager 4 elektroner). Bogens "oxidation:" og "reduktion:" foran
   teksterne er taget af, saa de ikke afsloerer pladserne.
   Nederst til venstre de to delreaktioner fra afsnittet uden navnene
   foran, til hoejre luppen fra mg-trin-2: to magnesiumatomer, der hver
   afgiver 2 elektroner til et oxygenatom.
   Seks fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var ORANGE = "#b4530a", BLAA = "#1d4ed8";
    var KA = { x: 230, y: 50, b: 740, h: 252 };                   /* kortet med reaktionen */
    var EQ = 184, FS = 38;
    var X = { m1: 318, p1: 392, o2: 456, pilA: 514, pilB: 614, m2: 708, p2: 796, o3: 872 };
    var KB = { x: 40, y: 345, b: 540, h: 320 };                   /* delreaktionerne */
    var KC = { x: 620, y: 345, b: 540, h: 320 };                  /* luppen */
    var LUP = { x: 1018, y: 512, r: 128 };
    var MG = [[985, 600], [1057, 600]], MG_R = 33;
    var O = [[976, 440], [1066, 440]], O_R = 26;
    var D1 = 440, D2 = 515;                                       /* delreaktionernes linjer */

    function spids(g, x, y, ret, farve) {
        /* En pilespids i (x, y), der peger op (ret = -1) eller ned (ret = 1) */
        SV.el("polygon", { points: x + "," + y + " " + (x - 6.5) + "," + (y - ret * 12) + " " + (x + 6.5) + "," + (y - ret * 12), fill: farve }, g);
    }

    NK.FIGURER.redox = {
        vb: [1200, 690],
        lag: [
            { navn: "Reaktionen", pladser: ["redoxreaktion", "oxidation", "reduktion"],
              ros: "Magnesium afgiver elektroner og oxideres. Oxygen optager dem og reduceres. Tilsammen er det en redoxreaktion." },
            { navn: "Hvert stof for sig", pladser: ["delreaktion", "reduktionsmiddel", "oxidationsmiddel"],
              ros: "Delreaktionerne viser hvert stof for sig. Magnesium er reduktionsmidlet, og dioxygen er oxidationsmidlet." }
        ],
        pladser: [
            { id: "redoxreaktion", ord: ["redoxreaktion"], x: KA.x + KA.b / 2, y: KA.y, maal: [KA.x + KA.b / 2, KA.y], titel: true, dele: ["ligning"],
              omr: [{ r: [KA.x - 5, KA.y - 5, KA.b + 10, KA.h + 10, 18], tom: true }],
              fejl: { oxidation: "<b>oxidation</b> er kun den ene halvdel, at afgive elektroner. Overskriften gælder hele reaktionen.",
                      reduktion: "<b>reduktion</b> er kun den ene halvdel, at optage elektroner. Overskriften gælder hele reaktionen.",
                      delreaktion: "<b>delreaktion</b> viser kun det ene stof. Skemaet her viser begge stoffer på én gang." } },
            { id: "oxidation", ord: ["oxidation"], x: 1088, y: 100, maal: [662, 101], dele: ["oxi"],
              omr: [{ r: [X.m1 - 12, 84, X.m2 - X.m1 + 24, 70, 8] }],
              fejl: { reduktion: "<b>reduktion</b> er at optage elektroner. Den orange klamme viser, at magnesium afgiver elektroner.",
                      redoxreaktion: "<b>redoxreaktion</b> er hele reaktionen. Pladsen peger kun på det, der sker med magnesium.",
                      reduktionsmiddel: "<b>reduktionsmiddel</b> er navnet på et stof. Pladsen er navnet på det, der sker: at afgive elektroner." } },
            { id: "reduktion", ord: ["reduktion"], x: 1088, y: 256, maal: [790, 252], dele: ["red"],
              omr: [{ r: [X.o2 - 12, 194, X.o3 - X.o2 + 24, 76, 8] }],
              fejl: { oxidation: "<b>oxidation</b> er at afgive elektroner. Den blå klamme viser, at oxygen optager elektroner.",
                      redoxreaktion: "<b>redoxreaktion</b> er hele reaktionen. Pladsen peger kun på det, der sker med oxygen.",
                      oxidationsmiddel: "<b>oxidationsmiddel</b> er navnet på et stof. Pladsen er navnet på det, der sker: at optage elektroner." } },

            { id: "delreaktion", ord: ["delreaktion"], x: KB.x + KB.b / 2, y: 612, maal: [KB.x + KB.b / 2, D2 + 16], dele: ["delr"],
              omr: [{ r: [KB.x + 60, D1 - 34, KB.b - 120, 46, 8] }, { r: [KB.x + 60, D2 - 34, KB.b - 120, 46, 8] }],
              fejl: { redoxreaktion: "<b>redoxreaktion</b> viser begge stoffer. Skemaerne her viser hvert stof for sig med e⁻.",
                      oxidation: "<b>oxidation</b> er det, der sker i det øverste skema. Pladsen er navnet på sådan et skema.",
                      reduktion: "<b>reduktion</b> er det, der sker i det nederste skema. Pladsen er navnet på sådan et skema." } },
            { id: "reduktionsmiddel", ord: ["reduktionsmiddel"], x: 752, y: 600, maal: [MG[0][0] - MG_R - 2, MG[0][1]], dele: ["mg"],
              omr: [{ r: [MG[0][0] - MG_R - 6, MG[0][1] - MG_R - 6, MG[1][0] - MG[0][0] + 2 * MG_R + 12, 2 * MG_R + 12, 10] }],
              fejl: { oxidationsmiddel: "<b>oxidationsmiddel</b> optager elektroner. Magnesiumatomerne her afgiver deres elektroner.",
                      oxidation: "<b>oxidation</b> er det, der sker med magnesium. Pladsen er navnet på selve stoffet, der afgiver elektroner.",
                      delreaktion: "<b>delreaktion</b> er et skema med e⁻. Pladsen peger på atomerne, der afgiver elektroner." } },
            { id: "oxidationsmiddel", ord: ["oxidationsmiddel"], x: 752, y: 440, maal: [O[0][0] - O_R - 2, O[0][1]], dele: ["o"],
              omr: [{ r: [O[0][0] - O_R - 6, O[0][1] - O_R - 6, O[1][0] - O[0][0] + 2 * O_R + 12, 2 * O_R + 12, 10] }],
              fejl: { reduktionsmiddel: "<b>reduktionsmiddel</b> afgiver elektroner. Oxygenatomerne her optager elektroner.",
                      reduktion: "<b>reduktion</b> er det, der sker med oxygen. Pladsen er navnet på selve stoffet, der optager elektroner.",
                      delreaktion: "<b>delreaktion</b> er et skema med e⁻. Pladsen peger på atomerne, der optager elektroner." } }
        ],

        tegn: function (api) {
            /* Prikkerne ved klammerne sidder lige efter teksten, som foerst kan maales nu */
            var bo = NK.tekstBredde("magnesium afgiver 4 elektroner", 18, 700), br = NK.tekstBredde("oxygen optager 4 elektroner", 18, 700);
            this.pladser.forEach(function (p) {
                if (p.id === "oxidation") { p.maal = [(X.m1 + X.m2) / 2 + bo / 2 + 9, 101]; p.omr[0].r[2] = Math.max(p.omr[0].r[2], p.maal[0] - p.omr[0].r[0] + 6); }
                if (p.id === "reduktion") { p.maal = [(X.o2 + X.o3) / 2 + br / 2 + 9, 252]; p.omr[0].r[2] = Math.max(p.omr[0].r[2], p.maal[0] - p.omr[0].r[0] + 6); }
            });

            /* Luppens kant, som atomerne klippes til (altid til stede) */
            api.fast(function (g) {
                var kp = SV.el("clipPath", { id: "sc87-lup" }, SV.el("defs", {}, g));
                SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r - 2 }, kp);
            });

            /* ----- Lag 1: reaktionen og klammerne ------------------------------- */
            api.del("ligning", {
                lag: 0,
                fuld: function (g) {
                    LAB.kort(g, KA.x, KA.y, KA.b, KA.h);
                    var gg = SV.g(g), o = { "font-size": FS, "font-weight": 700 };
                    SV.tekst(gg, X.m1, EQ, "2 Mg", o);
                    SV.tekst(gg, X.p1, EQ, "+", { "font-size": 30, fill: F.svag });
                    SV.tekst(gg, X.o2, EQ, "O_2", o);
                    SV.el("line", { x1: X.pilA, y1: EQ - 12, x2: X.pilB - 14, y2: EQ - 12, stroke: F.tekst, "stroke-width": 3.2 }, gg);
                    SV.el("polygon", { points: X.pilB + "," + (EQ - 12) + " " + (X.pilB - 16) + "," + (EQ - 20) + " " + (X.pilB - 16) + "," + (EQ - 4), fill: F.tekst }, gg);
                    SV.tekst(gg, X.m2, EQ, "2 Mg^{2+}", o);
                    SV.tekst(gg, X.p2, EQ, "+", { "font-size": 30, fill: F.svag });
                    SV.tekst(gg, X.o3, EQ, "2 O^{2−}", o);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            api.del("oxi", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    var s = SV.el("path", { d: "M" + X.m1 + "," + (EQ - 40) + " V120 H" + X.m2 + " V" + (EQ - 50), fill: "none", stroke: ORANGE, "stroke-width": 2.6 }, gg);
                    spids(gg, X.m2, EQ - 38, 1, ORANGE);
                    SV.tekst(gg, (X.m1 + X.m2) / 2, 107, "magnesium afgiver 4 elektroner", { "font-size": 18, "font-weight": 700, fill: ORANGE });
                    return { s: s, g: gg };
                },
                byg: function (g, r, an) { an.streg(r.s, 0, 600); an.fade(r.g, 0, 500); }
            });

            api.del("red", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    var s = SV.el("path", { d: "M" + X.o2 + "," + (EQ + 12) + " V226 H" + X.o3 + " V" + (EQ + 22), fill: "none", stroke: BLAA, "stroke-width": 2.6 }, gg);
                    spids(gg, X.o3, EQ + 10, -1, BLAA);
                    SV.tekst(gg, (X.o2 + X.o3) / 2, 258, "oxygen optager 4 elektroner", { "font-size": 18, "font-weight": 700, fill: BLAA });
                    return { s: s, g: gg };
                },
                byg: function (g, r, an) { an.streg(r.s, 0, 600); an.fade(r.g, 0, 500); }
            });

            /* ----- Lag 2: delreaktionerne og luppen ------------------------------- */
            api.del("delr", {
                lag: 1,
                fuld: function (g) {
                    LAB.kort(g, KB.x, KB.y, KB.b, KB.h);
                    var gg = SV.g(g), cx = KB.x + KB.b / 2;
                    SV.tekst(gg, cx, D1, "Mg  →  Mg^{2+} + 2 e^−", { "font-size": 31, "font-weight": 700 });
                    SV.tekst(gg, cx, D2, "O_2 + 4 e^−  →  2 O^{2−}", { "font-size": 31, "font-weight": 700 });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            api.del("lup", {
                lag: 1, auto: true,
                fuld: function (g) {
                    LAB.kort(g, KC.x, KC.y, KC.b, KC.h);
                    SV.tekst(g, KC.x + 22, KC.y + 36, "Mens magnesium brænder", { "font-size": 16, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: "url(#lup)", stroke: "#b7c3cf", "stroke-width": 4, filter: "url(#skygge)" }, g);
                    var inde = SV.g(g, { "clip-path": "url(#sc87-lup)" });
                    /* Metallets overflade: flere atomer ude til siden og under */
                    [[1129, 600], [1021, 662], [949, 662], [1093, 662]].forEach(function (p) { SV.kugle(inde, p[0], p[1], MG_R, "neutron"); });
                    /* Elektronerne i buer fra hvert magnesiumatom op til et oxygenatom */
                    [[-1, MG[0], O[0]], [1, MG[1], O[1]]].forEach(function (b) {
                        var s = b[0], m = b[1], o = b[2];
                        var x1 = m[0] + s * 10, y1 = m[1] - MG_R + 2, x2 = o[0] + s * 14, y2 = o[1] + O_R - 2, cx = m[0] + s * 62;
                        SV.el("path", { d: "M" + x1 + "," + y1 + " Q" + cx + "," + ((y1 + y2) / 2 + 10) + " " + x2 + "," + (y2 + 10), fill: "none", stroke: "#1d4aa0", "stroke-width": 2.4 }, inde);
                        SV.el("polygon", { points: x2 + "," + (y2 + 1) + " " + (x2 - 6) + "," + (y2 + 13) + " " + (x2 + 6) + "," + (y2 + 13), fill: "#1d4aa0" }, inde);
                        var ex = m[0] + s * 44;
                        SV.kugle(inde, ex, (y1 + y2) / 2 - 2, 8, "elektron", "−");
                        SV.kugle(inde, ex - s * 2, (y1 + y2) / 2 + 17, 8, "elektron", "−");
                        SV.tekst(inde, m[0] + s * 4, (y1 + y2) / 2 + 12, "2 e^−", { "font-size": 19, "font-weight": 700, fill: "#1d4aa0" });
                    });
                    return {};
                }
            });

            api.del("mg", {
                lag: 1,
                fuld: function (g) {
                    var inde = SV.g(g, { "clip-path": "url(#sc87-lup)" });
                    return { a: SV.kugle(inde, MG[0][0], MG[0][1], MG_R, "neutron", "Mg"), b: SV.kugle(inde, MG[1][0], MG[1][1], MG_R, "neutron", "Mg") };
                },
                byg: function (g, r, an) { an.blink(r.a, 0); an.blink(r.b, 150); }
            });

            api.del("o", {
                lag: 1,
                fuld: function (g) {
                    return { a: SV.kugle(g, O[0][0], O[0][1], O_R, "O", "O"), b: SV.kugle(g, O[1][0], O[1][1], O_R, "O", "O") };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 450); an.pop(r.b, 150, 450); }
            });
        }
    };
}());

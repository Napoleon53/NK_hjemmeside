/* =====================================================================
   fig_kiral.js - figuren til B8.2 Kiralitet

   Foroven til venstre ibuprofen som i bogens b8-kiral-ibuprofen. kiral
   peger paa hele molekylet, og parret kiralt center eller asymmetrisk
   carbonatom (B3.4) peger paa carbonatomet med de fire forskellige
   grupper. Stjernen kommer først, naar parret sidder, for bogen siger,
   at et asymmetrisk carbonatom mærkes med en stjerne.
   Til hoejre de to former af ibuprofen med kiler paa hver sin side af
   et spejl. Parret spejlbilledformer eller spejlbilledisomerer (B3.4)
   peger paa rammen om begge former. Bogens tekster "den ene/anden
   spejlbilledform" og "spejl" er taget af.
   Forneden et bægerglas med lige mange molekyler af de to former
   (groenne og orange som rammerne om formerne); racemisk blanding er
   titlen paa kortet.
   Fire fagord og to ord fra B3 i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var LAB = NK.LAB;
    var B8 = NK.B8;
    var F = ORG.F;

    var GROEN = "#0f766e", ORANGE = "#c2620f";

    /* ----- Lag 1: ibuprofen -------------------------------------------- */
    var KA = { x: 16, y: 78, b: 628, h: 252 };
    var IBU = B8.ibuprofen(330, 200, { L: 36 });
    var CX = IBU.p("Cx");
    var HELT = B8.helt(IBU, [16, 18]);

    /* ----- Lag 2: de to former og blandingen ------------------------------ */
    var KB = { x: 250, y: 356, b: 660, h: 232 };
    var SP = KB.x + KB.b / 2;                                  /* spejlet */
    var FORM = [{ cx: SP - 124, ramme: [SP - 214, 396, 190, 156], farve: GROEN, lys: "rgba(15,118,110,0.07)" },
                { cx: SP + 124, ramme: [SP + 24, 396, 190, 156], farve: ORANGE, lys: "rgba(194,98,15,0.07)" }];
    var FY = 484;
    var BEGGE = [SP - 222, 388, 444, 172];
    var KC = { x: 660, y: 78, b: 484, h: 252 };
    var GLAS = { cx: KC.x + 126, bund: KC.y + KC.h - 16, b: 170, h: 150 };
    var VTOP = GLAS.bund - 106;

    /* En form tegnet med kiler: H op, CH3 ned til venstre, Ar bagud og COOH
       frem (bogens b8-kiral-ibuprofen); spejl = -1 er spejlbilledet */
    function form(g, cx, cy, spejl, s, farve, etiketter) {
        s = s || 1;
        var gg = SV.g(g);
        var H = [cx, cy - 46 * s], M = [cx - spejl * 40 * s, cy + 22 * s], Ar = [cx + spejl * 44 * s, cy - 4 * s], CO = [cx + spejl * 22 * s, cy + 42 * s];
        if (etiketter) {
            var at = [[cx, cy, "C"], [H[0], H[1], "H"],
                      [M[0], M[1], spejl > 0 ? "H_3C" : "CH_3", { anker: spejl > 0 ? "end" : "start" }],
                      [Ar[0], Ar[1], "Ar", { anker: spejl > 0 ? "start" : "end" }],
                      [CO[0], CO[1] + 8, spejl > 0 ? "COOH" : "HOOC", { anker: spejl > 0 ? "start" : "end" }]];
            ORG.skelet(gg, at, [[0, 1], [0, 2], [0, 3, "stribe"], [0, 4, "kile"]], { fs: 21 });
        } else {
            var st = { stroke: farve, "stroke-width": 2.2, "stroke-linecap": "round" };
            SV.el("line", Object.assign({ x1: cx, y1: cy, x2: H[0], y2: H[1] }, st), gg);
            SV.el("line", Object.assign({ x1: cx, y1: cy, x2: M[0], y2: M[1] }, st), gg);
            ORG.kile(gg, cx, cy, Ar[0], Ar[1], false, farve, 7);
            ORG.kile(gg, cx, cy, CO[0], CO[1], true, farve, 7);
            SV.el("circle", { cx: cx, cy: cy, r: 3.2, fill: farve }, gg);
            SV.el("circle", { cx: H[0], cy: H[1], r: 3, fill: "#ffffff", stroke: farve, "stroke-width": 1.6 }, gg);
        }
        return gg;
    }

    /* Molekylerne i glasset (spejl skifter fra det ene til det andet) */
    var KORN = [[-52, -62], [-14, -70], [30, -60], [58, -74], [-40, -26], [2, -34], [44, -22], [-58, 6], [-20, 0], [20, 8], [54, 18], [-2, 34]];

    var KIRAL_FEJL = {
        kiral: "<b>kiral</b> siges om hele molekylet. Pladsen peger på ét carbonatom med fire forskellige grupper.",
        spejlbilledformer: "<b>spejlbilledformer</b> er to hele molekyler. Pladsen peger på ét carbonatom i ibuprofen.",
        spejlbilledisomerer: "<b>spejlbilledisomerer</b> er to hele molekyler. Pladsen peger på ét carbonatom i ibuprofen."
    };
    var FORM_FEJL = {
        "racemisk blanding": "<b>racemisk blanding</b> er lige meget af to former i ét glas. Pladsen peger på de to former, der er tegnet hver for sig.",
        kiral: "<b>kiral</b> siges om ét molekyle. Pladsen peger på to udgaver af ibuprofen på hver sin side af en spejlflade.",
        "kiralt center": "<b>kiralt center</b> er ét carbonatom. Pladsen peger på to hele molekyler.",
        "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er ét carbonatom. Pladsen peger på to hele molekyler."
    };

    NK.FIGURER.kiral = {
        vb: [1160, 660],
        lag: [
            { navn: "Ibuprofen", pladser: ["kiral", "kiralt center", "asymmetrisk carbonatom"],
              ros: "Ibuprofen er kiral, fordi ét carbonatom har fire forskellige grupper. Det er molekylets kirale center." },
            { navn: "To former", pladser: ["spejlbilledformer", "spejlbilledisomerer", "racemisk blanding"],
              ros: "De to spejlbilledformer er hinandens spejlbilleder. En racemisk blanding har lige meget af hver form." }
        ],
        pladser: [
            { id: "kiral", ord: ["kiral"], x: 176, y: KA.y + KA.h - 30, maal: [HELT[0] + 14, HELT[1] + HELT[3]], dele: ["helt"],
              omr: [{ r: [HELT[0], HELT[1], HELT[2], HELT[3], 16] }],
              fejl: { "kiralt center": "<b>kiralt center</b> er ét carbonatom. Pladsen siger noget om hele molekylet, som ikke kan dække sit spejlbillede.",
                      "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er ét carbonatom. Pladsen siger noget om hele molekylet ibuprofen.",
                      "racemisk blanding": "<b>racemisk blanding</b> er en blanding af to former. Pladsen siger noget om ét molekyle ibuprofen.",
                      spejlbilledformer: "<b>spejlbilledformer</b> er to udgaver af molekylet. Pladsen siger noget om ét molekyle ibuprofen." } },
            { id: "kiralt center", ord: ["kiralt center", "asymmetrisk carbonatom"], par: "asymmetrisk carbonatom", x: 330, y: 40, maal: [CX[0] - 6, CX[1] - 4], dele: ["stjerne"],
              omr: [{ c: [CX[0], CX[1], 17] }], fejl: KIRAL_FEJL },
            { id: "asymmetrisk carbonatom", ord: ["kiralt center", "asymmetrisk carbonatom"], x: 330, y: 40, maal: [CX[0] - 6, CX[1] - 4], dele: ["stjerne"],
              omr: [{ c: [CX[0], CX[1], 17] }], fejl: KIRAL_FEJL },

            { id: "spejlbilledformer", ord: ["spejlbilledformer", "spejlbilledisomerer"], par: "spejlbilledisomerer", x: SP, y: 624, maal: [SP, BEGGE[1] + BEGGE[3]], dele: ["former"],
              omr: [{ r: [BEGGE[0], BEGGE[1], BEGGE[2], BEGGE[3], 16], tom: true }], fejl: FORM_FEJL },
            { id: "spejlbilledisomerer", ord: ["spejlbilledformer", "spejlbilledisomerer"], x: SP, y: 624, maal: [SP, BEGGE[1] + BEGGE[3]], dele: ["former"],
              omr: [{ r: [BEGGE[0], BEGGE[1], BEGGE[2], BEGGE[3], 16], tom: true }], fejl: FORM_FEJL },
            { id: "racemisk blanding", ord: ["racemisk blanding"], x: KC.x + KC.b / 2, y: KC.y, maal: [KC.x + KC.b / 2, KC.y], titel: true, dele: ["blanding"],
              omr: [{ r: [KC.x - 4, KC.y - 4, KC.b + 8, KC.h + 8, 18], tom: true }],
              fejl: { spejlbilledformer: "<b>spejlbilledformer</b> er de to former hver for sig. Kortet viser et glas med lige meget af hver form.",
                      spejlbilledisomerer: "<b>spejlbilledisomerer</b> er de to former hver for sig. Kortet viser et glas med lige meget af hver form.",
                      kiral: "<b>kiral</b> siges om ét molekyle. Kortet viser et glas med to slags molekyler." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KA.x, KA.y, KA.b, KA.h);
                    ORG.navn(g, KA.x + KA.b - 96, KA.y + KA.h - 26, "ibuprofen");
                }
            });
            api.del("helt", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.boks(gg, HELT[0], HELT[1], HELT[2], HELT[3], { rx: 16, op: 0.08 });
                    B8.tegnMol(gg, IBU, { fs: 20 });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            /* Stjernen staar ikke i den graa udgave: den ville afsloere pladsen */
            api.del("stjerne", {
                lag: 0,
                fuld: function (g) {
                    if (g.getAttribute("class") === "spoeg") return {};
                    var gg = SV.g(g);
                    SV.el("circle", { cx: CX[0], cy: CX[1], r: 15, fill: "url(#b8-gloed)" }, gg);
                    ORG.t(gg, CX[0] + 13, CX[1] - 4, "*", { fs: 26, fed: true, farve: F.pos });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KB.x, KB.y, KB.b, KB.h);
                    ORG.kortB(g, KC.x, KC.y, KC.b, KC.h);
                    /* spejlet */
                    SV.el("rect", { x: SP - 5, y: 404, width: 10, height: 144, rx: 5, fill: "url(#glas)", stroke: "#9fb0c0", "stroke-width": 1.4 }, g);
                    ORG.t(g, SP, KB.y + 26, "Ar står for benzenringen med resten af molekylet.", { fs: 13, farve: F.daempet });
                    LAB.baeger(g, GLAS.cx, GLAS.bund, GLAS.b, GLAS.h, { top: VTOP, fyld: "#e4eff8" });
                    ORG.t(g, KC.x + 360, KC.y + 62, "ibuprofen lavet i laboratoriet", { fs: 14, farve: F.daempet });
                }
            });
            api.del("former", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FORM.forEach(function (f, i) {
                        SV.el("rect", { x: f.ramme[0], y: f.ramme[1], width: f.ramme[2], height: f.ramme[3], rx: 14, fill: f.lys, stroke: f.farve, "stroke-width": 2 }, gg);
                        form(gg, f.cx, FY, i === 0 ? 1 : -1, 1, null, true);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("blanding", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KORN.forEach(function (k, i) {
                        form(gg, GLAS.cx + k[0], GLAS.bund - 40 + k[1] * 0.85 + 8, i % 2 ? -1 : 1, 0.34, i % 2 ? ORANGE : GROEN);
                    });
                    [[GROEN, 1], [ORANGE, -1]].forEach(function (f, i) {
                        var y = KC.y + 116 + i * 64;
                        SV.el("rect", { x: KC.x + 286, y: y - 26, width: 52, height: 52, rx: 10, fill: i ? "rgba(194,98,15,0.07)" : "rgba(15,118,110,0.07)", stroke: f[0], "stroke-width": 1.6 }, gg);
                        form(gg, KC.x + 312, y + 2, f[1], 0.42, f[0]);
                        ORG.t(gg, KC.x + 356, y + 8, "50 %", { fs: 22, fed: true, farve: f[0], anker: "start" });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

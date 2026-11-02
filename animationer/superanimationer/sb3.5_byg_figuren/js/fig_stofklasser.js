/* =====================================================================
   fig_stofklasser.js - figuren til B3.1 Alkoholer og carboxylsyrer

   Foroven bogens b3-alkohol-og-syre: propan, propan-1-ol og propansyre
   som zigzagformler i hvert sit kort, med den funktionelle gruppe i
   groent. Under kortene to raekker som i bogens tabel: den funktionelle
   gruppe (ingen, −OH, −COOH) og stofklassen (alkan, alkohol,
   carboxylsyre). Raekkernes overskrifter er pladser, og ordene i
   raekkerne er graa skilte, fordi de er fra kemi C.
   Forneden to kort: ethansyre som strukturformel og zigzagformel (bogens
   b3-laes-zigzag) og propanon med C=O.
   Fem af afsnittets seks fagord i to lag. R er taget ud paa brugerens
   oenske 2. nov. 2026 (se NK.UDELADT i data.js); kortet med ethanol over
   R−OH er fjernet med det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var HX = 125, RX = 245, RE = 1055;                    /* overskrifterne og raekkerne */
    var KX = [375, 650, 925], KB = 250, KY = 20, KH = 210;
    var RA = 268, RB = 318;                               /* raekkerne */
    var L = 40;
    var NAVN_Y = KY + 30, MY = KY + 118;

    /* Molekylerne foroven */
    var PROPAN = ORG.zz(KX[0] - L * 0.866, MY + 7, 3, L, -30);
    var OL = ORG.zz(KX[1] - L * 0.866 * 1.7, MY + 10, 4, L, -30);       /* tre C og O */
    var SYRE = ORG.zz(KX[2] - L * 0.866 * 1.5, MY - 4, 3, L, 30);
    var SYRE_O = ORG.fra(SYRE[2], L, -90), SYRE_OH = ORG.fra(SYRE[2], L, 30);

    /* Forneden: kortene og molekylerne */
    var KA = { x: 20, y: 372, b: 640, h: 326 }, KC = { x: 680, y: 372, b: 400, h: 326 };
    var UP1 = { x: 40, y: 412, b: 290, h: 228 }, UP2 = { x: 350, y: 412, b: 290, h: 228 };
    var EZ = ORG.zz(UP2.x + UP2.b / 2 - 30, 548, 2, L, -30);            /* ethansyre: C og C */
    var EZ_O = ORG.fra(EZ[1], L, -90), EZ_OH = ORG.fra(EZ[1], L, 30);
    var PL = 46, PCX = KC.x + KC.b / 2, PCY = 492;                       /* propanon */
    var PRO = [[PCX - PL * 0.866, PCY - PL / 2], [PCX, PCY], [PCX + PL * 0.866, PCY - PL / 2]];
    var PRO_O = [PCX, PCY + PL];

    function grupper() {
        var w = NK.tekstBredde("OH", 20, 700), wO = NK.tekstBredde("O", 20, 700);
        return {
            oh: [OL[3][0] - wO / 2 - 7, OL[3][1] - 17, w + 14, 34],
            cooh: [SYRE[2][0] - 16, SYRE_O[1] - 17, SYRE_OH[0] + w - wO / 2 - SYRE[2][0] + 23, SYRE_OH[1] - SYRE_O[1] + 34]
        };
    }

    NK.FIGURER.stofklasser = {
        vb: [1100, 720],
        lag: [
            { navn: "Stofklasserne", pladser: ["carbonhydrid", "funktionel gruppe", "stofklasse"],
              ros: "Propan er et carbonhydrid. En funktionel gruppe som −OH eller −COOH bestemmer stoffets stofklasse." },
            { navn: "Formlerne", pladser: ["zigzagformel", "carbonylgruppe"],
              ros: "I zigzagformlen er hvert knæk og hver ende et carbonatom. C=O i propanon er en carbonylgruppe." }
        ],
        pladser: [
            { id: "carbonhydrid", ord: ["carbonhydrid"], x: KX[0], y: KY + KH - 30, maal: [KX[0], MY + 20], dele: ["propan"],
              omr: [{ r: [PROPAN[0][0] - 16, PROPAN[1][1] - 16, PROPAN[2][0] - PROPAN[0][0] + 32, PROPAN[0][1] - PROPAN[1][1] + 32, 12] }],
              fejl: { stofklasse: "<b>stofklasse</b> er en familie af stoffer og står foran rækken. Pladsen peger på propan, som kun har C og H.",
                      "funktionel gruppe": "<b>funktionel gruppe</b> er nogle få atomer som −OH. Propan har ingen, og pladsen peger på hele molekylet.",
                      zigzagformel: "<b>zigzagformel</b> er navnet på en tegnemåde. Pladsen spørger, hvad slags stof propan er." } },
            { id: "funktionel gruppe", ord: ["funktionel gruppe"], x: HX, y: RA, maal: [RX, RA], titel: true, dele: ["raekkeA"],
              omr: [{ r: [RX, RA - 22, RE - RX, 44, 12], tom: true }],
              fejl: { stofklasse: "<b>stofklasse</b> er navnet på en familie som alkohol. Rækken her viser de få atomer, der giver stoffet dets egenskaber.",
                      carbonhydrid: "<b>carbonhydrid</b> er et stof med kun C og H. Rækken viser atomgrupper som −OH og −COOH.",
                      carbonylgruppe: "<b>carbonylgruppe</b> er kun C=O. Overskriften gælder både −OH og −COOH i rækken." } },
            { id: "stofklasse", ord: ["stofklasse"], x: HX, y: RB, maal: [RX, RB], titel: true, dele: ["raekkeB"],
              omr: [{ r: [RX, RB - 22, RE - RX, 44, 12], tom: true }],
              fejl: { "funktionel gruppe": "<b>funktionel gruppe</b> er de få atomer som −OH. Rækken her er navne på hele familier af stoffer.",
                      carbonhydrid: "<b>carbonhydrid</b> passer kun på alkan. Overskriften gælder også alkohol og carboxylsyre i rækken." } },

            { id: "zigzagformel", ord: ["zigzagformel"], x: UP2.x + UP2.b / 2, y: UP2.y + UP2.h, maal: [UP2.x + UP2.b / 2, UP2.y + UP2.h], titel: true, dele: ["zigzag"],
              omr: [{ r: [UP2.x - 5, UP2.y - 5, UP2.b + 10, UP2.h + 10, 16], tom: true }],
              fejl: { carbonylgruppe: "<b>carbonylgruppe</b> er kun C=O. Skiltet er navnet på hele tegningen, hvor knæk og ender er carbonatomer.",
                      "funktionel gruppe": "<b>funktionel gruppe</b> er de få atomer som −COOH. Skiltet er navnet på hele tegningen.",
                      carbonhydrid: "<b>carbonhydrid</b> er et stof med kun C og H. Ethansyre har også O, og skiltet er navnet på tegnemåden." } },
            { id: "carbonylgruppe", ord: ["carbonylgruppe"], x: KC.x + KC.b / 2, y: KC.y + KC.h - 40, maal: [PRO_O[0], PRO_O[1] + 16], dele: ["co"],
              omr: [{ r: [PRO[1][0] - 17, PRO[1][1] - 12, 34, PRO_O[1] - PRO[1][1] + 28, 12] }],
              fejl: { "funktionel gruppe": "<b>funktionel gruppe</b> passer på mange grupper og står foran rækken. Her er navnet på netop C=O.",
                      zigzagformel: "<b>zigzagformel</b> er hele tegningen. Pladsen peger kun på C=O i propanon.",
                      carbonhydrid: "<b>carbonhydrid</b> er et stof med kun C og H. Pladsen peger på C=O i propanon." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var B = ORG.bredde(["funktionel gruppe", "carbonylgruppe", "zigzagformel", "carbonhydrid", "stofklasse", "carboxylsyre"]);
            var G = grupper();

            /* ----- Det, der staar der fra start: kortene med navne -------------- */
            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var navne = [["propan", "C_3H_8"], ["propan-1-ol", "C_3H_8O"], ["propansyre", "C_3H_6O_2"]];
                    KX.forEach(function (x, i) {
                        ORG.kortB(g, x - KB / 2, KY, KB, KH);
                        ORG.t(g, x, NAVN_Y, navne[i][0], { fs: 18, fed: true });
                        ORG.t(g, x, NAVN_Y + 21, navne[i][1], { fs: 14.5, farve: F.daempet });
                    });
                    /* propan-1-ol og propansyre (propan er en del for sig) */
                    ORG.skelet(g, [[OL[0][0], OL[0][1]], [OL[1][0], OL[1][1]], [OL[2][0], OL[2][1]], [OL[3][0], OL[3][1], "OH", { anker: "start", farve: F.accent }]],
                        [[0, 1], [1, 2], [2, 3, 1, 0, F.accent]]);
                    ORG.skelet(g, [[SYRE[0][0], SYRE[0][1]], [SYRE[1][0], SYRE[1][1]], [SYRE[2][0], SYRE[2][1]],
                        [SYRE_O[0], SYRE_O[1], "O", { farve: F.accent }], [SYRE_OH[0], SYRE_OH[1], "OH", { anker: "start", farve: F.accent }]],
                        [[0, 1], [1, 2], [2, 3, 2, 0, F.accent], [2, 4, 1, 0, F.accent]]);
                }
            });

            /* ----- Lag 1 ---------------------------------------------------------- */
            api.del("propan", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: PROPAN[0][0] - 16, y: PROPAN[1][1] - 16, width: PROPAN[2][0] - PROPAN[0][0] + 32, height: PROPAN[0][1] - PROPAN[1][1] + 32,
                        rx: 12, fill: "#eef2f7", stroke: "#9fb0c2", "stroke-width": 1.4 }, gg);
                    ORG.skelet(gg, PROPAN.map(function (p) { return [p[0], p[1]]; }), [[0, 1], [1, 2]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            function raekke(g, y, ord) {
                SV.el("rect", { x: RX, y: y - 22, width: RE - RX, height: 44, rx: 12, fill: "rgba(15,118,110,0.06)", stroke: "#a9d3c9", "stroke-width": 1.4 }, g);
                KX.forEach(function (x, i) { ORG.givet(g, x, y, ord[i], B); });
            }
            api.del("raekkeA", {
                lag: 0,
                fuld: function (g) {
                    raekke(g, RA, ["ingen", "−OH", "−COOH"]);
                    var a = SV.el("rect", { x: G.oh[0], y: G.oh[1], width: G.oh[2], height: G.oh[3], rx: 15, fill: F.accent, "fill-opacity": 0.13, stroke: F.accent, "stroke-width": 2.2 }, g);
                    var b = SV.el("rect", { x: G.cooh[0], y: G.cooh[1], width: G.cooh[2], height: G.cooh[3], rx: 15, fill: F.accent, "fill-opacity": 0.13, stroke: F.accent, "stroke-width": 2.2 }, g);
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); an.pop(r.a, 100, 450); an.pop(r.b, 250, 450); }
            });
            api.del("raekkeB", {
                lag: 0,
                fuld: function (g) { raekke(g, RB, ["alkan", "alkohol", "carboxylsyre"]); return {}; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            /* ----- Lag 2: formlerne ------------------------------------------------ */
            api.del("kort2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KA.x, KA.y, KA.b, KA.h);
                    ORG.t(g, KA.x + KA.b / 2, KA.y + 28, "ethansyre", { fs: 18, fed: true });
                    [UP1, UP2].forEach(function (u) {
                        SV.el("rect", { x: u.x, y: u.y, width: u.b, height: u.h, rx: 14, fill: "#ffffff", stroke: "#d3dde4", "stroke-width": 1.2 }, g);
                    });
                    /* strukturformlen */
                    var x = UP1.x + UP1.b / 2 - 4, y = 524;
                    ORG.streg(g, [[x - 68, y, "H"], [x - 34, y, "C"], [x, y, "C"], [x + 34, y, "O"], [x + 68, y, "H"],
                        [x - 34, y - 34, "H"], [x - 34, y + 34, "H"], [x, y - 40, "O"]],
                        [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [1, 6], [2, 7, 2]], { x: 0, y: 0, d: 1, str: 20 });
                    ORG.givet(g, UP1.x + UP1.b / 2, UP1.y + UP1.h, "strukturformel", NK.ORG.bredde(["funktionel gruppe", "carbonylgruppe", "zigzagformel", "carbonhydrid", "strukturformel"]));
                    /* propanon */
                    ORG.kortB(g, KC.x, KC.y, KC.b, KC.h);
                    ORG.t(g, KC.x + KC.b / 2, KC.y + 28, "propanon", { fs: 18, fed: true });
                    ORG.skelet(g, [[PRO[0][0], PRO[0][1]], [PRO[1][0], PRO[1][1]], [PRO[2][0], PRO[2][1]], [PRO_O[0], PRO_O[1], "O"]],
                        [[0, 1], [1, 2], [1, 3, 2, 0]]);
                }
            });

            api.del("zigzag", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.skelet(gg, [[EZ[0][0], EZ[0][1]], [EZ[1][0], EZ[1][1]], [EZ_O[0], EZ_O[1], "O", { farve: F.accent }],
                        [EZ_OH[0], EZ_OH[1], "OH", { anker: "start", farve: F.accent }]],
                        [[0, 1], [1, 2, 2, 0, F.accent], [1, 3, 1, 0, F.accent]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            api.del("co", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: PRO[1][0] - 17, y: PRO[1][1] - 12, width: 34, height: PRO_O[1] - PRO[1][1] + 28, rx: 12,
                        fill: F.accent, "fill-opacity": 0.13, stroke: F.accent, "stroke-width": 2.2 }, gg);
                    ORG.skelet(gg, [[PRO[1][0], PRO[1][1]], [PRO_O[0], PRO_O[1], "O", { farve: F.accent }]], [[0, 1, 2, 0, F.accent]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

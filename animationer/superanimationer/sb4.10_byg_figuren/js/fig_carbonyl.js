/* =====================================================================
   fig_carbonyl.js - figuren til B4.3 Aldehyder og ketoner

   Foroven bogens b4-propanal-propanon: propanal og propanon i hvert sit
   kort med C=O i grønt. Kortenes titler er aldehyd og keton; bogens
   linjer "et aldehyd" og "en keton" er taget af. Forneden bogens
   b4-dnph-tollens: to reagensglas med DNPH og to med Tollens' reagens.
   Glassene er mærket med stoffernes navne (ethanol, propanon, propanal)
   i stedet for bogens "alkohol", "aldehyd eller keton", "keton" og
   "aldehyd", som ville afsløre pladserne foroven.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var K1 = { x: 14, y: 26, b: 558, h: 222 }, K2 = { x: 588, y: 26, b: 558, h: 222 };
    var T1 = { x: 14, y: 280, b: 558, h: 300 }, T2 = { x: 588, y: 280, b: 558, h: 300 };
    var L = 40, MY = K1.y + 116, NY = K1.y + 186;
    /* Propanal: tre C, O op og H ned fra det sidste */
    var PA = [[K1.x + 220, MY - 4], [K1.x + 255, MY + 16], [K1.x + 290, MY - 4]];
    var PA_O = ORG.fra(PA[2], L, -90), PA_H = ORG.fra(PA[2], L, 30);
    /* Propanon: tre C med O op fra det midterste */
    var PO_C = [K2.x + 190, MY - 4];
    var PO = [ORG.fra(PO_C, L, 150), PO_C, ORG.fra(PO_C, L, 30)];
    var PO_O = ORG.fra(PO_C, L, -90);
    var CO1 = [PA[2][0] - 16, PA_O[1] - 16, 32, PA[2][1] - PA_O[1] + 28];
    var CO2 = [PO_C[0] - 16, PO_O[1] - 16, 32, PO_C[1] - PO_O[1] + 28];
    /* Glassene */
    var GX = [170, 390], GT = 64, GB = 222, GW = 46;

    function titel(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }

    NK.FIGURER.carbonyl = {
        vb: [1160, 594],
        lag: [
            { navn: "Aldehyd og keton", pladser: ["aldehyd", "keton", "carbonylgruppe"],
              ros: "Et aldehyd har C=O for enden af kæden, og en keton har C=O inde i kæden. C=O er carbonylgruppen." },
            { navn: "Testene", pladser: ["DNPH", "Tollens' test"],
              ros: "DNPH giver orange bundfald med både aldehyder og ketoner. Tollens' test giver kun sølvspejl med et aldehyd." }
        ],
        pladser: [
            titel("aldehyd", K1, ["pa"], {
                keton: "<b>keton</b> har C=O inde i kæden. I propanal sidder C=O for enden med et H på carbonatomet.",
                carbonylgruppe: "<b>carbonylgruppe</b> er kun C=O. Kortets titel er stofklassen for hele propanal.",
                DNPH: "<b>DNPH</b> er et stof til en test. Kortets titel er stofklassen for propanal.",
                "Tollens' test": "<b>Tollens' test</b> er en test. Kortets titel er stofklassen for propanal." }),
            titel("keton", K2, ["po"], {
                aldehyd: "<b>aldehyd</b> har C=O for enden af kæden. I propanon sidder C=O inde i kæden mellem to carbonatomer.",
                carbonylgruppe: "<b>carbonylgruppe</b> er kun C=O. Kortets titel er stofklassen for hele propanon.",
                DNPH: "<b>DNPH</b> er et stof til en test. Kortets titel er stofklassen for propanon.",
                "Tollens' test": "<b>Tollens' test</b> er en test. Kortets titel er stofklassen for propanon." }),
            { id: "carbonylgruppe", ord: ["carbonylgruppe"], x: K2.x + 410, y: MY - 24, maal: [CO2[0] + CO2[2] + 2, PO_O[1] + 12], dele: ["co"],
              omr: [{ r: [CO2[0], CO2[1], CO2[2], CO2[3], 12] }, { r: [CO1[0], CO1[1], CO1[2], CO1[3], 12] }],
              fejl: { keton: "<b>keton</b> er hele stoffet. Pladsen peger kun på C=O.",
                      aldehyd: "<b>aldehyd</b> er en stofklasse. Pladsen peger kun på C=O i propanon.",
                      DNPH: "<b>DNPH</b> er et stof, der giver bundfald med C=O. Pladsen peger på selve C=O i propanon." } },

            titel("DNPH", T1, ["glas1"], {
                "Tollens' test": "<b>Tollens' test</b> giver sølvspejl med et aldehyd. Her giver propanon et orange bundfald, og ethanol giver intet.",
                keton: "<b>keton</b> er en stofklasse. Titlen er navnet på stoffet, der giver orange bundfald med C=O.",
                aldehyd: "<b>aldehyd</b> er en stofklasse. Titlen er navnet på stoffet, der giver orange bundfald med C=O.",
                carbonylgruppe: "<b>carbonylgruppe</b> er C=O i et molekyle. Titlen er navnet på stoffet i de to glas." }),
            titel("Tollens' test", T2, ["glas2"], {
                DNPH: "<b>DNPH</b> giver bundfald med både aldehyder og ketoner. Her giver propanal et sølvspejl, men propanon gør ikke.",
                aldehyd: "<b>aldehyd</b> er en stofklasse. Titlen er navnet på testen, der giver sølvspejl.",
                keton: "<b>keton</b> er en stofklasse. Titlen er navnet på testen, der giver sølvspejl med et aldehyd.",
                carbonylgruppe: "<b>carbonylgruppe</b> er C=O i et molekyle. Titlen er navnet på testen i de to glas." })
        ],

        tegn: function (api) {
            ORG.defs();
            var O = { farve: F.accent };

            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, K1.x, K1.y, K1.b, K1.h);
                    ORG.kortB(g, K2.x, K2.y, K2.b, K2.h);
                    ORG.navn(g, PA[1][0], NY, "propanal", "C₃H₆O");
                    ORG.navn(g, PO_C[0], NY, "propanon", "C₃H₆O");
                }
            });
            api.del("pa", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.skelet(gg, [[PA[0][0], PA[0][1]], [PA[1][0], PA[1][1]], [PA[2][0], PA[2][1]], [PA_O[0], PA_O[1], "O", O], [PA_H[0], PA_H[1], "H", O]],
                        [[0, 1], [1, 2], [2, 3, 2, 0, F.accent], [2, 4, 1, 0, F.accent]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("po", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.skelet(gg, [[PO[0][0], PO[0][1]], [PO_C[0], PO_C[1]], [PO[2][0], PO[2][1]], [PO_O[0], PO_O[1], "O", O]],
                        [[0, 1], [1, 2], [1, 3, 2, 0, F.accent]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("co", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.boks(gg, CO1[0], CO1[1], CO1[2], CO1[3]);
                    ORG.boks(gg, CO2[0], CO2[1], CO2[2], CO2[3]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: testene ----------------------------------------------------- */
            function panel(g, k, navne) {
                ORG.kortB(g, k.x, k.y, k.b, k.h);
                GX.forEach(function (x, i) { ORG.navn(g, k.x + x, k.y + GB + 36, navne[i][0], navne[i][1]); });
            }
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    panel(g, T1, [["ethanol", "ingen ændring"], ["propanon", "orange bundfald"]]);
                    panel(g, T2, [["propanon", "ingen ændring"], ["propanal", "sølvspejl på glasset"]]);
                }
            });
            api.del("glas1", {
                lag: 1,
                fuld: function (g) {
                    ORG.reagensglas(g, T1.x + GX[0], T1.y + GT, T1.y + GB, GW, { fyld: "#f6d58a", niveau: 0.5 });
                    ORG.reagensglas(g, T1.x + GX[1], T1.y + GT, T1.y + GB, GW, { fyld: "#f6d58a", niveau: 0.5, bundfald: "#e8891c" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("glas2", {
                lag: 1,
                fuld: function (g) {
                    ORG.reagensglas(g, T2.x + GX[0], T2.y + GT, T2.y + GB, GW, { fyld: "#e4eef6", niveau: 0.5 });
                    ORG.reagensglas(g, T2.x + GX[1], T2.y + GT, T2.y + GB, GW, { niveau: 0.5, spejl: true });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

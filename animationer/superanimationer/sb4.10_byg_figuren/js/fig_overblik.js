/* =====================================================================
   fig_overblik.js - figuren til B4.7 Overblik

   Øverst propan-2-ol og propanon med en pil hver vej som i bogens boks
   "Addition eller reduktion?": oxidation den ene vej og reduktion den
   anden. Nederst bogens syntese af ethylethanoat (b4-syntese-
   ethylethanoat-1 til -3) som én rute: ethen, ethanol, ethansyre og
   ethylethanoat. Pilene er mærket med trin 1 til 3 i stedet for
   reaktionstyperne, så trin 2 ikke siger oxidation. En stiplet pil under
   ruten viser, at planen laves baglæns fra produktet.
   Tre fagord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;
    var ORANGE = "#c05621";

    var KO = { x: 14, y: 26, b: 1132, h: 232 }, KS = { x: 14, y: 286, b: 1132, h: 236 };
    var L = 38, OY = KO.y + 122;
    var A_C = [KO.x + 380, OY + 4], B_C = [KO.x + 780, OY + 4];
    var PX = [KO.x + 478, KO.x + 682];
    var SY = KS.y + 118, SL = 30;

    NK.FIGURER.overblik = {
        vb: [1160, 536],
        lag: [
            { navn: "Reaktioner og syntese", pladser: ["oxidation", "reduktion", "syntese"],
              ros: "Den ene vej er en oxidation og den anden vej en reduktion. En syntese er en rute i flere trin." }
        ],
        pladser: [
            { id: "oxidation", ord: ["oxidation"], x: (PX[0] + PX[1]) / 2, y: KO.y + 46, maal: [(PX[0] + PX[1]) / 2, OY - 22], dele: ["pilO"],
              omr: [{ r: [PX[0] - 8, OY - 24, PX[1] - PX[0] + 16, 24, 10] }],
              fejl: { reduktion: "<b>reduktion</b> er det modsatte. Ad den øverste pil får carbonatomet en binding mere til oxygen og færre til hydrogen.",
                      syntese: "<b>syntese</b> er en fremstilling i flere trin. Pladsen peger på én reaktion, hvor OH bliver til C=O." } },
            { id: "reduktion", ord: ["reduktion"], x: (PX[0] + PX[1]) / 2, y: KO.y + KO.h - 34, maal: [(PX[0] + PX[1]) / 2, OY + 22], dele: ["pilR"],
              omr: [{ r: [PX[0] - 8, OY, PX[1] - PX[0] + 16, 24, 10] }],
              fejl: { oxidation: "<b>oxidation</b> går den anden vej. Ad den nederste pil bliver C=O i propanon til OH i propan-2-ol.",
                      syntese: "<b>syntese</b> er en fremstilling i flere trin. Pladsen peger på én reaktion, hvor C=O bliver til OH." } },
            { id: "syntese", ord: ["syntese"], x: KS.x + KS.b / 2, y: KS.y, maal: [KS.x + KS.b / 2, KS.y], titel: true, dele: ["rute"],
              omr: [{ r: [KS.x - 5, KS.y - 5, KS.b + 10, KS.h + 10, 18], tom: true }],
              fejl: { oxidation: "<b>oxidation</b> er kun ét af trinnene. Kortets titel gælder hele ruten fra ethen til ethylethanoat.",
                      reduktion: "<b>reduktion</b> er én reaktion. Kortets titel gælder hele ruten i flere trin." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var T = { farve: F.accent };

            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KO.x, KO.y, KO.b, KO.h);
                    ORG.kortB(g, KS.x, KS.y, KS.b, KS.h);
                    /* propan-2-ol og propanon */
                    ORG.skelet(g, [[A_C[0], A_C[1]], ORG.fra(A_C, L, 150), ORG.fra(A_C, L, 30), ORG.fra(A_C, L, -90).concat(["OH", { anker: "start", farve: F.accent }])],
                        [[0, 1], [0, 2], [0, 3, 1, 0, F.accent]]);
                    ORG.skelet(g, [[B_C[0], B_C[1]], ORG.fra(B_C, L, 150), ORG.fra(B_C, L, 30), ORG.fra(B_C, L, -90).concat(["O", T])],
                        [[0, 1], [0, 2], [0, 3, 2, 0, F.accent]]);
                    ORG.navn(g, A_C[0], KO.y + 196, "propan-2-ol");
                    ORG.navn(g, B_C[0], KO.y + 196, "propanon");
                    /* ruten */
                    var x0 = KS.x + 130;
                    ORG.f(g, x0, SY, "CH_2=CH_2", { fs: 19 });
                    var e1 = [KS.x + 360, SY + 8];
                    ORG.skelet(g, [[e1[0], e1[1], "HO", { anker: "end", farve: F.accent }], ORG.fra(e1, SL, -30), ORG.fra(ORG.fra(e1, SL, -30), SL, 30)],
                        [[0, 1, 1, 0, F.accent], [1, 2]], { fs: 19 });
                    var s = [KS.x + 610, SY];
                    ORG.skelet(g, [[s[0], s[1]], ORG.fra(s, SL, 150), ORG.fra(s, SL, -90).concat(["O", T]), ORG.fra(s, SL, 30).concat(["OH", { anker: "start", farve: F.accent }])],
                        [[0, 1], [0, 2, 2, 0, F.accent], [0, 3, 1, 0, F.accent]], { fs: 19 });
                    var c = [KS.x + 880, SY], oe = ORG.fra(c, SL, 30), c1 = ORG.fra(oe, SL, -30), c2 = ORG.fra(c1, SL, 30);
                    ORG.skelet(g, [[c[0], c[1]], ORG.fra(c, SL, 150), ORG.fra(c, SL, -90).concat(["O", T]), [oe[0], oe[1], "O", { farve: ORANGE }], [c1[0], c1[1]], [c2[0], c2[1]]],
                        [[0, 1], [0, 2, 2, 0, F.accent], [0, 3, 1, 0, F.accent], [3, 4, 1, 0, ORANGE], [4, 5, 1, 0, ORANGE]], { fs: 19 });
                    ORG.navn(g, x0, KS.y + 172, "ethen");
                    ORG.navn(g, KS.x + 380, KS.y + 172, "ethanol");
                    ORG.navn(g, KS.x + 620, KS.y + 172, "ethansyre");
                    ORG.navn(g, KS.x + 910, KS.y + 172, "ethylethanoat");
                }
            });
            api.del("pilO", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, PX[0], PX[1], OY - 10) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("pilR", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, PX[1], PX[0], OY + 10) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("rute", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.reaktionspil(gg, KS.x + 222, KS.x + 300, SY, { over: "trin 1", under: "+ vand" });
                    ORG.reaktionspil(gg, KS.x + 470, KS.x + 548, SY, { over: "trin 2" });
                    ORG.reaktionspil(gg, KS.x + 716, KS.x + 794, SY, { over: "trin 3", under: "+ ethanol" });
                    var y = KS.y + 206;
                    SV.el("line", { x1: KS.x + 900, y1: y, x2: KS.x + 150, y2: y, stroke: F.daempet, "stroke-width": 1.6, "stroke-dasharray": "6 5" }, gg);
                    SV.el("polygon", { points: (KS.x + 140) + "," + y + " " + (KS.x + 152) + "," + (y - 5.5) + " " + (KS.x + 152) + "," + (y + 5.5), fill: F.daempet }, gg);
                    ORG.t(gg, KS.x + 525, y - 7, "planen laves baglæns fra produktet", { fs: 13.5, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
        }
    };
}());

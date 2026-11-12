/* =====================================================================
   fig_estere.js - figuren til B4.5 Estere

   Øverst til venstre bogens b4-esterdannelse: ethansyre og ethanol giver
   ethylethanoat og vand. Syredelen er grøn og alkoholdelen orange som i
   bogen. Kortets titel er kondensation; esteren og estergruppen har
   pladser ved produktet, hvor bogen skriver "ethylethanoat, en ester".
   Til højre en ramme med titlen hydrolyse om bogens b4-hydrolyse: sur
   hydrolyse og forsæbning i hvert sit kort. Hydrolyse er overskrift for
   begge, så ordet ikke står på samme ting som de to andre.
   Nederst bogens beregning af udbytteprocenten som superberegning:
   formlen med pladserne for udbytteprocent og teoretisk udbytte og under
   den tallene fra bogens eksempel (8,71 g og 14,52 g giver 60,0 %).
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;
    var ORANGE = "#c05621";

    var KK = { x: 14, y: 26, b: 552, h: 320 };
    var FR = { x: 582, y: 26, b: 564, h: 400 };
    var KSH = { x: 598, y: 54, b: 532, h: 176 }, KFS = { x: 598, y: 238, b: 532, h: 176 };
    var KU = { x: 14, y: 452, b: 1132, h: 230 };
    var L = 30, LS = 27;

    /* Molekylerne. Syre: C med CH3 til venstre, O op og OH ned til hoejre */
    function syre(c, l) { return { c: c, me: ORG.fra(c, l, 150), o: ORG.fra(c, l, -90), oh: ORG.fra(c, l, 30) }; }
    function ester(c, l) {
        var s = syre(c, l), oe = s.oh, c1 = ORG.fra(oe, l, -30);
        return { c: c, me: s.me, o: s.o, oe: oe, c1: c1, c2: ORG.fra(c1, l, 30) };
    }
    function ethanol(o, l) { var c1 = ORG.fra(o, l, -30); return { o: o, c1: c1, c2: ORG.fra(c1, l, 30) }; }

    var KY = KK.y + 168;
    var K_SYRE = syre([KK.x + 62, KY], L), K_ETH = ethanol([KK.x + 182, KY + 8], L), K_EST = ester([KK.x + 334, KY], L);
    var EST_BOKS = [K_EST.c[0] - 14, K_EST.o[1] - 15, K_EST.oe[0] - K_EST.c[0] + 30, K_EST.oe[1] - K_EST.o[1] + 31];
    var EST_HEL = [K_EST.me[0] - 16, K_EST.o[1] - 18, K_EST.c2[0] - K_EST.me[0] + 32, K_EST.oe[1] - K_EST.o[1] + 36];

    var SY = KSH.y + 96, FY = KFS.y + 96;

    /* Superberegningen */
    var BY1 = KU.y + 92, BY2 = KU.y + 188, EQX = 314, BRX = 474, BRX2 = 404, RX = 760;

    /* Titlen paa overkanten; side "v" og "h" holder rammens og kortenes titler fra hinanden */
    function titel(id, k, dele, fejl, side) {
        var x = side === "v" ? k.x + 134 : (side === "h" ? k.x + k.b - 134 : k.x + k.b / 2);
        return { id: id, ord: [id], x: x, y: k.y, maal: [x, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }

    NK.FIGURER.estere = {
        vb: [1160, 696],
        lag: [
            { navn: "Esterdannelse", pladser: ["kondensation", "ester", "estergruppe"],
              ros: "Ved en kondensation bliver ethansyre og ethanol til en ester og vand. Estergruppen −COO− holder de to dele sammen." },
            { navn: "Hydrolyse", pladser: ["hydrolyse", "sur hydrolyse", "forsæbning"],
              ros: "Hydrolyse spalter esteren med vand. Sur hydrolyse er en ligevægt, og forsæbning forløber fuldstændig." },
            { navn: "Udbyttet", pladser: ["udbytteprocent", "teoretisk udbytte"],
              ros: "Udbytteprocenten er det faktiske udbytte divideret med det teoretiske udbytte og ganget med 100 %." }
        ],
        pladser: [
            titel("kondensation", KK, ["pilK"], {
                hydrolyse: "<b>hydrolyse</b> spalter en ester med vand. Her bliver to molekyler sat sammen, og der fraspaltes vand.",
                "sur hydrolyse": "<b>sur hydrolyse</b> spalter en ester. Her bliver en syre og en alkohol sat sammen til en ester og vand.",
                "forsæbning": "<b>forsæbning</b> spalter en ester med en base. Her bliver en syre og en alkohol sat sammen.",
                ester: "<b>ester</b> er et stof. Kortets titel er navnet på reaktionen, hvor der fraspaltes vand.",
                estergruppe: "<b>estergruppe</b> er atomerne −COO−. Kortets titel er navnet på reaktionen, hvor der fraspaltes vand." }),
            { id: "ester", ord: ["ester"], x: K_EST.c[0] + 30, y: KK.y + KK.h - 34, maal: [K_EST.c[0] + 30, EST_HEL[1] + EST_HEL[3] + 2], dele: ["est"],
              omr: [{ r: [EST_HEL[0], EST_HEL[1], EST_HEL[2], EST_HEL[3], 14] }],
              fejl: { estergruppe: "<b>estergruppe</b> er kun −COO−. Pladsen peger på hele stoffet, der dannes.",
                      kondensation: "<b>kondensation</b> er navnet på reaktionen. Pladsen peger på stoffet, der dannes af syren og alkoholen.",
                      hydrolyse: "<b>hydrolyse</b> er en reaktion. Pladsen peger på stoffet, der dannes af syren og alkoholen." } },
            { id: "estergruppe", ord: ["estergruppe"], x: K_EST.c[0] + 30, y: KK.y + 62, maal: [EST_BOKS[0] + EST_BOKS[2] / 2, EST_HEL[1] - 2], dele: ["coo"],
              omr: [{ r: [EST_BOKS[0], EST_BOKS[1], EST_BOKS[2], EST_BOKS[3], 12] }],
              fejl: { ester: "<b>ester</b> er hele stoffet. Pladsen peger kun på −COO−, der holder de to dele sammen.",
                      kondensation: "<b>kondensation</b> er reaktionen. Pladsen peger på atomerne −COO− i esteren.",
                      hydrolyse: "<b>hydrolyse</b> er en reaktion. Pladsen peger på atomerne −COO− i esteren." } },

            titel("hydrolyse", FR, ["ramme"], {
                "sur hydrolyse": "<b>sur hydrolyse</b> er kun det øverste kort. Rammens titel gælder begge måder at spalte esteren på.",
                "forsæbning": "<b>forsæbning</b> er kun det nederste kort. Rammens titel gælder begge måder at spalte esteren på.",
                kondensation: "<b>kondensation</b> sætter to molekyler sammen. Rammen viser esteren, der bliver spaltet." }, "h"),
            titel("sur hydrolyse", KSH, ["pilSH"], {
                "forsæbning": "<b>forsæbning</b> sker i stærkt basisk miljø og forløber fuldstændig. Her er H⁺ katalysator, og der er ligevægt.",
                hydrolyse: "<b>hydrolyse</b> passer på begge kort og står på rammen. Kortets titel siger, at en syre er katalysator.",
                kondensation: "<b>kondensation</b> sætter to molekyler sammen. Her bliver esteren spaltet af vand." }, "v"),
            titel("forsæbning", KFS, ["pilFS"], {
                "sur hydrolyse": "<b>sur hydrolyse</b> er en ligevægt med en syre som katalysator. Her reagerer esteren med OH⁻ og forløber fuldstændig.",
                hydrolyse: "<b>hydrolyse</b> passer på begge kort og står på rammen. Kortets titel siger, at esteren spaltes i stærkt basisk miljø.",
                kondensation: "<b>kondensation</b> sætter to molekyler sammen. Her bliver esteren spaltet." }, "v"),

            { id: "udbytteprocent", ord: ["udbytteprocent"], x: 156, y: BY1, maal: [156, BY1], titel: true, dele: ["resultat"],
              omr: [{ r: [26, BY1 - 24, 262, 48, 12] }, { r: [RX - 62, BY2 - 24, 124, 48, 12] }],
              fejl: { "teoretisk udbytte": "<b>teoretisk udbytte</b> er den største masse, der kan dannes. Pladsen er resultatet i procent til venstre for lighedstegnet." } },
            { id: "teoretisk udbytte", ord: ["teoretisk udbytte"], x: BRX, y: BY1 + 26, maal: [BRX, BY1 + 26], titel: true, dele: ["naevner"],
              omr: [{ r: [BRX - 130, BY1 + 4, 260, 46, 12] }, { r: [BRX2 - 60, BY2 + 6, 120, 40, 12] }],
              fejl: { udbytteprocent: "<b>udbytteprocent</b> er resultatet i procent. Pladsen står under brøkstregen, hvor den størst mulige masse skal stå." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var T = { farve: F.accent }, OR = { farve: ORANGE };
            function syreTegn(g, s, oh) {
                ORG.skelet(g, [[s.c[0], s.c[1]], [s.me[0], s.me[1]], [s.o[0], s.o[1], "O", T], [s.oh[0], s.oh[1], oh || "OH", { anker: "start", farve: F.accent }]],
                    [[0, 1], [0, 2, 2, 0, F.accent], [0, 3, 1, 0, F.accent]], { fs: 19 });
            }
            function estTegn(g, e) {
                ORG.skelet(g, [[e.c[0], e.c[1]], [e.me[0], e.me[1]], [e.o[0], e.o[1], "O", T], [e.oe[0], e.oe[1], "O", OR], [e.c1[0], e.c1[1]], [e.c2[0], e.c2[1]]],
                    [[0, 1], [0, 2, 2, 0, F.accent], [0, 3, 1, 0, F.accent], [3, 4, 1, 0, ORANGE], [4, 5, 1, 0, ORANGE]], { fs: 19 });
            }
            function ethTegn(g, e) {
                ORG.skelet(g, [[e.o[0], e.o[1], "HO", { anker: "end", farve: ORANGE }], [e.c1[0], e.c1[1]], [e.c2[0], e.c2[1]]],
                    [[0, 1, 1, 0, ORANGE], [1, 2, 1, 0, ORANGE]], { fs: 19 });
            }

            /* ----- Lag 1: esterdannelsen ------------------------------------------------ */
            api.del("baseK", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KK.x, KK.y, KK.b, KK.h);
                    syreTegn(g, K_SYRE);
                    ORG.plus(g, KK.x + 128, KY);
                    ethTegn(g, K_ETH);
                    ORG.plus(g, KK.x + 446, KY);
                    ORG.f(g, KK.x + 496, KY, "H_2O");
                    ORG.navn(g, K_SYRE.c[0] + 4, KK.y + 236, "ethansyre");
                    ORG.navn(g, K_ETH.c1[0], KK.y + 236, "ethanol");
                    ORG.navn(g, KK.x + 496, KK.y + 236, "vand");
                }
            });
            api.del("pilK", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, KK.x + 240, KK.x + 290, KY, { lig: true, over: "H₂SO₄" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("est", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); estTegn(gg, K_EST); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("coo", {
                lag: 0,
                fuld: function (g) { return { b: ORG.boks(g, EST_BOKS[0], EST_BOKS[1], EST_BOKS[2], EST_BOKS[3]) }; },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });

            /* ----- Lag 2: hydrolysen -------------------------------------------------- */
            api.del("baseH", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, FR.x, FR.y, FR.b, FR.h);
                    [[KSH, SY], [KFS, FY]].forEach(function (kk) {
                        var k = kk[0], y = kk[1];
                        SV.el("rect", { x: k.x, y: k.y, width: k.b, height: k.h, rx: 14, fill: "#ffffff", stroke: "#d3dde4", "stroke-width": 1.2 }, g);
                        estTegn(g, ester([k.x + 48, y], LS));
                        ORG.plus(g, k.x + 170, y);
                    });
                    ORG.f(g, KSH.x + 212, SY, "H_2O", { fs: 19 });
                    syreTegn(g, syre([KSH.x + 340, SY], LS));
                    ORG.plus(g, KSH.x + 418, SY);
                    ethTegn(g, ethanol([KSH.x + 470, SY + 8], LS));
                    ORG.f(g, KFS.x + 210, FY, "OH^−", { fs: 19 });
                    syreTegn(g, syre([KFS.x + 340, FY], LS), "O^−");
                    ORG.plus(g, KFS.x + 418, FY);
                    ethTegn(g, ethanol([KFS.x + 470, FY + 8], LS));
                    [[KSH, ["ethylethanoat", "ethansyre", "ethanol"]], [KFS, ["ethylethanoat", "ethanoat-ion", "ethanol"]]].forEach(function (n) {
                        var k = n[0];
                        ORG.t(g, k.x + 76, k.y + 150, n[1][0], { fs: 14, fed: true });
                        ORG.t(g, k.x + 346, k.y + 150, n[1][1], { fs: 14, fed: true });
                        ORG.t(g, k.x + 486, k.y + 150, n[1][2], { fs: 14, fed: true });
                    });
                }
            });
            api.del("ramme", {
                lag: 1,
                fuld: function (g) { return { r: SV.el("rect", { x: FR.x, y: FR.y, width: FR.b, height: FR.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("pilSH", {
                lag: 1,
                fuld: function (g) { return { p: ORG.reaktionspil(g, KSH.x + 248, KSH.x + 298, SY, { lig: true, over: "H⁺" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("pilFS", {
                lag: 1,
                fuld: function (g) { return { p: ORG.reaktionspil(g, KFS.x + 248, KFS.x + 298, FY) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            /* ----- Lag 3: udbyttet ---------------------------------------------------- */
            api.del("baseU", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KU.x, KU.y, KU.b, KU.h);
                    ORG.t(g, KU.x + 24, KU.y + 30, "En gruppe fremstillede 8,71 g propylpropanoat ved en estersyntese.", { fs: 15, anker: "start", farve: F.daempet });
                    var A = { "font-size": 21, "font-weight": 700, fill: F.blaek };
                    SV.tekst(g, EQX, BY1 + 7, "=", A);
                    SV.tekst(g, BRX, BY1 - 12, "det udbytte, man fik", { "font-size": 19, "font-weight": 700, fill: F.blaek });
                    SV.el("line", { x1: BRX - 136, y1: BY1, x2: BRX + 136, y2: BY1, stroke: F.blaek, "stroke-width": 2 }, g);
                    SV.tekst(g, BRX + 150, BY1 + 7, "· 100 %", Object.assign({ "text-anchor": "start" }, A));
                    SV.tekst(g, EQX, BY2 + 7, "=", A);
                    SV.tekst(g, BRX2, BY2 - 12, "8,71 g", A);
                    SV.el("line", { x1: BRX2 - 56, y1: BY2, x2: BRX2 + 56, y2: BY2, stroke: F.blaek, "stroke-width": 2 }, g);
                    SV.tekst(g, BRX2 + 70, BY2 + 7, "· 100 %", Object.assign({ "text-anchor": "start" }, A));
                    SV.tekst(g, RX - 100, BY2 + 7, "=", A);
                }
            });
            api.del("resultat", {
                lag: 2,
                fuld: function (g) { return { t: SV.tekst(g, RX, BY2 + 7, "60,0 %", { "font-size": 22, "font-weight": 800, fill: F.accent }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });
            api.del("naevner", {
                lag: 2,
                fuld: function (g) { return { t: SV.tekst(g, BRX2, BY2 + 32, "14,52 g", { "font-size": 21, "font-weight": 700, fill: F.accent }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });
        }
    };
}());

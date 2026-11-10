/* =====================================================================
   fig_protein.js - figuren til B7.8 Proteiner

   Øverst til venstre bogens b7-peptidbinding: alanin og glycin bliver
   til dipeptidet Ala-Gly og vand. Peptidbindingen sidder i en grøn boks.
   Bogens tekst "dipeptidet Ala-Gly" og "peptidbindingen er markeret" er
   afløst af pladserne.
   Øverst til højre bogens b7-denaturering i lille udgave: et foldet
   protein bliver foldet ud, men kæden er hel. Pladsen denaturering
   peger på pilen.
   Nederst en ramme med titlen protein om bogens b7-proteinstruktur i fire
   kort: primær struktur (perlerne), sekundær struktur (helix og
   foldeblad), tertiær struktur (det foldede protein) og kvaternær
   struktur (fire kæder). En regel med flere dele er en ramme om delene.
   I tredje lag kommer det, der holder formen: hydrogenbindingerne i
   helixen og mellem strengene (pladserne α-helix og β-foldeblad), den
   lilla-grå sky af upolære sidekæder inde i proteinet (hydrofob
   vekselvirkning) og den gule bro mellem to svovlatomer (disulfidbro)
   som i bogens b7-sidekaede-bindinger.
   Tolv fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var FP = NK.FP;
    var F = FP.F;
    var fra = ORG.fra;

    var HW = 137;                                        /* halv pladsbredde (hydrofob vekselvirkning) */

    /* ----- Lag 1: peptidbindingen ------------------------------------------- */
    var KP = { x: 14, y: 18, b: 700, h: 216 };
    var B = 28, PFS = 17, Y0 = KP.y + 116;
    function aminosyre(x0, methyl) {
        var N = [x0, Y0], Ca = fra(N, B, 30), C = fra(Ca, B, -30);
        return { N: N, Ca: Ca, C: C, O: fra(C, B, -90), OH: fra(C, B, 30), Me: methyl ? fra(Ca, B, 90) : null };
    }
    var ALA = aminosyre(KP.x + 74, true);
    var GLY = aminosyre(ALA.OH[0] + 92, false);
    var PIL0 = GLY.OH[0] + 40, PIL1 = PIL0 + 56;
    var PN = [PIL1 + 58, Y0], PCa = fra(PN, B, 30), PC = fra(PCa, B, -30), PN2 = fra(PC, B, 30), PCb = fra(PN2, B, -30),
        PC2 = fra(PCb, B, 30), POH = fra(PC2, B, -30), PO1 = fra(PC, B, -90), PO2 = fra(PC2, B, 90), PH = fra(PN2, B * 0.78, 90), PMe = fra(PCa, B, 90);
    var AMID = [PC[0] - 15, PO1[1] - 15, PN2[0] - PC[0] + 30, PH[1] - PO1[1] + 28];
    var PROD = [PN[0] - 40, PO1[1] - 18, POH[0] + 30 - (PN[0] - 40), PO2[1] + 18 - (PO1[1] - 18)];
    var VAND = POH[0] + 54;
    var PMID = PROD[0] + PROD[2] / 2;

    /* ----- Lag 3: denatureringen --------------------------------------------- */
    var KN = { x: 728, y: 18, b: 418, h: 216 };
    var DY = KN.y + 96, FX = KN.x + 74, DP0 = KN.x + 150, DP1 = KN.x + 216, UX0 = KN.x + 238, UX1 = KN.x + KN.b - 22;

    /* ----- Lag 2: rammen med de fire niveauer --------------------------------- */
    var RM = { x: 14, y: 262, b: 1132, h: 378 };
    var KB = 545, KHH = 152;
    var C1 = { x: 28, y: 306, b: KB, h: KHH }, C2 = { x: 587, y: 306, b: KB, h: KHH },
        C3 = { x: 28, y: 474, b: KB, h: KHH }, C4 = { x: 587, y: 474, b: KB, h: KHH };
    /* Sekundaer struktur: helixen og to strenge */
    var HA = [C2.x + 76, C2.y + 60], HB = [C2.x + 202, C2.y + 60], HR = 15, HV = 4.5;
    var SA = C2.y + 104, SB = C2.y + 132, SX0 = C2.x + 40, SX1 = C2.x + 238;
    var PX2 = C2.x + C2.b - 20 - HW;                     /* pladserne i kortet */
    /* Tertiaer struktur: det foldede protein med sky og svovlbro */
    var FC = [C3.x + 150, C3.y + 92], FS = 1.05;
    function FPt(x, y) { return [FC[0] + x * FS, FC[1] + y * FS]; }
    var SKY = FPt(-6, -14), SS1 = FPt(74, 10), SS2 = FPt(74, 28);
    var PX3 = C3.x + C3.b - 20 - HW;

    function titel(id, k, dele, fejl, x) {
        x = x === undefined ? k.x + k.b / 2 : x;
        return { id: id, ord: [id], x: x, y: k.y, maal: [x, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }
    var NIV = {
        p: "<b>primær struktur</b> er rækkefølgen af aminosyrer. ",
        s: "<b>sekundær struktur</b> er mønstrene helix og foldeblad. ",
        t: "<b>tertiær struktur</b> er hele kædens foldning. ",
        k: "<b>kvaternær struktur</b> er flere kæder sat sammen. "
    };

    NK.FIGURER.protein = {
        vb: [1160, 654],
        lag: [
            { navn: "Peptidbindingen", pladser: ["peptidbinding", "dipeptid"],
              ros: "Alanin og glycin kondenserer til et dipeptid. Peptidbindingen sidder mellem carbon og nitrogen." },
            { navn: "Fire niveauer", pladser: ["protein", "primær struktur", "sekundær struktur", "tertiær struktur", "kvaternær struktur"],
              ros: "Et protein beskrives på fire niveauer: rækkefølgen, mønstrene, hele foldningen og flere kæder sammen." },
            { navn: "Formen", pladser: ["α-helix", "β-foldeblad", "hydrofob vekselvirkning", "disulfidbro", "denaturering"],
              ros: "Hydrogenbindinger, upolære sidekæder og disulfidbroer holder formen. Ved denaturering går formen tabt." }
        ],
        pladser: [
            { id: "peptidbinding", ord: ["peptidbinding"], x: AMID[0] + AMID[2] / 2, y: KP.y + 32, maal: [AMID[0] + AMID[2] / 2, AMID[1] - 2], dele: ["amid"],
              omr: [{ r: [AMID[0], AMID[1], AMID[2], AMID[3], 10] }],
              fejl: { dipeptid: "<b>dipeptid</b> er hele stoffet af to aminosyrer. Pladsen peger kun på bindingen mellem C og N.",
                      "disulfidbro": "<b>disulfidbro</b> er en binding mellem to svovlatomer. Pladsen peger på bindingen mellem C og N." } },
            { id: "dipeptid", ord: ["dipeptid"], x: PMID, y: KP.y + KP.h - 26, maal: [PMID, PROD[1] + PROD[3]], dele: ["prod"],
              omr: [{ r: [PROD[0], PROD[1], PROD[2], PROD[3], 12] }],
              fejl: { peptidbinding: "<b>peptidbinding</b> er kun bindingen mellem C og N. Pladsen peger på hele stoffet, der dannes.",
                      protein: "<b>protein</b> er lange kæder af 100 til 1000 aminosyrer. Stoffet her er kun to aminosyrer." } },

            titel("protein", RM, ["ramme"], {
                "primær struktur": NIV.p + "Rammens titel gælder alle fire kort.",
                "sekundær struktur": NIV.s + "Rammens titel gælder alle fire kort.",
                "tertiær struktur": NIV.t + "Rammens titel gælder alle fire kort.",
                "kvaternær struktur": NIV.k + "Rammens titel gælder alle fire kort.",
                dipeptid: "<b>dipeptid</b> er kun to aminosyrer. Rammen viser lange kæder, der er foldet." }),
            titel("primær struktur", C1, ["perler"], {
                "sekundær struktur": NIV.s + "Kortet viser kun aminosyrerne efter hinanden.",
                "tertiær struktur": NIV.t + "Kortet viser kun aminosyrerne efter hinanden.",
                "kvaternær struktur": NIV.k + "Kortet viser kun én kæde.",
                protein: "<b>protein</b> står på rammen. Kortets titel er navnet på rækkefølgen af aminosyrer." }),
            titel("sekundær struktur", C2, ["sek"], {
                "primær struktur": NIV.p + "Kortet viser spiralen og strengene, kæden lægger sig i.",
                "tertiær struktur": NIV.t + "Kortet viser kun de faste mønstre i kæden.",
                "kvaternær struktur": NIV.k + "Kortet viser kun mønstrene i én kæde.",
                protein: "<b>protein</b> står på rammen. Kortets titel er navnet på mønstrene helix og foldeblad." }),
            titel("tertiær struktur", C3, ["fold"], {
                "primær struktur": NIV.p + "Kortet viser hele kæden pakket sammen.",
                "sekundær struktur": NIV.s + "Kortet viser hele kæden pakket sammen til en klump.",
                "kvaternær struktur": NIV.k + "Kortet viser kun én kæde, der er foldet.",
                protein: "<b>protein</b> står på rammen. Kortets titel er navnet på hele kædens foldning." }),
            titel("kvaternær struktur", C4, ["fire"], {
                "primær struktur": NIV.p + "Kortet viser fire kæder, der sidder sammen.",
                "sekundær struktur": NIV.s + "Kortet viser fire kæder, der sidder sammen.",
                "tertiær struktur": NIV.t + "Kortet viser fire foldede kæder, der sidder sammen.",
                protein: "<b>protein</b> står på rammen. Kortets titel er navnet på flere kæder sat sammen." }),

            { id: "α-helix", ord: ["α-helix"], x: PX2, y: HA[1], maal: [HB[0] + 20, HA[1]], dele: ["helixH"],
              omr: [{ r: [HA[0] - 16, HA[1] - HR - 9, HB[0] - HA[0] + 46, 2 * HR + 18, 10] }],
              fejl: { "β-foldeblad": "<b>β-foldeblad</b> er stykker af kæden side om side. Pladsen peger på kæden, der snor sig som en spiral.",
                      "sekundær struktur": NIV.s + "Pladsen peger kun på spiralen.",
                      "tertiær struktur": NIV.t + "Pladsen peger kun på spiralen." } },
            { id: "β-foldeblad", ord: ["β-foldeblad"], x: PX2, y: (SA + SB) / 2, maal: [SX1 + 12, (SA + SB) / 2], dele: ["arkH"],
              omr: [{ r: [SX0 - 8, SA - 16, SX1 - SX0 + 28, SB - SA + 34, 10] }],
              fejl: { "α-helix": "<b>α-helix</b> er kæden, der snor sig som en spiral. Pladsen peger på stykkerne, der ligger side om side.",
                      "sekundær struktur": NIV.s + "Pladsen peger kun på strengene side om side.",
                      "disulfidbro": "<b>disulfidbro</b> er en binding mellem to svovlatomer. Pladsen peger på strengene side om side." } },
            { id: "hydrofob vekselvirkning", ord: ["hydrofob vekselvirkning"], x: PX3, y: C3.y + 60, maal: [SKY[0] + 46, SKY[1]], dele: ["sky"],
              omr: [{ r: [SKY[0] - 44, SKY[1] - 18, 96, 36, 14] }],
              fejl: { "disulfidbro": "<b>disulfidbro</b> er en binding mellem to svovlatomer. Pladsen peger på de upolære sidekæder inde i proteinet.",
                      "tertiær struktur": NIV.t + "Pladsen peger på de upolære sidekæder, der samler sig inde i proteinet.",
                      "β-foldeblad": "<b>β-foldeblad</b> er strengene side om side. Pladsen peger på den lilla-grå sky af upolære sidekæder." } },
            { id: "disulfidbro", ord: ["disulfidbro"], x: PX3, y: C3.y + 120, maal: [SS1[0] + 10, (SS1[1] + SS2[1]) / 2], dele: ["ss"],
              omr: [{ r: [SS1[0] - 10, SS1[1] - 10, 20, SS2[1] - SS1[1] + 20, 8] }],
              fejl: { "hydrofob vekselvirkning": "<b>hydrofob vekselvirkning</b> er upolære sidekæder samlet. Pladsen peger på de to gule svovlatomer.",
                      peptidbinding: "<b>peptidbinding</b> sidder mellem C og N i kæden. Pladsen peger på broen mellem to svovlatomer.",
                      "α-helix": "<b>α-helix</b> er en spiral. Pladsen peger på broen mellem to svovlatomer." } },
            { id: "denaturering", ord: ["denaturering"], x: (DP0 + DP1) / 2, y: KN.y + KN.h - 26, maal: [(DP0 + DP1) / 2, DY + 5], dele: ["udfoldet"],
              omr: [{ r: [DP0 - 6, DY - 32, DP1 - DP0 + 12, 44, 10] }],
              fejl: { "tertiær struktur": NIV.t + "Pladsen peger på pilen, hvor proteinet mister sin form.",
                      "hydrofob vekselvirkning": "<b>hydrofob vekselvirkning</b> holder proteinet foldet. Pladsen peger på pilen, hvor formen går tabt.",
                      peptidbinding: "<b>peptidbinding</b> holder kæden sammen. Ved pilen er kæden stadig hel, men formen er væk." } }
        ],

        tegn: function (api) {
            FP.defs();
            ORG.defs();

            /* En aminosyre som skeletformel; reager: farven paa den gruppe, der reagerer */
            function skelet(g, a, nFarve, ohFarve) {
                var at = [[a.N[0], a.N[1], "H_2N", { anker: "end", farve: nFarve || F.blaek }], [a.Ca[0], a.Ca[1]], [a.C[0], a.C[1]],
                    [a.O[0], a.O[1], "O"], [a.OH[0], a.OH[1], "OH", { anker: "start", farve: ohFarve || F.blaek }]];
                var bi = [[0, 1, 1, 0, nFarve], [1, 2], [2, 3, 2], [2, 4, 1, 0, ohFarve]];
                if (a.Me) { at.push([a.Me[0], a.Me[1]]); bi.push([1, 5]); }
                ORG.skelet(g, at, bi, { fs: PFS });
            }

            /* ----- Lag 1 ------------------------------------------------------ */
            api.del("baseP", {
                lag: 0, auto: true,
                fuld: function (g) {
                    FP.kort(g, KP.x, KP.y, KP.b, KP.h);
                    skelet(g, ALA, null, F.accent);
                    ORG.plus(g, ALA.OH[0] + 46, Y0 - 2);
                    skelet(g, GLY, F.accent, null);
                    FP.pil(g, PIL0, Y0, PIL1, Y0, F.blaek, 2.4, 12);
                    ORG.t(g, ALA.Ca[0] + 4, KP.y + KP.h - 22, "alanin", { fs: 15, fed: true });
                    ORG.t(g, GLY.Ca[0] + 4, KP.y + KP.h - 22, "glycin", { fs: 15, fed: true });
                    ORG.plus(g, POH[0] + 36, Y0 - 2);
                    ORG.f(g, VAND, Y0 - 6, "H_2O", { fs: 20, anker: "start", farve: F.accent });
                }
            });
            api.del("prod", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.skelet(gg, [[PN[0], PN[1], "H_2N", { anker: "end" }], [PCa[0], PCa[1]], [PC[0], PC[1]], [PN2[0], PN2[1], "N"],
                        [PCb[0], PCb[1]], [PC2[0], PC2[1]], [POH[0], POH[1], "OH", { anker: "start" }], [PO1[0], PO1[1], "O"], [PO2[0], PO2[1], "O"],
                        [PH[0], PH[1], "H"], [PMe[0], PMe[1]]],
                        [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [2, 7, 2], [5, 8, 2], [3, 9], [1, 10]], { fs: PFS });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("amid", {
                lag: 0,
                fuld: function (g) { return { b: ORG.boks(g, AMID[0], AMID[1], AMID[2], AMID[3]) }; },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------ */
            api.del("baseR", {
                lag: 1, auto: true,
                fuld: function (g) { [C1, C2, C3, C4].forEach(function (k) { FP.kort(g, k.x, k.y, k.b, k.h); }); }
            });
            api.del("ramme", {
                lag: 1,
                fuld: function (g) { return { r: SV.el("rect", { x: RM.x, y: RM.y, width: RM.b, height: RM.h, rx: 18, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("perler", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g), navne = ["Gly", "Ala", "Ser", "Val", "Lys", "Cys", "Ala"];
                    var x0 = C1.x + C1.b / 2 - 3 * 62, P = navne.map(function (n, i) { return [x0 + i * 62, C1.y + 84 + (i % 2 ? 22 : -14)]; });
                    for (var i = 0; i < P.length - 1; i++) FP.linje(gg, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], "#2d8f84", 3);
                    FP.linje(gg, P[0][0] - 34, P[0][1] + 10, P[0][0], P[0][1], "#2d8f84", 3);
                    FP.linje(gg, P[6][0], P[6][1], P[6][0] + 34, P[6][1] - 10, "#2d8f84", 3);
                    P.forEach(function (p, i) { FP.perle(gg, p[0], p[1], 20, navne[i]); });
                    ORG.t(gg, P[0][0] - 48, P[0][1] + 40, "N-ende", { fs: 13, farve: F.daempet });
                    ORG.t(gg, P[6][0] + 48, P[6][1] + 40, "C-ende", { fs: 13, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("sek", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.tegnHelix(gg, HA, HB, HR, HV, FP.TEAL, 6);
                    FP.streng(gg, [SX0, SA], [SX1, SA], 15, FP.TEAL, 3);
                    FP.streng(gg, [SX1, SB], [SX0, SB], 15, FP.TEAL, 3);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("fold", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); FP.fold(gg, FC[0], FC[1], FS, FP.TEAL); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("fire", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g), cx = C4.x + C4.b / 2, cy = C4.y + 92;
                    FP.glod(gg, cx - 64, cy - 26, 52, "gul", 0.5);
                    FP.glod(gg, cx + 64, cy + 30, 52, "gul", 0.5);
                    FP.fold(gg, cx - 64, cy - 26, 0.56, FP.RAV);
                    FP.fold(gg, cx + 64, cy - 26, 0.56, FP.TEAL);
                    FP.fold(gg, cx - 64, cy + 30, 0.56, FP.TEAL);
                    FP.fold(gg, cx + 64, cy + 30, 0.56, FP.RAV);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 3 ------------------------------------------------------ */
            api.del("helixH", {
                lag: 2,
                fuld: function (g) {
                    /* Hydrogenbindingerne gaar mellem vindingerne, langs aksen */
                    var gg = SV.g(g), L = HB[0] - HA[0];
                    for (var k = 0; k < Math.floor(HV); k++) {
                        var x1 = HA[0] + L * (k + 0.25) / HV, x2 = HA[0] + L * (k + 1.25) / HV;
                        FP.hbind(gg, x1 + 5, HA[1] + HR - 3, x2 - 5, HA[1] + HR - 3, 2.6);
                    }
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("arkH", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    for (var x = SX0 + 26; x < SX1 - 18; x += 30) FP.hbind(gg, x, SA + 9, x, SB - 9, 2.6);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("sky", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.glodEllipse(gg, SKY[0], SKY[1], 52, 22, "neu", 1);
                    [[-24, -2], [0, 3], [24, -3]].forEach(function (d) {
                        FP.kugle(gg, SKY[0] + d[0], SKY[1] + d[1], 6, "C");
                        FP.kugle(gg, SKY[0] + d[0] + 7, SKY[1] + d[1] - 5, 3.6, "H");
                        FP.kugle(gg, SKY[0] + d[0] - 7, SKY[1] + d[1] + 4, 3.6, "H");
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("ss", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.linje(gg, SS1[0] - 10, SS1[1] - 8, SS1[0], SS1[1], "#8a949e", 3);
                    FP.linje(gg, SS2[0] - 12, SS2[1] + 12, SS2[0], SS2[1], "#8a949e", 3);
                    FP.linje(gg, SS1[0], SS1[1], SS2[0], SS2[1], "#a3800c", 3);
                    FP.kugle(gg, SS1[0], SS1[1], 7, "S");
                    FP.kugle(gg, SS2[0], SS2[1], 7, "S");
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("baseN", {
                lag: 2, auto: true,
                fuld: function (g) {
                    FP.kort(g, KN.x, KN.y, KN.b, KN.h);
                    ORG.t(g, FX, KN.y + 36, "foldet", { fs: 14, fed: true, farve: F.accent });
                    FP.fold(g, FX, DY, 0.62, FP.TEAL, { hbind: true });
                    ORG.t(g, (DP0 + DP1) / 2, DY - 12, "varme", { fs: 13.5, fed: true, farve: F.daempet });
                }
            });
            api.del("udfoldet", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g), P = [];
                    FP.pil(gg, DP0, DY, DP1, DY, F.blaek, 2.4, 12);
                    for (var i = 0; i <= 40; i++) {
                        var t = i / 40;
                        P.push([UX0 + (UX1 - UX0) * t, DY + 6 + 26 * Math.sin(t * Math.PI * 3.2) * (0.7 + 0.3 * Math.cos(t * 5))]);
                    }
                    FP.roer(gg, P, FP.TEAL, 5);
                    ORG.t(gg, (UX0 + UX1) / 2, KN.y + 36, "foldet ud", { fs: 14, fed: true, farve: F.accent });
                    ORG.t(gg, (UX0 + UX1) / 2 + 20, DY + 58, "kæden er hel", { fs: 13.5, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

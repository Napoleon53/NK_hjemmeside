/* =====================================================================
   fig_mono.js - figuren til B7.1 Monosaccharider

   Øverst bogens b7-naeringsstoffer: tre kort med en skive rugbrød, en
   dråbe olie og et æg og energien pr. gram. Rammen om de tre kort har
   titlen næringsstof. Ved siden af bogens b7-kulhydrat-oversigt: én
   sekskant, to sekskanter og en kæde af sekskanter; kortenes titler er
   monosaccharid, disaccharid og polysaccharid (polysaccharid står igen
   i B7.3). Bogens linjer "én enhed" og eksemplerne under kortene er
   taget af.
   I midten bogens b7-glucose-fructose: D-glucose og D-fructose som
   fischerprojektioner med navnet som skilt under kortet. Galactose er
   taget ud 10. nov. 2026 (brugeren: "Fjern gerne galactose som fagord").
   Bogens linjer "druesukker" og "aldehydgruppe: en aldose" er taget af.
   I tredje lag kommer en ramme om glucose med titlen aldose og en om
   fructose med titlen ketose, og aldehydgruppen og ketongruppen får
   deres farvede bokse som i bogen.
   Nederst til venstre bogens b7-fischer-laes: glucose med alle atomer
   tegnet og som fischerprojektion; carbonatomerne er grønne i begge.
   Nederst til højre bogens b7-d-og-l: D-glucose og L-glucose med spejlet
   imellem og rækken med carbonatom 5 i en boks. Bogens titler D-glucose
   og L-glucose og linjerne "OH til højre på carbonatom 5" er taget af.
   Ti fagord og polysaccharid igen i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KH = NK.KH;
    var F = KH.F;

    /* ----- Lag 1: næringsstoffer og kulhydrater -------------------------- */
    var RN = { x: 14, y: 34, b: 462, h: 196 };                      /* rammen om de tre næringsstoffer */
    var NAER = [0, 1, 2].map(function (i) { return { x: 27 + i * 148, y: 58, b: 140, h: 160 }; });
    var OV = [0, 1, 2].map(function (i) { return { x: 492 + i * 229, y: 34, b: 216, h: 196 }; });
    var HY = 150;                                                   /* sekskanternes højde */

    /* ----- Lag 2 og 3: de to monosaccharider ------------------------------ */
    var TB = 232, TH = 230, TY = 286;
    var TX = [324, 624];                                            /* midt paa arket */
    var TRIO = TX.map(function (x) { return { x: x, y: TY, b: TB, h: TH }; });
    var FY = TY + 46;                                               /* carbonatom 1 i fischerprojektionerne */
    var STOF = [KH.GLUCOSE, KH.FRUCTOSE];
    var RA = { x: TX[0] - 12, y: TY - 16, b: TB + 24, h: TH + 46 };                          /* aldose */
    var RK = { x: TX[1] - 12, y: TY - 16, b: TB + 24, h: TH + 46 };                          /* ketose */

    /* ----- Lag 2: fischerprojektionen ------------------------------------- */
    var CY = 598, CH = 196;
    var L1 = { x: 30, y: CY, b: 220, h: CH }, L2 = { x: 290, y: CY, b: 220, h: CH };

    /* ----- Lag 3: D og L --------------------------------------------------- */
    var DK = { x: 640, y: CY, b: 216, h: CH }, LK = { x: 930, y: CY, b: 216, h: CH };
    var SPEJL = (DK.x + DK.b + LK.x) / 2;

    /* Geometrien af fischerprojektionerne (til de gule felter), maalt uden at tegne */
    function fischerMaal(x0, y0, stof, o) {
        var g = SV.el("g");
        return KH.fischer(g, x0, y0, stof, o);
    }
    var FT = TRIO.map(function (k, i) { return fischerMaal(k.x + k.b / 2 - 4, FY, STOF[i], { numre: true }); });
    var FD = fischerMaal(DK.x + DK.b / 2 - 4, CY + 30, KH.GLUCOSE, { a: 27, numre: true });
    var FL = fischerMaal(LK.x + LK.b / 2 - 4, CY + 30, KH.L_GLUCOSE, { a: 27, numre: true });

    function titel(id, k, dele, fejl, ekstraOmr) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }].concat(ekstraOmr || []), fejl: fejl };
    }
    /* Navnet sidder som et skilt under kortet */
    function navn(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18] }], fejl: fejl };
    }
    function boksOmr(r) { return { r: [r[0] - 3, r[1] - 3, r[2] + 6, r[3] + 6, 9] }; }

    var NAVNFEJL = {
        glucose: "<b>glucose</b> har CHO øverst i kæden. Stoffet på kortet har C=O på carbonatom 2.",
        fructose: "<b>fructose</b> har C=O på carbonatom 2 og en CH₂OH-gruppe både øverst og nederst."
    };
    function navnFejl(selv, ekstra) {
        var f = {};
        Object.keys(NAVNFEJL).forEach(function (o) { if (o !== selv) f[o] = NAVNFEJL[o]; });
        Object.keys(ekstra || {}).forEach(function (o) { f[o] = ekstra[o]; });
        return f;
    }

    NK.FIGURER.mono = {
        vb: [1180, 810],
        lag: [
            { navn: "Næringsstoffer og kulhydrater", pladser: ["næringsstof", "monosaccharid", "disaccharid", "polysaccharid"],
              ros: "Kulhydrater, fedtstoffer og proteiner er næringsstoffer. Kulhydraterne deles efter, hvor mange enheder de har." },
            { navn: "To monosaccharider", pladser: ["glucose", "fructose", "fischerprojektion"],
              ros: "Glucose og fructose er tegnet som fischerprojektioner. Hvert kryds er et carbonatom." },
            { navn: "Aldose, ketose, D og L", pladser: ["aldose", "ketose", "D-form", "L-form"],
              ros: "En aldose har en aldehydgruppe, og en ketose har en ketongruppe. OH på carbonatom 5 afgør D eller L." }
        ],
        pladser: [
            /* Lag 1 */
            { id: "næringsstof", ord: ["næringsstof"], x: RN.x + RN.b / 2, y: RN.y, maal: [RN.x + RN.b / 2, RN.y], titel: true, dele: ["naering"],
              omr: [{ r: [RN.x - 4, RN.y - 4, RN.b + 8, RN.h + 8, 18], tom: true }],
              fejl: { monosaccharid: "<b>monosaccharid</b> er et sukkerstof af én enhed. Rammen samler kulhydrater, fedtstoffer og proteiner fra maden.",
                      disaccharid: "<b>disaccharid</b> er et sukkerstof af to enheder. Rammen samler de tre grupper i maden, der giver energi.",
                      polysaccharid: "<b>polysaccharid</b> er en kæde af sukkerenheder. Rammen samler de tre grupper i maden, der giver energi." } },
            titel("monosaccharid", OV[0], ["mono"], {
                disaccharid: "<b>disaccharid</b> er to enheder, der er bundet sammen. Kortet viser kun én sekskant.",
                polysaccharid: "<b>polysaccharid</b> er en lang kæde af enheder. Kortet viser kun én sekskant.",
                "næringsstof": "<b>næringsstof</b> er en gruppe i maden, som kulhydrater. Kortet viser ét sukkerstof af én enhed." }),
            titel("disaccharid", OV[1], ["di"], {
                monosaccharid: "<b>monosaccharid</b> er én enhed. Kortet viser to sekskanter, der er bundet sammen.",
                polysaccharid: "<b>polysaccharid</b> er en lang kæde. Kortet viser kun to sekskanter, der er bundet sammen.",
                "næringsstof": "<b>næringsstof</b> er en gruppe i maden. Kortet viser et sukkerstof af to enheder." }),
            titel("polysaccharid", OV[2], ["poly"], {
                monosaccharid: "<b>monosaccharid</b> er én enhed. Kortet viser en lang kæde, der fortsætter i begge ender.",
                disaccharid: "<b>disaccharid</b> er to enheder. Kortet viser en lang kæde, der fortsætter i begge ender.",
                "næringsstof": "<b>næringsstof</b> er en gruppe i maden. Kortet viser en lang kæde af sukkerenheder." }),

            /* Lag 2 */
            navn("glucose", TRIO[0], ["f0"], navnFejl("glucose", {
                fischerprojektion: "<b>fischerprojektion</b> er en måde at tegne på. Skiltet under kortet er navnet på stoffet." })),
            navn("fructose", TRIO[1], ["f1"], navnFejl("fructose", {
                fischerprojektion: "<b>fischerprojektion</b> er en måde at tegne på. Skiltet under kortet er navnet på stoffet." })),
            titel("fischerprojektion", L2, ["laes"], {
                glucose: "<b>glucose</b> er stoffet i begge kort. Titlen er navnet på den hurtige måde at tegne kæden på.",
                fructose: "<b>fructose</b> har C=O på carbonatom 2. Titlen er navnet på måden, kæden er tegnet på." }),

            /* Lag 3 */
            { id: "aldose", ord: ["aldose"], x: RA.x + RA.b / 2, y: RA.y, maal: [RA.x + RA.b / 2, RA.y], titel: true, dele: ["ra"],
              omr: [{ r: [RA.x - 4, RA.y - 4, RA.b + 8, RA.h + 8, 18], tom: true }, boksOmr(FT[0].boks(0))],
              fejl: { ketose: "<b>ketose</b> har en ketongruppe, C=O inde i kæden. Glucose har CHO øverst.",
                      "D-form": "<b>D-form</b> handler om OH på carbonatom 5. Rammen handler om gruppen CHO øverst i kæden.",
                      "L-form": "<b>L-form</b> handler om OH på carbonatom 5. Rammen handler om gruppen CHO øverst i kæden." } },
            { id: "ketose", ord: ["ketose"], x: RK.x + RK.b / 2, y: RK.y, maal: [RK.x + RK.b / 2, RK.y], titel: true, dele: ["rk"],
              omr: [{ r: [RK.x - 4, RK.y - 4, RK.b + 8, RK.h + 8, 18], tom: true }, boksOmr(FT[1].boks(1))],
              fejl: { aldose: "<b>aldose</b> har en aldehydgruppe, CHO for enden af kæden. Fructose har C=O på carbonatom 2.",
                      "D-form": "<b>D-form</b> handler om OH på carbonatom 5. Rammen handler om C=O på carbonatom 2.",
                      "L-form": "<b>L-form</b> handler om OH på carbonatom 5. Rammen handler om C=O på carbonatom 2." } },
            titel("D-form", DK, ["dform"], {
                "L-form": "<b>L-form</b> har OH til venstre på carbonatom 5. Se, hvilken vej OH peger i den markerede række.",
                aldose: "<b>aldose</b> handler om gruppen CHO. Kortets titel handler om OH på carbonatom 5.",
                ketose: "<b>ketose</b> har en ketongruppe. Kortet viser glucose, og titlen handler om OH på carbonatom 5." }, [boksOmr(FD.boks(4))]),
            titel("L-form", LK, ["lform"], {
                "D-form": "<b>D-form</b> har OH til højre på carbonatom 5. Se, hvilken vej OH peger i den markerede række.",
                aldose: "<b>aldose</b> handler om gruppen CHO. Kortets titel handler om OH på carbonatom 5.",
                ketose: "<b>ketose</b> har en ketongruppe. Kortet viser glucose, og titlen handler om OH på carbonatom 5." }, [boksOmr(FL.boks(4))])
        ],

        tegn: function (api) {
            KH.defs();
            var G = F.accent, O = F.sukker;

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) { OV.forEach(function (k) { ORG.kortB(g, k.x, k.y, k.b, k.h); }); }
            });
            api.del("naering", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: RN.x, y: RN.y, width: RN.b, height: RN.h, rx: 18, fill: "none", stroke: G, "stroke-width": 2 }, gg);
                    [["Kulhydrater", 17], ["Fedtstoffer", 37], ["Proteiner", 17]].forEach(function (d, i) {
                        var k = NAER[i], cx = k.x + k.b / 2;
                        ORG.kortB(gg, k.x, k.y, k.b, k.h);
                        KH.t(gg, cx, k.y + 26, d[0], 15.5, { farve: G, fed: true });
                        if (i === 0) KH.broed(gg, cx, k.y + 74, 0.82);
                        else if (i === 1) KH.draabe(gg, cx, k.y + 72, 0.8);
                        else KH.aeg(gg, cx, k.y + 72, 0.8);
                        KH.energi(gg, cx, k.y + 110, d[1], 112);
                        KH.t(gg, cx, k.y + 143, d[1] + " kJ pr. gram", 14.5, { farve: G, fed: true });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
            api.del("mono", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); KH.hex(gg, OV[0].x + OV[0].b / 2, HY, 26); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("di", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), mx = OV[1].x + OV[1].b / 2;
                    KH.obro(gg, mx - 16, HY, mx + 16, HY, 5);
                    KH.hex(gg, mx - 36, HY, 26);
                    KH.hex(gg, mx + 36, HY, 26);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("poly", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), mx = OV[2].x + OV[2].b / 2, af = 34, rr = 13;
                    var xs = [0, 1, 2, 3, 4, 5].map(function (i) { return mx + (i - 2.5) * af; });
                    KH.obro(gg, xs[0] - af + 16, HY, xs[0] - 10, HY, 4, 0.35);
                    KH.obro(gg, xs[5] + 10, HY, xs[5] + af - 16, HY, 4, 0.35);
                    for (var i = 0; i < 5; i++) KH.obro(gg, xs[i] + 10, HY, xs[i + 1] - 10, HY, 4);
                    xs.forEach(function (x, i) { KH.hex(gg, x, HY, rr, i === 0 || i === 5 ? 0.45 : 1); });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: de tre monosaccharider og fischerprojektionen -------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    TRIO.forEach(function (k) { ORG.kortB(g, k.x, k.y, k.b, k.h); });
                    ORG.kortB(g, L1.x, L1.y, L1.b, L1.h);
                    ORG.kortB(g, L2.x, L2.y, L2.b, L2.h);
                    KH.t(g, L1.x + L1.b / 2, L1.y + 26, "Alle atomer tegnet", 15.5, { farve: F.daempet, fed: true });
                    KH.pil(g, L1.x + L1.b + 10, L1.y + L1.h / 2, L2.x - 10, L2.y + L2.h / 2);
                }
            });
            /* ----- Lag 3 (over kortene, under formlerne): rammerne og boksene ---------------------- */
            api.del("ra", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: RA.x, y: RA.y, width: RA.b, height: RA.h, rx: 18, fill: "none", stroke: G, "stroke-width": 2 }, gg);
                    var b = FT[0].boks(0); KH.boks(gg, b[0], b[1], b[2], b[3], G);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
            api.del("rk", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: RK.x, y: RK.y, width: RK.b, height: RK.h, rx: 18, fill: "none", stroke: O, "stroke-width": 2 }, gg);
                    var b = FT[1].boks(1); KH.boks(gg, b[0], b[1], b[2], b[3], O);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            [0, 1].forEach(function (i) {
                api.del("f" + i, {
                    lag: 1,
                    fuld: function (g) {
                        var gg = SV.g(g), k = TRIO[i];
                        KH.fischer(gg, k.x + k.b / 2 - 4, FY, STOF[i], { numre: true });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.pop(r.g, 0, 450); }
                });
            });
            api.del("laes", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g), a = 22;
                    var gx = L1.x + L1.b / 2, gy = L1.y + 50;
                    for (var r = 0; r < 6; r++) KH.glod(gg, gx, gy + r * a, 10, 10, G, 0.4);
                    KH.gitter(gg, gx, gy, { a: a, fs: 15, cfarve: G });
                    var fx = L2.x + L2.b / 2 - 4, fy = L2.y + 46, fa = 27;
                    for (r = 0; r < 6; r++) KH.glod(gg, fx, fy + r * fa, 11, 11, G, 0.4);
                    KH.fischer(gg, fx, fy, KH.GLUCOSE, { a: fa, numre: true, farver: { 0: G, 5: G } });
                    for (r = 1; r < 5; r++) SV.el("circle", { cx: fx, cy: fy + r * fa, r: 3.6, fill: G, stroke: "#ffffff", "stroke-width": 1.2 }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });

            /* ----- Lag 3: D og L ------------------------------------------------ */
            api.del("base3", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, DK.x, DK.y, DK.b, DK.h);
                    ORG.kortB(g, LK.x, LK.y, LK.b, LK.h);
                    SV.el("rect", { x: SPEJL - 7, y: CY + 22, width: 14, height: CH - 58, rx: 3, fill: "#dfe6ee", stroke: "#9aa8b6", "stroke-width": 1.2 }, g);
                    SV.el("line", { x1: SPEJL - 2, y1: CY + 30, x2: SPEJL - 2, y2: CY + CH - 44, stroke: "#ffffff", "stroke-width": 2, opacity: 0.8 }, g);
                    KH.t(g, SPEJL, CY + CH - 16, "spejl", 13.5, { farve: F.daempet });
                }
            });
            api.del("dform", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KH.fischer(gg, DK.x + DK.b / 2 - 4, CY + 30, KH.GLUCOSE, { a: 27, numre: true, bokse: [[4, G]], farver: { 4: G } });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("lform", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KH.fischer(gg, LK.x + LK.b / 2 - 4, CY + 30, KH.L_GLUCOSE, { a: 27, numre: true, bokse: [[4, O]], farver: { 4: O } });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

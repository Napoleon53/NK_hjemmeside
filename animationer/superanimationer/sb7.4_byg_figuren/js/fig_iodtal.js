/* =====================================================================
   fig_iodtal.js - figuren til B7.6 Iodtal og forsæbning

   Øverst til venstre bogens b7-tilbagetitrering i en enkel udgave: tre
   kolber med dibrom i overskud, additionen og titreringen af resten, og
   under dem bjælkerne n(Br₂, start), forbrugt og overskud. Kortets titel
   er tilbagetitrering.
   Øverst til højre additionen af diiod til en dobbeltbinding og bogens
   b7-iodtal-skala med fem fedtstoffer. Pladsen iodtal er skalaens titel,
   hvor bogen skriver "iodtal".
   Nederst bogens b7-forsaebning med kortere kæder: et fedtstof og 3 KOH
   giver glycerol og tre fedtsyreioner med K⁺. Kortets titel er
   forsæbning, og sæbe peger på ionerne, hvor bogen skriver "sæbe".
   Til højre to små kort: forsæbningstal med kokosfedt og olivenolie og
   deres kæder, og syretal med frisk og harsk olie.
   Seks fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var FP = NK.FP;
    var F = FP.F;
    var bred = FP.bred;

    /* ----- Lag 1: tilbagetitreringen og iodtallet --------------------------- */
    var KT = { x: 14, y: 26, b: 540, h: 268 };
    var KOLBER = [KT.x + 98, KT.x + 270, KT.x + 442];
    var KB = KT.y + 176, KH = 72;
    var BAR1 = KT.y + 214, BAR2 = KT.y + 240, BH = 20;
    var BX0 = KT.x + 24, BX1 = KT.x + KT.b - 24, BDEL = BX0 + (BX1 - BX0) * 0.4;

    var KI = { x: 568, y: 26, b: 578, h: 268 };
    var SX0 = KI.x + 40, SX1 = KI.x + KI.b - 40, SY = KI.y + 158, SH = 20;
    function SXv(v) { return SX0 + (SX1 - SX0) * v / 200; }
    var OLIER = [[9, "kokosfedt", true], [35, "smør", false], [84, "olivenolie", true], [130, "solsikkeolie", false], [180, "hørfrøolie", true]];
    var IY = KI.y + 246;

    /* ----- Lag 2: forsaebningen --------------------------------------------- */
    var KF = { x: 14, y: 316, b: 740, h: 214 };
    var FS = 15, L = 12, N = 9, COS = Math.cos(Math.PI / 6);
    var R = [KF.y + 52, KF.y + 104, KF.y + 156];
    var ESTER_H = (L + 0.5 * FS + 3) * COS + (N - 1) * L * COS;
    var GX = KF.x + 42;
    var OX = GX - 0.37 * FS + bred("CH_2", FS) + 3 + 11 + 3 + 0.37 * FS;
    var F_HOEJRE = OX + ESTER_H;
    var KOH = F_HOEJRE + 38;
    var P0 = KOH + bred("3 KOH", 18) + 16, P1 = P0 + 62;
    var GX2 = P1 + 36;
    var G_HOEJRE = GX2 - 0.37 * FS + bred("CH_2", FS) + 3 + 11 + 3 + bred("OH", FS);
    var KX = G_HOEJRE + 40;
    var IX = KX + bred("K^+", FS) + 10 + bred("−", FS) + 0.37 * FS;
    var I_HOEJRE = IX + ESTER_H;
    var OMR_S = [KX - 10, R[0] - 46, I_HOEJRE - KX + 22, R[2] - R[0] + 58];
    var SAEBE_X = OMR_S[0] + OMR_S[2] / 2;

    /* ----- Lag 3: tallene ----------------------------------------------------- */
    var KN1 = { x: 768, y: 316, b: 378, h: 102 };
    var KN2 = { x: 768, y: 428, b: 378, h: 102 };

    function titel(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }

    NK.FIGURER.iodtal = {
        vb: [1160, 544],
        lag: [
            { navn: "Iodtal", pladser: ["tilbagetitrering", "iodtal"],
              ros: "Iodtallet viser, hvor meget diiod 100 g fedtstof kan addere. Ved en tilbagetitrering findes den forbrugte dibrom som en forskel." },
            { navn: "Forsæbning", pladser: ["forsæbning", "sæbe"],
              ros: "Ved forsæbningen spalter KOH de tre estergrupper. Der dannes glycerol og sæbe, som er saltene af fedtsyrerne." },
            { navn: "Tal for fedtstoffer", pladser: ["forsæbningstal", "syretal"],
              ros: "Forsæbningstallet er højt, når kæderne er korte. Syretallet stiger, når olien bliver harsk og får frie fedtsyrer." }
        ],
        pladser: [
            titel("tilbagetitrering", KT, ["kolber", "bjaelker"], {
                iodtal: "<b>iodtal</b> er et tal. Kortets titel er navnet på metoden, hvor resten af et kendt overskud titreres bagefter.",
                "forsæbning": "<b>forsæbning</b> er en reaktion med en base. Kortets titel er metoden, hvor overskuddet af dibrom titreres.",
                "forsæbningstal": "<b>forsæbningstal</b> er et tal. Kortets titel er metoden, hvor resten af et kendt overskud titreres bagefter.",
                syretal: "<b>syretal</b> er et tal. Kortets titel er metoden, hvor resten af et kendt overskud titreres bagefter." }),
            { id: "iodtal", ord: ["iodtal"], x: (SX0 + SX1) / 2, y: IY, maal: [SXv(70), SY + SH / 2 + 2], dele: ["skala"],
              omr: [{ r: [SX0 - 6, SY - SH / 2 - 6, SX1 - SX0 + 12, SH + 12, 14] }],
              fejl: { tilbagetitrering: "<b>tilbagetitrering</b> er en metode. Pladsen er titlen på skalaen, der viser antallet af dobbeltbindinger.",
                      "forsæbningstal": "<b>forsæbningstal</b> handler om mg KOH og kædernes længde. Skalaen viser, hvor meget diiod fedtstoffet kan addere.",
                      syretal: "<b>syretal</b> handler om frie fedtsyrer. Skalaen viser, hvor meget diiod fedtstoffet kan addere." } },

            titel("forsæbning", KF, ["pilF", "produkter"], {
                "sæbe": "<b>sæbe</b> er saltene af fedtsyrerne. Kortets titel er navnet på hele reaktionen med KOH.",
                tilbagetitrering: "<b>tilbagetitrering</b> er en metode til at måle. Kortets titel er reaktionen, hvor KOH spalter estergrupperne.",
                "forsæbningstal": "<b>forsæbningstal</b> er et tal. Kortets titel er reaktionen, hvor KOH spalter estergrupperne.",
                iodtal: "<b>iodtal</b> er et tal for dobbeltbindinger. Kortets titel er reaktionen, hvor KOH spalter estergrupperne." }),
            { id: "sæbe", ord: ["sæbe"], x: SAEBE_X, y: KF.y + KF.h - 20, maal: [SAEBE_X, OMR_S[1] + OMR_S[3]], dele: ["ioner"],
              omr: [{ r: [OMR_S[0], OMR_S[1], OMR_S[2], OMR_S[3], 12] }],
              fejl: { "forsæbning": "<b>forsæbning</b> er reaktionen. Pladsen peger på de tre ioner med en lang kæde og K⁺, der dannes.",
                      syretal: "<b>syretal</b> er et tal. Pladsen peger på de tre ioner med en lang kæde og K⁺, der dannes." } },

            titel("forsæbningstal", KN1, ["kaeder"], {
                syretal: "<b>syretal</b> handler om frie fedtsyrer i harsk olie. Her er tallet højt, når fedtsyrekæderne er korte.",
                iodtal: "<b>iodtal</b> er gram diiod pr. 100 g. Her er tallet mg KOH, og det er højt, når kæderne er korte.",
                "forsæbning": "<b>forsæbning</b> er reaktionen. Kortets titel er navnet på tallet, der fortæller om kædernes længde." }),
            titel("syretal", KN2, ["frie"], {
                "forsæbningstal": "<b>forsæbningstal</b> fortæller om kædernes længde. Her stiger tallet, fordi olien bliver harsk og får frie fedtsyrer.",
                iodtal: "<b>iodtal</b> fortæller om dobbeltbindinger. Her stiger tallet, fordi olien bliver harsk og får frie fedtsyrer.",
                "sæbe": "<b>sæbe</b> er saltene af fedtsyrer. Kortets titel er et tal, der stiger, når olien bliver harsk." })
        ],

        tegn: function (api) {
            FP.defs();
            var D = { fs: 13.5, farve: F.daempet };

            /* En lille fedtsyrekaede med n carbonatomer */
            function kaede(g, x, y, n, l, farve) { return FP.hale(g, x, y, n, { L: l || 8, farve: farve || F.fedt, sw: 2 }); }
            /* Et lille fedtstof: glycerols streg og tre kaeder; fri: kaede nr. der er spaltet af */
            function lilleFedt(g, x, y, fri) {
                FP.linje(g, x, y - 16, x, y + 16, F.blaek, 2.2);
                [-16, 0, 16].forEach(function (dy, k) {
                    if (k === fri) return;
                    FP.linje(g, x, y + dy, x + 7, y + dy, F.accent, 2);
                    kaede(g, x + 8, y + dy, 8, 7);
                });
            }

            /* ----- Lag 1 ------------------------------------------------------ */
            api.del("baseT", {
                lag: 0, auto: true,
                fuld: function (g) { FP.kort(g, KT.x, KT.y, KT.b, KT.h); }
            });
            api.del("kolber", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [["#cf9325", 0.34], ["#e3b955", 0.34], ["#f1dc9c", 0.34]].forEach(function (k, i) {
                        FP.kolbe(gg, KOLBER[i], KB, KH, { fyld: k[0], niveau: k[1] });
                    });
                    FP.burette(gg, KOLBER[2], KT.y + 62, KT.y + 104, "#eef3f7");
                    SV.el("ellipse", { cx: KOLBER[2], cy: KB - KH + 10, rx: 2.4, ry: 3.4, fill: "#cfe0ea", stroke: "#8aa3b3", "stroke-width": 0.8 }, gg);
                    [["Dibrom i overskud", 1], ["Dibrom adderer", 2], ["Resten titreres", 3]].forEach(function (c, i) {
                        var b = bred(c[0], 14), x = KOLBER[i] - (b + 28) / 2;
                        FP.nummer(gg, x + 11, KB + 20, c[1]);
                        ORG.t(gg, x + 28, KB + 25, c[0], { fs: 14, fed: true, farve: F.accent, anker: "start" });
                    });
                    FP.pil(gg, KOLBER[0] + 50, KB - 30, KOLBER[1] - 50, KB - 30, F.daempet, 1.8, 9);
                    FP.pil(gg, KOLBER[1] + 50, KB - 30, KOLBER[2] - 50, KB - 30, F.daempet, 1.8, 9);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("bjaelker", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    function bjaelke(x0, x1, y, f, tekst) {
                        SV.el("rect", { x: x0, y: y, width: x1 - x0, height: BH, rx: 7, fill: f[0], stroke: f[1], "stroke-width": 1.5 }, gg);
                        ORG.t(gg, (x0 + x1) / 2, y + 15, tekst, { fs: 14, fed: true, farve: f[2] });
                    }
                    bjaelke(BX0, BX1, BAR1, F.start, "n(Br_2, start)");
                    bjaelke(BX0, BDEL - 3, BAR2, F.forbrugt, "n(Br_2, forbrugt)");
                    bjaelke(BDEL + 3, BX1, BAR2, F.overskud, "n(Br_2, overskud)");
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 150, 450); }
            });
            api.del("baseI", {
                lag: 0, auto: true,
                fuld: function (g) {
                    FP.kort(g, KI.x, KI.y, KI.b, KI.h);
                    var y = KI.y + 44, x = KI.x + 34;
                    var t = ORG.f(g, x, y, "R−CH=CH−R′  +  I_2  →  R−CHI−CHI−R′", { fs: 17, anker: "start" });
                    ORG.t(g, x, y + 28, "Hver dobbeltbinding i et fedtstof adderer ét molekyle diiod.", { fs: 13.5, farve: F.daempet, anker: "start" });
                    return t;
                }
            });
            api.del("skala", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: SX0, y: SY - SH / 2, width: SX1 - SX0, height: SH, rx: SH / 2, fill: "url(#fp-skala)" }, gg);
                    SV.el("rect", { x: SX0 + 6, y: SY - SH / 2 + 2, width: SX1 - SX0 - 12, height: SH * 0.42, rx: SH / 4, fill: "#ffffff", opacity: 0.35 }, gg);
                    for (var v = 0; v <= 200; v += 50) {
                        FP.linje(gg, SXv(v), SY + SH / 2 + 3, SXv(v), SY + SH / 2 + 9, F.daempet, 1.4);
                        ORG.t(gg, SXv(v), SY + SH / 2 + 26, String(v), { fs: 13, farve: F.daempet });
                    }
                    OLIER.forEach(function (o) {
                        var ty = SY - (o[2] ? 54 : 28);
                        FP.linje(gg, SXv(o[0]), SY - SH / 2 + 2, SXv(o[0]), ty + 4, "#3d4b4a", 1.4);
                        SV.el("circle", { cx: SXv(o[0]), cy: SY, r: 6, fill: "url(#fp-perle)", stroke: "#2d3a39", "stroke-width": 1.3 }, gg);
                        ORG.t(gg, SXv(o[0]), ty - 2, o[1], { fs: 14, fed: true });
                    });
                    ORG.t(gg, SX0, SY + 58, "få dobbeltbindinger: fast", { fs: 13.5, fed: true, farve: F.fast, anker: "start" });
                    ORG.t(gg, SX1, SY + 58, "mange dobbeltbindinger: flydende", { fs: 13.5, fed: true, farve: "#2f7d72", anker: "end" });
                    ORG.t(gg, (SX0 + SX1) / 2 + 102, IY + 5, "g I₂ pr. 100 g", { fs: 13.5, farve: F.daempet, anker: "start" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------ */
            api.del("baseF", {
                lag: 1, auto: true,
                fuld: function (g) {
                    FP.kort(g, KF.x, KF.y, KF.b, KF.h);
                    FP.fedtstof(g, GX, R, N, { fs: FS });
                    ORG.t(g, (GX + F_HOEJRE) / 2, KF.y + KF.h - 14, "fedtstof", { fs: 14, farve: F.daempet });
                    ORG.plus(g, F_HOEJRE + 20, R[1] - 1);
                    ORG.f(g, KOH, R[1], "3 KOH", { fs: 18, anker: "start" });
                }
            });
            api.del("pilF", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.t(gg, (P0 + P1) / 2, R[1] - 12, "varme", { fs: 13.5, fed: true, farve: F.daempet });
                    FP.pil(gg, P0, R[1], P1, R[1], F.blaek, 2.4, 12);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 400); }
            });
            api.del("produkter", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.glycerolOH(gg, GX2, R, FS);
                    ORG.t(gg, (GX2 + G_HOEJRE) / 2, KF.y + KF.h - 14, "glycerol", { fs: 14, farve: F.daempet });
                    ORG.plus(gg, G_HOEJRE + 20, R[1] - 1);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 100, 450); }
            });
            api.del("ioner", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    R.forEach(function (y) {
                        ORG.t(gg, KX, y + 0.35 * FS, "K^+", { fs: FS, fed: true, anker: "start", farve: F.pos });
                        FP.ester(gg, IX, y, N, { fs: FS, L: L, start: "^−O", gfarve: F.neg, farve: F.fedt });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 200, 450); }
            });

            /* ----- Lag 3 ------------------------------------------------------ */
            api.del("baseN", {
                lag: 2, auto: true,
                fuld: function (g) {
                    FP.kort(g, KN1.x, KN1.y, KN1.b, KN1.h);
                    FP.kort(g, KN2.x, KN2.y, KN2.b, KN2.h);
                    [KN1, KN2].forEach(function (k) {
                        ORG.t(g, k.x + k.b / 2, k.y + k.h - 16, "mg KOH pr. g fedtstof", { fs: 12.5, farve: F.daempet });
                    });
                }
            });
            api.del("kaeder", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g), y = KN1.y + 36;
                    [[KN1.x + 22, "kokosfedt", "255", 12], [KN1.x + 200, "olivenolie", "190", 18]].forEach(function (c) {
                        ORG.t(gg, c[0], y + 5, c[1], { fs: 14, fed: true, anker: "start" });
                        ORG.t(gg, c[0] + bred(c[1], 14) + 8, y + 5, c[2], { fs: 15, fed: true, anker: "start", farve: F.accent });
                        ORG.t(gg, c[0] - 1, y + 31, "HOOC", { fs: 12, fed: true, anker: "start", farve: F.accent });
                        kaede(gg, c[0] + bred("HOOC", 12) + 2, y + 26, c[3], 8);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("frie", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g), y = KN2.y + 48;
                    ORG.t(gg, KN2.x + 22, y - 12, "frisk olie", { fs: 14, fed: true, anker: "start" });
                    ORG.t(gg, KN2.x + 22, y + 8, "lavt tal", { fs: 13.5, fed: true, anker: "start", farve: F.accent });
                    lilleFedt(gg, KN2.x + 110, y - 4);
                    ORG.t(gg, KN2.x + 196, y - 12, "harsk olie", { fs: 14, fed: true, anker: "start" });
                    ORG.t(gg, KN2.x + 196, y + 8, "højt tal", { fs: 13.5, fed: true, anker: "start", farve: F.pos });
                    lilleFedt(gg, KN2.x + 286, y - 4, 2);
                    ORG.t(gg, KN2.x + 298, y + 19, "HO", { fs: 11, fed: true, farve: F.syreHO, anker: "start" });
                    kaede(gg, KN2.x + 313, y + 15, 6, 7, F.fedt);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

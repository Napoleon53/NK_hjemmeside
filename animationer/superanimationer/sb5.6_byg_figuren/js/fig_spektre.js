/* =====================================================================
   fig_spektre.js - figuren til B5.2 Absorptionsspektre

   Øverst bogens spektrofotometer, hvor man kan se ind i apparatet: lampe,
   prisme, spalte, kuvetten med den røde prøve af E129, detektoren og
   displayet med A = 0,520 ved 504 nm. Kuvetten har ingen navneskilt (den
   er pladsen). Ved siden af et kort med en kuvette med rent vand og
   A = 0,000 efter nulstilling; blindprøve er titlen.
   I midten bogens spektrum-roed (E129, toppen ved 504 nm). Teksten
   "λmax = 504 nm / her absorberer farvestoffet mest" er taget af, for den
   afsloerer pladsen; pladsen peger paa toppen og den stiplede linje.
   Ved siden af bogens konjugering forenklet: kaeder med 2, 5, 8 og 11
   konjugerede dobbeltbindinger og stoffets farve. Fagordet er overskriften
   over tallene, som i bogen, og kan ikke forveksles med chromofor.
   Nederst lycopen fra tomater (C40H56) som zigzagformel med de otte
   methylgrupper: chromoforen er de 11 konjugerede dobbeltbindinger i
   midten; dobbeltbindingerne i enderne er ikke med, fordi to CH2-grupper
   skiller dem fra raekken.
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    /* ----- Lag 1: apparatet ------------------------------------------------- */
    var KA = { x: 20, y: 34, b: 700, h: 188 };                 /* kassen */
    var RUM = { x: 34, y: 50, b: 514, h: 156 };                /* det moerke rum */
    var LY = 128, XL = 74, XP = 178, XS = 284, XK = 384, XD = 480;
    var KB = 54, KH = 96, KBUND = 194;
    var DI = { x: 566, y: 62, b: 140, h: 74 };                 /* displayet */
    var BL = { x: 740, y: 34, b: 340, h: 188 };                /* kortet med blindproeven */

    /* ----- Lag 2: spektret -------------------------------------------------- */
    var SP = { x: 20, y: 290, b: 640, h: 262 };
    var GA = { xa: 110, xb: 620, ya: 352, yb: 486, ymax: 0.6, ytrin: 0.1 };
    function GX(l) { return GA.xa + (GA.xb - GA.xa) * (l - 400) / 300; }
    function GY(a) { return GA.yb - (GA.yb - GA.ya) * a / GA.ymax; }
    var TOP = [GX(504), GY(B5.e129(504))];

    /* ----- Lag 3: konjugering og lycopen ------------------------------------ */
    var KJ = { x: 680, y: 290, b: 400, h: 262 };
    var RAEKKER = [[2, null], [5, null], [8, B5.F.gul], [11, B5.F.orange]];
    var RY = [376, 419, 462, 505], NX = 714, KX0 = 742, KDX = 11.5;
    var LC = { x: 20, y: 572, b: 1060, h: 180 };
    var LX0 = 85, LDX = 30, LY0 = 680;
    var LL = LDX / Math.cos(Math.PI / 6);                       /* bindingens laengde */
    /* Lycopens hovedkaede: 32 carbonatomer. Dobbeltbindingerne (atom i til i + 1,
       talt fra 0) og methylgrupperne fra SMILES
       CC(C)=CCCC(C)=CC=CC(C)=CC=CC(C)=CC=CC=C(C)C=CC=C(C)C=CC=C(C)CCC=C(C)C */
    var DOBBELT = [1, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 29];
    var METHYL = [1, 5, 9, 13, 18, 22, 26, 30];
    var KONJ = [5, 26];                                          /* chromoforen fra atom 5 til 26 */
    var GRUPPE = 7;                                              /* den chromofore gruppe: C=C fra atom 7 til 8 */

    NK.FIGURER.spektre = {
        vb: [1100, 766],
        lag: [
            { navn: "Spektrofotometeret", pladser: ["spektrofotometer", "kuvette", "absorbans"],
              ros: "Spektrofotometeret sender lys gennem kuvetten og viser absorbansen, her 0,520." },
            { navn: "Blindprøve og spektrum", pladser: ["blindprøve", "absorptionsspektrum", "absorptionsmaksimum"],
              ros: "Med blindprøven nulstilles apparatet. Absorptionsspektret for E129 har sin top ved 504 nm." },
            { navn: "Farvestoffets molekyle", pladser: ["konjugerede dobbeltbindinger", "chromofor", "chromofor gruppe"],
              ros: "Hver C=C er en chromofor gruppe. De 11 konjugerede dobbeltbindinger i midten er lycopens chromofor." }
        ],
        pladser: [
            { id: "spektrofotometer", ord: ["spektrofotometer"], x: KA.x + KA.b / 2, y: KA.y, maal: [KA.x + KA.b / 2, KA.y], titel: true, dele: ["apparat"],
              omr: [{ r: [KA.x - 4, KA.y - 4, KA.b + 8, KA.h + 8, 18], tom: true }],
              fejl: { "kuvette": "<b>kuvette</b> er kun den lille beholder med prøven. Overskriften gælder hele apparatet med lampe, prisme og display.",
                      "absorbans": "<b>absorbans</b> er tallet på displayet. Overskriften gælder hele apparatet, der måler lyset.",
                      "blindprøve": "<b>blindprøve</b> er en kuvette uden farvestof. Overskriften gælder hele apparatet, der måler lyset." } },
            { id: "kuvette", ord: ["kuvette"], x: 290, y: 240, maal: [XK - 10, KBUND + 4], dele: ["kuvette"],
              omr: [{ r: [XK - KB / 2 - 6, KBUND - KH - 12, KB + 12, KH + 18, 6] }],
              fejl: { "blindprøve": "<b>blindprøve</b> er en kuvette uden farvestof. Pladsen peger på beholderen med den røde prøve i apparatet.",
                      "spektrofotometer": "<b>spektrofotometer</b> er hele apparatet. Pladsen peger kun på den lille beholder, prøven står i.",
                      "absorbans": "<b>absorbans</b> er tallet på displayet. Pladsen peger på den lille beholder, prøven står i." } },
            { id: "absorbans", ord: ["absorbans"], x: 640, y: 240, maal: [DI.x + DI.b / 2 - 4, DI.y + DI.h + 4], dele: ["display"],
              omr: [{ r: [DI.x - 4, DI.y - 4, DI.b + 8, DI.h + 8, 10] }],
              fejl: { "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er en bølgelængde. Pladsen peger på tallet A, der viser, hvor meget lys prøven optager.",
                      "spektrofotometer": "<b>spektrofotometer</b> er hele apparatet. Pladsen peger kun på tallet A på displayet.",
                      "kuvette": "<b>kuvette</b> er beholderen med prøven. Pladsen peger på tallet A på displayet." } },

            { id: "blindprøve", ord: ["blindprøve"], x: BL.x + BL.b / 2, y: BL.y, maal: [BL.x + BL.b / 2, BL.y], titel: true, dele: ["blind"],
              omr: [{ r: [BL.x - 4, BL.y - 4, BL.b + 8, BL.h + 8, 18], tom: true }],
              fejl: { "kuvette": "<b>kuvette</b> er beholderen. Overskriften siger, hvad kuvetten med rent vand bruges til.",
                      "absorbans": "<b>absorbans</b> er tallet A. Overskriften gælder kuvetten med rent vand, som apparatet nulstilles med.",
                      "spektrofotometer": "<b>spektrofotometer</b> er apparatet. Overskriften gælder kuvetten med rent vand, som apparatet nulstilles med." } },
            { id: "absorptionsspektrum", ord: ["absorptionsspektrum"], x: SP.x + SP.b / 2, y: SP.y, maal: [SP.x + SP.b / 2, SP.y], titel: true, dele: ["graf"],
              omr: [{ r: [SP.x - 4, SP.y - 4, SP.b + 8, SP.h + 8, 18], tom: true }],
              fejl: { "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er kun toppen. Overskriften gælder hele grafen med absorbansen ved hver bølgelængde.",
                      "absorbans": "<b>absorbans</b> står på den lodrette akse. Overskriften gælder hele grafen.",
                      "spektrofotometer": "<b>spektrofotometer</b> er apparatet, der måler. Overskriften gælder grafen med målingerne." } },
            { id: "absorptionsmaksimum", ord: ["absorptionsmaksimum"], x: 474, y: 334, maal: [TOP[0] + 9, TOP[1] - 6], dele: ["top"],
              omr: [{ c: [TOP[0], TOP[1], 14] }, { r: [TOP[0] - 5, TOP[1], 10, GA.yb - TOP[1], 4] }],
              fejl: { "absorptionsspektrum": "<b>absorptionsspektrum</b> er hele grafen. Pladsen peger kun på toppen, hvor stoffet optager mest lys.",
                      "absorbans": "<b>absorbans</b> står på den lodrette akse. Pladsen peger på den bølgelængde, hvor kurven har sin top.",
                      "chromofor": "<b>chromofor</b> er en del af et molekyle. Pladsen peger på toppen af grafen ved 504 nm." } },

            { id: "konjugerede dobbeltbindinger", ord: ["konjugerede dobbeltbindinger"], x: KJ.x + KJ.b / 2, y: 328, maal: [NX, RY[0] - 22], dele: ["kaeder"],
              omr: [{ r: [NX - 20, RY[0] - 24, 40, RY[3] - RY[0] + 40, 8] }],
              fejl: { "chromofor": "<b>chromofor</b> er en del af et molekyle. Pladsen står over tallene, der tæller noget i kæderne.",
                      "chromofor gruppe": "<b>chromofor gruppe</b> er én lille gruppe som C=C. Tallene tæller dobbeltbindinger, der sidder i en konjugeret række.",
                      "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er en bølgelængde. Pladsen står over tallene, der tæller noget i kæderne." } },
            { id: "chromofor", ord: ["chromofor"], x: 900, y: 604, maal: [828, LY0 - 52], dele: ["lycopen"],
              omr: [],
              fejl: { "konjugerede dobbeltbindinger": "<b>konjugerede dobbeltbindinger</b> tælles i kæderne ovenover. Pladsen peger på den del af lycopen, der absorberer lys.",
                      "chromofor gruppe": "<b>chromofor gruppe</b> er én lille gruppe som C=C. Pladsen peger på hele rækken, der absorberer lyset.",
                      "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er en bølgelængde. Pladsen peger på en del af molekylet lycopen.",
                      "absorptionsspektrum": "<b>absorptionsspektrum</b> er en graf. Pladsen peger på en del af molekylet lycopen." } },
            { id: "chromofor gruppe", ord: ["chromofor gruppe"], x: 202, y: 604, maal: [0, 0], dele: ["gruppe"],
              omr: [],
              fejl: { "chromofor": "<b>chromofor</b> er hele rækken, der absorberer lyset. Pladsen peger på én enkelt C=C i rækken.",
                      "konjugerede dobbeltbindinger": "<b>konjugerede dobbeltbindinger</b> er to C=C med én enkeltbinding imellem. Pladsen peger på én enkelt C=C." } }
        ],

        tegn: function (api) {
            B5.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

            /* Lycopens atomer og chromoforens felt */
            var P = B5.zigzag(LX0, LY0, 32, LL);
            var pc = plads("chromofor");
            var cx0 = P[KONJ[0]][0] - 14, cx1 = P[KONJ[1]][0] + 14;
            pc.omr = [{ r: [cx0, LY0 - 54, cx1 - cx0, 104, 12] }];
            pc.maal = [cx1 - 40, LY0 - 54];
            var pg = plads("chromofor gruppe"), GA0 = P[GRUPPE], GA1 = P[GRUPPE + 1];
            var gx = (GA0[0] + GA1[0]) / 2;
            pg.omr = [{ r: [GA0[0] - 7, Math.min(GA0[1], GA1[1]) - 9, GA1[0] - GA0[0] + 14, Math.abs(GA1[1] - GA0[1]) + 22, 8] }];
            pg.maal = [gx, Math.min(GA0[1], GA1[1]) - 11];

            /* ----- Lag 1: apparatet og blindproeven ------------------------------ */
            api.del("apparat", {
                lag: 0,
                fuld: function (g) {
                    var groen = B5.lysfarve(504);
                    SV.el("rect", { x: KA.x + 3, y: KA.y + 7, width: KA.b, height: KA.h, rx: 16, fill: "#3c4a52", opacity: 0.25, filter: "url(#b5-blur)" }, g);
                    SV.el("rect", { x: KA.x, y: KA.y, width: KA.b, height: KA.h, rx: 16, fill: "url(#b5-krop)", stroke: "#9aa7ae", "stroke-width": 1.3 }, g);
                    SV.el("rect", { x: RUM.x, y: RUM.y, width: RUM.b, height: RUM.h, rx: 10, fill: "url(#b5-rum)", stroke: "#0b0f14", "stroke-width": 1.2 }, g);
                    /* lampen og det hvide lys */
                    B5.straale(g, XL + 10, XP - 6, LY, 10, "#fff6d6", { spids: false, glod: 1.4 });
                    B5.lampe(g, XL, LY, 15);
                    /* prismet og farvevifte */
                    var fan = [660, 620, 585, 545, 504, 470, 430];
                    fan.forEach(function (nm, k) {
                        var farve = B5.lysfarve(nm), y = LY + (k - 4) * 14, ex = XP + 9, ey = LY + 2;
                        SV.el("path", { d: "M" + ex + "," + ey + " L" + (XS - 6) + "," + (y - 2.4) + " L" + (XS - 6) + "," + (y + 2.4) + " Z", fill: farve, opacity: 0.5, filter: "url(#b5-glod-lille)" }, g);
                        SV.el("path", { d: "M" + ex + "," + ey + " L" + (XS - 6) + "," + (y - 1.6) + " L" + (XS - 6) + "," + (y + 1.6) + " Z", fill: farve }, g);
                    });
                    SV.el("polygon", { points: (XP - 28) + "," + (LY + 34) + " " + (XP + 28) + "," + (LY + 34) + " " + XP + "," + (LY - 42),
                        fill: "url(#b5-prisme)", stroke: "#cfe3f0", "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
                    /* spalten */
                    SV.el("rect", { x: XS - 6, y: RUM.y + 10, width: 12, height: LY - 5 - RUM.y - 10, rx: 2, fill: "url(#b5-staal)", stroke: "#3d4549", "stroke-width": 1 }, g);
                    SV.el("rect", { x: XS - 6, y: LY + 5, width: 12, height: RUM.y + RUM.h - 10 - LY - 5, rx: 2, fill: "url(#b5-staal)", stroke: "#3d4549", "stroke-width": 1 }, g);
                    /* det blaagroenne lys til kuvetten og videre til detektoren */
                    B5.straale(g, XS + 6, XK - KB / 2, LY, 9, groen, { spids: false, glod: 1.3 });
                    B5.straale(g, XK + KB / 2, XD - 14, LY, 5.2, groen, { spids: false, op: 0.6 });
                    /* detektoren og ledningen */
                    var led = "M" + (XD + 14) + "," + (LY + 14) + " C" + (XD + 50) + "," + (LY + 14) + " " + (XD + 40) + "," + (LY + 52) + " " + (RUM.x + RUM.b + 4) + "," + (LY + 52);
                    SV.el("path", { d: led, fill: "none", stroke: "#0b0f14", "stroke-width": 4 }, g);
                    SV.el("path", { d: led, fill: "none", stroke: "#5b6670", "stroke-width": 2 }, g);
                    SV.el("rect", { x: XD - 14, y: LY - 24, width: 28, height: 48, rx: 4, fill: "url(#b5-staal-v)", stroke: "#4a5359", "stroke-width": 1.2 }, g);
                    SV.el("rect", { x: XD - 15, y: LY - 9, width: 7, height: 18, rx: 1.5, fill: "#1d2b22", stroke: "#0b0f14", "stroke-width": 1 }, g);
                    /* knapperne */
                    for (var k = 0; k < 3; k++) SV.el("circle", { cx: DI.x + 24 + k * 46, cy: 182, r: 10, fill: "url(#b5-knap)", stroke: "#6c767c", "stroke-width": 1 }, g);
                    /* smaa navne i rummet (kuvetten har intet: den er pladsen) */
                    [[XL, "lampe"], [XP, "prisme"], [XS, "spalte"], [XD, "detektor"]].forEach(function (n) {
                        KV.tekst(g, n[0], RUM.y + RUM.h - 6, n[1], { fs: 12.5, farve: "#a9bcc6" });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("kuvette", {
                lag: 0,
                fuld: function (g) {
                    var groen = B5.lysfarve(504), k0 = XK - KB / 2, k1 = XK + KB / 2;
                    var k = B5.kuvette(g, XK, KBUND, KB, KH, { farve: B5.fortyndet(B5.F.roed, 0.62), niveau: 0.84, inde: function (ig) {
                        B5.svind(ig, k0, k1, LY, 9, 5.2, groen, 1, 0.45);
                    } });
                    return { k: k.g };
                },
                byg: function (g, r, an) { an.pop(r.k, 0, 500); }
            });

            api.del("display", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: DI.x, y: DI.y, width: DI.b, height: DI.h, rx: 8, fill: "url(#b5-display)", stroke: "#0b0f14", "stroke-width": 1.5 }, g);
                    KV.tekst(g, DI.x + DI.b / 2, DI.y + 25, "λ = 504 nm", { fs: 14, farve: "#9fb3bd" });
                    var t = KV.tekst(g, DI.x + DI.b / 2, DI.y + 58, "A = 0,520", { fs: 22, fed: true, farve: "#bdf5d0" });
                    return { t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 300); an.pop(r.t, 150, 500); }
            });

            api.del("blind", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, BL.x, BL.y, BL.b, BL.h);
                    var kx = BL.x + 80;
                    B5.kuvette(g, kx, 186, KB, KH, { farve: "#e4eff6", niveau: 0.84 });
                    KV.tekst(g, kx, 210, "rent vand", { fs: 14.5, farve: F.daempet });
                    var dx = BL.x + 158;
                    SV.el("rect", { x: dx, y: 78, width: 162, height: 56, rx: 8, fill: "url(#b5-display)", stroke: "#0b0f14", "stroke-width": 1.5 }, g);
                    KV.tekst(g, dx + 81, 114, "A = 0,000", { fs: 21, fed: true, farve: "#bdf5d0" });
                    SV.el("rect", { x: dx + 36, y: 150, width: 90, height: 28, rx: 14, fill: "url(#b5-knap)", stroke: "#6c767c", "stroke-width": 1.2 }, g);
                    KV.tekst(g, dx + 81, 169, "nulstil", { fs: 14, fed: true, farve: "#3b4650" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 2: spektret ---------------------------------------------- */
            api.del("graf", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, SP.x, SP.y, SP.b, SP.h);
                    var ak = B5.spektrumAkser(g, GA);
                    var k = B5.spektrumKurve(g, ak.X, ak.Y, B5.e129, 0.55);
                    KV.tekst(g, GX(650), GY(0.42), "E129", { fs: 16, fed: true });
                    KV.tekst(g, GX(650), GY(0.42) + 19, "rødt farvestof", { fs: 14, farve: F.daempet });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.fade(r.k, 200, 700); }
            });

            api.del("top", {
                lag: 1,
                fuld: function (g) {
                    KV.linje(g, TOP[0], TOP[1] + 8, TOP[0], GA.yb, F.blaek, 1.3, "4 4");
                    var p = B5.toppunkt(g, TOP[0], TOP[1]);
                    KV.tekst(g, TOP[0] + 6, GA.yb - 8, "504 nm", { fs: 13, fed: true, anker: "start", farve: F.blaek, halo: "#f4f8f7" });
                    return { p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 100, 500); }
            });

            /* ----- Lag 3: kaederne og lycopen ------------------------------------ */
            api.del("kaeder", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, KJ.x, KJ.y, KJ.b, KJ.h);
                    RAEKKER.forEach(function (r, i) {
                        var y = RY[i], n = r[0];
                        KV.tekst(g, NX, y + 7, String(n), { fs: 20, fed: true, farve: F.accent });
                        var Q = B5.zigzag(KX0, y, 2 * n, KDX / Math.cos(Math.PI / 6), true);
                        var orden = Q.slice(1).map(function (q, j) { return j % 2 === 0 ? 2 : 1; });
                        B5.kaede(g, Q, orden, { sw: 1.8 });
                        var farve = r[1] ? B5.fortyndet(r[1], 0.9) : "#eef4f8";
                        B5.kuvette(g, 1046, y + 16, 22, 34, { farve: farve, niveau: 0.8 });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            api.del("lycopen", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, LC.x, LC.y, LC.b, LC.h);
                    KV.tekst(g, LC.x + LC.b - 22, LC.y + LC.h - 16, "Lycopen, det røde farvestof i tomater", { fs: 16, fed: true, anker: "end" });
                    var orden = [];
                    for (var i = 0; i < 31; i++) orden.push(DOBBELT.indexOf(i) >= 0 ? 2 : 1);
                    var gg = B5.kaede(g, P, orden, { sw: 2.2 });
                    METHYL.forEach(function (i) {
                        var op = P[i][1] < LY0;                       /* atomet staar oppe: methyl op */
                        KV.linje(gg, P[i][0], P[i][1], P[i][0], P[i][1] + (op ? -LL : LL), F.blaek, 2.2);
                    });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* Den chromofore gruppe: én C=C, der faar farve, naar ordet sidder */
            api.del("gruppe", {
                lag: 2,
                fuld: function (g) {
                    var a = P[GRUPPE], b = P[GRUPPE + 1], gg = SV.g(g);
                    B5.kaede(gg, [a, b], [2], { sw: 3, farve: B5.F.eps });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.pop(r.gg, 0, 500); }
            });
        }
    };
}());

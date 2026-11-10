/* =====================================================================
   fig_absorbans.js - figuren til B5.2 Absorbans og Lambert-Beers lov

   Bogens B5.2 og B5.3 blev ét afsnit 10. nov. 2026, og figuren er sat
   sammen af de to gamle figurer (fig_spektre.js og fig_lambert.js).

   Øverst bogens spektrofotometer, hvor man kan se ind i apparatet: lampe,
   prisme, spalte, kuvetten med den røde prøve af E129, detektoren og
   displayet med A = 0,520 ved 504 nm. Kuvetten har intet navneskilt (den
   er pladsen). Ved siden af et kort med en kuvette med rent vand og
   A = 0,000 efter nulstilling; blindprøve er titlen.
   I midten bogens spektrum-roed (E129, toppen ved 504 nm). Teksten
   "λmax = 504 nm / her absorberer farvestoffet mest" er taget af, for den
   afsloerer pladsen. Ved siden af de tre maalinger af permanganat fra
   bogens lambert-koncentration (1, 2 og 3 · 10⁻⁴ M, A = 0,245, 0,490 og
   0,735) som punkter paa en ret linje gennem (0, 0); de tre kuvetter er
   taget ud for at spare plads, og ligefrem proportional peger paa linjen.
   Nederst bogens lambert-lysvej (samme opløsning i en smal og en bred
   kuvette) og et kort med A = ε · l · c, som Lambert-Beers lov er titel
   paa (en regel med et navn er titel paa en boks med reglen), og
   ekstinktionskoefficient peger paa ε.
   Ti fagord i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    var GROEN = B5.lysfarve(525);
    function lilla(styrke) { return B5.fortyndet(B5.F.lilla, styrke); }

    /* ----- Lag 1: apparatet ------------------------------------------------- */
    var KA = { x: 20, y: 34, b: 700, h: 188 };                 /* kassen */
    var RUM = { x: 34, y: 50, b: 514, h: 156 };                /* det moerke rum */
    var LY = 128, XL = 74, XP = 178, XS = 284, XK = 384, XD = 480;
    var KB = 54, KH = 96, KBUND = 194;
    var DI = { x: 566, y: 62, b: 140, h: 74 };                 /* displayet */
    var BL = { x: 740, y: 34, b: 340, h: 188 };                /* kortet med blindproeven */

    /* ----- Lag 2: spektret -------------------------------------------------- */
    var SP = { x: 20, y: 290, b: 640, h: 250 };
    var GS = { xa: 110, xb: 620, ya: 344, yb: 474, ymax: 0.6, ytrin: 0.1 };
    function SX(l) { return GS.xa + (GS.xb - GS.xa) * (l - 400) / 300; }
    function SY(a) { return GS.yb - (GS.yb - GS.ya) * a / GS.ymax; }
    var TOP = [SX(504), SY(B5.e129(504))];

    /* ----- Lag 3: koncentrationen som graf ---------------------------------- */
    var RB = { x: 680, y: 290, b: 400, h: 250 };
    var GL = { xa: 762, xb: 1040, ya: 364, yb: 466, xmax: 3.5, ymax: 0.8 };
    function LX(c) { return GL.xa + (GL.xb - GL.xa) * c / GL.xmax; }
    function LYa(a) { return GL.yb - (GL.yb - GL.ya) * a / GL.ymax; }
    var MAALT = [0.245, 0.49, 0.735];                           /* A ved 1, 2 og 3 · 10⁻⁴ M */

    /* ----- Lag 3: lysvejen -------------------------------------------------- */
    var RC = { x: 20, y: 560, b: 540, h: 240 };
    var LY2 = RC.y + 96, BUND2 = RC.y + 152, PIL = RC.y + 170;
    var VEJ = [
        { cx: 128, b: 64, T: 0.324, pct: "32 %", l: "l = 1,00 cm", A: "A = 0,490", n: 12, fro: 21 },
        { cx: 360, b: 128, T: 0.105, pct: "10 %", l: "l = 2,00 cm", A: "A = 0,980", n: 24, fro: 22 }
    ];

    /* ----- Lag 4: loven ----------------------------------------------------- */
    var RD = { x: 580, y: 560, b: 500, h: 240 };
    var FY = RD.y + 108, FS = 50;                               /* formlen */
    var EPS = { x: 0, b: 0 };                                     /* ε i formlen (maales i tegn) */

    NK.FIGURER.absorbans = {
        vb: [1100, 818],
        lag: [
            { navn: "Spektrofotometeret", pladser: ["spektrofotometer", "kuvette", "absorbans"],
              ros: "Spektrofotometeret sender lys gennem kuvetten og viser absorbansen, her 0,520." },
            { navn: "Blindprøve og spektrum", pladser: ["blindprøve", "absorptionsspektrum", "absorptionsmaksimum"],
              ros: "Med blindprøven nulstilles apparatet. Absorptionsspektret for E129 har sin top ved 504 nm." },
            { navn: "Koncentration og lysvej", pladser: ["ligefrem proportional", "lysvej"],
              ros: "Absorbansen er ligefrem proportional med koncentrationen. Dobbelt så lang lysvej giver dobbelt så stor absorbans." },
            { navn: "Loven", pladser: ["Lambert-Beers lov", "ekstinktionskoefficient"],
              ros: "Lambert-Beers lov samler det hele: A = ε · l · c. Ekstinktionskoefficienten ε hører til stoffet." }
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
                      "absorbans": "<b>absorbans</b> er tallet på displayet. Pladsen peger på den lille beholder, prøven står i.",
                      "lysvej": "<b>lysvej</b> er kuvettens bredde. Pladsen peger på hele beholderen med den røde prøve i apparatet." } },
            { id: "absorbans", ord: ["absorbans"], x: 640, y: 240, maal: [DI.x + DI.b / 2 - 4, DI.y + DI.h + 4], dele: ["display"],
              omr: [{ r: [DI.x - 4, DI.y - 4, DI.b + 8, DI.h + 8, 10] }],
              fejl: { "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er en bølgelængde. Pladsen peger på tallet A, der viser, hvor meget lys prøven optager.",
                      "spektrofotometer": "<b>spektrofotometer</b> er hele apparatet. Pladsen peger kun på tallet A på displayet.",
                      "kuvette": "<b>kuvette</b> er beholderen med prøven. Pladsen peger på tallet A på displayet.",
                      "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> er ε, en konstant for stoffet. Pladsen peger på tallet A, apparatet har målt." } },

            { id: "blindprøve", ord: ["blindprøve"], x: BL.x + BL.b / 2, y: BL.y, maal: [BL.x + BL.b / 2, BL.y], titel: true, dele: ["blind"],
              omr: [{ r: [BL.x - 4, BL.y - 4, BL.b + 8, BL.h + 8, 18], tom: true }],
              fejl: { "kuvette": "<b>kuvette</b> er beholderen. Overskriften siger, hvad kuvetten med rent vand bruges til.",
                      "absorbans": "<b>absorbans</b> er tallet A. Overskriften gælder kuvetten med rent vand, som apparatet nulstilles med.",
                      "spektrofotometer": "<b>spektrofotometer</b> er apparatet. Overskriften gælder kuvetten med rent vand, som apparatet nulstilles med." } },
            { id: "absorptionsspektrum", ord: ["absorptionsspektrum"], x: SP.x + SP.b / 2, y: SP.y, maal: [SP.x + SP.b / 2, SP.y], titel: true, dele: ["spektrum"],
              omr: [{ r: [SP.x - 4, SP.y - 4, SP.b + 8, SP.h + 8, 18], tom: true }],
              fejl: { "absorptionsmaksimum": "<b>absorptionsmaksimum</b> er kun toppen. Overskriften gælder hele grafen med absorbansen ved hver bølgelængde.",
                      "absorbans": "<b>absorbans</b> står på den lodrette akse. Overskriften gælder hele grafen.",
                      "spektrofotometer": "<b>spektrofotometer</b> er apparatet, der måler. Overskriften gælder grafen med målingerne." } },
            { id: "absorptionsmaksimum", ord: ["absorptionsmaksimum"], x: 474, y: 328, maal: [TOP[0] + 9, TOP[1] - 6], dele: ["top"],
              omr: [{ c: [TOP[0], TOP[1], 14] }, { r: [TOP[0] - 5, TOP[1], 10, GS.yb - TOP[1], 4] }],
              fejl: { "absorptionsspektrum": "<b>absorptionsspektrum</b> er hele grafen. Pladsen peger kun på toppen, hvor stoffet optager mest lys.",
                      "absorbans": "<b>absorbans</b> står på den lodrette akse. Pladsen peger på den bølgelængde, hvor kurven har sin top." } },

            { id: "ligefrem proportional", ord: ["ligefrem proportional"], x: 902, y: 326, maal: [LX(1.5), LYa(0.245 * 1.5) - 4], dele: ["prop"],
              omr: [{ linje: [[LX(0), LYa(0)], [LX(3.25), LYa(0.245 * 3.25)]], b: 18 }],
              fejl: { "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er hele formlen A = ε · l · c. Pladsen peger på den rette linje gennem (0, 0).",
                      "lysvej": "<b>lysvej</b> er kuvettens bredde. Pladsen peger på den rette linje, der viser, hvordan A følger c.",
                      "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> er ε. Pladsen peger på den rette linje, der viser, hvordan A følger c.",
                      "absorptionsspektrum": "<b>absorptionsspektrum</b> har bølgelængden på den vandrette akse. Her står koncentrationen, og linjen går gennem (0, 0)." } },
            { id: "lysvej", ord: ["lysvej"], x: 290, y: RC.y + 214, maal: [VEJ[1].cx - 16, PIL + 4], dele: ["vej"],
              omr: VEJ.map(function (v) { return { r: [v.cx - v.b / 2 - 5, PIL - 9, v.b + 10, 18, 6] }; }),
              fejl: { "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> siger, hvor kraftigt stoffet absorberer. Pladsen peger på kuvettens bredde.",
                      "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng. Pladsen peger på kuvettens bredde, som lyset går igennem.",
                      "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er formlen A = ε · l · c. Pladsen peger på kuvettens bredde.",
                      "kuvette": "<b>kuvette</b> er hele beholderen. Pladsen peger kun på dens bredde, den strækning lyset går igennem." } },

            { id: "Lambert-Beers lov", ord: ["Lambert-Beers lov"], x: RD.x + RD.b / 2, y: RD.y, maal: [RD.x + RD.b / 2, RD.y], titel: true, dele: ["lov"],
              omr: [{ r: [RD.x - 4, RD.y - 4, RD.b + 8, RD.h + 8, 18], tom: true }],
              fejl: { "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng mellem to størrelser. Overskriften er navnet på formlen A = ε · l · c.",
                      "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> er kun ε. Overskriften er navnet på hele formlen A = ε · l · c." } },
            { id: "ekstinktionskoefficient", ord: ["ekstinktionskoefficient"], x: RD.x + RD.b / 2, y: RD.y + 176, maal: [0, 0], dele: ["eps"],
              omr: [],
              fejl: { "lysvej": "<b>lysvej</b> er l, kuvettens bredde. Pladsen peger på ε, der siger, hvor kraftigt stoffet absorberer lys.",
                      "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er hele formlen. Pladsen peger kun på ε.",
                      "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng. Pladsen peger på ε, en konstant for stoffet.",
                      "absorbans": "<b>absorbans</b> er A til venstre i formlen. Pladsen peger på ε, en konstant for stoffet." } }
        ],

        tegn: function (api) {
            B5.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

            /* Formlen maales, saa pladsen kan pege paa ε */
            var dele = [["A", F.blaek], ["=", F.blaek], ["ε", B5.F.eps], ["·", F.blaek], ["l", B5.F.l], ["·", F.blaek], ["c", B5.F.c]];
            var mell = 14, bredder = dele.map(function (d) { return B5.bredde(d[0], FS, 700, B5.FORMEL); });
            var ialt = bredder.reduce(function (a, b) { return a + b; }, 0) + mell * (dele.length - 1);
            var fx = RD.x + RD.b / 2 - ialt / 2, xs = [];
            bredder.forEach(function (w) { xs.push(fx); fx += w + mell; });
            EPS.x = xs[2]; EPS.b = bredder[2];
            var pe = plads("ekstinktionskoefficient");
            pe.omr = [{ r: [EPS.x - 8, FY - FS * 0.72, EPS.b + 16, FS * 0.95, 8] }];
            pe.maal = [EPS.x + EPS.b / 2, FY + FS * 0.23 + 6];

            /* ----- Lag 1: apparatet ---------------------------------------------- */
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

            /* ----- Lag 2: blindproeven og spektret ------------------------------- */
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

            api.del("spektrum", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, SP.x, SP.y, SP.b, SP.h);
                    var ak = B5.spektrumAkser(g, GS);
                    var k = B5.spektrumKurve(g, ak.X, ak.Y, B5.e129, 0.55);
                    KV.tekst(g, SX(650), SY(0.42), "E129", { fs: 16, fed: true });
                    KV.tekst(g, SX(650), SY(0.42) + 19, "rødt farvestof", { fs: 14, farve: F.daempet });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.fade(r.k, 200, 700); }
            });

            api.del("top", {
                lag: 1,
                fuld: function (g) {
                    KV.linje(g, TOP[0], TOP[1] + 8, TOP[0], GS.yb, F.blaek, 1.3, "4 4");
                    var p = B5.toppunkt(g, TOP[0], TOP[1]);
                    KV.tekst(g, TOP[0] + 6, GS.yb - 8, "504 nm", { fs: 13, fed: true, anker: "start", farve: F.blaek, halo: "#f4f8f7" });
                    return { p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 100, 500); }
            });

            /* ----- Lag 3: koncentrationen og lysvejen ---------------------------- */
            api.del("prop", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.flade(g, GL.xa, GL.ya - 8, GL.xb + 8, GL.yb);
                    var n;
                    for (n = 1; n * 0.2 <= GL.ymax + 1e-9; n++) KV.linje(g, GL.xa, LYa(n * 0.2), GL.xb + 8, LYa(n * 0.2), F.net, 1);
                    KV.linje(g, GL.xa, GL.yb, GL.xb + 8, GL.yb, F.daempet, 1.3);
                    KV.linje(g, GL.xa, GL.ya - 8, GL.xa, GL.yb, F.daempet, 1.3);
                    for (n = 0; n * 0.2 <= GL.ymax + 1e-9; n++) {
                        KV.linje(g, GL.xa - 5, LYa(n * 0.2), GL.xa, LYa(n * 0.2), F.daempet, 1.2);
                        KV.tekst(g, GL.xa - 10, LYa(n * 0.2) + 4.5, (n * 0.2).toFixed(1).replace(".", ","), { fs: 13, anker: "end", farve: F.daempet });
                    }
                    for (n = 0; n <= 3; n++) {
                        KV.linje(g, LX(n), GL.yb, LX(n), GL.yb + 5, F.daempet, 1.2);
                        KV.tekst(g, LX(n), GL.yb + 21, String(n), { fs: 13, farve: F.daempet });
                    }
                    KV.tekst(g, (GL.xa + GL.xb) / 2, GL.yb + 43, "c(permanganat) i 10^{−4} M", { fs: 13.5, farve: F.daempet });
                    var yx = GL.xa - 44, ym = (GL.ya + GL.yb) / 2;
                    KV.tekst(g, yx, ym, "absorbans", { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + yx + " " + ym + ")" });
                    var l = KV.kurve(g, [[LX(0), LYa(0)], [LX(3.3), LYa(0.245 * 3.3)]], F.accent, 2.4);
                    var pk = SV.g(g);
                    MAALT.forEach(function (a, i) { KV.punkt(pk, LX(i + 1), LYa(a), "a"); });
                    return { l: l, pk: pk };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.pk, 200, 500); }
            });

            api.del("vej", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    KV.tekst(g, RC.x + RC.b / 2, RC.y + 26, "Samme opløsning i to kuvetter", { fs: 16, fed: true });
                    VEJ.forEach(function (v) {
                        var x0 = v.cx - v.b / 2, x1 = v.cx + v.b / 2;
                        B5.maaling(g, v.cx, LY2, BUND2, v.b, 112, lilla(0.52), GROEN, v.T, { partikler: v.n, fro: v.fro, ind: 56, ud: 62 });
                        KV.tekst(g, x0 - 34, LY2 - 22, "100 %", { fs: 14, farve: F.daempet });
                        KV.tekst(g, x1 + 34, LY2 - 22, v.pct, { fs: 14.5, fed: true });
                        KV.tekst(g, x1 + 10, LY2 + 34, v.A, { fs: 16, fed: true, farve: F.accent, anker: "start" });
                        KV.linje(g, x0, BUND2 + 6, x0, PIL + 8, F.daempet, 1.1);
                        KV.linje(g, x1, BUND2 + 6, x1, PIL + 8, F.daempet, 1.1);
                        B5.vDobbeltpil(g, x0 + 1, x1 - 1, PIL, B5.F.l, 1.8, 9);
                        var t = KV.tekst(g, x1 + 10, PIL + 5, "", { fs: 15, fed: true, anker: "start" });
                        var ts = SV.el("tspan", { "font-family": B5.FORMEL, "font-style": "italic", fill: B5.F.l }, t);
                        ts.textContent = "l";
                        var ts2 = SV.el("tspan", {}, t);
                        ts2.textContent = v.l.slice(1);
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 4: Lambert-Beers lov -------------------------------------- */
            api.del("lov", {
                lag: 3,
                fuld: function (g) {
                    KV.kort(g, RD.x, RD.y, RD.b, RD.h);
                    var gg = SV.g(g);
                    dele.forEach(function (d, i) {
                        if (i === 2) return;                              /* ε tegnes af delen eps */
                        SV.tekst(gg, xs[i], FY, d[0], { "font-size": FS, "font-weight": 700, "font-style": /[Alc]/.test(d[0]) ? "italic" : "normal",
                            "font-family": B5.FORMEL, fill: d[1], "text-anchor": "start" });
                    });
                    KV.tekst(g, RD.x + RD.b / 2, RD.y + 222, "permanganat ved 525 nm: ε = 2,45 · 10^{3} M^{−1} · cm^{−1}", { fs: 15, farve: F.daempet });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.gg, 100, 500); }
            });

            api.del("eps", {
                lag: 3,
                fuld: function (g) {
                    var t = SV.tekst(g, EPS.x, FY, "ε", { "font-size": FS, "font-weight": 700, "font-style": "italic", "font-family": B5.FORMEL, fill: B5.F.eps, "text-anchor": "start" });
                    return { t: t };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 500); }
            });
        }
    };
}());

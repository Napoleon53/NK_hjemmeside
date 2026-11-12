/* =====================================================================
   fig_inter.js - figuren til B3.2 Intermolekylære bindinger

   Tre striber i en ramme, én for hver slags intermolekylær binding:
   - pentan (bogens b3-london): to kuglemodeller med elektronsky. Det
     oeverste molekyle har en midlertidig dipol (tyk og blaa i den ene
     ende, tynd og roed i den anden), det nederste den modsatte, og
     prikkerne i begge ender er londonbindingerne.
   - propanon (bogens b3-dipol-dipol): to molekyler med δ+ og δ− ved C=O
     og blaa prikker fra O til C i det naeste.
   - ethanol (bogens b3-hydrogenbinding): to molekyler med roede prikker
     fra H paa O til O i det naeste.
   Rammens overskrift til venstre er fællesnavnet intermolekylær binding,
   som foerst kommer, naar alle tre striber staar der. Bogens
   forklaringer ved siden af figurerne er taget af, fordi de navngiver
   bindingerne.
   Forneden bogens b3-hydrofil-hydrofob: ethanol og octan-1-ol med gul
   kaede og blaa OH-gruppe. Bogens forklaring over figuren er taget af.
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var HX = 152;                                         /* overskriften */
    var FR = { x: 300, y: 14, b: 845, h: 446 };           /* rammen */
    var HY = FR.y + FR.h / 2;
    var SX = 990;                                         /* stribernes pladser */
    var ST = { L: { y: 24, h: 198 }, D: { y: 232, h: 110 }, H: { y: 352, h: 98 } };
    var SB = { x: 312, b: 821 };

    /* Pentan */
    var LS = 1.3, LCX = 640, LY1 = ST.L.y + 54, LY2 = ST.L.y + 152, LX0 = LCX - 62 * LS, LX1 = LCX + 62 * LS;
    var TOP = ORG.pentan(LCX, LY1, false, LS), BUND = ORG.pentan(LCX, LY2, true, LS);
    var LM = (LY1 + LY2) / 2;

    /* Propanon: C ved (cx, y0), O til hoejre */
    var DY = ST.D.y + 58, DC = [560, 697], DL = 46;
    function propanon(cx) {
        return { c: [cx, DY], a: ORG.fra([cx, DY], DL, -120), b: ORG.fra([cx, DY], DL, 120), o: [cx + DL, DY] };
    }
    var P1 = propanon(DC[0]), P2 = propanon(DC[1]);
    var DD = [P1.o[0] + 13, P2.c[0] - 8];                /* de blaa prikker */
    var DDM = (DD[0] + DD[1]) / 2;

    /* Ethanol: O ved (ox, y0), H til hoejre, kaeden op til venstre */
    var HYY = ST.H.y + 62, HO = [560, 712], HL = 44;
    function ethanol(ox) {
        var c1 = ORG.fra([ox, HYY], HL, -120);
        return { o: [ox, HYY], h: [ox + HL, HYY], c1: c1, c0: [c1[0] - HL, c1[1]] };
    }
    var E1 = ethanol(HO[0]), E2 = ethanol(HO[1]);
    var HB = [E1.h[0] + 11, E2.o[0] - 13];                /* de roede prikker */
    var HBM = (HB[0] + HB[1]) / 2;

    /* Forneden: ethanol og octan-1-ol */
    var KV = { x: 16, y: 474, b: 1128, h: 254 };
    var VY = 582, VL = 36;
    var ETH = ORG.zz(130, VY, 3, VL, -30), OCT = ORG.zz(430, VY, 9, VL, -30);
    function bokse(P) {
        var c = P.slice(0, -1), o = P[P.length - 1];
        var xs = c.map(function (p) { return p[0]; }), ys = c.map(function (p) { return p[1]; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        var wO = NK.tekstBredde("O", 20, 700), wOH = NK.tekstBredde("OH", 20, 700);
        return { fob: [x0 - 16, y0 - 17, x1 - x0 + 32, y1 - y0 + 34], fil: [o[0] - wO / 2 - 9, o[1] - 19, wOH + 18, 38], o: o };
    }

    NK.FIGURER.inter = {
        vb: [1160, 740],
        lag: [
            { navn: "Londonbindinger", pladser: ["midlertidig dipol", "londonbinding"],
              ros: "Elektronerne samles et øjeblik i den ene ende af pentanmolekylet. Den midlertidige dipol giver en londonbinding til nabomolekylet." },
            { navn: "Polære molekyler", pladser: ["permanent dipol", "dipol-dipolbinding", "hydrogenbinding"],
              ros: "Propanonmolekylet har en permanent dipol og danner dipol-dipolbindinger. Ethanolmolekylet har H på O og danner hydrogenbindinger." },
            { navn: "Overblik og vand", pladser: ["intermolekylær binding", "hydrofob", "hydrofil"],
              ros: "Alle tre slags er intermolekylære bindinger. En lang carbonkæde er hydrofob, og OH-gruppen er hydrofil." }
        ],
        pladser: [
            { id: "midlertidig dipol", ord: ["midlertidig dipol"], x: SX, y: ST.L.y + 48, maal: [LX1 + 36, LY1 - 2], dele: ["top"],
              omr: [{ r: [LX0 - 40, LY1 - 40, LX1 - LX0 + 80, 70, 26] }],
              fejl: { "permanent dipol": "<b>permanent dipol</b> har et polært molekyle hele tiden. I pentan samles elektronerne kun et øjeblik i den ene ende.",
                      londonbinding: "<b>londonbinding</b> er tiltrækningen mellem to molekyler. Pladsen peger på det øverste molekyle med sine to ender.",
                      "dipol-dipolbinding": "<b>dipol-dipolbinding</b> er en tiltrækning mellem to molekyler. Pladsen peger på ét pentanmolekyle med δ− og δ+." } },
            { id: "londonbinding", ord: ["londonbinding"], x: SX, y: ST.L.y + 146, maal: [LX1 - 4, LM], via: [LX1 + 80, LM], dele: ["bund"],
              omr: [{ r: [LX0 - 6, LY1 + 24, 20, LY2 - LY1 - 48, 8] }, { r: [LX1 - 14, LY1 + 24, 20, LY2 - LY1 - 48, 8] }],
              fejl: { "midlertidig dipol": "<b>midlertidig dipol</b> er enderne på ét molekyle. Pladsen peger på prikkerne, hvor to pentanmolekyler tiltrækker hinanden.",
                      "dipol-dipolbinding": "<b>dipol-dipolbinding</b> kræver polære molekyler. Pentan er upolært og har kun en dipol et kort øjeblik.",
                      hydrogenbinding: "<b>hydrogenbinding</b> kræver H på O eller N. Pentan har kun C og H.",
                      "intermolekylær binding": "<b>intermolekylær binding</b> er fællesnavnet for alle tre slags. Her er navnet på netop prikkerne mellem to pentanmolekyler." } },

            { id: "permanent dipol", ord: ["permanent dipol"], x: SX, y: ST.D.y + 34, maal: [P2.o[0] + 16, DY - 6], dele: ["pdipol"],
              omr: [{ r: [P2.c[0] + 2, DY - 38, P2.o[0] - P2.c[0] + 18, 54, 12] }],
              fejl: { "midlertidig dipol": "<b>midlertidig dipol</b> varer kun et øjeblik. I propanon trækker O altid mest i elektronerne, så enderne er der hele tiden.",
                      "dipol-dipolbinding": "<b>dipol-dipolbinding</b> er tiltrækningen mellem to molekyler. Pladsen peger på δ+ og δ− i ét molekyle.",
                      hydrogenbinding: "<b>hydrogenbinding</b> er en tiltrækning mellem molekyler. Pladsen peger på δ+ og δ− i ét propanonmolekyle." } },
            { id: "dipol-dipolbinding", ord: ["dipol-dipolbinding"], x: SX, y: ST.D.y + 82, maal: [DDM, DY + 8], via: [DDM, ST.D.y + 100], dele: ["dd"],
              omr: [{ r: [DD[0] - 6, DY - 9, DD[1] - DD[0] + 12, 18, 9] }],
              fejl: { "permanent dipol": "<b>permanent dipol</b> er enderne på ét molekyle. Pladsen peger på de blå prikker mellem to propanonmolekyler.",
                      londonbinding: "<b>londonbinding</b> skyldes en dipol, der kun varer et øjeblik. De blå prikker går fra δ− på O til δ+ på C.",
                      hydrogenbinding: "<b>hydrogenbinding</b> kræver H på O eller N. Propanon har intet H på oxygen.",
                      "intermolekylær binding": "<b>intermolekylær binding</b> er fællesnavnet for alle tre slags. Her er navnet på netop de blå prikker." } },
            { id: "hydrogenbinding", ord: ["hydrogenbinding"], x: SX, y: ST.H.y + 56, maal: [HBM, HYY + 8], via: [HBM, ST.H.y + 88], dele: ["hb"],
              omr: [{ r: [HB[0] - 6, HYY - 9, HB[1] - HB[0] + 12, 18, 9] }],
              fejl: { "dipol-dipolbinding": "<b>dipol-dipolbinding</b> er de blå prikker ved C=O. Her sidder H på O og bliver tiltrukket af O i nabomolekylet.",
                      londonbinding: "<b>londonbinding</b> er den svageste slags. Her sidder H på O og bliver tiltrukket af O i nabomolekylet.",
                      "permanent dipol": "<b>permanent dipol</b> er enderne på ét molekyle. Pladsen peger på de røde prikker mellem to ethanolmolekyler.",
                      "intermolekylær binding": "<b>intermolekylær binding</b> er fællesnavnet for alle tre slags. Her er navnet på netop de røde prikker." } },

            { id: "intermolekylær binding", ord: ["intermolekylær binding"], x: HX, y: HY, maal: [FR.x, HY], titel: true, dele: ["ramme"],
              omr: [{ r: [FR.x, FR.y, FR.b, FR.h, 18], tom: true }],
              fejl: { londonbinding: "<b>londonbinding</b> er kun én af de tre slags. Overskriften gælder alle bindingerne mellem molekylerne i rammen.",
                      "dipol-dipolbinding": "<b>dipol-dipolbinding</b> er kun én af de tre slags. Overskriften gælder alle bindingerne mellem molekylerne i rammen.",
                      hydrogenbinding: "<b>hydrogenbinding</b> er kun én af de tre slags. Overskriften gælder alle bindingerne mellem molekylerne i rammen.",
                      hydrofob: "<b>hydrofob</b> siges om en carbonkæde. Overskriften gælder bindingerne mellem molekylerne i rammen." } },
            { id: "hydrofob", ord: ["hydrofob"], x: 0, y: KV.y + 34, maal: [0, 0], dele: ["fob"],
              fejl: { hydrofil: "<b>hydrofil</b> betyder vandelskende og passer på OH. Pladsen peger på carbonkæden, som kun kan danne londonbindinger.",
                      londonbinding: "<b>londonbinding</b> er en tiltrækning mellem molekyler. Pladsen spørger, hvordan carbonkæden opfører sig over for vand.",
                      "intermolekylær binding": "<b>intermolekylær binding</b> er en tiltrækning mellem molekyler. Pladsen peger på den lange carbonkæde." } },
            { id: "hydrofil", ord: ["hydrofil"], x: 1000, y: VY - 6, maal: [0, 0], dele: ["fil"],
              fejl: { hydrofob: "<b>hydrofob</b> betyder vandskyende og passer på carbonkæden. OH kan danne hydrogenbindinger til vand.",
                      hydrogenbinding: "<b>hydrogenbinding</b> er en tiltrækning mellem molekyler. Pladsen spørger, hvordan OH opfører sig over for vand." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var BE = bokse(ETH), BO = bokse(OCT);

            /* Pladserne forneden haenger paa boksene, der foerst kan maales nu */
            var fob = this.pladser.filter(function (p) { return p.id === "hydrofob"; })[0];
            var fil = this.pladser.filter(function (p) { return p.id === "hydrofil"; })[0];
            fob.x = BO.fob[0] + BO.fob[2] / 2;
            fob.maal = [fob.x, BO.fob[1] - 2];
            fob.omr = [{ r: [BO.fob[0], BO.fob[1], BO.fob[2], BO.fob[3], 14] }, { r: [BE.fob[0], BE.fob[1], BE.fob[2], BE.fob[3], 14] }];
            fil.maal = [BO.fil[0] + BO.fil[2] + 2, BO.fil[1] + BO.fil[3] / 2];
            fil.omr = [{ r: [BO.fil[0], BO.fil[1], BO.fil[2], BO.fil[3], 14] }, { r: [BE.fil[0], BE.fil[1], BE.fil[2], BE.fil[3], 14] }];

            function stribe(g, s, navn) {
                ORG.kortB(g, SB.x, s.y, SB.b, s.h);
                ORG.t(g, SB.x + 22, s.y + 28, navn, { fs: 17, fed: true, farve: F.accent, anker: "start" });
            }

            /* ----- Lag 1: pentan ------------------------------------------------ */
            api.del("baseL", {
                lag: 0, auto: true,
                fuld: function (g) { stribe(g, ST.L, "pentan"); }
            });
            api.del("top", {
                lag: 0,
                fuld: function (g) {
                    ORG.sky(g, TOP, LX0, LX1, true, -1, LS);
                    ORG.kugler(g, TOP);
                    ORG.delta(g, LX0 - 18, LY1 - 26, false, 16);
                    ORG.delta(g, LX1 + 18, LY1 - 26, true, 16);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("bund", {
                lag: 0,
                fuld: function (g) {
                    ORG.sky(g, BUND, LX0, LX1, true, 1, LS);
                    ORG.kugler(g, BUND);
                    ORG.delta(g, LX0 - 18, LY2 + 39, true, 16);
                    ORG.delta(g, LX1 + 18, LY2 + 39, false, 16);
                    var p1 = ORG.prikker(g, LX0 + 4, LY1 + 30, LX0 + 4, LY2 - 30, F.blaek);
                    var p2 = ORG.prikker(g, LX1 - 4, LY1 + 30, LX1 - 4, LY2 - 30, F.blaek);
                    return { p1: p1, p2: p2 };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); an.streg(r.p1, 200, 400); an.streg(r.p2, 200, 400); }
            });

            /* ----- Lag 2: propanon og ethanol ----------------------------------- */
            api.del("baseD", {
                lag: 1, auto: true,
                fuld: function (g) {
                    stribe(g, ST.D, "propanon");
                    [P1, P2].forEach(function (p) {
                        ORG.skelet(g, [[p.c[0], p.c[1]], [p.a[0], p.a[1]], [p.b[0], p.b[1]], [p.o[0], p.o[1], "O"]], [[0, 1], [0, 2], [0, 3, 2, 0]]);
                    });
                    ORG.delta(g, P1.c[0] + 13, DY - 13, true);
                    ORG.delta(g, P1.o[0], DY - 19, false);
                }
            });
            api.del("pdipol", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.delta(gg, P2.c[0] + 13, DY - 13, true);
                    ORG.delta(gg, P2.o[0], DY - 19, false);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("dd", {
                lag: 1,
                fuld: function (g) { return { p: ORG.prikker(g, DD[0], DY, DD[1], DY, F.neg) }; },
                byg: function (g, r, an) { an.streg(r.p, 0, 450); }
            });
            api.del("baseH", {
                lag: 1, auto: true,
                fuld: function (g) {
                    stribe(g, ST.H, "ethanol");
                    [E1, E2].forEach(function (e) {
                        ORG.skelet(g, [[e.c0[0], e.c0[1]], [e.c1[0], e.c1[1]], [e.o[0], e.o[1], "O"], [e.h[0], e.h[1], "H"]], [[0, 1], [1, 2], [2, 3]]);
                    });
                }
            });
            api.del("hb", {
                lag: 1,
                fuld: function (g) { return { p: ORG.prikker(g, HB[0], HYY, HB[1], HYY, F.proton) }; },
                byg: function (g, r, an) { an.streg(r.p, 0, 450); }
            });

            /* ----- Lag 3: rammen og vandet -------------------------------------- */
            api.del("ramme", {
                lag: 2,
                fuld: function (g) {
                    var r = SV.el("rect", { x: FR.x, y: FR.y, width: FR.b, height: FR.h, rx: 18, fill: "none", stroke: F.accent, "stroke-width": 2.2 }, g);
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("baseV", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KV.x, KV.y, KV.b, KV.h);
                    var xe = (BE.fob[0] + BE.fil[0] + BE.fil[2]) / 2, xo = (BO.fob[0] + BO.fil[0] + BO.fil[2]) / 2;
                    ORG.t(g, xe, KV.y + KV.h - 50, "ethanol", { fs: 18, fed: true });
                    ORG.t(g, xe, KV.y + KV.h - 26, "blandes med vand i alle forhold", { fs: 14.5, farve: F.daempet });
                    ORG.t(g, xo, KV.y + KV.h - 50, "octan-1-ol", { fs: 18, fed: true });
                    ORG.t(g, xo, KV.y + KV.h - 26, "opløses næsten ikke i vand", { fs: 14.5, farve: F.daempet });
                }
            });
            function kaede(g, P) {
                var at = P.map(function (p, i) { return i === P.length - 1 ? [p[0], p[1], "O", { farve: "rgba(0,0,0,0)" }] : [p[0], p[1]]; });
                var bi = [];
                for (var i = 0; i < P.length - 1; i++) bi.push([i, i + 1]);
                ORG.skelet(g, at, bi);
            }
            api.del("fob", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [BE, BO].forEach(function (b) {
                        SV.el("rect", { x: b.fob[0], y: b.fob[1], width: b.fob[2], height: b.fob[3], rx: 14, fill: "#fbe7a6", "fill-opacity": 0.75, stroke: F.hydrofobKant, "stroke-width": 1.6 }, gg);
                    });
                    kaede(gg, ETH);
                    kaede(gg, OCT);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
            api.del("fil", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [BE, BO].forEach(function (b) {
                        SV.el("rect", { x: b.fil[0], y: b.fil[1], width: b.fil[2], height: b.fil[3], rx: 14, fill: "#dbe7fb", "fill-opacity": 0.9, stroke: F.hydrofilKant, "stroke-width": 1.6 }, gg);
                        var wO = NK.tekstBredde("O", 20, 700);
                        SV.tekst(gg, b.o[0] - wO / 2, b.o[1] + 7.2, "OH", { "font-size": 20, "font-weight": 700, fill: F.blaek, "text-anchor": "start" });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

/* =====================================================================
   fig_poly.js - figuren til B7.3 Disaccharider og polysaccharider

   Øverst bogens b7-maltose-dannelse og b7-hydrolyse samlet: to
   glucosemolekyler med de to grønne OH-grupper, der reagerer, og maltose
   og vand. Mellem dem en pil mod højre (kondensation, fagordet fra B4.5
   igen) og en pil mod venstre (hydrolyse). Pladsen glykosidbinding peger
   ned mellem ringene på det grønne oxygenatom i maltose, og maltose er
   skiltet under kortet. Bogens overskrift "To α-D-glucose" er blevet til
   "glucose" under hver ring.
   I midten bogens b7-disaccharider: lactose og saccharose med navnene på
   enhederne under ringene og bindingens navn ved oxygenatomet.
   Forneden bogens b7-polysaccharider med ét kort pr. stof: amylose som
   spiral, amylopectin og glykogen som træer med få og mange
   forgreninger, og cellulose som lige kæder med hydrogenbindinger.
   stivelse er titlen på en ramme om amylose og amylopectin, og
   polysaccharid er overskrift til venstre for båndet med alle fire.
   Bogens linjer under kortene ("en kæde, der snor sig") er taget af.
   Elleve fagord, kondensation og polysaccharid igen i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KH = NK.KH;
    var F = KH.F;
    var G = F.accent;

    /* ----- Lag 1: kondensation og hydrolyse ------------------------------ */
    var KA = { x: 20, y: 60, b: 472, h: 222 };                  /* to glucose */
    var KB = { x: 712, y: 60, b: 334, h: 222 };                 /* maltose */
    var CY1 = KA.y + 100;
    var G1 = 152, G2 = 380;                                      /* de to glucoseringe */
    var M1 = KB.x + 92, M2 = M1 + 132;                           /* maltose */
    var PX1 = 520, PX2 = 690, PYK = 142, PYH = 184;              /* pilene */
    var BRO = [(M1 + 46 + M2 - 46) / 2, CY1 + 30];              /* oxygenatomet i glykosidbindingen */

    /* ----- Lag 2: lactose og saccharose ---------------------------------- */
    var KC = { x: 20, y: 326, b: 560, h: 196 }, KD = { x: 600, y: 326, b: 560, h: 196 };
    var DI = {
        lactose: { k: KC, enheder: [KH.uden(KH.GAL_B, "1op"), KH.med(KH.uden(KH.GLC_B, "4ned"), { vend: "lr" })], broer: [[0, "1", 1, "4", false]],
                   navne: ["galactose", "glucose"], binding: "β-1,4" },
        saccharose: { k: KD, enheder: [KH.uden(KH.GLC_A, "1ned"), KH.med(KH.uden(KH.FRU_B, "2op"), { vend: "fb", dx: 34 })], broer: [[0, "1", 1, "2", true]],
                      navne: ["glucose", "fructose"], binding: "α-1,β-2" }
    };
    /* Hvor tegningen skal flyttes hen, saa den staar midt paa kortet */
    Object.keys(DI).forEach(function (n) {
        var d = DI[n];
        var r = KH.ringe(SV.el("g"), 0, 0, d.enheder, d.broer, {});
        var top = Math.min(r.kasse[1], r.oer[0][1] - 20), bund = r.kasse[3] + 24;
        d.dx = d.k.x + d.k.b / 2 - (r.kasse[0] + r.kasse[2]) / 2;
        d.dy = d.k.y + (d.k.h - 30) / 2 - (top + bund) / 2;
        d.maal = r;
    });

    /* ----- Lag 3 og 4: polysacchariderne --------------------------------- */
    var BAAND = { x: 232, y: 562, b: 928, h: 244 };
    var STIV = { x: 246, y: 574, b: 446, h: 220 };
    var PK = { y: 602, h: 166, b: 205 };
    var KAMY = { x: 258, y: PK.y, b: PK.b, h: PK.h }, KPEC = { x: 475, y: PK.y, b: PK.b, h: PK.h };
    var KGLY = { x: 706, y: PK.y, b: 212, h: PK.h }, KCEL = { x: 932, y: PK.y, b: 212, h: PK.h };

    function navn(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18] }], fejl: fejl };
    }
    /* Et trae af sekskanter midt paa kortet (over navneskiltet) */
    function midtTrae(g, k, gren, r, af) {
        var enh = KH.trae(SV.el("g"), gren, r, af);
        var xs = enh.map(function (p) { return p[0]; }), ys = enh.map(function (p) { return p[1]; });
        var dx = k.x + k.b / 2 - (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
        var dy = k.y + (k.h - 22) / 2 - (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
        var gg = SV.g(g, { transform: "translate(" + dx.toFixed(1) + " " + dy.toFixed(1) + ")" });
        KH.trae(gg, gren, r, af);
        return gg;
    }

    var POLYFEJL = {
        amylose: "<b>amylose</b> er en lang kæde uden forgreninger, der snor sig som en spiral.",
        amylopectin: "<b>amylopectin</b> er den del af stivelse, hvor kæden forgrener sig med jævne mellemrum.",
        glykogen: "<b>glykogen</b> har mange forgreninger og er dyrenes lager. Det er ikke en del af stivelse.",
        cellulose: "<b>cellulose</b> består af lige kæder side om side, som holdes sammen af hydrogenbindinger."
    };
    function polyFejl(selv) {
        var f = {};
        Object.keys(POLYFEJL).forEach(function (o) { if (o !== selv) f[o] = POLYFEJL[o]; });
        return f;
    }

    NK.FIGURER.poly = {
        vb: [1180, 818],
        lag: [
            { navn: "Glykosidbindingen", pladser: ["kondensation", "hydrolyse", "glykosidbinding"],
              ros: "Ved kondensationen dannes glykosidbindingen, og der fraspaltes vand. Ved hydrolysen spalter vand bindingen igen." },
            { navn: "Tre disaccharider", pladser: ["maltose", "lactose", "saccharose"],
              ros: "Maltose består af to glucoseenheder, lactose af galactose og glucose og saccharose af glucose og fructose." },
            { navn: "Stivelse", pladser: ["stivelse", "amylose", "amylopectin"],
              ros: "Stivelse er en blanding af amylose, der snor sig, og amylopectin, der har forgreninger." },
            { navn: "Glykogen og cellulose", pladser: ["glykogen", "cellulose", "polysaccharid"],
              ros: "Glykogen har mange forgreninger, og cellulose består af lige kæder. De fire stoffer i figuren er alle polysaccharider af glucose." }
        ],
        pladser: [
            /* Lag 1 */
            { id: "kondensation", ord: ["kondensation"], x: (PX1 + PX2) / 2, y: 96, maal: [(PX1 + PX2) / 2, PYK - 6], dele: ["pilK"],
              omr: [{ r: [PX1 - 6, PYK - 13, PX2 - PX1 + 12, 26, 9] }],
              fejl: { hydrolyse: "<b>hydrolyse</b> spalter en binding med vand. Pilen her går fra to glucosemolekyler til maltose og vand.",
                      glykosidbinding: "<b>glykosidbinding</b> er broen C−O−C. Pladsen peger på pilen fra to glucose til maltose og vand." } },
            { id: "hydrolyse", ord: ["hydrolyse"], x: (PX1 + PX2) / 2, y: 232, maal: [(PX1 + PX2) / 2, PYH + 6], dele: ["pilH"],
              omr: [{ r: [PX1 - 6, PYH - 13, PX2 - PX1 + 12, 26, 9] }],
              fejl: { kondensation: "<b>kondensation</b> sætter to molekyler sammen og fraspalter vand. Pilen her går fra maltose og vand til to glucosemolekyler.",
                      glykosidbinding: "<b>glykosidbinding</b> er broen C−O−C. Pladsen peger på pilen, hvor vand spalter maltose." } },
            { id: "glykosidbinding", ord: ["glykosidbinding"], x: BRO[0], y: 26, maal: [BRO[0], BRO[1] - 14], dele: ["bro"],
              omr: [{ r: [BRO[0] - 26, CY1 - 8, 52, 50, 12] }],
              fejl: { kondensation: "<b>kondensation</b> er en reaktion. Pladsen peger på oxygenatomet mellem de to ringe i maltose.",
                      hydrolyse: "<b>hydrolyse</b> er en reaktion. Pladsen peger på broen C−O−C mellem de to ringe i maltose." } },

            /* Lag 2 */
            navn("maltose", KB, ["malt"], {
                lactose: "<b>lactose</b> er galactose og glucose. Maltose dannes af de to glucosemolekyler til venstre.",
                saccharose: "<b>saccharose</b> har en ring med fem atomer. Begge ringe i dette disaccharid har seks atomer." }),
            navn("lactose", KC, ["lact"], {
                maltose: "<b>maltose</b> er to glucoseenheder. Se navnene under ringene i dette kort.",
                saccharose: "<b>saccharose</b> er glucose og fructose. Se navnene under ringene i dette kort." }),
            navn("saccharose", KD, ["sacc"], {
                maltose: "<b>maltose</b> er to glucoseenheder. Se navnene under ringene i dette kort.",
                lactose: "<b>lactose</b> er galactose og glucose. Se navnene under ringene i dette kort." }),

            /* Lag 3 */
            { id: "stivelse", ord: ["stivelse"], x: STIV.x + STIV.b / 2, y: STIV.y, maal: [STIV.x + STIV.b / 2, STIV.y], titel: true, dele: ["stiv"],
              omr: [{ r: [STIV.x - 4, STIV.y - 4, STIV.b + 8, STIV.h + 8, 18], tom: true }],
              fejl: { amylose: "<b>amylose</b> er kun den ene del. Rammen er om både spiralen og kæden med forgreninger.",
                      amylopectin: "<b>amylopectin</b> er kun den ene del. Rammen er om både spiralen og kæden med forgreninger.",
                      glykogen: "<b>glykogen</b> er dyrenes lager. Rammen er om planternes blanding af to polysaccharider.",
                      polysaccharid: "<b>polysaccharid</b> gælder alle fire kort. Rammen er kun om de to første." } },
            navn("amylose", KAMY, ["spiral"], polyFejl("amylose")),
            navn("amylopectin", KPEC, ["trae1"], polyFejl("amylopectin")),

            /* Lag 4 */
            navn("glykogen", KGLY, ["trae2"], polyFejl("glykogen")),
            navn("cellulose", KCEL, ["cell"], polyFejl("cellulose")),
            { id: "polysaccharid", ord: ["polysaccharid"], x: 124, y: BAAND.y + BAAND.h / 2, maal: [BAAND.x, BAAND.y + BAAND.h / 2], titel: true, dele: ["baand"],
              omr: [{ r: [BAAND.x - 4, BAAND.y - 4, BAAND.b + 8, BAAND.h + 8, 18], tom: true }],
              fejl: { stivelse: "<b>stivelse</b> består kun af amylose og amylopectin. Overskriften gælder alle fire kæder af sukkerenheder.",
                      glykogen: "<b>glykogen</b> er kun det ene kort. Overskriften gælder alle fire lange kæder af sukkerenheder.",
                      cellulose: "<b>cellulose</b> er kun det ene kort. Overskriften gælder alle fire lange kæder af sukkerenheder." } }
        ],

        tegn: function (api) {
            KH.defs();

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KA.x, KA.y, KA.b, KA.h);
                    ORG.kortB(g, KB.x, KB.y, KB.b, KB.h);
                    var r1 = KH.ring(SV.el("g"), G1, CY1, KH.med(KH.GLC_A, { farver: { "1ned": G } }));
                    var m = r1.gruppe("1ned"); KH.glod(g, m[0], m[1], 16, 11, G, 0.32);
                    KH.ring(g, G1, CY1, KH.med(KH.GLC_A, { farver: { "1ned": G } }));
                    var r2 = KH.ring(SV.el("g"), G2, CY1, KH.med(KH.GLC_A, { farver: { "4ned": G } }));
                    m = r2.gruppe("4ned"); KH.glod(g, m[0], m[1], 16, 11, G, 0.32);
                    KH.ring(g, G2, CY1, KH.med(KH.GLC_A, { farver: { "4ned": G } }));
                    KH.t(g, (G1 + G2) / 2, CY1 + 8, "+", 24, { farve: F.daempet });
                    [G1, G2].forEach(function (x) { KH.t(g, x, KA.y + KA.h - 26, "glucose", 14, { farve: F.daempet }); });
                    KH.ringe(g, M1, CY1, [KH.uden(KH.GLC_A, "1ned"), KH.uden(KH.GLC_A, "4ned")], [[0, "1", 1, "4", true]], { uden: "bro" });
                    KH.t(g, KB.x + KB.b + 26, CY1 + 8, "+", 24, { farve: F.daempet });
                    KH.t(g, KB.x + KB.b + 78, CY1 + 9, "H_2O", 22, { farve: G, fed: true });
                }
            });
            api.del("pilK", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); ORG.reaktionspil(gg, PX1, PX2, PYK, { farve: F.blaek }); return { g: gg }; },
                byg: function (g, r, an) { an.glid(r.g, -30, 0, 0, 500); }
            });
            api.del("pilH", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); ORG.reaktionspil(gg, PX2, PX1, PYH, { farve: F.blaek }); return { g: gg }; },
                byg: function (g, r, an) { an.glid(r.g, 30, 0, 0, 500); }
            });
            api.del("bro", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    var r = KH.ringe(SV.el("g"), M1, CY1, [KH.uden(KH.GLC_A, "1ned"), KH.uden(KH.GLC_A, "4ned")], [[0, "1", 1, "4", true]], {});
                    var b = r.oer[0];
                    KH.glod(gg, b[0], b[1], 13, 12, G, 0.32);
                    KH.bro(gg, b[2], b[3], true, { oFarve: G });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) { ORG.kortB(g, KC.x, KC.y, KC.b, KC.h); ORG.kortB(g, KD.x, KD.y, KD.b, KD.h); }
            });
            api.del("malt", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [M1, M2].forEach(function (x) { KH.t(gg, x, KB.y + KB.h - 26, "glucose", 14, { farve: F.daempet }); });
                    KH.t(gg, BRO[0], BRO[1] + 25, "α-1,4", 14, { farve: G, fed: true });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
            [["lact", "lactose"], ["sacc", "saccharose"]].forEach(function (dn) {
                api.del(dn[0], {
                    lag: 1,
                    fuld: function (g) {
                        var d = DI[dn[1]];
                        var gg = SV.g(g, { transform: "translate(" + d.dx.toFixed(1) + " " + d.dy.toFixed(1) + ")" });
                        var r = KH.ringe(gg, 0, 0, d.enheder, d.broer, { glod: true, oFarve: G });
                        var o = r.oer[0], ned = d.broer[0][4];
                        KH.t(gg, o[0], o[1] + (ned ? 25 : -15), d.binding, 14, { farve: G, fed: true });
                        var bund = r.kasse[3] + 20;
                        r.hjs.forEach(function (hj, i) {
                            var xs = Object.keys(hj).map(function (k) { return hj[k][0]; });
                            KH.t(gg, (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, bund, d.navne[i], 14, { farve: F.daempet });
                        });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.fade(r.g, 0, 500); }
                });
            });

            /* ----- Lag 3 og 4: polysacchariderne ------------------------------- */
            api.del("baand", {
                lag: 3,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: BAAND.x, y: BAAND.y, width: BAAND.b, height: BAAND.h, rx: 18, fill: "none", stroke: G, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });
            api.del("stiv", {
                lag: 2,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: STIV.x, y: STIV.y, width: STIV.b, height: STIV.h, rx: 16, fill: "none", stroke: F.sukker, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 700); }
            });
            api.del("base3", {
                lag: 2, auto: true,
                fuld: function (g) { ORG.kortB(g, KAMY.x, KAMY.y, KAMY.b, KAMY.h); ORG.kortB(g, KPEC.x, KPEC.y, KPEC.b, KPEC.h); }
            });
            api.del("base4", {
                lag: 3, auto: true,
                fuld: function (g) { ORG.kortB(g, KGLY.x, KGLY.y, KGLY.b, KGLY.h); ORG.kortB(g, KCEL.x, KCEL.y, KCEL.b, KCEL.h); }
            });
            api.del("spiral", {
                lag: 2,
                fuld: function (g) { var gg = SV.g(g); KH.spiral(gg, KAMY.x + 16, KAMY.x + KAMY.b - 16, KAMY.y + 80, { A: 32, prTur: 6, ture: 3.4, r: 8.4 }); return { g: gg }; },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
            api.del("trae1", {
                lag: 2,
                fuld: function (g) {
                    return { g: midtTrae(g, KPEC, [0, 0, 0, 7, [[1, [-60, 3, [[2, [0, 2, []]]]]], [4, [-60, 3, [[2, [0, 2, []]]]]]]], 7.4, 19) };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
            api.del("trae2", {
                lag: 3,
                fuld: function (g) {
                    return { g: midtTrae(g, KGLY, [0, 0, 0, 7, [
                        [0, [-60, 4, [[3, [0, 2, []]]]]], [3, [-60, 2, [[1, [0, 2, []]]]]],
                        [1, [60, 4, [[3, [0, 2, []]]]]], [4, [60, 2, [[1, [0, 2, []]]]]]]], 7.4, 17) };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
            api.del("cell", {
                lag: 3,
                fuld: function (g) {
                    var gg = SV.g(g), x0 = KCEL.x + 32, d = 21;
                    var xs = [0, 1, 2, 3, 4, 5, 6, 7].map(function (i) { return x0 + d * i; });
                    var rk = [KCEL.y + 46, KCEL.y + 80, KCEL.y + 114];
                    rk.forEach(function (y, j) {
                        if (j < 2) for (var i = 1; i < 8; i += 2) KH.hbinding(gg, xs[i] - 4, y + 10, xs[i] - 4, rk[j + 1] - 10);
                    });
                    rk.forEach(function (y) {
                        KH.linje(gg, xs[0] - 12, y, xs[7] + 12, y, F.sukker, 2.2);
                        xs.forEach(function (x) { KH.hex(gg, x, y, 9.4); });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
        }
    };
}());

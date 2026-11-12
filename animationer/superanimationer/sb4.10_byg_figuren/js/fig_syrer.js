/* =====================================================================
   fig_syrer.js - figuren til B4.4 Carboxylsyrer

   Foroven bogens b4-carboxylsyrer: methansyre, ethansyre, propansyre og
   butansyre i et bånd med stofklassen carboxylsyre som overskrift til
   venstre og carboxylgruppen i grønt. Forneden til venstre bogens
   b4-syre-base: ethansyre og vand i ligevægt med ethanoat-ion og
   oxonium. Pladsen svag syre sidder ved ethansyre som bogens "en svag
   syre" under molekylet; carboxylsyre er overskriften for hele rækken
   foroven, så de to ord står på hver sin ting. Forneden til højre et
   natriumsalt af en fedtsyre (sæbe) med en lang kæde.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var HX = 113, BX = 222;
    var BAAND = [BX, 16, 924, 210];
    var CX = [BX + 112, BX + 340, BX + 568, BX + 800];      /* cellernes midte */
    var L = 36, MY = 108, NY = 178;
    /* De fire syrer: kaeden ender i carboxylcarbonatomet C, O op og OH ned til hoejre */
    function syre(x, n) {
        /* n carbonatomer i kaeden foer carboxylcarbonatomet; x er carboxylcarbonatomets plads */
        var c = [x, MY - 6];
        var kaede = [];
        var p = c;
        for (var i = 0; i < n; i++) { p = ORG.fra(p, L, i % 2 === 0 ? 150 : 210); kaede.push(p); }
        return { c: c, o: ORG.fra(c, L, -90), oh: ORG.fra(c, L, 30), kaede: kaede };
    }
    var SY = [syre(CX[0] + 2, 0), syre(CX[1] + 22, 1), syre(CX[2] + 32, 2), syre(CX[3] + 48, 3)];
    function cooh(s) {
        var w = NK.tekstBredde("OH", 20, 700), wO = NK.tekstBredde("O", 20, 700);
        return [s.c[0] - 15, s.o[1] - 17, s.oh[0] - s.c[0] + w - wO / 2 + 24, s.oh[1] - s.o[1] + 34];
    }
    var BOKSE = SY.map(cooh);

    /* Ligevaegten og sæben */
    var KL = { x: 14, y: 256, b: 660, h: 300 }, KS = { x: 690, y: 256, b: 456, h: 300 };
    var LY = KL.y + 168;
    var ES = { c: [KL.x + 110, LY - 4] };
    ES.a = ORG.fra(ES.c, L, 150); ES.o = ORG.fra(ES.c, L, -90); ES.oh = ORG.fra(ES.c, L, 30); ES.h = ORG.fra(ES.oh, 30, -30);
    var EI = { c: [KL.x + 420, LY - 4] };
    EI.a = ORG.fra(EI.c, L, 150); EI.o = ORG.fra(EI.c, L, -90); EI.om = ORG.fra(EI.c, L, 30);
    var ES_BOKS = [ES.a[0] - 16, ES.o[1] - 16, ES.h[0] - ES.a[0] + 32, ES.oh[1] - ES.o[1] + 34];
    var SAEBE = ORG.zz(KS.x + 36, KS.y + 150, 17, 21, -30);
    var SC = SAEBE[16];

    NK.FIGURER.syrer = {
        vb: [1160, 572],
        lag: [
            { navn: "Stofklassen", pladser: ["carboxylsyre", "carboxylgruppe"],
              ros: "Alle fire stoffer er carboxylsyrer. Carboxylgruppen −COOH har C=O og OH på samme carbonatom." },
            { navn: "Syre og sæbe", pladser: ["svag syre", "sæbe"],
              ros: "Ethansyre er en svag syre, så kun en lille del af molekylerne afgiver en hydron. Sæbe er natriumsalte af fedtsyrer." }
        ],
        pladser: [
            { id: "carboxylsyre", ord: ["carboxylsyre"], x: HX, y: 64, maal: [BX, 64], titel: true, dele: ["baand"],
              omr: [{ r: [BAAND[0], BAAND[1], BAAND[2], BAAND[3], 16], tom: true }],
              fejl: { "svag syre": "<b>svag syre</b> siger, hvor meget stoffet afgiver hydroner i vand. Overskriften er stofklassen for stofferne med −COOH.",
                      carboxylgruppe: "<b>carboxylgruppe</b> er kun −COOH. Overskriften gælder hele stofferne i rækken.",
                      "sæbe": "<b>sæbe</b> er natriumsalte af fedtsyrer. Overskriften er stofklassen for stofferne med −COOH." } },
            { id: "carboxylgruppe", ord: ["carboxylgruppe"], x: HX, y: 160, maal: [BOKSE[0][0] - 2, MY - 22], via: [BX - 12, 160], dele: ["bokse"],
              omr: BOKSE.map(function (b) { return { r: [b[0], b[1], b[2], b[3], 14] }; }),
              fejl: { carboxylsyre: "<b>carboxylsyre</b> er hele stoffet. Pladsen peger kun på −COOH.",
                      "svag syre": "<b>svag syre</b> siges om hele stoffet. Pladsen peger kun på gruppen −COOH.",
                      "sæbe": "<b>sæbe</b> er et salt. Pladsen peger på gruppen −COOH i syrerne." } },

            { id: "svag syre", ord: ["svag syre"], x: ES.c[0] + 10, y: KL.y + 44, maal: [ES.c[0] + 10, ES_BOKS[1] - 2], dele: ["ethansyre"],
              omr: [{ r: [ES_BOKS[0], ES_BOKS[1], ES_BOKS[2], ES_BOKS[3], 14] }],
              fejl: { carboxylsyre: "<b>carboxylsyre</b> passer også på ethansyre og står foran rækken foroven. Pladsen spørger, hvor meget ethansyre afgiver hydroner.",
                      "sæbe": "<b>sæbe</b> er natriumsalte af fedtsyrer. Pladsen peger på ethansyre, hvor kun få molekyler afgiver en hydron.",
                      carboxylgruppe: "<b>carboxylgruppe</b> er kun −COOH. Pladsen peger på hele stoffet i ligevægten." } },
            { id: "sæbe", ord: ["sæbe"], x: KS.x + KS.b / 2, y: KS.y, maal: [KS.x + KS.b / 2, KS.y], titel: true, dele: ["saebe"],
              omr: [{ r: [KS.x - 5, KS.y - 5, KS.b + 10, KS.h + 10, 18], tom: true }],
              fejl: { carboxylsyre: "<b>carboxylsyre</b> har −COOH. Her har syren afgivet sin hydron, og baseformen sidder sammen med Na⁺.",
                      "svag syre": "<b>svag syre</b> afgiver kun få hydroner. Kortet viser natriumsaltet af en fedtsyre.",
                      carboxylgruppe: "<b>carboxylgruppe</b> er −COOH. Kortet viser natriumsaltet af en fedtsyre med en lang kæde." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var T = { farve: F.accent };
            function syreTegn(g, s, h) {
                var at = [[s.c[0], s.c[1]], [s.o[0], s.o[1], "O", T], [s.oh[0], s.oh[1], "OH", { anker: "start", farve: F.accent }]];
                var bi = [[0, 1, 2, 0, F.accent], [0, 2, 1, 0, F.accent]];
                var forrige = 0;
                s.kaede.forEach(function (p) { at.push([p[0], p[1]]); bi.push([forrige, at.length - 1]); forrige = at.length - 1; });
                if (h) { at.push([h[0], h[1], "H", { farve: F.accent }]); bi.push([0, at.length - 1, 1, 0, F.accent]); }
                ORG.skelet(g, at, bi);
            }

            /* ----- Lag 1: rækken af syrer --------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var navne = [["methansyre", "myresyre"], ["ethansyre", "eddikesyre"], ["propansyre", "propionsyre"], ["butansyre", "smørsyre"]];
                    CX.forEach(function (x, i) { ORG.navn(g, x, NY, navne[i][0], navne[i][1]); });
                    syreTegn(g, SY[0], ORG.fra(SY[0].c, L, 150));
                    SY.slice(1).forEach(function (s) { syreTegn(g, s); });
                }
            });
            api.del("baand", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: BAAND[0], y: BAAND[1], width: BAAND[2], height: BAAND[3], rx: 16, fill: "rgba(15,118,110,0.04)", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("bokse", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); BOKSE.forEach(function (b) { ORG.boks(gg, b[0], b[1], b[2], b[3], { rx: 14 }); }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: ligevægten og sæben ------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KL.x, KL.y, KL.b, KL.h);
                    ORG.kortB(g, KS.x, KS.y, KS.b, KS.h);
                    ORG.plus(g, KL.x + 218, LY);
                    ORG.f(g, KL.x + 262, LY, "H_2O");
                    ORG.reaktionspil(g, KL.x + 300, KL.x + 360, LY, { lig: true });
                    ORG.skelet(g, [[EI.c[0], EI.c[1]], [EI.a[0], EI.a[1]], [EI.o[0], EI.o[1], "O", T], [EI.om[0], EI.om[1], "O^−", { anker: "start", farve: F.accent }]],
                        [[0, 1], [0, 2, 2, 0, F.accent], [0, 3, 1, 0, F.accent]]);
                    ORG.plus(g, KL.x + 512, LY);
                    ORG.f(g, KL.x + 572, LY, "H_3O^+", { farve: F.pos });
                    ORG.navn(g, ES.c[0] + 4, KL.y + 250, "ethansyre");
                    ORG.navn(g, EI.c[0] + 10, KL.y + 250, "ethanoat-ion");
                    /* sæben */
                    var at = SAEBE.map(function (p) { return [p[0], p[1]]; });
                    var bi = [];
                    for (var i = 0; i < 16; i++) bi.push([i, i + 1]);
                    at.push([SC[0], SC[1] - 34, "O", T]); bi.push([16, at.length - 1, 2, 0, F.accent]);
                    var om = ORG.fra(SC, 34, 30);
                    at.push([om[0], om[1], "O^−", { anker: "start", farve: F.accent }]); bi.push([16, at.length - 1, 1, 0, F.accent]);
                    ORG.skelet(g, at, bi, { fs: 18 });
                    ORG.f(g, om[0] + 54, om[1], "Na^+", { farve: "#6d3fb5", fs: 19 });
                    ORG.navn(g, KS.x + KS.b / 2, KS.y + 250, "natriumstearat");
                }
            });
            api.del("ethansyre", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    syreTegn(gg, { c: ES.c, o: ES.o, oh: ES.oh, kaede: [ES.a] });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("saebe", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: KS.x, y: KS.y, width: KS.b, height: KS.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
        }
    };
}());

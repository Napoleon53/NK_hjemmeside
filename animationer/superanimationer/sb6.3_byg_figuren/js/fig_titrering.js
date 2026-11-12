/* =====================================================================
   fig_titrering.js - figuren til B6.8 Titrering af en svag syre

   Til venstre opstillingen fra C-bogens titrering-opstilling (stativ,
   burette med 0,100 M NaOH, konisk kolbe med 25,0 mL 0,100 M ethansyre
   paa en magnetomroerer) uden navnene paa delene. Titrering er titlen paa
   kortet. I lag 3 kommer en draabeflaske med phenolphthalein, og
   indikator peger paa den.
   Til hoejre bogens b6-titrerkurve og b6-indikatorer i én graf: kurven
   er regnet som i bogen (b6_ph), aekvivalenspunktet ved 25,0 mL og
   pH 8,73 og halvaekvivalenspunktet ved 12,5 mL og pH = pKₛ = 4,76.
   Teksterne "puffer: halvækvivalens" og "ækvivalenspunkt: kun svag base"
   er taget af (de er pladserne), og kun den lodrette, stiplede linje ved
   25,0 mL er blevet, saa pladsen under kurven har plads. Phenolphthaleins
   baand fra 8,2 til 10,0 ligger bag kurven; de to andre indikatorer er
   taget ud.
   Seks fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B6 = NK.B6;
    var C = B6.F;

    /* ----- Opstillingen ----------------------------------------------------- */
    var RA = { x: 20, y: 30, b: 420, h: 590 };
    var BX = 160, BTOP = 96, BBUND = 378, FOD = 574, KB = 540;
    var DF = { x: 330, y: 516, b: 44, h: 70 };            /* draabeflasken */

    /* ----- Grafen --------------------------------------------------------- */
    var RB = { x: 460, y: 30, b: 680, h: 590 };
    var GA = { xa: 544, xb: 1100, ya: 78, yb: 520, xmax: 40, ymax: 14 };
    function X(v) { return GA.xa + (GA.xb - GA.xa) * v / GA.xmax; }
    function Y(p) { return GA.yb - (GA.yb - GA.ya) * p / GA.ymax; }
    var PUNKTER = B6.titrerpunkter(40, 0.00250, 0.0250, 0.100, 4.76);
    var HALV = [X(12.5), Y(4.76)], AEKV = [X(25), Y(8.73)];

    NK.FIGURER.titrering = {
        vb: [1160, 640],
        lag: [
            { navn: "Metoden og kurven", pladser: ["titrering", "titrerkurve"],
              ros: "Ved en titrering tilsættes base fra buretten til kolben. Titrerkurven viser pH som funktion af det tilsatte rumfang." },
            { navn: "To punkter på kurven", pladser: ["ækvivalenspunkt", "halvækvivalenspunkt"],
              ros: "Ved 25,0 mL har den tilsatte base og syren samme stofmængde. Ved 12,5 mL er der tilsat halvt så meget base, og pH er lig med pKₛ." },
            { navn: "Farveskiftet", pladser: ["indikator", "omslagsområde"],
              ros: "Phenolphthalein skifter farve fra pH 8,2 til 10,0. Omslagsområdet ligger i kurvens lodrette spring." }
        ],
        pladser: [
            { id: "titrering", ord: ["titrering"], x: RA.x + RA.b / 2, y: RA.y, maal: [RA.x + RA.b / 2, RA.y], titel: true, dele: ["opstilling"],
              omr: [{ r: [RA.x - 4, RA.y - 4, RA.b + 8, RA.h + 8, 18], tom: true }],
              fejl: { "titrerkurve": "<b>titrerkurve</b> er en graf. Overskriften gælder opstillingen med burette og kolbe.",
                      "indikator": "<b>indikator</b> er et stof med to farver. Overskriften gælder hele opstillingen med burette og kolbe." } },
            { id: "titrerkurve", ord: ["titrerkurve"], x: RB.x + RB.b / 2, y: RB.y, maal: [RB.x + RB.b / 2, RB.y], titel: true, dele: ["kurve"],
              omr: [{ r: [RB.x - 4, RB.y - 4, RB.b + 8, RB.h + 8, 18], tom: true }],
              fejl: { "titrering": "<b>titrering</b> er selve metoden. Overskriften gælder grafen med pH op ad aksen.",
                      "omslagsområde": "<b>omslagsområde</b> er et pH-interval. Overskriften gælder hele grafen." } },

            { id: "ækvivalenspunkt", ord: ["ækvivalenspunkt"], x: 1018, y: 420, maal: [AEKV[0] + 6, AEKV[1] + 5], dele: ["aekv"],
              omr: [{ c: [AEKV[0], AEKV[1], 15] }],
              fejl: { "halvækvivalenspunkt": "<b>halvækvivalenspunkt</b> ligger, hvor pH er lig med pKₛ. Pladsen peger på punktet ved 25,0 mL.",
                      "omslagsområde": "<b>omslagsområde</b> er et pH-interval. Pladsen peger på ét punkt på kurven ved 25,0 mL." } },
            { id: "halvækvivalenspunkt", ord: ["halvækvivalenspunkt"], x: 762, y: 470, maal: [HALV[0] + 2, HALV[1] + 7], dele: ["halv"],
              omr: [{ c: [HALV[0], HALV[1], 15] }],
              fejl: { "ækvivalenspunkt": "<b>ækvivalenspunkt</b> ligger midt på det lodrette spring. Pladsen peger på punktet ved 12,5 mL.",
                      "omslagsområde": "<b>omslagsområde</b> er et pH-interval. Pladsen peger på ét punkt på kurven ved 12,5 mL." } },

            { id: "indikator", ord: ["indikator"], x: 300, y: 300, maal: [DF.x + DF.b / 2, DF.y - 22], dele: ["flaske"],
              omr: [{ r: [DF.x - 12, DF.y - 26, DF.b + 24, DF.h + 50, 10] }],
              fejl: { "omslagsområde": "<b>omslagsområde</b> er et pH-interval. Pladsen peger på flasken, der dryppes af i kolben.",
                      "titrering": "<b>titrering</b> er hele metoden. Pladsen peger på én lille flaske med et stof." } },
            { id: "omslagsområde", ord: ["omslagsområde"], x: 694, y: 128, maal: [694, Y(10)], dele: ["baand"],
              omr: [{ r: [GA.xa + 1, Y(10) - 3, GA.xb - GA.xa + 6, Y(8.2) - Y(10) + 6, 4] }],
              fejl: { "indikator": "<b>indikator</b> er selve stoffet i flasken. Pladsen peger på pH-intervallet fra 8,2 til 10,0.",
                      "ækvivalenspunkt": "<b>ækvivalenspunkt</b> er ét punkt på kurven. Pladsen peger på hele båndet fra pH 8,2 til 10,0." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* ----- Lag 1: opstillingen ------------------------------------------ */
            api.del("opstilling", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    B6.burette(g, 64, BX, BTOP, BBUND, FOD, { farve: "#e4eef6" });
                    B6.omroerer(g, BX, KB, 160, 32);
                    B6.kolbe(g, BX, KB, 132, { farve: "#eef2f4", niveau: 0.26 });
                    KV.tekst(g, BX + 22, 156, "0,100 M NaOH", { fs: 16, fed: true, anker: "start" });
                    KV.tekst(g, BX + 22, 176, "i buretten", { fs: 14, farve: C.daempet, anker: "start" });
                    KV.tekst(g, BX, FOD + 32, "25,0 mL 0,100 M CH_3COOH", { fs: 14.5, fed: true });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Grafen: kortet og akserne staar der altid -------------------- */
            api.del("akser", {
                lag: 0,
                auto: true,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.diagram(g, { xa: GA.xa, xb: GA.xb, ya: GA.ya, yb: GA.yb, xmax: GA.xmax, ymax: GA.ymax, xtrin: 5, ytrin: 2, ydec: 0,
                        xtitel: "tilsat 0,100 M NaOH i mL", ytitel: "pH", yafst: 40, fs: 14 });
                    return {};
                }
            });

            /* Lag 3: phenolphthaleins omslagsomraade bag kurven */
            api.del("baand", {
                lag: 2,
                fuld: function (g) {
                    SV.el("rect", { x: GA.xa + 1, y: Y(10), width: GA.xb - GA.xa + 7, height: Y(8.2) - Y(10), fill: "url(#b6-omslag)" }, g);
                    KV.linje(g, GA.xa + 1, Y(10), GA.xb + 8, Y(10), "#d0679c", 1.2);
                    KV.linje(g, GA.xa + 1, Y(8.2), GA.xb + 8, Y(8.2), "#d0679c", 1.2, "4 4");
                    KV.tekst(g, GA.xb - 6, Y(10) + 22, "phenolphthalein", { fs: 15, fed: true, anker: "end", farve: "#9b2a66", halo: "#fbeef5" });
                    KV.tekst(g, GA.xb - 6, Y(10) + 42, "8,2 til 10,0", { fs: 15, fed: true, anker: "end", farve: "#9b2a66", halo: "#fbeef5" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            api.del("kurve", {
                lag: 0,
                fuld: function (g) {
                    var k = KV.kurve(g, PUNKTER.map(function (p) { return [X(p[0]), Y(p[1])]; }), C.accent, 2.8);
                    return { k: k };
                },
                byg: function (g, r, an) { an.streg(r.k, 0, 900); }
            });

            /* ----- Lag 2: de to punkter ------------------------------------------ */
            api.del("halv", {
                lag: 1,
                fuld: function (g) {
                    KV.linje(g, GA.xa, HALV[1], HALV[0], HALV[1], C.daempet, 1.3, "5 4");
                    var p = KV.punkt(g, HALV[0], HALV[1], "a", 6.5);
                    KV.tekst(g, 628, HALV[1] - 44, "12,5 mL", { fs: 16, fed: true, halo: "#f1f6f6" });
                    KV.tekst(g, 628, HALV[1] - 22, "pH = pK_{s} = 4,76", { fs: 16, fed: true, farve: C.accent, halo: "#f1f6f6" });
                    return { p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 100, 450); }
            });
            api.del("aekv", {
                lag: 1,
                fuld: function (g) {
                    KV.linje(g, AEKV[0], AEKV[1], AEKV[0], GA.yb, C.daempet, 1.3, "5 4");
                    var p = KV.punkt(g, AEKV[0], AEKV[1], "a", 6.5);
                    KV.tekst(g, AEKV[0] - 12, AEKV[1] + 42, "pH 8,73", { fs: 16, fed: true, anker: "end", farve: C.accent, halo: "#f1f6f6" });
                    KV.tekst(g, AEKV[0] + 8, GA.yb - 10, "25,0 mL", { fs: 16, fed: true, anker: "start", halo: "#f1f6f6" });
                    return { p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 100, 450); }
            });

            /* ----- Lag 3: draabeflasken med indikatoren --------------------------- */
            api.del("flaske", {
                lag: 2,
                fuld: function (g) {
                    var f = B6.draabeflaske(g, DF.x, DF.y, DF.b, DF.h, "");
                    KV.tekst(g, DF.x + DF.b / 2, FOD + 32, "phenolphthalein", { fs: 13.5, fed: true, farve: "#9b2a66" });
                    return { f: f };
                },
                byg: function (g, r, an) { an.pop(r.f, 0, 500); }
            });
        }
    };
}());

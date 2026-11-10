/* =====================================================================
   fig_base.js - figuren til B6.4 Basestyrke

   Oeverst bogens formler for ammoniak: reaktionen med vand, udtrykket for
   K_b = 1,78 · 10⁻⁵ M og pK_b = −log K_b = 4,75. Pladserne staar til
   venstre for de to linjer og peger paa symbolerne (som i B6.3).
   Nederst til venstre natriumhydroxid, der opløses i vand, med Na⁺ og
   OH⁻ som kugler (bogens tekst: "Når de opløses i vand, bliver alle
   hydroxidionerne frie med det samme"). Staerk base peger paa OH⁻.
   Nederst til hoejre en raekke fra bogens b6-par-styrke: NH₄⁺ med
   pK_s = 9,25 og NH₃ med pK_b = 4,75 i en groen klamme, og summen 14,00.
   Korresponderende syre-basepar er gentaget fra B6.1 (NK.GENTAGET), saa
   kapitlets tre fagord faar selskab af et fjerde, og der bliver to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B6 = NK.B6;
    var C = B6.F;

    /* ----- Lag 1: konstanten og eksponenten ---------------------------------- */
    var RA = { x: 20, y: 20, b: 1120, h: 204 };
    var FX = 486, Y1 = 60, Y2 = 128, Y3 = 188;

    /* ----- Lag 2 ---------------------------------------------------------------- */
    var RB = { x: 20, y: 248, b: 540, h: 316 };
    var OY = 424, ONA = 262, OOH = 428, OS = 2.3;
    var MOH = B6.beregn("OH", OOH, OY, OS, { vx: 0.3 });
    var RC = { x: 580, y: 248, b: 560, h: 316 };
    var PX = [735, 985], PYC = 424, KL = PYC - 30;

    NK.FIGURER.base = {
        vb: [1160, 584],
        lag: [
            { navn: "Konstanten og eksponenten", pladser: ["basestyrkekonstant", "basestyrkeeksponent"],
              ros: "Basestyrkekonstanten for ammoniak er 1,78 · 10⁻⁵ M, og eksponenten er minus logaritmen til den, 4,75." },
            { navn: "Hydroxid og et par", pladser: ["stærk base", "korresponderende syre-basepar"],
              ros: "OH⁻ er den vigtigste stærke base. For parret NH₄⁺ og NH₃ giver de to eksponenter 14,00 tilsammen." }
        ],
        pladser: [
            { id: "basestyrkekonstant", ord: ["basestyrkekonstant"], x: 224, y: Y2 - 7, maal: [FX - 6, Y2 - 9], dele: ["kb"],
              omr: [{ r: [FX - 7, Y2 - 30, 46, 38, 6] }],
              fejl: { "basestyrkeeksponent": "<b>basestyrkeeksponent</b> er minus logaritmen til konstanten. Pladsen peger på symbolet foran brøken.",
                      "stærk base": "<b>stærk base</b> er en slags base. Pladsen peger på symbolet foran brøken med koncentrationerne.",
                      "korresponderende syre-basepar": "<b>korresponderende syre-basepar</b> er to stoffer. Pladsen peger på symbolet foran brøken." } },
            { id: "basestyrkeeksponent", ord: ["basestyrkeeksponent"], x: 224, y: Y3 - 7, maal: [FX - 6, Y3 - 9], dele: ["pkb"],
              omr: [{ r: [FX - 7, Y3 - 30, 62, 38, 6] }],
              fejl: { "basestyrkekonstant": "<b>basestyrkekonstant</b> er brøken med koncentrationerne. Pladsen peger på symbolet for −log til den.",
                      "stærk base": "<b>stærk base</b> er en slags base. Pladsen peger på symbolet for −log K<sub>b</sub>." } },

            { id: "stærk base", ord: ["stærk base"], x: 290, y: 298, maal: [OOH - 6, OY - MOH.R - 8], dele: ["naoh"],
              omr: [{ r: [OOH - MOH.R - 14, OY - MOH.R - 12, 2 * MOH.R + 28, 108 + MOH.R, 12] }],
              fejl: { "basestyrkekonstant": "<b>basestyrkekonstant</b> er et tal. Pladsen peger på hydroxidionen, som bliver fri, når NaOH opløses.",
                      "korresponderende syre-basepar": "<b>korresponderende syre-basepar</b> er to stoffer. Pladsen peger på én ion fra NaOH." } },
            { id: "korresponderende syre-basepar", ord: ["korresponderende syre-basepar"], x: 860, y: 298, maal: [(PX[0] + PX[1]) / 2, KL - 26], dele: ["par"],
              omr: [{ r: [PX[0] - 8, KL - 32, PX[1] - PX[0] + 16, 40, 6] }],
              fejl: { "stærk base": "<b>stærk base</b> er ét stof med pK<sub>b</sub> under 0. Pladsen peger på klammen om NH₄⁺ og NH₃.",
                      "basestyrkeeksponent": "<b>basestyrkeeksponent</b> er ét tal. Pladsen peger på klammen om NH₄⁺ og NH₃.",
                      "basestyrkekonstant": "<b>basestyrkekonstant</b> er ét tal. Pladsen peger på klammen om NH₄⁺ og NH₃." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("kb", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    KV.tekst(g, 592, Y1, "NH_3 + H_2O", { fs: 22, fed: true, anker: "end" });
                    B6.ligevaegt(g, 604, 658, Y1 - 7, C.blaek, 2.2);
                    KV.tekst(g, 670, Y1, "NH_4^+ + OH^−", { fs: 22, fed: true, anker: "start" });
                    B6.formel(g, FX, Y2, ["K_{b}", "=", { broek: ["[NH_4^+] · [OH^−]", "[NH_3]"] }, "= 1,78 · 10^{−5} M"], { fs: 26, bfs: 21, luft: 9 });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("pkb", {
                lag: 0,
                fuld: function (g) {
                    B6.formel(g, FX, Y3, ["pK_{b}", "= −log K_{b} = 4,75"], { fs: 26, luft: 9 });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 2: natriumhydroxid i vand ---------------------------------- */
            api.del("naoh", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.tekst(g, 98, OY + 8, "NaOH(s)", { fs: 22, fed: true });
                    B6.pil(g, 154, 214, OY);
                    var na = B6.model(g, "Na", ONA, OY, OS, { fortegn: true });
                    KV.tekst(g, (ONA + OOH) / 2, OY + 9, "+", { fs: 26, farve: C.daempet });
                    var oh = B6.model(g, "OH", OOH, OY, OS, { vx: 0.3 });
                    KV.tekst(g, ONA, OY + 74, "Na^+(aq)", { fs: 21, fed: true, farve: "#5b4590" });
                    KV.tekst(g, OOH, OY + 74, "OH^−(aq)", { fs: 21, fed: true, farve: C.base });
                    KV.tekst(g, RB.x + RB.b / 2, OY + 116, "Alle hydroxidionerne bliver frie med det samme.", { fs: 15, farve: C.daempet });
                    return { na: na.g, oh: oh.g };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.na, 150, 450); an.pop(r.oh, 300, 450); }
            });

            /* ----- Lag 2: syre-baseparret NH₄⁺ og NH₃ ------------------------------ */
            function chip(g, x, y, t, farve, fyld) {
                var b = Math.max(B6.bredde(t, 26, 700) + 36, 96);
                SV.el("rect", { x: x - b / 2, y: y - 26, width: b, height: 50, rx: 25, fill: fyld, stroke: farve, "stroke-width": 1.6 }, g);
                SV.el("rect", { x: x - b / 2 + 10, y: y - 22, width: b - 20, height: 14, rx: 7, fill: "url(#b6-glans)" }, g);
                KV.tekst(g, x, y + 9, t, { fs: 26, fed: true, farve: farve });
            }
            api.del("par", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    chip(g, PX[0], PYC, "NH_4^+", C.syre, "#fde3dd");
                    chip(g, PX[1], PYC, "NH_3", C.base, "#dde8fc");
                    KV.tekst(g, PX[0], PYC + 56, "pK_{s} = 9,25", { fs: 19, fed: true, farve: C.syre });
                    KV.tekst(g, PX[1], PYC + 56, "pK_{b} = 4,75", { fs: 19, fed: true, farve: C.base });
                    KV.tekst(g, (PX[0] + PX[1]) / 2, PYC + 108, "9,25 + 4,75 = 14,00", { fs: 21, fed: true });
                    var k = B6.klamme(g, PX[0], PX[1], KL, 26, true);
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.k, 100, 700); }
            });
        }
    };
}());

/* =====================================================================
   fig_puffer.js - figuren til B6.7 Puffersystemer

   Oeverst bogens b6-puffer-sammenlign: 2,0 mmol HCl tilsat 100 mL rent
   vand og 100 mL af puffersystemet fra bogens eksempel (40 mmol
   ethansyre og 30 mmol ethanoat), vist som pH foer og efter. De to
   grupper staar paa hvert sit kort. Puffersystem er titlen paa kortet
   med ethansyre og ethanoat; kortet med rent vand har et graat skilt i
   samme stoerrelse ("rent vand"), saa man kan se, hvad pladsen ved siden
   af spoerger om. "100 mL puffer" er taget af.
   Nederst pufferligningen som titel paa et kort med formlen og bogens
   eksempel (4,76 + log(30/40) = 4,64). Syrestyrkeeksponent er gentaget
   fra B6.3 (NK.GENTAGET) og peger paa pKₛ i formlen.
   To fagord og ét gentaget i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B6 = NK.B6;
    var C = B6.F;

    var RA = { x: 20, y: 20, b: 1120, h: 362 };
    var G1 = { x: 40, y: 84, b: 1080, h: 112 };
    var G2 = { x: 40, y: 216, b: 1080, h: 112 };
    var XA = 470, XB = 1046, PMAKS = 8;
    function X(p) { return XA + (XB - XA) * p / PMAKS; }
    var AKSE = 340;
    var SKILT_X = 186;

    var RB = { x: 20, y: 404, b: 1120, h: 172 };
    var FY = 486, FX = 248, EX = 676;
    var PKX = FX + B6.bredde("pH =", 28, 700) + 9, PKB = B6.bredde("pK_{s}", 28, 700);

    NK.FIGURER.puffer = {
        vb: [1160, 590],
        lag: [
            { navn: "Puffersystemet", pladser: ["puffersystem", "pufferligningen", "syrestyrkeeksponent"],
              ros: "Puffersystemet holder pH næsten konstant. Pufferligningen giver pH = 4,76 + log(30/40) = 4,64." }
        ],
        pladser: [
            { id: "puffersystem", ord: ["puffersystem"], x: SKILT_X, y: G2.y, maal: [SKILT_X, G2.y], titel: true, dele: ["puffer"],
              omr: [{ r: [G2.x - 4, G2.y - 4, G2.b + 8, G2.h + 8, 16], tom: true }],
              fejl: { "pufferligningen": "<b>pufferligningen</b> er en formel. Overskriften gælder opløsningen med både CH₃COOH og CH₃COO⁻.",
                      "syrestyrkeeksponent": "<b>syrestyrkeeksponent</b> beskriver en syres styrke. Overskriften gælder opløsningen med både CH₃COOH og CH₃COO⁻." } },
            { id: "pufferligningen", ord: ["pufferligningen"], x: RB.x + RB.b / 2, y: RB.y, maal: [RB.x + RB.b / 2, RB.y], titel: true, dele: ["ligning"],
              omr: [{ r: [RB.x - 4, RB.y - 4, RB.b + 8, RB.h + 8, 18], tom: true }],
              fejl: { "puffersystem": "<b>puffersystem</b> er en opløsning. Overskriften gælder formlen, der giver pH ud fra base og syre.",
                      "syrestyrkeeksponent": "<b>syrestyrkeeksponent</b> er ét led i formlen. Overskriften gælder hele formlen." } },
            { id: "syrestyrkeeksponent", ord: ["syrestyrkeeksponent"], x: 330, y: 552, maal: [PKX + PKB / 2, FY + 9], dele: ["pks"],
              omr: [{ r: [PKX - 5, FY - 27, PKB + 10, 39, 6] }],
              fejl: { "pufferligningen": "<b>pufferligningen</b> er hele formlen. Pladsen peger på ét led, som er 4,76 for ethansyre.",
                      "puffersystem": "<b>puffersystem</b> er en opløsning. Pladsen peger på ét led i formlen, som er 4,76 for ethansyre." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* Pladsernes bredde (som i motoren), saa det graa skilt bliver lige saa bredt */
            var W = 120;
            ["puffersystem", "pufferligningen", "syrestyrkeeksponent"].forEach(function (o) { W = Math.max(W, NK.tekstBredde(o, 18, 700) + 28); });
            W = Math.ceil(W);

            /* Bjaelkerne: pH foer og efter */
            function bjaelker(g, kort, foer, efter, farver) {
                [[foer, "før", farver[0]], [efter, "efter", farver[1]]].forEach(function (t, k) {
                    var y = kort.y + 26 + k * 42;
                    KV.tekst(g, XA - 14, y + 19, t[1], { fs: 16, farve: C.daempet, anker: "end" });
                    SV.el("rect", { x: XA, y: y, width: X(t[0]) - XA, height: 28, rx: 3, fill: t[2] }, g);
                    KV.tekst(g, X(t[0]) + 10, y + 20, "pH " + t[0].toFixed(2).replace(".", ","), { fs: 17, fed: true, anker: "start" });
                });
            }

            api.del("ramme", {
                lag: 0,
                auto: true,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    KV.tekst(g, RA.x + 24, RA.y + 34, "Der tilsættes 2,0 mmol HCl til hver opløsning.", { fs: 16, farve: C.daempet, anker: "start" });
                    /* Nettet og aksen under begge kort */
                    for (var p = 0; p <= PMAKS; p++) {
                        KV.linje(g, X(p), G1.y + 10, X(p), AKSE, p === 0 ? C.daempet : "#d5e2e0", p === 0 ? 1.4 : 1);
                        KV.tekst(g, X(p), AKSE + 20, String(p), { fs: 15, farve: C.daempet });
                    }
                    KV.tekst(g, XB + 30, AKSE + 20, "pH", { fs: 15, fed: true, farve: C.daempet });
                    /* Kortet med rent vand og dets graa skilt */
                    KV.kort(g, G1.x, G1.y, G1.b, G1.h, { fyld: "rgba(255,255,255,0.72)" });
                    SV.el("rect", { x: SKILT_X - W / 2, y: G1.y - 17, width: W, height: 34, rx: 8, fill: "#eef1f4", stroke: "#b9c6cf" }, g);
                    KV.tekst(g, SKILT_X, G1.y + 6.3, "rent vand", { fs: 18, fed: true, farve: "#6b7780" });
                    KV.tekst(g, G1.x + 22, G1.y + 52, "100 mL vand", { fs: 18, fed: true, anker: "start" });
                    KV.tekst(g, G1.x + 22, G1.y + 78, "pH falder 5,30", { fs: 16, fed: true, anker: "start", farve: C.syre });
                    bjaelker(g, G1, 7.0, 1.7, ["#eef1ef", "#d4462f"]);
                    return {};
                }
            });

            api.del("puffer", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, G2.x, G2.y, G2.b, G2.h, { fyld: "rgba(255,255,255,0.72)" });
                    KV.tekst(g, G2.x + 22, G2.y + 46, "40 mmol CH_3COOH", { fs: 17, fed: true, anker: "start" });
                    KV.tekst(g, G2.x + 22, G2.y + 68, "30 mmol CH_3COO^− i 100 mL", { fs: 17, fed: true, anker: "start" });
                    KV.tekst(g, G2.x + 22, G2.y + 94, "pH falder kun 0,06", { fs: 16, fed: true, anker: "start", farve: C.accent });
                    bjaelker(g, G2, 4.64, 4.58, ["#f4bcae", "#f0ae9d"]);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Pufferligningen og bogens eksempel --------------------------- */
            api.del("ligning", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    B6.formel(g, FX, FY, ["pH =", { tom: "pK_{s}" }, "+ log", { broek: ["[B]", "[S]"] }], { fs: 28, bfs: 24, luft: 9 });
                    KV.linje(g, EX - 50, FY - 46, EX - 50, FY + 34, "#c9d6e0", 1.4);
                    B6.formel(g, EX, FY, ["pH = 4,76 + log", { broek: ["30 mmol", "40 mmol"] }, "= 4,64"], { fs: 24, bfs: 20, luft: 9, farve: C.accent });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* pKₛ i formlen faar farve for sig, naar ordet sidder */
            api.del("pks", {
                lag: 0,
                fuld: function (g) {
                    KV.tekst(g, PKX, FY, "pK_{s}", { fs: 28, fed: true, anker: "start", farve: C.syre });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

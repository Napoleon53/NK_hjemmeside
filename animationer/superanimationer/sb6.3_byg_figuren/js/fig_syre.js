/* =====================================================================
   fig_syre.js - figuren til B6.3 Syrestyrke

   Oeverst bogens formler for ethansyre: reaktionen med vand, udtrykket
   for Kₛ = 1,74 · 10⁻⁵ M og pKₛ = −log Kₛ = 4,76. Pladserne staar til
   venstre for de to linjer og peger paa symbolerne Kₛ og pKₛ.
   I midten bogens b6-pks-skala fra −8 til 10 med syv syrer paa stifter.
   Feltet "meget svage" (over 10) og hydrogencarbonat er taget ud, og
   navnene "stærke syrer", "middelstærke" og "svage" i felterne er taget af
   (de er pladserne); "pKₛ under 0", "0 til 4" og "4 til 10" er blevet.
   Pladserne staar under aksen, og stregerne gaar op mellem tallene.
   Nederst bogens b6-omdannelsesgrad med en kolonne mere: den aktuelle
   koncentration [CH₃COOH] ved ligevaegt (regnet med Kₛ; 0,0987 M er
   bogens eksempel). Overskriften "omdannelsesgrad" er taget af.
   Otte fagord i tre lag.
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
    var FX = 440, Y1 = 60, Y2 = 128, Y3 = 188;

    /* ----- Lag 2: skalaen ----------------------------------------------------- */
    var RB = { x: 20, y: 244, b: 1120, h: 222 };
    var XA = 70, XB = 1090, QMIN = -8, QMAKS = 10;
    function X(q) { return XA + (XB - XA) * (q - QMIN) / (QMAKS - QMIN); }
    var BY = 330, BH = 54, AKSE = BY + BH + 4;
    var SYRER = [["HCl", -7, "−7"], ["HNO_3", -1.4, "−1,4"], ["H_3PO_4", 2.15, "2,15"], ["HCOOH", 3.75, "3,75"],
                 ["CH_3COOH", 4.76, "4,76"], ["H_2CO_3", 6.35, "6,35"], ["NH_4^+", 9.25, "9,25"]];
    var FELTER = [[-8, 0, "#f4b9ae", "pK_{s} under 0"], [0, 4, "#f9d6ad", "0 til 4"], [4, 10, "#fbeaa6", "4 til 10"]];
    var PY = 444;                                         /* pladserne under aksen */

    /* ----- Lag 3: koncentrationerne og omdannelsesgraden -------------------- */
    var RC = { x: 20, y: 486, b: 1120, h: 274 };
    var HY = 598, RY = [636, 676, 716], LY = 752;
    var XC = 250, XS = 452, BX0 = 492, BX1 = 900, XAL = 1000, HC = 203, HS = 400;
    var RAEKKER = [["0,100 M", "0,0987 M", 1.31, "1,3 %"], ["0,0100 M", "0,00959 M", 4.08, "4,1 %"], ["0,00100 M", "0,000877 M", 12.3, "12,3 %"]];

    NK.FIGURER.syre = {
        vb: [1160, 774],
        lag: [
            { navn: "Konstanten og eksponenten", pladser: ["syrestyrkekonstant", "syrestyrkeeksponent"],
              ros: "Kₛ er ligevægtskonstanten for syrens reaktion med vand. pKₛ er minus logaritmen til Kₛ, for ethansyre 4,76." },
            { navn: "Tre slags syrer", pladser: ["stærk syre", "middelstærk syre", "svag syre"],
              ros: "Under 0 er syren stærk, fra 0 til 4 middelstærk og fra 4 til 10 svag. Jo lavere pKₛ, jo stærkere syre." },
            { navn: "Koncentrationerne", pladser: ["formel koncentration", "aktuel koncentration", "omdannelsesgrad"],
              ros: "cₛ står på flasken, og [S] er det, der er tilbage ved ligevægt. Omdannelsesgraden stiger, når syren fortyndes." }
        ],
        pladser: [
            { id: "syrestyrkekonstant", ord: ["syrestyrkekonstant"], x: 200, y: Y2 - 7, maal: [FX - 6, Y2 - 9], dele: ["ks"],
              omr: [{ r: [FX - 7, Y2 - 30, 46, 38, 6] }],
              fejl: { "syrestyrkeeksponent": "<b>syrestyrkeeksponent</b> er minus logaritmen til konstanten. Pladsen peger på symbolet foran brøken.",
                      "omdannelsesgrad": "<b>omdannelsesgrad</b> er en brøkdel af syren i procent. Pladsen peger på symbolet foran brøken.",
                      "stærk syre": "<b>stærk syre</b> er en slags syre. Pladsen peger på symbolet foran brøken med koncentrationerne." } },
            { id: "syrestyrkeeksponent", ord: ["syrestyrkeeksponent"], x: 200, y: Y3 - 7, maal: [FX - 6, Y3 - 9], dele: ["pks"],
              omr: [{ r: [FX - 7, Y3 - 30, 62, 38, 6] }],
              fejl: { "syrestyrkekonstant": "<b>syrestyrkekonstant</b> er brøken med koncentrationerne. Pladsen peger på symbolet for −log til den.",
                      "omdannelsesgrad": "<b>omdannelsesgrad</b> er en brøkdel af syren i procent. Pladsen peger på symbolet for −log Kₛ." } },

            { id: "stærk syre", ord: ["stærk syre"], x: 330, y: PY, maal: [X(-3), BY + BH], dele: ["staerk"],
              omr: [{ r: [X(-8) - 2, BY - 3, X(0) - X(-8) + 2, BH + 6, 9] }],
              fejl: { "svag syre": "<b>svag syre</b> har pKₛ mellem 4 og 10. Pladsen peger på feltet med pKₛ under 0.",
                      "middelstærk syre": "<b>middelstærk syre</b> har pKₛ mellem 0 og 4. Pladsen peger på feltet med pKₛ under 0." } },
            { id: "middelstærk syre", ord: ["middelstærk syre"], x: 622, y: PY, maal: [X(1), BY + BH], dele: ["middel"],
              omr: [{ r: [X(0) + 1, BY - 3, X(4) - X(0) - 2, BH + 6, 9] }],
              fejl: { "stærk syre": "<b>stærk syre</b> har pKₛ under 0. Pladsen peger på feltet fra 0 til 4.",
                      "svag syre": "<b>svag syre</b> har pKₛ mellem 4 og 10. Pladsen peger på feltet fra 0 til 4." } },
            { id: "svag syre", ord: ["svag syre"], x: 930, y: PY, maal: [X(7), BY + BH], dele: ["svag"],
              omr: [{ r: [X(4), BY - 3, X(10) - X(4) + 2, BH + 6, 9] }],
              fejl: { "stærk syre": "<b>stærk syre</b> har pKₛ under 0. Pladsen peger på feltet fra 4 til 10.",
                      "middelstærk syre": "<b>middelstærk syre</b> har pKₛ mellem 0 og 4. Pladsen peger på feltet fra 4 til 10." } },

            { id: "formel koncentration", ord: ["formel koncentration"], x: 180, y: 530, maal: [HC, HY - 20], dele: ["cs"],
              omr: [{ r: [XC - 106, HY - 24, 114, RY[2] - HY + 38, 8] }],
              fejl: { "aktuel koncentration": "<b>aktuel koncentration</b> er det, der er tilbage ved ligevægt. Pladsen peger på kolonnen c<sub>s</sub>.",
                      "omdannelsesgrad": "<b>omdannelsesgrad</b> er en brøkdel i procent. Pladsen peger på koncentrationerne i kolonnen c<sub>s</sub>." } },
            { id: "aktuel koncentration", ord: ["aktuel koncentration"], x: 472, y: 530, maal: [HS, HY - 20], dele: ["s"],
              omr: [{ r: [XS - 122, HY - 24, 130, RY[2] - HY + 38, 8] }],
              fejl: { "formel koncentration": "<b>formel koncentration</b> er tallet på flasken. Pladsen peger på kolonnen [CH₃COOH], hvor tallene er lidt mindre.",
                      "omdannelsesgrad": "<b>omdannelsesgrad</b> er en brøkdel i procent. Pladsen peger på koncentrationerne i kolonnen [CH₃COOH]." } },
            { id: "omdannelsesgrad", ord: ["omdannelsesgrad"], x: 980, y: 530, maal: [XAL, HY - 20], dele: ["alfa"],
              omr: [{ r: [XAL - 46, HY - 24, 92, RY[2] - HY + 38, 8] }],
              fejl: { "formel koncentration": "<b>formel koncentration</b> er en koncentration i M. Pladsen peger på procenterne ved de røde stykker.",
                      "aktuel koncentration": "<b>aktuel koncentration</b> er en koncentration i M. Pladsen peger på procenterne ved de røde stykker." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("ks", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    KV.tekst(g, 566, Y1, "CH_3COOH + H_2O", { fs: 22, fed: true, anker: "end" });
                    B6.ligevaegt(g, 578, 632, Y1 - 7, C.blaek, 2.2);
                    KV.tekst(g, 644, Y1, "CH_3COO^− + H_3O^+", { fs: 22, fed: true, anker: "start" });
                    B6.formel(g, FX, Y2, ["K_{s}", "=", { broek: ["[CH_3COO^−] · [H_3O^+]", "[CH_3COOH]"] }, "= 1,74 · 10^{−5} M"], { fs: 26, bfs: 21, luft: 9 });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("pks", {
                lag: 0,
                fuld: function (g) {
                    B6.formel(g, FX, Y3, ["pK_{s}", "= −log K_{s} = 4,76"], { fs: 26, luft: 9 });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 2: skalaen med syrerne ------------------------------------- */
            api.del("akse", {
                lag: 1,
                auto: true,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    for (var q = QMIN; q <= QMAKS; q += 2) {
                        KV.linje(g, X(q), AKSE, X(q), AKSE + 6, C.daempet, 1.2);
                        KV.tekst(g, X(q), AKSE + 23, String(q).replace("-", "−"), { fs: 15, farve: C.daempet });
                    }
                    KV.tekst(g, XB + 22, AKSE + 23, "pK_{s}", { fs: 15, fed: true, farve: C.daempet, anker: "start" });
                    /* Syrerne paa stifter med et hvidt hoved; navnene spredes, saa de ikke rammer hinanden */
                    var lx = [], sidst = -1e9;
                    SYRER.forEach(function (s) {
                        var b = B6.bredde(s[0], 17, 700);
                        var x = Math.max(X(s[1]), sidst + 8 + b / 2);
                        lx.push(x);
                        sidst = x + b / 2;
                    });
                    SYRER.forEach(function (s, k) {
                        KV.linje(g, X(s[1]), BY - 1, lx[k], BY - 32, "#8a9a9c", 1.2);
                        SV.el("circle", { cx: X(s[1]), cy: BY - 1, r: 3, fill: "#ffffff", stroke: "#5d6b6b", "stroke-width": 1.2 }, g);
                        KV.tekst(g, lx[k], BY - 58, s[0], { fs: 17, fed: true });
                        KV.tekst(g, lx[k], BY - 38, s[2], { fs: 15, farve: C.daempet });
                    });
                    return {};
                }
            });
            ["staerk", "middel", "svag"].forEach(function (id, k) {
                var f = FELTER[k];
                api.del(id, {
                    lag: 1,
                    fuld: function (g) {
                        B6.felt(g, X(f[0]) + 1, BY, X(f[1]) - X(f[0]) - 2, BH, f[2], null, { rx: 8 });
                        KV.tekst(g, (X(f[0]) + X(f[1])) / 2, BY + BH / 2 + 6, f[3], { fs: 16, fed: true, farve: "#5b4a3a" });
                        return {};
                    },
                    byg: function (g, r, an) { an.fade(g, 0, 500); }
                });
            });

            /* ----- Lag 3: tre koncentrationer af ethansyre ----------------------- */
            api.del("ramme3", {
                lag: 2,
                auto: true,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    /* Forklaringen til farverne under soejlerne */
                    SV.el("rect", { x: BX0, y: LY - 12, width: 20, height: 14, rx: 3, fill: C.syre }, g);
                    KV.tekst(g, BX0 + 28, LY, "har afgivet en hydron: CH_3COO^−", { fs: 16, anker: "start", farve: C.daempet });
                    SV.el("rect", { x: BX0 + 330, y: LY - 12, width: 20, height: 14, rx: 3, fill: "#eef1f2", stroke: "#cdd5d9", "stroke-width": 1 }, g);
                    KV.tekst(g, BX0 + 358, LY, "hele molekyler: CH_3COOH", { fs: 16, anker: "start", farve: C.daempet });
                    return {};
                }
            });
            api.del("cs", {
                lag: 2,
                fuld: function (g) {
                    KV.tekst(g, HC, HY, "c_{s}", { fs: 19, fed: true, farve: C.accent });
                    RAEKKER.forEach(function (r, k) { KV.tekst(g, XC, RY[k] + 7, r[0], { fs: 19, fed: true, anker: "end" }); });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("s", {
                lag: 2,
                fuld: function (g) {
                    KV.tekst(g, HS, HY, "[CH_3COOH]", { fs: 17, fed: true, farve: C.accent });
                    RAEKKER.forEach(function (r, k) { KV.tekst(g, XS, RY[k] + 7, r[1], { fs: 18, fed: true, anker: "end", farve: "#3b4650" }); });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("alfa", {
                lag: 2,
                fuld: function (g) {
                    KV.tekst(g, XAL, HY, "α", { fs: 20, fed: true, farve: C.accent });
                    var roede = SV.g(g);
                    RAEKKER.forEach(function (r, k) {
                        SV.el("rect", { x: BX0, y: RY[k] - 14, width: BX1 - BX0, height: 28, rx: 7, fill: "#eef1f2", stroke: "#cdd5d9", "stroke-width": 1 }, g);
                        SV.el("rect", { x: BX0, y: RY[k] - 14, width: Math.max(9, (BX1 - BX0) * r[2] / 100), height: 28, rx: 7, fill: C.syre }, roede);
                        KV.tekst(g, XAL, RY[k] + 7, r[3], { fs: 19, fed: true, farve: C.syre });
                    });
                    g.appendChild(roede);
                    return { roede: roede };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.roede, 150, 500); }
            });
        }
    };
}());

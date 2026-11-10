/* =====================================================================
   fig_amino.js - figuren til B7.7 Aminosyrer

   Øverst til venstre bogens b7-aminosyre-generel: H₂N−CH−COOH med
   farvede bokse og sidekæden R under CH. Kortets titel er aminosyre, og
   pladsen sidekæde peger på R, hvor bogen skriver "sidekæde".
   Øverst til højre de ni aminosyrer, kroppen ikke selv kan danne (fra
   afsnittets tekst). Kortets titel er essentiel aminosyre.
   I midten bogens b7-aminosyrer-syv med fem af de syv: alanin og valin,
   serin, asparaginsyre og lysin. Bogens kortitler er afløst af pladserne.
   Glycin og cystein er taget ud, så figuren bliver mindre.
   Nederst til venstre glycin, der reagerer med sig selv og bliver til
   en amfoion (afsnittets reaktionsskema). Nederst til højre bogens
   b7-aminosyre-fordeling for glycin. Kurvernes navn "amfoion" er taget af,
   og pladsen isoelektrisk punkt sidder, hvor bogen skriver det. Glycins
   isoelektriske punkt står ikke som tal (det er holdt ude af bogen).
   Ti fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var FP = NK.FP;
    var KV = NK.KV;
    var F = FP.F;
    var bred = FP.bred;

    /* ----- Lag 1 ------------------------------------------------------------ */
    var KG = { x: 14, y: 26, b: 560, h: 176 };
    var GS = 24;                                         /* skriften i skabelonen */
    var CHX = KG.x + 214, CHY = KG.y + 82;
    var BN = bred("H_2N", GS), BC = bred("COOH", GS);
    var NB = [CHX - 30 - 14 - BN - 12, CHY - 21, BN + 24, 42];             /* boksene */
    var CB = [CHX + 30 + 14, CHY - 21, BC + 24, 42];
    var RB = [CHX - 19, CHY + 42, 38, 38];
    var KE = { x: 588, y: 26, b: 558, h: 176 };
    var ESS = ["histidin", "isoleucin", "leucin", "lysin", "methionin", "phenylalanin", "threonin", "tryptophan", "valin"];

    /* ----- Lag 2: sidekaederne ----------------------------------------------- */
    var RY = 228, RH = 232;
    var KU = { x: 14, y: RY, b: 380, h: RH }, KP = { x: 408, y: RY, b: 236, h: RH },
        KS = { x: 658, y: RY, b: 236, h: RH }, KB = { x: 908, y: RY, b: 238, h: RH };
    var LY = RY + 64, NAVN = RY + RH - 16, DY = 26;

    /* ----- Lag 3 ------------------------------------------------------------- */
    var KA = { x: 14, y: 482, b: 398, h: 210 };
    var AY = KA.y + 72, AY2 = KA.y + 136;
    var KD = { x: 426, y: 482, b: 720, h: 210 };
    var DG = { xa: KD.x + 74, xb: KD.x + KD.b - 54, ya: KD.y + 74, yb: KD.y + 168, xmax: 14, ymax: 100 };
    function DX(v) { return DG.xa + (DG.xb - DG.xa) * v / DG.xmax; }
    function DYv(v) { return DG.yb - (DG.yb - DG.ya) * v / DG.ymax; }
    var PK1 = 2.34, PK2 = 9.58, PI = (PK1 + PK2) / 2;
    function andele(ph) {
        var a = 1, b = Math.pow(10, ph - PK1), c = Math.pow(10, 2 * ph - PK1 - PK2), d = a + b + c;
        return [100 * a / d, 100 * b / d, 100 * c / d];
    }

    /* Bredden af glycin og amfoionen paa én linje (som FP.kaedeTekst) */
    function linjeBredde(dele, fs) {
        return dele.reduce(function (s, d) { return s + bred(d, fs); }, 0) + 16 * (dele.length - 1);
    }
    var AFS = 17;
    var GLY = ["H_2N", "CH_2", "COOH"], AMF = ["^+H_3N", "CH_2", "COO^−"];
    var BG = linjeBredde(GLY, AFS), BA = linjeBredde(AMF, AFS);
    var AMID = KA.x + KA.b / 2, GX0 = AMID - BG / 2, AX0 = AMID - BA / 2;

    function titel(id, k, dele, fejl, x) {
        x = x === undefined ? k.x + k.b / 2 : x;
        return { id: id, ord: [id], x: x, y: k.y, maal: [x, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18], tom: true }], fejl: fejl };
    }
    var SIDE_FEJL = {
        u: "<b>upolær sidekæde</b> består kun af carbon og hydrogen. ",
        p: "<b>polær sidekæde</b> kan danne hydrogenbindinger, for eksempel med OH. ",
        s: "<b>sur sidekæde</b> har en ekstra carboxylgruppe. ",
        b: "<b>basisk sidekæde</b> har en ekstra −NH₂-gruppe. "
    };

    NK.FIGURER.amino = {
        vb: [1160, 706],
        lag: [
            { navn: "Opbygningen", pladser: ["aminosyre", "sidekæde", "essentiel aminosyre"],
              ros: "En aminosyre har −NH₂ og −COOH på samme carbonatom. Sidekæden R gør dem forskellige, og ni af dem er essentielle." },
            { navn: "Sidekæderne", pladser: ["upolær sidekæde", "polær sidekæde", "sur sidekæde", "basisk sidekæde"],
              ros: "Sidekæden kan være upolær, polær, sur eller basisk. Det afgør, hvordan proteinet senere folder sig." },
            { navn: "Amfoionen", pladser: ["amfoion", "fordelingsdiagram", "isoelektrisk punkt"],
              ros: "I vand er aminosyren en amfoion. Fordelingsdiagrammet viser de tre former, og ved det isoelektriske punkt er næsten alt amfoioner." }
        ],
        pladser: [
            titel("aminosyre", KG, ["skabelon"], {
                "sidekæde": "<b>sidekæde</b> er kun gruppen R. Kortets titel er navnet på hele molekylet med −NH₂ og −COOH.",
                "essentiel aminosyre": "<b>essentiel aminosyre</b> er en af de ni, kroppen ikke selv kan danne. Kortets titel gælder alle 20.",
                amfoion: "<b>amfoion</b> har ladninger i begge ender. Molekylet på kortet har −NH₂ og −COOH uden ladning." }),
            { id: "sidekæde", ord: ["sidekæde"], x: RB[0] + RB[2] + 26 + 115, y: RB[1] + RB[3] / 2, maal: [RB[0] + RB[2] + 2, RB[1] + RB[3] / 2], dele: ["R"],
              omr: [{ r: [RB[0] - 4, RB[1] - 4, RB[2] + 8, RB[3] + 8, 10] }],
              fejl: { aminosyre: "<b>aminosyre</b> er hele molekylet. Pladsen peger kun på den fjerde gruppe, R.",
                      "upolær sidekæde": "<b>upolær sidekæde</b> er én slags R. Her står R for alle slags, så pladsen spørger efter det generelle ord.",
                      "essentiel aminosyre": "<b>essentiel aminosyre</b> er en hel aminosyre. Pladsen peger kun på gruppen R." } },
            titel("essentiel aminosyre", KE, ["liste"], {
                aminosyre: "<b>aminosyre</b> passer på alle 20. Kortets titel gælder kun de ni, kroppen ikke selv kan danne.",
                "basisk sidekæde": "<b>basisk sidekæde</b> er en slags R. Kortet viser de ni aminosyrer, vi skal have fra maden.",
                "upolær sidekæde": "<b>upolær sidekæde</b> er en slags R. Kortet viser de ni aminosyrer, vi skal have fra maden." }),

            titel("upolær sidekæde", KU, ["upol"], {
                "polær sidekæde": SIDE_FEJL.p + "CH₃ og CH har ingen OH-gruppe.",
                "sur sidekæde": SIDE_FEJL.s + "Se på R i alanin og valin.",
                "basisk sidekæde": SIDE_FEJL.b + "Se på R i alanin og valin." }),
            titel("polær sidekæde", KP, ["pol"], {
                "upolær sidekæde": SIDE_FEJL.u + "Serins R har en OH-gruppe.",
                "sur sidekæde": SIDE_FEJL.s + "Serins R har en OH-gruppe.",
                "basisk sidekæde": SIDE_FEJL.b + "Serins R har en OH-gruppe." }),
            titel("sur sidekæde", KS, ["sur"], {
                "upolær sidekæde": SIDE_FEJL.u + "R i asparaginsyre har en COOH-gruppe.",
                "polær sidekæde": SIDE_FEJL.p + "R i asparaginsyre har en ekstra COOH-gruppe.",
                "basisk sidekæde": SIDE_FEJL.b + "R i asparaginsyre har en COOH-gruppe." }),
            titel("basisk sidekæde", KB, ["bas"], {
                "upolær sidekæde": SIDE_FEJL.u + "Lysins R ender med en NH₂-gruppe.",
                "polær sidekæde": SIDE_FEJL.p + "Lysins R ender med en ekstra NH₂-gruppe.",
                "sur sidekæde": SIDE_FEJL.s + "Lysins R ender med en NH₂-gruppe." }),

            { id: "amfoion", ord: ["amfoion"], x: AMID, y: KA.y + KA.h - 28, maal: [AMID, AY2 + 20], dele: ["amfo"],
              omr: [{ r: [AX0 - 8, AY2 - 22, BA + 16, 40, 10] }],
              fejl: { "isoelektrisk punkt": "<b>isoelektrisk punkt</b> er en pH-værdi. Pladsen peger på partiklen med ladning i begge ender.",
                      "fordelingsdiagram": "<b>fordelingsdiagram</b> er en graf. Pladsen peger på partiklen med ⁺H₃N og COO⁻.",
                      aminosyre: "<b>aminosyre</b> passer på begge sider af pilen. Pladsen spørger, hvad formen med ⁺H₃N og COO⁻ hedder." } },
            titel("fordelingsdiagram", KD, ["kurver"], {
                "isoelektrisk punkt": "<b>isoelektrisk punkt</b> er én pH-værdi på grafen. Kortets titel er navnet på hele grafen med kurverne.",
                amfoion: "<b>amfoion</b> er én af formerne. Kortets titel er navnet på hele grafen med de tre kurver." }, KD.x + KD.b - 135),
            { id: "isoelektrisk punkt", ord: ["isoelektrisk punkt"], x: DX(PI), y: KD.y + 40, maal: [DX(PI), DG.ya - 6], dele: ["iso"],
              omr: [{ r: [DX(PI) - 10, DG.ya - 12, 20, DG.yb - DG.ya + 12, 8] }],
              fejl: { amfoion: "<b>amfoion</b> er en partikel. Pladsen peger på den pH, hvor næsten alt er amfoioner med samlet ladning 0.",
                      "fordelingsdiagram": "<b>fordelingsdiagram</b> er hele grafen. Pladsen peger på én pH midt mellem de to pKₛ-værdier." } }
        ],

        tegn: function (api) {
            FP.defs();
            KV.defs();

            /* ----- Lag 1 ------------------------------------------------------ */
            api.del("baseG", {
                lag: 0, auto: true,
                fuld: function (g) {
                    FP.kort(g, KG.x, KG.y, KG.b, KG.h);
                    FP.kort(g, KE.x, KE.y, KE.b, KE.h);
                }
            });
            api.del("skabelon", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: NB[0], y: NB[1], width: NB[2], height: NB[3], rx: 8, fill: F.negLys, stroke: F.neg, "stroke-width": 1.5 }, gg);
                    SV.el("rect", { x: CB[0], y: CB[1], width: CB[2], height: CB[3], rx: 8, fill: F.posLys, stroke: F.pos, "stroke-width": 1.5 }, gg);
                    SV.el("circle", { cx: CHX, cy: CHY, r: 27, fill: F.accentLys, stroke: F.accent, "stroke-width": 1.6 }, gg);
                    FP.linje(gg, NB[0] + NB[2], CHY, CHX - 27, CHY, F.blaek, 2.4);
                    FP.linje(gg, CHX + 27, CHY, CB[0], CHY, F.blaek, 2.4);
                    FP.linje(gg, CHX, CHY + 27, CHX, RB[1], F.blaek, 2.4);
                    ORG.t(gg, NB[0] + NB[2] / 2, CHY + 8.5, "H_2N", { fs: GS, fed: true, farve: F.neg });
                    ORG.t(gg, CHX, CHY + 8.5, "CH", { fs: GS, fed: true });
                    ORG.t(gg, CB[0] + CB[2] / 2, CHY + 8.5, "COOH", { fs: GS, fed: true, farve: F.pos });
                    ORG.t(gg, NB[0] + NB[2] / 2, NB[1] - 12, "aminogruppe", { fs: 14, fed: true, farve: F.neg });
                    ORG.t(gg, CB[0] + CB[2] / 2, CB[1] - 12, "carboxylgruppe", { fs: 14, fed: true, farve: F.pos });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("R", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: RB[0], y: RB[1], width: RB[2], height: RB[3], rx: 8, fill: F.sideLys, stroke: F.side, "stroke-width": 1.5 }, gg);
                    ORG.t(gg, RB[0] + RB[2] / 2, RB[1] + RB[3] / 2 + 8, "R", { fs: 22, fed: true, farve: F.side });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("liste", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ESS.forEach(function (n, i) {
                        var x = KE.x + 44 + (i % 3) * 168, y = KE.y + 62 + Math.floor(i / 3) * 28;
                        ORG.t(gg, x, y, n, { fs: 16, fed: true, anker: "start" });
                    });
                    ORG.t(gg, KE.x + 44, KE.y + KE.h - 22, "Kød, fisk, æg og mælk indeholder alle ni.", { fs: 14, farve: F.daempet, anker: "start" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------ */
            api.del("baseX", {
                lag: 1, auto: true,
                fuld: function (g) { [KU, KP, KS, KB].forEach(function (k) { FP.kort(g, k.x, k.y, k.b, k.h); }); }
            });
            function aa(id, dele) {
                api.del(id, {
                    lag: 1,
                    fuld: function (g) {
                        var gg = SV.g(g);
                        dele.forEach(function (d) {
                            FP.aminosyre(gg, d.x, LY, d.side, { fs: 17, dy: DY, sfs: 16 });
                            ORG.t(gg, d.x, NAVN, d.navn, { fs: 15, fed: true });
                        });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.pop(r.g, 0, 450); }
                });
            }
            aa("upol", [{ x: KU.x + 100, side: ["CH_3"], navn: "alanin" }, { x: KU.x + 284, side: [["H_3C", "CH", "CH_3"]], navn: "valin" }]);
            aa("pol", [{ x: KP.x + KP.b / 2, side: ["CH_2", "OH"], navn: "serin" }]);
            aa("sur", [{ x: KS.x + KS.b / 2, side: ["CH_2", "COOH"], navn: "asparaginsyre" }]);
            aa("bas", [{ x: KB.x + KB.b / 2, side: ["CH_2", "CH_2", "CH_2", "CH_2", "NH_2"], navn: "lysin" }]);

            /* ----- Lag 3 ------------------------------------------------------ */
            api.del("baseA", {
                lag: 2, auto: true,
                fuld: function (g) {
                    FP.kort(g, KA.x, KA.y, KA.b, KA.h);
                    ORG.t(g, KA.x + 22, KA.y + 34, "Glycin reagerer med sig selv", { fs: 15, fed: true, farve: F.accent, anker: "start" });
                    FP.kaedeTekst(g, GX0, AY, [["H_2N", F.neg], ["CH_2", F.blaek], ["COOH", F.pos]], AFS);
                    FP.pil(g, AMID, AY + 18, AMID, AY2 - 20, F.blaek, 2.2, 10);
                }
            });
            api.del("amfo", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.kaedeTekst(gg, AX0, AY2, [["^+H_3N", F.pos], ["CH_2", F.blaek], ["COO^−", F.neg]], AFS);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("baseD", {
                lag: 2, auto: true,
                fuld: function (g) {
                    FP.kort(g, KD.x, KD.y, KD.b, KD.h);
                    KV.diagram(g, { xa: DG.xa, xb: DG.xb, ya: DG.ya, yb: DG.yb, xmax: 14, ymax: 100, xtrin: 2, ytrin: 25, ydec: 0, fs: 12.5,
                        ytitel: "andel i %", yafst: 44 });
                    ORG.t(g, DG.xb + 14, DG.yb + 21, "pH", { fs: 13.5, farve: F.daempet, anker: "start" });
                }
            });
            api.del("kurver", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g), P = [[], [], []];
                    for (var ph = 0; ph <= 14.0001; ph += 0.1) {
                        var a = andele(ph);
                        for (var k = 0; k < 3; k++) P[k].push([DX(ph), DYv(a[k])]);
                    }
                    KV.kurve(gg, P[0], "#c0392b", 2.6);
                    KV.kurve(gg, P[2], "#1d4ed8", 2.6);
                    KV.kurve(gg, P[1], F.accent, 2.6);
                    [PK1, PK2].forEach(function (pk) { KV.punkt(gg, DX(pk), DYv(50), "a", 4.5); });
                    ORG.t(gg, DX(1.0), DYv(28), "syreform", { fs: 14, fed: true, farve: "#c0392b", halo: true });
                    ORG.t(gg, DX(1.0), DYv(28) + 17, "ladning +1", { fs: 13, farve: "#c0392b", halo: true });
                    ORG.t(gg, DX(12.8), DYv(28), "baseform", { fs: 14, fed: true, farve: "#1d4ed8", halo: true });
                    ORG.t(gg, DX(12.8), DYv(28) + 17, "ladning −1", { fs: 13, farve: "#1d4ed8", halo: true });
                    ORG.t(gg, DX(4.1), DYv(72), "ladning 0", { fs: 13.5, fed: true, farve: F.accent, halo: true });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });
            api.del("iso", {
                lag: 2,
                fuld: function (g) { return { l: FP.linje(g, DX(PI), DG.ya - 6, DX(PI), DG.yb, "#7f9190", 1.6) }; },
                byg: function (g, r, an) { an.fade(g, 0, 400); }
            });
        }
    };
}());

/* =====================================================================
   fig_gas.js - figuren til 5.6 Gasser

   Øverst gassen i en cylinder med et stempel som i bogens figur
   gas-cylinder: pilen, der presser stemplet ned, er trykket, og højden
   af rummet med gas er volumenet (fra 5.1, sat på igen). Temperatur og
   stofmængde står der i forvejen. Nederst til venstre et termometer med
   grader celsius på venstre side og kelvin på højre, nederst til højre
   idealgasligningen med gaskonstanten R.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var KG = { x: 20, y: 14, b: 960, h: 410 };           /* kortet med gassen */
    var CX = 460, CB = 200, VTOP = 120, VBUND = 372;     /* cylinderen */
    var STEMPEL = 178;                                   /* stemplets overkant */
    var PIL = [CX - 30, 22, 60, 72];                     /* pilen, der presser ned */
    var TERM = CX + 75;                                  /* termometeret i gassen */
    var BRX = CX - CB / 2 - 18;                          /* klammen ved volumenet */
    var LBL = 640;                                       /* de givne navne til højre */

    var KK = { x: 20, y: 452, b: 486, h: 238 };          /* kortet med kelvin */
    var TX = 136, TTOP = 480, T0 = 646;                  /* termometeret med to skalaer */
    function ty(kelvin) { return T0 - kelvin * 0.375; }
    var KF = { x: 530, y: 452, b: 450, h: 238 };         /* kortet med ligningen */
    var FY = 548;
    var FX = { p: 616, d1: 642, V: 670, lig: 708, n: 746, d2: 772, R: 800, d3: 828, T: 856 };

    var MOLEKYLER = [[392, 228], [470, 214], [520, 250], [410, 282], [476, 300], [372, 336], [436, 352], [512, 330], [548, 296], [396, 250], [500, 362], [548, 214]];

    NK.FIGURER.gas = {
        vb: [1000, 700],
        lag: [
            { navn: "Gassen i cylinderen", pladser: ["tryk", "volumen"],
              ros: "Trykkes stemplet ned, bliver trykket større, og gassen fylder mindre." },
            { navn: "Temperaturen", pladser: ["kelvin", "det absolutte nulpunkt"],
              ros: "Kelvinskalaen begynder ved −273 °C. Man lægger 273 til talværdien i grader celsius." },
            { navn: "Ligningen", pladser: ["idealgasligningen", "gaskonstanten"],
              ros: "Idealgasligningen kobler tryk, volumen, stofmængde og temperatur. R er den samme for alle gasser." }
        ],
        pladser: [
            { id: "tryk", ord: ["tryk"], x: 790, y: 58, maal: [PIL[0] + PIL[2] + 4, 58], dele: ["pil"],
              omr: [{ r: PIL.concat([8]) }],
              fejl: { volumen: "<b>volumen</b> er, hvor meget gassen fylder. Pladsen peger på pilen, der presser stemplet ned.",
                      kelvin: "<b>kelvin</b> er en enhed for temperatur. Pladsen peger på pilen, der presser stemplet ned.",
                      gaskonstanten: "<b>gaskonstanten</b> er størrelsen R i ligningen. Pladsen peger på pilen, der presser stemplet ned." } },
            { id: "volumen", ord: ["volumen"], x: 160, y: 286, maal: [BRX - 4, 286], dele: ["vbr"],
              omr: [{ r: [BRX - 8, STEMPEL + 20, 20, VBUND - STEMPEL - 20, 6] }],
              fejl: { tryk: "<b>tryk</b> er, hvor kraftigt gassen presser på beholderens vægge. Pladsen peger på højden af rummet med gas.",
                      kelvin: "<b>kelvin</b> er en enhed for temperatur. Pladsen peger på højden af rummet med gas." } },

            { id: "kelvin", ord: ["kelvin"], x: 368, y: 528, maal: [TX + 88, 528], dele: ["klbl"],
              omr: [{ r: [TX + 16, TTOP + 4, 70, T0 - TTOP + 4, 8] }],
              fejl: { "det absolutte nulpunkt": "<b>det absolutte nulpunkt</b> er kun bunden af skalaen. Pladsen peger på hele rækken af tal med K.",
                      tryk: "<b>tryk</b> måles i bar. Pladsen peger på tallene til højre for termometeret.",
                      idealgasligningen: "<b>idealgasligningen</b> er en ligning. Pladsen peger på tallene til højre for termometeret." } },
            { id: "det absolutte nulpunkt", ord: ["det absolutte nulpunkt"], x: 368, y: 648, maal: [TX + 102, T0], dele: ["nul"],
              omr: [{ r: [KK.x + 10, T0 - 14, TX + 88 - KK.x, 28, 8] }],
              fejl: { kelvin: "<b>kelvin</b> er enheden for hele skalaen til højre. Pladsen peger kun på bunden, den laveste temperatur.",
                      gaskonstanten: "<b>gaskonstanten</b> er størrelsen R i ligningen. Pladsen peger på den laveste temperatur, der findes." } },

            { id: "idealgasligningen", ord: ["idealgasligningen"], x: KF.x + KF.b / 2, y: KF.y, maal: [KF.x + KF.b / 2, KF.y], titel: true, dele: ["formel"],
              omr: [{ r: [KF.x - 5, KF.y - 5, KF.b + 10, KF.h + 10, 16], tom: true }],
              fejl: { gaskonstanten: "<b>gaskonstanten</b> er kun størrelsen R. Overskriften gælder hele ligningen med p, V, n, R og T.",
                      kelvin: "<b>kelvin</b> er en enhed for temperatur. Overskriften gælder hele ligningen med p, V, n, R og T." } },
            { id: "gaskonstanten", ord: ["gaskonstanten"], x: 830, y: 648, maal: [FX.R, FY + 12], dele: ["rr"],
              omr: [{ r: [FX.R - 17, FY - 30, 34, 40, 7] }],
              fejl: { idealgasligningen: "<b>idealgasligningen</b> er hele ligningen. Pladsen peger kun på bogstavet R.",
                      tryk: "<b>tryk</b> har symbolet p. Pladsen peger på bogstavet R i ligningen.",
                      "det absolutte nulpunkt": "<b>det absolutte nulpunkt</b> er en temperatur. Pladsen peger på bogstavet R i ligningen." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: cylinderen med gassen ------------------------------- */
            api.del("gas", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KG.x, KG.y, KG.b, KG.h);
                    var x1 = CX - CB / 2, x2 = CX + CB / 2;
                    /* Varmepladen */
                    SV.el("rect", { x: x1 - 50, y: VBUND + 14, width: CB + 100, height: 30, rx: 8, fill: "#3f464e" }, g);
                    SV.el("rect", { x: x1 - 44, y: VBUND + 6, width: CB + 88, height: 10, rx: 4, fill: "#d9692b" }, g);
                    SV.el("circle", { cx: x2 + 30, cy: VBUND + 29, r: 8, fill: "#e9edf1" }, g);
                    SV.el("circle", { cx: x1 - 30, cy: VBUND + 29, r: 4, fill: "#ff6a4d" }, g);
                    /* Gassen og glasset */
                    SV.el("rect", { x: x1, y: STEMPEL + 20, width: CB, height: VBUND - STEMPEL - 20, fill: "#e9f2fa" }, g);
                    SV.el("path", { d: "M" + (x1 - 8) + "," + VTOP + " L" + x1 + "," + VTOP + " L" + x1 + "," + (VBUND - 14) + " Q" + x1 + "," + VBUND + " " + (x1 + 14) + "," + VBUND +
                        " L" + (x2 - 14) + "," + VBUND + " Q" + x2 + "," + VBUND + " " + x2 + "," + (VBUND - 14) + " L" + x2 + "," + VTOP + " L" + (x2 + 8) + "," + VTOP,
                        fill: "none", stroke: "#5f6b77", "stroke-width": 3, "stroke-linejoin": "round" }, g);
                    /* Stemplet */
                    SV.el("rect", { x: CX - 7, y: 112, width: 14, height: STEMPEL - 112, fill: "#aab4be", stroke: "#6f7a85", "stroke-width": 1 }, g);
                    SV.el("rect", { x: CX - 62, y: 100, width: 124, height: 14, rx: 6, fill: "#b6bfc8", stroke: "#6f7a85", "stroke-width": 1.2 }, g);
                    SV.el("rect", { x: x1 + 2, y: STEMPEL, width: CB - 4, height: 20, rx: 3, fill: "#9aa5b0", stroke: "#5f6b77", "stroke-width": 1.2 }, g);
                    SV.el("rect", { x: x1 + 2, y: STEMPEL + 8, width: CB - 4, height: 5, fill: "#3a4048" }, g);
                    /* Termometeret */
                    SV.el("rect", { x: TERM - 6, y: 128, width: 12, height: 208, rx: 6, fill: "#f6f8fa", stroke: "#8d99a5", "stroke-width": 1.2 }, g);
                    SV.el("rect", { x: TERM - 2, y: 170, width: 4, height: 170, fill: "#d9433a" }, g);
                    SV.el("circle", { cx: TERM, cy: 342, r: 10, fill: "#d9433a", stroke: "#9c2a20", "stroke-width": 1 }, g);
                    /* Molekylerne */
                    MOLEKYLER.forEach(function (m, i) {
                        var v = i * 1.7;
                        SV.kugle(g, m[0] - 6 * Math.cos(v), m[1] - 6 * Math.sin(v), 8, "N");
                        SV.kugle(g, m[0] + 6 * Math.cos(v), m[1] + 6 * Math.sin(v), 8, "N");
                    });
                    /* Temperatur og stofmængde står der i forvejen */
                    SV.el("line", { x1: TERM + 8, y1: 190, x2: LBL - 8, y2: 190, stroke: "#5c6873", "stroke-width": 1.4 }, g);
                    SV.tekst(g, LBL, 198, "T", { "font-size": 26, "font-weight": 700, "font-style": "italic", fill: "#c0560f", "text-anchor": "start" });
                    SV.tekst(g, LBL + 24, 197, "temperatur", { "font-size": 18, fill: F.tekst, "text-anchor": "start" });
                    SV.el("polyline", { points: (MOLEKYLER[7][0] + 14) + "," + MOLEKYLER[7][1] + " " + (LBL - 8) + ",318 " + (MOLEKYLER[8][0] + 14) + "," + MOLEKYLER[8][1], fill: "none", stroke: "#5c6873", "stroke-width": 1.4 }, g);
                    SV.tekst(g, LBL, 326, "n", { "font-size": 26, "font-weight": 700, "font-style": "italic", fill: F.blaa, "text-anchor": "start" });
                    SV.tekst(g, LBL + 24, 325, "stofmængde", { "font-size": 18, fill: F.tekst, "text-anchor": "start" });
                }
            });

            api.del("pil", {
                lag: 0,
                fuld: function (g) {
                    var x = PIL[0] + PIL[2] / 2, y1 = PIL[1], y2 = PIL[1] + PIL[3];
                    var p = SV.el("path", { d: "M" + (x - 11) + "," + y1 + " L" + (x + 11) + "," + y1 + " L" + (x + 11) + "," + (y2 - 28) + " L" + (x + 26) + "," + (y2 - 28) + " L" + x + "," + y2 +
                        " L" + (x - 26) + "," + (y2 - 28) + " L" + (x - 11) + "," + (y2 - 28) + " Z", fill: "#e2554a", stroke: "#9c2a20", "stroke-width": 1.4 }, g);
                    var t = SV.tekst(g, PIL[0] - 8, 66, "p", { "font-size": 30, "font-weight": 700, "font-style": "italic", fill: "#b8322a", "text-anchor": "end" });
                    return { p: p, t: t };
                },
                byg: function (g, r, an) { an.pop(r.p, 0, 450); an.pop(r.t, 250, 400); }
            });

            api.del("vbr", {
                lag: 0,
                fuld: function (g) {
                    var y1 = STEMPEL + 20, y2 = VBUND;
                    var k = SV.el("path", { d: "M" + (BRX + 8) + "," + y1 + " L" + BRX + "," + y1 + " L" + BRX + "," + y2 + " L" + (BRX + 8) + "," + y2, fill: "none", stroke: F.teal, "stroke-width": 2.6 }, g);
                    var t = SV.tekst(g, BRX - 10, 256, "V", { "font-size": 30, "font-weight": 700, "font-style": "italic", fill: F.teal, "text-anchor": "end" });
                    return { k: k, t: t };
                },
                byg: function (g, r, an) { an.streg(r.k, 0, 600); an.pop(r.t, 300, 400); }
            });

            /* ----- Lag 2: termometeret med to skalaer ---------------------------- */
            api.del("kterm", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KK.x, KK.y, KK.b, KK.h);
                    SV.el("rect", { x: TX - 7, y: TTOP, width: 14, height: T0 - TTOP + 10, rx: 7, fill: "#f6f8fa", stroke: "#8d99a5", "stroke-width": 1.2 }, g);
                    SV.el("rect", { x: TX - 3, y: ty(293), width: 6, height: T0 + 8 - ty(293), fill: "#d9433a" }, g);
                    SV.el("circle", { cx: TX, cy: T0 + 18, r: 12, fill: "#d9433a", stroke: "#9c2a20", "stroke-width": 1 }, g);
                    [[373, "100 °C"], [273, "0 °C"]].forEach(function (m) {
                        SV.el("line", { x1: TX - 14, y1: ty(m[0]), x2: TX + 14, y2: ty(m[0]), stroke: "#5c6873", "stroke-width": 1.8 }, g);
                        SV.tekst(g, TX - 20, ty(m[0]) + 6, m[1], { "font-size": 16, "font-weight": 700, "text-anchor": "end" });
                    });
                }
            });

            api.del("klbl", {
                lag: 1,
                fuld: function (g) {
                    var t = [[373, "373 K"], [273, "273 K"], [0, "0 K"]].map(function (m) {
                        return SV.tekst(g, TX + 22, ty(m[0]) + 6, m[1], { "font-size": 16, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
                    });
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 150, 400); }); }
            });

            api.del("nul", {
                lag: 1,
                fuld: function (g) {
                    var l = SV.el("line", { x1: TX - 16, y1: T0, x2: TX + 16, y2: T0, stroke: F.blaa, "stroke-width": 3 }, g);
                    var t = SV.tekst(g, TX - 20, T0 + 6, "−273 °C", { "font-size": 16, "font-weight": 700, fill: F.blaa, "text-anchor": "end" });
                    return { l: l, t: t };
                },
                byg: function (g, r, an) { an.pop(r.l, 0, 400); an.pop(r.t, 200, 400); }
            });

            /* ----- Lag 3: idealgasligningen --------------------------------------- */
            api.del("formel", {
                lag: 2,
                fuld: function (g) {
                    var k = ORG.kort(g, KF.x, KF.y, KF.b, KF.h, { fyld: "#f3f8f7", kant: "#8fc7bb" });
                    var it = { "font-size": 38, "font-weight": 700, "font-style": "italic" };
                    var al = { "font-size": 34, "font-weight": 700, fill: F.svag };
                    var t = SV.g(g);
                    SV.tekst(t, FX.p, FY, "p", it);
                    SV.tekst(t, FX.d1, FY - 2, "·", al);
                    SV.tekst(t, FX.V, FY, "V", it);
                    SV.tekst(t, FX.lig, FY - 2, "=", al);
                    SV.tekst(t, FX.n, FY, "n", it);
                    SV.tekst(t, FX.d2, FY - 2, "·", al);
                    SV.tekst(t, FX.d3, FY - 2, "·", al);
                    SV.tekst(t, FX.T, FY, "T", it);
                    return { k: k, t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.t, 200, 500); }
            });

            api.del("rr", {
                lag: 2,
                fuld: function (g) {
                    var r = SV.tekst(g, FX.R, FY, "R", { "font-size": 38, "font-weight": 700, "font-style": "italic", fill: F.teal });
                    var v = SV.tekst(g, KF.x + 24, 600, "R = 0,0831 L · bar/(mol · K)", { "font-size": 15, fill: F.svag, "text-anchor": "start" });
                    return { r: r, v: v };
                },
                byg: function (g, r, an) { an.pop(r.r, 0, 450); an.fade(r.v, 250, 400); }
            });
        }
    };
}());

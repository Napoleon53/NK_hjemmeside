/* =====================================================================
   fig_aekv.js - figuren til 5.4 Ækvivalente mængder

   Øverst reaktionsskemaet for ammoniak med stofmængderne under, som i
   bogens figur ammoniak-forhold: 2,0 mol N₂, 6,0 mol H₂ og 4,0 mol NH₃
   står i forholdet 1 : 3 : 2. Koefficient er fra kapitel 1 og sættes på
   igen. Nederst pølser og brød som i bogens figur begraensende:
   brødene slipper op først, og én pølse er i overskud.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var KR = { x: 30, y: 92, b: 940, h: 240 };           /* kortet med skemaet */
    var SY = 150;                                        /* skemaets grundlinje */
    var X = { n2: 300, plus: 395, k3: 462, h2: 510, pil: 610, k2: 696, nh3: 766 };
    var KOEF = [[X.k3, SY], [X.k2, SY]];
    var BX = [300, 486, 744], BY = 204, BW = 112, BH = 38;  /* boksene med stofmængder */
    var KLY = 262;                                       /* klammen under boksene */
    var KH = { x: 30, y: 362, b: 940, h: 218 };          /* kortet med pølser og brød */
    var BRX = 400;                                       /* brødenes midte */

    function polse(g, x, y) {
        var gg = SV.g(g);
        SV.el("rect", { x: x - 40, y: y - 12, width: 80, height: 24, rx: 12, fill: "#b8452f", stroke: "#7a2617", "stroke-width": 1.4 }, gg);
        SV.el("line", { x1: x - 28, y1: y - 6, x2: x + 26, y2: y - 6, stroke: "#e58a74", "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
        [-14, 0, 14].forEach(function (d) {
            SV.el("line", { x1: x + d - 4, y1: y + 8, x2: x + d + 4, y2: y - 2, stroke: "#7a2617", "stroke-width": 1.6, "stroke-linecap": "round" }, gg);
        });
        return gg;
    }
    function broed(g, x, y) {
        var gg = SV.g(g);
        SV.el("rect", { x: x - 50, y: y - 20, width: 100, height: 40, rx: 20, fill: "#efc27c", stroke: "#a8722a", "stroke-width": 1.6 }, gg);
        SV.el("path", { d: "M" + (x - 34) + "," + (y + 2) + " Q" + x + "," + (y + 9) + " " + (x + 34) + "," + (y + 2), fill: "none", stroke: "#a8722a", "stroke-width": 1.8 }, gg);
        SV.el("ellipse", { cx: x - 16, cy: y - 10, rx: 22, ry: 4, fill: "#ffffff", "fill-opacity": 0.45 }, gg);
        return gg;
    }
    function hotdog(g, x, y) { broed(g, x, y + 6); polse(g, x, y - 4); }

    NK.FIGURER.aekv = {
        vb: [1000, 600],
        lag: [
            { navn: "Opskriften", pladser: ["koefficient", "ækvivalente mængder", "begrænsende faktor"],
              ros: "Koefficienterne viser forholdet mellem stofmængderne. Det, der slipper op først, bestemmer, hvor meget der kan laves." }
        ],
        pladser: [
            { id: "koefficient", ord: ["koefficient"], x: X.k3, y: 44, maal: [X.k3, SY - 30], dele: ["koef"],
              omr: KOEF.map(function (k) { return { r: [k[0] - 15, k[1] - 30, 30, 38, 6] }; }),
              fejl: { "ækvivalente mængder": "<b>ækvivalente mængder</b> er antal mol. Pladsen peger på det store tal foran H₂ i skemaet.",
                      "begrænsende faktor": "<b>begrænsende faktor</b> er det, der slipper op først. Pladsen peger på det store tal foran H₂." } },
            { id: "ækvivalente mængder", ord: ["ækvivalente mængder"], x: BX[1] + 24, y: 304, maal: [BX[1] + 24, KLY + 12], dele: ["maengder"],
              omr: [{ r: [BX[0] - BW / 2 - 6, BY - BH / 2 - 6, BX[2] - BX[0] + BW + 12, KLY + 10 - (BY - BH / 2 - 6), 10] }],
              fejl: { koefficient: "<b>koefficient</b> er det store tal foran en formel. Pladsen peger på de tre stofmængder under skemaet.",
                      "begrænsende faktor": "<b>begrænsende faktor</b> slipper op først. Her står stofmængderne i forholdet 1 : 3 : 2, så intet bliver tilovers." } },
            { id: "begrænsende faktor", ord: ["begrænsende faktor"], x: BRX, y: 552, maal: [BRX, 532], dele: ["broed"],
              omr: [{ r: [BRX - 112, 384, 224, 146, 12] }],
              fejl: { "ækvivalente mængder": "<b>ækvivalente mængder</b> passer netop sammen. Her er der 4 pølser og kun 3 brød, så brødene slipper op først.",
                      koefficient: "<b>koefficient</b> er et tal i et reaktionsskema. Pladsen peger på det, der slipper op først." } }
        ],

        tegn: function (api) {
            /* ----- Skemaet står der fra start, koefficienterne venter på ordet --- */
            api.del("skema", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KR.x, KR.y, KR.b, KR.h);
                    var a = { "font-size": 34, "font-weight": 700 };
                    SV.tekst(g, X.n2, SY, "N_2", a);
                    SV.tekst(g, X.plus, SY, "+", { "font-size": 30, fill: F.svag });
                    SV.tekst(g, X.h2, SY, "H_2", a);
                    ORG.pil(g, X.pil - 34, X.pil + 34, SY - 11, { farve: F.tekst, bredde: 2.6 });
                    SV.tekst(g, X.nh3, SY, "NH_3", a);
                    SV.tekst(g, KR.x + 24, BY + 6, "stofmængde", { "font-size": 15, fill: F.svag, "text-anchor": "start" });
                }
            });

            api.del("koef", {
                lag: 0,
                fuld: function (g) {
                    var t = KOEF.map(function (k) {
                        return SV.tekst(g, k[0], k[1], k === KOEF[0] ? "3" : "2", { "font-size": 34, "font-weight": 700, fill: F.teal });
                    });
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 150, 450); }); }
            });

            api.del("maengder", {
                lag: 0,
                fuld: function (g) {
                    var bokse = [["2,0 mol", "#f3f6f8", "#c5d1dc"], ["6,0 mol", "#e8f5ec", "#3fae72"], ["4,0 mol", "#e3f1ee", F.teal]].map(function (b, i) {
                        var gg = SV.g(g);
                        SV.el("rect", { x: BX[i] - BW / 2, y: BY - BH / 2, width: BW, height: BH, rx: 9, fill: b[1], stroke: b[2], "stroke-width": 1.8 }, gg);
                        SV.tekst(gg, BX[i], BY + 7, b[0], { "font-size": 19, "font-weight": 700 });
                        return gg;
                    });
                    var x1 = BX[0] - BW / 2, x2 = BX[2] + BW / 2, m = BX[1] + 24;
                    var k = SV.el("path", { d: "M" + x1 + "," + (KLY - 8) + " L" + x1 + "," + KLY + " L" + x2 + "," + KLY + " L" + x2 + "," + (KLY - 8) + " M" + m + "," + KLY + " L" + m + "," + (KLY + 8),
                        fill: "none", stroke: "#5c6873", "stroke-width": 1.8 }, g);
                    return { b: bokse, k: k };
                },
                byg: function (g, r, an) { r.b.forEach(function (b, i) { an.pop(b, i * 150, 450); }); an.streg(r.k, 450, 600); }
            });

            /* ----- Pølser og brød ----------------------------------------------- */
            api.del("hotdog", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KH.x, KH.y, KH.b, KH.h);
                    [[110, 424], [206, 424], [110, 466], [206, 466]].forEach(function (p) { polse(g, p[0], p[1]); });
                    SV.tekst(g, 158, 520, "4 pølser", { "font-size": 17, "font-weight": 700 });
                    SV.tekst(g, 278, 452, "+", { "font-size": 28, fill: F.svag });
                    ORG.pil(g, 528, 592, 446, { farve: F.tekst, bredde: 2.6 });
                    [[660, 424], [770, 424], [715, 472]].forEach(function (p) { hotdog(g, p[0], p[1]); });
                    SV.tekst(g, 715, 520, "3 hotdogs", { "font-size": 17, "font-weight": 700 });
                    SV.tekst(g, 838, 452, "+", { "font-size": 28, fill: F.svag });
                    polse(g, 900, 446);
                    SV.tekst(g, 900, 520, "1 pølse", { "font-size": 17, "font-weight": 700 });
                    SV.tekst(g, 900, 544, "i overskud", { "font-size": 15, fill: F.svag });
                }
            });

            api.del("broed", {
                lag: 0,
                fuld: function (g) {
                    var b = [[BRX - 54, 424], [BRX + 54, 424], [BRX, 470]].map(function (p) { return broed(g, p[0], p[1]); });
                    SV.tekst(g, BRX, 520, "3 brød", { "font-size": 17, "font-weight": 700 });
                    return { b: b };
                },
                byg: function (g, r, an) { r.b.forEach(function (b, i) { an.pop(b, i * 150, 450); }); }
            });
        }
    };
}());

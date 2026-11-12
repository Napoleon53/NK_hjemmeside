/* =====================================================================
   fig_polaer.js - figuren til 3.4 Polære molekyler og blandbarhed

   Øverst et vandmolekyle med δ+ og δ− og pile, der viser, hvor
   elektronerne trækkes hen (bogens figur polaere-molekyler), og
   propan-1-ol som stregformel med den upolære del i en grå kasse og
   −OH i en teal kasse (bogens figur tommelfinger-trin).
   Nederst to reagensglas som i bogens figur blandbarhed-glas: vand og
   ethanol giver ét lag, vand og heptan to lag.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var VK = { x: 30, y: 30, b: 270, h: 236 };           /* kortet med vand */
    var PK = { x: 330, y: 30, b: 420, h: 236 };          /* kortet med propan-1-ol */
    var PY = PK.y + 128;                                 /* stregformlens midte */
    var CXS = [450, 510, 570], OX = 632, HX = 684;       /* atomerne i propan-1-ol */
    var OH = { x: OX - 20, y: PY - 20, b: HX + 18 - (OX - 20), h: 40 };

    var RA = { x: 30, y: 318, b: 940, h: 272 };          /* rammen om glassene */
    var GA = 250, GB = 520;                              /* glassenes midte */
    var GT = 360, GL = 432, GS = 482, GBUND = 552;       /* top, vaeskens top, skillelinje, bund */
    var GR = 30;

    function sym(g, x, y, s, f) { return SV.tekst(g, x, y + 8, s, { "font-size": 22, "font-weight": 700, fill: f || F.tekst }); }
    function streg(g, x1, y1, x2, y2) {
        return SV.el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: F.tekst, "stroke-width": 2.2, "stroke-linecap": "round" }, g);
    }

    /* Et reagensglas: lige sider og en rund bund. fra og til er vaeskens top og bund */
    function glasSti(x, top) {
        return "M" + (x - GR) + "," + top + " L" + (x - GR) + "," + (GBUND - GR) + " A" + GR + "," + GR + " 0 0,0 " + (x + GR) + "," + (GBUND - GR) + " L" + (x + GR) + "," + top;
    }
    function vaeske(g, x, fra, til, fyld) {
        var d;
        if (til >= GBUND) d = "M" + (x - GR + 2) + "," + fra + " L" + (x - GR + 2) + "," + (GBUND - GR) + " A" + (GR - 2) + "," + (GR - 2) + " 0 0,0 " + (x + GR - 2) + "," + (GBUND - GR) + " L" + (x + GR - 2) + "," + fra + " Z";
        else d = "M" + (x - GR + 2) + "," + fra + " L" + (x - GR + 2) + "," + til + " L" + (x + GR - 2) + "," + til + " L" + (x + GR - 2) + "," + fra + " Z";
        return SV.el("path", { d: d, fill: fyld }, g);
    }
    function glas(g, x) {
        SV.el("path", { d: glasSti(x, GT) + " Z", fill: "url(#glas)", stroke: "none" }, g);
        SV.el("path", { d: glasSti(x, GT), fill: "none", stroke: "#8fa3b5", "stroke-width": 2.2 }, g);
        SV.el("ellipse", { cx: x, cy: GT, rx: GR + 3, ry: 5, fill: "#eef3f7", stroke: "#8fa3b5", "stroke-width": 2 }, g);
        SV.el("line", { x1: x - GR + 9, y1: GT + 14, x2: x - GR + 9, y2: GBUND - GR - 6, stroke: "#ffffff", "stroke-width": 4, "stroke-opacity": 0.7, "stroke-linecap": "round" }, g);
    }

    function pil(g, x1, y1, x2, y2) {
        var v = Math.atan2(y2 - y1, x2 - x1), l = 11;
        var gg = SV.g(g);
        SV.el("line", { x1: x1, y1: y1, x2: x2 - 8 * Math.cos(v), y2: y2 - 8 * Math.sin(v), stroke: F.teal, "stroke-width": 2.8, "stroke-linecap": "round" }, gg);
        SV.el("polygon", { points: x2 + "," + y2 + " " + (x2 - l * Math.cos(v) + 5 * Math.sin(v)) + "," + (y2 - l * Math.sin(v) - 5 * Math.cos(v)) + " " +
            (x2 - l * Math.cos(v) - 5 * Math.sin(v)) + "," + (y2 - l * Math.sin(v) + 5 * Math.cos(v)), fill: F.teal }, gg);
        return gg;
    }

    NK.FIGURER.polaer = {
        vb: [1000, 610],
        lag: [
            { navn: "Molekylerne", pladser: ["polært molekyle", "polær gruppe"],
              ros: "Vandmolekylet har en positiv og en negativ ende. I et større molekyle er det −OH-gruppen, der er polær." },
            { navn: "Ét lag eller to", pladser: ["blandbarhed", "upolært stof", "polært stof"],
              ros: "Polære stoffer blandes med hinanden, og upolære med hinanden. Et polært og et upolært stof giver to lag." }
        ],
        pladser: [
            { id: "polært molekyle", ord: ["polært molekyle"], x: VK.x + VK.b / 2, y: VK.y + VK.h, maal: [VK.x + VK.b / 2, VK.y + VK.h], titel: true, dele: ["vand"],
              omr: [{ r: [VK.x - 5, VK.y - 5, VK.b + 10, VK.h + 10, 16] }],
              fejl: { "polær gruppe": "<b>polær gruppe</b> er kun en del af et større molekyle. Kortet viser et helt vandmolekyle." } },
            { id: "polær gruppe", ord: ["polær gruppe"], x: 880, y: PY, maal: [OH.x + OH.b + 4, PY], dele: ["oh"],
              omr: [{ r: [OH.x - 3, OH.y - 3, OH.b + 6, OH.h + 6, 10] }],
              fejl: { "polært molekyle": "<b>polært molekyle</b> er en hel partikel. Pladsen peger kun på −OH i enden af molekylet." } },

            /* Overskriften staar midt mellem glassene, ikke over glasset med to lag
               (brugeren 1. nov. 2026) */
            { id: "blandbarhed", ord: ["blandbarhed"], x: (GA + GB) / 2, y: RA.y, maal: [(GA + GB) / 2, RA.y], titel: true, dele: ["glas"],
              omr: [{ r: [RA.x - 6, RA.y - 6, RA.b + 12, RA.h + 12, 18], tom: true }],
              fejl: { "polært stof": "<b>polært stof</b> er ét af stofferne. Overskriften gælder begge glas: Bliver de to væsker til én?",
                      "upolært stof": "<b>upolært stof</b> er ét af stofferne. Overskriften gælder begge glas: Bliver de to væsker til én?" } },
            { id: "upolært stof", ord: ["upolært stof"], x: 770, y: (GL + GS) / 2, maal: [GB + GR + 6, (GL + GS) / 2], dele: ["heptan"],
              omr: [{ r: [GB - GR - 2, GL - 2, 2 * GR + 4, GS - GL + 2, 4] }],
              fejl: { "polært stof": "<b>polært stof</b> kan opløses i vand. Heptan lægger sig som et lag oven på vandet.",
                      blandbarhed: "<b>blandbarhed</b> er overskrift for begge glas. Pladsen peger kun på det øverste lag." } },
            { id: "polært stof", ord: ["polært stof"], x: 770, y: (GS + GBUND) / 2, maal: [GB + GR + 6, (GS + GBUND) / 2 - 4], dele: ["vandlag"],
              omr: [{ r: [GB - GR - 2, GS + 1, 2 * GR + 4, GBUND - GS + 1, 14] }],
              fejl: { "upolært stof": "<b>upolært stof</b> kan ikke opløses i vand. Pladsen peger på selve vandet i bunden.",
                      blandbarhed: "<b>blandbarhed</b> er overskrift for begge glas. Pladsen peger kun på vandet i bunden." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: vandmolekylet ----------------------------------------- */
            api.del("vand", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: VK.x, y: VK.y, width: VK.b, height: VK.h, rx: 14, fill: "#f6f9fb", stroke: "#c5d1dc", "stroke-width": 1.5, filter: "url(#skygge)" }, g);
                    var x = VK.x + VK.b / 2, y = VK.y + 104;
                    var h1 = [x - 58, y + 46], h2 = [x + 58, y + 46];
                    [h1, h2].forEach(function (h) {
                        SV.el("line", { x1: x, y1: y, x2: h[0], y2: h[1], stroke: "#9aa3ad", "stroke-width": 6, "stroke-linecap": "round" }, g);
                    });
                    SV.kugle(g, x, y, 30, "O", "O");
                    SV.kugle(g, h1[0], h1[1], 18, "H", "H");
                    SV.kugle(g, h2[0], h2[1], 18, "H", "H");
                    var t = SV.g(g);
                    SV.tekst(t, x, y - 42, "δ−", { "font-size": 20, "font-weight": 700, fill: F.blaa });
                    SV.tekst(t, h1[0] - 22, h1[1] + 34, "δ+", { "font-size": 20, "font-weight": 700, fill: F.roed });
                    SV.tekst(t, h2[0] + 22, h2[1] + 34, "δ+", { "font-size": 20, "font-weight": 700, fill: F.roed });
                    var p = SV.g(g);
                    pil(p, x - 92, y + 4, x - 46, y - 26);
                    pil(p, x + 92, y + 4, x + 46, y - 26);
                    SV.tekst(g, x, VK.y + VK.h - 40, "vand, H_2O", { "font-size": 16, "font-weight": 700, fill: F.svag });
                    return { t: t, p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 300, 450); an.pop(r.t, 500, 450); }
            });

            /* ----- Lag 1: propan-1-ol; kun −OH venter paa sit ord --------------- */
            api.del("propanol", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: PK.x, y: PK.y, width: PK.b, height: PK.h, rx: 14, fill: "#f6f9fb", stroke: "#c5d1dc", "stroke-width": 1.5, filter: "url(#skygge)" }, g);
                    SV.tekst(g, PK.x + PK.b / 2, PK.y + 30, "propan-1-ol", { "font-size": 17, "font-weight": 700, fill: F.svag });
                    /* Den upolaere del i en graa kasse */
                    SV.el("rect", { x: 392, y: PY - 62, width: CXS[2] + 22 - 392, height: 124, rx: 10, fill: "#eef1f4", stroke: "#a9b3bd", "stroke-width": 1.4 }, g);
                    sym(g, 405, PY, "H");
                    streg(g, 417, PY, 438, PY);
                    CXS.forEach(function (c, i) {
                        sym(g, c, PY, "C");
                        sym(g, c, PY - 44, "H");
                        sym(g, c, PY + 44, "H");
                        streg(g, c, PY - 13, c, PY - 29);
                        streg(g, c, PY + 13, c, PY + 29);
                        if (i < 2) streg(g, c + 13, PY, c + 47, PY);
                    });
                    streg(g, CXS[2] + 13, PY, OX - 13, PY);
                    SV.tekst(g, PK.x + PK.b / 2, PK.y + PK.h - 18, "upolær del og polær gruppe", { "font-size": 13.5, fill: F.mat, "font-style": "italic" });
                }
            });

            api.del("oh", {
                lag: 0,
                fuld: function (g) {
                    var k = SV.el("rect", { x: OH.x, y: OH.y, width: OH.b, height: OH.h, rx: 20, fill: F.teal }, g);
                    var t = SV.g(g);
                    SV.tekst(t, OX, PY + 8, "O", { "font-size": 22, "font-weight": 700, fill: "#ffffff" });
                    SV.el("line", { x1: OX + 13, y1: PY, x2: HX - 12, y2: PY, stroke: "#ffffff", "stroke-width": 2.2, "stroke-linecap": "round" }, t);
                    SV.tekst(t, HX, PY + 8, "H", { "font-size": 22, "font-weight": 700, fill: "#ffffff" });
                    return { k: k, t: t };
                },
                byg: function (g, r, an) { an.pop(r.k, 0, 450); an.fade(r.t, 200, 400); }
            });

            /* ----- Lag 2: glassene ---------------------------------------------- */
            api.del("glas", {
                lag: 1,
                fuld: function (g) {
                    var ramme = SV.el("rect", { x: RA.x, y: RA.y, width: RA.b, height: RA.h, rx: 16, fill: "#f7f9fb", stroke: "#c5d1dc", "stroke-width": 1.6 }, g);
                    /* Glas A: vand og ethanol er blevet til én vaeske */
                    glas(g, GA);
                    vaeske(g, GA, GL, GBUND, "#b9d8f0");
                    SV.tekst(g, GA - GR - 14, (GL + GBUND) / 2 + 5, "vand og ethanol", { "font-size": 15, "font-weight": 600, fill: F.svag, "text-anchor": "end" });
                    SV.tekst(g, GA, GBUND + 26, "ét lag", { "font-size": 16, "font-weight": 700 });
                    /* Glas B: kun glasset; lagene er hver sin del */
                    glas(g, GB);
                    SV.tekst(g, GB - GR - 14, (GL + GS) / 2 + 5, "heptan", { "font-size": 15, "font-weight": 600, fill: F.svag, "text-anchor": "end" });
                    SV.tekst(g, GB - GR - 14, (GS + GBUND) / 2 + 1, "vand", { "font-size": 15, "font-weight": 600, fill: F.svag, "text-anchor": "end" });
                    SV.tekst(g, GB, GBUND + 26, "to lag", { "font-size": 16, "font-weight": 700 });
                    return { ramme: ramme };
                },
                byg: function (g, r, an) { an.streg(r.ramme, 0, 800); }
            });

            api.del("heptan", {
                lag: 1,
                fuld: function (g) {
                    var v = vaeske(g, GB, GL, GS, "#f6edc4");
                    return { v: v };
                },
                byg: function (g, r, an) { an.fade(r.v, 0, 500); }
            });

            api.del("vandlag", {
                lag: 1,
                fuld: function (g) {
                    var v = vaeske(g, GB, GS, GBUND, "#b9d8f0");
                    SV.el("line", { x1: GB - GR + 2, y1: GS, x2: GB + GR - 2, y2: GS, stroke: "#8fb2cf", "stroke-width": 1.6 }, g);
                    return { v: v };
                },
                byg: function (g, r, an) { an.fade(r.v, 0, 500); }
            });
        }
    };
}());

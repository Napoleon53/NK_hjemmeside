/* =====================================================================
   fig_tlc.js - figuren til B8.6 TLC

   Foroven en ramme med to kort: kaffefilteret med sort tusch fra bogens
   indledning og bogens b8-tlc-opstilling (karret med laag, pladen og
   loebevaesken i bunden). chromatografi er rammens titel, fordi ordet er
   det faelles navn for begge metoder. Parret tyndtlagschromatografi eller
   TLC peger paa karret, stationær fase paa pladen, parret mobil fase eller
   løbevæske paa vaesken i bunden og væskefront paa kanten af den vaade
   del af pladen. Bogens etiketter ved karret er taget af, fordi de er
   ordene.
   Forneden bogens b8-tlc-rf: pladen ved en lineal med 3,6 cm og 5,0 cm,
   og Rf-værdi staar som venstresiden i beregningen 3,6 cm / 5,0 cm = 0,72.
   Bogens etiket "væskefront" ved pladen er taget af.
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KV = NK.KV;
    var LAB = NK.LAB;
    var B8 = NK.B8;
    var F = ORG.F;
    var f1 = B8.f1;

    /* ----- Lag 1 og 2: rammen, kaffefilteret og karret -------------------- */
    var FR = { x: 16, y: 26, b: 1128, h: 450 };
    var KK = { x: 32, y: 104, b: 230, h: 356 };
    var KT = { x: 278, y: 104, b: 850, h: 356 };
    var J = { x: 588, y: 128, b: 230, h: 250 };
    var JV = J.y + J.h - 34;                                   /* vaeskens top */
    var PL = { x: J.x + J.b * 0.22, y: J.y + 44, b: J.b * 0.56, h: J.h - 64 };
    var START = JV - 16, FRONT = PL.y + 46;
    var BANER = [0.25, 0.5, 0.75].map(function (t) { return PL.x + PL.b * t; });
    var PLETTER = [[0, 236, "#7b3fb8"], [1, 262, "#e07b2a"], [2, 300, "#14806f"]];
    var KF = { cx: 147, bund: 442, top: 184, vand: 414 };      /* kaffefilteret */
    var STRIMMEL = { x: KF.cx - 25, b: 50, top: 192, bund: 436 };

    /* ----- Lag 3: Rf-vaerdien --------------------------------------------- */
    var KR = { x: 16, y: 502, b: 1128, h: 192 };
    var RP = { x: 300, b: 80, start: 662, front: 532 };
    var CM = (RP.start - RP.front) / 5;
    var PLET = RP.start - 3.6 * CM;
    var FORMEL = { y: 598, x0: 612 };

    function vaesketop(g, x0, x1, y) {
        var d = "M" + x0 + "," + y, n = 8;
        for (var i = 1; i <= n; i++) {
            var x = x0 + (x1 - x0) * i / n;
            d += " Q" + f1(x - (x1 - x0) / n / 2) + "," + f1(y + (i % 2 ? -3 : 3)) + " " + f1(x) + "," + f1(y);
        }
        return d;
    }

    function plet(g, x, y, farve, r) { return B8.plet(g, x, y, farve, r); }

    var TLC_FEJL = {
        chromatografi: "<b>chromatografi</b> er det fælles navn for flere metoder. Pladsen peger kun på karret med pladen af kiselgel.",
        "stationær fase": "<b>stationær fase</b> er kun laget på pladen. Pladsen peger på hele opstillingen med kar, plade og væske."
    };
    var MOBIL_FEJL = {
        "stationær fase": "<b>stationær fase</b> er laget på pladen. Pladsen peger på væsken i bunden af karret.",
        "væskefront": "<b>væskefront</b> er den øverste kant af væsken på pladen. Pladsen peger på væsken i bunden af karret."
    };

    NK.FIGURER.tlc = {
        vb: [1160, 708],
        lag: [
            { navn: "Metoden", pladser: ["chromatografi", "tyndtlagschromatografi", "TLC"],
              ros: "Chromatografi skiller en blanding ad med en væske. Tyndtlagschromatografi, TLC, bruger en plade med kiselgel." },
            { navn: "Pladen og væsken", pladser: ["stationær fase", "mobil fase", "løbevæske"],
              ros: "Den stationære fase er laget på pladen. Den mobile fase, løbevæsken, suges op og tager stofferne med." },
            { navn: "Fronten og Rf-værdien", pladser: ["væskefront", "Rf-værdi"],
              ros: "Væskefronten er væskens øverste kant. Rf-værdien er plettens afstand divideret med frontens afstand." }
        ],
        pladser: [
            { id: "chromatografi", ord: ["chromatografi"], x: FR.x + FR.b / 2, y: FR.y, maal: [FR.x + FR.b / 2, FR.y], titel: true, dele: ["ramme", "filter"],
              omr: [{ r: [FR.x - 4, FR.y - 4, FR.b + 8, FR.h + 8, 20], tom: true }],
              fejl: { tyndtlagschromatografi: "<b>tyndtlagschromatografi</b> er kun metoden med pladen. Overskriften gælder både kaffefilteret og karret.",
                      TLC: "<b>TLC</b> er kun metoden med pladen. Overskriften gælder både kaffefilteret og karret med pladen." } },
            { id: "tyndtlagschromatografi", ord: ["tyndtlagschromatografi", "TLC"], par: "TLC", x: J.x + J.b / 2, y: 70, maal: [J.x + J.b / 2, J.y - 12], dele: ["kar"],
              omr: [{ r: [J.x - 14, J.y - 16, J.b + 28, J.h + 22, 14], tom: true }], fejl: TLC_FEJL },
            { id: "TLC", ord: ["tyndtlagschromatografi", "TLC"], x: J.x + J.b / 2, y: 70, maal: [J.x + J.b / 2, J.y - 12], dele: ["kar"],
              omr: [{ r: [J.x - 14, J.y - 16, J.b + 28, J.h + 22, 14], tom: true }], fejl: TLC_FEJL },

            { id: "stationær fase", ord: ["stationær fase"], x: 440, y: 290, maal: [PL.x + 2, 290], dele: ["plade"],
              omr: [{ r: [PL.x - 4, PL.y - 4, PL.b + 8, PL.h + 8, 4] }],
              fejl: { "mobil fase": "<b>mobil fase</b> er væsken, der bevæger sig. Pladsen peger på pladen, som stofferne hænger fast på.",
                      "løbevæske": "<b>løbevæske</b> er væsken, der bevæger sig. Pladsen peger på pladen, som stofferne hænger fast på.",
                      "væskefront": "<b>væskefront</b> er kun den øverste kant af væsken. Pladsen peger på hele pladen.",
                      TLC: "<b>TLC</b> er hele metoden. Pladsen peger kun på pladen i karret." } },
            { id: "mobil fase", ord: ["mobil fase", "løbevæske"], par: "løbevæske", x: J.x + J.b / 2, y: 422, maal: [J.x + J.b / 2, JV + 22], dele: ["vaeske"],
              omr: [{ r: [J.x + 2, JV - 6, J.b - 4, J.h - (JV - J.y) + 4, 8] }], fejl: MOBIL_FEJL },
            { id: "løbevæske", ord: ["mobil fase", "løbevæske"], x: J.x + J.b / 2, y: 422, maal: [J.x + J.b / 2, JV + 22], dele: ["vaeske"],
              omr: [{ r: [J.x + 2, JV - 6, J.b - 4, J.h - (JV - J.y) + 4, 8] }], fejl: MOBIL_FEJL },

            { id: "væskefront", ord: ["væskefront"], x: 966, y: FRONT, maal: [PL.x + PL.b - 2, FRONT], dele: ["front"],
              omr: [{ linje: [[PL.x + 2, FRONT], [PL.x + PL.b - 2, FRONT]], b: 16 }],
              fejl: { "mobil fase": "<b>mobil fase</b> er hele væsken. Pladsen peger kun på den øverste kant af den våde del af pladen.",
                      "løbevæske": "<b>løbevæske</b> er hele væsken. Pladsen peger kun på den øverste kant af den våde del af pladen.",
                      "stationær fase": "<b>stationær fase</b> er hele laget på pladen. Pladsen peger på linjen, hvor den våde del af pladen slutter." } },
            { id: "Rf-værdi", ord: ["Rf-værdi"], x: FORMEL.x0 + 140, y: FORMEL.y, maal: [FORMEL.x0 + 140, FORMEL.y], titel: true, dele: ["rf"],
              omr: [{ r: [FORMEL.x0 - 8, FORMEL.y - 42, 520, 84, 14] }],
              fejl: { "væskefront": "<b>væskefront</b> er en linje på pladen. Pladsen står i en beregning, hvor to afstande divideres." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KK.x, KK.y, KK.b, KK.h);
                    ORG.kortB(g, KT.x, KT.y, KT.b, KT.h);
                    ORG.t(g, KF.cx, KK.y + 32, "sort tusch på", { fs: 13, farve: F.daempet });
                    ORG.t(g, KF.cx, KK.y + 50, "et kaffefilter", { fs: 13, farve: F.daempet });
                    LAB.baeger(g, KF.cx, KF.bund, 150, KF.bund - KF.top, { top: KF.vand, fyld: "#d6e8f6" });
                    /* glasstaven og papiret */
                    SV.el("rect", { x: STRIMMEL.x, y: STRIMMEL.top, width: STRIMMEL.b, height: STRIMMEL.bund - STRIMMEL.top, fill: "#fbfaf4", stroke: "#c9c3ad", "stroke-width": 1.2 }, g);
                    SV.el("line", { x1: KF.cx - 84, y1: STRIMMEL.top - 4, x2: KF.cx + 84, y2: STRIMMEL.top - 4, stroke: "#9fb0c0", "stroke-width": 6, "stroke-linecap": "round" }, g);
                    SV.el("rect", { x: STRIMMEL.x + 6, y: STRIMMEL.top - 10, width: STRIMMEL.b - 12, height: 12, rx: 3, fill: "#5c6873" }, g);
                }
            });
            api.del("filter", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), x = KF.cx;
                    SV.el("rect", { x: STRIMMEL.x + 1, y: 242, width: STRIMMEL.b - 2, height: STRIMMEL.bund - 243, fill: "#dfeaf3", opacity: 0.8 }, gg);
                    /* tuschen er skilt ad i gult, roedt og blaat */
                    [[270, "#f1d13a", 22], [314, "#df5b4f", 18], [356, "#3f74d6", 18]].forEach(function (s) {
                        SV.el("ellipse", { cx: x, cy: s[0], rx: 17, ry: s[2] / 2, fill: s[1], opacity: 0.75 }, gg);
                    });
                    SV.el("circle", { cx: x, cy: 398, r: 5, fill: "#3b3f45", opacity: 0.35 }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: FR.x, y: FR.y, width: FR.b, height: FR.h, rx: 20, fill: "rgba(15,118,110,0.03)", stroke: F.accent, "stroke-width": 2.2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("kar", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), x = J.x, y = J.y, b = J.b, h = J.h, r = 10;
                    SV.el("path", { d: "M" + (x + 3) + "," + JV + " L" + (x + 3) + "," + (y + h - r) + " Q" + (x + 3) + "," + (y + h - 2) + " " + (x + r + 3) + "," + (y + h - 2) +
                        " L" + (x + b - r - 3) + "," + (y + h - 2) + " Q" + (x + b - 3) + "," + (y + h - 2) + " " + (x + b - 3) + "," + (y + h - r) + " L" + (x + b - 3) + "," + JV + " Z", fill: "#e6eef4" }, gg);
                    SV.el("rect", { x: PL.x, y: PL.y, width: PL.b, height: PL.h, rx: 2, fill: "#fbfbf7", stroke: "#a8b0a6", "stroke-width": 1.4 }, gg);
                    SV.el("line", { x1: PL.x + 8, y1: START, x2: PL.x + PL.b - 8, y2: START, stroke: "#6b7280", "stroke-width": 1.2 }, gg);
                    BANER.forEach(function (bx) { SV.el("line", { x1: bx, y1: START - 4, x2: bx, y2: START + 4, stroke: "#6b7280", "stroke-width": 1.2 }, gg); });
                    PLETTER.forEach(function (p) { plet(gg, BANER[p[0]], p[1], p[2], 6.5); });
                    SV.el("path", { d: "M" + x + "," + (y + 10) + " L" + x + "," + (y + h - r) + " Q" + x + "," + (y + h) + " " + (x + r) + "," + (y + h) + " L" + (x + b - r) + "," + (y + h) +
                        " Q" + (x + b) + "," + (y + h) + " " + (x + b) + "," + (y + h - r) + " L" + (x + b) + "," + (y + 10), fill: "url(#glas)", "fill-opacity": 0.4, stroke: LAB.KANT, "stroke-width": 1.8 }, gg);
                    SV.el("line", { x1: x + 8, y1: y + 22, x2: x + 8, y2: y + h - 14, stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": 0.6, "stroke-linecap": "round" }, gg);
                    SV.el("rect", { x: x - 8, y: y - 2, width: b + 16, height: 12, rx: 6, fill: "#e6ecf1", stroke: LAB.KANT, "stroke-width": 1.5 }, gg);
                    SV.el("rect", { x: x + b / 2 - 12, y: y - 10, width: 24, height: 9, rx: 3, fill: "#e6ecf1", stroke: LAB.KANT, "stroke-width": 1.3 }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("plade", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: PL.x, y: PL.y, width: PL.b, height: PL.h, rx: 2, fill: "none", stroke: "#2e8b57", "stroke-width": 3 }, gg);
                    for (var i = 0; i < 40; i++) {
                        SV.el("circle", { cx: f1(PL.x + 6 + (i * 37 % (PL.b - 12))), cy: f1(PL.y + 6 + (i * 53 % (PL.h - 12))), r: 1.1, fill: "#9fb4a4" }, gg);
                    }
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("vaeske", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g), x = J.x, y = J.y, b = J.b, h = J.h, r = 10;
                    SV.el("path", { d: "M" + (x + 3) + "," + JV + " L" + (x + 3) + "," + (y + h - r) + " Q" + (x + 3) + "," + (y + h - 2) + " " + (x + r + 3) + "," + (y + h - 2) +
                        " L" + (x + b - r - 3) + "," + (y + h - 2) + " Q" + (x + b - 3) + "," + (y + h - 2) + " " + (x + b - 3) + "," + (y + h - r) + " L" + (x + b - 3) + "," + JV + " Z", fill: "#a9cdee", opacity: 0.85 }, gg);
                    SV.el("ellipse", { cx: x + b / 2, cy: JV, rx: b / 2 - 3, ry: 4, fill: "#d6e8f7" }, gg);
                    /* den vaade del af pladen fra vaesken op til fronten */
                    SV.el("rect", { x: PL.x + 1, y: FRONT, width: PL.b - 2, height: PL.y + PL.h - FRONT - 1, fill: "#bcd8f0", opacity: 0.45 }, gg);
                    PLETTER.forEach(function (p) { plet(gg, BANER[p[0]], p[1], p[2], 6.5); });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });

            /* ----- Lag 3 ---------------------------------------------------- */
            api.del("base3", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KR.x, KR.y, KR.b, KR.h);
                    /* pladen ved linealen */
                    SV.el("rect", { x: RP.x, y: RP.front - 16, width: RP.b, height: RP.start - RP.front + 30, rx: 3, fill: "#fbfbf7", stroke: "#a8b0a6", "stroke-width": 1.4 }, g);
                    SV.el("line", { x1: RP.x + 6, y1: RP.start, x2: RP.x + RP.b - 6, y2: RP.start, stroke: "#6b7280", "stroke-width": 1.4 }, g);
                    SV.el("line", { x1: RP.x + 6, y1: RP.front, x2: RP.x + RP.b - 6, y2: RP.front, stroke: "#3b4650", "stroke-width": 1.6 }, g);
                    plet(g, RP.x + RP.b / 2, PLET, "#7b3fb8", 7);
                    /* linealen */
                    SV.el("rect", { x: RP.x + RP.b + 6, y: RP.front - 14, width: 30, height: RP.start - RP.front + 26, rx: 3, fill: "#e8f1f7", stroke: "#9fb0c0", "stroke-width": 1.2 }, g);
                    for (var i = 0; i <= 50; i++) {
                        var yy = RP.start - i * CM / 10, l = i % 10 === 0 ? 12 : (i % 5 === 0 ? 8 : 4);
                        SV.el("line", { x1: RP.x + RP.b + 6, y1: f1(yy), x2: RP.x + RP.b + 6 + l, y2: f1(yy), stroke: "#6b7782", "stroke-width": 0.9 }, g);
                        if (i % 10 === 0) ORG.t(g, RP.x + RP.b + 28, yy + 4, String(i / 10), { fs: 11, fed: true, farve: "#4b5560" });
                    }
                    ORG.t(g, RP.x - 12, PLET + 5, "plettens midte", { fs: 14, farve: F.blaek, anker: "end" });
                    ORG.t(g, RP.x - 12, RP.start + 5, "startlinje", { fs: 14, farve: F.blaek, anker: "end" });
                    KV.linje(g, RP.x + RP.b / 2, PLET, RP.x + RP.b + 100, PLET, "#7b3fb8", 1, "4 3");
                    KV.linje(g, RP.x + RP.b / 2, RP.front, RP.x + RP.b + 160, RP.front, "#3b4650", 1, "4 3");
                    KV.linje(g, RP.x + RP.b + 36, RP.start, RP.x + RP.b + 160, RP.start, "#3b4650", 1, "4 3");
                    KV.dobbeltpil(g, RP.x + RP.b + 90, PLET + 2, RP.start - 2, "#7b3fb8", 2, 9);
                    ORG.t(g, RP.x + RP.b + 98, (PLET + RP.start) / 2 + 5, "3,6 cm", { fs: 15, fed: true, farve: "#7b3fb8", anker: "start" });
                    KV.dobbeltpil(g, RP.x + RP.b + 150, RP.front + 2, RP.start - 2, "#3b4650", 2, 9);
                    ORG.t(g, RP.x + RP.b + 158, (RP.front + RP.start) / 2 + 5, "5,0 cm", { fs: 15, fed: true, farve: "#3b4650", anker: "start" });
                    /* beregningen med pladsen som venstreside */
                    var x = FORMEL.x0 + 296, y = FORMEL.y;
                    SV.tekst(g, x, y + 8, "=", { "font-size": 24, "font-weight": 700, fill: F.blaek });
                    var bx = x + 18, bb = NK.tekstBredde("3,6 cm", 20, 700) + 14;
                    SV.tekst(g, bx + bb / 2, y - 9, "3,6 cm", { "font-size": 20, "font-weight": 700, fill: "#7b3fb8" });
                    SV.el("line", { x1: bx, y1: y, x2: bx + bb, y2: y, stroke: F.blaek, "stroke-width": 1.8 }, g);
                    SV.tekst(g, bx + bb / 2, y + 24, "5,0 cm", { "font-size": 20, "font-weight": 700, fill: "#3b4650" });
                    SV.tekst(g, bx + bb + 12, y + 8, "= 0,72", { "font-size": 24, "font-weight": 700, fill: F.blaek, "text-anchor": "start" });
                }
            });
            api.del("front", {
                lag: 2,
                fuld: function (g) {
                    return { l: SV.el("path", { d: vaesketop(g, PL.x + 2, PL.x + PL.b - 2, FRONT), fill: "none", stroke: "#1f5fbf", "stroke-width": 2.6, "stroke-linecap": "round" }, g) };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 500); }
            });
            api.del("rf", {
                lag: 2,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: FORMEL.x0 - 8, y: FORMEL.y - 42, width: 520, height: 84, rx: 14, fill: "rgba(15,118,110,0.05)", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
        }
    };
}());

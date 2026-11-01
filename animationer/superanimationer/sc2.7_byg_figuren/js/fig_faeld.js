/* =====================================================================
   fig_faeld.js - figuren til 2.4 Faeldningsreaktioner

   Bogens eksempel (figuren faeldning-blyiodid og ionskemaet i teksten):
   bly(II)nitrat og kaliumiodid haeldes sammen og giver et gult bundfald
   af bly(II)iodid. Luppen viser Pb²⁺ og I⁻ i et iongitter paa bunden og
   K⁺ og NO₃⁻ frit i vandet. Nederst et udsnit af faeldningstabellen og
   ionskemaet Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(s).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var RAMME = { x: 20, y: 40, b: 630, h: 290 };
    var A = { x: 50, b: 100 }, B = { x: 220, b: 100 }, C = { x: 460, b: 140 };
    var TOP = 132, BUND = 300, VAND = 172;
    var BF = { y: 268 };                              /* bundfaldets top i glas C */
    var LUP = { x: 822, y: 210, r: 116 };
    var TAB = { x: 30, y: 410, b: 370, h: 200 };      /* kortet med tabellen */
    var KOL = [50, 150, 260, 370];                    /* tabellens kolonner (kanter) */
    var RK = [442, 484, 532, 580];                    /* tabellens raekker (kanter) */
    var SK = { x: 628, y: 470, b: 362, h: 96 };       /* ionskemaet */

    /* Ionerne i luppen: de frie (tilskuerionerne) og gitteret paa bunden */
    var FRIE = [["kalium", 776, 152, "K^+"], ["N", 860, 128, "NO_3^−"], ["kalium", 892, 196, "K^+"],
                ["N", 760, 222, "NO_3^−"], ["kalium", 836, 240, "K^+"], ["N", 900, 258, "NO_3^−"]];
    var K0 = FRIE[0];

    function gradient(id, stops) {
        if (document.getElementById(id)) return;
        var defs = document.querySelector("#faelles-defs defs");
        var lg = SV.el("linearGradient", { id: id, x1: "0", y1: "0", x2: "0", y2: "1" }, defs);
        stops.forEach(function (s, i) { SV.el("stop", { offset: (i / (stops.length - 1) * 100) + "%", "stop-color": s[0], "stop-opacity": s[1] }, lg); });
    }

    function glas(g, G, vaeske) {
        var x = G.x, b = G.b, y = TOP, bund = BUND;
        var krop = "M" + x + "," + y + " L" + x + "," + (bund - 12) + " Q" + x + "," + bund + " " + (x + 12) + "," + bund +
            " L" + (x + b - 12) + "," + bund + " Q" + (x + b) + "," + bund + " " + (x + b) + "," + (bund - 12) + " L" + (x + b) + "," + y;
        SV.el("path", { d: "M" + (x + 2) + "," + VAND + " L" + (x + 2) + "," + (bund - 12) + " Q" + (x + 2) + "," + (bund - 2) + " " + (x + 13) + "," + (bund - 2) +
            " L" + (x + b - 13) + "," + (bund - 2) + " Q" + (x + b - 2) + "," + (bund - 2) + " " + (x + b - 2) + "," + (bund - 12) + " L" + (x + b - 2) + "," + VAND + " Z", fill: vaeske }, g);
        SV.el("ellipse", { cx: x + b / 2, cy: VAND, rx: b / 2 - 2, ry: 6, fill: "#ffffff", "fill-opacity": 0.45, stroke: "#9cc3df", "stroke-width": 1 }, g);
        SV.el("path", { d: krop, fill: "url(#glas)", stroke: "#7f93a6", "stroke-width": 1.8 }, g);
        SV.el("ellipse", { cx: x + b / 2, cy: y, rx: b / 2, ry: 7, fill: "none", stroke: "#7f93a6", "stroke-width": 1.8 }, g);
        SV.el("line", { x1: x + 12, y1: y + 18, x2: x + 12, y2: bund - 20, stroke: "#ffffff", "stroke-width": 5, "stroke-opacity": 0.55, "stroke-linecap": "round" }, g);
    }

    function titel(g, G, navn, formel) {
        SV.tekst(g, G.x + G.b / 2, 84, navn, { "font-size": 15, "font-weight": 700 });
        SV.tekst(g, G.x + G.b / 2, 104, formel, { "font-size": 13.5, fill: F.svag });
    }

    function celle(k, r) { return { x: KOL[k], y: RK[r], b: KOL[k + 1] - KOL[k], h: RK[r + 1] - RK[r] }; }
    var L_CELLE = celle(2, 1), T_CELLE = celle(2, 2);

    NK.FIGURER.faeld = {
        vb: [1000, 640],
        lag: [
            { navn: "Fældningen", pladser: ["fældningsreaktion", "bundfald", "tilskuerion"],
              ros: "Pb²⁺ og I⁻ sætter sig sammen til et gult bundfald, mens K⁺ og NO₃⁻ bliver i vandet." },
            { navn: "Tabel og ionskema", pladser: ["fældningstabel", "letopløselig", "tungtopløselig", "ionskema"],
              ros: "Tabellen viser, at kun Pb²⁺ og I⁻ danner et tungtopløseligt salt, og ionskemaet viser kun dem." }
        ],
        pladser: [
            { id: "fældningsreaktion", ord: ["fældningsreaktion"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["proces"],
              omr: [{ r: [RAMME.x - 6, RAMME.y - 6, RAMME.b + 12, RAMME.h + 12, 18], tom: true }],
              fejl: { ionskema: "<b>ionskema</b> skrives med formler og en pil. Rammen her viser glassene, der hældes sammen.",
                      bundfald: "<b>bundfald</b> er kun det faste stof på bunden. Rammen viser det hele, der sker." } },
            { id: "bundfald", ord: ["bundfald"], x: C.x + C.b / 2, y: 368, maal: [C.x + C.b / 2, BUND + 4], dele: ["bf"],
              omr: [{ r: [C.x - 2, BF.y - 6, C.b + 4, BUND - BF.y + 10, 8] }],
              fejl: { tungtopløselig: "<b>tungtopløselig</b> siger, hvordan saltet opfører sig. Pladsen peger på selve det faste stof på bunden.",
                      tilskuerion: "<b>tilskuerion</b> bliver i vandet. Pladsen peger på det faste stof på bunden." } },
            { id: "tilskuerion", ord: ["tilskuerion"], x: LUP.x - 60, y: 30, maal: [K0[1], K0[2] - 18], dele: ["lup"],
              omr: [{ c: [K0[1], K0[2], 18] }],
              fejl: { bundfald: "<b>bundfald</b> er det faste stof på bunden. Kaliumionen svømmer frit rundt i vandet." } },

            { id: "fældningstabel", ord: ["fældningstabel"], x: TAB.x + TAB.b / 2, y: TAB.y, maal: [TAB.x + TAB.b / 2, TAB.y], titel: true, dele: ["tabel"],
              omr: [{ r: [TAB.x - 6, TAB.y - 6, TAB.b + 12, TAB.h + 12, 16], tom: true }],
              fejl: { ionskema: "<b>ionskema</b> er en reaktion med en pil. Kortet her er en oversigt med ioner langs kanterne." } },
            { id: "letopløselig", ord: ["letopløselig"], x: 512, y: L_CELLE.y + L_CELLE.h / 2, maal: [L_CELLE.x + L_CELLE.b, L_CELLE.y + L_CELLE.h / 2], dele: ["lc"],
              omr: [{ r: [L_CELLE.x + 2, L_CELLE.y + 2, L_CELLE.b - 4, L_CELLE.h - 4, 6] }],
              fejl: { tungtopløselig: "<b>tungtopløselig</b> er T i tabellen. Feltet ved pladsen har et L." } },
            { id: "tungtopløselig", ord: ["tungtopløselig"], x: 512, y: T_CELLE.y + T_CELLE.h / 2, maal: [T_CELLE.x + T_CELLE.b, T_CELLE.y + T_CELLE.h / 2], dele: ["tc"],
              omr: [{ r: [T_CELLE.x + 2, T_CELLE.y + 2, T_CELLE.b - 4, T_CELLE.h - 4, 6] }],
              fejl: { letopløselig: "<b>letopløselig</b> er L i tabellen. Feltet ved pladsen har et T.",
                      bundfald: "<b>bundfald</b> er det faste stof i glasset. Pladsen peger på et felt i tabellen." } },
            { id: "ionskema", ord: ["ionskema"], x: SK.x + SK.b / 2, y: SK.y, maal: [SK.x + SK.b / 2, SK.y], titel: true, dele: ["skema"],
              omr: [{ r: [SK.x - 6, SK.y - 6, SK.b + 12, SK.h + 12, 16], tom: true }],
              fejl: { "fældningsreaktion": "<b>fældningsreaktion</b> er det, der sker i glassene. Pladsen peger på det, der er skrevet med formler og en pil.",
                      "fældningstabel": "<b>fældningstabel</b> er oversigten til venstre. Pladsen peger på formler med en pil." } }
        ],

        tegn: function (api) {
            gradient("klar", [["#d8ebf8", 0.75], ["#a9cfeb", 0.85]]);
            gradient("gulklar", [["#fbf3c8", 0.8], ["#f3df84", 0.85]]);
            gradient("gulfast", [["#ffe066", 1], ["#e6b422", 1]]);

            /* ----- Lag 1: glassene, bundfaldet og luppen ------------------------ */
            api.del("glassene", {
                lag: 0, auto: true,
                fuld: function (g) {
                    glas(g, A, "url(#klar)");
                    glas(g, B, "url(#klar)");
                    titel(g, A, "bly(II)nitrat", "Pb(NO_3)_2(aq)");
                    titel(g, B, "kaliumiodid", "KI(aq)");
                    SV.tekst(g, 185, 228, "+", { "font-size": 28, fill: F.svag });
                }
            });

            api.del("proces", {
                lag: 0,
                fuld: function (g) {
                    var r = SV.el("rect", { x: RAMME.x, y: RAMME.y, width: RAMME.b, height: RAMME.h, rx: 18, fill: "none", stroke: "#8fc7bb", "stroke-width": 2 }, g);
                    var y = 220, x1 = 346, x2 = 438;
                    var pil = SV.g(g);
                    SV.el("line", { x1: x1, y1: y, x2: x2 - 12, y2: y, stroke: "#4b5560", "stroke-width": 2.8, "stroke-linecap": "round" }, pil);
                    SV.el("polygon", { points: x2 + "," + y + " " + (x2 - 15) + "," + (y - 8) + " " + (x2 - 15) + "," + (y + 8), fill: "#4b5560" }, pil);
                    SV.tekst(g, (x1 + x2) / 2, y + 26, "hældes sammen", { "font-size": 13.5, fill: F.svag });
                    var c = SV.g(g);
                    glas(c, C, "url(#gulklar)");
                    titel(c, C, "blandingen", "PbI_2(s) og KNO_3(aq)");
                    return { r: r, pil: pil, c: c };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); an.glid(r.pil, -20, 0, 200, 400); an.fade(r.c, 400, 500); }
            });

            api.del("bf", {
                lag: 0,
                fuld: function (g) {
                    var x = C.x + 3, b = C.b - 6;
                    var lagG = SV.g(g);
                    SV.el("path", { d: "M" + x + "," + BF.y + " L" + x + "," + (BUND - 12) + " Q" + x + "," + (BUND - 3) + " " + (x + 11) + "," + (BUND - 3) +
                        " L" + (x + b - 11) + "," + (BUND - 3) + " Q" + (x + b) + "," + (BUND - 3) + " " + (x + b) + "," + (BUND - 12) + " L" + (x + b) + "," + BF.y + " Z", fill: "url(#gulfast)" }, lagG);
                    for (var i = 0; i < 26; i++) {
                        var px = x + 8 + (i * 37) % (b - 16), py = BF.y + 6 + (i * 13) % 20;
                        SV.el("circle", { cx: px, cy: py, r: 1.6 + (i % 3) * 0.5, fill: "#c99a12", "fill-opacity": 0.6 }, lagG);
                    }
                    /* Lidt gult svaever stadig i vaesken */
                    for (var j = 0; j < 10; j++) SV.el("circle", { cx: x + 12 + (j * 29) % (b - 24), cy: VAND + 24 + (j * 17) % 60, r: 1.8, fill: "#e6b422", "fill-opacity": 0.7 }, lagG);
                    return { lag: lagG };
                },
                byg: function (g, r, an) { an.glid(r.lag, 0, -30, 0, 800); }
            });

            api.del("lup", {
                lag: 0,
                fuld: function (g) {
                    var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
                    /* Luppen ser ind i opløsningen lige over bundfaldet, hvor
                       tilskuerionerne er, og fanger toppen af gitteret nederst
                       (brugeren 1. nov. 2026: linjen skal gå til opløsningen) */
                    var fx = C.x + C.b - 30, fy = BF.y - 7;
                    SV.el("circle", { cx: fx, cy: fy, r: 9, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.4 }, g);
                    SV.el("line", Object.assign({ x1: fx + 6, y1: fy - 7, x2: LUP.x - LUP.r + 18, y2: LUP.y - 60 }, s), g);
                    SV.el("line", Object.assign({ x1: fx + 6, y1: fy + 7, x2: LUP.x - LUP.r + 30, y2: LUP.y + 80 }, s), g);
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r + 7, fill: "#e5ebf2", stroke: "#8796a8", "stroke-width": 2, filter: "url(#skygge)" }, g);
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: "url(#lup)", stroke: "#b8c4d2", "stroke-width": 1 }, g);
                    /* Gitteret paa bunden: I⁻ store og lilla, Pb²⁺ smaa og roede */
                    var git = SV.g(g);
                    for (var i = 0; i < 5; i++) SV.kugle(git, LUP.x - 64 + i * 32, LUP.y + 84, 14, "iod", "I^−");
                    for (var j = 0; j < 4; j++) SV.kugle(git, LUP.x - 48 + j * 32, LUP.y + 62, 10, "bly", "Pb");
                    var frie = FRIE.map(function (f) {
                        return f[0] === "kalium" ? SV.kugle(g, f[1], f[2], 13, "kalium", f[3]) : SV.kugle(g, f[1], f[2], 15, "N", f[3]);
                    });
                    return { git: git, frie: frie };
                },
                byg: function (g, r, an) {
                    an.glid(r.git, 0, -24, 0, 600);
                    r.frie.forEach(function (k, i) { an.pop(k, 300 + i * 90, 360); });
                }
            });

            /* ----- Lag 2: faeldningstabellen og ionskemaet ----------------------- */
            api.del("tabel", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: TAB.x, y: TAB.y, width: TAB.b, height: TAB.h, rx: 14, fill: "#f7f9fb", stroke: "#c7d2df", "stroke-width": 1.5 }, g);
                    /* Gitterlinjerne */
                    for (var k = 0; k < KOL.length; k++) SV.el("line", { x1: KOL[k], y1: RK[0], x2: KOL[k], y2: RK[3], stroke: "#c7d2df", "stroke-width": k === 1 ? 2 : 1 }, g);
                    for (var r = 0; r < RK.length; r++) SV.el("line", { x1: KOL[0], y1: RK[r], x2: KOL[3], y2: RK[r], stroke: "#c7d2df", "stroke-width": r === 1 ? 2 : 1 }, g);
                    SV.tekst(g, (KOL[1] + KOL[2]) / 2, RK[1] - 12, "K^+", { "font-size": 19, "font-weight": 700, fill: "#b8382d" });
                    SV.tekst(g, (KOL[2] + KOL[3]) / 2, RK[1] - 12, "Pb^2+", { "font-size": 19, "font-weight": 700, fill: "#b8382d" });
                    SV.tekst(g, (KOL[0] + KOL[1]) / 2, RK[2] - 16, "NO_3^−", { "font-size": 19, "font-weight": 700, fill: "#2a55b0" });
                    SV.tekst(g, (KOL[0] + KOL[1]) / 2, RK[3] - 16, "I^−", { "font-size": 19, "font-weight": 700, fill: "#2a55b0" });
                    [[1, 1, "L"], [2, 1, "L"], [1, 2, "L"], [2, 2, "T"]].forEach(function (c) {
                        var e = celle(c[0], c[1]);
                        SV.tekst(g, e.x + e.b / 2, e.y + e.h / 2 + 7, c[2], { "font-size": 20, "font-weight": c[2] === "T" ? 800 : 600, fill: c[2] === "T" ? F.tekst : F.svag });
                    });
                }
            });

            api.del("lc", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: L_CELLE.x + 3, y: L_CELLE.y + 3, width: L_CELLE.b - 6, height: L_CELLE.h - 6, rx: 5, fill: "#e9f3fb", stroke: "#8fb6dc", "stroke-width": 1.4 }, gg);
                    SV.tekst(gg, L_CELLE.x + L_CELLE.b / 2, L_CELLE.y + L_CELLE.h / 2 + 7, "L", { "font-size": 20, "font-weight": 700, fill: "#2a6aa8" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 420); }
            });

            api.del("tc", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: T_CELLE.x + 3, y: T_CELLE.y + 3, width: T_CELLE.b - 6, height: T_CELLE.h - 6, rx: 5, fill: "#fff1b8", stroke: "#e6b422", "stroke-width": 1.6 }, gg);
                    SV.tekst(gg, T_CELLE.x + T_CELLE.b / 2, T_CELLE.y + T_CELLE.h / 2 + 7, "T", { "font-size": 21, "font-weight": 800, fill: "#8a6a08" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 420); }
            });

            api.del("skema", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: SK.x, y: SK.y, width: SK.b, height: SK.h, rx: 14, fill: "#ffffff", stroke: "#7d8894", "stroke-width": 2 }, g);
                    var t = SV.tekst(g, SK.x + SK.b / 2, SK.y + SK.h / 2 + 9, "Pb^2+(aq) + 2 I^−(aq) → PbI_2(s)", { "font-size": 19, "font-weight": 700 });
                    return { t: t };
                },
                byg: function (g, r, an) { an.glid(r.t, -20, 0, 0, 500); }
            });
        }
    };
}());

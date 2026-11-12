/* =====================================================================
   fig_alkan.js - figuren til 4.1 Carbonhydrider og alkaner

   Tre rammer inden i hinanden som bogens tabel over organisk og
   carbonhydrid: den store ramme (organisk kemi) har glucose med O,
   den mellemste (carbonhydrid) har ethen med en dobbeltbinding, og den
   inderste (alkan) har methan og butan. Ethen er med, for at alkan og
   carbonhydrid ikke kan byttes om: ethen er et carbonhydrid, men ikke
   en alkan. Til hoejre uorganiske stoffer og en skaal med benzin, der
   fordamper.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var O = { x: 20, y: 40, b: 640, h: 500 };      /* organisk kemi */
    var C = { x: 222, y: 86, b: 424, h: 440 };     /* carbonhydrid */
    var A = { x: 410, y: 132, b: 222, h: 380 };    /* alkan */
    var U = { x: 690, y: 40, b: 290, h: 290 };     /* uorganisk */
    var K = { x: 690, y: 362, b: 290, h: 178 };    /* benzin */
    var MX = A.x + A.b / 2;                        /* methan og butan */
    var ME = { y: 214 }, BU = { y: 384 }, ET = { x: 316, y: 300 };
    var FY = BU.y + 86;                            /* molekylformlerne */

    function titel(id, ord, x, y, ramme, dele, fejl) {
        return { id: id, ord: ord, x: x, y: y, maal: [x, y], titel: true, dele: dele,
            omr: [{ r: [ramme.x - 6, ramme.y - 6, ramme.b + 12, ramme.h + 12, 18], tom: true }], fejl: fejl };
    }

    function terning(g, x, y, s) {
        var gg = SV.g(g);
        SV.el("path", { d: "M" + x + "," + (y - s) + " l" + s + "," + (s * 0.5) + " l0," + s + " l" + (-s) + "," + (s * 0.5) + " l" + (-s) + "," + (-s * 0.5) + " l0," + (-s) + " Z", fill: "#ffffff", stroke: "#aab6c2", "stroke-width": 1 }, gg);
        SV.el("path", { d: "M" + x + "," + (y - s) + " l" + s + "," + (s * 0.5) + " l" + (-s) + "," + (s * 0.5) + " l" + (-s) + "," + (-s * 0.5) + " Z", fill: "#f1f4f7", stroke: "#aab6c2", "stroke-width": 1 }, gg);
        SV.el("path", { d: "M" + x + "," + y + " l0," + s, stroke: "#aab6c2", "stroke-width": 1 }, gg);
        return gg;
    }

    /* Et stof som en lille brik: tegning til venstre, navn og formel til hoejre */
    function brik(g, x, y, b, tegn, navn, formel) {
        SV.el("rect", { x: x, y: y, width: b, height: 58, rx: 10, fill: "#ffffff", stroke: "#d0d8e0", "stroke-width": 1.3 }, g);
        tegn(g, x + 34, y + 29);
        SV.tekst(g, x + 66, y + 25, navn, { "font-size": 15.5, "font-weight": 700, "text-anchor": "start" });
        SV.tekst(g, x + 66, y + 46, formel, { "font-size": 14.5, fill: F.svag, "text-anchor": "start" });
    }

    NK.FIGURER.alkan = {
        vb: [1000, 600],
        lag: [
            { navn: "Organisk eller ej", pladser: ["organisk kemi", "uorganisk", "carbonhydrid"],
              ros: "Organiske stoffer har C−H-bindinger. Carbonhydrider består kun af C og H." },
            { navn: "Alkaner", pladser: ["alkan", "molekylformel", "flygtig"],
              ros: "Alkaner har kun enkeltbindinger, og molekylformlen tæller atomerne. Benzin fordamper let." }
        ],
        pladser: [
            titel("organisk kemi", ["organisk kemi"], O.x + 120, O.y, O, ["org"], {
                uorganisk: "<b>uorganisk</b> passer på stoffer uden C−H-bindinger. Alle stofferne i den store ramme har C−H-bindinger.",
                carbonhydrid: "<b>carbonhydrid</b> har kun C og H. Den store ramme rummer også glucose, som har O." }),
            titel("uorganisk", ["uorganisk"], U.x + U.b / 2, U.y, U, ["uorg"], {
                "organisk kemi": "<b>organisk kemi</b> handler om stoffer med C−H-bindinger. Ingen af stofferne her har en C−H-binding.",
                carbonhydrid: "<b>carbonhydrid</b> består af C og H. Ingen af stofferne her har både C og H." }),
            titel("carbonhydrid", ["carbonhydrid"], C.x + 108, C.y, C, ["chyd"], {
                "organisk kemi": "<b>organisk kemi</b> gælder også glucose med O. Den mellemste ramme har kun stoffer af C og H.",
                uorganisk: "<b>uorganisk</b> passer på stoffer uden C−H-bindinger. Her har alle stofferne C−H-bindinger.",
                alkan: "<b>alkan</b> har kun enkeltbindinger. Den mellemste ramme rummer også ethen med en dobbeltbinding." }),

            titel("alkan", ["alkan"], MX, A.y, A, ["alkramme"], {
                carbonhydrid: "<b>carbonhydrid</b> er den mellemste ramme, som også rummer ethen. Den inderste har kun enkeltbindinger.",
                "organisk kemi": "<b>organisk kemi</b> er den store ramme. Den inderste har kun stoffer af C og H med enkeltbindinger." }),
            { id: "molekylformel", ord: ["molekylformel"], x: MX, y: 576, maal: [MX, FY + 9], dele: ["formler"],
              omr: [{ r: [MX - 34, FY - 18, 68, 26, 6] }],
              fejl: { alkan: "<b>alkan</b> er en slags stof. Pladsen peger kun på formlen, der tæller atomerne i butan.",
                      carbonhydrid: "<b>carbonhydrid</b> er en slags stof. Pladsen peger kun på formlen, der tæller atomerne i butan.",
                      flygtig: "<b>flygtig</b> siger, at et stof fordamper let. Pladsen peger på formlen, der tæller atomerne." } },
            titel("flygtig", ["flygtig"], K.x + K.b / 2, K.y + K.h, K, ["benzin"], {
                uorganisk: "<b>uorganisk</b> passer ikke, for benzin består af alkaner. Kortet viser, hvad der sker med benzin i en åben skål.",
                alkan: "<b>alkan</b> er en slags stof. Skiltet siger, hvad benzin gør i en åben skål.",
                molekylformel: "<b>molekylformel</b> er en formel som C₄H₁₀. Skiltet siger, hvad benzin gør i en åben skål." })
        ],

        tegn: function (api) {
            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("org", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, O.x, O.y, O.b, O.h, { fyld: "#f7fbfa", kant: "#5fb3a1" });
                    /* Glucose: en sukkerknald og formlen med O */
                    var gx = O.x + 100, gy = 300;
                    SV.el("rect", { x: gx - 82, y: gy - 66, width: 164, height: 132, rx: 12, fill: "#ffffff", stroke: "#d0d8e0", "stroke-width": 1.3 }, g);
                    terning(g, gx - 14, gy - 22, 14); terning(g, gx + 14, gy - 22, 14); terning(g, gx, gy - 36, 14);
                    SV.tekst(g, gx, gy + 24, "glucose", { "font-size": 16, "font-weight": 700 });
                    SV.tekst(g, gx, gy + 48, "C_6H_12O_6", { "font-size": 16, fill: F.svag });
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            api.del("uorg", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.kort(g, U.x, U.y, U.b, U.h);
                    var bx = U.x + 20, bb = U.b - 40;
                    brik(g, bx, U.y + 36, bb, function (gg, x, y) {
                        SV.kugle(gg, x, y - 2, 13, "O", "O");
                        SV.kugle(gg, x - 13, y + 11, 7.5, "H");
                        SV.kugle(gg, x + 13, y + 11, 7.5, "H");
                    }, "vand", "H_2O");
                    brik(g, bx, U.y + 112, bb, function (gg, x, y) {
                        SV.kugle(gg, x - 18, y, 10, "O");
                        SV.kugle(gg, x + 18, y, 10, "O");
                        SV.kugle(gg, x, y, 11, "C");
                    }, "carbondioxid", "CO_2");
                    brik(g, bx, U.y + 188, bb, function (gg, x, y) {
                        SV.kugle(gg, x - 10, y, 8, "proton");
                        SV.kugle(gg, x + 8, y, 12, "elektron");
                    }, "natriumchlorid", "NaCl");
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("chyd", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, C.x, C.y, C.b, C.h, { fyld: "#f2f8f6", kant: "#5fb3a1" });
                    var x = ET.x, y = ET.y;
                    ORG.streg(g, [[x - 22, y, "C"], [x + 22, y, "C"], [x - 52, y - 32, "H"], [x - 52, y + 32, "H"], [x + 52, y - 32, "H"], [x + 52, y + 32, "H"]],
                        [[0, 1, 2], [0, 2], [0, 3], [1, 4], [1, 5]], { x: 0, y: 0, d: 1 });
                    SV.tekst(g, x, y + 72, "ethen", { "font-size": 16, "font-weight": 700, fill: F.svag });
                    ORG.streg(g, [[MX, ME.y, "C"], [MX, ME.y - 34, "H"], [MX, ME.y + 34, "H"], [MX - 36, ME.y, "H"], [MX + 36, ME.y, "H"]],
                        [[0, 1], [0, 2], [0, 3], [0, 4]], { x: 0, y: 0, d: 1 });
                    SV.tekst(g, MX, ME.y + 70, "methan", { "font-size": 16, "font-weight": 700, fill: F.svag });
                    var at = [], bi = [];
                    for (var i = 0; i < 4; i++) {
                        var cx = MX - 51 + i * 34;
                        at.push([cx, BU.y, "C"]);
                        if (i > 0) bi.push([at.length - 1 - 3, at.length - 1]);
                        at.push([cx, BU.y - 34, "H"]); bi.push([at.length - 2, at.length - 1]);
                        at.push([cx, BU.y + 34, "H"]); bi.push([at.length - 3, at.length - 1]);
                    }
                    at.push([MX - 85, BU.y, "H"]); bi.push([0, at.length - 1]);
                    at.push([MX + 85, BU.y, "H"]); bi.push([9, at.length - 1]);
                    ORG.streg(g, at, bi, { x: 0, y: 0, d: 1 });
                    SV.tekst(g, MX, BU.y + 64, "butan", { "font-size": 16, "font-weight": 700, fill: F.svag });
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("alkramme", {
                lag: 1,
                fuld: function (g) {
                    /* Uden fyld: rammen ligger oven paa methan og butan */
                    return { r: SV.el("rect", { x: A.x, y: A.y, width: A.b, height: A.h, rx: 16, fill: "none", stroke: F.teal, "stroke-width": 3 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            api.del("formler", {
                lag: 1,
                fuld: function (g) {
                    var a = { "font-size": 16, "font-weight": 700, fill: F.teal };
                    var t = [SV.tekst(g, ET.x, ET.y + 96, "C_2H_4", a), SV.tekst(g, MX, ME.y + 94, "CH_4", a), SV.tekst(g, MX, FY, "C_4H_10", a)];
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 150, 400); }); }
            });

            api.del("benzin", {
                lag: 1,
                fuld: function (g) {
                    ORG.kort(g, K.x, K.y, K.b, K.h);
                    var x = K.x + K.b / 2, y = K.y + 128;
                    SV.tekst(g, x, K.y + 30, "benzin i en åben skål", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    SV.el("path", { d: "M" + (x - 78) + "," + y + " Q" + (x - 70) + "," + (y + 26) + " " + x + "," + (y + 27) + " Q" + (x + 70) + "," + (y + 26) + " " + (x + 78) + "," + y + " Z",
                        fill: "#e7eef5", stroke: "#8fa3b5", "stroke-width": 1.8 }, g);
                    SV.el("ellipse", { cx: x, cy: y, rx: 78, ry: 11, fill: "#f3d77a", stroke: "#8fa3b5", "stroke-width": 1.8 }, g);
                    var damp = SV.g(g);
                    [-38, 0, 38].forEach(function (dx, i) {
                        var x0 = x + dx, y0 = y - 14, h = 60 - (i % 2) * 10;
                        SV.el("path", { d: "M" + x0 + "," + y0 + " c-10,-10 10,-16 0,-26 c-10,-10 10,-16 0," + (-(h - 26)),
                            fill: "none", stroke: "#9fb4c8", "stroke-width": 2.4, "stroke-linecap": "round" }, damp);
                    });
                    return { damp: damp };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.glid(r.damp, 0, 14, 200, 700); }
            });
        }
    };
}());

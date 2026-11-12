/* =====================================================================
   fig_alken.js - figuren til 4.4 Alkener og addition

   Øverst ethan, ethen og ethyn som i bogens figur ethan-ethen-ethyn, med
   en ramme om det mættede og en om de umættede (alkan er fra 4.1 og
   staar der i forvejen), og bromvand, der mister farven med en alken.
   I midten additionen af dibrom til ethen (bogens figur addition) og
   cyclohexan, nederst polymerisationen af ethen til polyethen (bogens
   figur polyethen) og benzen. Bogens figur ringe giver de to ringe.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var BRUN = "#a0522d";
    var R1 = 36, R1H = 210, R2 = 300, R2H = 176, R3 = 514, R3H = 174;
    var M = { x: 20, y: R1, b: 210, h: R1H };          /* maettet */
    var U = { x: 250, y: R1, b: 440, h: R1H };         /* umaettet */
    var BV = { x: 710, y: R1, b: 270, h: R1H };        /* bromvand */
    var AD = { x: 20, y: R2, b: 670, h: R2H };         /* addition */
    var CY = { x: 710, y: R2, b: 270, h: R2H };        /* cyclohexan */
    var PO = { x: 20, y: R3, b: 670, h: R3H };         /* polymerisation */
    var BZ = { x: 710, y: R3, b: 270, h: R3H };        /* benzen */
    var MY = R1 + 100;                                  /* molekylerne i raekke 1 */
    var EN = 360, YN = 580, AN = 125;                   /* ethen, ethyn, ethan */
    var T1 = 770, T2 = 920, TT = R1 + 48, TB = R1 + 152;   /* reagensglassene */
    var KY = R3 + 140;                                  /* polyethenkaeden */

    function felt(k, x, b) { return [x - b / 2, k.y + 26, b, k.h - 24, 12]; }

    function ethen(g, x, y) {
        ORG.streg(g, [[x - 18, y, "C"], [x + 18, y, "C"], [x - 46, y - 30, "H"], [x - 46, y + 30, "H"], [x + 46, y - 30, "H"], [x + 46, y + 30, "H"]],
            [[0, 1, 2], [0, 2], [0, 3], [1, 4], [1, 5]], { x: 0, y: 0, d: 1 });
    }

    /* En ring af seks C med spidsen opad; dobbelt: kanterne med en ekstra streg */
    function ring(g, x, y, r, dobbelt) {
        var P = [];
        for (var i = 0; i < 6; i++) { var v = (-90 + i * 60) * Math.PI / 180; P.push([x + r * Math.cos(v), y + r * Math.sin(v)]); }
        var gg = SV.g(g);
        SV.el("polygon", { points: P.map(function (p) { return p.join(","); }).join(" "), fill: "none", stroke: "#1f2a33", "stroke-width": 2.8, "stroke-linejoin": "round" }, gg);
        if (dobbelt) {
            [0, 2, 4].forEach(function (i) {
                var p = P[i], q = P[(i + 1) % 6];
                var a = [p[0] + (x - p[0]) * 0.2, p[1] + (y - p[1]) * 0.2], b = [q[0] + (x - q[0]) * 0.2, q[1] + (y - q[1]) * 0.2];
                var m = [a[0] + (b[0] - a[0]) * 0.12, a[1] + (b[1] - a[1]) * 0.12], n = [b[0] - (b[0] - a[0]) * 0.12, b[1] - (b[1] - a[1]) * 0.12];
                SV.el("line", { x1: m[0], y1: m[1], x2: n[0], y2: n[1], stroke: "#1f2a33", "stroke-width": 2.6, "stroke-linecap": "round" }, gg);
            });
        }
        return gg;
    }

    function navn(g, x, y, t) { return SV.tekst(g, x, y, t, { "font-size": 15, "font-weight": 700, fill: F.svag }); }

    function titel(id, k, x, dele, fejl, ramme) {
        return { id: id, ord: [id], x: x, y: k.y, maal: [x, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 6, k.y - 6, k.b + 12, k.h + 12, 18], tom: true }], fejl: fejl };
    }
    function skilt(id, k, x, b, dele, fejl) {
        return { id: id, ord: [id], x: x, y: k.y + k.h, maal: [x, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [x - b / 2, k.y + 26, b, k.h - 24, 12] }], fejl: fejl };
    }

    var FAMILIE = function (o, stof) { return "<b>" + o + "</b> står på rammen. Skiltet her er navnet på den familie, som " + stof + " hører til, ligesom alkan."; };

    NK.FIGURER.alken = {
        vb: [1000, 712],
        lag: [
            { navn: "Dobbelt og tripel", pladser: ["mættet", "umættet", "alken", "alkyn"],
              ros: "Alkener har en dobbeltbinding og alkyner en tripelbinding. De er umættede, mens alkaner er mættede." },
            { navn: "Addition og plastik", pladser: ["addition", "bromvand", "polymerisation", "polymer"],
              ros: "I en addition åbner dobbeltbindingen sig. Bromvand mister farven, og ethen kan blive til polyethen." },
            { navn: "Ringe", pladser: ["cycloalkan", "aromatisk"],
              ros: "Cyclohexan er en ring med enkeltbindinger. Benzen er en særlig stabil ring og er aromatisk." }
        ],
        pladser: [
            titel("mættet", M, M.x + M.b / 2, ["m"], {
                umættet: "<b>umættet</b> har en dobbelt- eller tripelbinding. Ethan har kun enkeltbindinger." }),
            titel("umættet", U, U.x + U.b / 2, ["u"], {
                mættet: "<b>mættet</b> har kun enkeltbindinger. Ethen har en dobbeltbinding og ethyn en tripelbinding.",
                alken: "<b>alken</b> passer kun på ethen. Rammen rummer også ethyn med en tripelbinding." }),
            skilt("alken", U, EN, 196, ["ethen"], {
                alkyn: "<b>alkyn</b> har en tripelbinding. Ethen har en dobbeltbinding mellem de to C.",
                umættet: FAMILIE("umættet", "ethen") }),
            skilt("alkyn", U, YN, 196, ["ethyn"], {
                alken: "<b>alken</b> har en dobbeltbinding. Ethyn har en tripelbinding mellem de to C.",
                umættet: FAMILIE("umættet", "ethyn") }),

            titel("addition", AD, AD.x + AD.b / 2, ["ad"], {
                polymerisation: "<b>polymerisation</b> sætter mange små molekyler sammen til en kæde. Her sætter to Br sig på ét ethenmolekyle.",
                bromvand: "<b>bromvand</b> er væsken i glasset. Rammen viser selve reaktionen, hvor to Br sætter sig på ethen." }),
            { id: "bromvand", ord: ["bromvand"], x: (T1 + T2) / 2, y: BV.y + BV.h - 30, maal: [T1 + 17, TB - 28], dele: ["bv"],
              omr: [{ r: [T1 - 17, TB - 58, 34, 60, 8] }],
              fejl: { addition: "<b>addition</b> er en reaktion. Pladsen peger på den gule væske i glasset.",
                      polymer: "<b>polymer</b> er et langt molekyle. Pladsen peger på den gule væske i glasset." } },
            titel("polymerisation", PO, PO.x + PO.b / 2, ["po"], {
                addition: "<b>addition</b> sætter to atomer på én dobbeltbinding. Her sætter mange ethenmolekyler sig sammen til én kæde.",
                polymer: "<b>polymer</b> er kun den lange kæde. Rammen viser hele reaktionen." }),
            { id: "polymer", ord: ["polymer"], x: 560, y: KY, maal: [404, KY], dele: ["kaede"],
              omr: [{ r: [40, KY - 18, 362, 34, 8] }],
              fejl: { polymerisation: "<b>polymerisation</b> er reaktionen. Pladsen peger kun på den lange kæde, der bliver dannet.",
                      addition: "<b>addition</b> er en reaktion. Pladsen peger på den lange kæde, der bliver dannet." } },

            skilt("cycloalkan", CY, CY.x + CY.b / 2, CY.b - 30, ["cy"], {
                aromatisk: "<b>aromatisk</b> passer på benzenringen. Cyclohexan har kun enkeltbindinger og to H på hvert C." }),
            skilt("aromatisk", BZ, BZ.x + BZ.b / 2, BZ.b - 30, ["bz"], {
                cycloalkan: "<b>cycloalkan</b> har kun enkeltbindinger i ringen. Benzen er en særlig stabil ring med dobbeltbindinger." })
        ],

        tegn: function (api) {
            var B = ORG.bredde(["mættet", "umættet", "alken", "alkyn", "addition", "bromvand", "polymerisation", "polymer", "cycloalkan", "aromatisk"]);

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("m", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, M.x, M.y, M.b, M.h, { fyld: "#f6f9fb", kant: "#7d9db8" });
                    ORG.streg(g, [[AN - 17, MY, "C"], [AN + 17, MY, "C"], [AN - 51, MY, "H"], [AN + 51, MY, "H"],
                        [AN - 17, MY - 34, "H"], [AN - 17, MY + 34, "H"], [AN + 17, MY - 34, "H"], [AN + 17, MY + 34, "H"]],
                        [[0, 1], [0, 2], [1, 3], [0, 4], [0, 5], [1, 6], [1, 7]], { x: 0, y: 0, d: 1 });
                    navn(g, AN, R1 + 182, "ethan, C_2H_6");
                    ORG.givet(g, AN, M.y + M.h, "alkan", B);
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("u", {
                lag: 0,
                fuld: function (g) { return { r: ORG.ramme(g, U.x, U.y, U.b, U.h, { fyld: "#fbf8f2", kant: "#d39a3c" }) }; },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("ethen", {
                lag: 0,
                fuld: function (g) {
                    ethen(g, EN, MY);
                    navn(g, EN, R1 + 182, "ethen, C_2H_4");
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("ethyn", {
                lag: 0,
                fuld: function (g) {
                    ORG.streg(g, [[YN - 76, MY, "H"], [YN - 24, MY, "C"], [YN + 24, MY, "C"], [YN + 76, MY, "H"]], [[0, 1], [1, 2, 3], [2, 3]], { x: 0, y: 0, d: 1 });
                    navn(g, YN, R1 + 182, "ethyn, C_2H_2");
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("ad", {
                lag: 1,
                fuld: function (g) {
                    var r = ORG.ramme(g, AD.x, AD.y, AD.b, AD.h, { fyld: "#fbf8f6", kant: "#c7a37a" });
                    var y = AD.y + 96;
                    ethen(g, 100, y);
                    navn(g, 100, AD.y + 160, "ethen");
                    SV.tekst(g, 182, y + 8, "+", { "font-size": 24, fill: F.svag });
                    SV.tekst(g, 250, y + 8, "Br−Br", { "font-size": 22, "font-weight": 700, fill: BRUN });
                    navn(g, 250, AD.y + 160, "dibrom");
                    ORG.pil(g, 312, 384, y);
                    var x = 500;
                    ORG.streg(g, [[x - 18, y, "C"], [x + 18, y, "C"], [x - 54, y, "H"], [x + 54, y, "H"], [x - 18, y - 38, "Br"], [x + 18, y - 38, "Br"],
                        [x - 18, y + 34, "H"], [x + 18, y + 34, "H"]], [[0, 1], [0, 2], [1, 3], [0, 4], [1, 5], [0, 6], [1, 7]],
                        { x: 0, y: 0, d: 1, farve: { 4: BRUN, 5: BRUN } });
                    navn(g, x, AD.y + 160, "1,2-dibromethan");
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("bv", {
                lag: 1,
                fuld: function (g) {
                    ORG.kort(g, BV.x, BV.y, BV.b, BV.h);
                    var a = { "font-size": 13, fill: F.mat, "font-weight": 700 };
                    SV.tekst(g, T1, BV.y + 26, "før", a);
                    SV.tekst(g, T2, BV.y + 26, "efter", a);
                    [[T1, TB - 56, "#f2c33d"], [T2, TB - 82, "#eef4f8"]].forEach(function (t) {
                        var x = t[0], w = 17;
                        SV.el("path", { d: "M" + (x - w + 2) + "," + t[1] + " L" + (x - w + 2) + "," + (TB - w) + " A" + (w - 2) + "," + (w - 2) + " 0 0,0 " + (x + w - 2) + "," + (TB - w) + " L" + (x + w - 2) + "," + t[1] + " Z", fill: t[2] }, g);
                        SV.el("path", { d: "M" + (x - w) + "," + TT + " L" + (x - w) + "," + (TB - w) + " A" + w + "," + w + " 0 0,0 " + (x + w) + "," + (TB - w) + " L" + (x + w) + "," + TT,
                            fill: "none", stroke: "#8fa3b5", "stroke-width": 2 }, g);
                        SV.el("ellipse", { cx: x, cy: TT, rx: w + 2, ry: 3.5, fill: "#eef3f7", stroke: "#8fa3b5", "stroke-width": 1.6 }, g);
                    });
                    ORG.pil(g, T1 + 30, T2 - 30, TB - 50);
                    SV.tekst(g, (T1 + T2) / 2, TB - 62, "+ alken, ryst", { "font-size": 12.5, fill: F.svag });
                    SV.tekst(g, (T1 + T2) / 2, TB - 30, "farveløs", { "font-size": 12.5, fill: F.svag, "font-style": "italic" });
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("po", {
                lag: 1,
                fuld: function (g) {
                    var r = ORG.ramme(g, PO.x, PO.y, PO.b, PO.h, { fyld: "#f6fafa", kant: "#5fb3a1" });
                    var y = PO.y + 62, a = { "font-size": 17, "font-weight": 700 };
                    [110, 260, 410].forEach(function (x, i) {
                        SV.el("rect", { x: x - 58, y: y - 20, width: 116, height: 32, rx: 8, fill: F.tealLys, stroke: "#8fc7bb", "stroke-width": 1.4 }, g);
                        SV.tekst(g, x, y + 2, "H_2C=CH_2", a);
                        SV.tekst(g, x + 75, y + 4, "+", { "font-size": 20, fill: F.svag });
                    });
                    SV.tekst(g, 510, y + 4, "· · ·", { "font-size": 20, fill: F.svag });
                    navn(g, 600, y + 3, "ethen");
                    SV.el("line", { x1: 220, y1: y + 22, x2: 220, y2: KY - 30, stroke: "#4b5560", "stroke-width": 2.4 }, g);
                    SV.el("polygon", { points: "220," + (KY - 20) + " 214," + (KY - 32) + " 226," + (KY - 32), fill: "#4b5560" }, g);
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("kaede", {
                lag: 1,
                fuld: function (g) {
                    var t = SV.tekst(g, 46, KY + 6, "· · · −CH_2−CH_2−CH_2−CH_2−CH_2−CH_2− · · ·", { "font-size": 17, "font-weight": 700, "text-anchor": "start", fill: F.teal });
                    return { t: t };
                },
                byg: function (g, r, an) { an.glid(r.t, -30, 0, 0, 700); }
            });

            /* ----- Lag 3 ------------------------------------------------------- */
            api.del("cy", {
                lag: 2,
                fuld: function (g) {
                    ORG.kort(g, CY.x, CY.y, CY.b, CY.h);
                    var r = ring(g, CY.x + CY.b / 2, CY.y + 70, 42, false);
                    navn(g, CY.x + CY.b / 2, CY.y + 138, "cyclohexan, C_6H_12");
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.r, 100, 500); }
            });

            api.del("bz", {
                lag: 2,
                fuld: function (g) {
                    ORG.kort(g, BZ.x, BZ.y, BZ.b, BZ.h);
                    var r = ring(g, BZ.x + BZ.b / 2, BZ.y + 70, 42, true);
                    navn(g, BZ.x + BZ.b / 2, BZ.y + 138, "benzen, C_6H_6");
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.r, 100, 500); }
            });
        }
    };
}());

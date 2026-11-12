/* =====================================================================
   fig_fedt.js - figuren til 4.6 Fedtstoffer

   Øverst tre fedtsyrer som i bogens figur fedtsyrer: stearinsyre (mættet
   er fra 4.4, men eleven saetter det paa igen; brugeren 1. nov. 2026:
   "lad bare eleven sætte det på igen"), oliesyre med ét knæk og
   linolsyre med to. I midten glycerol og tre fedtsyrer, der giver et
   fedtstof og vand, og pilen tilbage er hydrolysen (bogens figur
   triglycerid). Fedtstof og triglycerid er to navne for det samme og
   staar som et par. Nederst olie, der bliver til fast fedt ved hærdning.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var FS = { x: 20, y: 36, b: 960, h: 212 };           /* fedtsyrerne */
    var SX = [40, 360, 680], SY = 62, SB = 280, SH = 162;
    var RY = [326, 376, 426];                            /* raekkerne i reaktionen */
    var GL = [38, 296, 132, 150];                        /* glycerol */
    var PR = [466, 290, 210, 160];                       /* fedtstoffet */
    var PIL = { x1: 372, x2: 452, op: 362, ned: 390 };   /* pilene */
    var R3 = 530;
    var OL = { x: 150, y: R3, b: 250, h: 150 };          /* olie */
    var FA = { x: 630, y: R3, b: 250, h: 150 };          /* fast fedt */
    var HP = { x1: 430, x2: 598, y: R3 + 72 };           /* pilen ved haerdning */

    /* En fedtsyre: HOOC og en zigzagkaede med knæk ved dobbeltbindingerne */
    function syre(g, x, y, knaek, dobbelt) {
        var P = ORG.kaedePunkter(x + 50, y, 15, { l: 13.5, op: true, knaek: knaek });
        SV.tekst(g, x + 46, y + 6, "HOOC", { "font-size": 15, "font-weight": 700, fill: F.roed, "text-anchor": "end" });
        ORG.zigzag(g, P, { bredde: 2.4, dobbelt: dobbelt, dfarve: F.teal });
        return P;
    }

    /* En kort kaede i reaktionen: "HOOC" eller "C" med =O og en zigzag */
    function kortKaede(g, x, y, n) {
        var P = ORG.kaedePunkter(x, y, n, { l: 13, op: false });
        SV.el("line", { x1: x - 3, y1: y, x2: x - 3, y2: y - 18, stroke: F.roed, "stroke-width": 2 }, g);
        SV.el("line", { x1: x + 3, y1: y, x2: x + 3, y2: y - 18, stroke: F.roed, "stroke-width": 2 }, g);
        SV.tekst(g, x, y - 21, "O", { "font-size": 14, "font-weight": 700, fill: F.roed });
        ORG.zigzag(g, P, { bredde: 2.2 });
    }

    function kort(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }
    function syreKort(i) { return { x: SX[i], y: SY, b: SB, h: SH }; }

    var FEDTSTOF = { glycerol: "<b>glycerol</b> er alkoholen til venstre. Pladsen peger på produktet, hvor tre fedtsyrer er bundet til glycerol.",
                     olie: "<b>olie</b> er et flydende fedtstof. Her spørges om navnet på stoffet af glycerol og tre fedtsyrer.",
                     fedtsyre: "<b>fedtsyre</b> er én syre. Produktet har tre fedtsyrer bundet til glycerol." };

    NK.FIGURER.fedt = {
        vb: [1000, 706],
        lag: [
            { navn: "Fedtsyrer", pladser: ["fedtsyre", "mættet", "monoumættet", "polyumættet"],
              ros: "Fedtsyrer er carboxylsyrer med lange kæder. En mættet fedtsyre er lige, og hver dobbeltbinding giver et knæk." },
            { navn: "Fedtstoffet", pladser: ["glycerol", "fedtstof", "triglycerid", "hydrolyse"],
              ros: "Glycerol og tre fedtsyrer giver et fedtstof og vand. Hydrolysen spalter fedtstoffet igen." },
            { navn: "Olie og fast fedt", pladser: ["olie", "hærdning"],
              ros: "Olie er flydende, fordi kæderne har knæk. Ved hærdning bliver dobbeltbindingerne til enkeltbindinger." }
        ],
        pladser: [
            { id: "fedtsyre", ord: ["fedtsyre"], x: FS.x + FS.b / 2, y: FS.y, maal: [FS.x + FS.b / 2, FS.y], titel: true, dele: ["fs"],
              omr: [{ r: [FS.x - 6, FS.y - 6, FS.b + 12, FS.h + 12, 18], tom: true }],
              fejl: { "mættet": "<b>mættet</b> passer kun på stearinsyre. Rammen rummer alle tre syrer med lange kæder.",
                      monoumættet: "<b>monoumættet</b> passer kun på oliesyre. Rammen rummer alle tre syrer med lange kæder.",
                      polyumættet: "<b>polyumættet</b> passer kun på linolsyre. Rammen rummer alle tre syrer med lange kæder.",
                      fedtstof: "<b>fedtstof</b> er bygget af glycerol og tre fedtsyrer. Rammen rummer tre enkelte syrer.",
                      triglycerid: "<b>triglycerid</b> er bygget af glycerol og tre fedtsyrer. Rammen rummer tre enkelte syrer." } },
            kort("mættet", syreKort(0), ["stearinsyre"], {
                monoumættet: "<b>monoumættet</b> har én dobbeltbinding. Stearinsyre har kun enkeltbindinger mellem carbonatomerne.",
                polyumættet: "<b>polyumættet</b> har mere end én dobbeltbinding. Stearinsyre har kun enkeltbindinger mellem carbonatomerne.",
                fedtsyre: "<b>fedtsyre</b> passer på alle tre og står på rammen. Skiltet siger, om stearinsyre har dobbeltbindinger." }),
            kort("monoumættet", syreKort(1), ["oliesyre"], {
                "mættet": "<b>mættet</b> har kun enkeltbindinger. Oliesyre har én dobbeltbinding.",
                polyumættet: "<b>polyumættet</b> har mere end én dobbeltbinding. Oliesyre har kun én.",
                fedtsyre: "<b>fedtsyre</b> passer på alle tre og står på rammen. Skiltet siger, hvor mange dobbeltbindinger oliesyre har." }),
            kort("polyumættet", syreKort(2), ["linolsyre"], {
                "mættet": "<b>mættet</b> har kun enkeltbindinger. Linolsyre har to dobbeltbindinger.",
                monoumættet: "<b>monoumættet</b> har én dobbeltbinding. Linolsyre har to.",
                fedtsyre: "<b>fedtsyre</b> passer på alle tre og står på rammen. Skiltet siger, hvor mange dobbeltbindinger linolsyre har." }),

            { id: "glycerol", ord: ["glycerol"], x: 104, y: 482, maal: [GL[0] + GL[2] / 2, GL[1] + GL[3] + 2], dele: ["glyc"],
              omr: [{ r: [GL[0], GL[1], GL[2], GL[3], 12] }],
              fejl: { fedtsyre: "<b>fedtsyre</b> er en syre med en lang kæde. Pladsen peger på alkoholen med tre OH-grupper.",
                      fedtstof: "<b>fedtstof</b> er produktet til højre. Pladsen peger på alkoholen med tre OH-grupper.",
                      triglycerid: "<b>triglycerid</b> er produktet til højre. Pladsen peger på alkoholen med tre OH-grupper." } },
            { id: "fedtstof", ord: ["fedtstof", "triglycerid"], par: "triglycerid", x: 600, y: 482, maal: [PR[0] + PR[2] / 2, PR[1] + PR[3] + 2], dele: ["produkt"],
              omr: [{ r: [PR[0], PR[1], PR[2], PR[3], 12] }], fejl: FEDTSTOF },
            { id: "triglycerid", ord: ["fedtstof", "triglycerid"], x: 600, y: 482, maal: [PR[0] + PR[2] / 2, PR[1] + PR[3] + 2], dele: ["vand"],
              omr: [{ r: [PR[0], PR[1], PR[2], PR[3], 12] }], fejl: FEDTSTOF },
            { id: "hydrolyse", ord: ["hydrolyse"], x: 300, y: 482, maal: [(PIL.x1 + PIL.x2) / 2, PIL.ned + 12], dele: ["hyd"],
              omr: [{ r: [PIL.x1 - 4, PIL.ned - 10, PIL.x2 - PIL.x1 + 8, 20, 6] }],
              fejl: { hærdning: "<b>hærdning</b> bruger dihydrogen, H₂. Pilen her spalter fedtstoffet med vand.",
                      glycerol: "<b>glycerol</b> er et stof. Pladsen peger på pilen tilbage, hvor fedtstoffet spaltes med vand." } },

            kort("olie", OL, ["olie"], {
                fedtstof: "<b>fedtstof</b> passer på både olie og fast fedt. Skiltet siger, at fedtstoffet i flasken er flydende.",
                triglycerid: "<b>triglycerid</b> passer på både olie og fast fedt. Skiltet siger, at fedtstoffet i flasken er flydende." }),
            { id: "hærdning", ord: ["hærdning"], x: (HP.x1 + HP.x2) / 2, y: HP.y + 56, maal: [(HP.x1 + HP.x2) / 2, HP.y + 14], dele: ["haerd"],
              omr: [{ r: [HP.x1 - 4, HP.y - 36, HP.x2 - HP.x1 + 8, 48, 8] }],
              fejl: { hydrolyse: "<b>hydrolyse</b> spalter et fedtstof med vand. Her sætter H₂ sig på dobbeltbindingerne, og olien bliver fast.",
                      polyumættet: "<b>polyumættet</b> siger noget om en fedtsyre. Pladsen peger på pilen, hvor olien bliver til fast fedt." } }
        ],

        tegn: function (api) {
            var B = ORG.bredde(["fedtsyre", "mættet", "monoumættet", "polyumættet", "glycerol", "fedtstof", "triglycerid", "hydrolyse", "olie", "hærdning"]);

            function syrekort(g, i, navn, knaek, dobbelt) {
                ORG.kort(g, SX[i], SY, SB, SH);
                SV.tekst(g, SX[i] + 16, SY + 26, navn, { "font-size": 16, "font-weight": 700, "text-anchor": "start" });
                return syre(g, SX[i] + 10, SY + 118, knaek, dobbelt);
            }

            /* ----- Lag 1: fedtsyrerne ----------------------------------------- */
            api.del("fs", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, FS.x, FS.y, FS.b, FS.h, { fyld: "#fbf9f2", kant: "#d39a3c" });
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("stearinsyre", {
                lag: 0,
                fuld: function (g) { syrekort(g, 0, "stearinsyre", null, []); },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("oliesyre", {
                lag: 0,
                fuld: function (g) { syrekort(g, 1, "oliesyre", { 8: -56 }, [8]); },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("linolsyre", {
                lag: 0,
                fuld: function (g) { syrekort(g, 2, "linolsyre", { 7: -34, 10: -34 }, [7, 10]); },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            /* ----- Lag 2: fedtstoffet ----------------------------------------- */
            /* Tre fedtsyrer og pilen frem staar der, naar laget begynder */
            api.del("rx", {
                lag: 1, auto: true,
                fuld: function (g) {
                    SV.tekst(g, 182, RY[1] + 8, "+", { "font-size": 24, fill: F.svag });
                    RY.forEach(function (y) {
                        SV.tekst(g, 238, y + 6, "HO", { "font-size": 15, "font-weight": 700, fill: F.roed, "text-anchor": "end" });
                        SV.el("line", { x1: 240, y1: y, x2: 252, y2: y, stroke: "#1f2a33", "stroke-width": 2 }, g);
                        kortKaede(g, 256, y, 7);
                    });
                    ORG.pil(g, PIL.x1, PIL.x2, PIL.op);
                }
            });

            api.del("glyc", {
                lag: 1,
                fuld: function (g) {
                    var a = { "font-size": 17, "font-weight": 700, "text-anchor": "start" };
                    RY.forEach(function (y, i) {
                        SV.tekst(g, 48, y + 6, i === 1 ? "CH" : "CH_2", a);
                        SV.el("line", { x1: 92, y1: y, x2: 108, y2: y, stroke: "#1f2a33", "stroke-width": 2 }, g);
                        SV.tekst(g, 111, y + 6, "OH", Object.assign({}, a, { fill: F.roed }));
                        if (i < 2) SV.el("line", { x1: 55, y1: y + 9, x2: 55, y2: RY[i + 1] - 13, stroke: "#1f2a33", "stroke-width": 2 }, g);
                    });
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("produkt", {
                lag: 1,
                fuld: function (g) {
                    var a = { "font-size": 17, "font-weight": 700, "text-anchor": "start" };
                    RY.forEach(function (y, i) {
                        SV.tekst(g, 474, y + 6, i === 1 ? "CH" : "CH_2", a);
                        SV.el("line", { x1: 518, y1: y, x2: 530, y2: y, stroke: "#1f2a33", "stroke-width": 2 }, g);
                        SV.tekst(g, 533, y + 6, "O", Object.assign({}, a, { fill: F.roed }));
                        SV.el("line", { x1: 547, y1: y, x2: 557, y2: y, stroke: "#1f2a33", "stroke-width": 2 }, g);
                        kortKaede(g, 561, y, 7);
                        if (i < 2) SV.el("line", { x1: 481, y1: y + 9, x2: 481, y2: RY[i + 1] - 13, stroke: "#1f2a33", "stroke-width": 2 }, g);
                    });
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("vand", {
                lag: 1,
                fuld: function (g) {
                    return { t: SV.tekst(g, 740, RY[1] + 7, "+ 3 H_2O", { "font-size": 19, "font-weight": 700, fill: F.blaa }) };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            api.del("hyd", {
                lag: 1,
                fuld: function (g) {
                    return { p: ORG.pil(g, PIL.x2, PIL.x1, PIL.ned, { farve: F.teal }) };
                },
                byg: function (g, r, an) { an.pop(r.p, 0, 450); }
            });

            /* ----- Lag 3: olie og fast fedt ------------------------------------ */
            api.del("fa", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kort(g, FA.x, FA.y, FA.b, FA.h);
                    var x = FA.x + FA.b / 2, y = FA.y + 92, b = 96, h = 44, d = 22;
                    SV.el("ellipse", { cx: x, cy: y + h / 2 + 6, rx: 86, ry: 10, fill: "#e3e9ef" }, g);
                    SV.el("path", { d: "M" + (x - b / 2) + "," + (y - h / 2) + " l" + d + "," + (-d * 0.6) + " l" + b + ",0 l" + (-d) + "," + (d * 0.6) + " Z", fill: "#fbe9a6", stroke: "#d9b44a", "stroke-width": 1.4 }, g);
                    SV.el("path", { d: "M" + (x + b / 2) + "," + (y - h / 2) + " l" + d + "," + (-d * 0.6) + " l0," + h + " l" + (-d) + "," + (d * 0.6) + " Z", fill: "#efcf63", stroke: "#d9b44a", "stroke-width": 1.4 }, g);
                    SV.el("rect", { x: x - b / 2, y: y - h / 2, width: b, height: h, fill: "#f8de85", stroke: "#d9b44a", "stroke-width": 1.4 }, g);
                    SV.tekst(g, x, FA.y + 26, "margarine", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    ORG.givet(g, x, FA.y + FA.h, "fast fedt", B);
                }
            });

            api.del("olie", {
                lag: 2,
                fuld: function (g) {
                    ORG.kort(g, OL.x, OL.y, OL.b, OL.h);
                    var x = OL.x + OL.b / 2, top = OL.y + 34, bund = OL.y + 126;
                    SV.tekst(g, OL.x + 22, OL.y + 26, "planteolie", { "font-size": 15, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    var krop = "M" + (x - 8) + "," + top + " L" + (x - 8) + "," + (top + 16) + " Q" + (x - 26) + "," + (top + 26) + " " + (x - 26) + "," + (top + 40) +
                        " L" + (x - 26) + "," + bund + " L" + (x + 26) + "," + bund + " L" + (x + 26) + "," + (top + 40) + " Q" + (x + 26) + "," + (top + 26) + " " + (x + 8) + "," + (top + 16) + " L" + (x + 8) + "," + top + " Z";
                    SV.el("path", { d: krop, fill: "url(#glas)", stroke: "#8fa3b5", "stroke-width": 2 }, g);
                    SV.el("rect", { x: x - 23, y: top + 44, width: 46, height: bund - top - 47, rx: 3, fill: "#f2cf55", "fill-opacity": 0.92 }, g);
                    SV.el("rect", { x: x - 10, y: top - 9, width: 20, height: 10, rx: 2, fill: "#3f8f4f" }, g);
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("haerd", {
                lag: 2,
                fuld: function (g) {
                    var p = ORG.pil(g, HP.x1, HP.x2, HP.y, { farve: F.teal, bredde: 3 });
                    SV.tekst(g, (HP.x1 + HP.x2) / 2, HP.y - 14, "+ H_2", { "font-size": 18, "font-weight": 700, fill: F.teal });
                    return { p: p };
                },
                byg: function (g, r, an) { an.pop(r.p, 0, 450); }
            });
        }
    };
}());

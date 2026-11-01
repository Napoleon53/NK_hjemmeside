/* =====================================================================
   fig_zigzag.js - figuren til 4.2 Zigzagformler og navngivning

   Til venstre butan og 2-methylpropan som i bogens figur isomerer-c4:
   en raekke zigzagformler med prikker ved hver ende og hvert knaek, og
   en raekke molekylformler (molekylformel er fra 4.1 og staar der i
   forvejen). Til hoejre 3-methylhexan med hovedkaeden groen og
   sidegruppen blaa som i bogens figur navngivning-regler.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var GROEN = "#2f9a52", BLAA = "#2f63c9";
    var I = { x: 222, y: 40, b: 436, h: 396 };       /* rammen om de to isomerer */
    var K1 = 335, K2 = 545;                          /* kolonnerne */
    var NY = 92, SKY = 128;                          /* navnene og skiltene */
    var ZY = 252, MY = 382;                          /* raekkerne */
    var RX = 232;                                    /* raekkernes venstre kant */
    var H = { x: 690, y: 40, b: 290, h: 396 };       /* kortet med 3-methylhexan */

    /* Butan: tre streger; 2-methylpropan: tre streger fra midten */
    var BUT = ORG.kaedePunkter(K1 - 60, ZY + 12, 3, { l: 46, op: true });
    var MP = { c: [K2, ZY - 2], arme: [[K2, ZY - 50], [K2 - 40, ZY + 21], [K2 + 40, ZY + 21]] };
    /* 3-methylhexan: hovedkaeden og methylgruppen paa C nr. 3 */
    var HX = ORG.kaedePunkter(H.x + 40, H.y + 238, 5, { l: 48, op: false });
    var ME = [HX[2], [HX[2][0], HX[2][1] - 52]];

    function kolonne(k) { return [k - 100, 66, 200, 252, 14]; }

    NK.FIGURER.zigzag = {
        vb: [1000, 460],
        lag: [
            { navn: "Kæder og grene", pladser: ["zigzagformel", "uforgrenet", "forgrenet"],
              ros: "I en zigzagformel er hver ende og hvert knæk et C. Butan er én lang kæde, og 2-methylpropan har en gren." },
            { navn: "Isomerer og navne", pladser: ["isomerer", "hovedkæde", "sidegruppe"],
              ros: "Butan og 2-methylpropan er isomerer. Hovedkæden giver den sidste del af navnet og sidegruppen den første." }
        ],
        pladser: [
            { id: "zigzagformel", ord: ["zigzagformel"], x: 117, y: ZY, maal: [RX, ZY], titel: true, dele: ["prikker"],
              omr: [{ r: [RX, ZY - 56, 646 - RX, 112, 12], tom: true }],
              fejl: { uforgrenet: "<b>uforgrenet</b> siger noget om kæden. Pladsen står foran hele rækken af tegninger.",
                      forgrenet: "<b>forgrenet</b> siger noget om kæden. Pladsen står foran hele rækken af tegninger." } },
            { id: "uforgrenet", ord: ["uforgrenet"], x: K1, y: SKY, maal: [K1, SKY], titel: true, dele: ["butan"],
              omr: [{ r: kolonne(K1) }],
              fejl: { forgrenet: "<b>forgrenet</b> har en kort kæde ude på siden. I butan sidder alle fire C i én lang kæde.",
                      isomerer: "<b>isomerer</b> er flere stoffer. Skiltet siger, hvordan kæden i butan ser ud." } },
            { id: "forgrenet", ord: ["forgrenet"], x: K2, y: SKY, maal: [K2, SKY], titel: true, dele: ["mprop"],
              omr: [{ r: kolonne(K2) }],
              fejl: { uforgrenet: "<b>uforgrenet</b> har alle C i én lang kæde. I 2-methylpropan sidder ét C ude på siden.",
                      isomerer: "<b>isomerer</b> er flere stoffer. Skiltet siger, hvordan kæden i 2-methylpropan ser ud." } },

            { id: "isomerer", ord: ["isomerer"], x: I.x + I.b / 2, y: I.y, maal: [I.x + I.b / 2, I.y], titel: true, dele: ["ramme"],
              omr: [{ r: [I.x - 6, I.y - 6, I.b + 12, I.h + 12, 18], tom: true }],
              fejl: { forgrenet: "<b>forgrenet</b> passer kun på 2-methylpropan. Rammen rummer to stoffer med samme molekylformel.",
                      uforgrenet: "<b>uforgrenet</b> passer kun på butan. Rammen rummer to stoffer med samme molekylformel.",
                      hovedkæde: "<b>hovedkæde</b> er den længste kæde i ét molekyle. Rammen rummer to stoffer med samme molekylformel." } },
            { id: "hovedkæde", ord: ["hovedkæde"], x: H.x + H.b / 2, y: H.y + 326, maal: [H.x + H.b / 2, HX[1][1] + 22], dele: ["hoved"],
              omr: [{ r: [HX[0][0] - 12, HX[0][1] - 12, HX[5][0] - HX[0][0] + 24, HX[1][1] - HX[0][1] + 32, 10] }],
              fejl: { sidegruppe: "<b>sidegruppe</b> er den korte kæde ude på siden. Pladsen peger på den længste række af C.",
                      isomerer: "<b>isomerer</b> er flere stoffer. Pladsen peger på den længste række af C i ét molekyle." } },
            { id: "sidegruppe", ord: ["sidegruppe"], x: H.x + H.b / 2, y: H.y + 62, maal: [ME[1][0], ME[1][1] - 12], dele: ["side"],
              omr: [{ r: [ME[1][0] - 12, ME[1][1] - 10, 24, ME[0][1] - ME[1][1] - 4, 8] }],
              fejl: { hovedkæde: "<b>hovedkæde</b> er den længste række af C. Pladsen peger på den korte kæde ude på siden.",
                      forgrenet: "<b>forgrenet</b> siger noget om hele kæden. Pladsen peger kun på den korte kæde ude på siden." } }
        ],

        tegn: function (api) {
            var B = ORG.bredde(["zigzagformel", "uforgrenet", "forgrenet", "isomerer", "hovedkæde", "sidegruppe"]);

            /* ----- Det, der staar der fra start: molekylformlerne ---------------- */
            api.del("mf", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: RX, y: MY - 30, width: 646 - RX, height: 60, rx: 12, fill: "#f7f9fb", stroke: "#d4dbe2", "stroke-width": 1.4 }, g);
                    ORG.givet(g, 117, MY, "molekylformel", B);
                    SV.tekst(g, K1, MY + 7, "C_4H_10", { "font-size": 20, "font-weight": 700 });
                    SV.tekst(g, K2, MY + 7, "C_4H_10", { "font-size": 20, "font-weight": 700 });
                }
            });

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("butan", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: K1 - 96, y: 70, width: 192, height: 244, rx: 12, fill: "#ffffff", stroke: "#d0d8e0", "stroke-width": 1.3 }, g);
                    SV.tekst(g, K1, NY, "butan", { "font-size": 18, "font-weight": 700 });
                    return { z: ORG.zigzag(g, BUT, { bredde: 3 }) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.z.firstChild, 100, 700); }
            });

            api.del("mprop", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: K2 - 96, y: 70, width: 192, height: 244, rx: 12, fill: "#ffffff", stroke: "#d0d8e0", "stroke-width": 1.3 }, g);
                    SV.tekst(g, K2, NY, "2-methylpropan", { "font-size": 18, "font-weight": 700 });
                    var z = SV.g(g);
                    MP.arme.forEach(function (a) {
                        SV.el("line", { x1: MP.c[0], y1: MP.c[1], x2: a[0], y2: a[1], stroke: "#1f2a33", "stroke-width": 3, "stroke-linecap": "round" }, z);
                    });
                    return { z: z };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.z, 100, 500); }
            });

            /* Prikkerne ved hver ende og hvert knaek: der sidder et C */
            api.del("prikker", {
                lag: 0,
                fuld: function (g) {
                    var p = SV.g(g);
                    BUT.concat([MP.c], MP.arme).forEach(function (q) {
                        SV.el("circle", { cx: q[0], cy: q[1], r: 5, fill: F.teal, stroke: "#ffffff", "stroke-width": 1.5 }, p);
                    });
                    SV.tekst(g, (K1 + K2) / 2, ZY + 84, "hvert punkt er et C", { "font-size": 13.5, fill: F.teal, "font-style": "italic" });
                    return { p: p };
                },
                byg: function (g, r, an) {
                    Array.prototype.forEach.call(r.p.childNodes, function (c, i) { an.pop(c, i * 70, 320); });
                }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("ramme", {
                lag: 1,
                fuld: function (g) {
                    var r = ORG.ramme(g, I.x, I.y, I.b, I.h, { kant: F.teal });
                    var s = SV.g(g);
                    var bx = (K1 + K2) / 2;
                    SV.el("rect", { x: bx - 56, y: MY - 15, width: 112, height: 30, rx: 15, fill: F.tealLys, stroke: F.teal, "stroke-width": 1.6 }, s);
                    SV.tekst(s, bx, MY + 5, "samme", { "font-size": 14, "font-weight": 700, fill: F.teal });
                    return { r: r, s: s };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); an.pop(r.s, 400, 450); }
            });

            /* 3-methylhexan: kortet og navnet staar der, kaederne faar farve */
            api.del("hexkort", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kort(g, H.x, H.y, H.b, H.h);
                }
            });

            api.del("hoved", {
                lag: 1,
                fuld: function (g) {
                    var z = ORG.zigzag(g, HX, { farve: GROEN, bredde: 3.4 });
                    var x0 = H.x + H.b / 2 - (NK.tekstBredde("3-methylhexan", 19, 700)) / 2;
                    var b = NK.tekstBredde("3-methyl", 19, 700);
                    SV.tekst(g, x0 + b, H.y + 378, "hexan", { "font-size": 19, "font-weight": 700, fill: GROEN, "text-anchor": "start" });
                    return { z: z };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.z.firstChild, 100, 700); }
            });

            api.del("side", {
                lag: 1,
                fuld: function (g) {
                    var l = SV.el("line", { x1: ME[0][0], y1: ME[0][1], x2: ME[1][0], y2: ME[1][1], stroke: BLAA, "stroke-width": 3.4, "stroke-linecap": "round" }, g);
                    var x0 = H.x + H.b / 2 - (NK.tekstBredde("3-methylhexan", 19, 700)) / 2;
                    SV.tekst(g, x0, H.y + 378, "3-", { "font-size": 19, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    SV.tekst(g, x0 + NK.tekstBredde("3-", 19, 700), H.y + 378, "methyl", { "font-size": 19, "font-weight": 700, fill: BLAA, "text-anchor": "start" });
                    return { l: l };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.l, 100, 500); }
            });
        }
    };
}());

/* =====================================================================
   fig_alkohol.js - figuren til 4.5 Alkoholer og carboxylsyrer

   Ethan, ethanol og ethansyre som stregformler med de funktionelle
   grupper i teal kasser som i bogens figur funktionelle-grupper. Under
   molekylerne to raekker: den funktionelle gruppe (ethan har ingen) og
   stofklassen (alkan er fra 4.1 og staar der i forvejen). Raekkernes
   overskrifter er pladser.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var HX = 120;                                   /* overskrifterne */
    var KX = [362, 600, 838], KB = 220, KY = 40, KH = 360;
    var MY = 170, RB = 282, RC = KY + KH;           /* molekylerne og de to raekker */
    var RX = 236;                                   /* raekkernes venstre kant */
    /* De funktionelle grupper: OH i ethanol, COOH i ethansyre */
    var OH = [KX[1] + 20, MY - 17, 64, 34];
    var COOH = [KX[2] - 18, MY - 58, 102, 75];

    function kort(i) { return [KX[i] - KB / 2, KY, KB, KH]; }

    function skilt(id, i, dele, fejl) {
        var k = kort(i);
        return { id: id, ord: [id], x: KX[i], y: RC, maal: [KX[i], RC], titel: true, dele: dele,
            omr: [{ r: [k[0] - 5, k[1] - 5, k[2] + 10, k[3] + 10, 16] }], fejl: fejl };
    }

    /* Navnene: "ethan" og endelsen hver for sig, saa endelsen kan streges under */
    var NAVN_Y = KY + 34, NS = 19;
    function endelse(i, stamme, ende) {
        var b1 = NK.tekstBredde(stamme, NS, 700), b2 = NK.tekstBredde(ende, NS, 700);
        var x0 = KX[i] - (b1 + b2) / 2;
        return { x0: x0, x: x0 + b1, b: b2 };
    }
    var OL = endelse(1, "ethan", "ol"), SYRE = endelse(2, "ethan", "syre");

    NK.FIGURER.alkohol = {
        vb: [1000, 440],
        lag: [
            { navn: "Grupperne", pladser: ["funktionel gruppe", "hydroxygruppe", "carboxylgruppe"],
              ros: "De funktionelle grupper −OH og −COOH giver stofferne deres egenskaber. Ethan har ingen funktionel gruppe." },
            { navn: "Stofklasserne", pladser: ["stofklasse", "alkohol", "carboxylsyre"],
              ros: "Stoffer med −OH er alkoholer og ender på -ol. Stoffer med −COOH er carboxylsyrer." }
        ],
        pladser: [
            { id: "funktionel gruppe", ord: ["funktionel gruppe"], x: HX, y: RB, maal: [RX, RB], titel: true, dele: ["rb"],
              omr: [{ r: [RX, RB - 24, 958 - RX, 48, 12], tom: true }],
              fejl: { stofklasse: "<b>stofklasse</b> er en familie af stoffer. Rækken her viser de få atomer, der giver stoffet dets egenskaber.",
                      hydroxygruppe: "<b>hydroxygruppe</b> er kun −OH i ethanol. Pladsen står foran hele rækken.",
                      carboxylgruppe: "<b>carboxylgruppe</b> er kun −COOH i ethansyre. Pladsen står foran hele rækken." } },
            { id: "hydroxygruppe", ord: ["hydroxygruppe"], x: KX[1], y: RB, maal: [OH[0] + OH[2] / 2, OH[1] + OH[3] + 3], dele: ["oh"],
              omr: [{ r: [OH[0] - 2, OH[1] - 2, OH[2] + 4, OH[3] + 4, 17] }],
              fejl: { carboxylgruppe: "<b>carboxylgruppe</b> er −COOH med to O. I ethanol er gruppen kun −OH.",
                      alkohol: "<b>alkohol</b> er hele stoffet. Pladsen peger kun på −OH i enden af molekylet.",
                      "funktionel gruppe": "<b>funktionel gruppe</b> passer på både −OH og −COOH og står foran rækken. Her er gruppens eget navn." } },
            { id: "carboxylgruppe", ord: ["carboxylgruppe"], x: KX[2], y: RB, maal: [COOH[0] + COOH[2] / 2 + 10, COOH[1] + COOH[3] + 3], dele: ["cooh"],
              omr: [{ r: [COOH[0] - 2, COOH[1] - 2, COOH[2] + 4, COOH[3] + 4, 14] }],
              fejl: { hydroxygruppe: "<b>hydroxygruppe</b> er kun −OH. Her er der også et O med dobbeltbinding til C.",
                      carboxylsyre: "<b>carboxylsyre</b> er hele stoffet. Pladsen peger kun på −COOH i enden af molekylet.",
                      "funktionel gruppe": "<b>funktionel gruppe</b> passer på både −OH og −COOH og står foran rækken. Her er gruppens eget navn." } },

            { id: "stofklasse", ord: ["stofklasse"], x: HX, y: RC, maal: [RX, RC], titel: true, dele: ["rc"],
              omr: [{ r: [RX, RC - 22, 958 - RX, 44, 12], tom: true }],
              fejl: { "funktionel gruppe": "<b>funktionel gruppe</b> er de få atomer. Rækken her er navnene på hele familier af stoffer, ligesom alkan.",
                      alkohol: "<b>alkohol</b> er kun én af familierne. Pladsen står foran hele rækken.",
                      carboxylsyre: "<b>carboxylsyre</b> er kun én af familierne. Pladsen står foran hele rækken." } },
            skilt("alkohol", 1, ["ol"], {
                carboxylsyre: "<b>carboxylsyre</b> har −COOH. Ethanol har kun −OH.",
                hydroxygruppe: "<b>hydroxygruppe</b> er kun −OH. Skiltet er navnet på den familie, som ethanol hører til, ligesom alkan." }),
            skilt("carboxylsyre", 2, ["syre"], {
                alkohol: "<b>alkohol</b> har kun −OH. Ethansyre har −COOH.",
                carboxylgruppe: "<b>carboxylgruppe</b> er kun −COOH. Skiltet er navnet på den familie, som ethansyre hører til, ligesom alkan." })
        ],

        tegn: function (api) {
            var B = ORG.bredde(["funktionel gruppe", "hydroxygruppe", "carboxylgruppe", "stofklasse", "alkohol", "carboxylsyre"]);

            /* ----- Det, der staar der fra start: kortene og molekylerne --------- */
            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    [0, 1, 2].forEach(function (i) { var k = kort(i); ORG.kort(g, k[0], k[1], k[2], k[3]); });
                    var a = { "font-size": NS, "font-weight": 700 };
                    SV.tekst(g, KX[0], NAVN_Y, "ethan", a);
                    SV.tekst(g, OL.x0, NAVN_Y, "ethanol", Object.assign({ "text-anchor": "start" }, a));
                    SV.tekst(g, SYRE.x0, NAVN_Y, "ethansyre", Object.assign({ "text-anchor": "start" }, a));
                    var x = KX[0];
                    ORG.streg(g, [[x - 17, MY, "C"], [x + 17, MY, "C"], [x - 51, MY, "H"], [x + 51, MY, "H"],
                        [x - 17, MY - 34, "H"], [x - 17, MY + 34, "H"], [x + 17, MY - 34, "H"], [x + 17, MY + 34, "H"]],
                        [[0, 1], [0, 2], [1, 3], [0, 4], [0, 5], [1, 6], [1, 7]], { x: 0, y: 0, d: 1 });
                    x = KX[1];
                    ORG.streg(g, [[x - 70, MY, "H"], [x - 36, MY, "C"], [x - 2, MY, "C"], [x + 34, MY, "O"], [x + 68, MY, "H"],
                        [x - 36, MY - 34, "H"], [x - 36, MY + 34, "H"], [x - 2, MY - 34, "H"], [x - 2, MY + 34, "H"]],
                        [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [1, 6], [2, 7], [2, 8]], { x: 0, y: 0, d: 1 });
                    x = KX[2];
                    ORG.streg(g, [[x - 70, MY, "H"], [x - 36, MY, "C"], [x - 2, MY, "C"], [x + 34, MY, "O"], [x + 68, MY, "H"],
                        [x - 36, MY - 34, "H"], [x - 36, MY + 34, "H"], [x - 2, MY - 40, "O"]],
                        [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [1, 6], [2, 7, 2]], { x: 0, y: 0, d: 1 });
                }
            });

            /* ----- Lag 1: de funktionelle grupper ---------------------------- */
            api.del("rb", {
                lag: 0,
                fuld: function (g) {
                    var r = SV.el("rect", { x: RX, y: RB - 24, width: 958 - RX, height: 48, rx: 12, fill: "rgba(29,122,114,0.06)", stroke: "#a9d3c9", "stroke-width": 1.4 }, g);
                    ORG.givet(g, KX[0], RB, "ingen", B);
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("oh", {
                lag: 0,
                fuld: function (g) {
                    return { k: SV.el("rect", { x: OH[0], y: OH[1], width: OH[2], height: OH[3], rx: 17, fill: F.teal, "fill-opacity": 0.14, stroke: F.teal, "stroke-width": 2.4 }, g) };
                },
                byg: function (g, r, an) { an.pop(r.k, 0, 450); }
            });

            api.del("cooh", {
                lag: 0,
                fuld: function (g) {
                    return { k: SV.el("rect", { x: COOH[0], y: COOH[1], width: COOH[2], height: COOH[3], rx: 14, fill: F.teal, "fill-opacity": 0.14, stroke: F.teal, "stroke-width": 2.4 }, g) };
                },
                byg: function (g, r, an) { an.pop(r.k, 0, 450); }
            });

            /* ----- Lag 2: stofklasserne --------------------------------------- */
            api.del("rc", {
                lag: 1,
                fuld: function (g) {
                    var r = SV.el("rect", { x: RX, y: RC - 22, width: 958 - RX, height: 44, rx: 12, fill: "rgba(29,122,114,0.06)", stroke: "#a9d3c9", "stroke-width": 1.4 }, g);
                    ORG.givet(g, KX[0], RC, "alkan", B);
                    return { r: r };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* Endelserne -ol og -syre streges under */
            [["ol", OL], ["syre", SYRE]].forEach(function (x) {
                api.del(x[0], {
                    lag: 1,
                    fuld: function (g) {
                        return { s: SV.el("line", { x1: x[1].x, y1: NAVN_Y + 5, x2: x[1].x + x[1].b, y2: NAVN_Y + 5, stroke: F.teal, "stroke-width": 3, "stroke-linecap": "round" }, g) };
                    },
                    byg: function (g, r, an) { an.streg(r.s, 0, 450); }
                });
            });
        }
    };
}());

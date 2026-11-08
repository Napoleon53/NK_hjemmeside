/* =====================================================================
   fig_spaending.js - figuren til 8.2 Spændingsrækken

   Bogens spaendingsraekken: Li til Au i kasser med H₂ i midten, en orange
   pil mod venstre (afgiver let elektroner) og en blaa mod hoejre (afgiver
   nødigt elektroner). Bogens "uædle metaller" og "ædle metaller" ved
   pilene er taget af, saa de ikke afsloerer pladserne. Pilene staar over
   raekken, saa pladserne under den kan pege op uden at krydse dem.
   Tre fagord i ét lag.

   7. nov. 2026: lithium staar foerst som i bogen (brugerens oenske), saa
   der er 15 kasser. De er 56 brede med 7 imellem (foer 58 og 8), saa
   raekken ikke kommer helt ud til kortets kant.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var ORANGE = "#b4530a", BLAA = "#1d4ed8";
    var K = { x: 40, y: 50, b: 1020, h: 300 };
    var MET = ["Li", "K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Pb", "H_2", "Cu", "Ag", "Hg", "Pt", "Au"];
    var BB = 56, GAB = 7, X0 = 550 - (MET.length * BB + (MET.length - 1) * GAB) / 2, RY = 150, RH = 60;
    function bx(i) { return X0 + i * (BB + GAB); }
    var H = MET.indexOf("H_2");

    function kasse(g, i, fyld, kant) {
        SV.el("rect", { x: bx(i), y: RY, width: BB, height: RH, rx: 9, fill: fyld, stroke: kant, "stroke-width": 1.8, filter: "url(#skygge)" }, g);
        SV.tekst(g, bx(i) + BB / 2, RY + RH / 2 + 8, MET[i], { "font-size": 22, "font-weight": 700 });
    }

    NK.FIGURER.spaending = {
        vb: [1100, 390],
        lag: [
            { navn: "Rækken", pladser: ["spændingsrækken", "uædelt", "ædelt"],
              ros: "Spændingsrækken ordner metallerne. De uædle til venstre afgiver let elektroner, de ædle til højre nødigt." }
        ],
        pladser: [
            { id: "spændingsrækken", ord: ["spændingsrækken"], x: K.x + K.b / 2, y: K.y, maal: [K.x + K.b / 2, K.y], titel: true, dele: ["raekke"],
              omr: [{ r: [K.x - 5, K.y - 5, K.b + 10, K.h + 10, 18], tom: true }],
              fejl: { "uædelt": "<b>uædelt</b> siges om ét metal, der let afgiver elektroner. Overskriften gælder hele rækken.",
                      "ædelt": "<b>ædelt</b> siges om ét metal, der nødigt afgiver elektroner. Overskriften gælder hele rækken." } },
            { id: "uædelt", ord: ["uædelt"], x: (bx(0) + bx(H - 1) + BB) / 2, y: 292, maal: [(bx(0) + bx(H - 1) + BB) / 2, RY + RH + 8], dele: ["uaedle"],
              omr: [{ r: [bx(0) - 6, RY - 6, bx(H - 1) + BB - bx(0) + 12, RH + 12, 10] }],
              fejl: { "ædelt": "<b>ædelt</b> siges om metaller, der nødigt afgiver elektroner. Metallerne her står til venstre og afgiver let elektroner.",
                      "spændingsrækken": "<b>spændingsrækken</b> er hele rækken. Pladsen peger kun på metallerne til venstre for H₂." } },
            { id: "ædelt", ord: ["ædelt"], x: (bx(H + 1) + bx(MET.length - 1) + BB) / 2, y: 292, maal: [(bx(H + 1) + bx(MET.length - 1) + BB) / 2, RY + RH + 8], dele: ["aedle"],
              omr: [{ r: [bx(H + 1) - 6, RY - 6, bx(MET.length - 1) + BB - bx(H + 1) + 12, RH + 12, 10] }],
              fejl: { "uædelt": "<b>uædelt</b> siges om metaller, der let afgiver elektroner. Metallerne her står til højre og afgiver nødigt elektroner.",
                      "spændingsrækken": "<b>spændingsrækken</b> er hele rækken. Pladsen peger kun på metallerne til højre for H₂." } }
        ],

        tegn: function (api) {
            api.del("raekke", {
                lag: 0,
                fuld: function (g) {
                    LAB.kort(g, K.x, K.y, K.b, K.h);
                    var gg = SV.g(g);
                    kasse(gg, H, "#e0f2ef", F.teal);
                    var xv = bx(H) - 12, xh = bx(H) + BB + 12;
                    LAB.pil(gg, xv, bx(0) + 2, 120, { farve: ORANGE, bredde: 2.6 });
                    LAB.pil(gg, xh, bx(MET.length - 1) + BB - 2, 120, { farve: BLAA, bredde: 2.6 });
                    SV.tekst(gg, bx(0), 103, "afgiver let elektroner", { "font-size": 16, "font-weight": 700, fill: ORANGE, "text-anchor": "start" });
                    SV.tekst(gg, bx(MET.length - 1) + BB, 103, "afgiver nødigt elektroner", { "font-size": 16, "font-weight": 700, fill: BLAA, "text-anchor": "end" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            api.del("uaedle", {
                lag: 0,
                fuld: function (g) {
                    var k = [];
                    for (var i = 0; i < H; i++) { var gg = SV.g(g); kasse(gg, i, "#fdeee2", ORANGE); k.push(gg); }
                    return { k: k };
                },
                byg: function (g, r, an) { r.k.forEach(function (el, i) { an.pop(el, 60 * i, 400); }); }
            });

            api.del("aedle", {
                lag: 0,
                fuld: function (g) {
                    var k = [];
                    for (var i = H + 1; i < MET.length; i++) { var gg = SV.g(g); kasse(gg, i, "#e5ecfd", BLAA); k.push(gg); }
                    return { k: k };
                },
                byg: function (g, r, an) { r.k.forEach(function (el, i) { an.pop(el, 60 * i, 400); }); }
            });
        }
    };
}());

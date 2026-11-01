/* =====================================================================
   fig_molar.js - figuren til 5.2 Molarmasse

   Som bogens figur molarmasse-vand: et vandmolekyle med atomernes
   masser i u og tre kort: massen af ét molekyle i u, massen af ét mol
   i gram og massen pr. mol i g/mol. Ordene formelmasse og molarmasse
   står ikke på kortene, så de ikke afslører pladserne. Massen af
   molekylet står som en superberegning med formlen først og symbolet m
   (brugeren 1. nov. 2026: formelmassen "skal også indgå i beregningen
   som et symbol - eventuelt bare m"; bogens m_formelmasse ville afsløre
   pladsen).
   Atommasse er fra kapitel 1 og sættes på igen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var KM = { x: 30, y: 30, b: 330, h: 392 };           /* kortet med vandmolekylet */
    var O = [195, 150], H1 = [125, 222], H2 = [265, 222];
    var MASSE = [[O[0], 84, "16,00 u"], [H1[0], 286, "1,008 u"], [H2[0], 286, "1,008 u"]];
    function masseFelt(m) { var b = NK.tekstBredde(m[2], 18, 700) + 14; return { r: [m[0] - b / 2, m[1] - 20, b, 28, 6] }; }
    var KX = 384, KB = 410;                              /* de tre kort */
    var KY = [30, 212, 332], KH = [148, 90, 90];
    function kortOmr(i) { return [{ r: [KX - 4, KY[i] - 4, KB + 8, KH[i] + 8, 14] }]; }
    function kortMaal(i) { return [KX + KB + 4, KY[i] + KH[i] / 2]; }

    NK.FIGURER.molar = {
        vb: [1000, 452],
        lag: [
            { navn: "Fra u til g/mol", pladser: ["atommasse", "formelmasse", "molarmasse"],
              ros: "Atomernes masser giver tilsammen molekylets masse i u. Ét mol vejer samme tal i gram, så molarmassen er 18,02 g/mol." }
        ],
        pladser: [
            { id: "atommasse", ord: ["atommasse"], x: H2[0], y: 370, maal: [H2[0], 299], dele: ["masser"],
              omr: MASSE.map(masseFelt),
              fejl: { formelmasse: "<b>formelmasse</b> er massen af hele molekylet. Pladsen peger på massen af hvert enkelt atom.",
                      molarmasse: "<b>molarmasse</b> måles i g/mol. Tallene ved atomerne er målt i u og gælder ét atom." } },
            { id: "formelmasse", ord: ["formelmasse"], x: 892, y: KY[0] + KH[0] / 2, maal: kortMaal(0), dele: ["k1"], omr: kortOmr(0),
              fejl: { molarmasse: "<b>molarmasse</b> er massen af ét mol i g/mol. Kortet viser massen af ét enkelt molekyle i u.",
                      atommasse: "<b>atommasse</b> gælder ét atom. Kortet lægger tre atomers masser sammen til hele molekylet." } },
            { id: "molarmasse", ord: ["molarmasse"], x: 892, y: KY[2] + KH[2] / 2, maal: kortMaal(2), dele: ["k3"], omr: kortOmr(2),
              fejl: { formelmasse: "<b>formelmasse</b> er massen af ét molekyle i u. Kortet viser massen pr. mol i g/mol.",
                      atommasse: "<b>atommasse</b> gælder ét atom og måles i u. Kortet viser massen pr. mol vand i g/mol." } }
        ],

        tegn: function (api) {
            api.del("vand", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KM.x, KM.y, KM.b, KM.h);
                    SV.tekst(g, KM.x + 20, KM.y + 30, "vand, H_2O", { "font-size": 16, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    SV.kugle(g, H1[0], H1[1], 32, "H", "H");
                    SV.kugle(g, H2[0], H2[1], 32, "H", "H");
                    SV.kugle(g, O[0], O[1], 52, "O", "O");
                    /* Pilene mellem kortene */
                    [0, 1].forEach(function (i) {
                        var y1 = KY[i] + KH[i] + 4, y2 = KY[i + 1] - 4;
                        LAB.pil(g, KX + KB / 2, y1, KX + KB / 2, y2, { farve: "#8a949e", bredde: 2.2 });
                    });
                }
            });

            api.del("masser", {
                lag: 0,
                fuld: function (g) {
                    var t = MASSE.map(function (m) {
                        return SV.tekst(g, m[0], m[1], m[2], { "font-size": 18, "font-weight": 700, fill: F.teal });
                    });
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 150, 450); }); }
            });

            function kort(id, i, linje1, linje2, farve) {
                api.del(id, {
                    lag: 0, auto: !farve,
                    fuld: function (g) {
                        ORG.kort(g, KX, KY[i], KB, KH[i], farve ? { fyld: "#eef7f5", kant: "#8fc7bb" } : {});
                        SV.tekst(g, KX + 22, KY[i] + 32, linje1, { "font-size": 16, fill: F.svag, "text-anchor": "start" });
                        var t = SV.tekst(g, KX + 22, KY[i] + 66, linje2, { "font-size": 22, "font-weight": 700, fill: farve || F.tekst, "text-anchor": "start" });
                        return { t: t };
                    },
                    byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.t, 200, 450); }
                });
            }

            /* Massen af ét molekyle som superberegning: formlen, tallene og
               resultatet på hver sin linje med lighedstegnene under hinanden */
            api.del("k1", {
                lag: 0,
                fuld: function (g) {
                    ORG.kort(g, KX, KY[0], KB, KH[0]);
                    SV.tekst(g, KX + 22, KY[0] + 30, "Massen af ét vandmolekyle", { "font-size": 16, fill: F.svag, "text-anchor": "start" });
                    var a = { "font-size": 19, "text-anchor": "start" };
                    var x0 = KX + 22, eq = x0 + NK.tekstBredde("m(H2O) ", 19, 400) + 2, hx = eq + NK.tekstBredde("= ", 19, 400);
                    SV.tekst(g, x0, KY[0] + 66, "m(H_2O)", a);
                    [66, 98, 130].forEach(function (dy) { SV.tekst(g, eq, KY[0] + dy, "=", a); });
                    SV.tekst(g, hx, KY[0] + 66, "2 · m(H) + m(O)", a);
                    SV.tekst(g, hx, KY[0] + 98, "2 · 1,008 u + 16,00 u", a);
                    var t = SV.tekst(g, hx, KY[0] + 130, "18,02 u", { "font-size": 20, "font-weight": 700, "text-anchor": "start" });
                    return { t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.t, 200, 450); }
            });
            kort("k2", 1, "Ét mol vandmolekyler vejer", "18,02 g");
            kort("k3", 2, "Massen pr. mol vand", "M(H_2O) = 18,02 g/mol", F.teal);
        }
    };
}());

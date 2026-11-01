/* =====================================================================
   fig_aktuel.js - figuren til 6.2 Formel og aktuel koncentration

   Som bogens figur formel-aktuel: 0,20 mol calciumchlorid opløses, så
   opløsningen fylder 1,0 L. Til venstre det, der hældes i (en lup med to
   formelenheder CaCl₂ og søjlerne for den formelle koncentration), til
   højre det, der findes i opløsningen (to calciumioner og fire
   chloridioner og søjlerne for den aktuelle koncentration).
   Kapitlet har kun to fagord her, så eleven sætter også stofmængde
   (kapitel 5), formelenhed (kapitel 2) og molær (6.1) på igen.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var HX = 300, HY = 40;                                  /* overskriftens start */
    var MOL = "0,20 mol", WMOL = NK.tekstBredde(MOL, 16, 700);
    var KF = { x: 25, y: 116, b: 445, h: 514 };             /* foer */
    var KE = { x: 530, y: 116, b: 445, h: 514 };            /* efter */
    var LUPY = 236, LUPR = 74;                              /* lupperne */
    var UX = KF.x + 120;                                    /* formelenhederne */
    var UY = [LUPY - 16, LUPY + 16];
    var DIV = 336;                                          /* skillelinjen */
    var BUND = 572, PRM = 400;                              /* soejlernes bund og pixel pr. M */
    var MY = 376;                                           /* bogstavet M over aksen */
    var WM = NK.tekstBredde("M", 14, 700);
    function ax(k) { return k.x + 82; }                     /* aksen */
    function mid(k) { return k.x + k.b / 2; }

    var SOEJLE = { graa: ["#cfd6dd", "#8a949e", "#3b4650"], roed: ["#f4b3a9", "#d0564b", "#9c2a20"], blaa: ["#aac4f2", "#4a78dc", "#1d4aa0"] };

    /* Et soejlediagram. v er tre koncentrationer, navne tre etiketter */
    function diagram(g, k, v, navne, farver, medM) {
        var x0 = ax(k), xs = [x0 + 70, x0 + 180, x0 + 290];
        [0, 0.2, 0.4].forEach(function (t) {
            var y = BUND - t * PRM;
            SV.el("line", { x1: x0, y1: y, x2: x0 + 340, y2: y, stroke: t ? "#e1e6eb" : "#3b4650", "stroke-width": t ? 1 : 1.6 }, g);
            SV.tekst(g, x0 - 8, y + 5, t ? String(t.toFixed(2)).replace(".", ",") : "0", { "font-size": 13, fill: F.svag, "text-anchor": "end" });
        });
        if (medM) SV.tekst(g, x0 - 8, MY + 5, "M", { "font-size": 14, "font-weight": 700, fill: F.svag, "text-anchor": "end" });
        xs.forEach(function (x, i) {
            var f = SOEJLE[farver[i]], h = v[i] * PRM;
            if (h > 0) {
                SV.el("rect", { x: x - 28, y: BUND - h, width: 56, height: h, rx: 3, fill: f[0], stroke: f[1], "stroke-width": 1.4 }, g);
                for (var y = BUND - 40; y > BUND - h + 1; y -= 40) SV.el("line", { x1: x - 28, y1: y, x2: x + 28, y2: y, stroke: f[1], "stroke-width": 1 }, g);
            }
            SV.tekst(g, x, BUND - h - 10, (v[i] ? v[i].toFixed(2).replace(".", ",") : "0") + " M", { "font-size": 15, "font-weight": 700, fill: f[2] });
            SV.tekst(g, x, BUND + 24, navne[i], { "font-size": 15, "font-weight": 700, fill: f[2] });
        });
    }

    function kort(g, k, titel) {
        LAB.kort(g, k.x, k.y, k.b, k.h);
        SV.tekst(g, mid(k), k.y + 28, titel, { "font-size": 16, "font-weight": 700, fill: F.teal });
        SV.el("line", { x1: k.x + 20, y1: DIV, x2: k.x + k.b - 20, y2: DIV, stroke: "#dde3e8", "stroke-width": 1.4 }, g);
        SV.el("circle", { cx: k === KF ? UX : mid(k) - 70, cy: LUPY, r: LUPR, fill: "url(#lup)", stroke: "#b7c3cf", "stroke-width": 3, filter: "url(#skygge)" }, g);
    }

    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: mid(k), y: k.y + k.h, maal: [mid(k), k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x + 8, DIV + 8, k.b - 16, k.y + k.h - DIV - 4, 12] }], fejl: fejl };
    }

    NK.FIGURER.aktuel = {
        vb: [1000, 660],
        lag: [
            { navn: "Saltet opløses", pladser: ["stofmængde", "formelenhed"],
              ros: "Der hældes 0,20 mol CaCl₂ i. Hver formelenhed giver én calciumion og to chloridioner." },
            { navn: "To slags koncentration", pladser: ["formel koncentration", "aktuel koncentration", "molær"],
              ros: "Den formelle koncentration gælder saltet, der hældes i. Den aktuelle gælder ionerne, der findes i opløsningen." }
        ],
        pladser: [
            /* ----- Lag 1: saltet, der hældes i -------------------------------- */
            { id: "stofmængde", ord: ["stofmængde"], x: 150, y: HY - 6, maal: [HX - 9, HY - 6], dele: ["mol"],
              omr: [{ r: [HX - 5, HY - 21, WMOL + 10, 28, 6] }],
              fejl: { formelenhed: "<b>formelenhed</b> er den mindste portion af saltet. Pladsen peger på antallet af mol, der hældes i.",
                      "formel koncentration": "<b>formel koncentration</b> er mol pr. liter. Pladsen peger kun på antallet af mol.",
                      molær: "<b>molær</b> er bogstavet M for mol/L. Pladsen peger på antallet af mol, der hældes i." } },
            { id: "formelenhed", ord: ["formelenhed"], x: KF.x + KF.b - 128, y: UY[0], maal: [UX + 47, UY[0]], dele: ["enheder"],
              omr: [{ r: [UX - 44, UY[0] - 17, 88, 34, 14] }],
              fejl: { stofmængde: "<b>stofmængde</b> er et antal mol. Pladsen peger på én portion af saltet med én Ca²⁺ og to Cl⁻.",
                      "formel koncentration": "<b>formel koncentration</b> er en koncentration. Pladsen peger på én portion af saltet med én Ca²⁺ og to Cl⁻." } },

            /* ----- Lag 2: de to slags koncentration --------------------------- */
            skilt("formel koncentration", KF, ["formel"], {
                "aktuel koncentration": "<b>aktuel koncentration</b> gælder det, der faktisk findes i opløsningen. Søjlerne her viser det, der hældes i.",
                stofmængde: "<b>stofmængde</b> er et antal mol. Søjlerne viser mol pr. liter af det, der hældes i.",
                molær: "<b>molær</b> er kun bogstavet M. Skiltet er navnet på søjlerne for det, der hældes i." }),
            skilt("aktuel koncentration", KE, ["aktuel"], {
                "formel koncentration": "<b>formel koncentration</b> gælder det, der hældes i. Søjlerne her viser ionerne, der findes i opløsningen.",
                molær: "<b>molær</b> er kun bogstavet M. Skiltet er navnet på søjlerne for ionerne i opløsningen." }),
            { id: "molær", ord: ["molær"], x: KF.x + KF.b - 128, y: MY, maal: [ax(KF) - 8 + 6, MY], dele: ["enhed"],
              omr: [{ r: [ax(KF) - 8 - WM - 5, MY - 13, WM + 10, 26, 6] }],
              fejl: { "formel koncentration": "<b>formel koncentration</b> er navnet på søjlerne. Pladsen peger kun på bogstavet M ved aksen.",
                      "aktuel koncentration": "<b>aktuel koncentration</b> er navnet på søjlerne til højre. Pladsen peger kun på bogstavet M ved aksen.",
                      stofmængde: "<b>stofmængde</b> måles i mol. Pladsen peger på bogstavet M, der står i stedet for mol/L." } }
        ],

        tegn: function (api) {
            /* ----- Det, der staar der fra start --------------------------------- */
            api.del("ramme", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.tekst(g, HX + WMOL + 5, HY, "calciumchlorid opløses i vand, så opløsningen fylder 1,0 L", { "font-size": 16, fill: F.tekst, "text-anchor": "start" });
                    SV.el("rect", { x: 330, y: 62, width: 340, height: 36, rx: 8, fill: "#eef6f4", stroke: "#cfe3de", "stroke-width": 1.2 }, g);
                    SV.tekst(g, 500, 87, "CaCl_2(s) → Ca^2+(aq) + 2 Cl^−(aq)", { "font-size": 18, "font-weight": 700 });
                    kort(g, KF, "Før: det, der hældes i");
                    kort(g, KE, "Efter: det, der findes i opløsningen");
                    SV.tekst(g, (KF.x + KF.b + KE.x) / 2, LUPY - 10, "opløses", { "font-size": 13, fill: F.svag });
                    LAB.pil(g, KF.x + KF.b + 6, KE.x - 6, LUPY + 2);
                    SV.tekst(g, UX, LUPY + LUPR + 26, "CaCl_2(s)", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    var ex = mid(KE) + 80;
                    SV.tekst(g, ex, LUPY - 4, "2 calciumioner", { "font-size": 15, fill: F.svag });
                    SV.tekst(g, ex, LUPY + 18, "4 chloridioner", { "font-size": 15, fill: F.svag });
                    /* Ionerne efter opløsningen */
                    var lx = mid(KE) - 70;
                    [[-36, -28, "Ca"], [6, -46, "Cl"], [36, -12, "Cl"], [-42, 18, "Cl"], [-6, 40, "Cl"], [34, 28, "Ca"]].forEach(function (p) {
                        if (p[2] === "Ca") SV.kugle(g, lx + p[0], LUPY + p[1], 14, "proton", "Ca^2+");
                        else SV.kugle(g, lx + p[0], LUPY + p[1], 14, "elektron", "Cl^−");
                    });
                }
            });

            /* ----- Lag 1 ---------------------------------------------------------- */
            api.del("mol", {
                lag: 0,
                fuld: function (g) { return { t: SV.tekst(g, HX, HY, MOL, { "font-size": 16, "font-weight": 700, fill: F.teal, "text-anchor": "start" }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            api.del("enheder", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    UY.forEach(function (y) {
                        SV.kugle(gg, UX - 27, y, 14, "elektron", "Cl^−");
                        SV.kugle(gg, UX + 27, y, 14, "elektron", "Cl^−");
                        SV.kugle(gg, UX, y, 14, "proton", "Ca^2+");
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            /* ----- Lag 2: soejlerne ------------------------------------------------ */
            api.del("formel", {
                lag: 1,
                fuld: function (g) { diagram(g, KF, [0.2, 0, 0], ["c(CaCl_2)", "c(Ca^2+)", "c(Cl^−)"], ["graa", "roed", "blaa"], false); },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("aktuel", {
                lag: 1,
                fuld: function (g) {
                    diagram(g, KE, [0, 0.2, 0.4], ["[CaCl_2]", "[Ca^2+]", "[Cl^−]"], ["graa", "roed", "blaa"], true);
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("enhed", {
                lag: 1,
                fuld: function (g) { return { t: SV.tekst(g, ax(KF) - 8, MY + 5, "M", { "font-size": 14, "font-weight": 800, fill: F.teal, "text-anchor": "end" }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });
        }
    };
}());

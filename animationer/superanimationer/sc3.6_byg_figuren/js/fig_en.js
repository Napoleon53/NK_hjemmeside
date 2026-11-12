/* =====================================================================
   fig_en.js - figuren til 3.3 Elektronegativitet og polære bindinger

   Øverst et udsnit af bogens figur elektronegativitet: H og 2. og 3.
   periode med tallene og farver, der bliver moerkere, jo hoejere
   tallet er. Nederst tre kort som bogens figur bindingstyper: Cl−Cl
   med parret i midten, H−Cl med parret tættest på Cl og Na⁺ og Cl⁻.
   Ionbinding er fra kapitel 2, men eleven saetter det paa igen
   (brugeren 1. nov. 2026: "der må gerne være lidt repeterende øvelser").
   Fire fagord, saa figuren har ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var TB = { x: 205, y: 40, b: 590, h: 186 };          /* kortet med tabellen */
    var CW = 76, CH = 34, CG = 4;
    var TX = TB.x + (TB.b - (7 * CW + 6 * CG)) / 2, TY = TB.y + 30;
    var EN = [
        [["H", 2.1]],
        [["Li", 1.0], ["Be", 1.5], ["B", 2.0], ["C", 2.5], ["N", 3.0], ["O", 3.5], ["F", 4.0]],
        [["Na", 0.9], ["Mg", 1.2], ["Al", 1.5], ["Si", 1.8], ["P", 2.1], ["S", 2.5], ["Cl", 3.0]]
    ];

    var KB = 290, KH = 236, KY = 270;
    var KX = [30, 355, 680];
    var AY = KY + 112;                                    /* atomernes midte */
    function cx(i) { return KX[i] + KB / 2; }

    function bredde(ord) {
        var b = 120;
        ord.forEach(function (o) { b = Math.max(b, NK.tekstBredde(o, 18, 700) + 28); });
        return Math.ceil(b);
    }

    /* Farven efter tallet: lys ved 0,8 og moerk teal ved 4,0 */
    function farve(v) {
        var t = Math.max(0, Math.min(1, (v - 0.8) / 3.2));
        var a = [234, 245, 242], b = [38, 140, 124];
        return "rgb(" + a.map(function (x, i) { return Math.round(x + (b[i] - x) * t); }).join(",") + ")";
    }

    function kort(g, i, titel, den) {
        SV.el("rect", { x: KX[i], y: KY, width: KB, height: KH, rx: 14, fill: "#f6f9fb", stroke: "#c5d1dc", "stroke-width": 1.5, filter: "url(#skygge)" }, g);
        SV.tekst(g, KX[i] + 16, KY + 28, titel, { "font-size": 17, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
        SV.tekst(g, KX[i] + KB - 16, KY + 28, den, { "font-size": 15, fill: F.svag, "text-anchor": "end" });
    }

    function tekst(g, i, t) {
        SV.tekst(g, cx(i), KY + KH - 36, t, { "font-size": 13.5, fill: F.svag, "font-style": "italic" });
    }

    function midten(g, x) {
        SV.el("line", { x1: x, y1: AY - 62, x2: x, y2: AY + 48, stroke: "#6d7d8d", "stroke-width": 1.4, "stroke-dasharray": "4 4" }, g);
        SV.tekst(g, x, AY + 63, "midten", { "font-size": 12.5, fill: F.mat });
    }

    function delta(g, x, y, tegn, f) {
        return SV.tekst(g, x, y, "δ" + tegn, { "font-size": 20, "font-weight": 700, fill: f });
    }

    /* Atomsymbolet skrives ved siden af parret, saa elektronerne kan ses */
    function sym(g, x, y, s, f) { SV.tekst(g, x, y + 8, s, { "font-size": 22, "font-weight": 700, fill: f || "#2f4a12" }); }

    function skilt(id, i, dele, fejl) {
        return { id: id, ord: [id], x: cx(i), y: KY + KH, maal: [cx(i), KY + KH], titel: true, dele: dele,
            omr: [{ r: [KX[i] - 5, KY - 5, KB + 10, KH + 10, 16] }], fejl: fejl };
    }

    var TAL = function (o) { return "<b>" + o + "</b> er en binding mellem to atomer. Tabellen viser et tal for hvert grundstof."; };

    NK.FIGURER.en = {
        vb: [1000, 540],
        lag: [
            { navn: "Hvem trækker mest?", pladser: ["elektronegativitet", "upolær binding", "polær binding", "ionbinding"],
              ros: "Jo større forskel i elektronegativitet, jo mere skævt deles elektronparret. Ved en stor forskel dannes der ioner og en ionbinding." }
        ],
        pladser: [
            { id: "elektronegativitet", ord: ["elektronegativitet"], x: TB.x + TB.b / 2, y: TB.y, maal: [TB.x + TB.b / 2, TB.y], titel: true, dele: ["tabel"],
              omr: [{ r: [TB.x - 6, TB.y - 6, TB.b + 12, TB.h + 12, 18], tom: true }],
              fejl: { "upolær binding": TAL("upolær binding"), "polær binding": TAL("polær binding"),
                      ionbinding: "<b>ionbinding</b> er tiltrækningen mellem to ioner. Tabellen viser et tal for hvert grundstof." } },
            skilt("upolær binding", 0, ["upol"], {
                "polær binding": "<b>polær binding</b> deler parret skævt. Her ligger parret præcis i midten mellem de to Cl.",
                elektronegativitet: "<b>elektronegativitet</b> er et tal for hvert grundstof. Kortet viser en binding, hvor parret ligger i midten.",
                ionbinding: "<b>ionbinding</b> er tiltrækningen mellem ioner. De to Cl-atomer er ikke ioner, men deler et elektronpar." }),
            skilt("polær binding", 1, ["pol"], {
                "upolær binding": "<b>upolær binding</b> deler parret ligeligt. Her ligger parret tættest på Cl, som får δ−.",
                elektronegativitet: "<b>elektronegativitet</b> er et tal for hvert grundstof. Kortet viser en binding, hvor parret ligger skævt.",
                ionbinding: "<b>ionbinding</b> er tiltrækningen mellem ioner. H og Cl deler stadig et elektronpar, selv om det ligger skævt." }),
            skilt("ionbinding", 2, ["ion"], {
                "polær binding": "<b>polær binding</b> deler et elektronpar skævt. Her har natrium afgivet sin elektron, så der er to ioner.",
                "upolær binding": "<b>upolær binding</b> deler et elektronpar ligeligt. Her har natrium afgivet sin elektron, så der er to ioner.",
                elektronegativitet: "<b>elektronegativitet</b> er et tal for hvert grundstof. Kortet viser to ioner, der trækker i hinanden." })
        ],

        tegn: function (api) {
            var B = bredde(["elektronegativitet", "upolær binding", "polær binding", "ionbinding"]);

            /* ----- Tabellen ------------------------------------------------------ */
            api.del("tabel", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: TB.x, y: TB.y, width: TB.b, height: TB.h, rx: 16, fill: "#f7faf9", stroke: "#a9d3c9", "stroke-width": 1.8 }, g);
                    var celler = [];
                    EN.forEach(function (raekke, r) {
                        raekke.forEach(function (c, k) {
                            var x = TX + k * (CW + CG), y = TY + r * (CH + CG), v = c[1];
                            var cg = SV.g(g);
                            SV.el("rect", { x: x, y: y, width: CW, height: CH, rx: 5, fill: farve(v), stroke: "#ffffff", "stroke-width": 1 }, cg);
                            var lys = v >= 3.0;
                            SV.tekst(cg, x + 9, y + 23, c[0], { "font-size": 17, "font-weight": 700, fill: lys ? "#ffffff" : F.tekst, "text-anchor": "start" });
                            SV.tekst(cg, x + CW - 8, y + 23, v.toFixed(1).replace(".", ","), { "font-size": 15, fill: lys ? "#ffffff" : F.tekst, "text-anchor": "end" });
                            celler.push({ g: cg, k: k });
                        });
                    });
                    /* Pilen: tallet stiger mod hoejre */
                    var py = TY + 3 * (CH + CG) + 12, x1 = TX + 150, x2 = TX + 7 * CW + 6 * CG;
                    SV.tekst(g, TX, py + 5, "stiger mod højre", { "font-size": 13.5, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
                    SV.el("line", { x1: x1, y1: py, x2: x2 - 10, y2: py, stroke: F.teal, "stroke-width": 2.2 }, g);
                    SV.el("polygon", { points: x2 + "," + py + " " + (x2 - 11) + "," + (py - 5) + " " + (x2 - 11) + "," + (py + 5), fill: F.teal }, g);
                    return { celler: celler };
                },
                byg: function (g, r, an) { r.celler.forEach(function (c) { an.pop(c.g, c.k * 60, 360); }); }
            });

            /* ----- Cl−Cl: parret i midten --------------------------------------- */
            api.del("upol", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 0, "Cl−Cl", "ΔEN = 0");
                    var x = cx(0);
                    SV.kugle(g, x - 34, AY, 42, "Cl");
                    SV.kugle(g, x + 34, AY, 42, "Cl");
                    sym(g, x - 48, AY, "Cl");
                    sym(g, x + 48, AY, "Cl");
                    midten(g, x);
                    var p = SV.g(g);
                    SV.kugle(p, x, AY - 8, 5, "elektron");
                    SV.kugle(p, x, AY + 8, 5, "elektron");
                    tekst(g, 0, "elektronparret ligger midt imellem");
                    return { p: p };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 250, 450); }
            });

            /* ----- H−Cl: parret tættest på Cl ------------------------------------- */
            api.del("pol", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 1, "H−Cl", "ΔEN = 0,9");
                    var x = cx(1), hx = x - 40, clx = x + 28;
                    SV.kugle(g, hx, AY, 28, "H");
                    SV.kugle(g, clx, AY, 44, "Cl");
                    sym(g, hx - 6, AY, "H", "#3a3f45");
                    sym(g, clx + 16, AY, "Cl");
                    midten(g, (hx + clx) / 2);
                    var p = SV.g(g);
                    SV.kugle(p, clx - 26, AY - 8, 5, "gron");
                    SV.kugle(p, clx - 26, AY + 8, 5, "elektron");
                    var d1 = delta(g, hx, AY - 40, "+", F.roed);
                    var d2 = delta(g, clx, AY - 54, "−", F.blaa);
                    tekst(g, 1, "elektronparret ligger tættest på Cl");
                    return { p: p, d: [d1, d2] };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 250, 450); an.pop(r.d[0], 550, 400); an.pop(r.d[1], 650, 400); }
            });

            /* ----- Na⁺ og Cl⁻: ionerne -------------------------------------------- */
            api.del("ion", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 2, "Na^+ og Cl^−", "ΔEN = 2,1");
                    var x = cx(2);
                    var a = SV.kugle(g, x - 62, AY, 24, "proton", "Na^+");
                    var b = SV.kugle(g, x + 40, AY, 44, "elektron", "Cl^−");
                    tekst(g, 2, "natrium har afgivet sin elektron");
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.a, 250, 450); an.pop(r.b, 400, 450); }
            });
        }
    };
}());

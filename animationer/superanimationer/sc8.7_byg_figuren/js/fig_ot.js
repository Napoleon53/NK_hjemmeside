/* =====================================================================
   fig_ot.js - figuren til 8.3 Oxidationstal

   Øverst bogens oxidationstal-eksempler: H₂O, CO₂ og SO₄²⁻ med
   oxidationstallene over atomerne. Nederst bogens ot-skala: tallene fra
   −IV til +VII med Fe, Fe²⁺ og Fe³⁺, en orange pil mod hoejre og en blaa
   mod venstre. Bogens "oxidation: oxidationstallet stiger" er blevet til
   en plads og "tallet stiger", saa hverken oxidation eller oxidationstal
   staar i figuren.
   8.3 har kun ét fagord. oxidation og reduktion fra 8.1 staar her igen.
   Tre fagord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var ORANGE = "#b4530a", BLAA = "#1d4ed8";
    var KA = { x: 130, y: 40, b: 760, h: 190 };
    var FS = 56, MY = 200, TY = 122;
    /* Molekylerne: formlen, midten og oxidationstallene over atomerne.
       atomer er [tekst foer atomet, atomet] i formlen, saa atomets midte
       kan maales */
    var MOL = [
        { f: "H_2O", cx: 290, tal: [["", "H", "+I"], ["H_2", "O", "−II"]] },
        { f: "CO_2", cx: 520, tal: [["", "C", "+IV"], ["C", "O", "−II"]] },
        { f: "SO_4^{2−}", cx: 755, tal: [["", "S", "+VI"], ["S", "O", "−II"]] }
    ];
    var KB = { x: 40, y: 272, b: 1020, h: 270 };
    var AY = 425, V0 = -4, V1 = 7, SX0 = 100, SX1 = 1000;
    function SX(v) { return SX0 + (SX1 - SX0) * (v - V0) / (V1 - V0); }
    var ROM = { "-4": "−IV", "-3": "−III", "-2": "−II", "-1": "−I", "0": "0", "1": "+I", "2": "+II", "3": "+III", "4": "+IV", "5": "+V", "6": "+VI", "7": "+VII" };

    /* Bredden af en formel med saenkede og haevede tal (som SV.formelInd) */
    function W(s) {
        var re = /([_^])(\{[^}]*\}|[0-9+−\-]+)/g, b = 0, sidst = 0, m;
        while ((m = re.exec(s)) !== null) {
            b += NK.tekstBredde(s.slice(sidst, m.index), FS, 700);
            b += 0.68 * NK.tekstBredde(m[2].replace(/[{}]/g, ""), FS, 700);
            sidst = re.lastIndex;
        }
        return b + NK.tekstBredde(s.slice(sidst), FS, 700);
    }
    var POS = null;              /* atomernes midte, regnes ud, naar skriften kan maales */
    function pos() {
        if (POS) return POS;
        POS = MOL.map(function (m) {
            var v = m.cx - W(m.f) / 2;
            var xs = m.tal.map(function (t) { return v + W(t[0]) + NK.tekstBredde(t[1], FS, 700) / 2; });
            /* Tallene maa ikke staa klistret sammen (+IV −II over CO₂) */
            var mangler = 70 - (xs[1] - xs[0]);
            if (mangler > 0) { xs[0] -= mangler / 2; xs[1] += mangler / 2; }
            return xs;
        });
        return POS;
    }

    var OP = { y: 336, tx: 655 }, NED = { y: 494, tx: 395 };      /* pilene og teksterne */

    NK.FIGURER.oxidationstal = {
        vb: [1100, 560],
        lag: [
            { navn: "Tallene og pilene", pladser: ["oxidationstal", "oxidation", "reduktion"],
              ros: "Oxidationstallet skrives med romertal over atomet. Ved en oxidation stiger det, og ved en reduktion falder det." }
        ],
        pladser: [
            { id: "oxidationstal", ord: ["oxidationstal"], x: 994, y: TY - 6, maal: [0, 0], dele: ["tal"],
              omr: [], fejl: { oxidation: "<b>oxidation</b> er at afgive elektroner. Pladsen peger på tallene med romertal over atomerne.",
                               reduktion: "<b>reduktion</b> er at optage elektroner. Pladsen peger på tallene med romertal over atomerne." } },
            { id: "oxidation", ord: ["oxidation"], x: 0, y: OP.y - 26, maal: [0, OP.y - 26], titel: true, dele: ["op"],
              omr: [{ r: [SX(-1) - 10, OP.y - 50, SX(6) - SX(-1) + 22, 64, 10] }],
              fejl: { reduktion: "<b>reduktion</b> er at optage elektroner, så tallet falder. Den orange pil viser, at tallet stiger.",
                      oxidationstal: "<b>oxidationstal</b> er tallene på skalaen. Pladsen er navnet på det, der sker, når tallet stiger." } },
            { id: "reduktion", ord: ["reduktion"], x: 0, y: NED.y + 26, maal: [0, NED.y + 26], titel: true, dele: ["ned"],
              omr: [{ r: [SX(-4) - 12, NED.y - 14, SX(3) - SX(-4) + 22, 64, 10] }],
              fejl: { oxidation: "<b>oxidation</b> er at afgive elektroner, så tallet stiger. Den blå pil viser, at tallet falder.",
                      oxidationstal: "<b>oxidationstal</b> er tallene på skalaen. Pladsen er navnet på det, der sker, når tallet falder." } }
        ],

        tegn: function (api) {
            var P = pos(), self = this;
            var B = 120;
            this.pladser.forEach(function (p) { B = Math.max(B, NK.tekstBredde(p.ord[0], 18, 700) + 28); });
            /* Pladserne ved pilene staar foran teksten, som "oxidation:" i bogen */
            this.pladser.forEach(function (p) {
                if (p.id === "oxidation") { p.x = OP.tx - 14 - B / 2; p.maal[0] = p.x; }
                if (p.id === "reduktion") { p.x = NED.tx - 14 - B / 2; p.maal[0] = p.x; }
                if (p.id === "oxidationstal") {
                    p.omr = P.map(function (xs) { return { r: [xs[0] - 30, TY - 24, xs[1] - xs[0] + 60, 32, 8] }; });
                    p.maal = [P[2][1] + 34, TY - 9];
                }
            });

            /* ----- Molekylerne og tallene ---------------------------------------- */
            api.del("molekyler", {
                lag: 0, auto: true,
                fuld: function (g) {
                    LAB.kort(g, KA.x, KA.y, KA.b, KA.h);
                    MOL.forEach(function (m) { SV.tekst(g, m.cx, MY, m.f, { "font-size": FS, "font-weight": 700 }); });
                }
            });

            api.del("tal", {
                lag: 0,
                fuld: function (g) {
                    var t = [];
                    MOL.forEach(function (m, i) {
                        m.tal.forEach(function (a, j) { t.push(SV.tekst(g, P[i][j], TY, a[2], { "font-size": 26, "font-weight": 700, fill: F.teal })); });
                    });
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (el, i) { an.pop(el, 70 * i, 400); }); }
            });

            /* ----- Skalaen og pilene ------------------------------------------------- */
            api.del("skala", {
                lag: 0, auto: true,
                fuld: function (g) {
                    LAB.kort(g, KB.x, KB.y, KB.b, KB.h);
                    SV.el("line", { x1: SX0 - 22, y1: AY, x2: SX1 + 22, y2: AY, stroke: "#4b5560", "stroke-width": 2 }, g);
                    for (var v = V0; v <= V1; v++) {
                        SV.el("line", { x1: SX(v), y1: AY - 8, x2: SX(v), y2: AY + 8, stroke: "#4b5560", "stroke-width": 2 }, g);
                        SV.tekst(g, SX(v), AY + 32, ROM[v], { "font-size": 18, fill: v === 0 ? F.tekst : F.svag, "font-weight": v === 0 ? 700 : 400 });
                    }
                    [[0, "Fe"], [2, "Fe^{2+}"], [3, "Fe^{3+}"]].forEach(function (f) {
                        SV.el("circle", { cx: SX(f[0]), cy: AY, r: 7, fill: F.teal, stroke: "#ffffff", "stroke-width": 2 }, g);
                        SV.tekst(g, SX(f[0]), AY - 18, f[1], { "font-size": 19, "font-weight": 700, fill: F.teal });
                    });
                }
            });

            api.del("op", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    LAB.pil(gg, SX(-1), SX(6), OP.y, { farve: ORANGE, bredde: 3 });
                    SV.tekst(gg, OP.tx, OP.y - 19, "tallet stiger", { "font-size": 19, "font-weight": 700, fill: ORANGE, "text-anchor": "start" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.glid(r.g, -30, 0, 0, 600); }
            });

            api.del("ned", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    LAB.pil(gg, SX(3), SX(-4), NED.y, { farve: BLAA, bredde: 3 });
                    SV.tekst(gg, NED.tx, NED.y + 33, "tallet falder", { "font-size": 19, "font-weight": 700, fill: BLAA, "text-anchor": "start" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.glid(r.g, 30, 0, 0, 600); }
            });
        }
    };
}());

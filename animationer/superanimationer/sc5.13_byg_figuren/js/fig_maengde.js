/* =====================================================================
   fig_maengde.js - figuren til 5.5 Mængdeberegning

   Som bogens figur skema-vej: reaktionsskemaet for magnesium, der
   brænder, og under det tabellen med rækkerne m, M og n og vejen med
   tre pile: ned (n = m/M med brøkstreg), på tværs (forholdet 2 : 2) og
   op (m = n · M). Under tabellen forklarer to små rammer, hvad den
   stiplede og den hele ramme betyder. Stofmængde er fra 5.3 og sættes
   på igen ved rækken n.
   Vejeanalysen er taget ud 1. nov. 2026 (brugeren: "Synes vi skal tage
   vejeanalyse ud (gør bare bedre plads til mængdeberegningsskemaet.)"),
   og tabellen har fået pladsen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var BAAND = { x: 30, y: 24, b: 940, h: 60 };
    var KOL = { mg: 300, o2: 560, mgo: 820 };
    var TB = { x: 30, y: 130, b: 940, h: 300 };          /* tabellen */
    var RY = { m: 196, M: 284, n: 372 };                 /* rækkernes midte */
    var LX = 90;                                         /* rækkernes navne */
    var ORANGE = "#c0560f";
    var PX1 = 420, PX2 = 700;                            /* pilen ned og pilen op */
    var SLOT_Y = 492;                                    /* pladserne under tabellen */

    function vaerdiFelt(x, y) { return { r: [x - 70, y - 20, 140, 38, 8] }; }

    NK.FIGURER.maengde = {
        vb: [1000, 540],
        lag: [
            { navn: "Fra gram til gram", pladser: ["mængdeberegningsskema", "stofmængde", "mængdeberegning"],
              ros: "Vejen fra gram til gram går over stofmængden: ned med n = m/M, på tværs med forholdet og op med m = n · M." }
        ],
        pladser: [
            { id: "mængdeberegningsskema", ord: ["mængdeberegningsskema"], x: KOL.o2, y: TB.y, maal: [KOL.o2, TB.y], titel: true, dele: ["tabel"],
              omr: [{ r: [TB.x - 5, TB.y - 5, TB.b + 10, TB.h + 10, 16], tom: true }],
              fejl: { "mængdeberegning": "<b>mængdeberegning</b> er selve udregningen fra gram til gram. Overskriften spørger om navnet på tabellen.",
                      "stofmængde": "<b>stofmængde</b> er kun én af de tre rækker. Overskriften gælder hele tabellen." } },
            { id: "stofmængde", ord: ["stofmængde"], x: 178, y: SLOT_Y, maal: [LX, RY.n + 24], dele: ["nrk"],
              omr: [{ r: [LX - 20, RY.n - 22, 40, 44, 8] }, vaerdiFelt(KOL.mg, RY.n), vaerdiFelt(KOL.mgo, RY.n)],
              fejl: { "mængdeberegningsskema": "<b>mængdeberegningsskema</b> er hele tabellen. Pladsen peger kun på rækken n med tal i mol.",
                      "mængdeberegning": "<b>mængdeberegning</b> er hele udregningen. Pladsen peger kun på rækken n med tal i mol." } },
            { id: "mængdeberegning", ord: ["mængdeberegning"], x: 600, y: SLOT_Y, maal: [KOL.o2, RY.n + 22], dele: ["vej"],
              omr: [{ r: [PX1 - 12, RY.m - 14, 24, RY.n - RY.m + 28, 6] }, { r: [PX1 - 12, RY.n - 18, PX2 - PX1 + 24, 36, 8] }, { r: [PX2 - 12, RY.m - 14, 24, RY.n - RY.m + 28, 6] }],
              fejl: { "mængdeberegningsskema": "<b>mængdeberegningsskema</b> er tabellen. Pladsen peger på pilene fra 2,43 g magnesium til 4,03 g magnesiumoxid.",
                      "stofmængde": "<b>stofmængde</b> er rækken med mol. Pladsen peger på hele vejen med pilene fra gram til gram." } }
        ],

        tegn: function (api) {
            /* ----- Reaktionsskemaet står der fra start ------------------------- */
            api.del("baand", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: BAAND.x, y: BAAND.y, width: BAAND.b, height: BAAND.h, rx: 12, fill: "#e3f1ee" }, g);
                    var a = { "font-size": 23, "font-weight": 700 }, y = BAAND.y + 38;
                    SV.tekst(g, KOL.mg, y, "2 Mg(s)", a);
                    SV.tekst(g, (KOL.mg + KOL.o2) / 2, y, "+", a);
                    SV.tekst(g, KOL.o2, y, "O_2(g)", a);
                    SV.tekst(g, (KOL.o2 + KOL.mgo) / 2, y, "→", a);
                    SV.tekst(g, KOL.mgo, y, "2 MgO(s)", a);
                    /* Hvad rammerne om tallene betyder, som i bogen */
                    var ly = TB.y + TB.h + 30, lx = 660;
                    SV.el("rect", { x: lx, y: ly - 11, width: 22, height: 16, rx: 4, fill: "#ffffff", stroke: "#3fae72", "stroke-width": 1.6, "stroke-dasharray": "4 3" }, g);
                    SV.tekst(g, lx + 30, ly + 2, "det kendte tal", { "font-size": 14, fill: F.svag, "text-anchor": "start" });
                    SV.el("rect", { x: lx + 140, y: ly - 11, width: 22, height: 16, rx: 4, fill: "#ffffff", stroke: F.teal, "stroke-width": 1.8 }, g);
                    SV.tekst(g, lx + 170, ly + 2, "det, der skal findes", { "font-size": 14, fill: F.svag, "text-anchor": "start" });
                }
            });

            /* ----- Tabellen med m og M --------------------------------------------- */
            api.del("tabel", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, TB.x, TB.y, TB.b, TB.h, { fyld: "#fbfcfd", kant: "#a9c9c2" });
                    [(RY.m + RY.M) / 2, (RY.M + RY.n) / 2].forEach(function (y) {
                        SV.el("line", { x1: TB.x + 12, y1: y, x2: TB.x + TB.b - 12, y2: y, stroke: "#dde3e8", "stroke-width": 1.4 }, g);
                    });
                    var s = { "font-size": 25, "font-weight": 700, "font-style": "italic" };
                    SV.tekst(g, LX, RY.m + 9, "m", s);
                    SV.tekst(g, LX, RY.M + 9, "M", s);
                    var v = { "font-size": 21 };
                    SV.el("rect", { x: KOL.mg - 62, y: RY.m - 21, width: 124, height: 42, rx: 9, fill: "#ffffff", stroke: "#3fae72", "stroke-width": 1.8, "stroke-dasharray": "6 4" }, g);
                    SV.tekst(g, KOL.mg, RY.m + 7, "2,43 g", v);
                    SV.el("rect", { x: KOL.mgo - 62, y: RY.m - 21, width: 124, height: 42, rx: 9, fill: "#ffffff", stroke: F.teal, "stroke-width": 2 }, g);
                    SV.tekst(g, KOL.mgo, RY.m + 7, "4,03 g", v);
                    SV.tekst(g, KOL.mg, RY.M + 7, "24,31 g/mol", v);
                    SV.tekst(g, KOL.mgo, RY.M + 7, "40,31 g/mol", v);
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("nrk", {
                lag: 0,
                fuld: function (g) {
                    var t = [SV.tekst(g, LX, RY.n + 9, "n", { "font-size": 25, "font-weight": 700, "font-style": "italic", fill: F.teal }),
                        SV.tekst(g, KOL.mg, RY.n + 7, "0,100 mol", { "font-size": 21, "font-weight": 700 }),
                        SV.tekst(g, KOL.mgo, RY.n + 7, "0,100 mol", { "font-size": 21, "font-weight": 700 })];
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 150, 450); }); }
            });

            /* ----- Vejen: ned, på tværs og op ------------------------------------- */
            api.del("vej", {
                lag: 0,
                fuld: function (g) {
                    var p1 = LAB.pil(g, PX1, RY.m - 8, PX1, RY.n - 6, { farve: ORANGE });
                    var p2 = SV.g(g);
                    SV.el("line", { x1: PX1, y1: RY.n, x2: KOL.o2 - 84, y2: RY.n, stroke: ORANGE, "stroke-width": 2.6, "stroke-linecap": "round" }, p2);
                    LAB.pil(p2, KOL.o2 + 100, RY.n, PX2 + 1, RY.n, { farve: ORANGE });
                    var p3 = LAB.pil(g, PX2, RY.n, PX2, RY.m - 8, { farve: ORANGE });
                    var l = SV.g(g), a = { "font-size": 18, "text-anchor": "start" };
                    /* 1: n = m/M med rigtig brøkstreg */
                    LAB.nr(l, PX1 + 28, RY.M, 1, 13);
                    var x = PX1 + 50;
                    SV.tekst(l, x, RY.M + 6, "n =", a);
                    var bx = x + NK.tekstBredde("n = ", 18, 400) + 12;
                    SV.tekst(l, bx, RY.M - 6, "m", { "font-size": 18 });
                    SV.el("line", { x1: bx - 11, y1: RY.M, x2: bx + 11, y2: RY.M, stroke: F.tekst, "stroke-width": 1.4 }, l);
                    SV.tekst(l, bx, RY.M + 19, "M", { "font-size": 18 });
                    /* 2: forholdet */
                    LAB.nr(l, KOL.o2 - 64, RY.n, 2, 13);
                    SV.tekst(l, KOL.o2 - 44, RY.n + 6, "forholdet 2 : 2", a);
                    /* 3: m = n · M */
                    LAB.nr(l, PX2 - 28, RY.M, 3, 13);
                    SV.tekst(l, PX2 - 50, RY.M + 6, "m = n · M", { "font-size": 18, "text-anchor": "end" });
                    return { p: [p1, p2, p3], l: l };
                },
                byg: function (g, r, an) { r.p.forEach(function (p, i) { an.pop(p, i * 250, 450); }); an.fade(r.l, 700, 450); }
            });
        }
    };
}());

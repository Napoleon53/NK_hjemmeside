/* =====================================================================
   fig_standard.js - figuren til B5.3 Standardkurven (B5.4 til 10. nov. 2026)

   Øverst bogens standardraekke: blindproeven og de fem standardopløsninger
   af E129 i et kuvettestativ og proeven i sit eget stativ, med
   koncentrationen og den maalte absorbans under hver (STANDARDER i
   lav_figurer.py). Titlerne "Blindprøve" og "Standard 1" til "Standard 5"
   er taget af (de er pladserne). Til venstre en maalekolbe med
   stamopløsningen paa 100 µM, som standarderne laves af (bogens eksempel;
   kolben staar ikke i bogens figur). Standardopløsning peger paa en klamme
   over de fem kuvetter. Blindprøve er gentaget fra B5.2 (NK.GENTAGET).
   Nederst bogens standardkurve (uden ligningen) og lineaert-omraade:
   standardkurve er titlen paa kortet med grafen, og lineært område peger
   paa den lyse flade op til 40 µM. Teksterne "det lineære område /
   punkterne ligger på linjen" og "Lambert-Beers lov" er taget af.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    /* Bogens maalinger fra 10. nov. 2026 med b-led: y = 0,0260x + 0,012 (STANDARDER og B5M_PROEVE i lav_figurer.py) */
    var STANDARDER = [[5.0, 0.143], [10.0, 0.271], [15.0, 0.402], [20.0, 0.531], [25.0, 0.663]];
    var B = 0.012, PROEVE = 0.350;
    function dk(v, d) { return v.toFixed(d).replace(".", ","); }

    /* ----- Lag 1: opløsningerne -------------------------------------------- */
    var RA = { x: 20, y: 18, b: 1060, h: 270 };
    var KO = { cx: 140, bund: 228 };                           /* kolben med stamopløsningen */
    var BX = 390, SX = [490, 580, 670, 760, 850], PX = 986;
    var KB = 40, KH = 100, KBUND = 214, STOP = KBUND - 24;
    var KLAMME = 102;

    /* ----- Lag 2: graferne --------------------------------------------------- */
    var RB = { x: 20, y: 310, b: 520, h: 300 };
    var GA = { xa: 92, xb: 500, ya: 360, yb: 548 };
    function AX(c) { return GA.xa + (GA.xb - GA.xa) * c / 30; }
    function AY(a) { return GA.yb - (GA.yb - GA.ya) * a / 0.8; }
    var RC = { x: 560, y: 310, b: 520, h: 300 };
    var GB = { xa: 632, xb: 1040, ya: 360, yb: 548 };
    function BXc(c) { return GB.xa + (GB.xb - GB.xa) * c / 100; }
    function BY(a) { return GB.yb - (GB.yb - GB.ya) * a / 2.5; }
    function maalt(c) { return 0.026 * c - (c > 40 ? 0.00016 * (c - 40) * (c - 40) : 0); }

    NK.FIGURER.standard = {
        vb: [1100, 628],
        lag: [
            { navn: "Opløsningerne", pladser: ["stamopløsning", "standardopløsning", "blindprøve"],
              ros: "Standardopløsningerne laves ved at fortynde stamopløsningen. Med blindprøven nulstilles apparatet." },
            { navn: "Graferne", pladser: ["standardkurve", "lineært område"],
              ros: "På standardkurven aflæses prøvens koncentration. Standardkurven kan kun bruges i det lineære område." }
        ],
        pladser: [
            { id: "stamopløsning", ord: ["stamopløsning"], x: KO.cx, y: 50, maal: [KO.cx, 86], dele: ["kolbe"],
              omr: [{ r: [KO.cx - 56, 78, 112, KO.bund - 70, 12] }],
              fejl: { "standardopløsning": "<b>standardopløsning</b> er en af kuvetterne i rækken. Pladsen peger på kolben med 100 µM, som de laves af.",
                      "blindprøve": "<b>blindprøve</b> er uden farvestof. Pladsen peger på kolben med 100 µM, som bliver fortyndet." } },
            { id: "standardopløsning", ord: ["standardopløsning"], x: SX[2], y: 50, maal: [SX[2], KLAMME - 8], dele: ["standarder"],
              omr: [{ r: [SX[0] - 30, KLAMME - 12, SX[4] - SX[0] + 60, KBUND - KLAMME + 22, 10] }],
              fejl: { "stamopløsning": "<b>stamopløsning</b> har høj koncentration og bliver fortyndet. Pladsen peger på de fem kuvetter fra 5,00 til 25,0 µM.",
                      "blindprøve": "<b>blindprøve</b> er uden farvestof. Pladsen peger på de fem kuvetter med farvestof i.",
                      "standardkurve": "<b>standardkurve</b> er en graf. Pladsen peger på de fem kuvetter med kendt koncentration." } },
            { id: "blindprøve", ord: ["blindprøve"], x: BX, y: 50, maal: [BX, KLAMME - 6], dele: ["blind"],
              omr: [{ r: [BX - 28, KLAMME - 10, 56, KBUND - KLAMME + 20, 10] }],
              fejl: { "standardopløsning": "<b>standardopløsning</b> har farvestof i. Pladsen peger på kuvetten med 0 µM, som apparatet nulstilles med.",
                      "stamopløsning": "<b>stamopløsning</b> har høj koncentration. Pladsen peger på kuvetten med 0 µM, som apparatet nulstilles med." } },

            { id: "standardkurve", ord: ["standardkurve"], x: RB.x + RB.b / 2, y: RB.y, maal: [RB.x + RB.b / 2, RB.y], titel: true, dele: ["kurve"],
              omr: [{ r: [RB.x - 4, RB.y - 4, RB.b + 8, RB.h + 8, 18], tom: true }],
              fejl: { "lineært område": "<b>lineært område</b> er en del af en graf. Overskriften gælder hele grafen med standardernes punkter.",
                      "standardopløsning": "<b>standardopløsning</b> er en af kuvetterne. Overskriften gælder grafen med deres punkter." } },
            { id: "lineært område", ord: ["lineært område"], x: 815, y: 380, maal: [BXc(22), BY(1.55)], dele: ["omraade"],
              omr: [{ r: [GB.xa + 1, GB.ya - 8, BXc(40) - GB.xa - 1, GB.yb - GB.ya + 8, 4] }],
              fejl: { "standardkurve": "<b>standardkurve</b> er hele grafen til venstre. Pladsen peger på den del, hvor punkterne ligger på den rette linje." } }
        ],

        tegn: function (api) {
            B5.defs();

            /* ----- Lag 1 -------------------------------------------------------- */
            api.del("kolbe", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    B5.maalekolbe(g, KO.cx, KO.bund, { farve: B5.fortyndet(B5.F.roed, 1), hoejde: 128, R: 44 });
                    KV.tekst(g, KO.cx, KO.bund + 26, "100 µM", { fs: 15, fed: true });
                    KV.tekst(g, KO.cx, KO.bund + 45, "fortyndes med vand", { fs: 13.5, farve: F.daempet });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            var st1 = B5.stativ(BX - 38, SX[4] + 38, STOP, [BX].concat(SX), KB);
            var st2 = B5.stativ(PX - 38, PX + 38, STOP, [PX], KB);
            function under(g, cx, c, a, proeve) {
                KV.tekst(g, cx, 248, c, { fs: 14.5, fed: !!proeve, farve: proeve ? F.serieB : F.blaek });
                KV.tekst(g, cx, 269, "A = " + a, { fs: 14, fed: true, farve: F.accent });
            }

            api.del("blind", {
                lag: 0,
                fuld: function (g) {
                    st1.over(g);
                    B5.kuvette(g, BX, KBUND, KB, KH, { farve: B5.fortyndet(B5.F.roed, 0), niveau: 0.8 });
                    under(g, BX, "0 µM", "0,000");
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("standarder", {
                lag: 0,
                fuld: function (g) {
                    SX.forEach(function (cx, k) {
                        B5.kuvette(g, cx, KBUND, KB, KH, { farve: B5.fortyndet(B5.F.roed, 0.16 * (k + 1)), niveau: 0.8 });
                        under(g, cx, dk(STANDARDER[k][0], STANDARDER[k][0] < 10 ? 2 : 1) + " µM", dk(STANDARDER[k][1], 3));
                    });
                    st1.foran(g);
                    /* Klammen over de fem */
                    var k0 = SX[0] - 22, k1 = SX[4] + 22;
                    SV.el("path", { d: "M" + k0 + "," + (KLAMME + 8) + " V" + KLAMME + " H" + k1 + " V" + (KLAMME + 8) + " M" + SX[2] + "," + KLAMME + " V" + (KLAMME - 8),
                        fill: "none", stroke: F.daempet, "stroke-width": 1.6, "stroke-linejoin": "round" }, g);
                    /* Proeven i sit eget stativ */
                    KV.tekst(g, PX, 54, "prøven", { fs: 16, fed: true });
                    st2.over(g);
                    B5.kuvette(g, PX, KBUND, KB, KH, { farve: B5.fortyndet(B5.F.roed, 0.42), niveau: 0.8 });
                    st2.foran(g);
                    under(g, PX, "ukendt", "0,350", true);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            /* ----- Lag 2: standardkurven ------------------------------------------ */
            api.del("kurve", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    var D = KV.diagram(g, { xa: GA.xa, xb: GA.xb, ya: GA.ya, yb: GA.yb, xmax: 30, ymax: 0.8, xtrin: 5, ytrin: 0.2, xtitel: "koncentration i µM", ytitel: "absorbans", yafst: 46 });
                    KV.kurve(g, [[AX(0), AY(B)], [AX(29), AY(0.026 * 29 + B)]], F.accent, 2.4);
                    KV.kurve(g, [[AX(0), AY(PROEVE)], [AX(13), AY(PROEVE)]], F.serieB, 2, { streg: "6 4", skygge: false });
                    KV.pil(g, AX(13), AY(PROEVE) + 7, AX(13), AY(0) - 1, F.serieB, 2, 11);
                    var pk = SV.g(g);
                    STANDARDER.forEach(function (s) { KV.punkt(pk, AX(s[0]), AY(s[1]), "a"); });
                    KV.punkt(pk, AX(13), AY(PROEVE), "b", 5);
                    KV.tekst(g, AX(0.6), AY(PROEVE) - 10, "prøven: A = 0,350", { fs: 14.5, fed: true, anker: "start", farve: F.serieB, halo: "#f4f8f7" });
                    KV.tekst(g, AX(13) + 10, AY(0.07), "c = 13,0 µM", { fs: 14.5, fed: true, anker: "start", farve: F.serieB, halo: "#f4f8f7" });
                    return { pk: pk, D: D };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.pk, 200, 500); }
            });

            api.del("omraade", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    var D = KV.diagram(g, { xa: GB.xa, xb: GB.xb, ya: GB.ya, yb: GB.yb, xmax: 100, ymax: 2.5, xtrin: 20, ytrin: 0.5, xtitel: "koncentration i µM", ytitel: "absorbans", yafst: 46 });
                    SV.el("rect", { x: GB.xa + 0.7, y: GB.ya - 8, width: BXc(40) - GB.xa - 0.7, height: GB.yb - GB.ya + 8 - 0.7, fill: F.accent, opacity: 0.1 }, g);
                    KV.linje(g, BXc(40), GB.ya - 8, BXc(40), GB.yb, F.accent, 1, "3 4");
                    KV.kurve(g, [[BXc(0), BY(0)], [BXc(96), BY(0.026 * 96)]], F.accent, 2, { streg: "6 5", skygge: false });
                    var pkt = [];
                    for (var c = 0; c <= 100; c++) pkt.push([BXc(c), BY(maalt(c))]);
                    KV.kurve(g, pkt, F.blaek, 2.4);
                    var pk = SV.g(g);
                    [10, 20, 30, 40, 60, 80, 100].forEach(function (c) { KV.punkt(pk, BXc(c), BY(maalt(c)), c <= 40 ? "a" : "b"); });
                    KV.tekst(g, BXc(75), BY(0.95), "for høj koncentration", { fs: 15, fed: true, farve: F.serieB });
                    KV.tekst(g, BXc(75), BY(0.95) + 19, "punkterne ligger under linjen", { fs: 13.5, farve: F.daempet });
                    return { pk: pk, D: D };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.pk, 200, 500); }
            });
        }
    };
}());

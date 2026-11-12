/* =====================================================================
   fig_maaling.js - figuren til B8.7 Hvor meget virksomt stof?

   Afsnittet har kun to fagord, saa figuren har ogsaa tre ord fra
   tidligere kapitler, som er vaerd at traene igen (brugeren 1. nov. 2026):
   forsæbning (B4.5), absorbans (B5.2) og standardkurve (B5.4).
   Foroven bogens b8-maalekaede i tre kort: acetylsalicylsyre med den
   orange estergruppe, salicylat med den groenne OH-gruppe og komplekset
   med jern(III), forbundet af to pile (NaOH og Fe³⁺) og 1 : 1 : 1 under.
   forsæbning peger paa den foerste pil, salicylat og kompleks er titler
   paa kort 2 og 3. Bogens ord "forsæbning" under pilen er taget af.
   Forneden bogens b8-standardkurve med proeven (A = 0,640 giver
   c = 0,800 mM). standardkurve er titlen paa kortet, og absorbans er den
   lodrette akse. Bogens aksetitel "koncentration af salicylat i mM" er
   blevet til "koncentration i mM", saa den ikke afsloerer salicylat.
   To fagord og tre ord fra B4 og B5 i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KV = NK.KV;
    var B8 = NK.B8;
    var F = ORG.F;
    var C = B8.F;

    var ORANGE = "#c2620f", GROEN = B8.F.ester, BLAA = "#1d4ed8", LILLA = "#7b3fb8";

    /* ----- Lag 1: maalekaeden -------------------------------------------- */
    var KY = 24, KH = 270;
    var K = [{ x: 16, b: 250 }, { x: 455, b: 250 }, { x: 894, b: 250 }];
    K.forEach(function (k) { k.cx = k.x + k.b / 2; k.y = KY; k.h = KH; });
    var Lm = 30;
    var ASA = B8.asa(K[0].cx - 12, 178, { L: Lm, ester: ORANGE });
    var SAL = B8.salicyl(K[1].cx - 16, 184, { L: Lm, ion: true, oh: GROEN, syre: BLAA });
    /* Komplekset: begge O⁻ peger op mod jern(III)ionen */
    var KOM = new B8.Mol(K[2].cx - 20, 196, Lm);
    KOM.ud("O1", 0, Lm, -90, "O^−", { anker: "start", farve: BLAA }, 1, 0, BLAA)
       .ud("Cs", 1, Lm, -30, null, null, 1, 0, BLAA)
       .ud("Om", "Cs", Lm, -90, "O^−", { anker: "start", farve: BLAA }, 1, 0, BLAA)
       .ud("Os", "Cs", Lm, 30, "O", { farve: BLAA }, 2, 0, BLAA);
    var O1 = KOM.p("O1"), OM = KOM.p("Om");
    var FE = [(O1[0] + OM[0]) / 2 + 4, O1[1] - 46];
    var PIL = [{ x1: K[0].x + K[0].b + 14, x2: K[1].x - 14, y: 150, over: "NaOH" },
               { x1: K[1].x + K[1].b + 14, x2: K[2].x - 14, y: 150, over: "Fe³⁺", under: "farvereaktion" }];

    /* ----- Lag 2: standardkurven ----------------------------------------- */
    var KS = { x: 16, y: 352, b: 1128, h: 286 };
    var G = { xa: 152, xb: 1060, ya: 430, yb: 584, xmax: 1.2, ymax: 1.0, xtrin: 0.2, ytrin: 0.2, xdec: 1, ydec: 1 };
    function GX(c) { return G.xa + (G.xb - G.xa) * c / G.xmax; }
    function GY(a) { return G.yb - (G.yb - G.ya) * a / G.ymax; }

    function titel(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.cx, y: k.y, maal: [k.cx, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 4, k.y - 4, k.b + 8, k.h + 8, 18], tom: true }], fejl: fejl };
    }
    function farvelabel(g, x, y, farve, tekst) {
        SV.el("circle", { cx: x - 30, cy: y - 5, r: 8, fill: farve, stroke: "#8f9aa3", "stroke-width": 1.2 }, g);
        ORG.t(g, x - 16, y, tekst, { fs: 14, farve: F.daempet, anker: "start" });
    }

    NK.FIGURER.maaling = {
        vb: [1160, 656],
        lag: [
            { navn: "Fra farveløs til lilla", pladser: ["forsæbning", "salicylat", "kompleks"],
              ros: "Forsæbningen giver salicylat med en fri OH-gruppe. Med Fe³⁺ dannes et lilla kompleks, som kan måles." },
            { navn: "Standardkurven", pladser: ["standardkurve", "absorbans"],
              ros: "Komplekset har en absorbans, som står på den lodrette akse. Standardkurven giver koncentrationen i prøven." }
        ],
        pladser: [
            { id: "forsæbning", ord: ["forsæbning"], x: (PIL[0].x1 + PIL[0].x2) / 2, y: 214, maal: [(PIL[0].x1 + PIL[0].x2) / 2, PIL[0].y + 10], dele: ["pil"],
              omr: [{ r: [PIL[0].x1 - 6, PIL[0].y - 12, PIL[0].x2 - PIL[0].x1 + 12, 24, 8] }],
              fejl: { kompleks: "<b>kompleks</b> er et stof med en metalion. Pladsen peger på pilen, hvor NaOH spalter estergruppen.",
                      salicylat: "<b>salicylat</b> er ionen, der dannes. Pladsen peger på pilen, hvor NaOH spalter estergruppen." } },
            titel("salicylat", K[1], ["salicylat"], {
                kompleks: "<b>kompleks</b> har en metalion bundet. Kortet viser ionen, før Fe³⁺ er tilsat.",
                "forsæbning": "<b>forsæbning</b> er reaktionen på pilen. Kortet viser ionen, der dannes, med en fri OH-gruppe." }),
            titel("kompleks", K[2], ["kompleks"], {
                salicylat: "<b>salicylat</b> er ionen uden jern. Kortet viser ionen bundet til Fe³⁺, og stoffet er lilla.",
                "forsæbning": "<b>forsæbning</b> er en reaktion. Kortet viser det lilla stof, hvor Fe³⁺ er bundet til to O⁻." }),

            { id: "standardkurve", ord: ["standardkurve"], x: KS.x + KS.b / 2, y: KS.y, maal: [KS.x + KS.b / 2, KS.y], titel: true, dele: ["ramme"],
              omr: [{ r: [KS.x - 4, KS.y - 4, KS.b + 8, KS.h + 8, 18], tom: true }],
              fejl: { absorbans: "<b>absorbans</b> er størrelsen på den lodrette akse. Overskriften gælder hele grafen med punkterne og linjen.",
                      kompleks: "<b>kompleks</b> er det lilla stof. Overskriften gælder hele grafen med punkterne og linjen." } },
            { id: "absorbans", ord: ["absorbans"], x: 262, y: 400, maal: [G.xa, G.ya + 8], dele: ["akse"],
              omr: [{ linje: [[G.xa, G.ya - 6], [G.xa, G.yb]], b: 18 }],
              fejl: { standardkurve: "<b>standardkurve</b> er hele grafen. Pladsen peger kun på den lodrette akse.",
                      kompleks: "<b>kompleks</b> er det lilla stof. Pladsen peger på den lodrette akse, hvor en størrelse uden enhed står." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    K.forEach(function (k) { ORG.kortB(g, k.x, k.y, k.b, k.h); });
                    ORG.t(g, K[0].cx, K[0].y + 34, "Acetylsalicylsyre", { fs: 16, fed: true, farve: F.accent });
                    B8.tegnMol(g, ASA, { fs: 18 });
                    farvelabel(g, K[0].cx, K[0].y + K[0].h - 20, "#ffffff", "farveløs");
                    farvelabel(g, K[1].cx, K[1].y + K[1].h - 20, "#ffffff", "farveløs");
                    PIL.forEach(function (p) {
                        ORG.reaktionspil(g, p.x1, p.x2, p.y);
                        ORG.t(g, (p.x1 + p.x2) / 2, p.y - 12, p.over, { fs: 15, fed: true });
                        if (p.under) ORG.t(g, (p.x1 + p.x2) / 2, p.y + 24, p.under, { fs: 13, farve: F.daempet });
                    });
                    ORG.t(g, K[0].cx, KY + KH + 28, "1", { fs: 22, fed: true, farve: F.accent });
                    ORG.t(g, (K[0].cx + K[1].cx) / 2, KY + KH + 28, ":", { fs: 22, fed: true, farve: F.accent });
                    ORG.t(g, K[1].cx, KY + KH + 28, "1", { fs: 22, fed: true, farve: F.accent });
                    ORG.t(g, (K[1].cx + K[2].cx) / 2, KY + KH + 28, ":", { fs: 22, fed: true, farve: F.accent });
                    ORG.t(g, K[2].cx, KY + KH + 28, "1", { fs: 22, fed: true, farve: F.accent });
                }
            });
            api.del("pil", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: PIL[0].x1 - 4, y: PIL[0].y - 9, width: PIL[0].x2 - PIL[0].x1 + 8, height: 18, rx: 6, fill: "rgba(194,98,15,0.12)", stroke: ORANGE, "stroke-width": 1.6 }, g) };
                },
                byg: function (g, r, an) { an.pop(r.r, 0, 450); }
            });
            api.del("salicylat", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); B8.tegnMol(gg, SAL, { fs: 18 }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("kompleks", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("circle", { cx: FE[0], cy: FE[1], r: 46, fill: "url(#b8-lillagloed)" }, gg);
                    [O1, OM].forEach(function (o) {
                        SV.el("line", { x1: FE[0], y1: FE[1] + 14, x2: o[0] + 6, y2: o[1] - 12, stroke: LILLA, "stroke-width": 2.4, "stroke-dasharray": "5 4" }, gg);
                    });
                    SV.el("circle", { cx: FE[0], cy: FE[1], r: 17, fill: "url(#b8-jern)", stroke: "#4a2a86", "stroke-width": 1.4 }, gg);
                    ORG.t(gg, FE[0], FE[1] + 5, "Fe³⁺", { fs: 13, fed: true, farve: "#ffffff" });
                    B8.tegnMol(gg, KOM, { fs: 18 });
                    farvelabel(gg, K[2].cx, K[2].y + K[2].h - 20, "#8e5cc8", "lilla");
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    KV.defs();
                    ORG.kortB(g, KS.x, KS.y, KS.b, KS.h);
                    KV.diagram(g, { xa: G.xa, xb: G.xb, ya: G.ya, yb: G.yb, xmax: G.xmax, ymax: G.ymax, xtrin: G.xtrin, ytrin: G.ytrin, xdec: 1, ydec: 1,
                        xtitel: "koncentration i mM" });
                    var linje = [[GX(0), GY(0)], [GX(1.15), GY(0.92)]];
                    KV.kurve(g, linje, LILLA, 2.6, { moerk: "#3b1d66" });
                    [0.2, 0.4, 0.6, 1.0].forEach(function (c) { KV.punkt(g, GX(c), GY(0.8 * c), "a", 6); });
                    KV.linje(g, G.xa, GY(0.64), GX(0.8), GY(0.64), ORANGE, 1.8, "6 4");
                    KV.pil(g, GX(0.8), GY(0.64) + 6, GX(0.8), G.yb - 2, ORANGE, 2, 10);
                    KV.punkt(g, GX(0.8), GY(0.64), "b", 6);
                    KV.tekst(g, G.xa + 12, GY(0.64) - 10, "prøven: A = 0,640", { fs: 14, fed: true, farve: ORANGE, anker: "start", halo: true });
                    KV.tekst(g, GX(0.8) + 10, G.yb - 16, "c = 0,800 mM", { fs: 14, fed: true, farve: ORANGE, anker: "start", halo: true });
                    KV.tekst(g, GX(0.52), G.ya + 14, "A = 0,800 mM⁻¹ · c", { fs: 15, fed: true, farve: LILLA, halo: true });
                }
            });
            api.del("ramme", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: KS.x, y: KS.y, width: KS.b, height: KS.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("akse", {
                lag: 1,
                fuld: function (g) {
                    return { l: SV.el("line", { x1: G.xa, y1: G.ya - 8, x2: G.xa, y2: G.yb, stroke: LILLA, "stroke-width": 3, "stroke-linecap": "round" }, g) };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 500); }
            });
        }
    };
}());

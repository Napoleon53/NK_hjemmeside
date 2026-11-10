/* =====================================================================
   fig_syntese.js - figuren til B8.5 Fremstilling af acetylsalicylsyre

   Foroven bogens b8-syntese: salicylsyre + ethansyreanhydrid →
   acetylsalicylsyre + ethansyre med OH og estergruppen i groent.
   ethansyreanhydrid er skiltet under stoffet, og kondensation (B4.5)
   peger paa pilen. Den acetylgruppe, der flytter over, bliver groen i
   anhydridet, naar ordet sidder.
   Forneden tre metoder i en ramme, og separation er rammens titel:
   tragten paa sugekolben (bogens b8-syntese-trin, trin 3) med
   krystallerne paa filteret (råprodukt), to bægerglas med en varm og en
   kold opløsning (b8-omkrystallisering) og bogens b8-destillation med
   svaleren og væsken i kolben for enden (destillat). Bogens tekster
   under trinene er taget af, fordi de er ordenes forklaringer.
   Syv fagord og ét ord fra B4 i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var LAB = NK.LAB;
    var B8 = NK.B8;
    var F = ORG.F;
    var f1 = B8.f1;
    var GROEN = B8.F.ester;

    /* ----- Lag 1: reaktionen -------------------------------------------- */
    var KR = { x: 16, y: 24, b: 1128, h: 216 };
    var Lr = 32;
    var SAL = B8.salicyl(150, 146, { L: Lr, oh: GROEN });
    var ANH = B8.anhydrid(336, 164, { L: Lr });
    var ASA = B8.asa(780, 150, { L: Lr, ester: GROEN });
    var ETS = B8.ethansyre(970, 164, { L: Lr });
    /* Acetylgruppen, der flytter over, er groen som i bogen */
    ANH.bi.forEach(function (b) { if (b[1] <= ANH.i("O1")) b[4] = GROEN; });
    ANH.at[ANH.i("O1")][3] = { farve: GROEN };
    var ANH_R = B8.helt(ANH, [16, 16]);
    var PIL = { x1: 500, x2: 640, y: 142 };
    var NAVN_Y = KR.y + KR.h - 18;

    /* ----- Lag 2 og 3: de tre metoder ------------------------------------ */
    var FR = { x: 16, y: 268, b: 1128, h: 384 };
    var KY = 316, KH = 320;
    var KF = { x: 32, y: KY, b: 262, h: KH };
    var KO = { x: 310, y: KY, b: 356, h: KH };
    var KD = { x: 682, y: KY, b: 446, h: KH };
    var TRAGT = { cx: KF.x + KF.b / 2, top: 434 };
    var VARM = { cx: KO.x + 92, bund: 566 }, KOLD = { cx: KO.x + 266, bund: 566 };
    var DK = { cx: 744, cy: 540, r: 40 };                     /* destillationskolben */
    var SV0 = [DK.cx + 46, 448], SV1 = [DK.cx + 282, 546];   /* svalerens akse */
    var ERL = { cx: 1052, bund: 628, h: 74 };
    var DEST = [ERL.cx - 30, ERL.bund - 26, 60, 26];

    function titel(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 4, k.y - 4, k.b + 8, k.h + 8, 18], tom: true }], fejl: fejl };
    }

    /* Vaesken i erlenmeyerkolben (samme form som LAB.erlenmeyer) */
    function erlVaeske(g, cx, bund, h, niveau, fyld) {
        var hb = h * 0.12, b = h * 0.48, skulder = bund - h * 0.62;
        var vy = bund - h * niveau, t = (bund - vy) / (bund - skulder), vb = b - (b - hb) * t;
        return SV.el("path", { d: "M" + f1(cx - vb + 1) + "," + f1(vy) + " L" + f1(cx - b + 7) + "," + f1(bund - 4) + " Q" + f1(cx - b + 2) + "," + f1(bund - 1.5) + " " + f1(cx - b + 11) + "," + f1(bund - 1.5) +
            " L" + f1(cx + b - 11) + "," + f1(bund - 1.5) + " Q" + f1(cx + b - 2) + "," + f1(bund - 1.5) + " " + f1(cx + b - 7) + "," + f1(bund - 4) + " L" + f1(cx + vb - 1) + "," + f1(vy) + " Z",
            fill: fyld }, g);
    }

    /* Varmepladen under et glas */
    function varmeplade(g, cx, y, b) {
        SV.el("ellipse", { cx: cx, cy: y + 2, rx: b * 0.45, ry: 6, fill: "#f39a3c", opacity: 0.45, filter: "url(#kv-blur-stor)" }, g);
        SV.el("rect", { x: cx - b / 2, y: y, width: b, height: 16, rx: 4, fill: "#4a525a", stroke: "#2f363c", "stroke-width": 1.2 }, g);
        SV.el("rect", { x: cx - b / 2 + 6, y: y + 1, width: b - 12, height: 3, rx: 1.5, fill: "#e2622b" }, g);
    }

    /* Destillationen: kolbe paa varmeplade, termometer, svaler paa skraa */
    function destillation(g) {
        var gg = SV.g(g), cx = DK.cx, cy = DK.cy, r = DK.r;
        varmeplade(gg, cx, cy + r + 4, 104);
        /* kolben med de to vaesker */
        SV.el("path", { d: "M" + (cx - r + 3) + "," + (cy + 6) + " A" + (r - 3) + "," + (r - 3) + " 0 0,0 " + (cx + r - 3) + "," + (cy + 6) + " Z", fill: "#e9e2f6" }, gg);
        [[-14, 22], [6, 28], [18, 16], [-4, 14]].forEach(function (b) { SV.el("circle", { cx: cx + b[0], cy: cy + b[1], r: 3, fill: "#ffffff", stroke: "#a99cc4", "stroke-width": 0.9 }, gg); });
        SV.el("path", { d: "M" + (cx - 8) + "," + (cy - r + 2) + " A" + r + "," + r + " 0 1,0 " + (cx + 8) + "," + (cy - r + 2), fill: "url(#glas)", "fill-opacity": 0.45, stroke: LAB.KANT, "stroke-width": 1.8 }, gg);
        SV.el("path", { d: "M" + (cx - 8) + "," + (cy - r + 2) + " L" + (cx - 8) + "," + 404 + " M" + (cx + 8) + "," + (cy - r + 2) + " L" + (cx + 8) + "," + 404, fill: "none", stroke: LAB.KANT, "stroke-width": 1.8 }, gg);
        SV.el("rect", { x: cx - 8, y: 404, width: 16, height: cy - r - 402, fill: "url(#glas)", "fill-opacity": 0.35 }, gg);
        SV.el("rect", { x: cx - 10, y: 392, width: 20, height: 14, rx: 3, fill: "#e9edf0", stroke: LAB.KANT, "stroke-width": 1.3 }, gg);
        /* termometeret */
        SV.el("line", { x1: cx, y1: 370, x2: cx, y2: 452, stroke: "#ffffff", "stroke-width": 6, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: cx, y1: 370, x2: cx, y2: 452, stroke: "#9aa6b1", "stroke-width": 1.2, "stroke-linecap": "round", fill: "none" }, gg);
        SV.el("line", { x1: cx, y1: 418, x2: cx, y2: 452, stroke: "#d64b3a", "stroke-width": 2.4 }, gg);
        SV.el("circle", { cx: cx, cy: 454, r: 4.5, fill: "#d64b3a" }, gg);
        /* sidearmen og svaleren */
        SV.el("line", { x1: cx + 8, y1: 438, x2: SV0[0], y2: SV0[1], stroke: "#c9d6e2", "stroke-width": 7, "stroke-linecap": "round" }, gg);
        var ax = SV1[0] - SV0[0], ay = SV1[1] - SV0[1];
        var j0 = [SV0[0] + ax * 0.12, SV0[1] + ay * 0.12], j1 = [SV0[0] + ax * 0.88, SV0[1] + ay * 0.88];
        SV.el("line", { x1: f1(j0[0]), y1: f1(j0[1]), x2: f1(j1[0]), y2: f1(j1[1]), stroke: "#7d8f99", "stroke-width": 30, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: f1(j0[0]), y1: f1(j0[1]), x2: f1(j1[0]), y2: f1(j1[1]), stroke: "#dcecf8", "stroke-width": 27, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: SV0[0], y1: SV0[1], x2: SV1[0], y2: SV1[1], stroke: "#8aa0ad", "stroke-width": 8, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: SV0[0], y1: SV0[1], x2: SV1[0], y2: SV1[1], stroke: "#f4f8fb", "stroke-width": 5, "stroke-linecap": "round" }, gg);
        /* studserne til koelevandet */
        [[0.24, -1], [0.78, 1]].forEach(function (s) {
            var p = [SV0[0] + ax * s[0], SV0[1] + ay * s[0]], n = [ay / Math.hypot(ax, ay), -ax / Math.hypot(ax, ay)];
            var q = [p[0] + n[0] * 15 * -s[1] * -1, p[1] + n[1] * 15 * -s[1] * -1];
            var e = [p[0] + n[0] * 26 * (s[1] < 0 ? 1 : -1), p[1] + n[1] * 26 * (s[1] < 0 ? 1 : -1)];
            SV.el("line", { x1: f1(q[0]), y1: f1(q[1]), x2: f1(e[0]), y2: f1(e[1]), stroke: "#7d8f99", "stroke-width": 6, "stroke-linecap": "round" }, gg);
        });
        ORG.t(gg, (SV0[0] + SV1[0]) / 2 + 22, (SV0[1] + SV1[1]) / 2 - 30, "svaler", { fs: 13, fed: true, farve: F.daempet });
        /* roeret ned i kolben */
        SV.el("line", { x1: SV1[0], y1: SV1[1], x2: ERL.cx - 4, y2: ERL.bund - ERL.h + 6, stroke: "#8aa0ad", "stroke-width": 7, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: SV1[0], y1: SV1[1], x2: ERL.cx - 4, y2: ERL.bund - ERL.h + 6, stroke: "#f4f8fb", "stroke-width": 4, "stroke-linecap": "round" }, gg);
        LAB.erlenmeyer(gg, ERL.cx, ERL.bund, ERL.h, {});
        return gg;
    }

    NK.FIGURER.syntese = {
        vb: [1160, 668],
        lag: [
            { navn: "Syntesen", pladser: ["ethansyreanhydrid", "kondensation"],
              ros: "Salicylsyre og ethansyreanhydrid giver acetylsalicylsyre. Det er en kondensation, hvor ethansyre fraspaltes." },
            { navn: "Rensningen", pladser: ["filtrering", "råprodukt", "omkrystallisering"],
              ros: "Råproduktet bliver filtreret fra og renset ved omkrystallisering, så urenhederne bliver i væsken." },
            { navn: "Destillation", pladser: ["separation", "destillation", "destillat"],
              ros: "Filtrering, omkrystallisering og destillation er tre slags separation. Destillatet er væsken fra svaleren." }
        ],
        pladser: [
            { id: "ethansyreanhydrid", ord: ["ethansyreanhydrid"], x: ANH_R[0] + ANH_R[2] / 2, y: NAVN_Y, maal: [ANH_R[0] + ANH_R[2] / 2, ANH_R[1] + ANH_R[3]], titel: true, dele: ["anhydrid"],
              omr: [{ r: [ANH_R[0], ANH_R[1], ANH_R[2], ANH_R[3], 14] }],
              fejl: { kondensation: "<b>kondensation</b> er en reaktionstype. Skiltet spørger om navnet på stoffet over skiltet.",
                      "råprodukt": "<b>råprodukt</b> er krystallerne efter filtreringen. Skiltet spørger om stoffet, der reagerer med salicylsyre." } },
            { id: "kondensation", ord: ["kondensation"], x: (PIL.x1 + PIL.x2) / 2, y: 62, maal: [(PIL.x1 + PIL.x2) / 2, PIL.y - 12], dele: ["pil"],
              omr: [{ r: [PIL.x1 - 6, PIL.y - 14, PIL.x2 - PIL.x1 + 12, 28, 8] }],
              fejl: { ethansyreanhydrid: "<b>ethansyreanhydrid</b> er et stof. Pladsen peger på pilen, hvor to molekyler sættes sammen, og ethansyre fraspaltes.",
                      omkrystallisering: "<b>omkrystallisering</b> renser et fast stof. Pladsen peger på pilen i reaktionsskemaet." } },

            titel("filtrering", KF, ["tragt"], {
                omkrystallisering: "<b>omkrystallisering</b> opløser stoffet varmt og køler det. Kortet viser en tragt, hvor væsken suges fra.",
                destillation: "<b>destillation</b> koger væsker. Kortet viser en tragt på en kolbe, hvor væsken suges fra krystallerne.",
                separation: "<b>separation</b> er det fælles navn for flere metoder. Kortet viser én bestemt metode med en tragt." }),
            { id: "råprodukt", ord: ["råprodukt"], x: TRAGT.cx, y: 376, maal: [TRAGT.cx, TRAGT.top - 8], dele: ["krystaller"],
              omr: [{ r: [TRAGT.cx - 40, TRAGT.top - 10, 80, 26, 6] }],
              fejl: { destillat: "<b>destillat</b> er en væske fra svaleren. Pladsen peger på faste krystaller på filteret.",
                      filtrering: "<b>filtrering</b> er metoden. Pladsen peger på krystallerne, der ligger tilbage på filteret." } },
            titel("omkrystallisering", KO, ["glas"], {
                filtrering: "<b>filtrering</b> bruger en tragt. Kortet viser en varm opløsning, der bliver kølet, så krystaller falder ud.",
                destillation: "<b>destillation</b> fordamper en væske. Kortet viser en varm opløsning, der bliver kølet, så krystaller falder ud.",
                separation: "<b>separation</b> er det fælles navn for flere metoder. Kortet viser én bestemt metode med to bægerglas." }),

            { id: "separation", ord: ["separation"], x: FR.x + FR.b / 2, y: FR.y, maal: [FR.x + FR.b / 2, FR.y], titel: true, dele: ["ramme"],
              omr: [{ r: [FR.x - 4, FR.y - 4, FR.b + 8, FR.h + 8, 20], tom: true }],
              fejl: { filtrering: "<b>filtrering</b> er kun én af metoderne. Overskriften gælder alle tre metoder i rammen.",
                      omkrystallisering: "<b>omkrystallisering</b> er kun én af metoderne. Overskriften gælder alle tre metoder i rammen.",
                      destillation: "<b>destillation</b> er kun én af metoderne. Overskriften gælder alle tre metoder i rammen." } },
            titel("destillation", KD, ["apparat"], {
                filtrering: "<b>filtrering</b> bruger en tragt. Kortet viser en kolbe, der koges, og en svaler, der køler dampen.",
                omkrystallisering: "<b>omkrystallisering</b> giver krystaller. Kortet viser en kolbe, der koges, og en svaler, der køler dampen.",
                separation: "<b>separation</b> er det fælles navn for flere metoder. Kortet viser én bestemt metode med en svaler." }),
            { id: "destillat", ord: ["destillat"], x: 898, y: 612, maal: [DEST[0] + 8, DEST[1] + 14], dele: ["destillat"],
              omr: [{ r: [DEST[0], DEST[1], DEST[2], DEST[3], 8] }],
              fejl: { "råprodukt": "<b>råprodukt</b> er faste krystaller. Pladsen peger på væsken, der drypper ud af svaleren.",
                      destillation: "<b>destillation</b> er hele metoden. Pladsen peger kun på væsken i kolben for enden af svaleren." } }
        ],

        tegn: function (api) {
            B8.defs();

            /* ----- Lag 1 ---------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KR.x, KR.y, KR.b, KR.h);
                    B8.tegnMol(g, SAL, { fs: 18 });
                    ORG.plus(g, 290, 150);
                    B8.tegnMol(g, ASA, { fs: 18 });
                    ORG.plus(g, 926, 150);
                    B8.tegnMol(g, ETS, { fs: 18 });
                    ORG.t(g, (PIL.x1 + PIL.x2) / 2, PIL.y + 26, "H⁺, varme", { fs: 13, farve: F.daempet });
                    ORG.navn(g, 170, NAVN_Y + 5, "salicylsyre");
                    ORG.navn(g, 800, NAVN_Y + 5, "acetylsalicylsyre");
                    ORG.navn(g, 1010, NAVN_Y + 5, "ethansyre");
                }
            });
            api.del("anhydrid", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    B8.tegnMol(gg, ANH, { fs: 18 });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("pil", {
                lag: 0,
                fuld: function (g) { return { p: ORG.reaktionspil(g, PIL.x1, PIL.x2, PIL.y) }; },
                byg: function (g, r, an) { an.fade(r.p, 0, 450); }
            });

            /* ----- Lag 2 ---------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KF.x, KF.y, KF.b, KF.h);
                    ORG.kortB(g, KO.x, KO.y, KO.b, KO.h);
                }
            });
            api.del("tragt", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); B8.filtrering(gg, TRAGT.cx, TRAGT.top, { tom: true }); return { g: gg }; },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("krystaller", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    for (var i = 0; i < 11; i++) {
                        var kx = TRAGT.cx - 29 + i * 5.8, ky = TRAGT.top + 2 + (i % 2) * 4;
                        SV.el("polygon", { points: f1(kx - 5) + "," + f1(ky + 4) + " " + f1(kx) + "," + f1(ky - 5) + " " + f1(kx + 5) + "," + f1(ky + 4),
                            fill: "#ffffff", stroke: "#7d8b96", "stroke-width": 1 }, gg);
                    }
                    SV.el("circle", { cx: TRAGT.cx - 12, cy: TRAGT.top + 3, r: 2.6, fill: "#f39a3c" }, gg);
                    SV.el("circle", { cx: TRAGT.cx + 16, cy: TRAGT.top + 6, r: 2.6, fill: "#f39a3c" }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("glas", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    varmeplade(gg, VARM.cx, VARM.bund + 2, 120);
                    LAB.baeger(gg, VARM.cx, VARM.bund, 104, 128, { top: VARM.bund - 84, fyld: "url(#b8-varm)" });
                    B8.damp(gg, VARM.cx, VARM.bund - 136, 3);
                    B8.partikler(gg, [[-34, -64], [-8, -70], [22, -60], [-26, -40], [6, -46], [34, -34], [-36, -16], [-4, -20], [26, -12], [14, -66, true], [-16, -28, true]].map(function (p) { return [VARM.cx + p[0], VARM.bund + p[1], p[2]]; }));
                    LAB.pil(gg, VARM.cx + 66, KOLD.cx - 66, VARM.bund - 50);
                    LAB.baeger(gg, KOLD.cx, KOLD.bund, 104, 128, { top: KOLD.bund - 84, fyld: "#dbeaf6" });
                    B8.partikler(gg, [[-24, -62, true], [20, -48, true]].map(function (p) { return [KOLD.cx + p[0], KOLD.bund + p[1], p[2]]; }));
                    for (var i = 0; i < 13; i++) {
                        var kx = KOLD.cx - 38 + i * 6.3, ky = KOLD.bund - 8 - (i % 3) * 3;
                        SV.el("polygon", { points: f1(kx - 5) + "," + f1(ky + 4) + " " + f1(kx) + "," + f1(ky - 5) + " " + f1(kx + 5) + "," + f1(ky + 4), fill: "#ffffff", stroke: "#7d8b96", "stroke-width": 1 }, gg);
                    }
                    ORG.t(gg, VARM.cx, VARM.bund + 44, "varm", { fs: 14, fed: true, farve: "#b4661b" });
                    ORG.t(gg, KOLD.cx, KOLD.bund + 44, "kold", { fs: 14, fed: true, farve: "#1f5fbf" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });

            /* ----- Lag 3 ---------------------------------------------------- */
            api.del("base3", {
                lag: 2, auto: true,
                fuld: function (g) { ORG.kortB(g, KD.x, KD.y, KD.b, KD.h); }
            });
            api.del("ramme", {
                lag: 2,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: FR.x, y: FR.y, width: FR.b, height: FR.h, rx: 20, fill: "rgba(15,118,110,0.03)", stroke: F.accent, "stroke-width": 2.2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("apparat", {
                lag: 2,
                fuld: function (g) { var gg = SV.g(g); destillation(gg); return { g: gg }; },
                byg: function (g, r, an) { an.fade(r.g, 0, 450); }
            });
            api.del("destillat", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    erlVaeske(gg, ERL.cx, ERL.bund, ERL.h, 0.26, "#bcd8f0");
                    SV.el("path", { d: "M" + (ERL.cx - 4) + "," + (ERL.bund - 52) + " q-3,5 0,8 q3,-3 0,-8 Z", fill: "#5ea6dc" }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

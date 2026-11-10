/* =====================================================================
   fig_farver.js - figuren til B5.1 Lys og farver

   Øverst bogens lys-boelger (blåt lys 450 nm og rødt lys 650 nm med
   bølgelængden fra top til top; "kort/lang bølgelængde" er taget af) og
   lys-spektrum (det synlige lys fra 400 til 700 nm mellem ultraviolet og
   infrarødt; farvernes navne er taget af, og aksen siger kun nm, for
   "bølgelængde i nm" ville afsloere pladsen ved bølgerne).
   I midten bogens lys-absorption: hvidt lys fra en lampe gennem en rød
   opløsning til oejet. "bliver absorberet" er pladsen.
   Nederst til venstre bogens farvecirkel med permanganat: det grønne lys
   er mørkt i ringen, og pilen gaar tvaers over til lilla. Farvecirkel er
   titel paa en ramme om ringen, saa den ikke staar over forklaringen om
   permanganat (glasset fra 3. nov. er taget ud for at spare plads).
   Nederst til hoejre bogens konjugering forenklet: kaeder med 2, 5, 8 og
   11 konjugerede dobbeltbindinger og stoffets farve, flyttet hertil fra
   B5.2 10. nov. 2026, da bogens B5.2 og B5.3 blev ét afsnit, og
   konjugeringen kom i B5.1. Fagordet er overskriften over tallene, og
   chromofor gruppe peger paa én C=C i kæden med 11. Lycopen og chromofor
   er taget ud: chromofor er ikke fagord længere, og lycopen var der kun
   for chromoforens skyld.
   Otte fagord i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    /* ----- Lag 1: boelgerne og det synlige lys ------------------------------ */
    var RA = { x: 20, y: 18, b: 520, h: 186 };
    var BX0 = 128, BX1 = 505, AMP = 18;
    var BOELGE = [
        { navn: "Blåt lys", nm: 450, y: 108, p: 50 },
        { navn: "Rødt lys", nm: 650, y: 174, p: 70 }
    ];
    BOELGE.forEach(function (b) {
        b.a = BX0 + 1.25 * b.p; b.b = BX0 + 2.25 * b.p; b.py = b.y - AMP - 12;
    });
    var RB = { x: 556, y: 18, b: 524, h: 186 };
    var UV0 = 572, XA = 652, XB = 996, IR1 = 1064, BY = 100, BH = 44;
    function XL(l) { return XA + (XB - XA) * (l - 400) / 300; }

    /* ----- Lag 2: hvidt lys gennem en rød opløsning -------------------------- */
    var RC = { x: 20, y: 220, b: 1060, h: 190 };
    var LY = 316, LAMPE = 72, KX = 520, KB = 96, KH = 128, KBUND = 378;
    var K0 = KX - KB / 2, K1 = KX + KB / 2;
    var STRAALER = [420, 470, 530, 580, 605, 660];
    var YS = STRAALER.map(function (nm, k) { return LY - 25 + 10 * k; });
    var OX = 892, OY = LY + 5;

    /* ----- Lag 3: farvecirklen ---------------------------------------------- */
    var RD = { x: 20, y: 426, b: 696, h: 300 };
    var CX = 197, CY = 582, R = 84, RI = 56, MR = (R + RI) / 2;
    var RAMME = { x: 32, y: 446, b: 330, h: 260 };
    var TA = B5.lystone(525);                                   /* det groenne lys, permanganat absorberer */
    function paaRing(tone, r) { var v = (tone - 90) * Math.PI / 180; return [CX + r * Math.cos(v), CY + r * Math.sin(v)]; }
    var GROEN = paaRing(TA, MR), LILLA = paaRing(TA + 180, MR);
    var LX = 390;                                               /* forklaringen om permanganat */

    /* ----- Lag 4: konjugeringen --------------------------------------------- */
    var KJ = { x: 730, y: 426, b: 350, h: 300 };
    var RAEKKER = [[2, null], [5, null], [8, B5.F.gul], [11, B5.F.orange]];
    var RY = [512, 552, 592, 632], NX = 760, KX0 = 784, KDX = 10;
    var GRUPPE = 6;                                              /* den chromofore gruppe: C=C fra atom 6 til 7 i kæden med 11 */
    function kaede(n, y) { return B5.zigzag(KX0, y, 2 * n, KDX / Math.cos(Math.PI / 6), true); }

    NK.FIGURER.farver = {
        vb: [1100, 744],
        lag: [
            { navn: "Lyset", pladser: ["bølgelængde", "synligt lys"],
              ros: "Bølgelængden er afstanden fra top til top. Øjet kan se lys fra omkring 400 til 700 nm." },
            { navn: "Lys gennem en opløsning", pladser: ["hvidt lys", "absorbere"],
              ros: "Hvidt lys har alle farverne. Den røde opløsning absorberer violet, blåt og grønt lys." },
            { navn: "Farvecirklen", pladser: ["farvecirkel", "komplementærfarver"],
              ros: "Grøn og lilla står over for hinanden i farvecirklen. Permanganat absorberer grønt lys og ser lilla ud." },
            { navn: "Farvestoffets molekyle", pladser: ["konjugerede dobbeltbindinger", "chromofor gruppe"],
              ros: "Jo flere konjugerede dobbeltbindinger, jo længere bølgelængde absorberer kæden. Hver C=C er en chromofor gruppe." }
        ],
        pladser: [
            { id: "bølgelængde", ord: ["bølgelængde"], x: 290, y: 44, maal: [0, 0], dele: ["boelger"],
              omr: [],
              fejl: { "synligt lys": "<b>synligt lys</b> er alle de farver, øjet kan se. Pladsen peger på afstanden fra én top til den næste i bølgen.",
                      "hvidt lys": "<b>hvidt lys</b> er alle farverne blandet. Pladsen peger på afstanden fra én top til den næste i bølgen." } },
            { id: "synligt lys", ord: ["synligt lys"], x: (XA + XB) / 2, y: 52, maal: [(XA + XB) / 2, BY - 2], dele: ["spektrum"],
              omr: [{ r: [XA - 4, BY - 4, XB - XA + 8, BH + 8, 6] }],
              fejl: { "bølgelængde": "<b>bølgelængde</b> er afstanden fra top til top i én bølge. Pladsen peger på hele den farvede del af båndet.",
                      "hvidt lys": "<b>hvidt lys</b> er farverne blandet sammen, som fra en lampe. Her er farverne lagt ud fra 400 til 700 nm." } },

            { id: "hvidt lys", ord: ["hvidt lys"], x: 300, y: 256, maal: [300, YS[0] - 6], dele: ["lampe"],
              omr: [{ r: [118, YS[0] - 8, K0 - 124, YS[5] - YS[0] + 16, 8] }],
              fejl: { "absorbere": "<b>absorbere</b> er det, opløsningen gør ved noget af lyset. Pladsen peger på lyset fra lampen, før det når glasset.",
                      "synligt lys": "<b>synligt lys</b> er båndet af farver fra 400 til 700 nm. Pladsen peger på lyset fra lampen med alle farverne blandet." } },
            { id: "absorbere", ord: ["absorbere"], x: 750, y: 272, maal: [K0 + 46, YS[1]], dele: ["glas"],
              omr: [{ r: [K0 + 3, YS[0] - 7, 80, YS[2] - YS[0] + 14, 6] }],
              fejl: { "hvidt lys": "<b>hvidt lys</b> er alle farverne blandet. Pladsen peger på det lys, der forsvinder inde i den røde opløsning.",
                      "komplementærfarver": "<b>komplementærfarver</b> står over for hinanden i farvecirklen. Pladsen peger på lys, der forsvinder i opløsningen." } },

            { id: "farvecirkel", ord: ["farvecirkel"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["ring"],
              omr: [{ r: [RAMME.x - 4, RAMME.y - 4, RAMME.b + 8, RAMME.h + 8, 16], tom: true }],
              fejl: { "komplementærfarver": "<b>komplementærfarver</b> er to farver over for hinanden. Overskriften gælder hele ringen med alle farverne.",
                      "synligt lys": "<b>synligt lys</b> er båndet fra 400 til 700 nm. Overskriften gælder ringen, der viser, hvilken farve vi ser." } },
            { id: "komplementærfarver", ord: ["komplementærfarver"], x: 540, y: 510, maal: [GROEN[0], GROEN[1]], dele: ["pil", "noegle"],
              omr: [{ linje: [GROEN, LILLA], b: 14 }, { c: [GROEN[0], GROEN[1], 14] }, { c: [LILLA[0], LILLA[1], 17] }],
              fejl: { "farvecirkel": "<b>farvecirkel</b> er hele ringen. Pladsen peger på to farver, der står lige over for hinanden i ringen.",
                      "absorbere": "<b>absorbere</b> er det, stoffet gør ved lyset. Pladsen peger på to farver, der står lige over for hinanden." } },

            { id: "konjugerede dobbeltbindinger", ord: ["konjugerede dobbeltbindinger"], x: KJ.x + KJ.b / 2, y: KJ.y + 38, maal: [NX, RY[0] - 22], dele: ["kaeder"],
              omr: [{ r: [NX - 20, RY[0] - 24, 40, RY[3] - RY[0] + 40, 8] }],
              fejl: { "chromofor gruppe": "<b>chromofor gruppe</b> er én lille gruppe som C=C. Tallene tæller dobbeltbindinger, der sidder i en konjugeret række.",
                      "komplementærfarver": "<b>komplementærfarver</b> står over for hinanden i farvecirklen. Pladsen står over tallene, der tæller noget i kæderne.",
                      "bølgelængde": "<b>bølgelængde</b> er afstanden fra top til top i lyset. Pladsen står over tallene, der tæller noget i kæderne." } },
            { id: "chromofor gruppe", ord: ["chromofor gruppe"], x: KJ.x + KJ.b / 2, y: KJ.y + KJ.h - 30, maal: [0, 0], dele: ["gruppe"],
              omr: [],
              fejl: { "konjugerede dobbeltbindinger": "<b>konjugerede dobbeltbindinger</b> er to C=C med én enkeltbinding imellem. Pladsen peger på én enkelt C=C.",
                      "absorbere": "<b>absorbere</b> er det, stoffet gør ved lyset. Pladsen peger på én enkelt C=C i den lange kæde." } }
        ],

        tegn: function (api) {
            B5.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

            /* Den chromofore gruppe: et felt om én C=C i kæden med 11 */
            var pg = plads("chromofor gruppe"), Q11 = kaede(11, RY[3]), G0 = Q11[GRUPPE], G1 = Q11[GRUPPE + 1];
            pg.omr = [{ r: [G0[0] - 6, Math.min(G0[1], G1[1]) - 8, G1[0] - G0[0] + 12, Math.abs(G1[1] - G0[1]) + 16, 6] }];
            pg.maal = [(G0[0] + G1[0]) / 2, Math.max(G0[1], G1[1]) + 9];

            /* Boelgelaengden: et felt om hver dobbeltpil, og prikken paa den roede */
            var pb = plads("bølgelængde"), blaa = BOELGE[0];
            pb.omr = BOELGE.map(function (b) { return { r: [b.a - 5, b.py - 9, b.b - b.a + 10, 18, 6] }; });
            pb.maal = [blaa.b - 8, blaa.py];

            /* ----- Lag 1 -------------------------------------------------------- */
            api.del("boelger", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    var r = {};
                    BOELGE.forEach(function (b, i) {
                        var farve = B5.lysfarve(b.nm);
                        KV.tekst(g, 38, b.y + 6, b.navn, { fs: 16, fed: true, anker: "start" });
                        KV.linje(g, BX0, b.y, BX1, b.y, "#d5e2e0", 1);
                        var pkt = [];
                        for (var x = BX0; x <= BX1; x += 2) pkt.push([x, b.y - AMP * Math.sin(2 * Math.PI * (x - BX0) / b.p)]);
                        var p = KV.pkt(pkt);
                        var gg = SV.g(g);
                        SV.el("polyline", { points: p, fill: "none", stroke: farve, "stroke-width": 9, opacity: 0.4, "stroke-linecap": "round", "stroke-linejoin": "round", filter: "url(#b5-glod)" }, gg);
                        SV.el("polyline", { points: p, fill: "none", stroke: farve, "stroke-width": 3.4, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
                        SV.el("polyline", { points: p, fill: "none", stroke: "#ffffff", "stroke-width": 1, opacity: 0.55, "stroke-linecap": "round", transform: "translate(0 -0.6)" }, gg);
                        [b.a, b.b].forEach(function (x) { KV.linje(g, x, b.y - AMP - 5, x, b.y - AMP - 22, F.daempet, 1.2); });
                        B5.vDobbeltpil(g, b.a + 1, b.b - 1, b.py, F.daempet, 1.5, 9);
                        KV.tekst(g, b.a - 10, b.py + 5, "λ = " + b.nm + " nm", { fs: 14.5, fed: true, anker: "end" });
                        r["b" + i] = gg;
                    });
                    return r;
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.b0, 100, 500); an.pop(r.b1, 250, 500); }
            });

            api.del("spektrum", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    var id = KV.id("spk");
                    SV.el("rect", { x: UV0 + 3, y: BY + 6, width: IR1 - UV0, height: BH, rx: 9, fill: "#3c4a52", opacity: 0.2, filter: "url(#b5-blur)" }, g);
                    var gl = SV.g(g, { opacity: 0.45, filter: "url(#b5-glod)" });
                    B5.regnbue(gl, XA, XB, BY + 4, BH - 8);
                    var cp = SV.el("clipPath", { id: id }, g);
                    SV.el("rect", { x: UV0, y: BY, width: IR1 - UV0, height: BH, rx: 9 }, cp);
                    var k = SV.g(g, { "clip-path": "url(#" + id + ")" });
                    SV.el("rect", { x: UV0, y: BY, width: XA - UV0, height: BH, fill: "url(#b5-uv)" }, k);
                    SV.el("rect", { x: XB, y: BY, width: IR1 - XB, height: BH, fill: "url(#b5-ir)" }, k);
                    var bue = B5.regnbue(k, XA, XB, BY, BH);
                    SV.el("rect", { x: UV0, y: BY, width: IR1 - UV0, height: BH, fill: "url(#b5-lysglans)" }, k);
                    SV.el("rect", { x: UV0, y: BY, width: IR1 - UV0, height: BH, rx: 9, fill: "none", stroke: "#6f7f84", "stroke-width": 1.2 }, g);
                    KV.linje(g, XA, BY, XA, BY + BH, "#6f7f84", 1);
                    KV.linje(g, XB, BY, XB, BY + BH, "#6f7f84", 1);
                    [[(UV0 + XA) / 2, "ultraviolet"], [(XB + IR1) / 2, "infrarødt"]].forEach(function (t) {
                        KV.tekst(g, t[0], BY + 20, t[1], { fs: 12.5, fed: true, farve: F.daempet });
                        KV.tekst(g, t[0], BY + 36, "usynligt", { fs: 12, farve: F.daempet });
                    });
                    [400, 500, 600, 700].forEach(function (l) {
                        KV.linje(g, XL(l), BY + BH, XL(l), BY + BH + 6, F.daempet, 1.2);
                        KV.tekst(g, XL(l), BY + BH + 23, l + " nm", { fs: 13, farve: F.daempet });
                    });
                    return { bue: bue };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.bue, 150, 500); }
            });

            /* ----- Lag 2 -------------------------------------------------------- */
            api.del("lampe", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    SV.el("rect", { x: 96, y: LY - 34, width: K0 - 96, height: 68, rx: 34, fill: "#fff8dc", opacity: 0.7, filter: "url(#b5-glod)" }, g);
                    var gg = SV.g(g);
                    STRAALER.forEach(function (nm, k) {
                        var farve = B5.lysfarve(nm), y = YS[k];
                        SV.el("path", { d: "M" + (LAMPE + 16) + "," + LY + " C" + (LAMPE + 40) + "," + LY + " " + (LAMPE + 46) + "," + y + " " + (LAMPE + 70) + "," + y,
                            fill: "none", stroke: farve, "stroke-width": 4, "stroke-linecap": "round" }, gg);
                        B5.straale(gg, LAMPE + 69, K0, y, 4.2, farve, { spids: false, glod: 0.8 });
                    });
                    B5.lampe(g, LAMPE, LY, 17);
                    KV.tekst(g, 300, YS[5] + 28, "alle farver", { fs: 14, farve: F.daempet });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("glas", {
                lag: 1,
                fuld: function (g) {
                    B5.kuvette(g, KX, KBUND, KB, KH, { farve: B5.fortyndet(B5.F.roed, 0.9), niveau: 0.86, inde: function (ig) {
                        STRAALER.forEach(function (nm, k) {
                            var farve = B5.lysfarve(nm);
                            if (k < 3) B5.svind(ig, K0, K0 + 64 + 4 * k, YS[k], 4.2, 2.6, farve, 1, 0, true);
                            else B5.straale(ig, K0, K1, YS[k], 4.2, farve, { spids: false });
                        });
                    } });
                    STRAALER.slice(3).forEach(function (nm, j) {
                        var farve = B5.lysfarve(nm), y = YS[j + 3];
                        B5.straale(g, K1, OX - 62, y, 4.2, farve, { spids: false });
                        SV.el("path", { d: "M" + (OX - 63) + "," + y + " C" + (OX - 40) + "," + y + " " + (OX - 40) + "," + OY + " " + (OX - 14) + "," + OY,
                            fill: "none", stroke: farve, "stroke-width": 4, "stroke-linecap": "round" }, g);
                    });
                    B5.oeje(g, OX + 8, OY, 26);
                    KV.tekst(g, KX, KBUND + 22, "rød opløsning", { fs: 15, fed: true });
                    KV.tekst(g, 740, RC.y + 24, "violet, blåt og grønt lys", { fs: 14.5, fed: true });
                    KV.tekst(g, 720, YS[5] + 28, "gult, orange og rødt lys", { fs: 14.5, fed: true });
                    KV.tekst(g, 720, YS[5] + 46, "slipper igennem", { fs: 14, farve: F.daempet });
                    KV.tekst(g, OX + 6, YS[5] + 28, "vi ser rød", { fs: 14.5, fed: true, farve: F.accent });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            /* ----- Lag 3 -------------------------------------------------------- */
            api.del("ring", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, RD.x, RD.y, RD.b, RD.h);
                    SV.el("rect", { x: RAMME.x, y: RAMME.y, width: RAMME.b, height: RAMME.h, rx: 14, fill: "#ffffff", "fill-opacity": 0.55, stroke: "#9fb3bd", "stroke-width": 1.3 }, g);
                    SV.el("circle", { cx: CX + 3, cy: CY + 6, r: MR, fill: "none", stroke: "#3c4a52", "stroke-opacity": 0.22, "stroke-width": R - RI, filter: "url(#b5-blur)" }, g);
                    for (var k = 0; k < 120; k++) {
                        var t = k * 3, a1 = (t - 1.9 - 90) * Math.PI / 180, a2 = (t + 1.9 - 90) * Math.PI / 180;
                        SV.el("path", { d: "M" + (CX + R * Math.cos(a1)) + "," + (CY + R * Math.sin(a1)) + " A" + R + "," + R + " 0 0 1 " + (CX + R * Math.cos(a2)) + "," + (CY + R * Math.sin(a2)) +
                            " L" + (CX + RI * Math.cos(a2)) + "," + (CY + RI * Math.sin(a2)) + " A" + RI + "," + RI + " 0 0 0 " + (CX + RI * Math.cos(a1)) + "," + (CY + RI * Math.sin(a1)) + " Z",
                            fill: B5.tonefarve(t) }, g);
                    }
                    SV.el("circle", { cx: CX, cy: CY, r: MR, fill: "none", stroke: "url(#b5-ringglans)", "stroke-width": R - RI }, g);
                    SV.el("circle", { cx: CX, cy: CY, r: R, fill: "none", stroke: "#5f6f74", "stroke-width": 1.3 }, g);
                    SV.el("circle", { cx: CX, cy: CY, r: RI, fill: "url(#b5-indre)", stroke: "#5f6f74", "stroke-width": 1.3 }, g);
                    [["rød", 0], ["orange", 30], ["gul", 60], ["grøn", 120], ["blågrøn", 180], ["blå", 212], ["violet", 262], ["lilla", 305]].forEach(function (n) {
                        var v = (n[1] - 90) * Math.PI / 180, c = Math.cos(v);
                        KV.tekst(g, CX + (R + 10) * c, CY + (R + 10) * Math.sin(v) + 5 + 6 * Math.sin(v), n[0],
                            { fs: 15, fed: true, anker: c > 0.3 ? "start" : (c < -0.3 ? "end" : "middle") });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            api.del("pil", {
                lag: 2,
                fuld: function (g) {
                    /* Det groenne lys, permanganat absorberer, er moerkt i ringen */
                    var t1 = B5.lystone(570), t2 = B5.lystone(495);
                    var a1 = (t1 - 90) * Math.PI / 180, a2 = (t2 - 90) * Math.PI / 180, r1 = R + 1, r2 = RI - 1;
                    SV.el("path", { d: "M" + (CX + r1 * Math.cos(a1)) + "," + (CY + r1 * Math.sin(a1)) + " A" + r1 + "," + r1 + " 0 0 1 " + (CX + r1 * Math.cos(a2)) + "," + (CY + r1 * Math.sin(a2)) +
                        " L" + (CX + r2 * Math.cos(a2)) + "," + (CY + r2 * Math.sin(a2)) + " A" + r2 + "," + r2 + " 0 0 0 " + (CX + r2 * Math.cos(a1)) + "," + (CY + r2 * Math.sin(a1)) + " Z",
                        fill: "#1c2427", opacity: 0.66 }, g);
                    var fra = paaRing(TA, RI - 2), til = paaRing(TA + 180, RI + 2);
                    var gg = SV.g(g);
                    KV.pil(gg, fra[0], fra[1], til[0], til[1], F.blaek, 2, 12);
                    SV.el("circle", { cx: GROEN[0], cy: GROEN[1], r: 9, fill: "none", stroke: "#ffffff", "stroke-width": 2.5 }, gg);
                    var lilla = B5.tonefarve(TA + 180);
                    SV.el("circle", { cx: LILLA[0], cy: LILLA[1], r: 22, fill: lilla, opacity: 0.6, filter: "url(#b5-glod)" }, gg);
                    SV.el("circle", { cx: LILLA[0], cy: LILLA[1], r: 13, fill: lilla, stroke: "#ffffff", "stroke-width": 3 }, gg);
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.gg, 200, 500); }
            });

            api.del("noegle", {
                lag: 2,
                fuld: function (g) {
                    var ly0 = 588, lilla = B5.tonefarve(TA + 180);
                    SV.el("rect", { x: LX, y: ly0 - 12, width: 26, height: 14, rx: 3, fill: B5.tonefarve(TA) }, g);
                    SV.el("rect", { x: LX, y: ly0 - 12, width: 26, height: 14, rx: 3, fill: "#1c2427", opacity: 0.74 }, g);
                    KV.tekst(g, LX + 38, ly0, "permanganat absorberer grønt lys", { fs: 15, anker: "start" });
                    SV.el("circle", { cx: LX + 13, cy: ly0 + 30, r: 14, fill: lilla, opacity: 0.6, filter: "url(#b5-glod)" }, g);
                    SV.el("circle", { cx: LX + 13, cy: ly0 + 30, r: 8.5, fill: lilla, stroke: "#ffffff", "stroke-width": 2.5 }, g);
                    KV.tekst(g, LX + 38, ly0 + 35, "permanganat ser lilla ud", { fs: 15, anker: "start" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 4: kæderne -------------------------------------------- */
            api.del("kaeder", {
                lag: 3,
                fuld: function (g) {
                    KV.kort(g, KJ.x, KJ.y, KJ.b, KJ.h);
                    RAEKKER.forEach(function (r, i) {
                        var y = RY[i], n = r[0];
                        KV.tekst(g, NX, y + 7, String(n), { fs: 20, fed: true, farve: F.accent });
                        var Q = kaede(n, y);
                        var orden = Q.slice(1).map(function (q, j) { return j % 2 === 0 ? 2 : 1; });
                        B5.kaede(g, Q, orden, { sw: 1.8 });
                        var farve = r[1] ? B5.fortyndet(r[1], 0.9) : "#eef4f8";
                        B5.kuvette(g, 1046, y + 16, 22, 34, { farve: farve, niveau: 0.8 });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            /* Den chromofore gruppe: én C=C, der faar farve, naar ordet sidder */
            api.del("gruppe", {
                lag: 3,
                fuld: function (g) {
                    var gg = SV.g(g);
                    B5.kaede(gg, [G0, G1], [2], { sw: 3, farve: B5.F.eps });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.pop(r.gg, 0, 500); }
            });
        }
    };
}());

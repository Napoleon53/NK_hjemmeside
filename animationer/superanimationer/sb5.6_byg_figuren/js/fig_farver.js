/* =====================================================================
   fig_farver.js - figuren til B5.1 Lys og farver

   Øverst bogens lys-boelger (blåt lys 450 nm og rødt lys 650 nm med
   bølgelængden fra top til top; "kort/lang bølgelængde" er taget af) og
   lys-spektrum (det synlige lys fra 400 til 700 nm mellem ultraviolet og
   infrarødt; farvernes navne er taget af, og aksen siger kun nm, for
   "bølgelængde i nm" ville afsloere pladsen ved bølgerne).
   I midten bogens lys-absorption: hvidt lys fra en lampe gennem en rød
   opløsning til oejet. "bliver absorberet" er pladsen.
   Nederst bogens farvecirkel med permanganat: det grønne lys er mørkt i
   ringen, og pilen gaar tvaers over til lilla. Farvecirkel er titel paa
   en ramme om ringen, saa den ikke staar over glasset med permanganat.
   Seks fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    /* ----- Lag 1: boelgerne og det synlige lys ------------------------------ */
    var RA = { x: 20, y: 18, b: 512, h: 172 };
    var BX0 = 128, BX1 = 505, AMP = 18;
    var BOELGE = [
        { navn: "Blåt lys", nm: 450, y: 94, p: 50 },
        { navn: "Rødt lys", nm: 650, y: 160, p: 70 }
    ];
    BOELGE.forEach(function (b) {
        b.a = BX0 + 1.25 * b.p; b.b = BX0 + 2.25 * b.p; b.py = b.y - AMP - 12;
    });
    var RB = { x: 550, y: 18, b: 530, h: 172 };
    var UV0 = 566, XA = 646, XB = 990, IR1 = 1064, BY = 92, BH = 44;
    function XL(l) { return XA + (XB - XA) * (l - 400) / 300; }

    /* ----- Lag 2: hvidt lys gennem en rød opløsning -------------------------- */
    var RC = { x: 20, y: 206, b: 1060, h: 190 };
    var LY = 302, LAMPE = 72, KX = 520, KB = 96, KH = 128, KBUND = 364;
    var K0 = KX - KB / 2, K1 = KX + KB / 2;
    var STRAALER = [420, 470, 530, 580, 605, 660];
    var YS = STRAALER.map(function (nm, k) { return LY - 25 + 10 * k; });
    var OX = 892, OY = LY + 5;

    /* ----- Lag 3: farvecirklen ---------------------------------------------- */
    var RD = { x: 20, y: 412, b: 1060, h: 304 };
    var CX = 245, CY = 578, R = 84, RI = 56, MR = (R + RI) / 2;
    var RAMME = { x: 76, y: 432, b: 338, h: 268 };
    var TA = B5.lystone(525);                                   /* det groenne lys, permanganat absorberer */
    function paaRing(tone, r) { var v = (tone - 90) * Math.PI / 180; return [CX + r * Math.cos(v), CY + r * Math.sin(v)]; }
    var GROEN = paaRing(TA, MR), LILLA = paaRing(TA + 180, MR);
    var GX = 840;                                               /* glasset med permanganat */

    NK.FIGURER.farver = {
        vb: [1100, 730],
        lag: [
            { navn: "Lyset", pladser: ["bølgelængde", "synligt lys"],
              ros: "Bølgelængden er afstanden fra top til top. Øjet kan se lys fra omkring 400 til 700 nm." },
            { navn: "Lys gennem en opløsning", pladser: ["hvidt lys", "absorbere"],
              ros: "Hvidt lys har alle farverne. Den røde opløsning absorberer violet, blåt og grønt lys." },
            { navn: "Farvecirklen", pladser: ["farvecirkel", "komplementærfarver"],
              ros: "Grøn og lilla står over for hinanden i farvecirklen. Permanganat absorberer grønt lys og ser lilla ud." }
        ],
        pladser: [
            { id: "bølgelængde", ord: ["bølgelængde"], x: 418, y: 52, maal: [0, 0], dele: ["boelger"],
              omr: [],
              fejl: { "synligt lys": "<b>synligt lys</b> er alle de farver, øjet kan se. Pladsen peger på afstanden fra én top til den næste i bølgen.",
                      "hvidt lys": "<b>hvidt lys</b> er alle farverne blandet. Pladsen peger på afstanden fra én top til den næste i bølgen." } },
            { id: "synligt lys", ord: ["synligt lys"], x: (XA + XB) / 2, y: 48, maal: [(XA + XB) / 2, BY - 2], dele: ["spektrum"],
              omr: [{ r: [XA - 4, BY - 4, XB - XA + 8, BH + 8, 6] }],
              fejl: { "bølgelængde": "<b>bølgelængde</b> er afstanden fra top til top i én bølge. Pladsen peger på hele den farvede del af båndet.",
                      "hvidt lys": "<b>hvidt lys</b> er farverne blandet sammen, som fra en lampe. Her er farverne lagt ud fra 400 til 700 nm." } },

            { id: "hvidt lys", ord: ["hvidt lys"], x: 300, y: 242, maal: [300, YS[0] - 6], dele: ["lampe"],
              omr: [{ r: [118, YS[0] - 8, K0 - 124, YS[5] - YS[0] + 16, 8] }],
              fejl: { "absorbere": "<b>absorbere</b> er det, opløsningen gør ved noget af lyset. Pladsen peger på lyset fra lampen, før det når glasset.",
                      "synligt lys": "<b>synligt lys</b> er båndet af farver fra 400 til 700 nm. Pladsen peger på lyset fra lampen med alle farverne blandet." } },
            { id: "absorbere", ord: ["absorbere"], x: 740, y: 258, maal: [K0 + 46, YS[1]], dele: ["glas"],
              omr: [{ r: [K0 + 3, YS[0] - 7, 80, YS[2] - YS[0] + 14, 6] }],
              fejl: { "hvidt lys": "<b>hvidt lys</b> er alle farverne blandet. Pladsen peger på det lys, der forsvinder inde i den røde opløsning.",
                      "komplementærfarver": "<b>komplementærfarver</b> står over for hinanden i farvecirklen. Pladsen peger på lys, der forsvinder i opløsningen." } },

            { id: "farvecirkel", ord: ["farvecirkel"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["ring"],
              omr: [{ r: [RAMME.x - 4, RAMME.y - 4, RAMME.b + 8, RAMME.h + 8, 16], tom: true }],
              fejl: { "komplementærfarver": "<b>komplementærfarver</b> er to farver over for hinanden. Overskriften gælder hele ringen med alle farverne.",
                      "synligt lys": "<b>synligt lys</b> er båndet fra 400 til 700 nm. Overskriften gælder ringen, der viser, hvilken farve vi ser." } },
            { id: "komplementærfarver", ord: ["komplementærfarver"], x: 600, y: 566, maal: [GROEN[0], GROEN[1]], dele: ["pil", "glas2"],
              omr: [{ linje: [GROEN, LILLA], b: 14 }, { c: [GROEN[0], GROEN[1], 14] }, { c: [LILLA[0], LILLA[1], 17] }],
              fejl: { "farvecirkel": "<b>farvecirkel</b> er hele ringen. Pladsen peger på to farver, der står lige over for hinanden i ringen.",
                      "absorbere": "<b>absorbere</b> er det, stoffet gør ved lyset. Pladsen peger på to farver, der står lige over for hinanden." } }
        ],

        tegn: function (api) {
            B5.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

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
                    KV.tekst(g, 740, 230, "violet, blåt og grønt lys", { fs: 14.5, fed: true });
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

            api.del("glas2", {
                lag: 2,
                fuld: function (g) {
                    KV.tekst(g, GX, 458, "Permanganat", { fs: 16, fed: true });
                    B5.baeger(g, GX, 612, 104, 118, 0.7, B5.blanding(B5.F.lilla, "#ffffff", 0.3));
                    var lx = 758, ly0 = 652, lilla = B5.tonefarve(TA + 180);
                    SV.el("rect", { x: lx, y: ly0 - 12, width: 26, height: 14, rx: 3, fill: B5.tonefarve(TA) }, g);
                    SV.el("rect", { x: lx, y: ly0 - 12, width: 26, height: 14, rx: 3, fill: "#1c2427", opacity: 0.74 }, g);
                    KV.tekst(g, lx + 38, ly0, "absorberer grønt lys", { fs: 15, anker: "start" });
                    SV.el("circle", { cx: lx + 13, cy: ly0 + 24, r: 14, fill: lilla, opacity: 0.6, filter: "url(#b5-glod)" }, g);
                    SV.el("circle", { cx: lx + 13, cy: ly0 + 24, r: 8.5, fill: lilla, stroke: "#ffffff", "stroke-width": 2.5 }, g);
                    KV.tekst(g, lx + 38, ly0 + 29, "ser lilla ud", { fs: 15, anker: "start" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

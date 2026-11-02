/* =====================================================================
   fig_ph.js - figuren til 7.3 pH-skalaen

   Øverst tre vinduer ind i en sur, en neutral og en basisk opløsning
   som bogens figur sur-neutral-basisk: oxoniumioner med rød glød og
   hydroxidioner med blå glød, den ion, der næsten ikke findes, bleg.
   Under kortene en lille forklaring med formlerne. Ordet pH står ikke i
   figuren, så det ikke afslører pladsen.
   Nederst pH-skalaen fra −1 til 15 i bogens farver med tre stoffer fra
   hverdagen, en dråbeflaske med BTB og to reagensglas (gult i
   citronsaft, blåt i sæbevand) og et pH-meter med elektroden i et
   bægerglas.
   Seks fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var K = [{ x: 30, y: 36, b: 290, h: 252 }, { x: 355, y: 36, b: 290, h: 252 }, { x: 680, y: 36, b: 290, h: 252 }];
    var VY = 16, VH = 168;                              /* vinduet i kortet */
    var LY = 334;                                       /* forklaringen under kortene */
    var SK = { x: 44, y: 430, c: 25.4, h: 38 };         /* pH-skalaen: -1 til 15 */
    var SL = 612;                                       /* pladserne nederst */
    var BF = { x: 486, y: 438, b: 36, h: 74 };          /* dråbeflasken */
    var RG = [590, 664], RG_TOP = 440, RG_BUND = 540;  /* reagensglassene */
    var PM = { x: 732, y: 426, b: 124, h: 76 };         /* pH-metret */
    var BG = { cx: 916, bund: 552, b: 76, h: 74 };      /* bægerglasset med elektroden */

    function midt(k) { return k.x + k.b / 2; }
    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: midt(k), y: k.y + k.h, maal: [midt(k), k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }
    function skalaX(ph) { return SK.x + (ph + 1.5) * SK.c; }

    NK.FIGURER.ph = {
        vb: [1000, 650],
        lag: [
            { navn: "Hvilke ioner er der flest af?", pladser: ["sur", "neutral", "basisk"],
              ros: "Med flest oxoniumioner er opløsningen sur, med lige mange neutral og med flest hydroxidioner basisk." },
            { navn: "Mål det", pladser: ["pH", "syre/base-indikator", "pH-meter"],
              ros: "pH er tallet på skalaen. En syre/base-indikator viser det med en farve, og et pH-meter måler det." }
        ],
        pladser: [
            skilt("sur", K[0], ["sur"], {
                basisk: "<b>basisk</b> betyder flere hydroxidioner end oxoniumioner. I vinduet her er der flest oxoniumioner.",
                neutral: "<b>neutral</b> betyder lige mange af hver. I vinduet her er der flest oxoniumioner.",
                pH: "<b>pH</b> er et tal på skalaen nedenfor. Skiltet siger, hvad slags opløsning der er i vinduet." }),
            skilt("neutral", K[1], ["neutral"], {
                sur: "<b>sur</b> betyder flere oxoniumioner end hydroxidioner. I vinduet her er der lige mange af hver.",
                basisk: "<b>basisk</b> betyder flere hydroxidioner end oxoniumioner. I vinduet her er der lige mange af hver." }),
            skilt("basisk", K[2], ["basisk"], {
                sur: "<b>sur</b> betyder flere oxoniumioner end hydroxidioner. I vinduet her er der flest hydroxidioner.",
                neutral: "<b>neutral</b> betyder lige mange af hver. I vinduet her er der flest hydroxidioner." }),

            { id: "pH", ord: ["pH"], x: 256, y: SL, maal: [skalaX(7), SK.y + SK.h + 4], dele: ["skala"],
              omr: [{ r: [skalaX(-1) - 6, SK.y - 6, 17 * SK.c + 12, SK.h + 12, 8] }],
              fejl: { "syre/base-indikator": "<b>syre/base-indikator</b> er et farvestof. Pladsen peger på skalaen med tal fra −1 til 15.",
                      "pH-meter": "<b>pH-meter</b> er et apparat. Pladsen peger på skalaen med tallene.",
                      sur: "<b>sur</b> passer kun på den venstre del af skalaen. Pladsen gælder hele skalaen med tallene." } },
            { id: "syre/base-indikator", ord: ["syre/base-indikator"], x: 560, y: SL, maal: [BF.x + BF.b / 2, BF.y + BF.h + 6], dele: ["ind"],
              omr: [{ r: [BF.x - 6, BF.y - 24, BF.b + 12, BF.h + 30, 8] }],
              fejl: { "pH-meter": "<b>pH-meter</b> er apparatet til højre. Pladsen peger på flasken med farvestoffet, der gør glassene gule og blå.",
                      pH: "<b>pH</b> er et tal. Pladsen peger på flasken med farvestoffet, der gør glassene gule og blå." } },
            { id: "pH-meter", ord: ["pH-meter"], x: 836, y: SL, maal: [PM.x + PM.b / 2, PM.y + PM.h + 4], dele: ["meter"],
              omr: [{ r: [PM.x - 6, PM.y - 6, PM.b + 12, PM.h + 12, 10] }],
              fejl: { "syre/base-indikator": "<b>syre/base-indikator</b> er et farvestof. Pladsen peger på apparatet med display og elektrode.",
                      pH: "<b>pH</b> er tallet på displayet. Pladsen peger på hele apparatet med display og elektrode." } }
        ],

        tegn: function (api) {
            LAB.gradienter();

            /* Et vindue med ionerne og nogle få vandmolekyler bagved */
            function vindue(g, k, fyld, oxo, hyd, blegOxo, blegHyd, fro) {
                var x0 = k.x + 14, y0 = k.y + VY, b = k.b - 28;
                SV.el("rect", { x: x0, y: y0, width: b, height: VH, rx: 10, fill: fyld, stroke: "#8fa6b8", "stroke-width": 1.2 }, g);
                var vand = [[0.12, 0.2], [0.42, 0.12], [0.86, 0.3], [0.3, 0.55], [0.62, 0.48], [0.1, 0.85], [0.52, 0.86], [0.9, 0.78], [0.72, 0.16]];
                vand.forEach(function (p, i) { LAB.vand(g, x0 + p[0] * b, y0 + p[1] * VH, 0.9, (i * 47 + fro * 13) % 360); });
                var pladser = [[0.15, 0.3], [0.4, 0.27], [0.66, 0.3], [0.88, 0.5], [0.22, 0.72], [0.5, 0.68], [0.78, 0.78]];
                var ioner = [];
                for (var i = 0; i < oxo; i++) ioner.push("o");
                for (var j = 0; j < hyd; j++) ioner.push("h");
                if (oxo === hyd) pladser = [[0.3, 0.38], [0.7, 0.66]];
                ioner.forEach(function (sl, n) {
                    var p = pladser[(n * 3 + fro) % pladser.length], x = x0 + p[0] * b, y = y0 + p[1] * VH;
                    if (sl === "o") LAB.oxonium(g, x, y, 1.05, blegOxo);
                    else LAB.hydroxid(g, x, y, 1.05, blegHyd);
                });
            }

            function kort(id, i, fyld, oxo, hyd, blegOxo, blegHyd, tekst) {
                api.del(id, {
                    lag: 0,
                    fuld: function (g) {
                        var k = K[i];
                        LAB.kort(g, k.x, k.y, k.b, k.h);
                        vindue(g, k, fyld, oxo, hyd, blegOxo, blegHyd, i);
                        SV.tekst(g, midt(k), k.y + VY + VH + 34, tekst, { "font-size": 16, "font-weight": 700, fill: F.tekst });
                    },
                    byg: function (g, r, an) { an.fade(g, 0, 450); }
                });
            }
            kort("sur", 0, "url(#k7-sur)", 6, 1, false, true, "flest oxoniumioner");
            kort("neutral", 1, "url(#k7-vindue)", 1, 1, true, true, "lige mange af hver");
            kort("basisk", 2, "url(#k7-basisk)", 1, 6, true, false, "flest hydroxidioner");

            /* Forklaringen: en model og formlen for hver ion */
            api.del("legende", {
                lag: 0, auto: true,
                fuld: function (g) {
                    LAB.oxonium(g, 384, LY - 5, 0.75);
                    SV.tekst(g, 404, LY + 1, "H_3O^+", { "font-size": 16, "font-weight": 700, fill: LAB.POS.tekst, "text-anchor": "start" });
                    LAB.hydroxid(g, 560, LY - 5, 0.75);
                    SV.tekst(g, 580, LY + 1, "OH^−", { "font-size": 16, "font-weight": 700, fill: LAB.NEG.tekst, "text-anchor": "start" });
                }
            });

            /* ----- Lag 2: skalaen, indikatoren og pH-metret ------------------------ */
            api.del("skala", {
                lag: 1,
                fuld: function (g) {
                    var celler = SV.g(g);
                    for (var p = -1; p <= 15; p++) {
                        var x = SK.x + (p + 1) * SK.c, lys = p >= 5 && p <= 9;
                        SV.el("rect", { x: x + 1, y: SK.y, width: SK.c - 2, height: SK.h, rx: 4, fill: LAB.PH_FARVER[p + 1] }, celler);
                        SV.tekst(celler, x + SK.c / 2, SK.y + SK.h / 2 + 5, p < 0 ? "−1" : String(p), { "font-size": 12.5, "font-weight": 700, fill: lys ? "#1f2a33" : "#ffffff" });
                    }
                    /* Tre stoffer fra hverdagen over skalaen */
                    [[2.3, "citronsaft"], [7.0, "rent vand"], [14.0, "afløbsrens"]].forEach(function (s) {
                        var x = skalaX(s[0] - 0.5) + SK.c / 2;
                        SV.el("polygon", { points: (x - 6) + "," + (SK.y - 12) + " " + (x + 6) + "," + (SK.y - 12) + " " + x + "," + (SK.y - 3), fill: "#59636e" }, g);
                        SV.tekst(g, x, SK.y - 18, s[1], { "font-size": 14, "font-weight": 700, fill: F.svag });
                    });
                    return { c: celler };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.c, 150, 500); }
            });

            api.del("glas", {
                lag: 1, auto: true,
                fuld: function (g) {
                    LAB.reagensglas(g, RG[0], RG_TOP, RG_BUND, 30, "#f1cf45", 0.55);
                    LAB.reagensglas(g, RG[1], RG_TOP, RG_BUND, 30, "#3f7bd8", 0.55);
                    SV.tekst(g, RG[0], RG_BUND + 22, "citronsaft", { "font-size": 13, fill: F.svag });
                    SV.tekst(g, RG[1], RG_BUND + 22, "sæbevand", { "font-size": 13, fill: F.svag });
                    /* Bægerglasset, som elektroden står i */
                    LAB.baeger(g, BG.cx, BG.bund, BG.b, BG.h, { top: BG.bund - BG.h * 0.55, fyld: "#f6e3a8" });
                }
            });

            api.del("ind", {
                lag: 1,
                fuld: function (g) { return { f: LAB.draabeflaske(g, BF.x, BF.y, BF.b, BF.h, "BTB") }; },
                byg: function (g, r, an) { an.pop(r.f, 0, 450); }
            });

            api.del("meter", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g), x = PM.x, y = PM.y;
                    /* Kablet fra apparatet ned til elektroden i bægerglasset */
                    SV.el("path", { d: "M" + (x + PM.b - 16) + "," + (y + PM.h) + " C" + (x + PM.b) + "," + (y + PM.h + 40) + " " + (BG.cx - 30) + "," + (y - 24) + " " + BG.cx + "," + (y - 6),
                        fill: "none", stroke: "#3b4650", "stroke-width": 2.6, "stroke-linecap": "round" }, gg);
                    SV.el("rect", { x: BG.cx - 6, y: y - 8, width: 12, height: BG.bund - y - 14, rx: 5, fill: "#dfe6ec", stroke: "#6b7782", "stroke-width": 1.3 }, gg);
                    SV.el("ellipse", { cx: BG.cx, cy: BG.bund - 20, rx: 6, ry: 8, fill: "#eef3f7", stroke: "#6b7782", "stroke-width": 1.2 }, gg);
                    /* Selve apparatet med display og knapper */
                    SV.el("rect", { x: x, y: y, width: PM.b, height: PM.h, rx: 10, fill: "#eef2f5", stroke: "#5f6b75", "stroke-width": 1.5 }, gg);
                    SV.el("rect", { x: x + 12, y: y + 12, width: PM.b - 24, height: 34, rx: 5, fill: "#1c262c" }, gg);
                    SV.tekst(gg, x + PM.b / 2, y + 37, "4,2", { "font-size": 22, "font-weight": 700, fill: "#a8f5c8" });
                    [0, 1, 2].forEach(function (i) {
                        SV.el("circle", { cx: x + 30 + i * 32, cy: y + 61, r: 6, fill: "#c3cbd3", stroke: "#6b7782", "stroke-width": 1 }, gg);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

/* =====================================================================
   fig_konc.js - figuren til 6.1 Koncentration

   Øverst 9,0 g salt og 991 g vand, der giver 1000 g saltvand (bogens
   eksempel med 0,90 %), med en lup, der viser ionerne fordelt i vandet.
   I midten saltvandets etiket med masseprocenten, koncentrationen i mol/L
   og den samme koncentration skrevet med M. Nederst en målekolbe som i
   bogens figur maalekolbe og fortyndingen fra 100 mL til 300 mL som i
   bogens figur fortynding.
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var S = { x: 20, y: 50, b: 290, h: 160 };             /* saltet */
    var V = { x: 355, y: 50, b: 290, h: 160 };            /* vandet */
    var O = { x: 690, y: 50, b: 290, h: 160 };            /* saltvandet */
    function mid(k) { return k.x + k.b / 2; }

    var E = { x: 200, y: 258, b: 380, h: 192 };           /* etiketten */
    var LX = E.x + 34, LY = [329, 379, 429];              /* linjernes start og midte */
    var LS = { "font-size": 19, "font-weight": 600, "text-anchor": "start" };
    var L1 = "m%(NaCl) = 0,90 %", L2 = "c(NaCl) = 0,15 mol/L", L3 = "c(NaCl) = 0,15 ";
    function w(t) { return NK.tekstBredde(t, 19, 600); }
    var W1 = w(L1), W2 = w(L2), W3 = w(L3), WM = w("M");
    var MX = LX + W3;                                      /* bogstavet M */
    var SLOT2 = 765;                                       /* pladserne til etiketten */

    var MK = { x: 20, y: 478, b: 300, h: 190 };           /* maalekolben */
    var FA = { x: 368, y: 478, b: 236, h: 162 };          /* foer fortyndingen */
    var FE = { x: 732, y: 478, b: 236, h: 162 };          /* efter */
    var PIL = { x1: 612, x2: 724, y: 566 };                /* + 200 mL vand */
    var PM = (PIL.x1 + PIL.x2) / 2;
    var FBUND = 622;                                       /* bægerglassenes bund */

    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: mid(k), y: k.y + k.h, maal: [mid(k), k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }
    function linje(id, y, x1, b, dele, fejl) {
        return { id: id, ord: [id], x: SLOT2, y: y, maal: [x1 + b + 8, y], dele: dele,
            omr: [{ r: [x1 - 5, y - 16, b + 10, 32, 6] }], fejl: fejl };
    }

    /* Et bægerglas til fortyndingen: 20 enheder pr. 100 mL */
    function fortynding(g, k, efter) {
        LAB.kort(g, k.x, k.y, k.b, k.h);
        SV.tekst(g, k.x + 16, k.y + 24, efter ? "Efter" : "Før", { "font-size": 15, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
        var cx = k.x + 60, ml = efter ? 300 : 100;
        LAB.baeger(g, cx, FBUND, 86, 96, { top: FBUND - 2 - ml / 5, skala: [[FBUND - 22, "100"], [FBUND - 42, "200"], [FBUND - 62, "300"]] });
        var P = efter
            ? [[-28, -52], [-12, -56], [-2, -46], [-30, -34], [-14, -38], [2, -30], [-24, -16], [-6, -20], [8, -12], [-18, -6], [0, -4], [-32, -10]]
            : [[-36, -15], [-28, -15], [-20, -15], [-12, -15], [-4, -15], [4, -15], [-36, -7], [-28, -7], [-20, -7], [-12, -7], [-4, -7], [4, -7]];
        P.forEach(function (p) { SV.kugle(g, cx + p[0], FBUND + p[1] - 1, 3.8, "elektron"); });
        var tx = k.x + 118, t = { "font-size": 13.5, "text-anchor": "start" };
        SV.kugle(g, tx + 4, k.y + 62, 4.5, "elektron");
        SV.tekst(g, tx + 14, k.y + 67, "12 partikler", t);
        SV.tekst(g, tx, k.y + 94, efter ? "V_{efter} = 300 mL" : "V_{før} = 100 mL", t);
        SV.tekst(g, tx, k.y + 121, efter ? "c_{efter} = 0,10 M" : "c_{før} = 0,30 M", Object.assign({}, t, { "font-weight": 700, fill: F.teal }));
    }

    NK.FIGURER.konc = {
        vb: [1000, 700],
        lag: [
            { navn: "Salt i vand", pladser: ["opløst stof", "opløsningsmiddel", "opløsning"],
              ros: "Saltet kaldes det opløste stof, også før det er rørt ud i vandet. Vandet er opløsningsmidlet, og saltvandet er en opløsning." },
            { navn: "Hvor meget salt?", pladser: ["masseprocent", "stofmængdekoncentration", "molær"],
              ros: "Masseprocenten er saltets andel af massen. Koncentrationen er mol pr. liter, og M læses molær." },
            { navn: "Fremstil og fortynd", pladser: ["målekolbe", "fortynde"],
              ros: "I en målekolbe fyldes der vand på til mærket. Ved en fortynding er stofmængden den samme, men koncentrationen falder." }
        ],
        pladser: [
            /* ----- Lag 1: salt og vand giver saltvand ------------------------- */
            skilt("opløst stof", S, ["salt"], {
                opløsningsmiddel: "<b>opløsningsmiddel</b> er væsken, som noget røres ud i. Kortet viser saltet, der skal røres ud.",
                opløsning: "<b>opløsning</b> er hele blandingen af salt og vand. Kortet viser kun saltet." }),
            skilt("opløsningsmiddel", V, ["vand"], {
                "opløst stof": "<b>opløst stof</b> er det, der røres ud, her saltet. Kortet viser væsken, som saltet røres ud i.",
                opløsning: "<b>opløsning</b> er hele blandingen af salt og vand. Kortet viser kun vandet." }),
            skilt("opløsning", O, ["saltvand"], {
                "opløst stof": "<b>opløst stof</b> er kun saltet. Kortet viser hele blandingen, hvor saltet har fordelt sig i vandet.",
                opløsningsmiddel: "<b>opløsningsmiddel</b> er kun vandet. Kortet viser hele blandingen, hvor saltet har fordelt sig i vandet." }),

            /* ----- Lag 2: etiketten ------------------------------------------- */
            linje("masseprocent", LY[0], LX, W1, ["mp"], {
                stofmængdekoncentration: "<b>stofmængdekoncentration</b> er mol pr. liter. Linjen viser, hvor mange procent af massen der er salt.",
                molær: "<b>molær</b> er bogstavet M. Linjen viser, hvor mange procent af massen der er salt." }),
            linje("stofmængdekoncentration", LY[1], LX, W2, ["c"], {
                masseprocent: "<b>masseprocent</b> er saltets andel af massen. Linjen viser antallet af mol salt i én liter.",
                molær: "<b>molær</b> er kun bogstavet M. Pladsen peger på hele størrelsen c med enheden mol/L." }),
            linje("molær", LY[2], MX, WM, ["m"], {
                stofmængdekoncentration: "<b>stofmængdekoncentration</b> er hele størrelsen c. Pladsen peger kun på bogstavet M, der står i stedet for mol/L.",
                masseprocent: "<b>masseprocent</b> er en andel af massen i procent. Pladsen peger kun på bogstavet M." }),

            /* ----- Lag 3: maalekolben og fortyndingen ------------------------- */
            skilt("målekolbe", MK, ["kolbe"], {
                opløsning: "<b>opløsning</b> er væsken i kolben. Skiltet spørger om navnet på selve glasset med mærket på halsen.",
                fortynde: "<b>fortynde</b> er at hælde mere vand i. Skiltet spørger om navnet på glasset med mærket på halsen." }),
            { id: "fortynde", ord: ["fortynde"], x: PM, y: MK.y + MK.h, maal: [PM, PIL.y + 16], dele: ["fort"],
              omr: [{ r: [PIL.x1 - 6, FA.y + 26, PIL.x2 - PIL.x1 + 12, PIL.y + 10 - (FA.y + 26), 8] }],
              fejl: { målekolbe: "<b>målekolbe</b> er et glas med et mærke på halsen. Pladsen peger på pilen, hvor der hældes 200 mL vand i.",
                      opløsningsmiddel: "<b>opløsningsmiddel</b> er væsken i en opløsning. Pladsen spørger om det, der sker ved pilen.",
                      stofmængdekoncentration: "<b>stofmængdekoncentration</b> står i kortene som c. Pladsen spørger om det, der sker ved pilen." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1 ------------------------------------------------------ */
            api.del("salt", {
                lag: 0,
                fuld: function (g) {
                    LAB.kort(g, S.x, S.y, S.b, S.h);
                    SV.tekst(g, mid(S), S.y + 30, "9,0 g salt, NaCl", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    var x = mid(S), y = S.y + 118;
                    /* Urglasset */
                    SV.el("path", { d: "M" + (x - 62) + "," + y + " Q" + x + "," + (y + 30) + " " + (x + 62) + "," + y + " Q" + x + "," + (y + 21) + " " + (x - 62) + "," + y + " Z",
                        fill: "#e8eef3", stroke: LAB.KANT, "stroke-width": 1.4 }, g);
                    /* Bunken af salt */
                    var b = SV.g(g);
                    SV.el("path", { d: "M" + (x - 40) + "," + (y + 9) + " C" + (x - 30) + "," + (y - 4) + " " + (x - 16) + "," + (y - 34) + " " + x + "," + (y - 35) +
                        " C" + (x + 16) + "," + (y - 34) + " " + (x + 30) + "," + (y - 4) + " " + (x + 40) + "," + (y + 9) + " Q" + x + "," + (y + 16) + " " + (x - 40) + "," + (y + 9) + " Z",
                        fill: "#fbfcfd", stroke: "#98a4ab", "stroke-width": 1.1 }, b);
                    [[-14, -8], [8, -20], [18, -2], [-4, -26], [-24, 2], [2, -6]].forEach(function (p) {
                        SV.el("rect", { x: x + p[0] - 2, y: y + p[1] - 2, width: 4, height: 4, fill: "#e3e9ee", stroke: "#b6c0c8", "stroke-width": 0.5 }, b);
                    });
                    return { b: b };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.b, 200, 450); }
            });

            api.del("vand", {
                lag: 0,
                fuld: function (g) {
                    LAB.kort(g, V.x, V.y, V.b, V.h);
                    SV.tekst(g, mid(V), V.y + 30, "991 g vand, H_2O", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    var r = LAB.baeger(g, mid(V), V.y + 136, 84, 80, { top: V.y + 76 });
                    return { v: r.v };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.fade(r.v, 200, 500); }
            });

            api.del("saltvand", {
                lag: 0,
                fuld: function (g) {
                    LAB.kort(g, O.x, O.y, O.b, O.h);
                    SV.tekst(g, mid(O), O.y + 30, "1000 g saltvand", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    var bx = O.x + 76, r = LAB.baeger(g, bx, O.y + 136, 84, 80, { top: O.y + 76 });
                    var zx = O.x + 214, zy = O.y + 92;
                    LAB.lup(g, zx, zy, 46, [bx + 10, O.y + 108]);
                    var ioner = SV.g(g);
                    SV.el("circle", { cx: zx, cy: zy, r: 43, fill: LAB.VAND, "fill-opacity": 0.55 }, ioner);
                    LAB.cl(ioner, zx - 22, zy - 20, 10);
                    LAB.na(ioner, zx + 14, zy - 25, 7.5);
                    LAB.cl(ioner, zx + 24, zy + 6, 10);
                    LAB.na(ioner, zx - 16, zy + 13, 7.5);
                    LAB.cl(ioner, zx + 2, zy + 30, 10);
                    LAB.na(ioner, zx - 2, zy - 2, 7.5);
                    return { v: r.v, i: ioner };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.i, 250, 500); }
            });

            api.del("tegn", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.tekst(g, (S.x + S.b + V.x) / 2, S.y + 90, "+", { "font-size": 30, fill: F.svag });
                    LAB.pil(g, V.x + V.b + 6, O.x - 6, S.y + 80);
                }
            });

            /* ----- Lag 2: etiketten ------------------------------------------- */
            api.del("etiket", {
                lag: 1, auto: true,
                fuld: function (g) {
                    LAB.kort(g, E.x, E.y, E.b, E.h, { fyld: "#ffffff" });
                    SV.el("path", { d: "M" + E.x + "," + (E.y + 36) + " L" + E.x + "," + (E.y + 14) + " Q" + E.x + "," + E.y + " " + (E.x + 14) + "," + E.y +
                        " L" + (E.x + E.b - 14) + "," + E.y + " Q" + (E.x + E.b) + "," + E.y + " " + (E.x + E.b) + "," + (E.y + 14) + " L" + (E.x + E.b) + "," + (E.y + 36) + " Z", fill: F.teal }, g);
                    SV.tekst(g, mid(E), E.y + 25, "Etiket på saltvandet", { "font-size": 16, "font-weight": 700, fill: "#ffffff" });
                }
            });

            function tekstDel(id, y, tekst) {
                api.del(id, {
                    lag: 1,
                    fuld: function (g) { return { t: SV.tekst(g, LX, y + 6.5, tekst, Object.assign({}, LS, { fill: F.teal })) }; },
                    byg: function (g, r, an) { an.fade(r.t, 0, 450); }
                });
            }
            tekstDel("mp", LY[0], L1);
            tekstDel("c", LY[1], L2);
            api.del("m", {
                lag: 1,
                fuld: function (g) {
                    SV.tekst(g, LX, LY[2] + 6.5, L3, Object.assign({}, LS, { fill: F.teal }));
                    return { m: SV.tekst(g, MX, LY[2] + 6.5, "M", Object.assign({}, LS, { fill: F.teal, "font-weight": 800 })) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.m, 200, 450); }
            });

            /* ----- Lag 3: maalekolben og fortyndingen ------------------------- */
            api.del("kolbe", {
                lag: 2,
                fuld: function (g) {
                    LAB.kort(g, MK.x, MK.y, MK.b, MK.h);
                    var cx = mid(MK) - 20;
                    var k = LAB.maalekolbe(g, cx, MK.y + 168, { fyld: LAB.VAND, tekst: "500 mL", hoejde: 140 });
                    SV.el("line", { x1: cx + 12, y1: k.maerke, x2: cx + 52, y2: k.maerke - 10, stroke: "#6b7782", "stroke-width": 1.1 }, g);
                    SV.tekst(g, cx + 56, k.maerke - 6, "mærket", { "font-size": 13, fill: F.svag, "text-anchor": "start" });
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("glassene", {
                lag: 2, auto: true,
                fuld: function (g) { fortynding(g, FA, false); fortynding(g, FE, true); }
            });

            api.del("fort", {
                lag: 2,
                fuld: function (g) {
                    /* En vanddraabe, teksten og pilen */
                    var dy = FA.y + 40;
                    SV.el("path", { d: "M" + PM + "," + (dy - 12) + " C" + (PM + 4) + "," + (dy - 4) + " " + (PM + 9) + "," + (dy + 2) + " " + (PM + 9) + "," + (dy + 7) +
                        " A9,9 0 0,1 " + (PM - 9) + "," + (dy + 7) + " C" + (PM - 9) + "," + (dy + 2) + " " + (PM - 4) + "," + (dy - 4) + " " + PM + "," + (dy - 12) + " Z",
                        fill: "#8fc1ea", stroke: "#3d7bb8", "stroke-width": 1.1 }, g);
                    SV.tekst(g, PM, PIL.y - 14, "+ 200 mL vand", { "font-size": 13.5, "font-weight": 700 });
                    return { p: LAB.pil(g, PIL.x1, PIL.x2, PIL.y, { farve: F.teal, bredde: 3 }) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.p, 200, 450); }
            });
        }
    };
}());

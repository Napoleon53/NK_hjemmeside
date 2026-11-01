/* =====================================================================
   fig_titrering.js - figuren til 6.3 Titrering

   Til venstre tre kort om saltet i chips: er der salt (en prøve med et
   hvidt bundfald), hvor meget (1,40 %) og sammenligningen med posen
   (bogens eksempel med 1,3 % og 8 %) som en superberegning med formlen
   først (brugeren 1. nov. 2026). Venstresiden er ordet afvigelse, som er
   pladsen; i den grå udgave står der en streg i stedet, så ordet ikke
   afslører pladsen. Til højre opstillingen som i
   bogens figur titrering-opstilling med en dråbeflaske med indikator ved
   kolben. Nederst Mohrtitreringen i tre trin som i bogens figur
   mohr-trin, med kolben og en lup ved hvert trin.
   Ni fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var A = [{ x: 25, y: 30, b: 440, h: 100 }, { x: 25, y: 160, b: 440, h: 100 }, { x: 25, y: 290, b: 440, h: 208 }];
    var ST = { x: 500, y: 30, b: 475, h: 394 };             /* opstillingen */
    var BX = 640, BTOP = 50, BBUND = 290;                   /* buretten */
    var KX = 640, KBUND = 382, KH = 72;                     /* kolben */
    var DF = { x: 706, y: 326, b: 28, h: 64 };              /* draabeflasken */
    var SLOTX = 862;

    var DY = 68;                                            /* Mohrtitreringen er rykket ned under afvigelsen */
    var MF = { x: 25, y: 470 + DY, b: 690, h: 255 };        /* Mohrtitreringen */
    var PX = [140, 370, 600], PT = 506 + DY, PBUND = 584 + DY, PH = 62, LY = 660 + DY, LR = 57;

    function mid(k) { return k.x + k.b / 2; }
    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: mid(k), y: k.y + k.h, maal: [mid(k), k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }
    var TXT = { "text-anchor": "start" };
    function t(o) { return Object.assign({}, TXT, o); }

    /* En kolbe i Mohrtitreringen med luppen under */
    function trin(g, i, titel, fyld, lupIndhold, kunKolbe, kunLup) {
        var x = PX[i];
        if (!kunLup) {
            SV.tekst(g, x, PT, titel, { "font-size": 15, "font-weight": 700, fill: F.tekst });
            var k = LAB.erlenmeyer(g, x, PBUND, PH, { fyld: fyld, niveau: 0.42, magnet: true });
            if (i === 1) [[-12, -10], [4, -6], [14, -14], [-4, -16], [-18, -6], [10, -4]].forEach(function (p) {
                SV.el("circle", { cx: x + p[0], cy: PBUND + p[1], r: 1.8, fill: "#ffffff", stroke: "#c3ccd4", "stroke-width": 0.5 }, g);
            });
            if (kunKolbe) return k;
        }
        var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
        SV.el("line", Object.assign({ x1: x - 26, y1: PBUND - 10, x2: x - LR + 6, y2: LY - 20 }, s), g);
        SV.el("line", Object.assign({ x1: x + 26, y1: PBUND - 10, x2: x + LR - 6, y2: LY - 20 }, s), g);
        SV.el("circle", { cx: x, cy: LY, r: LR, fill: "#eef5fb", stroke: "#5f7488", "stroke-width": 2.4, filter: "url(#skygge)" }, g);
        lupIndhold(g, x, LY);
    }

    NK.FIGURER.titrering = {
        vb: [1000, 808],
        lag: [
            { navn: "Hvad og hvor meget?", pladser: ["kvalitativ analyse", "kvantitativ analyse", "afvigelse"],
              ros: "Den kvalitative analyse viser, at der er salt, og den kvantitative hvor meget. Afvigelsen sammenligner med posen." },
            { navn: "Opstillingen", pladser: ["titrering", "burette", "indikator"],
              ros: "Opløsningen med kendt koncentration dryppes fra buretten. Indikatoren i kolben viser, hvornår der skal stoppes." },
            { navn: "Mohrtitrering", pladser: ["Mohrtitrering", "omslag", "ækvivalenspunkt"],
              ros: "Sølv(I)ionerne fælder chloridionerne. Når alt chlorid har reageret, er ækvivalenspunktet nået, og farven slår om." }
        ],
        pladser: [
            /* ----- Lag 1: de tre kort ----------------------------------------- */
            skilt("kvalitativ analyse", A[0], ["kval"], {
                "kvantitativ analyse": "<b>kvantitativ analyse</b> finder, hvor meget der er. Kortet spørger kun, om der er salt.",
                titrering: "<b>titrering</b> er en metode til at måle en mængde. Kortet spørger kun, om der er salt." }),
            skilt("kvantitativ analyse", A[1], ["kvant"], {
                "kvalitativ analyse": "<b>kvalitativ analyse</b> finder, hvad en prøve indeholder. Kortet spørger, hvor meget salt der er.",
                afvigelse: "<b>afvigelse</b> sammenligner to tal. Kortet spørger, hvor meget salt der er i chipsene." }),
            skilt("afvigelse", A[2], ["afv"], {
                "kvantitativ analyse": "<b>kvantitativ analyse</b> finder, hvor meget der er. Kortet sammenligner det målte tal med tallet på posen.",
                "kvalitativ analyse": "<b>kvalitativ analyse</b> finder, hvad en prøve indeholder. Kortet sammenligner to tal i procent." }),

            /* ----- Lag 2: opstillingen ---------------------------------------- */
            skilt("titrering", ST, ["st"], {
                Mohrtitrering: "<b>Mohrtitrering</b> er én bestemt titrering, der måler salt. Kortet viser opstillingen til alle titreringer.",
                burette: "<b>burette</b> er kun glasrøret med hanen. Skiltet gælder hele opstillingen." }),
            { id: "burette", ord: ["burette"], x: SLOTX, y: 129, maal: [BX + 17, 129], dele: ["bur"],
              omr: [{ r: [BX - 13, BTOP - 4, 26, BBUND + 40 - BTOP, 8] }],
              fejl: { indikator: "<b>indikator</b> er et stof, der skifter farve. Pladsen peger på det lange glasrør med inddeling og hane.",
                      titrering: "<b>titrering</b> er hele metoden. Pladsen peger kun på det lange glasrør med inddeling og hane." } },
            { id: "indikator", ord: ["indikator"], x: SLOTX, y: DF.y + 22, maal: [DF.x + DF.b + 8, DF.y + 22], dele: ["ind"],
              omr: [{ r: [DF.x - 5, DF.y - 22, DF.b + 10, DF.h + 26, 8] }],
              fejl: { burette: "<b>burette</b> er det lange glasrør. Pladsen peger på dråbeflasken ved kolben.",
                      omslag: "<b>omslag</b> er selve farveskiftet. Pladsen peger på dråbeflasken med stoffet, der skifter farve." } },

            /* ----- Lag 3: Mohrtitreringen ------------------------------------- */
            /* Overskriften staar midt paa rammen. Rammen er symmetrisk om de tre
               trin, saa den laeses som overskrift for dem alle. Mellem Foer og Under
               stod den lige under pladsen afvigelse (proevet 1. nov. 2026) */
            { id: "Mohrtitrering", ord: ["Mohrtitrering"], x: mid(MF), y: MF.y, maal: [mid(MF), MF.y], titel: true, dele: ["mf"],
              omr: [{ r: [MF.x - 6, MF.y - 6, MF.b + 12, MF.h + 12, 18], tom: true }],
              fejl: { titrering: "<b>titrering</b> passer på alle titreringer. Rammen viser den med sølv(I)ioner og chloridioner, som har sit eget navn.",
                      omslag: "<b>omslag</b> er kun farveskiftet til sidst. Rammen viser hele analysen af salt med sølv(I)nitrat." } },
            { id: "omslag", ord: ["omslag"], x: SLOTX - 4, y: PBUND - 26, maal: [PX[2] + 42, PBUND - 26], dele: ["k3"],
              omr: [{ r: [PX[2] - 38, PBUND - PH - 8, 76, PH + 14, 10] }],
              fejl: { ækvivalenspunkt: "<b>ækvivalenspunkt</b> er øjeblikket, hvor alt chlorid har reageret. Pladsen peger på farven, man ser i kolben.",
                      indikator: "<b>indikator</b> er stoffet, der skifter farve. Pladsen peger på selve farveskiftet i kolben." } },
            { id: "ækvivalenspunkt", ord: ["ækvivalenspunkt"], x: SLOTX - 4, y: LY, maal: [PX[2] + LR + 6, LY], dele: ["l3"],
              omr: [{ c: [PX[2], LY, LR + 4] }],
              fejl: { omslag: "<b>omslag</b> er farveskiftet, man ser i kolben. Luppen viser, at alt chlorid netop har reageret.",
                      indikator: "<b>indikator</b> er stoffet, der skifter farve. Luppen viser øjeblikket, hvor alt chlorid har reageret." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: kortene --------------------------------------------- */
            api.del("kval", {
                lag: 0,
                fuld: function (g) {
                    var k = A[0];
                    LAB.kort(g, k.x, k.y, k.b, k.h);
                    SV.tekst(g, k.x + 24, k.y + 32, "Er der salt i chipsene?", t({ "font-size": 17, "font-weight": 700 }));
                    SV.tekst(g, k.x + 24, k.y + 60, "Ja: sølv(I)nitrat giver et hvidt bundfald.", t({ "font-size": 14.5, fill: F.svag }));
                    /* Et reagensglas med det hvide bundfald */
                    var x = k.x + k.b - 40, top = k.y + 14, bund = k.y + 84;
                    var d = "M" + (x - 10) + "," + top + " L" + (x - 10) + "," + (bund - 10) + " A10,10 0 0,0 " + (x + 10) + "," + (bund - 10) + " L" + (x + 10) + "," + top;
                    SV.el("path", { d: "M" + (x - 9) + "," + (top + 26) + " L" + (x - 9) + "," + (bund - 10) + " A9,9 0 0,0 " + (x + 9) + "," + (bund - 10) + " L" + (x + 9) + "," + (top + 26) + " Z", fill: "#eef2f5" }, g);
                    SV.el("path", { d: "M" + (x - 9) + "," + (bund - 18) + " L" + (x - 9) + "," + (bund - 10) + " A9,9 0 0,0 " + (x + 9) + "," + (bund - 10) + " L" + (x + 9) + "," + (bund - 18) + " Z", fill: "#ffffff", stroke: "#c3ccd4", "stroke-width": 0.8 }, g);
                    SV.el("path", { d: d, fill: "none", stroke: LAB.KANT, "stroke-width": 1.6 }, g);
                    SV.el("line", { x1: x - 13, y1: top, x2: x + 13, y2: top, stroke: LAB.KANT, "stroke-width": 2, "stroke-linecap": "round" }, g);
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });

            api.del("kvant", {
                lag: 0,
                fuld: function (g) {
                    var k = A[1];
                    LAB.kort(g, k.x, k.y, k.b, k.h);
                    SV.tekst(g, k.x + 24, k.y + 32, "Hvor meget salt er der i chipsene?", t({ "font-size": 17, "font-weight": 700 }));
                    return { t: SV.tekst(g, k.x + 24, k.y + 70, "1,40 % salt", t({ "font-size": 26, "font-weight": 800, fill: F.teal })) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.t, 200, 450); }
            });

            /* Afvigelsen som superberegning: formlen, tallene og resultatet med
               lighedstegnene under hinanden og rigtige brøkstreger */
            api.del("afv", {
                lag: 0,
                fuld: function (g) {
                    var k = A[2], graa = g.getAttribute("class") === "spoeg";
                    LAB.kort(g, k.x, k.y, k.b, k.h);
                    SV.tekst(g, k.x + 24, k.y + 30, "På posen står 1,3 %. Målt: 1,40 %.", t({ "font-size": 17, "font-weight": 700 }));
                    var fs = 15.5, a = t({ "font-size": fs });
                    var x0 = k.x + 24, vb = NK.tekstBredde("afvigelse", fs, 400), eq = x0 + vb + 8, x1 = eq + NK.tekstBredde("= ", fs, 400);
                    function broek(x, yc, over, under) {
                        var b = Math.max(NK.tekstBredde(over, fs, 400), NK.tekstBredde(under, fs, 400)) + 8;
                        SV.tekst(g, x + b / 2, yc - 6, over, { "font-size": fs });
                        SV.el("line", { x1: x, y1: yc, x2: x + b, y2: yc, stroke: F.tekst, "stroke-width": 1.3 }, g);
                        SV.tekst(g, x + b / 2, yc + 17, under, { "font-size": fs });
                        return x + b;
                    }
                    var y1 = k.y + 68, y2 = k.y + 120, y3 = k.y + 166;
                    /* Venstresiden: ordet, når pladsen er løst, ellers en streg */
                    if (graa) SV.el("line", { x1: x0, y1: y1 + 6, x2: x0 + vb, y2: y1 + 6, stroke: F.svag, "stroke-width": 1.4 }, g);
                    else SV.tekst(g, x0, y1 + 5, "afvigelse", a);
                    [y1, y2].forEach(function (y) { SV.tekst(g, eq, y + 5, "=", a); });
                    var e1 = broek(x1, y1, "målt værdi − forventet værdi", "forventet værdi");
                    SV.tekst(g, e1 + 5, y1 + 5, "· 100 %", a);
                    var e2 = broek(x1, y2, "1,40 % − 1,3 %", "1,3 %");
                    SV.tekst(g, e2 + 5, y2 + 5, "· 100 %", a);
                    SV.tekst(g, eq, y3, "=", a);
                    return { t: SV.tekst(g, x1, y3, "8 %", t({ "font-size": 18, "font-weight": 800, fill: F.teal })) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.t, 200, 450); }
            });

            /* ----- Lag 2: opstillingen ---------------------------------------- */
            api.del("st", {
                lag: 1,
                fuld: function (g) {
                    LAB.kort(g, ST.x, ST.y, ST.b, ST.h);
                    /* Stativet: fod, stang og klemme */
                    SV.el("rect", { x: 520, y: 392, width: 222, height: 10, rx: 3, fill: "#3f474e" }, g);
                    SV.el("rect", { x: 544, y: 48, width: 8, height: 346, rx: 3, fill: "#aab4be", stroke: "#7d8892", "stroke-width": 1 }, g);
                    SV.el("rect", { x: 548, y: 96, width: BX - 548 - 10, height: 7, rx: 2, fill: "#aab4be", stroke: "#7d8892", "stroke-width": 1 }, g);
                    SV.el("rect", { x: 538, y: 90, width: 20, height: 19, rx: 3, fill: "#3f474e" }, g);
                    /* Magnetomroereren og kolben med proeven */
                    SV.el("rect", { x: KX - 50, y: KBUND, width: 100, height: 11, rx: 3, fill: "#e3e8ec", stroke: "#8a949e", "stroke-width": 1.1 }, g);
                    SV.el("circle", { cx: KX + 34, cy: KBUND + 5.5, r: 3.5, fill: "#3f474e" }, g);
                    LAB.erlenmeyer(g, KX, KBUND, KH, { fyld: "#eef3e2", niveau: 0.4, magnet: true });
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("bur", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("rect", { x: BX - 9, y: BTOP + 16, width: 18, height: BBUND - BTOP - 16, fill: "#e9eef3" }, gg);
                    SV.el("rect", { x: BX - 10, y: BTOP, width: 20, height: BBUND - BTOP, rx: 3, fill: "url(#glas)", "fill-opacity": 0.5, stroke: LAB.KANT, "stroke-width": 1.6 }, gg);
                    for (var i = 0; i <= 20; i++) {
                        var y = BTOP + 16 + i * 10.5, lang = i % 4 === 0;
                        SV.el("line", { x1: BX - 10, y1: y, x2: BX - (lang ? 1 : 5), y2: y, stroke: "#6b7782", "stroke-width": 0.9 }, gg);
                        if (lang) SV.tekst(gg, BX + 4, y + 3, String(i / 4 * 10), { "font-size": 7.5, fill: "#3b4650", "text-anchor": "start", "font-weight": 700 });
                    }
                    /* Klemmen, hanen og spidsen */
                    SV.el("rect", { x: BX - 13, y: 90, width: 26, height: 19, rx: 3, fill: "#3f474e" }, gg);
                    SV.el("rect", { x: BX - 7, y: BBUND, width: 14, height: 18, rx: 2, fill: "#e3e8ec", stroke: LAB.KANT, "stroke-width": 1.2 }, gg);
                    SV.el("rect", { x: BX + 7, y: BBUND + 6, width: 20, height: 6, rx: 3, fill: "#4a8fd6", stroke: "#2f5f94", "stroke-width": 1 }, gg);
                    SV.el("path", { d: "M" + (BX - 4) + "," + (BBUND + 18) + " L" + (BX - 1.5) + "," + (BBUND + 36) + " L" + (BX + 1.5) + "," + (BBUND + 36) + " L" + (BX + 4) + "," + (BBUND + 18) + " Z", fill: "#e9eef3", stroke: LAB.KANT, "stroke-width": 1 }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            api.del("ind", {
                lag: 1,
                fuld: function (g) {
                    var x = DF.x, y = DF.y, b = DF.b, h = DF.h, cx = x + b / 2;
                    var gg = SV.g(g);
                    SV.el("rect", { x: x, y: y + 18, width: b, height: h - 18, rx: 6, fill: "#9a6a3c", stroke: "#5e3d1d", "stroke-width": 1.2 }, gg);
                    SV.el("rect", { x: x + 4, y: y + 32, width: b - 8, height: 18, rx: 2, fill: "#ffffff" }, gg);
                    SV.el("rect", { x: cx - 5, y: y + 10, width: 10, height: 9, fill: "#f2f2f2", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
                    SV.el("path", { d: "M" + (cx - 5) + "," + (y + 11) + " L" + (cx - 5) + "," + (y - 6) + " Q" + cx + "," + (y - 14) + " " + (cx + 5) + "," + (y - 6) + " L" + (cx + 5) + "," + (y + 11) + " Z", fill: "#c94a3c", stroke: "#8e2d22", "stroke-width": 1 }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 3: Mohrtitreringen --------------------------------------- */
            api.del("mf", {
                lag: 2,
                fuld: function (g) {
                    var r = LAB.ramme(g, MF.x, MF.y, MF.b, MF.h, { fyld: "#f7f9fb", kant: "#c5d1dc" });
                    trin(g, 0, "Før", LAB.GULGROEN, function (gg, x, y) {
                        LAB.cl(gg, x - 24, y - 26, 10); LAB.cl(gg, x + 6, y - 30, 10); LAB.cl(gg, x - 30, y + 14, 10); LAB.cl(gg, x + 26, y + 22, 10);
                        LAB.pille(gg, x + 18, y - 4); LAB.pille(gg, x - 4, y + 30);
                    });
                    trin(g, 1, "Under", LAB.GULGROEN, function (gg, x, y) {
                        LAB.cl(gg, x - 28, y - 22, 10); LAB.cl(gg, x + 26, y - 20, 10);
                        LAB.ag(gg, x, y - 34, 9);
                        SV.el("line", { x1: x, y1: y - 49, x2: x, y2: y - 45, stroke: "#3b4650", "stroke-width": 1.2 }, gg);
                        LAB.pille(gg, x - 18, y - 2); LAB.pille(gg, x + 20, y + 2);
                        LAB.agcl(gg, x - 20, y + 24, 16); LAB.agcl(gg, x, y + 24, 16); LAB.agcl(gg, x + 20, y + 24, 16);
                    });
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            api.del("k3", {
                lag: 2,
                fuld: function (g) {
                    var k = trin(g, 2, "Til sidst", LAB.LYSEROED, null, true);
                    [[-12, -10], [4, -6], [14, -14], [-4, -16], [-18, -6], [10, -4]].forEach(function (p) {
                        SV.el("circle", { cx: PX[2] + p[0], cy: PBUND + p[1], r: 1.8, fill: "#f8d8e4", stroke: "#e39ab6", "stroke-width": 0.5 }, g);
                    });
                    return { k: k.g };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("l3", {
                lag: 2,
                fuld: function (g) {
                    trin(g, 2, "", null, function (gg, x, y) {
                        LAB.ag(gg, x + 2, y - 34, 9);
                        LAB.agcl(gg, x - 25.5, y + 22, 16); LAB.agcl(gg, x - 8.5, y + 22, 16); LAB.agcl(gg, x + 8.5, y + 22, 16); LAB.agcl(gg, x + 25.5, y + 22, 16);
                        LAB.agcl(gg, x - 17, y + 3, 16); LAB.agcl(gg, x + 17, y + 3, 16);
                        LAB.pille(gg, x - 17, y - 11, true); LAB.pille(gg, x + 17, y - 11, true);
                    }, false, true);
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

/* =====================================================================
   fig_binding.js - figuren til 3.1 Elektronparbindinger

   Øverst natriumchlorid og dichlor side om side, som i bogens
   begyndelse af kapitlet: et metal og et ikke-metal danner ioner, to
   ikke-metaller deler elektroner. Over kortene står, hvad stoffet er
   (ionforbindelse er gråt fra kapitel 2, molekyle er en plads). Under
   kortene peger ionbinding på pilene mellem ionerne, og parret
   "elektronparbinding eller fælles elektronpar" på de to elektroner
   mellem Cl-atomerne. Brugeren 1. nov. 2026: "en elektronparbinding =
   fælles elektronpar", og det var forvirrende at have elektronparbinding
   som overskrift. Ionbinding er en plads igen ("der må gerne være lidt
   repeterende øvelser").
   Nederst vand, carbondioxid og dinitrogen som elektronprikformel og
   stregformel i to rækker som bogens figurer prik-streg-vand og
   dobbelt-tripel. Elektronerne fra hydrogen er grønne som i bogen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    /* Kortene staar et stykke nede, fordi bakken i den svaere udgave med ti
       lange ord fylder tre raekker og ellers daekker skiltene oeverst */
    var KN = { x: 100, y: 66, b: 280, h: 160 };    /* kortet med NaCl */
    var KC = { x: 520, y: 66, b: 280, h: 160 };    /* kortet med Cl₂ */
    var AY = 166;                                   /* atomernes midte */
    var NA = KN.x + 80, CLN = KN.x + 200;           /* Na⁺ og Cl⁻ */
    var PIL1 = NA + 30, PIL2 = CLN - 38 - 6, PILM = (PIL1 + PIL2) / 2;   /* pilene mellem ionerne */
    var CL1 = 628, CL2 = 692, CLR = 38, PARX = 660; /* dichlor */
    var BIND1_Y = 272;                              /* pladserne under kortene */

    var CX = [382, 627, 872];                       /* kolonnerne: vand, CO₂, N₂ */
    var PY = 404, SY = 505;                         /* raekkernes midte */
    var RX = 240;                                   /* raekkernes venstre kant */
    var RAEKKE_P = [RX, 354, 990 - RX, 96];         /* raekken med prikformler */
    var RAEKKE_S = [RX, 474, 990 - RX, 62];         /* raekken med stregformler */
    var BOKS_Y = 620;                               /* pladserne til bindingerne */

    /* Pladsernes bredde (som i motoren), saa de givne skilte er lige saa brede */
    function bredde(ord) {
        var b = 120;
        ord.forEach(function (o) { b = Math.max(b, NK.tekstBredde(o, 18, 700) + 28); });
        return Math.ceil(b);
    }

    /* Et skilt med et ord fra kapitel 2, der staar der i forvejen */
    function givet(g, x, y, tekst, B) {
        SV.el("rect", { x: x - B / 2, y: y - 17, width: B, height: 34, rx: 8, fill: "#ffffff", stroke: "#b9c6cf", "stroke-width": 1.5 }, g);
        SV.tekst(g, x, y + 6.3, tekst, { "font-size": 18, "font-weight": 700, fill: "#6b7782" });
    }

    function sym(g, x, y, s) { return SV.tekst(g, x, y + 11, s, { "font-size": 30, "font-weight": 700 }); }
    function prik(g, x, y, slags) { return SV.kugle(g, x, y, 4.6, slags); }
    /* To elektroner over hinanden (et lodret par) eller ved siden af hinanden */
    function lodret(g, x, y, a, b) { prik(g, x, y - 7, a); prik(g, x, y + 7, b || a); }
    function vandret(g, x, y, a) { prik(g, x - 7, y, a); prik(g, x + 7, y, a); }

    function streger(g, x1, x2, y, n, farve, bredde) {
        var gg = SV.g(g);
        var d = n === 1 ? [0] : (n === 2 ? [-4, 4] : [-7, 0, 7]);
        d.forEach(function (dy) {
            SV.el("line", { x1: x1, y1: y + dy, x2: x2, y2: y + dy, stroke: farve || F.tekst, "stroke-width": bredde || 3, "stroke-linecap": "round" }, gg);
        });
        return gg;
    }

    /* Bindingerne, der spoerges om i lag 3, og de faelles elektronpar til dem */
    var BIND = {
        enkelt: { x1: 398, x2: 427, n: 1, par: [415 - 9, PY - 16, 18, 32] },
        dobbelt: { x1: 643, x2: 681, n: 2, par: [662 - 16, PY - 16, 32, 32] },
        tripel: { x1: 852, x2: 892, n: 3, par: [872 - 16, PY - 23, 32, 46] }
    };
    function bindFelt(b) { var h = b.n * 8 + 16; return [b.x1 - 4, SY - h / 2, b.x2 - b.x1 + 8, h, 6]; }
    function bindMaal(b) { var h = b.n * 8 + 16; return [(b.x1 + b.x2) / 2, SY + h / 2 + 2]; }

    /* Fejltekster til parret med de to navne for elektronparret mellem Cl-atomerne */
    var PARFEJL = {
        ionbinding: "<b>ionbinding</b> er tiltrækningen mellem ioner med modsat ladning. De to Cl-atomer er ikke ioner, men deler to elektroner.",
        molekyle: "<b>molekyle</b> er hele partiklen med begge atomer. Pladsen peger kun på de to elektroner i midten.",
        "frit elektronpar": "<b>frit elektronpar</b> er ikke med i en binding. De to elektroner i midten hører til begge atomer.",
        enkeltbinding: "<b>enkeltbinding</b> passer også på Cl₂, men ordet skal sidde nederst, hvor stregerne tælles. Her spørges om navnet på de to elektroner i midten."
    };

    var TAEL = function (n) { return "Tæl stregerne mellem de to atomer, pladsen peger på. Antallet af streger er " + n + "."; };

    NK.FIGURER.binding = {
        vb: [1000, 660],
        lag: [
            { navn: "Tiltrække eller dele", pladser: ["ionbinding", "elektronparbinding", "fælles elektronpar", "molekyle"],
              ros: "Na⁺ og Cl⁻ trækker i hinanden i en ionbinding. To ikke-metaller deler i stedet et elektronpar, og atomerne danner et molekyle." },
            { navn: "Prikker og streger", pladser: ["elektronprikformel", "stregformel", "frit elektronpar"],
              ros: "Prikkerne viser elektronerne i yderste skal. I stregformlen er hvert fælles elektronpar en streg." },
            { navn: "Enkelt, dobbelt, tripel", pladser: ["enkeltbinding", "dobbeltbinding", "tripelbinding"],
              ros: "Antallet af streger viser, hvor mange elektronpar de to atomer deler." }
        ],
        pladser: [
            /* ----- Lag 1: dichlor ved siden af natriumchlorid --------------- */
            { id: "ionbinding", ord: ["ionbinding"], x: PILM, y: BIND1_Y, maal: [PILM, AY + 12], dele: ["naclpil"],
              omr: [{ r: [PIL1 - 4, AY - 10, PIL2 - PIL1 + 8, 20, 6] }],
              fejl: { elektronparbinding: "<b>elektronparbinding</b> er et fælles elektronpar. Na⁺ og Cl⁻ deler ingen elektroner, men trækker i hinanden.",
                      "fælles elektronpar": "<b>fælles elektronpar</b> er to elektroner, som to atomer deler. Na⁺ og Cl⁻ deler ingen elektroner, men trækker i hinanden.",
                      molekyle: "<b>molekyle</b> er en partikel af ikke-metaller. Pladsen peger på pilene, der viser, at Na⁺ og Cl⁻ trækker i hinanden." } },
            { id: "elektronparbinding", ord: ["elektronparbinding", "fælles elektronpar"], par: "fælles elektronpar", x: PARX, y: BIND1_Y,
              maal: [PARX, AY + 22], dele: ["clpar"],
              omr: [{ r: [PARX - 9, AY - 19, 18, 38, 7] }], fejl: PARFEJL },
            { id: "fælles elektronpar", ord: ["elektronparbinding", "fælles elektronpar"], x: PARX, y: BIND1_Y,
              maal: [PARX, AY + 22], dele: ["clramme"],
              omr: [{ r: [PARX - 9, AY - 19, 18, 38, 7] }], fejl: PARFEJL },
            { id: "molekyle", ord: ["molekyle"], x: KC.x + KC.b / 2, y: KC.y, maal: [KC.x + KC.b / 2, KC.y], titel: true, dele: ["clatomer"],
              omr: [{ r: [CL1 - CLR - 12, KC.y + 8, CL2 - CL1 + 2 * CLR + 24, AY + CLR + 12 - (KC.y + 8), 12] }],
              fejl: { ionbinding: "<b>ionbinding</b> holder ioner sammen. Skiltet siger, hvad hele Cl₂ er, ligesom ordet ionforbindelse ved siden af.",
                      elektronparbinding: "<b>elektronparbinding</b> er de to elektroner i midten. Skiltet siger, hvad hele Cl₂ er, ligesom ordet ionforbindelse ved siden af.",
                      "fælles elektronpar": "<b>fælles elektronpar</b> er kun de to elektroner i midten. Skiltet gælder hele Cl₂ med begge atomer." } },

            /* ----- Lag 2: prikker og streger ------------------------------------ */
            { id: "elektronprikformel", ord: ["elektronprikformel"], x: 125, y: PY, maal: [RX, PY], titel: true, dele: ["prik"],
              omr: [{ r: RAEKKE_P.concat([12]), tom: true }],
              fejl: { stregformel: "<b>stregformel</b> tegner hvert fælles elektronpar som en streg. I denne række er elektronerne prikker.",
                      "frit elektronpar": "<b>frit elektronpar</b> er kun to prikker. Pladsen står foran hele rækken af tegninger." } },
            { id: "stregformel", ord: ["stregformel"], x: 125, y: SY, maal: [RX, SY], titel: true, dele: ["streg"],
              omr: [{ r: RAEKKE_S.concat([12]), tom: true }],
              fejl: { elektronprikformel: "<b>elektronprikformel</b> viser elektronerne som prikker. I denne række er hvert fælles elektronpar en streg.",
                      "frit elektronpar": "<b>frit elektronpar</b> er kun to prikker. Pladsen står foran hele rækken af tegninger." } },
            { id: "frit elektronpar", ord: ["frit elektronpar"], x: 125, y: 326, maal: [CX[0] - 15, PY - 26], dele: ["frit"],
              omr: [{ r: [CX[0] - 14, PY - 34, 28, 16, 7] }],
              fejl: { elektronprikformel: "<b>elektronprikformel</b> er hele tegningen. Pladsen peger kun på to elektroner over O, som ikke er med i en binding.",
                      stregformel: "<b>stregformel</b> er en hel tegning med streger. Pladsen peger kun på to elektroner over O.",
                      "fælles elektronpar": "<b>fælles elektronpar</b> sidder mellem to atomer. De to elektroner over O hører kun til oxygen." } },

            /* ----- Lag 3: hvor mange par der deles ------------------------------ */
            { id: "enkeltbinding", ord: ["enkeltbinding"], x: CX[0], y: BOKS_Y, maal: bindMaal(BIND.enkelt), dele: ["b1"],
              omr: [{ r: bindFelt(BIND.enkelt) }],
              fejl: { dobbeltbinding: "<b>dobbeltbinding</b> tegnes med to streger. " + TAEL("én"),
                      tripelbinding: "<b>tripelbinding</b> tegnes med tre streger. " + TAEL("én"),
                      elektronparbinding: "<b>elektronparbinding</b> gælder alle tre. Pladsen spørger, hvor mange elektronpar O og H deler." } },
            { id: "dobbeltbinding", ord: ["dobbeltbinding"], x: CX[1], y: BOKS_Y, maal: bindMaal(BIND.dobbelt), dele: ["b2"],
              omr: [{ r: bindFelt(BIND.dobbelt) }],
              fejl: { enkeltbinding: "<b>enkeltbinding</b> tegnes med én streg. " + TAEL("to"),
                      tripelbinding: "<b>tripelbinding</b> tegnes med tre streger. " + TAEL("to"),
                      elektronparbinding: "<b>elektronparbinding</b> gælder alle tre. Pladsen spørger, hvor mange elektronpar C og O deler." } },
            { id: "tripelbinding", ord: ["tripelbinding"], x: CX[2], y: BOKS_Y, maal: bindMaal(BIND.tripel), dele: ["b3"],
              omr: [{ r: bindFelt(BIND.tripel) }],
              fejl: { enkeltbinding: "<b>enkeltbinding</b> tegnes med én streg. " + TAEL("tre"),
                      dobbeltbinding: "<b>dobbeltbinding</b> tegnes med to streger. " + TAEL("tre"),
                      elektronparbinding: "<b>elektronparbinding</b> gælder alle tre. Pladsen spørger, hvor mange elektronpar de to N deler." } }
        ],

        tegn: function (api) {
            var B = bredde(["ionbinding", "elektronparbinding", "fælles elektronpar", "molekyle", "elektronprikformel", "stregformel",
                "frit elektronpar", "enkeltbinding", "dobbeltbinding", "tripelbinding"]);

            /* ----- Lag 1 ------------------------------------------------------- */
            /* Natriumchlorid med ionforbindelse fra kapitel 2 staar der fra start */
            api.del("nacl", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var cx = KN.x + KN.b / 2;
                    SV.el("rect", { x: KN.x, y: KN.y, width: KN.b, height: KN.h, rx: 16, fill: "#f6f8fa", stroke: "#cdd5dd", "stroke-width": 1.6 }, g);
                    SV.kugle(g, NA, AY, 24, "proton", "Na^+");
                    SV.kugle(g, CLN, AY, 38, "elektron", "Cl^−");
                    SV.tekst(g, cx, KN.y + 40, "natriumchlorid, NaCl", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    givet(g, cx, KN.y, "ionforbindelse", B);
                }
            });

            /* Pilene: Na⁺ og Cl⁻ trækker i hinanden */
            api.del("naclpil", {
                lag: 0,
                fuld: function (g) {
                    var m = PILM;
                    var a = SV.g(g), b = SV.g(g);
                    SV.el("line", { x1: PIL1, y1: AY, x2: m - 8, y2: AY, stroke: F.roed, "stroke-width": 2.6, "stroke-linecap": "round" }, a);
                    SV.el("polygon", { points: (m - 1) + "," + AY + " " + (m - 10) + "," + (AY - 5) + " " + (m - 10) + "," + (AY + 5), fill: F.roed }, a);
                    SV.el("line", { x1: PIL2, y1: AY, x2: m + 8, y2: AY, stroke: F.blaa, "stroke-width": 2.6, "stroke-linecap": "round" }, b);
                    SV.el("polygon", { points: (m + 1) + "," + AY + " " + (m + 10) + "," + (AY - 5) + " " + (m + 10) + "," + (AY + 5), fill: F.blaa }, b);
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 400); an.pop(r.b, 100, 400); }
            });

            api.del("clramme", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: KC.x, y: KC.y, width: KC.b, height: KC.h, rx: 16, fill: "#f3f8f7", stroke: "#8fc7bb", "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            api.del("clatomer", {
                lag: 0,
                fuld: function (g) {
                    var a = SV.kugle(g, CL1, AY, CLR, "Cl");
                    var b = SV.kugle(g, CL2, AY, CLR, "Cl");
                    /* Symbolerne staar til siderne, saa parret i midten kan ses */
                    SV.tekst(g, CL1 - 12, AY + 9, "Cl", { "font-size": 25, "font-weight": 700, fill: "#2f4a12" });
                    SV.tekst(g, CL2 + 12, AY + 9, "Cl", { "font-size": 25, "font-weight": 700, fill: "#2f4a12" });
                    var t = SV.tekst(g, KC.x + KC.b / 2, KC.y + 40, "dichlor, Cl_2", { "font-size": 15, "font-weight": 700, fill: F.svag });
                    return { a: a, b: b, t: t };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 420); an.pop(r.b, 120, 420); an.fade(r.t, 300, 400); }
            });

            api.del("clpar", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    prik(gg, PARX, AY - 8, "elektron");
                    prik(gg, PARX, AY + 8, "elektron");
                    return { p: gg };
                },
                byg: function (g, r, an) { an.pop(r.p, 0, 500); }
            });

            /* ----- Lag 2: elektronprikformler og stregformler -------------------- */
            api.del("prik", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: RAEKKE_P[0], y: RAEKKE_P[1], width: RAEKKE_P[2], height: RAEKKE_P[3], rx: 12, fill: "#f7f9fb", stroke: "#d4dbe2", "stroke-width": 1.4 }, g);
                    [["vand, H_2O", CX[0]], ["carbondioxid, CO_2", CX[1]], ["dinitrogen, N_2", CX[2]]].forEach(function (n) {
                        SV.tekst(g, n[1], 336, n[0], { "font-size": 15, "font-weight": 700, fill: F.svag });
                    });
                    var dele = [];
                    /* Vand: O i midten med blaa elektroner, H med groenne */
                    var v = SV.g(g); dele.push(v);
                    sym(v, CX[0] - 66, PY, "H"); sym(v, CX[0], PY, "O"); sym(v, CX[0] + 66, PY, "H");
                    lodret(v, CX[0] - 33, PY, "gron", "elektron");
                    lodret(v, CX[0] + 33, PY, "gron", "elektron");
                    vandret(v, CX[0], PY + 26, "elektron");
                    /* Carbondioxid: C blaa, O groenne */
                    var c = SV.g(g); dele.push(c);
                    sym(c, CX[1] - 70, PY, "O"); sym(c, CX[1], PY, "C"); sym(c, CX[1] + 70, PY, "O");
                    [-1, 1].forEach(function (s) {
                        var ox = CX[1] + s * 70, bx = CX[1] + s * 35;
                        vandret(c, ox, PY - 26, "gron");
                        vandret(c, ox, PY + 26, "gron");
                        lodret(c, bx - 6 * s, PY, "elektron");
                        lodret(c, bx + 6 * s, PY, "gron");
                    });
                    /* Dinitrogen: venstre N blaa, hoejre N groen */
                    var n = SV.g(g); dele.push(n);
                    sym(n, CX[2] - 35, PY, "N"); sym(n, CX[2] + 35, PY, "N");
                    lodret(n, CX[2] - 61, PY, "elektron");
                    lodret(n, CX[2] + 61, PY, "gron");
                    [-14, 0, 14].forEach(function (dy) { prik(n, CX[2] - 6, PY + dy, "elektron"); prik(n, CX[2] + 6, PY + dy, "gron"); });
                    return { dele: dele };
                },
                byg: function (g, r, an) { r.dele.forEach(function (d, i) { an.fade(d, i * 180, 450); }); }
            });

            /* Det frie elektronpar over O i vand */
            api.del("frit", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    vandret(gg, CX[0], PY - 26, "elektron");
                    return { p: gg };
                },
                byg: function (g, r, an) { an.pop(r.p, 0, 500); }
            });

            api.del("streg", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: RAEKKE_S[0], y: RAEKKE_S[1], width: RAEKKE_S[2], height: RAEKKE_S[3], rx: 12, fill: "#f7f9fb", stroke: "#d4dbe2", "stroke-width": 1.4 }, g);
                    var dele = [];
                    var v = SV.g(g); dele.push(v);
                    sym(v, CX[0] - 60, SY, "H"); sym(v, CX[0], SY, "O"); sym(v, CX[0] + 60, SY, "H");
                    streger(v, CX[0] - 45, CX[0] - 16, SY, 1);
                    streger(v, BIND.enkelt.x1, BIND.enkelt.x2, SY, 1);
                    var c = SV.g(g); dele.push(c);
                    sym(c, CX[1] - 70, SY, "O"); sym(c, CX[1], SY, "C"); sym(c, CX[1] + 70, SY, "O");
                    streger(c, CX[1] - 54, CX[1] - 16, SY, 2);
                    streger(c, BIND.dobbelt.x1, BIND.dobbelt.x2, SY, 2);
                    var n = SV.g(g); dele.push(n);
                    sym(n, CX[2] - 35, SY, "N"); sym(n, CX[2] + 35, SY, "N");
                    streger(n, BIND.tripel.x1, BIND.tripel.x2, SY, 3);
                    return { dele: dele };
                },
                byg: function (g, r, an) { r.dele.forEach(function (d, i) { an.fade(d, i * 180, 450); }); }
            });

            /* ----- Lag 3: bindingen farves, og parrene i prikformlen ringes ind --- */
            [["b1", BIND.enkelt], ["b2", BIND.dobbelt], ["b3", BIND.tripel]].forEach(function (x) {
                var b = x[1];
                api.del(x[0], {
                    lag: 2,
                    fuld: function (g) {
                        var s = streger(g, b.x1, b.x2, SY, b.n, F.teal, 3.6);
                        var ring = SV.el("rect", { x: b.par[0] - 4, y: b.par[1] - 4, width: b.par[2] + 8, height: b.par[3] + 8, rx: 9,
                            fill: "none", stroke: F.teal, "stroke-width": 2.4 }, g);
                        return { s: s, ring: ring };
                    },
                    byg: function (g, r, an) { an.pop(r.s, 0, 450); an.streg(r.ring, 250, 600); }
                });
            });
        }
    };
}());

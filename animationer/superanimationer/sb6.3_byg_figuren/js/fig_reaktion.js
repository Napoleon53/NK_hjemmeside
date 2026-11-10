/* =====================================================================
   fig_reaktion.js - figuren til B6.1 Syre-basereaktioner

   Oeverst bogens b6-hydronoverfoersel: ethansyre og vand som
   kuglemodeller. Den orange hydron flytter med den vinklede pil fra
   ethansyre til vandmolekylet. Produkterne staar i raekkefoelgen
   H₃O⁺ + CH₃COO⁻ (bogen: CH₃COO⁻ + H₃O⁺), saa de to groenne klammer
   kan ligge inden i hinanden under formlerne. Saa er der frit over
   modellerne til stregerne fra syre, base og hydron. Teksterne "syre",
   "base", "hydronen flytter" og "korresponderende syre-basepar" er
   taget af (de er pladserne).
   Hydron peger paa den orange kugle i oxoniumionen, altsaa hydronen,
   efter at den er flyttet. Syre-basereaktion er titlen paa kortet, og
   korresponderende syre-basepar peger paa klammerne (feltet om dem begge).
   Nederst til venstre bogens b6-amfolyt: hydrogencarbonat paa sit eget
   kort med carbonat og kulsyre paa hver side ("amfolyt" under formlen er
   taget af). Nederst til hoejre to kort fra bogens tabel over mono- og
   polyhydrone syrer: HCl med én pil og phosphorsyre med tre.
   Otte fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B6 = NK.B6;
    var C = B6.F;

    /* ----- Lag 1 og 2: reaktionen ------------------------------------------ */
    var RA = { x: 20, y: 30, b: 1120, h: 436 };
    var MY = 245, NY = 347, S = 2.4;
    var XS = [190, 420, 740, 970];
    var M = {
        syre: B6.beregn("CH3COOH", XS[0], MY, S, { vx: 0.3 }),
        base: B6.beregn("H2O", XS[1], MY + 2, S, { vx: 0.3, vz: 0.6 }),
        oxo: B6.beregn("H3O-v", XS[2], MY, S, { vx: 0.7, vy: 0.4 }),
        ethanoat: B6.beregn("CH3COO", XS[3], MY, S, { vx: 0.3 })
    };
    var PIL_TOP = 160;                                   /* hydronpilens top */
    var K0 = NY + 16;                                     /* klammernes ben begynder */
    var KI = 22, KY = 44;                                 /* den indre og den ydre klamme */

    function omrModel(m, x) {
        return { r: [x - m.R - 8, MY - m.R - 8, 2 * m.R + 16, NY + 12 - (MY - m.R - 8), 12] };
    }

    /* ----- Lag 3: amfolytten og de to slags syrer ---------------------------- */
    var RB = { x: 20, y: 490, b: 600, h: 252 };
    var AY = 626, AX = [100, 320, 540];
    var IK = { x: 248, y: 570, b: 144, h: 162 };          /* kortet med HCO₃⁻ */
    var C1 = { x: 640, y: 490, b: 500, h: 112 };
    var C2 = { x: 640, y: 630, b: 500, h: 112 };

    NK.FIGURER.reaktion = {
        vb: [1160, 756],
        lag: [
            { navn: "Syren og basen", pladser: ["syre", "base", "hydron"],
              ros: "Ethansyre afgiver en hydron, og vand optager den. Den orange hydron sidder nu i oxoniumionen." },
            { navn: "Reaktionen og parrene", pladser: ["syre-basereaktion", "korresponderende syre-basepar"],
              ros: "I en syre-basereaktion flytter en hydron fra syren til basen. Reaktionen har altid to syre-basepar." },
            { navn: "Flere hydroner", pladser: ["amfolyt", "monohydron", "polyhydron"],
              ros: "Hydrogencarbonat kan både afgive og optage en hydron. HCl kan afgive én hydron, og H₃PO₄ kan afgive tre." }
        ],
        pladser: [
            { id: "syre", ord: ["syre"], x: 200, y: 108, maal: [XS[0] - 16, MY - M.syre.R + 10], dele: ["syre"],
              omr: [omrModel(M.syre, XS[0])],
              fejl: { "base": "<b>base</b> optager en hydron. Pladsen peger på ethansyre, som afgiver den orange hydron til vand.",
                      "hydron": "<b>hydron</b> er kun H⁺. Pladsen peger på hele ethansyremolekylet.",
                      "monohydron": "<b>monohydron</b> siger, hvor mange hydroner en syre kan afgive. Pladsen spørger om, hvad ethansyre gør i reaktionen.",
                      "amfolyt": "<b>amfolyt</b> kan både afgive og optage en hydron. Pladsen spørger om, hvad ethansyre gør i reaktionen med vand." } },
            { id: "base", ord: ["base"], x: 572, y: 108, maal: [XS[1] + M.base.R * 0.55, MY - M.base.R * 0.62], dele: ["base"],
              omr: [omrModel(M.base, XS[1])],
              fejl: { "syre": "<b>syre</b> afgiver en hydron. Pladsen peger på vand, som optager den orange hydron fra ethansyre.",
                      "hydron": "<b>hydron</b> er kun H⁺. Pladsen peger på hele vandmolekylet, som tager imod den orange kugle.",
                      "amfolyt": "<b>amfolyt</b> kan både afgive og optage en hydron. Pladsen spørger om, hvad vand gør i netop denne reaktion." } },
            { id: "hydron", ord: ["hydron"], x: 952, y: 108, maal: [M.oxo.hyd[0], M.oxo.hyd[1] - M.oxo.hyd[2]], dele: ["produkter"],
              omr: [{ c: [M.oxo.hyd[0], M.oxo.hyd[1], M.oxo.hyd[2] + 9] }],
              fejl: { "syre": "<b>syre</b> er et helt stof, der afgiver en hydron. Pladsen peger på én lille orange kugle i oxoniumionen.",
                      "base": "<b>base</b> er et helt stof, der optager en hydron. Pladsen peger på én lille orange kugle i oxoniumionen.",
                      "amfolyt": "<b>amfolyt</b> er et helt stof. Pladsen peger på én lille orange kugle i oxoniumionen." } },

            { id: "syre-basereaktion", ord: ["syre-basereaktion"], x: RA.x + RA.b / 2, y: RA.y, maal: [RA.x + RA.b / 2, RA.y], titel: true, dele: ["ramme"],
              omr: [{ r: [RA.x - 4, RA.y - 4, RA.b + 8, RA.h + 8, 18], tom: true }],
              fejl: { "korresponderende syre-basepar": "<b>korresponderende syre-basepar</b> er to stoffer. Overskriften gælder hele reaktionen, hvor en hydron flytter.",
                      "hydron": "<b>hydron</b> er kun H⁺. Overskriften gælder hele reaktionen mellem ethansyre og vand." } },
            { id: "korresponderende syre-basepar", ord: ["korresponderende syre-basepar"], x: 580, y: 438, maal: [580, K0 + KY], dele: ["par"],
              omr: [{ r: [XS[1] - 7, K0 - 6, XS[2] - XS[1] + 14, KI + 13, 6] }, { r: [XS[0] - 7, K0 - 6, XS[3] - XS[0] + 14, KY + 13, 6] }],
              fejl: { "syre-basereaktion": "<b>syre-basereaktion</b> er hele reaktionen. Pladsen peger på klammerne, der hver binder to stoffer sammen.",
                      "amfolyt": "<b>amfolyt</b> er ét stof. Pladsen peger på klammerne, der hver binder to stoffer sammen.",
                      "polyhydron": "<b>polyhydron</b> siges om én syre. Pladsen peger på klammerne, der hver binder to stoffer sammen." } },

            { id: "amfolyt", ord: ["amfolyt"], x: AX[1], y: 530, maal: [AX[1], IK.y + 2], dele: ["amfolyt"],
              omr: [{ r: [IK.x - 4, IK.y - 4, IK.b + 8, IK.h + 8, 14] }],
              fejl: { "polyhydron": "<b>polyhydron</b> siges om en syre, der kan afgive flere hydroner. Pladsen peger på HCO₃⁻, som har en pil til hver side.",
                      "base": "<b>base</b> kan kun optage en hydron. Pladsen peger på HCO₃⁻, som har en pil til hver side.",
                      "syre": "<b>syre</b> kan kun afgive en hydron. Pladsen peger på HCO₃⁻, som har en pil til hver side." } },
            { id: "monohydron", ord: ["monohydron"], x: C1.x + C1.b / 2, y: C1.y, maal: [C1.x + C1.b / 2, C1.y], titel: true, dele: ["mono"],
              omr: [{ r: [C1.x - 4, C1.y - 4, C1.b + 8, C1.h + 8, 18], tom: true }],
              fejl: { "polyhydron": "<b>polyhydron</b> siges om en syre, der kan afgive flere hydroner. Overskriften gælder kortet med HCl og én pil.",
                      "amfolyt": "<b>amfolyt</b> kan både afgive og optage. Overskriften gælder kortet med HCl, som kun afgiver." } },
            { id: "polyhydron", ord: ["polyhydron"], x: C2.x + C2.b / 2, y: C2.y, maal: [C2.x + C2.b / 2, C2.y], titel: true, dele: ["poly"],
              omr: [{ r: [C2.x - 4, C2.y - 4, C2.b + 8, C2.h + 8, 18], tom: true }],
              fejl: { "monohydron": "<b>monohydron</b> siges om en syre, der kun kan afgive én hydron. Overskriften gælder kortet med H₃PO₄ og tre pile.",
                      "amfolyt": "<b>amfolyt</b> er ét stof, der både kan afgive og optage. Overskriften gælder kortet med H₃PO₄ og tre pile." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* ----- Lag 1: reaktionen ------------------------------------------ */
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    KV.tekst(g, (XS[0] + XS[1]) / 2, MY + 9, "+", { fs: 28, farve: C.daempet });
                    KV.tekst(g, (XS[2] + XS[3]) / 2, MY + 9, "+", { fs: 28, farve: C.daempet });
                    B6.ligevaegt(g, 548, 612, MY);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("syre", {
                lag: 0,
                fuld: function (g) {
                    var m = B6.model(g, "CH3COOH", XS[0], MY, S, { vx: 0.3 });
                    KV.tekst(g, XS[0], NY, "CH_3COOH", { fs: 26, fed: true, farve: C.syre });
                    return { m: m.g };
                },
                byg: function (g, r, an) { an.pop(r.m, 0, 500); }
            });

            api.del("base", {
                lag: 0,
                fuld: function (g) {
                    var m = B6.model(g, "H2O", XS[1], MY + 2, S, { vx: 0.3, vz: 0.6 });
                    KV.tekst(g, XS[1], NY, "H_2O", { fs: 26, fed: true, farve: C.base });
                    return { m: m.g };
                },
                byg: function (g, r, an) { an.pop(r.m, 0, 500); }
            });

            api.del("produkter", {
                lag: 0,
                fuld: function (g) {
                    var pil = B6.hydronpil(g, M.syre.hyd, M.base.fri, PIL_TOP);
                    var a = B6.model(g, "H3O-v", XS[2], MY, S, { vx: 0.7, vy: 0.4 });
                    var b = B6.model(g, "CH3COO", XS[3], MY, S, { vx: 0.3 });
                    KV.tekst(g, XS[2], NY, "H_3O^+", { fs: 26, fed: true, farve: C.syre });
                    KV.tekst(g, XS[3], NY, "CH_3COO^−", { fs: 26, fed: true, farve: C.base });
                    return { pil: pil, a: a.g, b: b.g };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.pil.firstChild, 0, 600); an.pop(r.a, 250, 450); an.pop(r.b, 350, 450); }
            });

            /* ----- Lag 2: de to syre-basepar ------------------------------------- */
            api.del("par", {
                lag: 1,
                fuld: function (g) {
                    var a = B6.klamme(g, XS[1], XS[2], K0, KI, false);
                    var b = B6.klamme(g, XS[0], XS[3], K0, KY, false);
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.streg(r.a, 0, 600); an.streg(r.b, 150, 700); }
            });

            /* ----- Lag 3 ------------------------------------------------------------ */
            api.del("amfolyt", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.kort(g, IK.x, IK.y, IK.b, IK.h, { fyld: "#f3f8fb", kant: "#b9c9d4" });
                    var s = 1.75;
                    B6.model(g, "CO3", AX[0], AY, s, { vx: 0.25 });
                    B6.model(g, "HCO3", AX[1], AY - 4, s, { vx: 0.25 });
                    B6.model(g, "H2CO3", AX[2], AY, s, { vx: 0.25 });
                    [["CO_3^{2−}", "carbonat"], ["HCO_3^−", ""], ["H_2CO_3", "kulsyre"]].forEach(function (t, k) {
                        KV.tekst(g, AX[k], AY + 74, t[0], { fs: 22, fed: true });
                        if (t[1]) KV.tekst(g, AX[k], AY + 97, t[1], { fs: 16, farve: C.daempet });
                    });
                    /* Til venstre afgiver HCO₃⁻ en hydron, til hoejre optager den en */
                    B6.pil(g, IK.x - 6, 156, AY, C.syre, 2.6);
                    B6.pil(g, IK.x + IK.b + 6, 484, AY, C.base, 2.6);
                    [[199, C.syre, "afgiver H^+"], [441, C.base, "optager H^+"]].forEach(function (t) {
                        B6.hydronkugle(g, t[0] - 14, AY - 22, 7);
                        KV.tekst(g, t[0] + 11, AY - 16, "H^+", { fs: 17, fed: true, farve: C.hydron });
                        KV.tekst(g, t[0], AY + 32, t[2], { fs: 16, fed: true, farve: t[1] });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* En raekke formler med pile og "−H⁺" over pilene, centreret i kortet */
            function kaede(g, kort, y, formler, fs, pil) {
                var b = formler.map(function (f) { return B6.bredde(f, fs, 700); });
                var hel = b.reduce(function (a, v) { return a + v; }, 0) + (formler.length - 1) * (pil + 16);
                var x = kort.x + (kort.b - hel) / 2;
                formler.forEach(function (f, k) {
                    B6.venstre(g, x, y, f, fs);
                    x += b[k];
                    if (k < formler.length - 1) {
                        B6.pil(g, x + 8, x + 8 + pil, y - fs * 0.32, C.blaek, 2.2);
                        KV.tekst(g, x + 8 + pil / 2, y - fs * 0.32 - 12, "−H^+", { fs: 16, fed: true, farve: C.hydron });
                        x += pil + 16;
                    }
                });
            }

            api.del("mono", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, C1.x, C1.y, C1.b, C1.h);
                    kaede(g, C1, C1.y + 74, ["HCl", "Cl^−"], 24, 96);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("poly", {
                lag: 2,
                fuld: function (g) {
                    KV.kort(g, C2.x, C2.y, C2.b, C2.h);
                    kaede(g, C2, C2.y + 76, ["H_3PO_4", "H_2PO_4^−", "HPO_4^{2−}", "PO_4^{3−}"], 20, 40);
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

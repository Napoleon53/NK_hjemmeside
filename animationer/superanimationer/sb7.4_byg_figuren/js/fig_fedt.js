/* =====================================================================
   fig_fedt.js - figuren til B7.5 Fedtstoffer

   Øverst bogens b7-triglycerid-dannelse: glycerol og tre fedtsyrer
   kondenserer til et fedtstof og tre vandmolekyler. Estergrupperne er
   strukturformler i en lys grøn boks, og kæderne er gyldne som i bogen.
   Navnene under stofferne er taget af; dér sidder pladserne glycerol,
   fedtsyre og triglycerid.
   Nederst til venstre bogens b7-fedtsyrer: stearinsyre (C18:0) og
   oliesyre (C18:1) med knækket ved cis-dobbeltbindingen. Bogens linjer
   "mættet" og "monoumættet" er afløst af pladserne.
   Nederst til højre bogens b7-haerdning: et stykke kæde med en
   cis-dobbeltbinding adderer dihydrogen og bliver lige. Under den en hel
   transfedtsyre (elaidinsyre, trans-C18:1), som er næsten lige. Bogens
   tekster "mættet kæde" og "trans-dobbeltbinding" er taget af.
   Syv fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var FP = NK.FP;
    var F = FP.F;
    var bred = FP.bred;

    var FS = 17, L = 14, N = 12;
    var COS = Math.cos(Math.PI / 6);

    /* ----- Lag 1: dannelsen ------------------------------------------------ */
    var KK = { x: 14, y: 18, b: 1132, h: 300 };
    var R = [KK.y + 78, KK.y + 136, KK.y + 194];       /* de tre raekker */
    var ESTER_H = (L + 0.5 * FS + 3) * COS + (N - 1) * L * COS;   /* fra O til kaedens ende */
    var GX = 196;                                         /* glycerols C */
    var G_HOEJRE = GX - 0.37 * FS + bred("CH_2", FS) + 3 + 11 + 3 + bred("OH", FS);
    var PLUS1 = G_HOEJRE + 46;
    var AX = G_HOEJRE + 128;                               /* O i fedtsyrernes HO */
    var A_HOEJRE = AX + ESTER_H;
    var PIL0 = A_HOEJRE + 26, PIL1 = PIL0 + 104;
    var GX2 = PIL1 + 46;                                  /* fedtstoffets glycerol */
    var OX2 = GX2 - 0.37 * FS + bred("CH_2", FS) + 3 + 11 + 3 + 0.37 * FS;
    var P_HOEJRE = OX2 + ESTER_H;
    var PLUS2 = P_HOEJRE + 30;
    var VAND = PLUS2 + 20;
    var BUND = R[2] + 26, PY = KK.y + KK.h - 34;
    var OMR_G = [GX - 18, R[0] - 18, G_HOEJRE - GX + 30, R[2] - R[0] + 36];
    var OMR_A = [AX - 40, R[0] - 44, A_HOEJRE - AX + 52, R[2] - R[0] + 68];
    var OMR_T = [GX2 - 18, R[0] - 44, P_HOEJRE - GX2 + 30, R[2] - R[0] + 68];
    var MID_G = OMR_G[0] + OMR_G[2] / 2, MID_A = OMR_A[0] + OMR_A[2] / 2, MID_T = OMR_T[0] + OMR_T[2] / 2;

    /* ----- Lag 2: fedtsyrerne ---------------------------------------------- */
    var KM = { x: 14, y: 334, b: 560, h: 290 };
    var NX = KM.x + 24;                                   /* navnene */
    var HX = KM.x + 262;                                  /* HOOC */
    var YS = KM.y + 64, YO = KM.y + 162;                  /* stearinsyre og oliesyre */
    var LK = 12;                                          /* kortere bindinger i de hele fedtsyrer */
    var KX = HX + bred("HOOC", 16) + 3;                   /* kaedens foerste carbonatom */

    /* ----- Lag 3: haerdningen ---------------------------------------------- */
    var KH = { x: 588, y: 334, b: 558, h: 290 };
    var HY = KH.y + 86;                                   /* stykkerne af kaeden */
    /* Stykkerne af kaeden som i bogens b7-haerdning: hatten med cis-dobbeltbindingen
       foroven og den lige kaede */
    var C0 = KH.x + 22, H2X = KH.x + 214, HP0 = KH.x + 246, HP1 = KH.x + 338, M0 = KH.x + 362;
    var CIS = [[0, 50], [15, 26], [44, 26], [58, 0], [86, 0], [100, 26], [129, 26], [144, 50]].map(function (p) { return [C0 + p[0], HY - 22 + p[1]]; });
    var TY = KH.y + 224, THX = KH.x + 28, TKX = THX + bred("HOOC", 16) + 3;

    /* Punkterne paa en kaede (uden at tegne), som FP.hale */
    function punkter(x0, y0, n, l, knaek, ret, side) {
        knaek = knaek || {};
        ret = ret || 0; side = side || 1;
        var p = [[x0, y0]];
        for (var i = 0; i < n - 1; i++) {
            p.push(FP.polar(p[p.length - 1][0], p[p.length - 1][1], l, ret + 30 * side));
            if (knaek[i] !== undefined) ret += knaek[i] * side; else side = -side;
        }
        return p;
    }
    var P_STEARIN = punkter(KX, YS, 18, LK);
    var P_OLIE = punkter(KX, YO, 18, LK, { 8: 60 });
    var P_TRANS = punkter(TKX, TY, 18, LK);
    var P_MAET = punkter(M0, HY + 6, 8, 21);
    function boksOm(p, luft) {
        var xs = p.map(function (a) { return a[0]; }), ys = p.map(function (a) { return a[1]; });
        var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
        return [x0 - luft, y0 - luft, x1 - x0 + 2 * luft, y1 - y0 + 2 * luft];
    }
    var B_STEARIN = boksOm(P_STEARIN, 12), B_OLIE = boksOm(P_OLIE, 12), B_TRANS = boksOm(P_TRANS, 12);
    B_STEARIN[0] -= 46; B_STEARIN[2] += 46;   /* HOOC med */
    B_OLIE[0] -= 46; B_OLIE[2] += 46;
    B_TRANS[0] -= 46; B_TRANS[2] += 46;

    NK.FIGURER.fedt = {
        vb: [1160, 640],
        lag: [
            { navn: "Et fedtstof dannes", pladser: ["glycerol", "fedtsyre", "triglycerid"],
              ros: "Glycerol og tre fedtsyrer kondenserer til et triglycerid. De tre estergrupper holder fedtsyrerne fast." },
            { navn: "Fedtsyrer", pladser: ["mættet fedtsyre", "umættet fedtsyre"],
              ros: "Stearinsyre er mættet og har en lige kæde. Oliesyre er umættet og har et knæk ved cis-dobbeltbindingen." },
            { navn: "Hærdning", pladser: ["hærdning", "transfedtsyre"],
              ros: "Ved hærdning adderer dihydrogen til dobbeltbindingerne. En transfedtsyre har en dobbeltbinding, men kæden er næsten lige." }
        ],
        pladser: [
            { id: "glycerol", ord: ["glycerol"], x: MID_G, y: PY, maal: [MID_G, OMR_G[1] + OMR_G[3]], dele: ["glyc"],
              omr: [{ r: [OMR_G[0], OMR_G[1], OMR_G[2], OMR_G[3], 12] }],
              fejl: { fedtsyre: "<b>fedtsyre</b> er en carboxylsyre med en lang kæde. Pladsen peger på stoffet med tre OH-grupper og kun tre carbonatomer.",
                      triglycerid: "<b>triglycerid</b> er fedtstoffet, der dannes. Pladsen peger på alkoholen med tre OH-grupper før reaktionen." } },
            { id: "fedtsyre", ord: ["fedtsyre"], x: MID_A, y: PY, maal: [MID_A, OMR_A[1] + OMR_A[3]], dele: ["syrer"],
              omr: [{ r: [OMR_A[0], OMR_A[1], OMR_A[2], OMR_A[3], 12] }],
              fejl: { glycerol: "<b>glycerol</b> er alkoholen med tre OH-grupper. Pladsen peger på de tre stoffer med en carboxylgruppe og en lang kæde.",
                      triglycerid: "<b>triglycerid</b> er fedtstoffet, der dannes. Pladsen peger på de tre carboxylsyrer med en lang kæde før reaktionen.",
                      /* De tre kaeder er maettede som i bogen, saa ordene for én slags fedtsyre faar en tekst her (den svaere udgave) */
                      "mættet fedtsyre": "<b>mættet fedtsyre</b> er én slags fedtsyre. Pladsen spørger efter det fælles navn for de tre stoffer, der kondenserer med glycerol.",
                      "umættet fedtsyre": "<b>umættet fedtsyre</b> er én slags fedtsyre. Pladsen spørger efter det fælles navn for de tre stoffer, der kondenserer med glycerol.",
                      transfedtsyre: "<b>transfedtsyre</b> er én slags fedtsyre. Pladsen spørger efter det fælles navn for de tre stoffer, der kondenserer med glycerol." } },
            { id: "triglycerid", ord: ["triglycerid"], x: MID_T, y: PY, maal: [MID_T, OMR_T[1] + OMR_T[3]], dele: ["tri"],
              omr: [{ r: [OMR_T[0], OMR_T[1], OMR_T[2], OMR_T[3], 12] }],
              fejl: { glycerol: "<b>glycerol</b> er alkoholen med tre OH-grupper. Pladsen peger på esteren med tre estergrupper, der dannes.",
                      fedtsyre: "<b>fedtsyre</b> er én carboxylsyre. Pladsen peger på hele stoffet, hvor tre kæder sidder på glycerol." } },

            { id: "mættet fedtsyre", ord: ["mættet fedtsyre"], x: NX + 102, y: YS + 40, maal: [B_STEARIN[0] + 6, YS + 22], dele: ["stearin"],
              omr: [{ r: [B_STEARIN[0], B_STEARIN[1], B_STEARIN[2], B_STEARIN[3], 10] }],
              fejl: { "umættet fedtsyre": "<b>umættet fedtsyre</b> har mindst én dobbeltbinding. Stearinsyre har kun enkeltbindinger, og kæden er lige.",
                      transfedtsyre: "<b>transfedtsyre</b> har en dobbeltbinding. Stearinsyre har kun enkeltbindinger.",
                      fedtsyre: "<b>fedtsyre</b> passer på begge kæder og står i dannelsen. Pladsen spørger, hvilken slags fedtsyre stearinsyre er." } },
            { id: "umættet fedtsyre", ord: ["umættet fedtsyre"], x: NX + 102, y: YO + 40, maal: [B_OLIE[0] + 6, YO + 22], dele: ["olie"],
              omr: [{ r: [B_OLIE[0], B_OLIE[1], B_OLIE[2], B_OLIE[3], 10] }],
              fejl: { "mættet fedtsyre": "<b>mættet fedtsyre</b> har kun enkeltbindinger. Oliesyre har en dobbeltbinding, der giver et knæk på kæden.",
                      transfedtsyre: "<b>transfedtsyre</b> har en næsten lige kæde. Oliesyre har en cis-dobbeltbinding og et knæk.",
                      fedtsyre: "<b>fedtsyre</b> passer på begge kæder og står i dannelsen. Pladsen spørger, hvilken slags fedtsyre oliesyre er." } },

            { id: "hærdning", ord: ["hærdning"], x: (HP0 + HP1) / 2, y: HY - 52, maal: [(HP0 + HP1) / 2, HY - 6], dele: ["pilH", "maet"],
              omr: [{ r: [HP0 - 6, HY - 12, HP1 - HP0 + 12, 44, 10] }],
              fejl: { transfedtsyre: "<b>transfedtsyre</b> er et stof. Pladsen peger på reaktionen, hvor dihydrogen adderer til dobbeltbindingen.",
                      "mættet fedtsyre": "<b>mættet fedtsyre</b> er et stof. Pladsen peger på reaktionen, hvor olien adderer dihydrogen.",
                      "umættet fedtsyre": "<b>umættet fedtsyre</b> er et stof. Pladsen peger på reaktionen, hvor olien adderer dihydrogen." } },
            { id: "transfedtsyre", ord: ["transfedtsyre"], x: KH.x + KH.b - 22 - 102, y: TY + 44, maal: [B_TRANS[0] + B_TRANS[2] - 4, TY + 14], dele: ["trans"],
              omr: [{ r: [B_TRANS[0], B_TRANS[1], B_TRANS[2], B_TRANS[3], 10] }],
              fejl: { "mættet fedtsyre": "<b>mættet fedtsyre</b> har kun enkeltbindinger. Denne kæde har en rød dobbeltbinding, men den giver intet knæk.",
                      "umættet fedtsyre": "<b>umættet fedtsyre</b> passer på alle kæder med dobbeltbindinger. Her er dobbeltbindingen ikke cis, og kæden er lige.",
                      hærdning: "<b>hærdning</b> er en reaktion. Pladsen peger på et stof, der kan dannes som biprodukt." } }
        ],

        tegn: function (api) {
            FP.defs();
            var T = { fs: 14, farve: F.daempet };

            /* ----- Lag 1: dannelsen --------------------------------------- */
            api.del("baseK", {
                lag: 0, auto: true,
                fuld: function (g) {
                    FP.kort(g, KK.x, KK.y, KK.b, KK.h);
                    ORG.t(g, KK.x + 22, KK.y + 32, "Et fedtstof dannes", { fs: 16, fed: true, farve: F.accent, anker: "start" });
                    ORG.plus(g, PLUS1, R[1] - 1);
                    ORG.t(g, (PIL0 + PIL1) / 2, R[1] - 14, "kondensation", { fs: 14, fed: true, farve: F.daempet });
                    FP.pil(g, PIL0, R[1], PIL1, R[1], F.blaek, 2.4, 12);
                    ORG.plus(g, PLUS2, R[1] - 1);
                    ORG.f(g, VAND, R[1], "3 H_2O", { fs: 19, anker: "start" });
                }
            });
            api.del("glyc", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); FP.glycerolOH(gg, GX, R, FS); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("syrer", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    R.forEach(function (y) { FP.ester(gg, AX, y, N, { fs: FS, L: L, start: "HO", gfarve: F.syreHO, farve: F.fedt }); });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("tri", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); FP.fedtstof(gg, GX2, R, N, { fs: FS }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: fedtsyrerne ------------------------------------- */
            api.del("baseM", {
                lag: 1, auto: true,
                fuld: function (g) {
                    FP.kort(g, KM.x, KM.y, KM.b, KM.h);
                    [[YS, "Stearinsyre", "C18:0"], [YO, "Oliesyre", "C18:1"]].forEach(function (r) {
                        ORG.t(g, NX, r[0] + 6, r[1], { fs: 17, fed: true, anker: "start" });
                        ORG.t(g, NX + 136, r[0] + 6, r[2], { fs: 16, fed: true, anker: "start", farve: F.syreHO });
                    });
                    ORG.t(g, NX, YO + 76, "findes især i olivenolie", { fs: 13.5, anker: "start", farve: F.daempet });
                    ORG.t(g, NX, YS + 76, "findes især i smør og kød", { fs: 13.5, anker: "start", farve: F.daempet });
                }
            });
            function hel(g, y, pkt, o) {
                ORG.t(g, KX - 3, y + 6, "HOOC", { fs: 16, fed: true, anker: "end", farve: F.accent });
                return FP.hale(g, pkt[0][0], pkt[0][1], 18, Object.assign({ L: LK, farve: F.fedt, sw: 2.4 }, o || {}));
            }
            api.del("stearin", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); hel(gg, YS, P_STEARIN); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("olie", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); hel(gg, YO, P_OLIE, { knaek: { 8: 60 }, dfarve: F.accent }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 3: haerdningen ------------------------------------- */
            api.del("baseH", {
                lag: 2, auto: true,
                fuld: function (g) {
                    FP.kort(g, KH.x, KH.y, KH.b, KH.h);
                    for (var i = 0; i < CIS.length - 1; i++) FP.linje(g, CIS[i][0], CIS[i][1], CIS[i + 1][0], CIS[i + 1][1], i === 3 ? F.accent : F.blaek, 2.6);
                    FP.linje(g, CIS[3][0] + 3, CIS[3][1] + 6, CIS[4][0] - 3, CIS[4][1] + 6, F.accent, 2.6);
                    ORG.t(g, C0 + 72, HY + 52, "kæden har et knæk", T);
                    ORG.plus(g, H2X - 26, HY - 2);
                    ORG.f(g, H2X, HY, "H_2", { fs: 21 });
                    ORG.t(g, (HP0 + HP1) / 2, HY + 24, "Ni og varme", { fs: 13.5, fed: true, farve: F.daempet });
                    SV.el("line", { x1: KH.x + 20, y1: KH.y + 168, x2: KH.x + KH.b - 20, y2: KH.y + 168, stroke: "#c9d6e0", "stroke-width": 1.4 }, g);
                    ORG.t(g, THX, KH.y + 196, "Biprodukt, når kun nogle dobbeltbindinger adderer H₂", { fs: 13.5, anker: "start", farve: F.daempet });
                }
            });
            api.del("pilH", {
                lag: 2,
                fuld: function (g) { return { p: FP.pil(g, HP0, HY, HP1, HY, F.blaek, 2.4, 12) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("maet", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    FP.hale(gg, M0, HY + 6, 8, { L: 21, farve: F.blaek, sw: 2.6 });
                    ORG.t(gg, (M0 + FP.maxX(P_MAET)) / 2, HY + 52, "kæden er lige", T);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 150, 450); }
            });
            api.del("trans", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.t(gg, TKX - 3, TY + 6, "HOOC", { fs: 16, fed: true, anker: "end", farve: F.accent });
                    FP.hale(gg, TKX, TY, 18, { L: LK, trans: [8], farve: F.fedt, dfarve: F.syreHO, sw: 2.4 });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

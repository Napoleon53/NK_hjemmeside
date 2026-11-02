/* =====================================================================
   fig_oploeselighed.js - figuren til B2.7 Opløselighedsprodukt

   Øverst bogens blyiodid-faeldning: bly(II)nitrat og kaliumiodid
   blandes og giver et gult bundfald (uden bogens lupper), og ved siden af
   ionreaktionen Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(s).
   I midten bogens maettet-oploesning: et vindue med iongitteret af PbI₂ og
   opløste ioner, hvor ioner opløses og udfældes. Ved siden af beregningen
   af opløseligheden x ud fra Kₒ = 1,79 · 10⁻⁸ M³ (bogens tal for PbI₂;
   beregningen staar ikke i bogen, men er lavet som bogens eksempler).
   Nederst bogens y-mod-ko: tre bægerglas med Y < Kₒ, Y = Kₒ og Y > Kₒ.
   Bogens titler Umættet, Mættet og Overmættet er pladserne, og
   tallinjen og teksterne under glassene er taget af for at spare plads.
   Rettet 2. nov. 2026 efter brugerens ord: "plejer man ikke at angive
   opløselighed i g/100 mL ... elever plejer at have svært ved at omregne M
   til g/100 mL". Beregningen fortsaetter fra x i mol pr. liter til m i
   gram pr. 100 mL med molarmassen 207,20 + 2 · 126,90 = 461,00 g/mol
   (atommasserne fra Kemibogen/bilag/grundstoffer.qmd) i bogens to trin:
   m = n · M = 1,65 · 10⁻³ mol · 461,00 g/mol = 0,761 g i 1 L (0,76065), og
   en tiendedel giver 0,0761 g / 100 mL. Pladsen opløselighed peger paa den
   sidste vaerdi (brugeren samme aften: "opløselighed skal pege ned til
   værdien, som har enheden g/100 mL"), og venstresiden er en streg i den
   graa udgave. Samme dag blev rammen med faeldningen lavere, saa der blev
   plads til de nye linjer.
   Ni fagord i tre lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B2 = NK.B2;
    var F = KV.F;

    /* ----- Lag 1: faeldningen --------------------------------------------- */
    var RA = { x: 20, y: 26, b: 1060, h: 236 };
    var C1 = 120, C2 = 320, C3 = 600, GB = 112, GH = 100, GBUND = 214;
    var MIDT = GBUND - GH / 2;
    var SK = { cx: 892, y: 116, fs: 20 };                       /* ionreaktionen */
    var PBI = { x: 0, b: 0 };                                     /* PbI₂(s) i ionreaktionen (maales i tegn) */

    /* ----- Lag 2: ligevaegten og beregningen -------------------------------- */
    var VI = { x: 20, y: 322, b: 420, h: 200 };
    var Y0 = VI.y + VI.h + 6;                                     /* nederste raekke iodidioner */
    var HZ = 22 + 13.5 - 4, ARK = 2 * HZ + 2 * 22 + 5;
    var FLADE = 30 + 2 * 45 + 22 + 13.5;                          /* gitterets hoejre side */
    var UD = [FLADE + 118, Y0 - ARK];                             /* iodidionen, der opløses */
    var IND = [FLADE + 104, Y0 - HZ];                             /* bly(II)ionen, der udfældes */
    var FRIE = [["I^−", 340, 454], ["I^−", 406, 358], ["I^−", 410, 484], ["Pb^2+", 352, 372], ["Pb^2+", 318, 508], ["Pb^2+", 414, 422]];
    var PO = { x: FLADE + 2, y: UD[1] - 32, b: UD[0] + 24 - FLADE - 2, h: IND[1] - UD[1] + 50 };   /* pilene */
    var KB = { x: 458, y: 280, b: 622, h: 318 };
    var LX = KB.x + 26;                                           /* venstre kant af beregningen */
    var L = [KB.y + 70, KB.y + 106, KB.y + 146, KB.y + 184, KB.y + 220, KB.y + 256, KB.y + 296];   /* linjerne */
    var BER = { fs: 19, c: 0, slut: [] };                         /* maales i tegn */
    var PX = 952;                                                 /* pladserne ved beregningen */

    /* ----- Lag 3: kommer der bundfald? -------------------------------------- */
    var GX = [190, 550, 910], G3B = 118, G3H = 100, G3BUND = 760, TY = 630;
    var Y3 = [["Y < K_{o}", F.serieB], ["Y = K_{o}", F.accent], ["Y > K_{o}", B2.F.lilla]];

    function glas3(g, k) {
        var cx = GX[k], gul = k === 2;
        B2.baeger(g, cx, G3BUND, G3B, G3H, 0.74, gul ? "gul" : "blaa", {
            inde: gul ? function (gg, vy) {
                B2.fnug(gg, cx, vy + 16, G3BUND - 18, G3B - 26, 22, 7, function (x) { return [-28, 2, 30].every(function (d) { return Math.abs(x - cx - d) > 7; }); });
            } : null
        });
        if (k === 1) B2.bundfald(g, cx, G3BUND, G3B, G3H, 8, 5);
        if (k === 2) {
            B2.bundfald(g, cx, G3BUND, G3B, G3H, 3, 8);
            var vy = G3BUND - G3H * 0.74;
            [-28, 2, 30].forEach(function (d) { KV.pil(g, cx + d, vy + 18, cx + d, vy + 40, B2.F.pbiKant, 1.6, 8); });
        }
        KV.tekst(g, cx, G3BUND + 38, Y3[k][0], { fs: 19, fed: true, farve: Y3[k][1] });
    }

    function kolonne(k) { return [GX[k] - 132, TY - 22, 264, G3BUND + 50 - (TY - 22), 16]; }

    NK.FIGURER.oploeselighed = {
        vb: [1100, 810],
        lag: [
            { navn: "Fældningen", pladser: ["fældningsreaktion", "bundfald", "tungtopløselig"],
              ros: "Pb²⁺ og I⁻ danner et gult bundfald af saltet PbI₂, som er tungtopløseligt. Det er en fældningsreaktion." },
            { navn: "Ligevægten", pladser: ["opløselighedsligevægt", "opløselighedsprodukt", "opløselighed"],
              ros: "I opløselighedsligevægten opløses og udfældes ioner lige hurtigt. Ud fra Kₒ kan opløseligheden beregnes." },
            { navn: "Kommer der bundfald?", pladser: ["umættet", "mættet", "overmættet"],
              ros: "Er Y mindre end Kₒ, er opløsningen umættet. Er Y lig med Kₒ, er den mættet, og er Y større, er den overmættet." }
        ],
        pladser: [
            { id: "fældningsreaktion", ord: ["fældningsreaktion"], x: RA.x + RA.b / 2, y: RA.y, maal: [RA.x + RA.b / 2, RA.y], titel: true, dele: ["glas"],
              omr: [{ r: [RA.x - 5, RA.y - 5, RA.b + 10, RA.h + 10, 18], tom: true }],
              fejl: { bundfald: "<b>bundfald</b> er kun det gule faste stof i glasset. Overskriften gælder alt det, der sker, når glassene blandes.",
                      tungtopløselig: "<b>tungtopløselig</b> siger, hvordan saltet PbI₂ opfører sig. Overskriften gælder alt det, der sker, når glassene blandes.",
                      opløselighedsligevægt: "<b>opløselighedsligevægt</b> er en balance, der går begge veje. Overskriften gælder det, der sker, når glassene blandes." } },
            { id: "bundfald", ord: ["bundfald"], x: 800, y: 238, maal: [C3 + 46, GBUND - 10], dele: ["bf"],
              omr: [{ r: [C3 - 60, GBUND - 32, 120, 38, 10] }],
              fejl: { tungtopløselig: "<b>tungtopløselig</b> siger, hvordan saltet opfører sig i vand. Pladsen peger på selve det gule faste stof i glasset.",
                      fældningsreaktion: "<b>fældningsreaktion</b> er alt det, der sker, når glassene blandes. Pladsen peger kun på det gule faste stof.",
                      mættet: "<b>mættet</b> siges om en opløsning. Pladsen peger på det gule faste stof i bunden af glasset." } },
            { id: "tungtopløselig", ord: ["tungtopløselig"], x: SK.cx, y: 178, maal: [0, 0], dele: ["skema"],
              omr: [],
              fejl: { bundfald: "<b>bundfald</b> er det gule faste stof i glasset. Pladsen peger på formlen for saltet og spørger, hvordan det opfører sig i vand.",
                      fældningsreaktion: "<b>fældningsreaktion</b> er hele reaktionen. Pladsen peger kun på saltet PbI₂ og spørger, hvordan det opfører sig i vand.",
                      opløselighed: "<b>opløselighed</b> er en mængde. Pladsen peger på formlen for saltet og spørger, hvordan det opfører sig i vand." } },

            { id: "opløselighedsligevægt", ord: ["opløselighedsligevægt"], x: PO.x + PO.b / 2, y: VI.y - 26, maal: [PO.x + PO.b / 2, PO.y], dele: ["vindue"],
              omr: [{ r: [PO.x, PO.y, PO.b, PO.h, 10] }],
              fejl: { opløselighedsprodukt: "<b>opløselighedsprodukt</b> er konstanten Kₒ. Pladsen peger på pilene, der viser ioner, som går begge veje.",
                      opløselighed: "<b>opløselighed</b> er en mængde. Pladsen peger på pilene, der viser ioner, som går begge veje lige hurtigt.",
                      fældningsreaktion: "<b>fældningsreaktion</b> går kun mod gitteret. Pilene viser, at ioner både forlader gitteret og sætter sig på det." } },
            { id: "opløselighedsprodukt", ord: ["opløselighedsprodukt"], x: PX, y: L[0] - 7, maal: [0, 0], dele: ["ko"],
              omr: [],
              fejl: { opløselighed: "<b>opløselighed</b> er mængden af opløst salt, x. Pladsen peger på Kₒ og udtrykket med ionernes koncentrationer.",
                      opløselighedsligevægt: "<b>opløselighedsligevægt</b> er selve balancen mellem salt og ioner. Pladsen peger på konstanten Kₒ.",
                      tungtopløselig: "<b>tungtopløselig</b> siges om et salt. Pladsen peger på konstanten Kₒ og udtrykket med ionernes koncentrationer." } },
            { id: "opløselighed", ord: ["opløselighed"], x: PX, y: L[2] - 7, maal: [0, 0], dele: ["x", "gram"],
              omr: [],
              fejl: { opløselighedsprodukt: "<b>opløselighedsprodukt</b> er konstanten Kₒ. Pladsen peger på, hvor meget PbI₂ der kan opløses i 100 mL vand.",
                      opløselighedsligevægt: "<b>opløselighedsligevægt</b> er balancen mellem salt og ioner. Pladsen peger på, hvor meget PbI₂ der kan opløses i 100 mL vand.",
                      mættet: "<b>mættet</b> siges om en opløsning. Pladsen peger på, hvor meget PbI₂ der kan opløses i 100 mL vand." } },

            { id: "umættet", ord: ["umættet"], x: GX[0], y: TY, maal: [GX[0], TY], titel: true, dele: ["g1"],
              omr: [{ r: kolonne(0), tom: true }],
              fejl: { mættet: "<b>mættet</b> betyder, at opløsningen ikke kan rumme mere salt. Her er Y mindre end Kₒ, og der er intet bundfald.",
                      overmættet: "<b>overmættet</b> betyder, at Y er større end Kₒ. Her er Y mindre end Kₒ, og der er intet bundfald." } },
            { id: "mættet", ord: ["mættet"], x: GX[1], y: TY, maal: [GX[1], TY], titel: true, dele: ["g2"],
              omr: [{ r: kolonne(1), tom: true }],
              fejl: { umættet: "<b>umættet</b> betyder, at Y er mindre end Kₒ. Her er Y lig med Kₒ, og saltet i bunden er i ligevægt med ionerne.",
                      overmættet: "<b>overmættet</b> betyder, at Y er større end Kₒ. Her er Y lig med Kₒ, og der er ligevægt.",
                      bundfald: "<b>bundfald</b> er det faste stof. Overskriften siger, hvordan opløsningen er, når Y er lig med Kₒ." } },
            { id: "overmættet", ord: ["overmættet"], x: GX[2], y: TY, maal: [GX[2], TY], titel: true, dele: ["g3"],
              omr: [{ r: kolonne(2), tom: true }],
              fejl: { mættet: "<b>mættet</b> betyder, at Y er lig med Kₒ. Her er Y større end Kₒ, og der dannes nyt bundfald.",
                      umættet: "<b>umættet</b> betyder, at Y er mindre end Kₒ. Her er Y større end Kₒ, og der dannes bundfald." } }
        ],

        tegn: function (api) {
            B2.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

            /* Ionreaktionen: PbI₂(s) maales, saa pladsen kan pege paa den */
            var vs = "Pb^2+(aq) + 2 I^−(aq)", hs = "PbI_2(s)";
            var wv = B2.bredde(vs, SK.fs, 700), wh = B2.bredde(hs, SK.fs, 700);
            var xs = SK.cx - (wv + 64 + wh) / 2;
            var AX0 = xs + wv + 12, AX1 = AX0 + 40;
            PBI.x = AX1 + 12; PBI.b = wh;
            var pt = plads("tungtopløselig");
            pt.omr = [{ r: [PBI.x - 8, SK.y - 24, PBI.b + 16, 34, 8] }];
            pt.maal = [PBI.x + PBI.b / 2, SK.y + 10];

            /* Beregningen: venstresiderne staar under hinanden til hoejre ved lighedstegnet */
            /* Som bogens eksempler i B2.7: massen i 1 L med molarmassen, og saa en
               tiendedel, fordi 100 mL er en tiendedel af en liter. Brugeren 2. nov.
               2026: "opløselighed skal pege ned til værdien, som har enheden g/100 mL".
               Venstresiden "opløselighed" er en streg i den graa udgave. */
            var venstre = ["K_{o}", "1,79 · 10^−8 M^3", "x", "m", "m", "m", "opløselighed"];
            var hoejre = ["[Pb^2+] · [I^−]^2", "x · (2x)^2", "1,65 · 10^−3 M", "n · M", "1,65 · 10^−3 mol · 461,00 g/mol", "0,761 g", "0,0761 g/100 mL"];
            var FED = [false, false, true, false, false, false, true];
            BER.c = LX + Math.max.apply(null, venstre.map(function (s) { return B2.bredde(s, BER.fs, 400); }));
            BER.slut = hoejre.map(function (s, i) { return BER.c + 34 + B2.bredde(s, BER.fs, FED[i] ? 700 : 400); });
            var pk = plads("opløselighedsprodukt"), px = plads("opløselighed");
            pk.omr = [{ r: [LX - 10, L[0] - 26, BER.slut[0] - LX + 20, 36, 8] }];
            pk.maal = [BER.slut[0] + 12, L[0] - 7];
            px.omr = [{ r: [LX - 10, L[6] - 26, BER.slut[6] - LX + 20, 36, 8] }];
            px.maal = [BER.slut[6] + 12, L[6] - 7];
            px.y = L[5] - 7;                                      /* en linje over, og stregen peger ned til vaerdien */

            /* ----- Lag 1: glassene, bundfaldet og ionreaktionen -------------------- */
            api.del("glas", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    [[C1, "Bly(II)nitrat", "Pb(NO_3)_2(aq)"], [C2, "Kaliumiodid", "KI(aq)"], [C3, "Blandingen", "PbI_2(s) og KNO_3(aq)"]].forEach(function (k) {
                        KV.tekst(g, k[0], RA.y + 44, k[1], { fs: 17, fed: true });
                        KV.tekst(g, k[0], RA.y + 64, k[2], { fs: 14, farve: F.daempet });
                    });
                    B2.baeger(g, C1, GBUND, GB, GH, 0.7, "blaa");
                    B2.baeger(g, C2, GBUND, GB, GH, 0.7, "blaa");
                    B2.baeger(g, C3, GBUND, GB + 8, GH, 0.74, "gul");
                    KV.tekst(g, (C1 + C2) / 2, MIDT + 10, "+", { fs: 32, fed: true, farve: F.daempet });
                    KV.pil(g, C2 + 92, MIDT + 2, C3 - 88, MIDT + 2, F.blaek, 2.8, 13);
                    KV.tekst(g, (C2 + C3) / 2 + 2, MIDT - 12, "blandes", { fs: 15, farve: F.daempet });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("bf", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    B2.bundfald(gg, C3, GBUND, GB + 8, GH, 15, 3);
                    B2.fnug(gg, C3, GBUND - GH * 0.74 + 14, GBUND - 34, GB - 20, 14, 4);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.glid(r.g, 0, -24, 0, 800); }
            });

            api.del("skema", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.tekst(gg, xs, SK.y, vs, { fs: SK.fs, fed: true, anker: "start" });
                    KV.pil(gg, AX0, SK.y - 7, AX1, SK.y - 7, F.blaek, 2.4, 11);
                    var t = KV.tekst(gg, PBI.x, SK.y, hs, { fs: SK.fs, fed: true, anker: "start", farve: "#9a7400" });
                    return { g: gg, t: t };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 400); an.pop(r.t, 200, 500); }
            });

            /* ----- Lag 2: opløselighedsligevægten og beregningen --------------------- */
            api.del("vindue", {
                lag: 1,
                fuld: function (g) {
                    B2.vindue(g, VI.x, VI.y, VI.b, VI.h, function (ind) {
                        var optaget = FRIE.map(function (f) { return [f[1], f[2], B2.ION_R[f[0]] + 4]; }).concat([[UD[0], UD[1], 26], [IND[0], IND[1], 18], [PO.x + PO.b / 2, PO.y - 20, 30]]);
                        B2.vandI(ind, FLADE + 14, VI.y + 8, VI.x + VI.b - 8, VI.y + VI.h - 8, 13, 9, function (x, y) {
                            return !(x > PO.x && x < PO.x + PO.b - 30 && y > PO.y - 6 && y < PO.y + PO.h) &&
                                optaget.every(function (o) { return Math.hypot(x - o[0], y - o[1]) > o[2] + 12; });
                        });
                        B2.gitter(ind, 30, Y0, 3, 3, function (x, y, r) { return x - r > VI.x && y - r > VI.y && y + r < VI.y + VI.h; });
                        FRIE.forEach(function (f) { B2.ion(ind, f[1], f[2], f[0], f[0] === "I^−" ? 22 : 13.5, f[0] === "I^−" ? 14 : 10); });
                        B2.ion(ind, UD[0], UD[1], "I^−", 22, 14);
                        B2.ion(ind, IND[0], IND[1], "Pb^2+", 13.5, 10);
                        KV.pil(ind, FLADE + 6, UD[1], UD[0] - 28, UD[1], F.serieB, 2.8, 12);
                        KV.tekst(ind, (FLADE + UD[0] - 22) / 2, UD[1] - 15, "opløses", { fs: 14.5, fed: true, farve: F.serieB, halo: "#eef5fb" });
                        KV.pil(ind, IND[0] - 19.5, IND[1], FLADE + 6, IND[1], B2.F.lilla, 2.8, 12);
                        KV.tekst(ind, (FLADE + IND[0] - 14) / 2, IND[1] - 15, "udfældes", { fs: 14.5, fed: true, farve: B2.F.lilla, halo: "#eef5fb" });
                    }, "url(#b2-vindue-vand)");
                    KV.tekst(g, 92, VI.y + VI.h + 22, "iongitter af PbI_2", { fs: 14, farve: F.daempet });
                    KV.tekst(g, 330, VI.y + VI.h + 22, "opløste ioner i vandet", { fs: 14, farve: F.daempet });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            function linje(g, i, farve, fed) {
                var gg = SV.g(g), o = { fs: BER.fs, farve: farve || F.blaek, fed: !!fed };
                /* Venstresiden, der ville afsloere pladsen, er en streg i den graa udgave */
                if (venstre[i] === "opløselighed" && g.getAttribute("class") === "spoeg") {
                    KV.linje(gg, BER.c - 92, L[i] + 3, BER.c - 4, L[i] + 3, F.daempet, 1.6);
                } else KV.tekst(gg, BER.c, L[i], venstre[i], { fs: o.fs, farve: o.farve, fed: o.fed, anker: "end" });
                KV.tekst(gg, BER.c + 17, L[i], "=", { fs: o.fs, farve: o.farve, fed: o.fed });
                KV.tekst(gg, BER.c + 34, L[i], hoejre[i], { fs: o.fs, farve: o.farve, fed: o.fed, anker: "start" });
                return gg;
            }

            api.del("ko", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, KB.x, KB.y, KB.b, KB.h);
                    var sy = KB.y + 36;
                    KV.tekst(g, LX, sy, "PbI_2(s)", { fs: 17, fed: true, anker: "start" });
                    var w = B2.bredde("PbI_2(s)", 17, 700);
                    B2.dobbeltpil(g, LX + w + 10, LX + w + 50, sy - 6, F.blaek, 2, 8);
                    KV.tekst(g, LX + w + 60, sy, "Pb^2+(aq) + 2 I^−(aq)", { fs: 17, fed: true, anker: "start" });
                    var l1 = linje(g, 0);
                    var l2 = linje(g, 1);
                    KV.tekst(g, BER.slut[1] + 18, L[1], "x: opløst PbI_2 i mol pr. L", { fs: 14, farve: F.daempet, anker: "start" });
                    return { l1: l1, l2: l2 };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.l1, 100, 450); an.pop(r.l2, 300, 450); }
            });

            api.del("x", {
                lag: 1,
                fuld: function (g) {
                    var l3 = linje(g, 2, F.accent, true);
                    return { l3: l3 };
                },
                byg: function (g, r, an) { an.pop(r.l3, 0, 500); }
            });

            /* Fra mol pr. liter til gram pr. 100 mL med molarmassen af PbI₂
               (207,20 + 2 · 126,90 = 461,00 g/mol) */
            api.del("gram", {
                lag: 1,
                fuld: function (g) {
                    var l4 = linje(g, 3), l5 = linje(g, 4), l6 = linje(g, 5), l7 = linje(g, 6, F.accent, true);
                    KV.tekst(g, BER.slut[3] + 18, L[3], "n: opløst PbI_2 i 1 L vand, M: molarmassen", { fs: 14, farve: F.daempet, anker: "start" });
                    KV.tekst(g, BER.slut[6] + 50, L[6], "en tiendedel af 0,761 g", { fs: 14, farve: F.daempet, anker: "start" });
                    return { l4: l4, l5: l5, l6: l6, l7: l7 };
                },
                byg: function (g, r, an) { an.pop(r.l4, 0, 400); an.pop(r.l5, 150, 400); an.pop(r.l6, 300, 400); an.pop(r.l7, 450, 500); }
            });

            /* ----- Lag 3: tre glas -------------------------------------------------- */
            ["g1", "g2", "g3"].forEach(function (id, k) {
                api.del(id, { lag: 2, fuld: function (g) { glas3(g, k); return {}; }, byg: function (g, r, an) { an.fade(g, 0, 500); } });
            });
        }
    };
}());

/* =====================================================================
   fig_aminer.js - figuren til B4.6 Aminer

   Foroven bogens b4-amin-typer uden ammoniak: methylamin, dimethylamin
   og trimethylamin i hvert sit kort med primær, sekundær og tertiær amin
   som titler og amin som overskrift for rækken til venstre (som alkohol
   i B4.2). Bogens linjer "primær amin" osv. under navnene er taget af.
   Methylamin er spejlet, så NH₂ vender mod stregen fra aminogruppe.
   I midten til venstre ammoniak og vand i ligevægt; pladsen svag base
   sidder på ammoniak, som bogen bruger som eksempel. Ammoniak er ikke en
   amin, så ordene om aminer passer ikke dér. Til højre bogens b4-peptid:
   to glycin giver et dipeptid og vand, med amidgruppen markeret.
   Nederst aminosyrer som perler, der ved polykondensation bliver til en
   lang kæde: et protein. Den figur er ikke i bogen.
   Ti fagord i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var HX = 133, BX = 262;
    var BAAND = [BX, 12, 886, 262];
    var KX = [272, 566, 860], KB = 280, KY = 32, KH = 226;
    var L = 40, MY = KY + 112, NY = KY + 186;
    /* Methylamin spejlet: N med H op og H ned til venstre, kaeden ned til hoejre */
    var M_N = [KX[0] + 150, MY - 8];
    var M = { hop: ORG.fra(M_N, L, -90), hv: ORG.fra(M_N, L, 150), c: ORG.fra(M_N, L + 4, 30) };
    var D_N = [KX[1] + KB / 2, MY - 8], T_N = [KX[2] + KB / 2, MY - 8];
    var NH2 = [M.hv[0] - 18, M.hop[1] - 16, M_N[0] - M.hv[0] + 34, M.hv[1] - M.hop[1] + 32];

    var KP = { x: 14, y: 298, b: 1132, h: 190 };
    var KL = { x: 14, y: 506, b: 440, h: 196 }, KN = { x: 470, y: 506, b: 676, h: 196 };
    var LY = KL.y + 122, PY = KP.y + 122, PL = 30, NX = KL.x + 130;
    var NYY = KN.y + 120;

    /* Glycin: H₂N, CH₂, C(=O), OH */
    function glycin(n) {
        var c1 = ORG.fra(n, PL, 30), c2 = ORG.fra(c1, PL, -30);
        return { n: n, c1: c1, c2: c2, o: ORG.fra(c2, PL, -90), oh: ORG.fra(c2, PL, 30) };
    }
    var G1 = glycin([KP.x + 170, PY - 14]), G2 = glycin([KP.x + 410, PY - 14]);
    /* Dipeptid: H₂N-CH₂-C(=O)-NH-CH₂-COOH */
    var DP = glycin([KP.x + 700, PY - 14]);
    DP.nh = DP.oh; DP.c3 = ORG.fra(DP.nh, PL, -30); DP.c4 = ORG.fra(DP.c3, PL, 30);
    DP.o2 = ORG.fra(DP.c4, PL, -90); DP.oh2 = ORG.fra(DP.c4, PL, 30);
    var AMID = [DP.c2[0] - 15, DP.o[1] - 16, DP.nh[0] - DP.c2[0] + 30, DP.nh[1] - DP.o[1] + 44];

    /* Perlerne */
    var LOSE = [[56, -40], [108, -8], [40, 12], [150, -36], [138, 22], [86, 32]];
    var NK_K = 13, KAEDE = [];
    for (var i = 0; i < NK_K; i++) KAEDE.push([KN.x + 330 + i * 24, NYY + 13 * Math.sin(i * 0.75)]);
    var KS = KAEDE[NK_K - 1], K_MIDT = (KAEDE[0][0] + KS[0]) / 2;
    var PILX = [KN.x + 196, KN.x + 290];

    function titel(id, i, dele, fejl) {
        return { id: id, ord: [id], x: KX[i] + KB / 2, y: KY, maal: [KX[i] + KB / 2, KY], titel: true, dele: dele,
            omr: [{ r: [KX[i] - 5, KY - 5, KB + 10, KH + 10, 16], tom: true }], fejl: fejl };
    }
    function typefejl(navn, her) {
        var o = {};
        [["primær amin", "én carbonkæde"], ["sekundær amin", "to carbonkæder"], ["tertiær amin", "tre carbonkæder"]].forEach(function (t) {
            if (t[0] !== navn) o[t[0]] = "<b>" + t[0] + "</b> har " + t[1] + " på nitrogenatomet. " + her;
        });
        o.amin = "<b>amin</b> passer på alle tre kort og står foran rækken. Titlen her siger, hvor mange carbonkæder nitrogenatomet har.";
        o["svag base"] = "<b>svag base</b> passer også på aminer. Titlen her siger, hvor mange carbonkæder nitrogenatomet har.";
        o.aminogruppe = "<b>aminogruppe</b> er kun −NH₂. Kortets titel siger, hvor mange carbonkæder nitrogenatomet har.";
        o.aminosyre = "<b>aminosyre</b> har både −NH₂ og −COOH. Stoffet her har ingen carboxylgruppe.";
        return o;
    }

    NK.FIGURER.aminer = {
        vb: [1160, 716],
        lag: [
            { navn: "Primær, sekundær og tertiær", pladser: ["primær amin", "sekundær amin", "tertiær amin"],
              ros: "Nitrogenatomet har én carbonkæde i en primær amin, to i en sekundær og tre i en tertiær amin." },
            { navn: "Amin og base", pladser: ["amin", "aminogruppe", "svag base"],
              ros: "Alle tre stoffer er aminer, og methylamin har en aminogruppe. Ammoniak er en svag base ligesom aminerne." },
            { navn: "Dipeptid", pladser: ["aminosyre", "amidgruppe"],
              ros: "En aminosyre har både −NH₂ og −COOH. To aminosyrer kondenserer, og amidgruppen holder dem sammen." },
            { navn: "Protein", pladser: ["protein", "polykondensation"],
              ros: "Ved polykondensation bliver hundredvis af aminosyrer sat sammen til et protein, mens der fraspaltes vand." }
        ],
        pladser: [
            titel("primær amin", 0, ["n0"], typefejl("primær amin", "Methylamin har kun én carbonkæde og to H.")),
            titel("sekundær amin", 1, ["n1"], typefejl("sekundær amin", "Dimethylamin har to carbonkæder og ét H.")),
            titel("tertiær amin", 2, ["n2"], typefejl("tertiær amin", "Trimethylamin har tre carbonkæder og intet H.")),

            { id: "amin", ord: ["amin"], x: HX, y: 76, maal: [BX, 76], titel: true, dele: ["baand"],
              omr: [{ r: [BAAND[0], BAAND[1], BAAND[2], BAAND[3], 16], tom: true }],
              fejl: { "primær amin": "<b>primær amin</b> er kun det første kort. Overskriften gælder alle tre stoffer i rækken.",
                      "sekundær amin": "<b>sekundær amin</b> er kun det midterste kort. Overskriften gælder alle tre stoffer i rækken.",
                      "tertiær amin": "<b>tertiær amin</b> er kun det sidste kort. Overskriften gælder alle tre stoffer i rækken.",
                      aminogruppe: "<b>aminogruppe</b> er kun −NH₂. Overskriften gælder hele stofferne i rækken.",
                      "svag base": "<b>svag base</b> passer også på aminer, men overskriften er stofklassen for alle tre stoffer i rækken." } },
            { id: "aminogruppe", ord: ["aminogruppe"], x: HX, y: 196, maal: [NH2[0] - 2, NH2[1] + NH2[3] * 0.7], via: [BX - 12, 196], dele: ["nh2"],
              omr: [{ r: [NH2[0], NH2[1], NH2[2], NH2[3], 14] }],
              fejl: { amin: "<b>amin</b> er hele stoffet. Pladsen peger kun på −NH₂.",
                      "primær amin": "<b>primær amin</b> er hele stoffet. Pladsen peger kun på −NH₂.",
                      amidgruppe: "<b>amidgruppe</b> er −CO−NH−. Pladsen peger på −NH₂ i methylamin, hvor der ikke er C=O.",
                      "svag base": "<b>svag base</b> siges om hele stoffet. Pladsen peger kun på −NH₂." } },
            { id: "svag base", ord: ["svag base"], x: NX, y: KL.y + 44, maal: [NX, LY - 22], dele: ["nh3"],
              omr: [{ r: [NX - 30, LY - 20, 60, 40, 12] }],
              fejl: { amin: "<b>amin</b> har et nitrogenatom bundet til en carbonkæde. Ammoniak har ingen carbonkæde.",
                      "primær amin": "<b>primær amin</b> har én carbonkæde på nitrogenatomet. Ammoniak har ingen carbonkæde.",
                      aminogruppe: "<b>aminogruppe</b> er −NH₂ på en carbonkæde. Pladsen peger på ammoniak, der optager en hydron fra vand.",
                      aminosyre: "<b>aminosyre</b> har −NH₂ og −COOH. Pladsen peger på ammoniak, der optager en hydron fra vand." } },

            { id: "aminosyre", ord: ["aminosyre"], x: G1.c1[0] + 10, y: KP.y + 40, maal: [G1.c1[0] + 10, G1.o[1] - 18], dele: ["g1"],
              omr: [{ r: [G1.n[0] - 40, G1.o[1] - 16, G1.oh[0] - G1.n[0] + 70, G1.c1[1] - G1.o[1] + 32, 14] }],
              fejl: { amin: "<b>amin</b> passer på −NH₂, men glycin har også −COOH. Pladsen spørger om navnet for et molekyle med begge grupper.",
                      "primær amin": "<b>primær amin</b> passer på −NH₂, men glycin har også −COOH. Pladsen spørger om navnet med begge grupper.",
                      protein: "<b>protein</b> er hundredvis af enheder sat sammen. Pladsen peger på ét lille molekyle.",
                      amidgruppe: "<b>amidgruppe</b> er −CO−NH− i dipeptidet. Pladsen peger på glycin før reaktionen." } },
            { id: "amidgruppe", ord: ["amidgruppe"], x: DP.nh[0] - 4, y: KP.y + 40, maal: [AMID[0] + AMID[2] / 2, AMID[1] - 2], dele: ["amid"],
              omr: [{ r: [AMID[0], AMID[1], AMID[2], AMID[3], 12] }],
              fejl: { aminogruppe: "<b>aminogruppe</b> er −NH₂. Pladsen peger på −CO−NH−, der binder de to glycin sammen.",
                      aminosyre: "<b>aminosyre</b> er et helt molekyle. Pladsen peger kun på −CO−NH−.",
                      polykondensation: "<b>polykondensation</b> er en reaktion. Pladsen peger på atomerne −CO−NH−." } },
            { id: "polykondensation", ord: ["polykondensation"], x: (PILX[0] + PILX[1]) / 2 - 12, y: KN.y + 44, maal: [(PILX[0] + PILX[1]) / 2, NYY - 10], dele: ["pilN"],
              omr: [{ r: [PILX[0] - 6, NYY - 18, PILX[1] - PILX[0] + 12, 36, 10] }],
              fejl: { protein: "<b>protein</b> er kæden, der dannes. Pladsen peger på reaktionen, hvor der fraspaltes vand.",
                      amidgruppe: "<b>amidgruppe</b> er atomerne −CO−NH−. Pladsen peger på reaktionen, der sætter perlerne sammen.",
                      aminosyre: "<b>aminosyre</b> er én perle. Pladsen peger på reaktionen, der sætter perlerne sammen." } },
            { id: "protein", ord: ["protein"], x: K_MIDT + 14, y: KN.y + 44, maal: [K_MIDT, NYY - 28], dele: ["kaede"],
              omr: [{ r: [KAEDE[0][0] - 18, NYY - 28, KS[0] - KAEDE[0][0] + 36, 56, 16] }],
              fejl: { aminosyre: "<b>aminosyre</b> er én perle. Pladsen peger på den lange kæde af hundredvis af perler.",
                      polykondensation: "<b>polykondensation</b> er reaktionen. Pladsen peger på kæden, der dannes.",
                      amidgruppe: "<b>amidgruppe</b> holder perlerne sammen. Pladsen peger på hele den lange kæde." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var NN = { farve: F.accent };
            function linje(a, b) { return [a, b, 1, 0, F.accent]; }

            /* ----- Lag 1: de tre aminer ----------------------------------------------- */
            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    [0, 1, 2].forEach(function (i) { ORG.kortB(g, KX[i], KY, KB, KH); });
                    ORG.navn(g, KX[0] + KB / 2, NY, "methylamin", "kogepunkt −6 °C");
                    ORG.navn(g, KX[1] + KB / 2, NY, "dimethylamin", "kogepunkt 7 °C");
                    ORG.navn(g, KX[2] + KB / 2, NY, "trimethylamin", "kogepunkt 3 °C");
                }
            });
            api.del("n0", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.skelet(gg, [[M_N[0], M_N[1], "N", NN], [M.hop[0], M.hop[1], "H"], [M.hv[0], M.hv[1], "H"], [M.c[0], M.c[1]]],
                        [linje(0, 1), linje(0, 2), [0, 3]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("n1", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), a = ORG.fra(D_N, L + 4, 150), b = ORG.fra(D_N, L + 4, 30), h = ORG.fra(D_N, L, -90);
                    ORG.skelet(gg, [[D_N[0], D_N[1], "N", NN], [h[0], h[1], "H"], [a[0], a[1]], [b[0], b[1]]], [linje(0, 1), [0, 2], [0, 3]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("n2", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), a = ORG.fra(T_N, L + 4, 150), b = ORG.fra(T_N, L + 4, 30), c = ORG.fra(T_N, L + 4, -90);
                    ORG.skelet(gg, [[T_N[0], T_N[1], "N", NN], [c[0], c[1]], [a[0], a[1]], [b[0], b[1]]], [[0, 1], [0, 2], [0, 3]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: amin, aminogruppe og ammoniak -------------------------------- */
            api.del("baand", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: BAAND[0], y: BAAND[1], width: BAAND[2], height: BAAND[3], rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("nh2", {
                lag: 1,
                fuld: function (g) { return { b: ORG.boks(g, NH2[0], NH2[1], NH2[2], NH2[3], { rx: 14 }) }; },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });
            api.del("baseL", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KL.x, KL.y, KL.b, KL.h);
                    ORG.plus(g, NX + 40, LY);
                    ORG.f(g, NX + 78, LY, "H_2O", { fs: 19 });
                    ORG.reaktionspil(g, NX + 108, NX + 152, LY, { lig: true });
                    ORG.f(g, NX + 190, LY, "NH_4^+", { fs: 19, farve: F.pos });
                    ORG.plus(g, NX + 236, LY);
                    ORG.f(g, NX + 272, LY, "OH^−", { fs: 19, farve: F.neg });
                    ORG.navn(g, NX, KL.y + 168, "ammoniak");
                }
            });
            api.del("nh3", {
                lag: 1,
                fuld: function (g) { return { t: ORG.f(g, NX, LY, "NH_3", { fs: 20, farve: F.accent }) }; },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            /* ----- Lag 3: aminosyrer, amidgruppe og protein ----------------------------- */
            function glyTegn(g, gl) {
                ORG.skelet(g, [[gl.n[0], gl.n[1], "H_2N", { anker: "end", farve: F.accent }], [gl.c1[0], gl.c1[1]], [gl.c2[0], gl.c2[1]],
                    [gl.o[0], gl.o[1], "O", { farve: F.accent }], [gl.oh[0], gl.oh[1], "OH", { anker: "start", farve: F.accent }]],
                    [linje(0, 1), [1, 2], [2, 3, 2, 0, F.accent], linje(2, 4)], { fs: 18 });
            }
            api.del("baseP", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KP.x, KP.y, KP.b, KP.h);
                    ORG.plus(g, KP.x + 320, PY - 6);
                    glyTegn(g, G2);
                    ORG.reaktionspil(g, KP.x + 560, KP.x + 620, PY - 6);
                    ORG.skelet(g, [[DP.n[0], DP.n[1], "H_2N", { anker: "end", farve: F.accent }], [DP.c1[0], DP.c1[1]], [DP.c2[0], DP.c2[1]],
                        [DP.o[0], DP.o[1], "O", { farve: F.accent }], [DP.nh[0], DP.nh[1], "N", { farve: F.accent }], [DP.nh[0], DP.nh[1] + PL, "H", { farve: F.accent }],
                        [DP.c3[0], DP.c3[1]], [DP.c4[0], DP.c4[1]], [DP.o2[0], DP.o2[1], "O", { farve: F.accent }], [DP.oh2[0], DP.oh2[1], "OH", { anker: "start", farve: F.accent }]],
                        [linje(0, 1), [1, 2], [2, 3, 2, 0, F.accent], linje(2, 4), linje(4, 5), [4, 6], [6, 7], [7, 8, 2, 0, F.accent], linje(7, 9)], { fs: 18 });
                    ORG.plus(g, KP.x + 940, PY - 6);
                    ORG.f(g, KP.x + 990, PY - 6, "H_2O", { fs: 19 });
                    ORG.navn(g, G1.c1[0] + 6, KP.y + 176, "glycin");
                    ORG.navn(g, G2.c1[0] + 6, KP.y + 176, "glycin");
                    ORG.navn(g, DP.nh[0], KP.y + 176, "dipeptid");
                    ORG.navn(g, KP.x + 990, KP.y + 176, "vand");
                }
            });
            api.del("g1", {
                lag: 2,
                fuld: function (g) { var gg = SV.g(g); glyTegn(gg, G1); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("amid", {
                lag: 2,
                fuld: function (g) { return { b: ORG.boks(g, AMID[0], AMID[1], AMID[2], AMID[3]) }; },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });
            api.del("baseN", {
                lag: 3, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KN.x, KN.y, KN.b, KN.h);
                    LOSE.forEach(function (p, i) { ORG.perle(g, KN.x + p[0], NYY + p[1], 13, i); });
                    ORG.t(g, KN.x + 96, KN.y + KN.h - 16, "glycin, alanin, serin …", { fs: 13.5, farve: F.daempet });
                    /* (navne paa aminosyrer; ordet aminosyre staar ikke her, fordi det er pladsen i skemaet foroven) */
                }
            });
            api.del("pilN", {
                lag: 3,
                fuld: function (g) { return { p: ORG.reaktionspil(g, PILX[0], PILX[1], NYY, { under: "vand fraspaltes" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("kaede", {
                lag: 3,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("polyline", { points: KAEDE.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "), fill: "none", stroke: "#7d8e8d", "stroke-width": 2.4 }, gg);
                    KAEDE.forEach(function (p, i) { ORG.perle(gg, p[0], p[1], 11, (i * 3 + 1) % 4); });
                    SV.el("line", { x1: KS[0] + 14, y1: KS[1], x2: KS[0] + 30, y2: KS[1], stroke: F.blaek, "stroke-width": 2.6, "stroke-dasharray": "1 6", "stroke-linecap": "round" }, gg);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });
        }
    };
}());

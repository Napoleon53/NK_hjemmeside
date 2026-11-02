/* =====================================================================
   fig_alkoholer.js - figuren til B4.2 Alkoholer

   Foroven bogens b4-alkohol-typer: butan-1-ol, butan-2-ol og
   2-methylpropan-2-ol i hvert sit kort med en grøn prik på carbonatomet
   med OH og orange prikker på de naboer, der er carbonatomer. Kortenes
   titler er primær, sekundær og tertiær alkohol, og rækkens overskrift
   til venstre er alkohol. Bogens linjer "1 carbonatom som nabo" osv. er
   taget af, fordi de afslører pladserne; prikkerne viser det samme.
   Butan-1-ol er spejlet, så HO står til venstre, hvor stregen fra
   hydroxygruppe kommer ind.
   Forneden phenol (OH på en benzenring) og gæring af sukker. Navnet
   phenol står ikke under ringen, fordi det er pladsen.
   Syv fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var HX = 131, BX = 258;                                /* overskrifterne og baandet */
    var BAAND = [BX, 12, 890, 252];
    var KX = [268, 561, 854], KB = 284, KY = 30, KH = 216;
    var L = 36, MY = KY + 112, NY = KY + 192;
    var KPH = { x: 14, y: 324, b: 548, h: 230 }, KG = { x: 578, y: 324, b: 568, h: 230 };
    var ORANGE = ["#f59e0b", "#b45309"];

    /* Butan-1-ol spejlet: HO, C1, C2, C3, C4 fra venstre */
    var B1 = ORG.zz(KX[0] + 52, MY + 4, 5, L, 30);
    /* Butan-2-ol: fire C med OH op fra C2 */
    var B2 = ORG.zz(KX[1] + KB / 2 - 1.5 * L * 0.866, MY + 12, 4, L, -30);
    var B2_OH = ORG.fra(B2[1], L, -90);
    /* 2-methylpropan-2-ol */
    var T_C = [KX[2] + KB / 2 - 6, MY + 4];
    var T = [ORG.fra(T_C, L, -125), ORG.fra(T_C, L, 125), ORG.fra(T_C, L, 55)];
    var T_OH = ORG.fra(T_C, L, -55);
    /* Phenol og gæring */
    var PH = [KPH.x + KPH.b / 2, KPH.y + 138], R6 = 30;
    var GY = KG.y + 118;

    function ohBoks() {
        var w = NK.tekstBredde("HO", 20, 700), wO = NK.tekstBredde("O", 20, 700);
        return [B1[0][0] + wO / 2 - w - 8, B1[0][1] - 18, w + 16, 36];
    }
    var OHB = ohBoks();

    function titel(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y, maal: [k.x + k.b / 2, k.y], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16], tom: true }], fejl: fejl };
    }
    function kort(i) { return { x: KX[i], y: KY, b: KB, h: KH }; }
    var TYPEFEJL = function (her) {
        var o = {};
        [["primær alkohol", "ét carbonatom som nabo"], ["sekundær alkohol", "to carbonatomer som naboer"], ["tertiær alkohol", "tre carbonatomer som naboer"]].forEach(function (t) {
            o[t[0]] = "<b>" + t[0] + "</b> har " + t[1] + ". Her har carbonatomet med OH " + her + ".";
        });
        o.alkohol = "<b>alkohol</b> passer på alle tre kort og står foran rækken. Titlen her siger, hvor mange naboer carbonatomet har.";
        o.phenol = "<b>phenol</b> har OH direkte på en benzenring. Stoffet her har OH på en kæde.";
        o.hydroxygruppe = "<b>hydroxygruppe</b> er kun −OH. Kortets titel siger, hvor mange naboer carbonatomet med OH har.";
        return o;
    };
    function udenSig(o, ord) { delete o[ord]; return o; }

    NK.FIGURER.alkoholer = {
        vb: [1160, 568],
        lag: [
            { navn: "Primær, sekundær og tertiær", pladser: ["primær alkohol", "sekundær alkohol", "tertiær alkohol"],
              ros: "Carbonatomet med OH har én carbonnabo i en primær alkohol, to i en sekundær og tre i en tertiær alkohol." },
            { navn: "Alkohol og phenol", pladser: ["alkohol", "hydroxygruppe", "phenol", "gæring"],
              ros: "Alle tre er alkoholer med en hydroxygruppe. Phenol har OH på en benzenring. Ved gæring dannes ethanol." }
        ],
        pladser: [
            titel("primær alkohol", kort(0), ["prikker0"], udenSig(TYPEFEJL("kun én orange nabo"), "primær alkohol")),
            titel("sekundær alkohol", kort(1), ["prikker1"], udenSig(TYPEFEJL("to orange naboer"), "sekundær alkohol")),
            titel("tertiær alkohol", kort(2), ["prikker2"], udenSig(TYPEFEJL("tre orange naboer"), "tertiær alkohol")),

            { id: "alkohol", ord: ["alkohol"], x: HX, y: 72, maal: [BX, 72], titel: true, dele: ["baand"],
              omr: [{ r: [BAAND[0], BAAND[1], BAAND[2], BAAND[3], 16], tom: true }],
              fejl: { "primær alkohol": "<b>primær alkohol</b> er kun det første kort. Overskriften gælder alle tre stoffer i rækken.",
                      "sekundær alkohol": "<b>sekundær alkohol</b> er kun det midterste kort. Overskriften gælder alle tre stoffer i rækken.",
                      "tertiær alkohol": "<b>tertiær alkohol</b> er kun det sidste kort. Overskriften gælder alle tre stoffer i rækken.",
                      hydroxygruppe: "<b>hydroxygruppe</b> er kun −OH. Overskriften gælder hele stofferne i rækken.",
                      phenol: "<b>phenol</b> har OH på en benzenring. Stofferne i rækken har OH på en kæde." } },
            { id: "hydroxygruppe", ord: ["hydroxygruppe"], x: HX, y: 188, maal: [OHB[0] - 2, OHB[1] + OHB[3] / 2], via: [BX - 12, 188], dele: ["ohboks"],
              omr: [{ r: [OHB[0], OHB[1], OHB[2], OHB[3], 14] }],
              fejl: { alkohol: "<b>alkohol</b> er hele stoffet. Pladsen peger kun på −OH i enden af kæden.",
                      phenol: "<b>phenol</b> er et stof med OH på en benzenring. Pladsen peger kun på gruppen −OH.",
                      "primær alkohol": "<b>primær alkohol</b> er hele stoffet. Pladsen peger kun på −OH.",
                      gæring: "<b>gæring</b> er en proces. Pladsen peger på gruppen −OH i enden af kæden." } },
            titel("phenol", KPH, ["ring"], {
                alkohol: "<b>alkohol</b> har OH på en kæde. Her sidder OH direkte på en benzenring, og stoffet er en svag syre.",
                hydroxygruppe: "<b>hydroxygruppe</b> er kun −OH. Kortets titel er navnet på hele stoffet med benzenringen.",
                "primær alkohol": "<b>primær alkohol</b> har OH på en kæde. Her sidder OH direkte på en benzenring.",
                gæring: "<b>gæring</b> er en proces. Kortets titel er navnet på stoffet med OH på en benzenring." }),
            titel("gæring", KG, ["pilG"], {
                alkohol: "<b>alkohol</b> er et stof. Kortets titel er navnet på processen, hvor gærceller omdanner sukker til ethanol.",
                phenol: "<b>phenol</b> er et stof med OH på en benzenring. Kortets titel er navnet på en proces.",
                hydroxygruppe: "<b>hydroxygruppe</b> er gruppen −OH. Kortets titel er navnet på processen med sukker og gærceller." })
        ],

        tegn: function (api) {
            ORG.defs();
            var OH = { anker: "start", farve: F.accent }, HO = { anker: "end", farve: F.accent };
            function prik(g, p, groen) {
                SV.el("circle", { cx: p[0], cy: p[1], r: 6, fill: groen ? F.accent : ORANGE[0], stroke: groen ? "#0b4f49" : ORANGE[1], "stroke-width": 1.4 }, g);
            }

            /* ----- Kortene med de tre alkoholer ------------------------------------ */
            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    [0, 1, 2].forEach(function (i) { ORG.kortB(g, KX[i], KY, KB, KH); });
                    ORG.skelet(g, B1.map(function (p, i) { return i === 0 ? [p[0], p[1], "HO", HO] : [p[0], p[1]]; }),
                        [[0, 1, 1, 0, F.accent], [1, 2], [2, 3], [3, 4]]);
                    ORG.skelet(g, [[B2[0][0], B2[0][1]], [B2[1][0], B2[1][1]], [B2[2][0], B2[2][1]], [B2[3][0], B2[3][1]], [B2_OH[0], B2_OH[1], "OH", OH]],
                        [[0, 1], [1, 2], [2, 3], [1, 4, 1, 0, F.accent]]);
                    ORG.skelet(g, [[T_C[0], T_C[1]], [T[0][0], T[0][1]], [T[1][0], T[1][1]], [T[2][0], T[2][1]], [T_OH[0], T_OH[1], "OH", OH]],
                        [[0, 1], [0, 2], [0, 3], [0, 4, 1, 0, F.accent]]);
                    ORG.navn(g, KX[0] + KB / 2, NY, "butan-1-ol");
                    ORG.navn(g, KX[1] + KB / 2, NY, "butan-2-ol");
                    ORG.navn(g, KX[2] + KB / 2, NY, "2-methylpropan-2-ol");
                }
            });
            [[[B1[1]], [B1[2]]], [[B2[1]], [B2[0], B2[2]]], [[T_C], T]].forEach(function (pr, i) {
                api.del("prikker" + i, {
                    lag: 0,
                    fuld: function (g) {
                        var gg = SV.g(g);
                        pr[1].forEach(function (p) { prik(gg, p, false); });
                        pr[0].forEach(function (p) { prik(gg, p, true); });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.pop(r.g, 0, 450); }
                });
            });
            /* Forklaringen af prikkerne staar under baandet */
            api.del("tegnforklaring", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var y = BAAND[1] + BAAND[3] + 14;
                    prik(g, [BX + 230, y], true);
                    ORG.t(g, BX + 244, y + 5, "carbonatomet med OH", { fs: 13.5, anker: "start", farve: F.daempet });
                    prik(g, [BX + 470, y], false);
                    ORG.t(g, BX + 484, y + 5, "nabo, der er et carbonatom", { fs: 13.5, anker: "start", farve: F.daempet });
                }
            });

            /* ----- Lag 2 ------------------------------------------------------------- */
            api.del("baand", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: BAAND[0], y: BAAND[1], width: BAAND[2], height: BAAND[3], rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("ohboks", {
                lag: 1,
                fuld: function (g) { return { b: ORG.boks(g, OHB[0], OHB[1], OHB[2], OHB[3], { rx: 14 }) }; },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, KPH.x, KPH.y, KPH.b, KPH.h);
                    ORG.kortB(g, KG.x, KG.y, KG.b, KG.h);
                    ORG.t(g, PH[0], KPH.y + KPH.h - 26, "C_6H_6O", { fs: 15, farve: F.daempet });
                    ORG.f(g, KG.x + 88, GY, "C_6H_{12}O_6");
                    ORG.f(g, KG.x + 318, GY, "2 C_2H_5OH");
                    ORG.plus(g, KG.x + 410, GY);
                    ORG.f(g, KG.x + 480, GY, "2 CO_2");
                    ORG.navn(g, KG.x + 88, GY + 48, "glucose", "sukker");
                    ORG.navn(g, KG.x + 318, GY + 48, "ethanol");
                    ORG.navn(g, KG.x + 480, GY + 48, "carbondioxid");
                }
            });
            api.del("ring", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    var P = ORG.ring(gg, PH[0], PH[1], R6, { dobbelt: [0, 2, 4] });
                    ORG.skelet(gg, [[P[0][0], P[0][1]], [P[0][0], P[0][1] - L, "OH", OH]], [[0, 1, 1, 0, F.accent]]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("pilG", {
                lag: 1,
                fuld: function (g) { return { p: ORG.reaktionspil(g, KG.x + 170, KG.x + 240, GY, { over: "gærceller" }) }; },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
        }
    };
}());

/* =====================================================================
   fig_struktur.js - figuren til B3.3 Strukturisomeri

   Bogens b3-isomeri-oversigt som et træ: isomerer øverst, under den
   strukturisomerer og et gråt skilt med stereoisomerer (afsnit B3.4),
   og under strukturisomerer tre kort som bogens b3-kaedeisomeri,
   b3-stillingsisomeri og b3-funktionsisomeri: butan og 2-methylpropan,
   propan-1-ol og propan-2-ol, ethanol og CH₃−O−CH₃. Kortenes titler er
   pladserne; molekylformlen står i kortets grønne hoved som i bogen.
   Dimethylether hedder CH₃−O−CH₃ i figuren, fordi navnet ville afsløre
   pladsen ether, og bogens "en alkohol" og "en ether" er taget af.
   Seks fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var KX = [166, 463, 760], KB = 285, KY = 186, KH = 290, HH = 52;     /* kortene */
    var SN = { x: 463, y: 116 }, STEREO = { x: 1015, y: 116 }, TOPN = { x: 739, y: 36 };
    var MY = KY + 150, L = 40;
    var XA = -70, XB = 70;                                                 /* molekylerne i et kort */

    /* Molekylerne: punkter og etiketter */
    var BUTAN = ORG.zz(KX[0] + XA - 1.5 * L * 0.866, MY + 10, 4, L, -30);
    var MP_C = [KX[0] + XB, MY + 2];
    var PROP1 = ORG.zz(KX[1] + XA - 1.7 * L * 0.866, MY + 10, 4, L, -30);
    var P2_C = [KX[1] + XB, MY + 14];
    var ETH = ORG.zz(KX[2] + XA - 1.2 * L * 0.866, MY + 10, 3, L, -30);
    var DME = ORG.zz(KX[2] + XB - L * 0.866, MY - 6, 3, L, 30);           /* C, O, C */
    var DME_BOKS = [DME[0][0] - 14, DME[0][1] - 14, DME[2][0] - DME[0][0] + 28, DME[1][1] - DME[0][1] + 30];

    function kort(i) { return [KX[i] - KB / 2, KY, KB, KH]; }
    function titel(id, i, dele, fejl) {
        var k = kort(i);
        return { id: id, ord: [id], x: KX[i], y: KY, maal: [KX[i], KY], titel: true, dele: dele,
            omr: [{ r: [k[0] - 5, k[1] - 5, k[2] + 10, k[3] + 10, 16], tom: true }], fejl: fejl };
    }

    NK.FIGURER.struktur = {
        vb: [1130, 500],
        lag: [
            { navn: "Tre slags", pladser: ["kædeisomerer", "stillingsisomerer", "funktionsisomerer"],
              ros: "Kædeisomerer har forskellig kæde. I stillingsisomerer har gruppen forskellig placering. Funktionsisomerer har hver sin gruppe." },
            { navn: "Overblikket", pladser: ["isomerer", "strukturisomerer", "ether"],
              ros: "Isomerer har samme molekylformel. I strukturisomerer er atomerne bundet sammen i forskellig rækkefølge. En ether har O midt i kæden." }
        ],
        pladser: [
            titel("kædeisomerer", 0, ["hoved0"], {
                stillingsisomerer: "<b>stillingsisomerer</b> har en gruppe, der sidder forskellige steder. Butan og 2-methylpropan har forskellige kæder.",
                funktionsisomerer: "<b>funktionsisomerer</b> hører til hver sin stofklasse. Butan og 2-methylpropan er begge alkaner.",
                strukturisomerer: "<b>strukturisomerer</b> er fællesnavnet for alle tre kort. Her er navnet på den slags, hvor kæden er forskellig.",
                isomerer: "<b>isomerer</b> er fællesnavnet øverst. Her er navnet på den slags, hvor carbonkæden er bygget forskelligt.",
                ether: "<b>ether</b> er et stof med O midt i kæden. Butan og 2-methylpropan har kun C og H." }),
            titel("stillingsisomerer", 1, ["hoved1"], {
                kædeisomerer: "<b>kædeisomerer</b> har forskellig carbonkæde. De to propanoler har samme kæde, men OH sidder to forskellige steder.",
                funktionsisomerer: "<b>funktionsisomerer</b> hører til hver sin stofklasse. De to propanoler er begge alkoholer.",
                strukturisomerer: "<b>strukturisomerer</b> er fællesnavnet for alle tre kort. Her er navnet på den slags, hvor den funktionelle gruppe sidder forskellige steder.",
                isomerer: "<b>isomerer</b> er fællesnavnet øverst. Her er navnet på den slags, hvor gruppen sidder to forskellige steder.",
                ether: "<b>ether</b> har O midt i kæden. De to propanoler har begge en OH-gruppe." }),
            titel("funktionsisomerer", 2, ["hoved2"], {
                kædeisomerer: "<b>kædeisomerer</b> hører til samme stofklasse. Ethanol er en alkohol, og stoffet ved siden af har O midt i kæden.",
                stillingsisomerer: "<b>stillingsisomerer</b> har den samme funktionelle gruppe forskellige steder. De to stoffer her har hver sin funktionelle gruppe.",
                strukturisomerer: "<b>strukturisomerer</b> er fællesnavnet for alle tre kort. Her er navnet på den slags med forskellige grupper.",
                isomerer: "<b>isomerer</b> er fællesnavnet øverst. Her er navnet på den slags, hvor stofferne har forskellige grupper.",
                ether: "<b>ether</b> er kun det ene stof. Kortets titel gælder parret, der hører til hver sin stofklasse." }),

            { id: "isomerer", ord: ["isomerer"], x: TOPN.x, y: TOPN.y, maal: [TOPN.x, TOPN.y + 17], titel: true, dele: ["trae"],
              omr: [{ r: [SN.x - 18, TOPN.y + 21, STEREO.x - SN.x + 36, SN.y - TOPN.y - 40, 10] }],
              fejl: { strukturisomerer: "<b>strukturisomerer</b> er kun den ene gren. Overskriften øverst gælder alle stoffer med samme molekylformel.",
                      kædeisomerer: "<b>kædeisomerer</b> er kun ét af kortene. Overskriften øverst gælder alle stoffer med samme molekylformel.",
                      ether: "<b>ether</b> er en stofklasse. Overskriften øverst gælder alle stoffer med samme molekylformel." } },
            { id: "strukturisomerer", ord: ["strukturisomerer"], x: SN.x, y: SN.y, maal: [SN.x, SN.y + 17], titel: true, dele: ["gren"],
              omr: [{ r: [KX[0] - 18, SN.y + 21, KX[2] - KX[0] + 36, KY - SN.y - 40, 10] }],
              fejl: { isomerer: "<b>isomerer</b> er fællesnavnet øverst. Grenen her er den slags, hvor atomerne er bundet sammen i forskellig rækkefølge.",
                      kædeisomerer: "<b>kædeisomerer</b> er kun ét af de tre kort. Grenen her gælder alle tre kort.",
                      stillingsisomerer: "<b>stillingsisomerer</b> er kun ét af de tre kort. Grenen her gælder alle tre kort.",
                      funktionsisomerer: "<b>funktionsisomerer</b> er kun ét af de tre kort. Grenen her gælder alle tre kort.",
                      ether: "<b>ether</b> er en stofklasse. Grenen her gælder alle tre kort med isomerer." } },
            { id: "ether", ord: ["ether"], x: STEREO.x, y: MY - 6, maal: [DME_BOKS[0] + DME_BOKS[2] + 2, MY - 6], dele: ["etherboks"],
              omr: [{ r: [DME_BOKS[0], DME_BOKS[1], DME_BOKS[2], DME_BOKS[3], 12] }],
              fejl: { funktionsisomerer: "<b>funktionsisomerer</b> er parret i kortet. Pladsen peger på ét stof med O midt i carbonkæden.",
                      isomerer: "<b>isomerer</b> er altid to eller flere stoffer. Pladsen peger på ét stof med O midt i carbonkæden.",
                      strukturisomerer: "<b>strukturisomerer</b> er altid to eller flere stoffer. Pladsen peger på ét stof med O midt i kæden." } }
        ],

        tegn: function (api) {
            ORG.defs();
            var B = ORG.bredde(["funktionsisomerer", "stillingsisomerer", "strukturisomerer", "stereoisomerer", "kædeisomerer"]);

            /* ----- Kortene med molekylerne ------------------------------------- */
            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var navne = [["butan", "kogepunkt −1 °C", "2-methylpropan", "kogepunkt −12 °C"],
                                 ["propan-1-ol", "kogepunkt 97 °C", "propan-2-ol", "kogepunkt 82 °C"],
                                 ["ethanol", "kogepunkt 78 °C", "CH_{3}−O−CH_{3}", "kogepunkt −24 °C"]];
                    KX.forEach(function (x, i) {
                        var k = kort(i);
                        SV.el("rect", { x: k[0] + 2, y: k[1] + 5, width: k[2], height: k[3], rx: 16, fill: "#5b6b78", opacity: 0.16, filter: "url(#b3-blur)" }, g);
                        SV.el("rect", { x: k[0], y: k[1], width: k[2], height: k[3], rx: 16, fill: "#ffffff", stroke: "#9cc9c1", "stroke-width": 1.6 }, g);
                        SV.el("line", { x1: x, y1: KY + HH + 16, x2: x, y2: KY + KH - 16, stroke: "#c3d6d4", "stroke-width": 1.2, "stroke-dasharray": "4 5" }, g);
                        ORG.t(g, x + XA, KY + KH - 48, navne[i][0], { fs: 15.5, fed: true });
                        ORG.t(g, x + XA, KY + KH - 26, navne[i][1], { fs: 13.5, farve: F.daempet });
                        ORG.t(g, x + XB, KY + KH - 48, navne[i][2], { fs: 15.5, fed: true });
                        ORG.t(g, x + XB, KY + KH - 26, navne[i][3], { fs: 13.5, farve: F.daempet });
                    });
                    /* kaedeisomererne */
                    ORG.skelet(g, BUTAN.map(function (p) { return [p[0], p[1]]; }), [[0, 1], [1, 2], [2, 3]]);
                    ORG.skelet(g, [[MP_C[0], MP_C[1]], [MP_C[0], MP_C[1] - L], [MP_C[0] - L * 0.866, MP_C[1] + L / 2], [MP_C[0] + L * 0.866, MP_C[1] + L / 2]],
                        [[0, 1], [0, 2], [0, 3]]);
                    /* stillingsisomererne */
                    ORG.skelet(g, [[PROP1[0][0], PROP1[0][1]], [PROP1[1][0], PROP1[1][1]], [PROP1[2][0], PROP1[2][1]],
                        [PROP1[3][0], PROP1[3][1], "OH", { anker: "start", farve: F.accent }]], [[0, 1], [1, 2], [2, 3, 1, 0, F.accent]]);
                    ORG.skelet(g, [[P2_C[0], P2_C[1]], [P2_C[0], P2_C[1] - L, "OH", { anker: "start", farve: F.accent }],
                        [P2_C[0] - L * 0.866, P2_C[1] + L / 2], [P2_C[0] + L * 0.866, P2_C[1] + L / 2]],
                        [[0, 1, 1, 0, F.accent], [0, 2], [0, 3]]);
                    /* funktionsisomererne */
                    ORG.skelet(g, [[ETH[0][0], ETH[0][1]], [ETH[1][0], ETH[1][1]], [ETH[2][0], ETH[2][1], "OH", { anker: "start", farve: F.accent }]],
                        [[0, 1], [1, 2, 1, 0, F.accent]]);
                    ORG.skelet(g, [[DME[0][0], DME[0][1]], [DME[1][0], DME[1][1], "O", { farve: F.accent }], [DME[2][0], DME[2][1]]],
                        [[0, 1, 1, 0, F.accent], [1, 2, 1, 0, F.accent]]);
                }
            });

            /* ----- Lag 1: kortenes grønne hoveder med molekylformlen -------------- */
            ["C_4H_{10}", "C_3H_8O", "C_2H_6O"].forEach(function (formel, i) {
                api.del("hoved" + i, {
                    lag: 0,
                    fuld: function (g) {
                        var k = kort(i);
                        var gg = SV.g(g);
                        SV.el("path", { d: "M" + k[0] + "," + (k[1] + HH) + " V" + (k[1] + 16) + " Q" + k[0] + "," + k[1] + " " + (k[0] + 16) + "," + k[1] +
                            " H" + (k[0] + k[2] - 16) + " Q" + (k[0] + k[2]) + "," + k[1] + " " + (k[0] + k[2]) + "," + (k[1] + 16) + " V" + (k[1] + HH) + " Z",
                            fill: F.accent }, gg);
                        SV.tekst(gg, KX[i], k[1] + HH - 9, formel, { "font-size": 20, "font-weight": 700, fill: "#ffffff" });
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.fade(r.g, 0, 450); }
                });
            });

            /* ----- Lag 2: træet og etheren -------------------------------------- */
            function streg(g, pkt) {
                return SV.el("polyline", { points: pkt.map(function (p) { return p[0] + "," + p[1]; }).join(" "), fill: "none", stroke: "#8fb5ae", "stroke-width": 2 }, g);
            }
            api.del("trae", {
                lag: 1,
                fuld: function (g) {
                    var ym = (TOPN.y + SN.y) / 2 + 2;
                    var s1 = streg(g, [[TOPN.x, TOPN.y + 17], [TOPN.x, ym], [SN.x, ym], [SN.x, SN.y - 17]]);
                    var s2 = streg(g, [[TOPN.x, ym], [STEREO.x, ym], [STEREO.x, STEREO.y - 17]]);
                    ORG.givet(g, STEREO.x, STEREO.y, "stereoisomerer", B);
                    ORG.t(g, STEREO.x, STEREO.y + 36, "afsnit B3.4", { fs: 13.5, farve: F.daempet });
                    return { s1: s1, s2: s2 };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.s1, 0, 500); an.streg(r.s2, 0, 500); }
            });
            api.del("gren", {
                lag: 1,
                fuld: function (g) {
                    var ym = (SN.y + 17 + KY - 17) / 2;
                    var s = [streg(g, [[SN.x, SN.y + 17], [SN.x, KY - 17]]), streg(g, [[KX[0], KY - 17], [KX[0], ym], [KX[2], ym], [KX[2], KY - 17]])];
                    return { s: s };
                },
                byg: function (g, r, an) { r.s.forEach(function (s) { an.streg(s, 0, 500); }); }
            });
            api.del("etherboks", {
                lag: 1,
                fuld: function (g) {
                    return { b: SV.el("rect", { x: DME_BOKS[0], y: DME_BOKS[1], width: DME_BOKS[2], height: DME_BOKS[3], rx: 12,
                        fill: F.accent, "fill-opacity": 0.1, stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.pop(r.b, 0, 450); }
            });
        }
    };
}());

/* =====================================================================
   fig_mangan.js - figuren til 8.4 Afstemning af redoxreaktioner

   Bogens mangan-farver: fire bægerglas med MnO₄⁻ (violet), MnO₄²⁻ (grøn),
   MnO₂ (brunt bundfald) og Mn²⁺ (farveløs) med oxidationstallene over.
   Navnet permanganat under det første glas er pladsen; bogens farveord
   under glassene er taget ud, fordi glassene viser farverne. Bogens smaa
   pile mellem glassene er blevet til én lang pil under dem, som pladsen
   reduktion sidder paa (billedteksten: "Jo længere mod højre, jo mere er
   mangan reduceret").
   8.4 har kun ét fagord. oxidationstal fra 8.3 og reduktion fra 8.1
   staar her igen. Tre fagord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var BLAA = "#1d4ed8";
    var GX = [175, 415, 655, 895], BUND = 312, GB = 132, GH = 150;
    var GLAS = [
        { f: "MnO_4^−", tal: "+VII", fyld: "#9a4fc4" },
        { f: "MnO_4^{2−}", tal: "+VI", fyld: "#3e9e6c", navn: "manganat" },
        { f: "MnO_2", tal: "+IV", fyld: "#efe7da", navn: "mangan(IV)oxid", bundfald: true },
        { f: "Mn^{2+}", tal: "+II", fyld: "#f1f5f8", navn: "mangan(II)ion" }
    ];
    var TY = 132, FY = 348, NY = 378, PY = 420;

    function glas(g, i) {
        var G = GLAS[i], gg = SV.g(g);
        SV.el("ellipse", { cx: GX[i], cy: BUND + 4, rx: GB / 2 + 6, ry: 5, fill: "rgba(60,70,80,0.15)" }, gg);
        LAB.baeger(gg, GX[i], BUND, GB, GH, { top: BUND - GH * 0.72, fyld: G.fyld });
        if (G.bundfald) {
            SV.el("path", { d: "M" + (GX[i] - GB / 2 + 4) + "," + (BUND - 4) + " Q" + GX[i] + "," + (BUND - 26) + " " + (GX[i] + GB / 2 - 4) + "," + (BUND - 4) + " Z", fill: "#6b4a2b" }, gg);
            for (var k = 0; k < 16; k++) {
                SV.el("circle", { cx: GX[i] - 48 + (k * 37) % 96, cy: BUND - 34 - (k * 23) % 62, r: 1.8, fill: "#7a5634", opacity: 0.7 }, gg);
            }
        }
        SV.tekst(gg, GX[i], FY, G.f, { "font-size": 24, "font-weight": 700 });
        return gg;
    }

    NK.FIGURER.mangan = {
        vb: [1100, 500],
        lag: [
            { navn: "Mangans farver", pladser: ["permanganat", "oxidationstal", "reduktion"],
              ros: "Permanganat, MnO₄⁻, er violet. Når mangan bliver reduceret, falder oxidationstallet, og farven skifter." }
        ],
        pladser: [
            { id: "permanganat", ord: ["permanganat"], x: GX[0], y: NY, maal: [GX[0], NY], titel: true, dele: ["violet"],
              omr: [{ r: [GX[0] - GB / 2 - 14, BUND - GH - 14, GB + 28, NY - (BUND - GH - 14), 12], tom: true }],
              fejl: { oxidationstal: "<b>oxidationstal</b> er tallene med romertal over glassene. Pladsen er navnet på den violette ion MnO₄⁻.",
                      reduktion: "<b>reduktion</b> er det, der sker mod højre. Pladsen er navnet på den violette ion MnO₄⁻." } },
            { id: "oxidationstal", ord: ["oxidationstal"], x: (GX[0] + GX[3]) / 2, y: 64, maal: [(GX[0] + GX[3]) / 2, 64], titel: true, dele: ["tal"],
              omr: [{ r: [GX[0] - 60, 64, GX[3] - GX[0] + 120, TY - 64 + 16, 12], tom: true }],
              fejl: { permanganat: "<b>permanganat</b> er navnet på ionen MnO₄⁻. Overskriften gælder tallene +VII, +VI, +IV og +II over glassene.",
                      reduktion: "<b>reduktion</b> er pilen under glassene. Overskriften gælder tallene med romertal over dem." } },
            { id: "reduktion", ord: ["reduktion"], x: (GX[0] + GX[3]) / 2, y: PY + 36, maal: [(GX[0] + GX[3]) / 2, PY + 36], titel: true, dele: ["pil"],
              omr: [{ r: [GX[0] - 70, PY - 16, GX[3] - GX[0] + 140, 52, 12], tom: true }],
              fejl: { oxidationstal: "<b>oxidationstal</b> er tallene over glassene. Pilen viser det, der sker med mangan, når tallet falder mod højre.",
                      permanganat: "<b>permanganat</b> er den violette ion til venstre. Pilen viser det, der sker med mangan mod højre." } }
        ],

        tegn: function (api) {
            api.del("glas", {
                lag: 0, auto: true,
                fuld: function (g) {
                    for (var i = 1; i < GLAS.length; i++) {
                        glas(g, i);
                        SV.tekst(g, GX[i], NY + 4, GLAS[i].navn, { "font-size": 16, fill: F.svag });
                    }
                }
            });

            api.del("violet", {
                lag: 0,
                fuld: function (g) { return { g: glas(g, 0) }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            api.del("tal", {
                lag: 0,
                fuld: function (g) {
                    return { t: GLAS.map(function (G, i) { return SV.tekst(g, GX[i], TY, G.tal, { "font-size": 26, "font-weight": 700, fill: F.teal }); }) };
                },
                byg: function (g, r, an) { r.t.forEach(function (el, i) { an.pop(el, 90 * i, 400); }); }
            });

            api.del("pil", {
                lag: 0,
                fuld: function (g) { return { p: LAB.pil(g, GX[0] - 50, GX[3] + 52, PY, { farve: BLAA, bredde: 3 }) }; },
                byg: function (g, r, an) { an.glid(r.p, -40, 0, 0, 600); }
            });
        }
    };
}());

/* =====================================================================
   fig_beregn.js - figuren til 5.1 Beregninger i kemi

   Øverst til venstre sprit i et måleglas på en vægt med densiteten
   under, som i bogens figur densitet. Til højre et måleresultat med
   grå nuller foran, som i bogens figur betydende-cifre. Nederst en
   tabel med tre kolonner som bogens tabel over størrelser, symboler og
   enheder. Rækkerne er masse og temperatur, så ordene volumen og
   densitet ikke står i tabellen og afslører pladserne ovenover.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var KA = { x: 30, y: 30, b: 420, h: 330 };           /* kortet med spritten */
    var GX = 120, GTOP = 70, GBUND = 262, GB = 50, FYLD = 134;
    var RHO = { x: 330, y: 262 };                        /* densiteten */
    var KC = { x: 480, y: 30, b: 490, h: 330 };          /* kortet med måleresultatet */
    var NX = 700, NY = 160;                              /* grænsen mellem grå og teal cifre */
    /* Felterne måles efter teksten, så de passer til skriften på alle maskiner */
    var B250 = NK.tekstBredde("250", 64, 700), B00 = NK.tekstBredde("0,0", 64, 700);
    var CIF = [NX - 4, NY - 50, B250 + 10, 62];          /* feltet om de betydende cifre */
    var BRHO = NK.tekstBredde("ρ = 0,810 g/mL", 22, 700) + 18;
    var TB = { x: 170, y: 410, b: 660, h: 160 };         /* tabellen */
    var KOL = [280, 500, 720];

    function kolOmr(i) { return [{ r: [KOL[i] - 104, TB.y + 4, 208, TB.h - 10, 10] }]; }

    NK.FIGURER.beregn = {
        vb: [1000, 600],
        lag: [
            { navn: "Spritten måles", pladser: ["volumen", "densitet", "betydende cifre"],
              ros: "Spritten fylder 50,0 mL og vejer 40,5 g. Densiteten er massen af 1 mL. De betydende cifre viser, hvor præcist der er målt." },
            { navn: "Tabellen", pladser: ["størrelse", "symbol", "enhed"],
              ros: "Hver størrelse har et symbol, der skrives i beregningen, og en enhed, den måles i." }
        ],
        pladser: [
            { id: "volumen", ord: ["volumen"], x: RHO.x, y: 150, maal: [GX + GB / 2 + 3, 198], dele: ["glas"],
              omr: [{ r: [GX - GB / 2 + 1, FYLD - 4, GB - 2, GBUND - FYLD + 4, 4] }],
              fejl: { densitet: "<b>densitet</b> er massen af én milliliter. Pladsen peger på, hvor meget spritten fylder i måleglasset.",
                      "betydende cifre": "<b>betydende cifre</b> er cifre i et tal. Pladsen peger på spritten i måleglasset.",
                      "størrelse": "<b>størrelse</b> passer på alt, der kan måles. Her spørges om den størrelse, der siger, hvor meget spritten fylder." } },
            { id: "densitet", ord: ["densitet"], x: RHO.x, y: 318, maal: [RHO.x, RHO.y + 12], dele: ["rho"],
              omr: [{ r: [RHO.x - BRHO / 2, RHO.y - 24, BRHO, 34, 8] }],
              fejl: { volumen: "<b>volumen</b> er, hvor meget spritten fylder. Tallet med ρ siger, hvor meget én milliliter vejer.",
                      "betydende cifre": "<b>betydende cifre</b> er cifre i et tal. Pladsen spørger om navnet på det, ρ står for.",
                      enhed: "<b>enhed</b> er kun g/mL. Pladsen spørger om navnet på det, ρ står for." } },
            { id: "betydende cifre", ord: ["betydende cifre"], x: CIF[0] + CIF[2] / 2, y: 262, maal: [CIF[0] + CIF[2] / 2, CIF[1] + CIF[3] + 3], dele: ["cifre"],
              omr: [{ r: CIF.concat([8]) }],
              fejl: { enhed: "<b>enhed</b> er g. Pladsen peger på cifrene 2, 5 og 0, som viser, hvor præcist der er målt.",
                      densitet: "<b>densitet</b> er massen af én milliliter. Pladsen peger på cifrene 2, 5 og 0 i måleresultatet.",
                      symbol: "<b>symbol</b> er et bogstav som m. Pladsen peger på cifrene 2, 5 og 0 i måleresultatet." } },

            { id: "størrelse", ord: ["størrelse"], x: KOL[0], y: TB.y, maal: [KOL[0], TB.y], titel: true, dele: ["k1"], omr: kolOmr(0),
              fejl: { symbol: "<b>symbol</b> er et bogstav som m. Kolonnen her har navnene masse og temperatur.",
                      enhed: "<b>enhed</b> er g eller °C. Kolonnen her har navnene masse og temperatur.",
                      volumen: "<b>volumen</b> er én bestemt størrelse. Overskriften gælder hele kolonnen med masse og temperatur." } },
            { id: "symbol", ord: ["symbol"], x: KOL[1], y: TB.y, maal: [KOL[1], TB.y], titel: true, dele: ["k2"], omr: kolOmr(1),
              fejl: { "størrelse": "<b>størrelse</b> er navnet, for eksempel masse. Kolonnen her har bogstaverne m og t.",
                      enhed: "<b>enhed</b> er det, der måles i, som g og °C. Kolonnen her har bogstaverne m og t." } },
            { id: "enhed", ord: ["enhed"], x: KOL[2], y: TB.y, maal: [KOL[2], TB.y], titel: true, dele: ["k3"], omr: kolOmr(2),
              fejl: { "størrelse": "<b>størrelse</b> er navnet, for eksempel masse. Kolonnen her har g og °C, som er det, der måles i.",
                      symbol: "<b>symbol</b> er bogstavet i beregningen, som m. Kolonnen her har g og °C, som er det, der måles i." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: kortet med vægten står der fra start ------------------ */
            api.del("maaling", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kort(g, KA.x, KA.y, KA.b, KA.h);
                    SV.tekst(g, KA.x + 20, KA.y + 30, "sprit", { "font-size": 16, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    LAB.vaegt(g, GX, GBUND + 10, 150, "40,5 g");
                }
            });

            api.del("glas", {
                lag: 0,
                fuld: function (g) {
                    var m = LAB.maaleglas(g, GX, GTOP, GBUND, GB, FYLD, "#d6e8f7");
                    SV.el("line", { x1: GX - GB / 2 - 14, y1: FYLD, x2: GX - GB / 2 - 4, y2: FYLD, stroke: F.svag, "stroke-width": 1.4 }, g);
                    var t = SV.tekst(g, GX - GB / 2 - 17, FYLD + 5, "50,0 mL", { "font-size": 14, "font-weight": 700, fill: F.svag, "text-anchor": "end" });
                    return { v: m.vaeske, t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.v, 150, 500); an.fade(r.t, 450, 400); }
            });

            api.del("rho", {
                lag: 0,
                fuld: function (g) {
                    return { t: SV.tekst(g, RHO.x, RHO.y, "ρ = 0,810 g/mL", { "font-size": 22, "font-weight": 700, fill: F.teal }) };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 500); }
            });

            api.del("cifre", {
                lag: 0,
                fuld: function (g) {
                    ORG.kort(g, KC.x, KC.y, KC.b, KC.h);
                    SV.tekst(g, KC.x + 20, KC.y + 30, "et måleresultat", { "font-size": 16, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    SV.tekst(g, NX, NY, "0,0", { "font-size": 64, "font-weight": 700, fill: "#b4bcc5", "text-anchor": "end" });
                    var c = SV.tekst(g, NX, NY, "250", { "font-size": 64, "font-weight": 700, fill: F.teal, "text-anchor": "start" });
                    SV.tekst(g, CIF[0] + CIF[2] + 10, NY, "g", { "font-size": 40, "font-weight": 700, fill: F.svag, "text-anchor": "start" });
                    var bx1 = NX - B00 + 4, bx2 = NX - 6, by = NY + 14;
                    SV.el("path", { d: "M" + bx1 + "," + (by - 6) + " L" + bx1 + "," + by + " L" + bx2 + "," + by + " L" + bx2 + "," + (by - 6), fill: "none", stroke: "#b4bcc5", "stroke-width": 2 }, g);
                    SV.tekst(g, (bx1 + bx2) / 2, by + 22, "tæller ikke med", { "font-size": 15, fill: F.svag });
                    return { c: c };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.c, 250, 500); }
            });

            /* ----- Lag 2: tabellen ------------------------------------------- */
            api.del("tabel", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ORG.kort(g, TB.x, TB.y, TB.b, TB.h);
                    [390, 610].forEach(function (x) {
                        SV.el("line", { x1: x, y1: TB.y + 30, x2: x, y2: TB.y + TB.h - 14, stroke: "#d4dbe2", "stroke-width": 1.4 }, g);
                    });
                    SV.el("line", { x1: TB.x + 20, y1: TB.y + 95, x2: TB.x + TB.b - 20, y2: TB.y + 95, stroke: "#e2e7ec", "stroke-width": 1.2 }, g);
                }
            });

            var RAEKKER = [TB.y + 72, TB.y + 128];
            function kolonne(id, i, tekster, attr) {
                api.del(id, {
                    lag: 1,
                    fuld: function (g) {
                        var t = tekster.map(function (s, n) {
                            return SV.tekst(g, KOL[i], RAEKKER[n], s, Object.assign({ "font-size": 22, "font-weight": 600, fill: F.tekst }, attr || {}));
                        });
                        return { t: t };
                    },
                    byg: function (g, r, an) { r.t.forEach(function (t, n) { an.pop(t, n * 150, 450); }); }
                });
            }
            kolonne("k1", 0, ["masse", "temperatur"]);
            kolonne("k2", 1, ["m", "t"], { "font-style": "italic", "font-weight": 700, fill: F.teal });
            kolonne("k3", 2, ["g", "°C"]);
        }
    };
}());

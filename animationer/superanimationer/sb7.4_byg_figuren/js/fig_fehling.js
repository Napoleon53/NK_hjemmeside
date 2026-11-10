/* =====================================================================
   fig_fehling.js - figuren til B7.4 Fehlings test

   Øverst de to opløsninger, der blandes lige før testen: et blåt glas med
   kobber(II)sulfat og et farveløst med natriumhydroxid og tartrat. En pil
   fører til den dybblå blanding. Navnene sidder som skilte under kortene
   (Fehling I, Fehling II og Fehlings væske). Glassene står i farver fra
   start, fordi farven er det, eleven skal kende opløsningerne på; det er
   linjerne om indholdet under glassene, der får farve, når navnet sidder.
   Forneden bogens b7-fehling-glas: tre reagensglas efter opvarmning i
   vandbad. Glucose og maltose er murstensrøde i hele glasset (brugeren
   30. okt. 2026: "når jeg laver forsøget ser hele glasset helt
   murstensrødt ud"), og saccharose er stadig blå. reducerende sukker er
   titlen på en ramme om glucose og maltose. Bogens linjer "positiv test"
   og "efter opvarmning med Fehlings væske" er taget af, fordi de ville
   afsløre pladserne; der står "efter opvarmning i vandbad".
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KH = NK.KH;
    var F = KH.F;

    var KB = 246, KHH = 226;
    var K1 = { x: 24, y: 30, b: KB, h: KHH }, K2 = { x: 330, y: 30, b: KB, h: KHH }, K3 = { x: 704, y: 30, b: KB, h: KHH };
    var PIL = { x1: K2.x + KB + 22, x2: K3.x - 22, y: 30 + 86 };
    var RAMME = { x: 12, y: 310, b: 2 * KB + 48, h: 236 };
    var R1 = { x: 24, y: 334, b: KB, h: 200 }, R2 = { x: 290, y: 334, b: KB, h: 200 }, R3 = { x: 580, y: 334, b: KB, h: 200 };
    var GT = 26, GB = 140, GW = 46;                                    /* glassene i kortene */

    function navn(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18] }], fejl: fejl };
    }

    NK.FIGURER.fehling = {
        vb: [990, 560],
        lag: [
            { navn: "De to opløsninger", pladser: ["Fehling I", "Fehling II"],
              ros: "Fehling I er blå af kobber(II)ioner. Fehling II er natriumhydroxid og tartrat og gør blandingen basisk." },
            { navn: "Testen", pladser: ["Fehlings væske", "reducerende sukker"],
              ros: "Fehlings væske giver rødt bundfald med et reducerende sukker. Saccharose er ikke reducerende og bliver ved med at være blå." }
        ],
        pladser: [
            navn("Fehling I", K1, ["g1"], {
                "Fehling II": "<b>Fehling II</b> er natriumhydroxid og tartrat og er farveløs. Glasset her er blåt af kobber(II)ioner.",
                "Fehlings væske": "<b>Fehlings væske</b> er blandingen af de to opløsninger. Glasset her er kun kobber(II)sulfat." }),
            navn("Fehling II", K2, ["g2"], {
                "Fehling I": "<b>Fehling I</b> er blå af kobber(II)sulfat. Glasset her er farveløst med natriumhydroxid og tartrat.",
                "Fehlings væske": "<b>Fehlings væske</b> er den dybblå blanding. Glasset her er farveløst og kun den ene opløsning." }),
            navn("Fehlings væske", K3, ["g3"], {
                "Fehling I": "<b>Fehling I</b> er kun kobber(II)sulfat. Glasset her er blandingen af de to opløsninger til venstre.",
                "Fehling II": "<b>Fehling II</b> er farveløs. Glasset her er den dybblå blanding af de to opløsninger til venstre.",
                "reducerende sukker": "<b>reducerende sukker</b> er et kulhydrat. Glasset her er den dybblå blanding, testen laves med." }),
            { id: "reducerende sukker", ord: ["reducerende sukker"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["ramme"],
              omr: [{ r: [RAMME.x - 4, RAMME.y - 4, RAMME.b + 8, RAMME.h + 8, 18], tom: true }],
              fejl: { "Fehlings væske": "<b>Fehlings væske</b> er den dybblå blanding. Rammen er om de to sukkerstoffer, der gav rødt bundfald.",
                      "Fehling I": "<b>Fehling I</b> er kobber(II)sulfat. Rammen er om de to sukkerstoffer, der gav rødt bundfald.",
                      "Fehling II": "<b>Fehling II</b> er natriumhydroxid og tartrat. Rammen er om sukkerstofferne, der gav rødt bundfald." } }
        ],

        tegn: function (api) {
            KH.defs();
            var G = F.accent;

            function etiket(g, k, l1, l2, farve) {
                var cx = k.x + k.b / 2;
                KH.t(g, cx, k.y + GB + 36, l1, 15, { fed: true, farve: farve || F.blaek });
                if (l2) KH.t(g, cx, k.y + GB + 56, l2, 14, { farve: F.daempet });
            }

            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, K1.x, K1.y, K1.b, K1.h);
                    ORG.kortB(g, K2.x, K2.y, K2.b, K2.h);
                    KH.t(g, (K1.x + K1.b + K2.x) / 2, 30 + 94, "+", 26, { farve: F.daempet });
                    /* Glassene staar i farver fra start: farven er det, eleven skal se */
                    KH.glas(g, K1.x + K1.b / 2, K1.y + GT, K1.y + GB, GW, { fyld: "url(#kh-blaa)", niveau: 0.6 });
                    KH.glas(g, K2.x + K2.b / 2, K2.y + GT, K2.y + GB, GW, { fyld: "url(#kh-klar)", niveau: 0.6 });
                }
            });
            /* Indholdet staar under glasset og faar farve, naar navnet sidder */
            api.del("g1", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); etiket(gg, K1, "kobber(II)sulfat", "i vand", F.neg); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("g2", {
                lag: 0,
                fuld: function (g) { var gg = SV.g(g); etiket(gg, K2, "natriumhydroxid", "og tartrat i vand", F.blaek); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("base2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    KH.pil(g, PIL.x1, PIL.y, PIL.x2, PIL.y);
                    KH.t(g, (PIL.x1 + PIL.x2) / 2, PIL.y - 14, "blandes", 13.5, { farve: F.daempet });
                    KH.t(g, (PIL.x1 + PIL.x2) / 2, PIL.y + 24, "lige før", 13.5, { farve: F.daempet });
                    ORG.kortB(g, K3.x, K3.y, K3.b, K3.h);
                    KH.glas(g, K3.x + K3.b / 2, K3.y + GT, K3.y + GB, GW, { fyld: "url(#kh-dybblaa)", niveau: 0.75 });
                    /* Prøverne efter opvarmning */
                    [[R1, "glucose", "rødt bundfald", true], [R2, "maltose", "rødt bundfald", true], [R3, "saccharose", "stadig blå", false]].forEach(function (d, i) {
                        var k = d[0], cx = k.x + k.b / 2;
                        ORG.kortB(g, k.x, k.y, k.b, k.h);
                        KH.glas(g, cx, k.y + 22, k.y + 132, GW, d[3] ? { fyld: "url(#kh-murst)", niveau: 0.6, korn: true, fro: 3 + i } : { fyld: "url(#kh-blaa)", niveau: 0.6 });
                        KH.t(g, cx, k.y + 162, d[1], 15, { fed: true });
                        KH.t(g, cx, k.y + 182, d[2], 14, { farve: d[3] ? G : F.daempet });
                    });
                    var tx = R3.x + R3.b + 26;
                    ["Alle tre glas", "er varmet i", "vandbad med", "den dybblå", "blanding."].forEach(function (l, i) {
                        KH.t(g, tx, R3.y + 70 + 20 * i, l, 14, { anker: "start", farve: F.daempet });
                    });
                }
            });
            api.del("g3", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); etiket(gg, K3, "dybblå og basisk", "kobber(II)ioner med tartrat", F.neg); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("ramme", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: RAMME.x, y: RAMME.y, width: RAMME.b, height: RAMME.h, rx: 18, fill: "none", stroke: G, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 700); }
            });
        }
    };
}());

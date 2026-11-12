/* =====================================================================
   fig_temperatur.js - figuren til B1.4 Temperatur

   Til venstre bogens energifordeling: hvor mange molekyler der har en
   bestemt energi ved 20 °C (blaa) og 30 °C (roed), med Eₐ og de farvede
   haler, der har energi nok. Bogen skriver "lav temperatur" og "høj
   temperatur"; her staar 20 °C og 30 °C, saa ordet ikke afsloerer
   pladsen, og kurverne er regnet, saa halen bliver dobbelt saa stor
   (Eₐ = 3,5 og 1,0 mod 1,3 i bogens formel), som tommelfingerreglen siger.
   Til hoejre bogens tommelfinger: soejler for 1, 2, 4 og 8 gange saa stor
   hastighed ved 20, 30, 40 og 50 °C.
   B1.4 har kun ét fagord, temperatur. Som i 7.4 er der ord med igen fra
   tidligere afsnit: reaktionshastighed (B1.1) og aktiveringsenergi (B1.3).
   Ordet tommelfingerregel som titel paa soejlerne er taget ud paa
   brugerens oenske 1. nov. 2026 ("fjern ordet tommelfingerregel").
   Tre ord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;

    var BLAA = "#2f6fde", ROED = "#e5533d";
    var D = { xa: 90, xb: 520, ya: 130, yb: 440, emax: 8 };
    var EA = 3.5, TH = [1.0, 1.3];
    function f(e, th) { return Math.sqrt(e) * Math.exp(-e / th) / Math.pow(th, 1.5); }
    var TOP = f(0.5, 1.0);
    function X(e) { return D.xa + (D.xb - D.xa) * e / D.emax; }
    function Y(v) { return D.yb - (D.yb - D.ya - 16) * v / TOP; }

    var L20 = { x: X(1.0), y: Y(0.43) }, L30 = { x: X(2.0), y: Y(0.27) };

    var KT = { x: 590, y: 76, b: 480, h: 434 };
    var SX = [700, 800, 900, 1000], SB = 52, SY = 432, ENHED = 32;   /* soejlerne */
    var GANGE = [1, 2, 4, 8];

    NK.FIGURER.temperatur = {
        vb: [1100, 540],
        lag: [
            { navn: "Varmere og hurtigere", pladser: ["temperatur", "aktiveringsenergi", "reaktionshastighed"],
              ros: "Ved 30 °C har dobbelt så mange molekyler energi nok til at reagere. For hver 10 °C bliver reaktionshastigheden omtrent fordoblet." }
        ],
        pladser: [
            { id: "temperatur", ord: ["temperatur"], x: 175, y: 62, maal: [L20.x + 22, L20.y - 17], dele: ["grader"],
              omr: [{ r: [L20.x - 6, L20.y - 19, 58, 26, 7] }, { r: [L30.x - 6, L30.y - 19, 58, 26, 7] }],
              fejl: { aktiveringsenergi: "<b>aktiveringsenergi</b> er den lodrette streg ved Eₐ. Pladsen peger på 20 °C og 30 °C ved kurverne.",
                      reaktionshastighed: "<b>reaktionshastighed</b> måles i M/s. Pladsen peger på 20 °C og 30 °C ved de to kurver." } },
            { id: "aktiveringsenergi", ord: ["aktiveringsenergi"], x: 420, y: 62, maal: [X(EA) + 1, D.ya + 22], dele: ["ea"],
              omr: [{ r: [X(EA) - 9, D.ya + 2, 18, D.yb - D.ya - 2, 7] }],
              fejl: { temperatur: "<b>temperatur</b> står ved kurverne som 20 °C og 30 °C. Pladsen peger på stregen ved Eₐ.",
                      reaktionshastighed: "<b>reaktionshastighed</b> måles i M/s. Pladsen peger på stregen ved Eₐ, den energi, molekylerne skal have." } },

            { id: "reaktionshastighed", ord: ["reaktionshastighed"], x: 840, y: 118, maal: [840, 118], titel: true, dele: ["soejler", "gange"],
              omr: [{ r: [SX[0] - SB / 2 - 14, 118, SX[3] - SX[0] + SB + 28, SY - 118 + 6, 12], tom: true }],
              fejl: { temperatur: "<b>temperatur</b> står under søjlerne i °C. Pladsen er det, søjlernes højde viser.",
                      aktiveringsenergi: "<b>aktiveringsenergi</b> er stregen ved Eₐ til venstre. Pladsen er det, søjlernes højde viser." } }
        ],

        tegn: function (api) {
            KV.defs();
            var es = [];
            for (var i = 0; i <= 160; i++) es.push(i * D.emax / 160);

            /* ----- Energifordelingen --------------------------------------- */
            api.del("fordeling", {
                lag: 0, auto: true,
                fuld: function (g) {
                    KV.flade(g, D.xa, D.ya + 8, D.xb, D.yb);
                    KV.pil(g, D.xa, D.yb, D.xa, D.ya, F.daempet, 1.5, 11);
                    KV.pil(g, D.xa, D.yb, D.xb + 10, D.yb, F.daempet, 1.5, 11);
                    KV.tekst(g, D.xb + 10, D.yb + 24, "molekylernes energi", { fs: 13.5, farve: F.daempet, anker: "end" });
                    var ym = (D.ya + D.yb) / 2;
                    KV.tekst(g, D.xa - 16, ym, "antal molekyler", { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + (D.xa - 16) + " " + ym + ")" });
                    var k = [];
                    [[TH[1], ROED, "#8f2a1c"], [TH[0], BLAA, "#1b4aa3"]].forEach(function (c) {
                        k.push(KV.kurve(g, es.map(function (e) { return [X(e), Y(f(e, c[0]))]; }), c[1], 2.4, { moerk: c[2] }));
                    });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.k[0], 100, 900); an.streg(r.k[1], 250, 900); }
            });

            api.del("grader", {
                lag: 0,
                fuld: function (g) {
                    return {
                        a: KV.tekst(g, L20.x, L20.y, "20 °C", { fs: 15, fed: true, farve: "#1b4aa3", anker: "start", halo: true }),
                        b: KV.tekst(g, L30.x, L30.y, "30 °C", { fs: 15, fed: true, farve: "#b8331f", anker: "start", halo: true })
                    };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 400); an.pop(r.b, 150, 400); }
            });

            api.del("ea", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [[TH[1], ROED], [TH[0], BLAA]].forEach(function (c) {
                        var hale = es.filter(function (e) { return e >= EA; }).map(function (e) { return [X(e), Y(f(e, c[0]))]; });
                        SV.el("polygon", { points: X(EA) + "," + D.yb + " " + KV.pkt(hale) + " " + X(D.emax) + "," + D.yb, fill: c[1], opacity: 0.26 }, gg);
                    });
                    KV.linje(gg, X(EA), D.ya + 6, X(EA), D.yb, F.blaek, 1.6, "5 4");
                    KV.tekst(gg, X(EA), D.yb + 22, "E_{a}", { fs: 15, fed: true });
                    KV.tekst(gg, X(4.35), Y(0.2), "disse molekyler har", { fs: 13.5, fed: true, anker: "start", halo: true });
                    KV.tekst(gg, X(4.35), Y(0.2) + 18, "energi nok til at reagere", { fs: 13.5, fed: true, anker: "start", halo: true });
                    KV.pil(gg, X(4.9), Y(0.2) + 26, X(4.35), Y(0.045), F.daempet, 1.4, 8);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });

            /* ----- Soejlerne ------------------------------------------------- */
            api.del("soejler", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, KT.x, KT.y, KT.b, KT.h);
                    var xa = SX[0] - SB / 2 - 14, xb = SX[3] + SB / 2 + 14;
                    for (var n = 1; n <= 8; n++) KV.linje(g, xa, SY - n * ENHED, xb, SY - n * ENHED, "#dfe9e8", 1);
                    KV.linje(g, xa, SY, xb, SY, F.daempet, 1.3);
                    var s = [];
                    SX.forEach(function (x, i) {
                        var h = GANGE[i] * ENHED;
                        SV.el("rect", { x: x - SB / 2 + 2, y: SY - h + 3, width: SB, height: h - 3, rx: 4, fill: "#0b3d39", opacity: 0.2, filter: "url(#kv-blur)" }, g);
                        s.push(SV.el("rect", { x: x - SB / 2, y: SY - h, width: SB, height: h, rx: 4, fill: "url(#kv-soejle)" }, g));
                        KV.tekst(g, x, SY + 22, (20 + 10 * i) + " °C", { fs: 15, fed: true });
                        if (i) KV.tekst(g, x - 50, SY + 44, "+10 °C", { fs: 13, farve: F.daempet });
                    });
                    return { s: s };
                },
                byg: function (g, r, an) { r.s.forEach(function (el, i) { an.pop(el, 120 * i, 450); }); }
            });

            api.del("gange", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SX.forEach(function (x, i) {
                        KV.tekst(gg, x, SY - GANGE[i] * ENHED - 9, GANGE[i] + (GANGE[i] === 1 ? " gang" : " gange"), { fs: 15, fed: true });
                    });
                    KV.tekst(gg, 840, 154, "i forhold til 20 °C", { fs: 13.5, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
        }
    };
}());

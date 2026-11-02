/* =====================================================================
   fig_ligevaegt.js - figuren til B2.1 Kemisk ligevægt

   Lavet om 2. nov. 2026 efter brugerens ord: "synes hele b2.1 er lidt
   off.. For mange figurer som man ikke bruger.. 2 pile der peger på en
   ligevægtspil og det kan være svært at se at den ene skulle være
   dynamisk.. og i den sidste fase er "indstille sig" for tæt på
   ligevægtssituationen".

   Nederst bogens ligevaegt-kurver: [N₂O₄] og [NO₂] med samme model som
   bogens lige_n2o4() og det groenne felt fra 35 s. Bogens ord "ligevægt"
   i feltet er pladsen; "kurverne er vandrette" staar under den. Pladsen
   indstille sig sidder paa de krumme stykker af kurverne, foer de bliver
   vandrette, og har et gult felt langs kurverne (kurver.js).
   Øverst til venstre reaktionsskemaet N₂O₄(g) ⇌ 2 NO₂(g); dobbeltpilen
   er den eneste i figuren. Øverst til hoejre (Claudes tilfoejelse) et kort
   ind i gassen, mens kurverne er vandrette: ét N₂O₄, der deler sig, og to
   NO₂, der gaar sammen, begge 5 gange pr. sekund. Kortet er forbundet med
   en lup til den vandrette del af kurven for NO₂.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B2 = NK.B2;
    var F = KV.F;

    /* Reaktionsskemaet */
    var SK = { x: 300, y: 176, fs: 28 };
    var PIL = { x0: SK.x - 34, x1: SK.x + 34, y: SK.y - 9 };

    /* Kortet ind i gassen */
    var KD = { x: 596, y: 26, b: 479, h: 238 };
    var PV = [{ x: KD.x + 16, y: KD.y + 72, b: 216, h: 104 }, { x: KD.x + 247, y: KD.y + 72, b: 216, h: 104 }];

    /* Grafen (bogens lige_n2o4: kf = 0,05 og kr = 0,25) */
    var G = { xa: 120, xb: 880, ya: 318, yb: 574 };
    function X(t) { return G.xa + (G.xb - G.xa) * t / 60; }
    function Y(c) { return G.yb - (G.yb - G.ya) * c / 0.10; }
    var KURVE = (function () {
        var a = 0.100, b = 0, t = 0, dt = 0.02, n = 0, ud = [];
        while (t <= 60 + 1e-9) {
            if (n % 10 === 0) ud.push([t, a, b]);
            var v = 0.05 * a - 0.25 * b * b;
            a -= v * dt; b += 2 * v * dt; t += dt; n++;
        }
        return ud;
    }());
    var TL = 35;                                           /* her er kurverne vandrette */
    function stykke(i, t0, t1) {
        return KURVE.filter(function (p) { return p[0] >= t0 - 1e-9 && p[0] <= t1 + 1e-9; }).map(function (p) { return [X(p[0]), Y(p[i])]; });
    }
    var BUE_A = stykke(1, 5, 31), BUE_B = stykke(2, 5, 31);
    var P20 = KURVE.filter(function (p) { return Math.abs(p[0] - 19) < 0.1; })[0];
    var LUP = { x: X(54), y: Y(0.100), r: 13 };

    NK.FIGURER.ligevaegt = {
        vb: [1100, 640],
        lag: [
            { navn: "Grafen", pladser: ["indstille sig", "ligevægt"],
              ros: "Kurverne bøjer af, mens ligevægten indstiller sig. Når de er blevet vandrette, er reaktionen i ligevægt." },
            { navn: "Begge veje", pladser: ["reversibel", "dynamisk ligevægt"],
              ros: "Reaktionen er reversibel og skrives med en dobbeltpil. Ved ligevægt går begge veje lige hurtigt: en dynamisk ligevægt." }
        ],
        pladser: [
            { id: "indstille sig", ord: ["indstille sig"], x: X(22), y: Y(0.022), maal: [X(19), Y(P20[1])], dele: ["graf"],
              omr: [{ linje: BUE_A, b: 16 }, { linje: BUE_B, b: 16 }],
              fejl: { ligevægt: "<b>ligevægt</b> er tiden, hvor kurverne er vandrette. Pladsen peger på kurverne, mens de bøjer af mod deres endelige værdier.",
                      "dynamisk ligevægt": "<b>dynamisk ligevægt</b> handler om to reaktioner, der går lige hurtigt. Pladsen peger på kurverne, mens de bøjer af.",
                      reversibel: "<b>reversibel</b> siges om en reaktion, der kan gå begge veje. Pladsen peger på kurverne, mens de bøjer af." } },
            { id: "ligevægt", ord: ["ligevægt"], x: X(46.5), y: Y(0.074), maal: [X(46.5), Y(0.074)], titel: true, dele: ["graf", "felt"],
              omr: [{ r: [X(TL) + 2, G.ya - 8, G.xb + 8 - X(TL) - 2, G.yb - G.ya + 8, 7], tom: true }],
              fejl: { "indstille sig": "<b>indstille sig</b> er det, kurverne gør, mens de bøjer af. Feltet er tiden, hvor de er blevet vandrette.",
                      "dynamisk ligevægt": "<b>dynamisk ligevægt</b> handler om to reaktioner, der går lige hurtigt. Feltet viser, at koncentrationerne ikke ændrer sig.",
                      reversibel: "<b>reversibel</b> siges om en reaktion, der kan gå begge veje. Feltet på grafen er tiden, hvor kurverne er vandrette." } },

            { id: "reversibel", ord: ["reversibel"], x: SK.x, y: SK.y - 62, maal: [SK.x, PIL.y - 13], dele: ["skema"],
              omr: [{ r: [PIL.x0 - 6, PIL.y - 13, PIL.x1 - PIL.x0 + 12, 26, 8] }],
              fejl: { "dynamisk ligevægt": "<b>dynamisk ligevægt</b> er en tilstand, hvor begge veje går lige hurtigt. Pladsen peger på dobbeltpilen i reaktionsskemaet.",
                      ligevægt: "<b>ligevægt</b> er en tilstand. Pladsen peger på dobbeltpilen, som viser, at reaktionen kan gå begge veje.",
                      "indstille sig": "<b>indstille sig</b> siges om koncentrationerne, der når deres endelige værdier. Pladsen peger på dobbeltpilen." } },
            { id: "dynamisk ligevægt", ord: ["dynamisk ligevægt"], x: KD.x + KD.b / 2, y: KD.y, maal: [KD.x + KD.b / 2, KD.y], titel: true, dele: ["inde"],
              omr: [{ r: [KD.x - 5, KD.y - 5, KD.b + 10, KD.h + 10, 18], tom: true }],
              fejl: { reversibel: "<b>reversibel</b> siges om en reaktion, der kan gå begge veje. Kortet viser mere: begge veje sker hele tiden, lige hurtigt.",
                      ligevægt: "<b>ligevægt</b> ses på grafen, hvor kurverne er vandrette. Kortet viser, at begge reaktioner hele tiden sker lige hurtigt.",
                      "indstille sig": "<b>indstille sig</b> handler om kurverne, der bøjer af. Kortet viser gassen, når kurverne er vandrette." } }
        ],

        tegn: function (api) {
            B2.defs();

            /* ----- Lag 1: grafen ---------------------------------------------------- */
            api.del("graf", {
                lag: 0,
                fuld: function (g) {
                    KV.diagram(g, { xa: G.xa, xb: G.xb, ya: G.ya, yb: G.yb, xmax: 60, ymax: 0.10, xtrin: 10, ytrin: 0.02, ydec: 2,
                        xtitel: "tid i sekunder", ytitel: "koncentration i M", yafst: 58 });
                    var ka = KV.kurve(g, KURVE.map(function (p) { return [X(p[0]), Y(p[1])]; }), F.accent, 2.8);
                    var kb = KV.kurve(g, KURVE.map(function (p) { return [X(p[0]), Y(p[2])]; }), F.serieB, 2.8, { moerk: "#5a2a04" });
                    KV.tekst(g, G.xb + 16, Y(0.100) + 6, "[NO_2]", { fs: 16, fed: true, farve: F.serieB, anker: "start" });
                    KV.tekst(g, G.xb + 16, Y(0.050) + 6, "[N_2O_4]", { fs: 16, fed: true, farve: F.accent, anker: "start" });
                    return { ka: ka, kb: kb };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.ka, 100, 1100); an.streg(r.kb, 100, 1100); }
            });

            api.del("felt", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g), xr = G.xb + 8, x0 = X(TL);
                    SV.el("path", { d: "M" + x0 + "," + G.yb + " V" + (G.ya - 8) + " H" + (xr - 7) + " Q" + xr + "," + (G.ya - 8) + " " + xr + "," + (G.ya - 1) + " V" + G.yb + " Z", fill: "url(#b2-felt)" }, gg);
                    KV.tekst(gg, X(46.5), Y(0.074) + 36, "kurverne er vandrette", { fs: 13.5, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 600); }
            });

            /* ----- Lag 2: reaktionsskemaet og kortet ind i gassen ------------------ */
            api.del("skema", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.tekst(gg, PIL.x0 - 12, SK.y, "N_2O_4(g)", { fs: SK.fs, fed: true, anker: "end" });
                    KV.tekst(gg, PIL.x1 + 12, SK.y, "2 NO_2(g)", { fs: SK.fs, fed: true, anker: "start" });
                    B2.dobbeltpil(gg, PIL.x0, PIL.x1, PIL.y);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            api.del("inde", {
                lag: 1,
                fuld: function (g) {
                    /* Luppen fra den vandrette del af kurven for NO₂ op til kortet */
                    var kx0 = KD.x + 120, kx1 = KD.x + KD.b - 120, ky = KD.y + KD.h;
                    SV.el("path", { d: "M" + (LUP.x - LUP.r) + "," + LUP.y + " L" + kx0 + "," + ky + " L" + kx1 + "," + ky + " L" + (LUP.x + LUP.r) + "," + LUP.y + " Z", fill: "url(#b2-kegle)" }, g);
                    KV.linje(g, LUP.x - LUP.r, LUP.y, kx0, ky, "#7f97ab", 1, "3 3");
                    KV.linje(g, LUP.x + LUP.r, LUP.y, kx1, ky, "#7f97ab", 1, "3 3");
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: "#ffffff", "fill-opacity": 0.35, stroke: "#5f7789", "stroke-width": 1.6 }, g);

                    KV.kort(g, KD.x, KD.y, KD.b, KD.h);
                    KV.tekst(g, KD.x + KD.b / 2, KD.y + 52, "i gassen, når kurverne er vandrette", { fs: 14.5, farve: F.daempet });
                    var gg = SV.g(g);
                    PV.forEach(function (v, k) {
                        var hoejre = k === 0, farve = hoejre ? F.serieB : B2.F.lilla, my = v.y + v.h / 2;
                        B2.vindue(gg, v.x, v.y, v.b, v.h, function (ind) {
                            var nx = v.x + 42, ox = v.x + v.b - 50;
                            /* N₂O₄ til venstre, de to NO₂ til hoejre, som i reaktionsskemaet */
                            B2.molekyle(ind, "N2O4", nx, my, 0, 1.35);
                            KV.fart(ind, ox, my - 22, hoejre ? -20 : 160, 16, "#8a9ba6", 12, 0.55);
                            KV.fart(ind, ox + 6, my + 22, hoejre ? 20 : 200, 16, "#8a9ba6", 12, 0.55);
                            B2.molekyle(ind, "NO2", ox, my - 22, -90, 1.35);
                            B2.molekyle(ind, "NO2", ox + 6, my + 22, 90, 1.35);
                            if (hoejre) KV.pil(ind, nx + 34, my, ox - 30, my, farve, 3.2, 12);
                            else KV.pil(ind, ox - 30, my, nx + 34, my, farve, 3.2, 12);
                        });
                        KV.tekst(gg, v.x + v.b / 2, v.y + v.h + 26, hoejre ? "mod højre" : "mod venstre", { fs: 16, fed: true, farve: farve });
                        KV.tekst(gg, v.x + v.b / 2, v.y + v.h + 47, "5 gange pr. sekund", { fs: 14.5, farve: F.blaek });
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

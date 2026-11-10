/* =====================================================================
   fig_ring.js - figuren til B7.2 Ringslutning

   Bogens b7-ringslutning og b7-alfa-beta samlet i én figur: til venstre
   den åbne kæde af glucose som fischerprojektion med aldehydgruppen i en
   grøn boks og OH på carbonatom 5 orange. En ligevægtspil fører over til
   en ramme med de to ringformer, α-glucose og β-glucose, som
   haworthformler med ringens oxygenatom orange og OH-gruppen på
   carbonatom 1 grøn. Pladsen ringslutning peger på pilen, og
   haworthformel er titlen på rammen om begge ringe, så den ikke står
   over den ene af dem. Navnene på ringene sidder som skilte under
   kortene, og fordelingen i vand (36 % og 64 %) kommer frem, når navnet
   sidder. Bogens linjer "OH-gruppen på carbonatom 1 peger ned" og titlerne
   α-D-glucose og β-D-glucose er taget af.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var KH = NK.KH;
    var F = KH.F;

    var KY = 70, KH_ = 286;
    var K0 = { x: 22, y: KY, b: 232, h: KH_ };                              /* den åbne kæde */
    var RAMME = { x: 380, y: 46, b: 676, h: KH_ + 50 };                    /* haworthformel */
    var KA = { x: 396, y: KY, b: 312, h: KH_ }, KB = { x: 728, y: KY, b: 312, h: KH_ };
    var PIL = { x1: 274, x2: 360, y: KY + KH_ / 2 };
    var RY = KY + 128;                                                      /* ringenes midte */
    var RINGO = { a: 58, h: 34, fs: 17, s: 18, numre: true, oFarve: F.sukker };

    /* Ringene maales uden at tegne, saa de gule felter kan ligge om OH paa carbonatom 1 */
    function ringMaal(cx, form, farver) {
        var o = KH.med(form, RINGO);
        o.farver = farver;
        return KH.ring(SV.el("g"), cx, RY, o);
    }
    var RA = ringMaal(KA.x + KA.b / 2 - 6, KH.GLC_A, {});
    var RB = ringMaal(KB.x + KB.b / 2 - 6, KH.GLC_B, {});
    function ohFelt(ring, noegle) {
        var m = ring.gruppe(noegle);
        return { r: [m[2] - 8, m[1] - 15, m[3] - m[2] + 16, 30, 10] };
    }

    function navn(id, k, dele, ring, noegle, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 18] }, ohFelt(ring, noegle)], fejl: fejl };
    }

    NK.FIGURER.ring = {
        vb: [1076, 420],
        lag: [
            { navn: "Fra kæde til ring", pladser: ["ringslutning", "haworthformel"],
              ros: "Ved ringslutningen binder oxygenatomet på carbonatom 5 sig til carbonatom 1. Ringen tegnes som en haworthformel." },
            { navn: "α og β", pladser: ["α-glucose", "β-glucose"],
              ros: "I α-glucose peger OH på carbonatom 1 ned, og i β-glucose peger den op. I vand er 64 % β-glucose." }
        ],
        pladser: [
            { id: "ringslutning", ord: ["ringslutning"], x: (PIL.x1 + PIL.x2) / 2 + 4, y: 26, maal: [(PIL.x1 + PIL.x2) / 2, PIL.y - 12], dele: ["pil"],
              omr: [{ r: [PIL.x1 - 6, PIL.y - 16, PIL.x2 - PIL.x1 + 12, 32, 10] }],
              fejl: { haworthformel: "<b>haworthformel</b> er en måde at tegne ringen på. Pladsen peger på pilen fra kæden til ringene.",
                      "α-glucose": "<b>α-glucose</b> er en af ringene. Pladsen peger på pilen, hvor kæden lukker sig til en ring.",
                      "β-glucose": "<b>β-glucose</b> er en af ringene. Pladsen peger på pilen, hvor kæden lukker sig til en ring." } },
            { id: "haworthformel", ord: ["haworthformel"], x: RAMME.x + RAMME.b / 2, y: RAMME.y, maal: [RAMME.x + RAMME.b / 2, RAMME.y], titel: true, dele: ["ramme", "ringe"],
              omr: [{ r: [RAMME.x - 4, RAMME.y - 4, RAMME.b + 8, RAMME.h + 8, 18], tom: true }],
              fejl: { ringslutning: "<b>ringslutning</b> er reaktionen, hvor kæden lukker sig. Titlen er navnet på måden, begge ringe er tegnet på.",
                      "α-glucose": "<b>α-glucose</b> er kun den ene ring. Titlen gælder begge ringe i rammen og måden, de er tegnet på.",
                      "β-glucose": "<b>β-glucose</b> er kun den ene ring. Titlen gælder begge ringe i rammen og måden, de er tegnet på." } },

            navn("α-glucose", KA, ["pa"], RA, "1ned", {
                "β-glucose": "<b>β-glucose</b> har OH på carbonatom 1 opad. Se, hvilken vej den grønne OH-gruppe peger i denne ring.",
                haworthformel: "<b>haworthformel</b> gælder begge ringe. Skiltet under kortet er navnet på netop denne ringform." }),
            navn("β-glucose", KB, ["pb"], RB, "1op", {
                "α-glucose": "<b>α-glucose</b> har OH på carbonatom 1 nedad. Se, hvilken vej den grønne OH-gruppe peger i denne ring.",
                haworthformel: "<b>haworthformel</b> gælder begge ringe. Skiltet under kortet er navnet på netop denne ringform." })
        ],

        tegn: function (api) {
            KH.defs();
            var G = F.accent, O = F.sukker;

            api.del("base", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, K0.x, K0.y, K0.b, K0.h);
                    KH.t(g, K0.x + K0.b / 2, K0.y + 28, "Åben kæde", 15.5, { farve: F.daempet, fed: true });
                    KH.fischer(g, K0.x + K0.b / 2 - 2, K0.y + 76, KH.GLUCOSE, { a: 30, w: 22, numre: true, bokse: [[0, G]], farver: { 4: O } });
                    ORG.kortB(g, KA.x, KA.y, KA.b, KA.h);
                    ORG.kortB(g, KB.x, KB.y, KB.b, KB.h);
                }
            });
            api.del("pil", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    ORG.reaktionspil(gg, PIL.x1, PIL.x2, PIL.y, { lig: true, farve: F.blaek });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: RAMME.x, y: RAMME.y, width: RAMME.b, height: RAMME.h, rx: 18, fill: "none", stroke: G, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 700); }
            });
            api.del("ringe", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [[KA, KH.GLC_A, "1ned"], [KB, KH.GLC_B, "1op"]].forEach(function (d) {
                        var o = KH.med(d[1], RINGO);
                        var f = {}; f[d[2]] = G; f["1"] = G;
                        o.farver = f;
                        var r = KH.ring(SV.el("g"), d[0].x + d[0].b / 2 - 6, RY, o);
                        var m = r.gruppe(d[2]);
                        KH.glod(gg, m[0], m[1], 18, 12, G, 0.3);
                        KH.ring(gg, d[0].x + d[0].b / 2 - 6, RY, o);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            /* ----- Lag 2: fordelingen i vand ---------------------------------- */
            [["pa", KA, 36], ["pb", KB, 64]].forEach(function (d) {
                api.del(d[0], {
                    lag: 1,
                    fuld: function (g) {
                        var gg = SV.g(g), k = d[1], cx = k.x + k.b / 2;
                        KH.t(gg, cx, k.y + k.h - 58, d[2] + " % i vand", 15, { farve: G, fed: true });
                        KH.energi(gg, cx, k.y + k.h - 48, d[2] * 0.4, 150, true);
                        return { g: gg };
                    },
                    byg: function (g, r, an) { an.fade(r.g, 0, 500); }
                });
            });
        }
    };
}());

/* =====================================================================
   fig_indgreb.js - figuren til B2.4 Ikke-ligevægt og indgreb

   Lavet om 2. nov. 2026 efter brugerens ord: "Synes også Le Chateliers
   princip skal komme henover en boks over hvad han har sagt.. Og så er
   "forskud" i 2.3 nu brugt i anden indforstået sammenhæng." Bogen siger
   selv: "I afsnit B2.2 fortalte ordet forskudt, hvor ligevægten ligger.
   Her fortæller det, at den flytter sig."

   Ét eksempel gennem hele fanen: afsnittets CO + H₂O ⇌ CO₂ + H₂ med K = 4,0.
   Grafen (Claudes tilfoejelse, bogen har tallene i teksten) viser
   koncentrationerne med tiden: ligevægt med [H₂] = [CO₂] = 0,20 M og
   [CO] = [H₂O] = 0,10 M, saa pumpes dihydrogen ind til 0,45 M, og
   bagefter flytter ligevægten sig til [H₂] = 0,42 M, [CO₂] = 0,17 M og
   [CO] = [H₂O] = 0,13 M (regnet med K = 4,0). Pladsen indgreb sidder paa
   springet, og pladsen forskudt paa de krumme stykker bagefter (gult felt
   langs kurverne, kurver.js).
   Til hoejre bogens boks med Le Chateliers princip. Den laa foerst i et lag
   for sig, men brugeren 2. nov. 2026: "ved 2.4 skal Le Chateliers princip
   komme med det samme.. ellers er den alene". Tre fagord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B2 = NK.B2;
    var F = KV.F;

    /* Grafen: tiden gaar fra 0 til 10 uden enhed; indgrebet sker ved 3 */
    var G = { xa: 110, xb: 620, ya: 112, yb: 520 };
    var T1 = 3, TAU = 0.85, XN = 0.0323;
    function X(t) { return G.xa + (G.xb - G.xa) * t / 10; }
    function Y(c) { return G.yb - (G.yb - G.ya) * c / 0.50; }
    function e(t) { return Math.exp(-(t - T1) / TAU); }
    var STOF = [
        { navn: "[H_2]", foer: 0.20, efter: function (t) { return 0.45 - XN + XN * e(t); }, farve: F.accent, moerk: "#0b3d39" },
        { navn: "[CO_2]", foer: 0.20, efter: function (t) { return 0.20 - XN + XN * e(t); }, farve: F.serieB, moerk: "#5a2a04" },
        { navn: "[CO] og [H_2O]", foer: 0.10, efter: function (t) { return 0.10 + XN - XN * e(t); }, farve: "#6d4bb5", moerk: "#2e1b5c" }
    ];
    function punkter(s, t0, t1) {
        var ud = [];
        for (var t = t0; t <= t1 + 1e-9; t += 0.05) ud.push([X(t), Y(s.efter(t))]);
        return ud;
    }
    var T2 = 7.2;                                                 /* her er den nye ligevaegt naaet */
    var BUER = STOF.map(function (s) { return punkter(s, T1 + 0.08, T2 - 0.6); });
    var PF = [X(4.1), Y(STOF[2].efter(4.1))];                     /* prikken for forskudt */

    /* Boksen med Le Chateliers princip */
    var BK = { x: 772, y: 150, b: 306, h: 250 };
    var REGEL = ["Bliver en ligevægt udsat for", "et indgreb, forskydes den", "i den retning, der modvirker", "indgrebet."];

    NK.FIGURER.indgreb = {
        vb: [1100, 580],
        lag: [
            { navn: "Indgreb og forskydning", pladser: ["indgreb", "forskudt", "Le Chateliers princip"],
              ros: "Indgrebet får [H₂] til at springe op. Ligevægten forskydes, så den modvirker indgrebet, og noget af dihydrogenet bruges." }
        ],
        pladser: [
            { id: "indgreb", ord: ["indgreb"], x: X(6.1), y: Y(0.31), maal: [X(T1) + 2, Y(0.31)], dele: ["graf", "spring"],
              omr: [{ r: [X(T1) - 11, Y(0.45) - 8, 22, Y(0.20) - Y(0.45) + 16, 8] }],
              fejl: { forskudt: "<b>forskudt</b> siges om ligevægten, der flytter sig bagefter. Pladsen peger på springet, da dihydrogen pumpes ind.",
                      "Le Chateliers princip": "<b>Le Chateliers princip</b> er en huskeregel. Pladsen peger på det, der bliver gjort udefra: dihydrogen pumpes ind." } },
            { id: "forskudt", ord: ["forskudt"], x: X(6.4), y: Y(0.045), maal: PF, dele: ["graf", "skift"],
              omr: BUER.map(function (b) { return { linje: b, b: 15 }; }),
              fejl: { indgreb: "<b>indgreb</b> er springet, da dihydrogen pumpes ind. Pladsen peger på kurverne bagefter, hvor ligevægten flytter sig.",
                      "Le Chateliers princip": "<b>Le Chateliers princip</b> er en huskeregel. Pladsen peger på kurverne, hvor ligevægten flytter sig." } },

            { id: "Le Chateliers princip", ord: ["Le Chateliers princip"], x: BK.x + BK.b / 2, y: BK.y, maal: [BK.x + BK.b / 2, BK.y], titel: true, dele: ["boks"],
              omr: [{ r: [BK.x - 5, BK.y - 5, BK.b + 10, BK.h + 10, 18], tom: true }],
              fejl: { indgreb: "<b>indgreb</b> er kun det, der bliver gjort udefra. Overskriften gælder hele reglen i boksen.",
                      forskudt: "<b>forskudt</b> siger kun, at ligevægten flytter sig. Overskriften gælder hele reglen i boksen." } }
        ],

        tegn: function (api) {
            B2.defs();

            /* Reaktionsskemaet over grafen og grafen med ligevaegten foer indgrebet */
            api.del("graf", {
                lag: 0,
                fuld: function (g) {
                    var cx = (G.xa + G.xb) / 2 + 40, sy = 52;
                    KV.tekst(g, cx - 32, sy, "CO(g) + H_2O(g)", { fs: 22, fed: true, anker: "end" });
                    B2.dobbeltpil(g, cx - 22, cx + 22, sy - 7, F.blaek, 2.2, 9);
                    KV.tekst(g, cx + 32, sy, "CO_2(g) + H_2(g)", { fs: 22, fed: true, anker: "start" });
                    B2.akser(g, { xa: G.xa, xb: G.xb, ya: G.ya, yb: G.yb, xmax: 10, ymax: 0.50, ytrin: 0.10, ydec: 2, xtitel: "tid", ytitel: "koncentration i M", yafst: 58 });
                    STOF.forEach(function (s) { KV.kurve(g, [[X(0), Y(s.foer)], [X(T1), Y(s.foer)]], s.farve, 2.8, { moerk: s.moerk }); });
                    KV.tekst(g, X(1.5), G.ya + 22, "ligevægt", { fs: 15, fed: true, farve: F.daempet });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* Springet: dihydrogen pumpes ind */
            api.del("spring", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.linje(gg, X(T1), Y(0.20), X(T1), Y(0.45), F.accent, 2.8);
                    KV.tekst(gg, X(T1) - 12, Y(0.40), "der pumpes", { fs: 15, fed: true, farve: F.accent, anker: "end" });
                    KV.tekst(gg, X(T1) - 12, Y(0.40) + 20, "dihydrogen ind", { fs: 15, fed: true, farve: F.accent, anker: "end" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            /* Bagefter: ligevaegten flytter sig til en ny ligevaegt */
            api.del("skift", {
                lag: 0,
                fuld: function (g) {
                    var k = STOF.map(function (s) { return KV.kurve(g, punkter(s, T1, 10), s.farve, 2.8, { moerk: s.moerk }); });
                    STOF.forEach(function (s, i) {
                        var y = Y(s.efter(10)) + 5 + (i === 1 ? -4 : (i === 2 ? 8 : 0));
                        KV.tekst(g, G.xb + 14, y, s.navn, { fs: 15, fed: true, farve: s.farve, anker: "start" });
                    });
                    KV.tekst(g, X(8.6), G.ya + 22, "ny ligevægt", { fs: 15, fed: true, farve: F.daempet });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 300); r.k.forEach(function (k) { an.streg(k, 100, 1000); }); }
            });

            /* ----- Bogens boks med Le Chateliers princip (samme lag) ----------------- */
            api.del("boks", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, BK.x, BK.y, BK.b, BK.h, { kant: "#e3b23c" });
                    SV.el("rect", { x: BK.x, y: BK.y + 16, width: 5, height: BK.h - 32, rx: 2.5, fill: "#e3a21a" }, g);
                    REGEL.forEach(function (l, i) { KV.tekst(g, BK.x + 26, BK.y + 58 + i * 26, l, { fs: 16, anker: "start" }); });
                    KV.linje(g, BK.x + 26, BK.y + 172, BK.x + BK.b - 26, BK.y + 172, "#d5dde2", 1.2);
                    KV.tekst(g, BK.x + 26, BK.y + 202, "Her bliver noget af det tilsatte", { fs: 14.5, farve: F.daempet, anker: "start" });
                    KV.tekst(g, BK.x + 26, BK.y + 224, "dihydrogen brugt igen.", { fs: 14.5, farve: F.daempet, anker: "start" });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

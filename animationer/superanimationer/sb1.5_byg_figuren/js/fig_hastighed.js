/* =====================================================================
   fig_hastighed.js - figuren til B1.1 Reaktionshastighed

   Bogens to grafer over [BrO₃⁻] (hastighed-tangent og hastighed-sekant)
   side om side, med samme kurve som bogens bromat(): 1,00 mM fra start
   og k = 0,0116 pr. sekund.
   Til venstre tangenten i t = 0 s med v₀ = 1,2 · 10⁻⁵ M/s og (i lag 2)
   tangenten i t = 120 s med v = 2,9 · 10⁻⁶ M/s. Til hoejre linjen gennem
   punkterne ved 0 s og 60 s med hældningstrekanten.
   Bogens tekster "tangent i t = 0 s" er taget af, saa de ikke afsloerer
   pladsen; tallene staar som "hældningen ved t = 0 s".
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;

    function bromat(t) { return Math.exp(-0.0116 * t); }

    /* Venstre graf (tangenterne) og hoejre graf (gennemsnittet) */
    var A = { xa: 110, xb: 560, ya: 130, yb: 440 };
    var B = { xa: 740, xb: 1060, ya: 130, yb: 440 };
    function XA(t) { return A.xa + (A.xb - A.xa) * t / 300; }
    function XB(t) { return B.xa + (B.xb - B.xa) * t / 300; }
    function Y(c) { return A.yb - (A.yb - A.ya) * c; }

    /* Tangenterne: i t0 gaar linjen med haeldningen -0,0116 · c(t0) */
    function tangent(t0, ta, tb) {
        var c0 = bromat(t0), h = -0.0116 * c0;
        return [[XA(ta), Y(c0 + h * (ta - t0))], [XA(tb), Y(c0 + h * (tb - t0))]];
    }
    var T0 = tangent(0, 0, 86.2);
    var T120 = tangent(120, 60, 206);
    var T0_PRIK = [XA(75), Y(1 - 0.0116 * 75)];

    /* Etiketterne med tallene */
    var V0 = { x: 170, y: 190 };
    var V120 = { x: 386, y: 322 };

    function diagram(g, P, X) {
        var d = KV.diagram(g, { xa: P.xa, xb: P.xb, ya: P.ya, yb: P.yb, xmax: 300, ymax: 1.0, xtrin: 60, ytrin: 0.2,
            xtitel: "tid i sekunder", ytitel: "[BrO_3^−] i mM", yafst: 50 });
        var pk = [];
        for (var t = 0; t <= 300; t += 3) pk.push([X(t), Y(bromat(t))]);
        return { d: d, k: KV.kurve(g, pk, F.accent, 2.6) };
    }

    NK.FIGURER.hastighed = {
        vb: [1100, 590],
        lag: [
            { navn: "Tangenten ved start", pladser: ["tangent", "starthastighed"],
              ros: "Tangenten rører kurven ved t = 0 s. Dens hældning er starthastigheden, v₀ = 1,2 · 10⁻⁵ M/s." },
            { navn: "Tidspunkt og tidsrum", pladser: ["reaktionshastighed", "gennemsnitshastighed"],
              ros: "Ved 120 s er reaktionshastigheden kun 2,9 · 10⁻⁶ M/s. Gennemsnitshastigheden gælder et tidsrum, her de første 60 s." }
        ],
        pladser: [
            { id: "tangent", ord: ["tangent"], x: 223, y: 550, maal: T0_PRIK, dele: ["t0"],
              omr: [{ linje: T0, b: 15 }],
              fejl: { starthastighed: "<b>starthastighed</b> er et tal med enheden M/s. Pladsen peger på selve den rette linje, der rører kurven.",
                      reaktionshastighed: "<b>reaktionshastighed</b> er et tal med enheden M/s. Pladsen peger på selve den rette linje, der rører kurven.",
                      gennemsnitshastighed: "<b>gennemsnitshastighed</b> er hældningen mellem to punkter på kurven. Linjen her rører kurven i ét punkt." } },
            { id: "starthastighed", ord: ["starthastighed"], x: 205, y: 70, maal: [215, V0.y - 19], dele: ["v0"],
              omr: [{ r: [V0.x - 6, V0.y - 19, 182, 46, 7] }],
              fejl: { tangent: "<b>tangent</b> er den rette linje. Pladsen peger på tallet for linjens hældning ved t = 0 s.",
                      reaktionshastighed: "<b>reaktionshastighed</b> passer på alle tidspunkter. Hastigheden lige ved start, v₀, har sit eget navn.",
                      gennemsnitshastighed: "<b>gennemsnitshastighed</b> gælder et tidsrum. v₀ er hastigheden i ét øjeblik, lige når reaktionen begynder." } },

            { id: "reaktionshastighed", ord: ["reaktionshastighed"], x: 530, y: 70, maal: [520, V120.y - 19], dele: ["t120", "v120"],
              omr: [{ r: [V120.x - 6, V120.y - 19, 178, 46, 7] }],
              fejl: { starthastighed: "<b>starthastighed</b> er hastigheden, lige når reaktionen begynder, ved t = 0 s. Her er t = 120 s.",
                      gennemsnitshastighed: "<b>gennemsnitshastighed</b> gælder et tidsrum. Tallet her er hældningen i ét punkt, ved t = 120 s.",
                      tangent: "<b>tangent</b> er den rette linje. Pladsen peger på tallet med enheden M/s." } },
            { id: "gennemsnitshastighed", ord: ["gennemsnitshastighed"], x: 935, y: 70, maal: [XB(40), Y(1 - 0.5 * 40 / 60)], dele: ["sekant"],
              omr: [{ r: [XB(0) - 6, Y(1) - 6, XB(60) - XB(0) + 12, Y(0.5) - Y(1) + 12, 7] }],
              fejl: { starthastighed: "<b>starthastighed</b> findes med en tangent i t = 0 s. Linjen her går gennem to punkter på kurven.",
                      tangent: "<b>tangent</b> rører kurven i ét punkt. Linjen her går gennem to punkter på kurven.",
                      reaktionshastighed: "<b>reaktionshastighed</b> er her hastigheden til ét tidspunkt. Linjen går gennem to punkter, 60 s fra hinanden." } }
        ],

        tegn: function (api) {
            KV.defs();

            /* ----- Lag 1: grafen med tangenten i t = 0 s ------------------------- */
            api.del("graf1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var r = diagram(g, A, XA);
                    KV.punkt(g, XA(0), Y(1), "a");
                    return r;
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.k, 100, 900); }
            });

            api.del("t0", {
                lag: 0,
                fuld: function (g) {
                    var l = KV.kurve(g, T0, F.blaek, 2.2, { moerk: "#000000" });
                    KV.punkt(g, XA(0), Y(1), "a");
                    return { l: l };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 700); }
            });

            api.del("v0", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.tekst(gg, V0.x, V0.y, "v_0 = 1,2 · 10^{−5} M/s", { fs: 15, fed: true, anker: "start", halo: true });
                    KV.tekst(gg, V0.x, V0.y + 19, "hældningen ved t = 0 s", { fs: 13, farve: F.daempet, anker: "start", halo: true });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: tangenten i t = 120 s og gennemsnittet ----------------- */
            api.del("t120", {
                lag: 1,
                fuld: function (g) {
                    var l = KV.kurve(g, T120, F.blaek, 2.2, { moerk: "#000000" });
                    KV.punkt(g, XA(120), Y(bromat(120)), "a");
                    return { l: l };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 700); }
            });

            api.del("v120", {
                lag: 1,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.tekst(gg, V120.x, V120.y, "v = 2,9 · 10^{−6} M/s", { fs: 15, fed: true, anker: "start", halo: true });
                    KV.tekst(gg, V120.x, V120.y + 19, "hældningen ved t = 120 s", { fs: 13, farve: F.daempet, anker: "start", halo: true });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 150, 450); }
            });

            api.del("graf2", {
                lag: 1, auto: true,
                fuld: function (g) {
                    var r = diagram(g, B, XB);
                    KV.punkt(g, XB(0), Y(1), "a");
                    KV.punkt(g, XB(60), Y(bromat(60)), "a");
                    return r;
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.k, 100, 900); }
            });

            api.del("sekant", {
                lag: 1,
                fuld: function (g) {
                    var x1 = XB(0), y1 = Y(1), x2 = XB(60), y2 = Y(bromat(60));
                    SV.el("path", { d: "M" + x1 + "," + y1 + " H" + x2 + " V" + y2 + " Z", fill: F.accent, "fill-opacity": 0.1 }, g);
                    KV.linje(g, x1, y1, x2, y1, F.daempet, 1.3, "4 4");
                    KV.linje(g, x2, y1, x2, y2, F.daempet, 1.3, "4 4");
                    var l = KV.kurve(g, [[x1, y1], [x2, y2]], F.blaek, 2.2, { moerk: "#000000" });
                    KV.punkt(g, x1, y1, "a");
                    KV.punkt(g, x2, y2, "a");
                    var t1 = KV.tekst(g, (x1 + x2) / 2, y1 - 11, "Δt = 60 s", { fs: 13.5, fed: true, halo: true });
                    var t2 = KV.tekst(g, x2 + 9, 252, "Δ[BrO_3^−] = −0,50 mM", { fs: 13.5, fed: true, anker: "start", halo: true });
                    return { l: l, t1: t1, t2: t2 };
                },
                byg: function (g, r, an) { an.streg(r.l, 0, 600); an.pop(r.t1, 300, 400); an.pop(r.t2, 450, 400); }
            });
        }
    };
}());

/* =====================================================================
   fig_lambert.js - figuren til B5.3 Lambert-Beers lov

   Øverst bogens lambert-koncentration: tre kuvetter med permanganat,
   1, 2 og 3 · 10⁻⁴ M målt ved 525 nm (57, 32 og 18 % af lyset slipper
   igennem, A = 0,245, 0,490 og 0,735). Ved siden af de tre maalinger som
   punkter paa en ret linje gennem (0, 0); grafen staar ikke i bogen, men
   er lavet som bogens standardkurve, og pladsen ligefrem proportional
   peger paa linjen.
   Nederst til venstre bogens lambert-lysvej: samme opløsning i en smal
   kuvette (l = 1,00 cm, A = 0,490) og en bred (l = 2,00 cm, A = 0,980).
   Titlerne Smal og Bred kuvette er taget af for at spare plads; lysvej
   peger paa dobbeltpilene under kuvetterne.
   Nederst til hoejre bogens lambert-formel som et kort: Lambert-Beers lov
   er titlen paa kortet med A = ε · l · c (en regel med et navn er titel
   paa en boks med reglen), og ekstinktionskoefficient peger paa ε.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B5 = NK.B5;
    var F = KV.F;

    var GROEN = B5.lysfarve(525);
    function lilla(styrke) { return B5.fortyndet(B5.F.lilla, styrke); }

    /* ----- Lag 1: koncentrationen ------------------------------------------- */
    var RA = { x: 20, y: 18, b: 640, h: 246 };
    var KON = [
        { cx: 128, c: "1,00", T: 0.569, pct: "57 %", A: "0,245", a: 0.245, styrke: 0.3, n: 6 },
        { cx: 340, c: "2,00", T: 0.324, pct: "32 %", A: "0,490", a: 0.49, styrke: 0.52, n: 12 },
        { cx: 552, c: "3,00", T: 0.184, pct: "18 %", A: "0,735", a: 0.735, styrke: 0.74, n: 18 }
    ];
    var LY1 = 134, BUND1 = 192;
    var RB = { x: 680, y: 18, b: 400, h: 246 };
    var GA = { xa: 762, xb: 1040, ya: 98, yb: 206, xmax: 3.5, ymax: 0.8 };
    function GX(c) { return GA.xa + (GA.xb - GA.xa) * c / GA.xmax; }
    function GY(a) { return GA.yb - (GA.yb - GA.ya) * a / GA.ymax; }

    /* ----- Lag 1: lysvejen ---------------------------------------------------- */
    var RC = { x: 20, y: 290, b: 540, h: 290 };
    var LY2 = 394, BUND2 = 452, PIL = 470;
    var VEJ = [
        { cx: 128, b: 64, T: 0.324, pct: "32 %", l: "l = 1,00 cm", A: "A = 0,490", n: 12, fro: 21 },
        { cx: 360, b: 128, T: 0.105, pct: "10 %", l: "l = 2,00 cm", A: "A = 0,980", n: 24, fro: 22 }
    ];

    /* ----- Lag 2: loven ------------------------------------------------------- */
    var RD = { x: 580, y: 290, b: 500, h: 290 };
    var FY = 400, FS = 50;                                      /* formlen */
    var EPS = { x: 0, b: 0 };                                     /* ε i formlen (maales i tegn) */

    NK.FIGURER.lambert = {
        vb: [1100, 598],
        lag: [
            { navn: "Koncentration og lysvej", pladser: ["ligefrem proportional", "lysvej"],
              ros: "Absorbansen er ligefrem proportional med koncentrationen. Dobbelt så lang lysvej giver dobbelt så stor absorbans." },
            { navn: "Loven", pladser: ["Lambert-Beers lov", "ekstinktionskoefficient"],
              ros: "Lambert-Beers lov samler det hele: A = ε · l · c. Ekstinktionskoefficienten ε hører til stoffet." }
        ],
        pladser: [
            { id: "ligefrem proportional", ord: ["ligefrem proportional"], x: 902, y: 54, maal: [GX(1.5), GY(0.245 * 1.5) - 4], dele: ["glas", "graf"],
              omr: [{ linje: [[GX(0), GY(0)], [GX(3.25), GY(0.245 * 3.25)]], b: 18 }],
              fejl: { "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er hele formlen A = ε · l · c. Pladsen peger på den rette linje gennem (0, 0).",
                      "lysvej": "<b>lysvej</b> er kuvettens bredde. Pladsen peger på den rette linje, der viser, hvordan A følger c.",
                      "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> er ε. Pladsen peger på den rette linje, der viser, hvordan A følger c." } },
            { id: "lysvej", ord: ["lysvej"], x: 290, y: 546, maal: [VEJ[1].cx - 16, PIL + 4], dele: ["vej"],
              omr: VEJ.map(function (v) { return { r: [v.cx - v.b / 2 - 5, PIL - 9, v.b + 10, 18, 6] }; }),
              fejl: { "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> siger, hvor kraftigt stoffet absorberer. Pladsen peger på kuvettens bredde.",
                      "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng. Pladsen peger på kuvettens bredde, som lyset går igennem.",
                      "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er formlen A = ε · l · c. Pladsen peger på kuvettens bredde." } },

            { id: "Lambert-Beers lov", ord: ["Lambert-Beers lov"], x: RD.x + RD.b / 2, y: RD.y, maal: [RD.x + RD.b / 2, RD.y], titel: true, dele: ["lov"],
              omr: [{ r: [RD.x - 4, RD.y - 4, RD.b + 8, RD.h + 8, 18], tom: true }],
              fejl: { "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng mellem to størrelser. Overskriften er navnet på formlen A = ε · l · c.",
                      "ekstinktionskoefficient": "<b>ekstinktionskoefficient</b> er kun ε. Overskriften er navnet på hele formlen A = ε · l · c." } },
            { id: "ekstinktionskoefficient", ord: ["ekstinktionskoefficient"], x: RD.x + RD.b / 2, y: 484, maal: [0, 0], dele: ["eps"],
              omr: [],
              fejl: { "lysvej": "<b>lysvej</b> er l, kuvettens bredde. Pladsen peger på ε, der siger, hvor kraftigt stoffet absorberer lys.",
                      "Lambert-Beers lov": "<b>Lambert-Beers lov</b> er hele formlen. Pladsen peger kun på ε.",
                      "ligefrem proportional": "<b>ligefrem proportional</b> er en sammenhæng. Pladsen peger på ε, en konstant for stoffet." } }
        ],

        tegn: function (api) {
            B5.defs();
            var self = this;
            function plads(id) { return self.pladser.filter(function (p) { return p.id === id; })[0]; }

            /* Formlen maales, saa pladsen kan pege paa ε */
            var dele = [["A", F.blaek], ["=", F.blaek], ["ε", B5.F.eps], ["·", F.blaek], ["l", B5.F.l], ["·", F.blaek], ["c", B5.F.c]];
            var mell = 14, bredder = dele.map(function (d) { return B5.bredde(d[0], FS, 700, B5.FORMEL); });
            var ialt = bredder.reduce(function (a, b) { return a + b; }, 0) + mell * (dele.length - 1);
            var fx = RD.x + RD.b / 2 - ialt / 2, xs = [];
            bredder.forEach(function (w) { xs.push(fx); fx += w + mell; });
            EPS.x = xs[2]; EPS.b = bredder[2];
            var pe = plads("ekstinktionskoefficient");
            pe.omr = [{ r: [EPS.x - 8, FY - FS * 0.72, EPS.b + 16, FS * 0.95, 8] }];
            pe.maal = [EPS.x + EPS.b / 2, FY + FS * 0.23 + 6];

            /* ----- Lag 1: tre koncentrationer ------------------------------------ */
            api.del("glas", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    KON.forEach(function (k, i) {
                        KV.tekst(g, k.cx, 50, "c = " + k.c + " · 10^{−4} M", { fs: 16, fed: true });
                        B5.maaling(g, k.cx, LY1, BUND1, 64, 112, lilla(k.styrke), GROEN, k.T, { partikler: k.n, fro: 11 + i });
                        KV.tekst(g, k.cx - 70, LY1 - 22, "100 %", { fs: 14, farve: F.daempet });
                        KV.tekst(g, k.cx + 70, LY1 - 22, k.pct, { fs: 14.5, fed: true });
                        KV.tekst(g, k.cx, 230, "A = " + k.A, { fs: 18, fed: true, farve: F.accent });
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("graf", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.flade(g, GA.xa, GA.ya - 8, GA.xb + 8, GA.yb);
                    var n;
                    for (n = 1; n * 0.2 <= GA.ymax + 1e-9; n++) KV.linje(g, GA.xa, GY(n * 0.2), GA.xb + 8, GY(n * 0.2), F.net, 1);
                    KV.linje(g, GA.xa, GA.yb, GA.xb + 8, GA.yb, F.daempet, 1.3);
                    KV.linje(g, GA.xa, GA.ya - 8, GA.xa, GA.yb, F.daempet, 1.3);
                    for (n = 0; n * 0.2 <= GA.ymax + 1e-9; n++) {
                        KV.linje(g, GA.xa - 5, GY(n * 0.2), GA.xa, GY(n * 0.2), F.daempet, 1.2);
                        KV.tekst(g, GA.xa - 10, GY(n * 0.2) + 4.5, (n * 0.2).toFixed(1).replace(".", ","), { fs: 13, anker: "end", farve: F.daempet });
                    }
                    for (n = 0; n <= 3; n++) {
                        KV.linje(g, GX(n), GA.yb, GX(n), GA.yb + 5, F.daempet, 1.2);
                        KV.tekst(g, GX(n), GA.yb + 21, String(n), { fs: 13, farve: F.daempet });
                    }
                    KV.tekst(g, (GA.xa + GA.xb) / 2, GA.yb + 43, "c i 10^{−4} M", { fs: 13.5, farve: F.daempet });
                    var yx = GA.xa - 44, ym = (GA.ya + GA.yb) / 2;
                    KV.tekst(g, yx, ym, "absorbans", { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + yx + " " + ym + ")" });
                    var l = KV.kurve(g, [[GX(0), GY(0)], [GX(3.3), GY(0.245 * 3.3)]], F.accent, 2.4);
                    var pk = SV.g(g);
                    KON.forEach(function (k, i) { KV.punkt(pk, GX(i + 1), GY(k.a), "a"); });
                    return { l: l, pk: pk };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.pk, 200, 500); }
            });

            /* ----- Lag 1: lysvejen ------------------------------------------------ */
            api.del("vej", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    KV.tekst(g, RC.x + RC.b / 2, RC.y + 28, "Samme opløsning i to kuvetter", { fs: 16, fed: true });
                    VEJ.forEach(function (v) {
                        var x0 = v.cx - v.b / 2, x1 = v.cx + v.b / 2;
                        B5.maaling(g, v.cx, LY2, BUND2, v.b, 112, lilla(0.52), GROEN, v.T, { partikler: v.n, fro: v.fro, ind: 56, ud: 62 });
                        KV.tekst(g, x0 - 34, LY2 - 22, "100 %", { fs: 14, farve: F.daempet });
                        KV.tekst(g, x1 + 34, LY2 - 22, v.pct, { fs: 14.5, fed: true });
                        KV.tekst(g, x1 + 10, LY2 + 34, v.A, { fs: 16, fed: true, farve: F.accent, anker: "start" });
                        KV.linje(g, x0, BUND2 + 6, x0, PIL + 8, F.daempet, 1.1);
                        KV.linje(g, x1, BUND2 + 6, x1, PIL + 8, F.daempet, 1.1);
                        B5.vDobbeltpil(g, x0 + 1, x1 - 1, PIL, B5.F.l, 1.8, 9);
                        var t = KV.tekst(g, x1 + 10, PIL + 5, "", { fs: 15, fed: true, anker: "start" });
                        var ts = SV.el("tspan", { "font-family": B5.FORMEL, "font-style": "italic", fill: B5.F.l }, t);
                        ts.textContent = "l";
                        var ts2 = SV.el("tspan", {}, t);
                        ts2.textContent = v.l.slice(1);
                    });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 2: Lambert-Beers lov --------------------------------------- */
            api.del("lov", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RD.x, RD.y, RD.b, RD.h);
                    var gg = SV.g(g);
                    dele.forEach(function (d, i) {
                        if (i === 2) return;                              /* ε tegnes af delen eps */
                        SV.tekst(gg, xs[i], FY, d[0], { "font-size": FS, "font-weight": 700, "font-style": /[Alc]/.test(d[0]) ? "italic" : "normal",
                            "font-family": B5.FORMEL, fill: d[1], "text-anchor": "start" });
                    });
                    KV.tekst(g, RD.x + RD.b / 2, 548, "permanganat ved 525 nm: ε = 2,45 · 10^{3} M^{−1} · cm^{−1}", { fs: 15, farve: F.daempet });
                    return { gg: gg };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.gg, 100, 500); }
            });

            api.del("eps", {
                lag: 1,
                fuld: function (g) {
                    var t = SV.tekst(g, EPS.x, FY, "ε", { "font-size": FS, "font-weight": 700, "font-style": "italic", "font-family": B5.FORMEL, fill: B5.F.eps, "text-anchor": "start" });
                    return { t: t };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 500); }
            });
        }
    };
}());

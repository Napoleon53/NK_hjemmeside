/* =====================================================================
   fig_sammenstoed.js - figuren til B1.2 Koncentration og sammenstød

   Hastighedsudtrykket v = k · [A]ˣ · [B]ʸ som i afsnittet. k, x og y
   staar lysegraa, til deres pladser er loest.
   Vinduerne med sammenstoed (bogens sammenstoed-koncentration) og fagordet
   sammenstoedsmodel er taget ud paa brugerens oenske 1. nov. 2026 ("Fjern
   hele delen med sammenstødsmodel"); se NK.UDELADT i data.js.
   Tre fagord i ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;

    var K = { x: 260, y: 70, b: 480, h: 240 };              /* kortet med formlen */

    /* Formlen: stykkerne placeres efter deres bredde, saa k, x og y kan
       tegnes for sig */
    var FS = 56, FY = K.y + 140, HAEV = 23, LILLE = 0.68;
    var W = function (s, fs) { return NK.tekstBredde(s, fs || FS, 400); };
    var FP = null;
    function formel() {
        var bv = W("v = "), bk = W("k"), bA = W(" · [A]"), bx = W("x", FS * LILLE), bB = W(" · [B]"), by = W("y", FS * LILLE);
        var x0 = K.x + K.b / 2 - (bv + bk + bA + bx + bB + by) / 2;
        return {
            v: x0, k: x0 + bv, A: x0 + bv + bk + W(" "), x: x0 + bv + bk + bA + 2,
            B: x0 + bv + bk + bA + bx + W(" ") + 2, y: x0 + bv + bk + bA + bx + bB + 4,
            bk: bk, bx: bx, by: by
        };
    }

    NK.FIGURER.sammenstoed = {
        vb: [1000, 360],
        lag: [
            { navn: "Hastighedsudtrykket", pladser: ["hastighedsudtryk", "hastighedskonstant", "eksponent"],
              ros: "Hastighedsudtrykket viser, hvordan farten afhænger af koncentrationerne. Eksponenterne x og y findes ved forsøg." }
        ],
        pladser: [
            { id: "hastighedsudtryk", ord: ["hastighedsudtryk"], x: K.x + K.b / 2, y: K.y, maal: [K.x + K.b / 2, K.y], titel: true, dele: ["formel"],
              omr: [{ r: [K.x - 5, K.y - 5, K.b + 10, K.h + 10, 18], tom: true }],
              fejl: { hastighedskonstant: "<b>hastighedskonstant</b> er kun tallet k. Overskriften gælder hele formlen.",
                      eksponent: "<b>eksponent</b> er kun de små tal x og y. Overskriften gælder hele formlen." } },
            { id: "hastighedskonstant", ord: ["hastighedskonstant"], x: 135, y: 262, maal: [0, 0], dele: ["k"],
              omr: [], fejl: { eksponent: "<b>eksponent</b> er et tal, som en koncentration er opløftet til. Pladsen peger på tallet k foran.",
                               hastighedsudtryk: "<b>hastighedsudtryk</b> er hele formlen. Pladsen peger kun på tallet k." } },
            { id: "eksponent", ord: ["eksponent"], x: 868, y: 150, maal: [0, 0], dele: ["eks"],
              omr: [], fejl: { hastighedskonstant: "<b>hastighedskonstant</b> er tallet k foran. Pladsen peger på de små tal oppe ved [A] og [B].",
                               hastighedsudtryk: "<b>hastighedsudtryk</b> er hele formlen. Pladsen peger kun på de små tal x og y." } }
        ],

        tegn: function (api) {
            KV.defs();
            /* Formlens stykker kan foerst maales nu, hvor siden er indlaest */
            FP = formel();
            var pk = this.pladser.filter(function (p) { return p.id === "hastighedskonstant"; })[0];
            var pe = this.pladser.filter(function (p) { return p.id === "eksponent"; })[0];
            var kx = FP.k + FP.bk / 2, ky = FY - FS * 0.34;
            pk.omr = [{ c: [kx, ky, 30] }];
            pk.maal = [kx - 23, ky + 19];
            var xx = FP.x + FP.bx / 2, yy = FP.y + FP.by / 2, ey = FY - HAEV - FS * LILLE * 0.3;
            pe.omr = [{ c: [xx, ey, 20] }, { c: [yy, ey, 20] }];
            pe.maal = [yy + 18, ey - 4];

            api.del("formel", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, K.x, K.y, K.b, K.h);
                    var gg = SV.g(g), lys = "#a3adb6";
                    var o = { "font-size": FS, "text-anchor": "start", fill: F.blaek };
                    SV.tekst(gg, FP.v, FY, "v =", Object.assign({}, o, { "font-style": "italic" }));
                    SV.tekst(gg, FP.k, FY, "k", Object.assign({}, o, { "font-style": "italic", fill: lys }));
                    SV.tekst(gg, FP.A, FY, "· [A]", o);
                    SV.tekst(gg, FP.x, FY - HAEV, "x", Object.assign({}, o, { "font-size": FS * LILLE, "font-style": "italic", fill: lys }));
                    SV.tekst(gg, FP.B, FY, "· [B]", o);
                    SV.tekst(gg, FP.y, FY - HAEV, "y", Object.assign({}, o, { "font-size": FS * LILLE, "font-style": "italic", fill: lys }));
                    KV.tekst(g, K.x + K.b / 2, FY + 60, "A og B er reaktanterne.", { fs: 15, farve: F.daempet });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 100, 500); }
            });

            api.del("k", {
                lag: 0,
                fuld: function (g) {
                    var t = SV.tekst(g, FP.k, FY, "k", { "font-size": FS, "text-anchor": "start", "font-style": "italic", "font-weight": 700, fill: F.accent });
                    return { t: t };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });

            api.del("eks", {
                lag: 0,
                fuld: function (g) {
                    var o = { "font-size": FS * LILLE, "text-anchor": "start", "font-style": "italic", "font-weight": 700, fill: F.serieB };
                    return { x: SV.tekst(g, FP.x, FY - HAEV, "x", o), y: SV.tekst(g, FP.y, FY - HAEV, "y", o) };
                },
                byg: function (g, r, an) { an.pop(r.x, 0, 450); an.pop(r.y, 150, 450); }
            });
        }
    };
}());

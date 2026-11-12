/* =====================================================================
   fig_aktivering.js - figuren til B1.3 Aktiveringsenergi

   Øverst bogens energiprofil for en exoterm reaktion med kuglemodellerne:
   A₂ og B₂, det aktiverede kompleks i et glimt på toppen og to AB.
   Dobbeltpilen fra reaktanterne op til toppen er aktiveringsenergien.
   Bogens tekster "aktiveringsenergi, Eₐ" og "aktiveret kompleks" er
   taget af; der staar kun Eₐ ved pilen.
   Nederst bogens energiprofil-exo-endo: to smaa profiler i hvert sit
   kort med en tyk pil for energiforskellen og et termometer. Kortenes
   titler er pladserne exoterm og endoterm.
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;

    var K1 = { x: 30, y: 40, b: 1040, h: 370 };
    var P = { xa: 340, xb: 1050, ya: 72, yb: 382 };                 /* akserne */
    var X0 = 360, X1 = 1010, YR = 280, YT = 140, YP = 340;          /* profilen */
    var XM = (X0 + X1) / 2;
    var XR = X0 + 30, XP = X1 - 34;                                  /* modellerne */
    var EA = 448;                                                    /* pilen for Eₐ */
    var KOMPLEKS = [XM, YT - 29];
    var KE = { x: 30, y: 450, b: 510, h: 250 }, KN = { x: 560, y: 450, b: 510, h: 250 };

    /* En lille energiprofil i et kort: exo (produkterne lavest) eller endo */
    function lilleProfil(g, K, exo) {
        KV.kort(g, K.x, K.y, K.b, K.h);
        var xa = K.x + 40, ya = K.y + 42, yb = K.y + 196;
        var x0 = K.x + 54, x1 = K.x + 300, yt = K.y + 70;
        var yr = exo ? K.y + 118 : K.y + 170, yp = exo ? K.y + 170 : K.y + 118;
        var farve = exo ? F.varm : F.kold;
        KV.flade(g, xa, ya + 6, x1 + 14, yb);
        KV.profil(g, x0, x1, yr, yt, yp, { bund: yb - 1, sw: 2.6 });
        KV.pil(g, xa, yb, xa, ya, F.daempet, 1.4, 10);
        KV.pil(g, xa, yb, x1 + 26, yb, F.daempet, 1.4, 10);
        var xp = x1 + 24;
        KV.linje(g, x0 + 58, yr, xp + 6, yr, F.daempet, 1.2, "4 4");
        SV.el("line", { x1: xp, y1: yr, x2: xp, y2: yp, stroke: farve, "stroke-width": 9, opacity: 0.18, "stroke-linecap": "round", filter: "url(#kv-blur)" }, g);
        KV.pil(g, xp, yr, xp, yp, farve, 3.2, 13);
        KV.tekst(g, x0 + 36, yr + 19, "reaktanter", { fs: 13.5, farve: F.daempet });
        KV.tekst(g, x1 - 32, yp + 19, "produkter", { fs: 13.5, farve: F.daempet });
        var tx = K.x + K.b - 56;
        KV.termometer(g, tx, K.y + 46, 136, exo ? 0.78 : 0.22, farve, exo ? "roed" : "blaa");
        var ym = (yr + yp) / 2;
        [-14, 14].forEach(function (dy) {
            if (exo) KV.boelge(g, xp + 12, ym + dy, tx - 16, ym + dy * 1.6, farve);
            else KV.boelge(g, tx - 16, ym + dy * 1.6, xp + 12, ym + dy, farve);
        });
        KV.tekst(g, K.x + K.b / 2, K.y + K.h - 18, exo ? "Omgivelserne bliver varmere." : "Omgivelserne bliver koldere.", { fs: 14.5 });
    }

    NK.FIGURER.aktivering = {
        vb: [1100, 720],
        lag: [
            { navn: "Bakken", pladser: ["energiprofil", "det aktiverede kompleks", "aktiveringsenergi"],
              ros: "Energiprofilen går over en bakke. Aktiveringsenergien er højden fra reaktanterne op til det aktiverede kompleks på toppen." },
            { navn: "Afgiver eller optager", pladser: ["exoterm", "endoterm"],
              ros: "Exoterm: Produkterne har mindst energi, og omgivelserne opvarmes. Endoterm: Produkterne har mest energi, og omgivelserne afkøles." }
        ],
        pladser: [
            { id: "energiprofil", ord: ["energiprofil"], x: K1.x + K1.b / 2, y: K1.y, maal: [K1.x + K1.b / 2, K1.y], titel: true, dele: ["profil"],
              omr: [{ r: [K1.x - 5, K1.y - 5, K1.b + 10, K1.h + 10, 18], tom: true }],
              fejl: { aktiveringsenergi: "<b>aktiveringsenergi</b> er kun bakkens højde fra reaktanterne. Overskriften gælder hele grafen.",
                      "det aktiverede kompleks": "<b>det aktiverede kompleks</b> er kun tilstanden på toppen. Overskriften gælder hele grafen.",
                      exoterm: "<b>exoterm</b> siger, at energi bliver afgivet. Overskriften er navnet på selve grafen med energi og reaktionens forløb.",
                      endoterm: "<b>endoterm</b> siger, at energi bliver optaget. Overskriften er navnet på selve grafen med energi og reaktionens forløb." } },
            { id: "det aktiverede kompleks", ord: ["det aktiverede kompleks"], x: 900, y: 104, maal: [KOMPLEKS[0] + 30, KOMPLEKS[1] - 4], dele: ["kompleks"],
              omr: [{ c: [KOMPLEKS[0], KOMPLEKS[1], 30] }],
              fejl: { aktiveringsenergi: "<b>aktiveringsenergi</b> er bakkens højde, pilen fra reaktanterne. Pladsen peger på molekylerne på toppen.",
                      energiprofil: "<b>energiprofil</b> er hele grafen. Pladsen peger kun på molekylerne på toppen af bakken.",
                      exoterm: "<b>exoterm</b> handler om reaktanter og produkter. Pladsen peger på molekylerne på toppen, hvor bindinger brydes og dannes." } },
            { id: "aktiveringsenergi", ord: ["aktiveringsenergi"], x: 172, y: 196, maal: [EA - 7, 196], dele: ["ea"],
              omr: [{ r: [EA - 12, YT - 4, 24, YR - YT + 8, 7] }],
              fejl: { "det aktiverede kompleks": "<b>det aktiverede kompleks</b> sidder på toppen. Pladsen peger på pilen fra reaktanterne op til toppen.",
                      energiprofil: "<b>energiprofil</b> er hele grafen. Pladsen peger kun på pilen fra reaktanterne op til toppen.",
                      exoterm: "<b>exoterm</b> handler om forskellen mellem reaktanter og produkter. Pilen her går fra reaktanterne op til toppen." } },

            { id: "exoterm", ord: ["exoterm"], x: KE.x + KE.b / 2, y: KE.y, maal: [KE.x + KE.b / 2, KE.y], titel: true, dele: ["exo"],
              omr: [{ r: [KE.x - 5, KE.y - 5, KE.b + 10, KE.h + 10, 18], tom: true }],
              fejl: { endoterm: "<b>endoterm</b> betyder, at produkterne har mere energi end reaktanterne. Her ligger produkterne lavest.",
                      energiprofil: "<b>energiprofil</b> er navnet på selve grafen. Overskriften siger, om reaktionen afgiver eller optager energi." } },
            { id: "endoterm", ord: ["endoterm"], x: KN.x + KN.b / 2, y: KN.y, maal: [KN.x + KN.b / 2, KN.y], titel: true, dele: ["endo"],
              omr: [{ r: [KN.x - 5, KN.y - 5, KN.b + 10, KN.h + 10, 18], tom: true }],
              fejl: { exoterm: "<b>exoterm</b> betyder, at produkterne har mindre energi end reaktanterne. Her ligger produkterne højest.",
                      energiprofil: "<b>energiprofil</b> er navnet på selve grafen. Overskriften siger, om reaktionen afgiver eller optager energi." } }
        ],

        tegn: function (api) {
            KV.defs();

            /* ----- Lag 1: energiprofilen ------------------------------------------ */
            api.del("profil", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, K1.x, K1.y, K1.b, K1.h);
                    KV.energiakser(g, P.xa, P.xb, P.ya, P.yb);
                    var k = KV.profil(g, X0, X1, YR, YT, YP, { bund: P.yb - 1 });
                    KV.linje(g, X0 + 56, YR, P.xb - 4, YR, F.daempet, 1.2, "4 4");
                    KV.linje(g, X1 + 4, YP, P.xb - 4, YP, F.daempet, 1.2, "4 4");
                    KV.reaktanter(g, XR, YR);
                    KV.produkter(g, XP, YP);
                    KV.tekst(g, XR, YR + 22, "reaktanter", { fs: 14.5, fed: true });
                    KV.tekst(g, XP, YP + 22, "produkter", { fs: 14.5, fed: true });
                    KV.pil(g, P.xb - 12, YR, P.xb - 12, YP, F.varm, 2, 11);
                    KV.tekst(g, P.xb - 4, YR - 10, "energi, der afgives", { fs: 14, fed: true, farve: F.varm, anker: "end" });
                    return { k: k };
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); an.streg(r.k, 100, 1000); }
            });

            api.del("kompleks", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.glimt(gg, KOMPLEKS[0], KOMPLEKS[1], 32);
                    KV.kompleks(gg, KOMPLEKS[0], KOMPLEKS[1]);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });

            api.del("ea", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.linje(gg, EA - 10, YT, XM - 30, YT, F.daempet, 1.2, "4 4");
                    KV.dobbeltpil(gg, EA, YT, YR, F.serieB, 2.2);
                    KV.tekst(gg, EA + 12, (YT + YR) / 2 + 5, "E_{a}", { fs: 17, fed: true, farve: F.serieB, anker: "start", halo: true });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            /* ----- Lag 2: exoterm og endoterm ---------------------------------------- */
            api.del("exo", {
                lag: 1,
                fuld: function (g) { lilleProfil(g, KE, true); return {}; },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
            api.del("endo", {
                lag: 1,
                fuld: function (g) { lilleProfil(g, KN, false); return {}; },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

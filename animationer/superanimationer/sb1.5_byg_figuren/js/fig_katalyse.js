/* =====================================================================
   fig_katalyse.js - figuren til B1.5 Katalysatorer og enzymer

   Øverst bogens enzym (substratet paa vej ned i lommen) og ved siden af
   et enzym, hvor en inhibitor sidder i lommen, saa substratet preller af.
   Nederst bogens enzym-temperatur med optimum og (Claudes tilfoejelse) et
   lille enzym, der foldes ud af varmen.
   Energidiagrammet med og uden katalysator er taget ud paa brugerens oenske
   1. nov. 2026 ("fjern energidiagrammet fra 1.5"), og med det fagordet
   katalysator; se NK.UDELADT i data.js.
   Seks fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;

    /* Enzymerne */
    var KE1 = { x: 30, y: 30, b: 520, h: 330 }, KE2 = { x: 570, y: 30, b: 500, h: 330 };
    var R = 62, E1 = { x: 190, y: KE1.y + 220 }, E2 = { x: 740, y: KE2.y + 220 };
    var L1 = KV.lomme(E1.x, E1.y, R, 0);
    var L2 = KV.lomme(E2.x, E2.y, R, 0.4);
    var SUB = [E1.x, KE1.y + 90];

    /* Enzymets aktivitet */
    var KT = { x: 300, y: 390, b: 500, h: 300 };
    var T = { xa: KT.x + 70, xb: KT.x + 470, ya: KT.y + 36, yb: KT.y + 230 };
    function akt(t) { return Math.pow(2, t / 10) / (1 + Math.exp((t - 46) / 2.6)); }
    var TOPT = 0, AMAX = 0;
    for (var i = 0; i <= 160; i++) { if (akt(i / 2) > AMAX) { AMAX = akt(i / 2); TOPT = i / 2; } }
    function TX(t) { return T.xa + (T.xb - T.xa) * t / 80; }
    function TY(a) { return T.yb - (T.yb - T.ya - 22) * a / AMAX; }
    var UD = { x: KT.x + 420, y: KT.y + 172 };                   /* enzymet, der foldes ud */

    NK.FIGURER.katalyse = {
        vb: [1100, 720],
        lag: [
            { navn: "Enzymet", pladser: ["enzym", "substrat", "aktivt center", "inhibitor"],
              ros: "Substratet passer i enzymets aktive center som en nøgle i en lås. En inhibitor blokerer det aktive center." },
            { navn: "Varmen", pladser: ["optimum", "denaturere"],
              ros: "Enzymet arbejder hurtigst ved sit optimum. Ved højere temperatur denaturerer enzymet og mister sin form." }
        ],
        pladser: [
            { id: "enzym", ord: ["enzym"], x: 420, y: KE1.y + 280, maal: [E1.x + R * 0.86, E1.y + R * 0.5], dele: ["enzym1"],
              omr: [{ c: [E1.x, E1.y + 4, R + 8] }],
              fejl: { "aktivt center": "<b>aktivt center</b> er kun fordybningen foroven. Pladsen peger på hele det store molekyle.",
                      substrat: "<b>substrat</b> er stoffet, der passer ned i fordybningen. Pladsen peger på det store molekyle.",
                      inhibitor: "<b>inhibitor</b> blokerer et enzym. Pladsen peger på det store molekyle, der selv får reaktionen til at gå hurtigere." } },
            { id: "substrat", ord: ["substrat"], x: 420, y: SUB[1], maal: [SUB[0] + KV.SD / 2 + KV.SR + 3, SUB[1]], dele: ["substrat"],
              omr: [{ c: [SUB[0], SUB[1], 34] }],
              fejl: { enzym: "<b>enzym</b> er det store molekyle. Pladsen peger på stoffet, der skal ned i fordybningen.",
                      "aktivt center": "<b>aktivt center</b> er fordybningen i enzymet. Pladsen peger på stoffet, der skal ned i den.",
                      inhibitor: "<b>inhibitor</b> blokerer fordybningen. Stoffet her passer ind og bliver spaltet." } },
            { id: "aktivt center", ord: ["aktivt center"], x: 420, y: KE1.y + 185, maal: [L1[0] + KV.SD / 2 + 12, L1[1] + 6], dele: ["lomme"],
              omr: [{ c: [L1[0], L1[1] + 2, 26] }],
              fejl: { substrat: "<b>substrat</b> er stoffet, der passer ind. Pladsen peger på selve fordybningen i enzymet.",
                      enzym: "<b>enzym</b> er hele det store molekyle. Pladsen peger kun på fordybningen foroven.",
                      inhibitor: "<b>inhibitor</b> er et stof, der sætter sig i fordybningen. Pladsen peger på selve fordybningen." } },
            { id: "inhibitor", ord: ["inhibitor"], x: 960, y: KE2.y + 140, maal: [L2[0] + KV.SD / 2 + KV.SR + 3, L2[1] - 4], dele: ["enzym2", "inhib"],
              omr: [{ c: [L2[0], L2[1] - 8, 34] }],
              fejl: { substrat: "<b>substrat</b> er stoffet, enzymet arbejder på. Det grå stof sidder fast i fordybningen, så substratet ikke kan komme ind.",
                      "aktivt center": "<b>aktivt center</b> er selve fordybningen. Pladsen peger på det grå stof, der sidder i den.",
                      enzym: "<b>enzym</b> er det store molekyle. Pladsen peger på det grå stof, der sidder fast i fordybningen." } },

            { id: "optimum", ord: ["optimum"], x: KT.x + 145, y: KT.y + 52, maal: [TX(TOPT) - 9, TY(AMAX)], dele: ["graf"],
              omr: [{ c: [TX(TOPT), TY(AMAX), 15] }],
              fejl: { denaturere: "<b>denaturere</b> er det, der sker med et enzym ved for høj temperatur. Pladsen peger på toppen, hvor enzymet arbejder hurtigst.",
                      inhibitor: "<b>inhibitor</b> er et stof. Pladsen peger på en temperatur, toppen af kurven." } },
            { id: "denaturere", ord: ["denaturere"], x: UD.x, y: KT.y + 100, maal: [UD.x + 22, UD.y - 28], dele: ["udfoldet"],
              omr: [{ r: [UD.x - 64, UD.y - 32, 124, 62, 10] }],
              fejl: { optimum: "<b>optimum</b> er toppen, hvor enzymet arbejder hurtigst. Pladsen peger på enzymet, der har mistet sin form.",
                      inhibitor: "<b>inhibitor</b> er et stof, der blokerer enzymet. Her har varmen foldet selve enzymet ud." } }
        ],

        tegn: function (api) {
            KV.defs();

            /* ----- Lag 1: enzymet, substratet og inhibitoren -------------------------- */
            api.del("enzym1", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, KE1.x, KE1.y, KE1.b, KE1.h);
                    var e = KV.enzym(g, E1.x, E1.y, R);
                    KV.tekst(g, E1.x, KE1.y + KE1.h - 20, "Substratet passer som en nøgle i en lås.", { fs: 14.5 });
                    return { e: e.g };
                },
                byg: function (g, r, an) { an.pop(r.e, 0, 500); }
            });

            api.del("lomme", {
                lag: 0,
                fuld: function (g) {
                    /* Lommens bund, tegnet tydeligt op */
                    var gg = SV.g(g), rl = KV.SR + 2.2;
                    [-1, 1].forEach(function (s) {
                        var cx = L1[0] + s * KV.SD / 2;
                        SV.el("path", { d: "M" + (cx - rl) + "," + L1[1] + " A" + rl + " " + rl + " 0 0 0 " + (cx + rl) + "," + L1[1],
                            fill: "none", stroke: "#0b524c", "stroke-width": 3, "stroke-linecap": "round" }, gg);
                    });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.fade(r.g, 0, 500); }
            });

            api.del("substrat", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    KV.substrat(gg, SUB[0], SUB[1]);
                    KV.pil(gg, SUB[0], SUB[1] + 20, SUB[0], L1[1] - KV.SR - 8, F.daempet, 1.6, 9);
                    return { g: gg };
                },
                byg: function (g, r, an) { an.glid(r.g, 0, -30, 0, 600); }
            });

            api.del("enzym2", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, KE2.x, KE2.y, KE2.b, KE2.h);
                    KV.enzym(g, E2.x, E2.y, R, { fro: 0.4 });
                    /* Substratet preller af til siden */
                    var sx = E2.x - 112, sy = KE2.y + 102;
                    KV.fart(g, sx - KV.SD / 2, sy, 215, KV.SR, "#b8661f", 14, 0.55);
                    KV.fart(g, sx + KV.SD / 2, sy, 215, KV.SR, "#6d3fa3", 14, 0.55);
                    KV.substrat(g, sx, sy);
                    KV.tekst(g, E2.x, KE2.y + KE2.h - 20, "Fordybningen er optaget.", { fs: 14.5 });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            api.del("inhib", {
                lag: 0,
                fuld: function (g) { return { i: KV.inhibitor(g, L2[0], L2[1]) }; },
                byg: function (g, r, an) { an.glid(r.i, 0, -24, 200, 600); }
            });

            /* ----- Lag 2: enzymets aktivitet og temperaturen -------------------------- */
            api.del("graf", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, KT.x, KT.y, KT.b, KT.h);
                    KV.flade(g, T.xa, T.ya + 8, T.xb + 8, T.yb);
                    KV.pil(g, T.xa, T.yb, T.xa, T.ya, F.daempet, 1.5, 11);
                    KV.linje(g, T.xa, T.yb, T.xb + 8, T.yb, F.daempet, 1.3);
                    for (var t = 0; t <= 80; t += 10) {
                        KV.linje(g, TX(t), T.yb, TX(t), T.yb + 5, F.daempet, 1.2);
                        KV.tekst(g, TX(t), T.yb + 21, String(t), { fs: 13, farve: F.daempet });
                    }
                    KV.tekst(g, (T.xa + T.xb) / 2, T.yb + 44, "temperatur i °C", { fs: 13.5, farve: F.daempet });
                    var ym = (T.ya + T.yb) / 2;
                    KV.tekst(g, T.xa - 16, ym, "aktivitet", { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + (T.xa - 16) + " " + ym + ")" });
                    KV.linje(g, TX(TOPT), TY(AMAX), TX(TOPT), T.yb, F.daempet, 1.2, "4 4");
                    var pk = [];
                    for (var k = 0; k <= 160; k++) pk.push([TX(k / 2), TY(akt(k / 2))]);
                    var kurve = KV.kurve(g, pk, F.accent, 2.6);
                    KV.punkt(g, TX(TOPT), TY(AMAX), "a", 5);
                    KV.tekst(g, TX(15), TY(AMAX * 0.42), "hastigheden stiger", { fs: 13.5, fed: true, halo: true });
                    KV.tekst(g, TX(15), TY(AMAX * 0.42) + 18, "med temperaturen", { fs: 13.5, fed: true, halo: true });
                    return { k: kurve };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.k, 100, 900); }
            });

            api.del("udfoldet", {
                lag: 1,
                fuld: function (g) {
                    /* Et lille, foldet enzym, en pil og den udfoldede kaede */
                    var gg = SV.g(g);
                    SV.el("ellipse", { cx: UD.x - 42, cy: UD.y + 17, rx: 14, ry: 2.5, fill: "rgba(40,55,65,0.16)" }, gg);
                    SV.el("circle", { cx: UD.x - 42, cy: UD.y, r: 15, fill: "url(#kv-enzym)", stroke: F.accent, "stroke-width": 1.6 }, gg);
                    SV.el("path", { d: "M" + (UD.x - 50) + "," + (UD.y + 4) + " q 5,-12 9,-2 q 4,9 8,-4", fill: "none", stroke: "#3f9488", "stroke-width": 1.3, opacity: 0.6 }, gg);
                    KV.pil(gg, UD.x - 22, UD.y, UD.x - 6, UD.y, F.daempet, 1.6, 8);
                    var u = KV.udfoldet(gg, UD.x + 27, UD.y, 56);
                    return { g: gg, u: u };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 500); }
            });
        }
    };
}());

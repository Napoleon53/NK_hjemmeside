/* =====================================================================
   fig_titrering.js - figuren til 7.5 Syre/base-titrering

   Øverst bogens titrerkurve for 2,00 g eddike, der titreres med 0,100 M
   natriumhydroxid (regnet med samme formel som titrer_ph i bogens
   vaerktoej/lav_figurer.py), med det lyserøde bånd, hvor indikatoren
   skifter farve, og punktet ved 17,0 mL. Teksten om phenolphthalein i
   båndet og ordet ækvivalenspunkt er taget af, så de ikke afslører
   pladserne.
   Nederst tre kolber som bogens figur eddike-titrering-trin (Før, Under
   og Én dråbe mere) og en dråbeflaske uden navn. Under hver kolbe står
   kort, hvad man ser, og i grafen står der, at indikatoren skifter farve
   i det lyserøde bånd (tilføjet 1. nov. 2026).
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    var G = { x: 30, y: 44, b: 690, h: 340 };            /* rammen om grafen */
    var XA = 104, XB = 690, YA = 72, YB = 316;           /* plotområdet */
    function X(v) { return XA + (XB - XA) * v / 25; }
    function Y(p) { return YB - (YB - YA) * p / 14; }

    var KX = [160, 340, 515], KB = 568, KH = 104;        /* kolberne */
    var DF = { x: 616, y: 482, b: 36, h: 72 };           /* dråbeflasken */
    var SX = 852;                                        /* pladserne til højre */

    /* pH i kolben, når der er tilsat v mL natriumhydroxid (bogens titrer_ph) */
    function titrerPh(vml) {
        var nSyre = 1.70e-3, v0 = 0.022, cBase = 0.100, ka = 1.75e-5;
        var v = v0 + vml / 1000, ca = nSyre / v, na = cBase * vml / 1000 / v;
        function f(ph) { var h = Math.pow(10, -ph); return h + na - 1e-14 / h - ca * ka / (ka + h); }
        var lav = 0, hoej = 14;
        for (var i = 0; i < 60; i++) {
            var m = (lav + hoej) / 2;
            if (f(m) > 0) lav = m; else hoej = m;
        }
        return (lav + hoej) / 2;
    }
    var PE = titrerPh(17.0);

    NK.FIGURER.titrering = {
        vb: [1000, 640],
        lag: [
            { navn: "Kurven", pladser: ["titrerkurve", "ækvivalenspunkt"],
              ros: "Titrerkurven viser pH i kolben. Ved ækvivalenspunktet efter 17,0 mL springer pH flere enheder." },
            { navn: "Farven", pladser: ["phenolphthalein", "omslag"],
              ros: "Phenolphthalein er farveløs i syren. Ved omslaget gør én dråbe mere opløsningen svagt lyserød." }
        ],
        pladser: [
            { id: "titrerkurve", ord: ["titrerkurve"], x: G.x + G.b / 2, y: G.y, maal: [G.x + G.b / 2, G.y], titel: true, dele: ["graf"],
              omr: [{ r: [G.x - 6, G.y - 6, G.b + 12, G.h + 12, 18], tom: true }],
              fejl: { "ækvivalenspunkt": "<b>ækvivalenspunkt</b> er ét punkt på kurven. Overskriften gælder hele grafen med pH og volumen.",
                      omslag: "<b>omslag</b> er farveskiftet i kolben. Overskriften gælder hele grafen med pH og volumen." } },
            { id: "ækvivalenspunkt", ord: ["ækvivalenspunkt"], x: SX, y: Y(PE), maal: [X(17) + 10, Y(PE)], dele: ["aekv"],
              omr: [{ c: [X(17), Y(PE), 14] }],
              fejl: { omslag: "<b>omslag</b> er farveskiftet, man ser i kolben. Pladsen peger på punktet på kurven, hvor pH springer.",
                      titrerkurve: "<b>titrerkurve</b> er hele grafen. Pladsen peger kun på punktet, hvor pH springer." } },

            { id: "phenolphthalein", ord: ["phenolphthalein"], x: SX, y: DF.y + 22, maal: [DF.x + DF.b + 8, DF.y + 22], dele: ["draabe"],
              omr: [{ r: [DF.x - 6, DF.y - 24, DF.b + 12, DF.h + 30, 8] }],
              fejl: { omslag: "<b>omslag</b> er selve farveskiftet. Pladsen peger på flasken med stoffet, der skifter farve.",
                      "ækvivalenspunkt": "<b>ækvivalenspunkt</b> er punktet på kurven. Pladsen peger på flasken med stoffet, der skifter farve." } },
            { id: "omslag", ord: ["omslag"], x: SX, y: 596, maal: [KX[2] + 50, KB - 22], dele: ["lyseroed"],
              omr: [{ r: [KX[2] - 56, KB - KH - 8, 112, KH + 16, 10] }],
              fejl: { "ækvivalenspunkt": "<b>ækvivalenspunkt</b> er punktet på kurven, hvor pH springer. Pladsen peger på kolben, hvor én dråbe mere har gjort opløsningen lyserød.",
                      phenolphthalein: "<b>phenolphthalein</b> er stoffet i flasken. Pladsen peger på selve farveskiftet i kolben." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: grafen ---------------------------------------------------- */
            api.del("graf", {
                lag: 0,
                fuld: function (g) {
                    var r = LAB.ramme(g, G.x, G.y, G.b, G.h, { fyld: "#fbfcfd", kant: "#a9c9c2" });
                    SV.el("rect", { x: XA, y: Y(10), width: XB - XA, height: Y(8.2) - Y(10), fill: "#fce4ef" }, g);
                    SV.tekst(g, XA + 12, (Y(10) + Y(8.2)) / 2 + 5, "her skifter indikatoren farve", { "font-size": 13, "font-weight": 700, fill: "#a8406a", "text-anchor": "start" });
                    for (var p = 0; p <= 14; p += 2) {
                        SV.el("line", { x1: XA, y1: Y(p), x2: XB, y2: Y(p), stroke: "#e3e8ec", "stroke-width": 1 }, g);
                        SV.tekst(g, XA - 10, Y(p) + 5, String(p), { "font-size": 14, fill: F.svag, "text-anchor": "end" });
                    }
                    SV.el("line", { x1: XA, y1: YB, x2: XB, y2: YB, stroke: F.svag, "stroke-width": 1.4 }, g);
                    for (var v = 0; v <= 25; v += 5) {
                        SV.el("line", { x1: X(v), y1: YB, x2: X(v), y2: YB + 6, stroke: F.svag, "stroke-width": 1.2 }, g);
                        SV.tekst(g, X(v), YB + 22, String(v), { "font-size": 14, fill: F.svag });
                    }
                    SV.tekst(g, (XA + XB) / 2, YB + 50, "V(NaOH, 0,100 M) i mL", { "font-size": 15, fill: F.svag });
                    SV.tekst(g, 54, (YA + YB) / 2, "pH i kolben", { "font-size": 15, fill: F.svag, transform: "rotate(-90 54 " + (YA + YB) / 2 + ")" });
                    var pkt = [];
                    for (var vv = 0; vv <= 25.0001; vv += (vv > 16 && vv < 18) ? 0.05 : 0.25) pkt.push(X(vv).toFixed(1) + "," + Y(titrerPh(vv)).toFixed(1));
                    var kurve = SV.el("polyline", { points: pkt.join(" "), fill: "none", stroke: "#0f766e", "stroke-width": 3, "stroke-linejoin": "round" }, g);
                    SV.el("circle", { cx: X(0), cy: Y(titrerPh(0)), r: 5, fill: "#0f766e", stroke: "#ffffff", "stroke-width": 2 }, g);
                    SV.tekst(g, X(0) + 14, Y(titrerPh(0)) + 22, "kun eddikesyre: pH 2,9", { "font-size": 14, "font-weight": 700, "text-anchor": "start" });
                    SV.tekst(g, X(22), Y(titrerPh(22)) - 14, "overskud af hydroxid", { "font-size": 14, "font-weight": 700 });
                    return { r: r, k: kurve };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 700); an.streg(r.k, 200, 1200); }
            });

            api.del("aekv", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    SV.el("line", { x1: X(17), y1: Y(PE), x2: X(17), y2: YB, stroke: F.svag, "stroke-width": 1.3, "stroke-dasharray": "4 4" }, gg);
                    SV.el("circle", { cx: X(17), cy: Y(PE), r: 6.5, fill: "#0f766e", stroke: "#ffffff", "stroke-width": 2.2 }, gg);
                    SV.tekst(gg, X(17) - 8, YB - 10, "17,0 mL", { "font-size": 14, "font-weight": 700, "text-anchor": "end" });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: kolberne og dråbeflasken ------------------------------- */
            function kolbe(g, i, titel, fyld, under) {
                SV.tekst(g, KX[i], KB - KH - 22, titel, { "font-size": 16, "font-weight": 700 });
                SV.tekst(g, KX[i], KB + 28, under, { "font-size": 13, fill: F.svag });
                SV.el("ellipse", { cx: KX[i], cy: KB + 3, rx: 54, ry: 5, fill: "rgba(60,70,80,0.15)" }, g);
                return LAB.erlenmeyer(g, KX[i], KB, KH, { fyld: fyld, niveau: 0.4, magnet: true });
            }

            api.del("kolber", {
                lag: 1, auto: true,
                fuld: function (g) {
                    kolbe(g, 0, "Før", "#eef4f8", "eddikesyre og indikator");
                    kolbe(g, 1, "Under", "#eef4f8", "farven forsvinder igen");
                    /* En lyserød sky, hvor dråben rammer, og som forsvinder igen */
                    SV.el("ellipse", { cx: KX[1] + 4, cy: KB - KH * 0.4 + 8, rx: 16, ry: 6, fill: "#f6b3cf", opacity: 0.8 }, g);
                    SV.el("path", { d: "M" + KX[1] + "," + (KB - KH - 8) + " q -3,5 0,8 q 3,-3 0,-8 Z", fill: "#e2eaf0", stroke: "#7d8a91", "stroke-width": 0.9 }, g);
                }
            });

            api.del("draabe", {
                lag: 1,
                fuld: function (g) { return { f: LAB.draabeflaske(g, DF.x, DF.y, DF.b, DF.h, "") }; },
                byg: function (g, r, an) { an.pop(r.f, 0, 450); }
            });

            api.del("lyseroed", {
                lag: 1,
                fuld: function (g) { return { k: kolbe(g, 2, "Én dråbe mere", "#f6c2d7", "al syren er brugt").g }; },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });
        }
    };
}());

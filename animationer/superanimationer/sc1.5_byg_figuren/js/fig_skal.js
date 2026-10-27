/* =====================================================================
   fig_skal.js - figuren til 1.3 Elektronskaller og det periodiske system

   Oeverst: chloratomet efter skalmodellen som i bogens figur
   (2, 8, 7) og argonatomet med 8 elektroner i yderste skal (reglen,
   som har to navne). Nederst: det periodiske system med en periode,
   en hovedgruppe, undergrupperne og tre familier.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var CL = { x: 190, y: 200 };
    var CLK = { x: 40, y: 70, b: 300, h: 262 };
    var CL_R = [40, 72, 104];
    var AR = { x: 688, y: 200 };
    var ARK = { x: 600, y: 70, b: 390, h: 262 };
    var AR_R = [28, 52, 76];
    var PILLE = { x: 452, y: 182 };
    var PS = new NK.PS.Gitter({ x: 268, y: 440, b: 36, h: 32, mx: 2, my: 2, skrift: 13 });

    /* Elektronerne parvis paa fire sider, som i bogen */
    function skalPos(c, r, n) {
        var sider = [270, 0, 90, 180];
        var pos = [];
        for (var i = 0; i < n; i++) {
            var side = sider[i % 4];
            var par = Math.floor(i / 4);
            var v = n === 2 ? (i === 0 ? 270 : 90) : side + (par === 0 ? -9 : 9) * (n > 4 ? 1 : 0);
            pos.push({ x: c.x + r * Math.cos(v * Math.PI / 180), y: c.y + r * Math.sin(v * Math.PI / 180) });
        }
        return pos;
    }

    /* For 7: tre par og en enlig (forneden) */
    function skal7(c, r) {
        var v = [261, 279, -9, 9, 171, 189, 90];
        return v.map(function (a) { return { x: c.x + r * Math.cos(a * Math.PI / 180), y: c.y + r * Math.sin(a * Math.PI / 180) }; });
    }

    var CL_E = [skalPos(CL, CL_R[0], 2), skalPos(CL, CL_R[1], 8), skal7(CL, CL_R[2])];
    var AR_E = [skalPos(AR, AR_R[0], 2), skalPos(AR, AR_R[1], 8), skalPos(AR, AR_R[2], 8)];

    function paaRing(c, r, v) { return [c.x + r * Math.cos(v * Math.PI / 180), c.y + r * Math.sin(v * Math.PI / 180)]; }

    function kerne(g, c, tekst, r) {
        return SV.kugle(g, c.x, c.y, r, "proton", tekst);
    }

    function baand(g, x, y, b, h, spoeg, fyld, kant) {
        return SV.el("rect", { x: x - 3, y: y - 3, width: b + 6, height: h + 6, rx: 7,
            fill: spoeg ? "none" : fyld, stroke: spoeg ? F.spoeg : kant, "stroke-width": spoeg ? 1.8 : 2.4,
            "stroke-dasharray": spoeg ? "6 4" : null }, g);
    }

    function kolBaand(g, kol, r1, r2, spoeg, fyld, kant) {
        return baand(g, PS.x(kol), PS.y(r1), PS.o.b, PS.bund(r2) - PS.y(r1), spoeg, fyld, kant);
    }

    NK.FIGURER.skal = {
        vb: [1000, 740],
        lag: [
            { navn: "Skalmodellen", pladser: ["skalmodel", "skal", "valenselektroner", "elektronstruktur"],
              ros: "Chlor har 17 elektroner fordelt i tre skaller: 2, 8 og 7." },
            { navn: "Perioder og grupper", pladser: ["periode", "hovedgruppe", "undergruppe"], ekstra: ["ædelgasser"],
              ros: "Chlor står i periode 3, fordi atomet har tre skaller." },
            { navn: "Familier og reglen", pladser: ["alkalimetaller", "halogener", "ædelgasser", "regel1", "regel2"],
              ros: "Argon har 8 elektroner i yderste skal ligesom de andre ædelgasser, og det er en særlig stabil elektronstruktur." }
        ],
        pladser: [
            { id: "skalmodel", ord: ["skalmodel"], x: CL.x, y: CLK.y, maal: [CL.x, CLK.y + 22], halo: 11, dele: ["model"],
              fejl: { skal: "<b>skal</b> er ét af lagene. Pladsen øverst gælder hele tegningen af atomet." } },
            { id: "skal", ord: ["skal"], x: 150, y: 368, maal: paaRing(CL, CL_R[1], 135), halo: 13, dele: ["skal"],
              fejl: { skalmodel: "<b>skalmodel</b> er hele tegningen. Pladsen peger på én af ringene.",
                      valenselektroner: "<b>valenselektroner</b> er elektronerne i yderste skal. Pladsen peger på den midterste ring." } },
            { id: "valenselektroner", ord: ["valenselektroner"], x: PILLE.x, y: 262, maal: [CL_E[2][3].x, CL_E[2][3].y], halo: 13, dele: ["valens"],
              fejl: { skal: "<b>skal</b> er selve laget. Pladsen peger på en elektron i det yderste lag." } },
            { id: "elektronstruktur", ord: ["elektronstruktur"], x: PILLE.x, y: 112, maal: [PILLE.x, PILLE.y - 18], halo: 11, dele: ["struktur"] },

            { id: "periode", ord: ["periode"], x: 140, y: PS.cy(3), maal: [PS.x(1) - 3, PS.cy(3)], halo: 12, dele: ["periode"],
              fejl: { hovedgruppe: "<b>hovedgruppe</b> er en lodret kolonne. Det stiplede bånd ved pladsen er en vandret række.",
                      skal: "<b>skal</b> er et lag i atomet. Pladsen peger på en vandret række i det periodiske system." } },
            { id: "hovedgruppe", ord: ["hovedgruppe"], x: 330, y: 410, maal: [PS.cx(2), PS.y(2) - 3], halo: 12, dele: ["hoved"],
              fejl: { periode: "<b>periode</b> er en vandret række. Det stiplede bånd ved pladsen er en lodret kolonne.",
                      undergruppe: "<b>undergruppe</b> står midt i det periodiske system. Kolonnen ved pladsen står yderst til venstre." } },
            { id: "undergruppe", ord: ["undergruppe"], x: 536, y: 506, maal: [536, PS.y(4) - 3], halo: 12, dele: ["under"],
              fejl: { hovedgruppe: "<b>hovedgruppe</b> passer ikke på blokken midt i det periodiske system. Der står kun metaller, og nummeret siger ikke noget om yderste skal." } },

            { id: "alkalimetaller", ord: ["alkalimetaller"], x: 140, y: 712, maal: [PS.cx(1), PS.bund(7) + 3], halo: 12, dele: ["alkali"],
              fejl: { halogener: "<b>halogener</b> står i hovedgruppe 7. Kolonnen ved pladsen er hovedgruppe 1.",
                      "ædelgasser": "<b>ædelgasser</b> står i hovedgruppe 8. Kolonnen ved pladsen er hovedgruppe 1." } },
            { id: "halogener", ord: ["halogener"], x: 850, y: 712, maal: [PS.cx(17), PS.bund(7) + 3], halo: 12, dele: ["halogen"],
              fejl: { "ædelgasser": "<b>ædelgasser</b> står i hovedgruppe 8, den sidste kolonne. Kolonnen ved pladsen er hovedgruppe 7.",
                      alkalimetaller: "<b>alkalimetaller</b> står i hovedgruppe 1. Kolonnen ved pladsen er hovedgruppe 7." } },
            { id: "ædelgasser", ord: ["ædelgasser"], x: 860, y: 410, maal: [PS.cx(18), PS.y(1) - 3], halo: 12, dele: ["aedel"],
              fejl: { halogener: "<b>halogener</b> står i hovedgruppe 7. Kolonnen ved pladsen er den sidste, hovedgruppe 8.",
                      "ædelgasreglen": "<b>ædelgasreglen</b> er en regel. Pladsen peger på en kolonne af grundstoffer.",
                      oktetreglen: "<b>oktetreglen</b> er en regel. Pladsen peger på en kolonne af grundstoffer." } },
            { id: "regel1", ord: ["ædelgasreglen", "oktetreglen"], x: 880, y: 158, maal: paaRing(AR, AR_R[2], -28), halo: 10, dele: ["regel"],
              fejl: { "ædelgasser": "<b>ædelgasser</b> er en familie af grundstoffer. De to pladser ved argon er navnene på en regel." } },
            { id: "regel2", ord: ["ædelgasreglen", "oktetreglen"], x: 880, y: 242, maal: paaRing(AR, AR_R[2], 28), halo: 10, dele: ["otte"],
              fejl: { "ædelgasser": "<b>ædelgasser</b> er en familie af grundstoffer. De to pladser ved argon er navnene på en regel." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: chloratomet ------------------------------------- */
            api.del("clkort", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: CLK.x, y: CLK.y, width: CLK.b, height: CLK.h, rx: 14, fill: "#f6f9fb", stroke: "#d4dbe2", "stroke-width": 1.5 }, g);
                    SV.tekst(g, CLK.x + 16, CLK.y + CLK.h - 14, "chlor, Cl", { "font-size": 14, fill: F.mat, "font-style": "italic", "text-anchor": "start" });
                }
            });

            api.del("model", {
                lag: 0,
                spoeg: function (g) {
                    CL_R.forEach(function (r) { SV.el("circle", { cx: CL.x, cy: CL.y, r: r, fill: "none", stroke: F.spoeg, "stroke-width": 1.5, "stroke-dasharray": "5 4" }, g); });
                    SV.spoegKugle(g, CL.x, CL.y, 19);
                },
                fuld: function (g) {
                    var ringe = CL_R.map(function (r) { return SV.el("circle", { cx: CL.x, cy: CL.y, r: r, fill: "none", stroke: F.teal, "stroke-width": 1.6 }, g); });
                    var k = kerne(g, CL, "17+", 19);
                    return { ringe: ringe, k: k };
                },
                byg: function (g, r, an) {
                    an.pop(r.k, 0);
                    r.ringe.forEach(function (ring, i) { an.streg(ring, 150 + i * 180, 600); });
                }
            });

            api.del("skal", {
                lag: 0,
                spoeg: function (g) { CL_E[0].concat(CL_E[1]).forEach(function (p) { SV.spoegKugle(g, p.x, p.y, 7); }); },
                fuld: function (g) {
                    var glod = SV.el("circle", { cx: CL.x, cy: CL.y, r: CL_R[1], fill: "none", stroke: "#7fb8e8", "stroke-width": 7, "stroke-opacity": 0.35 }, g);
                    var e = CL_E[0].concat(CL_E[1]).map(function (p) { return SV.kugle(g, p.x, p.y, 7.5, "elektron"); });
                    return { e: e, glod: glod };
                },
                byg: function (g, r, an) {
                    an.streg(r.glod, 0, 700);
                    r.e.forEach(function (k, i) { an.pop(k, 100 + i * 70, 300); });
                }
            });

            api.del("valens", {
                lag: 0,
                spoeg: function (g) { CL_E[2].forEach(function (p) { SV.spoegKugle(g, p.x, p.y, 7); }); },
                fuld: function (g) {
                    var e = CL_E[2].map(function (p) { return SV.kugle(g, p.x, p.y, 8, "valens"); });
                    return { e: e };
                },
                byg: function (g, r, an) { r.e.forEach(function (k, i) { an.pop(k, i * 130, 360); }); }
            });

            api.del("struktur", {
                lag: 0,
                spoeg: function (g) { pille(g, true); },
                fuld: function (g) { return pille(g, false); },
                byg: function (g, r, an) { an.pop(r.g, 0, 520); }
            });

            /* ----- Lag 2: det periodiske system ------------------------------ */
            api.del("tabel", {
                lag: 1, auto: true,
                fuld: function (g) {
                    var felter = PS.tegn(g, function (f) {
                        var under = f.kol >= 3 && f.kol <= 12;
                        return { fill: under ? "#f1f3f5" : "#ffffff", stroke: "#cfd6dd", tekst: under ? "#7b858f" : F.tekst };
                    });
                    /* Chlor er fremhaevet: det er atomet ovenover */
                    var cl = PS.felt("Cl");
                    SV.el("rect", { x: PS.x(cl.kol) - 1, y: PS.y(cl.raekke) - 1, width: PS.o.b + 2, height: PS.o.h + 2, rx: 5, fill: "none", stroke: F.teal, "stroke-width": 2.4 }, g);
                    return { felter: felter };
                },
                byg: function (g, r, an) { r.felter.forEach(function (f) { an.pop(f.g, (f.f.kol + f.f.raekke) * 22, 260); }); }
            });

            api.del("periode", {
                lag: 1,
                spoeg: function (g) { baand(g, PS.x(1), PS.y(3), PS.hoejre(18) - PS.x(1), PS.o.h, true); },
                fuld: function (g) {
                    var b = baand(g, PS.x(1), PS.y(3), PS.hoejre(18) - PS.x(1), PS.o.h, false, "rgba(61,158,224,0.16)", "#3d86c6");
                    var t = SV.tekst(g, PS.hoejre(18) + 16, PS.cy(3) + 5, "3", { "font-size": 15, "font-weight": 700, fill: "#3d86c6" });
                    return { b: b, t: t };
                },
                byg: function (g, r, an) { an.streg(r.b, 0, 700); an.pop(r.t, 400); }
            });

            api.del("hoved", {
                lag: 1,
                spoeg: function (g) { kolBaand(g, 2, 2, 7, true); },
                fuld: function (g) {
                    var b = kolBaand(g, 2, 2, 7, false, "rgba(155,107,214,0.14)", "#8a5cc8");
                    var t = SV.tekst(g, PS.cx(2), PS.bund(7) + 20, "2", { "font-size": 15, "font-weight": 700, fill: "#8a5cc8" });
                    return { b: b, t: t };
                },
                byg: function (g, r, an) { an.streg(r.b, 0, 700); an.pop(r.t, 400); }
            });

            api.del("under", {
                lag: 1,
                spoeg: function (g) { baand(g, PS.x(3), PS.y(4), PS.hoejre(12) - PS.x(3), PS.bund(7) - PS.y(4), true); },
                fuld: function (g) {
                    var b = baand(g, PS.x(3), PS.y(4), PS.hoejre(12) - PS.x(3), PS.bund(7) - PS.y(4), false, "rgba(120,130,145,0.14)", "#7d8894");
                    return { b: b };
                },
                byg: function (g, r, an) { an.streg(r.b, 0, 900); }
            });

            /* ----- Lag 3: familierne og reglen ------------------------------ */
            [["alkali", 1, 2, "#f7c59f", "#d9884a"], ["halogen", 17, 2, "#dcef9c", "#86b23a"], ["aedel", 18, 1, "#ddd3f6", "#8e78cf"]].forEach(function (d) {
                api.del(d[0], {
                    lag: 2,
                    spoeg: function (g) { kolBaand(g, d[1], d[2], 7, true); },
                    fuld: function (g) {
                        var felter = PS.tegn(g, function () { return { fill: d[3], stroke: d[4], tekst: F.tekst }; },
                            function (f) { return f.kol === d[1] && f.raekke >= d[2]; });
                        return { felter: felter };
                    },
                    byg: function (g, r, an) { r.felter.forEach(function (f) { an.pop(f.g, f.f.raekke * 70, 320); }); }
                });
            });

            api.del("arkort", {
                lag: 2, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: ARK.x, y: ARK.y, width: ARK.b, height: ARK.h, rx: 14, fill: "#f6f9fb", stroke: "#d4dbe2", "stroke-width": 1.5 }, g);
                    AR_R.forEach(function (r) { SV.el("circle", { cx: AR.x, cy: AR.y, r: r, fill: "none", stroke: F.teal, "stroke-width": 1.4 }, g); });
                    kerne(g, AR, "18+", 16);
                    AR_E[0].concat(AR_E[1]).forEach(function (p) { SV.kugle(g, p.x, p.y, 6.5, "elektron"); });
                    SV.tekst(g, AR.x, ARK.y + ARK.h - 14, "argon, Ar (2, 8, 8)", { "font-size": 14, fill: F.mat, "font-style": "italic" });
                }
            });

            api.del("regel", {
                lag: 2,
                spoeg: function (g) { AR_E[2].forEach(function (p) { SV.spoegKugle(g, p.x, p.y, 6.5); }); },
                fuld: function (g) {
                    var e = AR_E[2].map(function (p) { return SV.kugle(g, p.x, p.y, 7.5, "valens"); });
                    return { e: e };
                },
                byg: function (g, r, an) { r.e.forEach(function (k, i) { an.pop(k, i * 110, 330); }); }
            });

            api.del("otte", {
                lag: 2,
                fuld: function (g) {
                    var glod = SV.el("circle", { cx: AR.x, cy: AR.y, r: AR_R[2], fill: "none", stroke: F.groen, "stroke-width": 8, "stroke-opacity": 0.3 }, g);
                    var tal = SV.tekst(g, AR.x + AR_R[2] + 26, AR.y + 7, "8", { "font-size": 22, "font-weight": 700, fill: F.groen });
                    return { glod: glod, tal: tal };
                },
                byg: function (g, r, an) { an.streg(r.glod, 0, 800); an.pop(r.tal, 700); }
            });

            function pille(g, spoeg) {
                var gg = SV.g(g);
                SV.el("rect", { x: PILLE.x - 62, y: PILLE.y - 18, width: 124, height: 38, rx: 19,
                    fill: spoeg ? "#f4f6f8" : F.tealLys, stroke: spoeg ? F.spoeg : F.teal, "stroke-width": 1.8, "stroke-dasharray": spoeg ? "5 4" : null }, gg);
                SV.tekst(gg, PILLE.x, PILLE.y + 8, "(2, 8, 7)", { "font-size": 21, "font-weight": 700, fill: spoeg ? F.mat : F.teal });
                return { g: gg };
            }
        }
    };
}());

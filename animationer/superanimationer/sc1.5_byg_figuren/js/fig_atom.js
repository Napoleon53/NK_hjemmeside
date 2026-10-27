/* =====================================================================
   fig_atom.js - figuren til 1.2 Atomet

   Et carbonatom (6 protoner, 6 neutroner, 6 elektroner) som i bogens
   atommodel, en lup paa kernen, carbons felt i det periodiske system,
   et regnskab over ladningerne og de tre isotoper carbon-12, -13 og -14.
   Atommassen 12,01 u er fra Databogen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var A = { x: 215, y: 240 };          /* atomets midte */
    var R1 = 70, R2 = 135;               /* elektronskallerne */
    var L = { x: 560, y: 215, r: 100 };  /* luppen paa kernen */
    var KORT = { x: 800, y: 50, b: 156, h: 176 };
    var LAD = { x: 700, y: 302, b: 275, h: 108 };
    var ISO = { x: 300, y: 490, b: 685, h: 172 };

    /* Kernens kugler som en solsikke: jaevnt fordelt og rund */
    function solsikke(n, c) {
        var p = [];
        for (var i = 0; i < n; i++) {
            var v = i * 137.508 * Math.PI / 180;
            var r = c * Math.sqrt(i + 0.35);
            p.push({ x: r * Math.cos(v), y: r * Math.sin(v) });
        }
        return p;
    }

    /* Hver anden kugle er en proton; ved 13 og 14 er der flere neutroner */
    function slags(i, n) {
        if (n === 12) return i % 2 === 0 ? "proton" : "neutron";
        var proton = [0, 2, 4, 6, 9, 11];
        return proton.indexOf(i) >= 0 ? "proton" : "neutron";
    }

    /* Midten af "14" i navnet carbon-14 (navnet staar centreret) */
    var X14 = (function () {
        var x = ISO.x + 130 + 2 * 210;
        var b = NK.tekstBredde("carbon-14", 18, 700), b14 = NK.tekstBredde("14", 18, 700);
        return { x: x + b / 2 - b14 / 2, y: ISO.y + 24 };
    }());

    var LUP_C = 21, LUP_R = 18;
    var lupPos = solsikke(12, LUP_C);
    var fundet = {};

    /* Elektronerne: 2 i den inderste skal, 4 i den yderste */
    var ELEKTRONER = [
        { r: R1, v: 200 }, { r: R1, v: 20 },
        { r: R2, v: 140 }, { r: R2, v: 232 }, { r: R2, v: 318 }, { r: R2, v: 42 }
    ];
    function epos(e) {
        var v = e.v * Math.PI / 180;
        return { x: A.x + e.r * Math.cos(v), y: A.y + e.r * Math.sin(v) };
    }

    /* Tangenterne fra et punkt til en cirkel (til luppens kegle) */
    function tangenter(px, py, c) {
        var dx = px - c.x, dy = py - c.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var b = Math.atan2(dy, dx), a = Math.acos(c.r / d);
        return [
            { x: c.x + c.r * Math.cos(b + a), y: c.y + c.r * Math.sin(b + a) },
            { x: c.x + c.r * Math.cos(b - a), y: c.y + c.r * Math.sin(b - a) }
        ];
    }

    function lupKugle(i) { return { x: L.x + lupPos[i].x, y: L.y + lupPos[i].y }; }
    function foersteAf(s) {
        for (var i = 0; i < 12; i++) if (slags(i, 12) === s) return i;
        return 0;
    }

    /* En lille kerne (i atomet og blandt isotoperne) */
    function lilleKerne(g, cx, cy, n, c, r, farver) {
        var pos = solsikke(n, c);
        var kugler = [];
        pos.forEach(function (p, i) {
            var s = farver ? slags(i, n) : "neutron";
            kugler.push(SV.kugle(g, cx + p.x, cy + p.y, r, s));
        });
        return kugler;
    }

    /* Pladserne er valgt, saa en proton og en neutron i luppen kan peges paa */
    var iP = 0, iN = 0;
    (function () {
        /* den proton, der ligger mest oppe til venstre, og den neutron mest nede til hoejre */
        var bp = 1e9, bn = -1e9;
        for (var i = 0; i < 12; i++) {
            var p = lupPos[i];
            if (slags(i, 12) === "proton" && p.x + p.y < bp) { bp = p.x + p.y; iP = i; }
            if (slags(i, 12) === "neutron" && p.x + p.y > bn) { bn = p.x + p.y; iN = i; }
        }
    }());
    var proton0 = lupKugle(iP), neutron0 = lupKugle(iN);

    NK.FIGURER.atom = {
        vb: [1000, 680],
        lag: [
            { navn: "Atomets dele", pladser: ["kerne", "elektron", "proton", "neutron"],
              ros: "Carbonatomet har fået en kerne af protoner og neutroner og elektroner uden om." },
            { navn: "Atomnummer og ladning", pladser: ["atomnummer", "elektrisk neutral"], ekstra: ["nukleontal"],
              ros: "Carbon har 6 protoner og 6 elektroner, så ladningerne ophæver hinanden." },
            { navn: "Isotoper og atommasse", pladser: ["isotoper", "nukleontal", "atommasse"],
              ros: "Carbonatomer findes med 6, 7 og 8 neutroner, og atommassen er gennemsnittet." }
        ],
        pladser: [
            { id: "kerne", ord: ["kerne"], x: A.x, y: 38, maal: [A.x, A.y - 24], halo: 30, dele: ["kerne"],
              fejl: { proton: "<b>proton</b> er én af kuglerne. Pladsen peger på hele klumpen af kugler i midten af atomet." } },
            { id: "elektron", ord: ["elektron"], x: 110, y: 440, maal: [epos(ELEKTRONER[2]).x, epos(ELEKTRONER[2]).y], halo: 18, dele: ["elektron"] },
            { id: "proton", ord: ["proton"], x: 420, y: 60, maal: [proton0.x, proton0.y], halo: 24, dele: ["proton"],
              fejl: { neutron: "<b>neutron</b> passer ikke på kuglen med +. En neutron har ingen ladning." } },
            { id: "neutron", ord: ["neutron"], x: 560, y: 380, maal: [neutron0.x, neutron0.y], halo: 24, dele: ["neutron"],
              fejl: { proton: "<b>proton</b> passer ikke på kuglen uden tegn. En proton har ladningen +1." } },
            { id: "atomnummer", ord: ["atomnummer"], x: 655, y: 74, maal: [KORT.x + 9, KORT.y + 24], halo: 15, dele: ["atomnummer"],
              fejl: { nukleontal: "<b>nukleontal</b> tæller både protoner og neutroner. Tallet 6 i feltet tæller kun protonerne." } },
            { id: "elektrisk neutral", ord: ["elektrisk neutral"], x: 585, y: 452, maal: [LAD.x + 14, LAD.y + LAD.h - 14], halo: 15, dele: ["neutral"] },
            { id: "isotoper", ord: ["isotoper"], x: 180, y: 576, maal: [ISO.x, ISO.y + 86], halo: 15, dele: ["isotoper"] },
            { id: "nukleontal", ord: ["nukleontal"], x: 880, y: 452, maal: [X14.x, X14.y - 14], halo: 10, dele: ["nukleontal"],
              fejl: { atommasse: "<b>atommasse</b> er gennemsnittet for alle carbonatomer. Tallet 14 i carbon-14 tæller partiklerne i én kerne." } },
            { id: "atommasse", ord: ["atommasse"], x: KORT.x + KORT.b / 2, y: 268, maal: [KORT.x + KORT.b / 2, KORT.y + KORT.h], halo: 14, dele: ["atommasse"],
              fejl: { nukleontal: "<b>nukleontal</b> er et helt tal for én kerne. 12,01 er et gennemsnit og ikke et helt tal." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: atomet og luppen ------------------------------- */
            api.del("sky", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("circle", { cx: A.x, cy: A.y, r: 160, fill: "url(#sky)" }, g);
                    SV.tekst(g, A.x, A.y + 182, "carbonatom", { "font-size": 15, fill: F.mat, "font-style": "italic" });
                }
            });

            api.del("lup", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var t = tangenter(A.x + 4, A.y, L);
                    var kegle = SV.el("path", {
                        d: "M" + (A.x + 2) + "," + (A.y - 20) + " L" + t[1].x + "," + t[1].y + " L" + t[0].x + "," + t[0].y + " L" + (A.x + 2) + "," + (A.y + 20) + " Z",
                        fill: "rgba(120,150,190,0.08)", stroke: "none"
                    }, g);
                    SV.el("line", { x1: A.x + 6, y1: A.y - 20, x2: t[1].x, y2: t[1].y, stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, g);
                    SV.el("line", { x1: A.x + 6, y1: A.y + 20, x2: t[0].x, y2: t[0].y, stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" }, g);
                    SV.el("circle", { cx: L.x, cy: L.y, r: L.r + 7, fill: "#e5ebf2", stroke: "#8796a8", "stroke-width": 2, filter: "url(#skygge)" }, g);
                    SV.el("circle", { cx: L.x, cy: L.y, r: L.r, fill: "url(#lup)", stroke: "#b8c4d2", "stroke-width": 1 }, g);
                    SV.tekst(g, L.x, L.y + L.r + 30, "kernen forstørret", { "font-size": 14, fill: F.mat, "font-style": "italic" });
                    return { kegle: kegle };
                }
            });

            api.del("kerne", {
                lag: 0,
                spoeg: function (g) {
                    SV.el("circle", { cx: A.x, cy: A.y, r: 22, fill: F.spoegFyld, stroke: F.spoeg, "stroke-width": 1.6, "stroke-dasharray": "4 3" }, g);
                },
                fuld: function (g) { return { kugler: lilleKerne(g, A.x, A.y, 12, 5.1, 5.2, true) }; },
                byg: function (g, r, an) {
                    r.kugler.forEach(function (k, i) { an.glid(k, (i % 3 - 1) * 40, -30 - i * 3, i * 45, 420); });
                }
            });

            api.del("elektron", {
                lag: 0,
                spoeg: function (g) {
                    SV.el("circle", { cx: A.x, cy: A.y, r: R1, fill: "none", stroke: F.spoeg, "stroke-width": 1.3, "stroke-dasharray": "4 4" }, g);
                    SV.el("circle", { cx: A.x, cy: A.y, r: R2, fill: "none", stroke: F.spoeg, "stroke-width": 1.3, "stroke-dasharray": "4 4" }, g);
                    ELEKTRONER.forEach(function (e) { var p = epos(e); SV.spoegKugle(g, p.x, p.y, 10); });
                },
                fuld: function (g) {
                    var ringe = [
                        SV.el("circle", { cx: A.x, cy: A.y, r: R1, fill: "none", stroke: "#9db6e6", "stroke-width": 1.4, "stroke-dasharray": "5 4" }, g),
                        SV.el("circle", { cx: A.x, cy: A.y, r: R2, fill: "none", stroke: "#9db6e6", "stroke-width": 1.4, "stroke-dasharray": "5 4" }, g)
                    ];
                    var e = ELEKTRONER.map(function (el) { var p = epos(el); return SV.kugle(g, p.x, p.y, 11, "elektron", "−"); });
                    return { ringe: ringe, e: e };
                },
                byg: function (g, r, an) {
                    r.ringe.forEach(function (ring, i) { an.fade(ring, i * 120, 500); });
                    r.e.forEach(function (k, i) { an.pop(k, 200 + i * 90); });
                }
            });

            /* Protonerne og neutronerne i luppen: hver sin del, men samme plads */
            ["proton", "neutron"].forEach(function (s) {
                api.del(s, {
                    lag: 0,
                    spoeg: function (g) {
                        lupPos.forEach(function (p, i) { if (slags(i, 12) === s) SV.spoegKugle(g, L.x + p.x, L.y + p.y, LUP_R); });
                    },
                    fuld: function (g) {
                        var k = [];
                        lupPos.forEach(function (p, i) {
                            if (slags(i, 12) === s) k.push(SV.kugle(g, L.x + p.x, L.y + p.y, LUP_R, s, s === "proton" ? "+" : ""));
                        });
                        fundet[s] = k;
                        return { k: k };
                    },
                    byg: function (g, r, an) { r.k.forEach(function (k, i) { an.pop(k, i * 80); }); }
                });
            });

            /* ----- Lag 2: atomnummer og ladning --------------------------- */
            api.del("felt", {
                lag: 1, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: KORT.x, y: KORT.y, width: KORT.b, height: KORT.h, rx: 12, fill: "#dff2ed", stroke: F.ikkeKant, "stroke-width": 2, filter: "url(#skygge)" }, g);
                    SV.tekst(g, KORT.x + KORT.b / 2, KORT.y + 112, "C", { "font-size": 70, "font-weight": 700 });
                    SV.tekst(g, KORT.x + KORT.b / 2, KORT.y + 140, "carbon", { "font-size": 16, fill: F.svag });
                    SV.tekst(g, KORT.x + KORT.b / 2, KORT.y - 10, "carbons felt i det periodiske system", { "font-size": 12.5, fill: F.mat, "font-style": "italic" });
                }
            });

            api.del("atomnummer", {
                lag: 1,
                spoeg: function (g) { SV.tekst(g, KORT.x + 28, KORT.y + 33, "6", { "font-size": 26, "font-weight": 700, fill: F.spoeg }); },
                fuld: function (g) { return { t: SV.tekst(g, KORT.x + 28, KORT.y + 33, "6", { "font-size": 26, "font-weight": 700, fill: F.teal }) }; },
                byg: function (g, r, an) {
                    an.pop(r.t, 0);
                    /* Protonerne i luppen taelles: 1, 2, ..., 6 */
                    (fundet.proton || []).forEach(function (k, i) { an.blink(k, 250 + i * 170); });
                }
            });

            api.del("neutral", {
                lag: 1,
                spoeg: function (g) { regnskab(g, true); },
                fuld: function (g) { return regnskab(g, false); },
                byg: function (g, r, an) {
                    an.glid(r.r1, -20, 0, 0, 450);
                    an.glid(r.r2, -20, 0, 160, 450);
                    an.streg(r.streg, 320, 300);
                    an.pop(r.nul, 560);
                    an.streg(r.flueben, 800, 350);
                }
            });

            /* ----- Lag 3: isotoper og atommasse --------------------------- */
            var ISOTOPER = [12, 13, 14];
            function isoX(i) { return ISO.x + 130 + i * 210; }

            api.del("isopanel", {
                lag: 2, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: ISO.x, y: ISO.y, width: ISO.b, height: ISO.h, rx: 14, fill: "#f3f6f9", stroke: "#d3dae2", "stroke-width": 1.5 }, g);
                    ISOTOPER.forEach(function (n, i) {
                        SV.tekst(g, isoX(i), ISO.y + 30, "carbon-" + n, { "font-size": 18, "font-weight": 700 });
                    });
                }
            });

            api.del("isotoper", {
                lag: 2,
                spoeg: function (g) {
                    ISOTOPER.forEach(function (n, i) { SV.el("circle", { cx: isoX(i), cy: ISO.y + 88, r: 36, fill: F.spoegFyld, stroke: F.spoeg, "stroke-width": 1.5, "stroke-dasharray": "4 3" }, g); });
                },
                fuld: function (g) {
                    var k = ISOTOPER.map(function (n, i) {
                        var gg = SV.g(g);
                        SV.el("circle", { cx: isoX(i), cy: ISO.y + 88, r: 48, fill: "url(#sky)" }, gg);
                        lilleKerne(gg, isoX(i), ISO.y + 88, n, 7.6, 8.4, true);
                        return gg;
                    });
                    return { k: k };
                },
                byg: function (g, r, an) { r.k.forEach(function (k, i) { an.pop(k, i * 200, 520); }); }
            });

            api.del("nukleontal", {
                lag: 2,
                fuld: function (g) {
                    var linjer = ISOTOPER.map(function (n, i) {
                        return SV.tekst(g, isoX(i), ISO.y + 154, "6 protoner + " + (n - 6) + " neutroner", { "font-size": 14, fill: F.svag });
                    });
                    var ring = SV.el("ellipse", { cx: X14.x, cy: X14.y, rx: 15, ry: 14, fill: "none", stroke: F.teal, "stroke-width": 2.2 }, g);
                    return { linjer: linjer, ring: ring };
                },
                byg: function (g, r, an) {
                    an.streg(r.ring, 0, 450);
                    r.linjer.forEach(function (t, i) { an.fade(t, 250 + i * 180, 400); });
                }
            });

            api.del("atommasse", {
                lag: 2,
                spoeg: function (g) { SV.tekst(g, KORT.x + KORT.b / 2, KORT.y + 166, "12,01", { "font-size": 17, "font-weight": 700, fill: F.spoeg }); },
                fuld: function (g) {
                    var t = SV.tekst(g, KORT.x + KORT.b / 2, KORT.y + 166, "12,01", { "font-size": 17, "font-weight": 700, fill: F.teal });
                    return { t: t };
                },
                byg: function (g, r, an) { an.pop(r.t, 0); an.taelOp(r.t, 12.01, 2, 0, 800); }
            });

            /* Regnskabet over ladningerne: 6 protoner, 6 elektroner, i alt 0 */
            function regnskab(g, spoeg) {
                var x = LAD.x, y = LAD.y, b = LAD.b, h = LAD.h;
                var mat = spoeg ? F.spoeg : null;
                SV.el("rect", { x: x, y: y, width: b, height: h, rx: 12, fill: spoeg ? "#f6f8fa" : "#ffffff", stroke: spoeg ? F.spoeg : "#cdd5dd", "stroke-width": 1.5, "stroke-dasharray": spoeg ? "5 4" : null, filter: spoeg ? null : "url(#skygge)" }, g);
                SV.tekst(g, x + 14, y + 20, "LADNINGEN I ATOMET", { "font-size": 11.5, "font-weight": 700, fill: mat || F.mat, "text-anchor": "start", "letter-spacing": 1 });
                var r1 = SV.g(g), r2 = SV.g(g);
                if (spoeg) SV.spoegKugle(r1, x + 22, y + 40, 7); else SV.kugle(r1, x + 22, y + 40, 7.5, "proton");
                SV.tekst(r1, x + 38, y + 45, "6 protoner", { "font-size": 15, fill: mat || F.tekst, "text-anchor": "start" });
                SV.tekst(r1, x + b - 16, y + 45, "+6", { "font-size": 16, "font-weight": 700, fill: mat || F.roed, "text-anchor": "end" });
                if (spoeg) SV.spoegKugle(r2, x + 22, y + 64, 7); else SV.kugle(r2, x + 22, y + 64, 7.5, "elektron");
                SV.tekst(r2, x + 38, y + 69, "6 elektroner", { "font-size": 15, fill: mat || F.tekst, "text-anchor": "start" });
                SV.tekst(r2, x + b - 16, y + 69, "−6", { "font-size": 16, "font-weight": 700, fill: mat || F.blaa, "text-anchor": "end" });
                var streg = SV.el("line", { x1: x + 14, y1: y + 78, x2: x + b - 14, y2: y + 78, stroke: mat || "#9aa4ae", "stroke-width": 1.4 }, g);
                SV.tekst(g, x + 38, y + 98, "i alt", { "font-size": 15, "font-weight": 700, fill: mat || F.tekst, "text-anchor": "start" });
                var nul = SV.tekst(g, x + b - 16, y + 98, "0", { "font-size": 18, "font-weight": 700, fill: mat || F.groen, "text-anchor": "end" });
                var flueben = SV.el("path", { d: "M" + (x + b - 62) + "," + (y + 92) + " l6,6 l12,-13", fill: "none", stroke: spoeg ? "none" : F.groen, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
                return { r1: r1, r2: r2, streg: streg, nul: nul, flueben: flueben };
            }
        }
    };
}());

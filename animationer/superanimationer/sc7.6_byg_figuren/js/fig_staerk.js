/* =====================================================================
   fig_staerk.js - figuren til 7.2 Stærke og svage syrer

   Øverst to kort som bogens figurer staerk-syre og svag-syre: til
   venstre det, der hældes i (10 molekyler), en pil "reagerer med vand"
   og til højre det, der er i opløsningen, talt op under vinduet:
   10 oxoniumioner og 10 chloridioner eller 9 hele molekyler, 1
   oxoniumion og 1 acetation. Reaktionen står øverst i kortet med
   enkeltpil og dobbeltpil.
   Nederst en ramme med to neutralisationer side om side: natriumhydroxid
   og ammoniakvand, der hældes i saltsyre. En orange pil viser hydronen,
   der går fra H₃O⁺ til basen, og en kort tekst under basens plads siger,
   hvor villigt basen optager en hydron, så eleven kan se forskellen på
   en stærk og en svag base.
   Rettet 1. nov. 2026 (brugeren: "kun hele molekyler" var uklart, og
   boksen med neutralisationerne var uklar).
   Fem fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB;

    /* De to kort med syrerne */
    var K = [{ x: 30, y: 34, b: 450, h: 290 }, { x: 520, y: 34, b: 450, h: 290 }];
    function w1(k) { return { x: k.x + 14, y: k.y + 74, b: 140, h: 150 }; }      /* det, der hældes i */
    function w2(k) { return { x: k.x + 216, y: k.y + 74, b: 220, h: 150 }; }     /* det, der er i opløsningen */

    /* Rammen med neutralisationerne */
    var NR = { x: 30, y: 376, b: 940, h: 258 };
    var HY = NR.y + 44;                                  /* "… hældes i saltsyre" */
    var RY = NR.y + 120;                                 /* reaktionernes midte */
    var SY = NR.y + 190;                                 /* pladserne */
    var NY = NR.y + 238;                                 /* teksten under pladserne */
    var DELX = 505;                                      /* skillelinjen */
    var HX = [(NR.x + DELX) / 2, (DELX + NR.x + NR.b) / 2];
    var OHX = 206, NH3X = 676;

    function midt(k) { return k.x + k.b / 2; }
    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: midt(k), y: k.y + k.h, maal: [midt(k), k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }

    NK.FIGURER.staerk = {
        vb: [1000, 660],
        lag: [
            { navn: "Syrer i vand", pladser: ["stærk syre", "svag syre"],
              ros: "HCl afgiver alle sine hydroner i vand og er en stærk syre. CH₃COOH afgiver kun få og er en svag syre." },
            { navn: "Baser bruger syren op", pladser: ["neutralisation", "stærk base", "svag base"],
              ros: "I en neutralisation reagerer en base med syren, så blandingen bliver mindre sur. OH⁻ er en stærk base, og NH₃ er en svag base." }
        ],
        pladser: [
            skilt("stærk syre", K[0], ["k1"], {
                "svag syre": "<b>svag syre</b> afgiver kun få hydroner. I kortet her har alle ti HCl-molekyler afgivet deres hydron.",
                "stærk base": "<b>stærk base</b> optager en hydron. HCl afgiver hydroner og er en syre.",
                neutralisation: "<b>neutralisation</b> er en reaktion mellem en syre og en base. Kortet viser kun HCl i vand." }),
            skilt("svag syre", K[1], ["k2"], {
                "stærk syre": "<b>stærk syre</b> afgiver alle sine hydroner. Her har kun ét af de ti CH₃COOH-molekyler afgivet sin hydron, og pilen er en dobbeltpil.",
                "svag base": "<b>svag base</b> optager en hydron. CH₃COOH afgiver hydroner og er en syre." }),

            { id: "neutralisation", ord: ["neutralisation"], x: midt(NR), y: NR.y, maal: [midt(NR), NR.y], titel: true, dele: ["nramme"],
              omr: [{ r: [NR.x - 6, NR.y - 6, NR.b + 12, NR.h + 12, 18], tom: true }],
              fejl: { "stærk base": "<b>stærk base</b> er ét stof. Overskriften gælder begge reaktioner, hvor en base bruger oxoniumionerne op.",
                      "svag base": "<b>svag base</b> er ét stof. Overskriften gælder begge reaktioner, hvor en base bruger oxoniumionerne op." } },
            { id: "stærk base", ord: ["stærk base"], x: OHX, y: SY, maal: [OHX, RY + 16], dele: ["oh"],
              omr: [{ r: [OHX - 32, RY - 26, 64, 44, 8] }],
              fejl: { "svag base": "<b>svag base</b> optager kun få hydroner fra vand. OH⁻ optager en hydron, så snart den møder en syre.",
                      "stærk syre": "<b>stærk syre</b> afgiver hydroner. OH⁻ optager en hydron og er en base." } },
            { id: "svag base", ord: ["svag base"], x: NH3X, y: SY, maal: [NH3X, RY + 16], dele: ["nh3"],
              omr: [{ r: [NH3X - 32, RY - 26, 64, 44, 8] }],
              fejl: { "stærk base": "<b>stærk base</b> optager en hydron, så snart den møder en syre. NH₃ optager kun få hydroner fra vand.",
                      "svag syre": "<b>svag syre</b> afgiver hydroner. NH₃ optager en hydron og er en base." } }
        ],

        tegn: function (api) {
            LAB.gradienter();

            /* ----- Små tegnehjælpere ------------------------------------------- */
            function vindue(g, w) {
                SV.el("rect", { x: w.x, y: w.y, width: w.b, height: w.h, rx: 10, fill: "url(#k7-vindue)", stroke: "#8fa6b8", "stroke-width": 1.3 }, g);
            }
            /* Et helt molekyle som grå kugle (bogens HCl-kugle) */
            function molKugle(g, x, y, r, tekst) {
                var gg = SV.g(g);
                SV.el("circle", { cx: x, cy: y, r: r, fill: "#eef1f2", stroke: "#6b7780", "stroke-width": 1.3 }, gg);
                SV.tekst(gg, x, y + 3.8, tekst, { "font-size": 10.5, "font-weight": 700, fill: "#14201f" });
                return gg;
            }
            /* Et molekyle eller en sammensat ion som lille pille */
            function pille(g, x, y, tekst, b, negativ) {
                var gg = SV.g(g);
                SV.el("rect", { x: x - b / 2, y: y - 11, width: b, height: 22, rx: 11, fill: negativ ? LAB.NEG.fyld : "#eef1f2",
                    stroke: negativ ? LAB.NEG.kant : "#6b7780", "stroke-width": 1.2 }, gg);
                SV.tekst(gg, x, y + 3.6, tekst, { "font-size": 10, "font-weight": 700, fill: negativ ? LAB.NEG.tekst : "#14201f" });
                return gg;
            }
            /* Overskrifter, pil og optælling, som i bogens figurer */
            function kortRamme(g, k, reaktion, fs, under1, under2) {
                var a = w1(k), b = w2(k);
                LAB.kort(g, k.x, k.y, k.b, k.h);
                SV.tekst(g, midt(k), k.y + 34, reaktion, { "font-size": fs, "font-weight": 700 });
                var ov = { "font-size": 13, "font-weight": 700, fill: F.teal };
                SV.tekst(g, a.x + a.b / 2, a.y - 10, "Det, der hældes i", ov);
                SV.tekst(g, b.x + b.b / 2, b.y - 10, "Det, der er i opløsningen", ov);
                vindue(g, a);
                vindue(g, b);
                var py = a.y + a.h / 2 + 10, px1 = a.x + a.b + 7, px2 = b.x - 7;
                LAB.pil(g, px1, px2, py, { farve: "#4f6b66" });
                SV.tekst(g, (px1 + px2) / 2, py - 26, "reagerer", { "font-size": 11, fill: F.svag });
                SV.tekst(g, (px1 + px2) / 2, py - 12, "med vand", { "font-size": 11, fill: F.svag });
                var u = { "font-size": 13, fill: "#33414d" }, uy = a.y + a.h + 20;
                SV.tekst(g, a.x + a.b / 2, uy, under1, u);
                SV.tekst(g, b.x + b.b / 2, uy, under2[0], u);
                SV.tekst(g, b.x + b.b / 2, uy + 16, under2[1], u);
            }

            /* ----- Lag 1: HCl og CH₃COOH i vand ------------------------------------ */
            api.del("k1", {
                lag: 0,
                fuld: function (g) {
                    var k = K[0], a = w1(k), b = w2(k);
                    kortRamme(g, k, "HCl + H_2O → H_3O^+ + Cl^−", 18, "10 molekyler HCl", ["10 oxoniumioner og", "10 chloridioner"]);
                    var foer = SV.g(g), efter = SV.g(g);
                    /* 10 HCl-molekyler i rækker med 3, 2, 3 og 2 */
                    [[30, 70, 110], [50, 90], [30, 70, 110], [50, 90]].forEach(function (raekke, r) {
                        raekke.forEach(function (x) { molKugle(foer, a.x + x, a.y + 22 + r * 35, 15, "HCl"); });
                    });
                    /* 10 oxoniumioner og 10 chloridioner */
                    for (var r = 0; r < 4; r++) for (var c = 0; c < 5; c++) {
                        var x = b.x + 24 + c * 43.5 + (r % 2 ? 4 : -2), y = b.y + 21 + r * 36;
                        LAB.ion(efter, x, y, 15, (r + c) % 2 ? "Cl^−" : "H_3O^+", (r + c) % 2 === 0);
                    }
                    return { foer: foer, efter: efter };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.foer, 150, 450); an.pop(r.efter, 550, 500); }
            });

            api.del("k2", {
                lag: 0,
                fuld: function (g) {
                    var k = K[1], a = w1(k), b = w2(k);
                    kortRamme(g, k, "CH_3COOH + H_2O ⇌ H_3O^+ + CH_3COO^−", 16, "10 molekyler CH_3COOH", ["9 hele molekyler,", "1 oxoniumion og 1 acetation"]);
                    var foer = SV.g(g), efter = SV.g(g);
                    /* 10 CH₃COOH-molekyler i to søjler */
                    for (var r = 0; r < 5; r++) [35, 105].forEach(function (x) { pille(foer, a.x + x, a.y + 19 + r * 28, "CH_3COOH", 64, false); });
                    /* 9 hele molekyler, 1 oxoniumion og 1 acetation */
                    for (var rr = 0; rr < 4; rr++) for (var c = 0; c < 3; c++) {
                        var x = b.x + 37 + c * 73, y = b.y + 22 + rr * 35;
                        if (rr === 1 && c === 1) LAB.ion(efter, x, y, 15, "H_3O^+", true);
                        else if (rr === 3 && c === 0) pille(efter, x, y, "CH_3COO^−", 66, true);
                        else if (!(rr === 3 && c === 2)) pille(efter, x, y, "CH_3COOH", 66, false);
                    }
                    return { foer: foer, efter: efter };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.foer, 150, 450); an.pop(r.efter, 550, 500); }
            });

            /* ----- Lag 2: neutralisationerne --------------------------------------- */
            api.del("nramme", {
                lag: 1,
                fuld: function (g) { return { r: LAB.ramme(g, NR.x, NR.y, NR.b, NR.h, { fyld: "#f7f9fb", kant: "#8fc7bb" }) }; },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); }
            });

            var f = { "font-size": 23, "font-weight": 700 };
            function t(g, x, s, farve) { return SV.tekst(g, x, RY + 8, s, Object.assign({ fill: farve || F.tekst }, f)); }
            /* Hydronen går fra H₃O⁺ til basen */
            function hydronPil(g, x1, x2) {
                var y = RY - 20;
                SV.el("path", { d: "M" + x1 + "," + y + " C" + x1 + "," + (y - 34) + " " + x2 + "," + (y - 34) + " " + x2 + "," + (y - 8),
                    fill: "none", stroke: LAB.HYDRON, "stroke-width": 2.2, "stroke-linecap": "round" }, g);
                SV.el("polygon", { points: x2 + "," + (y - 1) + " " + (x2 - 5) + "," + (y - 10) + " " + (x2 + 5) + "," + (y - 10), fill: LAB.HYDRON }, g);
                SV.tekst(g, (x1 + x2) / 2, y - 31, "H^+", { "font-size": 14, "font-weight": 700, fill: LAB.HYDRON });
            }
            api.del("rx", {
                lag: 1, auto: true,
                fuld: function (g) {
                    var h = { "font-size": 15, "font-weight": 700, fill: "#33414d" };
                    SV.tekst(g, HX[0], HY, "Natriumhydroxid hældes i saltsyre", h);
                    SV.tekst(g, HX[1], HY, "Ammoniakvand hældes i saltsyre", h);
                    SV.el("line", { x1: DELX, y1: NR.y + 30, x2: DELX, y2: NR.y + NR.h - 24, stroke: "#dde5ea", "stroke-width": 1.6 }, g);
                    /* H₃O⁺ + OH⁻ → H₂O + H₂O */
                    t(g, 92, "H_3O^+", LAB.SYRE); t(g, 150, "+", F.svag);
                    LAB.pil(g, 248, 300, RY, { farve: "#1f2a33" });
                    t(g, 350, "H_2O"); t(g, 396, "+", F.svag); t(g, 442, "H_2O");
                    hydronPil(g, 100, OHX - 8);
                    /* H₃O⁺ + NH₃ → H₂O + NH₄⁺ */
                    t(g, 562, "H_3O^+", LAB.SYRE); t(g, 620, "+", F.svag);
                    LAB.pil(g, 718, 770, RY, { farve: "#1f2a33" });
                    t(g, 816, "H_2O"); t(g, 864, "+", F.svag); t(g, 918, "NH_4^+", LAB.SYRE);
                    hydronPil(g, 570, NH3X - 8);
                }
            });
            var note = { "font-size": 14, fill: "#33414d" };
            api.del("oh", {
                lag: 1,
                fuld: function (g) {
                    var n = SV.tekst(g, HX[0], NY, "OH^− optager en hydron, så snart den møder en syre.", note);
                    return { t: t(g, OHX, "OH^−", LAB.BASE), n: n };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); an.fade(r.n, 300, 450); }
            });
            api.del("nh3", {
                lag: 1,
                fuld: function (g) {
                    var n = SV.tekst(g, HX[1], NY, "NH_3 optager kun få hydroner fra vand, men alle fra H_3O^+.", note);
                    return { t: t(g, NH3X, "NH_3", LAB.BASE), n: n };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); an.fade(r.n, 300, 450); }
            });
        }
    };
}());

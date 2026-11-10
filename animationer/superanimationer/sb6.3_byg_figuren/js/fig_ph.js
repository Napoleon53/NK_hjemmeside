/* =====================================================================
   fig_ph.js - figuren til B6.2 Vands selvionisering og pH

   Oeverst til venstre bogens b6-selvionisering: to vandmolekyler som
   kuglemodeller, hvor det ene afgiver den orange hydron til det andet,
   saa der dannes en oxoniumion og en hydroxidion. Vands selvionisering
   er titlen paa kortet.
   Oeverst til hoejre et kort med vands ionprodukt fra bogens
   b6-regnefirkant (Kv = [H₃O⁺] · [OH⁻] = 1,0 · 10⁻¹⁴ M² ved 25 °C);
   pladsen peger paa formlen, og teksten "vands ionprodukt" er taget af.
   Nederst bogens b6-ph-poh-skala fra −1 til 15 med en lille kasse til
   hver koncentration. Etiketterne "pH" og "pOH" til venstre for
   raekkerne er taget af (de er pladserne), og teksterne "sur", "neutral"
   og "basisk" under skalaen er taget ud for at give plads.
   Fire fagord i to lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var B6 = NK.B6;
    var C = B6.F;

    /* ----- Lag 1: selvioniseringen og ionproduktet ------------------------ */
    var RA = { x: 20, y: 30, b: 730, h: 262 };
    var MY = 150, NY = 228, S = 1.95;
    var XS = [118, 262, 505, 652];
    var M = {
        a: B6.beregn("H2O-syre", XS[0], MY, S, { vx: 0.3 }),
        b: B6.beregn("H2O", XS[1], MY, S, { vx: 0.3, vz: 0.6 })
    };
    var RB = { x: 770, y: 30, b: 370, h: 262 };
    var FX = RB.x + RB.b / 2, FY1 = 172, FY2 = 214;

    /* ----- Lag 2: skalaerne ------------------------------------------------ */
    var RC = { x: 20, y: 322, b: 1120, h: 318 };
    var X0 = 192, CEL = 54, PMIN = -1, PMAKS = 15;
    var YP = 392, YH = 438, YO = 478, YQ = 520;          /* pH, [H₃O⁺], [OH⁻], pOH */
    function X(q) { return X0 + (q - PMIN + 0.5) * CEL; }
    var BREDDE = (PMAKS - PMIN + 1) * CEL;

    NK.FIGURER.ph = {
        vb: [1160, 656],
        lag: [
            { navn: "Vand reagerer med vand", pladser: ["vands selvionisering", "vands ionprodukt"],
              ros: "Ét vandmolekyle afgiver en hydron til et andet. [H₃O⁺] · [OH⁻] er altid 1,0 · 10⁻¹⁴ M² ved 25 °C." },
            { navn: "Skalaerne", pladser: ["pH", "pOH"],
              ros: "pH hører til [H₃O⁺], og pOH hører til [OH⁻]. Læst lodret giver pH og pOH altid 14 tilsammen." }
        ],
        pladser: [
            { id: "vands selvionisering", ord: ["vands selvionisering"], x: RA.x + RA.b / 2, y: RA.y, maal: [RA.x + RA.b / 2, RA.y], titel: true, dele: ["selv"],
              omr: [{ r: [RA.x - 4, RA.y - 4, RA.b + 8, RA.h + 8, 18], tom: true }],
              fejl: { "vands ionprodukt": "<b>vands ionprodukt</b> er en konstant. Overskriften gælder reaktionen, hvor to vandmolekyler danner to ioner.",
                      "pH": "<b>pH</b> er et tal for en opløsning. Overskriften gælder reaktionen mellem to vandmolekyler.",
                      "pOH": "<b>pOH</b> er et tal for en opløsning. Overskriften gælder reaktionen mellem to vandmolekyler." } },
            { id: "vands ionprodukt", ord: ["vands ionprodukt"], x: FX, y: 96, maal: [FX, FY1 - 30], dele: ["ion"],
              omr: [{ r: [RB.x + 16, FY1 - 32, RB.b - 32, FY2 - FY1 + 46, 8] }],
              fejl: { "vands selvionisering": "<b>vands selvionisering</b> er selve reaktionen. Pladsen peger på formlen, hvor to koncentrationer ganges sammen.",
                      "pH": "<b>pH</b> er minus logaritmen til én koncentration. Pladsen peger på to koncentrationer, der ganges sammen.",
                      "pOH": "<b>pOH</b> er minus logaritmen til én koncentration. Pladsen peger på to koncentrationer, der ganges sammen." } },

            { id: "pH", ord: ["pH"], x: 330, y: 356, maal: [X(2), YP - 1], dele: ["ph"],
              omr: [{ r: [X0 - 6, YP - 5, BREDDE + 12, 44, 8] }],
              fejl: { "pOH": "<b>pOH</b> hører til hydroxidionerne. Pladsen peger på rækken over [H₃O⁺], hvor 3 står over 10⁻³.",
                      "vands ionprodukt": "<b>vands ionprodukt</b> er én konstant. Pladsen peger på en hel række tal over [H₃O⁺]." } },
            { id: "pOH", ord: ["pOH"], x: 330, y: 602, maal: [X(2), YQ + 34], dele: ["poh"],
              omr: [{ r: [X0 - 6, YQ - 4, BREDDE + 12, 42, 8] }],
              fejl: { "pH": "<b>pH</b> hører til oxoniumionerne. Pladsen peger på rækken under [OH⁻], hvor 11 står under 10⁻¹¹.",
                      "vands ionprodukt": "<b>vands ionprodukt</b> er én konstant. Pladsen peger på en hel række tal under [OH⁻]." } }
        ],

        tegn: function (api) {
            B6.defs();

            /* ----- Lag 1 ---------------------------------------------------------- */
            api.del("selv", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RA.x, RA.y, RA.b, RA.h);
                    var a = B6.model(g, "H2O-syre", XS[0], MY, S, { vx: 0.3 });
                    var b = B6.model(g, "H2O", XS[1], MY, S, { vx: 0.3, vz: 0.6 });
                    var c = B6.model(g, "H3O-v", XS[2], MY, S, { vx: 0.7, vy: 0.4 });
                    var d = B6.model(g, "OH", XS[3], MY, S, { vx: 0.3 });
                    KV.tekst(g, (XS[0] + XS[1]) / 2, MY + 9, "+", { fs: 26, farve: C.daempet });
                    KV.tekst(g, (XS[2] + XS[3]) / 2, MY + 9, "+", { fs: 26, farve: C.daempet });
                    B6.ligevaegt(g, 352, 412, MY);
                    var pil = B6.hydronpil(g, M.a.hyd, M.b.fri, 92, { tekst: "hydronen flytter", tx: (XS[0] + XS[1]) / 2 });
                    [["H_2O", "syre", C.syre], ["H_2O", "base", C.base], ["H_3O^+", "oxoniumion", C.syre], ["OH^−", "hydroxidion", C.base]].forEach(function (t, k) {
                        KV.tekst(g, XS[k], NY, t[0], { fs: 25, fed: true, farve: t[2] });
                        KV.tekst(g, XS[k], NY + 24, t[1], { fs: 15, farve: t[2] });
                    });
                    return { pil: pil, m: [a.g, b.g, c.g, d.g] };
                },
                byg: function (g, r, an) {
                    an.fade(g, 0, 400);
                    an.streg(r.pil.firstChild, 100, 600);
                    r.m.forEach(function (m, k) { an.pop(m, 150 + 90 * k, 450); });
                }
            });

            api.del("ion", {
                lag: 0,
                fuld: function (g) {
                    KV.kort(g, RB.x, RB.y, RB.b, RB.h);
                    KV.tekst(g, FX, FY1, "K_{v} = [H_3O^+] · [OH^−]", { fs: 25, fed: true });
                    KV.tekst(g, FX, FY2, "= 1,0 · 10^{−14} M^2", { fs: 25, fed: true, farve: C.accent });
                    KV.tekst(g, FX, FY2 + 40, "ved 25 °C", { fs: 15, farve: C.daempet });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 500); }
            });

            /* ----- Lag 2: pH-skalaen med koncentrationerne og pOH ----------------- */
            function potens(n) { return n > 0 ? "10^{−" + n + "}" : (n === 0 ? "1" : "10"); }
            function skala(g, y, h, graa, tal) {
                B6.raekkeSkygge(g, X0 - 10, y, BREDDE + 20, h);
                /* Skalaen toner ud i begge ender: pH stopper ikke ved −1 og 15 */
                SV.el("rect", { x: X0 - 24, y: y, width: 24, height: h, rx: 5, fill: "url(#b6-ud-" + (graa ? "gv" : "v") + ")" }, g);
                SV.el("rect", { x: X0 + BREDDE, y: y, width: 24, height: h, rx: 5, fill: "url(#b6-ud-" + (graa ? "gh" : "h") + ")" }, g);
                for (var q = PMIN; q <= PMAKS; q++) {
                    var lys = graa || (q >= 4 && q <= 10);
                    B6.felt(g, X0 + (q - PMIN) * CEL + 1, y, CEL - 2, h, graa ? "#e6ecee" : B6.phFarve(q), tal(q), { fs: 17, skrift: lys ? C.blaek : "#ffffff" });
                }
            }
            function koncentrationer(g, y, ion) {
                B6.raekkeSkygge(g, X0, y, BREDDE, 30);
                for (var q = PMIN; q <= PMAKS; q++) {
                    var n = ion === "h" ? q : 14 - q, stor = ion === "h" ? q < 7 : q > 7;
                    var f = ion === "h" ? (stor ? ["#fbe1da", "#eab4a6"] : ["#fdf5f3", "#f2d6cf"]) : (stor ? ["#dde8fb", "#a9c2ee"] : ["#f4f7fe", "#d3dff5"]);
                    var x = X0 + (q - PMIN) * CEL + 1;
                    SV.el("rect", { x: x, y: y, width: CEL - 2, height: 32, rx: 6, fill: f[0], stroke: f[1], "stroke-width": 1 }, g);
                    SV.el("rect", { x: x + 2, y: y + 2, width: CEL - 6, height: 11, rx: 4, fill: "url(#b6-glans)" }, g);
                    KV.tekst(g, x + (CEL - 2) / 2, y + 21, potens(n), { fs: 15, fed: stor, farve: stor ? (ion === "h" ? C.syre : C.base) : C.daempet });
                }
                var navn = ion === "h" ? "[H_3O^+]" : "[OH^−]";
                KV.tekst(g, X0 - 34, y + 14, navn, { fs: 17, fed: true, anker: "end" });
                KV.tekst(g, X0 - 34, y + 31, "i M", { fs: 14, farve: C.daempet, anker: "end" });
            }

            api.del("ph", {
                lag: 1,
                fuld: function (g) {
                    KV.kort(g, RC.x, RC.y, RC.b, RC.h);
                    /* Den lyse soejle ved det neutrale punkt viser, at skalaen laeses lodret */
                    SV.el("rect", { x: X(7) - CEL / 2 - 3, y: YP - 10, width: CEL + 6, height: YQ + 34 + 10 - (YP - 10), rx: 9, fill: C.accent, opacity: 0.09 }, g);
                    skala(g, YP, 36, false, function (q) { return String(q).replace("-", "−"); });
                    koncentrationer(g, YH, "h");
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });

            api.del("poh", {
                lag: 1,
                fuld: function (g) {
                    koncentrationer(g, YO, "o");
                    skala(g, YQ, 34, true, function (q) { return String(14 - q).replace("-", "−"); });
                    return {};
                },
                byg: function (g, r, an) { an.fade(g, 0, 600); }
            });
        }
    };
}());

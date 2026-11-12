/* =====================================================================
   fig_ioner.js - figuren til 2.1 Ioner

   Som bogens figurer natriumion og chloridion: natriumatomet afgiver sin
   yderste elektron og bliver til en natriumion, og chloratomet optager
   en elektron og bliver til en chloridion. De to ioner staar paa et kort
   (ion), og til hoejre viser Mg²⁺, hvor ladningen skrives.
   Fire fagord, saa figuren har ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var NA = { y: 150 }, CL = { y: 420 };
    var AX = 120;                                  /* atomerne */
    var IX = 470;                                  /* ionerne */
    var KORT = { x: 350, y: 30, b: 240, h: 560 };  /* kortet med ionerne */
    var MG = { x: 700, y: 214, b: 280, h: 200 };   /* Mg²⁺ */
    var R = [24, 42, 60];
    var KLAMME = 76;

    /* Elektronerne parvis paa fire sider som i bogen: foerst én paa hver
       side (hoejre, top, bund, venstre), saa den anden i parret */
    function skalPos(cx, cy, r, n) {
        if (n === 2 && r === R[0]) return [[cx, cy - r], [cx, cy + r]];
        var sider = [0, 270, 90, 180], pos = [];
        for (var i = 0; i < n; i++) {
            var side = sider[i % 4], anden = i >= 4;
            var v = (n === 1 ? 0 : side + (anden ? 10 : -10)) * Math.PI / 180;
            if (n > 1 && n <= 4) v = side * Math.PI / 180;
            pos.push([cx + r * Math.cos(v), cy + r * Math.sin(v)]);
        }
        return pos;
    }

    /* Et atom eller en ion efter skalmodellen. ny: elektronen, der er kommet til */
    function skalTegning(g, cx, cy, kerne, skaller, o) {
        o = o || {};
        if (o.tabt) SV.el("circle", { cx: cx, cy: cy, r: R[skaller.length], fill: "none", stroke: "#a9b3bd", "stroke-width": 1.4, "stroke-dasharray": "4 4" }, g);
        skaller.forEach(function (n, i) {
            SV.el("circle", { cx: cx, cy: cy, r: R[i], fill: "none", stroke: F.teal, "stroke-width": 1.5 }, g);
        });
        SV.kugle(g, cx, cy, 17, "proton", kerne);
        var ud = [];
        skaller.forEach(function (n, i) {
            skalPos(cx, cy, R[i], n).forEach(function (p, j) {
                var ny = o.ny && i === skaller.length - 1 && j === n - 1;
                ud.push(SV.kugle(g, p[0], p[1], 6.5, ny ? "kalium" : "elektron"));
            });
        });
        return ud;
    }

    function klamme(g, cx, cy, farve, tegn) {
        var k = KLAMME, gg = SV.g(g);
        var a = SV.el("path", { d: "M" + (cx - k + 10) + "," + (cy - k) + " h-10 v" + (2 * k) + " h10", fill: "none", stroke: farve, "stroke-width": 2.6 }, gg);
        var b = SV.el("path", { d: "M" + (cx + k - 10) + "," + (cy - k) + " h10 v" + (2 * k) + " h-10", fill: "none", stroke: farve, "stroke-width": 2.6 }, gg);
        var t = SV.tekst(gg, cx + k + 12, cy - k + 10, tegn, { "font-size": 26, "font-weight": 700, fill: farve });
        return { g: gg, a: a, b: b, t: t };
    }

    function tekster(g, x, y, linjer) {
        SV.tekst(g, x, y, linjer[0], { "font-size": 15.5, "font-weight": 700 });
        SV.tekst(g, x, y + 19, linjer[1], { "font-size": 14, fill: F.svag });
        SV.tekst(g, x, y + 37, linjer[2], { "font-size": 12.5, fill: F.mat });
    }

    function pil(g, x1, x2, y, tekst) {
        SV.el("line", { x1: x1, y1: y, x2: x2 - 12, y2: y, stroke: "#4b5560", "stroke-width": 2.6, "stroke-linecap": "round" }, g);
        SV.el("polygon", { points: x2 + "," + y + " " + (x2 - 14) + "," + (y - 7) + " " + (x2 - 14) + "," + (y + 7), fill: "#4b5560" }, g);
        SV.tekst(g, (x1 + x2) / 2, y + 26, tekst, { "font-size": 13.5, fill: F.svag });
    }

    /* "2+" i Mg²⁺: hvor det staar, maales, saa det gule felt passer */
    var MGT = (function () {
        var bMg = NK.tekstBredde("Mg", 70, 700), bL = NK.tekstBredde("2+", 42, 700);
        var x0 = MG.x + MG.b / 2 - (bMg + bL) / 2;
        return { mgX: x0, lX: x0 + bMg + 2, lB: bL, y: MG.y + 118 };
    }());

    NK.FIGURER.ioner = {
        vb: [1000, 600],
        lag: [
            { navn: "Atomer bliver til ioner", pladser: ["ion", "positiv ion", "negativ ion", "ladning"],
              ros: "Natrium afgiver en elektron og bliver positiv. Chlor optager en elektron og bliver negativ." }
        ],
        pladser: [
            { id: "ion", ord: ["ion"], x: IX, y: KORT.y, maal: [IX, KORT.y], titel: true, dele: ["kort"],
              omr: [{ r: [KORT.x - 6, KORT.y - 6, KORT.b + 12, KORT.h + 12, 18], tom: true }],
              fejl: { "positiv ion": "<b>positiv ion</b> passer kun på natriumionen. Kortet rummer både en positiv og en negativ ion.",
                      "negativ ion": "<b>negativ ion</b> passer kun på chloridionen. Kortet rummer både en positiv og en negativ ion." } },
            { id: "positiv ion", ord: ["positiv ion"], x: IX, y: NA.y + KLAMME + 16, maal: [IX, NA.y + KLAMME + 6], titel: true, dele: ["naion"],
              omr: [{ r: [IX - KLAMME - 8, NA.y - KLAMME - 8, 2 * KLAMME + 40, 2 * KLAMME + 14, 12] }],
              fejl: { "negativ ion": "<b>negativ ion</b> har flere elektroner end protoner. Natriumionen har 11 protoner og kun 10 elektroner.",
                      ladning: "<b>ladning</b> er kun tallet og tegnet, for eksempel +. Pladsen gælder hele natriumionen." } },
            { id: "negativ ion", ord: ["negativ ion"], x: IX, y: CL.y + KLAMME + 16, maal: [IX, CL.y + KLAMME + 6], titel: true, dele: ["clion"],
              omr: [{ r: [IX - KLAMME - 8, CL.y - KLAMME - 8, 2 * KLAMME + 40, 2 * KLAMME + 14, 12] }],
              fejl: { "positiv ion": "<b>positiv ion</b> har afgivet elektroner. Chloratomet har optaget en elektron.",
                      ladning: "<b>ladning</b> er kun tallet og tegnet, for eksempel −. Pladsen gælder hele chloridionen." } },
            { id: "ladning", ord: ["ladning"], x: MG.x + MG.b / 2, y: 150, maal: [MGT.lX + MGT.lB / 2, MGT.y - 62], dele: ["mg"],
              omr: [{ r: [MGT.lX - 6, MGT.y - 62, MGT.lB + 12, 42, 8] }],
              fejl: { "positiv ion": "<b>positiv ion</b> er hele partiklen. Pladsen peger kun på 2+ efter atomsymbolet.",
                      ion: "<b>ion</b> er hele partiklen. Pladsen peger kun på 2+ efter atomsymbolet." } }
        ],

        tegn: function (api) {
            /* Kortet med ionerne staar bagest */
            api.del("kort", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: KORT.x, y: KORT.y, width: KORT.b, height: KORT.h, rx: 16, fill: "#f3f8f7", stroke: "#8fc7bb", "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            /* Atomerne og elektronerne staar der fra start */
            api.del("atomer", {
                lag: 0, auto: true,
                fuld: function (g) {
                    skalTegning(g, AX, NA.y, "11+", [2, 8, 1]);
                    tekster(g, AX, NA.y + 96, ["natriumatom, Na", "(2, 8, 1)", "11 protoner, 11 elektroner"]);
                    pil(g, 205, KORT.x - 14, NA.y, "afgiver 1 elektron");
                    SV.tekst(g, KORT.x + KORT.b + 26, NA.y + 8, "+", { "font-size": 26, fill: F.svag });
                    SV.kugle(g, KORT.x + KORT.b + 62, NA.y, 9, "elektron", "−");
                    SV.tekst(g, KORT.x + KORT.b + 62, NA.y + 32, "elektron", { "font-size": 13.5, fill: F.svag });

                    skalTegning(g, AX, CL.y, "17+", [2, 8, 7]);
                    tekster(g, AX, CL.y + 96, ["chloratom, Cl", "(2, 8, 7)", "17 protoner, 17 elektroner"]);
                    SV.tekst(g, 207, CL.y + 8, "+", { "font-size": 26, fill: F.svag });
                    SV.kugle(g, 236, CL.y, 9, "kalium", "−");
                    pil(g, 258, KORT.x - 14, CL.y, "optager 1 elektron");
                }
            });

            api.del("naion", {
                lag: 0,
                fuld: function (g) {
                    var e = skalTegning(g, IX, NA.y, "11+", [2, 8], { tabt: true });
                    var k = klamme(g, IX, NA.y, F.roed, "+");
                    tekster(g, IX, NA.y + KLAMME + 58, ["natriumion, Na⁺", "(2, 8)", "11 protoner, 10 elektroner"]);
                    return { e: e, k: k };
                },
                byg: function (g, r, an) {
                    an.streg(r.k.a, 0, 450);
                    an.streg(r.k.b, 0, 450);
                    an.pop(r.k.t, 450, 450);
                }
            });

            api.del("clion", {
                lag: 0,
                fuld: function (g) {
                    var e = skalTegning(g, IX, CL.y, "17+", [2, 8, 8], { ny: true });
                    var k = klamme(g, IX, CL.y, F.blaa, "−");
                    tekster(g, IX, CL.y + KLAMME + 58, ["chloridion, Cl⁻", "(2, 8, 8)", "17 protoner, 18 elektroner"]);
                    return { e: e, k: k };
                },
                byg: function (g, r, an) {
                    an.pop(r.e[r.e.length - 1], 0, 450);
                    an.streg(r.k.a, 200, 450);
                    an.streg(r.k.b, 200, 450);
                    an.pop(r.k.t, 650, 450);
                }
            });

            api.del("mg", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: MG.x, y: MG.y, width: MG.b, height: MG.h, rx: 14, fill: "#fbf3f1", stroke: "#e3b3ab", "stroke-width": 1.6 }, g);
                    SV.tekst(g, MGT.mgX, MGT.y, "Mg", { "font-size": 70, "font-weight": 700, "text-anchor": "start" });
                    var l = SV.tekst(g, MGT.lX, MGT.y - 30, "2+", { "font-size": 42, "font-weight": 700, fill: F.roed, "text-anchor": "start" });
                    SV.tekst(g, MG.x + MG.b / 2, MG.y + MG.h - 22, "magnesiumion", { "font-size": 14, fill: F.mat, "font-style": "italic" });
                    return { l: l };
                },
                byg: function (g, r, an) { an.pop(r.l, 0, 520); }
            });
        }
    };
}());

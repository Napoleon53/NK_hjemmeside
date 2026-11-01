/* =====================================================================
   fig_forb.js - figuren til 2.3 Ionforbindelser

   Til venstre en skaal med koekkensalt (salt og ionforbindelse er to
   navne for det samme og staar som et par: [ ] eller [ ]). I midten et lag af
   iongitteret som i bogens figur iongitter, med én formelenhed (én Na⁺
   og én Cl⁻) i en stiplet ramme. Til hoejre en natriumion og en
   chloridion, der tiltraekker hinanden (ionbinding).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var SKAAL = { x: 210, y: 250 };                 /* skaalens midte, foroven */
    var GIT = { x: 360, y: 118, n: 5, d: 54 };     /* gitteret: oeverste venstre midte og afstand */
    var GB = (GIT.n - 1) * GIT.d;                  /* afstand fra foerste til sidste midte */
    var ZOOM = { x: 700, y: 140, b: 280, h: 240 };
    var NA_R = 15, CL_R = 26;

    function gitterPos(i, j) { return { x: GIT.x + 24 + j * GIT.d, y: GIT.y + 24 + i * GIT.d, na: (i + j) % 2 === 1 }; }

    /* Formelenheden: Na⁺ og Cl⁻ nederst til hoejre */
    var FE = (function () {
        var a = gitterPos(GIT.n - 1, GIT.n - 2), b = gitterPos(GIT.n - 1, GIT.n - 1);
        return { x: a.x - CL_R - 6, y: a.y - CL_R - 6, b: b.x - a.x + 2 * CL_R + 12, h: 2 * CL_R + 12 };
    }());
    var GR = { x: GIT.x - 8, y: GIT.y - 8, b: GB + 48 + 16, h: GB + 48 + 16 };   /* gitterets kort */

    /* Pilene mellem ionerne i forstoerrelsen */
    var PIL = { x1: ZOOM.x + 104, x2: ZOOM.x + 170, y: ZOOM.y + 118 };

    NK.FIGURER.forb = {
        vb: [1000, 560],
        lag: [
            { navn: "Salt og iongitter", pladser: ["salt1", "salt2", "iongitter"],
              ros: "Køkkensalt er en ionforbindelse, og ionerne sidder skiftevis i et regelmæssigt gitter." },
            { navn: "Binding og formelenhed", pladser: ["ionbinding", "formelenhed"], ekstra: ["sammensat ion"],
              ros: "Ionerne holdes sammen af tiltrækningen, og formlen NaCl viser forholdet 1 : 1." }
        ],
        pladser: [
            { id: "salt1", ord: ["salt", "ionforbindelse"], par: "salt2", x: SKAAL.x, y: 70, maal: [SKAAL.x, SKAAL.y - 70], dele: ["salt"],
              omr: [{ r: [SKAAL.x - 118, SKAAL.y - 74, 236, 152, 16] }],
              fejl: { iongitter: "<b>iongitter</b> er mønsteret, ionerne sidder i. Pladsen peger på selve stoffet i skålen." } },
            { id: "salt2", ord: ["salt", "ionforbindelse"], x: SKAAL.x, y: 70, maal: [SKAAL.x, SKAAL.y - 70], dele: ["korn"],
              omr: [{ r: [SKAAL.x - 118, SKAAL.y - 74, 236, 152, 16] }],
              fejl: { iongitter: "<b>iongitter</b> er mønsteret, ionerne sidder i. Pladsen peger på selve stoffet i skålen." } },
            { id: "iongitter", ord: ["iongitter"], x: 566, y: 40, maal: [GR.x + GR.b / 2, GR.y - 6], dele: ["gitter"],
              omr: [{ r: [GR.x - 6, GR.y - 6, GR.b + 12, GR.b + 12, 16], tom: true }],
              fejl: { salt: "<b>salt</b> er selve stoffet. Pladsen peger på mønsteret, som ionerne sidder i.",
                      ionforbindelse: "<b>ionforbindelse</b> er selve stoffet. Pladsen peger på mønsteret, som ionerne sidder i." } },
            { id: "formelenhed", ord: ["formelenhed"], x: FE.x + FE.b / 2 - 40, y: 492, maal: [FE.x + FE.b / 2, FE.y + FE.h], dele: ["fe"],
              omr: [{ r: [FE.x, FE.y, FE.b, FE.h, 10] }],
              fejl: { ionbinding: "<b>ionbinding</b> er tiltrækningen mellem ionerne. Rammen viser den mindste portion: én Na⁺ og én Cl⁻.",
                      "sammensat ion": "<b>sammensat ion</b> er atomer med én fælles ladning, fx NO₃⁻. I rammen sidder to ioner med hver sin ladning." } },
            { id: "ionbinding", ord: ["ionbinding"], x: ZOOM.x + ZOOM.b / 2, y: 452, maal: [(PIL.x1 + PIL.x2) / 2, PIL.y + 20], dele: ["binding"],
              omr: [{ r: [PIL.x1 - 6, PIL.y - 20, PIL.x2 - PIL.x1 + 12, 40, 8] }],
              fejl: { formelenhed: "<b>formelenhed</b> er en portion af saltet. Pladsen peger på pilene mellem de to ioner.",
                      "sammensat ion": "<b>sammensat ion</b> er en gruppe atomer med én fælles ladning. Pladsen peger på pilene mellem to ioner." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: skaalen og gitteret ----------------------------------- */
            api.del("salt", {
                lag: 0,
                fuld: function (g) { return skaal(g); },
                byg: function (g, r, an) { r.korn.forEach(function (k, i) { an.pop(k, i * 25, 320); }); }
            });

            /* Den anden plads til salt bygger navnet under skaalen */
            api.del("korn", {
                lag: 0,
                fuld: function (g) {
                    return { t: SV.tekst(g, SKAAL.x, SKAAL.y + 108, "køkkensalt, NaCl", { "font-size": 15, "font-weight": 700, fill: F.svag }) };
                },
                byg: function (g, r, an) { an.fade(r.t, 0, 500); }
            });

            api.del("lup", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
                    SV.el("circle", { cx: SKAAL.x + 40, cy: SKAAL.y - 30, r: 9, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.4 }, g);
                    SV.el("line", Object.assign({ x1: SKAAL.x + 48, y1: SKAAL.y - 36, x2: GR.x, y2: GR.y + 10 }, s), g);
                    SV.el("line", Object.assign({ x1: SKAAL.x + 48, y1: SKAAL.y - 24, x2: GR.x, y2: GR.y + GR.h - 10 }, s), g);
                }
            });

            api.del("gitter", {
                lag: 0,
                fuld: function (g) {
                    SV.el("rect", { x: GR.x, y: GR.y, width: GR.b, height: GR.h, rx: 14, fill: "#f4f7fb", stroke: "#c7d2df", "stroke-width": 1.5 }, g);
                    var k = [];
                    /* Chloridionerne foerst, saa natriumionerne ligger ovenpaa */
                    [false, true].forEach(function (na) {
                        for (var i = 0; i < GIT.n; i++) for (var j = 0; j < GIT.n; j++) {
                            var p = gitterPos(i, j);
                            if (p.na !== na) continue;
                            var kk = na ? SV.kugle(g, p.x, p.y, NA_R, "proton", "Na^+") : SV.kugle(g, p.x, p.y, CL_R, "elektron", "Cl^−");
                            k.push({ k: kk, i: i, j: j });
                        }
                    });
                    SV.tekst(g, GR.x + 4, GR.y + GR.h + 22, "et lag i iongitteret", { "font-size": 13.5, fill: F.mat, "font-style": "italic", "text-anchor": "start" });
                    return { k: k };
                },
                byg: function (g, r, an) { r.k.forEach(function (x) { an.pop(x.k, (x.i + x.j) * 60, 340); }); }
            });

            /* ----- Lag 2: formelenheden og ionbindingen ------------------------- */
            api.del("fe", {
                lag: 1,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: FE.x, y: FE.y, width: FE.b, height: FE.h, rx: 10, fill: "none", stroke: F.groen, "stroke-width": 3, "stroke-dasharray": "7 5" }, g) };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 700); }
            });

            api.del("binding", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: ZOOM.x, y: ZOOM.y, width: ZOOM.b, height: ZOOM.h, rx: 14, fill: "#f7f9fb", stroke: "#d4dbe2", "stroke-width": 1.5 }, g);
                    SV.kugle(g, ZOOM.x + 62, PIL.y, 30, "proton", "Na^+");
                    SV.kugle(g, ZOOM.x + 216, PIL.y, 46, "elektron", "Cl^−");
                    var pile = SV.g(g);
                    var y = PIL.y, x1 = PIL.x1, x2 = PIL.x2, m = (x1 + x2) / 2;
                    SV.el("line", { x1: x1, y1: y, x2: m - 10, y2: y, stroke: F.roed, "stroke-width": 3, "stroke-linecap": "round" }, pile);
                    SV.el("polygon", { points: (m - 2) + "," + y + " " + (m - 13) + "," + (y - 6) + " " + (m - 13) + "," + (y + 6), fill: F.roed }, pile);
                    SV.el("line", { x1: x2, y1: y, x2: m + 10, y2: y, stroke: F.blaa, "stroke-width": 3, "stroke-linecap": "round" }, pile);
                    SV.el("polygon", { points: (m + 2) + "," + y + " " + (m + 13) + "," + (y - 6) + " " + (m + 13) + "," + (y + 6), fill: F.blaa }, pile);
                    SV.tekst(g, m, ZOOM.y + 30, "tiltrækning", { "font-size": 14, "font-weight": 600, fill: F.svag });
                    SV.tekst(g, ZOOM.x + ZOOM.b / 2, ZOOM.y + ZOOM.h - 16, "to ioner med modsat ladning", { "font-size": 13, fill: F.mat, "font-style": "italic" });
                    return { pile: pile };
                },
                byg: function (g, r, an) { an.pop(r.pile, 0, 600); }
            });

            /* ----- Tegnehjaelp ---------------------------------------------- */
            function skaal(g) {
                var x = SKAAL.x, y = SKAAL.y;
                /* Skaalen */
                SV.el("path", { d: "M" + (x - 110) + "," + y + " Q" + (x - 100) + "," + (y + 74) + " " + x + "," + (y + 76) + " Q" + (x + 100) + "," + (y + 74) + " " + (x + 110) + "," + y + " Z",
                    fill: "#e7eef5", stroke: "#8fa3b5", "stroke-width": 2, filter: "url(#skygge)" }, g);
                SV.el("ellipse", { cx: x, cy: y, rx: 110, ry: 14, fill: "#d3dee8", stroke: "#8fa3b5", "stroke-width": 2 }, g);
                /* Saltkornene: smaa hvide terninger i en bunke */
                var korn = [];
                /* Raekker nedefra: antal korn, halv bredde og hoejde over skaalen */
                [[9, 84, -2], [7, 64, -16], [5, 44, -30], [3, 24, -44], [1, 0, -58]].forEach(function (r, ri) {
                    for (var i = 0; i < r[0]; i++) {
                        var kx = r[0] === 1 ? x : x - r[1] + i * (2 * r[1]) / (r[0] - 1);
                        korn.push(terning(g, kx, y + r[2] + ((i * 3 + ri) % 3) - 1, 9 + ((i + ri) % 3)));
                    }
                });
                return { korn: korn };
            }

            function terning(g, x, y, s) {
                var gg = SV.g(g);
                SV.el("path", { d: "M" + x + "," + (y - s) + " l" + s + "," + (s * 0.5) + " l0," + s + " l" + (-s) + "," + (s * 0.5) + " l" + (-s) + "," + (-s * 0.5) + " l0," + (-s) + " Z", fill: "#ffffff", stroke: "#aab6c2", "stroke-width": 0.9 }, gg);
                SV.el("path", { d: "M" + x + "," + (y - s) + " l" + s + "," + (s * 0.5) + " l" + (-s) + "," + (s * 0.5) + " l" + (-s) + "," + (-s * 0.5) + " Z", fill: "#f3f6f9", stroke: "#aab6c2", "stroke-width": 0.9 }, gg);
                return gg;
            }
        }
    };
}());

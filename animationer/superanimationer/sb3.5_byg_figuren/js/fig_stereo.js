/* =====================================================================
   fig_stereo.js - figuren til B3.4 Stereoisomeri

   Til venstre fællesnavnet stereoisomerer med en gren til to dele.
   Øverst en ramme med titlen cis-trans-isomeri om to kort, som i bogen,
   hvor "Z og E" er et underafsnit under cis-trans-isomeri:
   - bogens b3-cis-trans: cis-but-2-en og trans-but-2-en med den
     stiplede linje langs dobbeltbindingen. Pladserne er cis-form og
     trans-form.
   - bogens b3-z-e: 1-brom-2-chlorprop-1-en i to udgaver med fire
     forskellige grupper og bogens røde ringe med 1 ved Br og Cl, de
     vigtigste grupper. Pladserne er Z og E.
   Bogens navne (cis-but-2-en, (Z)-1-brom-2-chlorprop-1-en ...) og
   teksterne "methylgrupperne sidder på samme side" og "de to vigtigste
   grupper på samme side" er taget af, fordi de afslører pladserne.
   Nederst bogens b3-rs-maelkesyre: de to spejlbilledformer af mælkesyre
   med numrene 1 til 4 (prioritet), stjernen ved det asymmetriske
   carbonatom og buepilen. Bogens R og S i ringe og ordet "spejl" er
   taget af.
   Brugeren 2. nov. 2026 om den første udgave, hvor cis og Z stod som par:
   "cis og trans bliver lidt præsenteret som synonymer for Z og E.. men
   det er jo ikke tilfældet.. synes Z og E skal præsenteres på en separat
   figur, hvor der er 4 forskellige bindinger."
   Elleve fagord i fire lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var F = ORG.F;

    var GX = 316;                                         /* grenen fra stereoisomerer */
    var FR = { x: 330, y: 24, b: 816, h: 394 };           /* rammen om cis-trans-isomeri */
    var KA = { x: 346, y: 46, b: 784, h: 176 };           /* but-2-en */
    var KB = { x: 346, y: 232, b: 784, h: 176 };          /* Z og E */
    var K2 = { x: 330, y: 438, b: 816, h: 292 };          /* spejlbilledisomerer */
    var KM = FR.x + FR.b / 2;
    var NODE = { x: 157, y: (FR.y + K2.y + K2.h) / 2 };
    var MX = [KM - 205, KM + 205], BL = 42;               /* molekylerne i de to kort */
    var AY = KA.y + 66, BY = KB.y + 66;                   /* dobbeltbindingernes hoejde */
    var SY_A = KA.y + 150, SY_B = KB.y + 150;             /* pladserne under molekylerne */

    /* Maelkesyre */
    var SUB = [{ x: 378, y: 466, b: 340, h: 246 }, { x: 758, y: 466, b: 340, h: 246 }];
    var MC = [[SUB[0].x + SUB[0].b / 2, SUB[0].y + 140], [SUB[1].x + SUB[1].b / 2, SUB[1].y + 140]];
    var ML = 46, MFS = 19, BUE = 84, NRA = 66;
    /* Grupperne: vinkel (grader), bindingens slags og nummer efter prioritet */
    var GR = [{ t: "COOH", v: -90, s: "plan", n: 2 }, { t: "OH", v: 152, s: "plan", n: 1 }, { t: "CH_3", v: 62, s: "kile", n: 3 }, { t: "H", v: 12, s: "stribe", n: 4 }];
    var NRV = { 2: -41, 1: 23, 3: 23, 4: -25 };          /* numrenes forskydning fra bindingen */

    function retning(v, spejl) { var e = ORG.enhed(v); return [spejl ? -e[0] : e[0], e[1]]; }
    function nummerPunkt(i, gr) {
        /* Gruppen foroven har sit nummer oppe til venstre i begge former,
           fordi COOH skrives mod hoejre (som i bogen) */
        var spejl = i === 1, d = gr.n === 2 ? retning(gr.v + NRV[gr.n], false) : retning(gr.v + NRV[gr.n], spejl);
        return [MC[i][0] + d[0] * NRA, MC[i][1] + d[1] * NRA];
    }

    /* Et carbonatom med fire grupper tegnet rumligt (bogens b4_tetra) */
    var VEND = { "CH_3": "H_3C", "OH": "HO", "COOH": "HOOC" };
    function tetra(g, i) {
        var spejl = i === 1, cx = MC[i][0], cy = MC[i][1], gab = 0.6 * MFS;
        GR.forEach(function (gr) {
            var d = retning(gr.v, spejl);
            var x1 = cx + d[0] * gab, y1 = cy + d[1] * gab, x2 = cx + d[0] * ML, y2 = cy + d[1] * ML;
            if (gr.s === "plan") SV.el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: F.blaek, "stroke-width": 2.6, "stroke-linecap": "round" }, g);
            else ORG.kile(g, x1, y1, x2, y2, gr.s === "kile", F.blaek, 10);
            var tx = x2 + d[0] * 0.62 * MFS, ty = y2 + d[1] * 0.62 * MFS, anker = "middle", t = gr.t;
            if (t.length > 1) {
                if (d[0] < -0.3) { anker = "end"; tx += 0.37 * MFS; t = VEND[t] || t; }
                else if (d[0] > 0.3) { anker = "start"; tx -= 0.37 * MFS; }
                else { anker = "start"; tx -= NK.tekstBredde(t.charAt(0), MFS, 700) / 2; }
            }
            SV.tekst(g, tx, ty + 0.35 * MFS, t, { "font-size": MFS, "font-weight": 700, fill: F.blaek, "text-anchor": anker });
        });
        SV.tekst(g, cx, cy + 0.35 * MFS, "C", { "font-size": MFS, "font-weight": 700, fill: F.blaek });
    }

    /* En alken: C=C vandret med midten i (x, y) og grupperne
       [oppe til venstre, oppe til hoejre, nede til venstre, nede til hoejre].
       o.farve: grupper, der skal have farve; o.ring: grupper med en roed ring og 1. */
    function alken(g, x, y, grupper, o) {
        o = o || {};
        var c1 = [x - 22, y], c2 = [x + 22, y];
        var pos = [ORG.fra(c1, BL, -120), ORG.fra(c2, BL, -60), ORG.fra(c1, BL, 120), ORG.fra(c2, BL, 60)];
        SV.el("line", { x1: x - 80, y1: y, x2: x + 80, y2: y, stroke: "#9aa9a8", "stroke-width": 1.3, "stroke-dasharray": "5 5" }, g);
        var at = [[c1[0], c1[1]], [c2[0], c2[1]]];
        grupper.forEach(function (t, k) {
            var venstre = k % 2 === 0, ao = {};
            if (t === "CH_3") { ao.anker = venstre ? "end" : "start"; if (venstre) t = "H_3C"; }
            if (o.farve && o.farve.indexOf(k) >= 0) ao.farve = F.accent;
            at.push([pos[k][0], pos[k][1], t, ao]);
            if (o.ring && o.ring.indexOf(k) >= 0) {
                var rx = pos[k][0] + (venstre ? -30 : 30), ry = pos[k][1];
                SV.el("circle", { cx: rx, cy: ry, r: 10, fill: "#ffffff", stroke: F.pos, "stroke-width": 1.8 }, g);
                ORG.t(g, rx, ry + 5, "1", { fs: 13.5, fed: true, farve: F.pos });
            }
        });
        ORG.skelet(g, at, [[0, 1, 2, 0], [0, 2], [1, 3], [0, 4], [1, 5]], { fs: 20 });
    }

    var KTEKST_A = "<b>cis-trans-isomeri</b> er titlen på hele rammen. Pladsen spørger om navnet på netop dette molekyle.";
    var FIRE = "Z og E hører til molekylerne med fire forskellige grupper.";
    function molPlads(id, x, y, kort, dele, fejl) {
        return { id: id, ord: [id], x: x, y: y, maal: [x, y - 17 - 12], dele: dele,
            omr: [{ r: [x - 93, kort.y + 10, 186, 112, 14] }], fejl: fejl };
    }
    function rs(id, i, dele, fejl) {
        var u = SUB[i];
        return { id: id, ord: [id], x: u.x + u.b / 2, y: u.y + u.h, maal: [u.x + u.b / 2, u.y + u.h], titel: true, dele: dele,
            omr: [{ r: [u.x - 5, u.y - 5, u.b + 10, u.h + 10, 16], tom: true }], fejl: fejl };
    }

    NK.FIGURER.stereo = {
        vb: [1160, 740],
        lag: [
            { navn: "Cis og trans", pladser: ["cis-trans-isomeri", "cis-form", "trans-form"],
              ros: "En dobbeltbinding kan ikke drejes. I cis-formen sidder de to grupper på samme side, i trans-formen på hver sin side." },
            { navn: "Z og E", pladser: ["Z", "E"],
              ros: "Med fire forskellige grupper bruges Z og E. Z har de vigtigste grupper på samme side, E på hver sin side." },
            { navn: "Spejlbilleder", pladser: ["spejlbilledisomerer", "asymmetrisk carbonatom", "prioritet"],
              ros: "Mælkesyre har et asymmetrisk carbonatom med fire forskellige grupper og findes som to spejlbilledisomerer." },
            { navn: "R og S", pladser: ["R-form", "S-form", "stereoisomerer"],
              ros: "Følger 1, 2 og 3 hinanden med uret, er det R-form, og mod uret S-form. Begge dele viser stereoisomerer." }
        ],
        pladser: [
            { id: "cis-trans-isomeri", ord: ["cis-trans-isomeri"], x: KM, y: FR.y, maal: [KM, FR.y], titel: true, dele: ["ramme"],
              omr: [{ r: [FR.x - 5, FR.y - 5, FR.b + 10, FR.h + 10, 18], tom: true }],
              fejl: { spejlbilledisomerer: "<b>spejlbilledisomerer</b> er hinandens spejlbilleder. Rammen her viser dobbeltbindinger, der ikke kan drejes.",
                      stereoisomerer: "<b>stereoisomerer</b> er fællesnavnet for begge dele. Her er navnet på den slags, der findes ved en dobbeltbinding.",
                      "cis-form": "<b>cis-form</b> er kun én udgave. Rammens titel gælder alle fire molekyler med en dobbeltbinding.",
                      "trans-form": "<b>trans-form</b> er kun én udgave. Rammens titel gælder alle fire molekyler med en dobbeltbinding.",
                      Z: "<b>Z</b> er kun én udgave. Rammens titel gælder alle fire molekyler med en dobbeltbinding.",
                      E: "<b>E</b> er kun én udgave. Rammens titel gælder alle fire molekyler med en dobbeltbinding." } },
            molPlads("cis-form", MX[0], SY_A, KA, ["cis"], {
                "trans-form": "<b>trans-form</b> har grupperne på hver sin side. Her sidder de to CH₃ på samme side af dobbeltbindingen.",
                Z: "<b>Z</b> passer også på but-2-en. Pladsen spørger om ordet, når de to grupper er ens. " + FIRE,
                E: "<b>E</b> har de vigtigste grupper på hver sin side. Her sidder de to CH₃ på samme side af dobbeltbindingen.",
                "cis-trans-isomeri": KTEKST_A }),
            molPlads("trans-form", MX[1], SY_A, KA, ["trans"], {
                "cis-form": "<b>cis-form</b> har grupperne på samme side. Her sidder de to CH₃ på hver sin side af dobbeltbindingen.",
                E: "<b>E</b> passer også på but-2-en. Pladsen spørger om ordet, når de to grupper er ens. " + FIRE,
                Z: "<b>Z</b> har de vigtigste grupper på samme side. Her sidder de to CH₃ på hver sin side af dobbeltbindingen.",
                "cis-trans-isomeri": KTEKST_A }),

            molPlads("Z", MX[0], SY_B, KB, ["z"], {
                "cis-form": "<b>cis-form</b> bruges kun, når det er let at se, hvilke to grupper der sammenlignes. Her er der fire forskellige grupper.",
                "trans-form": "<b>trans-form</b> bruges kun, når det er let at se, hvilke to grupper der sammenlignes. Her er der fire forskellige grupper.",
                E: "<b>E</b> har de vigtigste grupper på hver sin side. Her sidder Br og Cl på samme side af dobbeltbindingen.",
                prioritet: "<b>prioritet</b> er rækkefølgen af grupperne. Pladsen spørger om bogstavet for hele molekylet." }),
            molPlads("E", MX[1], SY_B, KB, ["e"], {
                "trans-form": "<b>trans-form</b> bruges kun, når det er let at se, hvilke to grupper der sammenlignes. Her er der fire forskellige grupper.",
                "cis-form": "<b>cis-form</b> bruges kun, når det er let at se, hvilke to grupper der sammenlignes. Her er der fire forskellige grupper.",
                Z: "<b>Z</b> har de vigtigste grupper på samme side. Her sidder Br og Cl på hver sin side af dobbeltbindingen.",
                prioritet: "<b>prioritet</b> er rækkefølgen af grupperne. Pladsen spørger om bogstavet for hele molekylet." }),

            { id: "spejlbilledisomerer", ord: ["spejlbilledisomerer"], x: KM, y: K2.y, maal: [KM, K2.y], titel: true, dele: ["hoved2"],
              omr: [{ r: [K2.x - 5, K2.y - 5, K2.b + 10, K2.h + 10, 18], tom: true }],
              fejl: { "cis-trans-isomeri": "<b>cis-trans-isomeri</b> findes ved en dobbeltbinding. Mælkesyre har et carbonatom med fire forskellige grupper.",
                      stereoisomerer: "<b>stereoisomerer</b> er fællesnavnet for begge dele. Her er navnet på de to molekyler, der er hinandens spejlbilleder.",
                      "R-form": "<b>R-form</b> er kun den ene af de to former. Kortets titel gælder begge molekyler af mælkesyre.",
                      "S-form": "<b>S-form</b> er kun den ene af de to former. Kortets titel gælder begge molekyler af mælkesyre.",
                      "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er ét atom. Kortets titel gælder de to molekyler, der er hinandens spejlbilleder." } },
            { id: "asymmetrisk carbonatom", ord: ["asymmetrisk carbonatom"], x: SUB[0].x + SUB[0].b / 2, y: SUB[0].y + 30, maal: [MC[0][0] - 16, MC[0][1] - 18], dele: ["stjerne"],
              omr: [{ c: [MC[0][0], MC[0][1], 19] }],
              fejl: { prioritet: "<b>prioritet</b> er numrene på de fire grupper. Pladsen peger på carbonatomet i midten.",
                      spejlbilledisomerer: "<b>spejlbilledisomerer</b> er to hele molekyler. Pladsen peger kun på carbonatomet i midten.",
                      "R-form": "<b>R-form</b> er hele molekylet til venstre. Pladsen peger kun på carbonatomet i midten.",
                      "S-form": "<b>S-form</b> er molekylet til højre. Pladsen peger på carbonatomet i midten af molekylet til venstre." } },
            { id: "prioritet", ord: ["prioritet"], x: SUB[1].x + SUB[1].b / 2, y: SUB[1].y + 30, maal: [0, 0], dele: ["numre"],
              fejl: { "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er carbonatomet i midten. Pladsen peger på numrene 1 til 4 ved grupperne.",
                      "R-form": "<b>R-form</b> er navnet på et helt molekyle. Pladsen peger på numrene 1 til 4 ved de fire grupper.",
                      "S-form": "<b>S-form</b> er navnet på et helt molekyle. Pladsen peger på numrene 1 til 4 ved de fire grupper.",
                      Z: "<b>Z</b> er et bogstav for en alken. Pladsen peger på numrene 1 til 4 ved de fire grupper i mælkesyre.",
                      E: "<b>E</b> er et bogstav for en alken. Pladsen peger på numrene 1 til 4 ved de fire grupper i mælkesyre." } },
            rs("R-form", 0, ["bueR"], {
                "S-form": "<b>S-form</b> går mod uret. I molekylet til venstre følger 1, 2 og 3 hinanden med uret.",
                prioritet: "<b>prioritet</b> er numrene ved grupperne. Skiltet er navnet på hele molekylet til venstre.",
                "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er ét atom. Skiltet er navnet på hele molekylet til venstre.",
                spejlbilledisomerer: "<b>spejlbilledisomerer</b> er begge molekyler. Skiltet er navnet på kun molekylet til venstre." }),
            rs("S-form", 1, ["bueS"], {
                "R-form": "<b>R-form</b> går med uret. I molekylet til højre følger 1, 2 og 3 hinanden mod uret.",
                prioritet: "<b>prioritet</b> er numrene ved grupperne. Skiltet er navnet på hele molekylet til højre.",
                "asymmetrisk carbonatom": "<b>asymmetrisk carbonatom</b> er ét atom. Skiltet er navnet på hele molekylet til højre.",
                spejlbilledisomerer: "<b>spejlbilledisomerer</b> er begge molekyler. Skiltet er navnet på kun molekylet til højre." }),
            { id: "stereoisomerer", ord: ["stereoisomerer"], x: NODE.x, y: NODE.y, maal: [GX - 12, NODE.y], titel: true, dele: ["gren"],
              omr: [{ r: [GX - 11, FR.y + FR.h / 2 - 10, 26, K2.y + K2.h / 2 - FR.y - FR.h / 2 + 20, 10] }],
              fejl: { "cis-trans-isomeri": "<b>cis-trans-isomeri</b> er kun rammen foroven. Overskriften gælder begge dele.",
                      spejlbilledisomerer: "<b>spejlbilledisomerer</b> er kun kortet forneden. Overskriften gælder begge dele." } }
        ],

        tegn: function (api) {
            ORG.defs();

            /* Numrene er foerst kendt nu: prioritetens felter og prik (molekylet til hoejre) */
            var pr = this.pladser.filter(function (p) { return p.id === "prioritet"; })[0];
            pr.omr = GR.map(function (gr) { var q = nummerPunkt(1, gr); return { c: [q[0], q[1], 15] }; });
            var n2 = nummerPunkt(1, GR[0]);
            pr.maal = [n2[0] + 10, n2[1] - 10];

            /* Et kort med stoffets navn i midten mellem de to udgaver */
            function kort(g, k, navn) {
                SV.el("rect", { x: k.x, y: k.y, width: k.b, height: k.h, rx: 14, fill: "#ffffff", stroke: "#d3dde4", "stroke-width": 1.2 }, g);
                ORG.t(g, KM, k.y + 71, navn, { fs: 13.5, fed: true, farve: F.accent });
            }

            /* ----- Lag 1: rammen og but-2-en ------------------------------------ */
            api.del("base1", {
                lag: 0, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, FR.x, FR.y, FR.b, FR.h);
                    kort(g, KA, "but-2-en");
                }
            });
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: FR.x, y: FR.y, width: FR.b, height: FR.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("cis", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    alken(gg, MX[0], AY, ["CH_3", "CH_3", "H", "H"], { farve: [0, 1] });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("trans", {
                lag: 0,
                fuld: function (g) {
                    var gg = SV.g(g);
                    alken(gg, MX[1], AY, ["CH_3", "H", "H", "CH_3"], { farve: [0, 3] });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 2: Z og E -------------------------------------------------- */
            api.del("baseZE", {
                lag: 1, auto: true,
                fuld: function (g) {
                    kort(g, KB, "1-brom-2-chlorprop-1-en");
                }
            });
            api.del("z", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); alken(gg, MX[0], BY, ["Br", "Cl", "H", "CH_3"], { ring: [0, 1] }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });
            api.del("e", {
                lag: 1,
                fuld: function (g) { var gg = SV.g(g); alken(gg, MX[1], BY, ["Br", "CH_3", "H", "Cl"], { ring: [0, 3] }); return { g: gg }; },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 3: spejlbillederne ----------------------------------------- */
            api.del("base2", {
                lag: 2, auto: true,
                fuld: function (g) {
                    ORG.kortB(g, K2.x, K2.y, K2.b, K2.h);
                    SUB.forEach(function (u, i) {
                        SV.el("rect", { x: u.x, y: u.y, width: u.b, height: u.h, rx: 14, fill: "#ffffff", stroke: "#d3dde4", "stroke-width": 1.2 }, g);
                        tetra(g, i);
                    });
                    SV.el("line", { x1: KM, y1: SUB[0].y + 6, x2: KM, y2: SUB[0].y + SUB[0].h - 6, stroke: "#7d8e8d", "stroke-width": 1.6, "stroke-dasharray": "7 6" }, g);
                }
            });
            api.del("hoved2", {
                lag: 2,
                fuld: function (g) {
                    return { r: SV.el("rect", { x: K2.x, y: K2.y, width: K2.b, height: K2.h, rx: 16, fill: "none", stroke: F.accent, "stroke-width": 2 }, g) };
                },
                byg: function (g, r, an) { an.fade(g, 0, 450); }
            });
            api.del("stjerne", {
                lag: 2,
                fuld: function (g) {
                    return { t: ORG.t(g, MC[0][0] - 15, MC[0][1] - 9, "*", { fs: 26, fed: true, farve: F.pos }) };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); }
            });
            api.del("numre", {
                lag: 2,
                fuld: function (g) {
                    var gg = SV.g(g);
                    [0, 1].forEach(function (i) { GR.forEach(function (gr) { var q = nummerPunkt(i, gr); ORG.nummer(gg, q[0], q[1], gr.n, 11); }); });
                    return { g: gg };
                },
                byg: function (g, r, an) { an.pop(r.g, 0, 450); }
            });

            /* ----- Lag 4: R og S og grenen ---------------------------------------- */
            api.del("bueR", {
                lag: 3,
                fuld: function (g) { return { b: ORG.bue(g, MC[0][0], MC[0][1], BUE, 168, 412, F.accent, 2.6) }; },
                byg: function (g, r, an) { an.fade(r.b, 0, 500); }
            });
            api.del("bueS", {
                lag: 3,
                fuld: function (g) { return { b: ORG.bue(g, MC[1][0], MC[1][1], BUE, 12, -232, F.accent, 2.6) }; },
                byg: function (g, r, an) { an.fade(r.b, 0, 500); }
            });
            api.del("gren", {
                lag: 3,
                fuld: function (g) {
                    var y1 = FR.y + FR.h / 2, y2 = K2.y + K2.h / 2;
                    var s = [SV.el("polyline", { points: (NODE.x + 143) + "," + NODE.y + " " + GX + "," + NODE.y, fill: "none", stroke: "#8fb5ae", "stroke-width": 2 }, g),
                             SV.el("polyline", { points: FR.x + "," + y1 + " " + GX + "," + y1 + " " + GX + "," + y2 + " " + K2.x + "," + y2, fill: "none", stroke: "#8fb5ae", "stroke-width": 2 }, g)];
                    return { s: s };
                },
                byg: function (g, r, an) { r.s.forEach(function (s) { an.streg(s, 0, 500); }); }
            });
        }
    };
}());

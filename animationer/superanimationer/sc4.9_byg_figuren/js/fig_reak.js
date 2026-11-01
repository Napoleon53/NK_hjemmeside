/* =====================================================================
   fig_reak.js - figuren til 4.3 Alkaners reaktioner

   I rammen om forbraendingen to braendere som i bogens figur
   forbraending-flammer: blaa flamme med meget luft (luppen viser CO₂ og
   vand) og gul flamme med for lidt luft (luppen viser også CO og sod).
   Under dem reaktionsskemaet for methan og en optaelling af atomerne
   før og efter. Nederst substitutionen af hexan med dibrom i lys som i
   bogens figur substitution-glas.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;

    var BRUN = "#a0522d";
    var FR = { x: 20, y: 40, b: 960, h: 420 };            /* forbraendingen */
    var L = { x: 40, y: 72, b: 450, h: 250 };             /* fuldstaendig */
    var R = { x: 510, y: 72, b: 450, h: 250 };            /* ufuldstaendig */
    var BUND = L.y + 226, ZY = L.y + 140, ZR = 70;        /* braenderens fod og luppen */
    var LB = L.x + 82, LZ = L.x + 300, RB = R.x + 82, RZ = R.x + 300;
    var CO = { x: RZ + 26, y: ZY - 30 };                  /* carbonmonoxid i luppen */
    var TB = { x: 596, y: 354, b: 182, h: 98 };           /* optaellingen */
    var S = { x: 20, y: 496, b: 960, h: 144 };            /* substitutionen */

    function braender(g, x, bund, gul) {
        var y0 = bund - 86;
        /* Slangen */
        SV.el("path", { d: "M" + (x - 30) + "," + (bund - 6) + " C" + (x - 60) + "," + (bund - 4) + " " + (x - 70) + "," + (bund - 18) + " " + (x - 76) + "," + (bund - 18), fill: "none", stroke: "#c0612b", "stroke-width": 5, "stroke-linecap": "round" }, g);
        SV.el("path", { d: "M" + (x - 34) + "," + bund + " L" + (x - 22) + "," + (bund - 14) + " L" + (x + 22) + "," + (bund - 14) + " L" + (x + 34) + "," + bund + " Z", fill: "#5d6670" }, g);
        SV.el("rect", { x: x - 8, y: y0, width: 16, height: bund - 14 - y0, fill: "#aab4be", stroke: "#7d8892", "stroke-width": 1 }, g);
        SV.el("rect", { x: x - 4, y: y0 + 2, width: 3, height: bund - 18 - y0, fill: "#d9dfe5" }, g);
        SV.el("rect", { x: x - 12, y: bund - 40, width: 24, height: 11, rx: 2, fill: "#8a949e" }, g);
        SV.el("rect", { x: x - 4, y: bund - 38, width: 8, height: 7, fill: gul ? "#8a949e" : "#2b3238" }, g);
        var fl = SV.g(g);
        if (!gul) {
            SV.el("path", { d: "M" + (x - 12) + "," + y0 + " C" + (x - 16) + "," + (y0 - 30) + " " + (x - 6) + "," + (y0 - 58) + " " + x + "," + (y0 - 88) + " C" + (x + 6) + "," + (y0 - 58) + " " + (x + 16) + "," + (y0 - 30) + " " + (x + 12) + "," + y0 + " Z", fill: "#9fc0ff", "fill-opacity": 0.8 }, fl);
            SV.el("path", { d: "M" + (x - 8) + "," + y0 + " Q" + x + "," + (y0 - 70) + " " + (x + 8) + "," + y0 + " Z", fill: "#2f5fd8" }, fl);
            /* Luften suges ind ved bunden */
            ORG.pil(g, x - 46, x - 13, bund - 34, { farve: "#4a78dc", bredde: 2 });
            SV.tekst(g, x - 50, bund - 30, "luft", { "font-size": 13.5, fill: "#4a78dc", "text-anchor": "end" });
        } else {
            SV.el("path", { d: "M" + (x - 16) + "," + y0 + " C" + (x - 26) + "," + (y0 - 40) + " " + (x - 4) + "," + (y0 - 70) + " " + (x + 2) + "," + (y0 - 112) + " C" + (x + 10) + "," + (y0 - 70) + " " + (x + 26) + "," + (y0 - 40) + " " + (x + 16) + "," + y0 + " Z", fill: "#ffcd4a" }, fl);
            SV.el("path", { d: "M" + (x - 10) + "," + y0 + " C" + (x - 14) + "," + (y0 - 30) + " " + (x - 2) + "," + (y0 - 52) + " " + (x + 1) + "," + (y0 - 74) + " C" + (x + 6) + "," + (y0 - 50) + " " + (x + 14) + "," + (y0 - 30) + " " + (x + 10) + "," + y0 + " Z", fill: "#ffa81f", "fill-opacity": 0.85 }, fl);
            SV.el("path", { d: "M" + (x - 5) + "," + y0 + " Q" + x + "," + (y0 - 30) + " " + (x + 5) + "," + y0 + " Z", fill: "#fff3c2" }, fl);
        }
        return { fl: fl, top: [x, y0 - (gul ? 112 : 88)] };
    }

    function lup(g, zx, zy, fra) {
        var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
        SV.el("line", Object.assign({ x1: fra[0], y1: fra[1], x2: zx - ZR * 0.55, y2: zy - ZR * 0.83 }, s), g);
        SV.el("line", Object.assign({ x1: fra[0], y1: fra[1], x2: zx - ZR * 0.55, y2: zy + ZR * 0.83 }, s), g);
        SV.el("circle", { cx: fra[0], cy: fra[1], r: 6, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.4 }, g);
        SV.el("circle", { cx: zx, cy: zy, r: ZR, fill: "url(#lup)", stroke: "#b7c3cf", "stroke-width": 3, filter: "url(#skygge)" }, g);
    }

    function co2(g, x, y) { SV.kugle(g, x - 15, y, 8, "O", "O"); SV.kugle(g, x + 15, y, 8, "O", "O"); SV.kugle(g, x, y, 9, "C", "C"); }
    function vand(g, x, y) { SV.kugle(g, x - 10, y + 8, 5.5, "H"); SV.kugle(g, x + 10, y + 8, 5.5, "H"); SV.kugle(g, x, y, 9, "O", "O"); }
    function co(g, x, y) { var gg = SV.g(g); SV.kugle(gg, x + 8, y, 8, "O", "O"); SV.kugle(gg, x - 8, y, 9, "C", "C"); return gg; }
    function sod(g, x, y) {
        [[0, 0], [-12, -6], [12, -6], [-12, 8], [12, 8], [0, -14], [0, 14]].forEach(function (p) { SV.kugle(g, x + p[0], y + p[1], 7, "C"); });
    }

    function skilt(id, k, dele, fejl) {
        return { id: id, ord: [id], x: k.x + k.b / 2, y: k.y + k.h, maal: [k.x + k.b / 2, k.y + k.h], titel: true, dele: dele,
            omr: [{ r: [k.x - 5, k.y - 5, k.b + 10, k.h + 10, 16] }], fejl: fejl };
    }

    NK.FIGURER.reak = {
        vb: [1000, 660],
        lag: [
            { navn: "Forbrænding", pladser: ["forbrænding", "fuldstændig", "ufuldstændig"],
              ros: "Med luft nok brænder methan helt til CO₂ og vand. Med for lidt dioxygen bliver flammen gul af sod." },
            { navn: "Skemaet og to stoffer", pladser: ["carbonmonoxid", "afstemt", "substitution"],
              ros: "Skemaet har lige mange atomer på begge sider. CO er giftigt, og i substitutionen bytter H plads med Br." }
        ],
        pladser: [
            { id: "forbrænding", ord: ["forbrænding"], x: FR.x + FR.b / 2, y: FR.y, maal: [FR.x + FR.b / 2, FR.y], titel: true, dele: ["ramme"],
              omr: [{ r: [FR.x - 6, FR.y - 6, FR.b + 12, FR.h + 12, 18], tom: true }],
              fejl: { fuldstændig: "<b>fuldstændig</b> passer kun på den blå flamme. Rammen rummer begge flammer og reaktionsskemaet.",
                      ufuldstændig: "<b>ufuldstændig</b> passer kun på den gule flamme. Rammen rummer begge flammer og reaktionsskemaet.",
                      substitution: "<b>substitution</b> bytter H ud med Br eller Cl. Her reagerer methan med dioxygen og afgiver varme." } },
            skilt("fuldstændig", L, ["full"], {
                ufuldstændig: "<b>ufuldstændig</b> giver også CO og sod. Her er flammen blå, og luppen viser kun CO₂ og vand.",
                forbrænding: "<b>forbrænding</b> passer på begge flammer. Skiltet siger, hvad slags forbrænding den blå flamme er." }),
            skilt("ufuldstændig", R, ["ufull"], {
                fuldstændig: "<b>fuldstændig</b> giver kun CO₂ og vand. Her er flammen gul, og luppen viser også sod.",
                forbrænding: "<b>forbrænding</b> passer på begge flammer. Skiltet siger, hvad slags forbrænding den gule flamme er." }),

            { id: "carbonmonoxid", ord: ["carbonmonoxid"], x: RZ, y: R.y + 30, maal: [CO.x, CO.y - 13], dele: ["co"],
              omr: [{ r: [CO.x - 20, CO.y - 12, 40, 24, 10] }],
              fejl: { ufuldstændig: "<b>ufuldstændig</b> er hele forbrændingen. Pladsen peger på ét molekyle med ét C og ét O.",
                      afstemt: "<b>afstemt</b> siger noget om et reaktionsskema. Pladsen peger på ét molekyle med ét C og ét O." } },
            { id: "afstemt", ord: ["afstemt"], x: 876, y: TB.y + TB.h / 2, maal: [TB.x + TB.b + 4, TB.y + TB.h / 2], dele: ["tabel"],
              omr: [{ r: [TB.x - 2, TB.y - 2, TB.b + 4, TB.h + 4, 10] }],
              fejl: { forbrænding: "<b>forbrænding</b> er reaktionen. Pladsen peger på optællingen med lige mange atomer før og efter.",
                      fuldstændig: "<b>fuldstændig</b> siger, at der er dioxygen nok. Pladsen peger på optællingen af atomerne.",
                      carbonmonoxid: "<b>carbonmonoxid</b> er CO. Pladsen peger på optællingen af atomerne før og efter pilen." } },
            { id: "substitution", ord: ["substitution"], x: S.x + S.b / 2, y: S.y, maal: [S.x + S.b / 2, S.y], titel: true, dele: ["subst"],
              omr: [{ r: [S.x - 6, S.y - 6, S.b + 12, S.h + 12, 18], tom: true }],
              fejl: { forbrænding: "<b>forbrænding</b> kræver dioxygen. Her bytter et H-atom plads med et Br-atom i lys.",
                      ufuldstændig: "<b>ufuldstændig</b> siger noget om en forbrænding. Her bytter et H-atom plads med et Br-atom." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1 ------------------------------------------------------- */
            api.del("ramme", {
                lag: 0,
                fuld: function (g) {
                    var r = ORG.ramme(g, FR.x, FR.y, FR.b, FR.h, { fyld: "#f7fafb", kant: "#e0a35a" });
                    var y = TB.y + TB.h / 2 + 8;
                    SV.tekst(g, 300, y, "CH_4 + 2 O_2  →  CO_2 + 2 H_2O", { "font-size": 26, "font-weight": 700 });
                    SV.tekst(g, 300, y + 30, "methan brænder", { "font-size": 13.5, fill: F.mat, "font-style": "italic" });
                    return { r: r };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            api.del("full", {
                lag: 0,
                fuld: function (g) {
                    ORG.kort(g, L.x, L.y, L.b, L.h);
                    var b = braender(g, LB, BUND, false);
                    lup(g, LZ, ZY, b.top);
                    co2(g, LZ - 28, ZY - 26); vand(g, LZ + 30, ZY - 30);
                    vand(g, LZ - 30, ZY + 24); co2(g, LZ + 24, ZY + 28);
                    return { fl: b.fl };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.fl, 150, 500); }
            });

            api.del("ufull", {
                lag: 0,
                fuld: function (g) {
                    ORG.kort(g, R.x, R.y, R.b, R.h);
                    var b = braender(g, RB, BUND, true);
                    lup(g, RZ, ZY, b.top);
                    co2(g, RZ - 30, ZY - 26);
                    sod(g, RZ - 14, ZY + 28); vand(g, RZ + 36, ZY + 26);
                    return { fl: b.fl };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.fl, 150, 500); }
            });

            /* ----- Lag 2 ------------------------------------------------------- */
            api.del("co", {
                lag: 1,
                fuld: function (g) {
                    return { m: co(g, CO.x, CO.y) };
                },
                byg: function (g, r, an) { an.pop(r.m, 0, 450); }
            });

            api.del("tabel", {
                lag: 1,
                fuld: function (g) {
                    SV.el("rect", { x: TB.x, y: TB.y, width: TB.b, height: TB.h, rx: 8, fill: "#ffffff", stroke: "#cfd8e0", "stroke-width": 1.4 }, g);
                    var k = [TB.x + 24, TB.x + 76, TB.x + 128, TB.x + 162];
                    var a = { "font-size": 13, fill: F.mat, "font-weight": 600 };
                    SV.tekst(g, k[1], TB.y + 18, "før", a); SV.tekst(g, k[2], TB.y + 18, "efter", a);
                    var flueben = [];
                    [["C", 1, 1], ["H", 4, 4], ["O", 4, 4]].forEach(function (r, i) {
                        var y = TB.y + 42 + i * 22, b = { "font-size": 16, "font-weight": 700 };
                        SV.tekst(g, k[0], y, r[0], b);
                        SV.tekst(g, k[1], y, String(r[1]), { "font-size": 16, fill: F.teal, "font-weight": 700 });
                        SV.tekst(g, k[2], y, String(r[2]), { "font-size": 16, fill: F.teal, "font-weight": 700 });
                        flueben.push(SV.tekst(g, k[3], y, "✓", { "font-size": 16, fill: F.groen, "font-weight": 700 }));
                    });
                    return { f: flueben };
                },
                byg: function (g, r, an) { an.fade(g, 0, 350); r.f.forEach(function (f, i) { an.pop(f, 250 + i * 150, 350); }); }
            });

            api.del("subst", {
                lag: 1,
                fuld: function (g) {
                    var r = ORG.ramme(g, S.x, S.y, S.b, S.h, { fyld: "#f8f8fb", kant: "#c7a37a" });
                    var y = S.y + 82, navn = { "font-size": 13.5, fill: F.svag };
                    /* Hexan med ét H tegnet paa C nr. 2 */
                    var hx = ORG.kaedePunkter(80, y + 10, 5, { l: 34, op: true });
                    ORG.zigzag(g, hx, { bredde: 2.8 });
                    SV.el("line", { x1: hx[1][0], y1: hx[1][1], x2: hx[1][0], y2: hx[1][1] - 26, stroke: "#2f63c9", "stroke-width": 2.6 }, g);
                    SV.tekst(g, hx[1][0], hx[1][1] - 30, "H", { "font-size": 19, "font-weight": 700, fill: "#2f63c9" });
                    SV.tekst(g, 160, S.y + 132, "hexan", navn);
                    SV.tekst(g, 285, y + 7, "+", { "font-size": 24, fill: F.svag });
                    SV.tekst(g, 360, y + 8, "Br−Br", { "font-size": 22, "font-weight": 700, fill: BRUN });
                    SV.tekst(g, 360, S.y + 132, "dibrom", navn);
                    var lys = SV.g(g);
                    ORG.pil(lys, 425, 515, y);
                    SV.el("circle", { cx: 470, cy: y - 26, r: 7, fill: "#ffd54a", stroke: "#e0a020", "stroke-width": 1.5 }, lys);
                    SV.tekst(lys, 470, y + 22, "lys", { "font-size": 13.5, fill: "#c27c00", "font-weight": 700 });
                    var bx = ORG.kaedePunkter(560, y + 10, 5, { l: 34, op: true });
                    ORG.zigzag(g, bx, { bredde: 2.8 });
                    SV.el("line", { x1: bx[1][0], y1: bx[1][1], x2: bx[1][0], y2: bx[1][1] - 26, stroke: BRUN, "stroke-width": 2.6 }, g);
                    SV.tekst(g, bx[1][0], bx[1][1] - 30, "Br", { "font-size": 19, "font-weight": 700, fill: BRUN });
                    SV.tekst(g, 640, S.y + 132, "2-bromhexan", navn);
                    SV.tekst(g, 775, y + 7, "+", { "font-size": 24, fill: F.svag });
                    SV.tekst(g, 860, y + 8, "H−Br", { "font-size": 22, "font-weight": 700, fill: BRUN });
                    SV.tekst(g, 860, S.y + 132, "hydrogenbromid", navn);
                    return { r: r, lys: lys };
                },
                byg: function (g, r, an) { an.streg(r.r, 0, 800); an.pop(r.lys, 300, 450); }
            });
        }
    };
}());

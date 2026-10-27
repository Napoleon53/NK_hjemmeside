/* =====================================================================
   fig_hvad.js - figuren til 1.1 Hvad er kemi?

   Oeverst til venstre: et glas vand (makroniveau), en lup med
   vandmolekylerne (mikroniveau) og en kugle-pind-model af et
   vandmolekyle paa bordet (model). Oeverst til hoejre: inddelingen af
   rene stoffer som i bogens figur, med guld og vand som eksempler.
   Nederst: det periodiske system med trappen, som i bogen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var GLAS = { x: 62, y: 150, b: 100, bund: 288 };
    var LUP = { x: 300, y: 148, r: 78 };
    var KIT = { x: 412, y: 236 };
    var ROD = { x: 505, y: 128, b: 190, h: 118 };
    var GRUND = { x: 750, y: 70, b: 225, h: 108 };
    var FORB = { x: 750, y: 226, b: 225, h: 108 };
    var PS = new NK.PS.Gitter({ x: 268, y: 432, b: 38, h: 34, mx: 2, my: 2, skrift: 14 });
    var NA = { x: 52, y: 478, b: 116, h: 112 };

    /* Et vandmolekyle: O i midten og to H i en vinkel */
    function vand(g, x, y, v, s) {
        s = s || 1;
        var gg = SV.g(g);
        var a = v * Math.PI / 180, d = 10.5 * s, vink = 52 * Math.PI / 180;
        SV.kugle(gg, x + d * Math.cos(a - vink), y + d * Math.sin(a - vink), 5.6 * s, "H");
        SV.kugle(gg, x + d * Math.cos(a + vink), y + d * Math.sin(a + vink), 5.6 * s, "H");
        SV.kugle(gg, x, y, 9 * s, "O");
        return gg;
    }

    function guldklump(g, x, y, r) {
        var k = [];
        var pos = [[0, 0], [2, 0], [-2, 0], [1, -1.73], [-1, -1.73], [1, 1.73], [-1, 1.73]];
        pos.forEach(function (p) { k.push(SV.kugle(g, x + p[0] * r, y + p[1] * r, r, "guld")); });
        return k;
    }

    function guldbarre(g, x, y, s) {
        var gg = SV.g(g);
        var b = 26 * s, h = 13 * s, t = 7 * s;
        SV.el("path", { d: "M" + (x - b) + "," + (y + h) + " L" + (x + b) + "," + (y + h) + " L" + (x + b - t) + "," + (y - h) + " L" + (x - b + t) + "," + (y - h) + " Z",
            fill: "url(#k-guld)", stroke: "#a87b0c", "stroke-width": 1.2 }, gg);
        SV.el("path", { d: "M" + (x - b + t + 3) + "," + (y - h + 3) + " L" + (x + b - t - 3) + "," + (y - h + 3), stroke: "#fff6cf", "stroke-width": 2, "stroke-linecap": "round" }, gg);
        return gg;
    }

    function draabe(g, x, y, s) {
        var gg = SV.g(g);
        var r = 12 * s;
        SV.el("path", { d: "M" + x + "," + (y - 2.2 * r) + " C" + (x + 0.4 * r) + "," + (y - 1.3 * r) + " " + (x + r) + "," + (y - 0.7 * r) + " " + (x + r) + "," + y +
            " A" + r + "," + r + " 0 1 1 " + (x - r) + "," + y + " C" + (x - r) + "," + (y - 0.7 * r) + " " + (x - 0.4 * r) + "," + (y - 1.3 * r) + " " + x + "," + (y - 2.2 * r) + " Z",
            fill: "url(#vand)", stroke: "#3f7fb5", "stroke-width": 1.2 }, gg);
        SV.el("ellipse", { cx: x - 0.4 * r, cy: y - 0.2 * r, rx: 0.22 * r, ry: 0.4 * r, fill: "#ffffff", "fill-opacity": 0.6 }, gg);
        return gg;
    }

    /* Molekylerne i luppen: faste pladser, saa figuren er den samme hver gang */
    var LUPVAND = [
        [-42, -38, 20], [-6, -52, 140], [32, -36, 260], [52, -2, 30], [-58, 2, 200], [-24, -8, 310],
        [14, -4, 80], [-36, 34, 110], [2, 30, 230], [38, 34, 350], [-8, 62, 50], [62, 30, 170]
    ];

    NK.FIGURER.hvad = {
        vb: [1000, 700],
        lag: [
            { navn: "Makro og mikro", pladser: ["makroniveau", "mikroniveau", "model"],
              ros: "Vandet i glasset er vist på makroniveau og på mikroniveau, og på bordet står en model af et vandmolekyle." },
            { navn: "Rene stoffer", pladser: ["rent stof", "grundstof", "kemisk forbindelse"],
              ros: "Guld og vand er begge rene stoffer: guld er et grundstof, og vand er en kemisk forbindelse." },
            { navn: "Det periodiske system", pladser: ["det periodiske system", "atomsymbol", "metal", "ikke-metal", "halvmetal"],
              ros: "Metallerne står til venstre for trappen, ikke-metallerne til højre og halvmetallerne lige ved den." }
        ],
        pladser: [
            { id: "makroniveau", ord: ["makroniveau"], x: 140, y: 324, maal: [GLAS.x + 50, 236], halo: 18, dele: ["glas"],
              fejl: { mikroniveau: "<b>mikroniveau</b> er den usynlige verden. Glasset med vand kan du se med dine egne øjne." } },
            { id: "mikroniveau", ord: ["mikroniveau"], x: LUP.x, y: 32, maal: [LUP.x, LUP.y - 50], halo: 16, dele: ["lup"],
              fejl: { makroniveau: "<b>makroniveau</b> er det, du kan se. Molekylerne i luppen er alt for små til at kunne ses.",
                      model: "<b>model</b> passer ikke på luppen. Luppen viser det, der er i glasset, bare forstørret." } },
            { id: "model", ord: ["model"], x: 400, y: 324, maal: [KIT.x, KIT.y + 4], halo: 24, dele: ["kit"],
              fejl: { mikroniveau: "<b>mikroniveau</b> er den usynlige verden. Tingen på bordet kan man se og holde i hånden." } },

            { id: "rent stof", ord: ["rent stof"], x: ROD.x + ROD.b / 2, y: ROD.y, maal: [ROD.x + ROD.b / 2, ROD.y + 40], halo: 12, dele: ["rod"],
              fejl: { grundstof: "<b>grundstof</b> passer ikke på kortet med både guld og vand. Vand er ikke et grundstof.",
                      "kemisk forbindelse": "<b>kemisk forbindelse</b> passer ikke på kortet med både guld og vand. Guld er ikke en kemisk forbindelse." } },
            { id: "grundstof", ord: ["grundstof"], x: GRUND.x + GRUND.b / 2, y: GRUND.y, maal: [GRUND.x + 52, GRUND.y + 36], halo: 12, dele: ["grund"],
              fejl: { "kemisk forbindelse": "<b>kemisk forbindelse</b> passer ikke på guld. I luppen er alle atomerne ens.",
                      "rent stof": "<b>rent stof</b> passer på både guld og vand. Kortet her handler kun om guld." } },
            { id: "kemisk forbindelse", ord: ["kemisk forbindelse"], x: FORB.x + FORB.b / 2, y: FORB.y, maal: [FORB.x + 52, FORB.y + 36], halo: 12, dele: ["forb"],
              fejl: { grundstof: "<b>grundstof</b> passer ikke på vand. I luppen er der to slags atomer, der er bundet sammen.",
                      "rent stof": "<b>rent stof</b> passer på både guld og vand. Kortet her handler kun om vand." } },

            { id: "det periodiske system", ord: ["det periodiske system"], x: 430, y: 395, maal: [430, 420], halo: 11, dele: ["tabel"] },
            { id: "atomsymbol", ord: ["atomsymbol"], x: 140, y: 445, maal: [NA.x + NA.b / 2 + 14, NA.y + 36], halo: 13, dele: ["na"],
              fejl: { metal: "<b>metal</b> siger, hvilken slags grundstof natrium er. Pladsen peger på de to bogstaver Na." } },
            { id: "halvmetal", ord: ["halvmetal"], x: 548, y: 457, maal: [PS.x(13), PS.cy(2)], halo: 11, dele: ["halv"],
              fejl: { metal: "<b>metal</b> passer ikke på bor (B). Bor står lige ved trappen.",
                      "ikke-metal": "<b>ikke-metal</b> passer ikke på bor (B). Bor står lige ved trappen." } },
            { id: "metal", ord: ["metal"], x: 548, y: 509, maal: [PS.cx(8), PS.y(4)], halo: 11, dele: ["metal"],
              fejl: { "ikke-metal": "<b>ikke-metal</b> passer ikke på jern (Fe). Jern står til venstre for trappen.",
                      halvmetal: "<b>halvmetal</b> passer ikke på jern (Fe). Jern står langt fra trappen." } },
            { id: "ikke-metal", ord: ["ikke-metal"], x: 866, y: 395, maal: [PS.cx(16), PS.y(2)], halo: 11, dele: ["ikke"],
              fejl: { metal: "<b>metal</b> passer ikke på oxygen (O). Oxygen står til højre for trappen.",
                      halvmetal: "<b>halvmetal</b> passer ikke på oxygen (O). Oxygen står ikke lige ved trappen." } }
        ],

        tegn: function (api) {
            /* ----- Lag 1: glasset, luppen og modellen ------------------- */
            api.del("bord", {
                lag: 0, auto: true,
                fuld: function (g) {
                    SV.el("rect", { x: 28, y: GLAS.bund, width: 444, height: 9, rx: 4, fill: "#d9cbb4", stroke: "#b9a886", "stroke-width": 1 }, g);
                }
            });

            api.del("glas", {
                lag: 0,
                spoeg: function (g) { glasForm(g, true); },
                fuld: function (g) { return glasForm(g, false); },
                byg: function (g, r, an) {
                    an.fade(r.krop, 0, 300);
                    if (r.vand) r.vand.classList.add("anim");
                    an.glid(r.vand, 0, 40, 150, 700);
                }
            });

            api.del("lup", {
                lag: 0,
                spoeg: function (g) {
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: F.spoegFyld, stroke: F.spoeg, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, g);
                    keglen(g, true);
                },
                fuld: function (g) {
                    keglen(g, false);
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r + 7, fill: "#e5ebf2", stroke: "#8796a8", "stroke-width": 2, filter: "url(#skygge)" }, g);
                    SV.el("circle", { cx: LUP.x, cy: LUP.y, r: LUP.r, fill: "url(#lup)", stroke: "#b8c4d2", "stroke-width": 1 }, g);
                    var m = LUPVAND.map(function (v) { return vand(g, LUP.x + v[0], LUP.y + v[1], v[2], 1); });
                    return { m: m };
                },
                byg: function (g, r, an) { r.m.forEach(function (k, i) { an.pop(k, i * 55, 380); }); }
            });

            api.del("kit", {
                lag: 0,
                spoeg: function (g) { kugleKit(g, true); },
                fuld: function (g) { return kugleKit(g, false); },
                byg: function (g, r, an) {
                    an.pop(r.o, 0);
                    r.pinde.forEach(function (p, i) { an.streg(p, 250 + i * 120, 300); });
                    r.h.forEach(function (h, i) { an.pop(h, 400 + i * 150); });
                }
            });

            /* ----- Lag 2: rene stoffer --------------------------------------- */
            api.del("forgrening", {
                lag: 1, auto: true,
                fuld: function (g) {
                    var x0 = ROD.x + ROD.b, y0 = ROD.y + ROD.h / 2, xm = 722;
                    SV.el("polyline", { points: x0 + "," + y0 + " " + xm + "," + y0, fill: "none", stroke: "#9aa7b2", "stroke-width": 2 }, g);
                    SV.el("polyline", { points: GRUND.x + "," + (GRUND.y + GRUND.h / 2) + " " + xm + "," + (GRUND.y + GRUND.h / 2) + " " + xm + "," + (FORB.y + FORB.h / 2) + " " + FORB.x + "," + (FORB.y + FORB.h / 2),
                        fill: "none", stroke: "#9aa7b2", "stroke-width": 2 }, g);
                }
            });

            api.del("rod", {
                lag: 1,
                spoeg: function (g) { kort(g, ROD, true); },
                fuld: function (g) {
                    kort(g, ROD, false);
                    var a = guldbarre(g, ROD.x + 55, ROD.y + 74, 1);
                    var b = draabe(g, ROD.x + 135, ROD.y + 78, 1);
                    SV.tekst(g, ROD.x + 55, ROD.y + 106, "guld", { "font-size": 14, fill: F.svag });
                    SV.tekst(g, ROD.x + 135, ROD.y + 106, "vand", { "font-size": 14, fill: F.svag });
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.pop(r.a, 0); an.pop(r.b, 160); }
            });

            api.del("grund", {
                lag: 1,
                spoeg: function (g) { kort(g, GRUND, true); },
                fuld: function (g) {
                    kort(g, GRUND, false);
                    miniLup(g, GRUND.x + 52, GRUND.y + 64);
                    var k = guldklump(g, GRUND.x + 52, GRUND.y + 64, 9.5);
                    guldbarre(g, GRUND.x + 160, GRUND.y + 62, 0.85);
                    SV.tekst(g, GRUND.x + 160, GRUND.y + 94, "guld", { "font-size": 14, fill: F.svag });
                    return { k: k };
                },
                byg: function (g, r, an) { r.k.forEach(function (k, i) { an.pop(k, i * 60, 360); }); }
            });

            api.del("forb", {
                lag: 1,
                spoeg: function (g) { kort(g, FORB, true); },
                fuld: function (g) {
                    kort(g, FORB, false);
                    miniLup(g, FORB.x + 52, FORB.y + 64);
                    var m = [vand(g, FORB.x + 38, FORB.y + 52, 60, 1.05), vand(g, FORB.x + 68, FORB.y + 58, 200, 1.05), vand(g, FORB.x + 48, FORB.y + 84, 320, 1.05)];
                    draabe(g, FORB.x + 160, FORB.y + 68, 0.85);
                    SV.tekst(g, FORB.x + 160, FORB.y + 94, "vand", { "font-size": 14, fill: F.svag });
                    return { m: m };
                },
                byg: function (g, r, an) { r.m.forEach(function (k, i) { an.pop(k, i * 120, 380); }); }
            });

            /* ----- Lag 3: det periodiske system ------------------------------ */
            api.del("tabel", {
                lag: 2,
                spoeg: function (g) {
                    PS.tegn(g, function () { return { fill: "#eef1f4", stroke: "#d0d6dc", tekst: "#a3acb5" }; });
                    SV.el("polyline", { points: PS.trappe(), fill: "none", stroke: "#a3acb5", "stroke-width": 2.4, "stroke-dasharray": "6 4" }, g);
                    klamme(g, true);
                },
                fuld: function (g) {
                    var felter = PS.tegn(g, function () { return { fill: "#ffffff", stroke: "#cfd6dd", tekst: F.tekst }; });
                    SV.el("polyline", { points: PS.trappe(), fill: "none", stroke: "#5b6670", "stroke-width": 2.2 }, g);
                    var k = klamme(g, false);
                    return { felter: felter, k: k };
                },
                byg: function (g, r, an) {
                    an.streg(r.k, 0, 600);
                    r.felter.forEach(function (f) { an.pop(f.g, (f.f.kol + f.f.raekke) * 28, 300); });
                }
            });

            /* Metaller, ikke-metaller og halvmetaller farves som i bogen */
            [["metal", "m", F.metal, "#c9a24a"], ["ikke", "i", F.ikke, "#5fb3a1"], ["halv", "h", F.halv, "#9aa2ab"]].forEach(function (d) {
                api.del(d[0], {
                    lag: 2,
                    fuld: function (g) {
                        var felter = PS.tegn(g, function () { return { fill: d[2], stroke: d[3], tekst: F.tekst }; }, function (f) { return f.kl === d[1]; });
                        var trappe = null;
                        if (d[1] === "h") trappe = SV.el("polyline", { points: PS.trappe(), fill: "none", stroke: F.tekst, "stroke-width": 3.4, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
                        return { felter: felter, trappe: trappe };
                    },
                    byg: function (g, r, an) {
                        r.felter.forEach(function (f) {
                            var t = d[1] === "i" ? (19 - f.f.kol) * 35 : f.f.kol * 35;
                            an.fade(f.g, t + f.f.raekke * 12, 300);
                        });
                        if (r.trappe) an.streg(r.trappe, 100, 900);
                    }
                });
            });

            api.del("na", {
                lag: 2,
                spoeg: function (g) { naKort(g, true); },
                fuld: function (g) { return naKort(g, false); },
                byg: function (g, r, an) {
                    r.linjer.forEach(function (l, i) { an.streg(l, i * 80, 400); });
                    an.pop(r.sym, 250, 520);
                }
            });

            /* ----- Tegnehjaelp ----------------------------------------------- */
            function glasForm(g, spoeg) {
                var x = GLAS.x, y = GLAS.y, b = GLAS.b, bund = GLAS.bund - 2;
                var krop = "M" + x + "," + y + " L" + x + "," + (bund - 12) + " Q" + x + "," + bund + " " + (x + 12) + "," + bund +
                    " L" + (x + b - 12) + "," + bund + " Q" + (x + b) + "," + bund + " " + (x + b) + "," + (bund - 12) + " L" + (x + b) + "," + y;
                if (spoeg) {
                    SV.el("path", { d: krop, fill: F.spoegFyld, stroke: F.spoeg, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, g);
                    SV.el("ellipse", { cx: x + b / 2, cy: y, rx: b / 2, ry: 7, fill: "none", stroke: F.spoeg, "stroke-width": 1.4, "stroke-dasharray": "5 4" }, g);
                    return null;
                }
                var vandY = y + 46;
                var vandG = SV.g(g);
                SV.el("path", { d: "M" + (x + 2) + "," + vandY + " L" + (x + 2) + "," + (bund - 12) + " Q" + (x + 2) + "," + (bund - 2) + " " + (x + 13) + "," + (bund - 2) +
                    " L" + (x + b - 13) + "," + (bund - 2) + " Q" + (x + b - 2) + "," + (bund - 2) + " " + (x + b - 2) + "," + (bund - 12) + " L" + (x + b - 2) + "," + vandY + " Z", fill: "url(#vand)" }, vandG);
                SV.el("ellipse", { cx: x + b / 2, cy: vandY, rx: b / 2 - 2, ry: 6, fill: "#cfe8f8", stroke: "#8cc0e3", "stroke-width": 1 }, vandG);
                var kropG = SV.g(g);
                SV.el("path", { d: krop, fill: "url(#glas)", stroke: "#7f93a6", "stroke-width": 1.8 }, kropG);
                SV.el("ellipse", { cx: x + b / 2, cy: y, rx: b / 2, ry: 7, fill: "none", stroke: "#7f93a6", "stroke-width": 1.8 }, kropG);
                SV.el("line", { x1: x + 12, y1: y + 18, x2: x + 12, y2: bund - 20, stroke: "#ffffff", "stroke-width": 5, "stroke-opacity": 0.55, "stroke-linecap": "round" }, kropG);
                for (var i = 0; i < 4; i++) SV.el("line", { x1: x + b - 22, y1: y + 40 + i * 24, x2: x + b - 8, y2: y + 40 + i * 24, stroke: "#8fa3b5", "stroke-width": 1.2 }, kropG);
                SV.el("circle", { cx: x + 50, cy: 236, r: 9, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.4 }, kropG);
                return { krop: kropG, vand: vandG };
            }

            function keglen(g, spoeg) {
                var px = GLAS.x + 50, py = 236;
                var dx = px - LUP.x, dy = py - LUP.y, d = Math.sqrt(dx * dx + dy * dy);
                var b = Math.atan2(dy, dx), a = Math.acos((LUP.r + 7) / d);
                var t1 = [LUP.x + (LUP.r + 7) * Math.cos(b + a), LUP.y + (LUP.r + 7) * Math.sin(b + a)];
                var t2 = [LUP.x + (LUP.r + 7) * Math.cos(b - a), LUP.y + (LUP.r + 7) * Math.sin(b - a)];
                var s = { stroke: spoeg ? F.spoeg : "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
                SV.el("line", Object.assign({ x1: px - 6, y1: py - 7, x2: t1[0], y2: t1[1] }, s), g);
                SV.el("line", Object.assign({ x1: px + 7, y1: py + 5, x2: t2[0], y2: t2[1] }, s), g);
            }

            function kugleKit(g, spoeg) {
                var o = { x: KIT.x, y: KIT.y }, h1 = { x: KIT.x - 30, y: KIT.y + 26 }, h2 = { x: KIT.x + 30, y: KIT.y + 26 };
                if (spoeg) {
                    SV.spoegKugle(g, o.x, o.y, 19);
                    SV.spoegKugle(g, h1.x, h1.y, 12);
                    SV.spoegKugle(g, h2.x, h2.y, 12);
                    return null;
                }
                SV.el("ellipse", { cx: KIT.x, cy: GLAS.bund - 1, rx: 46, ry: 4, fill: "#000000", "fill-opacity": 0.12 }, g);
                var pinde = [
                    SV.el("line", { x1: o.x, y1: o.y, x2: h1.x, y2: h1.y, stroke: "#c4c9cf", "stroke-width": 6, "stroke-linecap": "round" }, g),
                    SV.el("line", { x1: o.x, y1: o.y, x2: h2.x, y2: h2.y, stroke: "#c4c9cf", "stroke-width": 6, "stroke-linecap": "round" }, g)
                ];
                var hh = [SV.kugle(g, h1.x, h1.y, 12, "H"), SV.kugle(g, h2.x, h2.y, 12, "H")];
                var oo = SV.kugle(g, o.x, o.y, 19, "O");
                return { pinde: pinde, h: hh, o: oo };
            }

            function kort(g, K, spoeg) {
                SV.el("rect", { x: K.x, y: K.y, width: K.b, height: K.h, rx: 12,
                    fill: spoeg ? "#f4f6f8" : "#eef7f5", stroke: spoeg ? F.spoeg : "#9fcfc4", "stroke-width": 1.6,
                    "stroke-dasharray": spoeg ? "5 4" : null, filter: spoeg ? null : "url(#skygge)" }, g);
                if (spoeg) {
                    /* Spoegelset viser stadig, hvad kortet handler om: guld og/eller vand */
                    if (K === ROD) {
                        SV.tekst(g, K.x + 55, K.y + 82, "guld", { "font-size": 15, fill: F.mat });
                        SV.tekst(g, K.x + 135, K.y + 82, "vand", { "font-size": 15, fill: F.mat });
                    } else {
                        SV.el("circle", { cx: K.x + 52, cy: K.y + 64, r: 34, fill: "none", stroke: F.spoeg, "stroke-width": 1.4, "stroke-dasharray": "4 3" }, g);
                        SV.tekst(g, K.x + 160, K.y + 74, K === GRUND ? "guld" : "vand", { "font-size": 15, fill: F.mat });
                    }
                }
            }

            function miniLup(g, x, y) {
                SV.el("circle", { cx: x, cy: y, r: 37, fill: "#e5ebf2", stroke: "#8796a8", "stroke-width": 1.6 }, g);
                SV.el("circle", { cx: x, cy: y, r: 33, fill: "url(#lup)" }, g);
            }

            function klamme(g, spoeg) {
                var x1 = PS.x(1), x2 = PS.hoejre(18), y = 420;
                return SV.el("path", { d: "M" + x1 + "," + (y + 7) + " L" + x1 + "," + y + " L" + x2 + "," + y + " L" + x2 + "," + (y + 7),
                    fill: "none", stroke: spoeg ? F.spoeg : "#5b6670", "stroke-width": 1.8, "stroke-dasharray": spoeg ? "6 4" : null }, g);
            }

            function naKort(g, spoeg) {
                var x = NA.x, y = NA.y, b = NA.b, h = NA.h;
                var na = PS.felt("Na");
                var lx = PS.x(na.kol), ly1 = PS.y(na.raekke), ly2 = PS.bund(na.raekke);
                var s = { stroke: spoeg ? F.spoeg : "#8a96a2", "stroke-width": 1.2, "stroke-dasharray": "4 3" };
                var l1 = SV.el("line", Object.assign({ x1: x + b, y1: y + 4, x2: lx, y2: ly1 }, s), g);
                var l2 = SV.el("line", Object.assign({ x1: x + b, y1: y + h - 4, x2: lx, y2: ly2 }, s), g);
                SV.el("rect", { x: x, y: y, width: b, height: h, rx: 10, fill: spoeg ? "#f4f6f8" : "#fdf6e3", stroke: spoeg ? F.spoeg : F.metalKant, "stroke-width": 2,
                    "stroke-dasharray": spoeg ? "5 4" : null, filter: spoeg ? null : "url(#skygge)" }, g);
                var farve = spoeg ? F.mat : F.tekst;
                SV.tekst(g, x + 12, y + 24, "11", { "font-size": 16, fill: spoeg ? F.mat : F.svag, "text-anchor": "start" });
                var sym = SV.tekst(g, x + b / 2, y + 74, "Na", { "font-size": 46, "font-weight": 700, fill: farve });
                SV.tekst(g, x + b / 2, y + 98, "natrium", { "font-size": 14, fill: spoeg ? F.mat : F.svag });
                return { linjer: [l1, l2], sym: sym };
            }
        }
    };
}());

/* =====================================================================
   fig_skema.js - figuren til 1.4 Reaktionsskemaer og afstemning

   Oeverst: formlen for vand med en model af molekylet, og reaktionen
   mellem dihydrogen og dioxygen med molekylerne foer og efter, som i
   bogens figur. I midten: reaktionsskemaet
   2 H2(g) + O2(g) -> 2 H2O(l). Nederst: regnskabet over atomerne.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var FK = { x: 30, y: 46, b: 250, h: 196 };          /* formelkortet */
    var FOER = { x: 330, y: 52, b: 230, h: 150 };
    var EFTER = { x: 740, y: 52, b: 230, h: 150 };
    var SK = { y: 404, skrift: 42 };                    /* reaktionsskemaet */
    var MIDTE = 580;                                    /* skemaets midte */
    var RS = { x: 410, y: 534, b: 340, h: 122 };        /* regnskabet */

    /* Skemaets dele: tekst og afstand foer. Bredderne maales, saa delene
       kan staa hver for sig og alligevel ligne én linje. */
    var DELE = [
        { id: "k1", t: "2", luft: 0 },
        { id: "h2", t: "H_2", luft: 8 },
        { id: "s1", t: "(g)", luft: 2, lille: true },
        { id: "plus", t: "+", luft: 18 },
        { id: "o2", t: "O_2", luft: 18 },
        { id: "s2", t: "(g)", luft: 2, lille: true },
        { id: "pil", t: "→", luft: 22 },
        { id: "k2", t: "2", luft: 22 },
        { id: "h2o", t: "H_2O", luft: 8 },
        { id: "s3", t: "(l)", luft: 2, lille: true }
    ];

    function bredde(d) {
        var s = d.lille ? SK.skrift * 0.62 : SK.skrift;
        var ren = d.t.replace(/_(\d)/g, "$1");
        var b = 0;
        /* saenkede tal er mindre */
        var dele = d.t.split(/(_\d)/);
        dele.forEach(function (x) {
            if (!x) return;
            if (x.charAt(0) === "_") b += NK.tekstBredde(x.slice(1), s * 0.68, 700);
            else b += NK.tekstBredde(x, s, d.lille ? 600 : 700);
        });
        if (d.t === "→") b = s * 1.6;
        return b || NK.tekstBredde(ren, s, 700);
    }

    var POS = null;
    function placer() {
        if (POS) return POS;
        POS = {};
        var total = 0;
        DELE.forEach(function (d) { d.b = bredde(d); total += d.luft + d.b; });
        var x = MIDTE - total / 2;
        DELE.forEach(function (d) {
            x += d.luft;
            POS[d.id] = { x: x, b: d.b, cx: x + d.b / 2 };
            x += d.b;
        });
        POS.start = MIDTE - total / 2;
        POS.slut = MIDTE + total / 2;
        return POS;
    }

    function tegnDel(g, id, farve, vaegt) {
        var p = placer()[id];
        var d = DELE.filter(function (x) { return x.id === id; })[0];
        var s = d.lille ? SK.skrift * 0.62 : SK.skrift;
        if (id === "pil") {
            var y = SK.y - SK.skrift * 0.32;
            var gg = SV.g(g);
            var linje = SV.el("line", { x1: p.x + 2, y1: y, x2: p.x + p.b - 12, y2: y, stroke: farve, "stroke-width": 3.6, "stroke-linecap": "round", "stroke-dasharray": vaegt === "spoeg" ? "6 5" : null }, gg);
            SV.el("path", { d: "M" + (p.x + p.b - 18) + "," + (y - 9) + " L" + (p.x + p.b - 2) + "," + y + " L" + (p.x + p.b - 18) + "," + (y + 9), fill: "none", stroke: farve, "stroke-width": 3.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
            return { g: gg, linje: linje };
        }
        return SV.tekst(g, p.x, SK.y, d.t, { "font-size": s, "font-weight": d.lille ? 600 : (vaegt || 700), fill: farve, "text-anchor": "start" });
    }

    /* Et vandmolekyle med O foroven og de to H skraat nedenunder */
    function vand(g, x, y, s) {
        var gg = SV.g(g);
        SV.kugle(gg, x - 16 * s, y + 13 * s, 9 * s, "H", "H");
        SV.kugle(gg, x + 16 * s, y + 13 * s, 9 * s, "H", "H");
        SV.kugle(gg, x, y, 14 * s, "O", "O");
        return gg;
    }

    function to(g, x, y, slags, r) {
        var gg = SV.g(g);
        SV.kugle(gg, x - r * 0.8, y, r, slags, slags);
        SV.kugle(gg, x + r * 0.8, y, r, slags, slags);
        return gg;
    }

    function spoegMolekyle(g, x, y, r, n) {
        for (var i = 0; i < n; i++) SV.spoegKugle(g, x + (i - (n - 1) / 2) * r * 1.6, y, r);
    }

    NK.FIGURER.skema = {
        vb: [1000, 680],
        lag: [
            { navn: "Formel og reaktion", pladser: ["kemisk formel", "kemisk reaktion"], ekstra: ["reaktionsskema"],
              ros: "H₂O viser, at vand består af to hydrogenatomer og ét oxygenatom. I reaktionen bliver atomerne sat sammen på en ny måde." },
            { navn: "Reaktionsskemaet", pladser: ["reaktionsskema", "reaktant", "produkt", "reaktionspil"],
              ros: "Skemaet læses: to dihydrogenmolekyler og ét dioxygenmolekyle bliver til to vandmolekyler." },
            { navn: "Tal og symboler", pladser: ["koefficient", "tilstandssymbol", "afstemt"],
              ros: "Der er 4 hydrogenatomer og 2 oxygenatomer på begge sider af pilen." }
        ],
        pladser: [],

        tegn: function (api) {
            var P = placer();
            var self = NK.FIGURER.skema;
            /* Pladserne afhaenger af de maalte bredder, saa de laves her */
            self.pladser.length = 0;
            self.pladser.push(
                { id: "kemisk formel", ord: ["kemisk formel"], x: FK.x + FK.b / 2, y: FK.y, maal: [FK.x + 82, FK.y + 62], halo: 14, dele: ["formel"],
                  fejl: { "kemisk reaktion": "<b>kemisk reaktion</b> er noget, der sker. Pladsen peger på bogstaverne og tallet, der står for vand.",
                          reaktionsskema: "<b>reaktionsskema</b> har en pil og stoffer på begge sider. Pladsen peger kun på ét stof." } },
                { id: "kemisk reaktion", ord: ["kemisk reaktion"], x: 650, y: 252, maal: [650, 118], halo: 18, dele: ["reaktion"],
                  fejl: { reaktionsskema: "<b>reaktionsskema</b> er skrevet med formler og en pil. Pladsen peger på molekylerne, der bliver sat sammen på en ny måde.",
                          "kemisk formel": "<b>kemisk formel</b> er bogstaver og tal for ét stof. Pladsen peger på molekylerne, der bliver sat sammen på en ny måde." } },
                { id: "reaktionsskema", ord: ["reaktionsskema"], x: 140, y: SK.y - 14, maal: [P.start - 16, SK.y - 14], halo: 12, dele: ["ramme"],
                  fejl: { reaktionspil: "<b>reaktionspil</b> er kun pilen. Pladsen peger på rammen om hele linjen." } },
                { id: "reaktant", ord: ["reaktant"], x: 380, y: 318, maal: [P.o2.cx, SK.y - 38], halo: 14, dele: ["reaktant"],
                  fejl: { produkt: "<b>produkt</b> står efter pilen. O₂ står før pilen." } },
                { id: "reaktionspil", ord: ["reaktionspil"], x: 610, y: 318, maal: [P.pil.cx, SK.y - 24], halo: 14, dele: ["pil"] },
                { id: "produkt", ord: ["produkt"], x: 860, y: 318, maal: [P.h2o.cx, SK.y - 38], halo: 14, dele: ["produkt"],
                  fejl: { reaktant: "<b>reaktant</b> står før pilen. H₂O står efter pilen." } },
                { id: "tilstandssymbol", ord: ["tilstandssymbol"], x: 430, y: 478, maal: [P.s2.cx, SK.y + 10], halo: 13, dele: ["tilstand"],
                  fejl: { koefficient: "<b>koefficient</b> er det store tal foran en formel. Pladsen peger på bogstavet i parentesen efter O₂." } },
                { id: "koefficient", ord: ["koefficient"], x: 720, y: 478, maal: [P.k2.cx, SK.y + 6], halo: 13, dele: ["koef"],
                  fejl: { tilstandssymbol: "<b>tilstandssymbol</b> står i en parentes efter formlen. Pladsen peger på det store tal foran H₂O." } },
                { id: "afstemt", ord: ["afstemt"], x: 240, y: RS.y + RS.h / 2, maal: [RS.x, RS.y + RS.h / 2], halo: 12, dele: ["regnskab"] }
            );

            /* ----- Lag 1: formlen og reaktionen ------------------------------ */
            api.del("formel", {
                lag: 0,
                spoeg: function (g) { formelKort(g, true); },
                fuld: function (g) { return formelKort(g, false); },
                byg: function (g, r, an) {
                    an.pop(r.formel, 0, 520);
                    an.pop(r.model, 300, 520);
                    an.pop(r.to, 750, 420);
                    r.h.forEach(function (h, i) { an.blink(h, 1000 + i * 200); });
                }
            });

            api.del("reaktion", {
                lag: 0,
                spoeg: function (g) {
                    kasse(g, FOER, "før", true);
                    kasse(g, EFTER, "efter", true);
                    spoegMolekyle(g, FOER.x + 60, FOER.y + 55, 12, 2);
                    spoegMolekyle(g, FOER.x + 60, FOER.y + 105, 12, 2);
                    spoegMolekyle(g, FOER.x + 165, FOER.y + 80, 15, 2);
                    spoegMolekyle(g, EFTER.x + 70, EFTER.y + 80, 14, 3);
                    spoegMolekyle(g, EFTER.x + 165, EFTER.y + 80, 14, 3);
                    SV.el("path", { d: "M" + (FOER.x + FOER.b + 18) + ",118 Q650,40 " + (EFTER.x - 18) + ",118", fill: "none", stroke: F.spoeg, "stroke-width": 2.4, "stroke-dasharray": "6 5" }, g);
                },
                fuld: function (g) {
                    kasse(g, FOER, "før", false);
                    kasse(g, EFTER, "efter", false);
                    var foer = [to(g, FOER.x + 60, FOER.y + 55, "H", 12), to(g, FOER.x + 60, FOER.y + 105, "H", 12), to(g, FOER.x + 165, FOER.y + 80, "O", 15)];
                    var efter = [vand(g, EFTER.x + 65, EFTER.y + 66, 1.35), vand(g, EFTER.x + 165, EFTER.y + 66, 1.35)];
                    var bue = SV.el("path", { d: "M" + (FOER.x + FOER.b + 18) + ",118 Q650,40 " + (EFTER.x - 26) + ",110", fill: "none", stroke: "#5b6670", "stroke-width": 2.6 }, g);
                    /* Pilespidsen foelger buens retning i enden */
                    var ex = EFTER.x - 18, ey = 118, dx = ex - 650, dy = ey - 40, l = Math.sqrt(dx * dx + dy * dy);
                    dx /= l; dy /= l;
                    var bx = ex - 15 * dx, by = ey - 15 * dy;
                    var spids = SV.el("polygon", { points: ex + "," + ey + " " + (bx - 7 * dy) + "," + (by + 7 * dx) + " " + (bx + 7 * dy) + "," + (by - 7 * dx), fill: "#5b6670" }, g);
                    var gnist = gnisten(g, 650, 84);
                    return { foer: foer, efter: efter, bue: bue, spids: spids, gnist: gnist };
                },
                byg: function (g, r, an) {
                    r.foer.forEach(function (m, i) { an.pop(m, i * 120, 380); });
                    an.streg(r.bue, 380, 600);
                    an.pop(r.gnist, 700, 420);
                    an.fade(r.spids, 950, 200);
                    r.efter.forEach(function (m, i) { an.pop(m, 1000 + i * 180, 420); });
                }
            });

            /* ----- Lag 2: skemaet ---------------------------------------------- */
            api.del("linje", {
                lag: 1, auto: true,
                fuld: function (g) {
                    ["k1", "h2", "plus", "o2", "k2", "h2o"].forEach(function (id) { tegnDel(g, id, F.tekst); });
                }
            });

            api.del("ramme", {
                lag: 1,
                spoeg: function (g) { ramme(g, true); },
                fuld: function (g) { return { r: ramme(g, false) }; },
                byg: function (g, r, an) { an.streg(r.r, 0, 900); }
            });

            api.del("reaktant", {
                lag: 1,
                fuld: function (g) {
                    var a = SV.el("rect", { x: P.k1.x - 8, y: SK.y - 44, width: P.s2.x + P.s2.b - P.k1.x + 16, height: 6, rx: 3, fill: "#3d86c6", "fill-opacity": 0.75 }, g);
                    return { a: a };
                },
                byg: function (g, r, an) { an.fade(r.a, 0, 500); }
            });

            api.del("produkt", {
                lag: 1,
                fuld: function (g) {
                    var a = SV.el("rect", { x: P.k2.x - 8, y: SK.y - 44, width: P.s3.x + P.s3.b - P.k2.x + 16, height: 6, rx: 3, fill: F.groen, "fill-opacity": 0.8 }, g);
                    return { a: a };
                },
                byg: function (g, r, an) { an.fade(r.a, 0, 500); }
            });

            api.del("pil", {
                lag: 1,
                spoeg: function (g) { tegnDel(g, "pil", F.spoeg, "spoeg"); },
                fuld: function (g) {
                    var p = tegnDel(g, "pil", F.tekst);
                    var laes = SV.tekst(g, P.pil.cx, SK.y + 20, "bliver til", { "font-size": 13, fill: F.mat, "font-style": "italic" });
                    return { p: p, laes: laes };
                },
                byg: function (g, r, an) { an.streg(r.p.linje, 0, 500); an.fade(r.laes, 450, 400); }
            });

            /* ----- Lag 3: koefficienter, tilstandssymboler og regnskabet ---- */
            api.del("koef", {
                lag: 2,
                fuld: function (g) {
                    /* Koefficienterne bliver orange som i bogen */
                    var a = tegnDel(g, "k1", "#c8661c");
                    var b = tegnDel(g, "k2", "#c8661c");
                    return { a: a, b: b };
                },
                byg: function (g, r, an) { an.pop(r.a, 0, 450); an.pop(r.b, 200, 450); }
            });

            api.del("tilstand", {
                lag: 2,
                spoeg: function (g) { ["s1", "s2", "s3"].forEach(function (id) { tegnDel(g, id, F.spoeg); }); },
                fuld: function (g) {
                    var t = ["s1", "s2", "s3"].map(function (id) { return tegnDel(g, id, F.teal); });
                    return { t: t };
                },
                byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 160, 400); }); }
            });

            api.del("regnskab", {
                lag: 2,
                spoeg: function (g) { regnskab(g, true); },
                fuld: function (g) { return regnskab(g, false); },
                byg: function (g, r, an) {
                    r.raekker.forEach(function (x, i) { an.glid(x, -16, 0, i * 220, 420); });
                    r.flueben.forEach(function (f, i) { an.streg(f, 500 + i * 220, 320); });
                }
            });

            /* ----- Tegnehjaelp -------------------------------------------- */
            function formelKort(g, spoeg) {
                SV.el("rect", { x: FK.x, y: FK.y, width: FK.b, height: FK.h, rx: 14, fill: spoeg ? "#f4f6f8" : "#f6f9fb", stroke: spoeg ? F.spoeg : "#d4dbe2", "stroke-width": 1.5, "stroke-dasharray": spoeg ? "5 4" : null }, g);
                var formel = SV.tekst(g, FK.x + 82, FK.y + 128, "H_2O", { "font-size": 60, "font-weight": 700, fill: spoeg ? F.mat : F.tekst });
                var model = SV.g(g), to = null, h = [];
                if (spoeg) {
                    SV.spoegKugle(model, FK.x + 192, FK.y + 92, 22);
                    SV.spoegKugle(model, FK.x + 170, FK.y + 118, 14);
                    SV.spoegKugle(model, FK.x + 214, FK.y + 118, 14);
                } else {
                    h.push(SV.kugle(model, FK.x + 170, FK.y + 118, 14, "H", "H"));
                    h.push(SV.kugle(model, FK.x + 214, FK.y + 118, 14, "H", "H"));
                    SV.kugle(model, FK.x + 192, FK.y + 92, 22, "O", "O");
                    to = SV.tekst(g, FK.x + FK.b / 2, FK.y + 178, "2 hydrogenatomer og 1 oxygenatom", { "font-size": 12.5, fill: F.teal });
                }
                SV.tekst(g, FK.x + 192, FK.y + 150, "vand", { "font-size": 15, fill: spoeg ? F.mat : F.svag, "font-style": "italic" });
                return { formel: formel, model: model, to: to, h: h };
            }

            function kasse(g, K, navn, spoeg) {
                SV.el("rect", { x: K.x, y: K.y, width: K.b, height: K.h, rx: 14, fill: spoeg ? "#f4f6f8" : "#f6f9fb", stroke: spoeg ? F.spoeg : "#d4dbe2", "stroke-width": 1.5, "stroke-dasharray": spoeg ? "5 4" : null }, g);
                SV.tekst(g, K.x + K.b / 2, K.y - 10, navn, { "font-size": 15, "font-weight": 700, fill: spoeg ? F.mat : F.svag });
            }

            function gnisten(g, x, y) {
                var gg = SV.g(g);
                var p = [];
                for (var i = 0; i < 16; i++) {
                    var r = i % 2 ? 7 : 17, v = i * Math.PI / 8;
                    p.push((x + r * Math.cos(v)) + "," + (y + r * Math.sin(v)));
                }
                SV.el("polygon", { points: p.join(" "), fill: "#ffd23e", stroke: "#e6892a", "stroke-width": 1.6, "stroke-linejoin": "round" }, gg);
                SV.el("circle", { cx: x, cy: y, r: 5, fill: "#fff6cf" }, gg);
                return gg;
            }

            function ramme(g, spoeg) {
                return SV.el("rect", { x: P.start - 16, y: SK.y - 56, width: P.slut - P.start + 32, height: 84, rx: 14,
                    fill: spoeg ? "none" : "#ffffff", "fill-opacity": spoeg ? null : 0.0, stroke: spoeg ? F.spoeg : "#7d8894", "stroke-width": 2,
                    "stroke-dasharray": spoeg ? "6 4" : null }, g);
            }

            function regnskab(g, spoeg) {
                var x = RS.x, y = RS.y, b = RS.b, h = RS.h;
                var mat = spoeg ? F.mat : null;
                SV.el("rect", { x: x, y: y, width: b, height: h, rx: 12, fill: spoeg ? "#f6f8fa" : "#ffffff", stroke: spoeg ? F.spoeg : "#cdd5dd", "stroke-width": 1.5, "stroke-dasharray": spoeg ? "5 4" : null, filter: spoeg ? null : "url(#skygge)" }, g);
                SV.tekst(g, x + 120, y + 26, "før pilen", { "font-size": 14, "font-weight": 700, fill: mat || F.svag });
                SV.tekst(g, x + 230, y + 26, "efter pilen", { "font-size": 14, "font-weight": 700, fill: mat || F.svag });
                var raekker = [], flueben = [];
                [["H-atomer", 4, 4], ["O-atomer", 2, 2]].forEach(function (r, i) {
                    var gg = SV.g(g);
                    var yy = y + 62 + i * 36;
                    SV.tekst(gg, x + 18, yy, r[0], { "font-size": 16, fill: mat || F.tekst, "text-anchor": "start" });
                    SV.tekst(gg, x + 120, yy, String(r[1]), { "font-size": 19, "font-weight": 700, fill: mat || F.tekst });
                    SV.tekst(gg, x + 230, yy, String(r[2]), { "font-size": 19, "font-weight": 700, fill: mat || F.tekst });
                    raekker.push(gg);
                    if (!spoeg) flueben.push(SV.el("path", { d: "M" + (x + 292) + "," + (yy - 7) + " l6,7 l13,-15", fill: "none", stroke: F.groen, "stroke-width": 3.2, "stroke-linecap": "round", "stroke-linejoin": "round" }, g));
                });
                return { raekker: raekker, flueben: flueben };
            }
        }
    };
}());

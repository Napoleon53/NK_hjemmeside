/* =====================================================================
   fig_form.js - figuren til 3.2 Navngivning og molekylers form

   Som bogens figur former: methan, ammoniak, vand og carbondioxid som
   kuglemodeller med de frie elektronpar som blaa skyer. Formen staar
   som et skilt under kortet; carbondioxid har sit skilt i forvejen
   (lineært molekyle er ikke et fagord) og viser, hvordan det ser ud.
   Tetraederet og bunden af pyramiden er tegnet med stiplede linjer.
   Talforstavelsen er di i carbondioxid.
   Fire fagord, saa figuren har ét lag.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;

    var KB = 230, KH = 270, KY = 60;
    var KX = [20, 263, 506, 749];
    var CY = KY + 140;                               /* molekylernes midte */
    function cx(i) { return KX[i] + KB / 2; }

    /* Hvor "di" staar i carbondioxid (maales, saa det gule felt passer) */
    var NAVN_Y = KY + 34;
    var DI = (function () {
        var s = 19, a = NK.tekstBredde("carbon", s, 700), b = NK.tekstBredde("di", s, 700), c = NK.tekstBredde("oxid", s, 700);
        var x0 = cx(3) - (a + b + c) / 2;
        return { s: s, x0: x0, x: x0 + a, b: b, x2: x0 + a + b };
    }());

    function bredde(ord) {
        var b = 120;
        ord.forEach(function (o) { b = Math.max(b, NK.tekstBredde(o, 18, 700) + 28); });
        return Math.ceil(b);
    }

    function kort(g, i) {
        SV.el("rect", { x: KX[i], y: KY, width: KB, height: KH, rx: 14, fill: "#f6f9fb", stroke: "#c5d1dc", "stroke-width": 1.5, filter: "url(#skygge)" }, g);
    }

    function navn(g, i, n, formel) {
        if (n) SV.tekst(g, cx(i), NAVN_Y, n, { "font-size": 19, "font-weight": 700 });
        SV.tekst(g, cx(i), NAVN_Y + 24, formel, { "font-size": 16, "font-weight": 600, fill: F.svag });
    }

    function vinkel(g, i, t) {
        SV.tekst(g, cx(i), KY + KH - 32, t, { "font-size": 13.5, fill: F.mat, "font-style": "italic" });
    }

    function pind(g, x1, y1, x2, y2) {
        SV.el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#9aa3ad", "stroke-width": 6, "stroke-linecap": "round" }, g);
        SV.el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: "#d7dce1", "stroke-width": 2.4, "stroke-linecap": "round" }, g);
    }

    /* Et frit elektronpar: en blaa sky med to elektroner, drejet vinkel grader */
    function sky(g, x, y, vinkelGrader) {
        var gg = SV.g(g, { transform: "rotate(" + vinkelGrader + " " + x + " " + y + ")" });
        SV.el("ellipse", { cx: x, cy: y, rx: 13, ry: 21, fill: "#cfe0ff", "fill-opacity": 0.85, stroke: "#7aa0e6", "stroke-width": 1.3 }, gg);
        SV.kugle(gg, x - 5, y - 4, 4.4, "elektron");
        SV.kugle(gg, x + 5, y - 4, 4.4, "elektron");
        return gg;
    }

    function stiplet(g, punkter, luk) {
        var d = "M" + punkter.map(function (p) { return p[0] + "," + p[1]; }).join(" L") + (luk ? " Z" : "");
        return SV.el("path", { d: d, fill: "none", stroke: F.teal, "stroke-width": 1.6, "stroke-dasharray": "5 4", "stroke-opacity": 0.8 }, g);
    }

    /* Skiltet under kortet */
    function skilt(id, i, dele, fejl) {
        return { id: id, ord: [id], x: cx(i), y: KY + KH, maal: [cx(i), KY + KH], titel: true, dele: dele,
            omr: [{ r: [KX[i] - 5, KY - 5, KB + 10, KH + 10, 16] }], fejl: fejl };
    }

    var NAVNEDEL = function (o) { return "<b>" + o + "</b> er en form. Pladsen peger kun på to bogstaver i navnet carbondioxid."; };

    NK.FIGURER.form = {
        vb: [1000, 370],
        lag: [
            { navn: "Fire molekyler", pladser: ["tetraeder", "trekantet pyramide", "vinklet molekyle", "talforstavelse"],
              ros: "Bindinger og frie elektronpar skubber til hinanden og giver molekylet dets form. Di i navnet carbondioxid betyder 2." }
        ],
        pladser: [
            skilt("tetraeder", 0, ["methan"], {
                "trekantet pyramide": "<b>trekantet pyramide</b> er formen af ammoniak med tre H. Methan har fire H, ét i hvert hjørne.",
                "vinklet molekyle": "<b>vinklet molekyle</b> er formen af vand med to H. Methan har fire H, ét i hvert hjørne." }),
            skilt("trekantet pyramide", 1, ["ammoniak"], {
                tetraeder: "<b>tetraeder</b> har et atom i alle fire hjørner. Ammoniak har tre H og et frit elektronpar i toppen.",
                "vinklet molekyle": "<b>vinklet molekyle</b> er formen af vand med to H. Ammoniak har tre H, som danner bunden." }),
            skilt("vinklet molekyle", 2, ["vand"], {
                tetraeder: "<b>tetraeder</b> har et atom i alle fire hjørner. Vand har kun to H.",
                "trekantet pyramide": "<b>trekantet pyramide</b> har tre H i bunden. Vand har kun to H." }),
            { id: "talforstavelse", ord: ["talforstavelse"], x: cx(3), y: 24, maal: [DI.x + DI.b / 2, NAVN_Y - 19], dele: ["di"],
              omr: [{ r: [DI.x - 3, NAVN_Y - 18, DI.b + 6, 24, 6] }],
              fejl: { tetraeder: NAVNEDEL("tetraeder"), "trekantet pyramide": NAVNEDEL("trekantet pyramide"), "vinklet molekyle": NAVNEDEL("vinklet molekyle") } }
        ],

        tegn: function (api) {
            var B = bredde(["tetraeder", "trekantet pyramide", "vinklet molekyle", "talforstavelse"]);

            /* ----- Methan: fire H i hjoernerne af et tetraeder ------------------ */
            api.del("methan", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 0);
                    navn(g, 0, "methan", "CH_4");
                    var x = cx(0), y = CY;
                    var H = [[x, y - 64], [x - 60, y + 26], [x + 16, y + 50], [x + 56, y + 14]];
                    var t = SV.g(g);
                    stiplet(t, [H[0], H[1], H[2], H[0], H[3], H[2]]);
                    stiplet(t, [H[1], H[3]]);
                    pind(g, x, y, H[3][0], H[3][1]);
                    SV.kugle(g, H[3][0], H[3][1], 13, "H", "H");
                    [0, 1, 2].forEach(function (i) { pind(g, x, y, H[i][0], H[i][1]); });
                    SV.kugle(g, x, y, 22, "C", "C");
                    [0, 1, 2].forEach(function (i) { SV.kugle(g, H[i][0], H[i][1], 13, "H", "H"); });
                    vinkel(g, 0, "109,5° mellem bindingerne");
                    return { t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.t, 200, 800); }
            });

            /* ----- Ammoniak: N i toppen og tre H i bunden ---------------------- */
            api.del("ammoniak", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 1);
                    navn(g, 1, "ammoniak", "NH_3");
                    var x = cx(1), y = CY - 8;
                    var H = [[x - 54, y + 40], [x + 12, y + 58], [x + 52, y + 26]];
                    var t = SV.g(g);
                    stiplet(t, H, true);
                    pind(g, x, y, H[2][0], H[2][1]);
                    SV.kugle(g, H[2][0], H[2][1], 13, "H", "H");
                    sky(g, x, y - 42, 0);
                    pind(g, x, y, H[0][0], H[0][1]);
                    pind(g, x, y, H[1][0], H[1][1]);
                    SV.kugle(g, x, y, 22, "N", "N");
                    SV.kugle(g, H[0][0], H[0][1], 13, "H", "H");
                    SV.kugle(g, H[1][0], H[1][1], 13, "H", "H");
                    vinkel(g, 1, "107° mellem bindingerne");
                    return { t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.t, 200, 800); }
            });

            /* ----- Vand: vinklet ------------------------------------------------ */
            api.del("vand", {
                lag: 0,
                fuld: function (g) {
                    kort(g, 2);
                    navn(g, 2, "vand", "H_2O");
                    var x = cx(2), y = CY - 10;
                    var H = [[x - 50, y + 38], [x + 50, y + 38]];
                    sky(g, x - 26, y - 34, -32);
                    sky(g, x + 26, y - 34, 32);
                    pind(g, x, y, H[0][0], H[0][1]);
                    pind(g, x, y, H[1][0], H[1][1]);
                    /* Vinklen mellem bindingerne */
                    var r = 40, v1 = Math.atan2(38, -50), v2 = Math.atan2(38, 50);
                    var bue = SV.el("path", { d: "M" + (x + r * Math.cos(v1)) + "," + (y + r * Math.sin(v1)) + " A" + r + "," + r + " 0 0,0 " + (x + r * Math.cos(v2)) + "," + (y + r * Math.sin(v2)),
                        fill: "none", stroke: F.teal, "stroke-width": 2 }, g);
                    SV.kugle(g, x, y, 22, "O", "O");
                    SV.kugle(g, H[0][0], H[0][1], 13, "H", "H");
                    SV.kugle(g, H[1][0], H[1][1], 13, "H", "H");
                    vinkel(g, 2, "104,5° mellem bindingerne");
                    return { bue: bue };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.streg(r.bue, 250, 600); }
            });

            /* ----- Carbondioxid: lineaert, staar der i forvejen ------------------- */
            api.del("co2", {
                lag: 0, auto: true,
                fuld: function (g) {
                    kort(g, 3);
                    var a = { "font-size": DI.s, "font-weight": 700, "text-anchor": "start" };
                    SV.tekst(g, DI.x0, NAVN_Y, "carbon", a);
                    SV.tekst(g, DI.x2, NAVN_Y, "oxid", a);
                    navn(g, 3, null, "CO_2");
                    var x = cx(3), y = CY;
                    [-1, 1].forEach(function (s) {
                        [-5, 5].forEach(function (d) {
                            SV.el("line", { x1: x, y1: y + d, x2: x + s * 64, y2: y + d, stroke: "#9aa3ad", "stroke-width": 4.5, "stroke-linecap": "round" }, g);
                        });
                    });
                    SV.kugle(g, x, y, 22, "C", "C");
                    SV.kugle(g, x - 64, y, 21, "O", "O");
                    SV.kugle(g, x + 64, y, 21, "O", "O");
                    vinkel(g, 3, "180° mellem bindingerne");
                    /* Skiltet staar der i forvejen, saa man kan se, hvordan det ser ud */
                    SV.el("rect", { x: x - B / 2, y: KY + KH - 17, width: B, height: 34, rx: 8, fill: "#ffffff", stroke: "#b9c6cf", "stroke-width": 1.5 }, g);
                    SV.tekst(g, x, KY + KH + 6.3, "lineært molekyle", { "font-size": 18, "font-weight": 700, fill: "#6b7782" });
                }
            });

            api.del("di", {
                lag: 0,
                fuld: function (g) {
                    var t = SV.tekst(g, DI.x, NAVN_Y, "di", { "font-size": DI.s, "font-weight": 700, "text-anchor": "start", fill: F.teal });
                    var s = SV.el("line", { x1: DI.x, y1: NAVN_Y + 4, x2: DI.x + DI.b, y2: NAVN_Y + 4, stroke: F.teal, "stroke-width": 2.4 }, g);
                    return { t: t, s: s };
                },
                byg: function (g, r, an) { an.pop(r.t, 0, 450); an.streg(r.s, 250, 400); }
            });
        }
    };
}());

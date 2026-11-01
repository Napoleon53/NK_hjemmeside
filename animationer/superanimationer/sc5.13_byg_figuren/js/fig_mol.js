/* =====================================================================
   fig_mol.js - figuren til 5.3 Stofmængde

   Øverst tre kort med ord for et bestemt antal: et par æg er 2, en
   æggebakke med et dusin er 12, og pladsen spørger om ordet for
   6,02 · 10²³ (bogens tekst om mol). Mol-kortet viser et lille
   bægerglas med vand og en lup ind i vandet, hvor molekylerne står
   så tæt, at de fortsætter ud over luppens kant.
   Nederst ét mol af fire stoffer på vægte som i bogens figur et-mol
   (vægte, urglas, vejebåde og bunker overført fra bogens script), med
   to rækker under: molarmassen (fra 5.2, sat på igen) og stofmængden,
   der er den samme for alle fire.
   Tegnet om 1. nov. 2026 (brugeren: "i 5.3 synes jeg mol er skitseret
   på en uheldig måde.. Tegningerne i hele 5.3 er generelt lidt grimme").
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var ORG = NK.ORG;
    var LAB = NK.LAB;

    var KX = [40, 360, 680], KY = 46, KB = 280, KH = 180;  /* de tre kort med antal */
    var TY = KY + 166;                                    /* "… stykker" */
    var PX = [318, 512, 706, 895];                        /* de fire portioner */
    var VTOP = 332, S = 1.2;                              /* vægtskålenes overkant og skala */
    var RM = 462, RN = 516;                               /* rækkerne */
    var RX = 210, RB = 760;                               /* rækkernes venstre kant og bredde */

    /* Et æg: smallest foroven. Tegnes om (0, 0) og drejes rot grader */
    function aeg(g, x, y, b, h, rot) {
        var gg = SV.g(g, { transform: "translate(" + x + "," + y + ") rotate(" + (rot || 0) + ")" });
        var d = "M 0," + (-h / 2) +
            " C " + (b * 0.3) + "," + (-h / 2) + " " + (b / 2) + "," + (-h * 0.2) + " " + (b / 2) + "," + (h * 0.1) +
            " C " + (b / 2) + "," + (h * 0.36) + " " + (b * 0.28) + "," + (h / 2) + " 0," + (h / 2) +
            " C " + (-b * 0.28) + "," + (h / 2) + " " + (-b / 2) + "," + (h * 0.36) + " " + (-b / 2) + "," + (h * 0.1) +
            " C " + (-b / 2) + "," + (-h * 0.2) + " " + (-b * 0.3) + "," + (-h / 2) + " 0," + (-h / 2) + " Z";
        SV.el("path", { d: d, fill: "url(#lab-aeg)", stroke: "#b48f58", "stroke-width": 1 }, gg);
        SV.el("ellipse", { cx: -b * 0.17, cy: -h * 0.18, rx: b * 0.12, ry: h * 0.1, fill: "#ffffff", opacity: 0.7, transform: "rotate(-18 " + (-b * 0.17) + " " + (-h * 0.18) + ")" }, gg);
        return gg;
    }

    /* En æggebakke med 2 × 6 æg set lidt oppefra */
    var PAP = "#ddd5c7", PAP_KANT = "#a69c8b", HUL = "#b3a893";
    function aeggebakke(g, cx) {
        var bag = KY + 80, for_ = KY + 112;
        SV.el("ellipse", { cx: cx, cy: KY + 140, rx: 132, ry: 7, fill: "url(#lab-skygge)" }, g);
        /* Bakkens overside: smallere bagtil */
        SV.el("path", { d: "M " + (cx - 110) + "," + (KY + 70) + " H " + (cx + 110) + " L " + (cx + 124) + "," + (KY + 124) + " H " + (cx - 124) + " Z",
            fill: PAP, stroke: PAP_KANT, "stroke-width": 1, "stroke-linejoin": "round" }, g);
        function raekke(y, dx, b, h) {
            for (var i = 0; i < 6; i++) {
                var x = cx + (i - 2.5) * dx, rx = b * 0.56, ry = b * 0.18;
                SV.el("ellipse", { cx: x, cy: y, rx: rx, ry: ry, fill: HUL }, g);
                aeg(g, x, y - h / 2 + 5, b, h, 0);
                /* Hullets forkant dækker æggets bund, så ægget sidder i hullet */
                SV.el("path", { d: "M " + (x - rx) + "," + y + " A " + rx + " " + ry + " 0 0 0 " + (x + rx) + "," + y + " L " + (x + rx) + "," + (y + 7) + " L " + (x - rx) + "," + (y + 7) + " Z",
                    fill: PAP }, g);
                SV.el("path", { d: "M " + (x - rx) + "," + y + " A " + rx + " " + ry + " 0 0 0 " + (x + rx) + "," + y, fill: "none", stroke: PAP_KANT, "stroke-width": 1 }, g);
            }
        }
        raekke(bag, 34, 25, 32);
        raekke(for_, 38, 28, 36);
        /* Bakkens forside med en bule under hver kop */
        var d = "M " + (cx - 124) + "," + (KY + 124) + " H " + (cx + 124) + " L " + (cx + 124) + "," + (KY + 132);
        for (var i = 5; i >= 0; i--) {
            var x = cx + (i - 2.5) * 38;
            d += " Q " + x + "," + (KY + 146) + " " + (x - 19) + "," + (KY + 132);
        }
        d += " L " + (cx - 124) + "," + (KY + 132) + " Z";
        SV.el("path", { d: d, fill: "#cbc1af", stroke: PAP_KANT, "stroke-width": 1, "stroke-linejoin": "round" }, g);
    }

    /* Et vandmolekyle: O i midten og to H, der peger i retningen v */
    function vandmolekyle(g, x, y, v) {
        var a = 52 * Math.PI / 180;
        [-a, a].forEach(function (d) {
            SV.kugle(g, x + 10 * Math.cos(v + d), y + 10 * Math.sin(v + d), 5.2, "H");
        });
        SV.kugle(g, x, y, 8.5, "O");
    }

    var klipNr = 0;
    function lup(g, lx, ly, r, fra) {
        var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
        SV.el("circle", { cx: fra[0], cy: fra[1], r: 7, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.4 }, g);
        SV.el("line", Object.assign({ x1: fra[0] + 5, y1: fra[1] - 5, x2: lx - r * 0.72, y2: ly - r * 0.69 }, s), g);
        SV.el("line", Object.assign({ x1: fra[0] + 6, y1: fra[1] + 4, x2: lx - r * 0.86, y2: ly + r * 0.5 }, s), g);
        SV.el("circle", { cx: lx, cy: ly, r: r + 6, fill: "#e5ebf2", stroke: "#8796a8", "stroke-width": 2, filter: "url(#skygge)" }, g);
        SV.el("circle", { cx: lx, cy: ly, r: r, fill: "url(#lup)", stroke: "#b8c4d2", "stroke-width": 1 }, g);
        var id = "mol-lup-" + (++klipNr);
        var cp = SV.el("clipPath", { id: id }, g);
        SV.el("circle", { cx: lx, cy: ly, r: r - 1 }, cp);
        var m = SV.g(g, { "clip-path": "url(#" + id + ")" });
        /* Molekylerne står tæt og fortsætter ud over kanten */
        var n = 0;
        for (var rk = -3; rk <= 3; rk++) for (var k = -3; k <= 3; k++) {
            var x = lx + k * 27 + (rk % 2 ? 13.5 : 0) + ((n * 7) % 5 - 2), y = ly + rk * 23 + ((n * 11) % 5 - 2);
            n++;
            if (Math.hypot(x - lx, y - ly) > r + 9) continue;
            vandmolekyle(m, x, y, (n * 1.7) % (2 * Math.PI));
        }
        return m;
    }

    function raekke(id, y) {
        return { r: [RX - 4, y - 22, RB + 8, 40, 10] };
    }

    NK.FIGURER.mol = {
        vb: [1000, 552],
        lag: [
            { navn: "Ét mol af fire stoffer", pladser: ["mol", "molarmasse", "stofmængde"],
              ros: "Et mol er 6,02 · 10²³ stykker. Ét mol af hvert stof er lige mange formelenheder, men de vejer ikke det samme." }
        ],
        pladser: [
            { id: "mol", ord: ["mol"], x: KX[2] + KB / 2, y: KY, maal: [KX[2] + KB / 2, KY], titel: true, dele: ["molkort"],
              omr: [{ r: [KX[2] - 5, KY - 5, KB + 10, KH + 10, 16] }],
              fejl: { "stofmængde": "<b>stofmængde</b> er antallet af mol. Kortet spørger om ordet for 6,02 · 10²³ stykker, ligesom par og dusin.",
                      molarmasse: "<b>molarmasse</b> er massen af ét mol i g/mol. Kortet spørger om ordet for et antal, ligesom par og dusin." } },
            { id: "molarmasse", ord: ["molarmasse"], x: 112, y: RM, maal: [RX - 2, RM], dele: ["mrk"], omr: [raekke("m", RM)],
              fejl: { "stofmængde": "<b>stofmængde</b> måles i mol. Rækken her har tal i g/mol, og de er forskellige for de fire stoffer.",
                      mol: "<b>mol</b> er et antal. Rækken her viser, hvor mange gram ét mol af hvert stof vejer." } },
            { id: "stofmængde", ord: ["stofmængde"], x: 112, y: RN, maal: [RX - 2, RN], dele: ["nrk"], omr: [raekke("n", RN)],
              fejl: { molarmasse: "<b>molarmasse</b> måles i g/mol. Rækken her har tallet 1,00 mol under alle fire stoffer.",
                      mol: "<b>mol</b> er enheden. Rækken spørger om størrelsen n, der måles i mol, ligesom masse måles i gram." } }
        ],

        tegn: function (api) {
            LAB.gradienter();
            var B = ORG.bredde(["mol", "molarmasse", "stofmængde"]);

            /* ----- Par og dusin står der fra start ------------------------------ */
            api.del("antal", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var c0 = KX[0] + KB / 2;
                    ORG.kort(g, KX[0], KY, KB, KH);
                    SV.el("ellipse", { cx: c0 - 36, cy: KY + 124, rx: 36, ry: 6, fill: "url(#lab-skygge)" }, g);
                    SV.el("ellipse", { cx: c0 + 38, cy: KY + 126, rx: 36, ry: 6, fill: "url(#lab-skygge)" }, g);
                    aeg(g, c0 - 36, KY + 103, 44, 58, -78);
                    aeg(g, c0 + 38, KY + 105, 44, 58, 96);
                    SV.tekst(g, c0, TY, "2 stykker", { "font-size": 20, "font-weight": 700 });
                    ORG.givet(g, c0, KY, "par", B);

                    var c1 = KX[1] + KB / 2;
                    ORG.kort(g, KX[1], KY, KB, KH);
                    aeggebakke(g, c1);
                    SV.tekst(g, c1, TY, "12 stykker", { "font-size": 20, "font-weight": 700 });
                    ORG.givet(g, c1, KY, "dusin", B);
                }
            });

            /* ----- Mol: vand og en lup med molekylerne --------------------------- */
            api.del("molkort", {
                lag: 0,
                fuld: function (g) {
                    var c2 = KX[2] + KB / 2;
                    ORG.kort(g, KX[2], KY, KB, KH);
                    var bx = KX[2] + 58, bund = KY + 134;
                    SV.el("ellipse", { cx: bx, cy: bund + 3, rx: 30, ry: 4, fill: "url(#lab-skygge)" }, g);
                    var b = LAB.lilleBaeger(g, bx, bund, 40, 56, 0.68);
                    var m = lup(g, KX[2] + 190, KY + 88, 52, [bx, (b.vy + bund) / 2 + 2]);
                    var t = SV.tekst(g, c2, TY, "6,02 · 10^23 stykker", { "font-size": 20, "font-weight": 700 });
                    return { m: m, t: t };
                },
                byg: function (g, r, an) { an.fade(g, 0, 400); an.pop(r.m, 150, 500); an.pop(r.t, 350, 450); }
            });

            /* ----- Ét mol af fire stoffer på vægte, som i bogen ------------------- */
            api.del("portioner", {
                lag: 0, auto: true,
                fuld: function (g) {
                    var data = [["carbon", "12,01 g", 120], ["vand", "18,02 g", 120], ["køkkensalt", "58,44 g", 120], ["sukker", "342,3 g", 140]];
                    data.forEach(function (p, i) {
                        var cx = PX[i], gr = LAB.skaleret(g, cx, VTOP, S);
                        LAB.vaegtBog(gr, cx, VTOP, p[1], p[2]);
                        if (i === 0) LAB.urglas(gr, cx, VTOP, 62, function (gg, yb) { LAB.bunkeBog(gg, cx, yb, 46, 19, "kul", 5); });
                        if (i === 1) LAB.lilleBaeger(gr, cx, VTOP, 30, 40, 0.68);
                        if (i === 2) LAB.skaal(gr, cx, VTOP, 88, 11, function (gg, yb) { LAB.bunkeBog(gg, cx, yb, 72, 30, "salt", 462); });
                        if (i === 3) LAB.skaal(gr, cx, VTOP, 148, 11, function (gg, yb) { LAB.bunkeBog(gg, cx, yb, 132, 58, "sukker", 644); });
                        SV.tekst(g, cx, VTOP + 82, p[0], { "font-size": 17, "font-weight": 700, fill: "#2b3640" });
                    });
                    [RM, RN].forEach(function (y) {
                        SV.el("rect", { x: RX, y: y - 18, width: RB, height: 34, rx: 8, fill: "#f6f8fa", stroke: "#d4dbe2", "stroke-width": 1.2 }, g);
                    });
                }
            });

            function raekkeDel(id, y, sym, tekster) {
                api.del(id, {
                    lag: 0,
                    fuld: function (g) {
                        SV.tekst(g, RX + 22, y + 7, sym, { "font-size": 20, "font-weight": 700, "font-style": "italic", fill: F.teal });
                        var t = tekster.map(function (s, i) {
                            return SV.tekst(g, PX[i], y + 6, s, { "font-size": 18, "font-weight": 700 });
                        });
                        return { t: t };
                    },
                    byg: function (g, r, an) { r.t.forEach(function (t, i) { an.pop(t, i * 120, 400); }); }
                });
            }
            raekkeDel("mrk", RM, "M", ["12,01 g/mol", "18,02 g/mol", "58,44 g/mol", "342,3 g/mol"]);
            raekkeDel("nrk", RN, "n", ["1,00 mol", "1,00 mol", "1,00 mol", "1,00 mol"]);
        }
    };
}());

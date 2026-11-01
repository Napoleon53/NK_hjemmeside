/* =====================================================================
   lab.js - kapitel 6's egen tegnehjaelp: glas, lup, kort og pile

   Ikke en del af den faelles motor (som org.js i sc4.9). Glassene
   efterligner bogens figurer maalekolbe, fortynding, titrering-opstilling
   og mohr-trin: lyst glas med en tynd graa kant og vaesken indeni.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB = {};

    LAB.KANT = "#7d8b96";            /* glassets kant */
    LAB.VAND = "#cfe5f6";            /* vand og saltvand */
    LAB.GULGROEN = "#e6efa2";        /* proeven med indikator */
    LAB.LYSEROED = "#f6c6d8";        /* efter omslaget */

    /* Pladsernes bredde (som i motoren), saa givne skilte er lige saa brede */
    LAB.bredde = function (ord) {
        var b = 120;
        ord.forEach(function (o) { b = Math.max(b, NK.tekstBredde(o, 18, 700) + 28); });
        return Math.ceil(b);
    };

    /* Et lyst kort med skygge */
    LAB.kort = function (g, x, y, b, h, o) {
        o = o || {};
        return SV.el("rect", { x: x, y: y, width: b, height: h, rx: o.rx || 14, fill: o.fyld || "#f6f9fb", stroke: o.kant || "#c5d1dc",
            "stroke-width": 1.5, filter: o.skygge === false ? null : "url(#skygge)" }, g);
    };

    /* En ramme om en gruppe (uden skygge) */
    LAB.ramme = function (g, x, y, b, h, o) {
        o = o || {};
        return SV.el("rect", { x: x, y: y, width: b, height: h, rx: 16, fill: o.fyld || "none", stroke: o.kant || "#8fc7bb", "stroke-width": 2 }, g);
    };

    /* En vandret pil fra x1 til x2 i hoejden y */
    LAB.pil = function (g, x1, x2, y, o) {
        o = o || {};
        var gg = SV.g(g), f = o.farve || "#4b5560", ret = x2 > x1 ? 1 : -1;
        SV.el("line", { x1: x1, y1: y, x2: x2 - ret * 10, y2: y, stroke: f, "stroke-width": o.bredde || 2.4, "stroke-linecap": "round" }, gg);
        SV.el("polygon", { points: x2 + "," + y + " " + (x2 - ret * 12) + "," + (y - 6) + " " + (x2 - ret * 12) + "," + (y + 6), fill: f }, gg);
        return gg;
    };

    /* Et bægerglas med bund i (cx, bund). o.top er vaeskens top (y),
       o.fyld dens farve, o.skala en liste af [y, tekst] til streger */
    LAB.baeger = function (g, cx, bund, b, h, o) {
        o = o || {};
        var gg = SV.g(g), x1 = cx - b / 2, x2 = cx + b / 2, top = bund - h, r = 7;
        var r2 = { v: null };
        if (o.top !== undefined) {
            r2.v = SV.el("path", { d: "M" + (x1 + 2) + "," + o.top + " L" + (x1 + 2) + "," + (bund - r) + " Q" + (x1 + 2) + "," + (bund - 2) + " " + (x1 + r + 2) + "," + (bund - 2) +
                " L" + (x2 - r - 2) + "," + (bund - 2) + " Q" + (x2 - 2) + "," + (bund - 2) + " " + (x2 - 2) + "," + (bund - r) + " L" + (x2 - 2) + "," + o.top + " Z",
                fill: o.fyld || LAB.VAND }, gg);
            SV.el("ellipse", { cx: cx, cy: o.top, rx: b / 2 - 2, ry: 3.2, fill: "#ffffff", "fill-opacity": 0.45 }, gg);
        }
        SV.el("path", { d: "M" + (x1 - 5) + "," + (top - 3) + " Q" + x1 + "," + (top - 1) + " " + x1 + "," + (top + 5) + " L" + x1 + "," + (bund - r) + " Q" + x1 + "," + bund + " " + (x1 + r) + "," + bund +
            " L" + (x2 - r) + "," + bund + " Q" + x2 + "," + bund + " " + x2 + "," + (bund - r) + " L" + x2 + "," + top,
            fill: "url(#glas)", "fill-opacity": 0.5, stroke: LAB.KANT, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("line", { x1: x1 + 6, y1: top + 10, x2: x1 + 6, y2: bund - 10, stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        (o.skala || []).forEach(function (s) {
            SV.el("line", { x1: x2 - 14, y1: s[0], x2: x2 - 5, y2: s[0], stroke: "#8a949e", "stroke-width": 1.2 }, gg);
            if (s[1]) SV.tekst(gg, x2 - 16, s[0] + 3.5, s[1], { "font-size": 9.5, fill: "#6b7782", "text-anchor": "end", "font-weight": 700 });
        });
        r2.g = gg;
        return r2;
    };

    /* En maalekolbe med bund i (cx, bund): kugle, lang hals med maerket og
       en prop. o.fyld er vaesken (op til maerket), o.tekst staar paa kuglen */
    LAB.maalekolbe = function (g, cx, bund, o) {
        o = o || {};
        var gg = SV.g(g);
        var R = 46, ky = bund - 40, hb = 9, hTop = bund - (o.hoejde || 168), maerke = hTop + 26;
        function form(fra) {
            return "M" + (cx - hb) + "," + fra + " L" + (cx - hb) + "," + (ky - R + 8) +
                " C" + (cx - hb) + "," + (ky - R + 22) + " " + (cx - R - 4) + "," + (ky - 26) + " " + (cx - R - 4) + "," + (ky + 6) +
                " C" + (cx - R - 4) + "," + (bund - 6) + " " + (cx - R + 8) + "," + bund + " " + (cx - 20) + "," + bund +
                " L" + (cx + 20) + "," + bund + " C" + (cx + R - 8) + "," + bund + " " + (cx + R + 4) + "," + (bund - 6) + " " + (cx + R + 4) + "," + (ky + 6) +
                " C" + (cx + R + 4) + "," + (ky - 26) + " " + (cx + hb) + "," + (ky - R + 22) + " " + (cx + hb) + "," + (ky - R + 8) + " L" + (cx + hb) + "," + fra;
        }
        var krop = form(hTop);
        /* Vaesken staar op til maerket (ingen clipPath: delen tegnes to gange) */
        if (o.fyld) SV.el("path", { d: form(maerke) + " Z", fill: o.fyld }, gg);
        SV.el("path", { d: krop, fill: "url(#glas)", "fill-opacity": 0.45, stroke: LAB.KANT, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("path", { d: "M" + (cx - R + 6) + "," + (ky - 8) + " Q" + (cx - R + 4) + "," + (ky + 18) + " " + (cx - R + 16) + "," + (bund - 12), fill: "none",
            stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        /* Maerket paa halsen */
        SV.el("line", { x1: cx - hb, y1: maerke, x2: cx + hb, y2: maerke, stroke: "#3b4650", "stroke-width": 1.6 }, gg);
        /* Proppen */
        SV.el("rect", { x: cx - hb - 3, y: hTop - 16, width: 2 * hb + 6, height: 18, rx: 4, fill: "#5b8fc9", stroke: "#2f5f94", "stroke-width": 1.2 }, gg);
        if (o.tekst) {
            SV.tekst(gg, cx, ky + 8, o.tekst, { "font-size": 13, "font-weight": 700, fill: "#3b4650" });
            SV.tekst(gg, cx, ky + 23, "20 °C", { "font-size": 10.5, fill: "#5c6873" });
        }
        return { g: gg, maerke: maerke, hTop: hTop, R: R, ky: ky };
    };

    /* En erlenmeyerkolbe med bund i (cx, bund) og hoejden h. o.fyld er vaesken */
    LAB.erlenmeyer = function (g, cx, bund, h, o) {
        o = o || {};
        var gg = SV.g(g);
        var hb = h * 0.12, b = h * 0.48, hals = bund - h, skulder = bund - h * 0.62;
        var krop = "M" + (cx - hb) + "," + hals + " L" + (cx - hb) + "," + skulder + " L" + (cx - b + 6) + "," + (bund - 4) +
            " Q" + (cx - b) + "," + bund + " " + (cx - b + 10) + "," + bund + " L" + (cx + b - 10) + "," + bund + " Q" + (cx + b) + "," + bund + " " + (cx + b - 6) + "," + (bund - 4) +
            " L" + (cx + hb) + "," + skulder + " L" + (cx + hb) + "," + hals;
        var vaeske = null;
        if (o.fyld) {
            var vy = bund - h * (o.niveau || 0.3);
            var t = (bund - vy) / (bund - skulder);
            var vb = b - (b - hb) * t;
            vaeske = SV.el("path", { d: "M" + (cx - vb + 1) + "," + vy + " L" + (cx - b + 7) + "," + (bund - 4) + " Q" + (cx - b + 2) + "," + (bund - 1.5) + " " + (cx - b + 11) + "," + (bund - 1.5) +
                " L" + (cx + b - 11) + "," + (bund - 1.5) + " Q" + (cx + b - 2) + "," + (bund - 1.5) + " " + (cx + b - 7) + "," + (bund - 4) + " L" + (cx + vb - 1) + "," + vy + " Z",
                fill: o.fyld }, gg);
        }
        SV.el("path", { d: krop, fill: "url(#glas)", "fill-opacity": 0.45, stroke: LAB.KANT, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("line", { x1: cx - hb - 4, y1: hals, x2: cx + hb + 4, y2: hals, stroke: LAB.KANT, "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: cx - b * 0.55, y1: bund - h * 0.12, x2: cx - hb - 1, y2: skulder + 6, stroke: "#ffffff", "stroke-width": 2.4, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        if (o.magnet) SV.el("rect", { x: cx - 9, y: bund - 7, width: 18, height: 4.5, rx: 2.2, fill: "#ffffff", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        return { g: gg, vaeske: vaeske, hals: hals, skulder: skulder, b: b };
    };

    /* Luppen: stiplede linjer fra et punkt til en rund lup med lyst indre */
    LAB.lup = function (g, zx, zy, r, fra) {
        var s = { stroke: "#9fb0c4", "stroke-width": 1.2, "stroke-dasharray": "5 4" };
        if (fra) {
            var v = Math.atan2(zy - fra[1], zx - fra[0]), a1 = v + Math.PI / 2 + 0.5, a2 = v - Math.PI / 2 - 0.5;
            SV.el("line", Object.assign({ x1: fra[0], y1: fra[1], x2: zx + r * Math.cos(a1), y2: zy + r * Math.sin(a1) }, s), g);
            SV.el("line", Object.assign({ x1: fra[0], y1: fra[1], x2: zx + r * Math.cos(a2), y2: zy + r * Math.sin(a2) }, s), g);
            SV.el("circle", { cx: fra[0], cy: fra[1], r: 5, fill: "none", stroke: "#6d7d8d", "stroke-width": 1.3 }, g);
        }
        return SV.el("circle", { cx: zx, cy: zy, r: r, fill: "url(#lup)", stroke: "#b7c3cf", "stroke-width": 3, filter: "url(#skygge)" }, g);
    };

    /* Ionerne i luppen */
    LAB.cl = function (g, x, y, r) { return SV.kugle(g, x, y, r || 11, "elektron", "Cl^−"); };
    LAB.na = function (g, x, y, r) { return SV.kugle(g, x, y, r || 8.5, "proton", "Na^+"); };
    LAB.ag = function (g, x, y, r) { return SV.kugle(g, x, y, r || 9.5, "neutron", "Ag^+"); };

    /* Et korn af soelv(I)chlorid: en lille hvid terning */
    LAB.agcl = function (g, x, y, s) {
        s = s || 24;
        var gg = SV.g(g), d = s * 0.22;
        SV.el("path", { d: "M" + (x - s / 2) + "," + (y - s / 2) + " l" + d + "," + (-d) + " l" + s + ",0 l" + (-d) + "," + d + " Z", fill: "#f4f6f8", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        SV.el("path", { d: "M" + (x + s / 2) + "," + (y - s / 2) + " l" + d + "," + (-d) + " l0," + s + " l" + (-d) + "," + d + " Z", fill: "#dfe4e9", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        SV.el("rect", { x: x - s / 2, y: y - s / 2, width: s, height: s, fill: "#ffffff", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        SV.tekst(gg, x, y + s * 0.15, "AgCl", { "font-size": s * 0.33, "font-weight": 700, fill: "#3b4650" });
        return gg;
    };

    /* Indikatoren i luppen: en lille aflang pille uden tekst, gulgroen
       foer omslaget og lyseroed efter (som i bogens figur mohr-trin) */
    LAB.pille = function (g, x, y, lyseroed) {
        return SV.el("rect", { x: x - 15, y: y - 6, width: 30, height: 12, rx: 6,
            fill: lyseroed ? "#f08cb2" : "#cfe06a", stroke: lyseroed ? "#c2477a" : "#93a628", "stroke-width": 1.1 }, g);
    };
}());

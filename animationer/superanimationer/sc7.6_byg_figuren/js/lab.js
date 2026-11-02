/* =====================================================================
   lab.js - kapitel 7's egen tegnehjaelp: glas, lup, kort og pile (fra
   sc6.4) og ioner, molekyler, draabeflaske og reagensglas i bogens
   farver (POS_ og NEG_ i bogens vaerktoej/lav_figurer.py).

   Ikke en del af den faelles motor (som org.js i sc4.9).
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

    /* ----- Kapitel 7: ioner og molekyler i bogens farver ----------------- */
    LAB.POS = { fyld: "#fbd3ca", kant: "#c0392b", tekst: "#7a1f14" };
    LAB.NEG = { fyld: "#cfe0fb", kant: "#1d4ed8", tekst: "#12307f" };
    LAB.SYRE = "#c0392b";                 /* syre i bogens figurer */
    LAB.BASE = "#1d4ed8";                 /* base */
    LAB.HYDRON = "#c0560f";               /* hydronen og pilen, den foelger */

    /* pH-skalaens farver fra -1 til 15 som i bogens figur ph-skala */
    LAB.PH_FARVER = ["#6e140d", "#8f1d14", "#b52a1e", "#d1432f", "#e06a52", "#ec9580", "#f4bcae", "#fae0d9", "#eef1ef",
        "#dbe7fb", "#b9d0f7", "#93b4f0", "#6a93e6", "#4672d8", "#2b55c0", "#1b3c96", "#122a6e"];

    /* Gloed og vindue lægges i de faelles defs én gang */
    LAB.gradienter = function () {
        var defs = document.querySelector("#faelles-defs defs");
        if (!defs) return;
        [["k7-glod-pos", "#e8584a"], ["k7-glod-neg", "#3d6fe0"]].forEach(function (gr) {
            if (document.getElementById(gr[0])) return;
            var el = SV.el("radialGradient", { id: gr[0], cx: 0.5, cy: 0.5, r: 0.5 }, defs);
            SV.el("stop", { offset: 0, "stop-color": gr[1], "stop-opacity": 0.42 }, el);
            SV.el("stop", { offset: 0.6, "stop-color": gr[1], "stop-opacity": 0.16 }, el);
            SV.el("stop", { offset: 1, "stop-color": gr[1], "stop-opacity": 0 }, el);
        });
        [["k7-vindue", "#f5f9fc", "#e3eef7"], ["k7-sur", "#fdf3f1", "#f8dcd6"], ["k7-basisk", "#f2f6fe", "#d9e5fb"]].forEach(function (gr) {
            if (document.getElementById(gr[0])) return;
            var el = SV.el("linearGradient", { id: gr[0], x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
            SV.el("stop", { offset: 0, "stop-color": gr[1] }, el);
            SV.el("stop", { offset: 1, "stop-color": gr[2] }, el);
        });
    };

    /* En ion som kugle med formlen (bogens ionkugle) */
    LAB.ion = function (g, x, y, r, tekst, positiv) {
        var f = positiv ? LAB.POS : LAB.NEG, gg = SV.g(g);
        SV.el("circle", { cx: x, cy: y, r: r, fill: f.fyld, stroke: f.kant, "stroke-width": 1.4 }, gg);
        SV.tekst(gg, x, y + r * 0.3, tekst, { "font-size": r * (tekst.length > 5 ? 0.66 : 0.78), "font-weight": 700, fill: f.tekst });
        return gg;
    };

    /* Et molekyle eller en sammensat ion som pille med formlen (bogens
       k7_molekylepille og acetatpille): graa uden ladning, blaa med minus */
    LAB.molPille = function (g, x, y, tekst, b, negativ) {
        b = b || 74;
        var gg = SV.g(g);
        SV.el("rect", { x: x - b / 2, y: y - 12, width: b, height: 24, rx: 12, fill: negativ ? LAB.NEG.fyld : "#eef1f2",
            stroke: negativ ? LAB.NEG.kant : "#6b7780", "stroke-width": 1.3 }, gg);
        SV.tekst(gg, x, y + 4.5, tekst, { "font-size": 12, "font-weight": 700, fill: negativ ? LAB.NEG.tekst : "#14201f" });
        return gg;
    };

    /* Oxoniumion som kuglemodel: O med tre H, roed gloed og et plus */
    LAB.oxonium = function (g, x, y, s, bleg) {
        s = s || 1;
        var gg = SV.g(g, bleg ? { opacity: 0.38 } : null);
        SV.el("circle", { cx: x, cy: y, r: 24 * s, fill: "url(#k7-glod-pos)" }, gg);
        [[-11, -7], [11, -7], [0, 11]].forEach(function (d) { SV.kugle(gg, x + d[0] * s, y + d[1] * s, 6 * s, "H"); });
        SV.kugle(gg, x, y, 9.5 * s, "O");
        SV.tekst(gg, x + 15 * s, y - 10 * s, "+", { "font-size": 15 * s, "font-weight": 800, fill: LAB.POS.kant });
        return gg;
    };

    /* Hydroxidion som kuglemodel: O med ét H, blaa gloed og et minus */
    LAB.hydroxid = function (g, x, y, s, bleg) {
        s = s || 1;
        var gg = SV.g(g, bleg ? { opacity: 0.38 } : null);
        SV.el("circle", { cx: x, cy: y, r: 24 * s, fill: "url(#k7-glod-neg)" }, gg);
        SV.kugle(gg, x + 9 * s, y - 7 * s, 6 * s, "H");
        SV.kugle(gg, x - 1 * s, y + 1 * s, 10.5 * s, "O");
        SV.tekst(gg, x + 15 * s, y - 9 * s, "−", { "font-size": 16 * s, "font-weight": 800, fill: LAB.NEG.kant });
        return gg;
    };

    /* Et vandmolekyle, svagt i baggrunden */
    LAB.vand = function (g, x, y, s, v) {
        s = s || 1;
        var gg = SV.g(g, { opacity: 0.32, transform: "rotate(" + (v || 0) + " " + x + " " + y + ")" });
        SV.kugle(gg, x - 7 * s, y + 5 * s, 4.5 * s, "H");
        SV.kugle(gg, x + 7 * s, y + 5 * s, 4.5 * s, "H");
        SV.kugle(gg, x, y, 7 * s, "O");
        return gg;
    };

    /* En brun draabeflaske med roed hætte og en etiket; (x, y) er
       flaskens oeverste venstre hjoerne (uden haette) */
    LAB.draabeflaske = function (g, x, y, b, h, etiket) {
        var gg = SV.g(g), cx = x + b / 2;
        SV.el("ellipse", { cx: cx, cy: y + h + 2, rx: b * 0.7, ry: 3.5, fill: "rgba(60,70,80,0.18)" }, gg);
        SV.el("path", { d: "M" + (x + 4) + "," + (y + 16) + " Q" + x + "," + (y + 18) + " " + x + "," + (y + 26) + " L" + x + "," + (y + h - 5) + " Q" + x + "," + (y + h) + " " + (x + 5) + "," + (y + h) +
            " L" + (x + b - 5) + "," + (y + h) + " Q" + (x + b) + "," + (y + h) + " " + (x + b) + "," + (y + h - 5) + " L" + (x + b) + "," + (y + 26) + " Q" + (x + b) + "," + (y + 18) + " " + (x + b - 4) + "," + (y + 16) + " Z",
            fill: "#9a6a3c", stroke: "#5e3d1d", "stroke-width": 1.2 }, gg);
        SV.el("rect", { x: x + 3, y: y + 22, width: 3, height: h - 32, rx: 1.5, fill: "#ffffff", opacity: 0.35 }, gg);
        SV.el("rect", { x: x + 4, y: y + 32, width: b - 8, height: 20, rx: 2, fill: "#ffffff", stroke: "#d8cfc4", "stroke-width": 0.8 }, gg);
        if (etiket) SV.tekst(gg, cx, y + 46, etiket, { "font-size": 11, "font-weight": 700, fill: "#3b4650" });
        SV.el("rect", { x: cx - 6, y: y + 6, width: 12, height: 11, fill: "#f2f2f2", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        SV.el("path", { d: "M" + (cx - 6) + "," + (y + 7) + " L" + (cx - 6) + "," + (y - 10) + " Q" + cx + "," + (y - 19) + " " + (cx + 6) + "," + (y - 10) + " L" + (cx + 6) + "," + (y + 7) + " Z",
            fill: "#c94a3c", stroke: "#8e2d22", "stroke-width": 1 }, gg);
        return gg;
    };

    /* Et reagensglas med vaeske; top er kanten, bund er den runde bund */
    LAB.reagensglas = function (g, cx, top, bund, b, fyld, niveau) {
        var gg = SV.g(g), r = b / 2, vy = bund - (bund - top) * (niveau || 0.55);
        SV.el("path", { d: "M" + (cx - r + 2) + "," + vy + " L" + (cx - r + 2) + "," + (bund - r) + " A" + (r - 2) + "," + (r - 2) + " 0 0,0 " + (cx + r - 2) + "," + (bund - r) + " L" + (cx + r - 2) + "," + vy + " Z", fill: fyld }, gg);
        SV.el("ellipse", { cx: cx, cy: vy, rx: r - 2, ry: 2.4, fill: "#ffffff", opacity: 0.4 }, gg);
        SV.el("path", { d: "M" + (cx - r) + "," + top + " L" + (cx - r) + "," + (bund - r) + " A" + r + "," + r + " 0 0,0 " + (cx + r) + "," + (bund - r) + " L" + (cx + r) + "," + top,
            fill: "url(#glas)", "fill-opacity": 0.5, stroke: LAB.KANT, "stroke-width": 1.7 }, gg);
        SV.el("line", { x1: cx - r - 3, y1: top, x2: cx + r + 3, y2: top, stroke: LAB.KANT, "stroke-width": 2.2, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: cx - r + 5, y1: top + 10, x2: cx - r + 5, y2: bund - r - 4, stroke: "#ffffff", "stroke-width": 2.6, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        return gg;
    };

    /* En brøk med streg: x er venstre kant, yc stregens hoejde. Giver hoejre kant */
    LAB.broek = function (g, x, yc, over, under, fs, farve) {
        var b = Math.max(NK.tekstBredde(over, fs, 400), NK.tekstBredde(under, fs, 400)) + 10;
        SV.tekst(g, x + b / 2, yc - 7, over, { "font-size": fs, fill: farve || F.tekst });
        SV.el("line", { x1: x, y1: yc, x2: x + b, y2: yc, stroke: farve || F.tekst, "stroke-width": 1.4 }, g);
        SV.tekst(g, x + b / 2, yc + fs + 2, under, { "font-size": fs, fill: farve || F.tekst });
        return x + b;
    };
}());

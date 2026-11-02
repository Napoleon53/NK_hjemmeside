/* =====================================================================
   b2.js - kapitel B2's egen tegnehjaelp

   Bygger videre paa kurver.js (graferne, kortene og partiklerne A og B
   fra kapitel B1) med det, kapitel B2's figurer har brug for, i samme
   stil som B-bogens figurer (vaerktoej/lav_figurer.py):
   - molekylerne N₂O₄ og NO₂ (b25_atomer) og vinduet ind i gassen
     (sf_b2_beholder) til dynamisk-ligevaegt,
   - kort med nummer og titel (sf_b2_kort),
   - bægerglas i let perspektiv med bundfald (fl_baegerglas, glas_tud),
   - ionerne Pb²⁺, NO₃⁻, K⁺ og I⁻ (fl_kugle med FL_FARVE),
   - iongitteret af PbI₂ set lidt oppefra (pt_pbi2) og smaa vandmolekyler.
   Ikke en del af den faelles motor.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;
    var B2 = NK.B2 = {};

    /* Bogens farver, der ikke er i kurver.js */
    B2.F = {
        lilla: "#6d4bb5",            /* SERIE_C: reaktionen mod venstre, udfaeldes */
        pbiKant: "#b38a00"           /* kanten paa bly(II)iodid */
    };

    /* ----- Farveforloeb i motorens faelles defs ------------------------- */
    var harDefs = false;
    function grad(d, id, stop, o) {
        o = o || {};
        var g = SV.el(o.lin ? "linearGradient" : "radialGradient", o.lin ? (o.x ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : { id: id, x1: 0, x2: 0, y1: 0, y2: 1 })
            : { id: id, cx: o.cx || "0.36", cy: o.cy || "0.32", r: o.r || "0.72" }, d);
        stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
    }
    B2.defs = function () {
        KV.defs();
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        /* Ionerne (FL_DEFS): Pb²⁺ roed, NO₃⁻ blaa, K⁺ orange, I⁻ lilla */
        grad(d, "b2-pos", [["0", "#fff6f2"], ["0.35", "#f8b9a8"], ["0.85", "#d9634c"], ["1", "#b8432f"]]);
        grad(d, "b2-neg", [["0", "#f5f9ff"], ["0.35", "#b3cdf8"], ["0.85", "#5a86d6"], ["1", "#3a63b8"]]);
        grad(d, "b2-orange", [["0", "#fffaf0"], ["0.35", "#fde0a8"], ["0.85", "#f0a445"], ["1", "#d4821f"]]);
        grad(d, "b2-lilla", [["0", "#fbf6ff"], ["0.35", "#dcc4f4"], ["0.85", "#9b62d1"], ["1", "#7a40b2"]]);
        /* Lup og vindue */
        grad(d, "b2-vand", [["0", "#fbfdff"], ["0.7", "#e3eff9"], ["1", "#cfe2f3"]], { cx: "0.42", cy: "0.36", r: "0.75" });
        grad(d, "b2-vindue-vand", [["0", "#f7fbfe"], ["1", "#dbe9f4"]], { lin: true });
        grad(d, "b2-gas", [["0", "#ffffff"], ["1", "#e9eef2"]], { lin: true });
        /* Glassene */
        grad(d, "b2-glas", [["0", "#9fb4c2", 0.55], ["0.12", "#ffffff", 0.15], ["0.2", "#ffffff", 0.75], ["0.28", "#ffffff", 0.1], ["0.85", "#ffffff", 0.05], ["1", "#9fb4c2", 0.6]], { lin: true, x: true });
        grad(d, "b2-blaa", [["0", "#dcecf8"], ["1", "#bcd7ee"]], { lin: true });
        grad(d, "b2-gul", [["0", "#fbf3c4"], ["1", "#f3df86"]], { lin: true });
        grad(d, "b2-bundfald", [["0", "#ffd83a"], ["1", "#d9a400"]], { lin: true });
        grad(d, "b2-korn", [["0", "#fff6c2"], ["0.5", "#f6cf2a"], ["1", "#c79400"]], { cx: "0.35", cy: "0.3", r: "0.75" });
        grad(d, "b2-skygge", [["0", "#5b6b78", 0.35], ["1", "#5b6b78", 0]], { cx: "0.5", cy: "0.5", r: "0.5" });
        grad(d, "b2-kegle", [["0", "#7f97ab", 0.22], ["1", "#7f97ab", 0.04]], { lin: true });
        grad(d, "b2-felt", [["0", "#0f766e", 0.15], ["1", "#0f766e", 0.07]], { lin: true, x: true });
        grad(d, "b2-skyder", [["0", "#9fd3c9"], ["1", "#f2c28c"]], { lin: true, x: true });
    };

    /* En lille, fast talraekke (samme figur hver gang) */
    B2.tilfaeldig = function (fro) {
        var a = fro >>> 0;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    };

    /* ----- Kort med nummer og titel (sf_b2_kort) ------------------------- */
    B2.nrTitel = function (g, x, y, nr, titel) {
        var gg = SV.g(g);
        SV.el("circle", { cx: x + 24, cy: y + 24, r: 12, fill: F.accent }, gg);
        KV.tekst(gg, x + 24, y + 29, String(nr), { fs: 14, fed: true, farve: "#ffffff" });
        KV.tekst(gg, x + 44, y + 29.5, titel, { fs: 16, fed: true, farve: F.accent, anker: "start" });
        return gg;
    };

    /* ----- Molekylerne N₂O₄ og NO₂ (b25_atomer) ------------------------ */
    function atomer(slags, x, y, v, s) {
        s = s || 1;
        var ud = [];
        if (slags === "O2" || slags === "H2") {
            var d2 = slags === "O2" ? 5.6 : 3.4, r2 = slags === "O2" ? 7.5 : 4.8, a2 = slags === "O2" ? "O" : "H";
            [0, 180].forEach(function (k) { var p = KV.polar(x, y, d2 * s, v + k); ud.push([p[0], p[1], r2 * s, a2]); });
            return ud;
        }
        if (slags === "H2O") {
            [-52, 52].forEach(function (k) { var p = KV.polar(x, y, 8.4 * s, v + k); ud.push([p[0], p[1], 4.8 * s, "H"]); });
            ud.push([x, y, 7.5 * s, "O"]);
            return ud;
        }
        if (slags === "NO2") {
            [-67, 67].forEach(function (k) { var p = KV.polar(x, y, 8.6 * s, v + k); ud.push([p[0], p[1], 6.0 * s, "O"]); });
            ud.push([x, y, 6.4 * s, "N"]);
        } else {
            var n1 = KV.polar(x, y, 6.4 * s, v + 180), n2 = KV.polar(x, y, 6.4 * s, v);
            [-67, 67].forEach(function (k) { var p = KV.polar(n1[0], n1[1], 8.6 * s, v + 180 + k); ud.push([p[0], p[1], 6.0 * s, "O"]); });
            [-67, 67].forEach(function (k) { var p = KV.polar(n2[0], n2[1], 8.6 * s, v + k); ud.push([p[0], p[1], 6.0 * s, "O"]); });
            ud.push([n1[0], n1[1], 6.4 * s, "N"], [n2[0], n2[1], 6.4 * s, "N"]);
        }
        return ud;
    }
    B2.molekyle = function (g, slags, x, y, v, s) {
        var gg = SV.g(g);
        atomer(slags, x, y, v, s).forEach(function (a) { SV.kugle(gg, a[0], a[1], a[2], a[3]); });
        return gg;
    };

    /* Pladser til molekylerne i et rektangel, uden at to atomer roerer
       hinanden (b25_spred). Giver [[slags, x, y, v], ...] */
    B2.spred = function (slags, x0, y0, x1, y1, fro, s, luft) {
        luft = luft === undefined ? 10 : luft;
        for (var forsoeg = 0; forsoeg < 200; forsoeg++) {
            var rnd = B2.tilfaeldig(fro + 7919 * forsoeg), alle = [], ud = [], ok = true;
            for (var i = 0; i < slags.length && ok; i++) {
                var lagt = false;
                for (var n = 0; n < 3000 && !lagt; n++) {
                    var m = [slags[i], x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0), rnd() * 360];
                    var ny = atomer(m[0], m[1], m[2], m[3], s);
                    var inde = ny.every(function (a) { return a[0] - a[2] >= x0 && a[0] + a[2] <= x1 && a[1] - a[2] >= y0 && a[1] + a[2] <= y1; });
                    if (!inde) continue;
                    var fri = ny.every(function (a) {
                        return alle.every(function (b) { return Math.hypot(a[0] - b[0], a[1] - b[1]) >= a[2] + b[2] + luft; });
                    });
                    if (!fri) continue;
                    ud.push(m);
                    alle = alle.concat(ny);
                    lagt = true;
                }
                if (!lagt) ok = false;
            }
            if (ok) return ud;
        }
        return [];
    };

    /* Akser og net som KV.diagram, men uden tal paa tidsaksen (o.xtitel staar
       under aksen). Giver { X, Y } med X(t) for t fra 0 til o.xmax. */
    B2.akser = function (g, o) {
        var X = function (v) { return o.xa + (o.xb - o.xa) * v / o.xmax; };
        var Y = function (v) { return o.yb - (o.yb - o.ya) * v / o.ymax; };
        var luft = 8, n, v;
        KV.flade(g, o.xa, o.ya - luft, o.xb + luft, o.yb);
        for (n = 1; n * o.ytrin <= o.ymax + 1e-9; n++) KV.linje(g, o.xa, Y(n * o.ytrin), o.xb + luft, Y(n * o.ytrin), F.net, 1);
        KV.linje(g, o.xa, o.yb, o.xb + luft, o.yb, F.daempet, 1.3);
        KV.linje(g, o.xa, o.ya - luft, o.xa, o.yb, F.daempet, 1.3);
        for (n = 0; n * o.ytrin <= o.ymax + 1e-9; n++) {
            v = n * o.ytrin;
            KV.linje(g, o.xa - 5, Y(v), o.xa, Y(v), F.daempet, 1.2);
            KV.tekst(g, o.xa - 10, Y(v) + 4.5, v.toFixed(o.ydec === undefined ? 1 : o.ydec).replace(".", ","), { fs: 13, anker: "end", farve: F.daempet });
        }
        if (o.xtitel) KV.tekst(g, (o.xa + o.xb) / 2, o.yb + 26, o.xtitel, { fs: 13.5, farve: F.daempet });
        if (o.ytitel) {
            var yx = o.xa - (o.yafst || 48), ym = (o.ya + o.yb) / 2;
            KV.tekst(g, yx, ym, o.ytitel, { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + yx + " " + ym + ")" });
        }
        return { X: X, Y: Y };
    };

    /* Et vindue ind i gassen eller vandet (sf_b2_beholder): lys ramme om en
       baggrund med farveforloeb; indhold(gg) tegnes klippet til vinduet */
    B2.vindue = function (g, x, y, b, h, indhold, fyld) {
        var gg = SV.g(g), id = KV.id("vindue");
        var cp = SV.el("clipPath", { id: id }, gg);
        SV.el("rect", { x: x, y: y, width: b, height: h, rx: 12 }, cp);
        SV.el("rect", { x: x, y: y, width: b, height: h, rx: 12, fill: fyld || "url(#b2-gas)" }, gg);
        var ind = SV.g(gg, { "clip-path": "url(#" + id + ")" });
        if (indhold) indhold(ind);
        SV.el("rect", { x: x, y: y, width: b, height: h, rx: 12, fill: "none", stroke: "#7d93a3", "stroke-width": 1.6 }, gg);
        SV.el("rect", { x: x + 2.5, y: y + 2.5, width: b - 5, height: h - 5, rx: 10, fill: "none", stroke: "#ffffff", "stroke-width": 1.2, opacity: 0.85 }, gg);
        return gg;
    };

    /* ----- Ionerne (fl_kugle med FL_FARVE) ------------------------------ */
    var ION = {
        "Pb^2+":  ["b2-pos", "#9c3424", "#5a140b"],
        "NO_3^−": ["b2-neg", "#2c4f98", "#0d2563"],
        "K^+":    ["b2-orange", "#a65a12", "#4a2204"],
        "I^−":    ["b2-lilla", "#5e2a91", "#2e0b52"]
    };
    B2.ION_R = { "Pb^2+": 12, "NO_3^−": 15.5, "K^+": 12.5, "I^−": 17 };
    B2.ion = function (g, x, y, navn, r, fs, taage) {
        var f = ION[navn], gg = SV.g(g);
        r = r || B2.ION_R[navn];
        SV.el("circle", { cx: x, cy: y, r: r, fill: "url(#" + f[0] + ")", stroke: f[1], "stroke-width": 0.8, "stroke-opacity": 0.6 }, gg);
        if (taage) SV.el("circle", { cx: x, cy: y, r: r + 0.5, fill: "#f2f7fb", "fill-opacity": taage }, gg);
        if (fs !== 0) {
            fs = fs || (navn === "Pb^2+" || navn === "NO_3^−" ? 10 : 12);
            var t = SV.tekst(gg, x, y + fs * 0.36, navn, { "font-size": fs, "font-weight": 700, fill: f[2] });
            if (taage) t.setAttribute("opacity", (1 - taage * 0.8).toFixed(2));
        }
        return gg;
    };

    /* Et lille, svagt vandmolekyle i baggrunden (fl_vandmolekyle) */
    B2.vand = function (g, x, y, v, s, op) {
        var gg = SV.g(g, { opacity: op || 0.38, transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + Math.round(v) + ") scale(" + (s || 1) + ")" });
        SV.el("circle", { cx: -5.2, cy: 3.6, r: 3.2, fill: "#ffffff", stroke: "#9aaebd", "stroke-width": 0.7 }, gg);
        SV.el("circle", { cx: 5.2, cy: 3.6, r: 3.2, fill: "#ffffff", stroke: "#9aaebd", "stroke-width": 0.7 }, gg);
        SV.el("circle", { cx: 0, cy: 0, r: 5.2, fill: "#a9bccb", stroke: "#7d93a5", "stroke-width": 0.7 }, gg);
        return gg;
    };

    /* Vandmolekyler spredt i et omraade, hvor fri(x, y) er sandt */
    B2.vandI = function (g, x0, y0, x1, y1, n, fro, fri) {
        var rnd = B2.tilfaeldig(fro), lagt = [];
        for (var k = 0; k < n * 40 && lagt.length < n; k++) {
            var x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
            if (fri && !fri(x, y)) continue;
            if (lagt.some(function (p) { return Math.hypot(p[0] - x, p[1] - y) < 22; })) continue;
            lagt.push([x, y]);
            B2.vand(g, x, y, rnd() * 360, 0.95);
        }
    };

    /* ----- Iongitteret af PbI₂ set lidt oppefra (pt_pbi2) -------------
       x0, y0 er midten af den nederste iodidion forrest til venstre. Kun de
       forreste ioner, som synlig(x, y, r) siger er inde i billedet, faar navn.
       Giver kuglerne som [x, y, r]. */
    B2.RI = 22;
    B2.RP = 13.5;
    B2.gitter = function (g, x0, y0, kol, ark, synlig) {
        var RI = B2.RI, RP = B2.RP, a = 2 * RI + 1, hz = RI + RP - 4;
        var dx = -a * 0.40, dy = -a * 0.28, kugler = [];
        for (var n = 0; n < ark; n++) {
            var y = y0 - n * (2 * hz + 2 * RI + 5);
            [1, 0].forEach(function (d) {
                for (var k = 0; k < kol; k++) {
                    var x = x0 + k * a + d * dx;
                    kugler.push([d, false, x, y + d * dy]);
                    kugler.push([d, true, x + a / 2, y - hz + d * dy]);
                    kugler.push([d, false, x, y - 2 * hz + d * dy]);
                }
            });
        }
        kugler.sort(function (p, q) { return (q[0] - p[0]) || ((p[1] ? 0 : 1) - (q[1] ? 0 : 1)); });
        kugler.forEach(function (k) {
            var r = k[1] ? RP : RI, navn = !k[0] && (!synlig || synlig(k[2], k[3], r));
            B2.ion(g, k[2], k[3], k[1] ? "Pb^2+" : "I^−", r, navn ? (k[1] ? 10 : 14) : 0, 0.45 * k[0]);
        });
        return kugler.map(function (k) { return [k[2], k[3], k[1] ? RP : RI]; });
    };
    B2.gitterHz = function () { return B2.RI + B2.RP - 4; };

    /* ----- Bægerglas i let perspektiv (fl_baegerglas) --------------------
       slags: "blaa" eller "gul". o.inde(gg) tegner noget i vaesken (klippet).
       Giver { vy, top, rx, ry }. */
    function tud(g, cx, top, rx, ry) {
        var k = Math.cos(14 * Math.PI / 180), x1 = cx - rx * k, ya = top - ry * 0.24, yb = top + ry * 0.24;
        var tx = cx - rx - 6.5, ty = top - 2.5;
        SV.el("path", { d: "M " + x1.toFixed(1) + "," + ya.toFixed(1) + " Q " + (cx - rx - 2).toFixed(1) + "," + (ya - 0.8).toFixed(1) + " " + tx.toFixed(1) + "," + ty.toFixed(1) +
            " Q " + (cx - rx - 1.5).toFixed(1) + "," + (top + 1.5).toFixed(1) + " " + x1.toFixed(1) + "," + yb.toFixed(1) + " Z",
            fill: "#f3f7f9", stroke: "#6f8796", "stroke-width": 2, "stroke-linejoin": "round" }, g);
    }
    function vaeskeSti(cx, bund, rx, ry, vy) {
        return "M " + (cx - rx + 2) + "," + vy + " V " + (bund - ry * 0.2) + " A " + (rx - 2) + " " + ry + " 0 0 0 " + (cx + rx - 2) + "," + (bund - ry * 0.2) + " V " + vy + " Z";
    }
    B2.baeger = function (g, cx, bund, b, h, niveau, slags, o) {
        o = o || {};
        var gg = SV.g(g), rx = b / 2, ry = b * 0.11, top = bund - h, vy = bund - h * niveau, gul = slags === "gul";
        SV.el("ellipse", { cx: cx, cy: bund + 6, rx: rx * 1.25, ry: ry * 1.6, fill: "url(#b2-skygge)" }, gg);
        SV.el("path", { d: vaeskeSti(cx, bund, rx, ry, vy), fill: gul ? "url(#b2-gul)" : "url(#b2-blaa)", opacity: 0.92 }, gg);
        if (o.inde) {
            var id = KV.id("glas");
            var cp = SV.el("clipPath", { id: id }, gg);
            SV.el("path", { d: vaeskeSti(cx, bund, rx, ry, vy) }, cp);
            o.inde(SV.g(gg, { "clip-path": "url(#" + id + ")" }), vy);
        }
        SV.el("ellipse", { cx: cx, cy: vy, rx: rx - 2, ry: ry, fill: gul ? "#fdf8dc" : "#eef6fc", stroke: gul ? "#e6d48a" : "#a9c8e2", "stroke-width": 1 }, gg);
        B2.glasForside(gg, cx, bund, b, h);
        return { g: gg, vy: vy, top: top, rx: rx, ry: ry };
    };
    /* Selve glasset (forsiden): tegnes igen oven paa et bundfald, der er
       en del for sig, saa bundfaldet ligger inde i glasset */
    B2.glasForside = function (g, cx, bund, b, h, kunGlas) {
        var rx = b / 2, ry = b * 0.11, top = bund - h;
        SV.el("path", { d: "M " + (cx - rx) + "," + top + " V " + (bund - ry * 0.2) + " A " + rx + " " + ry + " 0 0 0 " + (cx + rx) + "," + (bund - ry * 0.2) + " V " + top,
            fill: "url(#b2-glas)", stroke: "#6f8796", "stroke-width": 2.2, "stroke-linejoin": "round" }, g);
        if (kunGlas) return;
        SV.el("ellipse", { cx: cx, cy: top, rx: rx, ry: ry, fill: "none", stroke: "#6f8796", "stroke-width": 2 }, g);
        tud(g, cx, top, rx, ry);
        var trin = h * 0.18;
        for (var k = 0; k < 4; k++) {
            var y = bund - h * 0.2 - k * trin;
            SV.el("path", { d: "M " + (cx + rx * 0.35) + "," + y.toFixed(1) + " h " + (k % 2 ? 14 : 22), stroke: "#6f8796", "stroke-width": 1.2, opacity: 0.7 }, g);
        }
        SV.el("path", { d: "M " + (cx - rx * 0.72) + "," + (top + 14) + " V " + (bund - 18), stroke: "#ffffff", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.7 }, g);
        SV.el("path", { d: "M " + (cx - rx * 0.55) + "," + (top + 18) + " V " + (top + h * 0.3), stroke: "#ffffff", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.6 }, g);
    };

    /* Det gule bundfald af bly(II)iodid i bunden af et glas fra B2.baeger:
       en ujaevn bunke med glimt. hb er bunkens hoejde. Giver bunkens top
       (den laveste y). Glassets forside tegnes oven paa, saa bundfaldet
       ligger inde i glasset. */
    B2.bundfald = function (g, cx, bund, b, h, hb, fro) {
        var gg = SV.g(g), rx = b / 2, ry = b * 0.11, rnd = B2.tilfaeldig(fro || 3), pts = [], topY = 1e9;
        hb = hb || 15;
        for (var k = 0; k < 15; k++) {
            var t = k / 14, x = cx - rx + 4 + t * (b - 8);
            var y = bund - ry * 0.2 - hb - hb * 0.45 * Math.sin(t * Math.PI) - (rnd() * 4 - 2);
            topY = Math.min(topY, y);
            pts.push(x.toFixed(1) + "," + y.toFixed(1));
        }
        SV.el("path", { d: "M " + (cx - rx + 2) + "," + (bund - hb * 0.66) + " L " + pts.join(" L ") + " L " + (cx + rx - 2) + "," + (bund - hb * 0.66) +
            " V " + (bund - ry * 0.2) + " A " + (rx - 2) + " " + ry + " 0 0 1 " + (cx - rx + 2) + "," + (bund - ry * 0.2) + " Z",
            fill: "url(#b2-bundfald)", stroke: B2.F.pbiKant, "stroke-width": 0.8 }, gg);
        for (var i = 0; i < Math.round(b / 4.5); i++) {
            SV.el("circle", { cx: (cx + (rnd() * 2 - 1) * (rx - 10)).toFixed(1), cy: (bund - hb * 0.9 - rnd() * hb * 0.8 + 8).toFixed(1),
                r: (0.8 + rnd()).toFixed(1), fill: "#fff2a0", opacity: 0.8 }, gg);
        }
        B2.glasForside(gg, cx, bund, b, h, true);
        return topY;
    };

    /* Gule korn, der svaever og synker i et glas */
    B2.fnug = function (g, cx, y0, y1, bredde, n, fro, fri) {
        var rnd = B2.tilfaeldig(fro), lagt = 0;
        for (var k = 0; k < n * 20 && lagt < n; k++) {
            var x = cx + (rnd() - 0.5) * bredde, y = y0 + rnd() * (y1 - y0);
            if (fri && !fri(x, y)) continue;
            SV.el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: (1.6 + rnd() * 1.2).toFixed(1), fill: "url(#b2-korn)", stroke: B2.F.pbiKant, "stroke-width": 0.6 }, g);
            lagt++;
        }
    };

    /* Dobbeltpilen i et reaktionsskema: to halve pilespidser, mod hoejre
       foroven og mod venstre forneden, midt om y */
    B2.dobbeltpil = function (g, x0, x1, y, farve, sw, h) {
        var gg = SV.g(g), a = { fill: "none", stroke: farve || F.blaek, "stroke-width": sw || 2.4, "stroke-linecap": "round", "stroke-linejoin": "round" };
        h = h || 10;
        var y1 = y - 4, y2 = y + 4;
        SV.el("path", Object.assign({ d: "M" + x0 + "," + y1 + " H" + x1 + " L" + (x1 - h) + "," + (y1 - h * 0.7) }, a), gg);
        SV.el("path", Object.assign({ d: "M" + x1 + "," + y2 + " H" + x0 + " L" + (x0 + h) + "," + (y2 + h * 0.7) }, a), gg);
        return gg;
    };

    /* Teksten med formler i flere farver: stykker = [[tekst, farve], ...]
       sat efter hinanden fra x (anker start). Giver bredden. */
    B2.stykker = function (g, x, y, stykker, o) {
        o = o || {};
        var fs = o.fs || 20, vaegt = o.fed ? 700 : 400, xx = x;
        stykker.forEach(function (s) {
            SV.tekst(g, xx, y, s[0], { "font-size": fs, "font-weight": vaegt, fill: s[1] || F.blaek, "text-anchor": "start" });
            xx += B2.bredde(s[0], fs, vaegt);
        });
        return xx - x;
    };

    /* Bredden af en tekst med _ og ^ (som SV.tekst tegner den). Den maales
       i et skjult svg-element, for et canvas kan vaelge en anden reserveskrift
       end svg-teksten (paa Linux var ionreaktionen i B2.7 20 enheder bredere
       end maalt). Canvas bruges kun, hvis svg-maalingen ikke kan lade sig goere. */
    var maaleSvg = null;
    B2.bredde = function (s, fs, vaegt) {
        try {
            if (!maaleSvg && document.body) {
                maaleSvg = SV.el("svg", { width: 10, height: 10, "aria-hidden": "true", style: "position:absolute;left:-9999px;top:0;visibility:hidden" });
                document.body.appendChild(maaleSvg);
            }
            if (maaleSvg) {
                var t = SV.tekst(maaleSvg, 0, 20, s, { "font-size": fs, "font-weight": vaegt || 400 });
                var bw = t.getComputedTextLength();
                maaleSvg.removeChild(t);
                if (bw > 0) return bw;
            }
        } catch (x) { /* canvas nedenfor */ }
        var dele = String(s).split(/([_^](?:\{[^}]*\}|[0-9+−\-]+))/), w = 0;
        dele.forEach(function (d) {
            if (!d) return;
            if (/^[_^]/.test(d)) w += NK.tekstBredde(d.slice(1).replace(/[{}]/g, ""), fs * 0.68, vaegt);
            else w += NK.tekstBredde(d, fs, vaegt);
        });
        return w;
    };
}());

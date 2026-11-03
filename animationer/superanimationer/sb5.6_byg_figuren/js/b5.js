/* =====================================================================
   b5.js - kapitel B5's egen tegnehjaelp

   Bygger videre paa kurver.js (graferne og kortene fra kapitel B1) med
   det, kapitel B5's figurer har brug for, i samme stil som B-bogens
   figurer (Kemibogen/vaerktoej/lav_figurer.py, sf_b5_...):
   - lysets farver (lysfarve, regnbue),
   - kuvetter i let perspektiv (sf_b5_kuvette) og lysstraaler, der
     gloeder og bliver svagere i vaesken (sf_b5_straale, sf_b5_svind),
   - lampen, oejet og permanganationerne (sf_b5_lampe, sf_b5_oeje,
     sf_b5_partikler),
   - akserne og kurven til et absorptionsspektrum (sf_b5_spektrum_...),
   - kuvettestativet (sf_b5_stativ), en maalekolbe og en zigzagkaede.
   Ikke en del af den faelles motor.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;
    var B5 = NK.B5 = {};

    /* Bogens farver (lav_figurer.py) */
    B5.F = {
        roed: "#e2402f", gul: "#f4d935", blaa: "#2f8fe0", lilla: "#9b45c9", orange: "#f08a24",
        glasKant: "#6f8796",
        eps: "#6d3fb0",              /* ekstinktionskoefficienten i formlen */
        l: "#b45309",                /* lysvejen */
        c: "#0f766e"                 /* koncentrationen */
    };

    /* ----- Farver ------------------------------------------------------- */
    function hex(r, g, b) {
        return "#" + [r, g, b].map(function (v) { var s = Math.round(Math.max(0, Math.min(255, v))).toString(16); return s.length < 2 ? "0" + s : s; }).join("");
    }
    function rgb(h) { return [1, 3, 5].map(function (k) { return parseInt(h.slice(k, k + 2), 16); }); }

    /* gs_blanding: farven a blandet med b, t = 0 er a, t = 1 er b */
    B5.blanding = function (a, b, t) {
        var x = rgb(a), y = rgb(b);
        return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
    };

    /* fortyndet: andel 0 er naesten farveloes, 1 er den fulde farve */
    B5.fortyndet = function (farve, andel) { return B5.blanding("#f1f7fa", farve, andel); };

    var LYSTONER = [[400, 275], [450, 240], [490, 180], [530, 120], [580, 60], [600, 30], [650, 0], [700, 0]];
    B5.lystone = function (nm) {
        nm = Math.max(400, Math.min(700, nm));
        for (var i = 0; i < LYSTONER.length - 1; i++) {
            var a = LYSTONER[i], b = LYSTONER[i + 1];
            if (nm <= b[0]) return a[1] + (b[1] - a[1]) * (nm - a[0]) / (b[0] - a[0]);
        }
        return 0;
    };
    B5.tonefarve = function (tone, s, v) {
        s = s === undefined ? 0.85 : s; v = v === undefined ? 0.95 : v;
        var h = ((tone % 360) + 360) % 360 / 60, i = Math.floor(h), f = h - i;
        var p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
        var r = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
        return hex(r[0] * 255, r[1] * 255, r[2] * 255);
    };
    /* Lysets farve ved bølgelængden nm. Enderne af spektret er lidt moerkere. */
    B5.lysfarve = function (nm) {
        var lys = 0.95 - 0.25 * Math.max(0, 425 - nm) / 25 - 0.25 * Math.max(0, nm - 670) / 30;
        return B5.tonefarve(B5.lystone(nm), 0.85, lys);
    };

    /* En bjaelke med lysets farver fra l0 til l1 nm */
    B5.regnbue = function (g, x0, x1, y, h, l0, l1, trin) {
        l0 = l0 || 400; l1 = l1 || 700; trin = trin || 2;
        var gg = SV.g(g), n = Math.round((l1 - l0) / trin), b = (x1 - x0) / n;
        for (var k = 0; k < n; k++) {
            SV.el("rect", { x: (x0 + k * b).toFixed(2), y: y, width: (b + 0.6).toFixed(2), height: h, fill: B5.lysfarve(l0 + (k + 0.5) * trin) }, gg);
        }
        return gg;
    };

    /* ----- Farveforloeb og filtre i motorens faelles defs ----------------- */
    var harDefs = false, defsRod = null;
    function defsEl() {
        if (defsRod) return defsRod;
        var rod = document.getElementById("faelles-defs");
        defsRod = rod ? rod.querySelector("defs") : null;
        return defsRod;
    }
    function grad(id, stop, o) {
        var d = defsEl();
        if (!d || document.getElementById(id)) return id;
        o = o || {};
        var a;
        if (o.bruger) a = { id: id, gradientUnits: "userSpaceOnUse", x1: o.x1, x2: o.x2, y1: o.y1 || 0, y2: o.y2 || 0 };
        else if (o.lin) a = o.x ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : (o.skraa ? { id: id, x1: 0, x2: 1, y1: 0, y2: 1 } : { id: id, x1: 0, x2: 0, y1: 0, y2: 1 });
        else a = { id: id, cx: o.cx || "36%", cy: o.cy || "32%", r: o.r || "72%" };
        var gr = SV.el(o.lin || o.bruger ? "linearGradient" : "radialGradient", a, d);
        stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, gr); });
        return id;
    }
    function filter(id, std) {
        var d = defsEl();
        if (!d || document.getElementById(id)) return;
        var f = SV.el("filter", { id: id, filterUnits: "userSpaceOnUse", x: -300, y: -300, width: 2000, height: 1600 }, d);
        SV.el("feGaussianBlur", { stdDeviation: std }, f);
    }

    B5.defs = function () {
        KV.defs();
        if (harDefs || !defsEl()) return;
        harDefs = true;
        filter("b5-glod", 5);
        filter("b5-glod-lille", 2.2);
        filter("b5-blur", 4);
        grad("b5-glas", [["0", "#9fb4c2", 0.45], ["0.12", "#ffffff", 0.1], ["0.2", "#ffffff", 0.55], ["0.3", "#ffffff", 0.08], ["0.85", "#ffffff", 0.04], ["1", "#9fb4c2", 0.5]], { lin: true, x: true });
        grad("b5-glas-bred", [["0", "#9fb4c2", 0.45], ["0.025", "#ffffff", 0.1], ["0.045", "#ffffff", 0.55], ["0.07", "#ffffff", 0.08], ["0.97", "#ffffff", 0.04], ["1", "#9fb4c2", 0.5]], { lin: true, x: true });
        grad("b5-skygge", [["0", "#4b5a64", 0.34], ["1", "#4b5a64", 0]], { cx: "50%", cy: "50%", r: "50%" });
        grad("b5-pre", [["0", "#fbf6ff"], ["0.4", "#d4b5f1"], ["0.85", "#8a3fc0"], ["1", "#6a2b98"]], { cx: "36%", cy: "30%", r: "75%" });
        grad("b5-paere", [["0", "#ffffff"], ["0.5", "#fff6c4"], ["1", "#f7cf55"]], { cx: "42%", cy: "38%", r: "70%" });
        grad("b5-hvide", [["0", "#ffffff"], ["1", "#e3eaee"]], { cx: "40%", cy: "40%", r: "70%" });
        grad("b5-iris", [["0", "#9cc6e4"], ["0.7", "#4a86b4"], ["1", "#2c5d84"]], { cx: "45%", cy: "40%", r: "60%" });
        grad("b5-staal", [["0", "#c9d1d6"], ["0.5", "#9aa5ac"], ["1", "#6d787f"]], { lin: true, x: true });
        grad("b5-staal-v", [["0", "#dfe5e8"], ["0.5", "#a8b2b8"], ["1", "#78838a"]], { lin: true });
        grad("b5-krop", [["0", "#f4f6f7"], ["1", "#d5dbdf"]], { lin: true });
        grad("b5-rum", [["0", "#26303d"], ["1", "#121820"]], { lin: true });
        grad("b5-display", [["0", "#1d2a30"], ["1", "#0d1518"]], { lin: true });
        grad("b5-knap", [["0", "#ffffff"], ["0.6", "#d8dee2"], ["1", "#9aa5ac"]], { cx: "40%", cy: "35%", r: "70%" });
        grad("b5-prisme", [["0", "#eaf6ff", 0.75], ["0.5", "#9cc3df", 0.45], ["1", "#5f8fb3", 0.6]], { lin: true, skraa: true });
        grad("b5-plast", [["0", "#ffffff"], ["1", "#dce4e8"]], { lin: true });
        grad("b5-hul", [["0", "#3c4a52", 0], ["1", "#3c4a52", 0.45]], { lin: true });
        grad("b5-indre", [["0", "#ffffff"], ["1", "#eaf1f4"]], { cx: "45%", cy: "40%", r: "70%" });
        grad("b5-uv", [["0", "#eceef3"], ["1", "#d3d1e2"]], { lin: true, x: true });
        grad("b5-ir", [["0", "#e2d3d3"], ["1", "#eeeef0"]], { lin: true, x: true });
        grad("b5-lysglans", [["0", "#ffffff", 0.3], ["0.45", "#ffffff", 0], ["1", "#000000", 0.08]], { lin: true });
        grad("b5-ringglans", [["0", "#ffffff", 0.38], ["0.45", "#ffffff", 0], ["1", "#000000", 0.12]], { lin: true, skraa: true });
    };

    /* sf_b5_vaeske: lodret forloeb, lidt lysere foroven og lidt moerkere forneden */
    B5.vaeske = function (farve) {
        var id = "b5-v-" + farve.slice(1);
        grad(id, [["0", B5.blanding(farve, "#ffffff", 0.22)], ["1", B5.blanding(farve, "#1c2427", 0.08)]], { lin: true });
        return { fyld: "url(#" + id + ")", overflade: B5.blanding(farve, "#ffffff", 0.45) };
    };

    /* ----- Kuvetten ------------------------------------------------------- */
    /* sf_b5_kuvette: et firkantet glas set lidt oppefra. o.farve er vaesken
       (eller ingen), o.inde(gg) tegnes i vaesken (klippet til den).
       Giver { vy, x0, x1, top }. */
    B5.kuvette = function (g, cx, bund, b, h, o) {
        o = o || {};
        var gg = SV.g(g);
        var x0 = cx - b / 2, x1 = cx + b / 2, top = bund - h, dd = 7.5, ind = 4.5;
        var vy = bund - h * (o.niveau || 0.84);
        SV.el("ellipse", { cx: cx + 2, cy: bund + 1.5, rx: b * 0.72, ry: 3.5 + b * 0.03, fill: "url(#b5-skygge)" }, gg);
        SV.el("path", { d: "M" + (x0 + ind) + "," + (bund - dd) + " V" + (top - dd) + " M" + (x1 - ind) + "," + (bund - dd) + " V" + (top - dd) +
            " M" + (x0 + ind) + "," + (bund - dd) + " H" + (x1 - ind), stroke: "#93a6b1", "stroke-width": 1, fill: "none", opacity: 0.7 }, gg);
        if (o.farve) {
            var v = B5.vaeske(o.farve);
            var sti = "M" + (x0 + 1.5) + "," + vy + " V" + (bund - 1.5) + " H" + (x1 - 1.5) + " V" + vy + " Z";
            SV.el("path", { d: sti, fill: v.fyld }, gg);
            if (o.inde) {
                var id = KV.id("kuv");
                var cp = SV.el("clipPath", { id: id }, gg);
                SV.el("path", { d: sti }, cp);
                o.inde(SV.g(gg, { "clip-path": "url(#" + id + ")" }), x0, x1, vy);
            }
            SV.el("path", { d: "M" + (x0 + 1.5) + "," + vy + " L" + (x0 + ind + 1) + "," + (vy - dd) + " H" + (x1 - ind - 1) + " L" + (x1 - 1.5) + "," + vy + " Z",
                fill: v.overflade, opacity: 0.95 }, gg);
            SV.el("path", { d: "M" + (x0 + 3) + "," + (vy + 1) + " H" + (x1 - 3), stroke: "#ffffff", "stroke-width": 1.2, opacity: 0.7 }, gg);
        }
        SV.el("rect", { x: x0, y: top, width: b, height: h, rx: 2, fill: b > 140 ? "url(#b5-glas-bred)" : "url(#b5-glas)", stroke: B5.F.glasKant, "stroke-width": 1.8 }, gg);
        SV.el("path", { d: "M" + (x0 + 1.5) + "," + (bund - 3.5) + " H" + (x1 - 1.5), stroke: "#b9c9d2", "stroke-width": 2.4, opacity: 0.8 }, gg);
        SV.el("path", { d: "M" + x0 + "," + top + " L" + (x0 + ind) + "," + (top - dd) + " H" + (x1 - ind) + " L" + x1 + "," + top + " Z",
            fill: "#ffffff", "fill-opacity": 0.55, stroke: B5.F.glasKant, "stroke-width": 1.4, "stroke-linejoin": "round" }, gg);
        var gb = Math.max(2, Math.min(4.5, b * 0.07));
        SV.el("path", { d: "M" + (x0 + Math.min(b * 0.17, 12)) + "," + (top + 6) + " V" + (bund - 8), stroke: "#ffffff", "stroke-width": gb, "stroke-linecap": "round", opacity: 0.7 }, gg);
        return { g: gg, vy: vy, x0: x0, x1: x1, top: top };
    };

    /* ----- Lysstraaler ----------------------------------------------------- */
    function spids(g, x, y, tyk, farve, op) {
        var hoved = Math.max(11, tyk * 0.8), b = tyk / 2 + 5;
        SV.el("path", { d: "M" + x + "," + y + " L" + (x - hoved) + "," + (y - b) + " L" + (x - hoved * 0.72) + "," + y + " L" + (x - hoved) + "," + (y + b) + " Z",
            fill: farve, opacity: op }, g);
        return x - hoved * 0.72;
    }

    /* sf_b5_straale: en straale, der gloeder. o.op og tyk viser, hvor meget lys der er */
    B5.straale = function (g, x1, x2, y, tyk, farve, o) {
        o = o || {};
        var gg = SV.g(g), op = o.op === undefined ? 1 : o.op, glod = o.glod === undefined ? 1 : o.glod;
        var xe = x2;
        var sg = SV.g(gg);
        if (o.spids !== false) xe = spids(sg, x2, y, tyk, farve, op);
        if (glod) {
            var gh = tyk + 9;
            SV.el("rect", { x: x1, y: y - gh / 2, width: Math.max(xe - x1, 0), height: gh, rx: gh / 2, fill: farve, opacity: (0.42 * op * glod).toFixed(2), filter: "url(#b5-glod)" }, gg);
        }
        SV.el("rect", { x: x1, y: y - tyk / 2, width: Math.max(xe - x1 + 0.5, 0), height: tyk, fill: farve, opacity: op }, gg);
        gg.appendChild(sg);
        return gg;
    };

    /* sf_b5_svind: lyset paa vej gennem en opløsning bliver tyndere og svagere */
    B5.svind = function (g, x1, x2, y, tyk1, tyk2, farve, op1, op2, lin) {
        var n = 24, id = KV.id("svind");
        function f(t, a, b) { return (a > 0 && b > 0 && !lin) ? a * Math.pow(b / a, t) : a + (b - a) * t; }
        var stop = [];
        for (var k = 0; k <= n; k++) stop.push([(k / n).toFixed(3), farve, f(k / n, op1, Math.max(op2, 0.001)).toFixed(3)]);
        grad(id, stop, { bruger: true, x1: x1, x2: x2 });
        var over = [], under = [];
        for (k = 0; k <= n; k++) over.push([x1 + (x2 - x1) * k / n, y - f(k / n, tyk1, tyk2) / 2]);
        for (k = n; k >= 0; k--) under.push([over[k][0], 2 * y - over[k][1]]);
        var sti = "M " + over.concat(under).map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" L ") + " Z";
        var gg = SV.g(g);
        SV.el("path", { d: sti, fill: "url(#" + id + ")", opacity: 0.5, stroke: "url(#" + id + ")", "stroke-width": 8, filter: "url(#b5-glod)" }, gg);
        SV.el("path", { d: sti, fill: "url(#" + id + ")" }, gg);
        return gg;
    };

    /* sf_b5_partikler: n permanganationer spredt i et felt (samme fro giver samme pladser) */
    B5.partikler = function (g, x0, y0, x1, y1, n, fro, r) {
        r = r || 3.4;
        var s = fro * 9301 + 49297, pkt = [], forsoeg = 0, min = 2.6 * r;
        function tal() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
        while (pkt.length < n && forsoeg < 6000) {
            forsoeg += 1;
            var x = x0 + r + 1 + tal() * (x1 - x0 - 2 * r - 2), y = y0 + r + 1 + tal() * (y1 - y0 - 2 * r - 2);
            if (pkt.every(function (p) { return Math.hypot(x - p[0], y - p[1]) >= min; })) pkt.push([x, y]);
        }
        var gg = SV.g(g);
        pkt.forEach(function (p) { SV.el("circle", { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: r, fill: "url(#b5-pre)", stroke: "#5a2283", "stroke-width": 0.6, "stroke-opacity": 0.6 }, gg); });
        return gg;
    };

    /* sf_b5_maaling: en straale ind i en kuvette, og den svagere straale ud.
       T er den del af lyset, der slipper igennem. */
    B5.maaling = function (g, cx, ly, bund, b, h, farve, lys, T, o) {
        o = o || {};
        var ind = o.ind || 74, ud = o.ud || 74, tyk = o.tyk || 16;
        var tu = o.tu || Math.max(tyk * T, 1.4), ou = o.ou || 0.45 + 0.55 * T;
        var x0 = cx - b / 2, x1 = cx + b / 2;
        var gg = SV.g(g);
        B5.straale(gg, x0 - ind, x0, ly, tyk, lys, { spids: false });
        var k = B5.kuvette(gg, cx, bund, b, h, { farve: farve, niveau: o.niveau || 0.86, inde: function (ig) {
            B5.svind(ig, x0, x1, ly, tyk, tu, lys, 1, ou);
            if (o.partikler) B5.partikler(ig, x0 + 2, bund - h * (o.niveau || 0.86) + 2, x1 - 2, bund - 4, o.partikler, o.fro || 1, o.pr || 3.4);
        } });
        B5.straale(gg, x1, x1 + ud, ly, tu, lys, { op: ou });
        return { g: gg, k: k };
    };

    /* ----- Lampe og oeje --------------------------------------------------- */
    B5.lampe = function (g, x, y, r, fatning) {
        var gg = SV.g(g);
        if (fatning !== false) {
            SV.el("rect", { x: x - r - 13, y: y - r * 0.55, width: 15, height: r * 1.1, rx: 2, fill: "url(#b5-staal-v)", stroke: "#6c767c", "stroke-width": 1 }, gg);
            for (var k = 0; k < 3; k++) {
                var yy = y - r * 0.4 + k * r * 0.4;
                KV.linje(gg, x - r - 12, yy, x - r + 1, yy, "#7d878e", 0.9);
            }
        }
        SV.el("circle", { cx: x, cy: y, r: r * 2.1, fill: "#fff1a6", opacity: 0.75, filter: "url(#b5-glod)" }, gg);
        SV.el("circle", { cx: x, cy: y, r: r, fill: "url(#b5-paere)", stroke: "#d2a640", "stroke-width": 1.3 }, gg);
        SV.el("path", { d: "M" + (x - r * 0.45) + "," + (y + r * 0.1) + " l" + (r * 0.18) + "," + (-r * 0.32) + " l" + (r * 0.18) + "," + (r * 0.32) +
            " l" + (r * 0.18) + "," + (-r * 0.32) + " l" + (r * 0.18) + "," + (r * 0.32), fill: "none", stroke: "#c07a12", "stroke-width": 1.4, "stroke-linejoin": "round" }, gg);
        return gg;
    };

    B5.oeje = function (g, cx, cy, r) {
        var gg = SV.g(g);
        var sti = "M" + (cx - r) + "," + cy + " Q" + (cx - r * 0.1) + "," + (cy - r * 0.95) + " " + (cx + r) + "," + (cy - r * 0.12) +
            " Q" + (cx - r * 0.1) + "," + (cy + r * 0.9) + " " + (cx - r) + "," + cy + " Z";
        SV.el("path", { d: sti, fill: "url(#b5-hvide)", stroke: "#4e5f63", "stroke-width": 1.6, "stroke-linejoin": "round" }, gg);
        var id = KV.id("oeje");
        var cp = SV.el("clipPath", { id: id }, gg);
        SV.el("path", { d: sti }, cp);
        var ig = SV.g(gg, { "clip-path": "url(#" + id + ")" }), ir = r * 0.47, ix = cx - r * 0.3;
        SV.el("circle", { cx: ix, cy: cy, r: ir, fill: "url(#b5-iris)", stroke: "#2c5370", "stroke-width": 1 }, ig);
        SV.el("circle", { cx: ix, cy: cy, r: ir * 0.45, fill: "#111a1e" }, ig);
        SV.el("circle", { cx: ix - ir * 0.3, cy: cy - ir * 0.35, r: ir * 0.2, fill: "#ffffff", opacity: 0.9 }, ig);
        SV.el("path", { d: "M" + (cx - r * 1.02) + "," + (cy - 1) + " Q" + (cx - r * 0.1) + "," + (cy - r * 1.05) + " " + (cx + r * 1.02) + "," + (cy - r * 0.16),
            fill: "none", stroke: "#3b4a4e", "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
        return gg;
    };

    /* ----- Absorptionsspektre -------------------------------------------- */
    B5.klokke = function (l, midt, bredde, hoejde) { return hoejde * Math.exp(-Math.pow((l - midt) / bredde, 2) / 2); };
    /* Bogens spektrum for E129 (spektrum_e129) */
    B5.e129 = function (l) { return B5.klokke(l, 504, 42, 0.52) + B5.klokke(l, 405, 28, 0.05); };

    /* sf_b5_spektrum_akser: akser fra 400 til 700 nm med lysets farver under aksen. Giver { X, Y } */
    B5.spektrumAkser = function (g, o) {
        var X = function (l) { return o.xa + (o.xb - o.xa) * (l - 400) / 300; };
        var Y = function (a) { return o.yb - (o.yb - o.ya) * a / o.ymax; };
        var n, v;
        KV.flade(g, o.xa, o.ya - 8, o.xb + 8, o.yb);
        for (n = 1; n * o.ytrin <= o.ymax + 1e-9; n++) KV.linje(g, o.xa, Y(n * o.ytrin), o.xb + 8, Y(n * o.ytrin), F.net, 1);
        for (v = 450; v < 700; v += 50) KV.linje(g, X(v), o.ya - 8, X(v), o.yb, F.net, 1);
        var gl = SV.g(g, { opacity: 0.5, filter: "url(#kv-blur)" });
        B5.regnbue(gl, o.xa, o.xb, o.yb + 2, 10);
        B5.regnbue(g, o.xa, o.xb, o.yb + 1, 11);
        KV.linje(g, o.xa, o.yb, o.xb + 8, o.yb, F.daempet, 1.3);
        KV.linje(g, o.xa, o.ya - 8, o.xa, o.yb, F.daempet, 1.3);
        for (n = 0; n * o.ytrin <= o.ymax + 1e-9; n++) {
            v = n * o.ytrin;
            KV.linje(g, o.xa - 5, Y(v), o.xa, Y(v), F.daempet, 1.2);
            KV.tekst(g, o.xa - 10, Y(v) + 4.5, v.toFixed(1).replace(".", ","), { fs: 13, anker: "end", farve: F.daempet });
        }
        for (v = 400; v <= 700; v += 50) {
            KV.linje(g, X(v), o.yb + 12, X(v), o.yb + 17, F.daempet, 1.2);
            KV.tekst(g, X(v), o.yb + 33, String(v), { fs: 13, farve: F.daempet });
        }
        KV.tekst(g, (o.xa + o.xb) / 2, o.yb + 54, o.xtitel || "bølgelængde i nm", { fs: 13.5, farve: F.daempet });
        var yx = o.xa - 48, ym = (o.ya + o.yb) / 2;
        KV.tekst(g, yx, ym, "absorbans", { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + yx + " " + ym + ")" });
        return { X: X, Y: Y };
    };

    /* sf_b5_spektrum_kurve: arealet under kurven har lysets farve */
    B5.spektrumKurve = function (g, X, Y, f, alfa) {
        var gg = SV.g(g);
        for (var l = 400; l < 700; l += 2) {
            var a = f(l + 1);
            SV.el("rect", { x: X(l).toFixed(2), y: Y(a).toFixed(2), width: (X(l + 2) - X(l) + 0.5).toFixed(2), height: (Y(0) - Y(a)).toFixed(2), fill: B5.lysfarve(l + 1), opacity: alfa || 0.55 }, gg);
        }
        var pkt = [];
        for (l = 400; l <= 700; l += 2) pkt.push([X(l), Y(f(l))]);
        KV.kurve(gg, pkt, F.blaek, 2.4, { moerk: "#14201f" });
        return gg;
    };

    /* Toppen i et spektrum: sort punkt med hvid ring */
    B5.toppunkt = function (g, x, y) {
        var gg = SV.g(g);
        SV.el("circle", { cx: x + 0.6, cy: y + 1.8, r: 7, fill: "#1c3533", opacity: 0.28, filter: "url(#kv-blur)" }, gg);
        SV.el("circle", { cx: x, cy: y, r: 7.4, fill: "#ffffff" }, gg);
        SV.el("circle", { cx: x, cy: y, r: 5.4, fill: F.blaek }, gg);
        return gg;
    };

    /* ----- Glas ------------------------------------------------------------ */
    /* Et baegerglas med vaeske i let perspektiv (gs_baeger, forenklet) */
    B5.baeger = function (g, cx, bund, b, h, niveau, farve) {
        var gg = SV.g(g), x0 = cx - b / 2, x1 = cx + b / 2, top = bund - h, ry = b * 0.1, vy = bund - h * niveau;
        SV.el("ellipse", { cx: cx + 3, cy: bund + 2, rx: b * 0.62, ry: 6, fill: "url(#b5-skygge)" }, gg);
        var v = B5.vaeske(farve);
        SV.el("path", { d: "M" + (x0 + 2) + "," + vy + " V" + (bund - 10) + " Q" + (x0 + 2) + "," + (bund - 1) + " " + (x0 + 12) + "," + (bund - 1) +
            " H" + (x1 - 12) + " Q" + (x1 - 2) + "," + (bund - 1) + " " + (x1 - 2) + "," + (bund - 10) + " V" + vy + " Z", fill: v.fyld }, gg);
        SV.el("ellipse", { cx: cx, cy: vy, rx: b / 2 - 2, ry: ry * 0.8, fill: v.overflade }, gg);
        SV.el("path", { d: "M" + x0 + "," + top + " V" + (bund - 10) + " Q" + x0 + "," + bund + " " + (x0 + 12) + "," + bund + " H" + (x1 - 12) +
            " Q" + x1 + "," + bund + " " + x1 + "," + (bund - 10) + " V" + top, fill: "url(#b5-glas)", stroke: B5.F.glasKant, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("ellipse", { cx: cx, cy: top, rx: b / 2, ry: ry, fill: "#ffffff", "fill-opacity": 0.4, stroke: B5.F.glasKant, "stroke-width": 1.6 }, gg);
        SV.el("path", { d: "M" + (x0 - 2) + "," + (top - 1) + " q-7,-4 -9,-1", fill: "none", stroke: B5.F.glasKant, "stroke-width": 1.6, "stroke-linecap": "round" }, gg);
        SV.el("path", { d: "M" + (x0 + 9) + "," + (top + 12) + " V" + (bund - 14), stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.7 }, gg);
        for (var k = 1; k <= 3; k++) KV.linje(gg, x1 - 22, bund - h * 0.22 * k, x1 - 10, bund - h * 0.22 * k, "#8aa0ad", 1.1);
        return gg;
    };

    /* En maalekolbe med vaesken op til maerket (fra sc7.6's lab.js) */
    B5.maalekolbe = function (g, cx, bund, o) {
        o = o || {};
        var gg = SV.g(g);
        var R = o.R || 46, ky = bund - R + 6, hb = 9, hTop = bund - (o.hoejde || 168), maerke = hTop + 26;
        function form(fra) {
            return "M" + (cx - hb) + "," + fra + " L" + (cx - hb) + "," + (ky - R + 8) +
                " C" + (cx - hb) + "," + (ky - R + 22) + " " + (cx - R - 4) + "," + (ky - 26) + " " + (cx - R - 4) + "," + (ky + 6) +
                " C" + (cx - R - 4) + "," + (bund - 6) + " " + (cx - R + 8) + "," + bund + " " + (cx - 20) + "," + bund +
                " L" + (cx + 20) + "," + bund + " C" + (cx + R - 8) + "," + bund + " " + (cx + R + 4) + "," + (bund - 6) + " " + (cx + R + 4) + "," + (ky + 6) +
                " C" + (cx + R + 4) + "," + (ky - 26) + " " + (cx + hb) + "," + (ky - R + 22) + " " + (cx + hb) + "," + (ky - R + 8) + " L" + (cx + hb) + "," + fra;
        }
        SV.el("ellipse", { cx: cx + 3, cy: bund + 2, rx: R * 1.1, ry: 6, fill: "url(#b5-skygge)" }, gg);
        if (o.farve) SV.el("path", { d: form(maerke) + " Z", fill: B5.vaeske(o.farve).fyld }, gg);
        SV.el("path", { d: form(hTop), fill: "url(#b5-glas)", stroke: B5.F.glasKant, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("path", { d: "M" + (cx - R + 6) + "," + (ky - 8) + " Q" + (cx - R + 4) + "," + (ky + 18) + " " + (cx - R + 16) + "," + (bund - 12), fill: "none",
            stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        KV.linje(gg, cx - hb, maerke, cx + hb, maerke, "#3b4650", 1.6);
        SV.el("rect", { x: cx - hb - 3, y: hTop - 16, width: 2 * hb + 6, height: 18, rx: 4, fill: "#5b8fc9", stroke: "#2f5f94", "stroke-width": 1.2 }, gg);
        return { g: gg, ky: ky, R: R, hTop: hTop };
    };

    /* sf_b5_stativ: et kuvettestativ af hvid plast set lidt oppefra.
       over() tegnes foer kuvetterne og foran() efter, saa de staar i hullerne. */
    B5.stativ = function (x0, x1, top, huller, b, h) {
        h = h || 30;
        return {
            over: function (g) {
                SV.el("rect", { x: x0 + 3, y: top + 6, width: x1 - x0, height: h, rx: 6, fill: "#3c4a52", opacity: 0.2, filter: "url(#b5-blur)" }, g);
                SV.el("path", { d: "M" + (x0 + 3) + "," + top + " L" + (x0 + 10) + "," + (top - 10) + " H" + (x1 - 10) + " L" + (x1 - 3) + "," + top + " Z",
                    fill: "#f4f7f8", stroke: "#a9b6bd", "stroke-width": 1.1, "stroke-linejoin": "round" }, g);
                huller.forEach(function (cx) {
                    SV.el("path", { d: "M" + (cx - b / 2 - 6) + "," + (top - 1.5) + " L" + (cx - b / 2 + 1) + "," + (top - 9) + " H" + (cx + b / 2 + 4) +
                        " L" + (cx + b / 2 + 6) + "," + (top - 1.5) + " Z", fill: "#5e6b72" }, g);
                });
            },
            foran: function (g) {
                huller.forEach(function (cx) { SV.el("rect", { x: cx - b / 2 + 1, y: top - 9, width: b - 2, height: 9, fill: "url(#b5-hul)" }, g); });
                SV.el("rect", { x: x0, y: top, width: x1 - x0, height: h, rx: 5, fill: "url(#b5-plast)", stroke: "#a9b6bd", "stroke-width": 1.1 }, g);
                KV.linje(g, x0 + 8, top + 2.5, x1 - 8, top + 2.5, "#ffffff", 1.6);
            }
        };
    };

    /* ----- Zigzagkaeder --------------------------------------------------- */
    /* Atomernes pladser i en vandret zigzag: atom k (fra 0) staar skiftevis
       oppe og nede. L er bindingens laengde. */
    B5.zigzag = function (x0, y0, n, L, nedFoerst) {
        var dx = L * Math.cos(Math.PI / 6), dy = L / 4, P = [];
        for (var k = 0; k < n; k++) P.push([x0 + k * dx, y0 + ((k % 2 === 0) !== !!nedFoerst ? -dy : dy)]);
        return P;
    };

    /* Bindingerne i en kaede: orden[i] er bindingen mellem atom i og i + 1.
       Den anden streg i en dobbeltbinding ligger inde i zigzaggen. */
    B5.kaede = function (g, P, orden, o) {
        o = o || {};
        var gg = SV.g(g), farve = o.farve || F.blaek, sw = o.sw || 2.2;
        for (var i = 0; i < P.length - 1; i++) {
            var a = P[i], b = P[i + 1];
            KV.linje(gg, a[0], a[1], b[0], b[1], (o.farver && o.farver[i]) || farve, sw);
            if (orden[i] === 2) {
                var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
                /* den anden streg ligger under bindingen (som bogens sf_b5_polyen) */
                if (ny < 0) { nx = -nx; ny = -ny; }
                var af = 5.5, k = 0.16;
                KV.linje(gg, a[0] + dx * k + nx * af, a[1] + dy * k + ny * af, b[0] - dx * k + nx * af, b[1] - dy * k + ny * af, (o.farver && o.farver[i]) || farve, sw * 0.9);
            }
        }
        return gg;
    };

    /* ----- Tekstens bredde (svg-maaling som B2.bredde) --------------------- */
    var maaleSvg = null;
    B5.bredde = function (s, fs, vaegt, familie) {
        try {
            if (!maaleSvg && document.body) {
                maaleSvg = SV.el("svg", { width: 10, height: 10, "aria-hidden": "true", style: "position:absolute;left:-9999px;top:0;visibility:hidden" });
                document.body.appendChild(maaleSvg);
            }
            if (maaleSvg) {
                var a = { "font-size": fs, "font-weight": vaegt || 400 };
                if (familie) a["font-family"] = familie;
                var t = SV.tekst(maaleSvg, 0, 20, s, a);
                var bw = t.getComputedTextLength();
                maaleSvg.removeChild(t);
                if (bw > 0) return bw;
            }
        } catch (x) { /* canvas nedenfor */ }
        return NK.tekstBredde(String(s).replace(/[_^{}]/g, ""), fs, vaegt);
    };

    /* En vandret dobbeltpil (bølgelængden, kuvettens bredde) */
    B5.vDobbeltpil = function (g, x1, x2, y, farve, sw, hoved) {
        var gg = SV.g(g);
        hoved = hoved || 9; farve = farve || F.daempet;
        SV.el("path", { d: "M" + x1 + "," + y + " l" + hoved + "," + (-hoved * 0.44) + " l" + (-hoved * 0.3) + "," + (hoved * 0.44) + " l" + (hoved * 0.3) + "," + (hoved * 0.44) + " Z", fill: farve }, gg);
        SV.el("path", { d: "M" + x2 + "," + y + " l" + (-hoved) + "," + (-hoved * 0.44) + " l" + (hoved * 0.3) + "," + (hoved * 0.44) + " l" + (-hoved * 0.3) + "," + (hoved * 0.44) + " Z", fill: farve }, gg);
        KV.linje(gg, x1 + hoved * 0.6, y, x2 - hoved * 0.6, y, farve, sw || 1.5);
        return gg;
    };

    /* Formelskriften til symbolerne i Lambert-Beers lov (l maa ikke ligne I) */
    B5.FORMEL = "Cambria Math, Cambria, Times New Roman, serif";
}());

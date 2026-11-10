/* =====================================================================
   b8.js - kapitel B8's tegnehjaelp (ikke en del af den faelles motor)

   Lægemidlerne som skeletformler med benzenring i bogens stil
   (b8-laegemidler, b8-syntese, b8-maalekaede), receptoren i membranen
   (b8-receptor), skilletragten (b8-fordeling-octanol), en plet paa en
   TLC-plade, tragten paa sugekolben (b8-syntese-trin), partikler og damp
   (b8-omkrystallisering). Karret til TLC og destillationen tegnes i
   deres egne figurfiler. Bygger paa org.js (skelet, ring, tekst) og lab.js
   (glas, lup).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var LAB = NK.LAB;
    var B8 = NK.B8 = {};
    var F = ORG.F;

    B8.F = {
        ester: "#0f766e",            /* estergruppen (bogens groenne) */
        syre: "#c0392b",             /* carboxylgruppen (bogens roede) */
        amid: "#1d4ed8",             /* amidgruppen og aminogruppen (blaa) */
        hydroxy: "#b7791f",          /* hydroxygruppen (bogens gul-orange) */
        neg: "#1d4ed8",
        pos: "#c0392b",
        octanol: "#f3dc9b",
        vand: "#cfe3f6",
        lilla: "#7b3fb8",
        jern: "#8e5cc8"
    };
    var C = B8.F;

    function f1(v) { return (Math.round(v * 10) / 10).toString(); }
    B8.f1 = f1;

    /* ----- Molekyler ---------------------------------------------------- */

    /* En skeletformel med benzenring: ringens hjoerner er de foerste seks
       atomer. Kald B8.tegnMol for at tegne. Hjoerne k ligger i vinklen
       -90 + 60k grader (0 foroven, 1 oeverst til hoejre ...). */
    function Mol(cx, cy, r) {
        this.at = [];
        this.bi = [];
        this.navne = {};
        this.ring = null;
        if (cx !== undefined) {
            this.ring = { cx: cx, cy: cy, r: r || 34 };
            for (var k = 0; k < 6; k++) this.at.push(ORG.fra([cx, cy], this.ring.r, -90 + 60 * k));
        }
    }
    /* Et nyt atom L fra atom i i retningen v; etiket og farve paa bindingen */
    Mol.prototype.ud = function (navn, fra, L, v, etiket, o, n, side, farve) {
        var p = ORG.fra(this.p(fra), L, v);
        this.at.push([p[0], p[1], etiket || null, o]);
        this.navne[navn] = this.at.length - 1;
        this.bi.push([this.i(fra), this.at.length - 1, n || 1, side || 0, farve]);
        return this;
    };
    Mol.prototype.i = function (navn) { return typeof navn === "number" ? navn : this.navne[navn]; };
    Mol.prototype.p = function (navn) { var a = this.at[this.i(navn)]; return [a[0], a[1]]; };
    B8.Mol = Mol;

    /* Tegner molekylet: ringen med tre dobbeltbindinger og resten som skelet */
    B8.tegnMol = function (g, m, o) {
        o = o || {};
        var gg = SV.g(g);
        if (m.ring) ORG.ring(gg, m.ring.cx, m.ring.cy, m.ring.r, { dobbelt: [1, 3, 5], farve: o.farve });
        var at = m.at.map(function (a, i) {
            if (i < 6 && m.ring) return [a[0], a[1]];
            return a;
        });
        ORG.skelet(gg, at, m.bi, { fs: o.fs || 19, farve: o.farve });
        return gg;
    };

    /* Rektanglet om nogle af molekylets atomer (med luft til bogstaverne) */
    B8.omkring = function (m, navne, luft) {
        luft = luft || [16, 14];
        var xs = [], ys = [];
        navne.forEach(function (n) {
            var a = m.at[m.i(n)];
            var b = a[2] ? NK.tekstBredde(String(a[2]).replace(/[_^]/g, ""), 19, 700) : 0;
            var anker = a[3] && a[3].anker;
            var x0 = a[0], x1 = a[0];
            if (anker === "start") { x0 = a[0] - 7; x1 = a[0] - 7 + b; }
            else if (anker === "end") { x0 = a[0] + 7 - b; x1 = a[0] + 7; }
            else { x0 = a[0] - b / 2; x1 = a[0] + b / 2; }
            xs.push(x0, x1); ys.push(a[1]);
        });
        var x = Math.min.apply(null, xs) - luft[0], y = Math.min.apply(null, ys) - luft[1];
        return [x, y, Math.max.apply(null, xs) - Math.min.apply(null, xs) + 2 * luft[0], Math.max.apply(null, ys) - Math.min.apply(null, ys) + 2 * luft[1]];
    };

    /* Hele molekylets rektangel */
    B8.helt = function (m, luft) {
        return B8.omkring(m, m.at.map(function (a, i) { return i; }), luft);
    };

    var L = 34;
    B8.L = L;

    /* Acetylsalicylsyre: estergruppen op fra hjoerne 0, COOH fra hjoerne 1 */
    B8.asa = function (cx, cy, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol(cx, cy, o.L || L);
        var fe = o.ester, fs = o.syre;
        m.ud("O1", 0, l, -90, "O", { farve: fe }, 1, 0, fe)
         .ud("Ce", "O1", l, -150, null, null, 1, 0, fe)
         .ud("Oe", "Ce", l, 150, "O", { farve: fe }, 2, 0, fe)
         .ud("Me", "Ce", l, -90, null, null, 1, 0, fe)
         .ud("Cs", 1, l, -30, null, null, 1, 0, fs);
        if (o.ion) {
            m.ud("Os", "Cs", l, -90, "O", { farve: fs }, 2, 0, fs)
             .ud("OH", "Cs", l, 30, "O^−", { anker: "start", farve: fs }, 1, 0, fs);
        } else {
            m.ud("Os", "Cs", l, -90, "O", { farve: fs }, 2, 0, fs)
             .ud("OH", "Cs", l, 30, "OH", { anker: "start", farve: fs }, 1, 0, fs);
        }
        return m;
    };

    /* Salicylsyre (OH op fra hjoerne 0) og salicylat (COO⁻) */
    B8.salicyl = function (cx, cy, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol(cx, cy, o.L || L);
        m.ud("O1", 0, l, -90, o.phenolat ? "O^−" : "OH", { anker: "start", farve: o.oh }, 1, 0, o.oh)
         .ud("Cs", 1, l, -30, null, null, 1, 0, o.syre)
         .ud("Os", "Cs", l, -90, "O", { farve: o.syre }, 2, 0, o.syre)
         .ud("OH", "Cs", l, 30, o.ion ? "O^−" : "OH", { anker: "start", farve: o.syre }, 1, 0, o.syre);
        return m;
    };

    /* Paracetamol: HO fra hjoerne 4, NH-CO-CH3 fra hjoerne 1 */
    B8.paracetamol = function (cx, cy, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol(cx, cy, o.L || L);
        m.ud("HO", 4, l, 150, "HO", { anker: "end", farve: o.oh }, 1, 0, o.oh)
         .ud("N", 1, l, -30, "N", { farve: o.amid }, 1, 0, o.amid)
         .ud("H", "N", l * 0.7, -90, "H", { farve: o.amid }, 1, 0, o.amid)
         .ud("Ca", "N", l, 30, null, null, 1, 0, o.amid)
         .ud("Oa", "Ca", l, 90, "O", { farve: o.amid }, 2, 0, o.amid)
         .ud("Ma", "Ca", l, -30);
        return m;
    };

    /* Ibuprofen: isobutyl fra hjoerne 4, CH(CH3)COOH fra hjoerne 1 */
    B8.ibuprofen = function (cx, cy, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol(cx, cy, o.L || L);
        var fs = o.syre;
        m.ud("Ca", 4, l, 150).ud("Cb", "Ca", l, 210).ud("M1", "Cb", l, -90).ud("M2", "Cb", l, 150)
         .ud("Cx", 1, l, -30).ud("Mx", "Cx", l, -90)
         .ud("Cs", "Cx", l, 30, null, null, 1, 0, fs)
         .ud("Os", "Cs", l, 90, "O", { farve: fs }, 2, 0, fs)
         .ud("OH", "Cs", l, -30, "OH", { anker: "start", farve: fs }, 1, 0, fs);
        return m;
    };

    /* Amfetamin: CH2-CH(NH2)-CH3 fra hjoerne 1; o.ion giver NH3⁺ */
    B8.amfetamin = function (cx, cy, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol(cx, cy, o.L || L);
        m.ud("Ca", 1, l, -30).ud("Cb", "Ca", l, 30)
         .ud("N", "Cb", l, -30, o.ion ? "NH_3^+" : "NH_2", { anker: "start", farve: o.amin }, 1, 0, o.amin)
         .ud("M", "Cb", l, 90);
        return m;
    };

    /* Ethansyreanhydrid og ethansyre som zigzag med C=O op */
    B8.anhydrid = function (x, y, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol();
        m.at.push([x, y]); m.navne.M1 = 0;
        m.ud("C1", "M1", l, -30).ud("O1", "C1", l, -90, "O", null, 2)
         .ud("Ob", "C1", l, 30, "O").ud("C2", "Ob", l, -30)
         .ud("O2", "C2", l, -90, "O", null, 2).ud("M2", "C2", l, 30);
        return m;
    };
    B8.ethansyre = function (x, y, o) {
        o = o || {};
        var l = o.L || L;
        var m = new Mol();
        m.at.push([x, y]); m.navne.M = 0;
        m.ud("C", "M", l, -30).ud("O", "C", l, -90, "O", null, 2).ud("OH", "C", l, 30, "OH", { anker: "start" });
        return m;
    };

    /* ----- Receptoren i membranen (b8-receptor) ------------------------- */

    /* Membranen: to raekker hoveder med haler imellem fra x0 til x1 */
    B8.membran = function (g, x0, x1, ym, o) {
        o = o || {};
        var gg = SV.g(g), d = 13, h = 26;
        SV.el("rect", { x: x0, y: ym - h, width: x1 - x0, height: 2 * h, fill: "#f6e7c4", opacity: 0.55 }, gg);
        for (var x = x0 + d / 2; x < x1 - 2; x += d) {
            if (o.hul && x > o.hul[0] && x < o.hul[1]) continue;
            [-1, 1].forEach(function (s) {
                SV.el("path", { d: "M" + f1(x - 2.5) + "," + f1(ym - s * (h - 8)) + " L" + f1(x - 2.5) + "," + f1(ym - s * 3) + " M" + f1(x + 2.5) + "," + f1(ym - s * (h - 8)) + " L" + f1(x + 2.5) + "," + f1(ym - s * 3),
                    stroke: "#d2b06a", "stroke-width": 1.5, fill: "none", "stroke-linecap": "round" }, gg);
                SV.el("circle", { cx: f1(x), cy: f1(ym - s * (h - 4)), r: 5.4, fill: "#f2cc78", stroke: "#c39a3c", "stroke-width": 1 }, gg);
            });
        }
        return gg;
    };

    /* Receptoren: et proteins krop gennem membranen med en lomme foroven.
       Giver lommens rektangel og kroppens rektangel */
    B8.LOMME = { b: 44, d: 30 };
    B8.receptor = function (g, cx, top, bund, o) {
        o = o || {};
        var gg = SV.g(g), b = o.b || 104, x0 = cx - b / 2, x1 = cx + b / 2, r = 22;
        var lb = B8.LOMME.b, ld = B8.LOMME.d;
        /* Kroppen med lommen som ét U foroven */
        var d = "M" + f1(x0) + "," + f1(bund - r) + " L" + f1(x0) + "," + f1(top + 16) + " Q" + f1(x0) + "," + f1(top) + " " + f1(x0 + 16) + "," + f1(top) +
            " L" + f1(cx - lb / 2 - 6) + "," + f1(top) +
            " Q" + f1(cx - lb / 2) + "," + f1(top) + " " + f1(cx - lb / 2) + "," + f1(top + 8) +
            " L" + f1(cx - lb / 2) + "," + f1(top + ld - 8) + " Q" + f1(cx - lb / 2) + "," + f1(top + ld) + " " + f1(cx - lb / 2 + 8) + "," + f1(top + ld) +
            " L" + f1(cx + lb / 2 - 8) + "," + f1(top + ld) + " Q" + f1(cx + lb / 2) + "," + f1(top + ld) + " " + f1(cx + lb / 2) + "," + f1(top + ld - 8) +
            " L" + f1(cx + lb / 2) + "," + f1(top + 8) + " Q" + f1(cx + lb / 2) + "," + f1(top) + " " + f1(cx + lb / 2 + 6) + "," + f1(top) +
            " L" + f1(x1 - 16) + "," + f1(top) + " Q" + f1(x1) + "," + f1(top) + " " + f1(x1) + "," + f1(top + 16) +
            " L" + f1(x1) + "," + f1(bund - r) + " Q" + f1(x1) + "," + f1(bund) + " " + f1(x1 - r) + "," + f1(bund) +
            " L" + f1(x0 + r) + "," + f1(bund) + " Q" + f1(x0) + "," + f1(bund) + " " + f1(x0) + "," + f1(bund - r) + " Z";
        if (o.gloed) {
            SV.el("ellipse", { cx: cx, cy: bund + 6, rx: b * 0.95, ry: 26, fill: "url(#b8-gloed)" }, gg);
            [-1, 0, 1].forEach(function (s) {
                SV.el("line", { x1: f1(cx + s * 22), y1: f1(bund + 12), x2: f1(cx + s * 30), y2: f1(bund + 26), stroke: "#e2a90f", "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
            });
        }
        SV.el("path", { d: d, fill: "url(#b8-protein)", stroke: "#3f8f82", "stroke-width": 2, "stroke-linejoin": "round" }, gg);
        SV.el("path", { d: "M" + f1(x0 + 12) + "," + f1(top + 26) + " L" + f1(x0 + 12) + "," + f1(bund - 26), stroke: "#ffffff", "stroke-width": 4, "stroke-opacity": 0.45, "stroke-linecap": "round" }, gg);
        return { lomme: [cx - lb / 2, top, lb, ld], krop: [x0, top, b, bund - top] };
    };

    /* Signalstoffet (orange), agonisten (lilla) og antagonisten (graa).
       (x, y) er midten af den del, der passer i lommen (lommens bund) */
    B8.stof = function (g, x, bund, slags) {
        var gg = SV.g(g), lb = B8.LOMME.b - 6, ld = B8.LOMME.d - 3;
        var d;
        if (slags === "signal") {
            d = "M" + f1(x - lb / 2) + "," + f1(bund) + " L" + f1(x - lb / 2) + "," + f1(bund - ld) +
                " C" + f1(x - 40) + "," + f1(bund - ld - 6) + " " + f1(x - 40) + "," + f1(bund - ld - 58) + " " + f1(x) + "," + f1(bund - ld - 58) +
                " C" + f1(x + 40) + "," + f1(bund - ld - 58) + " " + f1(x + 40) + "," + f1(bund - ld - 6) + " " + f1(x + lb / 2) + "," + f1(bund - ld) +
                " L" + f1(x + lb / 2) + "," + f1(bund) + " Z";
            SV.el("path", { d: d, fill: "url(#b8-orange)", stroke: "#b4661b", "stroke-width": 2, "stroke-linejoin": "round" }, gg);
        } else if (slags === "agonist") {
            var P = [];
            for (var k = 0; k < 7; k++) P.push(ORG.fra([x, bund - ld - 26], 34, -90 + k * 360 / 7));
            d = "M" + f1(x - lb / 2) + "," + f1(bund) + " L" + f1(x - lb / 2) + "," + f1(bund - ld + 4) + " L" + P.slice(4).concat(P.slice(0, 4)).map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" L") +
                " L" + f1(x + lb / 2) + "," + f1(bund - ld + 4) + " L" + f1(x + lb / 2) + "," + f1(bund) + " Z";
            SV.el("path", { d: d, fill: "url(#b8-lilla)", stroke: "#5b34a0", "stroke-width": 2, "stroke-linejoin": "round" }, gg);
        } else {
            d = "M" + f1(x - lb / 2) + "," + f1(bund) + " L" + f1(x - lb / 2) + "," + f1(bund - ld) + " L" + f1(x - 40) + "," + f1(bund - ld) +
                " Q" + f1(x - 46) + "," + f1(bund - ld) + " " + f1(x - 46) + "," + f1(bund - ld - 8) + " L" + f1(x - 46) + "," + f1(bund - ld - 36) +
                " Q" + f1(x - 46) + "," + f1(bund - ld - 44) + " " + f1(x - 38) + "," + f1(bund - ld - 44) + " L" + f1(x + 38) + "," + f1(bund - ld - 44) +
                " Q" + f1(x + 46) + "," + f1(bund - ld - 44) + " " + f1(x + 46) + "," + f1(bund - ld - 36) + " L" + f1(x + 46) + "," + f1(bund - ld - 8) +
                " Q" + f1(x + 46) + "," + f1(bund - ld) + " " + f1(x + 40) + "," + f1(bund - ld) + " L" + f1(x + lb / 2) + "," + f1(bund - ld) + " L" + f1(x + lb / 2) + "," + f1(bund) + " Z";
            SV.el("path", { d: d, fill: "url(#b8-graa)", stroke: "#4f5a66", "stroke-width": 2, "stroke-linejoin": "round" }, gg);
        }
        SV.el("ellipse", { cx: f1(x - 12), cy: f1(bund - ld - 34), rx: 9, ry: 5, fill: "#ffffff", "fill-opacity": 0.4 }, gg);
        return gg;
    };

    /* ----- Faelles forloeb ---------------------------------------------- */
    var harDefs = false;
    B8.defs = function () {
        ORG.defs();
        if (NK.KV) NK.KV.defs();
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        function rad(id, stop, o) {
            o = o || {};
            var gr = SV.el("radialGradient", { id: id, cx: o.cx || "38%", cy: o.cy || "30%", r: o.r || "75%" }, d);
            stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, gr); });
        }
        function lin(id, stop, vandret) {
            var gr = SV.el("linearGradient", vandret ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : { id: id, x1: 0, x2: 0, y1: 0, y2: 1 }, d);
            stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, gr); });
        }
        lin("b8-protein", [["0", "#bfe7de"], ["0.5", "#8fd0c3"], ["1", "#5fae9f"]], true);
        rad("b8-orange", [["0", "#ffd9a8"], ["0.55", "#f39a3c"], ["1", "#c76a12"]]);
        rad("b8-lilla", [["0", "#e2d2fb"], ["0.55", "#a77de6"], ["1", "#6c43b8"]]);
        rad("b8-graa", [["0", "#e9edf1"], ["0.55", "#a7b0ba"], ["1", "#5d6874"]]);
        rad("b8-gloed", [["0", "#fff3a8", 0.95], ["0.5", "#ffe066", 0.55], ["1", "#ffd23d", 0]], { cx: "50%", cy: "50%", r: "50%" });
        rad("b8-jern", [["0", "#efe3ff"], ["0.5", "#a77de6"], ["1", "#5e33a6"]]);
        rad("b8-lillagloed", [["0", "#b48ae8", 0.55], ["1", "#b48ae8", 0]], { cx: "50%", cy: "50%", r: "50%" });
        rad("b8-blaagloed", [["0", "#4f7df0", 0.5], ["1", "#4f7df0", 0]], { cx: "50%", cy: "50%", r: "50%" });
        rad("b8-roedgloed", [["0", "#ef5b4b", 0.45], ["1", "#ef5b4b", 0]], { cx: "50%", cy: "50%", r: "50%" });
        lin("b8-tablet", [["0", "#ffffff"], ["1", "#dfe6ec"]]);
        lin("b8-octanol", [["0", "#f8e8b8"], ["1", "#efd38a"]]);
        lin("b8-vand", [["0", "#dbeaf8"], ["1", "#b9d5ef"]]);
        lin("b8-varm", [["0", "#fbe9cf"], ["1", "#f3cd98"]]);
    };

    /* En gloed bag en ladning: "neg" blaa, "pos" roed */
    B8.gloed = function (g, x, y, r, slags) {
        return SV.el("circle", { cx: f1(x), cy: f1(y), r: r, fill: "url(#b8-" + (slags === "pos" ? "roed" : "blaa") + "gloed)" }, g);
    };

    /* ----- Tabletten ----------------------------------------------------- */
    B8.tablet = function (g, cx, cy, r) {
        var gg = SV.g(g), t = r * 0.32;
        SV.el("ellipse", { cx: cx, cy: cy + t + 6, rx: r + 2, ry: r * 0.42, fill: "#1b2633", opacity: 0.14, filter: "url(#kv-blur-stor)" }, gg);
        SV.el("path", { d: "M" + (cx - r) + "," + cy + " L" + (cx - r) + "," + (cy + t) + " A" + r + "," + (r * 0.4) + " 0 0,0 " + (cx + r) + "," + (cy + t) + " L" + (cx + r) + "," + cy + " Z",
            fill: "#d7dee5", stroke: "#9aa6b1", "stroke-width": 1.4 }, gg);
        SV.el("ellipse", { cx: cx, cy: cy, rx: r, ry: r * 0.4, fill: "url(#b8-tablet)", stroke: "#9aa6b1", "stroke-width": 1.4 }, gg);
        SV.el("line", { x1: cx - r * 0.75, y1: cy, x2: cx + r * 0.75, y2: cy, stroke: "#aab5bf", "stroke-width": 2.2, "stroke-linecap": "round" }, gg);
        return gg;
    };

    /* ----- Glas og apparater --------------------------------------------- */

    /* Skilletragten (b8-fordeling-octanol): kegle med prop og hane. Giver
       graensen mellem de to lag og laggenes midte */
    B8.skilletragt = function (g, cx, top, o) {
        o = o || {};
        var gg = SV.g(g), b = o.b || 120, h = o.h || 150;
        var hals = top + 24, bred = hals + h * 0.42, spids = hals + h;
        var krop = "M" + (cx - 9) + "," + top + " L" + (cx - 9) + "," + hals +
            " C" + (cx - b * 0.55) + "," + (hals + 8) + " " + (cx - b * 0.62) + "," + (bred - 10) + " " + (cx - b * 0.5) + "," + bred +
            " L" + (cx - 7) + "," + (spids - 8) + " L" + (cx - 7) + "," + (spids + 34) + " L" + (cx + 7) + "," + (spids + 34) + " L" + (cx + 7) + "," + (spids - 8) +
            " L" + (cx + b * 0.5) + "," + bred + " C" + (cx + b * 0.62) + "," + (bred - 10) + " " + (cx + b * 0.55) + "," + (hals + 8) + " " + (cx + 9) + "," + hals +
            " L" + (cx + 9) + "," + top;
        var graense = hals + h * 0.5;
        function bredde(y) {
            if (y <= bred) return b * 0.5 * Math.min(1, (y - hals) / (bred - hals) * 1.15);
            return 7 + (b * 0.5 - 7) * (spids - 8 - y) / (spids - 8 - bred);
        }
        var oTop = hals + 22;
        function lag(y0, y1, fyld) {
            var n = 14, ve = [], ho = [];
            for (var i = 0; i <= n; i++) { var y = y0 + (y1 - y0) * i / n, w = Math.max(5, bredde(y) - 2.5); ve.push([cx - w, y]); ho.unshift([cx + w, y]); }
            SV.el("path", { d: "M" + ve.concat(ho).map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" L") + " Z", fill: fyld }, gg);
        }
        lag(oTop, graense, "url(#b8-octanol)");
        lag(graense, spids + 30, "url(#b8-vand)");
        SV.el("path", { d: krop, fill: "url(#glas)", "fill-opacity": 0.45, stroke: LAB.KANT, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("rect", { x: cx - 13, y: top - 16, width: 26, height: 18, rx: 4, fill: "#e9edf0", stroke: LAB.KANT, "stroke-width": 1.4 }, gg);
        SV.el("rect", { x: cx - 7, y: spids + 6, width: 46, height: 10, rx: 4, fill: "#2f62c8", stroke: "#1f3f86", "stroke-width": 1 }, gg);
        SV.el("circle", { cx: cx, cy: spids + 11, r: 8, fill: "#e9edf0", stroke: LAB.KANT, "stroke-width": 1.4 }, gg);
        return { g: gg, graense: graense, oMidte: (oTop + graense) / 2, vMidte: (graense + spids - 4) / 2, bredde: bredde, top: oTop, spids: spids };
    };

    /* En plet paa en TLC-plade */
    B8.plet = function (g, x, y, farve, r) {
        r = r || 7;
        var gg = SV.g(g);
        SV.el("ellipse", { cx: x, cy: y, rx: r * 1.5, ry: r * 1.15, fill: farve, opacity: 0.25 }, gg);
        SV.el("ellipse", { cx: x, cy: y, rx: r, ry: r * 0.8, fill: farve, opacity: 0.85 }, gg);
        return gg;
    };

    /* Buechnertragt paa en sugekolbe (b8-syntese-trin, filtrering) med
       krystaller paa filteret. Giver krystallernes rektangel */
    B8.filtrering = function (g, cx, top, o) {
        o = o || {};
        var gg = SV.g(g);
        var tb = 74, tt = 18;
        var kolbe = LAB.erlenmeyer(gg, cx, top + 150, 92, { fyld: "#e8f1f8", niveau: 0.18 });
        /* sidearmen til sugningen */
        SV.el("path", { d: "M" + (cx + 12) + "," + (top + 76) + " L" + (cx + 44) + "," + (top + 76), stroke: LAB.KANT, "stroke-width": 7, "stroke-linecap": "round" }, gg);
        SV.el("rect", { x: cx + 40, y: top + 71, width: 22, height: 10, rx: 3, fill: "#2f3a44" }, gg);
        /* gummiproppen og tragten */
        SV.el("rect", { x: cx - 13, y: top + 50, width: 26, height: 12, rx: 3, fill: "#2f3a44" }, gg);
        SV.el("path", { d: "M" + (cx - 6) + "," + (top + 54) + " L" + (cx - 6) + "," + (top + tt + 18) + " L" + (cx - tb / 2) + "," + (top + tt) + " L" + (cx - tb / 2) + "," + (top - 4) +
            " L" + (cx + tb / 2) + "," + (top - 4) + " L" + (cx + tb / 2) + "," + (top + tt) + " L" + (cx + 6) + "," + (top + tt + 18) + " L" + (cx + 6) + "," + (top + 54),
            fill: "#f1f3f4", stroke: "#8f9aa3", "stroke-width": 1.6, "stroke-linejoin": "round" }, gg);
        /* krystallerne paa filteret */
        var k = [];
        for (var i = 0; i < (o.tom ? 0 : 11); i++) {
            var kx = cx - tb / 2 + 8 + i * (tb - 16) / 10, ky = top + 6 + (i % 2) * 4;
            k.push(SV.el("polygon", { points: f1(kx - 5) + "," + f1(ky + 4) + " " + f1(kx) + "," + f1(ky - 5) + " " + f1(kx + 5) + "," + f1(ky + 4), fill: "#ffffff", stroke: "#9aa6b1", "stroke-width": 1 }, gg));
        }
        return { g: gg, krystaller: [cx - tb / 2 + 1, top - 4, tb - 2, 20] };
    };

    /* Partikler i en vaeske (hvide: produkt, orange: urenheder) */
    B8.partikler = function (g, liste, r) {
        var gg = SV.g(g);
        liste.forEach(function (p) {
            var orange = p[2];
            SV.el("circle", { cx: f1(p[0]), cy: f1(p[1]), r: r || 4.5, fill: orange ? "#f39a3c" : "#ffffff", stroke: orange ? "#b4661b" : "#8f9aa3", "stroke-width": 1.1 }, gg);
        });
        return gg;
    };

    /* Damp over en varm vaeske */
    B8.damp = function (g, x, y, n) {
        var gg = SV.g(g);
        for (var i = 0; i < (n || 3); i++) {
            var xx = x + (i - ((n || 3) - 1) / 2) * 14;
            SV.el("path", { d: "M" + xx + "," + y + " q-6,-8 0,-16 q6,-8 0,-16", fill: "none", stroke: "#c08a52", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.8 }, gg);
        }
        return gg;
    };
}());

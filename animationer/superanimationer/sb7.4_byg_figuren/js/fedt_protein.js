/* =====================================================================
   fedt_protein.js - tegnehjaelp til B7.5 til B7.8: fedtsyrer og
   fedtstoffer, aminosyrer og proteiner (NK.FP)

   Kun for dette kapitel (ikke en del af den faelles motor). Bygger paa
   org.js (kopieret uaendret fra sb4.10_byg_figuren). Byggestenene er
   oversat fra bogens figurprogram (Kemibogen/vaerktoej/lav_figurer.py):
   hale (fedtsyrekaeden som zigzag med cis-knaek), fedt_glycerol og
   sf_b7f_ester (estergruppen som strukturformel), sf_b7f_roer,
   sf_b7f_helix, sf_b7f_streng og sf_b7f_fold (proteinkaeden som et roer
   med glans), sf_b7f_glod (bloede gloeder) og bogens farver.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var ORG = NK.ORG;
    var FP = NK.FP = {};

    /* Bogens farver */
    FP.F = {
        blaek: "#14201f",
        daempet: "#556766",
        accent: "#0f766e",
        accentLys: "#e3f2f0",
        fedt: "#b9770e",              /* carbonkaederne i fedtsyrer */
        syreHO: "#a93226",            /* HO i fedtsyrens carboxylgruppe */
        pos: "#c0392b",
        posLys: "#fbd3ca",
        neg: "#1d4ed8",
        negLys: "#dbe7fb",
        side: "#b45309",              /* sidekaeden R */
        sideLys: "#fdecc8",
        proton: "#e5533d",            /* hydrogenbindinger som roede prikker */
        fast: "#8d6e63",              /* fast fedt i iodtalsskalaen */
        flyd: "#3f9c8f",              /* olie */
        dibrom: "#b87a10",
        forbrugt: ["#e3f2f0", "#0f766e", "#0f766e"],
        overskud: ["#f0e9fb", "#7c56c2", "#5f3fa6"],
        start: ["#fbefc4", "#c99a12", "#7a560c"]
    };
    var F = FP.F;
    FP.TEAL = ["#0f766e", "#8fd3c8", "#6fb5aa"];   /* en peptidkaede: forside, glans og bagside */
    FP.RAV = ["#b45309", "#f6c58a", "#e2a76b"];    /* den anden slags kaede i kvaternaer struktur */

    function f1(v) { return (Math.round(v * 10) / 10).toString(); }
    function polar(x, y, l, grader) { var v = grader * Math.PI / 180; return [x + l * Math.cos(v), y + l * Math.sin(v)]; }
    FP.polar = polar;
    function bred(s, fs) { return NK.tekstBredde(String(s).replace(/[_^]\{?([^}]*)\}?/g, "$1"), fs, 700); }
    FP.bred = bred;

    /* ----- Farveforloeb i motorens faelles defs ------------------------- */
    var harDefs = false;
    FP.defs = function () {
        ORG.defs();
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        function lin(id, a, b, vandret) {
            var g = SV.el("linearGradient", vandret ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : { id: id, x1: 0, x2: 0, y1: 0, y2: 1 }, d);
            SV.el("stop", { offset: 0, "stop-color": a }, g);
            SV.el("stop", { offset: 1, "stop-color": b }, g);
        }
        lin("fp-streng-teal", FP.TEAL[1], FP.TEAL[2]);
        lin("fp-streng-rav", FP.RAV[1], FP.RAV[2]);
        lin("fp-skala", F.fast, F.flyd, true);
        lin("fp-glans", "#ffffff", "#ffffff");
        lin("fp-dibrom", "#f2c45a", "#c98a14");
        lin("fp-dibrom-lys", "#f8e3a6", "#ecc768");
        [["fp-glod-pos", "#e5533d"], ["fp-glod-neg", "#2f6fde"], ["fp-glod-neu", "#a9a6d8"], ["fp-glod-gul", "#f2c53d"]].forEach(function (gr) {
            var el = SV.el("radialGradient", { id: gr[0], cx: 0.5, cy: 0.5, r: 0.5 }, d);
            SV.el("stop", { offset: 0.45, "stop-color": gr[1], "stop-opacity": 0.42 }, el);
            SV.el("stop", { offset: 1, "stop-color": gr[1], "stop-opacity": 0 }, el);
        });
        var bund = SV.el("radialGradient", { id: "fp-bund", cx: 0.5, cy: 0.45, r: 0.55 }, d);
        SV.el("stop", { offset: 0, "stop-color": "#d9efeb", "stop-opacity": 0.95 }, bund);
        SV.el("stop", { offset: 1, "stop-color": "#d9efeb", "stop-opacity": 0 }, bund);
        var perle = SV.el("radialGradient", { id: "fp-perle", cx: 0.36, cy: 0.3, r: 0.78 }, d);
        SV.el("stop", { offset: 0, "stop-color": "#ffffff" }, perle);
        SV.el("stop", { offset: 0.6, "stop-color": "#eef2f2" }, perle);
        SV.el("stop", { offset: 1, "stop-color": "#b9c4c4" }, perle);
        var aa = SV.el("radialGradient", { id: "fp-aa", cx: 0.36, cy: 0.3, r: 0.8 }, d);
        SV.el("stop", { offset: 0, "stop-color": "#f4fbfa" }, aa);
        SV.el("stop", { offset: 0.6, "stop-color": "#c7e8e2" }, aa);
        SV.el("stop", { offset: 1, "stop-color": "#86c2b8" }, aa);
        var sky = SV.el("filter", { id: "fp-sky", x: "-40%", y: "-40%", width: "180%", height: "180%" }, d);
        SV.el("feGaussianBlur", { stdDeviation: 3.2 }, sky);
    };

    /* Tekst med bogens skrift (som ORG.t) */
    FP.t = function (g, x, y, s, o) { return ORG.t(g, x, y, s, o); };

    /* En streg */
    FP.linje = function (g, x1, y1, x2, y2, farve, sw, streg) {
        return SV.el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: farve || F.blaek, "stroke-width": sw || 2.2,
            "stroke-linecap": "round", "stroke-dasharray": streg || null }, g);
    };

    /* En pil (som bogens pil): spids i (x2, y2) */
    FP.pil = function (g, x1, y1, x2, y2, farve, sw, hoved) {
        var gg = SV.g(g);
        farve = farve || F.blaek;
        hoved = hoved || 11;
        var v = Math.atan2(y2 - y1, x2 - x1), ux = Math.cos(v), uy = Math.sin(v), nx = -uy, ny = ux, b = hoved * 0.48;
        var bx = x2 - ux * hoved, by = y2 - uy * hoved;
        FP.linje(gg, x1, y1, bx + ux * 2, by + uy * 2, farve, sw || 2.4);
        SV.el("polygon", { points: f1(x2) + "," + f1(y2) + " " + f1(bx + nx * b) + "," + f1(by + ny * b) + " " + f1(bx - nx * b) + "," + f1(by - ny * b), fill: farve }, gg);
        return gg;
    };

    /* En bloed gloed: slags er "pos", "neg", "neu" eller "gul" */
    FP.glod = function (g, x, y, r, slags, op) {
        return SV.el("circle", { cx: f1(x), cy: f1(y), r: f1(r), fill: "url(#fp-glod-" + slags + ")", opacity: op === undefined ? 1 : op }, g);
    };
    FP.glodEllipse = function (g, x, y, rx, ry, slags, op) {
        return SV.el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(rx), ry: f1(ry), fill: "url(#fp-glod-" + slags + ")", opacity: op === undefined ? 1 : op }, g);
    };

    /* ----- Fedtsyrer og fedtstoffer --------------------------------------- */

    /* Carbonkaeden som zigzag (bogens hale). knaek: { bindingens nummer: drejning
       i grader } er en cis-dobbeltbinding (60 giver 120 graders vinkler);
       trans: [nummer] er en dobbeltbinding, hvor kaeden ikke knaekker.
       Giver kaedens punkter. */
    FP.hale = function (g, x0, y0, n, o) {
        o = o || {};
        var L = o.L || 12, knaek = o.knaek || {}, trans = o.trans || [], ret = o.ret || 0, side = o.side || 1;
        var farve = o.farve || F.fedt, sw = o.sw || 2.2, dfarve = o.dfarve || farve;
        var pkt = [[x0, y0]];
        for (var i = 0; i < n - 1; i++) {
            pkt.push(polar(pkt[pkt.length - 1][0], pkt[pkt.length - 1][1], L, ret + 30 * side));
            if (knaek[i] !== undefined) ret += knaek[i] * side;
            else side = -side;
        }
        for (i = 0; i < n - 1; i++) {
            var p = pkt[i], q = pkt[i + 1];
            var db = knaek[i] !== undefined || trans.indexOf(i) >= 0;
            var f = db ? dfarve : farve;
            FP.linje(g, p[0], p[1], q[0], q[1], f, sw);
            if (db) {
                var l = Math.sqrt((q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]));
                var ux = (q[0] - p[0]) / l, uy = (q[1] - p[1]) / l, nx = -uy, ny = ux;
                var nab = [i - 1, i + 2].filter(function (j) { return j >= 0 && j < pkt.length; }).map(function (j) { return pkt[j]; });
                var mx = nab.reduce(function (s, a) { return s + a[0]; }, 0) / nab.length - (p[0] + q[0]) / 2;
                var my = nab.reduce(function (s, a) { return s + a[1]; }, 0) / nab.length - (p[1] + q[1]) / 2;
                /* Ved trans ligger naboerne paa hver sin side: den ekstra streg kommer under */
                if (knaek[i] !== undefined ? (nx * mx + ny * my < 0) : (ny < 0)) { nx = -nx; ny = -ny; }
                var a = 0.3 * L, k = 0.2 * L;
                FP.linje(g, p[0] + ux * k + nx * a, p[1] + uy * k + ny * a, q[0] - ux * k + nx * a, q[1] - uy * k + ny * a, f, sw);
            }
        }
        return pkt;
    };

    /* En estergruppe eller carboxylgruppe som strukturformel med kaeden (bogens
       sf_b7f_ester): bogstavet O staar midt paa (x, y), en binding gaar skraat op
       til carbonatomet i C=O, =O peger lige op, og kaeden fortsaetter. n er
       antallet af carbonatomer med carbonatomet i C=O. start er "O", "HO" eller
       "^−O". Giver { pkt, boks: [x, y, b, h] } (boksen bag gruppen). */
    FP.ester = function (g, x, y, n, o) {
        o = o || {};
        var fs = o.fs || 15, L = o.L || 12, sw = o.sw || 2.2, start = o.start || "O";
        var gf = o.gfarve || F.blaek, sf = o.sfarve || gf;
        var c = polar(x, y, L + 0.5 * fs + 3, -30);
        var dO = 0.85 * L + 0.35 * fs + 3;
        var ox = c[0], oy = c[1] - dO;
        var r = 0.37 * fs + 4;
        var boks = [x - r, oy - r, c[0] + r - (x - r), y + 0.35 * fs + 4 - (oy - r)];
        if (o.boks) SV.el("rect", { x: f1(boks[0]), y: f1(boks[1]), width: f1(boks[2]), height: f1(boks[3]), rx: 6, fill: o.boksFarve || F.accentLys }, g);
        if (start === "O") ORG.t(g, x, y + 0.35 * fs, "O", { fs: fs, fed: true, farve: sf });
        else ORG.t(g, x + 0.37 * fs, y + 0.35 * fs, start, { fs: fs, fed: true, farve: sf, anker: "end" });
        ORG.t(g, ox, oy + 0.35 * fs, "O", { fs: fs, fed: true, farve: gf });
        var s = polar(x, y, 0.45 * fs + 2, -30);
        FP.linje(g, s[0], s[1], c[0], c[1], gf, sw);
        [-2.7, 2.7].forEach(function (fx) {
            var a = Math.abs(fx) * 0.58, b = dO - 0.35 * fs - 3;
            FP.linje(g, c[0] + fx, c[1] - a, c[0] + fx, c[1] - b, gf, sw);
        });
        var pkt = FP.hale(g, c[0], c[1], n, { L: L, knaek: o.knaek, trans: o.trans, farve: o.farve || F.fedt, sw: sw, dfarve: o.dfarve });
        return { pkt: pkt, boks: boks, c: c };
    };

    /* Glycerols tre carbonatomer som CH2, CH og CH2 under hinanden (bogens
       fedt_glycerol). Giver hoejre kant af teksten i hver raekke. */
    FP.glycerol = function (g, x, raekker, fs) {
        fs = fs || 15;
        var kanter = [];
        raekker.forEach(function (y, k) {
            var t = k === 1 ? "CH" : "CH_2";
            ORG.t(g, x - 0.37 * fs, y + 0.35 * fs, t, { fs: fs, fed: true, anker: "start" });
            kanter.push(x - 0.37 * fs + bred(t, fs));
            if (k) FP.linje(g, x, raekker[k - 1] + 0.35 * fs + 4, x, y - 0.37 * fs - 4, F.blaek, 2.2);
        });
        return kanter;
    };
    var BIND = 11;

    /* Glycerol med tre OH-grupper. Giver hoejre kant */
    FP.glycerolOH = function (g, gx, raekker, fs) {
        fs = fs || 15;
        var kanter = FP.glycerol(g, gx, raekker, fs);
        var bx = Math.max.apply(null, kanter) + 3 + BIND;
        raekker.forEach(function (y, k) {
            FP.linje(g, kanter[k] + 3, y, bx, y, F.blaek, 2.2);
            ORG.t(g, bx + 3, y + 0.35 * fs, "OH", { fs: fs, fed: true, anker: "start", farve: F.accent });
        });
        return bx + 3 + bred("OH", fs);
    };

    /* Et fedtstof: glycerol og tre estergrupper med kaeder. Giver { hoejre, bokse, venstre } */
    FP.fedtstof = function (g, gx, raekker, n, o) {
        o = o || {};
        var fs = o.fs || 15;
        var kanter = FP.glycerol(g, gx, raekker, fs);
        var bx = Math.max.apply(null, kanter) + 3 + BIND;
        var hoejre = 0, bokse = [];
        raekker.forEach(function (y, k) {
            var ox = bx + 3 + 0.37 * fs;
            FP.linje(g, kanter[k] + 3, y, bx, y, F.blaek, 2.2);
            var e = FP.ester(g, ox, y, n, { fs: fs, gfarve: F.accent, farve: F.fedt, boks: o.boks !== false });
            bokse.push(e.boks);
            hoejre = Math.max(hoejre, Math.max.apply(null, e.pkt.map(function (p) { return p[0]; })));
        });
        return { hoejre: hoejre, bokse: bokse, venstre: gx - 0.37 * fs };
    };

    /* Kaedens laengste x */
    FP.maxX = function (pkt) { return Math.max.apply(null, pkt.map(function (p) { return p[0]; })); };
    FP.minY = function (pkt) { return Math.min.apply(null, pkt.map(function (p) { return p[1]; })); };
    FP.maxY = function (pkt) { return Math.max.apply(null, pkt.map(function (p) { return p[1]; })); };

    /* ----- Proteinkaeder som roer ----------------------------------------- */

    /* Kaeden som et roer: forsiden moerk med en lys stribe, bagsiden lysere og tyndere */
    FP.roer = function (g, pkt, farve, sw, bag) {
        if (pkt.length < 2) return null;
        farve = farve || FP.TEAL;
        sw = sw || 6.5;
        var d = "M " + pkt.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" L ");
        if (bag) return SV.el("path", { d: d, fill: "none", stroke: farve[2], "stroke-width": f1(sw * 0.82), "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
        var gg = SV.g(g);
        SV.el("path", { d: d, fill: "none", stroke: farve[0], "stroke-width": f1(sw), "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
        SV.el("path", { d: d, fill: "none", stroke: farve[1], "stroke-width": f1(sw * 0.28), "stroke-linecap": "round", "stroke-linejoin": "round",
            transform: "translate(" + f1(-sw * 0.16) + "," + f1(-sw * 0.2) + ")", opacity: 0.85 }, gg);
        return gg;
    };

    /* Punkter paa en kubisk bezierkurve */
    FP.bezier = function (p0, p1, p2, p3, n) {
        n = n || 24;
        var ud = [];
        for (var i = 0; i <= n; i++) {
            var t = i / n, a = (1 - t) * (1 - t) * (1 - t), b = 3 * t * (1 - t) * (1 - t), c = 3 * t * t * (1 - t), d = t * t * t;
            ud.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
        }
        return ud;
    };

    /* En bloed kurve gennem punkterne (catmull-rom) */
    FP.spline = function (pkt, n) {
        n = n || 12;
        var ud = [], P = [pkt[0]].concat(pkt, [pkt[pkt.length - 1]]);
        for (var i = 1; i < P.length - 2; i++) {
            var p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
            for (var k = 0; k < n; k++) {
                var t = k / n, t2 = t * t, t3 = t2 * t;
                ud.push([0, 1].map(function (j) {
                    return 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3);
                }));
            }
        }
        ud.push(pkt[pkt.length - 1]);
        return ud;
    };

    /* Punktet paa helixen ved t (0 til 1) */
    FP.helixpunkt = function (a, b, r, vind, t, k) {
        k = k === undefined ? 0.5 : k;
        var L = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
        var ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
        var f = 2 * Math.PI * vind * t, s = L * t + k * r * Math.sin(f);
        return [a[0] + ux * s - uy * r * Math.cos(f), a[1] + uy * s + ux * r * Math.cos(f)];
    };

    /* En alfa-helix som spiral med aksen fra a til b. Giver { bag, foran } som lister af punktlister */
    FP.helix = function (a, b, r, vind, k) {
        var bag = [], foran = [], cur = [], cf = null, N = Math.round(vind * 40);
        for (var i = 0; i <= N; i++) {
            var t = i / N, p = FP.helixpunkt(a, b, r, vind, t, k);
            var front = Math.sin(2 * Math.PI * vind * t) < 0;
            if (cf === null) cf = front;
            if (front !== cf) {
                cur.push(p);
                (cf ? foran : bag).push(cur);
                cur = [p]; cf = front;
            } else cur.push(p);
        }
        (cf ? foran : bag).push(cur);
        return { bag: bag, foran: foran };
    };

    /* Tegner en helix (bagside foerst) */
    FP.tegnHelix = function (g, a, b, r, vind, farve, sw) {
        var h = FP.helix(a, b, r, vind);
        h.bag.forEach(function (s) { FP.roer(g, s, farve, sw, true); });
        h.foran.forEach(function (s) { FP.roer(g, s, farve, sw); });
        return h;
    };

    /* En beta-streng som en flad pil med tykkelse fra a til b */
    FP.streng = function (g, a, b, w, farve, tyk) {
        farve = farve || FP.TEAL;
        tyk = tyk === undefined ? 3.2 : tyk;
        var L = Math.sqrt((b[0] - a[0]) * (b[0] - a[0]) + (b[1] - a[1]) * (b[1] - a[1]));
        var ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L, nx = -uy, ny = ux, hl = w * 1.25, hw = w * 0.95;
        function P(s, q) { return [a[0] + ux * s + nx * q, a[1] + uy * s + ny * q]; }
        var pts = [P(0, -w / 2), P(L - hl, -w / 2), P(L - hl, -hw), P(L, 0), P(L - hl, hw), P(L - hl, w / 2), P(0, w / 2)];
        var d = "M " + pts.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" L ") + " Z";
        var gg = SV.g(g);
        SV.el("path", { d: d, fill: farve[0], stroke: farve[0], "stroke-width": 1.2, "stroke-linejoin": "round", transform: "translate(0," + f1(tyk) + ")" }, gg);
        SV.el("path", { d: d, fill: "url(#fp-streng-" + (farve === FP.RAV ? "rav" : "teal") + ")", stroke: farve[0], "stroke-width": 1.2, "stroke-linejoin": "round" }, gg);
        return gg;
    };

    /* Hydrogenbindinger som roede prikker */
    FP.hbind = function (g, x1, y1, x2, y2, sw) {
        return FP.linje(g, x1, y1, x2, y2, F.proton, sw || 2.4, "1 4.5");
    };

    /* Et foldet protein (bogens sf_b7f_fold): en helix foroven og to strenge
       forneden, bundet sammen af loekker. Midten er (cx, cy), omkring 150 x 100
       gange s. hbind tegner de svage bindinger som roede prikker. */
    FP.fold = function (g, cx, cy, s, farve, o) {
        o = o || {};
        s = s || 1;
        farve = farve || FP.TEAL;
        function P(x, y) { return [cx + x * s, cy + y * s]; }
        var sw = (o.sw || 6.5) * Math.sqrt(s);
        var ha = P(-44, -34), hb = P(30, -34), r = 13 * s, vind = 3.5;
        var h0 = FP.helixpunkt(ha, hb, r, vind, 0), h1 = FP.helixpunkt(ha, hb, r, vind, 1);
        var h = FP.helix(ha, hb, r, vind);
        var lk = [FP.bezier(P(-70, 4), P(-74, -12), [h0[0] - 18 * s, h0[1] + 4 * s], h0),
            FP.bezier(h1, [h1[0] + 26 * s, h1[1] + 2 * s], P(70, -2), P(52, 4)),
            FP.bezier(P(-44, 4), P(-66, 4), P(-66, 34), P(-46, 34)),
            FP.bezier(P(50, 34), P(64, 34), P(68, 46), P(60, 54))];
        h.bag.forEach(function (st) { FP.roer(g, st, farve, sw, true); });
        lk.forEach(function (l) { FP.roer(g, l, farve, sw); });
        FP.streng(g, P(54, 4), P(-46, 4), 13 * s, farve, 3.2 * s);
        FP.streng(g, P(-48, 34), P(54, 34), 13 * s, farve, 3.2 * s);
        h.foran.forEach(function (st) { FP.roer(g, st, farve, sw); });
        if (o.hbind) {
            [-26, -6, 14, 34].forEach(function (x) { var a = P(x, 15), b = P(x, 23); FP.hbind(g, a[0], a[1], b[0], b[1], 2.4 * Math.sqrt(s)); });
            [-30, 6].forEach(function (x) { var a = P(x, -15), b = P(x, -7); FP.hbind(g, a[0], a[1], b[0], b[1], 2.4 * Math.sqrt(s)); });
        }
    };

    /* ----- Aminosyrer ------------------------------------------------------ */

    /* Et bundt atomsymboler paa en linje med bindingsstreger imellem.
       dele: [[tekst, farve], ...]; x er venstre kant. Giver midten af hver del. */
    FP.kaedeTekst = function (g, x, y, dele, fs) {
        fs = fs || 17;
        var gap = 16, mid = [];
        dele.forEach(function (d, i) {
            var b = bred(d[0], fs);
            ORG.t(g, x, y + 0.36 * fs, d[0], { fs: fs, fed: true, anker: "start", farve: d[1] || F.blaek });
            mid.push([x + b / 2, y, b]);
            x += b;
            if (i < dele.length - 1) {
                FP.linje(g, x + 3, y, x + gap - 3, y, F.blaek, 2.2);
                x += gap;
            }
        });
        return mid;
    };

    /* En aminosyre H2N−CH−COOH med sidekaeden nedad fra CH. side er en liste
       af raekker under CH: en tekst, eller [venstre, midte, hoejre] for en
       gren (valin). cx er midten af CH. Giver { mid, bund }. */
    FP.aminosyre = function (g, cx, y, side, o) {
        o = o || {};
        var fs = o.fs || 17, dy = o.dy || 30;
        var bN = bred("H_2N", fs), bC = bred("CH", fs);
        var x0 = cx - bC / 2 - 16 - bN;
        var mid = FP.kaedeTekst(g, x0, y, [["H_2N", o.nFarve || F.neg], ["CH", F.blaek], ["COOH", o.cFarve || F.pos]], fs);
        var yy = y, sf = o.sFarve || F.side, sfs = o.sfs || fs * 0.94;
        side.forEach(function (r) {
            FP.linje(g, cx, yy + 0.4 * fs + 2, cx, yy + dy - 0.42 * sfs - 2, sf === F.side ? F.side : F.blaek, 2.2);
            yy += dy;
            if (typeof r === "string") ORG.t(g, cx, yy + 0.36 * sfs, r, { fs: sfs, fed: true, farve: sf });
            else {
                var bm = bred(r[1], sfs);
                ORG.t(g, cx, yy + 0.36 * sfs, r[1], { fs: sfs, fed: true, farve: sf });
                ORG.t(g, cx - bm / 2 - 16, yy + 0.36 * sfs, r[0], { fs: sfs, fed: true, farve: sf, anker: "end" });
                ORG.t(g, cx + bm / 2 + 16, yy + 0.36 * sfs, r[2], { fs: sfs, fed: true, farve: sf, anker: "start" });
                FP.linje(g, cx - bm / 2 - 13, yy, cx - bm / 2 - 3, yy, sf, 2.2);
                FP.linje(g, cx + bm / 2 + 3, yy, cx + bm / 2 + 13, yy, sf, 2.2);
            }
        });
        return { mid: mid, bund: yy + 0.5 * sfs, venstre: x0, hoejre: mid[2][0] + mid[2][2] / 2 };
    };

    /* En aminosyre som perle med forkortelsen (bogens primaere struktur) */
    FP.perle = function (g, x, y, r, navn) {
        var gg = SV.g(g);
        SV.el("circle", { cx: f1(x + 0.6), cy: f1(y + 1.8), r: f1(r + 0.6), fill: "#1c3533", opacity: 0.18 }, gg);
        SV.el("circle", { cx: f1(x), cy: f1(y), r: f1(r), fill: "url(#fp-aa)", stroke: "#2d8f84", "stroke-width": 1.5 }, gg);
        ORG.t(gg, x, y + 5.4, navn, { fs: 15, fed: true, farve: F.blaek });
        return gg;
    };

    /* En kugle (atom) med lys og skygge */
    FP.kugle = function (g, x, y, r, slags) { return SV.kugle(g, x, y, r, slags); };

    /* ----- Glas ------------------------------------------------------------ */

    /* En erlenmeyerkolbe med bund i (cx, bund) og hoejden h (som LAB.erlenmeyer
       i sc8.7_byg_figuren). o.fyld er vaesken, o.niveau dens hoejde (0 til 1) */
    FP.kolbe = function (g, cx, bund, h, o) {
        o = o || {};
        var gg = SV.g(g), KANT = "#7d8b96";
        var hb = h * 0.12, b = h * 0.48, hals = bund - h, skulder = bund - h * 0.62;
        var krop = "M" + (cx - hb) + "," + hals + " L" + (cx - hb) + "," + skulder + " L" + (cx - b + 6) + "," + (bund - 4) +
            " Q" + (cx - b) + "," + bund + " " + (cx - b + 10) + "," + bund + " L" + (cx + b - 10) + "," + bund + " Q" + (cx + b) + "," + bund + " " + (cx + b - 6) + "," + (bund - 4) +
            " L" + (cx + hb) + "," + skulder + " L" + (cx + hb) + "," + hals;
        if (o.fyld) {
            var vy = bund - h * (o.niveau || 0.3);
            var t = (bund - vy) / (bund - skulder);
            var vb = b - (b - hb) * t;
            SV.el("path", { d: "M" + f1(cx - vb + 1) + "," + f1(vy) + " L" + (cx - b + 7) + "," + (bund - 4) + " Q" + (cx - b + 2) + "," + (bund - 1.5) + " " + (cx - b + 11) + "," + (bund - 1.5) +
                " L" + (cx + b - 11) + "," + (bund - 1.5) + " Q" + (cx + b - 2) + "," + (bund - 1.5) + " " + (cx + b - 7) + "," + (bund - 4) + " L" + f1(cx + vb - 1) + "," + f1(vy) + " Z",
                fill: o.fyld }, gg);
        }
        SV.el("path", { d: krop, fill: "url(#glas)", "fill-opacity": 0.45, stroke: KANT, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("line", { x1: cx - hb - 4, y1: hals, x2: cx + hb + 4, y2: hals, stroke: KANT, "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: f1(cx - b * 0.55), y1: f1(bund - h * 0.12), x2: f1(cx - hb - 1), y2: f1(skulder + 6), stroke: "#ffffff", "stroke-width": 2.4, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        return { g: gg, hals: hals, b: b };
    };

    /* En burette fra top til bund med hane og spids, og vaesken i den */
    FP.burette = function (g, bx, top, bund, fyld) {
        var gg = SV.g(g), b = 13, KANT = "#7d8b96";
        SV.el("rect", { x: bx - b / 2 + 1, y: top + 10, width: b - 2, height: bund - top - 10, fill: fyld || "#eef3f7" }, gg);
        SV.el("rect", { x: bx - b / 2, y: top, width: b, height: bund - top, rx: 2, fill: "url(#glas)", "fill-opacity": 0.5, stroke: KANT, "stroke-width": 1.5 }, gg);
        for (var k = 0; k < 5; k++) {
            var y = top + 14 + k * (bund - top - 20) / 4;
            FP.linje(gg, bx - b / 2 + 1.5, y, bx - b / 2 + (k % 2 === 0 ? 7 : 4.5), y, "#2f3d43", 0.8);
        }
        SV.el("rect", { x: bx - 9, y: bund + 1, width: 18, height: 8, rx: 2, fill: "#5d6b75" }, gg);
        SV.el("rect", { x: bx - 16, y: bund + 3, width: 7, height: 4, rx: 1.5, fill: "#2f63c9" }, gg);
        SV.el("path", { d: "M " + (bx - 2.5) + "," + (bund + 9) + " L " + (bx - 1.5) + "," + (bund + 20) + " H " + (bx + 1.5) + " L " + (bx + 2.5) + "," + (bund + 9) + " Z",
            fill: "url(#glas)", stroke: KANT, "stroke-width": 1.1 }, gg);
        return gg;
    };

    /* Et kort i bogens superstil (som ORG.kortB) */
    FP.kort = function (g, x, y, b, h, o) { return ORG.kortB(g, x, y, b, h, o); };

    /* Et nummer i en groen cirkel */
    FP.nummer = function (g, x, y, n) { return ORG.nummer(g, x, y, n, 11); };
}());

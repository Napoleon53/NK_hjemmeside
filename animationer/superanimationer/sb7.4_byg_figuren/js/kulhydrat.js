/* =====================================================================
   kulhydrat.js - tegnehjaelp til kapitel B7 (kulhydraterne)

   Kun for dette kapitel (ikke en del af den faelles motor). Tegningerne
   er overfoert fra bogens Kemibogen/vaerktoej/lav_figurer.py, saa eleven
   genkender figurerne fra B7.1 til B7.4:
     KH.fischer   fischerprojektion (b7_fischer og sf_b7k_fischer)
     KH.ring      haworthformel med seks eller fem atomer (b7_ring og
                  sf_b7k_ring), ogsaa vendt om som i lactose og saccharose
     KH.bro       glykosidbindingen mellem to ringe (b7_bro)
     KH.gitter    glucose med alle atomer tegnet (sf_b7k_glucose_gitter)
     KH.hex       en sukkerenhed som sekskant (sf_b7k_hex), KH.obro,
                  KH.spiral (amylose) og KH.trae (amylopectin, glykogen)
     KH.broed, KH.draabe, KH.aeg   de tre naeringsstoffer
     KH.glas      reagensglas med Fehlings vaeske og kobber(I)oxid
   Skriften og farverne er bogens. Bredden af en tekst regnes som i
   bogen (b4_bredde), saa figurerne staar ens paa alle computere.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var SV = NK.SV;
    var KH = NK.KH = {};

    /* Bogens farver (lav_figurer.py) */
    var F = KH.F = {
        blaek: "#14201f",
        daempet: "#556766",
        accent: "#0f766e",
        accentLys: "#e3f2f0",
        sukker: "#b45309",          /* NY_KANT: det, der fremhaeves som nummer to (orange) */
        sukkerLys: "#fdecc8",
        proton: "#e5533d",          /* hydrogenbindinger */
        protonKant: "#a93226",
        posFyld: "#fbd3ca",
        neg: "#1d4ed8",
        negFyld: "#cfe0fb",
        kant: "#c9d6e0"
    };

    function f1(v) { return (Math.round(v * 10) / 10).toString(); }

    /* ----- Faelles farveforloeb og filtre ---------------------------------- */
    var harDefs = false;
    KH.defs = function () {
        if (NK.ORG && NK.ORG.defs) NK.ORG.defs();
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        function lin(id, stops, vandret) {
            var g = SV.el("linearGradient", { id: id, x1: 0, x2: vandret ? 1 : 0, y1: 0, y2: vandret ? 0 : 1 }, d);
            stops.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
            return g;
        }
        function rad(id, cx, cy, r, stops) {
            var g = SV.el("radialGradient", { id: id, cx: cx, cy: cy, r: r }, d);
            stops.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
            return g;
        }
        var glod = SV.el("filter", { id: "kh-glod", x: "-60%", y: "-60%", width: "220%", height: "220%" }, d);
        SV.el("feGaussianBlur", { stdDeviation: 3.2 }, glod);
        lin("kh-flade", [["0", "#ead9b6", 0.5], ["1", "#fff6e3", 0.95]]);
        var hex = SV.el("linearGradient", { id: "kh-hex", x1: 0.2, x2: 0.75, y1: 0, y2: 1 }, d);
        [["0", "#fff4dc"], ["0.55", "#f7cf8a"], ["1", "#e2a04a"]].forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1] }, hex); });
        rad("kh-hexlys", 0.38, 0.3, 0.6, [["0", "#ffffff", 0.85], ["1", "#ffffff", 0]]);
        /* Naeringsstofferne */
        lin("kh-skorpe", [["0", "#6b4426"], ["1", "#3f2715"]]);
        lin("kh-kerne", [["0", "#8c5b36"], ["1", "#6a4126"]]);
        rad("kh-olie", 0.38, 0.45, 0.7, [["0", "#fff6c2"], ["0.5", "#f4cd45"], ["1", "#cf930f"]]);
        rad("kh-aeg", 0.38, 0.32, 0.75, [["0", "#fffaf2"], ["0.6", "#f1dcc0"], ["1", "#d2b18a"]]);
        lin("kh-energi", [["0", "#fbbf47"], ["1", "#e38a12"]], true);
        lin("kh-andel", [["0", "#5fb3a9"], ["1", "#0f766e"]], true);
        /* Fehlings test */
        lin("kh-blaa", [["0", "#5d97ea"], ["1", "#1f4fb5"]]);
        lin("kh-dybblaa", [["0", "#3f7fe0"], ["1", "#173f9a"]]);
        lin("kh-klar", [["0", "#f4f7fa"], ["1", "#dfe7ee"]]);
        lin("kh-murst", [["0", "#c4532f"], ["0.55", "#a9401f"], ["1", "#7c2612"]]);
        lin("kh-cu2o", [["0", "#d4683c"], ["1", "#8f2f17"]]);
        /* Glasset (som b4-glas i org.js) */
        lin("kh-glas", [["0", "#c9d6e2", 0.8], ["0.2", "#ffffff", 0.6], ["0.65", "#eef3f7", 0.35], ["1", "#b8c7d4", 0.8]], true);
    };

    /* ----- Tekst ------------------------------------------------------------ */
    /* Bredden af en tekst med _{...} og ^{...} (bogens b4_bredde) */
    KH.bredde = function (s, fs) {
        var b = 0;
        String(s).split(/(_\{[^}]*\}|\^\{[^}]*\}|_[0-9]+|\^[0-9+−\-]+)/).forEach(function (del) {
            if (!del) return;
            var lille = /^[_^]/.test(del);
            var txt = lille ? del.replace(/^[_^]\{?/, "").replace(/\}$/, "") : del;
            var f = lille ? 0.68 * fs : fs;
            for (var i = 0; i < txt.length; i++) {
                var c = txt[i];
                b += f * (/[A-ZÆØÅ]/.test(c) ? 0.74 : (" ,.·-−()".indexOf(c) >= 0 ? 0.30 : 0.57));
            }
        });
        return b;
    };

    /* Tekst med bogens skrift. y er grundlinjen. */
    KH.t = function (g, x, y, s, fs, o) {
        o = o || {};
        var a = { "font-size": fs || 15, fill: o.farve || F.blaek, "text-anchor": o.anker || "middle" };
        if (o.fed) a["font-weight"] = 700;
        return SV.tekst(g, f1(x), f1(y), s, a);
    };

    function linje(g, x1, y1, x2, y2, farve, sw, streg) {
        return SV.el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: farve || F.daempet, "stroke-width": sw || 1.2,
            "stroke-linecap": "round", "stroke-dasharray": streg || null }, g);
    }
    KH.linje = linje;

    /* En blød glød bag det, der fremhaeves */
    KH.glod = function (g, x, y, rx, ry, farve, op) {
        return SV.el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(rx), ry: f1(ry), fill: farve || F.accent, opacity: op === undefined ? 0.3 : op, filter: "url(#kh-glod)" }, g);
    };

    /* En farvet boks bag en gruppe med lidt glans foroven (sf_b7k_boks) */
    var LYS = {};
    LYS[F.accent] = F.accentLys; LYS[F.sukker] = F.sukkerLys; LYS[F.protonKant] = F.posFyld; LYS[F.neg] = F.negFyld;
    KH.boks = function (g, x, y, b, h, farve) {
        SV.el("rect", { x: f1(x), y: f1(y), width: f1(b), height: f1(h), rx: 7, fill: LYS[farve] || F.accentLys, stroke: farve, "stroke-width": 1.4 }, g);
        SV.el("rect", { x: f1(x + 3), y: f1(y + 2), width: f1(b - 6), height: f1(h * 0.42), rx: 5, fill: "#ffffff", opacity: 0.55 }, g);
    };

    /* ----- Fischerprojektion ---------------------------------------------- */
    KH.GLUCOSE = ["CHO", ["h", "v", "h", "h"], "CH_{2}OH"];
    KH.GALACTOSE = ["CHO", ["h", "v", "v", "h"], "CH_{2}OH"];
    KH.FRUCTOSE = ["CH_{2}OH", ["=O", "v", "h", "h"], "CH_{2}OH"];
    KH.L_GLUCOSE = ["CHO", ["v", "h", "v", "v"], "CH_{2}OH"];

    /* Tegner en fischerprojektion med carbonatom 1 i (x0, y0) og kaeden
       nedad. stof: [top, midt, bund] (KH.GLUCOSE ...). o: a (afstand mellem
       raekkerne), w (de vandrette stregers halve laengde), fs, numre,
       bokse: [[raekke, farve]], farver: {raekke: farve}. Raekke 0 er den
       oeverste. Returnerer { kasse: [x1, y1, x2, y2], boks(k): rektanglet
       om raekke k, y(k) }. */
    KH.fischer = function (g, x0, y0, stof, o) {
        o = o || {};
        var a = o.a || 28, w = o.w || 21, fs = o.fs || 17, farver = o.farver || {};
        var top = stof[0], midt = stof[1], bund = stof[2], n = midt.length;
        var gg = SV.g(g, { transform: "translate(" + f1(x0) + " " + f1(y0) + ")" });
        var xs = [-w, w];
        function boksRekt(k) {
            var y = k * a, x1, x2, hb;
            if (k === 0 || k === n + 1 || midt[k - 1] === "=O") {
                var t = k === 0 ? top : (k === n + 1 ? bund : "C=O");
                var b = Math.max(KH.bredde(t, fs), 46);
                x1 = -0.37 * fs - 7; x2 = -0.37 * fs + b + 7; hb = 0.44 * a;
            } else {
                var m = midt[k - 1];
                var v = m === "h" ? "H" : "HO", hh = m === "h" ? "OH" : "H";
                x1 = -w - 11 - KH.bredde(v, fs); x2 = w + 11 + KH.bredde(hh, fs); hb = 0.52 * a;
            }
            return [x1, y - hb, x2 - x1, 2 * hb];
        }
        (o.bokse || []).forEach(function (bk) {
            var r = boksRekt(bk[0]);
            KH.boks(gg, r[0], r[1], r[2], r[3], bk[1]);
            xs.push(r[0], r[0] + r[2]);
        });
        /* Den lodrette kaede, afbrudt ved C=O */
        var stop = [0.58 * fs];
        midt.forEach(function (m, i) { if (m === "=O") stop.push((i + 1) * a - 0.58 * fs, (i + 1) * a + 0.58 * fs); });
        stop.push((n + 1) * a - 0.6 * fs);
        for (var i = 0; i < stop.length; i += 2) linje(gg, 0, stop[i], 0, stop[i + 1], F.blaek, 2.2);
        [[0, top], [n + 1, bund]].forEach(function (kt) {
            KH.t(gg, -0.37 * fs, kt[0] * a + 0.35 * fs, kt[1], fs, { anker: "start", farve: farver[kt[0]] || F.blaek, fed: true });
            xs.push(-0.37 * fs + KH.bredde(kt[1], fs));
        });
        midt.forEach(function (m, i) {
            var k = i + 1, y = k * a, f = farver[k] || F.blaek;
            if (m === "=O") {
                KH.t(gg, 0, y + 0.35 * fs, "C", fs, { farve: f, fed: true });
                [-3, 3].forEach(function (d) { linje(gg, 0.56 * fs, y + d, 0.56 * fs + 15, y + d, f, 2.1); });
                KH.t(gg, 0.56 * fs + 15 + 0.5 * fs, y + 0.35 * fs, "O", fs, { farve: f, fed: true });
                xs.push(0.56 * fs + 15 + fs);
            } else {
                linje(gg, -w, y, w, y, F.blaek, 2.2);
                var v = m === "h" ? "H" : "HO", hh = m === "h" ? "OH" : "H";
                KH.t(gg, -w - 4, y + 0.35 * fs, v, fs, { anker: "end", farve: m === "v" ? f : F.blaek, fed: true });
                KH.t(gg, w + 4, y + 0.35 * fs, hh, fs, { anker: "start", farve: m === "h" ? f : F.blaek, fed: true });
                xs.push(-w - 4 - KH.bredde(v, fs), w + 4 + KH.bredde(hh, fs));
            }
        });
        if (o.numre) {
            for (var k = 0; k < n + 2; k++) {
                var x, y;
                if (k === 0 || k === n + 1 || midt[k - 1] === "=O") { x = -0.37 * fs - 17; y = k * a + 5; }
                else { x = -8; y = k * a - 6; }
                KH.t(gg, x, y, String(k + 1), 13, { farve: F.daempet, fed: true });
                xs.push(x - 7);
            }
        }
        var x1 = Math.min.apply(null, xs), x2 = Math.max.apply(null, xs);
        return {
            g: gg,
            kasse: [x0 + x1, y0 - 0.7 * fs, x0 + x2, y0 + (n + 1) * a + 0.6 * fs],
            boks: function (k) { var r = boksRekt(k); return [x0 + r[0], y0 + r[1], r[2], r[3]]; },
            y: function (k) { return y0 + k * a; }
        };
    };

    /* Glucose med alle atomer tegnet, kaeden lodret, carbonatom 1 i (x0, y0)
       (sf_b7k_glucose_gitter). farve: carbonatomernes farve. */
    KH.gitter = function (g, x0, y0, o) {
        o = o || {};
        var a = o.a || 26, fs = o.fs || 17, cf = o.cfarve || F.blaek;
        var at = {}, bi = [];
        function A(c, r, s) { at[c + "," + r] = s; }
        A(0, 0, "C"); A(-1, 0, "H"); A(1, 0, "O");
        bi.push([[-1, 0], [0, 0], 1], [[0, 0], [1, 0], 2]);
        [[1, 1], [2, -1], [3, 1], [4, 1]].forEach(function (rs) {
            var r = rs[0], side = rs[1];
            A(0, r, "C"); A(side, r, "O"); A(2 * side, r, "H"); A(-side, r, "H");
            bi.push([[0, r - 1], [0, r], 1], [[0, r], [side, r], 1], [[side, r], [2 * side, r], 1], [[0, r], [-side, r], 1]);
        });
        A(0, 5, "C"); A(-1, 5, "H"); A(1, 5, "O"); A(2, 5, "H"); A(0, 6, "H");
        bi.push([[0, 4], [0, 5], 1], [[0, 5], [-1, 5], 1], [[0, 5], [1, 5], 1], [[1, 5], [2, 5], 1], [[0, 5], [0, 6], 1]);
        var gg = SV.g(g);
        var halv = 0.42 * fs;
        bi.forEach(function (b) {
            var p = [x0 + b[0][0] * a, y0 + b[0][1] * a], q = [x0 + b[1][0] * a, y0 + b[1][1] * a];
            var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l;
            var p1 = [p[0] + ux * halv, p[1] + uy * halv], q1 = [q[0] - ux * halv, q[1] - uy * halv];
            if (b[2] === 2) {
                [-3, 3].forEach(function (d) { linje(gg, p1[0] - uy * d, p1[1] + ux * d, q1[0] - uy * d, q1[1] + ux * d, F.blaek, 2); });
            } else linje(gg, p1[0], p1[1], q1[0], q1[1], F.blaek, 2);
        });
        Object.keys(at).forEach(function (k) {
            var c = k.split(",").map(Number), s = at[k];
            KH.t(gg, x0 + c[0] * a, y0 + c[1] * a + 0.36 * fs, s, fs, { farve: s === "C" ? cf : F.blaek, fed: true });
        });
        return { g: gg, kasse: [x0 - 2 * a - halv, y0 - halv, x0 + 2 * a + halv, y0 + 6 * a + halv] };
    };

    /* ----- Haworthformel --------------------------------------------------- */
    var PYR = [["4", -1.0, 0.0], ["5", -0.44, -1.0], ["O", 0.44, -1.0], ["1", 1.0, 0.0], ["2", 0.44, 1.0], ["3", -0.44, 1.0]];
    var FUR = [["5", -1.0, -0.12], ["O", 0.0, -1.0], ["2", 1.0, -0.12], ["3", 0.56, 1.0], ["4", -0.56, 1.0]];
    var VEND = { "OH": "HO", "CH_{2}OH": "HOCH_{2}" };

    /* Ringenes grupper: hvilken vej peger OH paa hvert carbonatom */
    KH.GLC_A = { op: { "5": "CH_{2}OH", "3": "OH" }, ned: { "1": "OH", "2": "OH", "4": "OH" } };
    KH.GLC_B = { op: { "5": "CH_{2}OH", "3": "OH", "1": "OH" }, ned: { "2": "OH", "4": "OH" } };
    KH.GAL_B = { op: { "5": "CH_{2}OH", "3": "OH", "1": "OH", "4": "OH" }, ned: { "2": "OH" } };
    KH.FRU_B = { slags: "fur", op: { "5": "CH_{2}OH", "3": "OH", "2": "OH" }, ned: { "2": "CH_{2}OH", "4": "OH" } };

    /* En kopi af en ringform uden grupperne paa de naevnte pladser: uden(KH.GLC_A, "1ned") */
    KH.uden = function (form) {
        var ny = { op: {}, ned: {} };
        Object.keys(form).forEach(function (k) { if (k !== "op" && k !== "ned") ny[k] = form[k]; });
        ["op", "ned"].forEach(function (r) { Object.keys(form[r] || {}).forEach(function (n) { ny[r][n] = form[r][n]; }); });
        for (var i = 1; i < arguments.length; i++) {
            var p = arguments[i];
            delete ny[/op$/.test(p) ? "op" : "ned"][p[0]];
        }
        return ny;
    };
    KH.med = function (form, ekstra) {
        var ny = KH.uden(form);
        Object.keys(ekstra).forEach(function (k) { ny[k] = ekstra[k]; });
        return ny;
    };

    /* Skriver en gruppe, saa det atom, bindingen gaar til, staar midt paa x.
       side "h": teksten loeber mod hoejre, "v": vendt mod venstre. */
    function gruppe(g, x, y, t, side, fs, farve) {
        if (/^[A-Z][a-z]?$/.test(t)) {
            KH.t(g, x, y + 0.35 * fs, t, fs, { farve: farve, fed: true });
            return [x - 0.42 * fs, x + 0.42 * fs];
        }
        if (side === "v") {
            t = VEND[t] || t;
            var hale = /(_\{[^}]*\})$/.exec(t);
            var slut = x + 0.37 * fs + (hale ? KH.bredde(hale[1], fs) : 0);
            KH.t(g, slut, y + 0.35 * fs, t, fs, { anker: "end", farve: farve, fed: true });
            return [slut - KH.bredde(t, fs), slut];
        }
        KH.t(g, x - 0.37 * fs, y + 0.35 * fs, t, fs, { anker: "start", farve: farve, fed: true });
        return [x - 0.37 * fs, x - 0.37 * fs + KH.bredde(t, fs)];
    }
    KH.gruppe = gruppe;

    /* Haworthformel med midten i (cx, cy). o: slags ("pyr" eller "fur"),
       op, ned ({nummer: gruppe}), vend ("lr" eller "fb"), a, h, fs, farver
       ({"1op": farve, "1": farve for nummeret}), numre, oFarve, flade.
       Returnerer { hj: {nummer: [x, y]}, kasse, gruppe(n, ned): midten af
       gruppen paa carbonatom n }. */
    KH.ring = function (g, cx, cy, o) {
        o = o || {};
        var slags = o.slags || "pyr";
        var op = {}, ned = {}, farver = {};
        Object.keys(o.op || {}).forEach(function (k) { op[k] = o.op[k]; });
        Object.keys(o.ned || {}).forEach(function (k) { ned[k] = o.ned[k]; });
        Object.keys(o.farver || {}).forEach(function (k) { farver[k] = o.farver[k]; });
        var sx = o.vend === "fb" ? -1 : 1, sy = o.vend === "lr" ? -1 : 1;
        if (o.vend) {
            var t = op; op = ned; ned = t;
            var nf = {};
            Object.keys(farver).forEach(function (k) {
                var r = k.slice(1);
                nf[r === "op" ? k[0] + "ned" : (r === "ned" ? k[0] + "op" : k)] = farver[k];
            });
            farver = nf;
        }
        var a = o.a || (slags === "fur" ? 50 : 46), h = o.h || (slags === "fur" ? 30 : 27), fs = o.fs || 15, s = o.s || 16;
        var farve = o.farve || F.blaek;
        var form = slags === "pyr" ? PYR : FUR;
        var hj = {}, rel = {};
        form.forEach(function (fm) { hj[fm[0]] = [cx + a * fm[1] * sx, cy + h * fm[2] * sy]; rel[fm[0]] = [fm[1] * sx, fm[2] * sy]; });
        var gg = SV.g(g);
        var xs = [cx - a, cx + a], ys = [cy - h, cy + h];
        if (o.flade !== false) {
            SV.el("polygon", { points: form.map(function (fm) { return f1(hj[fm[0]][0]) + "," + f1(hj[fm[0]][1]); }).join(" "), fill: "url(#kh-flade)" }, gg);
        }
        function tyk(n) { return 2.4 + 3.4 * (rel[n][1] + 1) / 2; }
        for (var k = 0; k < form.length; k++) {
            var n1 = form[k][0], n2 = form[(k + 1) % form.length][0];
            var x1 = hj[n1][0], y1 = hj[n1][1], x2 = hj[n2][0], y2 = hj[n2][1];
            var l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            var ux = (x2 - x1) / l, uy = (y2 - y1) / l;
            var k1 = n1 === "O" ? 0.6 * fs : 0, k2 = n2 === "O" ? 0.6 * fs : 0;
            var a1 = x1 + ux * k1, a2 = y1 + uy * k1, b1 = x2 - ux * k2, b2 = y2 - uy * k2;
            var t1 = tyk(n1) / 2, t2 = tyk(n2) / 2, nx = -uy, ny = ux;
            SV.el("polygon", { points: f1(a1 + nx * t1) + "," + f1(a2 + ny * t1) + " " + f1(b1 + nx * t2) + "," + f1(b2 + ny * t2) + " " +
                f1(b1 - nx * t2) + "," + f1(b2 - ny * t2) + " " + f1(a1 - nx * t1) + "," + f1(a2 - ny * t1),
                fill: farve, stroke: farve, "stroke-width": 0.6, "stroke-linejoin": "round" }, gg);
        }
        KH.t(gg, hj.O[0], hj.O[1] + 0.35 * fs, "O", fs, { farve: o.oFarve || farve, fed: true });
        var midter = {};
        [[-1, op], [1, ned]].forEach(function (rg) {
            var retning = rg[0], grupper = rg[1];
            Object.keys(grupper).forEach(function (n) {
                var x = hj[n][0], y = hj[n][1], fx = rel[n][0], fy = rel[n][1];
                var inde = (retning === -1 && fy > 0.5) || (retning === 1 && fy < -0.5);
                var lgd = inde ? Math.min(s, 0.55 * h) : s;
                var gf = farver[n + (retning === -1 ? "op" : "ned")] || farve;
                linje(gg, x, y, x, y + retning * lgd, gf, 2.2);
                var side = inde ? (fx < 0 ? "h" : "v") : (fx < -0.6 ? "v" : "h");
                var gy = y + retning * (lgd + 0.6 * fs);
                var v = gruppe(gg, x, gy, grupper[n], side, fs, gf);
                xs.push(v[0], v[1]);
                ys.push(y + retning * (lgd + 1.2 * fs), y);
                midter[n + (retning === -1 ? "op" : "ned")] = [side === "h" ? x + 0.38 * fs : x - 0.38 * fs, gy, v[0], v[1]];
            });
        });
        if (o.numre) {
            Object.keys(hj).forEach(function (n) {
                if (n === "O") return;
                var x = hj[n][0], y = hj[n][1], fx = rel[n][0], fy = rel[n][1];
                var dx = (fx > 0 ? 1 : -1) * (Math.abs(fy) < 0.5 ? 12 : 11);
                var dy = Math.abs(fy) < 0.5 ? 5 : (fy * 8 + 5);
                KH.t(gg, x + dx, y + dy, n, 13, { farve: farver[n] || F.daempet, fed: true });
                xs.push(x + dx - 7, x + dx + 7);
            });
        }
        return {
            g: gg, hj: hj,
            kasse: [Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys)],
            gruppe: function (noegle) { return midter[noegle]; }
        };
    };

    /* Glykosidbinding: et oxygenatom under (eller over) to hjoerner med en
       streg til hvert. Returnerer oxygenatomets midte. */
    KH.bro = function (g, p1, p2, ned, o) {
        o = o || {};
        var fs = o.fs || 15, dybde = o.dybde || 30, farve = o.farve || F.blaek;
        var mx = (p1[0] + p2[0]) / 2;
        var y = ned ? Math.max(p1[1], p2[1]) + dybde : Math.min(p1[1], p2[1]) - dybde;
        [p1, p2].forEach(function (p) {
            var l = Math.sqrt((mx - p[0]) * (mx - p[0]) + (y - p[1]) * (y - p[1]));
            var ux = (mx - p[0]) / l, uy = (y - p[1]) / l;
            linje(g, p[0], p[1], mx - ux * 0.62 * fs, y - uy * 0.62 * fs, farve, 2.2);
        });
        KH.t(g, mx, y + 0.35 * fs, "O", fs, { farve: o.oFarve || farve, fed: true });
        return [mx, y];
    };

    /* Flere ringe ved siden af hinanden med glykosidbindinger (sf_b7k_ringe).
       enheder: ringformer til KH.ring (med dx for et ekstra skridt), broer:
       [[fra, plads, til, plads, ned]]. o: afstand, fs, oFarve (broens O),
       glod (en blød glød bag broens O), uden ("bro" springer broerne over).
       Returnerer { hjs, ringe, oer: broernes O, kasse }. */
    KH.ringe = function (g, x0, y, enheder, broer, o) {
        o = o || {};
        var x = x0, ringe = [], af = o.afstand || 132;
        var gb = SV.g(g), gr = SV.g(g);
        enheder.forEach(function (e) {
            x += e.dx || 0;
            ringe.push(KH.ring(gr, x, y, e));
            x += af;
        });
        var oer = broer.map(function (b) {
            var p1 = ringe[b[0]].hj[b[1]], p2 = ringe[b[2]].hj[b[3]];
            var mx = (p1[0] + p2[0]) / 2, my = b[4] ? Math.max(p1[1], p2[1]) + 30 : Math.min(p1[1], p2[1]) - 30;
            if (o.glod) KH.glod(gb, mx, my, 13, 12, o.oFarve || F.accent, 0.32);
            if (o.uden !== "bro") KH.bro(gr, p1, p2, b[4], { fs: o.fs || 15, oFarve: o.oFarve });
            return [mx, my, p1, p2];
        });
        var ks = ringe.map(function (r) { return r.kasse; });
        return {
            hjs: ringe.map(function (r) { return r.hj; }), ringe: ringe, oer: oer,
            kasse: [Math.min.apply(null, ks.map(function (k) { return k[0]; })), Math.min.apply(null, ks.map(function (k) { return k[1]; })),
                Math.max.apply(null, ks.map(function (k) { return k[2]; })), Math.max.apply(null, ks.map(function (k) { return k[3]; }))]
        };
    };

    /* ----- Sukkerenheder som sekskanter ------------------------------------ */
    KH.hex = function (g, cx, cy, r, op, skygge) {
        var gg = SV.g(g, op !== undefined && op < 1 ? { opacity: f1(op) } : null);
        function pkt(rr, dx, dy) {
            var p = [];
            for (var v = 0; v < 360; v += 60) p.push(f1(cx + dx + rr * Math.cos(v * Math.PI / 180)) + "," + f1(cy + dy + rr * Math.sin(v * Math.PI / 180)));
            return p.join(" ");
        }
        if (skygge !== false) SV.el("ellipse", { cx: f1(cx + 1), cy: f1(cy + r * 0.95), rx: f1(r * 0.9), ry: f1(r * 0.26), fill: "#5b4a30", opacity: 0.22 }, gg);
        SV.el("polygon", { points: pkt(r, 0, 0), fill: "url(#kh-hex)", stroke: F.sukker, "stroke-width": f1(Math.max(1, r * 0.1)), "stroke-linejoin": "round" }, gg);
        SV.el("polygon", { points: pkt(r * 0.62, -r * 0.08, -r * 0.12), fill: "url(#kh-hexlys)" }, gg);
        return gg;
    };

    /* Glykosidbinding mellem to sekskanter: en streg med en lille, roed
       oxygenkugle i midten */
    KH.obro = function (g, x1, y1, x2, y2, rO, op) {
        var gg = SV.g(g, op !== undefined && op < 1 ? { opacity: f1(op) } : null);
        linje(gg, x1, y1, x2, y2, F.sukker, 2.4);
        SV.kugle(gg, (x1 + x2) / 2, (y1 + y2) / 2, rO || 4.2, "O");
        return gg;
    };

    function bland(a, b, t) {
        var ca = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
        var cb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
        return "#" + ca.map(function (x, i) { var v = Math.round(x * t + cb[i] * (1 - t)); return (v < 16 ? "0" : "") + v.toString(16); }).join("");
    }

    /* Amylose som en spiral af sekskanter set lidt skraat fra siden
       (sf_b7k_spiral): enhederne bagest er mindre og blegere */
    KH.spiral = function (g, x0, x1, cy, o) {
        o = o || {};
        var A = o.A || 24, prTur = o.prTur || 6, ture = o.ture || 2.6, r = o.r || 8.5, skraa = 0.62;
        var thSlut = 2 * Math.PI * ture, pitch = (x1 - x0 - 2 * A * skraa) / ture;
        function P(th) { return [x0 + A * skraa + pitch * th / (2 * Math.PI) + A * skraa * Math.cos(th), cy - A * Math.sin(th), Math.cos(th)]; }
        var ting = [];
        var m = Math.round(ture * 48), i;
        for (i = 0; i < m; i++) {
            (function (pa, pb) {
                var z = (pa[2] + pb[2]) / 2, f = 0.3 + 0.7 * (z + 1) / 2;
                ting.push([z - 0.05, function (gg) { linje(gg, pa[0], pa[1], pb[0], pb[1], bland(F.sukker, "#f1f4f7", f), 1.4 + 1.6 * (z + 1) / 2); }]);
            }(P(thSlut * i / m), P(thSlut * (i + 1) / m)));
        }
        var n = Math.round(prTur * ture);
        for (i = 0; i <= n; i++) {
            (function (p) {
                var s = 0.72 + 0.28 * (p[2] + 1) / 2;
                ting.push([p[2], function (gg) { KH.hex(gg, p[0], p[1], r * s, 0.45 + 0.55 * (p[2] + 1) / 2, false); }]);
            }(P(thSlut * i / n)));
        }
        ting.sort(function (a, b) { return a[0] - b[0]; });
        var gg = SV.g(g);
        ting.forEach(function (t) { t[1](gg); });
        return gg;
    };

    /* Et forgrenet trae af sekskanter (sf_b7k_trae). gren er
       [x, y, retning i grader, antal, [[plads, [retning, antal, under]], ...]].
       Returnerer enhedernes midter. */
    KH.trae = function (g, gren, r, af) {
        r = r || 7.6; af = af || 19;
        var led = SV.g(g), enhG = SV.g(g), enh = [];
        function tegn(x, y, v, antal, under) {
            var pkt = [];
            for (var i = 0; i < antal; i++) pkt.push([x + af * i * Math.cos(v * Math.PI / 180), y + af * i * Math.sin(v * Math.PI / 180)]);
            for (i = 0; i + 1 < pkt.length; i++) linje(led, pkt[i][0], pkt[i][1], pkt[i + 1][0], pkt[i + 1][1], F.sukker, 2.2);
            pkt.forEach(function (p) { enh.push(p); });
            (under || []).forEach(function (u) {
                var gp = pkt[u[0]], v2 = u[1][0];
                var nx = gp[0] + af * Math.cos(v2 * Math.PI / 180), ny = gp[1] + af * Math.sin(v2 * Math.PI / 180);
                linje(led, gp[0], gp[1], nx, ny, F.sukker, 2.2);
                tegn(nx, ny, v2, u[1][1], u[1][2]);
            });
        }
        tegn(gren[0], gren[1], gren[2], gren[3], gren[4]);
        enh.forEach(function (p) { KH.hex(enhG, p[0], p[1], r); });
        return enh;
    };

    /* Hydrogenbinding: en prikket roed streg (b4_hbinding) */
    KH.hbinding = function (g, x1, y1, x2, y2) {
        return linje(g, x1, y1, x2, y2, F.proton, 2.6, "1 6");
    };

    /* ----- De tre naeringsstoffer ------------------------------------------ */
    /* Tilfaeldige tal, der er ens hver gang (som random.Random(7) i bogen) */
    function frø(s) {
        var x = s || 1;
        return function () { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; };
    }
    function mellem(rnd, a, b) { return a + (b - a) * rnd(); }

    /* En skive rugbroed med skorpe og kerner (sf_b7k_rugbroed) */
    KH.broed = function (g, cx, cy, sk) {
        sk = sk || 1;
        var gg = SV.g(g, { transform: "translate(" + f1(cx) + " " + f1(cy) + ") scale(" + sk + ")" });
        var b = 74, h = 58, x0 = -b / 2, y0 = -h / 2, rnd = frø(7);
        SV.el("ellipse", { cx: 2, cy: f1(y0 + h + 4), rx: f1(b * 0.52), ry: 6, fill: "#4b3a28", opacity: 0.2, filter: "url(#kh-glod)" }, gg);
        function sti(i) {
            return "M " + f1(x0 + i + 6 - (i ? 2 : 0)) + "," + f1(y0 + h - i) + " Q " + f1(x0 + i) + "," + f1(y0 + h - i) + " " + f1(x0 + i) + "," + f1(y0 + h - i - (i ? 4 : 6)) +
                " L " + f1(x0 + i + 1) + "," + f1(y0 + 14 + (i ? 1 : 0)) + " Q " + f1(x0 + i + 2) + "," + f1(y0 + i - 2 + (i ? 1 : 0)) + " 0," + f1(y0 + i - 3 + (i ? 1 : 0)) +
                " Q " + f1(x0 + b - i - 2) + "," + f1(y0 + i - 2 + (i ? 1 : 0)) + " " + f1(x0 + b - i - 1) + "," + f1(y0 + 14 + (i ? 1 : 0)) +
                " L " + f1(x0 + b - i) + "," + f1(y0 + h - i - (i ? 4 : 6)) + " Q " + f1(x0 + b - i) + "," + f1(y0 + h - i) + " " + f1(x0 + b - i - 6 + (i ? 2 : 0)) + "," + f1(y0 + h - i) + " Z";
        }
        SV.el("path", { d: sti(0), fill: "url(#kh-skorpe)", stroke: "#2f1d10", "stroke-width": 1.2, "stroke-linejoin": "round" }, gg);
        SV.el("path", { d: sti(5), fill: "url(#kh-kerne)" }, gg);
        for (var i = 0; i < 34; i++) {
            var x = mellem(rnd, x0 + 10, x0 + b - 10), y = mellem(rnd, y0 + 9, y0 + h - 9), v = mellem(rnd, 0, 180), lys = rnd() < 0.6;
            SV.el("ellipse", { cx: f1(x), cy: f1(y), rx: f1(mellem(rnd, 1.6, 2.6)), ry: f1(mellem(rnd, 0.9, 1.4)), transform: "rotate(" + Math.round(v) + " " + f1(x) + " " + f1(y) + ")",
                fill: lys ? "#d9b77e" : "#3a2414", opacity: 0.9 }, gg);
        }
        SV.el("path", { d: "M " + f1(x0 + 12) + "," + f1(y0 + 9) + " Q -8," + f1(y0 + 3) + " 10," + f1(y0 + 4), fill: "none", stroke: "#ffffff", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.35 }, gg);
        return gg;
    };

    /* En draabe olie med glans (sf_b7k_draabe) */
    KH.draabe = function (g, cx, cy, s) {
        s = s || 1;
        var gg = SV.g(g);
        var d = "M " + f1(cx) + "," + f1(cy - 30 * s) + " C " + f1(cx + 5 * s) + "," + f1(cy - 17 * s) + " " + f1(cx + 22 * s) + "," + f1(cy - 2 * s) + " " +
            f1(cx + 22 * s) + "," + f1(cy + 12 * s) + " A " + f1(22 * s) + " " + f1(22 * s) + " 0 0 1 " + f1(cx - 22 * s) + "," + f1(cy + 12 * s) +
            " C " + f1(cx - 22 * s) + "," + f1(cy - 2 * s) + " " + f1(cx - 5 * s) + "," + f1(cy - 17 * s) + " " + f1(cx) + "," + f1(cy - 30 * s) + " Z";
        SV.el("ellipse", { cx: f1(cx + 2), cy: f1(cy + 36 * s), rx: f1(20 * s), ry: f1(4.5 * s), fill: "#6b5410", opacity: 0.22, filter: "url(#kh-glod)" }, gg);
        SV.el("path", { d: d, fill: "url(#kh-olie)", stroke: "#a8720a", "stroke-width": 1.3 }, gg);
        SV.el("ellipse", { cx: f1(cx - 8 * s), cy: f1(cy + 4 * s), rx: f1(4.5 * s), ry: f1(8 * s), transform: "rotate(20 " + f1(cx - 8 * s) + " " + f1(cy + 4 * s) + ")", fill: "#ffffff", opacity: 0.75 }, gg);
        SV.el("circle", { cx: f1(cx - 3 * s), cy: f1(cy - 9 * s), r: f1(2 * s), fill: "#ffffff", opacity: 0.8 }, gg);
        return gg;
    };

    /* Et aeg med lys og skygge (sf_b7k_aeg) */
    KH.aeg = function (g, cx, cy, s) {
        s = s || 1;
        var gg = SV.g(g);
        function P(dx, dy) { return f1(cx + dx * s) + "," + f1(cy + dy * s); }
        var d = "M " + P(0, -29) + " C " + P(16, -29) + " " + P(22, -2) + " " + P(22, 9) + " C " + P(22, 24) + " " + P(12, 31) + " " + P(0, 31) +
            " C " + P(-12, 31) + " " + P(-22, 24) + " " + P(-22, 9) + " C " + P(-22, -2) + " " + P(-16, -29) + " " + P(0, -29) + " Z";
        SV.el("ellipse", { cx: f1(cx + 3), cy: f1(cy + 32 * s), rx: f1(21 * s), ry: f1(4.5 * s), fill: "#5b4a3a", opacity: 0.25, filter: "url(#kh-glod)" }, gg);
        SV.el("path", { d: d, fill: "url(#kh-aeg)", stroke: "#b08d64", "stroke-width": 1.1 }, gg);
        SV.el("ellipse", { cx: f1(cx - 8 * s), cy: f1(cy - 10 * s), rx: f1(5 * s), ry: f1(9 * s), transform: "rotate(18 " + f1(cx - 8 * s) + " " + f1(cy - 10 * s) + ")", fill: "#ffffff", opacity: 0.7 }, gg);
        return gg;
    };

    /* Bjaelken med energien pr. gram (fuld bjaelke er 40 kJ) */
    KH.energi = function (g, cx, y, kj, b, groen) {
        b = b || 120;
        var bx = cx - b / 2;
        SV.el("rect", { x: f1(bx), y: f1(y), width: b, height: 10, rx: 5, fill: "#e2e9ed", stroke: "#c3cfd6", "stroke-width": 1 }, g);
        SV.el("rect", { x: f1(bx), y: f1(y), width: f1(b * kj / 40), height: 10, rx: 5, fill: groen ? "url(#kh-andel)" : "url(#kh-energi)", stroke: groen ? F.accent : "#c27406", "stroke-width": 1 }, g);
        SV.el("rect", { x: f1(bx + 3), y: f1(y + 1.5), width: f1(b * kj / 40 - 6), height: 3.2, rx: 1.6, fill: "#ffffff", opacity: 0.45 }, g);
    };

    /* ----- Reagensglas ------------------------------------------------------ */
    /* Et reagensglas med midten i cx fra top til bund (b bredt) i stil med
       ORG.reagensglas. o.fyld: vaeskens farve (fx "url(#kh-blaa)"),
       o.niveau: hoejden (0 til 1), o.korn: korn af kobber(I)oxid i hele
       vaesken (en positiv test er murstensroed i hele glasset, brugeren
       30. okt. 2026: "når jeg laver forsøget ser hele glasset helt
       murstensrødt ud"). */
    KH.glas = function (g, cx, top, bund, b, o) {
        o = o || {};
        var gg = SV.g(g), r = b / 2, xl = cx - r, xr = cx + r;
        var vy = bund - (bund - top - 10) * (o.niveau || 0.55);
        var vaeske = "M" + f1(xl + 1.5) + "," + f1(vy) + " L" + f1(xl + 1.5) + "," + f1(bund - r) + " A" + f1(r - 1.5) + "," + f1(r - 1.5) + " 0 0,0 " + f1(xr - 1.5) + "," + f1(bund - r) + " L" + f1(xr - 1.5) + "," + f1(vy) + " Z";
        SV.el("ellipse", { cx: f1(cx + 2), cy: f1(bund + 5), rx: f1(r + 6), ry: 4, fill: "#3b4a58", opacity: 0.16, filter: "url(#kh-glod)" }, gg);
        SV.el("path", { d: vaeske, fill: o.fyld || "url(#kh-klar)", "fill-opacity": 0.95 }, gg);
        SV.el("ellipse", { cx: f1(cx), cy: f1(vy), rx: f1(r - 1.5), ry: 2.4, fill: "#ffffff", opacity: 0.35 }, gg);
        if (o.korn) {
            var rnd = frø(o.fro || 11);
            for (var i = 0; i < 46; i++) {
                var x = mellem(rnd, xl + 4, xr - 4), y = mellem(rnd, vy + 4, bund - 4);
                SV.el("circle", { cx: f1(x), cy: f1(y), r: f1(mellem(rnd, 0.5, 1.2)), fill: rnd() < 0.45 ? "#e48a63" : "#5e1a0a", opacity: f1(mellem(rnd, 0.3, 0.6)) }, gg);
            }
        }
        var kontur = "M" + f1(xl) + "," + f1(top) + " L" + f1(xl) + "," + f1(bund - r) + " A" + f1(r) + "," + f1(r) + " 0 0,0 " + f1(xr) + "," + f1(bund - r) + " L" + f1(xr) + "," + f1(top);
        SV.el("path", { d: kontur, fill: "url(#kh-glas)", stroke: "#7d8f99", "stroke-width": 1.6 }, gg);
        SV.el("ellipse", { cx: f1(cx), cy: f1(top), rx: f1(r + 2), ry: 3, fill: "#eef3f7", stroke: "#7d8f99", "stroke-width": 1.4 }, gg);
        SV.el("line", { x1: f1(xl + r * 0.35), y1: f1(top + 10), x2: f1(xl + r * 0.35), y2: f1(bund - r - 4), stroke: "#ffffff", "stroke-width": 2.4, opacity: 0.7, "stroke-linecap": "round" }, gg);
        return gg;
    };

    /* En lille, graa pil (kortpil i bogen) og en ligevaegtspil */
    KH.pil = function (g, x1, y1, x2, y2, farve, sw) {
        var f = farve || F.daempet, gg = SV.g(g);
        var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy), ux = dx / l, uy = dy / l;
        linje(gg, x1, y1, x2 - ux * 8, y2 - uy * 8, f, sw || 2.2);
        SV.el("polygon", { points: f1(x2) + "," + f1(y2) + " " + f1(x2 - ux * 11 - uy * 5.5) + "," + f1(y2 - uy * 11 + ux * 5.5) + " " + f1(x2 - ux * 11 + uy * 5.5) + "," + f1(y2 - uy * 11 - ux * 5.5), fill: f }, gg);
        return gg;
    };
}());

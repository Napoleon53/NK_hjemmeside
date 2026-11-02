/* =====================================================================
   kurver.js - kapitel B1's egen tegnehjaelp

   Graferne, energiprofilerne, partiklerne A og B, termometeret og
   enzymet i samme stil som B-bogens figurer (vaerktoej/lav_figurer.py,
   "Graferne og energiprofilerne i B1 til B3 i ny stil", 22. okt. 2026):
   en bloed flade bag plotomraadet, kurver med en bloed skygge, punkter
   med lys, A groen og B orange.

   Ikke en del af den faelles motor (som org.js i sc4.9 og lab.js i
   sc7.6). Nederst ligger én udvidelse af motoren, som kun kapitel B1
   bruger: et gult felt langs en linje eller kurve (tangenten,
   energiprofilen med katalysator), se "Gule felter langs en linje".
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV = {};

    /* Bogens farver (lav_figurer.py) */
    KV.F = {
        blaek: "#14201f",
        daempet: "#556766",
        accent: "#0f766e",           /* A, serie A, kurverne */
        serieB: "#b45309",           /* B, serie B */
        net: "#d5e2e0",
        varm: "#d4462f",             /* energi, der afgives */
        kold: "#2f6fde"              /* energi, der optages */
    };
    var F = KV.F;

    /* ----- Farveforloeb: lagt i motorens faelles, usynlige defs --------- */
    var harDefs = false;
    function grad(d, id, stop, o) {
        o = o || {};
        var g = SV.el(o.lin ? "linearGradient" : "radialGradient", o.lin ? (o.x ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : { id: id, x1: 0, x2: 0, y1: 0, y2: 1 })
            : { id: id, cx: o.cx || "36%", cy: o.cy || "32%", r: o.r || "72%" }, d);
        stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, g); });
    }
    KV.defs = function () {
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        grad(d, "kv-flade", [["0", "#fbfdfd"], ["1", "#ebf3f2"]], { lin: true });
        grad(d, "kv-bakke", [["0", "#0f766e", 0.13], ["1", "#0f766e", 0.02]], { lin: true });
        grad(d, "kv-bakke-graa", [["0", "#6b7780", 0.16], ["1", "#6b7780", 0.03]], { lin: true });
        grad(d, "kv-a", [["0", "#f2fbf9"], ["0.4", "#b3e2d9"], ["0.85", "#5aac9f"], ["1", "#3a8b7f"]]);
        grad(d, "kv-b", [["0", "#fff6ec"], ["0.4", "#f7d2a8"], ["0.85", "#e29a57"], ["1", "#c27833"]]);
        grad(d, "kv-glimt", [["0", "#fffef6"], ["0.28", "#fff1b0", 0.95], ["0.6", "#ffd45e", 0.45], ["1", "#ffbf2e", 0]], { cx: "50%", cy: "50%", r: "50%" });
        grad(d, "kv-punkt-a", [["0", "#c6f0e9"], ["0.55", "#17897f"], ["1", "#0a5650"]], { r: "78%", cy: "30%" });
        grad(d, "kv-punkt-b", [["0", "#ffe0bf"], ["0.55", "#d9781f"], ["1", "#8f4307"]], { r: "78%", cy: "30%" });
        grad(d, "kv-kort", [["0", "#fbfdfe"], ["1", "#eaf1f6"]], { lin: true });
        grad(d, "kv-vindue", [["0", "#f7fbfd"], ["1", "#e2edf3"]], { lin: true });
        grad(d, "kv-enzym", [["0", "#effaf7"], ["0.45", "#b5e2d9"], ["1", "#58a99d"]], { cx: "36%", cy: "30%", r: "80%" });
        grad(d, "kv-enzym-vild", [["0", "#f6fbfa"], ["0.5", "#cfe6e1"], ["1", "#8fbab3"]], { cx: "36%", cy: "30%", r: "80%" });
        grad(d, "kv-sa", [["0", "#fff4e8"], ["0.45", "#f8c99a"], ["1", "#dc8737"]], { r: "75%", cy: "30%" });
        grad(d, "kv-sb", [["0", "#fbf3ff"], ["0.45", "#d6bdf0"], ["1", "#8f5fc4"]], { r: "75%", cy: "30%" });
        grad(d, "kv-inh", [["0", "#f3f4f6"], ["0.45", "#a9b1bb"], ["1", "#4f5a66"]], { r: "75%", cy: "30%" });
        grad(d, "kv-glas", [["0", "#ffffff"], ["1", "#e3edf3"]], { lin: true, x: true });
        grad(d, "kv-roed", [["0", "#f08a74"], ["1", "#c53a24"]], { lin: true, x: true });
        grad(d, "kv-blaa", [["0", "#7fa7f2"], ["1", "#2558c4"]], { lin: true, x: true });
        grad(d, "kv-soejle", [["0", "#11786f"], ["0.35", "#1a9185"], ["1", "#0c6159"]], { lin: true, x: true });
        var f1 = SV.el("filter", { id: "kv-blur", filterUnits: "userSpaceOnUse", x: -200, y: -200, width: 2400, height: 1600 }, d);
        SV.el("feGaussianBlur", { stdDeviation: 1.7 }, f1);
        var f2 = SV.el("filter", { id: "kv-blur-stor", filterUnits: "userSpaceOnUse", x: -200, y: -200, width: 2400, height: 1600 }, d);
        SV.el("feGaussianBlur", { stdDeviation: 4 }, f2);
    };

    /* Unikke id'er (hver del tegnes to gange: graa og faerdig) */
    var nr = 0;
    KV.id = function (p) { nr += 1; return "kv-" + p + nr; };

    function polar(x, y, l, grader) {
        var v = grader * Math.PI / 180;
        return [x + l * Math.cos(v), y + l * Math.sin(v)];
    }
    KV.polar = polar;

    function f1(v) { return (Math.round(v * 10) / 10).toString(); }
    function pkt(liste) { return liste.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" "); }
    KV.pkt = pkt;

    /* ----- Tekst og streger ----------------------------------------------- */

    /* Tekst; o.halo giver en kant i fladens farve, saa teksten kan laeses
       oven paa nettet eller en kurve */
    KV.tekst = function (g, x, y, s, o) {
        o = o || {};
        var a = { "font-size": o.fs || 14, fill: o.farve || F.blaek, "text-anchor": o.anker || "middle" };
        if (o.fed) a["font-weight"] = 700;
        if (o.halo) { a.stroke = o.halo === true ? "#ffffff" : o.halo; a["stroke-width"] = o.hb || 4.2; a["stroke-linejoin"] = "round"; a["paint-order"] = "stroke"; }
        if (o.transform) a.transform = o.transform;
        if (o.stil) a["font-style"] = o.stil;
        return SV.tekst(g, x, y, s, a);
    };

    KV.linje = function (g, x1, y1, x2, y2, farve, sw, streg) {
        return SV.el("line", { x1: x1, y1: y1, x2: x2, y2: y2, stroke: farve || F.daempet, "stroke-width": sw || 1.3,
            "stroke-dasharray": streg || null, "stroke-linecap": streg ? null : "round" }, g);
    };

    /* En pilespids med svungne modhager i (x, y) i retningen v (radianer) */
    function spids(g, x, y, v, farve, hoved) {
        var ux = Math.cos(v), uy = Math.sin(v), nx = -uy, ny = ux, b = hoved * 0.44;
        var bx = x - hoved * ux, by = y - hoved * uy, rx = x - hoved * 0.7 * ux, ry = y - hoved * 0.7 * uy;
        SV.el("path", { d: "M" + f1(x) + "," + f1(y) + " L" + f1(bx + nx * b) + "," + f1(by + ny * b) + " L" + f1(rx) + "," + f1(ry) +
            " L" + f1(bx - nx * b) + "," + f1(by - ny * b) + " Z", fill: farve, stroke: farve, "stroke-width": 0.8, "stroke-linejoin": "round" }, g);
        return [rx + ux * 0.6, ry + uy * 0.6];
    }

    KV.pil = function (g, x1, y1, x2, y2, farve, sw, hoved) {
        var gg = SV.g(g);
        farve = farve || F.blaek;
        var r = spids(gg, x2, y2, Math.atan2(y2 - y1, x2 - x1), farve, hoved || 11);
        KV.linje(gg, x1, y1, r[0], r[1], farve, sw || 2);
        return gg;
    };

    /* Lodret dobbeltpil fra y1 til y2 */
    KV.dobbeltpil = function (g, x, y1, y2, farve, sw, hoved) {
        var gg = SV.g(g);
        var a = spids(gg, x, y1, Math.atan2(y1 - y2, 0), farve, hoved || 11);
        var b = spids(gg, x, y2, Math.atan2(y2 - y1, 0), farve, hoved || 11);
        KV.linje(gg, x, a[1], x, b[1], farve, sw || 2);
        return gg;
    };

    /* ----- Grafer --------------------------------------------------------- */

    /* Den bloede flade bag plotomraadet: afrundet foroven */
    KV.flade = function (g, x0, y0, x1, y1) {
        var r = 7;
        return SV.el("path", { d: "M" + x0 + "," + y1 + " V" + (y0 + r) + " Q" + x0 + "," + y0 + " " + (x0 + r) + "," + y0 +
            " H" + (x1 - r) + " Q" + x1 + "," + y0 + " " + x1 + "," + (y0 + r) + " V" + y1 + " Z", fill: "url(#kv-flade)" }, g);
    };

    /* Akser og net som bogens gr_diagram(). Giver { X, Y } */
    KV.diagram = function (g, o) {
        var X = function (v) { return o.xa + (o.xb - o.xa) * v / o.xmax; };
        var Y = function (v) { return o.yb - (o.yb - o.ya) * v / o.ymax; };
        var luft = 8, n, v;
        KV.flade(g, o.xa, o.ya - luft, o.xb + luft, o.yb);
        for (n = 1; n * o.ytrin <= o.ymax + 1e-9; n++) KV.linje(g, o.xa, Y(n * o.ytrin), o.xb + luft, Y(n * o.ytrin), F.net, 1);
        KV.linje(g, o.xa, o.yb, o.xb + luft, o.yb, F.daempet, 1.3);
        KV.linje(g, o.xa, o.ya - luft, o.xa, o.yb, F.daempet, 1.3);
        var fs = o.fs || 13;
        for (n = 0; n * o.ytrin <= o.ymax + 1e-9; n++) {
            v = n * o.ytrin;
            KV.linje(g, o.xa - 5, Y(v), o.xa, Y(v), F.daempet, 1.2);
            KV.tekst(g, o.xa - 10, Y(v) + 4.5, v.toFixed(o.ydec === undefined ? 1 : o.ydec).replace(".", ","), { fs: fs, anker: "end", farve: F.daempet });
        }
        for (n = 0; n * o.xtrin <= o.xmax + 1e-9; n++) {
            v = n * o.xtrin;
            KV.linje(g, X(v), o.yb, X(v), o.yb + 5, F.daempet, 1.2);
            KV.tekst(g, X(v), o.yb + 21, v.toFixed(o.xdec || 0).replace(".", ","), { fs: fs, farve: F.daempet });
        }
        if (o.xtitel) KV.tekst(g, (o.xa + o.xb) / 2, o.yb + 44, o.xtitel, { fs: 13.5, farve: F.daempet });
        if (o.ytitel) {
            var yx = o.xa - (o.yafst || 48), ym = (o.ya + o.yb) / 2;
            KV.tekst(g, yx, ym, o.ytitel, { fs: 13.5, farve: F.daempet, transform: "rotate(-90 " + yx + " " + ym + ")" });
        }
        return { X: X, Y: Y };
    };

    /* En kurve med en bloed skygge under sig. Giver selve stregen */
    KV.kurve = function (g, punkter, farve, sw, o) {
        o = o || {};
        sw = sw || 2.6;
        var p = pkt(punkter);
        if (o.skygge !== false) {
            SV.el("polyline", { points: p, fill: "none", stroke: o.moerk || "#0b3d39", "stroke-opacity": 0.22, "stroke-width": sw + 2.2,
                "stroke-linejoin": "round", "stroke-linecap": "round", filter: "url(#kv-blur)", transform: "translate(0 2.4)",
                "stroke-dasharray": o.streg || null }, g);
        }
        return SV.el("polyline", { points: p, fill: "none", stroke: farve || F.accent, "stroke-width": sw, "stroke-linejoin": "round",
            "stroke-linecap": "round", "stroke-dasharray": o.streg || null }, g);
    };

    /* Et punkt med lys, en hvid ring og en bloed skygge ("a" groen, "b" orange) */
    KV.punkt = function (g, x, y, slags, r) {
        r = r || 5.4;
        var gg = SV.g(g);
        SV.el("circle", { cx: x + 0.6, cy: y + 1.8, r: r + 1.6, fill: "#1c3533", opacity: 0.28, filter: "url(#kv-blur)" }, gg);
        SV.el("circle", { cx: x, cy: y, r: r + 2, fill: "#ffffff" }, gg);
        SV.el("circle", { cx: x, cy: y, r: r, fill: "url(#kv-punkt-" + (slags || "a") + ")", stroke: slags === "b" ? "#7c3a06" : "#0b524c", "stroke-width": 0.9 }, gg);
        return gg;
    };

    /* ----- Kort ----------------------------------------------------------- */

    /* Et kort med bloed skygge og lyst farveforloeb som bogens sf_b1_kort() */
    KV.kort = function (g, x, y, b, h, o) {
        o = o || {};
        var gg = SV.g(g);
        SV.el("rect", { x: x + 2, y: y + 5, width: b, height: h, rx: 16, fill: "#5b6b78", opacity: 0.16, filter: "url(#kv-blur-stor)" }, gg);
        SV.el("rect", { x: x, y: y, width: b, height: h, rx: 16, fill: o.fyld || "url(#kv-kort)", stroke: o.kant || "#c9d6e0", "stroke-width": 1.1 }, gg);
        return gg;
    };

    /* ----- Partiklerne A og B ------------------------------------------- */
    var AB = { A: ["kv-a", F.accent], B: ["kv-b", F.serieB] };

    KV.partikel = function (g, x, y, bogstav, r) {
        r = r || 11;
        var gg = SV.g(g), fs = Math.round(r * 1.05 * 10) / 10;
        SV.el("circle", { cx: x, cy: y, r: r, fill: "url(#" + AB[bogstav][0] + ")", stroke: AB[bogstav][1], "stroke-width": 0.9, "stroke-opacity": 0.65 }, gg);
        KV.tekst(gg, x, y + fs * 0.36, bogstav, { fs: fs, fed: true });
        return gg;
    };

    /* Fartstriber bag en kugle, der bevaeger sig i retningen v (grader) */
    KV.fart = function (g, x, y, v, r, farve, laengde, op) {
        laengde = laengde || 12;
        op = op || 0.6;
        [0, -0.5, 0.5].forEach(function (sk) {
            var l = sk === 0 ? laengde : laengde * 0.7, o = sk === 0 ? op : op * 0.7;
            var p = polar(x, y, sk * r, v + 90), a = Math.sqrt(Math.max(r * r - (sk * r) * (sk * r), 0)) + 3;
            var p1 = polar(p[0], p[1], a, v + 180), p2 = polar(p[0], p[1], a + l, v + 180);
            SV.el("line", { x1: f1(p1[0]), y1: f1(p1[1]), x2: f1(p2[0]), y2: f1(p2[1]), stroke: farve || "#7d8f9a", "stroke-width": 1.5,
                "stroke-linecap": "round", opacity: o.toFixed(2) }, g);
        });
    };

    /* Et sammenstoed som et bloedt glimt: en gul glorie med otte straaler */
    KV.glimt = function (g, x, y, r) {
        var gg = SV.g(g);
        SV.el("circle", { cx: x, cy: y, r: r, fill: "url(#kv-glimt)" }, gg);
        for (var k = 0; k < 8; k++) {
            var v = k * 45 + 22.5, l = r * (k % 2 === 0 ? 1.0 : 0.72);
            var p0 = polar(x, y, r * 0.4, v), p1 = polar(x, y, r * 0.4 + l, v);
            var s = polar(p0[0], p0[1], 1.3, v + 90), t = polar(p0[0], p0[1], 1.3, v - 90);
            SV.el("path", { d: "M" + f1(s[0]) + "," + f1(s[1]) + " L" + f1(p1[0]) + "," + f1(p1[1]) + " L" + f1(t[0]) + "," + f1(t[1]) + " Z", fill: "#f3ad1c", opacity: 0.5 }, gg);
        }
        return gg;
    };

    /* A og B, der stoeder sammen i (x, y); v er retningen fra A mod B */
    KV.stoed = function (g, x, y, v, r) {
        r = r || 11;
        var gg = SV.g(g);
        var a = polar(x, y, r * 0.97, v + 180), b = polar(x, y, r * 0.97, v);
        KV.glimt(gg, x, y, r * 2.1);
        KV.fart(gg, a[0], a[1], v, r, F.accent, 10, 0.45);
        KV.fart(gg, b[0], b[1], v + 180, r, F.serieB, 10, 0.45);
        KV.partikel(gg, a[0], a[1], "A", r);
        KV.partikel(gg, b[0], b[1], "B", r);
        return gg;
    };

    /* En binding som en graa pind med lys langs midten; stiplet: ved at
       blive brudt eller dannet */
    KV.pind = function (g, x1, y1, x2, y2, stiplet, sw) {
        if (stiplet) return KV.linje(g, x1, y1, x2, y2, "#6f7f86", 2.4, "3 3.2");
        sw = sw || 6;
        KV.linje(g, x1, y1, x2, y2, "#7d8b91", sw);
        return KV.linje(g, x1, y1, x2, y2, "#c9d3d7", sw * 0.45);
    };

    /* Et molekyle af to atomer (a og b er "A" eller "B") med midten i (x, y) */
    KV.molekyle = function (g, x, y, a, b, lodret, d, r) {
        d = d || 27; r = r || 10;
        var gg = SV.g(g);
        var p1 = lodret ? [x, y - d / 2] : [x - d / 2, y], p2 = lodret ? [x, y + d / 2] : [x + d / 2, y];
        KV.pind(gg, p1[0], p1[1], p2[0], p2[1]);
        KV.partikel(gg, p1[0], p1[1], a, r);
        KV.partikel(gg, p2[0], p2[1], b, r);
        return gg;
    };

    /* Det aktiverede kompleks: A₂ og B₂ i et kvadrat med fire stiplede bindinger */
    KV.kompleks = function (g, x, y, s, r) {
        s = s || 27; r = r || 10;
        var gg = SV.g(g);
        var a1 = [x - s / 2, y - s / 2], a2 = [x - s / 2, y + s / 2], b1 = [x + s / 2, y - s / 2], b2 = [x + s / 2, y + s / 2];
        [[a1, a2], [b1, b2], [a1, b1], [a2, b2]].forEach(function (p) { KV.pind(gg, p[0][0], p[0][1], p[1][0], p[1][1], true); });
        KV.partikel(gg, a1[0], a1[1], "A", r); KV.partikel(gg, a2[0], a2[1], "A", r);
        KV.partikel(gg, b1[0], b1[1], "B", r); KV.partikel(gg, b2[0], b2[1], "B", r);
        return gg;
    };

    function modelSkygge(g, x, y, rx) {
        SV.el("ellipse", { cx: x, cy: y, rx: rx, ry: 2.8, fill: "#1c3533", opacity: 0.22, filter: "url(#kv-blur)" }, g);
    }

    /* A₂ og B₂ side om side paa et niveau (bund er niveauets y) */
    KV.reaktanter = function (g, x, bund, r, d) {
        r = r || 10; d = d || 27;
        var gg = SV.g(g), b = bund - 3;
        modelSkygge(gg, x, b + 1, 30);
        KV.molekyle(gg, x - 14, b - r - d / 2, "A", "A", true, d, r);
        KV.molekyle(gg, x + 14, b - r - d / 2, "B", "B", true, d, r);
        return gg;
    };

    /* To AB over hinanden paa et niveau */
    KV.produkter = function (g, x, bund, r, d) {
        r = r || 10; d = d || 27;
        var gg = SV.g(g), b = bund - 3;
        modelSkygge(gg, x, b + 1, 28);
        KV.molekyle(gg, x, b - r, "A", "B", false, d, r);
        KV.molekyle(gg, x, b - 3 * r - 6, "A", "B", false, d, r);
        return gg;
    };

    /* ----- Energiprofiler ------------------------------------------------- */

    /* Bogens profil_sti(): vandret ved reaktanterne, op over toppen og ned */
    function profilData(x0, x1, yr, yt, yp) {
        var w = x1 - x0, xm = (x0 + x1) / 2, f = 0.11 * w, c1 = 0.24 * w, c2 = 0.11 * w;
        return { x0: x0, x1: x1, f: f, b1: [[x0 + f, yr], [x0 + c1, yr], [xm - c2, yt], [xm, yt]], b2: [[xm, yt], [xm + c2, yt], [x1 - c1, yp], [x1 - f, yp]], yr: yr, yp: yp };
    }
    KV.profilSti = function (x0, x1, yr, yt, yp) {
        var p = profilData(x0, x1, yr, yt, yp);
        function c(b) { return " C" + b.slice(1).map(function (q) { return f1(q[0]) + "," + f1(q[1]); }).join(" "); }
        return "M" + x0 + "," + yr + " H" + f1(x0 + p.f) + c(p.b1) + c(p.b2) + " H" + x1;
    };
    /* Punkter paa profilen (til et gult felt langs kurven) */
    KV.profilPunkter = function (x0, x1, yr, yt, yp, n) {
        var p = profilData(x0, x1, yr, yt, yp), ud = [[x0, yr]];
        n = n || 16;
        function bez(b, t) {
            var u = 1 - t;
            return [u * u * u * b[0][0] + 3 * u * u * t * b[1][0] + 3 * u * t * t * b[2][0] + t * t * t * b[3][0],
                    u * u * u * b[0][1] + 3 * u * u * t * b[1][1] + 3 * u * t * t * b[2][1] + t * t * t * b[3][1]];
        }
        for (var i = 0; i <= n; i++) ud.push(bez(p.b1, i / n));
        for (i = 1; i <= n; i++) ud.push(bez(p.b2, i / n));
        ud.push([x1, yp]);
        return ud;
    };

    /* En energiprofil med bloed skygge og evt. en bakke under (bund er
       den vandrette akses y). Giver selve stregen */
    KV.profil = function (g, x0, x1, yr, yt, yp, o) {
        o = o || {};
        var d = KV.profilSti(x0, x1, yr, yt, yp), sw = o.sw || 2.8;
        if (o.bund !== undefined) SV.el("path", { d: d + " V" + o.bund + " H" + x0 + " Z", fill: o.bakke || "url(#kv-bakke)" }, g);
        SV.el("path", { d: d, fill: "none", stroke: o.moerk || "#000000", "stroke-opacity": 0.22, "stroke-width": sw + 2.2, "stroke-linecap": "round",
            filter: "url(#kv-blur)", transform: "translate(0 2.4)" }, g);
        return SV.el("path", { d: d, fill: "none", stroke: o.farve || F.blaek, "stroke-width": sw, "stroke-linecap": "round" }, g);
    };

    /* Akserne til en energiprofil */
    KV.energiakser = function (g, xa, xb, ya, yb, flade) {
        if (flade !== false) KV.flade(g, xa, ya + 10, xb - 12, yb);
        KV.pil(g, xa, yb, xa, ya, F.daempet, 1.5, 11);
        KV.pil(g, xa, yb, xb, yb, F.daempet, 1.5, 11);
        KV.tekst(g, xa - 8, ya + 4, "energi", { fs: 13.5, anker: "end", farve: F.daempet });
        KV.tekst(g, xb, yb + 20, "reaktionens forløb", { fs: 13.5, anker: "end", farve: F.daempet });
    };

    /* ----- Termometer og varme -------------------------------------------- */

    /* Et termometer i glas: roer fra top til en kugle forneden, vaesken staar
       i niveau (0 til 1) af roeret. lys er "roed" eller "blaa" */
    KV.termometer = function (g, x, top, h, niveau, farve, lys) {
        var gg = SV.g(g), rb = 9, rk = 13, bund = top + h;
        var vy = bund - rk - (h - rk - 12) * niveau;
        SV.el("ellipse", { cx: x, cy: bund + rk + 2, rx: rk * 1.2, ry: 3.5, fill: "rgba(40,55,65,0.18)" }, gg);
        SV.el("path", { d: "M" + (x - rb / 2) + "," + (top + rb / 2) + " A" + rb / 2 + " " + rb / 2 + " 0 0 1 " + (x + rb / 2) + "," + (top + rb / 2) +
            " V" + f1(bund - rk * 0.7) + " A" + rk + " " + rk + " 0 1 1 " + (x - rb / 2) + "," + f1(bund - rk * 0.7) + " Z",
            fill: "url(#kv-glas)", stroke: "#7d93a3", "stroke-width": 1.4 }, gg);
        SV.el("path", { d: "M" + (x - 2.4) + "," + f1(vy) + " V" + f1(bund - rk * 0.5) + " A" + (rk - 3.4) + " " + (rk - 3.4) + " 0 1 0 " + (x + 2.4) + "," + f1(bund - rk * 0.5) +
            " V" + f1(vy) + " Z", fill: "url(#kv-" + lys + ")", stroke: farve, "stroke-width": 0.6 }, gg);
        for (var k = 1; k <= 5; k++) {
            var y = bund - rk - (h - rk - 12) * k / 6;
            KV.linje(gg, x + rb / 2 + 1, y, x + rb / 2 + (k % 2 === 0 ? 6 : 4), y, "#7d93a3", 1.1);
        }
        SV.el("path", { d: "M" + (x - 2.2) + "," + (top + 8) + " V" + (bund - rk - 4), stroke: "#ffffff", "stroke-width": 1.4, "stroke-linecap": "round", opacity: 0.8 }, gg);
        return gg;
    };

    /* En boelget pil: varme, der gaar ud eller ind */
    KV.boelge = function (g, x1, y1, x2, y2, farve) {
        var gg = SV.g(g), l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ux = (x2 - x1) / l, uy = (y2 - y1) / l, nx = -uy, ny = ux, l2 = l - 8, p = [];
        for (var k = 0; k <= 40; k++) {
            var t = k / 40, s = Math.sin(t * 2.5 * 2 * Math.PI) * 3.2 * Math.min(1, (1 - t) * 4);
            p.push([x1 + ux * l2 * t + nx * s, y1 + uy * l2 * t + ny * s]);
        }
        SV.el("polyline", { points: pkt(p), fill: "none", stroke: farve, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
        spids(gg, x2, y2, Math.atan2(y2 - y1, x2 - x1), farve, 9);
        return gg;
    };

    /* ----- Enzymet --------------------------------------------------------- */
    var SR = 13, SD = 30;                    /* substratets kugler og afstanden mellem dem */
    KV.SR = SR;
    KV.SD = SD;

    function enzymRand(cx, cy, R, fro) {
        fro = fro || 0;
        return function (v) {
            return R * (1 + 0.03 * Math.sin(3 * v + 0.6 + fro) + 0.022 * Math.sin(5 * v + 2.1 + fro * 0.7) + 0.014 * Math.sin(2 * v + 2.1));
        };
    }

    /* Midten af enzymets lomme (der hvor substratet sidder) */
    KV.lomme = function (cx, cy, R, fro) {
        return [cx, cy - enzymRand(cx, cy, R || 50, fro)(-Math.PI / 2) + 11];
    };

    /* Enzymet som en bloed klump med en foldet kaede svagt indeni og det
       aktive center foroven: en lomme med to runde fordybninger, der har
       praecis substratets form (bogens sf_b1_enzymform). Giver { g, lomme } */
    KV.enzym = function (g, cx, cy, R, o) {
        o = o || {};
        R = R || 50;
        var gg = SV.g(g), r = enzymRand(cx, cy, R, o.fro), p = [];
        for (var i = 0; i < 200; i++) { var v = 2 * Math.PI * i / 200; p.push([cx + r(v) * Math.cos(v), cy + r(v) * Math.sin(v)]); }
        var blob = "M" + pkt(p).replace(/ /g, " L") + " Z";
        var lx = cx, ly = cy - r(-Math.PI / 2) + 11, rl = SR + 2.2;
        var huller = [[lx - SD / 2, ly], [lx + SD / 2, ly]];
        var m = KV.id("maske"), c = KV.id("klip");
        var defs = SV.el("defs", {}, gg);
        var mk = SV.el("mask", { id: m, maskUnits: "userSpaceOnUse", x: cx - 2 * R, y: cy - 2 * R, width: 4 * R, height: 4 * R }, defs);
        SV.el("rect", { x: cx - 2 * R, y: cy - 2 * R, width: 4 * R, height: 4 * R, fill: "#ffffff" }, mk);
        huller.forEach(function (h) { SV.el("circle", { cx: h[0], cy: h[1], r: rl, fill: "#000000" }, mk); });
        SV.el("rect", { x: lx - SD / 2, y: ly - rl, width: SD, height: rl * 1.55, fill: "#000000" }, mk);
        var kp = SV.el("clipPath", { id: c }, defs);
        SV.el("path", { d: blob }, kp);
        SV.el("ellipse", { cx: cx, cy: cy + R + 3, rx: R * 0.95, ry: 5.5, fill: "rgba(40,55,65,0.16)" }, gg);
        var krop = SV.g(gg, { mask: "url(#" + m + ")" });
        SV.el("path", { d: blob, fill: o.fyld || "url(#kv-enzym)", stroke: F.accent, "stroke-width": 2, "stroke-linejoin": "round" }, krop);
        /* Den foldede kaede, der anes inde i enzymet */
        var k = [[-0.52, 0.30], [-0.30, 0.62], [0.05, 0.42], [-0.18, 0.12], [-0.50, -0.05], [-0.30, -0.36], [0.02, -0.18],
                 [0.30, -0.42], [0.55, -0.12], [0.30, 0.10], [0.55, 0.38], [0.28, 0.64]].map(function (q) { return [cx + R * q[0], cy + R * q[1]]; });
        var d = "M" + f1(k[0][0]) + "," + f1(k[0][1]);
        for (i = 0; i < k.length - 1; i++) {
            var p0 = k[Math.max(i - 1, 0)], p1 = k[i], p2 = k[i + 1], p3 = k[Math.min(i + 2, k.length - 1)];
            d += " C" + f1(p1[0] + (p2[0] - p0[0]) / 6) + "," + f1(p1[1] + (p2[1] - p0[1]) / 6) + " " +
                f1(p2[0] - (p3[0] - p1[0]) / 6) + "," + f1(p2[1] - (p3[1] - p1[1]) / 6) + " " + f1(p2[0]) + "," + f1(p2[1]);
        }
        SV.el("path", { d: d, fill: "none", stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.45 }, krop);
        SV.el("path", { d: d, fill: "none", stroke: "#3f9488", "stroke-width": 1.4, "stroke-linecap": "round", opacity: 0.4 }, krop);
        var g1 = polar(cx, cy, R * 0.8, 200), g2 = polar(cx, cy, R * 0.8, 236);
        SV.el("path", { d: "M" + f1(g1[0]) + "," + f1(g1[1]) + " A" + R * 0.8 + " " + R * 0.8 + " 0 0 1 " + f1(g2[0]) + "," + f1(g2[1]), fill: "none",
            stroke: "#ffffff", "stroke-width": 3.5, "stroke-linecap": "round", opacity: 0.75 }, krop);
        /* Lommens kant */
        var a = huller[0], b = huller[1], vv = Math.asin(0.55);
        var q1 = polar(a[0], a[1], rl, -150), q2 = [a[0] + rl * Math.cos(vv), a[1] + rl * Math.sin(vv)];
        var q3 = [b[0] - rl * Math.cos(vv), b[1] + rl * Math.sin(vv)], q4 = polar(b[0], b[1], rl, -30);
        var kant = "M" + f1(q1[0]) + "," + f1(q1[1]) + " A" + f1(rl) + " " + f1(rl) + " 0 0 0 " + f1(q2[0]) + "," + f1(q2[1]) + " L" + f1(q3[0]) + "," + f1(q3[1]) +
            " A" + f1(rl) + " " + f1(rl) + " 0 0 0 " + f1(q4[0]) + "," + f1(q4[1]);
        SV.el("path", { d: kant, fill: "none", stroke: "#2f7f75", "stroke-width": 8, "stroke-opacity": 0.2, "clip-path": "url(#" + c + ")" }, krop);
        var kg = SV.g(gg, { "clip-path": "url(#" + c + ")" });
        SV.el("path", { d: kant, fill: "none", stroke: F.accent, "stroke-width": 2, "stroke-linejoin": "round" }, kg);
        return { g: gg, lomme: [lx, ly] };
    };

    /* Et denatureret enzym: kaeden er foldet ud til en loes, slynget traad */
    KV.udfoldet = function (g, cx, cy, b) {
        var gg = SV.g(g), p = [];
        for (var i = 0; i <= 60; i++) {
            var t = i / 60, x = cx - b / 2 + b * t;
            var y = cy + 15 * Math.sin(t * 2 * Math.PI * 2.2 + 0.4) + 7 * Math.sin(t * 2 * Math.PI * 5.1 + 1.3);
            p.push([x, y]);
        }
        SV.el("polyline", { points: pkt(p), fill: "none", stroke: "#1c6e66", "stroke-opacity": 0.22, "stroke-width": 9, "stroke-linecap": "round", "stroke-linejoin": "round",
            filter: "url(#kv-blur)", transform: "translate(0 2)" }, gg);
        SV.el("polyline", { points: pkt(p), fill: "none", stroke: "#58a99d", "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
        SV.el("polyline", { points: pkt(p), fill: "none", stroke: "#cfeee8", "stroke-width": 2.4, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.9 }, gg);
        return gg;
    };

    /* Substratet: to kugler (orange og lilla) bundet sammen af en pind */
    KV.substrat = function (g, x, y, brydes) {
        var gg = SV.g(g), a = [x - SD / 2, y], b = [x + SD / 2, y];
        KV.pind(gg, a[0], a[1], b[0], b[1], brydes, 5.5);
        SV.el("circle", { cx: a[0], cy: a[1], r: SR, fill: "url(#kv-sa)", stroke: "#b8661f", "stroke-width": 1.6 }, gg);
        SV.el("circle", { cx: b[0], cy: b[1], r: SR, fill: "url(#kv-sb)", stroke: "#6d3fa3", "stroke-width": 1.6 }, gg);
        return gg;
    };

    /* Inhibitoren: et graat molekyle, der passer i lommen og blokerer den */
    KV.inhibitor = function (g, x, y) {
        var gg = SV.g(g), a = [x - SD / 2, y], b = [x + SD / 2, y];
        KV.pind(gg, a[0], a[1], b[0], b[1], false, 5.5);
        KV.pind(gg, x, y, x, y - 26, false, 5.5);
        SV.el("circle", { cx: a[0], cy: a[1], r: SR, fill: "url(#kv-inh)", stroke: "#3c4651", "stroke-width": 1.6 }, gg);
        SV.el("circle", { cx: b[0], cy: b[1], r: SR, fill: "url(#kv-inh)", stroke: "#3c4651", "stroke-width": 1.6 }, gg);
        SV.el("circle", { cx: x, cy: y - 28, r: 10, fill: "url(#kv-inh)", stroke: "#3c4651", "stroke-width": 1.6 }, gg);
        return gg;
    };

    /* =================================================================
       Gule felter langs en linje (kun kapitel B1)

       Motoren kender cirkler og rektangler. En tangent eller en kurve, der
       ligger skraat i grafen, kan ikke faa et rektangel, uden at feltet
       ogsaa daekker kurven og de andre linjer. Her kan et gult felt derfor
       ogsaa vaere { linje: [[x, y], ...], b: 16 }: en bred, gul streg langs
       punkterne. Feltet tegnes efter motoren, og r (feltets ydre kasse)
       saettes, saa selvtesten kan tjekke, at prikken ligger ved feltet.
       ================================================================= */
    var lav = NK.Bygger.prototype.lavPlads;
    NK.Bygger.prototype.lavPlads = function (p) {
        var alle = p.omr || [];
        var linjer = alle.filter(function (o) { return o.linje; });
        if (!linjer.length) { lav.call(this, p); return; }
        p.omr = alle.filter(function (o) { return !o.linje; });
        lav.call(this, p);
        var foerste = p.g.firstChild;
        linjer.forEach(function (o) {
            var b = o.b || 16;
            var el = SV.el("polyline", { "class": "p-halo linje", points: pkt(o.linje) });
            el.style.strokeWidth = b + "px";
            p.g.insertBefore(el, foerste);
            var xs = o.linje.map(function (q) { return q[0]; }), ys = o.linje.map(function (q) { return q[1]; });
            var x0 = Math.min.apply(null, xs), y0 = Math.min.apply(null, ys);
            o.r = [x0 - b / 2, y0 - b / 2, Math.max.apply(null, xs) - x0 + b, Math.max.apply(null, ys) - y0 + b];
        });
        p.omr = alle;
    };

    var stil = document.createElement("style");
    stil.textContent =
        ".plads .p-halo.linje { fill: none; stroke: rgba(242, 197, 61, 0.42); stroke-linecap: round; stroke-linejoin: round; }\n" +
        ".plads.aktiv:hover .p-halo.linje, .plads.fyldt:hover .p-halo.linje, .plads.over .p-halo.linje { fill: none; stroke: rgba(242, 197, 61, 0.78); }\n" +
        ".plads.hintet .p-halo.linje { fill: none; stroke: rgba(230, 137, 42, 0.5); }\n";
    document.head.appendChild(stil);
}());

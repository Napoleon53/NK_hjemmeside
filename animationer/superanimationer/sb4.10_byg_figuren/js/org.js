/* =====================================================================
   org.js - tegnehjaelp til kapitel B4: stregformler, zigzagformler,
   reaktionsskemaer, benzenringe, reagensglas og perlekaeder

   Kopieret fra sb3.6_byg_figuren (kapitel B3) den 2. nov. 2026; delen
   "Kapitel B4" nederst er lagt til her.

   Kun for dette kapitel (ikke en del af den faelles motor). Den foerste
   del er kopieret fra sc4.9_byg_figuren (kapitel 4) den 2. nov. 2026;
   resten (fra "Kapitel B3" og ned) er lagt til her i bogens stil fra
   Kemibogen/vaerktoej/lav_figurer.py (b4_mol, b4_tetra, b3l_pentan ...).
   ORG.streg tegner en stregformel i et gitter: atomerne staar paa
   gitterpunkter, og bindingerne er streger mellem dem, kortet af, saa de
   ikke roerer bogstaverne. ORG.zigzag tegner en kulstofkaede som en
   zigzagstreg; hver ende og hvert knaek er et carbonatom.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var SV = NK.SV;
    var ORG = NK.ORG = {};

    /* Halv bredde af et atomsymbol, saa stregen stopper foer bogstaverne */
    function halv(s, str) {
        var ren = String(s).replace(/[_^]/g, "");
        return NK.tekstBredde(ren, str, 700) / 2 + 3;
    }

    /* Et atomsymbol med midten i (x, y) */
    ORG.atom = function (g, x, y, s, o) {
        o = o || {};
        var str = o.str || 22;
        return SV.tekst(g, x, y + str * 0.36, s, { "font-size": str, "font-weight": 700, fill: o.farve || "#1f2a33" });
    };

    /* n streger mellem to punkter (enkelt-, dobbelt- eller tripelbinding) */
    ORG.binding = function (g, x1, y1, x2, y2, n, o) {
        o = o || {};
        var gg = SV.g(g);
        var dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l, ny = dx / l, afst = o.afst || 6;
        var forskyd = n === 1 ? [0] : (n === 2 ? [-afst / 2, afst / 2] : [-afst, 0, afst]);
        forskyd.forEach(function (f) {
            SV.el("line", { x1: x1 + nx * f, y1: y1 + ny * f, x2: x2 + nx * f, y2: y2 + ny * f,
                stroke: o.farve || "#1f2a33", "stroke-width": o.bredde || 2.2, "stroke-linecap": "round" }, gg);
        });
        return gg;
    };

    /* En stregformel. atomer: [[kol, raekke, "C"], ...], bindinger: [[i, j, n], ...].
       o: { x, y (gitterets nulpunkt), d (afstand), str (skrift), farve: {i: farve} }.
       Returnerer punkterne, saa figuren kan pege paa et atom. */
    ORG.streg = function (g, atomer, bindinger, o) {
        var d = o.d || 34, str = o.str || 22;
        var P = atomer.map(function (a) { return [o.x + a[0] * d, o.y + a[1] * d]; });
        bindinger.forEach(function (b) {
            var p = P[b[0]], q = P[b[1]], dx = q[0] - p[0], dy = q[1] - p[1];
            var l = Math.sqrt(dx * dx + dy * dy);
            /* Vandret: kort af med bogstavernes bredde, lodret med skriftens hoejde */
            var a1 = Math.abs(dx) > Math.abs(dy) ? halv(atomer[b[0]][2], str) : str * 0.5;
            var a2 = Math.abs(dx) > Math.abs(dy) ? halv(atomer[b[1]][2], str) : str * 0.5;
            var f = (o.bfarve && (o.bfarve[b[0] + "-" + b[1]])) || "#1f2a33";
            ORG.binding(g, p[0] + dx / l * a1, p[1] + dy / l * a1, q[0] - dx / l * a2, q[1] - dy / l * a2, b[2] || 1, { farve: f });
        });
        atomer.forEach(function (a, i) {
            ORG.atom(g, P[i][0], P[i][1], a[2], { str: str, farve: (o.farve && o.farve[i]) || undefined });
        });
        return P;
    };

    /* En zigzagkaede fra (x, y) med n streger af laengden l. Den foerste
       streg gaar op (op: true) eller ned. knaek: { i: grader } drejer
       kaeden efter streg i (et knaek ved en dobbeltbinding i en fedtsyre).
       dobbelt: [i, ...] tegner en ekstra streg paa streg i. */
    ORG.kaedePunkter = function (x, y, n, o) {
        o = o || {};
        var l = o.l || 26, v = o.retning || 0, op = o.op !== false;
        var P = [[x, y]];
        for (var i = 0; i < n; i++) {
            if (o.knaek && o.knaek[i] !== undefined) v += o.knaek[i];
            var a = (v + ((i % 2 === 0) === op ? -30 : 30)) * Math.PI / 180;
            var p = P[P.length - 1];
            P.push([p[0] + l * Math.cos(a), p[1] + l * Math.sin(a)]);
        }
        return P;
    };

    ORG.zigzag = function (g, P, o) {
        o = o || {};
        var gg = SV.g(g);
        var farve = o.farve || "#1f2a33";
        SV.el("polyline", { points: P.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "),
            fill: "none", stroke: farve, "stroke-width": o.bredde || 2.6, "stroke-linejoin": "round", "stroke-linecap": "round" }, gg);
        (o.dobbelt || []).forEach(function (i) {
            var p = P[i], q = P[i + 1];
            var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy);
            /* Den ekstra streg ligger paa indersiden af knaekket og er lidt kortere */
            var s = o.side && o.side[i] ? o.side[i] : 1;
            var nx = -dy / l * 6 * s, ny = dx / l * 6 * s;
            SV.el("line", { x1: p[0] + dx * 0.18 + nx, y1: p[1] + dy * 0.18 + ny, x2: q[0] - dx * 0.18 + nx, y2: q[1] - dy * 0.18 + ny,
                stroke: o.dfarve || farve, "stroke-width": o.bredde || 2.6, "stroke-linecap": "round" }, gg);
        });
        return gg;
    };

    /* Pladsernes bredde (som i motoren), saa givne skilte er lige saa brede */
    ORG.bredde = function (ord) {
        var b = 120;
        ord.forEach(function (o) { b = Math.max(b, NK.tekstBredde(o, 18, 700) + 28); });
        return Math.ceil(b);
    };

    /* Et skilt med et ord, der staar der i forvejen (graat, ikke en plads) */
    ORG.givet = function (g, x, y, tekst, B) {
        SV.el("rect", { x: x - B / 2, y: y - 17, width: B, height: 34, rx: 8, fill: "#ffffff", stroke: "#b9c6cf", "stroke-width": 1.5 }, g);
        SV.tekst(g, x, y + 6.3, tekst, { "font-size": 18, "font-weight": 700, fill: "#6b7782" });
    };

    /* Et lyst kort med skygge */
    ORG.kort = function (g, x, y, b, h, o) {
        o = o || {};
        return SV.el("rect", { x: x, y: y, width: b, height: h, rx: o.rx || 14, fill: o.fyld || "#f6f9fb", stroke: o.kant || "#c5d1dc",
            "stroke-width": 1.5, filter: o.skygge === false ? null : "url(#skygge)" }, g);
    };

    /* En ramme om en gruppe (uden skygge) */
    ORG.ramme = function (g, x, y, b, h, o) {
        o = o || {};
        return SV.el("rect", { x: x, y: y, width: b, height: h, rx: 16, fill: o.fyld || "none", stroke: o.kant || "#8fc7bb", "stroke-width": 2,
            "stroke-dasharray": o.stiplet ? "7 5" : null }, g);
    };

    /* En pil fra x1 til x2 i hoejden y */
    ORG.pil = function (g, x1, x2, y, o) {
        o = o || {};
        var gg = SV.g(g), f = o.farve || "#4b5560", ret = x2 > x1 ? 1 : -1;
        SV.el("line", { x1: x1, y1: y, x2: x2 - ret * 10, y2: y, stroke: f, "stroke-width": o.bredde || 2.4, "stroke-linecap": "round" }, gg);
        SV.el("polygon", { points: x2 + "," + y + " " + (x2 - ret * 12) + "," + (y - 6) + " " + (x2 - ret * 12) + "," + (y + 6), fill: f }, gg);
        return gg;
    };

    /* =================================================================
       Kapitel B3
       ================================================================= */

    /* Bogens farver (lav_figurer.py) */
    ORG.F = {
        blaek: "#14201f",
        daempet: "#556766",
        accent: "#0f766e",
        accentLys: "#e3f2f0",
        kant: "#c3d6d4",
        neg: "#1d4ed8",            /* δ− og dipol-dipolbindinger */
        pos: "#c0392b",            /* δ+ */
        proton: "#e5533d",         /* hydrogenbindinger */
        protonKant: "#a93226",
        skyNeutral: "#a9a6d8",
        skyNeg: "#2f62d0",
        skyPos: "#e0533f",
        hydrofob: "#f6d77a",
        hydrofobKant: "#c99a12",
        hydrofil: "#cfe0fb",
        hydrofilKant: "#1d4ed8"
    };
    var FB = ORG.F;
    var FONT = "Segoe UI, Tahoma, Geneva, Verdana, sans-serif";

    /* Filtre og forloeb i motorens faelles, usynlige defs */
    var harDefs = false;
    ORG.defs = function () {
        if (harDefs) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefs = true;
        var f1 = SV.el("filter", { id: "b3-sky", x: "-30%", y: "-60%", width: "160%", height: "220%" }, d);
        SV.el("feGaussianBlur", { stdDeviation: 3.2 }, f1);
        var f2 = SV.el("filter", { id: "b3-blur", x: "-20%", y: "-20%", width: "140%", height: "140%" }, d);
        SV.el("feGaussianBlur", { stdDeviation: 4 }, f2);
        var k = SV.el("linearGradient", { id: "b3-kort", x1: 0, x2: 0, y1: 0, y2: 1 }, d);
        SV.el("stop", { offset: "0", "stop-color": "#fbfdfe" }, k);
        SV.el("stop", { offset: "1", "stop-color": "#eaf1f6" }, k);
    };

    function f1(v) { return (Math.round(v * 10) / 10).toString(); }

    /* Et kort i stil med bogens superfigurer: blød skygge og lys flade */
    ORG.kortB = function (g, x, y, b, h, o) {
        o = o || {};
        SV.el("rect", { x: x + 2, y: y + 5, width: b, height: h, rx: 16, fill: "#5b6b78", opacity: 0.16, filter: "url(#b3-blur)" }, g);
        return SV.el("rect", { x: x, y: y, width: b, height: h, rx: 16, fill: o.fyld || "url(#b3-kort)", stroke: o.kant || "#c9d6e0", "stroke-width": 1.1 }, g);
    };

    /* Tekst med bogens skrift; o: fs, farve, fed, anker, halo */
    ORG.t = function (g, x, y, s, o) {
        o = o || {};
        var a = { "font-size": o.fs || 15, fill: o.farve || FB.blaek, "text-anchor": o.anker || "middle" };
        if (o.fed) a["font-weight"] = 700;
        if (o.stil) a["font-style"] = o.stil;
        if (o.halo) { a.stroke = o.halo === true ? "#ffffff" : o.halo; a["stroke-width"] = 4; a["stroke-linejoin"] = "round"; a["paint-order"] = "stroke"; }
        return SV.tekst(g, x, y, s, a);
    };

    function enhed(v) { var r = v * Math.PI / 180; return [Math.cos(r), Math.sin(r)]; }
    ORG.enhed = enhed;

    /* Bredden af et fedt bogstav (eller en tekst) i skriftstoerrelsen fs */
    function bred(s, fs) { return NK.tekstBredde(String(s).replace(/[_^]/g, ""), fs, 700); }

    /* En skeletformel. atomer: [[x, y, etiket, o], ...]; etiket null er et
       carbonatom uden bogstav (et knaek eller en ende). o: { anker: "start"
       (punktet er det foerste bogstav, OH), "end" (det sidste, HO og H_3C),
       farve }. bindinger: [[i, j, n, side, farve], ...]; n er 1, 2, 3,
       "kile" (ud mod dig) eller "stribe" (vaek fra dig). side ved en
       dobbeltbinding: 0 to streger om midten, 1 eller -1 en kortere ekstra
       streg paa den side. Returnerer punkterne. */
    ORG.skelet = function (g, atomer, bindinger, o) {
        o = o || {};
        var fs = o.fs || 20, sw = o.sw || 2.6;
        var gg = SV.g(g);
        var ell = atomer.map(function (a) {
            if (!a[2]) return null;
            var forste = String(a[2]).replace(/[_^]\{?[0-9+−-]*\}?/g, "");
            var ao = a[3] || {};
            /* Med anker er punktet ét bogstav; uden anker staar hele etiketten om punktet (Br, Cl) */
            var bogstav = ao.anker === "end" ? forste.slice(-1) : (ao.anker === "start" ? forste.charAt(0) : forste);
            return [bred(bogstav, fs) / 2 + 3.5, fs * 0.5 + 1.5];
        });
        function trim(i, ux, uy) {
            var e = ell[i];
            if (!e) return 0;
            return 1 / Math.sqrt((ux / e[0]) * (ux / e[0]) + (uy / e[1]) * (uy / e[1]));
        }
        bindinger.forEach(function (b) {
            var p = atomer[b[0]], q = atomer[b[1]];
            var dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy);
            var ux = dx / l, uy = dy / l;
            var t1 = trim(b[0], ux, uy), t2 = trim(b[1], ux, uy);
            var x1 = p[0] + ux * t1, y1 = p[1] + uy * t1, x2 = q[0] - ux * t2, y2 = q[1] - uy * t2;
            var farve = b[4] || o.farve || FB.blaek;
            var n = b[2] || 1;
            if (n === "kile" || n === "stribe") { ORG.kile(gg, x1, y1, x2, y2, n === "kile", farve); return; }
            var nx = -uy, ny = ux;
            if (n === 1) {
                SV.el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: farve, "stroke-width": sw, "stroke-linecap": "round" }, gg);
            } else if (n === 2 && !b[3]) {
                [-3.2, 3.2].forEach(function (f) {
                    SV.el("line", { x1: f1(x1 + nx * f), y1: f1(y1 + ny * f), x2: f1(x2 + nx * f), y2: f1(y2 + ny * f), stroke: farve, "stroke-width": sw * 0.9, "stroke-linecap": "round" }, gg);
                });
            } else if (n === 2) {
                SV.el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: farve, "stroke-width": sw, "stroke-linecap": "round" }, gg);
                var s = b[3] * 6.5, k1 = ell[b[0]] ? 0 : 0.17, k2 = ell[b[1]] ? 0 : 0.17;
                SV.el("line", { x1: f1(x1 + dx * k1 + nx * s), y1: f1(y1 + dy * k1 + ny * s), x2: f1(x2 - dx * k2 + nx * s), y2: f1(y2 - dy * k2 + ny * s),
                    stroke: farve, "stroke-width": sw, "stroke-linecap": "round" }, gg);
            } else {
                [-5, 0, 5].forEach(function (f) {
                    SV.el("line", { x1: f1(x1 + nx * f), y1: f1(y1 + ny * f), x2: f1(x2 + nx * f), y2: f1(y2 + ny * f), stroke: farve, "stroke-width": sw * 0.85, "stroke-linecap": "round" }, gg);
                });
            }
        });
        atomer.forEach(function (a, i) {
            if (!a[2]) return;
            var ao = a[3] || {};
            var tekst = String(a[2]);
            var forste = tekst.replace(/[_^]\{?[0-9+−-]*\}?/g, "");
            var x = a[0], anker = "middle";
            if (ao.anker === "start" && forste.length > 1) { anker = "start"; x -= bred(forste.charAt(0), fs) / 2; }
            else if (ao.anker === "end" && forste.length > 1) { anker = "end"; x += bred(forste.slice(-1), fs) / 2; }
            SV.tekst(gg, x, a[1] + fs * 0.36, tekst, { "font-size": fs, "font-weight": 700, fill: ao.farve || o.tfarve || FB.blaek, "text-anchor": anker });
        });
        return gg;
    };

    /* Kile: binding ud mod dig (fyldt) eller vaek fra dig (stribet) */
    ORG.kile = function (g, x1, y1, x2, y2, fyldt, farve, b) {
        b = b || 9;
        farve = farve || FB.blaek;
        var l = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        var ux = (x2 - x1) / l, uy = (y2 - y1) / l, nx = -uy, ny = ux;
        if (fyldt) {
            return SV.el("polygon", { points: f1(x1) + "," + f1(y1) + " " + f1(x2 + nx * b / 2) + "," + f1(y2 + ny * b / 2) + " " +
                f1(x2 - nx * b / 2) + "," + f1(y2 - ny * b / 2), fill: farve }, g);
        }
        var gg = SV.g(g);
        for (var k = 1; k <= 6; k++) {
            var f = k / 6, px = x1 + ux * l * f, py = y1 + uy * l * f, h = b / 2 * f;
            SV.el("line", { x1: f1(px + nx * h), y1: f1(py + ny * h), x2: f1(px - nx * h), y2: f1(py - ny * h), stroke: farve, "stroke-width": 2 }, gg);
        }
        return gg;
    };

    /* δ+ eller δ− */
    ORG.delta = function (g, x, y, plus, fs) {
        return ORG.t(g, x, y, plus ? "δ+" : "δ−", { fs: fs || 15, fed: true, farve: plus ? FB.pos : FB.neg });
    };

    /* En prikket streg: en intermolekylaer binding (bogens b4_hbinding) */
    ORG.prikker = function (g, x1, y1, x2, y2, farve) {
        return SV.el("line", { x1: f1(x1), y1: f1(y1), x2: f1(x2), y2: f1(y2), stroke: farve || FB.proton, "stroke-width": 2.6,
            "stroke-dasharray": "1 6", "stroke-linecap": "round" }, g);
    };

    /* Et nummer i en groen cirkel (prioritet) */
    ORG.nummer = function (g, x, y, n, r) {
        r = r || 11;
        var gg = SV.g(g);
        SV.el("circle", { cx: x, cy: y, r: r, fill: FB.accent }, gg);
        ORG.t(gg, x, y + r * 0.42, String(n), { fs: r * 1.18, fed: true, farve: "#ffffff" });
        return gg;
    };

    /* En bue med pilespids fra vinkel a0 til a1 (grader, med uret er positiv) */
    ORG.bue = function (g, cx, cy, r, a0, a1, farve, sw) {
        farve = farve || FB.accent;
        var gg = SV.g(g);
        var p0 = [cx + r * Math.cos(a0 * Math.PI / 180), cy + r * Math.sin(a0 * Math.PI / 180)];
        var slut = a1 - (a1 > a0 ? 7 : -7);
        var p1 = [cx + r * Math.cos(slut * Math.PI / 180), cy + r * Math.sin(slut * Math.PI / 180)];
        var stor = Math.abs(slut - a0) > 180 ? 1 : 0, med = a1 > a0 ? 1 : 0;
        SV.el("path", { d: "M" + f1(p0[0]) + "," + f1(p0[1]) + " A" + r + "," + r + " 0 " + stor + "," + med + " " + f1(p1[0]) + "," + f1(p1[1]),
            fill: "none", stroke: farve, "stroke-width": sw || 2.6, "stroke-linecap": "round" }, gg);
        /* Spidsen peger langs buen */
        var ae = a1 * Math.PI / 180, sx = cx + r * Math.cos(ae), sy = cy + r * Math.sin(ae);
        var tv = ae + (a1 > a0 ? Math.PI / 2 : -Math.PI / 2);
        var ux = Math.cos(tv), uy = Math.sin(tv), nx = -uy, ny = ux, L = 13, B = 6.5;
        SV.el("polygon", { points: f1(sx) + "," + f1(sy) + " " + f1(sx - ux * L + nx * B) + "," + f1(sy - uy * L + ny * B) + " " +
            f1(sx - ux * L - nx * B) + "," + f1(sy - uy * L - ny * B), fill: farve }, gg);
        return gg;
    };

    /* ----- Kuglemodeller og elektronskyer (bogens b3l_pentan og b3l_sky) --- */
    var RAD = { C: 12.5, O: 12, H: 7.5 };
    ORG.RAD = RAD;

    /* Pladserne i en zigzagkaede: foerste binding i retningen (grader),
       derefter drejes skiftevis drej og -drej (b8_tlc_zigzag) */
    ORG.kuglePunkter = function (start, retning, antal, drej, L) {
        var pos = [start], v = retning;
        drej = drej === undefined ? 70 : drej;
        L = L || 19.5;
        for (var i = 0; i < antal - 1; i++) {
            var p = pos[pos.length - 1], e = enhed(v);
            pos.push([p[0] + L * e[0], p[1] + L * e[1]]);
            v += i % 2 === 0 ? drej : -drej;
        }
        return pos;
    };

    /* En kaede som kuglemodel set fra siden (b8_tlc_kaede). atomer er
       grundstofferne ("CCCCC"), n antallet af H paa hvert. Returnerer
       kuglerne [x, y, r, grundstof] i den raekkefoelge, de tegnes. */
    ORG.kugleKaede = function (atomer, pos, n, LH, sk) {
        sk = sk || 1;
        LH = (LH || 15.5) * sk;
        var bag = [], midt = [], foran = [];
        for (var i = 0; i < atomer.length; i++) {
            var a = atomer.charAt(i), x = pos[i][0], y = pos[i][1];
            midt.push([x, y, RAD[a] * sk, a]);
            if (!n[i]) continue;
            var ox, oy;
            if (i > 0 && i < atomer.length - 1) {
                ox = x - (pos[i - 1][0] + pos[i + 1][0]) / 2; oy = y - (pos[i - 1][1] + pos[i + 1][1]) / 2;
            } else {
                var j = i === 0 ? 1 : atomer.length - 2;
                ox = x - pos[j][0]; oy = y - pos[j][1];
            }
            var ov = Math.atan2(oy, ox);
            var vinkler = n[i] === 1 ? [[ov, foran]] : (n[i] === 2 ? [[ov - 0.62, bag], [ov + 0.62, foran]] : [[ov - 1.05, bag], [ov, foran], [ov + 1.05, foran]]);
            vinkler.forEach(function (w) { w[1].push([x + LH * Math.cos(w[0]), y + LH * Math.sin(w[0]), RAD.H * sk, "H"]); });
        }
        return bag.concat(midt, foran);
    };

    /* Pentan som kuglemodel, vandret med midten i (cx, cy) (b3l_pentan).
       sk forstoerrer modellen. */
    ORG.pentan = function (cx, cy, spejl, sk) {
        sk = sk || 1;
        var pos = ORG.kuglePunkter([0, 0], -35, 5, 70, 19.5 * sk);
        var mx = (pos[0][0] + pos[4][0]) / 2, my = pos.reduce(function (s, p) { return s + p[1]; }, 0) / 5;
        pos = pos.map(function (p) { return [cx + p[0] - mx, cy + (spejl ? my - p[1] : p[1] - my)]; });
        return ORG.kugleKaede("CCCCC", pos, [3, 2, 2, 2, 3], 15.5, sk);
    };

    ORG.kugler = function (g, kugler) {
        var gg = SV.g(g);
        kugler.forEach(function (k) {
            SV.el("circle", { cx: f1(k[0]), cy: f1(k[1]), r: k[2], fill: "url(#k-" + k[3] + ")", stroke: SV.KUGLER[k[3]][2], "stroke-width": 1.1 }, gg);
            SV.el("ellipse", { cx: f1(k[0] - k[2] * 0.3), cy: f1(k[1] - k[2] * 0.36), rx: f1(k[2] * 0.32), ry: f1(k[2] * 0.2), fill: "#ffffff", "fill-opacity": 0.45 }, gg);
        });
        return gg;
    };

    function bland(a, b, t) {
        var ca = [1, 3, 5].map(function (i) { return parseInt(a.substr(i, 2), 16); });
        var cb = [1, 3, 5].map(function (i) { return parseInt(b.substr(i, 2), 16); });
        return "rgb(" + ca.map(function (v, i) { return Math.round(v + (cb[i] - v) * t); }).join(",") + ")";
    }

    /* Elektronskyen om et molekyle (b3l_sky): en bloed rand om hver kugle.
       Med dipol er elektronerne samlet i den ende, mod peger paa (-1 venstre,
       1 hoejre): dér er skyen tyk og blaa, i den anden ende tynd og roed.
       Farven blandes for hver kugle, saa der ikke skal bruges et forloeb. */
    ORG.sky = function (g, kugler, x0, x1, dipol, mod, sk) {
        sk = sk || 1;
        var gg = SV.g(g, { opacity: dipol ? 0.6 : 0.5, filter: "url(#b3-sky)" });
        kugler.forEach(function (k) {
            var t = Math.max(0, Math.min(1, (k[0] - x0) / (x1 - x0)));
            var tyk = (dipol ? 3 + 17 * Math.pow(mod < 0 ? 1 - t : t, 1.3) : 10) * sk;
            var farve;
            if (!dipol) farve = FB.skyNeutral;
            else {
                var a = mod < 0 ? FB.skyNeg : FB.skyPos, b = mod < 0 ? FB.skyPos : FB.skyNeg;
                farve = t < 0.5 ? bland(a, FB.skyNeutral, t * 2) : bland(FB.skyNeutral, b, (t - 0.5) * 2);
            }
            SV.el("circle", { cx: f1(k[0]), cy: f1(k[1]), r: f1(k[2] + tyk), fill: farve }, gg);
        });
        return gg;
    };

    /* ----- Molekyler som skeletformler, tegnet ud fra en kaede ----------- */

    /* En zigzagkaede med vinkler paa 120 grader (bogens b4_mol): n punkter
       fra (x, y), foerste binding i retningen v0 (grader). cis: [i, ...]
       bindinger (fra 0), hvor kaeden boejer samme vej paa begge sider. */
    ORG.zz = function (x, y, n, L, v0, cis) {
        L = L || 34; v0 = v0 === undefined ? -30 : v0; cis = cis || [];
        var pos = [[x, y]], v = v0, drej = v0 <= 0 ? 60 : -60;
        for (var i = 0; i < n - 1; i++) {
            if (i > 0) {
                if (cis.indexOf(i - 1) >= 0) drej = -drej;
                v += drej; drej = -drej;
            }
            var p = pos[pos.length - 1], e = enhed(v);
            pos.push([p[0] + L * e[0], p[1] + L * e[1]]);
        }
        return pos;
    };

    /* Et punkt L fra p i retningen v (grader) */
    ORG.fra = function (p, L, v) { var e = enhed(v); return [p[0] + L * e[0], p[1] + L * e[1]]; };

    /* =================================================================
       Kapitel B4
       ================================================================= */

    /* Et plus mellem stofferne i et reaktionsskema */
    ORG.plus = function (g, x, y) {
        return ORG.t(g, x, y + 7, "+", { fs: 22, farve: FB.daempet });
    };

    /* En formel med bogstaver (H₂O, Br₂, CH₂=CH₂), fed som i bogens skemaer */
    ORG.f = function (g, x, y, s, o) {
        o = o || {};
        return SV.tekst(g, x, y + (o.fs || 21) * 0.36, s, { "font-size": o.fs || 21, "font-weight": 700, fill: o.farve || FB.blaek, "text-anchor": o.anker || "middle" });
    };

    /* Stoffets navn under et molekyle og en lille linje under navnet */
    ORG.navn = function (g, x, y, s, under) {
        ORG.t(g, x, y, s, { fs: 15, fed: true });
        if (under) ORG.t(g, x, y + 18, under, { fs: 13, farve: FB.daempet });
    };

    /* En reaktionspil fra x1 til x2 i hoejden y. o.over og o.under er smaa
       tekster (lys, katalysator), o.lig tegner en ligevaegtspil. */
    ORG.reaktionspil = function (g, x1, x2, y, o) {
        o = o || {};
        var gg = SV.g(g), f = o.farve || FB.blaek;
        function hoved(x, yy, ret, halv) {
            var p = f1(x) + "," + f1(yy) + " " + f1(x - ret * 11) + "," + f1(yy - 5.5);
            p += halv ? " " + f1(x - ret * 11) + "," + f1(yy) : " " + f1(x - ret * 11) + "," + f1(yy + 5.5);
            SV.el("polygon", { points: p, fill: f }, gg);
        }
        if (o.lig) {
            SV.el("line", { x1: x1, y1: y - 3.5, x2: x2 - 9, y2: y - 3.5, stroke: f, "stroke-width": 2 }, gg);
            SV.el("polygon", { points: f1(x2) + "," + f1(y - 3.5) + " " + f1(x2 - 11) + "," + f1(y - 9) + " " + f1(x2 - 11) + "," + f1(y - 3.5), fill: f }, gg);
            SV.el("line", { x1: x1 + 9, y1: y + 3.5, x2: x2, y2: y + 3.5, stroke: f, "stroke-width": 2 }, gg);
            SV.el("polygon", { points: f1(x1) + "," + f1(y + 3.5) + " " + f1(x1 + 11) + "," + f1(y + 9) + " " + f1(x1 + 11) + "," + f1(y + 3.5), fill: f }, gg);
        } else {
            var ret = x2 > x1 ? 1 : -1;
            SV.el("line", { x1: x1, y1: y, x2: x2 - ret * 9, y2: y, stroke: f, "stroke-width": 2.2 }, gg);
            hoved(x2, y, ret, false);
        }
        if (o.over) ORG.t(gg, (x1 + x2) / 2, y - 12, o.over, { fs: 13, farve: FB.daempet });
        if (o.under) ORG.t(gg, (x1 + x2) / 2, y + 22, o.under, { fs: 13, farve: FB.daempet });
        return gg;
    };

    /* En sekskantet ring med en spids foroven. Kant k gaar fra hjoerne k til
       k + 1, og hjoerne k ligger i vinklen -90 + 60k grader. o.dobbelt er de
       kanter, der har en ekstra streg paa indersiden. Returnerer hjoernerne. */
    ORG.ring = function (g, cx, cy, r, o) {
        o = o || {};
        var f = o.farve || FB.blaek, sw = o.sw || 2.6;
        var P = [];
        for (var k = 0; k < 6; k++) P.push(ORG.fra([cx, cy], r, -90 + 60 * k));
        SV.el("polygon", { points: P.map(function (p) { return f1(p[0]) + "," + f1(p[1]); }).join(" "), fill: "none", stroke: f, "stroke-width": sw, "stroke-linejoin": "round" }, g);
        (o.dobbelt || []).forEach(function (k) {
            var a = P[k], b = P[(k + 1) % 6];
            var ia = [a[0] + (cx - a[0]) * 0.2, a[1] + (cy - a[1]) * 0.2], ib = [b[0] + (cx - b[0]) * 0.2, b[1] + (cy - b[1]) * 0.2];
            var dx = ib[0] - ia[0], dy = ib[1] - ia[1];
            SV.el("line", { x1: f1(ia[0] + dx * 0.14), y1: f1(ia[1] + dy * 0.14), x2: f1(ib[0] - dx * 0.14), y2: f1(ib[1] - dy * 0.14), stroke: f, "stroke-width": sw, "stroke-linecap": "round" }, g);
        });
        return P;
    };

    /* Farveforloeb til glas og sølvspejl (lagt i de faelles defs) */
    var harDefsB4 = false;
    function defsB4() {
        if (harDefsB4) return;
        var rod = document.getElementById("faelles-defs");
        if (!rod) return;
        var d = rod.querySelector("defs");
        harDefsB4 = true;
        var glas = SV.el("linearGradient", { id: "b4-glas", x1: 0, x2: 1, y1: 0, y2: 0 }, d);
        [["0", "#c9d6e2", 0.8], ["0.2", "#ffffff", 0.6], ["0.65", "#eef3f7", 0.35], ["1", "#b8c7d4", 0.8]].forEach(function (s) {
            SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] }, glas);
        });
        var soelv = SV.el("linearGradient", { id: "b4-soelv", x1: 0, x2: 1, y1: 0, y2: 0 }, d);
        [["0", "#5c646c"], ["0.25", "#d9dee3"], ["0.45", "#9aa3ab"], ["0.75", "#3f464d"], ["1", "#8b949c"]].forEach(function (s) {
            SV.el("stop", { offset: s[0], "stop-color": s[1] }, soelv);
        });
    }

    /* Et reagensglas med midten i cx fra top til bund (b bredt). o.fyld er
       vaeskens farve, o.niveau vaeskens hoejde (0 til 1), o.bundfald en farve
       paa korn i bunden, o.spejl et sølvspejl paa glassets inderside. */
    ORG.reagensglas = function (g, cx, top, bund, b, o) {
        o = o || {};
        defsB4();
        var gg = SV.g(g), r = b / 2, xl = cx - r, xr = cx + r;
        var kontur = "M" + xl + "," + top + " L" + xl + "," + (bund - r) + " A" + r + "," + r + " 0 0,0 " + xr + "," + (bund - r) + " L" + xr + "," + top;
        var vy = bund - (bund - top - 10) * (o.niveau || 0.45);
        var vaeske = "M" + (xl + 1.5) + "," + vy + " L" + (xl + 1.5) + "," + (bund - r) + " A" + (r - 1.5) + "," + (r - 1.5) + " 0 0,0 " + (xr - 1.5) + "," + (bund - r) + " L" + (xr - 1.5) + "," + vy + " Z";
        SV.el("path", { d: vaeske, fill: o.spejl ? "url(#b4-soelv)" : (o.fyld || "#dceaf6"), "fill-opacity": o.spejl ? 1 : 0.9 }, gg);
        if (o.spejl) {
            SV.el("path", { d: "M" + (cx - r * 0.35) + "," + (vy + 14) + " l3,0 m-1.5,-1.5 l0,3", stroke: "#ffffff", "stroke-width": 1.4 }, gg);
        }
        if (o.bundfald) {
            var tal = [[-0.5, 0.12], [0.1, 0.06], [0.45, 0.16], [-0.2, 0.22], [0.3, 0.3], [-0.45, 0.32], [0, 0.38], [0.5, 0.42], [-0.3, 0.48], [0.18, 0.55], [-0.05, 0.6], [0.4, 0.66]];
            tal.forEach(function (t, i) {
                SV.el("circle", { cx: f1(cx + t[0] * r * 0.85), cy: f1(bund - r * 0.45 - t[1] * (bund - vy) * 0.55), r: 1.8 + (i % 3) * 0.6, fill: o.bundfald, opacity: 0.9 }, gg);
            });
            /* Et lag i bunden, der foelger glassets runde bund (cirklen om (cx, bund - r)) */
            var rr = r - 2, yb = bund - r * 0.55, w = Math.sqrt(Math.max(0, rr * rr - Math.pow(yb - (bund - r), 2)));
            SV.el("path", { d: "M" + f1(cx - w) + "," + f1(yb) + " A" + rr + "," + rr + " 0 0,0 " + f1(cx + w) + "," + f1(yb) + " Z", fill: o.bundfald, opacity: 0.85 }, gg);
        }
        SV.el("path", { d: kontur, fill: "url(#b4-glas)", stroke: "#7d8f99", "stroke-width": 1.6 }, gg);
        SV.el("ellipse", { cx: cx, cy: top, rx: r + 2, ry: 3, fill: "#eef3f7", stroke: "#7d8f99", "stroke-width": 1.4 }, gg);
        SV.el("line", { x1: xl + r * 0.35, y1: top + 10, x2: xl + r * 0.35, y2: bund - r - 4, stroke: "#ffffff", "stroke-width": 2.4, opacity: 0.7, "stroke-linecap": "round" }, gg);
        return gg;
    };

    /* En perle (en aminosyre i en kaede) i en af fire farver */
    var PERLER = [["#bfe4dc", "#1d7a72"], ["#f6dca8", "#b47a12"], ["#cfdcf7", "#2f5fb3"], ["#f4cdd3", "#a8394d"]];
    ORG.perle = function (g, x, y, r, n) {
        var p = PERLER[n % PERLER.length];
        var gg = SV.g(g);
        SV.el("circle", { cx: f1(x), cy: f1(y), r: r, fill: p[0], stroke: p[1], "stroke-width": 1.8 }, gg);
        SV.el("ellipse", { cx: f1(x - r * 0.32), cy: f1(y - r * 0.36), rx: f1(r * 0.3), ry: f1(r * 0.18), fill: "#ffffff", "fill-opacity": 0.55 }, gg);
        return gg;
    };

    /* En groen boks bag en gruppe (som bogens fremhaevede grupper) */
    ORG.boks = function (g, x, y, b, h, o) {
        o = o || {};
        return SV.el("rect", { x: f1(x), y: f1(y), width: f1(b), height: f1(h), rx: o.rx || 12, fill: o.farve || FB.accent, "fill-opacity": o.op || 0.12,
            stroke: o.farve || FB.accent, "stroke-width": 2 }, g);
    };
}());

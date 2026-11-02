/* =====================================================================
   lab.js - kapitel 5's egen tegnehjælp: vægt, måleglas, bægerglas,
   nummerskilte og pile i bogens stil (figurerne densitet, et-mol,
   skema-vej og vejeanalyse). Ikke en del af den fælles motor.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var F = SV.F;
    var LAB = NK.LAB = {};

    /* En vægt som i bogen: plade foroven, krop med mørkt display.
       cx er midten, top er pladens overkant. Returnerer displayets tekst. */
    LAB.vaegt = function (g, cx, top, b, visning) {
        var gg = SV.g(g);
        SV.el("rect", { x: cx - 18, y: top + 7, width: 36, height: 8, fill: "#9aa5b0" }, gg);
        SV.el("rect", { x: cx - b / 2, y: top, width: b, height: 8, rx: 4, fill: "#c7cfd6", stroke: "#7f8a95", "stroke-width": 1.2 }, gg);
        SV.el("rect", { x: cx - b / 2 - 8, y: top + 14, width: b + 16, height: 48, rx: 8, fill: "#eef1f4", stroke: "#7f8a95", "stroke-width": 1.5 }, gg);
        SV.el("rect", { x: cx - b / 2 - 8, y: top + 54, width: b + 16, height: 8, rx: 4, fill: "#d5dbe1" }, gg);
        var dB = Math.min(110, b - 30);
        SV.el("rect", { x: cx - dB / 2 - 12, y: top + 22, width: dB, height: 28, rx: 5, fill: "#1c242b" }, gg);
        var t = SV.tekst(gg, cx - 12, top + 42, visning, { "font-size": 17, "font-weight": 700, fill: "#a6f2c4" });
        [0, 1].forEach(function (i) {
            SV.el("rect", { x: cx + dB / 2 - 6 + i * 15, y: top + 31, width: 12, height: 9, rx: 4, fill: "#c3cbd3", stroke: "#7f8a95", "stroke-width": 0.8 }, gg);
        });
        return { g: gg, t: t };
    };

    /* Et måleglas: åbent foroven, fod forneden, streger i højre side.
       Væsken fylder fra fyldTop til bunden. */
    LAB.maaleglas = function (g, cx, top, bund, b, fyldTop, fyld) {
        var gg = SV.g(g);
        var x1 = cx - b / 2, x2 = cx + b / 2;
        SV.el("path", { d: "M" + (cx - 34) + "," + (bund + 10) + " L" + (cx - 22) + "," + bund + " L" + (cx + 22) + "," + bund + " L" + (cx + 34) + "," + (bund + 10) + " Z",
            fill: "#d5dbe1", stroke: "#7f8a95", "stroke-width": 1.4 }, gg);
        SV.el("rect", { x: x1, y: top, width: b, height: bund - top, fill: "url(#glas)" }, gg);
        var v = SV.el("rect", { x: x1 + 2, y: fyldTop, width: b - 4, height: bund - fyldTop - 2, fill: fyld || "#cfe3f5" }, gg);
        SV.el("ellipse", { cx: cx, cy: fyldTop, rx: b / 2 - 2, ry: 3, fill: "#ffffff", "fill-opacity": 0.55 }, gg);
        for (var y = bund - 14, i = 0; y > top + 14; y -= 14, i++) {
            SV.el("line", { x1: x2 - (i % 5 === 4 ? 16 : 9), y1: y, x2: x2 - 2, y2: y, stroke: "#5c6873", "stroke-width": 1.2 }, gg);
        }
        SV.el("path", { d: "M" + (x1 - 5) + "," + top + " L" + x1 + "," + (top + 6) + " L" + x1 + "," + bund + " L" + x2 + "," + bund + " L" + x2 + "," + (top + 6) + " L" + (x2 + 5) + "," + top,
            fill: "none", stroke: "#6d7b88", "stroke-width": 2.2, "stroke-linejoin": "round" }, gg);
        SV.el("line", { x1: x1 + 7, y1: top + 12, x2: x1 + 7, y2: bund - 10, stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": 0.7, "stroke-linecap": "round" }, gg);
        return { g: gg, vaeske: v };
    };

    /* Et bægerglas med væske og evt. bundfald */
    LAB.baeger = function (g, cx, top, bund, b, fyldTop) {
        var gg = SV.g(g);
        var x1 = cx - b / 2, x2 = cx + b / 2;
        SV.el("path", { d: "M" + (x1 + 2) + "," + fyldTop + " L" + (x1 + 2) + "," + (bund - 8) + " Q" + (x1 + 2) + "," + (bund - 2) + " " + (x1 + 8) + "," + (bund - 2) +
            " L" + (x2 - 8) + "," + (bund - 2) + " Q" + (x2 - 2) + "," + (bund - 2) + " " + (x2 - 2) + "," + (bund - 8) + " L" + (x2 - 2) + "," + fyldTop + " Z", fill: "url(#vand)" }, gg);
        SV.el("path", { d: "M" + (x1 - 6) + "," + top + " L" + x1 + "," + (top + 6) + " L" + x1 + "," + (bund - 8) + " Q" + x1 + "," + bund + " " + (x1 + 8) + "," + bund +
            " L" + (x2 - 8) + "," + bund + " Q" + x2 + "," + bund + " " + x2 + "," + (bund - 8) + " L" + x2 + "," + top,
            fill: "none", stroke: "#6d7b88", "stroke-width": 2.2, "stroke-linejoin": "round" }, gg);
        return gg;
    };

    /* Et nummer i en teal cirkel som i bogens trin */
    LAB.nr = function (g, x, y, n, r) {
        r = r || 12;
        var gg = SV.g(g);
        SV.el("circle", { cx: x, cy: y, r: r, fill: F.teal }, gg);
        SV.tekst(gg, x, y + r * 0.42, String(n), { "font-size": r * 1.2, "font-weight": 700, fill: "#ffffff" });
        return gg;
    };

    /* En pil fra (x1, y1) til (x2, y2) med spids */
    LAB.pil = function (g, x1, y1, x2, y2, o) {
        o = o || {};
        var gg = SV.g(g), f = o.farve || "#c0560f", v = Math.atan2(y2 - y1, x2 - x1), l = 12, s = 6;
        SV.el("line", { x1: x1, y1: y1, x2: x2 - (l - 2) * Math.cos(v), y2: y2 - (l - 2) * Math.sin(v), stroke: f, "stroke-width": o.bredde || 2.6, "stroke-linecap": "round" }, gg);
        SV.el("polygon", { points: x2 + "," + y2 + " " + (x2 - l * Math.cos(v) + s * Math.sin(v)) + "," + (y2 - l * Math.sin(v) - s * Math.cos(v)) + " " +
            (x2 - l * Math.cos(v) - s * Math.sin(v)) + "," + (y2 - l * Math.sin(v) + s * Math.cos(v)), fill: f }, gg);
        return gg;
    };

    /* En bunke af korn (carbon, salt, sukker) på en lille skål */
    LAB.bunke = function (g, cx, bund, b, h, fyld, kant, prikker) {
        var gg = SV.g(g);
        SV.el("path", { d: "M" + (cx - b / 2 - 10) + "," + (bund - 4) + " L" + (cx + b / 2 + 10) + "," + (bund - 4) + " L" + (cx + b / 2) + "," + (bund + 3) + " L" + (cx - b / 2) + "," + (bund + 3) + " Z",
            fill: "#e6ebef", stroke: "#8d99a5", "stroke-width": 1.2 }, gg);
        SV.el("path", { d: "M" + (cx - b / 2) + "," + (bund - 4) + " Q" + (cx - b * 0.3) + "," + (bund - h) + " " + cx + "," + (bund - h) + " Q" + (cx + b * 0.3) + "," + (bund - h) + " " + (cx + b / 2) + "," + (bund - 4) + " Z",
            fill: fyld, stroke: kant, "stroke-width": 1.2 }, gg);
        var n = Math.round(b * h / 90);
        for (var i = 0; i < n; i++) {
            var u = ((i * 37) % 97) / 97, w = ((i * 61) % 89) / 89;
            var x = cx + (u - 0.5) * b * 0.8, top = bund - 4 - (h - 6) * (1 - Math.pow(2 * Math.abs(x - cx) / b, 2));
            var y = top + 3 + w * (bund - 7 - top);
            SV.el("circle", { cx: x, cy: y, r: 1.1, fill: prikker }, gg);
        }
        return gg;
    };

    /* ----- Bogens labtegninger (overført fra lav_figurer.py 1. nov. 2026) ----
       Vægt, bunker, urglas, vejebåd og lille bægerglas som i bogens figur
       et-mol, så 5.3 ligner bogen (brugeren: "Tegningerne i hele 5.3 er
       generelt lidt grimme.. Kan du ikke gøre dig lidt mere umage her?").
       Tegnes i bogens mål; s skalerer om (cx, y). */
    var GRAD = {
        "lab-staal": ["linear", { x1: 0, x2: 1, y1: 0, y2: 0 }, [[0, "#7d878e"], [0.3, "#eef1f3"], [0.62, "#aeb6bc"], [1, "#6c767c"]]],
        "lab-krop": ["linear", { x1: 0, x2: 0, y1: 0, y2: 1 }, [[0, "#fbfcfc"], [0.55, "#e3e8ea"], [1, "#c3cbcf"]]],
        "lab-display": ["linear", { x1: 0, x2: 0, y1: 0, y2: 1 }, [[0, "#26343a"], [1, "#0f1a1e"]]],
        "lab-knap": ["radial", { cx: 0.4, cy: 0.35, r: 0.7 }, [[0, "#f3f5f6"], [1, "#8b959a"]]],
        "lab-glas": ["linear", { x1: 0, x2: 1, y1: 0, y2: 0 }, [[0, "#9fb4c2", 0.45], [0.12, "#ffffff", 0.1], [0.2, "#ffffff", 0.6], [0.3, "#ffffff", 0.08], [0.85, "#ffffff", 0.04], [1, "#9fb4c2", 0.5]]],
        "lab-vand": ["linear", { x1: 0, x2: 0, y1: 0, y2: 1 }, [[0, "#dcecf8"], [1, "#b8d5ee"]]],
        "lab-skygge": ["radial", { cx: 0.5, cy: 0.5, r: 0.5 }, [[0, "#4b5a64", 0.32], [1, "#4b5a64", 0]]],
        "lab-skaal": ["linear", { x1: 0, x2: 0, y1: 0, y2: 1 }, [[0, "#ffffff", 0.9], [1, "#d5dde2", 0.9]]],
        "lab-bunke-salt": ["radial", { cx: 0.36, cy: 0.25, r: 0.85 }, [[0, "#ffffff"], [0.5, "#f0f3f5"], [1, "#c9d2d8"]]],
        "lab-bunke-sukker": ["radial", { cx: 0.36, cy: 0.25, r: 0.85 }, [[0, "#ffffff"], [0.5, "#fcfaf4"], [1, "#e8e0cc"]]],
        "lab-bunke-kul": ["radial", { cx: 0.36, cy: 0.25, r: 0.85 }, [[0, "#7a8288"], [0.5, "#3a4044"], [1, "#121517"]]],
        "lab-aeg": ["radial", { cx: 0.36, cy: 0.28, r: 0.78 }, [[0, "#fffaf1"], [0.55, "#f1dcb6"], [1, "#d2ad74"]]],
        "lab-pap": ["linear", { x1: 0, x2: 0, y1: 0, y2: 1 }, [[0, "#e6dfd2"], [1, "#cbc1af"]]],
        "lab-maale-vand": ["linear", { x1: 0, x2: 1, y1: 0, y2: 0 }, [[0, "#9cc9ec"], [0.35, "#d4e9f8"], [1, "#8fbfe6"]]]
    };
    LAB.gradienter = function () {
        var defs = document.querySelector("#faelles-defs defs");
        if (!defs) return;
        Object.keys(GRAD).forEach(function (id) {
            if (document.getElementById(id)) return;
            var gr = GRAD[id], a = { id: id };
            Object.keys(gr[1]).forEach(function (k) { a[k] = gr[1][k]; });
            var el = SV.el(gr[0] === "linear" ? "linearGradient" : "radialGradient", a, defs);
            gr[2].forEach(function (st) {
                var o = { offset: st[0], "stop-color": st[1] };
                if (st.length > 2) o["stop-opacity"] = st[2];
                SV.el("stop", o, el);
            });
        });
    };

    /* En gruppe, der tegnes i bogens mål og skaleres om (cx, y) */
    LAB.skaleret = function (g, cx, y, s) {
        return SV.g(g, { transform: "translate(" + cx + "," + y + ") scale(" + s + ") translate(" + (-cx) + "," + (-y) + ")" });
    };

    var GLASKANT = "#5f6f74";

    /* Digital vægt set forfra; y er vægtskålens overkant, og vægten fylder 44 under den */
    LAB.vaegtBog = function (g, cx, y, visning, b) {
        b = b || 120;
        var x0 = cx - b / 2, x1 = cx + b / 2;
        SV.el("ellipse", { cx: cx, cy: y + 45, rx: b * 0.62, ry: 6, fill: "url(#lab-skygge)" }, g);
        SV.el("path", { d: "M " + (x0 + 7) + "," + (y + 9) + " H " + (x1 - 7) + " Q " + (x1 - 3) + "," + (y + 9) + " " + (x1 - 2) + "," + (y + 13) + " L " + x1 + "," + (y + 38) +
            " Q " + x1 + "," + (y + 42) + " " + (x1 - 4) + "," + (y + 42) + " H " + (x0 + 4) + " Q " + x0 + "," + (y + 42) + " " + x0 + "," + (y + 38) + " L " + (x0 + 2) + "," + (y + 13) +
            " Q " + (x0 + 3) + "," + (y + 9) + " " + (x0 + 7) + "," + (y + 9) + " Z", fill: "url(#lab-krop)", stroke: "#6b767c", "stroke-width": 1.2 }, g);
        SV.el("line", { x1: x0 + 2, y1: y + 37, x2: x1 - 2, y2: y + 37, stroke: "#aab3b8", "stroke-width": 1 }, g);
        var db = b < 140 ? 70 : 78, dx = cx - db / 2 - (b >= 110 ? 8 : 0);
        SV.el("rect", { x: dx, y: y + 14, width: db, height: 20, rx: 3.5, fill: "url(#lab-display)", stroke: "#0b1214", "stroke-width": 1 }, g);
        SV.el("line", { x1: dx + 4, y1: y + 16.5, x2: dx + db - 4, y2: y + 16.5, stroke: "#ffffff", "stroke-width": 0.8, opacity: 0.18 }, g);
        var t = SV.tekst(g, dx + db / 2, y + 29, visning, { "font-size": 13.5, "font-weight": 700, fill: "#a8f5c8" });
        if (b >= 110) for (var k = 0; k < 2; k++) {
            SV.el("rect", { x: dx + db + 7 + k * 11, y: y + 21, width: 8, height: 6, rx: 2, fill: "url(#lab-knap)", stroke: "#6b767c", "stroke-width": 0.8 }, g);
        }
        SV.el("rect", { x: cx - 9, y: y + 5, width: 18, height: 5, rx: 1, fill: "#59646a" }, g);
        SV.el("rect", { x: x0 + 5, y: y, width: b - 10, height: 6, rx: 3, fill: "url(#lab-staal)", stroke: "#5d686e", "stroke-width": 1 }, g);
        return t;
    };

    /* Tilfældige tal, der er de samme hver gang (som random.Random(fro) i bogen) */
    function tilfaeldig(fro) {
        var a = fro * 2654435761 >>> 0;
        return function (lav, hoej) {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            var u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            return lav + u * (hoej - lav);
        };
    }

    var BUNKE = {
        salt: { omrids: "#98a4ab", korn: "#9eabb3", glimt: "#ffffff" },
        sukker: { omrids: "#ada38c", korn: "#d3c8ae", glimt: "#ffffff" },
        kul: { omrids: "#0d1012", korn: "#9aa3a9", glimt: "#e8eef2" }
    };

    /* Bunke af pulver eller krystaller med lys oppe fra venstre, korn og glimt */
    LAB.bunkeBog = function (g, cx, bund, b, h, slags, fro) {
        var f = BUNKE[slags], rnd = tilfaeldig(fro || 3), n = 40, d = "";
        function top(t) { var u = Math.abs(2 * t - 1); return bund - h * Math.pow(1 - Math.pow(u, 1.7), 0.85); }
        for (var k = 0; k <= n; k++) {
            var t = k / n, y = top(t);
            if (k > 0 && k < n) y += rnd(-0.6, 0.6) * (slags === "kul" ? 1.6 : 1);
            d += (k ? " L " : "M ") + (cx - b / 2 + t * b).toFixed(1) + "," + Math.min(bund, y).toFixed(1);
        }
        SV.el("path", { d: d + " Z", fill: "url(#lab-bunke-" + slags + ")", stroke: f.omrids, "stroke-width": 0.9, "stroke-linejoin": "round" }, g);
        var antal = Math.floor(b * h / (slags === "kul" ? 10 : 26));
        for (var i = 0; i < antal; i++) {
            var tt = rnd(0.03, 0.97), yy = rnd(top(tt) + 1.5, bund - 1);
            SV.el("circle", { cx: cx - b / 2 + tt * b, cy: yy, r: rnd(0.45, 0.95), fill: f.korn, opacity: rnd(0.35, 0.7).toFixed(2) }, g);
        }
        for (var j = 0; j < Math.max(3, Math.floor(b * h / 140)); j++) {
            var tg = rnd(0.12, 0.88), tp = top(tg), yg = rnd(tp + 2, tp + (bund - tp) * 0.75), x = cx - b / 2 + tg * b, sz = rnd(0.9, 1.6);
            SV.el("path", { d: "M " + x + "," + (yg - 2.2 * sz) + " L " + (x + 0.6 * sz) + "," + (yg - 0.6 * sz) + " L " + (x + 2.2 * sz) + "," + yg + " L " + (x + 0.6 * sz) + "," + (yg + 0.6 * sz) +
                " L " + x + "," + (yg + 2.2 * sz) + " L " + (x - 0.6 * sz) + "," + (yg + 0.6 * sz) + " L " + (x - 2.2 * sz) + "," + yg + " L " + (x - 0.6 * sz) + "," + (yg - 0.6 * sz) + " Z",
                fill: f.glimt, opacity: slags === "kul" ? 0.7 : 0.95 }, g);
        }
    };

    /* Urglas set lidt fra siden; y er underkanten. bunke(g, bund) tegnes mellem bagkant og forside */
    LAB.urglas = function (g, cx, y, b, bunke) {
        var ky = y - 6;
        SV.el("ellipse", { cx: cx, cy: ky, rx: b / 2, ry: 3, fill: "#eef4f7", stroke: GLASKANT, "stroke-width": 1.1 }, g);
        bunke(g, ky + 1);
        SV.el("path", { d: "M " + (cx - b / 2) + "," + ky + " Q " + cx + "," + (y + 4) + " " + (cx + b / 2) + "," + ky + " A " + (b / 2) + " 3 0 0 1 " + (cx - b / 2) + "," + ky + " Z",
            fill: "#dfeaf0", "fill-opacity": 0.75, stroke: GLASKANT, "stroke-width": 1.2, "stroke-linejoin": "round" }, g);
        SV.el("path", { d: "M " + (cx - b * 0.36) + "," + (ky + 2.2) + " Q " + (cx - b * 0.12) + "," + (ky + 4.6) + " " + (cx + b * 0.1) + "," + (ky + 4.4),
            fill: "none", stroke: "#ffffff", "stroke-width": 1.4, "stroke-linecap": "round", opacity: 0.9 }, g);
    };

    /* Vejebåd af hvid plast; y er underkanten. bunke(g, bund) tegnes mellem bagkant og forside */
    LAB.skaal = function (g, cx, y, b, h, bunke) {
        h = h || 10;
        var top = y - h;
        SV.el("path", { d: "M " + (cx - b / 2) + "," + top + " L " + (cx - b / 2 + 4) + "," + (top - 3) + " H " + (cx + b / 2 - 4) + " L " + (cx + b / 2) + "," + top + " Z",
            fill: "#e9eef1", stroke: "#7d8a91", "stroke-width": 1, "stroke-linejoin": "round" }, g);
        bunke(g, top + 1.5);
        SV.el("path", { d: "M " + (cx - b / 2) + "," + top + " L " + (cx - b / 2 + h * 0.8) + "," + y + " H " + (cx + b / 2 - h * 0.8) + " L " + (cx + b / 2) + "," + top + " Z",
            fill: "url(#lab-skaal)", stroke: "#7d8a91", "stroke-width": 1.2, "stroke-linejoin": "round" }, g);
        SV.el("line", { x1: cx - b / 2 - 1, y1: top, x2: cx + b / 2 + 1, y2: top, stroke: "#7d8a91", "stroke-width": 1.5 }, g);
        SV.el("line", { x1: cx - b / 2 + h * 0.8 + 3, y1: top + 2.4, x2: cx + b / 2 - h * 0.8 - 3, y2: top + 2.4, stroke: "#ffffff", "stroke-width": 1.2 }, g);
    };

    /* Lille bægerglas med vand set forfra, med menisk, målestreger og glans */
    var klipNr = 0;
    LAB.lilleBaeger = function (g, cx, bund, b, h, niveau) {
        var x0 = cx - b / 2, x1 = cx + b / 2, top = bund - h, vy = bund - h * niveau, id = "lab-klip-" + (++klipNr);
        var cp = SV.el("clipPath", { id: id }, g);
        SV.el("path", { d: "M " + x0 + "," + top + " V " + (bund - 5) + " Q " + x0 + "," + bund + " " + (x0 + 5) + "," + bund + " H " + (x1 - 5) + " Q " + x1 + "," + bund + " " + x1 + "," + (bund - 5) + " V " + top + " Z" }, cp);
        var v = SV.g(g, { "clip-path": "url(#" + id + ")" });
        SV.el("rect", { x: x0, y: vy, width: b, height: bund - vy, fill: "url(#lab-vand)" }, v);
        SV.el("line", { x1: x0, y1: vy, x2: x1, y2: vy, stroke: "#ffffff", "stroke-width": 1.6 }, v);
        SV.el("line", { x1: x0, y1: vy + 1.6, x2: x1, y2: vy + 1.6, stroke: "#8fbbe0", "stroke-width": 1 }, v);
        SV.el("path", { d: "M " + (x0 - 4) + "," + (top - 1) + " Q " + x0 + "," + top + " " + x0 + "," + (top + 5) + " V " + (bund - 5) + " Q " + x0 + "," + bund + " " + (x0 + 5) + "," + bund +
            " H " + (x1 - 5) + " Q " + x1 + "," + bund + " " + x1 + "," + (bund - 5) + " V " + (top + 5) + " Q " + x1 + "," + top + " " + (x1 + 4) + "," + (top - 1),
            fill: "url(#lab-glas)", stroke: GLASKANT, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
        SV.el("rect", { x: x0 + 3.5, y: top + 6, width: 3.5, height: h - 13, rx: 1.75, fill: "#ffffff", opacity: 0.75 }, g);
        for (var k = 0; k < 3; k++) {
            var yk = bund - 9 - k * (h - 18) / 3;
            SV.el("line", { x1: x1 - 9, y1: yk, x2: x1 - 3, y2: yk, stroke: "#8a9a9f", "stroke-width": 1 }, g);
        }
        return { vy: vy };
    };

    /* Måleglas som bogens k5_maaleglas: fod, glasrør med tud og glans, vand med
       menisk og en streg pr. mL (lange ved hver 5. mL). bund er fodens underkant.
       o.max er glassets største mål (25 mL), o.ml vandets volumen, og en lille
       mærkat foroven viser glassets størrelse (brugeren 1. nov. 2026: "en lille
       diskret 25 mL-mærkat på en pænt måleglas"). Giver væskens overflade (vy). */
    LAB.maaleglasBog = function (g, cx, bund, o) {
        o = o || {};
        var h = o.h || 76, b = o.b || 30, max = o.max || 25, ml = o.ml || 18;
        var fod = 7, rb = bund - fod, top = rb - h, x0 = cx - b / 2, x1 = cx + b / 2;
        var nul = rb - 3, fuld = top + 17, d = (nul - fuld) / max, vy = nul - d * ml;
        SV.el("path", { d: "M " + (x0 - 12) + "," + bund + " L " + (x0 - 8) + "," + (bund - fod) + " H " + (x1 + 8) + " L " + (x1 + 12) + "," + bund + " Z",
            fill: "url(#lab-glas)", stroke: GLASKANT, "stroke-width": 1.5, "stroke-linejoin": "round" }, g);
        SV.el("path", { d: "M " + (x0 + 1.5) + "," + vy + " Q " + cx + "," + (vy + 5) + " " + (x1 - 1.5) + "," + vy + " V " + (rb - 3) + " Q " + (x1 - 1.5) + "," + (rb - 1) + " " + (x1 - 4) + "," + (rb - 1) +
            " H " + (x0 + 4) + " Q " + (x0 + 1.5) + "," + (rb - 1) + " " + (x0 + 1.5) + "," + (rb - 3) + " Z", fill: "url(#lab-maale-vand)" }, g);
        SV.el("path", { d: "M " + (x0 + 1.5) + "," + vy + " Q " + cx + "," + (vy + 5) + " " + (x1 - 1.5) + "," + vy, fill: "none", stroke: "#e6f2fb", "stroke-width": 1.6 }, g);
        SV.el("path", { d: "M " + (x0 - 4) + "," + (top - 2) + " Q " + x0 + "," + top + " " + x0 + "," + (top + 6) + " V " + (rb - 2) + " Q " + x0 + "," + rb + " " + (x0 + 3) + "," + rb +
            " H " + (x1 - 3) + " Q " + x1 + "," + rb + " " + x1 + "," + (rb - 2) + " V " + (top + 2) + " Q " + x1 + "," + top + " " + (x1 + 1.5) + "," + top,
            fill: "url(#lab-glas)", stroke: GLASKANT, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
        for (var m = 1; m <= max; m++) {
            var y = nul - d * m, lang = m % 5 === 0;
            SV.el("line", { x1: x1 - (lang ? 10 : 5.5), y1: y, x2: x1 - 1.5, y2: y, stroke: "#56666c", "stroke-width": lang ? 0.9 : 0.6 }, g);
        }
        SV.el("path", { d: "M " + (x0 + 5) + "," + (top + 16) + " V " + (rb - 8), stroke: "#ffffff", "stroke-width": 3, "stroke-linecap": "round", opacity: 0.75 }, g);
        /* Mærkaten med glassets størrelse */
        SV.el("rect", { x: cx - 12.5, y: top + 3.5, width: 25, height: 9.5, rx: 2, fill: "#ffffff", stroke: "#a9b6bc", "stroke-width": 0.6, opacity: 0.95 }, g);
        SV.tekst(g, cx, top + 10.8, (o.maerkat || max + " mL"), { "font-size": 6.8, "font-weight": 700, fill: "#56666c" });
        return { vy: vy, top: top, rb: rb };
    };
}());

/* =====================================================================
   b6.js - kapitel B6's egen tegnehjaelp

   Bygger videre paa kurver.js (graferne og kortene fra kapitel B1) med
   det, kapitel B6's figurer har brug for, i samme stil som B-bogens
   figurer (Kemibogen/vaerktoej/lav_figurer.py, sf_b6_...):
   - kuglemodellerne af vand, oxonium, hydroxid, ethansyre, ethanoat,
     carbonat, hydrogencarbonat og kulsyre med den orange hydron, der
     flytter (sf_b6_atomer, sf_b6_model, sa_atomer, sa_drej, sa_tetra),
   - ligevaegtspilen, den vinklede orange hydronpil og de groenne klammer
     om et korresponderende syre-basepar (sf_b6_ligevaegt,
     sf_b6_hydronpil, sf_b6_klamme),
   - felterne paa pH-skalaen med lys og skygge (sf_b6_felt, ph_farve),
   - en broek i en formel, et baegerglas, en flaske, en burette paa et
     stativ, en konisk kolbe, en magnetomroerer og en draabeflaske.
   Ikke en del af den faelles motor.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var SV = NK.SV;
    var KV = NK.KV;
    var F = KV.F;
    var B6 = NK.B6 = {};

    /* Bogens farver (lav_figurer.py) */
    B6.F = {
        syre: "#a93226",             /* B6_S = PROTON_KANT: syrer er roede */
        base: "#1d4ed8",             /* B6_B = NEG_KANT: baser er blaa */
        pos: "#c0392b",              /* POS_KANT: fortegnet + */
        hydron: "#b45309",           /* NY_KANT: den hydron, der flytter */
        accent: "#0f766e",
        blaek: "#14201f",
        daempet: "#556766",
        glasKant: "#6f8796"
    };
    var C = B6.F;

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
        if (o.lin) a = o.x ? { id: id, x1: 0, x2: 1, y1: 0, y2: 0 } : { id: id, x1: 0, x2: 0, y1: o.op ? 1 : 0, y2: o.op ? 0 : 1 };
        else a = { id: id, cx: o.cx || "36%", cy: o.cy || "30%", r: o.r || "78%" };
        var gr = SV.el(o.lin ? "linearGradient" : "radialGradient", a, d);
        stop.forEach(function (s) { SV.el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] === undefined ? 1 : s[2] }, gr); });
        return id;
    }

    /* Kuglernes farver (KUGLE_GRAD: lys, mellem, moerk) og kanter (SF_B6_KANT) */
    var KUGLE = {
        H:   ["#ffffff", "#e4e9eb", "#aab5b9"],
        O:   ["#ffc9bd", "#ef6f58", "#bf3923"],
        C:   ["#a3adb8", "#5b6573", "#2c3540"],
        N:   ["#c2d6fb", "#5f8ce6", "#2753bd"],
        Na:  ["#f1ebfb", "#b9a3de", "#7d62ae"],
        hyd: ["#fff6e0", "#f7b24a", "#c46f0c"]
    };
    var KANT = { H: "#7d8a8e", O: "#8f2a1b", C: "#1c232b", N: "#1b3f8f", Na: "#5b4590", hyd: "#a85a06" };
    var RADIUS = { H: 6.3, hyd: 6.3, O: 10.2, C: 10.2, N: 10.6, Na: 11.5 };

    B6.defs = function () {
        KV.defs();
        if (harDefs || !defsEl()) return;
        harDefs = true;
        Object.keys(KUGLE).forEach(function (a) {
            var k = KUGLE[a];
            grad("b6-kg-" + a, [["0", k[0]], ["0.5", k[1]], ["1", k[2]]]);
        });
        /* Ionernes bloede gloed: roed om positive, blaa om negative */
        grad("b6-glod-pos", [["0.5", "#e5533d", 0.4], ["1", "#e5533d", 0]], { cx: "50%", cy: "50%", r: "50%" });
        grad("b6-glod-neg", [["0.5", "#2f6fde", 0.36], ["1", "#2f6fde", 0]], { cx: "50%", cy: "50%", r: "50%" });
        /* Skalaens felter: lys foroven, skygge forneden */
        grad("b6-glans", [["0", "#ffffff", 0.55], ["1", "#ffffff", 0]], { lin: true });
        grad("b6-skygge", [["0", "#000000", 0], ["1", "#000000", 0.16]], { lin: true });
        /* pH-skalaens ender, der toner ud (sf_b6_skala_defs) */
        grad("b6-ud-v", [["0", "#6b130c", 0], ["1", "#6b130c", 1]], { lin: true, x: true });
        grad("b6-ud-h", [["0", "#122b70", 1], ["1", "#122b70", 0]], { lin: true, x: true });
        grad("b6-ud-gv", [["0", "#e6ecee", 0], ["1", "#e6ecee", 1]], { lin: true, x: true });
        grad("b6-ud-gh", [["0", "#e6ecee", 1], ["1", "#e6ecee", 0]], { lin: true, x: true });
        /* Glas og vaesker */
        grad("b6-glas", [["0", "#9fb4c2", 0.45], ["0.12", "#ffffff", 0.1], ["0.2", "#ffffff", 0.55], ["0.3", "#ffffff", 0.08], ["0.85", "#ffffff", 0.04], ["1", "#9fb4c2", 0.5]], { lin: true, x: true });
        grad("b6-staal", [["0", "#dfe5e8"], ["0.5", "#a8b2b8"], ["1", "#78838a"]], { lin: true, x: true });
        grad("b6-hane", [["0", "#9cc0f0"], ["1", "#2f5fb4"]], { lin: true });
        grad("b6-plade", [["0", "#f4f6f7"], ["1", "#cfd6db"]], { lin: true });
        grad("b6-fod", [["0", "#4a5560"], ["1", "#262d33"]], { lin: true });
        grad("b6-skyggeplet", [["0", "#4b5a64", 0.34], ["1", "#4b5a64", 0]], { cx: "50%", cy: "50%", r: "50%" });
        /* Phenolphthaleins omslagsomraade: farveloes forneden, lyseroed foroven */
        grad("b6-omslag", [["0", "#e64f9a", 0.42], ["0.75", "#f3a3c9", 0.22], ["1", "#fbe3ef", 0.08]], { lin: true });
    };

    /* gs_blanding: farven a blandet med b, t = 0 er a, t = 1 er b */
    function hex(r, g, b) {
        return "#" + [r, g, b].map(function (v) { var s = Math.round(Math.max(0, Math.min(255, v))).toString(16); return s.length < 2 ? "0" + s : s; }).join("");
    }
    function rgb(h) { return [1, 3, 5].map(function (k) { return parseInt(h.slice(k, k + 2), 16); }); }
    B6.blanding = function (a, b, t) {
        var x = rgb(a), y = rgb(b);
        return hex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
    };
    B6.vaeske = function (farve) {
        var id = "b6-v-" + farve.slice(1);
        grad(id, [["0", B6.blanding(farve, "#ffffff", 0.22)], ["1", B6.blanding(farve, "#1c2427", 0.08)]], { lin: true });
        return { fyld: "url(#" + id + ")", overflade: B6.blanding(farve, "#ffffff", 0.45) };
    };

    /* ----- Kuglemodellerne ------------------------------------------------ */

    /* sa_drej: drej et punkt vx om x-aksen, vy om y-aksen og vz om z-aksen */
    function drej(p, vx, vy, vz) {
        var x = p[0], y = p[1], z = p[2], c, s, t;
        c = Math.cos(vx); s = Math.sin(vx); t = c * y - s * z; z = s * y + c * z; y = t;
        c = Math.cos(vy); s = Math.sin(vy); t = c * x + s * z; z = -s * x + c * z; x = t;
        c = Math.cos(vz); s = Math.sin(vz); t = c * x - s * y; y = s * x + c * y; x = t;
        return [x, y, z];
    }

    /* sa_tetra: tre H-atomer paa et carbonatom i c, naar den fjerde binding peger i retningen mod */
    function tetra(c, mod, l) {
        l = l || 11;
        var p = Math.abs(mod[2]) < 0.9 ? [-mod[1], mod[0], 0] : [0, -mod[2], mod[1]];
        var n = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
        p = [p[0] / n, p[1] / n, p[2] / n];
        var q = [mod[1] * p[2] - mod[2] * p[1], mod[2] * p[0] - mod[0] * p[2], mod[0] * p[1] - mod[1] * p[0]];
        var ct = -1 / 3, st = Math.sqrt(8) / 3, ud = [];
        for (var k = 0; k < 3; k++) {
            var f = (90 + k * 120) * Math.PI / 180;
            var d = [0, 1, 2].map(function (i) { return ct * mod[i] + st * (Math.cos(f) * p[i] + Math.sin(f) * q[i]); });
            ud.push([c[0] + l * d[0], c[1] + l * d[1], c[2] + l * d[2]]);
        }
        return ud;
    }

    function midt(ud) {
        var mx = 0, my = 0;
        ud.forEach(function (a) { mx += a[0][0]; my += a[0][1]; });
        mx /= ud.length; my /= ud.length;
        return ud.map(function (a) { return [[a[0][0] - mx, a[0][1] - my, a[0][2]], a[1], a[2]]; });
    }

    /* sf_b6_atomer: atomerne som [[x, y, z], a, maerke]. a er H, O, C, N eller
       hyd (den hydron, der flytter, er orange). maerke "fri" sidder paa det
       atom, der optager en hydron (spidsen af hydronpilen). */
    function atomer(slags) {
        var ud, k;
        if (slags === "H2O") return [[[0, 0, 0], "O", "fri"], [[6.8, 8.7, 0], "H", ""], [[6.8, -8.7, 0], "H", ""]];
        if (slags === "H2O-syre") return [[[0, 0, 0], "O", ""], [[11, 0, 0], "hyd", "hyd"], [[-2.7, 10.7, 0], "H", ""]];
        if (slags === "OH") return [[[-2.5, 0, 0], "O", "fri"], [[8.0, -4.5, 2.0], "H", ""]];
        if (slags === "H3O" || slags === "H3O-v") {
            var ct = 0.27, st = Math.sqrt(1 - ct * ct), v0 = slags === "H3O-v" ? 200 : 20;
            ud = [[[0, -1.5, 0], "O", ""]];
            [v0, v0 + 120, v0 + 240].forEach(function (v, i) {
                var r = v * Math.PI / 180;
                ud.push([[11 * st * Math.cos(r), 11 * ct, 11 * st * Math.sin(r)], i === 0 ? "hyd" : "H", i === 0 ? "hyd" : ""]);
            });
            return ud;
        }
        if (slags === "CH3COOH" || slags === "CH3COO") {
            var c1 = [-16.0, 6.5, 0.0], c2 = [0, 0, 0], o1 = [2.5, -14.0, 0.0], o2 = [13.0, 7.0, 0.0];
            var l = Math.sqrt(16 * 16 + 6.5 * 6.5);
            ud = [[c1, "C", ""], [c2, "C", ""], [o1, "O", ""], [o2, "O", "fri"]];
            tetra(c1, [(c2[0] - c1[0]) / l, (c2[1] - c1[1]) / l, 0]).forEach(function (h) { ud.push([h, "H", ""]); });
            if (slags === "CH3COOH") ud.push([[24.5, 0.0, 3.0], "hyd", "hyd"]);
            /* sa_atomer laegger midten i atomernes gennemsnit */
            return midt(ud);
        }
        if (slags === "CO3" || slags === "HCO3" || slags === "H2CO3") {
            var L = 13.6, LH = 10.5;
            ud = [[[0, 0, 0], "C", ""]];
            [-90, 30, 150].forEach(function (v) { var r = v * Math.PI / 180; ud.push([[L * Math.cos(r), L * Math.sin(r), 0], "O", ""]); });
            if (slags !== "CO3") {
                var ox = L * Math.cos(150 * Math.PI / 180), oy = L * Math.sin(150 * Math.PI / 180);
                ud.push([[ox - LH * 0.5, oy + LH * 0.87, 1.5], "H", ""]);
            }
            if (slags === "H2CO3") {
                var ox2 = L * Math.cos(30 * Math.PI / 180), oy2 = L * Math.sin(30 * Math.PI / 180);
                ud.push([[ox2 + LH * 0.5, oy2 + LH * 0.87, 1.5], "hyd", "hyd"]);
            }
            if (slags === "HCO3") ud[2][2] = "fri";
            return midt(ud);
        }
        if (slags === "Na") return [[[0, 0, 0], "Na", ""]];
        throw new Error("ukendt partikel " + slags);
    }

    var LADNING = { "H3O": "+", "H3O-v": "+", "OH": "−", "CH3COO": "−", "CO3": "2−", "HCO3": "−", "Na": "+" };

    /* sf_b6_model: kuglemodel med midten i (cx, cy), tegnet bagfra og frem.
       Ioner har en bloed gloed og et fortegn (o.fortegn = "v" saetter det til
       venstre). o.hydron = false tegner hydronen hvid. Giver
       { hyd: [x, y, r], fri: [x, y, r], R } for den orange hydron, det atom,
       der optager en hydron, og modellens radius. */
    /* Kun beregningen: kuglerne og maerkerne, uden at tegne (pladserne i
       figurfilerne bruger maerkerne til at pege paa et bestemt atom) */
    B6.beregn = function (slags, cx, cy, s, o) {
        o = o || {};
        s = s || 1.5;
        var kugler = [], maerker = {};
        atomer(slags).forEach(function (a) {
            var slag = a[1] === "hyd" && o.hydron === false ? "H" : a[1];
            var p = drej(a[0], o.vx === undefined ? 0.35 : o.vx, o.vy || 0, o.vz || 0);
            var X = cx + p[0] * s, Y = cy + p[1] * s, r = RADIUS[slag] * s;
            kugler.push({ z: p[2], x: X, y: Y, r: r, a: slag });
            if (a[2]) maerker[a[2]] = [X, Y, r];
        });
        kugler.sort(function (a, b) { return a.z - b.z; });
        var R = 0;
        kugler.forEach(function (k) { R = Math.max(R, Math.sqrt((k.x - cx) * (k.x - cx) + (k.y - cy) * (k.y - cy)) + k.r); });
        maerker.R = R;
        maerker.kugler = kugler;
        return maerker;
    };

    B6.model = function (g, slags, cx, cy, s, o) {
        o = o || {};
        s = s || 1.5;
        var gg = SV.g(g);
        var maerker = B6.beregn(slags, cx, cy, s, o), kugler = maerker.kugler, R = maerker.R;
        var q = LADNING[slags];
        if (q && o.glod !== false) SV.el("circle", { cx: cx, cy: cy, r: R + 8 * s, fill: "url(#b6-glod-" + (q.indexOf("+") >= 0 ? "pos" : "neg") + ")" }, gg);
        kugler.forEach(function (k) {
            SV.el("circle", { cx: k.x.toFixed(1), cy: k.y.toFixed(1), r: k.r.toFixed(2), fill: "url(#b6-kg-" + k.a + ")", stroke: KANT[k.a], "stroke-width": 0.9 }, gg);
        });
        if (q && o.fortegn !== false) {
            var fx = cx + (o.fortegn === "v" ? -1 : 1) * (R + 2) * 0.74, fy = cy - (R + 2) * 0.7 + 5;
            KV.tekst(gg, fx, fy, q, { fs: q.length === 1 ? 19 : 16, fed: true, farve: q.indexOf("+") >= 0 ? C.pos : C.base });
        }
        maerker.R = R;
        maerker.g = gg;
        return maerker;
    };

    /* En fri hydron: en lille orange kugle (sf_b6_hydronkugle) */
    B6.hydronkugle = function (g, x, y, r) {
        return SV.el("circle", { cx: x, cy: y, r: r || 6.5, fill: "url(#b6-kg-hyd)", stroke: KANT.hyd, "stroke-width": 0.9 }, g);
    };

    /* ----- Pile og klammer ------------------------------------------------ */

    /* sf_b6_ligevaegt: ligevaegtspilen (⇌) som to halve pile */
    B6.ligevaegt = function (g, x1, x2, y, farve, sw) {
        var gg = SV.g(g);
        farve = farve || C.blaek; sw = sw || 2.6;
        [[y - 5, x1, x2], [y + 5, x2, x1]].forEach(function (t) {
            var yy = t[0], a = t[1], b = t[2], s = b > a ? -1 : 1;
            SV.el("path", { d: "M" + a + "," + yy + " H" + b + " L" + (b + s * 11) + "," + (yy + (yy < y ? -7 : 7)), fill: "none", stroke: farve, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
        });
        return gg;
    };

    /* En reaktionspil (→) */
    B6.pil = function (g, x1, x2, y, farve, sw) {
        return KV.pil(g, x1, y, x2, y, farve || C.blaek, sw || 2.4, 12);
    };

    /* hydronpil: den vinklede orange pil fra hydronen (fra) op til top,
       vandret hen og ned til det atom, der optager den (til) */
    B6.hydronpil = function (g, fra, til, top, o) {
        o = o || {};
        var gg = SV.g(g);
        var x1 = fra[0], y1 = fra[1] - fra[2] - 2, x2 = til[0], y2 = til[1] - til[2] - 3;
        var hoved = 11, r = 7, b = hoved * 0.5, by = y2 - hoved, s = x2 > x1 ? 1 : -1;
        SV.el("path", { d: "M" + x1.toFixed(1) + "," + y1.toFixed(1) + " V" + (top + r) + " Q" + x1.toFixed(1) + "," + top + " " + (x1 + s * r).toFixed(1) + "," + top +
            " H" + (x2 - s * r).toFixed(1) + " Q" + x2.toFixed(1) + "," + top + " " + x2.toFixed(1) + "," + (top + r) + " V" + by.toFixed(1),
            fill: "none", stroke: C.hydron, "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, gg);
        SV.el("polygon", { points: x2.toFixed(1) + "," + y2.toFixed(1) + " " + (x2 - b).toFixed(1) + "," + by.toFixed(1) + " " + (x2 + b).toFixed(1) + "," + by.toFixed(1), fill: C.hydron }, gg);
        if (o.tekst) KV.tekst(gg, o.tx === undefined ? (x1 + x2) / 2 : o.tx, top - 9, o.tekst, { fs: 15, fed: true, farve: C.hydron, stil: "italic" });
        return gg;
    };

    /* sf_b6_klamme: groen klamme uden spids om et korresponderende syre-basepar */
    B6.klamme = function (g, x1, x2, y, hoejde, over, farve) {
        var s = over ? -1 : 1, yy = y + s * hoejde, r = 8;
        return SV.el("path", { d: "M" + x1 + "," + y + " V" + (yy - s * r) + " Q" + x1 + "," + yy + " " + (x1 + r) + "," + yy +
            " H" + (x2 - r) + " Q" + x2 + "," + yy + " " + x2 + "," + (yy - s * r) + " V" + y,
            fill: "none", stroke: farve || C.accent, "stroke-width": 2.4, "stroke-linecap": "round" }, g);
    };

    /* ----- Skalaen -------------------------------------------------------- */

    /* ph_farve: bogens farver til en hel pH-vaerdi fra −1 til 15 */
    var PH_FARVER = ["#8f1d14", "#b52a1e", "#d1432f", "#e06a52", "#ec9580", "#f4bcae", "#fae0d9", "#eef1ef",
                     "#dbe7fb", "#b9d0f7", "#93b4f0", "#6a93e6", "#4672d8", "#2b55c0", "#1b3c96"];
    B6.phFarve = function (p) { return p < 0 ? "#6b130c" : (p > 14 ? "#122b70" : PH_FARVER[p]); };

    /* sf_b6_felt: ét felt paa en skala med lys foroven og skygge forneden */
    B6.felt = function (g, x, y, b, h, farve, t, o) {
        o = o || {};
        var gg = SV.g(g), rx = o.rx || 6;
        SV.el("rect", { x: x, y: y, width: b, height: h, rx: rx, fill: farve, stroke: o.kant || null, "stroke-width": o.kant ? 1 : null }, gg);
        SV.el("rect", { x: x, y: y + h * 0.5, width: b, height: h * 0.5, rx: rx, fill: "url(#b6-skygge)" }, gg);
        SV.el("rect", { x: x + 2, y: y + 2, width: b - 4, height: h * 0.42, rx: Math.max(rx - 2, 2), fill: "url(#b6-glans)" }, gg);
        if (t !== undefined && t !== null) KV.tekst(gg, x + b / 2, y + h / 2 + (o.fs || 15) * 0.36, t, { fs: o.fs || 15, fed: o.fed !== false, farve: o.skrift || C.blaek });
        return gg;
    };

    /* En bloed skygge under en raekke felter */
    B6.raekkeSkygge = function (g, x, y, b, h) {
        return SV.el("rect", { x: x + 3, y: y + 5, width: b - 6, height: h, rx: 8, fill: "#5b6b78", opacity: 0.14, filter: "url(#kv-blur-stor)" }, g);
    };

    /* ----- Formler -------------------------------------------------------- */

    /* Tekst, der staar til venstre (anker start). Giver tekstelementet. */
    B6.venstre = function (g, x, y, s, fs, o) {
        o = o || {};
        return KV.tekst(g, x, y, s, { fs: fs, fed: o.fed !== false, farve: o.farve || C.blaek, anker: "start" });
    };

    /* Tekstens bredde i figurens enheder (svg-maaling, som B5.bredde) */
    var maaleSvg = null;
    B6.bredde = function (s, fs, vaegt) {
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
        return NK.tekstBredde(String(s).replace(/[_^{}]/g, ""), fs, vaegt);
    };

    /* En formel af stykker efter hinanden fra x: [tekst, ...] eller
       { broek: [over, under] }. Giver { x: [start for hvert stykke], b: [bredde], slut }. */
    B6.formel = function (g, x, y, stykker, o) {
        o = o || {};
        var fs = o.fs || 22, bfs = o.bfs || fs * 0.86, farve = o.farve || C.blaek, starter = [], bredder = [];
        stykker.forEach(function (s) {
            var b;
            if (typeof s === "string") {
                b = B6.bredde(s, fs, 700);
                B6.venstre(g, x, y, s, fs, { farve: farve });
            } else if (s.tom) {
                /* Pladsen holdes fri; stykket tegnes i en anden del */
                b = B6.bredde(s.tom, fs, 700);
            } else {
                var b1 = B6.bredde(s.broek[0], bfs, 700), b2 = B6.bredde(s.broek[1], bfs, 700);
                b = Math.max(b1, b2) + 12;
                KV.tekst(g, x + b / 2, y - fs * 0.62, s.broek[0], { fs: bfs, fed: true, farve: farve });
                KV.tekst(g, x + b / 2, y + fs * 0.88, s.broek[1], { fs: bfs, fed: true, farve: farve });
                SV.el("line", { x1: x + 2, y1: y - fs * 0.3, x2: x + b - 2, y2: y - fs * 0.3, stroke: farve, "stroke-width": 1.8 }, g);
            }
            starter.push(x);
            bredder.push(b);
            x += b + (o.luft === undefined ? 6 : o.luft);
        });
        return { x: starter, b: bredder, slut: x };
    };

    /* ----- Glas og udstyr ------------------------------------------------- */

    /* Et baegerglas med vaeske i let perspektiv (som B5.baeger) */
    B6.baeger = function (g, cx, bund, b, h, niveau, farve) {
        var gg = SV.g(g), x0 = cx - b / 2, x1 = cx + b / 2, top = bund - h, ry = b * 0.1, vy = bund - h * niveau;
        SV.el("ellipse", { cx: cx + 3, cy: bund + 2, rx: b * 0.62, ry: 6, fill: "url(#b6-skyggeplet)" }, gg);
        var v = B6.vaeske(farve);
        SV.el("path", { d: "M" + (x0 + 2) + "," + vy + " V" + (bund - 10) + " Q" + (x0 + 2) + "," + (bund - 1) + " " + (x0 + 12) + "," + (bund - 1) +
            " H" + (x1 - 12) + " Q" + (x1 - 2) + "," + (bund - 1) + " " + (x1 - 2) + "," + (bund - 10) + " V" + vy + " Z", fill: v.fyld }, gg);
        SV.el("ellipse", { cx: cx, cy: vy, rx: b / 2 - 2, ry: ry * 0.8, fill: v.overflade }, gg);
        SV.el("path", { d: "M" + x0 + "," + top + " V" + (bund - 10) + " Q" + x0 + "," + bund + " " + (x0 + 12) + "," + bund + " H" + (x1 - 12) +
            " Q" + x1 + "," + bund + " " + x1 + "," + (bund - 10) + " V" + top, fill: "url(#b6-glas)", stroke: C.glasKant, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("ellipse", { cx: cx, cy: top, rx: b / 2, ry: ry, fill: "#ffffff", "fill-opacity": 0.4, stroke: C.glasKant, "stroke-width": 1.6 }, gg);
        SV.el("path", { d: "M" + (x0 - 2) + "," + (top - 1) + " q-7,-4 -9,-1", fill: "none", stroke: C.glasKant, "stroke-width": 1.6, "stroke-linecap": "round" }, gg);
        SV.el("path", { d: "M" + (x0 + 9) + "," + (top + 12) + " V" + (bund - 14), stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.7 }, gg);
        for (var k = 1; k <= 3; k++) KV.linje(gg, x1 - 22, bund - h * 0.22 * k, x1 - 10, bund - h * 0.22 * k, "#8aa0ad", 1.1);
        return gg;
    };

    /* En flaske af glas med skruelaag og en hvid etiket med to linjer */
    B6.flaske = function (g, cx, bund, b, h, farve, etiket1, etiket2) {
        var gg = SV.g(g), x0 = cx - b / 2, x1 = cx + b / 2, skulder = bund - h + 46, hals = b * 0.2, top = bund - h + 14;
        var v = B6.vaeske(farve), vy = skulder + 12;
        function form(fra) {
            return "M" + (cx - hals) + "," + fra + " V" + (skulder - 14) + " Q" + (cx - hals) + "," + (skulder - 4) + " " + (x0 + 10) + "," + skulder +
                " Q" + x0 + "," + (skulder + 3) + " " + x0 + "," + (skulder + 16) + " V" + (bund - 8) + " Q" + x0 + "," + bund + " " + (x0 + 8) + "," + bund +
                " H" + (x1 - 8) + " Q" + x1 + "," + bund + " " + x1 + "," + (bund - 8) + " V" + (skulder + 16) + " Q" + x1 + "," + (skulder + 3) + " " + (x1 - 10) + "," + skulder +
                " Q" + (cx + hals) + "," + (skulder - 4) + " " + (cx + hals) + "," + (skulder - 14) + " V" + fra;
        }
        SV.el("ellipse", { cx: cx + 3, cy: bund + 2, rx: b * 0.62, ry: 6, fill: "url(#b6-skyggeplet)" }, gg);
        SV.el("path", { d: "M" + (x0 + 2) + "," + vy + " V" + (bund - 8) + " Q" + (x0 + 2) + "," + (bund - 2) + " " + (x0 + 9) + "," + (bund - 2) +
            " H" + (x1 - 9) + " Q" + (x1 - 2) + "," + (bund - 2) + " " + (x1 - 2) + "," + (bund - 8) + " V" + vy + " Z", fill: v.fyld }, gg);
        SV.el("path", { d: form(top), fill: "url(#b6-glas)", stroke: C.glasKant, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("rect", { x: cx - hals - 4, y: top - 18, width: 2 * hals + 8, height: 20, rx: 4, fill: "#3f6fb3", stroke: "#24477d", "stroke-width": 1.2 }, gg);
        for (var k = 1; k <= 3; k++) KV.linje(gg, cx - hals - 2, top - 18 + 5 * k, cx + hals + 2, top - 18 + 5 * k, "#2b528c", 0.9);
        SV.el("path", { d: "M" + (x0 + 8) + "," + (skulder + 20) + " V" + (bund - 12), stroke: "#ffffff", "stroke-width": 4, "stroke-linecap": "round", opacity: 0.6 }, gg);
        var ey = skulder + 30, eh = 58;
        SV.el("rect", { x: x0 + 8, y: ey, width: b - 16, height: eh, rx: 4, fill: "#ffffff", stroke: "#cbd5dc", "stroke-width": 1 }, gg);
        if (etiket1) KV.tekst(gg, cx, ey + 24, etiket1, { fs: 15, fed: true });
        if (etiket2) KV.tekst(gg, cx, ey + 46, etiket2, { fs: 17, fed: true, farve: C.accent });
        return { g: gg, etiket: [x0 + 8, ey, b - 16, eh] };
    };

    /* En konisk kolbe (LAB.erlenmeyer fra sc7.6) */
    B6.kolbe = function (g, cx, bund, h, o) {
        o = o || {};
        var gg = SV.g(g);
        var hb = h * 0.12, b = h * 0.48, hals = bund - h, skulder = bund - h * 0.62;
        var krop = "M" + (cx - hb) + "," + hals + " L" + (cx - hb) + "," + skulder + " L" + (cx - b + 6) + "," + (bund - 4) +
            " Q" + (cx - b) + "," + bund + " " + (cx - b + 10) + "," + bund + " L" + (cx + b - 10) + "," + bund + " Q" + (cx + b) + "," + bund + " " + (cx + b - 6) + "," + (bund - 4) +
            " L" + (cx + hb) + "," + skulder + " L" + (cx + hb) + "," + hals;
        if (o.farve) {
            var vy = bund - h * (o.niveau || 0.3), t = (bund - vy) / (bund - skulder), vb = b - (b - hb) * t, v = B6.vaeske(o.farve);
            SV.el("path", { d: "M" + (cx - vb + 1) + "," + vy + " L" + (cx - b + 7) + "," + (bund - 4) + " Q" + (cx - b + 2) + "," + (bund - 1.5) + " " + (cx - b + 11) + "," + (bund - 1.5) +
                " L" + (cx + b - 11) + "," + (bund - 1.5) + " Q" + (cx + b - 2) + "," + (bund - 1.5) + " " + (cx + b - 7) + "," + (bund - 4) + " L" + (cx + vb - 1) + "," + vy + " Z",
                fill: v.fyld }, gg);
            SV.el("ellipse", { cx: cx, cy: vy, rx: vb - 1, ry: 3.5, fill: v.overflade }, gg);
        }
        SV.el("path", { d: krop, fill: "url(#b6-glas)", stroke: C.glasKant, "stroke-width": 1.8, "stroke-linejoin": "round" }, gg);
        SV.el("line", { x1: cx - hb - 4, y1: hals, x2: cx + hb + 4, y2: hals, stroke: C.glasKant, "stroke-width": 2.4, "stroke-linecap": "round" }, gg);
        SV.el("line", { x1: cx - b * 0.55, y1: bund - h * 0.12, x2: cx - hb - 1, y2: skulder + 6, stroke: "#ffffff", "stroke-width": 2.6, "stroke-opacity": 0.75, "stroke-linecap": "round" }, gg);
        SV.el("rect", { x: cx - 11, y: bund - 8, width: 22, height: 5, rx: 2.5, fill: "#ffffff", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        return { g: gg, hals: hals, skulder: skulder, b: b };
    };

    /* En magnetomroerer: en hvid plade med en knap og en groen lampe */
    B6.omroerer = function (g, cx, top, b, h) {
        var gg = SV.g(g);
        SV.el("rect", { x: cx - b / 2, y: top, width: b, height: h, rx: 6, fill: "url(#b6-plade)", stroke: "#8a949e", "stroke-width": 1.2 }, gg);
        SV.el("rect", { x: cx - b / 2 + 4, y: top + 2, width: b - 8, height: 4, rx: 2, fill: "#ffffff", opacity: 0.8 }, gg);
        SV.el("circle", { cx: cx + b / 2 - 22, cy: top + h / 2 + 2, r: 7, fill: "#3b4650", stroke: "#1f262c", "stroke-width": 1 }, gg);
        SV.el("circle", { cx: cx + b / 2 - 44, cy: top + h / 2 + 2, r: 3, fill: "#3fae72" }, gg);
        return gg;
    };

    /* En burette i en klemme paa et stativ. bx er burettens midte, top og
       bund er glasrorets ender; foden staar i fodY. Giver { hane: [x, y], spids }. */
    B6.burette = function (g, sx, bx, top, bund, fodY, o) {
        o = o || {};
        var gg = SV.g(g), rb = 9;
        /* Stativet: fod, stang og klemme */
        SV.el("rect", { x: sx - 40, y: fodY, width: bx - sx + 150, height: 13, rx: 5, fill: "url(#b6-fod)" }, gg);
        SV.el("rect", { x: sx - 4, y: top - 26, width: 8, height: fodY - top + 26, rx: 3, fill: "url(#b6-staal)", stroke: "#6d787f", "stroke-width": 0.8 }, gg);
        var ky = top + 60;
        SV.el("rect", { x: sx, y: ky - 3, width: bx - sx + 4, height: 6, rx: 3, fill: "url(#b6-staal)", stroke: "#6d787f", "stroke-width": 0.8 }, gg);
        SV.el("rect", { x: sx - 9, y: ky - 9, width: 18, height: 18, rx: 4, fill: "#3b4650" }, gg);
        SV.el("rect", { x: bx - rb - 5, y: ky - 8, width: 2 * rb + 10, height: 16, rx: 4, fill: "#3b4650" }, gg);
        /* Vaesken og glasroret */
        var vtop = top + 18;
        if (o.farve) SV.el("rect", { x: bx - rb + 2, y: vtop, width: 2 * rb - 4, height: bund - vtop, fill: B6.vaeske(o.farve).fyld }, gg);
        SV.el("rect", { x: bx - rb, y: top, width: 2 * rb, height: bund - top, rx: 3, fill: "url(#b6-glas)", stroke: C.glasKant, "stroke-width": 1.6 }, gg);
        SV.el("rect", { x: bx - rb, y: ky - 8, width: 2 * rb, height: 16, fill: "#3b4650", opacity: 0.9 }, gg);
        /* Skalaen */
        var trin = (bund - top - 40) / 10;
        for (var k = 0; k <= 10; k++) {
            var yy = top + 20 + k * trin;
            if (Math.abs(yy - ky) < 10) continue;
            KV.linje(gg, bx - rb + 2, yy, bx - rb + (k % 2 ? 6 : 10), yy, "#2f4858", 1);
        }
        /* Hanen og spidsen */
        var hy = bund + 14;
        SV.el("path", { d: "M" + (bx - rb) + "," + bund + " L" + (bx - 5) + "," + (bund + 8) + " V" + (hy + 18) + " L" + bx + "," + (hy + 34) + " L" + (bx + 5) + "," + (hy + 18) + " V" + (bund + 8) + " L" + (bx + rb) + "," + bund,
            fill: "url(#b6-glas)", stroke: C.glasKant, "stroke-width": 1.5, "stroke-linejoin": "round" }, gg);
        SV.el("rect", { x: bx - 12, y: hy - 6, width: 24, height: 12, rx: 3, fill: "#e6ebee", stroke: "#6d787f", "stroke-width": 1 }, gg);
        SV.el("path", { d: "M" + (bx + 10) + "," + (hy - 3) + " L" + (bx + 34) + "," + (hy - 6) + " Q" + (bx + 40) + "," + hy + " " + (bx + 34) + "," + (hy + 6) + " L" + (bx + 10) + "," + (hy + 3) + " Z",
            fill: "url(#b6-hane)", stroke: "#24477d", "stroke-width": 1 }, gg);
        /* En draabe paa vej ned */
        SV.el("path", { d: "M" + bx + "," + (hy + 44) + " q-4,7 0,9 q4,-2 0,-9 Z", fill: "#cfe3f3", stroke: C.glasKant, "stroke-width": 0.9 }, gg);
        return { g: gg, spids: [bx, hy + 34], klemme: ky };
    };

    /* sc7.6's draabeflaske: brun med roed haette og en hvid etiket */
    B6.draabeflaske = function (g, x, y, b, h, etiket) {
        var gg = SV.g(g), cx = x + b / 2;
        SV.el("ellipse", { cx: cx, cy: y + h + 2, rx: b * 0.7, ry: 3.5, fill: "rgba(60,70,80,0.18)" }, gg);
        SV.el("path", { d: "M" + (x + 4) + "," + (y + 16) + " Q" + x + "," + (y + 18) + " " + x + "," + (y + 26) + " L" + x + "," + (y + h - 5) + " Q" + x + "," + (y + h) + " " + (x + 5) + "," + (y + h) +
            " L" + (x + b - 5) + "," + (y + h) + " Q" + (x + b) + "," + (y + h) + " " + (x + b) + "," + (y + h - 5) + " L" + (x + b) + "," + (y + 26) + " Q" + (x + b) + "," + (y + 18) + " " + (x + b - 4) + "," + (y + 16) + " Z",
            fill: "#9a6a3c", stroke: "#5e3d1d", "stroke-width": 1.2 }, gg);
        SV.el("rect", { x: x + 3, y: y + 22, width: 3, height: h - 32, rx: 1.5, fill: "#ffffff", opacity: 0.35 }, gg);
        SV.el("rect", { x: x + 4, y: y + 32, width: b - 8, height: 22, rx: 2, fill: "#ffffff", stroke: "#d8cfc4", "stroke-width": 0.8 }, gg);
        if (etiket) KV.tekst(gg, cx, y + 47, etiket, { fs: 11.5, fed: true, farve: "#3b4650" });
        SV.el("rect", { x: cx - 6, y: y + 6, width: 12, height: 11, fill: "#f2f2f2", stroke: "#8a949e", "stroke-width": 0.9 }, gg);
        SV.el("path", { d: "M" + (cx - 6) + "," + (y + 7) + " L" + (cx - 6) + "," + (y - 10) + " Q" + cx + "," + (y - 19) + " " + (cx + 6) + "," + (y - 10) + " L" + (cx + 6) + "," + (y + 7) + " Z",
            fill: "#c94a3c", stroke: "#8e2d22", "stroke-width": 1 }, gg);
        return gg;
    };

    /* ----- Titrerkurven ----------------------------------------------------- */

    /* b6_ph: pH i en blanding, loest ud af ladningsbalancen ved halvering.
       nSyre er mol svag syre med pKs, nBase mol tilsat staerk base, v liter. */
    B6.ph = function (nSyre, v, nBase, pks) {
        var ca = nSyre / v, na = nBase / v, ka = Math.pow(10, -pks), lav = -1, hoej = 15;
        for (var i = 0; i < 70; i++) {
            var m = (lav + hoej) / 2, h = Math.pow(10, -m);
            var f = h + na - 1e-14 / h - ca * ka / (ka + h);
            if (f > 0) lav = m; else hoej = m;
        }
        return (lav + hoej) / 2;
    };

    /* b6_titrerpunkter: [mL, pH] for en svag syre titreret med en staerk base */
    B6.titrerpunkter = function (vMaks, nSyre, v0, cBase, pks) {
        var vEq = nSyre / cBase * 1000, ud = [], v = 0;
        while (v <= vMaks + 1e-9) {
            ud.push([v, B6.ph(nSyre, v0 + v / 1000, cBase * v / 1000, pks)]);
            v += Math.abs(v - vEq) < 0.6 ? 0.02 : 0.25;
        }
        return ud;
    };
}());

/* =====================================================================
   org.js - tegnehjaelp til kapitel 4: stregformler og zigzagformler

   Kun for dette kapitel (ikke en del af den faelles motor).
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
}());

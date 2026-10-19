/* =====================================================================
   kurve.js - grafen i del 2 og del 3

   Grafen viser to ting, der traekker hver sin vej: arbejdsloesheden
   (blaa linje) og prisstigningerne (roed linje). Begge paa samme skala
   fra lav (nederst) til hoej (oeverst). Over den stiplede graense er for
   hoejt, og det omraade er farvet roedt.

   Del 2 (spil): aar 1-8. Til sidst kommer de stiplede linjer uden staten.
   Statskassen staar til hoejre.

       NK.Kurve.spil({ temps, uden, valg, vist, visUden, kasse, visKasse, naeste })

   Del 3 (historie): 1950-1975. Kurverne er en tegning. De vises til og
   med den situation, eleven er ved, og regeringens valg staar som et
   stempel oeverst i grafen.

       NK.Kurve.historie({ nr, afsloeret, slut })
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var BUND = 344, TRIN = 54, TOP = 40, AKSE = 354;
    function y(niveau) { return BUND - NK.klamp(niveau, 0.15, 5.5) * TRIN; }

    var svg, lag = {};
    var slags = "";

    /* ----- Faelles: aksen, graensen og forklaringen ------------------- */
    function akse(x1) {
        var g = NK.svg("g", { "class": "kv-akser" }, svg);
        NK.svg("rect", { x: 170, y: TOP, width: x1 - 170, height: y(D.GRAENSE) - TOP, "class": "kv-for-hoejt" }, g);
        NK.svg("rect", { x: 170, y: y(D.GRAENSE), width: x1 - 170, height: AKSE - y(D.GRAENSE), "class": "kv-under" }, g);
        NK.svg("line", { x1: 170, y1: y(D.GRAENSE), x2: x1, y2: y(D.GRAENSE), "class": "kv-graense" }, g);
        NK.svg("line", { x1: 170, y1: AKSE, x2: x1, y2: AKSE, "class": "kv-akse" }, g);
        NK.svg("line", { x1: 170, y1: AKSE, x2: 170, y2: TOP - 4, "class": "kv-akse" }, g);
        NK.svg("path", { d: "M163," + (TOP + 4) + " L170," + (TOP - 8) + " L177," + (TOP + 4), "class": "kv-akse-pil" }, g);

        /* Ordene paa den lodrette akse */
        NK.svg("text", { x: 158, y: y(4.4) + 6, "class": "kv-y for-hoejt" }, g, D.TEKST.forHoejt);
        NK.svg("text", { x: 158, y: y(D.GRAENSE) + 6, "class": "kv-y graense" }, g, D.TEKST.graense);
        NK.svg("text", { x: 158, y: y(0.4) + 6, "class": "kv-y" }, g, D.TEKST.lav);

        /* Forklaringen paa linjerne, oeverst */
        var lg = NK.svg("g", { "class": "kv-forklaring" }, svg);
        NK.svg("line", { x1: 180, y1: 18, x2: 208, y2: 18, "class": "kv-linje ledighed" }, lg);
        NK.svg("text", { x: 216, y: 24, "class": "kv-navn ledighed" }, lg, D.TEKST.ledighed);
        NK.svg("line", { x1: 360, y1: 18, x2: 388, y2: 18, "class": "kv-linje priser" }, lg);
        NK.svg("text", { x: 396, y: 24, "class": "kv-navn priser" }, lg, D.TEKST.priser);
        lag.udenForklaring = NK.svg("g", { visibility: "hidden" }, lg);
        NK.svg("line", { x1: 552, y1: 18, x2: 580, y2: 18, "class": "kv-uden" }, lag.udenForklaring);
        NK.svg("text", { x: 588, y: 24, "class": "kv-lille" }, lag.udenForklaring, D.TEKST.uden);
    }

    function byg(beholder, s) {
        svg = beholder;
        slags = s;
        svg.innerHTML = "";
        lag = {};
        if (s === "spil") bygSpil(); else bygHistorie();
    }

    function punkter(liste) {
        return liste.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ");
    }

    /* ================================================================
       DEL 2: SPILLET
       ================================================================ */
    var X0 = 205, X1 = 860;
    function xAar(i) { return X0 + i * (X1 - X0) / 8; }

    function bygSpil() {
        akse(885);

        /* Aarene paa aksen. Bag hvert aar en lille plade, der faar valgets farve */
        lag.aar = [];
        for (var i = 0; i <= 8; i++) {
            var g = NK.svg("g", { "class": "kv-aar" }, svg);
            var plade = NK.svg("rect", { x: xAar(i) - 25, y: 360, width: 50, height: 21, rx: 5, "class": "kv-aarplade" }, g);
            var t = NK.svg("text", { x: xAar(i), y: 376, "class": "kv-aartekst" }, g, i === 0 ? "Start" : "År " + i);
            lag.aar.push({ plade: plade, tekst: t });
        }

        lag.udenL = NK.svg("polyline", { "class": "kv-uden ledighed", points: "" }, svg);
        lag.udenP = NK.svg("polyline", { "class": "kv-uden priser", points: "" }, svg);
        lag.medL = NK.svg("polyline", { "class": "kv-linje ledighed", points: "" }, svg);
        lag.medP = NK.svg("polyline", { "class": "kv-linje priser", points: "" }, svg);
        lag.prikker = NK.svg("g", null, svg);

        /* Statskassen: en lodret soejle. Overskud op, underskud ned. */
        var k = NK.svg("g", { "class": "kv-kasse" }, svg);
        NK.svg("text", { x: 945, y: 34, "class": "kv-kasse-navn" }, k, "Statskassen");
        NK.svg("text", { x: 945, y: 62, "class": "kv-lille midt" }, k, "overskud");
        NK.svg("rect", { x: 931, y: 70, width: 28, height: 262, rx: 6, "class": "kv-kasse-spor" }, k);
        NK.svg("line", { x1: 925, y1: 201, x2: 965, y2: 201, "class": "kv-kasse-nul" }, k);
        lag.kasseFyld = NK.svg("rect", { x: 934, y: 201, width: 22, height: 0, rx: 3 }, k);
        NK.svg("text", { x: 945, y: 354, "class": "kv-lille midt" }, k, "underskud");
        lag.kasse = k;
    }

    function spil(o) {
        var M = NK.Model;
        var vist = o.vist;
        var pl = [], pp = [], ul = [], up = [];
        for (var i = 0; i <= vist; i++) {
            pl.push([xAar(i), y(M.ledighed(o.temps[i]))]);
            pp.push([xAar(i), y(M.priser(o.temps[i]))]);
        }
        if (o.visUden) {
            for (var j = 0; j <= 8; j++) {
                ul.push([xAar(j), y(M.ledighed(o.uden[j]))]);
                up.push([xAar(j), y(M.priser(o.uden[j]))]);
            }
        }
        lag.medL.setAttribute("points", punkter(pl));
        lag.medP.setAttribute("points", punkter(pp));
        lag.udenL.setAttribute("points", punkter(ul));
        lag.udenP.setAttribute("points", punkter(up));
        lag.udenForklaring.setAttribute("visibility", o.visUden ? "visible" : "hidden");

        lag.prikker.innerHTML = "";
        for (var n = 0; n <= vist; n++) {
            var l = M.ledighed(o.temps[n]), p = M.priser(o.temps[n]);
            NK.svg("circle", { cx: xAar(n), cy: y(l), r: n === vist ? 8 : 6, "class": "kv-prik ledighed" + (l > D.GRAENSE ? " over" : "") }, lag.prikker);
            NK.svg("circle", { cx: xAar(n), cy: y(p), r: n === vist ? 8 : 6, "class": "kv-prik priser" + (p > D.GRAENSE ? " over" : "") }, lag.prikker);
        }

        lag.aar.forEach(function (a, k) {
            var v = k > 0 ? o.valg[k - 1] : null;
            var naeste = o.naeste === k;
            a.plade.setAttribute("class", "kv-aarplade" + (v ? " " + v : "") + (naeste ? " nu" : ""));
            a.tekst.setAttribute("class", "kv-aartekst" + (v ? " valgt" : "") + (naeste ? " nu" : ""));
        });

        lag.kasse.setAttribute("visibility", o.visKasse ? "visible" : "hidden");
        var v2 = NK.klamp(o.kasse, -4, 4) * 32;
        lag.kasseFyld.setAttribute("y", v2 >= 0 ? 201 - v2 : 201);
        lag.kasseFyld.setAttribute("height", Math.abs(v2));
        lag.kasseFyld.setAttribute("class", "kv-kasse-fyld " + (o.kasse >= 0 ? "over" : "under"));
    }

    /* ================================================================
       DEL 3: DANMARK 1950-1975
       ================================================================ */
    var H0 = 205, H1 = 880;
    function xHist(aar) { return H0 + (aar - 1950) * (H1 - H0) / 25; }

    function bygHistorie() {
        akse(905);
        for (var a = 1950; a <= 1975; a += 5) {
            NK.svg("line", { x1: xHist(a), y1: AKSE, x2: xHist(a), y2: AKSE + 7, "class": "kv-akse" }, svg);
            NK.svg("text", { x: xHist(a), y: 377, "class": "kv-aartekst" }, svg, String(a));
        }
        NK.svg("text", { x: H0 + 6, y: AKSE - 10, "class": "kv-lille" }, svg, D.TEKST.kurveNote);

        lag.hjaelpelinje = NK.svg("line", { "class": "kv-hjaelpelinje", visibility: "hidden" }, svg);
        lag.ledighed = NK.svg("path", { "class": "kv-linje ledighed", d: "" }, svg);
        lag.priser = NK.svg("path", { "class": "kv-linje priser", d: "" }, svg);
        lag.punkter = NK.svg("g", null, svg);
        lag.stempler = NK.svg("g", null, svg);
    }

    /* En bloed kurve gennem punkterne (Catmull-Rom som Bezier) */
    function bloed(p) {
        if (p.length < 2) return "";
        var d = "M" + p[0][0].toFixed(1) + "," + p[0][1].toFixed(1);
        for (var i = 0; i < p.length - 1; i++) {
            var a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], e = p[Math.min(p.length - 1, i + 2)];
            var c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
            var c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
            d += " C" + c1[0].toFixed(1) + "," + c1[1].toFixed(1) + " " + c2[0].toFixed(1) + "," + c2[1].toFixed(1) + " " + c[0].toFixed(1) + "," + c[1].toFixed(1);
        }
        return d;
    }

    /* Vaerdien i et aar (lige linje mellem to punkter) */
    function vaerdi(serie, aar) {
        for (var i = 0; i < serie.length - 1; i++) {
            var a = serie[i], b = serie[i + 1];
            if (aar >= a[0] && aar <= b[0]) return a[1] + (b[1] - a[1]) * (aar - a[0]) / (b[0] - a[0]);
        }
        return serie[serie.length - 1][1];
    }

    function stiTil(serie, aar) {
        var p = [];
        for (var i = 0; i < serie.length; i++) {
            if (serie[i][0] <= aar) p.push([xHist(serie[i][0]), y(serie[i][1])]);
            else {
                if (aar > serie[i - 1][0]) p.push([xHist(aar), y(vaerdi(serie, aar))]);
                break;
            }
        }
        return p;
    }

    var RAEKKE_Y = [58, 94];

    function stempel(x, yy, tekst, ny) {
        var g = NK.svg("g", { "class": "kv-stempel" + (ny ? " ny" : "") }, lag.stempler);
        var b = tekst.length * 9.6 + 22;
        var cx = NK.klamp(x, 172 + b / 2, 903 - b / 2);
        NK.svg("rect", { x: cx - b / 2, y: yy - 14, width: b, height: 28, rx: 4 }, g);
        NK.svg("text", { x: cx, y: yy + 6 }, g, tekst);
        g.setAttribute("transform", "rotate(-1.5 " + cx + " " + yy + ")");
    }

    /* nr: den situation, eleven er ved (0-3). afsloeret: hvor mange
       situationer der har faaet regeringens stempel. slut: hele kurven. */
    function historie(o) {
        var S = D.SITUATIONER, H = D.HISTORIE;
        var nr = o.slut ? S.length - 1 : o.nr;
        var til = o.slut ? 1975 : S[nr].aar;
        lag.ledighed.setAttribute("d", bloed(stiTil(H.ledighed, til)));
        lag.priser.setAttribute("d", bloed(stiTil(H.priser, til)));

        /* En stiplet lodret linje fra aaret op til regeringens stempel */
        var hj = lag.hjaelpelinje;
        if (o.slut) hj.setAttribute("visibility", "hidden");
        else {
            var xx = xHist(S[nr].aar);
            hj.setAttribute("x1", xx); hj.setAttribute("x2", xx);
            hj.setAttribute("y1", AKSE); hj.setAttribute("y2", RAEKKE_Y[S[nr].raekke] + 16);
            hj.setAttribute("visibility", nr < o.afsloeret ? "visible" : "hidden");
        }

        lag.punkter.innerHTML = "";
        lag.stempler.innerHTML = "";
        for (var i = 0; i <= nr; i++) {
            var s = S[i];
            var nu = !o.slut && i === nr;
            ["ledighed", "priser"].forEach(function (navn) {
                var v = vaerdi(H[navn], s.aar);
                var fokus = nu && s.fokus.indexOf(navn) >= 0;
                NK.svg("circle", { cx: xHist(s.aar), cy: y(v), r: nu ? 8 : 6, "class": "kv-prik " + navn + (v > D.GRAENSE ? " over" : "") }, lag.punkter);
                if (fokus) NK.svg("circle", { cx: xHist(s.aar), cy: y(v), r: 16, "class": "kv-ring" }, lag.punkter);
            });
            if (i < o.afsloeret) stempel(xHist(s.aar), RAEKKE_Y[s.raekke], s.stempel || s.regeringen, i === o.afsloeret - 1 && !o.slut);
        }
    }

    NK.Kurve = {
        byg: byg,
        spil: spil,
        historie: historie,
        slags: function () { return slags; },
        y: y,
        xAar: xAar,
        xHist: xHist,
        vaerdi: vaerdi
    };
}());

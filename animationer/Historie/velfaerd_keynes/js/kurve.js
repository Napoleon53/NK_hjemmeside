/* =====================================================================
   kurve.js - kurven i del 2 og del 3

   Begge dele tegner oekonomiens "temperatur" som en kurve gennem tre
   baand: for varm (priserne stiger), balance og for kold (arbejdsloeshed).

   Del 2 (spil): aar 1-8. Den hvide kurve er elevens, den stiplede er
   oekonomien uden staten. Statskassen staar til hoejre.

       NK.Kurve.spil({ med, uden, valg, vist, kasse, venter })

   Del 3 (historie): 1950-1975. Kurven er en tegning af de gode og
   daarlige tider. Den vises til og med den situation, eleven er ved, og
   regeringens valg staar som et stempel ved punktet.

       NK.Kurve.historie({ nr, afsloeret, slut })
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var TRIN = 52;
    function y(t) { return 200 - t * TRIN; }

    var svg, lag = {};
    var slags = "";

    /* ----- Faelles: baandene og ordene til venstre --------------------- */
    function baand(x1) {
        var g = NK.svg("g", { "class": "kv-baand" }, svg);
        NK.svg("rect", { x: 170, y: 18, width: x1 - 170, height: y(1.5) - 18, "class": "kv-varm" }, g);
        NK.svg("rect", { x: 170, y: y(1.5), width: x1 - 170, height: y(-1.5) - y(1.5), "class": "kv-balance" }, g);
        NK.svg("rect", { x: 170, y: y(-1.5), width: x1 - 170, height: 378 - y(-1.5), "class": "kv-kold" }, g);
        NK.svg("line", { x1: 170, y1: 378, x2: x1, y2: 378, "class": "kv-akse" }, g);

        NK.svg("text", { x: 16, y: 62, "class": "kv-zone varm" }, g, "For varm");
        NK.svg("text", { x: 16, y: 86, "class": "kv-zone-lille" }, g, "priserne stiger");
        NK.svg("text", { x: 16, y: 206, "class": "kv-zone balance" }, g, "Balance");
        NK.svg("text", { x: 16, y: 322, "class": "kv-zone kold" }, g, "For kold");
        NK.svg("text", { x: 16, y: 346, "class": "kv-zone-lille" }, g, "arbejdsløshed");
    }

    function byg(beholder, s) {
        svg = beholder;
        slags = s;
        svg.innerHTML = "";
        lag = {};
        if (s === "spil") bygSpil(); else bygHistorie();
    }

    /* ================================================================
       DEL 2: SPILLET
       ================================================================ */
    var X0 = 205, X1 = 860;
    function xAar(i) { return X0 + i * (X1 - X0) / 8; }

    function bygSpil() {
        baand(885);

        /* Aarene paa aksen. Bag hvert aar en lille plade, der faar valgets farve */
        lag.aar = [];
        for (var i = 0; i <= 8; i++) {
            var g = NK.svg("g", { "class": "kv-aar" }, svg);
            var plade = NK.svg("rect", { x: xAar(i) - 25, y: 380, width: 50, height: 20, rx: 5, "class": "kv-aarplade" }, g);
            var t = NK.svg("text", { x: xAar(i), y: 396, "class": "kv-aartekst" }, g, i === 0 ? "Start" : "År " + i);
            lag.aar.push({ plade: plade, tekst: t });
        }

        /* Forklaringen paa de to kurver, oeverst til hoejre */
        var lg = NK.svg("g", { "class": "kv-forklaring" }, svg);
        NK.svg("line", { x1: 560, y1: 30, x2: 590, y2: 30, "class": "kv-med" }, lg);
        NK.svg("text", { x: 598, y: 36, "class": "kv-lille" }, lg, D.TEKST.med);
        NK.svg("line", { x1: 690, y1: 30, x2: 720, y2: 30, "class": "kv-uden" }, lg);
        NK.svg("text", { x: 728, y: 36, "class": "kv-lille" }, lg, D.TEKST.uden);
        lag.forklaring = lg;

        lag.uden = NK.svg("polyline", { "class": "kv-uden", points: "" }, svg);
        lag.udenPrikker = NK.svg("g", null, svg);
        lag.med = NK.svg("polyline", { "class": "kv-med", points: "" }, svg);
        lag.prikker = NK.svg("g", null, svg);
        lag.ring = NK.svg("circle", { r: 17, "class": "kv-ring", visibility: "hidden" }, svg);

        /* Statskassen: en lodret soejle. Overskud op, underskud ned. */
        var k = NK.svg("g", { "class": "kv-kasse" }, svg);
        NK.svg("text", { x: 942, y: 30, "class": "kv-kasse-navn" }, k, "Statskassen");
        NK.svg("text", { x: 942, y: 56, "class": "kv-lille midt" }, k, "overskud");
        NK.svg("rect", { x: 928, y: 64, width: 28, height: 272, rx: 6, "class": "kv-kasse-spor" }, k);
        NK.svg("line", { x1: 922, y1: 200, x2: 962, y2: 200, "class": "kv-kasse-nul" }, k);
        lag.kasseFyld = NK.svg("rect", { x: 931, y: 200, width: 22, height: 0, rx: 3 }, k);
        NK.svg("text", { x: 942, y: 360, "class": "kv-lille midt" }, k, "underskud");
        lag.kasse = k;
    }

    /* med og uden er lister med temperaturer fra start (indeks 0) og
       frem. vist er det sidste aar, der er tegnet. valg[i] er valget i
       aar i+1 ("gas", "ingen" eller "brems"). kasse er statskassen (gas
       -1, brems +1). venter: punktet for vist har en gul ring. */
    function spil(o) {
        var med = o.med, uden = o.uden, vist = o.vist;
        var pm = [], pu = [];
        lag.prikker.innerHTML = "";
        lag.udenPrikker.innerHTML = "";
        for (var i = 0; i <= vist; i++) {
            pm.push(xAar(i) + "," + y(med[i]));
            if (i > 0 && o.udenVist >= i) pu.push(xAar(i) + "," + y(uden[i]));
        }
        if (pu.length) pu.unshift(xAar(0) + "," + y(uden[0]));
        lag.med.setAttribute("points", pm.join(" "));
        lag.uden.setAttribute("points", pu.join(" "));
        for (var j = 0; j <= vist; j++) {
            NK.svg("circle", { cx: xAar(j), cy: y(med[j]), r: j === vist ? 10 : 7, "class": "kv-prik " + NK.Model.zone(med[j]) + (j === vist ? " nu" : "") }, lag.prikker);
            if (j > 0 && o.udenVist >= j) NK.svg("circle", { cx: xAar(j), cy: y(uden[j]), r: 4.5, "class": "kv-uprik" }, lag.udenPrikker);
        }
        lag.ring.setAttribute("cx", xAar(vist));
        lag.ring.setAttribute("cy", y(med[vist]));
        lag.ring.setAttribute("visibility", o.venter ? "visible" : "hidden");

        lag.aar.forEach(function (a, n) {
            var v = n > 0 ? o.valg[n - 1] : null;
            a.plade.setAttribute("class", "kv-aarplade" + (v ? " " + v : "") + (n === vist && o.venter ? " nu" : ""));
            a.tekst.setAttribute("class", "kv-aartekst" + (v ? " valgt" : "") + (n === vist && o.venter ? " nu" : ""));
        });

        lag.forklaring.setAttribute("visibility", o.udenVist > 0 ? "visible" : "hidden");
        lag.kasse.setAttribute("visibility", o.visKasse ? "visible" : "hidden");
        var v2 = NK.klamp(o.kasse, -4, 4) * 33;
        lag.kasseFyld.setAttribute("y", v2 >= 0 ? 200 - v2 : 200);
        lag.kasseFyld.setAttribute("height", Math.abs(v2));
        lag.kasseFyld.setAttribute("class", "kv-kasse-fyld " + (o.kasse >= 0 ? "over" : "under"));
    }

    /* ================================================================
       DEL 3: DANMARK 1950-1975
       ================================================================ */
    var H0 = 205, H1 = 880;
    function xHist(aar) { return H0 + (aar - 1950) * (H1 - H0) / 25; }

    function bygHistorie() {
        baand(905);
        for (var a = 1950; a <= 1975; a += 5) {
            NK.svg("line", { x1: xHist(a), y1: 374, x2: xHist(a), y2: 382, "class": "kv-akse" }, svg);
            NK.svg("text", { x: xHist(a), y: 397, "class": "kv-aartekst" }, svg, String(a));
        }
        NK.svg("text", { x: H0 + 6, y: 370, "class": "kv-lille" }, svg, D.TEKST.kurveNote);

        lag.sti = NK.svg("path", { "class": "kv-historie", d: "" }, svg);
        lag.priser = NK.svg("path", { "class": "kv-historie varm", d: "" }, svg);
        lag.job = NK.svg("path", { "class": "kv-historie kold", d: "" }, svg);
        lag.splitTekst = NK.svg("g", { visibility: "hidden" }, svg);
        NK.svg("text", { x: H1 - 52, y: y(D.SPLIT.priser[1]) - 2, "class": "kv-split varm" }, lag.splitTekst, "priserne stiger");
        NK.svg("text", { x: H1 - 52, y: y(D.SPLIT.job[1]) + 6, "class": "kv-split kold" }, lag.splitTekst, "arbejdsløsheden stiger");
        lag.punkter = NK.svg("g", null, svg);
        lag.stempler = NK.svg("g", null, svg);
    }

    /* En blød kurve gennem punkterne (Catmull-Rom som Bezier) */
    function blød(p) {
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

    /* Kurven til og med et aar. Mellem to punkter regnes der lige ud. */
    function stiTil(aar) {
        var p = [];
        var H = D.HISTORIE;
        for (var i = 0; i < H.length; i++) {
            if (H[i][0] <= aar) p.push([xHist(H[i][0]), y(H[i][1])]);
            else {
                var a = H[i - 1], b = H[i], f = (aar - a[0]) / (b[0] - a[0]);
                if (f > 0) p.push([xHist(aar), y(a[1] + (b[1] - a[1]) * f)]);
                break;
            }
        }
        return p;
    }

    function stempel(x, yy, tekst, aktiv) {
        var g = NK.svg("g", { "class": "kv-stempel" + (aktiv ? " ny" : "") }, lag.stempler);
        var b = tekst.length * 9.6 + 22;
        var cx = NK.klamp(x, 170 + b / 2, 905 - b / 2);
        NK.svg("rect", { x: cx - b / 2, y: yy - 15, width: b, height: 28, rx: 4 }, g);
        NK.svg("text", { x: cx, y: yy + 5 }, g, tekst);
        g.setAttribute("transform", "rotate(-2 " + cx + " " + yy + ")");
    }

    /* nr: den situation, eleven er ved (0-3). afsloeret: hvor mange
       situationer der har faaet regeringens stempel. slut: hele kurven. */
    function historie(o) {
        var S = D.SITUATIONER;
        var nr = o.slut ? S.length - 1 : o.nr;
        var aar = S[nr].aar;
        var split = aar >= 1974;
        lag.sti.setAttribute("d", blød(stiTil(split ? D.SPLIT.fra[0] : aar)));

        var f = D.SPLIT.fra, pr = D.SPLIT.priser, jb = D.SPLIT.job;
        lag.priser.setAttribute("d", split ? "M" + xHist(f[0]) + "," + y(f[1]) + " L" + xHist(pr[0]) + "," + y(pr[1]) + " L" + xHist(1975) + "," + y(pr[1] + 0.1) : "");
        lag.job.setAttribute("d", split ? "M" + xHist(f[0]) + "," + y(f[1]) + " L" + xHist(jb[0]) + "," + y(jb[1]) + " L" + xHist(1975) + "," + y(jb[1] - 0.15) : "");
        lag.splitTekst.setAttribute("visibility", split ? "visible" : "hidden");

        lag.punkter.innerHTML = "";
        lag.stempler.innerHTML = "";
        for (var i = 0; i <= nr; i++) {
            var s = S[i];
            var nu = !o.slut && i === nr;
            var punkter = s.temp === null ? [pr[1], jb[1]] : [s.temp];
            punkter.forEach(function (t) {
                NK.svg("circle", { cx: xHist(s.aar), cy: y(t), r: nu ? 10 : 8, "class": "kv-prik " + NK.Model.zone(t) + (nu ? " nu" : "") }, lag.punkter);
                if (nu) NK.svg("circle", { cx: xHist(s.aar), cy: y(t), r: 17, "class": "kv-ring" }, lag.punkter);
            });
            /* Maerket staar under eller til venstre for punktet, saa kurven ikke krydser det */
            if (s.maerke) {
                var venstre = s.placering.maerke === "venstre";
                NK.svg("text", { x: xHist(s.aar) + (venstre ? -18 : 0), y: y(s.temp) + (venstre ? 6 : 32), "class": "kv-maerke" + (venstre ? " venstre" : "") + (nu ? " nu" : "") }, lag.punkter, s.maerke);
            }
            if (i < o.afsloeret) {
                var yy = (s.temp === null ? 0 : y(s.temp)) + s.placering.dy;
                stempel(xHist(s.aar) + s.placering.dx, s.temp === null ? y(0) : yy, s.stempel || s.regeringen, i === o.afsloeret - 1 && !o.slut);
            }
        }
    }

    NK.Kurve = {
        byg: byg,
        spil: spil,
        historie: historie,
        slags: function () { return slags; },
        y: y,
        xAar: xAar,
        xHist: xHist
    };
}());

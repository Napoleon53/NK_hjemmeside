/* =====================================================================
   molekyler.js - molekylernes form som flade kuglemodeller

   NK.Mol.form(smiles) bygger et molekyle ud fra skelettet med C og O,
   fx "CCO" (ethanol) og "CC(O)C" (propan-2-ol), og saetter selv
   H-atomerne paa, saa C har fire bindinger og O to. Kaeden laegges i
   zigzag med 120° mellem bindingerne, som i bogens tegninger.

   Hvert atom faar:
     e      grundstoffet ("C", "O" eller "H")
     x, y   pladsen i forhold til molekylets tyngdepunkt (modellens enheder,
            1 = en C-C-binding)
     r      kuglens radius paa tegningen
     rho    radius, naar to molekyler stoder sammen
     m      massen (u)
     donor  H paa O: kan danne en hydrogenbinding
     acc    O: tager imod hydrogenbindinger med sine frie elektronpar
     tung   C eller O
   Formen huskes, saa hvert stof kun bygges én gang.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var BINDING = { CC: 1.0, CO: 1.0, OC: 1.0, CH: 0.74, OH: 0.70 };
    var ATOM = {
        C: { r: 0.48, rho: 0.60, m: 12.011 },
        O: { r: 0.50, rho: 0.58, m: 15.999 },
        H: { r: 0.30, rho: 0.36, m: 1.008 }
    };
    var VALENS = { C: 4, O: 2 };
    var GRAD = Math.PI / 180;

    function drej(u, v) {
        var c = Math.cos(v), s = Math.sin(v);
        return { x: u.x * c - u.y * s, y: u.x * s + u.y * c };
    }

    function vinkel(u) { return Math.atan2(u.y, u.x); }

    /* Skelettet: atomerne i raekkefoelge med forælder og boern. Det sidste
       barn er kaedens fortsaettelse, de andre er sidegrene. */
    function laesSkelet(smiles) {
        var atomer = [], stak = [], forrige = -1;
        for (var i = 0; i < smiles.length; i++) {
            var c = smiles.charAt(i);
            if (c === "(") { stak.push(forrige); continue; }
            if (c === ")") { forrige = stak.pop(); continue; }
            if (c !== "C" && c !== "O") throw new Error("NK.Mol: ukendt tegn " + c);
            var a = { e: c, far: forrige, boern: [] };
            atomer.push(a);
            if (forrige >= 0) atomer[forrige].boern.push(atomer.length - 1);
            forrige = atomer.length - 1;
        }
        return atomer;
    }

    function byg(smiles) {
        var sk = laesSkelet(smiles);
        var pos = [], ind = [], par = [];
        /* Roden kommer "fra venstre", saa kaeden gaar mod hoejre i zigzag */
        pos[0] = { x: 0, y: 0 };
        ind[0] = drej({ x: 1, y: 0 }, 30 * GRAD);
        par[0] = -1;
        var koe = [0];
        while (koe.length) {
            var i = koe.shift(), a = sk[i], u = ind[i], s = par[i];
            var b = a.boern, k = b.length;
            var retninger = [];
            if (k === 1) retninger = [drej(u, s * 60 * GRAD)];
            else if (k === 2) retninger = [drej(u, -s * 60 * GRAD), drej(u, s * 60 * GRAD)];
            else if (k === 3) retninger = [drej(u, -90 * GRAD), drej(u, 90 * GRAD), u];
            b.forEach(function (j, n) {
                var d = retninger[n];
                var l = BINDING[a.e + sk[j].e];
                pos[j] = { x: pos[i].x + d.x * l, y: pos[i].y + d.y * l };
                ind[j] = d;
                /* Kaeden skifter side hver gang; en sidegren fortsaetter vaek */
                par[j] = n === k - 1 ? -s : s;
                koe.push(j);
            });
        }

        var atomer = sk.map(function (a, i) {
            return { e: a.e, x: pos[i].x, y: pos[i].y, tung: true, acc: a.e === "O", donor: false, paa: -1 };
        });
        var bindinger = [];
        sk.forEach(function (a, i) { a.boern.forEach(function (j) { bindinger.push([i, j]); }); });

        /* H-atomerne */
        sk.forEach(function (a, i) {
            var nabo = [];
            if (a.far >= 0) nabo.push(vinkel({ x: pos[a.far].x - pos[i].x, y: pos[a.far].y - pos[i].y }));
            a.boern.forEach(function (j) { nabo.push(vinkel({ x: pos[j].x - pos[i].x, y: pos[j].y - pos[i].y })); });
            var nH = VALENS[a.e] - nabo.length;
            if (nH <= 0) return;
            var vinkler = [];
            if (!nabo.length) {
                vinkler = [45, 135, 225, 315].map(function (v) { return v * GRAD; });
            } else if (a.e === "O" && a.far < 0) {
                /* O forrest i kaeden: H sidder, hvor et atom foer det ville sidde */
                vinkler = [vinkel({ x: -ind[i].x, y: -ind[i].y })];
            } else if (a.e === "O") {
                /* H paa O fortsaetter zigzaggen, som et atom mere i kaeden */
                vinkler = [vinkel(drej(ind[i], par[i] * 70 * GRAD))];
            } else if (nabo.length === 1) {
                var d = nabo[0];
                vinkler = [d + Math.PI, d + 112 * GRAD, d - 112 * GRAD];
            } else {
                /* Midt i det stoerste hul mellem naboerne */
                var sort = nabo.slice().sort(function (p, q) { return p - q; });
                var bedst = 0, midt = 0;
                for (var n = 0; n < sort.length; n++) {
                    var v0 = sort[n], v1 = n + 1 < sort.length ? sort[n + 1] : sort[0] + 2 * Math.PI;
                    if (v1 - v0 > bedst) { bedst = v1 - v0; midt = (v0 + v1) / 2; }
                }
                if (nH === 1) vinkler = [midt];
                else vinkler = [midt - 34 * GRAD, midt + 34 * GRAD];
            }
            vinkler.slice(0, nH).forEach(function (v) {
                var l = BINDING[a.e + "H"];
                atomer.push({ e: "H", x: pos[i].x + Math.cos(v) * l, y: pos[i].y + Math.sin(v) * l,
                    tung: false, acc: false, donor: a.e === "O", paa: i });
                bindinger.push([i, atomer.length - 1]);
            });
        });

        /* Egenskaberne og tyngdepunktet */
        var mx = 0, my = 0, M = 0;
        atomer.forEach(function (a) {
            var p = ATOM[a.e];
            a.r = p.r; a.rho = p.rho; a.m = p.m;
            mx += a.x * a.m; my += a.y * a.m; M += a.m;
        });
        mx /= M; my /= M;
        var I = 0, R = 0;
        atomer.forEach(function (a) {
            a.x -= mx; a.y -= my;
            I += a.m * (a.x * a.x + a.y * a.y);
            R = Math.max(R, Math.sqrt(a.x * a.x + a.y * a.y) + a.rho);
        });
        /* Raekkefoelgen paa tegningen: H paa C, saa C og O, til sidst H paa O */
        var orden = [];
        atomer.forEach(function (a, i) { if (a.e === "H" && !a.donor) orden.push(i); });
        atomer.forEach(function (a, i) { if (a.tung) orden.push(i); });
        atomer.forEach(function (a, i) { if (a.donor) orden.push(i); });

        return {
            smiles: smiles, atomer: atomer, bindinger: bindinger, orden: orden,
            M: M, I: I, R: R,
            donorer: atomer.map(function (a, i) { return a.donor ? i : -1; }).filter(function (i) { return i >= 0; }),
            acceptorer: atomer.map(function (a, i) { return a.acc ? i : -1; }).filter(function (i) { return i >= 0; }),
            kulstof: atomer.map(function (a, i) { return a.e === "C" ? i : -1; }).filter(function (i) { return i >= 0; })
        };
    }

    var lager = {};
    function form(smiles) {
        if (!lager[smiles]) lager[smiles] = byg(smiles);
        return lager[smiles];
    }

    /* Kassen om formen, drejet vinklen a: til layout af kortene */
    function kasse(f, a) {
        var c = Math.cos(a || 0), s = Math.sin(a || 0);
        var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        f.atomer.forEach(function (p) {
            var x = p.x * c - p.y * s, y = p.x * s + p.y * c;
            x0 = Math.min(x0, x - p.r); x1 = Math.max(x1, x + p.r);
            y0 = Math.min(y0, y - p.r); y1 = Math.max(y1, y + p.r);
        });
        return { x0: x0, y0: y0, b: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
    }

    NK.Mol = { form: form, kasse: kasse, ATOM: ATOM, BINDING: BINDING };
}());

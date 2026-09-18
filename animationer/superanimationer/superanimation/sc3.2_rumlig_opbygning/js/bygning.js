/* =====================================================================
   bygning.js - fane 1: et lille molekyle bygget af C, N, O og Cl

   Eleven vaelger de tunge atomer og bindingerne mellem dem. Hydrogen og
   frie elektronpar kommer selv: et atom faar saa mange H, at det har sit
   normale antal bindinger (C 4, N 3, O 2, Cl 1), og resten af valens-
   elektronerne bliver frie elektronpar.

   En struktur er { atomer: [{ id, el }], bindinger: [{ a, b, orden }],
   naesteId }. Et nyt atom saettes altid paa et atom, der findes, saa
   strukturen er et trae uden ringe.

   Geometrien bygges atom for atom ud fra det foerste. Omkring hvert atom
   finder bindinger og frie par deres plads med samme frastoedning som
   paa fane 2 (frastoedning.js). Drejningen om en enkeltbinding vaelges,
   saa atomerne staar forskudt; ved en dobbeltbinding ligger begge ender
   i samme plan.

   Funktionerne bruger ikke canvas og kan testes i _selvtest.html.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var V = NK.V;
    var D = NK.Data;

    var B = {};
    NK.Bygning = B;

    B.VALENS = { C: 4, N: 3, O: 2, Cl: 1 };
    B.GRUNDSTOFFER = ["C", "N", "O", "Cl"];
    B.MAKS_C = 2;
    B.MAKS_ATOMER = 5;

    /* Kovalente radier for enkelt-, dobbelt- og tripelbinding (ångstrøm). */
    var RADIUS = { H: [0.32, 0.32, 0.32], C: [0.76, 0.67, 0.6], N: [0.71, 0.6, 0.54], O: [0.66, 0.57, 0.53], Cl: [0.99, 0.95, 0.93] };

    B.laengde = function (elA, elB, orden) {
        return RADIUS[elA][orden - 1] + RADIUS[elB][orden - 1];
    };

    /* ----- Strukturen ----------------------------------------------------- */
    B.ny = function () {
        return { atomer: [], bindinger: [], naesteId: 1 };
    };

    B.kopi = function (s) {
        return JSON.parse(JSON.stringify(s));
    };

    B.atom = function (s, id) {
        for (var i = 0; i < s.atomer.length; i++) if (s.atomer[i].id === id) return s.atomer[i];
        return null;
    };

    B.binding = function (s, a, b) {
        for (var i = 0; i < s.bindinger.length; i++) {
            var bd = s.bindinger[i];
            if ((bd.a === a && bd.b === b) || (bd.a === b && bd.b === a)) return bd;
        }
        return null;
    };

    B.bindingssum = function (s, id) {
        return s.bindinger.reduce(function (sum, bd) { return sum + (bd.a === id || bd.b === id ? bd.orden : 0); }, 0);
    };

    /* Antal bindinger, atomet har tilbage. Det er ogsaa antallet af H. */
    B.fri = function (s, id) {
        var a = B.atom(s, id);
        return a ? B.VALENS[a.el] - B.bindingssum(s, id) : 0;
    };

    B.antal = function (s, el) {
        return s.atomer.filter(function (a) { return a.el === el; }).length;
    };

    function atomnavn(el) {
        var n = D.GRUNDSTOFFER[el].navn;
        return n.charAt(0).toUpperCase() + n.slice(1) + "atomet";
    }

    /* true, eller en kort forklaring paa, hvorfor det ikke kan lade sig goere. */
    B.kanTilfoeje = function (s, id, el) {
        if (!s.atomer.length) return true;
        if (s.atomer.length >= B.MAKS_ATOMER) return "Der kan højst være " + B.MAKS_ATOMER + " atomer ud over hydrogen.";
        if (el === "C" && B.antal(s, "C") >= B.MAKS_C) return "Der kan højst være to carbonatomer.";
        var a = B.atom(s, id);
        if (!a) return "Klik først på det atom, det nye atom skal sidde på.";
        if (B.fri(s, id) < 1) return atomnavn(a.el) + " har ikke plads til flere bindinger.";
        return true;
    };

    B.tilfoej = function (s, id, el) {
        if (B.kanTilfoeje(s, id, el) !== true) return null;
        var nyt = { id: s.naesteId++, el: el };
        if (s.atomer.length) s.bindinger.push({ a: id, b: nyt.id, orden: 1 });
        s.atomer.push(nyt);
        return nyt.id;
    };

    /* Fjerner et atom. Falder molekylet fra hinanden, beholdes den stoerste del. */
    B.fjern = function (s, id) {
        s.atomer = s.atomer.filter(function (a) { return a.id !== id; });
        s.bindinger = s.bindinger.filter(function (bd) { return bd.a !== id && bd.b !== id; });
        var set = {}, bedst = [];
        s.atomer.forEach(function (start) {
            if (set[start.id]) return;
            var del = [], ko = [start.id];
            set[start.id] = true;
            while (ko.length) {
                var x = ko.shift();
                del.push(x);
                s.bindinger.forEach(function (bd) {
                    var y = bd.a === x ? bd.b : bd.b === x ? bd.a : null;
                    if (y !== null && !set[y]) { set[y] = true; ko.push(y); }
                });
            }
            if (del.length > bedst.length) bedst = del;
        });
        s.atomer = s.atomer.filter(function (a) { return bedst.indexOf(a.id) >= 0; });
        s.bindinger = s.bindinger.filter(function (bd) { return bedst.indexOf(bd.a) >= 0; });
    };

    /* De bindingsordener, bindingen a-b kan have uden at noget atom faar for mange. */
    B.muligeOrdener = function (s, a, b) {
        var bd = B.binding(s, a, b);
        if (!bd) return [];
        var ud = [];
        for (var o = 1; o <= 3; o++) {
            var ekstra = o - bd.orden;
            if (B.fri(s, a) >= ekstra && B.fri(s, b) >= ekstra) ud.push(o);
        }
        return ud;
    };

    B.saetOrden = function (s, a, b, orden) {
        if (B.muligeOrdener(s, a, b).indexOf(orden) < 0) return false;
        B.binding(s, a, b).orden = orden;
        return true;
    };

    /* Enkelt -> dobbelt -> tripel -> enkelt, men kun de mulige. */
    B.naesteOrden = function (s, a, b) {
        var bd = B.binding(s, a, b);
        var mulige = B.muligeOrdener(s, a, b);
        if (!bd || mulige.length < 2) return false;
        var i = mulige.indexOf(bd.orden);
        bd.orden = mulige[(i + 1) % mulige.length];
        return true;
    };

    /* ----- Hydrogen og frie elektronpar ------------------------------------- */
    /* Alle atomer med H'erne til sidst. Et H hedder "H<atom>_<nr>", saa det
       beholder sit navn, naar molekylet bygges om. */
    B.udvid = function (s) {
        var atomer = [], indeks = {};
        s.atomer.forEach(function (a) {
            indeks[a.id] = atomer.length;
            atomer.push({ id: a.id, el: a.el, naboer: [] });
        });
        s.bindinger.forEach(function (bd) {
            var i = indeks[bd.a], j = indeks[bd.b];
            atomer[i].naboer.push({ atom: j, orden: bd.orden });
            atomer[j].naboer.push({ atom: i, orden: bd.orden });
        });
        var tunge = atomer.length;
        for (var i = 0; i < tunge; i++) {
            var antalH = B.fri(s, atomer[i].id);
            for (var k = 0; k < antalH; k++) {
                atomer[i].naboer.push({ atom: atomer.length, orden: 1 });
                atomer.push({ id: "H" + atomer[i].id + "_" + k, el: "H", naboer: [{ atom: i, orden: 1 }] });
            }
        }
        atomer.forEach(function (a) {
            var sum = a.naboer.reduce(function (t, nb) { return t + nb.orden; }, 0);
            a.frie = a.el === "H" ? 0 : (D.GRUNDSTOFFER[a.el].v - sum) / 2;
        });
        return atomer;
    };

    /* Formen omkring et atom i den udvidede liste, eller null for et endeatom. */
    B.formRundt = function (atomer, i) {
        var a = atomer[i];
        if (!a || a.naboer.length < 2) return null;
        return D.form(a.naboer.length, a.frie);
    };

    /* ----- Geometrien ------------------------------------------------------ */
    function retn(polar, azimut) {
        var t = polar * Math.PI / 180, f = azimut * Math.PI / 180;
        return [Math.sin(t) * Math.sin(f), Math.cos(t), Math.sin(t) * Math.cos(f)];
    }

    var TETRA = Math.acos(-1 / 3) * 180 / Math.PI;
    var SKABELON = {
        1: [[0, 1, 0]],
        2: [[0, 1, 0], [0, -1, 0]],
        3: [[0, 1, 0], retn(120, 0), retn(120, 180)],
        4: [[0, 1, 0], retn(TETRA, 0), retn(TETRA, 120), retn(TETRA, 240)]
    };

    /* Rodrigues: drej v om enhedsvektoren akse. */
    function drejOm(v, akse, vinkel) {
        var c = Math.cos(vinkel), s = Math.sin(vinkel);
        return V.plus(V.plus(V.gange(v, c), V.gange(V.kryds(akse, v), s)), V.gange(akse, V.prik(akse, v) * (1 - c)));
    }
    B.drejOm = drejOm;

    /* En drejning, der sender (0, 1, 0) over i retningen d. */
    function opTil(d) {
        var op = [0, 1, 0];
        var c = V.prik(op, d);
        if (c > 0.999999) return function (v) { return v; };
        if (c < -0.999999) return function (v) { return [v[0], -v[1], -v[2]]; };
        var akse = V.enhed(V.kryds(op, d));
        var vinkel = Math.acos(NK.klamp(c, -1, 1));
        return function (v) { return drejOm(v, akse, vinkel); };
    }

    function orden(atomer, i, j) {
        for (var k = 0; k < atomer[i].naboer.length; k++) if (atomer[i].naboer[k].atom === j) return atomer[i].naboer[k].orden;
        return 1;
    }

    /* Returnerer { atomer, pos: { id: [x,y,z] }, frie: [{ ejer, noegle, u, lille }] } */
    B.geometri = function (s) {
        var atomer = B.udvid(s);
        var ud = { atomer: atomer, pos: {}, frie: [] };
        if (!atomer.length) return ud;

        var P = [[0, 0, 0]];
        var foraelder = [-1];
        var grupperAf = [];
        var ko = [0];

        function drejning(i, p, grupper) {
            var o = orden(atomer, i, p);
            var andre = grupper.slice(1);
            var pg = grupperAf[p].filter(function (g) { return g.til !== i; });
            if (o === 3 || !andre.length || !pg.length) return;
            var akse = grupper[0].u;
            var normal = null;
            if (o === 2 && pg.length === 2) {
                var n = V.kryds(V.minus(P[i], P[p]), pg[0].u);
                if (V.laengde(n) > 1e-6) normal = V.enhed(n);
            }
            var bedst = 0, bedstE = Infinity;
            for (var grad = 0; grad < 360; grad++) {
                var t = grad * Math.PI / 180, E = 0;
                for (var k = 0; k < andre.length; k++) {
                    var u = drejOm(andre[k].u, akse, t);
                    if (normal) {
                        var c = V.prik(u, normal);
                        E += c * c;
                    } else {
                        var pa = V.plus(P[i], V.gange(u, 1.1));
                        for (var m = 0; m < pg.length; m++) {
                            E += 1 / (V.laengde(V.minus(pa, V.plus(P[p], V.gange(pg[m].u, 1.1)))) + 1e-6);
                        }
                    }
                }
                if (E < bedstE - 1e-9) { bedstE = E; bedst = t; }
            }
            andre.forEach(function (g) { g.u = drejOm(g.u, akse, bedst); });
        }

        while (ko.length) {
            var i = ko.shift();
            var a = atomer[i];
            var p = foraelder[i];
            var grupper = [];
            /* Raekkefoelgen er valgt, saa et nyt atom overtager pladsen fra det
               H, det erstatter: forfaelderen, H'erne, de tunge naboer med de
               nyeste foerst og til sidst de frie par. */
            if (p >= 0) grupper.push({ type: "binding", til: p, fast: true });
            a.naboer.forEach(function (nb) {
                if (nb.atom !== p && atomer[nb.atom].el === "H") grupper.push({ type: "binding", til: nb.atom });
            });
            a.naboer.filter(function (nb) { return nb.atom !== p && atomer[nb.atom].el !== "H"; })
                .sort(function (x, y) { return atomer[y.atom].id - atomer[x.atom].id; })
                .forEach(function (nb) { grupper.push({ type: "binding", til: nb.atom }); });
            for (var k = 0; k < a.frie; k++) grupper.push({ type: "fri", til: null });

            var drej = opTil(p >= 0 ? V.enhed(V.minus(P[p], P[i])) : [0, 1, 0]);
            var skabelon = SKABELON[grupper.length] || SKABELON[4];
            grupper.forEach(function (g, nr) { g.u = V.enhed(drej(skabelon[nr])); });
            if (grupper.length > 1) NK.Frastoed.ligevaegt(grupper, 1500);
            if (p >= 0 && grupper.length > 1) drejning(i, p, grupper);
            grupperAf[i] = grupper;

            grupper.forEach(function (g) {
                if (g.type !== "binding" || g.til === p) return;
                P[g.til] = V.plus(P[i], V.gange(g.u, B.laengde(a.el, atomer[g.til].el, orden(atomer, i, g.til))));
                foraelder[g.til] = i;
                ko.push(g.til);
            });
        }

        var midt = [0, 0, 0];
        P.forEach(function (q) { midt = V.plus(midt, q); });
        midt = V.gange(midt, 1 / P.length);
        atomer.forEach(function (at, nr) {
            ud.pos[at.id] = V.minus(P[nr], midt);
            var frie = grupperAf[nr].filter(function (g) { return g.type === "fri"; });
            frie.forEach(function (g, k) {
                ud.frie.push({ ejer: at.id, noegle: at.id + ":" + k, u: g.u, lille: at.naboer.length === 1 });
            });
        });
        return ud;
    };

    /* ----- Den drejning, der bedst laegger punkter oven i andre ------------
       Horns metode med kvaternioner. fra og til er lige lange lister af
       punkter; resultatet sender fra over i til: R (p - cFra) + cTil. */
    function jacobi4(A) {
        var a = A.map(function (r) { return r.slice(); });
        var v = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
        for (var runde = 0; runde < 40; runde++) {
            var off = 0;
            for (var p = 0; p < 3; p++) for (var q = p + 1; q < 4; q++) off += a[p][q] * a[p][q];
            if (off < 1e-20) break;
            for (p = 0; p < 3; p++) {
                for (q = p + 1; q < 4; q++) {
                    if (Math.abs(a[p][q]) < 1e-15) continue;
                    var theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
                    var t = (theta >= 0 ? 1 : -1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
                    var c = 1 / Math.sqrt(t * t + 1), s = t * c;
                    for (var k = 0; k < 4; k++) {
                        var akp = a[k][p], akq = a[k][q];
                        a[k][p] = c * akp - s * akq;
                        a[k][q] = s * akp + c * akq;
                    }
                    for (k = 0; k < 4; k++) {
                        var apk = a[p][k], aqk = a[q][k];
                        a[p][k] = c * apk - s * aqk;
                        a[q][k] = s * apk + c * aqk;
                    }
                    for (k = 0; k < 4; k++) {
                        var vkp = v[k][p], vkq = v[k][q];
                        v[k][p] = c * vkp - s * vkq;
                        v[k][q] = s * vkp + c * vkq;
                    }
                }
            }
        }
        var bedst = 0;
        for (var j = 1; j < 4; j++) if (a[j][j] > a[bedst][bedst]) bedst = j;
        return [v[0][bedst], v[1][bedst], v[2][bedst], v[3][bedst]];
    }

    function tyngdepunkt(liste) {
        var m = [0, 0, 0];
        liste.forEach(function (q) { m = V.plus(m, q); });
        return liste.length ? V.gange(m, 1 / liste.length) : m;
    }

    B.juster = function (fra, til) {
        var cf = tyngdepunkt(fra), ct = tyngdepunkt(til);
        var R = NK.M3.enhed();
        if (fra.length >= 2) {
            var S = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            for (var n = 0; n < fra.length; n++) {
                var x = V.minus(fra[n], cf), y = V.minus(til[n], ct);
                for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) S[r][c] += x[r] * y[c];
            }
            var xx = S[0][0], xy = S[0][1], xz = S[0][2], yx = S[1][0], yy = S[1][1], yz = S[1][2], zx = S[2][0], zy = S[2][1], zz = S[2][2];
            var q = jacobi4([
                [xx + yy + zz, yz - zy, zx - xz, xy - yx],
                [yz - zy, xx - yy - zz, xy + yx, zx + xz],
                [zx - xz, xy + yx, -xx + yy - zz, yz + zy],
                [xy - yx, zx + xz, yz + zy, -xx - yy + zz]
            ]);
            var a = q[0], b = q[1], cq = q[2], d = q[3];
            R = [
                a * a + b * b - cq * cq - d * d, 2 * (b * cq - a * d), 2 * (b * d + a * cq),
                2 * (b * cq + a * d), a * a - b * b + cq * cq - d * d, 2 * (cq * d - a * b),
                2 * (b * d - a * cq), 2 * (cq * d + a * b), a * a - b * b - cq * cq + d * d
            ];
        }
        return { R: R, cFra: cf, cTil: ct };
    };

    /* ----- Hvilket molekyle er det? ------------------------------------------ */
    /* En noegle, der er ens for ens molekyler, uanset raekkefoelgen de er bygget i. */
    B.noegle = function (s) {
        if (!s.atomer.length) return "";
        var naboer = {}, el = {};
        s.atomer.forEach(function (a) { naboer[a.id] = []; el[a.id] = a.el; });
        s.bindinger.forEach(function (bd) {
            naboer[bd.a].push({ id: bd.b, orden: bd.orden });
            naboer[bd.b].push({ id: bd.a, orden: bd.orden });
        });
        function kode(id, fra) {
            var dele = naboer[id].filter(function (nb) { return nb.id !== fra; })
                .map(function (nb) { return nb.orden + kode(nb.id, id); }).sort();
            return el[id] + "(" + dele.join(",") + ")";
        }
        return s.atomer.map(function (a) { return kode(a.id, null); }).sort()[0];
    };

    /* Bruttoformel efter Hill: C, H og resten alfabetisk. */
    B.formel = function (s) {
        var t = { C: 0, H: 0, Cl: 0, N: 0, O: 0 };
        s.atomer.forEach(function (a) { t[a.el]++; t.H += B.fri(s, a.id); });
        var raekke = t.C ? ["C", "H", "Cl", "N", "O"] : ["Cl", "H", "N", "O"];
        return raekke.map(function (e) { return t[e] ? e + (t[e] > 1 ? t[e] : "") : ""; }).join("");
    };

    B.fraSpec = function (spec) {
        var s = B.ny();
        spec.atomer.forEach(function (e) { s.atomer.push({ id: s.naesteId++, el: e }); });
        (spec.bindinger || []).forEach(function (bd) {
            s.bindinger.push({ a: s.atomer[bd[0]].id, b: s.atomer[bd[1]].id, orden: bd[2] });
        });
        return s;
    };

    B.KENDTE = [
        { id: "CH4", formel: "CH4", navn: "methan", atomer: ["C"] },
        { id: "C2H6", formel: "C2H6", navn: "ethan", atomer: ["C", "C"], bindinger: [[0, 1, 1]] },
        { id: "C2H4", formel: "C2H4", navn: "ethen", atomer: ["C", "C"], bindinger: [[0, 1, 2]] },
        { id: "C2H2", formel: "C2H2", navn: "ethyn", atomer: ["C", "C"], bindinger: [[0, 1, 3]] },
        { id: "NH3", formel: "NH3", navn: "ammoniak", atomer: ["N"] },
        { id: "H2O", formel: "H2O", navn: "vand", atomer: ["O"] },
        { id: "HCl", formel: "HCl", navn: "hydrogenchlorid", atomer: ["Cl"] },
        { id: "CH3OH", formel: "CH3OH", navn: "methanol", atomer: ["C", "O"], bindinger: [[0, 1, 1]] },
        { id: "C2H5OH", formel: "C2H5OH", navn: "ethanol", atomer: ["C", "C", "O"], bindinger: [[0, 1, 1], [1, 2, 1]] },
        { id: "CH3OCH3", formel: "CH3OCH3", navn: "dimethylether", atomer: ["C", "O", "C"], bindinger: [[0, 1, 1], [1, 2, 1]] },
        { id: "CH2O", formel: "CH2O", navn: "methanal", atomer: ["C", "O"], bindinger: [[0, 1, 2]] },
        { id: "CH3CHO", formel: "CH3CHO", navn: "ethanal", atomer: ["C", "C", "O"], bindinger: [[0, 1, 1], [1, 2, 2]] },
        { id: "HCOOH", formel: "HCOOH", navn: "methansyre", atomer: ["C", "O", "O"], bindinger: [[0, 1, 2], [0, 2, 1]] },
        { id: "CH3COOH", formel: "CH3COOH", navn: "ethansyre", atomer: ["C", "C", "O", "O"], bindinger: [[0, 1, 1], [1, 2, 2], [1, 3, 1]] },
        { id: "CO2", formel: "CO2", navn: "carbondioxid", atomer: ["C", "O", "O"], bindinger: [[0, 1, 2], [0, 2, 2]] },
        { id: "HCN", formel: "HCN", navn: "blåsyre", atomer: ["C", "N"], bindinger: [[0, 1, 3]] },
        { id: "CH3NH2", formel: "CH3NH2", navn: "methylamin", atomer: ["C", "N"], bindinger: [[0, 1, 1]] },
        { id: "C2H5NH2", formel: "C2H5NH2", navn: "ethylamin", atomer: ["C", "C", "N"], bindinger: [[0, 1, 1], [1, 2, 1]] },
        { id: "CO(NH2)2", formel: "CO(NH2)2", navn: "urinstof", atomer: ["C", "O", "N", "N"], bindinger: [[0, 1, 2], [0, 2, 1], [0, 3, 1]] },
        { id: "CH3Cl", formel: "CH3Cl", navn: "chlormethan", atomer: ["C", "Cl"], bindinger: [[0, 1, 1]] },
        { id: "CH2Cl2", formel: "CH2Cl2", navn: "dichlormethan", atomer: ["C", "Cl", "Cl"], bindinger: [[0, 1, 1], [0, 2, 1]] },
        { id: "CHCl3", formel: "CHCl3", navn: "trichlormethan", atomer: ["C", "Cl", "Cl", "Cl"], bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
        { id: "CCl4", formel: "CCl4", navn: "tetrachlormethan", atomer: ["C", "Cl", "Cl", "Cl", "Cl"], bindinger: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
        { id: "C2H5Cl", formel: "C2H5Cl", navn: "chlorethan", atomer: ["C", "C", "Cl"], bindinger: [[0, 1, 1], [1, 2, 1]] },
        { id: "H2O2", formel: "H2O2", navn: "hydrogenperoxid", atomer: ["O", "O"], bindinger: [[0, 1, 1]] },
        { id: "N2", formel: "N2", navn: "dinitrogen", atomer: ["N", "N"], bindinger: [[0, 1, 3]] },
        { id: "O2", formel: "O2", navn: "dioxygen", atomer: ["O", "O"], bindinger: [[0, 1, 2]] },
        { id: "Cl2", formel: "Cl2", navn: "dichlor", atomer: ["Cl", "Cl"], bindinger: [[0, 1, 1]] }
    ];

    B.kendt = function (s) {
        var k = B.noegle(s);
        if (!k) return null;
        for (var i = 0; i < B.KENDTE.length; i++) {
            var m = B.KENDTE[i];
            if (m._noegle === undefined) m._noegle = B.noegle(B.fraSpec(m));
            if (m._noegle === k) return m;
        }
        return null;
    };

    B.kendtMedId = function (id) {
        for (var i = 0; i < B.KENDTE.length; i++) if (B.KENDTE[i].id === id) return B.KENDTE[i];
        return null;
    };
}());

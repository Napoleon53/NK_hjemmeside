/* Ionregn: ionerne, målene og de rene kemifunktioner (ingen tegning, ingen lyd). */
var Kemi = (function () {
    "use strict";

    /* f: formel med _ foran sænkede tal, q: ladning, navn: navnet i en forbindelse */
    var IONER = {
        Na:  { f: "Na",   q: 1,  navn: "natrium" },
        K:   { f: "K",    q: 1,  navn: "kalium" },
        Li:  { f: "Li",   q: 1,  navn: "lithium" },
        NH4: { f: "NH_4", q: 1,  navn: "ammonium", sammensat: true },
        Mg:  { f: "Mg",   q: 2,  navn: "magnesium" },
        Ca:  { f: "Ca",   q: 2,  navn: "calcium" },
        Fe2: { f: "Fe",   q: 2,  navn: "jern(II)" },
        Al:  { f: "Al",   q: 3,  navn: "aluminium" },
        Fe3: { f: "Fe",   q: 3,  navn: "jern(III)" },
        Cl:  { f: "Cl",   q: -1, navn: "chlorid" },
        Br:  { f: "Br",   q: -1, navn: "bromid" },
        F:   { f: "F",    q: -1, navn: "fluorid" },
        I:   { f: "I",    q: -1, navn: "iodid" },
        OH:  { f: "OH",   q: -1, navn: "hydroxid", sammensat: true },
        NO3: { f: "NO_3", q: -1, navn: "nitrat", sammensat: true },
        O:   { f: "O",    q: -2, navn: "oxid" },
        S:   { f: "S",    q: -2, navn: "sulfid" },
        SO4: { f: "SO_4", q: -2, navn: "sulfat", sammensat: true },
        CO3: { f: "CO_3", q: -2, navn: "carbonat", sammensat: true },
        N:   { f: "N",    q: -3, navn: "nitrid" },
        PO4: { f: "PO_4", q: -3, navn: "phosphat", sammensat: true }
    };

    /* Målene i niveau 1 (vist som formel) og niveau 2 (vist som navn): [kation, anion] */
    var MAAL = {
        n1: [["Na", "Cl"], ["K", "Cl"], ["Li", "Cl"], ["Na", "Br"], ["K", "Br"], ["Li", "Br"],
             ["Na", "F"], ["K", "F"], ["Li", "F"], ["Mg", "Cl"], ["Ca", "Cl"], ["Mg", "Br"],
             ["Ca", "Br"], ["Mg", "F"], ["Ca", "F"], ["Mg", "O"], ["Ca", "O"], ["Na", "O"],
             ["K", "O"], ["Li", "O"]],
        n2: [["Al", "O"], ["Al", "Cl"], ["Al", "F"], ["Al", "Br"], ["Al", "I"], ["Al", "S"], ["Al", "N"],
             ["Fe2", "Cl"], ["Fe3", "Cl"], ["Fe2", "O"], ["Fe3", "O"], ["Fe2", "S"], ["Fe3", "Br"],
             ["Fe2", "I"], ["Na", "S"], ["K", "S"], ["Mg", "S"], ["Ca", "S"], ["Na", "I"], ["K", "I"],
             ["Mg", "I"], ["Ca", "I"], ["Li", "N"], ["Mg", "N"], ["Ca", "N"],
             ["Mg", "Cl"], ["Ca", "Br"], ["Na", "O"], ["K", "F"], ["Ca", "F"]]
    };

    var MINUS = "−";
    var SUB = "₀₁₂₃₄₅₆₇₈₉", SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";

    function ion(id) { return IONER[id]; }
    function erKation(id) { return IONER[id].q > 0; }

    /* Ladning som tekst: + og −, aldrig 1+ og 1− */
    function ladningTekst(q) {
        var a = Math.abs(q);
        return (a === 1 ? "" : String(a)) + (q > 0 ? "+" : MINUS);
    }
    /* Ladning i kolben: +1, −2, 0 */
    function samletLadningTekst(q) {
        return q === 0 ? "0" : (q > 0 ? "+" : MINUS) + Math.abs(q);
    }

    /* "SO_4" -> [{t:"SO"},{t:"4",sub:true}] */
    function deleAf(f) {
        var ud = [], m, re = /_(\d+)|([^_]+)/g;
        while ((m = re.exec(f))) {
            if (m[1]) ud.push({ t: m[1], sub: true }); else ud.push({ t: m[2] });
        }
        return ud;
    }
    function ionDele(id) {
        var d = deleAf(IONER[id].f);
        d.push({ t: ladningTekst(IONER[id].q), sup: true });
        return d;
    }

    function escape(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    function deleHTML(d) {
        return d.map(function (x) {
            if (x.sub) return "<sub>" + escape(x.t) + "</sub>";
            if (x.sup) return "<sup>" + escape(x.t) + "</sup>";
            return escape(x.t);
        }).join("");
    }
    function deleTekst(d) {
        return d.map(function (x) {
            if (x.sub) return x.t.replace(/\d/g, function (c) { return SUB[+c]; });
            if (x.sup) return x.t.replace(/\d/g, function (c) { return SUP[+c]; })
                .replace("+", "⁺").replace(MINUS, "⁻");
            return x.t;
        }).join("");
    }
    function ionHTML(id) { return deleHTML(ionDele(id)); }
    function ionTekst(id) { return deleTekst(ionDele(id)); }

    /* ---- Tællinger: { Mg: 1, Cl: 2 } -------------------------------- */
    function ladning(t) {
        var q = 0;
        for (var id in t) q += IONER[id].q * t[id];
        return q;
    }
    function antal(t) {
        var n = 0;
        for (var id in t) n += t[id];
        return n;
    }
    function tael(liste) {
        var t = {};
        liste.forEach(function (id) { t[id] = (t[id] || 0) + 1; });
        return t;
    }
    function gcd(a, b) { while (b) { var r = a % b; a = b; b = r; } return a; }

    /* Den enkleste forbindelse af en kation og en anion */
    function maalTaelling(kat, an) {
        var a = IONER[kat].q, b = -IONER[an].q, g = gcd(a, b), t = {};
        t[kat] = b / g; t[an] = a / g;
        return t;
    }

    function sorterede(t, kat) {
        return Object.keys(t).filter(function (id) { return (IONER[id].q > 0) === kat; })
            .sort(function (x, y) {
                var fx = IONER[x].f.replace("_", ""), fy = IONER[y].f.replace("_", "");
                return fx < fy ? -1 : fx > fy ? 1 : IONER[x].q - IONER[y].q;
            });
    }

    /* Formel, navn og antal ioner i formelenheden (forkortet: Na2Cl2 -> NaCl) */
    function forbindelse(taelling) {
        var ids = Object.keys(taelling).filter(function (id) { return taelling[id] > 0; });
        var g = 0;
        ids.forEach(function (id) { g = gcd(g, taelling[id]); });
        var t = {};
        ids.forEach(function (id) { t[id] = taelling[id] / g; });
        var kat = sorterede(t, true), an = sorterede(t, false), dele = [];
        kat.concat(an).forEach(function (id) {
            var n = t[id], d = deleAf(IONER[id].f);
            if (n > 1 && IONER[id].sammensat) {
                dele.push({ t: "(" }); dele = dele.concat(d); dele.push({ t: ")" });
            } else {
                dele = dele.concat(d);
            }
            if (n > 1) dele.push({ t: String(n), sub: true });
        });
        /* sæt nabo-tekstdele sammen */
        var flet = [];
        dele.forEach(function (x) {
            var s = flet[flet.length - 1];
            if (s && !s.sub && !s.sup && !x.sub && !x.sup) s.t += x.t; else flet.push({ t: x.t, sub: x.sub });
        });
        var navn = kat.map(function (id) { return IONER[id].navn; }).join("") +
                   an.map(function (id) { return IONER[id].navn; }).join("");
        return { taelling: t, dele: flet, html: deleHTML(flet), tekst: deleTekst(flet), navn: navn, ioner: antal(t) };
    }

    /* Opskriften: "Mg²⁺ + 2 Cl⁻" som HTML */
    function opskriftHTML(t) {
        var f = forbindelse(t).taelling;
        return sorterede(f, true).concat(sorterede(f, false)).map(function (id) {
            return (f[id] > 1 ? f[id] + " " : "") + ionHTML(id);
        }).join(" + ");
    }
    function listeHTML(liste) {
        return liste.map(ionHTML).join(" + ");
    }

    /* Kan en kolbe med ladningen q og n ioner stadig blive neutral inden for maks ioner? */
    function kanNeutraliseres(q, n, maks) {
        if (q === 0) return true;
        if (n >= maks) return false;
        return Math.abs(q) <= 3 * (maks - n);
    }

    /* En mulig løsning: de færreste ioner fra puljen, der gør tællingen neutral */
    function loesning(taelling, pulje, maks) {
        var q = ladning(taelling), n = antal(taelling);
        if (q === 0 || !kanNeutraliseres(q, n, maks)) return null;
        var modsat = pulje.filter(function (id) { return IONER[id].q * q < 0; });
        /* foretræk de simple ioner, hvis de er i puljen */
        var simple = ["Cl", "O", "N", "Na", "Mg", "Al", "PO4", "SO4", "Fe3"];
        modsat.sort(function (a, b) {
            var ia = simple.indexOf(a), ib = simple.indexOf(b);
            return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        });
        for (var k = 1; k <= maks - n; k++) {
            var fundet = soeg(modsat, k, -q);
            if (fundet) {
                var t = {};
                for (var id in taelling) t[id] = taelling[id];
                fundet.forEach(function (x) { t[x] = (t[x] || 0) + 1; });
                return t;
            }
        }
        return null;
    }
    function soeg(ioner, k, q) {
        /* k ioner af samme slags giver den enkleste løsning */
        for (var i = 0; i < ioner.length; i++) {
            if (IONER[ioner[i]].q * k === q) {
                var l = []; for (var j = 0; j < k; j++) l.push(ioner[i]);
                return l;
            }
        }
        /* ellers en blanding */
        function rek(start, rest, sum) {
            if (rest === 0) return sum === q ? [] : null;
            for (var i = start; i < ioner.length; i++) {
                var r = rek(i, rest - 1, sum + IONER[ioner[i]].q);
                if (r) return [ioner[i]].concat(r);
            }
            return null;
        }
        return rek(0, k, 0);
    }

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
    function antalOrd(n) { return n === 1 ? "én" : String(n); }

    return {
        IONER: IONER, MAAL: MAAL, MINUS: MINUS,
        ion: ion, erKation: erKation, ladningTekst: ladningTekst, samletLadningTekst: samletLadningTekst,
        deleAf: deleAf, ionDele: ionDele, ionHTML: ionHTML, ionTekst: ionTekst,
        deleHTML: deleHTML, deleTekst: deleTekst,
        ladning: ladning, antal: antal, tael: tael, maalTaelling: maalTaelling,
        forbindelse: forbindelse, opskriftHTML: opskriftHTML, listeHTML: listeHTML,
        kanNeutraliseres: kanNeutraliseres, loesning: loesning, stort: stort, antalOrd: antalOrd
    };
})();

/* =====================================================================
   redox.js - modellen: oxidationstal, elektroner og afstemning

   NK.Redox.reaktion(def) regner alt ud af en linje i D.REAKTIONER:
     oxidationstallene (O er −II og H er +I, resten følger af ladningen),
     hvem der oxideres og reduceres, elektroner pr. atom og pr. enhed,
     de mindste koefficienter, ladningen på hver side, H⁺ eller OH⁻,
     vandet og det færdige, sammenskrevne skema.
   Hjælpeteksterne til elevens fejl bygges også her, ud fra modellen,
   så de passer til netop den reaktion og det tal, eleven skrev.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var FAST = { O: -2, H: 1 };
    var MINUS = "−";

    /* ----- Tal og romertal ------------------------------------------------ */
    function romer(n) {
        var tal = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]], s = "";
        tal.forEach(function (t) { while (n >= t[0]) { s += t[1]; n -= t[0]; } });
        return s;
    }

    /* +VII, −II, 0 */
    function ox(n) {
        if (n === 0) return "0";
        return (n > 0 ? "+" : MINUS) + romer(Math.abs(n));
    }

    /* (−II), (+I), 0: til beregninger */
    function oxP(n) { return n === 0 ? "0" : "(" + ox(n) + ")"; }

    /* +9, −8, 0 */
    function lad(q) { return NK.fortegn(q); }
    function ladP(q) { return q === 0 ? "0" : "(" + lad(q) + ")"; }

    var ROMER = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

    /* Det, eleven skriver som oxidationstal: +VII, VII, +7, 7, −II, -2, 0.
       Giver NaN, hvis det ikke kan læses. */
    function laesOx(s) {
        var t = NK.ascii(s).replace(/\s+/g, "").toUpperCase();
        if (!t) return NaN;
        var fortegn = 1;
        if (t[0] === "+") t = t.slice(1);
        else if (t[0] === "-") { fortegn = -1; t = t.slice(1); }
        if (t === "0") return 0;
        if (Object.prototype.hasOwnProperty.call(ROMER, t)) return fortegn * ROMER[t];
        if (/^\d{1,2}$/.test(t)) return fortegn * parseInt(t, 10);
        return NaN;
    }

    /* Et helt tal med eller uden fortegn. Tomt giver null. */
    function laesTal(s) {
        var t = NK.ascii(s).replace(/\s+/g, "");
        if (!t) return null;
        if (!/^[+-]?\d{1,3}$/.test(t)) return NaN;
        return parseInt(t, 10);
    }

    /* ----- Et stof ------------------------------------------------------------ */
    function stof(f) {
        var dele = f.split(" "), formel = dele[0], q = 0;
        if (dele[1]) {
            var m = /^(\d*)([+-])$/.exec(dele[1]);
            q = (m[1] ? parseInt(m[1], 10) : 1) * (m[2] === "+" ? 1 : -1);
        }
        var atomer = [], re = /([A-Z][a-z]?)(\d*)/g, x;
        while ((x = re.exec(formel))) atomer.push({ s: x[1], n: x[2] ? parseInt(x[2], 10) : 1 });
        var el = {};
        atomer.forEach(function (a) { el[a.s] = (el[a.s] || 0) + a.n; });
        var navne = Object.keys(el), ukendt, oxtal = {};
        if (navne.length === 1) {
            ukendt = navne[0];
            oxtal[ukendt] = q / el[ukendt];
        } else {
            ukendt = D.UKENDT[formel] || navne.filter(function (s) { return !Object.prototype.hasOwnProperty.call(FAST, s); })[0];
            var sum = 0;
            navne.forEach(function (s) {
                if (s === ukendt) return;
                oxtal[s] = FAST[s];
                sum += FAST[s] * el[s];
            });
            oxtal[ukendt] = (q - sum) / el[ukendt];
        }
        return {
            f: f, formel: formel, q: q, atomer: atomer, el: el, ukendt: ukendt, ox: oxtal,
            slags: navne.length > 1 ? "sammensat" : (q === 0 ? "grundstof" : "ion"),
            tekst: NK.formel(formel) + NK.ladningHaevet(q)
        };
    }

    var H_ION = stof("H +"), OH_ION = stof("OH -"), VAND = stof("H2O");

    /* ----- En reaktion ----------------------------------------------------------- */
    function reaktion(def) {
        var led = [], nv = def.v.length;
        def.v.forEach(function (f, i) { led.push({ st: stof(f), side: "v", i: i, nr: led.length }); });
        def.h.forEach(function (f, i) { led.push({ st: stof(f), side: "h", i: i, nr: led.length }); });

        function lavPar(p, type) {
            var lv = p[0], lh = nv + p[1];
            var A = led[lv].st, B = led[lh].st, E = A.ukendt;
            var fra = A.ox[E], til = B.ox[E];
            return {
                type: type, v: lv, h: lh, E: E, fra: fra, til: til,
                delta: Math.abs(til - fra), nV: A.el[E], nH: B.el[E],
                ePrEnhed: A.el[E] * Math.abs(til - fra)
            };
        }
        var OX = lavPar(def.ox, "ox"), RED = lavPar(def.red, "red");
        led[OX.v].rolle = led[OX.h].rolle = "ox";
        led[RED.v].rolle = led[RED.h].rolle = "red";

        /* De mindste koefficienter: lige mange elektroner og samme antal af
           grundstoffet på begge sider af hvert par. */
        var koef = null;
        for (var a = 1; a <= 60 && !koef; a++) {
            var e = a * OX.ePrEnhed;
            if (e % RED.ePrEnhed) continue;
            var b = e / RED.ePrEnhed;
            var c = a * OX.nV / OX.nH, d = b * RED.nV / RED.nH;
            if (c % 1 || d % 1) continue;
            koef = [];
            koef[OX.v] = a; koef[RED.v] = b; koef[OX.h] = c; koef[RED.h] = d;
        }

        var R = {
            def: def, id: def.id, niveau: def.niveau, miljoe: def.miljoe, samme: def.samme || null,
            led: led, ox: OX, red: RED, koef: koef,
            elektroner: koef[OX.v] * OX.ePrEnhed
        };
        R.ionSt = def.miljoe === "surt" ? H_ION : (def.miljoe === "basisk" ? OH_ION : null);
        R.vandSt = VAND;

        R.ladning = ladninger(R, koef);
        var dq = R.ladning.v - R.ladning.h;
        R.ion = { side: null, antal: 0 };
        if (def.miljoe === "surt" && dq) R.ion = { side: dq < 0 ? "v" : "h", antal: Math.abs(dq) };
        if (def.miljoe === "basisk" && dq) R.ion = { side: dq > 0 ? "v" : "h", antal: Math.abs(dq) };

        var o = taelling(R, koef, R.ion, null);
        var dO = (o.v.O || 0) - (o.h.O || 0);
        R.vand = { side: null, antal: 0 };
        if (dO) R.vand = { side: dO < 0 ? "v" : "h", antal: Math.abs(dO) };

        R.slut = slutskema(R);
        return R;
    }

    /* Ladningen på hver side med koefficienterne k (og evt. H⁺/OH⁻) */
    function ladninger(R, k, ion) {
        var q = { v: 0, h: 0 };
        R.led.forEach(function (l, i) { q[l.side] += k[i] * l.st.q; });
        if (ion && ion.side && R.ionSt) q[ion.side] += ion.antal * R.ionSt.q;
        return q;
    }

    /* Antal af hvert grundstof på hver side */
    function taelling(R, k, ion, vand) {
        var t = { v: {}, h: {} };
        function laeg(side, st, n) {
            if (!n) return;
            Object.keys(st.el).forEach(function (s) { t[side][s] = (t[side][s] || 0) + n * st.el[s]; });
        }
        R.led.forEach(function (l, i) { laeg(l.side, l.st, k[i]); });
        if (ion && ion.side && R.ionSt) laeg(ion.side, R.ionSt, ion.antal);
        if (vand && vand.side) laeg(vand.side, VAND, vand.antal);
        return t;
    }

    /* Det færdige skema: ens led slås sammen, H⁺/OH⁻ og vand sættes på */
    function slutskema(R) {
        var s = { v: [], h: [] };
        R.led.forEach(function (l, i) {
            var liste = s[l.side];
            if (R.samme === l.side && liste.length) liste[0].koef += R.koef[i];
            else liste.push({ koef: R.koef[i], st: l.st });
        });
        if (R.ion.side) s[R.ion.side].push({ koef: R.ion.antal, st: R.ionSt, ekstra: "ion" });
        if (R.vand.side) s[R.vand.side].push({ koef: R.vand.antal, st: VAND, ekstra: "vand" });
        return s;
    }

    function skemaTekst(s) {
        function side(l) {
            return l.map(function (x) { return (x.koef === 1 ? "" : x.koef + " ") + x.st.tekst; }).join(" + ");
        }
        return side(s.v) + " ⟶ " + side(s.h);
    }

    /* ----- Hjælp til trin 1: oxidationstallene ------------------------------------ */
    function faste(st) {
        return Object.keys(st.el).filter(function (s) { return s !== st.ukendt; });
    }

    /* "O er −II" / "H er +I og O er −II" */
    function fastTekst(st) {
        return faste(st).map(function (s) { return s + " er " + ox(st.ox[s]); }).join(" og ");
    }

    function sumTekst(st) {
        return st.q === 0 ? "0, for " + st.tekst + " er neutralt" : "ionens ladning, " + lad(st.q);
    }

    /* Beregningen: Mn + 4 · (−II) = −1, så Mn = +VII */
    function oxBeregning(st) {
        var E = st.ukendt;
        if (st.slags === "grundstof") return st.tekst + " er et grundstof, så " + E + " = 0.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom, så " + E + " = " + ox(st.ox[E]) + ".";
        var led = [(st.el[E] > 1 ? st.el[E] + " · " : "") + E];
        faste(st).forEach(function (s) { led.push(st.el[s] + " · " + oxP(st.ox[s])); });
        return led.join(" + ") + " = " + lad(st.q) + ", så " + E + " = " + ox(st.ox[E]) + ".";
    }

    function oxHint(st) {
        var E = st.ukendt;
        if (st.slags === "grundstof") return st.tekst + " står alene uden ladning. Et grundstof har oxidationstallet 0.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom. Oxidationstallet er ionens ladning.";
        var t = "I " + st.tekst + " er " + faste(st).map(function (s) { return s + " " + ox(st.ox[s]); }).join(" og ") + ".";
        if (E === "O") t = "O er ikke −II her. " + t;
        return t + " Summen af oxidationstallene skal være " + sumTekst(st) + ".";
    }

    /* Hvad gik galt, når eleven skrev v i stedet for det rigtige? */
    function oxFejl(st, v) {
        var E = st.ukendt, rigtig = st.ox[E];
        if (isNaN(v)) return "Skriv et oxidationstal, fx +VII, −II eller 0.";
        if (st.slags === "grundstof") return st.tekst + " er et grundstof. Oxidationstallet er 0.";
        if (st.slags === "ion") {
            if (v === -rigtig) return "Tjek fortegnet. " + st.tekst + " har ladningen " + lad(st.q) + ".";
            return st.tekst + " er en ion af ét atom. Oxidationstallet er ionens ladning.";
        }
        var n = st.el[E], sumFast = 0;
        faste(st).forEach(function (s) { sumFast += st.ox[s] * st.el[s]; });
        if (E === "O" && v === -2) return oxHint(st);
        if (st.q !== 0 && v * n === -sumFast) return "Du har glemt ionens ladning. Summen skal være " + lad(st.q) + ", ikke 0.";
        if (n > 1 && v === st.q - sumFast) return "Der er " + n + " " + E + " i " + st.tekst + ". Del summen mellem dem.";
        if (v === -rigtig) return "Tjek fortegnet. " + fastTekst(st) + ".";
        if (st.q !== 0 && v === st.q) return "Ladningen " + lad(st.q) + " gælder hele " + st.tekst + ", ikke kun " + E + ".";
        return oxHint(st);
    }

    /* ----- Hjælp til trin 3: elektroner pr. atom ------------------------------------- */
    function parTekst(R, P) {
        return R.led[P.v].st.tekst + " ⟶ " + R.led[P.h].st.tekst;
    }

    function eFejl(R, P, v) {
        var st = R.led[P.v].st;
        if (v === null || isNaN(v)) return "Skriv et tal i feltet ved " + P.E + ".";
        v = Math.abs(v);
        if (P.nV > 1 && v === P.delta * P.nV) return "Det er for alle " + P.nV + " " + P.E + " i " + st.tekst + ". Her skal du bruge ét atom.";
        if (v === Math.abs(P.til) || v === Math.abs(P.fra)) return "Det er et oxidationstal. Brug forskellen fra " + ox(P.fra) + " til " + ox(P.til) + ".";
        return P.E + " går fra " + ox(P.fra) + " til " + ox(P.til) + ". Tæl trinene.";
    }

    /* ----- Beregninger, der vises som svar ------------------------------------------ */
    function ladBeregning(R, k, side) {
        var dele = [];
        R.led.forEach(function (l, i) { if (l.side === side) dele.push(k[i] + " · " + ladP(l.st.q)); });
        return dele.join(" + ");
    }

    NK.Redox = {
        stof: stof,
        reaktion: reaktion,
        ladninger: ladninger,
        taelling: taelling,
        skemaTekst: skemaTekst,
        romer: romer,
        ox: ox,
        oxP: oxP,
        lad: lad,
        ladP: ladP,
        laesOx: laesOx,
        laesTal: laesTal,
        oxBeregning: oxBeregning,
        oxHint: oxHint,
        oxFejl: oxFejl,
        eFejl: eFejl,
        parTekst: parTekst,
        ladBeregning: ladBeregning,
        H_ION: H_ION,
        OH_ION: OH_ION,
        VAND: VAND,
        alle: function () {
            if (!this._alle) this._alle = D.REAKTIONER.map(reaktion);
            return this._alle;
        },
        paaNiveau: function (niv) {
            return this.alle().filter(function (R) { return R.niveau === niv; });
        }
    };
}());

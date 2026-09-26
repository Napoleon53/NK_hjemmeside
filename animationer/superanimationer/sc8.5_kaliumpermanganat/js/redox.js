/* =====================================================================
   redox.js - modellen: oxidationstal, klammerne og afstemningen

   Samme model som sc8.4 (oxidationstallene regnes med O = −II og
   H = +I, resten følger af ladningen), men afstemningen regnes, som den
   skrives i hånden med klammer under skemaet:

     1. oxidationstallet over de atomer, der skifter
     2. står grundstoffet ikke lige mange gange på begge sider, sættes
        først et tal foran (I⁻ ⟶ I₂ bliver 2 I⁻ ⟶ I₂)
     3. klammen fra atomet før pilen til atomet efter pilen får den
        samlede stigning (↑) eller det samlede fald (↓) for atomerne på
        klammen
     4. gangetallene: stigning gange tal = fald gange tal, mindste tal
     5. gangetallet (gange tallet fra trin 2) er koefficienten
     6. ladningen, H⁺ eller OH⁻, H-atomerne og vand (O er kontrollen)

   NK.Redox.reaktion(def) regner alt ud af en linje i D.REAKTIONER.
   Hjælpeteksterne til elevens fejl bygges også her.
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
       Tomt giver null, noget ulæseligt NaN. */
    function laesOx(s) {
        var t = NK.ascii(s).replace(/\s+/g, "").toUpperCase();
        if (!t) return null;
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

    function gcd(a, b) { return NK.gcd(a, b); }

    /* ----- En reaktion ----------------------------------------------------------- */
    function reaktion(def) {
        var led = [], nv = def.v.length;
        def.v.forEach(function (f, i) { led.push({ st: stof(f), side: "v", i: i, nr: led.length }); });
        def.h.forEach(function (f, i) { led.push({ st: stof(f), side: "h", i: i, nr: led.length }); });

        /* En klamme: fra grundstoffet i en reaktant til det samme i et produkt */
        function lavKlamme(p, type) {
            var lv = p[0], lh = nv + p[1];
            var A = led[lv].st, B = led[lh].st, E = A.ukendt;
            var fra = A.ox[E], til = B.ox[E];
            var nV = A.el[E], nH = B.el[E], g = gcd(nV, nH);
            var K = {
                type: type, v: lv, h: lh, E: E, fra: fra, til: til, op: til > fra,
                delta: Math.abs(til - fra), nV: nV, nH: nH,
                pv: nH / g, ph: nV / g      /* tallene fra forafstemningen */
            };
            K.antal = K.pv * nV;            /* atomer paa klammen */
            K.tot = K.antal * K.delta;      /* stigningen eller faldet paa klammen */
            K.ePrEnhed = nV * K.delta;      /* elektroner pr. formelenhed foer pilen */
            return K;
        }
        var OX = lavKlamme(def.ox, "ox"), RED = lavKlamme(def.red, "red");
        led[OX.v].rolle = led[OX.h].rolle = "ox";
        led[RED.v].rolle = led[RED.h].rolle = "red";

        /* Gangetallene: stigning gange tal = fald gange tal, mindste tal */
        var g = gcd(OX.tot, RED.tot);
        OX.gange = RED.tot / g;
        RED.gange = OX.tot / g;

        var koef = [];
        led.forEach(function (l, i) { koef[i] = 1; });
        koef[OX.v] = OX.gange * OX.pv; koef[OX.h] = OX.gange * OX.ph;
        koef[RED.v] = RED.gange * RED.pv; koef[RED.h] = RED.gange * RED.ph;

        var R = {
            def: def, id: def.id, miljoe: def.miljoe,
            led: led, ox: OX, red: RED, koef: koef,
            elektroner: OX.gange * OX.tot,
            forafstem: [OX, RED].some(function (K) { return K.pv > 1 || K.ph > 1; })
        };
        R.ionSt = def.miljoe === "surt" ? H_ION : OH_ION;
        R.vandSt = VAND;

        R.ladning = ladninger(R, koef);
        var dq = R.ladning.v - R.ladning.h;
        R.ion = { side: null, antal: 0 };
        /* H⁺ paa den side, der har mindst ladning; OH⁻ paa den med stoerst */
        if (dq && R.ionSt.q > 0) R.ion = { side: dq < 0 ? "v" : "h", antal: Math.abs(dq) };
        if (dq && R.ionSt.q < 0) R.ion = { side: dq > 0 ? "v" : "h", antal: Math.abs(dq) };

        /* Vandet afstemmer H, som man goer i Danmark (hvert H₂O har 2 H), og
           O er kontrollen bagefter (brugerens oenske 26. sept. 2026) */
        R.foer = taelling(R, koef, R.ion, null);
        var dH = (R.foer.v.H || 0) - (R.foer.h.H || 0);
        R.vand = { side: null, antal: 0 };
        if (dH) R.vand = { side: dH < 0 ? "v" : "h", antal: Math.abs(dH) / 2 };
        R.slut = taelling(R, koef, R.ion, R.vand);
        return R;
    }

    /* Ladningen paa hver side med koefficienterne k (og evt. H⁺/OH⁻) */
    function ladninger(R, k, ion) {
        var q = { v: 0, h: 0 };
        R.led.forEach(function (l, i) { q[l.side] += k[i] * l.st.q; });
        if (ion && ion.side) q[ion.side] += ion.antal * R.ionSt.q;
        return q;
    }

    /* Antal af hvert grundstof paa hver side */
    function taelling(R, k, ion, vand) {
        var t = { v: {}, h: {} };
        function laeg(side, st, n) {
            if (!n) return;
            Object.keys(st.el).forEach(function (s) { t[side][s] = (t[side][s] || 0) + n * st.el[s]; });
        }
        R.led.forEach(function (l, i) { laeg(l.side, l.st, k[i]); });
        if (ion && ion.side) laeg(ion.side, R.ionSt, ion.antal);
        if (vand && vand.side) laeg(vand.side, VAND, vand.antal);
        return t;
    }

    /* Det faerdige skema som tekst: 5 SO₃²⁻ + 2 MnO₄⁻ + 6 H⁺ ⟶ ... */
    function skemaTekst(R) {
        var s = { v: [], h: [] };
        R.led.forEach(function (l, i) { s[l.side].push((R.koef[i] === 1 ? "" : R.koef[i] + " ") + l.st.tekst); });
        if (R.ion.side) s[R.ion.side].push(R.ion.antal + " " + R.ionSt.tekst);
        if (R.vand.side) s[R.vand.side].push((R.vand.antal === 1 ? "" : R.vand.antal + " ") + VAND.tekst);
        return s.v.join(" + ") + " ⟶ " + s.h.join(" + ");
    }

    /* ----- Hjaelp til oxidationstallene ------------------------------------------- */
    function faste(st) {
        return Object.keys(st.el).filter(function (s) { return s !== st.ukendt; });
    }

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
        if (E === "O") t = "O er ikke −II her, for O sidder på O. " + t;
        return t + " Summen af oxidationstallene skal være " + sumTekst(st) + ".";
    }

    /* Hvad gik galt, naar eleven skrev v i stedet for det rigtige? */
    function oxFejl(st, v) {
        var E = st.ukendt, rigtig = st.ox[E];
        if (v === null || isNaN(v)) return "Skriv et oxidationstal, fx +VII, −II eller 0.";
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

    /* ----- Hjaelp til klammerne: stigning og fald ------------------------------------ */
    /* "S går fra +IV til +VI" */
    function gaarTekst(K) {
        return K.E + " går fra " + ox(K.fra) + " til " + ox(K.til);
    }

    /* Fejlen i en klamme: retning (true = op) og tallet n */
    function klammeFejl(K, op, n) {
        if (op === null) return "Klik på pilen ved " + K.E + ", så den peger op eller ned.";
        if (n === null || isNaN(n)) return "Skriv, hvor meget " + K.E + " stiger eller falder, i feltet ved pilen.";
        n = Math.abs(n);
        if (op !== K.op) {
            return gaarTekst(K) + ". Tallet bliver " + (K.op ? "større" : "mindre") + ", så pilen skal pege " + (K.op ? "op" : "ned") + ".";
        }
        if (n === K.tot) return "";
        if (K.antal > 1 && n === K.delta) {
            return "Det er for ét " + K.E + ". Der er " + K.antal + " " + K.E + " på klammen, så gang med " + K.antal + ".";
        }
        if (n === Math.abs(K.fra) + Math.abs(K.til) && K.fra * K.til > 0) {
            return "Du har lagt tallene sammen. Hvor mange trin er der fra " + ox(K.fra) + " til " + ox(K.til) + "?";
        }
        if ((n === Math.abs(K.til) || n === Math.abs(K.fra)) && n !== K.delta) {
            return "Det er et oxidationstal. Skriv forskellen fra " + ox(K.fra) + " til " + ox(K.til) + ".";
        }
        return gaarTekst(K) + ". Tæl trinene" + (K.antal > 1 ? ", og gang med de " + K.antal + " " + K.E + " på klammen." : ".");
    }

    /* ----- Hjaelp til ladningen ------------------------------------------------------- */
    function ladBeregning(R, k, side) {
        var dele = [];
        R.led.forEach(function (l, i) {
            if (l.side === side) dele.push((k[i] === 1 ? "" : k[i] + " · ") + ladP(l.st.q));
        });
        return dele.join(" + ");
    }

    /* H-atomerne paa en side, led for led: 5 · 2 + 6 · 1 */
    function brintBeregning(R, side) {
        var dele = [];
        R.led.forEach(function (l, i) {
            var n = l.st.el.H || 0;
            if (l.side === side && n) dele.push((R.koef[i] === 1 ? "" : R.koef[i] + " · ") + n);
        });
        if (R.ion.side === side) dele.push(R.ion.antal + " · 1");
        return dele.join(" + ") || "0";
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
        gaarTekst: gaarTekst,
        klammeFejl: klammeFejl,
        ladBeregning: ladBeregning,
        brintBeregning: brintBeregning,
        H_ION: H_ION,
        OH_ION: OH_ION,
        VAND: VAND,
        alle: function () {
            if (!this._alle) this._alle = D.REAKTIONER.map(reaktion);
            return this._alle;
        }
    };
}());

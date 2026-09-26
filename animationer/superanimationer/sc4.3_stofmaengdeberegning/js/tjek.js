/* =====================================================================
   tjek.js - enhederne, formlerne og tallene

   Enhederne regnes som potenser af g, mol og L: m er g¹, M er g¹ mol⁻¹
   og n er mol¹. Saa kan enhver formel, eleven bygger eller skriver,
   faa sin enhed regnet ud, og fejlen kan forklares med den: "Brøken er
   vendt om. Enhederne giver (g/mol) / g = 1/mol, ikke mol."

   En formel tjekkes ved at regne den ud. Hvert bogstav faar et fast
   proevetal, hvor n = m / M passer. Saa er "m/M", "n = m/M" og
   "n(NaCl) = m(NaCl) / M" det samme, og en omskrevet formel (n = m / M,
   naar m skal findes) godkendes med den isolerede vist.

   Et tal er rigtigt, naar det hoejst er 1 % fra facit, og enheden skal
   skrives med. De typiske fejl (ganget i stedet for delt, broeken vendt
   om, den forkerte molarmasse) regnes ud af opgavens egne tal.

   Svarene er { ok, besked, note, tom }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var T = {};
    var TOL = 0.01;

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-12;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    /* ----- Enhederne ------------------------------------------------------------- */
    var GRUND = ["g", "mol", "L"];

    function enhedGang(a, b, fortegn) {
        var ud = {};
        GRUND.forEach(function (x) {
            var v = (a[x] || 0) + fortegn * (b[x] || 0);
            if (v) ud[x] = v;
        });
        return ud;
    }

    /* Enheden af et udtryk (et traeet fra parse eller brikkerne) */
    function enhedAf(n) {
        if (n.s !== undefined) return D.SYMBOL[n.s] ? D.SYMBOL[n.s].enhed : {};
        if (n.tal !== undefined) return {};
        if (n.op === "neg") return enhedAf(n.a);
        if (n.op === "*") return enhedGang(enhedAf(n.a), enhedAf(n.b), 1);
        if (n.op === "/") return enhedGang(enhedAf(n.a), enhedAf(n.b), -1);
        return enhedAf(n.a);
    }
    T.enhedAf = enhedAf;

    T.enhedEns = function (a, b) {
        return GRUND.every(function (x) { return (a[x] || 0) === (b[x] || 0); });
    };

    /* {g: 1, mol: -1} -> "g/mol", {mol: -1} -> "1/mol", {g: 2, mol: -1} -> "g²/mol" */
    T.enhedTekst = function (e) {
        var op = [], ned = [];
        GRUND.forEach(function (x) {
            var v = e[x] || 0;
            if (v > 0) op.push(x + (v > 1 ? NK.haevet(v) : ""));
            if (v < 0) ned.push(x + (v < -1 ? NK.haevet(-v) : ""));
        });
        if (!op.length && !ned.length) return "ingen enhed";
        var t = op.length ? op.join(" · ") : "1";
        if (ned.length) t += "/" + (ned.length > 1 ? "(" + ned.join(" · ") + ")" : ned[0]);
        return t;
    };

    /* Udtrykket med enhederne sat ind: M / m -> "(g/mol) / g" */
    function medEnheder(n, forael, hoejreBarn) {
        if (n.s !== undefined) {
            var t = T.enhedTekst(enhedAf(n));
            if (t === "ingen enhed") t = "1";
            return forael === "/" && /\//.test(t) ? "(" + t + ")" : t;
        }
        if (n.tal !== undefined) return NK.betydende(n.tal, 3);
        if (n.op === "neg") return "−" + medEnheder(n.a, "neg");
        var a = medEnheder(n.a, n.op, false), b = medEnheder(n.b, n.op, true);
        var ud = a + (n.op === "*" ? " · " : " / ") + b;
        return forael && (forael !== n.op || (forael === "/" && hoejreBarn)) ? "(" + ud + ")" : ud;
    }
    T.medEnheder = medEnheder;

    /* ----- Formlen: fra tekst til noget, der kan regnes ud -------------------------
       Haevede og saenkede tegn bliver almindelige, og (NaCl) og andre
       etiketter forsvinder. m og M er to ting, og det er n og N ogsaa. */
    function norm(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/÷/g, "/").replace(/:/g, "/");
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/\(([^()]*)\)/g, function (hel, ind) {
            if (!/[A-Za-zÆØÅæøå]/.test(ind) || /[+\-*\/]/.test(ind) || /^[nmMNVc]$/.test(ind)) return hel;
            return "";
        });
        return s.replace(/v/g, "V").replace(/C/g, "c");
    }

    function tokens(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if ("nmMNVc".indexOf(ch) >= 0) {
                ud.push({ t: "s", v: ch }); i++;
            } else if (/[0-9]/.test(ch)) {
                var j = i;
                while (j < s.length && /[0-9.,]/.test(s[j])) j++;
                ud.push({ t: "t", v: parseFloat(s.slice(i, j).replace(",", ".")) });
                i = j;
            } else if ("+-*/()".indexOf(ch) >= 0) {
                ud.push({ t: ch }); i++;
            } else {
                return null;
            }
        }
        return ud;
    }

    /* Et lille udtryk med underforstaaet gangetegn (nM = n · M) */
    function parse(tk) {
        var p = 0;
        function kig() { return tk[p]; }
        function sum() {
            var n = prod();
            if (!n) return null;
            while (kig() && (kig().t === "+" || kig().t === "-")) {
                var op = tk[p++].t, h = prod();
                if (!h) return null;
                n = { op: op, a: n, b: h };
            }
            return n;
        }
        function prod() {
            var n = faktor();
            if (!n) return null;
            for (;;) {
                var k = kig();
                if (k && (k.t === "*" || k.t === "/")) {
                    p++;
                    var h = faktor();
                    if (!h) return null;
                    n = { op: k.t, a: n, b: h };
                } else if (k && (k.t === "s" || k.t === "t" || k.t === "(")) {
                    var h2 = faktor();
                    if (!h2) return null;
                    n = { op: "*", a: n, b: h2 };
                } else break;
            }
            return n;
        }
        function faktor() {
            var k = kig();
            if (!k) return null;
            if (k.t === "-") { p++; var f = faktor(); return f ? { op: "neg", a: f } : null; }
            if (k.t === "s") { p++; return { s: k.v }; }
            if (k.t === "t") { p++; return { tal: k.v }; }
            if (k.t === "(") {
                p++;
                var n = sum();
                if (!n || !kig() || kig().t !== ")") return null;
                p++;
                return n;
            }
            return null;
        }
        var ud = sum();
        return ud && p === tk.length ? ud : null;
    }

    function laes(tekst) {
        var tk = tokens(tekst);
        if (!tk || !tk.length) return null;
        return parse(tk);
    }
    T.laes = function (raa) { return laes(norm(raa)); };

    /* Proevetallene: n = m / M passer, og ingen to forskellige udtryk giver
       det samme tal. N, V og c har deres egne. */
    var U = { n: 0.7313, M: 58.37, N: 3.917, V: 1.917 };
    U.m = U.n * U.M;
    U.c = U.n / U.V;

    function regn(n) {
        if (n.s !== undefined) return U[n.s];
        if (n.tal !== undefined) return n.tal;
        if (n.op === "neg") return -regn(n.a);
        var a = regn(n.a), b = regn(n.b);
        if (n.op === "+") return a + b;
        if (n.op === "-") return a - b;
        if (n.op === "*") return a * b;
        return a / b;
    }

    function bogstaver(n, ud) {
        ud = ud || {};
        if (n.s !== undefined) ud[n.s] = true;
        if (n.a) bogstaver(n.a, ud);
        if (n.b) bogstaver(n.b, ud);
        return ud;
    }
    T.bogstaver = bogstaver;

    function harTal(n) {
        if (n.tal !== undefined) return true;
        return !!((n.a && harTal(n.a)) || (n.b && harTal(n.b)));
    }

    /* Navnene, som de staar i en saetning */
    var NAVN = { n: "stofmængden n", m: "massen m", M: "molarmassen M" };
    T.NAVN = NAVN;

    /* De bogstaver, der hoerer til andre formler */
    var LOKKER = {
        N: "N er antallet af partikler. Stofmængden er lille n.",
        V: "V er et rumfang. Her er der ingen opløsning, kun et pulver.",
        c: "c er en koncentration. Her er der ingen opløsning, kun et pulver."
    };
    T.LOKKER = LOKKER;

    /* De typiske fejl for hvert maal og det, de hedder */
    var KENDTE = {
        n: [["M/m", "Brøken er vendt om."], ["m*M", "Du har ganget."], ["m", "Det er massen alene."], ["M", "Det er molarmassen alene."]],
        m: [["n/M", "Du har delt."], ["M/n", "Du har delt."], ["n", "Det er stofmængden alene."], ["M", "Det er molarmassen alene."]],
        M: [["n/m", "Brøken er vendt om."], ["m*n", "Du har ganget."], ["m", "Det er massen alene."], ["n", "Det er stofmængden alene."]]
    };

    /* Er hoejresiden rigtig for maal? */
    T.ensMed = function (maal, hoejre) {
        return naer(regn(hoejre), U[maal], 1e-6);
    };

    /* Beskeden til en forkert hoejreside: den typiske fejl og enheden,
       den giver. Kaldes ogsaa med brikkerne paa fane 1. */
    T.fejlBesked = function (maal, hoejre) {
        var b = bogstaver(hoejre);
        var lokker = Object.keys(LOKKER).filter(function (x) { return b[x]; });
        if (lokker.length) return LOKKER[lokker[0]];
        if (b[maal]) return NAVN[maal].charAt(0).toUpperCase() + NAVN[maal].slice(1) + " skal stå alene. Den må ikke også stå på den anden side.";
        var v = regn(hoejre), navn = "";
        var liste = KENDTE[maal] || [];
        for (var i = 0; i < liste.length; i++) {
            if (naer(v, regn(laes(liste[i][0])), 1e-6)) { navn = liste[i][1]; break; }
        }
        var e = enhedAf(hoejre), maalE = D.SYMBOL[maal].enhed;
        var et = T.enhedTekst(e);
        if (!T.enhedEns(e, maalE)) {
            var regnet = medEnheder(hoejre);
            var saetning = regnet === et ? "Enheden bliver " + et : "Enhederne giver " + regnet + " = " + et;
            if (et === "ingen enhed") saetning = "Enhederne giver " + regnet + ", og så er der ingen enhed tilbage";
            return (navn ? navn + " " : "") + saetning + ", men " + NAVN[maal].split(" ")[0] + " er i " + D.ENHED_TEKST[maal] + ".";
        }
        return navn || "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast.";
    };

    /* En formel, bygget eller skrevet: venstre (et bogstav eller null) og
       hoejre (et traee). Giver { ok, note, besked }. */
    T.vurder = function (maal, venstre, hoejre) {
        if (venstre && LOKKER[venstre]) return { besked: LOKKER[venstre] };
        if (venstre && venstre !== maal) {
            var sand = naer(U[venstre], regn(hoejre), 1e-6);
            if (sand && bogstaver(hoejre)[maal]) return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
            if (sand) return { besked: "Den sammenhæng er rigtig, men den giver ikke " + maal + "." };
            return { besked: "Her skal du finde " + NAVN[maal] + ". Den skal stå alene på venstre side." };
        }
        if (T.ensMed(maal, hoejre)) return { ok: true };
        return { besked: T.fejlBesked(maal, hoejre) };
    };

    /* Formlen skrevet i et felt: "n = m / M", "m/M", "n(NaCl) = m/M" */
    T.formel = function (maal, raa) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = norm(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug bogstaverne n, m og M." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        for (var i = 0; i < dele.length; i++) {
            var p = laes(dele[i]);
            if (!p) {
                if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med bogstaver først. Tallene kommer bagefter." };
                return kanIkke;
            }
            led.push(p);
        }
        if (led.every(function (p) { return harTal(p) && !Object.keys(bogstaver(p)).length; })) {
            return { besked: "Skriv formlen med bogstaver først. Tallene kommer bagefter." };
        }
        var hoejre = led[led.length - 1];
        if (led.length === 1) return T.vurder(maal, null, hoejre);
        var v = led[0];
        if (v.s === undefined) {
            /* Fx "m / M = n": vend den om */
            if (hoejre.s !== undefined) return T.vurder(maal, hoejre.s, v);
            return { besked: "Skriv formlen med ét bogstav på venstre side, fx " + maal + " = …" };
        }
        return T.vurder(maal, v.s, hoejre);
    };

    /* ----- Tallet med enheden ---------------------------------------------------------
       "2,00 mol", "2 mol", "2,5·10^-1 mol", "74,55 g/mol", "74,55 g mol-1" */
    function normEnhed(raa) {
        var s = NK.ascii(String(raa || "")).toLowerCase().replace(/\s+/g, "").replace(/[·×∙•⋅*]/g, "");
        s = s.replace(/^gram/, "g").replace(/^mole?s?/, "mol").replace(/\/mole?s?$/, "/mol");
        if (/^g(mol\^?-1|\/mol)$/.test(s)) return "g/mol";
        if (/^mol(g\^?-1|\/g)$/.test(s)) return "mol/g";
        return s;
    }
    T.normEnhed = normEnhed;

    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.svar = function (raa) {
        var s = String(raa || "").trim();
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s);
        var m = s.match(/^([-+]?(?:\d+(?:[.,]\d*)?|[.,]\d+))(?:\s*[·×x*]\s*10\s*\^?\s*([-+]?\d+)|[eE]([-+]?\d+))?\s*(.*)$/);
        if (!m) return null;
        var foran = parseFloat(m[1].replace(",", "."));
        var e = m[2] !== undefined ? m[2] : m[3];
        return { v: e !== undefined ? foran * Math.pow(10, parseInt(e, 10)) : foran, enhed: normEnhed(m[4]), raaEnhed: m[4].trim() };
    };

    /* Den enhedsregning, der viser, hvad enheden bliver */
    var ENHEDSREGNING = { n: "g / (g/mol)", m: "mol · g/mol", M: "g / mol" };
    T.ENHEDSREGNING = ENHEDSREGNING;

    /* De typiske fejl i tallet, regnet ud af opgavens tal */
    function kandidater(id, o) {
        var t = o.tal, f = o.facit, st = o.st, st2 = o.st2;
        switch (id) {
        case "n":
            return { facit: f.n, fejl: [
                [t.m * st.Mv, "Du har ganget. Del massen med molarmassen."],
                [st.Mv / t.m, "Brøken er vendt om. Massen står øverst."],
                [t.m, "Det er massen. Del den med molarmassen."]] };
        case "m":
            var M = (st2 || st).Mv, n = f.n;
            var liste = [
                [n / M, "Du har delt. Gang stofmængden med molarmassen."],
                [M / n, "Du har delt. Gang stofmængden med molarmassen."],
                [M, "Det er massen af 1 mol. Gang med stofmængden."]];
            if (st2) {
                liste.push([t.m, "Det er massen af " + st.navn + ". Brug molarmassen for " + st2.navn + "."]);
            }
            return { facit: f.m, fejl: liste };
        case "M":
            return { facit: f.M, fejl: [
                [t.n / f.m, "Brøken er vendt om. Massen står øverst."],
                [f.m * t.n, "Du har ganget. Del massen med stofmængden."],
                [f.m, "Det er massen. Del den med stofmængden."]] };
        }
        return null;
    }
    T.kandidater = kandidater;

    function kommaFlyttet(v, facit) {
        for (var k = 1; k <= 4; k++) {
            var f = Math.pow(10, k);
            if (naer(v, facit * f) || naer(v, facit / f)) return true;
        }
        return false;
    }

    T.trin = function (id, raa, o) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet og enheden." };
        var s = T.svar(raa);
        if (!s) return { besked: "Skriv et tal og en enhed, fx 2,00 " + D.ENHED_TEKST[id] + "." };
        var k = kandidater(id, o), v = s.v, enhed = D.ENHED_TEKST[id];
        if (naer(v, k.facit)) {
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed !== enhed) {
                return { besked: "Tallet er rigtigt, men " + s.raaEnhed + " er ikke enheden for " + NAVN[id].split(" ")[0] +
                    ". Regn enhederne: " + ENHEDSREGNING[id] + ".", talOk: true };
            }
            return { ok: true };
        }
        for (var i = 0; i < k.fejl.length; i++) {
            var fv = k.fejl[i][0];
            if (isFinite(fv) && fv > 0 && naer(v, fv)) return { besked: k.fejl[i][1] };
        }
        if (kommaFlyttet(v, k.facit)) return { besked: "Tjek kommaet. Tallet er " + (v > k.facit ? "for stort." : "for lille.") };
        if (naer(v, k.facit, 0.04)) return { besked: "Tæt på. Regn med alle cifrene." };
        return { besked: "Det passer ikke. Tryk på Giv hint, hvis du sidder fast." };
    };

    /* ----- Tal som tekst ------------------------------------------------------------ */
    T.mol = function (v) { return NK.betydende(v, 3); };               /* 2,00  0,250  0,0500 */
    T.g = function (v) { return NK.tal2(v); };                         /* 116,88 */
    T.Mtal = function (v) { return NK.betydende(v, 4); };              /* 74,55  106,0 */

    /* ----- Den paene beregning: [formlen, tallene] ------------------------------------ */
    T.venstre = function (id, o) {
        var st = id === "m" && o.st2 ? o.st2 : o.st;
        if (id === "M") return o.id === "M" ? "M" : "M(" + st.formel + ")";
        return D.TRIN[id].venstre + "(" + st.formel + ")";
    };

    T.formelTekst = function (id, o) {
        return T.venstre(id, o) + " = " + D.TRIN[id].formel;
    };

    T.regning = function (id, o) {
        var t = o.tal, f = o.facit, fl = T.formelTekst(id, o);
        switch (id) {
        case "n": return [fl, "= " + T.g(t.m) + " g / " + NK.komma(o.st.M) + " g/mol = " + T.mol(f.n) + " mol"];
        case "m":
            var st = o.st2 || o.st;
            return [fl, "= " + T.mol(f.n) + " mol · " + NK.komma(st.M) + " g/mol = " + T.g(f.m) + " g"];
        case "M": return [fl, "= " + T.g(f.m) + " g / " + T.mol(t.n) + " mol = " + T.Mtal(f.M) + " g/mol"];
        }
        return [fl, ""];
    };

    /* Facit med enhed, som det staar i feltet, naar trinnet er loest */
    T.facitTekst = function (id, o) {
        var f = o.facit;
        if (id === "n") return T.mol(f.n) + " mol";
        if (id === "m") return T.g(f.m) + " g";
        return T.Mtal(f.M) + " g/mol";
    };

    /* Hintet til tallet: tallene sat ind med enhederne */
    T.talHint = function (id, o) {
        var r = T.regning(id, o);
        var ind = r[1].slice(2).split(" = ")[0];
        return "Sæt tallene ind med enhederne: " + T.venstre(id, o) + " = " + ind + ".";
    };

    /* ----- Linjen med enhederne, der gaar ud med hinanden --------------------------------
       Dele med s: 1 streges over. Den sidste del er resultatet. */
    T.ENHEDSLINJE = {
        n: [{ t: "g / (g/mol) = " }, { t: "g", s: 1 }, { t: " · mol/" }, { t: "g", s: 1 }, { t: " = " }, { t: "mol", fed: 1 }],
        m: [{ t: "mol", s: 1 }, { t: " · g/" }, { t: "mol", s: 1 }, { t: " = " }, { t: "g", fed: 1 }],
        M: [{ t: "g / mol = " }, { t: "g/mol", fed: 1 }]
    };

    NK.Tjek = T;
}());

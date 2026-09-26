/* =====================================================================
   tjek.js - regnetrinene paa fane 2 og 3: opløsningsskemaet, formlen,
   tallet og den paene beregning

   Opløsningsskemaet: eleven skriver tallene foran ionerne. En fejl faar
   en besked, der passer til den: ladningen i stedet for antallet, O i
   sulfat-ionen, parentesen, der gaelder hele ionen.

   Formlen tjekkes som i sc5.1 ved at regne den ud med faste proevetal.
   [Cl⁻] og andre ioner i firkantet parentes laeses som en koncentration,
   (NaCl), (A) og (B) er etiketter. I en blanding skal tallet foran
   ionen med: n = 2 · c · V for CaCl₂.

   Et tal er rigtigt, naar det hoejst er 1 % fra facit. De typiske fejl
   regnes ud af opgavens egne tal og faar deres egen besked.

   Svarene er { ok, besked, note, tom }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet (som sc5.1) ------------------------------------------------------- */
    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.tal = function (raa) {
        var s = String(raa || "");
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s).replace(/\s+/g, "");
        s = s.replace(/(g\/mol|mol\/l|mol|ml|l|g|m)$/i, "");
        s = s.replace(/[·×x*X]/g, "*");
        var m = s.match(/^([-+]?\d*(?:[.,]\d+)?)(?:\*10\^?([-+]?\d+)|[eE]([-+]?\d+))?$/);
        if (!m || !/\d/.test(m[1])) return null;
        var foran = parseFloat(m[1].replace(",", "."));
        var e = m[2] !== undefined ? m[2] : m[3];
        return { v: e !== undefined ? foran * Math.pow(10, parseInt(e, 10)) : foran };
    };

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-12;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    /* ----- Formlen: fra tekst til noget, der kan regnes ud (som sc5.1) ------------------ */
    function norm(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/\[[^\]]*\]/g, "c");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/:/g, "/");
        s = s.replace(/[_{}]/g, "");
        /* Ladningen paa en ion i en etiket, fx n(Cl-), (SO42-) */
        s = s.replace(/([A-Za-z0-9])[+-]+\)/g, "$1)");
        /* Etiketter som (Al2(SO4)3) fjernes indefra og ud */
        for (var gang = 0; gang < 4; gang++) {
            var foer = s;
            s = s.replace(/\(([^()]*)\)(\d*)/g, function (hel, ind, efter) {
                if (!/[A-Za-zÆØÅæøå]/.test(ind) || /[+\-*\/]/.test(ind) || /^[cnvmCNV][12]?$|^M$/.test(ind)) return hel;
                return /[A-Z]/.test(ind) && efter ? "" : (efter ? efter : "");
            });
            if (s === foer) break;
        }
        /* V(A), VA, Vsamlet og lignende er bare V */
        s = s.replace(/([cnvCNV])(samlet|total|ialt|tot|a|b)(?![a-zæøå])/gi, "$1");
        return s.split("").map(function (c) { return c === "M" ? c : c.toLowerCase(); }).join("");
    }

    function tokens(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if ("cnvmM".indexOf(ch) >= 0) {
                var nav = ch;
                if ((s[i + 1] === "1" || s[i + 1] === "2") && !/[0-9.,]/.test(s[i + 2] || "")) { nav += s[i + 1]; i++; }
                ud.push({ t: "s", v: nav });
                i++;
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

    function regn(n, U) {
        if (n.s !== undefined) return U[n.s];
        if (n.tal !== undefined) return n.tal;
        if (n.op === "neg") return -regn(n.a, U);
        var a = regn(n.a, U), b = regn(n.b, U);
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

    function harTal(n) {
        if (n.tal !== undefined) return true;
        return !!((n.a && harTal(n.a)) || (n.b && harTal(n.b)));
    }

    /* Proevetallene: c = n / V og m = n · M passer */
    var U = (function () {
        var u = { M: 58.37, n: 0.7313, v: 1.917 };
        u.m = u.n * u.M;
        u.c = u.n / u.v;
        return u;
    }());
    var ALIAS = { c1: "c", c2: "c", v1: "v", v2: "v", n1: "n", n2: "n" };
    var VIS = { c: "c", n: "n", v: "V", m: "m", M: "M" };

    function oversaet(n) {
        if (n.s !== undefined) return ALIAS[n.s] ? { s: ALIAS[n.s] } : n;
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
        if (n.a) ud.a = oversaet(n.a);
        if (n.b) ud.b = oversaet(n.b);
        return ud;
    }

    function laes(tekst) {
        var tk = tokens(tekst);
        if (!tk || !tk.length) return null;
        var p = parse(tk);
        return p ? oversaet(p) : null;
    }

    /* Reglerne pr. trin: maal, det man kender, de typiske fejl. k er tallet
       foran ionen i blandingernes stofmaengde (n = k · c · V). */
    var KONC_FEJL = "Koncentrationer kan ikke lægges sammen, når man blander. Brug stofmængden og det samlede rumfang.";
    function regler(id, o) {
        switch (id) {
        case "n_mM": return { maal: "n", kendt: ["m", "M"], vaerdi: U.n,
            fejl: [["m*M", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                   ["M/m", "Brøken er vendt om. Massen står øverst."]] };
        case "c": return { maal: "c", kendt: ["n", "v", "m", "M"], vaerdi: U.c,
            fejl: [["v/n", "Brøken er vendt om. Stofmængden står øverst."],
                   ["n*v", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                   ["m/v", "Her skal du bruge stofmængden n, ikke massen m."]] };
        case "nA":
        case "nB":
            var k = id === "nA" ? o.facit.kA : o.facit.kB;
            var st = D.salt(id === "nA" ? o.tal.A : o.tal.B), ion = D.ion(o.ion).t;
            var fejl = [["c/v", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                        ["v/c", "Stofmængden er koncentration gange rumfang, ikke divideret."]];
            if (k > 1) fejl.unshift(["c*v", "Hver " + st.formel + " giver " + k + " " + ion + ". Gang også med " + k + "."]);
            return { maal: "n", kendt: ["c", "v"], vaerdi: k * U.c * U.v, fejl: fejl };
        case "ionBland":
        case "ion2": return { maal: "c", kendt: ["n", "v"], vaerdi: U.c,
            fejl: [["v/n", "Brøken er vendt om. Stofmængden står øverst."],
                   ["n*v", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                   ["c+c", KONC_FEJL]] };
        }
        return null;
    }

    T.harFormel = function (id) { return !!(D.TRIN[id] && D.TRIN[id].formel); };

    T.formel = function (id, raa, o) {
        var r = regler(id, o);
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = norm(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug bogstaverne c, n, V, m og M, og tal foran." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        for (var i = 0; i < dele.length; i++) {
            var p = laes(dele[i]);
            if (!p) {
                if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med bogstaver først. Tallene kommer i næste felt." };
                return kanIkke;
            }
            led.push(p);
        }
        var alle = {};
        led.forEach(function (p) { bogstaver(p, alle); });
        if (led.every(function (p) { return harTal(p) && !Object.keys(bogstaver(p)).length; })) {
            return { besked: "Skriv formlen med bogstaver først. Tallene kommer i næste felt." };
        }
        if (Object.keys(alle).some(function (b) { return U[b] === undefined; })) return kanIkke;
        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });
        var ukendt = ukendte.length ? VIS[ukendte[0]] + " kender du ikke i dette trin. Brug det, du kender." : "";
        var hoejre = led[led.length - 1];
        if (led.length === 1) {
            var v = regn(hoejre, U);
            if (!ukendt && naer(v, r.vaerdi, 1e-6)) return { ok: true };
            return fejlBesked(r, v, ukendt);
        }
        var venstre = led[0];
        var vH = regn(hoejre, U), vV = regn(venstre, U);
        if (venstre.s === r.maal) {
            if (!ukendt && naer(vH, r.vaerdi, 1e-6)) return { ok: true };
            return fejlBesked(r, vH, ukendt);
        }
        /* En omskrevet formel, fx n = c · V i trinnet for c */
        if (r.vaerdi === U[r.maal] && naer(vV, vH, 1e-6) && alle[r.maal] && !ukendt) {
            return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        return fejlBesked(r, vH, ukendt);
    };

    function fejlBesked(r, v, ukendt) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = laes(r.fejl[i][0]);
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Opløsningsskemaet ------------------------------------------------------------ */
    function heltal(raa) {
        var s = NK.ascii(String(raa || "")).trim();
        if (!s) return null;
        if (!/^\d+$/.test(s)) return NaN;
        return parseInt(s, 10);
    }

    T.afstem = function (o, rawKat, rawAn) {
        var st = D.salt(o.salt), a = heltal(rawKat), b = heltal(rawAn);
        var kat = D.ion(st.kat), an = D.ion(st.an);
        if (a === null || b === null) return { tom: true, besked: "Skriv et tal i begge felter. Også 1." };
        if (isNaN(a) || isNaN(b) || a < 1 || b < 1) return { besked: "Skriv hele tal, fx 1, 2 eller 3." };
        if (a === st.kk && b === st.ka) return { ok: true };
        var sammensat = st.an.length > 2;
        var iParentes = st.formel.indexOf("(") >= 0;
        if (a !== st.kk) {
            if (a === Math.abs(kat.q) && st.kk !== Math.abs(kat.q)) {
                return { besked: NK.ladningstekst(kat.q) + " er ladningen. Tallet foran er, hvor mange " + kat.t + " der er: tallet efter " + st.kat + " i formlen." };
            }
            return { besked: "Tallet foran " + kat.t + " er tallet efter " + st.kat + " i formlen" + (st.kk === 1 ? ". Der står intet, så det er 1." : ".") };
        }
        if (sammensat && iParentes) return { besked: "Parentesen samler ionen. Tallet efter parentesen er antallet af " + an.t + "." };
        if (sammensat) {
            return { besked: "Tallene inde i " + an.t + " hører til ionen selv. Der er " + (st.ka === 1 ? "én" : st.ka) + " " + an.t + " i hver " + st.formel + "." };
        }
        if (b === Math.abs(an.q) && st.ka !== Math.abs(an.q)) {
            return { besked: NK.ladningstekst(an.q) + " er ladningen. Tallet foran er tallet efter " + st.an + " i formlen." };
        }
        return { besked: "Tallet foran " + an.t + " er tallet efter " + st.an + " i formlen" + (st.ka === 1 ? ". Der står intet, så det er 1." : ".") };
    };

    T.afstemHint = function () {
        return "Tallet efter et grundstof i formlen, eller efter en parentes, siger, hvor mange af den ion der er.";
    };

    /* Skemaet paa tavlen: med tal, naar det er loest, ellers med ? */
    T.skemaTekst = function (o, loest) {
        var st = D.salt(o.salt);
        if (loest) return K.skema(st);
        return st.formel + "(s) ⟶ ? " + D.ion(st.kat).t + "(aq) + ? " + D.ion(st.an).t + "(aq)";
    };

    /* ----- Navne og tekster --------------------------------------------------------------- */
    function saltFormel(o) { return D.salt(o.salt).formel; }
    function ionT(id) { return D.ion(id).t; }
    function andenIon(o) { var st = D.salt(o.salt); return o.bag === "kat" ? st.an : st.kat; }
    function givenIon(o) { var st = D.salt(o.salt); return o.bag === "kat" ? st.kat : st.an; }

    T.venstre = function (id, o) {
        var st = o.salt ? D.salt(o.salt) : null;
        switch (id) {
        case "M": return "M(" + saltFormel(o) + ")";
        case "n_mM": return "n(" + saltFormel(o) + ")";
        case "c": return "c(" + saltFormel(o) + ")";
        case "cSalt": return "c(" + saltFormel(o) + ")";
        case "kat": return "[" + ionT(st.kat) + "]";
        case "an": return "[" + ionT(st.an) + "]";
        case "anden": return "[" + ionT(andenIon(o)) + "]";
        case "bidragA": return "[" + ionT(o.ion) + "] fra " + D.salt(o.tal.A).formel;
        case "bidragB": return "[" + ionT(o.ion) + "] fra " + D.salt(o.tal.B).formel;
        case "total": return "[" + ionT(o.ion) + "]";
        case "nA": return "n(" + ionT(o.ion) + ") fra A";
        case "nB": return "n(" + ionT(o.ion) + ") fra B";
        case "Vsum": return "V";
        case "ionBland": return "[" + ionT(o.ion) + "]";
        case "ion2": return "[" + ionT(o.ion2) + "]";
        }
        return "";
    };

    T.formelTekst = function (id, o) {
        var v = T.venstre(id, o);
        if (id === "nA" || id === "nB") {
            var k = id === "nA" ? o.facit.kA : o.facit.kB;
            return v + " = " + (k > 1 ? k + " · " : "") + "c · V";
        }
        return v + (D.TRIN[id].formel ? " = " + D.TRIN[id].formel : "");
    };

    T.formelHint = function (id) { return D.TRIN[id].formelHint || ""; };

    /* ----- Den paene beregning: [venstre og formlen, tallene] ----------------------------- */
    function gange(k, v, enhed) { return (k > 1 ? k + " · " : "") + v + " " + enhed; }

    T.regning = function (id, o) {
        var f = o.facit, t = o.tal || {}, st = o.salt ? D.salt(o.salt) : null;
        var v = T.venstre(id, o);
        switch (id) {
        case "M": return [v + " = " + D.molarLed(st), "= " + K.M(st) + " g/mol"];
        case "n_mM": return [v + " = m / M", "= " + K.g(o.m) + " g / " + K.M(st) + " g/mol = " + K.mol(f.n_mM) + " mol"];
        case "c": return [v + " = n / V", "= " + K.mol(f.n_mM) + " mol / " + K.L(o.V) + " L = " + K.c(f.c) + " M"];
        case "kat":
        case "an":
        case "anden":
            var ion = id === "kat" ? st.kat : (id === "an" ? st.an : andenIon(o));
            var k = K.k(st, ion);
            if (k === 1) return [v + " = c(" + st.formel + ")", "= " + K.c(f.c) + " M"];
            return [v + " = " + k + " · c(" + st.formel + ")", "= " + k + " · " + K.c(f.c) + " M = " + K.c(k * f.c) + " M"];
        case "cSalt":
            var g = givenIon(o), kg = K.k(st, g);
            if (kg === 1) return [v + " = [" + ionT(g) + "]", "= " + K.c(o.ionC) + " M"];
            return [v + " = [" + ionT(g) + "] / " + kg, "= " + K.c(o.ionC) + " M / " + kg + " = " + K.c(f.cSalt) + " M"];
        case "bidragA": return [v + " = " + gange(f.kA, "c(" + D.salt(t.A).formel + ")", "").trim(),
            "= " + gange(f.kA, K.c(t.cA), "M") + (f.kA > 1 ? " = " + K.c(f.bidragA) + " M" : "")];
        case "bidragB": return [v + " = " + gange(f.kB, "c(" + D.salt(t.B).formel + ")", "").trim(),
            "= " + gange(f.kB, K.c(t.cB), "M") + (f.kB > 1 ? " = " + K.c(f.bidragB) + " M" : "")];
        case "total": return [v, "= " + K.c(f.bidragA) + " M + " + K.c(f.bidragB) + " M = " + K.c(f.total) + " M"];
        case "nA": return [T.formelTekst(id, o), "= " + gange(f.kA, K.c(t.cA), "M") + " · " + K.L(t.VA) + " L = " + K.mol(f.nA) + " mol"];
        case "nB": return [T.formelTekst(id, o), "= " + gange(f.kB, K.c(t.cB), "M") + " · " + K.L(t.VB) + " L = " + K.mol(f.nB) + " mol"];
        case "Vsum": return ["V = V(A) + V(B)", "= " + K.mL(t.VA) + " mL + " + K.mL(t.VB) + " mL = " + K.mL(t.VA + t.VB) + " mL = " + K.L(t.VA + t.VB) + " L"];
        case "ionBland":
            var nt = f.nA > 0 && f.nB > 0 ? "(" + K.mol(f.nA) + " mol + " + K.mol(f.nB) + " mol)" : K.mol(f.nA + f.nB) + " mol";
            return [v + " = n / V", "= " + nt + " / " + K.L(t.VA + t.VB) + " L = " + K.c(f.ionBland) + " M"];
        case "ion2": return [v + " = n / V", "= " + K.mol(f.n2) + " mol / " + K.L(t.VA + t.VB) + " L = " + K.c(f.ion2) + " M"];
        }
        return [v, ""];
    };

    T.facitTekst = function (id, o) {
        var f = o.facit, st = o.salt ? D.salt(o.salt) : null;
        switch (id) {
        case "M": return K.M(st) + " g/mol";
        case "n_mM": return K.mol(f.n_mM) + " mol";
        case "nA": return K.mol(f.nA) + " mol";
        case "nB": return K.mol(f.nB) + " mol";
        case "Vsum": return K.L(o.tal.VA + o.tal.VB) + " L";
        }
        var v = f[id];
        return K.c(v) + " M";
    };

    /* Hintet til tallet */
    T.talHint = function (id, o) {
        var st = o.salt ? D.salt(o.salt) : null, t = o.tal || {}, f = o.facit;
        var r = T.regning(id, o);
        var ind = r[1].slice(2).split(" = ")[0];
        switch (id) {
        case "M": return "Slå atommasserne op, og læg dem sammen: " + D.molarLed(st) + ".";
        case "kat":
        case "an":
        case "anden":
            var ion = id === "kat" ? st.kat : (id === "an" ? st.an : andenIon(o));
            var k = K.k(st, ion);
            return "Tallet foran " + ionT(ion) + " i skemaet er " + k + ". " + (k === 1 ? "Så er [" + ionT(ion) + "] lig med c(" + st.formel + ")." :
                "Gang c(" + st.formel + ") med " + k + ".");
        case "cSalt":
            var g = givenIon(o), kg = K.k(st, g);
            return kg === 1 ? "Der er én " + ionT(g) + " for hver " + st.formel + ". Så er c(" + st.formel + ") lig med [" + ionT(g) + "]." :
                "Der er " + kg + " " + ionT(g) + " for hver " + st.formel + ". Del [" + ionT(g) + "] med " + kg + ".";
        case "bidragA":
        case "bidragB":
            var kk = id === "bidragA" ? f.kA : f.kB, s2 = D.salt(id === "bidragA" ? t.A : t.B);
            return "Hver " + s2.formel + " giver " + kk + " " + ionT(o.ion) + ". Sæt ind: " + T.venstre(id, o) + " = " + ind + ".";
        case "total": return "Ionerne er i det samme glas. Læg bidragene sammen.";
        case "Vsum": return "Læg rumfangene sammen, og regn om til liter: 1000 mL = 1 L.";
        }
        var mL = "";
        if (id === "c") mL = "Husk: " + K.mL(o.V) + " mL = " + K.L(o.V) + " L. ";
        if (id === "nA") mL = "Husk: " + K.mL(t.VA) + " mL = " + K.L(t.VA) + " L. ";
        if (id === "nB") mL = "Husk: " + K.mL(t.VB) + " mL = " + K.L(t.VB) + " L. ";
        return mL + "Sæt tallene ind: " + T.venstre(id, o) + " = " + ind + ".";
    };

    /* ----- Tallet: facit og de typiske fejl ------------------------------------------- */
    function kandidater(id, o) {
        var f = o.facit, t = o.tal || {}, st = o.salt ? D.salt(o.salt) : null;
        var ML = "Rumfanget skal være i liter.";
        switch (id) {
        case "M":
            var glemt = [], TAEL = "Tæl atomerne. Et tal efter en parentes gælder alt i parentesen: " + D.molarLed(st) + ".";
            Object.keys(st.antal).forEach(function (g) {
                if (st.antal[g] > 1) glemt.push([(st.M - D.ATOMMASSE[g] * (st.antal[g] - 1)) / 100, TAEL]);
            });
            var enkelt = D.atomer(st.id.replace(/\)\d+/g, ")"));
            glemt.push([Object.keys(enkelt).reduce(function (s, g) { return s + D.ATOMMASSE[g] * enkelt[g]; }, 0) / 100, TAEL]);
            return { facit: st.Mv, absTol: 0.06, fejl: glemt };
        case "n_mM":
            return { facit: f.n_mM, fejl: [[o.m * st.Mv, "Du har ganget. n = m / M."], [st.Mv / o.m, "Brøken er vendt om. n = m / M."],
                [o.m, "Det er massen. Del den med molarmassen."]] };
        case "c":
            return { facit: f.c, fejl: [[f.n_mM / o.V, "Rumfanget skal være i liter: " + K.mL(o.V) + " mL = " + K.L(o.V) + " L."],
                [(o.V / 1000) / f.n_mM, "Brøken er vendt om. c = n / V."], [f.n_mM * o.V / 1000, "Du har ganget. c = n / V."],
                [f.n_mM, "Det er stofmængden. Del den med rumfanget."]] };
        case "kat":
        case "an":
        case "anden":
            var ion = id === "kat" ? st.kat : (id === "an" ? st.an : andenIon(o));
            var k = K.k(st, ion), anden = ion === st.kat ? st.an : st.kat, ka = K.k(st, anden);
            var fl = [];
            if (k > 1) {
                fl.push([f.c, "Det er c(" + st.formel + "). Hver " + st.formel + " giver " + k + " " + ionT(ion) + "."]);
                fl.push([f.c / k, "Du har divideret. Der er " + k + " " + ionT(ion) + " for hver " + st.formel + ", så [" + ionT(ion) + "] er større."]);
            }
            if (ka !== k) fl.push([ka * f.c, "Det er [" + ionT(anden) + "]. Se på tallet foran " + ionT(ion) + "."]);
            if (o.bag) fl.push([o.ionC, "Det er den målte ion. Her skal du finde [" + ionT(ion) + "]."]);
            return { facit: k * f.c, fejl: fl };
        case "cSalt":
            var g = givenIon(o), kg = K.k(st, g);
            var fc = [];
            if (kg > 1) {
                fc.push([o.ionC * kg, "Omvendt. Der er " + kg + " " + ionT(g) + " for hver " + st.formel + ", så c(" + st.formel + ") er mindre end [" + ionT(g) + "]."]);
                fc.push([o.ionC, "Del med " + kg + ". Der er " + kg + " " + ionT(g) + " for hver " + st.formel + "."]);
            }
            return { facit: f.cSalt, fejl: fc };
        case "bidragA":
        case "bidragB":
            var kb = id === "bidragA" ? f.kA : f.kB, cb = id === "bidragA" ? t.cA : t.cB, sb = D.salt(id === "bidragA" ? t.A : t.B);
            return { facit: kb * cb, fejl: kb > 1 ? [[cb, "Hver " + sb.formel + " giver " + kb + " " + ionT(o.ion) + ". Gang med " + kb + "."]] : [] };
        case "total":
            return { facit: f.total, fejl: [[t.cA + t.cB, "Husk tallet foran " + ionT(o.ion) + " i begge salte."],
                [f.total / 2, "Ionerne er i det samme glas. Bidragene lægges sammen, ikke midles."]] };
        case "nA":
        case "nB":
            var kn = id === "nA" ? f.kA : f.kB, cn = id === "nA" ? t.cA : t.cB, Vn = id === "nA" ? t.VA : t.VB;
            var sn = D.salt(id === "nA" ? t.A : t.B), fn = [];
            if (kn > 1) fn.push([cn * Vn / 1000, "Hver " + sn.formel + " giver " + kn + " " + ionT(o.ion) + ". Gang også med " + kn + "."]);
            fn.push([kn * cn * Vn, "Rumfanget skal være i liter: " + K.mL(Vn) + " mL = " + K.L(Vn) + " L."]);
            fn.push([kn * cn, "Det er koncentrationen af " + ionT(o.ion) + ". Gang med rumfanget i liter."]);
            return { facit: kn * cn * Vn / 1000, fejl: fn };
        case "Vsum":
            return { facit: f.Vsum, fejl: [[t.VA + t.VB, "Det er i mL. Skriv det i liter."],
                [t.VA / 1000, "Læg begge rumfang sammen."], [t.VB / 1000, "Læg begge rumfang sammen."]] };
        case "ionBland":
            var cA = f.kA * t.cA, cB = f.kB * t.cB;
            return { facit: f.ionBland, fejl: [[cA + cB, KONC_FEJL],
                [(f.nA + f.nB) / (t.VA / 1000), "Brug det samlede rumfang."], [(f.nA + f.nB) / (t.VB / 1000), "Brug det samlede rumfang."],
                [(f.nA + f.nB) / (t.VA + t.VB), ML], [f.nA / f.Vsum, "Brug stofmængden fra begge glas."],
                [f.nB / f.Vsum, "Brug stofmængden fra begge glas."], [(cA + cB) / 2, "Gennemsnittet passer kun, når rumfangene er ens. Brug stofmængderne."]] };
        case "ion2":
            var egen = f.k2A > 0 ? f.k2A * t.cA : f.k2B * t.cB;
            var Vegen = f.k2A > 0 ? t.VA : t.VB;
            return { facit: f.ion2, fejl: [[egen, "Det er koncentrationen i glasset før. Ionen fordeler sig nu i hele blandingen."],
                [f.n2 / (Vegen / 1000), "Brug det samlede rumfang. Ionen fordeler sig i hele blandingen."],
                [f.n2 / (t.VA + t.VB), ML]] };
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
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet." };
        var t = T.tal(raa);
        if (!t) return { besked: "Skriv et tal, fx 0,250." };
        var k = kandidater(id, o), v = t.v;
        if (k.absTol ? Math.abs(v - k.facit) <= k.absTol : naer(v, k.facit)) return { ok: true };
        for (var i = 0; i < k.fejl.length; i++) {
            var f = k.fejl[i][0];
            if (isFinite(f) && f > 0 && !naer(f, k.facit) && naer(v, f)) return { besked: k.fejl[i][1] };
        }
        if (kommaFlyttet(v, k.facit)) return { besked: "Tjek kommaet. Tallet er " + (v > k.facit ? "for stort." : "for lille.") };
        if (k.absTol ? Math.abs(v - k.facit) <= 1 : naer(v, k.facit, 0.04)) {
            return { besked: id === "M" ? "Tæt på. Brug atommasserne med to decimaler, fx O = 16,00." : "Tæt på. Regn med alle cifrene." };
        }
        return { besked: "Det passer ikke. Tryk på Giv hint, hvis du sidder fast." };
    };

    NK.Tjek = T;
}());

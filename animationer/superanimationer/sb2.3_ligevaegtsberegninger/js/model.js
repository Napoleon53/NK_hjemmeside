/* =====================================================================
   model.js - kemien og matematikken bag alle tre faner

   * Skemaet: stofferne, ligevaegtsloven og Kc's enhed regnes af
     reaktionsskemaet (som i sb2.1).
   * Et udtryk, eleven skriver ("0,200 M - x", "(2x)^2", "4,00·10⁻³"),
     laeses af en lille parser og sammenlignes med facit ved at regne
     begge ud for seks vaerdier af x. Saa er 2x, 2·x og x+x det samme.
   * En koncentration ved ligevaegt er altid a + b·x (en "plads"). Brøken
     bliver til et polynomium, og CAS er rødderne i
     taeller − K · naevner = 0 (formlen til grad 2, ellers halvering).
   * Ligevaegtsloven skrevet i to felter laeses til brikker og doemmes
     som i sb2.1's broek.js, med tegn, sider, eksponenter og den typiske
     fejl 2·[NO] i stedet for [NO]².
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var M = {};

    /* ----- Skrivemaaden ----------------------------------------------------- */
    M.skriv = function (s) {
        return D.STOF[s] ? D.STOF[s].vis : NK.formel(s);
    };

    M.kon = function (s) { return "[" + M.skriv(s) + "]"; };

    M.led = function (s, e) { return M.kon(s) + (e > 1 ? NK.haevet(e) : ""); };

    M.ledene = function (liste) {
        if (!liste.length) return "1";
        return liste.map(function (l) { return M.led(l.s, l.e); }).join("·");
    };

    /* Et stof i skemaet: 2NO(g) */
    M.art = function (a) { return (a.k > 1 ? a.k : "") + M.skriv(a.s) + "(" + a.t + ")"; };

    M.skemaTekst = function (opg) {
        function side(l) { return l.map(function (x) { return M.art({ k: x[0], s: x[1], t: x[2] }); }).join(" + "); }
        return side(opg.r) + " ⇌ " + side(opg.p);
    };

    M.alle = function (opg) {
        var ud = [];
        opg.r.forEach(function (x) { ud.push({ s: x[1], k: x[0], t: x[2], side: "r" }); });
        opg.p.forEach(function (x) { ud.push({ s: x[1], k: x[0], t: x[2], side: "p" }); });
        return ud;
    };

    M.find = function (opg, s) {
        var a = M.alle(opg);
        for (var i = 0; i < a.length; i++) if (a[i].s === s) return a[i];
        return null;
    };

    M.udelades = function (a) { return a.t === "s" || a.t === "l"; };

    M.lovFacit = function (opg) {
        var f = { num: [], den: [] };
        M.alle(opg).forEach(function (a) {
            if (M.udelades(a)) return;
            (a.side === "p" ? f.num : f.den).push({ s: a.s, e: a.k });
        });
        return f;
    };

    /* Ligevaegtsloven som HTML-broek: Kc = [NO]²·[Cl₂] / [NOCl]² */
    M.lovHTML = function (opg) {
        var f = M.lovFacit(opg);
        return 'K<sub>c</sub> = <span class="vbroek"><span>' + NK.html(M.ledene(f.num)) + "</span><span>" +
            NK.html(M.ledene(f.den)) + "</span></span>";
    };

    /* Kc's enhed: M opløftet i (produkternes koefficienter − reaktanternes) */
    M.deltaN = function (opg) {
        var s = 0;
        M.alle(opg).forEach(function (a) { if (!M.udelades(a)) s += a.side === "p" ? a.k : -a.k; });
        return s;
    };

    M.enhedTekst = function (e) {
        if (e === 0) return "";
        if (e === 1) return "M";
        return "M" + NK.haevet(String(e));
    };

    M.kEnhed = function (opg) { return M.enhedTekst(M.deltaN(opg)); };

    /* "0,0500 M", "5,44", "4,00 · 10⁻³ M" */
    M.kTekst = function (opg, K) {
        var e = M.kEnhed(opg);
        return NK.tal(K === undefined ? opg.K : K) + (e ? " " + e : "");
    };

    /* ----- At laese et udtryk ---------------------------------------------------
       Tilladt: tal med komma eller punktum, x (eller et andet lille bogstav,
       naar opts.bogstav er sand), + − · * / ^ ( ), haevede cifre (x², 10⁻³),
       gangetegn, der er udeladt (2x, 2(x), (a)(b)), og enhederne M og mol/L,
       som springes over. */
    var HAEV = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };
    var SAENK = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

    function haevetTilPotens(s) {
        return s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (m) {
            var r = "";
            for (var i = 0; i < m.length; i++) r += HAEV[m.charAt(i)];
            return "^(" + r + ")";
        });
    }

    function saenketTilCifre(s) {
        return s.replace(/[₀-₉]/g, function (c) { return SAENK[c]; });
    }

    M.normaliser = function (raa) {
        var s = String(raa || "");
        s = haevetTilPotens(s);
        s = saenketTilCifre(s);
        s = s.replace(/[−–—‐]/g, "-").replace(/[·×∙•⋅]/g, "*").replace(/÷/g, "/");
        /* Enhederne: mol/L og M (ogsaa M^-1 og M^(-2)) */
        s = s.replace(/mol\s*\/\s*[lL]/g, " ").replace(/mol\s*\*?\s*[lL]\s*\^\s*\(?\s*-\s*1\s*\)?/g, " ");
        s = s.replace(/M(\s*\^\s*(\(\s*[-+]?\s*\d+\s*\)|[-+]?\s*\d+))?/g, " ");
        return s.replace(/,/g, ".");
    };

    function tokens(s, opts) {
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (/\s/.test(c)) { i++; continue; }
            var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
            if (m) {
                ud.push({ t: "tal", v: parseFloat(m[0]) });
                i += m[0].length;
                continue;
            }
            if (/[a-zA-Z]/.test(c)) {
                ud.push({ t: "var", v: c });
                i++;
                continue;
            }
            if ("+-*/^()".indexOf(c) >= 0) {
                ud.push({ t: c });
                i++;
                continue;
            }
            return { fejl: "Tegnet " + c + " kan ikke bruges her.", tegn: c };
        }
        return { liste: ud };
    }

    /* Rekursiv nedstigning. Svar: { ok, ast } eller { fejl } */
    function parser(liste) {
        var p = 0;
        function se() { return liste[p]; }
        function tag() { return liste[p++]; }

        function udtryk() {
            var v = led();
            while (se() && (se().t === "+" || se().t === "-")) {
                var op = tag().t;
                var h = led();
                v = { op: op, a: v, b: h };
            }
            return v;
        }
        function led() {
            var v = faktor();
            for (;;) {
                var n = se();
                if (!n) break;
                if (n.t === "*" || n.t === "/") {
                    tag();
                    v = { op: n.t, a: v, b: faktor() };
                } else if (n.t === "tal" || n.t === "var" || n.t === "(") {
                    v = { op: "*", a: v, b: faktor() };       /* 2x, 2(…) */
                } else break;
            }
            return v;
        }
        function faktor() {
            var n = se();
            if (n && (n.t === "-" || n.t === "+")) {
                tag();
                var f = faktor();
                return n.t === "-" ? { op: "neg", a: f } : f;
            }
            return potens();
        }
        function potens() {
            var g = atom();
            if (se() && se().t === "^") {
                tag();
                return { op: "^", a: g, b: faktor() };
            }
            return g;
        }
        function atom() {
            var n = tag();
            if (!n) throw new Error("slut");
            if (n.t === "tal") return { tal: n.v };
            if (n.t === "var") return { v: n.v };
            if (n.t === "(") {
                var u = udtryk();
                var l = tag();
                if (!l || l.t !== ")") throw new Error("parentes");
                return u;
            }
            throw new Error("tegn:" + n.t);
        }

        try {
            if (!liste.length) return { tom: true };
            var r = udtryk();
            if (p < liste.length) {
                if (liste[p].t === ")") return { fejl: "Der er en slutparentes for meget." };
                return { fejl: "Udtrykket kan ikke læses. Tjek tegnene." };
            }
            return { ok: true, ast: r };
        } catch (e) {
            var b = String(e.message);
            if (b === "parentes") return { fejl: "Der mangler en slutparentes." };
            if (b === "slut") return { fejl: "Udtrykket slutter med et regnetegn." };
            return { fejl: "Udtrykket kan ikke læses. Tjek tegnene." };
        }
    }

    function regn(n, env) {
        if (n.tal !== undefined) return n.tal;
        if (n.v !== undefined) return env[n.v] !== undefined ? env[n.v] : NaN;
        var a = regn(n.a, env);
        if (n.op === "neg") return -a;
        var b = regn(n.b, env);
        if (n.op === "+") return a + b;
        if (n.op === "-") return a - b;
        if (n.op === "*") return a * b;
        if (n.op === "/") return a / b;
        if (n.op === "^") return Math.pow(a, b);
        return NaN;
    }

    function variable(n, ud) {
        if (n.v !== undefined) ud[n.v] = 1;
        if (n.a) variable(n.a, ud);
        if (n.b) variable(n.b, ud);
        return ud;
    }

    /* Svar: { tom } eller { fejl } eller { ok, f(x), vars: ["x"], konst } */
    M.udtryk = function (raa) {
        var s = M.normaliser(raa);
        if (!s.trim()) return { tom: true };
        if (/[\[\]]/.test(s)) return { fejl: "Skriv uden firkantede parenteser.", klamme: true };
        var t = tokens(s);
        if (t.fejl) return { fejl: t.fejl };
        var r = parser(t.liste);
        if (r.tom) return { tom: true };
        if (!r.ok) return r;
        var vars = Object.keys(variable(r.ast, {}));
        var ast = r.ast;
        return {
            ok: true, vars: vars, konst: !vars.length,
            f: function (x, navn) { var env = {}; env[navn || vars[0] || "x"] = x; return regn(ast, env); }
        };
    };

    /* Et tal skrevet af eleven: "0,0500", "4,00·10^-3", "4,00e-3", "0,200 M".
       Svar: tallet eller NaN (ogsaa NaN, hvis der staar et bogstav) */
    M.laesTal = function (raa) {
        var u = M.udtryk(raa);
        if (!u.ok || !u.konst) return NaN;
        var v = u.f(0);
        return isFinite(v) ? v : NaN;
    };

    M.ens = function (a, b, rel) {
        rel = rel || 0.02;
        if (!isFinite(a) || !isFinite(b)) return false;
        if (b === 0) return Math.abs(a) < 1e-9;
        return Math.abs(a - b) <= Math.abs(b) * rel;
    };

    /* To udtryk i x er ens, naar de giver det samme for seks x-vaerdier */
    var PROEVER = [0.0137, 0.0419, 0.0733, 0.1061, 0.1543, 0.2711];
    M.samme = function (f, g) {
        for (var i = 0; i < PROEVER.length; i++) {
            var a = f(PROEVER[i]), b = g(PROEVER[i]);
            if (!isFinite(a) || !isFinite(b)) return false;
            if (Math.abs(a - b) > 1e-9 + 1e-6 * Math.max(Math.abs(a), Math.abs(b))) return false;
        }
        return true;
    };

    /* ----- Pladserne: en koncentration er a + b·x ---------------------------------
       x er den koncentration af et stof med koefficienten 1, der omsaettes
       (eller dannes); reaktanterne aendres med −k·x og produkterne med +k·x. */
    M.c0 = function (opg, s) { return (opg.c0 && opg.c0[s]) || 0; };

    M.aendring = function (a) { return (a.side === "r" ? -1 : 1) * a.k; };

    M.plads = function (opg, s) {
        var a = M.find(opg, s);
        return { a: M.c0(opg, s), b: M.aendring(a) };
    };

    M.vaerdi = function (pl, x) { return pl.a + pl.b * x; };

    /* Teksten: "0,200 − x", "x", "2x", "−x" (enh: " M" efter tallet) */
    function xLed(b) {
        var n = Math.abs(b);
        return (n === 1 ? "" : String(n)) + "x";
    }

    M.aendrTekst = function (a) {
        var b = M.aendring(a);
        return (b < 0 ? "−" : "+") + xLed(b);
    };

    M.ligTekst = function (opg, s, enh) {
        var pl = M.plads(opg, s);
        if (!pl.a) return (pl.b < 0 ? "−" : "") + xLed(pl.b);
        return NK.tal(pl.a) + (enh ? " M" : "") + " " + (pl.b < 0 ? "−" : "+") + " " + xLed(pl.b);
    };

    /* Med x sat ind: "0,200 M − 0,0781 M", "2 · 0,160 M", "0,200 − (−0,128)"
       (enh: false giver tallene uden M, som i skemaet) */
    M.indsatTekst = function (opg, s, x, enh) {
        var u = enh === false ? "" : " M";
        var pl = M.plads(opg, s), n = Math.abs(pl.b);
        var xs = NK.tal(x) + u;
        if (!pl.a && n === 1 && pl.b > 0) return xs;
        var xp = x < 0 ? "(" + xs + ")" : xs;
        var led = n === 1 ? xp : n + " · " + xp;
        if (!pl.a) return (pl.b < 0 ? "−" : "") + led;
        return NK.tal(pl.a) + u + " " + (pl.b < 0 ? "−" : "+") + " " + led;
    };

    /* Den mindste og stoerste x, der giver positive koncentrationer */
    M.xGraenser = function (opg) {
        var lav = -Infinity, hoej = Infinity;
        M.alle(opg).forEach(function (a) {
            var pl = M.plads(opg, a.s);
            if (pl.b < 0) hoej = Math.min(hoej, pl.a / -pl.b);
            else if (pl.b > 0) lav = Math.max(lav, -pl.a / pl.b);
        });
        return { lav: lav, hoej: hoej };
    };

    /* Reaktionsbroeken Y for et x (Infinity, naar naevneren er 0) */
    M.Y = function (opg, x) {
        var t = 1, n = 1;
        M.alle(opg).forEach(function (a) {
            if (M.udelades(a)) return;
            var v = Math.pow(M.vaerdi(M.plads(opg, a.s), x), a.k);
            if (a.side === "p") t *= v; else n *= v;
        });
        if (Math.abs(n) < 1e-15) return t === 0 ? NaN : Infinity;
        return t / n;
    };

    /* ----- Polynomier og CAS ---------------------------------------------------- */
    function pMul(p, q) {
        var r = [];
        for (var i = 0; i < p.length + q.length - 1; i++) r.push(0);
        for (i = 0; i < p.length; i++) for (var j = 0; j < q.length; j++) r[i + j] += p[i] * q[j];
        return r;
    }

    function pPot(p, e) {
        var r = [1];
        for (var i = 0; i < e; i++) r = pMul(r, p);
        return r;
    }

    function pVal(p, x) {
        var v = 0;
        for (var i = p.length - 1; i >= 0; i--) v = v * x + p[i];
        return v;
    }

    /* led: [{ a, b, e }] (pladsen a + b·u opløftet i e) */
    function produkt(led) {
        var r = [1];
        led.forEach(function (l) { r = pMul(r, pPot([l.a, l.b], l.e)); });
        return r;
    }

    function roedder(p) {
        var c = p.slice();
        var stoerst = 0;
        c.forEach(function (v) { stoerst = Math.max(stoerst, Math.abs(v)); });
        while (c.length > 1 && Math.abs(c[c.length - 1]) <= stoerst * 1e-12) c.pop();
        var g = c.length - 1;
        if (g < 1) return [];
        if (g === 1) return [-c[0] / c[1]];
        if (g === 2) {
            var a = c[2], b = c[1], cc = c[0];
            var d = b * b - 4 * a * cc;
            if (d < -1e-15 * b * b) return [];
            if (d < 0) d = 0;
            var q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(d));
            var r1 = q / a, r2 = q !== 0 ? cc / q : r1;
            return d === 0 ? [r1] : [r1, r2];
        }
        /* Grad 3 og op: fortegnsskift paa et fint net og halvering */
        var L = 10, N = 40000, ud = [], forrige = pVal(c, -L);
        for (var i = 1; i <= N; i++) {
            var x1 = -L + 2 * L * i / N, v1 = pVal(c, x1);
            if (forrige === 0) ud.push(-L + 2 * L * (i - 1) / N);
            else if (forrige * v1 < 0) {
                var lo = x1 - 2 * L / N, hi = x1;
                for (var k = 0; k < 80; k++) {
                    var mid = (lo + hi) / 2;
                    if (pVal(c, lo) * pVal(c, mid) <= 0) hi = mid; else lo = mid;
                }
                ud.push((lo + hi) / 2);
            }
            forrige = v1;
        }
        return ud;
    }

    /* Loesningerne til K = taeller / naevner, sorteret efter stoerrelse.
       num og den: [{ a, b, e }]. Rødder, der goer naevneren 0, er ikke med. */
    M.loes = function (K, num, den) {
        var T = produkt(num), N = produkt(den);
        var F = [];
        for (var i = 0; i < Math.max(T.length, N.length); i++) F.push((T[i] || 0) - K * (N[i] || 0));
        return roedder(F).filter(function (r) {
            return Math.abs(pVal(N, r)) > 1e-14;
        }).sort(function (a, b) { return a - b; });
    };

    /* Ligningen for en opgave med x: Kc = brøken med pladserne */
    M.ligningsled = function (opg) {
        var f = M.lovFacit(opg);
        function led(l) { var pl = M.plads(opg, l.s); return { s: l.s, a: pl.a, b: pl.b, e: l.e }; }
        return { num: f.num.map(led), den: f.den.map(led) };
    };

    M.loesX = function (opg) {
        var l = M.ligningsled(opg);
        return M.loes(opg.K, l.num, l.den);
    };

    /* Den brugbare loesning og de forkastede, med det stof, der bliver
       negativt: [{ x, ok, neg: stof eller null, v: værdien af stoffet }] */
    M.dom = function (opg, x) {
        var neg = null, v = 0, alle = [];
        M.alle(opg).forEach(function (a) {
            var c = M.vaerdi(M.plads(opg, a.s), x);
            if (c < -1e-12) {
                alle.push(a.s);
                /* Det stof, der bliver mest negativt, er det tydeligste argument */
                if (neg === null || c < v) { neg = a.s; v = c; }
            }
        });
        return { x: x, ok: neg === null, neg: neg, v: v, negs: alle };
    };

    M.ceq = function (opg, x) {
        var ud = {};
        M.alle(opg).forEach(function (a) { ud[a.s] = M.vaerdi(M.plads(opg, a.s), x); });
        return ud;
    };

    M.xFacit = function (opg) {
        var r = M.loesX(opg).filter(function (x) { return M.dom(opg, x).ok; });
        return r[0];
    };

    /* Kc regnet af ligevaegtskoncentrationerne (kontrollen) */
    M.kAf = function (opg, c) {
        var t = 1, n = 1;
        M.alle(opg).forEach(function (a) {
            if (M.udelades(a)) return;
            var v = Math.pow(c[a.s], a.k);
            if (a.side === "p") t *= v; else n *= v;
        });
        return t / n;
    };

    /* ----- Fane 2 ------------------------------------------------------------------ */
    M.cAfN = function (opg) {
        var ud = {};
        Object.keys(opg.n).forEach(function (s) { ud[s] = opg.n[s] / opg.V; });
        return ud;
    };

    /* Den ukendte koncentration: ligningen og loesningerne */
    M.ukendtLed = function (opg) {
        var f = M.lovFacit(opg);
        function led(l) {
            if (l.s === opg.ukendt) return { s: l.s, a: 0, b: 1, e: l.e };
            return { s: l.s, a: opg.kendt[l.s], b: 0, e: l.e };
        }
        return { num: f.num.map(led), den: f.den.map(led) };
    };

    M.loesUkendt = function (opg) {
        var l = M.ukendtLed(opg);
        return M.loes(opg.K, l.num, l.den);
    };

    /* ----- Ligevaegtsloven skrevet i et felt -----------------------------------------
       Laeses til brikker som i sb2.1: { k: "stof", v }, { k: "eks", v },
       { k: "tegn", v: "·", "+", "−" eller "1" } og { k: "faktor", v } (et
       tal foran et stof). Gangetegnet maa udelades. */
    function navnTilStof(opg, navn) {
        var n = saenketTilCifre(String(navn)).toLowerCase().replace(/\s+/g, "").replace(/\((g|aq|l|s)\)$/, "");
        var arter = M.alle(opg);
        for (var i = 0; i < arter.length; i++) {
            var st = D.STOF[arter[i].s];
            var alias = st ? st.alias : [arter[i].s.toLowerCase()];
            if (alias.indexOf(n) >= 0 || arter[i].s.toLowerCase() === n) return arter[i].s;
        }
        /* Et stof, der ikke er i skemaet, men findes */
        var alle = Object.keys(D.STOF);
        for (i = 0; i < alle.length; i++) if (D.STOF[alle[i]].alias.indexOf(n) >= 0) return { fremmed: alle[i] };
        return { fremmed: null, raa: navn };
    }

    M.lovTokens = function (opg, raa) {
        var s = haevetTilPotens(String(raa || ""));
        s = s.replace(/[−–—‐]/g, "-").replace(/[×∙•⋅*]/g, "·");
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (/\s|\(|\)/.test(c)) { i++; continue; }
            if (c === "[") {
                var j = s.indexOf("]", i + 1);
                if (j < 0) return { fejl: "Der mangler en ] efter " + s.slice(i) + "." };
                var navn = s.slice(i + 1, j);
                var st = navnTilStof(opg, navn);
                if (typeof st === "string") ud.push({ k: "stof", v: st });
                else ud.push({ k: "fremmed", v: st.fremmed, raa: navn.trim() });
                i = j + 1;
                continue;
            }
            if (c === "^") {
                var m = /^\^\s*\(?\s*([+-]?)\s*(\d*)\s*\)?/.exec(s.slice(i));
                if (!m[2]) return { fejl: "Der mangler et tal efter ^." };
                if (m[1] === "-") return { fejl: "En eksponent i ligevægtsloven er aldrig negativ. Stofferne før pilen står i nævneren." };
                ud.push({ k: "eks", v: parseInt(m[2], 10) });
                i += m[0].length;
                continue;
            }
            if (c === "·" || c === ".") { ud.push({ k: "tegn", v: "·" }); i++; continue; }
            if (c === "+") { ud.push({ k: "tegn", v: "+" }); i++; continue; }
            if (c === "-") { ud.push({ k: "tegn", v: "−" }); i++; continue; }
            if (c === "/") return { fejl: "Skriv tælleren og nævneren i hver sit felt, uden /." };
            var tal = /^\d+([.,]\d+)?/.exec(s.slice(i));
            if (tal) {
                if (i > 0 && s.charAt(i - 1) === "]") {
                    return { fejl: "Skriv eksponenten hævet, fx " + M.kon(M.alle(opg)[0].s) + "² eller " + M.kon(M.alle(opg)[0].s) + "^2. Du kan også klikke på ² under tavlen." };
                }
                var efter = /^[\s·(]*/.exec(s.slice(i + tal[0].length))[0];
                if (s.charAt(i + tal[0].length + efter.length) === "[") {
                    ud.push({ k: "faktor", v: parseFloat(tal[0].replace(",", ".")) });
                    i += tal[0].length + efter.length;
                    continue;
                }
                if (tal[0] === "1") { ud.push({ k: "tegn", v: "1" }); i += 1; continue; }
                return { fejl: "Der står tallet " + tal[0] + " i brøken. Brug kun koncentrationer i [ ]." };
            }
            if (/[A-Za-zÆØÅæøå]/.test(c)) {
                return { fejl: "Skriv koncentrationerne med firkantede parenteser, fx " + M.kon(M.alle(opg)[0].s) + ". Du kan også klikke på dem under tavlen.", klamme: true };
            }
            return { fejl: "Tegnet " + c + " hører ikke hjemme i ligevægtsloven." };
        }
        return { ok: true, tok: ud };
    };

    /* Raekken af brikker laest til led */
    function fejl(kode, x) {
        var f = { kode: kode };
        if (x) Object.keys(x).forEach(function (k) { f[k] = x[k]; });
        return { ok: false, fejl: f };
    }

    function laes(tok) {
        if (!tok.length) return { ok: true, led: [] };
        var i, ener = 0;
        for (i = 0; i < tok.length; i++) if (tok[i].k === "tegn" && tok[i].v === "1") ener++;
        if (ener) {
            if (tok.length === 1) return { ok: true, led: [], en: true };
            return fejl("en");
        }
        var led = [], venter = true, faktor = null;
        for (i = 0; i < tok.length; i++) {
            var t = tok[i], sidst = led[led.length - 1];
            if (t.k === "faktor") { faktor = t.v; continue; }
            if (t.k === "stof" || t.k === "fremmed") {
                led.push({ s: t.v, e: 1, eks: false, faktor: faktor, fremmed: t.k === "fremmed", raa: t.raa });
                faktor = null;
                venter = false;
            } else if (t.k === "eks") {
                if (venter) return fejl("eks-foerst", { v: t.v });
                if (sidst.eks) return fejl("to-eks", { a: sidst.s });
                sidst.e = t.v;
                sidst.eks = true;
            } else if (t.v === "+" || t.v === "−") {
                return fejl("plus", { v: t.v });
            } else {
                if (venter) return fejl("prik-loes");
                venter = true;
            }
        }
        if (venter) return fejl("prik-loes");
        return { ok: true, led: led };
    }

    function samlet(led) {
        var m = {};
        led.forEach(function (l) { m[l.s] = (m[l.s] || 0) + l.e; });
        return m;
    }

    function ensM(a, b) {
        var ka = Object.keys(a), kb = Object.keys(b);
        if (ka.length !== kb.length) return false;
        for (var i = 0; i < ka.length; i++) if (a[ka[i]] !== b[ka[i]]) return false;
        return true;
    }

    var ZN = { num: "tælleren", den: "nævneren" };
    M.ZN = ZN;

    /* Dommen over ligevaegtsloven. Svar: { ok } eller { ok: false, kode,
       tekst, z, s, ... }. Taelleren tjekkes foer naevneren. */
    M.lovDom = function (opg, numRaa, denRaa) {
        var F = M.lovFacit(opg);
        var raa = { num: numRaa || "", den: denRaa || "" };
        if (!raa.num.trim() && !raa.den.trim()) return { ok: false, kode: "tom", z: "num", tom: true, tekst: "Skriv tælleren og nævneren." };
        var laest = {}, z, i, a;
        for (z in raa) {
            var t = M.lovTokens(opg, raa[z]);
            if (t.fejl) return { ok: false, kode: "syntaks", z: z, tekst: t.fejl };
            var r = laes(t.tok);
            if (!r.ok) return syntaks(r.fejl, z);
            laest[z] = r.led;
            for (i = 0; i < r.led.length; i++) {
                var l = r.led[i];
                if (l.fremmed) {
                    return { ok: false, kode: "fremmed", z: z, s: l.s,
                        tekst: "[" + (l.s ? M.skriv(l.s) : l.raa) + "] står ikke i reaktionsskemaet." };
                }
            }
        }
        /* Faktor: 2·[NO] i stedet for [NO]² */
        for (z in laest) {
            for (i = 0; i < laest[z].length; i++) {
                var lf = laest[z][i];
                if (lf.faktor !== null && lf.faktor !== undefined) {
                    a = M.find(opg, lf.s);
                    return { ok: false, kode: "faktor", z: z, s: lf.s, k: a.k, v: lf.faktor,
                        tekst: "Der står " + String(lf.faktor).replace(".", ",") + " foran " + M.kon(lf.s) +
                            ". Koefficienten skal være en eksponent, ikke en faktor." };
                }
            }
        }
        if (F.den.length && ensM(samlet(laest.num), samlet(F.den)) && ensM(samlet(laest.den), samlet(F.num))) {
            return { ok: false, kode: "byttet", z: "num",
                tekst: "Tæller og nævner er byttet om. Produkterne står i tælleren." };
        }
        var rigtigSide = { num: "p", den: "r" };
        for (z in laest) {
            var L = laest[z];
            for (i = 0; i < L.length; i++) {
                a = M.find(opg, L[i].s);
                if (M.udelades(a)) {
                    return { ok: false, kode: "udeladt", z: z, s: a.s, t: a.t, tekst: M.kon(a.s) + " skal ikke stå i ligevægtsloven." };
                }
                if (a.side !== rigtigSide[z]) {
                    return { ok: false, kode: "side", z: z, s: a.s, side: a.side,
                        tekst: M.kon(a.s) + " står i " + ZN[z] + ", men " + M.skriv(a.s) + " står " +
                            (a.side === "r" ? "før" : "efter") + " pilen." };
                }
            }
            var set = {};
            for (i = 0; i < L.length; i++) {
                if (set[L[i].s]) {
                    return { ok: false, kode: "gentaget", z: z, s: L[i].s, tekst: M.kon(L[i].s) + " står flere gange i " + ZN[z] + "." };
                }
                set[L[i].s] = 1;
            }
            var FL = F[z];
            if (!L.length && FL.length) {
                return { ok: false, kode: "tom-side", z: z, tom: !raa[z].trim(),
                    tekst: (z === "num" ? "Tælleren" : "Nævneren") + (raa[z].trim() ? " skal ikke være 1." : " er tom.") };
            }
            for (i = 0; i < FL.length; i++) {
                if (!set[FL[i].s]) return { ok: false, kode: "mangler", z: z, s: FL[i].s, tekst: "Der mangler et stof i " + ZN[z] + "." };
            }
            for (i = 0; i < L.length; i++) {
                a = M.find(opg, L[i].s);
                if (L[i].e !== a.k) {
                    return { ok: false, kode: "eksponent", z: z, s: a.s, k: a.k, e: L[i].e,
                        tekst: "Eksponenten på " + M.kon(a.s) + " passer ikke med reaktionsskemaet." };
                }
            }
        }
        return { ok: true };
    };

    function syntaks(f, z) {
        var ud = { ok: false, kode: f.kode, z: z, v: f.v, a: f.a };
        switch (f.kode) {
        case "en": ud.tekst = "1 står sammen med andet i " + ZN[z] + "."; break;
        case "eks-foerst": ud.tekst = "Eksponenten " + NK.haevet(f.v) + " står ikke lige efter en koncentration."; break;
        case "to-eks": ud.tekst = M.kon(f.a) + " har to eksponenter."; break;
        case "plus": ud.tekst = "Der står " + f.v + " i " + ZN[z] + ". Leddene i ligevægtsloven ganges sammen."; break;
        default: ud.kode = "prik-loes"; ud.tekst = "Et gangetegn i " + ZN[z] + " har ikke en koncentration på begge sider.";
        }
        return ud;
    }

    function liste(navne) {
        if (navne.length < 2) return navne.join("");
        return navne.slice(0, -1).join(", ") + " og " + navne[navne.length - 1];
    }

    /* Hinttrappen til ligevaegtsloven: hvad man ser paa > hvad der staar
       i skemaet > hvad der skal staa */
    M.lovHint = function (opg, num, den) {
        var d = M.lovDom(opg, num, den);
        var F = M.lovFacit(opg);
        if (d.ok) return { s: null, trin: ["Ligevægtsloven er klar. Tryk Tjek."] };
        var zn = ZN[d.z], K = d.s ? M.kon(d.s) : "", f = d.s ? M.skriv(d.s) : "";
        function begynd(z) {
            var side = z === "num" ? "p" : "r";
            var arter = M.alle(opg).filter(function (a) { return a.side === side; });
            return { s: arter.map(function (a) { return a.s; }), trin: [
                z === "num" ? "Begynd med tælleren. I tælleren står stofferne efter pilen." :
                    "Nu nævneren. I nævneren står stofferne før pilen.",
                (z === "num" ? "Efter" : "Før") + " pilen står " + liste(arter.map(M.art)) + ". Koefficienterne bliver til eksponenter.",
                (z === "num" ? "Tælleren" : "Nævneren") + " skal være " + M.ledene(F[z]) + "."
            ] };
        }
        switch (d.kode) {
        case "tom":
        case "tom-side":
        case "syntaks":
            if (d.kode === "syntaks") return { s: null, trin: [d.tekst, "Klik på koncentrationerne og eksponenterne under tavlen, så bliver de skrevet rigtigt.", (d.z === "num" ? "Tælleren" : "Nævneren") + " skal være " + M.ledene(F[d.z]) + "."] };
            return begynd(d.z);
        case "faktor":
            return { s: d.s, trin: ["Se på tallet foran " + K + ".",
                "En koefficient i reaktionsskemaet bliver til en eksponent i ligevægtsloven, ikke til en faktor.",
                "Skriv " + M.led(d.s, d.k) + " i stedet for " + String(d.v).replace(".", ",") + "·" + K + "."] };
        case "plus":
            return { s: null, trin: ["Se på tegnene mellem leddene i " + zn + ".",
                "Leddene i ligevægtsloven ganges sammen. Der står aldrig + eller −.",
                "Skriv · i stedet for " + d.v + "."] };
        case "prik-loes":
            return { s: null, trin: ["Se på gangetegnene i " + zn + ".",
                "Et gangetegn står mellem to koncentrationer.",
                "Slet det gangetegn, der er i overskud."] };
        case "en":
            return { s: null, trin: ["Se på 1 i " + zn + ".", "1 skriver man kun, når der ikke står andet.", "Slet 1."] };
        case "eks-foerst":
            return { s: null, trin: ["Se på eksponenten " + NK.haevet(d.v) + ".", "En eksponent hører til koncentrationen lige foran den.",
                "Skriv eksponenten lige efter ]."] };
        case "to-eks":
            return { s: d.a, trin: ["Se på " + M.kon(d.a) + ".", "En koncentration har kun én eksponent.", "Slet den ene eksponent."] };
        case "byttet":
            return { s: null, trin: ["Se på, hvilken side af pilen stofferne i tælleren står.",
                "Produkterne står efter pilen og skal i tælleren. Reaktanterne skal i nævneren.",
                "Byt om på tælleren og nævneren."] };
        case "fremmed":
            return { s: null, trin: ["Sammenlign koncentrationerne med reaktionsskemaet.",
                "Brug kun stofferne, som de står i reaktionsskemaet.",
                "Slet " + (d.s ? M.kon(d.s) : "den koncentration, der ikke står i skemaet") + "."] };
        case "udeladt":
            return { s: d.s, trin: ["Se på tilstandsformen efter " + f + ".", "Faste stoffer og opløsningsmidlet er ikke med i ligevægtsloven.", "Slet " + K + "."] };
        case "side":
            return { s: d.s, trin: ["Se på, hvilken side af pilen " + f + " står.",
                f + " står " + (d.side === "r" ? "før pilen. Reaktanterne står i nævneren." : "efter pilen. Produkterne står i tælleren."),
                "Flyt " + K + " " + (d.side === "r" ? "ned i nævneren" : "op i tælleren") + "."] };
        case "gentaget":
            var a = M.find(opg, d.s);
            return { s: d.s, trin: ["Se på " + K + ". Den står flere gange i " + zn + ".",
                "En koncentration skrives én gang, og koefficienten bliver til eksponenten.", "Skriv " + M.led(d.s, a.k) + " én gang."] };
        case "mangler":
            var m = M.find(opg, d.s);
            return { s: d.s, trin: ["Gå stofferne " + (d.z === "num" ? "efter" : "før") + " pilen igennem. Er de alle med i " + zn + "?",
                f + " står " + (m.side === "r" ? "før" : "efter") + " pilen, men " + K + " er ikke i " + zn + ".",
                "Skriv " + M.led(d.s, m.k) + " i " + zn + "."] };
        case "eksponent":
            if (d.k > 1) {
                return { s: d.s, trin: ["Se på tallet foran " + f + " i reaktionsskemaet.",
                    "Der står " + d.k + " foran " + f + ". Koefficienten bliver til eksponenten.", "Leddet skal være " + M.led(d.s, d.k) + "."] };
            }
            return { s: d.s, trin: ["Se på tallet foran " + f + " i reaktionsskemaet.",
                "Der står ikke noget tal foran " + f + ". Så er eksponenten 1, og den skrives ikke.", "Slet eksponenten efter " + K + "."] };
        }
        return begynd("num");
    };

    /* Ligevaegtsloven som tekst til felterne (Vis svaret) */
    M.lovFelter = function (opg) {
        var f = M.lovFacit(opg);
        return { num: M.ledene(f.num), den: M.ledene(f.den) };
    };

    NK.Model = M;
}());

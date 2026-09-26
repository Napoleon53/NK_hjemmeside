/* =====================================================================
   ox.js - modellen: oxidationstal efter reglerne og efter elektronerne

   Fane 1 (reglerne): NK.Ox.stof(f, q) skiller en formel ad og regner
   det ukendte oxidationstal ud af reglerne: O er −II, H er +I, og summen
   er ladningen. Beskederne til elevens typiske fejl bygges ogsaa her,
   ud fra netop det stof og det tal, eleven skrev.

   Fane 2 (elektronerne): NK.Ox.molekyle(def) bygger en elektronprik-
   formel af et molekyle i D.MOLEKYLER: de frie elektroner paa hvert atom
   og bindingernes elektroner, hver med det atom, den kom fra. Naar hvert
   par er givet til det mest elektronegative atom (og delt mellem to ens
   atomer), er oxidationstallet valenselektronerne minus de elektroner,
   atomet har. Det er definitionen; reglerne paa fane 1 er en genvej til
   det samme tal.
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

    /* (−II), (+I), 0 */
    function oxP(n) { return n === 0 ? "0" : "(" + ox(n) + ")"; }

    /* En ladning eller en sum: +12, −2, 0 */
    function lad(q) { return NK.fortegn(q); }

    /* Et tal i en mellemregning: (−2), (+1), 0. Romertallene bruges kun
       til oxidationstallet over atomet og i svaret (brugerens valg). */
    function talP(n) { return n === 0 ? "0" : "(" + lad(n) + ")"; }

    var ROMER = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10 };

    /* Fortegnet foran eller bagefter: +VII, VII, +7, 7, −II, -2, 2-, II− */
    function delFortegn(s) {
        var t = NK.ascii(s).replace(/\s+/g, "").toUpperCase();
        var fortegn = 1, sat = false;
        if (t[0] === "+" || t[0] === "-") { fortegn = t[0] === "-" ? -1 : 1; t = t.slice(1); sat = true; }
        else if (t.length > 1 && (t[t.length - 1] === "+" || t[t.length - 1] === "-")) {
            fortegn = t[t.length - 1] === "-" ? -1 : 1; t = t.slice(0, -1); sat = true;
        }
        return { t: t, fortegn: fortegn, sat: sat };
    }

    /* Et oxidationstal, som eleven skriver det. Tomt giver null, noget,
       der ikke kan laeses, giver NaN. */
    function laesOx(s) {
        if (!NK.ascii(s).replace(/\s+/g, "")) return null;
        var d = delFortegn(s), t = d.t;
        if (t === "0") return 0;
        if (Object.prototype.hasOwnProperty.call(ROMER, t)) return d.fortegn * ROMER[t];
        if (/^\d{1,2}$/.test(t)) return d.fortegn * parseInt(t, 10);
        return NaN;
    }

    /* En ladning: 0, −2, -2, 2-, ²⁻, + og − alene (= ±1). Tomt giver null. */
    function laesLadning(s) {
        var r = NK.ascii(s).replace(/\s+/g, "");
        if (!r) return null;
        if (r === "+") return 1;
        if (r === "-") return -1;
        var d = delFortegn(r);
        if (/^\d{1,2}$/.test(d.t)) return d.fortegn * parseInt(d.t, 10);
        return NaN;
    }

    /* ----- Et stof paa fane 1 --------------------------------------------------
       Atomerne i formlens raekkefoelge: [{ s: "Cr", n: 2 }, { s: "O", n: 7 }].
       X er det ukendte grundstof: det, der hverken er O eller H, eller det
       eneste grundstof i formlen. */
    function stof(f, q) {
        var atomer = [], re = /([A-Z][a-z]?)(\d*)/g, m, el = {};
        while ((m = re.exec(f)) !== null) {
            if (!m[1]) break;
            var n = m[2] ? parseInt(m[2], 10) : 1;
            atomer.push({ s: m[1], n: n });
            el[m[1]] = (el[m[1]] || 0) + n;
        }
        var navne = Object.keys(el);
        var X = navne.length === 1 ? navne[0] : navne.filter(function (s) { return !FAST.hasOwnProperty(s); })[0];
        var nO = X === "O" ? 0 : (el.O || 0), nH = X === "H" ? 0 : (el.H || 0);
        var kendt = FAST.O * nO + FAST.H * nH;
        var st = {
            f: f, q: q, atomer: atomer, el: el, X: X, nX: el[X], nO: nO, nH: nH, kendt: kendt,
            ox: (q - kendt) / el[X],
            tekst: NK.formel(f) + NK.ladningHaevet(q),
            slags: navne.length > 1 ? "sammensat" : (q === 0 ? "grundstof" : "ion")
        };
        /* Noeglen til hvert atom i formlen: X, O eller H */
        atomer.forEach(function (a) { a.k = a.s === X ? "X" : a.s; });
        return st;
    }

    /* Vaerdien, et felt skal have: ladning, O, H eller X */
    function facit(st, k) {
        if (k === "ladning") return st.q;
        if (k === "X") return st.ox;
        return FAST[k];
    }

    /* Regnestykket med tal: "2 · Cr + 7 · (−2) = −2" (X som symbol) */
    function led(n, t) { return n > 1 ? n + " · " + t : t; }

    function regnestykke(st) {
        var dele = st.atomer.map(function (a) {
            return led(a.n, a.k === "X" ? a.s : talP(FAST[a.k]));
        });
        return dele.join(" + ") + " = " + lad(st.q);
    }

    /* Den paene beregning, linje for linje:
         2 · Cr + 7 · (−2) = −2
         2 · Cr = −2 − 7 · (−2) = +12
         Cr = +12 / 2 = +6 */
    function isolering(st) {
        var X = st.X, n = st.nX, rest = st.q - st.kendt;
        if (st.slags === "ion") return [X + " = " + lad(st.q)];
        var linjer = [regnestykke(st)];
        var traek = st.atomer.filter(function (a) { return a.k !== "X"; }).map(function (a) {
            return " − " + led(a.n, talP(FAST[a.k]));
        }).join("");
        if (traek) linjer.push(led(n, X) + " = " + lad(st.q) + traek + " = " + lad(rest));
        if (n > 1) linjer.push(X + " = " + lad(rest) + " / " + n + " = " + lad(st.ox));
        return linjer;
    }

    /* Svaret med hele beregningen, til Vis svaret */
    function beregning(st) {
        var X = st.X;
        if (st.slags === "grundstof") return st.tekst + " er et grundstof, så " + X + " er 0.";
        if (st.slags === "ion") return st.tekst + " er en ion af ét atom, så " + X + " er " + ox(st.ox) + ".";
        var l = isolering(st);
        return l[0] + ", så " + l.slice(1).join(" og ") + ". " + X + " er " + ox(st.ox) + ".";
    }

    /* ----- Beskederne til de typiske fejl ------------------------------------------ */
    function er(v, x) { return Math.abs(v - x) < 1e-9; }

    function fejlLadning(st, v) {
        var q = st.q;
        if (q === 0) return "Der står ingen ladning efter formlen. Så er stoffet neutralt, og ladningen er 0.";
        if (er(v, 0)) return "Der står en ladning efter formlen: " + NK.ladningHaevet(q) + ". Den skal med.";
        if (er(v, -q)) return "Fortegnet er forkert. " + (q < 0 ? "⁻ betyder minus." : "⁺ betyder plus.");
        return "Ladningen står som det lille tal og tegn efter formlen: " + NK.ladningHaevet(q) + ".";
    }

    function fejlFast(st, k, v) {
        var n = k === "O" ? st.nO : st.nH;
        if (k === "O" && er(v, 2)) return "Fortegnet er forkert. O trækker hårdt i elektronerne, så tallet er negativt.";
        if (k === "H" && er(v, -1)) return "Fortegnet er forkert. H afgiver sin elektron, så tallet er positivt.";
        if (n > 1 && er(v, FAST[k] * n)) return "Tallet over " + k + " gælder ét " + k + "-atom, ikke alle " + n + ".";
        return "Ikke rigtigt. " + k + " har det samme oxidationstal i næsten alle stoffer.";
    }

    function fejlX(st, v) {
        var X = st.X, n = st.nX, q = st.q, k = st.kendt, r = st.ox;
        if (st.slags === "grundstof") return st.tekst + " er et grundstof. Der er intet andet atom at give elektronerne til, så tallet er 0.";
        if (st.slags === "ion") {
            if (er(v, -r)) return "Fortegnet er forkert. Ionen er " + st.tekst + ".";
            return "En ion af ét atom har ionens ladning som oxidationstal.";
        }
        if (n > 1 && er(v, q - k)) return "Der er " + n + " " + X + ". Tilsammen giver de " + lad(q - k) + ". Del det mellem dem.";
        if (q !== 0 && er(v, -k / n)) return "Summen skal være ionens ladning, " + lad(q) + ", ikke 0.";
        if (r !== 0 && er(v, -r)) return "Fortegnet er forkert. " + (k < 0 ? "O giver minus, så " + X + " skal give plus." : "Se på, hvad der mangler op til ladningen.");
        if (st.nH && er(v, (q - FAST.O * st.nO) / n)) return "Husk H. " + (st.nH > 1 ? st.nH + " · (+1) = " : "H giver ") + lad(st.nH) + ".";
        if (st.nO > 1 && er(v, (q - FAST.O - st.nH) / n)) return "Der er " + st.nO + " O. De giver " + st.nO + " · (−2) = " + lad(FAST.O * st.nO) + " tilsammen.";
        if (q !== 0 && er(v, (-q - k) / n)) return "Ladningen er " + lad(q) + ", ikke " + lad(-q) + ".";
        return "Ikke rigtigt. Læg oxidationstallene sammen. Summen skal give " + lad(q) + ".";
    }

    function fejl(st, k, v) {
        if (k === "ladning") return fejlLadning(st, v);
        if (k === "X") return fejlX(st, v);
        return fejlFast(st, k, v);
    }

    /* ----- Molekylerne paa fane 2 ------------------------------------------------------ */
    function molekyle(def) {
        var G = D.GRUNDSTOF;
        var m = { def: def, q: def.q || 0, tekst: NK.formel(def.f) + NK.ladningHaevet(def.q || 0) };
        m.atomer = def.atomer.map(function (a, i) {
            var g = G[a[0]];
            return { i: i, s: a[0], gx: a[1], gy: a[2], v: g.v, en: g.en, farve: g.farve, orden: 0,
                ekstra: def.ekstra === i ? 1 : 0, mangler: def.mangler === i ? 1 : 0, sider: {} };
        });
        m.bindinger = def.bindinger.map(function (b, i) {
            var A = m.atomer[b[0]], B = m.atomer[b[1]];
            A.orden += b[2];
            B.orden += b[2];
            /* Siden paa hvert atom, bindingen sidder paa */
            var dx = Math.sign(B.gx - A.gx), dy = Math.sign(B.gy - A.gy);
            var sA = side(dx, dy), sB = side(-dx, -dy);
            A.sider[sA] = "b" + i;
            B.sider[sB] = "b" + i;
            var mest = A.en === B.en ? -1 : (A.en > B.en ? b[0] : b[1]);
            return { i: i, a: b[0], b: b[1], orden: b[2], sideA: sA, sideB: sB, mest: mest };
        });
        m.atomer.forEach(function (a) {
            /* De frie elektroner: valenselektronerne, der ikke sidder i en
               binding, plus ionens ekstra elektron, minus den, der mangler */
            a.frie = a.v - a.orden + a.ekstra - a.mangler;
            a.par = frieSider(a, a.frie / 2, def.par && def.par[a.i]);
        });
        m.ox = m.atomer.map(function (a) { return a.v - ejer(m, a.i); });
        return m;
    }

    var SIDER = ["op", "hoejre", "ned", "venstre"];
    var MODSAT = { op: "ned", ned: "op", hoejre: "venstre", venstre: "hoejre" };

    function side(dx, dy) {
        if (dy < 0) return "op";
        if (dy > 0) return "ned";
        return dx > 0 ? "hoejre" : "venstre";
    }

    /* De frie par paa de ledige sider, saa symmetrisk som muligt: to par
       paa hver sin side af en enkelt binding (op og ned), ét par modsat
       bindingen, eller foroven, naar to modsatte sider er ledige. */
    function frieSider(a, antal, fast) {
        if (fast) return fast.slice();
        var ledige = SIDER.filter(function (s) { return !a.sider[s]; });
        if (antal >= ledige.length) return ledige.slice(0, antal);
        if (antal === 0) return [];
        if (antal === 2) {
            if (ledige.indexOf("op") >= 0 && ledige.indexOf("ned") >= 0) return ["op", "ned"];
            if (ledige.indexOf("venstre") >= 0 && ledige.indexOf("hoejre") >= 0) return ["venstre", "hoejre"];
            return ledige.slice(0, 2);
        }
        if (antal === 1) {
            var bundne = SIDER.filter(function (s) { return a.sider[s]; });
            if (bundne.length === 1 && ledige.indexOf(MODSAT[bundne[0]]) >= 0) return [MODSAT[bundne[0]]];
            if (ledige.indexOf("op") >= 0) return ["op"];
            return [ledige[0]];
        }
        return ledige.slice(0, antal);
    }

    /* Elektronerne, atom i har, naar hvert par er givet til det mest
       elektronegative atom og delt mellem to ens atomer */
    function ejer(m, i) {
        var a = m.atomer[i], n = a.frie;
        m.bindinger.forEach(function (b) {
            if (b.a !== i && b.b !== i) return;
            if (b.mest === -1) n += b.orden;
            else if (b.mest === i) n += 2 * b.orden;
        });
        return n;
    }

    /* Regnskabet pr. grundstof i formlens raekkefoelge:
       [{ s, antal, v, nu, ox }]. Alle atomer af samme grundstof har
       samme oxidationstal i de tolv molekyler (selvtesten tjekker det). */
    function regnskab(m) {
        var ud = [], set = {};
        m.atomer.forEach(function (a) {
            if (set[a.s]) { set[a.s].antal++; return; }
            set[a.s] = { s: a.s, antal: 1, v: a.v, nu: ejer(m, a.i), ox: m.ox[a.i], ekstra: a.ekstra, mangler: a.mangler };
            ud.push(set[a.s]);
        });
        /* Formlens raekkefoelge: HCl, H₂O, CH₃OH ... */
        var orden = [], re = /([A-Z][a-z]?)/g, x;
        while ((x = re.exec(m.def.f)) !== null) if (orden.indexOf(x[1]) < 0) orden.push(x[1]);
        ud.sort(function (p, r) { return orden.indexOf(p.s) - orden.indexOf(r.s); });
        return ud;
    }

    /* Oxidationstallet for et grundstof i molekylet */
    function oxFor(m, s) {
        for (var i = 0; i < m.atomer.length; i++) if (m.atomer[i].s === s) return m.ox[i];
        return NaN;
    }

    /* Det, reglerne giver, for et grundstof i molekylet (til beskeden om
       gaettet): H er +I, O er −II, resten af summen gaar til det ukendte */
    function regelOx(m, s) {
        var el = {};
        m.atomer.forEach(function (a) { el[a.s] = (el[a.s] || 0) + 1; });
        if (Object.keys(el).length === 1) return m.q / el[s];
        if (FAST.hasOwnProperty(s)) return FAST[s];
        var kendt = 0;
        Object.keys(el).forEach(function (t) { if (FAST.hasOwnProperty(t)) kendt += FAST[t] * el[t]; });
        return (m.q - kendt) / el[s];
    }

    NK.Ox = {
        romer: romer, ox: ox, oxP: oxP, lad: lad, talP: talP,
        laesOx: laesOx, laesLadning: laesLadning,
        stof: stof, facit: facit, regnestykke: regnestykke, isolering: isolering, beregning: beregning, fejl: fejl,
        FAST: FAST,
        molekyle: molekyle, ejer: ejer, regnskab: regnskab, oxFor: oxFor, regelOx: regelOx,
        MODSAT: MODSAT
    };
}());

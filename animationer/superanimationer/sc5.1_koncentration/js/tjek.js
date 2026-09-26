/* =====================================================================
   tjek.js - regnetrinene paa fane 2 og 3: formlen, tallet og den
   paene beregning

   Formlen tjekkes ved at regne den ud. Hvert bogstav faar et fast
   proevetal, hvor alle sammenhaengene passer (c = n / V, m = n · M,
   c₁ · V₁ = c₂ · V₂). Saa er "c · V", "V · c", "n = c*V" og
   "c(NaOH) · V" det samme, og en omskrevet formel (c = n / V, naar n
   skal findes) er ogsaa rigtig. De typiske fejl (broeken vendt om,
   ganget i stedet for divideret, V₁ i stedet for V₂) genkendes paa
   deres vaerdi og faar deres egen besked.

   Et tal er rigtigt, naar det hoejst er 1 % fra facit. De typiske
   fejl (mL i stedet for L, broeken vendt, massen i stedet for
   stofmaengden) regnes ud og sammenlignes paa samme maade.

   Svarene er { ok, besked, note, tom }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet (som sc7.4) -----------------------------
       "0,25", "0.25", "0,25 mol", "2,5·10^-1", "2,5e-1" og "250 mL" er tal. */
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

    /* ----- Formlen: fra tekst til noget, der kan regnes ud -------------------------
       Haevede og saenkede tegn bliver almindelige, (NaCl) og andre
       etiketter forsvinder, (foer) og (efter) bliver 1 og 2, og (vand)
       bliver til sit eget bogstav. Store og smaa bogstaver er ens,
       undtagen M (molarmasse) og m (masse). */
    function norm(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/:/g, "/");
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/v?\((vand|water|h2o)\)/gi, "W").replace(/vvand/gi, "W");
        s = s.replace(/\((før|foer|for|start|flaske|flasken|pipette|pipetten|1)\)/gi, "1");
        s = s.replace(/\((efter|slut|kolbe|kolben|2)\)/gi, "2");
        /* Etiketter med bogstaver, fx (NaCl), (KMnO4), (aq), forsvinder.
           En parentes om et bogstav eller et udtryk, fx n/(V), bliver. */
        s = s.replace(/\(([^()]*)\)/g, function (hel, ind) {
            if (!/[A-Za-zÆØÅæøå]/.test(ind) || /[+\-*\/]/.test(ind) || /^[cnvmCNV][12]?$|^M$/.test(ind)) return hel;
            return "";
        });
        return s.split("").map(function (c) {
            if (c === "M" || c === "W") return c;
            return c.toLowerCase();
        }).join("");
    }

    /* Tokens: bogstaverne c, n, v, m, M (med 1 eller 2 efter), W (vandet),
       tal, + - * / og parenteser. Andet giver null. */
    function tokens(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if ("cnvmM".indexOf(ch) >= 0) {
                var nav = ch;
                if (s[i + 1] === "1" || s[i + 1] === "2") {
                    /* Et 1- eller 2-tal lige efter bogstavet er et indeks,
                       medmindre der kommer flere cifre (v100 er v · 100) */
                    if (!/[0-9.,]/.test(s[i + 2] || "")) { nav += s[i + 1]; i++; }
                }
                ud.push({ t: "s", v: nav });
                i++;
            } else if (ch === "W") {
                ud.push({ t: "s", v: "W" }); i++;
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

    /* Et lille udtryk: sum af produkter, med underforstaaet gangetegn
       mellem to led, der staar ved siden af hinanden (cV = c · V). */
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

    /* Proevetallene. Alle sammenhaenge passer, og ingen to udtryk, der
       ikke er det samme, giver det samme tal. */
    var U2 = (function () {
        var u = { M: 58.37, n: 0.7313, v: 1.917 };
        u.m = u.n * u.M;
        u.c = u.n / u.v;
        return u;
    }());
    var U3 = (function () {
        var u = { c1: 0.937, v1: 0.02713, v2: 0.2139 };
        u.n = u.c1 * u.v1;
        u.c2 = u.n / u.v2;
        u.W = u.v2 - u.v1;
        return u;
    }());

    /* Navnene, som eleven ser dem */
    var VIS = { c: "c", n: "n", v: "V", m: "m", M: "M", c1: "c₁", c2: "c₂", v1: "V₁", v2: "V₂", n1: "n", n2: "n", W: "V(vand)" };

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: bogstaver uden indeks, og hvad de betyder her.
       fejl: typiske formler og beskeden til dem. */
    var F = {
        c: { fane: 2, maal: "c", kendt: ["n", "v", "m", "M"],
             fejl: [["v/n", "Brøken er vendt om. Stofmængden står øverst."],
                    ["n*v", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                    ["m/v", "Her skal du bruge stofmængden n, ikke massen m."],
                    ["m/M", "Det giver stofmængden. Koncentrationen er stofmængde pr. liter."]] },
        n_cV: { fane: 2, maal: "n", kendt: ["c", "v"],
                fejl: [["c/v", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                       ["v/c", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                       ["m/M", "Den formel bruges, når man kender massen. Her kender du koncentration og rumfang."]] },
        V: { fane: 2, maal: "v", kendt: ["n", "c"],
             fejl: [["c/n", "Brøken er vendt om. Stofmængden står øverst."],
                    ["n*c", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."]] },
        n_mM: { fane: 2, maal: "n", kendt: ["m", "M"],
                fejl: [["m*M", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                       ["M/m", "Brøken er vendt om. Massen står øverst."],
                       ["c*v", "Her kender du massen, ikke koncentrationen."]] },
        m: { fane: 2, maal: "m", kendt: ["n", "M", "c", "v"],
             fejl: [["n/M", "Massen er stofmængde gange molarmasse, ikke divideret."],
                    ["M/n", "Massen er stofmængde gange molarmasse, ikke divideret."],
                    ["c*M", "Brug stofmængden n, ikke koncentrationen c."]] },
        n1: { fane: 3, maal: "n", kendt: ["c1", "v1"], alias: { c: "c1", v: "v1", n1: "n", n2: "n" },
              fejl: [["c1/v1", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                     ["v1/c1", "Stofmængden er koncentration gange rumfang, ikke divideret."]] },
        c2: { fane: 3, maal: "c2", kendt: ["n", "v2", "c1", "v1"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["n/v1", "V₁ er pipettens rumfang. Stoffet fordeles i kolbens rumfang V₂."],
                     ["v2/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*v2", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                     ["c1*v2/v1", "Forholdet er vendt om. Kolbens rumfang V₂ står i nævneren."]] },
        n2: { fane: 3, maal: "n", kendt: ["c2", "v2"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["c2/v2", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                     ["v2/c2", "Stofmængden er koncentration gange rumfang, ikke divideret."]] },
        V1: { fane: 3, maal: "v1", kendt: ["n", "c1", "c2", "v2"], alias: { c: "c1", v: "v1", n1: "n", n2: "n" },
              fejl: [["c1/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*c1", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."],
                     ["n/c2", "c₂ er koncentrationen i kolben. Stoffet skal komme fra flasken med c₁."]] },
        V2: { fane: 3, maal: "v2", kendt: ["n", "c1", "v1", "c2"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["c2/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*c2", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."],
                     ["n/c1", "c₁ er koncentrationen før. V₂ skal give den nye koncentration c₂."]] },
        vand: { fane: 3, maal: "W", kendt: ["v1", "v2", "n", "c1", "c2"], alias: { n1: "n", n2: "n" },
                fejl: [["v2", "Det er hele rumfanget efter. Der er allerede V₁ i glasset."],
                       ["v1-v2", "Omvendt. V₂ er det største rumfang."],
                       ["v2+v1", "Der skal trækkes fra. V₁ er der allerede."]] },
        c2f: { fane: 3, maal: "c2", kendt: ["c1", "v1", "v2", "n"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
               fejl: [["c1*v2/v1", "Forholdet er vendt om. Kolbens rumfang V₂ står i nævneren."],
                      ["c1*v1", "Det er stofmængden. Del med V₂."],
                      ["c1", "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."]] }
    };
    T.REGLER = F;

    function oversaet(n, alias) {
        if (!alias) return n;
        if (n.s !== undefined) return alias[n.s] ? { s: alias[n.s] } : n;
        var ud = { op: n.op };
        if (n.tal !== undefined) return n;
        if (n.a) ud.a = oversaet(n.a, alias);
        if (n.b) ud.b = oversaet(n.b, alias);
        return ud;
    }

    function laes(tekst, r) {
        var tk = tokens(tekst);
        if (!tk || !tk.length) return null;
        var p = parse(tk);
        return p ? oversaet(p, r.alias) : null;
    }

    /* Giver { ok, note, besked, tom } */
    T.formel = function (id, raa) {
        var r = F[id];
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var U = r.fane === 2 ? U2 : U3;
        var s = norm(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var bogst = r.fane === 2 ? "c, n, V, m og M" : "c₁, V₁, c₂, V₂ og n";
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug bogstaverne " + bogst + "." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        for (var i = 0; i < dele.length; i++) {
            var p = laes(dele[i], r);
            if (!p) {
                if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med bogstaver først. Tallene kommer i næste felt." };
                return kanIkke;
            }
            led.push(p);
        }
        var alle = {};
        led.forEach(function (p) { bogstaver(p, alle); });
        /* Tal i formlen: kun et rent tal er en fejl, 1000 og lignende maa staa */
        if (led.every(function (p) { return harTal(p) && !Object.keys(bogstaver(p)).length; })) {
            return { besked: "Skriv formlen med bogstaver først. Tallene kommer i næste felt." };
        }
        var fremmede = Object.keys(alle).filter(function (b) {
            return b !== r.maal && r.kendt.indexOf(b) < 0 && U[b] === undefined;
        });
        if (fremmede.length) return kanIkke;
        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });

        var hoejre = led[led.length - 1];
        var mv = U[r.maal];
        var ukendt = ukendte.length ? VIS[ukendte[0]] + " kender du ikke i dette trin. Brug det, du kender." : "";
        if (led.length === 1) {
            /* Kun udtrykket, fx "n / V" */
            var v = regn(hoejre, U);
            if (!ukendt && naer(v, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, v, U, ukendt);
        }
        /* En ligning. Er venstresiden maalet, skal hoejresiden give det */
        var venstre = led[0];
        var erMaal = venstre.s === r.maal;
        var vV = regn(venstre, U), vH = regn(hoejre, U);
        if (erMaal) {
            if (!ukendt && naer(vH, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, vH, U, ukendt);
        }
        if (naer(vV, vH, 1e-6)) {
            if (!alle[r.maal]) return { besked: "Den sammenhæng er rigtig, men den giver ikke " + VIS[r.maal] + "." };
            return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        if (venstre.s !== undefined && venstre.s !== r.maal && Object.keys(bogstaver(venstre)).length === 1) {
            return { besked: "Her skal du finde " + VIS[r.maal] + ". Skriv " + VIS[r.maal] + " = …" };
        }
        return fejlBesked(r, vH, U);
    };

    /* En typisk fejl faar sin egen besked; ellers siges det, hvis der er
       brugt noget, man ikke kender endnu */
    function fejlBesked(r, v, U, ukendt) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = laes(r.fejl[i][0], r);
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Tallet ------------------------------------------------------------------
       o: opgaven med tal (V i mL) og facit. Hvert trin har facit og en
       liste af typiske fejl, regnet ud af opgavens egne tal. */
    function kandidater(id, o) {
        var t = o.tal, f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        var VmL = t.V, VL = t.V / 1000;
        var ML = "Rumfanget skal være i liter: " + (VmL !== undefined ? K.mL(VmL) + " mL = " + K.L(VmL) + " L." : "1 mL = 0,001 L.");
        switch (id) {
        case "c":
            return { facit: f.c, enhed: "M", fejl: [
                [f.n / VmL, ML], [VL / f.n, "Brøken er vendt om. c = n / V."], [f.n * VL, "Du har ganget. c = n / V."],
                [f.n, "Det er stofmængden. Del den med rumfanget."],
                [t.m !== undefined ? t.m / VL : NaN, "Brug stofmængden n, ikke massen m."],
                [t.m !== undefined ? t.m / VmL : NaN, "Brug stofmængden n, ikke massen m."]] };
        case "n_cV":
            return { facit: f.n_cV, enhed: "mol", fejl: [
                [t.c * VmL, ML], [t.c / VL, "Du har divideret. n = c · V."], [VL / t.c, "Du har divideret. n = c · V."],
                [t.c / VmL, "Du har divideret. n = c · V."], [VmL / t.c, "Du har divideret. n = c · V."],
                [t.c, "Det er koncentrationen. Gang den med rumfanget i liter."]] };
        case "V":
            return { facit: f.V, enhed: "L", fejl: [
                [f.V * 1000, "Det er rumfanget i mL. Skriv det i liter."], [t.c / t.n, "Brøken er vendt om. V = n / c."],
                [t.n * t.c, "Du har ganget. V = n / c."]] };
        case "M":
            /* Et glemt tal i formlen: ét ad gangen og alle paa én gang */
            var glemt = [], g0 = Object.keys(st.antal);
            var TAEL = "Tæl atomerne. Tallet efter et grundstof gælder det grundstof: " + D.molarLed(st) + ".";
            g0.forEach(function (g) {
                if (st.antal[g] > 1) glemt.push([(st.M - D.ATOMMASSE[g] * (st.antal[g] - 1)) / 100, TAEL]);
            });
            glemt.push([g0.reduce(function (s, g) { return s + D.ATOMMASSE[g]; }, 0) / 100, TAEL]);
            return { facit: st.Mv, enhed: "g/mol", absTol: 0.06, fejl: glemt };
        case "n_mM":
            return { facit: f.n_mM, enhed: "mol", fejl: [
                [t.m * st.Mv, "Du har ganget. n = m / M."], [st.Mv / t.m, "Brøken er vendt om. n = m / M."],
                [t.m, "Det er massen. Del den med molarmassen."]] };
        case "m":
            return { facit: f.m, enhed: "g", fejl: [
                [f.n / st.Mv, "Du har divideret. m = n · M."], [st.Mv / f.n, "Du har divideret. m = n · M."],
                [t.c * st.Mv, "Det er c · M. Brug stofmængden n."], [f.n * 1000 * st.Mv, "Tjek stofmængden. Rumfanget skal være i liter."]] };
        case "n1":
            return { facit: f.n1, enhed: "mol", fejl: [
                [f.c1 * t.V1, "Rumfanget skal være i liter: " + K.mL(t.V1) + " mL = " + K.L(t.V1) + " L."],
                [f.c1 / (t.V1 / 1000), "Du har divideret. n = c₁ · V₁."], [(t.V1 / 1000) / f.c1, "Du har divideret. n = c₁ · V₁."],
                [t.V2 !== undefined ? f.c1 * t.V2 / 1000 : NaN, "V₂ er rumfanget efter. Stoffet kommer fra V₁."]] };
        case "c2":
            return { facit: f.c2, enhed: "M", fejl: [
                [f.n1 / t.V2, "Rumfanget skal være i liter: " + K.mL(t.V2) + " mL = " + K.L(t.V2) + " L."],
                [f.n1 / (t.V1 / 1000), "V₁ er pipettens rumfang. Stoffet fordeles i kolbens rumfang V₂."],
                [f.c1, "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."],
                [f.c1 * t.V2 / t.V1, "Forholdet er vendt om. Koncentrationen bliver mindre, når der kommer vand til."],
                [(t.V2 / 1000) / f.n1, "Brøken er vendt om. c₂ = n / V₂."]] };
        case "n2":
            return { facit: f.n2, enhed: "mol", fejl: [
                [t.c2 * t.V2, "Rumfanget skal være i liter: " + K.mL(t.V2) + " mL = " + K.L(t.V2) + " L."],
                [t.c2 / (t.V2 / 1000), "Du har divideret. n = c₂ · V₂."], [(t.V2 / 1000) / t.c2, "Du har divideret. n = c₂ · V₂."]] };
        case "V1":
            return { facit: f.V1, enhed: "mL", fejl: [
                [f.V1 / 1000, "Det er i liter. Skriv det i mL: " + K.L(f.V1) + " L = " + K.mL(f.V1) + " mL."],
                [f.c1 / f.n2, "Brøken er vendt om. V₁ = n / c₁."], [t.V2, "Det er kolbens rumfang. Pipetten tager kun en del."],
                [f.n2 / t.c2 * 1000, "Brug flaskens koncentration c₁. Stoffet skal komme derfra."]] };
        case "V2":
            return { facit: f.V2L, enhed: "L", fejl: [
                [f.V2L * 1000, "Det er i mL. Skriv rumfanget i liter."], [t.c2 / f.n1, "Brøken er vendt om. V₂ = n / c₂."],
                [f.n1 / f.c1, "Brug c₂, den koncentration, du skal ende med."],
                [f.vand / 1000, "Det er vandet. Her skal du finde hele rumfanget efter."]] };
        case "vand":
            return { facit: f.vand, enhed: "mL", fejl: [
                [f.V2, "Det er hele rumfanget efter. Der er allerede " + K.mL(t.V1) + " mL i glasset."],
                [f.vand / 1000, "Det er i liter. Skriv det i mL."],
                [f.V2 + t.V1, "Der skal trækkes fra: V₂ − V₁."]] };
        case "c2f":
            return { facit: f.c2f, enhed: "M", fejl: [
                [f.c1 * t.V2 / t.V1, "Forholdet er vendt om. Kolbens rumfang V₂ står i nævneren."],
                [f.c1 * t.V1, "Del med V₂."], [f.c1 * t.V1 / 1000, "Det er stofmængden. Del med V₂ i liter."],
                [f.c1, "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."]] };
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
            if (isFinite(f) && f > 0 && naer(v, f)) return { besked: k.fejl[i][1] };
        }
        if (kommaFlyttet(v, k.facit)) return { besked: "Tjek kommaet. Tallet er " + (v > k.facit ? "for stort." : "for lille.") };
        if (k.absTol ? Math.abs(v - k.facit) <= 1 : naer(v, k.facit, 0.04)) {
            return { besked: id === "M" ? "Tæt på. Brug atommasserne med to decimaler, fx O = 16,00." : "Tæt på. Regn med alle cifrene." };
        }
        return { besked: "Det passer ikke. Tryk på Giv hint, hvis du sidder fast." };
    };

    /* ----- Den paene beregning: [formlen, tallene] ------------------------------------ */
    function venstre(id, o) {
        var st = o.stof ? "(" + D.stof(o.stof).formel + ")" : "";
        var v = D.TRIN[id].venstre;
        if (o.fane === 2 && id !== "V") return v + st;
        return v;
    }
    T.venstre = venstre;

    T.formelTekst = function (id, o) {
        return venstre(id, o) + (D.TRIN[id].formel ? " = " + D.TRIN[id].formel : "");
    };

    T.regning = function (id, o) {
        var t = o.tal, f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        var fl = T.formelTekst(id, o);
        switch (id) {
        case "c": return [fl, "= " + K.mol(f.n) + " mol / " + K.L(t.V) + " L = " + K.c(f.c) + " M"];
        case "n_cV": return [fl, "= " + K.c(t.c) + " M · " + K.L(t.V) + " L = " + K.mol(f.n_cV) + " mol"];
        case "V": return [fl, "= " + K.mol(t.n) + " mol / " + K.c(t.c) + " M = " + K.L(f.V * 1000) + " L"];
        case "M": return [venstre(id, o) + " = " + D.molarLed(st), "= " + K.M(st) + " g/mol"];
        case "n_mM": return [fl, "= " + K.g(t.m) + " g / " + K.M(st) + " g/mol = " + K.mol(f.n_mM) + " mol"];
        case "m": return [fl, "= " + K.mol(f.n) + " mol · " + K.M(st) + " g/mol = " + K.g(f.m) + " g"];
        case "n1": return [fl, "= " + K.c(f.c1) + " M · " + K.L(t.V1) + " L = " + K.mol(f.n1) + " mol"];
        case "c2": return [fl, "= " + K.mol(f.n1) + " mol / " + K.L(t.V2) + " L = " + K.c(f.c2) + " M"];
        case "n2": return [fl, "= " + K.c(t.c2) + " M · " + K.L(t.V2) + " L = " + K.mol(f.n2) + " mol"];
        case "V1": return [fl, "= " + K.mol(f.n2) + " mol / " + K.c(f.c1) + " M = " + K.L(f.V1) + " L = " + K.mL(f.V1) + " mL"];
        case "V2": return [fl, "= " + K.mol(f.n1) + " mol / " + K.c(t.c2) + " M = " + K.L(f.V2) + " L"];
        case "vand": return [fl, "= " + K.mL(f.V2) + " mL − " + K.mL(t.V1) + " mL = " + K.mL(f.vand) + " mL"];
        case "c2f": return [fl, "= " + K.c(f.c1) + " M · " + K.mL(t.V1) + " mL / " + K.mL(t.V2) + " mL = " + K.c(f.c2f) + " M"];
        }
        return [fl, ""];
    };

    /* Facit med enhed, som det staar i feltet, naar trinnet er loest */
    T.facitTekst = function (id, o) {
        var f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        switch (id) {
        case "c": return K.c(f.c) + " M";
        case "n_cV": return K.mol(f.n_cV) + " mol";
        case "V": return K.L(f.V * 1000) + " L";
        case "M": return K.M(st) + " g/mol";
        case "n_mM": return K.mol(f.n_mM) + " mol";
        case "m": return K.g(f.m) + " g";
        case "n1": return K.mol(f.n1) + " mol";
        case "c2": return K.c(f.c2) + " M";
        case "n2": return K.mol(f.n2) + " mol";
        case "V1": return K.mL(f.V1) + " mL";
        case "V2": return K.L(f.V2) + " L";
        case "vand": return K.mL(f.vand) + " mL";
        case "c2f": return K.c(f.c2f) + " M";
        }
        return "";
    };

    /* Hintet til tallet: omregningen, hvis der er mL, og tallene sat ind */
    T.talHint = function (id, o) {
        var r = T.regning(id, o), t = o.tal;
        var ind = "= " + r[1].slice(2).split(" = ")[0];
        if (id === "M") return "Slå atommasserne op, og læg dem sammen: " + r[0].replace(/^[^=]*= /, "") + ".";
        var mL = "";
        if ((id === "c" || id === "n_cV") && o.enhed === "mL") mL = "Husk: " + K.mL(t.V) + " mL = " + K.L(t.V) + " L. ";
        if (id === "n1" && t.V1 !== undefined) mL = "Husk: " + K.mL(t.V1) + " mL = " + K.L(t.V1) + " L. ";
        if ((id === "c2" || id === "n2") && t.V2 !== undefined) mL = "Husk: " + K.mL(t.V2) + " mL = " + K.L(t.V2) + " L. ";
        if (id === "V1") mL = "Svaret kommer i liter. Regn det om til mL. ";
        return mL + "Sæt tallene ind: " + T.formelTekst(id, o).split(" = ")[0] + " " + ind + ".";
    };

    NK.Tjek = T;
}());

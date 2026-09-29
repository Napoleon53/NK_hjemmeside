/* =====================================================================
   tjek.js - regnetrinene paa fane 3 og 4: formlen, tallene med enheder,
   resultatet og den paene beregning

   Formlen skrives i felter: eleven vaelger formens skabelon (en broek,
   et produkt, en forskel eller et produkt over en broekstreg) og skriver
   et bogstav i hvert felt (brugerens valg 29. sept. 2026). Skabelonen og
   bogstaverne bliver til et udtryk, der tjekkes ved at regne det ud med
   faste proevetal, hvor alle sammenhaengene passer (c = n / V, m = n · M,
   c_før · V_før = c_efter · V_efter). Saa er c · V og V · c det samme, og
   de typiske fejl (broeken vendt om, ganget i stedet for divideret,
   V_før i stedet for V_efter) genkendes paa deres vaerdi.

   Tallene i mellemregningen og resultatet skrives med enhed. Et tal er
   rigtigt, naar det hoejst er 1 % fra facit og har en enhed af den
   rigtige slags (mol, M, L eller mL, g, g/mol). Et rigtigt tal med den
   forkerte enhed faar en besked om enhederne, fx at stofmaengden maales
   i mol og ikke i M (brugerens oenske: mere traening i forskellen paa c
   og n). Rumfang i mL og L regnes om.

   Svarene er { ok, besked, note, tom, talOk }. Beskeder kan indeholde
   "V_før" og lignende; de vises med NK.sub.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = {};
    var TOL = 0.01;

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-12;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* ----- Tal med enhed -----------------------------------------------------------
       "0,250 mol", "0,25mol", "2,5·10^-1 mol", "1,00 M", "1,00 mol/L", "250 mL".
       enhed er den normaliserede enhed: mol, M, L, mL, g, g/mol, "lilleM"
       (et lille m, der nok skulle vaere M) eller den raa tekst. */
    function normEnhed(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "").replace(/[·×∙•⋅*]/g, "");
        if (!s) return "";
        if (s === "M") return "M";
        if (s === "m") return "lilleM";
        var sl = s.toLowerCase().replace(/[()]/g, "");
        if (/^mol\/(l|liter)$/.test(sl) || /^moll\^?-1$/.test(sl)) return "M";
        if (/^(mol|mole|moles)$/.test(sl)) return "mol";
        if (/^(l|liter)$/.test(sl)) return "L";
        if (sl === "ml") return "mL";
        if (/^(g|gram)$/.test(sl)) return "g";
        if (/^g\/mol$/.test(sl) || /^gmol\^?-1$/.test(sl)) return "g/mol";
        return s;
    }
    T.normEnhed = normEnhed;

    /* Den slags stoerrelse, en enhed maaler */
    var SLAGS = { mol: "n", M: "c", L: "V", mL: "V", g: "m", "g/mol": "M" };
    T.SLAGS = SLAGS;
    var ENHED_NAVN = { n: "mol", c: "M (mol/L)", V: "L eller mL", m: "g", M: "g/mol" };

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
        var v = e !== undefined ? foran * Math.pow(10, parseInt(e, 10)) : foran;
        var enhed = normEnhed(m[4]);
        return { v: v, enhed: enhed, raaEnhed: m[4].trim(), slags: SLAGS[enhed] || null,
                 base: enhed === "mL" ? v / 1000 : v };
    };

    function kommaFlyttet(v, facit) {
        for (var k = 1; k <= 4; k++) {
            var f = Math.pow(10, k);
            if (naer(v, facit * f) || naer(v, facit / f)) return true;
        }
        return false;
    }

    /* ----- Formlen: fra tekst til noget, der kan regnes ud -------------------------
       Haevede og saenkede tegn bliver almindelige, (NaCl) og andre
       etiketter forsvinder, (før) og (efter) bliver 1 og 2, og (vand)
       bliver til sit eget bogstav. Store og smaa bogstaver er ens,
       undtagen M (molarmasse) og m (masse). */
    function norm(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/−/g, "-").replace(/÷/g, "/").replace(/:/g, "/");
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/v?\((vand|water|h2o)\)/gi, "W").replace(/vvand/gi, "W");
        s = s.replace(/\((før|foer|for|start|flaske|flasken|pipette|pipetten|1)\)/gi, "1");
        s = s.replace(/\((efter|slut|kolbe|kolben|2)\)/gi, "2");
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

    /* Et lille udtryk: sum af produkter, med underforstaaet gangetegn */
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
    var U3 = (function () {
        var u = { M: 58.37, n: 0.7313, v: 1.917 };
        u.m = u.n * u.M;
        u.c = u.n / u.v;
        return u;
    }());
    var U4 = (function () {
        var u = { c1: 0.937, v1: 0.02713, v2: 0.2139 };
        u.n = u.c1 * u.v1;
        u.c2 = u.n / u.v2;
        u.W = u.v2 - u.v1;
        return u;
    }());

    /* Navnene, som eleven ser dem (med saenket før og efter) */
    var VIS = { c: "c", n: "n", v: "V", m: "m", M: "M", c1: "c_før", c2: "c_efter", v1: "V_før", v2: "V_efter", n1: "n", n2: "n", W: "V_vand" };
    T.VIS = VIS;

    /* Bogstaverne i hver fane, som de naevnes i en besked */
    var BOGST = { 3: "c, n, V, m og M", 4: "c_før, V_før, c_efter, V_efter, V_vand og n" };

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: bogstaver uden før og efter, og hvad de betyder
       her. fejl: typiske formler og beskeden til dem. */
    var F = {
        c: { fane: 3, maal: "c", kendt: ["n", "v", "m", "M"],
             fejl: [["v/n", "Brøken er vendt om. Stofmængden står øverst."],
                    ["n*v", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                    ["m/v", "Her skal du bruge stofmængden n, ikke massen m."],
                    ["m/M", "Det giver stofmængden. Koncentrationen er stofmængde pr. liter."]] },
        n_cV: { fane: 3, maal: "n", kendt: ["c", "v"],
                fejl: [["c/v", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                       ["v/c", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                       ["m/M", "Den formel bruges, når man kender massen. Her kender du koncentration og rumfang."]] },
        V: { fane: 3, maal: "v", kendt: ["n", "c"],
             fejl: [["c/n", "Brøken er vendt om. Stofmængden står øverst."],
                    ["n*c", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."]] },
        n_mM: { fane: 3, maal: "n", kendt: ["m", "M"],
                fejl: [["m*M", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                       ["M/m", "Brøken er vendt om. Massen står øverst."],
                       ["c*v", "Her kender du massen, ikke koncentrationen."]] },
        m: { fane: 3, maal: "m", kendt: ["n", "M", "c", "v"],
             fejl: [["n/M", "Massen er stofmængde gange molarmasse, ikke divideret."],
                    ["M/n", "Massen er stofmængde gange molarmasse, ikke divideret."],
                    ["c*M", "Brug stofmængden n, ikke koncentrationen c."]] },
        n1: { fane: 4, maal: "n", kendt: ["c1", "v1"], alias: { c: "c1", v: "v1", n1: "n", n2: "n" },
              fejl: [["c1/v1", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                     ["v1/c1", "Stofmængden er koncentration gange rumfang, ikke divideret."]] },
        c2: { fane: 4, maal: "c2", kendt: ["n", "v2", "c1", "v1"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["n/v1", "V_før er pipettens rumfang. Stoffet fordeles i kolbens rumfang V_efter."],
                     ["v2/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*v2", "Koncentrationen er stofmængde divideret med rumfang, ikke ganget."],
                     ["c1*v2/v1", "Forholdet er vendt om. Kolbens rumfang V_efter står under brøkstregen."]] },
        n2: { fane: 4, maal: "n", kendt: ["c2", "v2"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["c2/v2", "Stofmængden er koncentration gange rumfang, ikke divideret."],
                     ["v2/c2", "Stofmængden er koncentration gange rumfang, ikke divideret."]] },
        V1: { fane: 4, maal: "v1", kendt: ["n", "c1", "c2", "v2"], alias: { c: "c1", v: "v1", n1: "n", n2: "n" },
              fejl: [["c1/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*c1", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."],
                     ["n/c2", "c_efter er koncentrationen i kolben. Stoffet skal komme fra flasken med c_før."]] },
        V2: { fane: 4, maal: "v2", kendt: ["n", "c1", "v1", "c2"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
              fejl: [["c2/n", "Brøken er vendt om. Stofmængden står øverst."],
                     ["n*c2", "Rumfanget er stofmængde divideret med koncentration, ikke ganget."],
                     ["n/c1", "c_før er koncentrationen før. V_efter skal give den nye koncentration c_efter."]] },
        vand: { fane: 4, maal: "W", kendt: ["v1", "v2", "n", "c1", "c2"], alias: { n1: "n", n2: "n" },
                fejl: [["v2", "Det er hele rumfanget efter. Der er allerede V_før i glasset."],
                       ["v1-v2", "Omvendt. V_efter er det største rumfang, så det står først."],
                       ["v2+v1", "Der skal trækkes fra. V_før er der allerede."]] },
        c2f: { fane: 4, maal: "c2", kendt: ["c1", "v1", "v2", "n"], alias: { c: "c2", v: "v2", n1: "n", n2: "n" },
               fejl: [["c1*v2/v1", "Forholdet er vendt om. Kolbens rumfang V_efter står under brøkstregen."],
                      ["c1*v1", "Det er stofmængden. Del med V_efter."],
                      ["c1", "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."]] }
    };
    T.REGLER = F;

    function oversaet(n, alias) {
        if (!alias) return n;
        if (n.s !== undefined) return alias[n.s] ? { s: alias[n.s] } : n;
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
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

    /* En formel skrevet som tekst ("c = n / V", "n/V", "c1*v1/v2").
       Giver { ok, note, besked, tom }. */
    T.formel = function (id, raa) {
        var r = F[id];
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var U = r.fane === 3 ? U3 : U4;
        var s = norm(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug bogstaverne " + BOGST[r.fane] + "." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        for (var i = 0; i < dele.length; i++) {
            var p = laes(dele[i], r);
            if (!p) {
                if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med bogstaver. Tallene sættes ind i næste linje." };
                return kanIkke;
            }
            led.push(p);
        }
        var alle = {};
        led.forEach(function (p) { bogstaver(p, alle); });
        if (led.every(function (p) { return harTal(p) && !Object.keys(bogstaver(p)).length; })) {
            return { besked: "Skriv formlen med bogstaver. Tallene sættes ind i næste linje." };
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
            if (alle[r.maal]) return { besked: "Du skal finde " + VIS[r.maal] + ". Det står allerede på venstre side og kan ikke også stå i formlen." };
            var v = regn(hoejre, U);
            if (!ukendt && naer(v, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, v, U, ukendt);
        }
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

    function fejlBesked(r, v, U, ukendt) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = laes(r.fejl[i][0], r);
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Formlen skrevet i felterne ------------------------------------------------
       Et bogstav i et felt: "V", "v", "V før", "V_før", "Vfør", "V(før)",
       "V1" og "c(NaCl)" er alle til at forstaa. Giver { s } (bogstavet,
       som formlerne kender det), { tal: true } eller null. */
    T.bogstav = function (raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        if (!s) return { tom: true };
        if (/^[\d.,]+$/.test(s)) return { tal: true };
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/\(([^()]*)\)/g, function (hel, ind) {
            return /^(før|foer|for|efter|vand|1|2|start|slut)$/i.test(ind) ? ind : "";
        });
        var m = s.match(/^([cCnNvVmM])(.*)$/);
        if (!m) return null;
        var b = m[1], rest = m[2].toLowerCase();
        var base = b === "M" ? "M" : (b === "m" ? "m" : b.toLowerCase());
        if (!rest) return { s: base };
        var foer = /^(før|foer|for|f|1|start)$/.test(rest), efter = /^(efter|eft|e|2|slut)$/.test(rest);
        var vand = /^(vand|w|h2o)$/.test(rest);
        if ((base === "c" || base === "v") && foer) return { s: base + "1" };
        if ((base === "c" || base === "v") && efter) return { s: base + "2" };
        if (base === "v" && vand) return { s: "W" };
        if (base === "n" && (foer || efter)) return { s: "n" };
        return null;
    };

    /* Skabelonen med bogstaverne i felterne som tekst: "/" med n og V er "n/v" */
    function udtryk(sk, s) {
        if (sk === "/") return s[0] + "/" + s[1];
        if (sk === "*") return s[0] + "*" + s[1];
        if (sk === "-") return s[0] + "-" + s[1];
        return s[0] + "*" + s[1] + "/" + s[2];
    }

    T.ANTAL_FELTER = { "/": 2, "*": 2, "-": 2, "*/": 3 };

    /* sk: skabelonen. felter: det, der er skrevet i felterne. Giver
       { ok } eller { besked, tom, felt } (felt: det felt, beskeden gaelder) */
    T.formelFelter = function (id, sk, felter) {
        var r = F[id];
        if (!sk) return { tom: true, besked: "Vælg først formlens form: en brøk eller et gangestykke." };
        var tomme = felter.filter(function (x) { return !String(x || "").trim(); }).length;
        if (tomme === felter.length) return { tom: true, besked: "Skriv et bogstav i hvert felt i formlen.", felt: 0 };
        var s = [];
        for (var i = 0; i < felter.length; i++) {
            if (!String(felter[i] || "").trim()) return { tom: true, besked: "Skriv et bogstav i hvert felt i formlen.", felt: i };
            var b = T.bogstav(felter[i]);
            if (b && b.tal) return { besked: "Skriv formlen med bogstaver. Tallene sættes ind i næste linje.", felt: i };
            if (!b) return { besked: String(felter[i]).trim() + " er ikke et af bogstaverne. Brug " + BOGST[r.fane] + ".", felt: i };
            var ov = r.alias && r.alias[b.s] ? r.alias[b.s] : b.s;
            if (ov === r.maal) {
                return { besked: "Du skal finde " + VIS[r.maal] + ". Det står allerede på venstre side og kan ikke også stå i formlen.", felt: i };
            }
            s.push(b.s);
        }
        return T.formel(id, udtryk(sk, s));
    };

    /* ----- Leddene i mellemregningen ---------------------------------------------------
       T.led giver tallene i formlens raekkefoelge: { sym, slags, v (i mol,
       M, L, g eller g/mol), mL (rumfang), tekst (med enhed) }. */
    function nLed(sym, v) { return { sym: sym, slags: "n", v: v, tekst: K.mol(v) + " mol" }; }
    function cLed(sym, v) { return { sym: sym, slags: "c", v: v, tekst: K.c(v) + " M" }; }
    function vLed(sym, mL, vis) {
        return { sym: sym, slags: "V", v: mL / 1000, mL: mL, tekst: vis === "mL" ? K.mL(mL) + " mL" : K.L(mL) + " L" };
    }

    T.led = function (id, o) {
        var t = o.tal, f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        switch (id) {
        case "c": return [nLed("n", f.n), vLed("V", t.V)];
        case "n_cV": return [cLed("c", t.c), vLed("V", t.V)];
        case "V": return [nLed("n", t.n), cLed("c", t.c)];
        case "n_mM": return [{ sym: "m", slags: "m", v: t.m, tekst: K.g(t.m) + " g" },
                             { sym: "M", slags: "M", v: st.Mv, tekst: K.M(st) + " g/mol" }];
        case "m": return [nLed("n", f.n), { sym: "M", slags: "M", v: st.Mv, tekst: K.M(st) + " g/mol" }];
        case "n1": return [cLed("c_før", f.c1), vLed("V_før", t.V1)];
        case "c2": return [nLed("n", f.n1), vLed("V_efter", t.V2)];
        case "n2": return [cLed("c_efter", t.c2), vLed("V_efter", t.V2)];
        case "V1": return [nLed("n", f.n2), cLed("c_før", f.c1)];
        case "V2": return [nLed("n", f.n1), cLed("c_efter", t.c2)];
        case "vand": return [vLed("V_efter", f.V2, "mL"), vLed("V_før", t.V1, "mL")];
        case "c2f": return [cLed("c_før", f.c1), vLed("V_før", t.V1, "mL"), vLed("V_efter", t.V2, "mL")];
        }
        return [];
    };

    /* Et leds tal skrevet i den enhed, eleven brugte (rumfang i mL eller L) */
    T.ledTekst = function (L, enhed) {
        if (L.slags !== "V" || !enhed) return L.tekst;
        return enhed === "mL" ? K.mL(L.mL) + " mL" : K.L(L.mL) + " L";
    };

    /* Hvor et felt i mellemregningen staar, som det siges i en besked */
    var HVOR = {
        "/": ["over brøkstregen", "under brøkstregen"],
        "*": ["i det første felt", "i det andet felt"],
        "-": ["i det første felt", "i det andet felt"],
        "*/": ["i det første felt over brøkstregen", "i det andet felt over brøkstregen", "under brøkstregen"]
    };
    T.HVOR = HVOR;

    /* De felter, et led maa staa i. Et produkt kan byttes om; en broek og en
       forskel kan ikke. plads: de led, der allerede staar i felterne. */
    T.ledige = function (op, i, plads) {
        function fri(liste) { return liste.filter(function (j) { return plads.indexOf(j) < 0; }); }
        if (op === "*") return fri([0, 1]);
        if (op === "*/") return i < 2 ? fri([0, 1]) : [2];
        return [i];
    };

    /* Et tal med enhed i et af mellemregningens felter. i: feltet. f: trinnet
       (vEnhed: den enhed, det foerste rumfang fik). Giver { ok, led, enhed }
       eller { besked, tom, talOk }. */
    T.tjekLed = function (id, o, i, raa, ledige, f) {
        var led = T.led(id, o), t = D.TRIN[id], hvor = HVOR[t.op][i];
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet og enheden " + hvor + "." };
        var s = T.svar(raa);
        if (!s) return { besked: "Skriv et tal og en enhed " + hvor + "." };
        /* Et tal mere efter enheden (men ikke mol-1 eller L⁻¹): flere tal i ét felt */
        if (/\d/.test(s.raaEnhed.replace(/\^?\s*[-−⁻]\s*[1¹]/g, ""))) {
            return { besked: t.op === "/" ? "Skriv kun ét tal i hvert felt: det ene over brøkstregen, det andet under." : "Skriv kun ét tal i hvert felt." };
        }
        var k, L;
        for (k = 0; k < ledige.length; k++) {
            L = led[ledige[k]];
            if (s.slags === L.slags && naer(s.base, L.v)) {
                if (L.slags === "V" && t.rumfang === "L" && s.enhed === "mL") {
                    return { besked: "Rumfanget skal sættes ind i liter, når koncentrationen er i M (mol/L): " +
                        K.mL(L.mL) + " mL = " + K.L(L.mL) + " L.", talOk: true };
                }
                if (L.slags === "V" && t.rumfang === "ens" && f && f.vEnhed && f.vEnhed !== s.enhed) {
                    return { besked: "Skriv begge rumfang i samme enhed, fx begge i mL.", talOk: true };
                }
                return { ok: true, led: ledige[k], enhed: s.enhed };
            }
        }
        for (k = 0; k < ledige.length; k++) {
            L = led[ledige[k]];
            /* Et rumfang med den forkerte af de to enheder: 250 L for 250 mL */
            if (L.slags === "V" && s.enhed === "L" && naer(s.v, L.mL)) {
                return { besked: "Tjek enheden: det er " + K.mL(L.mL) + " mL, og det er " + K.L(L.mL) + " L.", talOk: true };
            }
            if (L.slags === "V" && s.enhed === "mL" && naer(s.v, L.v) && !naer(L.v, L.mL)) {
                return { besked: "Tjek enheden: det er " + K.L(L.mL) + " L, og det er " + K.mL(L.mL) + " mL.", talOk: true };
            }
            if (naer(s.v, L.v) || (L.slags === "V" && naer(s.v, L.mL))) {
                if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
                if (s.enhed === "lilleM") return { besked: "Tallet er rigtigt. Skriv M med stort. Lille m er massen.", talOk: true };
                return { besked: "Tallet er rigtigt, men " + D.NAVN[L.sym] + " måles i " + ENHED_NAVN[L.slags] +
                    ", ikke i " + s.raaEnhed + ".", talOk: true };
            }
        }
        /* Et led, der hoerer til et andet felt */
        for (var j = 0; j < led.length; j++) {
            if (ledige.indexOf(j) >= 0) continue;
            var A = led[j];
            if (!(naer(s.base, A.v) || naer(s.v, A.v) || (A.slags === "V" && naer(s.v, A.mL)))) continue;
            if (t.op === "/") return { besked: "Brøken er vendt om. " + stort(D.NAVN[led[0].sym]) + " står øverst, som i formlen." };
            if (t.op === "-") return { besked: "Omvendt. " + stort(D.NAVN[led[0].sym]) + " står først, som i formlen." };
            if (t.op === "*/") {
                return { besked: i === 2 ? "Under brøkstregen står " + D.NAVN[led[2].sym] + ", som i formlen." :
                    "Over brøkstregen står " + D.NAVN[led[0].sym] + " og " + D.NAVN[led[1].sym] + ", som i formlen." };
            }
        }
        var L0 = led[ledige[0]];
        if (ledige.length === 1 && kommaFlyttet(s.base, L0.v)) return { besked: "Tjek kommaet. Tallet er for " + (s.base > L0.v ? "stort." : "lille.") };
        if (ledige.length === 1) return { besked: "Det tal passer ikke. " + stort(hvor) + " står " + D.NAVN[L0.sym] + " " + L0.sym + "." };
        return { besked: "Det tal passer ikke. Her står " + ledige.map(function (j) { return D.NAVN[led[j].sym] + " " + led[j].sym; }).join(" og ") + "." };
    };

    /* ----- Resultatet -------------------------------------------------------------------
       slags og facit (i mol, M, L, g eller g/mol) for hvert trin */
    function resultat(id, o) {
        var f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        switch (id) {
        case "c": return { slags: "c", facit: f.c };
        case "n_cV": return { slags: "n", facit: f.n_cV };
        case "V": return { slags: "V", facit: f.V };
        case "M": return { slags: "M", facit: st.Mv, absTol: 0.06 };
        case "n_mM": return { slags: "n", facit: f.n_mM };
        case "m": return { slags: "m", facit: f.m };
        case "n1": return { slags: "n", facit: f.n1 };
        case "c2": return { slags: "c", facit: f.c2 };
        case "n2": return { slags: "n", facit: f.n2 };
        case "V1": return { slags: "V", facit: f.V1 / 1000 };
        case "V2": return { slags: "V", facit: f.V2L };
        case "vand": return { slags: "V", facit: f.vand / 1000 };
        case "c2f": return { slags: "c", facit: f.c2f };
        }
        return null;
    }

    /* Enhederne, der viser, hvad resultatet faar */
    var ENHEDSREGNING = {
        c: "mol / L = mol/L = M", n_cV: "M · L = mol/L · L = mol", V: "mol / M = mol / (mol/L) = L",
        M: "atommasserne er i g/mol", n_mM: "g / (g/mol) = mol", m: "mol · g/mol = g",
        n1: "M · L = mol/L · L = mol", c2: "mol / L = mol/L = M", n2: "M · L = mol/L · L = mol",
        V1: "mol / M = mol / (mol/L) = L", V2: "mol / M = mol / (mol/L) = L", vand: "mL − mL = mL",
        c2f: "M · mL / mL = M"
    };
    T.ENHEDSREGNING = ENHEDSREGNING;

    /* De typiske fejl i resultatet (i mol, M, L, g eller g/mol), regnet ud af
       opgavens egne tal */
    function kandidater(id, o) {
        var t = o.tal, f = o.facit, st = o.stof ? D.stof(o.stof) : null;
        var VmL = t.V, VL = t.V / 1000;
        var ML = VmL !== undefined ? "Rumfanget skal være i liter: " + K.mL(VmL) + " mL = " + K.L(VmL) + " L." : "";
        switch (id) {
        case "c":
            return [[f.n / VmL, ML], [VL / f.n, "Brøken er vendt om. c = n / V."], [f.n * VL, "Du har ganget. c = n / V."],
                    [f.n, "Det er stofmængden. Del den med rumfanget."],
                    [t.m !== undefined ? t.m / VL : NaN, "Brug stofmængden n, ikke massen m."],
                    [t.m !== undefined ? t.m / VmL : NaN, "Brug stofmængden n, ikke massen m."]];
        case "n_cV":
            return [[t.c * VmL, ML], [t.c / VL, "Du har divideret. n = c · V."], [VL / t.c, "Du har divideret. n = c · V."],
                    [t.c / VmL, "Du har divideret. n = c · V."], [VmL / t.c, "Du har divideret. n = c · V."],
                    [t.c, "Det er koncentrationen. Gang den med rumfanget i liter."]];
        case "V":
            return [[t.c / t.n, "Brøken er vendt om. V = n / c."], [t.n * t.c, "Du har ganget. V = n / c."]];
        case "M":
            var glemt = [], g0 = Object.keys(st.antal);
            var TAEL = "Tæl atomerne. Tallet efter et grundstof gælder det grundstof: " + D.molarLed(st) + ".";
            g0.forEach(function (g) {
                if (st.antal[g] > 1) glemt.push([(st.M - D.ATOMMASSE[g] * (st.antal[g] - 1)) / 100, TAEL]);
            });
            glemt.push([g0.reduce(function (s, g) { return s + D.ATOMMASSE[g]; }, 0) / 100, TAEL]);
            return glemt;
        case "n_mM":
            return [[t.m * st.Mv, "Du har ganget. n = m / M."], [st.Mv / t.m, "Brøken er vendt om. n = m / M."],
                    [t.m, "Det er massen. Del den med molarmassen."]];
        case "m":
            return [[f.n / st.Mv, "Du har divideret. m = n · M."], [st.Mv / f.n, "Du har divideret. m = n · M."],
                    [t.c * st.Mv, "Det er c · M. Brug stofmængden n."], [f.n * 1000 * st.Mv, "Tjek stofmængden. Rumfanget skal være i liter."]];
        case "n1":
            return [[f.c1 * t.V1, "Rumfanget skal være i liter: " + K.mL(t.V1) + " mL = " + K.L(t.V1) + " L."],
                    [f.c1 / (t.V1 / 1000), "Du har divideret. n = c_før · V_før."], [(t.V1 / 1000) / f.c1, "Du har divideret. n = c_før · V_før."],
                    [t.V2 !== undefined ? f.c1 * t.V2 / 1000 : NaN, "V_efter er rumfanget efter. Stoffet kommer fra V_før."]];
        case "c2":
            return [[f.n1 / t.V2, "Rumfanget skal være i liter: " + K.mL(t.V2) + " mL = " + K.L(t.V2) + " L."],
                    [f.n1 / (t.V1 / 1000), "V_før er pipettens rumfang. Stoffet fordeles i kolbens rumfang V_efter."],
                    [f.c1, "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."],
                    [f.c1 * t.V2 / t.V1, "Forholdet er vendt om. Koncentrationen bliver mindre, når der kommer vand til."],
                    [(t.V2 / 1000) / f.n1, "Brøken er vendt om. c_efter = n / V_efter."]];
        case "n2":
            return [[t.c2 * t.V2, "Rumfanget skal være i liter: " + K.mL(t.V2) + " mL = " + K.L(t.V2) + " L."],
                    [t.c2 / (t.V2 / 1000), "Du har divideret. n = c_efter · V_efter."],
                    [(t.V2 / 1000) / t.c2, "Du har divideret. n = c_efter · V_efter."]];
        case "V1":
            return [[f.c1 / f.n2, "Brøken er vendt om. V_før = n / c_før."], [t.V2 / 1000, "Det er kolbens rumfang. Pipetten tager kun en del."],
                    [f.n2 / t.c2, "Brug flaskens koncentration c_før. Stoffet skal komme derfra."]];
        case "V2":
            return [[t.c2 / f.n1, "Brøken er vendt om. V_efter = n / c_efter."],
                    [f.n1 / f.c1, "Brug c_efter, den koncentration, du skal ende med."],
                    [f.vand / 1000, "Det er vandet. Her skal du finde hele rumfanget efter."]];
        case "vand":
            return [[f.V2 / 1000, "Det er hele rumfanget efter. Der er allerede " + K.mL(t.V1) + " mL i glasset."],
                    [(f.V2 + t.V1) / 1000, "Der skal trækkes fra: V_efter − V_før."]];
        case "c2f":
            return [[f.c1 * t.V2 / t.V1, "Forholdet er vendt om. Kolbens rumfang V_efter står under brøkstregen."],
                    [f.c1 * t.V1, "Del med V_efter."], [f.c1 * t.V1 / 1000, "Det er stofmængden. Del med V_efter i liter."],
                    [f.c1, "Det er koncentrationen i flasken. Efter fortyndingen er den mindre."]];
        }
        return [];
    }
    T.kandidater = kandidater;

    var RES_NAVN = { c: "koncentrationen", n: "stofmængden", V: "rumfanget", m: "massen", M: "molarmassen" };

    T.trin = function (id, raa, o) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv resultatet med enhed." };
        var s = T.svar(raa);
        if (!s) return { besked: "Skriv resultatet som et tal med enhed." };
        var R = resultat(id, o);
        var passer = function (v) { return R.absTol ? Math.abs(v - R.facit) <= R.absTol : naer(v, R.facit); };
        if (s.slags === R.slags && passer(s.base)) return { ok: true };
        var talPasser = passer(s.v) || (R.slags === "V" && passer(s.v / 1000));
        if (talPasser) {
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed === "lilleM") return { besked: "Tallet er rigtigt. Skriv M med stort. Lille m er massen.", talOk: true };
            if (R.slags === "V" && s.slags === "V") {
                var mL = R.facit * 1000;
                return { besked: "Tjek enheden: det er " + K.L(mL) + " L, og det er " + K.mL(mL) + " mL.", talOk: true };
            }
            return { besked: "Tallet er rigtigt, men " + RES_NAVN[R.slags] + " måles i " + ENHED_NAVN[R.slags] + ", ikke i " + s.raaEnhed +
                ". Enhederne: " + ENHEDSREGNING[id] + ".", talOk: true };
        }
        var fejl = kandidater(id, o);
        for (var i = 0; i < fejl.length; i++) {
            var fv = fejl[i][0];
            if (isFinite(fv) && fv > 0 && (naer(s.base, fv) || naer(s.v, fv))) return { besked: fejl[i][1] };
        }
        if (s.slags && s.slags !== R.slags) {
            return { besked: stort(RES_NAVN[R.slags]) + " måles i " + ENHED_NAVN[R.slags] + ". " + s.raaEnhed + " er enheden for " +
                RES_NAVN[s.slags] + ". Enhederne: " + ENHEDSREGNING[id] + "." };
        }
        if (kommaFlyttet(s.base, R.facit)) return { besked: "Tjek kommaet. Tallet er " + (s.base > R.facit ? "for stort." : "for lille.") };
        if (R.absTol ? Math.abs(s.base - R.facit) <= 1 : naer(s.base, R.facit, 0.04)) {
            return { besked: id === "M" ? "Tæt på. Brug atommasserne med to decimaler, fx O = 16,00." : "Tæt på. Regn med alle cifrene." };
        }
        return { besked: "Det passer ikke. Tryk på Giv hint, hvis du sidder fast." };
    };

    /* ----- Den paene beregning ------------------------------------------------------------ */
    function venstre(id, o) {
        var st = o.stof ? "(" + D.stof(o.stof).formel + ")" : "";
        var v = D.TRIN[id].venstre;
        if (o.fane === 3 && id !== "V") return v + st;
        return v;
    }
    T.venstre = venstre;

    /* Et bogstav som HTML: kursiv med før, efter eller vand i saenket skrift */
    T.symHTML = function (sym) {
        var m = String(sym).match(/^([A-Za-z])_(.+)$/);
        return m ? "<i>" + m[1] + "</i><sub>" + m[2] + "</sub>" : "<i>" + NK.html(sym) + "</i>";
    };

    function broekHTML(a, b) { return '<span class="broek"><span>' + a + "</span><span>" + b + "</span></span>"; }
    T.broekHTML = broekHTML;

    /* Formlens hoejre side som HTML med en rigtig broekstreg */
    T.formelHTML = function (id) {
        var t = D.TRIN[id], l = t.led.map(T.symHTML);
        if (t.op === "/") return broekHTML(l[0], l[1]);
        if (t.op === "*") return l[0] + " · " + l[1];
        if (t.op === "-") return l[0] + " − " + l[1];
        if (t.op === "*/") return broekHTML(l[0] + " · " + l[1], l[2]);
        return "";
    };

    /* Formlen som tekst: "c(NaCl) = n / V" */
    T.formelTekst = function (id, o) {
        var t = D.TRIN[id], l = t.led;
        var h = t.op === "/" ? l[0] + " / " + l[1] : t.op === "*" ? l[0] + " · " + l[1] : t.op === "-" ? l[0] + " − " + l[1] :
            t.op === "*/" ? l[0] + " · " + l[1] + " / " + l[2] : "";
        return venstre(id, o) + (h ? " = " + h : "");
    };

    /* tekster: tallene med enhed, som de staar i felterne (null: ikke endnu) */
    T.indsaetHTML = function (id, tekster) {
        var op = D.TRIN[id].op;
        var x = [0, 1, 2].map(function (i) { return tekster && tekster[i] ? NK.html(tekster[i]) : "?"; });
        if (op === "/") return broekHTML(x[0], x[1]);
        if (op === "*") return x[0] + " · " + x[1];
        if (op === "-") return x[0] + " − " + x[1];
        return broekHTML(x[0] + " · " + x[1], x[2]);
    };

    /* Facit med enhed, som det staar, naar trinnet er loest */
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

    /* Resultatet i den paene beregning: V_før regnes i L og skrives om til mL */
    T.resultatTekst = function (id, o) {
        if (id === "V1") return K.L(o.facit.V1) + " L = " + K.mL(o.facit.V1) + " mL";
        return T.facitTekst(id, o);
    };

    /* Standardteksterne i mellemregningen (i formlens raekkefoelge) */
    T.ledTekster = function (id, o) { return T.led(id, o).map(function (l) { return l.tekst; }); };

    /* Hele beregningen som HTML (til Vis svaret og Kemichaels boble) */
    T.regningHTML = function (id, o, tekster) {
        var v = NK.sub(venstre(id, o)) + " = ";
        if (!D.TRIN[id].op) return v + NK.html(D.molarLed(D.stof(o.stof))) + " = <b>" + NK.html(T.facitTekst(id, o)) + "</b>";
        var tk = tekster && tekster.filter(Boolean).length === T.ANTAL_FELTER[D.TRIN[id].op] ? tekster : T.ledTekster(id, o);
        return v + T.formelHTML(id) + " = " + T.indsaetHTML(id, tk) + " = <b>" + NK.html(T.resultatTekst(id, o)) + "</b>";
    };

    /* Hele beregningen som tekst (til selvtesten og README) */
    T.regning = function (id, o) {
        var tk = T.ledTekster(id, o), op = D.TRIN[id].op;
        if (!op) return [venstre(id, o) + " = " + D.molarLed(D.stof(o.stof)), "= " + T.facitTekst(id, o)];
        var m = op === "/" ? tk[0] + " / " + tk[1] : op === "*" ? tk[0] + " · " + tk[1] : op === "-" ? tk[0] + " − " + tk[1] :
            tk[0] + " · " + tk[1] + " / " + tk[2];
        return [T.formelTekst(id, o), "= " + m + " = " + T.resultatTekst(id, o)];
    };

    /* Delene til tavlen: { t, matte, farve, fed } for tekst og
       { top, bund, matte } for en broek. v: { formel, led (tekster eller
       null), resultat, farve }. split: der, hvor regnestykket deles, hvis
       det skal paa to linjer. */
    T.regnDele = function (id, o, v) {
        var t = D.TRIN[id], l = t.led, dele = [{ t: venstre(id, o) + " = " }];
        if (!t.op) {
            dele.push({ t: D.molarLed(D.stof(o.stof)) });
            dele.split = dele.length;
            dele.push({ t: " = " });
            dele.push(v.resultat ? { t: T.facitTekst(id, o), farve: v.farve, fed: true } : { t: "?" });
            return dele;
        }
        if (!v.formel) { dele.push({ t: "?" }); return dele; }
        if (t.op === "/") dele.push({ top: l[0], bund: l[1], matte: true });
        else if (t.op === "*/") dele.push({ top: l[0] + " · " + l[1], bund: l[2], matte: true });
        else dele.push({ t: l[0], matte: true }, { t: t.op === "*" ? " · " : " − " }, { t: l[1], matte: true });
        dele.split = dele.length;
        dele.push({ t: " = " });
        var x = v.led || [];
        if (!x[0] && !x[1] && !x[2]) { dele.push({ t: "?" }); return dele; }
        var a = x[0] || "?", b = x[1] || "?", c = x[2] || "?";
        if (t.op === "/") dele.push({ top: a, bund: b });
        else if (t.op === "*/") dele.push({ top: a + " · " + b, bund: c });
        else dele.push({ t: a + (t.op === "*" ? " · " : " − ") + b });
        dele.push({ t: " = " });
        dele.push(v.resultat ? { t: T.resultatTekst(id, o), farve: v.farve, fed: true } : { t: "?" });
        return dele;
    };

    T.regnDeleSplit = function (dele) {
        if (!dele.split) return [dele, []];
        return [dele.slice(0, dele.split), [{ t: "= " }].concat(dele.slice(dele.split + 1))];
    };

    /* ----- Hintene ------------------------------------------------------------------------
       Rettet mod det felt, eleven er ved, og med halvdelen af svaret */
    var POS_HINT = {
        "/": ["Over brøkstregen står", "Under brøkstregen står"],
        "*": ["Det ene tal er", "Det andet tal er"],
        "-": ["Først står", "Så trækkes"],
        "*/": ["Over brøkstregen står først", "Over brøkstregen står også", "Under brøkstregen står"]
    };

    T.ledHint = function (id, o, j) {
        var t = D.TRIN[id], L = T.led(id, o)[j];
        var navn = D.NAVN[L.sym] + " " + L.sym;
        if (t.op === "-" && j === 1) return "Så trækkes " + navn + " fra: " + L.tekst + ".";
        var hvad = POS_HINT[t.op][j];
        if (L.slags === "V" && t.rumfang === "L") return hvad + " " + navn + " i liter: " + K.mL(L.mL) + " mL = " + K.L(L.mL) + " L.";
        return hvad + " " + navn + ": " + L.tekst + ".";
    };

    T.talHint = function (id, o) {
        var t = D.TRIN[id];
        if (!t.op) return "Slå atommasserne op, og læg dem sammen: " + D.molarLed(D.stof(o.stof)) + ". Enheden er g/mol.";
        var hvad = t.op === "/" || t.op === "*/" ? "brøken" : t.op === "*" ? "gangestykket" : "forskellen";
        var ekstra = id === "V1" ? " Svaret kommer i L. Du må gerne skrive det om til mL." : "";
        return "Regn " + hvad + " ud på lommeregneren, og skriv resultatet med enhed. Enhederne: " + ENHEDSREGNING[id] + "." + ekstra;
    };

    NK.Tjek = T;
}());

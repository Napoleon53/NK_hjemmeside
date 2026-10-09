/* =====================================================================
   tjek.js - regnetrinene paa fane 2: afstemningen, formlen,
   mellemregningen, tallet og den paene beregning

   Formlen tjekkes ved at regne den ud. Hver stoerrelse faar et fast
   proevetal, hvor alle sammenhaengene passer (n = m / M, n(produkt) =
   n(NaHCO₃) · forholdet og m = n · M). Saa er "n(NaHCO₃)/2",
   "0,5 · n(NaHCO₃)" og "1/2 n" det samme, og en omskrevet formel er
   ogsaa rigtig. De typiske fejl genkendes paa deres vaerdi og faar
   deres egen besked (som sc4.11).

   Stoerrelserne har et bogstav internt:
     a m(NaHCO₃)   b M(NaHCO₃)   c n(NaHCO₃)
     d n(produkt)  e M(produkt)  f m(produkt)

   Et tal er rigtigt, naar det hoejst er 1 % fra facit, og enheden skal
   skrives med i resultatet. Svarene er { ok, besked, note, tom }.
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

    /* Produktets formel i en hypotese: "Na₂O" */
    T.P = function (hyp) { return hyp ? D.STOF[D.HYP[hyp].produkt].formel : ""; };
    T.forhold = function (hyp) { var h = D.HYP[hyp]; return h.koef[1] / h.koef[0]; };

    /* {P} i en tekst bliver produktets formel */
    function fyldP(s, hyp) { return String(s).replace(/\{P\}/g, T.P(hyp)); }
    T.fyldP = fyldP;

    /* ----- Tallet med enheden (som sc4.3) ------------------------------------------
       "3,24 g", "3,24", "6,12·10^-2 mol", "0,0612 mol" */
    function normEnhed(raa) {
        var s = NK.ascii(String(raa || "")).toLowerCase().replace(/\s+/g, "").replace(/[·×∙•⋅*]/g, "");
        s = s.replace(/^gram/, "g").replace(/^mole?s?/, "mol").replace(/\/mole?s?$/, "/mol");
        if (/^g(mol\^?-1|\/mol)$/.test(s)) return "g/mol";
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

    /* Kun et tal (skemaet paa fane 1): "3,24", "3.24", "3,24 g" */
    T.tal = function (raa) {
        var s = T.svar(raa);
        if (!s || (s.enhed && s.enhed !== "g")) return null;
        return { v: s.v };
    };

    /* ----- Afstemningen -------------------------------------------------------------
       raa: det, der staar i felterne, fra venstre. Giver { ok, besked,
       tom, felt (det felt, beskeden handler om) }. */
    function atomer(hyp, koef) {
        var h = D.HYP[hyp], v = {}, hj = {};
        D.GRUNDSTOFFER.forEach(function (x) { v[x] = 0; hj[x] = 0; });
        h.stoffer.forEach(function (id, i) {
            var a = D.STOF[id].atomer, side = i === 0 ? v : hj;
            Object.keys(a).forEach(function (x) { side[x] += a[x] * koef[i]; });
        });
        return { v: v, h: hj };
    }
    T.atomer = atomer;

    T.afstem = function (hyp, raa) {
        var tal = [], i;
        for (i = 0; i < raa.length; i++) {
            var s = String(raa[i] || "").trim();
            if (!s) return { tom: true, besked: D.AFSTEM.tom, felt: i };
            if (!/^\d+$/.test(s)) return { besked: "Skriv hele tal foran stofferne.", felt: i };
            var n = parseInt(s, 10);
            if (n < 1) return { besked: D.AFSTEM.nul, felt: i };
            tal.push(n);
        }
        var a = atomer(hyp, tal);
        for (i = 0; i < D.GRUNDSTOFFER.length; i++) {
            var x = D.GRUNDSTOFFER[i];
            if (a.v[x] !== a.h[x]) {
                return { besked: "Der er " + a.v[x] + " " + x + " til venstre og " + a.h[x] + " til højre." };
            }
        }
        var g = tal.reduce(function (s, n) { return NK.gcd(s, n); }, 0);
        if (g > 1) return { besked: D.AFSTEM.forkort };
        return { ok: true };
    };

    /* Taellingen paa tavlen: kun de grundstoffer, hvor alle felter, der
       har dem, er udfyldt (ellers null), saa et tomt skema ikke ser
       afstemt ud */
    T.taelling = function (hyp, raa) {
        var h = D.HYP[hyp], ud = {};
        var tal = raa.map(function (s) { s = String(s || "").trim(); return /^\d+$/.test(s) ? parseInt(s, 10) : null; });
        D.GRUNDSTOFFER.forEach(function (x) {
            var v = 0, hj = 0, mangler = false;
            h.stoffer.forEach(function (id, i) {
                var n = D.STOF[id].atomer[x] || 0;
                if (!n) return;
                if (tal[i] === null) { mangler = true; return; }
                if (i === 0) v += n * tal[i]; else hj += n * tal[i];
            });
            ud[x] = mangler ? null : { v: v, h: hj };
        });
        return ud;
    };

    /* ----- Formlen: fra tekst til noget, der kan regnes ud ------------------------------
       Et m, n eller M med en etiket efter sig bliver til sit bogstav.
       Etiketten kan staa i parentes, efter en bundstreg eller lige efter
       bogstavet: n(NaHCO3), n_natron, nNaHCO₃, m(Na2CO3), m(produkt). */
    var SYMBOL = {
        m: { nat: "a", prod: "f" },
        M: { nat: "b", prod: "e" },
        n: { nat: "c", prod: "d" }
    };
    var ART = { a: "m", b: "M", c: "n", d: "n", e: "M", f: "m" };
    T.ART = ART;

    var PRODUKT_ORD = {
        Na2O: /^(na2o|natriumoxid|dinatriumoxid)$/,
        Na2CO3: /^(na2co3|natriumcarbonat|soda|dinatriumcarbonat)$/,
        NaOH: /^(naoh|natriumhydroxid)$/
    };

    /* Etiketten: "nat", "prod", { andet: stof } eller null (ukendt) */
    function klasse(label, hyp) {
        var l = NK.ascii(String(label)).toLowerCase().replace(/[,.\s]/g, "");
        if (/^(nahco3|natron|natronen|natriumhydrogencarbonat|natriumbicarbonat|bagepulver|før|foer|for|start|1)$/.test(l)) return "nat";
        if (/^(produkt|produktet|rest|resten|slut|efter|tilbage|fast|faststof|2)$/.test(l)) return "prod";
        var mit = D.HYP[hyp] ? D.HYP[hyp].produkt : null;
        for (var id in PRODUKT_ORD) {
            if (!Object.prototype.hasOwnProperty.call(PRODUKT_ORD, id)) continue;
            if (PRODUKT_ORD[id].test(l)) return id === mit ? "prod" : { andet: id };
        }
        return null;
    }

    function forbered(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/[−–]/g, "-").replace(/[÷:]/g, "/").replace(/½/g, "(1/2)");
        s = s.replace(/[_{}]/g, "");
        return s;
    }

    var BOGSTAV = /[A-Za-zÆØÅæøå0-9]/;

    /* Tokens: { t: "s", v: bogstav } (a-f, eller "?m", "?n", "?M" uden
       etiket), { t: "t", v: tal }, + - * / ( ). Giver { fejl } eller { tk }. */
    function scan(s, hyp) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (ch === "m" || ch === "n" || ch === "M") {
                var j = i + 1, label = null;
                if (s[j] === "(") {
                    var k = s.indexOf(")", j);
                    if (k < 0) return { fejl: "Der mangler en slutparentes." };
                    var ind = s.slice(j + 1, k);
                    if (/[A-Za-zÆØÅæøå]/.test(ind) && klasse(ind, hyp) !== null) { label = ind; j = k + 1; }
                    else if (/[A-Za-zÆØÅæøå]/.test(ind) && !/[+\-*\/]/.test(ind)) {
                        return { fejl: "Her regnes der kun på NaHCO₃" + (hyp ? " og " + T.P(hyp) : "") + ", ikke på " + ind + "." };
                    }
                } else {
                    var r = j;
                    while (r < s.length && BOGSTAV.test(s[r])) r++;
                    var kand = s.slice(j, r);
                    if (kand && klasse(kand, hyp) !== null) { label = kand; j = r; }
                    else if (kand && /[A-Za-zÆØÅæøå]/.test(kand)) return null;
                }
                if (label === null) ud.push({ t: "s", v: "?" + ch });
                else {
                    var kl = klasse(label, hyp);
                    if (typeof kl === "object") {
                        return { fejl: (hyp ? "I hypotese " + hyp + " er produktet " + T.P(hyp) + ", ikke " + D.STOF[kl.andet].formel + "." :
                            "Her er stoffet natron, NaHCO₃.") };
                    }
                    if (kl === "prod" && !hyp) return { fejl: "Her er stoffet natron, NaHCO₃. Der er intet produkt endnu." };
                    ud.push({ t: "s", v: SYMBOL[ch][kl] });
                }
                i = j;
            } else if (/[0-9]/.test(ch)) {
                var q = i;
                while (q < s.length && /[0-9.,]/.test(s[q])) q++;
                ud.push({ t: "t", v: parseFloat(s.slice(i, q).replace(",", ".")) });
                i = q;
            } else if ("+-*/()".indexOf(ch) >= 0) {
                ud.push({ t: ch }); i++;
            } else {
                return null;
            }
        }
        return { tk: ud };
    }

    /* De interne formler i reglerne: a-f, tal og regnetegn */
    function scanIntern(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (/[a-f]/.test(ch)) { ud.push({ t: "s", v: ch }); i++; }
            else if (/[0-9]/.test(ch)) {
                var q = i;
                while (q < s.length && /[0-9.]/.test(s[q])) q++;
                ud.push({ t: "t", v: parseFloat(s.slice(i, q)) });
                i = q;
            } else { ud.push({ t: ch }); i++; }
        }
        return ud;
    }

    /* Et lille udtryk med underforstaaet gangetegn (som sc4.11) */
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

    function tallene(n, ud) {
        ud = ud || [];
        if (n.tal !== undefined) ud.push(n.tal);
        if (n.a) tallene(n.a, ud);
        if (n.b) tallene(n.b, ud);
        return ud;
    }

    /* Et bogstav uden etiket faar trinnets betydning (alias), ellers giver
       det en besked om, hvilken stoerrelse der menes */
    function oversaet(n, alias, hyp) {
        if (n.s !== undefined) {
            if (n.s.charAt(0) !== "?") return n;
            var a = alias && alias[n.s];
            if (!a) {
                var P = hyp ? T.P(hyp) : "";
                var art = n.s.slice(1);
                throw { besked: "Skriv, hvilken " + (art === "m" ? "masse" : art === "n" ? "stofmængde" : "molarmasse") + " du mener: " +
                    art + "(NaHCO₃)" + (P ? " eller " + art + "(" + P + ")" : "") + "." };
            }
            return { s: a };
        }
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
        if (n.a) ud.a = oversaet(n.a, alias, hyp);
        if (n.b) ud.b = oversaet(n.b, alias, hyp);
        return ud;
    }

    /* Proevetallene: alle sammenhaenge passer, og ingen to udtryk, der
       ikke er det samme, giver det samme tal. r er forholdet. */
    function proevetal(r) {
        var u = { a: 4.913, b: 83.3, e: 57.7 };
        u.c = u.a / u.b;
        u.d = u.c * r;
        u.f = u.d * u.e;
        return u;
    }

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: m, n og M uden etiket, og hvad de betyder her.
       fejl: typiske formler (internt) og beskeden til dem. */
    function regler(id, hyp) {
        var P = T.P(hyp), r = hyp ? T.forhold(hyp) : 1;
        if (id === "n_nat") {
            return { maal: "c", kendt: ["a", "b"], alias: { "?m": "a", "?M": "b", "?n": "c" }, r: 1,
                     fejl: [["b/a", "Brøken er vendt om. Massen står øverst."],
                            ["a*b", "Stofmængden er massen divideret med molarmassen, ikke ganget."]] };
        }
        if (id === "n_p") {
            var EN = "Der står 1 foran både NaHCO₃ og " + P + " i skemaet. Forholdet er 1 : 1.";
            var fejl = r === 1 ?
                [["c/2", EN], ["2*c", EN], ["a", "Det er en masse. Forholdet i skemaet gælder stofmængder."]] :
                [["2*c", "Omvendt. Der skal 2 NaHCO₃ til 1 " + P + ", så der bliver halvt så mange mol " + P + "."],
                 ["c", "Forholdet er ikke 1 : 1. Se tallene foran NaHCO₃ og " + P + " i skemaet."],
                 ["a/2", "Forholdet gælder stofmængder, ikke masser. Brug n(NaHCO₃)."]];
            return { maal: "d", kendt: ["a", "b", "c", "e"], alias: {}, r: r, fejl: fejl };
        }
        /* m_p */
        var f2 = [["d/e", "Massen er stofmængde gange molarmasse, ikke divideret."],
                  ["e/d", "Massen er stofmængde gange molarmasse, ikke divideret."],
                  ["d*b", "Brug molarmassen for " + P + ", ikke for natron."]];
        if (r !== 1) f2.push(["c*e", "Brug stofmængden af " + P + ", ikke af natron."]);
        return { maal: "f", kendt: ["a", "b", "c", "d", "e"], alias: { "?n": "d", "?M": "e" }, r: r, fejl: f2 };
    }
    T.regler = regler;

    /* Navnet paa en stoerrelse i en saetning */
    function vis(b, hyp) {
        var P = T.P(hyp);
        return { a: "m(NaHCO₃)", b: "M(NaHCO₃)", c: "n(NaHCO₃)", d: "n(" + P + ")", e: "M(" + P + ")", f: "m(" + P + ")" }[b];
    }

    /* Giver { ok, note, besked, tom } */
    T.formel = function (id, raa, hyp) {
        var r = regler(id, hyp);
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = forbered(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug fx n(NaHCO₃), m(NaHCO₃) og M(" + (hyp ? T.P(hyp) : "NaHCO₃") + ")." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        try {
            for (var i = 0; i < dele.length; i++) {
                var sc = scan(dele[i], hyp);
                if (sc && sc.fejl) return { besked: sc.fejl };
                var p = sc && sc.tk.length ? parse(sc.tk) : null;
                if (!p) {
                    if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med symboler først. Tallene kommer bagefter." };
                    return kanIkke;
                }
                /* Et m, n eller M alene til venstre er det, trinnet finder */
                if (i === 0 && dele.length > 1 && p.s && p.s.charAt(0) === "?" && p.s.slice(1) === ART[r.maal]) p = { s: r.maal };
                led.push(oversaet(p, r.alias, hyp));
            }
        } catch (x) {
            return { besked: x.besked || kanIkke.besked };
        }

        var alle = {};
        led.forEach(function (q) { bogstaver(q, alle); });
        if (led.every(function (q) { return !Object.keys(bogstaver(q)).length; })) {
            return { besked: "Skriv formlen med symboler først. Tallene kommer bagefter." };
        }
        /* En molarmasse eller en masse skrevet som tal: den skal staa som symbol */
        var tal = [];
        led.forEach(function (q) { tallene(q, tal); });
        var molTal = tal.filter(function (v) { return v > 3; });
        if (molTal.length) return { besked: "Skriv størrelserne som symboler, fx M(NaHCO₃). Tallene kommer bagefter." };

        var U = proevetal(r.r);
        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });
        var ukendt = ukendte.length ? vis(ukendte[0], hyp) + " kender du ikke endnu. Brug det, du kender." : "";
        var hoejre = led[led.length - 1];
        var mv = U[r.maal];

        if (led.length === 1) {
            var v = regn(hoejre, U);
            if (!ukendt && naer(v, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, v, ukendt, U);
        }
        var venstre = led[0];
        var vV = regn(venstre, U), vH = regn(hoejre, U);
        if (venstre.s === r.maal) {
            if (bogstaver(hoejre)[r.maal]) return { besked: vis(r.maal, hyp) + " skal stå alene på venstre side." };
            if (!ukendt && naer(vH, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, vH, ukendt, U);
        }
        if (naer(vV, vH, 1e-6)) {
            if (!alle[r.maal]) return { besked: "Den sammenhæng er rigtig, men den giver ikke " + vis(r.maal, hyp) + "." };
            if (ukendt) return { besked: ukendt };
            return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        if (venstre.s !== undefined && venstre.s !== r.maal) {
            return { besked: "Her skal du finde " + vis(r.maal, hyp) + ". Skriv " + vis(r.maal, hyp) + " = …" };
        }
        return fejlBesked(r, vH, "", U);
    };

    function fejlBesked(r, v, ukendt, U) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = parse(scanIntern(r.fejl[i][0]));
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Tallet ------------------------------------------------------------------
       o: opgaven med tal ({ mf }), hyp og facit. Hvert trin har facit og
       en liste af typiske fejl, regnet ud af opgavens egne tal. */
    function kandidater(id, o) {
        var f = o.facit, mf = o.tal.mf, Mn = D.STOF.NaHCO3.Mv;
        if (id === "n_nat") {
            return { facit: f.n_nat, enhed: "mol", fejl: [
                [mf * Mn, "Du har ganget. Del massen med molarmassen."],
                [Mn / mf, "Brøken er vendt om. Massen står øverst."],
                [mf, "Det er massen. Del den med molarmassen."]] };
        }
        var P = T.P(o.hyp), n0 = K.r3(f.n_nat), Mp = D.STOF[D.HYP[o.hyp].produkt].Mv;
        if (id === "n_p") {
            var EN = "Forholdet er 1 : 1. Der bliver lige så mange mol " + P + " som mol natron.";
            return { facit: f.n_p, enhed: "mol", fejl: f.forhold === 1 ?
                [[n0 / 2, EN], [2 * n0, EN]] :
                [[2 * n0, "Omvendt. 2 NaHCO₃ giver 1 " + P + ", så der bliver halvt så mange mol."],
                 [n0, "Forholdet er 2 : 1. Del stofmængden af natron med 2."]] };
        }
        var n = K.r3(f.n_p);
        var liste = [
            [n / Mp, "Du har divideret. Gang stofmængden med molarmassen."],
            [Mp / n, "Du har divideret. Gang stofmængden med molarmassen."],
            [n * Mn, "Brug molarmassen for " + P + ", ikke for natron."],
            [Mp, "Det er massen af 1 mol. Gang med stofmængden."]];
        if (f.forhold !== 1) liste.push([n0 * Mp, "Brug stofmængden af " + P + ", ikke af natron."]);
        return { facit: f.m_p, enhed: "g", fejl: liste };
    }
    T.kandidater = kandidater;

    function kommaFlyttet(v, facit) {
        for (var k = 1; k <= 4; k++) {
            var f = Math.pow(10, k);
            if (naer(v, facit * f) || naer(v, facit / f)) return true;
        }
        return false;
    }

    var ENHEDSREGNING = { n_nat: "g / (g/mol) = mol", n_p: "mol / 2 = mol", m_p: "mol · g/mol = g" };

    T.trin = function (id, raa, o) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet og enheden." };
        var s = T.svar(raa);
        var k = kandidater(id, o);
        if (!s) return { besked: "Skriv et tal og en enhed, fx 0,0500 " + k.enhed + "." };
        var v = s.v;
        if (naer(v, k.facit)) {
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed !== k.enhed) {
                return { besked: "Tallet er rigtigt, men " + s.raaEnhed + " er ikke enheden. Regn enhederne: " + ENHEDSREGNING[id] + ".", talOk: true };
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

    /* ----- Den paene beregning ------------------------------------------------------ */
    T.venstre = function (id, o) {
        if (id === "n_nat") return "n(NaHCO₃)";
        var P = T.P(o.hyp);
        return (id === "n_p" ? "n(" : "m(") + P + ")";
    };

    /* op for trinnet i denne opgave: "/" (broek), "*" eller null (ingen mellemregning) */
    T.op = function (id, o) {
        if (id === "n_nat") return "/";
        if (id === "n_p") return T.forhold(o.hyp) === 1 ? null : "/";
        return "*";
    };

    /* Formlens to led som tekst: symbolet og etiketten */
    T.formelLed = function (id, o) {
        var P = o && o.hyp ? T.P(o.hyp) : "";
        if (id === "n_nat") return ["m(NaHCO₃)", "M(NaHCO₃)"];
        if (id === "n_p") return T.op(id, o) ? ["n(NaHCO₃)", "2"] : ["n(NaHCO₃)"];
        return ["n(" + P + ")", "M(" + P + ")"];
    };

    T.formelTekst = function (id, o) {
        var l = T.formelLed(id, o), op = T.op(id, o);
        return T.venstre(id, o) + " = " + (op === "/" ? l[0] + " / " + l[1] : op === "*" ? l[0] + " · " + l[1] : l[0]);
    };

    T.facitTekst = function (id, o) {
        var f = o.facit;
        if (id === "n_nat") return K.mol(f.n_nat) + " mol";
        if (id === "n_p") return K.mol(f.n_p) + " mol";
        return K.g(f.m_p) + " g";
    };

    /* ----- Mellemregningen ------------------------------------------------------------
       T.led giver de to led i formlens raekkefoelge:
       { sym, navn, v, enhed, tekst (med enhed), tal (uden) }. */
    T.led = function (id, o) {
        var f = o.facit, ud;
        if (id === "n_nat") {
            ud = [{ sym: "m", navn: "massen af natron", v: o.tal.mf, enhed: "g", tal: K.g2(o.tal.mf) },
                  { sym: "M", navn: "molarmassen af natron", v: D.STOF.NaHCO3.Mv, enhed: "g/mol", tal: K.Mtekst("NaHCO3") }];
        } else if (id === "n_p") {
            ud = [{ sym: "n", navn: "stofmængden af natron", v: K.r3(f.n_nat), enhed: "mol", tal: K.mol(f.n_nat) },
                  { sym: "", navn: "tallet foran NaHCO₃", v: 2, enhed: "", tal: "2" }];
        } else {
            var Pid = D.HYP[o.hyp].produkt, P = T.P(o.hyp);
            ud = [{ sym: "n", navn: "stofmængden af " + P, v: K.r3(f.n_p), enhed: "mol", tal: K.mol(f.n_p) },
                  { sym: "M", navn: "molarmassen af " + P, v: D.STOF[Pid].Mv, enhed: "g/mol", tal: K.Mtekst(Pid) }];
        }
        ud.forEach(function (l) { l.tekst = l.enhed ? l.tal + " " + l.enhed : l.tal; });
        return ud;
    };

    /* Et tal med enhed i et af mellemregningens felter (som sc4.3). i:
       feltet (0 er over broekstregen eller det foerste tal). ledige: de
       led, feltet maa vaere. Giver { ok, led } eller { besked, tom }. */
    T.tjekLed = function (id, o, i, raa, ledige) {
        var led = T.led(id, o), broek = T.op(id, o) === "/";
        var hvor = broek ? (i === 0 ? "over brøkstregen" : "under brøkstregen") : (i === 0 ? "i det første felt" : "i det andet felt");
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet og enheden " + hvor + "." };
        var s = T.svar(raa);
        if (!s) return { besked: "Skriv et tal og en enhed " + hvor + "." };
        if (/\d/.test(s.raaEnhed.replace(/\^?\s*[-−⁻]\s*[1¹]/g, ""))) {
            return { besked: broek ? "Skriv kun ét tal i hvert felt: det ene over brøkstregen, det andet under." : "Skriv kun ét tal i hvert felt." };
        }
        for (var k = 0; k < ledige.length; k++) {
            var L = led[ledige[k]];
            if (!naer(s.v, L.v, L.enhed ? TOL : 1e-9)) continue;
            if (!L.enhed) {
                if (s.enhed) return { besked: "2 er et rent tal fra skemaet. Det har ingen enhed.", talOk: true };
                return { ok: true, led: ledige[k] };
            }
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed !== L.enhed) return { besked: "Tallet er rigtigt, men " + L.navn + " måles i " + L.enhed + ".", talOk: true };
            return { ok: true, led: ledige[k] };
        }
        if (broek && naer(s.v, led[1 - i].v)) {
            return { besked: "Brøken er vendt om. " + stort(led[0].navn) + " står øverst, som i formlen." };
        }
        if (id === "m_p" && naer(s.v, D.STOF.NaHCO3.Mv)) return { besked: "Det er molarmassen af natron. Brug molarmassen af " + T.P(o.hyp) + "." };
        if (id === "m_p" && naer(s.v, K.r3(o.facit.n_nat)) && o.facit.forhold !== 1) {
            return { besked: "Det er stofmængden af natron. Brug stofmængden af " + T.P(o.hyp) + " fra trinnet før." };
        }
        var L0 = led[ledige[0]];
        if (ledige.length === 1 && L0.enhed && kommaFlyttet(s.v, L0.v)) return { besked: "Tjek kommaet. Tallet er for " + (s.v > L0.v ? "stort." : "lille.") };
        if (broek) return { besked: "Det tal passer ikke. " + stort(hvor) + " står " + led[i].navn + "." };
        return { besked: "Det tal passer ikke. De to tal er " + led[0].navn + " og " + led[1].navn + "." };
    };

    /* ----- Regnestykket med rigtige broekstreger ---------------------------------------
       Som HTML (i kortet) og som dele til tavlen. Et
       symbol som n(NaHCO₃) skrives med bogstavet i kursiv. */
    function broekHTML(a, b) { return '<span class="broek"><span>' + a + "</span><span>" + b + "</span></span>"; }
    function symHTML(s) {
        return /^[nmM]\(/.test(s) ? "<i>" + s.charAt(0) + "</i>" + NK.html(s.slice(1)) : NK.html(s);
    }
    T.symHTML = symHTML;

    T.formelHTML = function (id, o) {
        var l = T.formelLed(id, o), op = T.op(id, o);
        if (op === "/") return broekHTML(symHTML(l[0]), symHTML(l[1]));
        if (op === "*") return symHTML(l[0]) + " · " + symHTML(l[1]);
        return symHTML(l[0]);
    };

    T.indsaetHTML = function (id, o, tekster) {
        var op = T.op(id, o);
        var a = tekster && tekster[0] ? NK.html(tekster[0]) : "?", b = tekster && tekster[1] ? NK.html(tekster[1]) : "?";
        return op === "/" ? broekHTML(a, b) : a + " · " + b;
    };

    T.regningHTML = function (id, o, tekster) {
        var op = T.op(id, o);
        var ud = symHTML(T.venstre(id, o)) + " = " + T.formelHTML(id, o);
        if (op) {
            tekster = tekster && tekster[0] && tekster[1] ? tekster : T.led(id, o).map(function (l) { return l.tekst; });
            ud += " = " + T.indsaetHTML(id, o, tekster);
        }
        return ud + " = <b>" + NK.html(T.facitTekst(id, o)) + "</b>";
    };

    /* v: { formel, led (tekster eller null), resultat, farve }. Delene
       faar split: der, hvor regnestykket deles, hvis det skal paa to
       linjer. matte: bogstavet foran parentesen staar i kursiv. */
    T.regnDele = function (id, o, v) {
        var l = T.formelLed(id, o), op = T.op(id, o), dele = [{ t: T.venstre(id, o) + " = ", matte: true }];
        if (!v.formel) { dele.push({ t: "?" }); return dele; }
        if (op === "/") dele.push({ top: l[0], bund: l[1], matte: true });
        else if (op === "*") dele.push({ t: l[0], matte: true }, { t: " · " }, { t: l[1], matte: true });
        else dele.push({ t: l[0], matte: true });
        dele.split = dele.length;
        dele.push({ t: " = " });
        if (op) {
            if (!v.led || (!v.led[0] && !v.led[1])) { dele.push({ t: "?" }); return dele; }
            var a = v.led[0] || "?", b = v.led[1] || "?";
            if (op === "/") dele.push({ top: a, bund: b });
            else dele.push({ t: a + " · " + b });
            dele.push({ t: " = " });
        }
        dele.push(v.resultat ? { t: T.facitTekst(id, o), farve: v.farve, fed: true } : { t: "?" });
        return dele;
    };

    T.regnDeleSplit = function (dele) {
        if (!dele.split) return [dele, []];
        return [dele.slice(0, dele.split), [{ t: "= " }].concat(dele.slice(dele.split + 1))];
    };

    /* Hint-teksterne: {a}, {b}, {a0}, {b0} og {P} */
    T.fyldHint = function (skabelon, id, o) {
        if (skabelon && typeof skabelon === "object") skabelon = skabelon[T.forhold(o.hyp) === 1 ? "1" : "2"];
        var led = T.led(id, o);
        var l1 = led[1] || led[0];
        return fyldP(String(skabelon), o.hyp).replace("{a0}", led[0].tal).replace("{b0}", l1.tal)
            .replace("{a}", led[0].tekst).replace("{b}", l1.tekst);
    };

    NK.Tjek = T;
}());

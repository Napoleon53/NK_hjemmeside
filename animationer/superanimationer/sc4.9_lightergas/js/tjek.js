/* =====================================================================
   tjek.js - regnetrinene paa fane 2: formlen, tallet og den paene
   beregning (som sc4.11)

   Formlen tjekkes ved at regne den ud. Hver stoerrelse faar et fast
   proevetal, hvor alle sammenhaengene passer (m(gas) = m(før) − m(efter),
   n = V / Vₘ = p · V / (R · T) og M = m / n). Saa er "m(før) − m(efter)",
   "mfør-mefter" og "m1 - m2" det samme, og idealgasligningen er ogsaa
   rigtig. De typiske fejl genkendes paa deres vaerdi og faar deres egen
   besked.

   Stoerrelserne har et bogstav internt:
     a m(før)   b m(efter)   c m(gas)   v V   w Vₘ   e n(gas)   g M(gas)
     p tryk     r R          t T

   Et tal er rigtigt, naar det hoejst er 1 % fra facit. Svarene er
   { ok, besked, note, tom }.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemi;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet ---------------------------------------------
       "0,36", "0.36 g", "150 mL", "6,25·10^-3", "6,25e-3" og "57,6 g/mol" er tal. */
    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.tal = function (raa) {
        var s = String(raa || "");
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s).replace(/\s+/g, "");
        s = s.replace(/(g\/mol|mol|mL|ml|L|l|g)$/, "");
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

    /* ----- Formlen: fra tekst til noget, der kan regnes ud -----------------------------
       Et m, n, M eller V med en etiket efter sig bliver til sit bogstav.
       Etiketten kan staa i parentes, efter en bundstreg eller lige efter
       bogstavet: m(gas), m_før, mfør, m1, n(gas), Vm, Vₘ. */
    var ART = { a: "m", b: "m", c: "m", v: "V", w: "V", e: "n", g: "M", p: "p", r: "R", t: "T" };
    var VIS = { a: "m(før)", b: "m(efter)", c: "m(gas)", v: "V", w: "Vₘ", e: "n(gas)", g: "M(gas)",
                p: "p", r: "R", t: "T" };
    T.VIS = VIS;

    function klasse(label) {
        var l = String(label).toLowerCase().replace(/[,.\s]/g, "");
        l = l.replace(/lighteren|lighter|daasen|dåsen|daase|dåse|beholderen|beholder/g, "");
        if (l === "") return "tom";
        if (/^(før|foer|for|start|1|begyndelse)$/.test(l)) return "foer";
        if (/^(efter|slut|2|rest|tilbage)$/.test(l)) return "efter";
        if (/^(gas|gassen|butan|lightergas|alkan|alkanen|c4h10)$/.test(l)) return "gas";
        return null;
    }

    /* Teksten goeres klar: haevede og saenkede tegn bliver almindelige,
       gangetegn bliver *, og bundstreger og kroellede parenteser forsvinder */
    function forbered(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/[−–]/g, "-").replace(/[÷:]/g, "/");
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/molvolumen(et)?|molarvolumen(et)?/gi, "Vm");
        return s;
    }

    var BOGSTAV = /[A-Za-zÆØÅæøå0-9,]/;

    /* Tokens: { t: "s", v: bogstav } (eller "?m", "?n", "?M" for et m, n
       eller M uden etiket), { t: "t", v: tal }, + - * / ( ). */
    function scan(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (ch === "V" || ch === "v") {
                /* Vm er molvolumenet; V alene (eller V(gas)) er rumfanget */
                if (s[i + 1] === "m" && !/[a-zæøå]/i.test(s[i + 2] || "")) { ud.push({ t: "s", v: "w" }); i += 2; continue; }
                if (s[i + 1] === "(") {
                    var kv = s.indexOf(")", i + 1);
                    if (kv < 0) return { fejl: "Der mangler en slutparentes." };
                    var iv = s.slice(i + 2, kv).toLowerCase();
                    if (iv === "m") { ud.push({ t: "s", v: "w" }); i = kv + 1; continue; }
                    if (klasse(iv) === "gas" || klasse(iv) === "tom") { ud.push({ t: "s", v: "v" }); i = kv + 1; continue; }
                    return { fejl: "Skriv V for rumfanget og Vₘ for molvolumenet." };
                }
                var rv = i + 1;
                while (rv < s.length && /[a-zæøå]/i.test(s[rv])) rv++;
                var efter = s.slice(i + 1, rv).toLowerCase();
                if (efter && klasse(efter) === "gas") { ud.push({ t: "s", v: "v" }); i = rv; continue; }
                ud.push({ t: "s", v: "v" });
                i++;
            } else if (ch === "m" || ch === "n" || ch === "N" || ch === "M") {
                var art = ch === "M" ? "M" : ch.toLowerCase();
                var j = i + 1, label = null;
                if (s[j] === "(") {
                    var k = s.indexOf(")", j);
                    if (k < 0) return { fejl: "Der mangler en slutparentes." };
                    var ind = s.slice(j + 1, k);
                    if (klasse(ind) !== null) { label = ind; j = k + 1; }
                } else {
                    var r = j;
                    while (r < s.length && BOGSTAV.test(s[r])) r++;
                    var kand = s.slice(j, r);
                    if (kand && klasse(kand) !== null && klasse(kand) !== "tom") { label = kand; j = r; }
                }
                var kl = label === null ? "tom" : klasse(label);
                var sym = null;
                if (art === "m") sym = { foer: "a", efter: "b", gas: "c" }[kl] || null;
                else if (art === "n") sym = (kl === "gas") ? "e" : null;
                else sym = (kl === "gas") ? "g" : null;
                if (kl === "tom") ud.push({ t: "s", v: "?" + art });
                else if (!sym) return { fejl: art === "m" ? "Skriv m(før), m(efter) eller m(gas)." : "Skriv " + (art === "n" ? "n(gas)." : "M(gas).") };
                else ud.push({ t: "s", v: sym });
                i = j;
            } else if (ch === "p" || ch === "P") {
                ud.push({ t: "s", v: "p" }); i++;
            } else if (ch === "R") {
                ud.push({ t: "s", v: "r" }); i++;
            } else if (ch === "T") {
                ud.push({ t: "s", v: "t" }); i++;
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

    /* De interne formler i reglerne herunder: bogstaverne, tal og regnetegn */
    function scanIntern(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (/[abcvwegprt]/.test(ch)) { ud.push({ t: "s", v: ch }); i++; }
            else if (/[0-9]/.test(ch)) {
                var q = i;
                while (q < s.length && /[0-9.]/.test(s[q])) q++;
                ud.push({ t: "t", v: parseFloat(s.slice(i, q)) });
                i = q;
            } else { ud.push({ t: ch }); i++; }
        }
        return ud;
    }

    /* Et lille udtryk: sum af produkter, med underforstaaet gangetegn
       mellem to led, der staar ved siden af hinanden (som sc4.11) */
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
    function oversaet(n, alias) {
        if (n.s !== undefined) {
            if (n.s.charAt(0) !== "?") return n;
            var a = alias && alias[n.s];
            if (!a) throw { besked: n.s === "?m" ? "Skriv, hvilken masse du mener: m(gas), m(før) eller m(efter)." :
                n.s === "?n" ? "Skriv n(gas) for stofmængden." : "Skriv M(gas) for molarmassen." };
            return { s: a };
        }
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
        if (n.a) ud.a = oversaet(n.a, alias);
        if (n.b) ud.b = oversaet(n.b, alias);
        return ud;
    }

    /* Proevetallene. Alle sammenhaenge passer, ogsaa p · V / (R · T) =
       V / Vₘ, og ingen to udtryk, der ikke er det samme, giver det samme tal. */
    var U = (function () {
        var u = { a: 1.137, b: 0.6813, v: 0.1573, w: 24.87, p: 1.0132, r: 0.08314 };
        u.c = u.a - u.b;
        u.t = u.w * u.p / u.r;
        u.e = u.v / u.w;
        u.g = u.c / u.e;
        return u;
    }());

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: m, n og M uden etiket, og hvad de betyder her.
       fejl: typiske formler (internt) og beskeden til dem. */
    var MIDLER = "M(gas) kender du ikke endnu. Det er den, forsøget skal finde.";
    var F = {
        dm: { maal: "c", kendt: ["a", "b"], alias: {},
              fejl: [["b-a", "Omvendt. Den vejede mest før, så m(før) står først."],
                     ["a+b", "Den tabte masse. Træk m(efter) fra m(før)."]] },
        n: { maal: "e", kendt: ["a", "b", "c", "v", "w", "p", "r", "t"], alias: { "?n": "e", "?m": "c" },
             fejl: [["v*w", "Stofmængden er rumfanget divideret med molvolumenet, ikke ganget."],
                    ["w/v", "Brøken er vendt om. Rumfanget står øverst."],
                    ["r*t/(p*v)", "Brøken er vendt om. n = p · V / (R · T)."],
                    ["p*v*r*t", "Idealgasligningen er p · V = n · R · T. Del med R · T."]] },
        M: { maal: "g", kendt: ["a", "b", "c", "v", "w", "e", "p", "r", "t"], alias: { "?m": "c", "?n": "e", "?M": "g" },
             fejl: [["c*e", "Molarmassen er massen divideret med stofmængden, ikke ganget."],
                    ["e/c", "Brøken er vendt om. Massen står øverst."],
                    ["a/e", "Brug massen af gassen, ikke hele lighteren."]] }
    };
    T.REGLER = F;

    /* Giver { ok, note, besked, tom } */
    T.formel = function (id, raa) {
        var r = F[id];
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = forbered(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug fx m(før), m(gas), V, Vₘ, n(gas) og M(gas)." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        try {
            for (var i = 0; i < dele.length; i++) {
                var sc = scan(dele[i]);
                if (sc && sc.fejl) return { besked: sc.fejl };
                var p = sc && sc.tk.length ? parse(sc.tk) : null;
                if (!p) {
                    if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med symboler først. Tallene kommer i næste felt." };
                    return kanIkke;
                }
                /* Et m, n eller M alene til venstre er det, trinnet finder */
                if (i === 0 && dele.length > 1 && p.s && p.s.charAt(0) === "?" && p.s.slice(1) === ART[r.maal]) p = { s: r.maal };
                led.push(oversaet(p, r.alias));
            }
        } catch (x) {
            return { besked: x.besked || kanIkke.besked };
        }

        var alle = {};
        led.forEach(function (q) { bogstaver(q, alle); });
        if (led.every(function (q) { return !Object.keys(bogstaver(q)).length; })) {
            return { besked: "Skriv formlen med symboler først. Tallene kommer i næste felt." };
        }
        /* Molvolumenet skrevet som tal: det skal staa som Vₘ */
        var tal = [];
        led.forEach(function (q) { tallene(q, tal); });
        if (tal.some(function (v) { return naer(v, 24, 1e-6) || naer(v, 22.4, 1e-6); })) {
            return { besked: "Skriv molvolumenet som Vₘ. Tallet kommer i næste felt." };
        }

        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });
        var ukendt = ukendte.length ? (ukendte[0] === "g" ? MIDLER : VIS[ukendte[0]] + " kender du ikke i dette trin. Brug det, du kender.") : "";
        var hoejre = led[led.length - 1];
        var mv = U[r.maal];

        function passer(v) { return naer(v, mv, 1e-6); }
        /* V i mL: V / (1000 · Vₘ) er ogsaa rigtigt, men tavlen bruger liter */
        function iML(v) { return r.maal === "e" && naer(v, mv / 1000, 1e-6); }
        var ML_NOTE = "Rigtigt, når V er i mL. Tavlen regner med V i liter:";

        if (led.length === 1) {
            var v = regn(hoejre, U);
            if (!ukendt && passer(v)) return { ok: true };
            if (!ukendt && iML(v)) return { ok: true, note: ML_NOTE };
            return fejlBesked(r, v, ukendt);
        }
        var venstre = led[0];
        var erMaal = venstre.s === r.maal;
        var vV = regn(venstre, U), vH = regn(hoejre, U);
        if (erMaal) {
            if (!ukendt && passer(vH)) return { ok: true };
            if (!ukendt && iML(vH)) return { ok: true, note: ML_NOTE };
            return fejlBesked(r, vH, ukendt);
        }
        if (naer(vV, vH, 1e-6)) {
            if (!alle[r.maal]) return { besked: "Den sammenhæng er rigtig, men den giver ikke " + VIS[r.maal] + "." };
            if (ukendt) return { besked: ukendt };
            return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        if (venstre.s !== undefined && venstre.s !== r.maal) {
            return { besked: "Her skal du finde " + VIS[r.maal] + ". Skriv " + D.TRIN[id].venstre + " = …" };
        }
        return fejlBesked(r, vH);
    };

    /* En typisk fejl faar sin egen besked; ellers siges det, hvis der er
       brugt noget, man ikke kender endnu */
    function fejlBesked(r, v, ukendt) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = parse(scanIntern(r.fejl[i][0]));
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Tallet ------------------------------------------------------------------
       o: opgaven med tal og facit. Hvert trin har facit og en liste af
       typiske fejl, regnet ud af opgavens egne tal. */
    function kandidater(id, o) {
        var t = o.tal, f = o.facit;
        var liter = K.L(t.V) + " L";
        switch (id) {
        case "dm":
            return { facit: f.dm, fejl: [
                [-f.dm, "Omvendt. Beholderen vejede mest før, så m(før) står først."],
                [t.mf + t.me, "Den tabte masse. Træk m(efter) fra m(før)."],
                [t.mf, "Det er m(før). Træk m(efter) fra."],
                [t.me, "Det er m(efter). Træk det fra m(før)."]] };
        case "n":
            return { facit: f.n, fejl: [
                [t.V / D.VM, "Rumfanget skal i liter, fordi Vₘ er i L/mol: " + K.V(t.V) + " mL = " + liter + "."],
                [t.V / 1000 * D.VM, "Du har ganget. n = V / Vₘ."],
                [D.VM / (t.V / 1000), "Brøken er vendt om. n = V / Vₘ."],
                [t.V / 1000 / 22.4, "22,4 L/mol gælder ved 0 °C. Ved 20 °C er det " + D.VM_TEKST + "."],
                [f.dm / K.M_GAS, "Den molarmasse kender du ikke endnu. Brug rumfanget: n = V / Vₘ."]] };
        case "M":
            var n3 = K.r3(f.n);
            return { facit: f.M, fejl: [
                [f.dm * n3, "Du har ganget. M = m / n."],
                [n3 / f.dm, "Brøken er vendt om. Massen står øverst."],
                [t.mf / n3, "Brug massen af gassen, ikke hele beholderen."],
                [f.dm / (t.V / D.VM), "Tjek n: rumfanget skal i liter."]] };
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
        if (!t) return { besked: id === "n" ? "Skriv et tal, fx 6,25 · 10⁻³ eller 0,00625." : "Skriv et tal, fx 0,36." };
        var k = kandidater(id, o), v = t.v;
        if (naer(v, k.facit)) return { ok: true };
        for (var i = 0; i < k.fejl.length; i++) {
            var f = k.fejl[i][0];
            if (isFinite(f) && f !== 0 && naer(v, f)) return { besked: k.fejl[i][1] };
        }
        if (kommaFlyttet(v, k.facit)) return { besked: "Tjek kommaet. Tallet er " + (v > k.facit ? "for stort." : "for lille.") };
        if (naer(v, k.facit, 0.04)) return { besked: "Tæt på. Regn med alle cifrene." };
        return { besked: "Det passer ikke. Tryk på Giv hint, hvis du sidder fast." };
    };

    /* ----- Den paene beregning: [formlen, tallene] ------------------------------------ */
    T.venstre = function (id) { return D.TRIN[id].venstre; };
    T.formelTekst = function (id) { return D.TRIN[id].venstre + " = " + D.TRIN[id].formel; };

    T.facitTekst = function (id, o) {
        var f = o.facit;
        if (id === "dm") return K.g2(f.dm) + " g";
        if (id === "n") return K.mol(f.n) + " mol";
        if (id === "M") return K.Mv(f.M) + " g/mol";
        return "";
    };

    T.regning = function (id, o) {
        var t = o.tal, f = o.facit;
        var fl = T.formelTekst(id);
        if (id === "dm") return [fl, "= " + K.g2(t.mf) + " g − " + K.g2(t.me) + " g = " + T.facitTekst(id, o)];
        if (id === "n") return [fl, "= " + K.L(t.V) + " L / " + D.VM_TEKST + " = " + T.facitTekst(id, o)];
        if (id === "M") return [fl, "= " + K.g2(f.dm) + " g / " + K.mol(f.n) + " mol = " + T.facitTekst(id, o)];
        return [fl, ""];
    };

    /* Hintet til tallet: tallene sat ind i formlen */
    T.talHint = function (id, o) {
        var r = T.regning(id, o);
        var dele = r[1].slice(2).split(" = ");
        var ekstra = id === "n" ? " Rumfanget er i liter: " + K.V(o.tal.V) + " mL = " + K.L(o.tal.V) + " L." : "";
        return "Sæt tallene ind: " + D.TRIN[id].venstre + " = " + dele[0] + "." + ekstra;
    };

    NK.Tjek = T;
}());

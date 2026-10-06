/* =====================================================================
   tjek.js - regnetrinene paa fane 2: formlen, mellemregningen, tallet
   og den paene beregning

   Formlen tjekkes ved at regne den ud (som sc4.11). Hver stoerrelse faar
   et fast proevetal, hvor alle sammenhaengene passer (n = m / M,
   forholdet i reaktionsskemaet og m = n · M). Saa er
   "n(Fe) = m(Fe) / M(Fe)", "n = m/M" og "nFe = mFe/MFe" det samme, og en
   omskrevet formel er ogsaa rigtig. Etiketten afgoer stoffet: m(Fe),
   m(før) og m(stålulden) er det samme. De typiske fejl genkendes paa
   deres vaerdi og faar deres egen besked.

   Alt afhaenger af reaktionsskemaet sk (K.skema): oxidet er FeO (Let)
   eller Fe₃O₄ (Svær), og i Svær deles stofmaengden af jern med 3.

   Mellemregningen (to felter i en broek eller med et gangetegn) og
   resultatet med enhed tjekkes som i sc4.3.

   Stoerrelserne har et bogstav internt:
     a m(Fe) = m(før)   b m(efter)   c m(oxid)
     e n(Fe)   f n(oxid)   g M(Fe)   h M(oxid)

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

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-12;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    /* ----- Trinnene, som de staar i det valgte reaktionsskema ------------------------
       D.TRIN med {ox}, {kfe}, {kox} og {del} sat ind. Trin 2 er n_ox_ens,
       naar forholdet er 1 : 1, ellers n_ox_del. */
    var defs = {};
    T.def = function (id, sk) {
        var noegle = sk.id + "/" + id;
        if (defs[noegle]) return defs[noegle];
        var raa = D.TRIN[id === "n_ox" ? (sk.del === 1 ? "n_ox_ens" : "n_ox_del") : id];
        function f(s) {
            return String(s).replace(/\{ox\}/g, sk.oxid).replace(/\{kfe\}/g, sk.koef[0]).replace(/\{kox\}/g, sk.koef[2]).replace(/\{del\}/g, sk.del);
        }
        var d = { id: id, navn: f(raa.navn), venstre: f(raa.venstre), enhed: raa.enhed, op: raa.op, led: raa.led.map(f),
                  formelHint: f(raa.formelHint), talHint: f(raa.talHint), indsaetHint: (raa.indsaetHint || []).map(f) };
        defs[noegle] = d;
        return d;
    };

    /* ----- Et tal med eller uden enhed ---------------------------------------------
       "4,94", "4.94 g", "0,0716 mol", "7,16·10^-2 mol", "71,85 g/mol" */
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

    /* Vaegtens tal paa fane 1: et tal, gerne med g efter */
    T.tal = function (raa) {
        var s = T.svar(raa);
        if (!s || (s.enhed && s.enhed !== "g")) return null;
        return { v: s.v };
    };

    /* ----- Formlen: fra tekst til noget, der kan regnes ud -----------------------------
       Et m, n eller M med en etiket efter sig bliver til sit bogstav.
       Etiketten kan staa i parentes eller lige efter bogstavet:
       m(Fe), m(før), mFeO, n(jern), M(Fe₃O₄). */
    var SYMBOL = {
        m: { fe: "a", efter: "b", ox: "c" },
        n: { fe: "e", ox: "f" },
        M: { fe: "g", ox: "h" }
    };
    var ART = { a: "m", b: "m", c: "m", e: "n", f: "n", g: "M", h: "M" };

    /* Navnene paa stoerrelserne i det valgte skema */
    function vis(sk) {
        var ox = sk.oxid;
        return { a: "m(Fe)", b: "m(efter)", c: "m(" + ox + ")", e: "n(Fe)", f: "n(" + ox + ")", g: "M(Fe)", h: "M(" + ox + ")" };
    }
    T.vis = vis;

    /* "andet": et jernoxid, der ikke er skemaets */
    function klasse(label, sk) {
        var l = String(label).toLowerCase().replace(/[,.\s]/g, "").replace(/\(i+\)/g, "");
        if (l === "") return null;
        if (/^(fe|jern|jernet|ståluld|stålulden|staaluld|staalulden|staluld|stalulden|uld|ulden|før|foer|for|start|1)$/.test(l)) return "fe";
        if (/^(efter|slut|2)$/.test(l)) return "efter";
        if (l === NK.ascii(sk.oxid).toLowerCase()) return "ox";
        if (/^(jernoxid|jernoxidet|oxid|oxidet|produkt|produktet|rust)$/.test(l)) return "ox";
        if (/^fe\d?o\d?$/.test(l)) return "andet";
        return null;
    }

    /* Teksten goeres klar: haevede og saenkede tegn bliver almindelige, og
       gangetegn bliver * */
    function forbered(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/[−–]/g, "-").replace(/[÷:]/g, "/");
        return s.replace(/[_{}]/g, "");
    }

    var BOGSTAV = /[A-Za-zÆØÅæøå0-9]/;

    /* Den parentes, der lukker den ved i */
    function slutParentes(s, i) {
        var dybde = 0;
        for (var j = i; j < s.length; j++) {
            if (s[j] === "(") dybde++;
            if (s[j] === ")") { dybde--; if (dybde === 0) return j; }
        }
        return -1;
    }

    /* Tokens: { t: "s", v: bogstav } (a-h, eller "?m", "?n", "?M" uden
       etiket), { t: "t", v: tal }, + - * / ( ). Giver { fejl } eller { tk }. */
    function scan(s, sk) {
        var ud = [], i = 0, ox = sk.oxid;
        while (i < s.length) {
            var ch = s[i];
            if (ch === "m" || ch === "n" || ch === "N" || ch === "M") {
                var art = ch === "M" ? "M" : ch.toLowerCase();
                var j = i + 1, label = null;
                if (s[j] === "(") {
                    var k = slutParentes(s, j);
                    if (k < 0) return { fejl: "Der mangler en slutparentes." };
                    var ind = s.slice(j + 1, k);
                    if (klasse(ind, sk) !== null) { label = ind; j = k + 1; }
                    else if (/^[A-Za-zÆØÅæøå0-9()]+$/.test(ind) && /[A-Za-zÆØÅæøå]/.test(ind)) {
                        return { fejl: "Skriv Fe eller " + ox + " i parentesen, fx " + art + "(Fe)." };
                    }
                } else {
                    var r = j;
                    while (r < s.length && BOGSTAV.test(s[r])) r++;
                    var kand = s.slice(j, r);
                    if (kand && klasse(kand, sk) !== null) { label = kand; j = r; }
                }
                if (label === null) ud.push({ t: "s", v: "?" + art });
                else {
                    var kl = klasse(label, sk);
                    if (kl === "andet") return { fejl: "I dette reaktionsskema er produktet " + ox + ". Skriv " + art + "(" + ox + ")." };
                    var sym = SYMBOL[art][kl];
                    if (!sym) return { fejl: art === "m" ? "Den masse kender jeg ikke. Brug m(Fe) eller m(" + ox + ")." :
                        "Skriv " + (art === "n" ? "n(Fe) eller n(" + ox + ")." : "M(Fe) eller M(" + ox + ").") };
                    ud.push({ t: "s", v: sym });
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

    /* De interne formler i reglerne herunder: a-h, tal og regnetegn */
    function scanIntern(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (/[a-h]/.test(ch)) { ud.push({ t: "s", v: ch }); i++; }
            else if (/[0-9]/.test(ch)) {
                var q = i;
                while (q < s.length && /[0-9.]/.test(s[q])) q++;
                ud.push({ t: "t", v: parseFloat(s.slice(i, q)) });
                i = q;
            } else { ud.push({ t: ch }); i++; }
        }
        return ud;
    }

    /* Et lille udtryk med underforstaaet gangetegn mellem to led (som sc4.11) */
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
    function oversaet(n, alias, sk) {
        if (n.s !== undefined) {
            if (n.s.charAt(0) !== "?") return n;
            var a = alias && alias[n.s];
            var ox = sk.oxid;
            if (!a) throw { besked: n.s === "?m" ? "Skriv, hvilken masse du mener: m(Fe) eller m(" + ox + ")." :
                n.s === "?n" ? "Skriv, hvilken stofmængde du mener: n(Fe) eller n(" + ox + ")." :
                "Skriv, hvilken molarmasse du mener: M(Fe) eller M(" + ox + ")." };
            return { s: a };
        }
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
        if (n.a) ud.a = oversaet(n.a, alias, sk);
        if (n.b) ud.b = oversaet(n.b, alias, sk);
        return ud;
    }

    /* Proevetallene. Alle sammenhaenge passer, og ingen to udtryk, der
       ikke er det samme, giver det samme tal. */
    function proeve(sk) {
        var u = { a: 4.137, b: 5.021, g: 51.3, h: 67.9 };
        u.e = u.a / u.g;
        u.f = u.e / sk.del;
        u.c = u.f * u.h;
        return u;
    }

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: m, n og M uden etiket, og hvad de betyder her.
       fejl: typiske formler (internt) og beskeden til dem. */
    function ensTekst(sk) {
        return "Der står " + sk.koef[0] + " foran både Fe og " + sk.oxid + " i reaktionsskemaet. Forholdet er " +
            sk.koef[0] + " : " + sk.koef[2] + ", altså 1 : 1.";
    }
    function forholdTekst(sk) {
        return "I reaktionsskemaet er forholdet mellem Fe og " + sk.oxid + " " + sk.koef[0] + " : " + sk.koef[2] + ".";
    }

    var reglerne = {};
    function regler(sk) {
        if (reglerne[sk.id]) return reglerne[sk.id];
        var ox = sk.oxid, del = sk.del, kO2 = sk.koef[1];
        var F = {
            n_fe: { maal: "e", kendt: ["a", "b", "g", "h"], alias: { "?m": "a", "?M": "g" },
                    fejl: [["a*g", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                           ["g/a", "Brøken er vendt om. Massen står øverst."],
                           ["a/h", "Brug molarmassen for jern, M(Fe)."],
                           ["b/g", "Brug massen af stålulden, før den brændte. Den er jernet."]] },
            m_ox: { maal: "c", kendt: ["a", "b", "e", "f", "g", "h"], alias: { "?n": "f", "?M": "h" },
                    fejl: [["f/h", "Massen er stofmængde gange molarmasse, ikke divideret."],
                           ["h/f", "Massen er stofmængde gange molarmasse, ikke divideret."],
                           ["f*g", "Brug molarmassen for " + ox + ", M(" + ox + ")."],
                           ["a", "Det er massen af jernet. Regn massen af " + ox + " ud."],
                           ["b", "Det er det, vægten viste. Regn med stofmængden."]] }
        };
        if (del === 1) {
            var ens = ensTekst(sk);
            F.n_ox = { maal: "f", kendt: ["a", "b", "e", "g", "h"], alias: {},
                       fejl: [["2*e", ens], ["e/2", ens],
                              ["a", "Det er en masse. Forholdet i skemaet gælder stofmængder."],
                              ["a/h", "Gå vejen over n(Fe) fra trin 1. Forholdet i skemaet er " + sk.koef[0] + " : " + sk.koef[2] + "."]] };
        } else {
            F.n_ox = { maal: "f", kendt: ["a", "b", "e", "g", "h"], alias: {},
                       fejl: [[del + "*e", "Der bliver færre mol " + ox + " end Fe. Divider stofmængden af jern med " + del + "."],
                              ["e", "Forholdet er ikke 1 : 1 her. " + forholdTekst(sk)],
                              ["a", "Det er en masse. Forholdet i skemaet gælder stofmængder."],
                              ["a/h", "Gå vejen over n(Fe) fra trin 1, og brug forholdet i skemaet."]] };
            if (kO2 > 1 && kO2 !== del) F.n_ox.fejl.push(["e/" + kO2, kO2 + " er tallet foran O₂. Brug tallene foran Fe og " + ox + "."]);
            F.m_ox.fejl.splice(3, 0, ["e*h", "Det er stofmængden af jern. Brug stofmængden af " + ox + " fra trin 2."]);
        }
        reglerne[sk.id] = F;
        return F;
    }
    T.regler = regler;

    function laes(tekst, sk) {
        var sc = scan(tekst, sk);
        if (!sc) return null;
        if (sc.fejl) throw { besked: sc.fejl };
        if (!sc.tk.length) return null;
        return parse(sc.tk);
    }

    /* Giver { ok, note, besked, tom } */
    T.formel = function (id, raa, sk) {
        var r = regler(sk)[id], U = proeve(sk), VIS = vis(sk);
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = forbered(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug fx n(Fe), m(Fe) og M(Fe)." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        try {
            for (var i = 0; i < dele.length; i++) {
                var p = laes(dele[i], sk);
                if (!p) {
                    if (/^[\d.,+\-*\/()]+$/.test(dele[i])) return { besked: "Skriv formlen med symboler først. Tallene kommer bagefter." };
                    return kanIkke;
                }
                /* Et m, n eller M alene til venstre er det, trinnet finder */
                if (i === 0 && dele.length > 1 && p.s && p.s.charAt(0) === "?" && p.s.slice(1) === ART[r.maal]) p = { s: r.maal };
                led.push(oversaet(p, r.alias, sk));
            }
        } catch (x) {
            return { besked: x.besked || kanIkke.besked };
        }

        var alle = {};
        led.forEach(function (q) { bogstaver(q, alle); });
        if (led.every(function (q) { return !Object.keys(bogstaver(q)).length; })) {
            return { besked: "Skriv formlen med symboler først. Tallene kommer bagefter." };
        }
        /* Molarmassen skrevet som tal: den skal staa som M */
        var tal = [];
        led.forEach(function (q) { tallene(q, tal); });
        if (tal.some(function (v) { return naer(v, K.M_FE, 1e-4) || naer(v, sk.M, 1e-4); })) {
            return { besked: "Skriv molarmassen som M(Fe) eller M(" + sk.oxid + "). Tallet kommer bagefter." };
        }

        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });
        var ukendt = ukendte.length ? VIS[ukendte[0]] + " kender du ikke i dette trin. Brug det, du kender." : "";
        var hoejre = led[led.length - 1];
        var mv = U[r.maal];

        if (led.length === 1) {
            var v = regn(hoejre, U);
            if (!ukendt && naer(v, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, U, v, ukendt);
        }
        var venstre = led[0];
        var vV = regn(venstre, U), vH = regn(hoejre, U);
        if (venstre.s === r.maal) {
            if (!ukendt && naer(vH, mv, 1e-6)) return { ok: true };
            return fejlBesked(r, U, vH, ukendt);
        }
        if (naer(vV, vH, 1e-6)) {
            if (!alle[r.maal]) return { besked: "Den sammenhæng er rigtig, men den giver ikke " + VIS[r.maal] + "." };
            if (ukendt) return { besked: ukendt };
            return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        if (venstre.s !== undefined && venstre.s !== r.maal) {
            return { besked: "Her skal du finde " + VIS[r.maal] + ". Skriv " + T.def(id, sk).venstre + " = …" };
        }
        return fejlBesked(r, U, vH);
    };

    /* En typisk fejl faar sin egen besked; ellers siges det, hvis der er
       brugt noget, man ikke kender endnu */
    function fejlBesked(r, U, v, ukendt) {
        for (var i = 0; i < r.fejl.length; i++) {
            var p = parse(scanIntern(r.fejl[i][0]));
            if (p && naer(v, regn(p, U), 1e-6)) return { besked: r.fejl[i][1] };
        }
        if (ukendt) return { besked: ukendt };
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    }

    /* ----- Resultatet med enhed ----------------------------------------------------------
       o: opgaven med tal, facit og reaktionsskemaet (o.sk). De typiske
       fejl regnes ud af opgavens egne tal. */
    var ENHEDSREGNING = { n_fe: "g / (g/mol) = mol", n_ox: "stofmængden måles i mol", m_ox: "mol · g/mol = g" };
    var NAVN = { n_fe: "stofmængden", n_ox: "stofmængden", m_ox: "massen" };

    function kandidater(id, o) {
        var t = o.tal, f = o.facit, sk = o.sk, ox = sk.oxid, del = sk.del, kO2 = sk.koef[1], fejl;
        switch (id) {
        case "n_fe":
            return { facit: f.n, fejl: [
                [t.mf * K.M_FE, "Du har ganget. Del massen med molarmassen."],
                [K.M_FE / t.mf, "Brøken er vendt om. Massen står øverst."],
                [t.mf / sk.M, "Det er molarmassen af " + ox + ". Her regnes på jern, Fe."],
                [t.me / K.M_FE, "Det er massen efter. Brug massen af stålulden før."],
                [t.mf, "Det er massen. Del den med molarmassen."]] };
        case "n_ox":
            if (del === 1) {
                return { facit: f.nOx, fejl: [
                    [2 * f.nV, ensTekst(sk)], [f.nV / 2, ensTekst(sk)],
                    [t.mf, "Det er massen af jernet. Her skal du bruge stofmængden."]] };
            }
            fejl = [[f.nV * del, "Du har ganget. Divider stofmængden af jern med " + del + "."],
                    [f.nV, "Det er stofmængden af jern. " + forholdTekst(sk) + " Del den med " + del + "."],
                    [t.mf, "Det er massen af jernet. Her skal du bruge stofmængden."]];
            if (kO2 > 1 && kO2 !== del) fejl.push([f.nV / kO2, kO2 + " er tallet foran O₂. Brug tallene foran Fe og " + ox + "."]);
            return { facit: f.nOx, fejl: fejl };
        case "m_ox":
            fejl = [[f.nOxV / sk.M, "Du har divideret. Gang stofmængden med molarmassen."],
                    [sk.M / f.nOxV, "Du har divideret. Gang stofmængden med molarmassen."],
                    [f.nOxV * K.M_FE, del === 1 ? "Det er massen af jernet. Brug molarmassen af " + ox + "." :
                        "Det er molarmassen af jern. Brug molarmassen af " + ox + "."],
                    [t.me, "Det er det, vægten viste. Regn med stofmængden fra trin 2."],
                    [sk.M, "Det er massen af 1 mol. Gang med stofmængden."]];
            if (del !== 1) fejl.splice(3, 0, [f.nV * sk.M, "Det er stofmængden af jern. Brug stofmængden af " + ox + " fra trin 2."]);
            return { facit: f.m, fejl: fejl };
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
        var enhed = T.def(id, o.sk).enhed;
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv tallet og enheden." };
        var s = T.svar(raa);
        if (!s) return { besked: "Skriv et tal og en enhed, fx " + (enhed === "mol" ? "0,0716 mol." : "5,14 g.") };
        var k = kandidater(id, o), v = s.v;
        if (naer(v, k.facit)) {
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed !== enhed) {
                return { besked: "Tallet er rigtigt, men " + s.raaEnhed + " er ikke enheden for " + NAVN[id] + ". Regn enhederne: " +
                    ENHEDSREGNING[id] + ".", talOk: true };
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

    /* ----- Tal som tekst og facit ---------------------------------------------------------- */
    T.venstre = function (id, sk) { return T.def(id, sk).venstre; };

    T.formelTekst = function (id, sk) {
        var t = T.def(id, sk), l = t.led;
        var h = t.op === "/" ? l[0] + " / " + l[1] : (t.op === "*" ? l[0] + " · " + l[1] : l[0]);
        return t.venstre + " = " + h;
    };

    T.facitTekst = function (id, o) {
        var f = o.facit;
        if (id === "m_ox") return K.g2(f.m) + " g";
        return K.mol(id === "n_ox" ? f.nOx : f.n) + " mol";
    };

    /* Mellemregningens led: { sym, navn, v, enhed, tal (uden enhed), tekst }.
       Tallet fra reaktionsskemaet (3 i Svær) er et antal uden enhed. */
    T.led = function (id, o) {
        var t = o.tal, f = o.facit, sk = o.sk, ox = sk.oxid, ud;
        if (id === "n_fe") {
            ud = [{ sym: "m(Fe)", navn: "massen af jernet", v: t.mf, enhed: "g", tal: K.g2(t.mf) },
                  { sym: "M(Fe)", navn: "molarmassen af jern", v: K.M_FE, enhed: "g/mol", tal: K.MFeTekst }];
        } else if (id === "m_ox") {
            ud = [{ sym: "n(" + ox + ")", navn: "stofmængden af " + ox, v: f.nOxV, enhed: "mol", tal: K.mol(f.nOx) },
                  { sym: "M(" + ox + ")", navn: "molarmassen af " + ox, v: sk.M, enhed: "g/mol", tal: sk.Mtekst }];
        } else {
            ud = [{ sym: "n(Fe)", navn: "stofmængden af jern", v: f.nV, enhed: "mol", tal: K.mol(f.n) }];
            if (sk.del !== 1) ud.push({ sym: String(sk.del), navn: "tallet " + sk.del, v: sk.del, enhed: "", tal: String(sk.del) });
        }
        ud.forEach(function (l) { l.tekst = l.tal + (l.enhed ? " " + l.enhed : ""); });
        return ud;
    };

    function stort(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* Et tal med enhed i et af mellemregningens felter. i: feltet (0 er
       over broekstregen eller det foerste tal). ledige: de led, feltet maa
       vaere (i en broek kun led i, i et produkt dem, der ikke er brugt).
       Giver { ok, led } eller { besked, tom, talOk }. */
    T.tjekLed = function (id, o, i, raa, ledige) {
        var led = T.led(id, o), sk = o.sk, ox = sk.oxid, broek = T.def(id, sk).op === "/";
        var hvor = broek ? (i === 0 ? "over brøkstregen" : "under brøkstregen") : (i === 0 ? "i det første felt" : "i det andet felt");
        var kunTal = ledige.length === 1 && led[ledige[0]].enhed === "";
        if (!String(raa || "").trim()) return { tom: true, besked: (kunTal ? "Skriv tallet " : "Skriv tallet og enheden ") + hvor + "." };
        var s = T.svar(raa);
        if (!s) return { besked: (kunTal ? "Skriv et tal " : "Skriv et tal og en enhed ") + hvor + "." };
        /* Et tal mere efter enheden (men ikke mol-1): hele broeken i ét felt */
        if (/\d/.test(s.raaEnhed.replace(/\^?\s*[-−⁻]\s*[1¹]/g, ""))) {
            return { besked: broek ? "Skriv kun ét tal i hvert felt: det ene over brøkstregen, det andet under." : "Skriv kun ét tal i hvert felt." };
        }
        for (var k = 0; k < ledige.length; k++) {
            var L = led[ledige[k]];
            if (!naer(s.v, L.v)) continue;
            if (L.enhed === "") {
                if (s.enhed) return { besked: "Tallet " + L.tal + " kommer fra reaktionsskemaet. Det er et antal og har ingen enhed.", talOk: true };
                return { ok: true, led: ledige[k] };
            }
            if (!s.enhed) return { besked: "Tallet er rigtigt. Skriv også enheden efter tallet.", talOk: true };
            if (s.enhed !== L.enhed) return { besked: "Tallet er rigtigt, men " + L.navn + " måles i " + L.enhed + ".", talOk: true };
            return { ok: true, led: ledige[k] };
        }
        if (broek && led[1 - i] && naer(s.v, led[1 - i].v)) {
            return { besked: "Brøken er vendt om. " + stort(led[0].navn) + " står øverst, som i formlen." };
        }
        /* De tal, der ligger lige for, men er de forkerte */
        if (id === "n_fe" && naer(s.v, o.tal.me)) return { besked: "Det er m(efter). Brug massen af stålulden før, m(før)." };
        if (id === "n_fe" && naer(s.v, sk.M)) return { besked: "Det er molarmassen af " + ox + ". Her regnes på jern, Fe." };
        if (id === "n_ox" && naer(s.v, o.tal.mf)) return { besked: "Det er massen af jernet. Her skal du bruge stofmængden af jern fra trin 1." };
        if (id === "n_ox" && kunTal) return { besked: "Det tal passer ikke. " + forholdTekst(sk) };
        if (id === "m_ox" && naer(s.v, K.M_FE)) return { besked: "Det er molarmassen af jern. Brug molarmassen af " + ox + "." };
        if (id === "m_ox" && naer(s.v, o.tal.mf)) return { besked: "Det er massen af jernet. Det første tal er stofmængden fra trin 2." };
        if (id === "m_ox" && sk.del !== 1 && naer(s.v, o.facit.nV)) return { besked: "Det er stofmængden af jern. Brug stofmængden af " + ox + " fra trin 2." };
        var L0 = led[ledige[0]];
        if (ledige.length === 1 && kommaFlyttet(s.v, L0.v)) return { besked: "Tjek kommaet. Tallet er for " + (s.v > L0.v ? "stort." : "lille.") };
        if (broek) return { besked: "Det tal passer ikke. " + stort(hvor) + " står " + led[i].navn + ", " + led[i].sym + "." };
        return { besked: "Det tal passer ikke. De to tal er " + led[0].navn + " og " + led[1].navn + "." };
    };

    /* ----- Regnestykket med rigtige broekstreger (i kortet) --------------------------------- */
    function broekHTML(a, b) { return '<span class="broek"><span>' + a + "</span><span>" + b + "</span></span>"; }

    /* "m(Fe)" -> "<i>m</i>(Fe)"; et tal staar, som det er */
    function symHTML(s) {
        if (!/^[mnM]\(/.test(s)) return NK.html(s);
        return "<i>" + NK.html(s.charAt(0)) + "</i>" + NK.html(s.slice(1));
    }
    T.symHTML = symHTML;

    T.formelHTML = function (id, sk) {
        var t = T.def(id, sk), l = t.led;
        if (t.op === "/") return broekHTML(symHTML(l[0]), symHTML(l[1]));
        if (t.op === "*") return symHTML(l[0]) + " · " + symHTML(l[1]);
        return symHTML(l[0]);
    };

    /* tekster: de to tal med enhed, som de staar i felterne (null: ikke endnu) */
    T.indsaetHTML = function (id, sk, tekster) {
        var a = tekster && tekster[0] ? NK.html(tekster[0]) : "?", b = tekster && tekster[1] ? NK.html(tekster[1]) : "?";
        return T.def(id, sk).op === "/" ? broekHTML(a, b) : a + " · " + b;
    };

    T.regningHTML = function (id, o, tekster) {
        var sk = o.sk, op = T.def(id, sk).op;
        var h = symHTML(T.venstre(id, sk)) + " = " + T.formelHTML(id, sk) + " = ";
        if (op) {
            tekster = tekster && tekster[0] && tekster[1] ? tekster : T.led(id, o).map(function (l) { return l.tekst; });
            h += T.indsaetHTML(id, sk, tekster) + " = ";
        }
        return h + "<b>" + NK.html(T.facitTekst(id, o)) + "</b>";
    };

    /* Den paene beregning som tekst: [formlen, resten] */
    T.regning = function (id, o) {
        var op = T.def(id, o.sk).op, led = T.led(id, o);
        var midt = op === "/" ? led[0].tekst + " / " + led[1].tekst + " = " : (op === "*" ? led[0].tekst + " · " + led[1].tekst + " = " : "");
        return [T.formelTekst(id, o.sk), "= " + midt + T.facitTekst(id, o)];
    };

    NK.Tjek = T;
}());

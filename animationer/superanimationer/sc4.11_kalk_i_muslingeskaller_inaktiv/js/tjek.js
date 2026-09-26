/* =====================================================================
   tjek.js - regnetrinene paa fane 2: formlen, tallet og den paene
   beregning

   Formlen tjekkes ved at regne den ud. Hver stoerrelse faar et fast
   proevetal, hvor alle sammenhaengene passer (m(CO₂) = m(før) − m(efter),
   n = m / M, n(CaCO₃) = n(CO₂), M(CaCO₃) / M(CO₂) = 2,27 og kalkindhold =
   m(CaCO₃) / m(før) · 100). Saa er "m(før) − m(efter)", "mfør-mefter"
   og "m1 - m2" det samme, og en omskrevet formel er ogsaa rigtig. De
   typiske fejl genkendes paa deres vaerdi og faar deres egen besked.

   Stoerrelserne har et bogstav internt:
     a m(før) eller m(prøve)   b m(efter)
     c m(CO₂)   d m(CaCO₃)   e n(CO₂)   f n(CaCO₃)   g M(CO₂)   h M(CaCO₃)
     p kalkindholdet i %

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

    /* ----- Tallet, eleven har skrevet (som sc5.1) -------------------------------
       "0,43", "0.43", "0,43 g", "95,7 %", "9,77·10^-3" og "9,77e-3" er tal. */
    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.tal = function (raa) {
        var s = String(raa || "");
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s).replace(/\s+/g, "");
        s = s.replace(/(g\/mol|mol|%|g)$/i, "");
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

    /* ----- Formlen: fra tekst til noget, der kan regnes ud ---------------------------
       Et m, n eller M med en etiket efter sig bliver til sit bogstav.
       Etiketten kan staa i parentes, efter en bundstreg eller lige efter
       bogstavet: m(CO2), m_CO₂, mCO2, m(musling, før), mfør, m1. */
    var SYMBOL = {
        m: { foer: "a", efter: "b", co2: "c", caco3: "d" },
        n: { co2: "e", caco3: "f" },
        M: { co2: "g", caco3: "h" }
    };
    var ART = { a: "m", b: "m", c: "m", d: "m", e: "n", f: "n", g: "M", h: "M", p: "p" };
    var VIS = { a: "m(før)", b: "m(efter)", c: "m(CO₂)", d: "m(CaCO₃)", e: "n(CO₂)", f: "n(CaCO₃)",
                g: "M(CO₂)", h: "M(CaCO₃)", p: "kalkindholdet" };
    T.VIS = VIS;

    function klasse(label) {
        var l = String(label).toLowerCase().replace(/[,.\s]/g, "");
        l = l.replace(/musling(erne|er|eskallerne|eskaller|eskal)?/g, "")
             .replace(/prøven|prøve|proeven|proeve|proven|prove|pulveret|pulver|skallerne|skaller|dannet|udledt|ialt|total/g, "");
        if (l === "") return "foer";
        if (/^(før|foer|for|start|1|begyndelse)$/.test(l)) return "foer";
        if (/^(efter|slut|2|rest|restprodukt|tilbage)$/.test(l)) return "efter";
        if (/^(co2|kuldioxid|carbondioxid|gas|gassen)$/.test(l)) return "co2";
        if (/^(caco3|kalk|kalken|calciumcarbonat)$/.test(l)) return "caco3";
        return null;
    }

    /* Teksten goeres klar: haevede og saenkede tegn bliver almindelige,
       gangetegn bliver *, kalkindholdet bliver P, og % forsvinder */
    function forbered(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅]/g, "*").replace(/[−–]/g, "-").replace(/[÷:]/g, "/");
        s = s.replace(/[_{}]/g, "");
        s = s.replace(/kalkindholdet|kalkindhold|kalkprocent|masseprocent|procentdel|procent|indholdet|kalk%|m%|w%/gi, "P");
        s = s.replace(/%/g, "");
        return s;
    }

    var BOGSTAV = /[A-Za-zÆØÅæøå0-9,]/;

    /* Tokens: { t: "s", v: bogstav } (a-h, p, eller "?m", "?n", "?M" for et
       m, n eller M uden etiket), { t: "t", v: tal }, + - * / ( ).
       Giver { fejl } eller { tk }. */
    function scan(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (ch === "m" || ch === "n" || ch === "N" || ch === "M") {
                var art = ch === "M" ? "M" : ch.toLowerCase();
                var j = i + 1, label = null;
                if (s[j] === "(") {
                    var k = s.indexOf(")", j);
                    if (k < 0) return { fejl: "Der mangler en slutparentes." };
                    var ind = s.slice(j + 1, k);
                    if (klasse(ind) !== null && /[A-Za-zÆØÅæøå12]/.test(ind)) { label = ind; j = k + 1; }
                } else {
                    var r = j;
                    while (r < s.length && BOGSTAV.test(s[r])) r++;
                    var kand = s.slice(j, r);
                    if (kand && klasse(kand) !== null) { label = kand; j = r; }
                }
                if (label === null) ud.push({ t: "s", v: "?" + art });
                else {
                    var sym = SYMBOL[art][klasse(label)];
                    if (!sym) return { fejl: art === "m" ? "Den masse kender jeg ikke." :
                        "Skriv " + (art === "n" ? "n(CO₂) eller n(CaCO₃)." : "M(CO₂) eller M(CaCO₃).") };
                    ud.push({ t: "s", v: sym });
                }
                i = j;
            } else if (ch === "P" || ch === "p") {
                ud.push({ t: "s", v: "p" }); i++;
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

    /* De interne formler i reglerne herunder: a-h og p, tal og regnetegn */
    function scanIntern(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var ch = s[i];
            if (/[a-hp]/.test(ch)) { ud.push({ t: "s", v: ch }); i++; }
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
       mellem to led, der staar ved siden af hinanden (som sc5.1) */
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
            if (!a) throw { besked: n.s === "?m" ? "Skriv, hvilken masse du mener, fx m(CO₂) eller m(før)." :
                n.s === "?n" ? "Skriv, hvilken stofmængde du mener: n(CO₂) eller n(CaCO₃)." :
                "Skriv, hvilken molarmasse du mener: M(CO₂) eller M(CaCO₃)." };
            return { s: a };
        }
        if (n.tal !== undefined) return n;
        var ud = { op: n.op };
        if (n.a) ud.a = oversaet(n.a, alias);
        if (n.b) ud.b = oversaet(n.b, alias);
        return ud;
    }

    /* Proevetallene. Alle sammenhaenge passer (ogsaa h / g = 2,27), og
       ingen to udtryk, der ikke er det samme, giver det samme tal. */
    var U = (function () {
        var u = { a: 1.137, b: 0.6813, g: 41.3 };
        u.c = u.a - u.b;
        u.h = u.g * D.FAKTOR;
        u.e = u.c / u.g;
        u.f = u.e;
        u.d = u.f * u.h;
        u.p = u.d / u.a * 100;
        return u;
    }());

    /* Regler pr. trin. maal: det bogstav, trinnet finder. kendt: det, man
       maa bruge. alias: m, n og M uden etiket, og hvad de betyder her.
       fejl: typiske formler (internt) og beskeden til dem. */
    var HUNDRED = "Det giver brøkdelen. Gang med 100 % for at få procent.";
    var EN_EN = "Der står 1 foran både CaCO₃ og CO₂ i reaktionsskemaet. Forholdet er 1 : 1.";
    var GENVEJ = "Det er genvejen med 2,27. Her går vejen over stofmængden.";
    /* kendt er alt det, der er kendt, naar trinnet begynder. I vejen med
       mol maa 2,27 ikke staa i formlen (genvej). */
    var F = {
        dm: { maal: "c", kendt: ["a", "b"], alias: {},
              fejl: [["b-a", "Omvendt. Pulveret vejede mere før, så m(før) står først."],
                     ["a+b", "Kolben tabte masse. Træk m(efter) fra m(før)."]] },
        mk_f: { maal: "d", kendt: ["a", "b", "c"], alias: { "?m": "c" },
                fejl: [["c/2.27", "Kalken vejer mere end det CO₂, den giver. Gang med 2,27."],
                       ["a*2.27", "Brug massen af CO₂, ikke hele prøven."],
                       ["2.27/c", "Kalken vejer mere end det CO₂, den giver. Gang med 2,27."]] },
        pct: { maal: "p", kendt: ["a", "b", "c", "d", "e", "f", "g", "h"], alias: {},
               fejl: [["d/a", HUNDRED],
                      ["a/d*100", "Brøken er vendt om. Kalkens masse står øverst."],
                      ["d/b*100", "Del med m(før), hele prøvens masse."],
                      ["c/a*100", "Det er CO₂'s andel af prøven. Brug massen af kalk."]] },
        n_co2: { maal: "e", kendt: ["a", "b", "c", "g", "h"], alias: { "?m": "c", "?M": "g" },
                 fejl: [["c*g", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                        ["g/c", "Brøken er vendt om. Massen står øverst."],
                        ["c/h", "Brug molarmassen for CO₂."]] },
        n_kalk: { maal: "f", kendt: ["a", "b", "c", "e", "g", "h"], alias: {},
                  fejl: [["2*e", EN_EN], ["e/2", EN_EN],
                         ["c", "Det er en masse. Forholdet i skemaet gælder stofmængder."]] },
        mk_n: { maal: "d", kendt: ["a", "b", "c", "e", "f", "g", "h"], alias: { "?n": "f", "?M": "h" }, genvej: true,
                fejl: [["f/h", "Massen er stofmængde gange molarmasse, ikke divideret."],
                       ["h/f", "Massen er stofmængde gange molarmasse, ikke divideret."],
                       ["f*g", "Brug molarmassen for CaCO₃."]] },
        mk_p: { maal: "d", kendt: ["p", "a", "g", "h"], alias: { "?m": "a" },
                fejl: [["p*a", "Kalkindholdet er i procent. Del med 100 %."],
                       ["a/p*100", "Omvendt. Kalken er en del af prøven: kalkindhold / 100 % · m(prøve)."],
                       ["a*100/p", "Omvendt. Kalken er en del af prøven: kalkindhold / 100 % · m(prøve)."]] },
        mc_f: { maal: "c", kendt: ["p", "a", "d"], alias: { "?m": "d" },
                fejl: [["d*2.27", "CO₂ vejer mindre end den kalk, det kommer fra. Del med 2,27."],
                       ["a/2.27", "Brug massen af kalk, ikke hele prøven."]] },
        nk_m: { maal: "f", kendt: ["p", "a", "d", "g", "h"], alias: { "?m": "d", "?M": "h" },
                fejl: [["d*h", "Stofmængden er massen divideret med molarmassen, ikke ganget."],
                       ["h/d", "Brøken er vendt om. Massen står øverst."],
                       ["d/g", "Brug molarmassen for CaCO₃."]] },
        nc_k: { maal: "e", kendt: ["p", "a", "d", "f", "g", "h"], alias: {},
                fejl: [["2*f", EN_EN], ["f/2", EN_EN],
                       ["d", "Det er en masse. Forholdet i skemaet gælder stofmængder."]] },
        mc_n: { maal: "c", kendt: ["p", "a", "d", "e", "f", "g", "h"], alias: { "?n": "e", "?M": "g" }, genvej: true,
                fejl: [["e/g", "Massen er stofmængde gange molarmasse, ikke divideret."],
                       ["g/e", "Massen er stofmængde gange molarmasse, ikke divideret."],
                       ["e*h", "Brug molarmassen for CO₂."]] }
    };
    T.REGLER = F;

    function laes(tekst, r) {
        var sc = scan(tekst);
        if (!sc) return null;
        if (sc.fejl) throw { besked: sc.fejl };
        if (!sc.tk.length) return null;
        var p = parse(sc.tk);
        return p;
    }

    /* Giver { ok, note, besked, tom } */
    T.formel = function (id, raa) {
        var r = F[id];
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var s = forbered(raa);
        var dele = s.split("=").filter(function (d) { return d !== ""; });
        var kanIkke = { besked: "Den formel kan jeg ikke læse. Brug fx m(CO₂), m(før), n(CaCO₃) og M(CO₂)." };
        if (!dele.length || dele.length > 3) return kanIkke;
        var led = [];
        try {
            for (var i = 0; i < dele.length; i++) {
                var p = laes(dele[i], r);
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
        /* Molarmassen skrevet som tal: den skal staa som M */
        var tal = [];
        led.forEach(function (q) { tallene(q, tal); });
        var Mtal = tal.filter(function (v) { return naer(v, K.M_CO2, 1e-4) || naer(v, K.M_KALK, 1e-4); });
        if (Mtal.length === 1) return { besked: "Skriv molarmassen som M(CO₂) eller M(CaCO₃). Tallet kommer i næste felt." };
        if (r.genvej && tal.some(function (v) { return naer(v, D.FAKTOR, 1e-6); })) return { besked: GENVEJ };

        var ukendte = Object.keys(alle).filter(function (b) { return b !== r.maal && r.kendt.indexOf(b) < 0; });
        var ukendt = ukendte.length ? VIS[ukendte[0]] + " kender du ikke i dette trin. Brug det, du kender." : "";
        var hoejre = led[led.length - 1];
        var mv = U[r.maal];

        function passer(v) {
            if (naer(v, mv, 1e-6)) return true;
            /* 100,09 / 44,01 i stedet for 2,27 er ogsaa rigtigt */
            return Mtal.length >= 2 && naer(v, mv, 0.003);
        }

        if (led.length === 1) {
            var v = regn(hoejre, U);
            if (!ukendt && passer(v)) return { ok: true };
            return fejlBesked(r, v, ukendt);
        }
        var venstre = led[0];
        var erMaal = venstre.s === r.maal;
        var vV = regn(venstre, U), vH = regn(hoejre, U);
        if (erMaal) {
            if (!ukendt && passer(vH)) return { ok: true };
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
        var t = o.tal, f = o.facit, M1 = K.M_CO2, M2 = K.M_KALK;
        var dm = f.dm, mk = f.mk !== undefined ? K.r3(f.mk) : null;
        switch (id) {
        case "dm":
            return { facit: dm, fejl: [
                [-dm, "Omvendt. Pulveret vejede mere før, så m(før) står først."],
                [t.mf + t.me, "Kolben tabte masse. Træk m(efter) fra m(før)."],
                [t.mf, "Det er m(før). Træk m(efter) fra."],
                [t.me, "Det er m(efter), det, der er tilbage. Træk det fra m(før)."]] };
        case "mk_f":
            return { facit: f.mk_f, fejl: [
                [dm / D.FAKTOR, "Du har divideret. Kalken vejer mere end CO₂: gang med 2,27."],
                [t.mf * D.FAKTOR, "Brug massen af CO₂, ikke m(før)."],
                [dm, "Det er massen af CO₂. Gang med 2,27."]] };
        case "pct":
            return { facit: f.pct, fejl: [
                [f.pct / 100, HUNDRED],
                [t.mf / mk * 100, "Brøken er vendt om. Kalkens masse står øverst."],
                [mk / t.me * 100, "Del med m(før), hele prøvens masse."],
                [dm / t.mf * 100, "Det er CO₂'s andel af prøven. Brug massen af kalk."],
                [mk, "Det er massen af kalk. Del med m(før), og gang med 100 %."]] };
        case "n_co2":
            return { facit: f.n_co2, fejl: [
                [dm * M1, "Du har ganget. n = m / M."],
                [M1 / dm, "Brøken er vendt om. n = m / M."],
                [dm / M2, "Brug molarmassen for CO₂, " + K.Mtekst("CO2") + " g/mol."],
                [dm, "Det er massen. Del med molarmassen."]] };
        case "n_kalk":
            return { facit: f.n_kalk, fejl: [[2 * f.n_kalk, EN_EN], [f.n_kalk / 2, EN_EN],
                [dm, "Det er massen af CO₂. Her skal du bruge stofmængden."]] };
        case "mk_n":
            return { facit: f.mk_n, fejl: [
                [f.n_kalk / M2, "Du har divideret. m = n · M."],
                [M2 / f.n_kalk, "Du har divideret. m = n · M."],
                [f.n_kalk * M1, "Brug molarmassen for CaCO₃, " + K.Mtekst("CaCO3") + " g/mol."]] };
        case "mk_p":
            return { facit: f.mk_p, fejl: [
                [t.p * t.m, "Kalkindholdet er i procent. Del med 100 %."],
                [t.m / t.p * 100, "Omvendt. Kalken er en del af prøven."],
                [t.m, "Det er hele prøven. Kun " + t.p + " % af den er kalk."]] };
        case "mc_f":
            return { facit: f.mc_f, fejl: [
                [K.r3(f.mk_p) * D.FAKTOR, "Du har ganget. CO₂ vejer mindre end kalken: del med 2,27."],
                [t.m / D.FAKTOR, "Brug massen af kalk, ikke hele prøven."]] };
        case "nk_m":
            return { facit: f.nk_m, fejl: [
                [K.r3(f.mk_p) * M2, "Du har ganget. n = m / M."],
                [M2 / K.r3(f.mk_p), "Brøken er vendt om. n = m / M."],
                [K.r3(f.mk_p) / M1, "Brug molarmassen for CaCO₃, " + K.Mtekst("CaCO3") + " g/mol."]] };
        case "nc_k":
            return { facit: f.nc_k, fejl: [[2 * f.nc_k, EN_EN], [f.nc_k / 2, EN_EN]] };
        case "mc_n":
            return { facit: f.mc_n, fejl: [
                [f.nc_k / M1, "Du har divideret. m = n · M."],
                [f.nc_k * M2, "Brug molarmassen for CO₂, " + K.Mtekst("CO2") + " g/mol."]] };
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
        if (!t) return { besked: "Skriv et tal, fx 0,43." };
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

    T.formelTekst = function (id, o) {
        var fl = D.TRIN[id].formel;
        if (o && o.baglaens) fl = fl.replace("m(før)", "m(prøve)");
        return D.TRIN[id].venstre + " = " + fl;
    };

    T.facitTekst = function (id, o) {
        var f = o.facit;
        switch (id) {
        case "dm": return K.g2(f.dm) + " g";
        case "mk_f": return K.g(f.mk_f) + " g";
        case "pct": return K.pct(f.pct) + " %";
        case "n_co2": return K.mol(f.n_co2) + " mol";
        case "n_kalk": return K.mol(f.n_kalk) + " mol";
        case "mk_n": return K.g(f.mk_n) + " g";
        case "mk_p": return K.g(f.mk_p) + " g";
        case "mc_f": return K.g(f.mc_f) + " g";
        case "nk_m": return K.mol(f.nk_m) + " mol";
        case "nc_k": return K.mol(f.nc_k) + " mol";
        case "mc_n": return K.g(f.mc_n) + " g";
        }
        return "";
    };

    T.regning = function (id, o) {
        var t = o.tal, f = o.facit;
        var fl = T.formelTekst(id, o);
        var MC = K.Mtekst("CO2") + " g/mol", MK = K.Mtekst("CaCO3") + " g/mol";
        switch (id) {
        case "dm": return [fl, "= " + K.g2(t.mf) + " g − " + K.g2(t.me) + " g = " + T.facitTekst(id, o)];
        case "mk_f": return [fl, "= " + K.g2(f.dm) + " g · 2,27 = " + T.facitTekst(id, o)];
        case "pct": return [fl, "= " + K.g(f.mk) + " g / " + K.g2(t.mf) + " g · 100 % = " + T.facitTekst(id, o)];
        case "n_co2": return [fl, "= " + K.g2(f.dm) + " g / " + MC + " = " + T.facitTekst(id, o)];
        case "n_kalk": return [fl, "= " + T.facitTekst(id, o)];
        case "mk_n": return [fl, "= " + K.mol(f.n_kalk) + " mol · " + MK + " = " + T.facitTekst(id, o)];
        case "mk_p": return [fl, "= " + t.p + " % / 100 % · " + K.g2(t.m) + " g = " + T.facitTekst(id, o)];
        case "mc_f": return [fl, "= " + K.g(f.mk_p) + " g / 2,27 = " + T.facitTekst(id, o)];
        case "nk_m": return [fl, "= " + K.g(f.mk_p) + " g / " + MK + " = " + T.facitTekst(id, o)];
        case "nc_k": return [fl, "= " + T.facitTekst(id, o)];
        case "mc_n": return [fl, "= " + K.mol(f.nc_k) + " mol · " + MC + " = " + T.facitTekst(id, o)];
        }
        return [fl, ""];
    };

    /* Hintet til tallet: tallene sat ind i formlen */
    T.talHint = function (id, o) {
        var r = T.regning(id, o);
        var dele = r[1].slice(2).split(" = ");
        if (dele.length < 2) return "Forholdet er 1 : 1, så tallet er det samme som i trinnet før.";
        return "Sæt tallene ind: " + D.TRIN[id].venstre + " = " + dele[0] + ".";
    };

    NK.Tjek = T;
}());

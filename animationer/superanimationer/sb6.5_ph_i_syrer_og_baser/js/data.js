/* =====================================================================
   data.js - syrerne, baserne, trinnene, teksterne og tallene

   Ordene og tallene er Kemibogens (afsnit B6.5 pH i opløsninger af syrer
   og B6.6 pH i opløsninger af baser): [H₃O⁺] = cₛ for en stærk syre,
   skemaet med Start, Ændring og Ligevægt, Kₛ = x² / (cₛ − x), genvejen
   pH = ½ · (pKₛ − log cₛ), valget ud fra pKₛ (figuren b6-hvilken-formel:
   stærk under 0, middelstærk 0 til 4, svag over 4) og for baser vejen
   over [OH⁻] og pOH (figuren b6-base-vej) med pK_b = 14,00 − pKₛ.

   Formler skrives som "CH_3COO^-": _ saenker et tal, ^ haever en ladning
   (^2- er 2−), og {} samler en laengere del: 10^{-4,76}. D.u giver samme
   formel med unicode (CH₃COO⁻) til tekst paa kortet, og D.sub laver
   unicode, ^{...} og c_b, pK_b om til <sub> og <sup>.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Farverne ------------------------------------------------------------ */
    D.FARVE = {
        blaek: "#14201f",
        daempet: "#556766",
        par1: "#1f6fb2",       /* syren og dens korresponderende base (som sb6.1) */
        par2: "#7d3c98",       /* vand og oxoniumionen */
        hydron: "#b45309",
        gul: "#d69e0c",
        groen: "#2f9a5f",
        roed: "#c0392b",
        hydroxid: "#0f7c86"    /* hydroxidionen i fane 3 */
    };

    /* ----- Bogens inddeling (figuren b6-pks-skala) -------------------------------- */
    D.ZONER = [
        { navn: "stærk", titel: "stærke syrer", til: 0, farve: "#f4b9ae" },
        { navn: "middelstærk", titel: "middelstærke", til: 4, farve: "#f9d6ad" },
        { navn: "svag", titel: "svage", til: 10, farve: "#fbeaa6" },
        { navn: "meget svag", titel: "meget svage", til: Infinity, farve: "#d9e5ea" }
    ];
    D.SKALA_MIN = -8;
    D.SKALA_MAX = 14;

    D.zone = function (pks) {
        for (var i = 0; i < D.ZONER.length; i++) if (pks < D.ZONER[i].til) return i;
        return D.ZONER.length - 1;
    };

    /* Fremgangsmaaden (figuren b6-hvilken-formel): 0 staerk, 1 middelstaerk
       (ligningen), 2 svag (genvejen). En meget svag syre bruger ogsaa genvejen. */
    D.vej = function (pks) { return pks < 0 ? 0 : (pks < 4 ? 1 : 2); };

    /* =====================================================================
       Syrerne: bogens tabel i afsnit B6.3. q er syrens ladning. form er
       partiklens form i luppen (som sb6.1 og sc7.5).
       ===================================================================== */
    D.SYRER = {
        hcl: { id: "hcl", navn: "saltsyre", syre: "HCl", base: "Cl^-", q: 0, pks: -7, form: "kugle" },
        hno3: { id: "hno3", navn: "salpetersyre", syre: "HNO_3", base: "NO_3^-", q: 0, pks: -1.4, form: "trekant" },
        h3po4: { id: "h3po4", navn: "phosphorsyre", syre: "H_3PO_4", base: "H_2PO_4^-", q: 0, pks: 2.15, form: "stor" },
        hf: { id: "hf", navn: "hydrogenfluorid", syre: "HF", base: "F^-", q: 0, pks: 3.17, form: "kugle" },
        hcooh: { id: "hcooh", navn: "methansyre", syre: "HCOOH", base: "HCOO^-", q: 0, pks: 3.75, form: "kort" },
        maelk: { id: "maelk", navn: "mælkesyre", syre: "C_3H_6O_3", base: "C_3H_5O_3^-", q: 0, pks: 3.86, form: "pille" },
        eddike: { id: "eddike", navn: "ethansyre", syre: "CH_3COOH", base: "CH_3COO^-", q: 0, pks: 4.76, form: "pille" },
        nh4: { id: "nh4", navn: "ammonium", syre: "NH_4^+", base: "NH_3", q: 1, pks: 9.25, form: "kugle" }
    };

    D.Navn = function (id) { var n = D.SYRER[id].navn; return n.charAt(0).toUpperCase() + n.slice(1); };
    D.stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* =====================================================================
       Modellen: HA + H₂O ⇌ A⁻ + H₃O⁺,  Kₛ = x² / (c − x)
       x² + Kₛ·x − Kₛ·c = 0 har roedderne x₊ og x₋ = −Kₛ − x₊.
       x₊ skrives som 2Kc / (K + √(K² + 4Kc)), saa det ogsaa er praecist for
       store Kₛ (en staerk syre).
       ===================================================================== */
    D.oxonium = function (ks, c) {
        return 2 * ks * c / (ks + Math.sqrt(ks * ks + 4 * ks * c));
    };
    D.andel = function (ks, c) { return c > 0 ? D.oxonium(ks, c) / c : 0; };
    D.ksFraPks = function (pks) { return Math.pow(10, -pks); };
    D.log = function (v) { return Math.log(v) / Math.LN10; };

    D.eksp = function (v) { return Math.floor(D.log(Math.abs(v)) + 1e-9); };
    D.rund3 = function (v) {
        if (!v) return 0;
        var e = D.eksp(v), f = Math.pow(10, 2 - e);
        return Math.round(v * f) / f;
    };
    D.rund2d = function (v) { return Math.round(v * 100 + (v >= 0 ? 1e-9 : -1e-9)) / 100; };

    /* Tallene for en syreoploesning, regnet som i bogen: Kₛ med tre
       betydende cifre, x med tre, og pH med to decimaler af det afrundede x */
    D.syreTal = function (e) {
        var s = D.SYRER[e.id], K = D.rund3(D.ksFraPks(s.pks)), c = e.c;
        var xp = D.oxonium(K, c), xm = -K - xp;
        var xpR = D.rund3(xp), xmR = -D.rund3(-xm);
        var r = { K: K, xp: xp, xm: xm, xpR: xpR, xmR: xmR };
        r.vej = D.vej(s.pks);
        r.phStaerk = D.rund2d(-D.log(c));
        r.phGenvej = D.rund2d(0.5 * (s.pks - D.log(c)));
        r.phLigning = D.rund2d(-D.log(xpR));
        r.ph = r.vej === 0 ? r.phStaerk : (r.vej === 2 ? r.phGenvej : r.phLigning);
        /* Modellen uden afrunding: omdannelsesgraden og luppen */
        var xs = D.oxonium(D.ksFraPks(s.pks), c);
        r.alfa = 100 * xs / c;
        r.iLup = Math.round(r.alfa);
        return r;
    };

    /* =====================================================================
       Fane 1: Skemaet. Tre middelstaerke syrer. Eleven skriver rækkerne
       Start, Ændring og Ligevægt, saetter dem ind i Kₛ, loeser ligningen
       med CAS, forkaster den negative loesning og finder pH. Den foerste
       syre er bogens eksempel og har ogsaa spoergsmaalet om x.
       ===================================================================== */
    D.SKEMA_SYRER = [
        { id: "hcooh", c: 0.0100, ct: "0,0100", medX: true },
        { id: "h3po4", c: 0.100, ct: "0,100" },
        { id: "maelk", c: 0.0500, ct: "0,0500" }
    ];
    D.SKEMA_FAERDIG = "Alle tre syrer er regnet med skemaet.";

    /* =====================================================================
       Fane 2: Vælg vejen. Seks syrer. Eleven vælger fremgangsmåden ud fra
       pKₛ og regner pH. De to middelstaerke er valgt, saa genvejen giver
       et maerkbart forkert tal (omdannelsesgraden over 20 %).
       ===================================================================== */
    D.VEJ_SYRER = [
        { id: "hno3", c: 0.025, ct: "0,025" },
        { id: "eddike", c: 0.100, ct: "0,100" },
        { id: "hf", c: 0.0100, ct: "0,0100" },
        { id: "nh4", c: 0.100, ct: "0,100", kilde: "ammoniumchlorid" },
        { id: "hcl", c: 0.0050, ct: "0,0050" },
        { id: "hcooh", c: 0.00100, ct: "0,00100" }
    ];
    D.VEJ_FAERDIG = "Alle seks syrer er regnet.";
    D.VEJE = ["Stærk syre: pH = −log cₛ", "Middelstærk syre: løs ligningen", "Svag syre: genvejen"];
    D.VEJ_TITEL = ["Stærk syre: [H_3O^+] = c_s", "Middelstærk syre: løs ligningen", "Svag syre: genvejen"];

    /* =====================================================================
       Fane 3: Baser og salte (afsnit B6.6). Fire baser.
       ===================================================================== */
    D.BASER = [
        { id: "naoh", navn: "natriumhydroxid", formel: "NaOH", c: 0.020, ct: "0,020", staerk: true, nOH: 1,
          reak: ["NaOH(s) → Na^+(aq) + OH^-(aq)"], trin: ["oh", "poh", "ph"] },
        { id: "caoh2", navn: "calciumhydroxid", formel: "Ca(OH)_2", c: 0.0050, ct: "0,0050", staerk: true, nOH: 2,
          reak: ["Ca(OH)_2(s) → Ca^{2+}(aq) + 2 OH^-(aq)"], trin: ["oh", "poh", "ph"] },
        { id: "nh3", navn: "ammoniak", formel: "NH_3", c: 0.0500, ct: "0,0500", pkb: 4.75,
          reak: ["NH_3(aq) + H_2O(l) ⇌ NH_4^+(aq) + OH^-(aq)"], trin: ["vejb", "poh", "ph"] },
        { id: "ethanoat", navn: "natriumethanoat", formel: "CH_3COONa", c: 0.0500, ct: "0,0500", pks: 4.76, salt: true,
          reak: ["CH_3COONa(s) → Na^+(aq) + CH_3COO^-(aq)"],
          reakBase: "CH_3COO^-(aq) + H_2O(l) ⇌ CH_3COOH(aq) + OH^-(aq)", trin: ["ion", "pkb", "poh", "ph"] }
    ];
    D.BASE_FAERDIG = "Alle fire baser er regnet.";

    D.baseTal = function (b) {
        var r = {};
        if (b.staerk) {
            r.oh = b.nOH * b.c;
            r.poh = D.rund2d(-D.log(r.oh));
        } else {
            r.pkb = b.pkb !== undefined ? b.pkb : D.rund2d(14 - b.pks);
            r.poh = D.rund2d(0.5 * (r.pkb - D.log(b.c)));
            r.pohStaerk = D.rund2d(-D.log(b.c));
            if (b.pks !== undefined) r.pohPks = D.rund2d(0.5 * (b.pks - D.log(b.c)));
        }
        r.ph = D.rund2d(14 - r.poh);
        return r;
    };

    /* ----- Tal og formler som tekst --------------------------------------------- */
    D.tal = function (v) { return String(v).replace("-", "−").replace(".", ","); };
    /* To decimaler, altid: 1,60 og 12,00 */
    D.d2 = function (v) { return D.rund2d(v).toFixed(2).replace(".", ",").replace("-", "−"); };
    D.tal1 = function (v) { return (Math.round(v * 10) / 10).toFixed(1).replace(".", ",").replace("-", "−"); };
    /* Tabellens pKₛ som i bogen: −7, −1,4, 4,76 */
    D.tal2 = function (v) {
        var r = Math.round(v * 100) / 100;
        var s = Math.abs(r - Math.round(r)) < 1e-9 ? String(Math.round(r)) :
                (Math.abs(r * 10 - Math.round(r * 10)) < 1e-9 ? r.toFixed(1) : r.toFixed(2));
        return s.replace(".", ",").replace("-", "−");
    };
    /* Omdannelsesgraden: én decimal under 10 %, ellers hele procent */
    D.procent = function (v) { return v < 10 ? D.tal1(v) : String(Math.round(v)); };

    D.mantisse = function (v, cifre) {
        var a = Math.abs(v), e = D.eksp(a), f = Math.pow(10, cifre - 1);
        var m = Math.round(a / Math.pow(10, e) * f * (1 + 1e-12)) / f;
        if (m >= 10) { m /= 10; e++; }
        var t = m.toFixed(cifre - 1);
        return { m: m, e: e, t: (v < 0 ? "−" : "") + t.replace(".", ",") };
    };
    /* En potens med unicode: 1,25 · 10⁻³ */
    D.potensU = function (v, cifre) {
        var m = D.mantisse(v, cifre || 3);
        return m.t + " · 10" + NK.haevet(m.e);
    };
    /* Samme potens til laerredet: 1,25 · 10^{-3} */
    D.potensC = function (v, cifre) {
        var m = D.mantisse(v, cifre || 3);
        return m.t + " · 10^{" + m.e + "}";
    };

    /* "CH_3COO^-" -> "CH₃COO⁻" (c_b og pK_b bliver staaende, D.sub tager dem) */
    D.u = function (s) {
        return String(s).replace(/_\{([^}]*)\}|_([0-9]+)/g, function (m, a, b) { return NK.saenket(a || b); })
            .replace(/\^\{([^}]*)\}|\^([0-9+\-]+)/g, function (m, a, b) { return NK.haevet(a || b); })
            .replace(/_s\b/g, "ₛ")
            .replace(/-/g, "−");
    };

    /* Saenkede og haevede tegn som HTML: unicode-saenkede (₀-₉, ₛ), unicode-
       haevede (⁰-⁹, ⁺, ⁻), ^{...} og c_b, K_b, pK_b */
    var SAENKET = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
                    "ₙ": "n", "ₛ": "s", "ᵢ": "i", "ₒ": "o" };
    var HAEVET = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "−" };
    D.sub = function (html) {
        return String(html)
            .replace(/\^\{([^}]*)\}/g, "<sup>$1</sup>")
            .replace(/\b(c|K|pK)_b\b/g, "$1<sub>b</sub>")
            .replace(/[₀-₉ₙₛᵢₒ]+/g, function (m) { return "<sub>" + m.split("").map(function (c) { return SAENKET[c]; }).join("") + "</sub>"; })
            .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+/g, function (m) { return "<sup>" + m.split("").map(function (c) { return HAEVET[c]; }).join("") + "</sup>"; })
            /* En potens og en enhed deles ikke over to linjer: 1,7 · 10⁻⁵ M */
            .replace(/(\d) · 10/g, "$1 · 10")
            .replace(/(\d|<\/sup>) (M|%)(?![A-Za-zÆØÅæøå])/g, "$1 $2");
    };

    /* ----- Elevens tal ------------------------------------------------------------
       tolk("4,17") -> 4.17. Godtager komma og punktum, − og -, mellemrum, M
       og et tal i potensform: 4,17·10^-3, 4,17e-3, 4,17*10⁻³. */
    D.tolk = function (tekst) {
        var t = NK.ascii(tekst || "").replace(/\s+/g, "").replace(/M$/, "").replace(/,/g, ".").replace(/[·×x*]/g, "*");
        if (!t) return NaN;
        /* Potensform kraever et gangetegn foran 10, ellers bliver 0,0100 laest
           som 0,0 · 10⁰ */
        var m = /^([-+]?\d*\.?\d+)\*10\^?\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return parseFloat(m[1]) * Math.pow(10, parseInt(m[2], 10));
        m = /^10\^?\(?([-+]?\d+)\)?$/.exec(t);
        if (m) return Math.pow(10, parseInt(m[1], 10));
        if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN;
        return parseFloat(t);
    };

    D.naer = function (a, b, rel) { return isFinite(a) && b !== 0 && Math.abs(a - b) <= Math.abs(b) * rel; };
    D.naerA = function (a, b, tol) { return isFinite(a) && isFinite(b) && Math.abs(a - b) <= tol; };

    /* ----- Udtryk med x (som sb2.4): "0,0100 − x", "x²", "x·x", "(x)^2" ------------- */
    var HAEV = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };
    var SAENK = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9" };

    function normaliser(raa) {
        var s = String(raa || "");
        s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (m) {
            var r = "";
            for (var i = 0; i < m.length; i++) r += HAEV[m.charAt(i)];
            return "^(" + r + ")";
        });
        s = s.replace(/[₀-₉]/g, function (c) { return SAENK[c]; });
        s = s.replace(/[−–—‐]/g, "-").replace(/[·×∙•⋅]/g, "*").replace(/÷/g, "/");
        /* Enhederne M og mol/L springes over */
        s = s.replace(/mol\s*\/\s*[lL]/g, " ");
        s = s.replace(/M(\s*\^\s*(\(\s*[-+]?\s*\d+\s*\)|[-+]?\s*\d+))?/g, " ");
        return s.replace(/,/g, ".");
    }

    function tokens(s) {
        var ud = [], i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (/\s/.test(c)) { i++; continue; }
            var m = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
            if (m) { ud.push({ t: "tal", v: parseFloat(m[0]) }); i += m[0].length; continue; }
            if (/[a-zA-ZæøåÆØÅ]/.test(c)) { ud.push({ t: "var", v: c.toLowerCase() }); i++; continue; }
            if ("+-*/^()".indexOf(c) >= 0) { ud.push({ t: c }); i++; continue; }
            return { fejl: "Tegnet " + c + " kan ikke bruges her." };
        }
        return { liste: ud };
    }

    function parser(liste) {
        var p = 0;
        function se() { return liste[p]; }
        function tag() { return liste[p++]; }
        function udtryk() {
            var v = led();
            while (se() && (se().t === "+" || se().t === "-")) {
                var op = tag().t;
                v = { op: op, a: v, b: led() };
            }
            return v;
        }
        function led() {
            var v = faktor();
            for (;;) {
                var n = se();
                if (!n) break;
                if (n.t === "*" || n.t === "/") { tag(); v = { op: n.t, a: v, b: faktor() }; }
                else if (n.t === "tal" || n.t === "var" || n.t === "(") v = { op: "*", a: v, b: faktor() };
                else break;
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
            if (se() && se().t === "^") { tag(); return { op: "^", a: g, b: faktor() }; }
            return g;
        }
        function atom() {
            var n = tag();
            if (!n) throw new Error("slut");
            if (n.t === "tal") return { tal: n.v };
            if (n.t === "var") return { v: n.v };
            if (n.t === "(") {
                var u = udtryk(), l = tag();
                if (!l || l.t !== ")") throw new Error("parentes");
                return u;
            }
            throw new Error("tegn");
        }
        try {
            if (!liste.length) return { tom: true };
            var r = udtryk();
            if (p < liste.length) return { fejl: liste[p].t === ")" ? "Der er en slutparentes for meget." : "Udtrykket kan ikke læses. Tjek tegnene." };
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

    /* Svar: { tom } eller { fejl } eller { ok, f(x), vars, konst } */
    D.udtryk = function (raa) {
        var s = normaliser(raa);
        if (!s.trim()) return { tom: true };
        if (/[\[\]]/.test(s)) return { fejl: "Skriv uden firkantede parenteser." };
        var t = tokens(s);
        if (t.fejl) return { fejl: t.fejl };
        var r = parser(t.liste);
        if (r.tom) return { tom: true };
        if (!r.ok) return r;
        var vars = Object.keys(variable(r.ast, {})), ast = r.ast;
        return { ok: true, vars: vars, konst: !vars.length,
                 f: function (x) { var env = {}; vars.forEach(function (v) { env[v] = x; }); return regn(ast, env); } };
    };

    /* To funktioner af x er ens, naar de giver det samme for seks x-vaerdier */
    var PROEVER = [0.00137, 0.00419, 0.0133, 0.0261, 0.0543, 0.0711];
    D.samme = function (f, g) {
        for (var i = 0; i < PROEVER.length; i++) {
            var a = f(PROEVER[i]), b = g(PROEVER[i]);
            if (!isFinite(a) || !isFinite(b)) return false;
            if (Math.abs(a - b) > 1e-9 + 1e-5 * Math.max(Math.abs(a), Math.abs(b))) return false;
        }
        return true;
    };

    NK.Data = D;
}());

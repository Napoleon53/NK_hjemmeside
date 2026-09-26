/* =====================================================================
   regner.js - lommeregneren i panelet

   Den foerste linje er det, eleven har tastet, paa én linje som paa en
   TI: −log(5,0·10^(−3)). Den anden linje er det samme, som lommeregneren
   har laest det: eksponenten haevet, en broek med broekstreg, og
   parenteser, den selv har lukket, blege. Saa kan man se, om 10⁻¹² kom
   op i naevneren eller ej. Efter = staar resultatet med 10 cifre.

   Maple-feltet (knappen Maple) viser det samme udtryk som Maple-kode
   (−log10(5.0*10^(−3));) med roedt input og blaat resultat som i Maple.
   Er der ingen kommatal i udtrykket, regner Maple eksakt; det siger
   feltet saa i stedet for et tal.

   Tasterne er tokens: cifrene, ",", "+", "−", "·", "/", "^", "(", ")",
   "log(", "10^(" og "Ans". Parseren laver et udtrykstrae, som baade
   regnes, tegnes paa linje 2 og skrives som Maple-kode. Manglende
   ")" lukkes til sidst, som paa en TI; et hul, hvor der mangler et tal,
   tegnes som □.

   Lommeregneren er faelles for de tre faner; app.js flytter den ind i
   den aktive fanes panel. Vis tasterne (NK.Regner.demo) taster en
   beregning langsomt, én tast ad gangen, drevet af opdater(dt).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var AABNER = { "(": true, "log(": true, "10^(": true };
    var NOEGLE_MAPLE = "nk-sc7.3-maple";
    var DEMO_TAKT = 0.4;         /* sekunder pr. tast i Vis tasterne */

    function log10(x) { return Math.log(x) / Math.LN10; }
    function erCiffer(t) { return t === "," || (t && t.length === 1 && t >= "0" && t <= "9"); }
    function starterOperand(t) { return t !== undefined && (erCiffer(t) || t === "Ans" || AABNER[t] === true); }

    function Fejl(besked) { this.besked = besked; }

    /* ----- Parseren ------------------------------------------------------------ */
    /* Uparrede ")" tages ud, foer der parses, og huskes, saa de kan vises roede */
    function rens(tokens) {
        var dybde = 0, ekstra = [], ud = [];
        tokens.forEach(function (t, i) {
            if (AABNER[t]) dybde++;
            if (t === ")") {
                if (dybde === 0) { ekstra.push(i); return; }
                dybde--;
            }
            ud.push(t);
        });
        return { tokens: ud, ekstra: ekstra };
    }

    function Parser(t) { this.t = t; this.i = 0; }
    var PP = Parser.prototype;
    PP.kig = function () { return this.t[this.i]; };
    PP.tag = function () { return this.t[this.i++]; };

    function hul(efter) { return { type: "hul", efter: efter }; }

    /* + og − */
    PP.udtryk = function () {
        var a = this.led();
        while (this.kig() === "+" || this.kig() === "−") {
            var op = this.tag();
            var b = this.led();
            if (b.type === "hul") b.efter = op;
            a = { type: op === "+" ? "add" : "sub", a: a, b: b };
        }
        return a;
    };

    /* · og /, og gange uden tegn: 2(3) */
    PP.led = function () {
        var a = this.fortegn();
        for (;;) {
            var k = this.kig();
            if (k === "·" || k === "/") {
                this.tag();
                var b = this.fortegn();
                if (b.type === "hul") b.efter = k;
                a = { type: k === "·" ? "mul" : "div", a: a, b: b };
            } else if (starterOperand(k)) {
                a = { type: "mul", a: a, b: this.fortegn(), implicit: true };
            } else break;
        }
        return a;
    };

    PP.fortegn = function () {
        if (this.kig() === "−") {
            this.tag();
            var x = this.fortegn();
            if (x.type === "hul") x.efter = "−";
            return { type: "neg", x: x };
        }
        return this.potens();
    };

    PP.potens = function () {
        var a = this.primaer();
        if (this.kig() === "^") {
            this.tag();
            var e = this.fortegn();
            if (e.type === "hul") e.efter = "^";
            return { type: "pow", a: a, b: e };
        }
        return a;
    };

    PP.primaer = function () {
        var k = this.kig();
        if (k === undefined) return hul();
        if (erCiffer(k)) {
            var tekst = "";
            while (erCiffer(this.kig())) tekst += this.tag();
            var n = { type: "tal", tekst: tekst };
            var kommaer = tekst.split(",").length - 1;
            if (kommaer > 1) n.fejl = "Der er to kommaer i ét tal.";
            else if (tekst === ",") n.fejl = "Et komma uden tal.";
            n.v = parseFloat((tekst.charAt(0) === "," ? "0" : "") + tekst.replace(",", "."));
            return n;
        }
        if (k === "Ans") { this.tag(); return { type: "ans" }; }
        if (AABNER[k]) {
            this.tag();
            var x = (this.kig() === ")" || this.kig() === undefined) ? hul(k) : this.udtryk();
            var lukket = false;
            if (this.kig() === ")") { this.tag(); lukket = true; }
            var type = k === "(" ? "grp" : (k === "log(" ? "log" : "tipot");
            return { type: type, x: x, lukket: lukket };
        }
        return hul();       /* et regnetegn, hvor der skulle staa et tal */
    };

    function parse(tokens) {
        var r = rens(tokens);
        if (!r.tokens.length) return { tom: true, ekstra: r.ekstra };
        var p = new Parser(r.tokens);
        var ast = p.udtryk();
        return { ast: ast, ekstra: r.ekstra, rest: p.i < r.tokens.length };
    }

    /* ----- Regning --------------------------------------------------------------- */
    function hulBesked(n) {
        switch (n.efter) {
            case "log(": return "Der mangler et tal inde i log( ).";
            case "10^(": return "Der mangler en eksponent efter 10^(.";
            case "(": return "Parentesen er tom.";
            case "^": return "Der mangler en eksponent efter ^.";
            case undefined: return "Der mangler et tal.";
            default: return "Der mangler et tal efter " + n.efter + ".";
        }
    }

    function regn(n, ans) {
        var a, b;
        switch (n.type) {
            case "tal":
                if (n.fejl) throw new Fejl(n.fejl);
                return n.v;
            case "ans":
                if (ans === null || ans === undefined) throw new Fejl("Der er intet svar i Ans endnu. Tryk = først.");
                return ans;
            case "hul": throw new Fejl(hulBesked(n));
            case "neg": return -regn(n.x, ans);
            case "grp": return regn(n.x, ans);
            case "add": return regn(n.a, ans) + regn(n.b, ans);
            case "sub": return regn(n.a, ans) - regn(n.b, ans);
            case "mul": return regn(n.a, ans) * regn(n.b, ans);
            case "div":
                a = regn(n.a, ans);
                b = regn(n.b, ans);
                if (b === 0) throw new Fejl("Man kan ikke dele med 0.");
                return a / b;
            case "pow":
                a = regn(n.a, ans);
                b = regn(n.b, ans);
                var p = Math.pow(a, b);
                if (isNaN(p)) throw new Fejl("Et negativt tal kan ikke opløftes i en brøk.");
                return p;
            case "tipot": return Math.pow(10, regn(n.x, ans));
            case "log":
                a = regn(n.x, ans);
                if (a === 0) throw new Fejl("log(0) findes ikke.");
                if (a < 0) throw new Fejl("log af et negativt tal findes ikke. Skal minusset stå foran log?");
                return log10(a);
        }
        throw new Fejl("Udtrykket kan ikke læses.");
    }

    function beregnAst(ast, ans) {
        var v = regn(ast, ans);
        if (!isFinite(v)) throw new Fejl("Tallet er for stort.");
        return v;
    }

    /* ----- Tal som tekst ------------------------------------------------------------ */
    function potensDele(v) {
        var a = Math.abs(v);
        var e = Math.floor(log10(a) + 1e-12);
        var m = Number((v / Math.pow(10, e)).toPrecision(10));
        if (Math.abs(m) >= 10) { m /= 10; e++; }
        return { m: m, e: e };
    }

    /* Som paa lommeregneren: 10 cifre, dansk komma, sma tal i potensform */
    function tiTekst(v) {
        if (v === 0) return "0";
        var a = Math.abs(v);
        if (a >= 1e-3 && a < 1e10) return String(Number(v.toPrecision(10))).replace(".", ",").replace("-", "−");
        var p = potensDele(v);
        return String(p.m).replace(".", ",").replace("-", "−") + " · 10" + NK.haevet(p.e);
    }

    /* Som i Maple: 10 cifre, punktum, sma tal i potensform (HTML) */
    function mapleTal(v) {
        if (v === 0) return "0.";
        var a = Math.abs(v);
        if (a >= 1e-5 && a < 1e10) {
            var s = String(Number(v.toPrecision(10)));
            return s.indexOf(".") < 0 && s.indexOf("e") < 0 ? s + "." : s;
        }
        var p = potensDele(v);
        var m = String(p.m);
        if (m.indexOf(".") < 0) m += ".";
        return m + " × 10<sup>" + String(p.e).replace("-", "−") + "</sup>";
    }

    /* ----- Linje 2: udtrykket, som det er laest (HTML) ----------------------------- */
    function esc(s) { return NK.html(s); }

    /* En parentes, der ogsaa er grupperet af broekstregen eller eksponenten, vises ikke */
    function strip(n) { return n.type === "grp" ? n.x : n; }

    function luk(n) { return n.lukket ? ")" : '<span class="r-auto">)</span>'; }

    function html2d(n) {
        switch (n.type) {
            case "tal": return n.fejl ? '<span class="r-fejl">' + esc(n.tekst) + "</span>" : esc(n.tekst);
            case "ans": return '<span class="r-ans">Ans</span>';
            case "hul": return '<span class="r-hul">□</span>';
            case "neg": return "−" + html2d(n.x);
            case "grp": return "(" + html2d(n.x) + luk(n);
            case "add": return html2d(n.a) + " + " + html2d(n.b);
            case "sub": return html2d(n.a) + " − " + html2d(n.b);
            case "mul": return html2d(n.a) + " · " + html2d(n.b);
            case "div":
                return '<span class="brok"><span class="brok-t">' + html2d(strip(n.a)) +
                    '</span><span class="brok-n">' + html2d(strip(n.b)) + "</span></span>";
            case "pow": return html2d(n.a) + "<sup>" + html2d(strip(n.b)) + "</sup>";
            case "tipot": return "10<sup>" + html2d(n.x) + "</sup>";
            case "log": return "log(" + html2d(n.x) + luk(n);
        }
        return "";
    }

    /* ----- Maple-koden ------------------------------------------------------------------
       Skrives ud fra traeet med de parenteser, Maple skal have, saa den
       regner det samme som lommeregneren. Ans bliver til %, Maples
       "sidste resultat". */
    var NIV = { add: 1, sub: 1, neg: 1, mul: 2, div: 2, pow: 4, tipot: 4, tal: 5, ans: 5, log: 5, hul: 5 };
    function niv(n) { return n.type === "grp" ? niv(n.x) : NIV[n.type]; }

    function mTal(tekst) {
        var t = tekst.replace(",", ".");
        if (t.charAt(0) === ".") t = "0" + t;
        return t;
    }

    function omgiv(n, mindst) {
        var s = maple(n);
        return niv(n) < mindst ? "(" + s + ")" : s;
    }

    /* Et helt tal uden fortegn kan staa alene efter ^ */
    function simpelEksponent(n) {
        n = strip(n);
        return n.type === "tal" && !n.fejl && /^[0-9]+$/.test(n.tekst);
    }

    function venstre(n) {
        /* −a·b er det samme som −(a·b), saa et fortegn til venstre kan staa frit */
        return n.type === "neg" ? maple(n) : omgiv(n, 2);
    }

    function maple(n) {
        switch (n.type) {
            case "tal": return n.fejl ? n.tekst : mTal(n.tekst);
            case "ans": return "%";
            case "hul": return "□";
            case "grp": return maple(n.x);
            case "neg": return "-" + omgiv(n.x, 2);
            case "add": return maple(n.a) + "+" + omgiv(n.b, 2);
            case "sub": return maple(n.a) + "-" + omgiv(n.b, 2);
            case "mul": return venstre(n.a) + "*" + omgiv(n.b, 3);
            case "div": return venstre(n.a) + "/" + omgiv(n.b, 3);
            case "pow": return omgiv(n.a, 5) + "^" + (simpelEksponent(n.b) ? maple(n.b) : "(" + maple(strip(n.b)) + ")");
            case "tipot": return "10^" + (simpelEksponent(n.x) ? maple(n.x) : "(" + maple(n.x) + ")");
            case "log": return "log10(" + maple(n.x) + ")";
        }
        return "";
    }

    /* Regner Maple med kommatal? Uden komma (og uden %) regner den eksakt */
    function harKommatal(n) {
        switch (n.type) {
            case "tal": return n.tekst.indexOf(",") >= 0;
            case "ans": return true;
            case "hul": return false;
            case "neg": case "grp": case "tipot": case "log": return harKommatal(n.x);
            default: return harKommatal(n.a) || harKommatal(n.b);
        }
    }

    /* Er det eksakte resultat en broek (ingen log og kun hele eksponenter)? */
    function erRational(n, ans) {
        switch (n.type) {
            case "tal": case "ans": return true;
            case "hul": return false;
            case "neg": case "grp": return erRational(n.x, ans);
            case "tipot":
                if (!erRational(n.x, ans)) return false;
                var e = regn(n.x, ans);
                return Math.abs(e - Math.round(e)) < 1e-12;
            case "pow":
                if (!erRational(n.a, ans) || !erRational(n.b, ans)) return false;
                var e2 = regn(n.b, ans);
                return Math.abs(e2 - Math.round(e2)) < 1e-12;
            case "log":
                /* log10 af en eksakt tierpotens giver et helt tal */
                if (!erRational(n.x, ans)) return false;
                var l = log10(regn(n.x, ans));
                return Math.abs(l - Math.round(l)) < 1e-9;
            default: return erRational(n.a, ans) && erRational(n.b, ans);
        }
    }

    /* v som broek p/q (kaedebroek) */
    function broek(v) {
        var fortegn = v < 0 ? -1 : 1, x = Math.abs(v);
        var h1 = 1, h0 = 0, k1 = 0, k0 = 1, b = x;
        for (var i = 0; i < 40; i++) {
            var a = Math.floor(b);
            var h2 = a * h1 + h0, k2 = a * k1 + k0;
            h0 = h1; h1 = h2; k0 = k1; k1 = k2;
            if (Math.abs(x - h1 / k1) <= 1e-12 * Math.max(1, x) || k1 > 1e15) break;
            b = 1 / (b - a);
            if (!isFinite(b)) break;
        }
        return { p: fortegn * h1, q: k1 };
    }

    /* Maples svar som HTML, og en note, naar det ikke er et kommatal */
    function mapleSvar(ast, v, ans) {
        if (harKommatal(ast)) return { ud: mapleTal(v), note: "" };
        var note = "Uden komma regner Maple eksakt. Skriv fx 5.0 i stedet for 5, eller pak det ind i evalf( ).";
        if (!erRational(ast, ans)) {
            return { ud: '<span class="r-eksakt">et eksakt udtryk med ln</span>', note: note };
        }
        if (Math.abs(v - Math.round(v)) < 1e-9 && Math.abs(v) < 1e15) return { ud: String(Math.round(v)), note: "" };
        var f = broek(v);
        return {
            ud: (f.p < 0 ? "−" : "") + '<span class="brok"><span class="brok-t">' + Math.abs(f.p) + '</span><span class="brok-n">' + f.q + "</span></span>",
            note: note
        };
    }

    /* ----- Tekst til tokens (til elevens svar og selvtesten) ---------------------------- */
    var HAEVET = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "−", "⁺": "" };

    function tilTokens(tekst) {
        var s = String(tekst || "");
        var ud = [];
        var i = 0;
        while (i < s.length) {
            var c = s.charAt(i);
            if (HAEVET[c] !== undefined) {
                /* 10⁻⁴: haevede tegn er en eksponent */
                var e = "";
                while (i < s.length && HAEVET[s.charAt(i)] !== undefined) { e += HAEVET[s.charAt(i)]; i++; }
                ud.push("^", "(");
                e.split("").forEach(function (x) { ud.push(x); });
                ud.push(")");
                continue;
            }
            if (/\s/.test(c)) { i++; continue; }
            if (c >= "0" && c <= "9") { ud.push(c); i++; continue; }
            if (c === "," || c === ".") { ud.push(","); i++; continue; }
            if (c === "+") { ud.push("+"); i++; continue; }
            if (c === "-" || c === "−" || c === "–") { ud.push("−"); i++; continue; }
            if (c === "*" || c === "·" || c === "×" || c === "⋅") { ud.push("·"); i++; continue; }
            if (c === "/" || c === ":" || c === "÷") { ud.push("/"); i++; continue; }
            if (c === "^" || c === "(" || c === ")") { ud.push(c); i++; continue; }
            var rest = s.slice(i).toLowerCase();
            if (rest.indexOf("log10(") === 0) { ud.push("log("); i += 6; continue; }
            if (rest.indexOf("log(") === 0) { ud.push("log("); i += 4; continue; }
            if (rest.indexOf("ans") === 0) { ud.push("Ans"); i += 3; continue; }
            if ((c === "e" || c === "E") && ud.length && erCiffer(ud[ud.length - 1])) {
                /* 3,8e-4 */
                ud.push("·", "10^(");
                i++;
                if (s.charAt(i) === "-" || s.charAt(i) === "−" || s.charAt(i) === "+") { if (s.charAt(i) !== "+") ud.push("−"); i++; }
                while (i < s.length && s.charAt(i) >= "0" && s.charAt(i) <= "9") { ud.push(s.charAt(i)); i++; }
                ud.push(")");
                continue;
            }
            return null;
        }
        return ud;
    }

    /* ----- Selve lommeregneren -------------------------------------------------------- */
    var R = {
        tokens: [],
        markoer: 0,
        ans: null,
        resultat: null,
        faerdig: false,
        fejl: null,
        mapleTil: false,
        demoKoe: null,
        demoUr: 0,
        demoEfter: null,
        lys: [],
        naarResultat: null,       /* app.js: kaldes med tallet efter = */
        naarTast: null            /* app.js: kaldes ved hver tast fra eleven */
    };

    R.parse = parse;
    R.regn = function (ast, ans) { return beregnAst(ast, ans === undefined ? null : ans); };
    R.html2d = html2d;
    R.maple = function (ast) { return maple(ast); };
    R.tilTokens = tilTokens;
    R.tiTekst = tiTekst;
    R.mapleTal = mapleTal;
    R.mapleSvar = function (ast, v, ans) { return mapleSvar(ast, v, ans === undefined ? null : ans); };

    /* Et tal fra en tekst, eller null, hvis det ikke kan laeses */
    R.vaerdi = function (tekst) {
        var t = tilTokens(tekst);
        if (!t || !t.length) return null;
        var p = parse(t);
        if (p.tom || p.ekstra.length || p.rest) return null;
        try { return beregnAst(p.ast, null); } catch (e) { return null; }
    };

    /* Maple-koden til en tekst (selvtesten og hintene bruger den) */
    R.mapleAf = function (tekst) {
        var p = parse(tilTokens(tekst) || []);
        return p.tom ? "" : maple(p.ast);
    };

    R.el = function (id) { return NK.el("r-" + id); };

    R.start = function () {
        var mig = this;
        this.boks = NK.el("regner");
        var taster = this.boks.querySelectorAll("[data-t]");
        for (var i = 0; i < taster.length; i++) {
            (function (k) {
                /* Tasterne tager ikke fokus: et felt, man skriver i, beholder det */
                k.addEventListener("mousedown", function (e) { e.preventDefault(); });
                k.addEventListener("click", function () { mig.tryk(k.getAttribute("data-t")); });
            }(taster[i]));
        }
        this.el("maple").addEventListener("mousedown", function (e) { e.preventDefault(); });
        this.el("maple").addEventListener("click", function () { mig.visMaple(!mig.mapleTil); });
        this.el("tastet").addEventListener("mousedown", function (e) {
            var s = e.target.closest ? e.target.closest("[data-i]") : null;
            if (!s) return;
            mig.stopDemo();
            mig.markoer = parseInt(s.getAttribute("data-i"), 10) + 1;
            mig.faerdig = false;
            mig.vis();
        });
        this.visMaple(!!NK.hent(NOEGLE_MAPLE, false), true);
        this.vis();
    };

    /* Flyt lommeregneren ind i en fanes panel */
    R.flyt = function (plads) {
        if (plads && this.boks && this.boks.parentNode !== plads) plads.appendChild(this.boks);
    };

    R.visMaple = function (til, udenGem) {
        this.mapleTil = !!til;
        if (!udenGem) NK.gem(NOEGLE_MAPLE, this.mapleTil);
        document.body.classList.toggle("maple-til", this.mapleTil);
        var k = this.el("maple");
        if (k) {
            k.setAttribute("aria-pressed", this.mapleTil ? "true" : "false");
            k.classList.toggle("til", this.mapleTil);
        }
        this.vis();
    };

    /* Én tast. fraDemo: Vis tasterne trykker selv */
    R.tryk = function (t, fraDemo) {
        if (!fraDemo) {
            if (this.demoKoe) this.stopDemo();
            if (this.naarTast) this.naarTast(t);
        }
        this.lysOp(t);
        switch (t) {
            case "AC":
                this.tokens = [];
                this.markoer = 0;
                this.resultat = null;
                this.fejl = null;
                this.faerdig = false;
                break;
            case "⌫":
                if (this.faerdig) { this.faerdig = false; this.resultat = null; }
                this.fejl = null;
                if (this.markoer > 0) {
                    this.tokens.splice(this.markoer - 1, 1);
                    this.markoer--;
                }
                break;
            case "◀":
                this.faerdig = false;
                this.resultat = null;
                this.markoer = Math.max(0, this.markoer - 1);
                break;
            case "▶":
                this.faerdig = false;
                this.resultat = null;
                this.markoer = Math.min(this.tokens.length, this.markoer + 1);
                break;
            case "start":
                this.markoer = 0;
                break;
            case "slut":
                this.markoer = this.tokens.length;
                break;
            case "=":
                this.beregn();
                break;
            default:
                if (this.faerdig) {
                    /* Efter =: et regnetegn regner videre med Ans, alt andet starter forfra.
                       Minus starter forfra, for her begynder mange udtryk med −log. */
                    this.faerdig = false;
                    this.resultat = null;
                    if (t === "·" || t === "/" || t === "+" || t === "^") { this.tokens = ["Ans"]; this.markoer = 1; }
                    else { this.tokens = []; this.markoer = 0; }
                }
                this.fejl = null;
                this.tokens.splice(this.markoer, 0, t);
                this.markoer++;
        }
        this.vis();
    };

    R.beregn = function () {
        var p = parse(this.tokens);
        this.resultat = null;
        if (p.tom) { this.fejl = null; return; }
        if (p.ekstra.length) { this.fejl = "Der er en ) for meget."; return; }
        try {
            var v = beregnAst(p.ast, this.ans);
            this.sidsteAns = this.ans;
            this.resultat = v;
            this.ans = v;
            this.faerdig = true;
            this.fejl = null;
            this.markoer = this.tokens.length;
            if (this.naarResultat) this.naarResultat(v);
        } catch (e) {
            this.fejl = e.besked || "Udtrykket kan ikke regnes.";
        }
    };

    /* Tasterne fra tastaturet. true: tasten er brugt */
    R.tast = function (e) {
        var k = e.key;
        var t = null;
        if (/^[0-9]$/.test(k)) t = k;
        else if (k === "," || k === "." || k === "Decimal") t = ",";
        else if (k === "+") t = "+";
        else if (k === "-" || k === "−") t = "−";
        else if (k === "*") t = "·";
        else if (k === "/" || k === ":") t = "/";
        else if (k === "^") t = "^";
        else if (k === "(" || k === ")") t = k;
        else if (k === "l" || k === "L") t = "log(";
        else if (k === "a" || k === "A") t = "Ans";
        else if (k === "Enter" || k === "=") t = "=";
        else if (k === "Backspace") t = "⌫";
        else if (k === "Delete") t = "AC";
        else if (k === "ArrowLeft") t = "◀";
        else if (k === "ArrowRight") t = "▶";
        else if (k === "Home") t = "start";
        else if (k === "End") t = "slut";
        else if (k === "m" || k === "M") { this.visMaple(!this.mapleTil); return true; }
        if (!t) return false;
        this.tryk(t);
        return true;
    };

    /* ----- Vis tasterne --------------------------------------------------------------- */
    R.demo = function (taster, efter) {
        this.stopDemo();
        this.demoKoe = ["AC"].concat(taster, ["="]);
        this.demoUr = 0.25;
        this.demoEfter = efter || null;
        if (this.boks) this.boks.classList.add("demo");
    };

    R.stopDemo = function () {
        this.demoKoe = null;
        this.demoEfter = null;
        if (this.boks) this.boks.classList.remove("demo");
    };

    R.iDemo = function () { return !!this.demoKoe; };

    R.lysOp = function (t) {
        if (!this.boks) return;
        var k = this.boks.querySelector('[data-t="' + t + '"]');
        if (!k) return;
        k.classList.add("trykket");
        this.lys.push({ k: k, ur: 0.22 });
    };

    R.opdater = function (dt) {
        for (var i = this.lys.length - 1; i >= 0; i--) {
            this.lys[i].ur -= dt;
            if (this.lys[i].ur <= 0) { this.lys[i].k.classList.remove("trykket"); this.lys.splice(i, 1); }
        }
        if (!this.demoKoe) return;
        this.demoUr -= dt;
        if (this.demoUr > 0) return;
        var t = this.demoKoe.shift();
        this.tryk(t, true);
        this.demoUr = DEMO_TAKT;
        if (!this.demoKoe.length) {
            var efter = this.demoEfter;
            this.stopDemo();
            if (efter) efter();
        }
    };

    /* Alle tasterne i demoen paa én gang (selvtesten) */
    R.spolDemo = function () {
        var n = 0;
        while (this.demoKoe && n++ < 200) { this.demoUr = 0; this.opdater(0); }
    };

    /* ----- Visningen -------------------------------------------------------------------- */
    function tokenTekst(t) { return t; }

    R.vis = function () {
        if (!this.boks) return;
        var r = rens(this.tokens);
        var ekstra = {};
        r.ekstra.forEach(function (i) { ekstra[i] = true; });

        /* Linje 1: det tastede, med markoeren */
        var html = "";
        for (var i = 0; i <= this.tokens.length; i++) {
            if (i === this.markoer && !this.faerdig) html += '<span class="r-mark"></span>';
            if (i === this.tokens.length) break;
            var t = this.tokens[i];
            html += '<span data-i="' + i + '"' + (ekstra[i] ? ' class="r-fejl"' : (t === "Ans" ? ' class="r-ans"' : "")) + ">" +
                esc(tokenTekst(t)) + "</span>";
        }
        if (!this.tokens.length) html = '<span class="r-mark"></span><span class="r-tom">tast et udtryk</span>';
        NK.saetHTML("r-tastet", html);

        /* Linje 2: som lommeregneren har laest det */
        var p = parse(this.tokens);
        var tolk = "", res = "";
        if (!p.tom) {
            tolk = html2d(p.ast);
            if (this.resultat !== null) res = '<span class="r-lig">=</span>' + esc(tiTekst(this.resultat));
        }
        NK.saetHTML("r-udtryk", tolk);
        NK.saetHTML("r-res", res);
        NK.el("r-laest").classList.toggle("tom", !!p.tom);
        NK.saetTekst("r-besked", this.fejl || "");

        /* Maple */
        var mInd = "", mUd = "", mNote = "";
        if (!p.tom) {
            mInd = esc(maple(p.ast)) + ";";
            if (this.resultat !== null) {
                var ms = mapleSvar(p.ast, this.resultat, this.sidsteAns);
                mUd = ms.ud;
                mNote = ms.note;
                if (/%/.test(mInd)) mNote = (mNote ? mNote + " " : "") + "% er det sidste resultat i Maple, som Ans.";
            } else if (this.fejl) {
                mUd = '<span class="r-mfejl">Error</span>';
            }
        }
        NK.saetHTML("r-mapleind", mInd || '<span class="r-tom">…</span>');
        NK.saetHTML("r-mapleud", mUd);
        NK.saetTekst("r-maplenote", mNote);
    };

    NK.Regner = R;
}());

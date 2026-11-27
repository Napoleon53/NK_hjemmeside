/* =====================================================================
   ord.js - fagordene som tekst: sammenligning, stavning og saet

   NK.Ord.norm laver det, eleven skriver, om til en form, hvor store og
   smaa bogstaver, mellemrum, bindestreger og skraastreger er ligegyldige,
   og hvor ae, oe og aa er det samme som æ, ø og å (H₂O og H2O ens).
   Graeske bogstaver kan skrives som navnet eller som bogstavet (alfa-helix
   og a-helix).

   NK.Ord.find afgoer, hvilken forklaring et svar passer til. En lille
   stavefejl godtages (et bogstav i ord paa 5 til 9 tegn, to fra 10 tegn),
   men aldrig, naar svaret er lige saa taet paa et andet fagord i saettet:
   alken er ikke en stavefejl for alkan.

   NK.Ord.fraTekst laeser et saet i Quizlets format (fagord, tabulator og
   forklaring, en linje pr. fagord), det samme som Kort og godt og
   Kemibogens link bruger. Lodret streg og semikolon deler ogsaa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};
    var O = NK.Ord = {};

    O.MINDST = 4;
    O.MAKS = 300;
    O.MAKS_ORD = 60;
    O.MAKS_TEKST = 220;

    var SMAA = {
        "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
        "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9",
        "₊": "+", "⁺": "+", "₋": "-", "⁻": "-", "−": "-", "–": "-", "—": "-"
    };
    var GRAESK = {
        "α": ["alfa", "a"], "β": ["beta", "b"], "γ": ["gamma", "g"], "δ": ["delta", "d"],
        "π": ["pi", "p"], "σ": ["sigma", "s"], "µ": ["mikro", "u"], "μ": ["mikro", "u"],
        "λ": ["lambda", "l"], "ω": ["omega", "o"]
    };
    var BOGSTAVER = [["æ", "ae"], ["ø", "oe"], ["å", "aa"], ["é", "e"], ["è", "e"], ["ö", "oe"],
                     ["ä", "ae"], ["ü", "u"], ["’", "'"], ["´", "'"]];

    function grund(s) {
        s = String(s || "").toLowerCase();
        s = s.replace(/[₀-₉⁰¹²³⁴-⁹₊₋⁺⁻−–—]/g, function (c) { return SMAA[c] || c; });
        BOGSTAVER.forEach(function (p) { s = s.split(p[0]).join(p[1]); });
        return s;
    }
    function graesk(s, hvilken) {
        Object.keys(GRAESK).forEach(function (g) { s = s.split(g).join(GRAESK[g][hvilken]); });
        return s;
    }
    function kun(s) { return s.replace(/[^a-z0-9+]/g, ""); }

    O.norm = function (skrevet) { return kun(graesk(grund(skrevet), 0)); };

    /* De former, et fagord kan skrives paa. */
    O.former = function (fagord) {
        var s = grund(fagord);
        var ud = [kun(graesk(s, 0)), kun(graesk(s, 1))];
        return ud.filter(function (f, i) { return f && ud.indexOf(f) === i; });
    };

    /* Afstanden mellem to ord: indsat, slettet, skiftet eller to bogstaver,
       der har byttet plads, taeller hver én. */
    O.afstand = function (a, b) {
        var n = a.length, m = b.length, i, j;
        if (!n) return m;
        if (!m) return n;
        var d = [];
        for (i = 0; i <= n; i++) { d[i] = [i]; }
        for (j = 0; j <= m; j++) { d[0][j] = j; }
        for (i = 1; i <= n; i++) {
            for (j = 1; j <= m; j++) {
                var c = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
                d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
                if (i > 1 && j > 1 && a.charAt(i - 1) === b.charAt(j - 2) && a.charAt(i - 2) === b.charAt(j - 1)) {
                    d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
                }
            }
        }
        return d[n][m];
    };

    /* Hvor mange fejl et ord af denne laengde maa have. */
    O.graense = function (laengde) { return laengde >= 10 ? 2 : (laengde >= 5 ? 1 : 0); };

    function naermest(t, former) {
        var bedst = Infinity;
        former.forEach(function (f) {
            var d = O.afstand(t, f);
            if (d < bedst) bedst = d;
        });
        return bedst;
    }

    /* skrevet: elevens tekst. mulige: de fagord, svaret kan passe til (indeks i
       saettet). former: alle fagords former (O.former), indeks som saettet.
       Giver { i, naesten } eller null. */
    O.find = function (skrevet, mulige, former) {
        var t = O.norm(skrevet);
        if (!t || !mulige.length) return null;
        var k, i;
        for (k = 0; k < mulige.length; k++) {
            if (former[mulige[k]].indexOf(t) >= 0) return { i: mulige[k], naesten: false };
        }
        for (i = 0; i < former.length; i++) {
            if (former[i].indexOf(t) >= 0) return null;         // et andet fagord i saettet
        }
        var bedst = null, bedstD = Infinity;
        mulige.forEach(function (m) {
            former[m].forEach(function (f) {
                var d = O.afstand(t, f);
                if (d <= O.graense(f.length) && d < bedstD) { bedstD = d; bedst = m; }
            });
        });
        if (bedst === null) return null;
        for (i = 0; i < former.length; i++) {
            if (i === bedst) continue;
            if (naermest(t, former[i]) <= bedstD) return null;   // lige saa taet paa et andet fagord
        }
        return { i: bedst, naesten: true };
    };

    /* Hjaelpen halvvejs nede: foerste bogstav i hvert ord og en streg for
       hvert af de andre. Ord paa et eller to bogstaver faar kun streger. */
    O.skelet = function (fagord) {
        return String(fagord).split(" ").map(function (del) {
            var bogstaver = (del.match(/[\p{L}\p{N}₀-₉⁰¹²³⁴-⁹]/gu) || []).length;
            var foerste = bogstaver > 2;
            return del.replace(/[\p{L}\p{N}₀-₉⁰¹²³⁴-⁹]/gu, function (c) {
                if (foerste) { foerste = false; return c; }
                return "_";
            });
        }).join("   ");
    };

    O.bland = function (liste, rnd) {
        rnd = rnd || Math.random;
        var a = liste.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(rnd() * (i + 1));
            var x = a[i]; a[i] = a[j]; a[j] = x;
        }
        return a;
    };

    /* ----- Saet som tekst ------------------------------------------------ */
    var HOVED = /^(sæt|saet|titel)\s*:\s*([^\t]*)$/i;
    var SIDER = /^(sider|side)\s*:/i;

    function deler(linje) {
        if (linje.indexOf("\t") >= 0) return "\t";
        if (linje.indexOf("|") >= 0) return "|";
        if (linje.indexOf(";") >= 0) return ";";
        return null;
    }

    /* Giver { navn, ord: [{ ord, tekst }], fejl: [tekst] }. */
    O.fraTekst = function (tekst) {
        var navn = "", ord = [], fejl = [], set = {};
        String(tekst || "").replace(/\r/g, "").split("\n").forEach(function (raa, nr) {
            var l = raa.replace(/(^|\s)\/\/.*$/, "$1").trim();
            var m;
            if (!l) return;
            if ((m = HOVED.exec(l))) { navn = m[2].trim(); return; }
            if (SIDER.test(l)) return;
            var d = deler(l);
            if (!d) { fejl.push("Linje " + (nr + 1) + ": der mangler et tabulatortegn eller | mellem fagord og forklaring."); return; }
            var p = l.indexOf(d);
            var a = l.slice(0, p).trim(), b = l.slice(p + 1).trim();
            if (!a || !b) { fejl.push("Linje " + (nr + 1) + ": fagordet eller forklaringen mangler."); return; }
            if (a.length > O.MAKS_ORD) { fejl.push("Linje " + (nr + 1) + ": fagordet er over " + O.MAKS_ORD + " tegn."); return; }
            if (b.length > O.MAKS_TEKST) { fejl.push("Linje " + (nr + 1) + ": forklaringen er over " + O.MAKS_TEKST + " tegn."); return; }
            var n = O.norm(a);
            if (!n) { fejl.push("Linje " + (nr + 1) + ": fagordet har ingen bogstaver."); return; }
            if (set[n]) { fejl.push("Linje " + (nr + 1) + ": \"" + a + "\" står også på linje " + set[n] + "."); return; }
            set[n] = nr + 1;
            ord.push({ ord: a, tekst: b });
        });
        if (ord.length > O.MAKS) {
            fejl.push("Der er " + ord.length + " fagord. Der er plads til " + O.MAKS + ".");
            ord = ord.slice(0, O.MAKS);
        }
        return { navn: navn, ord: ord, fejl: fejl };
    };

    /* Linket: index.html#kort=<teksten i base64>, som Kort og godt. */
    O.tilLink = function (tekst) {
        var b = window.btoa(unescape(encodeURIComponent(String(tekst))));
        return b.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    };
    O.fraLink = function (kode) {
        try {
            var b = String(kode).replace(/-/g, "+").replace(/_/g, "/");
            while (b.length % 4) b += "=";
            return decodeURIComponent(escape(window.atob(b)));
        } catch (e) {
            return null;
        }
    };

    /* Et kort tal for et saet (rekorden hoerer til saettet). */
    O.aftryk = function (tekst) {
        var h = 2166136261;
        for (var i = 0; i < tekst.length; i++) {
            h ^= tekst.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h.toString(36);
    };
}());

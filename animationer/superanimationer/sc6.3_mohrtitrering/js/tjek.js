/* =====================================================================
   tjek.js - tjek af det, eleven skriver: aflaesningen af buretten paa
   fane 1 og de fire regnetrin paa fane 2

   Et forkert tal faar en besked, der passer til fejlen: mL i stedet for
   L, divideret i stedet for ganget, molarmassen for chlorid, soelvnitrat
   eller soelvchlorid i stedet for natriumchlorid, broekdelen uden 100 %
   og saa videre.

   Svarene er { ok, besked, note, tom }. Et tal er rigtigt, naar det
   hoejst er 1 % fra facit, saa afrunding til tre betydende cifre ogsaa
   er rigtigt. Mellem 1 og 4 % faar eleven besked om at regne med flere
   cifre.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var T = {};
    var TOL = 0.01;

    /* ----- Tallet, eleven har skrevet ----------------------------------------
       "10,65", "10.65", "10,65 mL", "0,0005325", "5,325e-4", "5,325·10^-4",
       "5,325 * 10^-4", "5,325 x 10⁻⁴" og "0,5325 mmol" er tal. Giver { v }
       eller null. */
    var HAEVET = /10\s*\^?\s*([⁻⁺]?[⁰¹²³⁴⁵⁶⁷⁸⁹]+)/;
    T.tal = function (raa) {
        var s = String(raa || "");
        var h = s.match(HAEVET);
        if (h) s = s.replace(HAEVET, "10^" + NK.ascii(h[1]));
        s = NK.ascii(s).replace(/\s+/g, "");
        var faktor = 1;
        if (/mmol$/i.test(s)) { faktor = 1e-3; s = s.replace(/mmol$/i, ""); }
        s = s.replace(/(ml|mol|g|%|l|m)$/i, "");
        s = s.replace(/[·×x*X]/g, "*").replace(/−/g, "-");
        var m = s.match(/^([-+]?\d*(?:[.,]\d+)?)(?:\*10\^?([-+]?\d+)|[eE]([-+]?\d+))?$/);
        if (!m || !/\d/.test(m[1])) return null;
        var foran = parseFloat(m[1].replace(",", "."));
        var e = m[2] !== undefined ? m[2] : m[3];
        var v = e !== undefined ? foran * Math.pow(10, parseInt(e, 10)) : foran;
        return { v: v * faktor, foran: foran, potens: e !== undefined };
    };

    function naer(a, b, tol) {
        if (b === 0) return Math.abs(a) < 1e-12;
        return Math.abs(a - b) <= Math.abs(b) * (tol === undefined ? TOL : tol);
    }
    T.naer = naer;

    /* Er tallet facit med kommaet flyttet 1-4 pladser? */
    function kommaFlyttet(v, facit) {
        for (var k = 1; k <= 4; k++) {
            var f = Math.pow(10, k);
            if (naer(v, facit * f) || naer(v, facit / f)) return true;
        }
        return false;
    }

    function tjekTom(raa, hvad) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv " + hvad + "." };
        return null;
    }

    /* ----- Fane 1: aflaesningen ---------------------------------------------------
       v: det, buretten viser (mL). Rigtigt inden for tol mL. */
    T.aflaesning = function (raa, v, tol) {
        var t0 = tjekTom(raa, "rumfanget i mL");
        if (t0) return t0;
        var t = T.tal(raa);
        if (!t) return { besked: "Skriv et tal, fx 10,65." };
        var x = t.v;
        tol = tol === undefined ? 0.05 : tol;
        if (Math.abs(x - v) <= tol + 1e-9) return { ok: true };
        if (Math.abs(x - v / 1000) <= (tol + 1e-9) / 1000) return { besked: "Det er rumfanget i liter. Skriv det i mL her." };
        if (Math.abs(x - (K.BURET - v)) <= 0.15) return { besked: "Buretten tæller oppefra. 0 står øverst, så tallet ved menisken er forbruget." };
        if (Math.abs(x - v) <= 0.25) return { besked: "Tæt på. Se på bunden af menisken, og tæl de korte streger: hver er 0,1 mL." };
        if (Math.abs(Math.abs(x - v) - 1) <= 0.1) return { besked: "Tjek de hele mL. De står ved de lange streger." };
        return { besked: "Aflæs tallet ved bunden af menisken i luppen." };
    };

    /* ----- Fane 2: de fire regnetrin -----------------------------------------------
       o: opgaven med V (mL), c (M), m (g) og facit: nb, ns, ms, pct */
    T.trin = function (id, raa, o) {
        var hvad = { nb: "stofmængden i mol", ns: "stofmængden i mol", ms: "massen i gram", pct: "masseprocenten" }[id];
        var t0 = tjekTom(raa, hvad);
        if (t0) return t0;
        var t = T.tal(raa);
        if (!t) return { besked: id === "pct" ? "Skriv et tal, fx 3,11." : "Skriv et tal, fx 5,33 · 10^-4 eller 0,000533." };
        var v = t.v, f = o.facit;
        if (id === "nb") return nSoelv(v, o, f);
        if (id === "ns") return nSalt(v, o, f);
        if (id === "ms") return mSalt(v, o, f);
        return procent(v, o, f);
    };

    function taetPaa(v, facit) {
        return naer(v, facit, 0.04);
    }

    function nSoelv(v, o, f) {
        var n = f.nb, V = o.V, c = o.c;
        if (naer(v, n)) return { ok: true };
        if (naer(v, c * V)) return { besked: "Rumfanget skal være i liter: " + K.mL(V) + " mL = " + NK.betydende(V / 1000, 4) + " L." };
        if (naer(v, V / c) || naer(v, V / c / 1000) || naer(v, c / V) || naer(v, c / (V / 1000))) {
            return { besked: "Du har divideret. n = c · V." };
        }
        if (naer(v, V) || naer(v, V / 1000)) return { besked: "Det er rumfanget. Gang det med koncentrationen." };
        if (naer(v, c)) return { besked: "Det er koncentrationen. Gang den med rumfanget i liter." };
        if (kommaFlyttet(v, n)) return { besked: "Tjek omregningen fra mL til L: 1 mL = 0,001 L." };
        if (taetPaa(v, n)) return { besked: "Tæt på. Regn med alle cifrene: " + K.c(c) + " M · " + NK.betydende(V / 1000, 4) + " L." };
        return { besked: "n = c · V med rumfanget i liter." };
    }

    function nSalt(v, o, f) {
        var n = f.ns;
        if (naer(v, n)) return { ok: true };
        if (naer(v, n / 2) || naer(v, n * 2)) return { besked: "Der står 1 foran både Ag⁺ og Cl⁻ i skemaet, og hver NaCl giver én Cl⁻. Forholdet er 1 : 1." };
        if (naer(v, n * K.M_NACL) || naer(v, n * K.M_CL) || naer(v, n * K.M_AGNO3)) return { besked: "Det er en masse. Her skal du bruge stofmængden." };
        if (kommaFlyttet(v, n)) return { besked: "Tjek potensen. Stofmængden er den samme som i trinnet før." };
        if (taetPaa(v, n)) return { besked: "Tæt på. Det er præcis den samme stofmængde som n(Ag⁺)." };
        return { besked: "Én Ag⁺ reagerer med én Cl⁻. Hvor mange mol Ag⁺ fandt du?" };
    }

    function mSalt(v, o, f) {
        var n = f.ns, m = f.ms;
        if (naer(v, m)) return { ok: true };
        if (naer(v, n * K.M_CL)) return { besked: "35,45 g/mol er molarmassen for chlorid. Her skal du bruge natriumchlorids, 58,44 g/mol." };
        if (naer(v, n * K.M_AGNO3)) return { besked: "169,87 g/mol er molarmassen for sølvnitrat. Her skal du bruge natriumchlorids, 58,44 g/mol." };
        if (naer(v, n * K.M_AGCL)) return { besked: "143,32 g/mol er molarmassen for sølvchlorid. Her skal du bruge natriumchlorids, 58,44 g/mol." };
        if (naer(v, n / K.M_NACL) || naer(v, K.M_NACL / n)) return { besked: "Du har divideret. m = n · M." };
        if (naer(v, o.m)) return { besked: "Det er hele prøvens masse. Her er det kun natriumchloridet." };
        if (naer(v, n)) return { besked: "Det er stofmængden. Gang den med molarmassen." };
        if (kommaFlyttet(v, m)) return { besked: "Tjek kommaet. Tallet er for " + (v > m ? "stort." : "lille.") };
        if (taetPaa(v, m)) return { besked: "Tæt på. Regn med alle cifrene: " + K.mol(n) + " mol · 58,44 g/mol." };
        return { besked: "m = n · M. Gang stofmængden med 58,44 g/mol." };
    }

    function procent(v, o, f) {
        var p = f.pct, ms = f.ms, mp = o.m;
        if (naer(v, p)) return { ok: true };
        if (naer(v, p / 100)) return { besked: "Det er brøkdelen. Gang med 100 % for at få procent." };
        if (naer(v, mp / ms * 100) || naer(v, mp / ms)) return { besked: "Du har divideret den forkerte vej. Saltets masse skal stå øverst i brøken." };
        if (naer(v, ms * 100)) return { besked: "Del også med prøvens masse, " + NK.tal2(mp) + " g." };
        if (kommaFlyttet(v, p)) return { besked: "Tjek kommaet. Havvand er nogle få procent salt." };
        if (taetPaa(v, p)) return { besked: "Tæt på. Regn med alle cifrene: " + K.gram(ms) + " g / " + NK.tal2(mp) + " g · 100 %." };
        return { besked: "m% = m(NaCl) / m(prøve) · 100 %." };
    }

    /* ----- Fane 2: formlen foer tallet -----------------------------------------------
       Eleven skriver formlen, fx "c · V", "n = c*V", "n(Ag⁺) = c(AgNO₃) · V(AgNO₃)"
       eller "m(NaCl)/m(prøve)*100%". Formlen goeres ens: haevede og saenkede
       tegn bliver almindelige, gangetegn og mellemrum forsvinder, og
       (Ag⁺), (AgNO₃), (soelvnitrat) bliver til _b, (NaCl), (Cl⁻), (salt) til
       _s og (prøve), (havvand) til _p. Store og smaa bogstaver er
       ligegyldige, undtagen M (molarmasse) og m (masse). En omskrevet formel
       (c = n / V, n = m / M) er rigtig, men eleven faar den isoleret at se. */
    function normFormel(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅*]/g, "").replace(/−/g, "-").replace(/%/g, "");
        s = s.replace(/\((ag\+?|agno3|sølvnitrat|soelvnitrat|solvnitrat|b)\)/gi, "_b");
        s = s.replace(/\((nacl|cl-?|salt|natriumchlorid|chlorid|s)\)/gi, "_s");
        s = s.replace(/\((prøve|proeve|prove|p|havvand|havvandet)\)/gi, "_p");
        s = s.replace(/m_?(prøve|proeve|prove|havvand)/gi, "m_p");
        s = s.split("").map(function (c) { return c === "M" ? "M" : c.toLowerCase(); }).join("");
        s = s.replace(/[()]/g, "");
        var dele = s.split("=");
        return dele.length >= 2 ? { v: dele[0], h: dele[1] } : { v: "", h: s };
    }
    T.normFormel = normFormel;

    var FORMLER = {
        nb: { rigtig: /^(c(_b)?v(_b)?|v(_b)?c(_b)?)(\/1000)?$/,
              omskrevet: [[/^c(_b)?$/, /^n(_b)?\/v(_b)?$/], [/^v(_b)?$/, /^n(_b)?\/c(_b)?$/]],
              fejl: [[/^(c(_b)?\/v(_b)?|v(_b)?\/c(_b)?)$/, "Stofmængden er koncentration gange rumfang, ikke divideret."],
                     [/^m(_b)?\/M(_b)?$/, "Den formel bruges, når man kender massen. Her kender du koncentration og rumfang."]] },
        ns: { rigtig: /^(n_b|c(_b)?v(_b)?|v(_b)?c(_b)?)$/,
              omskrevet: [[/^n_b$/, /^n(_s)?$/]],
              fejl: [[/^n$/, "Skriv hvilken stofmængde: n(Ag⁺)."],
                     [/^n_s$/, "n(Cl⁻) er det samme som n(NaCl). Hvilken stofmængde fandt du i trinnet før?"],
                     [/(^2|2$|\/2)/, "Der står 1 foran både Ag⁺ og Cl⁻ i skemaet. Forholdet er 1 : 1."],
                     [/^m/, "Her skal du finde stofmængden, ikke massen."]] },
        ms: { rigtig: /^(n(_s)?M(_s)?|M(_s)?n(_s)?)$/,
              omskrevet: [[/^n(_s)?$/, /^m(_s)?\/M(_s)?$/], [/^M(_s)?$/, /^m(_s)?\/n(_s)?$/]],
              fejl: [[/^(n(_s)?\/M(_s)?|M(_s)?\/n(_s)?)$/, "Massen er stofmængde gange molarmasse, ikke divideret."],
                     [/^(cv|vc|c_bv_b|v_bc_b)$/, "Stofmængden fandt du i trinnet før. Her skal den bruges til massen."]] },
        pct: { rigtig: /^(m(_s)?\/m_p100|100m(_s)?\/m_p|m(_s)?100\/m_p)$/,
               omskrevet: [],
               fejl: [[/^m(_s)?\/m_p$/, "Det giver brøkdelen. Gang med 100 % for at få procent."],
                      [/^(m_p\/m(_s)?(100)?|100m_p\/m(_s)?)$/, "Saltets masse skal stå øverst i brøken."],
                      [/^m(_s)?\/m(_s)?100$/, "Skriv, hvilke masser der deles: m(NaCl) og m(prøve)."]] }
    };

    T.formel = function (id, raa) {
        if (!String(raa || "").trim()) return { tom: true, besked: "Skriv formlen, før du regner." };
        var f = normFormel(raa), F = FORMLER[id];
        if (/^[\d.,e^+-]+$/.test(f.h.replace(/\//g, ""))) return { besked: "Skriv formlen med symboler først. Tallene kommer i næste felt." };
        if (F.rigtig.test(f.h)) return { ok: true };
        for (var i = 0; i < F.omskrevet.length; i++) {
            if (F.omskrevet[i][0].test(f.v) && F.omskrevet[i][1].test(f.h)) return { ok: true, note: "Rigtig sammenhæng. Isoleret ser den sådan ud:" };
        }
        for (i = 0; i < F.fejl.length; i++) {
            if (F.fejl[i][0].test(f.h)) return { besked: F.fejl[i][1] };
        }
        return { besked: "Den formel passer ikke her. Tryk på Giv hint, hvis du sidder fast." };
    };

    NK.Tjek = T;
}());

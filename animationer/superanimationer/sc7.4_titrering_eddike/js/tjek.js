/* =====================================================================
   tjek.js - tjek af det, eleven skriver: aflaesningen af buretten paa
   fane 1 og de fire regnetrin paa fane 2

   Et forkert tal faar en besked, der passer til fejlen: mL i stedet for
   L, divideret i stedet for ganget, NaOH's molarmasse, broekdelen uden
   100 % og saa videre.

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
       "14,15", "14.15", "14,15 mL", "0,001415", "1,415e-3", "1,415·10^-3",
       "1,415 * 10^-3", "1,415 x 10⁻³" og "1,415 mmol" er tal. Giver { v }
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
        if (!t) return { besked: "Skriv et tal, fx 14,35." };
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
        if (!t) return { besked: id === "pct" ? "Skriv et tal, fx 4,72." : "Skriv et tal, fx 1,42 · 10^-3 eller 0,00142." };
        var v = t.v, f = o.facit;
        if (id === "nb") return nBase(v, o, f);
        if (id === "ns") return nSyre(v, o, f);
        if (id === "ms") return mSyre(v, o, f);
        return procent(v, o, f);
    };

    function taetPaa(v, facit) {
        return naer(v, facit, 0.04);
    }

    function nBase(v, o, f) {
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

    function nSyre(v, o, f) {
        var n = f.ns;
        if (naer(v, n)) return { ok: true };
        if (naer(v, n / 2) || naer(v, n * 2)) return { besked: "Der står 1 foran både CH₃COOH og OH⁻ i skemaet. Forholdet er 1 : 1." };
        if (naer(v, n * K.M_SYRE) || naer(v, n * K.M_NAOH)) return { besked: "Det er en masse. Her skal du bruge stofmængden." };
        if (kommaFlyttet(v, n)) return { besked: "Tjek potensen. Stofmængden er den samme som i trinnet før." };
        if (taetPaa(v, n)) return { besked: "Tæt på. Det er præcis den samme stofmængde som n(NaOH)." };
        return { besked: "Én OH⁻ reagerer med én CH₃COOH. Hvor mange mol NaOH fandt du?" };
    }

    function mSyre(v, o, f) {
        var n = f.ns, m = f.ms;
        if (naer(v, m)) return { ok: true };
        if (naer(v, n * K.M_NAOH)) return { besked: "40,00 g/mol er molarmassen for NaOH. Her skal du bruge eddikesyrens, 60,05 g/mol." };
        if (naer(v, n / K.M_SYRE) || naer(v, K.M_SYRE / n)) return { besked: "Du har divideret. m = n · M." };
        if (naer(v, o.m)) return { besked: "Det er hele prøvens masse. Her er det kun eddikesyren." };
        if (naer(v, n)) return { besked: "Det er stofmængden. Gang den med molarmassen." };
        if (kommaFlyttet(v, m)) return { besked: "Tjek kommaet. Tallet er for " + (v > m ? "stort." : "lille.") };
        if (taetPaa(v, m)) return { besked: "Tæt på. Regn med alle cifrene: " + K.mol(n) + " mol · 60,05 g/mol." };
        return { besked: "m = n · M. Gang stofmængden med 60,05 g/mol." };
    }

    function procent(v, o, f) {
        var p = f.pct, ms = f.ms, mp = o.m;
        if (naer(v, p)) return { ok: true };
        if (naer(v, p / 100)) return { besked: "Det er brøkdelen. Gang med 100 % for at få procent." };
        if (naer(v, mp / ms * 100) || naer(v, mp / ms)) return { besked: "Du har divideret den forkerte vej. Syrens masse skal stå øverst i brøken." };
        if (naer(v, ms * 100)) return { besked: "Del også med prøvens masse, " + NK.tal2(mp) + " g." };
        if (kommaFlyttet(v, p)) return { besked: "Tjek kommaet. Eddike er typisk nogle få procent syre." };
        if (taetPaa(v, p)) return { besked: "Tæt på. Regn med alle cifrene: " + K.gram(ms) + " g / " + NK.tal2(mp) + " g · 100 %." };
        return { besked: "m% = m(CH₃COOH) / m(prøve) · 100 %." };
    }

    /* ----- Fane 2: formlen foer tallet -----------------------------------------------
       Eleven skriver formlen, fx "c · V", "n = c*V", "n(NaOH) = c(NaOH) · V(NaOH)"
       eller "m(syre)/m(prøve)*100%". Formlen goeres ens: haevede og saenkede
       tegn bliver almindelige, gangetegn og mellemrum forsvinder, og
       (NaOH), (base) bliver til _b, (CH₃COOH), (syre) til _s og (prøve) til
       _p. Store og smaa bogstaver er ligegyldige, undtagen M (molarmasse)
       og m (masse). En omskrevet formel (c = n / V, n = m / M) er rigtig,
       men eleven faar den isoleret at se. */
    function normFormel(raa) {
        var s = NK.ascii(String(raa || "")).replace(/\s+/g, "");
        s = s.replace(/[·×∙•⋅*]/g, "").replace(/−/g, "-").replace(/%/g, "");
        s = s.replace(/\((naoh|base|b|oh-?)\)/gi, "_b");
        s = s.replace(/\((ch3cooh|syre|s|eddikesyre|hac)\)/gi, "_s");
        s = s.replace(/\((prøve|proeve|prove|p|eddike|eddiken)\)/gi, "_p");
        s = s.replace(/m_?(prøve|proeve|prove)/gi, "m_p");
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
              fejl: [[/^n$/, "Skriv hvilken stofmængde: n(NaOH)."],
                     [/(^2|2$|\/2)/, "Der står 1 foran både CH₃COOH og OH⁻ i skemaet. Forholdet er 1 : 1."],
                     [/^m/, "Her skal du finde stofmængden, ikke massen."]] },
        ms: { rigtig: /^(n(_s)?M(_s)?|M(_s)?n(_s)?)$/,
              omskrevet: [[/^n(_s)?$/, /^m(_s)?\/M(_s)?$/], [/^M(_s)?$/, /^m(_s)?\/n(_s)?$/]],
              fejl: [[/^(n(_s)?\/M(_s)?|M(_s)?\/n(_s)?)$/, "Massen er stofmængde gange molarmasse, ikke divideret."],
                     [/^(cv|vc|c_bv_b|v_bc_b)$/, "Stofmængden fandt du i trinnet før. Her skal den bruges til massen."]] },
        pct: { rigtig: /^(m(_s)?\/m_p100|100m(_s)?\/m_p|m(_s)?100\/m_p)$/,
               omskrevet: [],
               fejl: [[/^m(_s)?\/m_p$/, "Det giver brøkdelen. Gang med 100 % for at få procent."],
                      [/^(m_p\/m(_s)?(100)?|100m_p\/m(_s)?)$/, "Syrens masse skal stå øverst i brøken."],
                      [/^m(_s)?\/m(_s)?100$/, "Skriv, hvilke masser der deles: m(CH₃COOH) og m(prøve)."]] }
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

/* =====================================================================
   stof.js - stoffer, oploesninger og reaktioner

   En oploesning beskrives med stofmaengder i µmol og volumen i mL, saa
   µmol/mL er det samme som mM:
     { V, T, n: { stof: µmol, ... } }
   Fast stof (bundfald og pulver, der endnu ikke er oploest) ligger i
   samme n under sit eget navn med fase "s".

   Stofferne registreres med NK.Stof.def:
     NK.Stof.def("Cu2+", { formel: "Cu", q: 2, farve: { r: 60, g: 140, b: 220 }, k: 0.02 });
     formel   formlen uden ladning; ladningen bygges med ladningHaevet,
              saa ±1 bliver + og −, aldrig 1+ og 1−
     q        ladning
     fase     "aq" (standard), "s" fast, "l" vaeske
     farve    farven i oploesning eller som fast stof (null = farveloes)
     k        farvestyrke pr. mM pr. enhed vejlaengde (0 = farveloes)
     navn     dansk navn til beskeder

   Reaktionerne registreres med NK.Stof.reaktion:
     { id, venstre: [[1, "Ag+"], [1, "Cl-"]], hoejre: [[1, "AgCl(s)"]], slags, K, fart }
     slags    "fuld"       loeber til den ene side er brugt op
              "ligevaegt"  indstiller sig efter K (mM-enheder)
              "faeld"      bundfald: ioner fra venstre faelder som det
                           faste stof paa hoejre, til ionproduktet er K
                           (oploselighedsproduktet i mM); bundfaldet
                           oploeses igen, hvis produktet falder under K
              "oploes"     fast stof paa venstre oploeses til hoejre
     fart     hastighed i 1/s (hvor hurtigt der gaas mod maalet)
   Alle reaktioner koeres i NK.Stof.skridt(o, dt). Forsoeget kan give
   sin egen liste, ellers bruges alle registrerede.

   Farven af en oploesning regnes som lysfiltre oven paa hinanden:
   hvert farvet stof svaekker de farvekanaler, det ikke selv har, med
   e^(−k·c·l). Vand er svagt blaaligt og gennemsigtigt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var STOFFER = {};
    var REAKTIONER = [];

    var VAND = { r: 200, g: 228, b: 245, a: 0.55 };

    function def(navn, e) {
        var s = {
            navn: navn,
            formel: e.formel || navn,
            q: e.q || 0,
            fase: e.fase || "aq",
            farve: e.farve || null,
            k: e.k || 0,
            dansk: e.navn || e.formel || navn,
            M: e.M || 0
        };
        STOFFER[navn] = s;
        return s;
    }

    function stof(navn) {
        if (!STOFFER[navn]) throw new Error("ukendt stof: " + navn);
        return STOFFER[navn];
    }

    /* Formlen, som den skrives paa skaermen: Cu²⁺, NO₃⁻, PbI₂ */
    function formel(navn, medFase) {
        var s = stof(navn);
        return s.formel + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    function reaktion(rx) {
        rx.slags = rx.slags || "fuld";
        rx.fart = rx.fart === undefined ? 4 : rx.fart;
        REAKTIONER.push(rx);
        return rx;
    }

    /* ----- Regnskab -------------------------------------------------------- */
    function regnskab(side) {
        var atomer = {}, q = 0;
        side.forEach(function (led) {
            var s = stof(led[1]);
            var f = s.atomer || {};
            for (var a in f) if (Object.prototype.hasOwnProperty.call(f, a)) atomer[a] = (atomer[a] || 0) + led[0] * f[a];
            q += led[0] * s.q;
        });
        return { atomer: atomer, q: q };
    }

    /* Er ladningen afstemt? (Atomerne kun, hvis stofferne har atomer) */
    function afstemt(rx) {
        var v = regnskab(rx.venstre), h = regnskab(rx.hoejre);
        if (v.q !== h.q) return false;
        var ok = true;
        Object.keys(v.atomer).concat(Object.keys(h.atomer)).forEach(function (a) {
            if ((v.atomer[a] || 0) !== (h.atomer[a] || 0)) ok = false;
        });
        return ok;
    }

    function ligning(rx, medFase) {
        function side(liste) {
            return liste.map(function (led) { return (led[0] > 1 ? led[0] + " " : "") + formel(led[1], medFase); }).join(" + ");
        }
        var pil = rx.slags === "ligevaegt" ? "⇌" : "→";
        return side(rx.venstre) + " " + pil + " " + side(rx.hoejre);
    }

    /* ----- Oploesninger ------------------------------------------------------ */
    function ny(T) {
        return { V: 0, T: T === undefined ? 20 : T, n: {} };
    }

    function kopi(o) {
        var k = ny(o.T);
        k.V = o.V;
        for (var s in o.n) if (Object.prototype.hasOwnProperty.call(o.n, s)) k.n[s] = o.n[s];
        return k;
    }

    function tilsaet(o, navn, umol) {
        stof(navn);
        o.n[navn] = (o.n[navn] || 0) + umol;
        if (o.n[navn] < 1e-9) delete o.n[navn];
    }

    /* Koncentration i mM (fast stof taelles ikke som oploest) */
    function konc(o, navn) {
        if (o.V <= 1e-9) return 0;
        return (o.n[navn] || 0) / o.V;
    }

    /* Tager mL ud af o og giver dem som en ny oploesning. Fast stof
       (bundfald) foelger med i samme forhold, som om det var ophvirvlet. */
    function del(o, mL) {
        var ud = ny(o.T);
        if (o.V <= 1e-9 || mL <= 0) return ud;
        var f = Math.min(1, mL / o.V);
        ud.V = o.V * f;
        o.V -= ud.V;
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            ud.n[s] = o.n[s] * f;
            o.n[s] -= ud.n[s];
        }
        if (f >= 1) { o.V = 0; o.n = {}; }
        return ud;
    }

    /* Blander d ind i til. Temperaturen bliver det vejede gennemsnit. */
    function bland(til, d) {
        var V = til.V + d.V;
        if (V > 1e-9) til.T = (til.T * til.V + d.T * d.V) / V;
        til.V = V;
        for (var s in d.n) if (Object.prototype.hasOwnProperty.call(d.n, s)) tilsaet(til, s, d.n[s]);
    }

    /* En oploesning fra en opskrift: { V, T, mM: { stof: mM }, umol: { stof: µmol } } */
    function lav(spec) {
        var o = ny(spec.T);
        o.V = spec.V || 0;
        var s;
        if (spec.mM) for (s in spec.mM) if (Object.prototype.hasOwnProperty.call(spec.mM, s)) tilsaet(o, s, spec.mM[s] * o.V);
        if (spec.umol) for (s in spec.umol) if (Object.prototype.hasOwnProperty.call(spec.umol, s)) tilsaet(o, s, spec.umol[s]);
        return o;
    }

    function faste(o) {
        var ud = [];
        for (var s in o.n) {
            if (Object.prototype.hasOwnProperty.call(o.n, s) && stof(s).fase === "s" && o.n[s] > 1e-6) ud.push({ navn: s, umol: o.n[s], stof: STOFFER[s] });
        }
        return ud;
    }

    function fastIalt(o) {
        return faste(o).reduce(function (sum, f) { return sum + f.umol; }, 0);
    }

    /* ----- Reaktioner ---------------------------------------------------------- */

    /* Hvor langt reaktionen kan gaa mod hoejre (positivt) og mod venstre
       (negativt), begraenset af stofmaengderne */
    function graenser(o, rx) {
        var maks = Infinity, min = -Infinity;
        rx.venstre.forEach(function (led) { maks = Math.min(maks, (o.n[led[1]] || 0) / led[0]); });
        rx.hoejre.forEach(function (led) { min = Math.max(min, -(o.n[led[1]] || 0) / led[0]); });
        return { min: Math.min(0, min), maks: Math.max(0, maks) };
    }

    function anvend(o, rx, xi) {
        if (Math.abs(xi) < 1e-12) return;
        rx.venstre.forEach(function (led) { tilsaet(o, led[1], -led[0] * xi); });
        rx.hoejre.forEach(function (led) { tilsaet(o, led[1], led[0] * xi); });
    }

    /* Reaktionsbroeken i mM, naar reaktionen er gaaet xi µmol laengere.
       Fast stof indgaar ikke (aktivitet 1). */
    function broek(o, rx, xi) {
        var V = Math.max(o.V, 1e-9);
        var t = 1, n = 1;
        rx.hoejre.forEach(function (led) {
            if (stof(led[1]).fase === "s") return;
            t *= Math.pow(Math.max(0, ((o.n[led[1]] || 0) + led[0] * xi) / V), led[0]);
        });
        rx.venstre.forEach(function (led) {
            if (stof(led[1]).fase === "s") return;
            n *= Math.pow(Math.max(0, ((o.n[led[1]] || 0) - led[0] * xi) / V), led[0]);
        });
        return { t: t, n: n };
    }

    /* Den xi, hvor reaktionsbroeken er K. t/n stiger med xi, saa der
       kan halveres. */
    function ligevaegtXi(o, rx, g) {
        var a = g.min, b = g.maks;
        if (b - a < 1e-12) return 0;
        for (var i = 0; i < 40; i++) {
            var m = (a + b) / 2;
            var q = broek(o, rx, m);
            var over = q.t >= rx.K * q.n;
            if (over) b = m; else a = m;
        }
        return (a + b) / 2;
    }

    function skridtReaktion(o, rx, dt) {
        if (o.V <= 1e-9) return;
        var g = graenser(o, rx);
        var maal = 0;
        var f = 1 - Math.exp(-rx.fart * dt);
        if (rx.slags === "fuld" || rx.slags === "oploes") {
            maal = g.maks;
            if (maal <= 1e-9) return;
            /* Fast stof oploeses med en fart, der afhaenger af maengden */
            anvend(o, rx, maal < 1e-3 ? maal : maal * f);
            return;
        }
        if (rx.slags === "ligevaegt" || rx.slags === "faeld") {
            var q = broek(o, rx, 0);
            var harFast = rx.hoejre.some(function (led) { return stof(led[1]).fase === "s" && (o.n[led[1]] || 0) > 1e-9; });
            if (rx.slags === "faeld" && q.n < rx.K && !harFast) return;
            maal = ligevaegtXi(o, rx, g);
            anvend(o, rx, Math.abs(maal) < 1e-3 ? maal : maal * f);
        }
    }

    /* Tidens gang i oploesningen: alle reaktioner (eller listen) */
    function skridt(o, dt, liste) {
        (liste || REAKTIONER).forEach(function (rx) { skridtReaktion(o, rx, dt); });
    }

    /* ----- Farve ------------------------------------------------------------- */

    /* l: vejlaengde i forhold til et reagensglas (baegerglas ca. 2) */
    function farve(o, l) {
        if (o.V <= 0.01) return null;
        l = l || 1;
        var A = { r: 0, g: 0, b: 0 }, ialt = 0;
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = STOFFER[s];
            if (!st || !st.farve || !st.k || st.fase === "s") continue;
            var a = st.k * (o.n[s] / o.V) * l;
            ialt += a;
            A.r += a * (1 - st.farve.r / 255);
            A.g += a * (1 - st.farve.g / 255);
            A.b += a * (1 - st.farve.b / 255);
        }
        return {
            r: VAND.r * Math.exp(-A.r),
            g: VAND.g * Math.exp(-A.g),
            b: VAND.b * Math.exp(-A.b),
            a: 1 - (1 - VAND.a) * Math.exp(-ialt)
        };
    }

    /* Uklarhed 0-1 fra fast stof, der svaever i vaesken */
    function uklar(o) {
        if (o.V <= 0.01) return 0;
        var m = 0;
        faste(o).forEach(function (f) { m += f.umol; });
        return 1 - Math.exp(-m / o.V * 0.08);
    }

    /* Farven af det faste stof, vejet efter maengde */
    function fastFarve(o) {
        var liste = faste(o);
        if (!liste.length) return null;
        var sum = 0, r = 0, g = 0, b = 0;
        liste.forEach(function (f) {
            var fa = f.stof.farve || { r: 230, g: 230, b: 230 };
            sum += f.umol; r += fa.r * f.umol; g += fa.g * f.umol; b += fa.b * f.umol;
        });
        return { r: r / sum, g: g / sum, b: b / sum, a: 1 };
    }

    /* Antal partikler af hver slags til zoomboblen: maengderne skaleret,
       saa den stoerste slags faar 'maks' partikler */
    function partikelTal(o, maks) {
        var ud = {}, top = 0, s;
        for (s in o.n) if (Object.prototype.hasOwnProperty.call(o.n, s) && o.n[s] > 1e-6) top = Math.max(top, o.n[s]);
        if (top <= 0) return ud;
        for (s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s) || o.n[s] <= 1e-6) continue;
            ud[s] = Math.max(1, Math.round(o.n[s] / top * (maks || 12)));
        }
        return ud;
    }

    NK.Stof = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        VAND: VAND,
        def: def,
        stof: stof,
        formel: formel,
        reaktion: reaktion,
        afstemt: afstemt,
        ligning: ligning,
        ny: ny,
        kopi: kopi,
        lav: lav,
        tilsaet: tilsaet,
        konc: konc,
        del: del,
        bland: bland,
        faste: faste,
        fastIalt: fastIalt,
        skridt: skridt,
        farve: farve,
        uklar: uklar,
        fastFarve: fastFarve,
        partikelTal: partikelTal
    };

    /* Vand kender alle forsoeg */
    def("H2O", { formel: "H₂O", q: 0, fase: "l", navn: "vand" });
}());

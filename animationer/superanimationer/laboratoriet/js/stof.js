/* =====================================================================
   stof.js - stoffer, oploesninger og reaktioner

   En oploesning beskrives med stofmaengder i µmol og volumen i mL, saa
   µmol/mL er det samme som mM:
     { V, T, n: { stof: µmol, ... }, gas: { stof: µmol } }
   Fast stof (bundfald, pulver og metal) ligger i n med fase "s". Gas,
   der dannes, flyttes til gas, som bordet toemmer og viser som bobler.
   Vand er oploesningsmidlet (fase "l") og taelles ikke i n.

   Stofferne registreres med NK.Stof.def:
     NK.Stof.def("Cu2+", { formel: "Cu", q: 2, farve: { r: 60, g: 140, b: 220 }, k: 0.02 });
     formel     formlen uden ladning; ladningen bygges med ladningHaevet,
                saa ±1 bliver + og −, aldrig 1+ og 1−
     q          ladning
     fase       "aq" (standard), "s" fast, "l" vaeske (oploesningsmiddel),
                "g" gas
     farve, k   farven og farvestyrken pr. mM pr. vejlaengde (0 = farveloes)
     korn       fast stof, der tegnes som korn (pulver, metal)
     dHfort     fortyndingsvarme i kJ/mol (negativ = varmer), fx
                koncentreret svovlsyre
     indikator  { pKa, syre: farve|null, base: farve|null }: farven
                afhaenger af pH
     navn       dansk navn til beskeder

   Reaktionerne registreres med NK.Stof.reaktion:
     { id, venstre: [[1, "Ag+"], [1, "Cl-"]], hoejre: [[1, "AgCl(s)"]], slags, K, fart, dH, betingelse }
     slags      "fuld"       loeber til den ene side er brugt op
                "ligevaegt"  indstiller sig efter K (mM-enheder)
                "faeld"      bundfald: K er oploselighedsproduktet (mM)
                "oploes"     fast stof paa venstre oploeses til hoejre
     fart       hastighed i 1/s
     dH         reaktionsvarme i kJ/mol (negativ = varmer op)
     betingelse fn(o) -> bool, fx koncentreret syre: konc(o, "HNO3") > 5000
     min        { stof: mM }: samme som betingelse, men som tabel

   Redox skrives ikke som reaktioner, men som par med standardpotentiale:
     NK.Stof.par({ ox: "Cu2+", red: "Cu(s)", e: 2, E0: 0.34 });
   Reaktionen mellem to par afledes automatisk: den staerkeste oxidant
   (hoejest E0) oxiderer den svageste reduktant, naar reduktanten er et
   fast stof. Reaktionsvarmen foelger af forskellen i E0.

   Alle reaktioner koeres i NK.Stof.skridt(o, dt). Farven af en
   oploesning regnes som lysfiltre oven paa hinanden. pH regnes af H⁺,
   som syre-base-ligevaegtene (inkl. vandets autoprotolyse) holder
   ved lige.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var STOFFER = {};
    var REAKTIONER = [];
    var PAR = [];

    var VAND = { r: 200, g: 228, b: 245, a: 0.55 };
    var VARMEKAP = 4.18;   /* J pr. mL pr. K */

    function def(navn, e) {
        var s = {
            navn: navn,
            formel: e.formel || navn,
            q: e.q || 0,
            fase: e.fase || "aq",
            farve: e.farve || null,
            k: e.k || 0,
            dansk: e.navn || e.formel || navn,
            M: e.M || 0,
            korn: !!e.korn,
            atomer: e.atomer || null,
            dHfort: e.dHfort || 0,
            /* cRef: koncentrationen (mM), som dHfort regnes fra (flaskens) */
            cRef: e.cRef || 0,
            indikator: e.indikator || null,
            /* flamme: farven, stoffet giver en flamme (flammeproeve) */
            flamme: e.flamme || null
        };
        STOFFER[navn] = s;
        return s;
    }

    function stof(navn) {
        if (!STOFFER[navn]) throw new Error("ukendt stof: " + navn);
        return STOFFER[navn];
    }

    /* Indgaar stoffet i reaktionsbroeken? Fast stof, oploesningsmiddel og
       gas har aktivitet 1 (eller er vaek). */
    function iBroek(navn) {
        return stof(navn).fase === "aq";
    }

    /* Formlen, som den skrives paa skaermen: Cu²⁺, NO₃⁻, PbI₂ */
    function formel(navn, medFase) {
        var s = stof(navn);
        return s.formel + NK.ladningHaevet(s.q) + (medFase ? "(" + s.fase + ")" : "");
    }

    /* Vandets ionprodukt i mM²: 10⁻¹⁴ M² */
    var KW = 1e-8;

    function reaktion(rx) {
        rx.slags = rx.slags || "fuld";
        rx.fart = rx.fart === undefined ? 4 : rx.fart;
        rx.dH = rx.dH || 0;
        if (rx.min && !rx.betingelse) {
            rx.betingelse = function (o) {
                for (var s in rx.min) if (Object.prototype.hasOwnProperty.call(rx.min, s) && konc(o, s) < rx.min[s]) return false;
                return true;
            };
        }
        REAKTIONER.push(rx);
        /* En syres dissociation HA ⇌ H⁺ + A⁻ faar automatisk sin udgave med
           base: HA + OH⁻ ⇌ A⁻ + H₂O, K = Ka/Kw. Ellers ville H⁺ vaere saa
           faa, at neutralisationen af en svag syre sneg sig frem. */
        var giverH = rx.slags === "ligevaegt" && !rx.afledt && rx.hoejre.some(function (l) { return l[1] === "H+" && l[0] === 1; }) && !rx.venstre.some(function (l) { return l[1] === "H2O"; });
        if (giverH) {
            reaktion({
                id: rx.id + "_base",
                venstre: rx.venstre.concat([[1, "OH-"]]),
                hoejre: rx.hoejre.filter(function (l) { return l[1] !== "H+"; }).concat([[1, "H2O"]]),
                slags: "ligevaegt", K: rx.K / KW, fart: rx.fart, dH: (rx.dH || 0) - 57, afledt: true
            });
        }
        return rx;
    }

    function gcd(a, b) { return b ? gcd(b, a % b) : a; }

    /* Et redoxpar: ox + e·e⁻ -> red. oxKoef/redKoef, hvis der er flere
       end én af hver (2 H⁺ + 2 e⁻ -> H₂). */
    function par(p) {
        p.oxKoef = p.oxKoef || 1;
        p.redKoef = p.redKoef || 1;
        PAR.forEach(function (q) { afledRedox(p, q); });
        PAR.push(p);
        return p;
    }

    /* Reaktionen mellem to par: oxidanten i det hoejeste par oxiderer
       reduktanten i det laveste, hvis reduktanten er fast stof (metal). */
    function afledRedox(a, b) {
        var hoej = a.E0 >= b.E0 ? a : b, lav = a.E0 >= b.E0 ? b : a;
        var dE = hoej.E0 - lav.E0;
        if (dE < 0.05) return;
        if (stof(lav.red).fase !== "s") return;
        var L = hoej.e * lav.e / gcd(hoej.e, lav.e);
        var kh = L / hoej.e, kl = L / lav.e;
        reaktion({
            id: "redox_" + hoej.ox + "_" + lav.red,
            venstre: [[kh * hoej.oxKoef, hoej.ox], [kl * lav.redKoef, lav.red]],
            hoejre: [[kh * hoej.redKoef, hoej.red], [kl * lav.oxKoef, lav.ox]],
            slags: "fuld",
            fart: NK.klamp(dE * 1.2, 0.15, 3),
            dH: -dE * L * 96.5,
            redox: true
        });
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
        return { V: 0, T: T === undefined ? 20 : T, n: {}, gas: {} };
    }

    function kopi(o) {
        var k = ny(o.T);
        k.V = o.V;
        for (var s in o.n) if (Object.prototype.hasOwnProperty.call(o.n, s)) k.n[s] = o.n[s];
        return k;
    }

    function tilsaet(o, navn, umol) {
        var s = stof(navn);
        if (s.fase === "l") return;
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

    /* Fortyndingsvarmen er en tilstandsfunktion af koncentrationen: n µmol
       ved c mM har afgivet -dHfort · n · (1 - c/cRef) siden flasken (cRef).
       Ved blanding frigives forskellen, saa syre i syre giver ingen varme,
       og syre haeldt i smaa portioner giver det samme som paa én gang. */
    function fortyndingsTilstand(st, n, c) {
        if (!n || !st.cRef) return 0;
        return -st.dHfort * 1000 * n * 1e-6 * (1 - Math.min(1, c / st.cRef));
    }

    /* Varmen (J), naar til og d blandes til V mL */
    function fortyndingsVarme(til, d, V) {
        var J = 0, set = {};
        [til, d].forEach(function (o) { for (var s in o.n) if (Object.prototype.hasOwnProperty.call(o.n, s)) set[s] = true; });
        for (var s in set) {
            if (!Object.prototype.hasOwnProperty.call(set, s)) continue;
            var st = STOFFER[s];
            if (!st || !st.dHfort) continue;
            var n1 = til.n[s] || 0, n2 = d.n[s] || 0;
            if (n1 + n2 <= 0 || V <= 1e-9) continue;
            var foer = fortyndingsTilstand(st, n1, til.V > 1e-9 ? n1 / til.V : st.cRef) + fortyndingsTilstand(st, n2, d.V > 1e-9 ? n2 / d.V : st.cRef);
            var efter = fortyndingsTilstand(st, n1 + n2, (n1 + n2) / V);
            J += efter - foer;
        }
        return J;
    }

    /* Blander d ind i til. Temperaturen bliver det vejede gennemsnit plus
       fortyndingsvarmen. */
    function bland(til, d) {
        var V = til.V + d.V;
        var J = fortyndingsVarme(til, d, V);
        if (V > 1e-9) til.T = (til.T * til.V + d.T * d.V) / V + J / (V * VARMEKAP);
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

    /* pH af H⁺ (eller OH⁻, hvis der ikke er H⁺). Rent vand: 7. */
    function pH(o) {
        if (o.V <= 1e-9) return null;
        var H = konc(o, "H+") / 1000, OH = konc(o, "OH-") / 1000;
        if (H > 1e-15) return NK.klamp(-Math.log(H) / Math.LN10, -1, 15);
        if (OH > 1e-15) return NK.klamp(14 + Math.log(OH) / Math.LN10, -1, 15);
        return 7;
    }

    /* Gas, der er dannet siden sidst; nulstilles */
    function tapGas(o) {
        var g = o.gas || {};
        o.gas = {};
        return g;
    }

    /* ----- Reaktioner ---------------------------------------------------------- */

    /* Hvor langt reaktionen kan gaa mod hoejre (positivt) og mod venstre
       (negativt), begraenset af stofmaengderne. Oploesningsmidlet er der
       altid; gas er vaek. */
    function graenser(o, rx) {
        var maks = Infinity, min = -Infinity;
        rx.venstre.forEach(function (led) {
            var f = stof(led[1]).fase;
            if (f === "l") return;
            maks = Math.min(maks, (o.n[led[1]] || 0) / led[0]);
        });
        rx.hoejre.forEach(function (led) {
            var f = stof(led[1]).fase;
            if (f === "l" || f === "g") { min = 0; return; }
            min = Math.max(min, -(o.n[led[1]] || 0) / led[0]);
        });
        if (min === -Infinity) min = 0;
        /* Kun oploesningsmiddel paa venstre side (autoprotolysen): et
           rigeligt, men endeligt loft, saa der kan halveres */
        if (maks === Infinity) maks = Math.max(o.V, 1e-3) * 2000;
        return { min: Math.min(0, min), maks: Math.max(0, maks) };
    }

    function anvend(o, rx, xi) {
        if (Math.abs(xi) < 1e-12) return;
        rx.venstre.forEach(function (led) { tilsaet(o, led[1], -led[0] * xi); });
        rx.hoejre.forEach(function (led) { tilsaet(o, led[1], led[0] * xi); });
        if (rx.dH && o.V > 0.05) o.T += -rx.dH * xi * 1e-3 / (o.V * VARMEKAP);
    }

    /* Reaktionsbroeken i mM, naar reaktionen er gaaet xi µmol laengere. */
    function broek(o, rx, xi) {
        var V = Math.max(o.V, 1e-9);
        var t = 1, n = 1;
        rx.hoejre.forEach(function (led) {
            if (!iBroek(led[1])) return;
            t *= Math.pow(Math.max(0, ((o.n[led[1]] || 0) + led[0] * xi) / V), led[0]);
        });
        rx.venstre.forEach(function (led) {
            if (!iBroek(led[1])) return;
            n *= Math.pow(Math.max(0, ((o.n[led[1]] || 0) - led[0] * xi) / V), led[0]);
        });
        return { t: t, n: n };
    }

    /* Den xi, hvor reaktionsbroeken er K. t/n stiger med xi, saa der
       kan halveres. For et bundfald er K oploselighedsproduktet, dvs.
       ionproduktet n alene, saa betingelsen t/n = 1/K bruges. */
    function ligevaegtXi(o, rx, g) {
        var a = g.min, b = g.maks;
        if (b - a < 1e-15) return 0;
        var K = rx.slags === "faeld" ? 1 / rx.K : rx.K;
        for (var i = 0; i < 60; i++) {
            var m = (a + b) / 2;
            var q = broek(o, rx, m);
            var over = q.t >= K * q.n;
            if (over) b = m; else a = m;
        }
        return (a + b) / 2;
    }

    function skridtReaktion(o, rx, dt) {
        if (o.V <= 1e-9) return;
        if (rx.betingelse && !rx.betingelse(o)) return;
        var g = graenser(o, rx);
        var maal = 0;
        var f = 1 - Math.exp(-rx.fart * dt);
        if (rx.slags === "fuld" || rx.slags === "oploes") {
            maal = g.maks;
            if (maal <= 1e-9) return;
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

    /* Tidens gang i oploesningen: alle reaktioner (eller listen), og gas
       forlader vaesken */
    function skridt(o, dt, liste) {
        (liste || REAKTIONER).forEach(function (rx) { skridtReaktion(o, rx, dt); });
        o.gas = o.gas || {};
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            if (STOFFER[s].fase === "g") {
                o.gas[s] = (o.gas[s] || 0) + o.n[s];
                delete o.n[s];
            }
        }
    }

    /* ----- Farve ------------------------------------------------------------- */

    /* Farven og styrken af et stof lige nu (indikatorer afhaenger af pH) */
    function farveAf(st, o, ph) {
        if (st.indikator) {
            var f = ph === null ? 0 : 1 / (1 + Math.pow(10, st.indikator.pKa - ph));
            var sy = st.indikator.syre, ba = st.indikator.base;
            if (!sy && !ba) return null;
            if (!sy) return { farve: ba, k: st.k * f };
            if (!ba) return { farve: sy, k: st.k * (1 - f) };
            return { farve: { r: NK.lerp(sy.r, ba.r, f), g: NK.lerp(sy.g, ba.g, f), b: NK.lerp(sy.b, ba.b, f) }, k: st.k };
        }
        if (!st.farve || !st.k) return null;
        return { farve: st.farve, k: st.k };
    }

    /* l: vejlaengde i forhold til et reagensglas (baegerglas ca. 2) */
    function farve(o, l) {
        if (o.V <= 0.01) return null;
        l = l || 1;
        var A = { r: 0, g: 0, b: 0 }, ialt = 0;
        var ph = pH(o);
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = STOFFER[s];
            if (!st || st.fase !== "aq") continue;
            var fa = farveAf(st, o, ph);
            if (!fa || fa.k <= 0) continue;
            var a = fa.k * (o.n[s] / o.V) * l;
            ialt += a;
            A.r += a * (1 - fa.farve.r / 255);
            A.g += a * (1 - fa.farve.g / 255);
            A.b += a * (1 - fa.farve.b / 255);
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
        faste(o).forEach(function (f) { if (!f.stof.korn) m += f.umol; });
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
       saa den stoerste slags faar 'maks' partikler. Vandets egne ioner
       (10⁻⁷ M) vises ikke. */
    function partikelTal(o, maks) {
        var ud = {}, top = 0, s;
        for (s in o.n) if (Object.prototype.hasOwnProperty.call(o.n, s) && o.n[s] > 1e-3) top = Math.max(top, o.n[s]);
        if (top <= 0) return ud;
        for (s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s) || o.n[s] <= 1e-3) continue;
            if (o.n[s] < top * 0.02) continue;
            ud[s] = Math.max(1, Math.round(o.n[s] / top * (maks || 6)));
        }
        return ud;
    }

    NK.Stof = {
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        PAR: PAR,
        VAND: VAND,
        VARMEKAP: VARMEKAP,
        KW: KW,
        def: def,
        stof: stof,
        formel: formel,
        reaktion: reaktion,
        par: par,
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
        pH: pH,
        tapGas: tapGas,
        skridt: skridt,
        farve: farve,
        uklar: uklar,
        fastFarve: fastFarve,
        partikelTal: partikelTal
    };

    /* Vand kender alle forsoeg */
    def("H2O", { formel: "H₂O", q: 0, fase: "l", navn: "vand", atomer: { H: 2, O: 1 } });
}());

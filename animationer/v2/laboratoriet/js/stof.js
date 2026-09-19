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
     farve, k   farven i oploesning og farvestyrken: absorbansen ved
                spektrets top pr. mM pr. vejlaengde (0 = farveloes)
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
            /* fare: [{ over: mM (0 for faste stoffer), maerker: [...], sig: [...] }],
               det foerste trin, hvis koncentration er naaet, gaelder */
            fare: e.fare || null,
            /* kort: forkortelsen paa kuglen i zoomboblen (legenden viser det fulde navn) */
            kort: e.kort || null,
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

    /* Det omvendte af lav(): en opskrift i ren data, som kan gemmes og
       laves om til den samme oploesning igen. Journalens oejebliksbillede
       bruger den, saa tegneserien kan tegne glasset, som det saa ud,
       dengang eleven noterede det - og ikke som det ser ud nu, efter at
       det er haeldt ud. µmol og ikke mM, saa et tomt glas med et fnug
       bundfald i ogsaa kan gemmes. */
    function opskrift(o) {
        var ud = { V: o.V, T: o.T, umol: {} };
        for (var s in o.n) {
            if (Object.prototype.hasOwnProperty.call(o.n, s) && Math.abs(o.n[s]) > 1e-12) ud.umol[s] = o.n[s];
        }
        return ud;
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
    /* ----- Ligevaegtskonstanten ved en anden temperatur ---------------------
       van 't Hoff: K(T) = K(T0) · exp(-ΔH/R · (1/T - 1/T0)).

       Tabellens K'er gaelder ved 20 °C. En exoterm reaktion (ΔH < 0) faar
       et mindre K, naar det bliver varmere, saa ligevaegten flytter mod
       venstre; en endoterm det modsatte. Det er Le Chateliers princip som
       fysik i stedet for som en regel, der skal skrives ind pr. reaktion:
       en reaktion, der allerede har et ΔH i stoftabellen, faar
       temperaturafhaengigheden gratis.

       Det gaelder ogsaa oploselighedsprodukter og vandets autoprotolyse,
       som begge vokser med temperaturen. Ved 20 °C er faktoren 1, saa
       intet aendrer sig i et forsoeg ved stuetemperatur.

       Eksponenten begraenses til ±6, saa en reaktion med et stort ΔH ikke
       giver absurde tal lige under kogepunktet.

       NK.Stof.vantHoff = false slaar det fra. */
    var T0 = 293.15;            /* 20 °C i kelvin */
    var R = 8.314;              /* J/(mol·K) */

    function Kved(rx, T) {
        if (NK.Stof.vantHoff === false || !rx.dH || typeof T !== "number") return rx.K;
        var eks = -(rx.dH * 1000) / R * (1 / (T + 273.15) - 1 / T0);
        return rx.K * Math.exp(NK.klamp(eks, -6, 6));
    }

    function ligevaegtXi(o, rx, g) {
        var a = g.min, b = g.maks;
        if (b - a < 1e-15) return 0;
        var K0 = Kved(rx, o.T);
        var K = rx.slags === "faeld" ? 1 / K0 : K0;
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
            /* Fast stof, der oploeses, har to bidrag (F34): et relativt,
               der afhaenger af, hvor meget der er tilbage (fart), og et
               konstant, der er ens for alle salte (OPLOES_K0 µmol/s). Uden
               det konstante gik den sidste rest mod nul uden at blive
               faerdig. Det er ikke kinetik, men en behagelig fart: en
               spatelspids paa 60 µmol er vaek paa omkring 6 s i stedet for
               over et halvt minut. Mere end der er, oploeses aldrig. */
            var k0 = rx.slags === "oploes" ? (NK.Stof.OPLOES_K0 || 0) * dt : 0;
            anvend(o, rx, maal < 1e-3 ? maal : Math.min(maal, maal * f + k0));
            return;
        }
        if (rx.slags === "ligevaegt" || rx.slags === "faeld") {
            var q = broek(o, rx, 0);
            var harFast = rx.hoejre.some(function (led) { return stof(led[1]).fase === "s" && (o.n[led[1]] || 0) > 1e-9; });
            if (rx.slags === "faeld" && q.n < Kved(rx, o.T) && !harFast) return;
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

    /* Oploesningens lag: hvert farvet stof med sin absorbans gennem
       lysvejen l (i reagensglas-enheder). Farverne laegges sammen som lys
       i farvemodel.js, ikke som absorbans pr. RGB-kanal: ellers gaar
       enhver blanding af to farver mod sort. */
    function lag(o, l) {
        var ud = [], ialt = 0;
        var ph = pH(o);
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = STOFFER[s];
            if (!st || st.fase !== "aq") continue;
            var fa = farveAf(st, o, ph);
            if (!fa || fa.k <= 0) continue;
            var a = fa.k * (o.n[s] / o.V) * (l || 1);
            ialt += a;
            ud.push({ sp: NK.Farvemodel.spektrum(fa.farve), A: a });
        }
        return { lag: ud, ialt: ialt };
    }

    /* Det lys, der slipper IGENNEM vaesken, mod hvidt (0-255). Det er
       farven paa hvidt papir: en vaeske er et filter, ikke et lag maling,
       og en fortyndet oploesning skal blive lysere UDEN at miste sin
       kuloer. Bruges, hvor der ses gennem vaesken mod noget lyst - fx ned
       i et glas, der staar paa hvidt papir. */
    function gennem(o, l) {
        if (!o || o.V <= 0.01) return { r: 255, g: 255, b: 255 };
        var d = lag(o, l);
        if (!d.lag.length) return { r: VAND.r, g: VAND.g, b: VAND.b };
        var c = NK.Farvemodel.lys(d.lag);
        var t = vandTone(d.ialt);
        return { r: NK.lerp(255, VAND.r, t) * c.r / 255,
                 g: NK.lerp(255, VAND.g, t) * c.g / 255,
                 b: NK.lerp(255, VAND.b, t) * c.b / 255 };
    }

    /* Hvor meget vandets egen svage blaa tone slaar igennem. Den er der,
       naar glasset er naesten rent vand, og viger, jo mere farve der er i:
       ellers ville den tage kuloeren fra enhver fortyndet oploesning og
       goere den mat - en fortyndet ligevaegtsblanding skal gaa mod
       orange og gult, ikke mod graat. */
    function vandTone(ialt) { return Math.exp(-ialt * 25); }

    /* Oploesningens farve, som den tegnes: kuloeren og hvor meget den
       daekker. l: vejlaengde i forhold til et reagensglas (baegerglas ca. 2). */
    function farve(o, l) {
        if (o.V <= 0.01) return null;
        var d = lag(o, l);
        if (!d.lag.length) return { r: VAND.r, g: VAND.g, b: VAND.b, a: VAND.a };
        var c = NK.Farvemodel.lys(d.lag);
        var t = vandTone(d.ialt);
        return {
            r: NK.lerp(255, VAND.r, t) * c.r / 255,
            g: NK.lerp(255, VAND.g, t) * c.g / 255,
            b: NK.lerp(255, VAND.b, t) * c.b / 255,
            a: 1 - (1 - VAND.a) * Math.exp(-d.ialt)
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

    /* Antal partikler af hver slags til zoomboblen. Med ref (mM) er
       skalaen fast: et stof med koncentrationen ref faar 'maks' partikler,
       saa et stof, der bliver mere af, faar flere kugler, ogsaa naar der
       samtidig kommer et stort overskud af noget andet (FeSCN2+ bliver
       flere, naar Fe(NO3)3 tilsaettes, i stedet for at forsvinde). Uden
       ref faar den stoerste slags 'maks'. Hvert synligt stof faar mindst
       én kugle og hoejst det dobbelte af maks, og der er hoejst LOFT
       kugler i alt (20): er der flere, skaleres alle ned i samme forhold,
       saa boblen ikke bliver en myretue ved hoeje koncentrationer, og
       forholdet mellem stofferne stadig kan ses. Et oploest stof under
       PARTIKEL_MIN (10⁻⁵ M) vises ikke, fx vandets egne ioner (10⁻⁷ M) i
       rent vand eller H⁺ i en neutral oploesning. Det er koncentrationen,
       der taeller, ikke stofmaengden, saa et stort vandbad er lige saa tomt
       som et lille glas vand: kun vandmolekylerne i baggrunden. En
       indikator er der lidt af, men den farver alt: altid én kugle. */
    var PARTIKEL_MIN = 0.01;   /* mM */
    var FAST_MIN = 0.5;        /* µmol: et fnug bundfald under det vises ikke */
    var LOFT = 20;             /* hoejst saa mange kugler i boblen i alt */

    /* Er der nok af stoffet til at vise det (i boblen og i tabellen)? */
    function synlig(o, s) {
        if (!Object.prototype.hasOwnProperty.call(o.n, s) || o.n[s] <= 1e-3) return false;
        var st = STOFFER[s];
        if (st && st.fase === "s") return o.n[s] >= FAST_MIN;
        if (!(o.V > 1e-9)) return true;
        return o.n[s] / o.V >= PARTIKEL_MIN || !!(st && st.indikator);
    }

    /* skjul: stofnavne, der ikke skal vises (tilskuerioner).
       loft: hoejst saa mange kugler i alt (standard LOFT) */
    function partikelTal(o, maks, skjul, ref, loft) {
        var ud = {}, top = 0, s, synlige = [], ialt = 0;
        maks = maks || 6;
        loft = loft || LOFT;
        for (s in o.n) {
            if (!synlig(o, s) || (skjul && skjul.indexOf(s) >= 0)) continue;
            synlige.push(s);
            top = Math.max(top, o.n[s]);
        }
        var fast = ref && o.V > 1e-9;
        synlige.forEach(function (s) {
            var andel = fast ? o.n[s] / o.V / ref : o.n[s] / top;
            ud[s] = NK.klamp(Math.round(andel * maks), 1, maks * 2);
            ialt += ud[s];
        });
        if (ialt > loft) skalerNed(ud, synlige, ialt, loft);
        return ud;
    }

    /* Ned til loftet i samme forhold: hver faar sin del rundet ned (mindst
       én), og resten gives til dem med den stoerste brøkdel. Er der flere
       slags end loftet, faar hver én. */
    function skalerNed(ud, navne, ialt, loft) {
        var f = loft / ialt, sum = 0, rest = [];
        navne.forEach(function (s) {
            var x = ud[s] * f;
            ud[s] = Math.max(1, Math.floor(x));
            sum += ud[s];
            rest.push({ s: s, broek: x - ud[s] });
        });
        rest.sort(function (a, b) { return b.broek - a.broek || (a.s < b.s ? -1 : 1); });
        for (var i = 0; sum < loft && i < rest.length; i++) { ud[rest[i].s]++; sum++; }
        /* Mange smaa slags, der hver fik én, kan have skubbet summen over */
        while (sum > loft) {
            var stoerst = navne.reduce(function (a, b) { return ud[b] > ud[a] ? b : a; });
            if (ud[stoerst] <= 1) break;
            ud[stoerst]--;
            sum--;
        }
    }

    /* Tilskuerioner: de ioner, der ikke tager del i nogen af de reaktioner,
       der kan ske med det, et forsoeg har at arbejde med. start: stofnavne
       i opstillingen (flaskerne, pulverglassene, glassene). Reaktionerne,
       der kan ske, findes paa papiret: en reaktion kan ske, naar alt paa
       dens venstre side er der (en ligevaegt og et bundfald ogsaa, naar
       alt paa hoejre side er der), og saa er dens produkter der ogsaa, saa
       de kan tage del i den naeste. Oploesningen af et fast stof goer ikke
       dets ioner aktive. De ioner, der kun kommer og staar, er tilskuere:
       i sb2.4 K+ og NO3-. Vand er der altid. Betingelser (fx koncentreret
       syre) regnes som opfyldt: saa hellere vise en ion for meget. */
    function tilskuerioner(start) {
        var har = { "H2O": true }, aktiv = {}, brugt = [], nyt = true;
        start.forEach(function (s) { har[s] = true; });
        function alle(side) { return side.every(function (l) { return har[l[1]]; }); }
        while (nyt) {
            nyt = false;
            REAKTIONER.forEach(function (rx, i) {
                if (brugt[i]) return;
                var begge = rx.slags === "ligevaegt" || rx.slags === "faeld";
                if (!alle(rx.venstre) && !(begge && alle(rx.hoejre))) return;
                brugt[i] = true;
                nyt = true;
                rx.venstre.concat(rx.hoejre).forEach(function (l) {
                    har[l[1]] = true;
                    if (rx.slags !== "oploes") aktiv[l[1]] = true;
                });
            });
        }
        return Object.keys(har).filter(function (s) {
            var st = STOFFER[s];
            return st && st.q && !aktiv[s];
        }).sort();
    }

    /* Det faste stofs indre, som zoomboblen viser det. Et salt er et
       iongitter med sit eget formelforhold, og forholdet staar allerede i
       stoffets oploesningsreaktion: NaCl(s) -> Na+ + Cl- giver 1:1, og
       Pb(NO3)2(s) -> Pb2+ + 2 NO3- giver 1:2. Alt andet fast stof (metaller,
       molekylestoffer) er ens byggesten, der ligger taet. Et nyt salt faar
       altsaa sit gitter af sin egen reaktion, ikke af ny kode. */
    function gitter(navn) {
        var s = STOFFER[navn];
        if (!s || s.fase !== "s") return null;
        var rx = null;
        REAKTIONER.forEach(function (r) {
            if (r.slags === "oploes" && r.venstre.length === 1 && r.venstre[0][1] === navn && r.venstre[0][0] === 1) rx = r;
        });
        if (!rx) return { molekyle: navn, titel: formel(navn, true), tekst: "Ens byggesten, der ligger tæt" };
        var dele = rx.hoejre.map(function (l) { return { navn: l[1], antal: l[0] }; });
        return {
            dele: dele, titel: formel(navn, true),
            tekst: "Iongitter: " + dele.map(function (d) { return formel(d.navn); }).join(" og ") +
                " i forholdet " + dele.map(function (d) { return d.antal; }).join(":")
        };
    }

    /* ----- Faremaerkning ------------------------------------------------------ */
    var MAERKER = ["brandfarlig", "oxiderende", "aetsende", "giftig", "sundhedsfare", "kronisk", "miljoe"];

    /* Faretrinnet for hvert stof i oploesningen, som er naaet */
    function farer(o) {
        var ud = [];
        if (!o) return ud;
        for (var s in o.n) {
            if (!Object.prototype.hasOwnProperty.call(o.n, s)) continue;
            var st = STOFFER[s];
            if (!st || !st.fare || o.n[s] <= 0.5) continue;
            var c = st.fase === "s" ? Infinity : (o.V > 1e-9 ? o.n[s] / o.V : Infinity);
            for (var i = 0; i < st.fare.length; i++) {
                if (c >= (st.fare[i].over || 0)) { ud.push({ stof: s, trin: st.fare[i] }); break; }
            }
        }
        return ud;
    }

    /* Piktogrammerne paa etiketten, i fast raekkefoelge */
    function faremaerker(o) {
        var set = {};
        farer(o).forEach(function (f) { (f.trin.maerker || []).forEach(function (m) { set[m] = true; }); });
        return MAERKER.filter(function (m) { return set[m]; });
    }

    NK.Stof = {
        MAERKER: MAERKER,
        farer: farer,
        faremaerker: faremaerker,
        STOFFER: STOFFER,
        REAKTIONER: REAKTIONER,
        PAR: PAR,
        VAND: VAND,
        VARMEKAP: VARMEKAP,
        KW: KW,
        vantHoff: true,
        Kved: Kved,
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
        opskrift: opskrift,
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
        gennem: gennem,
        uklar: uklar,
        fastFarve: fastFarve,
        partikelTal: partikelTal,
        synlig: synlig,
        tilskuerioner: tilskuerioner,
        PARTIKEL_MIN: PARTIKEL_MIN,
        PARTIKEL_LOFT: LOFT,
        /* Det konstante bidrag til oploesningen af fast stof, µmol/s (F34) */
        OPLOES_K0: 3,
        gitter: gitter
    };

    /* Vand kender alle forsoeg */
    def("H2O", { formel: "H₂O", q: 0, fase: "l", navn: "vand", atomer: { H: 2, O: 1 } });
}());

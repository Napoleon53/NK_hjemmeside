/* =====================================================================
   model.js - kemien og tallene bag forsoeget

   Stålulden opløses i syre:
     Fe(s) + 2 H⁺(aq) → Fe²⁺(aq) + H₂(g)
   Opløsningen gaar hurtigt i varm syre og meget langsomt i kold:
     d(opløst)/dt = k(T) · (1 - opløst)^(2/3)

   Fe²⁺ titreres med permanganat:
     MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O

   En draabe KMnO₄ lander som en lokal, lilla sky (lokal). Skyen blandes
   ind i opløsningen, hurtigt naar der rystes og naar der er meget Fe²⁺,
   langsomt naer endepunktet. Det, der blandes ind, reagerer straks med
   Fe²⁺. Resten bliver som frit MnO₄⁻ og farver opløsningen lyserød.

   Er der chlorid i kolben (saltsyre), oxiderer MnO₄⁻ ogsaa Cl⁻ til Cl₂:
   en del af titranten gaar til chlorid (KLOR.andel), og overskuddet
   forsvinder langsomt igen (KLOR.fald). Resultatet bliver for hoejt, og
   farven er ikke blivende.

   Resultatet regnes som i laboratoriet:
     jernindhold = 5 · c · (V(slut) - V(start)) · M(Fe) / m(ståluld) · 100 %
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Masseandelen af jern i stålulden */
    var STAALULD = { jern: 0.985, typisk: 98.5 };

    var AFVEJ = { min: 0.09, max: 0.13, stykMin: 0.012, stykMax: 0.028 };

    var M_FE = 55.85;

    var KMNO4 = { c: 0.0200 };

    var SYRER = {
        svovlsyre: { id: "svovlsyre", navn: "Svovlsyre", formel: "H₂SO₄", konc: "1 M", klorid: false },
        saltsyre:  { id: "saltsyre", navn: "Saltsyre", formel: "HCl", konc: "2 M", klorid: true }
    };

    /* mL syre, der haeldes i kolben */
    var SYRE_ML = 50;

    var OPLOES = { kKold: 0.012, kVarm: 0.3, tKold: 25, tVarm: 80, faerdig: 0.995 };

    /* Buretten: aflaesning i mL, 0 er foroven. Fyldes der, staar
       menisken lidt over nulstregen (negativ aflaesning). Foer
       startaflaesningen loeber hanen langsomt (nulFlow), saa det er let
       at ramme 0. Lukkes hanen mindre end fang mL fra nulstregen, lægger
       menisken sig paa 0,00. */
    /* Efter startaflaesningen kan hanen stilles paa langsom (flow) eller
       hurtig (hurtigFlow). */
    var BURET = { kapacitet: 50, draabe: 0.05, flow: 1.0, hurtigFlow: 4.0, nulFlow: 0.3, fyldMin: -1.6, fyldMax: -0.8, fang: 0.12 };

    /* Graenser for de fejl, eleven kan begaa. lidtStaal og megetStaal:
       masser, som laereren kommenterer. vejebaad og kolbe: hvad der
       fysisk kan vaere i dem (g og mL). kmno4IKolbe: mL, der haeldes i
       kolben, naar flasken med KMnO₄ slippes der. */
    var GRAENSE = { lidtStaal: 0.06, megetStaal: 0.16, vejebaad: 0.25, kolbe: 200, kmno4IKolbe: 8 };

    /* Blanding pr. sekund uden og med rystning. synlig: den intensitet,
       hvor en svag lyserød farve kan ses. lilla og aubergine: overskud i
       mL, hvor opløsningen er kraftigt lilla, og hvor laereren kommer.
       blivende: sekunder farven skal holde. */
    var TITRER = { blanding: 0.35, rystBlanding: 7, feFart: 6, synlig: 0.05, lilla: 0.6, aubergine: 3, blivende: 2.5 };

    var KLOR = { andel: 0.07, fald: 0.06 };

    /* Rystning med musen: fart i tegneenheder pr. sekund */
    var RYST = { fuld: 500, amok: 2600, amokTid: 0.8, skvulp: 0.04 };

    /* Kolbens vaeske: areal paa tegnebordet pr. mL */
    var KOLBE_AREAL = 21.6;

    var FARVE = {
        syre:     { r: 226, g: 236, b: 246, a: 0.22 },
        fe2:      { r: 190, g: 226, b: 160, a: 0.4 },
        fe3:      { r: 238, g: 212, b: 112, a: 0.44 },
        lyserod:  { r: 246, g: 104, b: 200, a: 0.62 },
        lilla:    { r: 128, g: 28, b: 138, a: 0.9 },
        kmno4:    { r: 96, g: 16, b: 112, a: 0.96 },
        jern:     { r: 138, g: 146, b: 156, a: 1 }
    };

    function afrund(x, d) {
        var f = Math.pow(10, d === undefined ? 2 : d);
        return Math.round(x * f) / f;
    }

    /* Dansk talformat: 0,10 */
    function komma(x, d) {
        return afrund(x, d).toFixed(d === undefined ? 2 : d).replace(".", ",").replace(/^-(0,0*)$/, "$1");
    }

    /* 3,56·10⁻⁴ */
    function videnskabelig(x, d) {
        if (d === undefined) d = 2;
        if (!x) return "0";
        var e = Math.floor(Math.log(Math.abs(x)) / Math.LN10);
        var m = afrund(x / Math.pow(10, e), d);
        if (Math.abs(m) >= 10) { m = afrund(m / 10, d); e++; }
        if (e === 0) return komma(m, d);
        return komma(m, d) + "·10" + NK.haevet(String(e).replace("-", "−"));
    }

    /* Aflaesning af buretten med to decimaler, sidste ciffer 0 eller 5 */
    function aflaes(V) {
        return afrund(Math.round(V / 0.05) * 0.05, 2);
    }

    /* Tal skrevet af eleven: 98,4 · 0.000356 · 3,56·10^-4 · 3,56·10⁻⁴ · 3.56e-4 */
    var HAEVET_TIL = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-", "⁺": "+" };

    function tal(tekst) {
        var s = String(tekst === undefined || tekst === null ? "" : tekst)
            .replace(/%/g, "").replace(/\s/g, "").replace(/[−–]/g, "-");
        s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (run) {
            return "^" + run.split("").map(function (c) { return HAEVET_TIL[c]; }).join("");
        });
        s = s.replace(",", ".");
        var m = /^([-+]?\d*\.?\d+)(?:(?:[·*×x]10\^?|[eE])([-+]?\d+))?$/.exec(s);
        if (!m) return NaN;
        return parseFloat(m[1]) * (m[2] !== undefined ? Math.pow(10, parseInt(m[2], 10)) : 1);
    }

    function oploesFart(temp) {
        var t = NK.klamp((temp - OPLOES.tKold) / (OPLOES.tVarm - OPLOES.tKold), 0, 1);
        return OPLOES.kKold + (OPLOES.kVarm - OPLOES.kKold) * t;
    }

    function jernMol(mStaal) {
        return mStaal * STAALULD.jern / M_FE;
    }

    /* Volumen KMnO₄ i mL, der netop omsaetter n mol Fe²⁺ */
    function aekvivalens(nFe) {
        return nFe / 5 / KMNO4.c * 1000;
    }

    function jernprocent(mStaal, vStart, vSlut) {
        return 5 * KMNO4.c * (vSlut - vStart) / 1000 * M_FE / mStaal * 100;
    }

    /* Mellemregningerne, som guiden bruger */
    function mellemregning(mStaal, vStart, vSlut) {
        var V = afrund(vSlut - vStart, 2);
        var nMn = KMNO4.c * V / 1000;
        var nFe = 5 * nMn;
        var mFe = nFe * M_FE;
        return { V: V, nMn: nMn, nFe: nFe, mFe: mFe, procent: mFe / mStaal * 100, mStaal: mStaal, vStart: vStart, vSlut: vSlut };
    }

    /* ----- Kolbens kemi ------------------------------------------------
       kem = { nFeTot, opl, nFe2, nFe3, nLokal, nMnO4, nMn2, nKlor, ml,
               syre (den foerste syre), syrer { navn: antal }, klorid }
       o   = { temp, ryst (0-1) } */
    function nyKemi() {
        return { nFeTot: 0, opl: 0, nFe2: 0, nFe3: 0, nLokal: 0, nMnO4: 0, nMn2: 0, nKlor: 0, ml: 0, syre: null, syrer: {}, klorid: false };
    }

    /* "svovlsyre", "saltsyre", "begge" eller null */
    function syreId(kem) {
        var s = kem.syrer || {};
        if (s.svovlsyre && s.saltsyre) return "begge";
        return kem.syre;
    }

    function syreNavn(id) {
        if (id === "begge") return "Svovlsyre og saltsyre";
        return SYRER[id] ? SYRER[id].navn : "Ingen syre";
    }

    function reager(kem, dt, o) {
        o = o || {};
        var syre = kem.syre ? SYRER[kem.syre] : null;
        var klorid = kem.klorid || !!(syre && syre.klorid);

        /* Opløsning af stålulden */
        if (syre && kem.nFeTot > 0 && kem.opl < 1) {
            var foer = kem.opl;
            var rest = 1 - kem.opl;
            kem.opl = Math.min(1, kem.opl + oploesFart(o.temp === undefined ? 22 : o.temp) * Math.pow(rest, 2 / 3) * dt);
            if (1 - kem.opl < 0.004) kem.opl = 1;
            kem.nFe2 += (kem.opl - foer) * kem.nFeTot;
        }

        /* Den lokale sky blandes ind. Meget Fe²⁺ faar den til at forsvinde
           hurtigt; naer endepunktet bliver den haengende. */
        if (kem.nLokal > 0) {
            var feDel = kem.nFeTot > 0 ? NK.klamp(kem.nFe2 / (0.2 * kem.nFeTot), 0, 1) : 0;
            var fart = (TITRER.blanding + TITRER.rystBlanding * (o.ryst || 0)) * (1 + TITRER.feFart * feDel);
            var m = kem.nLokal * (1 - Math.exp(-fart * dt));
            if (kem.nLokal < 1e-10) m = kem.nLokal;
            kem.nLokal -= m;
            if (klorid) {
                var tilKlor = m * KLOR.andel;
                kem.nKlor += tilKlor;
                m -= tilKlor;
            }
            kem.nMnO4 += m;
        }

        /* Frit MnO₄⁻ reagerer med det Fe²⁺, der er */
        if (kem.nMnO4 > 0 && kem.nFe2 > 0) {
            var r = Math.min(kem.nMnO4, kem.nFe2 / 5);
            kem.nMnO4 -= r;
            kem.nFe2 -= 5 * r;
            kem.nFe3 += 5 * r;
            kem.nMn2 += r;
            if (kem.nFe2 < 1e-12) kem.nFe2 = 0;
        }

        /* Chlorid oxideres langsomt af overskuddet */
        if (klorid && kem.nMnO4 > 0) {
            var d = kem.nMnO4 * (1 - Math.exp(-KLOR.fald * dt));
            kem.nMnO4 -= d;
            kem.nKlor += d;
        }
        if (kem.nMnO4 < 1e-12) kem.nMnO4 = 0;
    }

    /* Tilsaet mL KMnO₄ til kolben (som lokal sky) */
    function tilsaet(kem, ml) {
        kem.nLokal += KMNO4.c * ml / 1000;
        kem.ml += ml;
    }

    /* Intensiteten af den lyserøde farve (1 svarer til 2·10⁻⁴ M) */
    function intensitet(kem) {
        if (kem.ml <= 0) return 0;
        return kem.nMnO4 / (kem.ml / 1000) / 2e-4;
    }

    function lokalIntensitet(kem) {
        return kem.nLokal / (KMNO4.c * BURET.draabe / 1000);
    }

    /* Overskud af frit MnO₄⁻, omregnet til mL KMnO₄ */
    function overskudMl(kem) {
        return (kem.nMnO4 + kem.nLokal) / KMNO4.c * 1000;
    }

    /* Farven i kolben. Uden syre er der kun det, der er tilsat af KMnO₄. */
    function kolbeFarve(kem) {
        if (kem.ml <= 0) return null;
        var l = kem.ml / 1000;
        var f = NK.blandFarve(FARVE.syre, FARVE.fe2, NK.klamp(kem.nFe2 / l / 0.04, 0, 1));
        f = NK.blandFarve(f, FARVE.fe3, NK.klamp(kem.nFe3 / l / 0.04, 0, 1) * 0.8);
        var I = intensitet(kem);
        if (I > 0.004) {
            f = NK.blandFarve(f, FARVE.lyserod, NK.klamp(I * 4, 0, 0.9));
            if (I > 0.6) f = NK.blandFarve(f, FARVE.lilla, NK.klamp((I - 0.6) / 3, 0, 1));
        }
        return f;
    }

    /* Tjekker elevens jernindhold. slags fortaeller, hvilken fejl der
       sandsynligvis er begaaet, saa hintet kan passe til den. */
    function tjek(svar, mStaal, vStart, vSlut) {
        var v = tal(svar);
        if (isNaN(v)) return { slags: "tom" };
        var t = mellemregning(mStaal, vStart, vSlut);
        var r = t.procent;
        function naer(x, tol) { return Math.abs(v - x) <= tol; }
        if (naer(r, Math.max(0.5, Math.abs(r) * 0.01))) return { slags: "rigtig", vaerdi: r };
        if (naer(r / 100, Math.max(0.006, Math.abs(r) / 100 * 0.01))) return { slags: "broek" };
        if (naer(t.mFe, Math.max(0.0015, Math.abs(t.mFe) * 0.02))) return { slags: "gram" };
        if (vStart > 0.3) {
            var slut = jernprocent(mStaal, 0, vSlut);
            if (naer(slut, Math.max(0.3, slut * 0.004))) return { slags: "slut" };
        }
        if (t.mFe > 0 && naer(mStaal / t.mFe * 100, 0.3)) return { slags: "omvendt" };
        if (naer(r / 5, Math.max(0.2, Math.abs(r) / 5 * 0.02))) return { slags: "fem" };
        if (naer(r / 25, Math.max(0.08, Math.abs(r) / 25 * 0.03))) return { slags: "femDiv" };
        if (r > 0 && (naer(r * 1000, r * 1000 * 0.02) || naer(r * 200, r * 200 * 0.02) || naer(r / 100000, r / 100000 * 0.03))) return { slags: "ml" };
        return { slags: "andet" };
    }

    NK.Model = {
        STAALULD: STAALULD,
        AFVEJ: AFVEJ,
        M_FE: M_FE,
        KMNO4: KMNO4,
        SYRER: SYRER,
        SYRE_ML: SYRE_ML,
        OPLOES: OPLOES,
        BURET: BURET,
        GRAENSE: GRAENSE,
        TITRER: TITRER,
        KLOR: KLOR,
        RYST: RYST,
        KOLBE_AREAL: KOLBE_AREAL,
        FARVE: FARVE,
        afrund: afrund,
        komma: komma,
        videnskabelig: videnskabelig,
        aflaes: aflaes,
        tal: tal,
        oploesFart: oploesFart,
        jernMol: jernMol,
        aekvivalens: aekvivalens,
        jernprocent: jernprocent,
        mellemregning: mellemregning,
        nyKemi: nyKemi,
        syreId: syreId,
        syreNavn: syreNavn,
        reager: reager,
        tilsaet: tilsaet,
        intensitet: intensitet,
        lokalIntensitet: lokalIntensitet,
        overskudMl: overskudMl,
        kolbeFarve: kolbeFarve,
        tjek: tjek
    };
}());

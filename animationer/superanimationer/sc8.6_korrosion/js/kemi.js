/* =====================================================================
   kemi.js - modellen: metallerne, spaendingsraekken og tre regnestykker

   Raekkefoelgen er bestemt af standardreduktionspotentialet E° (V ved
   25 °C, Databogen), de samme tal som i sc8.1. Eleven ser aldrig
   tallene. De afgoer, hvem der afgiver elektroner til hvem (det mindst
   aedle metal), og hvor hurtigt det gaar (forskellen i E°).

   Tre smaa modeller:
     * K.roerpar  - to roer, der er skruet sammen (fane 1)
     * K.sejl     - skroget, skruen og klodserne paa et skib (fane 2)
     * K.rustFart - jern, vand, ilt og salt (fane 3), og skemaerne, som
                    eleven afstemmer paa tavlen (K.SKEMA, K.tjekSkema)

   Hastighederne er valgt, saa forloebet kan ses. Retningen og
   raekkefoelgen kommer af spaendingsraekken. Se README.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    /* Metallerne i animationen. E: standardreduktionspotentialet i volt.
       egen: saa mange mm et roer af metallet taeres pr. aar i vand med
       ilt, naar det sidder alene (jern ruster, zink langsomt, kobber
       ikke i denne model). */
    K.METAL = {
        Mg: { navn: "magnesium", E: -2.37, q: 2, egen: 0.02, farve: "#dfe4ea", kant: "#8a94a1", belaeg: "#f2f4f6", tekst: "#20242b" },
        Zn: { navn: "zink",      E: -0.76, q: 2, egen: 0.02, farve: "#a8c2d6", kant: "#56718a", belaeg: "#e6ebef", tekst: "#16222c" },
        Fe: { navn: "jern",      E: -0.44, q: 2, egen: 0.05, farve: "#7b8695", kant: "#3d4551", belaeg: "#a9521f", tekst: "#ffffff" },
        Cu: { navn: "kobber",    E: 0.34,  q: 2, egen: 0,    farve: "#cf7b41", kant: "#7b4019", belaeg: "#4f9a86", tekst: "#2a1407" }
    };

    /* Spaendingsraekken, som den staar i bogen: uaedel til venstre */
    K.RAEKKE = ["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "H", "Cu", "Ag", "Hg", "Pt", "Au"];

    K.navn = function (s) { return K.METAL[s].navn; };

    K.Navn = function (s) {
        var n = K.METAL[s].navn;
        return n.charAt(0).toUpperCase() + n.slice(1);
    };

    /* Ionen: Fe²⁺, Zn²⁺ */
    K.ion = function (s) { return s + NK.ladningHaevet(K.METAL[s].q); };

    /* Det mindst aedle af to metaller, eller null, hvis de er ens */
    K.mindstAedel = function (a, b) {
        if (a === b) return null;
        return K.METAL[a].E < K.METAL[b].E ? a : b;
    };

    K.forskel = function (a, b) { return Math.abs(K.METAL[a].E - K.METAL[b].E); };

    /* ----- Fane 1: to roer --------------------------------------------------
       vaeg: roerets vaeg i mm. aar: saa laenge loeber forsoeget.
       G: mm pr. aar pr. volt ved samlingen. raekkevidde: hvor langt
       fra samlingen den ekstra taering naar (del af roerets laengde). */
    K.ROER = { vaeg: 2.5, aar: 20, G: 0.25, raekkevidde: 0.3, metaller: ["Cu", "Fe", "Zn"] };

    /* a: venstre roer, b: hoejre roer, plast: en plastmuffe imellem.
       Giver anoden (det roer, der taeres ekstra ved samlingen), farten
       ved samlingen og hvert roers egen fart. Det aedle roer er
       beskyttet, saa laenge det faar elektroner fra det andet. */
    K.roerpar = function (a, b, plast) {
        var R = K.ROER;
        var anode = plast ? null : K.mindstAedel(a, b);
        var katode = anode ? (anode === a ? b : a) : null;
        var galv = anode ? R.G * K.forskel(a, b) : 0;
        var egen = { v: K.METAL[a].egen, h: K.METAL[b].egen };
        if (anode) {
            if (anode === a) egen.h = 0; else egen.v = 0;
        }
        var side = anode ? (anode === a ? "v" : "h") : null;
        var fart = side ? egen[side] + galv : 0;
        var hul = fart > 0 ? R.vaeg / fart : Infinity;
        return {
            a: a, b: b, plast: !!plast, anode: anode, katode: katode, side: side,
            galv: galv, egen: egen, hul: hul <= R.aar ? hul : null
        };
    };

    /* Saa mange mm er vaeggen taeret efter t aar. side: "v" eller "h".
       d: afstanden fra samlingen, 0 ved samlingen og 1 ved roerets ende. */
    K.tab = function (par, side, t, d) {
        var mm = par.egen[side] * t;
        if (par.side === side) mm += par.galv * t * Math.exp(-d / K.ROER.raekkevidde);
        return Math.min(mm, K.ROER.vaeg);
    };

    /* ----- Fane 2: skibet ------------------------------------------------------
       Skroget er jern, skruen er bronze (regnes som kobber). rustAar:
       procentpoint rust pr. aar ved skruen uden beskyttelse. rustKlods:
       ekstra for hver kobberklods. forbrug: procent af en klods pr. aar
       pr. volt op til kobber. */
    K.SKIB = { skrog: "Fe", skrue: "Cu", rustAar: 12, rustKlods: 8, forbrug: 26, pladser: 2, klodser: ["Zn", "Mg", "Cu"] };

    /* Saa mange procent af én klods bruges pr. aar, naar den sidder alene */
    K.klodsForbrug = function (m) {
        if (K.METAL[m].E >= K.METAL.Fe.E) return 0;
        return K.SKIB.forbrug * (K.METAL.Cu.E - K.METAL[m].E);
    };

    /* Det, der afgiver elektroner lige nu: metallet med det laveste E°
       blandt skroget og de klodser, der er noget tilbage af. */
    K.skibAnode = function (klodser) {
        var anode = "Fe";
        klodser.forEach(function (k) {
            if (k && k.rest > 0 && K.METAL[k.metal].E < K.METAL[anode].E) anode = k.metal;
        });
        return anode;
    };

    /* Sejl dt aar. tilstand: { rust, klodser: [{ metal, rest } eller null] }.
       Regnes i smaa skridt, saa en klods kan slippe op midt i et aar. */
    K.sejl = function (tilstand, dt) {
        var S = K.SKIB, skridt = 0.005, t = 0;
        while (t < dt - 1e-9) {
            var h = Math.min(skridt, dt - t);
            var anode = K.skibAnode(tilstand.klodser);
            if (anode === "Fe") {
                var nCu = tilstand.klodser.filter(function (k) { return k && k.metal === "Cu"; }).length;
                tilstand.rust = Math.min(100, tilstand.rust + (S.rustAar + S.rustKlods * nCu) * h);
            } else {
                var ofre = tilstand.klodser.filter(function (k) { return k && k.metal === anode && k.rest > 0; });
                var hver = K.klodsForbrug(anode) * h / ofre.length;
                ofre.forEach(function (k) { k.rest = Math.max(0, k.rest - hver); });
            }
            t += h;
        }
        return tilstand;
    };

    /* ----- Fane 3: jern, vand, ilt og salt ----------------------------------------
       fart: jernatomer pr. sekund i luppen med vand og ilt. salt: saa
       mange gange hurtigere gaar det med salt i vandet. */
    K.RUST = { fart: 0.4, salt: 3 };

    K.rustFart = function (vand, ilt, salt) {
        if (!vand || !ilt) return 0;
        return K.RUST.fart * (salt ? K.RUST.salt : 1);
    };

    /* Stofferne i skemaerne: atomer og ladning */
    K.PARTIKEL = {
        "Fe":      { Fe: 1, q: 0 },
        "Fe²⁺":    { Fe: 1, q: 2 },
        "e⁻":      { q: -1 },
        "O₂":      { O: 2, q: 0 },
        "H₂O":     { H: 2, O: 1, q: 0 },
        "OH⁻":     { O: 1, H: 1, q: -1 },
        "Fe(OH)₂": { Fe: 1, O: 2, H: 2, q: 0 },
        "FeO(OH)": { Fe: 1, O: 2, H: 1, q: 0 }
    };

    /* Skemaerne paa tavlen. k: det rigtige tal. felt: eleven skriver tallet. */
    K.SKEMA = {
        ox: {
            navn: "Oxidation",
            v: [{ k: 1, f: "Fe" }],
            h: [{ k: 1, f: "Fe²⁺" }, { k: 2, f: "e⁻", felt: true }]
        },
        red: {
            navn: "Reduktion",
            v: [{ k: 1, f: "O₂" }, { k: 2, f: "H₂O" }, { k: 4, f: "e⁻", felt: true }],
            h: [{ k: 4, f: "OH⁻", felt: true }]
        },
        samlet: {
            navn: "Samlet",
            v: [{ k: 2, f: "Fe", felt: true }, { k: 1, f: "O₂" }, { k: 2, f: "H₂O" }],
            h: [{ k: 2, f: "Fe²⁺", felt: true }, { k: 4, f: "OH⁻", felt: true }]
        },
        rust: {
            navn: "Rust",
            v: [{ k: 4, f: "Fe(OH)₂", felt: true }, { k: 1, f: "O₂" }],
            h: [{ k: 4, f: "FeO(OH)", felt: true }, { k: 2, f: "H₂O", felt: true }]
        }
    };

    /* Leddene i et skema i raekkefoelge, med side og nummer blandt felterne */
    K.led = function (id) {
        var s = K.SKEMA[id], ud = [], n = 0;
        ["v", "h"].forEach(function (side) {
            s[side].forEach(function (l) {
                ud.push({ side: side, f: l.f, k: l.k, felt: !!l.felt, nr: l.felt ? n++ : -1 });
            });
        });
        return ud;
    };

    K.facit = function (id) {
        return K.led(id).filter(function (l) { return l.felt; }).map(function (l) { return l.k; });
    };

    /* Taeller atomer og ladning paa hver side med elevens tal i felterne.
       tal: listen med tallene i felterne, i raekkefoelge. */
    K.optael = function (id, tal) {
        var ud = { v: { Fe: 0, O: 0, H: 0, q: 0 }, h: { Fe: 0, O: 0, H: 0, q: 0 } };
        K.led(id).forEach(function (l) {
            var n = l.felt ? tal[l.nr] : l.k, p = K.PARTIKEL[l.f];
            ["Fe", "O", "H", "q"].forEach(function (a) { ud[l.side][a] += n * (p[a] || 0); });
        });
        return ud;
    };

    /* Er skemaet afstemt med elevens tal? Giver ogsaa det foerste, der
       ikke passer: "Fe", "O", "H" eller "q" (ladningen). */
    K.tjekSkema = function (id, tal) {
        var t = K.optael(id, tal);
        var fejl = null;
        ["Fe", "O", "H", "q"].forEach(function (a) {
            if (!fejl && t.v[a] !== t.h[a]) fejl = a;
        });
        return { ok: !fejl, fejl: fejl, v: t.v, h: t.h };
    };

    /* Skemaet som tekst med de rigtige tal: "2 Fe + O₂ + 2 H₂O → 2 Fe²⁺ + 4 OH⁻" */
    K.skemaTekst = function (id) {
        function side(liste) {
            return liste.map(function (l) { return (l.k === 1 ? "" : l.k + " ") + l.f; }).join(" + ");
        }
        var s = K.SKEMA[id];
        return side(s.v) + " → " + side(s.h);
    };

    NK.Kemi = K;
}());

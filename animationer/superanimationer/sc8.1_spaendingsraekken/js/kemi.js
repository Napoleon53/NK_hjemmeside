/* =====================================================================
   kemi.js - modellen: stofferne, spaendingsraekken og reaktionerne

   Raekkefoelgen er bestemt af standardreduktionspotentialet E° (V ved
   25 °C, Databogen). Eleven ser aldrig tallene. De afgoer kun, hvem der
   staar til venstre for hvem, og et metal reagerer med ionerne af et
   andet grundstof, naar det staar til venstre for det (lavere E°).

   Reaktionen regnes ud af ladningerne alene: metallet M afgiver a
   elektroner og bliver til M^a+, og ionen N^b+ optager b elektroner og
   bliver til N (H⁺ bliver til H₂). Koefficienterne er de mindste hele
   tal, hvor der afgives lige saa mange elektroner, som der optages.
   Oxidationstal bruges ikke; dem ejer c8.2 til c8.4.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = {};

    /* Stofferne. q: ionens ladning. salt: oploesningen i glasset med
       formlen skrevet med almindelige tal (NK.formel saenker dem).
       anion: tilskuerionen i oploesningen og dens ladning. */
    K.STOF = {
        K:  { navn: "kalium",    E: -2.93, q: 1 },
        Ca: { navn: "calcium",   E: -2.87, q: 2 },
        Na: { navn: "natrium",   E: -2.71, q: 1 },
        Mg: { navn: "magnesium", E: -2.37, q: 2, salt: "magnesiumsulfat",  saltFormel: "MgSO4",     anion: "SO4", anionQ: -2 },
        Al: { navn: "aluminium", E: -1.66, q: 3, salt: "aluminiumsulfat",  saltFormel: "Al2(SO4)3", anion: "SO4", anionQ: -2 },
        Zn: { navn: "zink",      E: -0.76, q: 2, salt: "zinksulfat",       saltFormel: "ZnSO4",     anion: "SO4", anionQ: -2 },
        Fe: { navn: "jern",      E: -0.44, q: 2, salt: "jern(II)sulfat",   saltFormel: "FeSO4",     anion: "SO4", anionQ: -2 },
        Ni: { navn: "nikkel",    E: -0.26, q: 2, salt: "nikkel(II)sulfat", saltFormel: "NiSO4",     anion: "SO4", anionQ: -2 },
        Sn: { navn: "tin",       E: -0.14, q: 2, salt: "tin(II)chlorid",   saltFormel: "SnCl2",     anion: "Cl",  anionQ: -1 },
        Pb: { navn: "bly",       E: -0.13, q: 2, salt: "bly(II)nitrat",    saltFormel: "Pb(NO3)2",  anion: "NO3", anionQ: -1 },
        H:  { navn: "hydrogen",  E: 0.00,  q: 1, salt: "saltsyre",         saltFormel: "HCl",       anion: "Cl",  anionQ: -1, gas: true },
        Cu: { navn: "kobber",    E: 0.34,  q: 2, salt: "kobber(II)sulfat", saltFormel: "CuSO4",     anion: "SO4", anionQ: -2 },
        Ag: { navn: "sølv",      E: 0.80,  q: 1, salt: "sølvnitrat",       saltFormel: "AgNO3",     anion: "NO3", anionQ: -1 },
        Hg: { navn: "kviksølv",  E: 0.85,  q: 2 },
        Pt: { navn: "platin",    E: 1.18,  q: 2 },
        Au: { navn: "guld",      E: 1.50,  q: 3, salt: "guld(III)chlorid", saltFormel: "AuCl3",     anion: "Cl",  anionQ: -1 }
    };

    /* Spaendingsraekken, som den staar i bogen: uaedel til venstre */
    K.RAEKKE = ["K", "Ca", "Na", "Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "H", "Cu", "Ag", "Hg", "Pt", "Au"];

    /* De metaller, der findes som stang, og de oploesninger, der findes
       som glas (fane 3). Kalium, calcium og natrium reagerer med vandet
       og er kun med i raekken. */
    K.STAENGER = ["Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "Cu", "Ag", "Au"];
    K.OPLOESNINGER = ["Mg", "Al", "Zn", "Fe", "Ni", "Sn", "Pb", "H", "Cu", "Ag", "Au"];

    /* Par, hvor forskellen er saa lille, at forsoeget i virkeligheden
       er langsomt eller tvivlsomt, kommer ikke med som opgaver. */
    K.MINDSTE_FORSKEL = 0.2;

    K.navn = function (s) { return K.STOF[s].navn; };

    K.Navn = function (s) {
        var n = K.STOF[s].navn;
        return n.charAt(0).toUpperCase() + n.slice(1);
    };

    /* Ionen: Cu²⁺, Ag⁺, H⁺ */
    K.ion = function (s) { return s + NK.ladningHaevet(K.STOF[s].q); };

    /* Grundstoffet, som det dannes: Cu, Ag, H₂ */
    K.frit = function (s) { return K.STOF[s].gas ? "H₂" : s; };

    /* "kobberionerne", men H⁺ for hydrogen */
    K.ionerne = function (s) { return K.STOF[s].gas ? "H⁺" : K.STOF[s].navn + "ionerne"; };

    K.saltFormel = function (s) { return NK.formel(K.STOF[s].saltFormel); };

    /* Tilskuerionen: SO₄²⁻, NO₃⁻, Cl⁻ */
    K.anion = function (s) {
        var st = K.STOF[s];
        return NK.formel(st.anion) + NK.ladningHaevet(st.anionQ);
    };

    /* Afgiver metallet m elektroner til ionerne af i? */
    K.reagerer = function (m, i) {
        return m !== i && K.STOF[m].E < K.STOF[i].E;
    };

    /* Hvor langt fra hinanden de staar (V). Positiv: der sker noget. */
    K.forskel = function (m, i) {
        return K.STOF[i].E - K.STOF[m].E;
    };

    /* Pladsen i raekken (0 = kalium) */
    K.plads = function (s) { return K.RAEKKE.indexOf(s); };

    /* Den afstemte reaktion: m(s) + i-ion(aq) ⟶ m-ion(aq) + i(s) eller H₂(g).
       koef: koefficienterne i den raekkefoelge, stofferne staar.
       e: elektroner i alt, der afgives og optages. */
    K.reaktion = function (m, i) {
        var a = K.STOF[m].q, gas = !!K.STOF[i].gas;
        var b = gas ? 2 : K.STOF[i].q;          /* elektroner pr. dannet enhed */
        var e = a * b / NK.gcd(a, b);
        var nM = e / a, nP = e / b;
        var nI = gas ? nP * 2 : nP;
        return {
            m: m, i: i, a: a, b: K.STOF[i].q, gas: gas, e: e,
            koef: [nM, nI, nM, nP],
            stoffer: [m + "(s)", K.ion(i) + "(aq)", K.ion(m) + "(aq)", gas ? "H₂(g)" : i + "(s)"],
            kort: [m, K.ion(i), K.ion(m), K.frit(i)]
        };
    };

    /* Skemaet skrevet ud: Zn(s) + 2 Ag⁺(aq) ⟶ Zn²⁺(aq) + 2 Ag(s) */
    K.skemaTekst = function (r, koef, udenTilstand) {
        koef = koef || r.koef;
        var s = udenTilstand ? r.kort : r.stoffer;
        function led(k, t) { return (k === 1 ? "" : k + " ") + t; }
        return led(koef[0], s[0]) + " + " + led(koef[1], s[1]) + " ⟶ " + led(koef[2], s[2]) + " + " + led(koef[3], s[3]);
    };

    /* Tjekker elevens koefficienter. t: fire tal (NaN eller 0 for et
       tomt felt, der taeller som ikke besvaret). Svaret er en kode, som
       beskeden bygges af (se D.koefBesked). */
    K.tjekKoef = function (r, t) {
        var i;
        for (i = 0; i < 4; i++) {
            if (!(t[i] > 0) || Math.round(t[i]) !== t[i]) return { ok: false, kode: "tom" };
        }
        var mV = t[0], mH = t[2];
        var iV = t[1], iH = r.gas ? t[3] * 2 : t[3];
        if (mV !== mH) return { ok: false, kode: "atomM", v: mV, h: mH };
        if (iV !== iH) return { ok: false, kode: "atomI", v: iV, h: iH };
        var qV = t[1] * r.b, qH = t[2] * r.a;
        if (qV !== qH) return { ok: false, kode: "ladning", v: qV, h: qH };
        var g = NK.gcd(NK.gcd(t[0], t[1]), NK.gcd(t[2], t[3]));
        if (g > 1) return { ok: false, kode: "forkort", g: g };
        return { ok: true, kode: "ok" };
    };

    /* Alle par af stang og oploesning, der kan blive en opgave paa fane 3 */
    K.alleOpgaver = function () {
        var ud = [];
        K.STAENGER.forEach(function (m) {
            K.OPLOESNINGER.forEach(function (i) {
                if (m === i) return;
                if (Math.abs(K.forskel(m, i)) < K.MINDSTE_FORSKEL) return;
                ud.push([m, i]);
            });
        });
        return ud;
    };

    /* Hvor hurtigt et forsoeg gaar: tidskonstanten (s) for, hvor meget
       af ionerne der er brugt. Jo laengere fra hinanden, jo hurtigere. */
    K.tau = function (m, i) {
        return NK.klamp(10 - 4 * K.forskel(m, i), 3.5, 9);
    };

    NK.Kemi = K;
}());

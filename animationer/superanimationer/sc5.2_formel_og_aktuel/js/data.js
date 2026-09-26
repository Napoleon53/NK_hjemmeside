/* =====================================================================
   data.js - saltene, ionerne, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   ionerne og saltene, de tre fanes opgaver med tallene og det, Kemichael
   siger. Kemien og tallene regnes i kemi.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1) ----------------------------- */
    D.ATOMMASSE = { H: 101, C: 1201, N: 1401, O: 1600, Na: 2299, Mg: 2431, Al: 2698, P: 3097, S: 3206, Cl: 3545,
                    K: 3910, Ca: 4008, Fe: 5585, I: 12690, Ba: 13733, Pb: 20720 };

    /* Formlen skilt ad, ogsaa med parenteser: "Al2(SO4)3" -> { Al: 2, S: 3, O: 12 } */
    D.atomer = function (f) {
        var i = 0;
        function gruppe() {
            var ud = {};
            while (i < f.length && f[i] !== ")") {
                var del = {};
                if (f[i] === "(") {
                    i++;
                    del = gruppe();
                    i++;
                } else {
                    var m = /^[A-Z][a-z]?/.exec(f.slice(i));
                    if (!m) { i++; continue; }
                    del[m[0]] = 1;
                    i += m[0].length;
                }
                var t = /^\d+/.exec(f.slice(i));
                var k = t ? parseInt(t[0], 10) : 1;
                if (t) i += t[0].length;
                Object.keys(del).forEach(function (g) { ud[g] = (ud[g] || 0) + del[g] * k; });
            }
            return ud;
        }
        return gruppe();
    };

    /* ----- Ionerne: navnet, ladningen og farven i luppen ----------------------------- */
    D.IONER = {
        Na: { t: "Na⁺", q: 1, farve: "#b58be0", r: 7 },
        K: { t: "K⁺", q: 1, farve: "#39c2a6", r: 8 },
        Ca: { t: "Ca²⁺", q: 2, farve: "#8cc96a", r: 8 },
        Mg: { t: "Mg²⁺", q: 2, farve: "#d2dc6a", r: 7 },
        Ba: { t: "Ba²⁺", q: 2, farve: "#e0b15a", r: 9 },
        Fe: { t: "Fe³⁺", q: 3, farve: "#e8913a", r: 7 },
        Al: { t: "Al³⁺", q: 3, farve: "#e0605a", r: 6 },
        Pb: { t: "Pb²⁺", q: 2, farve: "#9aa6b2", r: 9 },
        Cl: { t: "Cl⁻", q: -1, farve: "#5fb4f0", r: 8 },
        I: { t: "I⁻", q: -1, farve: "#b0703a", r: 9 },
        SO4: { t: "SO₄²⁻", q: -2, farve: "#e9e3b8", r: 10 },
        PO4: { t: "PO₄³⁻", q: -3, farve: "#f07ab5", r: 10 },
        NO3: { t: "NO₃⁻", q: -1, farve: "#f2f4f6", r: 9 },
        CO3: { t: "CO₃²⁻", q: -2, farve: "#b9bec6", r: 9 }
    };
    D.ion = function (id) { return D.IONER[id]; };

    /* ----- Saltene -----------------------------------------------------------------------
       kat og an: ionerne og tallet foran dem i opløsningsskemaet.
       pulver: farven paa krukken. opl: opløsningens farve (null er farveløs). */
    var S = {
        NaCl: { navn: "natriumchlorid", kat: "Na", kk: 1, an: "Cl", ka: 1 },
        KCl: { navn: "kaliumchlorid", kat: "K", kk: 1, an: "Cl", ka: 1 },
        KI: { navn: "kaliumiodid", kat: "K", kk: 1, an: "I", ka: 1 },
        CaCl2: { navn: "calciumchlorid", kat: "Ca", kk: 1, an: "Cl", ka: 2 },
        MgCl2: { navn: "magnesiumchlorid", kat: "Mg", kk: 1, an: "Cl", ka: 2 },
        BaCl2: { navn: "bariumchlorid", kat: "Ba", kk: 1, an: "Cl", ka: 2 },
        Na2SO4: { navn: "natriumsulfat", kat: "Na", kk: 2, an: "SO4", ka: 1 },
        K2SO4: { navn: "kaliumsulfat", kat: "K", kk: 2, an: "SO4", ka: 1 },
        Na2CO3: { navn: "natriumcarbonat", kat: "Na", kk: 2, an: "CO3", ka: 1 },
        FeCl3: { navn: "jern(III)chlorid", kat: "Fe", kk: 1, an: "Cl", ka: 3, pulver: "#9a6320", opl: "#d8952c", cFuld: 0.6 },
        AlCl3: { navn: "aluminiumchlorid", kat: "Al", kk: 1, an: "Cl", ka: 3 },
        K3PO4: { navn: "kaliumphosphat", kat: "K", kk: 3, an: "PO4", ka: 1 },
        Na3PO4: { navn: "natriumphosphat", kat: "Na", kk: 3, an: "PO4", ka: 1 },
        "Al2(SO4)3": { navn: "aluminiumsulfat", kat: "Al", kk: 2, an: "SO4", ka: 3 },
        "Pb(NO3)2": { navn: "bly(II)nitrat", kat: "Pb", kk: 1, an: "NO3", ka: 2 }
    };
    Object.keys(S).forEach(function (id) {
        var st = S[id];
        st.id = id;
        st.formel = NK.formel(id);
        st.antal = D.atomer(id);
        st.M = 0;
        Object.keys(st.antal).forEach(function (g) { st.M += D.ATOMMASSE[g] * st.antal[g]; });
        st.Mv = st.M / 100;
        st.pulver = st.pulver || "#f4f5f7";
        st.opl = st.opl || null;
        st.cFuld = st.cFuld || 1;
        st.ioner = [D.IONER[st.kat], D.IONER[st.an]];
    });
    D.SALTE = S;
    D.salt = function (id) { return S[id]; };

    /* Molarmassen som paen beregning: "(2 · 22,99 + 32,06 + 4 · 16,00) g/mol" */
    D.molarLed = function (st) {
        var led = Object.keys(st.antal).map(function (g) {
            var a = st.antal[g], m = NK.komma(D.ATOMMASSE[g]);
            return a > 1 ? a + " · " + m : m;
        });
        return "(" + led.join(" + ") + ") g/mol";
    };

    /* Én prik i luppen er 0,05 mol/L af en ion */
    D.PRIK = 0.05;
    D.PORTION = 0.10;          /* mol pr. portion paa fane 1 */
    D.MAKS_PORTIONER = 10;     /* pr. salt i ét glas */

    /* ----- Fane 1: opløsningen ------------------------------------------------------------
       salte: krukkerne paa bordet. V: vandet i glasset (mL).
       maal: { ion, c } (den ion, der skal have koncentrationen c),
             { portioner } (saa mange portioner) og evt. begge (alle salte i). */
    D.OPL = [
        { id: "nacl", titel: "Én til én", salte: ["NaCl"], V: 1000, maal: { ion: "Cl", c: 0.30 },
          tekst: "Gør [Cl⁻] = 0,30 M.",
          linje: "Træk en portion natriumchlorid fra krukken ned i glasset.",
          hint: "Hver portion er 0,10 mol, og glasset har 1,00 L. Hvor mange Cl⁻ giver hver NaCl?",
          svar: "NaCl ⟶ Na⁺ + Cl⁻. [Cl⁻] = c(NaCl) = 0,30 M. Det er tre portioner.",
          goer: [["NaCl", 3]],
          efter: "Hver NaCl giver én Cl⁻, så [Cl⁻] = c(NaCl) = 0,30 M." },
        { id: "na2so4", titel: "To Na⁺", salte: ["Na2SO4"], V: 500, maal: { portioner: 1 },
          tekst: "Du opløser en portion (0,10 mol) Na₂SO₄ i 0,50 L. Så er c(Na₂SO₄) = 0,20 M.",
          valg: { spm: "Hvad bliver [Na⁺]?",
                  hint: "Se på formlen. Hvor mange Na er der i én Na₂SO₄?",
                  svar: [{ t: "0,40 M", ok: true },
                         { t: "0,20 M", forkl: "Hver Na₂SO₄ giver to Na⁺, så [Na⁺] er dobbelt så stor som c(Na₂SO₄)." },
                         { t: "0,10 M", forkl: "Der kommer flere ioner, ikke færre: to Na⁺ for hver Na₂SO₄." }] },
          linje: "Prøv det: træk en portion ned i glasset.",
          hint: "Træk fra krukken, eller klik på den.",
          svar: "En portion Na₂SO₄ i 0,50 L.",
          goer: [["Na2SO4", 1]],
          efter: "Na₂SO₄ ⟶ 2 Na⁺ + SO₄²⁻. [Na⁺] = 2 · 0,20 M = 0,40 M, og [SO₄²⁻] = 0,20 M." },
        { id: "fecl3", titel: "Tre Cl⁻", salte: ["FeCl3"], V: 1000, maal: { ion: "Cl", c: 0.60 },
          tekst: "Gør [Cl⁻] = 0,60 M.",
          linje: "Træk jern(III)chlorid ned i glasset.",
          hint: "Hver FeCl₃ giver tre Cl⁻. Hvor stor skal c(FeCl₃) så være?",
          svar: "c(FeCl₃) = 0,60 M / 3 = 0,20 M. Det er to portioner i 1,00 L.",
          goer: [["FeCl3", 2]],
          efter: "FeCl₃ ⟶ Fe³⁺ + 3 Cl⁻. [Cl⁻] = 3 · 0,20 M = 0,60 M. Der er tre gange så mange Cl⁻ som Fe³⁺." },
        { id: "k3po4", titel: "Tre K⁺", salte: ["K3PO4"], V: 500, maal: { ion: "K", c: 0.60 },
          tekst: "Gør [K⁺] = 0,60 M.",
          linje: "Træk kaliumphosphat ned i glasset.",
          hint: "Hver K₃PO₄ giver tre K⁺, og glasset har 0,50 L.",
          svar: "c(K₃PO₄) = 0,60 M / 3 = 0,20 M, og n = 0,20 M · 0,50 L = 0,10 mol. Det er én portion.",
          goer: [["K3PO4", 1]],
          efter: "K₃PO₄ ⟶ 3 K⁺ + PO₄³⁻. [K⁺] = 3 · 0,20 M = 0,60 M, og [PO₄³⁻] = 0,20 M." },
        { id: "al2so43", titel: "Hvem er flest?", salte: ["Al2(SO4)3"], V: 1000, maal: { portioner: 1 },
          tekst: "Du opløser en portion (0,10 mol) Al₂(SO₄)₃ i 1,00 L.",
          valg: { spm: "Hvilken ion bliver der flest af?",
                  hint: "Tallet efter Al og tallet efter parentesen siger, hvor mange af hver ion der er i én formelenhed.",
                  svar: [{ t: "SO₄²⁻", ok: true },
                         { t: "Al³⁺", forkl: "Al³⁺ har den største ladning, men der er to Al³⁺ og tre SO₄²⁻ i hver formelenhed." },
                         { t: "Lige mange", forkl: "Tallene i formlen er forskellige: Al₂ og (SO₄)₃." }] },
          linje: "Prøv det: træk en portion ned i glasset.",
          hint: "Træk fra krukken, eller klik på den.",
          svar: "En portion Al₂(SO₄)₃ i 1,00 L.",
          goer: [["Al2(SO4)3", 1]],
          efter: "Al₂(SO₄)₃ ⟶ 2 Al³⁺ + 3 SO₄²⁻. Ladningerne går lige op: 2 · 3+ = 3 · 2−. [Al³⁺] = 0,20 M og [SO₄²⁻] = 0,30 M." },
        { id: "begge", titel: "To salte", salte: ["NaCl", "Na2SO4"], V: 1000, maal: { ion: "Na", c: 0.50, begge: true },
          tekst: "Brug begge salte. Gør [Na⁺] = 0,50 M.",
          linje: "Der skal både natriumchlorid og natriumsulfat i.",
          hint: "Na⁺ kommer fra begge salte. NaCl giver én Na⁺, Na₂SO₄ giver to.",
          svar: "Fx tre portioner NaCl og én Na₂SO₄: [Na⁺] = 0,30 M + 2 · 0,10 M = 0,50 M.",
          goer: [["NaCl", 3], ["Na2SO4", 1]],
          efter: "" }
    ];

    /* ----- Fane 2: ionerne, i tre niveauer --------------------------------------------------
       Let: salte med 1 : 1, 1 : 2 og 2 : 1. Middel: 1 : 3, 3 : 1 og 2 : 3, og
       halvdelen baglæns (en ions koncentration er målt). Svær: fra massen.
       std er den foerste opgave; derefter traekkes nye. */
    D.NIV = [
        { id: "let", titel: "Let", salte: ["NaCl", "KI", "CaCl2", "MgCl2", "BaCl2", "Na2SO4", "K2SO4", "Na2CO3"],
          c: [0.100, 0.120, 0.150, 0.200, 0.240, 0.250, 0.300, 0.400, 0.500],
          std: { salt: "CaCl2", c: 0.240 } },
        { id: "middel", titel: "Middel", salte: ["FeCl3", "AlCl3", "K3PO4", "Na3PO4", "Al2(SO4)3"],
          c: [0.0500, 0.100, 0.120, 0.150, 0.200, 0.250],
          std: { salt: "Al2(SO4)3", c: 0.120 },
          baglaens: 0.5, stdBag: { salt: "Na3PO4", ion: "an", ionC: 0.150 } },
        { id: "svaer", titel: "Svær", salte: ["Pb(NO3)2", "CaCl2", "Na2SO4", "AlCl3", "K3PO4", "MgCl2", "Al2(SO4)3"],
          n: [0.00500, 0.0100, 0.0125, 0.0200, 0.0250, 0.0500], V: [100, 250, 500],
          std: { salt: "Pb(NO3)2", m: 4.14, V: 250 } }
    ];

    /* ----- Fane 3: blandinger ---------------------------------------------------------------
       samme: to salte i den samme opløsning. De andre: to glas, A og B,
       haeldes sammen. ion: den ion, der spoerges om (i begge glas); ion2:
       en ion, der kun er i det ene glas. V i mL. */
    D.BLAND = [
        { id: "samme", titel: "To salte i ét glas", ion: "Cl",
          tekst: "Et glas har både {cA} M {A} og {cB} M {B}. Hvad er [{ion}]?",
          tal: [{ A: "CaCl2", cA: 0.250, B: "AlCl3", cB: 0.150 }, { A: "NaCl", cA: 0.200, B: "CaCl2", cB: 0.100 },
                { A: "MgCl2", cA: 0.150, B: "KCl", cB: 0.200 }, { A: "BaCl2", cA: 0.100, B: "FeCl3", cB: 0.100 }] },
        { id: "lige", titel: "Samme rumfang", ion: "Cl",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. De hældes sammen. Hvad er [{ion}]?",
          tal: [{ A: "NaCl", cA: 0.200, VA: 100, B: "KCl", cB: 0.200, VB: 100 },
                { A: "NaCl", cA: 0.300, VA: 50, B: "KCl", cB: 0.100, VB: 50 },
                { A: "CaCl2", cA: 0.100, VA: 100, B: "NaCl", cB: 0.200, VB: 100 },
                { A: "KCl", cA: 0.400, VA: 150, B: "NaCl", cB: 0.200, VB: 150 }] },
        { id: "forskellig", titel: "Forskelligt rumfang", ion: "Cl",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. De hældes sammen. Hvad er [{ion}]?",
          tal: [{ A: "CaCl2", cA: 0.300, VA: 100, B: "NaCl", cB: 0.150, VB: 200 },
                { A: "NaCl", cA: 0.200, VA: 150, B: "CaCl2", cB: 0.100, VB: 50 },
                { A: "AlCl3", cA: 0.100, VA: 100, B: "KCl", cB: 0.300, VB: 200 },
                { A: "MgCl2", cA: 0.250, VA: 200, B: "NaCl", cB: 0.100, VB: 200 }] },
        { id: "toioner", titel: "Ionen i det ene glas", ion: "Na",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. De hældes sammen. Hvad er [{ion}] og [{ion2}]?",
          tal: [{ A: "Na2SO4", cA: 0.200, VA: 150, B: "NaCl", cB: 0.400, VB: 50, ion: "Na", ion2: "SO4" },
                { A: "CaCl2", cA: 0.200, VA: 100, B: "NaCl", cB: 0.200, VB: 100, ion: "Cl", ion2: "Ca" },
                { A: "K3PO4", cA: 0.100, VA: 100, B: "KCl", cB: 0.300, VB: 100, ion: "K", ion2: "PO4" },
                { A: "Na2SO4", cA: 0.100, VA: 100, B: "Na3PO4", cB: 0.100, VB: 100, ion: "Na", ion2: "SO4" }] }
    ];

    /* ----- Regnetrinene -------------------------------------------------------------------
       formel: formlen, eleven skriver foerst ("" = kun tallet).
       Venstresiden og tallene afhaenger af opgaven og laves i tjek.js. */
    D.TRIN = {
        afstem: { navn: "Opløsningsskemaet", enhed: "" },
        M: { navn: "Molarmassen", enhed: "g/mol", formel: "" },
        n_mM: { navn: "Stofmængden", enhed: "mol", formel: "m / M",
                formelHint: "Du kender massen og molarmassen. Hvor mange gange går molarmassen op i massen?" },
        c: { navn: "Saltets koncentration", enhed: "M", formel: "n / V",
             formelHint: "Du kender stofmængden og rumfanget. Koncentrationen er stofmængde pr. liter." },
        kat: { navn: "Kationen", enhed: "M", formel: "" },
        an: { navn: "Anionen", enhed: "M", formel: "" },
        cSalt: { navn: "Saltets koncentration", enhed: "M", formel: "" },
        anden: { navn: "Den anden ion", enhed: "M", formel: "" },
        bidragA: { navn: "Bidraget fra det første salt", enhed: "M", formel: "" },
        bidragB: { navn: "Bidraget fra det andet salt", enhed: "M", formel: "" },
        total: { navn: "Det hele", enhed: "M", formel: "" },
        nA: { navn: "Stofmængden fra glas A", enhed: "mol", formel: "k · c · V",
              formelHint: "Du kender saltets koncentration og rumfanget i glas A. Husk, hvor mange af ionen hver formelenhed giver." },
        nB: { navn: "Stofmængden fra glas B", enhed: "mol", formel: "k · c · V",
              formelHint: "Du kender saltets koncentration og rumfanget i glas B. Husk, hvor mange af ionen hver formelenhed giver." },
        Vsum: { navn: "Det samlede rumfang", enhed: "L", formel: "" },
        ionBland: { navn: "Koncentrationen i blandingen", enhed: "M", formel: "n / V",
                    formelHint: "Stofmængden af ionen fordeler sig i hele blandingen." },
        ion2: { navn: "Den anden ion", enhed: "M", formel: "n / V",
                formelHint: "Ionen kommer kun fra det ene glas, men den fordeler sig i hele blandingen." }
    };

    /* ----- Replikkerne ------------------------------------------------------------------ */
    D.INTRO = {
        opl: "Et salt deler sig i ioner, når det opløses.",
        ioner: "Formlen siger, hvor mange ioner der kommer.",
        bland: "Når man blander, lægges stofmængderne sammen."
    };
    D.FAERDIG = {
        opl: "Alle seks. Formlen bestemmer, hvor mange ioner der kommer.",
        ioner: "Alle tre niveauer. Tallet foran ionen gør arbejdet.",
        bland: "Alle fire. Stofmængder kan lægges sammen. Koncentrationer kan ikke."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";
    D.KAFFE = [
        "Kold. Som altid.",
        "Nogen har fortyndet den.",
        "Den er fra i morges. Tror jeg.",
        "Kaffen er min. Ionerne er dine.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Regn du.";

    NK.Data = D;
}());

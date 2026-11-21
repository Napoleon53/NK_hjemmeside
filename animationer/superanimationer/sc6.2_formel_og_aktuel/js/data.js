/* =====================================================================
   data.js - saltene, ionerne, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   ionerne og saltene, de tre fanes opgaver med tallene og linjerne i
   opgavekortet. Kemien og tallene regnes i kemi.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc5.1) ----------------------------- */
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
             { portioner } (saa mange portioner) og evt. begge (alle salte i).
       regn: de ioner, beregningen i kortet viser (ellers maalets ion).
       konklusion: beregningens sidste linje, i ord. */
    D.OPL = [
        { id: "nacl", titel: "Natriumchlorid", under: "Lav [Cl⁻] = 0,30 M", salte: ["NaCl"], V: 1000, maal: { ion: "Cl", c: 0.30 },
          tekst: "Lav en opløsning, hvor [Cl⁻] = 0,30 M.",
          linje: "Træk en portion natriumchlorid fra krukken ned i glasset.",
          hint: "Hver portion er 0,10 mol, og glasset har 1,00 L. Hvor mange Cl⁻ giver én formelenhed NaCl?",
          svar: "NaCl ⟶ Na⁺ + Cl⁻. [Cl⁻] = c(NaCl) = 0,30 M. Det er tre portioner.",
          goer: [["NaCl", 3]],
          konklusion: "Den aktuelle koncentration af Cl⁻ er 0,30 M. Det er det samme som c(NaCl)." },
        { id: "na2so4", titel: "Natriumsulfat", under: "Find [Na⁺] trin for trin", salte: ["Na2SO4"], V: 500, maal: { portioner: 1 }, regn: ["Na"],
          tekst: "Opløs en portion (0,10 mol) Na₂SO₄ i glasset med 0,50 L vand.",
          linje: "Træk en portion natriumsulfat ned i glasset.",
          hint: "Træk en portion fra krukken ned i glasset, eller klik på krukken.",
          svar: "Der skal én portion Na₂SO₄ i glasset med 0,50 L vand.",
          goer: [["Na2SO4", 1]],
          /* Spoergsmaalene efter opløsningen, ét ad gangen. vis: det, glasset
             og beregningen i kortet viser, naar svaret er fundet (salt: den
             graa soejle og c(salt), lup: ionerne i luppen og skemaet, ioner:
             ionernes soejler og [ion]). note: en saetning efter rosen.
             efter: det, linjen i kortet siger ved Vis svaret. */
          spm: [
              { spm: "Hvad er c(Na₂SO₄)?", vis: "salt",
                hint: "Koncentrationen er stofmængde pr. liter. Du har 0,10 mol i 0,50 L.",
                svar: [{ t: "0,20 M", ok: true },
                       { t: "0,10 M", forkl: "0,10 mol er stofmængden n. Koncentrationen er n / V, og rumfanget er 0,50 L." },
                       { t: "0,050 M", forkl: "Du har ganget med rumfanget. Koncentrationen er n / V = 0,10 mol / 0,50 L." }],
                efter: "c(Na₂SO₄) = 0,10 mol / 0,50 L = 0,20 M." },
              { spm: "Hvor mange Na⁺ giver én formelenhed Na₂SO₄?", vis: "lup",
                hint: "Se på tallet efter Na i formlen Na₂SO₄.",
                svar: [{ t: "2", ok: true },
                       { t: "1", forkl: "Tallet efter Na i Na₂SO₄ er 2. Der er to Na⁺ i hver formelenhed." },
                       { t: "4", forkl: "4 hører til O inde i sulfationen SO₄²⁻. Se på tallet efter Na." }],
                note: "Luppen viser to Na⁺ for hver SO₄²⁻.",
                efter: "Na₂SO₄ ⟶ 2 Na⁺ + SO₄²⁻. Luppen viser to Na⁺ for hver SO₄²⁻." },
              { spm: "Hvad bliver [Na⁺]?", vis: "ioner",
                hint: "c(Na₂SO₄) = 0,20 M, og der er to Na⁺ for hver Na₂SO₄.",
                svar: [{ t: "0,40 M", ok: true },
                       { t: "0,20 M", forkl: "Det er c(Na₂SO₄). Hver Na₂SO₄ giver to Na⁺, så [Na⁺] er dobbelt så stor." },
                       { t: "0,10 M", forkl: "Der kommer flere ioner, ikke færre: to Na⁺ for hver Na₂SO₄." }],
                efter: "[Na⁺] = 2 · 0,20 M = 0,40 M." }
          ],
          konklusion: "Den aktuelle koncentration af Na⁺ er 0,40 M. Det er to gange c(Na₂SO₄)." },
        { id: "fecl3", titel: "Jern(III)chlorid", under: "Lav [Cl⁻] = 0,60 M", salte: ["FeCl3"], V: 1000, maal: { ion: "Cl", c: 0.60 },
          tekst: "Lav en opløsning, hvor [Cl⁻] = 0,60 M.",
          linje: "Træk jern(III)chlorid ned i glasset.",
          hint: "Hver FeCl₃ giver tre Cl⁻. Hvor stor skal c(FeCl₃) så være?",
          svar: "c(FeCl₃) = 0,60 M / 3 = 0,20 M. Det er to portioner i 1,00 L.",
          goer: [["FeCl3", 2]],
          konklusion: "Den aktuelle koncentration af Cl⁻ er 0,60 M. Det er tre gange c(FeCl₃)." },
        { id: "k3po4", titel: "Kaliumphosphat", under: "Lav [K⁺] = 0,60 M", salte: ["K3PO4"], V: 500, maal: { ion: "K", c: 0.60 },
          tekst: "Lav en opløsning, hvor [K⁺] = 0,60 M.",
          linje: "Træk kaliumphosphat ned i glasset.",
          hint: "Hver K₃PO₄ giver tre K⁺, og glasset har 0,50 L.",
          svar: "c(K₃PO₄) = 0,60 M / 3 = 0,20 M, og n = 0,20 M · 0,50 L = 0,10 mol. Det er én portion.",
          goer: [["K3PO4", 1]],
          konklusion: "Den aktuelle koncentration af K⁺ er 0,60 M. Det er tre gange c(K₃PO₄)." },
        { id: "al2so43", titel: "Aluminiumsulfat", under: "Hvilken ion er flest?", salte: ["Al2(SO4)3"], V: 1000, maal: { portioner: 1 }, regn: ["Al", "SO4"],
          tekst: "Du opløser en portion (0,10 mol) Al₂(SO₄)₃ i 1,00 L vand.",
          valg: { spm: "Hvilken ion bliver der flest af, når Al₂(SO₄)₃ opløses i vand?",
                  hint: "Tallet efter Al og tallet efter parentesen siger, hvor mange af hver ion der er i én formelenhed.",
                  svar: [{ t: "SO₄²⁻", ok: true },
                         { t: "Al³⁺", forkl: "Al³⁺ har den største ladning, men der er to Al³⁺ og tre SO₄²⁻ i hver formelenhed." },
                         { t: "Lige mange", forkl: "Tallene i formlen er forskellige: Al₂ og (SO₄)₃." }] },
          linje: "Prøv det. Træk en portion ned i glasset.",
          hint: "Træk en portion fra krukken ned i glasset, eller klik på krukken.",
          svar: "En portion Al₂(SO₄)₃ i 1,00 L.",
          goer: [["Al2(SO4)3", 1]],
          konklusion: "Der er flest SO₄²⁻. Den aktuelle koncentration af SO₄²⁻ er 0,30 M mod 0,20 M for Al³⁺." },
        { id: "begge", titel: "To salte med Na⁺", under: "Lav [Na⁺] = 0,50 M", salte: ["NaCl", "Na2SO4"], V: 1000, maal: { ion: "Na", c: 0.50, begge: true },
          tekst: "Lav en opløsning, hvor [Na⁺] = 0,50 M. Brug begge salte.",
          linje: "Der skal både natriumchlorid og natriumsulfat i.",
          hint: "Na⁺ kommer fra begge salte. NaCl giver én Na⁺, Na₂SO₄ giver to.",
          svar: "Fx tre portioner NaCl og én portion Na₂SO₄: [Na⁺] = 0,30 M + 2 · 0,10 M = 0,50 M.",
          goer: [["NaCl", 3], ["Na2SO4", 1]],
          konklusion: "Den aktuelle koncentration af Na⁺ er 0,50 M. Bidragene fra de to salte lægges sammen." }
    ];

    /* ----- Fane 2: ionerne, i tre niveauer --------------------------------------------------
       Let: salte med 1 : 1, 1 : 2 og 2 : 1. Middel: 1 : 3, 3 : 1 og 2 : 3, og
       halvdelen baglæns (en ions koncentration er målt). Svær: fra massen.
       std er den foerste opgave; derefter traekkes nye. */
    D.NIV = [
        { id: "let", titel: "Let", under: "Fra c(salt) til ionerne", salte: ["NaCl", "KI", "CaCl2", "MgCl2", "BaCl2", "Na2SO4", "K2SO4", "Na2CO3"],
          c: [0.100, 0.120, 0.150, 0.200, 0.240, 0.250, 0.300, 0.400, 0.500],
          std: { salt: "CaCl2", c: 0.240 } },
        { id: "middel", titel: "Middel", under: "Fx FeCl₃ og baglæns", salte: ["FeCl3", "AlCl3", "K3PO4", "Na3PO4", "Al2(SO4)3"],
          c: [0.0500, 0.100, 0.120, 0.150, 0.200, 0.250],
          std: { salt: "Al2(SO4)3", c: 0.120 },
          baglaens: 0.5, stdBag: { salt: "Na3PO4", ion: "an", ionC: 0.150 } },
        { id: "svaer", titel: "Svær", under: "Fra massen til ionerne", salte: ["Pb(NO3)2", "CaCl2", "Na2SO4", "AlCl3", "K3PO4", "MgCl2", "Al2(SO4)3"],
          n: [0.00500, 0.0100, 0.0125, 0.0200, 0.0250, 0.0500], V: [100, 250, 500],
          std: { salt: "Pb(NO3)2", m: 4.14, V: 250 } }
    ];

    /* ----- Fane 3: blandinger ---------------------------------------------------------------
       To glas, A og B, haeldes sammen (lige, forskellig, toioner). ion: den
       ion, der spoerges om (i begge glas); ion2: en ion, der kun er i det
       ene glas. V i mL. samme: to salte vejes af og opløses i det samme glas
       vand (mA og mB i g, V i mL). Masserne er valgt, saa n og c bliver paene
       tal.

       Raekkefoelgen (21. nov. 2026): fanen begynder med Samme rumfang (4 trin)
       og slutter med To salte i ét glas (7 trin fra masser), saa eleven ikke
       moeder en beregning i syv trin med to salte som det foerste.

       start: det foerste maal er trinvist (brugeren 21. nov. 2026, runde 2:
       "svarene i kortet, aldrig i panelet", foerst valg, saa skrive; runde 4:
       en let start). Otte trin, ét ad gangen: eleven haelder glas A og saa
       glas B over i det tomme glas (haeld), svarer paa, hvilke ioner luppen
       viser (ioner), og saa fem spoergsmaal med tre svar hver (trin). Regningen
       staar paa tavlen og vokser linje for linje i den raekkefoelge, eleven
       svarer: V, n(Cl⁻) fra A, n(Cl⁻) fra B og [Cl⁻]. id er linjen paa tavlen,
       fase "formel" er formlen (svarene i D.FORMELVALG), ellers tallet. De
       forkerte tal laves af sim_bland.js (talValg) og er typiske fejl, hver
       med sin forklaring i fejl. hint er hinttrappen, godt rosen. To godt
       (eller intro) er [én til én, flere] eller [ens, forskellige]; se
       sim_bland.js. {A}, {B}, {VA}, {nAled} osv. saettes ind af sim_bland.js.
       Har eleven loest maalet, er alt fremme fra start som i de andre maal. */
    D.BLAND = [
        { id: "lige", under: "Find [Cl⁻] i blandingen", titel: "Samme rumfang", ion: "Cl",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. Find [{ion}], når de hældes sammen.",
          tal: [{ A: "NaCl", cA: 0.200, VA: 100, B: "KCl", cB: 0.200, VB: 100 },
                { A: "NaCl", cA: 0.300, VA: 50, B: "KCl", cB: 0.100, VB: 50 },
                { A: "CaCl2", cA: 0.100, VA: 100, B: "NaCl", cB: 0.200, VB: 100 },
                { A: "KCl", cA: 0.400, VA: 150, B: "NaCl", cB: 0.200, VB: 150 }],
          start: {
              /* Runde 4 (brugeren: "Det lyder ikke særlig nemt at tilgå"): først det
                 konkrete, én handling ad gangen. Trin 1 og 2 haelder glas A og glas B
                 over, trin 3 spoerger om ionerne i luppen, og foerst trin 4 siger maalet. */
              haeld: [
                  { glas: "A", intro: "Glas A og glas B har to forskellige saltopløsninger.",
                    tekst: "Klik på glas A for at hælde det over i det tomme glas.",
                    hint: ["Glas A er glasset med den gule ramme og etiketten A.",
                           "Klik én gang på glas A.",
                           "Du kan også trække glas A hen over det tomme glas."] },
                  { glas: "B", intro: "",
                    tekst: "Klik på glas B for at hælde det over i det samme glas.",
                    hint: ["Glas B er glasset med den gule ramme og etiketten B.",
                           "Klik én gang på glas B.",
                           "Du kan også trække glas B hen over blandingen."] }
              ],
              ioner: {
                  intro: "Luppen viser blandingen.",
                  tekst: "Hvilke ioner er der i blandingen?",
                  svar: [{ t: "{ioner}", ok: true },
                         { t: "{A} og {B}", f: "Saltene er opløst. I vandet findes de som ioner, ikke som {A} og {B}." },
                         { t: "Kun {ion}", f: "Se på kuglerne i luppen. Der er også {kationer} i blandingen." }],
                  hint: ["Hver kugle i luppen er en ion. Læs formlerne på kuglerne.",
                         "{A} og {B} er delt i ioner, da de blev opløst i vand.",
                         "Blandingen har {ioner}."],
                  godt: "{A} og {B} blev delt i ioner, da de blev opløst. Blandingen har {ioner}." },
              trin: [
                  { id: "Vsum", intro: "Nu skal du finde koncentrationen af Cl⁻ i blandingen, [Cl⁻].",
                    tekst: "Hvor stort er det samlede rumfang i blandingsglasset?",
                    fejl: { en: "Det er rumfanget i glas A før hældningen. Aflæs skalaen på blandingsglasset.",
                            dobbelt: "400 mL er den øverste streg på glasset. Aflæs, hvor væsken står i blandingsglasset." },
                    hint: ["Se på skalaen på blandingsglasset.",
                           "Find stregen, hvor væsken står i blandingsglasset.",
                           "Væsken står ved {Vsum} mL."],
                    godt: "Væsken i blandingsglasset står ved {Vsum} mL. V = {Vsum} mL = {VsumL} L." },
                  { id: "nA", fase: "formel", tekst: "Hvilken formel giver stofmængden af Cl⁻ fra glas A?",
                    hint: ["Koncentrationen er stofmængde pr. liter: c = n / V.",
                           "Find n ved at gange begge sider med V.",
                           "Formlen er {formelA}."],
                    godt: ["Koncentrationen er stofmængde pr. liter. Derfor er n = c · V.",
                           "Hver {A} giver {kA} Cl⁻. Derfor er n = {kA} · c · V."] },
                  { id: "nA", tekst: "Hvor mange mol Cl⁻ kommer der fra glas A?",
                    fejl: { mL: "Rumfanget skal være i liter: {VA} mL = {VAL} L.",
                            c: "{cAion} M er koncentrationen af Cl⁻ i glas A. Gang med rumfanget i liter." },
                    hint: ["Brug formlen {formelA}.",
                           "Rumfanget skal være i liter: {VA} mL = {VAL} L.",
                           "n = {nAled}."],
                    godt: "n(Cl⁻) fra A = {nAled}." },
                  { id: "nB", tekst: "Hvor mange mol Cl⁻ kommer der fra glas B?",
                    fejl: { mL: "Rumfanget skal være i liter: {VB} mL = {VBL} L.",
                            c: "{cBion} M er koncentrationen af Cl⁻ i glas B. Gang med rumfanget i liter." },
                    hint: ["Regn som for glas A: {formelB}.",
                           "Rumfanget skal være i liter: {VB} mL = {VBL} L.",
                           "n = {nBled}."],
                    godt: "n(Cl⁻) fra B = {nBled}." },
                  { id: "ionBland", tekst: "Hvad er [Cl⁻] i blandingen?",
                    fejl: { sum: "Koncentrationer kan ikke lægges sammen. Cl⁻ fra begge glas fordeler sig i hele blandingen.",
                            en: "Det er kun Cl⁻ fra glas A. Læg stofmængderne fra begge glas sammen." },
                    hint: ["Koncentrationen er stofmængde pr. liter: [Cl⁻] = n / V.",
                           "n er Cl⁻ fra begge glas: {nA} mol + {nB} mol.",
                           "V er hele blandingen: {VsumL} L."],
                    godt: ["[Cl⁻] = {ionLed}. Der er dobbelt så mange Cl⁻ i dobbelt så stort rumfang. Derfor er [Cl⁻] den samme som i hvert glas.",
                           "[Cl⁻] = {ionLed}. Rumfangene er lige store, så [Cl⁻] ligger midt mellem {cAion} M og {cBion} M."] }
              ]
          } },
        { id: "forskellig", under: "Find [Cl⁻] i blandingen", titel: "Forskelligt rumfang", ion: "Cl",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. Find [{ion}], når de hældes sammen.",
          tal: [{ A: "CaCl2", cA: 0.300, VA: 100, B: "NaCl", cB: 0.150, VB: 200 },
                { A: "NaCl", cA: 0.200, VA: 150, B: "CaCl2", cB: 0.100, VB: 50 },
                { A: "AlCl3", cA: 0.100, VA: 100, B: "KCl", cB: 0.300, VB: 200 },
                { A: "MgCl2", cA: 0.250, VA: 200, B: "NaCl", cB: 0.100, VB: 200 }] },
        { id: "toioner", titel: "Ionen i det ene glas", under: "Find to koncentrationer", ion: "Na",
          tekst: "Glas A har {VA} {cA} M {A}. Glas B har {VB} {cB} M {B}. Find [{ion}] og [{ion2}], når de hældes sammen.",
          tal: [{ A: "Na2SO4", cA: 0.200, VA: 150, B: "NaCl", cB: 0.400, VB: 50, ion: "Na", ion2: "SO4" },
                { A: "CaCl2", cA: 0.200, VA: 100, B: "NaCl", cB: 0.200, VB: 100, ion: "Cl", ion2: "Ca" },
                { A: "K3PO4", cA: 0.100, VA: 100, B: "KCl", cB: 0.300, VB: 100, ion: "K", ion2: "PO4" },
                { A: "Na2SO4", cA: 0.100, VA: 100, B: "Na3PO4", cB: 0.100, VB: 100, ion: "Na", ion2: "SO4" }] },
        { id: "samme", titel: "To salte i ét glas", under: "Fra masserne til [Cl⁻]", ion: "Cl",
          tekst: "Find [{ion}], når du opløser {mA} g {A} og {mB} g {B} i {V} vand.",
          tal: [{ A: "CaCl2", mA: 5.55, B: "AlCl3", mB: 4.00, V: 200 }, { A: "NaCl", mA: 2.92, B: "CaCl2", mB: 2.78, V: 250 },
                { A: "MgCl2", mA: 2.86, B: "KCl", mB: 2.98, V: 200 }, { A: "BaCl2", mA: 5.21, B: "FeCl3", mB: 4.06, V: 250 }] }
    ];

    /* ----- Regnetrinene -------------------------------------------------------------------
       formel: formlen, eleven skriver foerst ("" = kun tallet). {A} og {B} i
       navnet bliver til saltenes formler.
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
        nSA: { navn: "Stofmængden af {A}", enhed: "mol", formel: "m / M",
               formelHint: "Du kender massen og molarmassen. Formlen begynder n = m / …" },
        nSB: { navn: "Stofmængden af {B}", enhed: "mol", formel: "m / M",
               formelHint: "Du kender massen og molarmassen. Formlen begynder n = m / …" },
        cSA: { navn: "Koncentrationen af {A}", enhed: "M", formel: "n / V",
               formelHint: "Du kender stofmængden og rumfanget. Koncentrationen er stofmængde pr. liter: c = n / …" },
        cSB: { navn: "Koncentrationen af {B}", enhed: "M", formel: "n / V",
               formelHint: "Du kender stofmængden og rumfanget. Koncentrationen er stofmængde pr. liter: c = n / …" },
        bidragA: { navn: "Bidraget fra {A}", enhed: "M", formel: "" },
        bidragB: { navn: "Bidraget fra {B}", enhed: "M", formel: "" },
        total: { navn: "Den samlede koncentration", enhed: "M", formel: "" },
        nA: { navn: "Stofmængden fra glas A", enhed: "mol", formel: "k · c · V",
              formelHint: "Du kender saltets koncentration og rumfanget i glas A. Husk, hvor mange af ionen hver formelenhed giver." },
        nB: { navn: "Stofmængden fra glas B", enhed: "mol", formel: "k · c · V",
              formelHint: "Du kender saltets koncentration og rumfanget i glas B. Husk, hvor mange af ionen hver formelenhed giver." },
        Vsum: { navn: "Det samlede rumfang", enhed: "mL", formel: "" },
        ionBland: { navn: "Koncentrationen i blandingen", enhed: "M", formel: "n / V",
                    formelHint: "Stofmængden af ionen fordeler sig i hele blandingen." },
        ion2: { navn: "Den anden ion", enhed: "M", formel: "n / V",
                formelHint: "Ionen kommer kun fra det ene glas, men den fordeler sig i hele blandingen." }
    };

    /* ----- Formlerne vaelges paa kortet (runde 2, 21. nov. 2026) ------------------------
       Et formeltrin har tre svar: den rigtige formel og to typiske fejl, hver
       med sin forklaring (f). godt er rosen. {k} er tallet foran ionen, {salt}
       saltet i glasset, {ion} ionen og {glas} det glas, ionen kommer fra.
       Hvilken slags hvert trin har, staar i tjek.js (T.formelValg). */
    D.FORMELVALG = {
        mM: { svar: [{ t: "n = m / M", ok: true },
                     { t: "n = M / m", f: "Molarmassen er masse pr. mol. Stofmængden er massen delt med molarmassen." },
                     { t: "n = m · M", f: "Massen skal deles med molarmassen, ikke ganges med den." }],
              godt: "Molarmassen er masse pr. mol. Derfor er n = m / M." },
        nV: { svar: [{ t: "c = n / V", ok: true },
                     { t: "c = m / V", f: "Koncentrationen er stofmængde pr. liter, ikke masse pr. liter. Brug stofmængden n." },
                     { t: "c = n · V", f: "Koncentrationen er stofmængde pr. liter. Stofmængden skal deles med rumfanget." }],
              godt: "Koncentrationen er stofmængde pr. liter. Derfor er c = n / V." },
        cV: { svar: [{ t: "n = c · V", ok: true },
                     { t: "n = c / V", f: "Koncentrationen er stofmængde pr. liter. Stofmængden er derfor koncentrationen gange rumfanget." },
                     { t: "n = V / c", f: "Rumfanget skal ganges med koncentrationen, ikke deles med den." }],
              godt: "Koncentrationen er stofmængde pr. liter. Derfor er n = c · V." },
        kcV: { svar: [{ t: "n = {k} · c · V", ok: true },
                      { t: "n = c · V", f: "Hver {salt} giver {k} {ion}. Gang også med {k}." },
                      { t: "n = c / V", f: "Koncentrationen er stofmængde pr. liter. Stofmængden er derfor koncentrationen gange rumfanget." }],
               godt: "Hver {salt} giver {k} {ion}. Derfor er n = {k} · c · V." },
        ionV: { svar: [{ t: "[{ion}] = n / V", ok: true },
                       { t: "[{ion}] = c(A) + c(B)", f: "Koncentrationer kan ikke lægges sammen. {ion} fra begge glas fordeler sig i hele blandingen." },
                       { t: "[{ion}] = n · V", f: "Koncentrationen er stofmængde pr. liter. Stofmængden skal deles med rumfanget." }],
                godt: "{ion} fra begge glas fordeler sig i hele blandingen. Derfor deles stofmængden med det samlede rumfang." },
        ion2V: { svar: [{ t: "[{ion}] = n / V", ok: true },
                        { t: "[{ion}] = n / V({glas})", f: "{ion} kommer kun fra glas {glas}, men den fordeler sig i hele blandingen. Brug det samlede rumfang." },
                        { t: "[{ion}] = n · V", f: "Koncentrationen er stofmængde pr. liter. Stofmængden skal deles med rumfanget." }],
                 godt: "{ion} fra glas {glas} fordeler sig i hele blandingen. Derfor deles med det samlede rumfang." }
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
        bland: "Alle fire. Stofmængder kan lægges sammen, men koncentrationer kan ikke lægges sammen."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];
    /* Et klik i scenen, foer der er gaettet (papirkortet, 6. nov. 2026) */
    D.GAET_LINJE = "Gæt først. Vælg et af svarene på kortet.";

    NK.Data = D;
}());

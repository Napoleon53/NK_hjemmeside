/* =====================================================================
   data.js - fedtsyrerne, fedtstofferne, stederne, ordrerne,
   opgaverne og replikkerne

   Alt, der kan staa som data, staar her.

   Smeltepunkterne for de rene fedtstoffer er for den mest stabile
   krystalform (beta) og kommer fra oversigten "Triglycerides as Novel
   Phase-Change Materials: A Review and Assessment of Their Thermal
   Properties" (PubMed Central PMC7730147): tristearin 72,6-73,5 °C,
   triolein 4,0-5,0 °C, trilinolein -11 til -12,9 °C, trilinolenin
   -24,2 °C. SOS (1,3-distearoyl-2-oleoylglycerol, det typiske molekyle
   i kakaosmoer) smelter ved 43,0 °C (beta-1), fra "Binary Phase
   Behavior of 1,3-Distearoyl-2-oleoyl-sn-glycerol (SOS) and Trilaurin
   (LLL)" (PMC7698300). De oevrige 15 fedtstoffer er regnet med
   modellen i NK.Fedt.smp (se README).

   Sammensaetningen af de rigtige fedtstoffer paa fane 2 er typiske
   vaerdier for fedtsyrerne i procent (som paa en varedeklaration).
   Den faste andel ved de fire temperaturer er typiske vaerdier og
   afrundet; den afgoer, om fedtet er fast, delvist fast eller
   flydende.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Fedtsyrerne --------------------------------------------------------
       Alle har 18 C-atomer. cis: numrene paa de C-atomer, hvor en
       cis-dobbeltbinding begynder (C9=C10 osv.). smpRen: smeltepunktet
       for det rene fedtstof af tre ens fedtsyrer. */
    D.SYRER = [
        { id: "S",  navn: "stearinsyre",  Navn: "Stearinsyre",  db: 0, cis: [],         slags: "mættet",
          formel: "C17H35COOH", smpRen: 73,  farve: "#c4a3f2", omega3: false },
        { id: "O",  navn: "oliesyre",     Navn: "Oliesyre",     db: 1, cis: [9],        slags: "enkeltumættet",
          formel: "C17H33COOH", smpRen: 5,   farve: "#6fd08c", omega3: false },
        { id: "L",  navn: "linolsyre",    Navn: "Linolsyre",    db: 2, cis: [9, 12],    slags: "flerumættet",
          formel: "C17H31COOH", smpRen: -13, farve: "#5fb3f0", omega3: false },
        { id: "Ln", navn: "linolensyre",  Navn: "Linolensyre",  db: 3, cis: [9, 12, 15], slags: "flerumættet",
          formel: "C17H29COOH", smpRen: -24, farve: "#f0a04b", omega3: true }
    ];
    var syreEfterId = {};
    D.SYRER.forEach(function (s, i) { s.nr = i; syreEfterId[s.id] = s; });
    D.syre = function (id) { return syreEfterId[id] || null; };

    /* SOS: to stearinsyrer og én oliesyre (maalt, bruges til modellen) */
    D.SMP_SOS = 43;

    D.dbTekst = function (n) {
        return n === 0 ? "ingen dobbeltbindinger" : (n === 1 ? "1 dobbeltbinding" : n + " dobbeltbindinger");
    };

    /* ----- Stederne i koekkenet -------------------------------------------------- */
    D.STEDER = [
        { id: "fryser", navn: "fryseren",   Navn: "Fryseren",   i: "i fryseren",   T: -18, plads: 2 },
        { id: "koele",  navn: "køleskabet", Navn: "Køleskabet", i: "i køleskabet", T: 5,   plads: 2 },
        { id: "bord",   navn: "køkkenbordet", Navn: "Køkkenbordet", i: "på køkkenbordet", T: 20, plads: 6 },
        { id: "sol",    navn: "solen",      Navn: "I solen",    i: "i solen",      T: 35,  plads: 2 }
    ];
    var stedEfterId = {};
    D.STEDER.forEach(function (s, i) { s.nr = i; stedEfterId[s.id] = s; });
    D.sted = function (id) { return stedEfterId[id] || null; };

    /* Tilstandene. Graenserne er den faste andel i procent. */
    D.TILSTANDE = {
        fast:     { navn: "fast",          Navn: "Fast" },
        delvist:  { navn: "delvist fast",  Navn: "Delvist fast" },
        flydende: { navn: "flydende",      Navn: "Flydende" }
    };
    D.FAST_GRAENSE = 35;      /* mindst saa meget fast: fast */
    D.DELVIST_GRAENSE = 5;    /* mindst saa meget fast: delvist fast */

    D.tilstand = function (fastProcent) {
        if (fastProcent >= D.FAST_GRAENSE) return "fast";
        if (fastProcent >= D.DELVIST_GRAENSE) return "delvist";
        return "flydende";
    };

    /* ----- De rigtige fedtstoffer paa fane 2 ------------------------------------
       andel: fedtsyrerne i procent. Stearinsyre staar for alle de maettede
       (i smoer og kakaosmoer ogsaa palmitinsyre og kortere), oliesyre for
       de enkeltumaettede. fast: den faste andel i procent ved en
       temperatur; imellem regnes der lineaert. farve: fedtets farve. */
    D.FEDT = [
        { id: "smoer", navn: "smør", Navn: "Smør", delt: ["Smør"], farve: "#f3dc7a", laag: "#3f7fd1",
          andel: { S: 66, O: 30, L: 4, Ln: 0 },
          fast: [[-18, 100], [5, 55], [10, 40], [20, 18], [30, 4], [35, 1], [40, 0]] },
        { id: "kakao", navn: "kakaosmør", Navn: "Kakaosmør", delt: ["Kakao-", "smør"], farve: "#efe1c6", laag: "#7a4a2b",
          andel: { S: 62, O: 35, L: 3, Ln: 0 },
          fast: [[-18, 100], [5, 85], [20, 78], [25, 70], [30, 45], [35, 2], [40, 0]] },
        { id: "oliven", navn: "olivenolie", Navn: "Olivenolie", delt: ["Oliven-", "olie"], farve: "#c7c24e", laag: "#4c7a2e",
          andel: { S: 14, O: 75, L: 10, Ln: 1 },
          fast: [[-18, 90], [-5, 60], [0, 35], [5, 14], [10, 2], [15, 0]] },
        { id: "solsikke", navn: "solsikkeolie", Navn: "Solsikkeolie", delt: ["Solsikke-", "olie"], farve: "#f2cf4a", laag: "#e0a21a",
          andel: { S: 11, O: 21, L: 68, Ln: 0 },
          fast: [[-30, 90], [-18, 25], [-10, 3], [-5, 0]] },
        { id: "hoerfroe", navn: "hørfrøolie", Navn: "Hørfrøolie", delt: ["Hørfrø-", "olie"], farve: "#d9a441", laag: "#8a5a2b",
          andel: { S: 10, O: 20, L: 15, Ln: 55 },
          fast: [[-35, 90], [-25, 30], [-18, 2], [-10, 0]] }
    ];
    var fedtEfterId = {};
    D.FEDT.forEach(function (f) { fedtEfterId[f.id] = f; });
    D.fedt = function (id) { return fedtEfterId[id] || null; };

    /* Den faste andel i procent ved temperaturen T, lineaert mellem punkterne */
    D.fastAndel = function (fedt, T) {
        var p = fedt.fast;
        if (T <= p[0][0]) return p[0][1];
        for (var i = 1; i < p.length; i++) {
            if (T <= p[i][0]) {
                var t = (T - p[i - 1][0]) / (p[i][0] - p[i - 1][0]);
                return p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t;
            }
        }
        return p[p.length - 1][1];
    };

    /* Typerne paa varedeklarationen: maettede, enkelt- og flerumaettede */
    D.typer = function (andel) {
        return { maettede: andel.S, enkelt: andel.O, fler: andel.L + andel.Ln };
    };

    /* ----- Tal og tekst --------------------------------------------------------- */
    D.grader = function (T) {
        var s = String(Math.abs(Math.round(T)));
        return (T < -0.5 ? "−" : "") + s;
    };
    D.gradTekst = function (T) { return D.grader(T) + " °C"; };

    /* ----- Fane 1: Fabrikken -------------------------------------------------------
       krav: stedets id -> "fast", "flydende", "ikkeFast" eller
       "ikkeFlydende". "Delvist fast" er hverken fast eller flydende.
       svar: den loesning, Vis svaret bygger. */
    D.ORDRER = [
        { kunde: "Fuglehuset", tekst: "Fedt til fuglekugler. Det må ikke smelte i solen.",
          krav: { sol: "fast" },
          hint: "Rette kæder pakker tæt. Hvilken fedtsyre har ingen knæk?",
          svar: ["S", "S", "S"] },
        { kunde: "Salatbaren", tekst: "Olie til dressing. Den skal være flydende i køleskabet.",
          krav: { koele: "flydende" },
          hint: "Knæk holder kæderne fra hinanden. Vælg fedtsyrer med dobbeltbindinger.",
          svar: ["L", "L", "L"] },
        { kunde: "Restauranten", tekst: "Olie, der er flydende på bordet, men stivner i køleskabet.",
          krav: { bord: "flydende", koele: "ikkeFlydende" },
          hint: "Olivenolie opfører sig sådan. Den er mest oliesyre med ét knæk.",
          svar: ["O", "O", "O"] },
        { kunde: "Chokoladefabrikken", tekst: "Fedt, der er fast på køkkenbordet, men smelter i solen.",
          krav: { bord: "fast", sol: "ikkeFast" },
          hint: "Ét knæk sænker smeltepunktet meget. Prøv to rette kæder og én med mange knæk.",
          svar: ["S", "S", "Ln"] },
        { kunde: "Apoteket", tekst: "Omega-3-olie til kapsler. Den skal være flydende i fryseren.",
          krav: { fryser: "flydende" },
          hint: "Linolensyre er en omega-3-fedtsyre. Den har flest knæk.",
          svar: ["Ln", "Ln", "Ln"] }
    ];

    D.KRAV_TEKST = {
        fast: "fast", flydende: "flydende",
        ikkeFast: "ikke fast", ikkeFlydende: "ikke flydende"
    };

    /* Opfylder tilstanden kravet? */
    D.opfylder = function (krav, tilstand) {
        if (krav === "fast") return tilstand === "fast";
        if (krav === "flydende") return tilstand === "flydende";
        if (krav === "ikkeFast") return tilstand !== "fast";
        if (krav === "ikkeFlydende") return tilstand !== "flydende";
        return true;
    };

    /* ----- Fane 2: Koeleskabet ------------------------------------------------------
       Et gaet foerst, saa ser man det. efter: forklaringen bagefter. */
    D.KOELE_OPGAVER = [
        { fedt: "smoer", sted: "koele", svar: "fast",
          hint: "Tænk på smør, der lige er taget ud af køleskabet.",
          efter: "Smør er mest mættet fedt. De rette kæder ligger tæt i rækker." },
        { fedt: "smoer", sted: "bord", svar: "delvist",
          hint: "Kan man smøre smør, der har stået fremme?",
          efter: "Blødt. De mest mættede molekyler ligger stadig i rækker. Resten flyder imellem." },
        { fedt: "oliven", sted: "koele", svar: "delvist",
          hint: "Oliesyre har kun ét knæk. Er det nok ved 5 °C?",
          efter: "Olivenolie bliver tyk og uklar i køleskabet. Ét knæk er ikke nok ved 5 °C." },
        { fedt: "solsikke", sted: "koele", svar: "flydende",
          hint: "Solsikkeolie er mest linolsyre. Den har to knæk.",
          efter: "To knæk i hver kæde. Molekylerne kan ikke pakke sig ved 5 °C." },
        { fedt: "hoerfroe", sted: "fryser", svar: "flydende",
          hint: "Hørfrøolie er mest linolensyre. Den har tre knæk.",
          efter: "Flydende ved −18 °C. Tre knæk holder molekylerne fra hinanden." },
        { fedt: "kakao", sted: "sol", svar: "flydende",
          hint: "Hvad sker der med chokolade i lommen på en varm dag?",
          efter: "Kakaosmør smelter ved ca. 35 °C. Derfor smelter chokolade i munden." }
    ];

    D.KOELE_HVORFOR = {
        spm: "Hvorfor er smør fast i køleskabet, når solsikkeolie er flydende?",
        hint: "Se på zoomvinduet. Hvilke molekyler ligger stille i rækker?",
        valg: [
            { t: "Smørrets kæder er rette og pakker tæt", rigtig: true,
              svar: "Rette kæder ligger tæt og holder godt fast i hinanden. Knæk holder molekylerne på afstand." },
            { t: "Smør kommer fra dyr",
              svar: "Kakaosmør kommer fra en plante og er også fast. Det er kæderne, der afgør det." },
            { t: "Smørrets molekyler er tungere",
              svar: "Nej. Smørrets molekyler er faktisk lidt lettere. Det er formen, der gør forskellen." },
            { t: "Bindingerne inde i olien er svagere",
              svar: "Når fedt smelter, går molekylerne fra hinanden. Bindingerne inde i molekylerne brydes ikke." }
        ]
    };

    /* ----- Kemichael ------------------------------------------------------------- */
    D.INTRO_FABRIK = [
        "Fedtfabrikken. Kunderne står i panelet.",
        "Træk tre fedtsyrer hen på glycerolens OH-grupper.",
        "Kunderne betaler ikke. Det er en skole."
    ];
    D.INTRO_KOELE = [
        "Et køkken: fryser, køleskab, bord og sol.",
        "Træk et glas hen et sted. Vinduet viser molekylerne.",
        "Lad ikke smørret stå i solen. Tro mig."
    ];

    D.ORDRER_FAERDIG = "Fem ordrer leveret. Det glider.";
    D.KOELE_FAERDIG = "Du har styr på køkkenet. Mere end jeg har.";

    /* Paaskeaegget: smoerret har staaet i solen i tre uger */
    D.HARSK_TID = 12;           /* sekunder i solen, foer det bliver harskt */
    D.HARSK = "Smørsyre. Nu lugter køkkenet af surströmming.";
    D.HARSK_IGEN = [
        "Igen. Kaktussen kan også lugte det.",
        "Smør hører til i køleskabet. Det står på pakken.",
        "Jeg har mere smør. Ikke uendeligt meget."
    ];
    D.NYT_SMOER = "Nyt smør. Det her bliver i køleskabet.";

    NK.Data = D;
}());

/* =====================================================================
   data.js - stofklasserne, molekylerne, reagenskortene og niveauerne

   Alt, der kan rettes uden at roere koden, staar her. Molekylerne er
   SMILES og tegnes og navngives af molekylemotoren
   (../../molekylemotor/). Selvtesten tjekker, at motorens navn og
   stofklasse passer med listen.

   Kemien foelger Kemibogen B, kapitel B4, og syntesekortet i afsnit
   B4.7 (sprites/syntesekort.svg er en kopi af bogens figur).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = {};

    /* ----- Stofklasserne -----------------------------------------------
       navn og flertal som i bogen. gruppe er den funktionelle gruppe,
       som den staar i tabellen i B4.7. farve bruges paa lys baggrund. */
    D.KLASSER = {
        alkan:   { navn: "alkan", flertal: "alkaner", gruppe: "kun enkeltbindinger", kort: "C−C", farve: "#2e7d32" },
        alken:   { navn: "alken", flertal: "alkener", gruppe: "dobbeltbinding", kort: "C=C", farve: "#a16207" },
        alkyn:   { navn: "alkyn", flertal: "alkyner", gruppe: "tripelbinding", kort: "C≡C", farve: "#c2410c" },
        halogen: { navn: "halogenalkan", flertal: "halogenalkaner", gruppe: "halogenatom", kort: "R−Br", farve: "#7e22ce" },
        alkohol: { navn: "alkohol", flertal: "alkoholer", gruppe: "hydroxygruppe", kort: "R−OH", farve: "#1d4ed8" },
        aldehyd: { navn: "aldehyd", flertal: "aldehyder", gruppe: "carbonylgruppe for enden", kort: "R−CHO", farve: "#0f766e" },
        keton:   { navn: "keton", flertal: "ketoner", gruppe: "carbonylgruppe inde i kæden", kort: "R−CO−R′", farve: "#b91c1c" },
        syre:    { navn: "carboxylsyre", flertal: "carboxylsyrer", gruppe: "carboxylgruppe", kort: "R−COOH", farve: "#c2410c" },
        ester:   { navn: "ester", flertal: "estere", gruppe: "estergruppe", kort: "R−COO−R′", farve: "#be185d" },
        amin:    { navn: "amin", flertal: "aminer", gruppe: "aminogruppe", kort: "R−NH₂", farve: "#6d28d9" },
        amid:    { navn: "amid", flertal: "amider", gruppe: "amidgruppe", kort: "R−CONH−R′", farve: "#7c2d12" }
    };

    /* Hvad en ny stofklasse kendes paa (kortet, der kommer, naar den er ny i lag 1) */
    D.KENDES_PAA = {
        alkan: "Kun enkeltbindinger mellem carbonatomerne og ingen andre atomer end C og H.",
        alken: "En dobbeltbinding mellem to carbonatomer.",
        alkyn: "En tripelbinding mellem to carbonatomer.",
        halogen: "Et halogenatom, fx Br eller Cl, bundet til et carbonatom.",
        alkohol: "En OH-gruppe på et carbonatom, der ikke har en dobbeltbinding til O.",
        aldehyd: "C=O for enden af kæden. Carbonatomet har også et H.",
        keton: "C=O inde i kæden. Carbonatomet sidder mellem to andre carbonatomer.",
        syre: "C=O og OH på det samme carbonatom: COOH.",
        ester: "C=O, og O bundet til et andet carbonatom: COO mellem to kæder.",
        amin: "Et nitrogenatom bundet til et eller flere carbonatomer, fx NH₂.",
        amid: "C=O, og N bundet til det samme carbonatom: CONH."
    };

    /* ----- Molekylerne -------------------------------------------------
       [klasse, navn, SMILES, trivialnavn]. Kun kaeder (ingen ringe), saa
       det er den funktionelle gruppe, der skiller. */
    D.MOLEKYLER = [
        ["alkan", "ethan", "CC"], ["alkan", "propan", "CCC"], ["alkan", "butan", "CCCC"],
        ["alkan", "2-methylpropan", "CC(C)C"], ["alkan", "pentan", "CCCCC"], ["alkan", "2-methylbutan", "CC(C)CC"],
        ["alkan", "hexan", "CCCCCC"], ["alkan", "2,2-dimethylpropan", "CC(C)(C)C"], ["alkan", "3-methylpentan", "CCC(C)CC"],

        ["alken", "ethen", "C=C"], ["alken", "propen", "C=CC"], ["alken", "but-1-en", "C=CCC"],
        ["alken", "but-2-en", "CC=CC"], ["alken", "2-methylpropen", "C=C(C)C"], ["alken", "pent-1-en", "C=CCCC"],
        ["alken", "pent-2-en", "CC=CCC"], ["alken", "hex-3-en", "CCC=CCC"], ["alken", "hex-1-en", "C=CCCCC"],
        ["alken", "2-methylbut-2-en", "CC=C(C)C"], ["alken", "3-methylbut-1-en", "C=CC(C)C"],

        ["alkyn", "ethyn", "C#C"], ["alkyn", "propyn", "C#CC"], ["alkyn", "but-1-yn", "C#CCC"],
        ["alkyn", "but-2-yn", "CC#CC"], ["alkyn", "pent-2-yn", "CC#CCC"], ["alkyn", "pent-1-yn", "C#CCCC"],
        ["alkyn", "hex-3-yn", "CCC#CCC"],

        ["halogen", "bromethan", "CCBr"], ["halogen", "1-brompropan", "CCCBr"], ["halogen", "2-brompropan", "CC(Br)C"],
        ["halogen", "1-brombutan", "CCCCBr"], ["halogen", "2-brombutan", "CCC(C)Br"],
        ["halogen", "2-brom-2-methylpropan", "CC(C)(C)Br"], ["halogen", "chlorethan", "CCCl"],
        ["halogen", "1-brompentan", "CCCCCBr"], ["halogen", "2-brompentan", "CCCC(C)Br"], ["halogen", "3-brompentan", "CCC(Br)CC"],
        ["halogen", "1-brom-2-methylpropan", "CC(C)CBr"], ["halogen", "2-chlorpropan", "CC(Cl)C"],

        ["alkohol", "methanol", "CO"], ["alkohol", "ethanol", "CCO"], ["alkohol", "propan-1-ol", "CCCO"],
        ["alkohol", "propan-2-ol", "CC(O)C"], ["alkohol", "butan-1-ol", "CCCCO"], ["alkohol", "butan-2-ol", "CCC(C)O"],
        ["alkohol", "2-methylpropan-1-ol", "CC(C)CO"], ["alkohol", "2-methylpropan-2-ol", "CC(C)(C)O"],
        ["alkohol", "pentan-3-ol", "CCC(O)CC"], ["alkohol", "pentan-1-ol", "CCCCCO"], ["alkohol", "pentan-2-ol", "CCCC(C)O"],
        ["alkohol", "3-methylbutan-1-ol", "CC(C)CCO"], ["alkohol", "2-methylbutan-2-ol", "CCC(C)(C)O"], ["alkohol", "hexan-1-ol", "CCCCCCO"],

        ["aldehyd", "methanal", "C=O", "formaldehyd"], ["aldehyd", "ethanal", "CC=O", "acetaldehyd"],
        ["aldehyd", "propanal", "CCC=O"], ["aldehyd", "butanal", "CCCC=O"], ["aldehyd", "2-methylpropanal", "CC(C)C=O"],
        ["aldehyd", "pentanal", "CCCCC=O"], ["aldehyd", "3-methylbutanal", "CC(C)CC=O"], ["aldehyd", "hexanal", "CCCCCC=O"],

        ["keton", "propanon", "CC(=O)C", "acetone"], ["keton", "butanon", "CCC(=O)C"],
        ["keton", "pentan-2-on", "CCCC(=O)C"], ["keton", "pentan-3-on", "CCC(=O)CC"],
        ["keton", "3-methylbutan-2-on", "CC(C)C(=O)C"], ["keton", "hexan-2-on", "CCCCC(C)=O"], ["keton", "hexan-3-on", "CCCC(=O)CC"],

        ["syre", "methansyre", "OC=O", "myresyre"], ["syre", "ethansyre", "CC(=O)O", "eddikesyre"],
        ["syre", "propansyre", "CCC(=O)O"], ["syre", "butansyre", "CCCC(=O)O", "smørsyre"],
        ["syre", "2-methylpropansyre", "CC(C)C(=O)O"], ["syre", "pentansyre", "CCCCC(=O)O"],
        ["syre", "3-methylbutansyre", "CC(C)CC(=O)O"], ["syre", "hexansyre", "CCCCCC(=O)O"],

        ["ester", "methylethanoat", "CC(=O)OC"], ["ester", "ethylethanoat", "CC(=O)OCC"],
        ["ester", "methylpropanoat", "CCC(=O)OC"], ["ester", "ethylmethanoat", "O=COCC"],
        ["ester", "propylethanoat", "CC(=O)OCCC"], ["ester", "ethylpropanoat", "CCC(=O)OCC"],
        ["ester", "butylethanoat", "CC(=O)OCCCC"], ["ester", "methylmethanoat", "O=COC"], ["ester", "propylmethanoat", "O=COCCC"],
        ["ester", "propylpropanoat", "CCC(=O)OCCC"], ["ester", "ethylbutanoat", "CCCC(=O)OCC"], ["ester", "methylbutanoat", "CCCC(=O)OC"],

        ["amin", "methylamin", "CN"], ["amin", "ethylamin", "CCN"], ["amin", "propylamin", "CCCN"],
        ["amin", "dimethylamin", "CNC"], ["amin", "butylamin", "CCCCN"], ["amin", "propan-2-amin", "CC(N)C"],
        ["amin", "pentylamin", "CCCCCN"], ["amin", "diethylamin", "CCNCC"], ["amin", "trimethylamin", "CN(C)C"],

        ["amid", "ethanamid", "CC(=O)N"], ["amid", "propanamid", "CCC(=O)N"], ["amid", "N-methylethanamid", "CC(=O)NC"],
        ["amid", "N-ethylethanamid", "CC(=O)NCC"], ["amid", "butanamid", "CCCC(=O)N"], ["amid", "methanamid", "NC=O"],
        ["amid", "N-ethylpropanamid", "CCC(=O)NCC"], ["amid", "N,N-dimethylethanamid", "CC(=O)N(C)C"]
    ];

    /* ----- Testene (lag 1 fra niveau 9) ----------------------------------
       Tabellen "Test for stofklasser" i B4.7. klasser er dem, der giver
       udslag i spillet. */
    D.TEST = {
        bromvand: { tekst: "affarver bromvand", klasser: ["alken", "alkyn"],
                    hvorfor: "Bromvand affarves af en dobbeltbinding eller en tripelbinding mellem to carbonatomer." },
        tollens:  { tekst: "giver sølvspejl med Tollens' reagens", klasser: ["aldehyd"],
                    hvorfor: "Kun et aldehyd giver sølvspejl. En keton reagerer ikke med Tollens' reagens." },
        dnph:     { tekst: "giver gult bundfald med DNPH", klasser: ["aldehyd", "keton"],
                    hvorfor: "DNPH giver bundfald med en carbonylgruppe i et aldehyd eller en keton." },
        surt:     { tekst: "giver pH under 7 i vand", klasser: ["syre"],
                    hvorfor: "En carboxylsyre afgiver H⁺ til vandet, så pH bliver under 7." },
        basisk:   { tekst: "giver pH over 7 i vand", klasser: ["amin"],
                    hvorfor: "En amin er en svag base og optager H⁺ fra vandet, så pH bliver over 7." }
    };

    /* ----- Reagenskortene (lag 2 og 3) ------------------------------------
       Det, der staar over og under pilen. type er reaktionstypen, som den
       typisk er med kortet; den rigtige type afgoeres af reaktionen. */
    D.KORT = [
        { id: "br2",    over: "Br₂",          under: "lys",              titel: "Dibrom og lys" },
        { id: "h2",     over: "H₂",           under: "katalysator",      titel: "Dihydrogen" },
        { id: "hbr",    over: "HBr",          under: "",                 titel: "Hydrogenbromid" },
        { id: "vand",   over: "H₂O",          under: "syre",             titel: "Vand og syre" },
        { id: "h2so4",  over: "konc. H₂SO₄",  under: "varme",            titel: "Svovlsyre og varme" },
        { id: "base",   over: "stærk base",   under: "varme",            titel: "Stærk base" },
        { id: "mild",   over: "KMnO₄",        under: "destillér",        titel: "Mild oxidation" },
        { id: "kraftig",over: "KMnO₄",        under: "overskud",         titel: "Kraftig oxidation" },
        { id: "kond",   over: "+ partner",    under: "H₂SO₄, varme",     titel: "Kondensation" }
    ];

    /* Reaktionstyperne med bogens farver (B4_TYPEFARVE i bogens figurkode) */
    D.TYPER = {
        substitution: { navn: "substitution", farve: "#6b7280" },
        addition:     { navn: "addition", farve: "#0f766e" },
        elimination:  { navn: "elimination", farve: "#b45309" },
        oxidation:    { navn: "oxidation", farve: "#a93226" },
        kondensation: { navn: "kondensation", farve: "#1d4ed8" },
        hydrolyse:    { navn: "hydrolyse", farve: "#7c3aed" }
    };
    D.TYPE_ORDEN = ["substitution", "addition", "elimination", "kondensation", "hydrolyse", "oxidation"];

    /* Kendetegnet for hver type (tabellen i B4.7), til forklaringerne */
    D.KENDETEGN = {
        substitution: "Et atom erstattes af et andet atom.",
        addition: "To atomer bindes til carbonatomerne i en dobbelt- eller tripelbinding.",
        elimination: "Et lille molekyle fraspaltes fra to nabocarbonatomer, og der dannes en dobbeltbinding.",
        kondensation: "To molekyler bindes sammen, og der fraspaltes vand.",
        hydrolyse: "Et molekyle spaltes af vand.",
        oxidation: "Carbonatomet får flere bindinger til oxygen eller færre til hydrogen."
    };

    /* ----- Lag 1: Grupperne -----------------------------------------------
       Molekylerne dukker op i hullerne, og eleven slaar dem, der hoerer
       til gruppen paa skiltet oeverst. Gruppen skifter efter prMaal
       rigtige (standard PR_MAAL). oppe er ms, et molekyle er fremme, nyt
       ms mellem molekylerne, maks hoejst paa én gang.

       Eleven vaelger niveauet paa startkortet (Niels 27. nov. 2026: "det
       maa gerne vaere muligt at saette niveauet op.. det skal foerst vaere
       i niveau 10 at man kan begynde at saette en rekord"). Niveau 1-9 er
       oevelse og fortsaetter op gennem niveauerne; kun et spil, der
       begynder paa niveau 10 (REKORD_NIVEAU), giver rekord og top 10.
       Paa niveau 10 skifter gruppen tilfaeldigt blandt ALLE_MAAL, og for
       hver TEMPO_PR rigtige bliver det HURTIGERE gange hurtigere og giver
       TID_PR_NIVEAU sekunder mere. */
    D.LAG1 = {
        TID: 90,              /* s ved start */
        TID_PR_NIVEAU: 10,    /* s mere for hvert nyt niveau (og hvert tempo paa niveau 10) */
        LIV: 3,
        PR_MAAL: 4,           /* rigtige slag, foer gruppen skifter */
        ANDEL_MAAL: 0.45,     /* andel af molekylerne, der hoerer til gruppen */
        POINT: 100,
        POINT_PR_NIVEAU: 10,
        SERIE: 5,             /* rigtige i traek pr. trin i gangefaktoren */
        MAKS_FAKTOR: 5,
        REKORD_NIVEAU: 10,
        TEMPO_PR: 8,
        HURTIGERE: 0.95,
        SKIFT_MS: 1400,       /* saa laenge staar den nye gruppe midt i scenen */
        NIVEAUER: [
            { navn: "Alkan, alken, alkohol", typer: ["alkan", "alken", "alkohol"], maal: ["alkohol", "alken", "alkan"], ny: ["alkan", "alken", "alkohol"], oppe: 2700, nyt: 1150, maks: 2 },
            { navn: "+ carboxylsyre", typer: ["alkan", "alken", "alkohol", "syre"], maal: ["syre", "alkohol"], ny: ["syre"], oppe: 2500, nyt: 1050, maks: 3 },
            { navn: "+ aldehyd", typer: ["alkan", "alkohol", "syre", "aldehyd"], maal: ["aldehyd", "syre"], ny: ["aldehyd"], oppe: 2400, nyt: 1000, maks: 3 },
            { navn: "+ keton", typer: ["alkohol", "syre", "aldehyd", "keton"], maal: ["keton", "aldehyd"], ny: ["keton"], oppe: 2300, nyt: 950, maks: 3 },
            { navn: "+ ester", typer: ["alkohol", "syre", "aldehyd", "keton", "ester"], maal: ["ester", "syre"], ny: ["ester"], oppe: 2200, nyt: 900, maks: 4 },
            { navn: "+ amin", typer: ["alkohol", "syre", "keton", "ester", "amin"], maal: ["amin", "ester"], ny: ["amin"], oppe: 2100, nyt: 860, maks: 4 },
            { navn: "+ halogenalkan, alkyn", typer: ["alkan", "alken", "alkyn", "halogen", "alkohol"], maal: ["halogen", "alkyn"], ny: ["halogen", "alkyn"], oppe: 2000, nyt: 820, maks: 4 },
            { navn: "+ amid", typer: ["syre", "ester", "amin", "amid", "keton"], maal: ["amid", "amin"], ny: ["amid"], oppe: 1900, nyt: 780, maks: 4 },
            { navn: "Testene", typer: ["alkan", "alken", "alkyn", "alkohol", "aldehyd", "keton", "syre", "ester", "amin"],
              maal: ["t:bromvand", "t:dnph", "t:tollens", "t:surt", "t:basisk"], prMaal: 3, test: true, oppe: 1850, nyt: 750, maks: 5 },
            { navn: "Det hele", typer: ["alkan", "alken", "alkyn", "halogen", "alkohol", "aldehyd", "keton", "syre", "ester", "amin", "amid"],
              maal: null, alle: true, oppe: 1800, nyt: 720, maks: 5 }
        ],
        ALLE_MAAL: ["alken", "alkyn", "halogen", "alkohol", "aldehyd", "keton", "syre", "ester", "amin", "amid",
                    "t:bromvand", "t:tollens", "t:dnph", "t:surt", "t:basisk"]
    };

    /* Hvilke klasser ligner hinanden? Lag 1 laegger gerne en af dem ind
       blandt molekylerne, saa gruppen skal ses, ikke gaettes. */
    D.LIGNER = {
        alkan: ["alken", "halogen"], alken: ["alkan", "alkyn"], alkyn: ["alken"], halogen: ["alkan", "alkohol"],
        alkohol: ["syre", "aldehyd", "amin"], aldehyd: ["keton", "syre"], keton: ["aldehyd", "ester"],
        syre: ["ester", "alkohol"], ester: ["syre", "keton"], amin: ["amid", "alkohol"], amid: ["amin", "ester"]
    };

    /* ----- Lag 2: Reaktionerne ---------------------------------------------
       To maader at spille paa (Niels 27. nov. 2026: "et aktivt valg, hvor
       man skal se hvor mange man kan klare paa 1 minut. (Det vil vaere
       highscoren)"):
         minut   60 sekunder; point = rigtige minus forkerte. Rekord og top 10.
         oev     ingen tid, tre liv, niveauer med fem spoergsmaal. Ingen rekord.
       Spoergsmaalstyperne:
         produkt      hvilket stof dannes?
         type         hvilken reaktionstype er det?
         reagens      hvad staar over pilen?
         udgangsstof  hvilket stof var udgangsstoffet? */
    var ALLE_KORT = ["br2", "h2", "hbr", "vand", "h2so4", "base", "mild", "kraftig", "kond"];
    D.LAG2 = {
        LIV: 3,
        PR_NIVEAU: 5,
        POINT: 100,             /* gange niveauet (oev) */
        SERIE_BONUS: 0.1,       /* pr. rigtigt svar i traek, hoejst MAKS_SERIE */
        MAKS_SERIE: 10,
        MINUT: { tid: 60, ventRigtig: 600, ventForkert: 1400,
                 spm: ["produkt", "produkt", "produkt", "type", "type", "reagens", "udgangsstof"], kort: ALLE_KORT, titel: "1 minut" },
        NIVEAUER: [
            { spm: ["produkt"], kort: ["h2", "vand", "hbr"], titel: "Addition" },
            { spm: ["produkt", "produkt", "type"], kort: ["mild", "kraftig"], titel: "Oxidation" },
            { spm: ["produkt", "type"], kort: ["h2so4", "base", "br2"], titel: "Elimination og substitution" },
            { spm: ["produkt", "type"], kort: ["kond", "vand"], titel: "Kondensation og hydrolyse" },
            { spm: ["reagens", "produkt", "type"], kort: ALLE_KORT, titel: "Over pilen" },
            { spm: ["udgangsstof", "reagens", "produkt"], kort: ALLE_KORT, titel: "Baglæns" },
            { spm: ["produkt", "type", "reagens", "udgangsstof"], kort: ALLE_KORT, titel: "Det hele" }
        ]
    };

    /* Udgangsstoffer til lag 2 (navne fra MOLEKYLER), efter kortet. Kun
       stoffer, kortet reagerer med, og kun op til 5 C, saa tegningerne
       kan sammenlignes. */
    D.LAG2_STOFFER = {
        h2: ["ethen", "propen", "but-1-en", "but-2-en", "2-methylpropen", "pent-2-en", "hex-1-en", "2-methylbut-2-en",
             "3-methylbut-1-en"],
        vand: ["ethen", "propen", "but-1-en", "but-2-en", "2-methylpropen", "pent-1-en", "hex-3-en", "2-methylbut-2-en",
               "methylethanoat", "ethylethanoat", "methylpropanoat", "propylethanoat", "ethylpropanoat", "methylbutanoat",
               "ethylbutanoat", "propylmethanoat"],
        hbr: ["ethen", "propen", "but-1-en", "but-2-en", "2-methylpropen", "pent-2-en", "hex-3-en", "3-methylbut-1-en"],
        h2so4: ["ethanol", "propan-1-ol", "propan-2-ol", "butan-1-ol", "butan-2-ol", "2-methylpropan-2-ol", "pentan-3-ol",
                "pentan-1-ol", "3-methylbutan-1-ol", "2-methylbutan-2-ol"],
        base: ["bromethan", "1-brompropan", "2-brompropan", "1-brombutan", "2-brombutan", "2-brom-2-methylpropan",
               "1-brompentan", "3-brompentan", "1-brom-2-methylpropan", "2-chlorpropan"],
        br2: ["ethan", "propan", "butan", "2-methylpropan", "2,2-dimethylpropan"],
        mild: ["methanol", "ethanol", "propan-1-ol", "propan-2-ol", "butan-1-ol", "butan-2-ol", "2-methylpropan-1-ol",
               "2-methylpropan-2-ol", "pentan-3-ol", "pentan-1-ol", "pentan-2-ol", "3-methylbutan-1-ol", "2-methylbutan-2-ol",
               "ethanal", "propanal", "butanal", "propanon", "butanon"],
        kraftig: ["ethanol", "propan-1-ol", "propan-2-ol", "butan-1-ol", "butan-2-ol", "2-methylpropan-1-ol",
                  "2-methylpropan-2-ol", "pentan-1-ol", "3-methylbutan-1-ol", "pentan-2-ol", "propanal", "butanal",
                  "3-methylbutanal", "propanon", "pentan-3-on"],
        kond: ["ethansyre", "propansyre", "methansyre", "butansyre"]
    };
    /* Partnere til kondensationen i lag 2 */
    D.LAG2_PARTNERE = ["methanol", "ethanol", "propan-1-ol", "butan-1-ol", "ethylamin", "methylamin", "propylamin"];

    /* ----- Lag 3: Syntesen ------------------------------------------------
       Seks synteser pr. runde, én fra hver raekke. start er det, eleven
       har paa hylden fra begyndelsen; maal er stoffet, der skal laves. Den
       korteste rute (par) regnes af js/rute.js, og selvtesten tjekker, at
       den passer med par her. */
    D.LAG3 = {
        PR_TRIN: 300,           /* point pr. trin i den korteste rute */
        EKSTRA_TRIN: 100,       /* minus pr. trin ud over den korteste rute */
        SPILDT: 50,             /* minus pr. kort, der ikke gav en reaktion, og pr. fortrudt trin */
        HINT: [0.2, 0.4],       /* andel af vaerdien, de to hint koster */
        PERFEKT: 0.5,           /* bonus for den korteste rute uden fejl og hint */
        TIDSBONUS: 0.1,         /* hoejst, efter tiden (fuld ved 0 s, ingen ved TID_GRAENSE) */
        TID_GRAENSE: 120,
        RUNDE: [
            [ /* 1: to trin */
                { start: ["but-2-en"], maal: "butanon", par: 2 },
                { start: ["propan-1-ol"], maal: "propan", par: 2 },
                { start: ["bromethan"], maal: "ethanol", par: 2 },
                { start: ["ethen"], maal: "ethanal", par: 2 },
                { start: ["propan-2-ol"], maal: "2-brompropan", par: 2 }
            ],
            [ /* 2: to trin, med en faelde */
                { start: ["propen"], maal: "propansyre", par: 2 },
                { start: ["propan-1-ol"], maal: "propan-2-ol", par: 2 },
                { start: ["ethanol"], maal: "ethylethanoat", par: 2 },
                { start: ["ethanol", "ethylamin"], maal: "N-ethylethanamid", par: 2 },
                { start: ["ethylethanoat"], maal: "ethanal", par: 2 }
            ],
            [ /* 3: tre trin */
                { start: ["ethen"], maal: "ethylethanoat", par: 3 },
                { start: ["1-brompropan"], maal: "propanon", par: 3 },
                { start: ["propan-2-ol"], maal: "propanal", par: 3 },
                { start: ["butan-1-ol"], maal: "butanon", par: 3 },
                { start: ["2-methylpropan-2-ol"], maal: "2-methylpropanal", par: 3 }
            ],
            [ /* 4: tre trin, to stoffer */
                { start: ["propen", "methanol"], maal: "methylpropanoat", par: 3 },
                { start: ["ethan"], maal: "ethanol", par: 3 },
                { start: ["propen"], maal: "propylpropanoat", par: 3 },
                { start: ["ethen", "methylamin"], maal: "N-methylethanamid", par: 3 },
                { start: ["2-brombutan"], maal: "butanal", par: 3 }
            ],
            [ /* 5: fire trin */
                { start: ["propan"], maal: "propanon", par: 4 },
                { start: ["ethan"], maal: "ethansyre", par: 4 },
                { start: ["butan-2-ol", "ethanol"], maal: "ethylbutanoat", par: 4 },
                { start: ["1-brompropan", "methanol"], maal: "methylpropanoat", par: 4 },
                { start: ["butan"], maal: "butanon", par: 4 }
            ],
            [ /* 6: fem trin */
                { start: ["ethan"], maal: "ethylethanoat", par: 5 },
                { start: ["propan"], maal: "propylpropanoat", par: 5 },
                { start: ["propan", "ethylamin"], maal: "N-ethylpropanamid", par: 5 },
                { start: ["propan", "methanol"], maal: "methylpropanoat", par: 5 },
                { start: ["butan", "methanol"], maal: "methylbutanoat", par: 5 }
            ]
        ]
    };

    /* Stoffer, der kan bruges i lag 3, men ikke er i MOLEKYLER (maalene) */
    D.EKSTRA = [];

    /* ----- Toplisterne ----------------------------------------------------
       Det faelles script til spillene (samme adresse som Organiske grupper
       C og samlebaandet i sc2.3). Listen vises foerst, naar scriptet kender
       spillet. Linjerne, scriptet skal have, staar i README. */
    D.TOPLISTE = {
        adresse: "https://script.google.com/macros/s/AKfycbz7CVe8KVRM-EB3oaiRYC8ezwq3th65d-eJ4NHq_J5L3eyO1mN8mRi04AhjqnAkCAXr/exec",
        spil: { 1: "syntese1", 2: "syntese2", 3: "syntese3" }
    };

    D.LAG = {
        1: { navn: "Grupperne", kort: "Slå molekylerne med den rigtige gruppe. Rekord på niveau 10." },
        2: { navn: "Reaktionerne", kort: "Så mange rigtige som muligt på 1 minut." },
        3: { navn: "Syntesen", kort: "Find den korteste vej fra udgangsstof til produkt." }
    };
}());

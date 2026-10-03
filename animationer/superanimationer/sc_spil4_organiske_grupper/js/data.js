/* =====================================================================
   data.js - stofklasserne, molekylerne, balancen og teksterne

   Alt, der kan rettes uden at roere koden, staar her. To udgaver:
   "c" (index.html, Kemi C) og "b" (index.html#b, Kemi B). De deler
   stofklasserne og teksterne, men har hver deres molekyler, niveauer og
   fart, ligesom de to gamle spil.

   Molekylerne skrives som SMILES og tegnes af molekylemotoren
   (../../molekylemotor/). Selvtesten tjekker, at motoren giver det navn
   og den stofklasse, der staar her.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofklasserne ---------------------------------------------------
       navn        spandens og panelets navn
       flertal     til "Ny stofklasse" og panelet
       art         en eller et (en alkan, et aldehyd)
       tegn        kendetegnet i kort form (panelet og kortet ved en ny klasse)
       kendetegn   én linje, der siger, hvordan klassen kendes
       motor       stofklassen, som molekylemotoren kalder den (selvtesten)
       farve       spanden og fremhaevningen af gruppen */
    D.KLASSER = {
        alkan: { navn: "Alkan", flertal: "Alkaner", art: "en", tegn: "C–C", motor: "alkan",
            kendetegn: "Kun enkeltbindinger og ingen ring." },
        alken: { navn: "Alken", flertal: "Alkener", art: "en", tegn: "C=C", motor: "alken",
            kendetegn: "To streger mellem to C er en dobbeltbinding." },
        alkyn: { navn: "Alkyn", flertal: "Alkyner", art: "en", tegn: "C≡C", motor: "alkyn",
            kendetegn: "Tre streger mellem to C er en tripelbinding." },
        cycloalkan: { navn: "Cycloalkan", flertal: "Cycloalkaner", art: "en", tegn: "ring", motor: "cycloalkan",
            kendetegn: "En ring med kun enkeltbindinger." },
        aromat: { navn: "Aromat", flertal: "Aromater", art: "en", tegn: "benzenring", motor: "aromatisk",
            kendetegn: "Seks C i en ring med skiftevis dobbelt- og enkeltbindinger." },
        alkohol: { navn: "Alkohol", flertal: "Alkoholer", art: "en", tegn: "–OH", motor: "alkohol",
            kendetegn: "OH på et C, der ikke har =O." },
        syre: { navn: "Carboxylsyre", flertal: "Carboxylsyrer", art: "en", tegn: "–COOH", motor: "carboxylsyre",
            kendetegn: "Et C med både =O og OH er en carboxylgruppe, COOH." },
        amin: { navn: "Amin", flertal: "Aminer", art: "en", tegn: "–NH₂", motor: "amin",
            kendetegn: "NH₂ på et C." },
        aldehyd: { navn: "Aldehyd", flertal: "Aldehyder", art: "et", tegn: "–CHO", motor: "aldehyd",
            kendetegn: "C=O for enden af kæden." },
        keton: { navn: "Keton", flertal: "Ketoner", art: "en", tegn: "C=O i kæden", motor: "keton",
            kendetegn: "C=O inde i kæden, med C på begge sider." },
        ester: { navn: "Ester", flertal: "Estre", art: "en", tegn: "–COO–", motor: "ester",
            kendetegn: "C=O med et O ved siden af inde i kæden." }
    };

    /* ----- Den typiske forveksling ------------------------------------------
       "rigtig>valgt": linjen, der siger, hvad der skiller dem. Mangler
       parret, bruges den rigtige klasses kendetegn. */
    D.FORVEKSLING = {
        "alken>alkan": "Se efter to streger. Én dobbeltbinding gør det til en alken.",
        "alkyn>alkan": "Se efter tre streger. Én tripelbinding gør det til en alkyn.",
        "alkan>alken": "Alle streger er enkle. Så er det en alkan.",
        "alkan>alkyn": "Alle streger er enkle. Så er det en alkan.",
        "alkyn>alken": "Tre streger, ikke to. Det er en tripelbinding.",
        "alken>alkyn": "To streger, ikke tre. Det er en dobbeltbinding.",
        "aromat>alken": "Tre dobbeltbindinger skiftevis i en seksring er en benzenring.",
        "aromat>cycloalkan": "Ringen har tre dobbeltbindinger. Det er en benzenring.",
        "cycloalkan>aromat": "Ringen har kun enkeltbindinger. Så er det en cycloalkan.",
        "cycloalkan>alkan": "Kæden lukker sig til en ring.",
        "alkan>cycloalkan": "Kæden har to ender. Den er ikke en ring.",
        "syre>alkohol": "OH sidder på et C med =O. Sammen er de COOH.",
        "alkohol>syre": "Der er intet =O på C'et med OH. Så er det en alkohol.",
        "aldehyd>keton": "C=O sidder for enden af kæden. Så er det et aldehyd.",
        "keton>aldehyd": "C=O sidder inde i kæden. Så er det en keton.",
        "ester>keton": "Der er et O inde i kæden lige ved siden af C=O.",
        "ester>aldehyd": "Der er et O inde i kæden lige ved siden af C=O.",
        "ester>syre": "O'et ved C=O har et C på den anden side, ikke et H.",
        "syre>ester": "O'et ved C=O har et H: OH. Så er det COOH.",
        "keton>ester": "Der er intet O inde i kæden ved siden af C=O.",
        "aldehyd>ester": "Der er intet O inde i kæden ved siden af C=O.",
        "aldehyd>syre": "Der er intet OH ved C=O.",
        "keton>syre": "Der er intet OH ved C=O.",
        "syre>aldehyd": "Der sidder også et OH på C'et med =O.",
        "syre>keton": "Der sidder også et OH på C'et med =O.",
        "amin>alkohol": "Der står N, ikke O.",
        "alkohol>amin": "Der står O, ikke N.",
        "alkohol>alkan": "Se efter OH. Det gør det til en alkohol.",
        "amin>alkan": "Se efter NH₂. Det gør det til en amin.",
        "aromat>alkan": "Seksringen med tre dobbeltbindinger er en benzenring."
    };

    /* ----- Molekylerne -----------------------------------------------------
       [klasse, navn, SMILES, note]. navn er det navn, molekylemotoren
       giver (selvtesten tjekker det). note er et trivialnavn i parentes.
       C: de 16 fra den gamle c_spil_organiske_grupper.html plus nogle
       stykker, saa hver klasse har fem. B: de 39 fra den gamle
       b_spil_organiske_grupper.html plus pentan-3-on. */
    var C_MOL = [
        ["alkan", "propan", "CCC"], ["alkan", "butan", "CCCC"], ["alkan", "pentan", "CCCCC"],
        ["alkan", "hexan", "CCCCCC"], ["alkan", "2-methylpropan", "CC(C)C"],
        ["alken", "propen", "C=CC"], ["alken", "but-1-en", "C=CCC"], ["alken", "but-2-en", "CC=CC"],
        ["alken", "pent-2-en", "CC=CCC"], ["alken", "2-methylpropen", "C=C(C)C"],
        ["alkyn", "propyn", "C#CC"], ["alkyn", "but-1-yn", "C#CCC"], ["alkyn", "but-2-yn", "CC#CC"],
        ["alkyn", "pent-1-yn", "C#CCCC"], ["alkyn", "pent-2-yn", "CC#CCC"],
        ["cycloalkan", "cyclopropan", "C1CC1"], ["cycloalkan", "cyclobutan", "C1CCC1"], ["cycloalkan", "cyclopentan", "C1CCCC1"],
        ["cycloalkan", "cyclohexan", "C1CCCCC1"], ["cycloalkan", "methylcyclohexan", "CC1CCCCC1"],
        ["aromat", "benzen", "c1ccccc1"], ["aromat", "methylbenzen", "Cc1ccccc1", "toluen"], ["aromat", "ethylbenzen", "CCc1ccccc1"],
        ["aromat", "propylbenzen", "CCCc1ccccc1"], ["aromat", "1,4-dimethylbenzen", "Cc1ccc(C)cc1"],
        ["alkohol", "ethanol", "CCO"], ["alkohol", "propan-1-ol", "CCCO"], ["alkohol", "propan-2-ol", "CC(O)C"],
        ["alkohol", "butan-1-ol", "CCCCO"], ["alkohol", "butan-2-ol", "CCC(C)O"],
        ["syre", "ethansyre", "CC(=O)O", "eddikesyre"], ["syre", "propansyre", "CCC(=O)O"], ["syre", "butansyre", "CCCC(=O)O", "smørsyre"],
        ["syre", "pentansyre", "CCCCC(=O)O"], ["syre", "hexansyre", "CCCCCC(=O)O"]
    ];
    var B_MOL = [
        ["alkan", "propan", "CCC"], ["alkan", "butan", "CCCC"], ["alkan", "pentan", "CCCCC"],
        ["alkan", "heptan", "CCCCCCC"], ["alkan", "decan", "CCCCCCCCCC"],
        ["alkohol", "ethanol", "CCO"], ["alkohol", "propan-1-ol", "CCCO"], ["alkohol", "butan-2-ol", "CCC(C)O"],
        ["alkohol", "hexan-1-ol", "CCCCCCO"], ["alkohol", "decan-1-ol", "CCCCCCCCCCO"],
        ["syre", "ethansyre", "CC(=O)O", "eddikesyre"], ["syre", "propansyre", "CCC(=O)O"], ["syre", "butansyre", "CCCC(=O)O", "smørsyre"],
        ["syre", "heptansyre", "CCCCCCC(=O)O"], ["syre", "decansyre", "CCCCCCCCCC(=O)O"],
        ["aromat", "benzen", "c1ccccc1"], ["aromat", "methylbenzen", "Cc1ccccc1", "toluen"], ["aromat", "ethylbenzen", "CCc1ccccc1"],
        ["aromat", "propylbenzen", "CCCc1ccccc1"], ["aromat", "butylbenzen", "CCCCc1ccccc1"],
        ["amin", "ethylamin", "CCN"], ["amin", "propylamin", "CCCN"], ["amin", "butylamin", "CCCCN"],
        ["amin", "hexylamin", "CCCCCCN"], ["amin", "decylamin", "CCCCCCCCCCN"],
        ["keton", "propanon", "CC(=O)C", "acetone"], ["keton", "butanon", "CCC(=O)C"], ["keton", "pentan-3-on", "CCC(=O)CC"],
        ["keton", "hexan-2-on", "CCCCC(=O)C"], ["keton", "decan-2-on", "CCCCCCCCC(=O)C"],
        ["aldehyd", "ethanal", "CC=O", "acetaldehyd"], ["aldehyd", "propanal", "CCC=O"], ["aldehyd", "pentanal", "CCCCC=O"],
        ["aldehyd", "octanal", "CCCCCCCC=O"], ["aldehyd", "decanal", "CCCCCCCCCC=O"],
        ["ester", "methylethanoat", "CC(=O)OC"], ["ester", "ethylethanoat", "CC(=O)OCC", "ethylacetat"], ["ester", "propylethanoat", "CC(=O)OCCC"],
        ["ester", "butylpropanoat", "CCC(=O)OCCCC"], ["ester", "pentylpentanoat", "CCCCC(=O)OCCCCC"]
    ];

    /* ----- De to udgaver ------------------------------------------------------
       Balancen er de gamle spils, tal for tal (brugerens egne tal):
       fart = grundfart (70 enheder pr. s) gange fart pr. niveau, et nyt
       molekyle hvert 2,2 s minus 0,22 s pr. niveau (mindst 0,6 s), 100 point
       pr. rigtigt molekyle. Et niveau naas ved en pointgraense; ingen
       indbygget pause mellem niveauerne. Med ny: stofklasser, der kommer
       til (kortet med "Ny stofklasse" og skaermen ryddes). Uden ny:
       turboniveauer, hvor kun farten stiger.
       Skaermen er 900 enheder hoej som den gamle paa en stor skaerm, saa
       faldtiden er den samme paa alle skaerme. */
    D.UDGAVER = {
        c: {
            id: "c", navn: "Kemi C", titel: "Organiske grupper",
            klasser: ["alkan", "alken", "alkyn", "cycloalkan", "aromat", "alkohol", "syre"],
            molekyler: C_MOL,
            turboPrTryk: 0.35,
            niveauer: [
                { graense: 0, fart: 1.32, typer: ["alkan", "alken"] },
                { graense: 1000, fart: 1.32, typer: ["alkan", "alken", "alkyn"], ny: ["alkyn"] },
                { graense: 2500, fart: 1.44, typer: ["alken", "alkyn", "cycloalkan"], ny: ["cycloalkan"] },
                { graense: 4500, fart: 1.3, typer: ["alkyn", "cycloalkan", "aromat"], ny: ["aromat"] },
                { graense: 7000, fart: 1.4, typer: ["cycloalkan", "aromat", "alkohol", "syre"], ny: ["alkohol", "syre"] },
                { graense: 10000, fart: 1.55, typer: ["alken", "alkyn", "cycloalkan", "aromat", "syre"] },
                { graense: 13500, fart: 1.70, typer: ["alkan", "alkyn", "cycloalkan", "alkohol", "syre"] },
                { graense: 17500, fart: 1.85, typer: ["alken", "cycloalkan", "aromat", "alkohol", "syre"] },
                { graense: 22000, fart: 2.00, typer: ["alkan", "alken", "alkyn", "aromat", "syre"] },
                { graense: 27000, fart: 2.15, typer: ["cycloalkan", "aromat", "alkohol", "syre", "alken"] }
            ],
            intro: [
                "Molekylerne falder. Træk dem ned i den rigtige spand.",
                "Kig på stregerne. To streger er en dobbeltbinding.",
                "Tre forkerte, og spillet er slut. Jeg tæller med."
            ]
        },
        b: {
            id: "b", navn: "Kemi B", titel: "Organiske grupper",
            klasser: ["alkan", "alkohol", "syre", "aromat", "amin", "keton", "aldehyd", "ester"],
            molekyler: B_MOL,
            turboPrTryk: 0.25,
            niveauer: [
                { graense: 0, fart: 1.1, typer: ["alkan", "alkohol", "syre"] },
                { graense: 1000, fart: 1.1, typer: ["alkan", "alkohol", "syre", "aromat"], ny: ["aromat"] },
                { graense: 2500, fart: 1.2, typer: ["alkohol", "syre", "aromat", "amin"], ny: ["amin"] },
                { graense: 4500, fart: 1.3, typer: ["syre", "amin", "keton", "aldehyd"], ny: ["aldehyd", "keton"] },
                { graense: 7000, fart: 1.4, typer: ["keton", "aldehyd", "ester", "amin", "aromat"], ny: ["ester"] },
                { graense: 10000, fart: 1.55, typer: ["keton", "aldehyd", "ester", "amin", "aromat"] },
                { graense: 13500, fart: 1.70, typer: ["keton", "aldehyd", "ester", "amin", "aromat"] },
                { graense: 17500, fart: 1.85, typer: ["keton", "aldehyd", "ester", "amin", "aromat"] },
                { graense: 22000, fart: 2.00, typer: ["keton", "aldehyd", "ester", "amin", "aromat"] },
                { graense: 27000, fart: 2.15, typer: ["keton", "aldehyd", "ester", "amin", "aromat"] }
            ],
            intro: [
                "Molekylerne falder. Træk dem ned i den rigtige spand.",
                "Se efter gruppen: OH, COOH, NH₂ eller C=O.",
                "Jeg har selv tabt til en ester. Én gang."
            ]
        }
    };
    D.STANDARD = "c";

    /* Spandenes farver. C og B har hver deres, som i de gamle spil; aldehyd
       er skiftet fra lyserød til turkis, saa den ikke ligner keton. */
    D.FARVER = {
        c: { alkan: "#2ecc71", alken: "#f1c40f", alkyn: "#e74c3c", cycloalkan: "#1abc9c", aromat: "#9b59b6", alkohol: "#3498db", syre: "#e67e22" },
        b: { alkan: "#2ecc71", alkohol: "#3498db", syre: "#e67e22", aromat: "#9b59b6", amin: "#f1c40f", ester: "#e84393", keton: "#d63031", aldehyd: "#22c1c3" }
    };
    D.ATOMFARVE = { O: "#ff8a80", N: "#82b4ff" };

    /* ----- Balancen (de gamle spils tal) -------------------------------------- */
    D.HOEJDE = 900;           /* scenens hoejde i enheder */
    D.MIN_HOEJDE = 640;       /* paa et lavt laerred; faldet skaleres med, saa tiden er den samme */
    D.MIN_BREDDE = 420;
    D.GRUNDFART = 70;         /* enheder pr. s paa fart 1 */
    D.NYT_HVERT = 2200;       /* ms mellem molekyler paa niveau 1 */
    D.NYT_PR_NIVEAU = 220;    /* ms hurtigere pr. niveau */
    D.NYT_MINDST = 600;       /* hurtigst ét molekyle hvert 0,6 s */
    D.NYT_START = 1000;       /* ms ekstra lige efter et nyt niveau (glider ud) */
    D.POINT = 100;            /* pr. rigtigt molekyle, hele spillet */
    D.LIV = 3;
    D.LIV_PAUSE = 3;          /* s, spillet staar stille efter et forkert molekyle */
    D.SPAND_HOEJDE = 120;
    D.GREB = 60;              /* enheder: saa taet paa midten kan et molekyle gribes */
    D.HINT_TID = 6;           /* s: hjaelpelinjen i starten af et nyt niveau (ikke niveau 1 og ikke turbo) */
    D.MESTER = 14000;         /* point: Stofgruppemester (escaperoommets segl 4) */
    D.UENDELIG_TRIN = 1000;   /* efter 14.000: 10 % flere molekyler pr. 1000 point */
    D.PAUSER = 1;             /* pauser ved start */

    D.TURBO = { tid: 15, maks: 5 };
    D.TURBO_BESKED = ["Turboboost i 15 sekunder!", "Ekstraboost!", "Crazy!", "Spænd sikkerhedsselen!", "Du er ikke rask!"];

    /* Hjaelperne: sjaeldne ting, der klikkes paa (ikke trækkes i en spand).
       Ingen paa niveau 1. Kun én ad gangen. */
    D.HJAELP = {
        foerste: 20,       /* s foer den foerste */
        min: 25, maks: 45, /* s mellem dem */
        inhibitorTid: 7,   /* s */
        inhibitorFart: 0.3,
        fald: 55,          /* enheder pr. s, uanset niveau */
        enzymPoint: 0.5    /* katalysatoren giver halve point pr. molekyle */
    };

    /* Paaskeaegget: en kop kaffe falder én gang pr. spil, sjaeldent, fra niveau 3 */
    D.KAFFE = { fra: 2, chance: 1 / 90 };

    /* ----- Kemichael --------------------------------------------------------- */
    D.INTRO_PEG = 1;           /* under anden linje peger han paa spandene */
    D.INTRO_PEG_PAA = "spand-omraade";
    D.SLUT = {
        rekord: ["Ny rekord. Jeg skriver den ned. Med blyant.", "Rekord. Spandene er imponerede. Jeg er rolig."],
        mester: ["Stofgruppemester. Det står nu i protokollen.", "Stofgruppemester. Jeg har ikke flere spande."]
    };

    /* ----- Linjen under scenen --------------------------------------------------
       {x} erstattes af spillet. */
    D.BESKED = {
        klar: "Tryk Start spil eller Enter.",
        start: "Træk molekylet ned i den rigtige spand.",
        rigtig: "{Navn} er {art} {klasse}.",
        forkert: "{Navn} er {art} {klasse}, ikke {art2} {klasse2}.",
        naaede: "{Navn} nåede ikke frem. Det er {art} {klasse}.",
        pause: "Pause. Enter fortsætter.",
        slut: "Spillet er slut. Enter starter et nyt.",
        turbo: "Turbo. Molekylerne falder hurtigere.",
        niveau: "Niveau {n}. Hastigheden er øget.",
        nyKlasse: "Ny stofklasse: {klasser}.",
        enzym: "Katalysatoren gav {p} point for {n} molekyler.",
        inhibitor: "Inhibitoren bremser alt i {s} sekunder.",
        inhibitorVaek: "Inhibitoren er fjernet.",
        pauseFaaet: "+1 pause. Du har {n}.",
        ingenPause: "Ingen pauser tilbage. Saml en +1 pause.",
        hjaelpNy: {
            enzym: "Klik på katalysatoren. Den giver halve point for alle molekyler.",
            inhibitor: "Klik på inhibitoren. Den bremser alt i 7 sekunder.",
            pause: "Klik på +1 pause. Så har du en pause mere."
        },
        kaffeKlik: "Kemichaels kaffe. Han savner den ikke endnu.",
        kaffeSpand: "Kaffe er ikke en stofklasse.",
        mester: "Stofgruppemester."
    };

    D.PAUSE_TEKST = "Du starter med 1 pause pr. spil. Saml +1 pause for at få flere.";

    NK.Data = D;
}());

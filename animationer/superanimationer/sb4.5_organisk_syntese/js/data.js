/* =====================================================================
   data.js - stofferne, duftene, ordrerne og kunderne

   Kemien er regler i js/kemi.js, ikke en liste af opskrifter: enhver
   carboxylsyre og enhver alkohol giver en ester, og en alkohol kan
   oxideres. Her staar kun det, reglerne ikke kan regne ud: hvad der
   butikken foerer, hvad det koster, hvordan det lugter, og hvad
   kunderne vil have.

   Navnene er de navne, molekylemotoren (../../molekylemotor/) giver.
   Selvtesten tjekker, at hvert stof faar sit navn af motoren.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* ----- Stofferne ------------------------------------------------------
       hylde: true  kan koebes i butikken (raavarer)
       pris         kr. pr. portion
       formel       som paa flasken (den gamle animations skrivemaade)
       De andre stoffer kan kun laves: syrerne ved oxidation af en primaer
       alkohol og propanon af propan-2-ol. Estrene laves af reglerne og
       staar ikke her. */
    var STOFFER = [
        { id: "methanol",   navn: "methanol",    formel: "CH₃OH",       smiles: "OC",          hylde: true, pris: 15 },
        { id: "ethanol",    navn: "ethanol",     formel: "C₂H₅OH",      smiles: "OCC",         hylde: true, pris: 25 },
        { id: "propan1ol",  navn: "propan-1-ol", formel: "C₃H₇OH",      smiles: "OCCC",        hylde: true, pris: 40 },
        { id: "propan2ol",  navn: "propan-2-ol", formel: "CH₃CH(OH)CH₃", smiles: "CC(O)C",     hylde: true, pris: 20 },
        { id: "butan1ol",   navn: "butan-1-ol",  formel: "C₄H₉OH",      smiles: "OCCCC",       hylde: true, pris: 60 },
        { id: "pentan1ol",  navn: "pentan-1-ol", formel: "C₅H₁₁OH",     smiles: "OCCCCC",      hylde: true, pris: 80 },
        { id: "octan1ol",   navn: "octan-1-ol",  formel: "C₈H₁₇OH",     smiles: "OCCCCCCCC",   hylde: true, pris: 90 },

        { id: "methansyre", navn: "methansyre",  formel: "HCOOH",       smiles: "O=CO",        hylde: true, pris: 35 },
        { id: "ethansyre",  navn: "ethansyre",   formel: "CH₃COOH",     smiles: "CC(=O)O",     hylde: true, pris: 30 },
        { id: "salicylsyre", navn: "salicylsyre", motornavn: "2-hydroxybenzoesyre", formel: "C₆H₄(OH)COOH",
          smiles: "Oc1ccccc1C(=O)O", hylde: true, pris: 150 },

        { id: "permanganat", navn: "kaliumpermanganat", formel: "KMnO₄", ox: true, hylde: true, pris: 45 },

        /* Kan kun laves */
        { id: "propansyre", navn: "propansyre",  formel: "C₂H₅COOH",    smiles: "CCC(=O)O" },
        { id: "butansyre",  navn: "butansyre",   formel: "C₃H₇COOH",    smiles: "CCCC(=O)O" },
        { id: "pentansyre", navn: "pentansyre",  formel: "C₄H₉COOH",    smiles: "CCCCC(=O)O" },
        { id: "octansyre",  navn: "octansyre",   formel: "C₇H₁₅COOH",   smiles: "CCCCCCCC(=O)O" },
        { id: "propanon",   navn: "propanon",    formel: "CH₃COCH₃",    smiles: "CC(C)=O" },
        { id: "diethylether", navn: "diethylether", formel: "C₂H₅OC₂H₅", smiles: "CCOCC" }
    ];

    /* ----- Dufte og vaerdi ---------------------------------------------------
       Noeglen er motorens navn. vaerdi er den pris, en kunde betaler (de gamle tal, hvor de fandtes). Duftene er de kendte fra
       lærebøgerne; en ester uden duft her "dufter af frugt". */
    var DUFTE = {
        "methylethanoat":          { duft: "lim", ikon: "🧴", vaerdi: 120 },
        "ethylethanoat":           { duft: "neglelakfjerner", ikon: "💅", vaerdi: 180 },
        "propylethanoat":          { duft: "pære", ikon: "🍐", vaerdi: 250 },
        "pentylethanoat":          { duft: "banan", ikon: "🍌", vaerdi: 400 },
        "octylethanoat":           { duft: "appelsin", ikon: "🍊", vaerdi: 420 },
        "ethylmethanoat":          { duft: "rom", ikon: "🥃", vaerdi: 220 },
        "methylbutanoat":          { duft: "æble", ikon: "🍎", vaerdi: 380 },
        "ethylbutanoat":           { duft: "ananas", ikon: "🍍", vaerdi: 450 },
        "pentylbutanoat":          { duft: "abrikos", ikon: "🍑", vaerdi: 500 },
        "pentylpentanoat":         { duft: "grønt æble", ikon: "🍏", vaerdi: 520 },
        "methyl-2-hydroxybenzoat": { duft: "vintergrøn", ikon: "🌿", vaerdi: 650, trivial: "methylsalicylat" },
        "2-(acetyloxy)benzoesyre": { duft: "svagt af eddike", ikon: "💊", vaerdi: 800, trivial: "acetylsalicylsyre", medicin: true },
        "propanon":                { duft: "neglelakfjerner", ikon: "💅", vaerdi: 90, trivial: "acetone" },
        "methansyre":              { duft: "myrer", ikon: "🐜" },
        "ethansyre":               { duft: "eddike" },
        "propansyre":              { duft: "sved" },
        "butansyre":               { duft: "opkast", ikon: "🤢" },
        "pentansyre":              { duft: "sure sokker", ikon: "🧦" },
        "octansyre":               { duft: "ged", ikon: "🐐" },
        "diethylether":            { duft: "sødt og bedøvende", ikon: "💤" }
    };

    /* ----- Kunderne ------------------------------------------------------------ */
    var KUNDER = {
        neglesalon: { navn: "Neglesalonen", ikon: "💅" },
        slik:       { navn: "Slikfabrikken", ikon: "🍬" },
        bager:      { navn: "Bageriet", ikon: "🧁" },
        juice:      { navn: "Juicebaren", ikon: "🥤" },
        parfume:    { navn: "Parfumeriet", ikon: "🌸" },
        fysio:      { navn: "Fysioterapeuten", ikon: "💆" },
        apotek:     { navn: "Apoteket", ikon: "💊" },
        lim:        { navn: "Limfabrikken", ikon: "🧴" }
    };

    /* Hvad kunden skal bruge stoffet til: én kort saetning i ordren */
    var BRUG = {
        "ethylethanoat": "til neglelakfjerner",
        "propylethanoat": "til pærebolsjer",
        "pentylethanoat": "til skumbananer",
        "ethylmethanoat": "til romkugler",
        "ethylbutanoat": "til ananasjuice",
        "propanon": "til neglelakfjerner",
        "pentylbutanoat": "til abrikosvingummi",
        "pentylpentanoat": "til en parfume med grønt æble",
        "methyl-2-hydroxybenzoat": "til en kølende muskelsalve",
        "2-(acetyloxy)benzoesyre": "til hovedpinepiller",
        "octylethanoat": "til appelsinkage",
        "methylbutanoat": "til æblemost",
        "methylethanoat": "til hurtigtørrende lim"
    };

    /* ----- Fabrikken ------------------------------------------------------------
       De ti foerste ordrer kommer i fast raekkefoelge fra let til svaer
       (de tre foerste kan laves af det, butikken foerer; fra den femte skal
       syren eller ketonen laves ved oxidation). Derefter kommer der
       tilfaeldige ordrer fra listen.

       titler      efter hvor meget fabrikken har tjent i alt (ikke kassen,
                   saa udstyr kan koebes uden at miste titlen)
       udstyr      koebes i butikken; titel er den titel, der skal til
       serie       leveringer i traek uden en blanding, der maa haeldes ud:
                   seriePct procent oveni pr. levering, hoejst serieMax trin
       nyBonus     foerste gang et stof paa esterkortet bliver lavet */
    var FABRIK = {
        start: 300,
        laan: 200,
        boersSek: 30,
        tilbudSek: 60,
        tilbudPct: 30,
        rabatPct: 20,
        esterPct: 25,
        seriePct: 10,
        serieMax: 5,
        nyBonus: 50,
        faste: [
            { kunde: "neglesalon", maal: "ethylethanoat" },
            { kunde: "slik", maal: "propylethanoat" },
            { kunde: "slik", maal: "pentylethanoat" },
            { kunde: "bager", maal: "ethylmethanoat" },
            { kunde: "juice", maal: "ethylbutanoat" },
            { kunde: "neglesalon", maal: "propanon" },
            { kunde: "slik", maal: "pentylbutanoat" },
            { kunde: "parfume", maal: "pentylpentanoat" },
            { kunde: "fysio", maal: "methyl-2-hydroxybenzoat" },
            { kunde: "apotek", maal: "2-(acetyloxy)benzoesyre" }
        ],
        tilfaeldige: [
            { kunde: "neglesalon", maal: "ethylethanoat" },
            { kunde: "neglesalon", maal: "propanon" },
            { kunde: "slik", maal: "propylethanoat" },
            { kunde: "slik", maal: "pentylethanoat" },
            { kunde: "slik", maal: "pentylbutanoat" },
            { kunde: "bager", maal: "ethylmethanoat" },
            { kunde: "bager", maal: "octylethanoat" },
            { kunde: "juice", maal: "ethylbutanoat" },
            { kunde: "juice", maal: "methylbutanoat" },
            { kunde: "parfume", maal: "pentylpentanoat" },
            { kunde: "fysio", maal: "methyl-2-hydroxybenzoat" },
            { kunde: "apotek", maal: "2-(acetyloxy)benzoesyre" },
            { kunde: "lim", maal: "methylethanoat" }
        ],
        /* Butikken foerer ikke butansyre (brugt i to af ordrerne) */
        udsolgt: [{ id: "butansyre", grund: "Butansyre fører jeg ikke. Den lugter af opkast. Lav den selv." }],
        titler: [
            { fra: 0, titel: "Lærling" },
            { fra: 1000, titel: "Laborant" },
            { fra: 2500, titel: "Kemiker" },
            { fra: 5000, titel: "Fabrikschef" }
        ],
        udstyr: [
            { id: "kundekort", navn: "Kundekort", ikon: "💳", pris: 250, titel: 0,
              tekst: "20 % rabat på alle kemikalier." },
            { id: "skilt", navn: "Reklameskilt", ikon: "📣", pris: 400, titel: 1,
              tekst: "Fire kunder ad gangen i stedet for tre." },
            { id: "vandudskiller", navn: "Vandudskiller", ikon: "💧", pris: 600, titel: 2,
              tekst: "Fjerner vandet, så ligevægten forskydes mod esteren. Estere giver 25 % mere." }
        ]
    };

    /* ----- Esterkortet ------------------------------------------------------------
       Alle estere af de syv alkoholer og de syv syrer (7 x 7) og tre
       saerlige stoffer. Navnene regnes ud af reglerne i js/kemi.js. */
    var ESTERKORT = {
        alkoholer: ["methanol", "ethanol", "propan1ol", "propan2ol", "butan1ol", "pentan1ol", "octan1ol"],
        syrer: ["methansyre", "ethansyre", "propansyre", "butansyre", "pentansyre", "octansyre", "salicylsyre"],
        saerlige: ["2-(acetyloxy)benzoesyre", "propanon", "diethylether"]
    };

    /* Kolbens farve: alt er farveloest bortset fra permanganaten */
    var FARVER = {
        permanganat: "rgba(150, 40, 170, 0.85)",
        mangan: "rgba(240, 190, 210, 0.35)",   /* Mn²⁺ efter reaktionen: naesten farveloes */
        klar: "rgba(200, 225, 245, 0.30)"
    };

    NK.Data = {
        STOFFER: STOFFER,
        DUFTE: DUFTE,
        KUNDER: KUNDER,
        BRUG: BRUG,
        FABRIK: FABRIK,
        ESTERKORT: ESTERKORT,
        FARVER: FARVER
    };
}());

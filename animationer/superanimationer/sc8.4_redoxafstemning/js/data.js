/* =====================================================================
   data.js - reaktionerne, sværhedsgraderne og Kemichaels replikker

   En reaktion er skrevet som de to reaktanter (v) og de to produkter
   (h) før afstemningen. En formel skrives med ladningen efter et
   mellemrum: "Cr2O7 2-", "Fe 3+", "Cu". ox og red siger, hvilken
   reaktant der bliver til hvilket produkt: [plads i v, plads i h].
   Alt andet (oxidationstal, elektroner, koefficienter, H⁺, OH⁻ og
   vand) regner js/redox.js selv ud. Intet svar er skrevet i hånden.

   samme: "v" eller "h", når de to led på den side er det samme stof,
   fx Pb²⁺ + Pb²⁺. De står hver for sig under afstemningen og slås
   sammen til sidst, som i den gamle c8.4.
   miljoe: "surt" (H⁺), "basisk" (OH⁻) eller null (ingen O og H).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Stoffer, hvor O ikke er −II. Her regnes O ud fra H = +I. */
    D.UKENDT = { "H2O2": "O" };

    D.REAKTIONER = [
        /* ----- Let: ingen O og H, så ladningen passer af sig selv -------------
           Den første skal have et tal forskelligt fra 1 i trin 4, ellers er
           der intet at gøre (brugerens første test, 25. sept. 2026). Zn/Cu²⁺,
           hvor alle tal er 1, kommer først som nr. 5. */
        { id: "L1", niveau: "let", v: ["Cu", "Ag +"], h: ["Cu 2+", "Ag"], ox: [0, 0], red: [1, 1], miljoe: null,
          kontekst: "Sølvtræet: kobbertråd i sølvnitrat." },
        { id: "L2", niveau: "let", v: ["Cl2", "Br -"], h: ["Cl -", "Br2"], ox: [1, 1], red: [0, 0], miljoe: null,
          kontekst: "Klor frigør brom fra bromid." },
        { id: "L3", niveau: "let", v: ["Al", "Cu 2+"], h: ["Al 3+", "Cu"], ox: [0, 0], red: [1, 1], miljoe: null },
        { id: "L4", niveau: "let", v: ["Fe 3+", "I -"], h: ["Fe 2+", "I2"], ox: [1, 1], red: [0, 0], miljoe: null },
        { id: "L5", niveau: "let", v: ["Zn", "Cu 2+"], h: ["Zn 2+", "Cu"], ox: [0, 0], red: [1, 1], miljoe: null,
          kontekst: "Zink i en opløsning med kobberioner." },
        { id: "L6", niveau: "let", v: ["Sn 2+", "Fe 3+"], h: ["Sn 4+", "Fe 2+"], ox: [0, 0], red: [1, 1], miljoe: null },
        { id: "L7", niveau: "let", v: ["Ag +", "Al"], h: ["Ag", "Al 3+"], ox: [1, 1], red: [0, 0], miljoe: null },
        { id: "L8", niveau: "let", v: ["Br2", "Fe 2+"], h: ["Br -", "Fe 3+"], ox: [1, 1], red: [0, 0], miljoe: null },
        { id: "L9", niveau: "let", v: ["Mg", "Fe 3+"], h: ["Mg 2+", "Fe"], ox: [0, 0], red: [1, 1], miljoe: null },

        /* ----- Middel: surt miljø med O ------------------------------------------ */
        { id: "M1", niveau: "middel", v: ["MnO4 -", "Fe 2+"], h: ["Mn 2+", "Fe 3+"], ox: [1, 1], red: [0, 0], miljoe: "surt",
          kontekst: "Jern titreres med permanganat." },
        { id: "M2", niveau: "middel", v: ["Cu", "NO3 -"], h: ["Cu 2+", "NO2"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          kontekst: "Kobber i koncentreret salpetersyre." },
        { id: "M3", niveau: "middel", v: ["MnO2", "Cl -"], h: ["Mn 2+", "Cl2"], ox: [1, 1], red: [0, 0], miljoe: "surt",
          kontekst: "Sådan fremstillede Scheele klor i 1774." },
        { id: "M4", niveau: "middel", v: ["Cr2O7 2-", "Fe 2+"], h: ["Cr 3+", "Fe 3+"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M5", niveau: "middel", v: ["Cu", "NO3 -"], h: ["Cu 2+", "NO"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          kontekst: "Kobber i fortyndet salpetersyre." },
        { id: "M6", niveau: "middel", v: ["Cr2O7 2-", "Cl -"], h: ["Cr 3+", "Cl2"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M7", niveau: "middel", v: ["Cu", "SO4 2-"], h: ["Cu 2+", "SO2"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          kontekst: "Kobber i varm, koncentreret svovlsyre." },
        { id: "M8", niveau: "middel", v: ["Ag", "NO3 -"], h: ["Ag +", "NO"], ox: [0, 0], red: [1, 1], miljoe: "surt" },
        { id: "M9", niveau: "middel", v: ["MnO4 -", "Cl -"], h: ["Mn 2+", "Cl2"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M10", niveau: "middel", v: ["MnO4 -", "Sn 2+"], h: ["Mn 2+", "Sn 4+"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M11", niveau: "middel", v: ["Cr2O7 2-", "I -"], h: ["Cr 3+", "I2"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M12", niveau: "middel", v: ["Cr2O7 2-", "SO3 2-"], h: ["Cr 3+", "SO4 2-"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M13", niveau: "middel", v: ["MnO4 -", "NO2 -"], h: ["Mn 2+", "NO3 -"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "M14", niveau: "middel", v: ["MnO4 -", "C2O4 2-"], h: ["Mn 2+", "CO2"], ox: [1, 1], red: [0, 0], miljoe: "surt" },

        /* ----- Svær: basisk miljø, H⁺ efter pilen og samme grundstof begge veje --- */
        { id: "S1", niveau: "svaer", v: ["MnO4 -", "I -"], h: ["MnO2", "IO3 -"], ox: [1, 1], red: [0, 0], miljoe: "basisk" },
        { id: "S2", niveau: "svaer", v: ["ClO -", "I -"], h: ["Cl -", "I2"], ox: [1, 1], red: [0, 0], miljoe: "basisk",
          kontekst: "Klorin frigør iod fra iodid." },
        { id: "S3", niveau: "svaer", v: ["MnO4 -", "SO3 2-"], h: ["MnO2", "SO4 2-"], ox: [1, 1], red: [0, 0], miljoe: "basisk" },
        { id: "S4", niveau: "svaer", v: ["MnO4 -", "C2O4 2-"], h: ["MnO2", "CO3 2-"], ox: [1, 1], red: [0, 0], miljoe: "basisk" },
        { id: "S5", niveau: "svaer", v: ["NO2", "NO2"], h: ["NO3 -", "NO2 -"], ox: [0, 0], red: [1, 1], miljoe: "basisk", samme: "v",
          kontekst: "Den brune gas NO₂ i natronlud." },
        { id: "S6", niveau: "svaer", v: ["SO2", "MnO4 -"], h: ["SO4 2-", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt" },
        { id: "S7", niveau: "svaer", v: ["Br2", "SO2"], h: ["Br -", "SO4 2-"], ox: [1, 1], red: [0, 0], miljoe: "surt" },
        { id: "S8", niveau: "svaer", v: ["Pb", "PbO2"], h: ["Pb 2+", "Pb 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt", samme: "h",
          kontekst: "Blyakkumulatoren aflades. Sulfaten er udeladt." },
        { id: "S9", niveau: "svaer", v: ["Fe", "Fe 3+"], h: ["Fe 2+", "Fe 2+"], ox: [0, 0], red: [1, 1], miljoe: null, samme: "h" },
        { id: "S10", niveau: "svaer", v: ["MnO4 -", "Mn 2+"], h: ["MnO2", "MnO2"], ox: [1, 1], red: [0, 0], miljoe: "surt", samme: "h" },
        { id: "S11", niveau: "svaer", v: ["Zn", "NO3 -"], h: ["Zn 2+", "NH4 +"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          kontekst: "Zink i meget fortyndet salpetersyre." },
        { id: "S12", niveau: "svaer", v: ["MnO4 -", "H2O2"], h: ["Mn 2+", "O2"], ox: [1, 1], red: [0, 0], miljoe: "surt",
          kontekst: "Brintoverilte affarver permanganat." },
        { id: "S13", niveau: "svaer", v: ["MnO4 2-", "MnO4 2-"], h: ["MnO4 -", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "surt", samme: "v",
          kontekst: "Grønt manganat bliver lilla i syre." },
        { id: "S14", niveau: "svaer", v: ["H2S", "Cl2"], h: ["S", "Cl -"], ox: [0, 0], red: [1, 1], miljoe: "surt" }
    ];

    D.NIVEAUER = {
        "let":    { navn: "Let",    lille: "uden ilt" },
        "middel": { navn: "Middel", lille: "surt miljø" },
        "svaer":  { navn: "Svær",   lille: "basisk og særlige" }
    };
    D.NIVEAU_RAEKKE = ["let", "middel", "svaer"];

    /* ----- Kemichael ----------------------------------------------------------- */
    /* Tre replikker pr. sværhedsgrad: hvor man er, hvad man gør (han peger,
       og det lyser op), og en tør bemærkning. Højst ca. 60 tegn. */
    D.INTRO = {
        "let": [
            "Redoxafstemning. Elektronerne skal gå lige op.",
            "Trinene står til højre. Først oxidationstallene.",
            "Vægten vejer elektroner. Den er kalibreret i går."
        ],
        "middel": [
            "Nu er der ilt med. Så skal H⁺ og vand på.",
            "De to sidste trin afstemmer ladning og ilt.",
            "Vand er gratis. Det kan man ikke sige om kaffen."
        ],
        "svaer": [
            "Basisk miljø og stoffer, der både giver og tager.",
            "I basisk miljø bruger du OH⁻ i stedet for H⁺.",
            "Jeg tæller altid O to gange. Nogle gange tre."
        ]
    };
    D.INTRO_PEG = 1;
    D.PEG_PAA = { "let": "opgavekort", "middel": "trinliste", "svaer": "arbejdsbord" };

    /* Ros, første gang alle reaktioner på en sværhedsgrad er afstemt */
    D.ROS = {
        "let": "Alle de lette er afstemt. Middel har ilt med.",
        "middel": "Alle i surt miljø. Svær venter, hvis du tør.",
        "svaer": "Alt afstemt. Selv jeg tæller efter på de svære."
    };

    /* Påskeægget: 20 eller flere på en vægtskål */
    D.OVERVAEGT = [
        "Vægten går til 20. Den blev købt til noget andet.",
        "Så mange elektroner har vi ikke på lager.",
        "Vægtskålen er ikke til at stable på. Færre, tak."
    ];
    D.OVERVAEGT_GRAENSE = 20;

    NK.Data = D;
}());

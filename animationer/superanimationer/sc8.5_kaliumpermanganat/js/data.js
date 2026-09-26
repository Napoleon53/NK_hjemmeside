/* =====================================================================
   data.js - reaktionerne, farverne og replikkerne

   En reaktion er skrevet som de to reaktanter (v) og de to produkter
   (h) før afstemningen. En formel skrives med ladningen efter et
   mellemrum: "SO3 2-", "Mn 2+", "MnO2". ox og red siger, hvilken
   reaktant der bliver til hvilket produkt: [plads i v, plads i h].
   Mangan er altid det, der reduceres, og står på plads 1 på begge sider.
   Alt andet (oxidationstal, klammerne, gangetallene, koefficienterne,
   H⁺, OH⁻ og vand) regner js/redox.js selv ud. Intet svar er skrevet
   i hånden.

   miljoe: "surt" (H⁺), "basisk" (OH⁻) eller "neutralt" (vand kan kun
   give OH⁻, så der afstemmes med OH⁻ som i basisk miljø).
   foer og efter: farven i urglasset (se D.FARVE). bundfald: et fast
   stof, der ligger i glasset bagefter. gas: bobler.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Stoffer, hvor O ikke er −II. Her regnes O ud fra H = +I. */
    D.UKENDT = { "H2O2": "O" };

    /* ----- Farverne i urglasset: r, g, b og dækkeevne ------------------------ */
    D.FARVE = {
        violet: [112, 28, 148, 0.92],    /* MnO₄⁻ */
        groen:  [34, 122, 64, 0.9],      /* MnO₄²⁻ */
        brun:   [104, 66, 34, 0.9],      /* MnO₂ slemmet op */
        klar:   [240, 222, 230, 0.3],    /* Mn²⁺: næsten farveløs, svagt lyserød */
        vand:   [214, 232, 246, 0.26],
        lysgroen: [196, 226, 180, 0.42], /* Fe²⁺ */
        lysgul: [238, 214, 128, 0.5],    /* Fe³⁺ */
        iod:    [150, 82, 28, 0.78],     /* I₂ */
        brom:   [214, 118, 36, 0.7]      /* Br₂ */
    };

    /* Bundfaldets farve: brunsten og svovl */
    D.BUNDFALD = { brun: "#3b2414", gul: "#e7c93c" };

    /* ----- Farvekortet: manganstofferne fra højeste til laveste oxidationstal
       Navnene har ingen romertal, så kortet ikke viser facit. */
    D.MANGAN = [
        { f: "MnO4 -",  farve: "violet", tekst: "violet", ord: "violet" },
        { f: "MnO4 2-", farve: "groen",  tekst: "grøn", ord: "grøn" },
        { f: "MnO2",    farve: "brun",   tekst: "brunt fast stof", ord: "et brunt fast stof" },
        { f: "Mn 2+",   farve: "klar",   tekst: "næsten farveløs", ord: "næsten farveløs" }
    ];

    /* ----- Flaskerne ------------------------------------------------------------
       Fane 1 har natriumsulfit og svovlsyre, fane 2 kaliumpermanganat. */
    D.FLASKE = {
        sulfit: { id: "sulfit", tekst: "Na₂SO₃", styrke: "0,1 M", navn: "natriumsulfit", farve: "vand" },
        syre:   { id: "syre", tekst: "H₂SO₄", styrke: "2 M", navn: "svovlsyre", farve: "vand" },
        permanganat: { id: "permanganat", tekst: "KMnO₄", styrke: "0,02 M", navn: "kaliumpermanganat", farve: "violet" }
    };
    D.FLASKER = { ug: ["sulfit", "syre"], fl: ["permanganat"] };

    D.REAKTIONER = [
        /* ----- Fane 1: ét urglas, tre reaktioner efter hinanden (som den gamle
           c8.5). Permanganat gjort basisk med natriumhydroxid: lidt sulfit giver
           grønt manganat, mere sulfit brunsten, og svovlsyre opløser brunstenen
           til næsten farveløs Mn²⁺. Mangan falder 1, 2 og 2, i alt fra +VII til
           +II. Den næste låses først op, når skemaet er afstemt (brugerens
           ønske 26. sept. 2026). Den gamle afstemte permanganat og sulfit i
           syre i sidste trin, men da er permanganaten brugt; her er det
           brunstenen, der reagerer. */
        { id: "U1", fane: "ug", gruppe: "urglas", navn: "Lidt sulfit", kort: "1. Grønt",
          tekst: "Kaliumpermanganat gjort basisk med natriumhydroxid. Dryp natriumsulfit i.",
          v: ["SO3 2-", "MnO4 -"], h: ["SO4 2-", "MnO4 2-"], ox: [0, 0], red: [1, 1], miljoe: "basisk",
          flaske: "sulfit", glasTekst: "Basisk · NaOH", foer: "violet", efter: "groen" },
        { id: "U2", fane: "ug", gruppe: "urglas", navn: "Mere sulfit", kort: "2. Brunt",
          tekst: "Det grønne glas. Dryp mere natriumsulfit i.",
          v: ["SO3 2-", "MnO4 2-"], h: ["SO4 2-", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "basisk",
          flaske: "sulfit", glasTekst: "Basisk · NaOH", foer: "groen", efter: "brun", bundfald: "brun" },
        { id: "U3", fane: "ug", gruppe: "urglas", navn: "Svovlsyre", kort: "3. Farveløst",
          tekst: "Det brune glas. Dryp svovlsyre i. Der er stadig sulfit i glasset.",
          v: ["SO3 2-", "MnO2"], h: ["SO4 2-", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          flaske: "syre", glasTekst: "Basisk · NaOH", glasEfter: "Surt · H₂SO₄",
          foer: "brun", foerBundfald: "brun", efter: "klar",
          obs: "Det brune forsvandt. Glasset er næsten farveløst.", kontekst: "Syren opløser brunstenen." },

        /* ----- Fane 2: permanganat dryppes i et andet stof ------------------------
           Den første er reaktionen fra tegningen (og fra Jern i ståluld). S1 og
           S2 var det sure og det neutrale urglas på fane 1 (før 26. sept.). */
        { id: "F1", fane: "fl", gruppe: "surt", navn: "Jern i syre", kort: "Fe²⁺",
          tekst: "Fe²⁺ i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["Fe 2+", "MnO4 -"], h: ["Fe 3+", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "Fe²⁺ + H₂SO₄", foer: "lysgroen", efter: "lysgul",
          kontekst: "Sådan titreres jern med permanganat." },
        { id: "S1", fane: "fl", gruppe: "surt", navn: "Sulfit i syre", kort: "SO₃²⁻",
          tekst: "Sulfit, SO₃²⁻, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["SO3 2-", "MnO4 -"], h: ["SO4 2-", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "SO₃²⁻ + H₂SO₄", foer: "vand", efter: "klar",
          kontekst: "Samme stoffer som på første fane, men i syre falder mangan hele vejen." },
        { id: "F2", fane: "fl", gruppe: "surt", navn: "Tin i syre", kort: "Sn²⁺",
          tekst: "Sn²⁺ i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["Sn 2+", "MnO4 -"], h: ["Sn 4+", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "Sn²⁺ + H₂SO₄", foer: "vand", efter: "klar" },
        { id: "F3", fane: "fl", gruppe: "surt", navn: "Nitrit i syre", kort: "NO₂⁻",
          tekst: "Nitrit, NO₂⁻, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["NO2 -", "MnO4 -"], h: ["NO3 -", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "NO₂⁻ + H₂SO₄", foer: "vand", efter: "klar" },
        { id: "F4", fane: "fl", gruppe: "surt", navn: "Svovlbrinte", kort: "H₂S",
          tekst: "Svovlbrinte, H₂S, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["H2S", "MnO4 -"], h: ["S", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "H₂S + H₂SO₄", foer: "vand", efter: "klar", bundfald: "gul",
          kontekst: "Svovlet falder ud som et gult pulver." },
        { id: "F5", fane: "fl", gruppe: "surt", navn: "Svovldioxid", kort: "SO₂",
          tekst: "Svovldioxid, SO₂, opløst i vand. Dryp kaliumpermanganat i.",
          v: ["SO2", "MnO4 -"], h: ["SO4 2-", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "SO₂ i vand", foer: "vand", efter: "klar",
          kontekst: "Svovldioxid affarver permanganat. Tjek, hvilken side H⁺ skal på." },

        { id: "S2", fane: "fl", gruppe: "basisk", navn: "Sulfit i vand", kort: "SO₃²⁻",
          tekst: "Sulfit, SO₃²⁻, i vand uden syre og base. Dryp kaliumpermanganat i.",
          v: ["SO3 2-", "MnO4 -"], h: ["SO4 2-", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "neutralt",
          glasTekst: "SO₃²⁻ i vand", foer: "vand", efter: "brun", bundfald: "brun",
          kontekst: "Vand kan give OH⁻, men ikke H⁺. Afstem med OH⁻." },
        { id: "F6", fane: "fl", gruppe: "basisk", navn: "Nitrit i base", kort: "NO₂⁻",
          tekst: "Nitrit, NO₂⁻, i natriumhydroxid. Dryp kaliumpermanganat i.",
          v: ["NO2 -", "MnO4 -"], h: ["NO3 -", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "basisk",
          glasTekst: "NO₂⁻ + NaOH", foer: "vand", efter: "brun", bundfald: "brun" },
        { id: "F7", fane: "fl", gruppe: "basisk", navn: "Iodid i base", kort: "I⁻",
          tekst: "Iodid, I⁻, i natriumhydroxid. Dryp kaliumpermanganat i.",
          v: ["I -", "MnO4 -"], h: ["IO3 -", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "basisk",
          glasTekst: "I⁻ + NaOH", foer: "vand", efter: "brun", bundfald: "brun",
          kontekst: "I base bliver iodid til iodat, IO₃⁻." },
        { id: "F8", fane: "fl", gruppe: "basisk", navn: "Sulfid i base", kort: "S²⁻",
          tekst: "Sulfid, S²⁻, i natriumhydroxid. Dryp kaliumpermanganat i.",
          v: ["S 2-", "MnO4 -"], h: ["S", "MnO2"], ox: [0, 0], red: [1, 1], miljoe: "basisk",
          glasTekst: "S²⁻ + NaOH", foer: "vand", efter: "brun", bundfald: "brun" },

        /* Indekstal: grundstoffet står ikke lige mange gange på begge sider
           (eller to gange i samme formel). Klammen tæller alle atomerne. */
        { id: "F9", fane: "fl", gruppe: "indeks", navn: "Oxalat", kort: "C₂O₄²⁻",
          tekst: "Oxalat, C₂O₄²⁻, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["C2O4 2-", "MnO4 -"], h: ["CO2", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "C₂O₄²⁻ + H₂SO₄", foer: "vand", efter: "klar", gas: true,
          kontekst: "Permanganat titreres tit mod oxalat. CO₂ bobler op." },
        { id: "F10", fane: "fl", gruppe: "indeks", navn: "Brintoverilte", kort: "H₂O₂",
          tekst: "Brintoverilte, H₂O₂, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["H2O2", "MnO4 -"], h: ["O2", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "H₂O₂ + H₂SO₄", foer: "vand", efter: "klar", gas: true,
          kontekst: "Brintoverilte affarver permanganat, og O₂ bobler op." },
        { id: "F11", fane: "fl", gruppe: "indeks", navn: "Iodid i syre", kort: "I⁻",
          tekst: "Iodid, I⁻, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["I -", "MnO4 -"], h: ["I2", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "I⁻ + H₂SO₄", foer: "vand", efter: "iod",
          kontekst: "Det brune er iod, I₂. Det er opløst og ligger ikke på bunden." },
        { id: "F12", fane: "fl", gruppe: "indeks", navn: "Bromid i syre", kort: "Br⁻",
          tekst: "Bromid, Br⁻, i svovlsyre. Dryp kaliumpermanganat i.",
          v: ["Br -", "MnO4 -"], h: ["Br2", "Mn 2+"], ox: [0, 0], red: [1, 1], miljoe: "surt",
          glasTekst: "Br⁻ + H₂SO₄", foer: "vand", efter: "brom",
          kontekst: "Det orange er brom, Br₂." }
    ];

    D.GRUPPER = {
        ug: [{ id: "urglas", titel: "I samme glas" }],
        fl: [
            { id: "surt", titel: "Surt miljø" },
            { id: "basisk", titel: "Neutralt og basisk" },
            { id: "indeks", titel: "Indekstal" }
        ]
    };

    /* ----- Partiklerne i luppen ------------------------------------------------ */
    D.PARTIKEL = {
        "SO3 2-": "#8cc4ec", "SO4 2-": "#c9d6e3",
        "MnO4 -": "#9b3fd0", "MnO4 2-": "#35a35f", "MnO2": "#6e4526", "Mn 2+": "#f1c9d8",
        "Fe 2+": "#9fd08a", "Fe 3+": "#e8b04a",
        "Sn 2+": "#b9c0c9", "Sn 4+": "#8e98a5",
        "NO2 -": "#8fd3e0", "NO3 -": "#5f9bd6",
        "H2S": "#e3e08a", "S": "#f0d23c", "S 2-": "#d9d36a",
        "SO2": "#bcd8ea",
        "I -": "#b7a3d6", "IO3 -": "#8c78b8", "I2": "#8e4f1f",
        "C2O4 2-": "#d6d9de", "CO2": "#9aa3ad",
        "H2O2": "#a9dcf2", "O2": "#f08c7c",
        "Br -": "#e0b99a", "Br2": "#d9722a"
    };

    /* ----- Kemichael ------------------------------------------------------------- */
    D.INTRO = {
        ug: "Ét urglas med basisk permanganat. Dryp i, og afstem det, der sker.",
        fl: "Permanganat dryppes i andre stoffer. Afstem på samme måde, med klammer under skemaet."
    };
    D.FAERDIG = {
        ug: "Alle tre. Mangan faldt 1, 2 og 2 trin, fra +VII til +II.",
        fl: "Alle 14. Stigning gange tal er fald gange tal, hver gang."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Afstemt.", "Færdig.", "Den er i hus.", "Skemaet går op."];

    D.UD_LINJE = "Fint. Jeg går på lærerværelset.";
    D.IND_LINJE = "Tilbage. Nogen havde taget min stol.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Den er fra i morges. Den er vist oxideret.",
        "Nogen har fortyndet den.",
        "Kaffen er min. Urglassene må du gerne bruge.",
        "Stadig kold."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Afstem du.";

    /* Påskeægget: flasken sluppet over hans kop */
    D.KAFFE_FLASKE = {
        ug: "Sulfit i kaffen? Den er reduceret nok i forvejen.",
        fl: "Ikke permanganat i kaffen. Den er oxideret nok."
    };

    NK.Data = D;
}());

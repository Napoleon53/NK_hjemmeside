/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 2

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 2 (NK_Undervisning/Kemibogen/fagord/kapitel-2.qmd) den
   1. nov. 2026; hævede og sænkede tal er skrevet som tegn (Na⁺, NO₃⁻).
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "2";
    NK.ANTAL_FAGORD = 32;

    NK.FORKLARING = {
        /* 2.1 Ioner */
        "ion": "Atom, der har afgivet eller optaget elektroner og derfor har en ladning.",
        "positiv ion": "Atom, der har afgivet elektroner, så det har flere protoner end elektroner. Metaller danner den slags, for eksempel Na⁺.",
        "negativ ion": "Atom, der har optaget elektroner, så det har flere elektroner end protoner. Ikke-metaller danner den slags, for eksempel Cl⁻.",
        "ladning": "Viser, hvor mange elektroner en ion har afgivet eller optaget. Skrives hævet efter atomsymbolet, for eksempel 2+ i Mg²⁺.",
        /* 2.2 Ioners navne */
        "natriumion": "Partiklen Na⁺, som findes i maden. Den er ufarlig og livsnødvendig, mens selve metallet reagerer voldsomt med vand.",
        "jern(II)ion": "Partiklen Fe²⁺. Tallet i parentesen viser, at ladningen er +2.",
        "jern(III)ion": "Partiklen Fe³⁺. Tallet i parentesen viser, at ladningen er +3.",
        "-id": "De to bogstaver, som navnet på en negativ ion ender på. Ordet ion udelades da.",
        "fluorid": "Den negative ion F⁻. Den er harmløs og findes i tandpasta.",
        "chlorid": "Den negative ion Cl⁻. Sammen med Na⁺ danner den køkkensalt.",
        "oxid": "Den negative ion af oxygen, O²⁻. Atomet har optaget to elektroner.",
        "sulfid": "Den negative ion af svovl, S²⁻. Navnet kommer af sulfur, som er svovls internationale navn.",
        "nitrid": "Den negative ion af nitrogen, N³⁻. Atomet har optaget tre elektroner.",
        "sammensat ion": "Gruppe af atomer, der er bundet til hinanden og har en fælles ladning. Den opfører sig som én samlet partikel.",
        "hydroxid": "Den sammensatte ion OH⁻ med ladningen −1.",
        "nitrat": "Den sammensatte ion NO₃⁻ med ladningen −1.",
        "carbonat": "Den sammensatte ion CO₃²⁻ med ladningen −2.",
        "sulfat": "Den sammensatte ion SO₄²⁻ med ladningen −2.",
        "phosphat": "Den sammensatte ion PO₄³⁻ med ladningen −3.",
        "ammonium": "Den sammensatte ion NH₄⁺. Den er den eneste positive blandt de seks, der er værd at lære udenad.",
        /* 2.3 Ionforbindelser */
        "ionforbindelse": "Stof, der består af positive og negative partikler, som tiltrækker hinanden. Dannes typisk af et metal og et ikke-metal.",
        "salt": "Andet navn for en ionforbindelse. Det, der bruges i køkkenet, hedder natriumchlorid.",
        "ionbinding": "Den elektriske tiltrækning mellem partikler med modsat ladning, for eksempel Na⁺ og Cl⁻.",
        "iongitter": "Det regelmæssige mønster, som partiklerne i et salt sidder tæt pakket i. De er skiftevis positive og negative.",
        "formelenhed": "Den mindste portion af et salt med ionerne i det rigtige forhold. I NaCl består den af én natriumion og én chloridion.",
        /* 2.4 Fældningsreaktioner */
        "letopløselig": "Siges om et salt, der kan opløses i store mængder i vand, for eksempel køkkensalt. I fældningstabellen står der L.",
        "tungtopløselig": "Siges om et salt, der næsten ikke kan opløses i vand, for eksempel kalk. Normalt kan der opløses under 2 g i 100 mL vand, og i fældningstabellen står der T.",
        "fældningstabel": "Oversigt med positive ioner øverst og negative ioner i venstre side. Et T viser, at de to danner et tungtopløseligt salt.",
        "bundfald": "Fast stof, der dannes, når to saltopløsninger hældes sammen. To af ionerne danner et tungtopløseligt salt.",
        "fældningsreaktion": "Det, der sker, når to saltopløsninger hældes sammen, og der dannes et bundfald.",
        "tilskuerion": "Partikel med ladning, der ikke er med i bundfaldet. Den bliver i opløsningen og deltager ikke i reaktionen.",
        "ionskema": "Opskrivning af en fældningsreaktion med formler og en pil. Kun de partikler, der danner bundfaldet, er med."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#navne */
    NK.FANER = [
        { id: "ioner", nr: "2.1", titel: "Ioner",               hash: ["ioner", "ion", "2.1"] },
        { id: "navne", nr: "2.2", titel: "Ioners navne",        hash: ["navne", "ioners-navne", "2.2"] },
        { id: "forb",  nr: "2.3", titel: "Ionforbindelser",     hash: ["forb", "ionforbindelser", "salt", "2.3"] },
        { id: "faeld", nr: "2.4", titel: "Fældningsreaktioner", hash: ["faeld", "faeldning", "fældning", "faeldningsreaktioner", "2.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.navne = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 8

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 8 (NK_Undervisning/Kemibogen/fagord/kapitel-8.qmd) den
   1. nov. 2026 med et lille script; hævede tal er skrevet som tegn
   (Mg²⁺, MnO₄⁻), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "8";
    NK.ANTAL_FAGORD = 11;

    NK.FORKLARING = {
        /* 8.1 Redoxreaktioner */
        "oxidation": "Det, der sker, når et stof afgiver elektroner. Magnesium gør det, når det brænder og bliver til Mg²⁺.",
        "reduktion": "Det, der sker, når et stof optager elektroner. Dioxygen gør det og bliver til O²⁻, når magnesium brænder.",
        "redoxreaktion": "Elektroner overføres fra ét stof til et andet. Det ene stof afgiver dem, og det andet optager dem samtidig.",
        "delreaktion": "Skema, der kun viser det ene stof, som enten afgiver eller optager elektroner. Elektronerne skrives med som e⁻.",
        "oxidationsmiddel": "Stof, der optager elektroner fra et andet stof. Dioxygen, dichlor og dibrom er kraftige eksempler.",
        "reduktionsmiddel": "Stof, der afgiver elektroner til et andet stof. Metaller som magnesium, aluminium og natrium er kraftige eksempler.",
        /* 8.2 Spændingsrækken */
        "uædelt": "Siges om et metal, der let afgiver elektroner, for eksempel natrium og zink.",
        "ædelt": "Siges om et metal, der nødigt afgiver elektroner, for eksempel sølv og guld.",
        "spændingsrækken": "Liste, hvor metallerne står ordnet efter, hvor let de afgiver elektroner. De, der gør det lettest, står til venstre.",
        /* 8.3 Oxidationstal */
        "oxidationstal": "Tal, der udtrykker, hvor mange elektroner atomet har afgivet (plus) eller optaget (minus). Det tæller også elektroner, der kun er afgivet eller optaget delvist, og skrives med romertal, for eksempel −II.",
        /* 8.4 Afstemning af redoxreaktioner */
        "permanganat": "Violet ion med formlen MnO₄⁻. Den er et meget brugt oxidationsmiddel og bliver farveløs, når den reduceres i sur opløsning."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* Ingen ord fra andre kapitler og ingen ord uden for fagordlisten
       (brugeren tog 1. nov. 2026 tommelfingerregel ud af B1 igen). */
    NK.TIDLIGERE = {};

    /* 8.3 og 8.4 har kun ét fagord hver. Fagord fra 8.1 og 8.3 staar
       derfor med vilje paa mere end én figur (brugeren 1. nov. 2026: "der
       maa gerne vaere lidt repeterende oevelser"):
       oxidation og reduktion i 8.1 og ved skalaen i 8.3, reduktion igen ved
       mangans farver i 8.4, og oxidationstal i 8.3 og over glassene i 8.4. */
    NK.GENTAGET = ["oxidation", "reduktion", "oxidationstal"];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#8.2 */
    NK.FANER = [
        { id: "redox",         nr: "8.1", titel: "Redoxreaktioner", hash: ["redox", "redoxreaktioner", "8.1"] },
        { id: "spaending",     nr: "8.2", titel: "Spændingsrækken", hash: ["spaending", "spaendingsraekken", "8.2"] },
        { id: "oxidationstal", nr: "8.3", titel: "Oxidationstal",   hash: ["oxidationstal", "8.3"] },
        { id: "mangan",        nr: "8.4", titel: "Mangans farver",  hash: ["mangan", "afstemning", "permanganat", "8.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.redox = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

/* =====================================================================
   data.js - fagordene og forklaringerne

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 1 (NK_Undervisning/Kemibogen/fagord/kapitel-1.qmd) den
   27. okt. 2026. Rettes en forklaring i bogen, skal den rettes her med.
   Selvtesten tjekker, at alle 41 fagord fra listen sidder paa en plads.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    NK.FORKLARING = {
        /* 1.1 Hvad er kemi? */
        "makroniveau": "Den verden, vi kan se og måle på, for eksempel farver, temperatur og mængder.",
        "mikroniveau": "Den usynlige verden af atomer og molekyler.",
        "model": "Et forenklet billede af virkeligheden. Det bruges til at forklare det, man ser i et forsøg.",
        "rent stof": "Det modsatte af en blanding. Vand uden noget i er et eksempel.",
        "grundstof": "Består af kun én slags atomer. Guld og helium er eksempler.",
        "det periodiske system": "Oversigten, hvor alle 118 grundstoffer står samlet.",
        "atomsymbol": "Et eller to bogstaver, der står for et grundstof, for eksempel H eller Na.",
        "metal": "Blankt grundstof, der leder strøm og varme godt, for eksempel jern og kobber.",
        "ikke-metal": "Grundstof til højre for og over trappen i det periodiske system. Oxygen og carbon er eksempler.",
        "halvmetal": "Grundstof lige ved trappen i det periodiske system, for eksempel silicium. Det har egenskaber fra begge sider.",
        "kemisk forbindelse": "Stof, hvor atomer fra flere grundstoffer er bundet sammen, for eksempel vand.",
        /* 1.2 Atomet */
        "kerne": "Den lille, tunge del i midten af atomet. Den er bygget af protoner og neutroner.",
        "elektron": "Partikel uden om atomets kerne. Den har ladningen −1 og vejer næsten ingenting.",
        "proton": "Partikel i atomets kerne med ladningen +1.",
        "neutron": "Partikel i atomets kerne uden ladning.",
        "atomnummer": "Antallet af protoner i kernen. Det afgør, hvilket grundstof der er tale om.",
        "elektrisk neutral": "Har lige mange protoner og elektroner. De positive og negative ladninger ophæver derfor hinanden.",
        "isotoper": "Atomer af samme grundstof med forskelligt antal neutroner.",
        "nukleontal": "Det samlede antal protoner og neutroner i kernen, for eksempel 14 i carbon-14.",
        "atommasse": "Gennemsnittet af, hvad et grundstofs isotoper vejer, målt i enheden u.",
        /* 1.3 Elektronskaller og det periodiske system */
        "skalmodel": "Niels Bohrs forenklede billede af atomet. Elektronerne er fordelt i lag omkring kernen.",
        "skal": "Et af de lag omkring kernen, som elektronerne befinder sig i. Der er plads til 2 i det første og 8 i det næste.",
        "elektronstruktur": "Tal i en parentes, der viser, hvor mange elektroner der er i hver skal. Chlor har (2, 8, 7).",
        "periode": "Vandret række i oversigten over grundstofferne. Rækkens nummer er antallet af skaller.",
        "hovedgruppe": "Lodret kolonne, hvor atomerne har lige mange elektroner i yderste skal. Der er 8 af dem i det periodiske system.",
        "undergruppe": "Kolonne midt i det periodiske system. Her står kun metaller, og nummeret viser ikke antallet af elektroner i yderste skal.",
        "valenselektroner": "Partiklerne i atomets yderste skal. Det er dem, der er med i kemiske reaktioner.",
        "alkalimetaller": "Grundstofferne i hovedgruppe 1 uden hydrogen, for eksempel lithium, natrium og kalium.",
        "halogener": "Grundstofferne i hovedgruppe 7, for eksempel fluor, chlor og brom.",
        "ædelgasser": "Grundstofferne i hovedgruppe 8, for eksempel helium, neon og argon. De reagerer næsten ikke med andre stoffer.",
        "ædelgasreglen": "Atomer er mest stabile, når yderste skal ligner den hos grundstofferne i hovedgruppe 8.",
        "oktetreglen": "Atomer er mest stabile, når de har 8 elektroner i yderste skal. Navnet kommer af tallet.",
        /* 1.4 Reaktionsskemaer og afstemning */
        "kemisk formel": "Viser med symboler og små tal, hvilke atomer et stof består af. De små tal fortæller, hvor mange der er af hver slags.",
        "kemisk reaktion": "Atomerne bliver sat sammen på en ny måde, så der dannes nye stoffer.",
        "reaktionsskema": "Kemikerens opskrift: formler og en pil viser, hvad der reagerer, og hvad der dannes.",
        "reaktant": "Stof før pilen. Det er et af de stoffer, der reagerer med hinanden.",
        "produkt": "Stof efter pilen. Det er et af de stoffer, der bliver dannet.",
        "reaktionspil": "Tegnet mellem de stoffer, der reagerer, og de stoffer, der bliver dannet. Det læses \"bliver til\".",
        "koefficient": "Det store tal foran en formel. Det viser, hvor mange molekyler der er.",
        "afstemt": "Siges om et reaktionsskema, når der er lige mange atomer af hver slags før og efter pilen.",
        "tilstandssymbol": "Bogstaver i en parentes efter en formel, for eksempel (s) eller (aq). De viser, om stoffet er fast, flydende, en gas eller opløst i vand."
    };

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#atomet */
    NK.FANER = [
        { id: "hvad",   nr: "1.1", titel: "Hvad er kemi?",            hash: ["hvad", "1.1", "kemi", "hvad-er-kemi"] },
        { id: "atom",   nr: "1.2", titel: "Atomet",                    hash: ["atom", "atomet", "1.2"] },
        { id: "skal",   nr: "1.3", titel: "Elektronskaller",           hash: ["skal", "skaller", "elektronskaller", "1.3"] },
        { id: "skema",  nr: "1.4", titel: "Reaktionsskemaer",          hash: ["skema", "reaktionsskema", "reaktionsskemaer", "1.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.atom = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

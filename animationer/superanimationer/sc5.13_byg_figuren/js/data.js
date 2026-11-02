/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 5

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 5 (NK_Undervisning/Kemibogen/fagord/kapitel-5.qmd) den
   1. nov. 2026 med et lille script; hævede tal er skrevet som tegn
   (10²³), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "5";
    NK.ANTAL_FAGORD = 20;

    NK.FORKLARING = {
        /* 5.1 Beregninger i kemi */
        "størrelse": "Noget, man kan måle, for eksempel masse eller volumen. Har et symbol og en enhed.",
        "symbol": "Bogstav, der står for en størrelse, for eksempel m for masse og V for volumen.",
        "enhed": "Fortæller, hvad en størrelse er målt i, for eksempel gram eller milliliter.",
        "volumen": "Hvor meget noget fylder. Symbolet er V, og der måles i milliliter eller liter.",
        "densitet": "Hvor meget én milliliter af et stof vejer. Findes ved at dividere massen med volumenet.",
        "betydende cifre": "De tal i et måleresultat, der viser, hvor præcist der er målt. 10,00 g har fire, og 0,92 g/mL har to.",
        /* 5.2 Molarmasse */
        "formelmasse": "Massen af én formelenhed, målt i enheden u. For et stof af molekyler er det massen af ét molekyle, og for et salt som NaCl er det én natriumion og én chloridion.",
        "molarmasse": "Massen pr. mol formelenheder af et stof. Symbolet er M, og enheden er g/mol.",
        /* 5.3 Stofmængde */
        "mol": "Enhed for et bestemt antal, ligesom et par og et dusin. Her er antallet 6,02 · 10²³ stykker.",
        "stofmængde": "Antallet af mol. Symbolet er n, og den findes ved at dividere massen med molarmassen.",
        /* 5.4 Ækvivalente mængder */
        "ækvivalente mængder": "Antal mol af to stoffer, der står i samme forhold som koefficienterne i reaktionsskemaet. De kan netop reagere, uden at der bliver noget tilovers.",
        "begrænsende faktor": "Det stof, der slipper op først i en reaktion. Det bestemmer, hvor meget produkt der kan dannes.",
        /* 5.5 Mængdeberegning */
        "mængdeberegning": "Her regner man fra massen af ét stof i en reaktion til massen af et andet. Vejen går over stofmængden.",
        "mængdeberegningsskema": "Tabel under reaktionsskemaet med tre rækker: massen, molarmassen og stofmængden.",
        "vejeanalyse": "Metode, hvor man finder mængden af et stof ved at veje. En ion kan for eksempel fældes ud, og bundfaldet filtreres fra, tørres og vejes.",
        /* 5.6 Gasser */
        "tryk": "Fortæller, hvor hårdt en gas bliver presset sammen. Symbolet er p, og der måles i bar.",
        "kelvin": "Enhed for temperatur i beregninger med gasser. Man lægger 273 til tallet i grader celsius.",
        "det absolutte nulpunkt": "Den laveste temperatur, der findes, nemlig −273 °C. Her begynder kelvinskalaen.",
        "idealgasligningen": "Sammenhængen mellem en gas' tryk, volumen, stofmængde og temperatur. Den skrives p · V = n · R · T.",
        "gaskonstanten": "Tallet R i idealgasligningen, som er det samme for alle gasser."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    /* vejeanalyse er taget ud af 5.5 (brugeren 1. nov. 2026: "Synes vi skal
       tage vejeanalyse ud (gør bare bedre plads til mængdeberegningsskemaet.)") */
    NK.UDELADT = ["vejeanalyse"];

    /* Fagord fra kapitel 1, som eleven saetter paa igen (brugeren 1. nov.
       2026: "der maa gerne vaere lidt repeterende oevelser"). Forklaringen
       er fra kapitel 1's fagordliste. */
    NK.TIDLIGERE = {
        "atommasse": "Gennemsnittet af, hvad et grundstofs isotoper vejer, målt i enheden u.",
        "koefficient": "Det store tal foran en formel. Det viser, hvor mange molekyler der er.",
        /* masse står ikke på nogen af bogens fagordlister. Brugeren bad om den i
           5.3 ved vægtene 1. nov. 2026; forklaringen er skrevet som bogens
           forklaring af volumen i 5.1 */
        "masse": "Hvor meget noget vejer. Symbolet er m, og der måles i gram eller kilogram."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Fagord, der med vilje staar paa mere end én figur: molarmasse i 5.2
       og igen i 5.3, stofmængde i 5.3 og igen i 5.5, volumen i 5.1 og
       igen i 5.6 ved gassen i cylinderen */
    NK.GENTAGET = ["molarmasse", "stofmængde", "volumen"];

    /* De seks faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#gasser */
    NK.FANER = [
        { id: "beregn",  nr: "5.1", titel: "Beregninger",         hash: ["beregn", "beregninger", "densitet", "5.1"] },
        { id: "molar",   nr: "5.2", titel: "Molarmasse",          hash: ["molar", "molarmasse", "formelmasse", "5.2"] },
        { id: "mol",     nr: "5.3", titel: "Stofmængde",          hash: ["mol", "stofmaengde", "5.3"] },
        { id: "aekv",    nr: "5.4", titel: "Ækvivalente mængder", hash: ["aekv", "aekvivalente-maengder", "begraensende-faktor", "5.4"] },
        { id: "maengde", nr: "5.5", titel: "Mængdeberegning",     hash: ["maengde", "maengdeberegning", "5.5"] },
        { id: "gas",     nr: "5.6", titel: "Gasser",              hash: ["gas", "gasser", "idealgasligningen", "5.6"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.gas = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

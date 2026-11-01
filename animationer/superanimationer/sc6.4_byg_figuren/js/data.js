/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel 6

   Forklaringerne er kopieret ordret fra Kemibogens fagordliste til
   kapitel 6 (NK_Undervisning/Kemibogen/fagord/kapitel-6.qmd) den
   1. nov. 2026 med et lille script; hævede og sænkede tal er skrevet
   som tegn (CaCl₂, [Ca²⁺]), og kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "6";
    NK.ANTAL_FAGORD = 19;

    NK.FORKLARING = {
        /* 6.1 Koncentration */
        "opløsning": "Blanding, hvor et stof har fordelt sig jævnt i en væske. Salt, der er rørt ud i vand, er et eksempel.",
        "opløst stof": "Det, der er rørt ud og har fordelt sig jævnt i væsken, for eksempel saltet i saltvand.",
        "opløsningsmiddel": "Væsken, som noget andet bliver rørt ud i og fordeler sig i. Vandet i saltvand er et eksempel.",
        "masseprocent": "Fortæller, hvor stor en del af en blandings vægt et stof udgør. 1,2 g salt i 100 g brød giver 1,2 %.",
        "stofmængdekoncentration": "Antallet af mol af et stof i én liter opløsning. Symbolet er c, og enheden er mol/L.",
        "molær": "Sådan læses bogstavet M, når det står i stedet for enheden mol/L.",
        "målekolbe": "Glas med et mærke på halsen, som viser præcis, hvor meget det rummer. Bruges til at fremstille en opløsning med en bestemt koncentration.",
        "fortynde": "At hælde mere vand i en opløsning, så koncentrationen bliver lavere. Stofmængden er den samme før og efter.",
        /* 6.2 Formel og aktuel koncentration */
        "formel koncentration": "Stofmængden pr. liter af det stof, der er hældt i, også når det er delt op i ioner. Skrives for eksempel c(CaCl₂).",
        "aktuel koncentration": "Stofmængden pr. liter af de ioner og molekyler, der faktisk findes i opløsningen. Skrives med kantede parenteser, for eksempel [Ca²⁺].",
        /* 6.3 Titrering */
        "kvalitativ analyse": "Undersøgelse af, hvad en prøve indeholder. Er der salt i chipsene?",
        "kvantitativ analyse": "Undersøgelse af, hvor meget der er af et stof i en prøve. Hvor mange procent salt er der i chipsene?",
        "titrering": "Metode til at måle, hvor meget stof en prøve indeholder. En opløsning med kendt koncentration dryppes i, til alt stoffet har reageret.",
        "burette": "Langt glasrør med inddeling i milliliter og en hane forneden. Herfra dryppes opløsningen med kendt koncentration ned i kolben med prøven.",
        "ækvivalenspunkt": "Det øjeblik i en titrering, hvor alt stoffet i prøven netop har reageret. Der er dryppet præcis nok i.",
        "indikator": "Stof, der skifter farve, når alt stoffet i prøven har reageret. I en Mohrtitrering bruges dichlorfluorescein.",
        "omslag": "Farveskiftet i kolben, som viser, at ækvivalenspunktet er nået. Så lukkes hanen på buretten.",
        "Mohrtitrering": "Analyse, der bestemmer saltindholdet i en fødevare. Sølv(I)nitrat dryppes i, til farven skifter fra gulgrøn til lyserød.",
        "afvigelse": "Forskellen mellem det målte tal og det forventede tal, regnet om til procent. Er den lille, passer målingen godt."
    };

    /* Fagord fra listen, der med vilje ikke er paa en figur */
    NK.UDELADT = [];

    /* Fagord fra tidligere kapitler, som eleven saetter paa igen i 6.2
       (brugeren 1. nov. 2026: "der maa gerne vaere lidt repeterende
       oevelser"). Forklaringen er fra det kapitels fagordliste. */
    NK.TIDLIGERE = {
        "formelenhed": "Den mindste portion af et salt med ionerne i det rigtige forhold. I NaCl består den af én natriumion og én chloridion.",
        "stofmængde": "Antallet af mol. Symbolet er n, og den findes ved at dividere massen med molarmassen."
    };
    Object.keys(NK.TIDLIGERE).forEach(function (o) { NK.FORKLARING[o] = NK.TIDLIGERE[o]; });

    /* Fagord, der med vilje staar paa mere end én figur: molær i 6.1 ved
       saltvandets etiket og igen i 6.2 ved enheden paa soejlediagrammet */
    NK.GENTAGET = ["molær"];

    /* De tre faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#titrering */
    NK.FANER = [
        { id: "konc",  nr: "6.1", titel: "Koncentration",        hash: ["konc", "koncentration", "6.1"] },
        { id: "aktuel", nr: "6.2", titel: "Formel og aktuel",    hash: ["aktuel", "formel", "formel-og-aktuel", "6.2"] },
        { id: "titrering", nr: "6.3", titel: "Titrering",        hash: ["titrering", "mohr", "mohrtitrering", "6.3"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.konc = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

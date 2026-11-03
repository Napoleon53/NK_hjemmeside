/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B5

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B5 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b5.qmd) den
   3. nov. 2026 med et lille script (chromofor gruppe kom til samme dag); λ~max~ er skrevet som λₘₐₓ, og
   kursiv er taget af.
   Rettes en forklaring i bogen, skal den rettes her med. Selvtesten
   tjekker, at alle fagord fra listen sidder paa en plads, undtagen dem
   i NK.UDELADT.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    /* Kapitlet og antallet af fagord i bogens liste (selvtesten tjekker det) */
    NK.KAPITEL = "B5";
    NK.ANTAL_FAGORD = 23;

    NK.FORKLARING = {
        /* B5.1 Lys og farver */
        "bølgelængde": "Afstanden fra én top til den næste i lyset. Den har symbolet λ, måles i nanometer og bestemmer farven.",
        "synligt lys": "Det, øjet kan se. Bølgelængderne går fra omkring 400 nm, som er violet, til omkring 700 nm, som er rødt.",
        "hvidt lys": "Blanding af alle farverne fra violet til rød. Det er det, der kommer fra Solen og fra en lampe.",
        "absorbere": "Optage lys, så lysets energi bliver i stoffet. Et farvet stof gør det kun med nogle af bølgelængderne.",
        "farvecirkel": "Ring, der viser, hvad vi ser, når en bestemt del af lyset er væk. Rød står lige over for blågrøn.",
        "komplementærfarver": "Par som rød og blågrøn, der står lige over for hinanden i cirklen. Når et stof absorberer den ene, ser vi den anden.",
        /* B5.2 Absorptionsspektre */
        "spektrofotometer": "Apparat, der sender lys med én bølgelængde gennem en opløsning. Det måler, hvor meget lys der kommer ud på den anden side.",
        "kuvette": "Lille, firkantet beholder af glas eller plast, som prøven står i. Lyset går igennem den.",
        "absorbans": "Tal uden enhed med symbolet A. Jo mere lys opløsningen optager, jo større er tallet.",
        "blindprøve": "Kuvette uden det farvede stof, ofte med rent vand. Med den nulstilles spektrofotometeret, før der måles.",
        "absorptionsspektrum": "Graf, der viser, hvor meget lys et stof optager ved hver bølgelængde. Hvert farvet stof har sin egen, så den kan bruges til at genkende stoffet.",
        "absorptionsmaksimum": "Den bølgelængde, hvor et stof optager mest lys. Den skrives λₘₐₓ og ses som toppen på grafen.",
        "konjugerede dobbeltbindinger": "To bindinger af typen C=C med præcis én enkeltbinding imellem. Farvestoffer har en lang række af dem.",
        "chromofor": "Den del af et molekyle, der absorberer lyset. I et farvestof er det den længste række af konjugerede dobbeltbindinger.",
        /* chromofor gruppe er nyt fagord 3. nov. 2026 (brugeren: "Jeg synes også at chromofor gruppe skal være et fagord") */
        "chromofor gruppe": "Lille del af et molekyle med en dobbeltbinding, som C=C, C=O eller N=N. Flere af dem i en konjugeret række giver farve.",
        /* B5.3 Lambert-Beers lov */
        "ligefrem proportional": "Sammenhæng, hvor den ene størrelse bliver 2 gange så stor, når den anden gør. Sådan følger absorbansen koncentrationen.",
        "lysvej": "Kuvettens bredde med symbolet l, som regel 1,00 cm. Jo bredere kuvetten er, jo større bliver absorbansen.",
        "ekstinktionskoefficient": "Konstant, der viser, hvor kraftigt et stof absorberer lys ved en bestemt bølgelængde. Symbolet er ε.",
        "Lambert-Beers lov": "Siger, at absorbansen er ekstinktionskoefficienten ganget med lysvejen og koncentrationen. Gælder kun for fortyndede opløsninger.",
        /* B5.4 Standardkurven */
        "standardopløsning": "Væske med en præcist kendt koncentration af det farvede stof. Der laves en række af dem, og deres absorbans måles.",
        "stamopløsning": "Væske med høj og præcist kendt koncentration. Den fortyndes med vand, når man laver rækken af standarder.",
        "standardkurve": "Graf med koncentrationen på den vandrette akse og absorbansen på den lodrette. Punkterne fra opløsninger med kendt koncentration ligger på en ret linje.",
        "lineært område": "Den del af grafen, hvor punkterne ligger på den rette linje. Kun dér kan grafen bruges til at finde en koncentration."
    };

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Ingen ord fra andre kapitler */
    NK.TIDLIGERE = {};

    /* Blindproeven staar igen i B5.4 i raekken med standardopløsningerne
       (gentagelse er godt, brugeren 1. nov. 2026) */
    NK.GENTAGET = ["blindprøve"];

    /* De fire faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b5.3 */
    NK.FANER = [
        { id: "farver",   nr: "B5.1", titel: "Lys og farver",       hash: ["farver", "lys", "lys-og-farver", "b5.1"] },
        { id: "spektre",  nr: "B5.2", titel: "Absorptionsspektre",  hash: ["spektre", "absorptionsspektre", "spektrofotometer", "b5.2"] },
        { id: "lambert",  nr: "B5.3", titel: "Lambert-Beers lov",   hash: ["lambert", "lambert-beer", "lambert-beers-lov", "b5.3"] },
        { id: "standard", nr: "B5.4", titel: "Standardkurven",      hash: ["standard", "standardkurve", "standardkurven", "b5.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.farver = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

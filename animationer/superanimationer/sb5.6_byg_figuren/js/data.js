/* =====================================================================
   data.js - fagordene og forklaringerne til kapitel B5

   Forklaringerne er kopieret ordret fra B-bogens fagordliste til
   kapitel B5 (NK_Undervisning/Kemibogen/b/fagord/kapitel-b5.qmd) den
   3. nov. 2026 med et lille script og igen 10. nov. 2026, da kapitlet fik tre
   afsnit (B5.1 til B5.3 slået sammen til to, chromofor er ikke fagord
   længere); λ~max~ er skrevet som λₘₐₓ, og kursiv er taget af.
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
    NK.ANTAL_FAGORD = 22;

    NK.FORKLARING = {
        /* B5.1 Lys og farver */
        "bølgelængde": "Afstanden fra én top til den næste i lyset. Den har symbolet λ, angives i nanometer og bestemmer lysets farve og energi.",
        "synligt lys": "Den del af den elektromagnetiske stråling, øjet kan opfatte. Bølgelængderne går fra omkring 400 nm, som er violet, til omkring 700 nm, som er rødt.",
        "hvidt lys": "Blanding af alle farverne fra violet til rød. Det udsendes af Solen og af almindelige lamper.",
        "absorbere": "Optage lys, så lysets energi overføres til stoffet. Et farvet stof optager kun nogle af bølgelængderne i det synlige lys.",
        "farvecirkel": "Ring, der viser, hvad vi ser, når en bestemt del af lyset er absorberet. Rød står lige over for blågrøn.",
        "komplementærfarver": "Par som rød og blågrøn, der står lige over for hinanden i cirklen. Når et stof absorberer den ene, ser vi den anden.",
        "konjugerede dobbeltbindinger": "To bindinger af typen C=C, C=O eller N=N med præcis én enkeltbinding imellem. Molekylerne i farvestoffer har en lang række af dem.",
        "chromofor gruppe": "Lille del af et molekyle med en dobbeltbinding, som C=C, C=O eller N=N. Flere af dem i en konjugeret række giver farve.",
        /* B5.2 Absorbans og Lambert-Beers lov */
        "spektrofotometer": "Apparat, der sender lys med én bølgelængde gennem en opløsning. Det måler, hvor meget lys der kommer ud på den anden side.",
        "kuvette": "Lille, firkantet beholder af glas eller plast, som prøven står i. Lyset går igennem den.",
        "absorbans": "Størrelse uden enhed med symbolet A. Jo mere lys opløsningen optager, jo større er den.",
        "blindprøve": "Kuvette med opløsningsmidlet uden det farvede stof, ofte demineraliseret vand. Med den nulstilles spektrofotometeret, før der måles.",
        "absorptionsspektrum": "Graf, der viser, hvor meget lys et stof optager ved hver bølgelængde. Hvert farvet stof har sin egen, så den kan bruges til at genkende stoffet.",
        "absorptionsmaksimum": "Den bølgelængde, hvor et stof optager mest lys. Den skrives λₘₐₓ og ses som toppen på grafen.",
        "ligefrem proportional": "Sammenhæng, hvor den ene størrelse er en konstant gange den anden. Absorbansen bliver for eksempel 2 gange så stor, når koncentrationen bliver det.",
        "lysvej": "Kuvettens bredde med symbolet l, som regel 1,00 cm. Jo bredere kuvetten er, jo større bliver absorbansen.",
        "ekstinktionskoefficient": "Konstant, der viser, hvor kraftigt et stof absorberer lys ved en bestemt bølgelængde. Symbolet er ε.",
        "Lambert-Beers lov": "Siger, at absorbansen er ekstinktionskoefficienten ganget med lysvejen og koncentrationen. Gælder kun for fortyndede opløsninger.",
        /* B5.3 Standardkurven */
        "standardopløsning": "Væske med en præcist kendt koncentration af det stof, der skal bestemmes. En række af dem med stigende koncentration måles i spektrofotometeret.",
        "stamopløsning": "Væske med en høj, præcist kendt koncentration af stoffet. Rækken af standarder fremstilles ved at fortynde den med vand.",
        "standardkurve": "Graf over absorbansen af en række kendte opløsninger som funktion af koncentrationen. I det lineære område ligger punkterne på en ret linje.",
        "lineært område": "Koncentrationsinterval, hvor absorbansen er proportional med koncentrationen. Kun her kan en standardkurve bruges til at bestemme en koncentration."
    };

    /* Alle fagord fra listen sidder paa en figur */
    NK.UDELADT = [];

    /* Ingen ord fra andre kapitler */
    NK.TIDLIGERE = {};

    /* Blindproeven staar igen i B5.3 i raekken med standardopløsningerne
       (gentagelse er godt, brugeren 1. nov. 2026) */
    NK.GENTAGET = ["blindprøve"];

    /* De tre faner i samme raekkefoelge som afsnittene. hash er de
       adresser, der aabner fanen direkte: index.html#b5.2. De gamle ord
       (spektre, lambert, b5.4) virker stadig. */
    NK.FANER = [
        { id: "farver",    nr: "B5.1", titel: "Lys og farver",                   hash: ["farver", "lys", "lys-og-farver", "b5.1"] },
        { id: "absorbans", nr: "B5.2", titel: "Absorbans og Lambert-Beers lov", hash: ["absorbans", "spektre", "absorptionsspektre", "spektrofotometer",
                                                                                      "lambert", "lambert-beer", "lambert-beers-lov", "b5.2"] },
        { id: "standard",  nr: "B5.3", titel: "Standardkurven",                  hash: ["standard", "standardkurve", "standardkurven", "b5.3", "b5.4"] }
    ];

    /* Foerste saetning af en forklaring (som brikken i Kort og godt) */
    NK.foersteSaetning = function (s) {
        var m = /^(.+?[.!?])\s+(?=[A-ZÆØÅ"])/.exec(s);
        return m ? m[1] : s;
    };

    /* Figurerne lægger sig her: NK.FIGURER.farver = { ... } */
    NK.FIGURER = NK.FIGURER || {};
}());

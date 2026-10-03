/* =====================================================================
   data.js - quizzerne, hjulene og Kemichaels replikker

   De indbyggede quizzer staar i det samme tekstformat, som en laerer
   skriver sine egne i (se tekstformat.js). Saa kan de kopieres direkte
   ind i vinduet Quizzer som tekst og rettes der. Linket vaelger quizzen:
   index.html er Kemi B, index.html#a er Kemi A, index.html#nf er NF.

   En linje er en gaade:
     Toss-up: kategori ; loesning          (toss-up til 1.000 kr.)
     Toss-up 2000: kategori ; loesning     (toss-up til 2.000 kr.)
     Runde: kategori ; loesning            (en runde med hjulet)
     Final: kategori ; loesning            (hoejst én)
   I loesningen tvinger / et linjeskift, og et langt ord deles ved -.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = {};

    /* ----- Kemi B: grundbegreber ------------------------------------------
       Fra "Afsluttende lykkehjulquiz kemi B 2024.pptm". Redox og buffer er
       tilfoejet, saa quizzen daekker B-kernestoffet. */
    var QUIZ_B = [
        "Titel: Kemi B, grundbegreber",
        "",
        "Toss-up: Organisk kemi ; Substitutions-reaktion",
        "Runde: Ligevægte ; Le Chateliers princip",
        "Runde: Redoxkemi ; Oxidation er afgivelse af elektroner",
        "Toss-up: Begreb ved molekyler ; Elektro-negativitet",
        "Runde: Syre-base ; En buffer holder pH næsten konstant",
        "Runde: Reaktionskinetik ; Aktiverings-energien",
        "Toss-up 2000: Begreb ved reaktionsskemaer ; Tilstandsform",
        "Runde: Biokemi ; Triglycerider",
        "",
        "Final: I naturen ; Koffein"
    ].join("\n");

    /* ----- Kemi A: fra "Afsluttende lykkehjulquiz kemi A.pptm" ----------- */
    var QUIZ_A = [
        "Titel: Kemi A, afslutning",
        "",
        "Toss-up: Organisk kemi ; Substitutions-reaktion",
        "Toss-up: Begreb ved molekyler ; Elektro-negativitet",
        "Runde: Kemiske reaktioner ; Le Chateliers princip",
        "Runde: Termodynamik ; Gibbs fri energi",
        "Toss-up 2000: Begreb ved reaktionsskemaer ; Tilstandsform",
        "Toss-up 3000: Reaktionskinetik ; Arrhenius",
        "Runde: Reaktioner ; Aktiverings-energien",
        "Runde: Biokemi ; Proteinsyntese",
        "",
        "Final: I naturen ; Koffein"
    ].join("\n");

    /* ----- NF (hf): fra "Modul 8 Afsluttende lykkehjulquiz NF.pptm" ------ */
    var QUIZ_NF = [
        "Titel: NF, afslutning",
        "",
        "Toss-up: Begreb ved reaktionsskemaer ; Tilstandsform",
        "Toss-up: Begreb ved molekyler ; Elektro-negativitet",
        "Runde: Ved mængdeberegning ; Molarmasse",
        "Runde: Løsningsforslag ; Biodiesel",
        "Runde: Organisk kemi ; Substitutions-reaktion",
        "",
        "Final: Plast ; Polyethylen"
    ].join("\n");

    /* ----- Emnequizzer: fem runder uden toss-ups og uden finale ------------
       Skrevet af Claude til C-niveauet. Løsningerne er korte faglige
       sætninger, så der er mange forskellige bogstaver at gætte på. */
    var QUIZ_ATOM = [
        "Titel: Atomet og ioner",
        "",
        "Runde: Atomets byggesten ; Protoner, neutroner og elektroner",
        "Runde: Det periodiske system ; Ædelgasserne har fuld yderskal",
        "Runde: Isotoper ; Samme grundstof med forskellig masse",
        "Runde: Ioner ; Positive ioner hedder kationer",
        "Runde: Ionforbindelser ; Natriumchlorid er køkkensalt"
    ].join("\n");

    var QUIZ_MOLEKYLER = [
        "Titel: Molekyler og organisk kemi",
        "",
        "Runde: Kovalente bindinger ; Atomerne deler elektronpar",
        "Runde: Polaritet ; Vand er et polært molekyle",
        "Runde: Bindinger mellem molekyler ; Hydrogen-bindinger hæver kogepunktet",
        "Runde: Carbonhydrider ; Alkener har en dobbeltbinding",
        "Runde: Isomeri ; Isomerer har samme molekylformel"
    ].join("\n");

    var QUIZ_BEREGNING = [
        "Titel: Beregninger, koncentration og pH",
        "",
        "Runde: Enheder ; Koncentration måles i mol pr. liter",
        "Runde: Mængdeberegning ; Stofmængde er masse divideret med molarmasse",
        "Runde: Fortynding ; Stofmængden er den samme før og efter",
        "Runde: pH-skalaen ; Sure opløsninger har pH under 7",
        "Runde: Syre og base ; En syre afgiver en hydron"
    ].join("\n");

    /* noegle: det, linket skriver efter # */
    D.INDBYGGEDE = [
        { noegle: "b", tekst: QUIZ_B },
        { noegle: "a", tekst: QUIZ_A },
        { noegle: "nf", tekst: QUIZ_NF },
        { noegle: "atom", tekst: QUIZ_ATOM },
        { noegle: "molekyler", tekst: QUIZ_MOLEKYLER },
        { noegle: "beregning", tekst: QUIZ_BEREGNING }
    ];
    D.STANDARD = "b";

    /* ----- Bogstaverne ------------------------------------------------------
       Dansk: Y er en vokal, og Æ, Ø og Å er med. */
    D.VOKALER = "AEIOUYÆØÅ";
    D.KONSONANTER = "BCDFGHJKLMNPQRSTVWXZ";
    D.VOKALPRIS = 250;
    /* Et hold, der loeser en runde, faar mindst saa meget (som i tv) */
    D.MINDSTE_GEVINST = 1000;
    D.TOSSUP_STANDARD = 1000;

    /* Finalen: de seks bogstaver vises, og holdet vaelger selv 3 + 1 */
    D.FINAL_BOGSTAVER = "RSTLNE";
    D.FINAL_KONSONANTER = 3;
    D.FINAL_VOKALER = 1;
    D.FINAL_TID = 10;

    /* ----- Holdene ---------------------------------------------------------- */
    D.HOLD = ["Rød", "Gul", "Blå"];
    D.HOLDFARVER = ["roed", "gul", "blaa", "groen"];
    D.FARVENAVNE = ["Rød", "Gul", "Blå", "Grøn"];
    D.MIN_HOLD = 2;
    D.MAKS_HOLD = 4;

    /* ----- Hjulet ------------------------------------------------------------
       Beløbene og rækkefølgen er skabelonens. Fallit og Mist tur står, hvor
       skabelonen havde Bankrupt og Lose a turn. Wild card og Free spin er
       ikke med. Felt 0 står øverst, og så går det med uret. */
    var FARVER = ["#e8262a", "#ffd21f", "#1fb4ef", "#ff9a1f", "#b77cf2", "#ff72c8", "#28c35c"];
    var VAERDIER = [900, 300, 600, 700, 450, 300, 900, 300, 900, 500, 300, 500,
        "mist", 400, 400, 500, 550, 600, 350, 600, 300, 800, 1000, "fallit"];
    D.HJUL = VAERDIER.map(function (v, i) {
        if (v === "fallit") return { type: "fallit", tekst: "FALLIT", farve: "#101014", skrift: "#ffffff" };
        if (v === "mist") return { type: "mist", tekst: "MIST TUR", farve: "#f4f4f4", skrift: "#111111" };
        return { type: "vaerdi", v: v, farve: FARVER[i % FARVER.length], skrift: "#111111" };
    });

    /* Præmiehjulet i finalen: 24 kuverter. Beløbet trækkes, når hjulet
       stopper, og vises først, når finalen er afgjort. */
    var PASTEL = ["#8fd3ff", "#b39ddb", "#80e0a7", "#b0bb6a", "#a78bc8", "#6f9bff", "#35b6f0", "#62d69b"];
    D.PRAEMIEHJUL = [];
    for (var i = 0; i < 24; i++) {
        D.PRAEMIEHJUL.push({ type: "kuvert", tekst: i % 6 === 0 ? "★" : "✉", farve: PASTEL[i % PASTEL.length], skrift: "#0b1d4d" });
    }
    D.PRAEMIER = [5000, 6000, 7000, 7500, 8000, 10000, 12500, 15000, 25000];

    /* ----- Alene ved computeren ----------------------------------------------
       Ingen lærer og ingen andre hold, så spilleren skriver løsningen, og
       spillet tjekker den. Alt, der i holdspillet giver turen videre, koster
       et liv. En toss-up er mindre værd, jo flere bogstaver der er vist. */
    D.ALENE = {
        liv: 3,          /* liv i hver runde */
        finalTid: 20,    /* sekunder til at skrive finalens løsning */
        straf: 2,        /* bogstaver, der vises ekstra efter et forkert svar i en toss-up */
        trin: 50,        /* toss-uppens værdi rundes ned til hele 50 kr. */
        navn: "Spiller",
        /* Mindre kuverter end med hold, så rekorden mest afgøres af gåderne */
        praemier: [2000, 3000, 4000, 5000, 6000, 8000, 10000]
    };

    /* ----- Tider (sekunder) ------------------------------------------------- */
    D.TOSSUP_INTERVAL = 1.1;
    D.HJUL_TID = 5.3;

    /* ----- Kemichaels praesentation -----------------------------------------
       Første gang spillet åbnes i en browser. Højst ca. 60 tegn pr. replik og
       ingen teori. Linjen i INTRO_PEG siger han, mens han peger på opsætningen. */
    D.INTRO = {
        titel: [
            "Velkommen til Kemi-Lykkehjulet. Jeg er jeres vært.",
            "Skriv holdenes navne her, og tryk Start.",
            "Hjulet er ikke snydt. Det har jeg selv tjekket."
        ]
    };
    D.INTRO_PEG = 1;
}());

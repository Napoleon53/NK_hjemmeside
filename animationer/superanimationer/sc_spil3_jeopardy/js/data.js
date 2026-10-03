/* =====================================================================
   data.js - de to quizzer og Kemichaels replikker

   D.QUIZZER har én quiz pr. niveau. Linket vaelger niveauet:
   index.html er C (1.g), index.html#b er B. En laerer kan erstatte
   quizzen i sin egen browser med sin egen tekst (se tekstformat.js).

   En quiz er data. En ny laves ved at kopiere en af dem, give den et nyt
   id og skifte teksterne ud. Teksterne maa have <sub> og <sup>; alt andet
   skrives som almindelig tekst. Lange kategorinavne faar &shy; der, hvor
   de maa deles paa braettet.

   runder[r].vaerdier    beloebene i raekkefoelge (felt 0 er det mindste)
   runder[r].kategorier  hver med navn og lige saa mange felter som beloeb
   runder[r].dobbelt     valgfri: [[kategori, raekke]] laaser Daily Double
                         fast; ellers laegges den tilfaeldigt i raekke 3-5
   final                 kategori, ledetraad og svar
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data = {};

    /* ----- Kemi C, 1.g: emnerne C1 til C6 paa hjemmesiden -------------- */
    var QUIZ_C = {
        id: "kemi-c-1g",
        navn: "Kemi C, 1.g",
        enhed: "kr.",
        runder: [{
            vaerdier: [100, 200, 300, 400, 500],
            kategorier: [
                { navn: "Atomer", felter: [
                    { ledetraad: "Den positivt ladede partikel i atomkernen",
                      svar: "Hvad er en proton?" },
                    { ledetraad: "Atomer af samme grundstof med forskelligt antal neutroner",
                      svar: "Hvad er isotoper?" },
                    { ledetraad: "Antallet af neutroner i en ¹⁴C-kerne",
                      svar: "Hvad er 8?" },
                    { ledetraad: "Elektronfordelingen i skaller for et natriumatom",
                      svar: "Hvad er 2, 8, 1?" },
                    { ledetraad: "Koefficienten foran O₂, når 2 C₂H₆ + … O₂ → 4 CO₂ + 6 H₂O afstemmes",
                      svar: "Hvad er 7?" }
                ] },
                { navn: "Ion&shy;forbindelser", felter: [
                    { ledetraad: "En negativt ladet ion",
                      svar: "Hvad er en anion?" },
                    { ledetraad: "Formlen for calciumchlorid",
                      svar: "Hvad er CaCl₂?" },
                    { ledetraad: "Navnet på ionen SO₄²⁻",
                      svar: "Hvad er sulfat?" },
                    { ledetraad: "Bundfaldet, når sølvnitrat og natriumchlorid blandes",
                      svar: "Hvad er sølvchlorid, AgCl?" },
                    { ledetraad: "Formlen for aluminiumsulfat",
                      svar: "Hvad er Al₂(SO₄)₃?" }
                ] },
                { navn: "Molekyler", felter: [
                    { ledetraad: "Bindingen, hvor to atomer deler et elektronpar",
                      svar: "Hvad er en kovalent binding (elektronparbinding)?" },
                    { ledetraad: "Antallet af ledige elektronpar på oxygenatomet i H₂O",
                      svar: "Hvad er 2?" },
                    { ledetraad: "Formen på et NH₃-molekyle",
                      svar: "Hvad er pyramideformet (trigonal pyramide)?" },
                    { ledetraad: "Bindingerne mellem vandmolekyler, der giver vand et højt kogepunkt",
                      svar: "Hvad er hydrogenbindinger?" },
                    { ledetraad: "Grunden til, at CO₂ er upolært, selv om bindingerne er polære",
                      svar: "Hvad er den lineære form, hvor dipolerne ophæver hinanden?" }
                ] },
                { navn: "Mængde&shy;beregning", felter: [
                    { ledetraad: "Enheden for stofmængde",
                      svar: "Hvad er mol?" },
                    { ledetraad: "Molarmassen af H₂O",
                      svar: "Hvad er 18,02 g/mol?" },
                    { ledetraad: "Formlen, der forbinder masse, stofmængde og molarmasse",
                      svar: "Hvad er m = n · M?" },
                    { ledetraad: "Stofmængden i 88 g CO₂",
                      svar: "Hvad er 2,0 mol?" },
                    { ledetraad: "Massen af vand, der dannes, når 2,0 mol H₂ brænder: 2 H₂ + O₂ → 2 H₂O",
                      svar: "Hvad er 36 g?" }
                ] },
                { navn: "Koncen&shy;tration", felter: [
                    { ledetraad: "Formlen for stofmængdekoncentration",
                      svar: "Hvad er c = n / V?" },
                    { ledetraad: "Koncentrationen, når 0,50 mol NaCl opløses i vand til 250 mL opløsning",
                      svar: "Hvad er 2,0 M?" },
                    { ledetraad: "Den aktuelle koncentration af Cl⁻ i 0,10 M CaCl₂",
                      svar: "Hvad er 0,20 M?" },
                    { ledetraad: "Rumfanget af 2,0 M HCl, der skal fortyndes til 500 mL 0,10 M HCl",
                      svar: "Hvad er 25 mL?" },
                    { ledetraad: "Titreringen, hvor Cl⁻ fældes med Ag⁺, og chromat viser slutpunktet",
                      svar: "Hvad er en Mohrtitrering?" }
                ] },
                { navn: "Organisk kemi", felter: [
                    { ledetraad: "Carbonhydrider med kun enkeltbindinger",
                      svar: "Hvad er alkaner?" },
                    { ledetraad: "Den uforgrenede alkan med fire carbonatomer",
                      svar: "Hvad er butan?" },
                    { ledetraad: "Stoffer med samme molekylformel, men forskellig struktur",
                      svar: "Hvad er isomerer?" },
                    { ledetraad: "Grunden til, at pentan har højere kogepunkt end propan",
                      svar: "Hvad er stærkere van der Waals-bindinger (større molekyler)?" },
                    { ledetraad: "Navnet på CH₃CH(CH₃)CH₂CH₃",
                      svar: "Hvad er 2-methylbutan?" }
                ] }
            ]
        }],
        final: {
            kategori: "Det periodiske system",
            ledetraad: "Russeren, der i 1869 ordnede grundstofferne og efterlod huller til dem, der endnu ikke var fundet",
            svar: "Hvem er Mendelejev?"
        }
    };

    /* ----- Kemi B, afslutning: fra PowerPoint-skabelonen ----------------- */
    var QUIZ_B = {
        id: "kemi-b-afslutning",
        navn: "Kemi B, afslutning",
        enhed: "kr.",
        runder: [{
            vaerdier: [100, 200, 300, 400, 500],
            kategorier: [
                { navn: "Redoxkemi", felter: [
                    { ledetraad: "Oxidationstallet for C i CH₄",
                      svar: "Hvad er −IV? (eller bare −4)" },
                    { ledetraad: "Oxidationstallet for Mn i MnO₄⁻",
                      svar: "Hvad er VII? (eller bare 7)" },
                    { ledetraad: "Tre metaller, som står til højre for H i spændingsrækken",
                      svar: "Hvad er Cu, Ag og Au? (også Pt og Hg)" },
                    { ledetraad: "Oxidationstrinnet for C i en carboxylsyre, R-COOH",
                      svar: "Hvad er III?" },
                    { ledetraad: "Det systematiske navn på det stof, man får, når pentan-2-ol oxideres",
                      svar: "Hvad er pentan-2-on?" }
                ] },
                { navn: "Organisk kemi", felter: [
                    { ledetraad: "Carbonhydrider med tripelbindinger",
                      svar: "Hvad er alkyner?" },
                    { ledetraad: "Antallet af isomerer med molekylformlen C₄H₁₀",
                      svar: "Hvad er 2? (butan og methylpropan)" },
                    { ledetraad: "Testen, der påviser aldehyder med Ag⁺ og NH₃",
                      svar: "Hvad er Tollens' prøve?" },
                    { ledetraad: "Navnene på de to isomerer med molekylformlen C₃H₆",
                      svar: "Hvad er cyclopropan og propen?" },
                    { ledetraad: "Navnet på esteren af methanol og propansyre",
                      svar: "Hvad er methylpropanoat?" }
                ] },
                { navn: "Ligevægte", felter: [
                    { ledetraad: "Enheden for ligevægtskonstanten til reaktionen N₂ + 3 H₂ ⇌ 2 NH₃",
                      svar: "Hvad er M⁻²?" },
                    { ledetraad: "Symbolet for reaktionsbrøken",
                      svar: "Hvad er Y?" },
                    { ledetraad: "En reaktion, hvor ligevægtskonstanten vokser, når temperaturen øges",
                      svar: "Hvad er endoterm?" },
                    { ledetraad: "Navnet på ionen SCN⁻, som indgik i ligevægtsforsøget",
                      svar: "Hvad er thiocyanat?" },
                    { ledetraad: "Skrives χ og står for flydende stoffer i ligevægtsloven. Kan normalt udelades",
                      svar: "Hvad er en molbrøk?" }
                ] },
                { navn: "Syre-base", felter: [
                    { ledetraad: "Det, der kendetegner en svag syre",
                      svar: "Hvad er delvis reaktion med vand?" },
                    { ledetraad: "Det, som alle baser har",
                      svar: "Hvad er et ledigt elektronpar?" },
                    { ledetraad: "Danskeren, der definerede en syre ud fra, at den afgiver en hydron",
                      svar: "Hvem er Brønsted?" },
                    { ledetraad: "Ligevægtskonstanten for vands autohydronolyse",
                      svar: "Hvad er K<sub>v</sub> = [H₃O⁺]·[OH⁻]? (1,0·10⁻¹⁴ M²)" },
                    { ledetraad: "pK<sub>s</sub>-værdien for saltsyre",
                      svar: "Hvad er −7? (±3)" }
                ] },
                { navn: "Mængde&shy;beregning", felter: [
                    { ledetraad: "Navnet på formlen c<sub>før</sub> · V<sub>før</sub> = c<sub>efter</sub> · V<sub>efter</sub>",
                      svar: "Hvad er fortyndingsformlen?" },
                    { ledetraad: "Navnet på ε i Lambert-Beers lov",
                      svar: "Hvad er ekstinktionskoefficienten? (den molære absorptionskoefficient)" },
                    { ledetraad: "Grundstoffet med molarmassen 35,45 g/mol",
                      svar: "Hvad er chlor?" },
                    { ledetraad: "Massen af 2 mol O₂",
                      svar: "Hvad er 64 g?" },
                    { ledetraad: "Et mol med tre betydende cifre",
                      svar: "Hvad er 6,02·10²³?" }
                ] },
                { navn: "Reaktions&shy;typer", felter: [
                    { ledetraad: "Pb(NO₃)₂ + CuBr₂ → PbBr₂ + Cu(NO₃)₂",
                      svar: "Hvad er en fældningsreaktion?" },
                    { ledetraad: "CH₃Cl + Cl₂ → CH₂Cl₂ + HCl",
                      svar: "Hvad er en substitutionsreaktion?" },
                    { ledetraad: "CH₃CH₂OH + CH₃COOH → CH₃COOCH₂CH₃ + H₂O",
                      svar: "Hvad er en kondensationsreaktion?" },
                    { ledetraad: "HCO₃⁻ + PO₄³⁻ → CO₃²⁻ + HPO₄²⁻",
                      svar: "Hvad er en syre-basereaktion?" },
                    { ledetraad: "CH₃CH₂OH → CH₂=CH₂ + H₂O",
                      svar: "Hvad er en elimination?" }
                ] }
            ]
        }],
        final: {
            kategori: "Ligevægte",
            ledetraad: "Franskmanden bag princippet om, at en ligevægt forskydes, så den modvirker en ydre påvirkning",
            svar: "Hvem er Le Chatelier?"
        }
    };

    /* Niveauet i linket: index.html#b giver B, alt andet giver C */
    D.QUIZZER = { c: QUIZ_C, b: QUIZ_B };
    D.STANDARD_NIVEAU = "c";

    /* Standard, naar der ikke er et gemt spil */
    D.HOLD = ["Hold 1", "Hold 2", "Hold 3", "Hold 4"];
    D.MAKS_HOLD = 6;
    D.UR = [5, 10, 20, 30];
    D.UR_STANDARD = 10;
    D.TAENKETID = 30;

    /* ----- Kemichaels praesentation ---------------------------------------- */
    /* Første gang spillet åbnes i en browser. Højst ca. 60 tegn pr. replik og
       ingen teori. Den linje, der står i INTRO_PEG, siger han, mens han peger
       på opsætningen. */
    D.INTRO = {
        titel: [
            "Velkommen til Kemi-Jeopardy. Jeg er jeres vært.",
            "Skriv holdenes navne her, og tryk Start.",
            "Beløbene er i kroner. De bliver ikke udbetalt."
        ]
    };
    D.INTRO_PEG = 1;
}());

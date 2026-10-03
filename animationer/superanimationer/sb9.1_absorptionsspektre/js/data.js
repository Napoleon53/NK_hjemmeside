/* =====================================================================
   data.js - stofferne, opgaverne og quizzen

   Farverne staar ikke her: de regnes af spektrene i js/farve.js.
   Selvtesten tjekker, at det, modellen regner, er det svar, opgaven
   venter (felt farve), og at forklaringerne passer til tallene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var D = {};

    /* De seks farver, eleven kan vaelge imellem (fane 1 og 3), med den
       farve, knappen har */
    D.FARVER = [
        { navn: "Rød", css: "#e2402f" },
        { navn: "Orange", css: "#f08a24" },
        { navn: "Gul", css: "#f4d935" },
        { navn: "Grøn", css: "#45b35a" },
        { navn: "Blå", css: "#2f8fe0" },
        { navn: "Lilla", css: "#9b45c9" }
    ];

    /* Farvecirklen (fane 1): navnene staar paa deres farvetone (HSV) */
    D.CIRKEL = [
        { navn: "Rød", tone: 0 },
        { navn: "Orange", tone: 30 },
        { navn: "Gul", tone: 60 },
        { navn: "Grøn", tone: 120 },
        { navn: "Blå", tone: 210 },
        { navn: "Lilla", tone: 290 }
    ];

    /* =================================================================
       FANE 1: FARVEN
       ================================================================= */
    D.FA_GRUPPER = [
        { id: "byg", titel: "Byg farven" },
        { id: "stof", titel: "Stofferne" }
    ];

    /* Byg farven: én top, som eleven traekker. maal er den farve, der skal
       komme ud, start er toppens plads fra begyndelsen, svar er en plads,
       der giver farven, og lys er det lys, der skal absorberes. */
    D.FA_TOP = { w: 30, h: 1.5 };

    D.FA = [
        { id: "b-gul", gruppe: "byg", type: "byg", navn: "Gør den gul", maal: "Gul", start: 640, svar: 445, lys: "blåt og violet lys" },
        { id: "b-blaa", gruppe: "byg", type: "byg", navn: "Gør den blå", maal: "Blå", start: 450, svar: 610, lys: "orange og rødt lys" },
        { id: "b-lilla", gruppe: "byg", type: "byg", navn: "Gør den lilla", maal: "Lilla", start: 610, svar: 545, lys: "grønt lys" },
        { id: "b-roed", gruppe: "byg", type: "byg", navn: "Gør den rød", maal: "Rød", start: 560, svar: 500, lys: "blågrønt lys" },

        /* De fem stoffer fra den gamle b9.1. toppe er spektret, top er de
           steder, et klik godtages som "toppen" (fra-til i nm), lmax er den
           bølgelængde, der staar paa grafen bagefter, og farve er det svar,
           modellen regner af det samme spektrum, som grafen viser. */
        {
            id: "klorofyl", gruppe: "stof", type: "stof", navn: "Klorofyl a", formel: "C₅₅H₇₂MgN₄O₅",
            beskrivelse: "Farvestoffet i blade og alger. Det fanger lyset til fotosyntesen.",
            toppe: [{ c: 433, w: 18, h: 1.4 }, { c: 410, w: 14, h: 0.35 }, { c: 662, w: 12, h: 1.1 }, { c: 615, w: 14, h: 0.22 }, { c: 578, w: 12, h: 0.1 }],
            top: [[415, 445], [650, 675]], lmax: 430, farve: "Grøn",
            absorberer: "violet og blåt lys ved 430 nm og rødt lys ved 662 nm",
            forklaring: "Klorofyl a absorberer violet og blåt lys (430 nm) og rødt lys (662 nm). Det grønne lys imellem slipper igennem, og det er det, vi ser.",
            nej: {
                "Blå": "Blåt lys bliver absorberet ved 430 nm. Vi ser det lys, der slipper igennem.",
                "Rød": "Rødt lys bliver absorberet ved 662 nm. Vi ser det lys, der slipper igennem."
            }
        },
        {
            id: "betacaroten", gruppe: "stof", type: "stof", navn: "β-caroten", formel: "C₄₀H₅₆",
            beskrivelse: "Farvestoffet i gulerødder, græskar og søde kartofler, her opløst i hexan.",
            toppe: [{ c: 425, w: 13, h: 0.95 }, { c: 451, w: 14, h: 1.3 }, { c: 478, w: 13, h: 1.12 }],
            top: [[418, 486]], lmax: 451, farve: "Gul",
            absorberer: "violet og blåt lys fra 420 til 500 nm",
            forklaring: "β-caroten absorberer violet og blåt lys fra 420 til 500 nm. Grønt, gult og rødt lys slipper igennem og blander sig til gul.",
            nej: {
                "Orange": "Næsten. Toppen er bred, men den slutter ved 500 nm, så grønt lys slipper også igennem. Opløsningen er gul. I gulerødder sidder β-caroten som små krystaller, og de ser orange ud.",
                "Blå": "Blåt lys bliver absorberet. Vi ser det lys, der slipper igennem."
            }
        },
        {
            id: "kmno4", gruppe: "stof", type: "stof", navn: "Kaliumpermanganat", formel: "KMnO₄",
            beskrivelse: "Et salt, der giver en kraftigt farvet opløsning. Det er et stærkt oxidationsmiddel.",
            toppe: [{ c: 507, w: 11, h: 0.55 }, { c: 525, w: 12, h: 1.05 }, { c: 545, w: 12, h: 0.85 }, { c: 565, w: 11, h: 0.42 }, { c: 527, w: 35, h: 0.25 }],
            top: [[515, 555]], lmax: 528, farve: "Lilla",
            absorberer: "grønt lys fra 500 til 570 nm",
            forklaring: "Permanganat absorberer grønt lys omkring 528 nm. Rødt og blåt lys slipper igennem og blander sig til lilla. Lilla står over for grøn i farvecirklen.",
            nej: {
                "Grøn": "Grønt lys bliver absorberet. Vi ser det lys, der slipper igennem.",
                "Rød": "Rødt lys slipper igennem, men det gør blåt og violet lys også. Tilsammen giver de lilla."
            }
        },
        {
            id: "cuso4", gruppe: "stof", type: "stof", navn: "Kobber(II)sulfat", formel: "CuSO₄(aq)",
            beskrivelse: "Kobber(II)ioner i vand. Toppen ligger i infrarødt, over 700 nm, men kurven stiger gennem det røde område.",
            toppe: [{ c: 800, w: 120, h: 1.8 }],
            top: [[655, 700]], lmax: 700, farve: "Blå",
            absorberer: "orange og rødt lys over 600 nm",
            forklaring: "Kobber(II)ionerne absorberer orange og rødt lys, og absorbansen stiger mod 700 nm. Blåt og grønt lys slipper igennem, så opløsningen er blå.",
            nej: {
                "Rød": "Rødt lys bliver absorberet. Vi ser det lys, der slipper igennem.",
                "Grøn": "Grønt lys slipper igennem, men det gør blåt lys også, og rødt bliver absorberet. Over for rød i farvecirklen står blågrøn til blå."
            }
        },
        {
            id: "cytc", gruppe: "stof", type: "stof", navn: "Cytochrom c (reduceret)", formel: "Cyt c (Fe²⁺)",
            beskrivelse: "Et protein fra mitokondrierne. Jernet sidder i en ring, der giver spektret tre toppe.",
            toppe: [{ c: 415, w: 15, h: 1.7 }, { c: 520, w: 12, h: 0.4 }, { c: 550, w: 8, h: 0.8 }],
            top: [[405, 425]], lmax: 415, farve: "Rød",
            absorberer: "violet lys ved 415 nm og lidt grønt lys ved 520 og 550 nm",
            forklaring: "Cytochrom c absorberer violet lys (415 nm) kraftigt og lidt grønt lys (520 og 550 nm). Det røde lys slipper igennem, så opløsningen er rød. De to smalle toppe hører til jernets ring.",
            andreToppe: [[510, 560]],
            nej: {
                "Gul": "Violet lys bliver absorberet, og det giver gult, men toppene ved 520 og 550 nm tager også noget af det grønne lys. Tilbage er mest rødt.",
                "Lilla": "Violet lys bliver absorberet ved 415 nm. Vi ser det lys, der slipper igennem."
            }
        }
    ];

    /* =================================================================
       FANE 2: KONJUGERINGEN
       ================================================================= */
    D.KO_GRUPPER = [
        { id: "kaede", titel: "Kæden" },
        { id: "tomat", titel: "Tomaten" }
    ];

    D.KO_MAKS = 14;       /* den laengste kaede, der kan bygges */

    D.KO = [
        {
            id: "k-gaet", gruppe: "kaede", type: "gaet", navn: "Gæt først", n: 2,
            tekst: "Buta-1,3-dien absorberer ved 217 nm. Hvor absorberer stoffet med én konjugeret dobbeltbinding mere?",
            svar: ["Ved en kortere bølgelængde", "Ved den samme bølgelængde", "Ved en længere bølgelængde"],
            rigtig: 2
        },
        { id: "k-farve", gruppe: "kaede", type: "byg", navn: "Giv den farve", n: 3, maal: "farvet",
            tekst: "Gør kæden længere, til stoffet får farve." },
        { id: "k-orange", gruppe: "kaede", type: "byg", navn: "Gør den orange", n: 8, maal: "Orange",
            tekst: "Gør stoffet orange." },
        { id: "k-roed", gruppe: "kaede", type: "byg", navn: "Gør den rød", n: 11, maal: "Rød",
            tekst: "Gør stoffet rødt." },

        { id: "t-find", gruppe: "tomat", type: "find", navn: "Find chromoforen",
            tekst: "Klik på de konjugerede dobbeltbindinger i lycopen." },
        { id: "t-gul", gruppe: "tomat", type: "brom", navn: "Gør den gul", maal: "Gul",
            tekst: "Klik på en dobbeltbinding for at addere brom til den. Gør opløsningen gul." },
        { id: "t-farveloes", gruppe: "tomat", type: "brom", navn: "Gør den farveløs", maal: "Farveløs",
            tekst: "Gør opløsningen farveløs med ét brommolekyle." },
        {
            id: "t-regnbue", gruppe: "tomat", type: "regnbue", navn: "Tomatregnbuen",
            tekst: "Bromvand hældes oven i tomatsaften og trænger langsomt ned. Hvilke farver kommer der, set oppefra?",
            svar: ["Farveløs øverst, så gul, og orange nederst", "Orange øverst, så gul, og farveløs nederst", "Hele glasset bliver gult"],
            rigtig: 0
        }
    ];

    /* Tomatsaft har ca. 100 mg lycopen pr. liter (0,19 mmol/L). Med
       epsilon ca. 1,85 · 10^5 L/(mol · cm) bliver absorbansen i toppen ca. 34
       pr. cm, ca. 20 gange saa meget som lycopen i hexan paa grafen (1,65).
       Regnbuens farver regnes derfor med absorbansen ganget med 20, og
       grafen viser saften fortyndet 20 gange. */
    D.TOMAT_FAKTOR = 20;

    /* Navnene paa de korte kaeder (de lange faar kun formlen) */
    D.POLYEN_NAVN = ["", "ethen", "buta-1,3-dien", "hexa-1,3,5-trien", "octa-1,3,5,7-tetraen", "deca-1,3,5,7,9-pentaen"];

    /* =================================================================
       FANE 3: CHROMOFOREN
       mol: molekylet i js/molekyle.js, toppe: spektret (tabelvaerdier),
       farve: svaret (regnes af toppe; selvtesten tjekker det).
       ================================================================= */
    D.CH_GRUPPER = [
        { id: "let", titel: "Let" },
        { id: "middel", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];

    D.CH = [
        {
            id: "hexatrien", gruppe: "let", navn: "Hexa-1,3,5-trien", mol: "polyen", n: 3,
            lmax: 258, farve: "Farveløs", polyen: 3,
            fakta: "Tre konjugerede dobbeltbindinger. Toppen ligger ved 258 nm i UV, så stoffet er farveløst."
        },
        {
            id: "pentadien", gruppe: "let", navn: "Penta-1,4-dien", mol: "pentadien",
            lmax: 178, farve: "Farveløs", polyen: 1,
            fakta: "C-atomet i midten har kun enkeltbindinger, så de to dobbeltbindinger er ikke konjugerede. Hver af dem absorberer for sig, ved 178 nm, langt inde i UV."
        },
        {
            id: "benzen", gruppe: "let", navn: "Benzen", mol: "benzen",
            toppe: [{ c: 204, w: 7, h: 1.0 }, { c: 254, w: 8, h: 0.14 }],
            lmax: 254, farve: "Farveløs",
            fakta: "Benzenringen er et konjugeret system med tre dobbeltbindinger. Den absorberer ved 204 og 254 nm i UV og er farveløs."
        },
        {
            id: "stilben", gruppe: "middel", navn: "Stilben", mol: "stilben",
            toppe: [{ c: 295, w: 16, h: 1.25 }, { c: 229, w: 10, h: 0.55 }],
            lmax: 295, farve: "Farveløs",
            fakta: "To benzenringe og en C=C giver syv konjugerede dobbeltbindinger. Toppen ligger ved 295 nm i UV. Stoffer, der ligner stilben, bruges som optisk hvidt i vaskepulver: de absorberer UV og lyser blåt."
        },
        {
            id: "smoergult", gruppe: "middel", navn: "Smørgult", mol: "smoergult",
            toppe: [{ c: 408, w: 40, h: 1.3 }, { c: 250, w: 14, h: 0.4 }],
            lmax: 408, farve: "Gul",
            fakta: "Som stilben, men med azogruppen N=N i midten og N(CH₃)₂ i enden. De flytter toppen til 408 nm, og stoffet er gult. Det blev brugt til at farve smør, til man fandt ud af, at det giver kræft.",
            nej: { "Farveløs": "Stilben med syv konjugerede dobbeltbindinger er farveløst, men her er den midterste N=N. Azogruppen N=N og N(CH₃)₂-gruppen flytter toppen til 408 nm." }
        },
        {
            id: "betacaroten", gruppe: "middel", navn: "β-caroten", mol: "betacaroten",
            toppe: [{ c: 425, w: 13, h: 0.95 }, { c: 451, w: 14, h: 1.3 }, { c: 478, w: 13, h: 1.12 }, { c: 275, w: 12, h: 0.15 }],
            lmax: 451, farve: "Gul",
            fakta: "Elleve konjugerede dobbeltbindinger, de to i ringene. Toppen ligger ved 451 nm, og opløsningen er gul. Ringene er drejet lidt ud af planet, så toppen ligger kortere end lycopens 470 nm.",
            nej: { "Orange": "Næsten. Opløsningen absorberer op til 500 nm, så grønt lys slipper igennem, og den er gul. I gulerødder sidder β-caroten som krystaller, og de ser orange ud." }
        },
        {
            id: "indigo", gruppe: "svaer", navn: "Indigo", mol: "indigo",
            toppe: [{ c: 606, w: 40, h: 1.3 }, { c: 286, w: 14, h: 0.6 }],
            lmax: 606, farve: "Blå",
            fakta: "To benzenringe, to C=O og C=C i midten: ni konjugerede dobbeltbindinger. Toppen ligger ved 606 nm, hvor orange lys bliver absorberet. Indigo farver cowboybukser blå."
        },
        {
            id: "allura", gruppe: "svaer", navn: "Allura rød (E129)", mol: "allura",
            toppe: [{ c: 509, w: 36, h: 1.3 }, { c: 445, w: 30, h: 0.4 }, { c: 320, w: 16, h: 0.45 }],
            lmax: 504, farve: "Rød",
            fakta: "Naphthalen, azogruppen N=N og en benzenring: ni konjugerede dobbeltbindinger. Toppen ligger ved 504 nm, hvor blågrønt lys bliver absorberet. Allura rød er et azofarvestof i slik og sodavand. SO₃⁻-grupperne gør det opløseligt i vand."
        }
    ];

    /* =================================================================
       Ros og afslutning
       ================================================================= */
    D.ROS = ["Flot.", "Godt set.", "Sådan.", "Præcis."];

    D.FAERDIG = {
        fa: "Du har løst alle opgaverne om farven.",
        ko: "Du har løst alle opgaverne om konjugeringen.",
        ch: "Du har fundet alle chromoforerne."
    };

    /* =================================================================
       Quizzen: svar 0 er det rigtige. nej[i] er forklaringen til det
       forkerte svar i, og det er de fejl, elever faktisk laver.
       ================================================================= */
    D.QUIZ = [
        {
            q: "Hvorfor ser en opløsning af klorofyl grøn ud?",
            svar: ["Den absorberer blåt og rødt lys, og det grønne lys slipper igennem.", "Den absorberer grønt lys.", "Magnesiumionen udsender grønt lys.", "Grønt lys har den højeste energi."],
            nej: ["", "Det lys, der bliver absorberet, når ikke øjet. Vi ser resten.", "Klorofyl udsender ikke lys. Det fjerner noget af det hvide lys.", "Violet lys har den højeste energi. Farven afgøres af, hvad der bliver absorberet."],
            hvorfor: "Klorofyl har toppe ved 430 og 662 nm. Det lys, der slipper igennem, ligger mellem dem, i det grønne område."
        },
        {
            q: "En opløsning absorberer grønt lys ved 530 nm og intet andet. Hvilken farve har den?",
            svar: ["Lilla", "Grøn", "Gul", "Blå"],
            nej: ["", "Grønt lys bliver absorberet. Vi ser det lys, der slipper igennem.", "Gul står over for violet og blåt i farvecirklen, ikke over for grøn.", "Blåt lys slipper igennem, men det gør rødt lys også."],
            hvorfor: "Rødt og blåt lys slipper igennem og blander sig til lilla. Lilla er komplementærfarven til grøn: den står over for grøn i farvecirklen."
        },
        {
            q: "Ved hvilken bølgelængde skal et spektrofotometer måle på en opløsning af kaliumpermanganat?",
            svar: ["Ved toppen, ca. 528 nm", "Ved 700 nm, hvor der næsten intet absorberes", "Ved 420 nm, fordi opløsningen er lilla", "Det er lige meget"],
            nej: ["", "Der absorberer stoffet næsten intet, så måleren kan ikke se forskel på opløsningerne.", "Lilla er farven af det lys, der slipper igennem. Stoffet absorberer grønt lys.", "Absorbansen er størst ved toppen, så der giver målingen det tydeligste udslag."],
            hvorfor: "Man måler ved λmax, hvor stoffet absorberer mest. Der er udslaget størst."
        },
        {
            q: "Hvad sker der med λmax, når et molekyle får flere konjugerede dobbeltbindinger?",
            svar: ["λmax bliver længere.", "λmax bliver kortere.", "λmax er den samme, men toppen bliver højere.", "Toppen forsvinder."],
            nej: ["", "Det er omvendt. Jo længere chromoforen er, jo mindre energi skal der til, og jo længere bølgelængde.", "Toppen bliver også højere, men den flytter sig mod længere bølgelængde.", "Toppen flytter sig. Den forsvinder ikke."],
            hvorfor: "Elektronerne i et langt konjugeret system kan exciteres med mindre energi. Mindre energi svarer til længere bølgelængde. Ved omkring 8 konjugerede dobbeltbindinger når toppen ind i det synlige lys."
        },
        {
            q: "Brom adderes til dobbeltbindingen midt i lycopen. Hvad sker der med farven?",
            svar: ["Den forsvinder, fordi chromoforen deles i to korte stykker.", "Den bliver brun af bromen.", "Den bliver mere rød, fordi molekylet bliver større.", "Intet, for der er stadig 12 dobbeltbindinger."],
            nej: ["", "Bromen bliver bundet. Det er chromoforen, der ændrer sig.", "Farven kommer fra chromoforen, ikke fra molekylets størrelse.", "Kun de konjugerede tæller. To stykker med fem hver er for korte til at absorbere synligt lys."],
            hvorfor: "Efter additionen er der to systemer med fem konjugerede dobbeltbindinger. Hvert af dem absorberer ved ca. 334 nm i UV, så opløsningen bliver farveløs."
        },
        {
            q: "Hvad er en chromofor gruppe?",
            svar: ["Den del af molekylet, der absorberer lyset, fx et system af konjugerede dobbeltbindinger.", "En gruppe, der gør stoffet opløseligt i vand.", "Et metalatom, der udsender lys.", "Den del af molekylet, der kaster farven tilbage."],
            nej: ["", "Det gør SO₃⁻ og OH. De ændrer ikke, hvilket lys der bliver absorberet.", "Et farvet stof udsender ikke lys. Det absorberer noget af lyset.", "Farven, vi ser, er det lys, der ikke bliver absorberet. Chromoforen er det, der absorberer."],
            hvorfor: "Chromoforen er den del af molekylet, der absorberer lyset. I organiske farvestoffer er det et system af konjugerede dobbeltbindinger, ofte med C=O, N=N eller benzenringe."
        }
    ];

    NK.Data = D;
}());

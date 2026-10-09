/* =====================================================================
   data.js - maalene og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. Et maal kan have op til
   fem dele, der kommer efter hinanden:

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring).
              intro er en kort indledning, tekst er selve spoergsmaalet
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket.
              set er det, eleven lige har set; har forsoeget et set (eller et
              gaet foer sig), staar det alene paa det groenne kort, foer
              spoergsmaalet kommer
     felter   tavlen paa fane 3, hvor eleven vaelger to ord til hver flaske
     spm      et spoergsmaal bagefter; de forkerte svar (f) er de fejl,
              elever laver, og forklaringen peger tilbage paa scenen
     spm2     et spoergsmaal til. godt (i spm) er forklaringen til det
              rigtige svar; den staar alene, til eleven selv gaar videre

   Hvert led har sin egen hinttrappe paa tre trin.

   Alle dele staar paa kortet oeverst midt i scenen (js/fane.js). Kortet
   har kun lidt plads, naar lupperne skal kunne ses under det: et
   spoergsmaal er hoejst 118 tegn og et svar hoejst 46 (selvtesten taeller
   og maaler kortets hoejde).

   Intet er indforstaaet (brugerens oenske 9. okt. 2026): hver tekst
   naevner selv det glas, den syre og den lup, den handler om, og bruger
   ikke "her", "den" eller "nu" om noget, der stod i en tidligere tekst.
   om er de glas, delen handler om; de faar en gul ring i scenen.

   I luppen er et helt molekyle graat med hydronen paa som en lille
   orange kugle, syrens ion er blaa med et minus, og H₃O⁺ er en roed
   kugle med plus. Teksterne bruger de samme ord.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var D = {};

    /* ----- Fane 1: To glas ------------------------------------------------------
       opstil: det, der staar klar, naar maalet begynder. lup: [saltsyre, eddikesyre]
       om: de glas, delen handler om (0 = saltsyre, 1 = eddikesyre). De faar en
       gul ring, og deres lup en gul ramme. */
    D.G_MAAL = [
        {
            id: "kalk", navn: "Kalk i syre",
            opstil: { kalk: false, lup: [false, false] },
            gaet: {
                intro: "På bordet står to glas: et med saltsyre og et med eddikesyre. Begge syrer har koncentrationen 0,10 M. Om lidt kommer du et stykke kalk i hvert glas.",
                tekst: "I hvilket glas bruser kalken mest?",
                svar: [
                    { t: "I glasset med saltsyre", ok: true },
                    { t: "I glasset med eddikesyre" },
                    { t: "Lige meget i de to glas" }
                ]
            },
            forsoeg: {
                tekst: "Træk et stykke kalk fra skålen ned i glasset med saltsyre og et stykke ned i glasset med eddikesyre. Se, hvor meget kalken bruser.",
                hint: [
                    "Skålen med kalk står midt på bordet mellem de to glas.",
                    "Tag fat i skålen med musen, træk hen over et glas, og slip. Et klik på et glas virker også.",
                    "Kom et stykke kalk i begge glas, og vent et øjeblik."
                ]
            },
            loest: "Kalken bruser kraftigt i saltsyren. I eddikesyren kommer der kun en boble nu og da, selv om de to syrer har samme koncentration."
        },
        {
            id: "lup-hcl", navn: "Saltsyren i luppen",
            opstil: { kalk: true, lup: [false, false] },
            forsoeg: {
                tekst: "Klik på glasset med saltsyre. Så åbner en lup over glasset. Luppen viser et lille rum i saltsyren, forstørret flere millioner gange.",
                hint: [
                    "Glasset med saltsyre står til venstre på bordet.",
                    "Klik på selve glasset med saltsyre.",
                    "Klik på det venstre glas. Så åbner luppen over glasset med saltsyre."
                ]
            },
            spm: {
                om: [0],
                tekst: "Luppen over saltsyren: 100 HCl-molekyler blev hældt i vandet. Hvor mange af dem er stadig hele molekyler?",
                svar: [
                    { t: "Alle 100 er hele",
                      f: "Et helt HCl-molekyle er gråt med en lille orange hydron på. Se mærkerne over luppen, og led efter grå molekyler i luppen over saltsyren." },
                    { t: "Omkring halvdelen er hele",
                      f: "Et helt HCl-molekyle er gråt med en lille orange hydron på. Led efter grå molekyler i luppen over saltsyren." },
                    { t: "Ingen er hele", ok: true }
                ],
                hint: [
                    "Mærkerne over luppen viser de tre slags partikler. Klik på et mærke for at læse, hvad det er.",
                    "Et helt HCl-molekyle er gråt med en lille orange hydron på. Har molekylet afgivet hydronen, er det en blå kugle med minus, Cl⁻, og hydronen sidder på et vandmolekyle: den røde kugle med plus, H₃O⁺.",
                    "Der er ingen grå molekyler i luppen over saltsyren. Alle 100 HCl-molekyler har afgivet deres hydron."
                ]
            },
            loest: "Alle 100 HCl-molekyler har afgivet en hydron til et vandmolekyle. Derfor er der 100 oxoniumioner, H₃O⁺, og 100 chloridioner, Cl⁻, i luppen over saltsyren."
        },
        {
            id: "lup-eddike", navn: "Eddikesyren i luppen",
            opstil: { kalk: true, lup: [true, false] },
            forsoeg: {
                tekst: "Klik på glasset med eddikesyre. Så åbner en lup over det glas. Den viser et lige så lille rum som luppen over saltsyren.",
                hint: [
                    "Glasset med eddikesyre står til højre på bordet.",
                    "Klik på selve glasset med eddikesyre.",
                    "Klik på det højre glas. Så åbner luppen over glasset med eddikesyre."
                ]
            },
            spm: {
                om: [1],
                tekst: "Luppen over eddikesyren: 100 eddikesyremolekyler blev hældt i vandet. Hvor mange af dem har afgivet en hydron?",
                svar: [
                    { t: "Omkring 1 molekyle", ok: true },
                    { t: "Omkring halvdelen",
                      f: "Tæl de røde oxoniumioner i luppen over eddikesyren. Der er én oxoniumion for hvert molekyle, der har afgivet en hydron." },
                    { t: "Alle 100 molekyler",
                      f: "Så ville alle molekylerne være blå som i luppen over saltsyren. Hvilken farve har de fleste molekyler i luppen over eddikesyren?" }
                ],
                hint: [
                    "Hvert eddikesyremolekyle, der har afgivet en hydron, har givet én oxoniumion, H₃O⁺. Oxoniumionen er en rød kugle med plus.",
                    "Led efter den røde kugle blandt de grå molekyler i luppen over eddikesyren. Den røde kugle har en gul ring nu.",
                    "I luppen over eddikesyren er der 1 rød oxoniumion og 1 blå acetation, CH₃COO⁻. De andre 99 eddikesyremolekyler er hele."
                ]
            },
            loest: "Kun omkring 1 ud af 100 eddikesyremolekyler har afgivet en hydron. De andre 99 er hele eddikesyremolekyler."
        },
        {
            id: "balance", navn: "Hydroner frem og tilbage",
            opstil: { kalk: true, lup: [true, true] },
            forsoeg: {
                om: [1],
                tekst: "Se på luppen over eddikesyren. Hold øje med den røde oxoniumion, og vent, til en blå ion, CH₃COO⁻, tager en hydron tilbage.",
                set: "I luppen over eddikesyren afgav et helt molekyle en hydron, og en blå ion tog en hydron tilbage.",
                hint: [
                    "Se på luppen over eddikesyren. Der kommer et lille skilt i luppen, hver gang en hydron flytter.",
                    "Først afgiver et helt eddikesyremolekyle en hydron. Lidt efter tager en blå ion, CH₃COO⁻, en hydron tilbage fra en rød oxoniumion.",
                    "Vent nogle sekunder, og se på luppen over eddikesyren. Hydronerne flytter hele tiden frem og tilbage."
                ]
            },
            spm: {
                om: [1],
                tekst: "I eddikesyren flytter hydronerne hele tiden. Hvorfor er der alligevel altid omkring 1 oxoniumion i luppen?",
                svar: [
                    { t: "Reaktionen er gået i stå",
                      f: "Se i luppen over eddikesyren: der kommer hele tiden skilte, så reaktionen er ikke gået i stå." },
                    { t: "Reaktionen går begge veje lige ofte", ok: true },
                    { t: "Der er ikke vand nok til flere",
                      f: "Der er rigeligt vand: omkring 55.000 vandmolekyler i det rum, luppen viser. Vandmolekylerne er bare ikke tegnet." }
                ],
                hint: [
                    "Se på luppen over eddikesyren: hver gang et molekyle afgiver en hydron, tager en blå ion lidt efter en hydron tilbage.",
                    "En blå ion, CH₃COO⁻, kan tage en hydron tilbage fra en oxoniumion. Så bliver ionen til et helt eddikesyremolekyle igen.",
                    "De to reaktioner sker lige ofte. Derfor bliver antallet af oxoniumioner ved med at være omkring 1."
                ]
            },
            loest: "I eddikesyre går reaktionen begge veje på samme tid. Derfor skrives den med dobbeltpil: CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺."
        },
        {
            id: "hvorfor", navn: "Stærk og svag",
            opstil: { kalk: true, lup: [true, true] },
            spm: {
                tekst: "Saltsyren og eddikesyren har samme koncentration, 0,10 M. Hvorfor bruser kalken mest i saltsyren?",
                svar: [
                    { t: "Der er hældt mest syre i saltsyren",
                      f: "De to glas har samme koncentration, 0,10 M. Der blev hældt 100 syremolekyler i hver lup." },
                    { t: "Saltsyrens molekyler er hele",
                      f: "Se i luppen over saltsyren: der er ingen hele HCl-molekyler. Alle har afgivet deres hydron." },
                    { t: "Der er flest oxoniumioner i saltsyren", ok: true }
                ],
                hint: [
                    "Sammenlign luppen over saltsyren med luppen over eddikesyren. Hvilken partikel er der kun mange af i saltsyren?",
                    "Kalken reagerer med oxoniumionerne, H₃O⁺. De er røde kugler med plus.",
                    "I luppen over saltsyren er der 100 oxoniumioner. I luppen over eddikesyren er der omkring 1."
                ]
            },
            loest: "Det er oxoniumionerne, H₃O⁺, der får kalken til at bruse. Saltsyre er en stærk syre: alle molekyler har afgivet en hydron. Eddikesyre er en svag syre: kun omkring 1 ud af 100 molekyler har afgivet en hydron."
        }
    ];

    /* ----- Fane 2: Stærk eller svag? ----------------------------------------------
       De fem glas paa bordet. Navnet kommer foerst paa, naar eleven har afgjort
       styrken (A, B og C), eller naar maalet begynder (D og E). om er glassenes
       numre fra venstre (0 = A). navngiv: glas, som spoergsmaalet selv naevner
       ved navn; de faar navnet paa sedlen, ogsaa hvis eleven har sprunget deres
       maal over. */
    D.GLAS = [
        { b: "A", syre: "HNO3" },
        { b: "B", syre: "eddike" },
        { b: "C", syre: "citron" },
        { b: "D", syre: "HCl" },
        { b: "E", syre: "myre" }
    ];

    var STYRKE_HINT = [
        "Et helt syremolekyle er gråt med en lille orange hydron på. Et syremolekyle, der har afgivet sin hydron, er blåt med et minus.",
        "I en stærk syre har alle molekyler afgivet en hydron. I en svag syre har kun få molekyler afgivet en hydron."
    ];

    function pilHint(b, staerk) {
        return [
            "En enkeltpil betyder, at reaktionen går helt til ende: alle syremolekyler afgiver en hydron.",
            "En dobbeltpil betyder, at reaktionen går begge veje: der er altid hele syremolekyler tilbage.",
            staerk ? "I glas " + b + " har alle molekyler afgivet en hydron. Reaktionen er gået helt til ende."
                   : "I glas " + b + " er de fleste molekyler stadig hele. Reaktionen går begge veje."
        ];
    }

    function klikHint(b, sted) {
        return ["Glas " + b + " står " + sted + " på bordet.", "Klik på selve glas " + b + ".", "Klik på glas " + b + ". Så viser luppen over glassene, hvad der er i glas " + b + "."];
    }

    D.S_MAAL = [
        {
            id: "a", navn: "Glas A", glas: 0,
            forsoeg: {
                tekst: "På bordet står fem glas, A til E. Hvert glas har 0,10 M af en syre og et stykke kalk. Etiketterne mangler. Klik på glas A.",
                hint: klikHint("A", "længst til venstre")
            },
            spm: {
                om: [0],
                tekst: "Luppen viser glas A. 100 syremolekyler blev hældt i vandet. Er syren i glas A en stærk eller en svag syre?",
                svar: [
                    { t: "En stærk syre", ok: true },
                    { t: "En svag syre", f: "I en svag syre er de fleste molekyler hele. Et helt molekyle er gråt med en lille orange hydron på. Er der grå molekyler i luppen for glas A?" }
                ],
                godt: "Alle 100 molekyler i glas A har afgivet en hydron. Syren i glas A er salpetersyre, HNO₃.",
                hint: STYRKE_HINT.concat(["I luppen for glas A er der ingen grå molekyler. Alle syremolekyler har afgivet en hydron."])
            },
            spm2: {
                om: [0],
                tekst: "Glas A, salpetersyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", ok: true },
                    { t: "⇌  dobbeltpil", f: "En dobbeltpil bruges, når reaktionen også går baglæns, så der er hele molekyler tilbage. Er der hele molekyler i luppen for glas A?" }
                ],
                hint: pilHint("A", true)
            },
            loest: "HNO₃ + H₂O → NO₃⁻ + H₃O⁺. Salpetersyre er en stærk syre og skrives med enkeltpil, fordi reaktionen går helt til ende."
        },
        {
            id: "b", navn: "Glas B", glas: 1,
            forsoeg: {
                tekst: "Klik på glas B. Så viser luppen, hvad der er i glas B.",
                hint: klikHint("B", "som nummer to fra venstre")
            },
            spm: {
                om: [1],
                tekst: "Luppen viser glas B. 100 syremolekyler blev hældt i vandet. Er syren i glas B en stærk eller en svag syre?",
                svar: [
                    { t: "En stærk syre", f: "I en stærk syre har alle molekyler afgivet en hydron. I luppen for glas B er næsten alle molekyler grå og hele." },
                    { t: "En svag syre", ok: true }
                ],
                godt: "Kun omkring 1 ud af 100 molekyler i glas B har afgivet en hydron. Syren i glas B er eddikesyre, CH₃COOH.",
                hint: STYRKE_HINT.concat(["I luppen for glas B er næsten alle molekyler grå. Kun omkring 1 molekyle har afgivet en hydron."])
            },
            spm2: {
                om: [1],
                tekst: "Glas B, eddikesyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", f: "En enkeltpil betyder, at reaktionen går helt til ende. Så ville der ikke være hele molekyler i luppen for glas B." },
                    { t: "⇌  dobbeltpil", ok: true }
                ],
                hint: pilHint("B", false)
            },
            loest: "CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺. Eddikesyre er en svag syre og skrives med dobbeltpil, fordi reaktionen går begge veje."
        },
        {
            id: "c", navn: "Glas C", glas: 2,
            forsoeg: {
                tekst: "Klik på glas C. Så viser luppen, hvad der er i glas C.",
                hint: klikHint("C", "i midten")
            },
            spm: {
                om: [2],
                tekst: "Luppen viser glas C. Tæl de røde oxoniumioner blandt de 100 syremolekyler. Er syren i glas C stærk eller svag?",
                svar: [
                    { t: "En stærk syre", f: "I en stærk syre har alle 100 molekyler afgivet en hydron. Tæl de røde oxoniumioner i luppen for glas C." },
                    { t: "En svag syre", ok: true },
                    { t: "Midt imellem", f: "En syre kaldes kun stærk, når alle molekyler har afgivet en hydron. Ellers er syren svag." }
                ],
                godt: "Omkring 8 ud af 100 molekyler i glas C har afgivet en hydron. Det er kun få. Syren i glas C er citronsyre, C₆H₈O₇.",
                hint: STYRKE_HINT.concat(["I luppen for glas C er der omkring 8 oxoniumioner og 92 hele molekyler. Det er langt fra alle."])
            },
            spm2: {
                om: [2],
                tekst: "Glas C, citronsyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", f: "En enkeltpil betyder, at reaktionen går helt til ende. Så ville der ikke være hele molekyler i luppen for glas C." },
                    { t: "⇌  dobbeltpil", ok: true }
                ],
                hint: pilHint("C", false)
            },
            loest: "C₆H₈O₇ + H₂O ⇌ C₆H₇O₇⁻ + H₃O⁺. Citronsyre er en svag syre, selv om citronsyre afgiver flere hydroner end eddikesyre."
        },
        {
            id: "d", navn: "Glas D", glas: 3, kendt: true,
            gaet: {
                intro: "Glas D har fået sin etiket: saltsyre, HCl. Saltsyre er en stærk syre. 100 HCl-molekyler blev hældt i vandet i glas D.",
                tekst: "Hvad viser luppen for glas D?",
                svar: [
                    { t: "1 oxoniumion og 99 hele molekyler" },
                    { t: "50 oxoniumioner og 50 hele molekyler" },
                    { t: "100 oxoniumioner og ingen hele molekyler", ok: true }
                ]
            },
            forsoeg: {
                om: [3],
                tekst: "Klik på glas D, og se i luppen, om dit gæt holder.",
                hint: klikHint("D", "som nummer to fra højre")
            },
            loest: "I glas D har alle HCl-molekyler afgivet en hydron: 100 oxoniumioner, 100 chloridioner og ingen hele molekyler. Sådan ser en stærk syre ud i luppen."
        },
        {
            id: "e", navn: "Glas E", glas: 4, kendt: true,
            gaet: {
                intro: "Glas E har fået sin etiket: myresyre, HCOOH. Myresyre er en svag syre. 100 myresyremolekyler blev hældt i vandet i glas E.",
                tekst: "Hvilken partikel er der flest af i luppen for glas E?",
                svar: [
                    { t: "Oxoniumioner, H₃O⁺" },
                    { t: "Hele myresyremolekyler", ok: true },
                    { t: "Lige mange af hver" }
                ]
            },
            forsoeg: {
                om: [4],
                tekst: "Klik på glas E, og se i luppen, om dit gæt holder.",
                set: "I luppen for glas E er der omkring 96 hele myresyremolekyler og 4 oxoniumioner.",
                hint: klikHint("E", "længst til højre")
            },
            spm: {
                om: [1, 4], navngiv: [1],
                tekst: "Glas E er myresyre: omkring 4 ud af 100 har afgivet en hydron. Glas B er eddikesyre: kun 1. Hvor bruser kalken mest?",
                svar: [
                    { t: "I glas B, eddikesyre",
                      f: "Det er oxoniumionerne, der får kalken til at bruse. Hvilket af de to glas har flest oxoniumioner, glas B eller glas E?" },
                    { t: "Lige meget: begge er svage syrer",
                      f: "Svage syrer er ikke lige svage. Sammenlign boblerne i glas B med boblerne i glas E." },
                    { t: "I glas E, myresyre", ok: true }
                ],
                hint: [
                    "Kalken reagerer med oxoniumionerne, H₃O⁺.",
                    "Myresyren i glas E har omkring 4 oxoniumioner i luppen. Eddikesyren i glas B har 1.",
                    "Flest oxoniumioner giver mest brus. Se på boblerne i glas E og i glas B."
                ]
            },
            loest: "Myresyre og eddikesyre er begge svage syrer. Men myresyre afgiver lidt flere hydroner end eddikesyre, så kalken bruser lidt mere i glas E end i glas B."
        }
    ];

    /* ----- Fane 3: Fortyndet? -------------------------------------------------------
       opstil.trin: saa mange gange er saltsyren fortyndet, naar maalet begynder.
       om: 0 = eddikesyre (til venstre), 1 = saltsyre (til hoejre). */
    D.F_MAAL = [
        {
            id: "ti", navn: "Fortynd 10 gange",
            opstil: { trin: 0 },
            gaet: {
                intro: "Til venstre står et glas med eddikesyre, til højre et glas med saltsyre. Begge syrer er 0,10 M. Om lidt fortynder du saltsyren 10 gange med vand, så saltsyren kun er 0,010 M.",
                tekst: "Hvor bruser kalken mest, når saltsyren er fortyndet?",
                svar: [
                    { t: "I eddikesyren: den er mest koncentreret" },
                    { t: "I saltsyren, selv om den er fortyndet", ok: true },
                    { t: "Lige meget i de to glas" }
                ]
            },
            forsoeg: {
                om: [1],
                tekst: "Tryk på knappen Fortynd 10 gange mellem glassene. Sammenlign så luppen over saltsyren med luppen over eddikesyren.",
                krav: 1,
                hint: [
                    "Knappen Fortynd 10 gange står mellem de to glas.",
                    "Når du trykker på knappen, hældes ni tiendedele af saltsyren fra, og glasset fyldes op med vand.",
                    "Tryk på Fortynd 10 gange én gang, og vent, til glasset med saltsyre er fyldt igen."
                ]
            },
            loest: "Saltsyren er nu 0,010 M, altså 10 gange tyndere end eddikesyren. Alligevel har saltsyren flest oxoniumioner: 10 i luppen over saltsyren mod omkring 1 i luppen over eddikesyren."
        },
        {
            id: "lige", navn: "Lige mange oxoniumioner",
            forsoeg: {
                om: [1],
                tekst: "Fortynd saltsyren, til luppen over saltsyren har lige så få røde oxoniumioner som luppen over eddikesyren.",
                krav: 2,
                set: "Nu er der 1 oxoniumion i luppen over saltsyren og omkring 1 i luppen over eddikesyren. Kalken bruser lige lidt i de to glas.",
                hint: [
                    "Sammenlign antallet af røde kugler i luppen over saltsyren med antallet i luppen over eddikesyren.",
                    "Hver fortynding giver 10 gange færre oxoniumioner i saltsyren: 100, så 10, så 1.",
                    "Saltsyren skal være 0,0010 M. Det er to fortyndinger fra 0,10 M."
                ]
            },
            spm: {
                om: [1],
                tekst: "Saltsyren var 0,10 M og er nu 0,0010 M. Hvor mange gange er saltsyren fortyndet i alt?",
                svar: [
                    { t: "20 gange", f: "To fortyndinger på 10 gange skal ganges med hinanden, ikke lægges sammen." },
                    { t: "100 gange", ok: true },
                    { t: "1000 gange", f: "1000 gange ville være tre fortyndinger på 10 gange. Sedlen på glasset med saltsyre viser 0,0010 M." }
                ],
                hint: [
                    "Saltsyren begyndte som 0,10 M. Sedlen på glasset med saltsyre viser, hvad koncentrationen er nu.",
                    "Saltsyren er fortyndet 10 gange og så 10 gange igen.",
                    "10 · 10 = 100."
                ]
            },
            loest: "Saltsyren skal fortyndes 100 gange, før den har lige så få oxoniumioner som eddikesyren. Det passer med, at kun 1 ud af 100 eddikesyremolekyler har afgivet en hydron."
        },
        {
            id: "svag", navn: "Er saltsyren blevet svag?",
            opstil: { trin: 2 },
            spm: {
                om: [1],
                tekst: "Den fortyndede saltsyre får kalken til at bruse lige så lidt som eddikesyren. Er saltsyren blevet en svag syre?",
                svar: [
                    { t: "Ja, lige så svag som eddikesyren",
                      f: "Se i luppen over saltsyren. Er der nogen hele HCl-molekyler? Et helt HCl-molekyle er gråt med en orange hydron på." },
                    { t: "Nej, alle HCl-molekyler har afgivet en hydron", ok: true },
                    { t: "Ja, vand gør en stærk syre svag",
                      f: "Vandet har kun gjort, at der er færre HCl-molekyler i hver liter. Se i luppen over saltsyren, om nogen af HCl-molekylerne er hele." }
                ],
                hint: [
                    "En syre er svag, når de fleste af syrens molekyler er hele.",
                    "Se i luppen over saltsyren. Er der et gråt, helt HCl-molekyle?",
                    "I luppen over saltsyren er der 1 HCl-molekyle, og det har afgivet sin hydron. Saltsyren er stadig en stærk syre."
                ]
            },
            loest: "Saltsyre er en stærk syre, uanset hvor meget vand der er i. Saltsyren i glasset er fortyndet, ikke svag."
        },
        {
            id: "mest", navn: "Hvor er der mest syre?",
            opstil: { trin: 2 },
            spm: {
                tekst: "Tæl alle syremolekyler, grå og blå, i luppen over saltsyren og i luppen over eddikesyren. Hvilket glas har mest syre?",
                svar: [
                    { t: "Glasset med saltsyre",
                      f: "Tæl de grå og de blå molekyler i luppen over saltsyren, og sammenlign med luppen over eddikesyren." },
                    { t: "Lige meget: kalken bruser ens",
                      f: "At kalken bruser ens, viser kun, at der er lige mange oxoniumioner. Tæl også de hele eddikesyremolekyler." },
                    { t: "Glasset med eddikesyre", ok: true }
                ],
                hint: [
                    "Hvert syremolekyle tæller med: de grå er hele, og de blå har afgivet en hydron.",
                    "I luppen over eddikesyren er der 100 syremolekyler. I luppen over saltsyren er der 1.",
                    "Eddikesyren er 0,10 M, og saltsyren er 0,0010 M."
                ]
            },
            loest: "Eddikesyren er 0,10 M, og saltsyren er 0,0010 M. Eddikesyren er altså mest koncentreret, selv om eddikesyre er en svag syre."
        },
        {
            id: "ord", navn: "To slags ord",
            opstil: { trin: 2 },
            felter: {
                tekst: "På tavlen står fire flasker med syre. Vælg to ord til hver flaske: stærk eller svag, og koncentreret eller fortyndet. Tryk så på Tjek.",
                hint: [
                    "Stærk og svag handler om, hvilken syre der er i flasken.",
                    "Koncentreret og fortyndet handler om, hvor meget syre der er i hver liter.",
                    "Saltsyre er altid en stærk syre, og eddikesyre er altid en svag syre. 10 M er koncentreret, og 0,0010 M er fortyndet."
                ]
            },
            loest: "Stærk og svag fortæller, hvor stor en del af syrens molekyler der afgiver en hydron. Koncentreret og fortyndet fortæller, hvor meget syre der er i hver liter."
        }
    ];

    /* De fire flasker paa tavlen i det sidste maal */
    D.ORD = [
        { syre: "HCl", c: "10 M", konc: true },
        { syre: "eddike", c: "0,0010 M", konc: false },
        { syre: "HCl", c: "0,0010 M", konc: false },
        { syre: "eddike", c: "10 M", konc: true }
    ];

    D.ORD_MANGLER = "Der mangler et ord. Vælg to ord til hver flaske.";

    D.ordFejl = function (raekke, del) {
        var o = D.ORD[raekke], navn = K.Navn(o.syre);
        if (del === "s") {
            return navn + " " + o.c + ": stærk og svag handler om, hvilken syre det er. " +
                (K.erStaerk(o.syre) ? "I saltsyre afgiver alle molekyler en hydron, uanset hvor meget vand der er i flasken." : "I eddikesyre afgiver kun få molekyler en hydron, uanset hvor meget eddikesyre der er i flasken.");
        }
        return navn + " " + o.c + ": koncentreret og fortyndet handler om, hvor meget syre der er i hver liter. " +
            (o.konc ? "10 M er meget syre i hver liter." : "0,0010 M er meget lidt syre i hver liter.");
    };

    /* ----- Det, et klik paa en partikel i luppen siger ----------------------------
       kendt: eleven har faaet at vide, hvilken syre det er */
    D.partikel = function (slags, syre, kendt) {
        var s = K.SYRE[syre];
        if (slags === "ox") return "En oxoniumion, H₃O⁺: et vandmolekyle, der har fået en hydron fra syren.";
        if (slags === "ion") {
            if (!kendt) return "Syrens ion: det, der er tilbage af et syremolekyle, når hydronen er afgivet.";
            return D.Stort(s.ionNavn === "citronsyrens ion" ? "citronsyrens ion" : "en " + s.ionNavn) + ", " + s.ion + ": det, der er tilbage af " + s.formel + ", når hydronen er afgivet.";
        }
        if (!kendt) return "Et helt syremolekyle. Den lille orange kugle er hydronen, som molekylet ikke har afgivet.";
        return "Et helt molekyle " + s.navn + ", " + s.formel + ". Den lille orange kugle er hydronen, som molekylet ikke har afgivet.";
    };

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* ----- Faelles tekster ----------------------------------------------------------- */
    /* Det, kortet siger, naar eleven klikker paa forsoeget, foer der er gaettet */
    D.GAET_LINJE = "Gæt først: vælg et af de tre svar på kortet.";

    D.FAERDIG = {
        g: "Alle fem opgaver om de to glas er løst.",
        s: "Alle fem glas er klaret.",
        f: "Alle fem opgaver om fortynding er løst."
    };

    D.PAASKE = {
        ox: "Lad den være. Den er den eneste oxoniumion herinde, og den har travlt."
    };

    NK.Data = D;
}());

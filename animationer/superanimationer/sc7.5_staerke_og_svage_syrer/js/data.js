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
   har kun lidt plads, naar lupperne skal kunne ses under det, og eleverne
   laeser ikke lange tekster (brugeren 9. okt. 2026: "stadig en smule for
   meget tekst"): et spoergsmaal er hoejst 105 tegn, et svar hoejst 34, et
   forsoeg hoejst 95, et hint hoejst 100, forklaringen til et forkert svar
   hoejst 110 og forklaringen til det rigtige hoejst 160 (selvtesten taeller
   og maaler kortets hoejde). Sig det ene, eleven skal goere eller forstaa.

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
       gul ring, og deres lup en gul ramme.
       aabn: det glas, forsoeget beder eleven klikke paa (kun det kan aabnes). */
    D.G_MAAL = [
        {
            id: "kalk", navn: "Kalk i syre",
            opstil: { kalk: false, lup: [false, false] },
            gaet: {
                intro: "To glas med saltsyre og eddikesyre, begge 0,10 M. Om lidt kommer et stykke kalk i hvert glas.",
                tekst: "I hvilket glas bruser kalken mest?",
                svar: [
                    { t: "I glasset med saltsyre", ok: true },
                    { t: "I glasset med eddikesyre" },
                    { t: "Lige meget i de to glas" }
                ]
            },
            forsoeg: {
                tekst: "Træk et stykke kalk fra skålen ned i hvert af de to glas.",
                hint: [
                    "Skålen med kalk står mellem de to glas.",
                    "Tag fat i skålen, træk hen over et glas, og slip.",
                    "Kom kalk i begge glas, og vent et øjeblik."
                ]
            },
            loest: "Kalken bruser kraftigt i saltsyren og næsten ikke i eddikesyren, selv om koncentrationen er den samme."
        },
        {
            id: "lup-hcl", navn: "Saltsyren i luppen",
            opstil: { kalk: true, lup: [false, false] },
            forsoeg: {
                aabn: 0,
                tekst: "Klik på glasset med saltsyre. Så viser en lup et lille rum i saltsyren.",
                hint: [
                    "Glasset med saltsyre står til venstre.",
                    "Klik på selve glasset med saltsyre.",
                    "Klik på det venstre glas."
                ]
            },
            spm: {
                om: [0],
                tekst: "Luppen over saltsyren: 100 HCl-molekyler blev hældt i. Hvor mange er stadig hele?",
                svar: [
                    { t: "Alle 100 er hele",
                      f: "Et helt HCl-molekyle er gråt med en orange hydron på. Er der grå molekyler i luppen over saltsyren?" },
                    { t: "Omkring halvdelen er hele",
                      f: "Et helt HCl-molekyle er gråt. Led efter grå molekyler i luppen over saltsyren." },
                    { t: "Ingen er hele", ok: true }
                ],
                hint: [
                    "Mærkerne over luppen viser, hvad de tre slags partikler er.",
                    "Et helt HCl-molekyle er gråt med en orange hydron på. Blå Cl⁻ har afgivet hydronen.",
                    "Der er ingen grå molekyler i luppen over saltsyren."
                ]
            },
            loest: "Alle 100 HCl-molekyler har afgivet en hydron: 100 oxoniumioner, H₃O⁺, og 100 chloridioner, Cl⁻."
        },
        {
            id: "lup-eddike", navn: "Eddikesyren i luppen",
            opstil: { kalk: true, lup: [true, false] },
            forsoeg: {
                aabn: 1,
                tekst: "Klik på glasset med eddikesyre. Så viser en lup et lige så lille rum i eddikesyren.",
                hint: [
                    "Glasset med eddikesyre står til højre.",
                    "Klik på selve glasset med eddikesyre.",
                    "Klik på det højre glas."
                ]
            },
            spm: {
                om: [1],
                tekst: "Luppen over eddikesyren: Hvor mange af de 100 eddikesyremolekyler har afgivet en hydron?",
                svar: [
                    { t: "Omkring 1 molekyle", ok: true },
                    { t: "Omkring halvdelen",
                      f: "Tæl de røde oxoniumioner i luppen over eddikesyren: én for hvert molekyle, der har afgivet en hydron." },
                    { t: "Alle 100 molekyler",
                      f: "Så ville alle molekylerne være blå som i luppen over saltsyren." }
                ],
                hint: [
                    "Hvert molekyle, der har afgivet en hydron, har givet én rød oxoniumion, H₃O⁺.",
                    "Den røde oxoniumion i luppen over eddikesyren har en gul ring nu.",
                    "Der er 1 rød oxoniumion. De andre 99 eddikesyremolekyler er hele."
                ]
            },
            loest: "Kun omkring 1 ud af 100 eddikesyremolekyler har afgivet en hydron. De andre 99 er hele."
        },
        {
            id: "balance", navn: "Hydroner frem og tilbage",
            opstil: { kalk: true, lup: [true, true] },
            forsoeg: {
                om: [1],
                tekst: "Hold øje med luppen over eddikesyren, til en blå ion tager en hydron tilbage.",
                set: "Et helt eddikesyremolekyle afgav en hydron, og en blå ion tog en hydron tilbage.",
                hint: [
                    "Der kommer et lille skilt i luppen over eddikesyren, når en hydron flytter.",
                    "Først afgiver et helt molekyle en hydron. Lidt efter tager en blå ion en hydron tilbage.",
                    "Vent nogle sekunder. Hydronerne flytter hele tiden."
                ]
            },
            spm: {
                om: [1],
                tekst: "Hvorfor er der altid omkring 1 oxoniumion i luppen over eddikesyren?",
                svar: [
                    { t: "Reaktionen er gået i stå",
                      f: "Skiltene i luppen over eddikesyren viser, at hydronerne stadig flytter." },
                    { t: "Den går begge veje lige ofte", ok: true },
                    { t: "Der er ikke vand nok",
                      f: "Der er rigeligt vand: omkring 55.000 vandmolekyler, som ikke er tegnet." }
                ],
                hint: [
                    "Hver gang et molekyle afgiver en hydron, tager en blå ion lidt efter en hydron tilbage.",
                    "De to reaktioner sker lige ofte.",
                    "Derfor bliver antallet af oxoniumioner ved med at være omkring 1."
                ]
            },
            loest: "I eddikesyre går reaktionen begge veje. Derfor dobbeltpil: CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺."
        },
        {
            id: "hvorfor", navn: "Stærk og svag",
            opstil: { kalk: true, lup: [true, true] },
            spm: {
                tekst: "Saltsyren og eddikesyren er begge 0,10 M. Hvorfor bruser kalken mest i saltsyren?",
                svar: [
                    { t: "Der er mest syre i saltsyren",
                      f: "Begge syrer er 0,10 M: der blev hældt 100 molekyler i hver lup." },
                    { t: "Saltsyrens molekyler er hele",
                      f: "I luppen over saltsyren er der ingen hele HCl-molekyler." },
                    { t: "Flest oxoniumioner i saltsyren", ok: true }
                ],
                hint: [
                    "Sammenlign de røde kugler i luppen over saltsyren og i luppen over eddikesyren.",
                    "Kalken reagerer med oxoniumionerne, H₃O⁺.",
                    "Saltsyren har 100 oxoniumioner i luppen, eddikesyren omkring 1."
                ]
            },
            loest: "Oxoniumionerne får kalken til at bruse. Saltsyre er en stærk syre: alle molekyler har afgivet en hydron. Eddikesyre er en svag syre: kun omkring 1 ud af 100."
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
        "Et helt syremolekyle er gråt med en orange hydron på. Har molekylet afgivet hydronen, er det blåt.",
        "Stærk syre: alle molekyler har afgivet en hydron. Svag syre: kun få."
    ];

    function pilHint(b, staerk) {
        return [
            "Enkeltpil: reaktionen går helt til ende.",
            "Dobbeltpil: reaktionen går begge veje, så der er hele molekyler tilbage.",
            staerk ? "I glas " + b + " har alle molekyler afgivet en hydron." : "I glas " + b + " er de fleste molekyler stadig hele."
        ];
    }

    function klikHint(b, sted) {
        return ["Glas " + b + " står " + sted + ".", "Klik på selve glas " + b + ".", "Klik på glas " + b + ". Så viser luppen glas " + b + "."];
    }

    D.S_MAAL = [
        {
            id: "a", navn: "Glas A", glas: 0,
            forsoeg: {
                tekst: "Fem glas med 0,10 M syre, uden etiketter. Klik på glas A for at se i luppen.",
                hint: klikHint("A", "længst til venstre")
            },
            spm: {
                om: [0],
                tekst: "Luppen viser 100 syremolekyler i glas A. Er syren i glas A stærk eller svag?",
                svar: [
                    { t: "En stærk syre", ok: true },
                    { t: "En svag syre", f: "I en svag syre er de fleste molekyler hele og grå. Er der grå molekyler i luppen for glas A?" }
                ],
                godt: "Alle 100 har afgivet en hydron. Glas A er salpetersyre, HNO₃.",
                hint: STYRKE_HINT.concat(["Der er ingen grå molekyler i luppen for glas A."])
            },
            spm2: {
                om: [0],
                tekst: "Glas A, salpetersyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", ok: true },
                    { t: "⇌  dobbeltpil", f: "Dobbeltpil bruges, når der er hele molekyler tilbage. Er der det i luppen for glas A?" }
                ],
                hint: pilHint("A", true)
            },
            loest: "HNO₃ + H₂O → NO₃⁻ + H₃O⁺. Enkeltpil, fordi reaktionen går helt til ende i en stærk syre."
        },
        {
            id: "b", navn: "Glas B", glas: 1,
            forsoeg: {
                tekst: "Klik på glas B for at se i luppen.",
                hint: klikHint("B", "som nummer to fra venstre")
            },
            spm: {
                om: [1],
                tekst: "Luppen viser 100 syremolekyler i glas B. Er syren i glas B stærk eller svag?",
                svar: [
                    { t: "En stærk syre", f: "I en stærk syre har alle molekyler afgivet en hydron. I luppen for glas B er næsten alle grå og hele." },
                    { t: "En svag syre", ok: true }
                ],
                godt: "Kun omkring 1 ud af 100 har afgivet en hydron. Glas B er eddikesyre, CH₃COOH.",
                hint: STYRKE_HINT.concat(["I luppen for glas B er næsten alle molekyler grå og hele."])
            },
            spm2: {
                om: [1],
                tekst: "Glas B, eddikesyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", f: "Enkeltpil betyder helt til ende. Så var der ingen hele molekyler i luppen for glas B." },
                    { t: "⇌  dobbeltpil", ok: true }
                ],
                hint: pilHint("B", false)
            },
            loest: "CH₃COOH + H₂O ⇌ CH₃COO⁻ + H₃O⁺. Dobbeltpil, fordi reaktionen går begge veje i en svag syre."
        },
        {
            id: "c", navn: "Glas C", glas: 2,
            forsoeg: {
                tekst: "Klik på glas C for at se i luppen.",
                hint: klikHint("C", "i midten")
            },
            spm: {
                om: [2],
                tekst: "Tæl de røde oxoniumioner i luppen for glas C. Er syren i glas C stærk eller svag?",
                svar: [
                    { t: "En stærk syre", f: "I en stærk syre har alle 100 molekyler afgivet en hydron. Tæl de røde oxoniumioner i luppen for glas C." },
                    { t: "En svag syre", ok: true },
                    { t: "Midt imellem", f: "En syre er kun stærk, når alle molekyler har afgivet en hydron. Ellers er syren svag." }
                ],
                godt: "Omkring 8 ud af 100 er stadig få. Glas C er citronsyre, C₆H₈O₇.",
                hint: STYRKE_HINT.concat(["I luppen for glas C er der omkring 8 oxoniumioner og 92 hele molekyler."])
            },
            spm2: {
                om: [2],
                tekst: "Glas C, citronsyre: hvilken pil skal der stå i reaktionsskemaet?",
                svar: [
                    { t: "→  enkeltpil", f: "Enkeltpil betyder helt til ende. Så var der ingen hele molekyler i luppen for glas C." },
                    { t: "⇌  dobbeltpil", ok: true }
                ],
                hint: pilHint("C", false)
            },
            loest: "C₆H₈O₇ + H₂O ⇌ C₆H₇O₇⁻ + H₃O⁺. Citronsyre er en svag syre, selv om citronsyre afgiver flere hydroner end eddikesyre."
        },
        {
            id: "d", navn: "Glas D", glas: 3, kendt: true,
            gaet: {
                intro: "Glas D har fået sin etiket: saltsyre, HCl, en stærk syre. 100 HCl-molekyler blev hældt i.",
                tekst: "Hvad viser luppen for glas D?",
                svar: [
                    { t: "1 oxoniumion og 99 hele molekyler" },
                    { t: "50 oxoniumioner og 50 hele" },
                    { t: "100 oxoniumioner og ingen hele", ok: true }
                ]
            },
            forsoeg: {
                om: [3],
                tekst: "Klik på glas D, og se i luppen, om dit gæt holder.",
                hint: klikHint("D", "som nummer to fra højre")
            },
            loest: "I glas D har alle 100 HCl-molekyler afgivet en hydron. Sådan ser en stærk syre ud i luppen."
        },
        {
            id: "e", navn: "Glas E", glas: 4, kendt: true,
            gaet: {
                intro: "Glas E har fået sin etiket: myresyre, HCOOH, en svag syre. 100 myresyremolekyler blev hældt i.",
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
                tekst: "Glas E, myresyre: 4 ud af 100 har afgivet en hydron. Glas B, eddikesyre: 1. Hvor bruser kalken mest?",
                svar: [
                    { t: "I glas B, eddikesyre",
                      f: "Oxoniumionerne får kalken til at bruse. Hvilket glas har flest, glas B eller glas E?" },
                    { t: "Lige meget: begge er svage",
                      f: "Svage syrer er ikke lige svage. Sammenlign boblerne i glas B og glas E." },
                    { t: "I glas E, myresyre", ok: true }
                ],
                hint: [
                    "Kalken reagerer med oxoniumionerne, H₃O⁺.",
                    "Glas E har omkring 4 oxoniumioner i luppen, glas B har 1.",
                    "Flest oxoniumioner giver mest brus."
                ]
            },
            loest: "Myresyre og eddikesyre er begge svage syrer, men myresyre afgiver lidt flere hydroner og bruser derfor mest."
        }
    ];

    /* ----- Fane 3: Fortyndet? -------------------------------------------------------
       opstil.trin: saa mange gange er saltsyren fortyndet, naar maalet begynder.
       om: 0 = eddikesyre (til venstre), 1 = saltsyre (til hoejre).
       krav: saa mange fortyndinger beder forsoeget om. */
    D.F_MAAL = [
        {
            id: "ti", navn: "Fortynd 10 gange",
            opstil: { trin: 0 },
            gaet: {
                intro: "Eddikesyre til venstre og saltsyre til højre, begge 0,10 M. Om lidt fortynder du saltsyren 10 gange, til 0,010 M.",
                tekst: "Hvor bruser kalken mest, når saltsyren er fortyndet?",
                svar: [
                    { t: "I eddikesyren" },
                    { t: "I den fortyndede saltsyre", ok: true },
                    { t: "Lige meget i de to glas" }
                ]
            },
            forsoeg: {
                om: [1],
                tekst: "Tryk på Fortynd 10 gange, og sammenlign luppen over saltsyren med luppen over eddikesyren.",
                krav: 1,
                hint: [
                    "Knappen Fortynd 10 gange står mellem de to glas.",
                    "Ni tiendedele af saltsyren hældes fra, og glasset fyldes op med vand.",
                    "Tryk på Fortynd 10 gange, og vent, til glasset med saltsyre er fyldt."
                ]
            },
            loest: "Saltsyren er nu 10 gange tyndere end eddikesyren, men har stadig flest oxoniumioner: 10 mod omkring 1."
        },
        {
            id: "lige", navn: "Lige mange oxoniumioner",
            forsoeg: {
                om: [1],
                tekst: "Fortynd saltsyren, til saltsyren har lige så få oxoniumioner i luppen som eddikesyren.",
                krav: 2,
                set: "Nu er der 1 oxoniumion i luppen over saltsyren og omkring 1 i luppen over eddikesyren.",
                hint: [
                    "Sammenlign de røde kugler i luppen over saltsyren og i luppen over eddikesyren.",
                    "Hver fortynding giver 10 gange færre oxoniumioner i saltsyren: 100, 10, 1.",
                    "Saltsyren skal være 0,0010 M: to fortyndinger fra 0,10 M."
                ]
            },
            spm: {
                om: [1],
                tekst: "Saltsyren var 0,10 M og er nu 0,0010 M. Hvor mange gange er saltsyren fortyndet?",
                svar: [
                    { t: "20 gange", f: "To fortyndinger på 10 gange skal ganges, ikke lægges sammen." },
                    { t: "100 gange", ok: true },
                    { t: "1000 gange", f: "1000 gange er tre fortyndinger. Sedlen på glasset med saltsyre viser 0,0010 M." }
                ],
                hint: [
                    "Saltsyren begyndte som 0,10 M. Sedlen på glasset viser koncentrationen nu.",
                    "Saltsyren er fortyndet 10 gange og så 10 gange igen.",
                    "10 · 10 = 100."
                ]
            },
            loest: "Saltsyren skal fortyndes 100 gange for at ligne eddikesyren: kun 1 ud af 100 eddikesyremolekyler har afgivet en hydron."
        },
        {
            id: "svag", navn: "Er saltsyren blevet svag?",
            opstil: { trin: 2 },
            spm: {
                om: [1],
                tekst: "Kalken bruser nu lige lidt i saltsyren og i eddikesyren. Er saltsyren blevet en svag syre?",
                svar: [
                    { t: "Ja, lige så svag som eddikesyre",
                      f: "Se i luppen over saltsyren. Er der nogen hele HCl-molekyler?" },
                    { t: "Nej, alle har afgivet en hydron", ok: true },
                    { t: "Ja, vand gør en stærk syre svag",
                      f: "Vandet giver kun færre HCl-molekyler i hver liter. Ingen af dem er hele i luppen over saltsyren." }
                ],
                hint: [
                    "En syre er svag, når de fleste af syrens molekyler er hele.",
                    "Er der et gråt, helt HCl-molekyle i luppen over saltsyren?",
                    "Saltsyrens ene HCl-molekyle i luppen har afgivet sin hydron."
                ]
            },
            loest: "Saltsyre er altid en stærk syre. Saltsyren i glasset er fortyndet, ikke svag."
        },
        {
            id: "mest", navn: "Hvor er der mest syre?",
            opstil: { trin: 2 },
            spm: {
                tekst: "Tæl alle syremolekyler, grå og blå, i luppen over saltsyren og over eddikesyren. Hvor er der mest syre?",
                svar: [
                    { t: "I glasset med saltsyre",
                      f: "Tæl de grå og de blå molekyler i luppen over saltsyren og i luppen over eddikesyren." },
                    { t: "Lige meget: kalken bruser ens",
                      f: "Lige meget brus viser kun lige mange oxoniumioner. Tæl også de hele eddikesyremolekyler." },
                    { t: "I glasset med eddikesyre", ok: true }
                ],
                hint: [
                    "Hvert syremolekyle tæller: de grå er hele, de blå har afgivet en hydron.",
                    "Luppen over eddikesyren har 100 syremolekyler, luppen over saltsyren har 1.",
                    "Eddikesyren er 0,10 M, og saltsyren er 0,0010 M."
                ]
            },
            loest: "Eddikesyren er 0,10 M og saltsyren 0,0010 M. Eddikesyren er mest koncentreret, selv om eddikesyre er en svag syre."
        },
        {
            id: "ord", navn: "To slags ord",
            opstil: { trin: 2 },
            felter: {
                tekst: "Vælg to ord til hver af de fire flasker med syre, og tryk på Tjek.",
                hint: [
                    "Stærk eller svag afhænger af, hvilken syre der er i flasken.",
                    "Koncentreret eller fortyndet afhænger af, hvor meget syre der er i hver liter.",
                    "Saltsyre er altid stærk, eddikesyre altid svag. 10 M er koncentreret, 0,0010 M er fortyndet."
                ]
            },
            loest: "Stærk og svag: hvor stor en del af molekylerne der afgiver en hydron. Koncentreret og fortyndet: hvor meget syre der er i hver liter."
        }
    ];

    /* De fire flasker paa tavlen i det sidste maal */
    D.ORD = [
        { syre: "HCl", c: "10 M", konc: true },
        { syre: "eddike", c: "0,0010 M", konc: false },
        { syre: "HCl", c: "0,0010 M", konc: false },
        { syre: "eddike", c: "10 M", konc: true }
    ];

    D.ORD_MANGLER = "Vælg to ord til hver flaske.";

    D.ordFejl = function (raekke, del) {
        var o = D.ORD[raekke], navn = K.Navn(o.syre);
        if (del === "s") {
            return navn + " " + o.c + ": stærk og svag handler om, hvilken syre det er. " +
                (K.erStaerk(o.syre) ? "Saltsyre er altid en stærk syre." : "Eddikesyre er altid en svag syre.");
        }
        return navn + " " + o.c + ": koncentreret og fortyndet handler om, hvor meget syre der er i hver liter. " +
            (o.konc ? "10 M er meget." : "0,0010 M er meget lidt.");
    };

    /* ----- Det, et klik paa en partikel i luppen siger ----------------------------
       kendt: eleven har faaet at vide, hvilken syre det er */
    D.partikel = function (slags, syre, kendt) {
        var s = K.SYRE[syre];
        if (slags === "ox") return "En oxoniumion, H₃O⁺: vand, der har fået en hydron fra syren.";
        if (slags === "ion") {
            if (!kendt) return "Syrens ion: et syremolekyle, der har afgivet sin hydron.";
            return D.Stort(s.ionNavn === "citronsyrens ion" ? "citronsyrens ion" : "en " + s.ionNavn) + ", " + s.ion + ": " + s.formel + ", der har afgivet sin hydron.";
        }
        if (!kendt) return "Et helt syremolekyle. Den orange kugle er hydronen.";
        return "Et helt molekyle " + s.navn + ", " + s.formel + ". Den orange kugle er hydronen.";
    };

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* ----- Faelles tekster ----------------------------------------------------------- */


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

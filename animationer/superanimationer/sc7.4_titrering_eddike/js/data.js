/* =====================================================================
   data.js - teksterne, situationerne paa fane 3 og replikkerne

   Alt, der kan staa som data, staar her. Tallene regnes af modellen i
   kemi.js; her staar kun, hvad der er aendret, og hvad der siges.

   Sproget: NaOH kaldes natriumhydroxid eller NaOH, aldrig natronlud
   (brugerens oenske, 25. sept. 2026).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Fane 1: titreringen --------------------------------------------------
       Hvor langt forbi omslaget (mL) en titrering maa gaa og stadig vaere
       praecis. Draaberne er 0,05 mL, saa den sidste draabe kan ramme
       op til 0,05 mL forbi. */
    D.PRAECIS = 0.10;
    D.LIDT_FOR_LANGT = 0.50;
    D.AFLAES_TOL = 0.05;       /* mL, elevens aflaesning */

    D.TITRER_HINT = "Træk skyderen ved hanen mod højre. Dryp til sidst, og luk hanen, så snart kolben bliver lyserød.";
    D.AFLAES_HINT = "Aflæs bunden af menisken i luppen. De lange streger er hele mL, de korte er 0,1 mL.";

    /* ----- Fane 2: beregningen ---------------------------------------------------
       De fire trin. Eleven skriver foerst formlen og saa tallet.
       etiket: foran feltet, formel: facit til formlen (hoejresiden),
       formelHint: hjaelp til formlen uden at give den, hint: hjaelp til tallet. */
    D.TRIN = [
        { id: "nb", navn: "Stofmængden af NaOH", etiket: "n(NaOH) =", enhed: "mol", formel: "c · V",
          formelHint: "Du kender koncentrationen og rumfanget af NaOH.",
          hint: "Rumfanget skal i liter: del antallet af mL med 1000." },
        { id: "ns", navn: "Stofmængden af eddikesyre", etiket: "n(CH₃COOH) =", enhed: "mol", formel: "n(NaOH)",
          formelHint: "Se på reaktionsskemaet. Hvor mange CH₃COOH reagerer med én OH⁻?",
          hint: "Det er den samme stofmængde som n(NaOH)." },
        { id: "ms", navn: "Massen af eddikesyre", etiket: "m(CH₃COOH) =", enhed: "g", formel: "n · M",
          formelHint: "Du kender stofmængden af eddikesyre og dens molarmasse.",
          hint: "Brug eddikesyrens molarmasse, 60,05 g/mol." },
        { id: "pct", navn: "Masseprocenten", etiket: "m% =", enhed: "%", formel: "m(CH₃COOH) / m(prøve) · 100 %",
          formelHint: "Masseprocent er massen af stoffet delt med massen af hele prøven.",
          hint: "Del syrens masse med prøvens masse, og gang med 100 %." }
    ];

    /* En klassekammerats maaling, naar eleven ikke selv har titreret, og
       ved Ny opgave: proeve, koncentration og masseprocent varierer */
    D.KAMMERAT_MASSER = [1.80, 1.95, 2.00, 2.05, 2.10, 2.20, 2.40];
    D.KAMMERAT_C = [0.100, 0.100, 0.100, 0.0950, 0.105, 0.120];

    /* ----- Fane 3: to kolber ---------------------------------------------------------
       B: hvad der er anderledes i kolbe B (m, vand, c) og hvad eleven tror
       (cTror). spild: den del af proeven, der aldrig kommer i kolben.
       spm: "forbrug" (hvor mange mL NaOH) eller "procent".
       samme: brug forrige situations kolber. Alle spoergsmaal om NaOH
       spoerger om mL, fordi det er det, buretten viser. */
    D.ML_VALG = ["Flere mL", "Lige så mange", "Færre mL"];
    D.PROCENT_VALG = ["For høj", "Rigtig", "For lav"];

    D.SITUATIONER = [
        { id: "vand", spm: "forbrug", B: { vand: 60 }, aendring: "60 mL vand",
          tekst: "Kolbe B får 60 mL vand i stedet for 20 mL. Skal der flere, lige så mange eller færre mL NaOH til?",
          valg: D.ML_VALG, rigtig: 1,
          forkert: [
              "Vandet indeholder ingen eddikesyre, og NaOH reagerer kun med syren.",
              "",
              "Syren bliver mere fortyndet, men der er lige så mange syremolekyler, og hvert af dem skal have én OH⁻."
          ],
          hint: "Kommer der mere eddikesyre i kolben, når man hælder vand i?",
          efter: "Lige så mange. Der er lige så mange mol eddikesyre i begge kolber." },
        { id: "halv", spm: "forbrug", B: { m: 1.00 }, aendring: "1,00 g eddike",
          tekst: "Kolbe B får kun 1,00 g eddike i stedet for 2,00 g. Skal der flere, lige så mange eller færre mL NaOH til?",
          valg: D.ML_VALG, rigtig: 2,
          forkert: [
              "Halvt så meget eddike indeholder halvt så mange mol eddikesyre.",
              "NaOH reagerer med eddikesyren, og der er kun halvt så meget af den i kolbe B.",
              ""
          ],
          hint: "Hvor mange mol eddikesyre er der i 1,00 g eddike i forhold til 2,00 g?",
          efter: "Halvt så mange. Halvt så meget eddike indeholder halvt så mange mol eddikesyre." },
        { id: "halvProcent", spm: "procent", samme: true, B: { m: 1.00 }, aendring: "1,00 g eddike",
          tekst: "Du regner masseprocenten ud for kolbe B. Bliver den større, den samme eller mindre end for kolbe A?",
          valg: ["Større", "Den samme", "Mindre"], rigtig: 1,
          forkert: [
              "Massen af eddikesyre er halvt så stor, og prøven er også halvt så stor. Brøken ændrer sig ikke.",
              "",
              "Massen af eddikesyre er halvt så stor, men du deler også med en halvt så stor prøve."
          ],
          hint: "m% = m(CH₃COOH) / m(prøve) · 100 %. Hvad sker der med tælleren, og hvad sker der med nævneren?",
          efter: "Den samme. Det er den samme eddike: halvt så meget syre delt med en halvt så stor prøve." },
        { id: "base", spm: "forbrug", B: { c: 0.200 }, aendring: "0,200 M NaOH",
          tekst: "Buretten ved kolbe B har NaOH med 0,200 M i stedet for 0,100 M. Skal der flere, lige så mange eller færre mL til?",
          valg: D.ML_VALG, rigtig: 2,
          forkert: [
              "Hver mL indeholder dobbelt så mange OH⁻, så der skal færre mL til den samme mængde syre.",
              "Syren er den samme, men hver mL indeholder dobbelt så mange OH⁻.",
              ""
          ],
          hint: "Hvor mange OH⁻ er der i 1 mL, når koncentrationen er dobbelt så stor?",
          efter: "Halvt så mange. Hver mL indeholder dobbelt så mange OH⁻." },
        { id: "spild", spm: "procent", B: { spild: 0.15 }, aendring: "noget eddike spildt",
          tekst: "Du spilder lidt af eddiken til kolbe B, efter at du har vejet den. Bliver masseprocenten for høj, rigtig eller for lav?",
          valg: D.PROCENT_VALG, rigtig: 2,
          forkert: [
              "Det spildte kommer aldrig i kolben, så der er mindre syre at titrere.",
              "Du deler med 2,00 g, men der kom mindre end 2,00 g i kolben.",
              ""
          ],
          hint: "Hvor meget eddike kom i kolben, og hvilken masse deler du med?",
          efter: "For lav. Der skal færre mL NaOH til, men du deler stadig med 2,00 g." }
    ];

    /* ----- Kemichael --------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (de
       usynlige .anker over laerredet, papirkortet oeverst i scenen og kortene
       i panelet). felt: kolberne
       paa fane 3, tegnet paa laerredet (introFelt i js/laerer.js). Ingen
       vittigheder i praesentationen. */
    D.INTRO_TITRERING = [
        { tekst: "I denne fane titrerer du eddike med natriumhydroxid for at bestemme, hvor meget eddikesyre eddiken indeholder. " +
            "Kolben indeholder 2,00 g eddike, 20 mL vand og to dråber phenolphthalein. " +
            "Buretten indeholder natriumhydroxid.",
          sel: ["#tit-anker-buret", "#tit-anker-kolbe"] },
        { tekst: "Du åbner hanen ved at trække skyderen mod højre, og knappen 1 dråbe tilsætter én dråbe ad gangen. " +
            "Du lukker hanen, så snart kolben er svagt lyserød og forbliver det. " +
            "Luppen viser imens, hvordan hver OH⁻ reagerer med et eddikesyremolekyle.",
          sel: ["#tit-anker-hane", "#tit-anker-lup"] },
        { tekst: "Når kolben er blevet lyserød, aflæser du forbruget ved menisken i panelet og skriver tallet i feltet under den. " +
            "Kortet øverst i scenen viser opgaven, og knappen Indsend svar sender aflæsningen. " +
            "Titreringskurven viser undervejs, hvordan pH i kolben ændrer sig, og knappen Tabel viser målingerne til Excel. " +
            "Knappen Giv hint på kortet hjælper dig, hvis du sidder fast.",
          sel: ["#tit-skort", "#tit-buretkort", "#tit-kurvekort"] }
    ];
    D.INTRO_BEREGNING = [
        { tekst: "I denne fane beregner du masseprocenten af eddikesyre i eddiken ud fra forbruget af natriumhydroxid. " +
            "Tavlen viser de fire trin i beregningen, og hvert trin bliver skrevet færdigt, når du har regnet det.",
          sel: "#ber-anker-tavle" },
        { tekst: "Målingen øverst i panelet er din egen fra fane 1. " +
            "Har du ikke titreret selv, regner du på en klassekammerats måling. " +
            "Når beregningen er færdig, giver knappen Ny opgave en ny måling.",
          sel: "#ber-data" },
        { tekst: "I hvert af de fire trin skriver du først formlen og derefter tallet i feltet i panelet. " +
            "Kortet øverst i scenen siger, hvad du skal skrive, og knappen Indsend svar sender feltet. " +
            "Knappen Giv hint på kortet hjælper dig, hvis du sidder fast.",
          sel: ["#ber-skort", "#ber-trin"] }
    ];
    D.INTRO_FORBRUG = [
        { tekst: "I denne fane undersøger du, hvordan en ændring ved titreringen påvirker forbruget og masseprocenten. " +
            "Kolbe A er som på fane 1, mens én ting er ændret ved kolbe B. " +
            "Skiltet under kolbe B viser ændringen.",
          felt: ["kolbeA", "kolbeB"] },
        { tekst: "På kortet øverst i scenen vælger du, hvordan forbruget af natriumhydroxid eller masseprocenten bliver for kolbe B i forhold til kolbe A. " +
            "Knappen Indsend svar sender dit gæt, og knappen Giv hint hjælper dig, hvis du sidder fast.",
          sel: "#for-skort" },
        { tekst: "Når du har valgt et svar, bliver begge kolber titreret til omslaget. " +
            "Tabellen viser bagefter forbruget og masseprocenten for begge kolber, og kortet forklarer resultatet.",
          sel: "#for-tabelkort" }
    ];

    /* Ros, foerste gang en hel fane er klaret (én gang pr. browser). Det
       er sammen med paaskeaeggene de eneste gange, han kommer ind af sig
       selv (brugerens regel 4. nov. 2026). */
    D.ROS_TITRERING = "Kolben blev lyserød på den sidste dråbe. Nogle elever bruger et helt år på at nå den præcision.";
    D.ROS_BEREGNING = "Du har beregnet masseprocenten af eddikesyre ud fra forbruget. Sådan kontrollerer et laboratorium tallet på eddikens etiket.";
    D.ROS_FORBRUG = "Du har gennemført alle fem opgaver med de to kolber. Det blev til ti kolber, og opvasken tager jeg ikke.";

    /* Paaskeaeggene: buretten er loebet tom, og et resultat, der rammer
       eddikens masseprocent paa hundrededelen */
    D.BEM_TOM = "Du har tømt hele buretten ned i kolben. Eddikesyren var brugt op for længe siden.";
    D.AEG_PRAECIS = "Dit resultat rammer eddikens masseprocent på hundrededelen. Det har jeg aldrig selv gjort.";

    NK.Data = D;
}());

/* =====================================================================
   data.js - teksterne, situationerne paa fane 3 og replikkerne

   Alt, der kan staa som data, staar her. Tallene regnes af modellen i
   kemi.js; her staar kun, hvad der er aendret, og hvad der siges.
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

    D.AFLAES_HINT = "Aflæs bunden af menisken i luppen. De lange streger er hele mL, de korte er 0,1 mL.";

    /* ----- Indikatoren ------------------------------------------------------------
       Ordene, der afhaenger af indikatoren. D.saetOrd(ind) laegger dem i
       D.O og skriver de tekster om, der bruger dem (D.TITRER_HINT,
       D.INTRO_TITRERING, D.ROS_TITRERING og D.BEM_MORK). navn: indikatoren,
       start: farven foer omslaget, farve: omslagsfarven (svag, tydelig og
       kraftig), skyer: skyerne, hvor draaben rammer, suppe: det, kolben
       ligner langt forbi omslaget. */
    D.ORD = {
        dcf: { navn: "dichlorfluorescein", start: "gulgrøn", svag: "svagt lyserød", farve: "lyserød",
               tydelig: "tydeligt lyserød", kraftig: "kraftigt lyserød", skyer: "lyserøde skyer", suppe: "hindbærsmoothie" },
        chromat: { navn: "kaliumchromat", start: "gul", svag: "svagt rødbrun", farve: "rødbrun",
                   tydelig: "tydeligt rødbrun", kraftig: "mørk rødbrun", skyer: "rødbrune skyer", suppe: "tomatsuppe" }
    };

    D.saetOrd = function (ind) {
        var o = D.ORD[ind] || D.ORD.dcf;
        D.O = o;
        D.TITRER_HINT = "Træk skyderen ved hanen mod højre. Dryp til sidst, og luk hanen, så snart kolben bliver " + o.svag + ".";
        D.INTRO_TITRERING = [
            { tekst: "I denne fane titrerer du havvand med sølv(I)nitrat for at bestemme, hvor meget chlorid havvandet indeholder. " +
                "Kolben indeholder 1,00 g havvand, 20 mL demineraliseret vand og lidt " + o.navn + ", som farver væsken " + o.start + ". " +
                "Buretten indeholder sølv(I)nitrat.",
              sel: ["#tit-anker-buret", "#tit-anker-kolbe"] },
            { tekst: "Du åbner hanen ved at trække skyderen mod højre, og knappen 1 dråbe tilsætter én dråbe ad gangen. " +
                "Du lukker hanen, så snart kolben er " + o.svag + " og forbliver det. " +
                "Luppen viser imens, hvordan hver Ag⁺ fælder en Cl⁻ som hvidt sølv(I)chlorid.",
              sel: ["#tit-anker-hane", "#tit-anker-lup"] },
            { tekst: "Når kolben har skiftet farve, aflæser du forbruget på buretten ved menisken i panelet og skriver tallet i feltet på kortet øverst i scenen. " +
                "Kurven viser undervejs, hvordan stofmængderne i kolben ændrer sig. " +
                "Knappen Giv hint på kortet hjælper dig, hvis du sidder fast.",
              sel: ["#tit-skort", "#tit-buretkort", "#tit-kurvekort"] }
        ];
        D.ROS_TITRERING = "Kolben blev " + o.farve + " på den sidste dråbe. Nogle elever bruger et helt år på at nå den præcision.";
        /* Over 1 mL forbi omslaget, foerste gang og derefter hver tredje
           (brugerens valg 4. nov. 2026, se tjekMork i sim_titrering.js) */
        D.BEM_MORK = "Stop nu, medmindre du vil lave " + o.suppe + ".";
    };

    /* ----- Fane 2: beregningen ---------------------------------------------------
       De fire trin. Eleven skriver foerst formlen og saa tallet.
       etiket: foran feltet, formel: facit til formlen (hoejresiden),
       formelHint: hjaelp til formlen uden at give den, hint: hjaelp til tallet. */
    D.TRIN = [
        { id: "nb", navn: "Stofmængden af sølv(I)ioner", etiket: "n(Ag⁺) =", enhed: "mol", formel: "c · V",
          formelHint: "Du kender koncentrationen og rumfanget af sølv(I)nitrat.",
          hint: "Rumfanget skal være i liter, så divider antallet af mL med 1000." },
        { id: "ns", navn: "Stofmængden af natriumchlorid", etiket: "n(NaCl) =", enhed: "mol", formel: "n(Ag⁺)",
          formelHint: "Se på reaktionsskemaet. Hvor mange Ag⁺ reagerer med én Cl⁻? Og hver NaCl giver én Cl⁻.",
          hint: "n(NaCl) er den samme stofmængde som n(Ag⁺)." },
        { id: "ms", navn: "Massen af natriumchlorid", etiket: "m(NaCl) =", enhed: "g", formel: "n · M",
          formelHint: "Du kender stofmængden af NaCl og dens molarmasse.",
          hint: "Brug natriumchlorids molarmasse, 58,44 g/mol." },
        { id: "pct", navn: "Masseprocenten", etiket: "m% =", enhed: "%", formel: "m(NaCl) / m(prøve) · 100 %",
          formelHint: "Masseprocent er massen af stoffet divideret med massen af hele prøven.",
          hint: "Divider saltets masse med prøvens masse, og gang med 100 %." }
    ];

    /* En klassekammerats maaling, naar eleven ikke selv har titreret, og
       ved Ny opgave: sted, proeve og koncentration varierer */
    D.KAMMERAT_MASSER = [0.80, 0.95, 1.00, 1.05, 1.20, 1.50];
    D.KAMMERAT_C = [0.050, 0.050, 0.050, 0.0480, 0.0520, 0.100];

    /* ----- Fane 3: fejlkilder --------------------------------------------------------
       B: hvad der er anderledes i kolbe B (m, vand, c, post) og hvad eleven
       tror (cTror). spild: den del af proeven, der aldrig kommer i kolben.
       post: kolben faar postevand med lidt chlorid i stedet for
       demineraliseret vand. spm: "forbrug" (forbruget af soelvnitrat)
       eller "procent". samme: brug forrige situations kolber.
       titel: i etiketten paa kortet, aendring: skiltet ved kolbe B. */
    D.FORBRUG_VALG = ["Større", "Det samme", "Mindre"];
    D.PROCENT_VALG = ["For høj", "Korrekt", "For lav"];

    D.SITUATIONER = [
        { id: "vand", spm: "forbrug", B: { vand: 60 }, titel: "Mere vand", aendring: "60 mL vand",
          tekst: "Kolbe B får 60 mL demineraliseret vand i stedet for 20 mL. Hvordan bliver forbruget af sølv(I)nitrat i forhold til kolbe A?",
          valg: D.FORBRUG_VALG, rigtig: 1,
          forkert: [
              "Demineraliseret vand indeholder ikke chlorid, og Ag⁺ reagerer kun med Cl⁻.",
              "",
              "Chloridet bliver fortyndet, men stofmængden af Cl⁻ er den samme, og hver Cl⁻ reagerer med én Ag⁺."
          ],
          hint: "Tilfører det demineraliserede vand chlorid til kolben?",
          efter: "Det samme. Stofmængden af chlorid er den samme i begge kolber. Mængden af vand er ikke en fejlkilde." },
        { id: "halv", spm: "forbrug", B: { m: 0.50 }, titel: "Mindre havvand", aendring: "0,50 g havvand",
          tekst: "Kolbe B får 0,50 g havvand i stedet for 1,00 g. Hvordan bliver forbruget af sølv(I)nitrat i forhold til kolbe A?",
          valg: D.FORBRUG_VALG, rigtig: 2,
          forkert: [
              "Den halve masse havvand indeholder den halve stofmængde chlorid.",
              "Ag⁺ reagerer med chloridet, og kolbe B indeholder kun den halve stofmængde chlorid.",
              ""
          ],
          hint: "Hvordan er stofmængden af chlorid i 0,50 g havvand i forhold til 1,00 g?",
          efter: "Mindre, det halve. Den halve masse havvand indeholder den halve stofmængde chlorid." },
        { id: "halvProcent", spm: "procent", samme: true, B: { m: 0.50 }, titel: "Mindre havvand", aendring: "0,50 g havvand",
          tekst: "Masseprocenten for kolbe B beregnes med m(prøve) = 0,50 g. Hvordan bliver den i forhold til kolbe A?",
          valg: ["Større", "Den samme", "Mindre"], rigtig: 1,
          forkert: [
              "m(NaCl) er halveret, og m(prøve) er også halveret. Brøken er uændret.",
              "",
              "m(NaCl) er halveret, men der divideres også med den halve prøvemasse."
          ],
          hint: "m% = m(NaCl) / m(prøve) · 100 %. Hvad sker der med tælleren, og hvad sker der med nævneren?",
          efter: "Den samme. Den halve masse NaCl divideres med den halve prøvemasse. En mindre prøve er ikke en fejlkilde." },
        { id: "staerk", spm: "forbrug", B: { c: 0.100 }, titel: "Stærkere sølv(I)nitrat", aendring: "0,100 M sølv(I)nitrat",
          tekst: "Buretten ved kolbe B indeholder 0,100 M sølv(I)nitrat i stedet for 0,050 M. Hvordan bliver forbruget i forhold til kolbe A?",
          valg: D.FORBRUG_VALG, rigtig: 2,
          forkert: [
              "Koncentrationen er fordoblet, så det halve rumfang indeholder den samme stofmængde Ag⁺.",
              "Stofmængden af chlorid er den samme, men koncentrationen af Ag⁺ er fordoblet.",
              ""
          ],
          hint: "n = c · V. Hvilket rumfang giver den samme stofmængde Ag⁺, når c er fordoblet?",
          efter: "Mindre, det halve. Med den dobbelte koncentration giver det halve rumfang den samme stofmængde Ag⁺. Beregnes der med 0,100 M, bliver masseprocenten den samme." },
        { id: "postevand", spm: "procent", B: { post: true }, titel: "Postevand", aendring: "postevand",
          tekst: "Kolbe B får 20 mL postevand i stedet for demineraliseret vand. Postevand indeholder lidt chlorid. Hvordan bliver masseprocenten?",
          valg: D.PROCENT_VALG, rigtig: 0,
          forkert: [
              "",
              "Chloridet fra postevandet fælder også Ag⁺. Forbruget viser ikke, hvor chloridet stammer fra.",
              "Kolben indeholder mere chlorid, så forbruget bliver større, ikke mindre."
          ],
          hint: "Hvordan bliver forbruget, når kolben indeholder mere chlorid? Og hvilken masse divideres der med?",
          efter: "For høj. Chloridet fra postevandet tæller med i forbruget, men der divideres kun med havvandets masse." },
        { id: "spild", spm: "procent", B: { spild: 0.15 }, titel: "Spildt havvand", aendring: "havvand spildt",
          tekst: "Noget af havvandet til kolbe B bliver spildt efter vejningen. Hvordan bliver masseprocenten?",
          valg: D.PROCENT_VALG, rigtig: 2,
          forkert: [
              "Det spildte havvand kommer ikke i kolben, så der er mindre chlorid at titrere.",
              "Der beregnes med 1,00 g, men kolben indeholder mindre end 1,00 g havvand.",
              ""
          ],
          hint: "Hvor meget havvand kom i kolben, og hvilken masse divideres der med?",
          efter: "For lav. Forbruget bliver mindre, men der divideres stadig med 1,00 g." }
    ];

    /* ----- Kemichael --------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (de
       usynlige .anker over laerredet og kortene i panelet). felt: kolberne
       paa fane 3, tegnet paa laerredet (introFelt i js/laerer.js). Ingen
       vittigheder i praesentationen.
       D.INTRO_TITRERING og D.ROS_TITRERING skrives af D.saetOrd, fordi
       farverne afhaenger af indikatoren. */
    D.INTRO_BEREGNING = [
        { tekst: "I denne fane beregner du masseprocenten af natriumchlorid i havvandet ud fra forbruget af sølv(I)nitrat. " +
            "Tavlen viser de fire trin i beregningen, og hvert trin bliver skrevet færdigt, når du har regnet det.",
          sel: "#ber-anker-tavle" },
        { tekst: "Målingen øverst i panelet er din egen fra fane 1. " +
            "Har du ikke titreret selv, regner du på en klassekammerats måling. " +
            "Når beregningen er færdig, giver knappen Ny opgave en ny måling.",
          sel: "#ber-data" },
        { tekst: "I hvert af de fire trin skriver du først formlen og derefter tallet i feltet på kortet øverst i scenen. " +
            "Knappen Giv hint på kortet hjælper dig, hvis du sidder fast.",
          sel: "#ber-skort" }
    ];
    D.INTRO_FORBRUG = [
        { tekst: "I denne fane undersøger du, hvordan en ændring ved titreringen påvirker forbruget og masseprocenten. " +
            "Kolbe A er som på fane 1, mens én ting er ændret ved kolbe B. " +
            "Skiltet under kolbe B viser ændringen.",
          felt: ["kolbeA", "kolbeB"] },
        { tekst: "På kortet øverst i scenen vælger du, hvordan forbruget af sølv(I)nitrat eller masseprocenten bliver for kolbe B i forhold til kolbe A, og trykker på Indsend svar. " +
            "Knappen Giv hint på kortet hjælper dig, hvis du sidder fast.",
          sel: "#for-skort" },
        { tekst: "Når du har valgt et svar, bliver begge kolber titreret til omslaget. " +
            "Tabellen i panelet viser bagefter forbruget og masseprocenten for begge kolber, og kortet forklarer resultatet.",
          sel: "#for-tabelkort" }
    ];

    /* Ros, foerste gang en hel fane er klaret (én gang pr. browser). Det
       er sammen med paaskeaeggene de eneste gange, han kommer ind af sig
       selv (brugerens regel 4. nov. 2026). */
    D.ROS_BEREGNING = "Du har beregnet masseprocenten ud fra forbruget af sølv(I)nitrat. Saltet i havvandet er nu talt.";
    D.ROS_FORBRUG = "Du har gennemført alle seks opgaver om fejlkilder. Det blev til tolv kolber, og opvasken tager jeg ikke.";

    /* Paaskeaeggene: buretten er loebet tom, og et resultat, der rammer
       havvandets masseprocent paa hundrededelen */
    D.BEM_TOM = "Du har tømt hele buretten. Sølv(I)nitrat er ikke gratis.";
    D.AEG_PRAECIS = "Dit resultat rammer havvandets masseprocent på hundrededelen. Det har jeg aldrig selv gjort.";

    D.saetOrd(NK.Kemi ? NK.Kemi.indikator : "dcf");
    NK.Data = D;
}());

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

    D.TITRER_HINT = "Træk skyderen ved hanen mod højre. Dryp til sidst, og luk hanen, så snart kolben bliver svagt rødbrun.";
    D.AFLAES_HINT = "Aflæs bunden af menisken i luppen. De lange streger er hele mL, de korte er 0,1 mL.";

    /* ----- Fane 2: beregningen ---------------------------------------------------
       De fire trin. Eleven skriver foerst formlen og saa tallet.
       etiket: foran feltet, formel: facit til formlen (hoejresiden),
       formelHint: hjaelp til formlen uden at give den, hint: hjaelp til tallet. */
    D.TRIN = [
        { id: "nb", navn: "Stofmængden af sølvioner", etiket: "n(Ag⁺) =", enhed: "mol", formel: "c · V",
          formelHint: "Du kender koncentrationen og rumfanget af sølvnitrat.",
          hint: "Rumfanget skal i liter: del antallet af mL med 1000." },
        { id: "ns", navn: "Stofmængden af natriumchlorid", etiket: "n(NaCl) =", enhed: "mol", formel: "n(Ag⁺)",
          formelHint: "Se på reaktionsskemaet. Hvor mange Ag⁺ reagerer med én Cl⁻? Og hver NaCl giver én Cl⁻.",
          hint: "Det er den samme stofmængde som n(Ag⁺)." },
        { id: "ms", navn: "Massen af natriumchlorid", etiket: "m(NaCl) =", enhed: "g", formel: "n · M",
          formelHint: "Du kender stofmængden af NaCl og dens molarmasse.",
          hint: "Brug natriumchlorids molarmasse, 58,44 g/mol." },
        { id: "pct", navn: "Masseprocenten", etiket: "m% =", enhed: "%", formel: "m(NaCl) / m(prøve) · 100 %",
          formelHint: "Masseprocent er massen af stoffet delt med massen af hele prøven.",
          hint: "Del saltets masse med prøvens masse, og gang med 100 %." }
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
       titel: overskriften i opgavekortet, aendring: skiltet ved kolbe B. */
    D.FORBRUG_VALG = ["Større", "Det samme", "Mindre"];
    D.PROCENT_VALG = ["For høj", "Korrekt", "For lav"];

    D.SITUATIONER = [
        { id: "vand", spm: "forbrug", B: { vand: 60 }, titel: "Mere vand", aendring: "60 mL vand",
          tekst: "Kolbe B får 60 mL demineraliseret vand i stedet for 20 mL. Hvordan bliver forbruget af sølvnitrat i forhold til kolbe A?",
          valg: D.FORBRUG_VALG, rigtig: 1,
          forkert: [
              "Demineraliseret vand indeholder ikke chlorid, og Ag⁺ reagerer kun med Cl⁻.",
              "",
              "Chloridet bliver fortyndet, men stofmængden af Cl⁻ er den samme, og hver Cl⁻ reagerer med én Ag⁺."
          ],
          hint: "Tilfører det demineraliserede vand chlorid til kolben?",
          efter: "Det samme. Stofmængden af chlorid er den samme i begge kolber. Mængden af vand er ikke en fejlkilde." },
        { id: "halv", spm: "forbrug", B: { m: 0.50 }, titel: "Mindre havvand", aendring: "0,50 g havvand",
          tekst: "Kolbe B får 0,50 g havvand i stedet for 1,00 g. Hvordan bliver forbruget af sølvnitrat i forhold til kolbe A?",
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
        { id: "staerk", spm: "forbrug", B: { c: 0.100 }, titel: "Stærkere sølvnitrat", aendring: "0,100 M sølvnitrat",
          tekst: "Buretten ved kolbe B indeholder 0,100 M sølvnitrat i stedet for 0,050 M. Hvordan bliver forbruget i forhold til kolbe A?",
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
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_TITRERING = [
        "Titreringen. Havvand i kolben, sølvnitrat i buretten.",
        "Åbn hanen, og luk den, når kolben bliver rødbrun.",
        "Sølvnitrat giver sorte fingre. Spørg mig ikke hvordan."
    ];
    D.INTRO_BEREGNING = [
        "Beregningen. Fra forbruget til saltet i havvandet.",
        "Skriv først formlen og så tallet i feltet til højre.",
        "Enhederne skal med. Også når ingen kigger."
    ];
    D.INTRO_FORBRUG = [
        "Fejlkilder. Én ting er ændret ved kolbe B.",
        "Gæt, hvad der sker. Så titrerer jeg dem begge.",
        "Sølvnitrat er dyrt. Jeg drypper, som var det mit eget."
    ];

    D.ROS_TITRERING = "Rødbrun på én dråbe. Det tager nogle et helt år.";
    D.ROS_BEREGNING = "Saltet er talt. Med enheder.";
    D.ROS_FORBRUG = "Tolv kolber. Opvasken tager jeg ikke.";

    D.BEM_MORK = "Stop nu, medmindre du vil lave tomatsuppe.";
    D.BEM_TOM = "Hele buretten. Sølv er ikke gratis.";
    D.AEG_PRAECIS = "På hundrededelen. Det har jeg aldrig ramt.";

    NK.Data = D;
}());

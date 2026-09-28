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

    /* ----- Fane 3: to kolber ---------------------------------------------------------
       B: hvad der er anderledes i kolbe B (m, vand, c, post) og hvad eleven
       tror (cTror). spild: den del af proeven, der aldrig kommer i kolben.
       post: kolben faar postevand med lidt chlorid i stedet for
       demineraliseret vand. spm: "forbrug" (hvor mange mL soelvnitrat)
       eller "procent". samme: brug forrige situations kolber. */
    D.ML_VALG = ["Flere mL", "Lige så mange", "Færre mL"];
    D.PROCENT_VALG = ["For høj", "Rigtig", "For lav"];

    D.SITUATIONER = [
        { id: "vand", spm: "forbrug", B: { vand: 60 }, aendring: "60 mL vand",
          tekst: "Kolbe B får 60 mL demineraliseret vand i stedet for 20 mL. Skal der flere, lige så mange eller færre mL sølvnitrat til?",
          valg: D.ML_VALG, rigtig: 1,
          forkert: [
              "Det demineraliserede vand indeholder ingen chlorid, og Ag⁺ reagerer kun med Cl⁻.",
              "",
              "Chloridet bliver mere fortyndet, men der er lige så mange Cl⁻, og hver af dem skal have én Ag⁺."
          ],
          hint: "Kommer der mere chlorid i kolben, når man hælder demineraliseret vand i?",
          efter: "Lige så mange. Der er lige så mange mol chlorid i begge kolber." },
        { id: "halv", spm: "forbrug", B: { m: 0.50 }, aendring: "0,50 g havvand",
          tekst: "Kolbe B får kun 0,50 g havvand i stedet for 1,00 g. Skal der flere, lige så mange eller færre mL sølvnitrat til?",
          valg: D.ML_VALG, rigtig: 2,
          forkert: [
              "Halvt så meget havvand indeholder halvt så mange mol chlorid.",
              "Ag⁺ reagerer med chloridet, og der er kun halvt så meget af det i kolbe B.",
              ""
          ],
          hint: "Hvor mange mol chlorid er der i 0,50 g havvand i forhold til 1,00 g?",
          efter: "Halvt så mange. Halvt så meget havvand indeholder halvt så mange mol chlorid." },
        { id: "halvProcent", spm: "procent", samme: true, B: { m: 0.50 }, aendring: "0,50 g havvand",
          tekst: "Du regner masseprocenten ud for kolbe B. Bliver den større, den samme eller mindre end for kolbe A?",
          valg: ["Større", "Den samme", "Mindre"], rigtig: 1,
          forkert: [
              "Massen af NaCl er halvt så stor, og prøven er også halvt så stor. Brøken ændrer sig ikke.",
              "",
              "Massen af NaCl er halvt så stor, men du deler også med en halvt så stor prøve."
          ],
          hint: "m% = m(NaCl) / m(prøve) · 100 %. Hvad sker der med tælleren, og hvad sker der med nævneren?",
          efter: "Den samme. Det er det samme havvand: halvt så meget salt delt med en halvt så stor prøve." },
        { id: "staerk", spm: "forbrug", B: { c: 0.100 }, aendring: "0,100 M sølvnitrat",
          tekst: "Buretten ved kolbe B har sølvnitrat med 0,100 M i stedet for 0,050 M. Skal der flere, lige så mange eller færre mL til?",
          valg: D.ML_VALG, rigtig: 2,
          forkert: [
              "Hver mL indeholder dobbelt så mange Ag⁺, så der skal færre mL til den samme mængde chlorid.",
              "Chloridet er det samme, men hver mL indeholder dobbelt så mange Ag⁺.",
              ""
          ],
          hint: "Hvor mange Ag⁺ er der i 1 mL, når koncentrationen er dobbelt så stor?",
          efter: "Halvt så mange. Hver mL indeholder dobbelt så mange Ag⁺." },
        { id: "postevand", spm: "procent", B: { post: true }, aendring: "postevand",
          tekst: "Kolbe B får 20 mL postevand i stedet for demineraliseret vand. Postevand indeholder lidt chlorid. Bliver masseprocenten for høj, rigtig eller for lav?",
          valg: D.PROCENT_VALG, rigtig: 0,
          forkert: [
              "",
              "Chloridet fra postevandet fælder også Ag⁺. Buretten kan ikke se, hvor chloridet kom fra.",
              "Der er mere chlorid i kolben, så der skal flere mL til, ikke færre."
          ],
          hint: "Skal der flere eller færre mL sølvnitrat til, når der er mere chlorid i kolben? Hvilken masse deler du med?",
          efter: "For høj. Chloridet fra postevandet tæller med, men du deler kun med havvandets masse." },
        { id: "spild", spm: "procent", B: { spild: 0.15 }, aendring: "noget havvand spildt",
          tekst: "Du spilder lidt af havvandet til kolbe B, efter at du har vejet det. Bliver masseprocenten for høj, rigtig eller for lav?",
          valg: D.PROCENT_VALG, rigtig: 2,
          forkert: [
              "Det spildte kommer aldrig i kolben, så der er mindre chlorid at titrere.",
              "Du deler med 1,00 g, men der kom mindre end 1,00 g i kolben.",
              ""
          ],
          hint: "Hvor meget havvand kom i kolben, og hvilken masse deler du med?",
          efter: "For lav. Der skal færre mL sølvnitrat til, men du deler stadig med 1,00 g." }
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
        "To kolber. Én ting er ændret ved kolbe B.",
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

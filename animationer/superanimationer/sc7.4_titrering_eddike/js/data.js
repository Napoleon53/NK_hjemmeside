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
        { id: "skyllet", spm: "procent", B: { c: 0.090, cTror: 0.100 }, aendring: "vand i buretten",
          tekst: "Buretten ved kolbe B var våd indvendig, da den blev fyldt. Derfor er NaOH kun 0,090 M, men du regner med 0,100 M. Bliver masseprocenten for høj, rigtig eller for lav?",
          valg: D.PROCENT_VALG, rigtig: 0,
          forkert: [
              "",
              "Der løber flere mL ned, og du regner, som om hver mL var 0,100 M.",
              "Den fortyndede NaOH har færre OH⁻ pr. mL, så der skal flere mL til, ikke færre."
          ],
          hint: "Skal der flere eller færre mL af den fortyndede NaOH til? Hvad sker der så med n(NaOH), når du regner med 0,100 M?",
          efter: "For høj. Der løber flere mL ned, og du regner, som om hver mL var 0,100 M. Så ser det ud, som om der var mere syre." },
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
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_TITRERING = [
        "Titreringen. Eddike i kolben, NaOH i buretten.",
        "Åbn hanen, og luk den, når kolben bliver lyserød.",
        "Den lille magnet hedder en loppe. Den bider ikke."
    ];
    D.INTRO_BEREGNING = [
        "Beregningen. Fra forbruget til masseprocenten.",
        "Skriv først formlen og så tallet i feltet til højre.",
        "Enhederne skal med. Også når ingen kigger."
    ];
    D.INTRO_FORBRUG = [
        "To kolber. Én ting er ændret ved kolbe B.",
        "Gæt, hvad der sker. Så titrerer jeg dem begge.",
        "Jeg titrerer hurtigt. Jeg har haft mange år til at øve."
    ];

    D.ROS_TITRERING = "Lyserød på én dråbe. Det tager nogle et helt år.";
    D.ROS_BEREGNING = "Masseprocenten er i hus. Med enheder.";
    D.ROS_FORBRUG = "Tolv kolber. Opvasken tager jeg ikke.";

    D.BEM_MORK = "Det er ikke lyserødt længere. Det er pink.";
    D.BEM_TOM = "Hele buretten. Kolben fik det hele.";
    D.AEG_PRAECIS = "På hundrededelen. Det har jeg aldrig ramt.";

    NK.Data = D;
}());

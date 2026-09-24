/* =====================================================================
   tekster.js - opgaverne, quizzen og Kemichaels replikker

   Alt, eleven laeser, staar her. De forkerte svar i opgaver og quiz er
   de fejl, elever faktisk laver, og hvert af dem har sin egen
   forklaring (fejl), der passer til fejlen.
   ===================================================================== */
(function () {
    "use strict";

    var D = window.NK.Data;

    /* ----- Kemichael -----------------------------------------------------
       Praesentationen, foerste gang siden aabnes. Han peger paa panelet,
       mens han siger linjen D.INTRO_PEG. */
    D.INTRO = [
        "Et glas væske. Forstørret, så du ser molekylerne.",
        "Hæld i herovre. Bliver det ét lag eller to?",
        "Olien er lånt fra kantinen. Den skal tilbage."
    ];
    D.INTRO_PEG = 1;

    D.REPLIK = {
        /* En stor oliedraabe svaever midt i blandingen (paaskeaegget) */
        svaever: [
            "Olien svæver. Det lykkes sjældent for nogen.",
            "En svævende oliekugle. Kantinen vil ikke tro det.",
            "Tætheden går lige op. Rør ikke ved noget."
        ],
        /* Bassinet loeb over */
        overloeb: [
            "Bassinet rummer ni portioner. Gulvet har fået resten.",
            "Det løb over. Gulvet var ellers lige vasket.",
            "Ni portioner er loftet. Det ved gulvet nu."
        ],
        /* Rystet noget, der allerede er ét lag */
        rystBlandet: [
            "Det kan ikke blive mere blandet end blandet.",
            "Du ryster en færdig blanding. Den er ligeglad."
        ],
        /* Rystet et tomt bassin */
        rystTomt: [
            "Du ryster luft. Den er allerede godt blandet.",
            "Et tomt bassin skilles aldrig."
        ]
    };

    /* ----- Opgaverne ------------------------------------------------------
       start     det, bassinet fyldes med, foer opgaven: [stof, portioner]
                 og om det er rystet sammen (blandet)
       valg      svarmulighederne; rigtig markerer det rigtige, og fejl er
                 forklaringen til netop den fejl
       handling  det, der sker i bassinet, naar eleven har valgt
       byg       opgaven loeses i bassinet i stedet for med et valg */
    D.OPGAVER = [
        {
            id: "olieIVand",
            start: { fyld: [["vand", 3]] },
            tekst: "Der er vand i bassinet. Du hælder olie i. Hvad ser du i glasset, når det er faldet til ro?",
            valg: [
                { tekst: "Ét lag", fejl: "Vand er polært, og olie er upolær. Vandmolekylerne holder fast i hinanden og skubber olien ud." },
                { tekst: "To lag med olien øverst", rigtig: true },
                { tekst: "To lag med olien nederst", fejl: "Olien er tyk, men den er lettere end vand: 0,92 mod 1,00 g/mL." }
            ],
            handling: { haeld: "olie" },
            hint: "Vand er polært. Olie er upolær. Tjek så tæthederne.",
            svar: "To lag med olien øverst. Vand er polært og olie upolær, så de blandes ikke. Olien er lettere og lægger sig øverst."
        },
        {
            id: "ethanolIVand",
            start: { fyld: [["vand", 3]] },
            tekst: "Der er vand i bassinet. Du hælder ethanol i. Ethanol er lettere end vand. Hvad ser du, når det er faldet til ro?",
            valg: [
                { tekst: "Ét lag", rigtig: true },
                { tekst: "To lag med ethanol øverst", fejl: "Tætheden afgør kun rækkefølgen, når der er to lag. Ethanol og vand er begge polære." },
                { tekst: "Uklart, som når man ryster olie og vand", fejl: "Uklart bliver det kun, når to væsker ikke kan blandes. Ethanol og vand er begge polære." }
            ],
            handling: { haeld: "ethanol" },
            hint: "Ethanol har en OH-gruppe ligesom vand.",
            svar: "Ét lag. Ethanol og vand er begge polære og danner hydrogenbindinger til hinanden. Molekylerne blander sig af sig selv, og tætheden gør ingen forskel."
        },
        {
            id: "olieIEthanol",
            start: { fyld: [["ethanol", 3]] },
            tekst: "Der er ethanol i bassinet. Du hælder olie i. Hvad ser du, når det er faldet til ro?",
            valg: [
                { tekst: "To lag med olien øverst", fejl: "Olie ligger øverst på vand, fordi vand er tungere. Ethanol er lettere end olie: 0,79 mod 0,92 g/mL." },
                { tekst: "To lag med olien nederst", rigtig: true },
                { tekst: "Ét lag, for ethanol har også en upolær del", fejl: "Den upolære del er kort. OH-gruppen gør ethanol så polær, at den ikke blandes med olie." }
            ],
            handling: { haeld: "olie" },
            hint: "Ethanol vejer 0,79 g/mL. Olie vejer 0,92 g/mL.",
            svar: "To lag med olien nederst. Ethanol er polær og olie upolær, så de blandes ikke. Ethanol er lettere end olie og lægger sig øverst."
        },
        {
            id: "ryst",
            start: { fyld: [["vand", 3], ["olie", 1]] },
            tekst: "Olien ligger på vandet. Du ryster bassinet kraftigt. Hvad ser du lidt efter?",
            valg: [
                { tekst: "Uklart først, så to lag igen", rigtig: true },
                { tekst: "Ét lag: rystningen har blandet dem", fejl: "Rystningen deler olien i små dråber, men molekylerne er de samme. Se dråberne finde sammen." },
                { tekst: "Uklart, og det bliver ved", fejl: "Dråberne finder sammen igen og stiger op. Kun med et emulgeringsmiddel, fx æggeblomme i mayonnaise, bliver det ved." }
            ],
            handling: { ryst: 1.2 },
            hint: "Ændrer en rystning på, hvilke molekyler der er polære?",
            svar: "Rystningen deler olien i små dråber, og det ser uklart ud: en emulsion. Polariteten er den samme, så dråberne finder sammen og stiger op igen."
        },
        {
            id: "olieNed",
            start: { fyld: [["vand", 2], ["olie", 1]] },
            tekst: "Olien ligger øverst på vandet. Få den til at ligge nederst uden at tømme bassinet.",
            byg: "olieNederst",
            hint: "Hæld noget i, der gør vandlaget lettere end olien. Ryst bagefter.",
            svar: "Ethanol blander sig med vandet og gør blandingen lettere. Når den vejer under 0,92 g/mL, synker olien. Det kræver lidt mere ethanol end vand.",
            visSvar: { haeld: ["ethanol", "ethanol", "ethanol"], ryst: 1.2 }
        },
        {
            id: "varm",
            start: { fyld: [["vand", 2], ["ethanol", 2]], blandet: true },
            tekst: "Vand og ethanol er blandet til ét lag. Du varmer op til 90 °C. Hvad sker der?",
            valg: [
                { tekst: "Ethanol koger, og vandet bliver", rigtig: true },
                { tekst: "Begge koger, for de er blandet til ét stof", fejl: "De er blandet, men molekylerne er stadig to stoffer med hvert sit kogepunkt. Se, hvilke der stiger op." },
                { tekst: "Intet, før blandingen når 100 °C", fejl: "Ethanol koger ved 78 °C. Ved 90 °C er ethanol over sit kogepunkt og vandet under sit." }
            ],
            handling: { T: 90 },
            hint: "Kogepunkterne står ved temperaturskyderen.",
            svar: "Ethanol koger ved 78 °C og vand ved 100 °C. Ved 90 °C forlader ethanol blandingen som damp, mens vandet bliver. Ét lag, men stadig to stoffer."
        }
    ];

    /* ----- Quizzen ----------------------------------------------------- */
    D.QUIZ = [
        {
            spm: "Hvad afgør, om to væsker kan blandes?",
            svar: [
                { tekst: "Om molekylerne er polære eller upolære", rigtig: true },
                { tekst: "Hvor tunge væskerne er", fejl: "Tætheden afgør kun, hvilket lag der ligger øverst, når der er to lag." },
                { tekst: "Hvor tyktflydende væskerne er", fejl: "Olie er tyktflydende, men det er ikke derfor, den ikke blandes med vand." },
                { tekst: "Om væskerne har samme farve", fejl: "Farven siger intet om molekylerne. Vand og ethanol er begge farveløse." }
            ],
            forklaring: "Polære væsker blandes med polære, og upolære med upolære."
        },
        {
            spm: "Olie hældes i vand. Hvorfor ligger olien øverst?",
            svar: [
                { tekst: "Olien er lettere end vand", rigtig: true },
                { tekst: "Olien er upolær", fejl: "Polariteten forklarer, at der bliver to lag. Hvilket der ligger øverst, afgør tætheden." },
                { tekst: "Olien er mere tyktflydende", fejl: "Tyktflydende væsker kan godt ligge nederst. Det er tætheden, der tæller." }
            ],
            forklaring: "Olie vejer 0,92 g/mL og vand 1,00 g/mL. Det letteste lag ligger øverst."
        },
        {
            spm: "Hvorfor kan ethanol blandes med vand?",
            svar: [
                { tekst: "Ethanols OH-gruppe danner hydrogenbindinger til vandet", rigtig: true },
                { tekst: "Ethanol er lettere end vand", fejl: "Tætheden afgør ikke, om noget blandes. Olie er også lettere end vand." },
                { tekst: "Ethanol er upolær", fejl: "Ethanol har en polær OH-gruppe. Det er den, der gør forskellen." }
            ],
            forklaring: "Vand og ethanol er begge polære og holder lige så godt fast i hinanden som i sig selv."
        },
        {
            spm: "Ethanol og olie hældes sammen. Hvilket lag ligger øverst?",
            svar: [
                { tekst: "Ethanol", rigtig: true },
                { tekst: "Olien, den ligger altid øverst", fejl: "Olien ligger øverst på vand. Ethanol vejer 0,79 g/mL og er lettere end olien." },
                { tekst: "Der bliver ét lag", fejl: "Ethanol er polær og olie upolær. De blandes ikke." }
            ],
            forklaring: "Der bliver to lag, og tætheden afgør rækkefølgen: ethanol 0,79 g/mL, olie 0,92 g/mL."
        },
        {
            spm: "Olie og vand er rystet til en uklar emulsion. Hvad sker der, når bassinet står stille?",
            svar: [
                { tekst: "Det skiller sig i to lag igen", rigtig: true },
                { tekst: "Det forbliver uklart", fejl: "Dråberne finder sammen og stiger op. Kun et emulgeringsmiddel kan holde dem adskilt." },
                { tekst: "Det bliver til ét klart lag", fejl: "Rystningen ændrer ikke polariteten. Olie og vand bliver aldrig ét lag." }
            ],
            forklaring: "Rystningen deler kun olien i små dråber. Polariteten er den samme, så lagene kommer tilbage."
        }
    ];
}());

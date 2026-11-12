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
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger
       i Kemibogens sprog: hvad animationen traener, og hvordan tingene
       bruges. sel: det, han peger paa, og som faar en gul ramme, der
       blinker (kort i panelet og de usynlige .anker over laerredet).
       Ingen vittigheder i praesentationen. Ellers siger han kun noget ved
       paaskeaegget. */
    D.INTRO = [
        { tekst: "I denne animation undersøger du, hvilke væsker der kan blandes, og hvilke der lægger sig i to lag. Bassinet viser væsken så forstørret, at hver kugle er et molekyle. Glasset til højre viser den samme væske, som den ser ud for øjet.",
          sel: ["#anker-bassin", "#anker-glas"] },
        { tekst: "I kortet Hæld i hælder du vand, ethanol eller olie i bassinet. I kortet Ryst og varm ryster du bassinet, skruer op for temperaturen og vælger mellem tilbagesvaling og destillation. Knappen Tøm bassinet tømmer både bassinet og forlaget.",
          sel: ["#haeld-kort", "#energi-kort"] },
        { tekst: "Kortet øverst i scenen har seks opgaver om det, der sker i bassinet. Du vælger et svar og trykker Indsend svar. Knappen Giv et hint hjælper, når du sidder fast. Knappen Quiz øverst til højre giver fem spørgsmål om blandbarhed.",
          sel: ["#skort", "#quizknap"] }
    ];

    D.REPLIK = {
        /* En stor oliedraabe haenger midt i blandingen, fordi taethederne
           naesten er ens (paaskeaegget). Hele saetninger (brugerens regel
           4. nov. 2026), og den toerre tone maa blive. */
        svaever: [
            "Oliedråben svæver midt i blandingen. Det er der ikke mange, der får til at lykkes.",
            "Olien har ingen hast. Den kan ikke bestemme sig for, om den skal op eller ned.",
            "Det er næsten en svævende oliekugle. Ingen i kantinen vil tro på det."
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
            tekst: "Der er vand i bassinet. Du hælder olie i. Hvad ser du i glasset, når væskerne er faldet til ro?",
            valg: [
                { tekst: "Ét lag", fejl: "Vand er polært, og olie er upolær. Vandmolekylerne holder fast i hinanden og skubber olien ud." },
                { tekst: "To lag med olien øverst", rigtig: true },
                { tekst: "To lag med olien nederst", fejl: "Olien er tyktflydende, men den har en lavere densitet end vand, nemlig 0,92 mod 1,00 g/mL." }
            ],
            handling: { haeld: "olie" },
            hint: "Vand er polært, og olie er upolær. Sammenlign derefter densiteterne.",
            svar: "To lag med olien øverst. Vand er polært og olie upolær, så de blandes ikke. Olien har den laveste densitet og lægger sig øverst."
        },
        {
            id: "ethanolIVand",
            start: { fyld: [["vand", 3]] },
            tekst: "Der er vand i bassinet. Du hælder ethanol i. Ethanol har en lavere densitet end vand. Hvad ser du, når væskerne er faldet til ro?",
            valg: [
                { tekst: "Ét lag", rigtig: true },
                { tekst: "To lag med ethanol øverst", fejl: "Densiteten afgør kun rækkefølgen af lagene, når der er to lag. Ethanol og vand er begge polære." },
                { tekst: "Uklart som rystet olie og vand", fejl: "En blanding bliver kun uklar, når to væsker ikke kan blandes. Ethanol og vand er begge polære." }
            ],
            handling: { haeld: "ethanol" },
            hint: "Ethanol har en OH-gruppe ligesom vand.",
            svar: "Ét lag. Ethanol og vand er begge polære og danner hydrogenbindinger til hinanden. Molekylerne blander sig af sig selv, og densiteten gør ingen forskel."
        },
        {
            id: "olieIEthanol",
            start: { fyld: [["ethanol", 3]] },
            tekst: "Der er ethanol i bassinet. Du hælder olie i. Hvad ser du, når væskerne er faldet til ro?",
            valg: [
                { tekst: "To lag med olien øverst", fejl: "Olie ligger øverst på vand, men ethanol har en lavere densitet end olie, 0,79 mod 0,92 g/mL." },
                { tekst: "To lag med olien nederst", rigtig: true },
                { tekst: "Ét lag, ethanol har en upolær del", fejl: "Ethanolmolekylets upolære del er kort. OH-gruppen gør ethanol så polær, at den ikke blandes med olie." }
            ],
            handling: { haeld: "olie" },
            hint: "Ethanol har densiteten 0,79 g/mL og olie 0,92 g/mL.",
            svar: "To lag med olien nederst. Ethanol er polær og olie upolær, så de blandes ikke. Ethanol har lavest densitet og lægger sig øverst."
        },
        {
            id: "ryst",
            start: { fyld: [["vand", 3], ["olie", 1]] },
            tekst: "Olien ligger på vandet. Du ryster bassinet kraftigt. Hvad ser du lidt efter?",
            valg: [
                { tekst: "Uklart først, så to lag igen", rigtig: true },
                { tekst: "Ét lag, fordi væskerne er blandet", fejl: "Rystningen deler olien i små dråber, men molekylerne er de samme. Se dråberne finde sammen." },
                { tekst: "Uklart hele tiden", fejl: "Dråberne finder sammen igen og stiger op. Kun et emulgeringsmiddel som æggeblomme i mayonnaise holder blandingen uklar." }
            ],
            handling: { ryst: 1.2 },
            hint: "Ændrer en rystning på, hvilke molekyler der er polære?",
            svar: "Rystningen deler olien i små dråber, så blandingen bliver uklar og kaldes en emulsion. Polariteten er den samme, så dråberne finder sammen og stiger op igen."
        },
        {
            id: "olieNed",
            start: { fyld: [["vand", 2], ["olie", 1]] },
            tekst: "Olien ligger øverst på vandet. Få den til at ligge nederst uden at tømme bassinet.",
            byg: "olieNederst",
            hint: "Hæld et stof i, der giver vandlaget en lavere densitet end olien. Ryst bagefter.",
            svar: "Ethanol blander sig med vandet og giver blandingen en lavere densitet. Når blandingens densitet er under 0,92 g/mL, synker olien. Blandingen skal indeholde lidt mere ethanol end vand.",
            visSvar: { haeld: ["ethanol", "ethanol", "ethanol"], ryst: 1.2 }
        },
        {
            id: "varm",
            start: { fyld: [["vand", 2], ["ethanol", 2]], blandet: true },
            tekst: "Vand og ethanol er blandet til ét lag. Du varmer blandingen op til 90 °C. Hvad sker der?",
            valg: [
                { tekst: "Det koger, dampen er mest ethanol", rigtig: true },
                { tekst: "Begge stoffer koger lige meget", fejl: "De er blandet, men stadig to stoffer med hvert sit kogepunkt. Se, hvilke molekyler der stiger op." },
                { tekst: "Intet, før blandingen når 100 °C", fejl: "Ethanol koger ved 78 °C. Blandingen koger allerede ved ca. 83 °C, for ethanol fordamper let." }
            ],
            handling: { T: 90 },
            hint: "Kogepunkterne står ved temperaturskyderen.",
            svar: "Ethanol koger ved 78 °C og vand ved 100 °C. Ved 90 °C koger blandingen, og dampen er mest ethanol, men lidt vand kommer med. Ét lag, men stadig to stoffer."
        }
    ];

    /* ----- Quizzen ----------------------------------------------------- */
    D.QUIZ = [
        {
            spm: "Hvad afgør, om to væsker kan blandes?",
            svar: [
                { tekst: "Om molekylerne er polære eller upolære", rigtig: true },
                { tekst: "Hvor tunge væskerne er", fejl: "Densiteten afgør kun, hvilket lag der ligger øverst, når der er to lag." },
                { tekst: "Hvor tyktflydende væskerne er", fejl: "Olie er tyktflydende, men det er ikke derfor, den ikke blandes med vand." },
                { tekst: "Om væskerne har samme farve", fejl: "Farven siger intet om molekylerne. Vand og ethanol er begge farveløse." }
            ],
            forklaring: "Polære væsker blandes med polære, og upolære med upolære."
        },
        {
            spm: "Olie hældes i vand. Hvorfor ligger olien øverst?",
            svar: [
                { tekst: "Olien har en lavere densitet end vand", rigtig: true },
                { tekst: "Olien er upolær", fejl: "Polariteten forklarer, at der bliver to lag. Hvilket lag der ligger øverst, afgør densiteten." },
                { tekst: "Olien er mere tyktflydende", fejl: "Tyktflydende væsker kan godt ligge nederst. Det er densiteten, der tæller." }
            ],
            forklaring: "Olie har densiteten 0,92 g/mL og vand 1,00 g/mL. Laget med den laveste densitet ligger øverst."
        },
        {
            spm: "Hvorfor kan ethanol blandes med vand?",
            svar: [
                { tekst: "Ethanols OH-gruppe danner hydrogenbindinger til vandet", rigtig: true },
                { tekst: "Ethanol har en lavere densitet end vand", fejl: "Densiteten afgør ikke, om to væsker kan blandes. Olie har også en lavere densitet end vand." },
                { tekst: "Ethanol er upolær", fejl: "Ethanol har en polær OH-gruppe, og den gør ethanol til et polært stof." }
            ],
            forklaring: "Vand og ethanol er begge polære, og molekylerne holder lige så godt fast i hinanden som i molekyler af samme slags."
        },
        {
            spm: "Ethanol og olie hældes sammen. Hvilket lag ligger øverst?",
            svar: [
                { tekst: "Ethanol", rigtig: true },
                { tekst: "Olien, fordi den altid ligger øverst", fejl: "Olien ligger øverst på vand, men ethanol har en lavere densitet end olie, 0,79 mod 0,92 g/mL." },
                { tekst: "Der bliver ét lag", fejl: "Ethanol er polær og olie upolær. De blandes ikke." }
            ],
            forklaring: "Der bliver to lag, og densiteten afgør rækkefølgen: ethanol 0,79 g/mL, olie 0,92 g/mL."
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

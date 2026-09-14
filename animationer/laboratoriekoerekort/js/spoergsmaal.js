/* =====================================================================
   Laboratoriekoerekort - spoergsmaalene
   Nye spoergsmaal tilfoejes ved at kopiere en blok. Et spoergsmaal er
   rigtigt besvaret, naar praecis de rigtige svar er valgt. Eleven faar
   at vide, hvor mange svar der skal vaelges. Svarene blandes ved hver
   proeve; saet blandSvar: false, naar raekkefoelgen betyder noget
   (fx A, B, C, D). Et billede kan godt bruges til flere spoergsmaal.
   ===================================================================== */

window.SPOERGSMAAL = [
    {
        billede: "billeder/01_briller.svg",
        alt: "Laboratoriebord med en flaske saltsyre og et bægerglas. Sikkerhedsbrillerne ligger på bordet, kitlen hænger på knagen, og på væggen hænger et påbudsskilt for øjenværn.",
        spoergsmaal: "Du skal fortynde saltsyren. Hvad gør du, før du går i gang?",
        svar: [
            { tekst: "Tager sikkerhedsbrillerne på.", rigtig: true },
            { tekst: "Tager kitlen på.", rigtig: true },
            { tekst: "Skubber brillerne op i panden, så de er klar, hvis det går galt.", rigtig: false },
            { tekst: "Kniber øjnene sammen. Det virker næsten lige så godt.", rigtig: false }
        ],
        kommentar: "Briller i panden beskytter panden. Briller og kittel skal på, før flasken åbnes."
    },
    {
        billede: "billeder/02_haelder.svg",
        alt: "En klassekammerat står med ryggen til og hælder fra en brun flaske ned i et bægerglas. Vasken står længere henne ad bordet.",
        spoergsmaal: "Du skal hen til vasken. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg venter, til flasken står på bordet igen.", rigtig: true },
            { tekst: "Jeg smutter forbi bag ved. Det tager kun et sekund.", rigtig: false },
            { tekst: "Jeg prikker min klassekammerat på skulderen, så vedkommende ved, at jeg er der.", rigtig: false }
        ],
        kommentar: "Den, der hælder, kan ikke se dig. Et prik på skulderen midt i en hældning ender på bordet, gulvet eller hånden."
    },
    {
        billede: "billeder/03_aabne_flasker.svg",
        alt: "En flaske koncentreret ammoniakvand og en flaske koncentreret saltsyre står åbne på bordet. Lågene ligger ved siden af, og over flaskerne mødes dampene i en hvid røg.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Lågene skal på igen, så snart der er hældt.", rigtig: true },
            { tekst: "Hvert låg skal på den flaske, det kom fra.", rigtig: true },
            { tekst: "Den hvide røg viser, at stofferne virker. Det er et godt tegn.", rigtig: false },
            { tekst: "Ingenting. Næste hold skal alligevel bruge flaskerne.", rigtig: false }
        ],
        kommentar: "Røgen er ammoniumchlorid, dannet af dampene fra de to åbne flasker. Et låg på den forkerte flaske forurener indholdet."
    },
    {
        billede: "billeder/04_grib.svg",
        alt: "En klassekammerat med brillerne i panden råber \"Grib!\" og har lige kastet en konisk kolbe med blå væske gennem lokalet. På væggen hænger et forbudsskilt mod at kaste.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Kolben kan knuse, og væsken kan sprøjte.", rigtig: true },
            { tekst: "Der kastes ikke med ting i laboratoriet.", rigtig: true },
            { tekst: "At gribe med begge hænder. Én hånd er for amatører.", rigtig: false },
            { tekst: "At kaste noget tilbage, så det er fair.", rigtig: false }
        ],
        kommentar: "Glas flyver dårligt og lander værre. Ting bæres over, også når der kun er et par meter."
    },
    {
        billede: "billeder/05_uro.svg",
        alt: "To elever leger fangeleg i gangen, og en højttaler spiller høj musik. På bordet i forgrunden koger vand over en tændt brænder. På væggen hænger et advarselsskilt for brandfare.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Der løbes tæt på en tændt brænder og kogende vand.", rigtig: true },
            { tekst: "Musikken er så høj, at ingen kan høre en advarsel.", rigtig: true },
            { tekst: "Ingenting. Fangeleg er god motion mellem to forsøg.", rigtig: false },
            { tekst: "At skrue op, så musikken kan høres over brænderen.", rigtig: false }
        ],
        kommentar: "Et laboratorium er ikke et frikvarter med gasbrændere. Man går roligt og taler, så en advarsel kan høres."
    },
    {
        billede: "billeder/06_vask.svg",
        alt: "En stor flaske natriumhydroxid og en lille flaske med tragt står på bordet. Der er spildt ved siden af flaskerne og på kladdehæftet. Til venstre er der en vask.",
        spoergsmaal: "Du skal hælde fra den store flaske over i den lille. Hvor gør du det?",
        svar: [
            { tekst: "Over vasken.", rigtig: true },
            { tekst: "Der, hvor flaskerne står. Der er alligevel spildt i forvejen.", rigtig: false },
            { tekst: "Ved siden af kladdehæftet, så jeg kan notere med det samme.", rigtig: false },
            { tekst: "Over min sidekammerats forsøg. Der er bedst lys.", rigtig: false }
        ],
        kommentar: "Spild over vasken skylles væk. Spild på bordet ender i hæftet, på ærmet eller i næste gruppes forsøg."
    },
    {
        billede: "billeder/07_ventetid.svg",
        alt: "En konisk kolbe, hvor der dannes bobler, et nedtællingsur, der viser 09:58, og en øvelsesvejledning, hvor der står, at reaktionen tager 10 minutter. Filtrerpapir og en tragt ligger ubrugt.",
        spoergsmaal: "Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg gør tragt og filtrerpapir klar til næste trin.", rigtig: true },
            { tekst: "Jeg læser resten af vejledningen igennem.", rigtig: true },
            { tekst: "Jeg går i kantinen. Reaktionen klarer sig selv.", rigtig: false },
            { tekst: "Jeg ser to afsnit på mobilen. Ti minutter går hurtigt.", rigtig: false }
        ],
        kommentar: "Ventetid er forberedelsestid. Det, der gøres klar nu, skal ikke laves i hast, når reaktionen er færdig."
    },
    {
        billede: "billeder/08_oprydning.svg",
        alt: "Et rodet laboratoriebord med et væltet bægerglas i en blå pøl, spildt pulver, brugte reagensglas, en handske og krøllede servietter. Uret på væggen ringer ud.",
        spoergsmaal: "Øvelsen er slut, og det ringer ud. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg vasker udstyret af og stiller det på plads.", rigtig: true },
            { tekst: "Jeg tørrer bordet af.", rigtig: true },
            { tekst: "Jeg lader det stå. Så kan næste hold se, hvordan øvelsen ser ud.", rigtig: false },
            { tekst: "Jeg skubber det hele ind mod væggen, så bordet ser ryddeligt ud.", rigtig: false }
        ],
        kommentar: "Den næste, der lægger albuerne på bordet, ved ikke, hvad der er spildt. Oprydningen er en del af øvelsen."
    },
    {
        billede: "billeder/09_tilbage.svg",
        alt: "En stamflaske med kobbersulfatopløsning har en tragt i halsen. Ved siden af står et bægerglas med for meget opløsning og en affaldsdunk til tungmetaller.",
        spoergsmaal: "Du har hældt for meget kobbersulfatopløsning op. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg hælder resten i affaldsdunken.", rigtig: true },
            { tekst: "Jeg hælder resten tilbage i flasken. Det er jo det samme stof.", rigtig: false },
            { tekst: "Jeg hælder det i vasken. Det er kun en lille smule.", rigtig: false },
            { tekst: "Jeg gemmer det i bægerglasset til næste hold.", rigtig: false }
        ],
        kommentar: "Det, der har været ude af flasken, kan være forurenet, og hældes det tilbage, ødelægger det flasken for alle. Kobbersalte må ikke i vasken."
    },
    {
        billede: "billeder/10_hormoner.svg",
        alt: "En af drengene ved bordet overfor holder en konisk kolbe op og aflæser den koncentreret. Hjerter stiger op fra dit bord, hvor hæftet er fyldt med tegnede hjerter.",
        spoergsmaal: "Du er i brunst og får lyst til at kramme en af drengene. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg forlader lokalet et øjeblik, så hormonerne kan få afløb i sikkerhed.", rigtig: true },
            { tekst: "Jeg krammer ham. Han har jo sikkerhedsbriller på.", rigtig: false },
            { tekst: "Jeg venter, til han har sat kolben fra sig, og kaster mig så om halsen på ham.", rigtig: false },
            { tekst: "Jeg skriver en kærlighedserklæring på etiketten til saltsyren.", rigtig: false }
        ],
        kommentar: "Et kram midt i et forsøg vælter glas. Følelser håndteres bedst uden for laboratoriet."
    },
    {
        billede: "billeder/11_carsten.svg",
        alt: "Laboratoriet set fra den ene ende. Carsten står ved tavlen i den modsatte ende af lokalet, og der arbejder elever ved bordene.",
        spoergsmaal: "Du skal sige noget til Carsten. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg går stille og roligt hen og fortæller ham det.", rigtig: true },
            { tekst: "Jeg råber. Lokalet er ikke så stort.", rigtig: false },
            { tekst: "Jeg løber derhen, før jeg glemmer det.", rigtig: false },
            { tekst: "Jeg sender en snap og håber, han kigger på telefonen.", rigtig: false }
        ],
        kommentar: "Et råb i laboratoriet lyder som et uheld. Når der råbes hele tiden, bliver den rigtige advarsel ikke hørt."
    },
    {
        billede: "billeder/12_mangler.svg",
        alt: "Et bægerglas og et måleglas står på bordet. Der, hvor den koniske kolbe skal stå, er der kun et spørgsmålstegn. På væggen hænger glasskabe med udstyr.",
        spoergsmaal: "Der mangler en konisk kolbe til øvelsen. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg spørger roligt nabogruppen, om de har en i overskud.", rigtig: true },
            { tekst: "Jeg leder roligt efter en i skabene.", rigtig: true },
            { tekst: "Jeg råber \"Har nogen set en konisk kolbe?\" ud over lokalet.", rigtig: false },
            { tekst: "Jeg tager nabogruppens, mens de kigger den anden vej.", rigtig: false }
        ],
        kommentar: "Et råb får hele lokalet til at kigge op fra det, de hælder. Et roligt spørgsmål til nabobordet er lige så hurtigt."
    },
    {
        billede: "billeder/13_glasudstyr.svg",
        alt: "Fire stykker glasudstyr på bordet, mærket A, B, C og D.",
        spoergsmaal: "Hvad hedder glasset mærket C?",
        svar: [
            { tekst: "Bægerglas", rigtig: false },
            { tekst: "Måleglas", rigtig: false },
            { tekst: "Konisk kolbe", rigtig: true },
            { tekst: "Vase til én blomst", rigtig: false }
        ],
        kommentar: "A er et bægerglas, B et måleglas, C en konisk kolbe og D et reagensglas."
    },
    {
        billede: "billeder/13_glasudstyr.svg",
        alt: "Fire stykker glasudstyr på bordet, mærket A, B, C og D.",
        spoergsmaal: "Du skal afmåle 25 mL vand så præcist som muligt. Hvilket glas bruger du?",
        blandSvar: false,
        svar: [
            { tekst: "A", rigtig: false },
            { tekst: "B", rigtig: true },
            { tekst: "C", rigtig: false },
            { tekst: "D, bare mange gange", rigtig: false }
        ],
        kommentar: "Måleglasset (B) er smalt og har tætte streger, så aflæsningen bliver præcis. Stregerne på bægerglas og konisk kolbe er kun omtrentlige."
    },
    {
        billede: "billeder/13_glasudstyr.svg",
        alt: "Fire stykker glasudstyr på bordet, mærket A, B, C og D.",
        spoergsmaal: "Hvilke glas må du varme op over en brænder?",
        blandSvar: false,
        svar: [
            { tekst: "A", rigtig: true },
            { tekst: "B", rigtig: false },
            { tekst: "C", rigtig: true },
            { tekst: "D", rigtig: true }
        ],
        kommentar: "Bægerglas, konisk kolbe og reagensglas tåler varme. Et måleglas må ikke varmes op: det kan revne, og målestregerne passer ikke længere."
    }
];

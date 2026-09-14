/* =====================================================================
   Laboratoriekoerekort - spoergsmaalene
   Nye spoergsmaal tilfoejes ved at kopiere en blok. Et spoergsmaal er
   rigtigt besvaret, naar praecis de rigtige svar er valgt. Svarene
   blandes ved hver proeve, saa raekkefoelgen her er ligegyldig.
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
    }
];

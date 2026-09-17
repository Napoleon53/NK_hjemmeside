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
        alt: "En titreringsopstilling med en burette fyldt med natriumhydroxid i et stativ og en konisk kolbe under. Ved siden af står flasken med natriumhydroxid 0,1 M. Sikkerhedsbrillerne ligger på bordet, og på væggen hænger et påbudsskilt for øjenværn.",
        spoergsmaal: "Du skal titrere med natriumhydroxid. Hvad gør du, før du går i gang?",
        ekstra: true,
        svar: [
            { tekst: "Tager sikkerhedsbrillerne på.", rigtig: true },
            { tekst: "Skubber brillerne op i panden, så de er klar, hvis det går galt.", rigtig: false },
            { tekst: "Ingenting. Opløsningen er kun 0,1 M.", rigtig: false },
            { tekst: "Kniber øjnene sammen. Det virker næsten lige så godt.", rigtig: false }
        ],
        kommentar: "Briller i panden beskytter panden. Baser som natriumhydroxid er særligt skadelige for øjnene, også i fortyndet opløsning."
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
        billede: "billeder/04_kedsomhed.svg",
        alt: "En elev bag bordet venter på, at en filtrering bliver færdig, klikker med en lang lighter, så flammen står op, og spørger, hvor længe der er til frikvarter. Ved knagerækken tegner en anden elev med tusch på en af laboratoriekitlerne. På bordet i forgrunden står en slukket brænder og en kasse med lightere.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Kitlerne er fælles og skal kunne bruges af de næste.", rigtig: true },
            { tekst: "Lighterne er til at tænde brænderen med, ikke til at lege med.", rigtig: true },
            { tekst: "Ingenting. En kittel med tegninger på er lettere at kende.", rigtig: false },
            { tekst: "At der tegnes med vandfast tusch, så tegningen holder.", rigtig: false }
        ],
        kommentar: "Tusch går ikke af kitlen igen, og en tom lighter opdages først, når næste hold skal tænde brænderen. Ventetid bruges på næste trin i øvelsen."
    },
    {
        billede: "billeder/05_uro.svg",
        alt: "To elever øver karatespark i gangen. Den ene sparker, og den anden vakler baglæns mod bordet ved væggen, hvor deres eget forsøg koger uden opsyn over en tændt brænder. På bordet i forgrunden koger vand over en tændt brænder, og på væggen hænger et advarselsskilt for brandfare.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Der sparkes tæt på tændte brændere og kogende vand.", rigtig: true },
            { tekst: "Deres eget forsøg står uden opsyn.", rigtig: true },
            { tekst: "Ingenting. Karate er god motion mellem to forsøg.", rigtig: false },
            { tekst: "At de har sikkerhedsbriller på, mens de sparker.", rigtig: false }
        ],
        kommentar: "Et spark eller et skub ved siden af rammer bordet, brænderen eller glasset. Mens forsøget kører, følger man med i det."
    },
    {
        billede: "billeder/06_vask.svg",
        alt: "En stor flaske natriumhydroxid står på bordet ved siden af et stativ med en burette, der har en tragt i toppen. Der er spildt ved foden af stativet og på kladdehæftet. Til venstre er der en vask.",
        spoergsmaal: "Buretten skal fyldes fra den store flaske. Hvor gør du det?",
        ekstra: true,
        svar: [
            { tekst: "Over vasken.", rigtig: true },
            { tekst: "Ved stativet på bordet. Der er alligevel spildt i forvejen.", rigtig: false },
            { tekst: "Ved siden af kladdehæftet, så jeg kan notere startaflæsningen med det samme.", rigtig: false },
            { tekst: "Hvor som helst. Der er jo en tragt i buretten.", rigtig: false }
        ],
        kommentar: "En burette løber let over, også med en tragt. Spild over vasken skylles væk, mens spild på bordet ender i hæftet eller på ærmet."
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
            { tekst: "Jeg skyller glassene, stiller dem i opvaskemaskinen og tørrer bordet af med papir.", rigtig: true },
            { tekst: "Jeg lader det stå. Så kan næste hold se, hvordan øvelsen ser ud.", rigtig: false },
            { tekst: "Jeg skubber det hele ind mod væggen, så bordet ser ryddeligt ud.", rigtig: false }
        ],
        kommentar: "Den næste, der lægger albuerne på bordet, ved ikke, hvad der er spildt. Oprydningen er en del af øvelsen."
    },
    {
        billede: "billeder/09_tilbage.svg",
        alt: "En stamflaske med kobber(II)sulfatopløsning har en tragt i halsen. Ved siden af står et bægerglas med en lille rest blå opløsning i bunden og en affaldsdunk til tungmetaller.",
        spoergsmaal: "Der er en lille sjat kobber(II)sulfatopløsning tilbage i bægerglasset. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg hælder resten i affaldsdunken.", rigtig: true },
            { tekst: "Jeg hælder resten tilbage i flasken. Det er jo det samme stof.", rigtig: false },
            { tekst: "Jeg hælder det i vasken. Det er kun en lille smule.", rigtig: false },
            { tekst: "Jeg lader det stå i bægerglasset. Der kommer nok nogen og rydder op.", rigtig: false }
        ],
        kommentar: "Kobbersalte må ikke i vasken, heller ikke en lille rest. Det, der har været ude af flasken, kan være forurenet og hældes ikke tilbage, og ingen ved, hvad et efterladt glas indeholder."
    },
    {
        billede: "billeder/10_hormoner.svg",
        alt: "En af drengene ved bordet overfor holder en konisk kolbe op og aflæser den koncentreret. Hjerter stiger op fra dit bord, hvor hæftet er fyldt med tegnede hjerter.",
        spoergsmaal: "Du er i brunst og får lyst til at kramme en af drengene. Hvordan vil du fortsætte?",
        ekstra: true,
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
        ekstra: true,
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
    },
    {
        billede: "billeder/14_plads.svg",
        alt: "En hylde med mærkede pladser til kemikalieflasker. Pladsen mærket NaOH er tom, og flasken med natriumhydroxid står ude på bordet ved et brugt bægerglas.",
        spoergsmaal: "Du er færdig med natriumhydroxiden. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg stiller flasken tilbage på dens plads på hylden.", rigtig: true },
            { tekst: "Jeg lader den stå. Den næste kan bare lede.", rigtig: false },
            { tekst: "Jeg stiller den, hvor der er plads. En hylde er en hylde.", rigtig: false },
            { tekst: "Jeg gemmer den under mit bord, så jeg ved, hvor den er næste gang.", rigtig: false }
        ],
        kommentar: "Står flasken et andet sted, finder den næste den ikke eller tager den forkerte. Hver flaske har en fast plads."
    },
    {
        billede: "billeder/15_traengsel.svg",
        alt: "Hele holdet trænger sig sammen ved vægtbordet for at se, mens én elev afvejer kobber(II)sulfat. Der er spildt blå krystaller omkring vægten, og en elev yderst med en vejebåd spørger: Må jeg komme til?",
        spoergsmaal: "Din gruppe skal afveje kobber(II)sulfat, og alle vil med op og se. Hvordan vil I fortsætte?",
        ekstra: true,
        svar: [
            { tekst: "Gruppen sender én person op for at afveje.", rigtig: true },
            { tekst: "Resten af gruppen gør klar ved bordet imens.", rigtig: true },
            { tekst: "Hele gruppen går med, så flere kan kontrollere tallet på vægten.", rigtig: false },
            { tekst: "Vi stiller os tæt bag den, der afvejer, så vi kan se over skulderen.", rigtig: false }
        ],
        kommentar: "Når hele holdet står om vægtbordet, bliver der skubbet til den, der afvejer, og stoffet ender ved siden af. Én fra hver gruppe afvejer, mens resten gør klar ved bordet."
    },
    {
        billede: "billeder/16_spild.svg",
        alt: "Der er spildt en klar væske på bordet ved en flaske natriumchlorid og en flaske saltsyre. En køkkenrulle står ubrugt, og en arm i kittel er på vej ned i pytten.",
        spoergsmaal: "Du har spildt lidt natriumchloridopløsning. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg tørrer op med det samme.", rigtig: true },
            { tekst: "Jeg lader det tørre. Det er bare saltvand.", rigtig: false },
            { tekst: "Jeg lægger kladdehæftet over, så ingen sætter albuen i det.", rigtig: false },
            { tekst: "Jeg husker det og siger det til den næste, der bruger bordet.", rigtig: false }
        ],
        kommentar: "Ingen kan se, om en klar væske er saltvand eller saltsyre. Alt spild tørres op med det samme, også det ufarlige."
    },
    {
        billede: "billeder/17_handsker.svg",
        alt: "Øvelsen er ikke gået i gang, og flaskerne er lukkede. Dine hænder har allerede handsker på og holder en mobil, og på bordet ligger en handske pustet op som en ballon med ansigt.",
        spoergsmaal: "Øvelsen er ikke gået i gang endnu. Hvordan vil du fortsætte?",
        svar: [
            { tekst: "Jeg venter med handskerne, til der skal arbejdes med kemikalierne.", rigtig: true },
            { tekst: "Jeg læser vejledningen og koordinerer med mine klassekammerater, hvordan vi bedst kommer i gang.", rigtig: true },
            { tekst: "Jeg beholder handskerne på. Så er mobilen også beskyttet.", rigtig: false },
            { tekst: "Jeg giver ballonen et navn, før den bliver sprængt.", rigtig: false }
        ],
        kommentar: "Handsker, der har rørt mobil, ansigt og dørhåndtag, flytter kemikalier rundt i stedet for at holde dem væk. Tiden før øvelsen bruges på vejledningen og på at fordele opgaverne."
    },
    {
        billede: "billeder/18_hamstre.svg",
        alt: "Tre vægte står side om side på et gruppebord sammen med mange bægerglas og et glas fuldt af spatler. På vægtbordet ved væggen er der kun tomme pladser og løse ledninger, og en anden gruppe spørger efter vægtene.",
        spoergsmaal: "Hvad skal du være særlig opmærksom på?",
        svar: [
            { tekst: "Vægtene er fælles og skal blive på vægtbordet.", rigtig: true },
            { tekst: "Der skal kun hentes det udstyr, gruppen har brug for nu.", rigtig: true },
            { tekst: "Ingenting. Den, der kommer først, maler først.", rigtig: false },
            { tekst: "Ingenting. Vi har tre stoffer, der skal afvejes, så vi skal bruge alle tre.", rigtig: false }
        ],
        kommentar: "Udstyr, der står ubrugt på ét bord, mangler på alle de andre. Vægtene bliver på vægtbordet, og stoffet tages med derhen."
    }
];

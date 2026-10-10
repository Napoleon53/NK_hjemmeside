/* =====================================================================
   data.js - skemaets fire faser, de 16 felter og alle tekster

   Skemaet har en kolonne pr. fase (FASER) og en raekke pr. emne
   (RAEKKER). Hvert felt er en liste af smaa opgaver. Hver opgave laegger
   én linje i feltet, naar den er loest: fed (valgfri, staar med fed
   foerst) og linje.

   Tre slags opgaver:

     skriv    spm har {hul}, hvor ordet mangler.
              svar     ordet, som det vises i hullet
              godtag   det, der taeller som rigtigt (smaa stavefejl
                       taales, se js/svar.js)
              naesten  svar, der er forkerte, men faar deres egen
                       forklaring: { ord: [...], t: "..." }
              hint     foerste hint. Andet hint (bogstav og laengde)
                       laves af sig selv.
              fordi    det, der staar ved Rigtigt

     vaelg    spm og tre eller fire svar. Det rigtige har rigtig: true
              og fordi. De forkerte har fejl: hvorfor svaret ikke
              holder, og et skub videre. Raekkefoelgen blandes.

     forklar  udsagn (valgfrit) og spm. Svaret er én af de tre
              grundforklaringer: rigtig er "f", "k" eller "i", og fejl
              har en tekst til hver af de to andre.

   En linje i feltet maa ikke roebe svaret paa en senere opgave i samme
   felt. Selvtesten tjekker det for de ord, eleven skal skrive.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

NK.Data = {
    TITEL: "Skema over velfærdsstatens udvikling",

    /* Skemaets raekker. navn staar i det faerdige skema, kort i raekken af felter over opgaven. */
    RAEKKER: [
        { id: "tiltag", navn: "Velfærdstiltag", kort: "Velfærdstiltag" },
        { id: "samfund", navn: "Samfundet", kort: "Samfundet" },
        { id: "politik", navn: "Den politiske situation", kort: "Politik" },
        { id: "forklaring", navn: "Kobling til grundforklaringer", kort: "Forklaringer" }
    ],

    FORKLARINGER: [
        { id: "f", bog: "F", navn: "Funktionalistisk" },
        { id: "k", bog: "K", navn: "Konfliktteoretisk" },
        { id: "i", bog: "I", navn: "Politisk-ideologisk" }
    ],

    TEKST: {
        intro1: "Velfærdsstaten blev bygget i fire faser.",
        intro2: "Du udfylder skemaet over faserne, ét felt ad gangen.",
        startNy: "Tryk på en fase for at begynde.",
        startGemt: "Dit skema er gemt på denne computer. Tryk på en fase for at fortsætte.",
        startAlle: "Hele skemaet er udfyldt.",
        faseNr: "{n}. fase",
        felter: "{k} af 4 felter",
        begynd: "Begynd →",
        fortsaet: "Fortsæt →",
        faerdig: "Færdig ✓",
        seSkema: "Se dit skema",

        opgaveNr: "Opgave {k} af {n}",
        spmForklar: "Hvilken grundforklaring er det?",
        skrivStart: "Skriv ordet, der mangler.",
        vaelgStart: "Vælg et svar.",
        forklarStart: "Vælg den grundforklaring, der passer.",
        tom: "Skriv et ord i feltet først.",
        forkert: "Det er ikke ordet, der mangler. Prøv igen, eller tryk Giv hint.",
        staves: "Det staves {svar}.",
        bogstaver: "Ordet begynder med {b} og har {n} bogstaver.",
        tjek: "Tjek",
        hint: "Giv hint",
        hintMere: "Et hint mere",
        vis: "Vis svaret",
        naeste: "Næste →",
        naesteFelt: "Næste felt →",
        faseSlut: "Se fasen samlet →",

        efterFase: "{n}. fase er udfyldt. {k} af {a} rigtige i første forsøg.",
        enFase: "{n}. fase: {k} af {a} rigtige i første forsøg.",
        hele: "Hele skemaet er udfyldt. {k} af {a} rigtige i første forsøg.",
        delvis: "Dit skema: {k} af 4 faser er udfyldt.",
        facit: "Det udfyldte skema.",
        naesteFase: "Næste fase →",
        seHele: "Se hele skemaet →",
        kopier: "Kopiér skemaet",
        kopieret: "Kopieret ✓",
        igen: "Lav fasen igen",
        forfra: "Forfra",
        sikker: "Tryk igen for at slette"
    },

    FASER: [
        /* ============================================================
           1. fase
           ============================================================ */
        {
            id: "1890",
            aar: "Slutningen af 1800-tallet",
            kort: "1800-tallet",
            navn: "Første begrænsede velfærdsordninger",
            felter: [
                /* Velfaerdstiltag */
                [
                    {
                        type: "skriv",
                        spm: "Fra 1892 gav staten tilskud til foreninger, hvor medlemmerne betalte et bidrag og fik hjælp ved sygdom. De hed {hul}.",
                        svar: "sygekasser",
                        godtag: ["sygekasser", "sygekasse", "sygekasserne", "sygekassen", "anerkendte sygekasser"],
                        naesten: [
                            { ord: ["sygeforsikring", "sygeforsikringer", "forsikring", "forsikringer"], t: "Det er en slags forsikring, ja. Foreningernes navn ender på kasser." },
                            { ord: ["fagforening", "fagforeninger"], t: "Fagforeninger forhandler løn. Disse foreninger hjalp ved sygdom, og navnet ender på kasser." },
                            { ord: ["arbejdsløshedskasser", "arbejdsløshedskasse", "akasser", "akasse"], t: "De hjælper ved arbejdsløshed og kom i 1907. Disse kasser hjalp ved sygdom." }
                        ],
                        hint: "Du har læst loven om dem fra 1892. Navnet ender på kasser.",
                        fordi: "Loven om anerkendte sygekasser er fra 1892.",
                        fed: "De første sociale love:",
                        linje: "alderdomsunderstøttelse 1891, sygekasser 1892, ulykkesforsikring 1898 og arbejdsløshedskasser 1907."
                    },
                    {
                        type: "vaelg",
                        spm: "Sygekasserne byggede på hjælp til selvhjælp. Hvad betyder det?",
                        svar: [
                            { t: "Medlemmerne betaler selv et bidrag, og det offentlige giver tilskud", rigtig: true, fordi: "Det er et forsikringsprincip: Man betaler ind og får hjælp, når man bliver syg." },
                            { t: "Det offentlige betaler det hele over skatten", fejl: "Sådan bliver det først langt senere. I 1892 betalte medlemmerne selv noget. Hvad?" },
                            { t: "Familien har pligt til at forsørge den syge", fejl: "Familien var det gamle sikkerhedsnet. I en kasse hjælper medlemmerne hinanden. Hvordan?" },
                            { t: "Den syge får et lån, som skal betales tilbage", fejl: "Hjælpen var ikke et lån. Medlemmerne havde betalt noget på forhånd. Hvad?" }
                        ],
                        fed: "Hjælp til selvhjælp:",
                        linje: "Medlemmerne betaler bidrag, og det offentlige giver tilskud (forsikringsprincip)."
                    },
                    {
                        type: "skriv",
                        spm: "Kommunen vurderede selv, om en gammel var værdig til hjælp, og hvor meget han skulle have. Det kaldes {hul}.",
                        svar: "skønsprincippet",
                        godtag: ["skønsprincippet", "skønsprincip", "skøn", "skønnet", "et skøn"],
                        naesten: [
                            { ord: ["retsprincippet", "retsprincip", "ret", "rets"], t: "Retsprincippet kommer først i 1933. Her vurderer kommunen fra sag til sag." },
                            { ord: ["universelle", "universel", "universelle princip", "det universelle princip"], t: "Det universelle princip kommer først efter 1950. Her vurderer kommunen fra sag til sag." },
                            { ord: ["vurdering", "vurderingen", "vurderingsprincippet"], t: "Rigtig tanke. Fagordet bruger et andet ord for at vurdere: at skønne." }
                        ],
                        hint: "At vurdere kaldes også at skønne. Princippet har navn efter det.",
                        fordi: "Hjælpen var ikke en ret. Kommunen skønnede fra sag til sag.",
                        fed: "Skønsprincip:",
                        linje: "Kommunen vurderer, hvem der er værdig til hjælp, og hvor meget."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad mistede den, der fik fattighjælp?",
                        svar: [
                            { t: "Borgerlige rettigheder, fx stemmeretten og retten til at gifte sig", rigtig: true, fordi: "Fattigdom blev set som selvforskyldt. Derfor kostede hjælpen rettigheder." },
                            { t: "Retten til at tage arbejde", fejl: "De fattige skulle netop arbejde. De mistede noget, andre borgere havde, fx ved valg." },
                            { t: "Sin plads i sygekassen", fejl: "Sygekassen var for dem, der kunne betale bidraget. De fattige mistede noget, andre borgere havde." },
                            { t: "Ingenting, hjælpen var en ret", fejl: "Hjælp som en ret kommer først i 1933. I 1800-tallet havde fattighjælpen en høj pris." }
                        ],
                        fed: "Fattighjælp",
                        linje: "koster de borgerlige rettigheder, fx stemmeretten og retten til at gifte sig."
                    }
                ],
                /* Samfundet */
                [
                    {
                        type: "skriv",
                        spm: "Flere og flere arbejder på fabrik, og færre arbejder i landbruget. Den udvikling kaldes {hul}.",
                        svar: "industrialisering",
                        godtag: ["industrialisering", "industrialiseringen", "industrialisation", "den industrielle revolution", "industrielle revolution", "industriel revolution"],
                        naesten: [
                            { ord: ["urbanisering", "urbaniseringen"], t: "Urbanisering er flytningen til byerne. Her er det arbejdet på fabrik, der er nyt." },
                            { ord: ["industri", "industrien"], t: "Næsten. Udviklingen hen imod mere industri har et længere navn." }
                        ],
                        hint: "Ordet er lavet af industri og ender på -isering.",
                        fordi: "Fabrikkerne i byerne fik brug for mange arbejdere.",
                        fed: "Industrialisering:",
                        linje: "Flere arbejder på fabrik, færre i landbruget."
                    },
                    {
                        type: "skriv",
                        spm: "Folk flytter fra landet ind til byerne. Den udvikling kaldes {hul}.",
                        svar: "urbanisering",
                        godtag: ["urbanisering", "urbaniseringen", "urbanisation"],
                        naesten: [
                            { ord: ["industrialisering", "industrialiseringen"], t: "Industrialisering er fabrikkerne. Her er det flytningen til byerne." },
                            { ord: ["vandring fra land til by", "fra land til by", "afvandring", "afvandringen"], t: "Rigtig tanke. Fagordet kommer af urban, der betyder noget med by." }
                        ],
                        hint: "Fagordet kommer af urban, der betyder noget med by.",
                        fordi: "København og provinsbyerne voksede hurtigt.",
                        fed: "Urbanisering:",
                        linje: "Folk flytter fra landet til byerne."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvilken vej går det for de tre slags erhverv?",
                        svar: [
                            { t: "De primære falder. De sekundære og de tertiære vokser", rigtig: true, fordi: "Færre lever af landbrug. Flere lever af industri, handel og service." },
                            { t: "De primære vokser. De sekundære og de tertiære falder", fejl: "Det er omvendt. De primære erhverv er landbrug og fiskeri. Hvor flytter folk hen?" },
                            { t: "Alle tre vokser lige meget", fejl: "Når folk forlader landet, må ét af dem falde. De primære erhverv er landbrug og fiskeri." }
                        ],
                        fed: "Erhverv:",
                        linje: "De primære falder. De sekundære og de tertiære vokser."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvordan levede arbejderne i byerne og på landet?",
                        svar: [
                            { t: "Usselt: lav løn, trange boliger og ingen sikkerhed ved sygdom og alderdom", rigtig: true, fordi: "Uden løn var der kun fattighjælpen tilbage." },
                            { t: "Godt: fast løn, ferie og pension", fejl: "Ferie og pension til arbejdere kommer først i 1900-tallet. Hvad skete der, når en arbejder blev syg?" },
                            { t: "Som gårdejerne: med egen jord og egen bolig", fejl: "Arbejderne ejede hverken jord eller bolig. De levede af lønnen fra uge til uge." }
                        ],
                        fed: "Usle levevilkår",
                        linje: "for arbejderne i byerne og på landet."
                    }
                ],
                /* Den politiske situation */
                [
                    {
                        type: "skriv",
                        spm: "Alle regeringer frem til 1901 kom fra overklassens parti. Det hed {hul}.",
                        svar: "Højre",
                        godtag: ["højre", "partiet højre", "højrepartiet"],
                        naesten: [
                            { ord: ["venstre", "partiet venstre"], t: "Venstre var landbefolkningens parti og havde ikke regeringen. Hvilket parti var overklassens?" },
                            { ord: ["socialdemokratiet", "socialdemokraterne", "s"], t: "Socialdemokratiet fik først regeringsmagten i 1924. Hvilket parti var overklassens?" },
                            { ord: ["konservative", "de konservative", "det konservative folkeparti", "konservative folkeparti", "k"], t: "Næsten. Det Konservative Folkeparti afløste partiet under Første Verdenskrig. Hvad hed det før?" }
                        ],
                        hint: "Det var godsejernes og borgerskabets parti. Navnet er det modsatte af Venstre.",
                        fordi: "Estrup ledede Højres regering fra 1875 til 1894.",
                        fed: "Højre",
                        linje: "har regeringsmagten til 1901."
                    },
                    {
                        type: "vaelg",
                        spm: "To partier dominerede. Hvem stemte på Højre, og hvem stemte på Venstre?",
                        svar: [
                            { t: "Højre: godsejere og borgerskab. Venstre: de brede lag på landet", rigtig: true, fordi: "Højre var overklassens parti. Venstre var gårdmændenes." },
                            { t: "Højre: gårdmændene. Venstre: arbejderne i byerne", fejl: "Arbejderne fik deres eget parti, Socialdemokratiet. Venstre var landbefolkningens parti." },
                            { t: "Højre: arbejderne. Venstre: godsejerne", fejl: "Det er byttet om. Godsejerne og borgerskabet var overklassen. Hvilket parti var deres?" }
                        ],
                        fed: "Partier:",
                        linje: "Højre (godsejere og borgerskab) over for Venstre (de brede lag på landet)."
                    },
                    {
                        type: "vaelg",
                        spm: "Venstre havde flertal i Folketinget. Hvorfor sad Højre alligevel i regering?",
                        svar: [
                            { t: "Kongen udnævnte regeringen", rigtig: true, fordi: "Kongen valgte sine ministre uden hensyn til flertallet i Folketinget." },
                            { t: "Højre fik flest stemmer ved valgene", fejl: "Venstre fik flest stemmer og havde flertallet i Folketinget. Hvem valgte ministrene?" },
                            { t: "Venstre ville ikke have regeringsmagten", fejl: "Venstre kæmpede for den i 30 år. Hvem valgte ministrene?" }
                        ],
                        linje: "Kongen udnævner regeringen, selv om Venstre har flertal i Folketinget."
                    },
                    {
                        type: "skriv",
                        spm: "I 1901 gav kongen efter og udnævnte en regering fra Venstre. Det kaldes {hul}.",
                        svar: "systemskiftet",
                        godtag: ["systemskiftet", "systemskifte", "systemskiftet 1901", "systemskiftet i 1901"],
                        naesten: [
                            { ord: ["parlamentarisme", "parlamentarismen"], t: "Parlamentarisme er princippet, der blev indført. Selve begivenheden i 1901 har et andet navn." },
                            { ord: ["grundloven", "junigrundloven"], t: "Grundloven er fra 1849. Begivenheden i 1901 var et skifte." },
                            { ord: ["regeringsskifte", "regeringsskiftet", "magtskifte", "magtskiftet"], t: "Næsten. Det var mere end et regeringsskifte: Hele det politiske system skiftede." }
                        ],
                        hint: "Hele det politiske system skiftede. Sæt de to ord sammen.",
                        fordi: "Fra 1901 afgør flertallet i Folketinget, hvem der regerer.",
                        fed: "Systemskiftet 1901:",
                        linje: "Flertallet i Folketinget afgør nu, hvem der regerer."
                    }
                ],
                /* Kobling til grundforklaringer */
                [
                    {
                        type: "forklar",
                        udsagn: "Folk flytter til byen og mister sikkerhedsnettet fra landsbyen og lavene. Staten må træde til med offentlige ordninger.",
                        rigtig: "f",
                        fordi: "Samfundet ændrer sig, så der opstår et nyt behov. Det er den funktionalistiske forklaring.",
                        fejl: {
                            k: "Konfliktteorien handler om frygt for uro. Her er det samfundet, der ændrer sig, så et behov opstår.",
                            i: "Den ideologiske forklaring handler om idéer og partier. Her er det samfundet, der ændrer sig."
                        },
                        fed: "Funktionalistisk:",
                        linje: "Industrialisering og urbanisering fjerner det gamle sikkerhedsnet (landsby og lav). Staten må træde til."
                    },
                    {
                        type: "forklar",
                        udsagn: "Overklassen og Højre frygter social uro og revolution. Sociale ordninger skal dæmpe arbejdernes utilfredshed.",
                        rigtig: "k",
                        fordi: "Hjælpen skal holde ro i samfundet. Det er den konfliktteoretiske forklaring.",
                        fejl: {
                            f: "Den funktionalistiske forklaring handler om nye behov. Her handler det om frygt for arbejderne.",
                            i: "Højre gør det ikke af overbevisning, men af frygt. Hvilken forklaring handler om at undgå uro?"
                        },
                        fed: "Konfliktteoretisk:",
                        linje: "Overklassen (Højre) frygter uro og revolution. Hjælpen skal dæmpe utilfredsheden."
                    },
                    {
                        type: "forklar",
                        spm: "Hvilken grundforklaring står svagest i denne fase?",
                        rigtig: "i",
                        fordi: "Socialdemokratiet havde ikke magten, og liberalismen var imod hjælp fra staten.",
                        fejl: {
                            f: "Den står stærkt: Industrialisering og urbanisering skabte behovet. Hvilken har du ikke brugt?",
                            k: "Den står stærkt: Overklassen frygtede uro. Hvilken har du ikke brugt?"
                        },
                        fed: "Politisk-ideologisk:",
                        linje: "Står svagt. Socialdemokratiet har ikke magten, og liberalismen er imod hjælp fra staten."
                    }
                ]
            ]
        },

        /* ============================================================
           2. fase
           ============================================================ */
        {
            id: "1930",
            aar: "1930'erne",
            kort: "1930'erne",
            navn: "Socialreformens epoke",
            felter: [
                /* Velfaerdstiltag */
                [
                    {
                        type: "skriv",
                        spm: "I 1933 blev de mange sociale love samlet i fire store love. Det kaldes {hul}.",
                        svar: "Socialreformen",
                        godtag: ["socialreformen", "socialreform", "socialreformen 1933", "socialreformen i 1933", "socialreformen af 1933", "steinckes socialreform"],
                        naesten: [
                            { ord: ["kanslergadeforliget", "kanslergadeforlig", "kanslergade"], t: "Det var aftalen mellem partierne. De sociale love, der fulgte af aftalen, har deres eget navn." },
                            { ord: ["reform", "reformen"], t: "Ja, en reform. Hvilket område handlede den om?" }
                        ],
                        hint: "Det var en reform af det sociale område. Sæt de to ord sammen.",
                        fordi: "Socialminister K.K. Steincke stod bag reformen.",
                        fed: "Socialreformen 1933:",
                        linje: "folkeforsikring, ulykkesforsikring, arbejdsløshedsforsikring og offentlig forsorg."
                    },
                    {
                        type: "skriv",
                        spm: "Nu havde man krav på hjælp efter faste takster, når lovens betingelser var opfyldt. Skønnet blev afløst af {hul}.",
                        svar: "retsprincippet",
                        godtag: ["retsprincippet", "retsprincip", "ret", "rets", "retten", "en ret", "rettighed", "rettigheder", "rettighedsprincippet", "rettighedsprincip"],
                        naesten: [
                            { ord: ["skønsprincippet", "skønsprincip", "skøn", "skønnet"], t: "Skønnet er det, der forsvinder. Hvad har man nu til hjælpen?" },
                            { ord: ["universelle", "universel", "det universelle princip", "universelle princip"], t: "Det universelle princip kommer først efter 1950. I 1933 får man krav på hjælpen." },
                            { ord: ["lov", "loven", "lovprincippet", "faste takster", "takster"], t: "Næsten. Når loven giver en krav på noget, har man en ..." }
                        ],
                        hint: "Når man har krav på noget, har man en ... til det.",
                        fordi: "Hjælpen blev en ret, ikke en almisse.",
                        fed: "Retsprincip:",
                        linje: "Man har ret til hjælp efter faste takster, når lovens betingelser er opfyldt."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad skete der med tabet af borgerlige rettigheder?",
                        svar: [
                            { t: "Det forsvandt for de fleste, der fik hjælp", rigtig: true, fordi: "Kun fattighjælpen, det yderste trin, kostede stadig rettigheder." },
                            { t: "Det blev udvidet til alle, der fik hjælp", fejl: "Det gik den anden vej. Hjælpen blev en ret. Hvad sker der så med straffen for at få den?" },
                            { t: "Det fortsatte som før", fejl: "Reformen ændrede netop det. Hjælpen blev en ret. Hvad sker der så med straffen for at få den?" }
                        ],
                        fed: "Tabet af borgerlige rettigheder",
                        linje: "forsvinder stort set."
                    }
                ],
                /* Samfundet */
                [
                    {
                        type: "skriv",
                        spm: "To udviklinger fra 1800-tallet fortsætter: industrialiseringen og flytningen til byerne. Flytningen kaldes {hul}.",
                        svar: "urbanisering",
                        godtag: ["urbanisering", "urbaniseringen", "urbanisation"],
                        naesten: [
                            { ord: ["industrialisering", "industrialiseringen"], t: "Industrialiseringen er den anden af de to. Hvad hedder flytningen til byerne?" }
                        ],
                        hint: "Du har skrevet ordet før. Det kommer af urban, der betyder noget med by.",
                        fordi: "Byerne voksede videre gennem 1930'erne.",
                        linje: "Industrialiseringen og urbaniseringen fortsætter."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad satte den økonomiske verdenskrise i gang?",
                        svar: [
                            { t: "Krakket på børsen i Wall Street i 1929", rigtig: true, fordi: "Krisen bredte sig fra USA og nåede Danmark i 1930." },
                            { t: "Olien blev fire gange så dyr", fejl: "Det skete i 1973. Krisen i 1930'erne begyndte på en børs i USA." },
                            { t: "Første Verdenskrig brød ud", fejl: "Første Verdenskrig var 1914-1918. Krisen i 1930'erne begyndte på en børs i USA." }
                        ],
                        fed: "Verdenskrisen:",
                        linje: "Krakket i Wall Street 1929 giver økonomisk krise, også i Danmark."
                    },
                    {
                        type: "skriv",
                        spm: "I januar 1933 var 43,5 % af de forsikrede arbejdere uden arbejde. Krisens største problem var {hul}.",
                        svar: "arbejdsløshed",
                        godtag: ["arbejdsløshed", "arbejdsløsheden", "arbejdsløse", "arbejdsløs", "ledighed", "ledigheden", "massearbejdsløshed", "massearbejdsløsheden"],
                        naesten: [
                            { ord: ["fattigdom", "fattigdommen"], t: "Fattigdommen fulgte med. Hvad kalder man det, når folk ikke kan få arbejde?" }
                        ],
                        hint: "Hvad kalder man det, når folk ikke kan få arbejde?",
                        fordi: "I gennemsnit var 32 % af de forsikrede ledige i 1932.",
                        fed: "Tårnhøj arbejdsløshed:",
                        linje: "43,5 % af de forsikrede arbejdere i januar 1933."
                    }
                ],
                /* Den politiske situation */
                [
                    {
                        type: "vaelg",
                        spm: "Hvilke fire partier dominerede dansk politik?",
                        svar: [
                            { t: "Socialdemokratiet, Det Radikale Venstre, Venstre og Det Konservative Folkeparti", rigtig: true, fordi: "De fire gamle partier, forkortet S, R, V og K." },
                            { t: "Socialdemokratiet, Socialistisk Folkeparti, Venstre og Det Konservative Folkeparti", fejl: "SF blev først stiftet i 1959. Hvilket parti regerede sammen med Socialdemokratiet?" },
                            { t: "Højre, Venstre, Socialdemokratiet og Fremskridtspartiet", fejl: "Højre var blevet afløst af Det Konservative Folkeparti, og Fremskridtspartiet kom først i 1973." }
                        ],
                        fed: "Firepartisystemet:",
                        linje: "S, R, V og K. Socialdemokratiet er størst."
                    },
                    {
                        type: "vaelg",
                        spm: "Partierne var klassepartier. Hvad betyder det?",
                        svar: [
                            { t: "Hvert parti havde sin samfundsklasse som vælgere, fx arbejdere eller gårdmænd", rigtig: true, fordi: "Arbejdere stemte på S, gårdmænd på V, husmænd på R og borgerskabet på K." },
                            { t: "Partierne var delt i en første og en anden klasse", fejl: "Klasse betyder her samfundsklasse, fx arbejderklassen. Hvem stemte på hvem?" },
                            { t: "Alle samfundsklasser stemte nogenlunde ens", fejl: "Det er det modsatte. Vælgerne stemte efter deres samfundsklasse." }
                        ],
                        fed: "Klassepartier:",
                        linje: "Hvert parti har sin samfundsklasse som vælgere."
                    },
                    {
                        type: "skriv",
                        spm: "Fra 1929 regerede Socialdemokratiet sammen med Det Radikale Venstre. Statsministeren hed Thorvald {hul}.",
                        svar: "Stauning",
                        godtag: ["stauning", "thorvald stauning", "staunings"],
                        naesten: [
                            { ord: ["steincke", "kk steincke"], t: "K.K. Steincke var socialminister. Statsministeren talte om verdenskrisen i kilden fra 1931." },
                            { ord: ["hitler"], t: "Hitler fik magten i Tyskland i 1933. Den danske statsminister talte om verdenskrisen i kilden fra 1931." }
                        ],
                        hint: "Du har læst en kilde fra 1931, hvor han taler om verdenskrisen.",
                        fordi: "Stauning var statsminister fra 1929 til 1942.",
                        fed: "Stauning",
                        linje: "leder en regering af Socialdemokratiet og Det Radikale Venstre 1929-1940."
                    },
                    {
                        type: "skriv",
                        spm: "I januar 1933 lavede regeringen og Venstre et stort forlig hjemme hos Stauning. Det hedder {hul}.",
                        svar: "Kanslergadeforliget",
                        godtag: ["kanslergadeforliget", "kanslergadeforlig", "kanslergade", "kanslergadeforliget 1933", "kanslergadeforliget i 1933", "kanslergadeforliget af 1933"],
                        naesten: [
                            { ord: ["socialreformen", "socialreform"], t: "Socialreformen var en del af forliget. Forliget har navn efter gaden, hvor Stauning boede." }
                        ],
                        hint: "Forliget har navn efter gaden på Østerbro, hvor Stauning boede.",
                        fordi: "Forliget gav kriseindgreb med det samme og en socialreform bagefter.",
                        fed: "Kanslergadeforliget 1933",
                        linje: "(S, R og V): kriseindgreb og socialreform."
                    }
                ],
                /* Kobling til grundforklaringer */
                [
                    {
                        type: "forklar",
                        udsagn: "Krisen gør mange arbejdsløse. De har brug for offentlig hjælp, og staten skal sætte gang i økonomien igen.",
                        rigtig: "f",
                        fordi: "Krisen skaber et behov, som staten må løse. Det er den funktionalistiske forklaring.",
                        fejl: {
                            k: "Her står intet om frygt for uro. Der står, at krisen skaber et behov for hjælp.",
                            i: "Her står intet om partiers idéer. Der står, at krisen skaber et behov for hjælp."
                        },
                        fed: "Funktionalistisk:",
                        linje: "Krise og arbejdsløshed giver behov for offentlig hjælp og for at sætte gang i økonomien (Keynes)."
                    },
                    {
                        type: "forklar",
                        udsagn: "Politikerne frygter, at de arbejdsløse vender sig mod kommunismen eller nazismen. Hjælpen skal dæmpe uroen.",
                        rigtig: "k",
                        fordi: "Hjælpen skal holde ro i samfundet. Samme dag som forliget fik Hitler magten i Tyskland.",
                        fejl: {
                            f: "Behovet er der også, men udsagnet handler om frygt. Hvilken forklaring handler om at undgå uro?",
                            i: "Udsagnet handler ikke om, hvad partierne tror på, men om hvad de frygter."
                        },
                        fed: "Konfliktteoretisk:",
                        linje: "Frygt for kommunisme og nazisme. Hjælpen skal dæmpe den sociale uro."
                    },
                    {
                        type: "forklar",
                        udsagn: "Socialdemokratiet er det største parti. Det vil have bedre levevilkår for arbejderne og mere lighed.",
                        rigtig: "i",
                        fordi: "Partiets idéer former lovene. Det er den politisk-ideologiske forklaring.",
                        fejl: {
                            f: "Udsagnet handler om, hvad et parti vil, ikke om et behov, der opstår af sig selv.",
                            k: "Her er ingen frygt for uro. Udsagnet handler om, hvad et parti vil."
                        },
                        fed: "Politisk-ideologisk:",
                        linje: "Socialdemokratiet er størst og vil have bedre levevilkår for arbejderne og mere lighed."
                    }
                ]
            ]
        },

        /* ============================================================
           3. fase
           ============================================================ */
        {
            id: "1960",
            aar: "Slutningen af 1950'erne til begyndelsen af 1970'erne",
            kort: "1960'erne",
            navn: "Den gyldne velfærdsperiode",
            felter: [
                /* Velfaerdstiltag */
                [
                    {
                        type: "skriv",
                        spm: "Fra 1957 fik alle over 67 år et grundbeløb fra staten, uanset hvor mange penge de havde. Ydelsen hedder {hul}.",
                        svar: "folkepension",
                        godtag: ["folkepension", "folkepensionen", "folkepensionens grundbeløb"],
                        naesten: [
                            { ord: ["alderdomsunderstøttelse", "alderdomsunderstøttelsen"], t: "Det var ordningen fra 1891 til de værdigt trængende. Den nye pension går til hele folket." },
                            { ord: ["pension", "pensionen", "alderspension", "aldersrente"], t: "Ja, en pension. Den går til hele folket. Hvad hedder den så?" },
                            { ord: ["efterløn", "efterlønnen"], t: "Efterlønnen kom først i 1979. Denne pension går til hele folket." }
                        ],
                        hint: "Det er en pension til hele folket.",
                        fordi: "Loven blev vedtaget i 1956 og trådte i kraft i 1957.",
                        fed: "Nye ydelser:",
                        linje: "folkepension (1957), boligstøtte og SU."
                    },
                    {
                        type: "skriv",
                        spm: "Velfærden gælder nu alle borgere, rig som fattig. Det kaldes det {hul} princip.",
                        svar: "universelle",
                        godtag: ["universelle", "universel", "universelt", "universale", "universelle princip", "det universelle princip", "universalisme"],
                        naesten: [
                            { ord: ["retsprincip", "retsprincippet", "rets", "ret"], t: "Retsprincippet kom i 1933. Det nye er, at ydelsen går til alle. Ordet begynder med u." },
                            { ord: ["residuale", "residual"], t: "Den residuale model hjælper kun de dårligst stillede. Her får alle. Ordet begynder med u." },
                            { ord: ["lighed", "ligheds", "lige"], t: "Lighed er målet. Princippet har navn efter, at det gælder alle. Ordet begynder med u." }
                        ],
                        hint: "Folkepensionen kaldes en ... ydelse, fordi den går til alle.",
                        fordi: "Alle får ydelsen, og alle betaler til den over skatten.",
                        fed: "Det universelle princip",
                        linje: "slår igennem: velfærd til alle, rig som fattig."
                    },
                    {
                        type: "vaelg",
                        spm: "Det offentlige gav også mere service. Hvilken række hører til denne fase?",
                        svar: [
                            { t: "Uddannelse, sundhed, børnepasning og veje", rigtig: true, fordi: "Kommunerne byggede skoler, børnehaver og plejehjem." },
                            { t: "Fattiggårde, sygekasser og alderdomsunderstøttelse", fejl: "Det er ordningerne fra slutningen af 1800-tallet. Hvad byggede kommunerne i 1960'erne?" },
                            { t: "Privatisering og udlicitering af offentlige opgaver", fejl: "Det hører til 1980'erne, hvor der skulle spares. I 1960'erne byggede det offentlige ud." }
                        ],
                        fed: "Mere offentlig service:",
                        linje: "uddannelse, sundhed, børnepasning og infrastruktur."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad skete der med antallet af offentligt ansatte og med skattetrykket?",
                        svar: [
                            { t: "Begge steg", rigtig: true, fordi: "Mere velfærd kræver flere ansatte, og de bliver betalt over skatten." },
                            { t: "Flere ansatte, men lavere skat", fejl: "De ansatte skal have løn. Hvor kommer pengene til den fra?" },
                            { t: "Færre ansatte og lavere skat", fejl: "Det offentlige byggede ud. Skoler og børnehaver kræver flere ansatte." }
                        ],
                        linje: "Flere offentligt ansatte og et højere skattetryk."
                    }
                ],
                /* Samfundet */
                [
                    {
                        type: "skriv",
                        spm: "Fra 1958 var der vækst og arbejde til næsten alle. Sådan en periode kaldes en {hul}.",
                        svar: "højkonjunktur",
                        godtag: ["højkonjunktur", "højkonjunkturen"],
                        naesten: [
                            { ord: ["opsving", "opsvinget", "opgang", "opgangstid", "opgangstider", "vækst", "vækstperiode", "gode tider"], t: "Ja, det var et opsving. Fagordet er det modsatte af lavkonjunktur." },
                            { ord: ["lavkonjunktur", "lavkonjunkturen"], t: "Lavkonjunktur er dårlige tider. Her er det modsatte." },
                            { ord: ["konjunktur", "konjunkturen"], t: "Næsten. Der mangler et ord foran: Var konjunkturen høj eller lav?" }
                        ],
                        hint: "Det modsatte af lavkonjunktur.",
                        fordi: "Højkonjunkturen varede til 1973.",
                        fed: "Højkonjunktur 1958-1973:",
                        linje: "vækst og arbejde til næsten alle."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvilken vej går det for de tre slags erhverv?",
                        svar: [
                            { t: "De primære falder kraftigt. De sekundære vokser, og de tertiære vokser kraftigt", rigtig: true, fordi: "Landbruget skrumper. Industrien vokser, og servicefagene vokser mest." },
                            { t: "De primære vokser. De sekundære og de tertiære falder", fejl: "Landbruget er et primært erhverv, og det skrumper hele vejen. Hvad vokser så?" },
                            { t: "De sekundære falder kraftigt. De primære og de tertiære vokser", fejl: "Industrien er et sekundært erhverv, og den vokser stadig i 1960'erne. Hvad skrumper?" }
                        ],
                        fed: "Erhverv:",
                        linje: "De primære falder kraftigt. De sekundære vokser (anden industrielle revolution), og de tertiære vokser kraftigt."
                    },
                    {
                        type: "skriv",
                        spm: "Der manglede arbejdskraft. En ny stor gruppe kom ud på arbejdsmarkedet: de gifte {hul}.",
                        svar: "kvinder",
                        godtag: ["kvinder", "kvinderne", "gifte kvinder", "de gifte kvinder", "husmødre", "husmødrene", "koner", "konerne", "hustruer", "hustruerne"],
                        naesten: [
                            { ord: ["mænd", "mændene"], t: "De gifte mænd arbejdede i forvejen. Hvem gik hjemme?" },
                            { ord: ["indvandrere", "gæstearbejdere", "fremmedarbejdere"], t: "Gæstearbejderne kom også, sidst i 1960'erne. Men her står: de gifte ..." }
                        ],
                        hint: "Før gik de hjemme som husmødre.",
                        fordi: "I 1960'erne havde 30 % af de gifte kvinder arbejde uden for hjemmet, og tallet steg.",
                        linje: "De gifte kvinder kommer ud på arbejdsmarkedet."
                    }
                ],
                /* Den politiske situation */
                [
                    {
                        type: "skriv",
                        spm: "I 1960 kom et femte parti i Folketinget. Det ligger til venstre for Socialdemokratiet og hedder Socialistisk {hul}.",
                        svar: "Folkeparti",
                        godtag: ["folkeparti", "folkepartiet", "socialistisk folkeparti", "sf"],
                        naesten: [
                            { ord: ["arbejderparti", "arbejderpartiet"], t: "Ordet arbejder er ikke med i navnet. Partiet forkortes SF. Hvad står F for?" },
                            { ord: ["venstre", "venstreparti"], t: "Venstresocialisterne kom først i 1967. Partiet fra 1960 forkortes SF. Hvad står F for?" },
                            { ord: ["parti", "partiet"], t: "Næsten. Partiet forkortes SF. Hvad står F for?" }
                        ],
                        hint: "Partiet forkortes SF. Hvad står F for?",
                        fordi: "SF blev stiftet af Aksel Larsen i 1959.",
                        fed: "Firepartisystemet",
                        linje: "(S, R, V og K) får selskab af SF fra 1960. Partierne er stadig klassepartier."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvilket parti havde regeringsmagten det meste af tiden?",
                        svar: [
                            { t: "Socialdemokratiet", rigtig: true, fordi: "Partiet var størst og regerede fra 1953 til 1968 og igen fra 1971." },
                            { t: "Venstre", fejl: "Venstre sad kun med i VKR-regeringen 1968-1971. Hvilket parti var størst?" },
                            { t: "Det Konservative Folkeparti", fejl: "De Konservative sad kun med i VKR-regeringen 1968-1971. Hvilket parti var størst?" },
                            { t: "Socialistisk Folkeparti", fejl: "SF sad ikke i regering i denne fase. Hvilket parti var størst?" }
                        ],
                        fed: "Socialdemokratiet",
                        linje: "er størst og har regeringsmagten det meste af tiden."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvordan så de borgerlige partier på velfærdsstaten?",
                        svar: [
                            { t: "De bakkede den op og byggede selv videre på den", rigtig: true, fordi: "Under VKR-regeringen 1968-1971 voksede den offentlige sektor videre." },
                            { t: "De ville afskaffe den", fejl: "Det krav kommer først med Fremskridtspartiet i 1973. Hvad gjorde VKR-regeringen 1968-1971?" },
                            { t: "De stemte imod alle sociale love", fejl: "Folkepensionen blev vedtaget af et bredt flertal. Hvad gjorde VKR-regeringen 1968-1971?" }
                        ],
                        fed: "Bred opbakning",
                        linje: "til velfærdsstaten, også fra de borgerlige (VKR-regeringen 1968-1971)."
                    }
                ],
                /* Kobling til grundforklaringer */
                [
                    {
                        type: "forklar",
                        udsagn: "Kvinderne går på arbejde, så der bliver brug for børnehaver. Industrien har brug for veje og uddannede folk.",
                        rigtig: "f",
                        fordi: "Nye behov i samfundet giver nye offentlige opgaver. Det er den funktionalistiske forklaring.",
                        fejl: {
                            k: "Ingen frygter uro her. Samfundet ændrer sig, og der opstår nye behov.",
                            i: "Udsagnet nævner ingen partier eller idéer. Samfundet ændrer sig, og der opstår nye behov."
                        },
                        fed: "Funktionalistisk:",
                        linje: "Industrien kræver infrastruktur, og kvinderne på arbejdsmarkedet kræver børnepasning."
                    },
                    {
                        type: "forklar",
                        udsagn: "Socialdemokratiet regerer og vil have bedre levevilkår og mere lighed. De andre partier bakker op om velfærdsstaten.",
                        rigtig: "i",
                        fordi: "Partiernes idéer og den brede enighed driver udbygningen.",
                        fejl: {
                            f: "Udsagnet handler om, hvad partierne vil, ikke om behov, der opstår af sig selv.",
                            k: "Her er enighed, ikke frygt. Udsagnet handler om, hvad partierne vil."
                        },
                        fed: "Politisk-ideologisk:",
                        linje: "Socialdemokratiet vil have bedre levevilkår og mere lighed, og der er bred opbakning (også under VKR)."
                    },
                    {
                        type: "forklar",
                        spm: "Hvilken grundforklaring står svagest i denne fase?",
                        rigtig: "k",
                        fordi: "Der var arbejde til næsten alle, så ingen frygtede uro eller revolution.",
                        fejl: {
                            f: "Den står stærkt: Kvinderne på arbejdsmarkedet gav behov for børnepasning. Hvilken har du ikke brugt?",
                            i: "Den står stærkt: Socialdemokratiet regerede, og der var bred opbakning. Hvilken har du ikke brugt?"
                        },
                        fed: "Konfliktteoretisk:",
                        linje: "Står svagt. Der er gode tider og ingen frygt for uro."
                    }
                ]
            ]
        },

        /* ============================================================
           4. fase
           ============================================================ */
        {
            id: "1973",
            aar: "Ca. 1973-1993",
            kort: "1973-1993",
            navn: "Velfærdsstaten under pres",
            felter: [
                /* Velfaerdstiltag */
                [
                    {
                        type: "vaelg",
                        spm: "Hvad sker der med udbygningen af velfærdsstaten?",
                        svar: [
                            { t: "Den bremses, og der spares nogle steder og i perioder", rigtig: true, fordi: "Velfærdsstaten bliver ikke afskaffet, men væksten bremses." },
                            { t: "Velfærdsstaten bliver afskaffet", fejl: "Folkepension, skoler og sygehuse findes stadig. Hvad sker der med væksten?" },
                            { t: "Den vokser hurtigere end i 1960'erne", fejl: "Staten mangler penge efter 1973. Hvad sker der så med væksten?" }
                        ],
                        fed: "Opbremsning:",
                        linje: "Der spares nogle steder og i perioder, og den offentlige sektor skal være mere effektiv."
                    },
                    {
                        type: "skriv",
                        spm: "Staten sælger offentlige virksomheder til private ejere. Det kaldes {hul}.",
                        svar: "privatisering",
                        godtag: ["privatisering", "privatiseringen", "privatiseringer", "privatisere", "at privatisere"],
                        naesten: [
                            { ord: ["udlicitering", "udliciteringen"], t: "Ved udlicitering har det offentlige stadig opgaven. Her bliver virksomheden solgt og bliver privat." }
                        ],
                        hint: "Virksomheden bliver privat. Ordet er lavet af det og ender på -isering.",
                        fordi: "Idéen kom fra Thatchers England og Reagans USA.",
                        fed: "Privatisering:",
                        linje: "Offentlige virksomheder sælges til private."
                    },
                    {
                        type: "skriv",
                        spm: "En kommune betaler et privat firma for at løse en offentlig opgave, fx rengøring. Det kaldes {hul}.",
                        svar: "udlicitering",
                        godtag: ["udlicitering", "udliciteringen", "udliciteringer", "udlicitere", "at udlicitere", "outsourcing"],
                        naesten: [
                            { ord: ["privatisering", "privatiseringen"], t: "Ved privatisering sælges virksomheden. Her betaler kommunen stadig, men en anden gør arbejdet." }
                        ],
                        hint: "Opgaven sendes i udbud, også kaldet licitation. Ordet begynder med ud.",
                        fordi: "Det offentlige betaler stadig, men private gør arbejdet.",
                        fed: "Udlicitering:",
                        linje: "Private firmaer løser offentlige opgaver mod betaling."
                    }
                ],
                /* Samfundet */
                [
                    {
                        type: "skriv",
                        spm: "I efteråret 1973 blev olien fire gange så dyr på få måneder. Det kaldes {hul}.",
                        svar: "oliekrisen",
                        godtag: ["oliekrisen", "oliekrise", "energikrisen", "energikrise", "den første oliekrise", "første oliekrise", "oliekrisen 1973", "oliekrisen i 1973"],
                        naesten: [
                            { ord: ["inflation", "inflationen"], t: "Inflationen fulgte efter. Selve krisen har navn efter det, der blev dyrt." },
                            { ord: ["krise", "krisen", "økonomisk krise"], t: "Ja, en krise. Den har navn efter det, der blev dyrt." }
                        ],
                        hint: "Det var en krise. Den har navn efter det, der blev dyrt.",
                        fordi: "En ny oliekrise fulgte i 1979.",
                        fed: "Oliekrisen 1973",
                        linje: "(og igen i 1979): Olien bliver fire gange så dyr."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad førte oliekrisen til i Danmark?",
                        svar: [
                            { t: "Lavkonjunktur og en arbejdsløshed på over 10 %", rigtig: true, fordi: "Dyr energi gav dyrere varer, mindre salg og færre job." },
                            { t: "Højkonjunktur og mangel på arbejdskraft", fejl: "Sådan var 1960'erne. Dyr olie gør det dyrere at producere. Hvad sker der så med jobbene?" },
                            { t: "Lavere priser og højere løn", fejl: "Priserne steg kraftigt. Dyr olie gør det dyrere at producere. Hvad sker der så med jobbene?" }
                        ],
                        fed: "Lavkonjunktur",
                        linje: "og en arbejdsløshed på over 10 %."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad gør arbejdsløsheden ved statens økonomi?",
                        svar: [
                            { t: "Færre skatteindtægter og flere udgifter, så staten må låne", rigtig: true, fordi: "Arbejdsløse betaler mindre i skat og får dagpenge. Statsgælden vokser." },
                            { t: "Flere skatteindtægter og færre udgifter", fejl: "En arbejdsløs betaler mindre i skat og skal have dagpenge. Hvad gør det ved statskassen?" },
                            { t: "Ingenting, statens økonomi afhænger ikke af beskæftigelsen", fejl: "Staten lever af skat på løn. Hvad sker der, når færre får løn?" }
                        ],
                        fed: "Statsgæld:",
                        linje: "Færre skatteindtægter og flere udgifter. Staten må låne."
                    },
                    {
                        type: "skriv",
                        spm: "Færre arbejder i industrien, og flere arbejder med service og viden. Industrisamfundet bliver til et {hul}.",
                        svar: "informationssamfund",
                        godtag: ["informationssamfund", "informationssamfundet", "servicesamfund", "servicesamfundet", "videnssamfund", "videnssamfundet", "vidensamfund", "information", "service"],
                        naesten: [
                            { ord: ["samfund", "samfundet"], t: "Ja, et samfund. Hvilken slags? Sæt service, viden eller information foran." },
                            { ord: ["industrisamfund", "industrisamfundet"], t: "Industrisamfundet er det, der forsvinder. Hvad arbejder flere med nu?" }
                        ],
                        hint: "Sæt service, viden eller information foran ordet samfund.",
                        fordi: "Lærebogen kalder det også et servicesamfund.",
                        linje: "Industrisamfundet bliver til et informationssamfund (servicesamfund)."
                    }
                ],
                /* Den politiske situation */
                [
                    {
                        type: "skriv",
                        spm: "Ved valget i december 1973 faldt de gamle partier fra over 90 % til 57 % af stemmerne. Valget kaldes {hul}.",
                        svar: "jordskredsvalget",
                        godtag: ["jordskredsvalget", "jordskredsvalg", "jordskred", "jordskredet", "jordskælvsvalget", "jordskælvsvalg", "jordskælvet", "jordskælv", "jordskredsvalget 1973", "jordskredsvalget i 1973"],
                        naesten: [
                            { ord: ["folketingsvalget", "folketingsvalg", "valget", "valg"], t: "Ja, et folketingsvalg. Dette valg har et særligt navn efter jord, der skrider." },
                            { ord: ["protestvalget", "protestvalg"], t: "Det var et protestvalg, ja. Det mest brugte navn handler om jord, der skrider." }
                        ],
                        hint: "Valget har navn efter jord, der skrider.",
                        fordi: "Fem nye partier kom ind, og Folketinget gik fra 5 til 10 partier.",
                        fed: "Jordskredsvalget 1973:",
                        linje: "Folketinget går fra 5 til 10 partier. Tre af dem er helt nye."
                    },
                    {
                        type: "skriv",
                        spm: "Mogens Glistrups nye parti ville afskaffe indkomstskatten. Det blev næststørst og hed {hul}.",
                        svar: "Fremskridtspartiet",
                        godtag: ["fremskridtspartiet", "fremskridtsparti", "fremskridts", "fremskridt", "frp", "fremskridtsbevægelsen"],
                        naesten: [
                            { ord: ["centrumdemokraterne", "cd"], t: "Centrum-Demokraterne var Erhard Jakobsens parti. Glistrups parti har navn efter ordet fremskridt." },
                            { ord: ["dansk folkeparti", "df"], t: "Dansk Folkeparti blev først stiftet i 1995 af folk fra Glistrups parti. Hvad hed det første?" }
                        ],
                        hint: "Partiets navn begynder med ordet fremskridt.",
                        fordi: "Kravet om at fjerne indkomstskatten ramte velfærdsstatens grundlag.",
                        fed: "Fremskridtspartiet",
                        linje: "kræver indkomstskatten fjernet. Det presser velfærdsstatens grundlag."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvad betød de mange partier for politikken?",
                        svar: [
                            { t: "Det blev svært at samle flertal for holdbare løsninger på krisen", rigtig: true, fordi: "Regeringerne var svage, og der var ofte valg." },
                            { t: "Det blev lettere at blive enige, fordi alle blev hørt", fejl: "Ti partier skal blive enige i stedet for fem. Hvad gør det ved forhandlingerne?" },
                            { t: "Ingenting, de fire gamle partier bestemte stadig alene", fejl: "De gamle partier mistede en tredjedel af vælgerne. De kunne ikke længere samle flertal alene." }
                        ],
                        fed: "Politisk uro:",
                        linje: "Det er svært at samle flertal for holdbare løsninger på krisen."
                    },
                    {
                        type: "vaelg",
                        spm: "Hvem regerede fra 1982 til 1993, og hvad ville de?",
                        svar: [
                            { t: "Borgerlige regeringer under Poul Schlüter: offentlige besparelser og lavere skat", rigtig: true, fordi: "Schlüter var konservativ. Den offentlige sektor skulle slankes." },
                            { t: "Socialdemokratiske regeringer under Anker Jørgensen: mere velfærd", fejl: "Anker Jørgensen gav op i 1982. Hvem tog over, og fra hvilken fløj?" },
                            { t: "Fremskridtspartiet alene: ingen indkomstskat", fejl: "Fremskridtspartiet kom aldrig i regering. En konservativ statsminister tog over i 1982." }
                        ],
                        fed: "Borgerlige regeringer 1982-1993",
                        linje: "(Schlüter): offentlige nedskæringer og ønske om skattelettelser."
                    }
                ],
                /* Kobling til grundforklaringer */
                [
                    {
                        type: "forklar",
                        udsagn: "Krisen giver staten færre indtægter og flere udgifter. Gælden vokser, så der må spares på velfærden.",
                        rigtig: "f",
                        fordi: "Økonomien ændrer sig, og staten må tilpasse sig. Det er den funktionalistiske forklaring.",
                        fejl: {
                            k: "Her frygter ingen uro. Økonomien ændrer sig, og staten må tilpasse sig.",
                            i: "Udsagnet nævner ingen partier eller idéer. Økonomien ændrer sig, og staten må tilpasse sig."
                        },
                        fed: "Funktionalistisk:",
                        linje: "Krisen presser statens indtægter og udgifter. Statsgælden giver nedskæringer."
                    },
                    {
                        type: "forklar",
                        udsagn: "Borgerlige og liberale partier går frem. De mener, at staten er blevet for stor, og kræver besparelser og lavere skat.",
                        rigtig: "i",
                        fordi: "Nye idéer om stat og marked vinder frem. Det er den politisk-ideologiske forklaring.",
                        fejl: {
                            f: "Udsagnet handler om, hvad partierne mener og kræver, ikke om et behov, der opstår af sig selv.",
                            k: "Partierne frygter ikke uro. De har en idé om, hvor stor staten bør være."
                        },
                        fed: "Politisk-ideologisk:",
                        linje: "Borgerlige og liberale partier går frem og kræver nedskæringer og skattelettelser."
                    },
                    {
                        type: "forklar",
                        spm: "Hvilken grundforklaring står svagest i denne fase?",
                        rigtig: "k",
                        fordi: "Besparelserne skyldes krise og nye idéer, ikke frygt for uro.",
                        fejl: {
                            f: "Den står stærkt: Krisen og statsgælden tvang staten til at spare. Hvilken har du ikke brugt?",
                            i: "Den står stærkt: De borgerlige partier gik frem. Hvilken har du ikke brugt?"
                        },
                        fed: "Konfliktteoretisk:",
                        linje: "Står svagt. Besparelserne skyldes krise og nye idéer, ikke frygt for uro."
                    }
                ]
            ]
        }
    ]
};

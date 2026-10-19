/* =====================================================================
   data.js - alle tekster og de to smaa modeller

   Historien i del 3 er taget fra kapitel 8-alternativ (del 1 og 2), som
   er skrevet efter Peter Schroeder: Det 20. aarhundredes Danmarkshistorie
   (2007), s. 109-129. Keynes' teori er forenklet som i lektien: gas i
   daarlige tider og brems i gode.

   Detaljerne bag Laes mere, som bogen ikke har, er slaaet op paa lex.dk
   (oms, moms, kildeskat) og staar i mappens README.

   Teksterne maa ikke indeholde tankestreger, og ingen tekst maa begynde
   med "Ogsaa", "Nu" eller "Her" (selvtesten tjekker det).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    /* Farverne foelger Finansministeren: gas er orange, brems er blaa */
    var FARVE = { gas: "#e8963a", brems: "#3d9ee0", ingen: "#9aa3ad", begge: "#c58be0" };

    var DELE = [
        { navn: "Kredsløbet", titel: "Pengenes kredsløb" },
        { navn: "Gas og brems", titel: "Gas og brems" },
        { navn: "Danmark 1953-1974", titel: "Danmark 1953-1974" }
    ];

    /* ------------------------------------------------------------------
       DEL 1: PENGENES KREDSLOEB
       Kronerne paa sporet er efterspoergslen: hvor meget der bliver
       koebt. De staar stille og flytter sig kun, naar der sker noget.
       Arbejderne viser, hvor mange der har arbejde.
       ------------------------------------------------------------------ */
    var DEL1 = {
        kroner: 12,
        arbejdere: 10,

        /* Foerste kort: indledningen og gaettet paa en gang (faerre klik,
           brugerens oenske 19. okt. 2026) */
        start: "<b>Pengene går rundt.</b> Familierne køber varer hos virksomhederne, og virksomhederne betaler løn til familierne. <b>Gæt:</b> Hvad sker der, hvis familierne bliver bange for fremtiden og sparer op i stedet for at købe?",
        startHint: "Klik på familierne, virksomhederne, arbejderne eller en krone for at se, hvad de er.",

        klik: {
            familier: "Familierne bruger deres løn på varer. Kronerne går over toppen til virksomhederne.",
            fabrik: "Virksomhederne laver varerne og betaler løn. Kronerne går under bunden tilbage til familierne.",
            arbejdere: "Arbejderne er dem, virksomhederne betaler løn til. De grå er arbejdsløse.",
            sparegris: "Sparegrisen er familiernes opsparing. Penge i sparegrisen bliver ikke brugt.",
            staten: "Staten kan låne penge og bruge dem, selv om familierne holder igen.",
            krone: "En krone er penge, der bliver brugt. Jo flere kroner der er på sporet, jo mere bliver der købt."
        },

        gaet: {
            svar: ["Virksomhederne sælger mindre og fyrer folk.", "Der sker ingenting.", "Virksomhederne sælger mere."],
            holder: 0
        },

        /* Den onde cirkel koerer af sig selv efter gaettet: 2 kroner i
           sparegrisen, 2 fyret, 1 krone vaek og 1 fyret mere. Til sidst
           er der 9 kroner og 7 i arbejde. */
        krise: "<b>En ond cirkel.</b> Familierne sparer 2 kroner op, så virksomhederne sælger mindre og fyrer 2 arbejdere. De arbejdsløse får ingen løn og køber mindre, så virksomhederne fyrer 1 mere. Sådan gik det i krisen i 1930'erne.",
        holdt: "Dit gæt holdt ✓",
        holdtIkke: "Det gik anderledes, end du gættede ✓",

        hvem: {
            tekst: "Familierne tør ikke købe, og virksomhederne sælger for lidt til at bygge nyt. <b>Hvem kan ifølge Keynes sætte gang i pengene igen?</b>",
            svar: [
                { tekst: "Familierne", nej: "Nej. Familierne er bange og har fået mindre i løn. De holder igen." },
                { tekst: "Virksomhederne", nej: "Nej. Virksomhederne sælger for lidt. De bygger ikke nyt, før salget stiger." },
                { tekst: "Staten", ja: "Rigtigt. Keynes mente, at staten skal bruge flere penge, når alle andre holder igen." }
            ]
        },

        /* Staten giver gas, og det koerer af sig selv: 2 arbejdsloese faar
           loen (12 kroner igen sammen med 1 fra sparegrisen, 10 i arbejde),
           og statens roede krone koerer tre ture (brugt 4 gange). */
        gas: "<b>Staten giver gas.</b> Staten låner penge, bygger en vej og betaler løn til 2 arbejdsløse. De køber varer, og alle kommer i arbejde igen. Følg statens røde krone: Den bliver brugt igen og igen. Det hedder multiplikatoreffekten.",
        faerdig: "<b>Del 1 er færdig ✓</b> Den samme krone er brugt 4 gange. Statens penge giver mere arbejde, end beløbet selv kan betale.",
        keynes: "<b>Keynes:</b> Når familierne og virksomhederne holder igen, skal staten bruge flere penge."
    };

    /* ------------------------------------------------------------------
       DEL 2: GAS OG BREMS
       Under kurverne ligger et tal for, hvor hurtigt oekonomien koerer,
       fra -3 til 3. Hvert aar flytter det sig af sig selv (drift), og
       elevens valg laegger 1 til (gas) eller traekker 1 fra (brems).
       Grafen viser to ting, der traekker hver sin vej:
           arbejdsloesheden = 1,8 - tallet   prisstigningerne = 1,2 + tallet
       paa en skala fra 0 (lav) til 5 (hoej). Over 3 er for hoejt.
       Uden staten er driften alene.
       ------------------------------------------------------------------ */
    var GRAENSE = 3;

    var DEL2 = {
        intro: "<b>Gode og dårlige tider.</b> I dårlige tider stiger arbejdsløsheden. I gode tider stiger priserne. Keynes mente, at staten kan holde begge under grænsen: gas mod arbejdsløshed og brems mod prisstigninger.",
        vaerktoej: [
            { slags: "gas", tekst: "Gas", under: "lavere skat eller flere offentlige udgifter" },
            { slags: "brems", tekst: "Brems", under: "højere skat eller færre offentlige udgifter" }
        ],
        valg: [
            { slags: "gas", tekst: "Gas", under: "lavere skat, flere udgifter", virkning: 1 },
            { slags: "ingen", tekst: "Ingenting", under: "staten venter", virkning: 0 },
            { slags: "brems", tekst: "Brems", under: "højere skat, færre udgifter", virkning: -1 }
        ],
        aar: [
            { drift: -1, nyt: "Virksomhederne får færre ordrer og begynder at fyre folk." },
            { drift: -1, nyt: "Ordrerne bliver ved med at falde." },
            { drift: 0, nyt: "Ordrerne holder sig. Økonomien står stille." },
            { drift: 1, nyt: "Ordrerne stiger, og virksomhederne ansætter flere." },
            { drift: 2, nyt: "Eksporten stiger kraftigt. Der er arbejde til alle, og lønnen stiger." },
            { drift: 1, nyt: "Ordrerne stiger stadig, og virksomhederne mangler arbejdskraft." },
            { drift: 0, nyt: "Ordrerne holder sig på det høje niveau." },
            { drift: -1, nyt: "Ordrerne begynder at falde igen." }
        ],
        /* Hvad der skete i aaret. Ingen ros og ingen skaeld ud. */
        ledighed: { op: "Arbejdsløsheden stiger", ned: "Arbejdsløsheden falder", ens: "Arbejdsløsheden er som før" },
        priser: { op: "priserne stiger hurtigere", ned: "priserne stiger langsommere", ens: "priserne stiger som før" },
        /* Hoejst en venlig bemaerkning i hele spillet: foerste gang en
           linje kommer over graensen */
        hov: {
            ledighed: "Hov, arbejdsløsheden er over grænsen. Keynes ville nok have givet lidt mere gas.",
            priser: "Hov, priserne stiger over grænsen. Keynes ville nok have bremset lidt før."
        },
        som: "Du styrede, som Keynes ville ✓",
        opskrift: "Keynes' opskrift: gas, når arbejdsløsheden stiger, og brems, når priserne stiger.",
        svaert: {
            tekst: "<b>Gæt.</b> Gas og brems er begge Keynes' redskaber. Hvad tror du, var sværest for politikerne?",
            svar: ["At give gas", "At bremse"],
            holder: 1,
            svaret: "At bremse. Vælgerne bliver ikke glade for højere skat eller færre udgifter. Gas er populært, så det er let at give gas og svært at bremse."
        },
        faerdig: "Del 2 er færdig ✓"
    };

    /* Tallet for oekonomien aar for aar. valg er en liste med virkningerne
       (1, 0 eller -1). Uden staten er listen tom. */
    function temperaturer(valg) {
        var t = 0, ud = [0];
        DEL2.aar.forEach(function (a, i) {
            t = NK.klamp(t + a.drift + (valg && valg[i] !== undefined ? valg[i] : 0), -3, 3);
            ud.push(t);
        });
        return ud;
    }

    /* De to linjer starter et stykke fra hinanden, saa de aldrig ligger
       oven i hinanden (det gjorde de foerst, og saa forsvandt den blaa).
       Graensen rammes stadig ved samme tal: under -1 og over 1. */
    function ledighed(t) { return 1.8 - t; }
    function priser(t) { return 1.2 + t; }

    /* Antal aar (1-8), hvor arbejdsloesheden og prisstigningerne er over graensen */
    function overGraensen(liste) {
        var l = 0, p = 0;
        for (var i = 1; i < liste.length; i++) {
            if (ledighed(liste[i]) > GRAENSE) l++;
            if (priser(liste[i]) > GRAENSE) p++;
        }
        return { ledighed: l, priser: p };
    }

    /* ------------------------------------------------------------------
       DEL 3: DANMARK 1953-1974
       Fire nedslag. I hvert: laes situationen, svar paa hvad Keynes' regel
       siger, se hvad regeringen gjorde, og svar paa hvorfor.
       fokus: de linjer, teksten handler om (faar en gul ring).
       raekke: stemplets raekke oeverst i grafen (0 eller 1).
       ------------------------------------------------------------------ */
    var SITUATIONER = [
        {
            aar: 1953,
            fokus: ["ledighed"],
            raekke: 0,
            tekst: "<b>1953.</b> Socialdemokratiet kommer i regering. Mange er arbejdsløse, og væksten er lav. Danmark mangler valuta: udenlandske penge til at købe varer i udlandet.",
            keynes: {
                rigtig: "gas",
                ja: "Rigtigt. Arbejdsløsheden er over grænsen, så Keynes' regel siger gas.",
                nej: {
                    brems: "Nej. Arbejdsløsheden er over grænsen. Keynes' regel siger gas, når mange er arbejdsløse."
                }
            },
            regeringen: "Vækst først",
            hvorfor: {
                tekst: "<b>Regeringen gav ikke gas.</b> Lønkrav og sociale reformer måtte vente. Først skulle der skabes vækst med ny teknologi. Hvorfor gav regeringen ikke gas?",
                svar: [
                    { tekst: "Flere penge ville give mere import, og valutaen manglede.", ja: "Rigtigt. Med flere penge køber folk flere udenlandske varer, og dem kunne Danmark ikke betale for." },
                    { tekst: "Socialdemokratiet var imod Keynes.", nej: "Nej. Krag og Kampmann var uddannet i økonomi og byggede netop på Keynes." },
                    { tekst: "Der var ingen arbejdsløse.", nej: "Nej. Danmark havde en af de højeste arbejdsløshedsprocenter i Vesteuropa." }
                ]
            },
            kort: "Valutaen manglede",
            mere: {
                titel: "1953: Vækst først",
                tekst: [
                    "I 1950'erne havde Danmark den laveste vækst og en af de højeste arbejdsløshedsprocenter i Vesteuropa. Krag og Kampmann sad på de økonomiske poster. De var uddannet økonomer og byggede på Keynes.",
                    "Men en dansker med flere penge køber også udenlandske varer, og dem skal der betales for med valuta. Derfor måtte krav om højere løn og sociale forbedringer vente. Alle skulle lære at se sammenhængen mellem egne lønkrav og hele samfundets økonomi.",
                    "I 1956 gjorde Folketinget et mæglingsforslag til lov, som gav arbejderne langt mindre, end de havde krævet. Det kan du prøve i animationen Finansminister."
                ]
            }
        },
        {
            aar: 1960,
            fokus: ["ledighed", "priser"],
            raekke: 1,
            tekst: "<b>1960.</b> Opsvinget er i fuld gang. Industrien eksporterer mere end landbruget, arbejdsløsheden falder hurtigt, og der kommer flere skattekroner i statskassen.",
            keynes: {
                rigtig: "brems",
                ja: "Rigtigt. Det er gode tider, og priserne begynder at stige. Keynes' regel siger brems.",
                nej: {
                    gas: "Nej. Arbejdsløsheden er under grænsen og falder. Keynes' regel siger brems i gode tider, så priserne ikke stiger for hurtigt."
                }
            },
            regeringen: "Byg velfærd",
            hvorfor: {
                tekst: "<b>Regeringen brugte skattekronerne på velfærd:</b> skoler, sygehuse, plejehjem, børneinstitutioner og veje. Hvorfor?",
                svar: [
                    { tekst: "Keynes sagde, at staten skal bruge flest penge i gode tider.", nej: "Nej. Keynes sagde brems i gode tider." },
                    { tekst: "Velfærdsstaten var planlagt siden 1945, og nu var der råd.", ja: "Rigtigt. Prisen var, at der kom mangel på arbejdskraft, og at lønnen begyndte at stige." },
                    { tekst: "Arbejdsløsheden steg.", nej: "Nej. Arbejdsløsheden faldt i de gode tider." }
                ]
            },
            kort: "Velfærden var planlagt siden 1945",
            mere: {
                titel: "1960: Byg velfærd",
                tekst: [
                    "Socialdemokratiet havde haft velfærdsstaten på tegnebrættet siden programmet Fremtidens Danmark i 1945. Folkepensionen trådte i kraft i 1957. Den var en universel ydelse: Grundbeløbet gik til alle over 67 år, uanset hvor mange penge de havde.",
                    "Det offentlige byggede skoler, sygehuse, plejehjem og børneinstitutioner, og antallet af offentligt ansatte steg markant. Institutionerne gjorde det muligt for kvinderne at tage arbejde, for industrien manglede arbejdskraft.",
                    "I 1960 eksporterede Danmark for første gang flere industrivarer end landbrugsvarer. Der var bred politisk enighed om, at de gode tider skulle give bedre levevilkår for alle."
                ]
            }
        },
        {
            aar: 1962,
            fokus: ["priser"],
            raekke: 0,
            tekst: "<b>1962.</b> Der er arbejde til næsten alle. Lønnen stiger så hurtigt, at priserne følger med. Danskerne køber flere udenlandske varer, og der er underskud på betalingsbalancen.",
            keynes: {
                rigtig: "brems",
                ja: "Rigtigt. Prisstigningerne er over grænsen, så Keynes' regel siger brems.",
                nej: {
                    gas: "Nej. Priserne stiger over grænsen. Keynes' regel siger brems, når priserne stiger for hurtigt."
                }
            },
            regeringen: "Brems med skat",
            hvorfor: {
                tekst: "<b>Regeringen bremsede</b> med omsen i 1962, løn- og prisstop i 1963 og moms i 1967. Hvorfor brugte den skat i stedet for at skære i udgifterne?",
                svar: [
                    { tekst: "Skat på varer gør varerne billigere.", nej: "Nej. En afgift på varer gør dem dyrere, så folk køber mindre." },
                    { tekst: "De borgerlige partier ville have højere skat.", nej: "Nej. De borgerlige ville ikke have, at staten opkrævede flere penge end højst nødvendigt." },
                    { tekst: "Skatten bremsede købene, og velfærden kunne vokse videre.", ja: "Rigtigt. Derfor voksede den offentlige sektor, og skattetrykket blev et af verdens højeste." }
                ]
            },
            kort: "Velfærden kunne vokse videre",
            mere: {
                titel: "1962: Brems med skat",
                tekst: [
                    "En effektiv måde at bremse lønmodtagernes købekraft på var at hæve skatterne. I 1962 kom omsen: en afgift på 9 % på de fleste varer. I 1963 kom Helhedsløsningen med et løn- og prisstop. Det var Danmarks første indkomstpolitik.",
                    "I 1967 blev omsen afløst af moms på 10 %. Samme år vedtog Folketinget kildeskatten, og fra 1970 blev skatten trukket af lønnen, før den blev udbetalt.",
                    "Skatten bremsede købene, men pengene blev brugt på velfærd i stedet for at blive sparet op. Det danske skattetryk blev et af verdens højeste. Løn- og prisstoppet i 1963 kan du prøve i animationen Finansminister."
                ]
            }
        },
        {
            aar: 1974,
            fokus: ["ledighed", "priser"],
            raekke: 0,
            stempel: "Velfærden voksede",
            tekst: "<b>1974.</b> Krisen er kommet. Oliepriserne er steget voldsomt, og mange virksomheder fyrer folk. Samtidig stiger priserne hurtigt.",
            keynes: {
                rigtig: "begge",
                ja: "Rigtigt. Begge er over grænsen, så reglen peger begge veje. Så kan den ikke bruges.",
                nej: {
                    gas: "Nej. Gas giver flere job, men så stiger priserne endnu hurtigere.",
                    brems: "Nej. Brems dæmper priserne, men så stiger arbejdsløsheden endnu mere."
                }
            },
            regeringen: "Velfærden voksede videre",
            hvorfor: {
                tekst: "<b>Velfærden blev ved med at vokse.</b> Den offentlige sektor voksede, og skatterne steg. Hvad blev problemet?",
                svar: [
                    { tekst: "Velfærdsstaten blev afskaffet.", nej: "Nej. Den offentlige sektor voksede videre." },
                    { tekst: "Arbejdsløsheden forsvandt.", nej: "Nej. Arbejdsløsheden blev høj i mange år." },
                    { tekst: "Velfærden kostede mere, men væksten var væk.", ja: "Rigtigt. Velfærdsstaten var bygget i de gode tider fra 1957 til 1973, og væksten havde betalt den." }
                ]
            },
            kort: "Reglen kunne ikke bruges",
            mere: {
                titel: "1974: Krisen",
                tekst: [
                    "Oliepriserne blev firedoblet i 1973-74. Varerne blev dyrere, og mange virksomheder fyrede folk. Arbejdsløshed og stigende priser kom på samme tid. Økonomerne kalder det stagflation.",
                    "Keynes' regel siger gas mod arbejdsløshed og brems mod stigende priser. Når begge dele sker på én gang, peger reglen i hver sin retning.",
                    "Den offentlige sektor voksede videre, skatterne steg, og arbejdsløsheden blev høj i mange år. Det er emnet for næste periode: krise og omstilling."
                ]
            }
        }
    ];

    var KEYNES_SVAR = [
        { slags: "gas", tekst: "Gas", under: "lavere skat, flere udgifter" },
        { slags: "brems", tekst: "Brems", under: "højere skat, færre udgifter" },
        { slags: "begge", tekst: "Begge dele på én gang", under: "gas og brems" }
    ];

    /* Kurverne i del 3 er en tegning, ikke tal. Skalaen er den samme som
       i del 2: 0 er lav, 5 er hoej, og over 3 er for hoejt. Formen foelger
       de store linjer: hoej arbejdsloeshed i 1950'erne, fuld beskaeftigelse
       og stigende priser i 1960'erne og begge dele paa en gang fra 1974. */
    var HISTORIE = {
        ledighed: [[1950, 3.3], [1953, 3.7], [1956, 4.2], [1958, 3.7], [1960, 2.3], [1962, 1.2], [1965, 0.8], [1968, 1.6], [1970, 1.1], [1973, 0.9], [1974, 3.3], [1975, 4.4]],
        priser: [[1950, 2.6], [1953, 1.0], [1956, 1.7], [1958, 0.8], [1960, 1.2], [1962, 3.4], [1964, 2.3], [1966, 3.1], [1968, 3.3], [1970, 3.0], [1972, 3.1], [1973, 3.7], [1974, 4.5], [1975, 4.0]]
    };

    var SLUT = {
        tekst: "<b>Socialdemokratiet og Keynes.</b> Krag og Kampmann byggede på Keynes: Staten skulle udjævne op- og nedture. I praksis bremsede valutaen gassen i 1950'erne, og de gode tider blev brugt på velfærd.",
        eftertanke: "<b>Til eftertanke:</b> Fulgte Socialdemokratiet Keynes' regel? Brug to af årene i skemaet."
    };

    var TEKST = {
        kurveNote: "Kurverne er en tegning, ikke tal.",
        ledighed: "Arbejdsløshed",
        priser: "Prisstigninger",
        uden: "uden staten",
        forHoejt: "for højt",
        graense: "grænse",
        lav: "lav"
    };

    NK.Data = {
        FARVE: FARVE,
        DELE: DELE,
        DEL1: DEL1,
        DEL2: DEL2,
        GRAENSE: GRAENSE,
        SITUATIONER: SITUATIONER,
        KEYNES_SVAR: KEYNES_SVAR,
        HISTORIE: HISTORIE,
        SLUT: SLUT,
        TEKST: TEKST
    };

    NK.Model = {
        temperaturer: temperaturer,
        ledighed: ledighed,
        priser: priser,
        overGraensen: overGraensen
    };
}());

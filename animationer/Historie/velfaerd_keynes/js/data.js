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
       Kronerne paa kredsloebet er efterspoergslen: hvor meget der bliver
       koebt. Arbejderne viser, hvor mange der har arbejde.
       ------------------------------------------------------------------ */
    var DEL1 = {
        kroner: 12,
        arbejdere: 10,

        start: "<b>Pengene går rundt.</b> Familierne køber varer hos virksomhederne. Virksomhederne betaler løn til familierne, som så kan købe igen.",
        startHint: "Klik på familierne, virksomhederne, arbejderne eller en krone for at se, hvad de er.",

        klik: {
            familier: "Familierne bruger deres løn på varer. Kronerne går over toppen til virksomhederne.",
            fabrik: "Virksomhederne laver varerne og betaler løn. Kronerne går under bunden tilbage til familierne.",
            arbejdere: "Arbejderne er dem, virksomhederne betaler løn til. De grå er arbejdsløse.",
            sparegris: "Sparegrisen er familiernes opsparing. Penge i sparegrisen bliver ikke brugt.",
            staten: "Staten kan låne penge og bruge dem, selv om familierne holder igen.",
            krone: "En krone er penge, der bliver brugt. Jo flere kroner der går rundt, jo mere bliver der købt."
        },

        gaet: {
            tekst: "<b>Gæt først.</b> Familierne bliver bange for fremtiden og sparer op i stedet for at købe. Hvad sker der med virksomhederne?",
            svar: ["De sælger mindre og fyrer folk.", "Der sker ingenting.", "De sælger mere."],
            holder: 0,
            gjort: "Klik på familierne for at spare op."
        },

        /* Den onde cirkel: tre runder. kroner og job er tallene efter runden */
        krise: [
            { tekst: "<b>Runde 1.</b> Familierne lægger 2 kroner i sparegrisen. Der går færre penge til virksomhederne.", kroner: 10, job: 10, spar: 2 },
            { tekst: "<b>Runde 2.</b> Virksomhederne sælger mindre. De fyrer 2 arbejdere.", kroner: 10, job: 8 },
            { tekst: "<b>Runde 3.</b> De arbejdsløse får ingen løn og må købe mindre. Virksomhederne sælger endnu mindre og fyrer 1 arbejder mere.", kroner: 9, job: 7 }
        ],

        cirkel: "<b>En ond cirkel.</b> Mindre køb giver færre job, og færre job giver endnu mindre køb. Sådan gik det i krisen i 1930'erne.",
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

        stat: {
            tekst: "<b>Staten giver gas.</b> Staten låner penge og bygger en ny vej. Klik på staten.",
            skilt: "Klik for at bygge en vej"
        },

        /* Staten saetter gang i det igen */
        gas: [
            { tekst: "<b>Runde 1.</b> Staten betaler løn til 2 vejarbejdere. De var arbejdsløse, men har nu penge at købe for.", kroner: 11, job: 9 },
            { tekst: "<b>Runde 2.</b> Familierne tør købe igen og tager 1 krone op af sparegrisen. Virksomhederne sælger mere og ansætter 1 arbejder igen.", kroner: 12, job: 10 }
        ],

        multiplikator: "<b>Følg statens krone med den gule ring.</b> Den bliver brugt igen og igen, først som løn og så til varer. Det hedder multiplikatoreffekten.",
        keynes: "<b>Keynes:</b> Når familierne og virksomhederne holder igen, skal staten bruge flere penge.",
        faerdig: "Del 1 er færdig ✓"
    };

    /* ------------------------------------------------------------------
       DEL 2: GAS OG BREMS
       Oekonomiens temperatur er et trin fra -3 (meget kold) til 3 (meget
       varm). Balance er -1 til 1. Hvert aar flytter oekonomien sig af sig
       selv (drift), og elevens valg laegger 1 til (gas) eller traekker 1
       fra (brems). Uden staten er driften alene.
       ------------------------------------------------------------------ */
    var DEL2 = {
        intro: "<b>Gode og dårlige tider.</b> Økonomien går op og ned af sig selv. Keynes mente, at staten skal udjævne op- og nedture: gas, når det er for koldt, og brems, når det er for varmt.",
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
        zone: {
            balance: "<b>I balance ✓</b> Der er arbejde nok, og priserne er rolige.",
            kold: "<b>For koldt.</b> Mange er arbejdsløse. Keynes' regel: gas, når det er for koldt.",
            varm: "<b>For varmt.</b> Priserne stiger hurtigt. Keynes' regel: brems, når det er for varmt."
        },
        svaert: {
            tekst: "<b>Gæt.</b> Gas og brems er begge Keynes' redskaber. Hvad tror du, var sværest for politikerne?",
            svar: ["At give gas", "At bremse"],
            holder: 1,
            svaret: "At bremse. Vælgerne bliver ikke glade for højere skat eller færre udgifter. Gas er populært, så det er let at give gas og svært at bremse."
        },
        faerdig: "Del 2 er færdig ✓"
    };

    /* Oekonomiens temperatur aar for aar. valg er en liste med virkningerne
       (1, 0 eller -1). Uden staten er listen tom. */
    function temperaturer(valg) {
        var t = 0, ud = [0];
        DEL2.aar.forEach(function (a, i) {
            t = NK.klamp(t + a.drift + (valg && valg[i] !== undefined ? valg[i] : 0), -3, 3);
            ud.push(t);
        });
        return ud;
    }

    function zone(t) {
        if (t > 1) return "varm";
        if (t < -1) return "kold";
        return "balance";
    }

    /* Antal aar (1-8) i balance */
    function iBalance(liste) {
        var n = 0;
        for (var i = 1; i < liste.length; i++) if (zone(liste[i]) === "balance") n++;
        return n;
    }

    /* ------------------------------------------------------------------
       DEL 3: DANMARK 1953-1974
       Fire nedslag. I hvert: laes situationen, svar paa hvad Keynes' regel
       siger, se hvad regeringen gjorde, og svar paa hvorfor.
       ------------------------------------------------------------------ */
    var SITUATIONER = [
        {
            aar: 1953,
            temp: -2,
            maerke: "valuta mangler",
            placering: { maerke: "under", dx: 82, dy: -44 },
            tekst: "<b>1953.</b> Socialdemokratiet kommer i regering. Mange er arbejdsløse, og væksten er lav. Danmark mangler valuta: udenlandske penge til at købe varer i udlandet.",
            keynes: {
                rigtig: "gas",
                ja: "Rigtigt. Økonomien er for kold, så Keynes' regel siger gas.",
                nej: {
                    brems: "Nej. Økonomien er for kold, og mange er arbejdsløse. Keynes' regel siger gas, når det er for koldt."
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
            aar: 1958,
            temp: 0.5,
            maerke: "",
            placering: { maerke: "under", dx: -100, dy: -6 },
            tekst: "<b>1958.</b> Opsvinget kommer udefra. Industrien eksporterer mere, især til Vesttyskland. Arbejdsløsheden falder, og der kommer flere skattekroner i statskassen.",
            keynes: {
                rigtig: "brems",
                ja: "Rigtigt. Det er gode tider, så Keynes' regel siger brems.",
                nej: {
                    gas: "Nej. Det er gode tider, og arbejdsløsheden falder. Keynes' regel siger brems i gode tider, så økonomien ikke bliver for varm."
                }
            },
            regeringen: "Byg velfærd",
            hvorfor: {
                tekst: "<b>Regeringen brugte skattekronerne på velfærd:</b> folkepension til alle over 67 år, skoler, sygehuse, institutioner og veje. Hvorfor?",
                svar: [
                    { tekst: "Keynes sagde, at staten skal bruge flest penge i gode tider.", nej: "Nej. Keynes sagde brems i gode tider." },
                    { tekst: "Velfærdsstaten var planlagt siden 1945, og nu var der råd.", ja: "Rigtigt. Prisen var, at der kom mangel på arbejdskraft, og at lønnen begyndte at stige." },
                    { tekst: "Arbejdsløsheden steg.", nej: "Nej. Arbejdsløsheden faldt i de gode tider." }
                ]
            },
            kort: "Velfærden var planlagt siden 1945",
            mere: {
                titel: "1958: Byg velfærd",
                tekst: [
                    "Socialdemokratiet havde haft velfærdsstaten på tegnebrættet siden programmet Fremtidens Danmark i 1945. Folkepensionen trådte i kraft i 1957. Den var en universel ydelse: Grundbeløbet gik til alle over 67 år, uanset hvor mange penge de havde.",
                    "Det offentlige byggede skoler, sygehuse, plejehjem og børneinstitutioner, og antallet af offentligt ansatte steg markant. Institutionerne gjorde det muligt for kvinderne at tage arbejde, for industrien manglede arbejdskraft.",
                    "Der var bred politisk enighed om, at de gode tider skulle give bedre levevilkår for alle."
                ]
            }
        },
        {
            aar: 1962,
            temp: 2.6,
            maerke: "underskud",
            placering: { maerke: "venstre", dx: -100, dy: -30 },
            tekst: "<b>1962.</b> Der er arbejde til næsten alle. Lønnen stiger så hurtigt, at priserne følger med. Danskerne køber flere udenlandske varer, og der er underskud på betalingsbalancen.",
            keynes: {
                rigtig: "brems",
                ja: "Rigtigt. Økonomien er for varm, så Keynes' regel siger brems.",
                nej: {
                    gas: "Nej. Økonomien er for varm, og priserne stiger. Keynes' regel siger brems, når det er for varmt."
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
            temp: null,
            maerke: "",
            placering: { maerke: "under", dx: -122, dy: 0 },
            stempel: "Velfærden voksede",
            tekst: "<b>1974.</b> Krisen er kommet. Oliepriserne er steget voldsomt, og mange virksomheder fyrer folk. Samtidig stiger priserne hurtigt.",
            keynes: {
                rigtig: "begge",
                ja: "Rigtigt. Reglen peger begge veje, og så kan den ikke bruges.",
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

    /* Kurven i del 3 er en tegning af konjunkturerne, ikke tal. Den vises
       til og med den situation, eleven er naaet til. */
    var HISTORIE = [
        [1950, -1], [1953, -2], [1956, -2], [1958, 0.5], [1960, 1.5],
        [1962, 2.6], [1964, 1.4], [1966, 2], [1968, 1.5], [1970, 2],
        [1973, 2.2]
    ];
    /* Fra 1973 deler kurven sig: priserne bliver varme, arbejdsloesheden kold */
    var SPLIT = { fra: [1973, 2.2], priser: [1974, 2.8], job: [1974, -2.6] };

    var SLUT = {
        tekst: "<b>Socialdemokratiet og Keynes.</b> Krag og Kampmann byggede på Keynes: Staten skulle udjævne op- og nedture. I praksis bremsede valutaen gassen i 1950'erne, og de gode tider blev brugt på velfærd.",
        eftertanke: "<b>Til eftertanke:</b> Fulgte Socialdemokratiet Keynes' regel? Brug to af årene i skemaet."
    };

    var TEKST = {
        kurveNote: "Kurven er en tegning, ikke tal.",
        uden: "uden staten",
        med: "med dig"
    };

    NK.Data = {
        FARVE: FARVE,
        DELE: DELE,
        DEL1: DEL1,
        DEL2: DEL2,
        SITUATIONER: SITUATIONER,
        KEYNES_SVAR: KEYNES_SVAR,
        HISTORIE: HISTORIE,
        SPLIT: SPLIT,
        SLUT: SLUT,
        TEKST: TEKST
    };

    NK.Model = {
        temperaturer: temperaturer,
        zone: zone,
        iBalance: iBalance
    };
}());

/* =====================================================================
   data.js - plakaten, de ni spoergsmaal og alle tekster

   Hvert spoergsmaal har:
     ord       fagordet for det, der spoerges om (staar i maerket)
     spm       spoergsmaalet
     sted      det sted paa plakaten, der vises med en gul ramme, naar
               eleven har svaret (navn i STEDER, "henvisning" er teksten
               under plakaten, null er intet sted)
     svar      svarmulighederne. Det rigtige har rigtig: true og fordi
               (det, der staar ved Rigtigt). De forkerte har fejl: hvorfor
               svaret ikke holder, og hvor eleven skal kigge.
     saetning  det, svaret bliver til i elevens kildeanalyse

   Raekkefoelgen af svarene blandes, hver gang quizzen starter.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

NK.Data = {
    PLAKAT: {
        fil: "billeder/tryghed-i-beskaeftigelsen-1960.jpg",
        alt: "Plakat. Øverst står: Tryghed i beskæftigelsen. En kvinde med et spædbarn på armen og en lille pige vinker til en mand med mappe. Nederst står: Gør gode tider bedre! X ved A Socialdemokratiet.",
        henvisning: "„Tryghed i beskæftigelsen“, plakat, 1960. Arbejderbevægelsens Bibliotek og Arkiv."
    },

    /* Steder paa plakaten i procent af billedet: venstre, top, bredde, hoejde */
    STEDER: {
        logo:       [67, 63, 32, 36],
        kryds:      [50, 87, 26, 10],
        stem:       [50, 86, 49, 13],
        overskrift: [2.5, 3.5, 77, 7.5],
        slogan:     [2.5, 81, 75, 8],
        billede:    [1.5, 11, 97, 66.5]
    },

    TEKST: {
        start: "Se på plakaten, og vælg et svar.",
        tom: "Hvert rigtigt svar bliver til en sætning her.",
        naeste: "Næste spørgsmål →",
        sidste: "Se hele analysen →",
        kopier: "Kopiér analysen",
        kopieret: "Kopieret ✓",
        alle: "Alle {n} rigtige i første forsøg.",
        nogle: "{k} af {n} rigtige i første forsøg.",
        metode: "Du har svaret på ni spørgsmål. De kan stilles til alle kilder:"
    },

    SPM: [
        {
            ord: "Afsender",
            spm: "Hvem er afsender af plakaten?",
            sted: "logo",
            svar: [
                { t: "Socialdemokratiet", rigtig: true, fordi: "Partiets navn og bogstavet A står nederst til højre." },
                { t: "Regeringen", fejl: "Regeringen bestod i 1960 af tre partier. Plakaten har kun ét partis navn. Se nederst til højre." },
                { t: "Folketinget", fejl: "Folketinget er alle partierne tilsammen. Plakaten er fra ét af dem. Se nederst til højre." },
                { t: "Familien på billedet", fejl: "Familien er det, plakaten viser. Afsenderen er den, der har fået plakaten lavet. Se nederst til højre." }
            ],
            saetning: "Plakatens afsender er Socialdemokratiet."
        },
        {
            ord: "Modtager",
            spm: "Hvem er plakaten rettet til?",
            sted: "kryds",
            svar: [
                { t: "Vælgerne", rigtig: true, fordi: "Krydset nederst er til dem, der skal stemme." },
                { t: "Børnene", fejl: "Børn har ikke stemmeret. Se på krydset nederst: Hvem sætter kryds?" },
                { t: "De andre partier", fejl: "Plakaten beder om et kryds. Hvem sætter kryds ved et valg?" },
                { t: "Kun mænd med arbejde", fejl: "Kvinder fik stemmeret i 1915. Se på krydset nederst: Hvem sætter kryds?" }
            ],
            saetning: "Den er rettet til vælgerne."
        },
        {
            ord: "Tid",
            spm: "Hvornår er plakaten fra?",
            sted: "henvisning",
            svar: [
                { t: "1960", rigtig: true, fordi: "Året står i kildehenvisningen. Det passer med de gode tider, som kom i 1958." },
                { t: "1935", fejl: "I 1935 var der krise og stor arbejdsløshed. Plakaten taler om gode tider. Læs kildehenvisningen under plakaten." },
                { t: "1975", fejl: "I 1975 var der krise efter oliekrisen. Plakaten taler om gode tider. Læs kildehenvisningen under plakaten." }
            ],
            saetning: "Plakaten er fra 1960."
        },
        {
            ord: "Emne",
            spm: "Hvad handler plakaten om?",
            sted: "overskrift",
            svar: [
                { t: "Arbejde og tryghed for familien", rigtig: true, fordi: "Overskriften siger det: tryghed i beskæftigelsen, altså at folk har arbejde." },
                { t: "Kvinder skal ud på arbejdsmarkedet", fejl: "På billedet er det far, der går på arbejde. Mor bliver hjemme med børnene. Læs overskriften øverst." },
                { t: "Bedre skoler til børnene", fejl: "Skolen er emnet på en anden plakat fra samme valgkamp. Læs overskriften øverst på denne." },
                { t: "En økonomisk krise", fejl: "Plakaten taler om gode tider. Læs overskriften øverst." }
            ],
            saetning: "Emnet er beskæftigelse: Der skal være arbejde, så familien kan leve trygt."
        },
        {
            ord: "Budskab",
            spm: "Hvad er plakatens budskab?",
            sted: "slogan",
            svar: [
                { t: "Tiderne er gode, og med Socialdemokratiet bliver de bedre", rigtig: true, fordi: "Sloganet siger det direkte: Gør gode tider bedre!" },
                { t: "Der er krise, og kun Socialdemokratiet kan stoppe den", fejl: "Plakaten taler om gode tider, ikke om krise. Læs den røde tekst under billedet." },
                { t: "Kvinder bør blive hjemme hos børnene", fejl: "Billedet viser en husmor, men det er ikke det, plakaten vil overbevise om. Læs den røde tekst under billedet." },
                { t: "Familien er vigtigere end arbejdet", fejl: "Plakaten sætter ikke de to op mod hinanden. Fars arbejde giver familien tryghed. Læs den røde tekst under billedet." }
            ],
            saetning: "Budskabet er, at tiderne er gode, og at de bliver endnu bedre med Socialdemokratiet."
        },
        {
            ord: "Virkemidler",
            spm: "Hvordan får plakaten budskabet frem?",
            sted: "billede",
            svar: [
                { t: "Med et billede af en tryg familie og et kort slogan", rigtig: true, fordi: "Far går på arbejde, og mor og børn vinker. Billedet viser trygheden, og sloganet siger resten." },
                { t: "Med tal for arbejdsløsheden", fejl: "Der er ingen tal på plakaten. Se på det, der fylder mest." },
                { t: "Med kritik af de andre partier", fejl: "Ingen andre partier er nævnt. Se på det, der fylder mest." },
                { t: "Med et billede af partiets leder", fejl: "Der er ingen politiker på plakaten. Se, hvem billedet viser." }
            ],
            saetning: "Plakaten bruger et billede af en kernefamilie, hvor far går på arbejde, mens mor og børn vinker farvel, og et kort slogan: „Gør gode tider bedre!“"
        },
        {
            ord: "Formål",
            spm: "Hvad vil afsenderen opnå med plakaten?",
            sted: "stem",
            svar: [
                { t: "At vælgerne stemmer på Socialdemokratiet", rigtig: true, fordi: "Krydset ved A er en opfordring: Sæt kryds ved liste A." },
                { t: "At flere familier får børn", fejl: "Familien er et virkemiddel, ikke målet. Se på krydset nederst." },
                { t: "At oplyse neutralt om økonomien", fejl: "En valgplakat er ikke neutral. Den vil overbevise. Se på krydset nederst." },
                { t: "At flere melder sig ind i en fagforening", fejl: "Plakaten nævner ikke fagforeninger. Se på krydset nederst." }
            ],
            saetning: "Formålet er at få vælgerne til at stemme på Socialdemokratiet."
        },
        {
            ord: "Situation",
            spm: "Hvilken situation er plakaten lavet i?",
            sted: "slogan",
            svar: [
                { t: "En valgkamp, hvor Socialdemokratiet har regeringsmagten og vil beholde den", rigtig: true, fordi: "Partiet havde regeret siden 1953. Derfor kan det tage æren for de gode tider." },
                { t: "En valgkamp, hvor Socialdemokratiet har mistet magten og vil have den tilbage", fejl: "Et parti uden for regeringen ville ikke kalde tiderne gode. Hvem havde regeret siden 1953?" },
                { t: "Partiet er lige blevet stiftet og skal gøres kendt", fejl: "Socialdemokratiet blev stiftet i 1871. Hvem havde regeret siden 1953?" },
                { t: "En storkonflikt, hvor arbejdet ligger stille", fejl: "Storkonflikten var i 1956. Plakaten er fra 1960 og taler om gode tider." }
            ],
            saetning: "Den blev lavet til valgkampen før folketingsvalget i november 1960. Socialdemokratiet havde haft regeringsmagten siden 1953 og ville beholde den."
        },
        {
            ord: "Brug",
            spm: "Hvad kan en historiker bruge plakaten til?",
            sted: null,
            svar: [
                { t: "At vise, hvordan Socialdemokratiet så på familie, arbejde og økonomi omkring 1960", rigtig: true, fordi: "Plakaten viser afsenderens eget syn. Det er den en god kilde til." },
                { t: "At bevise, at alle danskere havde det godt i 1960", fejl: "Plakaten er partiets reklame for sig selv. Den beviser ikke, hvordan folk faktisk havde det." },
                { t: "At vise, hvordan en bestemt familie levede i 1960", fejl: "Billedet er stillet op til plakaten. Det viser et ideal, ikke en bestemt families hverdag." },
                { t: "Ingenting, fordi den er partisk", fejl: "En partisk kilde er stadig en kilde. Den viser, hvad afsenderen mente og ville. Hvem siger plakaten mest om?" }
            ],
            saetning: "Kilden kan bruges til at vise, hvordan Socialdemokratiet omkring 1960 så på familie, arbejde og økonomi. Den er partisk og kan ikke bruges som bevis for, hvordan danskerne faktisk havde det."
        }
    ]
};

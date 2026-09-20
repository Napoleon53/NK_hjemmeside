/* =====================================================================
   tekst.js - al prosa i forsoeget

   Ét sted for hvert ord, eleven laeser: titlen, introen, panelets kort,
   rundvisningens stop og senere trinnenes tekster, hints, quizzen og
   billedteksterne. Det gaar to veje: en oevelsesvejledning kan
   oversaettes til denne ene fil, og hele forsoegets sprog kan laeses
   igennem paa fem minutter uden at aabne kode.

   Noeglerne er id'er i index.html. side.js skriver dem ind ved start:
   en streng bliver til indholdet, en liste bliver til punkter, og en
   liste til et element med klassen tekstblokke (teoriboksen) bliver til
   afsnit, mellemrubrikker og ligninger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    NK.TEKST = {
        /* ----- Toplinjen ----------------------------------------------- */
        "titel": "Indgreb i en kemisk ligevægt",
        "top-ligning": "Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺",

        /* ----- Introen -------------------------------------------------- */
        "intro-titel": "Indgreb i en kemisk ligevægt",
        "intro-formaal":
            "Jernthiocyanat-komplekset FeSCN²⁺ er blodrødt, mens jern(III) er svagt gult og " +
            "thiocyanat farveløst. Farven fortæller altså direkte, hvor ligevægten ligger. " +
            "Du laver et indgreb i hvert glas og sammenligner med glas R, referencen, der ikke bliver rørt.",
        "intro-trin": [
            "Fyld 4 mL stamopløsning (aq) fra kolben i hvert af glas 1 til 6 og R. Glas R er referencen.",
            "Glas 1 til 3 får en spatelspids fast stof: Fe(NO₃)₃(s), C-vitamin (ascorbinsyre, C₆H₈O₆(s)) og KSCN(s).",
            "Glas 4 får et par dråber AgNO₃(aq), som fjerner SCN⁻(aq) som hvidt AgSCN(s).",
            "Glas 5 i vandbadet, glas 6 i isbadet. Mål temperaturen med termometeret.",
            "Sammenlign hvert glas med glas R, og notér om det blev mørkere eller lysere.",
            "Del 2: fire bægerglas i to par. Begge glas i par 1 får lige meget frugtfarve (aq), og begge glas i par 2 lige meget ligevægtsblanding (aq).",
            "Fortynd det ene glas i hvert par med vand, H₂O(l), så de to glas i parret får forskelligt rumfang. Se så alle fire ovenfra, og sammenlign i hvert par det fortyndede glas med det ufortyndede."
        ],
        "intro-uheld":
            "Forkerte handlinger afvises ikke. Det, der kan gå galt, går galt, og Kemichael rydder op.",

        /* ----- De to dele ----------------------------------------------- */
        "forfra-del2": "Begge dele er ryddet. Vi begynder forfra i del 1.",
        "del1-gjort": "Del 1 er gjort. Gå videre til del 2 med den grønne pil ved plakaten, når du er klar.",
        "del1knap": "Del 1: Glassene",
        "del2knap": "Del 2: Fortynding",

        /* ----- Panelet --------------------------------------------------- */
        "glas-tom-start":
            "Klik på et glas for at se rumfang, temperatur og indhold. Alt andet gør du ved at trække.",
        "tilskuere-tekst": "Vis tilskuerioner",
        /* ----- Teoriboksen (knappen Teori, »Læs teorien« eller T) -------
           Blokke: en streng er et afsnit, { overskrift } en mellemrubrik,
           { ligning } en ligning i sin egen ramme. */
        "teori-titel": "Indgreb i en kemisk ligevægt",
        "teori-indhold": [
            "Jern(III)ioner reagerer med thiocyanat og danner et rødt kompleks. Reaktionen er reversibel:",
            { ligning: "Fe³⁺(aq) + SCN⁻(aq) ⇌ FeSCN²⁺(aq)" },
            "Farven viser, hvor meget FeSCN²⁺ der er. Bliver farven mørkere, er ligevægten forskudt " +
            "mod højre. Bliver den lysere, er den forskudt mod venstre.",
            { overskrift: "Ligevægtsloven" },
            { ligning: "K = [FeSCN²⁺] / ([Fe³⁺] · [SCN⁻])", lille: true },
            "Efter et indgreb er reaktionsbrøken Y forskellig fra K. Ligevægten forskydes, til Y " +
            "igen er lig med K.",
            { overskrift: "Glas 1 til 4" },
            "Fe(NO₃)₃(s) og KSCN(s) øger koncentrationen af Fe³⁺ og SCN⁻, så ligevægten forskydes mod " +
            "højre. Ascorbinsyre reducerer Fe³⁺ til Fe²⁺, som ikke indgår i ligevægten:",
            { ligning: "2 Fe³⁺ + C₆H₈O₆ → 2 Fe²⁺ + C₆H₆O₆ + 2 H⁺", lille: true },
            "Ag⁺ fælder SCN⁻ som et hvidt bundfald. I begge tilfælde forskydes ligevægten mod venstre:",
            { ligning: "Ag⁺(aq) + SCN⁻(aq) → AgSCN(s)", lille: true },
            { overskrift: "Glas 5 og 6" },
            "Reaktionen mod højre er exoterm (ΔH = −20 kJ/mol). Opvarmning gør K mindre og forskyder " +
            "ligevægten mod venstre. Afkøling gør K større og forskyder den mod højre.",
            { overskrift: "Fast stof og variabelkontrol" },
            "Fe(NO₃)₃ og KSCN tilsættes som fast stof. En opløsning ville også fortynde glasset, og så " +
            "var der to indgreb på én gang.",
            { overskrift: "Fortynding" },
            "Fortyndes en frugtfarve til dobbelt rumfang, halveres koncentrationen, men væsken står " +
            "dobbelt så højt. Set ovenfra er lysvejen derfor dobbelt så lang, lyset møder lige mange " +
            "farvestofmolekyler, og farven er uændret. Set fra siden er vejen den samme som før, og " +
            "glasset ser lysere ud — men det siger kun, at koncentrationen faldt.",
            "I ligevægtsblandingen er der også lige meget stamopløsning i de to glas, men her bliver det " +
            "fortyndede glas lysere, også set ovenfra. Alle koncentrationer halveres, og Y bliver dobbelt så stor som K:",
            { ligning: "Y = ½[FeSCN²⁺] / (½[Fe³⁺] · ½[SCN⁻]) = 2K", lille: true },
            "Ligevægten forskydes mod venstre, der dannes mindre FeSCN²⁺, og farven ovenfra bliver " +
            "lysere. Forskellen mellem de to par er beviset for, at fortynding i sig selv er et " +
            "indgreb i ligevægten.",
            { overskrift: "Sikkerhed og affald" },
            "AgNO₃ er ætsende og giver sorte pletter på huden. Brug handsker og briller. Resterne " +
            "afleveres som surt uorganisk affald."
        ],

        /* ----- Forløbets trin ---------------------------------------------
           Hvert trin har en tekst (hvad eleven skal), et kort navn til
           listen og et hint. Betingelsen for, hvornår trinnet er gjort,
           står i js/forloeb.js — teksten og betingelsen holdes adskilt,
           så sproget kan læses og rettes uden at røre logikken.
           Et trin kan have et sig: det, Kemichael siger, når trinnet er
           gjort. Kort og tørt, og ikke ved hvert trin — han taler ikke
           hele tiden. */
        "trin": {
            "fyld":  { kort: "Fyld de syv glas",
                       tekst: "Hæld stamopløsning (aq) fra kolben i glas 1 til 6 og R — 4 mL i hvert.",
                       hint: "Tag fat i kolben, og slip den over et glas. Den bliver hængende, så et klik hælder igen." },
            "glas1": { kort: "Glas 1: mere Fe³⁺",
                       tekst: "Giv glas 1 en spatelspids Fe(NO₃)₃(s). Hvad sker der med farven?",
                       hint: "Slip spatlen over pulverglasset med Fe(NO₃)₃(s), og derefter over glas 1." },
            "glas2": { kort: "Glas 2: C-vitamin",
                       tekst: "Giv glas 2 en spatelspids C-vitamin (ascorbinsyre, C₆H₈O₆(s)). Den reducerer Fe³⁺(aq) til Fe²⁺(aq).",
                       hint: "C-vitamin er ascorbinsyre. Spatelspidsen tages i pulverglasset med C-vitamin og slippes over glas 2." },
            "glas3": { kort: "Glas 3: mere SCN⁻",
                       tekst: "Giv glas 3 en spatelspids KSCN(s).",
                       hint: "Pulverglasset med KSCN(s) står ved siden af de to andre." },
            "glas4": { kort: "Glas 4: AgNO₃",
                       tekst: "Dryp et par dråber AgNO₃(aq) i glas 4. Sølv fælder thiocyanat som hvidt AgSCN(s).",
                       hint: "Dråbeflasken med AgNO₃(aq) står på hylden. Slip den over glas 4, så drypper den én dråbe, og pilen giver en dråbe mere. Et par dråber er nok." },
            "varme": { kort: "Glas 5: varme",
                       tekst: "Sæt glas 5 i vandbadet, og tænd varmepladen. Mål temperaturen med termometeret.",
                       hint: "Slip glas 5 over vandbadet, og klik på varmepladens kontakt." },
            "kulde": { kort: "Glas 6: kulde",
                       tekst: "Sæt glas 6 i isbadet, og lad det stå, til det er koldt.",
                       hint: "Isbadet står til højre. Slip glas 6 ned i det." },
            "billede": { kort: "Tag billedet",
                       tekst: "Tag et billede af stativet, og notér under hvert glas, om det blev mørkere, lysere eller ser ud som glas R.",
                       hint: "Knappen Tag billede står her i panelet. Glassene på billedet bliver stående, som de ser ud nu.",
                       sig: "Noteret. Så tæller det." },
            "ryd":   { kort: "Ryd op",
                       tekst: "Hæld glassene ud i dunken med surt uorganisk affald, ét ad gangen.",
                       hint: "Tag et glas, og slip det over affaldsdunken.",
                       sig: "Ryddet op. Så tager vi del 2." },

            /* ----- Del 2: fortyndingen ------------------------------- */
            "farve": { kort: "Par 1: frugtfarve",
                       tekst: "Giv begge glas i par 1 lige meget frugtfarve (aq): én portion i hvert. Hæld så vand, H₂O(l), i, til der er mindst 30 mL i hvert glas.",
                       hint: "Flasken er en stamflaske: én hældning er 5 mL, og det er nok. Vandet kommer fra sprøjteflasken: skriv et tal i »Fyld op til«, eller giv en sjat ad gangen. Der skal mindst 30 mL i hvert glas, ellers er laget for tyndt til at se ned i." },
            "lv":    { kort: "Par 2: ligevægtsblanding",
                       tekst: "Hæld lige meget ligevægtsblanding (stamopløsning, aq) i begge glas i par 2.",
                       hint: "Tag kolben til venstre eller bægerglasset med stamopløsning fra hylden. Kolben giver 40 mL pr. hældning, bægerglasset 25. Får de to glas ikke lige meget, måler du noget andet end fortyndingen." },
            "vand":  { kort: "Fortynd ét glas i hvert par",
                       tekst: "Fortynd ét glas i hvert par med vand, H₂O(l), så de to glas i parret får forskelligt rumfang. Sigt efter dobbelt rumfang.",
                       hint: "Sprøjteflasken står på hylden. Skriv fx det dobbelte i »Fyld op til«, eller giv en sjat ad gangen. Mere vand gør bare forskellen tydeligere." },
            "sml":   { kort: "Se de fire glas ovenfra",
                       tekst: "Se de fire glas ovenfra, og notér for hvert par, om det fortyndede glas er mørkere, lige så mørkt eller lysere end det ufortyndede.",
                       hint: "Knappen Se ovenfra står her i panelet. Ovenfra er lysvejen væskens dybde — det er derfor, fortyndingen kan aflæses dér og ikke fra siden.",
                       sig: "Der har du det. To glas, to svar." }
        },
        "forloeb-slut": "Alle tretten trin er gjort. Begge dele er i hus.",

        /* ----- Billedet ------------------------------------------------- */
        "billede-titel": "Billedet",
        "billede-tekst": "Glassene, som de så ud, da du trykkede. Notér under hvert glas, hvordan det ser ud i forhold til glas R, som ikke fik noget indgreb.",

        /* ----- De fire glas ovenfra (del 2) ------------------------------ */
        "ovenfra-titel": "De fire glas set ovenfra",
        "ovenfra-tekst":
            "Ovenfra går lyset gennem væskens dybde og ikke gennem glassets bredde. Fortyndes et glas " +
            "til det dobbelte, halveres koncentrationen, men dybden fordobles. Sammenlign i hvert par " +
            "det fortyndede glas med det ufortyndede ved siden af: er det fortyndede mørkere, lige så mørkt eller lysere?",
        "ovenfra-valg": { moerkere: "Fortyndet er mørkere", ens: "Lige så mørkt", lysere: "Fortyndet er lysere" },
        "ovenfra-mangler": "Hæld den samme opløsning i begge glas i parret.",
        "ovenfra-ufortyndet": "Fortynd det ene glas i parret med vand.",
        "ovenfra-ikke-klar": "Parret er ikke klar: begge glas skal have den samme opløsning, og det ene skal være fortyndet.",

        /* ----- Kemichaels bemærkninger undervejs -------------------------
           Udløserne i js/forloeb.js. Han siger dem selv, én linje ad gangen
           (en liste er flere bobler efter hinanden), så hver linje er kort.
           Sarkasmen rammer handlingen, aldrig eleven, og han forklarer
           ikke teori. Er der ingen lærer på siden, vises linjerne som en
           besked i stedet. */
        "sig-reference": ["Glas R skulle stå urørt.", "Nu er der ikke noget at sammenligne med."],
        "sig-to-indgreb": ["To indgreb i det samme glas.", "Så ved man ikke, hvad der virkede."],
        "sig-kig-igen": ["Et af glassene er noteret anderledes, end det ser ud.", "Kig en gang til. Jeg har tid."],
        "sig-kunst": ["Frugtfarve og ligevægt i samme glas.", "Kunstnerisk. Men ikke et forsøg."],
        "sig-termometer": ["Termometeret siger {{termometer.T}}.", "Så er glas 5 varmt nok. Se på farven."],
        "sig-skaevt-op": ["De to glas i parret har ikke lige meget stof i sig.", "Så er det ikke fortyndingen, du måler."],

        /* ----- Quizzen ---------------------------------------------------
           Rammen staar i ../../laboratoriet/js/quiz.js; her staar kun
           spoergsmaalene. Fire svar hver, blandet ved hvert forsoeg, saa
           »rigtig« er nummeret her i listen og ikke paa skaermen.
           Forklaringen vises ogsaa ved rigtigt svar - det er dér, der
           bliver lært noget. */
        "quiz": {
            laast: "Låses op, når der er taget billede af glas 1–6 og R.",
            klar: "Billedet af glassene er taget.",
            spoergsmaal: [
                {
                    sp: "Hvilket stof giver stamopløsningen den rødbrune farve?",
                    valg: ["FeSCN²⁺", "Fe³⁺", "SCN⁻", "NO₃⁻"],
                    rigtig: 0,
                    forklaring: "Komplekset FeSCN²⁺ er rødt. Fe³⁺ er svagt gult, og SCN⁻ og NO₃⁻ er farveløse. Jo mere FeSCN²⁺, jo mørkere farve."
                },
                {
                    sp: "I glas 1 tilsættes fast Fe(NO₃)₃. Hvad sker der?",
                    valg: [
                        "Ligevægten forskydes mod højre, og farven bliver mørkere",
                        "Ligevægten forskydes mod venstre, og farven bliver lysere",
                        "Ligevægten ændrer sig ikke, men farven bliver gul",
                        "K bliver større, og farven bliver mørkere"
                    ],
                    rigtig: 0,
                    forklaring: "Mere Fe³⁺ gør Y mindre end K. Ligevægten forskydes mod højre, indtil Y igen er lig med K, og der dannes mere FeSCN²⁺. K er uændret."
                },
                {
                    sp: "Hvorfor bliver glas 2 lysere, når der tilsættes ascorbinsyre?",
                    valg: [
                        "Ascorbinsyre reducerer Fe³⁺ til Fe²⁺, så ligevægten forskydes mod venstre",
                        "Ascorbinsyre fortynder opløsningen",
                        "Ascorbinsyre fælder SCN⁻ som et bundfald",
                        "Ascorbinsyre gør opløsningen varmere"
                    ],
                    rigtig: 0,
                    forklaring: "2 Fe³⁺ + C₆H₈O₆ → 2 Fe²⁺ + C₆H₆O₆ + 2 H⁺. Fe²⁺ indgår ikke i ligevægten. Når [Fe³⁺] falder, forskydes ligevægten mod venstre, og FeSCN²⁺ bliver brugt op."
                },
                {
                    sp: "I glas 3 er der tilsat KSCN, og en ny ligevægt har indstillet sig. Hvad er der sket med koncentrationen af frie Fe³⁺-ioner?",
                    valg: ["Den er faldet", "Den er steget", "Den er uændret", "Den er blevet nul"],
                    rigtig: 0,
                    forklaring: "Mere SCN⁻ forskyder ligevægten mod højre. Noget af det frie Fe³⁺ bindes i FeSCN²⁺, så [Fe³⁺] falder."
                },
                {
                    sp: "Frugtfarve fortyndes til dobbelt rumfang og ses ovenfra. Hvordan ser det fortyndede glas ud i forhold til det ufortyndede?",
                    valg: [
                        "Lige så mørkt, fordi lyset møder lige mange farvestofmolekyler",
                        "Lysere, fordi koncentrationen er halveret",
                        "Mørkere, fordi der er mere væske",
                        "Lysere, fordi farvestoffet reagerer med vandet"
                    ],
                    rigtig: 0,
                    forklaring: "Koncentrationen halveres, men væsken står dobbelt så højt. Lysvejen ovenfra bliver dobbelt så lang, så lyset møder lige mange farvestofmolekyler. Frugtfarven er ikke en ligevægt, så intet forskydes."
                },
                {
                    sp: "Hvorfor bliver glas 4 lysere, når der dryppes AgNO₃ i?",
                    valg: [
                        "Ag⁺ fjerner SCN⁻, og ligevægten forskydes mod venstre",
                        "Ag⁺ reagerer med Fe³⁺, så der dannes mere FeSCN²⁺",
                        "Bundfaldet dækker for farven",
                        "AgNO₃ fortynder opløsningen"
                    ],
                    rigtig: 0,
                    forklaring: "Når SCN⁻ fældes, falder [SCN⁻], og Y bliver større end K. Ligevægten forskydes mod venstre, og FeSCN²⁺ bliver brugt op."
                },
                {
                    sp: "Glas 5 i det varme vandbad bliver lysere. Hvad viser det om reaktionen Fe³⁺ + SCN⁻ → FeSCN²⁺?",
                    valg: [
                        "Den er exoterm",
                        "Den er endoterm",
                        "Den går hurtigere, men ligevægten er den samme",
                        "Den stopper ved høj temperatur"
                    ],
                    rigtig: 0,
                    forklaring: "Ved opvarmning forskydes en ligevægt i den endoterme retning. Farven bliver lysere, så ligevægten forskydes mod venstre. Reaktionen mod højre er derfor exoterm."
                },
                {
                    sp: "Hvad sker der med K, når glas 6 står i isbadet?",
                    valg: ["K bliver større", "K bliver mindre", "K er uændret", "K bliver nul"],
                    rigtig: 0,
                    forklaring: "K afhænger kun af temperaturen. Reaktionen mod højre er exoterm, så K bliver større, når temperaturen falder. Y er nu mindre end K, og ligevægten forskydes mod højre."
                },
                {
                    sp: "Hvorfor tilsættes Fe(NO₃)₃ og KSCN som fast stof, (s), i glas 1 og 3?",
                    valg: [
                        "En opløsning ville også fortynde glasset, så der ikke er variabelkontrol",
                        "Fast stof reagerer hurtigere end opløste ioner",
                        "Fast stof giver altid en mørkere farve",
                        "En opløsning ville fælde jernet"
                    ],
                    rigtig: 0,
                    forklaring: "Med fast stof ændres kun koncentrationen af det tilsatte stof. En opløsning ville samtidig fortynde, og fortynding er selv et indgreb, der forskyder ligevægten."
                },
                {
                    sp: "Ligevægtsblandingen fortyndes til dobbelt rumfang og ses ovenfra. Hvad sker der?",
                    valg: [
                        "Den bliver lysere, fordi Y bliver større end K, og ligevægten forskydes mod venstre",
                        "Den ser ens ud, fordi antallet af farvede partikler er det samme",
                        "Den bliver mørkere, fordi Y bliver mindre end K",
                        "Den bliver lysere, fordi vandet ødelægger FeSCN²⁺"
                    ],
                    rigtig: 0,
                    forklaring: "Når alle koncentrationer halveres, fordobles Y. Y er større end K, så ligevægten forskydes mod venstre, og der bliver færre FeSCN²⁺. Frugtfarve ser derimod ens ud ovenfra, fordi antallet af farvestofmolekyler er det samme — og det er hele pointen i del 2."
                }
            ]
        },

        /* ----- Tegneserien -----------------------------------------------
           Rammen staar i ../../laboratoriet/js/tegneserie.js, og hvilke
           ruder sb2.4 har, staar i js/serie.js. Her staar kun ordene.
           {nr}, {ord}, {gange} og de andre tuborgklammer byttes ud med
           elevens egne tal og svar. */
        "serie": {
            titel: "Tegneserien",
            laast: "Tegneserien låses op, når begge dele er gjort.",
            klar: "Sådan gik forsøget. Ruderne er tegnet af det, du selv noterede.",

            stam: "Stamopløsningen af Fe(NO₃)₃ og KSCN er brændt orange. Farven skyldes komplekset FeSCN²⁺. Kolben er dagens portion; bægerglasset på hylden er forrådet.",

            glas: "Glas {nr}",
            /* F40: tegneserien gentager elevens egen iagttagelse og siger,
               hvad teorien forventer. Den retter ikke iagttagelsen. */
            noteret: {
                "moerkere": "Du noterede, at det blev mørkere end glas R.",
                "lysere": "Du noterede, at det blev lysere end glas R.",
                "ens": "Du noterede, at det ikke blev synligt anderledes end glas R."
            },
            ukendt: "blev ikke ændret i forhold til glas R",
            reference: "referencen",
            refKort: "ref.",

            ord: {
                "moerkere": "mørkere",
                "lysere": "lysere",
                "ens": "ikke synligt anderledes"
            },
            kort: { "moerkere": "mørk", "lysere": "lys", "ens": "som 7" },

            /* Indgrebet laeses af, hvad der ER i glasset (js/serie.js) */
            indgreb: {
                fe:    { hvad: "har mere jern i sig end glas R", kort: "mere Fe³⁺", forventet: "moerkere",
                         hvorfor: "Mere Fe³⁺ forskyder ligevægten mod højre, så der dannes mere FeSCN²⁺." },
                scn:   { hvad: "har mere thiocyanat i sig end glas R", kort: "mere SCN⁻", forventet: "moerkere",
                         hvorfor: "Mere SCN⁻ forskyder ligevægten mod højre, så der dannes mere FeSCN²⁺." },
                vitc:  { hvad: "indeholder Fe²⁺", kort: "C-vitamin", forventet: "lysere",
                         hvorfor: "Ascorbinsyre reducerer Fe³⁺ til Fe²⁺. Så falder [Fe³⁺], og ligevægten forskydes mod venstre." },
                ag:    { hvad: "indeholder et hvidt bundfald af AgSCN", kort: "AgNO₃", forventet: "lysere",
                         hvorfor: "Ag⁺ fælder SCN⁻ som AgSCN(s). Så falder [SCN⁻], og ligevægten forskydes mod venstre." },
                varme: { hvad: "stod i det varme vandbad", kort: "varme", forventet: "lysere",
                         hvorfor: "Dannelsen af FeSCN²⁺ er exoterm, så opvarmning forskyder ligevægten mod venstre." },
                kulde: { hvad: "stod i isbadet", kort: "kulde", forventet: "lidtMoerkere",
                         hvorfor: "Dannelsen af FeSCN²⁺ er exoterm, så afkøling forskyder ligevægten lidt mod højre. Glasset kan blive en smule mørkere, men forskellen er lille." },
                vand:  { hvad: "er fortyndet", kort: "vand", forventet: "lysere",
                         hvorfor: "Fortynding sænker alle koncentrationer. Y bliver større end K, og ligevægten forskydes mod venstre." }
            },

            billede: "Billedet af glas 1–6 og R. Glas R ved stuetemperatur er referencen, og du noterede {n} af {i alt} glas.",

            ovenfra: "De fire glas ovenfra: frugtfarven var {farve}, og ligevægtsblandingen var {lv}. Frugtfarven har lige mange farvestofmolekyler i lysvejen, uanset rumfang. I ligevægtsblandingen blev rumfanget {gange} gange så stort, alle koncentrationer faldt, Y blev større end K, og ligevægten forskød sig mod venstre.",

            par: { farve: "Frugtfarve", lv: "Ligevægt" },

            uheld: {
                spild:    "Uheld: {glas} blev rystet så voldsomt, at en tiendedel af indholdet røg ud på bordet.",
                rystet:   "Uheld: {glas} blev rystet så voldsomt, at en tiendedel af indholdet røg ud på bordet.",
                overloeb: "Uheld: {glas} løb over.",
                knust:    "Uheld: {glas} gik i stykker.",
                vaeltet:  "Uheld: {glas} væltede."
            },
            /* F41: kun hvis han faktisk greb ind, var det ham */
            oprydning: {
                laerer: "Kemichael så det og tørrede op.",
                laererKnust: "Kemichael så det og fejede skårene op.",
                elev: "Du tørrede selv op.",
                ingen: "Ingen tørrede op."
            },

            skema: {
                titel: "Resultatskemaet: sådan endte forsøget.",
                del1: "Del 1: de syv glas",
                del2: "Del 2: fortynding set ovenfra",
                hoved1: ["Glas", "Det, der er i glasset", "Temperatur", "Du noterede", "Teorien forventer"],
                hoved2: ["Opløsning", "Rumfang", "Du noterede (fortyndet mod ufortyndet)", "Teorien forventer"],
                tomt: "tomt",
                uroert: "urørt",
                ikkeNoteret: "ikke noteret",
                ingen: "ingen ligevægt",
                /* Det, teorien forventer, med ligevaegtens retning */
                forventet: {
                    "moerkere": "mørkere ⟶",
                    "lidtMoerkere": "lidt mørkere ⟶",
                    "lysere": "lysere ⟵",
                    "ens": "lige så mørkt"
                }
            }
        },

        /* ----- Rundvisningen --------------------------------------------- */
        "rundvisning": [
            { sel: "#scene", titel: "Bordet", tekst: "Tag fat i kolben, og slip den over et glas for at hælde. Eller klik på kolben og så på glasset. Et klik på et glas viser, hvad der er i det. Bordpladen er dyb, så du kan stille ting foran stativet." },
            { sel: "#glas-kort", titel: "Det valgte glas", tekst: "Klik på et glas, og se rumfang og temperatur her. Indholdet i tal folder du ud, og partiklerne ses i zoomboblen i laboratoriets venstre hjørne. Klik på boblen for at se den stor." },
            { sel: "#top-ligning", titel: "Ligevægten", tekst: "Reaktionen, det hele handler om. Teorien bag hvert indgreb ligger under knappen Teori ved siden af — det gør tasten T også." },
            { sel: "#noterknap", titel: "Noter", tekst: "Fold noterne ud og skriv dine iagttagelser. »Notér det valgte glas« skriver aflæsningen ind for dig. Tasten N folder dem ud og ind." },
            { sel: "#delknapper", titel: "De to dele", tekst: "Del 1 er de syv glas med hvert sit indgreb. Del 2 er fortyndingen med fire bægerglas. Skift med knapperne eller tasterne 1 og 2 — bordet har kun det fremme, du arbejder med." },
            { sel: "#quiz-kort", titel: "Quizzen", tekst: "Ti spørgsmål om det, du lige har set. Den låses op, når billedet er taget, og svarene blandes hver gang. Begrundelsen kommer, også når du svarer rigtigt." },
            { sel: "#serie-kort", titel: "Tegneserien", tekst: "Hele forsøget i ruder, når begge dele er gjort. Ruderne er tegnet af det, du selv noterede — også efter at glassene er hældt ud. Tasten G åbner og lukker den." },
            { sel: "#uheld-kort", titel: "Uheld", tekst: "Det, der kan gå galt, går galt. Kemichael kommer og tørrer op." },
            { sel: "#forfraknap", titel: "Start forfra", tekst: "Rydder bordet og stiller alt tilbage." }
        ]
    };
}());

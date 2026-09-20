/* =====================================================================
   tekst.js - al prosa i sc2.7

   Ét sted for hvert ord, eleven laeser: titlen, introen, teorien,
   trinnenes tekster og hints, beskederne om afvejningen og maalingerne,
   Kemichaels replikker og rundvisningens stop. Noeglerne er id'er i
   index.html; side.js skriver dem ind ved start. Teorien og trinnene er
   den gamle sc2.7's, skrevet om til motorens betjening (traek og slip,
   eller klik paa det, der skal bruges, og saa paa maalet).

   Reglen fra F65 gaelder: en aktuel koncentration skrives [Pb²⁺]; c(X)
   bruges kun om det, der er opløst eller staar paa flasken.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    NK.TEKST = {
        /* ----- Toplinjen ----------------------------------------------- */
        "titel": "Opløselighed af blyiodid",
        "top-ligning": "Pb²⁺(aq) + 2 I⁻(aq) ⇌ PbI₂(s)",

        /* ----- Introen -------------------------------------------------- */
        "intro-titel": "Opløselighed af blyiodid",
        "intro-formaal":
            "Pb(NO₃)₂ og KI danner et gult bundfald af PbI₂. Forsøget måler, hvordan " +
            "opløseligheden af PbI₂ afhænger af temperaturen: hvor meget PbI₂ der kan være " +
            "opløst i 100 mL vand ved en given temperatur.",
        "intro-trin": [
            "Hæld 100 mL vand, H₂O(l), fra måleglasset i bægerglasset på varmepladen.",
            "Afvej ca. 0,100 g Pb(NO₃)₂(s) på vejebåden, og hæld det i vandet. Afvej samme masse KI(s), og hæld det i.",
            "Sæt termometeret i bægerglasset. Varm op under omrøring, til det gule bundfald, PbI₂(s), er væk.",
            "Sluk for varmen og omrøringen, og notér temperaturen, når de første krystaller kommer.",
            "Tilsæt ca. 0,050 g mere af hvert stof, og mål igen, til der er tre målinger.",
            "Aflever resterne i dunken til tungmetalaffald."
        ],
        "intro-uheld":
            "Forkerte handlinger afvises ikke, bortset fra afvejningen: vejebåden hældes først i, når massen passer. " +
            "Det, der kan gå galt, går galt, og Kemichael rydder op.",

        /* ----- Panelet --------------------------------------------------- */
        "glas-tom-start":
            "Klik på et glas for at se rumfang, temperatur og indhold. Alt andet gør du ved at trække.",
        "tilskuere-tekst": "Vis tilskuerioner",

        /* ----- Teoriboksen ----------------------------------------------- */
        "teori-titel": "Opløselighed af blyiodid",
        "teori-indhold": [
            { overskrift: "Fældning" },
            "Pb(NO₃)₂ og KI er letopløselige salte. I vandet findes ionerne Pb²⁺, NO₃⁻, K⁺ og I⁻. " +
            "Pb²⁺ og I⁻ danner det tungtopløselige salt PbI₂, der fældes som et gult bundfald:",
            { ligning: "Pb²⁺(aq) + 2 I⁻(aq) → PbI₂(s)" },
            "K⁺ og NO₃⁻ er tilskuerioner.",
            { overskrift: "Samme masse" },
            "Der skal to I⁻ til hver Pb²⁺. M(Pb(NO₃)₂) = 331,2 g/mol er næsten det dobbelte af " +
            "M(KI) = 166,0 g/mol. Samme masse af de to stoffer giver derfor dobbelt så mange mol KI som Pb(NO₃)₂:",
            { ligning: "Pb(NO₃)₂ + 2 KI → PbI₂ + 2 KNO₃" },
            { overskrift: "Opløselighed og temperatur" },
            "Opløseligheden er den største masse af et stof, der kan opløses i 100 mL vand. For PbI₂ er den " +
            "0,044 g ved 0 °C, 0,069 g ved 20 °C og 0,41 g ved 100 °C. Ved opvarmning opløses bundfaldet. " +
            "Ved afkøling falder opløseligheden, og PbI₂ krystalliserer igen som glinsende, gule flager.",
            "Når de første krystaller kommer, er opløsningen netop mættet, og massen af PbI₂ pr. 100 mL er " +
            "opløseligheden ved den temperatur. Derfor giver hver måling ét punkt på opløselighedskurven.",
            { overskrift: "Beregning" },
            "Stofmængden af Pb(NO₃)₂ er n = m / M. Der dannes lige så mange mol PbI₂, og massen er " +
            "m(PbI₂) = n · 461,0 g/mol. 0,100 g Pb(NO₃)₂ giver 0,139 g PbI₂, og det er netop opløst ved ca. 52 °C.",
            { overskrift: "Sikkerhed" },
            "Pb(NO₃)₂ er giftigt, brandnærende og kan skade forplantningsevnen. Brug handsker, og undgå spild. " +
            "Resterne indeholder bly og afleveres som tungmetalaffald."
        ],

        /* ----- Forløbets trin -------------------------------------------- */
        trin: {
            vand: {
                kort: "100 mL vand i bægerglasset",
                tekst: "Hæld 100 mL vand fra måleglasset i bægerglasset på varmepladen.",
                hint: "Træk måleglasset hen over bægerglasset, og slip det. Eller klik på måleglasset og så på bægerglasset."
            },
            pb: {
                kort: "Ca. 0,100 g Pb(NO₃)₂",
                tekst: "Afvej ca. 0,100 g Pb(NO₃)₂(s) på vejebåden, og hæld det i vandet.",
                hint: "Træk glasset med Pb(NO₃)₂ hen over vejebåden: en ren spatel tager en spatelspids på 0,04–0,06 g. " +
                      "Vægten skal vise 0,090–0,110 g. Er der for meget, tager en tom spatel lidt af igen. Træk så vejebåden hen over bægerglasset."
            },
            ki: {
                kort: "Samme masse KI",
                tekst: "Afvej samme masse KI(s), højst 0,010 g fra, og hæld det i.",
                hint: "Træk glasset med KI hen over vejebåden, til vægten viser samme masse som Pb(NO₃)₂. " +
                      "For meget tages af med en tom spatel. Hæld så vejebåden i bægerglasset."
            },
            klar: {
                kort: "Varm op, til bundfaldet er væk",
                tekst: "Sæt termometeret i bægerglasset, og varm op under omrøring, til det gule bundfald er væk.",
                hint: "Træk termometeret over i bægerglasset. Tænd for varmen (venstre knap på varmepladen) og omrøringen (højre knap). " +
                      "Hold øje med glasset og zoomboblen: opløsningen skal blive helt klar."
            },
            maal1: {
                kort: "Første måling",
                tekst: "Sluk for varmen og omrøringen, og notér temperaturen, når de første krystaller kommer.",
                hint: "Klik på de to knapper på varmepladen, så de slukker. Så snart de første gule krystaller kommer, " +
                      "trykker du på Notér temperatur (eller K)."
            },
            maal3: {
                kort: "Tre målinger",
                tekst: "Tilsæt ca. 0,050 g af hvert stof, og mål igen, til der er tre målinger.",
                hint: "Afvej ca. 0,050 g Pb(NO₃)₂ (0,040–0,060 g) og samme masse KI, og hæld dem i. Varm op, til bundfaldet er væk, " +
                      "sluk, og notér temperaturen, når krystallerne kommer."
            },
            affald: {
                kort: "Aflever resterne",
                tekst: "Aflever resterne i dunken til tungmetalaffald.",
                hint: "Resterne indeholder bly. Træk bægerglasset hen over dunken til tungmetalaffald."
            }
        },
        "forloeb-slut": "Alle trin er gjort. Målingerne står under Målinger.",

        /* ----- Målingerne og afvejningen (js/maaling.js) ----------------- */
        maaling: {
            "tom": "Ingen målinger endnu. Notér temperaturen, når de første krystaller kommer.",
            "kolonner": ["Nr.", "Pb(NO₃)₂", "KI", "PbI₂", "Temperatur"],
            "noteret": "Måling {n}: de første krystaller kom ved {T} °C.",
            "intet-glas": "Der er intet bægerglas.",
            "intet-stof": "Der er ikke noget at måle endnu. Hæld Pb(NO₃)₂ og KI i vandet først.",
            "termometer": "Sæt termometeret i bægerglasset, så du kan aflæse temperaturen.",
            "allerede": "Den måling er noteret. Tilsæt ca. 0,050 g mere af hvert stof, og mål igen.",
            "ikke-klar": "Varm op, til bundfaldet er helt væk. Så kan du måle, når krystallerne kommer igen.",
            "ingen-krystaller": "Der er ingen krystaller endnu. Vent, til de første kommer.",
            "blandet": "Der er to stoffer på vejebåden. Hæld den i affaldet, og afvej forfra.",
            "foerst-ki": "Hæld KI i, før der kommer mere Pb(NO₃)₂.",
            "foerst-pb": "Hæld Pb(NO₃)₂ i først, og så samme masse KI.",
            "pb-vindue": "Afvej ca. {m} g Pb(NO₃)₂: mellem {a} og {b} g. Vægten viser {g} g.",
            "ki-vindue": "KI skal have samme masse som Pb(NO₃)₂: {m} g, højst 0,010 g fra. Vægten viser {g} g."
        },

        /* ----- Grafen i målingskortet (js/maaling.js, M9) ----------------- */
        graf: {
            x: "Temperatur",
            y: "Opløselighed",
            yEnhed: "g PbI₂ pr. 100 mL",
            punkter: "Dine målinger",
            kurve: "Tabelværdier",
            note: "Hvert punkt er en måling: temperaturen, og hvor meget PbI₂ der er i 100 mL. Kurven med tabelværdierne kommer, når du har tre målinger.",
            noteFaerdig: "Den stiplede kurve er tabelværdierne. Jo tættere dine punkter ligger på den, jo bedre passer dine målinger."
        },

        /* ----- Kemichaels replikker (udløserne i js/forloeb.js) ------------ */
        "sig-for-meget": [
            "Det koger, og der er stadig bundfald.",
            "Så er der mere stof, end 100 mL vand kan opløse. Start forfra, og brug mindre."
        ],
        "sig-tre-rigtige": [
            "Tre målinger, og de ligger alle på kurven.",
            "Det er sådan, en tabel over opløselighed bliver til."
        ],

        /* ----- Rundvisningen (js/tur.js) --------------------------------- */
        "rundvisning": [
            { sel: "#scene", titel: "Bordet", tekst: "Træk det, der skal bruges, hen over det, det skal bruges på, og slip. Eller klik på det og så på målet. Vægten viser tre decimaler, og varmepladen har en knap til varmen og en til omrøringen." },
            { sel: "#glas-kort", titel: "Det valgte glas", tekst: "Klik på et glas, og se rumfang, temperatur og indhold. Partiklerne ses i zoomboblen i laboratoriets venstre hjørne." },
            { sel: "#top-ligning", titel: "Fældningen", tekst: "Reaktionen, det hele handler om. Teorien ligger under knappen Teori, eller tasten T." },
            { sel: "#forloeb-kort", titel: "Forløbet", tekst: "Trinnene får flueben, når bordet ser rigtigt ud. Hint viser, hvad du skal gøre, og markerer det, det handler om." },
            { sel: "#maaleknap", titel: "Notér temperatur", tekst: "Tryk her (eller K), så snart de første krystaller kommer, når opløsningen køler af. Termometeret skal sidde i bægerglasset." },
            { sel: "#maaling-kort", titel: "Målingerne", tekst: "Hver måling står her med masserne, den masse PbI₂ der kan dannes, og temperaturen. Grafen viser målingerne, og når du har tre, kommer kurven med tabelværdierne." },
            { sel: "#noterknap", titel: "Noter", tekst: "Uheld og det, Kemichael har sagt, står her. Dine egne noter står under Mine noter." }
        ]
    };
}());

/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   skallernes kalkindhold, syren, proeverne paa fane 1, regnevejene paa
   fane 2 (uden og med mol), de seks fejlkilder paa fane 3 og linjerne i
   opgavekortet. Kemien regnes i kemi.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1 og sc4.5) ------------------ */
    D.ATOMMASSE = { H: 101, C: 1201, O: 1600, Cl: 3545, Ca: 4008 };

    /* Molarmasserne i hundrededele: CaCO₃ 100,09 og CO₂ 44,01 g/mol */
    D.M = {
        CaCO3: D.ATOMMASSE.Ca + D.ATOMMASSE.C + 3 * D.ATOMMASSE.O,
        CO2: D.ATOMMASSE.C + 2 * D.ATOMMASSE.O
    };

    /* Vejledningens faktor: hvert gram CO₂ svarer til 2,27 g kalk
       (100,09 / 44,01 = 2,274) */
    D.FAKTOR = 2.27;

    /* Muslingeskallerne paa fane 1 og 3: hjertemusling med 96 % CaCO₃.
       Resten er mest protein og vand (typisk 95-99 % kalk). */
    D.SKAL = { navn: "hjertemusling", andel: 0.96 };
    D.TYPISK = "95-99 %";

    /* Saltsyren i kolben: 20 mL 4 M (0,080 mol HCl, langt i overskud) */
    D.SYRE = { V: 20, c: 4 };

    /* ----- Fane 1: forsoeget ---------------------------------------------------
       Proeverne i vejebaaden (g). De er valgt, saa vaegten under kolben
       aldrig ender midt mellem to hundrededele. */
    D.PROEVER = [1.02, 0.98, 1.05, 0.97, 1.07, 1.01, 0.99, 1.04];
    D.SPATEL = 0.26;           /* g pulver pr. spatelfuld */

    /* Hastigheden: foersteordens reaktion i den kalk, der ligger i kolben
       (pr. sekund), plus et lille fast bidrag (g CaCO₃ pr. sekund), saa de
       sidste korn bliver faerdige, og vaegten staar helt stille. Grove
       stykker reagerer seks gange langsommere. */
    D.K_PULVER = 0.30;
    D.K_GROV = 0.05;
    D.K_MIN = { pulver: 0.012, grov: 0.004 };

    /* Det sproejter, naar der dannes mere end 0,07 g CO₂ pr. sekund. Saa
       forsvinder 0,75 g vaeske for hvert gram CO₂ over graensen. Tre
       spatelfulde paa én gang giver 0,01 g, det hele paa én gang 0,04 g. */
    D.SPROEJT = { graense: 0.07, andel: 0.75 };


    /* gaet: det gule kort midt i scenen, foer forsoeget begynder (eleverne
       klikker, foer de laeser). start: linjen paa kortet, naar maalingen
       begynder uden et gaet. efter: forklaringen paa det groenne kort. */
    D.FORSOEG = [
        { id: "m1", titel: "Måling 1",
          valg: { intro: "Kolben med saltsyre står på en vægt, der er sat til 0,00 g. Om lidt kommer du knust muslingeskal i, og det bruser.",
                  spm: "Hvad viser vægten under kolben, når det er holdt op med at bruse?",
                  hint: "Pulveret og syren danner gassen CO₂. Hvad sker der med en gas i en åben kolbe?",
                  svar: [{ t: "Mindre, end pulveret vejede", ok: true },
                         { t: "Det samme, som pulveret vejede" },
                         { t: "Mere, end pulveret vejede" }] },
          efter: "Vægten under kolben viser mindre, end pulveret vejede. Forskellen er gassen CO₂, der er boblet op og ud af kolben." },
        { id: "m2", titel: "Måling 2",
          start: "En ny prøve og en ny kolbe med 20 mL saltsyre. Gør det samme en gang til.",
          efter: "Nu har du to målinger. På fanen Beregningen regner du ud, hvor meget kalk der var i skallerne." }
    ];

    /* De fire skridt i en maaling, som de staar oeverst paa kortet */
    D.SKRIDT = [{ id: "foer", t: "Aflæs m(før)" }, { id: "haeld", t: "Pulver i kolben" },
                { id: "vent", t: "Vent" }, { id: "efter", t: "Aflæs m(efter)" }];

    /* Det, kortet i scenen siger i hver fase af en maaling. Hver linje
       naevner selv den vaegt og det pulver, den handler om. */
    D.LINJE = {
        foer: "Klik på vægten under vejebåden. Så skrives m(før) i skemaet.",
        haeld: "Klik på pulveret i vejebåden. Så kommer en spatelfuld i kolben med saltsyre.",
        haeldVent: "Det bruser i kolben, når pulveret rammer saltsyren. Vent lidt, før du kommer mere i.",
        haeldMere: "Klik på pulveret i vejebåden igen. Alt pulveret skal i kolben.",
        vent: "Alt pulveret er i kolben. Vent, til vægten under kolben står stille.",
        efter: "Vægten står stille. Klik på vægten under kolben. Så skrives m(efter) i skemaet."
    };

    /* Skiltene i scenen ved det, der skal klikkes paa */
    D.SKILT = { foer: "Klik for at aflæse", haeld: "Klik: en spatelfuld i kolben", mere: "Klik: en spatelfuld mere",
                efter: "Klik for at aflæse" };

    D.HINT = {
        foer: "Tallet står på displayet på vægten under vejebåden. Klik på vægten, eller skriv tallet i skemaet til højre.",
        haeld: "Klik på det lyse pulver i vejebåden. Du kan også trække spatlen hen over kolben.",
        vent: "Vægten falder, så længe der dannes CO₂. Den står stille, når al kalken har reageret.",
        efter: "Tallet står på displayet på vægten under kolben. Klik på vægten."
    };

    D.SVAR = {
        foer: "Vægten under vejebåden viser {m} g.",
        haeld: "Pulveret kommer i kolben, en spatelfuld ad gangen.",
        vent: "Tiden går hurtigere, til vægten står stille.",
        efter: "Vægten under kolben viser {m} g."
    };

    /* Svar paa klik i den forkerte raekkefoelge: én linje med forklaringen */
    D.FOERST = {
        gaet: "Gæt først: vælg et af de tre svar på det gule kort.",
        foer: "Aflæs først vægten under vejebåden. Når pulveret er i kolben, kan du ikke se, hvad det vejede.",
        falder: "Vægten under kolben falder stadig. Aflæser du den nu, bliver kalkindholdet for lavt. Vent, til den står stille.",
        pulver: "Der er stadig pulver i vejebåden. Alt pulveret skal i kolben, før m(efter) aflæses.",
        sproejt: "Det sprøjtede. Dråber af syren røg ud af kolben, så vægten viser for lidt. Tryk på Start forfra, og kom pulveret i lidt ad gangen."
    };

    /* Under denne hastighed (g CO₂ pr. sekund) er der ro nok i kolben til
       en spatelfuld mere, uden at det sproejter */
    D.ROLIG = 0.022;

    /* Eksempler, hvis eleven ikke har maalt selv (samme model: 1,02 og 0,98 g) */
    D.EKSEMPEL = [{ mf: 1.02, me: 0.59 }, { mf: 0.98, me: 0.57 }];

    /* ----- Fane 2: beregningen ---------------------------------------------------
       Maaling 1 og 2 kommer fra fane 1 (eller fra D.EKSEMPEL). I maaling 2
       staar formlerne der allerede, som i vejledningen. Den sidste opgave
       gaar baglaens: fra kalkindholdet til det, vaegten falder. Den er kun
       med i vejen med mol (kunMol): baglaens regning er for svaer til HF. */
    D.BEREGNING = [
        { id: "m1", titel: "Måling 1", maaling: 0 },
        { id: "m2", titel: "Måling 2", maaling: 1, kunTal: true },
        { id: "bag", titel: "Hvor meget falder vægten?", baglaens: true, kunMol: true,
          tal: [{ skal: "østersskal", m: 2.00, p: 97 }, { skal: "blåmuslingeskal", m: 1.50, p: 96 },
                { skal: "æggeskal", m: 1.20, p: 95 }, { skal: "sneglehus", m: 0.80, p: 98 }] }
    ];

    /* Regnetrinene i hver vej */
    D.VEJE = {
        nf: { maaling: ["dm", "mk_f", "pct"], bag: ["mk_p", "mc_f"] },
        mol: { maaling: ["dm", "n_co2", "n_kalk", "mk_n", "pct"], bag: ["mk_p", "nk_m", "nc_k", "mc_n"] }
    };

    /* navn: raekkens overskrift. venstre: det, der staar foran feltet.
       formel: det, der staar paa tavlen. Hintet til formlen siger, hvad
       man kender, ikke formlen. */
    D.TRIN = {
        dm: { navn: "Massen af CO₂", spm: "Hvor meget CO₂ forsvandt fra kolben?", venstre: "m(CO₂)", enhed: "g", formel: "m(før) − m(efter)",
              formelHint: "Kolben tabte masse, fordi CO₂ forsvandt. Hvad vejede pulveret før, og hvad viste vægten efter?" },
        mk_f: { navn: "Massen af kalk", spm: "Hvor meget kalk kom den CO₂ fra?", venstre: "m(CaCO₃)", enhed: "g", formel: "m(CO₂) · 2,27",
                formelHint: "Hvert gram CO₂ kommer fra 2,27 g kalk." },
        pct: { navn: "Kalkindholdet", spm: "Hvor mange procent af prøven er kalk?", venstre: "Kalkindhold", enhed: "%", formel: "m(CaCO₃) / m(før) · 100 %",
               formelHint: "Hvor stor en del af pulveret er kalk? Del kalkens masse med hele prøvens masse, og gør det til procent." },
        n_co2: { navn: "Stofmængden af CO₂", venstre: "n(CO₂)", enhed: "mol", formel: "m(CO₂) / M(CO₂)",
                 formelHint: "Du kender massen af CO₂, og molarmassen står på tavlen." },
        n_kalk: { navn: "Stofmængden af kalk", venstre: "n(CaCO₃)", enhed: "mol", formel: "n(CO₂)",
                  formelHint: "Se på tallene foran CaCO₃ og CO₂ i reaktionsskemaet på tavlen." },
        mk_n: { navn: "Massen af kalk", venstre: "m(CaCO₃)", enhed: "g", formel: "n(CaCO₃) · M(CaCO₃)",
                formelHint: "Du kender stofmængden af kalk, og molarmassen står på tavlen. Hvert mol vejer M gram." },
        mk_p: { navn: "Massen af kalk", venstre: "m(CaCO₃)", enhed: "g", formel: "kalkindhold / 100 % · m(prøve)",
                formelHint: "Kalkindholdet siger, hvor mange procent af prøven der er kalk." },
        mc_f: { navn: "Massen af CO₂", venstre: "m(CO₂)", enhed: "g", formel: "m(CaCO₃) / 2,27",
                formelHint: "Hvert gram CO₂ kommer fra 2,27 g kalk. Vejer CO₂ mere eller mindre end kalken?" },
        nk_m: { navn: "Stofmængden af kalk", venstre: "n(CaCO₃)", enhed: "mol", formel: "m(CaCO₃) / M(CaCO₃)",
                formelHint: "Du kender massen af kalk, og molarmassen står på tavlen." },
        nc_k: { navn: "Stofmængden af CO₂", venstre: "n(CO₂)", enhed: "mol", formel: "n(CaCO₃)",
                formelHint: "Se på tallene foran CaCO₃ og CO₂ i reaktionsskemaet på tavlen." },
        mc_n: { navn: "Massen af CO₂", venstre: "m(CO₂)", enhed: "g", formel: "n(CO₂) · M(CO₂)",
                formelHint: "Du kender stofmængden af CO₂, og molarmassen står på tavlen." }
    };

    /* Uden mol vaelger eleven formlen blandt tre i stedet for at skrive den
       (brugeren 9. okt. 2026: animationen var for svaer til HF). De to
       forkerte er de fejl, elever laver, og hver har sin forklaring. Den
       rigtige er D.TRIN[id].formel. */
    D.FORMELVALG = {
        dm: [{ t: "m(før) + m(efter)", f: "Kolben tabte masse. Der skal trækkes fra, ikke lægges til." },
             { t: "m(efter) − m(før)", f: "Omvendt. Pulveret vejede mest før, så m(før) står først." }],
        mk_f: [{ t: "m(CO₂) / 2,27", f: "Kalken vejer mere end den CO₂, den giver. Der skal ganges med 2,27." },
               { t: "m(før) · 2,27", f: "Brug massen af CO₂, ikke massen af hele prøven." }],
        pct: [{ t: "m(før) / m(CaCO₃) · 100 %", f: "Brøken er vendt om. Kalkens masse står øverst." },
              { t: "m(CO₂) / m(før) · 100 %", f: "Det er CO₂'s andel af prøven. Brug massen af kalk." }]
    };

    /* ----- Fane 3: fejlkilderne --------------------------------------------------
       Gruppe A foelger vejledningen: 1,00 g toert pulver i fire portioner
       i 20 mL saltsyre, og de venter, til vaegten staar stille. Gruppe B
       goer én ting anderledes (B). rigtig: hvordan B's kalkindhold bliver.
       fejl: forklaringen til de to forkerte gaet. Raekkefoelgen gaar fra
       den fejl, der er lettest at gennemskue, til den svaereste. */
    D.FEJL_SPM = "Får gruppe B et højere eller et lavere kalkindhold end gruppe A?";
    D.FEJL_SVAR = [{ id: "hoejere", t: "Højere" }, { id: "lavere", t: "Lavere" }, { id: "samme", t: "Det samme" }];
    D.FEJL_A = "Gruppe A følger vejledningen: 1,00 g tørt pulver kommes lidt ad gangen i 20 mL saltsyre.";
    D.FEJL_KOERER = "Begge grupper laver forsøget. Hold øje med de to vægte.";

    D.FEJL = [
        { id: "tidligt", titel: "Stoppet for tidligt", kort: "aflæser for tidligt", rigtig: "lavere", B: { stop: 0.8 },
          tekst: "Gruppe B har travlt. De aflæser vægten under kolben, mens det stadig bruser.",
          hint: "Hvor meget CO₂ er forsvundet fra kolben, når det stadig bruser?",
          forkl: "Ikke al kalken havde reageret, da gruppe B aflæste vægten. Der var forsvundet for lidt CO₂, så kalkindholdet bliver for lavt.",
          fejl: { hoejere: "Vægten falder stadig, da gruppe B aflæser. m(efter) er for stor, så forskellen bliver for lille.",
                  samme: "Vægten faldt stadig, da gruppe B aflæste. Resten af CO₂ nåede ikke at forsvinde." } },
        { id: "sproejt", titel: "Det hele på én gang", kort: "alt på én gang", rigtig: "hoejere", B: { paaEnGang: true },
          tekst: "Gruppe B hælder alt pulveret i kolben på én gang. Det bruser voldsomt, og det sprøjter.",
          hint: "Vægten kan ikke se forskel på CO₂ og de dråber, der sprøjter ud af kolben.",
          forkl: "Dråber af syren sprøjter ud af kolben. Vægten kan ikke se, at det ikke er CO₂, så kalkindholdet bliver for højt. Det kan ende over 100 %.",
          fejl: { lavere: "Der forsvinder mere fra kolben, ikke mindre: både CO₂ og dråber.",
                  samme: "Dråberne, der sprøjter ud, forsvinder også fra vægten. Det ligner mere CO₂." } },
        { id: "fugt", titel: "Fugtigt pulver", kort: "fugtigt pulver", rigtig: "lavere", B: { vand: 0.10 },
          tekst: "Gruppe B har ikke tørret skallerne. Af deres 1,00 g pulver er 0,10 g vand.",
          hint: "Vandet vejer med i m(før). Giver vandet CO₂?",
          forkl: "Vandet vejer med i m(før), men det giver ingen CO₂. Der er mindre kalk i 1,00 g fugtigt pulver, så kalkindholdet bliver for lavt.",
          fejl: { hoejere: "Vandet bliver i kolben. Kun CO₂ forsvinder, og der er mindre kalk til at give CO₂.",
                  samme: "Vandet tager pladsen fra kalken i de 1,00 g. Der dannes mindre CO₂." } },
        { id: "grov", titel: "Grove stykker", kort: "grove stykker", rigtig: "samme", B: { grov: true },
          tekst: "Gruppe B knuser kun skallerne til grove stykker. De venter, til vægten under kolben står stille.",
          hint: "Reagerer store stykker også, hvis man venter længe nok?",
          forkl: "Grove stykker reagerer langsommere, fordi syren kun når overfladen. Når gruppe B venter, reagerer al kalken alligevel. Det tager bare længere tid.",
          fejl: { hoejere: "Stykkerne giver ikke mere CO₂. Der er lige så meget kalk i dem.",
                  lavere: "Det ville passe, hvis gruppe B stoppede for tidligt. Men de venter, til vægten står stille." } },
        { id: "syre", titel: "Mere syre", kort: "40 mL syre", rigtig: "samme", B: { syreV: 40 },
          tekst: "Gruppe B hælder 40 mL saltsyre i kolben i stedet for 20 mL. Vægten sættes til 0,00 g med kolben og syren på.",
          hint: "Er der syre nok hos gruppe A? Hvad bestemmer, hvor meget CO₂ der kan dannes?",
          forkl: "Der er rigeligt syre i begge kolber. Det er kalken, der bestemmer, hvor meget CO₂ der dannes, og vægten er sat til 0,00 g med syren i.",
          fejl: { hoejere: "Mere syre giver ikke mere CO₂. Når al kalken har reageret, sker der ikke mere.",
                  lavere: "Al kalken reagerer stadig. Den ekstra syre bliver bare i kolben." } },
        { id: "spild", titel: "Spildt pulver", kort: "spilder pulver", rigtig: "hoejere", B: { spild: 0.10 },
          tekst: "Gruppe B spilder 0,10 g pulver på bordet, da de hælder. De skriver stadig m(før) = 1,00 g.",
          hint: "Det spildte pulver kommer aldrig op på vægten under kolben. Hvad sker der så med m(efter)?",
          forkl: "Det spildte pulver kom aldrig i kolben, men det tæller med i m(før). Vægten under kolben ender for lavt, og forskellen ligner mere CO₂. Kalkindholdet bliver for højt.",
          fejl: { lavere: "Der dannes lidt mindre CO₂, ja. Men vægten under kolben mangler også de 0,10 g, der aldrig kom i. Forskellen m(før) − m(efter) bliver større.",
                  samme: "m(før) er 0,10 g for stor. Den masse tæller med i forskellen, som om den var CO₂." } }
    ];

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros, og hintet eller svaret, naar eleven beder om det. Et
       klik paa morteren eller muslingen giver en kort linje. */
    D.INTRO = {
        forsoeg: "",
        beregning: "Massen, kolben tabte, er CO₂. Fra den regnes kalken.",
        fejl: ""
    };
    D.FAERDIG = {
        forsoeg: "",
        beregning: "Alle opgaverne er løst. Fra CO₂ til kalkindholdet.",
        fejl: "Alle seks fejlkilder er løst. Vægten ser kun det, der forlader kolben."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    /* Paaskeaegget: den hele hjertemusling paa bordet. Morteren svarer ogsaa. */
    D.MUSLING = [
        "En hel skal reagerer også. Den er bare længe om det.",
        "Knust er den færdig på et par minutter. Hel tager den en eftermiddag.",
        "Muslingen brugte fire år på den skal. Syren skal bruge en eftermiddag."
    ];
    D.MORTER = "Skallerne er knust. Det tog ti minutter, og det var mig.";

    NK.Data = D;
}());

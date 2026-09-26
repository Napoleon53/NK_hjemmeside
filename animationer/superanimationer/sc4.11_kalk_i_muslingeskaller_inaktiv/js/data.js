/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   skallernes kalkindhold, syren, proeverne paa fane 1, regnevejene paa
   fane 2 (uden og med mol), de seks fejlkilder paa fane 3 og det,
   Kemichael siger. Kemien regnes i kemi.js; tegningen kender kun
   resultatet.
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


    D.FORSOEG = [
        { id: "m1", titel: "Måling 1", tekst: "Kom pulveret i kolben med saltsyre. Skriv begge vægtes tal i skemaet.",
          valg: { spm: "Vægten under kolben er nulstillet. Hvad viser den, når det er holdt op med at bruse?",
                  hint: "Pulveret og syren danner CO₂. Hvad sker der med en gas i en åben kolbe?",
                  svar: [{ t: "Mindre end pulveret vejede", ok: true },
                         { t: "Det samme som pulveret vejede", forkl: "Massen forsvinder ikke, men noget af den forlader kolben: CO₂ er en gas." },
                         { t: "Mere end pulveret vejede", forkl: "Der kommer intet til udefra. CO₂ forlader kolben, så vægten viser mindre." }] },
          efter: "Vægten viser mindre, end pulveret vejede. Forskellen er CO₂, der er boblet op og ud af kolben." },
        { id: "m2", titel: "Måling 2", tekst: "En ny prøve i en ny kolbe med 20 mL saltsyre. Gør det samme igen.",
          efter: "To målinger. Regn dem ud på fanen Beregningen." }
    ];

    /* Linjen i opgavekortet i hver fase af en maaling */
    D.LINJE = {
        valg: "Gæt først: vælg et af svarene herunder.",
        foer: "Aflæs vægten under vejebåden, og skriv m(før) i skemaet.",
        haeld: "Træk en spatelfuld pulver over i kolben. Lidt ad gangen.",
        vent: "Det bruser. Vent, til vægten under kolben står stille.",
        efter: "Vægten står stille. Aflæs den, og skriv m(efter) i skemaet."
    };

    D.HINT = {
        foer: "Tallet står på displayet under vejebåden. Skriv det med to decimaler.",
        haeld: "Tryk på pulveret i vejebåden, og træk spatlen hen over kolben. Et klik på pulveret virker også.",
        vent: "Vægten falder, så længe der dannes CO₂. Den står stille, når al kalken har reageret.",
        efter: "Tallet står på displayet under kolben."
    };

    D.SVAR = {
        foer: "Vægten under vejebåden viser {m} g.",
        haeld: "Pulveret kommer i en spatelfuld ad gangen.",
        vent: "Tiden går hurtigere, til vægten står stille.",
        efter: "Vægten under kolben viser {m} g."
    };

    /* Eksempler, hvis eleven ikke har maalt selv (samme model: 1,02 og 0,98 g) */
    D.EKSEMPEL = [{ mf: 1.02, me: 0.59 }, { mf: 0.98, me: 0.57 }];

    /* ----- Fane 2: beregningen ---------------------------------------------------
       Maaling 1 og 2 kommer fra fane 1 (eller fra D.EKSEMPEL). I maaling 2
       staar formlerne der allerede, som i vejledningen. Den sidste opgave
       gaar baglaens: fra kalkindholdet til det, vaegten falder. */
    D.BEREGNING = [
        { id: "m1", titel: "Måling 1", maaling: 0 },
        { id: "m2", titel: "Måling 2", maaling: 1, kunTal: true },
        { id: "bag", titel: "Hvor meget falder vægten?", baglaens: true,
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
        dm: { navn: "Massen af CO₂", venstre: "m(CO₂)", enhed: "g", formel: "m(før) − m(efter)",
              formelHint: "Kolben tabte masse, fordi CO₂ forsvandt. Hvad vejede pulveret før, og hvad viste vægten efter?" },
        mk_f: { navn: "Massen af kalk", venstre: "m(CaCO₃)", enhed: "g", formel: "m(CO₂) · 2,27",
                formelHint: "Hvert gram CO₂ kommer fra 2,27 g kalk." },
        pct: { navn: "Kalkindholdet", venstre: "Kalkindhold", enhed: "%", formel: "m(CaCO₃) / m(før) · 100 %",
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

    /* ----- Fane 3: fejlkilderne --------------------------------------------------
       Gruppe A goer som i vejledningen: 1,00 g toert pulver i fire portioner
       i 20 mL saltsyre, og de venter, til vaegten staar stille. Gruppe B
       goer én ting anderledes (B). rigtig: hvordan B's kalkindhold bliver.
       fejl: forklaringen til de to forkerte gaet. */
    D.FEJL_SPM = "Hvordan bliver gruppe B's kalkindhold i forhold til gruppe A's?";
    D.FEJL_SVAR = [{ id: "hoejere", t: "Højere" }, { id: "lavere", t: "Lavere" }, { id: "samme", t: "Det samme" }];
    D.FEJL_A = "Gruppe A gør som i vejledningen: 1,00 g tørt pulver lidt ad gangen i 20 mL saltsyre.";

    D.FEJL = [
        { id: "syre", titel: "Mere syre", kort: "40 mL syre", rigtig: "samme", B: { syreV: 40 },
          tekst: "Gruppe B hælder 40 mL saltsyre i kolben i stedet for 20 mL. Kolben med syren nulstilles som hos A.",
          hint: "Er der syre nok hos A? Hvad bestemmer, hvor meget CO₂ der kan dannes?",
          forkl: "Syren er i overskud i begge kolber. Kalken bestemmer, hvor meget CO₂ der dannes, og vægten er nulstillet med syren i.",
          fejl: { hoejere: "Mere syre giver ikke mere CO₂. Når al kalken har reageret, sker der ikke mere.",
                  lavere: "Al kalken reagerer stadig. Den ekstra syre bliver bare i kolben." } },
        { id: "fugt", titel: "Fugtigt pulver", kort: "fugtigt pulver", rigtig: "lavere", B: { vand: 0.10 },
          tekst: "Gruppe B har ikke tørret skallerne. Af deres 1,00 g pulver er 0,10 g vand.",
          hint: "Vandet vejer med i m(før). Giver vandet CO₂?",
          forkl: "Vandet vejer med i m(før), men det giver ingen CO₂. Der er mindre kalk i 1,00 g, så kalkindholdet bliver for lavt.",
          fejl: { hoejere: "Vandet bliver i kolben. Kun CO₂ forsvinder, og der er mindre kalk til at give CO₂.",
                  samme: "Vandet tager pladsen fra kalken i de 1,00 g. Der dannes mindre CO₂." } },
        { id: "tidligt", titel: "Stoppet for tidligt", kort: "stopper for tidligt", rigtig: "lavere", B: { stop: 0.8 },
          tekst: "Gruppe B har travlt. De aflæser vægten, mens det stadig bruser.",
          hint: "Hvor meget CO₂ er forsvundet, når det stadig bruser?",
          forkl: "Ikke al kalken havde reageret, da de aflæste. Der var forsvundet for lidt CO₂, så kalkindholdet bliver for lavt.",
          fejl: { hoejere: "Vægten falder stadig, når de aflæser. m(efter) er for stor, så forskellen bliver for lille.",
                  samme: "Vægten faldt stadig, da de aflæste. Resten af CO₂ nåede ikke at forsvinde." } },
        { id: "sproejt", titel: "Det hele på én gang", kort: "alt på én gang", rigtig: "hoejere", B: { paaEnGang: true },
          tekst: "Gruppe B hælder alt pulveret i på én gang. Det bruser voldsomt, og det sprøjter.",
          hint: "Vægten kan ikke se forskel på CO₂ og de dråber, der sprøjter ud.",
          forkl: "Dråber af syren sprøjter ud af kolben. Vægten tror, at det er CO₂, så kalkindholdet bliver for højt. Det kan ende over 100 %.",
          fejl: { lavere: "Der forsvinder mere fra kolben, ikke mindre: både CO₂ og dråber.",
                  samme: "Dråberne, der sprøjter ud, forsvinder også fra vægten. Det ligner mere CO₂." } },
        { id: "spild", titel: "Spildt pulver", kort: "spilder pulver", rigtig: "hoejere", B: { spild: 0.10 },
          tekst: "Gruppe B spilder 0,10 g pulver på bordet, da de hælder. De skriver stadig m(før) = 1,00 g.",
          hint: "Det spildte pulver kommer aldrig op på vægten under kolben. Hvad sker der med m(efter)?",
          forkl: "Det spildte pulver kom aldrig i kolben, men det tæller med i m(før). Vægten ender for lavt, og forskellen ligner mere CO₂. Kalkindholdet bliver for højt.",
          fejl: { lavere: "Der dannes lidt mindre CO₂, ja. Men vægten under kolben mangler også de 0,10 g, der aldrig kom i. Forskellen m(før) − m(efter) bliver større.",
                  samme: "m(før) er 0,10 g for stor. Den masse tæller med i forskellen, som om den var CO₂." } },
        { id: "grov", titel: "Grove stykker", kort: "grove stykker", rigtig: "samme", B: { grov: true },
          tekst: "Gruppe B knuser ikke skallerne helt. De venter, til vægten står stille.",
          hint: "Reagerer store stykker også, hvis man venter længe nok?",
          forkl: "Grove stykker reagerer langsommere, fordi syren kun når overfladen. Når gruppen venter, reagerer al kalken alligevel. Det tager bare længere tid.",
          fejl: { hoejere: "Stykkerne giver ikke mere CO₂. Der er den samme kalk.",
                  lavere: "Det ville passe, hvis de stoppede for tidligt. Men de venter, til vægten står stille." } }
    ];

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham, koppen, morteren eller muslingen. */
    D.INTRO = {
        forsoeg: "Kalk og saltsyre danner CO₂, der forlader kolben.",
        beregning: "Massen, kolben tabte, er CO₂. Fra den regnes kalken.",
        fejl: "To grupper laver forsøget. Gruppe B gør én ting anderledes."
    };
    D.FAERDIG = {
        forsoeg: "Begge målinger er i skemaet.",
        beregning: "Alle tre. Fra CO₂ til kalk og tilbage igen.",
        fejl: "Alle seks. Vægten ser kun det, der forlader kolben."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Kalk i kaffemaskinen. Samme reaktion, bare med eddike.",
        "Kaffe er også sur. Koppen har klaret det i tolv år.",
        "Den er fra i morges. Tror jeg.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Vej du.";

    /* Paaskeaegget: den hele hjertemusling paa bordet. Morteren svarer ogsaa. */
    D.MUSLING = [
        "En hel skal reagerer også. Den er bare længe om det.",
        "Knust er den færdig på et par minutter. Hel tager den en eftermiddag.",
        "Muslingen brugte fire år på den skal. Syren skal bruge en eftermiddag."
    ];
    D.MORTER = "Skallerne er knust. Det tog ti minutter, og det var mig.";

    NK.Data = D;
}());

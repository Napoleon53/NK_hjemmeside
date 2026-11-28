/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   de tre hypoteser, proeverne paa fane 1, digelens opvarmning,
   regnetrinene paa fane 2, de seks fejlkilder paa fane 3 og linjerne i
   papirkortet i scenen. Kemien regnes i kemi.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc5.1 og sc5.5) ------------------ */
    D.ATOMMASSE = { H: 101, C: 1201, O: 1600, Na: 2299 };

    /* Stofferne. atomer: hvor mange af hvert grundstof. M regnes af
       atommasserne herunder (i hundrededele): NaHCO₃ 84,01, Na₂O 61,98,
       Na₂CO₃ 105,99, NaOH 40,00, CO₂ 44,01 og H₂O 18,02 g/mol. */
    D.STOF = {
        NaHCO3: { formel: "NaHCO₃", navn: "natron", atomer: { Na: 1, H: 1, C: 1, O: 3 } },
        Na2O: { formel: "Na₂O", navn: "natriumoxid", atomer: { Na: 2, O: 1 } },
        Na2CO3: { formel: "Na₂CO₃", navn: "natriumcarbonat", atomer: { Na: 2, C: 1, O: 3 } },
        NaOH: { formel: "NaOH", navn: "natriumhydroxid", atomer: { Na: 1, O: 1, H: 1 } },
        CO2: { formel: "CO₂", navn: "carbondioxid", atomer: { C: 1, O: 2 } },
        H2O: { formel: "H₂O", navn: "vand", atomer: { H: 2, O: 1 } }
    };
    Object.keys(D.STOF).forEach(function (id) {
        var s = D.STOF[id], M = 0;
        Object.keys(s.atomer).forEach(function (a) { M += D.ATOMMASSE[a] * s.atomer[a]; });
        s.M = M;              /* hundrededele */
        s.Mv = M / 100;       /* g/mol */
    });
    D.GRUNDSTOFFER = ["Na", "H", "C", "O"];

    /* ----- De tre hypoteser ----------------------------------------------------
       Hvad bliver der tilbage i diglen, naar natron varmes op? stoffer:
       skemaet fra venstre (det foerste er natron). koef: det afstemte
       skema med de mindste hele tal. Kun B er rigtig (modellen regner med
       den), men eleven maa selv finde ud af hvilken. */
    D.HYP = {
        A: { id: "A", produkt: "Na2O", stoffer: ["NaHCO3", "Na2O", "CO2", "H2O"], koef: [2, 1, 2, 1] },
        B: { id: "B", produkt: "Na2CO3", stoffer: ["NaHCO3", "Na2CO3", "CO2", "H2O"], koef: [2, 1, 1, 1] },
        C: { id: "C", produkt: "NaOH", stoffer: ["NaHCO3", "NaOH", "CO2"], koef: [1, 1, 1] }
    };
    D.HYP_IDS = ["A", "B", "C"];
    D.RIGTIG = "B";

    /* ----- Fane 1: forsoeget ------------------------------------------------------
       Natronen i diglen (g). Vaegten er nulstillet med den tomme digel.
       Masserne er valgt, saa slutmassen (63,08 % af startmassen) aldrig
       ender midt mellem to hundrededele; selvtesten holder oeje. */
    D.PROEVER = [4.56, 4.64, 4.72, 4.83, 4.91, 5.02, 5.21, 5.29, 5.37, 5.45];

    /* Tiden: 1 sekund er 1 minut i laboratoriet, mens diglen er i gang. */
    D.MIN_PR_S = 1;

    /* Diglens temperatur (°C) glider mod flammens med tidskonstanten TAU
       (minutter). Paa vaegten eller i luften koeler den af. */
    D.FLAMME = { lav: 260, hoej: 430 };
    D.STUE = 20;
    D.TAU = { op: 1.5, trefod: 2.5, vaegt: 1.1 };

    /* Hastigheden: natron, der er tilbage, sønderdeles med k pr. minut.
       k er 0 under 100 °C og K_MAX ved 300 °C og derover. Ved lav flamme
       er diglen faerdig paa ca. en halv time, ved hoej paa et kvarter. */
    D.K_MAX = 0.36;
    D.T_START = 100;
    D.T_FULD = 300;

    /* Natron sproejter, hvis der dannes gas for hurtigt: over graensen
       (g gas pr. minut) springer en del af pulveret ud af diglen. Det
       sker kun med hoej flamme fra start. */
    D.SPROEJT = { graense: 0.43, andel: 5.5 };

    /* En varm digel vejer for lidt: varm luft stiger op og loefter den.
       Visningen er for lav med OPDRIFT g pr. grad over stuetemperatur, og
       den flakker, saa laenge diglen er over FLAKKER °C. */
    D.OPDRIFT = 0.0007;
    D.FLAKKER = 45;

    /* Konstant masse: to vejninger i traek, der hoejst er 0,01 g fra
       hinanden, med mindst 1 minuts opvarmning imellem (runde T13c, Niels
       28. nov. 2026: "den kun skal have tabt 0,01 mere ved 9 minutter, og at
       det accepteres som konstant"). Vaegten viser to decimaler, saa
       graensen ligger midt mellem 0,01 og 0,02 g. */
    D.KONSTANT = { tol: 0.015, minTid: 1 };
    D.MAX_VEJNINGER = 10;

    /* Fane 1's opgaver og tekster staar nederst i filen (D.OPG_FORSOEG, runde T13). */

    /* Eksemplet, hvis eleven ikke har maalt selv (samme model som fane 1:
       5,21 g, varmet 3 minutter ad gangen og vejet efter hver gang) */
    D.EKSEMPEL = { mf: 5.21, vejninger: [{ t: 0, m: 5.21 }, { t: 3, m: 3.45 }, { t: 6, m: 3.30 }, { t: 9, m: 3.29 }],
        slut: 3.29, sprojt: false };

    /* ----- Fane 2: hypoteserne (runde T13d, 28. nov. 2026) ---------------------------
       Niels: "Jeg synes du bare lige skal prøve dit forslag som i t12". Intet
       panel: fem opgaver i raekken oeverst, kortet under raekken, skemaet og
       beregningen til venstre og grafen til hoejre (js/sim_hypoteser.js,
       motoren i js/hypotese_opgaver.js). Trinene:
         regn    tallet skrives i et felt i kortet ("n(NaHCO₃) = [ ] mol").
                 formler: formlen vaelges foerst blandt tre knapper (D.FORMLER).
         valg    tre svar; de forkerte er typiske fejl med hver sin forklaring
                 (REGELSAET 14). Bruges foerste gang, forholdet er med.
         afstem  de smaa felter foran stofferne staar i kortet.
         dom     hypotese A, B eller C.
       felt: n_nat (stofmaengden af natron), n_p og m_p (produktet). Hypotese
       A har det fulde stillads; i B og C er formlerne og svarene vaek. */
    D.OPG_HYP = [
        { id: "nat", navn: "Natron i mol",
          trin: [{ type: "regn", felt: "n_nat", formler: "n" }] },
        { id: "A", navn: "Hypotese A: Na₂O", hyp: "A",
          trin: [{ type: "afstem" }, { type: "valg", felt: "n_p" }, { type: "regn", felt: "m_p", formler: "m" }] },
        { id: "B", navn: "Hypotese B: Na₂CO₃", hyp: "B",
          trin: [{ type: "afstem" }, { type: "regn", felt: "n_p" }, { type: "regn", felt: "m_p" }] },
        { id: "C", navn: "Hypotese C: NaOH", hyp: "C",
          trin: [{ type: "afstem" }, { type: "regn", felt: "n_p" }, { type: "regn", felt: "m_p" }] },
        { id: "dom", navn: "Hvilken passer?", dom: true,
          trin: [{ type: "dom" }] }
    ];

    /* Den fri leg: en hypotese med en ny masse natron, uden formler og afstemning */
    D.HYP_FRI_TRIN = [{ type: "regn", felt: "n_nat" }, { type: "regn", felt: "n_p" }, { type: "regn", felt: "m_p" }];
    D.HYP_FRI = {
        pause: "Vælg en hypotese i rækken foroven, og regn selv. Nye tal giver en ny masse natron.",
        alle: "Du har klaret alle 5 opgaver. Vælg en hypotese i rækken foroven, og regn med nye tal, eller gå videre til fanen Fejlkilder.",
        nye: "Nye tal →"
    };

    /* Teksterne til hvert trin. {mf} massen af natron, {Mn} molarmassen af
       natron, {n} stofmaengden af natron, {H} hypotesen, {P} produktets
       formel, {produkter} produkterne i ord, {naP} antal Na i produktet,
       {gasser} gasserne, {taelling} atomerne paa hver side, {kN} og {kP}
       tallene foran NaHCO₃ og produktet, {np} og {mp} stofmaengden og
       massen af produktet, {Mp} dens molarmasse og {slut} slutmassen.
       Et hint med een/ellers eller lige/ulige afhaenger af forholdet. */
    D.HYP_TEKST = {
        n_nat: {
            formel: { tekst: "Natronen i diglen har massen (m) {mf} g. Molarmassen (M) af natron er {Mn} g/mol.",
                      spm: "Hvilken formel giver stofmængden (n) af natron?" },
            spm: "Hvor mange mol er {mf} g natron?",
            hint: ["Stofmængden findes af massen og molarmassen. Begge står i skemaet under NaHCO₃.",
                   "Molarmassen {Mn} g/mol er massen af 1 mol natron.",
                   "Del massen {mf} g med molarmassen {Mn} g/mol."],
            slut: "{mf} g natron er {n} mol. Tallet står nu i skemaet." },
        afstem: {
            tekst: "Hypotese {H} siger, at natron bliver til {produkter}.",
            spm: "Afstem reaktionsskemaet for hypotese {H}.",
            hint: ["Start med Na. Der er {naP} Na i {P}. Hvor mange NaHCO₃ skal der så til?",
                   "Tæl C og H på begge sider. Hvor mange {gasser} skal der så til?",
                   "Tæl O til sidst. Der skal være lige mange O på begge sider."],
            slut: "Der er {taelling} på hver side." },
        n_p: {
            spm: "Hvor mange mol {P} dannes der af {n} mol natron?",
            hint: ["Tallene foran stofferne i reaktionsskemaet gælder stofmængder. Se på tallene foran NaHCO₃ og {P}.",
                   { een: "Der står ingen tal foran NaHCO₃ og {P}. Så er tallet 1, og 1 mol natron giver 1 mol {P}.",
                     ellers: "{kN} mol natron giver {kP} mol {P}." },
                   { lige: "Stofmængden af {P} er den samme som stofmængden af natron.",
                     ulige: "Del {n} mol med {kN}." }],
            slut: { een: "Der står ingen tal foran NaHCO₃ og {P}. {n} mol natron giver {np} mol {P}.",
                    ellers: "Der står {kN} foran NaHCO₃ og {kP} foran {P}. {n} mol natron giver {np} mol {P}." },
            /* Svarene, naar trinet er et valg (hypotese A): de forkerte er
               typiske fejl (REGELSAET 14) */
            valg: { samme: "Der står 2 foran NaHCO₃ og 1 foran {P}. 2 mol natron giver kun 1 mol {P}.",
                    vendt: "Forholdet er vendt om. 2 NaHCO₃ giver 1 {P}, så der dannes halvt så mange mol {P} som mol natron." } },
        m_p: {
            formel: { tekst: "Molarmassen (M) af {P} er {Mp} g/mol.",
                      spm: "Hvilken formel giver massen (m) af {P}?" },
            spm: "Hvor mange gram er {np} mol {P}?",
            hint: ["Massen findes af stofmængden og molarmassen af {P}. Begge står i skemaet.",
                   "Molarmassen {Mp} g/mol er massen af 1 mol {P}.",
                   "Gang stofmængden {np} mol med molarmassen {Mp} g/mol."],
            slut: "Hvis der dannes {P}, skal diglen ende på {mp} g. Den masse står nu som en stiplet streg på grafen.",
            /* I den fri leg kommer der ingen streg paa grafen */
            friSlut: "Hvis der dannes {P}, bliver {mf} g natron til {mp} g {P}." },
        dom: {
            spm: "Hvilken hypotese passer med slutmassen på {slut} g?",
            hint: ["Grafen viser dine vejninger og en stiplet streg for hver hypotese.",
                   "Find den streg, som kurven ender på.",
                   "Slutmassen er {slut} g. Vælg den hypotese, hvis masse ligger tættest på."],
            nej: "Hypotese {H} giver {mp} g. Diglen vejede {slut} g til sidst.",
            /* Massen er ikke konstant endnu: eleven skal tilbage til fane 1 */
            ikke: { tekst: "Massen i din digel er ikke konstant endnu.",
                    spm: "Varm diglen videre på fanen Varm og vej, til massen er konstant.",
                    hint: ["Først når massen er konstant, ved du, hvad der er tilbage i diglen."],
                    svar: "Fanen Varm og vej åbner." } }
    };

    /* Formlen vaelges blandt tre knapper (REGELSAET 14, som T12 i sc5.6).
       Broeker med vandret broekstreg (Niels 24. nov. 2026: "aldrig '/' som
       division"). */
    function broek(op, ned) {
        return '<span class="broek"><span>' + op + "</span><span>" + ned + "</span></span>";
    }
    D.broek = broek;
    D.FORMLER = {
        n: { svar: [{ h: "n = m · M", nej: "Massen skal deles med molarmassen, ikke ganges med den." },
                    { h: "n = " + broek("m", "M"), ok: true },
                    { h: "n = " + broek("M", "m"), nej: "Molarmassen er massen af 1 mol. Stofmængden er massen delt med molarmassen, ikke omvendt." }],
             godt: "Formlen er rigtig. Skriv tallet." },
        m: { svar: [{ h: "m = " + broek("n", "M"), nej: "Molarmassen er massen af 1 mol. Massen er stofmængden gange molarmassen." },
                    { h: "m = " + broek("M", "n"), nej: "Jo flere mol, jo større masse. Gang stofmængden med molarmassen." },
                    { h: "m = n · M", ok: true }],
             godt: "Formlen er rigtig. Skriv tallet." }
    };

    D.AFSTEM = {
        hint: "Start med Na. Der er 2 Na i {P}. Hvor mange NaHCO₃ skal der så til?",
        hint1: "Tæl atomerne på begge sider. Der er 1 Na, 1 H og 1 C på hver side. Hvad med O?",
        tom: "Skriv et tal i hvert felt, også 1.",
        forkort: "Skemaet er afstemt, men tallene kan forkortes. Brug de mindste hele tal.",
        nul: "Et tal foran et stof skal være 1 eller mere."
    };

    D.DOM = {
        rigtig: "Natron bliver til natriumcarbonat, soda. Det, der forsvinder som gas, er CO₂ og vand.",
        skema: "2 NaHCO₃ → Na₂CO₃ + CO₂ + H₂O",
        sprojt: "Den hypotese passer med dine tal, men pulveret sprøjtede ud af diglen, så diglen vejer for lidt. Lav forsøget igen med en ny digel."
    };

    /* ----- Fane 3: fejlkilderne -----------------------------------------------------
       Begge grupper starter med 5,10 g natron og vejer diglen én gang, naar
       den er koelet af. Gruppe 1 goer det rigtigt: lav flamme de foerste
       FEJL_LAV minutter, saa hoej, FEJL_TID minutter i alt. Gruppe 2 goer
       én ting anderledes (B). Uret paa fanen er trykket mere sammen end paa
       fane 1: 1 minut paa uret er FEJL_SKALA minutter i modellen, saa 5
       minutter er nok til, at al natronen er omdannet (brugerens oenske 29.
       sept. 2026: 5 minutter mod 2). rigtig: hvad gruppe 2's digel vejer
       til sidst. fejl: forklaringen til de to forkerte gaet. */
    /* Spoergsmaalet staar i hver fejlkilde (spm), saa det selv siger, hvad gruppe 2 goer (21. nov. 2026) */
    D.FEJL_SVAR = [{ id: "hoejere", t: "Mere end hos gruppe 1" }, { id: "lavere", t: "Mindre end hos gruppe 1" },
        { id: "samme", t: "Det samme som hos gruppe 1" }];
    D.FEJL_1 = "Gruppe 1 gør det rigtigt: 5,10 g natron, lav flamme først, 5 minutter i alt, og de vejer diglen, når den er kølet af.";
    D.FEJL_M = 5.10;
    D.FEJL_TID = 5;
    D.FEJL_LAV = 2;
    D.FEJL_SKALA = 4;

    D.FEJL = [
        { id: "tidligt", titel: "Kun 2 minutter", kort: "varmer kun 2 min", rigtig: "hoejere", B: { tid: 2 },
          tekst: "Gruppe 1 varmer natronen i 5 minutter. Gruppe 2 har travlt.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når de kun varmer i 2 minutter?",
          hint: "Er al natronen nået at blive til fast stof og gas efter 2 minutter?",
          forkl: "Efter 2 minutter er der stadig natron i diglen, og der er forsvundet mindre gas. Slutmassen bliver for høj.",
          fejl: { lavere: "Der er ikke forsvundet mere gas hos gruppe 2. Der er forsvundet mindre, fordi de stoppede for tidligt.",
                  samme: "Slutmassen ville kun blive den samme, hvis al natronen var omdannet efter 2 minutter." } },
        { id: "varm", titel: "Vejet varm", kort: "vejer diglen varm", rigtig: "lavere", B: { varmVejning: true },
          tekst: "Gruppe 2 venter ikke på, at diglen køler af. De vejer den, mens den er varm.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når de vejer den varm?",
          hint: "Den varme digel varmer luften omkring sig. Varm luft stiger op.",
          forkl: "Varm luft stiger op fra diglen og løfter den en smule. Vægten viser for lidt, så slutmassen bliver for lav.",
          fejl: { hoejere: "En varm digel vejer ikke mere. Den varme luft, der stiger op, løfter den, så vægten viser mindre.",
                  samme: "Vægten kan mærke den varme luft, der stiger op, og viser for lidt, til diglen er kølet af." } },
        { id: "sproejt", titel: "Høj flamme fra start", kort: "høj flamme fra start", rigtig: "lavere", B: { hoejFraStart: true },
          tekst: "Gruppe 2 skruer op for fuld flamme med det samme.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når de bruger høj flamme fra start?",
          hint: "Hvad sker der, når der pludselig dannes meget gas i et pulver?",
          forkl: "Gassen dannes så hurtigt, at pulveret sprøjter ud af diglen. Det, der ryger ud, mangler på vægten, så slutmassen bliver for lav.",
          fejl: { hoejere: "Der ryger noget ud af diglen, ikke noget ind. Diglen vejer mindre bagefter.",
                  samme: "Når det sprøjter, ryger en del af pulveret ud af diglen. Det kommer ikke med på vægten." } },
        { id: "fugt", titel: "Fugtig natron", kort: "fugtig natron", rigtig: "lavere", B: { vand: 0.30 },
          tekst: "Gruppe 2's natron har stået åben i en fugtig kælder. Af deres 5,10 g er 0,30 g vand.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når 0,30 g af deres natron er vand?",
          hint: "Vandet vejer med i startmassen. Hvor bliver det af, når diglen varmes?",
          forkl: "Vandet damper væk, og der er kun 4,80 g natron til at blive til fast stof. Slutmassen bliver for lav.",
          fejl: { hoejere: "Vandet bliver ikke i diglen. Det damper væk, og der er mindre natron i de 5,10 g.",
                  samme: "Vandet tager pladsen fra natronen i de 5,10 g. Der bliver mindre fast stof tilbage." } },
        { id: "laenge", titel: "Dobbelt så længe", kort: "varmer i 10 min", rigtig: "samme", B: { tid: 10 },
          tekst: "Gruppe 2 vil være sikre. De varmer i 10 minutter i stedet for 5.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når de varmer i 10 minutter?",
          hint: "Hvad er der tilbage i diglen efter 5 minutter? Kan det også sønderdeles?",
          forkl: "Efter 5 minutter er al natronen blevet til Na₂CO₃, og så sker der ikke mere. Na₂CO₃ tåler flammen. Mere tid giver den samme slutmasse.",
          fejl: { hoejere: "Længere tid kan ikke gøre diglen tungere. Der kommer intet til.",
                  lavere: "Slutmassen ville kun blive mindre, hvis stoffet i diglen blev ved med at give gas. Men når al natronen er omdannet, sker der ikke mere." } },
        { id: "soda", titel: "Den forkerte krukke", kort: "tager soda", rigtig: "hoejere", B: { soda: true },
          tekst: "Gruppe 2 tager fejl af krukkerne. De varmer 5,10 g soda, Na₂CO₃, i stedet for natron.",
          spm: "Hvad vejer diglen hos gruppe 2 til sidst, når de varmer soda i stedet for natron?",
          hint: "Soda er det, natron bliver til. Kan det give mere gas?",
          forkl: "Soda sønderdeles ikke i flammen. Der forsvinder ingen gas, og slutmassen er 5,10 g. Den passer ikke med nogen af hypoteserne.",
          fejl: { lavere: "Soda giver ikke gas i flammen. Der forsvinder intet, så diglen vejer det samme som før.",
                  samme: "Soda er allerede det, natron bliver til. Der forsvinder intet, så slutmassen er 5,10 g." } }
    ];

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen paa papirkortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros, og hintet eller svaret, naar eleven beder om det. Et
       klik paa krukken giver en kort linje (KRUKKE). */
    D.INTRO = {
        forsoeg: "Natron varmes i en digel. Noget forsvinder, og noget bliver tilbage.",
        hypoteser: "Tre hypoteser om, hvad der bliver tilbage. Regn ud, hvad hver af dem skal veje.",
        fejl: "To grupper laver forsøget. Gruppe 2 gør én ting anderledes."
    };
    D.FAERDIG = {
        forsoeg: "Færdig.",
        hypoteser: "Massen i diglen passer med hypotese B.",
        fejl: "Alle seks opgaver er løst. Vægten ser kun det, der er i diglen."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.KRUKKE = "Natron er natriumhydrogencarbonat og bruges i bagepulver.";

    /* ----- Fane 1 "Varm og vej" (runde T13, 28. nov. 2026) ---------------------------
       Fire opgaver i raekken oeverst i scenen, motoren er js/forsoeg_opgaver.js.
       Trinene: gaet (et gratis gaet, et klik gaar videre), handling (kortet gaar
       selv videre, naar scenen staar paa maalet), felt (tallet fra vaegten i et
       felt i kortet) og vej (opgave 3: varm og vej igen, til massen er konstant).
       Teksterne kan vaere funktioner af scenen s (js/sim_forsoeg.js). */
    var FELT_HINT = [
        "En varm digel vejer for lidt, fordi den varme luft løfter den en smule.",
        "Tallet på vægten er rødt og skifter, så længe diglen er varm. Vent, til det står stille.",
        "Skriv tallet fra vægten med to decimaler."
    ];
    D.FELT_HINT = FELT_HINT;

    /* Opvarmningen paa fane 1 (runde T13b, Niels 28. nov. 2026: "Måske skal man
       bare kunne give den 3 minutter af gangen (og den er nærmest færdig efter 6
       minutter og helt færdig efter 9 minutter). Der skal ikke være en counter der
       skifter hele tiden, men 3 minutter skal ca svare til 6 sekunder."). Knappen
       Varm 3 min taender braenderen, som slukker selv. Natronen reagerer kun,
       mens flammen braender, kF gange hurtigere end paa fane 3: efter 3 minutter
       er det meste vaek, efter 6 viser vaegten 0,01 g over slutmassen, og efter
       9 og 12 minutter viser den slutmassen (runde T13c; selvtesten holder oeje,
       ogsaa naar eleven venter laenge mellem portionerne). */
    D.F1 = { portion: 3, minPrS: 0.5, kF: 3.5 };

    /* Opgave 3: det, kortet siger i hver fase af "varm og vej igen" */
    D.VEJ_FASE = {
        igen: { spm: "Sæt diglen tilbage på trefoden.", el: "digel", boble: "Træk: diglen",
                hint: ["Massen ændrer sig kun, mens natronen bliver varmet.", "Træk diglen hen på trefoden, eller klik på den."] },
        taend: { spm: "Varm natronen i 3 minutter.", el: "varm", boble: "Klik: Varm 3 min",
                 hint: ["Knappen Varm 3 min står under trefoden.", "Klik på Varm 3 min. Brænderen slukker selv efter 3 minutter."] },
        varm: { spm: "Vent, til brænderen slukker efter 3 minutter.",
                hint: ["Brænderen slukker selv, når natronen har været varm i 3 minutter."] },
        tilVaegt: { spm: "Flyt diglen over på vægten.", el: "digel", boble: "Træk: diglen",
                    hint: ["Diglen skal vejes, når den har været varmet.", "Træk diglen over på vægten, eller klik på den."] },
        vaegtVent: { spm: "Hvad viser vægten, når tallet står stille?", hint: FELT_HINT },
        vej: { spm: "Hvad viser vægten, når tallet står stille?", hint: FELT_HINT }
    };

    function g2(v) { return NK.tal2(v); }

    D.OPG_FORSOEG = [
        { id: "foer", navn: "Massen før",
          trin: [
              { type: "felt", pre: "Natron:", om: ["display"],
                spm: "Hvor mange gram natron er der i diglen?",
                hint: ["Tallet står på vægtens display.",
                       "Vægten er nulstillet med den tomme digel. Den viser kun massen af natronen.",
                       "Skriv tallet med to decimaler, fx 5,21."],
                slut: function (s) { return "Natronen vejer " + g2(s.vejninger[0].m) + " g. Tallet står nu i skemaet Vejningerne."; } }
          ] },
        { id: "varm", navn: "Varm natronen",
          trin: [
              { type: "gaet", tekst: "Natronen skal varmes over brænderen.",
                spm: "Hvad sker der med massen i diglen, når natron varmes op?",
                svar: [{ id: "mindre", t: "Massen bliver mindre" }, { id: "samme", t: "Massen er den samme" },
                       { id: "stoerre", t: "Massen bliver større" }],
                gaet: function (s, sv) { s.massegaet = sv.id; } },
              { type: "handling", tillad: ["digel"], el: "digel", boble: "Træk: diglen",
                tekst: function (s) { return s.massegaetTekst(); },
                spm: "Sæt diglen på trefoden.",
                maal: function (s) { return s.d.sted === "trefod" && !s.flyt && !s.traek; },
                hint: ["Trefoden står over brænderen.", "Træk diglen hen på trefoden, eller klik på den."],
                visSvar: function (s) { s.startFlyt("trefod"); }, svarTekst: "Diglen kommer over på trefoden." },
              { type: "handling", tillad: ["knapper"], el: "varm", boble: "Klik: Varm 3 min", om: ["lup"],
                spm: "Varm natronen i 3 minutter, og se i luppen, hvad der sker.",
                maal: function (s) { return s.d.opv >= D.F1.portion - 0.05 && !s.varmRest; },
                hint: ["Knappen Varm 3 min står under trefoden.", "Klik på Varm 3 min. Brænderen slukker selv efter 3 minutter."],
                visSvar: function (s) { s.startVarm(); s.varmHurtig = 4; },
                svarTekst: "Brænderen er tændt, og tiden går hurtigere, til der er gået 3 minutter." },
              { type: "handling", tillad: ["digel"], el: "digel", boble: "Træk: diglen",
                tekst: "Luppen viser, at der forsvinder gas fra natronen.",
                spm: "Flyt diglen over på vægten.",
                maal: function (s) { return s.d.sted === "vaegt" && !s.flyt && !s.traek; },
                hint: ["Diglen skal vejes, når den har været varmet.", "Træk diglen over på vægten, eller klik på den."],
                visSvar: function (s) { s.startFlyt("vaegt"); },
                svarTekst: "Diglen kommer over på vægten." },
              { type: "felt", pre: "Vægten viser", om: ["display"],
                tekst: "En varm digel vejer for lidt.",
                spm: "Hvad viser vægten, når tallet står stille?",
                hint: FELT_HINT,
                slut: function (s) {
                    var v = s.vejninger, g = s.massegaet;
                    var t = "Massen faldt fra " + g2(v[0].m) + " g til " + g2(v[1].m) + " g. Der forsvandt gas fra diglen.";
                    if (g === "mindre") t += " Dit gæt holdt.";
                    else if (g) t += " Gættet holdt ikke.";
                    return t;
                } }
          ] },
        { id: "konstant", navn: "Konstant masse",
          trin: [
              { type: "vej", tillad: ["knapper", "digel"], pre: "Vægten viser",
                tekst: "Massen er konstant, når to vejninger i træk højst er 0,01 g fra hinanden." }
          ] },
        { id: "tilbage", navn: "Hvad er tilbage?",
          trin: [
              { type: "gaet",
                tekst: function (s) { return "Natronen tabte " + s.tabTekst() + " g, og et fast stof er tilbage i diglen."; },
                spm: "Hvilket fast stof tror du, der er tilbage i diglen?",
                svar: [{ id: "A", t: "Na₂O" }, { id: "B", t: "Na₂CO₃" }, { id: "C", t: "NaOH" }],
                gaet: function (s, sv) { s.gemGaet(sv.id); },
                slut: "Regn efter på fanen Hypoteserne, om dit gæt holder." }
          ] }
    ];

    /* Kortet i fri leg (REGELSAET 57) */
    D.FORSOEG_FRI = {
        pause: "Brug brænderen, diglen og vægten, som du vil. Opgaven venter, til du trykker på Tilbage til opgaverne.",
        alle: "Du har klaret alle 4 opgaver. Brug brænderen, diglen og vægten, som du vil. Ny digel giver en ny prøve.",
        ingenStart: "Startmassen blev ikke vejet, før diglen blev varmet. Tryk på Ny digel for at begynde forfra.",
        ikkeTrefod: "Sæt diglen på trefoden først."
    };

    NK.Data = D;
}());

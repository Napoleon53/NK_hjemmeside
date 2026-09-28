/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   de tre hypoteser, proeverne paa fane 1, digelens opvarmning,
   regnetrinene paa fane 2, de seks fejlkilder paa fane 3 og det,
   Kemichael siger. Kemien regnes i kemi.js; tegningen kender kun
   resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1 og sc4.5) ------------------ */
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
    /* Farverne paa grafen og i kortene */
    D.HYP_FARVE = { A: "#e8676b", B: "#5fc48a", C: "#62a8e6" };

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

    /* Konstant masse: to vejninger i traek, der viser det samme,
       med mindst 1 minuts opvarmning imellem */
    D.KONSTANT = { tol: 0.005, minTid: 1 };
    D.MAX_VEJNINGER = 10;

    D.FORSOEG = [
        { id: "konstant", titel: "Varm natron til konstant masse",
          tekst: "Varm natronen i diglen, og vej den, til massen ikke ændrer sig mere.",
          valg: { spm: "Hvad tror du, der bliver tilbage i diglen, når natron varmes op?",
                  hint: "Natron er NaHCO₃. Gasser forsvinder op i luften. Hvilket fast stof kan blive tilbage?",
                  svar: [{ id: "A", t: "A: Na₂O" }, { id: "B", t: "B: Na₂CO₃" }, { id: "C", t: "C: NaOH" }] } }
    ];

    /* Linjen i opgavekortet i hver fase */
    D.LINJE = {
        valg: "Gæt først: vælg et af svarene herunder.",
        foer: "Aflæs vægten under diglen, og skriv massen af natron i skemaet.",
        flyt: "Sæt diglen på trefoden. Træk den derhen, eller klik på den.",
        taend: "Tænd brænderen under trefoden. Start med lav flamme.",
        varm: "Natronen varmes op. Sluk, når du vil veje, og flyt diglen over på vægten.",
        vaegtVent: "Diglen er varm. Vent, til vægten står stille, og aflæs den så.",
        vej: "Vægten står stille. Skriv massen i skemaet.",
        igen: "Sæt diglen tilbage på trefoden, og varm igen. Massen er konstant, når to vejninger giver det samme.",
        slukket: "Brænderen er slukket. Tænd den igen for at varme videre."
    };

    D.HINT = {
        foer: "Tallet står på displayet under diglen. Skriv det med to decimaler.",
        flyt: "Klik på diglen, eller træk den over på trefoden.",
        taend: "Klik på knappen Lav under brænderen. Høj flamme fra start får pulveret til at sprøjte.",
        varm: "Et par minutter ad gangen er fint. Klik på Sluk, og træk diglen over på vægten.",
        vaegtVent: "En varm digel vejer for lidt. Tallet står stille, når diglen er kølet af.",
        vej: "Skriv tallet fra displayet med to decimaler.",
        igen: "Konstant masse betyder, at massen ikke ændrer sig, selv om du varmer mere.",
        slukket: "Klik på Lav eller Høj under brænderen."
    };

    D.SVAR = {
        foer: "Vægten viser {m} g.",
        flyt: "Diglen står på trefoden.",
        taend: "Brænderen er tændt med lav flamme.",
        varm: "Tiden går hurtigere, til der er gået nok minutter.",
        vaegtVent: "Tiden går hurtigere, til diglen er kølet af.",
        vej: "Vægten viser {m} g.",
        igen: "Diglen kommer tilbage på trefoden, og brænderen tændes.",
        slukket: "Brænderen er tændt med lav flamme."
    };

    /* Eksemplet, hvis eleven ikke har maalt selv (samme model: 5,21 g, lav
       flamme i 4 minutter, saa hoej, og en vejning hvert 3. minut) */
    D.EKSEMPEL = { mf: 5.21, vejninger: [{ t: 0, m: 5.21 }, { t: 6, m: 3.77 }, { t: 9, m: 3.47 }, { t: 12, m: 3.36 },
        { t: 15, m: 3.31 }, { t: 18, m: 3.30 }, { t: 21, m: 3.29 }, { t: 24, m: 3.29 }], slut: 3.29, sprojt: false };

    /* ----- Fane 2: hypoteserne ------------------------------------------------------
       Foerst stofmaengden af natron, saa én opgave pr. hypotese, og til
       sidst dommen. I hypotese A skriver eleven formlen og hele
       mellemregningen; i B og C er stilladset mindre (kort): formlen for
       stofmaengden, og saa kun resultaterne. */
    D.HYPOTESER = [
        { id: "nat", titel: "Stofmængden af natron", trin: ["n_nat"] },
        { id: "A", titel: "Hypotese A: der dannes Na₂O", hyp: "A", trin: ["afstem", "n_p", "m_p"] },
        { id: "B", titel: "Hypotese B: der dannes Na₂CO₃", hyp: "B", trin: ["afstem", "n_p", "m_p"], kort: true },
        { id: "C", titel: "Hypotese C: der dannes NaOH", hyp: "C", trin: ["afstem", "n_p", "m_p"], kort: true },
        { id: "dom", titel: "Dommen: hvilken passer?", dom: true }
    ];

    /* Regnetrinene. op: "/" (broek), "*" (to tal, der ganges) eller null
       (ingen mellemregning). led: formlens to symboler, som de staar paa
       tavlen. Hintene er rettet mod feltet og giver gerne halvdelen af
       svaret; {a} og {b} er mellemregningens tal med enhed, {a0} og {b0}
       uden, {P} produktets formel. */
    D.TRIN = {
        afstem: { navn: "Afstem skemaet" },
        n_nat: { navn: "Stofmængden af natron", enhed: "mol", op: "/", led: ["m(NaHCO₃)", "M(NaHCO₃)"],
                 formelHint: "Du kender massen af natron og skal finde stofmængden. Formlen begynder sådan: n(NaHCO₃) = m / …",
                 indsaetHint: ["Øverst står massen af natron fra skemaet: {a}.", "Nederst står molarmassen af natron: {b}. Den står på tavlen."],
                 talHint: "Tast {a0} : {b0}. Gram går ud med gram, så svaret er i mol." },
        n_p: { navn: "Stofmængden af {P}", enhed: "mol",
               formelHint: { "2": "Se tallene foran NaHCO₃ og {P} i skemaet. 2 NaHCO₃ giver 1 {P}. Formlen begynder sådan: n({P}) = n(NaHCO₃) …",
                             "1": "Se tallene foran NaHCO₃ og {P} i skemaet. Der står 1 foran begge." },
               indsaetHint: ["Øverst står stofmængden af natron fra første opgave: {a}.", "Nederst står det tal, der står foran NaHCO₃ i skemaet: 2."],
               talHint: { "2": "Tast {a0} : 2. Der bliver halvt så mange mol {P} som mol natron.",
                          "1": "Forholdet er 1 : 1. Der bliver lige så mange mol {P} som mol natron: {a0} mol." } },
        m_p: { navn: "Massen af {P}", enhed: "g", op: "*",
               formelHint: "Du kender stofmængden af {P} og skal finde massen. Formlen begynder sådan: m({P}) = n({P}) · …",
               indsaetHint: ["Først stofmængden af {P}: {a}.", "Molarmassen af {P} står på tavlen: {b}."],
               talHint: "Tast {a0} · {b0}. Mol går ud med mol, så svaret er i g." }
    };

    D.AFSTEM = {
        hint: "Start med Na. Der er 2 Na i {P}. Hvor mange NaHCO₃ skal der så til?",
        hint1: "Tæl atomerne på begge sider. Der er 1 Na, 1 H og 1 C på hver side. Hvad med O?",
        tom: "Skriv et tal i hvert felt, også 1.",
        forkort: "Skemaet er afstemt, men tallene kan forkortes. Brug de mindste hele tal.",
        nul: "Et tal foran et stof skal være 1 eller mere."
    };

    D.DOM = {
        spm: "Hvilken hypotese passer med den masse, du målte?",
        hint: "Sammenlign massen i skemaet med de tre streger på grafen. Hvilken streg ender kurven på?",
        rigtig: "Natron bliver til natriumcarbonat, soda. Gassen er CO₂ og vand.",
        skema: "2 NaHCO₃ → Na₂CO₃ + CO₂ + H₂O",
        sprojt: "Det passer med dine tal. Men pulveret sprøjtede ud af diglen, og så vejer diglen for lidt. Lav forsøget igen, og start med lav flamme."
    };

    /* ----- Fane 3: fejlkilderne -----------------------------------------------------
       Gruppe 1 goer det rigtigt: 5,10 g natron, lav flamme de foerste 4
       minutter, saa hoej, og de vejer, til massen er konstant. Gruppe 2
       goer én ting anderledes (B). rigtig: hvordan gruppe 2's slutmasse
       bliver. fejl: forklaringen til de to forkerte gaet. */
    D.FEJL_SPM = "Hvordan bliver gruppe 2's slutmasse i forhold til gruppe 1's?";
    D.FEJL_SVAR = [{ id: "hoejere", t: "Højere" }, { id: "lavere", t: "Lavere" }, { id: "samme", t: "Det samme" }];
    D.FEJL_1 = "Gruppe 1 gør det rigtigt: 5,10 g natron, lav flamme først, og de vejer, til massen er konstant.";
    D.FEJL_M = 5.10;

    D.FEJL = [
        { id: "tidligt", titel: "Kun én vejning", kort: "vejer kun én gang", rigtig: "hoejere", B: { stopEfter: 6 },
          tekst: "Gruppe 2 har travlt. De varmer i 6 minutter, vejer én gang og skriver det som slutmassen.",
          hint: "Er al natronen nået at reagere efter 6 minutter? Hvordan kan de vide det?",
          forkl: "Efter 6 minutter er der stadig natron i diglen. Slutmassen bliver for høj. Kun to vejninger, der giver det samme, viser, at massen er konstant.",
          fejl: { lavere: "Der er ikke forsvundet mere gas hos gruppe 2. Der er forsvundet mindre, fordi de stoppede for tidligt.",
                  samme: "Diglen taber stadig masse efter 6 minutter. Gruppe 2 stoppede, før massen var konstant." } },
        { id: "varm", titel: "Vejet varm", kort: "vejer diglen varm", rigtig: "lavere", B: { varmVejning: true },
          tekst: "Gruppe 2 venter ikke på, at diglen køler af. De vejer den, mens den er varm.",
          hint: "Den varme digel varmer luften omkring sig. Varm luft stiger op.",
          forkl: "Varm luft stiger op fra diglen og løfter den en smule. Vægten viser for lidt, så slutmassen bliver for lav.",
          fejl: { hoejere: "En varm digel vejer ikke mere. Den varme luft, der stiger op, løfter den, så vægten viser mindre.",
                  samme: "Vægten kan mærke den varme luft, der stiger op. Den viser for lidt, til diglen er kølet af." } },
        { id: "sproejt", titel: "Høj flamme fra start", kort: "høj flamme fra start", rigtig: "lavere", B: { hoejFraStart: true },
          tekst: "Gruppe 2 skruer op for fuld flamme med det samme.",
          hint: "Hvad sker der, når der pludselig dannes meget gas i et pulver?",
          forkl: "Gassen dannes så hurtigt, at pulveret sprøjter ud af diglen. Det, der ryger ud, mangler på vægten, så slutmassen bliver for lav.",
          fejl: { hoejere: "Der ryger noget ud af diglen, ikke noget ind. Diglen vejer mindre bagefter.",
                  samme: "Når det sprøjter, ryger en del af pulveret ud af diglen. Det kommer ikke med på vægten." } },
        { id: "fugt", titel: "Fugtig natron", kort: "fugtig natron", rigtig: "lavere", B: { vand: 0.30 },
          tekst: "Gruppe 2's natron har stået åben i en fugtig kælder. Af deres 5,10 g er 0,30 g vand.",
          hint: "Vandet vejer med i startmassen. Hvor bliver det af, når diglen varmes?",
          forkl: "Vandet damper væk, og der er kun 4,80 g natron til at blive til fast stof. Slutmassen bliver for lav.",
          fejl: { hoejere: "Vandet bliver ikke i diglen. Det damper væk, og der er mindre natron i de 5,10 g.",
                  samme: "Vandet tager pladsen fra natronen i de 5,10 g. Der bliver mindre fast stof tilbage." } },
        { id: "laenge", titel: "Dobbelt så længe", kort: "varmer dobbelt så længe", rigtig: "samme", B: { ekstra: 30 },
          tekst: "Gruppe 2 vil være sikre. De varmer i 30 minutter mere, før de vejer sidste gang.",
          hint: "Hvad er der tilbage i diglen, når massen er konstant? Kan det også sønderdeles?",
          forkl: "Når al natronen er blevet til Na₂CO₃, sker der ikke mere. Na₂CO₃ tåler flammen. Mere tid giver den samme slutmasse.",
          fejl: { hoejere: "Længere tid kan ikke gøre diglen tungere. Der kommer intet til.",
                  lavere: "Det ville passe, hvis stoffet i diglen blev ved med at give gas. Men når massen er konstant, sker der ikke mere." } },
        { id: "soda", titel: "Den forkerte krukke", kort: "tager soda", rigtig: "hoejere", B: { soda: true },
          tekst: "Gruppe 2 tager fejl af krukkerne. De varmer 5,10 g soda, Na₂CO₃, i stedet for natron.",
          hint: "Soda er det, natron bliver til. Kan det give mere gas?",
          forkl: "Soda sønderdeles ikke i flammen. Der forsvinder ingen gas, og slutmassen er 5,10 g. Den passer ikke med nogen af hypoteserne.",
          fejl: { lavere: "Soda giver ikke gas i flammen. Der forsvinder intet, så diglen vejer det samme som før.",
                  samme: "Soda er allerede det, natron bliver til. Der forsvinder intet, så slutmassen er 5,10 g." } }
    ];

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han siger kun noget ved
       Giv hint og Vis svaret, naar han sendes ud eller hentes, og naar der
       klikkes paa ham, koppen, kagen eller krukken. */
    D.INTRO = {
        forsoeg: "Natron varmes i en digel. Noget forsvinder, og noget bliver tilbage.",
        hypoteser: "Tre hypoteser om, hvad der bliver tilbage. Regn ud, hvad hver af dem skal veje.",
        fejl: "To grupper laver forsøget. Gruppe 2 gør én ting anderledes."
    };
    D.FAERDIG = {
        forsoeg: "Færdig.",
        hypoteser: "Vægten har talt. Det er B.",
        fejl: "Alle seks. Vægten ser kun det, der er i diglen."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Nogen har kommet natron i. Den skummer.",
        "Kaffe er sur. Natron ville gøre den flad. Hold dig fra den.",
        "Den er fra i morges. Tror jeg.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Vej du.";

    /* Paaskeaegget: kagen paa bordet. Krukken svarer ogsaa. */
    D.KAGE = [
        "Natron i dejen. CO₂ og vand får den til at hæve.",
        "Hullerne er gassen. Resten er soda. Og sukker.",
        "Den er fra lærerværelset. Den var ikke til dig."
    ];
    D.KRUKKE = "Natron, natriumhydrogencarbonat. Det står også i bagepulver.";

    D.SNYD_LINJE = "Noteret. Det står i journalen nu.";

    NK.Data = D;
}());

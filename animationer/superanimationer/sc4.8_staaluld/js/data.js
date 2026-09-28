/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   klumperne af ståluld, hvor meget af jernet der naar at reagere, hvor
   hurtigt det braender, det gratis gaet, regnetrinene paa fane 2,
   spoergsmaalet til sidst og det, Kemichael siger. Kemien regnes i
   kemi.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1) ---------------------------- */
    D.ATOMMASSE = { Fe: 5585, O: 1600 };

    /* Molarmasserne i hundrededele: Fe 55,85 og FeO 71,85 g/mol */
    D.M = { Fe: D.ATOMMASSE.Fe, FeO: D.ATOMMASSE.Fe + D.ATOMMASSE.O };

    /* Reaktionen, som den gamle c4.8 skrev den: 2 Fe + O₂ → 2 FeO */
    D.REAKTION = "2 Fe + O₂ → 2 FeO";

    /* ----- Fane 1: forsoeget -----------------------------------------------------
       Klumperne (g). Stålulden regnes som rent jern. */
    D.KLUMPER = [4.00, 3.50, 5.00, 3.00, 4.50, 2.50];

    /* Den del af jernet, der naar at reagere, varierer fra klump til klump
       som i den gamle (75-88 %). Ilten naar ikke ind til det inderste. */
    D.UDBYTTE = { min: 0.75, maks: 0.88 };

    /* Hvor hurtigt det braender: p er den del af det jern, der kan naas,
       som har reageret (0-1). dp/dt = k · (1 − p) + min, saa det gaar
       hurtigt i starten og langsomt til sidst (ca. 20 s i alt). Ilt fra
       flasken goer det seks gange hurtigere i 2 s ad gangen. */
    D.BRAND = { k: 0.10, min: 0.015, ilt: 6, iltTid: 2.0 };

    D.FORSOEG = [
        { id: "m1", titel: "Måling 1", gaet: true,
          tekst: "Brænd en klump ståluld på vægten. Skriv vægtens tal før og efter i skemaet.",
          efter: "Stålulden blev tungere. Ilt fra luften har bundet sig til jernet." },
        { id: "m2", titel: "Måling 2",
          tekst: "En ny klump ståluld. Gør det samme igen.",
          efter: "To målinger. Regn på dem på fanen Beregningen." }
    ];

    /* ----- Det gratis gaet (maaling 1) -----------------------------------------------
       Tre kort med hvert sit billede (sprites/gaet_*.svg). forkl: det,
       linjen siger, naar forsoeget har vist, at gaettet ikke holdt. */
    D.GAET = {
        etiket: "Gratis gæt",
        spm: "Hvad viser vægten, når stålulden har brændt?",
        note: "Et gæt koster ingenting. Klik på det, du tror, og tænd så for stålulden.",
        kemichael: "Først en hypotese. Bliver stålulden lettere eller tungere af at brænde? Et gæt er gratis.",
        svar: [
            { id: "lettere", t: "Lettere", pil: "↓", billede: "gaet_lettere.svg",
              tekst: "Den går op i røg som brændet på et bål.",
              forkl: "Brænde bliver lettere, fordi gasserne fra det forsvinder op i luften. Her binder ilt fra luften sig til jernet, og ilten vejer med." },
            { id: "samme", t: "Det samme", pil: "=", billede: "gaet_samme.svg",
              tekst: "Den bliver sort, men det er det samme jern.",
              forkl: "Jernet er det samme, ja. Men ilt fra luften binder sig til jernet, og ilten vejer med." },
            { id: "tungere", t: "Tungere", pil: "↑", billede: "gaet_tungere.svg", ok: true,
              tekst: "Den tager noget til sig som et søm, der ruster." }
        ]
    };

    /* Linjen i opgavekortet i hver fase af en maaling */
    D.LINJE = {
        valg: "Gæt først: klik på et af de tre billeder.",
        foer: "Aflæs vægten, og skriv m(før) i skemaet.",
        taend: "Tænd stålulden: træk batteriet hen til den, eller klik på batteriet.",
        vent: "Stålulden brænder, og vægten stiger. Vent, til den står stille. Klik på iltflasken for at give mere ilt.",
        efter: "Vægten står stille. Aflæs den, og skriv m(efter) i skemaet."
    };

    D.HINT = {
        foer: "Tallet står på displayet på vægten. Skriv det med to decimaler.",
        taend: "Batteriet står på bordet til venstre for vægten. Træk det hen til stålulden. Et klik på batteriet virker også.",
        vent: "Vægten stiger, så længe jernet reagerer med ilten. Iltflasken gør det hurtigere.",
        efter: "Tallet står på displayet på vægten."
    };

    D.SVAR = {
        foer: "Vægten viser {m} g.",
        taend: "Batteriet tænder stålulden.",
        vent: "Tiden går hurtigere, til vægten står stille.",
        efter: "Vægten viser {m} g."
    };

    /* Eksempler, hvis eleven ikke har maalt selv (samme model: 4,00 g
       med 82 % og 3,00 g med 79 % af jernet) */
    D.EKSEMPEL = [{ mf: 4.00, me: 4.94 }, { mf: 3.00, me: 3.68 }];

    /* ----- Fane 2: beregningen ----------------------------------------------------------
       Maaling 1 og 2 kommer fra fane 1 (eller fra D.EKSEMPEL). I maaling 2
       staar formlerne der allerede. Maaling 1 slutter med spoergsmaalet,
       hvorfor vaegten viste mindre end beregnet. */
    D.BEREGNING = [
        { id: "m1", titel: "Måling 1", maaling: 0, spm: true },
        { id: "m2", titel: "Måling 2", maaling: 1, kunTal: true }
    ];

    D.OVER_TAVLE = "Hvad vejer stålulden, hvis alt jernet bliver til FeO?";

    /* Regnetrinene. op: "/" (broek), "*" (to tal ganget) eller null (ingen
       mellemregning). led: formlens to led. Hintene giver tit halvdelen:
       {a} og {b} er leddene med enhed, {a0} og {b0} uden. */
    D.TRIN = {
        n_fe: { navn: "Stofmængden af jern", venstre: "n(Fe)", enhed: "mol", op: "/", led: ["m(Fe)", "M(Fe)"],
                formelHint: "Du kender massen af jernet, og molarmassen står på tavlen. Formlen begynder: n(Fe) = m(Fe) / …",
                indsaetHint: ["Over brøkstregen står massen af stålulden: {a}.", "Under brøkstregen står molarmassen af jern: {b}."],
                talHint: "Tast {a0} ÷ {b0} på lommeregneren. Svaret er i mol." },
        n_feo: { navn: "Stofmængden af FeO", venstre: "n(FeO)", enhed: "mol", op: null, led: ["n(Fe)"],
                 formelHint: "Se på tallene foran Fe og FeO i reaktionsskemaet på tavlen. Der står 2 foran begge.",
                 talHint: "Forholdet er 2 : 2, altså 1 : 1. Tallet er det samme som i trin 1: {a}." },
        m_feo: { navn: "Massen af FeO", venstre: "m(FeO)", enhed: "g", op: "*", led: ["n(FeO)", "M(FeO)"],
                 formelHint: "Du kender stofmængden af FeO, og molarmassen står på tavlen. Formlen begynder: m(FeO) = n(FeO) · …",
                 indsaetHint: ["Det første tal er stofmængden fra trin 2: {a}.", "Det andet tal er molarmassen af FeO: {b}."],
                 talHint: "Tast {a0} · {b0} på lommeregneren. Svaret er i gram." }
    };
    D.TRINLISTE = ["n_fe", "n_feo", "m_feo"];

    /* Spoergsmaalet efter maaling 1: de forkerte svar er det, elever tror */
    D.HVORFOR = {
        spm: "Vægten viste mindre, end du har regnet ud. Hvorfor?",
        hint: "Kan ilten komme helt ind til jernet midt i klumpen? Se luppen på fanen Forsøget.",
        svar: [
            { t: "Jernet fordampede i varmen.", forkl: "Jern koger først ved næsten 3000 °C. Så varm bliver stålulden ikke." },
            { t: "Ikke alt jernet nåede at reagere.", ok: true },
            { t: "Vægten kan ikke veje ilten.", forkl: "Jo. Det er netop ilten, der gør stålulden tungere." }
        ],
        efter: "Ilten når ikke ind til alt jernet. Her reagerede ca. {p} % af det."
    };

    /* ----- Replikkerne ------------------------------------------------------------------
       Linjen i opgavekortet siger, hvor man er (INTRO), naeste skridt,
       fejl og ros. Kemichael blander sig ikke: han introducerer gaettet,
       siger noget ved Giv hint og Vis svaret, naar han sendes ud eller
       hentes, og naar der klikkes paa ham, koppen eller stjernekasteren. */
    D.INTRO = {
        forsoeg: "Stålulden brænder på vægten. Hvad sker der med massen?",
        beregning: "Hvad kan stålulden højst komme til at veje, når den har brændt?"
    };
    D.FAERDIG = {
        forsoeg: "Begge målinger er i skemaet.",
        beregning: "Begge målinger er regnet. Vægten viste mindre, fordi ikke alt jernet reagerede."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    D.UD_LINJE = "Fint. Jeg er på lærerværelset.";
    D.IND_LINJE = "Tilbage. Kaffen derude var ikke bedre.";

    D.KAFFE = [
        "Kold. Som altid.",
        "Den er fra i morges. Tror jeg.",
        "Hold stålulden væk fra koppen.",
        "Stadig kold. Men det er min."
    ];
    D.PRIK_SIDST = "Jeg sidder her bare. Vej du.";

    /* Paaskeaegget: stjernekasteren paa bordet */
    D.STJERNE = [
        "Gnisterne fra en stjernekaster er små korn af jern, der brænder.",
        "Samme reaktion som stålulden. Bare til nytår.",
        "Den er fra sidste nytår. Jeg kunne ikke smide den ud."
    ];

    NK.Data = D;
}());

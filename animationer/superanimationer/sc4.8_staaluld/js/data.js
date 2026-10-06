/* =====================================================================
   data.js - tallene, opgaverne og teksterne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne,
   de to reaktionsskemaer (Let og Svær), klumperne af ståluld, hvor meget
   af jernet der naar at reagere, hvor hurtigt det braender, det gratis
   gaet, regnetrinene paa fane 2, spoergsmaalet til sidst og linjerne i
   statuslinjen. Kemien regnes i kemi.js; tegningen kender kun
   resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1) ---------------------------- */
    D.ATOMMASSE = { Fe: 5585, O: 1600 };

    /* ----- De to reaktionsskemaer paa fane 2 --------------------------------------
       Let:  2 Fe + O₂ → 2 FeO, som den gamle c4.8. Forholdet er 1 : 1.
       Svær: 3 Fe + 2 O₂ → Fe₃O₄, det oxid, der mest dannes, naar jern
             braender (brugerens oenske 5. okt. 2026: et mere realistisk
             skema som tilvalg). Forholdet er 3 : 1.
       koef: tallene foran Fe, O₂ og oxidet. fe og o: atomerne i oxidet;
       molarmassen regnes af dem. Forholdet mellem Fe og oxidet skal kunne
       forkortes til n : 1 (4 Fe + 3 O₂ → 2 Fe₂O₃ gaar ogsaa: 2 : 1). */
    D.SKEMA = {
        let:   { id: "let",   knap: "Let",  oxid: "FeO",   koef: [2, 1, 2], fe: 1, o: 1 },
        svaer: { id: "svaer", knap: "Svær", oxid: "Fe₃O₄", koef: [3, 2, 1], fe: 3, o: 4 }
    };
    D.SKEMAER = ["let", "svaer"];
    D.SKEMA_TITEL = "Reaktionsskema";
    D.SKEMA_TIP = "Let regner med FeO. Svær regner med Fe₃O₄, som er det oxid, der mest dannes.";

    /* ----- Fane 1: forsoeget -----------------------------------------------------
       Klumperne (g). Stålulden regnes som rent jern. */
    D.KLUMPER = [4.00, 3.50, 5.00, 3.00, 4.50, 2.50];

    /* Den del af jernet, der naar at reagere, varierer fra klump til klump
       som i den gamle (75-88 %, regnet som FeO). Ilten naar ikke ind til
       det inderste. */
    D.UDBYTTE = { min: 0.75, maks: 0.88 };

    /* Branden (brugerens oenske 28. sept. 2026: lidt langsommere, og den
       naar ikke til ende uden iltflasken). p er den del af det jern, ilten
       kan naa, der har reageret (0-1), og G er gloeden (0-1).
         I luft:     dp/dt = k/luft · G · (luft − p), og G falder med
                     slukker pr. sekund. Gloeden doer, foer p naar luft,
                     og under ud er stålulden gaaet ud (ca. 33 s; p ender
                     ved ca. 0,6).
         Med ilt:    dp/dt = ilt · (k · G · (1 − p) + iltMin · G), og G
                     stiger mod 1. Ét klik giver ilt i iltTid sekunder.
       Er stålulden gaaet ud, kan den ikke taendes igen. */
    D.BRAND = { k: 0.12, luft: 0.7, slukker: 0.085, ud: 0.06, ilt: 3, iltMin: 0.02, iltTid: 2.0 };

    D.FORSOEG = [
        { id: "m1", titel: "Måling 1", gaet: true,
          tekst: "Brænd en klump ståluld på vægten. Aflæs massen før og efter.",
          efter: "Ilt fra luften har bundet sig til jernet." },
        { id: "m2", titel: "Måling 2",
          tekst: "En ny klump ståluld. Gør det samme igen.",
          efter: "To målinger. Regn på dem på fanen Beregningen." }
    ];

    /* ----- Det gratis gaet (maaling 1) -----------------------------------------------
       Startskaermen: en kort indledning, spoergsmaalet og tre kort med
       hvert sit billede (sprites/gaet_*.svg). Den daekker hele scenen, saa
       intet sker bag den, mens eleven svarer (brugerens oenske 5. okt.
       2026). forkl: det, linjen siger, naar forsoeget har vist, at gaettet
       ikke holdt. */
    D.GAET = {
        etiket: "Gæt først",
        intro: "Ståluld er tynde tråde af jern, og de kan brænde. Om lidt sætter du ild til en klump, der ligger på en vægt.",
        spm: "Hvad viser vægten, når stålulden har brændt?",
        note: "Gættet koster ingenting. Forsøget viser, om det holder.",
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

    /* Linjen i statuslinjen i hver fase af en maaling: det naeste skridt */
    D.LINJE = {
        valg: "Gæt først: klik på et af de tre billeder.",
        foer: "Aflæs vægten, og skriv tallet i feltet.",
        taend: "Klik på bunsenbrænderen. Så tænder flammen stålulden.",
        vent: "Stålulden gløder, og vægten stiger. Klik på iltflasken, så mere af jernet reagerer.",
        efter: "Vægten står stille. Aflæs den, og skriv tallet i feltet."
    };

    /* Det, feltet i statuslinjen hedder, og de smaa skilte ved pilene i scenen */
    D.FELT = { foer: "m(før)", efter: "m(efter)" };
    D.SKILT = { taend: "Klik for at tænde", ilt: "Klik for mere ilt" };

    D.HINT = {
        foer: "Tallet står på displayet på vægten. Skriv det med to decimaler, fx 4,25.",
        taend: "Bunsenbrænderen står til venstre for vægten. Klik på den. Du kan også trække den hen, så flammen rører stålulden.",
        vent: "Uden ekstra ilt går stålulden ud, før alt jernet har reageret. Klik på iltflasken flere gange, mens den gløder.",
        efter: "Tallet står på displayet på vægten."
    };

    D.SVAR = {
        foer: "Vægten viser {m} g.",
        taend: "Brænderen tænder stålulden.",
        vent: "Tiden går hurtigere, til vægten står stille.",
        efter: "Vægten viser {m} g."
    };

    /* Er stålulden gaaet ud uden ilt fra flasken, siger linjen det bagefter */
    D.UDEN_ILT = "Uden iltflasken gik den ud, før alt jernet havde reageret.";

    /* Eksempler, hvis eleven ikke har maalt selv (samme model: 4,00 g
       med ilt til sidst og 82 % af jernet, 3,00 g uden ilt og 80 %) */
    D.EKSEMPEL = [{ mf: 4.00, me: 4.94 }, { mf: 3.00, me: 3.41 }];

    /* ----- Fane 2: beregningen ----------------------------------------------------------
       Maaling 1 og 2 kommer fra fane 1 (eller fra D.EKSEMPEL). I maaling 2
       staar formlerne der allerede. Maaling 1 slutter med spoergsmaalet,
       hvorfor vaegten viste mindre end beregnet. */
    D.BEREGNING = [
        { id: "m1", titel: "Måling 1", maaling: 0, spm: true },
        { id: "m2", titel: "Måling 2", maaling: 1, kunTal: true }
    ];

    /* {ox} er oxidet i det valgte reaktionsskema */
    D.OVER_TAVLE = "Hvad vejer stålulden, hvis alt jernet bliver til {ox}?";
    D.TAVLE_TITEL = "Mængdeberegning";
    D.KUN_TAL = "Formlerne er de samme som i måling 1, så her skriver du kun tallene.";
    D.EKSEMPEL_NOTE = "Tallene er et eksempel. Lav forsøget på fanen Forsøget for at regne på dine egne.";

    /* Raekkerne i skemaet paa tavlen */
    D.RAEKKER = [
        { id: "m", navn: "masse" },
        { id: "M", navn: "molarmasse" },
        { id: "n", navn: "stofmængde" }
    ];

    /* Regnetrinene. op: "/" (broek), "*" (to tal ganget) eller null (ingen
       mellemregning). led: formlens to led. Hintene giver tit halvdelen:
       {a} og {b} er leddene med enhed, {a0} og {b0} uden. {ox} er oxidet,
       {kfe} og {kox} tallene foran Fe og oxidet, og {del} det tal,
       stofmaengden af jern deles med.
       Trin 2 findes i to udgaver: n_ox_ens, naar forholdet er 1 : 1 (Let),
       og n_ox_del, naar stofmaengden af jern skal deles (Svær). */
    D.TRIN = {
        n_fe: { navn: "Stofmængden af jern", venstre: "n(Fe)", enhed: "mol", op: "/", led: ["m(Fe)", "M(Fe)"],
                formelHint: "Du kender massen af jernet, og molarmassen står i skemaet på tavlen. Formlen begynder: n(Fe) = m(Fe) / …",
                indsaetHint: ["Over brøkstregen står massen af stålulden: {a}.", "Under brøkstregen står molarmassen af jern: {b}."],
                talHint: "Tast {a0} ÷ {b0} på lommeregneren. Svaret er i mol." },
        n_ox_ens: { navn: "Stofmængden af {ox}", venstre: "n({ox})", enhed: "mol", op: null, led: ["n(Fe)"],
                    formelHint: "Se på tallene foran Fe og {ox} i reaktionsskemaet på tavlen. Der står {kfe} foran begge.",
                    talHint: "Forholdet er {kfe} : {kox}, altså 1 : 1. Tallet er det samme som i trin 1: {a}." },
        n_ox_del: { navn: "Stofmængden af {ox}", venstre: "n({ox})", enhed: "mol", op: "/", led: ["n(Fe)", "{del}"],
                    formelHint: "Se på tallene foran Fe og {ox} i reaktionsskemaet på tavlen. Forholdet er {kfe} : {kox}. Formlen begynder: n({ox}) = n(Fe) / …",
                    indsaetHint: ["Over brøkstregen står stofmængden af jern fra trin 1: {a}.", "Under brøkstregen står tallet {b}. Det har ingen enhed."],
                    talHint: "Tast {a0} ÷ {b0} på lommeregneren. Svaret er i mol." },
        m_ox: { navn: "Massen af {ox}", venstre: "m({ox})", enhed: "g", op: "*", led: ["n({ox})", "M({ox})"],
                formelHint: "Du kender stofmængden af {ox}, og molarmassen står i skemaet på tavlen. Formlen begynder: m({ox}) = n({ox}) · …",
                indsaetHint: ["Det første tal er stofmængden fra trin 2: {a}.", "Det andet tal er molarmassen af {ox}: {b}."],
                talHint: "Tast {a0} · {b0} på lommeregneren. Svaret er i gram." }
    };
    D.TRINLISTE = ["n_fe", "n_ox", "m_ox"];

    /* Det, der staar, naar eleven klikker paa en celle i skemaet paa tavlen */
    D.CELLE = {
        fe_m: "Massen af stålulden, før den brændte. Stålulden regnes som rent jern.",
        fe_M: "Molarmassen af jern: 1 mol jern vejer {MFe} g.",
        ox_M: "Molarmassen af {ox}: 1 mol {ox} vejer {MOx} g.",
        o2: "Ilten kommer fra luften. Dens masse skal du ikke bruge her.",
        skjult: "Det tal finder du i trin {nr}.",
        fundet: "Det har du regnet ud i trin {nr}."
    };

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

    /* ----- Linjerne ----------------------------------------------------------------------
       Der er ingen laerer i animationen (brugerens valg 5. okt. 2026).
       Statuslinjen siger naeste skridt, fejl, hint og ros. */
    D.FAERDIG = {
        forsoeg: "Begge målinger er i skemaet.",
        beregning: "Begge målinger er regnet. Vægten viste mindre, fordi ikke alt jernet reagerede."
    };
    /* Ros for et regnetrin paa fane 2 og for et tal, der er aflaest rigtigt paa fane 1 */
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_AFLAEST = ["Rigtigt.", "Præcis.", "Ja.", "Fint."];

    NK.Data = D;
}());

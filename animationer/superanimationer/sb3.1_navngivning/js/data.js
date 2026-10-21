/* =====================================================================
   data.js - stofklasserne, stofferne og de faste tekster

   Her kan man rette uden at roere koden:
     KLASSER    de seks stofklasser fra kemi C, der kan slaas til og fra
     STANDARD   de stofklasser, der er slaaet til fra start (alle)
     STOFFER    stofferne paa fane 1 (Tegn molekylet) og fane 2 (Skriv navnet)
     VAERKTOEJ  vaerktoejerne oeverst paa tavlen paa fane 1

   Et stof i STOFFER:
     navn   det systematiske navn. Molekylemotoren bygger molekylet af det,
            og selvtesten tjekker, at motoren giver det samme navn tilbage.
            Navnets dele (forled, stamme, endelse) laeses af navnet selv
            (K.dele i js/kemi.js), og selvtesten tjekker, at de giver navnet
     k      stofklassen (id fra KLASSER)
     niv    1 Let, 2 Middel, 3 Svaer
     fane   "t" Tegn molekylet, "s" Skriv navnet
     vend   sand: formlen tegnes spejlvendt paa fane 2, saa nummer 1 ikke
            altid er til venstre

   Niveauerne:
     Let     lige kaede, og tallet (hvis der er et) er let at finde
     Middel  gruppens eller dobbeltbindingens plads skal tælles, eller
             kaeden er lang
     Svaer   sidegrupper, flere ens grupper, ringe og stoffer med to
             slags grupper (2-hydroxypropansyre, som i afsnit B3.1)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* farve: paa de moerke kort og knapper. har: det, stofklassen har */
    D.KLASSER = [
        { id: "alkan", navn: "Alkan", ental: "en alkan", endelse: "-an", farve: "#b4bfcf", har: "kun enkeltbindinger" },
        { id: "alken", navn: "Alken", ental: "en alken", endelse: "-en", farve: "#7fd3a0", har: "en dobbeltbinding" },
        { id: "alkyn", navn: "Alkyn", ental: "en alkyn", endelse: "-yn", farve: "#86b6ff", har: "en tripelbinding" },
        { id: "halogen", navn: "Halogenalkan", ental: "en halogenalkan", endelse: "Cl, Br", farve: "#f0a35a", har: "et halogenatom" },
        { id: "alkohol", navn: "Alkohol", ental: "en alkohol", endelse: "-ol", farve: "#3fc7d1", har: "en OH-gruppe" },
        { id: "carboxylsyre", navn: "Carboxylsyre", ental: "en carboxylsyre", endelse: "-syre", farve: "#f58a7e", har: "en COOH-gruppe" }
    ];

    D.STANDARD = ["alkan", "alken", "alkyn", "halogen", "alkohol", "carboxylsyre"];

    /* Navnets dele har bogens farver (figuren Navnets tre dele i afsnit B3.1):
       forleddet orange, endelsen groen. Stammen er blaa, saa den kan ses paa
       baade kortet og whiteboardet. blaek: paa det hvide whiteboard */
    D.DELE = {
        forled: { navn: "forled", farve: "#f0a35a", blaek: "#c2570c" },
        stamme: { navn: "stamme", farve: "#8ab8ff", blaek: "#2563eb" },
        endelse: { navn: "endelse", farve: "#4fd6b8", blaek: "#0f766e" }
    };

    D.TAL = ["nul", "ét", "to", "tre", "fire", "fem", "seks", "syv", "otte", "ni", "ti"];
    D.NIVEAUER = ["Let", "Middel", "Svær"];

    D.STOFFER = [
        /* ----- Alkaner -------------------------------------------------------- */
        { navn: "propan", k: "alkan", niv: 1, fane: "t" },
        { navn: "butan", k: "alkan", niv: 1, fane: "t" },
        { navn: "hexan", k: "alkan", niv: 1, fane: "t" },
        { navn: "2-methylbutan", k: "alkan", niv: 2, fane: "t" },
        { navn: "3-methylpentan", k: "alkan", niv: 2, fane: "t" },
        { navn: "cyclohexan", k: "alkan", niv: 2, fane: "t" },
        { navn: "2,2-dimethylpropan", k: "alkan", niv: 3, fane: "t" },
        { navn: "3-ethylpentan", k: "alkan", niv: 3, fane: "t" },
        { navn: "2,2,4-trimethylpentan", k: "alkan", niv: 3, fane: "t" },
        { navn: "methylcyclohexan", k: "alkan", niv: 3, fane: "t" },

        { navn: "ethan", k: "alkan", niv: 1, fane: "s" },
        { navn: "pentan", k: "alkan", niv: 1, fane: "s" },
        { navn: "heptan", k: "alkan", niv: 1, fane: "s" },
        { navn: "2-methylpropan", k: "alkan", niv: 2, fane: "s" },
        { navn: "2-methylpentan", k: "alkan", niv: 2, fane: "s", vend: true },
        { navn: "cyclopentan", k: "alkan", niv: 2, fane: "s" },
        { navn: "2,3-dimethylbutan", k: "alkan", niv: 3, fane: "s" },
        { navn: "3-ethyl-2-methylpentan", k: "alkan", niv: 3, fane: "s", vend: true },
        { navn: "3-ethylhexan", k: "alkan", niv: 3, fane: "s" },
        { navn: "2,4-dimethylhexan", k: "alkan", niv: 3, fane: "s", vend: true },

        /* ----- Alkener -------------------------------------------------------- */
        { navn: "ethen", k: "alken", niv: 1, fane: "t" },
        { navn: "propen", k: "alken", niv: 1, fane: "t" },
        { navn: "but-1-en", k: "alken", niv: 2, fane: "t" },
        { navn: "pent-2-en", k: "alken", niv: 2, fane: "t" },
        { navn: "hex-3-en", k: "alken", niv: 2, fane: "t" },
        { navn: "2-methylpropen", k: "alken", niv: 3, fane: "t" },
        { navn: "3-methylbut-1-en", k: "alken", niv: 3, fane: "t" },
        { navn: "cyclohexen", k: "alken", niv: 3, fane: "t" },

        { navn: "propen", k: "alken", niv: 1, fane: "s" },
        { navn: "but-2-en", k: "alken", niv: 2, fane: "s" },
        { navn: "pent-1-en", k: "alken", niv: 2, fane: "s", vend: true },
        { navn: "hex-2-en", k: "alken", niv: 2, fane: "s" },
        { navn: "2-methylbut-2-en", k: "alken", niv: 3, fane: "s" },
        { navn: "4-methylpent-2-en", k: "alken", niv: 3, fane: "s", vend: true },
        { navn: "2-methylbut-1-en", k: "alken", niv: 3, fane: "s" },

        /* ----- Alkyner -------------------------------------------------------- */
        { navn: "ethyn", k: "alkyn", niv: 1, fane: "t" },
        { navn: "but-2-yn", k: "alkyn", niv: 2, fane: "t" },
        { navn: "pent-1-yn", k: "alkyn", niv: 2, fane: "t" },
        { navn: "3-methylbut-1-yn", k: "alkyn", niv: 3, fane: "t" },

        { navn: "propyn", k: "alkyn", niv: 1, fane: "s" },
        { navn: "but-1-yn", k: "alkyn", niv: 2, fane: "s", vend: true },
        { navn: "pent-2-yn", k: "alkyn", niv: 2, fane: "s" },
        { navn: "4-methylpent-2-yn", k: "alkyn", niv: 3, fane: "s" },

        /* ----- Halogenalkaner (substitution i 4.3 og addition i 4.4) ----------- */
        { navn: "chlormethan", k: "halogen", niv: 1, fane: "t" },
        { navn: "bromethan", k: "halogen", niv: 1, fane: "t" },
        { navn: "2-brompropan", k: "halogen", niv: 2, fane: "t" },
        { navn: "1,2-dibromethan", k: "halogen", niv: 2, fane: "t" },
        { navn: "2-bromhexan", k: "halogen", niv: 2, fane: "t" },
        { navn: "2-brom-2-methylpropan", k: "halogen", niv: 3, fane: "t" },
        { navn: "2,3-dibrombutan", k: "halogen", niv: 3, fane: "t" },
        { navn: "trichlormethan", k: "halogen", niv: 3, fane: "t" },

        { navn: "chlorethan", k: "halogen", niv: 1, fane: "s" },
        { navn: "1-brompropan", k: "halogen", niv: 2, fane: "s" },
        { navn: "2-chlorbutan", k: "halogen", niv: 2, fane: "s", vend: true },
        { navn: "3-brompentan", k: "halogen", niv: 2, fane: "s" },
        { navn: "dichlormethan", k: "halogen", niv: 3, fane: "s" },
        { navn: "1,2-dibrompropan", k: "halogen", niv: 3, fane: "s", vend: true },
        { navn: "1-brom-2-methylpropan", k: "halogen", niv: 3, fane: "s" },

        /* ----- Alkoholer -------------------------------------------------------- */
        { navn: "ethanol", k: "alkohol", niv: 1, fane: "t" },
        { navn: "propan-1-ol", k: "alkohol", niv: 1, fane: "t" },
        { navn: "propan-2-ol", k: "alkohol", niv: 2, fane: "t" },
        { navn: "butan-2-ol", k: "alkohol", niv: 2, fane: "t" },
        { navn: "pentan-3-ol", k: "alkohol", niv: 2, fane: "t" },
        { navn: "2-methylpropan-2-ol", k: "alkohol", niv: 3, fane: "t" },
        { navn: "4-methylpentan-2-ol", k: "alkohol", niv: 3, fane: "t" },
        { navn: "ethan-1,2-diol", k: "alkohol", niv: 3, fane: "t" },
        { navn: "cyclohexanol", k: "alkohol", niv: 3, fane: "t" },

        { navn: "methanol", k: "alkohol", niv: 1, fane: "s" },
        { navn: "butan-1-ol", k: "alkohol", niv: 1, fane: "s", vend: true },
        { navn: "pentan-2-ol", k: "alkohol", niv: 2, fane: "s", vend: true },
        { navn: "hexan-2-ol", k: "alkohol", niv: 2, fane: "s" },
        { navn: "hexan-3-ol", k: "alkohol", niv: 2, fane: "s", vend: true },
        { navn: "3-methylbutan-2-ol", k: "alkohol", niv: 3, fane: "s" },
        { navn: "2-methylpropan-1-ol", k: "alkohol", niv: 3, fane: "s", vend: true },
        { navn: "propan-1,2,3-triol", k: "alkohol", niv: 3, fane: "s" },

        /* ----- Carboxylsyrer ------------------------------------------------------ */
        { navn: "methansyre", k: "carboxylsyre", niv: 1, fane: "t" },
        { navn: "propansyre", k: "carboxylsyre", niv: 1, fane: "t" },
        { navn: "butansyre", k: "carboxylsyre", niv: 2, fane: "t" },
        { navn: "hexansyre", k: "carboxylsyre", niv: 2, fane: "t" },
        { navn: "2-methylpropansyre", k: "carboxylsyre", niv: 3, fane: "t" },
        { navn: "2-hydroxypropansyre", k: "carboxylsyre", niv: 3, fane: "t" },
        { navn: "chlorethansyre", k: "carboxylsyre", niv: 3, fane: "t" },

        { navn: "ethansyre", k: "carboxylsyre", niv: 1, fane: "s" },
        { navn: "pentansyre", k: "carboxylsyre", niv: 2, fane: "s", vend: true },
        { navn: "octansyre", k: "carboxylsyre", niv: 2, fane: "s" },
        { navn: "3-methylbutansyre", k: "carboxylsyre", niv: 3, fane: "s" },
        { navn: "2-methylbutansyre", k: "carboxylsyre", niv: 3, fane: "s", vend: true },
        { navn: "3-hydroxybutansyre", k: "carboxylsyre", niv: 3, fane: "s" },
        { navn: "butandisyre", k: "carboxylsyre", niv: 3, fane: "s" }
    ];

    /* Vaerktoejerne paa fane 1. klasser: de stofklasser, der bruger vaerktoejet.
       Et vaerktoej, opgavens eget stof har brug for, er der altid (chlorethansyre
       faar −Cl, ogsaa naar halogenalkanerne er slaaet fra). */
    D.VAERKTOEJ = [
        { id: "tegn", tekst: "Kæde", titel: "Træk fra et carbonatom, eller klik på et: kæden vokser med ét carbonatom", klasser: null },
        { id: "binding", tekst: "= Binding", titel: "Klik på en binding: enkelt, dobbelt, tripel og tilbage", klasser: ["alken", "alkyn"] },
        { id: "gruppe:OH", tekst: "−OH", titel: "Klik på et carbonatom for at sætte en OH-gruppe på", klasser: ["alkohol", "carboxylsyre"] },
        { id: "gruppe:O", tekst: "=O", titel: "Klik på et carbonatom for at sætte et oxygenatom på med en dobbeltbinding", klasser: ["carboxylsyre"] },
        { id: "gruppe:COOH", tekst: "−COOH", titel: "Klik på carbonatomet for enden af kæden: det bliver til COOH-gruppen", klasser: ["carboxylsyre"] },
        { id: "halogen:Cl", tekst: "−Cl", titel: "Klik på et carbonatom for at sætte et chloratom på", klasser: ["halogen"] },
        { id: "halogen:Br", tekst: "−Br", titel: "Klik på et carbonatom for at sætte et bromatom på", klasser: ["halogen"] },
        { id: "ring6", tekst: "⬡ Ring", titel: "Klik på tavlen: en ring med seks carbonatomer", klasser: ["alkan", "alken", "alkohol"] }
    ];

    /* Rosen, naar alle opgaver paa en fane er loest (kommer efter forklaringen) */
    D.FAERDIG = {
        t: "Du har tegnet alle stofferne.",
        s: "Du har givet alle stofferne navn."
    };

    NK.Data = D;
}());

/* =====================================================================
   data.js - stofklasserne, stofferne og de faste tekster

   Her kan man rette uden at roere koden:
     KLASSER    de seks stofklasser, der kan slaas til og fra
     STANDARD   de stofklasser, der er slaaet til fra start
     STOFFER    stofferne paa fane 1 (Giv navnet) og fane 2 (Tegn molekylet)
     BLANDEDE   stofferne paa fane 3 (Flere grupper)

   Et stof i STOFFER:
     navn   det systematiske navn. Molekylemotoren bygger molekylet af det,
            og selvtesten tjekker, at motoren giver det samme navn tilbage
     k      stofklassen (id fra KLASSER)
     dele   navnets dele, som de staar paa kortet:
              alkohol, aldehyd, keton, carboxylsyre: [forled, stamme, endelse]
              ester:  [alkoholens del, syrens del]
              amin:   [carbonkaederne, "amin"]
     niv    1 Let, 2 Middel, 3 Svaer
     fane   "n" Giv navnet, "t" Tegn molekylet
     vend   sand: formlen tegnes spejlvendt, saa nummer 1 ikke altid er til venstre
     valg   (kun aminer) de kaedenavne, eleven vaelger imellem
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* farve: paa de moerke kort og knapper. blaek: paa det hvide whiteboard */
    D.KLASSER = [
        { id: "alkohol", navn: "Alkohol", ental: "en alkohol", gruppe: "−OH", endelse: "-ol", farve: "#3fc7d1", blaek: "#0b8791",
          har: "en OH-gruppe på kæden" },
        { id: "aldehyd", navn: "Aldehyd", ental: "et aldehyd", gruppe: "−CHO", endelse: "-al", farve: "#f0a35a", blaek: "#c2570c",
          har: "C=O for enden af kæden" },
        { id: "keton", navn: "Keton", ental: "en keton", gruppe: "C=O", endelse: "-on", farve: "#b9a0f5", blaek: "#7046cf",
          har: "C=O inde i kæden" },
        { id: "carboxylsyre", navn: "Carboxylsyre", ental: "en carboxylsyre", gruppe: "−COOH", endelse: "-syre", farve: "#f58a7e", blaek: "#cf3327",
          har: "C=O og OH på samme carbonatom" },
        { id: "ester", navn: "Ester", ental: "en ester", gruppe: "−COO−", endelse: "-oat", farve: "#6fd99c", blaek: "#1c8a4e",
          har: "C=O og et O i kæden på samme carbonatom" },
        { id: "amin", navn: "Amin", ental: "en amin", gruppe: "−NH₂", endelse: "-amin", farve: "#86b6ff", blaek: "#2a5fd6",
          har: "et nitrogenatom" }
    ];

    D.STANDARD = ["alkohol", "aldehyd", "keton", "carboxylsyre"];

    /* Navnets dele har bogens farver (figuren Navnets tre dele i afsnit B3.1):
       forleddet orange, endelsen groen. Stammen er blaa, saa den kan ses paa
       baade kortet og whiteboardet. */
    D.DELE = {
        forled: { navn: "forled", farve: "#f0a35a", blaek: "#c2570c" },
        stamme: { navn: "stamme", farve: "#8ab8ff", blaek: "#2563eb" },
        endelse: { navn: "endelse", farve: "#4fd6b8", blaek: "#0f766e" },
        alkohol: { navn: "alkoholens del", farve: "#f0a35a", blaek: "#c2570c" },
        syre: { navn: "syrens del", farve: "#4fd6b8", blaek: "#0f766e" },
        kaeder: { navn: "carbonkæder", farve: "#f0a35a", blaek: "#c2570c" }
    };

    D.STAMMER = ["methan", "ethan", "propan", "butan", "pentan", "hexan"];
    D.ALKYL = ["methyl", "ethyl", "propyl", "butyl"];
    D.OATER = ["methanoat", "ethanoat", "propanoat", "butanoat"];
    D.TAL = ["nul", "ét", "to", "tre", "fire", "fem", "seks", "syv", "otte"];

    /* Kaederne paa nitrogenatomet i en amin, sagt med ord */
    D.KAEDER = {
        methyl: "én kæde med ét carbonatom",
        ethyl: "én kæde med to carbonatomer",
        propyl: "én kæde med tre carbonatomer",
        butyl: "én kæde med fire carbonatomer",
        dimethyl: "to kæder med ét carbonatom hver",
        ethylmethyl: "en kæde med to carbonatomer og en med ét",
        diethyl: "to kæder med to carbonatomer hver",
        trimethyl: "tre kæder med ét carbonatom hver"
    };

    D.NIVEAUER = ["Let", "Middel", "Svær"];

    D.STOFFER = [
        /* ----- Alkoholer ------------------------------------------------- */
        { navn: "ethanol", k: "alkohol", dele: ["", "ethan", "ol"], niv: 1, fane: "n" },
        { navn: "propan-1-ol", k: "alkohol", dele: ["", "propan", "-1-ol"], niv: 2, fane: "n", vend: true },
        { navn: "butan-2-ol", k: "alkohol", dele: ["", "butan", "-2-ol"], niv: 2, fane: "n" },
        { navn: "4-methylpentan-2-ol", k: "alkohol", dele: ["4-methyl", "pentan", "-2-ol"], niv: 3, fane: "n", vend: true },
        { navn: "methanol", k: "alkohol", dele: ["", "methan", "ol"], niv: 1, fane: "t" },
        { navn: "propan-2-ol", k: "alkohol", dele: ["", "propan", "-2-ol"], niv: 2, fane: "t" },
        { navn: "pentan-3-ol", k: "alkohol", dele: ["", "pentan", "-3-ol"], niv: 2, fane: "t" },
        { navn: "3-methylbutan-1-ol", k: "alkohol", dele: ["3-methyl", "butan", "-1-ol"], niv: 3, fane: "t" },

        /* ----- Aldehyder --------------------------------------------------- */
        { navn: "ethanal", k: "aldehyd", dele: ["", "ethan", "al"], niv: 1, fane: "n", vend: true },
        { navn: "butanal", k: "aldehyd", dele: ["", "butan", "al"], niv: 2, fane: "n" },
        { navn: "2-methylpropanal", k: "aldehyd", dele: ["2-methyl", "propan", "al"], niv: 3, fane: "n" },
        { navn: "3-methylbutanal", k: "aldehyd", dele: ["3-methyl", "butan", "al"], niv: 3, fane: "n", vend: true },
        { navn: "methanal", k: "aldehyd", dele: ["", "methan", "al"], niv: 1, fane: "t" },
        { navn: "propanal", k: "aldehyd", dele: ["", "propan", "al"], niv: 1, fane: "t" },
        { navn: "pentanal", k: "aldehyd", dele: ["", "pentan", "al"], niv: 2, fane: "t" },
        { navn: "2-methylbutanal", k: "aldehyd", dele: ["2-methyl", "butan", "al"], niv: 3, fane: "t" },

        /* ----- Ketoner ------------------------------------------------------ */
        { navn: "propanon", k: "keton", dele: ["", "propan", "on"], niv: 1, fane: "n" },
        { navn: "pentan-2-on", k: "keton", dele: ["", "pentan", "-2-on"], niv: 2, fane: "n", vend: true },
        { navn: "hexan-3-on", k: "keton", dele: ["", "hexan", "-3-on"], niv: 2, fane: "n" },
        { navn: "4-methylpentan-2-on", k: "keton", dele: ["4-methyl", "pentan", "-2-on"], niv: 3, fane: "n" },
        { navn: "butanon", k: "keton", dele: ["", "butan", "on"], niv: 1, fane: "t" },
        { navn: "pentan-3-on", k: "keton", dele: ["", "pentan", "-3-on"], niv: 2, fane: "t" },
        { navn: "hexan-2-on", k: "keton", dele: ["", "hexan", "-2-on"], niv: 2, fane: "t" },
        { navn: "3-methylbutan-2-on", k: "keton", dele: ["3-methyl", "butan", "-2-on"], niv: 3, fane: "t" },

        /* ----- Carboxylsyrer ------------------------------------------------- */
        { navn: "ethansyre", k: "carboxylsyre", dele: ["", "ethan", "syre"], niv: 1, fane: "n" },
        { navn: "butansyre", k: "carboxylsyre", dele: ["", "butan", "syre"], niv: 2, fane: "n", vend: true },
        { navn: "2-methylpropansyre", k: "carboxylsyre", dele: ["2-methyl", "propan", "syre"], niv: 3, fane: "n", vend: true },
        { navn: "3-methylbutansyre", k: "carboxylsyre", dele: ["3-methyl", "butan", "syre"], niv: 3, fane: "n" },
        { navn: "methansyre", k: "carboxylsyre", dele: ["", "methan", "syre"], niv: 1, fane: "t" },
        { navn: "propansyre", k: "carboxylsyre", dele: ["", "propan", "syre"], niv: 1, fane: "t" },
        { navn: "pentansyre", k: "carboxylsyre", dele: ["", "pentan", "syre"], niv: 2, fane: "t" },
        { navn: "2-methylbutansyre", k: "carboxylsyre", dele: ["2-methyl", "butan", "syre"], niv: 3, fane: "t" },

        /* ----- Estere ---------------------------------------------------------- */
        { navn: "methylethanoat", k: "ester", dele: ["methyl", "ethanoat"], niv: 1, fane: "n" },
        { navn: "ethylmethanoat", k: "ester", dele: ["ethyl", "methanoat"], niv: 1, fane: "n", vend: true },
        { navn: "propylethanoat", k: "ester", dele: ["propyl", "ethanoat"], niv: 2, fane: "n", vend: true },
        { navn: "ethylbutanoat", k: "ester", dele: ["ethyl", "butanoat"], niv: 3, fane: "n" },
        { navn: "ethylethanoat", k: "ester", dele: ["ethyl", "ethanoat"], niv: 1, fane: "t" },
        { navn: "methylpropanoat", k: "ester", dele: ["methyl", "propanoat"], niv: 2, fane: "t" },
        { navn: "methylbutanoat", k: "ester", dele: ["methyl", "butanoat"], niv: 2, fane: "t" },
        { navn: "propylpropanoat", k: "ester", dele: ["propyl", "propanoat"], niv: 3, fane: "t" },

        /* ----- Aminer ------------------------------------------------------------ */
        { navn: "methylamin", k: "amin", dele: ["methyl", "amin"], niv: 1, fane: "n", valg: ["methyl", "ethyl", "propyl", "dimethyl"] },
        { navn: "propylamin", k: "amin", dele: ["propyl", "amin"], niv: 1, fane: "n", vend: true, valg: ["ethyl", "propyl", "butyl", "ethylmethyl"] },
        { navn: "dimethylamin", k: "amin", dele: ["dimethyl", "amin"], niv: 2, fane: "n", valg: ["methyl", "ethyl", "dimethyl", "ethylmethyl"] },
        { navn: "ethylmethylamin", k: "amin", dele: ["ethylmethyl", "amin"], niv: 3, fane: "n", vend: true, valg: ["propyl", "dimethyl", "ethylmethyl", "diethyl"] },
        { navn: "ethylamin", k: "amin", dele: ["ethyl", "amin"], niv: 1, fane: "t" },
        { navn: "butylamin", k: "amin", dele: ["butyl", "amin"], niv: 1, fane: "t" },
        { navn: "diethylamin", k: "amin", dele: ["diethyl", "amin"], niv: 2, fane: "t" },
        { navn: "trimethylamin", k: "amin", dele: ["trimethyl", "amin"], niv: 3, fane: "t" }
    ];

    /* Fane 3: stoffer med flere funktionelle grupper.
         navn  det navn, eleven ser (trivialnavnet, hvor stoffet har et kendt)
         sys   det systematiske navn, som motoren bygger molekylet af
         info  en kort saetning om stoffet, der selv naevner stoffets navn */
    D.BLANDEDE = [
        { navn: "ethan-1,2-diol", sys: "ethan-1,2-diol", niv: 1, info: "Ethan-1,2-diol bruges i kølervæske." },
        { navn: "mælkesyre", sys: "2-hydroxypropansyre", niv: 1, info: "Mælkesyre findes i yoghurt." },
        { navn: "3-hydroxybutanal", sys: "3-hydroxybutanal", niv: 1, info: "3-hydroxybutanal dannes af to molekyler ethanal." },
        { navn: "acetoin", sys: "3-hydroxybutan-2-on", niv: 1, info: "Acetoin er med til at give smør dets duft." },
        { navn: "glycin", sys: "aminoethansyre", niv: 1, info: "Glycin er den mindste aminosyre." },
        { navn: "2-aminoethanol", sys: "2-aminoethanol", niv: 1, info: "2-aminoethanol kan fjerne CO₂ fra røg." },

        { navn: "glycerol", sys: "propan-1,2,3-triol", niv: 2, info: "Glycerol indgår i alle fedtstoffer." },
        { navn: "glyceraldehyd", sys: "2,3-dihydroxypropanal", niv: 2, info: "Glyceraldehyd er et af de mindste sukkerstoffer." },
        { navn: "pyrodruesyre", sys: "2-oxopropansyre", niv: 2, info: "Pyrodruesyre dannes, når kroppen nedbryder glucose." },
        { navn: "dihydroxyacetone", sys: "1,3-dihydroxypropan-2-on", niv: 2, info: "Dihydroxyacetone er det aktive stof i selvbruner." },
        { navn: "alanin", sys: "2-aminopropansyre", niv: 2, info: "Alanin er en aminosyre i proteiner." },
        { navn: "ethyl-2-hydroxypropanoat", sys: "ethyl-2-hydroxypropanoat", niv: 2, info: "Ethyl-2-hydroxypropanoat er lavet af mælkesyre og ethanol." },
        { navn: "4-aminobutansyre", sys: "4-aminobutansyre", niv: 2, info: "4-aminobutansyre er et signalstof i hjernen." },

        { navn: "æblesyre", sys: "2-hydroxybutandisyre", niv: 3, info: "Æblesyre findes i æbler." },
        { navn: "vinsyre", sys: "2,3-dihydroxybutandisyre", niv: 3, info: "Vinsyre findes i druer og vin." },
        { navn: "citronsyre", sys: "2-hydroxypropan-1,2,3-tricarboxylsyre", niv: 3, info: "Citronsyre giver citroner den sure smag." },
        { navn: "serin", sys: "2-amino-3-hydroxypropansyre", niv: 3, info: "Serin er en aminosyre i proteiner." },
        { navn: "ethyl-3-oxobutanoat", sys: "ethyl-3-oxobutanoat", niv: 3, info: "Ethyl-3-oxobutanoat dufter af frugt." },
        { navn: "acetylsalicylsyre", sys: "acetylsalicylsyre", niv: 3, info: "Acetylsalicylsyre er det virksomme stof i hovedpinepiller." }
    ];

    /* Vaerktoejerne paa fane 2. klasser: de stofklasser, der bruger vaerktoejet */
    D.VAERKTOEJ = [
        { id: "tegn", tekst: "Kæde", titel: "Træk fra et atom, eller klik på et atom: kæden vokser med ét carbonatom", klasser: null },
        { id: "gruppe:OH", tekst: "−OH", titel: "Klik på et carbonatom for at sætte en OH-gruppe på", klasser: ["alkohol", "carboxylsyre", "ester"] },
        { id: "gruppe:O", tekst: "=O", titel: "Klik på et carbonatom for at sætte et oxygenatom på med en dobbeltbinding", klasser: ["aldehyd", "keton", "carboxylsyre", "ester"] },
        { id: "gruppe:NH2", tekst: "−NH₂", titel: "Klik på et carbonatom for at sætte en aminogruppe på", klasser: ["amin"] }
    ];

    /* Rosen, naar alle opgaver paa en fane er loest (kommer efter forklaringen) */
    D.FAERDIG = {
        n: "Du har givet alle stofferne navn.",
        t: "Du har tegnet alle stofferne.",
        g: "Du har fundet grupperne i alle stofferne."
    };

    NK.Data = D;
}());

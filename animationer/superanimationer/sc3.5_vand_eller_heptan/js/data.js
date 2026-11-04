/* =====================================================================
   data.js - stofferne, deres strukturformler og replikkerne

   Hvert stof har sin strukturformel tegnet som tekst (mol): bogstaverne
   er atomerne, og tegnene mellem dem er bindingerne. To tegn i hver
   retning er én bindingslaengde.
       -  enkeltbinding vandret        =  dobbeltbinding vandret
       |  enkeltbinding lodret         "  dobbeltbinding lodret
       /  \  enkeltbinding paa skraa
   js/molekyle.js laeser tegningen, finder de polaere grupper og tegner
   formlen, som bogen gor: alle atomer og alle bindinger.

   blandes: det oploesningsmiddel, stoffet blandes med ved stuetemperatur
   i et reagensglas (1 mL eller en spatelspids i 5 mL). Kilderne staar i
   README.md. Stofferne er valgt, saa svaret er entydigt: ingen stoffer
   paa graensen (ethanol, propanol, butanol), dem har sc4.2 (den gamle 6.5).

   rho: massefylde i g/mL (Databogen). Den afgoer, hvilket lag der
   ligger oeverst. tint: farven i glasset [r, g, b, alfa] mod de hvide
   fliser; alle vaeskerne er farveloese og har kun et svagt skaer.
   korn: farven paa krystallerne i et fast stof.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    var KLAR_VAND = [110, 165, 215, 0.16];
    var KLAR_OLIE = [205, 188, 128, 0.15];
    var KLAR_POLAER = [140, 172, 206, 0.17];

    D.STOFFER = {
        vand: {
            navn: "vand", etiket: "vand", formel: "H2O", sum: "H2O",
            tilstand: "vaeske", rho: 0.998, blandes: "vand", tint: KLAR_VAND, skraa: 1,
            mol: [
                "  O  ",
                " / \\ ",
                "H   H"
            ],
            hvorfor: "Vand er selv et polært molekyle."
        },
        heptan: {
            navn: "heptan", etiket: "heptan", formel: "C7H16", sum: "C7H16",
            tilstand: "vaeske", rho: 0.684, blandes: "heptan", tint: [215, 195, 120, 0.14],
            mol: [
                "  H H H H H H H  ",
                "  | | | | | | |  ",
                "H-C-C-C-C-C-C-C-H",
                "  | | | | | | |  ",
                "  H H H H H H H  "
            ],
            hvorfor: "Kun C og H. Molekylet er upolært."
        },
        glycerol: {
            navn: "glycerol", andet: "propan-1,2,3-triol", etiket: "glycerol", formel: "C3H5(OH)3", sum: "C3H8O3",
            tilstand: "vaeske", rho: 1.261, blandes: "vand", tint: [150, 176, 204, 0.22],
            mol: [
                "  H H H  ",
                "  | | |  ",
                "H-C-C-C-H",
                "  | | |  ",
                "  O O O  ",
                "  | | |  ",
                "  H H H  "
            ],
            hvorfor: "Tre OH-grupper til tre C-atomer."
        },
        hexanol: {
            navn: "hexan-1-ol", etiket: "hexan-1-ol", formel: "C6H13OH", sum: "C6H14O",
            tilstand: "vaeske", rho: 0.814, blandes: "heptan", tint: KLAR_OLIE,
            mol: [
                "  H H H H H H    ",
                "  | | | | | |    ",
                "H-C-C-C-C-C-C-O-H",
                "  | | | | | |    ",
                "  H H H H H H    "
            ],
            hvorfor: "Én OH-gruppe til seks C-atomer. Carbonkæden vinder."
        },
        glucose: {
            navn: "glucose", andet: "druesukker", etiket: "glucose", formel: "C6H12O6", sum: "C6H12O6",
            tilstand: "fast", blandes: "vand", korn: "#f4f6f8",
            mol: [
                "  O H H H H H  ",
                "  \" | | | | |  ",
                "H-C-C-C-C-C-C-H",
                "    | | | | |  ",
                "    O O O O O  ",
                "    | | | | |  ",
                "    H H H H H  "
            ],
            hvorfor: "Seks polære grupper til seks C-atomer."
        },
        urinstof: {
            navn: "urinstof", andet: "urea", etiket: "urinstof", formel: "CO(NH2)2", sum: "CH4N2O",
            tilstand: "fast", blandes: "vand", korn: "#f7f8fa",
            mol: [
                "    O    ",
                "    \"    ",
                "H-N-C-N-H",
                "  |   |  ",
                "  H   H  "
            ],
            hvorfor: "Tre polære grupper og kun ét C-atom."
        },
        citronsyre: {
            navn: "citronsyre", etiket: "citronsyre", formel: "C6H8O7", sum: "C6H8O7",
            tilstand: "fast", blandes: "vand", korn: "#f2f4f6",
            mol: [
                "        H        ",
                "        |        ",
                "    O H O H O    ",
                "    \" | | | \"    ",
                "H-O-C-C-C-C-C-O-H",
                "      | | |      ",
                "      H C H      ",
                "        \"\\       ",
                "        O O-H    "
            ],
            hvorfor: "Tre COOH-grupper og en OH-gruppe til seks C-atomer."
        },
        iod: {
            navn: "iod", etiket: "iod", formel: "I2", sum: "I2",
            tilstand: "fast", blandes: "heptan", korn: "#3b3046", farveI: { heptan: [138, 42, 150], vand: [176, 122, 48] },
            obs: { vand: "opløses næsten ikke" },
            mol: ["I-I"],
            hvorfor: "To ens atomer. Bindingen er upolær, og der er ingen polære grupper."
        },

        /* ----- Kun paa fane 2 ------------------------------------------- */
        methanol: {
            navn: "methanol", etiket: "methanol", formel: "CH3OH", sum: "CH4O",
            tilstand: "vaeske", rho: 0.792, blandes: "vand", tint: KLAR_POLAER,
            mol: [
                "  H    ",
                "  |    ",
                "H-C-O-H",
                "  |    ",
                "  H    "
            ],
            hvorfor: "Én OH-gruppe til ét C-atom."
        },
        methansyre: {
            navn: "methansyre", andet: "myresyre", etiket: "methansyre", formel: "HCOOH", sum: "CH2O2",
            tilstand: "vaeske", rho: 1.22, blandes: "vand", tint: KLAR_POLAER,
            mol: [
                "  O    ",
                "  \"    ",
                "H-C-O-H"
            ],
            hvorfor: "Hele molekylet er en COOH-gruppe."
        },
        ethandiol: {
            navn: "ethan-1,2-diol", andet: "glykol", etiket: "glykol", formel: "C2H4(OH)2", sum: "C2H6O2",
            tilstand: "vaeske", rho: 1.113, blandes: "vand", tint: KLAR_POLAER,
            mol: [
                "  H H  ",
                "  | |  ",
                "H-C-C-H",
                "  | |  ",
                "  O O  ",
                "  | |  ",
                "  H H  "
            ],
            hvorfor: "To OH-grupper til to C-atomer."
        },
        pentanol: {
            navn: "pentan-1-ol", etiket: "pentan-1-ol", formel: "C5H11OH", sum: "C5H12O",
            tilstand: "vaeske", rho: 0.815, blandes: "heptan", tint: KLAR_OLIE,
            mol: [
                "  H H H H H    ",
                "  | | | | |    ",
                "H-C-C-C-C-C-O-H",
                "  | | | | |    ",
                "  H H H H H    "
            ],
            hvorfor: "Én OH-gruppe kan ikke holde fem C-atomer i vandet."
        },
        octanol: {
            navn: "octan-1-ol", etiket: "octan-1-ol", formel: "C8H17OH", sum: "C8H18O",
            tilstand: "vaeske", rho: 0.826, blandes: "heptan", tint: KLAR_OLIE,
            mol: [
                "  H H H H H H H H    ",
                "  | | | | | | | |    ",
                "H-C-C-C-C-C-C-C-C-O-H",
                "  | | | | | | | |    ",
                "  H H H H H H H H    "
            ],
            hvorfor: "Én OH-gruppe til otte C-atomer. Carbonkæden vinder klart."
        },
        hexansyre: {
            navn: "hexansyre", etiket: "hexansyre", formel: "C5H11COOH", sum: "C6H12O2",
            tilstand: "vaeske", rho: 0.929, blandes: "heptan", tint: KLAR_OLIE,
            mol: [
                "  H H H H H O    ",
                "  | | | | | \"    ",
                "H-C-C-C-C-C-C-O-H",
                "  | | | | |      ",
                "  H H H H H      "
            ],
            hvorfor: "COOH-gruppen er polær, men seks C-atomer vinder."
        }
    };

    Object.keys(D.STOFFER).forEach(function (id) { D.STOFFER[id].id = id; });

    D.stof = function (id) { return D.STOFFER[id] || null; };

    /* Fane 1: stofferne fra den gamle c3.5 (uden sorbinsyre) plus iod.
       Vand og heptan er oploesningsmidlerne i glassene og tilsaettes ikke
       (brugerens oenske 22. okt. 2026). */
    D.FORSOEG = ["glycerol", "hexanol", "glucose", "urinstof", "citronsyre", "iod"];

    /* Fane 2: en runde er ti stoffer, fem af hver slags. De nye kommer
       alle med; resten trækkes blandt stofferne fra fane 1. */
    D.GAET_NYE = ["methanol", "methansyre", "ethandiol", "pentanol", "octanol", "hexansyre"];
    D.RUNDE_PR_SLAGS = 5;

    /* De to glas */
    D.OPL = ["vand", "heptan"];
    D.V_OPL = 5;          /* mL oploesningsmiddel i hvert glas */
    D.V_PORTION = 1;      /* mL i en pipette */
    D.MAKS_PORTIONER = 3;

    D.blandbar = function (stofId, oplId) {
        var s = D.stof(stofId);
        return !!s && s.blandes === oplId;
    };

    /* Polaert eller upolaert, som bogen siger det (Kemibogen 3.4): stoffer,
       der ligner hinanden, blandes. Det, der blandes med vand, er polaert. */
    D.polaer = function (stofId) { return D.blandbar(stofId, "vand"); };
    D.polaritet = function (stofId) { return D.polaer(stofId) ? "polært" : "upolært"; };

    D.stort = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
    D.navn = function (stofId) { return D.stof(stofId).navn; };
    D.Navn = function (stofId) { return D.stort(D.stof(stofId).navn); };

    /* Det, forsoeget viste, som én saetning: "Glycerol blandes med vand,
       men ikke med heptan." Faste stoffer opløses; iod naesten ikke i vand. */
    D.obsSaetning = function (stofId) {
        var s = D.stof(stofId), x = s.blandes, y = x === "vand" ? "heptan" : "vand";
        var ikke = s.obs && s.obs[y] && /næsten/.test(s.obs[y]) ? "næsten ikke" : "ikke";
        if (s.tilstand === "fast") return D.Navn(stofId) + " opløses i " + x + ", men " + ikke + " i " + y + ".";
        return D.Navn(stofId) + " blandes med " + x + ", men " + ikke + " med " + y + ".";
    };

    /* ----- Spoergsmaalene paa kortet i scenen ------------------------------
       Brugerens oenske 23. okt. 2026: spoergsmaalene skal staa inde i scenen
       (ikke oppe i hoejre hjoerne), eleven skal selv svare paa flere ting og
       markere polaere grupper, og fane 1 begynder med, at eleven selv siger,
       at vand er polaert. Ordene er Kemibogens (afsnit 3.4).

       D.START: de tre spoergsmaal, der aabner fane 1. kontekst staar i linjen
       under svarknapperne, til der er svaret. */
    D.POL_SVAR = [{ id: "polaert", tekst: "Polært" }, { id: "upolaert", tekst: "Upolært" }];
    D.polId = function (stofId) { return D.polaer(stofId) ? "polaert" : "upolaert"; };

    D.START = [
        {
            id: "vand", kort: "vand", spm: "Er vand polært eller upolært?",
            kontekst: "Oxygen trækker elektronerne til sig. Vandmolekylet får en negativ ende (δ−) og en positiv ende (δ+).",
            svar: D.POL_SVAR, rigtig: "polaert",
            hint: "Et molekyle med en negativ og en positiv ende kaldes polært.",
            ros: "Rigtigt. Vand er polært.",
            fejl: "Nej. Vandmolekylet har en negativ og en positiv ende. Så er det polært."
        },
        {
            id: "heptan", kort: "heptan", spm: "Er heptan polært eller upolært?",
            kontekst: "Heptan består kun af carbon og hydrogen. Molekylet har ingen ladede ender.",
            svar: D.POL_SVAR, rigtig: "upolaert",
            hint: "Et molekyle uden en negativ og en positiv ende kaldes upolært.",
            ros: "Rigtigt. Heptan er upolært.",
            fejl: "Nej. Heptan har ingen ladede ender. Så er det upolært."
        },
        {
            id: "regel", kort: "begge", spm: "Hvad blandes et polært stof med?",
            kontekst: "Stoffer, der ligner hinanden, blandes med hinanden.",
            svar: [{ id: "vand", tekst: "Vand" }, { id: "heptan", tekst: "Heptan" }], rigtig: "vand",
            hint: "Vand er polært, og heptan er upolært. Hvilken af dem ligner et polært stof?",
            ros: "Rigtigt. Et polært stof blandes med vand, og et upolært stof blandes med heptan.",
            fejl: "Nej. Et polært stof ligner det polære vand. Derfor blandes det med vand."
        }
    ];

    /* Fane 1, for hvert stof: test, polaert eller upolaert, polaere grupper */
    D.F1 = {
        test: function (id) { return "Test " + D.navn(id) + " i begge glas."; },
        pol: function (id) { return "Er " + D.navn(id) + " polært eller upolært?"; },
        polHint: "Vand er polært, og heptan er upolært. Stoffer, der ligner hinanden, blandes med hinanden.",
        polFejl: function (id) {
            var s = D.stof(id), verbum = s.tilstand === "fast" ? "opløses i" : "blandes med";
            return D.polaer(id) ? "Nej. " + D.Navn(id) + " " + verbum + " vand og ligner derfor det polære vand."
                                : "Nej. " + D.Navn(id) + " " + verbum + " heptan og ligner derfor den upolære heptan.";
        },
        polRos: function (id) { return "Rigtigt. " + D.Navn(id) + " er " + D.polaritet(id) + "."; },
        grp: function (id) { return "Klik på de polære grupper i " + D.navn(id) + "."; },
        grpHint: "Polære grupper har O eller N: OH, COOH, C=O og NH₂. C og H hører til den upolære carbonkæde.",
        grpRos: function (id) { return "Rigtigt. " + D.stof(id).hvorfor; },
        ingen: "Ingen polære grupper",
        ingenFejl: function (id) { return "Nej. Der er polære grupper i " + D.navn(id) + ". Kig efter O og N."; },
        fundet: function (n) { return n === 0 ? "Klik på en polær gruppe i formlen." : (n === 1 ? "Fundet: 1 polær gruppe." : "Fundet: " + n + " polære grupper."); },
        fuldt: "Skemaet er fuldt.",
        fuldtLinje: "Alle seks stoffer er testet. På fane 2 gætter du, før du tester."
    };

    /* Det, man ser i glasset, naar det har staaet efter rystningen */
    D.iagttagelse = function (stofId, oplId) {
        var s = D.stof(stofId);
        if (s.obs && s.obs[oplId]) return s.obs[oplId];
        var b = D.blandbar(stofId, oplId);
        if (s.tilstand === "fast") return b ? "opløst" : "opløses ikke";
        return b ? "ét lag" : "to lag";
    };

    /* ----- Kemichael ----------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; tingene paa laerredet er de usynlige .anker fra
       rundvisningen). Ingen vittigheder i praesentationen. */
    D.INTRO_FORSOEG = [
        { tekst: "I denne fane undersøger du, om seks stoffer blandes med vand eller med heptan. Glasset med vand og glasset med heptan står i stativet, og mærket over hvert glas viser, om væsken er polær eller upolær.",
          sel: "#forsoeg-anker-glas" },
        { tekst: "Du trækker pipetten eller spatlen med stoffet ned i et af glassene og klikker på glasset for at ryste det. Når indholdet i glasset har lagt sig, står iagttagelsen ved glasset og i skemaet til højre.",
          sel: ["#forsoeg-anker-proeve", "#forsoeg-skema"] },
        { tekst: "Kortet med stoffets formel stiller spørgsmålene, og til sidst klikker du på de polære grupper i formlen. Den gule knap på kortet giver et hint og derefter svaret.",
          sel: "#forsoeg-anker-kort" }
    ];
    D.INTRO_GAET = [
        { tekst: "I denne fane gætter du, om et stof er polært eller upolært, før forsøget viser svaret. Først klikker du på de polære grupper i formlen, og søjlen på kortet tæller C-atomerne og de polære grupper.",
          sel: "#gaet-anker-kort" },
        { tekst: "Derefter svarer du polært eller upolært og tester svaret ved at trække pipetten ned i det glas, som svaret passer til. Forsøget i glasset afgør, om svaret var rigtigt.",
          sel: ["#gaet-anker-proeve", "#gaet-anker-glas"] },
        { tekst: "En runde består af ti stoffer, og panelet til højre viser dine rigtige svar, din rekord og de sorterede stoffer. Den gule knap på kortet giver et hint og derefter svaret.",
          sel: ["#gaet-tb", "#gaet-runde", "#gaet-sorteret"] }
    ];

    /* Han kommer kun ind af sig selv, naar en hel fane er klaret, eller ved
       paaskeaegget (brugerens regel 4. nov. 2026). Fane 2: én gang pr.
       besoeg, naar en runde er slut med mindst RUNDE_GOD rigtige. */
    D.SKEMA_FULDT = "Du har udført alle tolv forsøg uden at knuse et eneste glas. Det skriver jeg ned.";
    D.RYST_FOR_MEGET = {
        blandes: "Glassets indhold er allerede blandet. Det bliver ikke mere blandet af, at du ryster glasset igen.",
        ikke: "Stofferne i glasset blandes ikke, uanset hvor meget du ryster glasset. Det har jeg selv prøvet."
    };
    D.RUNDE_GOD = 8;
    D.RUNDE_ALLE = 10;
    D.RUNDE_REPLIK = "Du har gættet rigtigt på de fleste stoffer, så forsøget havde ikke meget at tilføje.";
    D.RUNDE_ALLE_REPLIK = "Du har ti rigtige ud af ti. Glassene kunne være blevet stående i skabet.";
    D.REKORD_REPLIK = "Det er en ny rekord. Den skriver jeg ikke på tavlen.";

    NK.Data = D;
}());

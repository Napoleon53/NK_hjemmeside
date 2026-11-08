/* =====================================================================
   data.js - stofferne, opgaverne og de faste tekster

   Her kan man rette uden at roere koden:
     STOFFER    fane 1: de ti stoffer. Navnet er IUPAC-navnet, som motoren
                bygger molekylet af; vist er det navn, eleven ser
     TEST       teksterne til de to test (svarene paa kortet og glassene)
     REAKTIONER fane 2: de tre opgaver, to med DNPH og én med Tollens' reagens
     FLASKER    fane 3: de seks stoffer fra brugerens journal 25 (Basiskemi B,
                Xperimentér 25) og det, de indeholder

   Om et stof reagerer, staar IKKE her. Det regner modellen (js/kemi.js) ud
   af molekylet: DNPH kraever en carbonylgruppe i et aldehyd eller en keton,
   og Tollens' reagens kraever desuden et hydrogenatom paa carbonylgruppens
   carbonatom. Selvtesten tjekker, at modellen og motorens stofklasse er enige.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.NIVEAUER = ["Let", "Middel", "Svær"];

    /* Stofklasserne har samme farver som i sb4.8 og sb4.3.
       farve: paa de moerke kort. blaek: paa det hvide whiteboard */
    D.KLASSER = {
        aldehyd: { navn: "aldehyd", ental: "et aldehyd", farve: "#f0a35a", blaek: "#c2570c" },
        keton: { navn: "keton", ental: "en keton", farve: "#b9a0f5", blaek: "#7046cf" },
        alkohol: { navn: "alkohol", ental: "en alkohol", farve: "#3fc7d1", blaek: "#0b8791" },
        carboxylsyre: { navn: "carboxylsyre", ental: "en carboxylsyre", farve: "#f58a7e", blaek: "#cf3327" },
        ester: { navn: "ester", ental: "en ester", farve: "#8fd17a", blaek: "#3f8f2a" }
    };
    D.KLASSE_ORDEN = ["aldehyd", "keton", "alkohol", "carboxylsyre", "ester"];

    /* ----- Fane 1: Hvad viser testene? ----------------------------------------
       De forkerte stoffer er dem, elever tager fejl af: en alkohol uden C=O og
       en carboxylsyre og en ester, der har C=O, men ingen carbonylgruppe i et
       aldehyd eller en keton. Vanillin er med fra den gamle animation */
    D.STOFFER = [
        { navn: "ethanal", niv: 1 },
        { navn: "propanon", niv: 1 },
        { navn: "ethanol", niv: 1 },
        { navn: "propanal", niv: 2 },
        { navn: "butanon", niv: 2 },
        { navn: "ethansyre", niv: 2 },
        { navn: "benzaldehyd", niv: 2 },
        { navn: "ethylethanoat", niv: 3 },
        { navn: "pentan-3-on", niv: 3 },
        { navn: "4-hydroxy-3-methoxybenzaldehyd", vist: "vanillin", niv: 3 }
    ];

    /* ----- De to test -----------------------------------------------------------
       De tre svar staar i samme raekkefoelge ved begge test, saa eleven skal
       vide, hvilken test der giver hvad (det er en fejl, elever laver) */
    D.TEST = {
        dnph: { navn: "Test med DNPH", kort: "DNPH", glas: "DNPH" },
        tollens: { navn: "Tollens' test", kort: "Tollens' test", glas: "Tollens' test" }
    };
    D.SVAR = [
        { id: "bundfald", t: "Gult eller orange bundfald" },
        { id: "spejl", t: "Sølvspejl" },
        { id: "ingen", t: "Ingen ændring" }
    ];

    /* Farverne i glassene (sprites/ viser dem hver for sig) */
    D.GLASFARVE = {
        dnph: "#f4c86c",                    /* DNPH-opløsningen: klar, gul-orange */
        tollens: "#eef2f6",                 /* Tollens' reagens: klar og farveløs */
        bundfald: { gul: "#e8a020", orange: "#d9661a" },
        sky: { gul: "#efb446", orange: "#e58a3a" },
        vand: "#9fd0f0"                     /* vandbadet */
    };

    /* ----- Fane 2: Reaktionerne -------------------------------------------------
       DNPH: kondensationen, hvor C=O bliver til C=N, og vand fraspaltes.
       Tollens: aldehydet oxideres til carboxylat-ionen, og Ag⁺ bliver til Ag.
       Brugeren 7. nov. 2026: DNPH to gange og kun én afstemning, for
       afstemningen er den samme for alle aldehyder.
       ekstra: det sidste spoergsmaal */
    D.REAKTIONER = [
        { id: "dnph-ethanal", slags: "dnph", stof: "ethanal", ekstra: "kondensation" },
        { id: "dnph-propanon", slags: "dnph", stof: "propanon", ekstra: "binding" },
        { id: "tollens-ethanal", slags: "tollens", stof: "ethanal", ekstra: "ammoniak" }
    ];

    /* Det ekstra spoergsmaal: svarene og det rigtige (svar) */
    D.EKSTRA = {
        kondensation: {
            spm: "Ethanal og DNPH går sammen til ét molekyle, og der fraspaltes vand. Hvad hedder sådan en reaktion?",
            svar: ["Kondensation", "Addition", "Substitution", "Oxidation"], rigtig: 0,
            forkert: [null,
                "Ved en addition fraspaltes der intet. Ved reaktionen med DNPH bliver vand til overs.",
                "Ved en substitution bytter to atomer plads. Ethanal og DNPH går sammen, og vand fraspaltes.",
                "Carbonatomets oxidationstal ændrer sig ikke: C=O er blevet til C=N, to bindinger til et mere elektronegativt atom."],
            forklaring: "Det er en kondensation, som når en ester dannes. Produktet er tungtopløseligt og falder ud som et gult bundfald.",
            hint: ["To molekyler bliver til ét større, og et lille molekyle fraspaltes. Det kender du fra estere i afsnit B4.5."]
        },
        binding: {
            spm: "Carbonatomet i propanon havde en dobbeltbinding til oxygen. Hvilken binding har det nu til nitrogen?",
            svar: ["Enkeltbinding", "Dobbeltbinding", "Tripelbinding"], rigtig: 1,
            forkert: ["Tæl stregerne mellem C og N på tavlen. Oxygenatomet tog to bindinger med sig, og nitrogen giver to nye.",
                null,
                "Tæl stregerne mellem C og N på tavlen. Carbonatomet har stadig kun fire bindinger i alt."],
            forklaring: "C=O er blevet til C=N. Nitrogenatomet har mistet to hydrogenatomer og kan derfor danne to bindinger til carbonatomet.",
            hint: ["Se på stregerne mellem carbonatomet og nitrogenatomet på tavlen."]
        },
        ammoniak: {
            spm: "Tollens' reagens indeholder også ammoniak. Hvad gør ammoniakken?",
            svar: ["Holder Ag⁺ opløst", "Gør opløsningen sur", "Oxiderer aldehydet", "Danner sølvspejlet"], rigtig: 0,
            forkert: [null,
                "Ammoniak er en base, så den gør ikke opløsningen sur.",
                "Det er Ag⁺, der oxiderer aldehydet. Ammoniak står ikke i reaktionsskemaet.",
                "Spejlet er frit sølv, Ag, som dannes af Ag⁺. Ammoniak står ikke i reaktionsskemaet."],
            forklaring: "Ammoniakken holder sølv(I)ionerne opløst. Uden ammoniak ville de danne et tungtopløseligt bundfald i den basiske opløsning.",
            hint: ["Ammoniak står ikke i skemaet. Hvad ville der ske med Ag⁺ i en basisk opløsning uden ammoniak?"]
        }
    };

    /* Koefficienterne paa fane 2 vaelges blandt disse */
    D.KOEF_VALG = [1, 2, 3, 4];
    D.OXTAL = [-3, -2, -1, 0, 1, 2, 3];
    var ROM = ["0", "I", "II", "III", "IV", "V", "VI", "VII"];
    D.rom = function (n) {
        if (n === 0) return "0";
        return (n > 0 ? "+" : "−") + ROM[Math.abs(n)];
    };
    D.fortegn = function (n) { return n === 0 ? "0" : (n > 0 ? "+" : "−") + Math.abs(n); };

    /* Farverne paa tavlen som i C-bogens afstemningsfigurer: oxidationen
       orange, reduktionen blaa, koefficienterne groenblaa */
    D.AFSTEM_FARVE = { ox: "#b8560f", red: "#2a5fd6", koef: "#0f766e" };

    /* ----- Fane 3: De ukendte stoffer (brugerens journal 25) --------------------
       indhold: [stof, maengde]. "meget" er stoffet selv eller det, der er mest
       af; "lidt" er under 1 %. Husholdningssprit er ethanol (93 %), der er gjort
       udrikkelig med butanon og propan-2-ol (hver under 1 % ifoelge
       sikkerhedsdatabladet for dansk husholdningssprit). Vanillin afloeser
       journalens mandelessens (brugeren 7. nov. 2026): det giver samme
       resultater som benzaldehyd, og derfor kan eleven ikke skille dem ad */
    D.FLASKER = [
        { id: "ethanal", navn: "ethanal", indhold: [["ethanal", "meget"]] },
        { id: "propanon", navn: "propanon", indhold: [["propanon", "meget"]] },
        { id: "benzaldehyd", navn: "benzaldehyd", indhold: [["benzaldehyd", "meget"]] },
        { id: "ethansyre", navn: "ethansyre", indhold: [["ethansyre", "meget"]] },
        { id: "vanillin", navn: "vanillin", om: "aromastof i vanilje", indhold: [["4-hydroxy-3-methoxybenzaldehyd", "meget"]] },
        { id: "sprit", navn: "husholdningssprit", om: "mest ethanol", indhold: [["ethanol", "meget"], ["butanon", "lidt"], ["propan-2-ol", "lidt"]] }
    ];
    D.BOGSTAVER = ["A", "B", "C", "D", "E", "F"];

    /* Stofklassen, testene viser (rutediagrammet, bogens figur b4-test-rute,
       staar i teorien) */
    D.RUTE_SVAR = [
        { id: "aldehyd", t: "Et aldehyd" },
        { id: "keton", t: "En keton" },
        { id: "ingen", t: "Hverken aldehyd eller keton" }
    ];

    D.FORSOEG_TRIN = [
        { id: "forsoeg", navn: "Forsøget" },
        { id: "klasse", navn: "Hvad viser testene?" },
        { id: "find", navn: "Hvilke stoffer?" }
    ];

    D.FAERDIG = {
        t: "Alle ti opgaver er løst.",
        r: "Alle tre opgaver med reaktionerne er løst.",
        u: "Alle seks flasker er undersøgt."
    };

    D.TAL = ["ingen", "ét", "to", "tre", "fire"];
    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

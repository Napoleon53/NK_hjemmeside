/* =====================================================================
   data.js - sukkerstofferne, opgaverne og teksterne

   Alt, der kan staa som data, staar her. Ordene og tallene er Kemibogens
   (afsnit B7.2 Ringslutning): fischerprojektion, haworthformel, α-glucose
   (OH-gruppen paa carbonatom 1 peger ned), β-glucose (peger op), ringen
   med seks atomer i glucose og fem i fructose, og ligevaegten med omkring
   36 % α-glucose, 64 % β-glucose og under 0,1 % aabne kaeder.

   Et sukker har sider: for hvert carbonatom med en OH-gruppe og et H,
   om OH-gruppen staar til hoejre ("H") eller venstre ("V") i
   fischerprojektionen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.SUKKER = {
        glucose:   { navn: "glucose",   keto: false, sider: { 2: "H", 3: "V", 4: "H", 5: "H" } },
        galactose: { navn: "galactose", keto: false, sider: { 2: "H", 3: "V", 4: "V", 5: "H" } },
        mannose:   { navn: "mannose",   keto: false, sider: { 2: "V", 3: "V", 4: "H", 5: "H" } },
        allose:    { navn: "allose",    keto: false, sider: { 2: "H", 3: "H", 4: "H", 5: "H" } },
        fructose:  { navn: "fructose",  keto: true,  sider: { 3: "V", 4: "H", 5: "H" } }
    };

    /* Ligevaegten i vand (bogens tal) */
    D.ANDEL_ALFA = 0.36;
    D.ANDEL_BETA = 0.64;
    D.ANTAL = 100;

    /* =====================================================================
       Fane 1: Ringen lukker sig. To opgaver med tre trin.
         ilt     eleven klikker paa det oxygenatom, der lukker ringen
         spm     et spoergsmaal paa kortet. Har trinnet et forsoeg, kommer
                 det foerst (en knap), og har det et traek, skal eleven
                 bagefter selv traekke oxygenatomet hen og lukke ringen
       ===================================================================== */
    D.RING = [
        {
            sukker: "glucose", navn: "Glucose",
            trin: [
                {
                    id: "ilt", slags: "ilt", navn: "Find oxygenatomet",
                    tekst: "Glucose lukker sig til en ring med seks atomer. Hvilket oxygenatom binder sig til carbonatom 1? Klik på det, og tryk Indsend svar.",
                    rigtig: "O5",
                    hint: ["Ringen har fem carbonatomer og ét oxygenatom.",
                           "Tæl fem carbonatomer fra carbonatom 1. Oxygenatomet sidder på det sidste af dem."],
                    fejl: {
                        O1: "Oxygenatomet i aldehydgruppen sidder allerede på carbonatom 1. Find en OH-gruppe længere nede i kæden.",
                        O2: "Med oxygenatomet på carbonatom 2 får ringen kun tre atomer.",
                        O3: "Med oxygenatomet på carbonatom 3 får ringen kun fire atomer.",
                        O4: "Med oxygenatomet på carbonatom 4 får ringen fem atomer. Ringen i glucose har seks.",
                        C6: "Med oxygenatomet på carbonatom 6 får ringen syv atomer. Ringen i glucose har seks."
                    },
                    forkl: "Oxygenatomet på carbonatom 5 binder sig til carbonatom 1. Ringen får fem carbonatomer og ét oxygenatom."
                },
                {
                    id: "luk", slags: "spm", navn: "Luk ringen",
                    forsoeg: { tekst: "Først lægges kæden på siden, så carbonatom 1 kommer yderst til højre. Tryk på knappen.",
                               knap: "Læg kæden på siden", forloeb: "vip" },
                    traek: { tekst: "Det, der pegede til højre, peger nu ned. Træk det orange oxygenatom hen til carbonatom 1, så ringen lukker sig." },
                    tekst: "Hvor er hydrogenatomet fra OH-gruppen på carbonatom 5 blevet af?",
                    om: [["H5"]],
                    svar: ["Det sidder i OH-gruppen på carbonatom 1", "Det er gået af som en del af vand", "Det sidder stadig på oxygenatomet i ringen"], rigtig: 0,
                    fejl: { 1: "Der bliver ikke fraspaltet vand. Find det orange H på tavlen.",
                            2: "Oxygenatomet i ringen er bundet til to carbonatomer og har ikke noget hydrogenatom." },
                    hint: ["Find det orange H på tavlen.",
                           "Hydrogenatomet er flyttet over til oxygenatomet fra aldehydgruppen. Der fraspaltes ikke vand."],
                    forkl: "Aldehydgruppens oxygenatom har fået hydrogenatomet, og der fraspaltes ikke vand. Ringen og kæden har samme molekylformel, C₆H₁₂O₆."
                },
                {
                    id: "alfa", slags: "spm", navn: "α eller β",
                    tekst: "Se på den nye OH-gruppe på carbonatom 1. Hvilken form af glucose er ringen på tavlen?",
                    om: [["O1", "H5"]],
                    svar: ["α-glucose", "β-glucose", "Den åbne kæde"], rigtig: 0,
                    fejl: { 1: "I β-glucose peger OH-gruppen på carbonatom 1 op. På tavlen peger den ned.",
                            2: "Kæden er lukket til en ring, og aldehydgruppen er blevet til en OH-gruppe." },
                    hint: ["Se, om OH-gruppen på carbonatom 1 peger op eller ned.",
                           "I α-glucose peger OH-gruppen på carbonatom 1 ned, og i β-glucose peger den op."],
                    forkl: "OH-gruppen på carbonatom 1 peger ned, så ringen er α-glucose. Glucose kan også lukke sig, så OH-gruppen peger op. Det er β-glucose.",
                    navnEfter: "α-glucose"
                }
            ]
        },
        {
            sukker: "fructose", navn: "Fructose",
            trin: [
                {
                    id: "ilt", slags: "ilt", navn: "Find oxygenatomet",
                    tekst: "Fructose har carbonylgruppen på carbonatom 2 og lukker sig til en ring med fem atomer. Klik på det oxygenatom, der binder sig til carbonatom 2.",
                    rigtig: "O5",
                    hint: ["Ringen har fire carbonatomer og ét oxygenatom.",
                           "Tæl fire carbonatomer fra carbonatom 2. Oxygenatomet sidder på det sidste af dem."],
                    fejl: {
                        O2: "Oxygenatomet i carbonylgruppen sidder allerede på carbonatom 2. Find en OH-gruppe længere nede i kæden.",
                        C1: "Med oxygenatomet på carbonatom 1 får ringen kun tre atomer.",
                        O3: "Med oxygenatomet på carbonatom 3 får ringen kun tre atomer.",
                        O4: "Med oxygenatomet på carbonatom 4 får ringen kun fire atomer.",
                        C6: "Med oxygenatomet på carbonatom 6 får ringen seks atomer. Ringen skal have fem."
                    },
                    forkl: "Oxygenatomet på carbonatom 5 binder sig til carbonatom 2. Ringen får fire carbonatomer og ét oxygenatom."
                },
                {
                    id: "luk", slags: "spm", navn: "Luk ringen",
                    forsoeg: { tekst: "Først lægges kæden på siden, så carbonatom 1 og carbonatom 2 kommer yderst til højre. Tryk på knappen.",
                               knap: "Læg kæden på siden", forloeb: "vip" },
                    traek: { tekst: "Træk det orange oxygenatom hen til carbonatom 2, så ringen lukker sig." },
                    tekst: "Hvilke carbonatomer sidder uden for ringen?",
                    om: [["C1"], ["C6"]],
                    svar: ["Carbonatom 1 og carbonatom 6", "Kun carbonatom 6", "Carbonatom 2 og carbonatom 5"], rigtig: 0,
                    fejl: { 1: "Se på carbonatom 2 yderst til højre i ringen. CH₂OH-gruppen på carbonatom 2 er carbonatom 1.",
                            2: "Carbonatom 2 og carbonatom 5 er bundet til ringens oxygenatom og sidder i ringen." },
                    hint: ["Find de to CH₂OH-grupper på tavlen.",
                           "Carbonatom 1 og carbonatom 6 er begge CH₂OH-grupper uden for ringen."],
                    forkl: "Carbonatom 1 og carbonatom 6 sidder uden for ringen som CH₂OH-grupper. Ringen har kun fem atomer."
                },
                {
                    id: "alfa", slags: "spm", navn: "α eller β",
                    tekst: "Se på den nye OH-gruppe på carbonatom 2. Hvilken form af fructose er ringen på tavlen?",
                    om: [["O2", "H5"]],
                    svar: ["α-fructose", "β-fructose", "Den åbne kæde"], rigtig: 0,
                    fejl: { 1: "I β-fructose peger OH-gruppen på carbonatom 2 op. På tavlen peger den ned.",
                            2: "Kæden er lukket til en ring, og carbonylgruppen er blevet til en OH-gruppe." },
                    hint: ["Se, om OH-gruppen på carbonatom 2 peger op eller ned.",
                           "Reglen er den samme som for glucose. Peger OH-gruppen ned, er det α-formen."],
                    forkl: "OH-gruppen på carbonatom 2 peger ned, så ringen er α-fructose. Fructose kan også lukke sig til β-fructose.",
                    navnEfter: "α-fructose"
                }
            ]
        }
    ];
    D.RING_FAERDIG = "Begge sukkerstoffer er lukket til ringe.";

    /* =====================================================================
       Fane 2: Fra fischer til haworth
         numre   nummerér carbonatomerne i en haworthformel
         ring    saet OH-grupperne paa ringen ud fra fischerprojektionen
                 (form: "alfa" eller "beta")
         kaede   omvendt: saet OH-grupperne i fischerprojektionen ud fra ringen
       ===================================================================== */
    D.REGEL_HINT = "En OH-gruppe til højre i fischerprojektionen peger ned i ringen. En OH-gruppe til venstre peger op.";
    D.HAWORTH = [
        {
            slags: "numre", sukker: "glucose", form: "alfa", navn: "Nummerér ringen",
            tekst: "Ringen er α-glucose tegnet som en haworthformel. Klik på carbonatomerne i rækkefølge fra 1 til 6, og tryk Indsend svar.",
            hint: ["Carbonatom 1 sidder yderst til højre ved siden af ringens oxygenatom.",
                   "Numrene går med uret rundt i ringen. Carbonatom 6 er i CH₂OH-gruppen uden for ringen."],
            fejl1: "Carbonatom 1 sidder yderst til højre ved siden af ringens oxygenatom.",
            fejlN: "Numrene går med uret rundt i ringen fra carbonatom 1. Tjek carbonatom {n}.",
            forkl: "Carbonatom 1 sidder yderst til højre, og numrene går med uret rundt i ringen. Carbonatom 6 sidder uden for ringen."
        },
        {
            slags: "ring", sukker: "glucose", form: "beta", navn: "β-glucose",
            tekst: "Fischerprojektionen viser glucose. Tegn β-glucose som haworthformel. Klik over eller under carbonatom 1 til 4, og tryk Indsend svar.",
            hint: [D.REGEL_HINT, "I β-glucose peger OH-gruppen på carbonatom 1 op, til samme side som CH₂OH-gruppen."],
            forkl: "Til højre blev til ned, og til venstre blev til op. OH-gruppen på carbonatom 1 peger op, fordi ringen er β-glucose."
        },
        {
            slags: "ring", sukker: "galactose", form: "alfa", navn: "α-galactose",
            tekst: "Fischerprojektionen viser galactose. Tegn α-galactose som haworthformel. Klik over eller under carbonatom 1 til 4, og tryk Indsend svar.",
            hint: [D.REGEL_HINT, "I α-galactose peger OH-gruppen på carbonatom 1 ned. Galactose er forskellig fra glucose ved carbonatom 4."],
            forkl: "OH-gruppen på carbonatom 4 peger op i galactose og ned i glucose. Resten af ringen er den samme som i α-glucose."
        },
        {
            slags: "ring", sukker: "mannose", form: "beta", navn: "β-mannose",
            tekst: "Fischerprojektionen viser mannose, som ikke står i bogen. Tegn β-mannose som haworthformel. Klik over eller under carbonatom 1 til 4, og tryk Indsend svar.",
            hint: [D.REGEL_HINT, "Mannose har OH-grupperne på carbonatom 2 og carbonatom 3 til venstre, så de peger op."],
            forkl: "Reglen virker for alle sukkerstoffer. I mannose peger OH-grupperne på carbonatom 2 og carbonatom 3 op."
        },
        {
            slags: "kaede", sukker: "allose", form: "beta", navn: "Den anden vej",
            tekst: "Ringen er β-allose. Sæt OH-grupperne i fischerprojektionen, så den viser allose. Klik til venstre eller højre for carbonatomerne.",
            hint: ["En OH-gruppe, der peger ned i ringen, står til højre i fischerprojektionen.",
                   "OH-grupperne på carbonatom 2, 3 og 4 peger ned. CH₂OH peger op, så OH-gruppen på carbonatom 5 står til højre."],
            forkl: "Alle OH-grupperne peger ned i ringen og står derfor til højre i fischerprojektionen. Allose er en D-form."
        }
    ];
    D.HAWORTH_FAERDIG = "Alle fem opgaver er løst.";

    /* =====================================================================
       Fane 3: Ligevaegten. Ét forloeb med syv trin.
       ===================================================================== */
    D.LIGE = [
        {
            id: "gaet1", slags: "gaet", navn: "Gæt",
            tekst: "Krystallerne i en pose druesukker består af α-glucose. Druesukkeret opløses i vand. Hvordan er fordelingen, når opløsningen har stået et par timer?",
            svar: ["Kun α-glucose", "Mest α-glucose", "Mest β-glucose"], rigtig: 2
        },
        {
            id: "oploes", slags: "forsoeg", navn: "Opløs druesukkeret",
            tekst: "Vinduet viser 100 glucosemolekyler i opløsningen. Tryk Opløs druesukkeret, og følg fordelingen ved siden af vinduet.",
            knap: "Opløs druesukkeret"
        },
        {
            id: "dynamisk", slags: "spm", navn: "Dynamisk ligevægt",
            tekst: "Fordelingen ændrer sig ikke mere. Hvad sker der stadig med molekylerne i vinduet?",
            svar: ["Ringe åbner sig og lukker sig igen", "Intet, for reaktionen er stoppet", "α-glucose bliver kun til β-glucose"], rigtig: 0,
            fejl: { 1: "Se på vinduet. Ringe åbner sig stadig og lukker sig igen.",
                    2: "β-glucose bliver også til α-glucose, og derfor ændrer fordelingen sig ikke." },
            hint: ["Hold øje med vinduet et øjeblik.",
                   "Ringene åbner sig og lukker sig lige så ofte den ene vej som den anden vej."],
            forkl: "Ringene åbner sig og lukker sig hele tiden, men lige mange den ene og den anden vej. Det er en dynamisk ligevægt med 36 % α-glucose og 64 % β-glucose."
        },
        {
            id: "kaede", slags: "spm", navn: "Den åbne kæde",
            tekst: "Under 0,1 % af molekylerne er åbne kæder. Hvorfor er den åbne kæde vigtig alligevel?",
            svar: ["Kun kæden har en aldehydgruppe", "Kæden er den mest stabile form", "Kun kæden kan opløses i vand"], rigtig: 0,
            fejl: { 1: "Ringene er de stabile former. Derfor er næsten alle molekylerne ringe.",
                    2: "Ringene har mange OH-grupper og kan også opløses i vand." },
            hint: ["Sammenlign carbonatom 1 i kæden og i ringen.",
                   "I ringen er aldehydgruppen blevet til en OH-gruppe. Kun kæden har en aldehydgruppe."],
            forkl: "Kun den åbne kæde har en aldehydgruppe. En reaktion med aldehydgruppen sker derfor med kæden."
        },
        {
            id: "gaet2", slags: "gaet", navn: "Gæt",
            tekst: "Fehlings væske reagerer med aldehydgruppen i de åbne kæder. Hvor meget af glucosen kan reagere, når der er Fehlings væske nok?",
            svar: ["Under 0,1 %", "Omkring 36 %", "Næsten det hele"], rigtig: 2
        },
        {
            id: "fehling", slags: "forsoeg", navn: "Fehlings væske",
            tekst: "En åben kæde reagerer med Fehlings væske, så snart den dannes. Tryk Tilsæt Fehlings væske, og følg molekylerne i vinduet.",
            knap: "Tilsæt Fehlings væske"
        },
        {
            id: "aabner", slags: "spm", navn: "Ringene åbner sig",
            tekst: "Næsten alle molekylerne har reageret. Hvorfor kunne ringene også nå at reagere?",
            svar: ["Ringene i vand åbner sig hele tiden kortvarigt", "Fehlings væske åbner selv ringene", "Ringene har også en aldehydgruppe"], rigtig: 0,
            fejl: { 1: "Ringene åbner sig af sig selv, også uden Fehlings væske. Fehlings væske reagerer kun med kæderne.",
                    2: "I ringen er aldehydgruppen blevet til en OH-gruppe. Kun kæden kan reagere." },
            hint: ["Tænk på, hvad ringene gjorde i vinduet, før Fehlings væske kom i.",
                   "Ringene i vand åbner sig hele tiden kortvarigt. Hver gang en ring åbner sig, er der en kæde, som kan reagere."],
            forkl: "Ringene i vand åbner sig hele tiden kortvarigt. Hver gang en ring åbner sig, reagerer kæden med Fehlings væske, og til sidst har næsten al glucosen reageret."
        }
    ];
    D.LIGE_FAERDIG = "Hele forløbet er gennemført.";

    /* ----- Smaa hjaelpere -------------------------------------------------------- */
    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    D.formNavn = function (form, sukker) { return (form === "alfa" ? "α-" : "β-") + D.SUKKER[sukker].navn; };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

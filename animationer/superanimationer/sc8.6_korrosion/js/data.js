/* =====================================================================
   data.js - maalene og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. Et maal kan have op til
   tre dele, der kommer efter hinanden:

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring)
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket
     spm      et spoergsmaal bagefter; de forkerte svar (f) er de fejl,
              elever laver, og forklaringen peger tilbage paa scenen

   Paa fane 3 har fire maal i stedet et skema med felter paa tavlen
   (felter). Hvert led har sin egen hinttrappe paa tre trin.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var D = {};

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* "jernrøret", "kobberrøret" */
    D.roeret = function (m) { return K.navn(m) + "røret"; };

    /* ----- Fane 1: Rørene ------------------------------------------------------ */
    D.R_MAAL = [
        {
            id: "cufe", navn: "Kobber og jern",
            opstil: { a: "Cu", b: "Fe", plast: false },
            gaet: {
                tekst: "Et kobberrør og et jernrør er skruet sammen, og der løber vand i dem. Gæt, hvad der sker med rørene i løbet af 20 år.",
                svar: [
                    { t: "Kobberrøret tæres ved samlingen" },
                    { t: "Jernrøret tæres ved samlingen", ok: true },
                    { t: "Begge rør tæres lige meget" }
                ]
            },
            forsoeg: {
                tekst: "Tryk på Lad tiden gå, og se, hvad der sker med rørene ved samlingen.",
                krav: { par: ["Cu", "Fe"], plast: false },
                hint: [
                    "Knappen Lad tiden gå står øverst i scenen.",
                    "Det ene rør skal være af kobber og det andet af jern. Metallet vælges under hvert rør.",
                    "Vælg Kobber og Jern, tryk på Lad tiden gå, og vent, til tiden standser."
                ]
            },
            loest: "Jernrøret blev tæret igennem ved samlingen. Kobberrøret er helt."
        },
        {
            id: "elektroner", navn: "Elektronerne",
            opstil: { a: "Cu", b: "Fe", plast: false },
            spm: {
                tekst: "Luppen viser atomerne i rørenes væg ved samlingen. Lad tiden gå igen, og følg de gule elektroner (e⁻). Hvilken vej går de?",
                svar: [
                    { t: "Fra jernet over i kobberet", ok: true },
                    { t: "Fra kobberet over i jernet",
                      f: "Se på de gule elektroner i luppen. De begynder der, hvor et jernatom forlader røret." },
                    { t: "Fra jernet ud i vandet",
                      f: "Elektronerne bliver i metallet. Det er jernionerne, Fe²⁺, der går ud i vandet." }
                ],
                hint: [
                    "Tryk på Nye rør og så på Lad tiden gå. Se i luppen imens.",
                    "Følg et jernatom, der forlader røret som Fe²⁺. Det efterlader to gule elektroner.",
                    "Elektronerne går gennem metallet fra jernet til kobberet. Ved kobberets overflade tager ilt og vand imod dem."
                ]
            },
            loest: "Jern er mindre ædelt end kobber. Jernatomerne afgiver elektroner til kobberet og går selv ud i vandet som Fe²⁺. Derfor forsvinder jernrøret."
        },
        {
            id: "ens", navn: "To ens rør",
            forsoeg: {
                tekst: "Find to rør, hvor samlingen ikke tæres mere end resten af røret. Skift metal med knapperne under rørene, og lad de 20 år gå.",
                krav: { ens: true, plast: false },
                set: "Samlingen er ikke tæret mere end resten af røret.",
                hint: [
                    "Metallet vælges med knapperne under hvert rør.",
                    "I opgave 1 var rørene af to forskellige metaller. Prøv noget andet.",
                    "Vælg det samme metal til begge rør, og tryk på Lad tiden gå."
                ]
            },
            spm: {
                tekst: "Hvorfor tæres samlingen ikke ekstra, når de to rør er af samme metal?",
                svar: [
                    { t: "To ens metaller holder lige godt på elektronerne, så ingen elektroner går fra det ene rør til det andet", ok: true },
                    { t: "Vandet kan ikke komme ind i samlingen",
                      f: "Vandet løber gennem begge rør som før. Se i luppen: går der elektroner over samlingen?" },
                    { t: "Metallet er blevet mere ædelt",
                      f: "Et metal skifter ikke plads i spændingsrækken. Se i luppen: går der elektroner over samlingen?" }
                ],
                hint: [
                    "Lad tiden gå igen, og se i luppen. Går der elektroner fra det ene rør til det andet?",
                    "Elektronerne går fra det mindst ædle metal til det mest ædle. Hvad sker der, når de to er lige ædle?",
                    "Uden forskel på de to metaller går der ingen elektroner over samlingen."
                ]
            },
            loest: "Der skal to forskellige metaller til. Er rørene ens, går der ingen elektroner over samlingen. Jern ruster stadig langsomt, men lige meget overalt."
        },
        {
            id: "znfe", navn: "Zink og jern",
            opstil: { a: "Zn", b: "Fe", plast: false },
            gaet: {
                tekst: "Nu er et zinkrør skruet sammen med et jernrør. I opgave 1 var det jernrøret, der blev tæret. Gæt, hvad der sker nu.",
                svar: [
                    { t: "Jernrøret tæres igen" },
                    { t: "Zinkrøret tæres", ok: true },
                    { t: "Ingen af dem tæres" }
                ]
            },
            forsoeg: {
                tekst: "Tryk på Lad tiden gå, og se, hvilket rør der tæres ved samlingen.",
                krav: { par: ["Zn", "Fe"], plast: false },
                hint: [
                    "Knappen Lad tiden gå står øverst i scenen.",
                    "Det ene rør skal være af zink og det andet af jern.",
                    "Vælg Zink og Jern, tryk på Lad tiden gå, og vent, til de 20 år er gået."
                ]
            },
            loest: "Zink er mindre ædelt end jern. Nu er det zinkrøret, der afgiver elektroner, og jernrøret er beskyttet. Spændingsrækken i panelet viser, hvem der afgiver til hvem."
        },
        {
            id: "retning", navn: "Vandets retning",
            opstil: { a: "Fe", b: "Cu", plast: false },
            gaet: {
                tekst: "Vandet løber fra venstre mod højre. Med kobberrøret først går der hul i jernrøret efter 10 år. Nu er rørene byttet om, så vandet kommer gennem jernrøret først. Gæt, hvornår der går hul.",
                svar: [
                    { t: "Før der er gået 10 år" },
                    { t: "Efter 10 år igen" },
                    { t: "Senere end efter 10 år", ok: true }
                ]
            },
            forsoeg: {
                tekst: "Tryk på Lad tiden gå, og se, hvor længe jernrøret holder, når vandet kommer gennem det først.",
                krav: { par: ["Fe", "Cu"], orden: true, plast: false },
                set: "Med jernrøret først gik der 20 år, dobbelt så længe.",
                hint: [
                    "Knappen Lad tiden gå står øverst i scenen.",
                    "Jernrøret skal sidde til venstre og kobberrøret til højre. Pilene i rørene viser vandets retning.",
                    "Vælg Jern til venstre rør og Kobber til højre rør, tryk på Lad tiden gå, og vent, til tiden standser."
                ]
            },
            spm: {
                tekst: "Sæt kobberrøret først igen, og lad tiden gå. Se i luppen, hvad vandet har med fra kobberrøret. Hvorfor går der hul hurtigere, når vandet kommer fra kobberrøret?",
                krav: { par: ["Cu", "Fe"], orden: true, plast: false },
                svar: [
                    { t: "Vandet har elektroner med fra kobberrøret",
                      f: "Elektronerne bliver i metallet. Se i luppen, hvad kuglerne med Cu²⁺ gør, når de lander på jernet." },
                    { t: "Vandet har kobberioner med, og de tager elektroner fra jernet", ok: true },
                    { t: "Vandet løber hurtigere, når det kommer fra kobberrøret",
                      f: "Vandet løber lige hurtigt i begge rør. Se i luppen, hvad der lander på jernet." }
                ],
                hint: [
                    "Vælg Kobber til venstre rør og Jern til højre rør, og tryk på Lad tiden gå.",
                    "Følg en af kuglerne med Cu²⁺ i vandet. Hvor lander den, og hvad sker der med jernatomet under den?",
                    "Kobber er mere ædelt end jern. En kobberion tager to elektroner fra et jernatom."
                ]
            },
            loest: "Vandet tager lidt kobber med fra kobberrøret som Cu²⁺. På jernrøret tager hver kobberion to elektroner fra et jernatom: Cu²⁺ + Fe → Cu + Fe²⁺. Derfor skal vandet løbe gennem jernrøret først."
        },
        {
            id: "plast", navn: "Plastmuffen",
            opstil: { a: "Fe", b: "Cu", plast: false },
            forsoeg: {
                tekst: "Med jernrøret først gik der stadig hul efter 20 år. Sæt en plastmuffe mellem rørene med kontakten øverst i scenen, og lad de 20 år gå.",
                krav: { par: ["Fe", "Cu"], orden: true, plast: true },
                set: "Jernrøret holdt i alle 20 år.",
                hint: [
                    "Kontakten Plastmuffe står øverst i scenen, til højre for Lad tiden gå.",
                    "Jernrøret skal sidde til venstre, så vandet kommer gennem det først. Plastmuffen sidder mellem rørene.",
                    "Vælg Jern til venstre rør og Kobber til højre rør, slå Plastmuffe til, og tryk på Lad tiden gå."
                ]
            },
            spm: {
                tekst: "Hvorfor holder jernrøret, når der sidder en plastmuffe imellem?",
                svar: [
                    { t: "Elektronerne kan ikke komme fra jernet til kobberet gennem plast", ok: true },
                    { t: "Plasten holder vandet væk fra rørene",
                      f: "Vandet løber stadig gennem begge rør. Se i luppen, hvad der ikke kommer forbi plasten." },
                    { t: "Plast er mere ædelt end kobber",
                      f: "Plast er ikke et metal og står ikke i spændingsrækken. Se i luppen, hvad der ikke kommer forbi plasten." }
                ],
                hint: [
                    "Lad tiden gå igen, og se i luppen. Hvad gør elektronerne i jernet nu?",
                    "Elektroner bevæger sig gennem metal. Plast er ikke et metal.",
                    "Plast leder ikke strøm, så elektronerne kan ikke komme over i kobberet."
                ]
            },
            loest: "Plast leder ikke strøm. Elektronerne kan ikke komme fra jernet til kobberet, så jernrøret ruster kun langsomt, som om det sad alene. Sådan samler en VVS-montør de to slags rør: jernrøret først og plast imellem."
        }
    ];

    /* Linjen i "Prøvet" i panelet: hvad der skete med to rør */
    D.roerNavn = function (par) {
        return D.Stort(K.navn(par.a)) + (par.plast ? " + plast + " : " + ") + K.navn(par.b);
    };

    /* Aaret, som det staar paa tidslinjen: 10,2 er aar 10 */
    D.aar = function (t) { return Math.floor(t + 1e-6); };

    D.roerResultat = function (par) {
        if (par.svag) {
            if (par.hul) return "hul i " + D.roeret(par.svagMetal) + " efter " + D.aar(par.hul) + " år";
            return D.roeret(par.svagMetal) + " tæret ved samlingen";
        }
        var dele = [];
        [par.a, par.b].forEach(function (m) {
            var t = K.METAL[m].egen > 0 ? (m === "Fe" ? "jern ruster langsomt" : K.navn(m) + " tæres langsomt") : null;
            if (t && dele.indexOf(t) < 0) dele.push(t);
        });
        return dele.length ? dele.join(", ") + ", samlingen holder" : "ingen tæring";
    };

    /* Beskeden, naar de 20 aar er gaaet, og maalets krav ikke er opfyldt */
    D.roerForkert = function (krav, par) {
        if (krav.ens) {
            if (par.plast) return "Der sidder en plastmuffe imellem. Find to rør, der kan skrues direkte sammen.";
            return D.Stort(D.roeret(par.svagMetal)) + " er tæret mest ved samlingen. Prøv to andre rør.";
        }
        var m0 = krav.par[0], m1 = krav.par[1];
        if (!((par.a === m0 && par.b === m1) || (par.a === m1 && par.b === m0))) {
            return "Opgaven gælder et rør af " + K.navn(m0) + " og et af " + K.navn(m1) + ". Skift metal under rørene.";
        }
        if (krav.orden && par.a !== m0) {
            if (par.plast && par.ioner) {
                return "Plastmuffen standser elektronerne, men vandet har stadig " + K.navn(par.ioner.fra) + "ioner med hen til " +
                    D.roeret(par.b) + ". Sæt " + D.roeret(m0) + " til venstre.";
            }
            return "Vandet skal komme gennem " + D.roeret(m0) + " først. Vælg " + D.Stort(K.navn(m0)) + " til venstre rør og " +
                D.Stort(K.navn(m1)) + " til højre rør.";
        }
        if (krav.plast && !par.plast) return D.Stort(D.roeret(par.svagMetal || "Fe")) + " blev tæret ved samlingen. Sæt plastmuffen imellem, og prøv igen.";
        return "I denne opgave skal rørene skrues direkte sammen. Slå Plastmuffe fra med kontakten øverst i scenen.";
    };

    /* ----- Fane 2: Skibet ---------------------------------------------------------- */
    D.S_MAAL = [
        {
            id: "uden", navn: "Uden beskyttelse",
            vaerft: true,
            forsoeg: {
                tekst: "Skibets skrog er af jern, og propellen er af bronze, som mest er kobber. Begge dele er i havvand. Sejl 3 år, og se, hvor skroget ruster.",
                set: "Skroget er rustet omkring propellen.",
                hint: [
                    "Knappen Sejl 1 år står øverst i scenen.",
                    "Lad klodserne blive på kajen i denne opgave.",
                    "Tryk tre gange på Sejl 1 år, uden at der sidder en klods på skroget."
                ]
            },
            spm: {
                tekst: "Hvorfor ruster skroget mest ved propellen?",
                svar: [
                    { t: "Propellen hvirvler vandet rundt, og det slider på jernet",
                      f: "Skroget ruster også, når skibet ligger stille i havnen. Tænk på rørene på fane 1: to metaller, der rører hinanden i vand." },
                    { t: "Jernet rører kobberet i propellen, og jern er det mindst ædle af de to", ok: true },
                    { t: "Havvandet er mest salt ved propellen",
                      f: "Havvandet er lige salt langs hele skroget. Tænk på rørene på fane 1: to metaller, der rører hinanden i vand." }
                ],
                hint: [
                    "Sejl et år mere, og følg de gule elektroner i skroget.",
                    "Elektronerne går fra jernet i skroget hen til propellen. Hvad er propellen lavet af?",
                    "Det er det samme som jernrøret og kobberrøret på fane 1."
                ]
            },
            loest: "Det er det samme som i rørene: jern og kobber rører hinanden i vand. Jernet afgiver elektroner til propellen og tæres, mest tæt på propellen."
        },
        {
            id: "klods", navn: "Beskyt skroget",
            forsoeg: {
                tekst: "På kajen ligger klodser af zink, magnesium og kobber. Træk en klods ned på en af de to pladser på skroget, og sejl 3 år, uden at skroget ruster mere.",
                hint: [
                    "Tag fat i en klods på kajen, og slip den på en af de stiplede pladser på skroget.",
                    "Klodsen skal afgive elektroner i stedet for skroget. Den skal være mindre ædel end jern.",
                    "Sæt en zinkklods på skroget, og tryk tre gange på Sejl 1 år."
                ]
            },
            loest: "Klodsen er blevet mindre, og skroget er ikke rustet mere. Klodsen er mindre ædel end jern, så den afgiver elektronerne i stedet for skroget. Sådan en klods kaldes en offeranode."
        },
        {
            id: "zink", navn: "Hvor bliver zinken af?",
            spm: {
                tekst: "En zinkklods bliver mindre for hvert år. Sæt en zinkklods på skroget, sejl et år, og se, hvad der forlader klodsen. Hvad sker der med zinken?",
                svar: [
                    { t: "Zn → Zn²⁺ + 2 e⁻. Zinkionerne går ud i havvandet.", ok: true },
                    { t: "Zinken slides af, når skibet sejler",
                      f: "Klodsen svinder også, når skibet ligger stille. Se på det, der forlader klodsen, mens skibet sejler." },
                    { t: "Zn²⁺ + 2 e⁻ → Zn. Zinken sætter sig på propellen.",
                      f: "Så skulle zinken optage elektroner. Se på de gule elektroner: de går væk fra klodsen." }
                ],
                hint: [
                    "Sæt en zinkklods på skroget, og tryk på Sejl 1 år. Se på klodsen imens.",
                    "Fra klodsen går der Zn²⁺ ud i vandet, og gule elektroner går gennem skroget hen mod propellen.",
                    "Zink afgiver to elektroner og bliver til Zn²⁺."
                ]
            },
            loest: "Zink oxideres: Zn → Zn²⁺ + 2 e⁻. Elektronerne går gennem skroget til propellen, og zinkionerne går ud i havvandet. Klodsen ofres, og skroget er beskyttet."
        },
        {
            id: "mg", navn: "Magnesium",
            gaet: {
                tekst: "Magnesium er endnu mindre ædelt end zink. Gæt, hvordan en klods af magnesium klarer sig i forhold til en klods af zink.",
                svar: [
                    { t: "Den holder længere end zink" },
                    { t: "Den bliver brugt hurtigere end zink", ok: true },
                    { t: "Den beskytter slet ikke skroget" }
                ]
            },
            forsoeg: {
                tekst: "Sæt en magnesiumklods på skroget, og sejl, til klodsen er brugt op.",
                hint: [
                    "Træk en magnesiumklods fra kajen ned på en plads på skroget.",
                    "Tryk på Sejl 1 år, og følg tallet under klodsen.",
                    "Sæt en magnesiumklods på, og sejl 2 år."
                ]
            },
            loest: "Magnesiumklodsen var væk efter halvandet år. En zinkklods holder i tre et halvt. Magnesium står længere fra kobber i spændingsrækken og afgiver elektronerne hurtigere. I havvand bruger man derfor zink."
        },
        {
            id: "ti", navn: "Ti år uden rust",
            vaerft: true,
            forsoeg: {
                tekst: "Skibet har været på værft og er som nyt. Hold skroget fri for rust i 10 år. En klods skal have hjælp af en ny, før den er brugt op. Hvor få klodser kan du nøjes med?",
                hint: [
                    "Sæt en zinkklods på skroget, og hold øje med tallet under den efter hvert år.",
                    "En zinkklods holder tre et halvt år. Sæt en ny på, før den gamle er væk.",
                    "En ny klods kan sidde på den anden plads, mens den gamle bliver brugt helt op. Så går intet zink til spilde."
                ]
            },
            loest: "Ti år uden rust."
        }
    ];

    D.SKIB = {
        ingenKlods: "Skroget rustede, fordi der ikke sad en klods på det. Træk en klods fra kajen ned på en plads.",
        kobber: "Skroget rustede hurtigere end før. Kobber er mere ædelt end jern, så klodsen tager elektroner fra skroget ligesom propellen.",
        brugtOp: function (m) { return "Klodsen af " + K.navn(m) + " blev brugt op, og så rustede skroget igen."; },
        tiRust: "Skroget rustede, fordi der ikke var mere zink tilbage. Tryk på På værft, og prøv igen.",
        tiLoest: function (n) {
            return "Ti år uden rust med " + n + " klodser." +
                (n <= 3 ? " Færre kan det ikke gøres." : " Det kan gøres med 3. Prøv igen med På værft.") +
                " På rigtige skibe skiftes zinkklodserne, når skibet er i dok.";
        },
        hul: "Skroget er tæret igennem ved propellen. Tryk på På værft for at få et nyt skrog.",
        fuldt: "Begge pladser er optaget. Klik på en klods på skroget for at tage den af.",
        tagAf: "Klik på en klods på skroget for at tage den af."
    };

    /* ----- Fane 3: Rusten -------------------------------------------------------------- */
    D.J_MAAL = [
        {
            id: "krav", navn: "Vand og ilt",
            gaet: {
                tekst: "En plade af jern set helt tæt på. Kontakterne øverst bestemmer, om der ligger en dråbe vand på pladen, og om der er ilt i luften. Gæt, hvad der skal til, for at jern ruster.",
                svar: [
                    { t: "Kun vand" },
                    { t: "Kun ilt" },
                    { t: "Både vand og ilt", ok: true }
                ]
            },
            forsoeg: {
                tekst: "Prøv alle fire muligheder med kontakterne Vand og Ilt, og se, hvornår jernatomerne forlader pladen. Skemaet nedenfor husker, hvad du har prøvet.",
                hint: [
                    "Kontakterne Vand og Ilt står øverst til venstre i scenen.",
                    "Skemaet i panelet viser, hvilke af de fire muligheder der mangler.",
                    "Prøv: vand og ilt, kun vand, kun ilt og ingen af delene. Vent et par sekunder ved hver."
                ]
            },
            loest: "Jern ruster kun, når der både er vand og ilt. Tørt jern ruster ikke, og jern i vand uden ilt ruster heller ikke."
        },
        {
            id: "ox", navn: "Jern afgiver elektroner",
            felter: {
                skema: "ox",
                tekst: "Midt under dråben forlader jernatomerne pladen som Fe²⁺. Se i scenen, hvor mange elektroner hvert jernatom efterlader i pladen, og skriv tallet på tavlen.",
                hint: [
                    "Både Vand og Ilt skal være slået til. Følg et jernatom, der forlader pladen.",
                    "Tæl de gule elektroner, der bliver tilbage i pladen efter ét jernatom.",
                    "Ladningen skal være den samme før og efter pilen. Fe²⁺ har ladningen 2+."
                ]
            },
            loest: "Jern afgiver elektroner. Det er en oxidation."
        },
        {
            id: "red", navn: "Ilt optager elektroner",
            felter: {
                skema: "red",
                tekst: "Elektronerne går gennem jernet ud til dråbens kant. Der optages de af ilt og vand, og der dannes OH⁻. Afstem skemaet på tavlen.",
                hint: [
                    "Begynd med OH⁻. Tæl O-atomerne før pilen.",
                    "Der er 4 O og 4 H før pilen. Hvor mange OH⁻ giver det?",
                    "Ladningen skal være ens på begge sider. Hver OH⁻ har ladningen −."
                ]
            },
            loest: "Ilt optager elektroner. Det er en reduktion."
        },
        {
            id: "samlet", navn: "Det samlede skema",
            felter: {
                skema: "samlet",
                tekst: "Ilt optager de elektroner, jern afgiver. Der skal afgives lige så mange, som der optages. Skriv tallene i det samlede skema.",
                hint: [
                    "Ét jernatom afgiver 2 e⁻. Ét O₂ optager 4 e⁻.",
                    "Der skal så mange jernatomer til, at de tilsammen afgiver 4 e⁻.",
                    "OH⁻ kender du fra reduktionen: O₂ og 2 H₂O giver 4 OH⁻."
                ]
            },
            loest: "To jernatomer afgiver 4 elektroner, og ét O₂ optager dem."
        },
        {
            id: "rust", navn: "Fra Fe²⁺ til rust",
            felter: {
                skema: "rust",
                tekst: "Fe²⁺ og OH⁻ mødes i dråben og bliver til Fe(OH)₂. Ilt oxiderer det videre til rust, FeO(OH). Afstem skemaet på tavlen.",
                hint: [
                    "Begynd med jern. Der skal være lige mange Fe før og efter pilen.",
                    "Prøv med 4 Fe(OH)₂. Det giver 8 H før pilen. Fordel dem på FeO(OH) og H₂O.",
                    "4 FeO(OH) har 4 H. Resten af H-atomerne bliver til vand. Tæl til sidst O-atomerne."
                ]
            },
            loest: "Rust er jern(III)oxidhydroxid. Jern har nu afgivet tre elektroner i alt."
        },
        {
            id: "salt", navn: "Salt",
            gaet: {
                tekst: "Om vinteren saltes vejene, og skibe sejler i saltvand. Gæt, hvad der sker med jernet, når der er salt i dråben.",
                svar: [
                    { t: "Jernet ruster hurtigere", ok: true },
                    { t: "Jernet ruster langsommere" },
                    { t: "Der er ingen forskel" }
                ]
            },
            forsoeg: {
                tekst: "Slå Salt til og fra med kontakten, og sammenlign. Tælleren øverst til højre viser, hvor mange jernatomer der forlader pladen pr. minut.",
                set: "Med salt forlader tre gange så mange jernatomer pladen.",
                hint: [
                    "Kontakten Salt står øverst til venstre, ved siden af Vand og Ilt.",
                    "Vand og Ilt skal være slået til. Se på tælleren med og uden salt.",
                    "Slå Salt til, vent nogle sekunder, slå Salt fra, og vent igen."
                ]
            },
            spm: {
                tekst: "Hvorfor ruster jernet hurtigere med salt i vandet?",
                svar: [
                    { t: "Ionerne Na⁺ og Cl⁻ får vandet til at lede strøm bedre, så ladningerne i dråben udlignes hurtigere", ok: true },
                    { t: "Saltet reagerer med jernet og bliver til rust",
                      f: "Se på skemaerne i panelet. Hverken Na⁺ eller Cl⁻ er med, og de bliver ikke brugt." },
                    { t: "Salt indeholder ilt",
                      f: "NaCl består af natrium og chlor. Ilten kommer fra luften." }
                ],
                hint: [
                    "Slå Salt til, og se, hvor Na⁺ og Cl⁻ bevæger sig hen i dråben.",
                    "Midt i dråben hober Fe²⁺ sig op, og ved kanten OH⁻. Hvilke ioner trækkes hvorhen?",
                    "Elektronerne går gennem jernet, og ionerne går gennem vandet. Flere ioner i vandet gør den vej lettere."
                ]
            },
            loest: "Saltet bliver ikke brugt. Cl⁻ trækkes mod midten, hvor Fe²⁺ hober sig op, og Na⁺ mod kanten, hvor OH⁻ dannes. Ladningerne udlignes hurtigere, og jernet ruster hurtigere. Derfor ruster biler og skibe mest i saltvand."
        }
    ];

    /* De fire muligheder i maal 1 paa fane 3 */
    D.KOMBI = [
        { vand: true,  ilt: true },
        { vand: true,  ilt: false },
        { vand: false, ilt: true },
        { vand: false, ilt: false }
    ];

    /* Beskeden til et skema, der ikke er afstemt. Den bruger kun elevens
       egne tal. tal: felterne i raekkefoelge, tjek: K.tjekSkema. */
    D.skemaFejl = function (id, tal, tjek) {
        var L = NK.ladningstekst, a = tal[0], b = tal[1], c = tal[2];
        if (id === "ox") {
            return "Ladningen passer ikke. Før pilen er den 0. Efter pilen står Fe²⁺ med ladningen 2+ og " + a +
                " e⁻ med ladningen " + L(-a) + " i alt.";
        }
        if (id === "red") {
            if (tjek.fejl === "O" || tjek.fejl === "H") {
                return "Tæl O-atomerne. Før pilen er der 2 i O₂ og 2 i 2 H₂O. Efter pilen har du " + b + ".";
            }
            return "Ladningen passer ikke. Før pilen: " + a + " e⁻ giver " + L(-a) + ". Efter pilen: " + b + " OH⁻ giver " + L(-b) + ".";
        }
        if (id === "samlet") {
            if (tjek.fejl === "Fe") return "Der står " + a + " Fe før pilen og " + b + " Fe²⁺ efter pilen. Jernatomerne forsvinder ikke.";
            if (tjek.fejl === "O" || tjek.fejl === "H") {
                return "Tæl O-atomerne. Før pilen er der 2 i O₂ og 2 i 2 H₂O. Efter pilen har du " + c + " i OH⁻.";
            }
            return "Elektronerne passer ikke. " + a + (a === 1 ? " jernatom afgiver " : " jernatomer afgiver ") + (2 * a) +
                " e⁻, men ét O₂ optager 4 e⁻.";
        }
        if (tjek.fejl === "Fe") return "Der står " + a + " Fe før pilen og " + b + " Fe efter pilen. Jernatomerne forsvinder ikke.";
        if (tjek.fejl === "H") return "Tæl H-atomerne. Før pilen: " + tjek.v.H + ". Efter pilen: " + tjek.h.H + ".";
        return "Tæl O-atomerne. Før pilen: " + tjek.v.O + ". Efter pilen: " + tjek.h.O + ".";
    };

    D.TOMT_FELT = "Der mangler et tal på tavlen. Skriv et helt tal i hvert felt.";

    /* ----- Faelles ------------------------------------------------------------------ */
    D.GAET_HINT = ["Det er et gæt. Vælg det, du tror, og prøv det bagefter."];
    D.GAET_LINJE = "Gæt først i opgavekortet til højre.";
    D.SPM_LINJE = "Vælg et svar i opgavekortet til højre.";

    D.FAERDIG = {
        r: "Alle seks mål er løst. Fortsæt med Skibet.",
        s: "Alle fem mål er løst. Fortsæt med Rusten.",
        j: "Alle seks mål er løst."
    };

    D.ROS = ["Sådan.", "Det passer.", "Netop."];

    D.PAASKE = {
        vandpyt: "Nu er det tid til at ringe til en VVS-montør. Og til forsikringen.",
        fisk: "Fisken er ligeglad. Den er ikke af metal."
    };

    NK.Data = D;
}());

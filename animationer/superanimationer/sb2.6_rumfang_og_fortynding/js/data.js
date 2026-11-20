/* =====================================================================
   data.js - maalene og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. Et maal kan have op til seks
   dele, der kommer efter hinanden (js/fane.js):

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring).
              intro er en kort indledning, tekst er selve spoergsmaalet
     brok     et spoergsmaal foer forsoeget (bedoemmes med Indsend svar)
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket.
              set er det, eleven lige har set; det staar alene paa det
              groenne kort, foer spoergsmaalet kommer
     spm      et spoergsmaal bagefter; de forkerte svar (f) er de fejl,
              elever laver, og forklaringen peger tilbage paa scenen
     spm2     et spoergsmaal til. godt er forklaringen til et rigtigt svar,
              naar der kommer en del mere

   Hver del har sin egen hinttrappe paa tre trin. Teksterne er korte, fordi
   de staar paa kortet oeverst i scenen: et gaet hoejst 60 tegn, et
   spoergsmaal hoejst 105, et svar hoejst 34, et forsoeg hoejst 95, et hint
   hoejst 100, forklaringen til et forkert svar hoejst 110 og til det
   rigtige hoejst 160. Selvtesten taeller.

   Intet er indforstaaet: hver tekst naevner selv cylinderen, maaleglasset,
   tallinjen eller det stof, den handler om. om er de ting i scenen, delen
   handler om; de faar en gul ring.

   Ordene er Kemibogens (afsnit B2.4): reaktionsbroeken Y,
   ligevaegtskonstanten K, indgreb, forskudt, mod hoejre og mod venstre,
   reglen for fortynding og reglen for rumfang. Fortyndingen bruger
   Co2+(aq) + 4 Cl-(aq) <=> CoCl4 2-(aq) uden vand i skemaet, som bogen.
   Oevelsens jern(III)thiocyanat er ikke med (brugerens egen oevelse).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* En broek med rigtig broekstreg (til kortet) */
    D.brok = function (over, under) {
        if (!under) return '<span class="brok enkel">' + over + "</span>";
        return '<span class="brok"><span class="bt">' + over + '</span><span class="bn">' + under + "</span></span>";
    };

    /* Y som et tal gange K: "Y = 16 · K", "Y = ¼ · K", "Y = K" */
    D.relTekst = function (rel) {
        if (!isFinite(rel) || !(rel > 0)) return "Y";
        if (Math.abs(rel - 1) < 0.025) return "Y = K";
        var t;
        if (rel >= 1) {
            t = Math.abs(rel - Math.round(rel)) < 0.02 * rel ? String(Math.round(rel)) : NK.betydende(rel, 2);
        } else {
            var n = 1 / rel, nr = Math.round(n);
            if (Math.abs(n - nr) < 0.02 * n) t = nr === 2 ? "½" : (nr === 4 ? "¼" : "1/" + nr);
            else t = NK.betydende(rel, 2);
        }
        return "Y = " + t + " · K";
    };

    D.STOF = {
        N2O4: { f: "N₂O₄", navn: "dinitrogentetraoxid" },
        NO2: { f: "NO₂", navn: "nitrogendioxid" },
        Co: { f: "Co²⁺", navn: "cobalt(II)ion" },
        Cl: { f: "Cl⁻", navn: "chloridion" },
        CoCl4: { f: "CoCl₄²⁻", navn: "CoCl₄²⁻-ion" }
    };

    /* Svarene paa "Hvilken vej forskydes ligevaegten?". rigtig: 0 mod hoejre,
       1 mod venstre, 2 ingen forskydning. f er forklaringerne til de tre. */
    function retning(rigtig, f) {
        return [
            { t: "Mod højre", ok: rigtig === 0, f: f[0] },
            { t: "Mod venstre", ok: rigtig === 1, f: f[1] },
            { t: "Ingen forskydning", ok: rigtig === 2, f: f[2] }
        ];
    }

    /* ===================================================================
       FANE 1: STEMPLET (N2O4(g) <=> 2 NO2(g), K = 0,25 M)
       opstil.V: rumfanget fra start (L). Blandingen er i ligevaegt.
       En forsoegsdel har maal: "ned" (rumfanget halveres) eller "op".

       Det foerste maal er stilladseret (brugeren 20. nov. 2026: "tænker lidt
       byg figuren ind over ... at der første spørges ind til ligevægtsloven..
       og så dukker den op... og så fortsætter man stilladseret indtil man
       kommer til farveskiftet"). trin er delene i raekkefoelge, og vis er
       det, et loest trin faar frem i scenen: broek, faktor (faktoren paa
       hver koncentration), taelling, tallinje og retning. Maal uden trin har
       broeken og tallinjen fremme fra start.
       =================================================================== */
    var RET_NED = [
        "Y = 2 · K er større end K. Så skal Y blive mindre, og det sker mod venstre.",
        null,
        "Lige efter indgrebet er Y ikke lig med K. Se tallinjen."
    ];

    D.S_MAAL = [
        {
            id: "pres", navn: "Pres stemplet ned",
            opstil: { V: 2.0 }, faktor: "2", yLige: 2, vis0: [],
            trin: [
                {
                    del: "spm", vis: ["broek"], om: [],
                    intro: "Cylinderen indeholder brun NO₂ og farveløs N₂O₄ i ligevægt.",
                    tekst: "Hvad er reaktionsbrøken Y for N₂O₄(g) ⇌ 2 NO₂(g)?",
                    svar: [
                        { t: "[NO₂]² / [N₂O₄]", h: D.brok("[NO₂]²", "[N₂O₄]"), ok: true },
                        { t: "[N₂O₄] / [NO₂]²", h: D.brok("[N₂O₄]", "[NO₂]²"),
                          f: "Produktet står over brøkstregen og reaktanten under. NO₂ står til højre i skemaet." },
                        { t: "2 · [NO₂] / [N₂O₄]", h: D.brok("2 · [NO₂]", "[N₂O₄]"),
                          f: "Koefficienten 2 bliver en potens, ikke en faktor: [NO₂]²." }
                    ],
                    hint: [
                        "Produkterne står over brøkstregen, og reaktanterne står under.",
                        "Koefficienten foran et stof bliver til potensen.",
                        "Y = [NO₂]² / [N₂O₄]."
                    ],
                    godt: "NO₂ er produktet og står over brøkstregen i anden, fordi koefficienten er 2. N₂O₄ står under."
                },
                {
                    del: "spm", vis: ["faktor"], om: ["formel"],
                    intro: "Stemplet presses ned, så rumfanget i cylinderen bliver halvt så stort.",
                    tekst: "Hvad sker der med koncentrationerne af N₂O₄ og NO₂, når rumfanget halveres?",
                    svar: [
                        { t: "De bliver dobbelt så store", ok: true },
                        { t: "De bliver halvt så store",
                          f: "Den samme gas presses sammen på mindre plads, så der er flere molekyler pr. liter." },
                        { t: "Kun [NO₂] ændrer sig",
                          f: "Begge gasser er i den samme cylinder, så begge koncentrationer ændres med det samme tal." }
                    ],
                    hint: [
                        "Antallet af molekyler er det samme, men rumfanget bliver halvt så stort.",
                        "Koncentration er stofmængde delt med rumfang.",
                        "Begge koncentrationer bliver dobbelt så store."
                    ],
                    godt: "Begge koncentrationer bliver dobbelt så store. Brøken i scenen har fået faktoren 2 på hver koncentration."
                },
                {
                    del: "spm", vis: ["tallinje"], om: ["formel"],
                    intro: "Over brøkstregen står [NO₂] i anden, og under brøkstregen står [N₂O₄].",
                    tekst: "Hvor mange gange så stor bliver Y, når rumfanget i cylinderen halveres?",
                    svar: [
                        { t: "2 gange så stor", ok: true },
                        { t: "4 gange så stor",
                          f: "Tælleren bliver 2² = 4 gange så stor, men nævneren bliver også 2 gange så stor." },
                        { t: "Y er den samme",
                          f: "Tæller og nævner ændres ikke lige meget, fordi [NO₂] står i anden." }
                    ],
                    hint: [
                        "Tælleren er (2 · [NO₂])², så den bliver 2 · 2 = 4 gange så stor.",
                        "Nævneren er 2 · [N₂O₄], så den bliver 2 gange så stor.",
                        "Y bliver 4 / 2 = 2 gange så stor."
                    ],
                    godt: "Tælleren bliver 2² = 4 gange så stor og nævneren 2 gange, så Y bliver 4 / 2 = 2 gange så stor. Y = 2 · K."
                },
                {
                    del: "spm", vis: ["retning"], om: ["tallinje"],
                    intro: "Lige efter, at rumfanget er halveret, er Y = 2 · K.",
                    tekst: "Hvilken vej forskydes ligevægten, når rumfanget i cylinderen halveres?",
                    svar: retning(1, RET_NED),
                    hint: [
                        "Se tallinjen: Står Y = 2 · K til højre eller til venstre for K?",
                        "Y > K. Så skal der dannes mere af det, der står under brøkstregen.",
                        "Mod venstre: to NO₂ bliver til én N₂O₄."
                    ],
                    godt: "Y er større end K, så ligevægten forskydes mod venstre, hvor der er færrest gasmolekyler."
                },
                {
                    del: "forsoeg", maal: "ned", om: ["stempel"],
                    tekst: "Pres stemplet ned, og se, om ligevægten forskydes mod venstre.",
                    set: "Gassen blev først mørkere, fordi [NO₂] blev fordoblet. Bagefter blev den lidt lysere igen.",
                    hint: [
                        "Knappen Pres ned står ved siden af cylinderen.",
                        "Klik på den grønne knap Pres ned.",
                        "Klik på Pres ned, og vent, til Y står ved K på tallinjen."
                    ]
                },
                {
                    del: "spm", om: ["cylinder"],
                    tekst: "Hvorfor blev gassen i cylinderen lidt lysere igen, efter at stemplet var presset ned?",
                    svar: [
                        { t: "To NO₂ blev til én N₂O₄", ok: true },
                        { t: "Noget NO₂ slap ud",
                          f: "Cylinderen er lukket, så intet slipper ud. Se molekylerne: Nogle NO₂ har sat sig sammen to og to." },
                        { t: "K blev mindre",
                          f: "K ændrer sig kun med temperaturen, og temperaturen er den samme. Det var Y, der ændrede sig." }
                    ],
                    hint: [
                        "NO₂ er brun, og N₂O₄ er farveløs. Hvad skete der med antallet af NO₂?",
                        "Vis tallene i panelet, og tæl NO₂ lige efter indgrebet og nu.",
                        "Ligevægten blev forskudt mod venstre, så to NO₂ blev til én N₂O₄."
                    ]
                }
            ],
            loest: "Lige efter blev gassen mørkere. Ligevægten blev forskudt mod N₂O₄, hvor der er færrest molekyler, og gassen blev lidt lysere igen."
        },
        {
            id: "op", navn: "Træk stemplet op", visning: "dansere",
            opstil: { V: 2.0 },
            gaet: {
                intro: "Danserne er molekylerne: Et par er én N₂O₄, og en danser alene er ét NO₂. Stemplet trækkes op til dobbelt rumfang.",
                tekst: "Hvad sker der med antallet af molekyler?",
                svar: [
                    { t: "Der bliver flere", ok: true },
                    { t: "Der bliver færre" },
                    { t: "Det er det samme" }
                ]
            },
            forsoeg: {
                maal: "op",
                om: ["stempel"],
                tekst: "Klik på Træk op, og se, hvad danserne i cylinderen gør.",
                set: "Et par gik fra hinanden, så der blev 15 molekyler i stedet for 14.",
                hint: [
                    "Knappen Træk op står ved siden af cylinderen.",
                    "Klik på den grønne knap Træk op.",
                    "Klik på Træk op, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["tallinje"],
                intro: "Da rumfanget blev dobbelt så stort, blev alle koncentrationer halveret.",
                tekst: "Hvorfor dannede cylinderen flere molekyler, da rumfanget blev større?",
                svar: [
                    { t: "Y blev mindre end K", ok: true },
                    { t: "Der kom luft ind",
                      f: "Cylinderen er lukket. Se molekylerne: Der er kun N₂O₄ og NO₂." },
                    { t: "Y blev større end K",
                      f: "[NO₂]² over brøkstregen faldt mest, så Y blev mindre. Se tallinjen." }
                ],
                hint: [
                    "Se tallinjen lige efter indgrebet: Hvor sprang Y hen?",
                    "Over brøkstregen står [NO₂] i anden, så tælleren falder mest.",
                    "Y = ½ · K, så Y blev mindre end K, og ligevægten blev forskudt mod højre."
                ]
            },
            loest: "Et større rumfang gør Y mindre end K, så ligevægten bliver forskudt mod højre, hvor der er flest gasmolekyler."
        },
        {
            id: "modvirk", navn: "Modvirket, ikke ophævet",
            opstil: { V: 2.0 },
            forsoeg: {
                maal: "ned",
                om: ["stempel", "panel"],
                tekst: "Klik på Pres ned, og følg [NO₂] i panelet før, lige efter og nu.",
                set: "[NO₂] steg fra 0,10 M til 0,20 M og faldt derefter til 0,16 M.",
                hint: [
                    "Knappen Pres ned står ved siden af cylinderen.",
                    "Klik på den grønne knap Pres ned.",
                    "Klik på Pres ned, og se på rækken [NO₂] i panelet."
                ]
            },
            spm: {
                om: ["panel"],
                intro: "I panelet står [NO₂] før indgrebet, lige efter og ved den nye ligevægt.",
                tekst: "Hvordan er [NO₂] ved den nye ligevægt sammenlignet med før indgrebet?",
                svar: [
                    { t: "[NO₂] er højere end før", ok: true },
                    { t: "[NO₂] er den samme som før",
                      f: "Se panelet: [NO₂] var 0,10 M før og er 0,16 M nu. Forskydningen ophævede ikke indgrebet." },
                    { t: "[NO₂] er lavere end før",
                      f: "Se panelet: [NO₂] faldt fra 0,20 M lige efter, men ikke helt ned til 0,10 M." }
                ],
                hint: [
                    "Se kolonnerne før og nu i panelet.",
                    "Før: 0,10 M. Nu: 0,16 M.",
                    "[NO₂] er højere end før, men lavere end lige efter indgrebet."
                ]
            },
            loest: "Forskydningen modvirker indgrebet, men ophæver det ikke. Gassen er derfor stadig mørkere end før, men lysere end lige efter."
        }
    ];

    /* ===================================================================
       FANE 2: FORTYNDING (Co2+(aq) + 4 Cl-(aq) <=> CoCl4 2-(aq))
       opstil.V: rumfanget fra start i portioner af 25 mL (1, 2 eller 4).
       Blandingen er i ligevaegt. En forsoegsdel har maal: rumfanget efter
       vandet. Det foerste maal er stilladseret som paa fane 1.
       =================================================================== */
    var RET_FORT = [
        "Y er større end K. Så skal Y blive mindre, og det sker mod venstre.",
        null,
        "Lige efter fortyndingen er Y ikke lig med K. Se tallinjen."
    ];

    D.F_MAAL = [
        {
            id: "haeld", navn: "Hæld vand i",
            opstil: { V: 1 }, faktor: "½", yLige: 16, vis0: [],
            trin: [
                {
                    del: "spm", vis: ["broek"], om: [],
                    intro: "Opløsningen i måleglasset indeholder Co²⁺, Cl⁻ og blå CoCl₄²⁻ i ligevægt.",
                    tekst: "Hvad er reaktionsbrøken Y for Co²⁺(aq) + 4 Cl⁻(aq) ⇌ CoCl₄²⁻(aq)?",
                    svar: [
                        { t: "[CoCl₄²⁻] / ([Co²⁺] · [Cl⁻]⁴)", h: D.brok("[CoCl₄²⁻]", "[Co²⁺] · [Cl⁻]⁴"), ok: true },
                        { t: "([Co²⁺] · [Cl⁻]⁴) / [CoCl₄²⁻]", h: D.brok("[Co²⁺] · [Cl⁻]⁴", "[CoCl₄²⁻]"),
                          f: "Produktet står over brøkstregen og reaktanterne under. CoCl₄²⁻ står til højre i skemaet." },
                        { t: "[CoCl₄²⁻] / ([Co²⁺] · 4 · [Cl⁻])", h: D.brok("[CoCl₄²⁻]", "[Co²⁺] · 4 · [Cl⁻]"),
                          f: "Koefficienten 4 bliver en potens, ikke en faktor: [Cl⁻]⁴." }
                    ],
                    hint: [
                        "Produkterne står over brøkstregen, og reaktanterne står under.",
                        "Koefficienten foran et stof bliver til potensen.",
                        "Y = [CoCl₄²⁻] / ([Co²⁺] · [Cl⁻]⁴)."
                    ],
                    godt: "CoCl₄²⁻ er produktet og står over brøkstregen. Co²⁺ og Cl⁻ står under, og [Cl⁻] står i fjerde."
                },
                {
                    del: "spm", vis: ["faktor"], om: ["formel"],
                    intro: "Der hældes vand i måleglasset, til rumfanget er dobbelt så stort.",
                    tekst: "Hvad sker der med koncentrationen af hver ion, når rumfanget fordobles?",
                    svar: [
                        { t: "Den bliver halvt så stor", ok: true },
                        { t: "Den bliver dobbelt så stor",
                          f: "Ionerne fordeles i dobbelt så meget væske, så der er færre ioner pr. liter." },
                        { t: "Kun [Cl⁻] ændrer sig",
                          f: "Alle ionerne er i den samme opløsning, så alle koncentrationer ændres med det samme tal." }
                    ],
                    hint: [
                        "Antallet af ioner er det samme, men rumfanget bliver dobbelt så stort.",
                        "Koncentration er stofmængde delt med rumfang.",
                        "Alle koncentrationer bliver halvt så store."
                    ],
                    godt: "Alle koncentrationer bliver halvt så store. Brøken i scenen har fået faktoren ½ på hver koncentration."
                },
                {
                    del: "spm", vis: ["taelling"], om: ["formel"],
                    intro: "Hver koncentration i brøken har fået faktoren ½, og [Cl⁻] står i fjerde.",
                    tekst: "Hvor mange gange bliver der ganget med ½ under brøkstregen?",
                    svar: [
                        { t: "5 gange", ok: true },
                        { t: "2 gange",
                          f: "[Cl⁻] står i fjerde, så den får faktoren ½ fire gange. Hertil kommer ½ fra [Co²⁺]." },
                        { t: "4 gange",
                          f: "Husk også ½ på [Co²⁺]. Under brøkstregen er det 1 + 4 = 5 gange." }
                    ],
                    hint: [
                        "Under brøkstregen står ½ · [Co²⁺] og (½ · [Cl⁻])⁴.",
                        "(½ · [Cl⁻])⁴ giver ½ fire gange.",
                        "1 gang for [Co²⁺] og 4 gange for [Cl⁻]: 5 gange."
                    ],
                    godt: "Under brøkstregen bliver der ganget med ½ fem gange: én gang for [Co²⁺] og fire gange for [Cl⁻]⁴."
                },
                {
                    del: "spm", vis: ["tallinje"], om: ["formel"],
                    intro: "Tælleren bliver ganget med ½ én gang og nævneren fem gange.",
                    tekst: "Hvor mange gange så stor bliver Y, når rumfanget i måleglasset fordobles?",
                    svar: [
                        { t: "16 gange så stor", ok: true },
                        { t: "2 gange så stor",
                          f: "Under brøkstregen er der fire halveringer mere end over. 2 · 2 · 2 · 2 = 16." },
                        { t: "16 gange så lille",
                          f: "Nævneren falder mest, fordi den har flest halveringer. Så bliver Y større, ikke mindre." }
                    ],
                    hint: [
                        "Nævneren bliver halveret fire gange mere end tælleren.",
                        "Når nævneren bliver mindre, bliver brøken større.",
                        "Y bliver 2 · 2 · 2 · 2 = 16 gange så stor."
                    ],
                    godt: "Nævneren bliver halveret fire gange mere end tælleren, så Y bliver 2⁴ = 16 gange så stor. Y = 16 · K."
                },
                {
                    del: "spm", vis: ["retning"], om: ["tallinje"],
                    intro: "Lige efter fortyndingen er Y = 16 · K.",
                    tekst: "Hvilken vej forskydes ligevægten, når opløsningen i måleglasset fortyndes?",
                    svar: retning(1, RET_FORT),
                    hint: [
                        "Se tallinjen: Står Y = 16 · K til højre eller til venstre for K?",
                        "Y > K. Så skal der dannes mere af det, der står under brøkstregen.",
                        "Mod venstre: én CoCl₄²⁻ bliver til én Co²⁺ og fire Cl⁻."
                    ],
                    godt: "Y er større end K, så ligevægten forskydes mod venstre, hvor der er flest opløste partikler."
                },
                {
                    del: "forsoeg", maal: 2, om: ["vand"],
                    tekst: "Hæld vand i måleglasset, og se, hvad der sker med farven.",
                    set: "Lige efter var opløsningen lyseblå. Bagefter blev den violet, fordi der blev dannet lyserøde Co²⁺.",
                    hint: [
                        "Knappen Hæld vand i står ved siden af måleglasset.",
                        "Klik på den grønne knap Hæld vand i.",
                        "Klik på Hæld vand i, og vent, til Y står ved K på tallinjen."
                    ]
                },
                {
                    del: "spm", om: ["glas"],
                    tekst: "Hvorfor blev opløsningen i måleglasset violet og ikke bare lyseblå?",
                    svar: [
                        { t: "Ligevægten forskydes mod venstre", ok: true },
                        { t: "Vandet reagerer med CoCl₄²⁻",
                          f: "Vand står ikke i reaktionsskemaet og er ikke med i Y. Det var fortyndingen, der gjorde Y større end K." },
                        { t: "De blå ioner blev fortyndet",
                          f: "En fortynding alene gør farven lysere blå. Se ionerne: Én CoCl₄²⁻ blev til Co²⁺ og fire Cl⁻." }
                    ],
                    hint: [
                        "Se ionerne i måleglasset: Hvilke ioner blev der flere af?",
                        "Co²⁺ er lyserød. Der blev dannet Co²⁺ og Cl⁻ af CoCl₄²⁻.",
                        "Ligevægten blev forskudt mod venstre."
                    ]
                }
            ],
            loest: "Fortyndingen gjorde Y = 16 · K, så ligevægten blev forskudt mod venstre. Der blev dannet lyserøde Co²⁺, og opløsningen blev violet."
        },
        {
            id: "mere", navn: "Mere vand",
            opstil: { V: 2 },
            gaet: {
                intro: "Den violette opløsning i måleglasset er i ligevægt i 50 mL. Der hældes vand i til 100 mL.",
                tekst: "Hvad sker der med farven i måleglasset?",
                svar: [
                    { t: "Den bliver lyserød", ok: true },
                    { t: "Den bliver blå igen" },
                    { t: "Den er den samme" }
                ]
            },
            forsoeg: {
                maal: 4,
                om: ["vand"],
                tekst: "Klik på Hæld vand i, og følg farven i måleglasset og Y på tallinjen.",
                set: "Opløsningen blev lyserød. Næsten alle CoCl₄²⁻ er blevet til Co²⁺ og Cl⁻.",
                hint: [
                    "Knappen Hæld vand i står ved siden af måleglasset.",
                    "Klik på den grønne knap Hæld vand i.",
                    "Klik på Hæld vand i, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["tallinje"],
                intro: "Rumfanget i måleglasset blev fordoblet en gang til, fra 50 mL til 100 mL.",
                tekst: "Hvad blev Y lige efter den anden fortynding?",
                svar: [
                    { t: "Y = 16 · K igen", ok: true },
                    { t: "Y = 32 · K",
                      f: "Hver koncentration blev ganget med ½ igen, præcis som første gang. Det giver 16 · K." },
                    { t: "Y = K",
                      f: "Lige efter fortyndingen var Y ikke lig med K. Se tallinjen." }
                ],
                hint: [
                    "Rumfanget blev fordoblet igen, fra 50 mL til 100 mL.",
                    "Hver koncentration bliver ganget med ½, ligesom første gang.",
                    "Over brøkstregen ½ og under ½ fem gange: Y = 16 · K."
                ]
            },
            loest: "Hver fordobling af rumfanget gør Y 16 gange så stor. Ligevægten bliver forskudt mod venstre igen, og opløsningen bliver lyserød."
        },
        {
            id: "lige", navn: "Lige efter og bagefter",
            opstil: { V: 1 },
            forsoeg: {
                maal: 2,
                om: ["vand", "glas"],
                tekst: "Klik på Hæld vand i, og se nøje på farven i måleglasset lige efter.",
                set: "Lige efter var opløsningen lyseblå, og bagefter blev den violet.",
                hint: [
                    "Knappen Hæld vand i står ved siden af måleglasset.",
                    "Klik på den grønne knap Hæld vand i.",
                    "Klik på Hæld vand i, og se på farven, mens Y står langt fra K."
                ]
            },
            spm: {
                om: ["glas", "tallinje"],
                intro: "Lige efter, at vandet var hældt i, var opløsningen lyseblå.",
                tekst: "Hvorfor blev opløsningen i måleglasset ikke violet med det samme?",
                svar: [
                    { t: "Ligevægten var ikke forskudt endnu", ok: true },
                    { t: "Y var lig med K",
                      f: "Lige efter fortyndingen var Y = 16 · K. Se tallinjen." },
                    { t: "Vandet var ikke blandet",
                      f: "Vandet blandes med det samme. Det var ionerne, der endnu ikke havde reageret." }
                ],
                hint: [
                    "Lige efter fortyndingen var der de samme ioner som før, bare i dobbelt rumfang.",
                    "Ionerne havde endnu ikke reageret. Y var 16 · K.",
                    "Ligevægten var ikke forskudt endnu."
                ]
            },
            loest: "Lige efter fortyndingen er alle koncentrationer halveret, men ligevægten er ikke forskudt endnu. Først når den forskydes, bliver opløsningen violet."
        }
    ];

    /* ===================================================================
       FANE 3: REGN PAA Y
       f er det tal, hver koncentration bliver ganget med. over og under er
       koncentrationerne i reaktionsbroeken med deres potens. Y er det tal,
       Y bliver ganget med, og ret er retningen (0 hoejre, 1 venstre, 2
       ingen). faktorSvar og ySvar er svarene; den rigtige er markeret ok.
       =================================================================== */
    function faktorSvar(rigtig) {
        var alle = {
            "½": "Ganget med ½", "2": "Ganget med 2", "¼": "Ganget med ¼"
        };
        var raekke = rigtig === "¼" ? ["½", "¼", "4"] : ["½", "2", "forskel"];
        return raekke.map(function (k) {
            if (k === "forskel") return { t: "Forskelligt for hvert stof", f: "Alle stofferne deler det samme rumfang, så alle koncentrationer bliver ganget med det samme tal." };
            if (k === "4") return { t: "Ganget med 4", f: "Når rumfanget bliver 4 gange så stort, bliver hver koncentration 4 gange så lille." };
            var f = k === "2" ? "Et større rumfang giver mindre koncentrationer, ikke større." :
                (rigtig === "¼" ? "Rumfanget bliver 4 gange så stort, ikke 2 gange. Så bliver hver koncentration 4 gange så lille." :
                 "Et mindre rumfang giver større koncentrationer, ikke mindre.");
            return { t: alle[k], ok: k === rigtig, f: f };
        });
    }

    D.R_MAAL = [
        {
            id: "cobalt", navn: "Cobalt fortyndes",
            skema: "Co²⁺(aq) + 4 Cl⁻(aq) ⇌ CoCl₄²⁻(aq)",
            indgreb: "Opløsningen fortyndes med vand til det dobbelte rumfang.",
            naar: "når opløsningen fortyndes til det dobbelte rumfang",
            f: "½", over: [["[CoCl₄²⁻]", 1]], under: [["[Co²⁺]", 1], ["[Cl⁻]", 4]], Y: 16, ret: 1,
            ySvar: [
                { t: "Y = 16 · K", ok: true },
                { t: "Y = 2 · K", f: "Husk potensen: [Cl⁻] står i fjerde, så den får faktoren ½ fire gange." },
                { t: "Y = 1/16 · K", f: "Under brøkstregen er der flest halveringer, så nævneren falder mest, og Y bliver større." }
            ],
            loest: "Y = 16 · K er større end K, så ligevægten forskydes mod venstre, hvor der er flest opløste partikler."
        },
        {
            id: "n2o4", navn: "N₂O₄ presses sammen",
            skema: "N₂O₄(g) ⇌ 2 NO₂(g)",
            indgreb: "Rumfanget halveres.",
            naar: "når rumfanget halveres",
            f: "2", over: [["[NO₂]", 2]], under: [["[N₂O₄]", 1]], Y: 2, ret: 1,
            ySvar: [
                { t: "Y = K", f: "Husk potensen: [NO₂] står i anden, så tælleren bliver 2² = 4 gange så stor." },
                { t: "Y = 2 · K", ok: true },
                { t: "Y = ½ · K", f: "Tælleren bliver 4 gange så stor og nævneren kun 2 gange, så Y bliver større." }
            ],
            loest: "Y = 2 · K er større end K, så ligevægten forskydes mod venstre, hvor der er færrest gasmolekyler."
        },
        {
            id: "nh3", navn: "Ammoniak presses sammen",
            skema: "N₂(g) + 3 H₂(g) ⇌ 2 NH₃(g)",
            indgreb: "Rumfanget halveres.",
            naar: "når rumfanget halveres",
            f: "2", over: [["[NH₃]", 2]], under: [["[N₂]", 1], ["[H₂]", 3]], Y: 0.25, ret: 0,
            ySvar: [
                { t: "Y = ¼ · K", ok: true },
                { t: "Y = ½ · K", f: "Husk potenserne: [NH₃] står i anden og [H₂] i tredje. Tæl alle faktorerne." },
                { t: "Y = 4 · K", f: "Nævneren får flest faktorer 2, så den vokser mest, og Y bliver mindre." }
            ],
            loest: "Tælleren bliver 2² = 4 gange så stor og nævneren 2 · 2³ = 16 gange. Y = ¼ · K, så ligevægten forskydes mod højre."
        },
        {
            id: "pcl5", navn: "PCl₅ får mere plads",
            skema: "PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)",
            indgreb: "Rumfanget gøres dobbelt så stort.",
            naar: "når rumfanget fordobles",
            f: "½", over: [["[PCl₃]", 1], ["[Cl₂]", 1]], under: [["[PCl₅]", 1]], Y: 0.5, ret: 0,
            ySvar: [
                { t: "Y = 2 · K", f: "Over brøkstregen bliver der ganget med ½ to gange og under kun én gang. Så bliver Y mindre." },
                { t: "Y = K", f: "Tæller og nævner ændres ikke lige meget: to faktorer ½ over og én under." },
                { t: "Y = ½ · K", ok: true }
            ],
            loest: "Y = ½ · K er mindre end K, så ligevægten forskydes mod højre, hvor der er flest gasmolekyler."
        },
        {
            id: "co", navn: "Lige mange molekyler",
            skema: "CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)",
            indgreb: "Rumfanget halveres.",
            naar: "når rumfanget halveres",
            f: "2", over: [["[CO₂]", 1], ["[H₂]", 1]], under: [["[CO]", 1], ["[H₂O]", 1]], Y: 1, ret: 2,
            ySvar: [
                { t: "Y = K", ok: true },
                { t: "Y = 2 · K", f: "Der er to faktorer 2 over brøkstregen og to under. De går ud med hinanden." },
                { t: "Y = 4 · K", f: "Nævneren bliver også 2 · 2 = 4 gange så stor. Tæller og nævner ændres lige meget." }
            ],
            loest: "Der er lige mange gasmolekyler på begge sider, så Y = K. Rumfanget forskyder ikke ligevægten."
        },
        {
            id: "kobber", navn: "Kobber fortyndes meget",
            skema: "Cu²⁺(aq) + 4 Cl⁻(aq) ⇌ CuCl₄²⁻(aq)",
            indgreb: "Opløsningen fortyndes med vand til 4 gange rumfanget.",
            naar: "når opløsningen fortyndes til 4 gange rumfanget",
            f: "¼", over: [["[CuCl₄²⁻]", 1]], under: [["[Cu²⁺]", 1], ["[Cl⁻]", 4]], Y: 256, ret: 1,
            ySvar: [
                { t: "Y = 4 · K", f: "Husk potensen: [Cl⁻] står i fjerde, så den får faktoren ¼ fire gange." },
                { t: "Y = 256 · K", ok: true },
                { t: "Y = 1/256 · K", f: "Under brøkstregen er der flest faktorer ¼, så nævneren falder mest, og Y bliver større." }
            ],
            loest: "Over brøkstregen ¼ og under ¼ fem gange: Y = 4⁴ · K = 256 · K. Ligevægten forskydes mod venstre."
        }
    ];

    /* Delene paa fane 3 bygges af maalets tal */
    D.R_MAAL.forEach(function (o) {
        var ord = { "½": "halvt så store", "2": "dobbelt så store", "¼": "en fjerdedel så store" }[o.f];
        o.brok = {
            om: ["tavle"],
            tekst: "Hvad bliver hver koncentration ganget med, " + o.naar + "?",
            svar: faktorSvar(o.f),
            hint: [
                "Alle stofferne er i det samme rumfang.",
                "Et større rumfang giver mindre koncentrationer, et mindre rumfang større.",
                "Alle koncentrationer bliver " + ord + "."
            ],
            godt: "Alle stofferne deler det samme rumfang, så alle koncentrationer bliver " + ord + "."
        };
        o.forsoeg = {
            om: ["tavle"],
            tekst: "Klik på hver koncentration i reaktionsbrøken på tavlen, så den får faktoren " + o.f + " på.",
            hint: [
                "Koncentrationerne står i reaktionsbrøken på tavlen.",
                "Klik på hver af dem, også dem med en potens.",
                "Klik på de koncentrationer i brøken, der endnu ikke har " + o.f + " foran."
            ]
        };
        o.spm = {
            om: ["tavle"],
            intro: "Før indgrebet var Y = K.",
            tekst: "Hvad bliver Y, " + o.naar + "?",
            svar: o.ySvar,
            hint: [
                "Tæl faktorerne " + o.f + " over brøkstregen og under brøkstregen. En potens tæller flere gange.",
                "Gang faktorerne sammen over brøkstregen og under brøkstregen hver for sig.",
                "Del tallet over brøkstregen med tallet under brøkstregen."
            ],
            godt: o.Y === 1 ? "Faktorerne over og under brøkstregen går ud med hinanden, så Y = K." :
                "Rigtigt. Y er nu " + (o.Y > 1 ? "større" : "mindre") + " end K."
        };
        o.spm2 = {
            om: ["tallinje"],
            intro: "Lige efter indgrebet er " + D.relTekst(o.Y) + ".",
            tekst: "Hvilken vej forskydes ligevægten, " + o.naar + "?",
            svar: retning(o.ret, [
                o.ret === 1 ? "Y > K, så Y skal blive mindre. Det sker mod venstre." : "Y = K, så ligevægten er ikke forskudt.",
                o.ret === 0 ? "Y < K, så Y skal blive større. Det sker mod højre." : "Y = K, så ligevægten er ikke forskudt.",
                "Y er ikke lig med K lige efter indgrebet. Se tallinjen."
            ]),
            hint: [
                "Se tallinjen: Står Y til højre eller til venstre for K?",
                "Y < K: mod højre. Y > K: mod venstre. Y = K: ingen forskydning.",
                ["Mod højre.", "Mod venstre.", "Ingen forskydning."][o.ret]
            ]
        };
    });

    /* Det, der staar efter forklaringen, naar alle fanens maal er loest */
    D.FAERDIG = {
        s: "Alle tre opgaver med stemplet er løst.",
        f: "Alle tre opgaver med fortyndingen er løst.",
        r: "Alle seks regneopgaver er løst."
    };

    /* Et klik paa en partikel eller et maerke i signaturen */
    D.partikel = function (s) {
        var T = {
            N2O4: "N₂O₄, dinitrogentetraoxid: en farveløs gas. [N₂O₄] står under brøkstregen i Y.",
            NO2: "NO₂, nitrogendioxid: en brun gas. [NO₂] står i anden over brøkstregen i Y.",
            Co: "Co²⁺, cobalt(II)ion: lyserød i vand. [Co²⁺] står under brøkstregen i Y.",
            Cl: "Cl⁻, chloridion: farveløs. [Cl⁻] står i fjerde under brøkstregen i Y.",
            CoCl4: "CoCl₄²⁻: en blå ion, hvor fire chloridioner sidder om en cobalt(II)ion. Står over brøkstregen i Y."
        };
        return T[s] || "";
    };

    NK.Data = D;
}());

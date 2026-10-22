/* =====================================================================
   data.js - maalene og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. Et maal kan have op til
   seks dele, der kommer efter hinanden (js/fane.js):

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring).
              intro er en kort indledning, tekst er selve spoergsmaalet
     brok     fane 3: eleven vaelger reaktionsbroeken (svarene har HTML, h)
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket.
              set er det, eleven lige har set; det staar alene paa det
              groenne kort, foer spoergsmaalet kommer
     felter   fane 3: tallene ind i broeken og Y regnet ud
     spm      et spoergsmaal bagefter; de forkerte svar (f) er de fejl,
              elever laver, og forklaringen peger tilbage paa scenen
     spm2     et spoergsmaal til. godt er forklaringen til et rigtigt svar,
              naar der kommer en del mere

   Hver del har sin egen hinttrappe paa tre trin.

   Teksterne er korte, fordi de staar paa kortet oeverst i scenen
   (brugerens regel fra sc7.5): et gaet hoejst 60 tegn, et spoergsmaal
   hoejst 105, et svar hoejst 34, et forsoeg hoejst 95, et hint hoejst
   100, forklaringen til et forkert svar hoejst 110 og til det rigtige
   hoejst 160. Selvtesten taeller.

   Intet er indforstaaet: hver tekst naevner selv beholderen, tallinjen,
   lungerne eller det stof, den handler om. om er de ting i scenen, delen
   handler om; de faar en gul ring.

   Ordene er Kemibogens (afsnit B2.4): reaktionsbroeken Y,
   ligevaegtskonstanten K, indgreb, forskudt, mod hoejre og mod venstre,
   Le Chateliers princip.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* En broek med rigtig broekstreg (til knapperne paa kortet og tavlen) */
    D.brok = function (over, under) {
        if (!under) return '<span class="brok enkel">' + over + "</span>";
        return '<span class="brok"><span class="bt">' + over + '</span><span class="bn">' + under + "</span></span>";
    };

    /* Stofferne paa fane 1 og 2 med navn og formel */
    D.STOF = {
        CO: { f: "CO", navn: "carbonmonoxid" },
        H2O: { f: "H₂O", navn: "vanddamp" },
        CO2: { f: "CO₂", navn: "carbondioxid" },
        H2: { f: "H₂", navn: "hydrogen" },
        Hb: { f: "Hb", navn: "hæmoglobin uden oxygen" },
        O2: { f: "O₂", navn: "oxygen" },
        HbO2: { f: "HbO₂", navn: "hæmoglobin med oxygen" }
    };

    var LIGEVAEGT = { CO: 0.10, H2O: 0.10, CO2: 0.20, H2: 0.20 };

    /* ===================================================================
       FANE 1: INDGREB
       opstil.c: koncentrationerne fra start (M). tom: beholderen er tom,
       til eleven klikker paa Fyld beholderen (blandingen er c).
       forsoeg.indgreb: de knapper, eleven maa bruge ("+CO", "-CO2" ...).
       forsoeg.fyld: forsoeget er at fylde beholderen.
       forsoeg.mere: forsoeget er klaret, naar [H2] er steget (maal 5).
       =================================================================== */
    D.I_MAAL = [
        {
            id: "start", navn: "Kun reaktanter",
            opstil: { c: { CO: 0.20, H2O: 0.20, CO2: 0, H2: 0 }, tom: true },
            gaet: {
                intro: "En tom beholder fyldes med lige meget CO og H₂O. Der er ingen CO₂ og H₂ i den endnu.",
                tekst: "Hvilken vej går reaktionen?",
                svar: [
                    { t: "Mod højre", ok: true },
                    { t: "Mod venstre" },
                    { t: "Ingen vej" }
                ]
            },
            forsoeg: {
                fyld: true,
                om: ["fyld", "tallinje"],
                tekst: "Klik på Fyld beholderen, og følg Y på tallinjen under beholderen.",
                set: "Y begyndte i 0 og voksede, til Y = K. Der blev dannet CO₂ og H₂.",
                hint: [
                    "Knappen Fyld beholderen sidder på beholderen.",
                    "Klik på den gule knap Fyld beholderen.",
                    "Klik på Fyld beholderen, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Hvorfor gik reaktionen i beholderen mod højre?",
                svar: [
                    { t: "Y var mindre end K", ok: true },
                    { t: "Y var større end K",
                      f: "Uden CO₂ og H₂ står der 0 over brøkstregen, så Y = 0. Er 0 større end K = 4,0?" },
                    { t: "K var 0 fra start",
                      f: "K er 4,0 hele tiden. Det var Y, der var 0, fordi der ikke var noget CO₂ og H₂." }
                ],
                hint: [
                    "Se på tallinjen under beholderen: Hvor begyndte Y, og hvor står K?",
                    "CO₂ og H₂ står over brøkstregen. Uden dem er Y = 0.",
                    "Y = 0 er mindre end K = 4,0."
                ]
            },
            loest: "Uden produkt er Y = 0, altså mindre end K. Reaktionen går mod højre og danner CO₂ og H₂, indtil Y = K."
        },
        {
            id: "forMeget", navn: "For meget produkt",
            opstil: { c: { CO: 0.10, H2O: 0.10, CO2: 0.20, H2: 0.45 }, tom: true },
            gaet: {
                intro: "Beholderen fyldes med en blanding, hvor Y = 9,0. Ligevægtskonstanten er K = 4,0.",
                tekst: "Hvilken vej går reaktionen?",
                svar: [
                    { t: "Mod højre" },
                    { t: "Mod venstre", ok: true },
                    { t: "Ingen vej" }
                ]
            },
            forsoeg: {
                fyld: true,
                om: ["fyld", "tallinje"],
                tekst: "Klik på Fyld beholderen, og følg Y på tallinjen under beholderen.",
                set: "Y faldt fra 9,0 til 4,0. Der blev brugt CO₂ og H₂, og der blev dannet CO og H₂O.",
                hint: [
                    "Knappen Fyld beholderen sidder på beholderen.",
                    "Klik på den gule knap Fyld beholderen.",
                    "Klik på Fyld beholderen, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["panel"],
                tekst: "Hvad skete der med koncentrationen af H₂, mens reaktionen i beholderen gik mod venstre?",
                svar: [
                    { t: "[H₂] faldt", ok: true },
                    { t: "[H₂] steg",
                      f: "Mod venstre bliver H₂ brugt sammen med CO₂. Se [H₂] i panelet: fra start og nu." },
                    { t: "[H₂] ændrede sig ikke",
                      f: "Se [H₂] i panelet: fra start og nu." }
                ],
                hint: [
                    "H₂ står på højre side af reaktionspilen.",
                    "Når reaktionen går mod venstre, bliver stofferne på højre side brugt.",
                    "[H₂] faldt fra 0,45 M til 0,42 M."
                ]
            },
            loest: "Y > K betyder, at der er for meget produkt. Reaktionen går mod venstre og bruger CO₂ og H₂, indtil Y er faldet til K."
        },
        {
            id: "reaktant", navn: "Mere CO",
            opstil: { c: LIGEVAEGT, tom: false },
            gaet: {
                intro: "Beholderen er i ligevægt, så Y = K. Om lidt pumpes der mere CO ind i beholderen.",
                tekst: "Hvilken vej forskydes ligevægten?",
                svar: [
                    { t: "Mod højre", ok: true },
                    { t: "Mod venstre" },
                    { t: "Ingen vej" }
                ]
            },
            forsoeg: {
                indgreb: ["+CO"],
                om: ["+CO"],
                tekst: "Klik på + ved CO for at pumpe mere CO ind i beholderen. Følg Y på tallinjen.",
                set: "Y sprang ned under K og voksede så tilbage til K. Ligevægten blev forskudt mod højre.",
                hint: [
                    "Knapperne til højre for beholderen pumper et stof ind (+) eller fjerner det (−).",
                    "Find rækken med CO, og klik på +.",
                    "Klik på + ved CO, og vent, til Y står ved K igen."
                ]
            },
            spm: {
                om: ["formel"],
                tekst: "Hvorfor blev Y mindre end K, lige da der kom mere CO ind i beholderen?",
                svar: [
                    { t: "CO står under brøkstregen", ok: true },
                    { t: "CO står over brøkstregen",
                      f: "CO er en reaktant, og reaktanterne står under brøkstregen i Y." },
                    { t: "K blev større",
                      f: "K er 4,0 hele tiden. Kun en ny temperatur ændrer K." }
                ],
                hint: [
                    "Brøken Y står ved tallinjen. Hvor i brøken står [CO]?",
                    "Når tallet under brøkstregen bliver større, bliver brøken mindre.",
                    "CO står under brøkstregen."
                ]
            },
            loest: "CO står under brøkstregen. Mere CO gør Y mindre end K, og ligevægten forskydes mod højre, indtil Y = K igen."
        },
        {
            id: "produkt", navn: "Mere H₂",
            opstil: { c: LIGEVAEGT, tom: false },
            gaet: {
                intro: "Beholderen er i ligevægt, så Y = K. Om lidt pumpes der mere H₂ ind i beholderen.",
                tekst: "Hvilken vej forskydes ligevægten?",
                svar: [
                    { t: "Mod højre" },
                    { t: "Mod venstre", ok: true },
                    { t: "Ingen vej" }
                ]
            },
            forsoeg: {
                indgreb: ["+H2"],
                om: ["+H2"],
                tekst: "Klik på + ved H₂ for at pumpe mere H₂ ind i beholderen. Følg Y på tallinjen.",
                set: "Y sprang op over K, og ligevægten blev forskudt mod venstre. Panelet viser [H₂] før, lige efter og nu.",
                hint: [
                    "Knapperne til højre for beholderen pumper et stof ind (+) eller fjerner det (−).",
                    "Find rækken med H₂, og klik på +.",
                    "Klik på + ved H₂, og vent, til Y står ved K igen."
                ]
            },
            spm: {
                om: ["panel"],
                tekst: "Panelet viser [H₂] før indgrebet, lige efter og nu. Hvordan endte [H₂]?",
                svar: [
                    { t: "Mellem før og lige efter", ok: true },
                    { t: "Som før indgrebet",
                      f: "Se tallene ved H₂ i panelet. Ligevægten modvirker indgrebet, men ophæver det ikke helt." },
                    { t: "Højere end lige efter",
                      f: "Mod venstre bliver H₂ brugt. Kan [H₂] så stige efter indgrebet?" }
                ],
                hint: [
                    "Panelet viser [H₂] før indgrebet, lige efter og nu.",
                    "Ligevægten bruger noget af det H₂, der blev pumpet ind, men ikke det hele.",
                    "[H₂] faldt fra 0,30 M til 0,29 M, men er stadig højere end 0,20 M."
                ]
            },
            loest: "Ligevægten modvirker indgrebet ved at bruge noget af det H₂, der blev pumpet ind, men ophæver det ikke. Det er Le Chateliers princip."
        },
        {
            id: "mere", navn: "Mere H₂ uden H₂",
            opstil: { c: LIGEVAEGT, tom: false },
            forsoeg: {
                indgreb: ["+CO", "-CO", "+H2O", "-H2O", "+CO2", "-CO2", "+H2", "-H2"],
                mere: true,
                om: ["knapper"],
                tekst: "Lav et indgreb, så der bliver mere H₂ i beholderen. Du må ikke selv pumpe H₂ ind.",
                hint: [
                    "Der bliver dannet H₂, når ligevægten forskydes mod højre.",
                    "Tilsæt en reaktant, eller fjern et produkt, men ikke H₂.",
                    "Klik på + ved CO."
                ]
            },
            loest: "At tilsætte en reaktant og at fjerne et produkt forskyder begge ligevægten mod højre, så der bliver dannet H₂."
        }
    ];

    /* ===================================================================
       FANE 2: OXYGEN I BLODET
       opstil.sted: hvor blodet i luppen er fra start (lunge eller muskel).
       bjerg: lungerne er hoejt oppe i bjergene. loeb: musklen arbejder.
       forsoeg.handling: "lunge", "muskel", "loeb" eller "flere" (mere Hb).
       =================================================================== */
    D.B_MAAL = [
        {
            id: "lunge", navn: "I lungerne",
            opstil: { sted: "muskel" },
            gaet: {
                intro: "Blodet i luppen kommer fra en muskel. Nu løber det til lungerne, hvor der er meget oxygen.",
                tekst: "Hvad gør hæmoglobinet i lungerne?",
                svar: [
                    { t: "Det binder oxygen", ok: true },
                    { t: "Det afgiver oxygen" },
                    { t: "Ingenting" }
                ]
            },
            forsoeg: {
                handling: "lunge",
                om: ["lunge"],
                tekst: "Klik på lungerne, så blodet løber derhen. Følg Y på tallinjen.",
                set: "I lungerne steg [O₂]. Y blev mindre end K, og flere Hb bandt O₂.",
                hint: [
                    "Lungerne er tegnet til venstre i scenen.",
                    "Klik på lungerne.",
                    "Klik på lungerne, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["formel"],
                tekst: "Hvorfor blev Y mindre end K, da blodet kom til lungerne?",
                svar: [
                    { t: "[O₂] står under brøkstregen", ok: true },
                    { t: "[O₂] står over brøkstregen",
                      f: "O₂ er en reaktant, og reaktanterne står under brøkstregen: Y = [HbO₂] / ([Hb] · [O₂])." },
                    { t: "K blev større i lungerne",
                      f: "K afhænger kun af temperaturen, og den er den samme i hele kroppen." }
                ],
                hint: [
                    "Brøken Y står ved tallinjen. Hvor står [O₂]?",
                    "Når tallet under brøkstregen bliver større, bliver brøken mindre.",
                    "[O₂] står under brøkstregen."
                ]
            },
            loest: "[O₂] står under brøkstregen. Da [O₂] steg i lungerne, blev Y mindre end K, og ligevægten blev forskudt mod højre."
        },
        {
            id: "muskel", navn: "I musklen",
            opstil: { sted: "lunge" },
            gaet: {
                intro: "Blodet i luppen kommer fra lungerne. Nu løber det til en muskel, som bruger oxygen.",
                tekst: "Hvad gør hæmoglobinet i musklen?",
                svar: [
                    { t: "Det binder oxygen" },
                    { t: "Det afgiver oxygen", ok: true },
                    { t: "Ingenting" }
                ]
            },
            forsoeg: {
                handling: "muskel",
                om: ["muskel"],
                tekst: "Klik på musklen, så blodet løber derhen. Følg Y på tallinjen.",
                set: "I musklen faldt [O₂]. Y blev større end K, og nogle HbO₂ afgav O₂.",
                hint: [
                    "Musklen er tegnet til højre i scenen.",
                    "Klik på musklen.",
                    "Klik på musklen, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Hvilken vej blev ligevægten forskudt, da blodet kom til musklen?",
                svar: [
                    { t: "Mod højre",
                      f: "Mod højre bliver der dannet HbO₂. Blev der det i musklen?" },
                    { t: "Mod venstre", ok: true },
                    { t: "Den blev ikke forskudt",
                      f: "Y blev større end K. Så var blodet ikke i ligevægt, og reaktionen måtte gå en af vejene." }
                ],
                hint: [
                    "Lå Y til højre eller til venstre for K på tallinjen, da blodet kom til musklen?",
                    "Når Y er større end K, går reaktionen mod venstre.",
                    "HbO₂ blev til Hb og O₂: mod venstre."
                ]
            },
            loest: "Musklen bruger O₂, så [O₂] falder. Y bliver større end K, og ligevægten forskydes mod venstre: HbO₂ afgiver O₂ til musklen."
        },
        {
            id: "loeb", navn: "Musklen arbejder",
            opstil: { sted: "muskel" },
            gaet: {
                intro: "Når du løber, bruger musklen mere oxygen, så [O₂] i musklen falder endnu mere.",
                tekst: "Hvad gør hæmoglobinet i musklen?",
                svar: [
                    { t: "Det afgiver mere O₂", ok: true },
                    { t: "Det binder mere O₂" },
                    { t: "Ingen ændring" }
                ]
            },
            forsoeg: {
                handling: "loeb",
                om: ["loeb"],
                tekst: "Klik på knappen Løb ved musklen, og følg Y på tallinjen.",
                set: "[O₂] faldt, Y blev større end K, og flere HbO₂ afgav O₂.",
                hint: [
                    "Knappen Løb sidder ved musklen til højre i scenen.",
                    "Klik på knappen Løb.",
                    "Klik på Løb, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                tekst: "Hvordan modvirker ligevægten i blodet, at [O₂] i musklen falder?",
                svar: [
                    { t: "HbO₂ afgiver O₂", ok: true },
                    { t: "Hb binder mere O₂",
                      f: "Så ville [O₂] falde endnu mere. Ligevægten modvirker indgrebet." },
                    { t: "Musklen bruger mindre O₂",
                      f: "Det er musklen, der laver indgrebet. Spørgsmålet er, hvad ligevægten i blodet gør." }
                ],
                hint: [
                    "Le Chateliers princip: ligevægten forskydes, så indgrebet bliver modvirket.",
                    "Indgrebet er, at [O₂] falder. Hvad modvirker det?",
                    "Når HbO₂ afgiver O₂, bliver der dannet O₂."
                ]
            },
            loest: "Ligevægten modvirker, at [O₂] falder, ved at danne O₂: HbO₂ afgiver O₂. En muskel, der arbejder hårdt, får derfor mere oxygen."
        },
        {
            id: "bjerg", navn: "I bjergene",
            opstil: { sted: "muskel", bjerg: true },
            gaet: {
                intro: "Højt oppe i bjergene er der mindre oxygen i luften, så [O₂] i lungerne er lavere end ved havet.",
                tekst: "Hvor meget O₂ binder blodet i lungerne?",
                svar: [
                    { t: "Mindre end ved havet", ok: true },
                    { t: "Lige så meget som ved havet" },
                    { t: "Mere end ved havet" }
                ]
            },
            forsoeg: {
                handling: "lunge",
                om: ["lunge"],
                tekst: "Klik på lungerne, så blodet løber derhen. Tæl HbO₂ i luppen bagefter.",
                set: "I bjergene binder 9 af 12 Hb oxygen i lungerne. Ved havet er det 11 af 12.",
                hint: [
                    "Lungerne er tegnet til venstre i scenen, under bjergene.",
                    "Klik på lungerne.",
                    "Klik på lungerne, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                tekst: "Hvorfor binder blodet mindre O₂ i lungerne højt oppe i bjergene?",
                svar: [
                    { t: "[O₂] i lungerne er lavere", ok: true },
                    { t: "K er mindre i bjergene",
                      f: "K afhænger kun af temperaturen, og kroppen er lige varm ved havet og i bjergene." },
                    { t: "Der er mindre Hb i blodet",
                      f: "Der er stadig 12 Hb i luppen. Tæl dem." }
                ],
                hint: [
                    "Sammenlign [O₂] i lungerne ved havet og i bjergene.",
                    "Med mindre O₂ når blodet Y = K, før lige så mange Hb har bundet O₂.",
                    "Det er [O₂], der er lavere. K og antallet af Hb er de samme."
                ]
            },
            loest: "Med mindre O₂ i lungerne er Y = K nået, før lige så mange Hb har bundet O₂. Derfor bliver man hurtigt forpustet i bjergene."
        },
        {
            id: "flere", navn: "Højdetræning",
            opstil: { sted: "lunge", bjerg: true },
            gaet: {
                intro: "Efter nogle uger i bjergene har kroppen dannet flere røde blodlegemer og dermed mere Hb.",
                tekst: "Hvilken vej forskydes ligevægten?",
                svar: [
                    { t: "Mod højre", ok: true },
                    { t: "Mod venstre" },
                    { t: "Ingen vej" }
                ]
            },
            forsoeg: {
                handling: "flere",
                om: ["flere"],
                tekst: "Klik på knappen Mere Hb under lungerne, og tæl HbO₂ i luppen bagefter.",
                set: "Nu binder 12 Hb oxygen i lungerne. Ved havet var det 11, så blodet bærer mere O₂ end før.",
                hint: [
                    "Knappen Mere Hb sidder under lungerne til venstre i scenen.",
                    "Klik på knappen Mere Hb.",
                    "Klik på Mere Hb, og vent, til Y står ved K på tallinjen."
                ]
            },
            spm: {
                tekst: "Hvorfor bærer blodet nu mere oxygen?",
                svar: [
                    { t: "Hb er en reaktant, der blev tilsat", ok: true },
                    { t: "K blev større",
                      f: "K afhænger kun af temperaturen, og den er den samme som før." },
                    { t: "Luften fik mere O₂",
                      f: "Luften i bjergene har stadig lige så lidt O₂. Det er blodet, der har ændret sig." }
                ],
                hint: [
                    "Hb står under brøkstregen i Y.",
                    "Mere Hb gør Y mindre end K.",
                    "Ligevægten forskydes mod højre, og der bliver dannet mere HbO₂."
                ]
            },
            loest: "Mere Hb gør Y mindre end K, så ligevægten forskydes mod højre, og der dannes mere HbO₂. Derfor træner nogle løbere i bjergene."
        }
    ];

    /* ===================================================================
       FANE 3: REGN PÅ Y
       D.REAK: reaktionerne. over og under: stofferne i broeken (s er
       noeglen i c, f formlen, n koefficienten). K og Ktekst: konstanten med
       enhed. enhed: Y's enhed ("" uden enhed).
       Et maal: r (reaktionen), c (koncentrationerne fra start), efter
       (koncentrationerne efter forsoeget), Y (svaret), og delene.
       =================================================================== */
    D.REAK = {
        co: {
            skema: "CO(g) + H₂O(g) ⇌ CO₂(g) + H₂(g)",
            over: [{ s: "CO2", f: "CO₂", n: 1 }, { s: "H2", f: "H₂", n: 1 }],
            under: [{ s: "CO", f: "CO", n: 1 }, { s: "H2O", f: "H₂O", n: 1 }],
            K: 4.0, Ktekst: "4,0", enhed: ""
        },
        no2: {
            skema: "N₂O₄(g) ⇌ 2 NO₂(g)",
            over: [{ s: "NO2", f: "NO₂", n: 2 }],
            under: [{ s: "N2O4", f: "N₂O₄", n: 1 }],
            K: 0.20, Ktekst: "0,20 M", enhed: "M"
        },
        ester: {
            skema: "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O",
            over: [{ s: "est", f: "CH₃COOC₂H₅", n: 1 }, { s: "vand", f: "H₂O", n: 1 }],
            under: [{ s: "syre", f: "CH₃COOH", n: 1 }, { s: "alk", f: "C₂H₅OH", n: 1 }],
            K: 4.0, Ktekst: "4,0", enhed: ""
        },
        salmiak: {
            skema: "NH₄Cl(s) ⇌ NH₃(g) + HCl(g)",
            over: [{ s: "NH3", f: "NH₃", n: 1 }, { s: "HCl", f: "HCl", n: 1 }],
            under: [],
            K: 1.0e-4, Ktekst: "1,0 · 10⁻⁴ M²", enhed: "M²"
        }
    };

    var B = D.brok;
    var RETNING = [
        { t: "Mod højre, fordi Y < K" },
        { t: "Mod venstre, fordi Y > K" },
        { t: "Ingen vej, fordi Y = K" }
    ];
    /* De tre svar om retningen; ok er det rigtige, f er forklaringerne til
       de to forkerte */
    function retning(ok, tekst, f) {
        return RETNING.map(function (r, j) {
            return j === ok ? { t: r.t, ok: true } : { t: r.t, f: f[j] };
        });
    }

    var FELT_HINT_CO = [
        "Find [CO₂] i oplysningerne på tavlen, og skriv tallet i feltet under [CO₂].",
        "Gør det samme med de tre andre felter. Enheden M står allerede efter feltet.",
        "Over brøkstregen 0,10 og 0,10, under 0,20 og 0,10. Det giver Y = 0,50."
    ];

    D.R_MAAL = [
        {
            id: "co", navn: "CO og vanddamp",
            r: "co", c: { CO: 0.20, H2O: 0.10, CO2: 0.10, H2: 0.10 }, Y: 0.50,
            brok: {
                tekst: "Hvilken reaktionsbrøk hører til reaktionen på tavlen?",
                svar: [
                    { t: "[CO₂] · [H₂] / ([CO] · [H₂O])", h: B("[CO₂] · [H₂]", "[CO] · [H₂O]"), ok: true },
                    { t: "[CO] · [H₂O] / ([CO₂] · [H₂])", h: B("[CO] · [H₂O]", "[CO₂] · [H₂]"),
                      f: "Brøken er vendt. Produkterne står over brøkstregen og reaktanterne under." },
                    { t: "([CO₂] + [H₂]) / ([CO] + [H₂O])", h: B("[CO₂] + [H₂]", "[CO] + [H₂O]"),
                      f: "Koncentrationerne i Y skal ganges med hinanden, ikke lægges sammen." }
                ],
                hint: [
                    "Produkterne står over brøkstregen, reaktanterne under.",
                    "CO₂ og H₂ er produkterne. Koncentrationerne ganges med hinanden.",
                    "Y = [CO₂] · [H₂] / ([CO] · [H₂O])."
                ],
                godt: "Produkterne CO₂ og H₂ står over brøkstregen, reaktanterne CO og H₂O under."
            },
            felter: {
                tekst: "Skriv koncentrationerne fra tavlen ind i brøken, og regn Y ud.",
                hint: FELT_HINT_CO
            },
            spm: {
                om: ["tallinje"],
                tekst: "Y = 0,50 og K = 4,0. Hvilken vej går reaktionen?",
                svar: retning(0, "", [null,
                    "0,50 er mindre end 4,0. Se, hvor Y står på tallinjen i forhold til K.",
                    "0,50 er ikke lig med 4,0, så blandingen er ikke i ligevægt."]),
                hint: [
                    "Sammenlign de to tal: Er 0,50 mindre eller større end 4,0?",
                    "Er Y mindre end K, er der for lidt produkt.",
                    "Y < K, så reaktionen går mod højre."
                ]
            },
            loest: "Y = 0,50 er mindre end K = 4,0. Der er for lidt produkt, så reaktionen går mod højre, indtil Y = K."
        },
        {
            id: "no2", navn: "N₂O₄ og NO₂",
            r: "no2", c: { N2O4: 0.050, NO2: 0.20 }, Y: 0.80,
            brok: {
                tekst: "Hvilken reaktionsbrøk hører til reaktionen på tavlen?",
                svar: [
                    { t: "2 · [NO₂] / [N₂O₄]", h: B("2 · [NO₂]", "[N₂O₄]"),
                      f: "Koefficienten 2 bliver ikke en faktor. Den bliver en eksponent: [NO₂]²." },
                    { t: "[NO₂]² / [N₂O₄]", h: B("[NO₂]²", "[N₂O₄]"), ok: true },
                    { t: "[NO₂] / [N₂O₄]", h: B("[NO₂]", "[N₂O₄]"),
                      f: "Koefficienten 2 foran NO₂ skal med i brøken som en eksponent." }
                ],
                hint: [
                    "NO₂ er produktet og står over brøkstregen.",
                    "Koefficienten 2 foran NO₂ bliver en eksponent.",
                    "Y = [NO₂]² / [N₂O₄]."
                ],
                godt: "Koefficienten 2 foran NO₂ bliver eksponenten i [NO₂]²."
            },
            felter: {
                tekst: "Skriv koncentrationerne fra tavlen ind i brøken, og regn Y ud med enhed.",
                hint: [
                    "Skriv [NO₂] i feltet over brøkstregen og [N₂O₄] i feltet under.",
                    "[NO₂] står i anden: (0,20 M)² = 0,040 M².",
                    "Y = 0,040 M² / 0,050 M = 0,80 M."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Y = 0,80 M og K = 0,20 M. Hvilken vej går reaktionen?",
                svar: retning(1, "", [
                    "0,80 M er større end 0,20 M. Se, hvor Y står på tallinjen i forhold til K.",
                    null,
                    "0,80 M er ikke lig med 0,20 M, så blandingen er ikke i ligevægt."]),
                hint: [
                    "Sammenlign de to tal: Er 0,80 M mindre eller større end 0,20 M?",
                    "Er Y større end K, er der for meget produkt.",
                    "Y > K, så reaktionen går mod venstre."
                ]
            },
            loest: "Y = 0,80 M er større end K = 0,20 M. Der er for meget NO₂, så reaktionen går mod venstre og danner N₂O₄."
        },
        {
            id: "ester", navn: "Esteren",
            r: "ester", c: { syre: 0.50, alk: 0.50, est: 1.0, vand: 1.0 }, Y: 4.0,
            brok: {
                tekst: "Stofferne på tavlen er væsker, der er blandet med hinanden. Hvilken reaktionsbrøk hører til?",
                svar: [
                    { t: "[CH₃COOC₂H₅] / ([CH₃COOH] · [C₂H₅OH])", h: B("[CH₃COOC₂H₅]", "[CH₃COOH] · [C₂H₅OH]"),
                      f: "Vand er her ikke et opløsningsmiddel, men et af de stoffer, der er blandet. Så er H₂O med." },
                    { t: "[CH₃COOH] · [C₂H₅OH] / ([CH₃COOC₂H₅] · [H₂O])", h: B("[CH₃COOH] · [C₂H₅OH]", "[CH₃COOC₂H₅] · [H₂O]"),
                      f: "Brøken er vendt. Produkterne står over brøkstregen." },
                    { t: "[CH₃COOC₂H₅] · [H₂O] / ([CH₃COOH] · [C₂H₅OH])", h: B("[CH₃COOC₂H₅] · [H₂O]", "[CH₃COOH] · [C₂H₅OH]"), ok: true }
                ],
                hint: [
                    "Esteren og vand er produkterne og står over brøkstregen.",
                    "Væsker, der er blandet med hinanden, er alle med i brøken. Også vand.",
                    "Y = [CH₃COOC₂H₅] · [H₂O] / ([CH₃COOH] · [C₂H₅OH])."
                ],
                godt: "De fire væsker er blandet med hinanden, så de er alle med i brøken, også vand."
            },
            felter: {
                tekst: "Skriv koncentrationerne fra tavlen ind i brøken, og regn Y ud.",
                hint: [
                    "Skriv [CH₃COOC₂H₅] og [H₂O] i felterne over brøkstregen.",
                    "Over brøkstregen 1,0 og 1,0, under 0,50 og 0,50.",
                    "Y = 1,0 M · 1,0 M / (0,50 M · 0,50 M) = 4,0."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Y = 4,0 og K = 4,0. Hvilken vej går reaktionen?",
                svar: retning(2, "", [
                    "Y er ikke mindre end K. Se, hvor Y står på tallinjen.",
                    "Y er ikke større end K. Se, hvor Y står på tallinjen.",
                    null]),
                hint: [
                    "Sammenlign de to tal.",
                    "Når Y = K, er blandingen i ligevægt.",
                    "Koncentrationerne ændrer sig ikke: ingen vej."
                ]
            },
            loest: "Y = K, så blandingen er i ligevægt. Koncentrationerne ændrer sig ikke, selv om begge reaktioner forløber hele tiden."
        },
        {
            id: "indgreb", navn: "Mere N₂O₄",
            r: "no2", givet: true,
            c: { N2O4: 0.050, NO2: 0.10 }, efter: { N2O4: 0.10, NO2: 0.10 }, Y: 0.10,
            forsoeg: {
                pump: "N2O4",
                om: ["pump"],
                tekst: "Blandingen på tavlen er i ligevægt. Klik på Pump N₂O₄ ind, så [N₂O₄] stiger til 0,10 M.",
                hint: [
                    "Knappen Pump N₂O₄ ind står på tavlen.",
                    "Klik på knappen Pump N₂O₄ ind.",
                    "Klik på Pump N₂O₄ ind."
                ]
            },
            felter: {
                tekst: "Regn Y ud lige efter indgrebet. Brug tallene efter indgrebet på tavlen.",
                hint: [
                    "[N₂O₄] er nu 0,10 M. [NO₂] er stadig 0,10 M.",
                    "[NO₂] står i anden: (0,10 M)² = 0,010 M².",
                    "Y = 0,010 M² / 0,10 M = 0,10 M."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Lige efter indgrebet er Y = 0,10 M og K = 0,20 M. Hvilken vej forskydes ligevægten?",
                svar: retning(0, "", [null,
                    "0,10 M er mindre end 0,20 M. Se, hvor Y står på tallinjen i forhold til K.",
                    "Lige efter indgrebet er Y ikke lig med K."]),
                hint: [
                    "Sammenlign de to tal: Er 0,10 M mindre eller større end 0,20 M?",
                    "N₂O₄ står under brøkstregen. Mere N₂O₄ gør Y mindre.",
                    "Y < K, så ligevægten forskydes mod højre."
                ]
            },
            loest: "Y blev mindre end K, så ligevægten forskydes mod højre. Noget af den tilsatte N₂O₄ bliver til NO₂: indgrebet bliver modvirket."
        },
        {
            id: "salmiak", navn: "Salmiak",
            r: "salmiak",
            c: { NH3: 0.010, HCl: 0.010 }, efter: { NH3: 0.030, HCl: 0.010 }, Y: 3.0e-4,
            brok: {
                tekst: "Salmiak, NH₄Cl, er et fast stof. Hvilken reaktionsbrøk hører til reaktionen på tavlen?",
                svar: [
                    { t: "[NH₃] · [HCl] / [NH₄Cl]", h: B("[NH₃] · [HCl]", "[NH₄Cl]"),
                      f: "NH₄Cl er et fast stof. Faste stoffer er ikke med i reaktionsbrøken." },
                    { t: "[NH₄Cl] / ([NH₃] · [HCl])", h: B("[NH₄Cl]", "[NH₃] · [HCl]"),
                      f: "Brøken er vendt, og NH₄Cl er et fast stof, som ikke er med i reaktionsbrøken." },
                    { t: "[NH₃] · [HCl]", h: B("[NH₃] · [HCl]", ""), ok: true }
                ],
                hint: [
                    "Faste stoffer er ikke med i reaktionsbrøken.",
                    "NH₃ og HCl er produkterne. Der er intet under brøkstregen.",
                    "Y = [NH₃] · [HCl]."
                ],
                godt: "NH₄Cl er et fast stof og er ikke med i brøken. Der står intet under brøkstregen."
            },
            forsoeg: {
                pump: "NH3",
                om: ["pump"],
                tekst: "Blandingen på tavlen er i ligevægt. Klik på Pump NH₃ ind, så [NH₃] stiger til 0,030 M.",
                hint: [
                    "Knappen Pump NH₃ ind står på tavlen.",
                    "Klik på knappen Pump NH₃ ind.",
                    "Klik på Pump NH₃ ind."
                ]
            },
            felter: {
                tekst: "Regn Y ud lige efter indgrebet, og skriv enheden med.",
                hint: [
                    "[NH₃] er nu 0,030 M. [HCl] er stadig 0,010 M.",
                    "Y = [NH₃] · [HCl]. Enheden bliver M · M = M².",
                    "Y = 0,030 M · 0,010 M = 3,0 · 10⁻⁴ M²."
                ]
            },
            spm: {
                om: ["tallinje"],
                tekst: "Y = 3,0 · 10⁻⁴ M² og K = 1,0 · 10⁻⁴ M². Hvilken vej forskydes ligevægten?",
                svar: retning(1, "", [
                    "3,0 · 10⁻⁴ er større end 1,0 · 10⁻⁴. Se tallinjen.",
                    null,
                    "Lige efter indgrebet er Y ikke lig med K."]),
                hint: [
                    "Sammenlign tallene foran 10⁻⁴: 3,0 og 1,0.",
                    "Y er større end K.",
                    "Y > K, så ligevægten forskydes mod venstre, og der dannes fast NH₄Cl."
                ],
                godt: "Y > K, så NH₃ og HCl reagerer og danner fast NH₄Cl, indtil Y = K igen."
            },
            spm2: {
                tekst: "Hvad ville der ske, hvis man i stedet kom mere fast NH₄Cl i beholderen?",
                svar: [
                    { t: "Ligevægten forskydes mod højre",
                      f: "NH₄Cl er et fast stof og er ikke med i Y. Ændrer Y sig så, når der kommer mere NH₄Cl?" },
                    { t: "Ingenting, NH₄Cl er ikke i Y", ok: true },
                    { t: "Ligevægten forskydes mod venstre",
                      f: "NH₄Cl er et fast stof og er ikke med i Y. Ændrer Y sig så, når der kommer mere NH₄Cl?" }
                ],
                hint: [
                    "Se på reaktionsbrøken på tavlen. Er NH₄Cl med?",
                    "Et indgreb, der ikke ændrer Y, forskyder ikke ligevægten.",
                    "Ingenting sker."
                ]
            },
            loest: "Mere NH₃ gør Y større end K, så der dannes fast NH₄Cl. Mere fast NH₄Cl ændrer ikke Y og forskyder derfor ikke ligevægten."
        }
    ];

    /* Det, der staar efter forklaringen, naar alle fanens maal er loest */
    D.FAERDIG = {
        i: "Alle fem opgaver i beholderen er løst.",
        b: "Alle fem opgaver om blodet er løst.",
        r: "Alle fem regneopgaver er løst."
    };

    /* Et klik paa en partikel eller et maerke i signaturen */
    D.partikel = function (s) {
        var T = {
            CO: "CO, carbonmonoxid: en reaktant. [CO] står under brøkstregen i Y.",
            H2O: "H₂O, vanddamp: en reaktant. [H₂O] står under brøkstregen i Y.",
            CO2: "CO₂, carbondioxid: et produkt. [CO₂] står over brøkstregen i Y.",
            H2: "H₂, hydrogen: et produkt. [H₂] står over brøkstregen i Y.",
            Hb: "Hb: hæmoglobin uden oxygen, mørkerødt. En reaktant, så [Hb] står under brøkstregen.",
            O2: "O₂: oxygen, opløst i blodet. En reaktant, så [O₂] står under brøkstregen.",
            HbO2: "HbO₂: hæmoglobin med oxygen, lysere rødt. Produktet, så [HbO₂] står over brøkstregen."
        };
        return T[s] || "";
    };

    NK.Data = D;
}());

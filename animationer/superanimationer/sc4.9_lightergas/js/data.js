/* =====================================================================
   data.js - tallene, opgaverne og replikkerne

   Alt, en laerer kan have lyst til at rette i, staar her: atommasserne
   og alkanerne, molvolumenet, lighteren (masse, gas, ventil), karret og
   maaleglasset, opgaverne paa de tre faner, de seks fejlkilder og det,
   Kemichael siger, naar forsoeget gaar helt galt. Kemien regnes i
   kemi.js; tegningen kender kun resultatet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atommasserne i hundrededele (som sc4.1) ----------------------------- */
    D.ATOMMASSE = { H: 101, C: 1201 };

    /* De fem foerste alkaner, CₙH₂ₙ₊₂. M i hundrededele: CH₄ 16,05,
       C₂H₆ 30,08, C₃H₈ 44,11, C₄H₁₀ 58,14 og C₅H₁₂ 72,17 g/mol. */
    var NAVNE = ["methan", "ethan", "propan", "butan", "pentan"];
    D.ALKANER = NAVNE.map(function (navn, i) {
        var n = i + 1, h = 2 * n + 2;
        return { n: n, navn: navn, formel: "C" + (n > 1 ? n : "") + "H" + h,
                 M: n * D.ATOMMASSE.C + h * D.ATOMMASSE.H };
    });
    /* Lightergas er butan (i virkeligheden butan og isobutan, der har
       samme molarmasse) */
    D.LIGHTERGAS = 3;

    /* ----- Gassen ---------------------------------------------------------------
       1 mol gas fylder 24,0 L ved 20 °C og 1,013 bar (som sc4.6:
       R · T / p = 0,0831 · 293 / 1,013). Ved en anden temperatur fylder
       den i forhold til den absolutte temperatur. */
    D.VM = 24.0;
    D.T0 = 20;
    D.VM_TEKST = "24,0 L/mol";

    /* ----- Lighteren ---------------------------------------------------------------
       Masserne (g) med gassen i. Der er 3,4 g flydende butan i hver. */
    D.LIGHTERE = [17.84, 18.21, 16.97, 18.52, 17.36, 16.68];
    D.GAS_I = 3.4;
    D.TANK = 4.4;                /* g butan, en fuld tank kan rumme (til tegningen) */
    D.HAETTE = 0.62;             /* g: haetten vejer med, naar den sidder paa */

    /* Ventilen: pinden staar mellem − (0) og + (1), og fabrikken har sat
       den paa midten. Med haetten af kan pinden loeftes af taenderne og
       saettes tilbage, saa ventilen aabner mere, end fabrikken tillader
       (den klassiske tuning). Aabningen er pindens plads plus det, der er
       vundet ved at loefte den. */
    D.PIND_START = 0.5;
    D.AABEN_MAKS = 4;
    D.TUNET = 1.2;               /* over dette er lighteren tunet */

    /* Gas pr. sekund (mL ved 20 °C) ved aabningen a. Tiden er trykket
       sammen: 150 mL tager 6 s med fabrikkens indstilling. */
    D.flow = function (a) {
        return a <= 1 ? 8 + 32 * a : 40 + 45 * (a - 1);
    };
    /* Kommer gassen hurtigere end 45 mL/s, bliver boblerne store og
       brede, og en del stiger op ved siden af maaleglasset. */
    D.FANG = { graense: 45, pr: 260, maks: 0.45 };

    /* En tunet lighter under vand: naar knappen slippes, er der 20 %
       sandsynlighed for, at ventilen suger vand ind. Der rulles én gang
       pr. gang, lighteren er nede i vandet. */
    D.VAND_SANDS = 0.2;
    D.VAND_IND = [0.38, 0.62];   /* g vand, der kommer ind */

    /* Vand paa ydersiden, naar lighteren kommer op af karret, og hvor
       laenge den skal ligge paa papiret */
    D.FILM = [0.09, 0.15];
    D.TOER_TID = 0.9;

    /* Gas, der slipper ud i luften, lægger sig paa bordet (butan er
       tungere end luft) og bliver langsomt blandet ud. Er der mere end
       grænsen, naar der kommer en gnist, antaendes det hele. */
    D.SKY = { halvering: 7, graense: 30 };

    /* ----- Maaleglasset ----------------------------------------------------------- */
    D.MAALEGLAS = { maks: 250, kap: 276, streg: 2 };
    D.V_MIN = 60;                /* mL, foer der er nok til at maale paa */
    D.V_GOD = 150;

    /* ----- Fane 1: forsoeget ------------------------------------------------------- */
    D.FORSOEG = [
        { id: "m1", titel: "Måling 1", gaet: true,
          tekst: "Vej lighteren, saml gassen i måleglasset, og vej lighteren igen.",
          efter: "Lighteren blev lettere med præcis den gas, der er i måleglasset. Regn på det på fanen Beregningen." },
        { id: "m2", titel: "Måling 2",
          tekst: "En ny lighter og et måleglas fyldt med vand. Gør det samme igen.",
          efter: "To målinger. Regn dem ud på fanen Beregningen." }
    ];

    /* Gaettet i maaling 1, naar rumfanget staar i skemaet */
    D.GAET = {
        spm: "Gassen i måleglasset fylder {V} mL. Hvor meget lettere er lighteren blevet?",
        hint: "1 L luft vejer ca. 1,2 g. Butan er tungere end luft, men der er kun {V} mL.",
        lav: "Gas er let, men ikke vægtløs. {V} mL butan vejer {m} g.",
        hoej: "Så meget er der ikke. Lighteren blev {m} g lettere."
    };

    /* Linjen i opgavekortet i hver fase af en maaling */
    D.LINJE = {
        foer: "Træk lighteren op på vægten.",
        foerVaegt: "Tryk på Aflæs vægten, så står m(før) i skemaet.",
        saenk: "Træk lighteren ned i vandet under måleglasset.",
        gas: "Hold musen nede på lighteren, så gassen bobler op i måleglasset. Slip ved ca. 150 mL.",
        aflaes: "Aflæs rumfanget i luppen, og skriv V i skemaet.",
        gaet: "Gæt først: vælg et af svarene herunder.",
        op: "Tag lighteren op af vandet, tør den på papiret, og stil den på vægten.",
        toer: "Lighteren er våd. Tør den på papiret, før den vejes.",
        efter: "Tryk på Aflæs vægten, så står m(efter) i skemaet."
    };

    D.HINT = {
        foer: "Træk lighteren hen på vægten, og tryk på Aflæs vægten under skemaet. Du kan også skrive tallet fra displayet selv.",
        saenk: "Slip lighteren i vandet lige under måleglassets åbning. Stedet lyser op, mens du holder den.",
        gas: "Tryk på lighteren, og hold musen nede. Mellemrumstasten virker også.",
        aflaes: "Luppen viser måleglasset ved vandet. Læs ud for bunden af den buede vandoverflade. Hver streg er 2 mL.",
        op: "Træk lighteren op af vandet og hen på papiret. Den er tør, når dråberne er væk.",
        efter: "Tryk på Aflæs vægten under skemaet, eller skriv tallet fra displayet."
    };

    D.SVAR = {
        foer: "Vægten viser {m} g.",
        saenk: "Lighteren står under måleglasset.",
        gas: "Gassen bobler op, til der er ca. 150 mL.",
        aflaes: "Måleglasset viser {V} mL.",
        op: "Lighteren er tør og står på vægten.",
        efter: "Vægten viser {m} g."
    };

    /* Eksempler, hvis eleven ikke har maalt selv (samme model) */
    D.EKSEMPEL = [{ mf: 17.84, V: 150, me: 17.48 }, { mf: 18.21, V: 176, me: 17.78 }];

    /* ----- Fane 2: beregningen -------------------------------------------------------
       Maaling 1 og 2 kommer fra fane 1 (eller fra D.EKSEMPEL). I maaling 2
       staar formlerne der allerede. Den sidste opgave er en ukendt alkan
       fra en gasdaase; Nye tal skifter gas. Tallene er valgt, saa
       svaret ligger taet paa én alkan. */
    D.BEREGNING = [
        { id: "m1", titel: "Måling 1", maaling: 0 },
        { id: "m2", titel: "Måling 2", maaling: 1, kunTal: true },
        { id: "ukendt", titel: "En ukendt gas", ukendt: true,
          tal: [{ mf: 245.62, V: 180, me: 245.29 }, { mf: 312.58, V: 240, me: 312.42 },
                { mf: 287.31, V: 200, me: 287.06 }, { mf: 198.75, V: 160, me: 198.36 }] }
    ];

    D.TRIN_ID = ["dm", "n", "M"];

    /* navn: raekkens overskrift. venstre: det, der staar foran feltet.
       formel: det, der staar paa tavlen. Hintet til formlen siger, hvad
       man kender, ikke formlen. */
    D.TRIN = {
        dm: { navn: "Massen af gassen", venstre: "m(gas)", enhed: "g", formel: "m(før) − m(efter)",
              formelHint: "Beholderen tabte masse, fordi gassen forlod den. Hvad vejede den før, og hvad vejede den efter?" },
        n: { navn: "Stofmængden af gassen", venstre: "n(gas)", enhed: "mol", formel: "V / Vₘ",
             formelHint: "Du kender gassens rumfang, og tavlen siger, hvor meget 1 mol gas fylder." },
        M: { navn: "Molarmassen", venstre: "M(gas)", enhed: "g/mol", formel: "m(gas) / n(gas)",
             formelHint: "Molarmassen er massen af 1 mol. Du kender massen og stofmængden." }
    };

    D.ALKAN_LINJE = "Hvilken alkan er det? Klik på søjlen, der passer.";
    D.ALKAN_HINT = "Find den søjle, hvis molarmasse ligger tættest på den stiplede linje.";

    /* ----- Fane 3: fejlkilderne --------------------------------------------------------
       Gruppe A goer det rigtigt: toer lighter, alle bobler i
       maaleglasset, maaleglasset fyldt helt med vand og 20 °C. De slipper
       150 mL ud. Gruppe B goer én ting anderledes (B). rigtig: hvordan
       B's molarmasse bliver. fejl: forklaringen til de to forkerte gaet. */
    D.FEJL_SPM = "Hvordan bliver gruppe B's molarmasse i forhold til gruppe A's?";
    D.FEJL_SVAR = [{ id: "hoejere", t: "Højere" }, { id: "lavere", t: "Lavere" }, { id: "samme", t: "Det samme" }];
    D.FEJL_A = "Gruppe A gør det rigtigt: tør lighter, alle bobler i måleglasset, glasset fyldt helt med vand og 20 °C.";
    D.FEJL_START = { mf: 17.84, V: 150, t: 20 };

    D.FEJL = [
        { id: "vaad", titel: "Våd lighter", kort: "vejer den våd", rigtig: "lavere", B: { film: 0.12 },
          tekst: "Gruppe B tørrer ikke lighteren, før den vejes anden gang. Der sidder 0,12 g vand på den.",
          hint: "Vandet vejer med i m(efter). Hvad sker der med m(gas)?",
          forkl: "Vandet vejer med i m(efter), så lighteren ser ud til at have tabt mindre gas. m(gas) bliver for lille, og det gør molarmassen også.",
          fejl: { hoejere: "Vandet gør m(efter) større. Forskellen m(før) − m(efter) bliver mindre.",
                  samme: "Vægten kan ikke se forskel på vand og lighter. Vandet tæller med i m(efter)." } },
        { id: "taendt", titel: "Tændt lighter", kort: "tænder den først", rigtig: "hoejere", B: { flamme: 0.06 },
          tekst: "Gruppe B vejer lighteren og tænder den så et par sekunder for at se, om den virker. Så samler de gassen.",
          hint: "Den gas, der brændte, forlod lighteren. Kom den i måleglasset?",
          forkl: "Lighteren tabte også den gas, der brændte, men den kom aldrig i måleglasset. m(gas) er for stor i forhold til V, så molarmassen bliver for høj.",
          fejl: { lavere: "Der forsvinder mere masse, ikke mindre. Rumfanget i måleglasset er det samme.",
                  samme: "Den gas, der brændte, vejede også noget. Den er med i m(gas), men ikke i V." } },
        { id: "forbi", titel: "Bobler ved siden af", kort: "bobler slipper forbi", rigtig: "hoejere", B: { forbi: 1 / 6 },
          tekst: "Gruppe B holder lighteren skævt. Hver sjette boble stiger op ved siden af måleglasset.",
          hint: "Lighteren taber gassen uanset hvad. Men hvad måler måleglasset?",
          forkl: "Lighteren tabte al gassen, men kun en del kom i måleglasset. V er for lille, så n bliver for lille, og molarmassen bliver for høj.",
          fejl: { lavere: "V bliver mindre, og så bliver n mindre. At dele med et mindre tal giver en større molarmasse.",
                  samme: "Vægten ser al gassen forsvinde, men måleglasset får kun en del af den." } },
        { id: "luft", titel: "Luft i måleglasset", kort: "luft fra start", rigtig: "lavere", B: { luft: 12 },
          tekst: "Gruppe B fyldte ikke måleglasset helt med vand. Der var 12 mL luft i toppen, før de begyndte.",
          hint: "Luften fylder med i det, de aflæser. Hvad sker der med V?",
          forkl: "Luften fylder med i måleglasset, så V bliver for stor. Så bliver n for stor, og molarmassen bliver for lav.",
          fejl: { hoejere: "V bliver større, og så bliver n større. At dele med et større tal giver en mindre molarmasse.",
                  samme: "Luften var der før gassen, og den fylder med i aflæsningen." } },
        { id: "dobbelt", titel: "Dobbelt så meget gas", kort: "300 mL gas", rigtig: "samme", B: { V: 300 },
          tekst: "Gruppe B bruger et måleglas på 500 mL og slipper 300 mL gas ud i stedet for 150 mL.",
          hint: "Hvad sker der med m(gas), når V bliver dobbelt så stort?",
          forkl: "Dobbelt så meget gas vejer dobbelt så meget. Massen og stofmængden vokser lige meget, så molarmassen er den samme. Den bliver bare lidt mere præcis.",
          fejl: { hoejere: "Massen bliver dobbelt så stor, men det gør stofmængden også.",
                  lavere: "Stofmængden bliver dobbelt så stor, men det gør massen også." } },
        { id: "varm", titel: "Varmt lokale", kort: "30 °C i lokalet", rigtig: "lavere", B: { t: 30 },
          tekst: "Det er 30 °C i lokalet, da gruppe B laver forsøget. De regner stadig med 24,0 L/mol.",
          hint: "Fylder en gas mere eller mindre, når den er varm?",
          forkl: "Varm gas fylder mere. Den samme gas fylder ca. 3 % mere ved 30 °C, men gruppen deler stadig med 24,0 L/mol. n bliver for stor, og molarmassen bliver lidt for lav.",
          fejl: { hoejere: "Gassen fylder mere, når den er varm. Et større V giver et større n og en mindre molarmasse.",
                  samme: "24,0 L/mol gælder ved 20 °C. Ved 30 °C fylder 1 mol mere." } }
    ];

    /* ----- Linjen og rosen ------------------------------------------------------------ */
    D.INTRO = {
        forsoeg: "Gassen fra en lighter vejes og måles.",
        beregning: "Massen og rumfanget giver molarmassen.",
        fejl: "To grupper laver forsøget. Gruppe B gør én ting anderledes."
    };
    D.FAERDIG = {
        forsoeg: "Begge målinger er i skemaet.",
        beregning: "Alle tre. Molarmassen afslører gassen.",
        fejl: "Alle seks. Vægten og måleglasset skal se den samme gas."
    };
    D.ROS = ["Rigtigt.", "Den sidder.", "Godt regnet.", "Præcis.", "Ja.", "Fint."];
    D.ROS_OPGAVE = ["Opgaven er løst.", "Færdig.", "Den er i hus.", "Løst."];

    /* ----- Kemichael ---------------------------------------------------------------------
       Han praesenterer ikke. Han kommer kun, naar forsoeget gaar helt galt
       (brugerens valg 27. sept. 2026), siger én tør replik og gaar igen.
       Hoejst ca. 60 tegn. Ingen teori, og sarkasmen rammer handlingen. */
    D.PAATALE = {
        stik: [
            "Lighteren skal vejes. Den er ikke et svejseapparat.",
            "Den flamme kommer ikke med i beregningen.",
            "Tunede lightere hører til på knallerter. Knap nok dér.",
            "Fabrikken havde en grund til den pind."
        ],
        vand: [
            "Nu er der vand i lighteren. Den vejer mere, ikke mindre.",
            "En tunet ventil lukker ikke tæt. Vandet fandt vej ind.",
            "Den lighter har drukket. Vægten opdager det.",
            "Vand i butan. Det bliver en sjov molarmasse."
        ],
        wush: [
            "Butan er tungere end luft. Den lå og ventede på bordet.",
            "Gassen på bordet var der stadig. Nu er den brugt.",
            "Gas på bordet og en gnist. Det står i regnskabet."
        ],
        forfra: [
            "Start forfra. Det går hurtigere end at forklare det.",
            "Det forsøg er slut. Knappen står i hjørnet.",
            "En ny lighter er billigere end en ny rapport."
        ]
    };

    NK.Data = D;
}());

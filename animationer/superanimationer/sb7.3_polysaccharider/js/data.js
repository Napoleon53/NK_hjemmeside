/* =====================================================================
   data.js - opgaverne, trinnene og teksterne

   Alt, der kan staa som data, staar her. Ordene og tallene er Kemibogens
   (afsnit B7.3 Disaccharider og polysaccharider): glykosidbinding,
   α-1,4-, α-1,6- og β-1,4-glykosidbinding, kondensation, amylose,
   amylopectin, glykogen, cellulose, (C₆H₁₀O₅)ₙ, hydrogenbindinger mellem
   cellulosekaederne, amylase, der klipper stivelse til maltose, kostfibre,
   iodopløsning og triiodidioner, I₃⁻, inde i spiralen af amylose.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Afstanden mellem to glucoseenheder i en kaede (i ringens enheder,
       som bogens figurer af amylose og cellulose) */
    D.AFSTAND = 3.1;
    /* Amylose snor sig med seks glucoseenheder pr. omgang. Spiralen ses lidt
       skraat, saa hver omgang er en loekke (maal i sekskantens radius h) */
    D.PR_OMGANG = 6;
    D.SPIRAL = { dx: 1.45, Ry: 3.6, Rx: 2.7 };
    D.spiralPunkt = function (i, h) {
        var phi = 2 * Math.PI * i / D.PR_OMGANG;
        return { x: i * D.SPIRAL.dx * h + D.SPIRAL.Rx * h * Math.sin(phi), y: -D.SPIRAL.Ry * h * Math.cos(phi), z: Math.sin(phi) };
    };

    /* =====================================================================
       Fane 1: Byg kaeden. To opgaver med tre trin.
         vaelg   eleven klikker paa α-glucose eller β-glucose paa tavlen
         oh      eleven klikker paa de to OH-grupper, der reagerer
         vend    eleven traekker i den nye ring for at vende den om
         spm     et spoergsmaal paa kortet. Har trinnet et forsoeg, kommer
                 det foerst (en knap paa kortet)
       ===================================================================== */
    D.KAEDE = [
        {
            id: "amylose", navn: "Amylose", form: "alfa", start: 3, voks: 18,
            trin: [
                {
                    id: "vaelg", slags: "vaelg", navn: "Vælg glucosen",
                    tekst: "Amylose i stivelse er en kæde med α-1,4-glykosidbindinger. Hvilken glucose skal sættes på kæden? Klik på den, og tryk Indsend svar.",
                    rigtig: "alfa",
                    fejl: { beta: "I β-glucose peger OH-gruppen på carbonatom 1 op. Oxygenatomerne i kædens glykosidbindinger peger ned." },
                    hint: ["Se på kædens grønne oxygenatomer. Peger de ned eller op fra carbonatom 1?",
                           "I α-glucose peger OH-gruppen på carbonatom 1 ned, ligesom oxygenatomerne i kæden."],
                    forkl: "Amylose er bygget af α-glucose. OH-gruppen på carbonatom 1 peger ned, og derfor bliver bindingen fra carbonatom 1 en α-binding."
                },
                {
                    id: "oh", slags: "oh", navn: "Bind ringene sammen",
                    tekst: "Hvilke to OH-grupper reagerer, når α-1,4-glykosidbindingen dannes? Klik på dem, og tryk Indsend svar.",
                    hint: ["Navnet α-1,4 fortæller, at bindingen går fra carbonatom 1 til carbonatom 4.",
                           "Vælg OH-gruppen på carbonatom 1 i kædens sidste ring og OH-gruppen på carbonatom 4 i den nye ring."],
                    fejlSamme: "De to OH-grupper skal sidde på hver sin glucose.",
                    fejl6: "OH-gruppen på carbonatom 6 giver en forgrening. Amylose har ingen forgreninger.",
                    fejl23: "Tallene 1,4 i navnet fortæller, hvilke carbonatomer bindingen forbinder. Find carbonatom 1 og carbonatom 4.",
                    fejlVej: "Kæden vokser fra carbonatom 1 i kædens sidste ring til carbonatom 4 i den nye ring.",
                    forkl: "OH-grupperne på carbonatom 1 og carbonatom 4 reagerer, og der fraspaltes et vandmolekyle. Reaktionen er en kondensation."
                },
                {
                    id: "spiral", slags: "spm", navn: "Kæden på afstand",
                    forsoeg: { tekst: "Kæden vokser videre, og der fraspaltes et vandmolekyle for hver ny glykosidbinding. Tryk Byg videre, og se kæden på afstand.", knap: "Byg videre" },
                    tekst: "Hver glucoseenhed i kæden har afgivet et vandmolekyle. Hvilken molekylformel har amylose?",
                    svar: ["(C₆H₁₂O₆)ₙ", "(C₆H₁₀O₅)ₙ", "(C₁₂H₂₂O₁₁)ₙ"], rigtig: 1,
                    fejl: { 0: "C₆H₁₂O₆ er glucose. Hver enhed i kæden har afgivet et vandmolekyle.",
                            2: "C₁₂H₂₂O₁₁ er maltose med to glucoseenheder. En enhed i kæden har seks carbonatomer." },
                    hint: ["Træk H₂O fra formlen for glucose, C₆H₁₂O₆.",
                           "C₆H₁₂O₆ minus H₂O giver C₆H₁₀O₅ for hver enhed i kæden."],
                    forkl: "Hver enhed er C₆H₁₂O₆ minus H₂O, så amylose skrives (C₆H₁₀O₅)ₙ. Med α-bindinger snor kæden sig som en spiral med seks enheder pr. omgang."
                }
            ]
        },
        {
            id: "cellulose", navn: "Cellulose", form: "beta", start: 3, voks: 12,
            trin: [
                {
                    id: "vaelg", slags: "vaelg", navn: "Vælg glucosen",
                    tekst: "Træ og bomuld består hovedsageligt af cellulose. Cellulose er en kæde med β-1,4-glykosidbindinger. Hvilken glucose skal sættes på kæden?",
                    rigtig: "beta",
                    fejl: { alfa: "I α-glucose peger OH-gruppen på carbonatom 1 ned. En β-binding kommer fra en OH-gruppe, der peger op." },
                    hint: ["β-1,4 fortæller, at bindingen kommer fra carbonatom 1 i β-glucose.",
                           "I β-glucose peger OH-gruppen på carbonatom 1 op."],
                    forkl: "Cellulose er bygget af β-glucose. OH-gruppen på carbonatom 1 peger op, og derfor bliver bindingen fra carbonatom 1 en β-binding."
                },
                {
                    id: "vend", slags: "spm", navn: "Vend ringen",
                    traek: { tekst: "Den nye β-glucose kan ikke bindes til kæden, som den ligger. Træk op eller ned i den nye ring for at vende den om." },
                    tekst: "Hvorfor skulle den nye ring vendes om?",
                    om: "bro",
                    svar: ["OH-grupperne på carbonatom 1 og 4 pegede hver sin vej", "β-glucose er et spejlbillede af α-glucose", "Så kæden kan sno sig som en spiral"], rigtig: 0,
                    fejl: { 1: "α-glucose og β-glucose er kun forskellige ved carbonatom 1. Se, hvor OH-grupperne pegede før vendingen.",
                            2: "Cellulosekæden snor sig ikke. Hver anden ring er vendt om, og det gør kæden lige." },
                    hint: ["Tænk på OH-gruppen på carbonatom 1 i kæden og OH-gruppen på carbonatom 4 i den nye ring.",
                           "I β-glucose peger OH-gruppen på carbonatom 1 op, mens OH-gruppen på carbonatom 4 peger ned."],
                    forkl: "I β-glucose peger OH-gruppen på carbonatom 1 op og OH-gruppen på carbonatom 4 ned. Derfor er hver anden glucoseenhed vendt om i cellulose."
                },
                {
                    id: "fibre", slags: "spm", navn: "Fibrene",
                    forsoeg: { tekst: "Kæden vokser videre, og hver anden ring vendes om. Tryk Byg videre, og se kæderne på afstand.", knap: "Byg videre" },
                    tekst: "Cellulosekæderne ligger tæt side om side. Hvad holder kæderne sammen i fibrene?",
                    om: "hbind",
                    svar: ["Hydrogenbindinger mellem OH-grupper", "Glykosidbindinger mellem kæderne", "Ionbindinger mellem kæderne"], rigtig: 0,
                    fejl: { 1: "Glykosidbindingerne holder enhederne sammen inde i hver kæde. Se på de prikkede streger mellem kæderne.",
                            2: "Der er ingen ioner i cellulose. Se på de prikkede streger mellem kæderne." },
                    hint: ["Se på de røde prikkede streger mellem kæderne.",
                           "Hver glucoseenhed har OH-grupper, som kan danne hydrogenbindinger til nabokæden."],
                    forkl: "Med β-bindinger bliver kæden helt lige. De lige kæder holdes sammen af hydrogenbindinger mellem OH-grupperne og giver stærke fibre, som ikke kan opløses i vand."
                }
            ]
        }
    ];
    D.KAEDE_FAERDIG = "Amylosekæden og cellulosekæden er bygget.";

    /* =====================================================================
       Fane 2: Forgreninger. Ét forloeb med fire trin.
       Molekylerne i kaploebet har lige mange glucoseenheder (ANTAL_GREN).
       ===================================================================== */
    D.ANTAL_GREN = 30;

    /* De tre molekyler i kaploebet. Hver kaede er en vej i et sekskantnet:
       E er et skridt til hoejre, UR skraat op til hoejre og DR skraat ned til
       hoejre (en forgrening, α-1,6). fra er den enhed, kaeden sidder paa.
       Hovedkaeden begynder til venstre ved den ende, der ikke klippes. */
    function E(n) { var a = []; for (var i = 0; i < n; i++) a.push("E"); return a.join(" "); }
    D.MOLEKYLER = [
        { id: "amylose", navn: "Amylose", spiral: true },
        { id: "amylopectin", navn: "Amylopectin", kaeder: [
            { fra: null, vej: E(14) },
            { fra: [4, 0], vej: "UR UR " + E(6) },
            { fra: [9, 0], vej: "DR DR " + E(5) }
        ] },
        { id: "glykogen", navn: "Glykogen", kaeder: [
            { fra: null, vej: E(8) },
            { fra: [1, 0], vej: "UR E" },
            { fra: [2, 0], vej: "DR E" },
            { fra: [4, 0], vej: "UR E E E" },
            { fra: [5, 0], vej: "DR E E" },
            { fra: [2, -1], vej: "UR E E" },
            { fra: [6, -1], vej: "UR E" },
            { fra: [2, 1], vej: "DR E E" },
            { fra: [6, 1], vej: "DR E" }
        ] }
    ];
    D.GREN = [
        {
            id: "binding", slags: "spm", navn: "Forgreningen",
            tekst: "Amylopectin i stivelse har forgreninger. Hvad hedder glykosidbindingen, der danner forgreningen?",
            om: "gren",
            svar: ["α-1,4-glykosidbinding", "α-1,6-glykosidbinding", "β-1,6-glykosidbinding"], rigtig: 1,
            fejl: { 0: "α-1,4-bindingerne sidder inde i kæderne. Find nummeret på det carbonatom, forgreningen sidder på.",
                    2: "Oxygenatomet i forgreningen peger ned fra carbonatom 1 ligesom OH-gruppen i α-glucose." },
            hint: ["Find numrene på de to carbonatomer, som bindingen i forgreningen forbinder.",
                   "Bindingen i forgreningen går fra carbonatom 1 i den øverste ring til carbonatom 6 i ringen under den."],
            forkl: "Bindingen går fra carbonatom 1 til carbonatom 6, så den er en α-1,6-glykosidbinding. Glykogen er bygget på samme måde, men har endnu flere forgreninger."
        },
        {
            id: "gaet", slags: "gaet", navn: "Gæt",
            tekst: "Kroppen spalter én glucoseenhed af ad gangen fra kædernes ender. De tre molekyler har lige mange enheder. Hvilket molekyle frigiver hurtigst glucose?",
            svar: ["Amylose", "Amylopectin", "Glykogen"], rigtig: 2
        },
        {
            id: "kaploeb", slags: "forsoeg", navn: "Kapløbet",
            tekst: "Et enzym sætter sig på hver ende af kæderne. Tryk Start enzymerne, og følg tallene ved molekylerne.",
            koerer: "Enzymerne spalter glucoseenheder af kædernes ender. Følg tallene ved molekylerne.",
            knap: "Start enzymerne"
        },
        {
            id: "hvorfor", slags: "spm", navn: "Hvorfor glykogen?",
            tekst: "Hvorfor frigiver glykogen glucose hurtigst?",
            om: "glykogen",
            svar: ["Glykogen har mange ender", "Glykogen har flere glucoseenheder", "Enzymerne spalter α-1,6-bindinger hurtigst"], rigtig: 0,
            fejl: { 1: "De tre molekyler har lige mange glucoseenheder. Tæl i stedet enderne på hvert molekyle.",
                    2: "Enzymerne spalter kun glucoseenheder af fra kædernes ender. Tæl enderne på hvert molekyle." },
            hint: ["Tæl enderne på hvert molekyle. Der sad et enzym på hver ende, da kapløbet begyndte.",
                   "Hver forgrening giver en ende mere, hvor et enzym kan spalte glucose af."],
            forkl: "Glykogen har mange forgreninger og derfor mange ender, hvor enzymerne arbejder på samme tid. Derfor kan leveren og musklerne hurtigt frigive glucose, når kroppen skal bruge energi."
        }
    ];
    D.GREN_FAERDIG = "Hele forløbet er gennemført.";

    /* =====================================================================
       Fane 3: Spyt og iod. Ét forloeb med seks trin.
       ===================================================================== */
    D.IOD = [
        {
            id: "gaet1", slags: "gaet", navn: "Gæt",
            tekst: "En dråbe iodopløsning dryppes på en skive kartoffel og på vat. Vat er næsten ren cellulose. Hvilken prøve bliver blåsort?",
            svar: ["Kartoflen", "Vattet", "Begge"], rigtig: 0
        },
        {
            id: "iod", slags: "forsoeg", navn: "Iodprøven",
            tekst: "Iodopløsningen er gulbrun og indeholder triiodidioner, I₃⁻. Tryk Tilsæt iodopløsning, og se lupperne.",
            koerer: "Iodopløsningen er tilsat. Se, hvor triiodidionerne lægger sig i lupperne.",
            knap: "Tilsæt iodopløsning"
        },
        {
            id: "spiral", slags: "spm", navn: "Spiralen",
            tekst: "Hvorfor bliver kun kartoflen blåsort?",
            om: "lup",
            svar: ["I₃⁻ sætter sig inde i spiralen af amylose", "Kun stivelse er bygget af glucose", "I₃⁻ reagerer med α-bindingerne"], rigtig: 0,
            fejl: { 1: "Cellulose er også bygget af glucose. Se, hvor triiodidionerne lægger sig i luppen ved kartoflen.",
                    2: "Der dannes ingen nye bindinger. Se, hvor triiodidionerne lægger sig i luppen ved kartoflen." },
            hint: ["Sammenlign de to lupper. Hvor ligger triiodidionerne?",
                   "I luppen ved kartoflen ligger triiodidionerne inde i spiralen af amylose."],
            forkl: "Triiodidionerne sætter sig inde i spiralen af amylose, og det giver den blåsorte farve. Cellulose har lige kæder uden spiral, så vattet bliver gulbrunt."
        },
        {
            id: "gaet2", slags: "gaet", navn: "Gæt",
            tekst: "Spyt indeholder enzymet amylase. Spyt dryppes på kogt stivelse og på vat, og prøverne står i 10 minutter ved 37 °C. Hvad spalter amylase?",
            svar: ["Kun stivelsen", "Kun vattet", "Begge prøver"], rigtig: 0
        },
        {
            id: "spyt", slags: "forsoeg", navn: "Spyt",
            tekst: "Tryk Tilsæt spyt, og se lupperne. Efter 10 minutter tilsættes en dråbe iodopløsning til begge prøver.",
            koerer: "Amylase er tilsat begge prøver. Følg enzymerne i lupperne.",
            knap: "Tilsæt spyt"
        },
        {
            id: "enzym", slags: "spm", navn: "Enzymet",
            tekst: "Amylase spaltede stivelsen til maltose, men ikke cellulosen. Hvorfor?",
            om: "lup",
            svar: ["Amylase passer kun til α-bindinger", "Cellulose har ingen glykosidbindinger", "Cellulose er ikke bygget af glucose"], rigtig: 0,
            fejl: { 1: "Cellulose har β-1,4-glykosidbindinger mellem glucoseenhederne.",
                    2: "Cellulose er også bygget af glucose. Forskellen på stivelse og cellulose er bindingerne mellem glucoseenhederne." },
            hint: ["Stivelse og cellulose er begge bygget af glucose. Hvad er forskellen på bindingerne?",
                   "Stivelse har α-glykosidbindinger, og cellulose har β-glykosidbindinger."],
            forkl: "Amylase passer kun til α-bindingerne i stivelse. Mennesket har ingen enzymer, der kan spalte β-bindingerne i cellulose, så cellulose går ufordøjet gennem tarmen som kostfibre."
        }
    ];
    D.IOD_FAERDIG = "Hele forløbet er gennemført.";

    /* Farverne paa proeverne (det, man ser) */
    D.GULBRUN = "#c8892a";
    D.BLAASORT = "#232845";

    /* ----- Smaa hjaelpere -------------------------------------------------------- */
    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Saenkede tal og ₙ som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉ₙ]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return c === "ₙ" ? "n" : SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

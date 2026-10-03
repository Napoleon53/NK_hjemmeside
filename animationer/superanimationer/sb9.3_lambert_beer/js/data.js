/* =====================================================================
   data.js - stofferne, forudsigelserne, standardkurverne og
   regneopgaverne. Ingen kode med logik her; modellen er js/lb.js.

   Enhederne i hele animationen: c i mM, l i cm, ε i mM⁻¹·cm⁻¹
   (1 mM⁻¹·cm⁻¹ = 1000 M⁻¹·cm⁻¹).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ---------------------------------------------------------
       eps: ε ved bølgelængden lambda (nm), tabelværdier:
         permanganat, MnO₄⁻, 525 nm:          ca. 2,4·10³ M⁻¹·cm⁻¹
         jern(III)thiocyanat, FeSCN²⁺, 447 nm: 4,70·10³ M⁻¹·cm⁻¹
         jern(II)phenanthrolin, 510 nm:       1,11·10⁴ M⁻¹·cm⁻¹
       lys: lysets farve ved bølgelængden (RGB).
       vaeske: hvor meget opløsningen tager af rødt, grønt og blåt ved
       cMax set gennem 1 cm (kun til farven på kuvetten).
       cMax og cTrin: koncentrationsskyderen. cDec: decimaler på c. */
    D.STOFFER = {
        mno4: {
            id: "mno4", navn: "permanganat", Navn: "Permanganat", formel: "MnO₄⁻",
            lambda: 525, eps: 2.45, lys: [110, 236, 70], vaeske: [0.45, 2.4, 0.3],
            cMax: 0.60, cTrin: 0.01, cDec: 2, M: 118.94
        },
        fescn: {
            id: "fescn", navn: "jern(III)thiocyanat", Navn: "Jern(III)thiocyanat", formel: "FeSCN²⁺",
            lambda: 447, eps: 4.70, lys: [80, 120, 255], vaeske: [0.06, 1.5, 2.3],
            cMax: 0.300, cTrin: 0.005, cDec: 3
        },
        fephen: {
            id: "fephen", navn: "jern(II)phenanthrolin", Navn: "Jern(II)phenanthrolin", formel: "[Fe(phen)₃]²⁺",
            lambda: 510, eps: 11.1, lys: [40, 232, 150], vaeske: [0.05, 0.95, 2.4],
            cMax: 0.120, cTrin: 0.002, cDec: 3
        }
    };
    D.STOF_ORDEN = ["mno4", "fescn", "fephen"];

    /* Kuvetten på fane 1: fra 0,50 til 3,00 cm */
    D.L_MIN = 0.50;
    D.L_MAX = 3.00;
    D.L_TRIN = 0.10;

    /* ----- Fane 1: forudsigelserne ------------------------------------------------
       Eleven gætter først og prøver så selv. Modellen er facit.
       start: stof, c og l, når forudsigelsen begynder.
       maal: det, scenen skal stå på, før svaret vises (c, l eller A som
       [fra, til]).
       hint: trappen i gættet (tre trin). Det sidste trin siger svaret.
       Tallene i teksterne tjekkes mod modellen i _selvtest.html. */
    D.FORUD = [
        {
            id: "vand", navn: "Vand i kuvetten",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Kuvetten tømmes og fyldes med rent vand. Hvor meget af lyset når så frem til detektoren?",
            valg: [
                { t: "100 %", n: "alt lyset", ok: true },
                { t: "50 %", n: "halvdelen" },
                { t: "0 %", n: "intet" }
            ],
            facit: { T: 1 },
            handling: "Prøv det: træk koncentrationen ned til 0.",
            maal: { c: [0, 0.0001] },
            hint: [
                "Det er permanganatet, der absorberer det grønne lys. Vand er farveløst.",
                "Uden permanganat er der intet i kuvetten, der kan absorbere lyset ved 525 nm.",
                "Alt lyset slipper igennem: T = 100 % og A = 0."
            ],
            forklaring: "Vand absorberer ikke lyset ved 525 nm, så T = 100 % og A = 0. En kuvette med vand kaldes en blindprøve. Den giver punktet (0, 0) på en standardkurve."
        },
        {
            id: "dobbeltA", navn: "Dobbelt koncentration: A",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Lige nu er A = 0,490. Hvad bliver A, når koncentrationen fordobles til 0,40 mM?",
            valg: [
                { t: "0,980", n: "det dobbelte", ok: true },
                { t: "0,490", n: "det samme" },
                { t: "0,245", n: "det halve" }
            ],
            facit: { A: 0.980 },
            handling: "Prøv det: træk koncentrationen op til 0,40 mM.",
            maal: { c: [0.395, 0.405] },
            hint: [
                "Tænk på, hvor mange molekyler lyset møder på vejen gennem kuvetten.",
                "Ved den dobbelte koncentration møder lyset dobbelt så mange molekyler.",
                "A er ligefrem proportional med c, så A bliver det dobbelte: 0,980."
            ],
            forklaring: "Ved den dobbelte koncentration møder lyset dobbelt så mange molekyler, og A bliver dobbelt så stor. A er ligefrem proportional med c."
        },
        {
            id: "dobbeltT", navn: "Dobbelt koncentration: lyset",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Lige nu slipper 32 % af lyset igennem. Hvor meget slipper igennem, når koncentrationen fordobles til 0,40 mM?",
            valg: [
                { t: "16 %", n: "halvdelen af 32 %" },
                { t: "10 %", n: "32 % af 32 %", ok: true },
                { t: "64 %", n: "det dobbelte" }
            ],
            facit: { T: 0.10 },
            handling: "Prøv det: træk koncentrationen op til 0,40 mM.",
            maal: { c: [0.395, 0.405] },
            hint: [
                "Det nye permanganat møder kun det lys, der er tilbage.",
                "Hvert lag af molekyler lader den samme brøkdel af det lys, der kommer ind i laget, slippe igennem.",
                "Det nye permanganat lader 32 % af de 32 % slippe igennem. Det er ca. 10 %."
            ],
            forklaring: "Det nye permanganat lader også kun 32 % slippe igennem, men af det lys, der er tilbage: 32 % af 32 % ≈ 10 %. A fordobles (0,490 → 0,980), men T bliver ikke halveret. Derfor regner man med A og ikke med T."
        },
        {
            id: "toCm", navn: "Én centimeter mere",
            start: { stof: "mno4", c: 0.12, l: 1.00 },
            spm: "Lige nu slipper ca. halvdelen af lyset gennem 1,00 cm. Hvor meget slipper igennem, når kuvetten er 2,00 cm?",
            valg: [
                { t: "0 %", n: "den anden centimeter tager resten" },
                { t: "26 %", n: "den anden centimeter tager halvdelen af resten", ok: true },
                { t: "51 %", n: "det samme som før" }
            ],
            facit: { T: 0.26 },
            handling: "Prøv det: træk kuvetten ud til 2,00 cm med skyderen eller i kuvettens højre side.",
            maal: { l: [1.995, 2.005] },
            hint: [
                "Se på kurven over strålen. Den viser, hvor meget lys der er tilbage inde i kuvetten.",
                "Den anden centimeter indeholder lige så meget permanganat som den første.",
                "Den anden centimeter tager også halvdelen af det lys, der kommer ind i den. Der er ca. 26 % tilbage."
            ],
            forklaring: "Hver centimeter tager den samme brøkdel af det lys, der kommer ind i den. Kurven over strålen falder fra 100 % til 51 % til 26 %. A bliver dobbelt så stor: 0,294 → 0,588."
        },
        {
            id: "halvDobbelt", navn: "Halv koncentration, dobbelt vej",
            start: { stof: "mno4", c: 0.40, l: 1.00 },
            spm: "Lige nu er A = 0,980. Koncentrationen halveres til 0,20 mM, og kuvetten bliver 2,00 cm. Hvad sker der med A?",
            valg: [
                { t: "Det samme", n: "A = 0,980", ok: true },
                { t: "Det dobbelte", n: "A = 1,96" },
                { t: "Det halve", n: "A = 0,490" }
            ],
            facit: { A: 0.980 },
            handling: "Prøv det: træk koncentrationen ned til 0,20 mM og kuvetten ud til 2,00 cm.",
            maal: { c: [0.195, 0.205], l: [1.995, 2.005] },
            hint: [
                "Tænk igen på, hvor mange molekyler lyset møder på vejen.",
                "Molekylerne står halvt så tæt, men vejen er dobbelt så lang.",
                "l · c er det samme: 2,00 cm · 0,20 mM = 1,00 cm · 0,40 mM. A bliver ved med at være 0,980."
            ],
            forklaring: "Lyset møder lige mange molekyler: de står halvt så tæt, men vejen er dobbelt så lang. A = ε · l · c er 0,980 i begge tilfælde."
        },
        {
            id: "Aen", navn: "Absorbansen 1",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Hvor meget af lyset slipper igennem, når A = 1,00?",
            valg: [
                { t: "10 %", n: "hver tiende foton", ok: true },
                { t: "1 %", n: "hver hundrede foton" },
                { t: "0 %", n: "intet" }
            ],
            facit: { T: 0.10 },
            handling: "Prøv det: skru på koncentrationen og kuvetten, til A er mellem 0,98 og 1,02.",
            maal: { A: [0.98, 1.02] },
            hint: [
                "Ved A = 0 slipper 100 % igennem. Ved A = 0,30 slipper ca. 50 % igennem.",
                "Hver gang A vokser med 1, bliver lyset 10 gange svagere.",
                "A = 1 er 10 gange svagere end 100 %: T = 10 %."
            ],
            forklaring: "A = 1 betyder, at lyset er 10 gange svagere: T = 10 %. Ved A = 2 er det 100 gange svagere: T = 1 %. Sammenhængen er A = −log(T)."
        }
    ];

    /* ----- Fane 2: standardkurverne --------------------------------------------
       std: standardernes koncentrationer i mM (vand som blindprøve
       kommer altid først). proeve: prøvens koncentration trækkes
       tilfældigt i dette interval, hver gang opgaven vælges.
       aftryk: standarden (indeks i std) med et fingeraftryk, der giver
       for høj absorbans, og hvor meget for høj. */
    D.KURVE = [
        {
            id: "mno4", navn: "Permanganat i en prøve", stof: "mno4",
            std: [0.10, 0.20, 0.30, 0.40, 0.50], proeve: [0.14, 0.46],
            tekst: "En opløsning af permanganat har en ukendt koncentration. Mål vandet, de fem standarder og prøven ved 525 nm, og find prøvens koncentration på standardkurven."
        },
        {
            id: "fescn", navn: "Jern(III) farvet rødt", stof: "fescn",
            std: [0.040, 0.080, 0.120, 0.160, 0.200], proeve: [0.05, 0.19],
            tekst: "Jern(III) i en prøve er farvet blodrødt som FeSCN²⁺. Mål ved 447 nm, og find prøvens koncentration af FeSCN²⁺."
        },
        {
            id: "fephen", navn: "Jern i en tablet", stof: "fephen",
            std: [0.010, 0.020, 0.030, 0.040, 0.050], proeve: [0.012, 0.048],
            tekst: "Jernet fra en kosttilskudstablet er omdannet til det orangerøde [Fe(phen)₃]²⁺. Mål ved 510 nm, og find prøvens koncentration."
        },
        {
            id: "aftryk", navn: "Et punkt, der ikke passer", stof: "mno4",
            std: [0.10, 0.20, 0.30, 0.40, 0.50], proeve: [0.14, 0.46],
            aftryk: { i: 2, A: 0.12 },
            tekst: "En ny permanganatprøve. Se godt efter, om alle punkterne ligger på linjen."
        }
    ];

    /* ----- Fane 3: regnestykkerne ------------------------------------------------
       BOGSTAV: hvordan hvert bogstav skrives, og enheden på tallet.
       TRIN: hvert slags regnestykke. form: skabelonen ("***" tre faktorer,
       "**" to faktorer, "/" en brøk, "/**" en brøk med to faktorer under
       brøkstregen), top og bund: bogstaverne. */
    D.BOGSTAV = {
        A:   { vis: "A", enhed: "", navn: "absorbansen" },
        eps: { vis: "ε", enhed: "mM⁻¹·cm⁻¹", navn: "ekstinktionskoefficienten" },
        l:   { vis: "l", enhed: "cm", navn: "kuvettebredden" },
        c:   { vis: "c", enhed: "mM", navn: "koncentrationen" },
        a:   { vis: "a", enhed: "mM⁻¹", navn: "hældningen" },
        n:   { vis: "n", enhed: "mmol", navn: "stofmængden" },
        V:   { vis: "V", enhed: "L", navn: "rumfanget" },
        m:   { vis: "m", enhed: "mg", navn: "massen" },
        M:   { vis: "M", enhed: "g/mol", navn: "molarmassen" }
    };

    D.TRIN = {
        A:    { maal: "A",   navn: "Absorbansen",   form: "***", top: ["eps", "l", "c"], bund: [] },
        c:    { maal: "c",   navn: "Koncentrationen", form: "/**", top: ["A"], bund: ["eps", "l"] },
        eps:  { maal: "eps", navn: "Ekstinktionskoefficienten", form: "/**", top: ["A"], bund: ["l", "c"] },
        epsA: { maal: "eps", navn: "Ekstinktionskoefficienten", form: "/", top: ["a"], bund: ["l"] },
        n:    { maal: "n",   navn: "Stofmængden",   form: "**", top: ["c", "V"], bund: [] },
        m:    { maal: "m",   navn: "Massen",        form: "**", top: ["n", "M"], bund: [] }
    };

    D.SKABELONER = ["**", "***", "/", "/**"];
    D.TRINBAR = ["Formlen", "Tallene ind", "Resultatet"];

    /* tal: opgavens tal som tekst (antallet af cifre er det, der vises).
       V skrives i mL i teksten, men står i L på tavlen. */
    D.REGN = [
        {
            id: "r1", gruppe: "let", navn: "Find absorbansen", stof: "mno4",
            tekst: "En opløsning af permanganat har koncentrationen 0,300 mM. Den måles ved 525 nm i en kuvette på 1,00 cm, hvor ε = 2,45 mM⁻¹·cm⁻¹. Beregn absorbansen.",
            tal: { c: "0,300", l: "1,00", eps: "2,45" }, trin: ["A"]
        },
        {
            id: "r2", gruppe: "let", navn: "Find koncentrationen", stof: "fescn",
            tekst: "En prøve med FeSCN²⁺ har absorbansen 0,611 ved 447 nm i en kuvette på 1,00 cm. ε = 4,70 mM⁻¹·cm⁻¹. Beregn koncentrationen af FeSCN²⁺.",
            tal: { A: "0,611", eps: "4,70", l: "1,00" }, trin: ["c"]
        },
        {
            id: "r3", gruppe: "let", navn: "Find ε af en standard", stof: "fephen",
            tekst: "En standard med 0,0400 mM [Fe(phen)₃]²⁺ har absorbansen 0,444 ved 510 nm i en kuvette på 1,00 cm. Beregn ekstinktionskoefficienten ε.",
            tal: { A: "0,444", l: "1,00", c: "0,0400" }, trin: ["eps"]
        },
        {
            id: "r4", gruppe: "middel", navn: "En kort kuvette", stof: "fescn",
            tekst: "En prøve med FeSCN²⁺ måles i en kuvette på kun 0,500 cm. Absorbansen er 0,282, og ε = 4,70 mM⁻¹·cm⁻¹. Beregn koncentrationen.",
            tal: { A: "0,282", eps: "4,70", l: "0,500" }, trin: ["c"]
        },
        {
            id: "r5", gruppe: "middel", navn: "Find ε af hældningen", stof: "mno4",
            tekst: "En standardkurve for permanganat er målt i en kuvette på 2,00 cm. Linjen gennem (0, 0) har hældningen a = 4,90 mM⁻¹. Beregn ε.",
            tal: { a: "4,90", l: "2,00" }, trin: ["epsA"]
        },
        {
            id: "r6", gruppe: "middel", navn: "En lang kuvette", stof: "fephen",
            tekst: "Jernet fra en tablet er omdannet til [Fe(phen)₃]²⁺ og måles i en kuvette på 2,00 cm. Absorbansen er 0,999, og ε = 11,1 mM⁻¹·cm⁻¹. Beregn koncentrationen.",
            tal: { A: "0,999", eps: "11,1", l: "2,00" }, trin: ["c"]
        },
        {
            id: "r7", gruppe: "svaer", navn: "Fra hældning til prøve", stof: "fescn",
            tekst: "En standardkurve for FeSCN²⁺ er målt i en kuvette på 2,00 cm og har hældningen a = 9,40 mM⁻¹. En prøve har absorbansen 0,752 i samme kuvette. Beregn først ε og så prøvens koncentration.",
            tal: { a: "9,40", l: "2,00", A: "0,752" }, trin: ["epsA", "c"]
        },
        {
            id: "r8", gruppe: "svaer", navn: "Massen af permanganat", stof: "mno4",
            tekst: "En prøve på 250 mL indeholder permanganat. Absorbansen er 0,539 ved 525 nm i en kuvette på 1,00 cm, og ε = 2,45 mM⁻¹·cm⁻¹. Beregn massen af permanganat i prøven. M(MnO₄⁻) = 118,94 g/mol.",
            tal: { A: "0,539", eps: "2,45", l: "1,00", V: "0,250", M: "118,94" }, trin: ["c", "n", "m"]
        }
    ];

    D.GRUPPER_REGN = [
        { id: "let", titel: "Let" },
        { id: "middel", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];

    /* ----- Ros og afslutning ----------------------------------------------------------- */
    D.ROS_OPGAVE = ["Flot.", "Godt.", "Sådan.", "Præcist.", "Det holder."];

    D.FAERDIG = {
        lys: "Alle seks forudsigelser er prøvet. På Standardkurven bliver det til målinger.",
        kurve: "Alle fire standardkurver er færdige. På Beregningen er det de samme sammenhænge med tal.",
        regn: "Alle otte regnestykker er løst."
    };

    NK.Data = D;
}());

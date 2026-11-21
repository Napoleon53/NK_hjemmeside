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
            cMax: 0.60, cTrin: 0.01, cKnap: 0.05, cDec: 2, M: 118.94
        },
        fescn: {
            id: "fescn", navn: "jern(III)thiocyanat", Navn: "Jern(III)thiocyanat", formel: "FeSCN²⁺",
            lambda: 447, eps: 4.70, lys: [80, 120, 255], vaeske: [0.06, 1.5, 2.3],
            cMax: 0.300, cTrin: 0.005, cKnap: 0.025, cDec: 3
        },
        fephen: {
            id: "fephen", navn: "jern(II)phenanthrolin", Navn: "Jern(II)phenanthrolin", formel: "[Fe(phen)₃]²⁺",
            lambda: 510, eps: 11.1, lys: [40, 232, 150], vaeske: [0.05, 0.95, 2.4],
            cMax: 0.120, cTrin: 0.002, cKnap: 0.01, cDec: 3
        }
    };
    D.STOF_ORDEN = ["mno4", "fescn", "fephen"];

    /* Kuvetten på fane 1: fra 0,50 til 3,00 cm */
    D.L_MIN = 0.50;
    D.L_MAX = 3.00;
    D.L_TRIN = 0.10;
    /* − og + ved kuvettebredden (21. nov. 2026): et klik er 0,50 cm, saa
       bredden altid er et rundt tal paa grebets net (0,10 cm). − og + ved
       koncentrationen bruger stoffets cKnap. */
    D.L_KNAP = 0.50;

    /* ----- Fane 1: forudsigelserne ------------------------------------------------
       Eleven gætter først og prøver så selv. Modellen er facit.
       start: stof, c og l, når forudsigelsen begynder.
       maal: det, scenen skal stå på, før svaret vises (c, l eller A som
       [fra, til]).
       hint: trappen i gættet (tre trin). Det sidste trin siger svaret.
       tema: to-tre ord i opgaverækken øverst i scenen. under: værktøjstip.
       trin (kun den første, 21. nov. 2026): to rigtige spørgsmål før
       gættet, som i sc5.7. Hvert har tre svar (ok: det rigtige, hvorfor:
       forklaringen til et forkert svar), tre hint og en ros.
       Tallene i teksterne tjekkes mod modellen i _selvtest.html. */
    D.FORUD = [
        {
            id: "vand", navn: "Vand i kuvetten", tema: "Vand i kuvetten",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            trin: [
                {
                    tekst: "Hvad sker der med noget af det grønne lys i kuvetten med lilla permanganat?",
                    svar: [
                        { t: "Det bliver absorberet", ok: true },
                        { t: "Det bliver farvet lilla", hvorfor: "Lyset skifter ikke farve i kuvetten. Permanganat ser lilla ud, fordi det absorberer grønt lys, og resten af lyset slipper igennem." },
                        { t: "Det går uændret igennem", hvorfor: "Så ville opløsningen være farveløs som vand. Se på de grønne prikker: Nogle af dem forsvinder inde i kuvetten." }
                    ],
                    hint: [
                        "Se på de grønne prikker. Kommer de alle sammen ud på den anden side af kuvetten?",
                        "Nogle prikker forsvinder inde i kuvetten og efterlader en lille ring.",
                        "Det lys, der forsvinder i kuvetten, bliver absorberet af permanganationerne."
                    ],
                    ros: "Permanganationerne absorberer noget af det grønne lys. Kurven over strålen viser nu, hvor meget af lyset der er tilbage."
                },
                {
                    tekst: "Hvor meget af lyset når frem til detektoren gennem 0,20 mM permanganat?",
                    svar: [
                        { t: "68 %", hvorfor: "68 % er den del af lyset, der bliver absorberet. Kurven viser det lys, der er tilbage." },
                        { t: "32 %", ok: true },
                        { t: "100 %", hvorfor: "100 % er lyset, der går ind i kuvetten. Kurven falder inde i kuvetten." }
                    ],
                    hint: [
                        "Følg kurven Lys tilbage fra lampen hen mod detektoren.",
                        "Aflæs kurven der, hvor lyset kommer ud af kuvetten.",
                        "Kurven står på 32 %, hvor lyset kommer ud af kuvetten."
                    ],
                    ros: "32 % af lyset slipper igennem. Displayet under detektoren viser det som transmittansen T."
                }
            ],
            spm: "Hvor meget af lyset når frem til detektoren, når kuvetten fyldes med rent vand?",
            valg: [
                { t: "100 %", n: "alt lyset", ok: true },
                { t: "50 %", n: "halvdelen" },
                { t: "0 %", n: "intet" }
            ],
            facit: { T: 1 },
            handling: "Prøv det: Klik på − ved kuvetten, til koncentrationen er 0 mM.",
            maal: { c: [0, 0.0001] },
            hint: [
                "Det er permanganatet, der absorberer det grønne lys. Vand er farveløst.",
                "Uden permanganat er der intet i kuvetten, der kan absorbere lyset ved 525 nm.",
                "Alt lyset slipper igennem: T = 100 %."
            ],
            forklaring: "Vand absorberer ikke lyset ved 525 nm, så alt lyset når frem. En kuvette med vand kaldes en blindprøve."
        },
        {
            id: "dobbeltA", navn: "Dobbelt koncentration: absorbansen", tema: "Dobbelt c: absorbansen",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Hvad bliver absorbansen (A), når koncentrationen fordobles fra 0,20 mM til 0,40 mM?",
            valg: [
                { t: "0,980", n: "det dobbelte", ok: true },
                { t: "0,490", n: "det samme" },
                { t: "0,245", n: "det halve" }
            ],
            facit: { A: 0.980 },
            handling: "Prøv det: Klik på + ved kuvetten, til koncentrationen er 0,40 mM.",
            maal: { c: [0.395, 0.405] },
            hint: [
                "Tænk på, hvor mange permanganationer lyset møder på vejen gennem kuvetten.",
                "Ved den dobbelte koncentration møder lyset dobbelt så mange permanganationer.",
                "A er ligefrem proportional med c, så A bliver det dobbelte: 0,980."
            ],
            forklaring: "Ved den dobbelte koncentration møder lyset dobbelt så mange permanganationer, og A bliver dobbelt så stor. A er ligefrem proportional med c."
        },
        {
            id: "dobbeltT", navn: "Dobbelt koncentration: lyset", tema: "Dobbelt c: lyset",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Hvor meget af lyset slipper igennem, når koncentrationen fordobles fra 0,20 mM til 0,40 mM?",
            valg: [
                { t: "16 %", n: "halvdelen af 32 %" },
                { t: "10 %", n: "32 % af 32 %", ok: true },
                { t: "64 %", n: "det dobbelte" }
            ],
            facit: { T: 0.10 },
            handling: "Prøv det: Klik på + ved kuvetten, til koncentrationen er 0,40 mM.",
            maal: { c: [0.395, 0.405] },
            hint: [
                "De ekstra permanganationer møder kun det lys, der er tilbage.",
                "Hvert lag af permanganationer lader den samme brøkdel af det lys, der kommer ind i laget, slippe igennem.",
                "De ekstra permanganationer lader 32 % af de 32 % slippe igennem. Det er ca. 10 %."
            ],
            forklaring: "De ekstra permanganationer lader også kun 32 % slippe igennem, men af det lys, der er tilbage: 32 % af 32 % ≈ 10 %. A fordobles (0,490 → 0,980), men T bliver ikke halveret. Derfor regner man med A og ikke med T."
        },
        {
            id: "toCm", navn: "Én centimeter mere", tema: "Én cm mere",
            start: { stof: "mno4", c: 0.12, l: 1.00 },
            spm: "Hvor meget af lyset slipper igennem 0,12 mM permanganat, når kuvetten bliver 2,00 cm bred i stedet for 1,00 cm?",
            valg: [
                { t: "0 %", n: "den anden centimeter absorberer resten" },
                { t: "26 %", n: "hver centimeter absorberer halvdelen", ok: true },
                { t: "51 %", n: "det samme som før" }
            ],
            facit: { T: 0.26 },
            handling: "Prøv det: Gør kuvetten 2,00 cm bred med + ved kuvettebredden eller grebet på kuvettens højre side.",
            maal: { l: [1.995, 2.005] },
            hint: [
                "Se på kurven over strålen. Den viser, hvor meget lys der er tilbage inde i kuvetten.",
                "Den anden centimeter indeholder lige så meget permanganat som den første.",
                "Den anden centimeter absorberer også halvdelen af det lys, der kommer ind i den. Der er ca. 26 % tilbage."
            ],
            forklaring: "Hver centimeter absorberer den samme brøkdel af det lys, der kommer ind i den. Kurven over strålen falder fra 100 % til 51 % til 26 %. A bliver dobbelt så stor: 0,294 → 0,588."
        },
        {
            id: "halvDobbelt", navn: "Halv koncentration, dobbelt vej", tema: "Halv c, dobbelt l",
            start: { stof: "mno4", c: 0.40, l: 1.00 },
            spm: "Hvad sker der med A = 0,980, når koncentrationen halveres fra 0,40 mM til 0,20 mM, og kuvetten bliver 2,00 cm bred?",
            valg: [
                { t: "Det samme", n: "A = 0,980", ok: true },
                { t: "Det dobbelte", n: "A = 1,96" },
                { t: "Det halve", n: "A = 0,490" }
            ],
            facit: { A: 0.980 },
            handling: "Prøv det: Gør koncentrationen 0,20 mM og kuvetten 2,00 cm bred.",
            maal: { c: [0.195, 0.205], l: [1.995, 2.005] },
            hint: [
                "Tænk på, hvor mange permanganationer lyset møder på vejen gennem kuvetten.",
                "Permanganationerne står halvt så tæt, men lysvejen er dobbelt så lang.",
                "l · c er det samme: 2,00 cm · 0,20 mM = 1,00 cm · 0,40 mM. A er stadig 0,980."
            ],
            forklaring: "Lyset møder lige mange permanganationer. Ionerne står halvt så tæt, men lysvejen er dobbelt så lang. A = ε · l · c er 0,980 i begge tilfælde."
        },
        {
            id: "Aen", navn: "A = 1", tema: "A = 1", under: "Hvor meget lys slipper igennem?",
            start: { stof: "mno4", c: 0.20, l: 1.00 },
            spm: "Hvor meget af lyset slipper igennem, når A = 1,00?",
            valg: [
                { t: "10 %", n: "hver tiende foton", ok: true },
                { t: "1 %", n: "hver hundrede foton" },
                { t: "0 %", n: "intet" }
            ],
            facit: { T: 0.10 },
            handling: "Prøv det: Ændr koncentrationen eller kuvettebredden, til A er mellem 0,98 og 1,02.",
            maal: { A: [0.98, 1.02] },
            hint: [
                "Ved A = 0 slipper 100 % af lyset igennem. Ved A = 0,30 slipper ca. 50 % igennem.",
                "Hver gang A vokser med 1, bliver lyset 10 gange svagere.",
                "Ved A = 1 er lyset 10 gange svagere end ved A = 0, så T = 10 %."
            ],
            forklaring: "A = 1 betyder, at lyset er blevet 10 gange svagere, så T = 10 %. Ved A = 2 er lyset 100 gange svagere, så T = 1 %. Sammenhængen er A = −log(T)."
        }
    ];

    /* ----- Fane 2: standardkurverne --------------------------------------------
       std: standardernes koncentrationer i mM (vand som blindprøve
       kommer altid først). proeve: prøvens koncentration trækkes
       tilfældigt i dette interval, hver gang opgaven vælges.
       aftryk: standarden (indeks i std) med et fingeraftryk, der giver
       for høj absorbans, og hvor meget for høj.
       kort: den korte indledning på kortet (21. nov. 2026, regel 5-6);
       tekst står i rundvisningen og selvtesten. */
    D.KURVE = [
        {
            id: "mno4", navn: "Permanganat i en prøve", tema: "Permanganat", stof: "mno4", kort: "En opløsning af permanganat har en ukendt koncentration.",
            std: [0.10, 0.20, 0.30, 0.40, 0.50], proeve: [0.14, 0.46],
            tekst: "En opløsning af permanganat har en ukendt koncentration. Mål vandet, de fem standarder og prøven ved 525 nm, og find prøvens koncentration på standardkurven."
        },
        {
            id: "fescn", navn: "Jern(III) farvet rødt", tema: "Jern(III), rødt", stof: "fescn", kort: "Jern(III)ionerne i en prøve er omdannet til det blodrøde FeSCN²⁺.",
            std: [0.040, 0.080, 0.120, 0.160, 0.200], proeve: [0.05, 0.19],
            tekst: "Jern(III)ionerne i en prøve er omdannet til det blodrøde FeSCN²⁺. Mål ved 447 nm, og find prøvens koncentration af FeSCN²⁺."
        },
        {
            id: "fephen", navn: "Jern i en tablet", tema: "Jern i en tablet", stof: "fephen", kort: "Jernet fra en tablet er omdannet til det orangerøde [Fe(phen)₃]²⁺.",
            std: [0.010, 0.020, 0.030, 0.040, 0.050], proeve: [0.012, 0.048],
            tekst: "Jernet fra en kosttilskudstablet er omdannet til det orangerøde [Fe(phen)₃]²⁺. Mål ved 510 nm, og find prøvens koncentration af [Fe(phen)₃]²⁺."
        },
        {
            id: "aftryk", navn: "Et punkt, der ikke passer", tema: "Et skævt punkt", stof: "mno4", kort: "En prøve med permanganat har en ukendt koncentration.",
            std: [0.10, 0.20, 0.30, 0.40, 0.50], proeve: [0.14, 0.46],
            aftryk: { i: 2, A: 0.12 },
            tekst: "En prøve med permanganat har en ukendt koncentration. Se godt efter, om alle punkterne ligger på linjen."
        }
    ];

    /* ----- Fane 3: regnestykkerne ------------------------------------------------
       BOGSTAV: hvordan hvert bogstav skrives, og enheden på tallet.
       TRIN: hvert slags regnestykke. form: formens form på tavlen ("***" tre
       faktorer, "**" to faktorer, "/" en brøk, "/**" en brøk med to
       faktorer under brøkstregen), top og bund: bogstaverne.
       valg (21. nov. 2026, regelsættet regel 14): formlen vælges med tre
       knapper på kortet, den rigtige (ok) og to typiske fejl med hver sin
       forklaring (hvorfor). */
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
        A:    { maal: "A",   navn: "Absorbansen",   form: "***", top: ["eps", "l", "c"], bund: [],
                valg: [{ f: "A = ε · l · c", ok: true },
                       { f: "A = ε · c", hvorfor: "l mangler. Lyset går gennem hele kuvetten, så A afhænger også af lysvejen l." },
                       { f: "A = c / (ε · l)", hvorfor: "Der skal ganges. A bliver større, når c, l eller ε bliver større." }] },
        c:    { maal: "c",   navn: "Koncentrationen", form: "/**", top: ["A"], bund: ["eps", "l"],
                valg: [{ f: "c = A · ε · l", hvorfor: "Du har ganget. c står alene, når A divideres med ε · l." },
                       { f: "c = A / (ε · l)", ok: true },
                       { f: "c = ε · l / A", hvorfor: "Brøken er vendt. A skal stå over brøkstregen, fordi A = ε · l · c." }] },
        eps:  { maal: "eps", navn: "Ekstinktionskoefficienten", form: "/**", top: ["A"], bund: ["l", "c"],
                valg: [{ f: "ε = A · l · c", hvorfor: "Du har ganget. ε står alene, når A divideres med l · c." },
                       { f: "ε = l · c / A", hvorfor: "Brøken er vendt. A skal stå over brøkstregen, fordi A = ε · l · c." },
                       { f: "ε = A / (l · c)", ok: true }] },
        epsA: { maal: "eps", navn: "Ekstinktionskoefficienten", form: "/", top: ["a"], bund: ["l"],
                valg: [{ f: "ε = a / l", ok: true },
                       { f: "ε = a · l", hvorfor: "Hældningen er a = ε · l. Divider a med l for at få ε alene." },
                       { f: "ε = l / a", hvorfor: "Brøken er vendt. a skal stå over brøkstregen, fordi a = ε · l." }] },
        n:    { maal: "n",   navn: "Stofmængden",   form: "**", top: ["c", "V"], bund: [],
                valg: [{ f: "n = c / V", hvorfor: "Der skal ganges. c = n / V giver n = c · V." },
                       { f: "n = c · V", ok: true },
                       { f: "n = V / c", hvorfor: "Der skal ganges. c = n / V giver n = c · V." }] },
        m:    { maal: "m",   navn: "Massen",        form: "**", top: ["n", "M"], bund: [],
                valg: [{ f: "m = n / M", hvorfor: "Der skal ganges. n = m / M giver m = n · M." },
                       { f: "m = M / n", hvorfor: "Der skal ganges. n = m / M giver m = n · M." },
                       { f: "m = n · M", ok: true }] }
    };

    /* tal: opgavens tal som tekst (antallet af cifre er det, der vises).
       V skrives i mL i teksten, men står i L på tavlen.
       tema: to-tre ord i opgaverækken. spm: spørgsmålet til hver del
       (det halvfede på kortet, som kan stå alene). ind: en kort indledning
       på kortet, kun hvor spørgsmålet ellers bliver for langt (runde 3,
       regel 5a). tekst står i rundvisningen og selvtesten. */
    D.REGN = [
        {
            id: "r1", gruppe: "let", navn: "Find absorbansen", tema: "Find A", stof: "mno4",
            tekst: "En opløsning af permanganat har koncentrationen 0,300 mM. Den måles ved 525 nm i en kuvette på 1,00 cm, hvor ε = 2,45 mM⁻¹·cm⁻¹. Beregn absorbansen.",
            tal: { c: "0,300", l: "1,00", eps: "2,45" }, trin: ["A"],
            spm: ["Hvad er absorbansen af 0,300 mM permanganat i en kuvette på 1,00 cm?"]
        },
        {
            id: "r2", gruppe: "let", navn: "Find koncentrationen", tema: "Find c", stof: "fescn",
            tekst: "En prøve med FeSCN²⁺ har absorbansen 0,611 ved 447 nm i en kuvette på 1,00 cm. Ekstinktionskoefficienten er ε = 4,70 mM⁻¹·cm⁻¹. Beregn koncentrationen af FeSCN²⁺.",
            tal: { A: "0,611", eps: "4,70", l: "1,00" }, trin: ["c"],
            spm: ["Hvad er koncentrationen af FeSCN²⁺ i prøven med absorbansen 0,611?"]
        },
        {
            id: "r3", gruppe: "let", navn: "Find ε af en standard", tema: "Find ε", stof: "fephen",
            tekst: "En standard med 0,0400 mM [Fe(phen)₃]²⁺ har absorbansen 0,444 ved 510 nm i en kuvette på 1,00 cm. Beregn ekstinktionskoefficienten ε.",
            tal: { A: "0,444", l: "1,00", c: "0,0400" }, trin: ["eps"],
            spm: ["Hvad er ε for [Fe(phen)₃]²⁺ ved 510 nm?"]
        },
        {
            id: "r4", gruppe: "middel", navn: "En kort kuvette", tema: "Kort kuvette", stof: "fescn",
            tekst: "En prøve med FeSCN²⁺ måles i en kuvette på kun 0,500 cm. Absorbansen er 0,282, og ε = 4,70 mM⁻¹·cm⁻¹. Beregn koncentrationen af FeSCN²⁺.",
            tal: { A: "0,282", eps: "4,70", l: "0,500" }, trin: ["c"],
            spm: ["Hvad er koncentrationen af FeSCN²⁺ i prøven i kuvetten på 0,500 cm?"]
        },
        {
            id: "r5", gruppe: "middel", navn: "Find ε af hældningen", tema: "ε af hældningen", stof: "mno4",
            tekst: "En standardkurve for permanganat er målt i en kuvette på 2,00 cm. Linjen gennem (0, 0) har hældningen a = 4,90 mM⁻¹. Beregn ε.",
            tal: { a: "4,90", l: "2,00" }, trin: ["epsA"],
            spm: ["Hvad er ε for permanganat, når hældningen er 4,90 mM⁻¹ i en kuvette på 2,00 cm?"]
        },
        {
            id: "r6", gruppe: "middel", navn: "En lang kuvette", tema: "Lang kuvette", stof: "fephen",
            tekst: "Jernet fra en tablet er omdannet til [Fe(phen)₃]²⁺ og måles i en kuvette på 2,00 cm. Absorbansen er 0,999, og ε = 11,1 mM⁻¹·cm⁻¹. Beregn koncentrationen af [Fe(phen)₃]²⁺.",
            tal: { A: "0,999", eps: "11,1", l: "2,00" }, trin: ["c"],
            spm: ["Hvad er koncentrationen af [Fe(phen)₃]²⁺ i prøven i kuvetten på 2,00 cm?"]
        },
        {
            id: "r7", gruppe: "svaer", navn: "Fra hældning til prøve", tema: "Hældning til prøve", stof: "fescn",
            tekst: "En standardkurve for FeSCN²⁺ er målt i en kuvette på 2,00 cm og har hældningen a = 9,40 mM⁻¹. En prøve har absorbansen 0,752 i samme kuvette. Beregn først ε og så prøvens koncentration.",
            tal: { a: "9,40", l: "2,00", A: "0,752" }, trin: ["epsA", "c"],
            spm: ["Hvad er ε for FeSCN²⁺, når hældningen er 9,40 mM⁻¹ i en kuvette på 2,00 cm?", "Hvad er koncentrationen af FeSCN²⁺ i prøven med absorbansen 0,752?"]
        },
        {
            id: "r8", gruppe: "svaer", navn: "Massen af permanganat", tema: "Massen", stof: "mno4",
            tekst: "En prøve på 250 mL indeholder permanganat. Absorbansen er 0,539 ved 525 nm i en kuvette på 1,00 cm, og ε = 2,45 mM⁻¹·cm⁻¹. Beregn massen af permanganat i prøven. M(MnO₄⁻) = 118,94 g/mol.",
            tal: { A: "0,539", eps: "2,45", l: "1,00", V: "0,250", M: "118,94" }, trin: ["c", "n", "m"],
            ind: "En prøve på 250 mL indeholder permanganat.",
            spm: ["Hvad er koncentrationen af permanganat i prøven?", "Hvor mange mmol permanganat er der i de 250 mL?", "Hvor mange mg permanganat er der i prøven?"]
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
        lys: "Alle seks forudsigelser er prøvet. På fanen Standardkurven bruger du de samme sammenhænge på målinger.",
        kurve: "Alle fire standardkurver er færdige. På fanen Beregningen regner du med de samme sammenhænge.",
        regn: "Alle otte regnestykker er løst."
    };

    NK.Data = D;
}());

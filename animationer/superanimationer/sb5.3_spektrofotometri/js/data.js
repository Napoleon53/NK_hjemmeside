/* =====================================================================
   data.js - stofferne, de tre forsoeg, trinene og quizzen.
   Ingen logik her: modellen er js/model.js, trinene koeres af
   js/forsoeg.js.

   Enhederne i hele animationen: c i µM (10⁻⁶ mol/L), kuvetten er
   1,00 cm, og haeldningen a = ε · l er i µM⁻¹.

   Pladsholdere i teksterne ({A}, {a}, {c} osv.) fyldes ud af
   forsoeg.js med elevens egne maalinger og den aktuelle proeve.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ------------------------------------------------------------
       a: haeldningen a = ε · l i µM⁻¹ ved hver boelgelaengde (l = 1,00 cm).
         E129 allurarødt, 504 nm:  ε ≈ 2,6 · 10⁴ L/(mol · cm)
         E102 tartrazin, 427 nm:   ε ≈ 2,7 · 10⁴ L/(mol · cm)
         E133 brillantblåt, 630 nm: ε ≈ 1,3 · 10⁵ L/(mol · cm)
           og ved 427 nm 5 % af toppen (den lille top ved 410 nm)
         Griess-azofarvestoffet, 540 nm: ε ≈ 5,0 · 10⁴ L/(mol · cm);
           reagenserne fortynder 50 mL til 54 mL, saa haeldningen pr. µM
           nitrit i kolben er 5,0 · 10⁴ · 50/54 · 10⁻⁶ = 0,0463 µM⁻¹.
       kanal: hvor meget stoffet tager af roedt, groent og blaat lys pr. µM
         set gennem kuvetten (kun til farven paa vaesken).
       prik: farven paa molekylerne i zoomboblen.
       M: molar masse i g/mol (natriumsaltene), til mg/L i forklaringen. */
    D.STOFFER = {
        roed: { navn: "E129", langt: "E129 (allurarødt)", prik: "#ff4d5e", a: { 504: 0.0260 },
                kanal: [0.001, 0.026, 0.011], M: 496.4 },
        azo:  { navn: "azofarvestof", langt: "azofarvestoffet", prik: "#ff3d6e", a: { 540: 0.0463 },
                kanal: [0.002, 0.046, 0.016] },
        gul:  { navn: "E102", langt: "E102 (tartrazin)", prik: "#ffd21f", a: { 427: 0.0270, 630: 0 },
                kanal: [0.000, 0.004, 0.027], M: 534.4 },
        blaa: { navn: "E133", langt: "E133 (brillantblåt)", prik: "#3a7bff", a: { 427: 0.0065, 630: 0.130 },
                kanal: [0.130, 0.030, 0.004], M: 792.9 }
    };

    /* Glassets og vandets egen absorbans, naar instrumentet ikke er nulstillet */
    D.BAGGRUND = 0.042;

    /* Lysets farve ved hver boelgelaengde (fotonerne i zoomboblen) */
    D.LYS = { 427: "#8f7dff", 504: "#4fe07a", 540: "#b6e34a", 630: "#ff8a3d" };
    D.LYSNAVN = { 427: "violet", 504: "grønt", 540: "gulgrønt", 630: "orange" };

    /* ===================================================================
       FANE 1: ROED SODAVAND (let)
       =================================================================== */
    var LET = {
        id: "let", navn: "Sodavand", niveau: "let",
        titel: "Rød sodavand",
        spoergsmaal: "Hvor meget rødt farvestof, E129, er der i sodavanden?",
        lambdaer: [504], maaletid: 1.1,
        kuvetter: [
            { id: "blind", navn: "blindprøven", etiket: ["Blind"], indhold: {}, rolle: "blind", c: 0 },
            { id: "s1", navn: "standarden med 5,0 µM", etiket: ["5,0", "µM"], indhold: { roed: 5 }, rolle: "std", c: 5 },
            { id: "s2", navn: "standarden med 10,0 µM", etiket: ["10,0", "µM"], indhold: { roed: 10 }, rolle: "std", c: 10 },
            { id: "s3", navn: "standarden med 15,0 µM", etiket: ["15,0", "µM"], indhold: { roed: 15 }, rolle: "std", c: 15 },
            { id: "s4", navn: "standarden med 20,0 µM", etiket: ["20,0", "µM"], indhold: { roed: 20 }, rolle: "std", c: 20 },
            { id: "s5", navn: "standarden med 25,0 µM", etiket: ["25,0", "µM"], indhold: { roed: 25 }, rolle: "std", c: 25 },
            { id: "p", navn: "sodavanden", etiket: ["Soda-", "vand"], rolle: "proeve" }
        ],
        /* Ufortyndet sodavand i en flaske paa bordet (paaskeaegget) */
        flaske: { etiket: "Ufortyndet" },
        proever: [
            { navn: "Hindbærsodavand", kort: "hindbærsodavanden", indhold: { roed: 18.0 }, vFoer: 10.0, vEfter: 50.0 },
            { navn: "Kirsebærsodavand", kort: "kirsebærsodavanden", indhold: { roed: 12.0 }, vFoer: 25.0, vEfter: 100.0 },
            { navn: "Jordbærsodavand", kort: "jordbærsodavanden", indhold: { roed: 8.0 }, vFoer: 10.0, vEfter: 100.0 }
        ],
        grafer: [
            { id: "g", titel: "Standardkurve ved 504 nm", xMaks: 30, xTrin: 5, xFin: 1, yMaks: 0.8, yTrin: 0.1,
              serier: [{ id: "r", stof: "roed", lambda: 504, farve: "#ff6b78" }] }
        ],
        trin: [
            {
                type: "maal", id: "nul", titel: "Nulstil med blindprøven",
                linje: "Sæt blindprøven med rent vand i spektrofotometeret.",
                kuvetter: ["blind"],
                hint: ["Blindprøven er kuvetten med rent vand. Den står yderst til venstre i stativet.",
                       "Træk kuvetten op i kuvetteholderen på spektrofotometeret, eller klik på den."],
                loest: "Nulstillet. Rent vand giver nu A = 0,000, så instrumentet kun måler farvestoffet.",
                resume: "Rent vand: A = 0,000"
            },
            {
                type: "maal", id: "std", titel: "Mål standardrækken",
                linje: "Mål de fem standarder. Hver måling bliver et punkt på grafen.",
                kuvetter: ["s1", "s2", "s3", "s4", "s5"],
                hint: ["Standarderne er de fem røde kuvetter med kendt koncentration.",
                       "Sæt dem i spektrofotometeret én ad gangen. Rækkefølgen er ligegyldig."],
                loest: "Punkterne ligger på en ret linje gennem (0, 0). Det er standardkurven.",
                resume: "5 punkter på en ret linje"
            },
            {
                type: "regn", id: "a", regn: "haeldning", titel: "Find hældningen a",
                linje: "Find standardkurvens hældning a ud fra et af punkterne.",
                info: "Standardkurven er en ret linje gennem (0, 0): A = a · c.",
                hint: {
                    formel: ["a fortæller, hvor meget A stiger pr. µM. Du kender A og c for hver standard.",
                             "a = A / …"],
                    tal: ["Vælg en standard i tabellen, fx den med 20,0 µM.",
                          "Den har A = {A20}. Tælleren er A, nævneren er c."],
                    res: ["Regn brøken ud på lommeregneren.",
                          "Skriv svaret med tre betydende cifre, fx 0,0123."]
                },
                loest: "a = {a} µM⁻¹. A stiger {a} for hver µM farvestof."
            },
            {
                type: "maal", id: "pr", proeve: true, titel: "Mål sodavanden",
                linje: "Sæt den fortyndede {proeve} i spektrofotometeret.",
                kuvetter: ["p"],
                hint: ["Sodavanden er kuvetten længst til højre i stativet."],
                loest: "Sodavandens absorbans står som en gul stiplet linje på grafen.",
                resume: "A = {A}"
            },
            {
                type: "aflaes", id: "afl", proeve: true, titel: "Aflæs koncentrationen",
                linje: "Aflæs sodavandens koncentration på grafen.",
                hint: ["Følg den gule stiplede linje, til den rammer standardkurven.",
                       "Gå lodret ned fra skæringspunktet til c-aksen, og aflæs tallet.",
                       "Skæringspunktet ligger mellem {lav} og {hoej} µM."],
                loest: "Aflæst: c ≈ {cAfl} µM.",
                resume: "c ≈ {cAfl} µM"
            },
            {
                type: "regn", id: "c", regn: "koncentration", proeve: true, titel: "Beregn koncentrationen",
                linje: "Beregn koncentrationen i kuvetten med A = a · c.",
                info: "Du kender sodavandens A og hældningen a = {a} µM⁻¹.",
                hint: {
                    formel: ["Isolér c i A = a · c. Del begge sider med a.",
                             "c = A / …"],
                    tal: ["A er sodavandens absorbans i tabellen, a er hældningen fra trin 3.",
                          "c = {A} / {a} µM⁻¹"],
                    res: ["Regn brøken ud på lommeregneren.",
                          "Svaret skal ligge tæt på det, du aflæste: ca. {cAfl} µM."]
                },
                loest: "c = {c} µM. Det passer med aflæsningen på grafen."
            },
            {
                type: "regn", id: "foer", regn: "fortyndFoer", proeve: true, titel: "Find koncentrationen i flasken",
                linje: "Sodavanden blev fortyndet. Find koncentrationen i flasken.",
                info: "{vFoer} mL sodavand blev fortyndet til {vEfter} mL i en målekolbe.",
                hint: {
                    formel: ["Stofmængden af farvestof er den samme før og efter fortyndingen: c<sub>før</sub> · V<sub>før</sub> = c<sub>efter</sub> · V<sub>efter</sub>.",
                             "c<sub>før</sub> = c<sub>efter</sub> · V<sub>efter</sub> / …"],
                    tal: ["c<sub>efter</sub> er koncentrationen i kuvetten, {c} µM. V<sub>efter</sub> er målekolbens rumfang.",
                          "c<sub>før</sub> = {c} µM · {vEfter} mL / {vFoer} mL"],
                    res: ["mL går ud med mL, så svaret er i µM.",
                          "Sodavanden i flasken er {faktor} gange stærkere end i kuvetten."]
                },
                loest: "Flasken indeholder {cFlaske} µM E129. Det er {mgL} mg/L."
            }
        ],
        slut: "{proeveNavn} indeholder {cFlaske} µM E129, svarende til {mgL} mg/L.",
        alleSlut: "Alle tre sodavand er analyseret."
    };

    /* ===================================================================
       FANE 2: NITRIT I VAND (middel)
       =================================================================== */
    var MIDDEL = {
        id: "mid", navn: "Nitrit", niveau: "middel",
        titel: "Nitrit i vand",
        spoergsmaal: "Hvor meget nitrit, NO₂⁻, er der i vandprøverne?",
        lambdaer: [540], maaletid: 0.9,
        stam: 50.0, vEfter: 50.0,
        reagenser: true,
        kuvetter: [
            { id: "s1", navn: "standard 1", etiket: ["1", "0 mL"], indhold: { nitrit: 0 }, rolle: "blind", vFoer: 0, c: 0, stoej: 0 },
            { id: "s2", navn: "standard 2", etiket: ["2", "2 mL"], indhold: { nitrit: 2 }, rolle: "std", vFoer: 2.0, c: 2, stoej: 0.003 },
            { id: "s3", navn: "standard 3", etiket: ["3", "4 mL"], indhold: { nitrit: 4 }, rolle: "std", vFoer: 4.0, c: 4, stoej: -0.004 },
            { id: "s4", navn: "standard 4", etiket: ["4", "6 mL"], indhold: { nitrit: 6 }, rolle: "std", vFoer: 6.0, c: 6, stoej: 0.002 },
            { id: "s5", navn: "standard 5", etiket: ["5", "8 mL"], indhold: { nitrit: 8 }, rolle: "std", vFoer: 8.0, c: 8, stoej: 0.005 },
            { id: "s6", navn: "standard 6", etiket: ["6", "10 mL"], indhold: { nitrit: 10 }, rolle: "std", vFoer: 10.0, c: 10, stoej: -0.003 },
            { id: "p1", navn: "", etiket: [], rolle: "proeve", nr: 0, stoej: 0.002 },
            { id: "p2", navn: "", etiket: [], rolle: "proeve", nr: 1, stoej: -0.003 }
        ],
        proever: [
            { navn: "Drikkevand og spildevand",
              par: [
                  { navn: "drikkevandet", Navn: "Drikkevand", etiket: ["Drikke-", "vand"], indhold: { nitrit: 1.80 }, drikke: true },
                  { navn: "spildevandet", Navn: "Spildevand", etiket: ["Spilde-", "vand"], indhold: { nitrit: 8.20 } }
              ] },
            { navn: "Brøndvand og akvarievand",
              par: [
                  { navn: "brøndvandet", Navn: "Brøndvand", etiket: ["Brønd-", "vand"], indhold: { nitrit: 3.10 }, drikke: true },
                  { navn: "akvarievandet", Navn: "Akvarievand", etiket: ["Akvarie-", "vand"], indhold: { nitrit: 6.60 } }
              ] }
        ],
        /* Graensevaerdien for nitrit i drikkevand ved taphanen: 0,10 mg/L.
           M(NO₂⁻) = 46,01 g/mol, saa 0,10 mg/L = 2,17 µM. */
        graense: { mgL: 0.10, uM: 2.17, M: 46.01 },
        grafer: [
            { id: "g", titel: "Standardkurve ved 540 nm", xMaks: 11, xTrin: 1, xFin: 0, yMaks: 0.5, yTrin: 0.1,
              serier: [{ id: "n", stof: "azo", lambda: 540, farve: "#ff6b8e" }] }
        ],
        trin: [
            {
                type: "reagens", id: "farv", titel: "Farv prøverne",
                linje: "Nitrit er farveløs. Tilsæt begge reagenser til alle kuvetterne.",
                hint: ["De to dråbeflasker står til højre på bordet.",
                       "Klik på sulfanilamid og derefter på koblingsreagens. Du kan også trække dem hen til stativet."],
                loest: "Nitrit er blevet til et rødt azofarvestof. Jo mere nitrit, jo mere rødt.",
                resume: "Nitrit → rødt azofarvestof"
            },
            {
                type: "maal", id: "std", titel: "Nulstil, og mål standarderne",
                linje: "Nulstil med standard 1, og mål standard 2 til 6.",
                kuvetter: ["s1", "s2", "s3", "s4", "s5", "s6"],
                hint: ["Standard 1 er blindprøven. Den har fået reagenser, men intet nitrit.",
                       "Mål standard 1 først. Så er instrumentet nulstillet.",
                       "Mål derefter standard 2 til 6 én ad gangen."],
                loest: "Alle seks standarder er målt. Koncentrationerne mangler stadig, så punkterne er ikke på grafen endnu.",
                resume: "A er målt for standard 1 til 6"
            },
            {
                type: "regn", id: "c2", regn: "fortyndEfter", titel: "Beregn c i standard 2",
                linje: "Beregn nitritkoncentrationen i standard 2.",
                info: "Stamopløsningen har c = 50,0 µM nitrit. Til standard 2 blev 2,00 mL stamopløsning fortyndet til 50,0 mL.",
                hint: {
                    formel: ["Stofmængden af nitrit er den samme før og efter fortyndingen: c<sub>før</sub> · V<sub>før</sub> = c<sub>efter</sub> · V<sub>efter</sub>.",
                             "c<sub>efter</sub> = c<sub>før</sub> · V<sub>før</sub> / …"],
                    tal: ["c<sub>før</sub> er stamopløsningens koncentration, 50,0 µM. V<sub>efter</sub> er hele målekolbens rumfang.",
                          "c<sub>efter</sub> = 50,0 µM · 2,00 mL / 50,0 mL"],
                    res: ["mL går ud med mL, så svaret er i µM.",
                          "Standarden er fortyndet 25 gange."]
                },
                loest: "Standard 2 har c = 2,00 µM. Punktet står nu på grafen."
            },
            {
                type: "tal", id: "c36", titel: "Beregn c i standard 3 til 6",
                linje: "Beregn koncentrationen i standard 3 til 6 på samme måde.",
                felter: ["s3", "s4", "s5", "s6"],
                loest: "Alle punkter er på grafen. Programmet har tegnet den bedste rette linje: A = {a} · c.",
                resume: "Standardkurven: A = {a} · c"
            },
            {
                type: "maal", id: "pr", proeve: true, titel: "Mål vandprøverne",
                linje: "Mål {p1} og {p2}.",
                kuvetter: ["p1", "p2"],
                hint: ["Vandprøverne står til højre for standarderne. De har også fået reagenser."],
                loest: "Prøvernes absorbans står som stiplede linjer på grafen.",
                resume: "{P1}: A = {A1}, {P2}: A = {A2}"
            },
            {
                type: "regn", id: "c1", regn: "koncentration", proeve: true, titel: "Beregn nitrit i {p1}",
                linje: "Beregn nitritkoncentrationen i {p1} med standardkurven.",
                info: "Standardkurven: A = {a} · c",
                hint: {
                    formel: ["Isolér c i standardkurvens ligning A = a · c.",
                             "c = A / …"],
                    tal: ["A er {p1}s absorbans i tabellen. a er hældningen i standardkurvens ligning.",
                          "c = {A1} / {a} µM⁻¹"],
                    res: ["Regn brøken ud på lommeregneren.",
                          "Svaret skal passe med grafen: {p1}s linje rammer kurven nær {cRund} µM."]
                },
                loest: "{P1} indeholder {c1} µM nitrit."
            },
            {
                type: "tal", id: "cp2", proeve: true, titel: "Beregn nitrit i {p2}",
                linje: "Beregn nitritkoncentrationen i {p2} på samme måde.",
                felter: ["p2"],
                loest: "{P2} indeholder {c2} µM nitrit.",
                resume: "c = {c2} µM"
            }
        ],
        alleSlut: "Begge par vandprøver er analyseret."
    };

    /* ===================================================================
       FANE 3: TO FARVESTOFFER (svaer)
       =================================================================== */
    var SVAER = {
        id: "svr", navn: "To farvestoffer", niveau: "svær",
        titel: "Grøn sodavand",
        spoergsmaal: "Den grønne farve er gult E102 og blåt E133. Hvor meget er der af hvert?",
        lambdaer: [427, 630], maaletid: 0.6,
        kuvetter: [
            { id: "blind", navn: "blindprøven", etiket: ["Blind"], indhold: {}, rolle: "blind", c: 0 },
            { id: "g1", navn: "den gule standard med 10,0 µM", etiket: ["10", "gul"], indhold: { gul: 10 }, rolle: "std", stof: "gul", c: 10 },
            { id: "g2", navn: "den gule standard med 20,0 µM", etiket: ["20", "gul"], indhold: { gul: 20 }, rolle: "std", stof: "gul", c: 20 },
            { id: "g3", navn: "den gule standard med 30,0 µM", etiket: ["30", "gul"], indhold: { gul: 30 }, rolle: "std", stof: "gul", c: 30 },
            { id: "g4", navn: "den gule standard med 40,0 µM", etiket: ["40", "gul"], indhold: { gul: 40 }, rolle: "std", stof: "gul", c: 40 },
            { id: "b1", navn: "den blå standard med 2,00 µM", etiket: ["2", "blå"], indhold: { blaa: 2 }, rolle: "std", stof: "blaa", c: 2 },
            { id: "b2", navn: "den blå standard med 4,00 µM", etiket: ["4", "blå"], indhold: { blaa: 4 }, rolle: "std", stof: "blaa", c: 4 },
            { id: "b3", navn: "den blå standard med 6,00 µM", etiket: ["6", "blå"], indhold: { blaa: 6 }, rolle: "std", stof: "blaa", c: 6 },
            { id: "b4", navn: "den blå standard med 8,00 µM", etiket: ["8", "blå"], indhold: { blaa: 8 }, rolle: "std", stof: "blaa", c: 8 },
            { id: "p", navn: "sodavanden", etiket: ["Soda-", "vand"], rolle: "proeve" }
        ],
        proever: [
            { navn: "Grøn sodavand", kort: "den grønne sodavand", indhold: { gul: 15.0, blaa: 6.00 } },
            { navn: "Grøn sportsdrik", kort: "sportsdrikken", indhold: { gul: 24.0, blaa: 3.20 } },
            { navn: "Mintsirup", kort: "mintsiruppen", indhold: { gul: 8.0, blaa: 7.20 } }
        ],
        grafer: [
            { id: "gg", titel: "Gult farvestof, E102", stof: "gul", xMaks: 45, xTrin: 5, xFin: 0, yMaks: 1.2, yTrin: 0.2,
              serier: [{ id: "g427", stof: "gul", lambda: 427, farve: D.LYS[427] },
                       { id: "g630", stof: "gul", lambda: 630, farve: D.LYS[630] }] },
            { id: "gb", titel: "Blåt farvestof, E133", stof: "blaa", xMaks: 9, xTrin: 1, xFin: 0, yMaks: 1.2, yTrin: 0.2,
              serier: [{ id: "b427", stof: "blaa", lambda: 427, farve: D.LYS[427] },
                       { id: "b630", stof: "blaa", lambda: 630, farve: D.LYS[630] }] }
        ],
        trin: [
            {
                type: "maal", id: "std", titel: "Mål standarderne ved 427 og 630 nm",
                linje: "Nulstil, og mål alle otte standarder ved både 427 nm og 630 nm.",
                kuvetter: ["blind", "g1", "g2", "g3", "g4", "b1", "b2", "b3", "b4"],
                lambdaer: [427, 630],
                hint: ["Skift bølgelængde med de to knapper på spektrofotometeret.",
                       "Mål blindprøven først. Mål så alle standarder ved 427 nm, skift til 630 nm, og mål dem igen."],
                loest: "Se på graferne: hvilket farvestof opsuger ved hvilken bølgelængde?",
                resume: "4 standardkurver"
            },
            {
                type: "maal", id: "pr", proeve: true, titel: "Mål sodavanden ved begge bølgelængder",
                linje: "Mål {proeve} ved 427 nm og ved 630 nm.",
                kuvetter: ["p"], lambdaer: [427, 630],
                hint: ["Sodavanden er kuvetten længst til højre i stativet.",
                       "Mål den, skift bølgelængde, og mål den igen."],
                loest: "Sodavandens absorbans står på begge grafer.",
                resume: "A₄₂₇ = {A427}, A₆₃₀ = {A630}"
            },
            {
                type: "tal", id: "cb", proeve: true, titel: "Find c af det blå",
                linje: "Find koncentrationen af det blå farvestof i {proeve}.",
                felter: ["blaa"],
                loest: "c(blå) = {cb} µM.",
                resume: "c(blå) = {cb} µM"
            },
            {
                type: "tal", id: "cg", proeve: true, titel: "Find c af det gule",
                linje: "Find koncentrationen af det gule farvestof i {proeve}.",
                felter: ["gul"],
                loest: "c(gul) = {cg} µM. Ved 427 nm kommer {Ag} fra det gule og {Ab} fra det blå.",
                resume: "c(gul) = {cg} µM"
            }
        ],
        alleSlut: "Alle tre grønne drikke er analyseret."
    };

    D.FANER = { let: LET, mid: MIDDEL, svr: SVAER };
    D.RAEKKE = ["let", "mid", "svr"];

    /* ===================================================================
       QUIZZEN: svar[0] er det rigtige. nej[i] passer til svar i.
       =================================================================== */
    D.QUIZ = [
        {
            q: "Hvorfor måler man først en blindprøve?",
            svar: ["Så instrumentet trækker kuvettens og opløsningsmidlets absorbans fra",
                   "For at finde farvestoffets koncentration",
                   "For at lampen kan nå at blive varm",
                   "Så der kommer et ekstra punkt på grafen"],
            nej: [null,
                  "Blindprøven indeholder intet farvestof. Den giver nulpunktet.",
                  "Lampen skal være tændt i forvejen, men det er ikke det, blindprøven gør.",
                  "Punktet (0, 0) kommer med, men formålet er at nulstille instrumentet."],
            hvorfor: "Blindprøven indeholder alt det samme som prøverne undtagen det farvede stof. Når den sættes til A = 0, måler instrumentet bagefter kun det farvede stof."
        },
        {
            q: "Hvad sker der med absorbansen, når koncentrationen af farvestoffet fordobles?",
            svar: ["Den fordobles", "Den halveres", "Den er uændret", "Den stiger med 0,3"],
            nej: [null,
                  "Det er transmittansen, der falder, når der kommer mere farvestof. A stiger.",
                  "Flere molekyler opsuger flere fotoner.",
                  "Det gælder ikke generelt. A er proportional med c."],
            hvorfor: "Lambert-Beers lov: A = ε · l · c. A er proportional med c, så standardkurven er en ret linje gennem (0, 0)."
        },
        {
            q: "Hvorfor laver man en standardrække i stedet for kun at måle prøven?",
            svar: ["Hældningen måles under de samme forhold som prøven, og så kan A regnes om til c",
                   "Fordi absorbansen af en prøve ikke kan måles alene",
                   "For at fortynde prøven, så den kan måles",
                   "Fordi spektrofotometeret kun virker med fem kuvetter"],
            nej: [null,
                  "Prøvens absorbans kan godt måles alene. Det er omregningen til koncentration, der kræver standardkurven.",
                  "Standarderne fortynder ikke prøven. De er opløsninger med kendt koncentration.",
                  "Instrumentet måler én kuvette ad gangen, så mange man vil."],
            hvorfor: "Standardkurven giver sammenhængen A = a · c for netop dette stof, denne bølgelængde og dette instrument. Med den kan en målt A regnes om til c."
        },
        {
            q: "Sulfanilamid og koblingsreagens tilsættes både standarderne og vandprøverne. Hvorfor?",
            svar: ["Nitrit er farveløs, så den skal omdannes til et farvet stof, der kan måles",
                   "Reagenserne fortynder prøverne, så A bliver mindre",
                   "Reagenserne fjerner andre farvede stoffer i vandet",
                   "Reagenserne nulstiller spektrofotometeret"],
            nej: [null,
                  "De fortynder lidt, men lige meget i alle kuvetter. Formålet er farven.",
                  "De danner et farvet stof med nitrit. De fjerner ikke andre stoffer.",
                  "Det gør blindprøven."],
            hvorfor: "Nitrit og sulfanilamid danner en farveløs diazoniumion. Den reagerer med koblingsreagenset og giver et rødt azofarvestof, der opsuger lys ved 540 nm. Hver nitrition giver ét farvestofmolekyle."
        },
        {
            q: "Hvorfor venter man 10 minutter, før kuvetterne med nitrit måles?",
            svar: ["Reaktionen, der danner farvestoffet, skal nå at løbe færdig",
                   "Opløsningen skal køle af efter reaktionen",
                   "Spektrofotometeret skal varme op",
                   "Luftbobler skal nå at stige op"],
            nej: [null,
                  "Reaktionen udvikler ikke varme af betydning.",
                  "Det er farven i kuvetterne, man venter på, ikke instrumentet.",
                  "Bobler kan forstyrre, men det er ikke grunden til de 10 minutter."],
            hvorfor: "Farvestoffet dannes gradvist. Måler man for tidligt, er der mindre farvestof end nitrit, og A bliver for lille."
        },
        {
            q: "Standardkurven er A = 0,0463 · c. En prøve har A = 0,185. Hvad er c?",
            svar: ["4,00 µM", "0,00857 µM", "0,250 µM", "0,185 µM"],
            nej: [null,
                  "Det er A · a. Du skal dele: c = A / a.",
                  "Det er a / A. Brøken er vendt.",
                  "Det er absorbansen. Den har ingen enhed."],
            hvorfor: "c = A / a = 0,185 / 0,0463 µM⁻¹ = 4,00 µM."
        },
        {
            q: "En grøn sodavand indeholder et gult og et blåt farvestof. Ved 630 nm opsuger kun det blå. Hvad kan man så?",
            svar: ["Finde c af det blå direkte af A ved 630 nm",
                   "Finde c af det gule direkte af A ved 630 nm",
                   "Finde begge koncentrationer af A ved 630 nm",
                   "Ingenting, for absorbansen af en blanding kan ikke bruges"],
            nej: [null,
                  "Ved 630 nm opsuger det gule ikke. A ved 630 nm siger intet om det gule.",
                  "Én absorbans kan kun give én koncentration.",
                  "Absorbanserne af de to stoffer lægges sammen, så blandingen kan godt bruges."],
            hvorfor: "Når kun ét stof opsuger ved en bølgelængde, kommer hele A fra det stof: c = A / a."
        },
        {
            q: "Ved 427 nm har den grønne sodavand A = 0,444. Det blå bidrager med 0,039. Hvor stor er det gules absorbans?",
            svar: ["0,405", "0,483", "0,444", "0,039"],
            nej: [null,
                  "Du har lagt det blås bidrag til. Det skal trækkes fra.",
                  "0,444 er begge farvestoffer tilsammen.",
                  "Det er det blås bidrag."],
            hvorfor: "Absorbanserne lægges sammen: A = A(gul) + A(blå). Så er A(gul) = 0,444 − 0,039 = 0,405."
        }
    ];

    NK.Data = D;
}());

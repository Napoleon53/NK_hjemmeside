/* =====================================================================
   data.js - grundstofferne, maalene, parrene, ordrerne og replikkerne

   Alt, der kan staa som data, staar her. Masser regnes i hundrededele
   af et gram (heltal), saa 3 · 63,55 giver praecis 190,65.

   Molarmasserne er IUPAC's standardatommasser (2021) rundet til to
   decimaler, som paa plakaten i sc4.1. Massefylderne er ved
   stuetemperatur (CRC Handbook of Chemistry and Physics); grafit er
   regnet som en ren krystal. Radierne er de metalliske radier i pm,
   og for carbon den halve C-C-afstand i grafit.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Avogadros konstant, som den staar i bogen og paa plakaten */
    D.NA = 6.02e23;
    D.NA_TEKST = "6,02 · 10²³ mol⁻¹";

    /* ----- De seks grundstoffer --------------------------------------------
       symbol, navn, atomnummer, molarmasse i hundrededele, massefylde i
       g/cm³, radius i pm og farven paa metallet (for carbon grafittens).
       Raekkefoelgen er molarmassens, og det er ogsaa krukkernes paa hylden. */
    var G = [
        ["C", "carbon", 6, 1201, 2.26, 71, "#44474f"],
        ["Al", "aluminium", 13, 2698, 2.70, 143, "#c3cad3"],
        ["Fe", "jern", 26, 5585, 7.87, 126, "#8a9099"],
        ["Cu", "kobber", 29, 6355, 8.96, 128, "#c7743e"],
        ["Ag", "sølv", 47, 10787, 10.49, 144, "#dfe3e8"],
        ["Au", "guld", 79, 19697, 19.32, 144, "#e2b13c"]
    ];

    D.STOFFER = G.map(function (r, i) {
        return {
            nr: i, s: r[0], navn: r[1], Navn: r[1].charAt(0).toUpperCase() + r[1].slice(1),
            z: r[2], M: r[3], rho: r[4], r: r[5], farve: r[6],
            /* Rumfanget af 1 mol i cm³, og kanten paa en terning med det rumfang */
            Vm: r[3] / 100 / r[4],
            kant: Math.pow(r[3] / 100 / r[4], 1 / 3)
        };
    });

    var efterSymbol = {};
    D.STOFFER.forEach(function (st) { efterSymbol[st.s] = st; });
    D.stof = function (s) { return efterSymbol[s] || null; };

    /* Massen af n mol i hundrededele, rundet til vaegtens 0,01 g */
    D.masse = function (st, n) { return Math.round(n * st.M * (1 + 1e-12)); };

    /* Antallet af atomer i n mol */
    D.antal = function (n) { return n * D.NA; };

    /* Rumfanget af massen m (i hundrededele) i cm³ */
    D.rumfang = function (st, m) { return m / 100 / st.rho; };

    /* ----- Beregningerne, skrevet som eleven skal skrive dem -------------------
       n skrives, som opgaven skriver den ("0,250"), eller som et helt tal. */
    D.nTekst = function (n, tekst) { return tekst || String(n).replace(".", ","); };

    D.regnMasse = function (st, n, nTekst, resultat) {
        return "m = " + D.nTekst(n, nTekst) + " mol · " + NK.komma(st.M) + " g/mol" +
            (resultat ? " = " + resultat + " g" : "");
    };

    D.regnAntal = function (n, nTekst, resultat) {
        return "N = " + D.nTekst(n, nTekst) + " mol · " + D.NA_TEKST + (resultat ? " = " + resultat : "");
    };

    /* ----- Fane 1: vaegten ------------------------------------------------------
       Fire maal i raekkefoelge. Hver klump er 1 mol. Maalet er naaet, naar
       der ligger n mol af stoffet s paa vaegten. efter: beskeden bagefter. */
    D.KLUMPER_MAKS = 10;
    D.MAAL = [
        { s: "Cu", n: 1, tekst: "Læg 1 mol kobber på vægten.",
          hint: "Træk en klump fra krukken med kobber op på vægten. Hver klump er 1 mol.",
          efter: "1 mol kobber vejer 63,55 g. Det er 6,02 · 10²³ atomer." },
        { s: "Cu", n: 3, tekst: "Læg 3 mol kobber på vægten.",
          hint: "Hver klump er 1 mol. Der skal ligge tre klumper kobber.",
          efter: "3 mol vejer 3 gange så meget: 190,65 g. Og der er 3 gange så mange atomer." },
        { s: "Au", n: 3, tekst: "Skift til guld, og lad de 3 mol ligge.",
          hint: "Klik på krukken med guld. Klumperne på vægten skifter stof, men ikke antal.",
          efter: "Stadig 3 mol og lige mange atomer: 1,81 · 10²⁴. Men massen er 590,91 g." },
        { s: "C", n: 3, fremhaev: "alle", tekst: "Find det stof, hvor 3 mol vejer mindst.",
          hint: "Molarmassen står på krukkerne. Den mindste molarmasse giver den mindste masse.",
          efter: "3 mol carbon vejer kun 36,03 g. Carbonatomerne er de letteste her." }
    ];

    /* ----- Fane 2: flest atomer -----------------------------------------------
       To proever, hver givet som [symbol, maengde, "mol" eller "g"]. Niveau
       0 er mol mod mol, 1 samme masse og 2 gram mod mol. Forklaringen
       rammer fejlen, parret er valgt for: tungest er ikke flest. */
    D.PAR_NIVEAUER = [
        { navn: "Mol mod mol", hint: "Stofmængden tæller atomerne. Sammenlign antallet af mol, ikke massen." },
        { navn: "Samme masse", hint: "Samme masse på begge vægte. Hvilke atomer er lettest? Så skal der flest af dem til." },
        { navn: "Gram mod mol", hint: "Regn gram om til mol: n = m / M. Molarmasserne står nu på skiltet." }
    ];

    D.PAR = [
        [["Au", 1, "mol"], ["C", 1, "mol"], 0, "Samme stofmængde, lige mange atomer. Guldatomerne vejer bare mere."],
        [["Al", 2, "mol"], ["Au", 1, "mol"], 0, "2 mol er dobbelt så mange atomer som 1 mol, selv om guldet vejer mest."],
        [["Ag", 1, "mol"], ["Cu", 1, "mol"], 0, "1 mol af hver. Sølvet vejer mest, men atomerne er lige mange."],
        [["C", 3, "mol"], ["Fe", 2, "mol"], 0, "3 mol mod 2 mol. Jernet vejer mest, men carbon har flest atomer."],
        [["Au", 10, "g"], ["C", 10, "g"], 1, "Samme masse. Carbonatomerne er 16 gange lettere, så der er 16 gange flere."],
        [["Cu", 50, "g"], ["Ag", 50, "g"], 1, "Samme masse. Kobberatomerne er lettest, så der er flest af dem."],
        [["Al", 100, "g"], ["Fe", 100, "g"], 1, "Samme masse. Aluminiumatomerne er lettest, så der er flest af dem."],
        [["Au", 20, "g"], ["Ag", 20, "g"], 1, "Et sølvatom vejer lidt over det halve af et guldatom. Så er der næsten dobbelt så mange."],
        [["Al", 1, "mol"], ["Au", 100, "g"], 2, "100 g guld er kun 0,508 mol. Aluminiummet vejer mindst, men har flest atomer."],
        [["Cu", 63.55, "g"], ["Cu", 1, "mol"], 2, "63,55 g kobber er netop 1 mol. Det er molarmassen."],
        [["Fe", 50, "g"], ["Fe", 1, "mol"], 2, "1 mol jern vejer 55,85 g. 50 g er lidt mindre end 1 mol."],
        [["C", 2, "mol"], ["Ag", 100, "g"], 2, "100 g sølv er 0,927 mol. 2 mol carbon vejer kun 24,02 g, men er flest."],
        [["Au", 0.5, "mol"], ["Cu", 100, "g"], 2, "100 g kobber er 1,57 mol. Det er mere end 0,5 mol guld."]
    ].map(function (r) {
        function side(x) {
            var st = D.stof(x[0]);
            var n = x[2] === "mol" ? x[1] : x[1] / (st.M / 100);
            var m = x[2] === "mol" ? D.masse(st, x[1]) : Math.round(x[1] * 100);
            return { st: st, givet: x[2], tal: x[1], n: n, m: m };
        }
        return { a: side(r[0]), b: side(r[1]), niveau: r[2], hvorfor: r[3] };
    });

    D.RUNDE = [3, 3, 3];   /* par fra hvert niveau i en runde */

    /* To proever med saa taet et antal regnes for lige mange */
    D.LIGE = 0.001;

    /* Proeven, som den staar paa skiltet: "1 mol guld" eller "10,00 g carbon" */
    D.proeveTekst = function (p) {
        return (p.givet === "mol" ? D.nTekst(p.tal) + " mol " : NK.komma(p.m) + " g ") + p.st.navn;
    };

    D.RUNDE_REPLIK = [
        [0, "Tungt er ikke det samme som mange. Prøv igen."],
        [3, "Det er stofmængden, der tæller. Bogstaveligt."],
        [6, "Flertallet rigtigt. Vægtene er enige med dig."],
        [9, "Ni rigtige. Du tæller bedre end vægtene."]
    ];
    D.REKORD_REPLIK = "Ny rekord. Jeg noterer det. Et sted.";

    /* ----- Fane 3: afvejning -------------------------------------------------
       En ordre er [niveau, symbol, stofmaengden, som den staar i ordren].
       Svarene regnes med tre betydende cifre, som stofmaengden har. */
    D.ORDRE_NIVEAUER = [
        { navn: "Hele mol", kort: "2,00 mol kobber og tre andre", farve: "#3d9ee0" },
        { navn: "Under 1 mol", kort: "0,500 mol jern og tre andre", farve: "#3fae72" },
        { navn: "Skæve tal", kort: "0,0400 mol guld og tre andre", farve: "#e6892a" }
    ];

    D.ORDRER = [
        [0, "Cu", "2,00"], [0, "Al", "3,00"], [0, "C", "5,00"], [0, "Au", "1,00"],
        [1, "Fe", "0,500"], [1, "Ag", "0,250"], [1, "Cu", "0,750"], [1, "Au", "0,100"],
        [2, "Al", "1,35"], [2, "Au", "0,0400"], [2, "Ag", "0,0250"], [2, "C", "2,40"]
    ].map(function (r, i) {
        var st = D.stof(r[1]), n = parseFloat(r[2].replace(",", "."));
        var mG = n * st.M / 100;
        return {
            nr: i, niveau: r[0], st: st, n: n, nTekst: r[2],
            m: mG, mTekst: NK.betydende(mG, 3), vaegt: D.masse(st, n),
            N: D.antal(n), NTekst: NK.potens(D.antal(n), 3)
        };
    });
    D.ORDRE_NIVEAUER.forEach(function (nv, n) {
        var i = 0;
        D.ORDRER.forEach(function (o) { if (o.niveau === n) o.plads = i++; });
    });

    /* ----- Kemichael ------------------------------------------------------------
       Hoejst ca. 60 tegn pr. replik og ingen teori. */
    D.INTRO_VAEGT = [
        "Vægten. Hver klump fra en krukke er 1 mol.",
        "Træk dem op på vægten. Klik på en krukke for at skifte.",
        "Tæl gerne atomerne selv. Jeg venter ikke."
    ];
    D.INTRO_ATOMER = [
        "To vægte. De tæller atomer, men først når du har gættet.",
        "Hvor er der flest atomer? Svar til højre."
    ];
    D.INTRO_AFVEJ = [
        "Afvejning. Ordren står til højre.",
        "Molarmassen står på krukken. Resten er et gangestykke.",
        "Vægten afvejer, når tallet er rigtigt. Ikke før."
    ];

    D.MAAL_FAERDIG = "Fire mål. Guldet bliver på hylden, tak.";

    D.ORDRE_ROS = [
        "Fire ordrer afvejet. Hele mol er de nemme.",
        "Under 1 mol, og intet gik tabt.",
        "Skæve tal og store potenser. Godt regnet."
    ];
    D.ORDRER_FAERDIG = "Tolv ordrer afvejet. Jeg skriver det i regnskabet.";

    NK.Data = D;
}());

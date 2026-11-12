/* =====================================================================
   data.js - grundstofferne, parrene, ordrerne og replikkerne

   Alt, der kan staa som data, staar her. Masser regnes i hundrededele
   af et gram (heltal), saa 3 · 63,55 giver praecis 190,65.

   Molarmasserne er IUPAC's standardatommasser (2021) rundet til to
   decimaler, som paa plakaten i sc5.1. Massefylderne er ved
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
       Hver klump er 1 mol, og klumper af forskellige stoffer kan ligge
       sammen. Maalene og opgaverne staar i js/opgaver.js. */
    D.KLUMPER_MAKS = 10;

    /* ----- Fane 2: flest atomer -----------------------------------------------
       To proever, hver givet som [symbol, maengde, "mol" eller "g"]. Niveau
       0 er mol mod mol, 1 samme masse og 2 gram mod mol. Forklaringen
       rammer fejlen, parret er valgt for: tungest er ikke flest. */
    D.PAR_NIVEAUER = [
        { navn: "Mol mod mol", hint: "Stofmængden tæller atomerne. Sammenlign antallet af mol, ikke massen." },
        { navn: "Samme masse", hint: "Begge vægte viser samme masse. Hvilke atomer er lettest? Der skal flest af de letteste atomer til." },
        { navn: "Gram mod mol", hint: "Regn gram om til mol: n = m / M. Molarmasserne står nu på skiltet." }
    ];

    D.PAR = [
        [["Au", 1, "mol"], ["C", 1, "mol"], 0, "Samme stofmængde betyder lige mange atomer. Guldatomerne vejer blot mere."],
        [["Al", 2, "mol"], ["Au", 1, "mol"], 0, "2 mol er dobbelt så mange atomer som 1 mol, selv om guldet vejer mest."],
        [["Ag", 1, "mol"], ["Cu", 1, "mol"], 0, "1 mol af hver. Sølvet vejer mest, men atomerne er lige mange."],
        [["C", 3, "mol"], ["Fe", 2, "mol"], 0, "3 mol mod 2 mol. Jernet vejer mest, men carbon har flest atomer."],
        [["Au", 10, "g"], ["C", 10, "g"], 1, "Samme masse. Carbonatomerne er 16 gange lettere end guldatomerne, så der er 16 gange flere."],
        [["Cu", 50, "g"], ["Ag", 50, "g"], 1, "Samme masse. Kobberatomerne er lettest, så der er flest af dem."],
        [["Al", 100, "g"], ["Fe", 100, "g"], 1, "Samme masse. Aluminiumatomerne er lettest, så der er flest af dem."],
        [["Au", 20, "g"], ["Ag", 20, "g"], 1, "Et sølvatom vejer lidt over det halve af et guldatom, og derfor er der næsten dobbelt så mange sølvatomer."],
        [["Al", 1, "mol"], ["Au", 100, "g"], 2, "100 g guld er kun 0,508 mol. Aluminiummet vejer mindst, men har flest atomer."],
        [["Cu", 63.55, "g"], ["Cu", 1, "mol"], 2, "63,55 g kobber er netop 1 mol, fordi molarmassen for kobber er 63,55 g/mol."],
        [["Fe", 50, "g"], ["Fe", 1, "mol"], 2, "1 mol jern vejer 55,85 g. 50 g er lidt mindre end 1 mol."],
        [["C", 2, "mol"], ["Ag", 100, "g"], 2, "100 g sølv er 0,927 mol. 2 mol carbon vejer kun 24,02 g, men har flest atomer."],
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


    /* ----- Fane 3: afvejning -------------------------------------------------
       En ordre er [niveau, symbol, stofmaengden, som den staar i ordren].
       Massen regnes med tre betydende cifre, som stofmaengden har. */
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
            m: mG, mTekst: NK.betydende(mG, 3), vaegt: D.masse(st, n)
        };
    });
    D.ORDRE_NIVEAUER.forEach(function (nv, n) {
        var i = 0;
        D.ORDRER.forEach(function (o) { if (o.niveau === n) o.plads = i++; });
    });

    /* ----- Kemichael ------------------------------------------------------------
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (CSS-
       selectorer; tingene paa laerredet er de usynlige .anker fra
       rundvisningen). Ingen vittigheder i praesentationen. */
    D.INTRO_VAEGT = [
        { tekst: "I denne fane lægger du klumper af seks grundstoffer på en vægt og ser, hvad de vejer. Hver klump i en krukke på hylden er 1 mol, og etiketten på krukken viser grundstoffets molarmasse.",
          sel: "#vaegt-anker-hylde" },
        { tekst: "Du trækker en klump op på vægten eller klikker på krukken, og klumper af forskellige grundstoffer må gerne ligge sammen. Panelet til højre viser stofmængden, massen og antallet af atomer for klumperne på vægten. Plakaten viser, at 1 mol altid er 6,02 · 10²³ atomer.",
          sel: ["#vaegt-anker-vaegt", "#vaegt-maaling", "#vaegt-anker-plakat"] },
        { tekst: "Kortet øverst i scenen giver først tre opgaver som opvarmning og derefter sværere opgaver med nye tal hver gang. Når vægten passer med opgaven, trykker du Indsend svar. Knappen Giv hint giver et hint og derefter svaret.",
          sel: "#vaegt-skort" }
    ];
    D.INTRO_ATOMER = [
        { tekst: "I denne fane gætter du, hvor der er flest atomer, når to prøver står på hver sin vægt. Skiltet på bordet viser prøverne i mol eller i gram, og vægtene viser massen af prøverne.",
          sel: ["#atomer-anker-vaegte", "#atomer-anker-skilt"] },
        { tekst: "Du vælger venstre, lige mange eller højre på kortet øverst i scenen eller med piletasterne. Så trykker du Indsend svar. Bagefter tæller vægtene atomerne, og skiltet viser beregningen.",
          sel: "#atomer-skort" },
        { tekst: "En runde består af ni par fra tre niveauer, og panelet viser dine rigtige svar og din rekord. Knappen Giv hint på kortet giver et hint og derefter svaret.",
          sel: ["#atomer-knap", "#atomer-runden"] }
    ];
    D.INTRO_AFVEJ = [
        { tekst: "I denne fane regner du massen ud for en ordre. Kortet øverst i scenen viser stofmængden af et grundstof, og vægten skal vise massen af netop den stofmængde. Du skriver massen i regnestykket i panelet og trykker Indsend svar.",
          sel: ["#afvej-skort", "#afvej-regn"] },
        { tekst: "Etiketten på krukken viser grundstoffets molarmasse, og plakaten viser formlen m = n · M med enhederne. Når massen er rigtig, bliver stoffet fra krukken hældt i vejebåden, og vægten viser massen.",
          sel: ["#afvej-anker-plakat", "#afvej-anker-krukke", "#afvej-anker-vaegt"] },
        { tekst: "Knappen Giv hint på kortet giver et hint og derefter svaret. Du får en stjerne for hver ordre, som du løser uden at se svaret, og listen i panelet viser ordrerne i de tre niveauer.",
          sel: ["#afvej-knap", "#afvej-fremskridt"] }
    ];

    /* Han kommer kun ind af sig selv, naar en hel fane er klaret (brugerens
       regel 4. nov. 2026). Fane 2: én gang pr. besoeg, naar en runde er
       slut med mindst RUNDE_GOD rigtige. Fane 3: naar alle tolv ordrer er
       afvejet. Fane 1 har ingen ende og ingen ros. */
    D.RUNDE_GOD = 6;
    D.RUNDE_ALLE = 9;
    D.RUNDE_REPLIK = "Du har svaret rigtigt på de fleste par, og vægtene er enige med dig.";
    D.RUNDE_ALLE_REPLIK = "Du har ni rigtige ud af ni. Du tæller atomer bedre end vægtene.";
    D.REKORD_REPLIK = "Det er en ny rekord. Jeg skriver den ned et sted.";
    D.ORDRER_FAERDIG = "Du har afvejet alle tolv ordrer. Jeg skriver det ind i regnskabet.";

    NK.Data = D;
}());

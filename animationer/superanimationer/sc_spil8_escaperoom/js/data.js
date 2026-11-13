/* =====================================================================
   data.js - tekster, puljer og tal for EscapeRoom Kemi C

   Alt, hvad der kan rettes uden at roere logikken, staar her. Sagens
   tilfaeldige tal traekkes af js/sag.js fra puljerne nedenfor.

   Hvert rum har tre trin, som alle kan komme igennem (hvert trin
   tjekkes for sig), og en bonusrute med én svaer opgave. Bonusrutens
   guldkode aabner doeren i stedet og giver en guldnoegle.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D = {};

    D.LAGER = "nk-escaperoom";
    D.VERSION = 2;

    /* Efter saa mange forkerte svar paa en del kommer knappen Vis svaret
       (ogsaa uden at hintet er laest), saa ingen sidder fast. */
    D.VIS_SVAR_EFTER = 3;

    /* Rummenes farver (noeglerne og doerene). */
    D.FARVE = { 1: "#2f8fd8", 2: "#27ae60", 3: "#8e59b6", 4: "#e67e22", 5: "#e0483a", 6: "#f1c40f" };

    D.START = {
        titel: "EscapeRoom Kemi C",
        under: "Niller er låst inde",
        tekst: "Strømmen gik i kemifløjen, og sikkerhedsdørene smækkede i. Kemilæreren Niller sidder i det inderste laboratorium med kagen til klassens sidste time. Fem døre skal åbnes, før I når ind til ham.",
        regler: [
            "Niller har selv kodet låsene. Koden til en dør er svarene på opgaverne i rummet.",
            "Kortet øverst siger altid, hvad næste trin er. De løste trin giver cifrene til koden.",
            "Hvert rum har også en bonusrute med en svær opgave. Dens guldkode åbner døren og giver en guldnøgle.",
            "Hver sag har sine egne tal. En anden gruppes kode passer ikke i jeres lås."
        ],
        knap: "Start"
    };

    /* niller: det, han siger i samtaleanlaegget, naar I kommer ind. */
    D.RUM = {
        1: { titel: "Forberedelsesrummet", niller: "Jeg nåede ikke at rydde op. Koden er atomnummeret på metallet i Prøve X og koefficienterne i skemaet på tavlen." },
        2: { titel: "Kemikalielageret", niller: "Her står væskerne til forsøget om blandbarhed. Koden er tre tal om polaritet og bindinger." },
        3: { titel: "Vejerummet", niller: "Metallet ved vægten skulle bruges til at lave dihydrogen. Koden er rumfanget af den gas, metallet kan give." },
        4: { titel: "Titrerlaboratoriet", niller: "Syren i kolben har mistet sin etiket. Koden er syrens pH." },
        5: { titel: "Redoxlaboratoriet", niller: "Jeg sidder lige bag den røde dør. Koden er koncentrationen af prøven i kolben." },
        6: { titel: "Den gyldne dør", tekst: "Med fem guldnøgler kommer I længere end Niller. Bag hans laboratorium står en dør af guld, og fire segl holder den lukket. Hvert segl brydes med titlen fra et af jeres andre kemispil." }
    };

    D.TOP = {
        fundet: "Koden er fundet. Klik på kodelåsen ved døren.",
        aaben: "Døren er åben.",
        bonusChip: "Bonusrute",
        kode: "Kode"
    };

    D.LAAS = {
        kode: "Koden fra de tre trin",
        guld: "Guldkoden fra bonusruten",
        mangler: "Cifrene kommer, når trinene er løst.",
        forkert: "Låsen giver ikke efter.",
        guldForkert: "Guldkoden passer ikke.",
        rigtig: "Klik. Døren går op.",
        rigtigGuld: "Klik. Døren går op, og nøglen er af guld.",
        guldSenere: "Guldkoden passer. Nøglen er nu af guld.",
        videre: function (n) { return n <= 5 ? "Gå ind i rum " + n : "Gå gennem døren"; },
        aaben: "Døren er åben."
    };

    D.BONUS = {
        om: "Bonusruten er sværere og har ingen hints. Svaret er guldkoden. Den åbner døren i stedet for den almindelige kode og giver en guldnøgle.",
        tast: "Tast svaret i kodelåsens guldfelter.",
        knap: "Gå til kodelåsen",
        loest: "Guldkoden er brugt. Nøglen fra dette rum er af guld."
    };

    D.SLUT = {
        stempel: "Niller er fri",
        titel: "I fandt Niller",
        tekst: "Niller sidder på en skammel med en kold kop kaffe og en kagedåse, der ikke er åbnet. »I brugte hele Kemi C på at nå herind,« siger han. »Så er I klar til eksamen.«",
        guldvej: "Guldnøgler får I med rummenes bonuskoder. Fem guldnøgler åbner den gyldne dør bag Nillers laboratorium. Klik på en jernnøgle for at gå tilbage til rummet.",
        alleGuld: "Alle fem nøgler er af guld."
    };

    D.FINALE = {
        stempel: "Sagen er opklaret i guld",
        titel: "Nillers pokalskab",
        tekst: "Bag den gyldne dør står Nillers pokalskab med fire pokaler: Superkemiker, Syreimmun, Labyrintmester og Stofgruppemester. Den femte hylde er tom. Niller sætter et skilt på den med jeres sagsnummer."
    };

    D.BEVIS = {
        etiket: "Bevis på gennemførsel",
        note: "Koden skifter hvert minut. Vis den til læreren."
    };

    /* ----- Rum 1: draabepladen ---------------------------------------- */
    /* Faeldningstabellen er sc2.4's (graensen 1 g pr. 100 mL). Farverne
       er sc2.4's [r, g, b]. null betyder intet bundfald.
       isotoper og q bruges af bonusruten. */
    D.LAB_IONER = {
        ag: { formel: "Ag⁺",  sym: "Ag", metal: "sølv",      Z: 47, q: 1, isotoper: [107, 109] },
        pb: { formel: "Pb²⁺", sym: "Pb", metal: "bly",       Z: 82, q: 2, isotoper: [206, 207, 208] },
        ba: { formel: "Ba²⁺", sym: "Ba", metal: "barium",    Z: 56, q: 2, isotoper: [137, 138] },
        ca: { formel: "Ca²⁺", sym: "Ca", metal: "calcium",   Z: 20, q: 2, isotoper: [40, 44] },
        cu: { formel: "Cu²⁺", sym: "Cu", metal: "kobber",    Z: 29, q: 2, isotoper: [63, 65], opl: [120, 175, 235] },
        mg: { formel: "Mg²⁺", sym: "Mg", metal: "magnesium", Z: 12, q: 2, isotoper: [24, 25, 26] }
    };
    D.LAB_REAGENSER = [
        { id: "cl",  formel: "NaCl" },
        { id: "i",   formel: "KI" },
        { id: "so4", formel: "Na₂SO₄" },
        { id: "oh",  formel: "NaOH" }
    ];
    var HVID = { ord: "hvidt", farve: [246, 246, 242] };
    D.LAB = {
        ag: { cl: HVID, i: { ord: "gult", farve: [240, 222, 110] }, so4: HVID, oh: { ord: "brunt", farve: [104, 78, 52] } },
        pb: { cl: HVID, i: { ord: "gult", farve: [250, 208, 40] }, so4: HVID, oh: HVID },
        ba: { cl: null, i: null, so4: HVID, oh: null },
        ca: { cl: null, i: null, so4: HVID, oh: HVID },
        cu: { cl: null, i: { ord: "brunt", farve: [150, 98, 44] }, so4: null, oh: { ord: "lyseblåt", farve: [100, 160, 225] } },
        mg: { cl: null, i: null, so4: null, oh: HVID }
    };

    /* ----- Rum 1: tavlen ----------------------------------------------- */
    /* Formlerne skrives med almindelige tal; tilstanden i parentes.
       k er koefficienterne fra venstre. Selvtesten taeller atomerne. */
    D.REAKTIONER = [
        { v: ["Al(s)", "O2(g)"],      h: ["Al2O3(s)"],          k: [4, 3, 2] },
        { v: ["Mg(s)", "O2(g)"],      h: ["MgO(s)"],            k: [2, 1, 2] },
        { v: ["Na(s)", "O2(g)"],      h: ["Na2O(s)"],           k: [4, 1, 2] },
        { v: ["Li(s)", "O2(g)"],      h: ["Li2O(s)"],           k: [4, 1, 2] },
        { v: ["Ca(s)", "O2(g)"],      h: ["CaO(s)"],            k: [2, 1, 2] },
        { v: ["Fe(s)", "O2(g)"],      h: ["Fe2O3(s)"],          k: [4, 3, 2] },
        { v: ["Fe(s)", "O2(g)"],      h: ["Fe3O4(s)"],          k: [3, 2, 1] },
        { v: ["Al(s)", "Cl2(g)"],     h: ["AlCl3(s)"],          k: [2, 3, 2] },
        { v: ["Fe(s)", "Cl2(g)"],     h: ["FeCl3(s)"],          k: [2, 3, 2] },
        { v: ["K(s)", "Cl2(g)"],      h: ["KCl(s)"],            k: [2, 1, 2] },
        { v: ["N2(g)", "H2(g)"],      h: ["NH3(g)"],            k: [1, 3, 2] },
        { v: ["H2(g)", "O2(g)"],      h: ["H2O(l)"],            k: [2, 1, 2] },
        { v: ["CH4(g)", "O2(g)"],     h: ["CO2(g)", "H2O(l)"],  k: [1, 2, 1, 2] },
        { v: ["C3H8(g)", "O2(g)"],    h: ["CO2(g)", "H2O(l)"],  k: [1, 5, 3, 4] },
        { v: ["C2H5OH(l)", "O2(g)"],  h: ["CO2(g)", "H2O(l)"],  k: [1, 3, 2, 3] },
        { v: ["Na(s)", "H2O(l)"],     h: ["NaOH(aq)", "H2(g)"], k: [2, 2, 2, 1] },
        { v: ["C2H6(g)", "O2(g)"],    h: ["CO2(g)", "H2O(l)"],  k: [2, 7, 4, 6] }
    ];

    /* ----- Rum 2: vaeskerne (blandbarhed) ------------------------------ */
    /* Alle par maa blandes frit, saa puljen har kun stoffer, hvor reglen
       "polaert blandes med polaert, upolaert med upolaert" holder.
       Ethanol, methanol og eddikesyre er derfor ikke med: de kan blandes
       med flere upolaere stoffer. taethed i g/mL afgoer, hvilket lag der
       ligger oeverst. fast: et fast stof (to faste stoffer blandes ikke). */
    D.VAND = { navn: "vand", polaer: true, taethed: 1.00, farve: [205, 226, 244] };
    D.BLAND_POLAER = [
        { navn: "glycerol", polaer: true, taethed: 1.26, farve: [226, 232, 238] },
        { navn: "ethan-1,2-diol", polaer: true, taethed: 1.11, farve: [214, 232, 232] },
        { navn: "urea", polaer: true, fast: true, farve: [250, 250, 250] }
    ];
    D.BLAND_UPOLAER = [
        { navn: "heptan", polaer: false, taethed: 0.68, farve: [236, 240, 222] },
        { navn: "hexan", polaer: false, taethed: 0.66, farve: [240, 236, 224] },
        { navn: "cyclohexan", polaer: false, taethed: 0.78, farve: [232, 240, 230] },
        { navn: "toluen", polaer: false, taethed: 0.87, farve: [240, 232, 216] },
        { navn: "olivenolie", polaer: false, taethed: 0.91, farve: [226, 208, 96] },
        { navn: "paraffinolie", polaer: false, taethed: 0.85, farve: [244, 240, 226] }
    ];

    /* ----- Rum 2: tavlen (polaritet) ----------------------------------- */
    /* Elektronegativiteterne er bogens og sc3.3's. */
    D.EN = { H: 2.1, C: 2.5, N: 3.0, O: 3.5, Cl: 3.0 };
    D.ATOM = {
        H:  { farve: "#eef1f5", r: 13, moerkTekst: true },
        C:  { farve: "#3b414b", r: 16 },
        N:  { farve: "#3464d6", r: 17 },
        O:  { farve: "#d93a2a", r: 17 },
        Cl: { farve: "#34ad48", r: 18 }
    };
    /* a: [symbol, x, y] i en kasse paa 200 x 150. b: [fra, til, type],
       hvor type er 1, 2, 3, "k" (kile, mod beskueren) eller "s"
       (stiplet, vaek fra beskueren). f: frie elektronpar [atom, vinkel].
       fordi: forklaringen, naar eleven svarer forkert om molekylet. */
    function tetra(c, a, b, d, e) {
        return { a: [[c, 100, 78], [a, 48, 30], [b, 152, 30], [d, 50, 128], [e, 150, 126]],
                 b: [[0, 1, 1], [0, 2, 1], [0, 3, "k"], [0, 4, "s"]] };
    }
    D.POLMOLEKYLER = [
        { formel: "H₂O", polaer: true, fordi: "H₂O er vinklet, så trækkene mod O ophæver ikke hinanden.",
          t: { a: [["O", 100, 62], ["H", 54, 108], ["H", 146, 108]], b: [[0, 1, 1], [0, 2, 1]], f: [[0, -135], [0, -45]] } },
        { formel: "NH₃", polaer: true, fordi: "NH₃ er en pyramide med N i toppen, så trækkene mod N ophæver ikke hinanden.",
          t: { a: [["N", 100, 54], ["H", 46, 104], ["H", 154, 104], ["H", 100, 124]], b: [[0, 1, 1], [0, 2, 1], [0, 3, "k"]], f: [[0, -90]] } },
        { formel: "HCl", polaer: true, fordi: "HCl har én polær binding, og Cl trækker elektronerne til sin ende.",
          t: { a: [["H", 66, 75], ["Cl", 128, 75]], b: [[0, 1, 1]] } },
        { formel: "HCN", polaer: true, fordi: "HCN har to forskellige ender, og N trækker elektronerne til sin ende.",
          t: { a: [["H", 34, 75], ["C", 90, 75], ["N", 158, 75]], b: [[0, 1, 1], [1, 2, 3]] } },
        { formel: "CH₃Cl", polaer: true, fordi: "CH₃Cl har kun ét Cl-atom, så trækket mod Cl bliver ikke ophævet.", t: tetra("C", "Cl", "H", "H", "H") },
        { formel: "CHCl₃", polaer: true, fordi: "CHCl₃ har tre Cl-atomer og ét H-atom, så molekylet er ikke symmetrisk.", t: tetra("C", "H", "Cl", "Cl", "Cl") },
        { formel: "CH₂Cl₂", polaer: true, fordi: "CH₂Cl₂ har de to Cl-atomer i den ene side, så trækkene ophæver ikke hinanden.", t: tetra("C", "Cl", "Cl", "H", "H") },
        { formel: "CH₄", polaer: false, fordi: "CH₄ er symmetrisk, og forskellen mellem C og H er kun 0,4, så bindingerne er upolære.", t: tetra("C", "H", "H", "H", "H") },
        { formel: "CCl₄", polaer: false, fordi: "CCl₄ har polære bindinger, men de fire træk peger hver sin vej og ophæver hinanden.", t: tetra("C", "Cl", "Cl", "Cl", "Cl") },
        { formel: "CO₂", polaer: false, fordi: "CO₂ er lineært, så de to træk mod O ophæver hinanden.",
          t: { a: [["O", 36, 75], ["C", 100, 75], ["O", 164, 75]], b: [[1, 0, 2], [1, 2, 2]] } },
        { formel: "N₂", polaer: false, fordi: "N₂ består af to ens atomer, så ingen af dem trækker mest.",
          t: { a: [["N", 70, 75], ["N", 130, 75]], b: [[0, 1, 3]] } },
        { formel: "Cl₂", polaer: false, fordi: "Cl₂ består af to ens atomer, så ingen af dem trækker mest.",
          t: { a: [["Cl", 68, 75], ["Cl", 132, 75]], b: [[0, 1, 1]] } },
        { formel: "O₂", polaer: false, fordi: "O₂ består af to ens atomer, så ingen af dem trækker mest.",
          t: { a: [["O", 70, 75], ["O", 130, 75]], b: [[0, 1, 2]] } }
    ];

    /* ----- Rum 2: flasken (streger) og bonusruten ---------------------- */
    D.STREGMOLEKYLER = [
        { formel: "HCN",   navn: "hydrogencyanid",  streger: 4 },
        { formel: "CO₂",   navn: "carbondioxid",    streger: 4 },
        { formel: "N₂",    navn: "dinitrogen",      streger: 3 },
        { formel: "C₂H₂",  navn: "ethyn",           streger: 5 },
        { formel: "C₂H₄",  navn: "ethen",           streger: 6 },
        { formel: "CH₂O",  navn: "methanal",        streger: 4 },
        { formel: "O₂",    navn: "dioxygen",        streger: 2 },
        { formel: "C₂H₆",  navn: "ethan",           streger: 7 },
        { formel: "CH₃OH", navn: "methanol",        streger: 5 },
        { formel: "H₂O₂",  navn: "hydrogenperoxid", streger: 3 }
    ];
    /* Bindinger og valenselektroner pr. atom (selvtestens kontrol). */
    D.VALENS = { H: 1, C: 4, N: 3, O: 2, Cl: 1 };
    D.VALENSELEKTRONER = { H: 1, C: 4, N: 5, O: 6, Cl: 7 };
    /* Bonus: streger og frie elektronpar i et stoerre molekyle. */
    D.BONUSMOLEKYLER = [
        { navn: "urea",           formel: "CO(NH₂)₂",    brutto: "CH4N2O", streger: 8,  par: 4 },
        { navn: "eddikesyre",     formel: "CH₃COOH",     brutto: "C2H4O2", streger: 8,  par: 4 },
        { navn: "methansyre",     formel: "HCOOH",       brutto: "CH2O2",  streger: 5,  par: 4 },
        { navn: "propanon",       formel: "CH₃COCH₃",    brutto: "C3H6O",  streger: 10, par: 2 },
        { navn: "methylamin",     formel: "CH₃NH₂",      brutto: "CH5N",   streger: 6,  par: 1 },
        { navn: "ethan-1,2-diol", formel: "HOCH₂CH₂OH",  brutto: "C2H6O2", streger: 9,  par: 4 },
        { navn: "carbonsyre",     formel: "H₂CO₃",       brutto: "CH2O3",  streger: 6,  par: 6 },
        { navn: "ethanal",        formel: "CH₃CHO",      brutto: "C2H4O",  streger: 7,  par: 2 }
    ];

    /* ----- Rum 3: metallet paa vaegten ---------------------------------- */
    /* M fra Databogen. forhold: [metal, H2] i skemaet. hcl: mol HCl pr.
       mol metal (bonusruten). Massen traekkes mellem lav og hoej, saa
       rumfanget bliver mellem 0,50 og 9,99 L. */
    D.METALLER = [
        { sym: "Mg", navn: "magnesium", form: "magnesiumbånd", M: 24.31, lav: 0.50, hoej: 4.00, forhold: [1, 1], hcl: 2,
          skema: "Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)" },
        { sym: "Zn", navn: "zink", form: "zinkgranulat", M: 65.38, lav: 1.50, hoej: 9.00, forhold: [1, 1], hcl: 2,
          skema: "Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)" },
        { sym: "Al", navn: "aluminium", form: "aluminiumsfolie", M: 26.98, lav: 0.40, hoej: 3.50, forhold: [2, 3], hcl: 3,
          skema: "2 Al(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂(g)" },
        { sym: "Fe", navn: "jern", form: "jernpulver", M: 55.85, lav: 1.20, hoej: 9.00, forhold: [1, 1], hcl: 2,
          skema: "Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)" }
    ];
    D.R = 0.08314;               /* L · bar / (mol · K) */
    D.TRYK = [0.985, 0.995, 1.000, 1.013, 1.020];
    D.BONUS_HCL_C = [0.500, 1.00, 2.00];    /* mol/L */

    /* ----- Rum 4: titreringen ------------------------------------------ */
    D.SYRER = [
        { formel: "HCl", navn: "saltsyre", bestemt: "saltsyren", anion: "Cl" },
        { formel: "HNO₃", navn: "salpetersyre", bestemt: "salpetersyren", anion: "NO₃" }
    ];
    D.BASER = [
        { formel: "NaOH", navn: "natriumhydroxid", kation: "Na" },
        { formel: "KOH", navn: "kaliumhydroxid", kation: "K" }
    ];
    D.SYRE_V = [10.0, 20.0, 25.0];          /* mL */
    D.BASE_C = [0.100, 0.0500, 0.200];      /* mol/L */

    /* ----- Rum 5: permanganattitreringen -------------------------------- */
    /* forhold: [MnO4-, proeven] i skemaet. Skemaerne er afstemt med vand
       og H+; selvtesten taeller atomer og ladning. M og materiale bruges
       af bonusruten (masseprocent). */
    D.REDOX = [
        { id: "fe", stof: "Fe²⁺", proeve: "jern(II)-opløsning", forhold: [1, 5], M: 55.85, Mnavn: "Fe",
          materiale: "ståluld", bonusStof: "jern", pctLav: 80, pctHoej: 99, pctDec: 0,
          skema: "MnO₄⁻(aq) + 5 Fe²⁺(aq) + 8 H⁺(aq) → Mn²⁺(aq) + 5 Fe³⁺(aq) + 4 H₂O(l)",
          tael: { v: [[1, "MnO4", -1], [5, "Fe", 2], [8, "H", 1]], h: [[1, "Mn", 2], [5, "Fe", 3], [4, "H2O", 0]] } },
        { id: "h2o2", stof: "H₂O₂", proeve: "fortyndet brintoverilte", forhold: [2, 5], M: 34.01, Mnavn: "H₂O₂",
          materiale: "brintoverilte fra flasken", bonusStof: "H₂O₂", pctLav: 2, pctHoej: 9.5, pctDec: 1,
          skema: "2 MnO₄⁻(aq) + 5 H₂O₂(aq) + 6 H⁺(aq) → 2 Mn²⁺(aq) + 5 O₂(g) + 8 H₂O(l)",
          tael: { v: [[2, "MnO4", -1], [5, "H2O2", 0], [6, "H", 1]], h: [[2, "Mn", 2], [5, "O2", 0], [8, "H2O", 0]] } }
    ];
    D.MN_C = [0.0200, 0.0100, 0.0250];      /* mol/L */
    D.PROEVE_V = [10.0, 20.0, 25.0];        /* mL */
    D.MAALEKOLBE_V = [100.0, 250.0];        /* mL (bonusruten) */

    /* ----- Det periodiske system (symbolerne i raekkefoelge) ---------- */
    D.SYMBOLER = ("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn " +
        "Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd " +
        "Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th " +
        "Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og").split(" ");
    D.PAASKEAEG_NI = "Ni, nikkel, atomnummer 28. Nillers yndlingsgrundstof.";

    /* ----- Den gyldne doer: seglene ------------------------------------ */
    /* Titlerne staar paa spillenes sejrsskaerme. tjek() ser efter
       sejren i browserens hukommelse; spillene skriver selv noeglerne. */
    function tal(n) { var v = Number(NK.hentRaa(n)); return isFinite(v) ? v : 0; }
    function json(n) { try { return JSON.parse(NK.hentRaa(n) || "null"); } catch (e) { return null; } }
    D.SEGL = [
        { id: "million", spil: "Kemi-Millionær", sti: "../sc_spil2_million/index.html", svar: "superkemiker",
          spm: "Hvad bliver man kåret til, når man vinder Kemi-Millionær?",
          tjek: function () { return tal("nk-million-rekord") >= 1000000; } },
        { id: "syregalgen", spil: "Syregalgen", sti: "../sc_spil5_syregalgen/index.html", svar: "syreimmun",
          spm: "Hvad bliver man kaldt, når man undslipper syrebadet fem gange i træk i Syregalgen?",
          tjek: function () {
              var h = json("nk-syregalgen"), r = h && h.rekord;
              return !!r && Object.keys(r).some(function (k) { return Number(r[k]) >= 5; });
          } },
        { id: "pacman", spil: "Pacman Quiz", sti: "../sc_spil1_pacman/index.html", svar: "labyrintmester",
          spm: "Hvad bliver man kåret til, når man klarer Mix på sværeste niveau i Pacman Quiz?",
          tjek: function () { var k = json("nk-pacman-klaret"); return !!(k && k.mix && k.mix.svaer); } },
        { id: "organisk", spil: "Organiske grupper", sti: "../sc_spil4_organiske_grupper/index.html", svar: "stofgruppemester",
          spm: "Hvad bliver man kåret til ved 14.000 point i Organiske grupper?",
          tjek: function () { return tal("nk-organiske-c-rekord") >= 14000 || tal("orgSortering_bestAllTime") >= 14000; } }
    ];
    D.SEGL_TEKST = {
        knap: "Bryd seglet",
        felt: "Titlen",
        forkert: "Seglet holder. Titlen passer ikke.",
        ikkeVundet: function (spil) { return "Titlen er rigtig, men " + spil + " er ikke vundet i denne browser."; },
        brudt: "Seglet er brudt.",
        aabn: function (spil) { return "Åbn " + spil + " i en ny fane"; },
        alle: "Alle fire segl er brudt.",
        doer: "Åbn den gyldne dør"
    };

    D.HJAELP = [
        "Kortet øverst siger, hvad næste trin er. Klik på den ting i rummet, trinet nævner. Den har et gult skilt.",
        "Hvert trin tjekkes, når I trykker Indsend svar. Et hint er gratis, og efter tre forkerte svar kan I få svaret vist.",
        "De løste trin giver cifrene til koden. Når alle trin er løst, står koden klar i kodelåsen ved døren.",
        "Bonusruten er den mørke kasse med stjernen. Dens opgave er svær og uden hints. Guldkoden åbner døren i stedet og giver en guldnøgle. Fem guldnøgler åbner en ekstra dør til sidst.",
        "Hver sag har sit eget nummer og sine egne tal. Ny sag giver nye tal.",
        "Nøglerne i toplinjen viser de døre, I har åbnet. Klik på en nøgle for at se rummet igen. Guldkoden kan også tastes senere."
    ];
}());

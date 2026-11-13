/* =====================================================================
   data.js - tekster, puljer og tal for EscapeRoom Kemi C

   Alt, hvad der kan rettes uden at roere logikken, staar her. Sagens
   tilfaeldige tal traekkes af js/sag.js fra puljerne nedenfor.
   ===================================================================== */
(function () {
    "use strict";

    var D = NK.D = {};

    D.LAGER = "nk-escaperoom";

    /* En noegle er af guld, hvis ingen af rummets noter er laest, foer
       doeren er aabnet, og laasen har faaet hoejst saa mange forkerte
       koder. Flere giver en jernnoegle. Fem guldnoegler aabner den
       gyldne doer. */
    D.MAKS_FORKERTE = 2;

    /* Rummenes farver (noeglerne og doerkarmene) som i den gamle. */
    D.FARVE = { 1: "#3498db", 2: "#2ecc71", 3: "#9b59b6", 4: "#e67e22", 5: "#e74c3c", 6: "#f1c40f" };

    D.START = {
        titel: "EscapeRoom Kemi C",
        under: "Læreren Niller er forsvundet",
        tekst: "Niller er ikke mødt op til timen. I laboratoriet ligger en seddel med hans håndskrift: »Kemien viser vej.« Bag fem låste døre finder I ham.",
        regler: [
            "Klik på tingene i rummet. De gule skilte viser, hvad der kan undersøges.",
            "Hver dør har en kodelås. Felterne i låsen siger, hvilke tal den vil have.",
            "Sidder I fast, kan I læse Nillers noter.",
            "Hver sag har sine egne tal. En anden gruppes kode passer ikke i jeres lås."
        ],
        knap: "Start efterforskningen"
    };

    D.RUM = {
        1: { titel: "Grundstofkoden", tekst: "Niller har efterladt et reagensglas mærket Prøve X og et reaktionsskema, der ikke er afstemt. Låsen vil have to tal." },
        2: { titel: "Molekylets gemmested", tekst: "Fem molekyler på tavlen, en flaske på hylden og Nillers notesbog på bordet. Låsen vil have tre tal." },
        3: { titel: "Laboratoriets vægt", tekst: "Et stykke metal ligger på vægten. Niller ville lade det reagere med saltsyre. Låsen vil have rumfanget af den gas, der dannes." },
        4: { titel: "Den hemmelige opløsning", tekst: "Niller har titreret en syre med ukendt koncentration. Buretten står der endnu. Låsen vil have syrens pH." },
        5: { titel: "Den sidste reaktion", tekst: "Den sidste dør. Buretten er fyldt med violet kaliumpermanganat. Låsen vil have prøvens koncentration." },
        6: { titel: "Den gyldne dør", tekst: "Bag rum 5 står en dør af guld. Jeres fem gyldne nøgler passer i låsen, men fire segl holder den lukket. Hvert segl brydes med en titel fra et andet kemispil." }
    };

    D.LAAS = {
        forkert: "Låsen giver ikke efter.",
        rigtig: "Klik. Døren går op.",
        videre: function (n) { return n <= 5 ? "Gå ind i rum " + n : "Gå gennem døren"; },
        aaben: "Døren er åben."
    };

    D.SLUT = {
        stempel: "Sagen er opklaret",
        titel: "I fandt Niller",
        tekst: "Niller sad i kælderen og ledte efter en sjælden mineralprøve. Han havde glemt at sige det til nogen. Han roser jer for at have brugt hele Kemi C til at finde ham.",
        svagt: "Fem gyldne nøgler passer i en dør, I ikke har set.",
        jernNote: function (rum) { return "Rum " + rum + ": nøglen blev til jern, fordi I læste Nillers note."; },
        jernKoder: function (rum, n) { return "Rum " + rum + ": nøglen blev til jern efter " + n + " forkerte koder."; },
        guldNoegle: function (rum) { return "Rum " + rum + ": en gylden nøgle."; }
    };

    D.FINALE = {
        stempel: "Sagen er opklaret i guld",
        titel: "Nillers hemmelige laboratorium",
        tekst: "Bag den gyldne dør sidder Niller med en kop kaffe. På væggen hænger fire diplomer: Superkemiker, Syreimmun, Labyrintmester og Stofgruppemester. Ved siden af hænger en tom ramme. Den er til jer."
    };

    D.BEVIS = {
        etiket: "Bevis på gennemførsel",
        note: "Koden skifter hvert minut. Vis den til læreren."
    };

    /* ----- Rum 1: laboratoriet med Proeve X -------------------------- */
    /* Faeldningstabellen er sc2.4's (graensen 1 g pr. 100 mL). Farverne
       er sc2.4's [r, g, b]. null betyder intet bundfald. */
    D.LAB_IONER = {
        ag: { formel: "Ag⁺",  metal: "sølv",      Z: 47 },
        pb: { formel: "Pb²⁺", metal: "bly",       Z: 82 },
        ba: { formel: "Ba²⁺", metal: "barium",    Z: 56 },
        ca: { formel: "Ca²⁺", metal: "calcium",   Z: 20 },
        cu: { formel: "Cu²⁺", metal: "kobber",    Z: 29, opl: [120, 175, 235] },
        mg: { formel: "Mg²⁺", metal: "magnesium", Z: 12 }
    };
    D.LAB_REAGENSER = [
        { id: "cl",  formel: "NaCl" },
        { id: "i",   formel: "KI" },
        { id: "so4", formel: "Na₂SO₄" },
        { id: "oh",  formel: "NaOH" }
    ];
    var HVID = { ord: "hvidt", farve: [240, 240, 236] };
    D.LAB = {
        ag: { cl: HVID, i: { ord: "gult", farve: [240, 222, 110] }, so4: HVID, oh: { ord: "brunt", farve: [104, 78, 52] } },
        pb: { cl: HVID, i: { ord: "gult", farve: [250, 208, 40] }, so4: HVID, oh: HVID },
        ba: { cl: null, i: null, so4: HVID, oh: null },
        ca: { cl: null, i: null, so4: HVID, oh: HVID },
        cu: { cl: null, i: { ord: "brunt", farve: [150, 98, 44] }, so4: null, oh: { ord: "lyseblåt", farve: [100, 160, 225] } },
        mg: { cl: null, i: null, so4: null, oh: HVID }
    };

    /* ----- Rum 1: tavlen ---------------------------------------------- */
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

    /* ----- Rum 2: flasken (streger i stregformlen) -------------------- */
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
    /* Bindinger pr. atom til selvtestens kontrol af stregtallet. */
    D.VALENS = { H: 1, C: 4, N: 3, O: 2, Cl: 1 };

    /* ----- Rum 2: tavlen (polaritet) ---------------------------------- */
    /* Elektronegativiteterne er bogens og sc3.3's. */
    D.EN = { H: 2.1, C: 2.5, N: 3.0, O: 3.5, Cl: 3.0 };
    D.ATOM = {
        H:  { farve: "#e4e8ee", r: 13, moerkTekst: true },
        C:  { farve: "#3b414b", r: 16 },
        N:  { farve: "#3464d6", r: 17 },
        O:  { farve: "#d93a2a", r: 17 },
        Cl: { farve: "#34ad48", r: 18 }
    };
    /* a: [symbol, x, y] i en kasse paa 200 x 150. b: [fra, til, type],
       hvor type er 1, 2, 3, "k" (kile, mod beskueren) eller "s"
       (stiplet, vaek fra beskueren). f: frie elektronpar [atom, vinkel]. */
    function tetra(c, a, b, d, e) {
        return { a: [[c, 100, 78], [a, 48, 30], [b, 152, 30], [d, 50, 128], [e, 150, 126]],
                 b: [[0, 1, 1], [0, 2, 1], [0, 3, "k"], [0, 4, "s"]] };
    }
    D.POLMOLEKYLER = [
        { formel: "H₂O", polaer: true, t: { a: [["O", 100, 62], ["H", 54, 108], ["H", 146, 108]], b: [[0, 1, 1], [0, 2, 1]], f: [[0, -135], [0, -45]] } },
        { formel: "NH₃", polaer: true, t: { a: [["N", 100, 54], ["H", 46, 104], ["H", 154, 104], ["H", 100, 124]], b: [[0, 1, 1], [0, 2, 1], [0, 3, "k"]], f: [[0, -90]] } },
        { formel: "HCl", polaer: true, t: { a: [["H", 66, 75], ["Cl", 128, 75]], b: [[0, 1, 1]] } },
        { formel: "HCN", polaer: true, t: { a: [["H", 34, 75], ["C", 90, 75], ["N", 158, 75]], b: [[0, 1, 1], [1, 2, 3]] } },
        { formel: "CH₃Cl", polaer: true, t: tetra("C", "Cl", "H", "H", "H") },
        { formel: "CHCl₃", polaer: true, t: tetra("C", "H", "Cl", "Cl", "Cl") },
        { formel: "CH₂Cl₂", polaer: true, t: tetra("C", "Cl", "Cl", "H", "H") },
        { formel: "CH₄", polaer: false, t: tetra("C", "H", "H", "H", "H") },
        { formel: "CCl₄", polaer: false, t: tetra("C", "Cl", "Cl", "Cl", "Cl") },
        { formel: "CO₂", polaer: false, t: { a: [["O", 36, 75], ["C", 100, 75], ["O", 164, 75]], b: [[1, 0, 2], [1, 2, 2]] } },
        { formel: "N₂", polaer: false, t: { a: [["N", 70, 75], ["N", 130, 75]], b: [[0, 1, 3]] } },
        { formel: "Cl₂", polaer: false, t: { a: [["Cl", 68, 75], ["Cl", 132, 75]], b: [[0, 1, 1]] } },
        { formel: "O₂", polaer: false, t: { a: [["O", 70, 75], ["O", 130, 75]], b: [[0, 1, 2]] } }
    ];

    /* ----- Rum 2: notesbogen (blandingsgaaden) ------------------------ */
    /* Kun par, der passer i virkeligheden, kan komme med:
       - fast: to faste stoffer saettes aldrig sammen.
       - kun: stoffet blandes kun med disse (ellers med alle i gruppen).
       - kryds: stoffet kan staa over for et upolaert stof med
         "Blandes ikke". Ethanol, methanol og eddikesyre kan blandes med
         flere upolaere stoffer og staar derfor aldrig over for dem.
       - krydsKun: et upolaert stof, der kun staar over for disse. */
    D.VAND = { navn: "vand", kryds: true };
    D.BLAND_POLAER = [
        { navn: "urea", fast: true, kryds: true, kun: ["vand", "glycerol", "methanol", "ethanol"] },
        { navn: "glycerol", kryds: true },
        { navn: "ethanol" },
        { navn: "methanol" },
        { navn: "eddikesyre" },
        { navn: "ethan-1,2-diol", kryds: true }
    ];
    D.BLAND_UPOLAER = [
        { navn: "hexan" },
        { navn: "heptan" },
        { navn: "toluen" },
        { navn: "cyclohexan" },
        { navn: "olivenolie" },
        { navn: "paraffinolie" },
        { navn: "naphthalen", fast: true, kun: ["hexan", "heptan", "toluen", "cyclohexan"], krydsKun: ["vand", "glycerol"] }
    ];

    /* ----- Rum 3: metallet paa vaegten -------------------------------- */
    /* M fra Databogen. forhold: [metal, H2] i skemaet. Massen traekkes
       mellem lav og hoej, saa rumfanget bliver mellem 0,50 og 9,99 L. */
    D.METALLER = [
        { sym: "Mg", navn: "magnesium", form: "magnesiumbånd", M: 24.31, lav: 0.50, hoej: 4.00, forhold: [1, 1],
          skema: "Mg(s) + 2 HCl(aq) → MgCl₂(aq) + H₂(g)" },
        { sym: "Zn", navn: "zink", form: "zinkgranulat", M: 65.38, lav: 1.50, hoej: 9.00, forhold: [1, 1],
          skema: "Zn(s) + 2 HCl(aq) → ZnCl₂(aq) + H₂(g)" },
        { sym: "Al", navn: "aluminium", form: "aluminiumsfolie", M: 26.98, lav: 0.40, hoej: 3.50, forhold: [2, 3],
          skema: "2 Al(s) + 6 HCl(aq) → 2 AlCl₃(aq) + 3 H₂(g)" },
        { sym: "Fe", navn: "jern", form: "jernpulver", M: 55.85, lav: 1.20, hoej: 9.00, forhold: [1, 1],
          skema: "Fe(s) + 2 HCl(aq) → FeCl₂(aq) + H₂(g)" }
    ];
    D.R = 0.08314;               /* L · bar / (mol · K) */
    D.TRYK = [0.985, 0.995, 1.000, 1.013, 1.020];

    /* ----- Rum 4: titreringen ----------------------------------------- */
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

    /* ----- Rum 5: permanganattitreringen ------------------------------ */
    /* forhold: [MnO4-, proeven] i skemaet. Skemaerne er afstemt med vand
       og H+; selvtesten taeller atomer og ladning. */
    D.REDOX = [
        { id: "fe", stof: "Fe²⁺", proeve: "jern(II)sulfat", forhold: [1, 5],
          skema: "MnO₄⁻(aq) + 5 Fe²⁺(aq) + 8 H⁺(aq) → Mn²⁺(aq) + 5 Fe³⁺(aq) + 4 H₂O(l)",
          tael: { v: [[1, "MnO4", -1], [5, "Fe", 2], [8, "H", 1]], h: [[1, "Mn", 2], [5, "Fe", 3], [4, "H2O", 0]] } },
        { id: "h2o2", stof: "H₂O₂", proeve: "brintoverilte", forhold: [2, 5],
          skema: "2 MnO₄⁻(aq) + 5 H₂O₂(aq) + 6 H⁺(aq) → 2 Mn²⁺(aq) + 5 O₂(g) + 8 H₂O(l)",
          tael: { v: [[2, "MnO4", -1], [5, "H2O2", 0], [6, "H", 1]], h: [[2, "Mn", 2], [5, "O2", 0], [8, "H2O", 0]] } }
    ];
    D.MN_C = [0.0200, 0.0100, 0.0250];      /* mol/L */
    D.PROEVE_V = [10.0, 20.0, 25.0];        /* mL */

    /* ----- Det periodiske system (symbolerne i raekkefoelge) ---------- */
    D.SYMBOLER = ("H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn " +
        "Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd " +
        "Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th " +
        "Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og").split(" ");
    D.PAASKEAEG_NI = "Ni, nikkel, atomnummer 28. Nillers yndlingsgrundstof.";

    /* ----- Den gyldne doer: seglene ----------------------------------- */
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
        "Klik på tingene i rummet. De gule skilte viser, hvad der kan undersøges.",
        "Hver dør har en kodelås. Felterne i låsen siger, hvilke tal den vil have, og hvor kommaet står.",
        "Sidder I fast, kan I læse Nillers noter på kortene.",
        "Hver sag har sit eget nummer og sine egne tal. En kode fra en anden gruppe passer ikke i jeres lås. Ny sag giver nye tal.",
        "Nøglerne i toplinjen viser de døre, I har åbnet. Klik på en nøgle for at se rummet igen."
    ];
}());

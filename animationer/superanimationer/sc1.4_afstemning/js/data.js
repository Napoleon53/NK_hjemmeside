/* =====================================================================
   data.js - reaktionerne, kuglerne og Kemichaels replikker

   Formler skrives med almindelige tal (ASCII), fx "Al2(SO4)3". De vises
   med saenkede tal af NK.formel. Facit er de mindste hele tal foran
   stofferne, i samme raekkefoelge som r (foer pilen) og p (efter pilen).
   Selvtesten tjekker, at facit gaar op, ikke kan forkortes, og at det er
   den eneste loesning.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Atomernes udseende -------------------------------------------
       r er radius i modellens enheder (som den gamle c1.4). Farverne er
       de gaengse modelfarver: H hvid, O roed, C graa, N blaa, Cl groen. */
    D.ATOM = {
        H:  { r: 13, farve: "#eef1f4", kant: "#9aa3ad", tekst: "#2a2f36", navn: "hydrogen" },
        O:  { r: 19, farve: "#e2483b", kant: "#9c2a20", tekst: "#ffffff", navn: "oxygen" },
        C:  { r: 19, farve: "#454b55", kant: "#23262c", tekst: "#ffffff", navn: "carbon" },
        N:  { r: 19, farve: "#3f7fd9", kant: "#23508f", tekst: "#ffffff", navn: "nitrogen" },
        Na: { r: 22, farve: "#9b6bd6", kant: "#63409a", tekst: "#ffffff", navn: "natrium" },
        Cl: { r: 21, farve: "#6cc75a", kant: "#3b7d2f", tekst: "#16300f", navn: "chlor" },
        Mg: { r: 21, farve: "#2f9e7e", kant: "#1c6450", tekst: "#ffffff", navn: "magnesium" },
        Al: { r: 21, farve: "#b4bcc8", kant: "#6f7885", tekst: "#1f2328", navn: "aluminium" },
        Fe: { r: 22, farve: "#d0843a", kant: "#8a5220", tekst: "#ffffff", navn: "jern" }
    };

    /* ----- Kuglemodellerne paa fane 1 -------------------------------------
       Hvert stof er en liste af [grundstof, x, y] i modellens enheder
       omkring stoffets midte. Salte og oxider tegnes som én formelenhed. */
    D.GEO = {
        "Na":    [["Na", 0, 0]],
        "Mg":    [["Mg", 0, 0]],
        "Al":    [["Al", 0, 0]],
        "Fe":    [["Fe", 0, 0]],
        "H2":    [["H", -12, 0], ["H", 12, 0]],
        "O2":    [["O", -16, 0], ["O", 16, 0]],
        "N2":    [["N", -16, 0], ["N", 16, 0]],
        "Cl2":   [["Cl", -18, 0], ["Cl", 18, 0]],
        "NaCl":  [["Na", -18, 0], ["Cl", 20, 0]],
        "MgO":   [["Mg", -17, 0], ["O", 18, 0]],
        "CO":    [["C", -16, 0], ["O", 16, 0]],
        "H2O":   [["O", 0, -6], ["H", -20, 12], ["H", 20, 12]],
        "H2O2":  [["H", -34, -16], ["O", -15, 0], ["O", 15, 0], ["H", 34, 16]],
        "CO2":   [["O", -32, 0], ["C", 0, 0], ["O", 32, 0]],
        "NH3":   [["H", 0, -26], ["N", 0, 2], ["H", -23, 16], ["H", 23, 16]],
        "CH4":   [["H", 0, -28], ["H", -28, 0], ["C", 0, 0], ["H", 28, 0], ["H", 0, 28]],
        "Al2O3": [["O", 0, -34], ["Al", -24, -8], ["Al", 24, -8], ["O", -24, 28], ["O", 24, 28]],
        "Fe3O4": [["O", 0, -52], ["O", -28, -22], ["O", 28, -22], ["Fe", 0, -24],
                  ["Fe", -28, 10], ["Fe", 28, 10], ["O", 0, 14]],
        "C3H8":  [["H", -32, -28], ["H", 0, -28], ["H", 32, -28],
                  ["H", -54, 12], ["C", -32, 0], ["C", 0, 0], ["C", 32, 0], ["H", 54, 12],
                  ["H", -24, 28], ["H", 0, 28], ["H", 24, 28]]
    };

    /* Formler, man kan komme til at lave ved at aendre det lille tal paa
       fane 1. Kun stoffer, der findes. Resten faar en generel besked. */
    D.ANDRE_STOFFER = {
        "H2O2": "hydrogenperoxid",
        "O3": "ozon",
        "CO2": "carbondioxid",
        "H3": null,
        "NaCl2": null,
        "MgO2": "magnesiumperoxid",
        "N2O": "lattergas",
        "NO2": "nitrogendioxid",
        "N2O4": "dinitrogentetraoxid",
        "Na2O2": "natriumperoxid",
        "Fe2O3": "jern(III)oxid",
        "C2H6": "ethan",
        "C4H10": "butan"
    };

    /* ----- Fane 1: Kuglerne -----------------------------------------------
       De syv fra den gamle c1.4 i samme raekkefoelge, og tre nye: natrium
       og chlor foerst (den letteste), kulilte og aluminium. */
    D.GRUPPER = [
        { id: "let", titel: "Let" },
        { id: "middel", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];

    D.KUGLER = [
        { id: "natrium", navn: "Køkkensalt", gruppe: "let", r: ["Na", "Cl2"], p: ["NaCl"], facit: [2, 1, 2],
          tekst: "Natrium og chlor er farlige hver for sig. Sammen bliver de til køkkensalt." },
        { id: "magnesium", navn: "Magnesium", gruppe: "let", r: ["Mg", "O2"], p: ["MgO"], facit: [2, 1, 2],
          tekst: "Magnesium brænder med et blændende hvidt lys. Det bruges i fyrværkeri." },
        { id: "vand", navn: "Vand", gruppe: "let", r: ["H2", "O2"], p: ["H2O"], facit: [2, 1, 2],
          tekst: "Hydrogen og oxygen bliver til vand. Reaktionen driver brændselsceller og raketmotorer." },
        { id: "peroxid", navn: "Hydrogenperoxid", gruppe: "middel", r: ["H2O2"], p: ["H2O", "O2"], facit: [2, 2, 1],
          tekst: "Hydrogenperoxid renser sår og bleger hår. Det går langsomt i stykker til vand og oxygen." },
        { id: "kulilte", navn: "Kulilte", gruppe: "middel", r: ["CO", "O2"], p: ["CO2"], facit: [2, 1, 2],
          tekst: "Kulilte er giftig. Den brænder videre til carbondioxid med en blå flamme." },
        { id: "ammoniak", navn: "Ammoniak", gruppe: "middel", r: ["N2", "H2"], p: ["NH3"], facit: [1, 3, 2],
          tekst: "Ammoniak laves af nitrogen fra luften og bliver til kunstgødning." },
        { id: "methan", navn: "Methan", gruppe: "middel", r: ["CH4", "O2"], p: ["CO2", "H2O"], facit: [1, 2, 1, 2],
          tekst: "Methan er naturgas. Når det brænder helt, bliver det til carbondioxid og vand." },
        { id: "aluminium", navn: "Aluminium", gruppe: "svaer", r: ["Al", "O2"], p: ["Al2O3"], facit: [4, 3, 2],
          tekst: "Aluminium får straks et tyndt lag oxid. Laget beskytter resten af metallet." },
        { id: "jern", navn: "Jern og damp", gruppe: "svaer", r: ["Fe", "H2O"], p: ["Fe3O4", "H2"], facit: [3, 4, 1, 4],
          tekst: "Varmt jern og vanddamp giver magnetit, Fe₃O₄, og hydrogen. Det kan ske i dampkedler af jern." },
        { id: "propan", navn: "Propan", gruppe: "svaer", r: ["C3H8", "O2"], p: ["CO2", "H2O"], facit: [1, 5, 3, 4],
          tekst: "Propan er gassen i flasken til campinggrillen. Den brænder til carbondioxid og vand." }
    ];

    /* Loftet paa fane 1: saa mange molekyler af ét stof kan ses i bakken */
    D.MAKS_KUGLER = 10;

    /* ----- Fane 2: Skemaet --------------------------------------------------- */
    D.SKEMA = [
        /* Let: tre stoffer, smaa tal */
        { id: "s1", gruppe: "let", r: ["Ca", "O2"], p: ["CaO"], facit: [2, 1, 2] },
        { id: "s2", gruppe: "let", r: ["H2", "Cl2"], p: ["HCl"], facit: [1, 1, 2] },
        { id: "s3", gruppe: "let", r: ["K", "Cl2"], p: ["KCl"], facit: [2, 1, 2] },
        { id: "s4", gruppe: "let", r: ["N2", "O2"], p: ["NO2"], facit: [1, 2, 2] },
        { id: "s5", gruppe: "let", r: ["SO2", "O2"], p: ["SO3"], facit: [2, 1, 2] },
        { id: "s6", gruppe: "let", r: ["Al", "Cl2"], p: ["AlCl3"], facit: [2, 3, 2] },
        { id: "s7", gruppe: "let", r: ["Zn", "HCl"], p: ["ZnCl2", "H2"], facit: [1, 2, 1, 1] },
        { id: "s8", gruppe: "let", r: ["KClO3"], p: ["KCl", "O2"], facit: [2, 2, 3] },
        /* Middel: fire eller fem stoffer, forbraendinger */
        { id: "s9", gruppe: "middel", r: ["Mg", "HCl"], p: ["MgCl2", "H2"], facit: [1, 2, 1, 1] },
        { id: "s10", gruppe: "middel", r: ["Na", "H2O"], p: ["NaOH", "H2"], facit: [2, 2, 2, 1] },
        { id: "s11", gruppe: "middel", r: ["Fe", "O2"], p: ["Fe2O3"], facit: [4, 3, 2] },
        { id: "s12", gruppe: "middel", r: ["P4", "O2"], p: ["P4O10"], facit: [1, 5, 1] },
        { id: "s13", gruppe: "middel", r: ["CaCO3", "HCl"], p: ["CaCl2", "H2O", "CO2"], facit: [1, 2, 1, 1, 1] },
        { id: "s14", gruppe: "middel", r: ["C2H5OH", "O2"], p: ["CO2", "H2O"], facit: [1, 3, 2, 3] },
        { id: "s15", gruppe: "middel", r: ["Fe2O3", "CO"], p: ["Fe", "CO2"], facit: [1, 3, 2, 3] },
        { id: "s16", gruppe: "middel", r: ["C2H6", "O2"], p: ["CO2", "H2O"], facit: [2, 7, 4, 6] },
        /* Svaer: parenteser, store tal, et halvt O2 undervejs */
        { id: "s17", gruppe: "svaer", r: ["C6H12O6", "O2"], p: ["CO2", "H2O"], facit: [1, 6, 6, 6] },
        { id: "s18", gruppe: "svaer", r: ["Fe2O3", "C"], p: ["Fe", "CO2"], facit: [2, 3, 4, 3] },
        { id: "s19", gruppe: "svaer", r: ["NH3", "O2"], p: ["NO", "H2O"], facit: [4, 5, 4, 6] },
        { id: "s20", gruppe: "svaer", r: ["Al", "H2SO4"], p: ["Al2(SO4)3", "H2"], facit: [2, 3, 1, 3] },
        { id: "s21", gruppe: "svaer", r: ["C4H10", "O2"], p: ["CO2", "H2O"], facit: [2, 13, 8, 10] },
        { id: "s22", gruppe: "svaer", r: ["Ca(OH)2", "H3PO4"], p: ["Ca3(PO4)2", "H2O"], facit: [3, 2, 1, 6] },
        { id: "s23", gruppe: "svaer", r: ["C8H18", "O2"], p: ["CO2", "H2O"], facit: [2, 25, 16, 18] },
        { id: "s24", gruppe: "svaer", r: ["Cu", "HNO3"], p: ["Cu(NO3)2", "NO", "H2O"], facit: [3, 8, 3, 2, 4] }
    ];

    D.MAKS_TAL = 99;

    /* ----- Linjerne i statuslinjen ----------------------------------------------- */
    D.FAERDIG = {
        kg: "Alle ti. Atomerne flytter sig, men de bliver de samme.",
        sk: "Alle 24. Du kan godt undvære kuglerne nu."
    };
    /* Den korte linje efter selve skemaet, naar en reaktion er afstemt */
    D.ROS_OPGAVE = ["Opgaven er løst.", "Den går op.", "Lige mange på hver side.", "Sådan."];

    /* Paaskeaegget: O2 laves om til O3 paa fane 1 */
    D.OZON = "Ozon lugter af kopimaskine og er ikke det, der reagerer her.";

    NK.Data = D;
}());

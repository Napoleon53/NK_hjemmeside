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
          tekst: "Natrium og dichlor er farlige hver for sig. Sammen bliver de til køkkensalt." },
        { id: "magnesium", navn: "Magnesium", gruppe: "let", r: ["Mg", "O2"], p: ["MgO"], facit: [2, 1, 2],
          tekst: "Magnesium brænder med et blændende hvidt lys. Det bruges i fyrværkeri." },
        { id: "vand", navn: "Vand", gruppe: "let", r: ["H2", "O2"], p: ["H2O"], facit: [2, 1, 2],
          tekst: "Dihydrogen og dioxygen bliver til vand i brændselsceller og raketmotorer." },
        { id: "peroxid", navn: "Hydrogenperoxid", gruppe: "middel", r: ["H2O2"], p: ["H2O", "O2"], facit: [2, 2, 1],
          tekst: "Hydrogenperoxid går langsomt i stykker til vand og dioxygen." },
        { id: "kulilte", navn: "Kulilte", gruppe: "middel", r: ["CO", "O2"], p: ["CO2"], facit: [2, 1, 2],
          tekst: "Kulilte er giftig. Den brænder videre til carbondioxid med en blå flamme." },
        { id: "ammoniak", navn: "Ammoniak", gruppe: "middel", r: ["N2", "H2"], p: ["NH3"], facit: [1, 3, 2],
          tekst: "Ammoniak laves af dinitrogen fra luften og bliver til kunstgødning." },
        { id: "methan", navn: "Methan", gruppe: "middel", r: ["CH4", "O2"], p: ["CO2", "H2O"], facit: [1, 2, 1, 2],
          tekst: "Methan er naturgas. Det brænder til carbondioxid og vand." },
        { id: "aluminium", navn: "Aluminium", gruppe: "svaer", r: ["Al", "O2"], p: ["Al2O3"], facit: [4, 3, 2],
          tekst: "Aluminium får straks et tyndt lag oxid. Laget beskytter resten af metallet." },
        { id: "jern", navn: "Jern og damp", gruppe: "svaer", r: ["Fe", "H2O"], p: ["Fe3O4", "H2"], facit: [3, 4, 1, 4],
          tekst: "Varmt jern og vanddamp giver magnetit, Fe₃O₄, og dihydrogen." },
        { id: "propan", navn: "Propan", gruppe: "svaer", r: ["C3H8", "O2"], p: ["CO2", "H2O"], facit: [1, 5, 3, 4],
          tekst: "Propan i campinggrillen brænder til carbondioxid og vand." }
    ];

    /* Den foerste reaktion paa fane 1 er trinvis (21. nov. 2026, runde 2, REGELSAET
       11-12): den begynder med en handling, og eleven ser foerst, hvad der sker med
       atomerne, foer der skal afstemmes. Hvert trin har en hinttrappe og Vis svaret.
         indsend: eleven trykker Indsend svar, og molekylerne reagerer med 1-tallerne.
         valg:    et spoergsmaal med tre svar paa kortet (det rigtige har ok, de
                  forkerte har hver sin forklaring i nej). Scenen er laast imens.
         plus:    eleven klikker paa + foran stoffet (side og i). Kun den knap er
                  fremme med en gul ramme og en boble. Uden indsend reagerer
                  molekylerne af sig selv lidt efter; med indsend trykker eleven
                  selv Indsend svar bagefter.
       Efter indsend og plus gaar kortet selv videre ca. 1 s efter, at molekylerne
       har reageret (REGELSAET 33). Er reaktionen loest foer (gemt i browseren),
       er der ingen trin; Start forfra giver dem igen (REGELSAET 16). */
    D.TRIN_KUGLER = [
        { type: "indsend", spm: "Klik på Indsend svar, og se atomerne reagere.",
          hint: ["Indsend svar står nederst til højre på kortet.",
              "Når du trykker Indsend svar, reagerer molekylerne med de tal, der står foran stofferne.",
              "Tryk Indsend svar."] },
        { type: "valg", spm: "Hvilket atom er der for mange af før pilen?",
          svar: [
              { t: "Na", nej: "Der er 1 Na før pilen og plads til 1 Na efter pilen. Na passer." },
              { t: "Cl", ok: true },
              { t: "Ingen", nej: "Ét Cl ligger tilovers efter pilen med en rød ring. Det fik ingen plads i NaCl." }
          ],
          hint: ["Se på bakken efter pilen. Ét atom har en rød ring.",
              "Der er 2 Cl før pilen, men kun plads til 1 Cl efter pilen.",
              "Der er ét Cl for meget før pilen."],
          slut: "Der er 2 Cl før pilen og kun plads til 1 Cl efter pilen. Det ekstra Cl ligger tilovers." },
        { type: "plus", side: "p", i: 0, tekst: "Der skal være plads til begge Cl efter pilen.", spm: "Klik på + foran NaCl.",
          hint: ["Hvert NaCl har plads til ét Cl.",
              "Med 2 NaCl er der plads til 2 Cl.",
              "Klik på + over tallet foran NaCl."] },
        { type: "plus", side: "r", i: 0, indsend: true, tekst: "Nu mangler der et Na efter pilen.", spm: "Klik på + foran Na. Tryk så Indsend svar.",
          hint: ["Hvert NaCl skal have ét Na.",
              "Der er 2 NaCl, så der skal være 2 Na før pilen.",
              "Klik på + foran Na. Tryk så Indsend svar."] }
    ];

    /* Loftet paa fane 1: saa mange molekyler af ét stof kan ses i bakken */
    D.MAKS_KUGLER = 10;

    /* ----- Fane 2: Afstem uden kugler ----------------------------------------
       navn: titlen i listen, laast op i takt (21. nov. 2026, REGELSAET 17-18) */
    D.SKEMA = [
        /* Let: tre stoffer, smaa tal */
        { id: "s1", navn: "Calcium brænder", gruppe: "let", r: ["Ca", "O2"], p: ["CaO"], facit: [2, 1, 2] },
        { id: "s2", navn: "Hydrogenchlorid dannes", gruppe: "let", r: ["H2", "Cl2"], p: ["HCl"], facit: [1, 1, 2] },
        { id: "s3", navn: "Kalium og dichlor", gruppe: "let", r: ["K", "Cl2"], p: ["KCl"], facit: [2, 1, 2] },
        { id: "s4", navn: "Nitrogendioxid dannes", gruppe: "let", r: ["N2", "O2"], p: ["NO2"], facit: [1, 2, 2] },
        { id: "s5", navn: "Svovltrioxid dannes", gruppe: "let", r: ["SO2", "O2"], p: ["SO3"], facit: [2, 1, 2] },
        { id: "s6", navn: "Aluminium og dichlor", gruppe: "let", r: ["Al", "Cl2"], p: ["AlCl3"], facit: [2, 3, 2] },
        { id: "s7", navn: "Zink i saltsyre", gruppe: "let", r: ["Zn", "HCl"], p: ["ZnCl2", "H2"], facit: [1, 2, 1, 1] },
        { id: "s8", navn: "Kaliumchlorat spaltes", gruppe: "let", r: ["KClO3"], p: ["KCl", "O2"], facit: [2, 2, 3] },
        /* Middel: fire eller fem stoffer, forbraendinger */
        { id: "s9", navn: "Magnesium i saltsyre", gruppe: "middel", r: ["Mg", "HCl"], p: ["MgCl2", "H2"], facit: [1, 2, 1, 1] },
        { id: "s10", navn: "Natrium i vand", gruppe: "middel", r: ["Na", "H2O"], p: ["NaOH", "H2"], facit: [2, 2, 2, 1] },
        { id: "s11", navn: "Jern ruster", gruppe: "middel", r: ["Fe", "O2"], p: ["Fe2O3"], facit: [4, 3, 2] },
        { id: "s12", navn: "Phosphor brænder", gruppe: "middel", r: ["P4", "O2"], p: ["P4O10"], facit: [1, 5, 1] },
        { id: "s13", navn: "Kalk i saltsyre", gruppe: "middel", r: ["CaCO3", "HCl"], p: ["CaCl2", "H2O", "CO2"], facit: [1, 2, 1, 1, 1] },
        { id: "s14", navn: "Ethanol brænder", gruppe: "middel", r: ["C2H5OH", "O2"], p: ["CO2", "H2O"], facit: [1, 3, 2, 3] },
        { id: "s15", navn: "Jernoxid og kulilte", gruppe: "middel", r: ["Fe2O3", "CO"], p: ["Fe", "CO2"], facit: [1, 3, 2, 3] },
        { id: "s16", navn: "Ethan brænder", gruppe: "middel", r: ["C2H6", "O2"], p: ["CO2", "H2O"], facit: [2, 7, 4, 6] },
        /* Svaer: parenteser, store tal, et halvt O2 undervejs */
        { id: "s17", navn: "Glucose forbrændes", gruppe: "svaer", r: ["C6H12O6", "O2"], p: ["CO2", "H2O"], facit: [1, 6, 6, 6] },
        { id: "s18", navn: "Jernoxid og carbon", gruppe: "svaer", r: ["Fe2O3", "C"], p: ["Fe", "CO2"], facit: [2, 3, 4, 3] },
        { id: "s19", navn: "Ammoniak og dioxygen", gruppe: "svaer", r: ["NH3", "O2"], p: ["NO", "H2O"], facit: [4, 5, 4, 6] },
        { id: "s20", navn: "Aluminium i svovlsyre", gruppe: "svaer", r: ["Al", "H2SO4"], p: ["Al2(SO4)3", "H2"], facit: [2, 3, 1, 3] },
        { id: "s21", navn: "Butan brænder", gruppe: "svaer", r: ["C4H10", "O2"], p: ["CO2", "H2O"], facit: [2, 13, 8, 10] },
        { id: "s22", navn: "Calciumphosphat dannes", gruppe: "svaer", r: ["Ca(OH)2", "H3PO4"], p: ["Ca3(PO4)2", "H2O"], facit: [3, 2, 1, 6] },
        { id: "s23", navn: "Octan brænder", gruppe: "svaer", r: ["C8H18", "O2"], p: ["CO2", "H2O"], facit: [2, 25, 16, 18] },
        { id: "s24", navn: "Kobber i salpetersyre", gruppe: "svaer", r: ["Cu", "HNO3"], p: ["Cu(NO3)2", "NO", "H2O"], facit: [3, 8, 3, 2, 4] }
    ];

    D.MAKS_TAL = 99;

    /* ----- Linjerne i statuslinjen ----------------------------------------------- */
    D.FAERDIG = {
        kg: "Alle ti reaktioner er afstemt. Atomerne bytter partnere, men det er de samme atomer.",
        sk: "Alle 24 reaktioner er afstemt. Du kan godt undvære kuglerne nu."
    };
    /* Den korte linje efter selve skemaet, naar en reaktion er afstemt */
    D.ROS_OPGAVE = ["Opgaven er løst.", "Reaktionsskemaet er afstemt.", "Der er lige mange atomer af hver slags på begge sider."];

    /* Paaskeaegget: O2 laves om til O3 paa fane 1 */
    D.OZON = "Ozon lugter af kopimaskine og er ikke det, der reagerer her.";

    NK.Data = D;
}());

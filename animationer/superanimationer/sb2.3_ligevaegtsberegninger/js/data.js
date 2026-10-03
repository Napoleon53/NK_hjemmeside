/* =====================================================================
   data.js - stofferne, de tre reaktioner i beholderen og de 13 opgaver

   Opgaverne er de samme som i den gamle b2.3 med de samme tal.
   Talvaerdierne er konstrueret, saa regningen bliver overskuelig; de
   er ikke maalt. Facit (x, ligevaegtskoncentrationerne, K og CAS'
   loesninger) staar ingen steder her: det regnes af skemaet i
   js/model.js. Selvtesten tjekker, at det giver den gamles facit.

   Et skema skrives som i sb2.1: r og p er lister af
   [koefficient, stof, tilstandsform].
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Stofferne ---------------------------------------------------------
       vis: saadan staar stoffet paa skaermen. alias: det, eleven maa skrive
       inden i [ ] (sammenlignes uden mellemrum og store bogstaver).
       atomer: tegningen i beholderen paa fane 1 (grundstof og plads i
       atomradier). */
    D.STOF = {
        NOCl:   { vis: "NOCl", alias: ["nocl"] },
        NO:     { vis: "NO", alias: ["no"] },
        Cl2:    { vis: "Cl₂", alias: ["cl2"], atomer: [["Cl", -0.55, 0], ["Cl", 0.55, 0]] },
        N2:     { vis: "N₂", alias: ["n2"] },
        H2:     { vis: "H₂", alias: ["h2"], atomer: [["H", -0.38, 0], ["H", 0.38, 0]] },
        NH3:    { vis: "NH₃", alias: ["nh3"] },
        CO:     { vis: "CO", alias: ["co"], atomer: [["C", -0.5, 0], ["O", 0.5, 0]] },
        H2O:    { vis: "H₂O", alias: ["h2o"], atomer: [["O", 0, 0], ["H", -0.62, 0.42], ["H", 0.62, 0.42]] },
        CO2:    { vis: "CO₂", alias: ["co2"], atomer: [["O", -0.95, 0], ["C", 0, 0], ["O", 0.95, 0]] },
        COCl2:  { vis: "COCl₂", alias: ["cocl2"] },
        SO3:    { vis: "SO₃", alias: ["so3"] },
        SO2:    { vis: "SO₂", alias: ["so2"], atomer: [["S", 0, 0.1], ["O", -0.85, -0.35], ["O", 0.85, -0.35]] },
        O2:     { vis: "O₂", alias: ["o2"] },
        SO2Cl2: { vis: "SO₂Cl₂", alias: ["so2cl2"], atomer: [["S", 0, 0], ["O", 0, -0.95], ["O", 0, 0.95], ["Cl", -1.0, 0], ["Cl", 1.0, 0]] },
        Br2:    { vis: "Br₂", alias: ["br2"], atomer: [["Br", -0.55, 0], ["Br", 0.55, 0]] },
        HBr:    { vis: "HBr", alias: ["hbr"], atomer: [["H", -0.62, 0], ["Br", 0.3, 0]] },
        I2:     { vis: "I₂", alias: ["i2"] },
        I:      { vis: "I", alias: ["i"] },
        nbutan:   { vis: "n-butan", alias: ["n-butan", "nbutan", "butan", "n-c4h10"] },
        isobutan: { vis: "isobutan", alias: ["isobutan", "i-butan", "ibutan", "methylpropan", "2-methylpropan"] },
        cis:      { vis: "cis-2-buten", alias: ["cis-2-buten", "cis-buten", "cisbuten", "cis2buten", "cis", "cis-but-2-en"] },
        trans:    { vis: "trans-2-buten", alias: ["trans-2-buten", "trans-buten", "transbuten", "trans2buten", "trans", "trans-but-2-en"] }
    };

    /* Atomernes farve og stoerrelse i beholderen (CPK-farverne) */
    D.ATOM = {
        H:  { farve: "#eef1f4", kant: "#9aa3ad", r: 0.62 },
        C:  { farve: "#4b4f57", kant: "#25282d", r: 0.9 },
        O:  { farve: "#e4483a", kant: "#8f2219", r: 0.88 },
        S:  { farve: "#e8c337", kant: "#8d7414", r: 1.0 },
        Cl: { farve: "#43b65a", kant: "#1f6b2e", r: 0.95 },
        Br: { farve: "#9c3b2c", kant: "#561c13", r: 1.02 }
    };

    /* ----- Fane 1: de tre reaktioner i beholderen ------------------------------
       c0: startkoncentrationerne (M). enhed: hvor meget ét molekyle er.
       xStof og xOrd: x er den koncentration af xStof, der er xOrd. */
    D.RX = {
        a: { id: "a", navn: "Sulfurylchlorid spaltes", T: "375 °C", K: 0.0500,
             r: [[1, "SO2Cl2", "g"]], p: [[1, "SO2", "g"], [1, "Cl2", "g"]],
             c0: { SO2Cl2: 0.200, SO2: 0, Cl2: 0 }, enhed: 0.010, xStof: "SO2Cl2", xOrd: "spaltet" },
        b: { id: "b", navn: "Hydrogenbromid dannes", T: "500 K", K: 64.0,
             r: [[1, "H2", "g"], [1, "Br2", "g"]], p: [[2, "HBr", "g"]],
             c0: { H2: 0.200, Br2: 0.200, HBr: 0 }, enhed: 0.020, xStof: "H2", xOrd: "omsat" },
        c: { id: "c", navn: "Vandgasligevægten", T: "700 K", K: 5.44,
             r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]],
             c0: { CO: 0.200, H2O: 0.100, CO2: 0, H2: 0 }, enhed: 0.010, xStof: "CO", xOrd: "omsat" }
    };

    /* Maalene paa fane 1. type: ligevaegt (find Y = K med skyderen),
       udtryk (skriv raekker i skemaet med x), forkast (CAS og klik paa den
       loesning, der ikke kan bruges), graense (x saa langt op som muligt,
       og klik paa det stof, der er brugt op). */
    D.MAAL = [
        { id: "a-lige", rx: "a", gruppe: "a", type: "ligevaegt", navn: "Find ligevægten",
          linje: "Træk i x, til reaktionsbrøken Y er lig med K.",
          tekst: "SO₂Cl₂ spaltes i en lukket beholder. Skyderen x bestemmer, hvor meget SO₂Cl₂ der er spaltet. Find det x, hvor Y = K.",
          slut: "Ved ligevægt er x ≈ 0,078 M. Så meget SO₂Cl₂ er spaltet, når Y = K." },
        { id: "a-udtryk", rx: "a", gruppe: "a", type: "udtryk", raekker: ["aendr", "lig"], navn: "Skriv koncentrationerne med x",
          linje: "Skriv ændringen og ligevægtskoncentrationen for hvert stof med x.",
          tekst: "Tallene i skemaet følger skyderen. Skriv i felterne, hvad tallene er udtrykt ved x.",
          slut: "Der er spaltet x SO₂Cl₂, så der er 0,200 − x tilbage. Der dannes lige så meget SO₂ og Cl₂, så [SO₂] = [Cl₂] = x." },
        { id: "a-cas", rx: "a", gruppe: "a", type: "forkast", navn: "To løsninger",
          linje: "Løs ligningen Y = K med CAS, og klik på den løsning, der ikke kan bruges.",
          tekst: "Ved ligevægt er Y = K. Det er en ligning med x som den eneste ubekendte. CAS giver to løsninger.",
          slut: "x = −0,128 M kan ikke bruges: så skulle [SO₂] være −0,128 M. Ligningen har to løsninger, men kun den ene giver mening i beholderen." },
        { id: "b-aendr", rx: "b", gruppe: "b", type: "udtryk", raekker: ["aendr"], navn: "Koefficienten 2",
          linje: "Træk lidt i x, se på beholderen, og skriv ændringerne med x.",
          tekst: "H₂ og Br₂ danner HBr. Træk skyderen et lille stykke, og se, hvad der sker med molekylerne.",
          slut: "For hver H₂, der omsættes, bruges én Br₂, og der dannes 2 HBr. Koefficienterne bliver til tallene foran x." },
        { id: "b-lige", rx: "b", gruppe: "b", type: "ligevaegt", navn: "Find ligevægten",
          linje: "Træk i x, til reaktionsbrøken Y er lig med K.",
          tekst: "Find det x, hvor Y = K.",
          slut: "Ved ligevægt er x = 0,160 M. Så er [HBr] = 2x = 0,320 M." },
        { id: "b-cas", rx: "b", gruppe: "b", type: "forkast", navn: "To positive løsninger",
          linje: "Løs ligningen Y = K med CAS, og klik på den løsning, der ikke kan bruges.",
          tekst: "Denne gang er begge løsninger positive. Den ene kan alligevel ikke bruges.",
          slut: "x = 0,267 M kan ikke bruges: så skulle [H₂] være 0,200 − 0,267 = −0,067 M. Der kan ikke omsættes mere H₂, end der er." },
        { id: "c-graense", rx: "c", gruppe: "c", type: "graense", navn: "Hvor langt kan x komme?",
          linje: "Træk x så langt op, som det kan komme, og klik på det stof, der er brugt op.",
          tekst: "Der er 0,200 M CO og kun 0,100 M H₂O fra start. Træk x helt op. Hvad stopper reaktionen?",
          slut: "H₂O er brugt op ved x = 0,100 M. x kan ikke blive større end den mindste startkoncentration." },
        { id: "c-cas", rx: "c", gruppe: "c", type: "forkast", navn: "Grænsen for x",
          linje: "Løs ligningen Y = K med CAS, og klik på den løsning, der ikke kan bruges.",
          tekst: "Løs ligningen med CAS. Brug grænsen fra før til at afgøre, hvilken løsning der kan bruges.",
          slut: "x = 0,280 M kan ikke bruges: så skulle [H₂O] være 0,100 − 0,280 = −0,180 M. En brugbar løsning ligger mellem 0 og 0,100 M." }
    ];

    D.GRUPPER_BH = [
        { id: "a", titel: "SO₂Cl₂ ⇌ SO₂ + Cl₂" },
        { id: "b", titel: "H₂ + Br₂ ⇌ 2HBr" },
        { id: "c", titel: "CO + H₂O ⇌ CO₂ + H₂" }
    ];

    /* ----- Fane 2: uden x (den gamles niveau 1) ----------------------------------
       type kc: K ud fra stofmaengderne n (mol) i rumfanget V (L).
       type ukendt: K og koncentrationerne kendt (kendt), undtagen ukendt. */
    D.UX = [
        { id: "nocl", gruppe: "kc", type: "kc", navn: "Nitrosylchlorid spaltes", T: "462 °C",
          r: [[2, "NOCl", "g"]], p: [[2, "NO", "g"], [1, "Cl2", "g"]],
          V: 2.00, n: { NOCl: 0.600, NO: 0.0800, Cl2: 0.0400 },
          tekst: "Nitrosylchlorid opvarmes til 462 °C i en lukket beholder på 2,00 L, indtil ligevægten har indstillet sig. Ved ligevægt er der 0,600 mol NOCl, 0,0800 mol NO og 0,0400 mol Cl₂.",
          spm: "Bestem ligevægtskonstanten Kc med enhed." },
        { id: "nh3", gruppe: "kc", type: "kc", navn: "Ammoniaksyntesen", T: "400 °C",
          r: [[1, "N2", "g"], [3, "H2", "g"]], p: [[2, "NH3", "g"]],
          V: 5.00, n: { N2: 0.500, H2: 1.50, NH3: 0.250 },
          tekst: "Dinitrogen og dihydrogen reagerer ved 400 °C i en lukket beholder på 5,00 L. Ved ligevægt er der 0,500 mol N₂, 1,50 mol H₂ og 0,250 mol NH₃.",
          spm: "Bestem ligevægtskonstanten Kc med enhed." },
        { id: "vg1", gruppe: "kc", type: "kc", navn: "Vandgasligevægten", T: "700 K",
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]],
          V: 10.0, n: { CO: 0.300, H2O: 0.300, CO2: 0.700, H2: 0.700 },
          tekst: "Carbonmonooxid og vanddamp reagerer ved 700 K i en lukket beholder på 10,0 L. Ved ligevægt er der 0,300 mol CO, 0,300 mol H₂O, 0,700 mol CO₂ og 0,700 mol H₂. Vandet er på gasform.",
          spm: "Bestem ligevægtskonstanten Kc med enhed." },
        { id: "fosgen", gruppe: "uk", type: "ukendt", navn: "Phosgen-ligevægten", T: "600 K",
          r: [[1, "CO", "g"], [1, "Cl2", "g"]], p: [[1, "COCl2", "g"]],
          K: 25.0, kendt: { CO: 0.120, COCl2: 0.450 }, ukendt: "Cl2",
          tekst: "Phosgen dannes af carbonmonooxid og dichlor i en lukket beholder. Ved 600 K er Kc = 25,0 M⁻¹. Ved ligevægt er [CO] = 0,120 M og [COCl₂] = 0,450 M.",
          spm: "Bestem ligevægtskoncentrationen af Cl₂." },
        { id: "so3", gruppe: "uk", type: "ukendt", navn: "Svovltrioxid spaltes", T: "900 K",
          r: [[2, "SO3", "g"]], p: [[2, "SO2", "g"], [1, "O2", "g"]],
          K: 4.00e-3, kendt: { SO3: 0.500, O2: 0.100 }, ukendt: "SO2",
          tekst: "Svovltrioxid spaltes i en lukket beholder. Ved 900 K er Kc = 4,00 · 10⁻³ M. Ved ligevægt er [SO₃] = 0,500 M og [O₂] = 0,100 M.",
          spm: "Bestem ligevægtskoncentrationen af SO₂." }
    ];

    D.GRUPPER_UX = [
        { id: "kc", titel: "Kc ud fra stofmængder" },
        { id: "uk", titel: "En ukendt koncentration" }
    ];

    /* ----- Fane 3: med x (den gamles niveau 2 og 3) ------------------------------
       c0: startkoncentrationerne (M); stoffer, der ikke staar, er 0. */
    D.MX = [
        { id: "butan", gruppe: "let", navn: "Isomerisering af butan", T: "25 °C", K: 2.50,
          r: [[1, "nbutan", "g"]], p: [[1, "isobutan", "g"]], c0: { nbutan: 0.600 },
          tekst: "n-butan kan omdannes til isobutan. En lukket beholder fyldes med n-butan, så koncentrationen er 0,600 M. Ved 25 °C er Kc = 2,50." },
        { id: "buten", gruppe: "let", navn: "Cis-trans-isomerisering af 2-buten", T: "400 K", K: 4.00,
          r: [[1, "cis", "g"]], p: [[1, "trans", "g"]], c0: { cis: 0.500 },
          tekst: "cis-2-buten kan omdannes til trans-2-buten. En lukket beholder fyldes med cis-2-buten, så koncentrationen er 0,500 M. Ved 400 K er Kc = 4,00." },
        { id: "so2cl2", gruppe: "mid", navn: "Sulfurylchlorid spaltes", T: "375 °C", K: 0.0500,
          r: [[1, "SO2Cl2", "g"]], p: [[1, "SO2", "g"], [1, "Cl2", "g"]], c0: { SO2Cl2: 0.200 },
          tekst: "Sulfurylchlorid spaltes til svovldioxid og dichlor. En lukket beholder fyldes med SO₂Cl₂, så koncentrationen er 0,200 M. Ved 375 °C er Kc = 0,0500 M." },
        { id: "cocl2", gruppe: "mid", navn: "Phosgen spaltes", T: "800 K", K: 0.0200,
          r: [[1, "COCl2", "g"]], p: [[1, "CO", "g"], [1, "Cl2", "g"]], c0: { COCl2: 0.500 },
          tekst: "Phosgen spaltes ved høj temperatur. En lukket beholder fyldes med COCl₂, så koncentrationen er 0,500 M. Ved 800 K er Kc = 0,0200 M." },
        { id: "iod", gruppe: "mid", navn: "Iod spaltes til iodatomer", T: "1200 K", K: 0.0100,
          r: [[1, "I2", "g"]], p: [[2, "I", "g"]], c0: { I2: 0.400 },
          tekst: "Iodmolekyler spaltes til frie iodatomer. En lukket beholder fyldes med I₂, så koncentrationen er 0,400 M. Ved 1200 K er Kc = 0,0100 M." },
        { id: "vg2", gruppe: "svaer", navn: "Vandgasligevægten", T: "700 K", K: 5.44,
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]], c0: { CO: 0.100, H2O: 0.100 },
          tekst: "En lukket beholder fyldes med CO og vanddamp, så begge koncentrationer er 0,100 M. Der er intet CO₂ og intet H₂ fra start. Ved 700 K er Kc = 5,44." },
        { id: "hbr", gruppe: "svaer", navn: "Dannelse af hydrogenbromid", T: "500 K", K: 64.0,
          r: [[1, "H2", "g"], [1, "Br2", "g"]], p: [[2, "HBr", "g"]], c0: { H2: 0.200, Br2: 0.200 },
          tekst: "En lukket beholder fyldes med H₂ og Br₂, så begge koncentrationer er 0,200 M. Der er intet HBr fra start. Ved 500 K er Kc = 64,0." },
        { id: "vg3", gruppe: "svaer", navn: "Vandgas med forskellig start", T: "700 K", K: 5.44,
          r: [[1, "CO", "g"], [1, "H2O", "g"]], p: [[1, "CO2", "g"], [1, "H2", "g"]], c0: { CO: 0.200, H2O: 0.100 },
          tekst: "En lukket beholder fyldes med 0,200 M CO og 0,100 M vanddamp. Der er intet CO₂ og intet H₂ fra start. Ved 700 K er Kc = 5,44." }
    ];

    D.GRUPPER_MX = [
        { id: "let", titel: "Let" },
        { id: "mid", titel: "Middel" },
        { id: "svaer", titel: "Svær" }
    ];

    /* Den gamle b2.3's facit, som selvtesten sammenligner med */
    D.GAMMEL = {
        nocl: { K: 3.5556e-4 }, nh3: { K: 0.92593 }, vg1: { K: 5.4444 },
        fosgen: { svar: 0.150 }, so3: { svar: 0.100 },
        butan: { x: 0.42857 }, buten: { x: 0.400 }, so2cl2: { x: 0.078078, x2: -0.128078 },
        cocl2: { x: 0.0904988, x2: -0.1104988 }, iod: { x: 0.0303975, x2: -0.0328975 },
        vg2: { x: 0.06999 }, hbr: { x: 0.160 }, vg3: { x: 0.0874927, x2: 0.2800749 }
    };

    /* Delene i en opgave paa fane 2 og 3, i den raekkefoelge de regnes */
    D.DELE = {
        kc: ["lov", "konc", "indsaet"],
        ukendt: ["lov", "indsaet", "cas", "svar"],
        x: ["lov", "defx", "skema", "ligning", "cas", "valg", "konc"]
    };

    D.DEL_NAVN = {
        lov: "Ligevægtsloven", konc: "Koncentrationerne", indsaet: "Indsæt", cas: "CAS",
        svar: "Svaret", defx: "Hvad er x?", skema: "Skemaet", ligning: "Ligningen", valg: "Løsningen"
    };

    /* Saetningen, der definerer x (fane 3). Den rigtige stoerrelse er
       koncentrationen; de andre er de fejl, elever laver. */
    D.X_STR = [
        { v: "konc", tekst: "den koncentration" },
        { v: "lig", tekst: "ligevægtskoncentrationen" },
        { v: "n", tekst: "den stofmængde" },
        { v: "broek", tekst: "den brøkdel" }
    ];
    D.X_ENH = [
        { v: "M", tekst: "M" },
        { v: "mol", tekst: "mol" },
        { v: "ingen", tekst: "ingen enhed" }
    ];

    D.ROS_OPGAVE = ["Flot.", "Godt.", "Sådan.", "Rigtigt."];
    D.FAERDIG = {
        bh: "Alle otte mål er nået. Opgaverne står på de to næste faner.",
        ux: "Alle fem opgaver er løst. Prøv fanen Med x.",
        mx: "Alle otte opgaver er løst."
    };

    NK.Data = D;
}());

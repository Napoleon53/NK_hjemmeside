/* =====================================================================
   data.js - stofferne, strukturerne, reaktionerne og teksterne

   Et stof hedder "familie:n", fx "cl:1" (HCl) og "cl:0" (Cl⁻). n er
   antallet af hydroner, familien har lige nu, og ladningen er n + q0.
   Den korresponderende base til "po4:3" er derfor "po4:2", og den
   korresponderende syre til "nh:3" er "nh:4". Formlerne skrives af
   NK.Syrebase.formel (model.js) ud fra FAM.

   PKS er tabelvaerdier (pKs ved 25 °C). De vises ikke nogen steder; de
   afgoer kun, hvem der er syren, naar to stoffer moedes, og hvilke
   par traeningen maa bruge (model.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Familierne ------------------------------------------------------
       kerne  formlen uden de flytbare H (med almindelige tal)
       hFoer  H skrives foran kernen (HCl, H₂SO₄) eller bagefter (NH₃)
       q0     ladningen uden flytbare H
       min    det mindste n, der findes (bruges ogsaa til forkerte svar)
       max    det stoerste n, der findes
       plus   "syren tager en hydron" (H₂Cl⁺) kan bruges som forkert svar
       navn   navnene til teorien og hintene, efter n */
    D.FAM = {
        cl:   { kerne: "Cl",     hFoer: true,  q0: -1, min: 0, max: 1, plus: true,  navn: ["chlorid", "hydrogenchlorid"] },
        br:   { kerne: "Br",     hFoer: true,  q0: -1, min: 0, max: 1, plus: true,  navn: ["bromid", "hydrogenbromid"] },
        f:    { kerne: "F",      hFoer: true,  q0: -1, min: 0, max: 1, plus: true,  navn: ["fluorid", "hydrogenfluorid"] },
        no3:  { kerne: "NO3",    hFoer: true,  q0: -1, min: 0, max: 1, plus: true,  navn: ["nitrat", "salpetersyre"] },
        ac:   { kerne: "CH3COO", hFoer: false, q0: -1, min: 0, max: 1, plus: true,  navn: ["acetat", "eddikesyre"] },
        fo:   { kerne: "HCOO",   hFoer: false, q0: -1, min: 0, max: 1, plus: true,  navn: ["formiat", "myresyre"] },
        vand: { kerne: "O",      hFoer: true,  q0: -2, min: 1, max: 3, plus: false, navn: ["oxid", "hydroxid", "vand", "oxonium"] },
        nh:   { kerne: "N",      hFoer: false, q0: -3, min: 2, max: 4, plus: false, navn: ["", "", "amid", "ammoniak", "ammonium"] },
        so4:  { kerne: "SO4",    hFoer: true,  q0: -2, min: 0, max: 2, plus: true,  navn: ["sulfat", "hydrogensulfat", "svovlsyre"] },
        po4:  { kerne: "PO4",    hFoer: true,  q0: -3, min: 0, max: 3, plus: true,  navn: ["phosphat", "hydrogenphosphat", "dihydrogenphosphat", "phosphorsyre"] },
        co3:  { kerne: "CO3",    hFoer: true,  q0: -2, min: 0, max: 2, plus: true,  navn: ["carbonat", "hydrogencarbonat", "kulsyre"] }
    };

    /* pKs for stoffet som syre. Et stof uden en vaerdi afgiver ikke en
       hydron i animationen, og et stof, hvis korresponderende syre ikke
       har en vaerdi, tager ikke imod en. */
    D.PKS = {
        "cl:1": -7, "br:1": -9, "no3:1": -1.4, "f:1": 3.17, "fo:1": 3.75, "ac:1": 4.76,
        "vand:3": 0, "vand:2": 14, "nh:4": 9.25,
        "so4:2": -3, "so4:1": 1.99,
        "po4:3": 2.15, "po4:2": 7.20, "po4:1": 12.35,
        "co3:2": 6.35, "co3:1": 10.33
    };

    /* ----- Traeningen: hvilke stoffer hvert niveau bruger -------------------
       Let:    en syre eller en base sammen med vand
       Middel: en syre og en base uden vand
       Svaer:  amfolytter og syrer med flere hydroner
       model.js laver alle par, der er gyldige (se NK.Syrebase.gyldig),
       og tager et tilfaeldigt. */
    D.NIVEAUER = {
        let: {
            navn: "Let", tekst: "syre eller base med vand",
            med: ["vand:2"],
            andre: ["cl:1", "br:1", "f:1", "no3:1", "ac:1", "fo:1", "nh:3", "ac:0", "fo:0", "f:0"]
        },
        middel: {
            navn: "Middel", tekst: "syre og base uden vand",
            syrer: ["cl:1", "br:1", "f:1", "no3:1", "ac:1", "fo:1", "vand:3", "nh:4"],
            baser: ["vand:1", "nh:3", "ac:0", "fo:0", "f:0"]
        },
        svaer: {
            navn: "Svær", tekst: "amfolytter og flere hydroner",
            flere: ["so4:2", "so4:1", "so4:0", "po4:3", "po4:2", "po4:1", "po4:0", "co3:2", "co3:1", "co3:0"],
            andre: ["vand:2", "vand:3", "vand:1", "nh:3", "nh:4", "ac:1", "ac:0"]
        }
    };
    D.NIVEAU_RAEKKE = ["let", "middel", "svaer"];

    /* ----- Strukturerne til fane 1 ---------------------------------------------
       Koordinater i bindingslaengder, y nedad. Et atom er [symbol, x, y]
       eller [symbol, x, y, ladning]; en gruppe, der ikke aendrer sig (NO₂),
       er ["NO2", x, y, 0, true] og tegnes som en formel uden frie par.
       Bindinger er [a, b, orden]. De frie elektronpar regnes ud af
       valenselektronerne og tegnes, hvor der er plads (model.js).
       Syrens H og basens frie par vender helst mod hoejre (+x); molekylet
       til hoejre paa scenen spejles, saa de vender ind mod midten. */
    var V = function (grader) { return grader * Math.PI / 180; };
    function ud(x, y, grader, l) { return [x + Math.cos(V(grader)) * (l || 1), y + Math.sin(V(grader)) * (l || 1)]; }

    var h2oH1 = ud(0, 0, 218), h2oH2 = ud(0, 0, 322);
    var no3H = ud(0, 0, 322);
    var co3OR = ud(0, 0, 30), co3OL = ud(0, 0, 150);
    var co3HR = ud(co3OR[0], co3OR[1], 330), co3HL = ud(co3OL[0], co3OL[1], 210);
    var acO1 = ud(0, 0, 300), acO2 = ud(0, 0, 60);
    var po4HL = ud(-1, 0, 210), po4HR = ud(1, 0, 330), po4HB = ud(0, 1, 120);
    var nhA = ud(0, 0, 300), nhB = ud(0, 0, 60);

    D.STRUKTUR = {
        "cl:1": { atomer: [["Cl", 0, 0], ["H", 1, 0]], bind: [[0, 1, 1]] },
        "vand:2": { atomer: [["O", 0, 0], ["H", h2oH1[0], h2oH1[1]], ["H", h2oH2[0], h2oH2[1]]], bind: [[0, 1, 1], [0, 2, 1]] },
        "vand:3": { atomer: [["O", 0, 0, 1], ["H", -1, 0], ["H", nhA[0], nhA[1]], ["H", nhB[0], nhB[1]]], bind: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
        "vand:1": { atomer: [["O", 0, 0, -1], ["H", -1, 0]], bind: [[0, 1, 1]] },
        "nh:3": { atomer: [["N", 0, 0], ["H", -1, 0], ["H", nhA[0], nhA[1]], ["H", nhB[0], nhB[1]]], bind: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
        "no3:1": { atomer: [["NO2", -1.25, 0, 0, true], ["O", 0, 0], ["H", no3H[0], no3H[1]]], bind: [[0, 1, 1], [1, 2, 1]] },
        "ac:1": {
            atomer: [["C", -1, 0], ["H", -2, 0], ["H", -1, -1], ["H", -1, 1], ["C", 0, 0],
                     ["O", acO1[0], acO1[1]], ["O", acO2[0], acO2[1]], ["H", acO2[0] + 1, acO2[1]]],
            bind: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [4, 5, 2], [4, 6, 1], [6, 7, 1]]
        },
        "co3:2": {
            atomer: [["C", 0, 0], ["O", 0, -1], ["O", co3OR[0], co3OR[1]], ["O", co3OL[0], co3OL[1]],
                     ["H", co3HR[0], co3HR[1]], ["H", co3HL[0], co3HL[1]]],
            bind: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [2, 4, 1], [3, 5, 1]]
        },
        "co3:1": {
            atomer: [["C", 0, 0], ["O", 0, -1], ["O", co3OR[0], co3OR[1]], ["O", co3OL[0], co3OL[1], -1],
                     ["H", co3HR[0], co3HR[1]]],
            bind: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [2, 4, 1]]
        },
        "po4:3": {
            atomer: [["P", 0, 0], ["O", 0, -1], ["O", -1, 0], ["O", 1, 0], ["O", 0, 1],
                     ["H", po4HL[0], po4HL[1]], ["H", po4HR[0], po4HR[1]], ["H", po4HB[0], po4HB[1]]],
            bind: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1], [2, 5, 1], [3, 6, 1], [4, 7, 1]]
        }
    };

    /* H, der sidder paa kernen og aldrig flytter (CH₃ i eddikesyre).
       Bruges af selvtesten til at taelle hydronerne i en struktur. */
    D.KERNE_H = { ac: 3, fo: 1 };

    /* ----- Fane 1: de ti reaktioner ------------------------------------------------
       a og b staar i den raekkefoelge, de skrives. syre er den, der giver
       hydronen; selvtesten tjekker, at modellen siger det samme.
       fast: a staar altid til venstre (den foerste opgave). */
    D.HYDRON = [
        { a: "cl:1", b: "vand:2", syre: "cl:1", fast: true,
          tekst: "HCl er en syre. Træk dens H over på vandet.",
          hint: "Tag fat i H'et på HCl, og slip det på vandmolekylet." },
        { a: "no3:1", b: "vand:2", syre: "no3:1",
          tekst: "Salpetersyre giver også en hydron til vandet.",
          hint: "H'et sidder på et O. Træk det over på vandmolekylet." },
        { a: "ac:1", b: "vand:2", syre: "ac:1",
          tekst: "Eddikesyre har fire H. Kun ét af dem kan gives af.",
          hint: "H'erne på C sidder fast. Det sure H sidder på O." },
        { a: "nh:3", b: "vand:2", syre: "vand:2",
          tekst: "Ammoniak er en base. Hvem er så syren?",
          hint: "N har et frit elektronpar, der kan tage imod. Vandet giver et H." },
        { a: "cl:1", b: "nh:3", syre: "cl:1",
          tekst: "Ingen vand denne gang. Hvem giver, og hvem tager imod?",
          hint: "HCl er syren. N i NH₃ tager imod med sit frie elektronpar." },
        { a: "vand:3", b: "vand:1", syre: "vand:3",
          tekst: "To ioner. Hvem har en hydron at give af?",
          hint: "OH⁻ kan kun tage imod. Træk et H fra H₃O⁺ over på OH⁻." },
        { a: "ac:1", b: "vand:1", syre: "ac:1",
          tekst: "Eddikesyre møder hydroxid.",
          hint: "Tag H'et på O i eddikesyren, og slip det på OH⁻." },
        { a: "co3:2", b: "vand:2", syre: "co3:2",
          tekst: "Kulsyre har to sure H. Der flytter kun ét ad gangen.",
          hint: "Tag ét af H'erne på O, og slip det på vandmolekylet." },
        { a: "po4:3", b: "vand:2", syre: "po4:3",
          tekst: "Phosphorsyre har tre. Stadig kun ét ad gangen.",
          hint: "Tag ét af H'erne på O, og slip det på vandmolekylet." },
        { a: "co3:1", b: "vand:1", syre: "co3:1",
          tekst: "Hydrogencarbonat kan begge dele. Hvad gør den her?",
          hint: "OH⁻ kan kun tage imod. Så må HCO₃⁻ give sit H." }
    ];

    /* ----- Kemichael --------------------------------------------------------------- */
    D.INTRO_HYDRON = [
        "Her flytter du hydroner. H⁺, altså.",
        "Træk et H fra syren, og slip det på basen.",
        "Hydroner er små. Tab dem ikke på gulvet."
    ];
    D.INTRO_PRODUKTER = [
        "Tavlen. Her skriver du produkterne.",
        "Træk to formler op på pladserne efter pilen.",
        "Kridtet er gratis. Fejlene også."
    ];
    D.INTRO_PAR = [
        "Her finder du parrene i en reaktion.",
        "Sæt syre, base og deres makkere på plads.",
        "Makkerne hører sammen. Som mig og kaffen."
    ];

    D.HYDRON_FAERDIG = "Ti hydroner flyttet. Ingen tabt på gulvet.";
    D.TI_I_TRAEK = "Ti i træk. Det skriver jeg op.";

    /* Paaskeaegget: en hydron sluppet i kaffen */
    D.KAFFE_SUR = [
        "Min kaffe er sur nok i forvejen.",
        "Nej tak. Den er sur uden din hjælp.",
        "Smager den surt i morgen, ved jeg, hvem det var."
    ];

    NK.Data = D;
}());

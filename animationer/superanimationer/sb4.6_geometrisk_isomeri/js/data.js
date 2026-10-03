/* =====================================================================
   data.js - grupperne, molekylerne og opgaverne

   En gruppe er det, der sidder paa et C-atom i dobbeltbindingen. Den har:
     h, v     teksten til hoejre og til venstre for dobbeltbindingen:
              [tekst, plads for det atom, der binder, laengde af symbolet].
              Til venstre staar det bindende atom sidst: H₃C, CH₃CH₂, HO
     atom     det atom, der sidder paa C-atomet
     naeste   de atomer, der sidder paa det atom (en C=O taeller som to O)
     kugle    farve og stoerrelse i kuglemodellen paa fane 1

   Prioriteten regnes af atomnumrene (js/ez.js), aldrig skrevet i haanden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* Atomnumrene, eleven skal bruge */
    D.Z = { H: 1, C: 6, N: 7, O: 8, F: 9, Cl: 17, Br: 35, I: 53 };
    D.NAVN = { H: "hydrogen", C: "carbon", N: "nitrogen", O: "oxygen", F: "fluor", Cl: "chlor", Br: "brom", I: "iod" };

    D.G = {
        H:     { h: ["H", 0, 1], v: ["H", 0, 1], atom: "H", naeste: [],
                 kugle: { farve: "#eef1f4", r: 13, tekst: "#1d2433" } },
        CH3:   { h: ["CH₃", 0, 1], v: ["H₃C", 2, 1], atom: "C", naeste: ["H", "H", "H"],
                 kugle: { farve: "#6f7782", r: 20, tekst: "#ffffff" } },
        C2H5:  { h: ["CH₂CH₃", 0, 1], v: ["CH₃CH₂", 3, 1], atom: "C", naeste: ["C", "H", "H"],
                 kugle: { farve: "#5b6370", r: 23, tekst: "#ffffff" } },
        CH2OH: { h: ["CH₂OH", 0, 1], v: ["HOCH₂", 2, 1], atom: "C", naeste: ["O", "H", "H"],
                 kugle: { farve: "#7a6f86", r: 23, tekst: "#ffffff" } },
        COOH:  { h: ["COOH", 0, 1], v: ["HOOC", 3, 1], atom: "C", naeste: ["O", "O", "O"],
                 kugle: { farve: "#8a5a5a", r: 23, tekst: "#ffffff" } },
        OCH3:  { h: ["OCH₃", 0, 1], v: ["H₃CO", 3, 1], atom: "O", naeste: ["C"],
                 kugle: { farve: "#c4473b", r: 21, tekst: "#ffffff" } },
        F:     { h: ["F", 0, 1], v: ["F", 0, 1], atom: "F", naeste: [],
                 kugle: { farve: "#8fd3e8", r: 16, tekst: "#1d2433" } },
        Cl:    { h: ["Cl", 0, 2], v: ["Cl", 0, 2], atom: "Cl", naeste: [],
                 kugle: { farve: "#3fae72", r: 19, tekst: "#ffffff" } },
        Br:    { h: ["Br", 0, 2], v: ["Br", 0, 2], atom: "Br", naeste: [],
                 kugle: { farve: "#a8402f", r: 21, tekst: "#ffffff" } },
        I:     { h: ["I", 0, 1], v: ["I", 0, 1], atom: "I", naeste: [],
                 kugle: { farve: "#7b4fb0", r: 23, tekst: "#ffffff" } }
    };
    /* Raekkefoelgen i paletten paa fane 2 */
    D.PALET = ["H", "CH3", "C2H5", "CH2OH", "COOH", "OCH3", "F", "Cl", "Br", "I"];

    /* Gruppens tekst, som den skrives i en saetning (altid som til hoejre) */
    D.tekst = function (id) { return D.G[id].h[0]; };

    /* ----- Fane 1: Dobbeltbindingen ----------------------------------------------
       v og h: grupperne paa venstre og hoejre C-atom. Ved en dobbeltbinding er
       den foerste oppe og den anden nede; ved en enkeltbinding sidder de tre
       hele vejen rundt. drej: hvor hoejre halvdel staar fra start (grader). */
    D.DREJ = [
        { id: "d1", navn: "Butan", slags: "drej", binding: 1,
          v: ["CH3", "H", "H"], h: ["CH3", "H", "H"], drej: 180,
          maal: "Træk i den højre halvdel, så de to CH₃ kommer til at stå på samme side.",
          trin: "Tag fat i den højre CH₃ med musen, og træk den op." },
        { id: "d2", navn: "But-2-en", slags: "drej", binding: 2,
          v: ["CH3", "H"], h: ["H", "CH3"], drej: 0,
          maal: "Prøv det samme med but-2-en. Træk den højre CH₃ op, så de to CH₃ står på samme side.",
          trin: "Tag fat i den højre CH₃ nederst, og træk den op." },
        { id: "d3", navn: "1,2-dichlorethen", slags: "to", binding: 2,
          a: { v: ["Cl", "H"], h: ["Cl", "H"] }, b: { v: ["Cl", "H"], h: ["H", "Cl"] },
          kog: [60, 48], smelt: [-81, -49],
          maal: "Her er to molekyler med formlen C₂H₂Cl₂. Er A og B det samme stof?",
          trin: "Se på, hvor de to Cl sidder. Vælg så et svar under molekylerne." },
        { id: "d4", navn: "Propen", slags: "byt", binding: 2,
          v: ["CH3", "H"], h: ["H", "H"], svar: "samme",
          maal: "Byt om på CH₃ og H til venstre. Er det så et nyt stof?",
          trin: "Træk CH₃ til venstre ned på H, så de bytter plads." },
        { id: "d5", navn: "But-2-en", slags: "byt", binding: 2,
          v: ["CH3", "H"], h: ["CH3", "H"], svar: "nyt",
          maal: "Byt om på CH₃ og H til venstre. Er det så et nyt stof?",
          trin: "Træk CH₃ til venstre ned på H, så de bytter plads." },
        { id: "d6", navn: "2-methylbut-2-en", slags: "byt", binding: 2,
          v: ["CH3", "H"], h: ["CH3", "CH3"], svar: "samme",
          maal: "Byt om på CH₃ og H til venstre. Er det så et nyt stof?",
          trin: "Træk CH₃ til venstre ned på H, så de bytter plads." }
    ];
    D.DREJ_GRUPPER = [
        { id: "drej", titel: "Drej" },
        { id: "byt", titel: "Byt og vend" }
    ];
    D.DREJ[0].gruppe = D.DREJ[1].gruppe = D.DREJ[2].gruppe = "drej";
    D.DREJ[3].gruppe = D.DREJ[4].gruppe = D.DREJ[5].gruppe = "byt";

    /* ----- Fane 2: Prioriteten -------------------------------------------------------
       pos: venstre oppe, venstre nede, hoejre oppe, hoejre nede. */
    D.PRIO = [
        { id: "a1", gruppe: "let", slags: "afgoer", pos: ["Cl", "H", "Cl", "H"] },
        { id: "a2", gruppe: "let", slags: "afgoer", pos: ["Br", "H", "H", "Cl"] },
        { id: "a3", gruppe: "let", slags: "afgoer", pos: ["CH3", "H", "H", "CH3"] },
        { id: "a4", gruppe: "middel", slags: "afgoer", pos: ["C2H5", "Cl", "CH3", "H"] },
        { id: "a5", gruppe: "middel", slags: "afgoer", pos: ["CH3", "H", "CH3", "Br"] },
        { id: "a6", gruppe: "middel", slags: "afgoer", pos: ["CH3", "CH3", "Cl", "H"] },
        { id: "a7", gruppe: "svaer", slags: "afgoer", pos: ["CH3", "C2H5", "H", "Br"] },
        { id: "a8", gruppe: "svaer", slags: "afgoer", pos: ["CH2OH", "COOH", "OCH3", "CH3"] },
        { id: "b1", gruppe: "byg", slags: "byg", krav: "brcl",
          maal: "Byg et Z-molekyle med Br på det ene C-atom og Cl på det andet.",
          facit: ["Br", "H", "Cl", "H"] },
        { id: "b2", gruppe: "byg", slags: "byg", krav: "ch3e",
          maal: "Byg et E-molekyle, hvor de to CH₃ sidder på samme side.",
          facit: ["CH3", "H", "CH3", "Br"] },
        { id: "b3", gruppe: "byg", slags: "byg", krav: "ingenH",
          maal: "Byg et molekyle uden E/Z-isomeri. Ingen af grupperne må være H.",
          facit: ["CH3", "CH3", "Cl", "Br"] },
        { id: "b4", gruppe: "byg", slags: "byg", krav: "fireZ",
          maal: "Byg et Z-molekyle med fire forskellige grupper.",
          facit: ["Br", "CH3", "Cl", "H"] }
    ];
    D.PRIO_GRUPPER = [
        { id: "let", titel: "Let" },
        { id: "middel", titel: "Middel" },
        { id: "svaer", titel: "Svær" },
        { id: "byg", titel: "Byg selv" }
    ];
    D.PRIO.forEach(function (o, i) { o.navn = o.slags === "byg" ? "Byg " + (i - 7) : "Molekyle " + (i + 1); });

    /* ----- Fane 3: Spillet (de gamle tal fra b6.1) ----------------------------------- */
    D.SPIL = {
        runder: 15,
        point: 50,
        /* Bonus efter, hvor hurtigt der svares (sekunder) */
        bonus: [[2, 50, "Lynhurtigt"], [3, 30, "Hurtigt"], [4, 20, "Flot tempo"], [10, 10, "Godt"]],
        rang: [
            [0, "Kemi-novice", "Øvelse gør mester. Prøv igen."],
            [700, "Laborant", "Du har styr på det grundlæggende."],
            [1000, "Kemiker", "Du kender dine prioriteter."],
            [1150, "Professor", "Hurtigt og sikkert."],
            [1350, "Nobelpris-kandidat", "Næsten fejlfrit og lynhurtigt."]
        ]
    };

    D.FAERDIG = {
        dr: "Alle seks. Der er kun to former, når begge C-atomer har to forskellige grupper.",
        pr: "Alle tolv. Du kan bestemme E og Z ud fra prioriteterne."
    };
    D.ROS = ["Rigtigt.", "Sådan.", "Det passer.", "Godt set."];

    /* Paaskeaegget: fire H giver ethen */
    D.ETHEN = "Fire H er ethen. Det sidder i bananer og får dem til at modne.";

    NK.Data = D;
}());

/* =====================================================================
   data.js - alkoholerne, opgaverne og de faste tekster

   Her kan man rette uden at roere koden:
     EN        elektronegativiteten (Paulings tal med én decimal, som i
               sc8.2 og Databogen)
     SERIER    fane 1: de tre alkoholer, der oxideres trin for trin
     OPGAVER   fane 2: de ti alkoholer og de fire svar paa hver
     OXTAL     svarene paa fane 1 (romertallene)
     FORSOEG   fane 3: glassene, skemaerne og maengderne
     FORSOEG_TRIN  fane 3: trinene i panelet

   En serie paa fane 1:
     id, navn   alkoholens navn (motoren navngiver ogsaa produkterne, saa
                de skal ikke staa her)
     type       primaer, sekundaer eller tertiaer
     atomer     [id, grundstof, x, y] maalt i bindingslaengder. Alle
                bindinger er lige lange, ogsaa dem til H, saa man kan se
                elektronparrene flytte sig (brugerens oenske 3. nov. 2026)
     bindinger  [a, b, orden]
     c          carbonatomet med OH-gruppen (det, der oxideres)

   En opgave paa fane 2:
     alkohol    navnet. Motoren bygger molekylet og regner produktet ud;
                selvtesten tjekker, at det er det samme som svaret her
     maade      "mild" eller "kraftig" (kun primaere alkoholer)
     middel     "dichromat" eller "permanganat". Mild er altid dichromat og
                kraftig altid permanganat; de andre har hver sit
     niv        1 Let, 2 Middel, 3 Svaer
     valg       de fire svar i fast raekkefoelge: aldehyd, keton,
                carboxylsyre og null (ingen reaktion). Det forkerte er
                stoffer med samme carbonskelet, som elever gaetter paa
     svar       det rigtige (navnet eller null)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    D.EN = { H: 2.1, C: 2.5, O: 3.5 };
    D.GRUNDSTOF = { H: "hydrogen", C: "carbon", O: "oxygen" };

    /* Romertallene fra −III til +III: svarene paa fane 1 og trappen i panelet */
    D.OXTAL = [-3, -2, -1, 0, 1, 2, 3];
    var ROM = ["0", "I", "II", "III", "IV", "V", "VI", "VII"];
    D.rom = function (n) {
        if (n === 0) return "0";
        return (n > 0 ? "+" : "−") + ROM[Math.abs(n)];
    };
    /* Et tal med fortegn: +1, −2, 0 */
    D.fortegn = function (n) { return n === 0 ? "0" : (n > 0 ? "+" : "−") + Math.abs(n); };

    D.TYPER = {
        primaer: { navn: "primær", Navn: "Primær", antal: "ét andet carbonatom" },
        sekundaer: { navn: "sekundær", Navn: "Sekundær", antal: "to andre carbonatomer" },
        tertiaer: { navn: "tertiær", Navn: "Tertiær", antal: "tre andre carbonatomer" }
    };
    D.TYPE_ORDEN = ["primaer", "sekundaer", "tertiaer"];

    /* Stofklasserne har samme farver som i sb4.8 Navne paa organiske stoffer.
       farve: paa de moerke kort. blaek: paa det hvide whiteboard */
    D.KLASSER = {
        alkohol: { navn: "alkohol", ental: "en alkohol", farve: "#3fc7d1", blaek: "#0b8791" },
        aldehyd: { navn: "aldehyd", ental: "et aldehyd", farve: "#f0a35a", blaek: "#c2570c" },
        keton: { navn: "keton", ental: "en keton", farve: "#b9a0f5", blaek: "#7046cf" },
        carboxylsyre: { navn: "carboxylsyre", ental: "en carboxylsyre", farve: "#f58a7e", blaek: "#cf3327" }
    };

    /* ----- Fane 1: oxidationstallet trin for trin ---------------------------- */
    D.SERIER = [
        {
            id: "ethanol", navn: "ethanol", type: "primaer",
            atomer: [
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["O1", "O", 1, 0], ["Ho", "H", 2, 0],
                ["H1", "H", -2, 0], ["H2", "H", -1, -1], ["H3", "H", -1, 1],
                ["H4", "H", 0, -1], ["H5", "H", 0, 1]
            ],
            bindinger: [["C1", "C2", 1], ["C2", "O1", 1], ["O1", "Ho", 1], ["C1", "H1", 1], ["C1", "H2", 1],
                ["C1", "H3", 1], ["C2", "H4", 1], ["C2", "H5", 1]],
            c: "C2"
        },
        {
            id: "propan-2-ol", navn: "propan-2-ol", type: "sekundaer",
            atomer: [
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["C3", "C", 1, 0], ["O1", "O", 0, -1], ["Ho", "H", 0, -2],
                ["H1", "H", -2, 0], ["H2", "H", -1, -1], ["H3", "H", -1, 1],
                ["H4", "H", 0, 1],
                ["H5", "H", 2, 0], ["H6", "H", 1, -1], ["H7", "H", 1, 1]
            ],
            bindinger: [["C1", "C2", 1], ["C2", "C3", 1], ["C2", "O1", 1], ["O1", "Ho", 1],
                ["C1", "H1", 1], ["C1", "H2", 1], ["C1", "H3", 1], ["C2", "H4", 1],
                ["C3", "H5", 1], ["C3", "H6", 1], ["C3", "H7", 1]],
            c: "C2"
        },
        {
            /* Methylgruppen nedad har sine H skraat ud, saa de ikke stoeder ind i
               H-atomerne paa C1 og C3 */
            id: "2-methylpropan-2-ol", navn: "2-methylpropan-2-ol", type: "tertiaer",
            atomer: [
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["C3", "C", 1, 0], ["C4", "C", 0, 1],
                ["O1", "O", 0, -1], ["Ho", "H", 0, -2],
                ["H1", "H", -2, 0], ["H2", "H", -1, -1], ["H3", "H", -1, 1],
                ["H4", "H", 2, 0], ["H5", "H", 1, -1], ["H6", "H", 1, 1],
                ["H7", "H", 0, 2], ["H8", "H", -0.71, 1.71], ["H9", "H", 0.71, 1.71]
            ],
            bindinger: [["C1", "C2", 1], ["C2", "C3", 1], ["C2", "C4", 1], ["C2", "O1", 1], ["O1", "Ho", 1],
                ["C1", "H1", 1], ["C1", "H2", 1], ["C1", "H3", 1], ["C3", "H4", 1], ["C3", "H5", 1],
                ["C3", "H6", 1], ["C4", "H7", 1], ["C4", "H8", 1], ["C4", "H9", 1]],
            c: "C2"
        }
    ];

    /* ----- Fane 2: hvad dannes? --------------------------------------------- */
    D.NIVEAUER = ["Let", "Middel", "Svær"];

    D.OPGAVER = [
        { alkohol: "propan-1-ol", middel: "dichromat", maade: "mild", niv: 1,
          valg: ["propanal", "propanon", "propansyre", null], svar: "propanal" },
        { alkohol: "propan-2-ol", middel: "dichromat", niv: 1,
          valg: ["propanal", "propanon", "propansyre", null], svar: "propanon" },
        { alkohol: "2-methylpropan-2-ol", middel: "permanganat", niv: 1,
          valg: ["2-methylpropanal", "butanon", "2-methylpropansyre", null], svar: null },
        { alkohol: "butan-1-ol", middel: "permanganat", maade: "kraftig", niv: 2,
          valg: ["butanal", "butanon", "butansyre", null], svar: "butansyre" },
        { alkohol: "butan-2-ol", middel: "permanganat", niv: 2,
          valg: ["butanal", "butanon", "butansyre", null], svar: "butanon" },
        { alkohol: "pentan-3-ol", middel: "dichromat", niv: 2,
          valg: ["pentanal", "pentan-3-on", "pentansyre", null], svar: "pentan-3-on" },
        { alkohol: "2-methylbutan-2-ol", middel: "dichromat", niv: 2,
          valg: ["2-methylbutanal", "3-methylbutan-2-on", "2-methylbutansyre", null], svar: null },
        { alkohol: "2-methylpropan-1-ol", middel: "dichromat", maade: "mild", niv: 3,
          valg: ["2-methylpropanal", "butanon", "2-methylpropansyre", null], svar: "2-methylpropanal" },
        { alkohol: "3-methylbutan-2-ol", middel: "permanganat", niv: 3,
          valg: ["3-methylbutanal", "3-methylbutan-2-on", "3-methylbutansyre", null], svar: "3-methylbutan-2-on" },
        { alkohol: "3-methylbutan-1-ol", middel: "permanganat", maade: "kraftig", niv: 3,
          valg: ["3-methylbutanal", "3-methylbutan-2-on", "3-methylbutansyre", null], svar: "3-methylbutansyre" }
    ];

    D.VALG_KLASSE = ["aldehyd", "keton", "carboxylsyre", null];

    /* Oxidationsmidlerne paa fane 2, begge i sur opløsning (bogens afsnit B4.3).
       glas: sprites/reagensglas_<farve>.svg foer og efter */
    D.MIDLER = {
        dichromat: { navn: "dichromat", formel: "Cr₂O₇²⁻", fra: "orange", til: "grønt", glasFra: "orange", glasTil: "groen" },
        permanganat: { navn: "permanganat", formel: "MnO₄⁻", fra: "violet", til: "farveløst", glasFra: "violet", glasTil: "farveloes" }
    };

    /* Mild oxidation er med dichromat, og aldehydet destilleres fra. Kraftig
       oxidation er med permanganat i overskud (brugerens valg 3. nov. 2026) */
    D.MAADE = {
        mild: { navn: "Mild oxidation", middel: "dichromat", tekst: "Ved en mild oxidation med dichromat destilleres aldehydet fra, så snart det er dannet." },
        kraftig: { navn: "Kraftig oxidation", middel: "permanganat", tekst: "Ved en kraftig oxidation bruges permanganat i overskud." }
    };

    /* ----- Fane 3: de ukendte alkoholer (Basiskemi B, Xperiment 24) --------------
       0,5 mL alkohol og 0,5 mL 0,020 M KMnO₄ i et minireagensglas, opvarmet i
       vandbad. Opløsningen er neutral, saa MnO₄⁻ bliver til brunsort MnO₂, og
       der dannes OH⁻. Skemaerne er afstemt (selvtesten tjekker atomer og
       ladning). pH regnes af modellen (K.forsoegPH): al permanganaten
       reagerer, og den primaere oxideres helt til carboxylat-ionen. */
    D.FORSOEG = {
        nMnO4: 0.5e-3 * 0.020,          /* mol MnO₄⁻ i hvert glas */
        volumen: 1.0e-3,                /* L i hvert glas */
        alkoholer: [
            { navn: "propan-1-ol", type: "primaer" },
            { navn: "propan-2-ol", type: "sekundaer" },
            { navn: "2-methylpropan-2-ol", type: "tertiaer" }
        ],
        /* Stofferne i skemaerne: grundstoffer og ladning */
        STOFFER: {
            "propan-1-ol": { C: 3, H: 8, O: 1 }, "propan-2-ol": { C: 3, H: 8, O: 1 },
            "propanon": { C: 3, H: 6, O: 1 }, "propanoat": { C: 3, H: 5, O: 2, q: -1 },
            "MnO₄⁻": { Mn: 1, O: 4, q: -1 }, "MnO₂": { Mn: 1, O: 2 },
            "OH⁻": { O: 1, H: 1, q: -1 }, "H₂O": { H: 2, O: 1 }
        },
        skemaer: {
            primaer: { venstre: [[3, "propan-1-ol"], [4, "MnO₄⁻"]], hoejre: [[3, "propanoat"], [4, "MnO₂"], [1, "OH⁻"], [4, "H₂O"]] },
            sekundaer: { venstre: [[3, "propan-2-ol"], [2, "MnO₄⁻"]], hoejre: [[3, "propanon"], [2, "MnO₂"], [2, "OH⁻"], [2, "H₂O"]] }
        }
    };

    /* Universalindikatorpapirets farver fra pH 0 til 14 */
    D.PH_FARVE = ["#b5121b", "#d6232b", "#e8562a", "#f08a24", "#f6b72a", "#f2d02a", "#c9d936", "#7cc142",
        "#2fa36b", "#1f8f9a", "#2c6db5", "#3b4aa8", "#4f3895", "#5b2c83", "#4a1f6b"];

    /* Fane 3: trinene i panelet. Afstemningen foelger C-bogens fem trin
       (afsnit 8.4); trin 5 (oxygen som tjek) staar paa tavlen uden spoergsmaal */
    D.FORSOEG_TRIN = [
        { id: "forsoeg", navn: "Forsøget" },
        { id: "t", navn: "Den tertiære alkohol" },
        { id: "s", navn: "Den sekundære alkohol" },
        { id: "p", navn: "Den primære alkohol" }
    ];

    /* pH efter forsoeget. Brugerens valg 3. nov. 2026 af paedagogiske grunde:
       den primaere giver pH 8, saa dannelsen af OH⁻ kan ses (3 propan-1-ol og
       4 MnO₄⁻ giver 1 OH⁻). I praksis ender den ofte omkring 6 (brugerens
       journal), og den sekundaere omkring 8-10. Den tertiaere reagerer ikke */
    D.FORSOEG_PH = { tertiaer: 7, primaer: 8, sekundaer: 10 };

    /* Farverne i glassene paa fane 3 */
    D.FORSOEG_FARVE = {
        alkohol: "#eef3f8", violet: "#9b2fc0",
        brun: { primaer: "#3b2412", sekundaer: "#7a4f2a" },      /* MnO₂ svaevende: den primaere er moerkest */
        klar: { primaer: "#e3d3b8", sekundaer: "#efe5d3" },       /* efter bundfaldet er faldet til bunds */
        bundfald: "#26170b"
    };

    /* Farverne paa tavlen som i C-bogens afstemningsfigurer: oxidationen
       orange, reduktionen blaa, koefficienterne groenblaa */
    D.AFSTEM_FARVE = { ox: "#b8560f", red: "#2a5fd6", koef: "#0f766e" };

    D.FAERDIG = {
        o: "Alle tre alkoholer er oxideret så langt, de kan.",
        p: "Alle ti opgaver er løst.",
        u: "Forsøget er løst."
    };

    D.TAL = ["ingen", "ét", "to", "tre", "fire"];
    D.TAL_N = ["ingen", "én", "to", "tre", "fire"];

    D.stor = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    /* Saenkede tal som HTML (<sub>), som er lettere at laese end tegnene ₀-₉ */
    var SAENKET = "₀₁₂₃₄₅₆₇₈₉";
    D.sub = function (html) {
        return String(html).replace(/[₀-₉]+/g, function (m) {
            return "<sub>" + m.split("").map(function (c) { return SAENKET.indexOf(c); }).join("") + "</sub>";
        });
    };

    NK.Data = D;
}());

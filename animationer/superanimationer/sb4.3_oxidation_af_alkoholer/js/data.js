/* =====================================================================
   data.js - alkoholerne, opgaverne og de faste tekster

   Her kan man rette uden at roere koden:
     EN        elektronegativiteten (Paulings tal med én decimal, som i
               sc8.2 og Databogen)
     SERIER    fane 1: de tre alkoholer, der oxideres trin for trin
     OPGAVER   fane 2: de ti alkoholer og de fire svar paa hver
     OXTAL     svarene paa fane 1 (romertallene)

   En serie paa fane 1:
     id, navn   alkoholens navn (motoren navngiver ogsaa produkterne, saa
                de skal ikke staa her)
     type       primaer, sekundaer eller tertiaer
     atomer     [id, grundstof, x, y] maalt i bindingslaengder. Bindinger
                til H er 0,62 lange som i motorens strukturformel
                (NK.Layout.struktur90)
     bindinger  [a, b, orden]
     c          carbonatomet med OH-gruppen (det, der oxideres)

   En opgave paa fane 2:
     alkohol    navnet. Motoren bygger molekylet og regner produktet ud;
                selvtesten tjekker, at det er det samme som svaret her
     maade      "mild" eller "kraftig" (kun primaere alkoholer)
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
    var ROM = ["0", "I", "II", "III", "IV"];
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
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["O1", "O", 1, 0], ["Ho", "H", 1.62, 0],
                ["H1", "H", -1.62, 0], ["H2", "H", -1, -0.62], ["H3", "H", -1, 0.62],
                ["H4", "H", 0, -0.62], ["H5", "H", 0, 0.62]
            ],
            bindinger: [["C1", "C2", 1], ["C2", "O1", 1], ["O1", "Ho", 1], ["C1", "H1", 1], ["C1", "H2", 1],
                ["C1", "H3", 1], ["C2", "H4", 1], ["C2", "H5", 1]],
            c: "C2"
        },
        {
            id: "propan-2-ol", navn: "propan-2-ol", type: "sekundaer",
            atomer: [
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["C3", "C", 1, 0], ["O1", "O", 0, -1], ["Ho", "H", 0, -1.62],
                ["H1", "H", -1.62, 0], ["H2", "H", -1, -0.62], ["H3", "H", -1, 0.62],
                ["H4", "H", 0, 0.62],
                ["H5", "H", 1.62, 0], ["H6", "H", 1, -0.62], ["H7", "H", 1, 0.62]
            ],
            bindinger: [["C1", "C2", 1], ["C2", "C3", 1], ["C2", "O1", 1], ["O1", "Ho", 1],
                ["C1", "H1", 1], ["C1", "H2", 1], ["C1", "H3", 1], ["C2", "H4", 1],
                ["C3", "H5", 1], ["C3", "H6", 1], ["C3", "H7", 1]],
            c: "C2"
        },
        {
            id: "2-methylpropan-2-ol", navn: "2-methylpropan-2-ol", type: "tertiaer",
            atomer: [
                ["C1", "C", -1, 0], ["C2", "C", 0, 0], ["C3", "C", 1, 0], ["C4", "C", 0, 1],
                ["O1", "O", 0, -1], ["Ho", "H", 0, -1.62],
                ["H1", "H", -1.62, 0], ["H2", "H", -1, -0.62], ["H3", "H", -1, 0.62],
                ["H4", "H", 1.62, 0], ["H5", "H", 1, -0.62], ["H6", "H", 1, 0.62],
                ["H7", "H", 0, 1.62], ["H8", "H", -0.62, 1], ["H9", "H", 0.62, 1]
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
        { alkohol: "propan-1-ol", maade: "mild", niv: 1,
          valg: ["propanal", "propanon", "propansyre", null], svar: "propanal" },
        { alkohol: "propan-2-ol", niv: 1,
          valg: ["propanal", "propanon", "propansyre", null], svar: "propanon" },
        { alkohol: "2-methylpropan-2-ol", niv: 1,
          valg: ["2-methylpropanal", "butanon", "2-methylpropansyre", null], svar: null },
        { alkohol: "butan-1-ol", maade: "kraftig", niv: 2,
          valg: ["butanal", "butanon", "butansyre", null], svar: "butansyre" },
        { alkohol: "butan-2-ol", niv: 2,
          valg: ["butanal", "butanon", "butansyre", null], svar: "butanon" },
        { alkohol: "pentan-3-ol", niv: 2,
          valg: ["pentanal", "pentan-3-on", "pentansyre", null], svar: "pentan-3-on" },
        { alkohol: "2-methylbutan-2-ol", niv: 2,
          valg: ["2-methylbutanal", "3-methylbutan-2-on", "2-methylbutansyre", null], svar: null },
        { alkohol: "2-methylpropan-1-ol", maade: "mild", niv: 3,
          valg: ["2-methylpropanal", "butanon", "2-methylpropansyre", null], svar: "2-methylpropanal" },
        { alkohol: "3-methylbutan-2-ol", niv: 3,
          valg: ["3-methylbutanal", "3-methylbutan-2-on", "3-methylbutansyre", null], svar: "3-methylbutan-2-on" },
        { alkohol: "3-methylbutan-1-ol", maade: "kraftig", niv: 3,
          valg: ["3-methylbutanal", "3-methylbutan-2-on", "3-methylbutansyre", null], svar: "3-methylbutansyre" }
    ];

    D.VALG_KLASSE = ["aldehyd", "keton", "carboxylsyre", null];

    D.MAADE = {
        mild: { navn: "Mild oxidation", tekst: "Aldehydet destilleres fra, så snart det er dannet." },
        kraftig: { navn: "Kraftig oxidation", tekst: "Overskud af dichromat og lang tid." }
    };

    D.FAERDIG = {
        o: "Alle tre alkoholer er oxideret så langt, de kan.",
        p: "Alle ti opgaver er løst."
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

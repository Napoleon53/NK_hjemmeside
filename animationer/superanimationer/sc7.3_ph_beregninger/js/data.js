/* =====================================================================
   data.js - stofferne, flaskerne, fanerne og replikkerne

   Alt, der kan staa som data, staar her. Facit regnes af modellen i
   kemi.js. Hverdagsstofferne og deres pH er de samme som i sc7.2
   (typiske vaerdier; de varierer fra produkt til produkt).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    /* ----- Hverdagsstofferne (fane 1 og 2) -------------------------------------
       id er ogsaa navnet paa spritet. Opgaven laegger hoejst 0,25 til eller
       fra, saa det ikke er de samme tal hver gang. */
    D.STOFFER = [
        { id: "citron", navn: "Citronsaft", ph: 2.3 },
        { id: "cola", navn: "Cola", ph: 2.5 },
        { id: "kaffe", navn: "Kaffe", ph: 5.0 },
        { id: "maelk", navn: "Mælk", ph: 6.7 },
        { id: "natron", navn: "Natron i vand", ph: 8.3 },
        { id: "afloebsrens", navn: "Afløbsrens", ph: 13.5 },
        { id: "mavesaft", navn: "Mavesaft", ph: 1.5 },
        { id: "oel", navn: "Øl", ph: 4.5 },
        { id: "regnvand", navn: "Regnvand", ph: 5.6 },
        { id: "blod", navn: "Blod", ph: 7.4 },
        { id: "saebevand", navn: "Sæbevand", ph: 9.5 },
        { id: "klorin", navn: "Klorin", ph: 12.5 }
    ];
    D.VARIATION = 0.25;

    D.stof = function (id) {
        for (var i = 0; i < D.STOFFER.length; i++) if (D.STOFFER[i].id === id) return D.STOFFER[i];
        return null;
    };

    /* De foerste opgaver paa hver fane, i den raekkefoelge. Saa er den foerste
       opgave altid et kendt, surt stof, og der kommer hurtigt en base. */
    D.START_PH = ["citron", "saebevand", "kaffe", "afloebsrens"];
    D.START_KONC = ["cola", "blod", "mavesaft", "klorin"];

    /* ----- De staerke syrer og baser (fane 3) ------------------------------------
       c: koncentrationerne paa flaskerne, mol/L, med to betydende cifre.
       Calciumhydroxid kan kun opløses til ca. 0,02 M, derfor de smaa tal. */
    D.SYRER = [
        { formel: "HCl", navn: "Saltsyre", rest: "Cl⁻", c: [0.10, 0.050, 0.020, 0.0050, 0.0012, 0.25] },
        { formel: "HNO₃", navn: "Salpetersyre", rest: "NO₃⁻", c: [0.15, 0.040, 0.0080, 0.0025, 0.030] }
    ];
    D.BASER = [
        { formel: "NaOH", navn: "Natriumhydroxid", ion: "Na⁺", n: 1, c: [0.10, 0.050, 0.025, 0.0040, 0.0015] },
        { formel: "KOH", navn: "Kaliumhydroxid", ion: "K⁺", n: 1, c: [0.20, 0.030, 0.0060, 0.012] },
        { formel: "Ca(OH)₂", navn: "Calciumhydroxid", ion: "Ca²⁺", n: 2, c: [0.020, 0.015, 0.010, 0.0050, 0.0025] },
        { formel: "Ba(OH)₂", navn: "Bariumhydroxid", ion: "Ba²⁺", n: 2, c: [0.10, 0.050, 0.020, 0.0080] }
    ];
    D.SYRER.forEach(function (s) {
        s.skema = s.formel + "(aq) + H₂O(l) → H₃O⁺(aq) + " + s.rest + "(aq)";
    });

    /* De foerste flasker: syre, base, syre, base med to OH */
    D.START_STAERK = [["syre", "HCl"], ["base", "NaOH"], ["syre", "HNO₃"], ["base", "Ca(OH)₂"]];

    /* ----- Fanerne ----------------------------------------------------------------
       Linjen under scenen siger ellers altid det naeste skridt (visStatus i
       sim_regn.js). Her er det, der staar, mens pH-metret maaler og bagefter. */
    D.FANER = {
        ph: {
            titel: "Find pH",
            status: {
                maaler: "pH-metret måler pH.",
                faerdig: "pH-metret viser {ph}. Dit svar passer. Tryk på Ny opgave."
            }
        },
        konc: {
            titel: "Find koncentrationen",
            status: {
                maaler: "pH-metret måler pH.",
                faerdig: "Begge koncentrationer står nu på kortet. Tryk på Ny opgave."
            }
        },
        staerk: {
            titel: "Stærke syrer og baser",
            status: {
                maaler: "pH-metret måler pH.",
                faerdig: "pH-metret viser {ph}. Dit svar passer. Tryk på Ny opgave."
            }
        }
    };

    /* Klik paa en station paa regnevejen: hvad stoerrelsen er */
    D.STATION = {
        h: "[H₃O⁺] er koncentrationen af H₃O⁺-ioner. Den måles i M, som betyder mol pr. liter.",
        oh: "[OH⁻] er koncentrationen af OH⁻-ioner. Den måles i M, som betyder mol pr. liter.",
        ph: "pH er et tal uden enhed. Jo mindre pH, jo surere er væsken.",
        c: "c er koncentrationen af syren eller basen i flasken. Den står på flasken."
    };

    /* ----- Kemichael -----------------------------------------------------------------
       Hoejst ca. 60 tegn pr. replik og ingen teori. Linje 1: hvad man skal
       paa fanen, sagt ligeud. Linje 2: hvordan (han peger). Linje 3: en
       toer bemaerkning, som en svag elev ogsaa forstaar. */
    D.INTRO = {
        ph: [
            "Her finder du pH, når du kender [H₃O⁺].",
            "Følg trinene i opgaven, og brug lommeregneren.",
            "Til sidst tjekker pH-metret dit svar. Det snyder ikke."
        ],
        konc: [
            "Her kender du pH og skal finde koncentrationerne.",
            "Først [H₃O⁺], så [OH⁻]. Følg trinene i opgaven.",
            "Svarene skrives på kortet. Det gamle faldt af."
        ],
        staerk: [
            "Her står koncentrationen på flasken. Du skal finde pH.",
            "Det tager flere trin. Regnevejen viser, hvor du er.",
            "Rør ikke flaskerne. Tallene ætser ikke."
        ]
    };

    /* Ros efter fem opgaver paa en fane (én gang) */
    D.ROS = {
        ph: "Fem gange rigtigt. pH-metret keder sig.",
        konc: "Fem kort udfyldt. Lageret er ryddeligt igen.",
        staerk: "Fem flasker, og ingen er åbnet. Sådan."
    };
    D.ROS_ANTAL = 5;

    /* Paaskeaeg: lommeregneren giver 42 */
    D.AEG_42 = "42. Det er svaret, bare ikke på den her opgave.";

    NK.Data = D;
}());

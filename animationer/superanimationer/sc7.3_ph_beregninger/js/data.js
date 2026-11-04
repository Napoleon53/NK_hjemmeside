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
       Praesentationen (../kemichael/praesentation.js): ét trin ad gangen,
       og eleven trykker Naeste. Hvert trin er to til fire hele saetninger i
       Kemibogens sprog: hvad fanen traener, og hvordan tingene bruges. sel:
       det, han peger paa, og som faar en gul ramme, der blinker (de
       usynlige .anker over laerredet, opgavekortet og lommeregneren).
       Ingen vittigheder i praesentationen. */
    D.INTRO = {
        ph: [
            { tekst: "I denne fane beregner du pH ud fra koncentrationen af oxoniumioner, [H₃O⁺]. " +
                "Etiketten ved stoffet viser [H₃O⁺], og dit svar bliver skrevet på den samme etiket.",
              sel: ["#ph-anker-etiket", "#ph-anker-glas"] },
            { tekst: "Regnevejen øverst viser, hvad du kender, og hvad du skal finde. " +
                "Opgavekortet deler beregningen op i små trin, hvor du vælger formlen, taster udregningen på lommeregneren og skriver svaret. " +
                "Under det, du taster, viser lommeregneren, hvordan den har læst udtrykket.",
              sel: ["#ph-anker-vej", "#ph-kort", "#regner"] },
            { tekst: "Når svaret er rigtigt, måler pH-metret pH, så du kan se, at tallene passer. " +
                "Knappen Giv hint på opgavekortet hjælper dig med det trin, du er i gang med.",
              sel: ["#ph-anker-meter", "#ph-knap"] }
        ],
        konc: [
            { tekst: "I denne fane kender du pH og skal beregne koncentrationerne [H₃O⁺] og [OH⁻]. " +
                "pH-metret har allerede målt pH i opløsningen. " +
                "Dine svar bliver skrevet på etiketten ved stoffet.",
              sel: ["#konc-anker-meter", "#konc-anker-etiket"] },
            { tekst: "Først beregner du [H₃O⁺] ud fra pH, og derefter beregner du [OH⁻] ud fra [H₃O⁺]. " +
                "Regnevejen øverst viser, hvor langt du er nået.",
              sel: "#konc-anker-vej" },
            { tekst: "Opgavekortet deler hvert trin op. Du vælger formlen, taster udregningen på lommeregneren og skriver svaret. " +
                "En koncentration skriver du med tallet i det store felt og eksponenten i det lille felt. " +
                "Knappen Giv hint på opgavekortet hjælper dig med det trin, du er i gang med.",
              sel: ["#konc-kort", "#regner"] }
        ],
        staerk: [
            { tekst: "I denne fane beregner du pH i en opløsning af en stærk syre eller en stærk base. " +
                "Flasken viser stoffet og dets koncentration. " +
                "Dine svar bliver skrevet på etiketten ved siden af flasken.",
              sel: ["#staerk-anker-glas", "#staerk-anker-etiket"] },
            { tekst: "En stærk base kræver flere trin end en stærk syre, fordi du først skal beregne [OH⁻]. " +
                "Regnevejen øverst viser, hvor langt du er nået frem mod pH.",
              sel: "#staerk-anker-vej" },
            { tekst: "Opgavekortet deler beregningen op i små trin, og du taster udregningerne på lommeregneren. " +
                "Til sidst måler pH-metret pH i opløsningen. " +
                "Knappen Giv hint på opgavekortet hjælper dig med det trin, du er i gang med.",
              sel: ["#staerk-kort", "#regner", "#staerk-anker-meter"] }
        ]
    };

    /* Ros efter fem opgaver, som eleven selv har regnet paa en fane (én
       gang pr. browser). Det er sammen med paaskeaegget de eneste gange,
       han kommer ind af sig selv (brugerens regel 4. nov. 2026). */
    D.ROS = {
        ph: "Du har selv regnet pH rigtigt i fem opgaver. pH-metret er begyndt at kede sig.",
        konc: "Du har udfyldt fem etiketter rigtigt. Så mange korrekte etiketter har kemikalielageret aldrig haft.",
        staerk: "Du har regnet pH for fem flasker uden at åbne en eneste. Sådan skal stærke syrer og baser behandles."
    };
    D.ROS_ANTAL = 5;

    /* Paaskeaeg: lommeregneren giver 42 (én gang pr. besoeg) */
    D.AEG_42 = "Lommeregneren viser 42. Det er svaret på alt, men ikke på denne opgave.";

    NK.Data = D;
}());

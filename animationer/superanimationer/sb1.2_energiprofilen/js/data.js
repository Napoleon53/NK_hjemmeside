/* =====================================================================
   data.js - kemien og teksterne (ingen tegning her)

   Fane 1 (Læs energiprofilen): NO₂ + CO → NO + CO₂ og den modsatte vej.
     Energierne er regnet fra reaktanterne NO₂ + CO (0 kJ/mol):
     toppen (det aktiverede kompleks) 134 kJ/mol og produkterne
     −226 kJ/mol. ΔH = −226 kJ/mol er regnet af dannelsesentalpierne i
     Databogen (NO₂ 33,2; CO −110,5; NO 90,3; CO₂ −393,5 kJ/mol).
     Eₐ = 134 kJ/mol er lærebogsværdien for reaktionen (fx Zumdahl, Chang
     har 132 kJ/mol). Den modsatte vej har Eₐ = 134 + 226 = 360 kJ/mol.

   Fane 2 (Temperaturen): thiosulfat og syre med Eₐ = 50 kJ/mol, samme
     værdi som i sb1.4_thiosulfat. Molekylernes bevægelsesenergi følger
     Maxwell-Boltzmann-fordelingen (tre dimensioner):
       f(E) = 2/√π · (RT)^(−3/2) · √E · e^(−E/RT)
     og andelen med mere energi end Eₐ (x = Eₐ/RT) er
       P = erfc(√x) + 2·√(x/π) · e^(−x)
     Ved 20 °C er det 1 ud af 155 millioner, ved 30 °C 1 ud af 80
     millioner (1,94 gange flere) og ved 10 °C 1 ud af 315 millioner.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.D = {};

    D.NOEGLE = "nk-sb1.2-energiprofilen";

    /* ----- Fane 1: energiprofilen ----------------------------------------- */
    D.PROFIL = {
        frem: { venstre: "NO₂ + CO", hoejre: "NO + CO₂", Er: 0, Et: 134, Ep: -226 },
        tilbage: { venstre: "NO + CO₂", hoejre: "NO₂ + CO", Er: -226, Et: 134, Ep: 0 }
    };

    /* ----- Fane 2: molekylernes energi --------------------------------------- */
    D.R = 8.314;              /* J/(mol·K) */
    D.EA = 50;                /* kJ/mol, som i sb1.4 */
    D.T_START = 20;           /* °C */
    D.T_MIN = 0;
    D.T_MAX = 50;
    D.T_TRIN = 5;

    D.RT = function (tc) { return D.R * (tc + 273.15) / 1000; };       /* kJ/mol */

    /* Fordelingen: andel pr. kJ/mol */
    D.f = function (E, tc) {
        if (E <= 0) return 0;
        var rt = D.RT(tc);
        return 2 / Math.sqrt(Math.PI) * Math.pow(rt, -1.5) * Math.sqrt(E) * Math.exp(-E / rt);
    };

    /* erfc med en kædebrøk (præcis for de store argumenter, der bruges her) */
    function erfc(z) {
        var t = 0;
        for (var n = 60; n >= 1; n--) t = n / 2 / (z + t);
        return Math.exp(-z * z) / Math.sqrt(Math.PI) / (z + t);
    }

    /* Andelen af molekylerne med mere energi end Eₐ */
    D.andel = function (tc) {
        var x = D.EA / D.RT(tc);
        return erfc(Math.sqrt(x)) + 2 * Math.sqrt(x / Math.PI) * Math.exp(-x);
    };

    /* "1 ud af 155 millioner" */
    D.udAf = function (tc) {
        var n = 1 / D.andel(tc);
        if (n >= 1e9) return "1 ud af " + NK.betydende(n / 1e9, 3) + " milliarder";
        return "1 ud af " + Math.round(n / 1e6) + " millioner";
    };

    /* Forholdet til 20 °C, fx 1,94 */
    D.forhold = function (tc) { return D.andel(tc) / D.andel(D.T_START); };

    /* ----- Opgaverne -----------------------------------------------------------
       Et trin er et spørgsmål (svar, rigtig, hints, godt) eller en handling
       (handling: true, maal(sim), hints). Et forkert svar har sin egen
       forklaring (fejl). om: det, spørgsmålet handler om, og som får den gule
       ring i scenen. */

    D.OPGAVER_PROFIL = [
        {
            navn: "Byg profilen",
            under: "NO₂ + CO → NO + CO₂",
            retning: "frem",
            trin: [
                {
                    om: "punkter",
                    tekst: "Energiprofilen viser energien undervejs i reaktionen NO₂ + CO → NO + CO₂. Hvor på energiprofilen står reaktanterne NO₂ og CO?",
                    svar: [
                        { t: "Ved A", rigtig: true },
                        { t: "Ved B", fejl: "Ved B er reaktionen halvvejs. Reaktanterne står, før reaktionen begynder, helt til venstre." },
                        { t: "Ved C", fejl: "Ved C er reaktionen slut. Pilen under profilen viser, at reaktionen går fra venstre mod højre." }
                    ],
                    hints: ["Pilen under profilen viser reaktionens forløb.", "Reaktanterne er de stoffer, reaktionen begynder med."],
                    godt: "Reaktanterne står til venstre, før reaktionen begynder."
                },
                {
                    om: "punkter",
                    tekst: "Hvor på energiprofilen står produkterne NO og CO₂?",
                    svar: [
                        { t: "Ved A", fejl: "Ved A står reaktanterne NO₂ og CO." },
                        { t: "Ved B", fejl: "Ved B er reaktionen halvvejs. Produkterne står, når reaktionen er slut." },
                        { t: "Ved C", rigtig: true }
                    ],
                    hints: ["Produkterne er de stoffer, der er dannet, når reaktionen er slut.", "Reaktionen går fra venstre mod højre."],
                    godt: "Produkterne står til højre, når reaktionen er slut."
                },
                {
                    om: "B",
                    tekst: "Ved B er en binding mellem N og O ved at blive brudt, og en ny binding mellem O og C ved at blive dannet. Hvad kaldes tilstanden ved B?",
                    svar: [
                        { t: "Det aktiverede kompleks", rigtig: true },
                        { t: "Et produkt", fejl: "Et produkt er færdigt dannet. Ved B er bindingerne kun halvt brudt og halvt dannet." },
                        { t: "En katalysator", fejl: "En katalysator er et stof, der tilsættes. Ved B er der kun de atomer, der reagerer." }
                    ],
                    hints: ["Tilstanden findes kun i et ganske kort øjeblik på toppen af bakken.", "Den skrives med et dobbeltkryds, ‡."],
                    godt: "Det aktiverede kompleks ligger på toppen af bakken og findes kun i et ganske kort øjeblik."
                },
                {
                    om: "pile",
                    tekst: "Hvilken pil viser aktiveringsenergien (Eₐ) for NO₂ + CO → NO + CO₂?",
                    svar: [
                        { t: "Pil 1", rigtig: true },
                        { t: "Pil 2", fejl: "Pil 2 går fra produkterne til toppen. Reaktionen begynder ved reaktanterne NO₂ og CO." },
                        { t: "Pil 3", fejl: "Pil 3 går fra reaktanterne til produkterne. Den viser energiforskellen, ikke bakkens højde." }
                    ],
                    hints: ["Aktiveringsenergien er bakkens højde, set fra de stoffer, reaktionen begynder med.", "Find pilen, der begynder ved reaktanterne og ender på toppen."],
                    godt: "Aktiveringsenergien er højden fra reaktanterne op til det aktiverede kompleks."
                },
                {
                    om: "Ea",
                    tekst: "Hvor stor er aktiveringsenergien (Eₐ) for NO₂ + CO → NO + CO₂?",
                    svar: [
                        { t: "134 kJ/mol", rigtig: true },
                        { t: "360 kJ/mol", fejl: "360 kJ/mol er højden fra produkterne NO og CO₂. Mål fra reaktanterne ved 0 kJ/mol." },
                        { t: "226 kJ/mol", fejl: "226 kJ/mol er forskellen mellem reaktanter og produkter. Eₐ er højden op til toppen." }
                    ],
                    hints: ["Aflæs energien ved reaktanterne og ved toppen på aksen.", "Eₐ = 134 kJ/mol − 0 kJ/mol."],
                    godt: "Eₐ = 134 kJ/mol − 0 kJ/mol = 134 kJ/mol."
                },
                {
                    om: "niveauer",
                    tekst: "Produkterne NO og CO₂ ligger 226 kJ/mol lavere end reaktanterne. Er reaktionen NO₂ + CO → NO + CO₂ exoterm eller endoterm?",
                    svar: [
                        { t: "Exoterm", rigtig: true },
                        { t: "Endoterm", fejl: "I en endoterm reaktion ligger produkterne højere end reaktanterne. Her ligger de lavere." }
                    ],
                    hints: ["Energien, der mangler i produkterne, går ud i omgivelserne.", "Afgiver reaktionen energi, er den exoterm."],
                    godt: "ΔH = −226 kJ/mol. Energien afgives som varme, så omgivelserne bliver varmere."
                }
            ]
        },
        {
            navn: "Den modsatte vej",
            under: "NO + CO₂ → NO₂ + CO",
            retning: "tilbage",
            trin: [
                {
                    om: "punkter",
                    tekst: "Reaktionen kan også gå den modsatte vej, NO + CO₂ → NO₂ + CO. Profilen er spejlet. Hvor står reaktanterne NO og CO₂ nu?",
                    svar: [
                        { t: "Ved A", rigtig: true },
                        { t: "Ved B", fejl: "Ved B står det aktiverede kompleks. Det er det samme som før." },
                        { t: "Ved C", fejl: "Ved C står produkterne NO₂ og CO. Reaktionen går stadig fra venstre mod højre." }
                    ],
                    hints: ["Reaktionen går stadig fra venstre mod højre.", "NO og CO₂ er nu de stoffer, reaktionen begynder med."],
                    godt: "NO og CO₂ står nu til venstre ved −226 kJ/mol. Bakken er den samme."
                },
                {
                    om: "Ea",
                    tekst: "Hvor stor er aktiveringsenergien (Eₐ) for NO + CO₂ → NO₂ + CO?",
                    svar: [
                        { t: "134 kJ/mol", fejl: "134 kJ/mol er energien ved toppen. Eₐ måles fra reaktanterne, der nu ligger ved −226 kJ/mol." },
                        { t: "360 kJ/mol", rigtig: true },
                        { t: "226 kJ/mol", fejl: "226 kJ/mol er forskellen mellem reaktanter og produkter. Eₐ er højden op til toppen." }
                    ],
                    hints: ["Mål fra reaktanterne NO og CO₂ op til toppen.", "Eₐ = 134 kJ/mol − (−226 kJ/mol)."],
                    godt: "Eₐ = 134 kJ/mol − (−226 kJ/mol) = 360 kJ/mol."
                },
                {
                    om: "niveauer",
                    tekst: "Er reaktionen NO + CO₂ → NO₂ + CO exoterm eller endoterm?",
                    svar: [
                        { t: "Exoterm", fejl: "Produkterne NO₂ og CO ligger 226 kJ/mol højere end reaktanterne. Reaktionen optager energi." },
                        { t: "Endoterm", rigtig: true }
                    ],
                    hints: ["Ligger produkterne højere eller lavere end reaktanterne?", "Optager reaktionen energi, er den endoterm."],
                    godt: "ΔH = +226 kJ/mol. Energien optages fra omgivelserne, så de bliver koldere."
                },
                {
                    om: "begge",
                    tekst: "Begge reaktioner går over den samme bakke. Hvilken reaktion går hurtigst ved samme temperatur?",
                    lange: true,
                    svar: [
                        { t: "NO₂ + CO → NO + CO₂", rigtig: true },
                        { t: "De går lige hurtigt", fejl: "Bakken er den samme, men set fra NO og CO₂ er den 360 kJ/mol høj og fra NO₂ og CO kun 134 kJ/mol." },
                        { t: "NO + CO₂ → NO₂ + CO", fejl: "NO + CO₂ → NO₂ + CO har den største aktiveringsenergi, 360 kJ/mol. Få sammenstød har energi nok." }
                    ],
                    hints: ["Sammenlign de to aktiveringsenergier, 134 kJ/mol og 360 kJ/mol.", "Jo lavere bakken er, jo flere sammenstød har energi nok."],
                    godt: "NO₂ + CO → NO + CO₂ har den laveste aktiveringsenergi. Flere sammenstød har energi nok, så reaktionen går hurtigst."
                }
            ]
        }
    ];

    /* Teksterne med tal regnes af modellen, så de passer med luppen */
    var u20 = D.udAf(20), u30 = D.udAf(30), u10 = D.udAf(10);

    D.OPGAVER_TEMP = [
        {
            navn: "Molekylernes energi",
            under: "ved 20 °C",
            trin: [
                {
                    om: "kurve",
                    tekst: "Kurven viser bevægelsesenergien hos molekylerne i glasset ved 20 °C. Har alle molekylerne den samme bevægelsesenergi?",
                    lange: true,
                    svar: [
                        { t: "Ja, alle har samme energi", fejl: "Så ville kurven være én smal streg. Kurven er bred, så energien er forskellig." },
                        { t: "Nej, energien er forskellig", rigtig: true },
                        { t: "Nej, de fleste står stille", fejl: "Kurven er lav ved 0 kJ/mol. Kun ganske få molekyler har næsten ingen energi." }
                    ],
                    hints: ["Kurven er høj, hvor mange molekyler har den energi.", "Er kurven en smal streg eller en bred bakke?"],
                    godt: "Nogle molekyler er langsomme, de fleste har en energi tæt på toppen af kurven, og få er meget hurtige."
                },
                {
                    om: "ea",
                    tekst: "Den stiplede streg er aktiveringsenergien (Eₐ) for thiosulfat og syre. Hvor mange molekyler har mere energi end Eₐ ved 20 °C?",
                    svar: [
                        { t: "Ingen", fejl: "Kurven ser ud til at ramme bunden, men den når aldrig helt ned. Reaktionen går jo, også ved 20 °C." },
                        { t: "Ganske få", rigtig: true },
                        { t: "Omtrent halvdelen", fejl: "Halvdelen af molekylerne har mindre energi end toppen af kurven. Stregen står langt til højre for toppen." }
                    ],
                    hints: ["Stregen står langt til højre for toppen af kurven.", "Reaktionen går ved 20 °C, men langsomt."],
                    godt: "Luppen forstørrer kurven ved stregen. Ved 20 °C har " + u20 + " molekyler energi nok."
                }
            ]
        },
        {
            navn: "Varmere",
            under: "fra 20 °C til 30 °C",
            trin: [
                {
                    handling: true,
                    maalT: 30,
                    tekst: "Varm glasset op. Klik på + ved vandbadet, til glasset er 30 °C.",
                    hints: ["Knappen + står ved vandbadet til venstre.", "Hvert klik varmer 5 °C."]
                },
                {
                    om: "lup",
                    tekst: "Ved 30 °C har " + u30 + " molekyler energi nok. Hvor mange gange flere er det end ved 20 °C?",
                    svar: [
                        { t: "1,02 gange", fejl: "Molekylernes fart stiger kun 2 %. Men " + u30 + " er langt flere end " + u20 + "." },
                        { t: "2 gange", rigtig: true },
                        { t: "10 gange", fejl: "Temperaturen stiger 10 °C, men ikke andelen 10 gange. Sammenlign 155 millioner med 80 millioner." }
                    ],
                    hints: ["Sammenlign tallene under luppen ved 20 °C og ved 30 °C.", "155 millioner : 80 millioner."],
                    godt: "155 millioner : 80 millioner ≈ 2. Arealet over stregen er omtrent dobbelt så stort."
                },
                {
                    om: "top",
                    tekst: "Reaktionen går omtrent dobbelt så hurtigt ved 30 °C som ved 20 °C. Hvorfor?",
                    lange: true,
                    svar: [
                        { t: "Molekylerne er dobbelt så hurtige", fejl: "Toppen af kurven flyttede sig næsten ikke. Molekylernes fart stiger kun 2 %." },
                        { t: "Dobbelt så mange har energi nok", rigtig: true },
                        { t: "Aktiveringsenergien er mindre", fejl: "Stregen står samme sted ved 30 °C. Eₐ er den samme." }
                    ],
                    hints: ["Står stregen for Eₐ samme sted ved 30 °C?", "Se på luppen. Hvad blev dobbelt så stort?"],
                    godt: "Kurven flytter sig kun lidt, men dobbelt så mange sammenstød har energi nok til at komme over bakken."
                }
            ]
        },
        {
            navn: "Koldere",
            under: "fra 20 °C til 10 °C",
            trin: [
                {
                    handling: true,
                    maalT: 10,
                    tekst: "Køl glasset ned. Klik på − ved vandbadet, til glasset er 10 °C.",
                    hints: ["Knappen − står ved vandbadet til venstre.", "Hvert klik køler 5 °C."]
                },
                {
                    om: "lup",
                    tekst: "Hvor mange molekyler har energi nok ved 10 °C i forhold til ved 20 °C?",
                    lange: true,
                    svar: [
                        { t: "Lige så mange", fejl: "Arealet i luppen er mindre ved 10 °C. Der er " + u10 + " mod " + u20 + "." },
                        { t: "Omtrent halvt så mange", rigtig: true },
                        { t: "Ingen", fejl: "Luppen viser stadig et lille areal over stregen. Reaktionen går langsommere, men den stopper ikke." }
                    ],
                    hints: ["Sammenlign tallene under luppen.", "Ved 10 °C er det " + u10 + "."],
                    godt: "Ved 10 °C har " + u10 + " molekyler energi nok, omtrent halvt så mange. Derfor holder mad sig længere i køleskabet."
                }
            ]
        }
    ];
}());

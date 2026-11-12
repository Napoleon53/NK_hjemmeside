/* =====================================================================
   data.js - glassene, opgaverne og teksterne

   Et maal (opgave) har sine dele i raekkefoelge: gaet > forsoeg > spm >
   spm2 (se js/fane.js). Hver del har tekst, hint og evt. om: det, delen
   handler om, som faar en rolig gul ring i scenen (glassets plads i
   listen, "lup", "tavle" eller "pipette").

   Antallet af draaber regnes af modellen (NK.Fedt.endepunkt): farven
   bliver ved efter draabe nummer (antal dobbeltbindinger i luppen + 1).
   Teksterne bruger de tal, saa de altid passer med det, eleven ser.

   Graenser, som selvtesten taeller: gaettets tekst hoejst 60 tegn, et
   spoergsmaal 105, et svar 34, et forsoeg 95, et hint 100, forklaringen
   til et forkert svar 110 og til det rigtige 160.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var F = NK.Fedt;
    var D = {};

    function ep(fedt) { return F.endepunkt(fedt); }
    function aff(fedt) { return F.endepunkt(fedt) - 1; }
    D.draaberTekst = function (n) { return n === 1 ? "1 dråbe" : n + " dråber"; };

    /* ----- Fane 1: de fem glas fra oevelse 4.6b -------------------------------------- */
    D.D_GLAS = [
        { nr: "1", fedt: "kokos" },
        { nr: "2", fedt: "oliven" },
        { nr: "3", fedt: "raps" },
        { nr: "4", fedt: "solsikke" },
        { nr: "5", fedt: "heptan" }
    ];

    var drypHint = function (nr) {
        return [
            "Klik på pipetten over glas " + nr + ". Se på det øverste lag, når glasset har rystet sig.",
            "Forsvinder farven, så dryp en dråbe mere. Bliver det øverste lag svagt orange, så stop.",
            "Er det øverste lag i glas " + nr + " svagt orange efter den sidste dråbe, så tryk Indsend svar."
        ];
    };

    D.D_MAAL = [
        {
            id: "oliven", navn: "Glas 2: olivenolie", glas: 1,
            gaet: {
                intro: "Glas 2 har olivenolie opløst i heptan. Der dryppes én dråbe bromvand i, og glasset rystes.",
                tekst: "Hvad sker der med den orange farve?",
                svar: [
                    { t: "Farven forsvinder", ok: true },
                    { t: "Det øverste lag bliver orange" },
                    { t: "Farven bliver i vandet nederst" }
                ]
            },
            forsoeg: {
                om: [1, "pipette"],
                tekst: "Dryp bromvand i glas 2, til farven i det øverste lag bliver. Indsend så antallet af dråber.",
                set: "Farven blev ved efter dråbe " + ep("oliven") + ". Dibrom fra de første " + aff("oliven") + " dråber blev brugt.",
                hint: drypHint("2")
            },
            spm: {
                om: ["lup"],
                tekst: "Luppen viser det øverste lag i glas 2. Hvorfor blev farven ved efter dråbe " + ep("oliven") + "?",
                svar: [
                    { t: "Alle dobbeltbindinger var brugt", ok: true },
                    { t: "Heptanen kunne ikke tage mere",
                      f: "Heptan kan opløse meget mere dibrom. Se i luppen: hvor sidder bromatomerne fra de første dråber?" },
                    { t: "Dibrom reagerede med heptan",
                      f: "Så ville farven også forsvinde i et glas med kun heptan. I luppen sidder bromatomerne på fedtsyrerne." }
                ],
                hint: [
                    "Se i luppen, hvor bromatomerne sidder, og om der er dobbeltbindinger tilbage.",
                    "Hvert dibrommolekyle adderer til én dobbeltbinding. Hvad sker der, når der ikke er flere?",
                    "Alle dobbeltbindingerne i olivenolien var brugt, så dibrom fra den sidste dråbe blev frit."
                ]
            },
            loest: "Hvert dibrommolekyle adderede til én dobbeltbinding. Da alle " + aff("oliven") + " dobbeltbindinger i luppen var brugt, blev dibrom fra dråbe " + ep("oliven") + " frit og gav farve."
        },
        {
            id: "kokos", navn: "Glas 1: kokosfedt", glas: 0,
            gaet: {
                intro: "Glas 1 har kokosfedt opløst i heptan. Kokosfedt har næsten kun mættede fedtsyrer.",
                tekst: "Hvor mange dråber affarver kokosfedt?",
                svar: [
                    { t: "Flere end olivenolie" },
                    { t: "Færre end olivenolie", ok: true },
                    { t: "Lige så mange som olivenolie" }
                ]
            },
            forsoeg: {
                om: [0, "pipette"],
                tekst: "Dryp bromvand i glas 1, til farven i det øverste lag bliver. Indsend så antallet af dråber.",
                set: "Farven blev ved allerede efter dråbe " + ep("kokos") + ". Kokosfedtet i glas 1 affarvede ingen dråber.",
                hint: drypHint("1")
            },
            spm: {
                om: ["lup"],
                tekst: "Hvorfor kunne kokosfedtet i glas 1 ikke affarve bromvandet?",
                svar: [
                    { t: "Kokosfedt er et fast fedtstof",
                      f: "Kokosfedtet er opløst i heptanen i glas 1. Det, der tæller, er dobbeltbindingerne i fedtsyrerne." },
                    { t: "Fedtsyrerne er mættede", ok: true },
                    { t: "Fedtsyrerne er for korte",
                      f: "Kæderne i kokosfedt er korte, men dibrom adderer kun til dobbeltbindinger, og luppen viser ingen." }
                ],
                hint: [
                    "Se på kæderne i luppen. Er der to streger mellem to carbonatomer nogen steder?",
                    "Kæderne i kokosfedtet er lige zigzag-kæder uden knæk og uden dobbeltbindinger.",
                    "Fedtsyrerne i kokosfedtet er mættede. Der er ingen dobbeltbindinger, dibrom kan addere til."
                ]
            },
            loest: "En mættet fedtsyre har kun enkeltbindinger, og dibrom kan ikke addere til en enkeltbinding. Derfor blev farven fra den første dråbe i glas 1."
        },
        {
            id: "solsikke", navn: "Glas 4: solsikkeolie", glas: 3,
            gaet: {
                intro: "Glas 4 har solsikkeolie. 70 % af fedtsyrerne i solsikkeolie er polyumættede.",
                tekst: "Hvor mange dråber affarver solsikkeolie?",
                svar: [
                    { t: "Flere end olivenolie", ok: true },
                    { t: "Færre end olivenolie" },
                    { t: "Lige så mange som olivenolie" }
                ]
            },
            forsoeg: {
                om: [3, "pipette"],
                tekst: "Dryp bromvand i glas 4, til farven i det øverste lag bliver. Indsend så antallet af dråber.",
                set: "Farven blev ved efter dråbe " + ep("solsikke") + ". Solsikkeolien i glas 4 affarvede " + aff("solsikke") + " dråber.",
                hint: drypHint("4")
            },
            spm: {
                om: ["lup"],
                tekst: "Solsikkeolien affarvede " + aff("solsikke") + " dråber, olivenolien " + aff("oliven") + ". Hvorfor affarver solsikkeolien flere?",
                svar: [
                    { t: "Flere dobbeltbindinger", ok: true },
                    { t: "Længere fedtsyrer",
                      f: "Fedtsyrerne i begge olier har 16 eller 18 carbonatomer. Tæl i stedet dobbeltbindingerne i luppen." },
                    { t: "Olien er mere flydende",
                      f: "Dibrom adderer kun til dobbeltbindinger. At olien er flydende, giver ikke dibrom flere steder at addere." }
                ],
                hint: [
                    "Tæl bromatomerne i luppen. Der sidder to for hver dobbeltbinding, dibrom har adderet til.",
                    "En polyumættet fedtsyre har to eller flere dobbeltbindinger.",
                    "Solsikkeolien har flere dobbeltbindinger, fordi de fleste af dens fedtsyrer er polyumættede."
                ]
            },
            loest: "En polyumættet fedtsyre har to eller flere dobbeltbindinger. Solsikkeolie er mest polyumættet og kan derfor addere mere dibrom end olivenolie."
        },
        {
            id: "raps", navn: "Glas 3: rapsolie", glas: 2,
            gaet: {
                intro: "Glas 3 har rapsolie: 63 % monoumættede og 30 % polyumættede fedtsyrer.",
                tekst: "Hvor mange dråber affarver rapsolie?",
                svar: [
                    { t: "Færre end olivenolie" },
                    { t: "Mellem olivenolie og solsikkeolie", ok: true },
                    { t: "Flere end solsikkeolie" }
                ]
            },
            forsoeg: {
                om: [2, "pipette"],
                tekst: "Dryp bromvand i glas 3, til farven i det øverste lag bliver. Indsend så antallet af dråber.",
                set: "Farven blev ved efter dråbe " + ep("raps") + ". Rapsolien i glas 3 affarvede " + aff("raps") + " dråber.",
                hint: drypHint("3")
            },
            spm: {
                om: [0, 1, 2, 3],
                tekst: "Hvilken rækkefølge passer? Begynd med det fedtstof, der affarvede flest dråber.",
                svar: [
                    { t: "Solsikke, raps, oliven, kokos", ok: true },
                    { t: "Kokos, oliven, raps, solsikke",
                      f: "Rækkefølgen er vendt om. Kokosfedtet i glas 1 affarvede færrest dråber, ikke flest." },
                    { t: "Raps, solsikke, oliven, kokos",
                      f: "Se skemaet i panelet: solsikkeolien i glas 4 affarvede flere dråber end rapsolien i glas 3." }
                ],
                hint: [
                    "Se skemaet i panelet. Hvilket glas brugte flest dråber, før farven blev?",
                    "Flest dråber betyder flest dobbeltbindinger. Kokosfedt har færrest.",
                    "Solsikkeolie, rapsolie, olivenolie og til sidst kokosfedt."
                ]
            },
            loest: "Jo flere dobbeltbindinger et fedtstof har, jo mere bromvand kan det affarve. Rækkefølgen passer med tabellen over fedtstofferne i Kemibogens afsnit 4.6."
        },
        {
            id: "heptan", navn: "Glas 5: kun heptan", glas: 4,
            forsoeg: {
                om: [4, "pipette"],
                tekst: "Glas 5 har kun heptan. Dryp bromvand i glas 5, til farven bliver, og indsend antallet.",
                set: "Farven blev ved allerede efter dråbe " + ep("heptan") + ". Heptan affarver ikke bromvand i mørke.",
                hint: drypHint("5")
            },
            spm: {
                om: [1, 4],
                tekst: "Glas 5 brugte " + D.draaberTekst(ep("heptan")) + " og glas 2 med olivenolie " + ep("oliven") + ". Hvor mange dobbeltbindinger var der i luppen i glas 2?",
                svar: [
                    { t: aff("oliven") + " dobbeltbindinger", ok: true },
                    { t: ep("oliven") + " dobbeltbindinger",
                      f: "Dråbe " + ep("oliven") + " i glas 2 blev ikke affarvet, ligesom dråben i glas 5. Træk dråben fra glas 5 fra." },
                    { t: (ep("oliven") + 1) + " dobbeltbindinger",
                      f: "Hvert dibrommolekyle adderer til én dobbeltbinding. Træk dråben i glas 5 fra antallet i glas 2." }
                ],
                hint: [
                    "Den sidste dråbe blev orange i begge glas. Dråben er ikke brugt til en dobbeltbinding.",
                    "Træk antallet af dråber i glas 5 fra antallet i glas 2.",
                    ep("oliven") + " − " + ep("heptan") + " = " + aff("oliven") + ". Hver af de " + aff("oliven") + " dråber adderede til én dobbeltbinding."
                ]
            },
            loest: "Den sidste dråbe bliver orange i alle glas, også uden fedtstof. Derfor trækker man glas 5 fra: " + ep("oliven") + " − " + ep("heptan") + " = " + aff("oliven") + ", én dråbe for hver dobbeltbinding i glas 2."
        }
    ];

    /* ----- Fane 2: ét fedtstofmolekyle paa tavlen -------------------------------------- */
    var findHint = function (fedt) {
        return [
            "En dobbeltbinding er to streger ved siden af hinanden. Den sidder ved et knæk på kæden.",
            "C=O ved esterbindingen tæller ikke. Dibrom adderer kun til dobbeltbindinger mellem to carbonatomer.",
            fedt
        ];
    };

    D.M_MAAL = [
        {
            id: "oliven", navn: "Fra olivenolie", mol: ["O", "O", "O"], kilde: "olivenolie",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra olivenolie, og tryk Indsend svar.",
                set: "Tre dobbeltbindinger, og tre dibrommolekyler adderede: ét til hver dobbeltbinding.",
                hint: findHint("Hver af de tre kæder har én dobbeltbinding midt på kæden, der hvor kæden knækker.")
            },
            spm: {
                om: ["tavle"],
                tekst: "Hver fedtsyre i fedtstoffet fra olivenolie har én dobbeltbinding. Hvad kaldes sådan en fedtsyre?",
                svar: [
                    { t: "Mættet",
                      f: "En mættet fedtsyre har ingen dobbeltbindinger. Hver kæde i fedtstoffet fra olivenolie har én." },
                    { t: "Monoumættet", ok: true },
                    { t: "Polyumættet",
                      f: "Poly betyder mange. En polyumættet fedtsyre har to eller flere dobbeltbindinger." }
                ],
                hint: [
                    "Mono betyder én, og poly betyder mange.",
                    "Fedtsyren har netop én dobbeltbinding.",
                    "En fedtsyre med én dobbeltbinding er monoumættet."
                ]
            },
            loest: "Oliesyre er monoumættet: mono betyder én. Olivenolie har mest oliesyre, og 75 % af fedtsyrerne i olivenolie er monoumættede."
        },
        {
            id: "solsikke", navn: "Fra solsikkeolie", mol: ["O", "L", "L"], kilde: "solsikkeolie",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra solsikkeolie, og tryk Indsend svar.",
                set: "Fem dobbeltbindinger, og fem dibrommolekyler adderede: ét til hver dobbeltbinding.",
                hint: findHint("Den øverste kæde har én dobbeltbinding, og de to nederste har to hver.")
            },
            spm: {
                om: ["tavle"],
                tekst: "To af fedtsyrerne har to dobbeltbindinger hver. Hvad kaldes en fedtsyre med to eller flere?",
                svar: [
                    { t: "Mættet",
                      f: "En mættet fedtsyre har ingen dobbeltbindinger. Linolsyre har to." },
                    { t: "Monoumættet",
                      f: "Mono betyder én. En monoumættet fedtsyre har kun én dobbeltbinding." },
                    { t: "Polyumættet", ok: true }
                ],
                hint: [
                    "Mono betyder én, og poly betyder mange.",
                    "Fedtsyren har mere end én dobbeltbinding.",
                    "En fedtsyre med to eller flere dobbeltbindinger er polyumættet."
                ]
            },
            loest: "Linolsyre er polyumættet: poly betyder mange. Fedtstoffet fra solsikkeolie adderede fem dibrommolekyler, flere end fedtstoffet fra olivenolie med tre."
        },
        {
            id: "kokos", navn: "Fra kokosfedt", mol: ["La", "M", "P"], kilde: "kokosfedt",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra kokosfedt, og tryk Indsend svar.",
                set: "Ingen dobbeltbindinger mellem to carbonatomer, så dibrom har intet at addere til.",
                hint: [
                    "Se efter to streger ved siden af hinanden i kæderne. Er der nogen?",
                    "Kæderne i fedtstoffet fra kokosfedt er lige zigzag-kæder uden knæk.",
                    "Der er ingen dobbeltbindinger mellem to carbonatomer. Tryk Indsend svar uden at markere noget."
                ]
            },
            spm: {
                om: ["tavle"],
                tekst: "Hvad sker der, når fedtstoffet fra kokosfedt rystes med bromvand?",
                svar: [
                    { t: "Farven forsvinder",
                      f: "Farven forsvinder kun, når dibrom adderer. Fedtstoffet fra kokosfedt har ingen dobbeltbindinger." },
                    { t: "Den orange farve bliver", ok: true },
                    { t: "Dibrom adderer til C=O",
                      f: "C=O i esterbindingen er mellem carbon og oxygen. Dibrom adderer kun til dobbeltbindinger mellem to C." }
                ],
                hint: [
                    "Farven forsvinder kun, når dibrom bliver brugt.",
                    "Dibrom bliver kun brugt, når det kan addere til en dobbeltbinding mellem to carbonatomer.",
                    "Der er ingen dobbeltbindinger, så dibrom bliver frit, og den orange farve bliver."
                ]
            },
            loest: "Uden dobbeltbindinger kan dibrom ikke addere, så farven bliver. Fedtsyrerne i kokosfedt er også korte: laurinsyre har kun 12 carbonatomer."
        },
        {
            id: "tran", navn: "Fra tran", mol: ["P", "O", "DHA"], kilde: "tran",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra tran, og tryk Indsend svar.",
                set: "Syv dobbeltbindinger, og syv dibrommolekyler adderede: ét til hver dobbeltbinding.",
                hint: findHint("Den øverste kæde har ingen, den midterste har én, og den krumme nederste kæde har seks.")
            },
            spm: {
                om: ["tavle"],
                tekst: "Tranens fedtstof adderede 7 dibrommolekyler, olivenoliens 3. Hvorfor?",
                svar: [
                    { t: "Tran har flere fedtsyrer",
                      f: "Alle fedtstoffer har tre fedtsyrer på glycerol. Tæl dobbeltbindingerne i hver kæde." },
                    { t: "Tran har længere fedtsyrer",
                      f: "Kædens længde betyder ikke noget for dibrom. Dibrom adderer kun til dobbeltbindingerne." },
                    { t: "Tran har flere dobbeltbindinger", ok: true }
                ],
                hint: [
                    "Tæl dobbeltbindingerne i de tre kæder.",
                    "Den nederste kæde i fedtstoffet fra tran har seks dobbeltbindinger alene.",
                    "Fedtstoffet fra tran har flere dobbeltbindinger, så det kan addere mere dibrom."
                ]
            },
            loest: "DHA har seks dobbeltbindinger og er en omega-3-fedtsyre, som kroppen får fra fed fisk."
        }
    ];

    /* ----- Fane 3: fire flasker med et ukendt fedtstof -------------------------------------- */
    D.U_GLAS = [
        { nr: "A", fedt: "smoer" },
        { nr: "B", fedt: "tran" },
        { nr: "C", fedt: "kokos" },
        { nr: "D", fedt: "raps" }
    ];

    /* Varedeklarationerne i panelet: fedtstofferne, flaskerne kan indeholde */
    D.KANDIDATER = ["kokos", "smoer", "raps", "tran"];
    D.TRAN_NOTE = "I tran har de fleste polyumættede fedtsyrer fem eller seks dobbeltbindinger.";

    var findFedtHint = function (svar) {
        return [
            "Brug varedeklarationerne i panelet. Mange mættede fedtsyrer giver få dråber.",
            "Mange dobbeltbindinger giver mange dråber. Læs også linjen om tran under varedeklarationerne.",
            svar
        ];
    };

    function ukendtForsoeg(i) {
        var g = D.U_GLAS[i];
        return {
            om: [i, "pipette"],
            tekst: "Flaske " + g.nr + " har et ukendt fedtstof i heptan. Dryp bromvand i, til farven bliver, og indsend.",
            set: "Farven blev ved efter dråbe " + ep(g.fedt) + ". Fedtstoffet i flaske " + g.nr + " affarvede " + D.draaberTekst(aff(g.fedt)) + ".",
            hint: drypHint(g.nr).map(function (h) { return h.replace("glas " + g.nr, "flaske " + g.nr); })
        };
    }

    D.U_MAAL = [
        {
            id: "a", navn: "Flaske A", glas: 0,
            forsoeg: ukendtForsoeg(0),
            spm: {
                om: [0],
                tekst: "Fedtstoffet i flaske A affarvede " + D.draaberTekst(aff("smoer")) + ". Hvilket fedtstof er det?",
                svar: [
                    { t: "Kokosfedt",
                      f: "Kokosfedt er 91 % mættet og affarver næsten intet. Fedtstoffet i flaske A affarvede lidt." },
                    { t: "Smør", ok: true },
                    { t: "Rapsolie",
                      f: "Rapsolie er mest umættet og affarver mange dråber. Fedtstoffet i flaske A affarvede kun få." }
                ],
                hint: findFedtHint("Smør har mest mættede fedtsyrer, men 30 % er monoumættede. Smør affarver lidt.")
            },
            loest: "Flaske A er smør. Smør har 66 % mættede fedtsyrer, men 30 % er monoumættede, så smør affarver lidt bromvand."
        },
        {
            id: "b", navn: "Flaske B", glas: 1,
            forsoeg: ukendtForsoeg(1),
            spm: {
                om: [1],
                tekst: "Fedtstoffet i flaske B affarvede " + D.draaberTekst(aff("tran")) + ". Hvilket fedtstof er det?",
                svar: [
                    { t: "Smør",
                      f: "Smør er mest mættet og affarver kun få dråber. Fedtstoffet i flaske B affarvede mange." },
                    { t: "Rapsolie",
                      f: "Rapsolie har flere polyumættede end tran, men med kun to eller tre dobbeltbindinger hver." },
                    { t: "Tran", ok: true }
                ],
                hint: findFedtHint("Tran har fedtsyrer med fem eller seks dobbeltbindinger. Tran affarver mest.")
            },
            loest: "Flaske B er tran. Tran har færre polyumættede fedtsyrer end rapsolie, men de har fem eller seks dobbeltbindinger hver. Derfor affarver tran mest."
        },
        {
            id: "c", navn: "Flaske C", glas: 2,
            forsoeg: ukendtForsoeg(2),
            spm: {
                om: [2],
                tekst: "Fedtstoffet i flaske C affarvede ingen dråber. Hvilket fedtstof er det?",
                svar: [
                    { t: "Kokosfedt", ok: true },
                    { t: "Smør",
                      f: "Smør har 30 % monoumættede fedtsyrer og affarver lidt. Fedtstoffet i flaske C affarvede intet." },
                    { t: "Tran",
                      f: "Tran er det mest umættede af de fire. Fedtstoffet i flaske C affarvede ingen dråber." }
                ],
                hint: findFedtHint("Kokosfedt har 91 % mættede fedtsyrer og næsten ingen dobbeltbindinger.")
            },
            loest: "Flaske C er kokosfedt. Næsten alle fedtsyrerne i kokosfedt er mættede, så allerede den første dråbe bliver orange."
        },
        {
            id: "d", navn: "Flaske D", glas: 3,
            forsoeg: ukendtForsoeg(3),
            spm: {
                om: [3],
                tekst: "Fedtstoffet i flaske D affarvede " + D.draaberTekst(aff("raps")) + ". Hvilket fedtstof er det?",
                svar: [
                    { t: "Rapsolie", ok: true },
                    { t: "Tran",
                      f: "Tran affarver endnu flere dråber, fordi fedtsyrerne har fem eller seks dobbeltbindinger." },
                    { t: "Kokosfedt",
                      f: "Kokosfedt er 91 % mættet og affarver næsten intet. Fedtstoffet i flaske D affarvede mange." }
                ],
                hint: findFedtHint("Rapsolie er mest umættet, men tran har endnu flere dobbeltbindinger.")
            },
            loest: "Flaske D er rapsolie. Rapsolie affarver meget mere bromvand end smør og kokosfedt, men mindre end tran."
        }
    ];

    /* ----- Fejl i et forsoeg ---------------------------------------------------------------------- */
    D.forTidligt = function (hvad, n) {
        return "Dråbe " + n + " i " + hvad + " blev affarvet. Dryp en dråbe mere, og se, om farven bliver.";
    };
    D.forMange = function (hvad, n) {
        return "Farven blev allerede ved efter dråbe " + n + " i " + hvad + ", så " + D.draaberTekst(n) + " er tallet i skemaet.";
    };
    D.ingenDraaber = function (hvad) { return "Dryp først bromvand i " + hvad + " med pipetten."; };
    D.venter = "Vent, til glasset er færdigt med at ryste.";

    D.andetGlas = function (hvad, opgHvad) {
        return "Opgaven handler om " + opgHvad + ". Pipetten drypper kun i " + opgHvad + ", ikke i " + hvad + ".";
    };

    /* ----- Klik i luppen ------------------------------------------------------------------------- */
    D.lupBrom = "Et frit dibrommolekyle, Br₂. Det fandt ingen ledig dobbeltbinding og giver laget den orange farve.";
    D.lupKaede = function (syre, medBrom) {
        var t = syre.Navn + ": " + syre.slags + ", " + F.dbTekst(syre.db) + ".";
        if (medBrom) t += " Bromatomerne sidder, hvor dibrom har adderet.";
        return t;
    };

    /* ----- Fane 2: fejl ved Indsend svar ------------------------------------------------------------ */
    D.mFejl = {
        co: "C=O ved esterbindingen er mellem C og O. Dibrom adderer kun til dobbeltbindinger mellem to carbonatomer.",
        enkelt: "Mindst én af de gule bindinger er en enkeltbinding med kun én streg. Klik på den igen for at fjerne den.",
        mangler: function (n) {
            return n === 0 ? "Der er dobbeltbindinger i kæderne. Se efter to streger ved siden af hinanden."
                : "Der er flere dobbeltbindinger end de " + n + ", du har markeret. Se efter to streger i kæderne.";
        }
    };

    D.FAERDIG = {
        d: "Alle fem glas er talt. På fane 2 ser du ét fedtstofmolekyle helt tæt på.",
        m: "Alle fire fedtstoffer er talt. På fane 3 finder du fedtstoffet i fire ukendte flasker.",
        u: "Alle fire flasker er fundet."
    };

    NK.Data = D;
}());

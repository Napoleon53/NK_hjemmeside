/* =====================================================================
   data.js - glassene, opgaverne og teksterne

   Et maal (opgave) har sine dele i raekkefoelge: forsoeg > spm (se
   js/fane.js; der er ingen gaet i denne animation). Hver del har tekst, hint og evt. om: det, delen
   handler om, som faar en rolig gul ring i scenen (glassets plads i
   listen, "lup", "tavle" eller "pipette").

   Antallet af draaber regnes af modellen (NK.Fedt.endepunkt): farven
   bliver ved efter draabe nummer (antal dobbeltbindinger i luppen + 1).
   Teksterne bruger de tal, saa de altid passer med det, eleven ser.

   Graenser, som selvtesten taeller: et spoergsmaal 105, et svar 34, et forsoeg 95, et hint 100, forklaringen
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

    /* ----- Fane 2: de fem glas fra oevelse 4.6b -------------------------------------- */
    D.D_GLAS = [
        { nr: "1", fedt: "oliven" },
        { nr: "2", fedt: "raps" },
        { nr: "3", fedt: "kokos" },
        { nr: "4", fedt: "solsikke" },
        { nr: "5", fedt: "heptan" }
    ];

    function drypTekst(nr) {
        return "Dryp bromvand i glas " + nr + ", til det øverste lag stadig er orange. Indsend antallet af dråber.";
    }

    var drypHint = function (nr) {
        return [
            "Klik på pipetten over glas " + nr + ". Se på det øverste lag, når glasset har rystet sig.",
            "Forsvinder farven, så dryp en dråbe mere. Bliver det øverste lag svagt orange, så stop.",
            "Er det øverste lag i glas " + nr + " svagt orange efter den sidste dråbe, så tryk Indsend svar."
        ];
    };

    /* Glassene tages i raekkefoelge, som i oevelse 4.6b (brugeren 12. nov.
       2026: "underligt at glassene ikke gaar fra 1-5 i raekkefoelge"). Der er
       intet gaet foer forsoeget, men ét fagligt spoergsmaal efter hvert glas,
       som efterbehandlingen i oevelsen (brugeren samme dag: "ikke en gaette
       konkurrence ... hellere noget der hjaelper med fagligheden"). Kokosfedt
       er glas 3, saa eleven ser additionen foer et maettet fedtstof
       (brugeren samme dag: "saa man ikke starter med et maettet fedt"). */
    D.D_MAAL = [
        {
            id: "oliven", navn: "Glas 1: olivenolie", glas: 0,
            forsoeg: {
                om: [0, "pipette"],
                tekst: drypTekst("1"),
                set: "Farven blev ved efter dråbe " + ep("oliven") + ". Olivenolien i glas 1 affarvede " + D.draaberTekst(aff("oliven")) + ".",
                hint: drypHint("1")
            },
            spm: {
                om: ["lup"],
                tekst: "Hvad skete der med dibrom fra de første " + aff("oliven") + " dråber i glas 1?",
                svar: [
                    { t: "Addition til dobbeltbindingerne", ok: true },
                    { t: "Substitution med enkeltbindinger",
                      f: "Ved en substitution bliver et H skiftet ud med Br. I luppen sidder Br, hvor der var to streger." },
                    { t: "Dibrom blev i vandet nederst",
                      f: "Vandet i bunden af glas 1 er farveløst. Dibrom blev rystet op i det øverste lag med olien." }
                ],
                hint: [
                    "Se i luppen, hvor bromatomerne sidder.",
                    "Bromatomerne sidder, hvor der før var en dobbeltbinding mellem to carbonatomer.",
                    "Dibrom adderede til dobbeltbindingerne, som hver blev til en enkeltbinding med ét Br på hvert C."
                ]
            },
            loest: "Ved en addition bliver dobbeltbindingen til en enkeltbinding, og der sætter sig et bromatom på hvert carbonatom. Produktet er farveløst."
        },
        {
            id: "raps", navn: "Glas 2: rapsolie", glas: 1,
            forsoeg: {
                om: [1, "pipette"],
                tekst: drypTekst("2"),
                set: "Farven blev ved efter dråbe " + ep("raps") + ". Rapsolien i glas 2 affarvede " + D.draaberTekst(aff("raps")) + ".",
                hint: drypHint("2")
            },
            spm: {
                om: ["lup"],
                tekst: "Hvorfor blev farven i glas 2 ved efter dråbe " + ep("raps") + "?",
                svar: [
                    { t: "Alle dobbeltbindinger var brugt", ok: true },
                    { t: "Heptanen kunne ikke tage mere",
                      f: "Heptan kan opløse meget mere dibrom. Se i luppen. Hvor sidder bromatomerne fra de første dråber?" },
                    { t: "Dibrom reagerede med heptan",
                      f: "Så ville farven også forsvinde i et glas med kun heptan. I luppen sidder bromatomerne på fedtsyrerne." }
                ],
                hint: [
                    "Se i luppen. Er der en dobbeltbinding tilbage, som ikke har fået brom?",
                    "Hvert dibrommolekyle adderer til én dobbeltbinding. Hvad sker der, når der ikke er flere?",
                    "Alle " + aff("raps") + " dobbeltbindinger i rapsolien var brugt, så dibrom fra dråbe " + ep("raps") + " blev frit."
                ]
            },
            loest: "Hvert dibrommolekyle adderer til én dobbeltbinding. Da alle " + aff("raps") + " dobbeltbindinger var brugt, blev dibrom fra dråbe " + ep("raps") + " frit og gav farve."
        },
        {
            id: "kokos", navn: "Glas 3: kokosfedt", glas: 2,
            forsoeg: {
                om: [2, "pipette"],
                tekst: drypTekst("3"),
                set: "Farven blev ved allerede efter dråbe " + ep("kokos") + ". Kokosfedtet i glas 3 affarvede ingen dråber.",
                hint: drypHint("3")
            },
            spm: {
                om: ["lup"],
                tekst: "Kokosfedtet i glas 3 affarvede ingen dråber bromvand. Hvorfor?",
                svar: [
                    { t: "Fedtsyrerne er mættede", ok: true },
                    { t: "Kokosfedt er et fast fedtstof",
                      f: "Kokosfedtet er opløst i heptanen i glas 3. Det, der tæller, er dobbeltbindingerne i fedtsyrerne." },
                    { t: "Fedtsyrerne er for korte",
                      f: "Kæderne i kokosfedt er korte, men dibrom adderer kun til dobbeltbindinger, og luppen viser ingen." }
                ],
                hint: [
                    "Se på kæderne i luppen. Er der to streger mellem to carbonatomer nogen steder?",
                    "Kæderne i kokosfedtet er lige zigzag-kæder uden knæk og uden dobbeltbindinger.",
                    "Fedtsyrerne i kokosfedtet er mættede. Der er ingen dobbeltbindinger, som dibrom kan addere til."
                ]
            },
            loest: "En mættet fedtsyre har kun enkeltbindinger, og dibrom kan ikke addere til en enkeltbinding. Derfor blev farven fra den første dråbe i glas 3."
        },
        {
            id: "solsikke", navn: "Glas 4: solsikkeolie", glas: 3,
            forsoeg: {
                om: [3, "pipette"],
                tekst: drypTekst("4"),
                set: "Farven blev ved efter dråbe " + ep("solsikke") + ". Solsikkeolien i glas 4 affarvede " + D.draaberTekst(aff("solsikke")) + ".",
                hint: drypHint("4")
            },
            spm: {
                om: ["lup"],
                tekst: "Solsikkeolien i glas 4 affarvede flest dråber af de fire fedtstoffer. Hvorfor?",
                svar: [
                    { t: "Flest dobbeltbindinger", ok: true },
                    { t: "De længste fedtsyrer",
                      f: "Fedtsyrerne i de tre olier har alle 18 carbonatomer. Tæl i stedet dobbeltbindingerne i luppen." },
                    { t: "Mest flydende",
                      f: "Dibrom adderer kun til dobbeltbindinger. At olien er flydende, giver ikke dibrom flere steder at addere." }
                ],
                hint: [
                    "Tæl bromatomerne i luppen. Der sidder to for hver dobbeltbinding, som dibrom har adderet til.",
                    "To af fedtsyrerne i solsikkeolien er polyumættede. De har to dobbeltbindinger hver.",
                    "Solsikkeolien har flest dobbeltbindinger, fordi de fleste af dens fedtsyrer er polyumættede."
                ]
            },
            loest: "En polyumættet fedtsyre har to eller flere dobbeltbindinger. Solsikkeolie er mest polyumættet og kan derfor addere mest dibrom."
        },
        {
            id: "heptan", navn: "Glas 5: kun heptan", glas: 4,
            forsoeg: {
                om: [4, "pipette"],
                tekst: "Glas 5 har kun heptan. Dryp bromvand i, til det øverste lag stadig er orange, og indsend.",
                set: "Farven blev ved allerede efter dråbe " + ep("heptan") + ". Heptan affarver ikke bromvand i mørke.",
                hint: drypHint("5")
            },
            spm: {
                om: [0, 4],
                tekst: "Glas 5 brugte " + D.draaberTekst(ep("heptan")) + ", og glas 1 med olivenolie brugte " + ep("oliven") + ". Hvor mange dobbeltbindinger var der i glas 1?",
                svar: [
                    { t: aff("oliven") + " dobbeltbindinger", ok: true },
                    { t: ep("oliven") + " dobbeltbindinger",
                      f: "Dråbe " + ep("oliven") + " i glas 1 blev ikke affarvet, ligesom dråben i glas 5. Træk dråben fra glas 5 fra." },
                    { t: (ep("oliven") + 1) + " dobbeltbindinger",
                      f: "Hvert dibrommolekyle adderer til én dobbeltbinding. Træk dråben i glas 5 fra antallet i glas 1." }
                ],
                hint: [
                    "Den sidste dråbe blev orange i begge glas. Dråben er ikke brugt til en dobbeltbinding.",
                    "Træk antallet af dråber i glas 5 fra antallet i glas 1.",
                    ep("oliven") + " − " + ep("heptan") + " = " + aff("oliven") + ". Hver af de " + aff("oliven") + " dråber adderede til én dobbeltbinding."
                ]
            },
            loest: "Den sidste dråbe bliver orange i alle glas, også uden fedtstof. Derfor trækker man antallet af dråber i glas 5 fra: " + ep("oliven") + " − " + ep("heptan") + " = " + aff("oliven") + " dobbeltbindinger."
        }
    ];

    /* ----- Fane 1: ét fedtstofmolekyle paa tavlen (det samme som i luppen paa fane 2 og 3) --- */
    var findHint = function (fedt) {
        return [
            "En dobbeltbinding er to streger ved siden af hinanden. Den sidder ved et knæk på kæden.",
            "C=O ved esterbindingen tæller ikke. Dibrom adderer kun til dobbeltbindinger mellem to carbonatomer.",
            fedt
        ];
    };

    D.M_MAAL = [
        {
            id: "oliven", navn: "Fra olivenolie", mol: F.FEDT.oliven.mol[0], kilde: "olivenolie",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra olivenolie, og tryk Indsend svar.",
                set: "Molekylet har tre dobbeltbindinger, og tre dibrommolekyler adderede, ét til hver dobbeltbinding.",
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
                    "Hver fedtsyre har netop én dobbeltbinding.",
                    "En fedtsyre med én dobbeltbinding er monoumættet."
                ]
            },
            loest: "Oliesyre er monoumættet, for mono betyder én. Olivenolie har mest oliesyre, og 75 % af fedtsyrerne i olivenolie er monoumættede."
        },
        {
            id: "solsikke", navn: "Fra solsikkeolie", mol: F.FEDT.solsikke.mol[0], kilde: "solsikkeolie",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra solsikkeolie, og tryk Indsend svar.",
                set: "Molekylet har fem dobbeltbindinger, og fem dibrommolekyler adderede, ét til hver dobbeltbinding.",
                hint: findHint("Den øverste kæde har én dobbeltbinding, og de to nederste har to hver.")
            },
            spm: {
                om: ["tavle"],
                tekst: "To af fedtsyrerne har to dobbeltbindinger hver. Hvad kaldes en fedtsyre med mindst to dobbeltbindinger?",
                svar: [
                    { t: "Mættet",
                      f: "En mættet fedtsyre har ingen dobbeltbindinger. Linolsyre har to." },
                    { t: "Monoumættet",
                      f: "Mono betyder én. En monoumættet fedtsyre har kun én dobbeltbinding." },
                    { t: "Polyumættet", ok: true }
                ],
                hint: [
                    "Mono betyder én, og poly betyder mange.",
                    "De to nederste fedtsyrer har mere end én dobbeltbinding hver.",
                    "En fedtsyre med to eller flere dobbeltbindinger er polyumættet."
                ]
            },
            loest: "Linolsyre er polyumættet, for poly betyder mange. Fedtstoffet fra solsikkeolie adderede fem dibrommolekyler, flere end fedtstoffet fra olivenolie med tre."
        },
        {
            id: "kokos", navn: "Fra kokosfedt", mol: F.FEDT.kokos.mol[0], kilde: "kokosfedt",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra kokosfedt, og tryk Indsend svar.",
                set: "Molekylet har ingen dobbeltbindinger mellem to carbonatomer, så dibrom har intet at addere til.",
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
            loest: "Uden dobbeltbindinger kan dibrom ikke addere, så farven bliver. Fedtsyrerne i kokosfedt er også korte, og laurinsyre har for eksempel kun 12 carbonatomer."
        },
        {
            id: "tran", navn: "Fra tran", mol: F.FEDT.tran.mol[0], kilde: "tran",
            forsoeg: {
                om: ["tavle"],
                tekst: "Klik på alle dobbeltbindingerne i fedtstoffet fra tran, og tryk Indsend svar.",
                set: "Molekylet har seks dobbeltbindinger, og seks dibrommolekyler adderede, ét til hver dobbeltbinding.",
                hint: findHint("Den øverste kæde har ingen, den midterste har én, og den krumme nederste kæde har fem.")
            },
            spm: {
                om: ["tavle"],
                tekst: "Fedtstoffet fra tran adderede 6 dibrommolekyler, og fedtstoffet fra olivenolie adderede 3. Hvorfor?",
                svar: [
                    { t: "Tran har flere fedtsyrer",
                      f: "Alle fedtstoffer har tre fedtsyrer på glycerol. Tæl dobbeltbindingerne i hver kæde." },
                    { t: "Tran har længere fedtsyrer",
                      f: "Kædens længde betyder ikke noget for dibrom. Dibrom adderer kun til dobbeltbindingerne." },
                    { t: "Tran har flere dobbeltbindinger", ok: true }
                ],
                hint: [
                    "Tæl dobbeltbindingerne i de tre kæder.",
                    "Den nederste kæde i fedtstoffet fra tran har fem dobbeltbindinger alene.",
                    "Fedtstoffet fra tran har flere dobbeltbindinger, så det kan addere mere dibrom."
                ]
            },
            loest: "Den nederste fedtsyre i fedtstoffet fra tran hedder EPA. EPA har fem dobbeltbindinger og er en omega-3-fedtsyre, som kroppen får fra fed fisk."
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
            loest: "Flaske A indeholder smør. Smør har 66 % mættede fedtsyrer, men 30 % er monoumættede, så smør affarver lidt bromvand."
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
                      f: "Rapsolie har flere polyumættede fedtsyrer end tran, men de har kun to eller tre dobbeltbindinger hver." },
                    { t: "Tran", ok: true }
                ],
                hint: findFedtHint("Tran har fedtsyrer med fem eller seks dobbeltbindinger. Tran affarver mest.")
            },
            loest: "Flaske B indeholder tran. Tran har færre polyumættede fedtsyrer end rapsolie, men de har fem eller seks dobbeltbindinger hver. Derfor affarver tran mest."
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
            loest: "Flaske C indeholder kokosfedt. Næsten alle fedtsyrerne i kokosfedt er mættede, så allerede den første dråbe bliver orange."
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
            loest: "Flaske D indeholder rapsolie. Rapsolie affarver meget mere bromvand end smør og kokosfedt, men mindre end tran."
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

    /* ----- Fane 1: fejl ved Indsend svar ------------------------------------------------------------ */
    D.mFejl = {
        co: "C=O ved esterbindingen er mellem C og O. Dibrom adderer kun til dobbeltbindinger mellem to carbonatomer.",
        enkelt: "Mindst én af de gule bindinger er en enkeltbinding med kun én streg. Klik på den igen for at fjerne den.",
        mangler: function (n) {
            return n === 0 ? "Der er dobbeltbindinger i kæderne. Se efter to streger ved siden af hinanden."
                : "Der er flere dobbeltbindinger end de " + n + ", du har markeret. Se efter to streger i kæderne.";
        }
    };

    D.FAERDIG = {
        m: "Dobbeltbindingerne i alle fire molekyler er talt. På fane 2 drypper du bromvand i glas med de samme fedtstoffer.",
        d: "Dråberne i alle fem glas er talt. På fane 3 finder du fedtstoffet i fire ukendte flasker.",
        u: "Alle fire flasker er fundet."
    };

    NK.Data = D;
}());

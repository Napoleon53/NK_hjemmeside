/* =====================================================================
   data.js - opgaverne og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. En opgave kan have op til
   fire dele, der kommer efter hinanden:

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring).
              intro er en kort indledning, tekst er selve spoergsmaalet
              (hoejst 60 tegn), og figur er en ring, der tegnes paa kortet
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket
              (teksten hoejst 150 tegn)
     spm      et spoergsmaal bagefter (hoejst 118 tegn, svarene hoejst 46);
              de forkerte svar (f) er de fejl, elever laver, og forklaringen
              peger tilbage paa scenen
     spm2     et spoergsmaal til. godt (i spm) er forklaringen til det
              rigtige svar; den staar alene, til eleven selv gaar videre

   set (i forsoeg) er det, eleven lige har set. Det staar alene paa det
   groenne kort, foer spoergsmaalet kommer.

   AL tekst staar paa scenekortet oeverst i scenen (js/fane.js), saa
   teksterne skal kunne vaere dér. Hvert led har sin egen hinttrappe paa
   tre trin.

   INTET ER INDFORSTAAET (brugerens regel 9. okt. 2026): hver tekst skal
   kunne laeses helt alene. Den naevner selv det molekyle, det glas eller
   den kaede, den handler om, og begynder aldrig med "ogsaa", "nu" eller
   "her". om er det i scenen, delen handler om; det faar en rolig gul
   ring (omNu i js/fane.js): "mol" paa fane 1, glassets nummer paa fane 2
   og "kaede" paa fane 3.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = {};

    function traekHint(navn, formel, sted, maal) {
        return [
            navn.charAt(0).toUpperCase() + navn.slice(1) + ", " + formel + ", ligger " + sted + " på hylden nederst i scenen.",
            "Tag fat i " + navn + " med musen, træk det op til " + maal + ", og slip.",
            "Slip " + navn + " et sted på molekylet midt i scenen. Et klik på " + navn + " på hylden virker også."
        ];
    }

    /* ----- Fane 1: Addition ------------------------------------------------------
       opstil: det molekyle, der ligger klar, og evt. det produkt, der er lavet.
       krav: det, forsoeget beder om ("afvist": brom, der ikke kan saette sig paa) */
    D.A_MAAL = [
        {
            id: "brom", navn: "Brom på ethen",
            opstil: { stof: "ethen" },
            gaet: {
                intro: "Molekylet midt i scenen er ethen, C₂H₄. Ethen har en dobbeltbinding mellem de to carbonatomer. Om lidt trækker du et brommolekyle, Br₂, hen til den.",
                tekst: "Hvor mange stoffer bliver der dannet af ethen og brom?",
                svar: [
                    { t: "Ét stof", ok: true },
                    { t: "To stoffer" },
                    { t: "Ingen. Der sker ikke noget" }
                ]
            },
            forsoeg: {
                tekst: "Træk brommolekylet, Br₂, fra hylden hen til dobbeltbindingen i ethen. Dobbeltbindingen er de to streger mellem carbonatomerne.",
                krav: "Br2",
                hint: traekHint("brommolekylet", "Br₂", "til venstre", "de to streger mellem carbonatomerne i ethen")
            },
            loest: "Dobbeltbindingen i ethen åbnede sig, og de to bromatomer satte sig på hver sit carbonatom. Der blev kun dannet ét stof: 1,2-dibromethan. Sådan en reaktion kaldes en addition."
        },
        {
            id: "bindinger", navn: "Fire bindinger",
            opstil: { stof: "ethen", produkt: "Br2" },
            spm: {
                om: ["mol"],
                tekst: "Ethen og brom er blevet til 1,2-dibromethan. Hvad er der sket med dobbeltbindingen mellem de to carbonatomer?",
                svar: [
                    { t: "Dobbeltbindingen er der stadig",
                      f: "Tæl stregerne mellem de to carbonatomer i 1,2-dibromethan." },
                    { t: "Den er blevet til en enkeltbinding", ok: true },
                    { t: "Dobbeltbindingen er forsvundet helt",
                      f: "Der er stadig én streg mellem de to carbonatomer i 1,2-dibromethan. De hænger sammen." }
                ],
                godt: "Den ene af de to bindinger i dobbeltbindingen åbnede sig. Den anden holder stadig de to carbonatomer sammen.",
                hint: [
                    "I ethen var der to streger mellem carbonatomerne.",
                    "Tæl stregerne mellem de to carbonatomer i 1,2-dibromethan midt i scenen.",
                    "Der er én streg tilbage. Dobbeltbindingen er blevet til en enkeltbinding."
                ]
            },
            spm2: {
                om: ["mol"],
                tekst: "Hvor mange bindinger har hvert carbonatom i 1,2-dibromethan?",
                svar: [
                    { t: "3 bindinger", f: "Tæl alle stregerne ud fra ét carbonatom i 1,2-dibromethan: til det andet carbonatom, til brom og til hydrogen." },
                    { t: "5 bindinger", f: "Dobbeltbindingen i ethen talte for to bindinger. I 1,2-dibromethan er der en enkeltbinding og en binding til brom i stedet." },
                    { t: "4 bindinger", ok: true }
                ],
                hint: [
                    "Tæl stregerne ud fra ét af carbonatomerne i 1,2-dibromethan.",
                    "Der går en streg til det andet carbonatom, en til brom og to til hydrogen.",
                    "1 + 1 + 2 = 4."
                ]
            },
            loest: "Et carbonatom har altid fire bindinger. I ethen brugte hvert carbonatom to af dem på dobbeltbindingen. I 1,2-dibromethan bruger det én på det andet carbonatom og én på et bromatom."
        },
        {
            id: "hydrogen", navn: "Hydrogen",
            opstil: { stof: "ethen" },
            forsoeg: {
                tekst: "Hydrogen, H₂, ligger på hylden ved siden af brom. Træk hydrogenmolekylet hen til dobbeltbindingen i ethen.",
                krav: "H2",
                hint: traekHint("hydrogenmolekylet", "H₂", "i midten", "dobbeltbindingen i ethen")
            },
            spm: {
                om: ["mol"],
                tekst: "Ethen er umættet. Ethen og hydrogen er blevet til ethan. Er ethan mættet eller umættet?",
                svar: [
                    { t: "Ethan er mættet", ok: true },
                    { t: "Ethan er umættet", f: "Et umættet stof har en dobbeltbinding, der kan åbne sig og give plads til flere atomer. Er der en dobbeltbinding i ethan?" }
                ],
                hint: [
                    "Et stof er mættet, når hvert carbonatom har så mange hydrogenatomer, som der er plads til.",
                    "Se på ethan midt i scenen: er der en dobbeltbinding tilbage?",
                    "Ethan har kun enkeltbindinger og tre hydrogenatomer på hvert carbonatom. Ethan er mættet."
                ]
            },
            loest: "Ethan, C₂H₆, har kun enkeltbindinger. Ved addition af hydrogen bliver et umættet stof til et mættet stof."
        },
        {
            id: "vand", navn: "Vand",
            opstil: { stof: "ethen" },
            forsoeg: {
                tekst: "Vand, H₂O, ligger til højre på hylden. Træk vandmolekylet hen til dobbeltbindingen i ethen.",
                krav: "H2O",
                hint: traekHint("vandmolekylet", "H₂O", "til højre", "dobbeltbindingen i ethen")
            },
            spm: {
                om: ["mol"],
                tekst: "Vandmolekylet delte sig i to dele, som satte sig på hver sit carbonatom i ethen. Hvilke to dele?",
                svar: [
                    { t: "H₂ og O", f: "Se på produktet af ethen og vand midt i scenen. På det ene carbonatom sidder der et O med et H på." },
                    { t: "H og OH", ok: true },
                    { t: "H, H og O hver for sig", f: "Dobbeltbindingen i ethen gav kun to ledige pladser, én på hvert carbonatom." }
                ],
                hint: [
                    "Se på de to nye grupper øverst på produktet af ethen og vand.",
                    "På det ene carbonatom er der kommet et H. Hvad sidder der på det andet carbonatom?",
                    "Vand delte sig i H og OH."
                ]
            },
            loest: "Vand sætter sig på ethen som H og OH. Produktet er ethanol, C₂H₅OH, som er en alkohol."
        },
        {
            id: "ethan", navn: "Ethan",
            opstil: { stof: "ethan" },
            gaet: {
                om: ["mol"],
                intro: "Molekylet midt i scenen er ethan, C₂H₆. Ethan er en alkan og har kun enkeltbindinger.",
                tekst: "Kan brom sætte sig på ethan i en addition?",
                svar: [
                    { t: "Ja, ligesom på ethen" },
                    { t: "Ja, men kun på det ene carbonatom" },
                    { t: "Nej, der er ingen ledig plads", ok: true }
                ]
            },
            forsoeg: {
                tekst: "Træk brommolekylet, Br₂, fra hylden hen til ethan, og se, hvad der sker.",
                krav: "afvist",
                hint: traekHint("brommolekylet", "Br₂", "til venstre", "ethan midt i scenen")
            },
            loest: "Ethan har ingen dobbeltbinding, der kan åbne sig. Alle fire bindinger på hvert carbonatom er optaget, så brom kan ikke lægges til. Ethan er mættet."
        },
        {
            id: "propen", navn: "Propen",
            opstil: { stof: "propen" },
            forsoeg: {
                tekst: "Molekylet midt i scenen er propen, C₃H₆. Træk brommolekylet, Br₂, hen til dobbeltbindingen i propen.",
                krav: "Br2",
                hint: [
                    "Dobbeltbindingen er de to streger mellem to af carbonatomerne i propen.",
                    "Brommolekylet ligger til venstre på hylden. Træk det op til propen, og slip.",
                    "Slip brommolekylet et sted på propen. Et klik på brommolekylet på hylden virker også."
                ]
            },
            spm: {
                om: ["mol"],
                tekst: "Propen er C₃H₆, og brom er Br₂. Hvad er formlen for produktet af propen og brom?",
                svar: [
                    { t: "C₃H₆Br₂", ok: true },
                    { t: "C₃H₅Br", f: "Så skulle der også dannes HBr. I en addition bliver intet tilovers. Læg alle atomerne i propen og brom sammen." },
                    { t: "C₃H₈Br₂", f: "Tæl hydrogenatomerne i propen. Der kommer ingen nye hydrogenatomer, kun to bromatomer." }
                ],
                hint: [
                    "I en addition sætter begge atomer fra det lille molekyle sig på. Der bliver ikke noget tilovers.",
                    "Læg atomerne i propen og brom sammen: 3 carbonatomer, 6 hydrogenatomer og 2 bromatomer.",
                    "Tæl atomerne på produktet midt i scenen."
                ]
            },
            loest: "C₃H₆ + Br₂ → C₃H₆Br₂. I en addition lægges atomerne sammen, og der dannes kun ét stof. Produktet af propen og brom hedder 1,2-dibrompropan."
        }
    ];

    /* Hvornaar de tre molekyler paa hylden kommer frem (opgavens id) */
    D.REAGENS_FRA = { Br2: "brom", H2: "hydrogen", H2O: "vand" };

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    D.afvist = function (stofNavn, reagensNavn) {
        return D.Stort(reagensNavn) + " kan ikke sætte sig på " + stofNavn + ". " + D.Stort(stofNavn) + " har ingen dobbeltbinding, der kan åbne sig.";
    };
    D.afvistProdukt = function (reagensNavn, produktNavn) {
        return "Dobbeltbindingen er brugt, så " + reagensNavn + " kan ikke sætte sig på " + produktNavn + ". Tryk på Nyt molekyle for at prøve igen.";
    };

    /* ----- Fane 2: Bromvand ---------------------------------------------------------
       De fem glas paa bordet. Navnet kommer foerst paa, naar eleven har afgjort,
       om stoffet er maettet (A, B og C), eller naar opgaven begynder (D og E). */
    D.GLAS = [
        { b: "A", stof: "hexen" },
        { b: "B", stof: "hexan" },
        { b: "C", stof: "cyclohexen" },
        { b: "D", stof: "cyclohexan" },
        { b: "E", stof: "benzen" }
    ];

    /* Det, forsoeget viste, som det staar paa kortet og i panelet */
    function setTekst(b, udfald) {
        return udfald === "forsvandt" ? "Den orange farve i glas " + b + " er væk." : "Farven i glas " + b + " er flyttet op i det øverste lag.";
    }

    function rystHint(b, sted) {
        return [
            "Glas " + b + " står " + sted + ".",
            "Klik på glas " + b + " for at ryste det. Du kan også tage fat i glasset og ryste det med musen.",
            "Klik på glas " + b + ", og vent, til de to lag i glasset har skilt sig igen."
        ];
    }

    D.B_MAAL = [
        {
            id: "a", navn: "Glas A", glas: 0,
            forsoeg: {
                tekst: "I hvert af de fem glas ligger et farveløst carbonhydrid oven på orange bromvand. Klik på glas A for at ryste det, og se, hvad der sker med farven.",
                set: setTekst("A", "forsvandt"),
                hint: rystHint("A", "længst til venstre")
            },
            spm: {
                om: [0],
                tekst: "Glas A er rystet, og den orange farve fra brom, Br₂, er væk. Hvor er brommet i glas A blevet af?",
                svar: [
                    { t: "Brom har reageret med carbonhydridet", ok: true },
                    { t: "Brom er flyttet op i det øverste lag",
                      f: "Så ville det øverste lag i glas A være orange. Begge lag i glas A er farveløse." },
                    { t: "Brom er fordampet fra glasset",
                      f: "Der er prop i glas A, så intet kan slippe ud." }
                ],
                godt: "Brom har reageret med carbonhydridet i glas A, og produktet er farveløst.",
                hint: [
                    "Se på begge lag i glas A. Er der orange farve nogen steder?",
                    "Der er prop i glas A, så bromatomerne er der endnu. De sidder bare ikke længere sammen som Br₂.",
                    "Brom er blevet brugt i en reaktion med carbonhydridet i glas A."
                ]
            },
            spm2: {
                om: [0],
                tekst: "Brom satte sig på carbonhydridet i glas A i en addition. Er stoffet i glas A mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", f: "Et mættet stof har ingen dobbeltbinding, som brom kan sætte sig på. I glas A har brom reageret." },
                    { t: "Stoffet er umættet", ok: true }
                ],
                hint: [
                    "En addition kræver en dobbeltbinding, der kan åbne sig.",
                    "Et stof med en dobbeltbinding er umættet.",
                    "Brom har lavet en addition i glas A, så stoffet har en dobbeltbinding. Det er umættet."
                ]
            },
            loest: "Glas A er hex-1-en, C₆H₁₂, som er en alken. Brom satte sig på dobbeltbindingen: C₆H₁₂ + Br₂ → C₆H₁₂Br₂. Luppen over glassene viser det øverste lag i glas A."
        },
        {
            id: "b", navn: "Glas B", glas: 1,
            forsoeg: {
                tekst: "Klik på glas B for at ryste det, og se, hvad der sker med den orange farve i glas B.",
                set: setTekst("B", "flyttede"),
                hint: rystHint("B", "som nummer to fra venstre")
            },
            spm: {
                om: [1],
                tekst: "Glas B er rystet, og farven er flyttet op i det øverste lag. Har brom reageret med carbonhydridet i glas B?",
                svar: [
                    { t: "Ja, for det nederste lag er blevet farveløst",
                      f: "Farven er der stadig. Den er flyttet op i carbonhydridet i glas B, så brommet er ikke brugt." },
                    { t: "Ja, men kun halvdelen af brommet",
                      f: "Se på det øverste lag i glas B: det er lige så orange, som bromvandet var. Brommet er ikke brugt." },
                    { t: "Nej, brom er kun flyttet op", ok: true }
                ],
                godt: "Brom er upolært og opløses bedre i det upolære carbonhydrid end i vand. I glas B er brom flyttet op, men det har ikke reageret.",
                hint: [
                    "Brom er orange. Så længe farven er i glas B, er brommet der.",
                    "Brom er et upolært stof. Carbonhydridet er også upolært, og vand er polært.",
                    "Brom er flyttet op i carbonhydridet i glas B uden at reagere."
                ]
            },
            spm2: {
                om: [1],
                tekst: "Brom reagerede ikke med carbonhydridet i glas B. Er stoffet i glas B mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", ok: true },
                    { t: "Stoffet er umættet", f: "Et umættet stof har en dobbeltbinding, som brom sætter sig på. Så ville farven i glas B være forsvundet." }
                ],
                hint: [
                    "Brom sætter sig på en dobbeltbinding. Skete det i glas B?",
                    "Farven er i glas B endnu, så der er ikke sket en addition.",
                    "Stoffet i glas B har ingen dobbeltbinding. Det er mættet."
                ]
            },
            loest: "Glas B er hexan, C₆H₁₄, som er en alkan. En alkan har ingen dobbeltbinding, som brom kan sætte sig på, og derfor forsvinder farven ikke."
        },
        {
            id: "c", navn: "Glas C", glas: 2,
            forsoeg: {
                tekst: "Klik på glas C for at ryste det, og se, hvad der sker med den orange farve i glas C.",
                set: setTekst("C", "forsvandt"),
                hint: rystHint("C", "i midten")
            },
            spm: {
                om: [2],
                tekst: "Glas C er rystet, og den orange farve er væk. Er stoffet i glas C mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", f: "I glas B med et mættet stof flyttede farven op i det øverste lag. Hvad skete der med farven i glas C?" },
                    { t: "Det kan man ikke se på farven", f: "Farven i glas C forsvandt, så brom har reageret. Det sker kun, når stoffet har en dobbeltbinding." },
                    { t: "Stoffet er umættet", ok: true }
                ],
                hint: [
                    "Sammenlign glas C med glas A og glas B.",
                    "Farven forsvandt i glas C, ligesom den gjorde i glas A.",
                    "Brom har lavet en addition i glas C, så stoffet har en dobbeltbinding. Det er umættet."
                ]
            },
            loest: "Glas C er cyclohexen, C₆H₁₀: en ring med én dobbeltbinding. Brom sætter sig på dobbeltbindingen, også når carbonatomerne sidder i en ring."
        },
        {
            id: "d", navn: "Glas D", glas: 3, kendt: true,
            gaet: {
                om: [3],
                intro: "Glas D har fået sin etiket: cyclohexan, C₆H₁₂. Molekylet er en ring med seks carbonatomer og kun enkeltbindinger.",
                figur: "cyclohexan",
                tekst: "Hvad sker der med farven, når glas D bliver rystet?",
                svar: [
                    { t: "Farven forsvinder" },
                    { t: "Farven flytter op i det øverste lag", ok: true },
                    { t: "Farven bliver i det nederste lag" }
                ]
            },
            forsoeg: {
                tekst: "Klik på glas D med cyclohexan for at ryste det, og se, om dit gæt holder.",
                set: setTekst("D", "flyttede"),
                hint: rystHint("D", "som nummer to fra højre")
            },
            spm: {
                om: [3],
                tekst: "Cyclohexan i glas D har formlen C₆H₁₂ ligesom hex-1-en i glas A. Hvorfor affarver cyclohexan ikke bromvand?",
                svar: [
                    { t: "Cyclohexan har ingen dobbeltbinding", ok: true },
                    { t: "Cyclohexan har for få hydrogenatomer",
                      f: "Hex-1-en i glas A har lige så mange hydrogenatomer som cyclohexan, og hex-1-en affarver bromvand. Se på bindingerne i stedet." },
                    { t: "Brom kan ikke sætte sig på en ring",
                      f: "I glas C satte brom sig på cyclohexen, som også er en ring. Hvad er forskellen på cyclohexen og cyclohexan?" }
                ],
                hint: [
                    "Se på tegningen af cyclohexan i luppen over glassene.",
                    "Brom sætter sig kun på en dobbeltbinding.",
                    "Cyclohexan har kun enkeltbindinger. Ringen har ingen ender, og derfor har cyclohexan to hydrogenatomer færre end hexan."
                ]
            },
            loest: "Cyclohexan er en alkan i ring og er mættet. Det er dobbeltbindingen, der afgør, om brom kan sætte sig på, ikke molekylformlen."
        },
        {
            id: "e", navn: "Glas E", glas: 4, kendt: true,
            gaet: {
                om: [4],
                intro: "Glas E har fået sin etiket: benzen, C₆H₆. Benzen tegnes som en ring med tre dobbeltbindinger.",
                figur: "benzen",
                tekst: "Hvad sker der med farven, når glas E bliver rystet?",
                svar: [
                    { t: "Farven flytter op i det øverste lag", ok: true },
                    { t: "Farven forsvinder" },
                    { t: "Farven bliver i det nederste lag" }
                ]
            },
            forsoeg: {
                tekst: "Klik på glas E med benzen for at ryste det, og se, om dit gæt holder.",
                hint: rystHint("E", "længst til højre")
            },
            loest: "Benzen affarver ikke bromvand. Benzenringen er særlig stabil, så benzen reagerer ikke som en alken, selv om benzen tegnes med dobbeltbindinger."
        }
    ];

    D.set = setTekst;
    D.SET_KORT = { forsvandt: "farven forsvandt", flyttede: "farven flyttede op" };

    D.GLAS_KLIK = {
        benzen: "Benzen er kræftfremkaldende og bruges ikke i skolens laboratorium. Glasset med benzen findes kun i animationen."
    };

    D.lupBrom = "Et brommolekyle, Br₂. Det er brom, der giver den orange farve.";
    D.lupStof = function (v, reageret) {
        if (reageret) return "Et molekyle " + v.produkt + ", " + v.pFormel + ". Dobbeltbindingen har åbnet sig, og der sidder et bromatom på hvert af de to carbonatomer.";
        return "Et molekyle " + v.navn + ", " + v.formel + ". Hvert hjørne og hver ende i tegningen er et carbonatom.";
    };

    /* ----- Fane 3: Plastik -------------------------------------------------------------
       opstil.led: saa mange ethenmolekyler er kaeden lavet af, naar opgaven begynder */
    D.P_MAAL = [
        {
            id: "to", navn: "To ethenmolekyler",
            opstil: { led: 0 },
            forsoeg: {
                tekst: "I scenen ligger seks ethenmolekyler, C₂H₄, og ikke andet. Træk et ethenmolekyle hen oven på et andet ethenmolekyle, og slip.",
                krav: 2,
                set: "To ethenmolekyler har sat sig sammen til en kort kæde.",
                hint: [
                    "Tag fat i et af ethenmolekylerne med musen.",
                    "Træk ethenmolekylet hen oven på et andet ethenmolekyle, og slip.",
                    "Et klik på et ethenmolekyle sætter det sammen med det nærmeste ethenmolekyle."
                ]
            },
            spm: {
                om: ["kaede"],
                tekst: "To ethenmolekyler har sat sig sammen. Hvad skete der med dobbeltbindingerne i de to ethenmolekyler?",
                svar: [
                    { t: "Dobbeltbindingerne er der stadig",
                      f: "Se på kæden af de to ethenmolekyler: der er kun én streg mellem hvert par af carbonatomer." },
                    { t: "De åbnede sig og bandt molekylerne sammen", ok: true },
                    { t: "Dobbeltbindingerne blev til hydrogenatomer",
                      f: "Tæl hydrogenatomerne i kæden. Hvert carbonatom har to, præcis som i ethen." }
                ],
                hint: [
                    "Tæl stregerne mellem carbonatomerne i kæden.",
                    "Hver dobbeltbinding i ethen er blevet til en enkeltbinding. Det gav en ledig plads på hvert carbonatom.",
                    "De ledige pladser blev brugt til at binde de to ethenmolekyler sammen."
                ]
            },
            loest: "Dobbeltbindingerne i de to ethenmolekyler åbnede sig, og carbonatomerne bandt sig til nabomolekylet i stedet. Kæden har en ledig plads i hver ende, så flere ethenmolekyler kan sætte sig på."
        },
        {
            id: "kaede", navn: "Byg en kæde",
            forsoeg: {
                tekst: "Sæt flere ethenmolekyler på kæden, til kæden er lavet af 6. Træk et ethenmolekyle hen til en af kædens ender, og slip.",
                krav: 6,
                set: "Kæden er lavet af 6 ethenmolekyler.",
                hint: [
                    "Kæden har en ledig plads i hver ende. De ledige pladser er tegnet som gule, stiplede cirkler.",
                    "Træk et ethenmolekyle hen til en af kædens ender, og slip.",
                    "Et klik på et ethenmolekyle sætter det på kæden. Bliv ved, til kæden er lavet af 6 ethenmolekyler."
                ]
            },
            spm: {
                om: ["kaede"],
                tekst: "Kæden er lavet af 6 ethenmolekyler, C₂H₄. Hvor mange carbonatomer og hydrogenatomer er der i kæden?",
                svar: [
                    { t: "6 C og 12 H", f: "Hvert ethenmolekyle har 2 carbonatomer og 4 hydrogenatomer, og kæden er lavet af 6 ethenmolekyler." },
                    { t: "12 C og 26 H", f: "Der er ikke kommet hydrogenatomer til. Kæden har præcis de atomer, de 6 ethenmolekyler havde." },
                    { t: "12 C og 24 H", ok: true }
                ],
                hint: [
                    "Ét ethenmolekyle har 2 carbonatomer og 4 hydrogenatomer.",
                    "Gang med 6. Intet er blevet tilovers, og intet er kommet til.",
                    "6 · 2 = 12 og 6 · 4 = 24."
                ]
            },
            loest: "6 ethenmolekyler giver 12 carbonatomer og 24 hydrogenatomer. Alle atomerne fra ethenmolekylerne er med i kæden, og der er ikke dannet andre stoffer."
        },
        {
            id: "polymer", navn: "Zoom ud",
            opstil: { led: 6 },
            forsoeg: {
                tekst: "En rigtig kæde i plastik er meget længere end 6 ethenmolekyler. Tryk på den grønne knap Zoom ud til venstre under dette kort.",
                krav: "zoom",
                hint: [
                    "Den grønne knap Zoom ud står til venstre under kortet med opgaven.",
                    "Når der er zoomet ud, viser scenen en hel kæde. Kæden på 6 ethenmolekyler er det lille gule stykke.",
                    "Tryk på Zoom ud, og vent, til billedet står stille."
                ]
            },
            spm: {
                tekst: "Hvad kaldes en lang kæde, der er lavet af mange tusinde ens små molekyler?",
                svar: [
                    { t: "En polymer", ok: true },
                    { t: "En isomer", f: "Isomerer er forskellige stoffer med samme molekylformel. Kæden af ethenmolekyler er ét meget stort molekyle." },
                    { t: "En alken", f: "En alken har en dobbeltbinding. Kæden af ethenmolekyler har kun enkeltbindinger." }
                ],
                hint: [
                    "Poly betyder mange.",
                    "Stoffet i kæden hedder polyethen.",
                    "Den lange kæde kaldes en polymer."
                ]
            },
            loest: "Den lange kæde kaldes en polymer, og reaktionen kaldes en polymerisation. Poly betyder mange. Stoffet hedder polyethen og er den plastik, fryseposer, bæreposer og mange flasker er lavet af."
        },
        {
            id: "frysepose", navn: "Fryseposen",
            opstil: { led: 6 },
            gaet: {
                om: ["kaede"],
                intro: "Ethen affarver bromvand, fordi brom sætter sig på dobbeltbindingen i ethen. Kæden i scenen er et stykke polyethen fra en frysepose.",
                tekst: "Kan brom sætte sig på kæden i polyethen?",
                svar: [
                    { t: "Ja, for kæden er lavet af ethen" },
                    { t: "Nej, kæden har ingen dobbeltbindinger", ok: true },
                    { t: "Ja, men kun langsomt" }
                ]
            },
            forsoeg: {
                tekst: "Træk brommolekylet, Br₂, fra bunden af scenen hen til kæden af polyethen, og se, hvad der sker.",
                krav: "afvist",
                hint: [
                    "Brommolekylet, Br₂, ligger nederst i scenen.",
                    "Tag fat i brommolekylet med musen, træk det op til kæden, og slip.",
                    "Et klik på brommolekylet virker også."
                ]
            },
            loest: "Kæden i polyethen har kun enkeltbindinger, så der er ingen ledig plads til brom. Polyethen ligner en meget lang alkan, og derfor affarver en frysepose ikke bromvand."
        },
        {
            id: "udsnit", navn: "Udsnittet",
            opstil: { led: 6 },
            spm: {
                om: ["kaede"],
                tekst: "Kæden i polyethen er for lang til at tegne. Man tegner det udsnit, der gentager sig. Hvilket udsnit?",
                svar: [
                    { t: "−CH=CH−", f: "Dobbeltbindingerne åbnede sig, da ethenmolekylerne satte sig sammen. I kæden er der kun enkeltbindinger." },
                    { t: "−CH₂−CH₂−", ok: true },
                    { t: "−CH₃−CH₃−", f: "Et carbonatom midt i kæden har to bindinger til sine nabocarbonatomer. Så er der kun plads til to hydrogenatomer." }
                ],
                hint: [
                    "Se på ét af de farvede felter i kæden. Hvert felt kommer fra ét ethenmolekyle.",
                    "Tæl hydrogenatomerne på hvert carbonatom i feltet, og se, om der er dobbeltbindinger.",
                    "Hvert felt i kæden har to carbonatomer med to hydrogenatomer på hver og kun enkeltbindinger."
                ]
            },
            loest: "Polyethen skrives som udsnittet −CH₂−CH₂−, der gentager sig mange tusinde gange. Hvert udsnit kommer fra ét ethenmolekyle."
        }
    ];

    D.P_FULD = "Der er ikke plads til flere ethenmolekyler på skærmen. Der mangler kun nogle tusinde, før kæden er lang nok til en frysepose.";
    D.P_BROM = "Brom kan ikke sætte sig på kæden af polyethen. Kæden har kun enkeltbindinger og ingen ledig plads.";

    /* ----- Faelles tekster ----------------------------------------------------------- */
    /* Kortet blinker og siger dette, naar eleven klikker paa forsoeget foer gaettet */
    D.GAET_LINJE = "Gæt først: vælg et af de tre svar på det gule kort.";
    /* Sidst i de linjer, der sender eleven tilbage til scenen, foer der svares */
    D.SAA_SVAR = " Vælg så et af svarene på kortet.";

    D.FAERDIG = {
        a: "Alle seks opgaver om addition er løst.",
        b: "Alle fem glas er klaret.",
        p: "Alle fem opgaver om plastik er løst."
    };

    D.PAASKE = {
        ethan: "Tredje forsøg med ethan. Ethan er stadig mættet.",
        ryst: "Glasset er rystet rigeligt. Farven bliver ikke anderledes af at ryste glasset mere."
    };

    NK.Data = D;
}());

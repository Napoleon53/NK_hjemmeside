/* =====================================================================
   data.js - opgaverne og teksterne paa de tre faner

   Alt, man kan rette i uden at roere koden. En opgave kan have op til
   fire dele, der kommer efter hinanden:

     gaet     et gratis gaet, foer eleven proever (svarene uden forklaring).
              intro er en kort indledning, tekst er selve spoergsmaalet,
              og figur er en ring, der tegnes paa kortet
     forsoeg  eleven goer noget i scenen; fanen afgoer, hvornaar det er sket.
              set er det, eleven lige har set; har forsoeget et set (eller et
              gaet foer sig), staar det alene paa det groenne kort, foer
              spoergsmaalet kommer
     spm      et spoergsmaal bagefter; de forkerte svar (f) er de fejl,
              elever laver, og forklaringen peger tilbage paa scenen
     spm2     et spoergsmaal til. godt (i spm) er forklaringen til det
              rigtige svar; den staar alene, til eleven selv gaar videre

   Hvert led har sin egen hinttrappe paa tre trin.

   AL tekst staar paa kortet oeverst midt i scenen (js/fane.js), og
   eleverne laeser ikke lange tekster (brugeren 9. okt. 2026: "stadig en
   smule for meget tekst"). Graenserne er de samme som i sc7.5: gaettets
   tekst hoejst 60 tegn og indledningen 100, et spoergsmaal hoejst 105, et
   svar hoejst 34, et forsoeg hoejst 95, et hint hoejst 100, forklaringen
   til et forkert svar hoejst 110 og forklaringen til det rigtige hoejst
   160 (selvtesten taeller og maaler kortets hoejde). Sig det ene, eleven
   skal goere eller forstaa.

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
            "Træk " + navn + " op til " + maal + ", og slip.",
            "Et klik på " + navn + " på hylden sender det selv af sted."
        ];
    }

    /* ----- Fane 1: Addition ------------------------------------------------------
       opstil: det molekyle, der ligger klar, og evt. det produkt, der er lavet.
       krav: det, forsoeget beder om ("afvist": dibrom, der ikke kan saette sig paa) */
    D.A_MAAL = [
        {
            id: "brom", navn: "Dibrom på ethen",
            opstil: { stof: "ethen" },
            gaet: {
                intro: "Ethen har en dobbeltbinding. Om lidt trækker du et dibrommolekyle, Br₂, hen til dobbeltbindingen.",
                tekst: "Hvor mange stoffer bliver der dannet af ethen og dibrom?",
                svar: [
                    { t: "Ét stof", ok: true },
                    { t: "To stoffer" },
                    { t: "Ingen, der sker ikke noget" }
                ]
            },
            forsoeg: {
                tekst: "Træk dibrommolekylet fra hylden hen til dobbeltbindingen i ethen.",
                krav: "Br2",
                hint: traekHint("dibrommolekylet", "Br₂", "til venstre", "de to streger mellem carbonatomerne i ethen")
            },
            loest: "Dobbeltbindingen i ethen åbnede sig, og et bromatom satte sig på hvert carbonatom. Der blev kun ét stof: 1,2-dibromethan. Reaktionen kaldes en addition."
        },
        {
            id: "bindinger", navn: "Fire bindinger",
            opstil: { stof: "ethen", produkt: "Br2" },
            spm: {
                om: ["mol"],
                tekst: "Ethen og dibrom blev til 1,2-dibromethan. Hvad skete der med dobbeltbindingen?",
                svar: [
                    { t: "Den er der stadig",
                      f: "Tæl stregerne mellem de to carbonatomer i 1,2-dibromethan." },
                    { t: "Den blev til en enkeltbinding", ok: true },
                    { t: "Den forsvandt helt",
                      f: "Der er stadig én streg mellem de to carbonatomer i 1,2-dibromethan. De hænger sammen." }
                ],
                godt: "Den ene af de to bindinger i dobbeltbindingen åbnede sig. Den anden holder stadig carbonatomerne sammen.",
                hint: [
                    "I ethen var der to streger mellem carbonatomerne.",
                    "Tæl stregerne mellem de to carbonatomer i 1,2-dibromethan.",
                    "Der er én streg tilbage. Dobbeltbindingen er blevet til en enkeltbinding."
                ]
            },
            spm2: {
                om: ["mol"],
                tekst: "Hvor mange bindinger har hvert carbonatom i 1,2-dibromethan?",
                svar: [
                    { t: "3 bindinger", f: "Tæl stregerne fra ét carbonatom i 1,2-dibromethan: til carbon, til brom og til hydrogen." },
                    { t: "5 bindinger", f: "Dobbeltbindingen talte for to. I 1,2-dibromethan er der en enkeltbinding og en binding til brom." },
                    { t: "4 bindinger", ok: true }
                ],
                hint: [
                    "Tæl stregerne ud fra ét af carbonatomerne i 1,2-dibromethan.",
                    "Én streg til det andet carbonatom, én til brom og to til hydrogen.",
                    "1 + 1 + 2 = 4."
                ]
            },
            loest: "Et carbonatom har altid fire bindinger. I ethen brugte det to på dobbeltbindingen. I 1,2-dibromethan bruger det én på carbon og én på brom."
        },
        {
            id: "hydrogen", navn: "Dihydrogen",
            opstil: { stof: "ethen" },
            forsoeg: {
                tekst: "Træk dihydrogenmolekylet, H₂, fra hylden hen til dobbeltbindingen i ethen.",
                krav: "H2",
                hint: traekHint("dihydrogenmolekylet", "H₂", "i midten", "dobbeltbindingen i ethen")
            },
            spm: {
                om: ["mol"],
                tekst: "Ethen og dihydrogen blev til ethan. Er ethan mættet eller umættet?",
                svar: [
                    { t: "Ethan er mættet", ok: true },
                    { t: "Ethan er umættet", f: "Et umættet stof har en dobbeltbinding. Er der en dobbeltbinding i ethan?" }
                ],
                hint: [
                    "Et stof er mættet, når der ikke er plads til flere hydrogenatomer.",
                    "Se på ethan midt i scenen. Er der en dobbeltbinding tilbage?",
                    "Ethan har kun enkeltbindinger. Ethan er mættet."
                ]
            },
            loest: "Ethan, C₂H₆, har kun enkeltbindinger. Med dihydrogen bliver et umættet stof til et mættet."
        },
        {
            id: "vand", navn: "Vand",
            opstil: { stof: "ethen" },
            forsoeg: {
                tekst: "Træk vandmolekylet, H₂O, fra hylden hen til dobbeltbindingen i ethen.",
                krav: "H2O",
                hint: traekHint("vandmolekylet", "H₂O", "til højre", "dobbeltbindingen i ethen")
            },
            spm: {
                om: ["mol"],
                tekst: "Vandmolekylet delte sig i to dele, som satte sig på ethen. Hvilke to dele?",
                svar: [
                    { t: "H₂ og O", f: "Se på produktet af ethen og vand. På det ene carbonatom sidder et O med et H på." },
                    { t: "H og OH", ok: true },
                    { t: "H, H og O hver for sig", f: "Dobbeltbindingen i ethen gav kun to ledige pladser, én på hvert carbonatom." }
                ],
                hint: [
                    "Se på de to nye grupper øverst på produktet af ethen og vand.",
                    "På det ene carbonatom er der kommet et H. Hvad sidder der på det andet?",
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
                intro: "Molekylet i scenen er ethan, C₂H₆. Ethan er en alkan og har kun enkeltbindinger.",
                tekst: "Kan dibrom sætte sig på ethan i en addition?",
                svar: [
                    { t: "Ja, ligesom på ethen" },
                    { t: "Ja, på det ene carbonatom" },
                    { t: "Nej, der er ingen ledig plads", ok: true }
                ]
            },
            forsoeg: {
                tekst: "Træk dibrommolekylet fra hylden hen til ethan, og se, hvad der sker.",
                krav: "afvist",
                hint: traekHint("dibrommolekylet", "Br₂", "til venstre", "ethan midt i scenen")
            },
            loest: "Ethan har ingen dobbeltbinding, der kan åbne sig. Alle bindinger er optaget, så dibrom kan ikke lægges til. Ethan er mættet."
        },
        {
            id: "propen", navn: "Propen",
            opstil: { stof: "propen" },
            forsoeg: {
                tekst: "Molekylet i scenen er propen, C₃H₆. Træk dibrommolekylet hen til dobbeltbindingen i propen.",
                krav: "Br2",
                hint: [
                    "Dobbeltbindingen er de to streger mellem to af carbonatomerne i propen.",
                    "Dibrommolekylet ligger til venstre på hylden. Træk det op til propen, og slip.",
                    "Et klik på dibrommolekylet på hylden sender det selv af sted."
                ]
            },
            spm: {
                om: ["mol"],
                tekst: "Propen er C₃H₆, og dibrom er Br₂. Hvad er formlen for produktet af propen og dibrom?",
                svar: [
                    { t: "C₃H₆Br₂", ok: true },
                    { t: "C₃H₅Br", f: "Med den formel skulle der også dannes HBr. I en addition bliver intet tilovers, så læg atomerne sammen." },
                    { t: "C₃H₈Br₂", f: "Tæl hydrogenatomerne i propen. Der kommer ingen nye hydrogenatomer, kun to bromatomer." }
                ],
                hint: [
                    "I en addition sætter begge bromatomer sig på. Der bliver ikke noget tilovers.",
                    "Læg atomerne i propen og dibrom sammen: 3 C, 6 H og 2 Br.",
                    "Tæl atomerne på produktet midt i scenen."
                ]
            },
            loest: "C₃H₆ + Br₂ → C₃H₆Br₂. I en addition lægges atomerne sammen, og der dannes kun ét stof: 1,2-dibrompropan."
        }
    ];

    /* Hvornaar de tre molekyler paa hylden kommer frem (opgavens id) */
    D.REAGENS_FRA = { Br2: "brom", H2: "hydrogen", H2O: "vand" };

    D.Stort = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };

    D.afvist = function (stofNavn, reagensNavn) {
        return D.Stort(reagensNavn) + " kan ikke sætte sig på " + stofNavn + ". " + D.Stort(stofNavn) + " har ingen dobbeltbinding, der kan åbne sig.";
    };

    /* Eleven brugte et andet molekyle end det, opgaven beder om */
    D.andet = function (brugt, produkt, bedt, stof) {
        return "Du brugte " + brugt + ", og produktet er " + produkt + ". Tryk på Nyt molekyle, og træk " + bedt + "molekylet hen til " + stof + ".";
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
            "Klik på glas " + b + " for at ryste det. Glas " + b + " kan også rystes med musen.",
            "Klik på glas " + b + ", og vent, til de to lag i glas " + b + " har skilt sig igen."
        ];
    }

    D.B_MAAL = [
        {
            id: "a", navn: "Glas A", glas: 0,
            forsoeg: {
                tekst: "Fem glas har et farveløst carbonhydrid over orange bromvand. Klik på glas A for at ryste det.",
                set: setTekst("A", "forsvandt"),
                hint: rystHint("A", "længst til venstre")
            },
            spm: {
                om: [0],
                tekst: "I glas A er den orange farve fra dibrom, Br₂, væk. Hvor er dibrommet blevet af?",
                svar: [
                    { t: "Dibrom har reageret med stoffet", ok: true },
                    { t: "Dibrom er flyttet op i øverste lag",
                      f: "Hvis dibrom var flyttet op, ville det øverste lag i glas A være orange. Begge lag i glas A er farveløse." },
                    { t: "Dibrom er fordampet fra glasset",
                      f: "Der er prop i glas A, så intet kan slippe ud." }
                ],
                godt: "Dibrom har reageret med carbonhydridet i glas A, og produktet er farveløst.",
                hint: [
                    "Se på begge lag i glas A. Er der orange farve nogen steder?",
                    "Der er prop i glas A, så bromatomerne er der endnu, men ikke som Br₂.",
                    "Dibrom er blevet brugt i en reaktion med carbonhydridet i glas A."
                ]
            },
            spm2: {
                om: [0],
                tekst: "Dibrom satte sig på stoffet i glas A i en addition. Er stoffet mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", f: "Et mættet stof har ingen dobbeltbinding, som dibrom kan sætte sig på. I glas A har dibrom reageret." },
                    { t: "Stoffet er umættet", ok: true }
                ],
                hint: [
                    "En addition kræver en dobbeltbinding, der kan åbne sig.",
                    "Et stof med en dobbeltbinding er umættet.",
                    "Dibrom lavede en addition i glas A, så stoffet har en dobbeltbinding. Det er umættet."
                ]
            },
            loest: "Glas A indeholder hex-1-en, C₆H₁₂, som er en alken. Dibrom satte sig på dobbeltbindingen: C₆H₁₂ + Br₂ → C₆H₁₂Br₂. Luppen viser det øverste lag i glas A."
        },
        {
            id: "b", navn: "Glas B", glas: 1,
            forsoeg: {
                tekst: "Klik på glas B for at ryste det, og se, hvad der sker med farven.",
                set: setTekst("B", "flyttede"),
                hint: rystHint("B", "som nummer to fra venstre")
            },
            spm: {
                om: [1],
                tekst: "I glas B er farven flyttet op i det øverste lag. Har dibrom reageret med stoffet i glas B?",
                svar: [
                    { t: "Ja, nederste lag er farveløst",
                      f: "Farven er der stadig. Den er flyttet op i carbonhydridet i glas B, så dibrommet er ikke brugt." },
                    { t: "Ja, men kun halvdelen",
                      f: "Det øverste lag i glas B er lige så orange, som bromvandet var. Dibrommet er ikke brugt." },
                    { t: "Nej, dibrom er kun flyttet op", ok: true }
                ],
                godt: "Dibrom er upolært og opløses bedst i det upolære carbonhydrid. I glas B er dibrom flyttet op, men det har ikke reageret.",
                hint: [
                    "Dibrom er orange. Så længe farven er i glas B, er dibrommet der.",
                    "Dibrom er upolært. Carbonhydridet er også upolært, og vand er polært.",
                    "Dibrom er flyttet op i carbonhydridet i glas B uden at reagere."
                ]
            },
            spm2: {
                om: [1],
                tekst: "Dibrom reagerede ikke med stoffet i glas B. Er stoffet i glas B mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", ok: true },
                    { t: "Stoffet er umættet", f: "Hvis stoffet havde en dobbeltbinding, ville dibrom sætte sig på den, og farven i glas B ville være forsvundet." }
                ],
                hint: [
                    "Dibrom sætter sig på en dobbeltbinding. Skete det i glas B?",
                    "Farven er i glas B endnu, så der er ikke sket en addition.",
                    "Stoffet i glas B har ingen dobbeltbinding. Det er mættet."
                ]
            },
            loest: "Glas B indeholder hexan, C₆H₁₄, som er en alkan. En alkan har ingen dobbeltbinding, som dibrom kan sætte sig på, så farven forsvinder ikke."
        },
        {
            id: "c", navn: "Glas C", glas: 2,
            forsoeg: {
                tekst: "Klik på glas C for at ryste det, og se, hvad der sker med farven.",
                set: setTekst("C", "forsvandt"),
                hint: rystHint("C", "i midten")
            },
            spm: {
                om: [2],
                tekst: "I glas C er den orange farve væk. Er stoffet i glas C mættet eller umættet?",
                svar: [
                    { t: "Stoffet er mættet", f: "I glas B med et mættet stof flyttede farven op. Hvad skete der med farven i glas C?" },
                    { t: "Det kan man ikke se på farven", f: "Farven i glas C forsvandt, så dibrom har reageret. Det sker kun med en dobbeltbinding." },
                    { t: "Stoffet er umættet", ok: true }
                ],
                hint: [
                    "Sammenlign glas C med glas A og glas B.",
                    "Farven forsvandt i glas C, ligesom den gjorde i glas A.",
                    "Dibrom lavede en addition i glas C, så stoffet har en dobbeltbinding. Det er umættet."
                ]
            },
            loest: "Glas C indeholder cyclohexen, C₆H₁₀, som er en ring med én dobbeltbinding. Dibrom sætter sig på dobbeltbindingen, også i en ring."
        },
        {
            id: "d", navn: "Glas D", glas: 3, kendt: true,
            gaet: {
                om: [3],
                intro: "Glas D har fået sin etiket: cyclohexan, C₆H₁₂, en ring med kun enkeltbindinger.",
                figur: "cyclohexan",
                tekst: "Hvad sker der med farven, når glas D bliver rystet?",
                svar: [
                    { t: "Farven forsvinder" },
                    { t: "Farven flytter op i øverste lag", ok: true },
                    { t: "Farven bliver i nederste lag" }
                ]
            },
            forsoeg: {
                tekst: "Klik på glas D med cyclohexan for at ryste det, og se, om dit gæt holder.",
                set: setTekst("D", "flyttede"),
                hint: rystHint("D", "som nummer to fra højre")
            },
            spm: {
                om: [3],
                tekst: "Cyclohexan i glas D har formlen C₆H₁₂ ligesom hex-1-en. Hvorfor affarver cyclohexan ikke bromvand?",
                svar: [
                    { t: "Ingen dobbeltbinding i cyclohexan", ok: true },
                    { t: "For få hydrogenatomer",
                      f: "Hex-1-en har lige så mange hydrogenatomer som cyclohexan og affarver bromvand. Se på bindingerne." },
                    { t: "Dibrom sætter sig ikke på en ring",
                      f: "I glas C satte dibrom sig på cyclohexen, som også er en ring. Hvad er forskellen på de to ringe?" }
                ],
                hint: [
                    "Se på tegningen af cyclohexan i luppen over glassene.",
                    "Dibrom sætter sig kun på en dobbeltbinding.",
                    "Cyclohexan har kun enkeltbindinger. En ring har to hydrogenatomer færre end kæden hexan."
                ]
            },
            loest: "Cyclohexan er en alkan i ring og er mættet. Det er dobbeltbindingen, der afgør, om dibrom kan sætte sig på, ikke molekylformlen."
        },
        {
            id: "e", navn: "Glas E", glas: 4, kendt: true,
            gaet: {
                om: [4],
                intro: "Glas E har fået sin etiket: benzen, C₆H₆. Benzen tegnes som en ring med tre dobbeltbindinger.",
                figur: "benzen",
                tekst: "Hvad sker der med farven, når glas E bliver rystet?",
                svar: [
                    { t: "Farven flytter op i øverste lag", ok: true },
                    { t: "Farven forsvinder" },
                    { t: "Farven bliver i nederste lag" }
                ]
            },
            forsoeg: {
                tekst: "Klik på glas E med benzen for at ryste det, og se, om dit gæt holder.",
                hint: rystHint("E", "længst til højre")
            },
            loest: "Benzen affarver ikke bromvand. Benzenringen er særlig stabil og reagerer ikke som en alken, selv om benzen tegnes med dobbeltbindinger."
        }
    ];

    D.set = setTekst;
    D.SET_KORT = { forsvandt: "farven forsvandt", flyttede: "farven flyttede op" };

    /* Et klik paa et glas, opgaven ikke handler om */
    D.andetGlas = function (b, opgaveB, navn, hvad) {
        if (navn) return "Glas " + b + " indeholder " + navn + ". " + hvad + " Denne opgave handler om glas " + opgaveB + ".";
        return "Glas " + b + " hører til en anden opgave. Denne opgave handler om glas " + opgaveB + ".";
    };

    D.GLAS_KLIK = {
        benzen: "Benzen er kræftfremkaldende og bruges ikke i skolens laboratorium. Glasset med benzen findes kun i animationen."
    };

    D.lupBrom = "Et dibrommolekyle, Br₂. Det er dibrom, der giver den orange farve.";
    D.lupStof = function (v, reageret) {
        if (reageret) return "Et molekyle af " + v.produkt + ", " + v.pFormel + ". Dobbeltbindingen har åbnet sig, og der sidder et bromatom på hvert af de to carbonatomer.";
        return "Et molekyle af " + v.navn + ", " + v.formel + ". Hvert hjørne og hver ende i tegningen er et carbonatom.";
    };

    /* ----- Fane 3: Plastik -------------------------------------------------------------
       opstil.led: saa mange ethenmolekyler er kaeden lavet af, naar opgaven begynder */
    D.P_MAAL = [
        {
            id: "to", navn: "To ethenmolekyler",
            opstil: { led: 0 },
            forsoeg: {
                tekst: "Træk et ethenmolekyle hen oven på et andet ethenmolekyle, og slip.",
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
                tekst: "To ethenmolekyler har sat sig sammen. Hvad skete der med deres dobbeltbindinger?",
                svar: [
                    { t: "De er der stadig",
                      f: "Se på kæden af de to ethenmolekyler. Der er kun én streg mellem hvert par af carbonatomer." },
                    { t: "De åbnede sig og bandt dem sammen", ok: true },
                    { t: "De blev til hydrogenatomer",
                      f: "Tæl hydrogenatomerne i kæden. Hvert carbonatom har to, præcis som i ethen." }
                ],
                hint: [
                    "Tæl stregerne mellem carbonatomerne i kæden.",
                    "Hver dobbeltbinding i ethen blev til en enkeltbinding. Det gav en ledig plads på hvert carbonatom.",
                    "De ledige pladser blev brugt til at binde de to ethenmolekyler sammen."
                ]
            },
            loest: "Dobbeltbindingerne åbnede sig, og carbonatomerne bandt sig til nabomolekylet. Kæden har en ledig plads i hver ende til flere ethenmolekyler."
        },
        {
            id: "kaede", navn: "Byg en kæde",
            forsoeg: {
                tekst: "Træk ethenmolekyler hen til kædens ender, til kæden er lavet af 6 ethenmolekyler.",
                krav: 6,
                set: "Kæden er lavet af 6 ethenmolekyler.",
                hint: [
                    "Kæden har en ledig plads i hver ende: de gule, stiplede cirkler.",
                    "Træk et ethenmolekyle hen til en af kædens ender, og slip.",
                    "Et klik på et ethenmolekyle sætter det på kæden. Bliv ved, til kæden er lavet af 6 ethenmolekyler."
                ]
            },
            spm: {
                om: ["kaede"],
                tekst: "Kæden er lavet af 6 ethenmolekyler, C₂H₄. Hvor mange carbonatomer og hydrogenatomer er der i kæden?",
                svar: [
                    { t: "6 C og 12 H", f: "Hvert ethenmolekyle har 2 carbonatomer og 4 hydrogenatomer, og kæden er lavet af 6." },
                    { t: "12 C og 26 H", f: "Der er ikke kommet hydrogenatomer til. Kæden har præcis de atomer, de 6 ethenmolekyler havde." },
                    { t: "12 C og 24 H", ok: true }
                ],
                hint: [
                    "Ét ethenmolekyle har 2 carbonatomer og 4 hydrogenatomer.",
                    "Gang begge tal med 6. Intet er blevet tilovers, og intet er kommet til.",
                    "6 · 2 = 12 og 6 · 4 = 24."
                ]
            },
            loest: "6 ethenmolekyler giver 12 carbonatomer og 24 hydrogenatomer. Alle atomerne er med i kæden, og der er ikke dannet andre stoffer."
        },
        {
            id: "polymer", navn: "Zoom ud",
            opstil: { led: 6 },
            forsoeg: {
                tekst: "En kæde i plastik er meget længere end 6 ethenmolekyler. Tryk på den grønne knap Zoom ud.",
                krav: "zoom",
                set: "Den lange streg er én kæde i polyethen. Det lille gule stykke er kæden på 6 ethenmolekyler.",
                hint: [
                    "Den grønne knap Zoom ud står til venstre under kortet.",
                    "Zoomet ud viser scenen en hel kæde. Kæden på 6 ethenmolekyler er det lille gule stykke.",
                    "Tryk på Zoom ud, og vent, til billedet står stille."
                ]
            },
            spm: {
                tekst: "Hvad kaldes en lang kæde, der er lavet af mange tusinde ens små molekyler?",
                svar: [
                    { t: "En polymer", ok: true },
                    { t: "En isomer", f: "Isomerer er forskellige stoffer med samme molekylformel. Kæden er ét meget stort molekyle." },
                    { t: "En alken", f: "En alken har en dobbeltbinding. Kæden af ethenmolekyler har kun enkeltbindinger." }
                ],
                hint: [
                    "Poly betyder mange.",
                    "Stoffet i kæden hedder polyethen.",
                    "Den lange kæde kaldes en polymer."
                ]
            },
            loest: "Kæden kaldes en polymer, og reaktionen en polymerisation. Stoffet hedder polyethen: plastikken i fryseposer, bæreposer og mange flasker."
        },
        {
            id: "frysepose", navn: "Fryseposen",
            opstil: { led: 6 },
            gaet: {
                om: ["kaede"],
                intro: "Kæden i scenen er et stykke polyethen fra en frysepose. Ethen affarver bromvand.",
                tekst: "Kan dibrom sætte sig på kæden i polyethen?",
                svar: [
                    { t: "Ja, kæden er lavet af ethen" },
                    { t: "Nej, ingen dobbeltbindinger", ok: true },
                    { t: "Ja, men kun langsomt" }
                ]
            },
            forsoeg: {
                tekst: "Træk dibrommolekylet hen til kæden af polyethen, og se, hvad der sker.",
                krav: "afvist",
                hint: [
                    "Dibrommolekylet, Br₂, ligger nederst i scenen.",
                    "Træk dibrommolekylet op til kæden af polyethen, og slip.",
                    "Et klik på dibrommolekylet sender det selv hen til kæden."
                ]
            },
            loest: "Kæden i polyethen har kun enkeltbindinger, så der er ingen ledig plads til dibrom. Derfor affarver en frysepose ikke bromvand."
        },
        {
            id: "udsnit", navn: "Udsnittet",
            opstil: { led: 6 },
            spm: {
                om: ["kaede"],
                tekst: "En kæde i polyethen er for lang til at tegne. Man tegner det udsnit, der gentager sig. Hvilket udsnit?",
                svar: [
                    { t: "−CH=CH−", f: "Dobbeltbindingerne åbnede sig, da ethenmolekylerne satte sig sammen. Kæden har kun enkeltbindinger." },
                    { t: "−CH₂−CH₂−", ok: true },
                    { t: "−CH₃−CH₃−", f: "Et carbonatom midt i kæden har to bindinger til nabocarbonatomer. Der er kun plads til to H." }
                ],
                hint: [
                    "Se på ét af de farvede felter i kæden. Hvert felt kommer fra ét ethenmolekyle.",
                    "Tæl hydrogenatomerne på hvert carbonatom i feltet, og se efter dobbeltbindinger.",
                    "Hvert felt har to carbonatomer med to hydrogenatomer på hver og kun enkeltbindinger."
                ]
            },
            loest: "Polyethen skrives som udsnittet −CH₂−CH₂−, der gentager sig mange tusinde gange. Hvert udsnit kommer fra ét ethenmolekyle."
        }
    ];

    D.P_FULD = "Der er ikke plads til flere ethenmolekyler på skærmen. Der mangler kun nogle tusinde, før kæden er lang nok til en frysepose.";

    /* ----- Faelles tekster ----------------------------------------------------------- */
    D.FAERDIG = {
        a: "Alle seks opgaver om addition er løst.",
        b: "Alle fem glas er klaret.",
        p: "Alle fem opgaver om plastik er løst."
    };

    D.PAASKE = {
        ethan: "Tredje forsøg med ethan. Ethan er stadig mættet.",
        ryst: "Tålmodighed. Hvert glas bliver rystet, når det er dets tur."
    };

    NK.Data = D;
}());

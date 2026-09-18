/* =====================================================================
   forloeb.js - trinnene i sb2.4, skrevet som betingelser

   Motoren staar i ../laboratoriet/js/forloeb.js og sproget i
   ../laboratoriet/js/vilkaar.js. Her staar kun, hvornaar hvert trin er
   gjort. Teksterne staar i js/tekst.js.

   Udloesernes bemaerkninger siges af Kemichael ({ sig } som konsekvens,
   se ../laboratoriet/js/forloeb.js): den samme saetning som et trin -
   betingelse, konsekvens, fyrer én gang - med en replik som konsekvens
   i stedet for et flag.

   Reglen, hele forsoeget hviler paa: et trin afgoeres af, hvad der staar
   paa bordet - ikke af hvilken vej eleven kom. Derfor er indgrebene
   skrevet som "glasset ser anderledes ud end referencen", ikke som "der
   blev taget en spatelspids". Tager eleven Fe(NO₃)₃ med fingrene fra et
   andet glas, taeller det ogsaa, og det er meningen. Farven er det, der
   skal laeres, saa farven er det, der proeves.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.TEKST.trin;

    var GLAS = ["glas1", "glas2", "glas3", "glas4", "glas5", "glas6", "glas7", "glas8"];

    /* Referencen skal staa der, foer en sammenligning betyder noget:
       et tomt glas er "lysere" end alt andet. */
    var REFERENCE_FYLDT = { beholder: "glas7", V: { over: 2.5 } };

    /* Et trin om et indgreb: glasset skal vaere synligt anderledes end
       glas 7. `mindst` er forskellen i lysstyrke (0-1), som oejet skal
       kunne se. */
    function anderledes(glas, retning) {
        var proev = { beholder: glas, mindst: 0.03 };
        proev[retning] = "glas7";
        return { alle: [REFERENCE_FYLDT, proev] };
    }

    function trin(id, naar, peg, saa) {
        var t = T[id];
        return { id: id, kort: t.kort, tekst: t.tekst, hint: t.hint, sig: t.sig, peg: peg, naar: naar, saa: saa };
    }

    NK.FORLOEB = {
        trin: [
            trin("fyld", { alleAf: GLAS, V: { over: 2.5 } }, "kolbe"),

            trin("glas1", anderledes("glas1", "moerkere"), "pulver_fe"),
            trin("glas2", anderledes("glas2", "lysere"), "pulver_asc"),
            trin("glas3", anderledes("glas3", "moerkere"), "pulver_kscn"),
            trin("glas4", anderledes("glas4", "lysere"), "ag"),

            /* Badene: baade at glasset staar rigtigt, og at det naaede at
               blive varmt eller koldt. Temperaturen er det, der flytter
               ligevaegten, saa temperaturen er det, der proeves. */
            trin("varme", { alle: [
                REFERENCE_FYLDT,
                { beholder: "glas5", staarI: "vandbad" },
                { beholder: "glas5", T: { over: 50 } },
                { beholder: "glas5", lysere: "glas7", mindst: 0.03 }
            ] }, "vandbad"),

            trin("kulde", { alle: [
                REFERENCE_FYLDT,
                { beholder: "glas6", staarI: "isbad" },
                { beholder: "glas6", T: { under: 10 } },
                { beholder: "glas6", moerkere: "glas7", mindst: 0.02 }
            ] }, "isbad", [{ flag: "indgreb_gjort" }]),

            /* Billedet: motoren har vidst hele tiden, hvad der skete, men det
               taeller foerst, naar eleven har set det og noteret det. Trinnet
               spoerger journalen i stedet for bordet - og journalen er ogsaa
               en tilstand, saa reglen er den samme. */
            trin("billede", { journal: "billede", faerdig: true }, "billedknap"),

            /* Oprydningen taeller foerst, naar indgrebene er lavet - ellers
               ville et tomt bord ved starten vaere "ryddet op". Flaget er
               verdenstilstanden, og det er det samme flag, en laast doer i
               spillet ville laese. */
            trin("ryd", { alle: [
                { flag: "indgreb_gjort" },
                { journal: "billede", faerdig: true },
                { alleAf: GLAS, tom: true }
            ] }, "dunk")
        ],

        udloesere: [
            /* Referencen fik et indgreb. Den skal fyre paa virkningen, ikke
               paa handlingen, saa den ogsaa fanger, at glasset blev varmet
               eller kom i isbadet. Kemichael siger det selv, stiller sig
               ved glas 7 - og det er her, glimtet om afslaget hoerer til. */
            {
                id: "roert_reference",
                naar: { alle: [
                    { beholder: "glas7", V: { over: 2.5 } },
                    { nogen: [
                        { beholder: "glas7", stof: "AgSCN(s)", over: 0.0005 },
                        { beholder: "glas7", stof: "Fe2+", over: 0.3 },
                        { beholder: "glas7", stof: "Asc", over: 0.2 },
                        { beholder: "glas7", T: { over: 30 } },
                        { beholder: "glas7", T: { under: 12 } },
                        { beholder: "glas7", V: { over: 6 } }
                    ] }
                ] },
                saa: [{ sig: NK.TEKST["sig-reference"], peg: "glas7", glimt: "afslag", udtryk: "skeptisk", slags: "advarsel" }]
            },

            /* To slags indgreb i samme glas: saa kan man ikke sige, hvad der
               virkede. Proeven er sat paa glas 1 til 4, ét ad gangen. */
            {
                id: "to_indgreb",
                naar: { nogen: ["glas1", "glas2", "glas3", "glas4"].map(function (g) {
                    return { alle: [
                        { beholder: g, V: { over: 2.5 } },
                        { beholder: g, stof: "AgSCN(s)", over: 0.0005 },
                        { beholder: g, stof: "Fe2+", over: 0.3 }
                    ] };
                }) },
                saa: [{ sig: NK.TEKST["sig-to-indgreb"], udtryk: "skeptisk", slags: "advarsel" }]
            },

            /* Er billedet fyldt ud, men et glas noteret anderledes end det ser
               ud, bliver det ikke rettet for eleven. Han bliver bedt om at
               kigge igen, og han kan selv trykke om. */
            {
                id: "kig_igen",
                naar: { alle: [
                    { journal: "billede", faerdig: true },
                    { journal: "billede", forkerte: { over: 0 } }
                ] },
                saa: [{ sig: NK.TEKST["sig-kig-igen"], udtryk: "toer", slags: "advarsel" }]
            }
        ],

        slutTekst: NK.TEKST["forloeb-slut"]
    };
}());

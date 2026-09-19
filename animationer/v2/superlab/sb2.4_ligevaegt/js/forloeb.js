/* =====================================================================
   forloeb.js - trinnene i sb2.4, skrevet som betingelser

   Motoren staar i ../../laboratoriet/js/forloeb.js og sproget i
   ../../laboratoriet/js/vilkaar.js. Her staar kun, hvornaar hvert trin er
   gjort. Teksterne staar i js/tekst.js.

   Udloesernes bemaerkninger siges af Kemichael ({ sig } som konsekvens,
   se ../../laboratoriet/js/forloeb.js): den samme saetning som et trin -
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

    /* Del 2 spoerger js/ovenfra.js, som ejer parrene og reglen for, hvad
       der taeller som fortyndet. Et vilkaar maa vaere en funktion af
       bordet, og det er den noednoedudgang, sproget har til netop det her:
       et forsoeg, der har sin egen forestilling om, hvornaar noget er
       gjort. Reglen er stadig en tilstand - parrene laeses af bordet, ikke
       af hvad eleven gjorde. */
    function parKlar(type) {
        return { proev: function (bord) { return NK.OVENFRA.parMed(type, bord) >= 0; } };
    }

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

    /* del: hvilken af forsoegets to dele trinnet hoerer til. Panelet
       foelger den del, eleven staar i (se js/app.js og `kun` i motorens
       forloeb.js); listen viser stadig alle tretten trin. */
    function trin(id, del, naar, peg, saa) {
        var t = T[id];
        return { id: id, del: del, kort: t.kort, tekst: t.tekst, hint: t.hint, sig: t.sig,
                 peg: peg, naar: naar, saa: saa };
    }

    NK.FORLOEB = {
        trin: [
            trin("fyld", 1, { alleAf: GLAS, V: { over: 2.5 } }, "kolbe"),

            trin("glas1", 1, anderledes("glas1", "moerkere"), "pulver_fe"),
            trin("glas2", 1, anderledes("glas2", "lysere"), "pulver_asc"),
            trin("glas3", 1, anderledes("glas3", "moerkere"), "pulver_kscn"),
            trin("glas4", 1, anderledes("glas4", "lysere"), "ag"),

            /* Badene: baade at glasset staar rigtigt, og at det naaede at
               blive varmt eller koldt. Temperaturen er det, der flytter
               ligevaegten, saa temperaturen er det, der proeves. */
            trin("varme", 1, { alle: [
                REFERENCE_FYLDT,
                { beholder: "glas5", staarI: "vandbad" },
                { beholder: "glas5", T: { over: 50 } },
                { beholder: "glas5", lysere: "glas7", mindst: 0.03 }
            ] }, "vandbad"),

            trin("kulde", 1, { alle: [
                REFERENCE_FYLDT,
                { beholder: "glas6", staarI: "isbad" },
                { beholder: "glas6", T: { under: 10 } },
                { beholder: "glas6", moerkere: "glas7", mindst: 0.02 }
            ] }, "isbad", [{ flag: "indgreb_gjort" }]),

            /* Billedet: motoren har vidst hele tiden, hvad der skete, men det
               taeller foerst, naar eleven har set det og noteret det. Trinnet
               spoerger journalen i stedet for bordet - og journalen er ogsaa
               en tilstand, saa reglen er den samme. */
            trin("billede", 1, { journal: "billede", faerdig: true }, "billedknap"),

            /* Oprydningen taeller foerst, naar indgrebene er lavet - ellers
               ville et tomt bord ved starten vaere "ryddet op". Flaget er
               verdenstilstanden, og det er det samme flag, en laast doer i
               spillet ville laese. */
            trin("ryd", 1, { alle: [
                { flag: "indgreb_gjort" },
                { journal: "billede", faerdig: true },
                { alleAf: GLAS, tom: true }
            ] }, "dunk", [{ flag: "del1_gjort" }]),

            /* ----- Del 2: fortyndingen ---------------------------------- */
            trin("farve", 2, parKlar("farve"), "fl_farve"),
            trin("lv", 2, parKlar("lv"), "kolbe"),
            trin("vand", 2, { proev: function (bord) { return NK.OVENFRA.beggeKlar(bord); } }, "vand"),
            trin("sml", 2, { journal: "fortynding", faerdig: true }, "ovenfraknap")
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

            /* Frugtfarve og ligevaegtsblanding i det samme glas. Saa er der
               ikke to par at sammenligne laengere, og det er den slags, han
               ikke kan lade vaere med at kommentere. */
            {
                id: "kunst",
                naar: { nogen: NK.OVENFRA.BAEGERE.map(function (navn) {
                    return { proev: function (bord) {
                        return !!bord.g[navn] && NK.OVENFRA.indholdType(bord.g[navn]) === "blanding";
                    } };
                }) },
                saa: [{ sig: NK.TEKST["sig-kunst"], udtryk: "skeptisk", slags: "advarsel" }]
            },

            /* De to glas i et par skal have lige meget stof i sig, ellers
               maaler proeven noget andet end fortyndingen. Den fyrer paa
               tallene, ikke paa handlingen: har eleven skaevt op, siges det,
               uanset hvordan glassene blev fyldt. */
            {
                id: "skaevt_op",
                naar: { nogen: ["farve", "lv"].map(function (type) {
                    return { proev: function (bord) {
                        var n = NK.OVENFRA.parMed(type, bord);
                        if (n < 0) return false;
                        var par = NK.OVENFRA.par(bord, n);
                        var a = NK.OVENFRA.maengde(par[0], type), b = NK.OVENFRA.maengde(par[1], type);
                        return a > 0 && b > 0 && Math.abs(a - b) / Math.max(a, b) > 0.15;
                    } };
                }) },
                saa: [{ sig: NK.TEKST["sig-skaevt-op"], udtryk: "skeptisk", slags: "advarsel" }]
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

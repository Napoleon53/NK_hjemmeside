/* =====================================================================
   forloeb.js - trinnene i sc2.7, skrevet som betingelser

   Motoren staar i ../../laboratoriet/js/forloeb.js og sproget i
   ../../laboratoriet/js/vilkaar.js. Her staar kun, hvornaar hvert trin er
   gjort. Teksterne staar i js/tekst.js.

   Reglen er den samme som i sb2.4: et trin afgoeres af, hvad der staar
   paa bordet - ikke af hvilken vej eleven kom. Afvejningen proeves derfor
   med vilkaaret tilsat (K3): saa meget Pb(NO3)2 og KI er kommet i glasset,
   uanset om det staar som salt, som ioner eller som PbI2(s). Hvilke
   masser der maa haeldes i, er afvejningens regel (js/maaling.js), ikke
   trinnenes.

   Maalingerne proeves i journalen, som i sb2.4's billede: det taeller
   foerst, naar eleven har noteret det.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var T = NK.TEKST.trin;

    var GLAS = "baeger";

    /* Den foerste afvejning: 0,090-0,110 g. Vilkaaret er lidt under, saa
       det, der er inden for reglens vindue, altid taeller. */
    var PB = { beholder: GLAS, tilsat: "Pb(NO3)2(s)", gram: { over: 0.089 } };
    var KI = { beholder: GLAS, tilsat: "KI(s)", gram: { over: 0.079 } };

    /* Klart glas: det spoerges js/maaling.js om, for det er ogsaa det,
       maalingen bygger paa (intet fast stof, og ikke overmaettet) */
    var KLAR = { proev: function (bord) { return NK.MAALING.klar(bord.g[GLAS]); } };

    function maalinger(n) { return { journal: "maaling", noterede: { mindst: n } }; }

    function trin(id, naar, peg, saa) {
        var t = T[id];
        return { id: id, kort: t.kort, tekst: t.tekst, hint: t.hint, sig: t.sig,
                 peg: peg, naar: naar, saa: saa };
    }

    NK.FORLOEB = {
        trin: [
            trin("vand", { beholder: GLAS, V: { over: 95 } }, "maaleglas"),
            trin("pb", PB, "pb"),
            trin("ki", KI, "ki"),
            trin("klar", { alle: [PB, KI, KLAR] }, "plade"),
            trin("maal1", maalinger(1), "maaleknap"),
            trin("maal3", maalinger(3), "pb"),

            /* Oprydningen taeller foerst efter de tre maalinger - ellers
               ville et tomt glas ved starten vaere "afleveret" */
            trin("affald", { alle: [maalinger(3), { beholder: GLAS, tom: true }] }, "dunk")
        ],

        udloesere: [
            /* Glasset er blevet klart: husk, hvad der var i det (se
               js/maaling.js). Det er historie og ikke tilstand, saa det er
               en udloeser og ikke et trin. igen: den fyrer hver gang,
               glasset bliver klart igen efter en ny tilsaetning. */
            {
                id: "husk_klar",
                igen: 0.1,
                naar: KLAR,
                saa: [{ kald: function () { NK.MAALING.husk(NK.Side.nu.bord()); } }]
            },

            /* Det koger, og bundfaldet er der stadig: mere stof, end vandet
               kan opløse. Maalingen kan ikke laves. */
            {
                id: "for_meget",
                igen: 30,
                naar: { alle: [
                    { beholder: GLAS, koger: true },
                    { beholder: GLAS, stof: "PbI2(s)", over: 0.001 }
                ] },
                saa: [{ sig: NK.TEKST["sig-for-meget"], peg: GLAS, udtryk: "skeptisk", slags: "advarsel" }]
            },

            /* Tre rigtige maalinger */
            {
                id: "tre_rigtige",
                naar: { journal: "maaling", rigtige: { mindst: 3 } },
                saa: [{ sig: NK.TEKST["sig-tre-rigtige"], udtryk: "mild", slags: "info" }]
            }
        ],

        /* husk_klar kalder kode, men koden saetter ingen flag. Det siges
           her, saa oevelsestjekket stadig kan fange et flag, ingen saetter */
        flagFraKode: [],

        slutTekst: NK.TEKST["forloeb-slut"]
    };
}());

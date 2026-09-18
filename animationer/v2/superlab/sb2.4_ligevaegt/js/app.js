/* =====================================================================
   app.js - forsoegets side

   Hele skallen (tegneloekke, panel, zoomboble, lyd, intro, rundvisning,
   tastatur, logbog, forloebskort, Start forfra) ligger i
   ../../laboratoriet/js/side.js. Her staar kun det, der er saerligt for
   dette forsoeg: billedet af de syv glas og kravet, der aabner quizzen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var side = NK.Side.start({
        navn: "sb24",
        opstilling: NK.OPSTILLING,
        valg: NK.BORD_VALG,
        tekster: NK.TEKST,
        tomTekst: NK.TEKST["glas-tom-start"],
        forloeb: NK.FORLOEB,

        /* Quizzen (../../laboratoriet/js/quiz.js) laases op, naar eleven har
           taget billedet og noteret alle syv glas. Spoergsmaalene staar i
           js/tekst.js under "quiz". */
        quiz: { krav: { journal: "billede", faerdig: true } },

        tast: function (e) {
            if (e.key === "s" || e.key === "S") { this.tagBillede(); return true; }
            return false;
        },

        efterStart: function (s) {
            /* Billedet aabnes fra panelet eller med S */
            s.tagBillede = function () {
                if (NK.el("billede").classList.contains("vis")) { NK.BILLEDE.luk(); return; }
                s.lukOverlay();
                NK.BILLEDE.aabn(s.bord(), function () {
                    /* Et nyt svar kan goere trinnet faerdigt med det samme */
                    s.forloeb.opdater();
                    s.opdaterForloeb();
                });
            };
            NK.el("billedknap").addEventListener("click", function () { s.tagBillede(); });
            NK.el("billede-luk").addEventListener("click", function () { NK.BILLEDE.luk(); });
            NK.el("billede").addEventListener("click", function (e) {
                if (e.target === this) NK.BILLEDE.luk();
            });
            NK.billede = NK.BILLEDE;
        }
    });
}());

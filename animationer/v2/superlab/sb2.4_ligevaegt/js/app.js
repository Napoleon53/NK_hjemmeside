/* =====================================================================
   app.js - forsoegets side

   Hele skallen (tegneloekke, panel, zoomboble, lyd, intro, rundvisning,
   tastatur, logbog, forloebskort, Start forfra) ligger i
   ../../laboratoriet/js/side.js. Her staar kun det, der er saerligt for
   dette forsoeg: de to dele, billedet af de syv glas, de fire glas
   ovenfra og kravet, der aabner quizzen.
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
            if (e.key === "s" || e.key === "S") { this.visning(); return true; }
            if (e.key === "1") { this.skiftDel(1); return true; }
            if (e.key === "2") { this.skiftDel(2); return true; }
            return false;
        },

        /* To ting hoerer til her. Bordet bygges op fra opstillingen igen
           ved Start forfra, og saa staar begge deles udstyr fremme.
           Og det skift til del 2, forloebet beder om, naar der er ryddet
           op, venter, til haanden er tom - ellers ville det, der er i
           gang, forsvinde under sig selv. */
        vedAendring: function (grund) {
            if (grund === "nulstil") {
                this.venterPaaDel2 = false;
                NK.DELE.nulstil(this.bord());
                if (this.visDel) this.visDel();
                return;
            }
            if (this.venterPaaDel2 && NK.DELE.kanSkifte(this.bord())) {
                this.venterPaaDel2 = false;
                if (this.skiftDel) this.skiftDel(2, true);
            }
        },

        efterStart: function (s) {
            /* ----- De to dele ------------------------------------------- */
            s.skiftDel = function (n, stille) {
                if (NK.DELE.nu() === n) return;
                if (!NK.DELE.kanSkifte(s.bord())) {
                    if (!stille) s.bord().besked("Vent, til det, der er i gang, er færdigt.");
                    return;
                }
                s.lukOverlay();
                NK.BILLEDE.luk();
                NK.OVENFRA.luk();
                if (NK.DELE.saet(s.bord(), n, stille)) s.visDel();
            };
            s.visDel = function () {
                var n = NK.DELE.nu();
                [1, 2].forEach(function (i) {
                    var k = NK.el("del" + i + "knap");
                    if (k) k.setAttribute("aria-pressed", i === n ? "true" : "false");
                });
                NK.el("billedknap").hidden = n !== 1;
                NK.el("ovenfraknap").hidden = n !== 2;
                s.opdaterForloeb();
            };
            /* Panelet viser det trin, eleven kan gaa i gang med HER. Listen
               viser stadig alle tretten, saa hele forsoeget kan ses. */
            s.forloeb.kun = function (t) { return !t.del || t.del === NK.DELE.nu(); };
            [1, 2].forEach(function (i) {
                NK.el("del" + i + "knap").addEventListener("click", function () { s.skiftDel(i); });
            });
            NK.DELE.anvend(s.bord());
            s.visDel();

            /* ----- Billedet og visningen ovenfra ------------------------- */
            function efterSvar() {
                /* Et nyt svar kan goere trinnet faerdigt med det samme */
                s.forloeb.opdater();
                s.opdaterForloeb();
                s.opdaterPanel();
            }

            s.tagBillede = function () {
                if (NK.el("billede").classList.contains("vis")) { NK.BILLEDE.luk(); return; }
                s.lukOverlay();
                NK.BILLEDE.aabn(s.bord(), efterSvar);
            };
            s.seOvenfra = function () {
                if (NK.el("ovenfra").classList.contains("vis")) { NK.OVENFRA.luk(); return; }
                s.lukOverlay();
                NK.OVENFRA.aabn(s.bord(), efterSvar);
            };
            /* Tasten S viser den visning, delen hoerer til */
            s.visning = function () {
                if (NK.DELE.nu() === 2) s.seOvenfra(); else s.tagBillede();
            };

            NK.el("billedknap").addEventListener("click", function () { s.tagBillede(); });
            NK.el("billede-luk").addEventListener("click", function () { NK.BILLEDE.luk(); });
            NK.el("billede").addEventListener("click", function (e) {
                if (e.target === this) NK.BILLEDE.luk();
            });
            NK.el("ovenfraknap").addEventListener("click", function () { s.seOvenfra(); });
            NK.el("ovenfra-luk").addEventListener("click", function () { NK.OVENFRA.luk(); });
            NK.el("ovenfra").addEventListener("click", function (e) {
                if (e.target === this) NK.OVENFRA.luk();
            });

            NK.billede = NK.BILLEDE;
            NK.ovenfra = NK.OVENFRA;

            /* Del 1 er forbi, naar der er ryddet op. Saa kommer de fire
               baegerglas frem af sig selv - eleven skal ikke gaette, at der
               er en knap. Skiftet venter, til haanden er tom (vedAendring).
               Tilbage til del 1 kan man altid. */
            s.forloeb.vedFlag = function (navn, sat) {
                if (navn === "del1_gjort" && sat && NK.DELE.nu() === 1) s.venterPaaDel2 = true;
            };
        }
    });
}());

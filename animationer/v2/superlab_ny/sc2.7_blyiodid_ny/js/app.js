/* =====================================================================
   app.js - forsoegets side

   Hele skallen (tegneloekke, panel, zoomboble, lyd, intro, rundvisning,
   tastatur, logbog, forloebskort, Start forfra) ligger i
   ../../laboratoriet/js/side.js. Her staar kun det, der er saerligt for
   sc2.7: afvejningens regel, knappen »Notér temperatur« og kortet med
   maalingerne (js/maaling.js).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.MAALING;

    NK.Side.start({
        navn: "sc27",
        opstilling: NK.OPSTILLING,
        valg: NK.BORD_VALG,
        tekster: NK.TEKST,
        tomTekst: NK.TEKST["glas-tom-start"],
        forloeb: NK.FORLOEB,

        /* Kortet »Sagt i laboratoriet« (S13): forloebets replikker og
           Kemichaels uheld og advarsler */
        historik: ["spild", "voldsom", "affald", "forurenet"],

        /* K noterer temperaturen */
        tast: function (e) {
            if (e.key === "k" || e.key === "K") { this.noterTemperatur(); return true; }
            return false;
        },

        /* Start forfra: maalingernes hukommelse (sidst klart, afvejningen)
           ryddes med bordet. Journalen ryddes af forloebet. */
        vedAendring: function (grund) {
            if (grund === "nulstil") M.nulstil();
        },

        /* Panelet tegnes om, naar knappen skifter mellem klar og ikke
           klar (krystallerne kommer, uden at eleven har roert noget), og
           naar der er noteret */
        signatur: function (s) {
            return (M.kan(s.bord()).ok ? "k" : "-") + M.journal.antal();
        },

        /* Panelet: maalingerne og om knappen kan bruges lige nu */
        panel: function (s) {
            M.visKort();
            var knap = NK.el("maaleknap");
            if (knap) knap.classList.toggle("klar", M.kan(s.bord()).ok);
        },

        efterStart: function (s) {
            /* Afvejningens regel: vejebaaden haeldes kun i bægerglasset,
               naar massen passer (js/maaling.js) */
            s.bord().regel = function (gg, c) { return M.regel(gg, c, this); };

            s.noterTemperatur = function () {
                if (NK.Rundvisning.aktiv() || document.querySelector(".overlay.vis")) return;
                if (M.noter(s.bord())) {
                    /* En ny maaling kan goere et trin gjort med det samme */
                    s.forloeb.opdater();
                    s.opdaterForloeb();
                }
                s.opdaterPanel();
            };
            NK.el("maaleknap").addEventListener("click", function () { s.noterTemperatur(); });
            s.opdaterPanel();
        }
    });
}());

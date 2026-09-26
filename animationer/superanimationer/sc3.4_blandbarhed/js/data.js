/* =====================================================================
   data.js - stofferne, kraefterne mellem molekylerne og teksterne

   Kemien er data her. Modellen (js/model.js) ved ikke, hvilke stoffer
   der kan blandes: det foelger af BINDING. Taethederne og kogepunkterne
   er tabelvaerdier; kilderne staar ved tallene.
   ===================================================================== */
var NK = window.NK || {};
window.NK = NK;

(function () {
    "use strict";

    var D = {};
    NK.Data = D;

    /* ------------------------------------------------------------------
       DE TRE STOFFER

       taethed  g/mL ved 20 °C (Databogen; madolie er rapsolie, 0,91-0,92)
       kp       kogepunkt i °C ved 1 atm (Databogen). Olie har intet: den
                koger ikke, foer den brydes ned (over 300 °C)
       dHvap    fordampningsvarme ved kogepunktet, kJ/mol (Databogen)
       farve    kuglens farve; den samme som i den gamle c3.4
       ------------------------------------------------------------------ */
    D.STOFFER = [
        {
            id: "vand", navn: "vand", Navn: "Vand", formel: "H₂O",
            polaer: true, taethed: 0.998, kp: 100.0, dHvap: 40.7,
            farve: "#3b82f6", lys: "#9cc3ff", moerk: "#1d4ed8"
        },
        {
            id: "ethanol", navn: "ethanol", Navn: "Ethanol", formel: "C₂H₅OH",
            polaer: true, taethed: 0.789, kp: 78.3, dHvap: 38.6,
            farve: "#d946ef", lys: "#f0a6fb", moerk: "#a21caf"
        },
        {
            id: "olie", navn: "olie", Navn: "Olie", formel: "fedtstof",
            polaer: false, taethed: 0.92, kp: null, dHvap: null,
            farve: "#fbbf24", lys: "#fde68a", moerk: "#b45309"
        }
    ];

    D.nr = function (id) {
        for (var i = 0; i < D.STOFFER.length; i++) if (D.STOFFER[i].id === id) return i;
        return -1;
    };

    /* ------------------------------------------------------------------
       KRAEFTERNE MELLEM MOLEKYLERNE

       Hvor godt to naboer holder fast i hinanden, i modellens enheder
       (kT er 0,22 ved 20 °C). Vaerdierne er valgt, ikke maalt: kun
       raekkefoelgen er kemi.
         hydrogenbindinger   vand-vand, vand-ethanol, ethanol-ethanol
         London-kraefter     olie-olie
         polaer mod upolaer  svagt: der er intet at binde til
       To stoffer kan blandes, naar de holder lige saa godt fast i
       hinanden som i sig selv: B(a,a) + B(b,b) - 2 B(a,b) er ikke over 0.
       ------------------------------------------------------------------ */
    D.BINDING = [
        /*            vand  ethanol  olie */
        /* vand    */ [1.00, 0.95,   0.20],
        /* ethanol */ [0.95, 0.80,   0.45],
        /* olie    */ [0.20, 0.45,   0.60]
    ];

    D.blandbar = function (a, b) {
        var B = D.BINDING;
        return B[a][a] + B[b][b] - 2 * B[a][b] <= 0.05;
    };

    /* ------------------------------------------------------------------
       TAETHEDEN AF EN BLANDING AF VAND OG ETHANOL

       Maalt ved 20 °C (CRC Handbook of Chemistry and Physics,
       "Concentrative properties of aqueous solutions: ethanol").
       Indeks er masseprocent ethanol i trin paa 10.
       Blandingen er tungere, end rumfangene tilsiger: den trækker sig
       lidt sammen. Derfor svaever olien foerst i en blanding med lidt
       over halvdelen ethanol (regnet i det, der er haeldt i).
       ------------------------------------------------------------------ */
    D.VAND_ETHANOL = [0.9982, 0.9819, 0.9686, 0.9538, 0.9352, 0.9139, 0.8911, 0.8676, 0.8434, 0.8180, 0.7893];

    /* Taetheden af en fase ud fra, hvor mange kugler af hvert stof der er
       i den. En kugle er et fast rumfang af det rene stof, som det blev
       haeldt i. */
    D.faseTaethed = function (antal) {
        var iv = D.nr("vand"), ie = D.nr("ethanol");
        var i, v = 0, masse = 0, andre = 0;
        for (i = 0; i < antal.length; i++) {
            if (!antal[i]) continue;
            v += antal[i];
            masse += antal[i] * D.STOFFER[i].taethed;
            if (i !== iv && i !== ie) andre += antal[i];
        }
        if (!v) return 0;
        if (andre === 0 && antal[iv] && antal[ie]) {
            var me = antal[ie] * D.STOFFER[ie].taethed;
            var w = me / (me + antal[iv] * D.STOFFER[iv].taethed) * 10;
            var j = Math.min(9, Math.floor(w));
            return D.VAND_ETHANOL[j] + (D.VAND_ETHANOL[j + 1] - D.VAND_ETHANOL[j]) * (w - j);
        }
        return masse / v;
    };

    /* Damptryk i atm efter Clausius-Clapeyron ud fra kogepunktet og
       fordampningsvarmen. Et stof koger, naar damptrykket naar 1 atm. */
    D.damptryk = function (stof, T) {
        if (stof.kp === null) return 0;
        var R = 8.314e-3;
        return Math.exp(-stof.dHvap / R * (1 / (T + 273.15) - 1 / (stof.kp + 273.15)));
    };

    /* En portion er 120 kugler: tre raekker i bassinet. Bassinet rummer elleve. */
    D.PORTION = 120;
    D.PORTION_ML = 10;
}());

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
       M        molar masse, g/mol. Bruges til molbroeken i damptrykket
       farve    kuglens farve; den samme som i den gamle c3.4
       ------------------------------------------------------------------ */
    D.STOFFER = [
        {
            id: "vand", navn: "vand", Navn: "Vand", formel: "H₂O",
            polaer: true, taethed: 0.998, kp: 100.0, dHvap: 40.7, M: 18.02,
            farve: "#3b82f6", lys: "#9cc3ff", moerk: "#1d4ed8"
        },
        {
            id: "ethanol", navn: "ethanol", Navn: "Ethanol", formel: "C₂H₅OH",
            polaer: true, taethed: 0.789, kp: 78.3, dHvap: 38.6, M: 46.07,
            farve: "#d946ef", lys: "#f0a6fb", moerk: "#a21caf"
        },
        {
            id: "olie", navn: "olie", Navn: "Olie", formel: "fedtstof",
            polaer: false, taethed: 0.92, kp: null, dHvap: null, M: null,
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

    /* ------------------------------------------------------------------
       DAMPTRYKKET OVER EN BLANDING AF VAND OG ETHANOL

       Raoults lov med aktivitetskoefficienter: partialtrykket af et stof
       er x · γ · p*, hvor x er molbroeken i vaesken og p* damptrykket af
       det rene stof. γ regnes med van Laars ligning med de gængse
       konstanter for ethanol (1) og vand (2) ved 1 atm, A12 = 1,68 og
       A21 = 0,92. Sammen med damptrykket nedenfor rammer det de maalte
       kogepunkter inden for en halv grad: molbroek 0,07 ethanol koger ved
       88,5 °C (maalt 89,0), 0,24 ved 82,5 °C (maalt 82,7), og dampen over
       0,24 har molbroeken 0,55 (maalt 0,54). Lige dele (rumfang) koger
       altsaa ved ca. 83 °C, og dampen har omtrent fire gange saa meget
       ethanol som vand (regnet i rumfang). Ved ca. 0,9 ethanol har dampen
       samme sammensaetning som vaesken: derfor kan man ikke destillere
       sig til ren ethanol.

       antal  kugler af hvert stof i vaesken. En kugle er et fast rumfang,
              saa molbroeken regnes med taethed og molar masse.
       Svaret: flygtig[i] = γ · p* for stof i (atm), og P = summen af
       partialtrykkene. Blandingen koger, naar P naar 1 atm.
       ------------------------------------------------------------------ */
    D.VAN_LAAR = { ethanol: 1.6798, vand: 0.9227 };

    D.flygtighed = function (antal, T) {
        var iv = D.nr("vand"), ie = D.nr("ethanol");
        var mol = [], sum = 0, i;
        for (i = 0; i < D.STOFFER.length; i++) {
            var s = D.STOFFER[i];
            mol[i] = s.M && antal[i] ? antal[i] * s.taethed / s.M : 0;
            sum += mol[i];
        }
        var ud = { flygtig: [], P: 0 };
        var ge = 1, gv = 1;
        if (mol[iv] > 0 && mol[ie] > 0) {
            var xe = mol[ie] / (mol[ie] + mol[iv]), xv = 1 - xe;
            var A12 = D.VAN_LAAR.ethanol, A21 = D.VAN_LAAR.vand;
            var n = A12 * xe + A21 * xv;
            ge = Math.exp(A12 * Math.pow(A21 * xv / n, 2));
            gv = Math.exp(A21 * Math.pow(A12 * xe / n, 2));
        }
        for (i = 0; i < D.STOFFER.length; i++) {
            var g = i === ie ? ge : (i === iv ? gv : 1);
            ud.flygtig[i] = g * D.damptryk(D.STOFFER[i], T);
            if (sum > 0) ud.P += mol[i] / sum * ud.flygtig[i];
        }
        return ud;
    };

    /* En portion er 120 kugler: tre raekker i bassinet. Bassinet rummer elleve. */
    D.PORTION = 120;
    D.PORTION_ML = 10;
}());

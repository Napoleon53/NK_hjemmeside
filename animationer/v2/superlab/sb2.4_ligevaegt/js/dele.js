/* =====================================================================
   dele.js - del 1 og del 2 paa det samme bord

   Forsoeget har to dele, og de bruger hver sit udstyr: del 1 stativet
   med de otte reagensglas, badene og pulverglassene, del 2 de fire
   baegerglas og frugtfarven. Der er ikke plads til begge dele paa ét
   bord paa 1040, og der skal heller ikke vaere det: et rigtigt bord har
   det fremme, man arbejder med.

   Derfor staar delen paa genstanden. Hver post i opstillingen kan have
   et `del` (1 eller 2); det, der bruges i begge dele - affaldet, kolben,
   koekkenrullen og sproejteflasken - har intet og staar hele tiden.
   Herfra saettes motorens `skjult` paa den anden dels ting, og saa er de
   vaek for tegningen, for musen, for slipmaalet og for zoomboblen paa én
   gang. Ingen ny mekanik: det er den samme `skjult`, et knust glas
   bruger.

   Det, der er knust, bliver ved med at vaere knust. Og der skiftes ikke
   midt i en handling - saa ville det, haanden baerer, forsvinde under
   den.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var nu = 1;

    /* Skjul den anden dels ting. Kaldes ogsaa efter Start forfra, hvor
       bordet er bygget op fra opstillingen igen. */
    function anvend(bord) {
        if (!bord) return;
        bord.liste.forEach(function (gg) {
            if (gg.knust) return;
            var d = gg.spec && gg.spec.del;
            gg.skjult = !!(d && d !== nu);
        });
        if (bord.valgt && bord.g[bord.valgt] && bord.g[bord.valgt].skjult) bord.vaelg(null);
        bord.ordnDybde();
        bord.aendret("del");
    }

    /* Der skiftes ikke midt i en handling: saa ville det, haanden baerer,
       forsvinde under den. */
    function kanSkifte(bord) {
        return !!bord && !bord.baerer && !bord.holdt && !bord.koer.igang();
    }

    /* Returnerer true, hvis der blev skiftet. stille: ingen lyd og ingen
       besked, naar der ikke kan skiftes (til det skift, forloebet selv
       beder om, naar del 1 er forbi). */
    function saet(bord, n, stille) {
        n = n === 2 ? 2 : 1;
        if (!bord || n === nu) return false;
        if (!kanSkifte(bord)) {
            if (!stille) bord.besked("Vent, til det, der er i gang, er færdigt.");
            return false;
        }
        nu = n;
        anvend(bord);
        if (!stille && NK.Lyd && NK.Lyd.papir) NK.Lyd.papir();
        return true;
    }

    NK.DELE = {
        ANTAL: 2,
        nu: function () { return nu; },
        kanSkifte: kanSkifte,
        saet: saet,
        anvend: anvend,
        /* Start forfra begynder altid i del 1 */
        nulstil: function (bord) { nu = 1; anvend(bord); }
    };
}());

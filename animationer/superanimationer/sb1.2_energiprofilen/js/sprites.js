/* =====================================================================
   sprites.js - SVG-figurerne i sprites/ (vandbadet i to lag,
   baegerglasset og termometeret)

   Hentes med <img>, ikke med fetch, saa de ogsaa virker fra harddisken.
   Er en fil ikke klar endnu, springes den over i det billede.
   Koordinaterne staar i kommentaren oeverst i hver SVG-fil og bruges i
   js/sim_temp.js og js/tegning.js. _sprites.html viser figurerne alene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var FILER = {
        vandbad_bag: { b: 320, h: 300 },
        vandbad_for: { b: 320, h: 300 },
        baegerglas: { b: 130, h: 176 },
        termometer: { b: 26, h: 250 }
    };
    var lager = {};

    NK.Sprites = {
        FILER: FILER,
        start: function () {
            Object.keys(FILER).forEach(function (navn) {
                if (lager[navn]) return;
                var p = lager[navn] = { img: new Image(), klar: false };
                p.img.addEventListener("load", function () { p.klar = true; });
                p.img.src = "sprites/" + navn + ".svg";
            });
        },
        klar: function (navn) { return !!(lager[navn] && lager[navn].klar); },
        /* Tegner figuren med oeverste venstre hjoerne i (x, y) og skalaen k */
        tegn: function (c, navn, x, y, k) {
            var p = lager[navn], f = FILER[navn];
            if (!p || !p.klar) return false;
            c.drawImage(p.img, x, y, f.b * k, f.h * k);
            return true;
        }
    };
}());

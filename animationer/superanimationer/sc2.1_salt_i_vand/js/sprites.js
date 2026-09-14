/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   Maalene i MAAL er de koordinater, der staar i kommentaren oeverst i
   hver SVG-fil. Aendres en fil, skal tallene her foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";
    var FILER = {
        baegerglas: "baegerglas.svg",
        varmeplade: "varmeplade.svg",
        termometer: "termometer.svg",
        spatel:     "spatel.svg",
        pulverglas: "pulverglas.svg",
        lup:        "lup.svg"
    };

    function indlaes(navn, fil) {
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sc2.1: kunne ikke indlaese " + MAPPE + fil);
        });
        post.img.src = MAPPE + fil;
    }

    NK.Sprites = {
        MAAL: {
            baegerglas: { b: 200, h: 240, indV: 21, indH: 179, bund: 229, ml100: 108, mlPrEnhed: 1 / 1.2 },
            varmeplade: { b: 240, h: 64, pladeV: 12, pladeH: 228, pladeTop: 0, pladeBund: 9,
                          lampeVarme: [36, 36], lampeRoer: [204, 36], lampeR: 4 },
            termometer: { b: 24, h: 200, soejleV: 11, soejleH: 13, soejleBund: 180, nul: 164, hundrede: 24 },
            spatel:     { b: 160, h: 40, bladX: 22, bladY: 20 },
            pulverglas: { b: 90, h: 110, pulverV: 10, pulverH: 80, pulverTop: 80, pulverBund: 106, etiketX: 45, etiketY: 63 },
            lup:        { b: 140, h: 140, linseX: 52, linseY: 52, linseR: 38 }
        },

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn)) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        /* Tegner spritet med oeverste venstre hjoerne i (x, y) og bredden b.
           Hoejden foelger af filens eget forhold. */
        tegn: function (ctx, navn, x, y, b) {
            var p = lager[navn];
            if (!p || !p.klar) return false;
            var m = NK.Sprites.MAAL[navn];
            ctx.drawImage(p.img, x, y, b, b * m.h / m.b);
            return true;
        }
    };

    NK.Sprites.start();
}());

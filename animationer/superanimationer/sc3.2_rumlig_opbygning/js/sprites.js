/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Mangler en fil, tegner
   model3d.js en simpel reservefigur, saa animationen aldrig gaar i staa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    /* Navn: fil og stoerrelse i tegneenheder (viewBox). */
    var FILER = {
        atom_C:          { fil: "atom_c.svg", b: 128, h: 128 },
        atom_H:          { fil: "atom_h.svg", b: 128, h: 128 },
        atom_O:          { fil: "atom_o.svg", b: 128, h: 128 },
        atom_N:          { fil: "atom_n.svg", b: 128, h: 128 },
        atom_Cl:         { fil: "atom_cl.svg", b: 128, h: 128 },
        atom_ukendt:     { fil: "atom_ukendt.svg", b: 128, h: 128 },
        elektronpar:     { fil: "elektronpar.svg", b: 64, h: 110 },
        ballon_bindende: { fil: "ballon_blaa.svg", b: 80, h: 130 },
        ballon_fri:      { fil: "ballon_gul.svg", b: 80, h: 130 },
        vinkelmaaler:    { fil: "vinkelmaaler.svg", b: 64, h: 38 }
    };

    /* Ankerpunkter i spritets egne enheder. */
    NK.ANKER = {
        elektronpar: { x: 32, y: 108, top: 3 },   /* spids ved atomet, top af wolken */
        ballon:      { x: 40, y: 128, top: 4 }    /* knude i midten, top af ballonen */
    };

    function indlaes(navn, f) {
        var sti = MAPPE + f.fil;
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sc3.2: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        FILER: FILER,

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn)) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        alleKlar: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn) && !(lager[navn] && (lager[navn].klar || lager[navn].fejlet))) return false;
            }
            return true;
        },

        /* Billedet, hvis det er indlaest, ellers null. */
        billede: function (navn) {
            var p = lager[navn];
            return p && p.klar ? p.img : null;
        },

        sti: function (navn) {
            return MAPPE + FILER[navn].fil;
        }
    };
}());

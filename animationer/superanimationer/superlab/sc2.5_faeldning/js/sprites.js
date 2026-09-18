/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/
   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Mangler en fil, tegnes
   en simpel reservefigur, saa animationen aldrig gaar i staa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";
    var FILER = {
        flaske:      "draabeflaske.svg",
        stativ:      "stativ.svg",
        stativLille: "stativ_lille.svg",
        lomme:       "plastiklomme.svg",
        lup:         "lup.svg",
        papir:       "papir.svg",
        laerer:      "laerer.svg"
    };

    function indlaes(navn, fil) {
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sc2.5: kunne ikke indlaese " + MAPPE + fil);
        });
        post.img.src = MAPPE + fil;
    }

    NK.Sprites = {
        NAVNE: Object.keys(FILER),

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn)) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        /* Tegner spritet med oeverste venstre hjoerne i (x, y). */
        tegn: function (ctx, navn, x, y, b, h, reserve) {
            var p = lager[navn];
            if (p && p.klar) {
                ctx.drawImage(p.img, x, y, b, h);
                return true;
            }
            if (reserve) {
                ctx.save();
                ctx.fillStyle = reserve;
                ctx.globalAlpha = 0.5;
                NK.rundtRekt(ctx, x, y, b, h, 8);
                ctx.fill();
                ctx.restore();
            }
            return false;
        }
    };
}());

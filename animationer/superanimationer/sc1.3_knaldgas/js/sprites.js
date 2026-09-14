/* =====================================================================
   sprites.js - indlaeser og tegner SVG-sprites fra mappen sprites/
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
        flaskeH2:  "trykflaske_h2.svg",
        flaskeO2:  "trykflaske_o2.svg",
        maaleglas: "maaleglas.svg",
        vandbad:   "vandbad.svg",
        braender:  "braender.svg"
    };

    function indlaes(navn, fil) {
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sc1.3: kunne ikke indlaese " + MAPPE + fil);
        });
        post.img.src = MAPPE + fil;
    }

    NK.Sprites = {
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

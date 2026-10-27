/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/ (som sb4.9)

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   MAAL er filernes stoerrelse; koordinaterne inde i filerne staar i
   kommentaren oeverst i hver SVG-fil og bruges i js/tegning.js.
   _sprites.html viser dem alle alene. Flasken er den samme som i
   sb4.9_salenvir.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};
    var MAPPE = "sprites/";

    var MAAL = {
        kar_bag: { b: 240, h: 300 },
        kar_for: { b: 240, h: 300 },
        laag: { b: 252, h: 34 },
        flaske_klar: { b: 100, h: 210 }
    };

    function indlaes(navn) {
        var sti = MAPPE + navn + ".svg";
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sb8.6: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        MAAL: MAAL,

        start: function () {
            Object.keys(MAAL).forEach(function (navn) { if (!lager[navn]) indlaes(navn); });
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        alleKlar: function () {
            return Object.keys(MAAL).every(function (n) { return lager[n] && lager[n].klar; });
        },

        /* Tegner spritet i rektanglet (x, y, b, h). Uden h bevares forholdet. */
        tegn: function (ctx, navn, x, y, b, h) {
            var p = lager[navn], f = MAAL[navn];
            if (!p || !p.klar || !f) return false;
            if (h === undefined) h = b * f.h / f.b;
            ctx.drawImage(p.img, x, y, b, h);
            return true;
        }
    };
}());

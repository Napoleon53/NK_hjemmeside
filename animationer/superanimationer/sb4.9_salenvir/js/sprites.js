/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/ (som sc7.5)

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   MAAL er filernes stoerrelse; koordinaterne inde i filerne staar i
   kommentaren oeverst i hver SVG-fil og bruges i js/sim.js.
   _sprites.html viser dem alle alene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};
    var MAPPE = "sprites/";

    var MAAL = {
        stativ: { b: 220, h: 420 },
        kolbe: { b: 150, h: 200 },
        varmeplade: { b: 240, h: 64 },
        termometer: { b: 60, h: 250 },
        bold: { b: 44, h: 62 },
        flaske_brun: { b: 80, h: 150 },
        flaske_klar: { b: 100, h: 210 },
        maaleglas100: { b: 60, h: 260 },
        vial: { b: 40, h: 80 },
        baegerglas: { b: 200, h: 240 },
        uvlampe: { b: 180, h: 170 },
        isbad_bag: { b: 210, h: 92 },
        isbad_for: { b: 210, h: 92 },
        sugekolbe: { b: 150, h: 200 },
        buechner: { b: 130, h: 132 },
        vakuumhane: { b: 100, h: 130 },
        sproejteflaske: { b: 110, h: 130 },
        urglas: { b: 220, h: 84 },
        spatel: { b: 160, h: 40 },
        vaegt: { b: 240, h: 130 },
        varmelampe: { b: 190, h: 300 },
        smeltepunkt: { b: 240, h: 180 }
    };

    function indlaes(navn) {
        var sti = MAPPE + navn + ".svg";
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sb4.9: kunne ikke indlaese " + sti);
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

        /* Tegner spritet med oeverste venstre hjoerne i (x, y) i skalaen s */
        tegn: function (ctx, navn, x, y, s) {
            var p = lager[navn], f = MAAL[navn];
            if (!p || !p.klar || !f) return false;
            s = s || 1;
            ctx.drawImage(p.img, x, y, f.b * s, f.h * s);
            return true;
        }
    };
}());

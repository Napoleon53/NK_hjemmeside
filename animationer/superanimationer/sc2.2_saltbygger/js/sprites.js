/* =====================================================================
   sprites.js - indlaeser Kemichaels sprites

   Saltbyggeren har ingen egne sprites i laerredet (baegerglasset hentes
   direkte af sim_vand.js). Filen findes, fordi Kemichael
   (../../v2/kemichael/kemichael.js) laegger sine sprites i
   NK.Sprites.FILER med sin egen mappe og tegner dem med tegnPositur.
   Samme opbygning som i sc2.1.

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken. Indlaesningen startes fra app.js,
   efter at kemichael.js har lagt sine filer i listen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};
    var FILER = {};

    function indlaes(navn, f) {
        var sti = (f.mappe || "sprites/") + f.fil;
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sc2.2: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        FILER: FILER,

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn) && !lager[navn]) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        tegn: function (ctx, navn, x, y, b, h) {
            var p = lager[navn], f = FILER[navn];
            if (!p || !p.klar || !f) return false;
            if (b === undefined) b = f.b;
            if (h === undefined) h = b * f.h / f.b;
            ctx.drawImage(p.img, x, y, b, h);
            return true;
        },

        /* Tegner spritet drejet om ankerpunktet, der staar i positur p. */
        tegnPositur: function (ctx, navn, p, anker, alfa, skala) {
            var f = FILER[navn];
            if (!f) return;
            var k = skala || 1;
            ctx.save();
            if (alfa !== undefined) ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.v);
            ctx.scale(k, k);
            NK.Sprites.tegn(ctx, navn, -anker.x, -anker.y, f.b, f.h);
            ctx.restore();
        }
    };
}());

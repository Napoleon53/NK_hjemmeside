/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   sc7.1 har ingen egne sprites: molekylerne, tavlen og brikkerne
   tegnes i js/tegning.js. ../../v2/kemichael/kemichael.js tilfoejer
   laererens sprites (og kaffekoppen) med deres egen mappe, derfor
   startes indlaesningen foerst fra app.js. (Samme fil som i sc6.6;
   MAAL er tom.)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {};

    var FILER = {};
    Object.keys(MAAL).forEach(function (navn) {
        FILER[navn] = { fil: navn + ".svg", b: MAAL[navn].b, h: MAAL[navn].h };
    });

    /* Har en post sin egen mappe, hentes filen derfra. */
    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sc7.1: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        FILER: FILER,
        MAAL: MAAL,

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn) && !lager[navn]) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        /* Tegner spritet med oeverste venstre hjoerne i (x, y). Uden h
           foelger hoejden af filens eget forhold; uden b bruges filens
           egen stoerrelse. */
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

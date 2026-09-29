/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites (og
   kaffekoppen) med deres egen mappe, derfor startes indlaesningen foerst
   fra app.js.

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med. _sprites.html
   viser dem alle alene. De tre billeder til det gratis gaet
   (gaet_*.svg) vises som <img> i kortene og hentes ikke her.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Vaegten (som sc4.5 og sc4.11) */
        vaegt: { b: 240, h: 130, skaalX: 120, skaalY: 13, skaalB: 156, dispV: 72, dispH: 168, dispTop: 68, dispBund: 94, bund: 128 },
        /* Bunsenbraenderen (som sc4.7): mundingen (40, 18), slangens ende (1, 184),
           bunden y 186. Den drejes om grebet (40, 100), naar den holdes vandret. */
        bunsen: { b: 80, h: 190, mundX: 40, mundY: 18, bund: 186, grebX: 40, grebY: 100, slangeX: 1, slangeY: 184 },
        /* Iltflasken: udtaget (15, 21), haandhjulet (40, 10), bunden y 218 */
        iltflaske: { b: 80, h: 220, bund: 218, udtagX: 15, udtagY: 21, hjulX: 40, hjulY: 10 },
        /* Stjernekasteren (paaskeaegget): spidsen (20, 5), bunden y 158 */
        stjernekaster: { b: 40, h: 160, bund: 158, spidsX: 20, spidsY: 5 },
        /* Luppen (som sc2.1) */
        lup: { b: 140, h: 140, midtX: 52, midtY: 52, r: 38 },
        /* Kemichaels kateder (som sc4.5) */
        kateder: { b: 300, h: 130, flade: 22, pladeTop: 18, front: 32, laerer: 80, kop: 150 }
    };

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
            if (window.console) console.warn("sc4.8: kunne ikke indlaese " + sti);
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

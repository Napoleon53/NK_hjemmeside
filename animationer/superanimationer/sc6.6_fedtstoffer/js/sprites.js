/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   Alle sprites er tegnet til sc6.6.
   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites (og
   kaffekoppen) med deres egen mappe, derfor startes indlaesningen
   foerst fra app.js. (Samme fil som i sc6.1; kun MAAL er ny.)

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Koeleskabet med fryseren: de to rum og hylderne, glassene staar paa */
        koeleskab: { b: 220, h: 520, rumV: 24, rumH: 196, fryserTop: 30, fryserGulv: 196,
                     koeleTop: 226, koeleGulv: 402, bund: 516 },
        /* Vinduet: karmen og solen */
        vindue: { b: 240, h: 340, karmV: 4, karmH: 236, karmY: 306, solX: 178, solY: 62 },
        /* Glasset: det indre, laaget og etiketten */
        glas: { b: 60, h: 84, indV: 8, indH: 52, indTop: 17, indBund: 79, indR: 8,
                laagTop: 1, laagBund: 13, etiketTop: 44, etiketBund: 62, bund: 82 }
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
            if (window.console) console.warn("sc6.6: kunne ikke indlaese " + sti);
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

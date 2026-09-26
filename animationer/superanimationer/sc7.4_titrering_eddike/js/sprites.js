/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/ (som sc7.2)

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites (og
   kaffekoppen) med deres egen mappe, derfor startes indlaesningen foerst
   fra app.js.

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med. _sprites.html
   viser dem alle alene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        buret: { b: 40, h: 600, indV: 14, indH: 26, top: 8, nulY: 40, prML: 18, roerBund: 522,
                 hane: { x: 20, y: 533 }, spids: { x: 20, y: 596 } },
        kolbe: { b: 150, h: 200, halsV: 60, halsH: 90, halsBund: 62, bundY: 192, bundV: 15, bundH: 135, top: 4 },
        omroerer: { b: 170, h: 50, plade: 5, pladeV: 12, pladeH: 158, bund: 49 },
        eddike: { b: 70, h: 150, etiketV: 10, etiketH: 60, etiketTop: 78, etiketBund: 112, bund: 148 },
        sproejteflaske: { b: 110, h: 130, dyse: { x: 8, y: 34 }, bund: 128 }
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
            if (window.console) console.warn("sc7.4: kunne ikke indlaese " + sti);
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

        /* Tegner spritet med midten i (x, y), drejet v og i bredden b
           (bruges af Kemichael) */
        tegnMidt: function (ctx, navn, x, y, b, v) {
            var f = FILER[navn];
            if (!f) return false;
            var h = b * f.h / f.b;
            if (!v) return NK.Sprites.tegn(ctx, navn, x - b / 2, y - h / 2, b, h);
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(v);
            var ud = NK.Sprites.tegn(ctx, navn, -b / 2, -h / 2, b, h);
            ctx.restore();
            return ud;
        },

        /* Tegner spritet drejet om ankerpunktet, der staar i positur p
           (bruges af Kemichael) */
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

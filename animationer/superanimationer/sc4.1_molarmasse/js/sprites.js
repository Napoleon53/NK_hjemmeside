/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites (og
   kaffekoppen) med deres egen mappe, derfor startes indlaesningen
   foerst fra app.js.

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Den digitale vaegt: skaalens overflade og displayet */
        vaegt: { b: 240, h: 130, skaalX: 120, skaalY: 13, skaalB: 156, dispV: 72, dispH: 168, dispTop: 68, dispBund: 94, bund: 128 },
        /* Skaalvaegten: foden med knivsaeggen, armen og en skaal */
        skaal_fod: { b: 200, h: 300, aegX: 100, aegY: 36, skalaY: 232, bund: 296 },
        skaal_arm: { b: 400, h: 40, midtX: 200, midtY: 20, krogV: 12, krogH: 388 },
        skaal_skaal: { b: 160, h: 170, krogX: 80, krogY: 6, fladeY: 146, fladeB: 148 },
        /* Vejebaaden til pulver og baegerglasset til vaesker */
        vejebaad: { b: 120, h: 36, indV: 16, indH: 104, indBund: 14, bund: 34 },
        baegerglas: { b: 200, h: 240, indV: 21, indH: 179, bund: 229, randY: 10, mlY: 1.2 },
        /* Reagensflasken paa fane 3 */
        flaske: { b: 100, h: 150, indV: 13, indH: 87, indTop: 56, indBund: 143, indR: 9,
                  etiketV: 18, etiketH: 82, etiketTop: 78, etiketBund: 128 }
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
            if (window.console) console.warn("sc4.1: kunne ikke indlaese " + sti);
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

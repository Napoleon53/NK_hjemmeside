/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/ (som sc4.11)

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites med deres
   egen mappe, derfor startes indlaesningen foerst fra app.js.

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
        /* Lighteren uden haette, pind og gasknap. Bunden staar paa y 178. */
        lighter: { b: 64, h: 180, bund: 178, midtX: 32,
                   tank: { x0: 9, x1: 55, y0: 56, y1: 174 },
                   dyse: { x: 24, y: 20 }, ring: { x: 24, y: 41 },
                   hjul: { x: 46, y: 30, r: 9 }, knap: { x0: 36, x1: 60, y0: 40, y1: 47 },
                   haette: { x: 10, y: 14, b: 28, h: 34 } },
        haette: { b: 28, h: 34 },
        /* Maaleglasset paa 250 mL, vendt paa hovedet: indersiden x 9-51 fra
           y 22 til 326, og V mL staar ved y = 22 + 1,1 · V */
        maaleglas: { b: 60, h: 330, ind0: 9, ind1: 51, top: 22, mund: 326, prML: 1.1 },
        /* Karret: indersiden x 14-306, y 12-238, bunden staar paa y 248 */
        kar: { b: 320, h: 250, ind0: 14, ind1: 306, indTop: 12, indBund: 238, bund: 248, vand: 40 },
        /* Stativet: klemmens midte (30, 60), stangen x 232-240, foden paa y 440 */
        stativ: { b: 260, h: 440, klemX: 30, klemY: 60, bund: 440 },
        /* Vaegten (som sc4.11) */
        vaegt: { b: 240, h: 130, skaalX: 120, skaalY: 13, skaalB: 156, dispV: 72, dispH: 168, dispTop: 68, dispBund: 94, bund: 128 },
        /* Luppen (som sc4.11) */
        lup: { b: 140, h: 140, midtX: 52, midtY: 52, r: 38 }
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
            if (window.console) console.warn("sc4.9: kunne ikke indlaese " + sti);
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

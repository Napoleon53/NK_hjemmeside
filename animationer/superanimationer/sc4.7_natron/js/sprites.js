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
   viser dem alle alene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Braenderen: roerets munding (40, 18), gashanen (64, 168), bunden y 186 */
        bunsen: { b: 80, h: 190, mundY: 18, bund: 186, haneX: 64, haneY: 168 },
        /* Trefoden i to lag (trefod_bag og trefod_for, samme maal): ringen
           i y 22, trekantens forreste roer i y 29 fra x 34 til 136, benene
           paa y 157 */
        trefod: { b: 170, h: 160, bund: 157, ringY: 22, roerY: 29, roerV: 34, roerH: 136 },
        /* Diglen: randen (45, 10), indersidens aabning rx 35, ry 6,5, bunden y 74 */
        digel: { b: 90, h: 76, randY: 10, indRx: 35, indRy: 6.5, bund: 74 },
        /* Tangen: kaeberne i (6, 22) */
        tang: { b: 180, h: 44, kaebeX: 6, kaebeY: 22 },
        /* Natronglasset og kagen: de staar paa y 101 og 68 */
        natron: { b: 80, h: 104, bund: 101 },
        kage: { b: 120, h: 72, bund: 68 },
        /* Vaegten (som sc4.5) */
        vaegt: { b: 240, h: 130, skaalX: 120, skaalY: 13, skaalB: 156, dispV: 72, dispH: 168, dispTop: 68, dispBund: 94, bund: 128 },
        /* Luppen (som sc2.1) */
        lup: { b: 140, h: 140, midtX: 52, midtY: 52, r: 38 },
        /* Kemichaels kateder (som sc4.5) */
        kateder: { b: 300, h: 130, flade: 22, pladeTop: 18, front: 32, laerer: 80, kop: 150 }
    };

    /* Filerne. Trefoden har to filer med samme maal. */
    var FILER = {};
    ["bunsen", "digel", "tang", "natron", "kage", "vaegt", "lup", "kateder"].forEach(function (navn) {
        FILER[navn] = { fil: navn + ".svg", b: MAAL[navn].b, h: MAAL[navn].h };
    });
    FILER.trefod_bag = { fil: "trefod_bag.svg", b: MAAL.trefod.b, h: MAAL.trefod.h };
    FILER.trefod_for = { fil: "trefod_for.svg", b: MAAL.trefod.b, h: MAAL.trefod.h };

    /* Har en post sin egen mappe, hentes filen derfra. */
    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sc4.7: kunne ikke indlaese " + sti);
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

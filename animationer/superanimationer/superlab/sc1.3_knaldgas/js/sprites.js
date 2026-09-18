/* =====================================================================
   sprites.js - indlaeser og tegner SVG-sprites fra mappen sprites/
   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Mangler en fil, tegnes
   en simpel reservefigur, saa animationen aldrig gaar i staa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    /* Navn: fil. Stoerrelsen (b, h i tegneenheder) behoeves kun for
       sprites, der tegnes med tegnPositur. */
    var FILER = {
        flaskeH2:  { fil: "trykflaske_h2.svg" },
        flaskeO2:  { fil: "trykflaske_o2.svg" },
        maaleglas: { fil: "maaleglas.svg" },
        vandbad:   { fil: "vandbad.svg" },
        braender:  { fil: "braender.svg" },
        papir:     { fil: "koekkenrulle.svg", b: 72, h: 44 }
    };

    /* Har en post sin egen mappe, hentes filen derfra. Saadan tilfoejer
       ../../kemichael/kemichael.js laereren og kaffekoppen. */
    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sc1.3: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        FILER: FILER,

        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn)) indlaes(navn, FILER[navn]);
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        alleKlar: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn) && !(lager[navn] && (lager[navn].klar || lager[navn].fejlet))) return false;
            }
            return true;
        },

        /* Tegner spritet med oeverste venstre hjoerne i (x, y). */
        tegn: function (ctx, navn, x, y, b, h, reserve) {
            var p = lager[navn];
            var f = FILER[navn] || {};
            b = b === undefined ? f.b : b;
            h = h === undefined ? f.h : h;
            if (p && p.klar) {
                ctx.drawImage(p.img, x, y, b, h);
                return true;
            }
            if (reserve) {
                ctx.save();
                ctx.fillStyle = reserve;
                ctx.globalAlpha = 0.5;
                NK.rundtRekt(ctx, x, y, b, h, 8);
                ctx.fill();
                ctx.restore();
            }
            return false;
        },

        /* Tegner spritet drejet om ankerpunktet, der staar i positur p. */
        tegnPositur: function (ctx, navn, p, anker, alfa, skala) {
            var f = FILER[navn];
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

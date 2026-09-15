/* =====================================================================
   sprites.js - indlaeser og tegner SVG-sprites

   Faelles for laboratoriets forsoeg. Sprites hentes med <img>, ikke med
   fetch, saa de ogsaa virker, naar siden aabnes direkte fra harddisken
   (file://). Mangler en fil, tegnes en simpel reservefigur, saa
   animationen aldrig gaar i staa.

   Posterne i NK.Sprites.FILER er { fil, b, h, mappe }. Mappen er
   laboratoriets egen sprites/ (fundet ud fra denne fils placering),
   medmindre posten selv har en. udstyr.js tilfoejer laboratoriets
   udstyr, ../kemichael/kemichael.js tilfoejer laereren, og et forsoeg
   kan tilfoeje sine egne med NK.Sprites.tilfoej(navn, post).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    /* Mappen sprites/ ved siden af denne fils js/ */
    var her = document.currentScript ? document.currentScript.src : "";
    var MAPPE = her.replace(/js\/sprites\.js.*$/, "") + "sprites/";

    var FILER = {};

    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("laboratoriet: kunne ikke indlaese " + sti);
        });
        post.img.src = sti;
    }

    NK.Sprites = {
        FILER: FILER,
        MAPPE: MAPPE,

        /* post: { fil, b, h, mappe } */
        tilfoej: function (navn, post) {
            FILER[navn] = post;
            if (lager.__startet) indlaes(navn, post);
        },

        start: function () {
            lager.__startet = true;
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn) && !lager[navn]) indlaes(navn, FILER[navn]);
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
        tegn: function (ctx, navn, x, y, b, h) {
            var p = lager[navn];
            var f = FILER[navn];
            if (!f) return false;
            b = b === undefined ? f.b : b;
            h = h === undefined ? f.h : h;
            if (p && p.klar) {
                ctx.drawImage(p.img, x, y, b, h);
                return true;
            }
            ctx.save();
            ctx.fillStyle = "rgba(160, 170, 185, 0.35)";
            NK.rundtRekt(ctx, x, y, b, h, 6);
            ctx.fill();
            ctx.restore();
            return false;
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

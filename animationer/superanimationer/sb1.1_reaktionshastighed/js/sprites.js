/* =====================================================================
   sprites.js - indlaeser SVG-sprites

   Baegerglasset paa fane 1 ligger i sprites/. Samme lager faar
   Kemichaels sprites (krop, hoved, arm og kaffekop), som
   ../../v2/kemichael/kemichael.js laegger ind med deres egen mappe.
   Derfor skal denne fil indlaeses foer kemichael.js, og indlaesningen
   startes foerst fra app.js.

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var FILER = {
        /* Inderside x 21-179, bund y 229; se kommentaren i filen */
        baegerglas: { fil: "baegerglas.svg", b: 200, h: 240 }
    };

    function indlaes(navn, f) {
        var sti = (f.mappe || "sprites/") + f.fil;
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sb1.1: kunne ikke indlaese " + sti);
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

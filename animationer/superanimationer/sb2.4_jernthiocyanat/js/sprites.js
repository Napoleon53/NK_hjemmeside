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

    /* Navn: fil og stoerrelse i tegneenheder (viewBox). */
    var FILER = {
        vand:        { fil: "sproejteflaske.svg", b: 46, h: 120 },
        baeger:      { fil: "baegerglas_100.svg", b: 72, h: 110 },
        fe:          { fil: "draabeflaske_fe.svg", b: 46, h: 110 },
        scn:         { fil: "draabeflaske_kscn.svg", b: 46, h: 110 },
        ag:          { fil: "draabeflaske_agno3.svg", b: 46, h: 110 },
        reagensglas: { fil: "reagensglas.svg", b: 30, h: 160 },
        stativ:      { fil: "stativ5.svg", b: 290, h: 100 },
        bad:         { fil: "baegerglas.svg", b: 112, h: 132 },
        varmeplade:  { fil: "varmeplade.svg", b: 180, h: 72 },
        dunk:        { fil: "affaldsdunk.svg", b: 90, h: 130 },
        papir:       { fil: "koekkenrulle.svg", b: 72, h: 44 },
        haand:       { fil: "haand.svg", b: 96, h: 84 },
        lup:         { fil: "lup.svg", b: 40, h: 40 }
    };

    /* Har en post sin egen mappe, hentes filen derfra. Saadan tilfoejer
       ../kemichael/kemichael.js laereren og kaffekoppen. */
    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sb2.4: kunne ikke indlaese " + sti);
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
        tegn: function (ctx, navn, x, y, b, h) {
            var p = lager[navn];
            var f = FILER[navn];
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

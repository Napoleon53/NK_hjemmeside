/* =====================================================================
   sprites.js - indlaeser og tegner SVG-sprites fra mappen sprites/
   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://).
   Hvis en fil mangler, tegnes en simpel reservefigur i stedet, saa
   animationen aldrig gaar i staa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};
    var antalIalt = 0;
    var antalKlar = 0;

    var MAPPE = "sprites/";

    /* Listen over alle sprites: navn -> filnavn */
    var FILER = {
        bilBlaa:   "bil_blaa.svg",
        bilOrange: "bil_orange.svg",
        bilRoed:   "bil_roed.svg",
        bilHvid:   "bil_hvid.svg",
        bilGroen:  "bil_groen.svg",
        husRoed:   "hus_roed.svg",
        husGul:    "hus_gul.svg",
        rensdyr:   "rensdyr.svg",
        gran:      "gran.svg",
        mos:       "mos.svg",
        snefnug:   "snefnug.svg",
        tomat:     "tomat.svg",
        aert:      "aert.svg",
        jordbaer:  "jordbaer.svg",
        kunde:     "kunde.svg",
        bod:       "bod.svg",
        hoejbed:   "hoejbed.svg",
        n2o4:      "molekyle_n2o4.svg",
        no2:       "molekyle_no2.svg"
    };

    function indlaes(navn, fil) {
        var post = { img: new Image(), klar: false, fejlet: false, forhold: 1 };
        lager[navn] = post;
        antalIalt++;
        post.img.addEventListener("load", function () {
            post.klar = true;
            post.forhold = post.img.naturalHeight / (post.img.naturalWidth || 1);
            antalKlar++;
        });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            antalKlar++;
            if (window.console) console.warn("sb2.0: kunne ikke indlaese " + MAPPE + fil);
        });
        post.img.src = MAPPE + fil;
    }

    NK.Sprites = {
        /* Startes en gang ved sideindlaesning. */
        start: function () {
            for (var navn in FILER) {
                if (Object.prototype.hasOwnProperty.call(FILER, navn)) {
                    indlaes(navn, FILER[navn]);
                }
            }
        },

        klar: function (navn) {
            var p = lager[navn];
            return !!(p && p.klar);
        },

        /* Andel indlaest, 0-1. Bruges til den lille indlaesningstekst. */
        andel: function () {
            return antalIalt === 0 ? 1 : antalKlar / antalIalt;
        },

        /* Hoejden et sprite faar, hvis det tegnes med den givne bredde. */
        hoejde: function (navn, bredde) {
            var p = lager[navn];
            return bredde * (p && p.klar ? p.forhold : 1);
        },

        /* Tegner et sprite centreret i (x, y).
           bredde:  oensket bredde i CSS-pixels (hoejden foelger med)
           vinkel:  radianer, 0 = som filen er tegnet
           alfa:    0-1, valgfri
           reserve: farve til en simpel figur, hvis filen mangler */
        tegn: function (ctx, navn, x, y, bredde, vinkel, alfa, reserve) {
            var p = lager[navn];
            if (!p || !p.klar) {
                if (reserve) {
                    ctx.save();
                    if (alfa !== undefined && alfa !== null) ctx.globalAlpha = alfa;
                    ctx.fillStyle = reserve;
                    ctx.beginPath();
                    ctx.arc(x, y, bredde * 0.32, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                return false;
            }
            var h = bredde * p.forhold;
            ctx.save();
            if (alfa !== undefined && alfa !== null) ctx.globalAlpha = alfa;
            if (vinkel) {
                ctx.translate(x, y);
                ctx.rotate(vinkel);
                ctx.drawImage(p.img, -bredde / 2, -h / 2, bredde, h);
            } else {
                ctx.drawImage(p.img, x - bredde / 2, y - h / 2, bredde, h);
            }
            ctx.restore();
            return true;
        },

        /* Som tegn(), men (x, y) er FODEN af figuren - praktisk til
           traeer, rensdyr, kunder og andet, der staar paa jorden. */
        tegnStaaende: function (ctx, navn, x, gulvY, bredde, alfa, reserve) {
            var h = NK.Sprites.hoejde(navn, bredde);
            return NK.Sprites.tegn(ctx, navn, x, gulvY - h / 2, bredde, 0, alfa, reserve);
        }
    };
}());

/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   FILER er listen over filer med stoerrelse i tegneenheder (viewBox).
   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites med deres egen
   mappe, derfor startes indlaesningen foerst fra app.js.

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        baegerglas: { b: 200, h: 240, indV: 21, indH: 179, bund: 229, ml100: 108, mlPrEnhed: 1 / 1.2 },
        varmeplade: { b: 240, h: 64, pladeV: 12, pladeH: 228, pladeTop: 0, pladeBund: 9,
                      lampeVarme: [36, 36], lampeRoer: [204, 36], lampeR: 4,
                      knapVarme: [70, 36], knapRoer: [170, 36], knapR: 13 },
        termometer: { b: 24, h: 200, soejleV: 11, soejleH: 13, soejleBund: 180, nul: 164, hundrede: 24 },
        spatel:     { b: 160, h: 40, bladX: 22, bladY: 20, spidsX: 3, skaftX: 157 },
        pulverglas: { b: 90, h: 110, pulverV: 10, pulverH: 80, pulverTop: 80, pulverBund: 106, etiketX: 45, etiketY: 63 },
        lup:        { b: 140, h: 140, linseX: 52, linseY: 52, linseR: 38 }
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
            if (window.console) console.warn("sc2.1: kunne ikke indlaese " + sti);
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

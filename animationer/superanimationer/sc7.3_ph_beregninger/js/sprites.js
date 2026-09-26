/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   ../../v2/kemichael/kemichael.js tilfoejer laererens sprites (og
   kaffekoppen) med deres egen mappe, derfor startes indlaesningen foerst
   fra app.js.

   MAAL er de koordinater, der staar i kommentaren oeverst i hver
   SVG-fil. Aendres en fil, skal tallene her foelge med. Tegningerne
   er de samme som i sc7.2 (hverdagsstofferne, pH-metret og flasken).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Hverdagsstofferne paa hylderne: alle 100 x 120 og staar paa y 118 */
        citron: { b: 100, h: 120, bund: 118 },
        cola: { b: 100, h: 120, bund: 118 },
        kaffe: { b: 100, h: 120, bund: 118 },
        maelk: { b: 100, h: 120, bund: 118 },
        natron: { b: 100, h: 120, bund: 118 },
        afloebsrens: { b: 100, h: 120, bund: 118 },
        mavesaft: { b: 100, h: 120, bund: 118 },
        oel: { b: 100, h: 120, bund: 118 },
        regnvand: { b: 100, h: 120, bund: 118 },
        blod: { b: 100, h: 120, bund: 118 },
        saebevand: { b: 100, h: 120, bund: 118 },
        klorin: { b: 100, h: 120, bund: 118 },
        /* Udstyret */
        phmeter: { b: 80, h: 140, displayX: 40, displayY: 41, displayB: 52, displayH: 38, ledning: { x: 40, y: 6 } },
        flaske: { b: 90, h: 140, indV: 12, indH: 78, indTop: 40, indBund: 134, etiketV: 16, etiketH: 74, etiketTop: 70, etiketBund: 110, bund: 138 }
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
            if (window.console) console.warn("sc7.3: kunne ikke indlaese " + sti);
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

        /* Tegner spritet med midten i (x, y), drejet v og i bredden b */
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

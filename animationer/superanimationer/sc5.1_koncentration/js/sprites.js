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
        /* Karret paa fane 1: det indre, rumfangsskalaen, hanens tud og haandtag */
        kar: { b: 300, h: 360, indV: 30, indH: 230, indTop: 20, indBund: 290, indR: 12, prL: 240,
               tudX: 281, tudY: 300, hanX: 262, hanY: 244, sokkel: 300, bund: 360 },
        /* Vandhanen: tuden og knappen */
        vandhane: { b: 140, h: 220, tudX: 22, tudY: 214, knapX: 108, knapY: 128 },
        /* Maalekolben: halsen, boblen og maerket */
        maalekolbe: { b: 120, h: 260, halsV: 54, halsH: 66, halsTop: 10, halsBund: 150, bobleX: 60, bobleY: 202,
                      bobleR: 48, bundY: 248, maerke: 60, tekstY: 214, bund: 256 },
        /* Fuldpipetten: stilken, maerket, boblen og spidsen */
        pipette: { b: 40, h: 260, stilkV: 18, stilkH: 22, maerke: 44, bobleX: 20, bobleY: 124, bobleRx: 11, bobleRy: 34,
                   nedreTop: 158, spids: 254 },
        /* Baegerglasset paa fane 3 (400 mL) */
        baegerglas: { b: 160, h: 200, indV: 18, indH: 142, indTop: 16, indBund: 186, indR: 8, prmL: 0.35, bund: 190 },
        /* Flasken med stamopløsningen (som sc7.2) */
        flaske: { b: 90, h: 140, indV: 12, indH: 78, indTop: 40, indBund: 134, etiketV: 16, etiketH: 74, etiketTop: 70,
                  etiketBund: 110, bund: 138 },
        /* Sproejteflasken (som sc7.4) */
        sproejteflaske: { b: 110, h: 130, tudX: 8, tudY: 34, bund: 128 },
        /* Krukken, vaegten og vejebaaden (som sc4.5) */
        pulverglas: { b: 100, h: 130, indV: 10, indH: 90, indTop: 34, indBund: 126, indR: 9,
                      etiketV: 12, etiketH: 88, etiketTop: 54, etiketBund: 108 },
        vaegt: { b: 240, h: 130, skaalX: 120, skaalY: 13, skaalB: 156, dispV: 72, dispH: 168, dispTop: 68, dispBund: 94, bund: 128 },
        vejebaad: { b: 120, h: 36, indV: 16, indH: 104, indBund: 14, bund: 34 },
        /* Spatlen og luppen (som sc2.1) */
        spatel: { b: 160, h: 40, bladX: 22, bladY: 20, spidsX: 3, endeX: 157 },
        lup: { b: 140, h: 140, midtX: 52, midtY: 52, r: 38 },
        /* Kemichaels kateder (som sc4.5) */
        kateder: { b: 300, h: 130, flade: 22, pladeTop: 18, front: 32, laerer: 80, kop: 150 }
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
            if (window.console) console.warn("sc5.1: kunne ikke indlaese " + sti);
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

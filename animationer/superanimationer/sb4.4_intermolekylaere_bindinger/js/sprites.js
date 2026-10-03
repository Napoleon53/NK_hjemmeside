/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Er en fil ikke klar
   endnu, springes den bare over i det billede.

   Reagensglasset, temperaturkammeret og termometeret er tegnet til
   sc6.1 (Alkaners kogepunkt) og kopieret hertil, saa eleverne kender
   dem fra C-niveau. MAAL er de koordinater, der staar i kommentaren
   oeverst i hver SVG-fil. Aendres en fil, skal tallene her foelge med.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    var MAAL = {
        /* Reagensglasset: det indre og mundingen, hvor ballonen sidder */
        reagensglas: { b: 60, h: 200, indV: 12, indH: 48, indTop: 14, bundMidte: 170, bundR: 18, mundY: 7, mundV: 8, mundH: 52 },
        /* Kammeret: rummet bag ruden, hullet i loftet og displayet */
        kammer: { b: 240, h: 300, rumV: 30, rumH: 210, rumTop: 46, rumBund: 222, hulV: 98, hulH: 142, loft: 22,
                  dispV: 60, dispH: 180, dispTop: 238, dispBund: 268, bund: 296 },
        /* Termometeret: soejlen og skalaen */
        termometer: { b: 36, h: 480, soejleV: 16, soejleH: 20, soejleBund: 456, skalaTop: 16, skalaBund: 432, kugleY: 460 }
    };

    var FILER = {};
    Object.keys(MAAL).forEach(function (navn) {
        FILER[navn] = { fil: navn + ".svg", b: MAAL[navn].b, h: MAAL[navn].h };
    });

    function indlaes(navn, f) {
        var sti = MAPPE + f.fil;
        var post = { img: new Image(), klar: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            if (window.console) console.warn("sb4.4: kunne ikke indlaese " + sti);
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

        /* Tegner spritet med oeverste venstre hjoerne i (x, y) */
        tegn: function (ctx, navn, x, y, b, h) {
            var p = lager[navn], f = FILER[navn];
            if (!p || !p.klar || !f) return false;
            if (b === undefined) b = f.b;
            if (h === undefined) h = b * f.h / f.b;
            ctx.drawImage(p.img, x, y, b, h);
            return true;
        }
    };
}());

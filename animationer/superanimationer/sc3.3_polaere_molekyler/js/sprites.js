/* =====================================================================
   sprites.js - indlaeser SVG-sprites fra mappen sprites/

   Sprites hentes med <img>, ikke med fetch, saa de ogsaa virker, naar
   siden aabnes direkte fra harddisken (file://). Mangler en fil, tegner
   model3d.js en simpel reservefigur, saa animationen aldrig gaar i staa.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var lager = {};

    var MAPPE = "sprites/";

    /* Navn: fil og stoerrelse i tegneenheder (viewBox). */
    var FILER = {
        /* Atomkuglerne: fane 1 og 2 */
        atom_H:          { fil: "atom_h.svg", b: 128, h: 128 },
        atom_Li:         { fil: "atom_li.svg", b: 128, h: 128 },
        atom_C:          { fil: "atom_c.svg", b: 128, h: 128 },
        atom_N:          { fil: "atom_n.svg", b: 128, h: 128 },
        atom_O:          { fil: "atom_o.svg", b: 128, h: 128 },
        atom_F:          { fil: "atom_f.svg", b: 128, h: 128 },
        atom_Na:         { fil: "atom_na.svg", b: 128, h: 128 },
        atom_Cl:         { fil: "atom_cl.svg", b: 128, h: 128 },
        atom_K:          { fil: "atom_k.svg", b: 128, h: 128 },
        elektronpar:     { fil: "elektronpar.svg", b: 64, h: 110 },

        /* Fane 3: vandstraaleforsoeget */
        haner:           { fil: "haner.svg", b: 520, h: 480 },
        vask:            { fil: "vask.svg", b: 440, h: 84 },
        plastikstav:     { fil: "plastikstav.svg", b: 200, h: 14 },
        glasstav:        { fil: "glasstav.svg", b: 200, h: 14 },
        uldklud:         { fil: "uldklud.svg", b: 150, h: 56 }
    };

    /* Ankerpunkter i spritets egne enheder. */
    NK.ANKER = {
        elektronpar: { x: 32, y: 108, top: 3 }    /* spids ved atomet, top af wolken */
    };

    /* Kemichaels sprites (krop, hoved, arm og kaffekop) laegger
       ../../v2/kemichael/kemichael.js selv i FILER med deres egen mappe.
       Derfor indlaeses kemichael.js efter denne fil, og indlaesningen
       startes foerst fra app.js. */
    function indlaes(navn, f) {
        var sti = (f.mappe || MAPPE) + f.fil;
        var post = { img: new Image(), klar: false, fejlet: false };
        lager[navn] = post;
        post.img.addEventListener("load", function () { post.klar = true; });
        post.img.addEventListener("error", function () {
            post.fejlet = true;
            if (window.console) console.warn("sc3.3: kunne ikke indlaese " + sti);
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

        /* Tegner spritet med oeverste venstre hjoerne i (x, y). Kunne
           filen ikke hentes, tegnes en graa firkant, saa scenen ikke gaar
           i staa. */
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
            if (!p || !p.fejlet) return false;
            ctx.save();
            ctx.fillStyle = "rgba(160, 170, 185, 0.35)";
            ctx.fillRect(x, y, b, h);
            ctx.restore();
            return false;
        },

        /* Tegner spritet drejet om ankerpunktet, der staar i positur p
           (bruges af Kemichael). */
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
        },

        /* Billedet, hvis det er indlaest, ellers null. */
        billede: function (navn) {
            var p = lager[navn];
            return p && p.klar ? p.img : null;
        },

        sti: function (navn) {
            return (FILER[navn].mappe || MAPPE) + FILER[navn].fil;
        }
    };
}());

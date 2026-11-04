/* =====================================================================
   laerer.js - Kemichael praesenterer fanerne

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast
   tegnebord paa 1000 x 600 enheder. Denne animation har intet fast
   tegnebord, saa laereren tegnes skaleret efter laerredets hoejde
   (laererLaerredSkala), og NK.Scene.GULV saettes til laerredets bund,
   saa kitlen slutter der. Moenstret er det samme som i sc1.2.

   Hver fane har sin egen laerer. Han kommer ikke af sig selv: foerste
   gang fanen aabnes, staar der Start praesentation og Nej tak. K viser
   praesentationen igen. Praesentationen er den faelles fra 4. nov. 2026
   (NK.Praesentation.trin i ../kemichael/praesentation.js): to til fire
   trin med to til fire saetninger, en taleboble med Naeste og Spring
   praesentationen over, og en gul ramme om det, han peger paa (kortene
   i panelet med sel og det tegnede paa laerredet med felt, se
   introFelt nedenfor). Han har ingen andre replikker i denne animation.

   Hver fane skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     this.lay              laerredets maal (glas, ur, graf), som pladsen
                           og felterne regnes ud fra
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE;

    /* plads: hvor han staar under praesentationen (en funktion af fanen,
       i pixels fra venstre). Han er kun paa scenen, mens han praesenterer. */
    function kobl(P, fane, plads) {
        K.paa(P, { fredet: [] });

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        P.laererPladsPx = function () {
            return this.lay ? plads(this.lay) : 400;
        };

        P.laererPlads = function () {
            return this.laererPladsPx() / this.laererLaerredSkala();
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = this.laererLaerredSkala();
            NK.Scene.BREDDE = this.L.b / s;
            NK.Scene.HOEJDE = this.L.h / s;
            NK.Scene.GULV = this.L.h / s;
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = this.laererLaerredSkala();
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        P.introLinjer = function () { return D.INTRO[fane]; };
        NK.Praesentation.trin(P);
    }

    /* Grafen med aksernes tal og navne */
    function grafFelt(g) {
        return { x: g.x0 - 58, y: g.y0 - 28, b: g.x1 - g.x0 + 66, h: g.y1 - g.y0 + 62 };
    }

    /* ----- Fane 1: krydset. Han staar lige til hoejre for maaleglasset ved
       grafens venstre kant, saa han hverken daekker glasset, maaleglasset
       eller uret, og saa vejen ind fra venstre ikke bliver for lang. ----- */
    var PK = NK.SimKryds.prototype;
    kobl(PK, "kryds", function (lay) { return lay.graf.x0 + 40; });
    PK.introFelt = function (navn) {
        var lay = this.lay;
        if (!lay) return null;
        if (navn === "glas") {
            var bg = lay.bg, mg = this.mgRekt();
            var x0 = Math.min(bg.x, mg.x) - 6, y0 = Math.min(bg.y, mg.y) - 24;
            var x1 = Math.max(bg.x + bg.b, mg.x + mg.b) + 6, y1 = bg.y + bg.h + 6;
            return { x: x0, y: y0, b: x1 - x0, h: y1 - y0 };
        }
        if (navn === "oppefra") {
            var op = lay.op;
            return { x: op.x - op.r - 6, y: op.y - op.r - 26, b: 2 * op.r + 12, h: 2 * op.r + 32 };
        }
        if (navn === "ur") {
            var u = lay.ur;
            return { x: u.x - u.r * 1.15, y: u.y - u.r * 1.45, b: u.r * 2.3, h: u.r * 2.45 + 44 };
        }
        if (navn === "graf") return grafFelt(lay.graf);
        return null;
    };

    /* ----- Fane 2 og 3: han staar foran glasset oppefra til venstre, saa
       grafen, han taler om, kan ses hele tiden ----------------------------- */
    function vedVis(lay) { return lay.vis.x + lay.vis.b / 2; }
    var PC = NK.SimKonc.prototype;
    kobl(PC, "konc", vedVis);
    PC.introFelt = function (navn) {
        return this.lay && navn === "graf" ? grafFelt(this.lay.graf) : null;
    };

    var PT = NK.SimTemp.prototype;
    kobl(PT, "temp", vedVis);
    PT.introFelt = function (navn) {
        return this.lay && navn === "graf" ? grafFelt(this.lay.graf) : null;
    };
}());

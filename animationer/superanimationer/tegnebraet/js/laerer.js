/* =====================================================================
   laerer.js - Kemichael ved tegnebraettet (samme kode som i sc4.2)

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   side har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde, som i sc5.1 og sc5.2: skala 0,92 og gulvet ved
   laerredets bund (NK.Scene.GULV), saa benene ikke bliver lange.

   Fanen (NK.Fane i fane.js) har this.tid, this.L og this.lay.
   Kaffekoppen staar naesten gemt i scenens nederste hoejre hjoerne og
   er paaskeaegget.

   Scener:
     intro     praesentationen (D.INTRO_TEGN), naar eleven vil: ét trin ad
               gangen med Naeste og Spring praesentationen over. Han
               peger paa det, der blinker, og gaar aldrig videre af sig
               selv. Koden er faelles: ../kemichael/praesentation.js.
   Ellers kommer han kun, naar eleven klikker paa ham eller koppen.
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

    function scenemaal(sim) {
        var s = sim.laererLaerredSkala();
        NK.Scene.BREDDE = sim.L.b / s;
        NK.Scene.HOEJDE = sim.L.h / s;
        NK.Scene.GULV = sim.L.h / s;
        return s;
    }

    function kaffeValg() {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() - 150 : 700;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
            }
        };
    }

    function kobl(P) {
        K.paa(P, kaffeValg());

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = scenemaal(this);
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Han staar ved tavlens venstre kant, aldrig halvt uden for billedet */
        P.laererPladsPx = function () {
            return this.lay ? Math.max(90, this.lay.tavle.x + 80) : 150;
        };

        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };
    }

    /* ----- Tegnebraettet ------------------------------------------------------
       Praesentationen er faelles (../kemichael/praesentation.js) */
    var PT = NK.SimTegn.prototype;
    kobl(PT);
    PT.introLinjer = function () { return D.INTRO_TEGN; };

    /* Det, han peger paa paa tavlen, i laerredets pixels. "start":
       startpunktet med det lille traek, der viser, hvordan en kaede
       tegnes. Staar der allerede noget paa tavlen, er det tegningen,
       og er tavlen helt tom, er det hele tavlen. */
    PT.introFelt = function (navn) {
        if (navn !== "start" || !this.lay) return null;
        var b = this.braet, mol = b.mol, s = b.s(), f = this.felt();
        var start = mol.atomer.filter(function (a) { return a.start && !mol.grad(a.id); });
        var atomer = start.length ? start : mol.atomer;
        if (!atomer.length) return { x: f.x, y: f.y, b: f.b, h: f.h };
        var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        atomer.forEach(function (a) {
            var p = b.px(a);
            x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
            x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
        });
        /* Traekket gaar tre bindinger mod hoejre og har "traek" over sig */
        if (start.length) { x1 += 2.7 * s + 30; y0 -= 0.5 * s + 22; }
        x0 = Math.max(f.x, x0 - 24); y0 = Math.max(f.y, y0 - 24);
        x1 = Math.min(f.x + f.b, x1 + 24); y1 = Math.min(f.y + f.h, y1 + 24);
        return x1 > x0 && y1 > y0 ? { x: x0, y: y0, b: x1 - x0, h: y1 - y0 } : { x: f.x, y: f.y, b: f.b, h: f.h };
    };

    NK.Praesentation.trin(PT);
}());

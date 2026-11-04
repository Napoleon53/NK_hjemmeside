/* =====================================================================
   laerer.js - Kemichael ved tavlen paa alle fire faner

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde, som i sc5.1 og sc5.2: skala 0,92 og gulvet ved
   laerredets bund (NK.Scene.GULV), saa benene ikke bliver lange.

   Hver fane (NK.Fane i opgavefane.js) har this.tid, this.L og this.lay.
   Kaffekoppen staar naesten gemt i scenens nederste hoejre hjoerne og
   er det faelles paaskeaeg.

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil.
               Ét trin ad gangen med Naeste og Spring praesentationen
               over; han peger paa det, der blinker, og gaar aldrig
               videre af sig selv. Koden er faelles:
               ../kemichael/praesentation.js (NK.Praesentation.trin).
     faerdig   en hel fane er klaret (D.ROS): paa fane 1 til 3, naar
               fanens sidste klistermaerke er laast op, paa fane 4, naar
               hele bunken er sorteret. Det er de eneste gange, han kommer
               ind af sig selv (brugerens regel 4. nov. 2026).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

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

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    function rosTrin(sim, replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: function () { return sim.laererPlads(); } },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]);
    }

    /* Er alle fanens klistermaerker laast op? Fanen kendes paa quizzens
       forstavelse: zz (Zigzag), nv (Navne) eller is (Isomerer). */
    function faneKlaret(pre) {
        var liste = NK.Skuffe.ALLE.filter(function (k) { return k.quiz.indexOf(pre + "-") === 0; });
        return liste.length > 0 && liste.every(function (k) { return NK.Skuffe.aaben(k.navn); });
    }

    function kobl(P) {
        var v = kaffeValg();
        v.fredet = ["faerdig"];
        K.paa(P, v);

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

        /* Praesentationen: ét trin ad gangen med Naeste og Spring
           praesentationen over (faelles, ../kemichael/praesentation.js) */
        NK.Praesentation.trin(P);

        /* Det, der er tegnet paa tavlen, i laerredets pixels: kassen om
           atomerne, saa den gule ramme ogsaa kan ses om et enkelt C-atom */
        P.introFelt = function (navn) {
            if (navn !== "tegning" || !this.braet || !this.braet.mol) return null;
            var b = this.braet, atomer = b.mol.atomer;
            if (!atomer.length) return null;
            var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
            atomer.forEach(function (a) {
                var p = b.px(a);
                x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
                x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
            });
            var luft = 26, bb = Math.max(x1 - x0 + 2 * luft, 64), hh = Math.max(y1 - y0 + 2 * luft, 64);
            return { x: (x0 + x1) / 2 - bb / 2, y: (y0 + y1) / 2 - hh / 2, b: bb, h: hh };
        };

        /* En hel fane er klaret. Staar praesentationen, venter rosen, til
           han er faerdig med den. */
        P.laererFaerdig = function (replik) {
            if (!this.laerer || !replik) return;
            if (this.kmIntro) { this.rosVenter = replik; return; }
            this.laererKoer("faerdig", rosTrin(this, replik), false);
        };

        var opdater = P.opdaterLaerer;
        P.opdaterLaerer = function (dt) {
            opdater.apply(this, arguments);
            if (this.rosVenter && !this.kmIntro) {
                var replik = this.rosVenter;
                this.rosVenter = null;
                this.laererFaerdig(replik);
            }
        };

        /* Kaldes fra klaret i opgavefane.js, naar en quiz har givet et nyt
           klistermaerke. Han kommer kun, naar det var fanens sidste. */
        P.laererFaneKlaret = function (quiz) {
            var pre = String(quiz).split("-")[0];
            if (faneKlaret(pre)) this.laererFaerdig(D.ROS[pre]);
        };
    }

    /* ----- Fane 1: zigzag ---------------------------------------------------- */
    var PZ = NK.SimZigzag.prototype;
    kobl(PZ);
    PZ.introLinjer = function () { return this.retning === "atomer" ? D.INTRO_ZIGZAG_ATOMER : D.INTRO_ZIGZAG; };

    /* ----- Fane 2: navne ----------------------------------------------------- */
    var PN = NK.SimNavne.prototype;
    kobl(PN);
    PN.introLinjer = function () { return D.INTRO_NAVNE; };

    /* ----- Fane 3: isomerer -------------------------------------------------- */
    var PI = NK.SimIsomerer.prototype;
    kobl(PI);
    PI.introLinjer = function () { return D.INTRO_ISOMERER; };

    /* ----- Fane 4: opløselighed ------------------------------------------------ */
    var PO = NK.SimOploes && NK.SimOploes.prototype;
    if (PO) {
        kobl(PO);
        PO.introLinjer = function () { return D.INTRO_OPLOES; };
        /* Under praesentationen staar han til hoejre for etiketterne heptan
           og vand, saa de kan ses, mens han fortaeller om lagene */
        var plads = PO.laererPlads;
        PO.laererPlads = function () {
            var g = this.zoner && this.zoner.glas;
            if (this.kmIntro && g) return Math.max(plads.call(this), (g.x + (this.etiketB || 90) + 150) / this.laererLaerredSkala());
            return plads.apply(this, arguments);
        };
    }
}());

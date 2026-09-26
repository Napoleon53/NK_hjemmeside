/* =====================================================================
   laerer.js - Kemichael praesenterer fanerne

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast
   tegnebord paa 1000 x 600 enheder. Denne animation har intet fast
   tegnebord, saa laereren tegnes skaleret efter laerredets hoejde
   (laererLaerredSkala), og NK.Scene.GULV saettes til laerredets bund,
   saa kitlen slutter der. Moenstret er det samme som i sc1.2.

   Hver fane har sin egen laerer. Han kommer ikke af sig selv: foerste
   gang fanen aabnes, staar der Start praesentation og Nej tak
   (js/praesentation.js). Under anden replik peger han paa kortet i
   panelet (D.PEG), og det lyser op. Scenen laaser ikke. Knappen Spring
   praesentationen over, to klik paa ham og Esc sender ham ud; K viser
   praesentationen igen.

   Hver fane skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre
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

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    function kobl(P, fane, springId, plads) {
        K.paa(P, { fredet: [] });

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        P.laererPladsPx = function () {
            return this.lay ? this.lay.W * plads : 400;
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

        /* Armens vinkel mod kortet i panelet */
        P.pegPaaKort = function () {
            var s = this.laererLaerredSkala();
            var el = NK.el(D.PEG[fane]), cv = this.L.canvas;
            if (!el || !cv) return this.pegVinkel(this.L.b / s + 60, this.L.h * 0.3 / s);
            var r = el.getBoundingClientRect(), c = cv.getBoundingClientRect();
            var x = r.left + r.width / 2 - c.left, y = r.top + Math.min(r.height / 2, 60) - c.top;
            return this.pegVinkel(x / s, y / s);
        };

        /* Kortet lyser op, mens han taler om det (kaldes fra opdaterIntro) */
        P.pegPaaFelt = function (til) {
            if (!!til === !!this.pegerNu) return;
            this.pegerNu = !!til;
            var el = NK.el(D.PEG[fane]);
            if (el) el.classList.toggle("peg", !!til);
        };

        P.laererIntro = function () {
            if (!this.laerer) return;
            var mig = this, linjer = D.INTRO[fane];
            var trin = [
                { kald: function () { mig.introKlikTal = 0; } },
                { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
                { gaa: function () { return mig.laererPlads(); } },
                { tid: 0.2 }
            ];
            linjer.forEach(function (l, i) {
                trin.push({ kald: function () { mig.introTrin = i + 1; } });
                if (i === D.INTRO_PEG) trin.push({ arm: function () { return mig.pegPaaKort(); }, tid: 0.45 });
                trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
                if (i === D.INTRO_PEG) trin.push({ arm: HAENGER, tid: 0.35 });
            });
            this.laererKoer("intro", trin.concat([
                { taleFaerdig: true },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { kald: function () { mig.introTrin = 0; } },
                { gaa: UDE }
            ]), false);
        };

        P.laererIIntro = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.navn === "intro");
        };

        P.laererIntroVaek = function () {
            var L = this.laerer;
            if (!this.laererIIntro()) return false;
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            this.introTrin = 0;
            this.laererKoer("introUd", [
                { arm: HAENGER, tid: 0.15 },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { gaa: UDE, loeb: true }
            ], false);
            return true;
        };

        /* Et klik under praesentationen: rammer det ham, taeller det. Andet
           klik paa ham sender ham ud, det foerste faar knappen til at blinke. */
        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            this.introKlikTal = (this.introKlikTal || 0) + 1;
            if (this.introKlikTal >= 2) {
                this.laererIntroVaek();
            } else {
                var k = NK.el(springId);
                k.classList.remove("puf");
                void k.offsetWidth;
                k.classList.add("puf");
            }
            return true;
        };
    }

    /* Han staar mellem glasset og krydset set oppefra paa fane 1 og midt
       paa grafen paa fane 2 og 3. */
    kobl(NK.SimKryds.prototype, "kryds", "kryds-spring", 0.5);
    kobl(NK.SimKonc.prototype, "konc", "konc-spring", 0.55);
    kobl(NK.SimTemp.prototype, "temp", "temp-spring", 0.55);
}());

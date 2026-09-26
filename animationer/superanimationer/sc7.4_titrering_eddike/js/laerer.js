/* =====================================================================
   laerer.js - Kemichael ved titreringen, tavlen og de to kolber

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc7.2.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,8 (lidt mindre end i sc7.2), saa han kan staa ved siden af
   opstillingen uden at daekke buretten og kolben.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     this.lay.kop          hvor koppen staar (han stiller sig ved siden af)

   Scener:
     intro   hver fane: praesentationen (D.INTRO_*), naar eleven vil
     sig     en replik: ros (med ros-regnskabet) eller en toer bemaerkning
     glimt   et glimt af hans baggrund (K.glimtTrin), fx den foerste
             titrering, der gav 140 %
   Kaffen staar paa bordet i alle tre faner og er det faelles paaskeaeg.
   NB: fanernes egne metoder maa ikke hedde det samme som dem, K.paa
   laegger paa (laererSig, laererKoer, laererTaler ...), se sc7.2.
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

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund. */
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
                return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 300;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
            },
            fredet: ["sig", "glimt"]
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Peg paa et punkt i pixels */
    function pegPaa(sim, punkt) {
        return function () {
            var s = sim.laererLaerredSkala(), p = punkt();
            return p ? sim.pegVinkel(p.x / s, p.y / s) : 0.5;
        };
    }

    function kobl(P, peg) {
        K.paa(P, kaffeValg());

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.8, 0.45, 1.1);
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
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

        P.laererPladsPx = function () {
            return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
        };

        /* Aldrig saa langt ude, at han staar halvt uden for billedet */
        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };

        /* ----- Praesentationen ----------------------------------------------- */
        P.laererIntro = function () {
            if (!this.laerer) return;
            var sim = this;
            var trin = [
                { kald: function () { sim.introKlikTal = 0; } },
                { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
                { gaa: function () { return sim.laererPlads(); } },
                { tid: 0.2 }
            ];
            this.introLinjer().forEach(function (l, i) {
                var v = peg[i] ? pegPaa(sim, function () { return peg[i](sim); }) : null;
                trin.push({ kald: function () { sim.introTrin = i + 1; } });
                if (v) trin.push({ arm: v, tid: 0.45 });
                trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
                if (v) trin.push({ arm: HAENGER, tid: 0.35 });
            });
            this.laererKoer("intro", trin.concat([
                { taleFaerdig: true },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { kald: function () { sim.introTrin = 0; } },
                { gaa: UDE }
            ]), false);
        };

        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            this.introKlikTal = (this.introKlikTal || 0) + 1;
            if (this.introKlikTal >= 2) {
                this.laererIntroVaek();
            } else {
                var k = NK.el(this.springId);
                k.classList.remove("puf");
                void k.offsetWidth;
                k.classList.add("puf");
            }
            return true;
        };

        P.laererIntroVaek = function () {
            var L = this.laerer;
            if (!L || !L.scene || L.scene.navn !== "intro") return false;
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

        P.laererIIntro = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.navn === "intro");
        };

        /* ----- En replik: ros (loefter fingeren og nikker) eller en toer
                 bemaerkning over brillerne ------------------------------------ */
        P.laererReplik = function (tekst, ros) {
            /* En replik afbryder aldrig praesentationen */
            if (!this.laerer || this.laererIIntro()) return;
            var trin;
            if (ros) {
                trin = [
                    { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
                    { gaa: P.laererPlads },
                    { tid: 0.3 },
                    { arm: 0.3, tid: 0.5 },
                    { sig: tekst, vis: replikTid(tekst), tid: replikTid(tekst),
                      hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
                    { kald: function () { this.laerer.nik = 0; } },
                    { arm: HAENGER, tid: 0.4 }
                ].concat(K.ros(), [{ taleFaerdig: true }, { gaa: UDE }]);
            } else {
                trin = [
                    { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
                    { gaa: P.laererPlads },
                    { tid: 0.3 },
                    { sig: tekst, vis: replikTid(tekst), tid: replikTid(tekst) },
                    { udtryk: { skeptisk: 0, briller: 0 } },
                    { taleFaerdig: true },
                    { gaa: UDE }
                ];
            }
            this.laererKoer("sig", trin, false);
        };

        /* Et glimt af hans baggrund, hvis det ikke er vist i denne browser */
        P.laererGlimt = function (id) {
            if (!this.laerer || this.laerer.scene) return;
            var glimt = K.glimtTrin(id);
            if (!glimt.length) return;
            this.laererKoer("glimt", [
                { udtryk: { vrede: 0, humoer: 0.1, roed: 0.2, skeptisk: 0.4, briller: 1 } },
                { gaa: P.laererPlads },
                { tid: 0.3 }
            ].concat(glimt, [
                { udtryk: { skeptisk: 0, briller: 0, roed: 0 } },
                { taleFaerdig: true },
                { gaa: UDE }
            ]), false);
        };
    }

    /* ----- Fane 1: titreringen ------------------------------------------------------ */
    var PT = NK.SimTitrering.prototype;
    PT.springId = "tit-spring";
    PT.introLinjer = function () { return D.INTRO_TITRERING; };
    kobl(PT, {
        0: function (sim) {
            var g = sim.lay && sim.lay.g;
            return g ? { x: g.cx, y: g.buret.y + 180 * g.s } : null;
        },
        1: function (sim) {
            var sk = sim.lay && sim.lay.skyder;
            return sk ? { x: sk.x0 + 20, y: sk.y } : null;
        }
    });

    /* ----- Fane 2: beregningen -------------------------------------------------------- */
    var PB = NK.SimBeregning.prototype;
    PB.springId = "ber-spring";
    PB.introLinjer = function () { return D.INTRO_BEREGNING; };
    kobl(PB, {
        0: function (sim) {
            var tv = sim.lay && sim.lay.tavle;
            return tv ? { x: tv.x + tv.b * 0.35, y: tv.y + tv.h * 0.55 } : null;
        },
        1: function (sim) {
            return sim.lay ? { x: sim.lay.W - 4, y: sim.lay.H * 0.35 } : null;
        }
    });

    /* ----- Fane 3: forbruget -------------------------------------------------------------- */
    var PF = NK.SimForbrug.prototype;
    PF.springId = "for-spring";
    PF.introLinjer = function () { return D.INTRO_FORBRUG; };
    kobl(PF, {
        0: function (sim) {
            var g = sim.lay && sim.lay.gB;
            return g ? { x: g.cx, y: g.kolbe.y + 100 * g.k } : null;
        },
        1: function (sim) {
            return sim.lay ? { x: sim.lay.W - 4, y: sim.lay.H * 0.3 } : null;
        }
    });

}());

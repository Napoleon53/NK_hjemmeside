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

   Under praesentationen er taleboblen et HTML-element med Naeste og
   Spring praesentationen over (../kemichael/praesentation.js).

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     this.lay.kop          hvor koppen staar (han stiller sig ved siden af)
     introLinjer()         praesentationens trin: [{ tekst, sel, felt }]
     introFelt(navn)       et felt paa laerredet, han peger paa (fane 3:
                           kolbeA og kolbeB med skiltene)

   Scener:
     intro   hver fane: praesentationen (D.INTRO_*), naar eleven vil.
             Ét trin ad gangen: han siger to til fire saetninger, peger
             paa det, der blinker (sel: de usynlige .anker over laerredet
             papirkortet og kortene i panelet; felt: kolberne paa fane 3), og bliver
             staaende, til eleven trykker Naeste. Han gaar aldrig videre
             af sig selv. Koden er faelles: NK.Praesentation.trin.
     sig     en replik: ros, naar en fane er klaret foerste gang (med
             ros-regnskabet), eller en toer bemaerkning (paaskeaeggene:
             den tomme burette og resultatet paa hundrededelen)
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
            fredet: ["sig"]
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    function kobl(P) {
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

        /* Praesentationen: ét trin ad gangen med Naeste og Spring
           praesentationen over (faelles, ../kemichael/praesentation.js) */
        NK.Praesentation.trin(P);

        /* ----- En replik: ros (loefter fingeren og nikker) eller en toer
                 bemaerkning over brillerne ------------------------------------ */
        P.laererReplik = function (tekst, ros) {
            /* En replik afbryder aldrig praesentationen. Rosen venter, til
               han er faerdig (fanens ventRos kalder igen). */
            if (!this.laerer) return;
            if (this.laererIIntro()) { if (ros) this.ventRos = 1.5; return; }
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
    }

    /* ----- Fane 1: titreringen ------------------------------------------------------ */
    var PT = NK.SimTitrering.prototype;
    PT.introLinjer = function () { return D.INTRO_TITRERING; };
    kobl(PT);

    /* ----- Fane 2: beregningen -------------------------------------------------------- */
    var PB = NK.SimBeregning.prototype;
    PB.introLinjer = function () { return D.INTRO_BEREGNING; };
    kobl(PB);

    /* ----- Fane 3: forbruget -------------------------------------------------------------- */
    var PF = NK.SimForbrug.prototype;
    PF.introLinjer = function () { return D.INTRO_FORBRUG; };
    /* Praesentationens felter: kolbe A og B med skiltet under dem (ikke
       hele stativet, saa taleboblen kan staa foroven) */
    PF.introFelt = function (navn) {
        var lay = this.lay, g = lay && (navn === "kolbeA" ? lay.gA : navn === "kolbeB" ? lay.gB : null);
        if (!g) return null;
        var halv = Math.max(75 * g.k, 90), top = g.kolbe.y - 6, bund = lay.skiltY + lay.px / 2 + 12;
        return { x: g.cx - halv, y: top, b: 2 * halv, h: bund - top };
    };
    kobl(PF);

}());

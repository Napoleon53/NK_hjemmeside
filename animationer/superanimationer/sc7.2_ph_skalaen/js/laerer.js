/* =====================================================================
   laerer.js - Kemichael ved skalaen, luppen og fortyndingsbordet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc5.1, sc5.2 og sc5.4.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc2.3, saa benene ikke bliver lange.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil.
               Ét trin ad gangen med to til fire saetninger: han peger
               paa det, der blinker, og bliver staaende, til eleven
               trykker Naeste. Koden er faelles: NK.Praesentation.trin
               (../kemichael/praesentation.js).
     faerdig   fane 1: den sidste hylde er maalt; fane 2: det sidste maal
     sig       fane 3: det sidste maal
     aeg       fane 1: et gaet, der rammer inden for 0,1 (én gang pr. besoeg)
   Han kommer kun ind af sig selv, naar en hel fane er gennemfoert, og ved
   paaskeaegget (brugerens regler 4. nov. 2026). Kaffen staar paa bordet i
   alle tre faner og er det faelles paaskeaeg.
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

    function kobl(P, valg) {
        K.paa(P, valg);

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
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

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = scenemaal(this);
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Aldrig saa langt ude, at han staar halvt uden for billedet */
        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Toer ros: han loefter fingeren, nikker og siger replikken */
    function rosTrin(P, replik, udenRos) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(udenRos ? [] : K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]);
    }

    /* En toer bemaerkning over brillerne */
    function bemaerkning(P, replik) {
        return [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ];
    }

    function kaffeValg(pos) {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() + 150 * pos : 300;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
            }
        };
    }

    /* ----- Fane 1: skalaen ------------------------------------------------------ */
    var PS = NK.SimSkala.prototype;
    var vs = kaffeValg(1);
    vs.fredet = ["faerdig"];
    kobl(PS, vs);

    PS.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PS.introLinjer = function () { return D.INTRO_SKALA; };
    NK.Praesentation.trin(PS);

    /* nr: den hylde, der lige er maalt. Kun den sidste hylde er hele
       fanen; efter den foerste kommer han ikke. */
    PS.laererFaerdig = function (nr) {
        if (!this.laerer || nr < D.HYLDER.length - 1) return;
        this.laererKoer("faerdig", rosTrin(PS, D.ROS_SKALA), false);
    };

    /* Paaskeaegget: et gaet, der rammer inden for 0,1. Én gang pr. besoeg,
       og ikke midt i praesentationen. */
    PS.laererAeg = function () {
        if (!this.laerer || this.aegVist || this.laerer.scene || this.kmIntro) return;
        this.aegVist = true;
        this.laererKoer("aeg", bemaerkning(PS, D.AEG_PRAECIS), false);
    };

    /* ----- Fane 2: luppen --------------------------------------------------------- */
    var PL = NK.SimLup.prototype;
    var vl = kaffeValg(1);
    vl.fredet = ["faerdig"];
    kobl(PL, vl);

    PL.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PL.introLinjer = function () { return D.INTRO_LUP; };
    NK.Praesentation.trin(PL);

    PL.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PL, D.LUP_FAERDIG), false);
    };

    /* ----- Fane 3: fortyndingsbordet ------------------------------------------------ */
    var PF = NK.SimFortynd.prototype;
    var vf = kaffeValg(1);
    vf.fredet = ["sig"];
    kobl(PF, vf);

    /* Under praesentationen staar han midt paa bordet ved pH 8,5. Ude til
       venstre ville han daekke saltsyren, knappen under den og luppen,
       som han netop taler om. */
    PF.laererPladsPx = function () {
        if (!this.lay) return 150;
        if (this.kmIntro) return NK.Tegn.skalaX(this.lay.skala, 8.5);
        return Math.max(90, this.lay.kop.x + 70);
    };

    PF.introLinjer = function () { return D.INTRO_FORTYND; };

    /* Skiltet med "Hvert nyt glas" er tegnet paa laerredet og kun, naar
       der er plads til det (tegnSkilt i sim_fortynd.js saetter hoejden) */
    PF.introFelt = function (navn) {
        var lay = this.lay, s = lay && lay.skilt;
        if (navn !== "skilt" || !s || !s.h || s.b < 120 || s.y + s.h > lay.bordY - lay.gh * 1.2 - 8) return null;
        return { x: s.x, y: s.y, b: s.b, h: s.h };
    };
    NK.Praesentation.trin(PF);

    /* En replik efter et maal. ros: den sidste, med ros-regnskabet */
    PF.laererReplik = function (tekst, ros) {
        if (!this.laerer) return;
        this.laererKoer("sig", ros ? rosTrin(PF, tekst) : bemaerkning(PF, tekst), false);
    };

}());

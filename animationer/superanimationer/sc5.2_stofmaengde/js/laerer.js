/* =====================================================================
   laerer.js - Kemichael ved vaegten, de to vaegte og afvejningen

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc5.1.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc2.3, saa benene ikke bliver lange.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil.
               Ét trin ad gangen med Naeste og Spring praesentationen over;
               han gaar aldrig videre af sig selv. Koden er faelles:
               NK.Praesentation.trin (../kemichael/praesentation.js).
     slut      fane 2: en runde er slut med mindst seks rigtige (én gang)
     faerdig   fane 3: alle tolv ordrer er afvejet (én gang)
   Ellers kommer han ikke af sig selv (brugerens regel 4. nov. 2026).
   Kaffen staar paa bordet paa fane 1 og 3 og er det faelles paaskeaeg.
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
    function rosTrin(P, replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: P.laererPlads },
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

    function kaffeValg(pos) {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() - 150 * pos : 700;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
            }
        };
    }

    /* ----- Fane 1: vaegten ----------------------------------------------------
       Fanen har ingen ende (der kommer altid en ny opgave), saa han kommer
       kun, naar eleven beder om praesentationen eller roerer kaffen. */
    var PV = NK.SimVaegt.prototype;
    kobl(PV, kaffeValg(1));

    PV.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x - 110) : 250;
    };
    PV.introLinjer = function () { return D.INTRO_VAEGT; };
    NK.Praesentation.trin(PV);

    /* ----- Fane 2: flest atomer -------------------------------------------------
       En runde er hele fanen: ni par fra alle tre niveauer. Han kommer én
       gang pr. besoeg, naar en runde er slut med mindst seks rigtige. */
    var PA = NK.SimAtomer.prototype;
    kobl(PA, { fredet: ["slut"] });

    PA.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.vaegte[0].x - this.lay.vaegtB / 2 - 60) : 150;
    };
    PA.introLinjer = function () { return D.INTRO_ATOMER; };
    NK.Praesentation.trin(PA);

    PA.laererSlut = function (point, rekord) {
        if (!this.laerer || this.kmIntro || this.rundeRost || point < D.RUNDE_GOD) return;
        this.rundeRost = true;
        var replik = point >= D.RUNDE_ALLE ? D.RUNDE_ALLE_REPLIK : (rekord ? D.REKORD_REPLIK : D.RUNDE_REPLIK);
        this.laererKoer("slut", rosTrin(PA, replik), false);
    };

    /* ----- Fane 3: afvejning ------------------------------------------------------
       Han kommer én gang, naar alle tolv ordrer er afvejet. */
    var PF = NK.SimAfvej.prototype;
    var vf = kaffeValg(1);
    vf.fredet = ["faerdig"];
    kobl(PF, vf);

    PF.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x - 110) : 150;
    };
    /* Han staar helt ude til venstre, saa han ikke daekker etiketten paa
       krukken, mens han praesenterer den */
    PF.laererPlads = function () {
        return Math.max(100, this.laererPladsPx() / this.laererLaerredSkala());
    };
    PF.introLinjer = function () { return D.INTRO_AFVEJ; };
    NK.Praesentation.trin(PF);

    PF.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PF, D.ORDRER_FAERDIG), false);
    };
}());

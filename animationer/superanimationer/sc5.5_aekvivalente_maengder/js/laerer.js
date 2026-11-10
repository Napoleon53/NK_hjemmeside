/* =====================================================================
   laerer.js - Kemichael ved poelsevognen, kammeret og tavlen

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc5.1 og sc5.2.

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
     faerdig   en hel fane er klaret: alle ti ordrer (fane 1), alle fem
               maal (fane 2) eller alle tolv opgaver (fane 3). Én gang.
     aeg       paaskeaegget: eleven ringer med lutter agurker (fane 1)
   Ellers kommer han ikke af sig selv (brugerens regel 4. nov. 2026).
   Kaffen staar paa disken (fane 1) og paa bordet (fane 2) og er det
   faelles paaskeaeg.
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
                return lay ? lay.kop.x / this.laererLaerredSkala() + 150 * pos : 300;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
            }
        };
    }

    /* ----- Fane 1: hotdogboden ------------------------------------------------ */
    var PH = NK.SimHotdog.prototype;
    var vh = kaffeValg(1);
    vh.fredet = ["faerdig"];
    kobl(PH, vh);

    PH.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };
    PH.introLinjer = function () { return D.INTRO_HOTDOG; };
    NK.Praesentation.trin(PH);

    /* Alle ti ordrer er lavet */
    PH.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PH, D.HOTDOG_FAERDIG), false);
    };

    /* Paaskeaegget: eleven ringer med lutter agurker paa braettet. Én gang pr. besoeg. */
    PH.laererAeg = function () {
        if (!this.laerer || this.aegVist || this.laerer.scene || this.kmIntro) return;
        this.aegVist = true;
        var l = D.AEG_AGURK;
        this.laererKoer("aeg", [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: PH.laererPlads },
            { tid: 0.3 },
            { sig: l, vis: replikTid(l), tid: replikTid(l) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
    };

    /* ----- Fane 2: molekylerne ------------------------------------------------- */
    var PM = NK.SimMolekyler.prototype;
    var vm = kaffeValg(1);
    vm.fredet = ["faerdig"];
    kobl(PM, vm);

    PM.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };
    PM.introLinjer = function () { return D.INTRO_MOLEKYLER; };
    NK.Praesentation.trin(PM);

    /* Alle fem maal er naaet */
    PM.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PM, D.MAAL_FAERDIG), false);
    };

    /* ----- Fane 3: tavlen ---------------------------------------------------------- */
    var PR = NK.SimRegn.prototype;
    kobl(PR, { fredet: ["faerdig"] });

    /* Han staar mellem de to foerste soejler, saa han ikke daekker en
       hel soejle og dens felt, mens han praesenterer tavlen */
    PR.laererPladsPx = function () {
        var m = this.lay && this.lay.midter;
        return m && m.length > 1 ? (m[0] + m[1]) / 2 : 110;
    };
    PR.introLinjer = function () { return D.INTRO_REGN; };

    /* Det, han peger paa paa tavlen: den groenne boks med den kendte
       stofmaengde, i laerredets pixels (som tegningen i sim_regn.js) */
    PR.introFelt = function (navn) {
        var lay = this.lay, og = this.opg;
        if (navn !== "kendt" || !lay || !og || !lay.midter) return null;
        return { x: lay.midter[og.o.kendt] - lay.feltB / 2, y: lay.feltY, b: lay.feltB, h: 40 };
    };
    NK.Praesentation.trin(PR);

    /* Alle tolv opgaver er loest */
    PR.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PR, D.OPGAVER_FAERDIG), false);
    };

}());

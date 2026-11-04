/* =====================================================================
   laerer.js - Kemichael paa lageret og ved samlebaandet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererLaerredSkala),
   som i sc2.1. Figurens egen skala (laererSkala) roeres ikke, for den
   bruges til haanden, der holder kaffekoppen.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro   hver fane: praesentationen (D.INTRO_LAGER, D.INTRO_BAAND),
             naar eleven vil. Ét trin ad gangen: han siger to til fire
             saetninger i taleboblen, peger paa det, der blinker, og
             bliver staaende, til eleven trykker Naeste. Koden er faelles:
             NK.Praesentation.trin (../kemichael/praesentation.js).
     hylde   fane 1: hele lageret har faaet etiketter. Én replik og K.ros().
             En enkelt hylde roser han ikke (brugerens regel 4. nov. 2026).
     slut    fane 2: spillet er slut med ny rekord, eller alle glas
             endte i kassen uden et eneste rigtigt svar. Ellers tier han.
   Kaffen staar paa bordet paa fane 1 og er det faelles paaskeaeg.
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
            var s = this.laererLaerredSkala();
            NK.Scene.BREDDE = this.L.b / s;
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = this.laererLaerredSkala();
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        P.laererPlads = function () {
            return this.laererPladsPx() / this.laererLaerredSkala();
        };

        /* Det, praesentationen peger paa, og som er tegnet paa laerredet
           (felt i D.INTRO_*), i laerredets pixels */
        P.introFelt = function (navn) {
            var lay = this.lay;
            if (!lay) return null;
            if (navn === "maskine") {
                var m = lay.maskine;
                return { x: m.x, y: m.y, b: m.b, h: m.b * 150 / 240 };
            }
            return null;
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Fane 1: lageret ----------------------------------------------- */
    var PL = NK.SimLager.prototype;
    kobl(PL, {
        fredet: ["hylde"],
        /* Han stiller sig til venstre for koppen og tager den med hoejre haand */
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() - 150 : 700;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
        }
    });

    /* Under praesentationen staar han paa den tomme plads mellem det store
       glas og etiketmaskinen (hvor kuglerne kommer senere), saa han
       hverken daekker glasset, maskinen eller plakaterne */
    PL.laererPladsPx = function () {
        var lay = this.lay;
        if (!lay) return 700;
        return this.kmIntro ? (lay.ionOmr.x0 + lay.ionOmr.x1) / 2 : lay.W * 0.82;
    };

    /* Praesentationen: ét trin ad gangen med Naeste og Spring
       praesentationen over (faelles, ../kemichael/praesentation.js) */
    PL.introLinjer = function () { return D.INTRO_LAGER; };
    NK.Praesentation.trin(PL);

    /* Hele lageret har faaet etiketter: han loefter fingeren og siger det.
       En enkelt hylde roser han ikke (brugerens regel 4. nov. 2026: han
       kommer kun ind, naar en hel fane er gennemfoert). Han peger ikke paa
       reolen, for den staar til venstre for ham, og armen ville gaa hen
       over ansigtet. */
    PL.laererHylde = function (hylde, alleStjerner, alt) {
        var L = this.laerer;
        if (!L || !alt) return;
        var replik = D.LAGER_FAERDIGT;
        this.laererKoer("hylde", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: PL.laererPlads },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    /* ----- Fane 2: samlebaandet ------------------------------------------ */
    var PB = NK.SimBaand.prototype;
    kobl(PB, { fredet: ["slut"] });

    /* Under praesentationen staar han mellem etiketmaskinen og kassen, saa
       han ikke daekker maskinen, han fortaeller om */
    PB.laererPladsPx = function () {
        var lay = this.lay;
        if (!lay) return 600;
        if (!this.kmIntro) return lay.W * 0.62;
        return Math.max(lay.W * 0.62, (lay.maskine.x + lay.maskine.b + lay.kasse.x) / 2);
    };

    /* Praesentationen: den faelles, som paa lageret */
    PB.introLinjer = function () { return D.INTRO_BAAND; };
    NK.Praesentation.trin(PB);

    /* Spillet er slut: én replik ved ny rekord, og en anden, hvis alle
       glas endte i kassen uden et eneste rigtigt svar. Et almindeligt
       spil uden rekord faar ingen replik. */
    PB.laererSlut = function (art) {
        var L = this.laerer;
        if (!L) return;
        var replik = D.SLUT_REPLIK[art];
        if (!replik) return;
        var god = art === "rekord";
        this.laererKoer("slut", [
            { udtryk: god ? { vrede: 0, humoer: 0.8, roed: 0 } : { vrede: 0.2, humoer: -0.2, skeptisk: 1, briller: 1 } },
            { gaa: PB.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } }
        ].concat(god ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };
}());

/* =====================================================================
   laerer.js - Kemichael paa startskaermen

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Han tegnes paa et gennemsigtigt laerred oven paa hele spillet,
   skaleret efter laerredets hoejde (0,92 som i sc2.3), og gulvet
   saettes til laerredets bund, saa kitlen ikke bliver for lang (samme
   loesning som i sc2.2).

   Scener:
     intro    startskaermen: tilbuddet Start praesentation / Nej tak og
              praesentationen (D.INTRO), ét trin ad gangen med Naeste og
              Spring praesentationen over. Han peger paa det, der
              blinker, og gaar aldrig videre af sig selv. Koden er
              faelles: ../kemichael/praesentation.js (NK.Praesentation).
     mester   han kommer forbi og siger én replik, naar nogen bliver
              Labyrintmester (hele spillet er gennemfoert).
   Han kommer aldrig, mens der spilles, og han forklarer ikke teori.
   Baggrundslivet er slaaet fra, saa han ikke gaar hen over labyrinten.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });
    K.baggrundsliv(false);

    var UDE = K.UDE;

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.introVent = 0;
        this.laererStart();
        this.bygTilbud();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: [] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund */
    P.scenemaal = function () {
        var s = this.laererLaerredSkala();
        NK.Scene.BREDDE = this.L.b / s;
        NK.Scene.HOEJDE = this.L.h / s;
        NK.Scene.GULV = this.L.h / s;
        return s;
    };

    /* Til venstre for valgene. Paa en bred skaerm rykker startskaermen
       til hoejre, mens han taler (.start.med-laerer i css/stil.css), saa
       der er plads til ham. */
    P.laererPlads = function () {
        var s = this.laererLaerredSkala();
        return Math.max(120, this.L.b * 0.12 / s);
    };

    P.laererTegnOver = function (ctx) {
        var L = this.laerer;
        if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = this.scenemaal();
        ctx.save();
        ctx.scale(s, s);
        this.tegnLaerer(ctx, this.tid);
        ctx.restore();
    };

    P.synlig = function () {
        var L = this.laerer;
        return !!(L && (L.x > UDE + 40 || L.scene || L.taleAlfa > 0.01));
    };

    P.laererUnder = function (px, py) {
        if (!this.laerer || !this.overLaerer) return false;
        var s = this.scenemaal();
        return !!this.overLaerer({ x: px / s, y: py / s });
    };

    P.laererKlik = function (px, py) {
        if (!this.laererUnder(px, py)) return false;
        return this.klikLaerer();
    };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    P.iScene = function (navn) {
        var L = this.laerer;
        return !!(L && L.scene && L.scene.navn === navn);
    };

    /* ----- Praesentationen ---------------------------------------------
       Faelles kode: ét trin ad gangen med Naeste og Spring
       praesentationen over (../kemichael/praesentation.js). */
    P.introLinjer = function () { return D.INTRO; };
    NK.Praesentation.trin(P);

    /* Et spil gaar i gang: tilbuddet forsvinder (og huskes), og en
       praesentation, der er i gang, slutter. */
    P.stopIntro = function () {
        this.afvisTilbud();
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    /* ----- Labyrintmester ------------------------------------------------
       Den eneste gang, han kommer af sig selv: hele spillet er klaret
       (Mix paa Svaer). */
    P.mesterBesoeg = function () {
        var mig = this;
        var linje = NK.tilfaeldig(D.MESTER_REPLIK);
        this.laererKoer("mester", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0.2, skeptisk: 0, briller: 0 } },
            { gaa: function () { return Math.max(120, mig.L.b * 0.13 / mig.laererLaerredSkala()); } },
            { tid: 0.2 },
            { sig: linje, vis: replikTid(linje), tid: replikTid(linje) },
            { taleFaerdig: true },
            { udtryk: { humoer: 0, roed: 0 } },
            { gaa: UDE }
        ], false);
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterIntro(dt);
        this.opdaterLaerer(dt);
    };

    NK.Praesentation.kobl(P, { noegle: "nk-pacman-intro", tilbud: "tilbud" });

    NK.Laerer = Laerer;
}());

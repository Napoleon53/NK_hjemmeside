/* =====================================================================
   laerer.js - Kemichael ved regnebordet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde, som i sc7.2 (skala 0,92, gulvet ved laerredets bund,
   saa benene ikke bliver lange).

   De tre faner er af samme slags (SimRegn), saa han kobles paa én gang.
   Replikkerne staar i D.INTRO[p] og D.ROS[p].

   Scener:
     intro   praesentationen, naar eleven vil: tre trin pr. fane med to
             til fire hele saetninger. Han peger paa det, der blinker
             (sel: de usynlige .anker over laerredet, opgavekortet og
             lommeregneren), og bliver staaende, til eleven trykker Naeste.
             Taleboblen er et HTML-element med Naeste og Spring
             praesentationen over. Koden er faelles:
             NK.Praesentation.trin (../kemichael/praesentation.js).
     faerdig ros efter fem opgaver paa en fane (én gang pr. browser)
     aeg     lommeregneren gav 42 (én gang pr. besoeg)
   Kaffen staar paa bordet og er det faelles paaskeaeg.

   NB: K.paa laegger selv metoder som laererSig og laererKoer paa
   prototypen. Egne metoder hedder derfor noget andet (laererRos,
   laererAeg).
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

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    var P = NK.SimRegn.prototype;

    K.paa(P, {
        fredet: ["faerdig"],
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 300;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
        }
    });

    P.aendret = function () {};

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

    P.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    /* Under praesentationen staar han til venstre for glasset eller
       flasken, saa han ikke skjuler det, han taler om (kitlen er ca. 100
       enheder bred til hver side). Ellers ved koppen som foer. */
    P.laererPlads = function () {
        var s = this.laererLaerredSkala(), plads = Math.max(150, this.laererPladsPx() / s);
        if (!this.kmIntro || !this.lay) return plads;
        var gl = this.lay.glas;
        return Math.max(80, Math.min(plads, (gl.x - gl.b / 2) / s - 100));
    };

    /* ----- Praesentationen: ét trin ad gangen med Naeste og Spring
             praesentationen over (faelles, ../kemichael/praesentation.js) -- */
    P.introLinjer = function () { return D.INTRO[this.p]; };
    NK.Praesentation.trin(P);

    /* ----- Ros og bemaerkninger ---------------------------------------------------- */
    P.laererRos = function (replik) {
        /* Under praesentationen venter rosen, til han er faerdig */
        if (this.kmIntro) { this.ventRos = 1.5; return; }
        if (!this.laerer || this.laerer.scene) return;
        this.laererKoer("faerdig", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: this.laererPlads },
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

    /* Paaskeaegget: 42 paa lommeregneren. Én gang pr. besoeg. */
    P.laererAeg = function (replik) {
        if (!this.laerer || this.laerer.scene || this.kmIntro || NK.aeg42Vist) return;
        NK.aeg42Vist = true;
        this.laererKoer("aeg", [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: this.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
    };
}());

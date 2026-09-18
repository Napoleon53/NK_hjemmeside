/* =====================================================================
   laerer.js - Kemichael i Salt i vand

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../kemichael/kemichael.js. Den er bygget til et fast tegnebord paa
   1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererSkala), og
   NK.Scene faar kun de maal, figuren selv bruger.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     kogerOver   fane 1: varmepladen har staaet paa max i over 30 s, og
                 opløsningen er begyndt at koge over. Laereren kommer 5 s
                 efter, siger noget om ungdommen og foreslaar en ny
                 krystal. Han lader varmen vaere: eleven maa fortsaette.
     ros         begge faner: alle opgaverne i runden er gennemfoert
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

    var UNGDOMMEN = [
        "Ungdommen i dag tror, at max er en temperatur.",
        "I min tid skruede vi op til 6. Ikke til max.",
        "Tredive sekunder på max. Tålmodighed har de da."
    ];

    var ROS = {
        oploes: "Opløst. Alle sammen. Selv jeg er rørt.",
        maetning: "Mættet. Ligesom mig efter fredagskagen."
    };

    function kobl(P, fane) {
        K.paa(P, { fredet: ["kogerOver", "ros"] });

        P.aendret = function () {};

        P.laererSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = this.laererSkala();
            NK.Scene.BREDDE = this.L.b / s;
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = this.laererSkala();
            if (!this.overLaerer({ x: px / s, y: py / s })) return false;
            return this.klikLaerer();
        };

        P.laererPlads = function () {
            return this.laererPladsPx() / this.laererSkala();
        };

        /* Ros: kort og toer, et ordspil paa fanen. */
        P.laererRos = function () {
            var L = this.laerer;
            if (!L || L.scene) return;
            this.laererKoer("ros", [
                { udtryk: { vrede: 0, humoer: 0.8, roed: 0 } },
                { gaa: P.laererPlads },
                { tid: 0.3 },
                { sig: ROS[fane], vis: 2.8, tid: 2.8,
                  hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
                { kald: function () { this.laerer.nik = 0; } }
            ].concat(K.ros(), [
                { gaa: UDE }
            ]), false);
        };
    }

    kobl(NK.SimOploes.prototype, "oploes");
    kobl(NK.SimMaetning.prototype, "maetning");

    /* ----- Opløsningen koger over ---------------------------------------- */
    NK.SimOploes.prototype.laererKogerOver = function () {
        var L = this.laerer;
        if (!L) return;
        L.scene = null;
        var replik = NK.tilfaeldig(UNGDOMMEN);
        this.laererKoer("kogerOver", [
            { udtryk: { vrede: 0.7, humoer: -0.6, roed: 0.2, briller: 1 } },
            { gaa: NK.SimOploes.prototype.laererPlads },
            { tid: 0.4 },
            { sig: replik, vis: 1.6 + replik.length * 0.05, tid: 1.8 + replik.length * 0.05 },
            { udtryk: { briller: 0, skeptisk: 1 } },
            K.suk(1.1),
            { arm: 0, tid: 0.5 },
            { sig: "Ny krystal er også en knap.", vis: 2.4, tid: 2.6 },
            { arm: HAENGER, tid: 0.4 },
            { udtryk: { skeptisk: 0 } }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]), false);
    };
}());

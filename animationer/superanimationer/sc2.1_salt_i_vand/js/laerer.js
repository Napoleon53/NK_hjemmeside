/* =====================================================================
   laerer.js - Kemichael i Salt i vand

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord paa
   1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererSkala), og
   NK.Scene faar kun de maal, figuren selv bruger.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     kogerOver   fane 1: varmepladen har staaet paa max i over 30 s, og
                 opløsningen er begyndt at koge over (paaskeaegget).
                 Laereren kommer 5 s efter, siger noget om ungdommen og
                 naevner knappen Ny krystal. Han lader varmen vaere:
                 eleven maa fortsaette.
     ros         begge faner: alle fire opgaver paa fanen er gennemfoert.
                 Kun foerste gang pr. besoeg; en ny runde giver ingen ny ros.

   Brugerens regel 4. nov. 2026: han kommer kun ind af sig selv, naar en
   hel fane er gennemfoert, eller naar eleven goer noget vildt, og han
   taler altid formelt, i hele saetninger som i Kemibogen. Ros paa
   laerredets taleboble er hoejst ca. 130 tegn.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

    /* Paaskeaegget: opløsningen koger over. Først én af disse, saa NY_KRYSTAL. */
    var UNGDOMMEN = [
        "Ungdommen i dag tror, at max er en temperatur.",
        "I min tid skruede vi varmepladen op til 6 og aldrig helt op til max.",
        "Varmepladen har stået på max i over 30\u00a0sekunder. Tålmodighed mangler ungdommen ikke."
    ];
    /* \u00a0 er et haardt mellemrum, saa knappens navn ikke deles i taleboblen */
    var NY_KRYSTAL = "Der findes også en knap, der hedder Ny\u00a0krystal.";

    /* Ros, foerste gang alle fire opgaver paa en fane er gennemfoert */
    var ROS = {
        oploes: "Du har gennemført alle fire opgaver om opløsningen. Selv jeg er rørt.",
        maetning: "Du har gennemført alle fire opgaver om mættede opløsninger. Jeg er også mættet efter fredagskagen."
    };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

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

        /* Ros: toer, et ordspil paa fanen. Kun én gang pr. fane pr. besoeg. */
        P.laererRos = function () {
            var L = this.laerer;
            if (!L || L.scene || this.laererRost) return;
            this.laererRost = true;
            var tekst = ROS[fane], varer = replikTid(tekst);
            this.laererKoer("ros", [
                { udtryk: { vrede: 0, humoer: 0.8, roed: 0 } },
                { gaa: P.laererPlads },
                { tid: 0.3 },
                /* Han nikker de foerste 2,8 s, ogsaa naar replikken staar laengere */
                { sig: tekst, vis: varer, tid: varer,
                  hver: function (t) {
                      var u = t * varer / 2.8;
                      this.laerer.nik = u < 1 ? Math.sin(u * Math.PI * 3) * 5 : 0;
                  } },
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
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) + 0.2 },
            { udtryk: { briller: 0, skeptisk: 1 } },
            K.suk(1.1),
            { arm: 0, tid: 0.5 },
            { sig: NY_KRYSTAL, vis: replikTid(NY_KRYSTAL), tid: replikTid(NY_KRYSTAL) + 0.2 },
            { arm: HAENGER, tid: 0.4 },
            { udtryk: { skeptisk: 0 } }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]), false);
    };

    /* Til selvtesten */
    NK.LaererReplikker = { UNGDOMMEN: UNGDOMMEN, NY_KRYSTAL: NY_KRYSTAL, ROS: ROS };
}());

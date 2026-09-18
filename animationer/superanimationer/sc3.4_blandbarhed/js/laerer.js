/* =====================================================================
   laerer.js - Kemichael i sc3.4

   Figuren selv (gang, arm, ansigt, tale og klik paa ham) staar i
   ../kemichael/kemichael.js og er tegnet til et bord paa 1000 x 600
   enheder. Det er praecis det tegnebord, begge faner bruger, saa han
   tegnes i bordets egne koordinater uden ekstra skalering.

   Scener:
     uheld   fane 1: en flaske er vaeltet paa gulvet, et reagensglas er
             gaaet i stykker, eller et glas er loebet over. Han kommer,
             siger noget toert og rydder op. Forsoeget kan fortsaette.
     ros     begge faner: alle opgaverne i runden er gennemfoert.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    NK.Scene.BREDDE = 1000;
    NK.Scene.HOEJDE = 600;
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

    var UHELD = {
        spild: [
            "Gulvet skulle alligevel vaskes.",
            "Den flaske stod godt, hvor den stod.",
            "Væsker falder nedad. Hver gang."
        ],
        knust: [
            "Skårene gemmer jeg. Til en kunstinstallation.",
            "Et glas mindre. Jeg fører regnskab.",
            "Glas og gulv. Klassikeren."
        ],
        overloeb: [
            "Glasset var fuldt. Det er det stadig. Bare udenfor.",
            "Tolv milliliter er tolv milliliter."
        ]
    };

    var ROS = {
        bland: "Ét lag eller to. Begge dele er et resultat.",
        faser: "Destilleret. Ikke drukket."
    };

    /* ------------------------------------------------------------------
       Det, begge faner har til faelles
       ------------------------------------------------------------------ */
    function kobl(P, fane) {
        K.paa(P, { kaffeX: 150, fredet: ["uheld", "ros"] });

        P.aendret = function () {};

        /* Laereren tegnes i tegnebordets egne enheder. Lærredet er
           allerede skaleret, naar tegnLaerer kaldes. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            this.tegnLaerer(ctx, this.tid);
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var p = NK.tilBord(this.br, px, py);
            if (!this.overLaerer(p)) return false;
            return this.klikLaerer();
        };

        /* Hvor han stiller sig, i tegnebordets egne enheder. */
        P.laererPlads = function () {
            return this.laererPladsBord();
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

    kobl(NK.SimBland.prototype, "bland");
    kobl(NK.SimFaser.prototype, "faser");

    /* ------------------------------------------------------------------
       Uheldet paa fane 1
       ------------------------------------------------------------------ */
    NK.SimBland.prototype.laererUheld = function (slags) {
        var L = this.laerer;
        if (!L) return;
        var mig = this;
        var replik = NK.tilfaeldig(UHELD[slags] || UHELD.spild);
        var hvor = this.uheld ? NK.klamp(this.uheld.x, 90, 880) : 500;

        L.scene = null;
        this.laererKoer("uheld", [
            { udtryk: { vrede: 0.6, humoer: -0.5, roed: 0.15, briller: 1 } },
            { gaa: hvor, fart: 520 },
            { tid: 0.35 },
            { sig: replik, vis: 1.8 + replik.length * 0.045, tid: 2.0 + replik.length * 0.045 },
            { udtryk: { briller: 0, skeptisk: 1 } },
            K.suk(1.0),
            /* Han boejer sig ned og tørrer op. */
            { arm: 1.35, tid: 0.6 },
            { tid: 1.1, hver: function () {
                if (this.uheld) this.uheld.ur = Math.max(0, this.uheld.ur - 0.06);
            } },
            { kald: function () { mig.ryddet(); if (NK.Lyd) NK.Lyd.papir(); } },
            { arm: HAENGER, tid: 0.5 },
            { sig: "Værsgo. Prøv igen.", vis: 2.0, tid: 2.2 },
            { udtryk: { skeptisk: 0 } }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]), false);
    };
}());

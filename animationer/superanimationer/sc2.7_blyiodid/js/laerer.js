/* =====================================================================
   laerer.js - Kemichael i blyiodidforsoeget

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Paaskeaeg og uheld:
     spild     hektiske klik paa et stofglas: pulveret spildes, og
               laereren toerrer op
     varmt     glasset tages op over 50 °C: der skvulper lidt ud, og
               laereren toerrer op
     koger     vandet har kogt et stykke tid: laereren kigger ind fra
               kanten og siger til
     ros       tre maalinger er noteret

   Glimt af baggrunden: vejleder (spildet), laege (punkterne paa kurven)
   og regnskabet over uheld (spildet og det varme glas).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 130, fredet: ["spild", "varmt"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
        this.laerer.rost = false;
    };

    /* ----- Ros ---------------------------------------------------------- */
    P.laererRos = function (paaKurven) {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: paaKurven ? 0.9 : 0.3, roed: 0 } },
            { gaa: 150 },
            { tid: 0.3 },
            { sig: paaKurven ? "Flot. Punkterne ligger på kurven." : "Tre målinger. Sammenlign med kurven.", vis: 2.6, tid: 2.6,
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } }
        ].concat(paaKurven ? K.glimtTrin("laege") : [], K.ros(), [
            { gaa: UDE }
        ]), false);
    };

    /* ----- Vandet koger: laereren kigger ind fra kanten ------------------ */
    P.laererKoger = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.laererKoer("koger", [
            { udtryk: { vrede: 0.7, humoer: -0.4, roed: 0.1, laen: 1 } },
            { gaa: K.KANT },
            { sig: "Det koger. Skru ned for varmen.", vis: 2.6, tid: 2.8 },
            { udtryk: { laen: 0 } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Uheldet: pulveret blev spildt ------------------------------------ */
    P.laererSpild = function (stof) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        var vejleder = K.glimtTrin("vejleder");
        var regnskab = K.uheld();
        this.laererKoer("spild", [
            { tid: 0.6 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3 } },
            { gaa: function () { return (mig.spild ? mig.spild.x : 220) - 130; } },
            { sig: stof === "pb" ? "Pb(NO₃)₂ er giftigt. Ro på." : "Ro på med spatlen.", vis: 2.4, tid: 0.3 },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.spild) this.spild.alfa = 1 - t;
                if (t >= 0.99) this.spild = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "En spatelspids ad gangen.", vis: 2.2, tid: 1.2 }
        ].concat(vejleder, regnskab, [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheldet: glasset var for varmt at tage fat i -------------------- */
    P.laererVarmt = function () {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        this.laererKoer("varmt", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.8, humoer: -0.7, roed: 0.2, briller: 1 } },
            { gaa: function () { return (mig.skvulp ? mig.skvulp.x : 590) - 130; } },
            { sig: "Varmt glas ser ud præcis som koldt glas.", vis: 2.8, tid: 0.3 },
            { udtryk: { briller: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.skvulp) this.skvulp.alfa = 1 - t;
                if (t >= 0.99) this.skvulp = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Termometret. Under 50 °C.", vis: 2.4, tid: 1.4 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        }
    };
}());

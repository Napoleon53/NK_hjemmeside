/* =====================================================================
   laerer.js - Kemichael i knaldgasforsoeget

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Uheld og paaskeaeg:
     slukket   et glas, der ikke er fuldt, holdes ind over flammen: vandet
               slukker den. Laereren toerrer op og taender braenderen igen
     overfyld  der lukkes mere gas ind i et fuldt glas: laereren kigger ind
               fra kanten
     kaffe     klik paa koppen paa hylden: laereren henter sin kaffe

   Glimt af baggrunden: kaffeKold (kaffen) og regnskabet over uheld
   (flammen).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["slukket"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
    };

    /* ----- Uheld: vandet i glasset slukkede flammen ------------------------ */
    P.laererSlukket = function () {
        var L = this.laerer;
        L.scene = null;
        this.laererKoer("slukket", [
            { tid: 0.6 },
            { udtryk: { vrede: 0.8, humoer: -0.7, roed: 0.2 } },
            { gaa: S.BRAENDER.x - 170 },
            K.suk(),
            { sig: "Vand og flammer. Gæt, hvem der vinder.", vis: 2.8, tid: 0.3 },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.pyt) this.pyt.vaad = 1 - t;
                if (t >= 0.99) this.pyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; } },
            { arm: 1.2, tid: 0.4 },
            { kald: function () {
                this.flammeSlukket = false;
                if (NK.Lyd) NK.Lyd.taend();
                this.aendret("flamme");
            } },
            { tid: 0.5 },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Seks streger. Så antænder man.", vis: 2.4, tid: 1.4 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Gas i et fuldt glas: laereren kigger ind fra kanten ------------- */
    P.laererOverfyld = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.laererKoer("overfyld", [
            { udtryk: { vrede: 0.5, humoer: -0.3, roed: 0, skeptisk: 1, laen: 1 } },
            { gaa: K.KANT },
            { sig: "Seks streger. Resten går til loftet.", vis: 2.8, tid: 3.0 },
            { udtryk: { skeptisk: 0, laen: 0 } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        }
    };
}());

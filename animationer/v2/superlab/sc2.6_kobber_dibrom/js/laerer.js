/* =====================================================================
   laerer.js - Kemichael i forsoeget med kobber og dibrom

   Selve figuren (gang, arm, ansigt, tale, klik paa ham) staar i
   ../../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Uheld og paaskeaeg:
     kaffe     klik paa koppen paa hylden: laereren henter sin kaffe
     spild     kolben rystes uden prop, og bromvandet skvulper ud:
               laereren uskadeliggoer det med natriumthiosulfat og
               toerrer op
     udsugning brom er fremme, og udsugningen er slukket: laereren
               loeber ind og taender den
     vask      rester med tungmetalioner paa vej i vasken: laereren
               loeber ind og stopper det
     knust     kolben er tabt og knust: laereren kigger ind fra kanten,
               mens eleven rydder op (uheld.js)

   Glimt af baggrunden: kaffeKold (kaffen) og regnskabet over uheld.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["spild", "udsugning", "vask"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
    };

    /* ----- Uheld: bromvandet skvulpede ud af kolben uden prop ------------- */
    P.laererSpild = function () {
        var L = this.laerer;
        var mig = this;
        var anden = false;
        L.scene = null;
        this.laererKoer("spild", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, skeptisk: 0.8 } },
            { gaa: function () { return (mig.spildPyt ? mig.spildPyt.x : 340) - 140; } },
            K.suk(),
            { sig: "Proppen virker bedst i kolben.", vis: 2.4, tid: 0.3 },
            { udtryk: { skeptisk: 0 } },
            { arm: 1.6, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "spray"; if (NK.Lyd) NK.Lyd.spray(); } },
            { tid: 1.4, hver: function (t) {
                if (this.spildPyt) this.spildPyt.neutral = Math.max(this.spildPyt.neutral, NK.blod(t));
                if (t > 0.5 && !anden) { anden = true; if (NK.Lyd) NK.Lyd.spray(); }
            } },
            { kald: function () {
                if (this.spildPyt) { this.spildPyt.neutral = 1; this.spildPyt.brom = false; }
                this.laerer.baerer = "papir";
                if (NK.Lyd) NK.Lyd.papir();
            } },
            { arm: 1.8, tid: 0.3 },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.spildPyt) this.spildPyt.vaad = 1 - t;
                if (t >= 0.99) this.spildPyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Bromvand igen. Med prop.", vis: 2.2, tid: 1.2 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheld: brom fremme uden udsugning ------------------------------ */
    /* Laereren loeber ind under stinkskabets panel, rækker op og taender
       udsugningen. Replikken skifter, hvis det sker igen. */
    var UDSUGNING_REPLIKKER = ["Udsugningen er ikke pynt.", "Igen. Den skal være tændt.", "Nu bliver den stående tændt."];

    P.laererUdsugning = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.udsugningUheld = (this.udsugningUheld || 0) + 1;
        var replik = UDSUGNING_REPLIKKER[Math.min(this.udsugningUheld, UDSUGNING_REPLIKKER.length) - 1];
        this.laererKoer("udsugning", [
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.35 } },
            { gaa: 800, loeb: true },
            { sig: replik, vis: 2.4, tid: 0.2 },
            { arm: 0.35, tid: 0.45 },
            { kald: function () {
                if (this.udsugning) return;
                this.udsugning = true;
                if (NK.Lyd) { NK.Lyd.klik(); NK.Lyd.udsugning(true); }
                this.aendret("udsugning");
            } },
            { tid: 1.2 },
            { arm: HAENGER, tid: 0.4 },
            K.suk()
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheld: tungmetalrester paa vej i vasken ------------------------ */
    P.laererVask = function () {
        var L = this.laerer;
        L.scene = null;
        this.laererKoer("vask", [
            { udtryk: { vrede: 1, humoer: -1, roed: 0.5 } },
            { gaa: 640, loeb: true },
            { sig: "Stop! Ikke i vasken.", vis: 2.0, tid: 1.5 },
            { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.2, briller: 1 } },
            { arm: 0.9, tid: 0.4 },
            { sig: "Tungmetal. Dunken står lige der.", vis: 2.6, tid: 2.4 },
            { kald: function () { this.markér("dunk", 4); } },
            { arm: HAENGER, tid: 0.4 },
            { udtryk: { briller: 0 } },
            K.suk()
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Kolben er knust: laereren kigger ind, mens eleven rydder op ----- */
    P.laererKnust = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.laererKoer("knust", [
            { tid: 0.8 },
            { udtryk: { vrede: 0.7, humoer: -0.7, roed: 0.2, laen: 1 } },
            { gaa: K.KANT },
            K.suk(),
            { sig: "Kolber holdes. De kastes ikke.", vis: 2.6, tid: 2.8 }
        ].concat(K.uheld(), [
            { udtryk: { laen: 0 } },
            { gaa: UDE }
        ]), false);
    };

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        } else if (L.baerer === "spray") {
            NK.Sprites.tegnPositur(ctx, "spray", { x: hd.x + 2, y: hd.y - 4, v: -0.4 }, S.ANKER.spray, 1, 0.7);
        }
    };
}());

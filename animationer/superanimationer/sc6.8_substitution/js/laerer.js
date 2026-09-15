/* =====================================================================
   laerer.js - Kemichael i substitutionsforsoeget

   Selve figuren (gang, arm, ansigt, tale, klik paa ham) staar i
   ../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Paaskeaeg:
     kaffe     klik paa koppen paa hylden: laereren tager den med, fordi
               der ikke drikkes i laboratoriet, og drikker paa vej ud
     uheld     proppen springer af under voldsom rystning: laereren
               sukker, kommer med koekkenrulle og toerrer pytten op
     ros       begge tests er lavet i begge glas: laereren roser
     dab       et saerlig godt forsoeg: laereren dabber
     hexen     hex-1-en i et glas: en addition, som ikke hoerer til forsoeget
     sluklampe lampen staar taendt uden glas under sig

   Glimt af baggrunden: kaffePause (kaffen), dab, stroem (lampen) og
   regnskabet over uheld (proppen).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { fredet: ["uheld"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
        this.laerer.rost = false;
    };

    /* ----- Kaffen: tages med ud af laboratoriet --------------------------- */
    P.klikKop = function () {
        var L = this.laerer, kop = this.g.kaffekop;
        if (L.scene || kop.skjult) return false;
        var pause = K.glimt("kaffePause");
        this.laererKoer("kaffe", [
            { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1 } },
            { gaa: 130 },
            { sig: "Der drikkes ikke i laboratoriet.", vis: 2.6, tid: 0.3 },
            { arm: -0.5, tid: 0.55 },
            { kald: function () { kop.iHaand = true; this.laerer.baerer = "kaffekop"; kop.skjult = true; this.koppenVaek = true; } },
            { arm: -0.3, tid: 0.5 },
            { tid: 1.2 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { gaa: -40 },
            { arm: -0.98, tid: 0.5 },
            { kald: function () { if (NK.Lyd) NK.Lyd.slurk(); } },
            { udtryk: { vrede: 0.1, humoer: 0.6, roed: 0 } },
            pause ? { sig: pause, vis: 2.0, tid: 1.8 } : { sig: "Ahh.", vis: 1.3, tid: 1.2 },
            { arm: -0.3, tid: 0.3 },
            { gaa: UDE },
            { kald: function () { this.laerer.baerer = null; } }
        ]);
        return true;
    };

    /* ----- Ros ---------------------------------------------------------- */
    P.laererRos = function () {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 150 },
            { tid: 0.3 },
            { sig: "Flot. Et rigtigt kontrolforsøg.", vis: 2.4, tid: 2.4, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } },
            { gaa: UDE }
        ], false);
    };

    /* Et saerlig godt forsoeg: laereren dabber */
    P.laererDab = function () {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("dab", [
            { udtryk: { vrede: 0, humoer: 1, roed: 0 } },
            { gaa: 210 },
            { sig: "Flot!", vis: 1.2, tid: 0.9 },
            { kald: function () { if (NK.Lyd) NK.Lyd.bom(); } },
            { arm: -2.35, tid: 0.28, hver: function (t) {
                var e = NK.blod(t);
                this.laerer.hovedV = 0.6 * e;
                this.laerer.hovedDx = 18 * e;
                this.laerer.hovedDy = 14 * e;
            } },
            { tid: 1.4, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 4) * 2; } },
            { arm: HAENGER, tid: 0.4, hver: function (t) {
                var e = 1 - NK.blod(t);
                this.laerer.hovedV = 0.6 * e;
                this.laerer.hovedDx = 18 * e;
                this.laerer.hovedDy = 14 * e;
                this.laerer.nik = 0;
            } },
            { sig: "Et rigtigt kontrolforsøg.", vis: 2.2, tid: 1.6 }
        ].concat(K.glimtTrin("dab"), [
            { gaa: UDE }
        ]), false);
    };

    /* Hex-1-en i glasset: en addition, som ikke hoerer til forsoeget */
    P.laererHexen = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.laererKoer("hexen", [
            { udtryk: { vrede: 0.7, humoer: -0.4, roed: 0.1, skeptisk: 1, briller: 1 } },
            { gaa: 200 },
            { sig: "Hexen? Det giver en addition.", vis: 2.4, tid: 2.5 },
            { sig: "Det er ikke en del af forsøget.", vis: 2.4, tid: 2.2 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ], false);
    };

    /* Lampen staar taendt uden glas under sig */
    P.laererSlukLampe = function () {
        var L = this.laerer;
        if (L.scene) return;
        this.laererKoer("sluklampe", [
            { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1 } },
            { gaa: 640 },
            { sig: "Sluk lampen, når den ikke bruges.", vis: 2.6, tid: 0.4 },
            { arm: -0.9, tid: 0.5 },
            { kald: function () { this.lampeTaendt = false; if (NK.Lyd) NK.Lyd.kontakt(); this.aendret("lampe"); } },
            { tid: 0.5 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.glimtTrin("stroem"), [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheldet: proppen sprang af ------------------------------------ */
    P.laererUheld = function (gl) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        this.laererKoer("uheld", [
            { tid: 0.6 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3 } },
            { gaa: function () { return (mig.pyt ? mig.pyt.x : 400) - 130; } },
            K.suk(),
            { sig: "Ryst med omtanke.", vis: 2.4, tid: 0.3 },
            { arm: -1.25, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = -1.25 + Math.sin(t * Math.PI * 7) * 0.22;
                if (this.pyt) this.pyt.vaad = 1 - t;
                if (t >= 0.99) this.pyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Fyld glas " + gl.nr + " igen.", vis: 2.2, tid: 1.2 }
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

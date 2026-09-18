/* =====================================================================
   laerer.js - Kemichael i substitutionsforsoeget

   Selve figuren (gang, arm, ansigt, tale, klik paa ham) staar i
   ../../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Paaskeaeg og uheld:
     uheld     indholdet sproejter ud af et glas, fordi proppen sprang af
               under voldsom rystning, eller fordi der blev rystet uden
               prop: laereren sukker, kommer med koekkenrulle og toerrer
               pytten op
     udsugning brom er fremme, og udsugningen er slukket: laereren
               loeber ind og taender den
     ros       begge tests er lavet i begge glas: laereren roser
     dab       et saerlig godt forsoeg: laereren dabber
     hexen     hex-1-en i et glas: en addition, som ikke hoerer til forsoeget
     sluklampe lampen staar taendt uden glas under sig

   Glimt af baggrunden: dab, stroem (lampen) og regnskabet over uheld
   (spildet og udsugningen). Kaffen er faelles.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { fredet: ["uheld", "udsugning"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
        this.laerer.rost = false;
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
            { kald: function () { this.laerer.nik = 0; } }
        ].concat(K.ros(), [
            { gaa: UDE }
        ]), false);
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
        ].concat(K.glimtTrin("dab"), K.ros(), [
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

    /* ----- Uheld: indholdet sproejtede ud af et glas ---------------------- */
    /* slags: "prop" (proppen sprang af) eller "udenProp" */
    P.laererUheld = function (gl, slags) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        this.laererKoer("uheld", [
            { tid: 0.6 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, skeptisk: slags === "udenProp" ? 0.8 : 0 } },
            { gaa: function () { return (mig.pyt ? mig.pyt.x : 400) - 130; } },
            K.suk(),
            { sig: slags === "udenProp" ? "Proppen virker bedst i glasset." : "Ryst med omtanke.", vis: 2.4, tid: 0.3 },
            { udtryk: { skeptisk: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
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

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        }
    };
}());

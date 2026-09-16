/* =====================================================================
   laerer.js - Kemichael i forsoeget med indgreb i en kemisk ligevaegt

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og kaffen) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til
   dette forsoeg.

   Uheld (laereren toerrer op eller henter mere):
     spild      et glas, et baegerglas, kolben eller et bad blev rystet saa
                voldsomt, at det skvulpede ud, eller en beholder loeb over
     kolbeDunk  stamoploesningen blev haeldt i affaldsdunken

   Bemaerkninger (forsoeget fortsaetter):
     glas7      referenceglasset faar et indgreb
     blandet    et glas faar to slags indgreb
     kunst      frugtfarve og ligevaegtsblanding i samme baegerglas
     ros        billedet af glas 1 til 7 er taget

   Glimt af baggrunden: afslag (glas 7) og regnskabet over uheld.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["spild", "kolbeDunk"] });

    P.laererNytEkstra = function () {
        this.laerer.baerer = null;
        this.laererVent = [];
    };

    /* Bemaerkninger, der ventede paa, at laereren blev ledig */
    P.laererVentende = function () {
        var L = this.laerer;
        if (!L || L.scene || !this.laererVent || !this.laererVent.length) return;
        var v = this.laererVent.shift();
        if (this[v.fn]) this[v.fn](v.arg);
    };

    /* En kort bemaerkning: han kommer ind, siger replikkerne og gaar igen */
    function bemaerkning(mig, navn, x, udtryk, replikker, ekstra) {
        var trin = [{ udtryk: udtryk }, { gaa: x }];
        replikker.forEach(function (rp, i) {
            if (i > 0) trin.push({ tid: 0.2 });
            trin.push({ sig: rp, vis: 1.4 + rp.length * 0.05, tid: 1.5 + rp.length * 0.05 });
        });
        trin = trin.concat(ekstra || [], [
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ]);
        mig.laererKoer(navn, trin, false);
    }

    function sig(tekst) {
        return { sig: tekst, vis: 1.4 + tekst.length * 0.05, tid: 1.5 + tekst.length * 0.05 };
    }

    /* ----- Uheld: spild ------------------------------------------------------ */
    var RYST_REPLIKKER = ["Det skal blandes, ikke kastes.", "Glasudstyr er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."];

    P.laererSpild = function (c, slags) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        var replik;
        if (slags === "overloeb") replik = c.erGlas ? "Fuldt er fuldt." : "Der står 100 mL på glasset. Det er et loft.";
        else if (slags === "kolbe") replik = "Det var stamopløsning til hele klassen.";
        else if (slags === "bad") replik = "Badet skal stå stille. Det er det, der er pointen.";
        else replik = RYST_REPLIKKER[Math.min(this.rystUheld, RYST_REPLIKKER.length) - 1];
        var slut = slags === "kolbe" ? [sig("Der er mere i forberedelsen.")] : [];
        this.laererKoer("spild", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, skeptisk: slags === "overloeb" ? 0.8 : 0 } },
            { gaa: function () { return (mig.pyt ? mig.pyt.x : 400) - 130; } },
            K.suk(),
            { sig: replik, vis: 2.4, tid: 0.3 },
            { udtryk: { skeptisk: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                if (this.pyt) this.pyt.vaad = 1 - t;
                if (t >= 0.99) this.pyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(slut, K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Uheld: stamoploesningen i affaldet --------------------------------- */
    P.laererKolbeDunk = function (k) {
        var L = this.laerer;
        L.scene = null;
        this.laererKoer("kolbeDunk", [
            { tid: 0.6 },
            { udtryk: { vrede: 1, humoer: -0.9, roed: 0.45, briller: 1 } },
            { gaa: 150, loeb: true },
            sig("Stamopløsning i affaldet."),
            K.suk(1.4),
            sig("Den var til hele klassen."),
            { arm: -0.4, tid: 0.5 },
            { tid: 0.8 },
            { kald: function () { k.tom = false; if (NK.Lyd) NK.Lyd.haeld(0.8); this.aendret("kolbe"); } },
            { arm: HAENGER, tid: 0.4 },
            { udtryk: { briller: 0 } },
            sig("Der er mere i forberedelsen. Én gang.")
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Glassene ------------------------------------------------------------ */
    P.laererGlas7 = function () {
        bemaerkning(this, "glas7", 300, { vrede: 0.5, humoer: -0.5, skeptisk: 1, briller: 1 },
            ["Glas 7 skulle stå ved stuetemperatur."],
            K.glimtTrin("afslag").concat([K.suk(), sig("Nu er der ingen urørt reference.")]));
    };

    P.laererBlandet = function (gl) {
        bemaerkning(this, "blandet", 300, { vrede: 0.3, humoer: -0.2, skeptisk: 1, briller: 1 },
            ["Ét indgreb pr. glas.", "Ellers ved ingen, hvad der virkede."]);
    };

    P.laererKunst = function () {
        bemaerkning(this, "kunst", 300, { vrede: 0.3, humoer: -0.1, skeptisk: 1, briller: 1 },
            ["Frugtfarve og ligevægt i samme glas.", "Kunstnerisk. Men ikke et forsøg."]);
    };

    /* ----- Ros ------------------------------------------------------------------ */
    P.laererRos = function (forkert) {
        if (forkert) {
            bemaerkning(this, "ros", 240, { vrede: 0.1, humoer: 0.1, skeptisk: 1, briller: 1 },
                ["Kig en gang til på glas " + forkert.nr + "."]);
            return;
        }
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 240 },
            { tid: 0.3 },
            { sig: "Flot. Det var til at se rødt.", vis: 2.4, tid: 2.4, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } }
        ].concat(K.ros(), [
            { gaa: UDE }
        ]), false);
    };

    /* ----- Tegning ------------------------------------------------------------- */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, NK.Scene.ANKER.papir);
        }
    };
}());

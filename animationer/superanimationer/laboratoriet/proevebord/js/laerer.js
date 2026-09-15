/* =====================================================================
   laerer.js - Kemichael paa proevebordet

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og kaffen) staar
   i ../../../kemichael/kemichael.js. Her staar de scener, der hoerer til
   bordet.

   Uheld (laereren toerrer op):
     spild      et aabent glas blev rystet, saa det skvulpede ud
     vaeltet    et reagensglas blev sat paa bordet og vaeltede
     overloeb   en beholder loeb over

   Bemaerkninger (bordet fortsaetter):
     affald     en hel flaske blev haeldt i affaldsdunken; han fylder
                den op igen, én gang
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var P = NK.Bord.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["spild"] });

    P.laererNytEkstra = function () {
        this.laererVent = [];
        this.uheldTal = {};
        this.flaskerFyldt = {};
    };

    /* Bemaerkninger, der ventede paa, at laereren blev ledig */
    P.laererKo = function (fn, arg) {
        this.laererVent = this.laererVent || [];
        for (var i = 0; i < this.laererVent.length; i++) if (this.laererVent[i].fn === fn) return;
        this.laererVent.push({ fn: fn, arg: arg });
    };

    P.laererVentende = function () {
        var L = this.laerer;
        if (!L || L.scene || !this.laererVent || !this.laererVent.length) return;
        var v = this.laererVent.shift();
        if (this[v.fn]) this[v.fn](v.arg);
    };

    function sig(tekst) {
        return { sig: tekst, vis: 1.4 + tekst.length * 0.05, tid: 1.5 + tekst.length * 0.05 };
    }

    /* En kort bemaerkning: han kommer ind, siger replikkerne og gaar igen */
    function bemaerkning(mig, navn, x, udtryk, replikker, ekstra) {
        var trin = [{ udtryk: udtryk }, { gaa: x }];
        replikker.forEach(function (rp, i) {
            if (i > 0) trin.push({ tid: 0.2 });
            trin.push(sig(rp));
        });
        trin = trin.concat(ekstra || [], [
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ]);
        mig.laererKoer(navn, trin, false);
    }

    /* ----- Uheld: han toerrer op ------------------------------------------ */
    var REPLIK = {
        spild:    ["Det skal blandes, ikke kastes.", "Glasudstyr er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."],
        rystet:   ["Det skal blandes, ikke kastes.", "Glasudstyr er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."],
        vaeltet:  ["Et reagensglas kan ikke stå. Derfor stativet.", "Stativet. Lige der.", "Igen. Stativet står stadig samme sted."],
        overloeb: ["Fuldt er fuldt.", "Der står et tal på glasset. Det er et loft.", "Man kan ikke hælde to liter i en halv."]
    };

    P.laererUheld = function (slags, gg) {
        var mig = this;
        var L = this.laerer;
        if (!L) return;
        L.scene = null;
        this.uheldTal = this.uheldTal || {};
        this.uheldTal[slags] = (this.uheldTal[slags] || 0) + 1;
        var liste = REPLIK[slags] || REPLIK.spild;
        var replik = liste[Math.min(this.uheldTal[slags], liste.length) - 1];
        var pyt = this.pytter[this.pytter.length - 1];
        this.laererKoer("spild", [
            { tid: 0.5 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3, skeptisk: slags === "overloeb" ? 0.8 : 0, briller: slags === "vaeltet" ? 1 : 0 } },
            { gaa: function () { return NK.klamp((pyt ? pyt.x : gg.p.x) - 130, 60, NK.Scene.BREDDE - 260); } },
            K.suk(),
            { sig: replik, vis: 2.4, tid: 0.3 },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { arm: 1.8, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd && NK.Lyd.papir) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = 1.8 + Math.sin(t * Math.PI * 7) * 0.14;
                this.pytter.forEach(function (p) { p.vaad = Math.min(p.vaad, 1 - t); });
                if (t >= 0.99) this.pytter = [];
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd && NK.Lyd.brum) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.uheld(), [
            { gaa: UDE }
        ]));
    };

    /* ----- Bemaerkninger --------------------------------------------------- */
    P.laererHaendelse = function (type, data) {
        if (type === "affald" && data.fra && data.fra.kan.flaske && data.indhold && data.indhold.V > 20) {
            this.laererKo("laererFlaskeAffald", data.fra);
            this.laererVentende();
        }
    };

    /* En hel flaske i affaldsdunken: han fylder den op igen, én gang */
    P.laererFlaskeAffald = function (fl) {
        var mig = this;
        this.flaskerFyldt = this.flaskerFyldt || {};
        var foer = this.flaskerFyldt[fl.navn];
        this.flaskerFyldt[fl.navn] = true;
        var ekstra = foer ? [sig("Ikke to gange.")] : [
            { arm: -0.4, tid: 0.5 },
            { tid: 0.8 },
            { kald: function () {
                fl.indhold = NK.Stof.lav(fl.spec.indhold);
                if (NK.Lyd && NK.Lyd.haeld) NK.Lyd.haeld(0.8);
                this.aendret("flaske");
            } },
            { arm: HAENGER, tid: 0.4 },
            sig("Der er mere i forberedelsen. Én gang.")
        ];
        bemaerkning(this, "affald", 150, { vrede: 1, humoer: -0.9, roed: 0.45, briller: 1 },
            ["En hel flaske i affaldet.", foer ? "Det var den sidste." : "Den var til hele klassen."], ekstra);
    };

    /* ----- Tegning ------------------------------------------------------------- */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "koekkenrulle", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, { x: 36, y: 22 });
        }
    };
}());

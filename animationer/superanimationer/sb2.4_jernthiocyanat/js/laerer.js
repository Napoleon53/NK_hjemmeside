/* =====================================================================
   laerer.js - Kemichael i jernthiocyanat-forsoeget

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og kaffen) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til
   dette forsoeg.

   Uheld (laereren toerrer op):
     spild      et glas blev rystet saa voldsomt, at indholdet
                sproejtede ud, eller et glas eller baegerglasset loeb over

   Bemaerkninger (forsoeget fortsaetter):
     farveloes  stamoploesningen mangler Fe(NO3)3 eller KSCN
     soelv      der er dryppet AgNO3 i stamoploesningen
     moerk      stamoploesningen er saa moerk, at intet kan ses
     lys        stamoploesningen er naesten farveloes
     ujaevn     der blev ikke roert om, og glassene fik forskellig farve
     blandet    et glas faar to slags indgreb
     ingenRef   alle fem glas har faaet et indgreb
     ros        glassene er sammenlignet

   Glimt af baggrunden: afslag (ingen reference) og regnskabet over uheld.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var M = NK.Model;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["spild"] });

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

    /* ----- Uheld: spild ------------------------------------------------------ */
    var RYST_REPLIKKER = ["Det skal blandes, ikke kastes.", "Et reagensglas er ikke en rangle.", "Tredje gang. Køkkenrullen slipper op."];

    P.laererSpild = function (c, slags) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        var replik;
        if (slags === "overloeb") replik = c.erGlas ? "Fuldt er fuldt." : "Der står 100 mL på glasset. Det er et loft.";
        else replik = RYST_REPLIKKER[Math.min(this.rystUheld, RYST_REPLIKKER.length) - 1];
        var slut = [];
        if (slags === "rystet") {
            if (M.volumen(this.g.baeger.b) >= M.MAENGDE.FORDEL) slut.push({ sig: "Der er mere i bægerglasset.", vis: 2.2, tid: 1.4 });
            else slut.push({ sig: "Glas " + c.nr + " er tomt nu.", vis: 2, tid: 1.2 });
        }
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

    /* ----- Stamoploesningen --------------------------------------------------- */
    P.laererFarveloes = function () {
        bemaerkning(this, "farveloes", 190, { vrede: 0.3, humoer: -0.2, skeptisk: 1, briller: 1 },
            ["Fem glas med noget klart. Spændende.", "Der mangler noget i bægerglasset."],
            [K.suk(), { sig: "Start et nyt forsøg.", vis: 2, tid: 1.8 }]);
    };

    P.laererSoelv = function () {
        bemaerkning(this, "soelv", 190, { vrede: 0.5, humoer: -0.4, skeptisk: 0.8, briller: 1 },
            ["Sølvnitrat i bægerglasset.", "Nu har alle fem glas bundfald."],
            [{ sig: "Det skulle kun i ét af dem.", vis: 2.2, tid: 2 }]);
    };

    P.laererMoerk = function () {
        bemaerkning(this, "moerk", 190, { vrede: 0.3, humoer: -0.3, skeptisk: 1, briller: 1 },
            ["Så mørkt, at ingen ser en forskel.", "Færre dråber næste gang."]);
    };

    P.laererLys = function () {
        bemaerkning(this, "lys", 190, { vrede: 0.3, humoer: -0.3, skeptisk: 1, briller: 1 },
            ["Det er næsten vand.", "Lysere end det bliver svært at se."]);
    };

    P.laererUjaevn = function () {
        bemaerkning(this, "ujaevn", 190, { vrede: 0.4, humoer: -0.4, skeptisk: 1, briller: 1 },
            ["Fem glas, fem farver.", "Rørte nogen om?"]);
    };

    /* ----- Glassene ------------------------------------------------------------ */
    P.laererBlandet = function (gl) {
        bemaerkning(this, "blandet", 230, { vrede: 0.3, humoer: -0.2, skeptisk: 1, briller: 1 },
            ["Ét indgreb pr. glas.", "Ellers ved ingen, hvad der virkede."]);
    };

    P.laererIngenReference = function () {
        var rest = M.volumen(this.g.baeger.b) > 0.5 && !this.haendt.baegerAendret;
        bemaerkning(this, "ingenRef", 230, { vrede: 0.5, humoer: -0.5, skeptisk: 1, briller: 1 },
            ["Fem glas. Ingen reference."],
            K.glimtTrin("afslag").concat([
                K.suk(),
                rest ? { sig: "Resten i bægerglasset er urørt.", vis: 2.4, tid: 2.2 }
                     : { sig: "Start et nyt forsøg, og lad ét glas være.", vis: 2.6, tid: 2.6 }
            ]));
    };

    /* ----- Ros ------------------------------------------------------------------ */
    P.laererRos = function (forkert) {
        if (forkert) {
            bemaerkning(this, "ros", 200, { vrede: 0.1, humoer: 0.1, skeptisk: 1, briller: 1 },
                ["Kig en gang til på glas " + forkert.nr + "."]);
            return;
        }
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 200 },
            { tid: 0.3 },
            { sig: "Flot. Det var til at se rødt.", vis: 2.4, tid: 2.4, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Tegning ------------------------------------------------------------- */
    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, NK.Scene.ANKER.papir);
        }
    };
}());

/* =====================================================================
   laerer.js - Kemichael ved reagensglassene

   Selve figuren staar i ../../v2/kemichael/kemichael.js, som er faelles
   og ikke rettes her. Den er bygget til et fast tegnebord paa 1000 x 600
   enheder; her tegnes han skaleret efter laerredets hoejde, og gulvet
   saettes til laerredets bund, hver gang han tegnes (som i sc4.2), saa
   benene ikke bliver lange.

   Scener (han er sparsom, brugerens oenske):
     intro   hver fane: praesentationen (D.INTRO_*), naar eleven vil
     skema   fane 1: skemaet er fuldt (én gang pr. browser)
     ryst    fane 1: paaskeaegget, et faerdigt glas rystet seks gange
     slut    fane 2: runden er slut
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE, HAENGER = K.HAENGER;

    function scenemaal(sim) {
        var s = sim.laererLaerredSkala();
        NK.Scene.BREDDE = sim.L.b / s;
        NK.Scene.HOEJDE = sim.L.h / s;
        NK.Scene.GULV = sim.L.h / s;
        return s;
    }

    function kobl(P, valg) {
        K.paa(P, valg);

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = scenemaal(this);
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Til venstre for stativet, saa glassene kan ses */
        P.laererPladsPx = function () {
            var lay = this.lay;
            return lay ? Math.max(90, lay.rack.x - 60) : 150;
        };

        P.laererPlads = function () {
            return Math.max(120, this.laererPladsPx() / this.laererLaerredSkala());
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Praesentationen: han gaar ind, siger sine linjer og gaar igen.
       peg: { linjenummer: funktion, der giver armens vinkel } */
    function introTrin(sim, linjer, standX, peg) {
        var trin = [
            { kald: function () { sim.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: standX },
            { tid: 0.2 }
        ];
        linjer.forEach(function (l, i) {
            var v = peg && peg[i];
            trin.push({ kald: function () { sim.introTrin = i + 1; } });
            if (v) trin.push({ arm: v, tid: 0.45 });
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
            if (v) trin.push({ arm: HAENGER, tid: 0.35 });
        });
        return trin.concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, humoer: 0 } },
            { kald: function () { sim.introTrin = 0; } },
            { gaa: UDE }
        ]);
    }

    function introVaek(P, knapId) {
        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            this.introKlikTal = (this.introKlikTal || 0) + 1;
            if (this.introKlikTal >= 2) {
                this.laererIntroVaek();
            } else {
                var k = NK.el(knapId);
                k.classList.remove("puf");
                void k.offsetWidth;
                k.classList.add("puf");
            }
            return true;
        };
        P.laererIntroVaek = function () {
            var L = this.laerer;
            if (!L || !L.scene || L.scene.navn !== "intro") return false;
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            this.introTrin = 0;
            this.laererKoer("introUd", [
                { arm: HAENGER, tid: 0.15 },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { gaa: UDE, loeb: true }
            ], false);
            return true;
        };
        P.laererIIntro = function () {
            var L = this.laerer;
            return !!(L && L.scene && L.scene.navn === "intro");
        };
    }

    function pegPaa(sim, punkt) {
        return function () {
            var s = sim.laererLaerredSkala(), p = punkt();
            return p ? sim.pegVinkel(p.x / s, p.y / s) : 0.5;
        };
    }

    /* Et kort besoeg: ind, én replik, ud */
    function besoeg(P, replik, glad) {
        return [
            { udtryk: glad ? { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 }
                           : { vrede: 0, humoer: 0.1, skeptisk: 1, briller: 1 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } }
        ].concat(glad ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]);
    }

    /* ----- Fane 1: forsoeget ------------------------------------------------- */
    var PF = NK.SimForsoeg.prototype;
    kobl(PF, { fredet: ["skema"] });

    PF.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_FORSOEG,
            function () { return mig.laererPlads(); },
            {
                1: pegPaa(this, function () {
                    var p = mig.lay && mig.pipPos();
                    return p ? { x: p.x, y: p.y - 90 * mig.lay.k } : null;
                })
            }), false);
    };
    introVaek(PF, "forsoeg-spring");

    PF.laererSkema = function () {
        if (!this.laerer) return;
        this.laererKoer("skema", besoeg(PF, D.SKEMA_FULDT, true), false);
    };

    PF.laererRyst = function (blandes) {
        if (!this.laerer || (this.laerer.scene && this.laerer.scene.navn === "intro")) return;
        this.laererKoer("ryst", besoeg(PF, blandes ? D.RYST_FOR_MEGET.blandes : D.RYST_FOR_MEGET.ikke, false), false);
    };

    /* ----- Fane 2: gaet polaritet --------------------------------------------- */
    var PG = NK.SimGaet.prototype;
    kobl(PG, { fredet: ["slut"] });

    PG.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_GAET,
            function () { return mig.laererPlads(); },
            {
                1: pegPaa(this, function () {
                    var r = mig.lay && mig.lay.kort;
                    return r ? { x: r.x + r.b * 0.3, y: r.y + r.h * 0.5 } : null;
                })
            }), false);
    };
    introVaek(PG, "gaet-spring");

    PG.laererSlut = function (point, rekord) {
        if (!this.laerer) return;
        var replik = D.RUNDE_REPLIK[0][1];
        D.RUNDE_REPLIK.forEach(function (r) { if (point >= r[0]) replik = r[1]; });
        if (rekord) replik = D.REKORD_REPLIK;
        this.laererKoer("slut", besoeg(PG, replik, point >= 8), false);
    };
}());

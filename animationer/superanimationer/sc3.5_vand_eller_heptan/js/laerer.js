/* =====================================================================
   laerer.js - Kemichael ved reagensglassene

   Selve figuren staar i ../../v2/kemichael/kemichael.js, som er faelles
   og ikke rettes her. Den er bygget til et fast tegnebord paa 1000 x 600
   enheder; her tegnes han skaleret efter laerredets hoejde, og gulvet
   saettes til laerredets bund, hver gang han tegnes (som i sc5.2), saa
   benene ikke bliver lange.

   Scener (han er sparsom, brugerens regel 4. nov. 2026):
     intro   hver fane: praesentationen (D.INTRO_*), naar eleven vil.
             Ét trin ad gangen med Naeste og Spring praesentationen over;
             han gaar aldrig videre af sig selv. Koden er faelles:
             NK.Praesentation.trin (../kemichael/praesentation.js).
     skema   fane 1: skemaet er fuldt (én gang pr. browser)
     ryst    fane 1: paaskeaegget, et faerdigt glas rystet seks gange
     slut    fane 2: en runde er slut med mindst otte rigtige (én gang
             pr. besoeg)
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE;

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

        /* Helt ude til venstre for stativet, saa glasset med vand ikke
           skjules bag ham, mens han viser glassene (4. nov. 2026) */
        P.laererPladsPx = function () {
            var lay = this.lay;
            return lay ? Math.max(90, lay.rack.x - 85) : 150;
        };

        P.laererPlads = function () {
            return Math.max(95, this.laererPladsPx() / this.laererLaerredSkala());
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

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
    PF.introLinjer = function () { return D.INTRO_FORSOEG; };
    NK.Praesentation.trin(PF);

    /* Skemaet er fuldt: hele fanen er klaret (én gang pr. browser) */
    PF.laererSkema = function () {
        if (!this.laerer) return;
        this.laererKoer("skema", besoeg(PF, D.SKEMA_FULDT, true), false);
    };

    /* Paaskeaegget: et faerdigt glas rystet seks gange mere */
    PF.laererRyst = function (blandes) {
        if (!this.laerer || this.kmIntro) return;
        this.laererKoer("ryst", besoeg(PF, blandes ? D.RYST_FOR_MEGET.blandes : D.RYST_FOR_MEGET.ikke, false), false);
    };

    /* ----- Fane 2: gaet polaritet --------------------------------------------- */
    var PG = NK.SimGaet.prototype;
    kobl(PG, { fredet: ["slut"] });
    PG.introLinjer = function () { return D.INTRO_GAET; };
    NK.Praesentation.trin(PG);

    /* En runde er hele fanen: ti stoffer. Han kommer én gang pr. besoeg,
       naar en runde er slut med mindst RUNDE_GOD rigtige. */
    PG.laererSlut = function (point, rekord) {
        if (!this.laerer || this.kmIntro || this.rundeRost || point < D.RUNDE_GOD) return;
        this.rundeRost = true;
        var replik = point >= D.RUNDE_ALLE ? D.RUNDE_ALLE_REPLIK : (rekord ? D.REKORD_REPLIK : D.RUNDE_REPLIK);
        this.laererKoer("slut", besoeg(PG, replik, true), false);
    };
}());

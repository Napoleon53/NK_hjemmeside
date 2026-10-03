/* =====================================================================
   laerer.js - Kemichael kommer ind, naar forsoeget gaar helt galt

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og frosset. Her tegnes
   han oven paa scenen paa fane 1, skaleret efter laerredets hoejde, med
   gulvet ved laerredets bund (samme loesning som i sc_spil5_syregalgen),
   saa han staar i forgrunden nederst til venstre.

   Brugerens valg (27. sept. 2026): Kemichael praesenterer ikke
   forsoeget og er der ellers ikke. Han kommer kun ved paaskeaeggene,
   hvor forsoeget gaar helt galt: en tunet lighter giver en stikflamme,
   en tunet lighter suger vand ind, eller gas paa bordet antaendes. Han
   siger én tør replik, evt. at man boer starte forfra, og gaar igen.
   Uheldet skrives i hans uheldsregnskab (K.uheld), der foelger
   browseren paa tvaers af animationerne.

   Scenen laaser ikke forsoeget. Baggrundslivet er slaaet fra.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });
    K.baggrundsliv(false);

    var UDE = K.UDE;

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: ["paatale"] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund. */
    function scenemaal(mig) {
        var s = mig.laererLaerredSkala();
        NK.Scene.BREDDE = mig.L.b / s;
        NK.Scene.HOEJDE = mig.L.h / s;
        NK.Scene.GULV = mig.L.h / s;
        return s;
    }

    P.laererTegnOver = function (ctx) {
        if (!this.synlig()) return;
        var s = scenemaal(this);
        ctx.save();
        ctx.scale(s, s);
        this.tegnLaerer(ctx, this.tid);
        ctx.restore();
    };

    P.synlig = function () {
        var L = this.laerer;
        return !!(L && (L.x > UDE + 40 || L.scene || L.taleAlfa > 0.01));
    };

    /* Er han paa vej, eller staar han der? */
    P.optaget = function () {
        var L = this.laerer;
        return !!(L && L.scene);
    };

    P.laererUnder = function (px, py) {
        if (!this.laerer || !this.overLaerer || !this.synlig()) return false;
        var s = scenemaal(this);
        return !!this.overLaerer({ x: px / s, y: py / s });
    };

    P.laererKlik = function (px, py) {
        if (!this.laererUnder(px, py)) return false;
        return this.klikLaerer();
    };

    /* Helt inde i billedet, taet ved venstre kant */
    P.standX = function () { return 122; };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.5; }

    /* slags: "stik", "vand" eller "wush". forfra: forsoeget er
       oedelagt, saa han siger ogsaa, at man boer starte forfra. */
    P.paatale = function (slags, forfra) {
        var linje = K.replik("sc4.9:" + slags, D.PAATALE[slags]);
        var mig = this;
        var trin = [
            { tid: slags === "vand" ? 0.8 : 0.4 },
            { udtryk: { vrede: 0.1, humoer: -0.2, roed: 0, skeptisk: 0.5, briller: 0 } },
            { gaa: function () { return mig.standX(); }, loeb: slags !== "vand" },
            { udtryk: { briller: 1 } },
            { tid: 0.3 },
            { sig: linje, vis: replikTid(linje), tid: replikTid(linje) }
        ];
        /* Oejenbrynene fra 1994: kun én gang i denne browser */
        if (slags === "stik") trin = trin.concat(K.glimtTrin("oejenbryn"));
        trin = trin.concat(K.uheld());
        if (forfra) {
            var f = K.replik("sc4.9:forfra", D.PAATALE.forfra);
            trin.push({ sig: f, vis: replikTid(f), tid: replikTid(f) });
        }
        trin = trin.concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, briller: 0, humoer: 0, vrede: 0 } },
            { gaa: UDE }
        ]);
        this.laererKoer("paatale", trin, false);
        return linje;
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterLaerer(dt);
    };

    NK.Laerer = Laerer;
}());

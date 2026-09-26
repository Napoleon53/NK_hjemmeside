/* =====================================================================
   laerer.js - Kemichael kigger ind efter et plask

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og frosset. Den er
   bygget til et fast tegnebord paa 1000 x 600 enheder. Her tegnes han
   oven paa scenen, skaleret efter laerredets hoejde, med gulvet ved
   laerredets bund (samme loesning som i sc2.2), saa han staar i
   forgrunden nederst til venstre.

   Brugerens valg (24. sept. 2026): Kemichael praesenterer ikke spillet
   og er der ellers ikke. Han kommer kun, naar klassekammeraten er
   faldet i karret, siger een sarkastisk replik og gaar igen. Replikken
   rammer handlingen (brillerne paa panden), aldrig eleven. Plasket
   skrives i hans uheldsregnskab (K.uheld), som foelger browseren paa
   tvaers af animationerne.

   Scenen laaser ikke spillet. Baggrundslivet er slaaet fra.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });
    K.baggrundsliv(false);

    var UDE = K.UDE;

    /* Hoejst ca. 60 tegn. Ingen teori. */
    var REPLIKKER = {
        plask: [
            "Sådan går det, når man glemmer brillerne.",
            "Brillerne sidder på panden. Det tæller ikke.",
            "Brillerne klarede den. Det gør de altid.",
            "Først vand, så syre. Ikke elev i syre.",
            "Den planke har jeg bedt om at få fjernet siden 2014.",
            "Ét bogstav mere, og det var gået.",
            "pH 1. Det kunne man have regnet ud."
        ],
        opgivet: [
            "At give op er også et valg. Et vådt et.",
            "Man må gerne gætte, før man giver op.",
            "Sådan går det, når man glemmer brillerne."
        ]
    };

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: ["plask"] });

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
    P.standX = function () {
        return 122;
    };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.5; }

    /* opgivet: eleven trykkede Vis ordet i stedet for at gaette faerdig */
    P.plask = function (opgivet) {
        var linje = opgivet
            ? K.replik("syregalgen:opgivet", REPLIKKER.opgivet)
            : K.replik("syregalgen:plask", REPLIKKER.plask);
        var mig = this;
        var trin = [
            { tid: 0.5 },
            { udtryk: { vrede: 0, humoer: -0.1, roed: 0, skeptisk: 0.45, briller: 0 } },
            { gaa: function () { return mig.standX(); }, loeb: true },
            { udtryk: { briller: 1 } },
            { tid: 0.3 },
            { sig: linje, vis: replikTid(linje), tid: replikTid(linje) }
        ].concat(K.uheld()).concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, briller: 0, humoer: 0 } },
            { gaa: UDE }
        ]);
        this.laererKoer("plask", trin, false);
        return linje;
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterLaerer(dt);
    };

    Laerer.REPLIKKER = REPLIKKER;
    NK.Laerer = Laerer;
}());

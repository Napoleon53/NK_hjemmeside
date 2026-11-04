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

   3. okt. 2026 bad brugeren om flere og mere morbide replikker. De
   taler til klassekammeraten i karret og holder sig til kemien: karret
   ender paa 0,1 M saltsyre, og pH 1 er mest farligt for oejnene.

   4. nov. 2026 (brugerens regel): alle replikker er hele saetninger i
   formelt sprog som i Kemibogen. Raadet "Man maa gerne gaette, foer man
   giver op" er taget ud, for han giver ikke naeste skridt. Samme dag
   valgte brugeren, at han kommer ved foerste tabte ord og derefter ved
   hvert tredje, og at "Saadan gaar det, naar man glemmer brillerne."
   skal blive.

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

    /* Brugerens regel 4. nov. 2026: hele saetninger i formelt sprog som i
       Kemibogen, hoejst ca. 130 tegn. Ingen teori. Toerheden og det
       morbide maa blive. \u00a0 er et haardt mellemrum, saa "pH 1" og
       "0,1 M" ikke deles over to linjer i taleboblen. */
    var REPLIKKER = {
        plask: [
            "Skynd dig op af karret, før du får syre i øjnene.",
            "Du kan roligt slappe af, for saltsyre med pH\u00a01 er kun farlig for øjnene og for åbne sår.",
            "Da jeg gik i skole, skulle vi alle smage på 0,1\u00a0M saltsyre.",
            "Sådan går det, når man glemmer brillerne.",
            "Sikkerhedsbrillerne sad på panden, og dér tæller de ikke.",
            "Sikkerhedsbrillerne klarede sig. Det gør de altid.",
            "Huskereglen hedder først vand, så syre. Elever står der ikke noget om.",
            "Planken har jeg bedt om at få fjernet siden 2014.",
            "Karret har nu pH\u00a01, og det kunne man have regnet ud.",
            "Mavesyre har også pH\u00a01, men den plejer at være inden i kroppen.",
            "Hold munden lukket nede i karret, for tandemalje tåler ikke pH\u00a01.",
            "Nødbruseren hænger ved døren, hvis du stadig kan se den.",
            "Kitlen går i opløsning før dig. Det er en trøst.",
            "Saltsyren er kun 0,1\u00a0M, og jeg har set elever overleve værre.",
            "Skyl øjnene i 15 minutter. Vi ses i næste modul.",
            "Det tæller som fravær, hvis du bliver nede i karret.",
            "Tag det roligt. Jeg har flere elever.",
            "Nu er der en ledig plads ved vinduet.",
            "Kom op af karret, for det skal bruges igen i næste modul.",
            "Saltsyren svier kun de første ti minutter. Det har jeg i hvert fald hørt.",
            "Tønden er tom. Regningen sender jeg til dine forældre.",
            "Huden klarer pH\u00a01. Det gør dit tøj ikke.",
            "Sidst tog det tre uger at få en ny elev.",
            "Jeg noterer plasket som en fejlkilde.",
            "Du afleverer stadig rapporten på fredag."
        ],
        opgivet: [
            "At give op er også et valg, men det er et vådt valg.",
            "Du gav op, men det var din klassekammerat, der blev våd.",
            "Du gav hurtigt op. Fik du i det mindste sagt farvel?",
            "Det er nemt at give op, når man ikke selv ligger i karret.",
            "Tønden er tom. Regningen sender jeg til dine forældre.",
            "Tag det roligt. Jeg har flere elever."
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

    /* opgivet: eleven trykkede Vis ordet i stedet for at gaette faerdig.
       Han kommer ved foerste tabte ord og derefter ved hvert tredje (1., 4.,
       7. ...) i samme besoeg (brugerens valg 4. nov. 2026); ellers null. */
    P.plask = function (opgivet) {
        this.plaskTal = (this.plaskTal || 0) + 1;
        if ((this.plaskTal - 1) % 3 !== 0) return null;
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

/* =====================================================================
   laerer.js - Kemichael i fabrikken og i koekkenet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc4.1.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc4.1, saa benene ikke bliver lange.

   Scener:
     intro     begge faner: praesentationen (D.INTRO_*), naar eleven vil.
               Ét trin ad gangen med Naeste og Spring praesentationen
               over; han peger paa det, der blinker, og gaar aldrig
               videre af sig selv. Koden er faelles:
               ../kemichael/praesentation.js (NK.Praesentation.trin).
     faerdig   fane 1: fem ordrer leveret; fane 2: hvorfor er besvaret
               (begge kun foerste gang i browseren)
     harsk     fane 2: smoerret har staaet i solen (paaskeaegget). Han
               kommer, siger det, skifter smoerret ud og gaar. Det
               taeller som et uheld i hans regnskab.
   Det er de eneste gange, han kommer ind af sig selv (brugerens regel
   4. nov. 2026). Under praesentationen venter rosen, og det harske
   smoer bliver skiftet uden ham.
   Kaffen staar paa bordet paa fane 1 og er det faelles paaskeaeg.
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

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund. */
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

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = scenemaal(this);
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Aldrig saa langt ude, at han staar halvt uden for billedet */
        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Under praesentationen staar han et andet sted end ellers, saa han
       ikke daekker det, han fortaeller om, og han gaar lidt raskere ind,
       saa boblen ikke lader vente paa sig. introPx(lay) giver stedet i
       pixels. */
    function introPlads(P, introPx) {
        var plads = P.laererPlads, intro = P.laererIntro;
        P.laererPlads = function () {
            if (this.kmIntro && this.lay) return Math.max(150, introPx(this.lay) / this.laererLaerredSkala());
            return plads.apply(this, arguments);
        };
        P.laererIntro = function () {
            intro.apply(this, arguments);
            var sc = this.laerer && this.laerer.scene;
            if (sc && sc.navn === "intro") sc.trin.forEach(function (t) { if (t.gaa !== undefined) t.fart = 640; });
        };
    }

    /* Peg paa et punkt i pixels */
    function pegPaa(sim, punkt) {
        return function () {
            var s = sim.laererLaerredSkala(), p = punkt();
            return p ? sim.pegVinkel(p.x / s, p.y / s) : 0.5;
        };
    }

    /* Toer ros: han loefter fingeren, nikker og siger replikken */
    function rosTrin(P, replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]);
    }

    function kaffeValg() {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() - 150 : 700;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
            }
        };
    }

    /* ----- Fane 1: Fabrikken ---------------------------------------------------- */
    var PF = NK.SimFabrik.prototype;
    var vf = kaffeValg();
    vf.fredet = ["faerdig"];
    kobl(PF, vf);

    PF.laererPladsPx = function () {
        return this.lay ? Math.max(200, this.lay.W - 190) : 500;
    };

    /* Praesentationen: ét trin ad gangen med Naeste og Spring
       praesentationen over (faelles, ../kemichael/praesentation.js) */
    PF.introLinjer = function () { return D.INTRO_FABRIK; };
    NK.Praesentation.trin(PF);
    /* Mellem fedtsyrernes ender og glasset: glycerol og glasset staar fri */
    introPlads(PF, function (lay) { return lay.glas.venstre - 120; });

    /* Han staar bag bordet: bordkanten og fliserne tegnes igen oven paa
       ham (kun der, hvor han staar), saa fedtsyrerne paa fliserne aldrig
       er skjult bag hans ben */
    var tegnOver = PF.laererTegnOver;
    PF.laererTegnOver = function (ctx) {
        tegnOver.call(this, ctx);
        var L = this.laerer, lay = this.lay, mig = this, Tg = NK.Tegn;
        if (!L || !lay || !Tg || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = this.laererLaerredSkala(), halv = 130 * s, tr = this.traek;
        ctx.save();
        ctx.beginPath();
        ctx.rect(L.x * s - halv, lay.bordY, 2 * halv, lay.H - lay.bordY + 10);
        ctx.clip();
        Tg.bord(ctx, 0, lay.W, lay.bordY, lay.H + 10);
        D.SYRER.forEach(function (syre, i) {
            var lys = (mig.over && mig.over.slags === "flise" && mig.over.i === i) || (tr && tr.slags === "ny" && tr.id === syre.id);
            Tg.flise(ctx, lay.fliser[i], syre, { lys: lys ? 1 : 0 });
        });
        ctx.restore();
    };

    /* Alle fem ordrer er leveret. Staar praesentationen, venter rosen. */
    PF.laererFaerdig = function () {
        if (!this.laerer) return;
        if (this.kmIntro) { this.ventRos = 1; return; }
        this.laererKoer("faerdig", rosTrin(PF, D.ORDRER_FAERDIG), false);
    };

    /* ----- Fane 2: Koeleskabet ------------------------------------------------------ */
    var PK = NK.SimKoele.prototype;
    var vk = kaffeValg();
    vk.fredet = ["faerdig", "harsk"];
    kobl(PK, vk);

    PK.laererPladsPx = function () {
        var lay = this.lay;
        return lay ? lay.K.x + lay.K.b + 90 : 300;
    };

    PK.introLinjer = function () { return D.INTRO_KOELE; };
    NK.Praesentation.trin(PK);
    /* Foran koeleskabets doer: glassene, zoomvinduet og solen staar fri */
    introPlads(PK, function () { return 0; });

    /* Hvorfor er besvaret: fanen er klaret. Staar praesentationen, venter rosen. */
    PK.laererFaerdig = function () {
        if (!this.laerer) return;
        if (this.kmIntro) { this.ventRos = 1; return; }
        this.laererKoer("faerdig", rosTrin(PK, D.KOELE_FAERDIG), false);
    };

    /* Smoerret har staaet i solen: han kommer med nyt */
    PK.laererHarsk = function (gl) {
        var mig = this;
        /* Under praesentationen kommer det nye smoer uden ham */
        if (!this.laerer || this.kmIntro) { this.harskVent = 4; return; }
        this.harskGange = (this.harskGange || 0) + 1;
        var replik = this.harskGange > 1 ? D.HARSK_IGEN[(this.harskGange - 2) % D.HARSK_IGEN.length] : D.HARSK;
        var pegGlas = pegPaa(this, function () {
            var G = mig.lay ? mig.glasMaal(gl) : null;
            return G ? { x: G.x, y: G.top } : null;
        });
        this.laererKoer("harsk", [
            { tid: 1.6 },
            { udtryk: { vrede: 0.3, humoer: -0.4, roed: 0.2, skeptisk: 1, briller: 1 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 },
            { arm: pegGlas, tid: 0.45 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { arm: HAENGER, tid: 0.35 }
        ].concat(K.uheld(), [
            { udtryk: { vrede: 0, humoer: 0.2, roed: 0, skeptisk: 0, briller: 0 } },
            { kald: function () { mig.nytSmoer(gl); } },
            { sig: D.NYT_SMOER, vis: replikTid(D.NYT_SMOER), tid: replikTid(D.NYT_SMOER) },
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };
}());

/* =====================================================================
   laerer.js - Kemichael i fabrikken og i koekkenet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc6.1.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc6.1, saa benene ikke bliver lange.

   Scener:
     intro     begge faner: praesentationen (D.INTRO_*), naar eleven vil
     faerdig   fane 1: fem ordrer leveret; fane 2: hvorfor er besvaret
     harsk     fane 2: smoerret har staaet i solen (paaskeaegget). Han
               kommer, siger det, skifter smoerret ud og gaar. Det
               taeller som et uheld i hans regnskab.
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

    /* ----- Praesentationen (som sc6.1) -----------------------------------------
       Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke. Han
       gaar kun, naar eleven vil det: knappen Spring praesentationen over, to
       klik direkte paa ham eller Esc (laererIntroVaek). Fanen saetter
       this.introTrin, saa den kan pege med det, han taler om. */
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

    /* knapId: knappen Spring praesentationen over paa fanen */
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

    /* Peg over paa panelet til hoejre */
    function pegPaaPanelet(sim) {
        return function () {
            var s = sim.laererLaerredSkala();
            return sim.pegVinkel(sim.L.b / s + 60, sim.L.h * 0.3 / s);
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

    PF.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_FABRIK,
            function () { return mig.laererPlads(); },
            {
                0: pegPaaPanelet(this),
                1: pegPaa(this, function () {
                    var geo = mig.lay ? mig.geo() : null;
                    return geo ? { x: geo.slot[1].H.x, y: geo.slot[1].y } : null;
                })
            }), false);
    };
    introVaek(PF, "fabrik-spring");

    PF.laererFaerdig = function () {
        if (!this.laerer) return;
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

    PK.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_KOELE,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var K2 = mig.lay && mig.lay.K;
                    return K2 ? { x: K2.x + K2.b * 0.6, y: K2.koeleTop } : null;
                }),
                1: pegPaa(this, function () {
                    var z = mig.lay && mig.lay.zoom;
                    return z ? { x: z.x + z.b * 0.5, y: z.y + z.h * 0.6 } : null;
                })
            }), false);
    };
    introVaek(PK, "koele-spring");

    PK.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PK, D.KOELE_FAERDIG), false);
    };

    /* Smoerret har staaet i solen: han kommer med nyt */
    PK.laererHarsk = function (gl) {
        var mig = this;
        if (!this.laerer) { this.harskVent = 4; return; }
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

/* =====================================================================
   laerer.js - Kemichael ved kammeret, vandbadet og blandingerne

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc4.1 og sc4.2.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc2.3, saa benene ikke bliver lange.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil
     faerdig   fane 1: alle fire maal; fane 2: hvorfor er besvaret
     brand     fane 1: taendstikken antaendte gassen i ballonen. Han
               kommer, siger det, saetter et nyt glas med ny ballon i og
               gaar. Det taeller som et uheld i hans regnskab.
     slut      fane 3: runden er slut
   Kaffen staar paa bordet og er det faelles paaskeaeg.
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

    /* ----- Praesentationen (som sc4.2) -----------------------------------------
       Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke. Han
       gaar kun, naar eleven vil det: knappen Spring praesentationen over, to
       klik direkte paa ham eller Esc (laererIntroVaek). Fanen saetter
       this.introTrin, saa den kan pege med det, han taler om.
       peg: { linje: vinkel-funktion } for de linjer, hvor han peger. */
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

    /* ----- Fane 1: Varm op ---------------------------------------------------- */
    var PV = NK.SimVarm.prototype;
    var vv = kaffeValg();
    vv.fredet = ["faerdig", "brand"];
    kobl(PV, vv);

    PV.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kammer.x - 50) : 250;
    };

    PV.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_VARM,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: (lay.hylde.x0 + lay.hylde.x1) / 2, y: (lay.hylde.top + lay.hylde.bund) / 2 } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.termo.x, y: lay.termo.yFor(mig.termo.T) } : null;
                })
            }), false);
    };
    introVaek(PV, "varm-spring");

    PV.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PV, D.MAAL_FAERDIG), false);
    };

    /* Taendstikken braendte ballonen: han kommer og saetter en ny i */
    PV.laererBrand = function () {
        var mig = this;
        if (!this.laerer) { this.brand.nyTid = 1.5; return; }
        var replik = this.braende > 1 ? D.BRAND_IGEN[(this.braende - 2) % D.BRAND_IGEN.length] : D.BRAND;
        var pegGlas = pegPaa(this, function () {
            var G = mig.lay && mig.lay.glas;
            return G ? { x: G.mund.x, y: G.mund.y } : null;
        });
        this.laererKoer("brand", [
            { udtryk: { vrede: 0.3, humoer: -0.3, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) }
        ].concat(K.glimtTrin("oejenbryn"), K.uheld(), [
            { udtryk: { vrede: 0, humoer: 0.2, skeptisk: 0, briller: 0 } },
            { arm: pegGlas, tid: 0.45 },
            { kald: function () { mig.nyBallon(); } },
            { arm: HAENGER, tid: 0.35 },
            { sig: D.NY_BALLON, vis: replikTid(D.NY_BALLON), tid: replikTid(D.NY_BALLON) },
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    /* ----- Fane 2: Formen ------------------------------------------------------ */
    var PF = NK.SimForm.prototype;
    var vf = kaffeValg();
    vf.fredet = ["faerdig"];
    kobl(PF, vf);

    PF.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.bad.glas.x - 40) : 200;
    };

    PF.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_FORM,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.zoom[1].x + lay.zoom[1].b / 2, y: lay.zoom[1].y + lay.zoom[1].h / 2 } : null;
                }),
                1: pegPaaPanelet(this)
            }), false);
    };
    introVaek(PF, "form-spring");

    PF.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PF, D.FORM_FAERDIG), false);
    };

    /* ----- Fane 3: Hvem koger foerst? ---------------------------------------------- */
    var PS = NK.SimSpil.prototype;
    var vs = kaffeValg();
    vs.fredet = ["slut"];
    kobl(PS, vs);

    PS.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kammer.x - 50) : 200;
    };

    PS.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_SPIL,
            function () { return mig.laererPlads(); },
            { 1: pegPaaPanelet(this) }), false);
    };
    introVaek(PS, "spil-spring");

    PS.laererSlut = function (point, rekord) {
        if (!this.laerer) return;
        var replik = D.RUNDE_REPLIK[0][1];
        D.RUNDE_REPLIK.forEach(function (r) { if (point >= r[0]) replik = r[1]; });
        if (rekord) replik = D.REKORD_REPLIK;
        var god = point >= 6;
        this.laererKoer("slut", [
            { udtryk: god ? { vrede: 0, humoer: 0.8, roed: 0 } : { vrede: 0.2, humoer: -0.2, skeptisk: 1, briller: 1 } },
            { gaa: PS.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } }
        ].concat(god ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };
}());

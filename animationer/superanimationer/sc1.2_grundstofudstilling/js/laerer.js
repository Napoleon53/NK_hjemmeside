/* =====================================================================
   laerer.js - Kemichael ved montren, flaskerne og opraabet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererLaerredSkala),
   som i sc2.3. Figurens egen skala (laererSkala) roeres ikke, for den
   bruges til haanden, der holder kaffekoppen.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen foerste gang (D.INTRO_*)
     periode   fane 1: en hel periode staar i montren
     niveau    fane 2: alle flasker i et niveau er talt
     slut      fane 3: spillet er slut
   Kaffen staar paa bordet paa fane 1 og 2 og er det faelles paaskeaeg.
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
            var s = this.laererLaerredSkala();
            NK.Scene.BREDDE = this.L.b / s;
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = this.laererLaerredSkala();
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        P.laererPlads = function () {
            return this.laererPladsPx() / this.laererLaerredSkala();
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen ------------------------------------------------
       Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke:
       man kan skrive og klikke hele tiden, uden at han forsvinder. Han gaar
       kun, naar eleven vil det: knappen Spring praesentationen over, to klik
       direkte paa ham eller Esc (laererIntroVaek). Fanen saetter
       this.introTrin, saa den kan pege med det, han taler om. */
    function introTrin(sim, linjer, standX, peg) {
        var trin = [
            { kald: function () { sim.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: standX },
            { tid: 0.2 }
        ];
        linjer.forEach(function (l, i) {
            trin.push({ kald: function () { sim.introTrin = i + 1; } });
            if (peg && i === peg.linje) trin.push({ arm: peg.vinkel, tid: 0.45 });
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
            if (peg && i === peg.linje) trin.push({ arm: HAENGER, tid: 0.35 });
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

    /* Peg over paa panelet til hoejre, hvor svarene skrives */
    function pegPaaPanelet(sim) {
        return function () {
            var s = sim.laererLaerredSkala();
            return sim.pegVinkel(sim.L.b / s + 60, sim.L.h * 0.3 / s);
        };
    }

    /* Tør ros: han loefter fingeren, nikker og siger replikken */
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

    /* ----- Fane 1: montren -------------------------------------------------- */
    var PM = NK.SimMontre.prototype;
    kobl(PM, {
        fredet: ["periode"],
        /* Han stiller sig til venstre for koppen og tager den med hoejre haand */
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() - 150 : 700;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
        }
    });

    PM.laererPladsPx = function () {
        return this.lay ? this.lay.W * 0.3 : 300;
    };

    PM.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_MONTRE,
            function () { return mig.lay ? mig.lay.W * 0.47 / mig.laererLaerredSkala() : 450; },
            { linje: 1, vinkel: pegPaaPanelet(this) }), false);
    };
    introVaek(PM, "montre-spring");

    PM.laererPeriode = function (periode, alt) {
        if (!this.laerer) return;
        this.laererKoer("periode", rosTrin(PM, alt ? D.MONTRE_FULD : D.PERIODE_ROS[periode - 1]), false);
    };

    /* ----- Fane 2: formlerne ------------------------------------------------ */
    var PF = NK.SimFormler.prototype;
    kobl(PF, {
        fredet: ["niveau"],
        /* Koppen staar yderst til venstre: han stiller sig til hoejre for den */
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 200;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
        }
    });

    PF.laererPladsPx = function () {
        return this.lay ? this.lay.W * 0.3 : 300;
    };

    PF.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_FORMLER,
            function () { return mig.lay ? mig.lay.W * 0.5 / mig.laererLaerredSkala() : 450; },
            { linje: 1, vinkel: pegPaaPanelet(this) }), false);
    };
    introVaek(PF, "formler-spring");

    PF.laererNiveau = function (niveau, alt) {
        if (!this.laerer) return;
        this.laererKoer("niveau", rosTrin(PF, alt ? D.FORMLER_FAERDIG : D.NIVEAU_ROS[niveau]), false);
    };

    /* ----- Fane 3: opraabet ------------------------------------------------- */
    var PO = NK.SimOpraab.prototype;
    kobl(PO, { fredet: ["slut"] });

    PO.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.tavle.x * 0.5) : 120;
    };

    /* Han staar til venstre for tavlen og peger op paa montren */
    PO.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_OPRAAB,
            function () { return mig.laererPlads(); },
            { linje: 0, vinkel: function () {
                var lay = mig.lay, s = mig.laererLaerredSkala();
                return lay ? mig.pegVinkel((lay.m.x + lay.m.b * 0.3) / s, (lay.m.y + lay.m.h * 0.7) / s) : 0.5;
            } }), false);
    };
    introVaek(PO, "opraab-spring");

    PO.laererSlut = function (art) {
        if (!this.laerer) return;
        var replik = D.SLUT_REPLIK[art] || D.SLUT_REPLIK.faa;
        var god = art === "rekord" || art === "mange";
        this.laererKoer("slut", [
            { udtryk: god ? { vrede: 0, humoer: 0.8, roed: 0 } : { vrede: 0.2, humoer: -0.2, skeptisk: 1, briller: 1 } },
            { gaa: PO.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } }
        ].concat(god ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };
}());

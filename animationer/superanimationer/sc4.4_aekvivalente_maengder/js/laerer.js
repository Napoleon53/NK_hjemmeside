/* =====================================================================
   laerer.js - Kemichael ved poelsevognen, kammeret og tavlen

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
     faerdig   fane 1 og 2: den sidste ordre eller det sidste maal er naaet
     niveau    fane 3: et helt niveau er regnet
   Kaffen staar paa disken (fane 1) og paa bordet (fane 2) og er det
   faelles paaskeaeg.
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

    /* ----- Praesentationen ------------------------------------------------
       Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke:
       man kan traekke, skrive og klikke hele tiden, uden at han forsvinder.
       Han gaar kun, naar eleven vil det: knappen Spring praesentationen
       over, to klik direkte paa ham eller Esc (laererIntroVaek). Fanen
       saetter this.introTrin, saa den kan pege med det, han taler om.
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

    function kaffeValg(pos) {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() + 150 * pos : 300;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
            }
        };
    }

    /* ----- Fane 1: hotdogboden ------------------------------------------------ */
    var PH = NK.SimHotdog.prototype;
    var vh = kaffeValg(1);
    vh.fredet = ["faerdig"];
    kobl(PH, vh);

    PH.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PH.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_HOTDOG,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.skilt.x + lay.skilt.b * 0.5, y: lay.skilt.y + lay.skilt.h * 0.6 } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.braet.x + lay.braet.b * 0.5, y: lay.braet.y + lay.braet.h * 0.4 } : null;
                }),
                2: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.klokke.x, y: lay.klokke.y - lay.klokke.b * 0.4 } : null;
                })
            }), false);
    };
    introVaek(PH, "hotdog-spring");

    PH.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PH, D.HOTDOG_FAERDIG), false);
    };

    /* Paaskeaegget: eleven ringer med lutter agurker paa braettet. Én gang pr. besoeg. */
    PH.laererAeg = function () {
        if (!this.laerer || this.aegVist || this.laerer.scene) return;
        this.aegVist = true;
        var l = D.AEG_AGURK;
        this.laererKoer("aeg", [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: PH.laererPlads },
            { tid: 0.3 },
            { sig: l, vis: replikTid(l), tid: replikTid(l) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
    };

    /* ----- Fane 2: molekylerne ------------------------------------------------- */
    var PM = NK.SimMolekyler.prototype;
    var vm = kaffeValg(1);
    vm.fredet = ["faerdig"];
    kobl(PM, vm);

    PM.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PM.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_MOLEKYLER,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.skilt.x + lay.skilt.b * 0.5, y: lay.skilt.y + lay.skilt.h * 0.6 } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.ind.x + lay.ind.b * 0.4, y: lay.ind.y + lay.ind.h * 0.5 } : null;
                })
            }), false);
    };
    introVaek(PM, "molekyler-spring");

    PM.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PM, D.MAAL_FAERDIG), false);
    };

    /* ----- Fane 3: tavlen ---------------------------------------------------------- */
    var PR = NK.SimRegn.prototype;
    kobl(PR, { fredet: ["niveau"] });

    PR.laererPladsPx = function () { return 110; };

    PR.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_REGN,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay, og = mig.opg;
                    return lay && og && lay.midter ? { x: lay.midter[og.o.kendt], y: lay.feltY } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay && lay.midter ? { x: lay.midter[lay.midter.length - 1], y: lay.feltY } : null;
                }),
                2: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay && lay.midter ? { x: lay.midter[1], y: (lay.soejleTop + lay.soejleBund) / 2 } : null;
                })
            }), false);
    };
    introVaek(PR, "regn-spring");

    PR.laererNiveau = function (niveau, alt) {
        if (!this.laerer) return;
        this.laererKoer("niveau", rosTrin(PR, alt ? D.OPGAVER_FAERDIG : D.NIVEAU_ROS[niveau]), false);
    };

}());

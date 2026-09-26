/* =====================================================================
   laerer.js - Kemichael ved skalaen, luppen og fortyndingsbordet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc4.1, sc4.2 og sc4.4.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,92 som i sc2.2 og sc2.3, saa benene ikke bliver lange.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil
     faerdig   fane 1: en hylde er maalt; fane 2: det sidste maal
     sig       fane 3: syren blev ikke basisk, og det sidste maal
     aeg       fane 1: et gaet, der rammer inden for 0,1; fane 2: fuld zoom ud
   Kaffen staar paa bordet i alle tre faner og er det faelles paaskeaeg.
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

    /* ----- Praesentationen (som sc4.4) ----------------------------------------- */
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
    function rosTrin(P, replik, udenRos) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(udenRos ? [] : K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]);
    }

    /* En toer bemaerkning over brillerne */
    function bemaerkning(P, replik) {
        return [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: P.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ];
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

    /* ----- Fane 1: skalaen ------------------------------------------------------ */
    var PS = NK.SimSkala.prototype;
    var vs = kaffeValg(1);
    vs.fredet = ["faerdig"];
    kobl(PS, vs);

    PS.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PS.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_SKALA,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: (lay.skala.x0 + lay.skala.x1) / 2, y: lay.skala.y + lay.skala.h / 2 } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.pladser[3], y: lay.bordY - lay.hi * 0.5 } : null;
                })
            }), false);
    };
    introVaek(PS, "skala-spring");

    PS.laererFaerdig = function (nr) {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PS, D.HYLDE_ROS[nr] || D.HYLDE_ROS[0]), false);
    };

    /* Paaskeaegget: et gaet, der rammer inden for 0,1. Én gang pr. besoeg. */
    PS.laererAeg = function () {
        if (!this.laerer || this.aegVist || this.laerer.scene) return;
        this.aegVist = true;
        this.laererKoer("aeg", bemaerkning(PS, D.AEG_PRAECIS), false);
    };

    /* ----- Fane 2: luppen --------------------------------------------------------- */
    var PL = NK.SimLup.prototype;
    var vl = kaffeValg(1);
    vl.fredet = ["faerdig"];
    kobl(PL, vl);

    PL.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PL.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_LUP,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.lup.cx - lay.lup.R * 0.7, y: lay.lup.cy } : null;
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: NK.Tegn.skalaX(lay.skala, mig.ph), y: lay.skala.y + lay.skala.h / 2 } : null;
                })
            }), false);
    };
    introVaek(PL, "lup-spring");

    PL.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PL, D.LUP_FAERDIG), false);
    };

    /* Paaskeaegget: luppen zoomet helt ud. Én gang pr. besoeg. */
    PL.laererAeg = function () {
        if (!this.laerer || this.aegVist || this.laerer.scene) return;
        this.aegVist = true;
        this.laererKoer("aeg", bemaerkning(PL, D.AEG_ZOOM), false);
    };

    /* ----- Fane 3: fortyndingsbordet ------------------------------------------------ */
    var PF = NK.SimFortynd.prototype;
    var vf = kaffeValg(1);
    vf.fredet = ["sig"];
    kobl(PF, vf);

    PF.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    PF.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_FORTYND,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay && lay.skilt.h ? { x: lay.skilt.x + 20, y: lay.skilt.y + lay.skilt.h * 0.5 } :
                        (lay ? { x: NK.Tegn.skalaX(lay.skala, 7), y: lay.skala.y + 10 } : null);
                }),
                1: pegPaa(this, function () {
                    var lay = mig.lay;
                    return lay ? { x: lay.knapSyre.x + lay.knapSyre.b * 0.6, y: lay.knapSyre.y } : null;
                })
            }), false);
    };
    introVaek(PF, "fortynd-spring");

    /* En replik efter et maal. ros: den sidste, med ros-regnskabet */
    PF.laererReplik = function (tekst, ros) {
        if (!this.laerer) return;
        this.laererKoer("sig", ros ? rosTrin(PF, tekst) : bemaerkning(PF, tekst), false);
    };

}());

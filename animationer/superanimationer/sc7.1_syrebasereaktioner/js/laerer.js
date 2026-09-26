/* =====================================================================
   laerer.js - Kemichael paa de tre faner

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Denne animation har intet fast tegnebord, saa laereren tegnes
   skaleret efter laerredets hoejde (0,92 × hoejde/600) med gulvet ved
   laerredets bund, som i sc6.6.

   Scener:
     intro      alle faner: praesentationen (D.INTRO_*), naar eleven vil
     faerdig    fane 1: alle ti reaktioner loest, kun foerste gang
     tiITraek   fane 2 og 3: ti i traek, kun foerste gang pr. fane
     kaffeSur   fane 1: en hydron sluppet i kaffen (paaskeaegget)
   Kaffekoppen er det faelles paaskeaeg.
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

        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };

        /* Under praesentationen: hvor langt ind fra venstre han fylder
           (pixels), saa fanen kan rykke indholdet til hoejre for ham */
        P.laererFriKant = function () {
            if (!this.laererIIntro || !this.laererIIntro()) return 0;
            return (this.laererPlads() + 125) * this.laererLaerredSkala();
        };

        /* Glider mod den plads, han fylder. Giver true, naar indholdet
           skal stilles op igen. */
        P.opdaterFri = function (dt) {
            this.fri = NK.mod(this.fri || 0, this.laererFriKant(), 3.5, dt);
            if (this.fri < 0.5) this.fri = 0;
            if (Math.abs(this.fri - (this.friBrugt || 0)) > 0.5 || (this.fri === 0 && this.friBrugt)) {
                this.friBrugt = this.fri;
                return true;
            }
            return false;
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen (som sc6.6) -------------------------------------------
       Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke. Han
       gaar kun, naar eleven vil det: knappen Spring praesentationen over, to
       klik direkte paa ham eller Esc. */
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
    function rosTrin(replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: function () { return this.laererPlads(); } },
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

    /* Koppen staar til hoejre for ham, og armen raekker over mod den */
    function kaffeValg(fredet) {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? Math.max(150, lay.kop.x / this.laererLaerredSkala() - 150) : 700;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
            },
            fredet: fredet
        };
    }

    /* ----- Fane 1: Hydronen ---------------------------------------------------------------- */
    var PH = NK.SimHydron.prototype;
    kobl(PH, kaffeValg(["faerdig", "kaffeSur"]));

    PH.laererPladsPx = function () {
        return this.lay ? this.lay.kant + 120 : 200;
    };

    PH.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_HYDRON,
            function () { return mig.laererPlads(); },
            {
                0: pegPaa(this, function () { return mig.plus ? { x: mig.plus.x, y: mig.plus.y } : null; }),
                1: pegPaa(this, function () { return mig.plus ? { x: mig.pos[1].x0, y: mig.plus.y } : null; })
            }), false);
    };
    introVaek(PH, "hydron-spring");

    PH.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(D.HYDRON_FAERDIG), false);
    };

    /* Paaskeaegget: en hydron i kaffen */
    PH.laererKaffeSur = function () {
        var L = this.laerer;
        if (!L || (L.scene && L.scene.navn !== "intro")) return;
        var mig = this;
        var replik = D.KAFFE_SUR[this.kaffeNr % D.KAFFE_SUR.length];
        this.kaffeNr++;
        var pegKop = pegPaa(this, function () { return mig.lay ? { x: mig.lay.kop.x, y: mig.lay.kop.y - 30 } : null; });
        this.laererKoer("kaffeSur", [
            { tid: 0.3 },
            { udtryk: { vrede: 0.3, humoer: -0.3, roed: 0.1, skeptisk: 1, briller: 1 } },
            { gaa: function () { return mig.lay ? Math.max(150, mig.lay.kop.x / mig.laererLaerredSkala() - 190) : 600; } },
            { tid: 0.2 },
            { arm: pegKop, tid: 0.45 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { arm: HAENGER, tid: 0.35 },
            { udtryk: { vrede: 0, humoer: 0, roed: 0, skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
    };

    /* ----- Fane 2 og 3: tavlen ---------------------------------------------------------------- */
    function tavleFane(P, intro, knapId) {
        kobl(P, kaffeValg(["tiITraek"]));
        P.laererPladsPx = function () {
            return this.lay ? this.lay.R.x + 120 : 200;
        };
        P.laererIntro = function () {
            if (!this.laerer) return;
            var mig = this;
            this.laererKoer("intro", introTrin(this, intro,
                function () { return mig.laererPlads(); },
                {
                    0: pegPaa(this, function () { return mig.sk ? { x: mig.sk.x[2], y: mig.lay.ligY } : null; }),
                    1: pegPaa(this, function () {
                        var r = mig.brikker && mig.brikker[0] && mig.brikker[0].r;
                        return r ? { x: r.x + r.b / 2, y: r.y + r.h / 2 } : null;
                    })
                }), false);
        };
        introVaek(P, knapId);
        P.laererTiITraek = function () {
            if (!this.laerer) return;
            this.laererKoer("tiITraek", rosTrin(D.TI_I_TRAEK), false);
        };
    }

    tavleFane(NK.SimProdukter.prototype, D.INTRO_PRODUKTER, "prod-spring");
    tavleFane(NK.SimPar.prototype, D.INTRO_PAR, "par-spring");
}());

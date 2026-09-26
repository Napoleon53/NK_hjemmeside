/* =====================================================================
   laerer.js - Kemichael ved tavlen paa alle fire faner

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde, som i sc4.1 og sc4.2: skala 0,92 og gulvet ved
   laerredets bund (NK.Scene.GULV), saa benene ikke bliver lange.

   Hver fane (NK.Fane i opgavefane.js) har this.tid, this.L og this.lay.
   Kaffekoppen staar naesten gemt i scenens nederste hoejre hjoerne og
   er det faelles paaskeaeg.

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil
     faerdig   en serie eller et niveau er klaret (D.ROS)
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

    function kobl(P) {
        var v = kaffeValg();
        v.fredet = ["faerdig"];
        K.paa(P, v);

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

        /* Han staar ved tavlens venstre kant, aldrig halvt uden for billedet */
        P.laererPladsPx = function () {
            return this.lay ? Math.max(90, this.lay.tavle.x + 80) : 150;
        };

        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };

        P.laererFaerdig = function (replik) {
            if (!this.laerer) return;
            this.laererKoer("faerdig", rosTrin(this, replik), false);
        };

        introVaek(P);
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Han gaar ind, siger sine linjer og gaar igen. Scenen laaser ikke. */
    function introTrin(sim, linjer, peg) {
        var trin = [
            { kald: function () { sim.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: function () { return sim.laererPlads(); } },
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

    function introVaek(P) {
        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            this.introKlikTal = (this.introKlikTal || 0) + 1;
            if (this.introKlikTal >= 2) {
                this.laererIntroVaek();
            } else {
                var k = NK.el(this.pre + "-spring");
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

    /* Peg paa panelet til hoejre */
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

    function rosTrin(sim, replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: function () { return sim.laererPlads(); } },
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

    /* Tavlens midte og det foerste atom */
    function tavlensMidte(sim) {
        return function () {
            var t = sim.lay && sim.lay.tavle;
            return t ? { x: t.x + t.b * 0.6, y: t.y + t.h * 0.45 } : null;
        };
    }
    function foersteAtom(sim) {
        return function () {
            var a = sim.braet.mol.atomer[0];
            return a ? sim.braet.px(a) : null;
        };
    }

    /* ----- Fane 1: zigzag ---------------------------------------------------- */
    var PZ = NK.SimZigzag.prototype;
    kobl(PZ);
    PZ.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO_ZIGZAG, {
            0: pegPaa(this, function () {
                var p = mig.papir;
                return p ? { x: p.r.x + p.r.b / 2, y: p.r.y + p.r.h / 2 } : tavlensMidte(mig)();
            }),
            1: pegPaa(this, foersteAtom(this))
        }), false);
    };

    /* ----- Fane 2: navne ----------------------------------------------------- */
    var PN = NK.SimNavne.prototype;
    kobl(PN);
    PN.laererIntro = function () {
        if (!this.laerer) return;
        this.laererKoer("intro", introTrin(this, D.INTRO_NAVNE, {
            0: pegPaa(this, tavlensMidte(this)),
            1: pegPaaPanelet(this)
        }), false);
    };

    /* ----- Fane 3: isomerer -------------------------------------------------- */
    var PI = NK.SimIsomerer.prototype;
    kobl(PI);
    PI.laererIntro = function () {
        if (!this.laerer) return;
        this.laererKoer("intro", introTrin(this, D.INTRO_ISOMERER, {
            0: pegPaaPanelet(this),
            1: pegPaa(this, foersteAtom(this))
        }), false);
    };

    /* ----- Fane 4: opløselighed ------------------------------------------------ */
    var PO = NK.SimOploes && NK.SimOploes.prototype;
    if (PO) {
        kobl(PO);
        PO.laererIntro = function () {
            if (!this.laerer) return;
            var mig = this;
            this.laererKoer("intro", introTrin(this, D.INTRO_OPLOES, {
                0: pegPaa(this, function () {
                    var g = mig.zoner && mig.zoner.glas;
                    return g ? { x: g.x + g.b * 0.55, y: g.y + g.h * 0.4 } : null;
                }),
                1: pegPaa(this, function () {
                    var f = mig.fig;
                    return f && f.sted === "tavle" ? { x: f.x, y: f.y } : null;
                })
            }), false);
        };
    }
}());

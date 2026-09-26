/* =====================================================================
   laerer.js - Kemichael ved regnebordet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde, som i sc7.2 (skala 0,92, gulvet ved laerredets bund,
   saa benene ikke bliver lange).

   De tre faner er af samme slags (SimRegn), saa han kobles paa én gang.
   Replikkerne staar i D.INTRO[p] og D.ROS[p].

   Scener:
     intro   praesentationen, naar eleven vil (tre replikker pr. fane)
     faerdig ros efter fem opgaver paa en fane (én gang pr. browser)
     aeg     lommeregneren gav 42
   Kaffen staar paa bordet og er det faelles paaskeaeg.

   NB: K.paa laegger selv metoder som laererSig og laererKoer paa
   prototypen. Egne metoder hedder derfor noget andet (laererRos,
   laererAeg).
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

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    var P = NK.SimRegn.prototype;

    K.paa(P, {
        fredet: ["faerdig"],
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 300;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
        }
    });

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

    P.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x + 70) : 150;
    };

    P.laererPlads = function () {
        return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
    };

    /* ----- Praesentationen (som sc7.2) ------------------------------------------- */
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

    function pegPaa(sim, punkt) {
        return function () {
            var s = sim.laererLaerredSkala(), p = punkt();
            return p ? sim.pegVinkel(p.x / s, p.y / s) : 0.5;
        };
    }

    /* Hvad han peger paa ved replik 1 og 2 paa hver fane */
    P.introPunkter = function () {
        var mig = this;
        function meter() { var l = mig.lay; return l ? { x: l.meter.x, y: l.meter.bund - l.meter.h * 0.7 } : null; }
        function panel() { var l = mig.lay; return l ? { x: l.W - 8, y: l.H * 0.55 } : null; }
        function etiket() { var l = mig.lay; return l ? { x: l.etiketX + 20, y: mig.etiketY() + 16 } : null; }
        function flaske() { var l = mig.lay; return l ? { x: l.glas.x, y: l.bordY - l.hi * 0.5 } : null; }
        function vej() {
            var l = mig.lay;
            if (!l) return null;
            var s = l.st[mig.opg.syre ? "cs" : "cb"] || l.st.h;
            return { x: s.x, y: s.y };
        }
        if (this.p === "ph") return { 0: pegPaa(this, etiket), 1: pegPaa(this, panel) };
        if (this.p === "konc") return { 0: pegPaa(this, meter), 1: pegPaa(this, panel) };
        return { 0: pegPaa(this, flaske), 1: pegPaa(this, vej) };
    };

    P.laererIntro = function () {
        if (!this.laerer) return;
        var mig = this;
        this.laererKoer("intro", introTrin(this, D.INTRO[this.p], function () { return mig.laererPlads(); },
            this.introPunkter()), false);
    };

    P.laererIntroKlik = function (px, py) {
        if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
        this.introKlikTal = (this.introKlikTal || 0) + 1;
        if (this.introKlikTal >= 2) {
            this.laererIntroVaek();
        } else {
            var k = NK.el(this.p + "-spring");
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

    /* ----- Ros og bemaerkninger ---------------------------------------------------- */
    P.laererRos = function (replik) {
        if (!this.laerer || this.laerer.scene) return;
        this.laererKoer("faerdig", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: this.laererPlads },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    /* Paaskeaegget: 42 paa lommeregneren. Én gang pr. besoeg. */
    P.laererAeg = function (replik) {
        if (!this.laerer || this.laerer.scene || NK.aeg42Vist) return;
        NK.aeg42Vist = true;
        this.laererKoer("aeg", [
            { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: this.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
    };
}());

/* =====================================================================
   laerer.js - Kemichael praesenterer sværhedsgraderne

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Spillet
   har intet tegnebord, saa han tegnes skaleret efter laerredets hoejde
   (0,92 som i sc2.3), og gulvet er laerredets bund (NK.Scene.GULV), saa
   kitlen ikke fortsaetter ned under scenen (som i sc2.2).

   Der er én laerer for hele siden. Han kommer kun, naar spillet ikke
   koerer, og staar til venstre for brættet.

   Scener:
     intro   foerste gang en sværhedsgrad aabnes: tilbuddet Start
             praesentation / Nej tak (js/praesentation.js), saa tre korte
             linjer (D.INTRO). Under linjen D.INTRO_PEG peger han paa det,
             der staar i D.INTRO_PEG_PAA, og det lyser op.
     slut    brættet er fuldt: én replik (D.SLUT), og han gaar igen.
   Baggrundslivet er slaaet fra: han maa aldrig gaa hen over brættet,
   mens der spilles.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });
    K.baggrundsliv(false);

    var UDE = K.UDE, HAENGER = K.HAENGER;
    var NOEGLE = "nk-iontetris-intro";

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.introVent = 0;
        this.introId = null;
        this.introTrin = 0;
        this.introKlikTal = 0;
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: ["slut"] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Til venstre for brættet, saa han ikke staar foran det */
    P.laererPlads = function () {
        var s = this.laererLaerredSkala();
        var braet = NK.el("braet-omraade");
        var c = this.L.canvas.getBoundingClientRect();
        var x = this.L.b * 0.16;
        if (braet && braet.offsetWidth) x = Math.min(x, braet.getBoundingClientRect().left - c.left - 120 * s);
        return Math.max(110, x / s);
    };

    P.laererTegnOver = function (ctx) {
        var L = this.laerer;
        if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = this.laererLaerredSkala();
        NK.Scene.BREDDE = this.L.b / s;
        NK.Scene.HOEJDE = this.L.h / s;
        NK.Scene.GULV = this.L.h / s;
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
        if (!this.laerer || !this.overLaerer) return false;
        var s = this.laererLaerredSkala();
        return !!this.overLaerer({ x: px / s, y: py / s });
    };

    P.laererKlik = function (px, py) {
        if (!this.laererUnder(px, py)) return false;
        return this.klikLaerer();
    };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen ------------------------------------------------ */
    P.startIntro = function (id, tving) {
        var sete = NK.hent(NOEGLE, {});
        if (!tving && sete[id]) return;
        sete[id] = true;
        NK.gem(NOEGLE, sete);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introId = id;
        this.introVent = tving ? 0.1 : 0.9;
    };

    /* Spillet starter, eller der skiftes fane: han gaar, hvis han er i gang */
    P.stopIntro = function () {
        this.introVent = 0;
        var ud = this.laererIntroVaek();
        return this.laererSlutVaek() || ud;
    };

    P.laererIntro = function () {
        var mig = this, linjer = D.INTRO[this.introId];
        if (!linjer) return;
        var peg = D.INTRO_PEG_PAA[this.introId];
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 }
        ];
        linjer.forEach(function (l, i) {
            trin.push({ kald: function () { mig.introTrin = i + 1; } });
            if (i === D.INTRO_PEG) trin.push({ arm: function () { return mig.pegPaa(peg); }, tid: 0.45 });
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
            if (i === D.INTRO_PEG) trin.push({ arm: HAENGER, tid: 0.35 });
        });
        this.laererKoer("intro", trin.concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, humoer: 0 } },
            { kald: function () { mig.introTrin = 0; } },
            { gaa: UDE }
        ]), false);
    };

    /* Armens vinkel mod et element paa siden */
    P.pegPaa = function (id) {
        var s = this.laererLaerredSkala();
        var e = NK.el(id);
        if (!e || !e.offsetWidth) return HAENGER;
        var r = e.getBoundingClientRect(), c = this.L.canvas.getBoundingClientRect();
        return this.pegVinkel((r.left + r.width * 0.25 - c.left) / s, (r.top + r.height * 0.45 - c.top) / s);
    };

    P.laererIIntro = function () {
        var L = this.laerer;
        return !!(L && L.scene && L.scene.navn === "intro");
    };

    P.laererIntroVaek = function () {
        var L = this.laerer;
        if (!this.laererIIntro()) return false;
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

    /* Et klik under praesentationen: rammer det ham, taeller det. Andet
       klik paa ham sender ham ud, det foerste faar knappen til at blinke. */
    P.laererIntroKlik = function (px, py) {
        if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
        this.introKlikTal++;
        if (this.introKlikTal >= 2) {
            this.laererIntroVaek();
        } else {
            var k = NK.el("spring-over");
            k.classList.remove("puf");
            void k.offsetWidth;
            k.classList.add("puf");
        }
        return true;
    };

    /* ----- Naar brættet er fuldt ------------------------------------------ */
    P.laererSlut = function (art) {
        if (this.laererIIntro()) return;
        var liste = D.SLUT[art] || D.SLUT.faa;
        var replik = liste[Math.floor(Math.random() * liste.length)];
        var god = art !== "faa";
        var mig = this;
        this.laererKoer("slut", [
            { udtryk: god ? { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0 } : { vrede: 0.1, humoer: -0.1, skeptisk: 1, briller: 1 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.25 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0 } }
        ].concat(art === "rekord" || art === "vundet" ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    P.laererSlutVaek = function () {
        var L = this.laerer;
        if (!L || !L.scene || L.scene.navn !== "slut") return false;
        L.tale = "";
        L.taleUr = 0;
        L.taleAlfa = 0;
        this.laererKoer("slutUd", [
            { arm: HAENGER, tid: 0.1 },
            { udtryk: { skeptisk: 0, briller: 0, humoer: 0 } },
            { gaa: UDE, loeb: true }
        ], false);
        return true;
    };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0) this.laererIntro();
        }
        this.opdaterLaerer(dt);
        var iIntro = this.laererIIntro();
        if (iIntro !== this.visesSpring) {
            this.visesSpring = iIntro;
            NK.el("spring-over").hidden = !iIntro;
        }
        var peg = iIntro && this.introTrin === D.INTRO_PEG + 1 ? D.INTRO_PEG_PAA[this.introId] : null;
        if (peg !== this.pegerPaa) {
            if (this.pegerPaa && NK.el(this.pegerPaa)) NK.el(this.pegerPaa).classList.remove("peg");
            if (peg && NK.el(peg)) NK.el(peg).classList.add("peg");
            this.pegerPaa = peg;
        }
    };

    NK.Laerer = Laerer;
}());

/* =====================================================================
   laerer.js - Kemichael praesenterer bassinet og kommer forbi

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og baggrundslivet)
   staar i ../../v2/kemichael/kemichael.js. Den er bygget til et fast
   tegnebord paa 1000 x 600 enheder. Denne animation har intet fast
   tegnebord, saa laereren tegnes skaleret efter laerredets hoejde
   (laererLaerredSkala), som i sc2.1, sc2.3 og sc2.4.

   Praesentationen: foerste gang siden aabnes i en browser, gaar han ind
   foran bassinet, siger de tre linjer i D.INTRO og gaar igen. Mens han
   siger linjen D.INTRO_PEG, peger han paa panelet, og kortet Haeld i
   lyser op. Scenen laaser ikke. Knappen Spring praesentationen over, to
   klik paa ham og Esc sender ham ud; K viser praesentationen igen.

   Besoeg: han kommer forbi med én replik (D.REPLIK), naar bassinet loeber
   over, naar en oliedraabe svaever, og naar der rystes i noget, der ikke
   kan skilles. Hvert besoeg sker hoejst én gang pr. sidevisning.
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
    var NOEGLE = "nk-sc3.4-intro";
    var PEG_PAA = "haeld-kort";

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.introVent = 0;
        this.introTrin = 0;
        this.introKlikTal = 0;
        this.besoegt = {};
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: ["besoeg"] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    P.laererPlads = function () {
        return this.L.b * 0.3 / this.laererLaerredSkala();
    };

    P.laererTegnOver = function (ctx) {
        var L = this.laerer;
        if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = this.laererLaerredSkala();
        NK.Scene.BREDDE = this.L.b / s;
        NK.Scene.HOEJDE = this.L.h / s;
        ctx.save();
        ctx.scale(s, s);
        this.tegnLaerer(ctx, this.tid);
        ctx.restore();
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

    /* ----- Praesentationen --------------------------------------------- */
    P.startIntro = function (tving) {
        if (!tving && NK.hent(NOEGLE, false)) return;
        NK.gem(NOEGLE, true);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    P.laererIntro = function () {
        var mig = this;
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 }
        ];
        D.INTRO.forEach(function (l, i) {
            trin.push({ kald: function () { mig.introTrin = i + 1; } });
            if (i === D.INTRO_PEG) trin.push({ arm: function () { return mig.pegPanel(); }, tid: 0.45 });
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

    /* Armens vinkel mod panelet til hoejre */
    P.pegPanel = function () {
        var s = this.laererLaerredSkala();
        return this.pegVinkel(this.L.b / s + 60, this.L.h * 0.2 / s);
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

    /* ----- Besoeg: én replik, saa gaar han igen ------------------------ */
    P.besoeg = function (hvad) {
        if (this.besoegt[hvad] || !this.laerer) return;
        var L = this.laerer;
        if (L.scene) return;                     /* han er optaget; en anden gang */
        this.besoegt[hvad] = true;
        var replik = K.replik("sc34-" + hvad, D.REPLIK[hvad]);
        var glad = hvad === "svaever";
        this.laererKoer("besoeg", [
            { udtryk: glad ? { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 }
                           : { vrede: 0, humoer: -0.1, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: function () { return this.laererPlads(); } },
            { tid: 0.25 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0, humoer: 0 } }
        ].concat(glad ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
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
        var peg = iIntro && this.introTrin === D.INTRO_PEG + 1;
        if (peg !== this.pegerNu) {
            this.pegerNu = peg;
            NK.el(PEG_PAA).classList.toggle("peg", peg);
        }
    };

    NK.Laerer = Laerer;
}());

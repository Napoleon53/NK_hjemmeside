/* =====================================================================
   laerer.js - Kemichael paa startskaermen

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Han tegnes paa et gennemsigtigt laerred oven paa hele spillet,
   skaleret efter laerredets hoejde (0,92 som i sc2.3), og gulvet
   saettes til laerredets bund, saa kitlen ikke bliver for lang (samme
   loesning som i sc2.2).

   Scener:
     intro    startskaermen: tilbuddet Start praesentation / Nej tak
              (js/praesentation.js). Tre korte linjer (D.INTRO.start);
              mens han siger linjen D.INTRO_PEG, peger han paa valgene,
              og de lyser op. Han gaar kun, naar eleven vil det.
     mester   han kommer forbi og siger én linje, naar nogen bliver
              Labyrintmester.
   Han kommer aldrig, mens der spilles, og han forklarer ikke teori.
   Baggrundslivet er slaaet fra, saa han ikke gaar hen over labyrinten.
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

    /* Det, han peger paa, mens han siger linjen D.INTRO_PEG */
    var PEG_PAA = "valg";

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.introVent = 0;
        this.introTrin = 0;
        this.introKlikTal = 0;
        this.laererStart();
        this.bygTilbud();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: [] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund */
    P.scenemaal = function () {
        var s = this.laererLaerredSkala();
        NK.Scene.BREDDE = this.L.b / s;
        NK.Scene.HOEJDE = this.L.h / s;
        NK.Scene.GULV = this.L.h / s;
        return s;
    };

    /* Til venstre for valgene. Paa en bred skaerm rykker startskaermen
       til hoejre, mens han taler (.start.med-laerer i css/stil.css), saa
       der er plads til ham. */
    P.laererPlads = function () {
        var s = this.laererLaerredSkala();
        return Math.max(120, this.L.b * 0.12 / s);
    };

    P.laererTegnOver = function (ctx) {
        var L = this.laerer;
        if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = this.scenemaal();
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
        var s = this.scenemaal();
        return !!this.overLaerer({ x: px / s, y: py / s });
    };

    P.laererKlik = function (px, py) {
        if (!this.laererUnder(px, py)) return false;
        return this.klikLaerer();
    };

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Praesentationen --------------------------------------------- */
    P.laererIntro = function () {
        var mig = this, linjer = D.INTRO.start;
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.4, roed: 0, skeptisk: 0.25, briller: 0 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 }
        ];
        linjer.forEach(function (l, i) {
            trin.push({ kald: function () { mig.introTrin = i + 1; } });
            if (i === D.INTRO_PEG) trin.push({ arm: function () { return mig.pegPaa(PEG_PAA); }, tid: 0.45 });
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
        return this.pegVinkel((r.left + r.width * 0.2 - c.left) / s, (r.top + r.height * 0.3 - c.top) / s);
    };

    /* Kaldes af js/praesentation.js: valgene lyser op, mens han peger */
    P.pegPaaFelt = function (til) {
        if (til === this.pegerNu) return;
        this.pegerNu = til;
        var e = NK.el(PEG_PAA);
        if (e) e.classList.toggle("peg", !!til);
    };

    P.iScene = function (navn) {
        var L = this.laerer;
        return !!(L && L.scene && L.scene.navn === navn);
    };

    P.laererIIntro = function () { return this.iScene("intro"); };

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

    /* Et spil gaar i gang: tilbuddet forsvinder (og huskes), og en
       praesentation, der er i gang, slutter. */
    P.stopIntro = function () {
        this.afvisTilbud();
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    /* ----- Labyrintmester ------------------------------------------------ */
    P.mesterBesoeg = function () {
        var mig = this;
        var linje = NK.tilfaeldig(D.MESTER_REPLIK);
        this.laererKoer("mester", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0.2, skeptisk: 0, briller: 0 } },
            { gaa: function () { return Math.max(120, mig.L.b * 0.13 / mig.laererLaerredSkala()); } },
            { tid: 0.2 },
            { sig: linje, vis: replikTid(linje), tid: replikTid(linje) },
            { taleFaerdig: true },
            { udtryk: { humoer: 0, roed: 0 } },
            { gaa: UDE }
        ], false);
    };

    P.opdater = function (dt) {
        this.tid += dt;
        this.opdaterIntro(dt);
        this.opdaterLaerer(dt);
    };

    NK.Praesentation.kobl(P, { noegle: "nk-pacman-intro", tilbud: "tilbud", spring: "spring-over" });

    NK.Laerer = Laerer;
}());

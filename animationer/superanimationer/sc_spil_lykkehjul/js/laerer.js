/* =====================================================================
   laerer.js - Kemichael praesenterer spillet

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Her tegnes han paa et gennemsigtigt laerred
   oven paa hele studiet, skaleret efter laerredets hoejde, som i sc_spil_jeopardy.

   Han gaar ind foerste gang spillet aabnes i en browser, stiller sig til
   venstre for opsaetningen, siger tre korte linjer og gaar igen. Mens han
   siger linjen i D.INTRO_PEG, peger han paa opsaetningen, og den lyser op.
   Spillet laaser ikke. Knappen Spring praesentationen over, to klik paa
   ham og Esc sender ham ud; K viser praesentationen igen.

   Baggrundslivet er slaaet fra: han maa aldrig gaa hen over tavlen.
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
    var NOEGLE = "nk-lykkehjul-intro";

    /* Det, han peger paa, mens han siger linjen D.INTRO_PEG */
    var PEG_PAA = { titel: "opsaetning" };

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
    K.paa(P, { fredet: [] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Til venstre for opsaetningen, saa han ikke staar foran den */
    P.laererPlads = function () {
        var s = this.laererLaerredSkala();
        var maal = NK.el(PEG_PAA[this.introId] || "");
        var c = this.L.canvas.getBoundingClientRect();
        var x = this.L.b * 0.16;
        if (maal && maal.offsetWidth) x = Math.min(x, maal.getBoundingClientRect().left - c.left - 150 * s);
        return Math.max(120, x / s);
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

    /* ----- Praesentationen --------------------------------------------- */
    P.startIntro = function (id, tving) {
        var sete = NK.hent(NOEGLE, {});
        if (!tving && sete[id]) return;
        sete[id] = true;
        NK.gem(NOEGLE, sete);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introId = id;
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    P.laererIntro = function () {
        var mig = this, linjer = D.INTRO[this.introId];
        if (!linjer) return;
        var peg = PEG_PAA[this.introId];
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.4, roed: 0, skeptisk: 0.25, briller: 0 } },
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

    /* Armens vinkel mod midten af et element paa siden */
    P.pegPaa = function (id) {
        var s = this.laererLaerredSkala();
        var e = NK.el(id);
        if (!e || !e.offsetWidth) return HAENGER;
        var r = e.getBoundingClientRect(), c = this.L.canvas.getBoundingClientRect();
        return this.pegVinkel((r.left + r.width * 0.3 - c.left) / s, (r.top + r.height * 0.35 - c.top) / s);
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
        var peg = iIntro && this.introTrin === D.INTRO_PEG + 1 ? PEG_PAA[this.introId] : null;
        if (peg !== this.pegerPaa) {
            if (this.pegerPaa && NK.el(this.pegerPaa)) NK.el(this.pegerPaa).classList.remove("peg");
            if (peg && NK.el(peg)) NK.el(peg).classList.add("peg");
            this.pegerPaa = peg;
        }
    };

    NK.Laerer = Laerer;
}());

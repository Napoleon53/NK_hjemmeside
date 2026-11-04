/* =====================================================================
   laerer.js - Kemichael praesenterer spillet

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Her tegnes han paa et gennemsigtigt laerred
   oven paa hele studiet, skaleret efter laerredets hoejde, som i sc2.4.

   Han kommer kun, naar man beder om det (tilbuddet paa titelskaermen,
   som js/app.js laegger paa, og tasten K), stiller sig til venstre for
   opsaetningen og praesenterer spillet. Praesentationen er den faelles
   (../kemichael/praesentation.js, brugerens regler 4. nov. 2026): ét
   trin ad gangen med to til fire hele saetninger (D.INTRO i js/data.js)
   i en taleboble ved hans hoved med knapperne Naeste og Spring
   praesentationen over. Det, han peger paa, faar en gul ramme, der
   blinker. Han gaar aldrig videre af sig selv. Esc og Start spillet
   sender ham ud. Under spillet kommer han ikke ind af sig selv.

   Baggrundslivet er slaaet fra: han maa aldrig gaa hen over en ledetraad.
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

    var UDE = K.UDE;
    var NOEGLE = "nk-jeopardy-intro";

    /* Det, han stiller sig til venstre for */
    var VED = { titel: "opsaetning" };

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.introVent = 0;
        this.introId = null;
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
        var maal = NK.el(VED[this.introId] || "");
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

    /* Trinnene for den skaerm, han praesenterer (D.INTRO i js/data.js) */
    P.introLinjer = function () {
        return D.INTRO[this.introId] || [];
    };

    /* Laeg den faelles praesentation paa (laererIntro, Naeste, boblen,
       laererIntroVaek, laererIIntro og laererIntroKlik). Det, han peger
       paa, er elementer paa siden (sel i D.INTRO). */
    NK.Praesentation.trin(P);

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0) this.laererIntro();
        }
        this.opdaterLaerer(dt);
        if (this.introOpdaterBoble && (this.kmIntro || this.kmBobleAktiv)) this.introOpdaterBoble();
    };

    NK.Laerer = Laerer;
}());

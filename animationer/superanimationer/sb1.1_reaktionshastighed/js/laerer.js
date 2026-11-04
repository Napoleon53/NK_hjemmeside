/* =====================================================================
   laerer.js - Kemichael praesenterer fanerne

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og baggrundslivet)
   staar i ../../v2/kemichael/kemichael.js. Den er bygget til et fast
   tegnebord paa 1000 x 600 enheder. Denne animation har intet fast
   tegnebord, saa laereren tegnes skaleret efter laerredets hoejde
   (laererLaerredSkala), som i sc2.1, sc2.3 og sc2.4.

   Der er én laerer for hele siden. Han tegnes paa den aktive fanes
   laerred (skiftLaerred). Han kommer kun, naar eleven beder om det
   (tilbuddet foerste gang, som js/app.js laegger paa, og tasten K), og
   praesenterer fanen. Praesentationen er den faelles
   (../kemichael/praesentation.js, brugerens regler 4. nov. 2026): ét
   trin ad gangen med to til fire hele saetninger (D.INTRO i js/data.js)
   i en taleboble ved hans hoved med knapperne Naeste og Spring
   praesentationen over. Det, han peger paa, faar en gul ramme, der
   blinker. Han gaar aldrig videre af sig selv. Esc og et faneskift
   sender ham ud. Ellers kommer han ikke ind af sig selv.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = NK.Kemichael;
    if (!K) return;

    NK.Scene = NK.Scene || { BREDDE: 1000, HOEJDE: 600, ANKER: {} };
    Object.keys(K.ANKER).forEach(function (navn) { NK.Scene.ANKER[navn] = K.ANKER[navn]; });

    var UDE = K.UDE;
    var NOEGLE = "nk-sb1.1-intro";

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

    /* En anden fane: han tegnes paa dens laerred fra nu af */
    P.skiftLaerred = function (laerred) {
        this.L = laerred;
    };

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Han staar ude til hoejre paa laerredet (andel af bredden): paa fane
       1 og 3 over den flade ende af kurverne, paa fane 2 over den sidste
       del af grafen ved siden af kassen */
    var PLADS = { kurve: 0.84, sammenstoed: 0.92, udtryk: 0.78 };
    var KANT = -150;     /* lige uden for laerredets venstre kant (enheder) */

    P.laererPlads = function () {
        return this.L.b * (PLADS[this.introId] || 0.84) / this.laererLaerredSkala();
    };

    /* Tegnes til sidst, ovenpaa fanens egen tegning. */
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

    /* En anden fane, Esc: han gaar ud, hvis han er midt i en praesentation. */
    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    /* Trinnene for den fane, han praesenterer (D.INTRO i js/data.js) */
    P.introLinjer = function () {
        return D.INTRO[this.introId] || [];
    };

    /* Det, han peger paa, og som er tegnet paa laerredet (felt i D.INTRO),
       i laerredets pixels. Fanernes lay er det, de selv tegner efter. */
    P.introFelt = function (navn) {
        var sim = NK.sims && NK.sims[this.introId], lay = sim && sim.lay;
        if (!lay) return null;
        if (navn === "glas") return { x: lay.bx - 6, y: lay.by - 6, b: lay.bw + 12, h: lay.bh + 64 };
        if (navn === "graf") return { x: lay.gx0, y: lay.gy0, b: lay.gx1 - lay.gx0, h: lay.gy1 - lay.gy0 };
        /* Kassen paa fane 2 er 600 x 440 i partiklernes enheder (VB og VH
           i js/sim_sammenstoed.js) */
        if (navn === "kasse") return { x: lay.kx - 4, y: lay.ky - 4, b: 600 * lay.s + 8, h: 440 * lay.s + 8 };
        return null;
    };

    /* Laeg den faelles praesentation paa (laererIntro, Naeste, boblen,
       laererIntroVaek, laererIIntro og laererIntroKlik) */
    NK.Praesentation.trin(P);

    /* Han traeder ind lige fra laerredets kant i stedet for langt ude fra,
       saa han ogsaa er fremme paa godt to sekunder, naar han skal helt over
       i hoejre side */
    var laererIntro = P.laererIntro;
    P.laererIntro = function () {
        var L = this.laerer;
        if (L && !L.scene && L.x <= UDE + 1) { L.x = KANT; L.maalX = KANT; }
        return laererIntro.apply(this, arguments);
    };

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

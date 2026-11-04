/* =====================================================================
   laerer.js - Kemichael praesenterer sværhedsgraderne

   Selve figuren (gang, arm, ansigt, tale og klik paa ham) staar i
   ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererLaerredSkala),
   som i sc2.1 og sc2.3.

   Der er én laerer for hele siden. Foerste gang en sværhedsgrad aabnes i
   en browser, tilbyder han at praesentere den (js/app.js). Praesentationen
   er den faelles (../kemichael/praesentation.js): han gaar ind foran det
   tomme glas i midten og siger tre trin (D.INTRO), hvert med to til fire
   hele saetninger i en taleboble med Naeste og Spring praesentationen
   over. Det, trinnet handler om, faar en gul ramme, og armen peger
   derhen. Han gaar foerst videre, naar eleven trykker Naeste. Scenen
   laaser ikke. Et andet niveau eller opslaget i fældningstabellen sender
   ham ud; K viser praesentationen igen.

   Brugerens regel 4. nov. 2026: han kommer kun ind af sig selv, naar
   noget er helt gennemfoert, eller naar eleven goer noget vildt. Her
   kommer han derfor kun til praesentationen.
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
    var NOEGLE = "nk-sc2.4-intro";

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

    P.laererPlads = function () {
        return this.L.b * 0.5 / this.laererLaerredSkala();
    };

    /* Tegnes til sidst, ovenpaa glassene. */
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
    /* Trinnene for den sværhedsgrad, han praesenterer */
    P.introLinjer = function () { return D.INTRO[this.introId] || []; };

    /* Opløsningen med ionerne i de to smaa glas paa laerredet (felt "A"
       og "B"), i laerredets pixels. Rammen gaar om vaesken, ikke om den
       tomme del af glasset, saa taleboblen kan staa over glassene. */
    P.introFelt = function (navn) {
        var n = NK.niveauer && NK.niveauer[this.introId], b = n && n.baeger;
        var geo = b && (b.geo || b.layout(this.L.b, this.L.h));
        var g = geo && geo[navn];
        if (!g) return null;
        var top = g.vb - g.hFuld;
        return { x: g.vl - 6, y: top - 6, b: g.vh - g.vl + 12, h: g.vb - top + 12 };
    };

    NK.Praesentation.trin(P);

    /* Det foerste, trinnet peger paa, i laerredets pixels: en ting paa
       siden (sel), ellers et glas (felt) */
    function maalPunkt(sim, linje) {
        var sel = linje.sel ? [].concat(linje.sel)[0] : null;
        var r = sel ? NK.Praesentation.rekt(sel) : null;
        if (r) {
            var c = sim.L.canvas.getBoundingClientRect();
            var x = r.x + r.b / 2 - c.left;
            if (r.x > c.right) x = r.x - c.left + 40;       /* panelet: dets venstre kant */
            return { x: x, y: r.y + r.h / 2 - c.top };
        }
        var felt = linje.felt ? [].concat(linje.felt)[0] : null;
        r = felt ? sim.introFelt(felt) : null;
        return r ? { x: r.x + r.b / 2, y: r.y + r.h / 2 } : null;
    }

    /* Armen sigter efter det, trinnet handler om, som foer: op mod
       tekstboksen og tavlen, til hoejre mod panelet. Til venstre for ham
       (det venstre glas) peger han ikke, for armen ville gaa hen over
       kroppen; han kigger derhen, og rammen viser det. Den faelles kode
       ville give armen skraat ned foran kroppen, ogsaa naar maalet staar
       over ham. */
    P.introArm = function (linje) {
        var L = this.laerer, s = this.laererLaerredSkala(), p = maalPunkt(this, linje);
        if (!p) { L.hovedMaal = 0; return HAENGER; }
        L.hovedMaal = this.kigVinkel(p.x / s);
        var v = this.pegVinkel(p.x / s, p.y / s);
        if (v > 1.85) return 1.85;          /* over 2 tegnes armen bag kroppen */
        if (v >= -0.2) return v;
        return v > -0.8 ? -0.2 : HAENGER;
    };

    var vis = P.introVis;
    P.introVis = function (n) {
        vis.call(this, n);
        var sc = this.laerer && this.laerer.scene, linje = this.introLinjer()[n], mig = this;
        if (!sc || sc.navn !== "intro" || !linje) return;
        sc.trin.forEach(function (tr) {
            if (typeof tr.arm === "function") tr.arm = function () { return mig.introArm(linje); };
        });
    };

    /* Kaldes af js/app.js (pakket ind af NK.Praesentation.pakInd, saa der
       foerste gang staar Start praesentation og Nej tak) */
    P.startIntro = function (id, tving) {
        var sete = NK.hent(NOEGLE, {});
        if (!tving && sete[id]) return;
        sete[id] = true;
        NK.gem(NOEGLE, sete);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introId = id;
        this.introVent = tving ? 0.1 : 0.9;
    };

    /* Et andet niveau, Esc og Spring praesentationen over */
    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };
    P.springIntro = function () { return this.stopIntro(); };

    P.opdater = function (dt) {
        this.tid += dt;
        if (this.introVent > 0) {
            this.introVent -= dt;
            if (this.introVent <= 0) this.laererIntro();
        }
        /* Opslaget daekker scenen: han gaar, saa Esc og Enter virker paa
           opslaget og ikke paa en praesentation bag det */
        if (this.kmIntro && NK.Opslag && NK.Opslag.aaben()) this.stopIntro();
        /* Han kommer ind fra lige uden for venstre kant, ikke helt ude fra
           (K.UDE), saa vejen hen til glasset i midten ikke tager for lang
           tid. Derude kan han ikke ses, saa springet ses ikke. */
        var L = this.laerer;
        if (this.kmIntro && L && L.x < -120 && L.maalX > -120) L.x = -120;
        this.opdaterLaerer(dt);
        if (this.kmIntro) this.introOpdaterBoble();
    };

    NK.Laerer = Laerer;
}());

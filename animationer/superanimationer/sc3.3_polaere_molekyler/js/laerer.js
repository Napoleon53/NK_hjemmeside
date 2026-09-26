/* =====================================================================
   laerer.js - Kemichael praesenterer fanerne

   Selve figuren (gang, arm, ansigt, tale, klik paa ham) staar i
   ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Fanerne
   har intet fast tegnebord, saa han tegnes skaleret efter lagets hoejde
   (laererLaerredSkala, 0,92 som i sc2.2 og sc2.3). Gulvet saettes til
   lagets bund, hver gang han tegnes, saa benene ikke bliver lange i et
   hoejt vindue.

   Han tegnes paa sit eget lag (#laerer-lag), som app.js flytter ind i
   den aktive fanes scene. Laget tager ikke imod musen; app.js giver
   klik paa ham videre.

   Foerste gang en fane aabnes, staar tilbuddet Start praesentation /
   Nej tak (js/praesentation.js). Tager eleven imod, gaar han ind, siger
   to eller tre korte linjer (D.INTRO) og gaar igen. Mens han siger
   linjen peg, peger han paa det, den handler om, og det lyser op
   (klassen peg). Scenen laaser ikke. Knappen Spring praesentationen
   over, to klik paa ham og Esc sender ham ud; K viser den igen.
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
    var NOEGLE = "nk-sc3.3-intro";

    /* Det element, der lyser op, mens han peger */
    var PEG_PAA = { "fane-en": "en-tabel", "fane-polaritet": "pol-menu", "fane-vand": "vand-forloeb" };

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

    /* Hvor han staar, i lagets pixels. Paa fane 2 til hoejre, fordi
       prikformlen staar oeverst til venstre; ellers til venstre. */
    P.laererPladsPx = function () {
        var b = this.L.b;
        var halv = 120 * this.laererLaerredSkala();
        if (this.introId === "fane-polaritet") return Math.max(b * 0.5, b - Math.max(halv + 20, b * 0.12));
        return Math.min(b * 0.5, halv);
    };

    P.laererPlads = function () {
        return this.laererPladsPx() / this.laererLaerredSkala();
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

    /* En anden fane: han gaar ud, hvis han er midt i en praesentation. */
    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    P.laererIntro = function () {
        var mig = this, intro = D.INTRO[this.introId];
        if (!intro) return;
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 }
        ];
        intro.linjer.forEach(function (l, i) {
            trin.push({ kald: function () { mig.introTrin = i + 1; } });
            if (i === intro.peg) trin.push({ arm: function () { return mig.pegPaa(); }, tid: 0.45 });
            trin.push({ sig: l, vis: replikTid(l), tid: replikTid(l) });
            if (i === intro.peg) trin.push({ arm: HAENGER, tid: 0.35 });
        });
        this.laererKoer("intro", trin.concat([
            { taleFaerdig: true },
            { udtryk: { skeptisk: 0, humoer: 0 } },
            { kald: function () { mig.introTrin = 0; } },
            { gaa: UDE }
        ]), false);
    };

    P._pegElement = function () {
        var id = PEG_PAA[this.introId];
        var el = id && NK.el(id);
        return el && el.offsetWidth ? el : null;
    };

    /* Han peger paa elementet i panelet, eller midt paa scenen */
    P.pegPaa = function () {
        var s = this.laererLaerredSkala();
        var el = this._pegElement();
        var x = this.L.b * 0.5, y = this.L.h * 0.45;
        if (el) {
            var r = el.getBoundingClientRect(), c = this.L.canvas.getBoundingClientRect();
            x = r.left - c.left + r.width * 0.25;
            y = r.top - c.top + r.height * 0.5;
        }
        return this.pegVinkel(x / s, y / s);
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
        var intro = D.INTRO[this.introId];
        var peg = iIntro && intro && this.introTrin === intro.peg + 1 ? this._pegElement() : null;
        if (peg !== this.pegerPaa) {
            if (this.pegerPaa) this.pegerPaa.classList.remove("peg");
            if (peg) peg.classList.add("peg");
            this.pegerPaa = peg;
        }
    };

    NK.Laerer = Laerer;
}());

/* =====================================================================
   laerer.js - Kemichael ved vaegten, skaalvaegten og flaskerne

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererLaerredSkala),
   som i sc1.2 og sc2.3.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre
     laererIntroPlads()    hvor han staar under praesentationen, i enheder
     introLinjer()         praesentationens trin (D.INTRO_*)

   Scener:
     intro     hver fane: praesentationen, naar eleven siger ja. Koden er
               faelles (../kemichael/praesentation.js): tre trin, hvert med
               to til fire hele saetninger i en taleboble med Naeste og
               Spring praesentationen over. Det, trinnet handler om, faar en
               gul ramme (de usynlige .anker fra rundvisningen og kortene i
               panelet). Han gaar foerst videre, naar eleven trykker Naeste.
     niveau    fane 1 og 3: alle tolv stoffer eller flasker er loest
     slut      fane 2: en runde med ni rigtige af ni
   Brugerens regel 4. nov. 2026: han kommer kun ind af sig selv, naar
   noget er helt gennemfoert, eller naar eleven goer noget vildt. Rosen
   efter hvert niveau og kommentaren efter hver runde er taget ud.
   Kaffen staar paa bordet paa fane 1 og 3 og er det faelles paaskeaeg.
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
    var NED = 1.85;      /* armen skraat ned foran kroppen; over 2 tegnes den bag kroppen */

    /* Det foerste, et trin i praesentationen peger paa, i laerredets pixels */
    function maalPunkt(sim, linje) {
        var sel = linje.sel ? [].concat(linje.sel)[0] : null;
        var r = sel ? NK.Praesentation.rekt(sel) : null;
        if (!r) return null;
        var c = sim.L.canvas.getBoundingClientRect();
        var x = r.x + r.b / 2 - c.left;
        if (r.x > c.right) x = r.x - c.left + 40;       /* panelet: dets venstre kant */
        return { x: x, y: r.y + r.h / 2 - c.top, top: r.y - c.top };
    }

    function kobl(P, valg) {
        K.paa(P, valg);

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
        };

        /* Tegnes til sidst, ovenpaa alt andet paa laerredet. */
        P.laererTegnOver = function (ctx) {
            var L = this.laerer;
            if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
            var s = this.laererLaerredSkala();
            NK.Scene.BREDDE = this.L.b / s;
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid);
            ctx.restore();
        };

        /* Musen i pixels: er den over laereren? */
        P.laererUnder = function (px, py) {
            if (!this.laerer || !this.overLaerer) return false;
            var s = this.laererLaerredSkala();
            return !!this.overLaerer({ x: px / s, y: py / s });
        };

        /* Et klik i pixels: true, hvis det ramte laereren. */
        P.laererKlik = function (px, py) {
            if (!this.laererUnder(px, py)) return false;
            return this.klikLaerer();
        };

        /* Aldrig saa langt ude, at han staar halvt uden for billedet. Under
           praesentationen staar han, hvor fanen vil have ham. */
        P.laererPlads = function () {
            if (this.kmIntro && this.laererIntroPlads) return this.laererIntroPlads();
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };

        /* Praesentationen: ét trin ad gangen med Naeste og Spring
           praesentationen over (faelles, ../kemichael/praesentation.js) */
        NK.Praesentation.trin(P);

        /* Armen sigter efter det, trinnet handler om: op mod plakaten og
           til hoejre mod panelet og bordet. Til venstre for ham peger han
           ikke, for armen ville gaa hen over ansigtet; han kigger derhen,
           og rammen viser det. Den faelles kode ville give armen skraat
           ned foran kroppen, ogsaa naar maalet staar over ham. */
        P.introArm = function (linje) {
            var L = this.laerer, s = this.laererLaerredSkala(), p = maalPunkt(this, linje);
            if (!p) { L.hovedMaal = 0; return HAENGER; }
            L.hovedMaal = this.kigVinkel(p.x / s);
            /* Staar det lige ved ham (maerket paa fane 3), sigter han lidt
               over det, saa haanden ikke daekker det, han taler om */
            var naer = Math.abs(p.x / s - this.laererSkulder().x) < 260;
            var v = this.pegVinkel(p.x / s, (naer ? p.top - 40 : p.y) / s);
            if (v > NED) return NED;
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
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Toer ros: han loefter fingeren, nikker og siger replikken */
    function rosTrin(P, replik) {
        return [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: P.laererPlads },
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

    function kaffeValg(pos) {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() - 150 * pos : 700;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
            }
        };
    }

    /* ----- Fane 1: vaegten ---------------------------------------------------- */
    var PV = NK.SimVaegt.prototype;
    var vv = kaffeValg(1);
    vv.fredet = ["niveau"];
    PV.introLinjer = function () { return D.INTRO_VAEGT; };
    PV.laererIntroPlads = function () {
        return this.lay ? Math.max(150, (this.lay.vaegt.x - this.lay.vaegtB * 0.9) / this.laererLaerredSkala()) : 350;
    };
    kobl(PV, vv);

    PV.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.kop.x - 110) : 250;
    };

    /* Kun naar alle tolv stoffer er vejet (alt), ikke efter hvert niveau */
    PV.laererNiveau = function (niveau, alt) {
        if (!this.laerer || !alt) return;
        this.laererKoer("niveau", rosTrin(PV, D.VAEGT_FAERDIG), false);
    };

    /* ----- Fane 2: skaalvaegten ------------------------------------------------- */
    var PS = NK.SimSkaal.prototype;
    PS.introLinjer = function () { return D.INTRO_SKAAL; };
    kobl(PS, { fredet: ["slut"] });

    PS.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.v.x - this.lay.v.L - 150) : 150;
    };

    /* Kun efter en runde med alle par rigtige */
    PS.laererSlut = function (point) {
        if (!this.laerer || !this.runde || point < this.runde.length) return;
        var replik = D.RUNDE_FULDT;
        this.laererKoer("slut", [
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0 } },
            { gaa: PS.laererPlads },
            { tid: 0.3 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    /* ----- Fane 3: ukendt stof --------------------------------------------------- */
    var PU = NK.SimUkendt.prototype;
    var vu = kaffeValg(1);
    vu.fredet = ["niveau"];
    PU.introLinjer = function () { return D.INTRO_UKENDT; };
    PU.laererIntroPlads = function () {
        return this.lay ? Math.max(150, (this.lay.flaske.x - 150) / this.laererLaerredSkala()) : 250;
    };
    kobl(PU, vu);

    PU.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.flaske.x - this.lay.flaskeB / 2 - 90) : 150;
    };

    /* Kun naar alle tolv flasker har faaet etiket (alt) */
    PU.laererNiveau = function (niveau, alt) {
        if (!this.laerer || !alt) return;
        this.laererKoer("niveau", rosTrin(PU, D.GAADER_FAERDIG), false);
    };
}());

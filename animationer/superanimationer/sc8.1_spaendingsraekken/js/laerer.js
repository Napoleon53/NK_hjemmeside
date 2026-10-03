/* =====================================================================
   laerer.js - Kemichael ved forsoeget, hylden og raekken

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js, som er faelles og ikke rettes her.
   Den er bygget til et fast tegnebord paa 1000 x 600 enheder. Denne
   animation har intet fast tegnebord, saa laereren tegnes skaleret efter
   laerredets hoejde (laererLaerredSkala), som i sc7.4.

   Benene: kitlen fortsaetter ned til scenens gulv (NK.Scene.GULV). Her
   saettes gulvet til laerredets bund, hver gang han tegnes, og skalaen
   er 0,8, saa han kan staa ved siden af holderen og glassene.

   Han tegnes i to lag: kroppen (laererTegnOver) bag stængerne og
   kortene, saa de kan gribes, og taleboblen (laererTegnBoble) allersidst,
   saa intet i scenen daekker det, han siger. Under praesentationen er
   boblen et HTML-element med knappen Naeste i (js/praesentation.js).

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     this.lay.kop          hvor koppen staar (han stiller sig ved siden af)
     introLinjer()         praesentationens trin: [{ tekst, sel }]

   Scener:
     intro   hver fane: praesentationen (D.INTRO_*), naar eleven vil.
             Ét trin ad gangen: han siger linjen, peger paa det, der
             blinker (sel), og bliver staaende, til eleven trykker Naeste
             (introNaeste). Han gaar aldrig videre af sig selv.
     sig     en replik: ros (med ros-regnskabet) eller en toer bemaerkning
             (paaskeaegget med stangen i kaffen)
   Kaffen staar paa bordet i alle tre faner og er det faelles paaskeaeg.
   NB: fanernes egne metoder maa ikke hedde det samme som dem, K.paa
   laegger paa (laererSig, laererKoer, laererTaler ...), se sc7.2.
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

    /* Armen, naar det, han viser, staar lige ved ham selv: skraat ned
       foran kroppen (over 2 tegnes armen bag kroppen) */
    var NED = 1.85;

    /* Scenens maal i figurens enheder: laerredet, og gulvet ved dets bund. */
    function scenemaal(sim) {
        var s = sim.laererLaerredSkala();
        NK.Scene.BREDDE = sim.L.b / s;
        NK.Scene.HOEJDE = sim.L.h / s;
        NK.Scene.GULV = sim.L.h / s;
        return s;
    }

    function kaffeValg() {
        return {
            kaffeX: function () {
                var lay = this.lay;
                return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 300;
            },
            kaffeArm: function () {
                var lay = this.lay, s = this.laererLaerredSkala();
                return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
            },
            fredet: ["sig", "glimt"]
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Midten af det, en selector rammer, i figurens enheder. Det kan
       ligge uden for laerredet (panelet og toplinjen). */
    function maalPunkt(sim, sel) {
        var r = NK.Praesentation.rekt(sel);
        if (!r) return null;
        var c = sim.L.canvas.getBoundingClientRect(), s = sim.laererLaerredSkala();
        return { x: (r.x + r.b / 2 - c.left) / s, y: (r.y + r.h / 2 - c.top) / s };
    }

    function kobl(P) {
        K.paa(P, kaffeValg());

        P.aendret = function () {};

        P.laererLaerredSkala = function () {
            return NK.klamp(this.L.h / 600 * 0.8, 0.45, 1.1);
        };

        function synlig(L) {
            return !!L && !(L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01);
        }

        /* Kroppen. Fanen tegner den foer det, eleven skal kunne gribe. */
        P.laererTegnOver = function (ctx) {
            if (!synlig(this.laerer)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaerer(ctx, this.tid, { udenBoble: true });
            ctx.restore();
        };

        /* Taleboblen. Fanen tegner den som det allersidste. Under
           praesentationen staar teksten i HTML-boblen i stedet. */
        P.laererTegnBoble = function (ctx) {
            if (this.intro || !synlig(this.laerer)) return;
            var s = scenemaal(this);
            ctx.save();
            ctx.scale(s, s);
            this.tegnLaererBoble(ctx, this.tid);
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

        /* Aldrig saa langt ude, at han staar halvt uden for billedet */
        P.laererPlads = function () {
            return Math.max(150, this.laererPladsPx() / this.laererLaerredSkala());
        };

        /* Kaffen er ikke med i praesentationen */
        var klikKop = P.klikKop;
        P.klikKop = function () {
            if (this.laererIIntro()) return false;
            return klikKop.apply(this, arguments);
        };

        /* ----- Praesentationen: ét trin ad gangen ------------------------------ */
        P.laererIntro = function () {
            if (!this.laerer) return;
            var sim = this, L = this.laerer;
            this.intro = { nr: -1, antal: this.introLinjer().length };
            /* Eleven har bedt om den: en replik, der staar endnu, viger straks */
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            this.laererKoer("intro", [
                { udtryk: { vrede: 0, humoer: 0.3, roed: 0, skeptisk: 0, briller: 0 } },
                { gaa: function () { return sim.laererPlads(); } },
                { tid: 0.15 },
                { kald: function () { sim.introVis(0); } }
            ], false);
        };

        /* Trin n: linjen siges straks, og armen gaar hen mod det, der blinker */
        P.introVis = function (n) {
            var L = this.laerer, linje = this.introLinjer()[n], sim = this;
            if (!L || !linje || !this.intro) return;
            this.intro.nr = n;
            L.taleUr = 0;                 /* ellers venter scenen paa den forrige replik */
            /* sig giver mundbevaegelsen; teksten staar i HTML-boblen */
            this.laererKoer("intro", [
                { sig: linje.tekst, vis: 2, tid: 0.05 },
                {
                    arm: function () {
                        var p = linje.sel ? maalPunkt(sim, linje.sel) : null;
                        L.hovedMaal = p ? sim.kigVinkel(p.x) : 0;
                        if (!p) return HAENGER;
                        return p.x < sim.laererSkulder().x + 90 ? NED : sim.pegVinkel(p.x, p.y);
                    },
                    tid: 0.35
                }
            ], false);
        };

        /* Knappen Naeste (og Enter). Efter det sidste trin gaar han. */
        P.introNaeste = function () {
            var i = this.intro;
            if (!i || i.nr < 0) return false;
            if (i.nr >= i.antal - 1) return this.laererIntroVaek(true);
            this.introVis(i.nr + 1);
            return true;
        };

        /* Til taleboblen: hvilket trin, teksten, og hvad der skal blinke */
        P.introStatus = function () {
            var i = this.intro;
            if (!i || i.nr < 0) return null;
            var linje = this.introLinjer()[i.nr];
            return { nr: i.nr, antal: i.antal, tekst: linje.tekst, sel: linje.sel || null };
        };

        /* Hans hoved i laerredets pixels, saa taleboblen kan staa ved
           det: midten, kassen om hovedet og munden (hovedet er 110 x 130
           enheder, issen 116 over halsen og munden 97 under issen) */
        P.introHoved = function () {
            if (!this.laerer) return null;
            var s = this.laererLaerredSkala(), krop = this.laererKrop();
            return {
                x: krop.x * s, top: (krop.y - 116) * s, bund: (krop.y + 14) * s,
                venstre: (krop.x - 58) * s, hoejre: (krop.x + 58) * s, mund: (krop.y - 19) * s
            };
        };

        /* Et klik paa ham under praesentationen viser, hvor Naeste er */
        P.laererIntroKlik = function (px, py) {
            if (!this.laererIIntro() || !this.laererUnder(px, py)) return false;
            var k = NK.el(this.springId).querySelector(".intro-naeste");
            k.classList.remove("puf");
            void k.offsetWidth;
            k.classList.add("puf");
            return true;
        };

        /* Spring over, Esc eller Afslut (rolig: han gaar, ellers loeber han) */
        P.laererIntroVaek = function (rolig) {
            var L = this.laerer;
            if (!L || !this.intro) return false;
            this.intro = null;
            L.tale = "";
            L.taleUr = 0;
            L.taleAlfa = 0;
            L.hovedMaal = 0;
            this.laererKoer("introUd", [
                { arm: HAENGER, tid: 0.15 },
                { udtryk: { skeptisk: 0, humoer: 0 } },
                { gaa: UDE, loeb: !rolig }
            ], false);
            return true;
        };

        P.laererIIntro = function () { return !!this.intro; };

        /* ----- En replik: ros (loefter fingeren og nikker) eller en toer
                 bemaerkning over brillerne ------------------------------------ */
        P.laererReplik = function (tekst, ros) {
            /* En replik afbryder aldrig praesentationen */
            if (!this.laerer || this.laererIIntro()) return;
            var trin;
            if (ros) {
                trin = [
                    { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
                    { gaa: P.laererPlads },
                    { tid: 0.3 },
                    { arm: 0.3, tid: 0.5 },
                    { sig: tekst, vis: replikTid(tekst), tid: replikTid(tekst),
                      hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
                    { kald: function () { this.laerer.nik = 0; } },
                    { arm: HAENGER, tid: 0.4 }
                ].concat(K.ros(), [{ taleFaerdig: true }, { gaa: UDE }]);
            } else {
                trin = [
                    { udtryk: { vrede: 0, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
                    { gaa: P.laererPlads },
                    { tid: 0.3 },
                    { sig: tekst, vis: replikTid(tekst), tid: replikTid(tekst) },
                    { udtryk: { skeptisk: 0, briller: 0 } },
                    { taleFaerdig: true },
                    { gaa: UDE }
                ];
            }
            this.laererKoer("sig", trin, false);
        };

        /* Et glimt af hans baggrund, hvis det ikke er vist i denne browser */
        P.laererGlimt = function (id) {
            if (!this.laerer || this.laerer.scene || this.laererIIntro()) return;
            var glimt = K.glimtTrin(id);
            if (!glimt.length) return;
            this.laererKoer("glimt", [
                { udtryk: { vrede: 0, humoer: 0.1, roed: 0.2, skeptisk: 0.4, briller: 1 } },
                { gaa: P.laererPlads },
                { tid: 0.3 }
            ].concat(glimt, [
                { udtryk: { skeptisk: 0, briller: 0, roed: 0 } },
                { taleFaerdig: true },
                { gaa: UDE }
            ]), false);
        };
    }


    /* ----- Fane 1: forsoeget ------------------------------------------------------ */
    var PF = NK.SimForsoeg.prototype;
    PF.springId = "fs-spring";
    PF.introLinjer = function () { return D.INTRO_FORSOEG; };
    kobl(PF);

    /* ----- Fane 2: raekken ---------------------------------------------------------- */
    var PR = NK.SimRaekken.prototype;
    PR.springId = "rk-spring";
    PR.introLinjer = function () { return D.INTRO_RAEKKEN; };
    kobl(PR);

    /* ----- Fane 3: forudsig ----------------------------------------------------------- */
    var PU = NK.SimForudsig.prototype;
    PU.springId = "fu-spring";
    PU.introLinjer = function () { return D.INTRO_FORUDSIG; };
    kobl(PU);

}());

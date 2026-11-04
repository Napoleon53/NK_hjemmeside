/* =====================================================================
   laerer.js - Kemichael ved montren, flaskerne og opraabet

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../../v2/kemichael/kemichael.js. Den er bygget til et fast tegnebord
   paa 1000 x 600 enheder. Denne animation har intet fast tegnebord, saa
   laereren tegnes skaleret efter laerredets hoejde (laererLaerredSkala),
   som i sc2.3. Figurens egen skala (laererSkala) roeres ikke, for den
   bruges til haanden, der holder kaffekoppen.

   Hver fane kobles paa for sig og skal have:
     this.tid              et ur, der altid gaar (sekunder)
     this.L                laerredet
     laererPladsPx()       hvor laereren stiller sig, i pixels fra venstre

   Scener:
     intro     hver fane: praesentationen (D.INTRO_*), naar eleven vil.
               Ét trin ad gangen med Naeste og Spring praesentationen over;
               han gaar aldrig videre af sig selv. Koden er faelles:
               NK.Praesentation.trin (../kemichael/praesentation.js).
     faerdig   fane 1: alle 36 proever staar i udstillingen (én gang)
               fane 2: alle tolv flasker er talt (én gang)
     slut      fane 3: et spil er slut med ny rekord, mange point eller alle
               tyve gaader fundet (én gang pr. besoeg for hvert spil)
   Ellers kommer han ikke af sig selv (brugerens regel 4. nov. 2026).
   Kaffen staar paa bordet paa fane 1 og 2 og er det faelles paaskeaeg.
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

        P.laererPlads = function () {
            return this.laererPladsPx() / this.laererLaerredSkala();
        };
    }

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* Tør ros: han loefter fingeren, nikker og siger replikken */
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

    /* ----- Fane 1: montren -------------------------------------------------- */
    var PM = NK.SimMontre.prototype;
    kobl(PM, {
        fredet: ["faerdig"],
        /* Han stiller sig til venstre for koppen og tager den med hoejre haand */
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() - 150 : 700;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : 2;
        }
    });

    /* Han staar foran kassen, saa skiltet med linjen om stoffet, proeven,
       maerket og tavlen kan ses, ogsaa under praesentationen */
    PM.laererPladsPx = function () {
        var lay = this.lay;
        if (!lay) return 300;
        return Math.max(lay.kasse.x + lay.kasse.b * 0.5, 100 * this.laererLaerredSkala());
    };
    PM.introLinjer = function () { return D.INTRO_MONTRE; };

    /* Det, han peger paa paa laerredet: proeven paa bordet med maerket
       (i laerredets pixels, som tegningen i sim_montre.js) */
    PM.introFelt = function (navn) {
        var lay = this.lay, o = this.opg;
        if (navn !== "proeve" || !lay || !o || o.placeret) return null;
        var x0 = lay.bordX - lay.storH * 0.25;
        return { x: x0, y: lay.bordY - lay.storH, b: lay.storH * 0.45 + 18 + lay.maerke.b, h: lay.storH };
    };
    NK.Praesentation.trin(PM);

    /* Alle 36 proever staar i udstillingen */
    PM.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PM, D.MONTRE_FULD), false);
    };

    /* ----- Fane 2: formlerne ------------------------------------------------ */
    var PF = NK.SimFormler.prototype;
    kobl(PF, {
        fredet: ["faerdig"],
        /* Koppen staar yderst til venstre: han stiller sig til hoejre for den */
        kaffeX: function () {
            var lay = this.lay;
            return lay ? lay.kop.x / this.laererLaerredSkala() + 150 : 200;
        },
        kaffeArm: function () {
            var lay = this.lay, s = this.laererLaerredSkala();
            return lay ? this.pegVinkel(lay.kop.x / s, (lay.kop.y - 24) / s) : -0.5;
        }
    });

    PF.laererPladsPx = function () {
        return this.lay ? this.lay.W * 0.3 : 300;
    };

    /* Under praesentationen staar han yderst til venstre foran den store
       flaske, saa tavlen og de smaa flasker kan ses */
    PF.laererPlads = function () {
        var s = this.laererLaerredSkala();
        if (this.kmIntro) return 100;
        return this.laererPladsPx() / s;
    };
    PF.introLinjer = function () { return D.INTRO_FORMLER; };
    NK.Praesentation.trin(PF);

    /* Alle tolv flasker er talt */
    PF.laererFaerdig = function () {
        if (!this.laerer) return;
        this.laererKoer("faerdig", rosTrin(PF, D.FORMLER_FAERDIG), false);
    };

    /* ----- Fane 3: opraabet ------------------------------------------------- */
    var PO = NK.SimOpraab.prototype;
    kobl(PO, { fredet: ["slut"] });

    /* Han staar til venstre for tavlen, under udstillingen */
    PO.laererPladsPx = function () {
        return this.lay ? Math.max(90, this.lay.tavle.x * 0.5) : 120;
    };
    PO.introLinjer = function () { return D.INTRO_OPRAAB; };
    NK.Praesentation.trin(PO);

    /* Et spil er slut. Han kommer kun, naar det er gaaet godt (ny rekord,
       mange point, eller alle tyve gaader i Hvem er jeg?), og kun én gang
       pr. besoeg for hvert af de to spil. */
    PO.laererSlut = function (art) {
        var replik = D.SLUT_REPLIK[art];
        if (!this.laerer || this.kmIntro || !replik) return;
        this.slutRost = this.slutRost || {};
        if (this.slutRost[this.spil]) return;
        this.slutRost[this.spil] = true;
        this.laererKoer("slut", rosTrin(PO, replik), false);
    };
}());

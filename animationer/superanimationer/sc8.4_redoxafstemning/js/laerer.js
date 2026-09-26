/* =====================================================================
   laerer.js - Kemichael præsenterer sværhedsgraderne

   Selve figuren (gang, arm, ansigt, tale, kaffen, klik på ham og
   baggrundslivet) står i ../../v2/kemichael/kemichael.js, som er fælles
   og ikke rettes her. Der er ét lærred over arbejdsbordet og ingen fast
   tegnebord, så han tegnes skaleret efter lærredets højde (0,92 ×
   højde/600) med gulvet ved lærredets bund, som i sc2.4 og sc7.1.

   Scener:
     intro      første gang en sværhedsgrad åbnes: tilbuddet, så tre
                replikker (D.INTRO); under D.INTRO_PEG peger han, og det,
                han peger på, lyser op (D.PEG_PAA)
     ros        første gang alle reaktioner på en sværhedsgrad er løst
     overvaegt  påskeægget: 20 eller flere på en vægtskål
   Kaffekoppen på bordet er det fælles påskeæg.
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
    var NOEGLE = "nk-sc8.4-intro";

    function Laerer(laerred, vaegt) {
        this.L = laerred;
        this.vaegt = vaegt;
        this.tid = 0;
        this.g = { kaffekop: { skjult: false, iHaand: false } };
        this.introVent = 0;
        this.introId = null;
        this.introTrin = 0;
        this.introKlikTal = 0;
        this.overvaegtNr = 0;
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};

    /* Koppen står på bordet til højre; han går hen foran den */
    K.paa(P, {
        kaffeX: function () {
            var l = this.vaegt.lay;
            return l ? Math.max(150, l.kop.x / this.laererLaerredSkala() - 150) : 700;
        },
        kaffeArm: function () {
            var l = this.vaegt.lay, s = this.laererLaerredSkala();
            return l ? this.pegVinkel(l.kop.x / s, (l.kop.y - 24) / s) : 2;
        },
        fredet: ["ros", "overvaegt"]
    });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Til venstre for vægten */
    P.laererPlads = function () {
        return Math.max(130, this.L.b * 0.2 / this.laererLaerredSkala());
    };

    function scenemaal(mig) {
        var s = mig.laererLaerredSkala();
        NK.Scene.BREDDE = mig.L.b / s;
        NK.Scene.HOEJDE = mig.L.h / s;
        NK.Scene.GULV = mig.L.h / s;
        return s;
    }

    /* Tegnes til sidst, ovenpå vægten */
    P.laererTegnOver = function (ctx) {
        var L = this.laerer;
        if (!L || (L.x < UDE + 40 && !L.scene && L.taleAlfa < 0.01)) return;
        var s = scenemaal(this);
        ctx.save();
        ctx.scale(s, s);
        this.tegnLaerer(ctx, this.tid);
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

    function replikTid(tekst) { return K.taleTid(tekst) + 0.4; }

    /* ----- Præsentationen ----------------------------------------------------- */
    /* tving: K, præsentationen straks. Ellers kun første gang (tilbuddet
       foran den kommer fra NK.Praesentation.pakInd i js/app.js). */
    P.startIntro = function (id, tving) {
        var sete = NK.hent(NOEGLE, {});
        if (!tving && sete[id]) return;
        sete[id] = true;
        NK.gem(NOEGLE, sete);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introId = id;
        this.introVent = tving ? 0.1 : 0.9;
    };

    /* En anden sværhedsgrad: han går ud, hvis han er midt i en præsentation */
    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    P.laererIntro = function () {
        var mig = this, linjer = D.INTRO[this.introId];
        if (!linjer) return;
        var peg = D.PEG_PAA[this.introId];
        var trin = [
            { kald: function () { mig.introKlikTal = 0; } },
            { udtryk: { vrede: 0, humoer: 0.35, roed: 0, skeptisk: 0.3, briller: 0 } },
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

    /* Armens vinkel mod et element på siden: panelet til højre,
       arbejdsbordet under lærredet */
    P.pegPaa = function (id) {
        var s = this.laererLaerredSkala();
        if (id === "arbejdsbord") return this.pegVinkel((this.L.b * 0.5) / s, (this.L.h + 160) / s);
        return this.pegVinkel(this.L.b / s + 60, this.L.h * 0.3 / s);
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

    /* Et klik under præsentationen: rammer det ham, tæller det. Andet
       klik på ham sender ham ud, det første får knappen til at blinke. */
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

    /* ----- Ros og påskeæg ------------------------------------------------------- */
    P.ros = function (id) {
        var replik = D.ROS[id];
        if (!replik || !this.laerer) return;
        this.stopIntro();
        this.laererKoer("ros", [
            { tid: 0.9 },
            { udtryk: { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 } },
            { gaa: function () { return this.laererPlads(); } },
            { tid: 0.3 },
            { arm: 0.3, tid: 0.5 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik),
              hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 4; } },
            { kald: function () { this.laerer.nik = 0; } },
            { arm: HAENGER, tid: 0.4 }
        ].concat(K.ros(), [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
    };

    /* Han peger på den skål, der er overlæsset */
    P.overvaegt = function () {
        var L = this.laerer;
        if (!L || (L.scene && L.scene.navn !== "intro")) return;
        if (this.laererIIntro()) this.laererIntroVaek();
        var mig = this, replik = D.OVERVAEGT[this.overvaegtNr % D.OVERVAEGT.length];
        this.overvaegtNr++;
        function pegSkaal() {
            var v = mig.vaegt, s = mig.laererLaerredSkala();
            if (!v.lay) return 1.2;
            var sk = v.skaal(v.vinkel < 0 ? "v" : "h");
            return mig.pegVinkel(sk.x / s, sk.y / s);
        }
        this.laererKoer("overvaegt", [
            { tid: 0.3 },
            { udtryk: { vrede: 0.2, humoer: -0.2, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: function () { return mig.laererPlads(); } },
            { tid: 0.2 },
            { arm: pegSkaal, tid: 0.45 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { arm: HAENGER, tid: 0.35 },
            { udtryk: { vrede: 0, humoer: 0, roed: 0, skeptisk: 0, briller: 0 } },
            { taleFaerdig: true },
            { gaa: UDE }
        ], false);
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
        var peg = iIntro && this.introTrin === D.INTRO_PEG + 1 ? D.PEG_PAA[this.introId] : null;
        if (peg !== this.pegerPaa) {
            if (this.pegerPaa) NK.el(this.pegerPaa).classList.remove("peg");
            if (peg) NK.el(peg).classList.add("peg");
            this.pegerPaa = peg;
        }
    };

    NK.Laerer = Laerer;
}());

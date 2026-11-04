/* =====================================================================
   laerer.js - Kemichael praesenterer bassinet og kommer forbi

   Selve figuren (gang, arm, ansigt, tale, klik paa ham og baggrundslivet)
   staar i ../../v2/kemichael/kemichael.js. Den er bygget til et fast
   tegnebord paa 1000 x 600 enheder. Denne animation har intet fast
   tegnebord, saa laereren tegnes skaleret efter laerredets hoejde
   (laererLaerredSkala), som i sc2.1, sc2.3 og sc2.4.

   Praesentationen starter kun, naar eleven vaelger Start praesentation
   (tilbuddet, som js/app.js laegger paa) eller trykker K. Den er den
   faelles (../kemichael/praesentation.js, brugerens regler 4. nov.
   2026): ét trin ad gangen med to til fire hele saetninger (D.INTRO i
   js/tekster.js) i en taleboble ved hans hoved med knapperne Naeste og
   Spring praesentationen over. Det, han peger paa, faar en gul ramme,
   der blinker. Han gaar aldrig videre af sig selv, og Esc sender ham ud.

   Besoeg: han kommer kun forbi med én replik (D.REPLIK.svaever), naar en
   stor oliedraabe svaever midt i blandingen (paaskeaegget), hoejst én
   gang pr. sidevisning. Det er en haendelse, eleven selv laver, ikke et
   besoeg paa tid.
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
    var NOEGLE = "nk-sc3.4-intro";

    function Laerer(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.g = {};
        this.introVent = 0;
        this.besoegt = {};
        this.laererStart();
    }

    var P = Laerer.prototype;
    P.aendret = function () {};
    K.paa(P, { fredet: ["besoeg"] });

    P.laererLaerredSkala = function () {
        return NK.klamp(this.L.h / 600 * 0.92, 0.45, 1.25);
    };

    /* Han staar mellem bassinet og glasset til hoejre, saa han ikke
       daekker molekylerne i bassinet */
    P.laererPlads = function () {
        return this.L.b * 0.74 / this.laererLaerredSkala();
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
    P.startIntro = function (tving) {
        if (!tving && NK.hent(NOEGLE, false)) return;
        NK.gem(NOEGLE, true);
        if (this.laererIIntro()) this.laererIntroVaek();
        this.introVent = tving ? 0.1 : 0.9;
    };

    P.stopIntro = function () {
        this.introVent = 0;
        return this.laererIntroVaek();
    };

    P.introLinjer = function () { return D.INTRO; };

    /* Laeg den faelles praesentation paa (laererIntro, Naeste, boblen,
       laererIntroVaek, laererIIntro og laererIntroKlik). Det, han peger
       paa, er kort i panelet og de usynlige .anker over laerredet. */
    NK.Praesentation.trin(P);

    /* ----- Besoeg: én replik, saa gaar han igen ------------------------ */
    P.besoeg = function (hvad) {
        if (this.besoegt[hvad] || !this.laerer) return;
        var L = this.laerer;
        /* Han er optaget (ogsaa naar han staar stille i praesentationen):
           en anden gang. Scenen melder paaskeaegget igen hvert sekund. */
        if (L.scene || this.kmIntro) return;
        this.besoegt[hvad] = true;
        var replik = K.replik("sc34-" + hvad, D.REPLIK[hvad]);
        var glad = hvad === "svaever";
        this.laererKoer("besoeg", [
            { udtryk: glad ? { vrede: 0, humoer: 0.8, roed: 0, skeptisk: 0, briller: 0 }
                           : { vrede: 0, humoer: -0.1, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: function () { return this.laererPlads(); } },
            { tid: 0.25 },
            { sig: replik, vis: replikTid(replik), tid: replikTid(replik) },
            { udtryk: { skeptisk: 0, briller: 0, humoer: 0 } }
        ].concat(glad ? K.ros() : [], [
            { taleFaerdig: true },
            { gaa: UDE }
        ]), false);
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

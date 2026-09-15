/* =====================================================================
   laerer.js - Kemichael i chipsforsoeget: paaskeaeggene og branden

   Selve figuren (gang, arm, ansigt, tale, kaffen og klik paa ham) staar
   i ../kemichael/kemichael.js. Her staar de scener, der hoerer til dette
   forsoeg.

   Paaskeaeg:
     spis      klik paa chipsposen, naar chipsene er afvejet. Hver tredje
               chip kommer laereren: foerst en advarsel med plakaten,
               derefter tager laereren posen (den kommer igen ved nyt forsoeg)
     morter    eleven knuser helt vildt med musen
     vand      vandflasken holdes, foer der er valgt oploesningsmiddel:
               laereren kigger ind fra kanten
     salt      vandet er inddampet, og der er kun salt tilbage
     heptan    heptanflasken er tabt: laereren fejer op og stiller en ny
     skaal     endnu en knust petriskaal
     brand     heptan over bunsenbraenderen: dampene antaendes. Laereren
               kaster et brandtaeppe over og konfiskerer braenderen
     ros       et godt resultat med heptan: laereren siger "Fedt."

   Glimt af baggrunden: frokost (posen), phd (morteren), oejenbryn
   (branden) og regnskabet over uheld (heptan, skaal, brand).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemichael;
    var S = NK.Scene;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var UDE = K.UDE;
    var HAENGER = K.HAENGER;

    K.paa(P, { kaffeX: 170, fredet: ["brand"] });

    P.laererStartEkstra = function () {
        this.laerer.spiseHaand = null;
        this.spist = 0;
        this.antalAmok = 0;
        this.antalSalt = 0;
        this.saltVenter = false;
        this.poseTaget = false;
    };

    /* Posen kommer igen ved nyt forsoeg */
    P.laererNytEkstra = function () {
        var L = this.laerer;
        this.poseTaget = false;
        if (L.baerer === "pose") L.baerer = null;
        L.spiseHaand = null;
    };

    /* Haanden, der tager en chip, laaser ogsaa forsoeget */
    P.laererOptaget = function () {
        var L = this.laerer;
        return !!(L && ((L.scene && L.scene.blokerer) || L.spiseHaand));
    };

    /* Saltet ventede, fordi laereren var optaget */
    P.laererVentende = function () {
        var L = this.laerer;
        if (!L.scene && this.saltVenter && !L.spiseHaand) this.laererSalt();
    };

    /* ----- Chips spises ---------------------------------------------------- */
    P.spis = function () {
        var L = this.laerer;
        if (L.scene || L.spiseHaand || this.g.pose.skjult) return false;
        L.spiseHaand = { t: 0 };
        return true;
    };

    P.efterSpist = function () {
        var n = this.spist;
        if (n % 3 === 1) { this.besked("Knas."); return; }
        if (n % 3 === 2) { this.besked("Knas, knas."); return; }
        if (n === 3) this.laererKoer("spis1", [
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.2 } },
            { gaa: 200 },
            { sig: "Der spises ikke i laboratoriet.", vis: 3.2, tid: 0.2 },
            { arm: -0.1, tid: 0.4, hver: function () { this.laerer.plakatRegel = 2; } },
            { tid: 2.4, hver: function (t) { this.laerer.arm = -0.1 + Math.sin(t * Math.PI * 8) * 0.12; } },
            { kald: function () { this.laerer.plakatRegel = 0; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.45 },
            { gaa: UDE }
        ]);
        else this.laererKoer("spis2", [
            { udtryk: { vrede: 1, humoer: -1, roed: 0.55 } },
            { gaa: 160 },
            { sig: n === 6 ? "Så er det nok. Posen tager jeg." : "Igen? Posen er min.", vis: 2.8, tid: 0.4 },
            { arm: -1.22, tid: 0.55 },
            { kald: function () {
                this.g.pose.skjult = true;
                this.laerer.baerer = "pose";
                this.poseTaget = true;
                if (NK.Lyd) NK.Lyd.knas(0.4);
                this.aendret("pose");
            } },
            { arm: -0.25, tid: 0.45 },
            { tid: 0.8 }
        ].concat(K.glimtTrin("frokost"), [
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { gaa: UDE },
            { kald: function () { this.laerer.baerer = null; } }
        ]));
    };

    /* ----- Morteren: eleven gaar amok ------------------------------------ */
    var MORTER_SVAR = [
        "Det er en morter. Ikke et trommesæt.",
        "Chipsene har ikke gjort dig noget.",
        "Skal jeg hente en forhammer til dig?",
        "Imponerende. Nu er der chips på hele bordet.",
        "Jeg går ud fra, at det er et nyt forskningsprojekt."
    ];

    P.laererMorter = function () {
        var L = this.laerer;
        if (!L || L.scene || L.spiseHaand) return false;
        this.antalAmok++;
        this.stopArbejde();
        this.holdt = null;
        var n = (this.antalAmok - 1) % MORTER_SVAR.length;
        var tekst = MORTER_SVAR[n];
        if (n === 3 && this.krummerUd === 0) tekst = "Imponerende. Morteren overlevede.";
        this.laererKoer("morter", [
            { udtryk: { vrede: 0.6, humoer: -0.2, roed: 0.1, skeptisk: 1, briller: 1 } },
            { gaa: 240 },
            { sig: tekst, vis: 3.2, tid: 0.3 },
            { arm: 1.62, tid: 0.45 },
            { tid: 2.4 }
        ].concat(K.glimtTrin("phd"), [
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { arm: HAENGER, tid: 0.4 },
            { gaa: UDE }
        ]));
        return true;
    };

    /* ----- Vandflasken: holdt i mere end 1 sekund ------------------------ */
    P.laererVand = function () {
        var L = this.laerer;
        if (!L || L.scene || L.spiseHaand) return false;
        this.laererKoer("vand", [
            { udtryk: { vrede: 0.5, humoer: -0.3, roed: 0, skeptisk: 1, briller: 1, laen: 1 } },
            { gaa: K.KANT },
            { sig: "Jeg håber ikke, at du har tænkt dig at hælde det i bægerglasset.", vis: 3.4, tid: 3.6 },
            { udtryk: { skeptisk: 0, briller: 0, laen: 0 } },
            { gaa: UDE }
        ], false);
        return true;
    };

    /* ... og saa blev vandet alligevel haeldt i baegerglasset */
    P.laererVandIBaeger = function () {
        var L = this.laerer;
        if (!L) return;
        /* Advarslen er i gang: svaret erstatter resten af scenen, saa
           advarslen ikke bliver sagt oven i det */
        if (L.scene && L.scene.navn === "vand") {
            this.laererSig("Det var lige præcis det, jeg mente.", 2.6);
            L.roedMaal = 0.5;
            L.vredeMaal = 1;
            if (NK.Lyd) NK.Lyd.brum();
            this.laererKoer("vandSvar", [
                { gaa: K.KANT },
                { tid: 2.6 },
                { udtryk: { skeptisk: 0, briller: 0, laen: 0, roed: 0 } },
                { gaa: UDE }
            ], false);
            return;
        }
        if (!this.vandAdvaret || L.scene || L.spiseHaand) return;
        this.laererKoer("vandBaeger", [
            { udtryk: { vrede: 0.9, humoer: -0.6, roed: 0.4, skeptisk: 0.6 } },
            { gaa: 200 },
            { sig: "Nå. Så blev det alligevel vand.", vis: 2.8, tid: 3.0 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, roed: 0 } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Salt i petriskaalen efter inddampning af vand ----------------- */
    var SALT_SVAR = [
        "Tillykke. Du har udvundet salt af chips med havsalt.",
        "Salt igen? Det har vi også i kantinen.",
        "Stadig intet fedt. Men sikke noget salt."
    ];

    P.laererSalt = function () {
        var L = this.laerer;
        if (!L) return false;
        if (L.scene || L.spiseHaand) { this.saltVenter = true; return false; }
        this.saltVenter = false;
        var tekst = SALT_SVAR[this.antalSalt % SALT_SVAR.length];
        this.antalSalt++;
        this.laererKoer("salt", [
            { udtryk: { vrede: 0.3, humoer: 0.3, roed: 0, skeptisk: 1, briller: 1 } },
            { gaa: 220 },
            { sig: tekst, vis: 3.4, tid: 3.6 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0, briller: 0 } },
            { gaa: UDE }
        ], false);
        return true;
    };

    /* ----- Heptanflasken paa gulvet: laereren rydder op ------------------ */
    var HEPTAN_SVAR = [
        ["Nu lugter hele lokalet af tankstation.", "Ny flaske. Den bliver stående på bordet."],
        ["Igen? Jeg begynder at tro, det er en hobby.", "Sidste flaske. Den står bedst på bordet."],
        ["Heptan er ikke en jonglørkugle.", "Flasken står på bordet. Den har det godt der."]
    ];

    P.laererHeptan = function () {
        var L = this.laerer, sp = this.heptanSpild;
        if (!L || !sp || L.scene || L.spiseHaand) return false;
        sp.fase = "laerer";
        var n = (this.antalHeptanTab - 1) % HEPTAN_SVAR.length;
        var x = NK.klamp(sp.x - 170, 140, 640);
        /* Anden gang sukker han, foer han siger noget */
        this.laererKoer("heptan", [
            { udtryk: { vrede: 1, humoer: -0.8, roed: 0.4, skeptisk: 0.5 } },
            { gaa: x }
        ].concat(this.antalHeptanTab > 1 ? [K.suk()] : [], [
            { sig: HEPTAN_SVAR[n][0], vis: 3.2, tid: 3.0 },
            { kald: function () { this.laerer.baerer = "kost"; } },
            { arm: 2.0, tid: 0.4 },
            { tid: 2.6, hver: function (t) {
                this.laerer.arm = 2.0 + Math.sin(t * Math.PI * 10) * 0.25;
                if (sp.pyt) sp.pyt.vaad = Math.min(sp.pyt.vaad, 1 - t);
                sp.skaar.forEach(function (s) { s.alfa = Math.min(s.alfa, 1.2 - 1.2 * t); });
                if (Math.random() < 0.12 && NK.Lyd) NK.Lyd.fej();
            } },
            { kald: function () {
                sp.pyt = null;
                sp.skaar = [];
                this.laerer.baerer = null;
                this.nyHeptan();
            } },
            { arm: HAENGER, tid: 0.3 },
            { sig: HEPTAN_SVAR[n][1], vis: 2.8, tid: 2.4 }
        ], K.uheld(), [
            { udtryk: { skeptisk: 0, roed: 0 } },
            { gaa: UDE },
            { kald: function () {
                this.heptanSpild = null;
                this.aendret("heptanRyddet");
            } }
        ]));
        return true;
    };

    /* ----- Endnu en knust petriskaal ------------------------------------ */
    P.laererSkaal = function (antal) {
        var L = this.laerer;
        if (!L || L.scene || L.spiseHaand) return false;
        var tekst = antal === 2 ? "To petriskåle. Jeg fører regnskab." : "Petriskål nummer " + antal + ". Regnskabet vokser.";
        this.laererKoer("skaal", [
            { udtryk: { vrede: 0.7, humoer: -0.3, roed: 0.2, skeptisk: 1, briller: 1 } },
            { gaa: 170 },
            { sig: tekst, vis: 3.0, tid: 3.2 }
        ].concat(K.uheld(), [
            { udtryk: { skeptisk: 0, roed: 0, briller: 0 } },
            { gaa: UDE }
        ]), false);
        return true;
    };

    /* ----- Ros ---------------------------------------------------------- */
    P.laererRos = function () {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 150 },
            { tid: 0.3 },
            { sig: "Fedt.", vis: 1.8, tid: 1.8, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Branden ------------------------------------------------------- */
    P.startBrand = function () {
        if (this.uheld) return;
        this.uheld = { type: "brand", t: 0, ild: 0, slukket: false, slukketT: 0, taeppe: null, faerdig: false };
        this.alarm = true;
        this.alarmUr = 0;
        this.ryk = 9;
        if (NK.Lyd) NK.Lyd.sus();
        this.besked("Heptandampene er antændt!", "advarsel");
        var L = this.laerer;
        L.scene = null;
        L.spiseHaand = null;
        var mig = this;
        var oejenbryn = K.glimtTrin("oejenbryn");
        var regnskab = K.uheld();
        this.laererKoer("brand", [
            { tid: 0.5 },
            { udtryk: { vrede: 1, humoer: -1, roed: 0.3 } },
            { gaa: 330, loeb: true },
            { sig: "Træd tilbage!", vis: 1.4, tid: 0.2 },
            { arm: -1.4, tid: 0.3 },
            { kald: function () {
                var h = mig.laererHaand();
                this.uheld.taeppe = { x: h.x, y: h.y, v: -0.6, fra: { x: h.x, y: h.y }, t: 0, landet: false };
            } },
            { arm: 1.1, tid: 0.55, hver: function (t) {
                var tp = this.uheld.taeppe;
                var e = NK.blod(t);
                tp.x = NK.lerp(tp.fra.x, S.TREFOD.x, e);
                tp.y = NK.lerp(tp.fra.y, 360, e) - Math.sin(Math.PI * e) * 90;
                tp.v = NK.lerp(-0.6, 0, e);
            } },
            { kald: function () {
                var u = this.uheld;
                u.taeppe.landet = true;
                u.slukket = true;
                this.braenderTaendt = false;
                this.ryk = 6;
                if (NK.Lyd) NK.Lyd.dunk();
                for (var i = 0; i < 22; i++) {
                    this.roeg.push({ x: S.TREFOD.x + r(-60, 60), y: r(330, 370), vx: r(-40, 40), vy: -r(10, 60), r: r(8, 16), liv: 1, alfa: 0.45, farve: "#3a3c40", henfald: 0.4 });
                }
                this.besked("Ilden er slukket.");
            } },
            { arm: HAENGER, tid: 0.4 },
            { tid: 1.1 },
            { udtryk: { vrede: 1, humoer: -1, roed: 0.9 } },
            { sig: "Heptan og åben ild? Heller ikke i et stinkskab.", vis: 3.2, tid: 3.3 }
        ].concat(oejenbryn, regnskab, [
            { sig: "Brænderen tager jeg.", vis: 2.1, tid: 0.4 },
            { arm: 1.38, tid: 0.55 },
            { kald: function () {
                this.braenderVaek = true;
                this.g.skaal.sted = "vaek";
                this.uheld.taeppe = null;
                this.laerer.baerer = "brandbundt";
                this.aendret("braender");
            } },
            { arm: 0.5, tid: 0.45 },
            { tid: 0.5 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { gaa: UDE },
            { kald: function () {
                this.laerer.baerer = null;
                this.uheld.faerdig = true;
                this.alarm = false;
                this.resultater.push({ nr: this.forsoegNr, midl: this.midl, procent: null, brand: true });
                this.aendret("uheld");
            } }
        ]));
    };

    /* ----- Tidens gang: haanden, der spiser, og branden ---------------- */
    P.opdaterLaererEkstra = function (dt) {
        var L = this.laerer;

        /* Haanden, der tager en chip */
        var sh = L.spiseHaand;
        if (sh) {
            var foer = sh.t;
            sh.t += dt / 1.0;
            if (foer < 0.45 && sh.t >= 0.45 && NK.Lyd) NK.Lyd.klik();
            if (sh.t >= 1) {
                L.spiseHaand = null;
                this.spist++;
                if (NK.Lyd) NK.Lyd.knas(1);
                this.efterSpist();
            }
        }

        /* Branden */
        var u = this.uheld;
        if (u && u.type === "brand") {
            u.t += dt;
            var sk = this.g.skaal;
            if (!u.slukket) {
                u.ild = NK.mod(u.ild, 1, 6, dt);
                sk.fyld = Math.max(0, sk.fyld - 0.2 * dt);
                sk.sod = Math.min(1, sk.sod + dt * 0.6);
                this.sod = Math.min(1, this.sod + dt * 0.28);
                if (Math.random() < dt * 14) {
                    this.roeg.push({ x: S.TREFOD.x + r(-18, 18), y: 300 - r(0, 30), vx: r(-12, 12), vy: -r(30, 60), r: r(6, 11), liv: 1, alfa: 0.4, farve: "#2a2b2e", henfald: 0.3 });
                }
            } else {
                u.ild = NK.mod(u.ild, 0, 9, dt);
                u.slukketT += dt;
                if (u.slukketT > 2.5) this.alarm = false;
            }
            if (this.alarm) {
                this.alarmUr -= dt;
                if (this.alarmUr <= 0) { this.alarmUr = 0.45; if (NK.Lyd) NK.Lyd.alarm(); }
            }
        }
    };

    /* ----- Tegning ------------------------------------------------------ */
    P.tegnUheld = function (ctx, tid) {
        var u = this.uheld;
        if (!u || u.type !== "brand") return;
        if (u.ild > 0.01) S.tegnIld(ctx, S.TREFOD.x, 386, u.ild, tid);
        var tp = u.taeppe;
        if (tp) NK.Sprites.tegnPositur(ctx, "brandtaeppe", { x: tp.x, y: tp.y, v: tp.v }, S.ANKER.brandtaeppe, 1, tp.landet ? 1 : 0.7);
    };

    /* Den spisende haand kommer nedefra, ogsaa naar laereren er ude */
    P.tegnLaererFoer = function (ctx, tid, L) {
        var sh = L.spiseHaand;
        if (!sh) return;
        var pose = S.HJEM.pose;
        var t = sh.t, hx, hy;
        if (t < 0.5) {
            var e = NK.blod(t / 0.5);
            hx = NK.lerp(120, pose.x + 6, e);
            hy = NK.lerp(680, pose.y + 6, e);
        } else {
            var e2 = NK.blod((t - 0.5) / 0.5);
            hx = NK.lerp(pose.x + 6, 180, e2);
            hy = NK.lerp(pose.y + 6, 700, e2);
        }
        if (t >= 0.45) NK.Sprites.tegnPositur(ctx, "chip", { x: hx - 18, y: hy - 30, v: 0.5 }, S.ANKER.chip);
        NK.Sprites.tegnPositur(ctx, "haand", { x: hx, y: hy, v: -0.45 }, S.ANKER.haand);
    };

    P.tegnBaaretEkstra = function (ctx, L, hd) {
        if (L.baerer === "pose") {
            NK.Sprites.tegnPositur(ctx, "pose", { x: hd.x - 10, y: hd.y - 6, v: 0.35 }, S.ANKER.pose, 1, 0.85);
        } else if (L.baerer === "kost") {
            /* Skaftets ende i haanden, boersterne ned mod gulvet */
            NK.Sprites.tegnPositur(ctx, "kost", { x: hd.x, y: hd.y, v: -0.8 + (L.arm - 2.0) * 0.8 }, { x: 120, y: 17 });
        } else if (L.baerer === "brandbundt") {
            NK.Sprites.tegnPositur(ctx, "trefod", { x: hd.x + 10, y: hd.y - 10, v: 0.3 }, S.ANKER.trefod, 1, 0.8);
            NK.Sprites.tegn(ctx, "braender", hd.x - 6, hd.y + 20, 42, 63);
            NK.Sprites.tegnPositur(ctx, "brandtaeppe", { x: hd.x + 14, y: hd.y - 30, v: 0.3 }, S.ANKER.brandtaeppe, 1, 0.55);
        }
    };
}());

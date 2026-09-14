/* =====================================================================
   laerer.js - den sure laerer, paaskeaeggene og branden

   Laereren kommer ind fra venstre, foran bordet. Hovedet er et sprite
   uden ansigt; oejne, bryn, mund og roedme tegnes her, saa udtrykket kan
   skifte. Armen er et eget sprite, der drejer om skulderen.

   Laereren optraeder i smaa scener (laererKoer): en liste af trin, der
   gaar et sted hen, siger noget, drejer armen, skifter udtryk, venter
   eller kalder en funktion.

   Paaskeaeg:
     spis      klik paa chipsposen, naar chipsene er afvejet. Hver tredje
               chip kommer laereren: foerst en advarsel med plakaten,
               derefter tager laereren posen (den kommer igen ved nyt forsoeg)
     kaffe     klik paa koppen paa hylden: laereren henter sin kaffe
     laerer    klik paa laereren: stadig kortere svar, til sidst roed i
               hovedet og damp af oererne
     brand     heptan over bunsenbraenderen: dampene antaendes. Laereren
               kaster et brandtaeppe over og konfiskerer braenderen
     ros       et godt resultat med heptan: laereren siger "Fedt."
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var UDE = -300;
    var HAENGER = 2.9;

    P.laererStart = function () {
        this.laerer = {
            x: UDE, maalX: UDE, y: 392, loeb: false, gang: 0,
            scene: null,
            tale: "", taleUr: 0, taleAlfa: 0, taleLaengde: 0,
            vrede: 0.5, humoer: -0.5, roed: 0, skeptisk: 0,
            vredeMaal: 0.5, humoerMaal: -0.5, roedMaal: 0, skeptiskMaal: 0,
            aaben: 0, blinkUr: 2, blink: 0, nik: 0, damp: 0,
            arm: HAENGER, armFra: HAENGER, armTil: HAENGER,
            baerer: null, klik: 0, plakatRegel: 0, rost: false,
            spiseHaand: null, dampe: []
        };
        this.spist = 0;
        this.antalAmok = 0;
        this.poseTaget = false;
    };

    /* Kaldes fra nulstil(): posen kommer igen, og en igangvaerende scene
       afbrydes. */
    P.laererNyt = function () {
        var L = this.laerer;
        if (!L) return;
        this.poseTaget = false;
        if (L.scene) {
            L.scene = null;
            L.maalX = UDE;
            L.tale = "";
            L.taleUr = 0;
            L.arm = HAENGER;
            L.plakatRegel = 0;
        }
        if (L.baerer === "pose") L.baerer = null;
        L.spiseHaand = null;
    };

    P.laererOptaget = function () {
        var L = this.laerer;
        return !!(L && ((L.scene && L.scene.blokerer) || L.spiseHaand));
    };

    P.laererVisning = function () {
        return { plakatRegel: this.laerer ? this.laerer.plakatRegel : 0 };
    };

    P.laererKoer = function (navn, trin, blokerer) {
        this.laerer.scene = { navn: navn, trin: trin, i: 0, t: 0, blokerer: blokerer !== false };
        this.aendret("laerer");
    };

    /* ----- Skulder og haand ------------------------------------------------ */
    P.laererKrop = function () {
        var L = this.laerer;
        var bob = L.x !== L.maalX ? Math.abs(Math.sin(L.gang)) * -5 : 0;
        return { x: L.x, y: L.y + bob, v: L.x !== L.maalX ? Math.sin(L.gang) * 0.03 : 0 };
    };

    P.laererSkulder = function () {
        return NK.tilVerden(this.laererKrop(), S.ANKER.laererKrop, 176, 58);
    };

    P.laererHaand = function () {
        var sk = this.laererSkulder();
        return NK.tilVerden({ x: sk.x, y: sk.y, v: this.laerer.arm }, S.ANKER.laererArm, 28, 36);
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
            { tid: 0.8 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { gaa: UDE },
            { kald: function () { this.laerer.baerer = null; } }
        ]);
    };

    /* ----- Kaffen ------------------------------------------------------------ */
    P.klikKop = function () {
        var L = this.laerer, kop = this.g.kaffekop;
        if (L.scene || kop.skjult) return false;
        this.laererKoer("kaffe", [
            { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1 } },
            { gaa: 170 },
            { sig: "Det er min kaffe.", vis: 2.2, tid: 0.3 },
            { arm: -0.5, tid: 0.55 },
            { kald: function () { kop.iHaand = true; this.laerer.baerer = "kaffekop"; } },
            { arm: -0.98, tid: 0.6 },
            { kald: function () { if (NK.Lyd) NK.Lyd.slurk(); } },
            { udtryk: { vrede: 0.1, humoer: 0.5, roed: 0 } },
            { tid: 1.0 },
            { sig: "Ahh.", vis: 1.3, tid: 1.1 },
            { kald: function () { kop.skjult = true; this.koppenVaek = true; } },
            { arm: -0.3, tid: 0.4 },
            { gaa: UDE },
            { kald: function () { this.laerer.baerer = null; } }
        ]);
        return true;
    };

    /* ----- Klik paa laereren ---------------------------------------------- */
    var SVAR = ["Ja?", "Hvad er der?", "Jeg har travlt.", "Lad være med det."];

    P.overLaerer = function (pt) {
        var L = this.laerer;
        if (!L || L.x < -100) return null;
        if (pt.x > L.x - 105 && pt.x < L.x + 112 && pt.y > L.y - 116 && pt.y < S.HOEJDE + 40) return "laerer";
        return null;
    };

    P.klikLaerer = function () {
        var L = this.laerer;
        if (!L || L.x < -100 || (L.scene && (L.scene.navn === "brand" || L.scene.navn === "gaaUd"))) return false;
        L.klik++;
        L.vredeMaal = 1;
        L.humoerMaal = -1;
        if (L.klik <= SVAR.length) {
            this.laererSig(SVAR[L.klik - 1], 1.6);
            L.roedMaal = Math.min(1, 0.22 * L.klik);
            return true;
        }
        L.roedMaal = 1;
        L.damp = 3;
        this.laererSig("Nu går jeg.", 1.6);
        if (NK.Lyd) NK.Lyd.brum();
        var blokerede = L.scene && L.scene.blokerer;
        this.laererKoer("gaaUd", [{ arm: HAENGER, tid: 0.3 }, { tid: 1.1 }, { gaa: UDE }], !!blokerede);
        return true;
    };

    P.laererSig = function (tekst, vis) {
        var L = this.laerer;
        L.tale = tekst;
        L.taleUr = vis || 2;
        L.taleLaengde = Math.min(1.6, 0.12 + tekst.length * 0.045);
        L.taleStart = this.tid;
        if (NK.Lyd) NK.Lyd.mumle(Math.max(1, Math.min(8, Math.round(tekst.length / 5))));
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
            { udtryk: { vrede: 0.6, humoer: -0.2, roed: 0.1, skeptisk: 1 } },
            { gaa: 240 },
            { sig: tekst, vis: 3.2, tid: 0.3 },
            { arm: 1.62, tid: 0.45 },
            { tid: 2.4 },
            { kald: function () { if (NK.Lyd) NK.Lyd.brum(); } },
            { udtryk: { skeptisk: 0 } },
            { arm: HAENGER, tid: 0.4 },
            { gaa: UDE }
        ]);
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
        this.uheld ={ type: "brand", t: 0, ild: 0, slukket: false, slukketT: 0, taeppe: null, faerdig: false };
        this.alarm = true;
        this.alarmUr = 0;
        this.ryk = 9;
        if (NK.Lyd) NK.Lyd.sus();
        this.besked("Heptandampene er antændt!", "advarsel");
        var L = this.laerer;
        L.scene = null;
        L.spiseHaand = null;
        var mig = this;
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
            { sig: "Heptan og åben ild? Heller ikke i et stinkskab.", vis: 3.2, tid: 3.3 },
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
        ]);
    };

    /* ----- Tidens gang ----------------------------------------------------- */
    P.opdaterLaerer = function (dt) {
        var L = this.laerer;
        if (!L) return;
        var i;

        /* Scenen */
        var sc = L.scene, vagt = 0, rest = dt;
        while (sc && L.scene === sc && vagt++ < 30) {
            var tr = sc.trin[sc.i];
            if (!tr) { L.scene = null; this.aendret("laerer"); break; }
            if (tr.kald) { tr.kald.call(this); sc.i++; sc.t = 0; continue; }
            if (tr.udtryk) {
                if (tr.udtryk.vrede !== undefined) L.vredeMaal = tr.udtryk.vrede;
                if (tr.udtryk.humoer !== undefined) L.humoerMaal = tr.udtryk.humoer;
                if (tr.udtryk.roed !== undefined) L.roedMaal = tr.udtryk.roed;
                if (tr.udtryk.skeptisk !== undefined) L.skeptiskMaal = tr.udtryk.skeptisk;
                sc.i++; sc.t = 0;
                continue;
            }
            if (!tr.startet) {
                tr.startet = true;
                if (tr.gaa !== undefined) { L.maalX = tr.gaa; L.loeb = !!tr.loeb; }
                if (tr.sig) this.laererSig(tr.sig, tr.vis);
                if (tr.arm !== undefined) { L.armFra = L.arm; L.armTil = tr.arm; }
            }
            sc.t += rest;
            rest = 0;
            var t = tr.tid ? Math.min(1, sc.t / tr.tid) : 1;
            if (tr.arm !== undefined) L.arm = NK.lerp(L.armFra, L.armTil, NK.blod(t));
            if (tr.hver) tr.hver.call(this, t);
            var klar = t >= 1;
            if (tr.gaa !== undefined) klar = Math.abs(L.x - L.maalX) < 1;
            if (!klar) break;
            sc.i++;
            sc.t = 0;
        }

        /* Gang */
        var fart = L.loeb ? 820 : 430;
        if (L.x !== L.maalX) {
            var d = L.maalX - L.x;
            var skridt = Math.sign(d) * Math.min(Math.abs(d), fart * dt);
            L.x += skridt;
            L.gang += dt * (L.loeb ? 16 : 10);
        }
        if (L.x <= UDE + 1 && !L.scene) { L.klik = 0; L.roedMaal = 0; L.damp = 0; }

        /* Udtryk, tale og blink */
        L.vrede = NK.mod(L.vrede, L.vredeMaal, 5, dt);
        L.humoer = NK.mod(L.humoer, L.humoerMaal, 5, dt);
        L.roed = NK.mod(L.roed, L.roedMaal, 3, dt);
        L.skeptisk = NK.mod(L.skeptisk, L.skeptiskMaal, 5, dt);
        L.taleUr -= dt;
        L.taleAlfa = NK.mod(L.taleAlfa, L.taleUr > 0 ? 1 : 0, 12, dt);
        var taler = L.taleUr > 0 && this.tid - (L.taleStart || 0) < L.taleLaengde;
        L.aaben = NK.mod(L.aaben, taler ? 0.5 + 0.5 * Math.sin(this.tid * 22) : 0, 20, dt);
        L.blinkUr -= dt;
        if (L.blinkUr <= 0) { L.blink = 0.14; L.blinkUr = r(2, 5); }
        L.blink = Math.max(0, L.blink - dt);
        if (L.damp > 0) {
            L.damp -= dt;
            if (Math.random() < dt * 12) {
                var hk = this.laererKrop();
                var side = Math.random() < 0.5 ? -1 : 1;
                L.dampe.push({ x: hk.x + side * 44, y: hk.y - 56, vx: side * r(20, 50), vy: -r(40, 80), r: r(4, 7), liv: 1 });
            }
        }
        for (i = L.dampe.length - 1; i >= 0; i--) {
            var dp = L.dampe[i];
            dp.x += dp.vx * dt;
            dp.y += dp.vy * dt;
            dp.r += dt * 10;
            dp.liv -= dt * 1.4;
            if (dp.liv <= 0) L.dampe.splice(i, 1);
        }

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

    P.tegnAnsigt = function (ctx, L) {
        var i;
        /* Roedme */
        if (L.roed > 0.02) {
            var g = ctx.createRadialGradient(55, 70, 10, 55, 66, 48);
            g.addColorStop(0, "rgba(225, 50, 40, " + (0.5 * L.roed).toFixed(3) + ")");
            g.addColorStop(1, "rgba(225, 50, 40, 0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(55, 66, 40, 50, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        /* Oejne */
        for (i = 0; i < 2; i++) {
            var ox = i === 0 ? 37 : 73;
            if (L.blink > 0) {
                ctx.strokeStyle = "#2a2f36";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(ox - 4, 61);
                ctx.lineTo(ox + 4, 61);
                ctx.stroke();
            } else {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(ox, 61, 5.2, 4.2 - L.vrede * 1.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#2a2f36";
                ctx.beginPath();
                ctx.arc(ox + 1.5, 61.5, 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        /* Briller */
        ctx.strokeStyle = "#23272e";
        ctx.lineWidth = 2.4;
        ctx.fillStyle = "rgba(200, 230, 255, 0.12)";
        [37, 73].forEach(function (bx) {
            ctx.beginPath();
            ctx.arc(bx, 60, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(49, 59); ctx.quadraticCurveTo(55, 55, 61, 59);
        ctx.moveTo(25, 58); ctx.lineTo(15, 55);
        ctx.moveTo(85, 58); ctx.lineTo(95, 55);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(34, 56, 6, Math.PI * 1.1, Math.PI * 1.45);
        ctx.arc(70, 56, 6, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();
        /* Bryn: vrede saenker de inderste ender */
        /* Skeptisk: det hoejre bryn loeftes, og munden bliver skaev */
        var v = L.vrede, hm = Math.max(0, L.humoer), sk = L.skeptisk || 0;
        ctx.strokeStyle = "#6d737a";
        ctx.lineWidth = 4.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(24, 42 + v * 1 - hm * 2 + sk * 2);
        ctx.lineTo(47, 42 + v * 8 - hm * 3 + sk * 2);
        ctx.moveTo(86, 42 + v * 1 - hm * 2 - sk * 11);
        ctx.lineTo(63, 42 + v * 8 - hm * 3 - sk * 7);
        ctx.stroke();
        /* Mund under overskaegget */
        var h = L.humoer;
        ctx.strokeStyle = "#7a3b2e";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(45, 98 - h * 2 + sk * 1.5);
        ctx.quadraticCurveTo(55, 98 + h * 7, 65, 98 - h * 2 - sk * 5);
        ctx.stroke();
        if (L.aaben > 0.05) {
            ctx.fillStyle = "#4a1f18";
            ctx.beginPath();
            ctx.ellipse(55, 99 + h * 2, 5.5, 1 + 4.5 * L.aaben, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    };

    P.tegnBaaret = function (ctx, L) {
        if (!L.baerer) return;
        var hd = this.laererHaand();
        if (L.baerer === "pose") {
            NK.Sprites.tegnPositur(ctx, "pose", { x: hd.x - 10, y: hd.y - 6, v: 0.35 }, S.ANKER.pose, 1, 0.85);
        } else if (L.baerer === "kaffekop") {
            NK.Sprites.tegnPositur(ctx, "kaffekop", { x: hd.x + 8, y: hd.y + 26, v: 0 }, S.ANKER.kaffekop);
        } else if (L.baerer === "brandbundt") {
            NK.Sprites.tegnPositur(ctx, "trefod", { x: hd.x + 10, y: hd.y - 10, v: 0.3 }, S.ANKER.trefod, 1, 0.8);
            NK.Sprites.tegn(ctx, "braender", hd.x - 6, hd.y + 20, 42, 63);
            NK.Sprites.tegnPositur(ctx, "brandtaeppe", { x: hd.x + 14, y: hd.y - 30, v: 0.3 }, S.ANKER.brandtaeppe, 1, 0.55);
        }
    };

    P.tegnLaerer = function (ctx, tid) {
        var L = this.laerer;
        if (!L) return;
        var i;

        /* Den spisende haand */
        var sh = L.spiseHaand;
        if (sh) {
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
        }

        if (L.x < UDE + 40 && !L.scene) return;
        var krop = this.laererKrop();
        var sk = this.laererSkulder();
        var armBag = Math.abs(L.arm) > 2;
        var armPositur = { x: sk.x, y: sk.y, v: L.arm };

        if (armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);

        /* Kitlen fortsaetter ned under spritet, saa den ikke slutter
           midt paa en bred skaerm */
        var kv = NK.tilVerden(krop, S.ANKER.laererKrop, 15, 246);
        var kh = NK.tilVerden(krop, S.ANKER.laererKrop, 205, 246);
        var kg = ctx.createLinearGradient(kv.x, 0, kh.x, 0);
        kg.addColorStop(0, "#c9d2da");
        kg.addColorStop(0.3, "#f7f9fb");
        kg.addColorStop(0.7, "#eef2f5");
        kg.addColorStop(1, "#bcc6cf");
        ctx.fillStyle = kg;
        ctx.fillRect(kv.x, kv.y, kh.x - kv.x, 1500);
        ctx.fillStyle = "#9aa6b1";
        ctx.fillRect(krop.x - 1, kv.y, 2, 1500);
        NK.Sprites.tegnPositur(ctx, "laererKrop", krop, S.ANKER.laererKrop);

        var ryst = L.taleUr > 0 ? Math.sin(tid * 9) * 0.05 * L.vrede * (L.humoer < 0 ? 1 : 0) : 0;
        var hoved = { x: krop.x, y: krop.y + 14 + L.nik, v: krop.v + ryst };
        NK.Sprites.tegnPositur(ctx, "laererHoved", hoved, S.ANKER.laererHoved);
        ctx.save();
        ctx.translate(hoved.x, hoved.y);
        ctx.rotate(hoved.v);
        ctx.translate(-S.ANKER.laererHoved.x, -S.ANKER.laererHoved.y);
        this.tegnAnsigt(ctx, L);
        ctx.restore();

        if (!armBag) NK.Sprites.tegnPositur(ctx, "laererArm", armPositur, S.ANKER.laererArm);
        this.tegnBaaret(ctx, L);

        ctx.save();
        for (i = 0; i < L.dampe.length; i++) {
            var d = L.dampe[i];
            ctx.globalAlpha = NK.klamp(d.liv, 0, 1) * 0.7;
            ctx.fillStyle = "#f4f6f8";
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        var top = krop.y - 118;
        S.tegnTaleboble(ctx, krop.x + 150, top - 44, L.tale, L.taleAlfa, krop.x + 52, top + 50);
    };
}());

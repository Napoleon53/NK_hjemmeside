/* =====================================================================
   laerer.js - laereren og paaskeaeggene

   Laereren kommer ind fra venstre, foran bordet. Hovedet er et sprite
   uden ansigt; oejne, bryn, mund og roedme tegnes her, saa udtrykket kan
   skifte. Armen er et eget sprite, der drejer om skulderen.

   Laereren optraeder i smaa scener (laererKoer): en liste af trin, der
   gaar et sted hen, siger noget, drejer armen, skifter udtryk, venter
   eller kalder en funktion.

   Paaskeaeg:
     kaffe     klik paa koppen paa hylden: laereren henter sin kaffe
     laerer    klik paa laereren: stadig kortere svar, til sidst roed i
               hovedet og damp af oererne
     uheld     proppen springer af under voldsom rystning: laereren
               kommer med koekkenrulle og toerrer pytten op
     ros       begge tests er lavet i begge glas: laereren roser
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var r = NK.r;
    var P = NK.Forsoeg.prototype;

    var UDE = -300;
    var HAENGER = 2.9;

    P.laererStart = function () {
        this.laerer = {
            x: UDE, maalX: UDE, y: 392, loeb: false, gang: 0,
            scene: null,
            tale: "", taleUr: 0, taleAlfa: 0, taleLaengde: 0,
            vrede: 0.5, humoer: -0.5, roed: 0,
            vredeMaal: 0.5, humoerMaal: -0.5, roedMaal: 0,
            aaben: 0, blinkUr: 2, blink: 0, nik: 0, damp: 0,
            arm: HAENGER, armFra: HAENGER, armTil: HAENGER,
            baerer: null, klik: 0, rost: false, dampe: []
        };
    };

    /* Kaldes fra nulstil(): en igangvaerende scene afbrydes. */
    P.laererNyt = function () {
        var L = this.laerer;
        if (!L) return;
        if (L.scene) {
            L.scene = null;
            L.maalX = UDE;
            L.tale = "";
            L.taleUr = 0;
            L.arm = HAENGER;
        }
        L.baerer = null;
        L.rost = false;
    };

    P.laererOptaget = function () {
        var L = this.laerer;
        return !!(L && L.scene && L.scene.blokerer);
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

    /* ----- Kaffen ------------------------------------------------------------ */
    P.klikKop = function () {
        var L = this.laerer, kop = this.g.kaffekop;
        if (L.scene || kop.skjult) return false;
        this.laererKoer("kaffe", [
            { udtryk: { vrede: 0.8, humoer: -0.6, roed: 0.1 } },
            { gaa: 130 },
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
        if (!L || L.x < -100 || (L.scene && (L.scene.navn === "uheld" || L.scene.navn === "gaaUd"))) return false;
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

    /* ----- Ros ---------------------------------------------------------- */
    P.laererRos = function () {
        var L = this.laerer;
        if (L.rost || L.scene) return;
        L.rost = true;
        this.laererKoer("ros", [
            { udtryk: { vrede: 0, humoer: 0.9, roed: 0 } },
            { gaa: 150 },
            { tid: 0.3 },
            { sig: "Flot. Et rigtigt kontrolforsøg.", vis: 2.4, tid: 2.4, hver: function (t) { this.laerer.nik = Math.sin(t * Math.PI * 3) * 5; } },
            { kald: function () { this.laerer.nik = 0; } },
            { gaa: UDE }
        ], false);
    };

    /* ----- Uheldet: proppen sprang af ------------------------------------ */
    P.laererUheld = function (gl) {
        var L = this.laerer;
        var mig = this;
        L.scene = null;
        this.laererKoer("uheld", [
            { tid: 0.6 },
            { udtryk: { vrede: 0.9, humoer: -0.8, roed: 0.3 } },
            { gaa: function () { return (mig.pyt ? mig.pyt.x : 400) - 130; } },
            { sig: "Ryst med omtanke.", vis: 2.4, tid: 0.3 },
            { arm: -1.25, tid: 0.5 },
            { kald: function () { this.laerer.baerer = "papir"; if (NK.Lyd) NK.Lyd.papir(); } },
            { tid: 1.8, hver: function (t) {
                this.laerer.arm = -1.25 + Math.sin(t * Math.PI * 7) * 0.22;
                if (this.pyt) this.pyt.vaad = 1 - t;
                if (t >= 0.99) this.pyt = null;
            } },
            { kald: function () { this.laerer.baerer = null; if (NK.Lyd) NK.Lyd.brum(); } },
            { arm: HAENGER, tid: 0.4 },
            { sig: "Fyld glas " + gl.nr + " igen.", vis: 2.2, tid: 1.2 },
            { gaa: UDE }
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
                sc.i++; sc.t = 0;
                continue;
            }
            if (!tr.startet) {
                tr.startet = true;
                if (tr.gaa !== undefined) { L.maalX = typeof tr.gaa === "function" ? tr.gaa.call(this) : tr.gaa; L.loeb = !!tr.loeb; }
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
    };

    /* ----- Tegning ------------------------------------------------------ */
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
        var v = L.vrede, hm = Math.max(0, L.humoer);
        ctx.strokeStyle = "#6d737a";
        ctx.lineWidth = 4.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(24, 42 + v * 1 - hm * 2);
        ctx.lineTo(47, 42 + v * 8 - hm * 3);
        ctx.moveTo(86, 42 + v * 1 - hm * 2);
        ctx.lineTo(63, 42 + v * 8 - hm * 3);
        ctx.stroke();
        /* Mund under overskaegget */
        var h = L.humoer;
        ctx.strokeStyle = "#7a3b2e";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(45, 98 - h * 2);
        ctx.quadraticCurveTo(55, 98 + h * 7, 65, 98 - h * 2);
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
        if (L.baerer === "kaffekop") {
            NK.Sprites.tegnPositur(ctx, "kaffekop", { x: hd.x + 8, y: hd.y + 26, v: 0 }, S.ANKER.kaffekop);
        } else if (L.baerer === "papir") {
            NK.Sprites.tegnPositur(ctx, "papir", { x: hd.x + 6, y: hd.y + 8, v: 0.2 }, S.ANKER.papir);
        }
    };

    P.tegnLaerer = function (ctx, tid) {
        var L = this.laerer;
        if (!L) return;
        var i;
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

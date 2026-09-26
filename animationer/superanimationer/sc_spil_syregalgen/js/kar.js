/* =====================================================================
   kar.js - scenen: laboratoriet med syrekarret, planken og
   klassekammeraten

   Tegnes paa et laerred i enheder: 1000 x 600, skaleret, saa hele
   bredden kan ses, og forankret i bunden. Oven over er der kun vaeg,
   saa ordet (HTML oven paa laerredet) kan staa der.

   Hvert forkert bogstav sender klassekammeraten et skridt ud paa
   planken, og karret bliver surere: pH falder fra 7 til 1, og farven
   foelger universalindikatoren fra groen til roed. Ved det sjette
   falder klassekammeraten i, og kun sikkerhedsbrillerne, der sad paa
   panden i stedet for paa oejnene, kommer op igen.

   Brug:
     var kar = new NK.Kar(laerred);
     kar.nyElev()            en ny klassekammerat gaar ind fra venstre
     kar.saetForkerte(n)     0 til 5: hvor langt ude paa planken
     kar.vind()              tilbage paa gulvet og hop; karret neutraliseres
     kar.tab()               ud paa spidsen, vakle, falde
     kar.nyRunde()           karret til pH 7, brillerne vaek
     kar.vedPlask = fn       kaldes, naar klassekammeraten rammer syren
     kar.opdater(dt); kar.tegn();
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var BREDDE = 1000, HOEJDE = 600;
    var GULV = 440;
    var KAR = { x0: 540, x1: 900, ind0: 554, ind1: 886, bund: 590 };
    var OVERFLADE = 476;
    var PLANKE = { x0: 372, x1: 776, tyk: 11 };
    var POS = [250, 420, 505, 590, 668, 736];
    var SPIDS = 764;
    var GANG = 230;

    /* Klassekammeraterne. Hver ny, efter et plask, faar det naeste udseende. */
    var UDSEENDE = [
        { hud: "#f1c7a3", haar: "#6b4226", stil: "kort",      bluse: "#2a9d8f" },
        { hud: "#dfa97e", haar: "#211a16", stil: "hestehale", bluse: "#7b5ea7" },
        { hud: "#8d5a3b", haar: "#1d1512", stil: "kroeller",  bluse: "#e07a2f" },
        { hud: "#f6d5bb", haar: "#e2bd62", stil: "pandehaar", bluse: "#c8453b" },
        { hud: "#c68b62", haar: "#3b2618", stil: "knold",     bluse: "#e9b949" },
        { hud: "#f0c4a0", haar: "#b5532b", stil: "rodet",     bluse: "#3a6fb0" },
        { hud: "#a8704b", haar: "#2a1d15", stil: "langt",     bluse: "#4f9d5d" }
    ];

    /* Universalindikatoren fra pH 1 til 7 */
    var INDIKATOR = [
        [200, 38, 58],   /* 1 */
        [224, 74, 42],   /* 2 */
        [235, 122, 42],  /* 3 */
        [240, 168, 48],  /* 4 */
        [226, 209, 58],  /* 5 */
        [154, 205, 50],  /* 6 */
        [63, 191, 90]    /* 7 */
    ];

    function indikator(ph) {
        var p = NK.klamp(ph, 1, 7) - 1;
        var i = Math.min(5, Math.floor(p)), t = p - i;
        var a = INDIKATOR[i], b = INDIKATOR[i + 1];
        return [NK.lerp(a[0], b[0], t), NK.lerp(a[1], b[1], t), NK.lerp(a[2], b[2], t)];
    }

    function rgba(c, a, lys) {
        var f = lys || 0;
        var r = f >= 0 ? c[0] + (255 - c[0]) * f : c[0] * (1 + f);
        var g = f >= 0 ? c[1] + (255 - c[1]) * f : c[1] * (1 + f);
        var bl = f >= 0 ? c[2] + (255 - c[2]) * f : c[2] * (1 + f);
        return "rgba(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(bl) + "," + (a === undefined ? 1 : a) + ")";
    }

    function phTekst(ph) {
        return (Math.round(ph * 10) / 10).toFixed(1).replace(".", ",");
    }

    function Kar(laerred) {
        this.L = laerred;
        this.tid = 0;
        this.k = 1; this.ox = 0; this.oy = 0;
        this.forkerte = 0;
        this.ph = 7;
        this.phMaal = 7;
        this.boejning = 0;
        this.boejGrund = 0;
        this.sving = 0;
        this.partikler = [];
        this.boble = 0;
        this.damp = 0;
        this.briller = null;
        this.bolger = [];
        this.elev = null;
        this.naesteUdseende = Math.floor(Math.random() * UDSEENDE.length);
        this.vedPlask = null;
    }

    var P = Kar.prototype;

    /* ----- Styring ----------------------------------------------------- */
    P.nyElev = function () {
        var u = UDSEENDE[this.naesteUdseende % UDSEENDE.length];
        this.naesteUdseende++;
        this.elev = {
            u: u, x: -70, maalX: POS[0], y: GULV,
            tilstand: "ind", t: 0, gang: 0, frygt: 0, rot: 0,
            vx: 0, vy: 0, vr: 0, hop: 0, blink: 2 + Math.random() * 2, lukket: 0,
            fart: GANG
        };
    };

    P.nyRunde = function () {
        this.forkerte = 0;
        this.phMaal = 7;
        this.briller = null;
        this.partikler = this.partikler.filter(function (p) { return p.type === "boble"; });
        if (!this.elev || this.elev.tilstand === "vaek") this.nyElev();
        else {
            this.elev.maalX = POS[0];
            if (this.elev.tilstand !== "ind") this.elev.tilstand = "staar";
        }
    };

    P.saetForkerte = function (n) {
        this.forkerte = NK.klamp(n, 0, POS.length - 1);
        this.phMaal = 7 - this.forkerte;
        var e = this.elev;
        if (e && (e.tilstand === "staar" || e.tilstand === "ind")) e.maalX = POS[this.forkerte];
    };

    P.tab = function () {
        this.forkerte = POS.length;
        this.phMaal = 1;
        var e = this.elev;
        if (!e || e.tilstand === "vaek" || e.tilstand === "falder") return;
        e.maalX = SPIDS;
        e.fart = 360;
        e.tilstand = "tilSpids";
    };

    P.vind = function () {
        this.forkerte = 0;
        this.phMaal = 7;
        var e = this.elev;
        if (!e) return;
        e.maalX = POS[0];
        e.fart = 300;
        e.tilstand = "hjem";
        this.konfetti(e.x, e.y - 150);
    };

    /* ----- Maal ---------------------------------------------------------- */
    /* I et smalt, hoejt vindue (mobil) skaeres vaeggen til venstre fra,
       saa karret og klassekammeraten bliver stoerre. */
    P.tilpas = function () {
        var b = this.L.b, h = this.L.h;
        var x0 = b / h < 1.3 ? 170 : 0, bredde = BREDDE - x0;
        this.k = Math.min(b / bredde, h / HOEJDE);
        this.ox = (b - bredde * this.k) / 2 - x0 * this.k;
        this.oy = h - HOEJDE * this.k;
    };

    /* Et punkt i enheder omregnet til laerredets pixels */
    P.tilPx = function (x, y) {
        return { x: this.ox + x * this.k, y: this.oy + y * this.k };
    };

    P.plankeBoej = function (x) {
        if (x <= KAR.x0) return 0;
        var u = (x - KAR.x0) / (PLANKE.x1 - KAR.x0);
        return this.boejning * u * u;
    };

    /* Hvor foedderne staar ved x */
    P.fodY = function (x) {
        var paa = GULV - PLANKE.tyk + this.plankeBoej(x);
        if (x >= PLANKE.x0 + 10) return paa;
        if (x <= PLANKE.x0 - 10) return GULV;
        return NK.lerp(GULV, paa, (x - PLANKE.x0 + 10) / 20);
    };

    /* ----- Opdatering ---------------------------------------------------- */
    P.opdater = function (dt) {
        dt = Math.min(dt, 0.05);
        this.tid += dt;
        this.ph = NK.mod(this.ph, this.phMaal, 2.6, dt);
        this.opdaterElev(dt);

        /* Planken boejer under vaegten og svinger efter et plask */
        var e = this.elev, last = 0;
        if (e && (e.tilstand !== "falder" && e.tilstand !== "vaek") && e.x > KAR.x0) {
            last = NK.klamp((e.x - KAR.x0) / (PLANKE.x1 - KAR.x0), 0, 1);
        }
        this.sving *= Math.exp(-2.6 * dt);
        var ryst = e && e.frygt > 0.6 && last > 0 ? Math.sin(this.tid * 31) * 0.7 * e.frygt : 0;
        this.boejGrund = NK.mod(this.boejGrund, 17 * last, 8, dt);
        this.boejning = this.boejGrund + this.sving * Math.cos(this.tid * 17) + ryst;

        this.opdaterSyre(dt);
        this.opdaterPartikler(dt);
    };

    P.opdaterElev = function (dt) {
        var e = this.elev;
        if (!e || e.tilstand === "vaek") return;
        e.t += dt;

        /* Blink */
        e.blink -= dt;
        if (e.blink <= 0) { e.lukket = 0.13; e.blink = 2.5 + Math.random() * 3; }
        e.lukket = Math.max(0, e.lukket - dt);

        if (e.tilstand === "falder") { this.opdaterFald(e, dt); return; }

        /* Gang mod maalet */
        var d = e.maalX - e.x;
        if (Math.abs(d) > 0.5) {
            var skridt = Math.sign(d) * Math.min(Math.abs(d), e.fart * dt);
            e.x += skridt;
            e.gang += Math.abs(skridt) * 0.075;
        } else {
            e.x = e.maalX;
            e.gang = NK.mod(e.gang, Math.round(e.gang / Math.PI) * Math.PI, 12, dt);
            if (e.tilstand === "ind") e.tilstand = "staar";
            if (e.tilstand === "tilSpids") { e.tilstand = "vakler"; e.t = 0; }
            if (e.tilstand === "hjem") { e.tilstand = "jubler"; e.t = 0; e.fart = GANG; }
        }
        e.y = this.fodY(e.x);

        /* Frygten foelger, hvor langt ude klassekammeraten staar */
        var frygtMaal = NK.klamp(this.forkerte / (POS.length - 1), 0, 1);
        if (e.tilstand === "vakler" || e.tilstand === "tilSpids") frygtMaal = 1;
        if (e.tilstand === "hjem" || e.tilstand === "jubler") frygtMaal = 0;
        e.frygt = NK.mod(e.frygt, frygtMaal, 4, dt);

        e.hop = 0;
        e.rot = 0;
        if (e.tilstand === "jubler") {
            var th = e.t / 0.55;
            e.hop = th < 2 ? Math.abs(Math.sin(th * Math.PI)) * 26 : 0;
            if (e.t > 1.4) e.tilstand = "staar";
        }
        if (e.tilstand === "vakler") {
            e.rot = Math.sin(e.t * 10) * (0.1 + e.t * 0.22);
            if (e.t > 0.95) {
                e.tilstand = "falder";
                e.t = 0;
                e.vx = 90;
                e.vy = -170;
                e.vr = 0.9;
                e.rot = NK.klamp(e.rot, -0.1, 0.25);
                this.sving = 9;
            }
        }
    };

    /* Foedderne foerst ned i karret. Drejningen er lille, saa hele
       figuren holder sig inden for gruben og forsvinder under syren. */
    P.opdaterFald = function (e, dt) {
        var iSyren = e.y > OVERFLADE;
        if (iSyren) {
            e.vy = NK.mod(e.vy, 290, 5, dt);
            e.vx *= Math.exp(-5 * dt);
        } else {
            e.vy += 1500 * dt;
            e.vx *= Math.exp(-1.2 * dt);
        }
        e.x = Math.min(e.x + e.vx * dt, 782);
        e.y += e.vy * dt;
        e.rot = Math.min(0.25, e.rot + e.vr * dt);
        if (!e.plask && iSyren) {
            e.plask = true;
            this.plask(e.x + 18);
        }
        if (e.y - 250 > OVERFLADE + 6) e.tilstand = "vaek";
    };

    P.plask = function (x) {
        var i, c = indikator(this.ph);
        for (i = 0; i < 30; i++) {
            this.partikler.push({
                type: "draabe", x: x + NK.r(-30, 30), y: OVERFLADE - 2,
                vx: NK.r(-230, 230), vy: NK.r(-420, -170), r: NK.r(2.5, 6), liv: 2, farve: c
            });
        }
        for (i = 0; i < 14; i++) {
            this.partikler.push({
                type: "damp", x: x + NK.r(-60, 60), y: OVERFLADE - NK.r(0, 20),
                vx: NK.r(-15, 15), vy: NK.r(-45, -20), r: NK.r(14, 26), liv: NK.r(1.6, 2.6), start: 2.6
            });
        }
        this.bolger.push({ x: x, t: 0 });
        this.briller = { x: x + 14, t: -0.9, vx: 12 };
        if (this.vedPlask) this.vedPlask();
    };

    P.opdaterSyre = function (dt) {
        var surhed = 7 - this.ph;
        this.boble += dt * (1.2 + surhed * 2.4);
        while (this.boble >= 1) {
            this.boble -= 1;
            this.partikler.push({
                type: "boble", x: NK.r(KAR.ind0 + 10, KAR.ind1 - 10), y: KAR.bund - NK.r(2, 20),
                vx: 0, vy: NK.r(-80, -35), r: NK.r(1.8, 4.6), liv: 10, fase: NK.r(0, 6)
            });
        }
        if (surhed > 3.5) {
            this.damp += dt * (surhed - 3.5) * 1.4;
            while (this.damp >= 1) {
                this.damp -= 1;
                this.partikler.push({
                    type: "damp", x: NK.r(KAR.ind0 + 20, KAR.ind1 - 20), y: OVERFLADE - 4,
                    vx: NK.r(-8, 8), vy: NK.r(-30, -14), r: NK.r(10, 18), liv: 2.4, start: 2.4
                });
            }
        }
        this.bolger = this.bolger.filter(function (b) { b.t += dt; return b.t < 2.2; });
        if (this.briller) {
            var br = this.briller;
            br.t += dt;
            br.x = Math.min(KAR.ind1 - 34, br.x + br.vx * dt);
            br.vx *= Math.exp(-0.4 * dt);
        }
    };

    P.opdaterPartikler = function (dt) {
        var ud = [];
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            p.liv -= dt;
            if (p.type === "boble") {
                p.fase += dt * 5;
                p.x += Math.sin(p.fase) * 12 * dt;
                p.y += p.vy * dt;
                if (p.y <= this.overflade(p.x) + p.r) continue;
            } else if (p.type === "draabe") {
                p.vy += 900 * dt;
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                /* Tilbage i syren eller ned paa gulvet */
                var inde = p.x > KAR.ind0 && p.x < KAR.ind1;
                if (p.vy > 0 && ((inde && p.y > OVERFLADE) || (!inde && p.y > GULV))) continue;
            } else if (p.type === "damp") {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.r += 7 * dt;
            } else if (p.type === "konfetti") {
                p.vy += 520 * dt;
                p.vx *= Math.exp(-1.2 * dt);
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.v += p.vr * dt;
                if (p.y > GULV + 4) continue;
            }
            if (p.liv > 0) ud.push(p);
        }
        this.partikler = ud;
    };

    P.konfetti = function (x, y) {
        var farver = ["#f2c53d", "#3d9ee0", "#3fae72", "#e05446", "#9b6bd6", "#ffffff"];
        for (var i = 0; i < 90; i++) {
            var v = NK.r(-Math.PI * 0.95, -Math.PI * 0.05), f = NK.r(180, 520);
            this.partikler.push({
                type: "konfetti", x: x + NK.r(-20, 20), y: y,
                vx: Math.cos(v) * f, vy: Math.sin(v) * f, v: NK.r(0, 6), vr: NK.r(-9, 9),
                b: NK.r(5, 9), h: NK.r(3, 5), liv: 3, farve: NK.tilfaeldig(farver)
            });
        }
    };

    P.overflade = function (x) {
        var t = this.tid, y = OVERFLADE + Math.sin(x * 0.045 + t * 2.1) * 1.5 + Math.sin(x * 0.021 - t * 1.3) * 1.1;
        for (var i = 0; i < this.bolger.length; i++) {
            var b = this.bolger[i], d = Math.abs(x - b.x) - b.t * 170;
            if (d > -40 && d < 40) y += Math.cos(d / 40 * Math.PI * 0.5) * 7 * Math.exp(-b.t * 1.6) * Math.sin(b.t * 14);
        }
        return y;
    };

    /* ----- Tegning ------------------------------------------------------- */
    P.tegn = function () {
        var ctx = this.L.ctx;
        this.tilpas();
        var k = this.k;
        var venstre = -this.ox / k, hoejre = (this.L.b - this.ox) / k, top = -this.oy / k;
        ctx.save();
        ctx.translate(this.ox, this.oy);
        ctx.scale(k, k);
        this.tegnVaeg(ctx, venstre, hoejre, top);
        this.tegnBruser(ctx, top);
        this.tegnPlakat(ctx);
        this.tegnGulv(ctx, venstre, hoejre);
        this.tegnPlanke(ctx);
        this.tegnElev(ctx);
        this.tegnSyre(ctx);
        this.tegnBriller(ctx);
        this.tegnKant(ctx);
        this.tegnPhMaaler(ctx);
        this.tegnSkilt(ctx);
        this.tegnPartikler(ctx);
        ctx.restore();
    };

    P.tegnVaeg = function (ctx, v, h, top) {
        var g = ctx.createLinearGradient(0, top, 0, GULV);
        g.addColorStop(0, "#1c2027");
        g.addColorStop(1, "#2b313b");
        ctx.fillStyle = g;
        ctx.fillRect(v, top, h - v, GULV - top + 1);
        /* Fliser */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        var x, y;
        for (x = Math.floor(v / 60) * 60; x < h; x += 60) { ctx.moveTo(x, top); ctx.lineTo(x, GULV); }
        for (y = GULV - 60; y > top; y -= 60) { ctx.moveTo(v, y); ctx.lineTo(h, y); }
        ctx.stroke();
        /* Fodliste */
        ctx.fillStyle = "#20252d";
        ctx.fillRect(v, GULV - 14, h - v, 14);
    };

    /* Noedbruseren paa vaeggen til venstre */
    P.tegnBruser = function (ctx, top) {
        ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = "#7d8794";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(84, top);
        ctx.lineTo(84, 104);
        ctx.quadraticCurveTo(84, 118, 98, 118);
        ctx.lineTo(128, 118);
        ctx.stroke();
        /* Hovedet */
        ctx.fillStyle = "#a9b3be";
        ctx.beginPath();
        ctx.moveTo(116, 116);
        ctx.lineTo(140, 116);
        ctx.lineTo(154, 140);
        ctx.lineTo(102, 140);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#6f7985";
        ctx.fillRect(102, 138, 52, 4);
        /* Snoren med haandtaget */
        ctx.strokeStyle = "#9aa3ad";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(110, 120);
        ctx.lineTo(110, 196);
        ctx.stroke();
        ctx.strokeStyle = "#2f9e5e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 212);
        ctx.lineTo(120, 212);
        ctx.lineTo(110, 196);
        ctx.closePath();
        ctx.stroke();
        /* Groent skilt */
        ctx.fillStyle = "#2f9e5e";
        NK.rundtRekt(ctx, 150, 170, 44, 44, 5);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(172, 186, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(169, 191, 6, 14);
        for (var i = 0; i < 4; i++) ctx.fillRect(160 + i * 7, 176, 2, 5);
        ctx.restore();
    };

    /* Faremaerket for aetsende, oeverst paa pH-meterets stang: to
       reagensglas drypper paa en overflade og en haand, der begge
       aedes. */
    P.tegnSkilt = function (ctx) {
        var cx = 954, cy = 196, r = 40;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#d8262e";
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#111111";
        ctx.strokeStyle = "#111111";
        ctx.lineCap = "round";
        /* Reagensglassene haelder indad og nedad */
        [-1, 1].forEach(function (s) {
            ctx.save();
            ctx.translate(s * 11, -13);
            ctx.rotate(Math.PI + s * 0.75);
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-3.2, -8);
            ctx.lineTo(-3.2, 5);
            ctx.arc(0, 5, 3.2, Math.PI, 0, true);
            ctx.lineTo(3.2, -8);
            ctx.stroke();
            ctx.fillRect(-3.2, -8, 6.4, 6);
            ctx.restore();
            /* Draaberne */
            for (var i = 0; i < 2; i++) {
                ctx.beginPath();
                ctx.arc(s * 5, -1 + i * 6, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        /* Overfladen til venstre, aedt i toppen */
        ctx.fillRect(-21, 11, 17, 6);
        /* Haanden til hoejre: haandflade og fingre mod midten */
        ctx.fillRect(7, 11, 13, 7);
        for (var f = 0; f < 3; f++) ctx.fillRect(2, 11 + f * 2.4, 6, 1.7);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-6, 11, 2.6, 0, Math.PI);
        ctx.arc(5, 11, 2.2, 0, Math.PI);
        ctx.fill();
        ctx.restore();
    };

    /* Plakaten paa vaeggen: saadan sidder brillerne rigtigt */
    P.tegnPlakat = function (ctx) {
        var x = 316, y = 150, b = 112, h = 146;
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 4, y + 5, b, h);
        ctx.fillStyle = "#f3efe2";
        ctx.fillRect(x, y, b, h);
        ctx.fillStyle = "#2f9e5e";
        ctx.fillRect(x, y, b, 24);
        NK.tekst(ctx, "SIKKERHED", x + b / 2, y + 16.5, { font: "700 13px 'Segoe UI', sans-serif", justering: "center" });
        /* Et hoved med brillerne paa oejnene */
        var cx = x + b / 2, cy = y + 76;
        ctx.fillStyle = "#e9c3a0";
        ctx.beginPath();
        ctx.arc(cx, cy, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5b3b22";
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 30, cy - 32, 60, 18);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(cx, cy, 27, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.strokeStyle = "#39424f";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx - 25, cy - 3);
        ctx.lineTo(cx + 25, cy - 3);
        ctx.stroke();
        ctx.save();
        ctx.translate(cx, cy - 2);
        ctx.scale(0.72, 0.72);
        this.tegnBrilleglas(ctx, 1);
        ctx.restore();
        ctx.strokeStyle = "#7a3b2e";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + 12);
        ctx.quadraticCurveTo(cx, cy + 17, cx + 7, cy + 12);
        ctx.stroke();
        /* Flueben */
        ctx.strokeStyle = "#2f9e5e";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        ctx.moveTo(cx + 22, cy + 14);
        ctx.lineTo(cx + 29, cy + 22);
        ctx.lineTo(cx + 42, cy + 2);
        ctx.stroke();
        NK.tekst(ctx, "BRILLER PÅ", cx, y + h - 22, { font: "700 12px 'Segoe UI', sans-serif", justering: "center", farve: "#2b2b2b" });
        NK.tekst(ctx, "ØJNENE", cx, y + h - 8, { font: "700 12px 'Segoe UI', sans-serif", justering: "center", farve: "#2b2b2b" });
        ctx.restore();
    };

    /* Gulvet med gruben til karret */
    P.tegnGulv = function (ctx, v, h) {
        var g = ctx.createLinearGradient(0, GULV, 0, HOEJDE);
        g.addColorStop(0, "#3f4550");
        g.addColorStop(1, "#262a31");
        ctx.fillStyle = g;
        ctx.fillRect(v, GULV, h - v, HOEJDE - GULV + 2);
        ctx.fillStyle = "#5b6270";
        ctx.fillRect(v, GULV, h - v, 5);
        ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        for (var y = GULV + 30; y < HOEJDE; y += 34) ctx.fillRect(v, y, h - v, 2);

        /* Gruben */
        var gi = ctx.createLinearGradient(0, GULV, 0, KAR.bund);
        gi.addColorStop(0, "#0b0e12");
        gi.addColorStop(1, "#151a20");
        ctx.fillStyle = gi;
        ctx.fillRect(KAR.ind0, GULV, KAR.ind1 - KAR.ind0, KAR.bund - GULV);

        /* Gule og sorte striber langs kanten */
        this.striber(ctx, KAR.x0 - 44, KAR.ind0);
        this.striber(ctx, KAR.ind1, KAR.x1 + 44);
    };

    P.striber = function (ctx, x0, x1) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x0, GULV, x1 - x0, 5);
        ctx.clip();
        ctx.fillStyle = "#f2c53d";
        ctx.fillRect(x0, GULV, x1 - x0, 5);
        ctx.fillStyle = "#1b1b1b";
        for (var x = x0 - 10; x < x1; x += 14) {
            ctx.beginPath();
            ctx.moveTo(x, GULV + 5); ctx.lineTo(x + 7, GULV + 5); ctx.lineTo(x + 12, GULV); ctx.lineTo(x + 5, GULV);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    };

    P.tegnPlanke = function (ctx) {
        var mig = this, x, trin = 12;
        ctx.save();
        var g = ctx.createLinearGradient(0, GULV - PLANKE.tyk, 0, GULV);
        g.addColorStop(0, "#c89457");
        g.addColorStop(1, "#8a5a2b");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(PLANKE.x0, GULV - PLANKE.tyk);
        for (x = PLANKE.x0; x <= PLANKE.x1; x += trin) ctx.lineTo(x, GULV - PLANKE.tyk + mig.plankeBoej(x));
        ctx.lineTo(PLANKE.x1, GULV - PLANKE.tyk + mig.plankeBoej(PLANKE.x1));
        ctx.lineTo(PLANKE.x1, GULV + mig.plankeBoej(PLANKE.x1));
        for (x = PLANKE.x1; x >= PLANKE.x0; x -= trin) ctx.lineTo(x, GULV + mig.plankeBoej(x));
        ctx.lineTo(PLANKE.x0, GULV);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#5e3b1a";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        /* Aarer i traeet */
        ctx.strokeStyle = "rgba(94, 59, 26, 0.45)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (x = PLANKE.x0 + 20; x < PLANKE.x1 - 30; x += 70) {
            ctx.moveTo(x, GULV - 6 + mig.plankeBoej(x));
            ctx.lineTo(x + 34, GULV - 5 + mig.plankeBoej(x + 34));
        }
        ctx.stroke();
        /* To beslag holder den fast i gulvet */
        [PLANKE.x0 + 16, PLANKE.x0 + 96].forEach(function (bx) {
            ctx.fillStyle = "#6c7480";
            ctx.fillRect(bx - 8, GULV - PLANKE.tyk - 3, 16, PLANKE.tyk + 6);
            ctx.fillStyle = "#9aa3ad";
            ctx.beginPath();
            ctx.arc(bx, GULV - PLANKE.tyk / 2, 2.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    };

    P.tegnSyre = function (ctx) {
        var c = indikator(this.ph), x, trin = 8;
        ctx.save();
        if (this.ph < 5) {
            ctx.shadowColor = rgba(c, 0.55);
            ctx.shadowBlur = (5 - this.ph) * 7;
        }
        var g = ctx.createLinearGradient(0, OVERFLADE, 0, KAR.bund);
        g.addColorStop(0, rgba(c, 0.97, 0.08));
        g.addColorStop(1, rgba(c, 0.97, -0.45));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(KAR.ind0, this.overflade(KAR.ind0));
        for (x = KAR.ind0; x <= KAR.ind1; x += trin) ctx.lineTo(x, this.overflade(x));
        ctx.lineTo(KAR.ind1, this.overflade(KAR.ind1));
        ctx.lineTo(KAR.ind1, KAR.bund);
        ctx.lineTo(KAR.ind0, KAR.bund);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        /* Lys langs overfladen */
        ctx.strokeStyle = rgba(c, 0.9, 0.5);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (x = KAR.ind0; x <= KAR.ind1; x += trin) {
            if (x === KAR.ind0) ctx.moveTo(x, this.overflade(x));
            else ctx.lineTo(x, this.overflade(x));
        }
        ctx.stroke();
        /* Bobler i syren */
        ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
        ctx.lineWidth = 1.2;
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.type !== "boble") continue;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    };

    /* Grubens kanter tegnes oven paa syren, saa den ser ud til at staa i gulvet */
    P.tegnKant = function (ctx) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(KAR.ind0, GULV + 5, 4, KAR.bund - GULV - 5);
        ctx.fillRect(KAR.ind1 - 4, GULV + 5, 4, KAR.bund - GULV - 5);
        ctx.fillStyle = "#1f242b";
        ctx.fillRect(KAR.ind0, KAR.bund - 3, KAR.ind1 - KAR.ind0, 3);
        ctx.restore();
    };

    /* pH-meteret staar til hoejre for karret med elektroden nede i syren */
    P.tegnPhMaaler = function (ctx) {
        var c = indikator(this.ph);
        ctx.save();
        ctx.lineCap = "round";
        /* Stativ */
        ctx.fillStyle = "#555d69";
        ctx.fillRect(946, GULV - 6, 40, 6);
        ctx.fillStyle = "#8a939e";
        ctx.fillRect(962, 200, 7, GULV - 206);
        /* Arm og elektrode */
        ctx.strokeStyle = "#8a939e";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(965, 372);
        ctx.lineTo(866, 372);
        ctx.stroke();
        ctx.fillStyle = "#2c323c";
        ctx.fillRect(860, 364, 14, 18);
        ctx.fillStyle = "rgba(210, 228, 240, 0.55)";
        ctx.fillRect(863, 382, 8, 150);
        ctx.beginPath();
        ctx.arc(867, 534, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1;
        ctx.strokeRect(863, 382, 8, 150);
        /* Ledning */
        ctx.strokeStyle = "#1b1f25";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(867, 364);
        ctx.bezierCurveTo(867, 320, 905, 330, 918, 318);
        ctx.stroke();
        /* Kassen */
        ctx.fillStyle = "#2c323c";
        NK.rundtRekt(ctx, 912, 262, 84, 60, 7);
        ctx.fill();
        ctx.strokeStyle = "#5c6574";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#0b1410";
        NK.rundtRekt(ctx, 920, 270, 68, 38, 4);
        ctx.fill();
        NK.tekst(ctx, "pH", 925, 283, { font: "700 10px 'Segoe UI', sans-serif", farve: "#8f9aa6" });
        NK.tekst(ctx, phTekst(this.ph), 982, 301, { font: "700 22px Consolas, 'Courier New', monospace", justering: "right", farve: rgba(c, 1, 0.15) });
        ctx.restore();
    };

    P.tegnBriller = function (ctx) {
        var br = this.briller;
        if (!br || br.t < 0) return;
        var op = NK.blod(br.t / 0.5);
        var y = OVERFLADE + 16 - op * 19 + Math.sin(br.t * 2.3) * 2;
        ctx.save();
        ctx.translate(br.x, y);
        ctx.rotate(Math.sin(br.t * 1.7) * 0.1);
        this.tegnBrilleglas(ctx, 1);
        ctx.restore();
    };

    /* Sikkerhedsbriller, midt paa (0, 0), 64 enheder brede */
    P.tegnBrilleglas = function (ctx, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa;
        ctx.lineJoin = "round";
        ctx.fillStyle = "rgba(170, 222, 255, 0.55)";
        ctx.strokeStyle = "#39424f";
        ctx.lineWidth = 3;
        [-15, 15].forEach(function (x) {
            NK.rundtRekt(ctx, x - 13, -8, 26, 16, 6);
            ctx.fill();
            ctx.stroke();
        });
        ctx.beginPath();
        ctx.moveTo(-2, -1);
        ctx.lineTo(2, -1);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.fillRect(-24, -5, 6, 2.5);
        ctx.fillRect(6, -5, 6, 2.5);
        ctx.restore();
    };

    P.tegnPartikler = function (ctx) {
        ctx.save();
        for (var i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i];
            if (p.type === "draabe") {
                ctx.fillStyle = rgba(p.farve, 0.95, 0.1);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === "damp") {
                ctx.fillStyle = "rgba(210, 225, 215, " + (0.14 * NK.klamp(p.liv / p.start, 0, 1)) + ")";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === "konfetti") {
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.v);
                ctx.globalAlpha = NK.klamp(p.liv, 0, 1);
                ctx.fillStyle = p.farve;
                ctx.fillRect(-p.b / 2, -p.h / 2, p.b, p.h);
                ctx.restore();
            }
        }
        ctx.restore();
    };

    /* ----- Klassekammeraten ----------------------------------------------
       Tegnet forfra med foedderne i (0, 0) og ca. 240 enheder hoej.
       Sikkerhedsbrillerne sidder paa panden. Det er pointen. */
    P.tegnElev = function (ctx) {
        var e = this.elev;
        if (!e || e.tilstand === "vaek") return;
        var u = e.u, f = e.frygt, t = this.tid;
        var gaar = Math.abs(e.maalX - e.x) > 0.5 && e.tilstand !== "falder";
        var sving = gaar ? Math.sin(e.gang) : 0;
        var bob = gaar ? Math.abs(Math.cos(e.gang)) * -3 : Math.sin(t * 2.2) * 1.2;
        var ryst = f > 0.5 && e.tilstand !== "falder" ? Math.sin(t * 38) * 1.3 * (f - 0.5) * 2 : 0;

        ctx.save();
        ctx.translate(e.x, e.y - e.hop);
        ctx.rotate(e.rot);

        /* Armene: 0 haenger ned, PI/2 vandret ud, PI lige op */
        var armV, armH;
        if (e.tilstand === "jubler" || e.tilstand === "hjem") {
            armV = armH = 2.6 + Math.sin(t * 9) * 0.15;
        } else if (e.tilstand === "vakler" || e.tilstand === "falder") {
            armV = 1.6 + Math.sin(t * 15) * 0.9;
            armH = 1.6 + Math.sin(t * 15 + Math.PI) * 0.9;
        } else {
            var loeft = f > 0.55 ? (f - 0.55) / 0.45 * 1.25 : 0;
            armV = 0.14 + loeft + (gaar ? sving * 0.25 : 0) + Math.sin(t * 7) * 0.08 * loeft;
            armH = 0.14 + loeft - (gaar ? sving * 0.25 : 0) + Math.sin(t * 7 + 1) * 0.08 * loeft;
        }

        if (u.stil === "hestehale") this.tegnHestehale(ctx, u, bob, t);
        if (u.stil === "langt") this.tegnLangtHaar(ctx, u, bob);

        this.tegnBen(ctx, sving, ryst);
        this.tegnKrop(ctx, u, bob);
        this.tegnArm(ctx, u, -1, armV, bob);
        this.tegnArm(ctx, u, 1, armH, bob);
        this.tegnHoved(ctx, e, bob, f, t);
        ctx.restore();
    };

    P.tegnBen = function (ctx, sving, ryst) {
        ctx.save();
        ctx.lineCap = "round";
        [-1, 1].forEach(function (s) {
            var v = sving * 0.38 * s;
            var hx = s * 10, hy = -86;
            var fx = hx + Math.sin(v) * 84 + ryst * s, fy = hy + Math.cos(v) * 84;
            ctx.strokeStyle = "#34496a";
            ctx.lineWidth = 17;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(fx, fy - 6);
            ctx.stroke();
            ctx.strokeStyle = "#415b83";
            ctx.lineWidth = 11;
            ctx.beginPath();
            ctx.moveTo(hx - s * 1.5, hy);
            ctx.lineTo(fx - s * 1.5, fy - 6);
            ctx.stroke();
            /* Skoen */
            ctx.fillStyle = "#2a2b33";
            ctx.beginPath();
            ctx.ellipse(fx + s * 4, fy - 4, 13, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#e9ecef";
            ctx.fillRect(fx + s * 4 - 12, fy - 1.5, 24, 2.5);
        });
        ctx.restore();
    };

    P.tegnKrop = function (ctx, u, bob) {
        ctx.save();
        ctx.translate(0, bob);
        /* Kitlen */
        var g = ctx.createLinearGradient(-38, 0, 38, 0);
        g.addColorStop(0, "#c9d2da");
        g.addColorStop(0.3, "#f7f9fb");
        g.addColorStop(0.7, "#eef2f5");
        g.addColorStop(1, "#bcc6cf");
        ctx.fillStyle = g;
        ctx.strokeStyle = "#8e9aa6";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-14, -158);
        ctx.quadraticCurveTo(-32, -158, -34, -140);
        ctx.lineTo(-39, -60);
        ctx.quadraticCurveTo(0, -54, 39, -60);
        ctx.lineTo(34, -140);
        ctx.quadraticCurveTo(32, -158, 14, -158);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        /* Bluse i halsen */
        ctx.fillStyle = u.bluse;
        ctx.beginPath();
        ctx.moveTo(-13, -158);
        ctx.lineTo(13, -158);
        ctx.lineTo(0, -122);
        ctx.closePath();
        ctx.fill();
        /* Revers og midtersoem */
        ctx.strokeStyle = "#9aa6b1";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-13, -158); ctx.lineTo(0, -122); ctx.lineTo(13, -158);
        ctx.moveTo(0, -122); ctx.lineTo(0, -58);
        ctx.stroke();
        /* Lommer og knapper */
        ctx.strokeRect(-29, -98, 15, 12);
        ctx.strokeRect(14, -98, 15, 12);
        ctx.fillStyle = "#9aa6b1";
        ctx.beginPath();
        ctx.arc(-4, -108, 1.8, 0, Math.PI * 2);
        ctx.arc(-4, -86, 1.8, 0, Math.PI * 2);
        ctx.fill();
        /* En kuglepen i brystlommen */
        ctx.fillStyle = "#2f6fb3";
        ctx.fillRect(18, -140, 3, 12);
        ctx.strokeRect(15, -134, 13, 10);
        ctx.restore();
    };

    P.tegnArm = function (ctx, u, side, v, bob) {
        var sx = side * 30, sy = -146 + bob;
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(-side * v);
        ctx.lineCap = "round";
        ctx.strokeStyle = "#8e9aa6";
        ctx.lineWidth = 17;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 54);
        ctx.stroke();
        ctx.strokeStyle = "#eef2f5";
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 54);
        ctx.stroke();
        ctx.fillStyle = u.hud;
        ctx.beginPath();
        ctx.arc(0, 62, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    };

    P.tegnHestehale = function (ctx, u, bob, t) {
        ctx.save();
        ctx.translate(0, bob);
        ctx.fillStyle = u.haar;
        ctx.beginPath();
        var sv = Math.sin(t * 3) * 3;
        ctx.moveTo(26, -226);
        ctx.quadraticCurveTo(62 + sv, -214, 52 + sv, -160);
        ctx.quadraticCurveTo(46, -176, 30, -196);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    P.tegnLangtHaar = function (ctx, u, bob) {
        ctx.save();
        ctx.translate(0, bob);
        ctx.fillStyle = u.haar;
        NK.rundtRekt(ctx, -44, -222, 88, 84, 22);
        ctx.fill();
        ctx.restore();
    };

    P.tegnHoved = function (ctx, e, bob, f, t) {
        var u = e.u, cy = -198 + bob, r = 38;
        ctx.save();
        /* Hals */
        ctx.fillStyle = u.hud;
        ctx.fillRect(-7, cy + 30, 14, 14);
        /* Oerer */
        ctx.beginPath();
        ctx.arc(-r + 1, cy + 4, 7.5, 0, Math.PI * 2);
        ctx.arc(r - 1, cy + 4, 7.5, 0, Math.PI * 2);
        ctx.fill();
        /* Ansigtet */
        var g = ctx.createRadialGradient(-10, cy - 12, 6, 0, cy, r + 4);
        g.addColorStop(0, u.hud);
        g.addColorStop(1, skygge(u.hud, 0.82));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        this.tegnHaar(ctx, u, cy, r);

        /* Kinder */
        ctx.fillStyle = "rgba(230, 110, 110, " + (0.18 + f * 0.12) + ")";
        ctx.beginPath();
        ctx.ellipse(-22, cy + 14, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(22, cy + 14, 7, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Oejne: de kigger mod karret, naar det bliver farligt */
        var kigX = e.tilstand === "jubler" ? 0 : NK.klamp(f * 3.2, 0, 3.2);
        var kigY = f * 1.2;
        var aaben = e.lukket > 0 ? 0.12 : 1 + f * 0.18;
        [-13, 13].forEach(function (x) {
            ctx.save();
            ctx.translate(x, cy + 1);
            ctx.scale(1, aaben);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(0, 0, 7.5, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.fillStyle = "#2b2622";
            ctx.beginPath();
            ctx.arc(kigX, kigY + 1, 4.3 - f * 0.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(kigX + 1.4, kigY - 0.6, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        /* Bryn: de stiger og skraaner bekymret */
        ctx.strokeStyle = skygge(u.haar, 0.9);
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        var op = f * 5, skraa = f * 4;
        ctx.beginPath();
        ctx.moveTo(-20, cy - 12 - op);
        ctx.lineTo(-7, cy - 13 - op - skraa);
        ctx.moveTo(20, cy - 12 - op);
        ctx.lineTo(7, cy - 13 - op - skraa);
        ctx.stroke();

        /* Naese */
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, cy + 10, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        /* Mund: smil, streg, aaben mund */
        var my = cy + 22;
        ctx.strokeStyle = "#7a3b2e";
        ctx.fillStyle = "#6b2a22";
        ctx.lineWidth = 2.4;
        if (e.tilstand === "jubler" || e.tilstand === "hjem") {
            ctx.beginPath();
            ctx.moveTo(-10, my - 2);
            ctx.quadraticCurveTo(0, my + 12, 10, my - 2);
            ctx.closePath();
            ctx.fill();
        } else if (f < 0.34) {
            var smil = 5 * (1 - f / 0.34);
            ctx.beginPath();
            ctx.moveTo(-8, my);
            ctx.quadraticCurveTo(0, my + smil, 8, my);
            ctx.stroke();
        } else if (f < 0.72) {
            ctx.beginPath();
            ctx.moveTo(-8, my + 1);
            ctx.quadraticCurveTo(-4, my - 2, 0, my + 1);
            ctx.quadraticCurveTo(4, my + 3, 8, my);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.ellipse(0, my + 2, 5, 6.5 + Math.sin(t * 20) * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Sved */
        if (f > 0.45) {
            var s = (t * 0.9) % 1;
            ctx.fillStyle = "rgba(140, 200, 245, " + (0.85 * (1 - s)) + ")";
            ctx.beginPath();
            ctx.ellipse(r + 3, cy - 8 + s * 22, 3, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        /* Sikkerhedsbrillerne paa panden, ikke paa oejnene */
        ctx.strokeStyle = "#39424f";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-r + 1, cy - 20);
        ctx.quadraticCurveTo(0, cy - 30, r - 1, cy - 20);
        ctx.stroke();
        ctx.save();
        ctx.translate(0, cy - 25);
        this.tegnBrilleglas(ctx, 1);
        ctx.restore();
        ctx.restore();
    };

    P.tegnHaar = function (ctx, u, cy, r) {
        ctx.save();
        ctx.fillStyle = u.haar;
        var stil = u.stil;
        /* Kalotten */
        ctx.save();
        ctx.beginPath();
        ctx.rect(-r - 8, cy - r - 30, 2 * r + 16, stil === "pandehaar" ? r + 20 : r + 14);
        ctx.clip();
        ctx.beginPath();
        ctx.arc(0, cy - 1, r + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        /* Tindinger */
        ctx.fillRect(-r - 2, cy - 14, 6, 14);
        ctx.fillRect(r - 4, cy - 14, 6, 14);
        var i;
        if (stil === "kort") {
            ctx.beginPath();
            ctx.ellipse(-6, cy - r - 1, 14, 7, -0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (stil === "kroeller") {
            for (i = 0; i < 9; i++) {
                var v = Math.PI * (1.02 + i * 0.12);
                ctx.beginPath();
                ctx.arc(Math.cos(v) * (r + 2), cy - 4 + Math.sin(v) * (r + 2), 13, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (stil === "pandehaar") {
            ctx.beginPath();
            ctx.moveTo(-r + 2, cy - 16);
            for (i = 0; i <= 6; i++) ctx.lineTo(-r + 2 + i * (2 * r - 4) / 6, cy - 10 + (i % 2) * 5);
            ctx.lineTo(r - 2, cy - 22);
            ctx.lineTo(-r + 2, cy - 22);
            ctx.closePath();
            ctx.fill();
        } else if (stil === "knold") {
            ctx.beginPath();
            ctx.arc(0, cy - r - 10, 15, 0, Math.PI * 2);
            ctx.fill();
        } else if (stil === "rodet") {
            ctx.beginPath();
            for (i = 0; i < 7; i++) {
                var x0 = -r + 4 + i * 11;
                ctx.moveTo(x0, cy - r + 8);
                ctx.lineTo(x0 + 5 + (i % 2) * 4, cy - r - 12 - (i % 3) * 3);
                ctx.lineTo(x0 + 12, cy - r + 8);
            }
            ctx.fill();
        } else if (stil === "hestehale") {
            ctx.beginPath();
            ctx.ellipse(26, cy - 27, 8, 6, 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    };

    function skygge(hex, f) {
        var n = parseInt(hex.slice(1), 16);
        var r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    Kar.POS = POS;
    Kar.SPIDS = SPIDS;
    Kar.OVERFLADE = OVERFLADE;
    Kar.UDSEENDE = UDSEENDE;
    Kar.indikator = indikator;
    Kar.phTekst = phTekst;
    NK.Kar = Kar;
}());

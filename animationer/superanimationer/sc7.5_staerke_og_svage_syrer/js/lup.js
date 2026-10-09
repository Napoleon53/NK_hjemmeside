/* =====================================================================
   lup.js - partikelbilledet i luppen

   Luppen viser et lille rum i glasset. Ved 0,10 M er der haeldt netop
   100 syremolekyler i det rum (K.LUP_N). Hvert molekyle er en enhed:

     hel    graa, med hydronen siddende paa som en lille orange kugle
     delt   blaa med et minus: syrens ion, der har afgivet hydronen.
            Hydronen sidder nu paa et vandmolekyle et sted i rummet:
            en roed kugle med plus (H₃O⁺)

   Formen foelger stoffet (brugerens oenske 9. okt. 2026: Cl⁻ er ikke
   aflang): HCl og Cl⁻ er kugler, eddikesyre, myresyre og citronsyre
   er aflange, og salpetersyre er en trekant med runde hjoerner (FORM).
   Vandmolekylerne tegnes ikke (der er ca. 55.000 i rummet).

   I en svag syre gaar reaktionen begge veje: et helt molekyle afgiver
   sin hydron, og lidt efter tager en ion en hydron tilbage fra en
   oxoniumion. Antallet af delte holdes paa gennemsnittet (K.iLup), saa
   det, eleven taeller, er det, modellen siger.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    var REF = 400 * 280;       /* et vindue i den stoerrelse giver skala 1 */

    var FARVE = {
        hel: { f: "#8a919b", k: "#d9dee4" },
        ion: { f: "#3f86d8", k: "#c2ddfc" },
        ox:  { f: "#e2503f", k: "#ffc4ba" },
        hydron: { f: "#f5a742", k: "#fff0d2" }
    };

    /* Formen paa hvert stof, i pixels ved skala 1.
       kugle: R er radius. pille: l er den halve laengde, t den halve tykkelse.
       trekant: R er afstanden fra midten til et hjoerne. */
    var FORM = {
        HCl:    { slags: "kugle", R: 6.4 },
        HNO3:   { slags: "trekant", R: 8.6 },
        eddike: { slags: "pille", l: 11, t: 4.8 },
        myre:   { slags: "pille", l: 8.2, t: 4.8 },
        citron: { slags: "pille", l: 12.6, t: 6.6 }
    };
    var KNOP = 3.1;            /* hydronens radius ved skala 1 */
    var OX = 5.4;              /* oxoniumionens radius ved skala 1 */

    /* Stoffets maal ved skalaen s */
    function formMaal(syre, s) {
        var f = FORM[syre] || FORM.eddike, knop = KNOP * s;
        if (f.slags === "pille") {
            return { slags: "pille", l: f.l * s, t: f.t * s, arm: f.l * s, knop: knop,
                r: (f.l * 0.6 + f.t * 0.4) * s, kant: f.l * s + knop * 1.7 };
        }
        return { slags: f.slags, R: f.R * s, arm: (f.slags === "trekant" ? f.R * 0.92 : f.R) * s, knop: knop,
            r: f.R * s, kant: f.R * s + knop * 1.7 };
    }

    function Lup(valg) {
        valg = valg || {};
        this.b = valg.b || 400;
        this.h = valg.h || 280;
        this.syre = null;
        this.c = 0;
        this.enh = [];
        this.ox = [];
        this.glimt = [];
        this.skilt = [];
        this.byt = 0;            /* saa mange gange er en hydron taget tilbage */
        this.vent = 2.5;
        this.hast = 1;
        this.bytter = true;      /* slaaet fra: billedet staar stille i antal */
        this.skift = null;
        this.alder = 0;
        this.maal();
        if (valg.syre) this.saet(valg.syre, valg.c === undefined ? K.C0 : valg.c, true);
    }

    var P = Lup.prototype;

    Lup.FARVE = FARVE;
    Lup.FORM = FORM;

    /* ----- Stoerrelser ------------------------------------------------------ */
    P.maal = function () {
        this.s = NK.klamp(Math.sqrt(this.b * this.h / REF), 0.72, 1.3);
        this.F = formMaal(this.syre, this.s);
        this.or = OX * this.s;
    };

    /* Vinduet har faaet en ny stoerrelse: partiklerne flytter med */
    P.saetMaal = function (b, h) {
        b = Math.max(60, b); h = Math.max(60, h);
        if (b === this.b && h === this.h) return;
        var fx = b / this.b, fy = h / this.h, mig = this;
        this.enh.concat(this.ox).forEach(function (p) { p.x *= fx; p.y *= fy; });
        this.b = b;
        this.h = h;
        this.maal();
        this.enh.forEach(function (e) { e.r = mig.F.r; e.kant = mig.F.kant; });
        this.ox.forEach(function (o) { o.r = mig.or; o.kant = mig.or + 1; });
    };

    /* ----- Indholdet ---------------------------------------------------------- */
    P.nyEnhed = function (delt) {
        var F = this.F;
        return { x: NK.r(F.kant, this.b - F.kant), y: NK.r(F.kant, this.h - F.kant), vx: 0, vy: 0,
            a: NK.r(0, Math.PI * 2), va: NK.r(-0.5, 0.5), delt: !!delt, alfa: 1, ud: false, blink: 0, r: F.r, kant: F.kant };
    };

    P.nyOx = function (x, y) {
        return { x: x === undefined ? NK.r(this.or, this.b - this.or) : x, y: y === undefined ? NK.r(this.or, this.h - this.or) : y,
            vx: 0, vy: 0, alfa: 1, ud: false, r: this.or, kant: this.or + 1, foedt: this.alder, maal: null };
    };

    /* Stedet, hvor hydronen sidder paa en enhed */
    P.knopVed = function (e) {
        var d = this.F.arm + this.F.knop * 0.55;
        return { x: e.x + Math.cos(e.a) * d, y: e.y + Math.sin(e.a) * d };
    };

    /* Saet syren og koncentrationen. Er det den samme syre i en ny
       koncentration (en fortynding), forsvinder eller kommer kun de
       partikler, der er forskellen. */
    P.saet = function (syre, c, straks) {
        var t = K.iLup(syre, c), i, mig = this;
        if (syre !== this.syre || straks) {
            this.syre = syre;
            this.c = c;
            this.maal();
            this.enh = [];
            this.ox = [];
            this.glimt = [];
            this.skilt = [];
            this.skift = null;
            this.vent = this.interval() * 0.5;
            for (i = 0; i < t.haeldt; i++) this.enh.push(this.nyEnhed(i < t.delte));
            for (i = 0; i < t.delte; i++) this.ox.push(this.nyOx());
            for (i = 0; i < 40; i++) this.skub(1);
            return;
        }
        this.c = c;
        this.skift = null;
        this.enh.forEach(function (e) { e.blink = 0; });
        this.ox.forEach(function (o) { o.maal = null; });
        var levende = this.enh.filter(function (e) { return !e.ud; });
        while (levende.length > t.haeldt) levende.splice(Math.floor(Math.random() * levende.length), 1)[0].ud = true;
        while (levende.length < t.haeldt) {
            var ny = this.nyEnhed(false);
            ny.alfa = 0;
            this.enh.push(ny);
            levende.push(ny);
        }
        /* Det rigtige antal delte blandt dem, der er tilbage */
        var delte = levende.filter(function (e) { return e.delt; });
        var hele = levende.filter(function (e) { return !e.delt; });
        while (delte.length > t.delte) { var d = delte.pop(); d.delt = false; hele.push(d); }
        while (delte.length < t.delte && hele.length) { var h = hele.pop(); h.delt = true; delte.push(h); }
        var ox = this.ox.filter(function (o) { return !o.ud; });
        while (ox.length > t.delte) ox.splice(Math.floor(Math.random() * ox.length), 1)[0].ud = true;
        while (ox.length < t.delte) { var o = mig.nyOx(); o.alfa = 0; mig.ox.push(o); ox.push(o); }
        this.vent = this.interval();
    };

    P.antal = function () {
        var hele = 0, delte = 0;
        this.enh.forEach(function (e) { if (e.ud) return; if (e.delt) delte++; else hele++; });
        return { haeldt: hele + delte, hele: hele, delte: delte,
            ox: this.ox.filter(function (o) { return !o.ud; }).length };
    };

    /* Sekunder mellem to byt: jo flere delte, jo oftere sker det */
    P.interval = function () {
        var n = Math.max(1, this.syre ? K.iLup(this.syre, this.c).delte : 1);
        return 6 / Math.sqrt(n) * NK.r(0.8, 1.3);
    };

    /* ----- Bevaegelsen --------------------------------------------------------- */
    /* Partikler, der ligger oven i hinanden, skubbes fra hinanden */
    P.skub = function (styrke) {
        var alle = this.enh.concat(this.ox), n = alle.length, i, j;
        for (i = 0; i < n; i++) {
            var p = alle[i];
            for (j = i + 1; j < n; j++) {
                var q = alle[j];
                var dx = q.x - p.x, dy = q.y - p.y, min = p.r + q.r;
                if (dx > min || dx < -min || dy > min || dy < -min) continue;
                var d2 = dx * dx + dy * dy;
                if (d2 >= min * min) continue;
                if (p.maal === q || q.maal === p) continue;      /* de to skal netop moedes */
                var d = Math.sqrt(d2) || 0.01;
                var skub = (min - d) * 0.5 * styrke;
                var ux = dx / d, uy = dy / d;
                p.x -= ux * skub; p.y -= uy * skub;
                q.x += ux * skub; q.y += uy * skub;
            }
        }
        var b = this.b, h = this.h;
        alle.forEach(function (p) {
            p.x = NK.klamp(p.x, p.kant, b - p.kant);
            p.y = NK.klamp(p.y, p.kant, h - p.kant);
        });
    };

    function vandring(p, dt, fart, b, h) {
        p.vx += NK.r(-1, 1) * fart * 3 * dt;
        p.vy += NK.r(-1, 1) * fart * 3 * dt;
        var v = Math.hypot(p.vx, p.vy);
        if (v > fart) { p.vx *= fart / v; p.vy *= fart / v; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < p.kant) { p.x = p.kant; p.vx = Math.abs(p.vx); }
        if (p.x > b - p.kant) { p.x = b - p.kant; p.vx = -Math.abs(p.vx); }
        if (p.y < p.kant) { p.y = p.kant; p.vy = Math.abs(p.vy); }
        if (p.y > h - p.kant) { p.y = h - p.kant; p.vy = -Math.abs(p.vy); }
    }

    P.opdater = function (dt) {
        var mig = this, s = this.s, b = this.b, h = this.h;
        this.alder += dt;

        this.enh.forEach(function (e) {
            vandring(e, dt, 9 * s, b, h);
            e.a += e.va * dt;
            if (e.ud) e.alfa -= dt / 0.6; else if (e.alfa < 1) e.alfa = Math.min(1, e.alfa + dt / 0.5);
        });
        this.ox.forEach(function (o) {
            if (o.maal) {
                /* paa vej hen til den ion, der tager hydronen tilbage */
                var m = mig.knopVed(o.maal);
                var dx = m.x - o.x, dy = m.y - o.y, d = Math.hypot(dx, dy) || 0.01;
                var fart = 60 * s;
                o.vx = dx / d * fart;
                o.vy = dy / d * fart;
                o.x += o.vx * dt;
                o.y += o.vy * dt;
            } else {
                vandring(o, dt, 17 * s, b, h);
            }
            if (o.ud) o.alfa -= dt / 0.6; else if (o.alfa < 1) o.alfa = Math.min(1, o.alfa + dt / 0.5);
        });
        this.enh = this.enh.filter(function (e) { return e.alfa > 0; });
        this.ox = this.ox.filter(function (o) { return o.alfa > 0; });
        this.skub(0.6);

        this.glimt.forEach(function (g) { g.t += dt; });
        this.glimt = this.glimt.filter(function (g) { return g.t < 0.6; });
        this.skilt.forEach(function (k) { k.t -= dt; });
        this.skilt = this.skilt.filter(function (k) { return k.t > 0; });

        /* Den svage syre: en hydron afgives, og en anden tages tilbage */
        if (this.skift) { this.koerBytte(dt); return; }
        if (!this.bytter || !this.syre || K.erStaerk(this.syre)) return;
        this.vent -= dt * this.hast;
        if (this.vent <= 0) this.startBytte();
    };

    P.startBytte = function () {
        var mig = this, b = this.b, h = this.h;
        var hele = this.enh.filter(function (e) { return !e.ud && !e.delt; });
        var ox = this.ox.filter(function (o) { return !o.ud && !o.maal; });
        if (!hele.length || !ox.length) { this.vent = this.interval(); return; }
        /* Et helt molekyle et stykke fra kanten og fra de oxoniumioner, der er der */
        var bedst = null, bv = -1;
        for (var i = 0; i < 12; i++) {
            var e = hele[Math.floor(Math.random() * hele.length)];
            var kant = Math.min(e.x, b - e.x, e.y, h - e.y);
            var naer = 1e9;
            ox.forEach(function (o) { naer = Math.min(naer, Math.hypot(o.x - e.x, o.y - e.y)); });
            var v = Math.min(kant * 2, 90 * mig.s) + Math.min(naer, 160 * mig.s);
            if (v > bv) { bv = v; bedst = e; }
        }
        ox.sort(function (p, q) { return p.foedt - q.foedt; });
        this.skift = { fase: "afgiv", t: 0, ny: bedst, gammel: ox[0], hjem: null };
    };

    P.koerBytte = function (dt) {
        var k = this.skift;
        k.t += dt * Math.max(1, this.hast * 0.75);
        if (k.ny.ud || k.gammel.ud) { this.skift = null; this.vent = this.interval(); return; }
        if (k.fase === "afgiv") {
            k.ny.blink = Math.min(1, k.t / 0.7);
            if (k.t < 0.7) return;
            /* Hydronen slipper molekylet og sidder nu paa et vandmolekyle */
            var kn = this.knopVed(k.ny);
            k.ny.blink = 0;
            k.ny.delt = true;
            var o = this.nyOx(kn.x, kn.y);
            o.vx = Math.cos(k.ny.a) * 17 * this.s;
            o.vy = Math.sin(k.ny.a) * 17 * this.s;
            this.ox.push(o);
            this.glimt.push({ x: kn.x, y: kn.y, t: 0 });
            this.skilt.push({ tekst: "afgiver en hydron", p: k.ny, t: 2.4 });
            k.fase = "pause";
            k.t = 0;
            return;
        }
        if (k.fase === "pause") {
            if (k.t < 1.1) return;
            /* Den naermeste ion (ikke den nye) tager hydronen tilbage */
            var bedst = null, bd = 1e9;
            this.enh.forEach(function (e) {
                if (e.ud || !e.delt || e === k.ny) return;
                var d = Math.hypot(e.x - k.gammel.x, e.y - k.gammel.y);
                if (d < bd) { bd = d; bedst = e; }
            });
            if (!bedst) { this.skift = null; this.vent = this.interval(); return; }
            k.hjem = bedst;
            k.gammel.maal = bedst;
            k.fase = "hjem";
            k.t = 0;
            return;
        }
        /* hjem: oxoniumionen er paa vej hen til ionen */
        var m = this.knopVed(k.hjem);
        var d2 = Math.hypot(m.x - k.gammel.x, m.y - k.gammel.y);
        if (d2 > this.or + this.F.knop && k.t < 8) return;
        k.hjem.delt = false;
        this.ox = this.ox.filter(function (q) { return q !== k.gammel; });
        this.glimt.push({ x: m.x, y: m.y, t: 0 });
        this.skilt.push({ tekst: "tager en hydron tilbage", p: k.hjem, t: 2.4 });
        this.byt++;
        this.skift = null;
        this.vent = this.interval();
    };

    /* ----- Musen: hvad ligger der her? (x og y i vinduets egne maal) ---------- */
    P.ved = function (x, y) {
        var i, o, e, naa = Math.max(this.F.arm, 7);
        for (i = this.ox.length - 1; i >= 0; i--) {
            o = this.ox[i];
            if (!o.ud && Math.hypot(o.x - x, o.y - y) < this.or + 5) return { slags: "ox", p: o };
        }
        for (i = this.enh.length - 1; i >= 0; i--) {
            e = this.enh[i];
            if (!e.ud && Math.hypot(e.x - x, e.y - y) < naa) return { slags: e.delt ? "ion" : "hel", p: e };
        }
        return null;
    };

    /* ----- Tegning --------------------------------------------------------------- */
    function kropSti(ctx, F) {
        if (F.slags === "pille") { NK.rundtRekt(ctx, -F.l, -F.t, 2 * F.l, 2 * F.t, F.t); return; }
        ctx.beginPath();
        if (F.slags === "kugle") { ctx.arc(0, 0, F.R, 0, Math.PI * 2); return; }
        /* trekant med runde hjoerner; et hjoerne peger mod hydronen */
        var p = [], i;
        for (i = 0; i < 3; i++) p.push({ x: Math.cos(i * 2 * Math.PI / 3) * F.R * 1.25, y: Math.sin(i * 2 * Math.PI / 3) * F.R * 1.25 });
        ctx.moveTo((p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2);
        ctx.arcTo(p[1].x, p[1].y, p[2].x, p[2].y, F.R * 0.42);
        ctx.arcTo(p[2].x, p[2].y, p[0].x, p[0].y, F.R * 0.42);
        ctx.arcTo(p[0].x, p[0].y, p[1].x, p[1].y, F.R * 0.42);
        ctx.closePath();
    }

    /* Et syremolekyle: helt (graat, med hydronen paa) eller delt (blaat, med minus) */
    function enhed(ctx, x, y, a, F, delt) {
        var f = delt ? FARVE.ion : FARVE.hel;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        if (!delt) {
            ctx.beginPath();
            ctx.arc(F.arm + F.knop * 0.55, 0, F.knop, 0, Math.PI * 2);
            ctx.fillStyle = FARVE.hydron.f;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = FARVE.hydron.k;
            ctx.stroke();
        }
        kropSti(ctx, F);
        ctx.fillStyle = f.f;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = f.k;
        ctx.stroke();
        ctx.restore();
        if (delt) {
            /* minus, vandret uanset hvordan ionen vender */
            var m = Math.min(F.arm * 0.5, F.knop * 1.15);
            ctx.beginPath();
            ctx.moveTo(x - m, y);
            ctx.lineTo(x + m, y);
            ctx.lineWidth = Math.max(1.4, F.knop * 0.5);
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();
        }
    }

    function kugle(ctx, x, y, r, f) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = f.f;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = f.k;
        ctx.stroke();
        /* plus, saa den ogsaa kan kendes uden farven */
        ctx.beginPath();
        ctx.moveTo(x - r * 0.5, y);
        ctx.lineTo(x + r * 0.5, y);
        ctx.moveTo(x, y - r * 0.5);
        ctx.lineTo(x, y + r * 0.5);
        ctx.lineWidth = Math.max(1.3, r * 0.27);
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
    }

    /* Signaturens tegn: stoffet i skalaen k med midten i (x, y).
       slags: "hel", "ion" eller "ox". Giver tegnets halve bredde. */
    Lup.ikon = function (ctx, slags, syre, x, y, k) {
        if (slags === "ox") { kugle(ctx, x, y, OX * k, FARVE.ox); return OX * k; }
        var F = formMaal(syre, k);
        if (slags === "ion") { enhed(ctx, x, y, 0, F, true); return F.arm; }
        /* det hele molekyle: kroppen rykkes lidt til venstre, saa hydronen er med */
        enhed(ctx, x - F.knop * 0.8, y, 0, F, false);
        return F.arm + F.knop * 0.8;
    };

    Lup.ikonBredde = function (slags, syre, k) {
        if (slags === "ox") return OX * k * 2;
        var F = formMaal(syre, k);
        return slags === "ion" ? F.arm * 2 : (F.arm + F.knop * 0.8) * 2;
    };

    /* R er vinduet paa laerredet. valg.skilte: vis de smaa skilte ved et bytte.
       valg.ring: en partikel, der skal have en gul ring (hint). */
    P.tegn = function (ctx, R, valg) {
        valg = valg || {};
        var mig = this, fx = R.b / this.b, fy = R.h / this.h, F = this.F;
        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, 12);
        ctx.clip();
        var g = ctx.createLinearGradient(0, R.y, 0, R.y + R.h);
        g.addColorStop(0, "#1c4a70");
        g.addColorStop(1, "#163c5c");
        ctx.fillStyle = g;
        ctx.fillRect(R.x, R.y, R.b, R.h);
        ctx.translate(R.x, R.y);
        ctx.scale(fx, fy);

        /* de hele foerst, saa ionerne og oeverst oxoniumionerne */
        this.enh.forEach(function (e) {
            if (e.delt) return;
            ctx.globalAlpha = NK.klamp(e.alfa, 0, 1);
            enhed(ctx, e.x, e.y, e.a, F, false);
            if (e.blink > 0) {
                ctx.beginPath();
                ctx.arc(e.x, e.y, F.kant + 2 + e.blink * 5, 0, Math.PI * 2);
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = "rgba(245, 167, 66, " + (0.35 + 0.6 * e.blink) + ")";
                ctx.stroke();
            }
        });
        this.enh.forEach(function (e) {
            if (!e.delt) return;
            ctx.globalAlpha = NK.klamp(e.alfa, 0, 1);
            enhed(ctx, e.x, e.y, e.a, F, true);
        });
        this.ox.forEach(function (o) {
            ctx.globalAlpha = NK.klamp(o.alfa, 0, 1);
            kugle(ctx, o.x, o.y, mig.or, FARVE.ox);
        });
        ctx.globalAlpha = 1;

        this.glimt.forEach(function (gl) {
            var t = gl.t / 0.6;
            ctx.beginPath();
            ctx.arc(gl.x, gl.y, F.kant * (0.5 + 1.4 * t), 0, Math.PI * 2);
            ctx.lineWidth = 3 * (1 - t) + 0.5;
            ctx.strokeStyle = "rgba(245, 167, 66, " + (1 - t) + ")";
            ctx.stroke();
        });

        if (valg.ring && !valg.ring.ud) {
            var puls = 0.5 + 0.5 * Math.sin(this.alder * 5);
            ctx.beginPath();
            ctx.arc(valg.ring.x, valg.ring.y, this.or + 8 + puls * 3, 0, Math.PI * 2);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "rgba(242, 197, 61, " + (0.6 + 0.4 * puls) + ")";
            ctx.stroke();
        }

        if (valg.skilte !== false) {
            this.skilt.forEach(function (k) {
                var tekst = k.tekst;
                ctx.font = "700 13px 'Segoe UI', sans-serif";
                var tb = ctx.measureText(tekst).width + 16, th = 23;
                var x = NK.klamp(k.p.x, tb / 2 + 4, mig.b - tb / 2 - 4);
                var y = k.p.y - F.kant - 15;
                if (y < th / 2 + 4) y = k.p.y + F.kant + 15;
                ctx.globalAlpha = NK.klamp(k.t / 0.4, 0, 1);
                NK.rundtRekt(ctx, x - tb / 2, y - th / 2, tb, th, th / 2);
                ctx.fillStyle = "rgba(14, 15, 21, 0.9)";
                ctx.fill();
                ctx.lineWidth = 1.2;
                ctx.strokeStyle = FARVE.hydron.f;
                ctx.stroke();
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#ffe2b5";
                ctx.fillText(tekst, x, y + 0.5);
            });
            ctx.globalAlpha = 1;
        }
        ctx.restore();
    };

    NK.Lup = Lup;
}());

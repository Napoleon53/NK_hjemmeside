/* =====================================================================
   lup.js - luppen med figurerne i kolben (fane 1)

   Luppen viser chloridet i kolben som 8 figurer: 1 figur = 1/8 af
   chloridet. Hver gang der er loebet 1/8 af aekvivalensrumfanget ned,
   kommer en Ag⁺ ind. Ag⁺ svoemmer hen til en Cl⁻, og de bliver til
   hvidt AgCl, der synker til bunds. Na⁺ og NO₃⁻ er ikke tegnet, fordi de
   ikke reagerer (med dem blev luppen for fuld, 26. sept. 2026).

   Naar alt chlorid er faeldet, finder de naeste Ag⁺ chromat. To Ag⁺ og
   én CrO₄²⁻ bliver til roedbrunt Ag₂CrO₄. Chromatet er ikke tegnet i
   samme skala som chloridet: det er kun lidt, men det er det, der farver
   kolben. Sim'en sender to Ag⁺ ind ved omslaget (se sim_titrering.js).

   Sammensatte ioner tegnes som én kugle eller pille med formlen paa
   (reglen fra hjemmesidens CLAUDE.md). Positionerne er i luppens egne
   enheder (-1 til 1), saa luppen kan have enhver stoerrelse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    var N = K.FIGURER;
    var N_CR = 2;                /* chromat i luppen */
    var FRI_MAKS = 3;            /* hoejst saa mange fri Ag⁺ i luppen */
    var RAND = 0.8;              /* figurerne holder sig inden for denne radius */

    var FARVE = {
        cl: { bund: "#4cc47f", kant: "#237a4b", tekst: "#ffffff" },
        ag: { bund: "#d5dade", kant: "#7d8791", tekst: "#1c1f26" },
        agcl: { bund: "#f7f7f2", kant: "#9aa0a6", tekst: "#1c1f26" },
        cr: { bund: "#f2cf3a", kant: "#a8860e", tekst: "#2a2100" },
        ag2cro4: { bund: "#b5522e", kant: "#7a3018", tekst: "#ffffff" }
    };

    /* Pladserne i bunden af luppen, hvor bundfaldet lander: nederste
       raekke foerst. 8 AgCl og 2 Ag₂CrO₄. */
    var BUNKE = (function () {
        var p = [], raekker = [[0.66, 3], [0.51, 4], [0.36, 4]];
        raekker.forEach(function (r) {
            var y = r[0], n = r[1], b = Math.sqrt(RAND * RAND - y * y) * 0.92;
            for (var i = 0; i < n; i++) p.push({ x: n === 1 ? 0 : -b + 2 * b * i / (n - 1), y: y });
        });
        return p;
    }());

    function Lup() {
        this.nulstil();
    }

    var P = Lup.prototype;

    P.nulstil = function () {
        this.figurer = [];
        this.inde = 0;           /* Ag⁺, der er kommet ind */
        this.bunke = 0;          /* optagne pladser i bunden */
        var i, v, r;
        for (i = 0; i < N; i++) {
            v = i / N * Math.PI * 2 + NK.r(-0.3, 0.3);
            r = i % 2 ? NK.r(0.2, 0.35) : NK.r(0.48, 0.6);
            this.figurer.push({ slags: "cl", x: Math.cos(v) * r, y: Math.sin(v) * r * 0.8 - 0.1, fase: "fri", ph: NK.r(0, 6), alfa: 1, reserveret: 0 });
        }
        for (i = 0; i < N_CR; i++) {
            this.figurer.push({ slags: "cr", x: i ? 0.42 : -0.42, y: -0.35, fase: "fri", ph: NK.r(0, 6), alfa: 1, reserveret: 0, ag: [] });
        }
    };

    P.tael = function (slags, fase) {
        var n = 0;
        this.figurer.forEach(function (f) { if (f.slags === slags && (!fase || f.fase === fase)) n++; });
        return n;
    };

    P.clTilbage = function () { return this.tael("cl"); };
    P.agcl = function () { return this.tael("agcl"); };
    P.ag2cro4 = function () { return this.tael("ag2cro4"); };
    P.friAg = function () { return this.tael("ag", "fri"); };

    /* k: hvor mange Ag⁺-figurer der i alt er loebet ned. Er det faerre
       end foer (en ny proeve), begynder luppen forfra. */
    P.saet = function (k) {
        if (k < this.inde) { this.nulstil(); }
        k = Math.min(k, N + 2 * N_CR + FRI_MAKS);
        while (this.inde < k) {
            this.inde++;
            var x = NK.r(-0.25, 0.25);
            this.figurer.push({ slags: "ag", x: x, y: -1.15, vy: 0.9, fase: "ind", ph: NK.r(0, 6), maal: null, t: 0, alfa: 1 });
        }
    };

    /* Straks i ro: alle igangvaerende reaktioner gennemfoeres (bruges,
       naar forsoeget springer frem, fx Vis svaret) */
    P.straks = function () {
        for (var i = 0; i < 60; i++) this.opdater(0.1);
    };

    /* Det naermeste ledige maal for en Ag⁺: Cl⁻ foerst, saa chromat */
    function findMaal(figurer, f) {
        var bedst = null, bd = 1e9;
        function proev(s) {
            var dx = s.x - f.x, dy = s.y - f.y, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; bedst = s; }
        }
        figurer.forEach(function (s) { if (s.slags === "cl" && !s.reserveret) proev(s); });
        if (bedst) return bedst;
        /* Et chromat, der allerede har én Ag⁺ paa vej, faar den anden */
        figurer.forEach(function (s) { if (s.slags === "cr" && s.reserveret === 1) proev(s); });
        if (bedst) return bedst;
        figurer.forEach(function (s) { if (s.slags === "cr" && s.reserveret === 0) proev(s); });
        return bedst;
    }

    /* Rummet, figurerne i opløsning har: en cirkel fra toppen af luppen
       ned til lige over bunkens oeverste raekke. { cy, r } */
    P.rum = function () {
        if (this.bunke <= 0) return { cy: 0, r: RAND };
        var bund = BUNKE[Math.min(this.bunke, BUNKE.length) - 1].y - 0.16;
        return { cy: (bund - RAND) / 2, r: (bund + RAND) / 2 };
    };

    P.tilBunds = function (f) {
        var p = BUNKE[Math.min(this.bunke, BUNKE.length - 1)];
        this.bunke++;
        f.fase = "synk";
        f.bx = p.x;
        f.by = p.y;
    };

    P.opdater = function (dt) {
        var mig = this;
        var tid = (this.tid || 0) + dt;
        this.tid = tid;
        var drej = 0.22;           /* omroererens langsomme hvirvel, rad/s */

        this.figurer.forEach(function (f) {
            f.t = (f.t || 0) + dt;
            if (f.fase === "ind") {
                f.y += f.vy * dt;
                if (f.y > -0.55) f.fase = f.slags === "ag" ? "soeg" : "fri";
                return;
            }
            if (f.fase === "synk") {
                f.x = NK.mod(f.x, f.bx, 3, dt);
                f.y = NK.mod(f.y, f.by, 2.6, dt);
                if (Math.abs(f.y - f.by) < 0.01 && Math.abs(f.x - f.bx) < 0.01) { f.x = f.bx; f.y = f.by; f.fase = "bund"; }
                return;
            }
            if (f.fase === "bund" || f.fase === "vaek") return;
            if (f.slags === "ag" && f.fase === "soeg") {
                if (!f.maal) {
                    f.maal = findMaal(mig.figurer, f);
                    if (f.maal) f.maal.reserveret++;
                    else { f.fase = "fri"; return; }
                }
                var dx = f.maal.x - f.x, dy = f.maal.y - f.y;
                var d = Math.sqrt(dx * dx + dy * dy) || 1;
                if (d < 0.17) {
                    mig.reager(f, f.maal);
                    return;
                }
                var fart = 1.3;
                f.x += dx / d * fart * dt;
                f.y += dy / d * fart * dt;
                return;
            }
            if (f.slags === "ag" && f.fase === "klar") {
                /* den foerste Ag⁺ ved et chromat venter ved siden af det */
                f.x = f.maal.x + 0.16;
                f.y = f.maal.y - 0.02;
                return;
            }
            /* Resten driver rundt med hvirvlen og lidt tilfaeldig bevaegelse
               i rummet over bunken */
            var rum = mig.rum();
            var vx = -(f.y - rum.cy) * drej + Math.sin(tid * 0.9 + f.ph * 3.1) * 0.05;
            var vy = f.x * drej + Math.cos(tid * 0.7 + f.ph * 2.3) * 0.05;
            f.x += vx * dt;
            f.y += vy * dt;
            var ry = f.y - rum.cy, r = Math.sqrt(f.x * f.x + ry * ry);
            if (r > rum.r) {
                var nr = NK.mod(r, rum.r, 4, dt);
                f.x *= nr / r;
                f.y = rum.cy + ry * nr / r;
            }
        });

        /* Figurerne skubber let til hinanden, saa de ikke daekker hinanden.
           Bundfaldet ligger stille, og de andre skubbes vaek fra det. */
        var fs = this.figurer;
        function fast(a) { return a.fase === "bund" || a.fase === "synk"; }
        for (var i = 0; i < fs.length; i++) {
            var a = fs[i];
            if (a.fase === "ind" || a.fase === "vaek" || a.fase === "klar") continue;
            for (var j = i + 1; j < fs.length; j++) {
                var b = fs[j];
                if (b.fase === "ind" || b.fase === "vaek" || b.fase === "klar") continue;
                if (fast(a) && fast(b)) continue;
                if (a.fase === "soeg" && b === a.maal) continue;
                if (b.fase === "soeg" && a === b.maal) continue;
                var dx = b.x - a.x, dy = (b.y - a.y) * 1.8;
                var minD = storrelse(a) + storrelse(b);
                var d2 = dx * dx + dy * dy;
                if (d2 < minD * minD && d2 > 1e-6) {
                    var d = Math.sqrt(d2), skub = (minD - d) * 0.5 * Math.min(1, dt * 6);
                    var ka = fast(a) ? 0 : (fast(b) ? 2 : 1), kb = fast(b) ? 0 : (fast(a) ? 2 : 1);
                    a.x -= dx / d * skub * ka; a.y -= dy / d * skub / 1.8 * ka;
                    b.x += dx / d * skub * kb; b.y += dy / d * skub / 1.8 * kb;
                }
            }
        }

        this.figurer = this.figurer.filter(function (f) {
            if (f.fase === "vaek") f.alfa -= dt * 4;
            return f.alfa > 0;
        });
    };

    /* En Ag⁺ naar sit maal */
    P.reager = function (ag, maal) {
        if (maal.slags === "cl") {
            maal.slags = "agcl";
            maal.alfa = 1;
            ag.fase = "vaek";
            ag.alfa = 0;
            this.tilBunds(maal);
            return;
        }
        /* Chromat: den foerste Ag⁺ venter, den anden fuldender Ag₂CrO₄ */
        maal.ag.push(ag);
        if (maal.ag.length < 2) {
            ag.fase = "klar";
            return;
        }
        maal.ag.forEach(function (a) { a.fase = "vaek"; a.alfa = 0; });
        maal.slags = "ag2cro4";
        this.tilBunds(maal);
    };

    /* Figurens halve bredde i luppens enheder (til skubbet) */
    function storrelse(f) {
        if (f.slags === "agcl" || f.slags === "cr") return 0.13;
        if (f.slags === "ag2cro4") return 0.16;
        if (f.slags === "cl") return 0.1;
        if (f.slags === "ag") return 0.09;
        return 0.075;
    }

    /* ----- Tegning ------------------------------------------------------------------ */
    function pille(ctx, x, y, tekst, px, farve, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
        var b = ctx.measureText(tekst).width + px * 0.9, h = px * 1.75;
        ctx.fillStyle = farve.bund;
        NK.rundtRekt(ctx, x - b / 2, y - h / 2, b, h, h / 2);
        ctx.fill();
        ctx.strokeStyle = farve.kant;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = farve.tekst;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
    }

    function kugle(ctx, x, y, r, tekst, px, farve, alfa) {
        ctx.save();
        ctx.globalAlpha *= NK.klamp(alfa, 0, 1);
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
        g.addColorStop(0, "#ffffff");
        g.addColorStop(0.25, farve.bund);
        g.addColorStop(1, farve.kant);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = farve.tekst;
        ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
        ctx.restore();
    }

    /* Tegner luppen med midten i (cx, cy) og radius R. v.farve: vaeskens
       farve bag figurerne, v.lys: den gule kant banker */
    P.tegn = function (ctx, cx, cy, R, opt) {
        opt = opt || {};
        var px = NK.klamp(Math.round(R * 0.075), 12, 16);
        ctx.save();
        /* Skygge og ramme */
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + 4, cy + 6, R + 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.save();
        ctx.clip();
        var g = ctx.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R);
        g.addColorStop(0, "#23303f");
        g.addColorStop(1, "#141b25");
        ctx.fillStyle = g;
        ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        if (opt.farve) {
            ctx.fillStyle = opt.farve;
            ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
        }

        function pos(f) { return { x: cx + f.x * R, y: cy + f.y * R }; }

        /* Tegneordenen: bundfaldet bagerst, saa ionerne i opløsning */
        var orden = { agcl: 1, ag2cro4: 1, cr: 2, cl: 2, ag: 3 };
        var liste = this.figurer.slice().sort(function (a, b) { return orden[a.slags] - orden[b.slags]; });
        liste.forEach(function (f) {
            var p = pos(f);
            if (f.slags === "cl") kugle(ctx, p.x, p.y, px * 1.3, "Cl⁻", Math.max(12, px - 1), FARVE.cl, f.alfa);
            else if (f.slags === "agcl") pille(ctx, p.x, p.y, "AgCl", px, FARVE.agcl, f.alfa);
            else if (f.slags === "cr") pille(ctx, p.x, p.y, "CrO₄²⁻", px, FARVE.cr, f.alfa);
            else if (f.slags === "ag2cro4") pille(ctx, p.x, p.y, "Ag₂CrO₄", px, FARVE.ag2cro4, f.alfa);
            else if (f.slags === "ag") kugle(ctx, p.x, p.y, px * 1.2, "Ag⁺", Math.max(12, px - 2), FARVE.ag, f.alfa);
        });
        ctx.restore();

        /* Ramme */
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#3b404c";
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = opt.lys ? "rgba(242, 197, 61, " + (0.5 + 0.5 * opt.lys) + ")" : "rgba(242, 197, 61, 0.55)";
        if (opt.lys) ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, R + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    };

    Lup.FARVE = FARVE;
    Lup.FRI_MAKS = FRI_MAKS;
    Lup.N_CR = N_CR;
    NK.Lup = Lup;
}());

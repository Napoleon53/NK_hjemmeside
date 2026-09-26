/* =====================================================================
   lup.js - luppen med figurerne i kolben (fane 1)

   Luppen viser syren i kolben som 8 figurer: 1 figur = 1/8 af
   eddikesyren. Hver gang der er loebet 1/8 af aekvivalensrumfanget ned,
   kommer en OH⁻ ind sammen med en Na⁺. OH⁻ svoemmer hen til en
   CH₃COOH, tager dens H⁺ og bliver til H₂O, som forsvinder i vandet.
   CH₃COOH bliver til CH₃COO⁻. Naar alle 8 er brugt, bliver de naeste OH⁻
   fri, og saa er kolben lyserød.

   Sammensatte ioner og molekyler tegnes som én pille med formlen paa
   (reglen fra hjemmesidens CLAUDE.md). Positionerne er i luppens egne
   enheder (-1 til 1), saa luppen kan have enhver stoerrelse.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    var N = K.FIGURER;
    var FRI_MAKS = 6;            /* hoejst saa mange fri OH⁻ i luppen */
    var RAND = 0.8;              /* figurerne holder sig inden for denne radius */

    var FARVE = {
        syre: { bund: "#eef1f4", kant: "#8f99a4", tekst: "#1c1f26" },
        acetat: { bund: "#f4b26b", kant: "#b8742e", tekst: "#2a1a08" },
        oh: { bund: "#5aa9e6", kant: "#2a6fa6", tekst: "#ffffff" },
        na: { bund: "#a78bdb", kant: "#6a4fa3", tekst: "#ffffff" },
        vand: { bund: "#bfe2f7", kant: "#6fa9cc", tekst: "#1c1f26" }
    };

    function Lup() {
        this.nulstil();
    }

    var P = Lup.prototype;

    P.nulstil = function () {
        this.figurer = [];
        this.inde = 0;           /* OH⁻, der er kommet ind */
        this.hop = [];           /* H⁺ paa vej fra syre til OH⁻ */
        for (var i = 0; i < N; i++) {
            var v = i / N * Math.PI * 2 + NK.r(-0.3, 0.3);
            var r = i % 2 ? NK.r(0.2, 0.35) : NK.r(0.5, 0.62);
            this.figurer.push({
                slags: "syre", x: Math.cos(v) * r, y: Math.sin(v) * r,
                vx: 0, vy: 0, fase: "fri", ph: NK.r(0, 6), alfa: 1, reserveret: false
            });
        }
    };

    P.syreTilbage = function () {
        var n = 0;
        this.figurer.forEach(function (f) { if (f.slags === "syre") n++; });
        return n;
    };

    P.friOH = function () {
        var n = 0;
        this.figurer.forEach(function (f) { if (f.slags === "oh" && f.fase === "fri") n++; });
        return n;
    };

    /* k: hvor mange OH⁻-figurer der i alt er loebet ned. Er det faerre
       end foer (en ny proeve), begynder luppen forfra. */
    P.saet = function (k) {
        if (k < this.inde) { this.nulstil(); }
        k = Math.min(k, N + FRI_MAKS);
        while (this.inde < k) {
            this.inde++;
            var x = NK.r(-0.25, 0.25);
            this.figurer.push({ slags: "oh", x: x, y: -1.15, vx: 0, vy: 0.9, fase: "ind", ph: NK.r(0, 6), maal: null, t: 0, alfa: 1 });
            this.figurer.push({ slags: "na", x: x + NK.r(0.15, 0.25) * (Math.random() < 0.5 ? -1 : 1), y: -1.25,
                vx: 0, vy: 0.8, fase: "ind", ph: NK.r(0, 6), t: 0, alfa: 1 });
        }
    };

    /* Straks i ro: alle igangvaerende reaktioner gennemfoeres (bruges,
       naar forsoeget springer frem, fx Vis svaret) */
    P.straks = function () {
        for (var i = 0; i < 40; i++) this.opdater(0.1);
    };

    function naermesteSyre(figurer, f) {
        var bedst = null, bd = 1e9;
        figurer.forEach(function (s) {
            if (s.slags !== "syre" || s.reserveret) return;
            var dx = s.x - f.x, dy = s.y - f.y, d = dx * dx + dy * dy;
            if (d < bd) { bd = d; bedst = s; }
        });
        return bedst;
    }

    P.opdater = function (dt) {
        var mig = this;
        var tid = (this.tid || 0) + dt;
        this.tid = tid;
        var drej = 0.22;           /* omroererens langsomme hvirvel, rad/s */

        this.figurer.forEach(function (f) {
            f.t = (f.t || 0) + dt;
            if (f.fase === "ind") {
                f.y += f.vy * dt;
                if (f.y > -0.55) {
                    f.fase = f.slags === "oh" ? "soeg" : "fri";
                    f.vx = 0; f.vy = 0;
                }
                return;
            }
            if (f.slags === "oh" && f.fase === "soeg") {
                if (!f.maal) {
                    f.maal = naermesteSyre(mig.figurer, f);
                    if (f.maal) f.maal.reserveret = true;
                    else { f.fase = "fri"; return; }
                }
                var dx = f.maal.x - f.x, dy = f.maal.y - f.y;
                var d = Math.sqrt(dx * dx + dy * dy) || 1;
                if (d < 0.2) {
                    f.fase = "hop";
                    f.t = 0;
                    mig.hop.push({ fra: f.maal, til: f, t: 0 });
                    return;
                }
                var fart = 1.3;
                f.x += dx / d * fart * dt;
                f.y += dy / d * fart * dt;
                return;
            }
            if (f.slags === "vand") {
                f.alfa -= dt * 0.8;
                f.y -= dt * 0.05;
                return;
            }
            /* Resten driver rundt med hvirvlen og lidt tilfaeldig bevaegelse */
            if (f.fase === "hop") return;
            var r = Math.sqrt(f.x * f.x + f.y * f.y);
            var vx = -f.y * drej + Math.sin(tid * 0.9 + f.ph * 3.1) * 0.05;
            var vy = f.x * drej + Math.cos(tid * 0.7 + f.ph * 2.3) * 0.05;
            f.x += vx * dt;
            f.y += vy * dt;
            if (r > RAND) {
                f.x *= RAND / r;
                f.y *= RAND / r;
            }
        });

        /* H⁺ hopper fra syren over til OH⁻ */
        this.hop = this.hop.filter(function (h) {
            h.t += dt / 0.45;
            if (h.t >= 1) {
                h.fra.slags = "acetat";
                h.fra.reserveret = false;
                h.til.slags = "vand";
                h.til.fase = "vaek";
                h.til.alfa = 1;
                return false;
            }
            return true;
        });

        /* Figurerne skubber let til hinanden, saa pillerne ikke daekker hinanden */
        var fs = this.figurer;
        for (var i = 0; i < fs.length; i++) {
            var a = fs[i];
            if (a.fase === "ind" || a.slags === "vand") continue;
            for (var j = i + 1; j < fs.length; j++) {
                var b = fs[j];
                if (b.fase === "ind" || b.slags === "vand") continue;
                if ((a.fase === "hop" || a.fase === "soeg") && (b === a.maal)) continue;
                if ((b.fase === "hop" || b.fase === "soeg") && (a === b.maal)) continue;
                var dx = b.x - a.x, dy = (b.y - a.y) * 1.8;
                var minD = storrelse(a) + storrelse(b);
                var d2 = dx * dx + dy * dy;
                if (d2 < minD * minD && d2 > 1e-6) {
                    var d = Math.sqrt(d2), skub = (minD - d) * 0.5 * Math.min(1, dt * 6);
                    a.x -= dx / d * skub; a.y -= dy / d * skub / 1.8;
                    b.x += dx / d * skub; b.y += dy / d * skub / 1.8;
                }
            }
        }

        this.figurer = this.figurer.filter(function (f) { return f.alfa > 0; });
    };

    /* Figurens halve bredde i luppens enheder (til skubbet) */
    function storrelse(f) {
        if (f.slags === "syre" || f.slags === "acetat") return 0.2;
        if (f.slags === "oh") return 0.09;
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

        var mig = this;
        function pos(f) { return { x: cx + f.x * R, y: cy + f.y * R }; }

        /* Tegneordenen: Na⁺ bagerst, saa syren og acetat, saa OH⁻ og vand */
        var orden = { na: 0, acetat: 1, syre: 1, vand: 2, oh: 3 };
        var liste = this.figurer.slice().sort(function (a, b) { return orden[a.slags] - orden[b.slags]; });
        liste.forEach(function (f) {
            var p = pos(f);
            if (f.slags === "syre") pille(ctx, p.x, p.y, "CH₃COOH", px, FARVE.syre, f.alfa);
            else if (f.slags === "acetat") pille(ctx, p.x, p.y, "CH₃COO⁻", px, FARVE.acetat, f.alfa);
            else if (f.slags === "oh") kugle(ctx, p.x, p.y, px * 1.35, "OH⁻", Math.max(12, px - 1), FARVE.oh, f.alfa);
            else if (f.slags === "na") kugle(ctx, p.x, p.y, px * 1.15, "Na⁺", Math.max(12, px - 2), FARVE.na, f.alfa * 0.9);
            else if (f.slags === "vand") kugle(ctx, p.x, p.y, px * 1.35, "H₂O", Math.max(12, px - 2), FARVE.vand, f.alfa);
        });

        /* H⁺ paa vej */
        this.hop.forEach(function (h) {
            var a = pos(h.fra), b = pos(h.til), t = NK.blod(h.t);
            var x = NK.lerp(a.x + px * 2.2, b.x, t), y = NK.lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * px * 1.4;
            kugle(ctx, x, y, px * 0.85, "H⁺", Math.max(12, px - 3), { bund: "#ffffff", kant: "#c9ced4", tekst: "#1c1f26" }, 1);
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
        return mig;
    };

    Lup.FARVE = FARVE;
    Lup.FRI_MAKS = FRI_MAKS;
    NK.Lup = Lup;
}());

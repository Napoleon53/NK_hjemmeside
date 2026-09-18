/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser det, der er i den beholder, luppen sidder paa. Tallene
   kommer fra forsoeget (model.js): hvor meget jern der er opløst, hvor
   meget der er titreret, og om der er overskud af permanganat.

   Scener:
     jern       stålulden: jernatomer i et metalgitter med frie elektroner
     oploes     syren angriber gitteret. Et Fe-atom afgiver to elektroner
                og bliver til Fe²⁺; to H⁺ bliver til H₂, som stiger op.
     titrering  en MnO₄⁻ kommer ind, fem Fe²⁺ afgiver hver én elektron,
                og der dannes fem Fe³⁺ og én Mn²⁺. Naar Fe²⁺ er brugt op,
                bliver MnO₄⁻ i opløsningen. I saltsyre dannes ogsaa Cl₂.
     buret      burettens skala og menisk tæt på

   20 jernatomer i boblen svarer til alt jernet i kolben. Der skal derfor
   fire MnO₄⁻ til, foer alt Fe²⁺ er omsat.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var R = 100;
    var r = NK.r;

    var N_FE = 20;
    var N_MN = 4;
    var OVERFLADE = -62;

    /* Gitteret: tre raekker i bunden */
    var GITTER = [];
    (function () {
        var raekker = [{ y: 78, n: 7, x0: -51 }, { y: 63, n: 6, x0: -42.5 }, { y: 48, n: 7, x0: -51 }];
        raekker.forEach(function (rk) {
            for (var i = 0; i < rk.n; i++) GITTER.push({ x: rk.x0 + i * 17, y: rk.y });
        });
    }());
    /* De oeverste og yderste atomer opløses foerst */
    var ORDEN = GITTER.map(function (g, i) { return i; }).sort(function (a, b) {
        return (GITTER[a].y - GITTER[b].y) || (Math.abs(GITTER[b].x) - Math.abs(GITTER[a].x));
    });

    NK.Mikro = function () {
        this.nulstil();
    };
    NK.Mikro.N_FE = N_FE;

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.scene = "jern";
        this.syre = null;
        this.fe = GITTER.map(function (g, i) {
            return { nr: i, bx: g.x, by: g.y, x: g.x, y: g.y, vx: 0, vy: 0, tilstand: "fast", rad: 8 };
        });
        this.hplus = [];
        this.anioner = [];
        this.h2 = [];
        this.mno4 = [];
        this.mn2 = [];
        this.cl2 = [];
        this.hav = [];
        for (var i = 0; i < 16; i++) this.hav.push({ x: r(-50, 50), y: r(44, 82), vx: r(-30, 30), vy: r(-20, 20) });
        this.oplUr = 0;
        this.haendelse = null;
        this.visV = 0;
        this.s = {};
    };

    P.gitterForskyd = function () {
        return this.scene === "jern" ? -45 : 0;
    };

    /* ----- Tilstanden fra forsoeget -------------------------------------
       s = { scene, syre, opl, reageret, overskud, synlig, klor, V, ryst } */
    P.opdater = function (dt, s) {
        this.s = s;
        if (s.scene !== this.scene) this.scene = s.scene;
        if (s.syre !== this.syre) this.saetSyre(s.syre);
        if (s.scene === "buret") {
            /* Uden udjaevning: lukkes hanen, staar menisken stille med det samme */
            this.visV = s.V;
            return;
        }
        var fart = 1 + 2 * (s.ryst || 0);
        var i, p;

        /* Opløsningen */
        var nOpl = s.scene === "jern" ? 0 : Math.round(N_FE * NK.klamp(s.opl || 0, 0, 1));
        var antal = this.fe.filter(function (f) { return f.tilstand !== "fast"; }).length;
        this.oplUr -= dt * (1 + 3 * (s.oploesFart || 0));
        while (antal < nOpl - 4) { this.oploesEt(true); antal++; }
        if (antal < nOpl && this.oplUr <= 0) { this.oploesEt(false); this.oplUr = 0.3; }

        if (s.scene === "titrering") this.opdaterTitrering(dt, s);

        /* Bevaegelse */
        for (i = 0; i < this.fe.length; i++) {
            p = this.fe[i];
            if (p.tilstand === "fast" || p.optaget) continue;
            this.flyt(p, dt, 14 * fart);
        }
        var alle = [this.hplus, this.anioner, this.mn2, this.mno4, this.cl2];
        for (var l = 0; l < alle.length; l++) {
            for (i = 0; i < alle[l].length; i++) this.flyt(alle[l][i], dt, (l === 0 ? 24 : 12) * fart);
        }
        for (i = this.h2.length - 1; i >= 0; i--) {
            p = this.h2[i];
            p.y -= p.vy * dt;
            p.x += Math.sin(p.y * 0.15 + i) * 10 * dt;
            if (p.y < OVERFLADE) { p.liv -= dt * 3; }
            if (p.liv <= 0) this.h2.splice(i, 1);
        }
        for (i = 0; i < this.hav.length; i++) {
            p = this.hav[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            if (Math.abs(p.x) > 58) p.vx = -p.vx;
            if (p.y < 40 || p.y > 86) p.vy = -p.vy;
        }
    };

    P.saetSyre = function (syre) {
        this.syre = syre;
        this.anioner = [];
        this.hplus = [];
        if (!syre) return;
        var cl = syre === "saltsyre";
        for (var i = 0; i < (cl ? 6 : 4); i++) {
            this.anioner.push({ type: cl ? "cl" : "so4", x: r(-70, 70), y: r(-40, 30), vx: r(-20, 20), vy: r(-20, 20), a: r(0, 6), rad: cl ? 7 : 10 });
        }
        for (i = 0; i < 8; i++) this.hplus.push(this.nyH());
    };

    P.nyH = function () {
        return { x: r(-70, 70), y: r(-50, 20), vx: r(-30, 30), vy: r(-30, 30), rad: 4 };
    };

    P.oploesEt = function (stille) {
        var f = null;
        for (var i = 0; i < ORDEN.length; i++) {
            if (this.fe[ORDEN[i]].tilstand === "fast") { f = this.fe[ORDEN[i]]; break; }
        }
        if (!f) return;
        f.tilstand = "fe2";
        f.rad = 7.5;
        f.vx = r(-20, 20);
        f.vy = -r(25, 45);
        if (!stille && this.hplus.length >= 2) {
            this.hplus.sort(function (a, b) { return ((a.x - f.x) * (a.x - f.x) + (a.y - f.y) * (a.y - f.y)) - ((b.x - f.x) * (b.x - f.x) + (b.y - f.y) * (b.y - f.y)); });
            this.hplus.splice(0, 2);
            this.hplus.push(this.nyH(), this.nyH());
        }
        if (this.h2.length < 8) this.h2.push({ x: f.x, y: f.y - 10, vy: r(40, 60), liv: 1 });
    };

    P.opdaterTitrering = function (dt, s) {
        var mig = this;
        var maalMn = Math.min(N_MN, Math.floor((s.reageret || 0) * N_MN + 0.2));
        if (!this.haendelse && this.mn2.length < maalMn) {
            var fe2 = this.fe.filter(function (f) { return f.tilstand === "fe2"; });
            var m = { x: r(-40, 40), y: OVERFLADE + 12, t: 0, rad: 9, a: r(0, 6) };
            if (!fe2.length) {
                this.mn2.push({ x: m.x, y: m.y, vx: r(-20, 20), vy: r(10, 30), rad: 6 });
            } else {
                fe2.sort(function (a, b) { return (a.x * a.x + (a.y - 10) * (a.y - 10)) - (b.x * b.x + (b.y - 10) * (b.y - 10)); });
                m.maal = fe2.slice(0, 5);
                m.maal.forEach(function (f) { f.optaget = true; });
                this.haendelse = m;
            }
        }
        var h = this.haendelse;
        if (h) {
            h.t += dt;
            var cx = 0, cy = 0;
            h.maal.forEach(function (f) { cx += f.x; cy += f.y; });
            cx /= h.maal.length; cy /= h.maal.length;
            h.x = NK.mod(h.x, cx, 2.5, dt);
            h.y = NK.mod(h.y, NK.klamp(cy, OVERFLADE + 20, 70), 2.5, dt);
            h.maal.forEach(function (f, k) {
                var v = k / h.maal.length * Math.PI * 2 + h.t * 0.6;
                f.x = NK.mod(f.x, h.x + Math.cos(v) * 24, 3, dt);
                f.y = NK.mod(f.y, h.y + Math.sin(v) * 22, 3, dt);
            });
            if (h.t >= 1.8) {
                h.maal.forEach(function (f) {
                    f.tilstand = "fe3";
                    f.optaget = false;
                    f.rad = 7;
                    f.vx = (f.x - h.x) * 2;
                    f.vy = (f.y - h.y) * 2;
                });
                mig.mn2.push({ x: h.x, y: h.y, vx: r(-15, 15), vy: r(-15, 15), rad: 6 });
                this.haendelse = null;
            }
        }

        /* Overskud: MnO₄⁻, der bliver i opløsningen */
        var maalFri = s.synlig && !this.haendelse && this.mn2.length >= maalMn ? NK.klamp(Math.round((s.overskud || 0) * N_MN), 1, 3) : 0;
        while (this.mno4.length < maalFri) this.mno4.push({ x: r(-50, 50), y: OVERFLADE + 10, vx: r(-20, 20), vy: r(10, 30), rad: 9, a: r(0, 6) });
        while (this.mno4.length > maalFri) this.mno4.pop();

        /* Chlorid oxideret til dichlor */
        var maalCl2 = this.syre === "saltsyre" ? Math.min(3, Math.floor((s.klor || 0) * 10 + 0.3)) : 0;
        while (this.cl2.length < maalCl2) {
            this.cl2.push({ x: r(-40, 40), y: r(-20, 50), vx: r(-20, 20), vy: r(-20, 20), rad: 9, a: r(0, 6) });
            if (this.anioner.length > 2) this.anioner.splice(0, 2);
        }
    };

    /* En fri partikel i vaesken */
    P.flyt = function (p, dt, fart) {
        var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        var ret = v > 0.01 ? Math.atan2(p.vy, p.vx) : r(0, 6.28);
        ret += (Math.random() - 0.5) * 6 * dt;
        v = NK.mod(v, fart, 2.5, dt);
        p.vx = Math.cos(ret) * v;
        p.vy = Math.sin(ret) * v;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.a !== undefined) p.a += dt * 0.8;
        var rad = p.rad || 8;
        var d = Math.sqrt(p.x * p.x + p.y * p.y), g = R - rad - 3;
        if (d > g) {
            var nx = p.x / d, ny = p.y / d;
            p.x = nx * g;
            p.y = ny * g;
            var vn = p.vx * nx + p.vy * ny;
            if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
        }
        var y0 = OVERFLADE + rad + 2;
        var fast = this.fe.some(function (f) { return f.tilstand === "fast"; });
        var y1 = fast ? 38 - rad : 92 - rad;
        if (p.y < y0) { p.y = NK.mod(p.y, y0, 8, dt); if (p.vy < 0) p.vy = -p.vy; }
        if (p.y > y1) { p.y = NK.mod(p.y, y1, 8, dt); if (p.vy > 0) p.vy = -p.vy; }
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var FARVER = {
        fe: ["#eef2f6", "#6b737c"], fe2: ["#c6f0d4", "#2f8a5a"], fe3: ["#ffe39a", "#c47f16"],
        h: ["#ffffff", "#8fb2d6"], h2: ["#ffffff", "#aab8c6"], mn: ["#e2b4ff", "#6a1d8f"],
        o: ["#ff9a90", "#b8332a"], s: ["#fff2a0", "#c9a21a"], mn2: ["#ffe3f0", "#c07aa0"],
        cl: ["#f0f8b0", "#8f9a1a"], cl2: ["#f4f7a6", "#9aa51f"]
    };

    function ion(ctx, x, y, rad, farve, tekst, str) {
        NK.kugle(ctx, x, y, rad, farve[0], farve[1]);
        if (!tekst) return;
        ctx.font = "700 " + (str || 5.6) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#16201a";
        ctx.fillText(tekst, x, y + 0.4);
    }

    function tegnMnO4(ctx, x, y, a) {
        for (var k = 0; k < 4; k++) {
            var v = a + k * Math.PI / 2 + (k % 2 ? 0.3 : 0);
            var d = k % 2 ? 6.5 : 7.5;
            NK.kugle(ctx, x + Math.cos(v) * d, y + Math.sin(v) * d, 3.3, FARVER.o[0], FARVER.o[1]);
        }
        NK.kugle(ctx, x, y, 5, FARVER.mn[0], FARVER.mn[1]);
    }

    function tegnSO4(ctx, x, y, a) {
        for (var k = 0; k < 4; k++) {
            var v = a + k * Math.PI / 2;
            NK.kugle(ctx, x + Math.cos(v) * 6, y + Math.sin(v) * 6, 3, FARVER.o[0], FARVER.o[1]);
        }
        NK.kugle(ctx, x, y, 4.2, FARVER.s[0], FARVER.s[1]);
    }

    function tegnH2(ctx, x, y) {
        NK.kugle(ctx, x - 3, y, 3.6, FARVER.h2[0], FARVER.h2[1]);
        NK.kugle(ctx, x + 3, y, 3.6, FARVER.h2[0], FARVER.h2[1]);
    }

    function tegnCl2(ctx, x, y, a) {
        var dx = Math.cos(a) * 4, dy = Math.sin(a) * 4;
        NK.kugle(ctx, x - dx, y - dy, 5, FARVER.cl2[0], FARVER.cl2[1]);
        NK.kugle(ctx, x + dx, y + dy, 5, FARVER.cl2[0], FARVER.cl2[1]);
    }

    P.tegnBuret = function (ctx) {
        var V = this.visV;
        var prMl = 120;
        ctx.fillStyle = "rgba(210, 228, 240, 0.08)";
        ctx.fillRect(-36, -R, 72, 2 * R);
        /* Vaesken under menisken */
        var g = ctx.createLinearGradient(-36, 0, 36, 0);
        g.addColorStop(0, "rgba(70, 8, 84, 0.95)");
        g.addColorStop(0.45, "rgba(128, 34, 148, 0.95)");
        g.addColorStop(1, "rgba(62, 6, 76, 0.95)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(-36, -8);
        ctx.quadraticCurveTo(0, 10, 36, -8);
        ctx.lineTo(36, R);
        ctx.lineTo(-36, R);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(230, 180, 240, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-36, -8);
        ctx.quadraticCurveTo(0, 10, 36, -8);
        ctx.stroke();
        /* Skalaen: streg for hver 0,1 mL, tal for hver hele mL */
        var fra = Math.floor((V - 1) * 10), til = Math.ceil((V + 1) * 10);
        for (var n = fra; n <= til; n++) {
            if (n < 0 || n > 500) continue;
            var y = (n / 10 - V) * prMl;
            if (Math.abs(y) > R) continue;
            var hel = n % 10 === 0, halv = n % 5 === 0;
            ctx.beginPath();
            ctx.moveTo(-36, y);
            ctx.lineTo(-36 + (hel ? 34 : (halv ? 22 : 12)), y);
            ctx.strokeStyle = "rgba(245, 248, 252, 0.95)";
            ctx.lineWidth = hel ? 2 : 1.2;
            ctx.stroke();
            if (hel) NK.tekst(ctx, String(n / 10), 4, y, { font: "700 15px 'Segoe UI', sans-serif", linje: "middle", farve: "#ffffff", kant: true });
        }
        ctx.strokeStyle = "rgba(198, 222, 240, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-37, -R); ctx.lineTo(-37, R);
        ctx.moveTo(37, -R); ctx.lineTo(37, R);
        ctx.stroke();
    };

    /* Tegner boblen b = { x, y, r } med modellen indeni. */
    P.tegn = function (ctx, b, alfa, titel, tid) {
        if (alfa < 0.01) return;
        var k = (b.r - 4) / R;
        var i, p;
        var sc = this.scene;
        ctx.save();
        ctx.globalAlpha = alfa;
        ctx.translate(b.x, b.y);

        ctx.save();
        ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#12151b";
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.scale(k, k);

        if (sc === "buret") {
            this.tegnBuret(ctx);
        } else {
            if (sc !== "jern" && this.syre) {
                ctx.fillStyle = sc === "titrering" && this.s.synlig ? "rgba(240, 130, 200, 0.2)" : "rgba(190, 215, 235, 0.1)";
                ctx.fillRect(-R, OVERFLADE, 2 * R, 2 * R);
                ctx.strokeStyle = "rgba(220, 235, 250, 0.35)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-R, OVERFLADE);
                ctx.lineTo(R, OVERFLADE);
                ctx.stroke();
            }
            var gy = this.gitterForskyd();
            var fast = this.fe.filter(function (f) { return f.tilstand === "fast"; });
            if (fast.length) {
                for (i = 0; i < fast.length; i++) ion(ctx, fast[i].x, fast[i].y + gy, 8, FARVER.fe, "Fe", 6);
                ctx.fillStyle = "rgba(120, 200, 255, 0.85)";
                for (i = 0; i < this.hav.length; i++) {
                    p = this.hav[i];
                    var ny = p.y + gy;
                    var naer = fast.some(function (f) { return Math.abs(f.x - p.x) < 12 && Math.abs(f.y + gy - ny) < 12; });
                    if (!naer) continue;
                    ctx.beginPath();
                    ctx.arc(p.x, ny, 1.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            if (sc !== "jern") {
                /* Tilskuerionerne vises kun, naar eleven har slaaet dem til */
                for (i = 0; NK.visTilskuere && i < this.anioner.length; i++) {
                    p = this.anioner[i];
                    if (p.type === "so4") tegnSO4(ctx, p.x, p.y, p.a);
                    else ion(ctx, p.x, p.y, 7, FARVER.cl, "Cl⁻", 5.4);
                }
                if (sc === "oploes") for (i = 0; i < this.hplus.length; i++) ion(ctx, this.hplus[i].x, this.hplus[i].y, 4, FARVER.h, "H⁺", 4);
                for (i = 0; i < this.h2.length; i++) {
                    ctx.save();
                    ctx.globalAlpha *= NK.klamp(this.h2[i].liv, 0, 1);
                    tegnH2(ctx, this.h2[i].x, this.h2[i].y);
                    ctx.restore();
                }
                for (i = 0; i < this.fe.length; i++) {
                    p = this.fe[i];
                    if (p.tilstand === "fe2") ion(ctx, p.x, p.y, 7.5, FARVER.fe2, "Fe²⁺", 5.2);
                    else if (p.tilstand === "fe3") ion(ctx, p.x, p.y, 7, FARVER.fe3, "Fe³⁺", 5);
                }
                for (i = 0; i < this.mn2.length; i++) ion(ctx, this.mn2[i].x, this.mn2[i].y, 6.5, FARVER.mn2, "Mn²⁺", 4.6);
                for (i = 0; i < this.mno4.length; i++) tegnMnO4(ctx, this.mno4[i].x, this.mno4[i].y, this.mno4[i].a);
                for (i = 0; i < this.cl2.length; i++) tegnCl2(ctx, this.cl2[i].x, this.cl2[i].y, this.cl2[i].a);
                var h = this.haendelse;
                if (h) {
                    tegnMnO4(ctx, h.x, h.y, h.a + h.t);
                    if (h.t > 0.7) {
                        var te = NK.klamp((h.t - 0.7) / 0.9, 0, 1);
                        for (i = 0; i < h.maal.length; i++) {
                            var f = h.maal[i];
                            var ex = NK.lerp(f.x, h.x, te), ey = NK.lerp(f.y, h.y, te) - Math.sin(Math.PI * te) * 6;
                            if (te >= 1) continue;
                            NK.skaer(ctx, ex, ey, 6, "rgba(255, 240, 120, 0.9)", 0.8);
                            NK.kugle(ctx, ex, ey, 2.2, "#fffbd0", "#e0b020");
                        }
                    }
                }
            }
        }
        ctx.restore();

        /* Kant, titel og forklaring */
        ctx.globalAlpha = alfa;
        var ring = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
        ring.addColorStop(0, "#e3e8ee");
        ring.addColorStop(0.5, "#7b8490");
        ring.addColorStop(1, "#c7ced7");
        ctx.strokeStyle = ring;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, b.r - 9, Math.PI * 1.1, Math.PI * 1.45);
        ctx.stroke();

        if (titel) {
            ctx.font = "700 11px 'Segoe UI', sans-serif";
            var bredde = ctx.measureText(titel).width + 16;
            ctx.fillStyle = "rgba(20, 22, 28, 0.92)";
            NK.rundtRekt(ctx, -bredde / 2, -b.r - 10, bredde, 19, 9.5);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
            ctx.lineWidth = 1;
            ctx.stroke();
            NK.tekst(ctx, titel, 0, -b.r - 0.5, { font: "700 11px 'Segoe UI', sans-serif", justering: "center", linje: "middle", farve: "#dfe5ec" });
        }
        this.tegnForklaring(ctx, 0, b.r + 16);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var sc = this.scene, ud = [];
        if (sc === "buret") return ud;
        var har = function (t) { return this.fe.some(function (f) { return f.tilstand === t; }); }.bind(this);
        if (har("fast")) ud.push("fe");
        if (sc === "jern") { ud.push("e"); return ud; }
        if (har("fe2")) ud.push("fe2");
        if (har("fe3")) ud.push("fe3");
        if (sc === "oploes") { ud.push("h"); ud.push("h2"); }
        if (sc === "titrering") {
            if (this.mno4.length || this.haendelse) ud.push("mno4");
            if (this.mn2.length) ud.push("mn2");
            if (this.cl2.length) ud.push("cl2");
        }
        if (this.syre && NK.visTilskuere) ud.push(this.syre === "saltsyre" ? "cl" : "so4");
        return ud;
    };

    var NAVNE = {
        fe: "Fe", e: "Elektron", fe2: "Fe" + NK.ladningHaevet(2), fe3: "Fe" + NK.ladningHaevet(3),
        h: "H" + NK.ladningHaevet(1), h2: "H₂", so4: "SO₄" + NK.ladningHaevet(-2), cl: "Cl" + NK.ladningHaevet(-1),
        mno4: "MnO₄" + NK.ladningHaevet(-1), mn2: "Mn" + NK.ladningHaevet(2), cl2: "Cl₂"
    };
    NK.Mikro.NAVNE = NAVNE;

    P.tegnForklaring = function (ctx, x, y) {
        var typer = this.typer();
        if (!typer.length) return;
        ctx.save();
        ctx.font = "600 10.5px 'Segoe UI', sans-serif";
        var bredder = typer.map(function (t) { return ctx.measureText(NAVNE[t]).width + 30; });
        var raekker = [[]], rb = [0];
        typer.forEach(function (t, i) {
            var n = raekker.length - 1;
            if (rb[n] + bredder[i] > 196 && raekker[n].length) { raekker.push([]); rb.push(0); n++; }
            raekker[n].push(i);
            rb[n] += bredder[i];
        });
        var h = raekker.length * 18 + 6;
        var maks = Math.max.apply(null, rb) + 12;
        ctx.fillStyle = "rgba(20, 22, 28, 0.85)";
        NK.rundtRekt(ctx, x - maks / 2, y, maks, h, 9);
        ctx.fill();
        raekker.forEach(function (rk, ri) {
            var cx = x - rb[ri] / 2;
            var cy = y + 12 + ri * 18;
            rk.forEach(function (i) {
                var t = typer[i];
                var ix = cx + 11;
                ctx.save();
                ctx.translate(ix, cy);
                ctx.scale(0.8, 0.8);
                if (t === "fe") NK.kugle(ctx, 0, 0, 6, FARVER.fe[0], FARVER.fe[1]);
                else if (t === "e") NK.kugle(ctx, 0, 0, 2.5, "#d6f0ff", "#3a9ad8");
                else if (t === "fe2") NK.kugle(ctx, 0, 0, 6, FARVER.fe2[0], FARVER.fe2[1]);
                else if (t === "fe3") NK.kugle(ctx, 0, 0, 6, FARVER.fe3[0], FARVER.fe3[1]);
                else if (t === "h") NK.kugle(ctx, 0, 0, 4, FARVER.h[0], FARVER.h[1]);
                else if (t === "h2") tegnH2(ctx, 0, 0);
                else if (t === "so4") tegnSO4(ctx, 0, 0, 0.4);
                else if (t === "cl") NK.kugle(ctx, 0, 0, 6, FARVER.cl[0], FARVER.cl[1]);
                else if (t === "mno4") tegnMnO4(ctx, 0, 0, 0.4);
                else if (t === "mn2") NK.kugle(ctx, 0, 0, 5.5, FARVER.mn2[0], FARVER.mn2[1]);
                else if (t === "cl2") tegnCl2(ctx, 0, 0, 0);
                ctx.restore();
                NK.tekst(ctx, NAVNE[t], cx + 22, cy + 0.5, { font: "600 10.5px 'Segoe UI', sans-serif", linje: "middle", farve: "#cfd6de" });
                cx += bredder[i];
            });
        });
        ctx.restore();
    };

    /* Til selvtesten */
    P.taelFe = function () {
        var ud = { fast: 0, fe2: 0, fe3: 0 };
        this.fe.forEach(function (f) { ud[f.tilstand]++; });
        ud.mn2 = this.mn2.length;
        ud.mno4 = this.mno4.length;
        return ud;
    };
}());

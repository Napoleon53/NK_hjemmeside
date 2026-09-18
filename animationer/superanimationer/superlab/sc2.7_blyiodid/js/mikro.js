/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Ionerne i baegerglasset i en cirkel med radius 100 enheder. Modellen
   er ikke pynt: ionerne er talt ud fra masserne, og krystallen har
   praecis saa mange PbI2-enheder, som forsoeget siger, der er
   bundfald til.

   Pb(NO3)2:   0,05 g giver 1 Pb2+ og 2 NO3-, der falder ned i vandet.
   KI:         0,05 g giver 2 K+ og 2 I-.
   Bundfald:   en fri Pb2+ og to frie I- samles til en PbI2-enhed i
               krystallen nederst. Krystallen er lagdelt som i PbI2:
               et lag I-, et lag Pb2+ og et lag I-.
   Opvarmning: stiger temperaturen, rives den sidst dannede enhed loes,
               og de tre ioner svoemmer ud i vandet igen.
   K+ og NO3- er tilskuerioner og bliver i opløsningen hele tiden.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var M = NK.Model;
    var R = 100;
    var r = NK.r;

    var RADIUS = { pb: 8.5, i: 9.5, k: 6.5, no3: 7 };
    var FART = { pb: 15, i: 16, k: 22, no3: 20 };

    /* Pladserne i krystallen for enhed k: I- oeverst, Pb2+ i midten og
       I- nederst */
    function plads(k) {
        var x = -46 + 17 * k;
        return { iTop: { x: x, y: 38 }, pb: { x: x + 8.5, y: 51 }, iBund: { x: x, y: 64 } };
    }
    NK.MikroPlads = plads;

    NK.Mikro = function () {
        this.nulstil();
    };

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.ioner = [];
        this.enheder = [];
        this.blink = [];
        this.T = 20;
        this.maal = 0;
        this.omroer = false;
    };

    P.toem = function () {
        this.nulstil();
    };

    P.ny = function (type, x, y, vx, vy) {
        var p = { type: type, x: x, y: y, vx: vx || 0, vy: vy || 0, rad: RADIUS[type], alfa: 0, enhed: null, falder: false };
        this.ioner.push(p);
        return p;
    };

    P.antal = function (type) {
        var n = 0;
        for (var i = 0; i < this.ioner.length; i++) if (this.ioner[i].type === type) n++;
        return n;
    };

    /* ----- Tilsaetninger ------------------------------------------------ */
    /* Nye ioner daler ind oppefra og spredes, foer de bevaeger sig frit */
    P.falderInd = function (type) {
        var p = this.ny(type, r(-40, 40), r(-90, -78), r(-40, 40), r(50, 80));
        p.falder = true;
        p.stop = r(-55, 10);
        return p;
    };

    P.tilfoejPb = function (portioner) {
        for (var i = 0; i < portioner; i++) {
            this.falderInd("pb");
            this.falderInd("no3");
            this.falderInd("no3");
        }
    };

    P.tilfoejKI = function (portioner) {
        for (var i = 0; i < portioner * 2; i++) {
            this.falderInd("k");
            this.falderInd("i");
        }
    };

    /* ----- Til resten af animationen ------------------------------------ */
    P.muligeEnheder = function () {
        return Math.min(this.antal("pb"), Math.floor(this.antal("i") / 2));
    };

    P.fastAntal = function () {
        var n = 0;
        for (var i = 0; i < this.enheder.length; i++) if (this.enheder[i].klar) n++;
        return n;
    };

    P.travl = function () {
        for (var i = 0; i < this.enheder.length; i++) if (!this.enheder[i].klar) return true;
        return this.enheder.length !== this.maal;
    };

    /* ----- Tidens gang --------------------------------------------------- */
    function naermeste(liste, pt, filter) {
        var bedst = null, afst = Infinity;
        for (var i = 0; i < liste.length; i++) {
            var q = liste[i];
            if (!filter(q)) continue;
            var d = (q.x - pt.x) * (q.x - pt.x) + (q.y - pt.y) * (q.y - pt.y);
            if (d < afst) { afst = d; bedst = q; }
        }
        return bedst;
    }

    function fri(type) {
        return function (c) { return c.type === type && !c.enhed && !c.falder; };
    }

    /* s = { T, maal, omroer } */
    P.opdater = function (dt, s) {
        var i, j, p, q;
        var liste = this.ioner;
        this.T = s.T;
        this.maal = s.maal;
        this.omroer = !!s.omroer;
        var varme = 0.55 + s.T / 80;
        var omroer = s.omroer ? 1 : 0;
        var mig = this;

        /* Krystallen: saa mange enheder skal der vaere */
        var dannes = 0;
        for (i = 0; i < this.enheder.length; i++) if (!this.enheder[i].klar) dannes++;
        if (this.enheder.length < s.maal && dannes < 2) {
            var k = this.enheder.length;
            var pl = plads(k);
            var pb = naermeste(liste, pl.pb, fri("pb"));
            var i1 = naermeste(liste, pl.iTop, fri("i"));
            var i2 = i1 ? naermeste(liste, pl.iBund, function (c) { return c !== i1 && fri("i")(c); }) : null;
            if (pb && i1 && i2) {
                var e = { k: k, pb: pb, i1: i1, i2: i2, klar: false, t: 0 };
                pb.enhed = e; i1.enhed = e; i2.enhed = e;
                this.enheder.push(e);
            }
        } else if (this.enheder.length > s.maal) {
            var sidste = this.enheder.pop();
            var sp = plads(sidste.k);
            [sidste.pb, sidste.i1, sidste.i2].forEach(function (ion) {
                ion.enhed = null;
                var v = r(-Math.PI * 0.9, -Math.PI * 0.1);
                ion.vx = Math.cos(v) * 45;
                ion.vy = Math.sin(v) * 45;
            });
            this.blink.push({ x: sp.pb.x, y: sp.pb.y, liv: 1, farve: "190, 225, 255" });
        }

        /* Ionerne i krystallen, og dem paa vej derhen */
        this.enheder.forEach(function (e) {
            var pl2 = plads(e.k);
            var par = [[e.pb, pl2.pb], [e.i1, pl2.iTop], [e.i2, pl2.iBund]];
            var taet = true;
            e.t += dt;
            par.forEach(function (pp, n) {
                var ion = pp[0], m = pp[1];
                ion.alfa = Math.min(1, ion.alfa + dt * 3);
                if (e.klar) {
                    var ryst = 0.5 * varme;
                    ion.x = m.x + Math.sin(mig.tidT * 23 + e.k * 1.7 + n * 2.1) * ryst;
                    ion.y = m.y + Math.cos(mig.tidT * 19 + e.k * 2.3 + n * 1.3) * ryst;
                    return;
                }
                ion.x = NK.mod(ion.x, m.x, 2.8, dt);
                ion.y = NK.mod(ion.y, m.y, 2.8, dt);
                if (Math.abs(ion.x - m.x) + Math.abs(ion.y - m.y) > 2.5) taet = false;
            });
            if (!e.klar && (taet || e.t > 3)) {
                e.klar = true;
                mig.blink.push({ x: pl2.pb.x, y: pl2.pb.y, liv: 1, farve: "255, 215, 80" });
            }
        });
        this.tidT = (this.tidT || 0) + dt;

        /* Krystallens omrids: frie ioner holdes ude af det */
        var kr = this.krystalRamme();

        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            p.alfa = Math.min(1, p.alfa + dt * 3);
            if (p.enhed) continue;
            if (p.falder) {
                p.y += p.vy * dt;
                p.x += p.vx * dt;
                if (p.y > p.stop) { p.falder = false; p.vy *= 0.3; }
                continue;
            }

            /* Varmebevaegelse: retningen skifter tilfaeldigt, farten soeger
               mod typens fart. Varme og omroering saetter fart paa. */
            var maal = FART[p.type] * varme * (1 + 0.6 * omroer);
            var fart = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            var retning = fart > 0.01 ? Math.atan2(p.vy, p.vx) : r(0, 6.28);
            retning += (Math.random() - 0.5) * 6 * dt;
            fart = NK.mod(fart, maal, 2.5, dt);
            p.vx = Math.cos(retning) * fart;
            p.vy = Math.sin(retning) * fart;

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            var d = Math.sqrt(p.x * p.x + p.y * p.y);
            var graense = R - p.rad - 3;
            if (d > graense) {
                var nx = p.x / d, ny = p.y / d;
                p.x = nx * graense;
                p.y = ny * graense;
                var vn = p.vx * nx + p.vy * ny;
                if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
            }
            if (kr && p.x > kr.x0 - p.rad && p.x < kr.x1 + p.rad && p.y > kr.y0 - p.rad) {
                p.y = NK.mod(p.y, kr.y0 - p.rad - 1, 10, dt);
                if (p.vy > 0) p.vy = -p.vy;
            }
        }

        /* Frie ioner skubber til hinanden */
        for (i = 0; i < liste.length; i++) {
            p = liste[i];
            if (p.enhed || p.falder) continue;
            for (j = i + 1; j < liste.length; j++) {
                q = liste[j];
                if (q.enhed || q.falder) continue;
                var dx = p.x - q.x, dy = p.y - q.y;
                var min = p.rad + q.rad + 0.5;
                var dd = dx * dx + dy * dy;
                if (dd >= min * min) continue;
                var afst = Math.sqrt(dd) || 0.01;
                var ux = dx / afst, uy = dy / afst;
                var skub = (min - afst) * 0.5;
                p.x += ux * skub; p.y += uy * skub;
                q.x -= ux * skub; q.y -= uy * skub;
            }
        }

        for (i = this.blink.length - 1; i >= 0; i--) {
            this.blink[i].liv -= dt * 2.2;
            if (this.blink[i].liv <= 0) this.blink.splice(i, 1);
        }
    };

    /* Rektanglet om krystallens enheder (eller null) */
    P.krystalRamme = function () {
        if (!this.enheder.length) return null;
        var n = this.enheder.length;
        return { x0: -46 - 14, x1: -46 + 17 * (n - 1) + 8.5 + 14, y0: 38 - 13, y1: 64 + 13 };
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var UDSEENDE = {
        pb:  { lys: "#c3cbd4", moerk: "#3a424b", tekst: "#ffffff" },
        i:   { lys: "#d3b3f7", moerk: "#5a2d8f", tekst: "#ffffff" },
        k:   { lys: "#ffd6b3", moerk: "#b5652b", tekst: "#2e1204" },
        no3: { lys: "#dcebd0", moerk: "#6b8a5a", tekst: "#16210f" }
    };

    var ETIKET = {
        pb: M.formel("Pb2+"), i: M.formel("I-"), k: M.formel("K+"), no3: M.formel("NO3-"),
        pbi2: M.formel("PbI2", true)
    };
    NK.Mikro.ETIKET = ETIKET;

    function etiket(ctx, tekst, x, y, farve, stoerrelse) {
        ctx.font = "700 " + stoerrelse + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = farve;
        ctx.fillText(tekst, x, y + 0.5);
    }

    function tegnIon(ctx, p) {
        var u = UDSEENDE[p.type];
        ctx.globalAlpha = NK.klamp(p.alfa, 0, 1);
        NK.kugle(ctx, p.x, p.y, p.rad, u.lys, u.moerk);
        var st = p.type === "no3" ? 5.2 : (p.type === "i" ? 7 : 6);
        etiket(ctx, ETIKET[p.type], p.x, p.y, u.tekst, st);
        ctx.globalAlpha = 1;
    }

    /* Tegner boblen b = { x, y, r } med modellen indeni. */
    P.tegn = function (ctx, b, alfa, titel, tid) {
        if (alfa < 0.01) return;
        var k = (b.r - 4) / R;
        var i, p;
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

        /* Vandet: blaaligt, lidt varmere i farven, naar det er varmt */
        ctx.fillStyle = "rgba(90, 160, 220, 0.16)";
        ctx.fillRect(-R, -R, 2 * R, 2 * R);
        var varm = NK.klamp((this.T - 20) / 80, 0, 1);
        if (varm > 0.01) {
            ctx.fillStyle = "rgba(255, 120, 60, " + (0.07 * varm).toFixed(3) + ")";
            ctx.fillRect(-R, -R, 2 * R, 2 * R);
        }

        /* Krystallen */
        var kr = this.krystalRamme();
        if (kr) {
            var klare = this.fastAntal();
            ctx.save();
            ctx.globalAlpha = 0.35 + 0.4 * NK.klamp(klare / Math.max(1, this.enheder.length), 0, 1);
            ctx.fillStyle = "rgba(255, 200, 30, 0.28)";
            NK.rundtRekt(ctx, kr.x0, kr.y0, kr.x1 - kr.x0, kr.y1 - kr.y0, 8);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 214, 70, 0.75)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.restore();
        }

        for (i = 0; i < this.ioner.length; i++) {
            p = this.ioner[i];
            if (!p.enhed) tegnIon(ctx, p);
        }
        for (i = 0; i < this.ioner.length; i++) {
            p = this.ioner[i];
            if (p.enhed) tegnIon(ctx, p);
        }

        for (i = 0; i < this.blink.length; i++) {
            var bl = this.blink[i];
            NK.skaer(ctx, bl.x, bl.y, 14 + 12 * (1 - bl.liv), "rgba(" + bl.farve + ", 0.9)", bl.liv * 0.9);
        }
        ctx.restore();

        /* Kant og genskin */
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
        this.tegnForklaring(ctx, 0, b.r + 12);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var ud = [], set = {};
        for (var i = 0; i < this.ioner.length; i++) set[this.ioner[i].type] = true;
        ["pb", "i", "k", "no3"].forEach(function (t) { if (set[t]) ud.push(t); });
        if (this.fastAntal() > 0) ud.push("pbi2");
        return ud;
    };

    P.tegnForklaring = function (ctx, x, y) {
        var typer = this.typer();
        if (!typer.length) return;
        ctx.save();
        ctx.font = "600 10px 'Segoe UI', sans-serif";
        var bredder = typer.map(function (t) { return ctx.measureText(ETIKET[t]).width + 28; });
        var raekker = [[]], rb = [0];
        typer.forEach(function (t, i) {
            var n = raekker.length - 1;
            if (rb[n] + bredder[i] > 236 && raekker[n].length) { raekker.push([]); rb.push(0); n++; }
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
                var ix = cx + 10;
                if (t === "pbi2") {
                    ctx.fillStyle = "rgba(255, 200, 30, 0.45)";
                    NK.rundtRekt(ctx, ix - 8, cy - 6, 16, 12, 3);
                    ctx.fill();
                    NK.kugle(ctx, ix - 3, cy, 3.4, UDSEENDE.pb.lys, UDSEENDE.pb.moerk);
                    NK.kugle(ctx, ix + 3.5, cy, 3.8, UDSEENDE.i.lys, UDSEENDE.i.moerk);
                } else {
                    NK.kugle(ctx, ix, cy, 5, UDSEENDE[t].lys, UDSEENDE[t].moerk);
                }
                NK.tekst(ctx, ETIKET[t], cx + 20, cy + 0.5, { font: "600 10px 'Segoe UI', sans-serif", linje: "middle", farve: "#cfd6de" });
                cx += bredder[i];
            });
        });
        ctx.restore();
    };
}());

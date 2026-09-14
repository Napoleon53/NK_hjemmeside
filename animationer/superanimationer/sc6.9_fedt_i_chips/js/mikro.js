/* =====================================================================
   mikro.js - partikelniveauet i zoomboblen

   Boblen viser det, der er i den beholder, luppen sidder paa. Den er
   ikke pynt: antallet af opløste fedtmolekyler, hvor mange der bliver i
   filteret, og hvor meget opløsningsmiddel der er fordampet, kommer fra
   tallene i forsoeget (model.js).

   Scener:
     chips        chipsstykker: stivelseskaeder med fedtstof imellem og
                  et lille saltkrystal. Knusningen deler dem i tre stykker.
     ekstraktion  opløsningsmidlet er kommet i. Heptan omgiver fedtet og
                  traekker det ud. Vand holder sammen med sig selv og
                  opløser kun saltet (Na⁺ og Cl⁻).
     filter       filtrerpapiret. Chipsstykkerne bliver ovenpaa, vaesken
                  loeber igennem porerne.
     filtrat      opløsningen under tragten.
     inddamp      opløsningsmidlet forlader overfladen, fedtet bliver.
     rest         det, der er tilbage i glasset.

   Hvert fedtmolekyle har en fast plads i raekkefoelgen (de yderste
   opløses foerst), saa det er de samme molekyler, man foelger hele vejen.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var R = 100;
    var r = NK.r;

    var N_FEDT = 10;
    var N_HEPTAN = 20;
    var N_VAND = 30;
    var FIBER = { y0: 24, y1: 40 };
    var PORER = [-62, -26, 10, 46, 76];
    var OVERFLADE = -66;

    /* Chipsstykket: stivelseskaeder (x, y, vinkel, stykke) */
    var KAEDER = [
        [-30, -24, 0.25, 0], [8, -30, -0.15, 2], [40, -12, 0.6, 1], [-42, 6, -0.45, 0],
        [-2, -2, 0.12, 2], [32, 16, -0.25, 1], [-22, 32, 0.35, 0], [16, 40, -0.3, 1]
    ];
    /* Fedtmolekylernes pladser, sorteret fra yderst til inderst */
    var FEDTPLADS = [
        [50, -2], [-54, -12], [0, -48], [-4, 54], [38, 34], [-40, 26], [24, -22], [-18, -12], [16, 22], [-8, 14]
    ];
    var SALTPLADS = [-34, 46];
    var STYKKE_RETNING = [[-1, -0.35], [1, -0.15], [0.1, -1]];

    function naermesteStykke(x, y) {
        var bedst = 0, afst = Infinity;
        KAEDER.forEach(function (k) {
            var d = (k[0] - x) * (k[0] - x) + (k[1] - y) * (k[1] - y);
            if (d < afst) { afst = d; bedst = k[3]; }
        });
        return bedst;
    }

    NK.Mikro = function () {
        this.nulstil();
    };
    NK.Mikro.N_FEDT = N_FEDT;

    var P = NK.Mikro.prototype;

    P.nulstil = function () {
        this.scene = "chips";
        this.midl = null;
        this.fedt = FEDTPLADS.map(function (f, i) {
            return {
                nr: i, bx: f[0], by: f[1], stykke: naermesteStykke(f[0], f[1]),
                x: f[0], y: f[1], vx: 0, vy: 0, a: r(-0.5, 0.5), va: r(-0.8, 0.8),
                tilstand: "bundet", slip: 0, rad: 11
            };
        });
        this.midler = [];
        this.ioner = [];
        this.fordamper = [];
        this.saltFri = false;
        this.knust = 0;
        this.s = {};
    };

    /* ----- Tilstanden fra forsoeget -------------------------------------
       s = { scene, midl, knust, fedtOploest, saltOploest, tilbage,
             filtreret, skyllet, fordampet, roer } */
    P.opdater = function (dt, s) {
        this.s = s;
        if (s.scene !== this.scene) this.skiftScene(s.scene);
        if (s.midl !== this.midl) this.saetMidl(s.midl);
        this.knust = NK.mod(this.knust, s.knust || 0, 3, dt);

        var nOpl = Math.round(N_FEDT * NK.klamp(s.fedtOploest || 0, 0, 1));
        var nTilbage = Math.round(nOpl * (s.tilbage || 0));
        var fart = 1 + 3 * (s.roer || 0);
        var mig = this;
        var i, p;

        /* Fedtet */
        this.fedt.forEach(function (f, i) {
            var oploest = i < nOpl;
            var holdtTilbage = i >= nOpl - nTilbage && oploest;
            if (!oploest) f.tilstand = "bundet";
            else if (f.tilstand === "bundet") { f.tilstand = "fri"; f.slip = 0; mig.ledsag(f); }
            f.holdtTilbage = holdtTilbage;
        });

        for (i = 0; i < this.fedt.length; i++) {
            p = this.fedt[i];
            p.a += p.va * dt * 0.4 * fart;
            if (p.tilstand === "bundet") {
                var bp = this.bundetPlads(p);
                p.x = NK.mod(p.x, bp.x, 6, dt);
                p.y = NK.mod(p.y, bp.y, 6, dt);
                continue;
            }
            p.slip = Math.min(1, p.slip + dt * 1.2);
            this.flytVaeskepartikel(p, dt, 16 * fart, i, true);
        }

        /* Opløsningsmidlet */
        var nMidl = this.midler.length;
        var nTilbageMidl = this.scene === "inddamp" || this.scene === "rest"
            ? Math.ceil(nMidl * (1 - NK.klamp(this.scene === "rest" ? 1 : (s.fordampet || 0), 0, 1)))
            : nMidl;
        for (i = 0; i < this.midler.length; i++) {
            p = this.midler[i];
            if (i >= nTilbageMidl && !p.borte) {
                p.borte = true;
                p.folger = null;
                this.fordamper.push({ type: p.type, x: p.x, y: p.y, vx: r(-15, 15), vy: -r(70, 110), a: p.a, liv: 1 });
            }
            if (i < nTilbageMidl && p.borte) {
                p.borte = false;
                p.x = r(-50, 50);
                p.y = this.overflade() + 20;
            }
            if (p.borte) continue;
            if (p.folger && p.folger.tilstand !== "bundet") {
                var f = p.folger;
                var v = f.a * 0.6 + p.ledNr * Math.PI + 0.8;
                var mx = f.x + Math.cos(v) * 17, my = f.y + Math.sin(v) * 13;
                p.x = NK.mod(p.x, mx, 3 + 3 * f.slip, dt);
                p.y = NK.mod(p.y, my, 3 + 3 * f.slip, dt);
                p.a = NK.mod(p.a, v + Math.PI / 2, 2, dt);
                continue;
            }
            this.flytVaeskepartikel(p, dt, (p.type === "vand" ? 14 : 22) * fart, i, false);
            if (p.type === "vand") this.skubVaek(p, dt);
        }

        for (i = this.fordamper.length - 1; i >= 0; i--) {
            p = this.fordamper[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.a += dt * 2;
            p.liv -= dt * 1.1;
            if (p.liv <= 0 || p.y < -R) this.fordamper.splice(i, 1);
        }

        /* Saltet: kun vand opløser det */
        var saltFri = this.midl === "vand" && (s.saltOploest || 0) > 0.5 && this.scene !== "chips";
        if (saltFri && !this.saltFri) this.frigoerSalt();
        if (!saltFri && this.saltFri && this.midl !== "vand") { this.ioner = []; this.saltFri = false; }
        for (i = 0; i < this.ioner.length; i++) {
            p = this.ioner[i];
            if (this.scene === "rest" || (this.scene === "inddamp" && (s.fordampet || 0) > 0.85)) {
                var kx = (p.nr % 2 === 0 ? -7 : 7), ky = (p.nr < 2 ? 82 : 68);
                p.x = NK.mod(p.x, kx, 2, dt);
                p.y = NK.mod(p.y, ky, 2, dt);
            } else {
                this.flytVaeskepartikel(p, dt, 12 * fart, i + 50, false);
            }
        }
    };

    P.overflade = function () {
        if (this.scene === "inddamp") return NK.lerp(OVERFLADE, 76, NK.klamp(this.s.fordampet || 0, 0, 1));
        if (this.scene === "rest") return 90;
        return OVERFLADE;
    };

    /* Hvor et bundet fedtmolekyle sidder */
    P.bundetPlads = function (f) {
        var st = this.stykkePlads(f.stykke);
        var bx = f.bx, by = f.by;
        if (this.scene === "filter") { bx *= 0.85; by = -14 + (by - 8) * 0.45; }
        return { x: bx + st.x, y: by + st.y };
    };

    P.stykkePlads = function (nr) {
        var k = this.knust * (this.scene === "filter" ? 0.4 : 1);
        var d = STYKKE_RETNING[nr];
        var t = this.s.roer ? Math.sin(Date.now() / 1000 * 3 + nr) * 3 * this.s.roer : 0;
        return { x: d[0] * 34 * k + t, y: d[1] * 26 * k + (this.scene === "ekstraktion" ? 6 : 0) };
    };

    /* En fri partikel i vaesken. Hvor maa den vaere? */
    P.flytVaeskepartikel = function (p, dt, fart, nr, erFedt) {
        var sc = this.scene;
        var y0 = -R, y1 = R;
        if (sc === "filter") {
            var gennem = erFedt ? (!p.holdtTilbage && (this.s.filtreret || 0) >= ((nr * 0.618) % 1) * 0.9 + 0.05)
                : ((this.s.filtreret || 0) >= ((nr * 0.381) % 1) * 0.9 + 0.05) || (this.s.skyllet && nr % 4 === 0);
            if (erFedt && p.holdtTilbage) gennem = false;
            if (gennem && p.y < FIBER.y1 + 4) {
                /* Falder ned gennem den naermeste pore */
                var pore = PORER.reduce(function (a, b) { return Math.abs(b - p.x) < Math.abs(a - p.x) ? b : a; });
                p.x = NK.mod(p.x, pore, 5, dt);
                p.y += 70 * dt;
                p.vx = 0; p.vy = 40;
                return;
            }
            if (gennem) { y0 = FIBER.y1 + 8; y1 = 90; }
            else if (erFedt && p.holdtTilbage) { y0 = -30; y1 = FIBER.y0 - 8; }
            else { y0 = -88; y1 = FIBER.y0 - 8; }
        } else if (sc === "filtrat" || sc === "inddamp") {
            y0 = this.overflade() + 8;
            y1 = 90;
        } else if (sc === "rest") {
            if (erFedt) {
                var lag = this.lagPlads(nr);
                p.x = NK.mod(p.x, lag.x, 2.5, dt);
                p.y = NK.mod(p.y, lag.y, 2.5, dt);
                return;
            }
        }
        if (erFedt && sc === "inddamp" && (this.s.fordampet || 0) > 0.8) {
            var lp = this.lagPlads(nr);
            var t = ((this.s.fordampet || 0) - 0.8) / 0.2;
            p.x = NK.mod(p.x, lp.x, 3 * t, dt);
            p.y = NK.mod(p.y, lp.y, 3 * t, dt);
        }

        var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        var ret = v > 0.01 ? Math.atan2(p.vy, p.vx) : r(0, 6.28);
        ret += (Math.random() - 0.5) * 6 * dt;
        v = NK.mod(v, fart, 2.5, dt);
        p.vx = Math.cos(ret) * v;
        p.vy = Math.sin(ret) * v;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.va) p.a += p.va * dt;

        var rad = p.rad || 8;
        var d = Math.sqrt(p.x * p.x + p.y * p.y), g = R - rad - 3;
        if (d > g) {
            var nx = p.x / d, ny = p.y / d;
            p.x = nx * g;
            p.y = ny * g;
            var vn = p.vx * nx + p.vy * ny;
            if (vn > 0) { p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny; }
        }
        if (p.y < y0) { p.y = NK.mod(p.y, y0, 8, dt); if (p.vy < 0) p.vy = -p.vy; }
        if (p.y > y1) { p.y = NK.mod(p.y, y1, 8, dt); if (p.vy > 0) p.vy = -p.vy; }
    };

    /* Fedtet samler sig i bunden, naar opløsningsmidlet er vaek */
    P.lagPlads = function (nr) {
        var i = this.fedt.filter(function (f) { return f.tilstand !== "bundet" && !f.holdtTilbage; }).indexOf(this.fedt[nr]);
        if (i < 0) i = nr;
        var raekke = Math.floor(i / 5), plads = i % 5;
        return { x: -44 + plads * 22 + (raekke % 2) * 11, y: 80 - raekke * 14 };
    };

    /* Vand holder sig vaek fra fedtet */
    P.skubVaek = function (w, dt) {
        for (var i = 0; i < this.fedt.length; i++) {
            var f = this.fedt[i];
            var dx = w.x - f.x, dy = w.y - f.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d < 20 && d > 0.01) {
                w.x += dx / d * (20 - d) * Math.min(1, dt * 8);
                w.y += dy / d * (20 - d) * Math.min(1, dt * 8);
            }
        }
        var st = [0, 1, 2].map(this.stykkePlads, this);
        if (this.scene === "ekstraktion" || this.scene === "chips") {
            for (var k = 0; k < st.length; k++) {
                var sx = w.x - st[k].x, sy = w.y - (st[k].y + 8), sd = Math.sqrt(sx * sx + sy * sy);
                if (sd < 34 && sd > 0.01 && Math.random() < 0.02) { w.vx += sx / sd * 20; w.vy += sy / sd * 20; }
            }
        }
    };

    /* To heptanmolekyler foelger et fedtmolekyle, der er opløst */
    P.ledsag = function (f) {
        if (this.midl !== "heptan") return;
        var frie = this.midler.filter(function (m) { return !m.folger && !m.borte; });
        frie.sort(function (a, b) { return (a.x - f.x) * (a.x - f.x) + (a.y - f.y) * (a.y - f.y) - ((b.x - f.x) * (b.x - f.x) + (b.y - f.y) * (b.y - f.y)); });
        for (var i = 0; i < Math.min(2, frie.length); i++) {
            frie[i].folger = f;
            frie[i].ledNr = i;
        }
    };

    P.frigoerSalt = function () {
        this.saltFri = true;
        var st = this.stykkePlads(0);
        this.ioner = [];
        for (var i = 0; i < 4; i++) {
            this.ioner.push({
                type: i % 2 === 0 ? "na" : "cl", nr: i,
                x: SALTPLADS[0] + st.x + r(-4, 4), y: SALTPLADS[1] + st.y + r(-4, 4),
                vx: r(-20, 20), vy: r(-30, -10), rad: i % 2 === 0 ? 6 : 8
            });
        }
    };

    P.saetMidl = function (midl) {
        this.midl = midl;
        this.midler = [];
        this.fordamper = [];
        if (!midl) return;
        var n = midl === "vand" ? N_VAND : N_HEPTAN;
        for (var i = 0; i < n; i++) {
            var x, y, t = 0;
            do { x = r(-88, 88); y = r(-88, 88); t++; } while ((x * x + y * y > 86 * 86 || (Math.abs(x) < 50 && Math.abs(y) < 50)) && t < 50);
            this.midler.push({ type: midl, x: x, y: y, vx: r(-20, 20), vy: r(-20, 20), a: r(0, 6.28), va: r(-1, 1), rad: midl === "vand" ? 6 : 12 });
        }
        var mig = this;
        this.fedt.forEach(function (f) { if (f.tilstand !== "bundet") mig.ledsag(f); });
    };

    P.skiftScene = function (navn) {
        var fra = this.scene;
        this.scene = navn;
        var mig = this;
        if (navn === "filter" && fra !== "filter") {
            this.midler.forEach(function (m) { if (!m.folger) m.y = Math.min(m.y, 10); });
            this.fedt.forEach(function (f) { if (f.tilstand !== "bundet") f.y = Math.min(f.y, 0); });
            this.ioner.forEach(function (p) { p.y = Math.min(p.y, 10); });
        }
        if (navn === "filtrat") {
            this.midler.forEach(function (m) { m.y = r(-50, 80); });
            this.fedt.forEach(function (f) { if (f.tilstand !== "bundet") f.y = r(-40, 80); });
        }
        if (navn === "chips") this.fedt.forEach(function (f) { f.tilstand = "bundet"; });
        if (fra === "chips" && navn !== "chips") this.fedt.forEach(function (f) { var b = mig.bundetPlads(f); f.x = b.x; f.y = b.y; });
    };

    /* Til selvtesten: hvor mange fedtmolekyler er i hver tilstand? */
    P.taelFedt = function () {
        var ud = { bundet: 0, fri: 0, tilbage: 0 };
        this.fedt.forEach(function (f) {
            if (f.tilstand === "bundet") ud.bundet++;
            else if (f.holdtTilbage) ud.tilbage++;
            else ud.fri++;
        });
        return ud;
    };

    /* ================================================================
       TEGNING
       ================================================================ */
    var FARVER = {
        fedtHale: "#f4c84a", fedtHaleMoerk: "#b98a1c", glycerol: "#e8704f",
        stivelse: "#efe6cf", stivelseKant: "#b8a77c",
        heptan: "#b9c7d4", heptanPrik: "#e4ebf1",
        oxygen: "#e2574c", brint: "#f4f6f8",
        na: ["#d8c2ff", "#7d55c7"], cl: ["#b8f0b0", "#3f9a45"]
    };

    function tegnFedt(ctx, x, y, a, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        /* Tre fedtsyrehaler som zigzag */
        for (var k = 0; k < 3; k++) {
            var y0 = -6 + k * 6;
            ctx.beginPath();
            ctx.moveTo(-6, y0);
            for (var j = 1; j <= 6; j++) ctx.lineTo(-6 + j * 3.4, y0 + (j % 2 ? -1.6 : 1.6));
            ctx.strokeStyle = FARVER.fedtHaleMoerk;
            ctx.lineWidth = 3.4;
            ctx.stroke();
            ctx.strokeStyle = FARVER.fedtHale;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        /* Glycerol-delen */
        ctx.strokeStyle = "#c95538";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(-8, -7);
        ctx.lineTo(-8, 7);
        ctx.stroke();
        ctx.fillStyle = FARVER.glycerol;
        for (k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(-8, -6 + k * 6, 1.9, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function tegnStivelse(ctx, x, y, a) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.lineWidth = 1.2;
        for (var k = 0; k < 4; k++) {
            var cx = -18 + k * 12, cy = (k % 2 ? 2 : -2);
            ctx.beginPath();
            for (var j = 0; j < 6; j++) {
                var v = Math.PI / 6 + j * Math.PI / 3;
                var px = cx + Math.cos(v) * 5.6, py = cy + Math.sin(v) * 5.6;
                if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = FARVER.stivelse;
            ctx.fill();
            ctx.strokeStyle = FARVER.stivelseKant;
            ctx.stroke();
            if (k < 3) {
                ctx.beginPath();
                ctx.moveTo(cx + 5, cy);
                ctx.lineTo(cx + 7, (k % 2 ? -2 : 2));
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function tegnHeptan(ctx, x, y, a, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.translate(x, y);
        ctx.rotate(a);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.beginPath();
        for (var j = 0; j < 7; j++) {
            var px = -12.6 + j * 4.2, py = j % 2 ? -1.8 : 1.8;
            if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "#5d6c7a";
        ctx.lineWidth = 3.6;
        ctx.stroke();
        ctx.strokeStyle = FARVER.heptan;
        ctx.lineWidth = 2.2;
        ctx.stroke();
        ctx.restore();
    }

    function tegnVand(ctx, x, y, a, alfa) {
        ctx.save();
        ctx.globalAlpha *= alfa === undefined ? 1 : alfa;
        ctx.translate(x, y);
        ctx.rotate(a);
        NK.kugle(ctx, -4.2, 4, 2.6, "#ffffff", "#aab4bf");
        NK.kugle(ctx, 4.2, 4, 2.6, "#ffffff", "#aab4bf");
        NK.kugle(ctx, 0, 0, 4.3, "#ff9a90", "#b8332a");
        ctx.restore();
    }

    function tegnIon(ctx, p) {
        var f = FARVER[p.type];
        NK.kugle(ctx, p.x, p.y, p.rad, f[0], f[1]);
        var tekst = p.type === "na" ? "Na" + NK.ladningHaevet(1) : "Cl" + NK.ladningHaevet(-1);
        ctx.font = "700 " + (p.type === "na" ? 5.4 : 6) + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1a1030";
        ctx.fillText(tekst, p.x, p.y + 0.4);
    }

    function tegnSaltkrystal(ctx, x, y) {
        for (var i = 0; i < 4; i++) {
            var px = x + (i % 2) * 7 - 3.5, py = y + Math.floor(i / 2) * 7 - 3.5;
            var na = (i === 0 || i === 3);
            NK.kugle(ctx, px, py, na ? 3 : 3.8, na ? FARVER.na[0] : FARVER.cl[0], na ? FARVER.na[1] : FARVER.cl[1]);
        }
    }

    P.tegnMolekyle = function (ctx, p, alfa) {
        if (p.type === "heptan") tegnHeptan(ctx, p.x, p.y, p.a, alfa);
        else if (p.type === "vand") tegnVand(ctx, p.x, p.y, p.a, alfa);
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

        /* Vaesken */
        if (this.midl && sc !== "chips" && sc !== "rest") {
            var fv = this.midl === "vand" ? "rgba(90, 160, 220, 0.16)" : "rgba(200, 215, 230, 0.1)";
            var ov = this.overflade();
            ctx.fillStyle = fv;
            if (sc === "filter") {
                ctx.fillRect(-R, -R, 2 * R, 2 * R);
            } else {
                ctx.fillRect(-R, ov, 2 * R, 2 * R);
                ctx.strokeStyle = "rgba(220, 235, 250, 0.35)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-R, ov);
                ctx.lineTo(R, ov);
                ctx.stroke();
            }
        }

        /* Filtrerpapiret: fibre med porer */
        if (sc === "filter") {
            ctx.save();
            ctx.fillStyle = "rgba(236, 232, 218, 0.16)";
            ctx.fillRect(-R, FIBER.y0, 2 * R, FIBER.y1 - FIBER.y0);
            ctx.strokeStyle = "rgba(240, 236, 222, 0.75)";
            ctx.lineWidth = 2.2;
            ctx.lineCap = "round";
            for (var lag = 0; lag < 4; lag++) {
                var ly = FIBER.y0 + 2 + lag * 4.5;
                var start = -R;
                for (var pi = 0; pi <= PORER.length; pi++) {
                    var slut = pi < PORER.length ? PORER[pi] - 5 : R;
                    ctx.beginPath();
                    for (var fx = start; fx <= slut; fx += 4) {
                        var fy = ly + Math.sin(fx * 0.3 + lag * 1.7) * 1.4;
                        if (fx === start) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
                    }
                    ctx.stroke();
                    start = pi < PORER.length ? PORER[pi] + 5 : R;
                }
            }
            ctx.restore();
        }

        /* Chipsstykkerne */
        if (sc === "chips" || sc === "ekstraktion" || sc === "filter") {
            for (i = 0; i < KAEDER.length; i++) {
                var kd = KAEDER[i];
                var st = this.stykkePlads(kd[3]);
                var kx = kd[0], ky = kd[1];
                if (sc === "filter") { kx *= 0.85; ky = -14 + (ky - 8) * 0.45; }
                tegnStivelse(ctx, kx + st.x, ky + st.y, kd[2]);
            }
            if (!this.saltFri) {
                var ss = this.stykkePlads(0);
                var sy = sc === "filter" ? -14 + (SALTPLADS[1] - 8) * 0.45 : SALTPLADS[1];
                tegnSaltkrystal(ctx, SALTPLADS[0] * (sc === "filter" ? 0.85 : 1) + ss.x, sy + ss.y);
            }
        }

        /* Vandets hydrogenbindinger som svage streger */
        if (this.midl === "vand" && sc !== "chips" && sc !== "rest") {
            ctx.save();
            ctx.strokeStyle = "rgba(140, 190, 235, 0.35)";
            ctx.lineWidth = 1;
            ctx.setLineDash([2, 2.5]);
            ctx.beginPath();
            for (i = 0; i < this.midler.length; i++) {
                var wi = this.midler[i];
                if (wi.borte) continue;
                for (var j = i + 1; j < this.midler.length; j++) {
                    var wj = this.midler[j];
                    if (wj.borte) continue;
                    var dx = wi.x - wj.x, dy = wi.y - wj.y;
                    if (dx * dx + dy * dy < 22 * 22) { ctx.moveTo(wi.x, wi.y); ctx.lineTo(wj.x, wj.y); }
                }
            }
            ctx.stroke();
            ctx.restore();
        }

        for (i = 0; i < this.midler.length; i++) {
            p = this.midler[i];
            if (!p.borte) this.tegnMolekyle(ctx, p, 1);
        }
        for (i = 0; i < this.fedt.length; i++) {
            p = this.fedt[i];
            if (sc === "filtrat" || sc === "inddamp" || sc === "rest") {
                if (p.tilstand === "bundet" || p.holdtTilbage) continue;
            }
            tegnFedt(ctx, p.x, p.y, p.a, 1);
        }
        for (i = 0; i < this.ioner.length; i++) tegnIon(ctx, this.ioner[i]);
        for (i = 0; i < this.fordamper.length; i++) {
            p = this.fordamper[i];
            this.tegnMolekyle(ctx, p, NK.klamp(p.liv, 0, 1));
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
        this.tegnForklaring(ctx, 0, b.r + 16);
        ctx.restore();
    };

    /* De partikeltyper, der kan ses lige nu */
    P.typer = function () {
        var sc = this.scene, ud = [];
        var fedtSes = sc === "chips" || sc === "ekstraktion" || sc === "filter" ||
            this.fedt.some(function (f) { return f.tilstand !== "bundet" && !f.holdtTilbage; });
        if (fedtSes) ud.push("fedt");
        if (sc === "chips" || sc === "ekstraktion" || sc === "filter") ud.push("stivelse");
        if (this.midl && sc !== "chips" && this.midler.some(function (m) { return !m.borte; })) ud.push(this.midl);
        if (this.ioner.length) { ud.push("na"); ud.push("cl"); }
        if (sc === "filter") ud.push("papir");
        return ud;
    };

    var NAVNE = { fedt: "Fedtstof", stivelse: "Stivelse", heptan: "Heptan", vand: "Vand", na: "Na" + NK.ladningHaevet(1), cl: "Cl" + NK.ladningHaevet(-1), papir: "Filtrerpapir" };
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
                if (t === "fedt") { ctx.save(); ctx.translate(ix, cy); ctx.scale(0.62, 0.62); tegnFedt(ctx, 0, 0, 0); ctx.restore(); }
                else if (t === "stivelse") { ctx.save(); ctx.translate(ix, cy); ctx.scale(0.4, 0.4); tegnStivelse(ctx, 0, 0, 0); ctx.restore(); }
                else if (t === "heptan") { ctx.save(); ctx.translate(ix, cy); ctx.scale(0.7, 0.7); tegnHeptan(ctx, 0, 0, 0); ctx.restore(); }
                else if (t === "vand") tegnVand(ctx, ix, cy - 1, 0);
                else if (t === "na" || t === "cl") NK.kugle(ctx, ix, cy, 4.5, FARVER[t][0], FARVER[t][1]);
                else if (t === "papir") { ctx.strokeStyle = "rgba(240, 236, 222, 0.8)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ix - 7, cy); ctx.lineTo(ix + 7, cy); ctx.stroke(); }
                NK.tekst(ctx, NAVNE[t], cx + 22, cy + 0.5, { font: "600 10.5px 'Segoe UI', sans-serif", linje: "middle", farve: "#cfd6de" });
                cx += bredder[i];
            });
        });
        ctx.restore();
    };
}());

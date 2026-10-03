/* =====================================================================
   mikro.js - partikelbilledet: et snit gennem metallet og vandet

   Bruges to steder: luppen over samlingen paa fane 1 (to metaller, vand
   over det hele, vandet loeber) og hele scenen paa fane 3 (jern med en
   draabe vand og luft over).

   Enheden er afstanden mellem to atomer. Kolonne c staar ved x = c + 0,5.
   Metallets overflade er y = 0, raekke r staar ved y = r + 0,5, og vand
   og luft har y < 0.

   Billedet foelger de afstemte skemaer, partikel for partikel:

     afgiv(c, k)   ét atom i kolonne c gaar i vandet som M²⁺ og efterlader
                   2 e⁻, der gaar gennem metallet til kolonne k
     ved k         naar 4 e⁻ venter, kommer ét O₂, og der dannes 4 OH⁻
                   (O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻)
     i draaben     Fe²⁺ + 2 OH⁻ → Fe(OH)₂, og for hver 4 Fe(OH)₂ kommer
                   ét O₂ mere og goer dem til rust (4 FeO(OH))

   Taellerne i this.tael bruges af selvtesten: afgivet og optaget skal
   passe. Fanerne bestemmer, hvornaar der afgives; mikro.js goer det kun.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;

    var LEVETID = 4.2;      /* sekunder, en ion ses i luppen paa fane 1, foer vandet har taget den */

    var FARVE = {
        e:    { f: "#f2c53d", k: "#8a6a10", t: "#2a2103" },
        o2:   { f: "#e2483b", k: "#8f241b", t: "#ffffff" },
        n2:   { f: "#5d6f8f", k: "#34415a", t: "#e6ecf5" },
        oh:   { f: "#8fa2f5", k: "#3f4fa8", t: "#10173d" },
        Na:   { f: "#c08be6", k: "#6d3f96", t: "#24103a" },
        Cl:   { f: "#a8d45a", k: "#587a1e", t: "#1c2a05" },
        feoh2: { f: "#b9d6ad", k: "#6f8f63" },
        rust: { f: "#b5561f", k: "#6e3210" },
        ion:  { Fe: "#6fcf8c", Zn: "#cfe2f0", Mg: "#f1f4f7", Cu: "#58b8d8" }
    };

    function Mikro(cfg) {
        this.kol = cfg.kol;
        this.raek = cfg.raek;
        this.over = cfg.over;                /* hoejden over overfladen */
        this.form = cfg.vand;                /* "fuld" eller "draabe" */
        this.draabe = cfg.draabe || null;    /* { cx, R, h } */
        this.stroem = cfg.stroem || 0;
        this.faeldning = !!cfg.faeldning;
        this.antalO2 = cfg.o2 === undefined ? 6 : cfg.o2;
        this.antalN2 = cfg.n2 || 0;
        this.metal = [];
        for (var c = 0; c < this.kol; c++) this.metal.push(cfg.metal(c));
        this.til = { vand: true, ilt: true, salt: false };
        this.tael = { afgivet: 0, eAfgivet: 0, eOptaget: 0, o2: 0, oh: 0, feoh2: 0, rust: 0 };
        this.anodeX = this.kol / 2;
        this.nyPlade();
    }

    var P = Mikro.prototype;

    /* Nyt metal og rent vand. Taellerne bliver. */
    P.nyPlade = function () {
        this.top = [];
        for (var c = 0; c < this.kol; c++) this.top.push(0);
        this.ion = [];
        this.oh = [];
        this.el = [];
        this.gas = [];
        this.salt = [];
        this.dep = [];
        this.moeder = [];
        this.maerker = [];
        this.kat = {};
        this.aktivT = 0;
        this.rustO2 = null;
        this.fyldGas();
        this.fyldSalt();
    };

    /* ----- Omraader ------------------------------------------------------------ */
    /* marg: saa langt inden for draabens kant (en ion fylder selv lidt) */
    P.iDraabe = function (x, y, marg) {
        var d = this.draabe, a = marg || 0;
        var u = (x - d.cx) / (d.R - a), v = y / (d.h - a);
        return u * u + v * v < 1;
    };

    /* Staar der vand over kolonne c? */
    P.vandOver = function (c) {
        return this.til.vand && (this.form === "fuld" || this.iDraabe(c + 0.5, -0.05));
    };

    /* Vandet over overfladen (og i de huller, atomerne har efterladt) */
    P.iVand = function (x, y) {
        if (!this.til.vand) return false;
        if (x < 0.3 || x > this.kol - 0.3) return false;
        if (y >= 0) {
            var c = Math.floor(x);
            if (c < 0 || c >= this.kol || y > this.top[c] - 0.25) return false;
            return this.vandOver(c);
        }
        /* Lige over et hul naar vandet helt ned, saa ionen kan komme op af det */
        var k = Math.floor(x);
        var bund = k >= 0 && k < this.kol && this.top[k] > 0 && this.vandOver(k) ? 0 : -0.5;
        if (y < -this.over + 0.4 || y > bund) return false;
        return this.form === "fuld" || y > -0.5 || this.iDraabe(x, y, 0.5);
    };

    /* Der, hvor gasmolekylerne bevaeger sig: vandet (fane 1) eller luften */
    P.iGas = function (x, y) {
        if (x < 0.5 || x > this.kol - 0.5 || y < -this.over + 0.5) return false;
        if (this.form === "fuld") return y < -0.9;
        if (y > -0.7) return false;
        if (!this.til.vand) return true;
        var d = this.draabe, u = (x - d.cx) / (d.R + 0.7), v = y / (d.h + 0.7);
        return u * u + v * v > 1;
    };

    P.gasPunkt = function () {
        for (var i = 0; i < 60; i++) {
            var x = NK.r(0.6, this.kol - 0.6), y = NK.r(-this.over + 0.6, -0.9);
            if (this.iGas(x, y)) return { x: x, y: y };
        }
        return { x: 1, y: -this.over + 0.7 };
    };

    P.vandPunkt = function () {
        for (var i = 0; i < 60; i++) {
            var x = NK.r(0.6, this.kol - 0.6), y = NK.r(-this.over + 0.6, -0.6);
            if (this.iVand(x, y)) return { x: x, y: y };
        }
        return { x: this.kol / 2, y: -0.8 };
    };

    /* ----- Luft, ilt og salt ------------------------------------------------------ */
    P.fyldGas = function () {
        var n2 = this.antalN2 + (this.til.ilt || this.form === "fuld" ? 0 : this.antalO2);
        var o2 = this.til.ilt ? this.antalO2 : 0;
        var mig = this;
        function antal(type) { return mig.gas.filter(function (g) { return g.type === type; }).length; }
        function saet(type, n) {
            while (antal(type) > n) {
                for (var i = mig.gas.length - 1; i >= 0; i--) {
                    if (mig.gas[i].type === type && !mig.gas[i].maal) { mig.gas.splice(i, 1); break; }
                }
                if (i < 0) break;
            }
            while (antal(type) < n) {
                var p = mig.gasPunkt();
                mig.gas.push({ type: type, x: p.x, y: p.y, vx: NK.r(-1, 1), vy: NK.r(-1, 1), v: NK.r(0, 6.28) });
            }
        }
        saet("o2", o2);
        saet("n2", n2);
    };

    P.fyldSalt = function () {
        var vil = this.til.salt && this.til.vand ? 5 : 0;
        if (!vil) { this.salt = []; return; }
        while (this.salt.length < 2 * vil) {
            var p = this.vandPunkt();
            this.salt.push({ type: this.salt.length % 2 ? "Cl" : "Na", x: p.x, y: p.y, vx: 0, vy: 0 });
        }
    };

    /* Kontakterne: vand, ilt og salt */
    P.saet = function (til) {
        var foer = this.til;
        this.til = { vand: !!til.vand, ilt: !!til.ilt, salt: !!til.salt };
        if (foer.vand && !this.til.vand) {
            /* Draaben er vaek: det, der var oploest i den, forsvinder */
            this.ion = [];
            this.oh = [];
            this.moeder = [];
        }
        if (foer.vand !== this.til.vand) {
            /* Gasmolekyler, der staar, hvor de ikke kan vaere, flyttes */
            var mig = this;
            this.gas.forEach(function (g) {
                if (!g.maal && !mig.iGas(g.x, g.y)) { var p = mig.gasPunkt(); g.x = p.x; g.y = p.y; }
            });
        }
        if (!this.til.ilt || !this.til.vand) {
            /* Et O₂, der var paa vej, slipper sit maal */
            this.gas.forEach(function (g) { g.maal = null; });
            this.rustO2 = null;
            for (var k in this.kat) if (this.kat.hasOwnProperty(k)) this.kat[k].o2 = null;
        }
        this.fyldGas();
        this.fyldSalt();
    };

    /* ----- Haendelsen: ét atom afgiver to elektroner ---------------------------------- */
    P.kanAfgive = function (c) {
        return c >= 0 && c < this.kol && !!this.metal[c] && this.top[c] < this.raek - 1;
    };

    P.afgiv = function (c, katC) {
        if (!this.kanAfgive(c) || !this.metal[katC]) return false;
        var r = this.top[c];
        this.top[c]++;
        var x = c + 0.5, y = r + 0.5, dyb = this.raek - 0.5;
        this.ion.push({ sym: this.metal[c], x: x, y: y, vx: NK.r(-0.3, 0.3), vy: -1.6, alder: 0, fri: true, maal: null });
        for (var i = 0; i < 2; i++) {
            this.el.push({
                sti: [{ x: x + (i ? 0.2 : -0.2), y: y }, { x: x, y: dyb }, { x: katC + 0.5, y: dyb }, { x: katC + 0.5, y: this.top[katC] + 0.5 }],
                seg: 0, x: x + (i ? 0.2 : -0.2), y: y, vent: 0.25 + i * 0.3, kat: katC
            });
        }
        this.tael.afgivet++;
        this.tael.eAfgivet += 2;
        this.anodeX = x;
        this.aktivT = 3;
        return true;
    };

    /* Elektroner, der er paa vej eller venter ved overfladen */
    P.elektronerUndervejs = function () {
        var n = this.el.length;
        for (var k in this.kat) if (this.kat.hasOwnProperty(k)) n += this.kat[k].n;
        return n;
    };

    /* ----- Bevaegelsen ---------------------------------------------------------------- */
    function vandr(p, dt, fart, inde, maal, traek) {
        p.vx += (Math.random() - 0.5) * 9 * dt * fart;
        p.vy += (Math.random() - 0.5) * 9 * dt * fart;
        if (maal) {
            var dx = maal.x - p.x, dy = maal.y - p.y, d = Math.hypot(dx, dy) || 1;
            p.vx += dx / d * traek * dt;
            p.vy += dy / d * traek * dt;
        }
        var v = Math.hypot(p.vx, p.vy);
        if (v > fart) { p.vx *= fart / v; p.vy *= fart / v; }
        var nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
        if (inde(nx, ny)) { p.x = nx; p.y = ny; }
        else if (inde(nx, p.y)) { p.x = nx; p.vy = -p.vy; }
        else if (inde(p.x, ny)) { p.y = ny; p.vx = -p.vx; }
        else { p.vx = -p.vx; p.vy = -p.vy; }
    }

    function fjern(liste, p) {
        var i = liste.indexOf(p);
        if (i >= 0) liste.splice(i, 1);
    }

    /* Lige mod et punkt. Giver true, naar partiklen er fremme. */
    function gaaTil(p, maal, fart, dt) {
        var dx = maal.x - p.x, dy = maal.y - p.y, d = Math.hypot(dx, dy);
        if (d <= fart * dt) { p.x = maal.x; p.y = maal.y; return true; }
        p.x += dx / d * fart * dt;
        p.y += dy / d * fart * dt;
        return false;
    }

    P.frietO2 = function (ved) {
        var bedst = null, bd = 1e9;
        this.gas.forEach(function (g) {
            if (g.type !== "o2" || g.maal) return;
            var d = Math.hypot(g.x - ved.x, g.y - ved.y);
            if (d < bd) { bd = d; bedst = g; }
        });
        return bedst;
    };

    P.fjernGas = function (g) {
        var i = this.gas.indexOf(g);
        if (i >= 0) this.gas.splice(i, 1);
        this.fyldGas();
    };

    P.maerke = function (tekst, x, y, farve) {
        this.maerker.push({ tekst: tekst, x: x, y: y, t: 0, farve: farve || "#ffffff" });
    };

    P.opdater = function (dt) {
        var mig = this, i;
        if (this.aktivT > 0) this.aktivT -= dt;
        function vand(x, y) { return mig.iVand(x, y); }
        function gas(x, y) { return mig.iGas(x, y); }

        /* Elektronerne gennem metallet */
        for (i = this.el.length - 1; i >= 0; i--) {
            var e = this.el[i];
            if (e.vent > 0) { e.vent -= dt; continue; }
            if (gaaTil(e, e.sti[e.seg + 1], 7, dt)) {
                e.seg++;
                if (e.seg >= e.sti.length - 1) {
                    var k = this.kat[e.kat] || (this.kat[e.kat] = { n: 0, o2: null });
                    k.n++;
                    this.el.splice(i, 1);
                }
            }
        }

        /* Ved katoden: 4 e⁻ venter, saa kommer ét O₂ */
        for (var ks in this.kat) {
            if (!this.kat.hasOwnProperty(ks)) continue;
            var kt = this.kat[ks], kc = parseInt(ks, 10);
            var sted = { x: kc + 0.5, y: this.top[kc] - 0.6 };
            if (kt.n >= 4 && !kt.o2 && this.til.ilt && this.til.vand) {
                var o = this.frietO2(sted);
                if (o) { o.maal = sted; kt.o2 = o; }
            }
            if (kt.o2 && gaaTil(kt.o2, sted, 4.5, dt)) {
                this.fjernGas(kt.o2);
                kt.o2 = null;
                kt.n -= 4;
                this.tael.o2++;
                this.tael.eOptaget += 4;
                this.tael.oh += 4;
                var nye = [];
                for (i = 0; i < 4; i++) {
                    var p = { x: sted.x + NK.r(-0.3, 0.3), y: sted.y - NK.r(0, 0.5), vx: NK.r(-1, 1), vy: -NK.r(0.2, 1), alder: 0, maal: null, fri: true };
                    this.oh.push(p);
                    nye.push(p);
                }
                if (this.faeldning) this.aftalMoeder(nye, sted.x);
            }
        }

        /* Ionerne i vandet */
        var midt = { x: this.kol / 2, y: -Math.min(1.5, this.over / 2) };
        function flyt(liste, fart) {
            for (var j = liste.length - 1; j >= 0; j--) {
                var q = liste[j];
                q.alder += dt;
                if (q.y > -0.5 && !q.maal) q.vy -= 6 * dt;          /* op af hullet */
                if (!vand(q.x, q.y)) {
                    /* Uden for vandet (paa vej op af et hul eller klemt ved kanten): ind mod midten */
                    gaaTil(q, q.y >= 0 ? { x: q.x, y: -0.6 } : midt, 2, dt);
                    continue;
                }
                if (mig.stroem && q.y < -0.4) q.vx += mig.stroem * dt * 2;
                vandr(q, dt, fart, vand, q.maal, 5);
                if (!q.maal && q.y > -1.7) q.vy -= 1.6 * dt;        /* op i vandet, vaek fra overfladen */
                if (!mig.faeldning && (q.alder > LEVETID || q.x > mig.kol - 0.6)) liste.splice(j, 1);
            }
        }
        flyt(this.ion, 1.5);
        flyt(this.oh, 1.7);

        /* Fe²⁺ + 2 OH⁻ → Fe(OH)₂ */
        for (i = this.moeder.length - 1; i >= 0; i--) {
            var m = this.moeder[i];
            var alle = [m.ion].concat(m.oh), fremme = true;
            alle.forEach(function (q) { if (Math.hypot(q.x - m.punkt.x, q.y - m.punkt.y) > 0.95) fremme = false; });
            m.t += dt;
            if (!fremme && m.t < 9) continue;
            fjern(this.ion, m.ion);
            m.oh.forEach(function (q) { fjern(mig.oh, q); });
            this.moeder.splice(i, 1);
            this.laegDepot(m.punkt.x);
        }

        /* 4 Fe(OH)₂ + O₂ → 4 FeO(OH) + 2 H₂O */
        if (this.faeldning && this.til.ilt && this.til.vand) {
            var midtX = this.draabe ? this.draabe.cx : this.kol / 2;
            var friske = this.dep.filter(function (d) { return d.type === "feoh2" && d.x < midtX; });
            if (friske.length < 4) friske = this.dep.filter(function (d) { return d.type === "feoh2" && d.x >= midtX; });
            if (!this.rustO2 && friske.length >= 4) {
                var fire = friske.slice(0, 4), cx = 0, cy = 0;
                fire.forEach(function (d) { cx += d.x / 4; cy += d.y / 4; });
                var o2 = this.frietO2({ x: cx, y: cy });
                if (o2) { o2.maal = { x: cx, y: cy - 0.5 }; this.rustO2 = { o: o2, fire: fire }; }
            }
            if (this.rustO2 && gaaTil(this.rustO2.o, this.rustO2.o.maal, 4.5, dt)) {
                this.rustO2.fire.forEach(function (d) { d.type = "rust"; d.ny = 0; });
                this.maerke("rust: FeO(OH)", this.rustO2.o.maal.x, this.rustO2.o.maal.y - 0.4, "#f0a070");
                this.fjernGas(this.rustO2.o);
                this.rustO2 = null;
                this.tael.o2++;
                this.tael.rust += 4;
            }
        }

        /* Gasmolekylerne */
        this.gas.forEach(function (g) {
            g.v += dt * 1.5;
            if (g.maal) return;
            vandr(g, dt, mig.form === "fuld" ? 1.2 : 2.2, gas, null, 0);
            if (mig.stroem) {
                g.x += mig.stroem * dt * 0.5;
                if (g.x > mig.kol - 0.6) g.x = 0.7;
            }
        });

        /* Saltets ioner: Cl⁻ mod midten, Na⁺ mod kanten, mens det ruster */
        var aktiv = this.aktivT > 0;
        this.salt.forEach(function (s2) {
            var maal = null;
            if (aktiv && mig.draabe) {
                var d = mig.draabe;
                if (s2.type === "Cl") maal = { x: mig.anodeX, y: -0.9 };
                else maal = { x: d.cx + (s2.x < d.cx ? -1 : 1) * d.R * 0.8, y: -0.9 };
            }
            if (!vand(s2.x, s2.y)) { gaaTil(s2, midt, 2, dt); return; }
            vandr(s2, dt, 1.6, vand, maal, 2.2);
        });

        /* Maerkerne stiger og forsvinder */
        for (i = this.maerker.length - 1; i >= 0; i--) {
            this.maerker[i].t += dt;
            if (this.maerker[i].t > 2.6) this.maerker.splice(i, 1);
        }
        var stak = {};
        this.dep.forEach(function (d) {
            if (d.ny !== undefined && d.ny < 1) d.ny += dt * 2;
            var c = NK.klamp(Math.floor(d.x), 0, mig.kol - 1);
            var n = stak[c] || 0;
            stak[c] = n + 1;
            d.y = NK.mod(d.y, mig.top[c] - 0.26 - 0.3 * Math.min(n, 6), 5, dt);
        });
    };

    /* De 4 nye OH⁻ faar hver sin plads: to og to moeder de en Fe²⁺ */
    P.aftalMoeder = function (nye, katX) {
        var frie = this.ion.filter(function (q) { return q.fri; });
        for (var k = 0; k < 2 && k < frie.length; k++) {
            var ion = frie[k];
            var punkt = { x: ion.x + (katX - ion.x) * NK.r(0.5, 0.7), y: -1.35 };
            punkt.x = NK.klamp(punkt.x, 1, this.kol - 1);
            ion.fri = false;
            ion.maal = punkt;
            nye[2 * k].maal = punkt;
            nye[2 * k + 1].maal = punkt;
            nye[2 * k].fri = false;
            nye[2 * k + 1].fri = false;
            this.moeder.push({ ion: ion, oh: [nye[2 * k], nye[2 * k + 1]], punkt: punkt, t: 0 });
        }
    };

    /* Et korn Fe(OH)₂ laegger sig paa overfladen */
    P.laegDepot = function (x) {
        var c = NK.klamp(Math.floor(x), 0, this.kol - 1);
        var hoejde = this.dep.filter(function (d) { return Math.floor(d.x) === c; }).length;
        this.dep.push({ type: "feoh2", x: c + NK.r(0.25, 0.75), y: this.top[c] - 0.26 - 0.3 * Math.min(hoejde, 6) - NK.r(0, 0.08), ny: 0 });
        this.tael.feoh2++;
        this.maerke("Fe(OH)₂", x, -1.3, "#cfe8c4");
    };

    /* ----- Tegning -------------------------------------------------------------------- */
    function kugle(ctx, x, y, r, f, tekst, px) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = f.f;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = f.k;
        ctx.stroke();
        if (tekst) {
            ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = f.t;
            ctx.fillText(tekst, x, y + 0.5);
        }
    }

    function toAtomer(ctx, x, y, r, v, f, tekst, px) {
        var dx = Math.cos(v) * r * 0.62, dy = Math.sin(v) * r * 0.62;
        ctx.lineWidth = 1.5;
        [[-1], [1]].forEach(function (s) {
            ctx.beginPath();
            ctx.arc(x + s[0] * dx, y + s[0] * dy, r, 0, Math.PI * 2);
            ctx.fillStyle = f.f;
            ctx.fill();
            ctx.strokeStyle = f.k;
            ctx.stroke();
        });
        ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = f.t;
        ctx.fillText(tekst, x, y + 0.5);
    }

    /* R: { x, y, b, h } i px. Skalaen foelger bredden. */
    P.maal = function (R) {
        var s = R.b / this.kol;
        return { s: s, x0: R.x, y0: R.y + R.h - this.raek * s };
    };

    P.tegn = function (ctx, R, valg) {
        valg = valg || {};
        var M = this.maal(R), s = M.s, x0 = M.x0, y0 = M.y0, mig = this, c, r;
        function X(x) { return x0 + x * s; }
        function Y(y) { return y0 + y * s; }
        var px = NK.klamp(Math.round(s * 0.42), 12, 14);

        ctx.save();
        NK.rundtRekt(ctx, R.x, R.y, R.b, R.h, valg.radius || 0);
        ctx.clip();

        /* Luften eller vandet bagved */
        ctx.fillStyle = this.form === "fuld" ? "#16364f" : "#161922";
        ctx.fillRect(R.x, R.y, R.b, R.h);

        /* Draaben */
        if (this.form === "draabe" && this.til.vand) {
            var d = this.draabe;
            ctx.beginPath();
            ctx.ellipse(X(d.cx), Y(0), d.R * s, d.h * s, 0, Math.PI, 0);
            ctx.closePath();
            var g = ctx.createLinearGradient(0, Y(-d.h), 0, Y(0));
            g.addColorStop(0, this.til.salt ? "rgba(96, 170, 200, 0.42)" : "rgba(70, 150, 225, 0.38)");
            g.addColorStop(1, this.til.salt ? "rgba(60, 120, 160, 0.5)" : "rgba(45, 105, 180, 0.46)");
            ctx.fillStyle = g;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "rgba(160, 210, 255, 0.55)";
            ctx.stroke();
        }

        /* Metallet: atomerne i gitteret, og vand i hullerne */
        var rAtom = s * 0.46;
        for (c = 0; c < this.kol; c++) {
            var m = this.metal[c];
            if (!m) {
                ctx.fillStyle = "#d9d3bf";
                ctx.fillRect(X(c), Y(0), s + 0.5, this.raek * s);
                ctx.strokeStyle = "rgba(90, 84, 66, 0.45)";
                ctx.lineWidth = 2;
                for (r = 0; r < this.raek * 2; r++) {
                    ctx.beginPath();
                    ctx.moveTo(X(c), Y(r * 0.5 + 0.5));
                    ctx.lineTo(X(c + 1), Y(r * 0.5));
                    ctx.stroke();
                }
                continue;
            }
            if (this.top[c] > 0 && this.vandOver(c)) {
                ctx.fillStyle = this.form === "fuld" ? "#16364f" : "rgba(45, 105, 180, 0.46)";
                ctx.fillRect(X(c), Y(0), s + 0.5, this.top[c] * s);
            }
            var F = K.METAL[m];
            for (r = this.top[c]; r < this.raek; r++) {
                kugle(ctx, X(c + 0.5), Y(r + 0.5), rAtom, { f: F.farve, k: F.kant, t: F.tekst }, s >= 24 ? m : "", px);
            }
        }

        /* Det, der har lagt sig paa overfladen */
        this.dep.forEach(function (d2) {
            var f = FARVE[d2.type], rr = s * 0.3 * (d2.ny !== undefined ? NK.pop(Math.min(1, d2.ny)) : 1);
            ctx.beginPath();
            ctx.arc(X(d2.x), Y(d2.y), rr, 0, Math.PI * 2);
            ctx.fillStyle = f.f;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = f.k;
            ctx.stroke();
        });

        /* Ionerne */
        this.salt.forEach(function (q) {
            kugle(ctx, X(q.x), Y(q.y), s * (q.type === "Cl" ? 0.5 : 0.44), FARVE[q.type], q.type === "Cl" ? "Cl⁻" : "Na⁺", px);
        });
        function synlig(q) {
            ctx.globalAlpha = mig.faeldning ? 1 : NK.klamp((LEVETID - q.alder) / 1.2, 0, 1);
        }
        this.oh.forEach(function (q) { synlig(q); kugle(ctx, X(q.x), Y(q.y), s * 0.48, FARVE.oh, "OH⁻", px); });
        this.ion.forEach(function (q) {
            synlig(q);
            kugle(ctx, X(q.x), Y(q.y), s * 0.52, { f: FARVE.ion[q.sym], k: "#1e3b2a", t: "#0e2416" }, K.ion(q.sym), px);
        });
        ctx.globalAlpha = 1;

        /* Gassen */
        this.gas.forEach(function (q) {
            toAtomer(ctx, X(q.x), Y(q.y), s * 0.36, q.v, FARVE[q.type], q.type === "o2" ? "O₂" : "N₂", px);
        });

        /* Elektronerne: dem, der er paa vej, og dem, der venter ved overfladen */
        var re = Math.max(9, s * 0.33);
        this.el.forEach(function (q) { kugle(ctx, X(q.x), Y(q.y), re, FARVE.e, "e⁻", 12); });
        for (var ks in this.kat) {
            if (!this.kat.hasOwnProperty(ks)) continue;
            var kc = parseInt(ks, 10), n = Math.min(4, this.kat[ks].n);
            for (var i = 0; i < n; i++) {
                kugle(ctx, X(kc + 0.5 + (i % 2 ? 0.26 : -0.26)), Y(this.top[kc] + 0.5 + (i > 1 ? 0.55 : 0)), re, FARVE.e, "e⁻", 12);
            }
        }

        /* Maerkerne ved det, der lige er dannet */
        this.maerker.forEach(function (mk) {
            var a = mk.t < 0.3 ? mk.t / 0.3 : (mk.t > 1.9 ? Math.max(0, (2.6 - mk.t) / 0.7) : 1);
            ctx.save();
            ctx.globalAlpha = a;
            NK.tekst(ctx, mk.tekst, X(mk.x), Y(mk.y) - mk.t * 9, {
                font: "700 14px 'Segoe UI', sans-serif", justering: "center", farve: mk.farve, kant: true
            });
            ctx.restore();
        });

        ctx.restore();
    };

    Mikro.FARVE = FARVE;
    NK.Mikro = Mikro;
}());

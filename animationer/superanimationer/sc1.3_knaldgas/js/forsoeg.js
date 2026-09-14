/* =====================================================================
   forsoeg.js - selve forsoeget: fyld glasset, antaend, maal knaldet

   Glasset gennemloeber disse tilstande:
     "klar"    staar i vandbadet og kan fyldes
     "traek"   eleven traekker det rundt
     "flyver"  glider af sig selv (hen til flammen eller hjem igen)
     "knald"   holdes ind over flammen, lige efter reaktionen
     "fylder"  er kommet hjem efter et knald og fyldes med vand igen

   Molekylerne i glasset er ikke pynt: hver streg gas er 2 molekyler,
   og efter knaldet ligger der praecis det vand og det overskud, som
   model.js regner ud. Ved 5 : 1 ser man altsaa H2 blive tilbage.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var S = NK.Scene;
    var M = NK.Model;
    var G = S.GLAS;

    var TYNGDE = 900;
    var KNALD_HOLD = 2.1;          /* sekunder ved flammen efter knaldet */
    var FYLD_TID = 0.9;            /* sekunder om at fylde glasset med vand igen */

    function r(a, b) { return a + Math.random() * (b - a); }

    NK.Forsoeg = function (canvas) {
        this.canvas = canvas;
        this.laerred = new NK.Laerred(canvas);
        this.tid = 0;
        this.resultater = {};
        this.senesteH = -1;
        this.senesteTid = -10;
        this.harFyldt = false;
        this.vedAendring = null;
        this.vedBesked = null;
        this.hover = null;
        this.nulstil();
        if (canvas) this.bindMus();
    };

    var P = NK.Forsoeg.prototype;

    /* ----- Nulstilling ------------------------------------------------ */
    P.nulstil = function () {
        this.h = 0;
        this.o = 0;
        this.tilstand = "klar";
        this.glas = { x: S.HJEM.x, y: S.HJEM.y, vinkel: 0 };
        this.vinkelMaal = 0;
        this.bane = null;
        this.traek = null;
        this.skalFyldes = false;
        this.fyldUr = 0;
        this.knaldUr = 0;
        this.niveau = 0;
        this.vand = 1;
        this.molekyler = [];
        this.dug = [];
        this.bobler = [];
        this.venter = { h2: 0, o2: 0 };
        this.spawnUr = 0;
        this.varme = 0;
        this.flow = { h2: 0, o2: 0 };
        this.front = -1;
        this.frontAlfa = 0;
        this.rekyl = 0;
        this.rekylFart = 0;
        this.ryst = 0;
        this.fyldtSidenKnald = true;
        this.sidsteReaktion = null;
        this.e = { x: 0, y: 0, styrke: 0, blink: 0, stik: 0, ringe: [], roeg: [], gnister: [], draaber: [] };
    };

    P.rydResultater = function () {
        this.resultater = {};
        this.senesteH = -1;
        this.aendret("ryd");
    };

    /* ----- Til panelet ------------------------------------------------ */
    P.antalTestet = function () {
        var n = 0;
        for (var k in this.resultater) if (Object.prototype.hasOwnProperty.call(this.resultater, k)) n++;
        return n;
    };

    P.fuld = function () { return this.h + this.o >= M.MAKS; };
    P.kanFylde = function () { return this.tilstand === "klar" && !this.fuld(); };
    P.kanAntaende = function () { return this.tilstand === "klar" && this.fuld(); };
    P.kanToemme = function () { return this.tilstand === "klar" && this.h + this.o > 0; };

    /* Hvilket af de tre trin paa scenen er eleven naaet til? */
    P.trin = function () {
        if (this.tilstand === "knald" || this.skalFyldes || !this.fyldtSidenKnald) return 3;
        if (this.fuld() || this.tilstand === "traek" || this.tilstand === "flyver") return 2;
        return 1;
    };

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring(grund);
    };

    P.besked = function (tekst, slags) {
        if (this.vedBesked) this.vedBesked(tekst, slags || "info");
    };

    /* ----- Indgreb ------------------------------------------------------ */
    P.tilfoej = function (gas) {
        if (this.tilstand !== "klar") return false;
        if (this.fuld()) {
            this.besked("Glasset er fuldt.", "info");
            return false;
        }
        if (gas === "h2") this.h++; else this.o++;
        this.harFyldt = true;
        this.fyldtSidenKnald = true;
        this.flow[gas] = 1;
        this.venter[gas] += M.PR_STREG;

        var ende = S.SLANGER[gas].ende;
        for (var i = 0; i < 9; i++) {
            this.bobler.push({ x0: ende.x + r(-2, 2), x: ende.x, y: ende.y, r: r(2, 4.5), v: r(70, 115), fase: r(0, 6), vent: i * 0.07 });
        }
        this.aendret("fyld");
        return true;
    };

    P.toem = function () {
        if (!this.kanToemme()) return false;
        this.h = 0;
        this.o = 0;
        this.venter.h2 = 0;
        this.venter.o2 = 0;
        for (var i = 0; i < this.molekyler.length; i++) this.molekyler[i].doer = true;
        this.aendret("toem");
        return true;
    };

    P.antaend = function () {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (this.tilstand !== "klar") return false;
        if (!this.fuld()) {
            this.besked("Fyld glasset helt op (6 streger), før du antænder.", "advarsel");
            return false;
        }
        this.flyv(S.TAEND, 1.1, this.knald);
        this.aendret("antaend");
        return true;
    };

    P.flyv = function (til, varighed, efter) {
        var dx = til.x - this.glas.x, dy = til.y - this.glas.y;
        var afstand = Math.sqrt(dx * dx + dy * dy);
        this.bane = {
            fra: { x: this.glas.x, y: this.glas.y },
            til: { x: til.x, y: til.y },
            t: 0,
            varighed: varighed,
            loeft: Math.min(120, afstand * 0.45 + 10),
            efter: efter
        };
        this.tilstand = "flyver";
    };

    P.knald = function () {
        var i;
        /* Molekyler, der stadig er paa vej op i glasset, kommer med nu. */
        while (this.venter.h2 > 0 || this.venter.o2 > 0) this.nytMolekyle();

        var rx = M.reaktion(this.h, this.o);
        var styrke = rx.styrke / 100;
        this.sidsteReaktion = rx;
        this.tilstand = "knald";
        this.knaldUr = KNALD_HOLD;
        this.skalFyldes = true;
        this.fyldtSidenKnald = false;
        this.traek = null;
        this.bane = null;
        this.glas.x = S.TAEND.x;
        this.glas.y = S.TAEND.y;

        this.resultater[this.h] = rx.styrke;
        this.senesteH = this.h;
        this.senesteTid = this.tid;

        var e = this.e;
        e.x = this.glas.x;
        e.y = this.glas.y;
        e.styrke = styrke;
        if (styrke > 0) {
            e.blink = 1;
            e.stik = 1;
            e.ringe.push({ x: e.x, y: e.y, r: 12, liv: 1 });
            if (styrke > 0.6) e.ringe.push({ x: e.x, y: e.y, r: 2, liv: 1.15 });
            var antal = Math.round(12 + 90 * styrke);
            for (i = 0; i < antal; i++) {
                var v = r(0, Math.PI * 2), fart = r(60, 160 + 420 * styrke);
                e.gnister.push({
                    x: e.x, y: e.y + 6,
                    vx: Math.cos(v) * fart, vy: Math.sin(v) * fart * 0.8 + 60,
                    liv: r(0.5, 1), r: r(1.2, 3.2),
                    farve: "hsl(" + Math.round(r(25, 55)) + ", 100%, " + Math.round(r(55, 75)) + "%)"
                });
            }
            this.front = 0;
            this.frontAlfa = 1;
            this.ryst = 16 * styrke;
            this.rekylFart = -320 * styrke;
            this.varme = 1;
            this.omdan(rx);
        }
        var puf = styrke > 0 ? Math.round(5 + 10 * styrke) : 4;
        for (i = 0; i < puf; i++) {
            e.roeg.push({ x: e.x + r(-12, 12), y: e.y + r(0, 14), vx: r(-30, 30), vy: r(-40, -12), r: r(6, 12), liv: r(0.8, 1.2) });
        }

        this.h = 0;
        this.o = 0;
        if (NK.Lyd) NK.Lyd.knald(rx.styrke);
        this.besked(M.ord(rx.styrke), styrke >= 0.95 ? "knald stor" : (styrke > 0 ? "knald" : "info"));
        this.aendret("knald");
    };

    /* Det, der har reageret, bliver til vand. Overskuddet bliver. */
    P.omdan = function (rx) {
        var brugtH2 = rx.h2Brugt, brugtO2 = rx.o2Brugt;
        var pladser = [];
        var i, m;
        for (i = this.molekyler.length - 1; i >= 0; i--) {
            m = this.molekyler[i];
            if (m.doer) continue;
            if (m.type === "h2" && brugtH2 > 0) { brugtH2--; pladser.push(m); this.molekyler.splice(i, 1); }
            else if (m.type === "o2" && brugtO2 > 0) { brugtO2--; pladser.push(m); this.molekyler.splice(i, 1); }
        }
        for (i = 0; i < rx.h2o; i++) {
            var fra = pladser[i % Math.max(1, pladser.length)] || { x: G.MIDT, y: 150 };
            var v = r(0, Math.PI * 2);
            this.molekyler.push({
                type: "h2o", x: NK.klamp(fra.x + r(-6, 6), G.V + 12, G.HO - 12), y: fra.y + r(-6, 6),
                vx: Math.cos(v) * 200, vy: Math.sin(v) * 200, a: r(0, 6.28), va: r(-4, 4), alfa: 1, doer: false
            });
        }
        for (i = 0; i < this.molekyler.length; i++) {
            m = this.molekyler[i];
            m.vx *= 4;
            m.vy *= 4;
        }
        for (i = 0; i < rx.h2o * 3; i++) {
            this.dug.push({ x: r(G.V + 4, G.HO - 4), y: r(G.TOP + 6, G.STREG6), r: r(1.1, 2.6), alfa: r(-1.2, -0.4), doer: false });
        }
    };

    P.nytMolekyle = function () {
        var type = this.venter.h2 >= this.venter.o2 ? "h2" : "o2";
        if (this.venter[type] <= 0) return;
        this.venter[type]--;
        var bund = G.TOP + this.niveau * G.STREG;
        var rad = S.MOLEKYLRADIUS[type];
        this.molekyler.push({
            type: type,
            x: G.MIDT + r(-14, 14),
            y: Math.max(G.TOP + rad, bund - rad),
            vx: r(-40, 40), vy: r(-70, -30),
            a: r(0, 6.28), va: r(-2, 2),
            alfa: 0, doer: false
        });
    };

    P.ankomHjem = function () {
        if (this.skalFyldes) {
            this.tilstand = "fylder";
            this.fyldUr = FYLD_TID;
            for (var i = 0; i < this.molekyler.length; i++) this.molekyler[i].doer = true;
            for (var d = 0; d < this.dug.length; d++) this.dug[d].doer = true;
        } else {
            this.tilstand = "klar";
        }
        this.aendret("hjem");
    };

    /* ----- Mus og beroering --------------------------------------------- */
    P.tilBord = function (ev) {
        var rect = this.canvas.getBoundingClientRect();
        var sk = S.skala(this.laerred.b, this.laerred.h);
        return { x: (ev.clientX - rect.left - sk.dx) / sk.s, y: (ev.clientY - rect.top - sk.dy) / sk.s };
    };

    P.overGlas = function (p) {
        var l = S.bordTilGlas({ x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel }, p.x, p.y);
        return l.x > -14 && l.x < G.B + 14 && l.y > -12 && l.y < G.H + 8;
    };

    P.overFlaske = function (p) {
        for (var gas in S.FLASKER) {
            if (!Object.prototype.hasOwnProperty.call(S.FLASKER, gas)) continue;
            var f = S.FLASKER[gas].ramme;
            if (p.x > f.x0 && p.x < f.x1 && p.y > f.y0 && p.y < f.y1) return gas;
        }
        return null;
    };

    P.ned = function (p) {
        if (NK.Lyd) NK.Lyd.laasOp();
        if (this.overGlas(p)) {
            if (this.tilstand !== "klar") return false;
            if (!this.fuld()) {
                this.besked("Fyld glasset helt op (6 streger), før du tager det op.", "advarsel");
                return false;
            }
            this.tilstand = "traek";
            this.traek = { dx: p.x - this.glas.x, dy: p.y - this.glas.y };
            this.aendret("traek");
            return true;
        }
        var gas = this.overFlaske(p);
        if (gas) this.tilfoej(gas);
        return false;
    };

    P.flyt = function (p) {
        if (this.tilstand !== "traek" || !this.traek) {
            this.hover = this.overGlas(p) ? "glas" : this.overFlaske(p);
            return;
        }
        var nx = NK.klamp(p.x - this.traek.dx, 60, 960);
        var ny = NK.klamp(p.y - this.traek.dy, S.TAEND.y - 30, S.HJEM.y);
        this.vinkelMaal = NK.klamp((nx - this.glas.x) * 0.025, -0.3, 0.3);
        this.glas.x = nx;
        this.glas.y = ny;
        var dx = nx - S.TAEND.x, dy = ny - S.TAEND.y;
        if (dx * dx + dy * dy < 58 * 58) this.knald();
    };

    P.op = function () {
        if (this.tilstand !== "traek") return;
        this.traek = null;
        var dx = S.HJEM.x - this.glas.x, dy = S.HJEM.y - this.glas.y;
        var afstand = Math.sqrt(dx * dx + dy * dy);
        var mig = this;
        this.flyv(S.HJEM, 0.3 + afstand / 900, function () {
            mig.tilstand = "klar";
            mig.aendret("hjem");
        });
    };

    P.bindMus = function () {
        var mig = this;
        var c = this.canvas;
        c.addEventListener("pointerdown", function (ev) {
            if (mig.ned(mig.tilBord(ev))) {
                try { c.setPointerCapture(ev.pointerId); } catch (fejl) {}
                ev.preventDefault();
            }
        });
        c.addEventListener("pointermove", function (ev) {
            mig.flyt(mig.tilBord(ev));
            c.style.cursor = mig.tilstand === "traek" ? "grabbing"
                : (mig.hover === "glas" && mig.tilstand === "klar" ? (mig.fuld() ? "grab" : "not-allowed")
                : (mig.hover && mig.tilstand === "klar" ? "pointer" : "default"));
        });
        c.addEventListener("pointerup", function () { mig.op(); });
        c.addEventListener("pointercancel", function () { mig.op(); });
        c.addEventListener("pointerleave", function () { if (mig.tilstand !== "traek") mig.hover = null; });
    };

    /* ----- Tidens gang --------------------------------------------------- */
    P.opdater = function (dt) {
        var i;
        if (dt > 0.1) dt = 0.1;
        this.tid += dt;

        /* Glasset glider */
        if (this.tilstand === "flyver" && this.bane) {
            var b = this.bane;
            b.t = Math.min(1, b.t + dt / b.varighed);
            var t = NK.blod(b.t);
            var top = Math.min(b.fra.y, b.til.y) - b.loeft;
            var u = 1 - t;
            var nx = u * u * u * b.fra.x + 3 * u * u * t * b.fra.x + 3 * u * t * t * b.til.x + t * t * t * b.til.x;
            var ny = u * u * u * b.fra.y + 3 * u * u * t * top + 3 * u * t * t * top + t * t * t * b.til.y;
            this.vinkelMaal = NK.klamp((nx - this.glas.x) / Math.max(dt, 0.001) * 0.0009, -0.3, 0.3);
            this.glas.x = nx;
            this.glas.y = ny;
            if (b.t >= 1) {
                this.bane = null;
                this.vinkelMaal = 0;
                b.efter.call(this);
            }
        } else if (this.tilstand !== "traek") {
            this.vinkelMaal = 0;
        }
        this.glas.vinkel = NK.mod(this.glas.vinkel, this.vinkelMaal, 10, dt);
        if (this.tilstand === "traek") this.vinkelMaal = NK.mod(this.vinkelMaal, 0, 6, dt);

        if (this.tilstand === "knald") {
            this.knaldUr -= dt;
            if (this.knaldUr <= 0) this.flyv(S.HJEM, 1.0, this.ankomHjem);
        }

        if (this.tilstand === "fylder") {
            this.fyldUr -= dt;
            if (this.fyldUr <= 0) {
                this.tilstand = "klar";
                this.skalFyldes = false;
                this.aendret("klar");
            }
        }

        /* Gassens niveau og vandet i glasset */
        var maalNiveau = this.skalFyldes ? (this.tilstand === "fylder" ? 0 : M.MAKS) : this.h + this.o;
        this.niveau = NK.mod(this.niveau, maalNiveau, this.tilstand === "fylder" ? 7 : 5, dt);
        var underVand = this.glas.y + this.rekyl > S.BAD.overflade + 4 && this.glas.x > S.BAD.indreV && this.glas.x < S.BAD.indreH;
        if (!underVand && this.vand > 0.6) {
            for (i = 0; i < 6; i++) {
                this.e.draaber.push({ x: this.glas.x + r(-26, 26), y: this.glas.y + r(-4, 4), vy: r(0, 60), liv: 1 });
            }
        }
        this.vand = underVand ? NK.mod(this.vand, 1, 6, dt) : Math.max(0, this.vand - dt * 3);

        /* Nye molekyler kommer op gennem vandet */
        this.spawnUr -= dt;
        if (this.spawnUr <= 0 && (this.venter.h2 > 0 || this.venter.o2 > 0)) {
            this.nytMolekyle();
            this.spawnUr = 0.1;
        }

        this.opdaterMolekyler(dt);
        this.opdaterBobler(dt);
        this.opdaterEffekter(dt);

        this.flow.h2 = Math.max(0, this.flow.h2 - dt * 1.3);
        this.flow.o2 = Math.max(0, this.flow.o2 - dt * 1.3);
    };

    P.opdaterMolekyler = function (dt) {
        var bund = G.TOP + this.niveau * G.STREG;
        var grundfart = 36 + this.varme * 240;
        this.varme = Math.max(0, this.varme - dt * 0.55);
        for (var i = this.molekyler.length - 1; i >= 0; i--) {
            var m = this.molekyler[i];
            if (m.doer) {
                m.alfa -= dt * 2.4;
                if (m.alfa <= 0) { this.molekyler.splice(i, 1); continue; }
            } else {
                m.alfa = Math.min(1, m.alfa + dt * 4);
            }
            m.vx += (Math.random() - 0.5) * 260 * dt;
            m.vy += (Math.random() - 0.5) * 260 * dt;
            var fart = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
            var ny = NK.mod(fart, grundfart, 2.5, dt);
            m.vx *= ny / fart;
            m.vy *= ny / fart;
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.a += m.va * dt;

            var rad = S.MOLEKYLRADIUS[m.type];
            var x0 = G.V + rad, x1 = G.HO - rad, y0 = G.TOP + rad, y1 = Math.max(y0, bund - rad);
            if (m.x < x0) { m.x = x0; m.vx = Math.abs(m.vx); }
            if (m.x > x1) { m.x = x1; m.vx = -Math.abs(m.vx); }
            if (m.y < y0) { m.y = y0; m.vy = Math.abs(m.vy); }
            if (m.y > y1) { m.y = y1; m.vy = -Math.abs(m.vy); }
        }
        for (var d = this.dug.length - 1; d >= 0; d--) {
            var dr = this.dug[d];
            if (dr.doer) {
                dr.alfa = Math.min(dr.alfa, 1) - dt * 2;
                if (dr.alfa <= 0) this.dug.splice(d, 1);
            } else if (dr.alfa < 1) {
                dr.alfa += dt * 1.6;
            }
        }
    };

    P.opdaterBobler = function (dt) {
        var hjemme = this.tilstand === "klar" || this.tilstand === "fylder";
        var graense = this.glas.y - (G.MUND - (G.TOP + this.niveau * G.STREG));
        for (var i = this.bobler.length - 1; i >= 0; i--) {
            var b = this.bobler[i];
            if (!hjemme) { this.bobler.splice(i, 1); continue; }
            if (b.vent > 0) { b.vent -= dt; continue; }
            b.y -= b.v * dt;
            b.x = b.x0 + (S.HJEM.x - b.x0) * NK.klamp((S.SLANGER.h2.ende.y - b.y) / 30, 0, 1) + Math.sin(this.tid * 9 + b.fase) * 1.6;
            if (b.y <= graense) this.bobler.splice(i, 1);
        }
    };

    P.opdaterEffekter = function (dt) {
        var e = this.e;
        var i;
        e.blink = Math.max(0, e.blink - dt * 3);
        e.stik = Math.max(0, e.stik - dt * 2.6);

        if (this.front >= 0) {
            this.front += dt / 0.16;
            if (this.front >= 1) {
                this.front = 1;
                this.frontAlfa -= dt * 4;
                if (this.frontAlfa <= 0) this.front = -1;
            }
        }

        for (i = e.ringe.length - 1; i >= 0; i--) {
            var ring = e.ringe[i];
            ring.r += dt * (260 + 520 * e.styrke);
            ring.liv -= dt * 2.2;
            if (ring.liv <= 0) e.ringe.splice(i, 1);
        }
        for (i = e.gnister.length - 1; i >= 0; i--) {
            var g = e.gnister[i];
            g.vx *= 1 - dt * 1.8;
            g.vy += TYNGDE * 0.35 * dt;
            g.x += g.vx * dt;
            g.y += g.vy * dt;
            g.liv -= dt * 1.4;
            if (g.liv <= 0) e.gnister.splice(i, 1);
        }
        for (i = e.roeg.length - 1; i >= 0; i--) {
            var p = e.roeg[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.r += dt * 18;
            p.liv -= dt * 0.6;
            if (p.liv <= 0) e.roeg.splice(i, 1);
        }
        for (i = e.draaber.length - 1; i >= 0; i--) {
            var d = e.draaber[i];
            d.vy += TYNGDE * dt;
            d.y += d.vy * dt;
            d.liv -= dt * 1.2;
            if (d.liv <= 0 || d.y > S.BORD) e.draaber.splice(i, 1);
        }

        /* Glasset hopper op ved knaldet og falder til ro igen */
        this.rekylFart += (-this.rekyl * 90 - this.rekylFart * 9) * dt;
        this.rekyl += this.rekylFart * dt;
        this.ryst = this.ryst > 0.3 ? this.ryst * (1 - dt * 6) : 0;
    };

    /* ----- Tegning -------------------------------------------------------- */
    P.tilpas = function () {
        return this.laerred.tilpas();
    };

    P.tegn = function () {
        var L = this.laerred;
        var ctx = L.ctx;
        ctx.clearRect(0, 0, L.b, L.h);
        var sk = S.skala(L.b, L.h);
        var klar = this.tilstand === "klar";

        ctx.save();
        ctx.translate(sk.dx, sk.dy);
        ctx.scale(sk.s, sk.s);
        if (this.ryst > 0) ctx.translate((Math.random() - 0.5) * this.ryst, (Math.random() - 0.5) * this.ryst);

        S.tegnBaggrund(ctx);
        S.tegnFlaske(ctx, S.FLASKER.h2, klar && !this.fuld() && this.hover === "h2", this.flow.h2);
        S.tegnFlaske(ctx, S.FLASKER.o2, klar && !this.fuld() && this.hover === "o2", this.flow.o2);
        S.tegnSlange(ctx, "o2", this.flow.o2, this.tid);
        S.tegnSlange(ctx, "h2", this.flow.h2, this.tid);
        S.tegnBraender(ctx, this.tid);

        S.tegnGlas(ctx, {
            x: this.glas.x, y: this.glas.y + this.rekyl, vinkel: this.glas.vinkel,
            niveau: this.niveau, vand: this.vand,
            molekyler: this.molekyler, dug: this.dug,
            front: this.front, frontAlfa: this.frontAlfa,
            fremhaev: klar && this.fuld() ? 1 : 0,
            s: sk.s
        }, this.tid);
        S.tegnBad(ctx);
        S.tegnBobler(ctx, this.bobler);
        if (klar && this.fuld()) S.tegnPil(ctx, this.glas, this.tid);
        S.tegnKnald(ctx, this.e);
        ctx.restore();
    };
}());

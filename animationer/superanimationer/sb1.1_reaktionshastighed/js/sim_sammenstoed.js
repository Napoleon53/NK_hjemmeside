/* =====================================================================
   sim_sammenstoed.js - fane 2: Sammenstoed

   Partiklerne reagerer kun, naar de stoeder sammen. Hastigheden er ikke
   en formel her: det er det, partiklerne selv goer. Kurven til hoejre
   taeller produktet, mens det dannes, og flader ud, fordi der bliver
   faerre at stoede ind i.

   To opstillinger:
     opl     A + B → C i en opløsning. Antallet af A og B (6, 12, 24)
             er koncentrationen.
     metal   Mg(s) + 2 H⁺(aq) → Mg²⁺(aq) + H₂(g). Samme 36 Mg-atomer
             som én klump, fire stykker eller ni korn. H⁺ kan kun ramme
             de yderste atomer; et atom, der er ramt to gange, gaar i
             opløsning som Mg²⁺, og der stiger en H₂-boble op.

   Alt regnes i en verden paa 600 x 440 enheder, uafhaengigt af
   skaermen, saa hastighederne er de samme paa alle skaerme og i
   selvtesten. Kun tegningen skaleres.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    var VB = 600, VH = 440;             /* verdenens stoerrelse */
    var FART = 260;                     /* enheder pr. sekund, samme for alle */
    var R = { A: 14, B: 14, C: 17, H: 7, Mg: 12, Mg2: 9 };
    var P_REAKT = 0.15;                 /* andel af sammenstoed A-B, der giver C */
    var P_METAL = 0.06;                 /* andel af H⁺, der rammer Mg og reagerer */
    var ANTAL_H = 90;
    var GRAF_T = 60;                    /* s paa grafens tidsakse */
    var VINDUE = 3;                     /* s, sammenstoed pr. sekund maales over */
    var DT_MAKS = 1 / 120;
    var SKRIFT = "'Segoe UI', sans-serif";

    var FARVE = { A: "#5fb6f0", B: "#f0a830", H: "#ff8a80", Mg: "#b9c0c9", Mg2: "#9fe0c4", H2: "#e9f4ff" };

    /* Magnesium: samme 36 atomer, delt i stykker. [midte x, midte y, side] */
    var METAL = {
        klump:   [[300, 220, 6]],
        stykker: [[185, 135, 3], [415, 135, 3], [185, 305, 3], [415, 305, 3]],
        pulver:  [[150, 110, 2], [300, 110, 2], [450, 110, 2],
                  [150, 220, 2], [300, 220, 2], [450, 220, 2],
                  [150, 330, 2], [300, 330, 2], [450, 330, 2]]
    };
    var METAL_NAVN = { klump: "klump", stykker: "stykker", pulver: "pulver" };

    function SimSammenstoed() {
        this.L = new NK.Laerred(NK.el("sam-laerred"));
        this.tid = 0;                  /* ur, der altid gaar (Kemichael) */
        this.opst = "opl";
        this.nA = 12;
        this.nB = 12;
        this.metal = "klump";
        this.forrige = null;
        this.lay = null;
        this.kort = new NK.Opgavekort("sam", D.SAM_OPGAVER, this);
        this.bind();
        this.start(false);
    }

    var P = SimSammenstoed.prototype;

    /* ----- Et nyt forsoeg ----------------------------------------------- */
    P.start = function (gemForrige) {
        /* Det forsoeg, der sluttes, bliver staaende som "foer" med sit
           eget navn (indstillingerne er allerede skiftet, naar vi er her) */
        if (gemForrige !== false && this.kurve && this.kurve.length > 8) {
            this.forrige = { kurve: this.kurve, opst: this.koersOpst, etiket: this.koersEtiket, maks: this.maks };
        }
        this.koersOpst = this.opst;
        this.koersEtiket = this.etiket();
        this.t = 0;
        this.hits = [];
        this.antalHits = 0;
        this.dannet = 0;
        this.kurve = [{ t: 0, n: 0 }];
        this.partikler = [];
        this.atomer = [];
        this.bobler = [];
        if (this.opst === "opl") {
            this.maks = Math.min(this.nA, this.nB);
            for (var i = 0; i < this.nA; i++) this.nyPartikel("A");
            for (i = 0; i < this.nB; i++) this.nyPartikel("B");
        } else {
            this.bygMetal();
            this.maks = this.atomer.length;
            for (i = 0; i < ANTAL_H; i++) this.nyPartikel("H");
        }
        this.visPanel();
    };

    P.etiket = function () {
        return this.opst === "opl" ? this.nA + " A + " + this.nB + " B" : METAL_NAVN[this.metal];
    };

    P.bygMetal = function () {
        var mig = this, d = 2 * R.Mg;
        METAL[this.metal].forEach(function (st) {
            var n = st[2], x0 = st[0] - (n - 1) * d / 2, y0 = st[1] - (n - 1) * d / 2;
            for (var i = 0; i < n; i++) {
                for (var j = 0; j < n; j++) {
                    mig.atomer.push({ x: x0 + i * d, y: y0 + j * d, ladning: 0, blink: 0 });
                }
            }
        });
    };

    /* En partikel et ledigt sted med tilfaeldig retning */
    P.nyPartikel = function (type, x, y) {
        var r = R[type], forsoeg = 0;
        if (x === undefined) {
            do {
                x = r + NK.tilf() * (VB - 2 * r);
                y = r + NK.tilf() * (VH - 2 * r);
                forsoeg++;
            } while (forsoeg < 200 && this.optaget(x, y, r));
        }
        var v = NK.tilf() * Math.PI * 2;
        var p = { type: type, x: x, y: y, vx: Math.cos(v) * FART, vy: Math.sin(v) * FART, r: r, blink: 0, drej: NK.tilf() * 6.28 };
        this.partikler.push(p);
        return p;
    };

    P.optaget = function (x, y, r) {
        var i, q;
        for (i = 0; i < this.partikler.length; i++) {
            q = this.partikler[i];
            if (Math.hypot(q.x - x, q.y - y) < q.r + r + 2) return true;
        }
        for (i = 0; i < this.atomer.length; i++) {
            q = this.atomer[i];
            if (Math.hypot(q.x - x, q.y - y) < R.Mg + r + 2) return true;
        }
        return false;
    };

    /* ----- Fysikken ------------------------------------------------------- */
    P.opdater = function (dt) {
        this.tid += dt;
        var n = Math.ceil(dt / DT_MAKS);
        for (var i = 0; i < n; i++) this.skridt(dt / n);
        this.visPanel();
    };

    /* Koerer forsoeget frem uden tegning (selvtesten) */
    P.koer = function (sek) {
        for (var t = 0; t < sek; t += 1 / 60) this.opdater(1 / 60);
    };

    P.skridt = function (dt) {
        var ps = this.partikler, i, j, a, b;
        this.t += dt;

        for (i = 0; i < ps.length; i++) {
            a = ps[i];
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            if (a.x < a.r) { a.x = a.r; a.vx = Math.abs(a.vx); }
            if (a.x > VB - a.r) { a.x = VB - a.r; a.vx = -Math.abs(a.vx); }
            if (a.y < a.r) { a.y = a.r; a.vy = Math.abs(a.vy); }
            if (a.y > VH - a.r) { a.y = VH - a.r; a.vy = -Math.abs(a.vy); }
            if (a.blink > 0) a.blink -= dt * 3;
            a.drej += dt * 0.8;
        }
        for (i = 0; i < this.atomer.length; i++) {
            if (this.atomer[i].blink > 0) this.atomer[i].blink -= dt * 5;
        }

        /* Partikel mod partikel: elastisk stoed mellem lige tunge partikler */
        var reagerer = [];
        for (i = 0; i < ps.length; i++) {
            a = ps[i];
            for (j = i + 1; j < ps.length; j++) {
                b = ps[j];
                var dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r;
                if (dx * dx + dy * dy >= rr * rr) continue;
                var d = Math.sqrt(dx * dx + dy * dy) || 0.01, nx = dx / d, ny = dy / d;
                var vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                if (vn >= 0) continue;          /* er allerede paa vej fra hinanden */
                a.vx += vn * nx; a.vy += vn * ny;
                b.vx -= vn * nx; b.vy -= vn * ny;
                if ((a.type === "A" && b.type === "B") || (a.type === "B" && b.type === "A")) {
                    this.hit();
                    a.blink = b.blink = 1;
                    if (!a.brugt && !b.brugt && NK.tilf() < P_REAKT) {
                        a.brugt = b.brugt = true;
                        reagerer.push([a, b]);
                    }
                }
            }
        }
        for (i = 0; i < reagerer.length; i++) this.reager(reagerer[i][0], reagerer[i][1]);

        if (this.atomer.length) this.metalSkridt();

        for (i = this.bobler.length - 1; i >= 0; i--) {
            var bo = this.bobler[i];
            bo.y -= 70 * dt;
            bo.x += Math.sin(this.t * 5 + bo.fase) * 12 * dt;
            if (bo.y < -20) this.bobler.splice(i, 1);
        }

        var sidste = this.kurve[this.kurve.length - 1];
        if (this.t <= GRAF_T + 0.25 && this.t - sidste.t >= 0.25) this.kurve.push({ t: this.t, n: this.dannet });
    };

    P.hit = function () {
        this.hits.push(this.t);
        this.antalHits++;
        while (this.hits.length && this.hits[0] < this.t - VINDUE) this.hits.shift();
    };

    /* A og B bliver til C midt imellem dem */
    P.reager = function (a, b) {
        this.partikler.splice(this.partikler.indexOf(a), 1);
        this.partikler.splice(this.partikler.indexOf(b), 1);
        var c = this.nyPartikel("C", (a.x + b.x) / 2, (a.y + b.y) / 2);
        var vx = a.vx + b.vx, vy = a.vy + b.vy, v = Math.hypot(vx, vy);
        if (v > 1) { c.vx = vx / v * FART; c.vy = vy / v * FART; }
        c.drej = Math.atan2(b.y - a.y, b.x - a.x);
        c.blink = 1;
        this.dannet++;
    };

    /* H⁺ og Mg²⁺ mod metallets atomer, der staar fast */
    P.metalSkridt = function () {
        var ps = this.partikler, at = this.atomer;
        for (var i = ps.length - 1; i >= 0; i--) {
            var p = ps[i];
            for (var j = 0; j < at.length; j++) {
                var m = at[j];
                var dx = p.x - m.x, dy = p.y - m.y, rr = p.r + R.Mg;
                if (dx * dx + dy * dy >= rr * rr) continue;
                var d = Math.sqrt(dx * dx + dy * dy) || 0.01, nx = dx / d, ny = dy / d;
                var vn = p.vx * nx + p.vy * ny;
                if (vn >= 0) continue;
                p.vx -= 2 * vn * nx; p.vy -= 2 * vn * ny;
                if (p.type !== "H") continue;
                this.hit();
                m.blink = 1;
                if (NK.tilf() < P_METAL) {
                    ps.splice(i, 1);                 /* H⁺ bliver brugt */
                    m.ladning++;
                    if (m.ladning >= 2) this.oploes(j);
                    break;
                }
            }
        }
    };

    /* Atomet er ramt af to H⁺: det gaar i opløsning som Mg²⁺, og H₂ stiger op */
    P.oploes = function (j) {
        var m = this.atomer[j];
        this.atomer.splice(j, 1);
        var ion = this.nyPartikel("Mg2", m.x, m.y);
        ion.blink = 1;
        this.bobler.push({ x: m.x, y: m.y, fase: NK.tilf() * 6.28 });
        this.dannet++;
    };

    /* Sammenstoed pr. sekund over de sidste VINDUE sekunder */
    P.hitsPrSek = function () {
        if (this.t < 0.5) return null;
        return this.hits.length / Math.min(VINDUE, this.t);
    };

    /* ----- Opgaverne --------------------------------------------------- */
    P.opsaetOpgave = function (o) {
        var s = o.opsaet;
        var aendret = s.opstilling !== this.opst || (s.nA && s.nA !== this.nA) || (s.nB && s.nB !== this.nB) || (s.metal && s.metal !== this.metal);
        if (!aendret) return;
        if (s.opstilling !== this.opst) this.forrige = null;
        this.opst = s.opstilling;
        if (s.nA) this.nA = s.nA;
        if (s.nB) this.nB = s.nB;
        if (s.metal) this.metal = s.metal;
        this.start(false);
    };

    P.slutOpgave = function () {};

    P.nulstil = function () { this.start(); };

    /* ----- Panelet ------------------------------------------------------ */
    P.bind = function () {
        var mig = this;
        function knapper(sel, fn) {
            Array.prototype.forEach.call(document.querySelectorAll(sel), function (k) {
                k.addEventListener("click", function () { fn(k); });
            });
        }
        knapper("#sam-opstilling [data-opst]", function (k) {
            var ny = k.getAttribute("data-opst");
            if (ny === mig.opst) return;
            mig.forrige = null;
            mig.opst = ny;
            mig.start(false);
        });
        knapper("#sam-opstilling [data-na]", function (k) { mig.nA = +k.getAttribute("data-na"); mig.start(); });
        knapper("#sam-opstilling [data-nb]", function (k) { mig.nB = +k.getAttribute("data-nb"); mig.start(); });
        knapper("#sam-opstilling [data-metal]", function (k) { mig.metal = k.getAttribute("data-metal"); mig.start(); });
        NK.el("sam-forfra").addEventListener("click", function () { mig.start(); });

        var cv = this.L.canvas;
        cv.addEventListener("pointerdown", function (e) {
            var p = mig.L.punkt(e);
            if (NK.laererFanger) NK.laererFanger(p);
        });
        cv.addEventListener("pointermove", function (e) {
            var p = mig.L.punkt(e);
            cv.style.cursor = NK.laererUnder && NK.laererUnder(p) ? "pointer" : "default";
        });
    };

    P.visPanel = function () {
        function marker(sel, attr, vaerdi) {
            Array.prototype.forEach.call(document.querySelectorAll(sel), function (k) {
                k.classList.toggle("aktiv", k.getAttribute(attr) === String(vaerdi));
            });
        }
        marker("#sam-opstilling [data-opst]", "data-opst", this.opst);
        marker("#sam-opstilling [data-na]", "data-na", this.nA);
        marker("#sam-opstilling [data-nb]", "data-nb", this.nB);
        marker("#sam-opstilling [data-metal]", "data-metal", this.metal);
        NK.el("sam-opl").hidden = this.opst !== "opl";
        NK.el("sam-metal").hidden = this.opst !== "metal";

        var h = this.hitsPrSek();
        NK.saetTekst("sam-hits", h === null ? "…" : String(Math.round(h)));
        NK.saetTekst("sam-hits-navn", this.opst === "opl" ? "Sammenstød mellem A og B pr. sekund" : "H⁺ mod metallet pr. sekund");
        NK.saetTekst("sam-reageret-navn", this.opst === "opl" ? "Dannet C" : "Dannet H₂");
        NK.saetTekst("sam-reageret", this.dannet + " af " + this.maks);
        NK.saetTekst("sam-tid", Math.floor(this.t) + " s");
    };

    /* ----- Tegning ------------------------------------------------------- */
    P.tilpas = function () {
        var ny = this.L.tilpas();
        if (!ny && this.lay) return;
        var W = this.L.b, H = this.L.h;
        var kb = W * 0.56, kh = H - 64 - 58;
        var s = Math.min(kb / VB, kh / VH);
        this.lay = {
            W: W, H: H, s: s,
            kx: 18 + (kb - VB * s) / 2, ky: 64,
            gx0: 18 + kb + 70, gx1: W - 28,
            gy0: 64, gy1: H - 64
        };
    };

    P.tegn = function () {
        var ctx = this.L.ctx, lay = this.lay;
        this.L.ryd();
        if (!lay) return;
        this.tegnKasse(ctx);
        this.tegnGraf(ctx);
    };

    function kugle(ctx, x, y, r, farve) {
        var g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.15, x, y, r);
        g.addColorStop(0, "rgba(255,255,255,0.85)");
        g.addColorStop(0.25, farve);
        g.addColorStop(1, farve);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.stroke();
    }

    function blink(ctx, x, y, r, a) {
        if (a <= 0) return;
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "rgba(255,255,255," + (0.8 * a).toFixed(3) + ")";
        ctx.stroke();
    }

    P.tegnKasse = function (ctx) {
        var lay = this.lay, s = lay.s, kx = lay.kx, ky = lay.ky;
        function X(x) { return kx + x * s; }
        function Y(y) { return ky + y * s; }

        NK.tekst(ctx, this.opst === "opl" ? "A + B → C" : "Mg(s) + 2 H⁺(aq) → Mg²⁺(aq) + H₂(g)",
            kx + VB * s / 2, ky - 24, { font: "600 17px " + SKRIFT, justering: "center", farve: "#f2f3f5" });

        ctx.save();
        NK.rundtRekt(ctx, kx - 4, ky - 4, VB * s + 8, VH * s + 8, 10);
        ctx.fillStyle = this.opst === "opl" ? "rgba(90, 140, 190, 0.08)" : "rgba(120, 170, 120, 0.08)";
        ctx.fill();
        ctx.strokeStyle = "rgba(214, 234, 248, 0.45)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.clip();

        var i;
        for (i = 0; i < this.atomer.length; i++) {
            var m = this.atomer[i];
            kugle(ctx, X(m.x), Y(m.y), R.Mg * s, FARVE.Mg);
            if (m.ladning > 0) {
                ctx.beginPath();
                ctx.arc(X(m.x), Y(m.y), R.Mg * s - 2, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#ff8a80";
                ctx.stroke();
            }
            blink(ctx, X(m.x), Y(m.y), R.Mg * s, m.blink * 0.6);
        }
        for (i = 0; i < this.partikler.length; i++) {
            var p = this.partikler[i], x = X(p.x), y = Y(p.y), r = p.r * s;
            if (p.type === "C") {
                var ox = Math.cos(p.drej) * 7 * s, oy = Math.sin(p.drej) * 7 * s;
                kugle(ctx, x - ox, y - oy, 11 * s, FARVE.A);
                kugle(ctx, x + ox, y + oy, 11 * s, FARVE.B);
            } else if (p.type === "H") {
                kugle(ctx, x, y, r, FARVE.H);
                ctx.strokeStyle = "#5a1d18";
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(x - r * 0.5, y); ctx.lineTo(x + r * 0.5, y);
                ctx.moveTo(x, y - r * 0.5); ctx.lineTo(x, y + r * 0.5);
                ctx.stroke();
            } else {
                kugle(ctx, x, y, r, FARVE[p.type]);
            }
            blink(ctx, x, y, r, p.blink);
        }
        for (i = 0; i < this.bobler.length; i++) {
            var bo = this.bobler[i];
            ctx.beginPath();
            ctx.arc(X(bo.x), Y(bo.y), 9 * s, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(233, 244, 255, 0.18)";
            ctx.fill();
            ctx.strokeStyle = "rgba(233, 244, 255, 0.8)";
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }
        ctx.restore();

        /* Forklaringen under kassen */
        var tegn = this.opst === "opl"
            ? [["A", FARVE.A, "A"], ["B", FARVE.B, "B"], ["C", null, "C (produkt)"]]
            : [["Mg", FARVE.Mg, "Mg"], ["H", FARVE.H, "H⁺"], ["Mg2", FARVE.Mg2, "Mg²⁺"], ["H2", null, "H₂"]];
        var lx = kx, ly = ky + VH * s + 30;
        ctx.save();
        ctx.font = "13px " + SKRIFT;
        tegn.forEach(function (t) {
            if (t[0] === "C") {
                kugle(ctx, lx + 3, ly - 4, 7, FARVE.A);
                kugle(ctx, lx + 11, ly - 4, 7, FARVE.B);
                lx += 12;
            } else if (t[0] === "H2") {
                ctx.beginPath(); ctx.arc(lx + 6, ly - 4, 7, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(233, 244, 255, 0.8)"; ctx.lineWidth = 1.4; ctx.stroke();
            } else {
                kugle(ctx, lx + 6, ly - 4, 7, t[1]);
            }
            ctx.fillStyle = "#c8ced6";
            ctx.fillText(t[2], lx + 18, ly + 1);
            lx += 30 + ctx.measureText(t[2]).width;
        });
        ctx.restore();
    };

    P.tegnGraf = function (ctx) {
        var lay = this.lay;
        if (lay.gx1 - lay.gx0 < 120) return;
        /* Aksen passer til det, der hoejst kan dannes, nu og i forrige forsoeg */
        var sammen = this.forrige && this.forrige.opst === this.opst;
        var yMaks = Math.max(this.maks, sammen ? this.forrige.maks : 0);
        function X(t) { return lay.gx0 + t / GRAF_T * (lay.gx1 - lay.gx0); }
        function Y(n) { return lay.gy1 - n / yMaks * (lay.gy1 - lay.gy0); }

        ctx.save();
        ctx.font = "13px " + SKRIFT;
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        ctx.fillStyle = "#9fa6af";
        for (var t = 0; t <= GRAF_T; t += 10) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(X(t), lay.gy0); ctx.lineTo(X(t), lay.gy1); ctx.stroke();
            ctx.fillText(String(t), X(t), lay.gy1 + 19);
        }
        ctx.textAlign = "right";
        var trin = yMaks <= 6 ? 1 : yMaks <= 12 ? 2 : yMaks <= 24 ? 4 : 6;
        for (var n = 0; n <= yMaks; n += trin) {
            ctx.strokeStyle = "rgba(255,255,255,0.06)";
            ctx.beginPath(); ctx.moveTo(lay.gx0, Y(n)); ctx.lineTo(lay.gx1, Y(n)); ctx.stroke();
            ctx.fillText(String(n), lay.gx0 - 8, Y(n) + 4);
        }
        ctx.strokeStyle = "#6b7280";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lay.gx0, lay.gy0 - 8); ctx.lineTo(lay.gx0, lay.gy1); ctx.lineTo(lay.gx1 + 8, lay.gy1);
        ctx.stroke();
        ctx.fillStyle = "#c8ced6";
        ctx.font = "600 13px " + SKRIFT;
        ctx.textAlign = "center";
        ctx.fillText("t / s", (lay.gx0 + lay.gx1) / 2, lay.gy1 + 42);
        ctx.save();
        ctx.translate(lay.gx0 - 40, (lay.gy0 + lay.gy1) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(this.opst === "opl" ? "Antal C dannet" : "Antal H₂ dannet", 0, 0);
        ctx.restore();

        function linje(kurve, farve, stiplet) {
            ctx.save();
            if (stiplet) ctx.setLineDash([6, 5]);
            ctx.strokeStyle = farve;
            ctx.lineWidth = stiplet ? 2 : 3;
            ctx.lineJoin = "round";
            ctx.beginPath();
            kurve.forEach(function (q, i) {
                var x = X(Math.min(q.t, GRAF_T)), y = Y(q.n);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            });
            ctx.stroke();
            ctx.restore();
        }
        if (sammen) {
            var fk = this.forrige.kurve, fs = fk[fk.length - 1];
            linje(fk, "rgba(200, 206, 214, 0.55)", true);
            etiket("før: " + this.forrige.etiket, fs, 18, "13px", "#aeb4bc");
        }
        var farve = this.opst === "opl" ? "#c9a6ff" : "#9fe0c4";
        linje(this.kurve, farve, false);
        etiket("nu: " + this.koersEtiket, this.kurve[this.kurve.length - 1], -10, "600 13px", farve);
        ctx.restore();

        /* Navnet ved kurvens ende: til hoejre for enden, til venstre, naar
           kurven er naaet over midten */
        function etiket(tekst, q, dy, skrift, farve) {
            var x = X(Math.min(q.t, GRAF_T)), venstre = x > (lay.gx0 + lay.gx1) / 2;
            NK.tekst(ctx, tekst, venstre ? x - 4 : x + 8, Y(q.n) + dy,
                { font: skrift + " " + SKRIFT, justering: venstre ? "right" : "left", farve: farve, kant: true });
        }
    };

    NK.SimSammenstoed = SimSammenstoed;
}());

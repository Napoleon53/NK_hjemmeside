/* =====================================================================
   scene.js - glasset, krystallerne, bundfaldet og effekterne

   Glasset er sprites/baegerglas.svg (viewBox 1000 x 800) i fast forhold,
   nederst i midten af scenen. Maalene herunder er i glassets enheder.
   Krystallerne er DOM-kort (skarp tekst i Lexend), bundfaldet og
   effekterne tegnes paa to lag canvas: bag kortene (bundfaldet) og foran
   dem (bobler, gnister, point og glasstaven).

   var sc = new NK.Scene(elementer); sc.forbind(spil); sc.tegn(dt);
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};

    var G = { B: 1000, H: 800, venstre: 78, hoejre: 922, overflade: 112, bund: 758, hjoerne: 40 };
    var KORT_MAKS = 330, KORT_MIN = 200;

    /* Bundfaldets farver, et pr. lag: soelvchlorid, kobber(II)hydroxid,
       blyiodid, jern(III)hydroxid og nikkel(II)hydroxid. */
    var LAGFARVER = [
        { navn: "hvid", fyld: "#e9ecef", korn: "#a7b1bc" },
        { navn: "blaa", fyld: "#7fb2e0", korn: "#4f86bb" },
        { navn: "gul", fyld: "#f4d35e", korn: "#d4ac2b" },
        { navn: "brun", fyld: "#c47a3f", korn: "#94532a" },
        { navn: "groen", fyld: "#8fc79a", korn: "#5f9c6c" }
    ];

    function froe(n) {
        return function () {
            n = (n * 1664525 + 1013904223) >>> 0;
            return n / 4294967296;
        };
    }

    function Scene(el) {
        this.el = el;                      // { scene, glas, bag, for, kortlag }
        this.kort = {};                    // id -> { el, data }
        this.partikler = [];
        this.tekster = [];
        this.visLag = 0;                   // det tegnede antal lag (glider efter spillet)
        this.roer = 0;                     // glasstaven: sekunder tilbage
        this.blink = 0;
        this.tid = 0;
        this.lagKorn = LAGFARVER.map(function (f, i) {
            var r = froe(97 + i * 31), korn = [];
            for (var k = 0; k < 140; k++) korn.push([r(), r(), 0.6 + r() * 1.2, r()]);
            var kant = [];
            for (var p = 0; p <= 24; p++) kant.push(r());
            return { korn: korn, kant: kant };
        });
        this.maal();
    }

    /* Glassets plads i scenen i px. */
    Scene.prototype.maal = function () {
        var s = this.el.scene;
        var W = s.clientWidth || 800, H = s.clientHeight || 600;
        var skala = Math.min((W - 24) / G.B, (H - 10) / G.H);
        skala = Math.max(0.25, skala);
        var gx = (W - G.B * skala) / 2, gy = H - G.H * skala - 4;
        this.W = W; this.H = H; this.skala = skala;
        this.gx = gx; this.gy = gy;
        this.venstre = gx + G.venstre * skala;
        this.hoejre = gx + G.hoejre * skala;
        this.overflade = gy + G.overflade * skala;
        this.bundY = gy + G.bund * skala;
        this.hoejde = this.bundY - this.overflade;
        var g = this.el.glas;
        g.style.left = gx + "px";
        g.style.top = gy + "px";
        g.style.width = G.B * skala + "px";
        g.style.height = G.H * skala + "px";

        var indre = this.hoejre - this.venstre;
        this.baner = Math.max(1, Math.min(3, Math.floor(indre / 250)));
        this.kortBredde = Math.max(KORT_MIN, Math.min(KORT_MAKS, indre / this.baner - 20));
        if (this.kortBredde * this.baner > indre - 8) this.kortBredde = indre / this.baner - 8;
        if (this.spil) this.spil.baner = this.baner;

        var dpr = window.devicePixelRatio || 1;
        [this.el.bag, this.el.for].forEach(function (c) {
            c.width = Math.round(W * dpr);
            c.height = Math.round(H * dpr);
            c.style.width = W + "px";
            c.style.height = H + "px";
            c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
        });
        var self = this;
        Object.keys(this.kort).forEach(function (id) { self.saetF0(self.kort[id]); });
    };

    Scene.prototype.lagHoejde = function () { return NK.Spil.D.LAG_ANDEL * this.hoejde; };

    Scene.prototype.forbind = function (spil) {
        this.spil = spil;
        spil.baner = this.baner;
        this.visLag = spil.lag;
        this.ryd();
    };

    Scene.prototype.ryd = function () {
        var self = this;
        Object.keys(this.kort).forEach(function (id) { self.kort[id].el.remove(); });
        this.kort = {};
        this.partikler = [];
        this.tekster = [];
        this.roer = 0;
        if (this.spil) this.visLag = this.spil.lag;
    };

    /* ----- Krystallerne --------------------------------------------- */
    Scene.prototype.nytKort = function (k) {
        var o = this.spil.ord[k.i];
        var el = document.createElement("div");
        el.className = "krystal ind";
        el.style.width = this.kortBredde + "px";
        var p = document.createElement("p");
        p.className = "kr-tekst";
        p.textContent = o.tekst;
        var sk = document.createElement("p");
        sk.className = "kr-skelet";
        sk.setAttribute("aria-hidden", "true");
        /* Hjaelpen: det foerste bogstav og en streg for hvert af de andre,
           saa stregerne kan taelles. */
        NK.Ord.skelet(o.ord).replace(/ {3}/g, " ").split("").forEach(function (t) {
            var s = document.createElement("span");
            if (t === "_") s.className = "streg";
            else if (t === " ") s.className = "mellem";
            else { s.className = "tegn"; s.textContent = t; }
            sk.appendChild(s);
        });
        var svar = document.createElement("p");
        svar.className = "kr-svar";
        svar.textContent = "✓ " + o.ord;
        var indre = document.createElement("div");
        indre.className = "kr-indre";
        indre.appendChild(p);
        indre.appendChild(sk);
        indre.appendChild(svar);
        el.appendChild(indre);
        this.el.kortlag.appendChild(el);
        var v = { el: el, data: k, hoejde: 0 };
        this.kort[k.id] = v;
        this.saetF0(v);
        k.f = k.f0;
        this.placer(v);
        window.setTimeout(function () { el.classList.remove("ind"); }, 30);
        this.plask(this.kortX(k), this.overflade);
        return v;
    };

    Scene.prototype.saetF0 = function (v) {
        v.hoejde = v.el.offsetHeight || 110;
        var f0 = (v.hoejde + 12) / this.hoejde;
        f0 = Math.max(0.08, Math.min(0.5, f0));
        var k = v.data;
        if (k.f === k.f0) k.f = f0;
        else k.f = Math.max(k.f, f0);
        k.f0 = f0;
    };

    Scene.prototype.kortX = function (k) {
        var indre = this.hoejre - this.venstre;
        var bane = indre / this.baner;
        var plads = Math.max(0, bane - this.kortBredde - 10);
        return this.venstre + bane * (Math.min(k.bane, this.baner - 1) + 0.5) + k.skub * plads * 0.45;
    };

    Scene.prototype.placer = function (v) {
        var k = v.data;
        var x = this.kortX(k) - this.kortBredde / 2;
        var y = this.overflade + k.f * this.hoejde - v.hoejde;
        /* Et lille sving i vaesken (roligt, ingen flimren) */
        var sving = Math.sin(k.alder * 0.9 + k.id * 1.7) * 5 * this.skala;
        var drej = Math.sin(k.alder * 0.7 + k.id) * 1.2;
        if (k.alder < 0.35) y -= (1 - k.alder / 0.35) * (1 - k.alder / 0.35) * 60;
        v.el.style.transform = "translate(" + (x + sving).toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + drej.toFixed(2) + "deg)";
    };

    Scene.prototype.hjaelp = function (k) {
        var v = this.kort[k.id];
        if (v) v.el.classList.add("hjaelp");
    };

    Scene.prototype.loest = function (k, point, naesten) {
        var v = this.kort[k.id];
        if (!v) return;
        delete this.kort[k.id];
        v.el.classList.add("loest");
        if (naesten) v.el.classList.add("naesten");
        var self = this;
        var cx = this.kortX(k), cy = this.overflade + k.f * this.hoejde - v.hoejde / 2;
        this.tekster.push({ x: cx, y: cy - v.hoejde / 2 - 6, tekst: "+" + point, liv: 1.3, maks: 1.3, farve: "#1f7a4a" });
        window.setTimeout(function () {
            v.el.classList.add("opl");
            self.oploes(cx, cy, self.kortBredde, v.hoejde);
        }, 520);
        window.setTimeout(function () { v.el.remove(); }, 1300);
    };

    Scene.prototype.bund = function (k) {
        var v = this.kort[k.id];
        if (v) v.el.classList.add("bund");
        this.blink = 0.5;
    };

    /* Krystallen smuldrer og bliver til et lag bundfald. */
    Scene.prototype.smuldr = function (k) {
        var v = this.kort[k.id];
        if (!v) return;
        delete this.kort[k.id];
        var cx = this.kortX(k), cy = this.overflade + k.f * this.hoejde - v.hoejde / 2;
        v.el.classList.add("smuldrer");
        var farve = LAGFARVER[Math.min(this.spil.lag - 1, LAGFARVER.length - 1)] || LAGFARVER[0];
        for (var n = 0; n < 46; n++) {
            this.partikler.push({
                type: "smul", x: cx + (Math.random() - 0.5) * this.kortBredde, y: cy + (Math.random() - 0.5) * v.hoejde,
                vx: (Math.random() - 0.5) * 30, vy: 20 + Math.random() * 60, liv: 1.6, maks: 1.6,
                r: 2 + Math.random() * 3, farve: farve.korn
            });
        }
        window.setTimeout(function () { v.el.remove(); }, 700);
    };

    Scene.prototype.omroer = function () { this.roer = 1.4; };

    /* ----- Effekter ------------------------------------------------- */
    Scene.prototype.plask = function (x, y) {
        for (var n = 0; n < 10; n++) {
            this.partikler.push({
                type: "boble", x: x + (Math.random() - 0.5) * this.kortBredde * 0.8, y: y + 6 + Math.random() * 20,
                vx: 0, vy: -10 - Math.random() * 18, liv: 0.9, maks: 0.9, r: 2 + Math.random() * 3
            });
        }
    };

    Scene.prototype.oploes = function (cx, cy, b, h) {
        for (var n = 0; n < 28; n++) {
            this.partikler.push({
                type: "boble", x: cx + (Math.random() - 0.5) * b, y: cy + (Math.random() - 0.5) * h,
                vx: (Math.random() - 0.5) * 12, vy: -30 - Math.random() * 50, liv: 1.2 + Math.random() * 0.6, maks: 1.8,
                r: 2 + Math.random() * 4.5
            });
        }
        for (var g = 0; g < 14; g++) {
            var v = Math.random() * Math.PI * 2, fart = 40 + Math.random() * 90;
            this.partikler.push({
                type: "gnist", x: cx, y: cy, vx: Math.cos(v) * fart, vy: Math.sin(v) * fart,
                liv: 0.7, maks: 0.7, r: 3 + Math.random() * 3
            });
        }
    };

    Scene.prototype.konfetti = function () {
        var farver = ["#3d9ee0", "#3fae72", "#f2c53d", "#e6892a", "#9b6bd6", "#e05446"];
        for (var n = 0; n < 160; n++) {
            this.partikler.push({
                type: "konfetti", x: Math.random() * this.W, y: -20 - Math.random() * this.H * 0.5,
                vx: (Math.random() - 0.5) * 60, vy: 80 + Math.random() * 120, liv: 4, maks: 4,
                r: 4 + Math.random() * 4, farve: farver[n % farver.length], drej: Math.random() * 6
            });
        }
    };

    /* ----- Tegning ---------------------------------------------------- */
    Scene.prototype.tegn = function (dt) {
        this.tid += dt;
        var self = this, spil = this.spil;
        if (spil) {
            var maal = spil.lag;
            this.visLag += (maal - this.visLag) * Math.min(1, dt * 3);
            if (Math.abs(maal - this.visLag) < 0.002) this.visLag = maal;
            Object.keys(this.kort).forEach(function (id) { self.placer(self.kort[id]); });
        }
        this.blink = Math.max(0, this.blink - dt);
        this.roer = Math.max(0, this.roer - dt);
        this.tegnBag();
        this.tegnFor(dt);
    };

    Scene.prototype.indreSti = function (c) {
        var s = this.skala, x0 = this.venstre, x1 = this.hoejre, y1 = this.bundY, r = G.hjoerne * s;
        c.beginPath();
        c.moveTo(x0, this.overflade);
        c.lineTo(x0, y1 - r);
        c.quadraticCurveTo(x0, y1, x0 + r, y1);
        c.lineTo(x1 - r, y1);
        c.quadraticCurveTo(x1, y1, x1, y1 - r);
        c.lineTo(x1, this.overflade);
        c.closePath();
    };

    Scene.prototype.tegnBag = function () {
        var c = this.el.bag.getContext("2d");
        c.clearRect(0, 0, this.W, this.H);
        var lh = this.lagHoejde();
        var x0 = this.venstre, x1 = this.hoejre, b = x1 - x0;

        c.save();
        this.indreSti(c);
        c.clip();
        var antal = Math.ceil(this.visLag - 0.001);
        for (var i = 0; i < antal; i++) {
            var del = Math.min(1, this.visLag - i);
            if (del <= 0) break;
            var f = LAGFARVER[i % LAGFARVER.length], kk = this.lagKorn[i % LAGFARVER.length];
            var bundL = this.bundY - i * lh, topL = bundL - lh * del;
            c.fillStyle = f.fyld;
            c.beginPath();
            c.moveTo(x0, bundL + 2);
            for (var p = 0; p <= 24; p++) {
                var x = x0 + b * p / 24;
                var bule = (i === antal - 1) ? (kk.kant[p] - 0.5) * lh * 0.28 : 0;
                c.lineTo(x, topL + bule);
            }
            c.lineTo(x1, bundL + 2);
            c.closePath();
            c.fill();
            c.fillStyle = f.korn;
            for (var q = 0; q < kk.korn.length; q++) {
                var kn = kk.korn[q];
                var ky = bundL - kn[1] * lh * del;
                if (ky < topL + 2) continue;
                c.globalAlpha = 0.55 + kn[3] * 0.4;
                c.beginPath();
                c.arc(x0 + kn[0] * b, ky, kn[2] * this.skala * 2.2, 0, Math.PI * 2);
                c.fill();
            }
            c.globalAlpha = 1;
            c.strokeStyle = "rgba(29, 36, 51, 0.25)";
            c.lineWidth = 1;
            c.beginPath();
            c.moveTo(x0, topL);
            c.lineTo(x1, topL);
            c.stroke();
        }
        c.restore();

        /* Maerket for et fyldt glas */
        var fyldtY = this.bundY - NK.Spil.D.LAG_MAKS * lh;
        var roed = this.blink > 0 ? 1 : 0.75;
        c.save();
        c.strokeStyle = "rgba(196, 73, 60, " + roed + ")";
        c.lineWidth = 2.5;
        c.setLineDash([10, 7]);
        c.beginPath();
        c.moveTo(x0 + 6, fyldtY);
        c.lineTo(x1 - 6, fyldtY);
        c.stroke();
        c.setLineDash([]);
        c.font = "600 " + Math.max(12, 15 * this.skala * 1.3).toFixed(0) + "px Lexend, Segoe UI, sans-serif";
        c.fillStyle = "rgba(160, 50, 40, " + roed + ")";
        c.textAlign = "right";
        c.textBaseline = "bottom";
        c.fillText("Fyldt", x1 - 12, fyldtY - 4);
        c.restore();
    };

    Scene.prototype.tegnFor = function (dt) {
        var c = this.el.for.getContext("2d");
        c.clearRect(0, 0, this.W, this.H);
        var self = this;
        var sedTop = this.bundY - this.visLag * this.lagHoejde();

        this.partikler = this.partikler.filter(function (p) {
            p.liv -= dt;
            if (p.liv <= 0) return false;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            var a = Math.max(0, Math.min(1, p.liv / p.maks * 1.4));
            if (p.type === "boble") {
                if (p.y < self.overflade + 4) return false;
                c.strokeStyle = "rgba(255, 255, 255, " + (0.9 * a) + ")";
                c.fillStyle = "rgba(255, 255, 255, " + (0.25 * a) + ")";
                c.lineWidth = 1.5;
                c.beginPath();
                c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                c.fill();
                c.stroke();
            } else if (p.type === "gnist") {
                p.vx *= 0.92; p.vy *= 0.92;
                c.fillStyle = "rgba(242, 197, 61, " + a + ")";
                stjerne(c, p.x, p.y, p.r * (0.6 + a * 0.6));
            } else if (p.type === "smul") {
                p.vy += 60 * dt;
                if (p.y > sedTop - 2) { p.y = sedTop - 2; p.vy = 0; p.vx *= 0.8; }
                c.globalAlpha = a;
                c.fillStyle = p.farve;
                c.beginPath();
                c.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                c.fill();
                c.globalAlpha = 1;
            } else if (p.type === "konfetti") {
                p.drej += dt * 5;
                c.save();
                c.translate(p.x, p.y);
                c.rotate(p.drej);
                c.globalAlpha = a;
                c.fillStyle = p.farve;
                c.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9);
                c.restore();
            }
            return true;
        });

        this.tekster = this.tekster.filter(function (t) {
            t.liv -= dt;
            if (t.liv <= 0) return false;
            t.y -= 28 * dt;
            c.save();
            c.globalAlpha = Math.min(1, t.liv / t.maks * 2);
            c.font = "700 " + Math.round(20 + 6 * self.skala) + "px Lexend, Segoe UI, sans-serif";
            c.textAlign = "center";
            c.lineWidth = 4;
            c.strokeStyle = "rgba(255,255,255,0.9)";
            c.strokeText(t.tekst, t.x, t.y);
            c.fillStyle = t.farve;
            c.fillText(t.tekst, t.x, t.y);
            c.restore();
            return true;
        });

        /* Glasstaven roerer et lag bundfald op */
        if (this.roer > 0) {
            var t = 1.4 - this.roer;
            var midt = (this.venstre + this.hoejre) / 2, bred = (this.hoejre - this.venstre) * 0.28;
            var x = midt + Math.sin(t * 7) * bred;
            var top = this.gy + 10 * this.skala, ned = sedTop - 16 * this.skala;
            var a = Math.min(1, this.roer * 3, t * 4);
            c.save();
            c.globalAlpha = a;
            c.strokeStyle = "rgba(44, 62, 80, 0.85)";
            c.lineWidth = Math.max(5, 12 * this.skala);
            c.lineCap = "round";
            c.beginPath();
            c.moveTo(midt + (x - midt) * 0.3, top);
            c.lineTo(x, ned);
            c.stroke();
            c.strokeStyle = "rgba(255, 255, 255, 0.55)";
            c.lineWidth = Math.max(2, 4 * this.skala);
            c.beginPath();
            c.moveTo(midt + (x - midt) * 0.3 - 2, top + 6);
            c.lineTo(x - 2, ned - 6);
            c.stroke();
            c.restore();
            if (Math.random() < 0.5) {
                this.partikler.push({
                    type: "boble", x: x + (Math.random() - 0.5) * 20, y: ned - Math.random() * 20,
                    vx: (Math.random() - 0.5) * 20, vy: -40 - Math.random() * 40, liv: 1, maks: 1, r: 2 + Math.random() * 3
                });
            }
        }
    };

    function stjerne(c, x, y, r) {
        c.beginPath();
        for (var i = 0; i < 8; i++) {
            var v = i * Math.PI / 4, rr = i % 2 ? r * 0.38 : r;
            c.lineTo(x + Math.cos(v) * rr, y + Math.sin(v) * rr);
        }
        c.closePath();
        c.fill();
    }

    Scene.LAGFARVER = LAGFARVER;
    NK.Scene = Scene;
}());

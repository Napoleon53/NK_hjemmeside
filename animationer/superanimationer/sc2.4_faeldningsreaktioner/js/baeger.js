/* =====================================================================
   baeger.js - de tre baegerglas paa scenen

   To smaa glas med hver sin opløsning og et stoerre glas i midten,
   hvor de blandes. Ionerne er talt: glassene har de maengder, det fulde
   saltskema siger (3 AgNO₃ til 1 Na₃PO₄), saa der er praecis nok til
   hele formelenheder af bundfaldet, og tilskuerionerne bliver tilbage.

   Forloebet:
     saetOpgave(o, synlig)  fylder de to smaa glas
     visIoner()             ionerne toner frem (efter trin 1)
     bland(salte)           glassene haeldes sammen, og hvert salt i
                            listen klumper sammen og synker til bunds
     navngiv(tekst)         bundfaldet faar sin formel under glasset

   Positionerne gemmes relativt til vaesken (u, v fra 0 til 1), saa
   glassene kan skifte stoerrelse uden at ionerne hopper.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* Maal i sprites/baegerglas.svg (200 x 240): inderside x 21-179,
       bund y 229, 100 mL ved y 108, 150 mL ved y 48. */
    var GLAS = { b: 200, h: 240, indV: 21, indH: 179, bund: 229, ml100: 108, ml150: 48 };
    var billede = new Image(), billedeKlar = false;
    billede.onload = function () { billedeKlar = true; };
    billede.src = "sprites/baegerglas.svg";

    var FARVE = {
        kat: ["#ff9f92", "#c23a2d", "#ff9f92"],
        an:  ["#93d2ff", "#1c68a6", "#93d2ff"]
    };

    var HAELD = 1.5;          /* sekunder om at haelde glassene sammen */
    var FAELD_START = 1.9;    /* hvornaar bundfaldet begynder at klumpe */
    var KLUMP = 0.9;          /* sekunder om at finde sammen midt i glasset */
    var SYNK = 1.4;           /* sekunder om at synke til bunds */

    function rgba(f, a) { return "rgba(" + f[0] + ", " + f[1] + ", " + f[2] + ", " + a + ")"; }

    NK.Baeger = function () {
        this.nulstil();
    };

    NK.Baeger.prototype.nulstil = function () {
        this.o = null;
        this.ioner = [];
        this.bunker = [];
        this.fyld = { A: 1, B: 1, M: 0 };
        this.fase = "tom";
        this.t = 0;
        this.tBland = -1;
        this.faeldSalte = [];
        this.roer = 0;
        this.bundNavn = "";
        this.geo = null;
    };

    function radiusFaktor(ion) {
        if (ion.sammensat) return 1.2;
        return ion.q > 0 ? 0.85 : 1.0;
    }

    function nyIon(ion, glas, synlig) {
        return {
            ion: ion, glas: glas, u: 0.15 + Math.random() * 0.7, v: 0.12 + Math.random() * 0.7,
            vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30,
            alfa: synlig ? 1 : 0, maalAlfa: synlig ? 1 : 0,
            fly: null, bunke: null, slot: null, fast: false
        };
    }

    NK.Baeger.prototype.saetOpgave = function (o, synlig) {
        this.nulstil();
        this.o = o;
        var self = this, m = o.maengde;
        [[o.A, m.nA, "A"], [o.B, m.nB, "B"]].forEach(function (x) {
            for (var i = 0; i < x[1]; i++) {
                var j;
                for (j = 0; j < x[0].p; j++) self.ioner.push(nyIon(x[0].kat, x[2], synlig));
                for (j = 0; j < x[0].n; j++) self.ioner.push(nyIon(x[0].an, x[2], synlig));
            }
        });
        this.fase = "hver";
        this.spred();
    };

    /* Fordeler ionerne, saa de ikke starter oven i hinanden. */
    NK.Baeger.prototype.spred = function () {
        var i, j;
        for (var runde = 0; runde < 60; runde++) {
            for (i = 0; i < this.ioner.length; i++) {
                for (j = i + 1; j < this.ioner.length; j++) {
                    var a = this.ioner[i], b = this.ioner[j];
                    if (a.glas !== b.glas) continue;
                    var du = a.u - b.u, dv = a.v - b.v, d = Math.sqrt(du * du + dv * dv);
                    if (d < 0.22) {
                        var k = (0.22 - d) / 2 / (d || 0.01);
                        a.u += du * k; a.v += dv * k; b.u -= du * k; b.v -= dv * k;
                    }
                }
                this.ioner[i].u = NK.klamp(this.ioner[i].u, 0.1, 0.9);
                this.ioner[i].v = NK.klamp(this.ioner[i].v, 0.1, 0.9);
            }
        }
    };

    /* Ionerne toner frem, i ét glas ("A" eller "B") eller i begge. */
    NK.Baeger.prototype.visIoner = function (glas) {
        this.ioner.forEach(function (p) { if (!glas || p.glas === glas) p.maalAlfa = 1; });
    };

    NK.Baeger.prototype.bland = function (salte) {
        if (this.fase !== "hver") return;
        this.visIoner();
        this.fase = "haelder";
        this.tBland = this.t;
        this.faeldSalte = salte || [];
        var self = this;
        this.ioner.forEach(function (p) {
            p.fly = { fra: p.glas, u0: p.u, v0: p.v, start: 0.1 + Math.random() * 0.75, varighed: 0.75 + Math.random() * 0.2,
                      u1: 0.12 + Math.random() * 0.76, v1: 0.1 + Math.random() * 0.75 };
        });
        this.ioner.forEach(function (p) { p.alfa = Math.max(p.alfa, 0.001); });
        self.bunker = [];
    };

    NK.Baeger.prototype.navngiv = function (tekst) {
        this.bundNavn = tekst;
    };

    /* Klik paa blandingen roerer rundt. Bundfaldet hvirvles op og synker
       igen: det gaar ikke i opløsning af at blive rørt. */
    NK.Baeger.prototype.kanRoeres = function (x, y) {
        var g = this.geo;
        if (!g || this.fase !== "blandet") return false;
        var M = g.M;
        return x >= M.x && x <= M.x + M.w && y >= M.y && y <= M.y + M.h;
    };

    NK.Baeger.prototype.klik = function (x, y) {
        if (!this.kanRoeres(x, y)) return false;
        this.roer = 1;
        var self = this;
        this.ioner.forEach(function (p) {
            if (p.bunke) return;
            p.vx += (Math.random() - 0.5) * 260;
            p.vy += (Math.random() - 0.5) * 200;
        });
        self.bunker.forEach(function (b) { b.loeft = 1; });
        return true;
    };

    /* ----- Geometri ------------------------------------------------------ */
    NK.Baeger.prototype.layout = function (W, H) {
        var lbl = 40, top = 34;
        var hMax = H - lbl - top;
        var wM = Math.min(hMax / 1.2, W * 0.32, 320);
        var wA = Math.min(wM * 0.8, W * 0.25);
        /* Glassene staar midt i den plads, der er, med bue-pilene over. */
        var bund = Math.min(H - lbl, (H + wM * 1.2 + top - lbl) / 2);
        function glas(cx, w, ml) {
            var s = w / GLAS.b, x = cx - w / 2, y = bund - w * 1.2;
            return {
                x: x, y: y, w: w, h: w * 1.2, s: s, cx: cx,
                vl: x + GLAS.indV * s, vh: x + GLAS.indH * s, vb: y + GLAS.bund * s,
                hFuld: (GLAS.bund - ml) * s
            };
        }
        var afst = Math.max(wM / 2 + wA / 2 + 24, W * 0.3);
        afst = Math.min(afst, W / 2 - wA / 2 - 8);
        this.geo = {
            A: glas(W / 2 - afst, wA, GLAS.ml100),
            B: glas(W / 2 + afst, wA, GLAS.ml100),
            M: glas(W / 2, wM, GLAS.ml150),
            rb: NK.klamp(wA * 0.07, 9, 19)
        };
        return this.geo;
    };

    /* Ionerne i bundfaldet ligger taet pakket og tegnes lidt mindre. */
    var PAK = 0.88;
    function radius(p, rb) { return rb * radiusFaktor(p.ion) * (p.bunke ? PAK : 1); }

    /* Skaermkoordinater for (u, v) i et glas. */
    function punkt(g, u, v) {
        return { x: g.vl + u * (g.vh - g.vl), y: g.vb - v * g.hFuld };
    }

    /* ----- Bundfaldet ------------------------------------------------------ */
    /* Ionerne i bundfaldet laegges i et lille gitter i bunden af glasset,
       positiv og negativ saa vidt muligt skiftevis. Pladserne regnes i
       ionradier fra bunden af glasset, saa de passer ved alle stoerrelser. */
    NK.Baeger.prototype.startFaeld = function () {
        var self = this, g = this.geo, rb = g.rb;
        var n = this.faeldSalte.length;
        var bredde = (g.M.vh - g.M.vl) / rb;          /* vaeskens bredde i ionradier */
        this.faeldSalte.forEach(function (P, idx) {
            var kat = self.ioner.filter(function (p) { return p.ion === P.kat && !p.bunke; });
            var an = self.ioner.filter(function (p) { return p.ion === P.an && !p.bunke; });
            var enheder = Math.min(Math.floor(kat.length / P.p), Math.floor(an.length / P.n));
            if (enheder < 1) return;
            var nKat = enheder * P.p, nAn = enheder * P.n;

            /* Raekkefoelgen i gitteret: skiftevis, saa godt det kan lade sig goere. */
            var raekke = [], k = 0, a = 0;
            while (k + a < nKat + nAn) {
                if (a >= nAn || (k < nKat && k / nKat <= a / nAn)) { raekke.push("k"); k++; }
                else { raekke.push("a"); a++; }
            }

            var rMax = Math.max(radiusFaktor(P.kat), radiusFaktor(P.an)) * PAK;
            var afst = 2 * rMax * 0.97;
            var region = bredde / n;
            var midt = -bredde / 2 + region * (idx + 0.5);
            var plads = Math.max(2, Math.floor((region - 0.3) / afst));
            /* Hver anden raekke forskudt en halv plads, hvis der er plads til det. */
            var forskyd = (plads - 0.5) * afst <= region - 0.3;
            var dy = afst * (forskyd ? 0.87 : 1);
            var slots = [], r = 0, i = 0;
            while (slots.length < raekke.length) {
                var iRaekke = Math.min(plads, raekke.length - slots.length);
                var skub = forskyd && r % 2 && iRaekke === plads ? afst / 4 : 0;
                for (i = 0; i < iRaekke; i++) {
                    slots.push({ x: midt + (i - (iRaekke - 1) / 2) * afst + (r % 2 ? skub : -skub), y: rMax + r * dy });
                }
                r++;
            }

            var bunke = { P: P, farve: D.bundfald(P.kat.id, P.an.id).farve, ioner: [], start: self.t, loeft: 0,
                          hoejde: rMax + (r - 1) * dy + rMax };
            var fri = { k: kat.slice(), a: an.slice() };
            slots.forEach(function (s, j) {
                var liste = raekke[j] === "k" ? fri.k : fri.a;
                /* Den ion, der er taettest paa pladsen. */
                var bedst = 0, bedstD = Infinity;
                liste.forEach(function (p, q) {
                    var pp = punkt(g.M, p.u, p.v);
                    var sx = g.M.cx + s.x * rb, sy = g.M.vb - s.y * rb;
                    var d = (pp.x - sx) * (pp.x - sx) + (pp.y - sy) * (pp.y - sy);
                    if (d < bedstD) { bedstD = d; bedst = q; }
                });
                var p = liste.splice(bedst, 1)[0];
                p.bunke = bunke;
                p.slot = s;
                p.forsinkelse = j * 0.05;
                bunke.ioner.push(p);
            });
            self.bunker.push(bunke);
        });
    };

    /* ----- Opdatering ---------------------------------------------------------- */
    NK.Baeger.prototype.opdater = function (dt, W, H) {
        if (!this.o) return;
        this.t += dt;
        var g = this.layout(W, H), rb = g.rb, self = this;
        var tb = this.tBland >= 0 ? this.t - this.tBland : -1;

        if (this.fase === "haelder") {
            var f = NK.blod((tb - 0.15) / (HAELD - 0.3));
            this.fyld.A = this.fyld.B = 1 - f;
            this.fyld.M = f;
            if (tb >= HAELD + 0.2) {
                this.fase = "blandet";
                this.ioner.forEach(function (p) { p.fly = null; p.glas = "M"; });
            }
        }
        if (this.fase === "blandet" && this.faeldSalte.length && !this.bunker.length && tb >= FAELD_START) {
            this.startFaeld();
        }
        this.roer = Math.max(0, this.roer - dt * 0.6);
        this.bunker.forEach(function (b) { b.loeft = Math.max(0, b.loeft - dt * 0.35); });

        this.ioner.forEach(function (p) {
            p.alfa += (p.maalAlfa - p.alfa) * Math.min(1, dt * 3);
            if (p.fly) {
                var t = (tb - p.fly.start) / p.fly.varighed;
                if (t >= 1) { p.glas = "M"; p.u = p.fly.u1; p.v = Math.min(p.fly.v1, Math.max(0.1, self.fyld.M - 0.1)); p.fly = null; }
                return;
            }
            var gl = g[p.glas], r = radius(p, rb);
            var pos = punkt(gl, p.u, p.v);

            if (p.bunke) {
                var b = p.bunke, tt = self.t - b.start - p.forsinkelse;
                /* Foerst finder de sammen midt i vaesken, saa synker de. */
                var hoejdeMidt = Math.max(0, gl.hFuld * 0.45 / rb - b.hoejde / 2);
                var loeft = NK.blod(1 - (tt - KLUMP) / SYNK) * hoejdeMidt;
                loeft += b.loeft * gl.hFuld * 0.35 / rb * (0.6 + 0.4 * Math.sin(self.t * 5 + p.slot.x));
                var mx = gl.cx + p.slot.x * rb, my = gl.vb - (p.slot.y + loeft) * rb;
                var rate = tt < 0 ? 0.6 : 4;
                pos.x += (mx - pos.x) * Math.min(1, dt * rate);
                pos.y += (my - pos.y) * Math.min(1, dt * rate);
                p.fast = tt > KLUMP + SYNK && b.loeft < 0.02;
            } else {
                /* Ionerne svoemmer rundt: tilfaeldige skub, lidt friktion. */
                var fart = 1 + self.roer * 4;
                p.vx += (Math.random() - 0.5) * 140 * dt * fart;
                p.vy += (Math.random() - 0.5) * 140 * dt * fart;
                var damp = Math.exp(-dt * 0.9);
                p.vx *= damp; p.vy *= damp;
                var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy), vmax = 34 * fart;
                if (v > vmax) { p.vx *= vmax / v; p.vy *= vmax / v; }
                pos.x += p.vx * dt;
                pos.y += p.vy * dt;
            }

            /* Inden for vaesken. */
            var top = gl.vb - self.fyld[p.glas] * gl.hFuld;
            var bundGraense = gl.vb - r - 1;
            if (!p.bunke) {
                var bunkeTop = self.bunkeTop(gl, pos.x, rb);
                if (bunkeTop !== null) bundGraense = Math.min(bundGraense, bunkeTop - r);
            }
            if (pos.x < gl.vl + r + 1) { pos.x = gl.vl + r + 1; p.vx = Math.abs(p.vx); }
            if (pos.x > gl.vh - r - 1) { pos.x = gl.vh - r - 1; p.vx = -Math.abs(p.vx); }
            if (pos.y > bundGraense) { pos.y = bundGraense; p.vy = -Math.abs(p.vy); }
            if (pos.y < top + r + 1 && !p.bunke) { pos.y = Math.min(top + r + 1, bundGraense); p.vy = Math.abs(p.vy); }
            p.u = (pos.x - gl.vl) / (gl.vh - gl.vl);
            p.v = (gl.vb - pos.y) / gl.hFuld;
        });

        /* De frie ioner skubber blidt til hinanden, saa de ikke ligger
           oven i hinanden. */
        var frie = this.ioner.filter(function (p) { return !p.fly && !p.bunke; });
        for (var i = 0; i < frie.length; i++) {
            for (var j = i + 1; j < frie.length; j++) {
                var a = frie[i], b = frie[j];
                if (a.glas !== b.glas) continue;
                var gl = g[a.glas];
                var pa = punkt(gl, a.u, a.v), pb = punkt(gl, b.u, b.v);
                var dx = pa.x - pb.x, dy = pa.y - pb.y, d = Math.sqrt(dx * dx + dy * dy);
                var min = radius(a, rb) + radius(b, rb) + 2;
                if (d < min && d > 0.01) {
                    var k = (min - d) / d * 0.5 * Math.min(1, dt * 8);
                    a.u += dx * k / (gl.vh - gl.vl); a.v -= dy * k / gl.hFuld;
                    b.u -= dx * k / (gl.vh - gl.vl); b.v += dy * k / gl.hFuld;
                }
            }
        }
    };

    /* Hvor hoejt naar bundfaldet op ved x? null, hvis der ikke er noget. */
    NK.Baeger.prototype.bunkeTop = function (gl, x, rb) {
        var top = null;
        this.bunker.forEach(function (b) {
            b.ioner.forEach(function (p) {
                if (!p.fast) return;
                var px = gl.cx + p.slot.x * rb, r = radius(p, rb) * 1.1;
                if (Math.abs(px - x) > r * 1.6) return;
                var py = gl.vb - p.slot.y * rb - r;
                top = top === null ? py : Math.min(top, py);
            });
        });
        return top;
    };

    /* Hvor meget af hvert bundfald er landet, 0-1. */
    NK.Baeger.prototype.bundfaldFaerdigt = function () {
        if (!this.bunker.length) return this.fase === "blandet" && !this.faeldSalte.length;
        return this.bunker.every(function (b) { return b.ioner.every(function (p) { return p.fast; }); });
    };

    /* ----- Tegning ---------------------------------------------------------------- */
    function vaeskeFarve(ioner, glas) {
        var r = 0, gg = 0, b = 0, n = 0;
        ioner.forEach(function (p) {
            if (p.glas !== glas || p.fly || p.bunke) return;
            var f = D.OPL_FARVE[p.ion.id];
            if (!f) return;
            r += f[0]; gg += f[1]; b += f[2]; n++;
        });
        if (!n) return null;
        return { f: [Math.round(r / n), Math.round(gg / n), Math.round(b / n)], a: Math.min(0.5, 0.16 + 0.04 * n) };
    }

    NK.Baeger.prototype.tegnVaeske = function (c, gl, navn) {
        var fyld = this.fyld[navn];
        if (fyld <= 0.005) return;
        var top = gl.vb - fyld * gl.hFuld;
        var r = 7 * gl.s;
        c.save();
        c.beginPath();
        c.moveTo(gl.vl, top);
        c.lineTo(gl.vh, top);
        c.lineTo(gl.vh, gl.vb - r);
        c.quadraticCurveTo(gl.vh, gl.vb, gl.vh - r, gl.vb);
        c.lineTo(gl.vl + r, gl.vb);
        c.quadraticCurveTo(gl.vl, gl.vb, gl.vl, gl.vb - r);
        c.closePath();
        var vf = vaeskeFarve(this.ioner, navn);
        c.fillStyle = "rgba(120, 175, 235, 0.13)";
        c.fill();
        if (vf) { c.fillStyle = rgba(vf.f, vf.a); c.fill(); }

        /* Uklarhed, mens bundfaldet dannes eller hvirvles op. */
        if (navn === "M") {
            var self = this;
            this.bunker.forEach(function (b) {
                var tt = self.t - b.start;
                var u = Math.max(Math.sin(Math.PI * NK.klamp(tt / (KLUMP + SYNK + 0.8), 0, 1)) * 0.3, b.loeft * 0.35);
                if (u > 0.01) { c.fillStyle = rgba(b.farve, u); c.fill(); }
            });
        }
        c.strokeStyle = "rgba(200, 230, 255, 0.35)";
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(gl.vl + 1, top);
        c.lineTo(gl.vh - 1, top);
        c.stroke();
        c.restore();
    };

    function tegnIon(c, p, x, y, r) {
        var f = p.ion.q > 0 ? FARVE.kat : FARVE.an;
        c.save();
        c.globalAlpha *= p.alfa;
        var g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
        g.addColorStop(0, f[0]);
        g.addColorStop(1, f[1]);
        c.fillStyle = g;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "rgba(0, 0, 0, 0.35)";
        c.lineWidth = 1;
        c.stroke();
        var fs = Math.max(12, r * (p.ion.formel.length > 2 ? 0.78 : 0.92));
        NK.tekst(c, p.ion.formel, x, y + fs * 0.05, {
            font: "700 " + fs.toFixed(1) + "px 'Segoe UI', sans-serif",
            justering: "center", linje: "middle", farve: "#ffffff",
            kant: true, kantBredde: 2.5, kantFarve: "rgba(20, 20, 30, 0.55)"
        });
        NK.tekst(c, NK.ladningstekst(p.ion.q), x + r * 0.72, y - r * 0.62, {
            font: "700 12px 'Segoe UI', sans-serif", justering: "left", linje: "bottom", farve: f[2], kant: true
        });
        c.restore();
    }

    NK.Baeger.prototype.tegn = function (L) {
        var c = L.ctx, W = L.b, H = L.h;
        L.ryd();
        if (!this.o) return;
        var g = this.geo || this.layout(W, H), rb = g.rb, self = this;
        var tb = this.tBland >= 0 ? this.t - this.tBland : -1;

        /* Buepile fra de smaa glas ned i blandingen. */
        if (this.fase === "hver") {
            c.save();
            c.strokeStyle = "rgba(200, 206, 214, 0.4)";
            c.fillStyle = "rgba(200, 206, 214, 0.4)";
            c.lineWidth = 2;
            [[g.A, 1], [g.B, -1]].forEach(function (x) {
                var fra = x[0], s = x[1];
                var x0 = fra.cx + s * fra.w * 0.3, y0 = fra.y - 4;
                var x1 = g.M.cx - s * g.M.w * 0.22, y1 = g.M.y + g.M.h * 0.12;
                var kx = (x0 + x1) / 2, ky = Math.min(y0, g.M.y) - 26;
                c.setLineDash([5, 6]);
                c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(kx, ky, x1, y1); c.stroke();
                c.setLineDash([]);
                var v = Math.atan2(y1 - ky, x1 - kx);
                c.beginPath();
                c.moveTo(x1 + Math.cos(v) * 4, y1 + Math.sin(v) * 4);
                c.lineTo(x1 - Math.cos(v - 0.45) * 11, y1 - Math.sin(v - 0.45) * 11);
                c.lineTo(x1 - Math.cos(v + 0.45) * 11, y1 - Math.sin(v + 0.45) * 11);
                c.closePath();
                c.fill();
            });
            c.restore();
        }

        ["A", "B", "M"].forEach(function (navn) {
            var gl = g[navn];
            if (navn === "M" && self.fase === "hver") c.globalAlpha = 0.45;
            self.tegnVaeske(c, gl, navn);

            /* Bundfaldets farve bag ionerne. */
            if (navn === "M") {
                self.bunker.forEach(function (b) {
                    b.ioner.forEach(function (p) {
                        var pp = punkt(gl, p.u, p.v), r = radius(p, rb);
                        var land = NK.klamp((gl.vb - pp.y) / (gl.hFuld * 0.5), 0, 1);
                        c.fillStyle = rgba(b.farve, 0.5 * (1 - land));
                        c.beginPath();
                        c.arc(pp.x, pp.y, r * 1.35, 0, Math.PI * 2);
                        c.fill();
                    });
                });
            }

            self.ioner.forEach(function (p) {
                if (p.fly || p.glas !== navn || p.alfa < 0.01) return;
                var pp = punkt(gl, p.u, p.v);
                tegnIon(c, p, pp.x, pp.y, radius(p, rb));
            });

            /* Et spoergsmaalstegn, indtil ionerne er fundet. */
            if (navn !== "M" && self.fase === "hver") {
                var skjult = self.ioner.some(function (p) { return p.glas === navn && p.alfa < 0.5; });
                if (skjult) {
                    NK.tekst(c, "?", gl.cx, gl.vb - gl.hFuld * 0.45, {
                        font: "600 " + Math.round(gl.w * 0.22) + "px 'Segoe UI', sans-serif",
                        justering: "center", linje: "middle", farve: "rgba(200, 220, 240, 0.28)"
                    });
                }
            }

            if (billedeKlar) c.drawImage(billede, gl.x, gl.y, gl.w, gl.h);
            c.globalAlpha = 1;
        });

        /* Straalen, mens der haeldes. */
        if (this.fase === "haelder") {
            var styrke = Math.sin(Math.PI * NK.klamp(tb / HAELD, 0, 1));
            [[g.A, 1], [g.B, -1]].forEach(function (x) {
                var fra = x[0], s = x[1];
                var x0 = fra.cx + s * fra.w * 0.46, y0 = fra.y + fra.h * 0.06;
                var x1 = g.M.cx - s * g.M.w * 0.18, y1 = g.M.vb - self.fyld.M * g.M.hFuld;
                c.save();
                c.strokeStyle = "rgba(140, 190, 240, " + (0.35 * styrke).toFixed(3) + ")";
                c.lineWidth = 6 * g.M.s;
                c.lineCap = "round";
                c.beginPath();
                c.moveTo(x0, y0);
                c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, g.M.y) - 30, x1, y1);
                c.stroke();
                c.restore();
            });
        }

        /* Ioner i luften. */
        this.ioner.forEach(function (p) {
            if (!p.fly) return;
            var t = (tb - p.fly.start) / p.fly.varighed;
            var fra = punkt(g[p.fly.fra], p.fly.u0, p.fly.v0);
            if (t <= 0) { tegnIon(c, p, fra.x, fra.y, radius(p, rb)); return; }
            var til = punkt(g.M, p.fly.u1, Math.min(p.fly.v1, Math.max(0.1, self.fyld.M - 0.1)));
            var e = NK.blod(t);
            var top = Math.min(g.M.y, g[p.fly.fra].y) - 26;
            var x = NK.lerp(fra.x, til.x, e);
            var y = (1 - e) * (1 - e) * fra.y + 2 * (1 - e) * e * top + e * e * til.y;
            tegnIon(c, p, x, y, radius(p, rb));
        });

        /* Navnene under glassene. */
        var fs = 13;
        [["A", this.o.A], ["B", this.o.B]].forEach(function (x) {
            var gl = g[x[0]];
            var a = self.fase === "hver" ? 1 : NK.klamp(1 - tb / 1.2, 0.35, 1);
            NK.tekst(c, x[1].navn, gl.cx, gl.vb + 22, {
                font: "600 " + fs + "px 'Segoe UI', sans-serif", justering: "center", farve: "#c8ced6", alfa: a
            });
        });
        var mTekst = "";
        if (this.fase === "blandet") {
            if (this.bunker.length) mTekst = this.bundNavn || (this.bunker.length > 1 ? "to bundfald" : "bundfald");
            else if (!this.faeldSalte.length && tb > HAELD + 0.6) mTekst = "intet bundfald";
        }
        if (mTekst) {
            NK.tekst(c, mTekst, g.M.cx, g.M.vb + 22, {
                font: "700 " + (fs + 1) + "px 'Segoe UI', sans-serif", justering: "center",
                farve: this.bunker.length ? "#f2c53d" : "#9fa6af"
            });
        }
    };
}());

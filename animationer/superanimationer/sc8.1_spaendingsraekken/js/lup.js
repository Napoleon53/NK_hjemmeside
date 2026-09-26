/* =====================================================================
   lup.js - luppen: stangens overflade og oploesningen paa partikelniveau

   Til hoejre i luppen sidder metalatomerne i stangen i et gitter, til
   venstre svoemmer ionerne fra glasset og tilskuerionerne (SO₄²⁻, NO₃⁻
   eller Cl⁻). Reagerer parret, sker det i haendelser, der hver er én
   gang den afstemte reaktion: fx ét Zn-atom og én Cu²⁺, eller to Al og
   tre Cu²⁺. Metalatomerne afgiver deres elektroner (gule prikker), som
   flyver til ionerne ved overfladen. Saa gaar atomerne i oploesning som
   ioner, og ionerne saetter sig som metal paa stangen (eller bliver til
   H₂, der stiger op som en boble). Der afgives altid lige saa mange
   elektroner, som der optages.

   Reagerer parret ikke, svoemmer ionerne hen til stangen, stoeder ind i
   den og svoemmer videre.

   Positionerne er i luppens egne enheder (-1 til 1), saa luppen kan
   have enhver stoerrelse. Sammensatte ioner tegnes som én pille med
   formlen paa (reglen fra hjemmesidens CLAUDE.md).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var K = NK.Kemi;
    var Tg = NK.Tegn;

    var R = 0.1;                 /* partiklernes radius */
    var FLADE = 0.3;             /* stangens overflade, naar intet er sket */
    var KOLONNER = [-2, -1, 0, 1, 2, 3];
    var RAEKKER = 9;
    var FART = 0.22;             /* fri bevaegelse, enheder pr. sekund */
    var PROD_MAKS = 5;           /* hoejst saa mange nye metalioner i luppen */

    function slotX(c) { return FLADE + R + c * 2 * R; }
    function slotY(j) { return (j - (RAEKKER - 1) / 2) * 2 * R; }

    function Lup() {
        this.saet(null, "Cu");
    }

    var P = Lup.prototype;

    /* m: stangens metal (null: ingen stang), i: ionen i glasset */
    P.saet = function (m, i) {
        this.m = m;
        this.i = i;
        this.reagerer = !!(m && K.reagerer(m, i));
        this.r = this.reagerer ? K.reaktion(m, i) : null;
        this.dele = [];
        this.gitter = [];
        this.elektroner = [];
        this.bobler = [];
        this.haendelse = null;
        this.pause = 0.6;
        this.besoegUr = 1.2;
        this.antal = 0;          /* faerdige haendelser */
        this.afgivet = 0;        /* elektroner i alt */
        this.optaget = 0;
        this.ventende = [];      /* nye ioner paa vej ind fra venstre */
        var st = K.STOF[i];
        var mig = this;
        /* Gitteret: alle pladser, ogsaa dem uden for glasset (klippes) */
        if (m) {
            KOLONNER.forEach(function (c) {
                for (var j = 0; j < RAEKKER; j++) {
                    var s = { c: c, j: j, x: slotX(c), y: slotY(j), atom: null };
                    mig.gitter.push(s);
                    if (c >= 0) {
                        var a = { slags: "atom", sym: m, x: s.x, y: s.y, slot: s, fase: "fast" };
                        s.atom = a;
                        mig.dele.push(a);
                    }
                }
            });
        }
        /* Oploesningen: ionerne og saa mange tilskuerioner, at det gaar op */
        var nKat = st.q === 3 ? (st.anionQ === -2 ? 4 : 3) : (st.q === 2 ? (st.anionQ === -2 ? 5 : 4) : 6);
        var nAn = nKat * st.q / -st.anionQ;
        var n;
        for (n = 0; n < nKat; n++) this.dele.push(this.nyFri("kat", i));
        for (n = 0; n < nAn; n++) this.dele.push(this.nyFri("an", i));
    };

    /* En fri partikel et tilfaeldigt sted i oploesningen */
    P.nyFri = function (slags, sym, x, y) {
        var p = { slags: slags, sym: sym, x: 0, y: 0, vx: NK.r(-1, 1) * FART, vy: NK.r(-1, 1) * FART, fase: "fri" };
        if (x !== undefined) { p.x = x; p.y = y; return p; }
        for (var forsoeg = 0; forsoeg < 40; forsoeg++) {
            var v = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * 0.82;
            p.x = Math.cos(v) * d;
            p.y = Math.sin(v) * d;
            if (p.x > this.kant(p.y) - 2 * R) continue;
            var fri = true;
            for (var k = 0; k < this.dele.length; k++) {
                var q = this.dele[k];
                if ((q.x - p.x) * (q.x - p.x) + (q.y - p.y) * (q.y - p.y) < 4.4 * R * R) { fri = false; break; }
            }
            if (fri) break;
        }
        return p;
    };

    /* Hvor stangen begynder i hoejden y: den mest venstre optagne plads */
    P.kant = function (y) {
        if (!this.m) return 2;
        var j = Math.round(y / (2 * R) + (RAEKKER - 1) / 2);
        j = NK.klamp(j, 0, RAEKKER - 1);
        var x = 2;
        for (var k = 0; k < this.gitter.length; k++) {
            var s = this.gitter[k];
            if (s.j === j && s.atom && s.x < x) x = s.x;
        }
        return x - R;
    };

    /* ----- Haendelserne ------------------------------------------------------------ */
    /* Et metalatom kan gaa, naar der ikke er et andet af stangens atomer
       til venstre for det i samme raekke, og det kan ses i luppen. */
    P.kanGaa = function () {
        var mig = this, ud = [];
        this.gitter.forEach(function (s) {
            var a = s.atom;
            if (!a || a.sym !== mig.m || a.fase !== "fast") return;
            if (s.x * s.x + s.y * s.y > 0.72) return;
            var foran = mig.gitter.some(function (t) {
                return t.j === s.j && t.c < s.c && t.atom && t.atom.sym === mig.m;
            });
            if (!foran) ud.push(a);
        });
        return ud;
    };

    P.startHaendelse = function () {
        var r = this.r;
        var atomer = NK.bland(this.kanGaa()).slice(0, r.koef[0]);
        var ioner = this.dele.filter(function (p) { return p.slags === "kat" && p.fase === "fri"; });
        if (atomer.length < r.koef[0] || ioner.length < r.koef[1]) { this.pause = 0.5; return; }
        ioner.sort(function (a, b) { return b.x - a.x; });
        ioner = ioner.slice(0, r.koef[1]);
        atomer.sort(function (a, b) { return a.y - b.y; });
        var mig = this;
        /* Ionerne lægger sig ved overfladen ud for atomerne */
        var ym = atomer.reduce(function (s, a) { return s + a.y; }, 0) / atomer.length;
        ioner.sort(function (a, b) { return a.y - b.y; });
        ioner.forEach(function (p, n) {
            var y = NK.klamp(ym + (n - (ioner.length - 1) / 2) * 2.1 * R, -0.72, 0.72);
            p.fase = "hent";
            p.maalY = y;
            p.maalX = Math.min(mig.kant(y) - R * (p.sym === "H" ? 0.75 : 1.02), 0.6);
            p.faaet = 0;
        });
        atomer.forEach(function (a) { a.fase = "afgiver"; });
        this.haendelse = { fase: "hent", t: 0, atomer: atomer, ioner: ioner };
    };

    P.sendElektroner = function () {
        var h = this.haendelse, r = this.r, mig = this;
        var fra = [], til = [];
        h.atomer.forEach(function (a) { for (var n = 0; n < r.a; n++) fra.push(a); });
        h.ioner.forEach(function (p) { for (var n = 0; n < r.b; n++) til.push(p); });
        fra.forEach(function (a, n) {
            mig.elektroner.push({ fra: a, til: til[n], t: -n * 0.13 - 0.001, x: a.x, y: a.y });
        });
        this.afgivet += fra.length;
        h.fase = "e";
    };

    P.afslutHaendelse = function () {
        var h = this.haendelse, r = this.r, mig = this;
        /* Metalatomerne gaar i oploesning som ioner */
        var ledige = [];
        h.atomer.forEach(function (a) {
            ledige.push(a.slot);
            a.slot.atom = null;
            a.slot = null;
            a.slags = "prod";
            a.fase = "fri";
            a.vx = -0.5;
            a.vy = NK.r(-0.2, 0.2);
            a.alder = 0;
        });
        /* Ionerne bliver til metal paa stangen, eller H til H₂ */
        if (r.gas) {
            for (var n = 0; n + 1 < h.ioner.length; n += 2) {
                var p1 = h.ioner[n], p2 = h.ioner[n + 1];
                mig.fjern(p1);
                mig.fjern(p2);
                mig.bobler.push({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2, vy: -0.05, alder: 0 });
            }
        } else {
            h.ioner.forEach(function (p) {
                var s = mig.findPlads(p, ledige);
                p.slags = "atom";
                p.fase = "saet";
                if (s) {
                    s.atom = p;
                    p.slot = s;
                    p.maalX = s.x;
                    p.maalY = s.y;
                } else {
                    p.slot = null;
                    p.maalX = p.x;
                    p.maalY = p.y;
                }
            });
        }
        /* Nye ioner kommer ind fra glasset til venstre */
        h.ioner.forEach(function () { mig.ventende.push(NK.r(1.2, 2.4)); });
        /* For mange nye metalioner: de aeldste svoemmer ud til venstre */
        var prod = this.dele.filter(function (p) { return p.slags === "prod" && p.fase !== "vaek"; });
        prod.sort(function (a, b) { return b.alder - a.alder; });
        prod.slice(0, Math.max(0, prod.length - PROD_MAKS)).forEach(function (p) { p.fase = "vaek"; });
        this.antal++;
        this.haendelse = null;
        this.pause = 0.45 + 1.2 * K.tau(this.m, this.i) / 9;
    };

    /* En plads til et nyt metalatom: helst en, der lige er blevet ledig,
       ellers den naermeste ledige ved siden af stangen */
    P.findPlads = function (p, ledige) {
        var mig = this;
        if (ledige.length) return ledige.shift();
        var bedst = null, d = 1e9;
        this.gitter.forEach(function (s) {
            if (s.atom || s.x * s.x + s.y * s.y > 0.85) return;
            var nabo = mig.gitter.some(function (t) { return t.atom && t.j === s.j && t.c === s.c + 1; });
            if (!nabo) return;
            var dd = (s.x - p.x) * (s.x - p.x) + (s.y - p.y) * (s.y - p.y);
            if (dd < d) { d = dd; bedst = s; }
        });
        return bedst;
    };

    P.fjern = function (p) {
        var n = this.dele.indexOf(p);
        if (n >= 0) this.dele.splice(n, 1);
    };

    /* ----- Opdater --------------------------------------------------------------------- */
    P.opdater = function (dt) {
        var mig = this;
        dt = Math.min(dt, 0.1);
        this.dele.forEach(function (p) { mig.flyt(p, dt); });
        this.dele = this.dele.filter(function (p) { return !p.slet; });

        /* Elektronerne */
        this.elektroner.forEach(function (e) {
            if (e.t < 0 && e.t + dt / 0.55 >= 0) e.fra.ude = (e.fra.ude || 0) + 1;
            e.t += dt / 0.55;
            var t = NK.blod(NK.klamp(e.t, 0, 1));
            e.x = NK.lerp(e.fra.x, e.til.x, t);
            e.y = NK.lerp(e.fra.y, e.til.y, t) - Math.sin(t * Math.PI) * 0.12;
            if (e.t >= 1 && !e.fremme) {
                e.fremme = true;
                e.til.faaet = (e.til.faaet || 0) + 1;
                mig.optaget++;
            }
        });
        this.elektroner = this.elektroner.filter(function (e) { return !e.fremme; });

        /* Boblerne med H₂ stiger og forsvinder */
        this.bobler.forEach(function (b) {
            b.alder += dt;
            b.vy = Math.max(-0.5, b.vy - 0.6 * dt);
            b.y += b.vy * dt;
            b.x += Math.sin(b.alder * 5) * 0.02 * dt;
        });
        this.bobler = this.bobler.filter(function (b) { return b.y > -1.25; });

        /* Nye ioner fra venstre */
        for (var n = this.ventende.length - 1; n >= 0; n--) {
            this.ventende[n] -= dt;
            if (this.ventende[n] <= 0) {
                this.ventende.splice(n, 1);
                var y = NK.r(-0.5, 0.5);
                var p = this.nyFri("kat", this.i, -Math.sqrt(1 - y * y) + 0.02, y);
                p.vx = 0.3;
                this.dele.push(p);
            }
        }

        if (!this.m) return;
        if (this.reagerer) {
            var h = this.haendelse;
            if (!h) {
                this.pause -= dt;
                if (this.pause <= 0) this.startHaendelse();
            } else {
                h.t += dt;
                if (h.fase === "hent" && h.t > 0.9) this.sendElektroner();
                else if (h.fase === "e" && !this.elektroner.length && h.t > 1) this.afslutHaendelse();
            }
        } else {
            /* Ingen reaktion: en ion besoeger stangen og svoemmer videre */
            this.besoegUr -= dt;
            if (this.besoegUr <= 0) {
                this.besoegUr = NK.r(1.6, 2.4);
                var fri = this.dele.filter(function (q) { return q.slags === "kat" && q.fase === "fri"; });
                if (fri.length) {
                    fri.sort(function (a, b) { return b.x - a.x; });
                    var q = fri[Math.floor(Math.random() * Math.min(3, fri.length))];
                    q.fase = "besoeg";
                    q.maalY = NK.klamp(q.y, -0.6, 0.6);
                    q.maalX = this.kant(q.maalY) - R * 1.05;
                    q.besoeg = 0;
                }
            }
        }
    };

    P.flyt = function (p, dt) {
        if (p.slags === "atom" && p.fase === "fast") return;
        if (p.fase === "afgiver") return;
        if (p.fase === "hent" || p.fase === "saet" || p.fase === "besoeg") {
            p.x = NK.mod(p.x, p.maalX, 5, dt);
            p.y = NK.mod(p.y, p.maalY, 5, dt);
            var fremme = Math.abs(p.x - p.maalX) < 0.01 && Math.abs(p.y - p.maalY) < 0.01;
            if (p.fase === "saet" && fremme) { p.x = p.maalX; p.y = p.maalY; p.fase = "fast"; }
            if (p.fase === "besoeg") {
                p.besoeg += dt;
                if (fremme || p.besoeg > 1.4) {
                    p.fase = "fri";
                    p.vx = -0.45;
                    p.vy = NK.r(-0.25, 0.25);
                }
            }
            return;
        }
        if (p.fase === "vaek") {
            p.x -= 0.4 * dt;
            if (p.x < -1.3) p.slet = true;
            return;
        }
        /* Fri: tilfaeldig bevaegelse, der holder sig i oploesningen */
        if (p.alder !== undefined) p.alder += dt;
        p.vx += NK.r(-1, 1) * 0.6 * dt;
        p.vy += NK.r(-1, 1) * 0.6 * dt;
        var v = Math.sqrt(p.vx * p.vx + p.vy * p.vy), maks = FART * 1.6;
        if (v > maks) { p.vx *= maks / v; p.vy *= maks / v; }
        if (v < FART * 0.4 && v > 0) { p.vx *= 1.05; p.vy *= 1.05; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        var r = p.slags === "an" && K.STOF[p.sym].anion !== "Cl" ? R * 1.25 : R;
        var d = Math.sqrt(p.x * p.x + p.y * p.y);
        if (d > 0.95 - r) {
            var nx = p.x / d, ny = p.y / d, prik = p.vx * nx + p.vy * ny;
            if (prik > 0) { p.vx -= 2 * prik * nx; p.vy -= 2 * prik * ny; }
            p.x = nx * (0.95 - r);
            p.y = ny * (0.95 - r);
        }
        var kant = this.kant(p.y) - r - 0.02;
        if (p.x > kant) { p.x = kant; p.vx = -Math.abs(p.vx); }
    };

    /* Koerer n haendelser til ende med det samme (Vis svaret, selvtesten) */
    P.springFrem = function (n) {
        if (!this.reagerer) return;
        var loekke = 0;
        var maal = this.antal + (n || 1);
        while (this.antal < maal && loekke < 4000) {
            this.opdater(0.05);
            loekke++;
        }
    };

    /* ----- Tegn ------------------------------------------------------------------------ */
    function ionTekst(p) {
        if (p.slags === "an") return K.anion(p.sym);
        if (p.slags === "prod") return K.ion(p.sym);
        return K.ion(p.sym);
    }

    function tegnKugle(ctx, x, y, r, fyld, kant, kantB, tekst, tekstFarve, px) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = fyld;
        ctx.fill();
        ctx.lineWidth = kantB;
        ctx.strokeStyle = kant;
        ctx.stroke();
        if (tekst) {
            ctx.fillStyle = tekstFarve;
            NK.passendeSkrift(ctx, tekst, r * 2 - 3, px, 9, "700");
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(tekst, x, y + 0.5);
        }
    }

    function tegnPille(ctx, x, y, r, tekst, px) {
        ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
        var b = Math.max(r * 2.5, ctx.measureText(tekst).width + 10);
        NK.rundtRekt(ctx, x - b / 2, y - r * 0.85, b, r * 1.7, r * 0.85);
        ctx.fillStyle = "#2d3b52";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#97cff5";
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        NK.passendeSkrift(ctx, tekst, b - 6, px, 9, "700");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tekst, x, y + 0.5);
    }

    /* v.titel: teksten under luppen; v.alfa */
    P.tegn = function (ctx, cx, cy, Rp, v) {
        v = v || {};
        var mig = this;
        var r = R * Rp, px = NK.klamp(Math.round(r * 0.8), 10, 14);
        function X(x) { return cx + x * Rp; }
        function Y(y) { return cy + y * Rp; }
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, Rp, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fillStyle = "#11141b";
        ctx.fill();
        ctx.clip();
        /* Oploesningens farve svagt i baggrunden */
        var f = Tg.OPL[this.i];
        if (f) {
            ctx.fillStyle = "rgba(" + f[0] + ", " + f[1] + ", " + f[2] + ", 0.1)";
            ctx.fillRect(cx - Rp, cy - Rp, 2 * Rp, 2 * Rp);
        }
        /* Stangen: et svagt metalbaand bag gitteret */
        if (this.m) {
            var c = Tg.METAL[this.m];
            var g = ctx.createLinearGradient(X(FLADE), 0, cx + Rp, 0);
            g.addColorStop(0, "rgba(255, 255, 255, 0.04)");
            g.addColorStop(1, "rgba(255, 255, 255, 0.1)");
            ctx.fillStyle = g;
            ctx.fillRect(X(FLADE), cy - Rp, Rp * (1 - FLADE) + 2, 2 * Rp);
            ctx.strokeStyle = c[1];
            ctx.globalAlpha = 0.35;
            ctx.setLineDash([4, 5]);
            ctx.beginPath();
            ctx.moveTo(X(FLADE), cy - Rp);
            ctx.lineTo(X(FLADE), cy + Rp);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
        }
        /* Tilskuerioner foerst, saa ionerne, saa atomerne */
        var orden = { an: 0, kat: 1, prod: 1, atom: 2 };
        var liste = this.dele.slice().sort(function (a, b) { return orden[a.slags] - orden[b.slags]; });
        liste.forEach(function (p) {
            var x = X(p.x), y = Y(p.y);
            /* Et atom, der har afgivet alle sine elektroner, er en ion, og en
               ion, der har faaet alle sine, er et atom */
            var blevetIon = p.fase === "afgiver" && (p.ude || 0) >= K.STOF[p.sym].q;
            var blevetAtom = p.slags === "kat" && (p.faaet || 0) >= K.STOF[p.sym].q;
            if (blevetIon) {
                tegnKugle(ctx, x, y, r * 0.96, Tg.IONFARVE[p.sym] || "#e0e4ec", "#f7a79d", 2, K.ion(p.sym), "#1c1f26", px);
                return;
            }
            if (blevetAtom) {
                var ca = Tg.METAL[p.sym];
                tegnKugle(ctx, x, y, p.sym === "H" ? r * 0.55 : r, ca[1], "rgba(0, 0, 0, 0.55)", 1.2, p.sym,
                    (p.sym === "Fe" || p.sym === "Pb") ? "#ffffff" : "#1c1f26", px);
                return;
            }
            if (p.slags === "an") {
                if (K.STOF[p.sym].anion === "Cl") tegnKugle(ctx, x, y, r * 0.9, "#2d3b52", "#97cff5", 2, "Cl⁻", "#ffffff", px);
                else tegnPille(ctx, x, y, r, ionTekst(p), px);
            } else if (p.slags === "atom") {
                var cm = Tg.METAL[p.sym];
                var gg = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
                gg.addColorStop(0, cm[0]);
                gg.addColorStop(0.6, cm[1]);
                gg.addColorStop(1, cm[2]);
                var lys = p.fase === "afgiver" ? "#f2c53d" : "rgba(0, 0, 0, 0.55)";
                tegnKugle(ctx, x, y, r, gg, lys, p.fase === "afgiver" ? 2.5 : 1.2, p.sym,
                    (p.sym === "Fe" || p.sym === "Pb") ? "#ffffff" : "#1c1f26", px);
            } else {
                /* En ion: H⁺ er lille. Faar den elektroner, ses de som prikker. */
                var rr = p.sym === "H" ? r * 0.72 : r * 0.96;
                tegnKugle(ctx, x, y, rr, Tg.IONFARVE[p.sym] || "#e0e4ec", "#f7a79d", 2, ionTekst(p), "#1c1f26", px);
                for (var n = 0; n < (p.faaet || 0); n++) {
                    var vv = -Math.PI / 2 + n * 0.9;
                    ctx.fillStyle = "#ffe14a";
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(vv) * rr, y + Math.sin(vv) * rr, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });
        /* H₂ i sine bobler */
        this.bobler.forEach(function (b) {
            var x = X(b.x), y = Y(b.y);
            ctx.fillStyle = "rgba(235, 245, 255, 0.12)";
            ctx.strokeStyle = "rgba(235, 245, 255, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x, y, r * 1.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            tegnKugle(ctx, x - r * 0.38, y, r * 0.55, "#ffffff", "#9fb0c0", 1, "", "", px);
            tegnKugle(ctx, x + r * 0.38, y, r * 0.55, "#ffffff", "#9fb0c0", 1, "", "", px);
            ctx.fillStyle = "#1c1f26";
            ctx.font = "700 " + px + "px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("H₂", x, y + 0.5);
        });
        /* Elektronerne */
        this.elektroner.forEach(function (e) {
            if (e.t < 0) return;
            var x = X(e.x), y = Y(e.y);
            ctx.fillStyle = "rgba(255, 225, 74, 0.28)";
            ctx.beginPath();
            ctx.arc(x, y, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffe14a";
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
        /* Ringen og teksten under */
        ctx.save();
        ctx.strokeStyle = "rgba(242, 197, 61, 0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, Rp, 0, Math.PI * 2);
        ctx.stroke();
        if (v.titel) {
            ctx.font = "600 13px 'Segoe UI', sans-serif";
            ctx.fillStyle = "#dde3ea";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(v.titel, cx, cy + Rp + 8);
            if (this.reagerer) {
                ctx.fillStyle = "#ffe14a";
                ctx.beginPath();
                ctx.arc(cx - 36, cy + Rp + 34, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#a9b0ba";
                ctx.textAlign = "left";
                ctx.fillText("= elektron", cx - 28, cy + Rp + 26);
            }
        }
        ctx.restore();
    };

    NK.Lup = Lup;
}());

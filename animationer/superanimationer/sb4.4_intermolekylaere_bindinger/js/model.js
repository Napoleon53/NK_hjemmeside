/* =====================================================================
   model.js - proeven i lupen: molekylerne, kraefterne og tilstanden

   NK.Proeve(stof, antal, Rm, froe) er et lukket glas med antal molekyler
   af stoffet, set gennem en rund lup med radius Rm (modellens enheder).
   Ballonen paa glasset holder trykket paa 1 atm.

   Tilstanden kommer fra tabellen, ikke fra bevaegelsen (som sc6.1):
     * Over kogepunktet river molekylerne sig loes fra vaesken ét ad
       gangen, hurtigere jo varmere det er, til alt er damp.
     * Under kogepunktet er en lille del damp efter damptrykket, og
       dampen fortaetter igen, naar der koeles.
   Kogepunktet er tabelvaerdien. Er hydrogenbindingerne slaaet fra, er
   det kogepunktet for alkanen med samme form (stoffets "uden").

   Bevaegelsen er en lille fysik med stive, flade molekyler:
     * alle atomer stoder fra hinanden
     * hydrogenbinding: H paa O i ét molekyle traekkes mod O i et andet
       (hvert H én, hvert O hoejst to, et for hvert frit elektronpar)
     * London-kraft: C-atomer i to molekyler traekker svagt i hinanden
     * vaesken synker til bunds; dampen farer rundt
   Begge kraefter virker kun mellem molekyler i vaesken. Én
   hydrogenbinding traekker ca. fem gange saa haardt som én London-kraft.
   Det, der tegnes og taelles, er de bindinger, fysikken har dannet.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* ----- Konstanterne ----------------------------------------------- */
    var K = {
        SKRIDT: 1 / 240,       /* fysikkens tidsskridt, s */
        REP: 700,              /* frastoedning pr. overlap */
        REP_GAS: 1600,         /* stivere, naar dampen farer ind i noget */
        VAEG: 500,
        VAEG_GAS: 1600,
        HB_D0: 1.45,           /* H...O i en hydrogenbinding */
        HB_SIGMA: 1.3,         /* saa taet kan H og O komme */
        HB_FANG: 2.9,          /* saa langt vaek fanges O */
        HB_VIS: 1.9,           /* saa taet skal de vaere for at taelle */
        HB_K: 70,
        HB_MAKS: 16,
        OO_K: 30,              /* O...O i samme binding: holder den lige */
        OO_MAKS: 6,
        LON_TIL: 2.9,          /* C...C: London-kraftens raekkevidde */
        LON_FULD: 2.3,
        LON_VIS: 2.45,         /* saa taet for at blive tegnet */
        LON_F: 4.5,
        G: 6,                  /* tyngden i vaesken */
        GAMMA_V: 4.0, V_V: 0.75, W_V: 1.3,   /* vaesken: daempning og uro */
        GAMMA_G: 0.35, V_G: 3.6, W_G: 3.0,   /* dampen */
        VMAKS_V: 6, VMAKS_G: 22, WMAKS: 14,
        FMAKS: 160, FMAKS_GAS: 320,
        DAMP_MAKS: 0.12,       /* hoejst saa stor en del er damp under kogepunktet */
        RING: 0.7              /* den hvide ring, naar et molekyle skifter */
    };

    /* Et lille, fast tilfaeldighedstal (mulberry32), saa selvtesten kan
       koere det samme forsoeg igen */
    function rng(froe) {
        var a = (froe >>> 0) || 1;
        return function () {
            a = (a + 0x6D2B79F5) >>> 0;
            var t = a;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function Proeve(stof, antal, Rm, froe) {
        this.st = stof;
        this.F = NK.Mol.form(stof.smiles);
        this.N = antal;
        this.Rm = Rm;
        this.r = rng(froe || 7);
        this.hb = true;
        this.T = 20;
        this.mol = [];
        this.hbListe = [];
        this.lonListe = [];
        this.brudte = [];
        this.tUd = 0;
        this.tInd = 0;
        this.masse = this.F.M / 14;       /* massen regnet i CH2-grupper */
        this.inerti = this.F.I / 14;
    }

    var P = Proeve.prototype;

    /* Tilfaeldigt tal med middel 0 og spredning 1 */
    P.gauss = function () {
        var u = this.r() || 1e-9, v = this.r();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    /* ----- Kogepunkt og damptryk ----------------------------------------- */
    P.kp = function () {
        if (!this.hb && this.st.OH && this.st.uden) return D.STOF[this.st.uden].kp;
        return this.st.kp;
    };

    /* Damptrykket i atm ved T °C. Fordampningsentropien er Troutons 88
       J/(mol·K), men 110 for stoffer med hydrogenbindinger (Hildebrand). */
    P.damptryk = function (T) {
        var dS = this.st.OH && this.hb ? 110 : 88;
        var Tk = T + 273.15, Tb = this.kp() + 273.15;
        return Math.exp(dS / 8.314 * (1 - Tb / Tk));
    };

    P.koger = function () { return this.T >= this.kp(); };

    P.antalGas = function () {
        var n = 0;
        this.mol.forEach(function (m) { if (m.gas) n++; });
        return n;
    };

    /* Saa mange skal vaere damp ved temperaturen lige nu */
    P.maalGas = function () {
        if (this.koger()) return this.N;
        return Math.min(this.N, Math.round(this.N * K.DAMP_MAKS * Math.min(1, this.damptryk(this.T))));
    };

    /* ----- Start: vaesken i bunden, eller damp overalt ------------------- */
    P.nulstil = function (T) {
        this.T = T;
        this.mol = [];
        this.brudte = [];
        this.hbListe = [];
        this.lonListe = [];
        var kas = NK.Mol.kasse(this.F, 0);
        var mb = kas.b + 0.25, mh = kas.h + 0.25;
        var Rm = this.Rm, mig = this;
        var vaeske = this.N - this.maalGas();
        /* Raekker fra bunden af cirklen og op */
        var pladser = [];
        for (var y = Rm - mh / 2 - 0.15; y > -Rm + mh / 2 && pladser.length < this.N; y -= mh * 0.92) {
            var halv = Math.sqrt(Math.max(0, Rm * Rm - Math.pow(Math.abs(y) + mh / 2, 2))) - 0.2;
            var n = Math.floor((2 * halv) / mb);
            for (var i = 0; i < n; i++) pladser.push({ x: -halv + mb * (i + 0.5) + (2 * halv - n * mb) / 2, y: y });
        }
        for (var k = 0; k < this.N; k++) {
            var m = { x: 0, y: 0, a: 0, vx: 0, vy: 0, w: 0, gas: k >= vaeske, ring: 0, fx: 0, fy: 0, tq: 0, nr: k };
            if (!m.gas && pladser[k]) {
                m.x = pladser[k].x; m.y = pladser[k].y;
                m.a = (this.r() < 0.5 ? 0 : Math.PI) + (this.r() - 0.5) * 0.6;
            } else {
                m.gas = true;
                this.tilfaeldigPlads(m);
            }
            this.mol.push(m);
        }
        /* Lad vaesken falde paa plads, foer den vises */
        for (var t = 0; t < 2.5; t += K.SKRIDT) this.skridt(K.SKRIDT);
        this.mol.forEach(function (q) { q.ring = 0; });
        this.brudte = [];
        void mig;
    };

    /* En ledig plads et tilfaeldigt sted i lupen (til dampen) */
    P.tilfaeldigPlads = function (m) {
        var R = this.Rm - this.F.R - 0.1;
        for (var forsoeg = 0; forsoeg < 40; forsoeg++) {
            var v = this.r() * 2 * Math.PI, rr = Math.sqrt(this.r()) * R;
            m.x = Math.cos(v) * rr; m.y = Math.sin(v) * rr;
            var fri = true;
            for (var i = 0; i < this.mol.length; i++) {
                var o = this.mol[i];
                if (o === m) continue;
                if (Math.hypot(o.x - m.x, o.y - m.y) < 2 * this.F.R) { fri = false; break; }
            }
            if (fri) break;
        }
        m.a = this.r() * 2 * Math.PI;
        var v0 = this.fartGas();
        m.vx = this.gauss() * v0; m.vy = this.gauss() * v0;
        m.w = this.gauss() * K.W_G;
    };

    /* Dampens fart: vokser med temperaturen og er mindre for tunge molekyler */
    P.fartGas = function () {
        return K.V_G * Math.sqrt(Math.max(60, this.T + 273.15) / 300 * 46 / this.st.M);
    };

    /* ----- Opdatering ------------------------------------------------------ */
    P.opdater = function (dt, T) {
        if (T !== undefined) this.T = T;
        dt = Math.min(dt, 0.05);
        this.skiftTilstand(dt);
        var n = Math.max(1, Math.ceil(dt / K.SKRIDT));
        for (var i = 0; i < n; i++) this.skridt(dt / n);
        var mig = this;
        this.mol.forEach(function (m) { if (m.ring > 0) m.ring = Math.max(0, m.ring - dt / K.RING); });
        this.brudte = this.brudte.filter(function (b) { b.t += dt; return b.t < 0.7; });
        void mig;
    };

    /* Vaesken koger eller dampen fortaetter, ét molekyle ad gangen */
    P.skiftTilstand = function (dt) {
        var maal = this.maalGas(), nu = this.antalGas(), kp = this.kp();
        if (nu < maal) {
            var fart = this.koger() ? Math.min(10, 0.8 + 0.45 * (this.T - kp)) : 0.8;
            this.tUd += dt * fart;
            while (this.tUd >= 1 && nu < maal) { this.tUd -= 1; this.fordamp(); nu++; }
            this.tInd = 0;
        } else if (nu > maal) {
            var ind = this.koger() ? 0 : Math.min(30, 1.2 + 1.6 * (kp - this.T));
            this.tInd += dt * ind;
            while (this.tInd >= 1 && nu > maal) { this.tInd -= 1; this.fortaet(); nu--; }
            this.tUd = 0;
        } else {
            this.tUd = 0;
            this.tInd = 0;
        }
    };

    /* Det oeverste molekyle i vaesken river sig loes */
    P.fordamp = function () {
        var top = null;
        this.mol.forEach(function (m) { if (!m.gas && (!top || m.y < top.y)) top = m; });
        if (!top) return;
        var mig = this;
        /* Bindingerne til det springer: de tegnes et oejeblik som brudte */
        this.hbListe.concat(this.lonListe).forEach(function (b) {
            if (b.a === top || b.b === top) mig.brudte.push({ x1: b.x1, y1: b.y1, x2: b.x2, y2: b.y2, slags: b.slags, t: 0 });
        });
        top.gas = true;
        top.ring = 1;
        var v0 = this.fartGas();
        top.vy = -v0 * (1.2 + this.r() * 0.6);
        top.vx = this.gauss() * v0 * 0.5;
        top.w = this.gauss() * K.W_G;
    };

    /* Det laveste molekyle i dampen bliver til vaeske igen */
    P.fortaet = function () {
        var bund = null;
        this.mol.forEach(function (m) { if (m.gas && (!bund || m.y > bund.y)) bund = m; });
        if (!bund) return;
        bund.gas = false;
        bund.ring = 1;
    };

    /* ----- Fysikken: ét tidsskridt ---------------------------------------- */
    P.verden = function (m) {
        var c = Math.cos(m.a), s = Math.sin(m.a);
        var A = this.F.atomer;
        if (!m.wx) { m.wx = new Array(A.length); m.wy = new Array(A.length); }
        for (var i = 0; i < A.length; i++) {
            m.wx[i] = m.x + A[i].x * c - A[i].y * s;
            m.wy[i] = m.y + A[i].x * s + A[i].y * c;
        }
    };

    function kraft(m, i, fx, fy) {
        m.fx += fx;
        m.fy += fy;
        m.tq += (m.wx[i] - m.x) * fy - (m.wy[i] - m.y) * fx;
    }

    P.skridt = function (dt) {
        var mol = this.mol, F = this.F, A = F.atomer, nA = A.length;
        var i, j, a, b, p, q, m;
        for (i = 0; i < mol.length; i++) {
            m = mol[i];
            this.verden(m);
            m.fx = 0; m.fy = 0; m.tq = 0;
        }
        var raekke = 2 * F.R + K.LON_TIL;
        var hbKand = [];
        var lon = [];
        for (i = 0; i < mol.length; i++) {
            a = mol[i];
            for (j = i + 1; j < mol.length; j++) {
                b = mol[j];
                var dx = b.x - a.x, dy = b.y - a.y;
                if (dx * dx + dy * dy > raekke * raekke) continue;
                var begge = !a.gas && !b.gas;
                for (p = 0; p < nA; p++) {
                    var Ap = A[p];
                    for (q = 0; q < nA; q++) {
                        var Aq = A[q];
                        var ex = b.wx[q] - a.wx[p], ey = b.wy[q] - a.wy[p];
                        var d2 = ex * ex + ey * ey;
                        if (d2 > 8.5) continue;
                        var d = Math.sqrt(d2) || 1e-6;
                        var hbPar = (Ap.donor && Aq.acc) || (Ap.acc && Aq.donor);
                        var sig = hbPar ? K.HB_SIGMA : Ap.rho + Aq.rho;
                        var f = 0;
                        if (d < sig) f = -(begge ? K.REP : K.REP_GAS) * (sig - d);   /* frastoedning */
                        if (begge) {
                            if (hbPar && this.hb && d < K.HB_FANG) {
                                hbKand.push({ d: d, a: a, b: b, h: Ap.donor ? p : q, o: Ap.donor ? q : p, hErA: Ap.donor });
                            } else if (Ap.e === "C" && Aq.e === "C" && d < K.LON_TIL) {
                                f += K.LON_F * (d < K.LON_FULD ? 1 : (K.LON_TIL - d) / (K.LON_TIL - K.LON_FULD));
                                if (d < K.LON_VIS) lon.push({ a: a, b: b, p: p, q: q, d: d });
                            }
                        }
                        if (f) {
                            f = NK.klamp(f, begge ? -K.FMAKS : -K.FMAKS_GAS, K.FMAKS);
                            var ux = ex / d, uy = ey / d;
                            kraft(a, p, ux * f, uy * f);
                            kraft(b, q, -ux * f, -uy * f);
                        }
                    }
                }
            }
        }

        /* Hydrogenbindingerne: de korteste foerst, hvert H én og hvert O to */
        hbKand.sort(function (x, y) { return x.d - y.d; });
        var brugtH = {}, brugtO = {}, hb = [];
        for (i = 0; i < hbKand.length; i++) {
            var c = hbKand[i];
            var donorMol = c.hErA ? c.a : c.b, accMol = c.hErA ? c.b : c.a;
            var kh = donorMol.nr + ":" + c.h, ko = accMol.nr + ":" + c.o;
            if (brugtH[kh] || (brugtO[ko] || 0) >= 2) continue;
            brugtH[kh] = 1;
            brugtO[ko] = (brugtO[ko] || 0) + 1;
            /* H traekkes mod O */
            var hx = donorMol.wx[c.h], hy = donorMol.wy[c.h], ox = accMol.wx[c.o], oy = accMol.wy[c.o];
            var dd = Math.hypot(ox - hx, oy - hy) || 1e-6;
            if (dd > K.HB_D0) {
                var fh = Math.min(K.HB_K * (dd - K.HB_D0), K.HB_MAKS);
                kraft(donorMol, c.h, (ox - hx) / dd * fh, (oy - hy) / dd * fh);
                kraft(accMol, c.o, -(ox - hx) / dd * fh, -(oy - hy) / dd * fh);
            }
            /* Og O-H...O holdes nogenlunde lige */
            var oi = A[c.h].paa;
            var ax = donorMol.wx[oi], ay = donorMol.wy[oi];
            var doo = Math.hypot(ox - ax, oy - ay) || 1e-6, soll = K.HB_D0 + NK.Mol.BINDING.OH;
            if (doo > soll) {
                var fo = Math.min(K.OO_K * (doo - soll), K.OO_MAKS);
                kraft(donorMol, oi, (ox - ax) / doo * fo, (oy - ay) / doo * fo);
                kraft(accMol, c.o, -(ox - ax) / doo * fo, -(oy - ay) / doo * fo);
            }
            if (dd < K.HB_VIS) hb.push({ a: donorMol, b: accMol, h: c.h, o: c.o, d: dd });
        }

        /* Vaeggen og tyngden */
        var Rm = this.Rm;
        for (i = 0; i < mol.length; i++) {
            m = mol[i];
            for (p = 0; p < nA; p++) {
                var rr = Math.hypot(m.wx[p], m.wy[p]), ud = rr + A[p].rho - Rm;
                if (ud > 0 && rr > 1e-6) {
                    var fv = -Math.min((m.gas ? K.VAEG_GAS : K.VAEG) * ud, K.FMAKS_GAS);
                    kraft(m, p, m.wx[p] / rr * fv, m.wy[p] / rr * fv);
                }
            }
            if (!m.gas) m.fy += this.masse * K.G;
        }

        /* Bevaegelsen med daempning og uro (Langevin) */
        var vG = this.fartGas();
        var sdt = Math.sqrt(dt);
        for (i = 0; i < mol.length; i++) {
            m = mol[i];
            var g = m.gas ? K.GAMMA_G : K.GAMMA_V;
            var vT = m.gas ? vG : K.V_V, wT = m.gas ? K.W_G : K.W_V;
            m.vx += m.fx / this.masse * dt - g * m.vx * dt + vT * Math.sqrt(2 * g) * sdt * this.gauss();
            m.vy += m.fy / this.masse * dt - g * m.vy * dt + vT * Math.sqrt(2 * g) * sdt * this.gauss();
            m.w += m.tq / this.inerti * dt - g * m.w * dt + wT * Math.sqrt(2 * g) * sdt * this.gauss();
            var vmaks = m.gas ? K.VMAKS_G : K.VMAKS_V, v = Math.hypot(m.vx, m.vy);
            if (v > vmaks) { m.vx *= vmaks / v; m.vy *= vmaks / v; }
            m.w = NK.klamp(m.w, -K.WMAKS, K.WMAKS);
            m.x += m.vx * dt;
            m.y += m.vy * dt;
            m.a += m.w * dt;
        }

        /* Det, der tegnes: bindingerne mellem molekylerne lige nu */
        this.hbListe = hb.map(function (x) {
            return { a: x.a, b: x.b, x1: x.a.wx[x.h], y1: x.a.wy[x.h], x2: x.b.wx[x.o], y2: x.b.wy[x.o], slags: "hb", h: x.h, o: x.o };
        });
        this.lonListe = lon.map(function (x) {
            return { a: x.a, b: x.b, x1: x.a.wx[x.p], y1: x.a.wy[x.p], x2: x.b.wx[x.q], y2: x.b.wy[x.q], slags: "lon" };
        });
    };

    /* Glassets indhold til tegningen: vaesken, boblerne og ballonen */
    P.makro = function () {
        var g = this.antalGas() / this.N;
        var kp = this.kp();
        return {
            vaeske: 1 - g,
            koger: this.koger() && g < 1 ? NK.klamp((this.T - kp + 2) / 14, 0.1, 1) : 0,
            /* Ballonen: fuld ved 20 °C, naar alt er damp; varm damp fylder mere */
            ballon: g * (this.T + 273.15) / 293.15
        };
    };

    NK.Proeve = Proeve;
    NK.Proeve.K = K;
}());

/* =====================================================================
   model.js - molekylerne og tilstandene

   En proeve er det, der er inde i glasset: et antal molekyler af ét
   eller flere stoffer i en kasse (zoomvinduet). Et molekyle er et stift
   legeme af kugler, én kugle pr. C-atom med dets H-atomer. Kuglens
   radius er enheden for alle laengder her.

   Hvilken tilstand et molekyle er i, afgoeres af tabellens smelte- og
   kogepunkt, ikke af bevaegelsen: over kogepunktet koger stoffet, og
   molekylerne gaar et ad gangen fra vaesken til gassen, hurtigere jo
   varmere det er. Under kogepunktet er en lille del damp efter
   damptrykket (D.damptryk). Bevaegelsen er saa en lille fysik:
     - kuglerne skubber fra hinanden, naar de overlapper
     - kugler fra to molekyler i vaeske eller fast stof tiltraekker
       hinanden, naar de naesten roerer (London-kraefterne)
     - vaeske og fast stof falder til bunden, gassen flyver frit
     - et fast molekyle holdes paa sin plads i gitteret af en fjeder
     - hver tilstand har sin temperatur: gassen farer hurtigere rundt,
       jo varmere det er, og jo lettere molekylet er

   Formerne (NK.Form) og det bedste par (to molekyler, der roerer
   hinanden mest) staar ogsaa her. Tegningen staar i tegning.js.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;

    /* ----- Formerne ------------------------------------------------------
       Afstanden mellem to C-kugler er 1,35 radier, vinklen 112°, saa en
       kaede er en zigzag af kugler, der overlapper. */
    var BINDING = 1.35;
    var HALV = 56 * Math.PI / 180;
    var AKSE = BINDING * Math.sin(HALV);
    var TVAERS = BINDING * Math.cos(HALV);
    var KONTAKT = 2.45;               /* to kugler roerer, naar afstanden er under */

    var formLager = {};

    function lavForm(st) {
        var p = [], b = [], i;
        if (st.form === "dimethylpropan") {
            var d = BINDING / Math.SQRT2;
            p = [[0, 0], [d, d], [-d, d], [d, -d], [-d, -d]];
            b = [[0, 1], [0, 2], [0, 3], [0, 4]];
        } else {
            var n = st.form === "methylbutan" ? 4 : st.nC;
            for (i = 0; i < n; i++) {
                p.push([i * AKSE, i % 2 ? -TVAERS : 0]);
                if (i) b.push([i - 1, i]);
            }
            /* Grenen sidder paa C2 og peger vaek fra kaeden */
            if (st.form === "methylbutan") {
                p.push([p[1][0], p[1][1] - BINDING]);
                b.push([1, 4]);
            }
        }
        var cx = 0, cy = 0;
        p.forEach(function (q) { cx += q[0]; cy += q[1]; });
        cx /= p.length;
        cy /= p.length;
        var f = { px: [], py: [], n: p.length, b: b, R: 0, I: 0, m: p.length };
        p.forEach(function (q) {
            var x = q[0] - cx, y = q[1] - cy;
            f.px.push(x);
            f.py.push(y);
            f.R = Math.max(f.R, Math.sqrt(x * x + y * y));
            f.I += x * x + y * y + 0.5;
        });
        f.R += 1;
        return f;
    }

    function form(st) {
        if (!formLager[st.id]) formLager[st.id] = lavForm(st);
        return formLager[st.id];
    }

    /* Kuglernes plads, naar molekylet staar i (x, y) drejet a */
    function kugler(f, x, y, a) {
        var c = Math.cos(a), s = Math.sin(a), ud = [];
        for (var i = 0; i < f.n; i++) ud.push([x + c * f.px[i] - s * f.py[i], y + s * f.px[i] + c * f.py[i]]);
        return ud;
    }

    /* Den kasse, formen fylder, drejet a (kun 0 og pi bruges) */
    function kasse(f, a) {
        var k = kugler(f, 0, 0, a), x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
        k.forEach(function (q) {
            x0 = Math.min(x0, q[0] - 1); x1 = Math.max(x1, q[0] + 1);
            y0 = Math.min(y0, q[1] - 1); y1 = Math.max(y1, q[1] + 1);
        });
        return { x0: x0, x1: x1, y0: y0, y1: y1, b: x1 - x0, h: y1 - y0 };
    }

    /* ----- Det bedste par ---------------------------------------------------
       To ens molekyler skubbes sammen fra alle retninger og i alle
       drejninger. Hvor mange kuglepar roerer, naar de ligger bedst? Det er
       et maal for beroeringsfladen. Regnes én gang pr. stof. */
    var parLager = {};

    function roererPar(ka, kb) {
        var n = 0, mind = 1e9;
        for (var i = 0; i < ka.length; i++) {
            for (var j = 0; j < kb.length; j++) {
                var dx = ka[i][0] - kb[j][0], dy = ka[i][1] - kb[j][1];
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < mind) mind = d;
                if (d < KONTAKT) n++;
            }
        }
        return { n: n, mind: mind };
    }

    function bedstePar(st) {
        if (parLager[st.id]) return parLager[st.id];
        var f = form(st), ka = kugler(f, 0, 0, 0);
        var bedst = { n: -1 }, TRIN = 60;
        for (var ia = 0; ia < TRIN; ia++) {
            var a = ia * 2 * Math.PI / TRIN;
            for (var iv = 0; iv < TRIN; iv++) {
                var v = iv * 2 * Math.PI / TRIN, cv = Math.cos(v), sv = Math.sin(v);
                /* Fra langt ude ind mod det foerste molekyle, til kuglerne roerer */
                var s = 2 * f.R + 1, ds = 0.2, forrige = s;
                while (s > 0) {
                    var r = roererPar(ka, kugler(f, s * cv, s * sv, a));
                    if (r.mind < 2) break;
                    forrige = s;
                    s -= ds;
                }
                if (s <= 0) continue;
                /* Finjuster, saa de netop roerer */
                var lo = s, hi = forrige;
                for (var k = 0; k < 12; k++) {
                    var mid = (lo + hi) / 2;
                    if (roererPar(ka, kugler(f, mid * cv, mid * sv, a)).mind < 2) lo = mid; else hi = mid;
                }
                var res = roererPar(ka, kugler(f, hi * cv, hi * sv, a));
                if (res.n > bedst.n) bedst = { n: res.n, x: hi * cv, y: hi * sv, a: a };
            }
        }
        parLager[st.id] = bedst;
        return bedst;
    }

    NK.Form = {
        form: form,
        kugler: kugler,
        kasse: kasse,
        bedstePar: bedstePar,
        KONTAKT: KONTAKT,
        BINDING: BINDING
    };

    /* ----- Fysikken ----------------------------------------------------------- */
    var K_FRA = 2000;        /* kuglerne skubber fra hinanden */
    var E_TIL = 14;          /* tiltraekningen mellem to kugler, der naesten roerer */
    var TIL_R = 2.7;         /* ... ud til denne afstand */
    var K_VAEG = 2000;
    var TYNGDE = 30;         /* vaeske og fast stof falder til bunden */
    var K_PLADS = 220, C_PLADS = 16, K_DREJ = 60, C_DREJ = 8, F_PLADS = 90;
    var KT_GAS = 80;         /* gassens temperatur i modellen ved 20 °C */
    var FART_MAKS = 40;
    var DELSTEG = 1 / 480;

    var FAST = 0, VAESKE = 1, GAS = 2;

    function gauss() {
        return (Math.random() + Math.random() + Math.random() - 1.5) * 2;
    }

    /* Hvor hurtigt stoffet skifter tilstand: en brøkdel af molekylerne pr.
       sekund. Lige over kogepunktet koger det stille, 12 grader over koger
       det hele paa lidt over et sekund. */
    function fart(dT) {
        return 0.9 * NK.klamp(dT / 12, 0.12, 1);
    }

    /* opt: { W, H, T, stoffer: [{ st, n, farve }], startT }
       startT: tilstanden, proeven starter i (ellers T). */
    function Proeve(opt) {
        this.W = opt.W;
        this.H = opt.H;
        this.T = opt.T;
        this.pause = false;
        this.tid = 0;
        this.haendelser = [];
        this.produkter = [];
        this.braendt = false;
        this.grupper = opt.stoffer.map(function (s, k) {
            return {
                k: k, st: s.st, f: form(s.st), n: s.n, farve: s.farve || null,
                akk: 0, akkS: 0, dampUr: 0
            };
        });
        this.mol = [];
        this.lavPladser();
        this.startT = opt.startT === undefined ? opt.T : opt.startT;
        this.fyld(this.startT);
        this.forvarm(opt.forvarm === undefined ? 2 : opt.forvarm);
    }

    var P = Proeve.prototype;

    /* ----- Gitteret: pladserne i fast stof ---------------------------------
       Ét stof: molekylerne staar i raekker fra bunden, alle vendt ens og
       lige over hinanden, saa en lige kaede ligger 2 radier over den under
       sig. Kompakte molekyler (metan, 2,2-dimethylpropan) forskydes en halv
       plads hver anden raekke, saa de pakkes som kugler.
       En blanding pakkes i tilfaeldig raekkefoelge og uden at gribe ind i
       hinanden; der er pladserne kun, hvor vaesken starter. */
    P.lavPladser = function () {
        var W = this.W, H = this.H, pladser = [];
        if (this.grupper.length === 1) {
            var g = this.grupper[0], k = kasse(g.f, 0);
            var lige = g.st.form === "kaede" && g.f.n > 1;
            var skridt = k.b + 0.1;
            var iRaekke = Math.max(1, Math.floor((W - 0.4 + 0.1) / skridt));
            var fuld = iRaekke * skridt - 0.1;
            var x0 = -W / 2 + 0.2 + (W - 0.4 - fuld) / 2;
            /* To lige kaeder over hinanden: en kugle i den nederste, der
               peger op, maa ikke roere de to skraat over sig, saa
               afstanden er TVAERS + kvadratroden af 4 - AKSE² (ca. 2,42) */
            var mellem = lige ? TVAERS + Math.sqrt(4 - AKSE * AKSE) + 0.01 : (g.st.form === "kaede" ? k.h * 0.87 : k.h * 0.9);
            var nr = 0;
            for (var r = 0; nr < g.n; r++) {
                var skub = !lige && r % 2 ? skridt / 2 : 0;
                var antal = skub && x0 + skub + iRaekke * skridt - 0.1 > W / 2 - 0.2 ? iRaekke - 1 : iRaekke;
                for (var c = 0; c < antal && nr < g.n; c++, nr++) {
                    pladser.push({
                        g: g,
                        x: x0 + skub + c * skridt - k.x0,
                        y: H / 2 - r * mellem - k.h / 2 - (k.y0 + k.y1) / 2,
                        a: 0, fri: true
                    });
                }
            }
        } else {
            var liste = [];
            this.grupper.forEach(function (gg) { for (var i = 0; i < gg.n; i++) liste.push(gg); });
            liste = NK.bland(liste);
            var y = H / 2, raekke = [], bredde = 0;
            var afslut = function () {
                if (!raekke.length) return;
                var hoejde = 0;
                raekke.forEach(function (q) { hoejde = Math.max(hoejde, q.k.h); });
                var x = -W / 2 + 0.2 + (W - 0.4 - bredde) / 2;
                raekke.forEach(function (q) {
                    pladser.push({ g: q.g, x: x - q.k.x0, y: y - q.k.h / 2 - (q.k.y0 + q.k.y1) / 2, a: 0, fri: true });
                    x += q.k.b + 0.1;
                });
                y -= hoejde + 0.1;
                raekke = [];
                bredde = 0;
            };
            liste.forEach(function (gg) {
                var kk = kasse(gg.f, 0);
                if (raekke.length && bredde + 0.1 + kk.b > W - 0.4) afslut();
                bredde += (raekke.length ? 0.1 : 0) + kk.b;
                raekke.push({ g: gg, k: kk });
            });
            afslut();
        }
        /* Nederste plads foerst */
        pladser.sort(function (p, q) { return q.y - p.y; });
        this.pladser = pladser;
    };

    /* Ligevaegten ved T: hvor mange af gruppens molekyler er fast stof,
       vaeske og gas */
    P.dampMaal = function (g, T) {
        if (T < g.st.smp || T >= g.st.kp) return 0;
        return Math.round(D.DAMP * g.n * D.damptryk(g.st, T));
    };

    P.dampMaks = function (g) {
        return Math.ceil(D.DAMP * g.n);
    };

    P.ligevaegt = function (g, T) {
        if (T < g.st.smp) return [g.n, 0, 0];
        if (T >= g.st.kp) return [0, 0, g.n];
        var gas = this.dampMaal(g, T);
        return [0, g.n - gas, gas];
    };

    /* Laeg molekylerne, som proeven er ved temperaturen T: fast stof og
       vaeske paa pladserne nedefra, gassen spredt ovenover */
    P.fyld = function (T) {
        var mig = this, kond = [], gas = [], brugt = [];
        this.mol = [];
        this.produkter = [];
        this.pladser.forEach(function (p) { p.fri = true; });
        this.grupper.forEach(function (g) {
            var lv = mig.ligevaegt(g, T);
            for (var i = 0; i < g.n; i++) {
                var t = i < lv[0] ? FAST : (i < lv[0] + lv[1] ? VAESKE : GAS);
                var m = mig.nytMolekyle(g, t);
                mig.mol.push(m);
                (t === GAS ? gas : kond).push(m);
            }
        });
        /* Det faste stof faar de nederste pladser */
        kond.sort(function (a, b) { return a.tilstand - b.tilstand; });
        kond.forEach(function (m) {
            var p = mig.friPlads(m.g);
            if (!p) { m.tilstand = GAS; gas.push(m); return; }
            p.fri = false;
            m.x = p.x;
            m.y = p.y;
            m.a = p.a;
            if (m.tilstand === FAST) m.plads = p;
            else {
                /* Vaesken bruger kun pladserne som start, lidt skaevt, saa
                   den ikke ligner en krystal */
                brugt.push(p);
                m.x += NK.r(-1.2, 1.2);
                m.y -= NK.r(0, 1);
                /* Lange kaeder drejes mindre, saa de ikke krydser naboerne:
                   enderne flytter sig hoejst en halv kugle */
                var vk = Math.min(0.5, 0.5 / m.f.R);
                m.a += NK.r(-vk, vk);
            }
        });
        brugt.forEach(function (p) { p.fri = true; });
        var placeret = kond.filter(function (m) { return m.tilstand !== GAS; });
        gas.forEach(function (m) {
            mig.spred(m, placeret);
            placeret.push(m);
        });
        this.mol.forEach(function (m) { m.farve = m.tilstand; });
    };

    P.nytMolekyle = function (g, tilstand) {
        return { g: g, f: g.f, x: 0, y: 0, a: 0, vx: 0, vy: 0, w: 0,
                 tilstand: tilstand, farve: tilstand, plads: null, fx: 0, fy: 0, t: 0, kx: [], ky: [] };
    };

    /* Den nederste ledige plads for stoffet */
    P.friPlads = function (g) {
        for (var i = 0; i < this.pladser.length; i++) {
            var p = this.pladser[i];
            if (p.fri && p.g === g) return p;
        }
        return null;
    };

    /* En plads til et gasmolekyle over det, der er placeret: den af 40
       tilfaeldige pladser, der har mest luft omkring sig */
    P.spred = function (m, placeret) {
        var W = this.W, H = this.H, bedst = null, bedstAfst = -1e9;
        var top = H / 2;
        placeret.forEach(function (o) { if (o.tilstand !== GAS) top = Math.min(top, o.y - o.f.R); });
        var yMaks = Math.max(-H / 2 + m.f.R + 0.1, top - m.f.R - 0.3);
        for (var forsoeg = 0; forsoeg < 40; forsoeg++) {
            var x = NK.r(-W / 2 + m.f.R, W / 2 - m.f.R);
            var y = NK.r(-H / 2 + m.f.R, yMaks);
            var afst = 1e9;
            for (var i = 0; i < placeret.length; i++) {
                var o = placeret[i];
                var d = Math.sqrt((o.x - x) * (o.x - x) + (o.y - y) * (o.y - y)) - o.f.R - m.f.R;
                if (d < afst) afst = d;
            }
            if (afst > bedstAfst) { bedstAfst = afst; bedst = [x, y]; }
            if (afst > 0.6) break;
        }
        m.x = bedst[0];
        m.y = bedst[1];
        m.a = NK.r(0, Math.PI * 2);
        var v = this.gasFart(m) * 0.8, r = NK.r(0, Math.PI * 2);
        m.vx = Math.cos(r) * v;
        m.vy = Math.sin(r) * v;
    };

    /* ----- Temperaturen i modellen ------------------------------------------- */
    P.kT = function (m) {
        var st = m.g.st, T = this.T;
        if (m.tilstand === GAS) return KT_GAS * (T + 273.15) / 293.15;
        if (m.tilstand === VAESKE) return 6 + 10 * NK.klamp((T - st.smp) / (st.kp - st.smp), 0, 1);
        return 0.5;
    };

    P.gasFart = function (m) {
        var kT = KT_GAS * (this.T + 273.15) / 293.15;
        return Math.sqrt(2 * kT / m.f.m);
    };

    /* ----- Tilstandene ----------------------------------------------------------- */
    P.taelling = function (g) {
        var t = [0, 0, 0];
        for (var i = 0; i < this.mol.length; i++) if (this.mol[i].g === g) t[this.mol[i].tilstand]++;
        return t;
    };

    /* Molekylet af stoffet i tilstanden, der ligger oeverst (oeverst) eller
       nederst. undtagen: et molekyle, der ikke maa vaelges. */
    P.find = function (g, tilstand, oeverst, undtagen) {
        var bedst = null;
        for (var i = 0; i < this.mol.length; i++) {
            var m = this.mol[i];
            if (m.g !== g || m.tilstand !== tilstand || m === undtagen) continue;
            if (!bedst || (oeverst ? m.y < bedst.y : m.y > bedst.y)) bedst = m;
        }
        return bedst;
    };

    /* Et vaeskemolekyle fryser fast: blandt de ledige pladser i de to
       nederste raekker, der ikke er fyldt, og vaeskens molekyler vaelges
       det par, der ligger naermest hinanden. Saa vokser krystallen nedefra,
       og intet molekyle skal mase sig gennem det faste stof. */
    P.frys = function (g) {
        var fri = this.pladser.filter(function (p) { return p.fri && p.g === g; });
        if (!fri.length) return false;
        var bund = fri[0].y;
        fri.forEach(function (p) { bund = Math.max(bund, p.y); });
        fri = fri.filter(function (p) { return p.y >= bund - 2.6; });
        var bedst = null, bd = 1e9;
        for (var i = 0; i < this.mol.length; i++) {
            var m = this.mol[i];
            if (m.g !== g || m.tilstand !== VAESKE) continue;
            for (var j = 0; j < fri.length; j++) {
                var p = fri[j], d = (m.x - p.x) * (m.x - p.x) + (m.y - p.y) * (m.y - p.y);
                if (d < bd) { bd = d; bedst = [m, p]; }
            }
        }
        if (!bedst) return false;
        return this.skift(bedst[0], FAST, "fryse", bedst[1]);
    };

    P.skift = function (m, til, slags, plads) {
        var fra = m.tilstand;
        if (fra === FAST && m.plads) { m.plads.fri = true; m.plads = null; }
        m.tilstand = til;
        m.ring = slags === "damp" ? 0.5 : 1;
        if (til === FAST) {
            var p = plads || this.friPlads(m.g);
            if (!p) { m.tilstand = fra; return false; }
            p.fri = false;
            m.plads = p;
        }
        if (til === GAS) {
            /* Den river sig loes opad */
            var v = this.gasFart(m);
            m.vy = -v * NK.r(0.9, 1.3);
            m.vx = v * NK.r(-0.6, 0.6);
        }
        if (slags) this.haendelser.push({ slags: slags, st: m.g.st, g: m.g });
        return true;
    };

    /* Overgangene i ét tidsskridt, for hvert stof for sig */
    P.overgange = function (dt) {
        var T = this.T, mig = this;
        this.grupper.forEach(function (g) {
            var st = g.st, t = mig.taelling(g), m;
            /* Smelte og fryse */
            if (T >= st.smp && t[FAST] > 0) {
                g.akkS += fart(T - st.smp) * g.n * dt;
                while (g.akkS >= 1 && t[FAST] > 0) {
                    m = mig.find(g, FAST, true);
                    mig.skift(m, VAESKE, "smelte");
                    t[FAST]--; t[VAESKE]++;
                    g.akkS -= 1;
                }
            } else if (T < st.smp && t[VAESKE] > 0) {
                g.akkS += fart(st.smp - T) * g.n * dt;
                while (g.akkS >= 1 && t[VAESKE] > 0) {
                    if (!mig.frys(g)) { g.akkS = 0; break; }
                    t[VAESKE]--; t[FAST]++;
                    g.akkS -= 1;
                }
            } else {
                g.akkS = 0;
            }

            /* Koge og fortaette */
            if (T >= st.kp) {
                if (t[VAESKE] > 0) {
                    g.akk += fart(T - st.kp) * g.n * dt;
                    while (g.akk >= 1 && t[VAESKE] > 0) {
                        mig.skift(mig.find(g, VAESKE, true), GAS, "koge");
                        t[VAESKE]--; t[GAS]++;
                        g.akk -= 1;
                    }
                } else {
                    g.akk = 0;
                }
                g.dampUr = 0;
                return;
            }
            var maal = mig.dampMaal(g, T), maks = mig.dampMaks(g);
            if (t[GAS] > maal) {
                /* Er der mere gas, end dampen kan vaere, fortaetter den som gas.
                   Ellers er det bare dampen, der retter sig ind. */
                var gasfase = t[GAS] > maks;
                g.akk += (gasfase ? fart(st.kp - T) * g.n : 1.5) * dt;
                while (g.akk >= 1 && t[GAS] > maal) {
                    mig.skift(mig.find(g, GAS, false), VAESKE, gasfase && t[GAS] > maks ? "fortaette" : "damp");
                    t[GAS]--; t[VAESKE]++;
                    g.akk -= 1;
                }
            } else if (t[GAS] < maal && t[VAESKE] > 0) {
                g.akk += 1.5 * dt;
                while (g.akk >= 1 && t[GAS] < maal && t[VAESKE] > 0) {
                    mig.skift(mig.find(g, VAESKE, true), GAS, "damp");
                    t[GAS]++; t[VAESKE]--;
                    g.akk -= 1;
                }
            } else {
                g.akk = 0;
                /* Ligevaegt: af og til bytter en damp og en vaeske plads */
                g.dampUr += dt;
                if (maal > 0 && t[VAESKE] > 0 && g.dampUr > 2.5) {
                    g.dampUr = 0;
                    var op = mig.find(g, VAESKE, true);
                    mig.skift(op, GAS, "damp");
                    mig.skift(mig.find(g, GAS, false, op), VAESKE, "damp");
                }
            }
        });
    };

    /* Lad molekylerne finde til ro ved starttemperaturen, foer proeven vises.
       Kun bevaegelsen koerer; ingen skifter tilstand. */
    P.forvarm = function (sek) {
        var T = this.T;
        this.T = this.startT;
        var n = Math.round(sek / DELSTEG);
        for (var i = 0; i < n; i++) this.delsteg(DELSTEG);
        this.T = T;
    };

    /* ----- Et tidsskridt ------------------------------------------------------ */
    /* To faste molekyler, der skal forbi hinanden for at naa deres
       pladser, bytter pladser i stedet */
    P.ordnGitter = function () {
        var faste = this.mol.filter(function (m) { return m.tilstand === FAST && m.plads; });
        function d(m, p) { return Math.sqrt((m.x - p.x) * (m.x - p.x) + (m.y - p.y) * (m.y - p.y)); }
        var langt = faste.some(function (m) { return d(m, m.plads) > 1.2; });
        if (!langt) return;
        for (var i = 0; i < faste.length; i++) {
            for (var j = i + 1; j < faste.length; j++) {
                var a = faste[i], b = faste[j];
                if (a.g !== b.g) continue;
                if (d(a, b.plads) + d(b, a.plads) < d(a, a.plads) + d(b, b.plads) - 0.4) {
                    var p = a.plads;
                    a.plads = b.plads;
                    b.plads = p;
                }
            }
        }
    };

    P.opdater = function (dt) {
        if (this.pause) return;
        this.tid += dt;
        this.overgange(dt);
        this.ordnGitter();
        var n = NK.klamp(Math.ceil(dt / DELSTEG - 1e-9), 1, 12);
        for (var i = 0; i < n; i++) this.delsteg(dt / n);
        this.opdaterFarver(dt);
        this.opdaterProdukter(dt);
    };

    /* Farven skifter med det samme (orange og blaa blandet giver graa, som
       ligner fast stof); en hvid ring viser et kort oejeblik, at molekylet
       lige har skiftet tilstand */
    P.opdaterFarver = function (dt) {
        for (var i = 0; i < this.mol.length; i++) {
            var m = this.mol[i];
            m.farve = m.tilstand;
            if (m.ring > 0) m.ring = Math.max(0, m.ring - dt * 1.4);
        }
    };

    P.delsteg = function (h) {
        var mol = this.mol, n = mol.length, i, j, p, q, a, b;
        var W2 = this.W / 2, H2 = this.H / 2;

        /* Kuglernes plads */
        for (i = 0; i < n; i++) {
            a = mol[i];
            var c = Math.cos(a.a), s = Math.sin(a.a), f = a.f;
            for (p = 0; p < f.n; p++) {
                a.kx[p] = a.x + c * f.px[p] - s * f.py[p];
                a.ky[p] = a.y + s * f.px[p] + c * f.py[p];
            }
            a.fx = 0; a.fy = 0; a.t = 0;
            /* Et molekyle paa vej ind paa sin plads i krystallen glider
               gennem de andre; det sidste stykke er almindelig fysik */
            a.spoegelse = false;
            if (a.tilstand === FAST && a.plads) {
                var sv = a.a - a.plads.a;
                sv = Math.atan2(Math.sin(sv), Math.cos(sv));
                a.spoegelse = Math.abs(sv) > 0.35 ||
                    (a.x - a.plads.x) * (a.x - a.plads.x) + (a.y - a.plads.y) * (a.y - a.plads.y) > 0.8;
            }
        }

        /* Kugle mod kugle */
        var TIL2 = TIL_R * TIL_R;
        for (i = 0; i < n; i++) {
            a = mol[i];
            if (a.spoegelse) continue;
            for (j = i + 1; j < n; j++) {
                b = mol[j];
                if (b.spoegelse) continue;
                var dx = b.x - a.x, dy = b.y - a.y, rr = a.f.R + b.f.R + 0.8;
                if (dx * dx + dy * dy > rr * rr) continue;
                var tiltr = a.tilstand !== GAS && b.tilstand !== GAS;
                for (p = 0; p < a.f.n; p++) {
                    for (q = 0; q < b.f.n; q++) {
                        var ex = b.kx[q] - a.kx[p], ey = b.ky[q] - a.ky[p];
                        var d2 = ex * ex + ey * ey;
                        if (d2 >= TIL2) continue;
                        var d = Math.sqrt(d2) || 1e-6, fm;
                        if (d < 2) fm = K_FRA * (2 - d);
                        else if (tiltr) fm = -E_TIL * Math.min(1, (TIL_R - d) / 0.3);
                        else continue;
                        var Fx = fm * ex / d, Fy = fm * ey / d;
                        b.fx += Fx; b.fy += Fy;
                        a.fx -= Fx; a.fy -= Fy;
                        b.t += (b.kx[q] - b.x) * Fy - (b.ky[q] - b.y) * Fx;
                        a.t -= (a.kx[p] - a.x) * Fy - (a.ky[p] - a.y) * Fx;
                    }
                }
            }
        }

        /* Vaeggene, tyngden, gitteret og temperaturen */
        for (i = 0; i < n; i++) {
            a = mol[i];
            var fo = a.f;
            /* Et molekyle paa vej ind paa sin plads maerker heller ikke
               vaeggene; ellers kan det ikke vende sig nede ved bunden */
            for (p = 0; p < (a.spoegelse ? 0 : fo.n); p++) {
                var kx = a.kx[p], ky = a.ky[p], wx = 0, wy = 0;
                if (kx < -W2 + 1) wx = K_VAEG * (-W2 + 1 - kx);
                else if (kx > W2 - 1) wx = -K_VAEG * (kx - W2 + 1);
                if (ky < -H2 + 1) wy = K_VAEG * (-H2 + 1 - ky);
                else if (ky > H2 - 1) wy = -K_VAEG * (ky - H2 + 1);
                if (wx || wy) {
                    a.fx += wx;
                    a.fy += wy;
                    a.t += (kx - a.x) * wy - (ky - a.y) * wx;
                }
            }
            var M = fo.m, I = fo.I, gam;
            if (a.tilstand !== GAS) a.fy += TYNGDE * M;
            if (a.tilstand === FAST && a.plads) {
                /* Fjederen er staerk taet paa pladsen, men traekker hoejst
                   med F_PLADS, saa et molekyle langt fra sin plads glider
                   derhen uden at mase sig gennem de andre */
                var sx = -K_PLADS * (a.x - a.plads.x), sy = -K_PLADS * (a.y - a.plads.y);
                var sl = Math.sqrt(sx * sx + sy * sy);
                if (sl > F_PLADS) { sx *= F_PLADS / sl; sy *= F_PLADS / sl; }
                a.fx += M * (sx - C_PLADS * a.vx);
                a.fy += M * (sy - C_PLADS * a.vy);
                var dv = a.a - a.plads.a;
                dv = Math.atan2(Math.sin(dv), Math.cos(dv));
                /* Naesten helt omvendt: drej altid samme vej, saa det ikke
                   vipper frem og tilbage om den halve omgang */
                if (Math.abs(dv) > 2.6) dv = 2.6;
                a.t += I * (-K_DREJ * NK.klamp(dv, -0.6, 0.6) - C_DREJ * a.w);
            }
            gam = a.tilstand === GAS ? 0.4 : (a.tilstand === VAESKE ? 3 : 6);
            var kT = this.kT(a);
            a.vx += a.fx / M * h;
            a.vy += a.fy / M * h;
            a.w += a.t / I * h;
            var daemp = 1 - gam * h;
            var sT = Math.sqrt(2 * gam * kT * h / M), sR = Math.sqrt(2 * gam * kT * h / I);
            a.vx = a.vx * daemp + sT * gauss();
            a.vy = a.vy * daemp + sT * gauss();
            a.w = a.w * daemp + sR * gauss();
            var v2 = a.vx * a.vx + a.vy * a.vy;
            if (v2 > FART_MAKS * FART_MAKS) {
                var k2 = FART_MAKS / Math.sqrt(v2);
                a.vx *= k2;
                a.vy *= k2;
            }
            a.w = NK.klamp(a.w, -8, 8);
            a.x += a.vx * h;
            a.y += a.vy * h;
            a.a += a.w * h;
            /* Sikkerhedsnet: ingen slipper ud af kassen */
            a.x = NK.klamp(a.x, -W2 + 0.5, W2 - 0.5);
            a.y = NK.klamp(a.y, -H2 + 0.5, H2 - 0.5);
        }
    };

    /* ----- Til tegningen og panelet ---------------------------------------------- */

    /* Kugleparrene mellem to molekyler i vaeske eller fast stof, der roerer
       hinanden: [x1, y1, x2, y2] i kassens enheder */
    P.kontakter = function () {
        var ud = [], mol = this.mol, n = mol.length, K2 = KONTAKT * KONTAKT;
        for (var i = 0; i < n; i++) {
            var a = mol[i];
            if (a.tilstand === GAS) continue;
            for (var j = i + 1; j < n; j++) {
                var b = mol[j];
                if (b.tilstand === GAS) continue;
                var dx = b.x - a.x, dy = b.y - a.y, rr = a.f.R + b.f.R + 0.5;
                if (dx * dx + dy * dy > rr * rr) continue;
                for (var p = 0; p < a.f.n; p++) {
                    for (var q = 0; q < b.f.n; q++) {
                        var ex = b.kx[q] - a.kx[p], ey = b.ky[q] - a.ky[p];
                        if (ex * ex + ey * ey < K2) ud.push([a.kx[p], a.ky[p], b.kx[q], b.ky[q]]);
                    }
                }
            }
        }
        return ud;
    };

    /* Det, glasset viser: hvor meget der er fast og flydende (efter
       rumfang, altsaa antal C-kugler), om det koger, og hvor fuld ballonen
       er. Ballonen: gassen ud over dampen, gange T/293 K. */
    P.makro = function () {
        var alle = 0, fast = 0, vaeske = 0, ekstra = 0, plads = 0, koger = 0, mig = this;
        this.grupper.forEach(function (g) {
            var t = mig.taelling(g), maks = mig.dampMaks(g);
            alle += g.n * g.f.n;
            fast += t[FAST] * g.f.n;
            vaeske += t[VAESKE] * g.f.n;
            ekstra += Math.max(0, t[GAS] - maks);
            plads += Math.max(1, g.n - maks);
            if (mig.T >= g.st.kp && t[VAESKE] > 0) koger = Math.max(koger, fart(mig.T - g.st.kp));
        });
        if (this.braendt) ekstra = 0;
        return {
            fast: alle ? fast / alle : 0,
            vaeske: alle ? vaeske / alle : 0,
            koger: koger,
            ballon: ekstra / plads * (this.T + 273.15) / 293.15
        };
    };

    /* Er der gas i ballonen? (taendstikken) */
    P.gasIBallonen = function () {
        return !this.braendt && this.makro().ballon > 0.08;
    };

    /* ----- Taendstikken: gassen braender -----------------------------------------
       Hvert gasmolekyle bliver til CO2 og H2O efter
       CnH2n+2 + O2 -> n CO2 + (n + 1) H2O, og produkterne flyver ud af
       kassen. Vaesken, der er tilbage, bliver. */
    P.braend = function () {
        var mig = this, ud = [];
        this.mol.forEach(function (m) {
            if (m.tilstand !== GAS) { ud.push(m); return; }
            var nC = m.g.st.nC, i;
            for (i = 0; i < nC + nC + 1; i++) {
                var v = NK.r(0, Math.PI * 2), fart = NK.r(8, 18);
                mig.produkter.push({
                    slags: i < nC ? "co2" : "h2o",
                    x: m.x + NK.r(-1, 1), y: m.y + NK.r(-1, 1),
                    vx: Math.cos(v) * fart, vy: Math.sin(v) * fart - 10,
                    a: NK.r(0, 6.28), w: NK.r(-4, 4), liv: 1
                });
            }
            m.g.n--;
        });
        this.mol = ud;
        this.braendt = true;
    };

    P.opdaterProdukter = function (dt) {
        this.produkter = this.produkter.filter(function (p) {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.a += p.w * dt;
            p.liv -= dt * 0.7;
            return p.liv > 0;
        });
    };

    /* Haendelserne siden sidst (koge, fortaette, smelte, fryse, damp) */
    P.hentHaendelser = function () {
        var h = this.haendelser;
        this.haendelser = [];
        return h;
    };

    Proeve.FAST = FAST;
    Proeve.VAESKE = VAESKE;
    Proeve.GAS = GAS;

    NK.Proeve = Proeve;
}());

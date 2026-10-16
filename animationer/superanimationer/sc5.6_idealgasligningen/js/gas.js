/* =====================================================================
   gas.js - modellen: idealgasligningen, stemplet og molekylerne

   Alt, eleven ser, er regnet her: p · V = n · R · T med R = 0,0831
   L·bar/(mol·K). Tegningen (js/tegning.js) og fanerne laeser kun
   tallene.

     G.volumen(n, T, p), G.tryk(n, T, V), G.stofmaengde(p, V, T),
     G.temperatur(p, V, n)
     G.fmt(sym, v)      tallet med enhed, som det skrives: "24,0 L"
     G.rund(sym, v)     tallet, som det staar skrevet (tre betydende
                        cifre, kelvin og °C i hele grader)
     new G.Stempel()    gassen paa fane 1: n, T, lodder, laast -> V og p
     G.lavOpgave(def, nyeTal)  en opgave til fane 2 med trin og facit
     new G.Partikler()  molekylerne, der farer rundt i cylinderen
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var S = D.STEMPEL;
    var G = {};

    /* ----- Idealgasligningen ------------------------------------------------ */
    G.volumen = function (n, T, p) { return n * D.R * T / p; };
    G.tryk = function (n, T, V) { return n * D.R * T / V; };
    G.stofmaengde = function (p, V, T) { return p * V / (D.R * T); };
    G.temperatur = function (p, V, n) { return p * V / (n * D.R); };

    /* ----- Tal, som de skrives ---------------------------------------------- */
    function tre(v) { return NK.betydende(v, 3); }

    G.talTekst = function (sym, v, beregnet) {
        if (sym === "T" || sym === "t" || sym === "VmL") return String(Math.round(v));
        if (sym === "M") return beregnet ? tre(v) : NK.tal2(v);
        if (sym === "p" && Math.abs(v - D.P_LUFT) < 1e-9) return "1,013";
        if (sym === "p" && Math.abs(v - 2.013) < 1e-9) return "2,013";
        if (sym === "p" && Math.abs(v - 3.013) < 1e-9) return "3,013";
        if (sym === "p" && Math.abs(v - 4.013) < 1e-9) return "4,013";
        return tre(v);
    };

    var ENHED = { n: "mol", T: "K", t: "°C", p: "bar", V: "L", VmL: "mL", m: "g", M: "g/mol" };
    G.ENHED = ENHED;

    G.fmt = function (sym, v, beregnet) {
        return G.talTekst(sym, v, beregnet) + " " + ENHED[sym];
    };

    /* Det tal, der staar skrevet, og som naeste trin regner videre med */
    G.rund = function (sym, v, beregnet) {
        if (sym === "T" || sym === "t") return Math.round(v);
        if (sym === "M" && !beregnet) return Math.round(v * 100) / 100;
        return Number(tre(v).replace(",", "."));
    };

    /* ======================================================================
       FANE 1: STEMPLET
       Stemplet er vaegtloest. Udefra trykker luften (1,013 bar) og
       lodderne (1 bar hver). Frit stempel: volumen indstiller sig, saa
       trykket inde er det samme som udefra, men hoejst til stoppet ved
       V_MAKS; saa stiger trykket i stedet. Laast stempel: volumen er fast,
       og trykket foelger af n og T.
       ====================================================================== */
    function Stempel() {
        this.n = 1;
        this.T = 293;
        this.lodder = 0;
        this.laast = false;
        this.V = G.volumen(1, 293, D.P_LUFT);
        this.p = D.P_LUFT;
        this.stop = false;
        this.ligevaegt();
    }

    var PS = Stempel.prototype;

    PS.pYdre = function () { return D.P_LUFT + this.lodder * S.LOD; };

    PS.ligevaegt = function () {
        if (!this.laast) {
            var V = G.volumen(this.n, this.T, this.pYdre());
            this.stop = V > S.V_MAKS;
            this.V = Math.min(V, S.V_MAKS);
        } else {
            this.stop = false;
        }
        this.p = G.tryk(this.n, this.T, this.V);
    };

    /* Hele tilstanden paa én gang (opgavens start). Med V og laast
       laases stemplet ved det volumen. */
    PS.saet = function (o) {
        this.n = NK.klamp(o.n, S.N_MIN, S.N_MAKS);
        this.T = NK.klamp(o.T, S.T_MIN, S.T_MAKS);
        this.lodder = NK.klamp(o.lodder || 0, 0, S.LOD_MAKS);
        this.laast = false;
        this.ligevaegt();
        if (o.laast) {
            if (o.V) this.V = o.V;
            this.laast = true;
            this.ligevaegt();
        }
    };

    /* Setterne giver false, naar graensen er naaet og intet skete */
    PS.saetT = function (T) {
        T = NK.klamp(Math.round(T), S.T_MIN, S.T_MAKS);
        if (T === this.T) return false;
        this.T = T;
        this.ligevaegt();
        return true;
    };

    PS.saetLodder = function (k) {
        k = NK.klamp(k, 0, S.LOD_MAKS);
        if (k === this.lodder) return false;
        this.lodder = k;
        this.ligevaegt();
        return true;
    };

    PS.saetN = function (n) {
        n = NK.klamp(Math.round(n / S.N_TRIN) * S.N_TRIN, S.N_MIN, S.N_MAKS);
        if (Math.abs(n - this.n) < 1e-9) return false;
        this.n = n;
        this.ligevaegt();
        return true;
    };

    PS.saetLaast = function (b) {
        b = !!b;
        if (b === this.laast) return false;
        this.laast = b;
        this.ligevaegt();
        return true;
    };

    PS.kopi = function () {
        return { n: this.n, T: this.T, lodder: this.lodder, laast: this.laast, V: this.V, p: this.p, stop: this.stop };
    };

    G.Stempel = Stempel;

    /* ======================================================================
       FANE 2: OPGAVERNE
       lavOpgave laver tallene (de faste foerste gang, ellers nye fra
       listerne), trinene og facit for hvert trin. Hvert facit regnes af
       de tal, der staar skrevet i trinnene foer, saa den paene beregning
       paa tavlen gaar op.
       ====================================================================== */
    function traek(liste, sidst) {
        var andre = liste.filter(function (x) { return x !== sidst; });
        return NK.tilfaeldig(andre.length ? andre : liste);
    }

    /* De kendte tal i opgaven. forrige: tallene sidst, saa de nye er andre */
    function kendteTal(def, nyeTal, forrige) {
        var v = {}, k;
        if (!nyeTal) {
            for (k in def.std) v[k] = def.std[k];
        } else {
            for (k in def.std) v[k] = def.std[k];
            for (k in def.tal) v[k] = traek(def.tal[k], forrige ? forrige[k] : undefined);
            if (def.gasser) v.gas = traek(def.gasser, forrige ? forrige.gas : undefined);
        }
        /* Cykeldaekket: temperaturen er det, der spoerges om. De nye tal
           giver den temperatur, stofmaengden regnes af. */
        if (def.find === "t" && v.t !== undefined) {
            v.n = G.rund("n", G.stofmaengde(v.p, v.V, v.t + D.KELVIN));
            delete v.t;
        }
        /* Den ukendte gas: massen regnes af gassen, der er traekket */
        if (def.find === "M") {
            var gas = D.GASSER[v.gas];
            v.m = G.rund("m", G.stofmaengde(v.p, v.VmL / 1000, v.t + D.KELVIN) * gas.M);
        }
        return v;
    }

    /* Trinene: [{ id, rel, x }], x er det, trinnet finder */
    function trinene(def, v) {
        var t = [];
        if (v.t !== undefined) t.push({ id: "T", rel: null, x: "T" });
        var gx = def.find;
        if (gx === "t") gx = "T";
        if (gx === "m" || gx === "M") gx = "n";
        if (v.m !== undefined && v.M !== undefined) t.push({ id: "n", rel: "nmM", x: "n" });
        t.push({ id: "gas", rel: "gas", x: gx });
        if (def.find === "m") t.push({ id: "m", rel: "nmM", x: "m" });
        if (def.find === "M") t.push({ id: "M", rel: "nmM", x: "M" });
        if (def.find === "t") t.push({ id: "t", rel: null, x: "t" });
        return t;
    }

    /* Regner et trin ud fra de kendte tal (k) */
    G.regnTrin = function (trin, k) {
        switch (trin.x === "T" && trin.id === "T" ? "konv" : trin.id === "t" ? "tilbage" : trin.rel + ":" + trin.x) {
            case "konv": return k.t + D.KELVIN;
            case "tilbage": return k.T - D.KELVIN;
            case "nmM:n": return k.m / k.M;
            case "nmM:m": return k.n * k.M;
            case "nmM:M": return k.m / k.n;
            case "gas:V": return G.volumen(k.n, k.T, k.p);
            case "gas:n": return G.stofmaengde(k.p, k.V, k.T);
            case "gas:p": return G.tryk(k.n, k.T, k.V);
            case "gas:T": return G.temperatur(k.p, k.V, k.n);
        }
        return NaN;
    };

    G.lavOpgave = function (def, nyeTal, forrige) {
        var v, tal, forsoeg = 0;
        /* Nye tal skal give en rimelig gas: 150 K til 700 K og et volumen,
           cylinderen kan vise */
        do {
            v = kendteTal(def, nyeTal && forsoeg < 60, forrige);
            forsoeg++;
            tal = regnAlt(def, v);
        } while (nyeTal && forsoeg < 60 && !rimelig(tal.k));
        return {
            def: def, find: def.find, givet: v, trin: tal.trin, k: tal.k, svar: tal.k[def.find]
        };
    };

    function regnAlt(def, v) {
        var k = {}, x;
        for (x in v) k[x] = v[x];
        if (v.VmL !== undefined) k.V = v.VmL / 1000;
        var liste = trinene(def, v);
        liste.forEach(function (t) {
            var raa = G.regnTrin(t, k);
            t.facit = G.rund(t.x, raa, t.id === "M");
            t.raa = raa;
            k[t.x] = t.facit;
        });
        return { trin: liste, k: k };
    }

    function rimelig(k) {
        return k.T >= 150 && k.T <= 700 && k.V > 0.05 && k.V < 400 && k.p > 0.1 && k.p < 400;
    }

    /* ======================================================================
       MOLEKYLERNE
       Hvert molekyle har en plads i cylinderens indre (x fra venstre
       vaeg, y op fra bunden, i pixels) og en fart. Farten er
       proportional med kvadratroden af T (samme fordeling hele tiden,
       hvert molekyle har sin egen faktor). Molekylerne stoeder ikke ind i
       hinanden (en idealgas), kun i vaeggene og stemplet, og hvert stoed
       giver et lille glimt.
       ====================================================================== */
    function Partikler() {
        this.liste = [];
        this.glimt = [];
        this.B = 100;
        this.H = 100;
        this.fart = 1;
        this.r = 3.4;
        this.stoedStempel = 0;     /* stoed paa stemplet det sidste sekund */
        this._stoedTael = 0;
        this._stoedTid = 0;
    }

    var PP = Partikler.prototype;

    PP.grundfart = function () { return NK.klamp(this.B * 0.85, 70, 190); };

    PP.nyt = function (x, y, retning) {
        var v = retning === undefined ? Math.random() * Math.PI * 2 : retning + NK.r(-0.5, 0.5);
        var f = NK.r(0.55, 1.45);
        return { x: x, y: y, vx: Math.cos(v), vy: Math.sin(v), f: f, ud: false, a: 1, ind: 0 };
    };

    /* Laeg n molekyler tilfaeldigt i hele rummet (ved start og opgaveskift) */
    PP.fyld = function (antal, B, H) {
        this.B = B; this.H = H;
        this.liste = [];
        this.glimt = [];
        for (var i = 0; i < antal; i++) {
            this.liste.push(this.nyt(NK.r(this.r, B - this.r), NK.r(this.r, Math.max(this.r, H - this.r))));
        }
    };

    /* Flere eller faerre molekyler. Nye kommer ind ved indgangen og
       farer op; de, der skal ud, soeger mod indgangen og falmer. */
    PP.antal = function (maal, ind) {
        var levende = this.liste.filter(function (p) { return !p.ud; });
        var i;
        if (levende.length < maal) {
            for (i = levende.length; i < maal; i++) {
                var p = this.nyt(ind ? ind.x + NK.r(-4, 4) : NK.r(this.r, this.B - this.r),
                    ind ? ind.y + NK.r(0, 6) : NK.r(this.r, this.H - this.r), ind ? -Math.PI / 2 - 0.5 : undefined);
                p.ind = ind ? 1 : 0;
                this.liste.push(p);
            }
        } else if (levende.length > maal) {
            /* Dem naermest indgangen gaar foerst */
            var ix = ind ? ind.x : this.B, iy = ind ? ind.y : 0;
            levende.sort(function (a, b) {
                return (Math.hypot(a.x - ix, a.y - iy)) - (Math.hypot(b.x - ix, b.y - iy));
            });
            for (i = 0; i < levende.length - maal; i++) levende[i].ud = true;
        }
    };

    PP.levende = function () {
        var n = 0;
        this.liste.forEach(function (p) { if (!p.ud) n++; });
        return n;
    };

    /* Nye maal for rummet: pladserne skaleres med */
    PP.skaler = function (kx, ky) {
        this.liste.forEach(function (p) { p.x *= kx; p.y *= ky; });
        this.glimt.forEach(function (g) { g.x *= kx; g.y *= ky; });
    };

    /* dt i sekunder. B: indre bredde, H: hoejden op til stemplet (px).
       fartMaal: kvadratroden af T/293. ud: stedet, molekyler forlader rummet. */
    PP.opdater = function (dt, B, H, fartMaal, ud) {
        this.B = B;
        this.H = H;
        this.fart = NK.mod(this.fart, fartMaal, 3, dt);
        var r = this.r, v0 = this.grundfart() * this.fart;
        var mig = this, stoed = 0;
        var ux = ud ? ud.x : B - 8, uy = ud ? ud.y : r;
        var trin = Math.max(1, Math.ceil(dt / 0.02));
        var h = dt / trin;
        for (var s = 0; s < trin; s++) {
            this.liste.forEach(function (p) {
                if (p.ud) {
                    var dx = ux - p.x, dy = uy - p.y, d = Math.hypot(dx, dy) || 1;
                    p.x += dx / d * v0 * 1.6 * h;
                    p.y += dy / d * v0 * 1.6 * h;
                    p.a -= h * 2.2;
                    if (d < 8) p.a = 0;
                    return;
                }
                if (p.ind > 0) p.ind = Math.max(0, p.ind - h * 1.5);
                var fart = v0 * p.f;
                p.x += p.vx * fart * h;
                p.y += p.vy * fart * h;
                var ramt = false;
                if (p.x < r) { p.x = r; p.vx = Math.abs(p.vx); ramt = true; }
                else if (p.x > B - r) { p.x = B - r; p.vx = -Math.abs(p.vx); ramt = true; }
                if (H < 2 * r + 1) {
                    p.y = H / 2;
                } else {
                    if (p.y < r) { p.y = r; p.vy = Math.abs(p.vy); ramt = true; }
                    else if (p.y > H - r) { p.y = H - r; p.vy = -Math.abs(p.vy); ramt = true; stoed++; }
                }
                if (ramt && mig.glimt.length < 70 && Math.random() < 0.8) {
                    mig.glimt.push({ x: p.x, y: p.y, a: 1, s: fart / Math.max(1, v0) });
                }
            });
        }
        this.liste = this.liste.filter(function (p) { return p.a > 0; });
        this.glimt.forEach(function (g) { g.a -= dt * 3.2; });
        this.glimt = this.glimt.filter(function (g) { return g.a > 0; });
        /* Stoed paa stemplet pr. sekund, glattet */
        this._stoedTael += stoed;
        this._stoedTid += dt;
        if (this._stoedTid >= 0.5) {
            this.stoedStempel = this._stoedTael / this._stoedTid;
            this._stoedTael = 0;
            this._stoedTid = 0;
        }
    };

    G.Partikler = Partikler;

    NK.Gas = G;
}());

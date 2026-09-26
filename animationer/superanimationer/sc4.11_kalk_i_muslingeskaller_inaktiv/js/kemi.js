/* =====================================================================
   kemi.js - modellen og tallene

   Kolben paa vaegten: CaCO₃(s) + 2 HCl(aq) → CaCl₂(aq) + CO₂(g) + H₂O(l).
   Vaegten er nulstillet med kolben og syren, saa den viser det pulver,
   der er kommet i, minus det CO₂ (og de draaber), der har forladt
   kolben. Facit til regneopgaverne paa fane 2 og tal skrevet, som de
   skal staa i en paen beregning. Tegningen og panelet henter alt
   herfra; intet tal regnes andre steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    K.M_KALK = D.M.CaCO3 / 100;          /* 100,09 g/mol */
    K.M_CO2 = D.M.CO2 / 100;             /* 44,01 g/mol */
    K.CO2_PR_KALK = K.M_CO2 / K.M_KALK;  /* g CO₂ pr. g CaCO₃ */

    /* ----- Tal til tekst ------------------------------------------------------ */
    K.g2 = function (v) { return NK.tal2(v); };                       /* aflaest: 1,02 */
    K.g = function (v) { return NK.betydende(v, 3); };                /* regnet: 0,976 */
    K.mol = function (v) { return NK.betydende(v, 3); };              /* 0,00977 */
    K.pct = function (v) { return NK.betydende(v, 3); };              /* 95,7 */
    K.pct1 = function (v) {                                           /* 95,3 og 104,4 */
        var n = Math.round(v * 10);
        return Math.floor(n / 10) + "," + Math.abs(n % 10);
    };
    K.Mtekst = function (id) { return NK.komma(D.M[id]); };           /* 100,09 */

    /* Det, eleven ser og regner videre med: tre betydende cifre */
    K.r3 = function (v) { return parseFloat(NK.betydende(v, 3).replace(",", ".")); };
    K.r2 = function (v) { return Math.round(v * 100 + 1e-9) / 100; };

    /* ----- Kolben ----------------------------------------------------------------
       o: { syreV (mL), grov }. Pulveret regnes i gram: ind er alt, der er
       kommet i kolben (skal og evt. vand), kalk den CaCO₃, der ikke har
       reageret endnu. Reaktionen er af foerste orden i kalken, og syren
       slipper aldrig op med de maengder, fanerne bruger. Der regnes i
       faste skridt paa 1/120 s, saa resultatet ikke afhaenger af
       billedraten. */
    function Kolbe(o) {
        o = o || {};
        this.syreV = o.syreV || D.SYRE.V;
        this.hcl = this.syreV / 1000 * D.SYRE.c;
        this.hcl0 = this.hcl;
        this.k = o.grov ? D.K_GROV : D.K_PULVER;
        this.kMin = o.grov ? D.K_MIN.grov : D.K_MIN.pulver;
        this.ind = 0;
        this.kalk = 0;
        this.kalkInd = 0;
        this.co2 = 0;
        this.sprojt = 0;
        this.rate = 0;
        this.rest = 0;
        this.tid = 0;
    }
    var SKRIDT = 1 / 120;

    /* m gram pulver, hvoraf vand gram er vand */
    Kolbe.prototype.tilsaet = function (m, vand) {
        var v = vand || 0;
        this.ind += m;
        this.kalk += (m - v) * D.SKAL.andel;
        this.kalkInd += (m - v) * D.SKAL.andel;
    };

    Kolbe.prototype.skridt = function (h) {
        var nKalk = this.kalk / K.M_KALK;
        var dn = Math.min((this.k * this.kalk + (this.kalk > 0 ? this.kMin : 0)) * h / K.M_KALK, nKalk, this.hcl / 2);
        this.kalk -= dn * K.M_KALK;
        if (this.kalk < 1e-12) this.kalk = 0;
        this.hcl -= 2 * dn;
        var dco2 = dn * K.M_CO2;
        this.co2 += dco2;
        this.rate = dco2 / h;
        var over = this.rate - D.SPROEJT.graense;
        if (over > 0) this.sprojt += over * D.SPROEJT.andel * h;
        this.tid += h;
    };

    Kolbe.prototype.opdater = function (dt) {
        this.rest += dt;
        while (this.rest >= SKRIDT) {
            this.skridt(SKRIDT);
            this.rest -= SKRIDT;
        }
    };

    /* Det, vaegten maerker (g), og det, den viser (to decimaler) */
    Kolbe.prototype.masse = function () { return this.ind - this.co2 - this.sprojt; };
    Kolbe.prototype.visning = function () { return K.r2(Math.max(0, this.masse())); };

    /* Det CO₂ (g), der endnu kan dannes */
    Kolbe.prototype.mangler = function () {
        return Math.min(this.kalk / K.M_KALK, this.hcl / 2) * K.M_CO2;
    };
    /* Vaegten staar stille, naar al kalken har reageret (eller syren er
       brugt op): saa aendrer visningen sig ikke mere */
    Kolbe.prototype.stille = function () { return this.mangler() < 1e-7; };

    /* Den del af kalken, der har reageret */
    Kolbe.prototype.reageret = function () { return this.kalkInd > 0 ? 1 - this.kalk / this.kalkInd : 0; };

    K.Kolbe = Kolbe;

    /* Hvad vaegten ender paa for en proeve paa m gram, helt uden fejl */
    K.slutVisning = function (m) { return K.r2(m - m * D.SKAL.andel * K.CO2_PR_KALK); };

    /* ----- Fane 2: facit -----------------------------------------------------------
       o: { tal: { mf, me } eller { m, p }, niveau, baglaens }. Hvert trin
       regnes af det tal, eleven har staaende fra trinnet foer (tre
       betydende cifre), ligesom eleven selv goer. */
    K.facit = function (o) {
        var t = o.tal, f = {}, M1 = K.M_CO2, M2 = K.M_KALK;
        if (!o.baglaens) {
            f.dm = K.r2(t.mf - t.me);
            if (o.niveau === "mol") {
                f.n_co2 = f.dm / M1;
                f.n_kalk = K.r3(f.n_co2);
                f.mk_n = f.n_kalk * M2;
                f.mk = f.mk_n;
            } else {
                f.mk_f = f.dm * D.FAKTOR;
                f.mk = f.mk_f;
            }
            f.pct = K.r3(f.mk) / t.mf * 100;
        } else {
            f.mk_p = t.p / 100 * t.m;
            if (o.niveau === "mol") {
                f.nk_m = K.r3(f.mk_p) / M2;
                f.nc_k = K.r3(f.nk_m);
                f.mc_n = f.nc_k * M1;
                f.mc = f.mc_n;
            } else {
                f.mc_f = K.r3(f.mk_p) / D.FAKTOR;
                f.mc = f.mc_f;
            }
        }
        return f;
    };

    /* ----- Fane 3: to grupper ----------------------------------------------------------
       Et forloeb er én gruppes forsoeg: pulveret kommer i efter en plan,
       kolben reagerer, og gruppen aflaeser vaegten, naar den staar stille
       (eller tidligere, hvis stop er sat). B: afvigelsen fra D.FEJL. */
    function Forloeb(B) {
        B = B || {};
        this.B = B;
        this.kolbe = new Kolbe({ syreV: B.syreV, grov: B.grov });
        this.mFoer = 1.00;
        var vand = B.vand || 0;
        var spild = B.spild || 0;
        this.plan = [];
        if (B.paaEnGang) {
            this.plan.push({ t: 0, m: 1.00, vand: vand, bord: 0 });
        } else {
            for (var i = 0; i < 4; i++) {
                /* Det spildte ryger ved siden af i anden portion */
                var m = 0.25, bord = i === 1 ? spild : 0;
                this.plan.push({ t: i * 3, m: m - bord, vand: vand / 4, bord: bord });
            }
        }
        this.bord = 0;           /* g pulver paa bordet */
        this.t = 0;
        this.noteret = null;     /* m(efter), naar gruppen har aflaest */
        this.tidNoteret = null;
        this.faerdig = false;
        this.co2Mulig = (1.00 - vand - spild) * D.SKAL.andel * K.CO2_PR_KALK;
    }

    /* Giver de portioner, der kom i kolben i dette skridt */
    Forloeb.prototype.opdater = function (dt) {
        var nye = [];
        this.t += dt;
        for (var i = 0; i < this.plan.length; i++) {
            var p = this.plan[i];
            if (!p.sket && this.t >= p.t) {
                p.sket = true;
                if (p.m > 0) this.kolbe.tilsaet(p.m, p.vand);
                this.bord += p.bord;
                nye.push(p);
            }
        }
        this.kolbe.opdater(dt);
        var alleI = this.plan.every(function (q) { return q.sket; });
        if (this.noteret === null && alleI) {
            /* Gruppen, der har travlt, aflaeser, naar alt pulveret er i, og
               en del af CO₂ (stop) er forsvundet, mens det stadig bruser */
            if (this.B.stop && this.kolbe.co2 >= this.B.stop * this.co2Mulig) this.noter();
            else if (this.kolbe.stille()) this.noter();
        }
        if (this.noteret !== null && alleI && this.kolbe.stille()) this.faerdig = true;
        return nye;
    };

    Forloeb.prototype.noter = function () {
        this.noteret = this.kolbe.visning();
        this.tidNoteret = this.t;
    };

    /* Resultatet, som gruppen regner det ud med vejledningens faktor */
    Forloeb.prototype.resultat = function () {
        if (this.noteret === null) return null;
        var dm = K.r2(this.mFoer - this.noteret);
        var mk = dm * D.FAKTOR;
        return { mf: this.mFoer, me: this.noteret, dm: dm, mk: mk, pct: mk / this.mFoer * 100 };
    };

    /* Koer et helt forloeb paa én gang (til selvtesten og Vis svaret) */
    Forloeb.prototype.koerFaerdig = function () {
        var n = 0;
        while (!this.faerdig && n++ < 20000) this.opdater(0.05);
        return this.resultat();
    };

    K.Forloeb = Forloeb;

    NK.Kemi = K;
}());

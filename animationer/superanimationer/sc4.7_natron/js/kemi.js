/* =====================================================================
   kemi.js - modellen og tallene

   Diglen med natron: 2 NaHCO₃(s) → Na₂CO₃(s) + CO₂(g) + H₂O(g).
   Vaegten er nulstillet med den tomme digel, saa den viser det, der er
   i diglen: den natron, der ikke har reageret endnu, det Na₂CO₃, der er
   dannet, og evt. vand i pulveret. En varm digel vejer for lidt (varm
   luft stiger op). Facit til regneopgaverne paa fane 2 og de to
   gruppers forloeb paa fane 3. Tegningen og panelet henter alt herfra;
   intet tal regnes andre steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    var S = D.STOF;
    K.M = function (id) { return S[id].Mv; };
    /* g Na₂CO₃ pr. g NaHCO₃: 105,99 / (2 · 84,01) = 0,6308 */
    K.FRAK = S.Na2CO3.Mv / (2 * S.NaHCO3.Mv);

    /* Den del af natronens masse, der bliver tilbage efter hver hypotese */
    K.andel = function (hyp) {
        var h = D.HYP[hyp];
        return h.koef[1] * S[h.produkt].Mv / (h.koef[0] * S.NaHCO3.Mv);
    };

    /* ----- Tal til tekst ------------------------------------------------------ */
    K.g2 = function (v) { return NK.tal2(v); };                       /* aflaest: 5,13 */
    K.g = function (v) { return NK.betydende(v, 3); };                /* regnet: 3,24 */
    K.mol = function (v) { return NK.betydende(v, 3); };              /* 0,0611 */
    K.Mtekst = function (id) { return NK.komma(S[id].M); };           /* 84,01 */
    K.min = function (v) {                                            /* 7 og 7,5 */
        var n = Math.round(v * 2) / 2;
        return n % 1 ? String(n).replace(".", ",") : String(n);
    };

    /* Det, eleven ser og regner videre med: tre betydende cifre */
    K.r3 = function (v) { return parseFloat(NK.betydende(v, 3).replace(",", ".")); };
    K.r2 = function (v) { return Math.round(v * 100 + 1e-9) / 100; };

    /* ----- Diglen --------------------------------------------------------------
       o: { m (g i diglen), vand (g vand i pulveret), soda (pulveret er
       Na₂CO₃) }. sted: "vaegt", "trefod" eller "flyt" (i tangen).
       flamme: "" (slukket), "lav" eller "hoej". Tiden regnes i minutter
       i faste skridt, saa resultatet ikke afhaenger af billedraten. */
    function Digel(o) {
        o = o || {};
        this.m0 = o.m || 5.00;
        this.vand = o.vand || 0;
        this.soda = !!o.soda;
        this.nat = this.soda ? 0 : this.m0 - this.vand;
        this.nat0 = this.nat;
        this.na2co3 = this.soda ? this.m0 : 0;
        this.vandRest = this.vand;
        this.tabt = 0;           /* g pulver, der er sproejtet ud */
        this.T = D.STUE;
        this.sted = "vaegt";
        this.flamme = "";
        this.opv = 0;            /* minutter med flamme under diglen */
        this.tid = 0;
        this.gas = 0;            /* g gas pr. minut lige nu */
        this.sprojtRate = 0;     /* g pulver pr. minut, der sproejter ud */
        this.rest = 0;
    }
    var SKRIDT = 1 / 120;        /* minutter */

    Digel.prototype.varmes = function () { return this.sted === "trefod" && !!this.flamme; };

    Digel.prototype.skridt = function (h) {
        var Tm, tau;
        if (this.varmes()) { Tm = D.FLAMME[this.flamme]; tau = D.TAU.op; }
        else { Tm = D.STUE; tau = this.sted === "trefod" ? D.TAU.trefod : D.TAU.vaegt; }
        this.T += (Tm - this.T) * (1 - Math.exp(-h / tau));
        /* Natronen: foerste orden, k vokser med temperaturen */
        var x = NK.klamp((this.T - D.T_START) / (D.T_FULD - D.T_START), 0, 1);
        var k = D.K_MAX * Math.pow(x, 1.5);
        var dn = this.nat * (1 - Math.exp(-k * h));
        this.nat -= dn;
        this.na2co3 += dn * K.FRAK;
        var gas = dn * (1 - K.FRAK);
        /* Vand i pulveret damper af over 40 °C */
        if (this.vandRest > 0) {
            var kv = 1.5 * NK.klamp((this.T - 40) / 60, 0, 1);
            var dv = this.vandRest * (1 - Math.exp(-kv * h));
            this.vandRest -= dv;
            gas += dv;
        }
        this.gas = gas / h;
        /* Sproejt: kommer gassen for hurtigt, ryger pulver ud af diglen */
        var over = this.gas - D.SPROEJT.graense;
        this.sprojtRate = 0;
        if (over > 0) {
            var fast = this.nat + this.na2co3;
            var ud = Math.min(fast * 0.5, over * D.SPROEJT.andel * h);
            if (fast > 0 && ud > 0) {
                var f = ud / fast;
                this.nat *= 1 - f;
                this.na2co3 *= 1 - f;
                this.tabt += ud;
                this.sprojtRate = ud / h;
            }
        }
        if (this.varmes()) this.opv += h;
        this.tid += h;
    };

    /* dt i minutter */
    Digel.prototype.opdater = function (dt) {
        this.rest += dt;
        while (this.rest >= SKRIDT) {
            this.skridt(SKRIDT);
            this.rest -= SKRIDT;
        }
    };

    /* Det, der er i diglen (g) */
    Digel.prototype.masse = function () { return this.nat + this.na2co3 + this.vandRest; };

    /* Den del af natronen, der har reageret (0-1) */
    Digel.prototype.reageret = function () { return this.nat0 > 0 ? 1 - this.nat / this.nat0 : 1; };

    /* Hvor meget den varme luft loefter diglen (g) */
    Digel.prototype.opdrift = function () { return D.OPDRIFT * Math.max(0, this.T - 30); };

    /* Det, vaegten viser (to decimaler). Over FLAKKER °C flakker det
       sidste ciffer. Uden for vaegten: null. */
    Digel.prototype.visning = function () {
        if (this.sted !== "vaegt") return null;
        var v = this.masse() - this.opdrift();
        if (this.T > D.FLAKKER) v += 0.01 * Math.round(Math.sin(this.tid * 23.7) * 1.2);
        return K.r2(Math.max(0, v));
    };

    /* Vaegten staar stille: diglen er kold nok til, at luften ikke loefter den */
    Digel.prototype.stille = function () { return this.sted === "vaegt" && this.T <= 30.5; };

    K.Digel = Digel;

    /* Hvad vaegten ender paa for m gram natron, helt uden fejl */
    K.slutVisning = function (m) { return K.r2(m * K.FRAK); };

    /* ----- Fane 2: facit ------------------------------------------------------------
       o: { tal: { mf, slut }, hyp }. Hvert trin regnes af det tal, eleven
       har staaende fra trinnet foer (tre betydende cifre), ligesom eleven
       selv goer. */
    K.nNatron = function (mf) { return mf / S.NaHCO3.Mv; };

    K.facit = function (mf, hyp) {
        var f = { n_nat: K.nNatron(mf) };
        if (!hyp) return f;
        var h = D.HYP[hyp];
        f.forhold = h.koef[1] / h.koef[0];
        f.n_p = K.r3(f.n_nat) * f.forhold;
        f.m_p = K.r3(f.n_p) * S[h.produkt].Mv;
        return f;
    };

    /* Den hypotese, hvis masse ligger naermest den maalte (null: ingen
       ligger inden for 0,5 g) */
    K.naermest = function (slut, masser) {
        var bedst = null, afst = Infinity;
        D.HYP_IDS.forEach(function (id) {
            if (masser[id] === undefined || masser[id] === null) return;
            var a = Math.abs(masser[id] - slut);
            if (a < afst) { afst = a; bedst = id; }
        });
        return afst <= 0.5 ? bedst : null;
    };

    /* De forventede masser for en startmasse, regnet helt uden afrunding */
    K.forventet = function (mf) {
        var ud = {};
        D.HYP_IDS.forEach(function (id) { ud[id] = mf * K.andel(id); });
        return ud;
    };

    /* ----- Fane 3: en gruppes forloeb ------------------------------------------------
       B: afvigelsen fra D.FEJL (tom for gruppe 1). Planen er en raekke
       skridt: { varm: "lav"/"hoej", min } eller { vej: true }. Efter hver
       vejning afgoeres, om massen er konstant; ellers varmer gruppen 3
       minutter mere. Vejningerne gemmes som { t (opvarmning), m }. */
    function Forloeb(B) {
        B = B || {};
        this.B = B;
        this.d = new Digel({ m: D.FEJL_M, vand: B.vand, soda: B.soda });
        this.d.sted = "trefod";
        this.plan = B.hoejFraStart ? [{ varm: "hoej", min: 10 }, { vej: true }] :
            [{ varm: "lav", min: 4 }, { varm: "hoej", min: B.stopEfter ? B.stopEfter - 4 : 6 }, { vej: true }];
        this.vejninger = [{ t: 0, m: D.FEJL_M }];
        this.i = 0;
        this.fase = null;        /* { slags, t } for det skridt, der er i gang */
        this.faerdig = false;
        this.slut = null;
        this.ekstraGjort = false;
        this.t = 0;
    }

    /* Giver true, naar en ny vejning er skrevet ned. dt i minutter. */
    Forloeb.prototype.opdater = function (dt) {
        if (this.faerdig) return false;
        var d = this.d, ny = false;
        this.t += dt;
        if (!this.fase) {
            var s = this.plan[this.i];
            if (!s) { this.naeste(); s = this.plan[this.i]; }
            if (s.varm) { d.sted = "trefod"; d.flamme = s.varm; this.fase = { slags: "varm", slut: d.opv + s.min }; }
            else { d.flamme = ""; d.sted = "vaegt"; this.fase = { slags: "vej", t: 0 }; }
        }
        d.opdater(dt);
        if (this.fase.slags === "varm" && d.opv >= this.fase.slut - 1e-9) { this.fase = null; this.i++; }
        else if (this.fase.slags === "vej") {
            this.fase.t += dt;
            var klar = this.B.varmVejning ? this.fase.t >= 0.3 : d.stille();
            if (klar) {
                this.vejninger.push({ t: d.opv, m: d.visning() });
                this.fase = null;
                this.i++;
                ny = true;
                this.efterVejning();
            }
        }
        return ny;
    };

    Forloeb.prototype.efterVejning = function () {
        var v = this.vejninger, n = v.length;
        if (this.B.stopEfter) { this.slutter(); return; }
        var konstant = n >= 3 && Math.abs(v[n - 1].m - v[n - 2].m) <= D.KONSTANT.tol;
        if (konstant && this.B.ekstra && !this.ekstraGjort) {
            this.ekstraGjort = true;
            this.plan.push({ varm: "hoej", min: this.B.ekstra }, { vej: true });
            return;
        }
        if (konstant || n > 14) this.slutter();
    };

    /* Endnu ikke konstant: 3 minutter mere og en vejning */
    Forloeb.prototype.naeste = function () {
        this.plan.push({ varm: "hoej", min: 3 }, { vej: true });
    };

    Forloeb.prototype.slutter = function () {
        this.faerdig = true;
        this.d.flamme = "";
        this.slut = this.vejninger[this.vejninger.length - 1].m;
    };

    /* Koer hele forloebet paa én gang (selvtesten og Vis svaret) */
    Forloeb.prototype.koerFaerdig = function () {
        var n = 0;
        while (!this.faerdig && n++ < 200000) this.opdater(0.05);
        return this.slut;
    };

    K.Forloeb = Forloeb;

    NK.Kemi = K;
}());

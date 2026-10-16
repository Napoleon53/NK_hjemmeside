/* =====================================================================
   kemi.js - modellen og tallene

   Lighteren: en tom lighter, den flydende butan, der er tilbage, vand
   paa ydersiden og (hvis ventilen har suget det ind) vand i tanken.
   Vaegten viser summen med to decimaler. Gassen, der slipper ud, regnes
   i mL ved 20 °C og 1,013 bar: 1 mol fylder 24,0 L, og 1 mol butan
   vejer 58,14 g. Ventilen aabner efter pinden og det, der er vundet ved
   at loefte den (tuningen).

   Facit til regneopgaverne paa fane 2 og de to gruppers forsoeg paa
   fane 3 regnes ogsaa her. Tegningen og panelet henter alt herfra;
   intet tal regnes andre steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    /* ----- Molarmasser og molvolumen ---------------------------------------------- */
    K.M = function (i) { return D.ALKANER[i].M / 100; };
    K.M_GAS = K.M(D.LIGHTERGAS);                 /* 58,14 g/mol */
    K.Mtekst = function (i) { return NK.komma(D.ALKANER[i].M); };

    /* L/mol ved temperaturen tC (°C) og 1,013 bar */
    K.vm = function (tC) {
        if (tC === undefined) tC = D.T0;
        return D.VM * (273 + tC) / (273 + D.T0);
    };

    /* Massen (g) af butan, der fylder mL ved tC, og omvendt */
    K.gram = function (mL, tC) { return mL / 1000 / K.vm(tC) * K.M_GAS; };
    K.mL = function (g, tC) { return g / K.M_GAS * K.vm(tC) * 1000; };

    /* Den alkan, hvis molarmasse ligger taettest paa M */
    K.naermeste = function (M) {
        var bedst = 0;
        for (var i = 1; i < D.ALKANER.length; i++) {
            if (Math.abs(K.M(i) - M) < Math.abs(K.M(bedst) - M)) bedst = i;
        }
        return bedst;
    };

    /* ----- Tal til tekst ------------------------------------------------------------ */
    K.g2 = function (v) { return NK.tal2(v); };                       /* aflaest: 17,84 */
    K.g = function (v) { return NK.betydende(v, 3); };                /* regnet: 0,363 */
    K.mol = function (v) { return NK.potens(v, 3); };                 /* 6,25 · 10⁻³ */
    K.Mv = function (v) { return NK.betydende(v, 3); };               /* 57,6 */
    K.V = function (mL) { return String(Math.round(mL)); };           /* 150 */
    K.L = function (mL) { return (Math.round(mL) / 1000).toFixed(3).replace(".", ","); };   /* 0,150 */

    /* Det, eleven ser og regner videre med */
    K.r3 = function (v) { return parseFloat(NK.betydende(v, 3).replace(",", ".")); };
    K.r2 = function (v) { return Math.round(v * 100 + 1e-9) / 100; };

    /* ----- Lighteren ------------------------------------------------------------------
       m0: massen med al gassen i (g). */
    function Lighter(m0) {
        this.m0 = m0;
        this.gas = D.GAS_I;
        this.tom = m0 - D.GAS_I - D.HAETTE;
        this.vand = 0;           /* g vand i tanken */
        this.film = 0;           /* g vand paa ydersiden */
        this.haette = true;
        this.pind = D.PIND_START;
        this.ekstra = 0;         /* det, der er vundet (eller tabt) ved at loefte pinden */
        this.loeftet = false;
    }
    var L = Lighter.prototype;

    L.aabning = function () { return NK.klamp(this.pind + this.ekstra, 0, D.AABEN_MAKS); };
    L.tunet = function () { return this.aabning() > D.TUNET; };
    L.flow = function () { return this.gas > 1e-6 ? D.flow(this.aabning()) : 0; };
    L.masse = function () { return this.tom + this.gas + this.vand + this.film + (this.haette ? D.HAETTE : 0); };
    L.visning = function () { return K.r2(this.masse()); };
    L.vaad = function () { return this.film > 1e-6; };

    /* Slip mL gas (ved 20 °C) ud. Giver det, der faktisk kom ud (mL). */
    L.slip = function (mL) {
        var g = Math.min(this.gas, K.gram(mL));
        this.gas -= g;
        if (this.gas < 1e-9) this.gas = 0;
        return K.mL(g);
    };

    /* Pinden: loeft den af taenderne (kun uden haette), flyt den, saet den ned.
       Mens den er loeftet, flytter den ikke ventilen. */
    L.loeft = function () {
        if (this.haette) return false;
        this.loeftet = true;
        return true;
    };
    L.saenk = function () { this.loeftet = false; };
    L.saetPind = function (p) {
        p = NK.klamp(p, 0, 1);
        if (this.loeftet) {
            var a = this.aabning();
            this.pind = p;
            this.ekstra = NK.klamp(a - p, -1, D.AABEN_MAKS - 1);
        } else {
            this.pind = p;
        }
    };

    /* Den del af gassen, der naar ind i maaleglasset, naar lighteren staar
       lige under det: store, hurtige bobler spreder sig */
    K.fang = function (flow) {
        var F = D.FANG;
        if (flow <= F.graense) return 1;
        return 1 - Math.min(F.maks, (flow - F.graense) / F.pr);
    };

    K.Lighter = Lighter;

    /* ----- Fane 2: facit ------------------------------------------------------------
       t: { mf, V (mL), me }. Hvert trin regnes af det tal, eleven har
       staaende fra trinnet foer (tre betydende cifre), ligesom eleven
       selv goer. */
    K.facit = function (t) {
        var f = {};
        f.dm = K.r2(t.mf - t.me);
        f.n = t.V / 1000 / D.VM;
        f.M = f.dm / K.r3(f.n);
        f.alkan = K.naermeste(f.M);
        return f;
    };

    /* ----- Fane 3: én gruppes forsoeg ------------------------------------------------
       B: afvigelsen fra D.FEJL. Gruppen slipper V mL gas ud (maalt ved
       20 °C; ved en anden temperatur fylder den samme gas mere eller
       mindre), og en del kan stige op ved siden af maaleglasset. Tiden:
       0-1,4 s paa bordet (evt. taendt), 1,4-1,9 ned i vandet, 1,9-7,9
       gassen, 7,9-8,4 op igen og 8,4-9 paa vaegten. */
    var TID = { ned: 1.4, gas: 1.9, op: 7.9, vej: 8.4, slut: 9.0 };
    K.FORLOEB_TID = TID;

    function Forloeb(B) {
        B = B || {};
        var s = D.FEJL_START;
        this.B = B;
        this.t = 0;
        this.tC = B.t || s.t;
        this.mf = s.mf;
        this.V20 = B.V || s.V;                              /* det, der slippes ud, ved 20 °C */
        this.Vud = this.V20 * K.vm(this.tC) / K.vm(D.T0);    /* det samme ved gruppens temperatur */
        this.forbi = B.forbi || 0;
        this.luft = B.luft || 0;
        this.flamme = B.flamme || 0;
        this.film = B.film || 0;
        this.glas = this.V20 > 250 ? 500 : 250;
        var tab = K.gram(this.V20) + this.flamme;
        this.me = K.r2(this.mf - tab + this.film);
        this.Vlaest = Math.round(this.luft + this.Vud * (1 - this.forbi));
        this.faerdig = false;
    }
    var F = Forloeb.prototype;

    F.opdater = function (dt) {
        this.t = Math.min(TID.slut, this.t + dt);
        if (this.t >= TID.slut) this.faerdig = true;
    };

    /* 0-1: hvor langt gassen er */
    F.gasAndel = function () { return NK.klamp((this.t - TID.gas) / (TID.op - TID.gas), 0, 1); };
    F.giverGas = function () { return this.t > TID.gas && this.t < TID.op; };
    F.braender = function () { return this.flamme > 0 && this.t > 0.3 && this.t < 1.2; };

    /* Gassen i maaleglasset lige nu (mL, med luften) */
    F.Vnu = function () { return this.luft + this.Vud * (1 - this.forbi) * this.gasAndel(); };

    /* Hvad gruppen har skrevet indtil nu */
    F.skrevet = function () {
        return { mf: this.t > 0 ? this.mf : null, V: this.t >= TID.op ? this.Vlaest : null, me: this.t >= TID.slut - 0.2 ? this.me : null };
    };

    F.resultat = function () {
        var f = K.facit({ mf: this.mf, V: this.Vlaest, me: this.me });
        return { mf: this.mf, me: this.me, V: this.Vlaest, dm: f.dm, n: f.n, M: f.M };
    };

    F.koerFaerdig = function () {
        this.t = TID.slut;
        this.faerdig = true;
        return this.resultat();
    };

    K.Forloeb = Forloeb;

    NK.Kemi = K;
}());

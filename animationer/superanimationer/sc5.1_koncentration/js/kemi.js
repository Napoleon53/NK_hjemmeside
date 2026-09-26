/* =====================================================================
   kemi.js - modellen og tallene

   Karret paa fane 1, facit til regneopgaverne paa fane 2 og 3 og tal
   skrevet, som de skal staa i en paen beregning. Tegningen og panelet
   henter alt herfra; intet tal regnes andre steder.

   Rumfang regnes i hele mL, saa 0,05 L + 0,05 L altid er 0,10 L.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    /* ----- Tal til tekst ------------------------------------------------------ */
    K.c = function (v) { return NK.betydende(v, 3); };                /* 0,400  1,00  0,0200 */
    K.mol = function (v) { return NK.betydende(v, 3); };              /* 0,150  0,0250 */
    K.L = function (mL) { return NK.betydende(mL / 1000, 3); };       /* 250 mL -> 0,250 */
    K.mL = function (mL) { return NK.betydende(mL, 3); };             /* 25 -> 25,0; 250 -> 250 */
    K.g = function (v) { return NK.tal2(v); };                        /* 14,61 */
    K.M = function (st) { return NK.komma(st.M); };                   /* 58,44 */

    /* Karrets tal: to decimaler, som paa skiltet (0,40 M, 0,25 L) */
    K.to = function (v) { return NK.tal2(v); };

    /* Et rumfang i den enhed, opgaven bruger: "0,500 L" eller "250 mL" */
    K.rumfang = function (mL, enhed) {
        return enhed === "L" ? K.L(mL) + " L" : K.mL(mL) + " mL";
    };

    /* ----- Karret ----------------------------------------------------------------
       nTot: alt det stof, der er kommet i (mol). V: vandet i mL. Stof, der
       ikke kan opløses (over D.C_MAKS), ligger paa bunden og taeller ikke
       med i n. Tapper man ud, loeber opløsningen ud, ikke bunden. */
    function Kar(n, V) {
        this.nTot = n || 0;
        this.V = V || 0;
    }
    Kar.MAKS = 1000;

    Kar.prototype.nOpl = function () {
        return Math.min(this.nTot, D.C_MAKS * this.V / 1000);
    };
    Kar.prototype.nFast = function () {
        var f = this.nTot - this.nOpl();
        return f > 1e-9 ? f : 0;
    };
    Kar.prototype.c = function () {
        return this.V > 0 ? this.nOpl() / (this.V / 1000) : 0;
    };
    Kar.prototype.tilsaet = function (n) { this.nTot += n; };
    /* Giver det rumfang, der faktisk kom i */
    Kar.prototype.haeld = function (dV) {
        var ind = Math.max(0, Math.min(dV, Kar.MAKS - this.V));
        this.V += ind;
        return ind;
    };
    /* Giver det rumfang, der faktisk loeb ud */
    Kar.prototype.tap = function (dV) {
        var ud = Math.max(0, Math.min(dV, this.V));
        if (ud <= 0) return 0;
        var nUd = this.nOpl() * ud / this.V;
        this.nTot = Math.max(0, this.nTot - nUd);
        this.V -= ud;
        if (this.V <= 0) { this.V = 0; }
        return ud;
    };
    K.Kar = Kar;

    /* Er karret ved maalet? c paa 0,005 M naer og V praecist. */
    K.vedMaal = function (kar, maal) {
        if (kar.nFast() > 0) return false;
        if (maal.V !== undefined && kar.V !== maal.V) return false;
        if (maal.c !== undefined && Math.abs(kar.c() - maal.c) > 0.005) return false;
        return kar.V > 0;
    };

    /* ----- Fane 2: facit -------------------------------------------------------------
       o: opgaven med stof og tal ({ n, c, V, m } med V i mL). */
    K.facitKolbe = function (o) {
        var st = D.stof(o.stof), t = o.tal, f = {};
        var VL = t.V !== undefined ? t.V / 1000 : undefined;
        f.M = st.Mv;
        if (o.id === "c") { f.c = t.n / VL; f.n = t.n; f.VL = VL; }
        if (o.id === "n") { f.n_cV = t.c * VL; f.n = f.n_cV; f.c = t.c; f.VL = VL; }
        if (o.id === "V") { f.V = t.n / t.c; f.n = t.n; f.c = t.c; f.VL = f.V; }
        if (o.id === "mc") { f.n_mM = t.m / st.Mv; f.n = f.n_mM; f.c = f.n / VL; f.VL = VL; f.m = t.m; }
        if (o.id === "mk" || o.id === "mn") { f.n_cV = t.c * VL; f.n = f.n_cV; f.m = f.n * st.Mv; f.c = t.c; f.VL = VL; }
        /* Massen paa vaegten, hvis den ikke er givet */
        if (f.m === undefined) f.m = f.n * st.Mv;
        return f;
    };

    /* ----- Fane 3: facit ------------------------------------------------------------ */
    K.facitFortynd = function (o) {
        var t = o.tal, f = {};
        var c1 = t.c1 !== undefined ? t.c1 : D.STAM;
        f.c1 = c1;
        if (o.id === "c2" || o.id === "formel") {
            f.n1 = c1 * t.V1 / 1000;
            f.c2 = f.n1 / (t.V2 / 1000);
            f.c2f = f.c2;
            f.V1 = t.V1; f.V2 = t.V2;
        }
        if (o.id === "V1") {
            f.n2 = t.c2 * t.V2 / 1000;
            f.V1 = f.n2 / c1 * 1000;
            f.c2 = t.c2; f.V2 = t.V2;
        }
        if (o.id === "vand") {
            f.n1 = c1 * t.V1 / 1000;
            f.V2L = f.n1 / t.c2;
            f.V2 = f.V2L * 1000;
            f.vand = f.V2 - t.V1;
            f.c2 = t.c2; f.V1 = t.V1;
        }
        return f;
    };

    /* Fortyndingen paa fane 3: stofmængden fra pipetten i kolben */
    K.fortynd = function (c1, V1, V2) { return c1 * V1 / V2; };

    NK.Kemi = K;
}());

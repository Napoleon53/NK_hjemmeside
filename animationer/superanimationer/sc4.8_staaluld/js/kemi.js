/* =====================================================================
   kemi.js - modellen og tallene

   Klumpen af ståluld paa vaegten: 2 Fe + O₂ → 2 FeO. Vaegten er
   nulstillet med den varmefaste plade, saa den viser stålulden. Naar
   den braender, binder ilt fra luften sig til jernet, og vaegten viser
   jernet plus den ilt, der er bundet. Kun en del af jernet (udbyttet)
   naar at reagere. Facit til regneopgaverne paa fane 2 og tal skrevet,
   som de skal staa i en paen beregning. Tegningen og panelet henter alt
   herfra; intet tal regnes andre steder.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    K.M_FE = D.M.Fe / 100;             /* 55,85 g/mol */
    K.M_FEO = D.M.FeO / 100;           /* 71,85 g/mol */
    K.FAKTOR = K.M_FEO / K.M_FE;       /* g FeO pr. g Fe: 1,286 */

    /* ----- Tal til tekst ------------------------------------------------------ */
    K.g2 = function (v) { return NK.tal2(v); };                       /* aflaest og regnet masse: 4,94 */
    K.mol = function (v) { return NK.betydende(v, 3); };              /* 0,0716 */
    K.pct = function (v) { return String(Math.round(v)); };           /* 81 */
    K.Mtekst = function (id) { return NK.komma(D.M[id]); };           /* 55,85 */

    /* Det, eleven ser og regner videre med: tre betydende cifre */
    K.r3 = function (v) { return parseFloat(NK.betydende(v, 3).replace(",", ".")); };
    K.r2 = function (v) { return Math.round(v * 100 + 1e-9) / 100; };

    /* ----- Klumpen --------------------------------------------------------------
       m: stålulden (g), udbytte: den del af jernet, ilten kan naa (resten
       ligger inderst). p (0-1) er den del af det jern, ilten kan naa, der
       har reageret, og G er gloeden (0-1). I luft doer gloeden, foer alt
       jernet har reageret; ilt fra flasken holder den i live og bringer p
       helt til 1 (se D.BRAND). Der regnes i faste skridt paa 1/120 s, saa
       resultatet ikke afhaenger af billedraten. */
    function Klump(m, udbytte) {
        this.m0 = m;
        this.udbytte = udbytte;
        this.p = 0;
        this.G = 0;
        this.taendt = false;
        this.ude = false;          /* gaaet ud, foer alt jernet havde reageret */
        this.ilt = 0;              /* sekunder med ekstra ilt tilbage */
        this.brugtIlt = false;
        this.rate = 0;             /* dp/dt lige nu */
        this.tid = 0;
    }
    var SKRIDT = 1 / 120;
    var B = D.BRAND;

    /* Taend: kun én gang. Er den gaaet ud, kan den ikke taendes igen. */
    Klump.prototype.taend = function () {
        if (this.taendt) return false;
        this.taendt = true;
        this.G = 1;
        return true;
    };

    /* Mere ilt fra flasken (virker kun, mens den gloeder) */
    Klump.prototype.givIlt = function () {
        if (!this.braender()) return false;
        this.ilt = B.iltTid;
        this.brugtIlt = true;
        return true;
    };

    Klump.prototype.skridt = function (h) {
        var p = this.p, G = this.G;
        if (this.ilt > 0) {
            this.rate = B.ilt * (B.k * G * (1 - p) + B.iltMin * G);
            this.G = Math.min(1, G + 4 * (1 - G) * h);
            this.ilt = Math.max(0, this.ilt - h);
        } else {
            this.rate = p < B.luft ? B.k / B.luft * G * (B.luft - p) : 0;
            /* Kan luften ikke naa mere jern, doer gloeden hurtigere */
            this.G = G * (1 - B.slukker * (p < B.luft ? 1 : 3) * h);
        }
        this.p = Math.min(1, p + this.rate * h);
        if (this.p >= 1) { this.rate = 0; this.ilt = 0; this.G = 0; }
        else if (this.G < B.ud) { this.G = 0; this.rate = 0; this.ude = true; }
        this.tid += h;
    };

    Klump.prototype.opdater = function (dt) {
        if (!this.braender()) { this.rate = 0; return; }
        this.rest = (this.rest || 0) + dt;
        while (this.rest >= SKRIDT && this.braender()) {
            this.rest -= SKRIDT;
            this.skridt(SKRIDT);
        }
    };

    Klump.prototype.braender = function () { return this.taendt && this.G > 0 && this.p < 1; };
    Klump.prototype.stille = function () { return !this.braender(); };

    /* Ilten, klumpen kan binde, hvis den braender helt (g) */
    Klump.prototype.tilvaekst = function () { return this.m0 * (K.FAKTOR - 1) * this.udbytte; };

    /* Det, vaegten viser: to decimaler */
    Klump.prototype.visning = function () { return K.r2(this.m0 + this.tilvaekst() * this.p); };

    /* Den del af alt jernet, der har reageret (0-1) */
    Klump.prototype.reageret = function () { return this.udbytte * this.p; };

    K.Klump = Klump;

    /* Det, vaegten viser til sidst */
    K.slutVisning = function (m, udbytte) { return K.r2(m * (1 + (K.FAKTOR - 1) * udbytte)); };

    /* Et nyt udbytte mellem D.UDBYTTE.min og maks */
    K.nytUdbytte = function () { return D.UDBYTTE.min + Math.random() * (D.UDBYTTE.maks - D.UDBYTTE.min); };

    /* Udbyttet, en maaling svarer til (til luppen, naar maalingen er gemt) */
    K.udbytteAf = function (mf, me) { return NK.klamp((me - mf) / (mf * (K.FAKTOR - 1)), 0, 1); };

    /* ----- Facit til fane 2 ----------------------------------------------------------
       o.tal: { mf, me }. Stofmaengden vises med tre betydende cifre, og
       massen af FeO regnes med det tal, eleven ser (saa den paene
       beregning passer: 0,0716 mol · 71,85 g/mol = 5,14 g). Udbyttet
       regnes af det fulde tal. */
    K.facit = function (o) {
        var t = o.tal, f = {};
        f.n = t.mf / K.M_FE;
        f.nV = K.r3(f.n);
        f.m = f.nV * K.M_FEO;
        f.mTeori = t.mf * K.FAKTOR;
        f.ilt = t.me - t.mf;
        f.iltTeori = f.mTeori - t.mf;
        f.pct = f.ilt / f.iltTeori * 100;
        return f;
    };

    NK.Kemi = K;
}());

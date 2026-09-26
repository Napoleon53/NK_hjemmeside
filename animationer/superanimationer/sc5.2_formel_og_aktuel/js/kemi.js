/* =====================================================================
   kemi.js - modellen og tallene

   Glasset paa fane 1 (salte i vand og ionernes koncentration), facit
   til opgaverne paa fane 2 og 3 og tal skrevet, som de skal staa i en
   paen beregning. Tegningen og panelet henter alt herfra.

   Den formelle koncentration c(salt) er stofmaengden af saltet pr.
   liter. Den aktuelle koncentration [ion] er tallet foran ionen i
   opløsningsskemaet gange c(salt), lagt sammen for alle salte med
   den ion.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var D = NK.Data;
    var K = {};

    /* ----- Tal til tekst ------------------------------------------------------ */
    K.c = function (v) { return NK.betydende(v, 3); };
    K.mol = function (v) { return NK.betydende(v, 3); };
    K.L = function (mL) { return NK.betydende(mL / 1000, 3); };
    K.mL = function (mL) { return NK.betydende(mL, 3); };
    K.g = function (v) { return NK.tal2(v); };
    K.M = function (st) { return NK.komma(st.M); };
    K.to = function (v) { return NK.tal2(v); };

    /* Tallet foran en ion: 1 skrives ikke i et skema */
    function foran(k) { return k > 1 ? k + " " : ""; }

    /* Opløsningsskemaet: "Na₂SO₄(s) ⟶ 2 Na⁺(aq) + SO₄²⁻(aq)" */
    K.skema = function (st) {
        return st.formel + "(s) ⟶ " + foran(st.kk) + D.ion(st.kat).t + "(aq) + " + foran(st.ka) + D.ion(st.an).t + "(aq)";
    };

    /* Tallet foran ionen id i saltet st (0, hvis ionen ikke er der) */
    K.k = function (st, id) {
        if (st.kat === id) return st.kk;
        if (st.an === id) return st.ka;
        return 0;
    };

    /* ----- Glasset paa fane 1 ------------------------------------------------------
       V i mL, n: mol af hvert salt. */
    function Glas(V, salte) {
        var mig = this;
        this.V = V;
        this.n = {};
        salte.forEach(function (s) { mig.n[s] = 0; });
    }
    Glas.prototype.tilsaet = function (s, n) { this.n[s] = (this.n[s] || 0) + n; };
    Glas.prototype.cSalt = function (s) { return this.V > 0 ? (this.n[s] || 0) / (this.V / 1000) : 0; };
    Glas.prototype.portioner = function (s) { return Math.round((this.n[s] || 0) / D.PORTION); };
    /* De ioner, der kan komme i glasset, i en fast raekkefoelge: kationer foerst */
    Glas.prototype.ionListe = function () {
        var kat = [], an = [];
        Object.keys(this.n).forEach(function (s) {
            var st = D.salt(s);
            if (kat.indexOf(st.kat) < 0) kat.push(st.kat);
            if (an.indexOf(st.an) < 0) an.push(st.an);
        });
        return kat.concat(an);
    };
    Glas.prototype.ion = function (id) {
        var mig = this, sum = 0;
        Object.keys(this.n).forEach(function (s) { sum += K.k(D.salt(s), id) * mig.cSalt(s); });
        return sum;
    };
    K.Glas = Glas;

    /* ----- Fane 2: facit ---------------------------------------------------------------
       o: { niv, salt, c } eller { niv, salt, bag: "kat"/"an", ionC } eller
       { niv: "svaer", salt, m, V }. */
    K.facitIoner = function (o) {
        var st = D.salt(o.salt), f = {};
        if (o.m !== undefined) {
            f.M = st.Mv;
            f.n_mM = o.m / st.Mv;
            f.c = f.n_mM / (o.V / 1000);
        } else if (o.bag) {
            var kGiv = o.bag === "kat" ? st.kk : st.ka;
            f.cSalt = o.ionC / kGiv;
            f.c = f.cSalt;
        } else {
            f.c = o.c;
        }
        f.kat = st.kk * f.c;
        f.an = st.ka * f.c;
        f.anden = o.bag === "kat" ? f.an : f.kat;
        return f;
    };

    /* ----- Fane 3: facit --------------------------------------------------------------- */
    K.facitBland = function (o) {
        var t = o.tal, A = D.salt(t.A), B = D.salt(t.B), f = {};
        var ion = o.ion, ion2 = o.ion2;
        f.kA = K.k(A, ion);
        f.kB = K.k(B, ion);
        if (o.id === "samme") {
            f.bidragA = f.kA * t.cA;
            f.bidragB = f.kB * t.cB;
            f.total = f.bidragA + f.bidragB;
            return f;
        }
        f.nA = f.kA * t.cA * t.VA / 1000;
        f.nB = f.kB * t.cB * t.VB / 1000;
        f.Vsum = (t.VA + t.VB) / 1000;
        f.ionBland = (f.nA + f.nB) / f.Vsum;
        if (ion2) {
            f.k2A = K.k(A, ion2);
            f.k2B = K.k(B, ion2);
            f.n2 = f.k2A * t.cA * t.VA / 1000 + f.k2B * t.cB * t.VB / 1000;
            f.ion2 = f.n2 / f.Vsum;
        }
        return f;
    };

    NK.Kemi = K;
}());

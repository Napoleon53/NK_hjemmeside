/* =====================================================================
   model.js - kemien bag pletterne

   Rf-vaerdien regnes, den slaas ikke op. Et molekyle springer hele
   tiden mellem to tilstande: fast paa pladens OH-grupper eller opløst
   i løbevæsken. Kun i løbevæsken flytter det sig. Er k forholdet
   mellem tiden paa pladen og tiden i væsken, er

       Rf = 1 / (1 + k)

   og Rf er altsaa den andel af tiden, molekylet er i løbevæsken. Det
   er det, luppen paa fane 1 viser.

   k afhaenger af tovtraekningen: hvor godt stoffet holder fast (s), og
   hvor godt løbevæsken selv saetter sig paa pladen og skubber stoffet
   af (eluentstyrken eps, Snyders skala for kiselgel). Snyders model:

       log k = A · (s − eps)

   A og s regnes for hvert stof ud fra to Rf-vaerdier, der staar i
   js/data.js (bogens figurer i B8.6). Har stoffet kun én, er A = 6.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var A_STANDARD = 6;

    /* A og s ud fra stoffets Rf-vaerdier i en eller to løbevæsker */
    function parametre(stof, LOEB) {
        if (stof._A !== undefined) return stof;
        var ider = Object.keys(stof.rf);
        var lk = function (rf) { return Math.log((1 - rf) / rf) / Math.LN10; };
        if (ider.length >= 2) {
            var a = ider[0], b = ider[1];
            var ea = LOEB[a].eps, eb = LOEB[b].eps;
            var ka = lk(stof.rf[a]), kb = lk(stof.rf[b]);
            stof._A = (ka - kb) / (eb - ea);
            stof._s = ea + ka / stof._A;
        } else {
            stof._A = A_STANDARD;
            stof._s = LOEB[ider[0]].eps + lk(stof.rf[ider[0]]) / A_STANDARD;
        }
        return stof;
    }

    /* Rf for stoffet i løbevæsken (begge er objekter fra js/data.js) */
    function rf(stof, loeb) {
        var D = NK.Data;
        parametre(stof, D.LOEB);
        if (stof.rf[loeb.id] !== undefined) return stof.rf[loeb.id];
        var logk = stof._A * (stof._s - loeb.eps);
        logk = NK.klamp(logk, -6, 6);
        return 1 / (1 + Math.pow(10, logk));
    }

    /* Andelen af tiden, molekylet sidder fast paa pladen */
    function fast(stof, loeb) {
        return 1 - rf(stof, loeb);
    }

    /* =====================================================================
       Pladen. Maal i cm. z er hoejden over startlinjen.

       baner: [{ navn, kort, pletter: [{ stof, mgd }] }]
       Væskefronten stiger efter Washburn: hoejden over vaesken vokser som
       kvadratroden af tiden, saa den loeber hurtigt foerst og saa
       langsommere. Pladen tages op, naar fronten er frontMax over
       startlinjen ("naesten naaet til toppen").
       ===================================================================== */
    var LOEBETID = 6.5;          /* sekunder, fra pladen staar i væsken til den tages op */

    function Plade(opt) {
        this.baner = opt.baner;
        this.loeb = opt.loeb;
        this.start = opt.start !== undefined ? opt.start : 1.5;      /* startlinjen over pladens kant */
        this.frontMax = opt.frontMax || 5.0;                          /* væskefronten over startlinjen */
        this.hoejde = opt.hoejde || (this.start + this.frontMax + 0.6);
        this.bredde = opt.bredde || Math.max(2.4, 1.3 * this.baner.length + 0.6);
        this.vaeske = opt.vaeske !== undefined ? opt.vaeske : 0.7;   /* løbevæskens hoejde i karret */
        this.nulstil();
    }

    Plade.prototype.nulstil = function () {
        this.t = 0;
        this.status = "klar";      /* klar > loeber > faerdig */
        this.top = this.vaeske;    /* væskens hoejde paa pladen over pladens kant */
        this.front = 0;            /* væskefronten over startlinjen */
        this.markeret = false;     /* blyantsstregen ved fronten */
        this.toer = 0;             /* 0 vaad, 1 toer */
        this.kuglepen = false;     /* paaskeaegget: startlinjen med kuglepen */
    };

    Plade.prototype.koer = function () {
        if (this.status !== "klar") return false;
        this.status = "loeber";
        this.t = 0;
        return true;
    };

    Plade.prototype.opdater = function (dt) {
        if (this.status === "loeber") {
            this.t += dt;
            var u = NK.klamp(this.t / LOEBETID, 0, 1);
            var maks = this.start + this.frontMax;
            this.top = this.vaeske + (maks - this.vaeske) * Math.sqrt(u);
            this.front = Math.max(0, this.top - this.start);
            if (u >= 1) {
                this.status = "faerdig";
                this.front = this.frontMax;
                this.top = maks;
                this.markeret = true;
            }
        } else if (this.status === "faerdig" && this.toer < 1) {
            this.toer = Math.min(1, this.toer + dt / 1.2);
        }
    };

    /* Spring loebet over (Vis svaret og selvtesten) */
    Plade.prototype.faerdiggoer = function () {
        if (this.status === "klar") this.koer();
        this.t = LOEBETID;
        this.opdater(0);
        this.toer = 1;
    };

    Plade.prototype.banePos = function (i) {
        /* Banernes midte i cm fra pladens venstre kant */
        var n = this.baner.length, kant = 0.55;
        return kant + (this.bredde - 2 * kant) * (i + 0.5) / n;
    };

    /* Pletterne lige nu: hvor de er, og hvor store. Stoffet spredes lidt ud,
       jo laengere det loeber (diffusion), og en lille maengde giver en
       mindre og svagere plet. */
    Plade.prototype.pletter = function () {
        var ud = [], mig = this, D = NK.Data;
        this.baner.forEach(function (b, i) {
            (b.pletter || []).forEach(function (p) {
                var st = D.STOF[p.stof];
                var r = rf(st, mig.loeb);
                var z = r * mig.front;
                var mgd = p.mgd === undefined ? 1 : p.mgd;
                var ry = Math.sqrt(0.014 + 0.016 * z) * (0.72 + 0.28 * mgd);
                ud.push({ bane: i, x: mig.banePos(i), z: z, rf: r, ry: ry, rx: ry * 1.25,
                    mgd: mgd, stof: st });
            });
        });
        return ud;
    };

    /* Er to pletter i samme bane skilt ad? (afstanden mellem midterne er
       stoerre end summen af halvhoejderne) */
    Plade.prototype.skiltAd = function (bane) {
        var pl = this.pletter().filter(function (p) { return p.bane === bane; });
        pl.sort(function (a, b) { return a.z - b.z; });
        for (var i = 1; i < pl.length; i++) {
            if (pl[i].z - pl[i - 1].z < (pl[i].ry + pl[i - 1].ry) * 1.05) return false;
        }
        return true;
    };

    NK.Model = {
        LOEBETID: LOEBETID,
        rf: rf,
        fast: fast,
        parametre: parametre,
        Plade: Plade
    };
}());

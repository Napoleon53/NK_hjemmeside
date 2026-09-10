/* =====================================================================
   bord.js - selve titreringen ved bordet

   NK.Bord holder styr paa, hvor meget der er tilsat, hvad pH er, og
   alt det, der skal bevaege sig: draaber, ringe paa overfladen, den
   lokale farvesky og magnetstaven.

   Baade "Laboratoriet" og "Ukendt prøve" bruger et NK.Bord hver. De
   tegner det samme apparat, men har hver deres opstilling.

   Den lokale farvesky er vaerd at bemaerke: dér hvor draaben rammer, er
   pH et kort oejeblik naesten titratorens egen pH. Derfor ser man et
   lyserødt glimt i kolben laenge foer omslaget - og derfor skal der
   roeres rundt.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var Kemi = NK.Kemi;

    var TYNGDE = 950;          /* tegnebordsenheder pr. s^2 */
    var DRAABE_ML = 0.05;      /* en draabe fra en buret */
    var SKY_LEVETID = 1.1;     /* sekunder */
    var RING_LEVETID = 0.9;

    NK.Bord = function () {
        this.ops = null;
        this.V = 0;
        this.pH = 7;
        this.pHVist = 7;
        this.pHTitrator = 7;
        this.flow = 0.6;           /* mL pr. sekund, naar hanen er aaben */
        this.aaben = false;
        this.maal = null;          /* stop her, hvis der er sat et maal */
        this.punkter = [];
        this.draaber = [];
        this.ringe = [];
        this.skyer = [];
        this.omroering = 0;
        this.omroerer = true;
        this.kapacitet = 50;
        this.drypUr = 0;
        this.sidstePunkt = -1;
        this.faerdig = false;      /* buretten er toemt */
        this.ind = null;           /* egen indikator; ellers den faelles */
        this.glasKap = 250;        /* baegerglassets stoerrelse paa tegningen */
    };

    /* Hvilken indikator ser man i glasset? Laboratoriet bruger den, der
       er valgt i venstre spalte; den ukendte proeve maales med pH-meter
       alene og saetter sin egen. */
    NK.Bord.prototype.indikator = function () {
        return this.ind || NK.Ops.indikator();
    };

    /* ----- Opstilling ------------------------------------------------ */
    NK.Bord.prototype.saetOps = function (ops) {
        this.ops = ops;
        var trin = [10, 25, 50, 100, 250, 500];
        this.kapacitet = trin[trin.length - 1];
        for (var i = 0; i < trin.length; i++) {
            if (trin[i] >= ops.Vmaks - 1e-9) { this.kapacitet = trin[i]; break; }
        }
        this.glasKap = (ops.V0 + ops.Vmaks) * 1.15;
        this.pHTitrator = (ops.titrator.stof && ops.titrator.c > 0)
            ? Kemi.pH([{ stof: ops.titrator.stof, c: ops.titrator.c }])
            : 7;
        this.nulstil();
    };

    NK.Bord.prototype.nulstil = function () {
        this.V = 0;
        this.aaben = false;
        this.maal = null;
        this.punkter.length = 0;
        this.draaber.length = 0;
        this.ringe.length = 0;
        this.skyer.length = 0;
        this.sidstePunkt = -1;
        this.faerdig = false;
        this.beregnPH();
        this.pHVist = this.pH;
        this.gemPunkt();
    };

    NK.Bord.prototype.beregnPH = function () {
        this.pH = this.ops ? Kemi.pHVed(this.ops, this.V) : 7;
    };

    /* Elevens egen kurve bygges op punkt for punkt, mens der titreres. */
    NK.Bord.prototype.gemPunkt = function () {
        this.punkter.push({ V: this.V, pH: this.pH });
        this.sidstePunkt = this.V;
    };

    NK.Bord.prototype.rumfang = function () {
        return (this.ops ? this.ops.V0 : 20) + this.V;
    };

    /* ----- Indgreb --------------------------------------------------- */
    NK.Bord.prototype.saetHane = function (aaben) {
        if (aaben && this.V >= this.maksV()) return;
        this.aaben = !!aaben;
        if (!this.aaben) this.maal = null;
    };

    NK.Bord.prototype.maksV = function () {
        return this.ops ? this.ops.Vmaks : 50;
    };

    /* Tilsaetter med det samme og fylder kurven ud undervejs, saa den
       ikke faar huller, naar man springer 5 mL frem. */
    NK.Bord.prototype.tilfoej = function (dV) {
        if (!this.ops) return;
        var maks = this.maksV();
        var nyV = NK.klamp(this.V + dV, 0, maks);
        if (Math.abs(nyV - this.V) < 1e-9) return;

        if (nyV < this.V) {
            /* tilbage igen: kurven skal ogsaa kortes af */
            this.V = nyV;
            while (this.punkter.length && this.punkter[this.punkter.length - 1].V > nyV + 1e-9) {
                this.punkter.pop();
            }
            this.beregnPH();
            this.gemPunkt();
            return;
        }

        var trin = Math.max(1, Math.round((nyV - this.V) / (maks / 400)));
        var start = this.V;
        for (var i = 1; i <= trin; i++) {
            this.V = start + (nyV - start) * i / trin;
            this.beregnPH();
            this.gemPunkt();
        }
        this.V = nyV;
        this.beregnPH();
        this.plask(2);
    };

    NK.Bord.prototype.draabe = function () {
        this.nyDraabe();
        this.tilfoej(DRAABE_ML);
    };

    /* Koer indtil et bestemt rumfang og luk saa hanen. */
    NK.Bord.prototype.koerTil = function (V) {
        this.maal = NK.klamp(V, 0, this.maksV());
        if (this.maal > this.V) this.aaben = true;
    };

    /* ----- Animation -------------------------------------------------- */
    NK.Bord.prototype.nyDraabe = function () {
        if (this.draaber.length > 24) return;
        this.draaber.push({
            x: NK.Apparat.drypX + (Math.random() - 0.5) * 1.5,
            y: NK.Apparat.dryphoejde,
            v: 0,
            r: 3.4 + Math.random() * 0.8
        });
    };

    NK.Bord.prototype.plask = function (antal) {
        for (var i = 0; i < antal; i++) this.ramt(NK.Apparat.drypX + (Math.random() - 0.5) * 10);
    };

    /* En draabe er landet: ring paa overfladen og en sky af titrator,
       som endnu ikke er roert ud. */
    NK.Bord.prototype.ramt = function (x) {
        var overflade = NK.Apparat.overflade(this.rumfang(), this.glasKap);
        this.ringe.push({ x: x, r: 3, styrke: 0.5, t: 0 });

        /* Lokal pH lige dér: taet paa titratorens egen. */
        var lokal = this.pH + (this.pHTitrator - this.pH) * 0.78;
        var ind = this.indikator();
        var farve = ind ? Kemi.indikatorFarve(ind, lokal) : [0, 0, 0, 0];
        if (farve[3] > 0.02) {
            this.skyer.push({
                x: x + (Math.random() - 0.5) * 12,
                y: overflade + 10 + Math.random() * 14,
                r: 9,
                styrke: 0.62,
                t: 0,
                farve: farve
            });
        }
    };

    NK.Bord.prototype.opdater = function (dt) {
        var i;
        if (!this.ops) return;
        if (dt > 0.12) dt = 0.12;

        if (this.omroerer) this.omroering += dt * 7.5;

        /* --- Hanen loeber --- */
        var maks = this.maksV();
        if (this.aaben && this.V < maks - 1e-9) {
            var dV = this.flow * dt;
            if (this.maal !== null && this.V + dV >= this.maal) {
                dV = this.maal - this.V;
                this.V = this.maal;
                this.aaben = false;
                this.maal = null;
            } else {
                this.V += dV;
            }
            if (this.V >= maks) {
                this.V = maks;
                this.aaben = false;
                this.faerdig = true;
            }
            this.beregnPH();

            /* Draaber i takt med gennemstroemningen */
            this.drypUr += dV;
            var pr = Math.max(DRAABE_ML, this.flow * 0.06);
            while (this.drypUr >= pr) {
                this.drypUr -= pr;
                this.nyDraabe();
            }

            if (this.V - this.sidstePunkt >= maks / 500) this.gemPunkt();
        } else if (this.aaben) {
            this.aaben = false;
            this.faerdig = true;
        }

        /* --- pH-metret er lidt om at foelge med --- */
        this.pHVist += (this.pH - this.pHVist) * (1 - Math.exp(-9 * dt));

        /* --- Draaber falder --- */
        var overflade = NK.Apparat.overflade(this.rumfang(), this.glasKap);
        for (i = this.draaber.length - 1; i >= 0; i--) {
            var d = this.draaber[i];
            d.v += TYNGDE * dt;
            d.y += d.v * dt;
            if (d.y >= overflade) {
                this.ramt(d.x);
                this.draaber.splice(i, 1);
            }
        }

        /* --- Ringe og skyer forsvinder --- */
        for (i = this.ringe.length - 1; i >= 0; i--) {
            var r = this.ringe[i];
            r.t += dt;
            r.r += dt * 46;
            r.styrke = 0.5 * (1 - r.t / RING_LEVETID);
            if (r.t >= RING_LEVETID) this.ringe.splice(i, 1);
        }
        for (i = this.skyer.length - 1; i >= 0; i--) {
            var sky = this.skyer[i];
            sky.t += dt;
            sky.r += dt * 26;
            sky.y += dt * 9;
            sky.styrke = 0.62 * Math.pow(1 - sky.t / SKY_LEVETID, 1.4);
            if (sky.t >= SKY_LEVETID) this.skyer.splice(i, 1);
        }
    };

    /* ----- Til tegningen ---------------------------------------------- */
    NK.Bord.prototype.tilstand = function (ekstra) {
        var ind = this.indikator();
        var t = {
            V: this.V,
            kapacitet: this.kapacitet,
            rumfang: this.rumfang(),
            glasKapacitet: this.glasKap,
            pH: this.pHVist,
            farve: Kemi.indikatorFarve(ind, this.pH),
            aaben: this.aaben,
            omroering: this.omroering,
            draaber: this.draaber,
            ringe: this.ringe,
            skyer: this.skyer
        };
        if (ekstra) {
            for (var n in ekstra) {
                if (Object.prototype.hasOwnProperty.call(ekstra, n)) t[n] = ekstra[n];
            }
        }
        return t;
    };
}());

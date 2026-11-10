/* =====================================================================
   termostat.js - temperaturen, som eleven styrer med termometeret

   Termometeret er ogsaa knappen: eleven traekker i haandtaget i toppen
   af soejlen (eller klikker paa skalaen), og kammeret eller vandbadet
   faar straks den temperatur. Piletasterne flytter én grad, med Skift
   ti grader. "Vis svaret" og spillet paa fane 3 skruer op i et jaevnt
   tempo (animerTil).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function Termostat(omr, start) {
        this.omr = omr;
        this.T = start;
        this.maal = null;
        this.fart = 60;
        this.traekker = false;
        this.roert = false;       /* har eleven selv skruet? */
        this.laast = false;
    }

    var P = Termostat.prototype;

    P.saet = function (t) {
        this.T = Math.round(NK.klamp(t, this.omr.min, this.omr.max));
        this.maal = null;
    };

    /* Skru jaevnt op eller ned til t med fart grader pr. sekund */
    P.animerTil = function (t, fart) {
        this.maal = NK.klamp(t, this.omr.min, this.omr.max);
        this.fart = fart || 60;
    };

    P.opdater = function (dt) {
        if (this.maal === null) return;
        var d = this.maal - this.T, skridt = this.fart * dt;
        if (Math.abs(d) <= skridt) {
            this.T = this.maal;
            this.maal = null;
        } else {
            this.T += d > 0 ? skridt : -skridt;
        }
    };

    P.animerer = function () { return this.maal !== null; };

    /* Musen ned over termometeret (TM fra NK.Tegn.termoMaal). Rammer den
       haandtaget, traekkes der fra det; ellers springer soejlen dertil. */
    P.rammer = function (pt, TM) {
        if (!TM) return false;
        var bred = Math.max(26, TM.b * 1.2);
        return Math.abs(pt.x - TM.x) <= bred && pt.y >= TM.yTop - 16 && pt.y <= TM.bund + 4;
    };

    P.rammerHaandtag = function (pt, TM) {
        if (!TM) return false;
        var y = TM.yFor(this.T);
        return Math.abs(pt.x - TM.x) <= 22 && Math.abs(pt.y - y) <= 18;
    };

    P.start = function (pt, TM) {
        if (this.laast || !this.rammer(pt, TM)) return false;
        this.traekker = true;
        this.forskyd = this.rammerHaandtag(pt, TM) ? TM.yFor(this.T) - pt.y : 0;
        if (!this.forskyd) this.saet(TM.tFor(pt.y));
        this.roert = true;
        return true;
    };

    P.flyt = function (pt, TM) {
        if (!this.traekker) return;
        this.saet(TM.tFor(pt.y + this.forskyd));
    };

    P.slip = function () { this.traekker = false; };

    /* Piletasterne. Returnerer true, hvis tasten blev brugt. */
    P.tast = function (tast, skift) {
        if (this.laast) return false;
        var d = tast === "ArrowUp" ? 1 : (tast === "ArrowDown" ? -1 : 0);
        if (!d) return false;
        this.saet(this.T + d * (skift ? 10 : 1));
        this.roert = true;
        return true;
    };

    NK.Termostat = Termostat;
}());

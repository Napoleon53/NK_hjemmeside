/* =====================================================================
   forloeb.js - trin, udloesere og verdenstilstand

   Et forloeb er en raekke trin, der hver er gjort, naar et vilkaar over
   bordets tilstand er sandt (vilkaar.js). Ud over trinnene er der
   udloesere, som fyrer én gang, naar deres vilkaar bliver sandt, og en
   verdenstilstand af flag, som baade trin og udloesere kan laese og
   skrive.

   Det er det samme lag, spillet skal bruge. Et trin i en oevelse og en
   laast doer i et escaperoom er den samme saetning - betingelse,
   konsekvens, fyrer én gang - og kun konsekvensen er forskellig.

       NK.Forloeb.saet({
           navn: "sb24",
           bord: NK.bord,
           trin: [
               { id: "fyld", tekst: "Fyld stamopløsning i alle otte glas.",
                 hint: "Tag fat i kolben, og slip den over et glas.",
                 peg: "kolbe",
                 naar: { alleAf: ["glas1","glas2"], V: { over: 2.5 } } }
           ],
           udloesere: [
               { id: "roert_i_syv", naar: { ... }, saa: function (F) { ... } }
           ]
       });

   ----- Regler --------------------------------------------------------
   * Et trin er gjort, naar dets vilkaar er sandt - uanset i hvilken
     raekkefoelge eleven kom frem til det. Et trin, der bliver sandt, foer
     turen naaede dertil, er ogsaa gjort. Derfor er "det naeste trin" bare
     det foerste, der endnu ikke er gjort.
   * Et trin, der én gang er gjort, bliver ved med at vaere gjort, ogsaa
     hvis eleven haelder glasset ud bagefter. Ellers ville forloebet
     springe tilbage, og det foeles som en fejl.
   * En udloeser fyrer én gang. Den huskes paa sit id.
   * Flag er verdenstilstanden. De er med vilje det eneste, der gemmes:
     et gemt spil gemmer historien, ikke bordene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;
    var V = NK.Vilkaar;

    var F = function (valg) {
        this.valg = valg || {};
        this.navn = this.valg.navn || "forloeb";
        this.trin = (this.valg.trin || []).slice();
        this.udloesere = (this.valg.udloesere || []).slice();
        this.gjort = {};
        this.fyret = {};
        this.flagene = {};
        this.faerdig = false;
        this.vedTrin = this.valg.vedTrin || null;
        this.vedFaerdig = this.valg.vedFaerdig || null;
        this.vedFlag = this.valg.vedFlag || null;
    };

    var P = F.prototype;

    P.bord = function () {
        var b = this.valg.bord;
        if (typeof b === "function") b = b();
        return b && b.aktiv ? b.aktiv() : b;
    };

    /* ----- Verdenstilstand -------------------------------------------- */
    P.flag = function (navn) { return !!this.flagene[navn]; };

    P.saetFlag = function (navn, vaerdi) {
        var nu = vaerdi === undefined ? true : !!vaerdi;
        if (this.flagene[navn] === nu) return;
        this.flagene[navn] = nu;
        if (this.vedFlag) this.vedFlag(navn, nu, this);
    };

    /* ----- Trin -------------------------------------------------------- */
    P.erGjort = function (id) { return !!this.gjort[id]; };

    P.nuTrin = function () {
        for (var i = 0; i < this.trin.length; i++) {
            if (!this.gjort[this.trin[i].id]) return this.trin[i];
        }
        return null;
    };

    P.nummer = function () {
        var n = 0;
        for (var i = 0; i < this.trin.length; i++) if (this.gjort[this.trin[i].id]) n++;
        return n;
    };

    /* Markerer et trin gjort uden at proeve vilkaaret (til selvtest og
       til et trin, en udloeser afgoer) */
    P.gjortNu = function (id) {
        if (this.gjort[id]) return;
        var t = null;
        this.trin.forEach(function (x) { if (x.id === id) t = x; });
        if (!t) return;
        this.gjort[id] = true;
        if (t.saa) this.udfoer(t.saa, t);
        if (this.vedTrin) this.vedTrin(t, this);
    };

    /* ----- Konsekvenser ------------------------------------------------- */
    P.udfoer = function (saa, kilde) {
        var mig = this;
        if (!saa) return;
        if (typeof saa === "function") { saa(this, kilde); return; }
        (Array.isArray(saa) ? saa : [saa]).forEach(function (s) {
            if (typeof s === "function") { s(mig, kilde); return; }
            if (s.flag) mig.saetFlag(s.flag, s.vaerdi);
            if (s.trin) mig.gjortNu(s.trin);
            if (s.besked && mig.valg.besked) mig.valg.besked(s.besked, s.slags);
            if (s.kald) s.kald(mig, kilde);
        });
    };

    /* ----- Tidens gang -------------------------------------------------
       Kaldes, hver gang noget aendrer sig paa bordet. Den er billig: et
       vilkaar er nogle faa opslag i beholderne. */
    P.opdater = function () {
        var mig = this, bord = this.bord();
        if (!bord) return;

        /* Trin: alle, der ikke er gjort, proeves. Et trin laengere fremme,
           som allerede er opfyldt, taeller ogsaa. */
        this.trin.forEach(function (t) {
            if (mig.gjort[t.id]) return;
            if (!V.opfyldt(t.naar, bord, mig)) return;
            mig.gjort[t.id] = true;
            if (t.saa) mig.udfoer(t.saa, t);
            if (mig.vedTrin) mig.vedTrin(t, mig);
        });

        /* Udloesere: fyrer én gang */
        this.udloesere.forEach(function (u) {
            if (mig.fyret[u.id]) return;
            if (!V.opfyldt(u.naar, bord, mig)) return;
            mig.fyret[u.id] = true;
            mig.udfoer(u.saa, u);
        });

        if (!this.faerdig && this.trin.length && !this.nuTrin()) {
            this.faerdig = true;
            if (this.vedFaerdig) this.vedFaerdig(this);
        }
    };

    /* ----- Gemning ------------------------------------------------------
       Kun historien gemmes: hvilke trin der er gjort, hvilke udloesere der
       har fyret, og flagene. Bordene bygges op fra deres opstilling og
       spiller sig selv tilbage. Det er den beslutning, der holder
       gemningen lille nok til at virke. */
    P.tilstand = function () {
        return {
            udgave: 1,
            gjort: this.gjort,
            fyret: this.fyret,
            flag: this.flagene,
            /* Elevens egne iagttagelser hoerer ogsaa til historien */
            journal: NK.Journal ? NK.Journal.tilstand() : null
        };
    };

    P.saetTilstand = function (t) {
        if (!t || t.udgave !== 1) return false;
        this.gjort = t.gjort || {};
        this.fyret = t.fyret || {};
        this.flagene = t.flag || {};
        if (NK.Journal) NK.Journal.saetTilstand(t.journal);
        this.faerdig = !!(this.trin.length && !this.nuTrin());
        return true;
    };

    P.gem = function () {
        try { window.localStorage.setItem("nk-" + this.navn + "-forloeb", JSON.stringify(this.tilstand())); }
        catch (fejl) { /* file:// eller privat browsing */ }
    };

    P.hent = function () {
        try {
            var t = window.localStorage.getItem("nk-" + this.navn + "-forloeb");
            return t ? this.saetTilstand(JSON.parse(t)) : false;
        } catch (fejl) { return false; }
    };

    P.nulstil = function () {
        this.gjort = {};
        this.fyret = {};
        this.flagene = {};
        this.faerdig = false;
        if (NK.Journal) NK.Journal.nulstilAlle();
    };

    NK.Forloeb = {
        Forloeb: F,
        nu: null,
        saet: function (valg) {
            var f = new F(valg);
            NK.Forloeb.nu = f;
            return f;
        }
    };
}());

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

   ----- Konsekvenser (saa) --------------------------------------------
   En funktion, eller en liste af:
     { flag: "navn", vaerdi }    saetter (eller rydder) et flag
     { trin: "id" }              goer et trin gjort
     { besked: "tekst", slags }  en linje paa scenen (valg.besked)
     { sig: "tekst" }            en replik: noget, der siges af den, der
                                 er der til at sige det (valg.sig). Kan
                                 vaere en liste af linjer og have peg,
                                 glimt og udtryk med; det er taleren, der
                                 laeser dem. Er der ingen til at tale,
                                 bliver den en besked, saa intet gaar tabt
     { kald: fn }                kald en funktion
   Et trin kan desuden have sit eget sig, som siges, naar trinnet er gjort.

   ----- Regler --------------------------------------------------------
   * Et trin er gjort, naar dets vilkaar er sandt - uanset i hvilken
     raekkefoelge eleven kom frem til det. Et trin, der bliver sandt, foer
     turen naaede dertil, er ogsaa gjort. Derfor er "det naeste trin" bare
     det foerste, der endnu ikke er gjort.
   * Et trin, der én gang er gjort, bliver ved med at vaere gjort, ogsaa
     hvis eleven haelder glasset ud bagefter. Ellers ville forloebet
     springe tilbage, og det foeles som en fejl.
   * En udloeser fyrer én gang. Den huskes paa sit id. Med igen: sekunder
     (S3) kan den fyre igen: naar dens vilkaar har vaeret falsk og bliver
     sandt igen, tidligst igen sekunder efter sidst (karantaene, maalt i
     bordets tid). Bliver det sandt igen inden for karantaenen, sluges det.
     Den nager altsaa ikke, mens tilstanden bare staar der.
   * En replik kan laese verdens tal, naar den siges: {{glas5.T}} (se
     NK.Vilkaar.udfyld).
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
        this.fyretTid = {};     /* bordets tid, sidst en udloeser fyrede */
        this.hviler = {};       /* igen-udloesere, der ikke har vaeret falske siden */
        this.flagene = {};
        this.faerdig = false;
        this.vedTrin = this.valg.vedTrin || null;
        this.vedFaerdig = this.valg.vedFaerdig || null;
        this.vedFlag = this.valg.vedFlag || null;
        this.kun = this.valg.kun || null;
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

    /* Det foerste trin, der ikke er gjort. Har siden sat en `kun(trin)`,
       springes de trin over, der ikke hoerer til det, eleven staar i lige
       nu - et forsoeg i flere dele lader panelet foelge delen. Det aendrer
       intet ved, hvornaar et trin er gjort, og intet ved listen; kun
       hvilket af de ugjorte der staar oeverst. */
    P.nuTrin = function () {
        for (var i = 0; i < this.trin.length; i++) {
            if (this.gjort[this.trin[i].id]) continue;
            if (this.kun && !this.kun(this.trin[i])) continue;
            return this.trin[i];
        }
        return null;
    };

    P.nummer = function () {
        var n = 0;
        for (var i = 0; i < this.trin.length; i++) if (this.gjort[this.trin[i].id]) n++;
        return n;
    };

    /* Er hvert eneste trin gjort? Her spoerges UDEN `kun`: filteret
       afgoer kun, hvilket trin panelet viser eleven lige nu, aldrig
       hvornaar forloebet er forbi. */
    P.alleGjort = function () {
        for (var i = 0; i < this.trin.length; i++) if (!this.gjort[this.trin[i].id]) return false;
        return true;
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
            /* En replik. Forloebet ved ikke, hvem der taler; det afgoer
               valg.sig. Uden nogen til at tale bliver den en besked. */
            if (s.sig) {
                if (mig.valg.sig) mig.valg.sig(s.sig, s, kilde);
                else if (mig.valg.besked) mig.valg.besked(Array.isArray(s.sig) ? s.sig.join(" ") : s.sig, s.slags);
            }
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

        /* Udloesere: fyrer én gang - eller igen efter karantaenen (igen) */
        var nu = bord.tid || 0;
        this.udloesere.forEach(function (u) {
            var sand = V.opfyldt(u.naar, bord, mig);
            if (mig.fyret[u.id]) {
                if (!u.igen) return;
                if (!sand) { mig.hviler[u.id] = false; return; }
                if (mig.hviler[u.id] !== false) return;
                /* Sker det igen inden for karantaenen, sluges det: en
                   bemaerkning, der kommer et halvt minut efter handlingen,
                   ville virke tilfaeldig */
                if (nu - (mig.fyretTid[u.id] || 0) < u.igen) { mig.hviler[u.id] = true; return; }
            } else if (!sand) return;
            mig.fyret[u.id] = true;
            mig.fyretTid[u.id] = nu;
            mig.hviler[u.id] = true;
            mig.udfoer(u.saa, u);
        });

        if (!this.faerdig && this.trin.length && this.alleGjort()) {
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
        this.fyretTid = {};
        this.hviler = {};
        this.flagene = t.flag || {};
        if (NK.Journal) NK.Journal.saetTilstand(t.journal);
        this.faerdig = !!(this.trin.length && this.alleGjort());
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
        this.fyretTid = {};
        this.hviler = {};
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

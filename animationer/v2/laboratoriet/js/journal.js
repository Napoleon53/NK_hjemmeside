/* =====================================================================
   journal.js - elevens egne iagttagelser og maalinger

   Et forsoeg er ikke faerdigt, fordi motoren ved, hvad der skete. Det er
   faerdigt, naar eleven har set det og skrevet det ned. Journalen er det
   sted, det skrives ned, og den er med vilje adskilt fra, hvordan det
   praesenteres: her staar posterne, svarene og bedoemmelsen, og forsoeget
   bestemmer selv, om det spoerges med knapper under et billede, med et
   felt til et tal eller noget tredje.

   En post kan vaere et valg ("moerkere", "ens", "lysere") eller et tal (en
   temperatur, et rumfang fra en burette). Begge dele bedoemmes mod
   sandheden, som regnes ud af verden i det oejeblik, eleven svarer - ikke
   af en facitliste skrevet i forvejen. Det er den samme regel som for
   trinnene: spoerg bordet, ikke opskriften.

       var J = NK.Journal.lav({
           id: "billede",
           kraevede: ["glas1", "glas2", "glas3", "glas4", "glas5", "glas6"],
           facit: function (id, bord) {
               var d = NK.Vilkaar.lysstyrke(bord.g[id]) - NK.Vilkaar.lysstyrke(bord.g.glas7);
               return d < -0.03 ? "moerkere" : (d > 0.03 ? "lysere" : "ens");
           },
           billede: function (id, bord) {
               return { farve: NK.Beholder.farve(bord.g[id]) };
           }
       });

       J.noter("glas1", "moerkere", bord);
       J.rigtig("glas1");     // true, false eller null (ikke svaret)

   ----- Tal -----------------------------------------------------------
   Er facit et tal, er svaret rigtigt, naar det ligger inden for
   tolerancen (som kan vaere et tal eller en funktion af facit):

       NK.Journal.lav({ id: "temperaturer", tolerance: 2, facit: ... });

   ----- Oejebliksbilledet ---------------------------------------------
   billede(id, bord) gemmes sammen med svaret. Eleven noterede glasset,
   som det saa ud dengang, og det er det, tegneserien og resultatskemaet
   skal vise bagefter - ikke hvordan glasset ser ud nu, efter at det er
   haeldt ud. Svaret og det, der blev svaret paa, hoerer sammen.

   ----- Gemning -------------------------------------------------------
   Journalerne gemmes med forloebet (forloeb.js), fordi de er en del af
   historien og ikke af bordene.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var alle = {};

    var J = function (valg) {
        this.valg = valg || {};
        this.id = this.valg.id || "journal";
        this.kraevede = (this.valg.kraevede || []).slice();
        this.poster = {};
        alle[this.id] = this;
    };

    var P = J.prototype;

    /* ----- At notere ---------------------------------------------------- */
    P.noter = function (id, svar, bord) {
        var v = this.valg;
        var facit = v.facit && bord ? v.facit(id, bord) : undefined;
        var post = {
            id: id,
            svar: svar,
            facit: facit,
            billede: v.billede && bord ? v.billede(id, bord) : null,
            tid: Date.now()
        };
        this.poster[id] = post;
        if (v.vedSvar) v.vedSvar(post, this);
        return post;
    };

    P.slet = function (id) { delete this.poster[id]; };

    P.post = function (id) { return this.poster[id] || null; };
    P.svar = function (id) { return this.poster[id] ? this.poster[id].svar : undefined; };
    P.billede = function (id) { return this.poster[id] ? this.poster[id].billede : null; };

    /* ----- Bedoemmelsen --------------------------------------------------
       null betyder "ikke svaret" eller "der er ingen facit at maale mod".
       Et forsoeg uden facit er en ren notesbog, og det er i orden. */
    P.rigtig = function (id) {
        var p = this.poster[id];
        if (!p || p.facit === undefined || p.facit === null) return null;
        if (typeof p.facit === "number") {
            var tol = this.valg.tolerance;
            if (typeof tol === "function") tol = tol(p.facit);
            if (tol === undefined) tol = 0;
            return Math.abs(Number(p.svar) - p.facit) <= tol;
        }
        return p.svar === p.facit;
    };

    P.svarede = function () { return Object.keys(this.poster); };

    P.antal = function () { return this.svarede().length; };

    P.antalRigtige = function () {
        var mig = this, n = 0;
        this.svarede().forEach(function (id) { if (mig.rigtig(id) === true) n++; });
        return n;
    };

    P.antalForkerte = function () {
        var mig = this, n = 0;
        this.svarede().forEach(function (id) { if (mig.rigtig(id) === false) n++; });
        return n;
    };

    /* De kraevede poster, der mangler et svar */
    P.mangler = function () {
        var mig = this;
        return this.kraevede.filter(function (id) { return !mig.poster[id]; });
    };

    P.faerdig = function () {
        return this.kraevede.length > 0 && this.mangler().length === 0;
    };

    /* De kraevede poster, der er svaret forkert. Bruges af et forsoeg, der
       vil bede eleven kigge en gang til i stedet for at rette for ham. */
    P.forkerte = function () {
        var mig = this;
        return this.kraevede.filter(function (id) { return mig.rigtig(id) === false; });
    };

    /* ----- Gemning ------------------------------------------------------- */
    P.tilstand = function () { return { poster: this.poster }; };

    P.saetTilstand = function (t) {
        this.poster = (t && t.poster) || {};
    };

    P.nulstil = function () { this.poster = {}; };

    NK.Journal = {
        Journal: J,
        alle: alle,
        lav: function (valg) { return new J(valg); },
        find: function (id) { return alle[id] || null; },
        nulstilAlle: function () {
            Object.keys(alle).forEach(function (id) { alle[id].nulstil(); });
        },
        tilstand: function () {
            var ud = {};
            Object.keys(alle).forEach(function (id) { ud[id] = alle[id].tilstand(); });
            return ud;
        },
        saetTilstand: function (t) {
            if (!t) return;
            Object.keys(alle).forEach(function (id) { if (t[id]) alle[id].saetTilstand(t[id]); });
        }
    };
}());

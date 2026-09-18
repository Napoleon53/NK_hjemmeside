/* =====================================================================
   laerer.js - den sarkastiske kemilærer

   Laereren dukker op nede i hjoernet af scenen og siger noget i en
   talebobbel:
     fjol      naar eleven har dryppet noget forkert i nok felter i skemaet
     overloeb  naar en draabe i et fyldt felt faar det til at loebe over;
               koekkenrullen toerrer begge felter af (forsoeg.js)
     bonus     naar alle tolv felter er udfoert, og de ekstra flasker laases op
     ros       naar opgaven i det frie forsøg er løst

   Hvor mange fejl der skal til, styres i forsoeg.js (FJOL_GRAENSE).
   Samme replik bruges ikke igen, foer alle i listen er brugt.
   Et klik paa laereren eller bobblen sender ham vaek.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var REPLIKKER = {
        fjol: [
            "Der står faktisk noget over søjlerne. Det er ikke pynt.",
            "Interessant. Du laver dit eget skema. Modigt.",
            "Hvis det skal være abstrakt kunst, ligger billedkunst ved siden af.",
            "Sølvnitrat er ikke gratis. Bare så du ved det.",
            "Jeg kan se, at vi har fundet vores indre alkymist.",
            "Ingen har fået nobelprisen for at dryppe tilfældigt.",
            "Skemaet læses efter søjle og række. Ikke efter horoskopet.",
            "Køkkenrullen ligger lige der. Den bider ikke.",
            "Vi skal nok nå pensum. Engang."
        ],
        overloeb: [
            "Fire dråber er rigeligt. Det er ikke en svømmepøl.",
            "Der bliver ikke mere bundfald af at blive ved. Kun mere køkkenrulle.",
            "Nu har nabofeltet også fået noget. Det havde det ikke bedt om."
        ],
        bonus: [
            "Nå. Du kan godt følge et skema. Så må du låne Na₂S og Fe(NO₃)₃ og prøve frit."
        ],
        ros: [
            "Hm. Det var faktisk rigtigt. Det havde jeg ikke set komme."
        ]
    };
    NK.LAERER_REPLIKKER = REPLIKKER;

    NK.Laerer = function () {
        this.nulstil();
    };

    var L = NK.Laerer.prototype;

    L.nulstil = function () {
        this.ind = 0;             /* 0: nede under bordkanten, 1: helt fremme */
        this.aktiv = false;
        this.tekst = "";
        this.ur = 0;
        this.slags = "";
        this.brugt = {};
        this.omraade = null;      /* saettes af scene.js, bruges til klik */
    };

    /* Varigheden afhaenger af, hvor lang saetningen er. */
    L.sig = function (tekst, slags) {
        this.tekst = tekst;
        this.slags = slags || "";
        this.aktiv = true;
        this.ur = 3 + tekst.length * 0.055;
        return true;
    };

    L.replik = function (slags) {
        var liste = REPLIKKER[slags] || REPLIKKER.fjol;
        var brugt = this.brugt[slags] || (this.brugt[slags] = []);
        if (brugt.length >= liste.length) brugt.length = 0;
        var frie = liste.filter(function (t) { return brugt.indexOf(t) < 0; });
        var t = frie[Math.floor(Math.random() * frie.length)];
        brugt.push(t);
        return this.sig(t, slags);
    };

    L.luk = function () {
        if (!this.aktiv) return false;
        this.aktiv = false;
        this.ur = 0;
        return true;
    };

    L.synlig = function () {
        return this.ind > 0.02;
    };

    L.ramt = function (p) {
        var o = this.omraade;
        if (!o || !this.synlig()) return false;
        for (var i = 0; i < o.length; i++) {
            var r = o[i];
            if (p.x > r.x && p.x < r.x + r.b && p.y > r.y && p.y < r.y + r.h) return true;
        }
        return false;
    };

    L.opdater = function (dt) {
        if (this.aktiv) {
            this.ur -= dt;
            if (this.ur <= 0) this.aktiv = false;
        }
        this.ind = NK.mod(this.ind, this.aktiv ? 1 : 0, this.aktiv ? 7 : 9, dt);
        if (!this.aktiv && this.ind < 0.01) this.ind = 0;
    };
}());

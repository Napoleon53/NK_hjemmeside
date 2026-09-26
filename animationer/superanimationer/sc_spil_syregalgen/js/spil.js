/* =====================================================================
   spil.js - reglerne i Syregalgen, uden tegning og knapper

   NK.Galge.laes(tekst)   laeser en ordliste (formatet i ordlister.js)
                          og giver { omraader, ord, fejl }
   new NK.Galge.Spil(l)   et spil paa en laest liste

   Spillet:
     * Ordet gaettes bogstav for bogstav. Hvert forkert bogstav koster et
       skridt, og efter SKRIDT forkerte falder klassekammeraten i karret.
     * Ledetraaden koster ogsaa et skridt. Den kan ikke koebes med det
       sidste skridt: saa staar knappen paa Vis ordet i stedet.
     * Et ord kommer ikke igen, foer alle ord i de valgte omraader har
       vaeret der.
     * Point for et gaettet ord: 10 pr. skridt, der er tilbage, plus 5
       for hvert ord i traek foer det. Alt er hele tal.
     * Hvert femte ord i traek er Syreimmun (paaskeaegget, som
       escape-rummet i kemi-c-filer spoerger til).
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    var BOGSTAVER = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ";
    var SKRIDT = 6;
    var IMMUN = 5;

    /* ----- Listen som tekst ------------------------------------------- */
    function laes(tekst) {
        var omraader = [], ord = [], fejl = [], set = {};
        var aktuelt = null;
        String(tekst || "").split(/\r?\n/).forEach(function (raa, i) {
            var linje = raa.replace(/\/\/.*$/, "").trim();
            if (!linje) return;
            var m = /^Område\s+([a-z0-9æøå_-]+)\s*:\s*(.+)$/i.exec(linje);
            if (m) {
                aktuelt = { id: m[1].toLowerCase(), navn: m[2].trim(), ord: [] };
                omraader.push(aktuelt);
                return;
            }
            var dele = linje.split(";").map(function (d) { return d.trim(); });
            if (dele.length !== 3) {
                fejl.push({ linje: i + 1, besked: "Der skal være tre dele adskilt af semikolon." });
                return;
            }
            if (!aktuelt) {
                fejl.push({ linje: i + 1, besked: "Ordet står før det første område." });
                return;
            }
            var o = dele[0].toUpperCase().replace(/\s+/g, " ");
            if (!/^[A-ZÆØÅ]+([ -][A-ZÆØÅ]+)*$/.test(o)) {
                fejl.push({ linje: i + 1, besked: "Ordet må kun have A til Å, mellemrum og bindestreg: " + dele[0] });
                return;
            }
            if (set[o]) {
                fejl.push({ linje: i + 1, besked: "Ordet står to gange: " + o });
                return;
            }
            set[o] = true;
            var post = { ord: o, ledetraad: dele[1], forklaring: dele[2], omraade: aktuelt.id, omraadeNavn: aktuelt.navn };
            aktuelt.ord.push(post);
            ord.push(post);
        });
        return { omraader: omraader, ord: ord, fejl: fejl };
    }

    /* Et bogstav fra tastaturet eller en knap, som det staar i ordet */
    function bogstav(t) {
        if (typeof t !== "string" || t.length !== 1) return null;
        var s = t.toUpperCase();
        return BOGSTAVER.indexOf(s) >= 0 ? s : null;
    }

    function erBogstav(c) {
        return BOGSTAVER.indexOf(c) >= 0;
    }

    /* ----- Spillet ----------------------------------------------------- */
    function Spil(liste, rnd) {
        this.liste = liste;
        this.rnd = rnd || Math.random;
        this.valgte = [];
        this.pulje = [];
        this.sidste = null;
        this.point = 0;
        this.iTraek = 0;
        this.runde = null;
    }

    var P = Spil.prototype;

    P.omraade = function (id) {
        for (var i = 0; i < this.liste.omraader.length; i++) {
            if (this.liste.omraader[i].id === id) return this.liste.omraader[i];
        }
        return null;
    };

    /* Ids, der ikke findes, sorteres fra. En tom liste betyder alle. */
    P.vaelg = function (ids) {
        var mig = this;
        var ud = (ids || []).filter(function (id, i, a) { return mig.omraade(id) && a.indexOf(id) === i; });
        if (ud.length === this.liste.omraader.length) ud = [];
        this.valgte = ud;
        this.pulje = [];
        return ud;
    };

    P.ordIValgte = function () {
        var v = this.valgte;
        if (!v.length) return this.liste.ord.slice();
        return this.liste.ord.filter(function (o) { return v.indexOf(o.omraade) >= 0; });
    };

    P.bland = function (a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(this.rnd() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    };

    P.nytOrd = function () {
        if (!this.pulje.length) {
            this.pulje = this.bland(this.ordIValgte());
            /* Det sidste ord kommer ikke igen lige efter en ny blanding */
            if (this.pulje.length > 1 && this.sidste && this.pulje[this.pulje.length - 1] === this.sidste) {
                this.pulje.unshift(this.pulje.pop());
            }
        }
        var post = this.pulje.pop();
        this.sidste = post;
        this.runde = {
            post: post,
            ord: post.ord,
            gaettet: [],
            forkerte: 0,
            ledetraad: false,
            status: "spiller",
            point: 0,
            syreimmun: false,
            nyRekord: false
        };
        return this.runde;
    };

    /* Har eleven gaettet noget i denne runde? */
    P.roert = function () {
        var r = this.runde;
        return !!(r && (r.gaettet.length || r.ledetraad));
    };

    P.skridtTilbage = function () {
        return this.runde ? SKRIDT - this.runde.forkerte : SKRIDT;
    };

    P.vist = function (c) {
        return !erBogstav(c) || this.runde.gaettet.indexOf(c) >= 0;
    };

    P.loest = function () {
        var r = this.runde;
        for (var i = 0; i < r.ord.length; i++) {
            if (!this.vist(r.ord[i])) return false;
        }
        return true;
    };

    /* Giver { bogstav, antal, status } eller null, hvis gaettet ikke taeller */
    P.gaet = function (t) {
        var r = this.runde, b = bogstav(t);
        if (!r || r.status !== "spiller" || !b || r.gaettet.indexOf(b) >= 0) return null;
        r.gaettet.push(b);
        var antal = r.ord.split(b).length - 1;
        if (antal === 0) {
            r.forkerte++;
            if (r.forkerte >= SKRIDT) this.tab();
        } else if (this.loest()) {
            this.vind();
        }
        return { bogstav: b, antal: antal, status: r.status };
    };

    P.kanFaaLedetraad = function () {
        var r = this.runde;
        return !!(r && r.status === "spiller" && !r.ledetraad && r.forkerte < SKRIDT - 1);
    };

    P.ledetraad = function () {
        if (!this.kanFaaLedetraad()) return false;
        this.runde.ledetraad = true;
        this.runde.forkerte++;
        return true;
    };

    P.givOp = function () {
        var r = this.runde;
        if (!r || r.status !== "spiller") return false;
        r.forkerte = SKRIDT;
        this.tab();
        return true;
    };

    P.vind = function () {
        var r = this.runde;
        r.status = "vundet";
        r.point = 10 * (SKRIDT - r.forkerte) + 5 * this.iTraek;
        this.point += r.point;
        this.iTraek++;
        r.syreimmun = this.iTraek % IMMUN === 0;
    };

    P.tab = function () {
        this.runde.status = "tabt";
        this.iTraek = 0;
    };

    NK.Galge = {
        BOGSTAVER: BOGSTAVER,
        SKRIDT: SKRIDT,
        IMMUN: IMMUN,
        laes: laes,
        bogstav: bogstav,
        erBogstav: erBogstav,
        Spil: Spil
    };
}());

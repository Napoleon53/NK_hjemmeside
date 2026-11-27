/* =====================================================================
   spil.js - Bundfalds regler, uden tegning

   En krystal er en forklaring, der synker ned gennem glasset. Dens plads
   er f: hvor langt kortets underkant er naaet fra vaeskens overflade (0)
   mod bunden (1). Bundfaldet ligger i lag paa bunden, og et kort lander,
   naar f naar 1 - lag * D.LAG_ANDEL. Scenen saetter f0 (hvor kortets
   underkant starter), naar kortet er bygget; uden scene er f0 0,2.

   var s = new NK.Spil(ord, { tempo: "roligt" }, rnd);
   s.haendelse = function (type, data) { ... };
   s.start(); s.opdater(dt); s.svar("elektron"); s.afskriv("elektron");

   Haendelser: nyt, hjaelp, loest, forkert, bund, lag, niveau, slut, fyldt.
   Alle tal, der kan skrues paa, staar i NK.Spil.D.
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK = window.NK || {};

    var D = {
        LAG_MAKS: 5,            // fem lag bundfald, og glasset er fyldt
        LAG_ANDEL: 0.06,        // hvert lag fylder 6 % af vejen fra overfladen til bunden
        HJAELP_VED: 0.5,        // foerste bogstav og stregerne kommer halvvejs nede
        /* Sekunder fra overfladen til en tom bund pr. niveau (1 til 8). */
        FALDTID: {
            roligt:  [32, 29, 26, 24, 22, 20, 19, 18],
            normalt: [24, 21, 19, 17, 15, 13.5, 12.5, 11.5],
            hurtigt: [16, 14, 12.5, 11, 10, 9, 8, 7.5]
        },
        SAMTIDIG: [1, 1, 2, 2, 2, 3, 3, 3],   // krystaller i glasset paa én gang pr. niveau
        ORD_PR_NIVEAU: 4,       // nyt niveau for hver 4 opløste fagord
        NIVEAU_MAKS: 8,
        POINT_FOER: 100,        // opløst, foer hjaelpen kom
        POINT_EFTER: 50,        // opløst efter hjaelpen
        POINT_STIME: 10,        // bonus pr. rigtigt svar i traek (efter det foerste)
        STIME_MAKS: 10,
        STRAF: 0.05,            // et forkert fagord: krystallerne synker 5 % af vejen
        OMROER: 5,              // fem rigtige i traek roerer et lag bundfald op
        FOERSTE_EFTER: 0.7,     // s fra start til den foerste krystal
        NY_EFTER: 0.9,          // s fra glasset er tomt, til den naeste kommer
        AFSTAND: 0.3,           // en ny krystal, naar den nyeste er naaet 30 % af vejen
        MELLEM: 2.5,            // og mindst saa mange sekunder efter den forrige
        IGEN_EFTER: 3,          // et fagord, der naaede bunden, kommer igen efter 3 andre
        F0: 0.2
    };

    function Spil(ord, valg, rnd) {
        this.ord = ord;
        this.valg = valg || {};
        this.tempo = D.FALDTID[this.valg.tempo] ? this.valg.tempo : "roligt";
        this.rnd = rnd || Math.random;
        this.former = ord.map(function (o) { return NK.Ord.former(o.ord); });
        this.baner = 3;
        this.haendelse = function () {};
        this.nulstil();
    }

    Spil.D = D;

    Spil.prototype.nulstil = function () {
        var n = this.ord.length;
        this.koe = NK.Ord.bland(this.ord.map(function (o, i) { return i; }), this.rnd);
        this.aktive = [];
        this.loest = this.ord.map(function () { return false; });
        this.fejl = this.ord.map(function () { return 0; });
        this.antalLoest = 0;
        this.lag = 0;
        this.point = 0;
        this.stime = 0;
        this.bedsteStime = 0;
        this.niveau = 1;
        this.tid = 0;
        this.sidstNy = -99;
        this.sidstTom = D.FOERSTE_EFTER - D.NY_EFTER;
        this.status = "klar";
        this.bundKort = null;
        this.naesteId = 1;
        this.n = n;
    };

    Spil.prototype.start = function () {
        this.nulstil();
        this.status = "koerer";
    };

    Spil.prototype.pause = function (til) {
        if (til && this.status === "koerer") this.status = "pause";
        else if (!til && this.status === "pause") this.status = "koerer";
    };

    Spil.prototype.bund = function () { return 1 - this.lag * D.LAG_ANDEL; };
    Spil.prototype.faldtid = function () { return D.FALDTID[this.tempo][this.niveau - 1]; };
    Spil.prototype.samtidig = function () {
        return Math.max(1, Math.min(D.SAMTIDIG[this.niveau - 1], this.baner));
    };

    Spil.prototype.frieBaner = function () {
        var brugt = this.aktive.map(function (k) { return k.bane; });
        var frie = [];
        for (var b = 0; b < this.baner; b++) if (brugt.indexOf(b) < 0) frie.push(b);
        return frie;
    };

    Spil.prototype.nyKrystal = function () {
        var i = this.koe.shift();
        var frie = this.frieBaner();
        var bane = frie.length ? frie[Math.floor(this.rnd() * frie.length)] : 0;
        /* Med én krystal ad gangen falder den gerne nær midten. */
        if (this.samtidig() === 1 && this.baner === 3 && frie.length === 3 && this.rnd() < 0.5) bane = 1;
        var k = {
            id: this.naesteId++, i: i, bane: bane, skub: this.rnd() * 2 - 1,
            f0: D.F0, f: D.F0, alder: 0, hjaelp: false
        };
        this.aktive.push(k);
        this.sidstNy = this.tid;
        this.haendelse("nyt", { kort: k });
        return k;
    };

    Spil.prototype.opdater = function (dt) {
        if (this.status !== "koerer") return;
        dt = Math.min(dt, 0.1);
        this.tid += dt;

        if (this.koe.length && this.aktive.length < this.samtidig()) {
            var nyeste = this.aktive[this.aktive.length - 1];
            var klar = nyeste ?
                (nyeste.f - nyeste.f0 >= D.AFSTAND * (this.bund() - nyeste.f0) && this.tid - this.sidstNy >= D.MELLEM) :
                (this.tid - this.sidstTom >= D.NY_EFTER);
            if (klar) this.nyKrystal();
        }

        var bund = this.bund(), tid = this.faldtid();
        for (var j = 0; j < this.aktive.length; j++) {
            var k = this.aktive[j];
            k.alder += dt;
            k.f += dt * (1 - k.f0) / tid;
            if (!k.hjaelp && k.f >= k.f0 + D.HJAELP_VED * (bund - k.f0)) {
                k.hjaelp = true;
                this.haendelse("hjaelp", { kort: k });
            }
            if (k.f >= bund) {
                k.f = bund;
                this.status = "bund";
                this.bundKort = k;
                this.stime = 0;
                this.haendelse("bund", { kort: k });
                return;
            }
        }
    };

    Spil.prototype.fjern = function (k) {
        this.aktive.splice(this.aktive.indexOf(k), 1);
        if (!this.aktive.length) this.sidstTom = this.tid;
    };

    /* Elevens svar, mens krystallerne synker. */
    Spil.prototype.svar = function (tekst) {
        if (this.status !== "koerer") return { ok: false, grund: "status" };
        if (!NK.Ord.norm(tekst)) return { ok: false, grund: "tom" };
        var mulige = this.aktive.map(function (k) { return k.i; });
        var fund = NK.Ord.find(tekst, mulige, this.former);
        if (!fund) {
            this.stime = 0;
            var bund = this.bund();
            this.aktive.forEach(function (k) { k.f = Math.min(bund - 0.004, k.f + D.STRAF); });
            this.haendelse("forkert", { tekst: tekst });
            return { ok: false, grund: "forkert" };
        }
        var k = this.aktive.filter(function (x) { return x.i === fund.i; })[0];
        this.fjern(k);
        this.loest[k.i] = true;
        this.antalLoest++;
        this.stime++;
        this.bedsteStime = Math.max(this.bedsteStime, this.stime);
        var point = (k.hjaelp ? D.POINT_EFTER : D.POINT_FOER) +
            Math.min(this.stime - 1, D.STIME_MAKS) * D.POINT_STIME;
        this.point += point;
        this.haendelse("loest", { kort: k, point: point, naesten: fund.naesten, stime: this.stime });

        if (this.stime % D.OMROER === 0 && this.lag > 0) {
            this.lag--;
            this.haendelse("lag", { lag: this.lag, retning: -1 });
        }
        var niveau = Math.min(D.NIVEAU_MAKS, 1 + Math.floor(this.antalLoest / D.ORD_PR_NIVEAU));
        if (niveau !== this.niveau && this.antalLoest < this.n) {
            var foer = this.samtidig();
            this.niveau = niveau;
            this.haendelse("niveau", { niveau: niveau, flere: this.samtidig() > foer, samtidig: this.samtidig() });
        }
        if (this.antalLoest >= this.n) {
            this.status = "slut";
            this.haendelse("slut", this.statistik());
        }
        return { ok: true, kort: k, point: point, naesten: fund.naesten };
    };

    /* En krystal har naaet bunden. Eleven skriver fagordet af (eller trykker
       Fortsaet i ordbanken), og saa bliver den til et lag bundfald. */
    Spil.prototype.afskriv = function (tekst, udenTekst) {
        if (this.status !== "bund") return false;
        var k = this.bundKort;
        if (!udenTekst && !NK.Ord.find(tekst, [k.i], this.former)) return false;
        this.fjern(k);
        this.bundKort = null;
        this.fejl[k.i]++;
        this.koe.splice(Math.min(D.IGEN_EFTER, this.koe.length), 0, k.i);
        this.lag++;
        this.haendelse("lag", { lag: this.lag, retning: 1, kort: k });
        if (this.lag >= D.LAG_MAKS) {
            this.status = "fyldt";
            this.haendelse("fyldt", this.statistik());
        } else {
            this.status = "koerer";
        }
        return true;
    };

    Spil.prototype.statistik = function () {
        var self = this;
        var drillere = [];
        this.fejl.forEach(function (f, i) { if (f) drillere.push(i); });
        return {
            point: this.point,
            loest: this.antalLoest,
            ialt: this.n,
            foersteGang: this.loest.filter(function (l, i) { return l && !self.fejl[i]; }).length,
            drillere: drillere,
            lag: this.lag,
            bedsteStime: this.bedsteStime,
            stjerner: this.status === "slut" ? (this.lag === 0 ? 3 : (this.lag <= 2 ? 2 : 1)) : 0
        };
    };

    NK.Spil = Spil;
}());

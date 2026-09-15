/* =====================================================================
   koer.js - koreografier: smaa bevaegelser af genstandene paa bordet

   En koreografi er en liste af trin, der koeres efter hinanden:
     { flyt: gg, til: positur | fn, tid, loeft }
                       flyt genstanden til posituren (x, y, v) paa tid
                       sekunder i en blod bue, der loefter 'loeft' enheder
     { tid, hver(t, sek) }
                       vent tid sekunder; hver kaldes undervejs med t fra
                       0 til 1 og sekunder siden trinnets start
     { kald() }        kald en funktion og gaa videre med det samme

   Inde i hver og kald er this ejeren (typisk bordet eller forsoeget).

   En koreografi ved navn "hjem" (en genstand paa vej hjem) blokerer
   ikke: startes en ny, koeres resten af hjemturen foerst, og genstanden
   fortsaetter fra der, hvor den er. Bruges saadan:

     this.koer = new NK.Koer(this);
     this.koer.start([ NK.Koer.hjemTil(gg) ], "hjem");
     this.koer.opdater(dt);   hvert billede
     this.koer.optaget()      er der en koreografi i gang, som scenen
                              skal vente paa?
   ===================================================================== */
(function () {
    "use strict";

    var NK = window.NK;

    function kopi(p) { return { x: p.x, y: p.y, v: p.v }; }

    NK.Koer = function (ejer) {
        this.ejer = ejer;
        this.handling = null;
        /* Kaldes med en grund, naar noget starter eller slutter */
        this.vedAendring = null;
    };

    var P = NK.Koer.prototype;

    P.aendret = function (grund) {
        if (this.vedAendring) this.vedAendring.call(this.ejer, grund);
    };

    P.start = function (liste, navn) {
        var h = this.handling;
        if (h && h.navn === "hjem") {
            var rest = h.liste.slice(h.i).map(function (tr, k) {
                if (k > 0) return tr;
                var ny = {};
                for (var n in tr) if (Object.prototype.hasOwnProperty.call(tr, n) && n !== "fra") ny[n] = tr[n];
                return ny;
            });
            liste = rest.concat(liste);
        }
        this.handling = { liste: liste, i: 0, t: 0, navn: navn || "" };
        this.aendret("handling");
    };

    /* Er der en koreografi i gang, som scenen skal vente paa? */
    P.optaget = function () {
        return !!(this.handling && this.handling.navn !== "hjem");
    };

    P.igang = function () {
        return !!this.handling;
    };

    P.navn = function () {
        return this.handling ? this.handling.navn : "";
    };

    /* Er genstanden med i den koreografi, der koerer nu? */
    P.flytter = function (gg) {
        var h = this.handling;
        return !!(h && h.liste.some(function (tr) { return tr.flyt === gg; }));
    };

    /* Slipper genstanden fri, fx naar musen tager den midt i en hjemtur */
    P.slipFri = function (gg) {
        var h = this.handling;
        if (h && h.navn === "hjem" && this.flytter(gg)) this.handling = null;
    };

    P.afbryd = function () {
        this.handling = null;
        this.aendret("handling");
    };

    P.opdater = function (dt) {
        var ejer = this.ejer;
        var sikkerhed = 0;
        while (this.handling && sikkerhed++ < 30) {
            var h = this.handling;
            var tr = h.liste[h.i];
            if (!tr) {
                this.handling = null;
                this.aendret("handling");
                return;
            }
            if (tr.kald) {
                tr.kald.call(ejer);
                if (this.handling === h) { h.i++; h.t = 0; }
                continue;
            }
            h.t += dt;
            dt = 0;
            var t = tr.tid > 0 ? Math.min(1, h.t / tr.tid) : 1;
            if (tr.flyt) {
                var gg = tr.flyt;
                if (!tr.fra) tr.fra = kopi(gg.p);
                var til = typeof tr.til === "function" ? tr.til.call(ejer) : tr.til;
                var e = NK.blod(t);
                gg.p.x = NK.lerp(tr.fra.x, til.x, e);
                gg.p.y = NK.lerp(tr.fra.y, til.y, e) - Math.sin(Math.PI * e) * (tr.loeft === undefined ? 40 : tr.loeft);
                gg.p.v = NK.lerp(tr.fra.v, til.v, e);
            }
            if (tr.hver) tr.hver.call(ejer, t, h.t);
            if (t < 1) return;
            h.i++;
            h.t = 0;
        }
    };

    /* Trinnet, der sender en genstand hjem */
    NK.Koer.hjemTil = function (gg, tid, loeft) {
        return { flyt: gg, til: function () { return gg.hjem; }, tid: tid || 0.8, loeft: loeft === undefined ? 40 : loeft };
    };
}());
